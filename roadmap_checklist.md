# SmartCampus — Build Checklist

Check off as you go. Each phase = a working, demoable state before moving on. MVP line is end of Phase 6 — treat 7–10 as stretch.

## Phase 1 — Foundation
- [ ] Supabase project connected (existing project — don't let Bolt auto-provision a second one if Antigravity already created it)
- [ ] Run `database_schema.sql`
- [ ] Run `rls_policies.sql`
- [ ] Supabase Auth wired up (login/logout)
- [ ] `users` row created on signup, role assigned
- [ ] Role-based route shell: empty Admin/Faculty/Student dashboards behind route guards
- [ ] Apply `design_system.md` tokens as the base theme (colors, fonts, code-chip component)

## Phase 2 — College Setup
- [ ] Departments CRUD (admin)
- [ ] Courses CRUD (admin)
- [ ] Subjects CRUD (admin)
- [ ] Academic terms CRUD, one-current-term enforced
- [ ] Divisions CRUD

## Phase 3 — People
- [ ] Faculty CRUD + activate/deactivate
- [ ] Student CRUD (identity, contact, college info, status) + search/filter
- [ ] Faculty-subject-division assignment
- [ ] **Resolve open question**: exact list of faculty-permitted academic actions (PRD §9) before writing grades RLS-dependent UI

## Phase 4 — Dynamic Profile Engine
- [ ] Profile Sections admin CRUD (create/edit/reorder/activate)
- [ ] Profile Field Builder (add fields, set type/required/options per section)
- [ ] Generic field-type-to-component renderer (one component, all 13 field types)
- [ ] Runtime Zod schema generation from `profile_fields` for validation
- [ ] Seeded Skills + Achievements sections working end-to-end
- [ ] Student profile page: Personal Info tab (from `students`), Academic tab (from `subject_grades`/`student_term_records`), Attendance tab (from `attendance_records`) — all three read-only and NOT going through the dynamic engine
- [ ] Student self-edit for `student_editable = true` sections only

## Phase 5 — Attendance
- [ ] Timetable builder (admin) — needed first so sessions can reference real subject+division+faculty combos
- [ ] QR session generation (faculty), short TTL, regenerating token
- [ ] Student scan-to-mark flow
- [ ] Faculty manual override/add attendance
- [ ] Attendance history + subject-wise percentage (student view)
- [ ] Low-attendance flag on admin/faculty dashboards

## Phase 6 — Timetable Views *(MVP line — everything above + this is a complete demoable product)*
- [ ] Student read-only weekly timetable
- [ ] Faculty read-only weekly timetable

## Phase 7 — Campus
- [ ] Campus categories CRUD (admin)
- [ ] Campus locations CRUD + static floor-plan image + pin placement
- [ ] Search/filter locations (student/faculty view)

## Phase 8 — Communication
- [ ] Notices CRUD + targeting (notice_targets)
- [ ] Notice feed filtered to the logged-in user
- [ ] Events CRUD + optional simple registration
- [ ] Notifications: triggered on notice/event create (Edge Function), unread count, mark-read

## Phase 9 — Analytics
- [ ] SQL views for: student counts by dept/course/year, attendance by dept/course/division/subject, average CGPA by dept/semester, profile analytics (skills distribution, achievement counts)
- [ ] Admin analytics dashboard wired to the views (Recharts)
- [ ] Faculty analytics scoped to their own classes only

## Phase 10 — Polish
- [ ] Responsive pass (desktop/tablet/mobile) on every screen
- [ ] Loading/empty/error states using the shared component patterns
- [ ] Confirmation dialogs on all destructive actions
- [ ] Accessibility pass (keyboard nav, focus states, contrast)
- [ ] Demo data seed script
- [ ] Audit log entries wired for status changes, attendance overrides, profile-section config changes

---

**Token budget note:** one phase per Bolt session where possible. Give the agent the relevant PRD section + schema tables for that phase as context, not the whole PRD every time.
