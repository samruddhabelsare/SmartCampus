-- SmartCampus Row Level Security policies
-- Run after database_schema.sql
-- Pattern: every table has RLS enabled; policies below are the ONLY way in — no table is left open.

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================

create or replace function current_user_role() returns user_role
language sql stable as $$
  select role from users where id = auth.uid();
$$;

create or replace function current_student_id() returns uuid
language sql stable as $$
  select id from students where user_id = auth.uid();
$$;

create or replace function current_faculty_id() returns uuid
language sql stable as $$
  select id from faculty where user_id = auth.uid();
$$;

create or replace function is_admin() returns boolean
language sql stable as $$
  select current_user_role() = 'admin';
$$;

-- true if the given division is one the current faculty user is assigned to
create or replace function faculty_owns_division(div_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from faculty_subject_assignments fsa
    where fsa.faculty_id = current_faculty_id() and fsa.division_id = div_id
  );
$$;

-- =========================================================
-- USERS
-- =========================================================

alter table users enable row level security;

create policy users_select on users for select
  using (is_admin() or id = auth.uid());

create policy users_admin_write on users for all
  using (is_admin()) with check (is_admin());

-- =========================================================
-- COLLEGE STRUCTURE — read-all-authenticated, write-admin-only
-- =========================================================

alter table departments enable row level security;
alter table courses enable row level security;
alter table subjects enable row level security;
alter table academic_terms enable row level security;
alter table divisions enable row level security;

create policy departments_read on departments for select using (auth.role() = 'authenticated');
create policy departments_write on departments for all using (is_admin()) with check (is_admin());

create policy courses_read on courses for select using (auth.role() = 'authenticated');
create policy courses_write on courses for all using (is_admin()) with check (is_admin());

create policy subjects_read on subjects for select using (auth.role() = 'authenticated');
create policy subjects_write on subjects for all using (is_admin()) with check (is_admin());

create policy terms_read on academic_terms for select using (auth.role() = 'authenticated');
create policy terms_write on academic_terms for all using (is_admin()) with check (is_admin());

create policy divisions_read on divisions for select using (auth.role() = 'authenticated');
create policy divisions_write on divisions for all using (is_admin()) with check (is_admin());

-- =========================================================
-- PEOPLE
-- =========================================================

alter table faculty enable row level security;
alter table students enable row level security;
alter table faculty_subject_assignments enable row level security;

create policy faculty_read on faculty for select using (auth.role() = 'authenticated');
create policy faculty_write on faculty for all using (is_admin()) with check (is_admin());

create policy students_select on students for select
  using (
    is_admin()
    or user_id = auth.uid()
    or (current_user_role() = 'faculty' and faculty_owns_division(current_division_id))
  );
create policy students_write on students for all using (is_admin()) with check (is_admin());
-- Note: student self-service edits (photo, bio, links) live in a separate `student_profile_contact`
-- style approach OR are limited via a dedicated update policy on specific columns using a
-- Postgres trigger, since RLS cannot restrict to a column subset directly. Recommended: add a
-- BEFORE UPDATE trigger that raises an exception if a student tries to change any column outside
-- an allow-list (profile_photo_url, phone, address) when current_user_role() = 'student'.

create policy fsa_read on faculty_subject_assignments for select using (auth.role() = 'authenticated');
create policy fsa_write on faculty_subject_assignments for all using (is_admin()) with check (is_admin());

-- =========================================================
-- TIMETABLE & CAMPUS — read-all, write-admin
-- =========================================================

alter table campus_categories enable row level security;
alter table campus_locations enable row level security;
alter table timetable_entries enable row level security;

create policy campus_categories_read on campus_categories for select using (auth.role() = 'authenticated');
create policy campus_categories_write on campus_categories for all using (is_admin()) with check (is_admin());

create policy campus_locations_read on campus_locations for select using (auth.role() = 'authenticated');
create policy campus_locations_write on campus_locations for all using (is_admin()) with check (is_admin());

create policy timetable_read on timetable_entries for select using (auth.role() = 'authenticated');
create policy timetable_write on timetable_entries for all using (is_admin()) with check (is_admin());

-- =========================================================
-- ATTENDANCE
-- =========================================================

alter table attendance_sessions enable row level security;
alter table attendance_records enable row level security;

create policy attendance_sessions_select on attendance_sessions for select
  using (
    is_admin()
    or faculty_id = current_faculty_id()
    or (current_user_role() = 'student' and division_id = (select current_division_id from students where id = current_student_id()))
  );

create policy attendance_sessions_insert on attendance_sessions for insert
  with check (is_admin() or faculty_id = current_faculty_id());

create policy attendance_sessions_update on attendance_sessions for update
  using (is_admin() or faculty_id = current_faculty_id());

create policy attendance_records_select on attendance_records for select
  using (
    is_admin()
    or student_id = current_student_id()
    or exists (
      select 1 from attendance_sessions s
      where s.id = session_id and s.faculty_id = current_faculty_id()
    )
  );

create policy attendance_records_insert on attendance_records for insert
  with check (
    is_admin()
    or exists (select 1 from attendance_sessions s where s.id = session_id and s.faculty_id = current_faculty_id())
    or (current_user_role() = 'student' and student_id = current_student_id())
  );

create policy attendance_records_update on attendance_records for update
  using (
    is_admin()
    or exists (select 1 from attendance_sessions s where s.id = session_id and s.faculty_id = current_faculty_id())
  );

-- =========================================================
-- ACADEMICS
-- =========================================================

alter table subject_grades enable row level security;
alter table student_term_records enable row level security;

create policy grades_select on subject_grades for select
  using (
    is_admin()
    or student_id = current_student_id()
    or (current_user_role() = 'faculty' and exists (
      select 1 from faculty_subject_assignments fsa
      join students st on st.current_division_id = fsa.division_id
      where fsa.faculty_id = current_faculty_id() and st.id = subject_grades.student_id and fsa.subject_id = subject_grades.subject_id
    ))
  );
create policy grades_write on subject_grades for all using (is_admin()) with check (is_admin());

create policy term_records_select on student_term_records for select
  using (is_admin() or student_id = current_student_id());
create policy term_records_write on student_term_records for all using (is_admin()) with check (is_admin());

-- =========================================================
-- DYNAMIC PROFILE ENGINE
-- =========================================================

alter table profile_sections enable row level security;
alter table profile_fields enable row level security;
alter table profile_entries enable row level security;

create policy profile_sections_read on profile_sections for select
  using (is_active and current_user_role()::text = any (visibility_roles));
create policy profile_sections_write on profile_sections for all using (is_admin()) with check (is_admin());

create policy profile_fields_read on profile_fields for select using (auth.role() = 'authenticated');
create policy profile_fields_write on profile_fields for all using (is_admin()) with check (is_admin());

create policy profile_entries_select on profile_entries for select
  using (
    is_admin()
    or student_id = current_student_id()
    or (current_user_role() = 'faculty' and exists (
      select 1 from students st where st.id = profile_entries.student_id and faculty_owns_division(st.current_division_id)
    ))
  );

create policy profile_entries_write on profile_entries for all
  using (
    is_admin()
    or (
      current_user_role() = 'student'
      and student_id = current_student_id()
      and exists (select 1 from profile_sections ps where ps.id = section_id and ps.student_editable)
    )
  )
  with check (
    is_admin()
    or (
      current_user_role() = 'student'
      and student_id = current_student_id()
      and exists (select 1 from profile_sections ps where ps.id = section_id and ps.student_editable)
    )
  );

-- =========================================================
-- COMMUNICATION
-- =========================================================

alter table notices enable row level security;
alter table notice_targets enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table notifications enable row level security;

create policy notices_write on notices for all using (is_admin()) with check (is_admin());
-- Read: everyone can see notices targeted to 'all', or matching their role/department/course/division.
-- Implement the actual filter in the application query (join against notice_targets), keeping this
-- policy permissive-but-authenticated; tightening further requires knowing the student's
-- department/course/division at policy-eval time, which is cheap via current_student_id() joins —
-- add if a stricter boundary is required beyond "authenticated users only see what the UI queries for."
create policy notices_read on notices for select using (auth.role() = 'authenticated');

create policy notice_targets_read on notice_targets for select using (auth.role() = 'authenticated');
create policy notice_targets_write on notice_targets for all using (is_admin()) with check (is_admin());

create policy events_read on events for select using (auth.role() = 'authenticated');
create policy events_write on events for all using (is_admin()) with check (is_admin());

create policy event_registrations_select on event_registrations for select
  using (is_admin() or user_id = auth.uid());
create policy event_registrations_insert on event_registrations for insert
  with check (user_id = auth.uid());
create policy event_registrations_delete on event_registrations for delete
  using (user_id = auth.uid());

create policy notifications_select on notifications for select using (user_id = auth.uid());
create policy notifications_update on notifications for update using (user_id = auth.uid());
create policy notifications_insert on notifications for insert with check (true); -- created by backend/edge functions

-- =========================================================
-- AUDIT
-- =========================================================

alter table audit_logs enable row level security;

create policy audit_read on audit_logs for select using (is_admin());
create policy audit_insert on audit_logs for insert with check (true); -- written by triggers/edge functions
