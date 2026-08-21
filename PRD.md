# SmartCampus — Product Requirements Document

Version 1.0 · For use as project context in Antigravity / Bolt

---

## 1. Overview

SmartCampus is an admin-driven college management web application covering student/faculty management, a configurable digital student profile system, smart attendance (QR-based), timetable management, campus navigation, notices/events, and analytics.

**Core principle:** the admin is the single source of truth. Students are primarily consumers of information; they edit only a small, explicitly-permitted set of personal fields. Faculty operate only within classes/subjects assigned to them.

**Primary users:** college administrators, faculty, students, at a single institution (architecture should not assume multi-tenant, but should not actively block it either).

---

## 2. Goals

- G1: Replace scattered spreadsheets/notice boards/WhatsApp groups with one system of record for college operations.
- G2: Let the admin extend student profiles (add "Internships," "Publications," etc.) without a developer touching code.
- G3: Give every role a fast, accurate view of only what's relevant to them (their classes, their attendance, their notices).
- G4: Enforce permissions at the database level, not just the UI — a student must be structurally unable to read another student's data, not merely prevented by a hidden button.

## 3. Non-goals (explicitly out of scope for v1)

- Face recognition or biometric attendance
- GPS/indoor positioning for campus navigation (static map + pins only)
- Online fee payment, payroll, hostel management
- Full examination management (marks entry beyond simple per-subject grade/marks fields)
- Chat/messaging between users
- AI chatbot features
- Complex event registration (payment, waitlisting, capacity management)
- Native mobile app

---

## 4. Roles

| Role | Summary |
|---|---|
| Admin | Full control of college structure, people, academics, profiles, campus, communication, analytics, settings |
| Faculty | Operates within assigned subjects/divisions: takes attendance, views assigned students/timetable |
| Student | Mostly read-only: views own profile, attendance, timetable, notices, events; edits a small set of personal fields |

Full permission matrix: see `PRD.md §12` and the architecture doc's Section E.

---

## 5. Functional Requirements

Format: **FR-[module].[n]** — requirement, with acceptance criteria (AC).

### 5.1 Authentication & Roles

- **FR-AUTH.1** — Users authenticate via email/password (Supabase Auth). No self-registration; accounts are created by admin invite only.
  - AC: An unauthenticated user hitting any route except `/login` is redirected to `/login`.
  - AC: A newly invited user can set their password via an emailed link and land on their role's dashboard.
- **FR-AUTH.2** — Each user has exactly one role: admin, faculty, or student, set at creation and changeable only by an admin.
  - AC: Role changes take effect on next session refresh without requiring a full re-signup.
- **FR-AUTH.3** — Every table enforces row-level access via Postgres RLS matching the permission matrix (§12). UI-level route guards exist for UX but are not the security boundary.
  - AC: A student's authenticated API request for another student's `attendance_records` row returns zero rows, not an error revealing the row exists.

### 5.2 College Structure (Admin-managed)

- **FR-STRUCT.1** — Admin can create/edit/deactivate departments (name, code, description, HOD).
- **FR-STRUCT.2** — Admin can create/edit courses under a department (name, code, duration, degree type).
- **FR-STRUCT.3** — Admin can create/edit subjects under a course (name, code, credits, semester number, type).
- **FR-STRUCT.4** — Admin can create academic terms (name, start date, end date, current-term flag). Exactly one term may be marked current at a time.
  - AC: Attempting to mark a second term as current automatically un-marks the previous one (or is blocked with a clear message — pick one behavior and be consistent).
- **FR-STRUCT.5** — Admin can create divisions (course + semester number + term + division name + optional class teacher + capacity).

### 5.3 People Management

- **FR-PEOPLE.1** — Admin can add/edit/deactivate/restore a student with identity, contact, college-info, and status fields (full field list: architecture doc §B).
  - AC: Deactivating a student sets status to `inactive`; it does not delete the row or their historical attendance/academic records.
- **FR-PEOPLE.2** — Admin can search/filter students by name, roll number, department, course, division, status.
- **FR-PEOPLE.3** — Admin can add/edit/deactivate faculty (identity, department, designation, contact, joining date).
- **FR-PEOPLE.4** — Admin can assign a faculty member to a subject + division for a given academic term.
  - AC: The same subject+division+term cannot be double-assigned to two different faculty.

### 5.4 Dynamic Student Profile System

- **FR-PROFILE.1** — Admin can create a profile section (name, description, icon, display order, visibility per role). Custom sections are deletable; the two seeded default sections (Skills, Achievements) are not.
- **FR-PROFILE.2** — Admin can define fields on a section: label, field type (text, long text, number, email, url, date, dropdown, multiselect, checkbox, file, image, rating, boolean), required flag, display order, and type-specific options (dropdown/multiselect choices, validation rules).
- **FR-PROFILE.3** — The frontend renders a form for any section purely from its field definitions — no per-section custom component code.
  - AC: Creating a brand-new section with 5 fields in the admin UI makes a working create/edit/view form for that section appear on student profiles with zero code changes.
- **FR-PROFILE.4** — A student can create/edit/delete their own entries only in sections where the admin has flagged student-editable = true; otherwise the section is read-only to them.
- **FR-PROFILE.5** — Personal Information, Academic Information, and Attendance are NOT part of this dynamic engine — they render directly from `students`, `subject_grades`/`student_term_records`, and `attendance_records` respectively, as fixed (non-configurable) profile tabs.
- **FR-PROFILE.6** — File/Image field types upload to Supabase Storage under a per-student, per-section path; validated for type and size before upload completes.

### 5.5 Smart Attendance

- **FR-ATT.1** — Faculty selects one of their assigned subject+division combinations and generates a QR code for a session; the QR encodes a short-lived token (target TTL: 30–60 seconds, regenerating).
- **FR-ATT.2** — Student scans the QR from within the app; the system validates the token, confirms the student belongs to that division, and records attendance.
  - AC: An expired or already-used token is rejected with a clear in-app message, no attendance recorded.
  - AC: A student cannot be marked present twice for the same session (unique constraint on session+student).
- **FR-ATT.3** — Faculty can view and manually override/add attendance for their own sessions (e.g. correcting a missed scan).
- **FR-ATT.4** — Students see overall and subject-wise attendance percentage and history.
- **FR-ATT.5** — Admin/faculty dashboards surface students below a configurable low-attendance threshold (default 75%).

### 5.6 Timetable

- **FR-TT.1** — Admin builds timetable entries: division + subject + faculty + day + start/end time + classroom, scoped to a division (which is already term-scoped).
  - AC: Two entries for the same division cannot overlap in time on the same day.
  - AC: The same faculty cannot be double-booked at overlapping times across divisions.
- **FR-TT.2** — Students and faculty see a read-only view of their own relevant timetable (weekly grid).

### 5.7 Campus Navigation

- **FR-CAMPUS.1** — Admin manages campus location categories (name, description, icon) and locations (name, category, building, floor, room number, description, image, map x/y position, optional contact info).
- **FR-CAMPUS.2** — Students/faculty can search and filter locations by name/category and view details including position on a static floor-plan image.

### 5.8 Notices & Events

- **FR-NOTICE.1** — Admin creates notices (title, description, category, priority, optional attachment, expiry date) and targets them to: everyone, a role, a department, a course, a year, or a division.
- **FR-NOTICE.2** — Students/faculty see only notices targeted to them (or "everyone"), automatically, ordered by priority then recency, hiding expired ones.
- **FR-EVENT.1** — Admin creates events (name, description, date/time, location, organizer, category, image, optional simple registration toggle).
- **FR-EVENT.2** — If registration is enabled, a user can register/unregister for an event; no payment or capacity logic in v1.

### 5.9 Notifications

- **FR-NOTIF.1** — A notification is created for relevant users when: a new notice targets them, an event they're near is upcoming (best-effort, not scheduled precision), a student crosses the low-attendance threshold, their timetable changes.
- **FR-NOTIF.2** — Users see an unread count and a list they can mark read.

### 5.10 Analytics (Admin, and Faculty scoped to their classes)

- **FR-ANALYTICS.1** — Admin dashboard shows: total students/faculty/departments/courses/subjects, today's classes, today's/average attendance, low-attendance count, upcoming events, recent notices, recent student additions.
- **FR-ANALYTICS.2** — Student analytics by department/course/year/status; attendance analytics by department/course/division/subject; academic analytics (average CGPA, department/semester performance); profile analytics (counts of certifications/projects/achievements, skills distribution).
- **FR-ANALYTICS.3** — Aggregates are computed via SQL views, not duplicated application-side calculation logic.

---

## 6. Non-Functional Requirements

- **NFR-1 Security** — All authorization enforced via Supabase RLS; no table permits unrestricted `SELECT`/`UPDATE`/`DELETE` to authenticated users. File uploads validated for type/size server-side, not just client-side.
- **NFR-2 Responsiveness** — Usable on desktop, tablet, and mobile viewports; admin data-table screens may prioritize desktop but must not break on tablet.
- **NFR-3 Accessibility** — Keyboard-navigable, visible focus states, sufficient color contrast, form errors announced to screen readers.
- **NFR-4 Performance** — Dashboard and list views should paginate rather than load full tables; attendance QR validation should resolve in under 1 second under normal load.
- **NFR-5 Consistency** — One shared component library (tables, forms, modals, cards, empty/loading/error states) — no per-page bespoke implementations of the same pattern.
- **NFR-6 Auditability** — Sensitive writes (student status changes, attendance overrides, profile-section config changes) are recorded in `audit_logs`.

---

## 7. Constraints

- Built primarily in Bolt (free tier: ~1M tokens/month, daily cap) with Antigravity used for schema/backend work via its Supabase MCP connection.
- Single backend service: Supabase (Postgres + Auth + Storage + Edge Functions). No additional paid third-party services (no dedicated search service, no maps API, no separate email provider) — see `DESIGN_SYSTEM.md` and architecture doc for why.
- Development proceeds in the phase order defined in `ROADMAP.md`; each phase should leave the app in a working, demoable state before the next begins.

## 8. Assumptions

- Single institution (no multi-tenant requirement for v1, but avoid designs that would make multi-tenant impossible later — e.g. don't hardcode a single college name into schema).
- Academic year structure is two terms (odd/even) per year; adjust `academic_terms` seed data if the real institution differs.
- English-only UI for v1.

## 9. Open Questions (resolve before or during Phase 3)

- Exact list of "explicitly permitted academic actions" faculty can perform beyond attendance — needs a fixed answer before `students`/`subject_grades` RLS policies are finalized (flagged in architecture doc §H.10).
- Whether "current semester" auto-advances at term rollover or is manually set per student by admin.
- Low-attendance threshold: fixed at 75% or admin-configurable per college policy?

---

## 10. Success Criteria (for the college-project demo)

- A demo walkthrough can: log in as admin, create a department/course/subject/division/faculty/student, create a custom profile section with 3 field types and see it render on the student's profile, generate an attendance QR and scan it as the student, and see the resulting attendance percentage update on both the student and admin dashboards — without touching code between any of these steps.

---

## 11. Related files

- `database_schema.sql` — full table definitions
- `rls_policies.sql` — row-level security policies
- `design_system.md` — visual design tokens and component patterns
- `roadmap_checklist.md` — phase-by-phase build checklist

## 12. Permission Matrix

See architecture doc Section E for the full matrix (Admin/Faculty/Student × every resource). Reproduced in `rls_policies.sql` as enforced policy, which is the authoritative version — this PRD's matrix is descriptive, the SQL is normative.
