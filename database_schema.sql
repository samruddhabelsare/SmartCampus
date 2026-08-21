-- SmartCampus database schema
-- Target: Postgres via Supabase
-- Run in order top to bottom. Assumes pgcrypto/uuid extension available (default on Supabase).

-- =========================================================
-- ENUM TYPES
-- =========================================================

create type user_role as enum ('admin', 'faculty', 'student');
create type student_status as enum ('active', 'graduated', 'on_leave', 'suspended', 'inactive');
create type attendance_status as enum ('present', 'absent', 'late');
create type session_status as enum ('open', 'closed');
create type field_type as enum ('text','long_text','number','email','url','date','dropdown','multiselect','checkbox','file','image','rating','boolean');
create type notice_priority as enum ('low','normal','high','urgent');
create type target_type as enum ('all','department','course','year','division');

-- =========================================================
-- IDENTITY
-- =========================================================

-- users mirrors auth.users; id must match auth.users.id
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- COLLEGE STRUCTURE
-- =========================================================

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  description text,
  hod_faculty_id uuid, -- FK added after faculty table exists
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete restrict,
  name text not null,
  code text not null unique,
  duration_years int not null,
  degree_type text,
  description text
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete restrict,
  department_id uuid not null references departments(id) on delete restrict,
  name text not null,
  code text not null unique,
  credits int not null,
  semester_number int not null check (semester_number between 1 and 8),
  type text
);

create table academic_terms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  check (end_date > start_date)
);

-- only one current term at a time
create unique index one_current_term on academic_terms (is_current) where is_current;

create table divisions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete restrict,
  semester_number int not null check (semester_number between 1 and 8),
  academic_term_id uuid not null references academic_terms(id) on delete restrict,
  division_name text not null,
  class_teacher_id uuid, -- FK added after faculty table exists
  capacity int,
  unique (course_id, semester_number, academic_term_id, division_name)
);

-- =========================================================
-- PEOPLE
-- =========================================================

create table faculty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  faculty_code text not null unique,
  full_name text not null,
  photo_url text,
  department_id uuid not null references departments(id) on delete restrict,
  designation text,
  email text not null,
  phone text,
  joining_date date,
  is_active boolean not null default true
);

alter table departments add constraint fk_dept_hod foreign key (hod_faculty_id) references faculty(id) on delete set null;
alter table divisions add constraint fk_division_class_teacher foreign key (class_teacher_id) references faculty(id) on delete set null;

create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  student_code text not null unique,
  roll_number text not null,
  full_name text not null,
  profile_photo_url text,
  gender text,
  date_of_birth date,
  email text not null unique,
  phone text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  department_id uuid not null references departments(id) on delete restrict,
  course_id uuid not null references courses(id) on delete restrict,
  specialization text,
  batch text,
  admission_year int,
  expected_graduation_year int,
  current_year int,
  current_semester_number int check (current_semester_number between 1 and 8),
  current_division_id uuid references divisions(id) on delete set null,
  status student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table faculty_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references faculty(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  division_id uuid not null references divisions(id) on delete cascade,
  academic_term_id uuid not null references academic_terms(id) on delete cascade,
  unique (subject_id, division_id, academic_term_id)
);

-- =========================================================
-- TIMETABLE
-- =========================================================

create table campus_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  is_default boolean not null default false
);

create table campus_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references campus_categories(id) on delete restrict,
  building text,
  floor text,
  room_number text,
  description text,
  image_url text,
  map_x numeric,
  map_y numeric,
  contact_info text
);

create table timetable_entries (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references divisions(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  faculty_id uuid not null references faculty(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  classroom_id uuid references campus_locations(id) on delete set null,
  check (end_time > start_time)
);

create index idx_timetable_division_day on timetable_entries (division_id, day_of_week);
create index idx_timetable_faculty_day on timetable_entries (faculty_id, day_of_week);

-- =========================================================
-- ATTENDANCE
-- =========================================================

create table attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references divisions(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  faculty_id uuid not null references faculty(id) on delete cascade,
  session_date date not null,
  start_time time,
  end_time time,
  qr_token text not null unique,
  qr_expires_at timestamptz not null,
  status session_status not null default 'open'
);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status attendance_status not null default 'present',
  marked_at timestamptz not null default now(),
  method text default 'qr',
  unique (session_id, student_id)
);

create index idx_attendance_student on attendance_records (student_id);

-- =========================================================
-- ACADEMICS (grades)
-- =========================================================

create table subject_grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  academic_term_id uuid not null references academic_terms(id) on delete cascade,
  marks numeric,
  grade text,
  exam_type text not null default 'final',
  unique (student_id, subject_id, academic_term_id, exam_type)
);

create table student_term_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  academic_term_id uuid not null references academic_terms(id) on delete cascade,
  sgpa numeric,
  cgpa_snapshot numeric,
  status text,
  remarks text,
  unique (student_id, academic_term_id)
);

-- =========================================================
-- DYNAMIC PROFILE ENGINE
-- =========================================================

create table profile_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  is_default boolean not null default false,
  is_deletable boolean not null default true,
  is_active boolean not null default true,
  display_order int not null default 0,
  student_editable boolean not null default false,
  visibility_roles text[] not null default array['admin','faculty','student']
);

create table profile_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references profile_sections(id) on delete cascade,
  label text not null,
  field_type field_type not null,
  is_required boolean not null default false,
  display_order int not null default 0,
  options jsonb,
  validation_rules jsonb
);

create table profile_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  section_id uuid not null references profile_sections(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profile_entries_student_section on profile_entries (student_id, section_id);

-- =========================================================
-- COMMUNICATION
-- =========================================================

create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  priority notice_priority not null default 'normal',
  attachment_url text,
  published_at timestamptz not null default now(),
  expiry_date date,
  created_by uuid not null references users(id) on delete set null
);

create table notice_targets (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references notices(id) on delete cascade,
  target_type target_type not null,
  target_id uuid -- null when target_type = 'all'; otherwise references department/course/division id depending on target_type
);

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location_id uuid references campus_locations(id) on delete set null,
  organizer text,
  category text,
  image_url text,
  registration_enabled boolean not null default false,
  registration_link text,
  created_by uuid not null references users(id) on delete set null
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text,
  type text,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications (user_id) where not is_read;

-- =========================================================
-- AUDIT
-- =========================================================

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- SEED: default profile sections (Skills, Achievements)
-- =========================================================

insert into profile_sections (name, description, icon, is_default, is_deletable, display_order, student_editable, visibility_roles)
values
  ('Skills', 'Technical and soft skills.', 'ti-bulb', true, false, 1, true, array['admin','faculty','student']),
  ('Achievements', 'Awards, competitions, and recognitions.', 'ti-award', true, false, 2, false, array['admin','faculty','student']);

-- Skills fields
insert into profile_fields (section_id, label, field_type, is_required, display_order, options)
select id, 'Skill name', 'text', true, 1, null from profile_sections where name = 'Skills';
insert into profile_fields (section_id, label, field_type, is_required, display_order, options)
select id, 'Category', 'dropdown', false, 2, '{"choices":["Technical","Communication","Leadership","Design","Other"]}'::jsonb from profile_sections where name = 'Skills';
insert into profile_fields (section_id, label, field_type, is_required, display_order, options)
select id, 'Proficiency', 'rating', false, 3, '{"max":5}'::jsonb from profile_sections where name = 'Skills';

-- Achievements fields
insert into profile_fields (section_id, label, field_type, is_required, display_order)
select id, 'Title', 'text', true, 1 from profile_sections where name = 'Achievements';
insert into profile_fields (section_id, label, field_type, is_required, display_order)
select id, 'Description', 'long_text', false, 2 from profile_sections where name = 'Achievements';
insert into profile_fields (section_id, label, field_type, is_required, display_order)
select id, 'Date', 'date', false, 3 from profile_sections where name = 'Achievements';
insert into profile_fields (section_id, label, field_type, is_required, display_order)
select id, 'Organization', 'text', false, 4 from profile_sections where name = 'Achievements';
insert into profile_fields (section_id, label, field_type, is_required, display_order, options)
select id, 'Level', 'dropdown', false, 5, '{"choices":["College","District","State","National","International"]}'::jsonb from profile_sections where name = 'Achievements';
insert into profile_fields (section_id, label, field_type, is_required, display_order)
select id, 'Certificate', 'file', false, 6 from profile_sections where name = 'Achievements';

-- =========================================================
-- SEED: default campus categories
-- =========================================================

insert into campus_categories (name, is_default) values
  ('Academic', true),
  ('Administration', true),
  ('Food', true),
  ('Recreation', true),
  ('Medical', true),
  ('Facilities', true);
