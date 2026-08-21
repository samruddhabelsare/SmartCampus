/**
 * SmartCampus Store & Data Engine v2
 * Full CRUD, notifications, attendance history, grades, faculty assignments, audit log.
 */

window.SmartCampusStore = (function () {
  const STORAGE_KEY = 'smartcampus_db_v1';

  // Seed Data strictly aligned with database_schema.sql
  const defaultSeed = {
    currentRole: 'admin', // admin | faculty | student
    currentUserId: 'usr-admin-1',

    users: [
      { id: 'usr-admin-1', role: 'admin', email: 'admin@smartcampus.edu', is_active: true },
      { id: 'usr-fac-1', role: 'faculty', email: 'turing@smartcampus.edu', is_active: true },
      { id: 'usr-fac-2', role: 'faculty', email: 'hopper@smartcampus.edu', is_active: true },
      { id: 'usr-stu-1', role: 'student', email: 'alice@student.smartcampus.edu', is_active: true },
      { id: 'usr-stu-2', role: 'student', email: 'bob@student.smartcampus.edu', is_active: true },
      { id: 'usr-stu-3', role: 'student', email: 'charlie@student.smartcampus.edu', is_active: true }
    ],

    departments: [
      { id: 'dept-1', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of CS and AI studies', hod_faculty_id: 'fac-1' },
      { id: 'dept-2', name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical & Electronics', hod_faculty_id: 'fac-2' },
      { id: 'dept-3', name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Systems', hod_faculty_id: null }
    ],

    courses: [
      { id: 'course-1', department_id: 'dept-1', name: 'B.Tech Computer Science', code: 'CS-BTECH', duration_years: 4, degree_type: 'Undergraduate', description: '4-Year CS degree' },
      { id: 'course-2', department_id: 'dept-2', name: 'B.Tech Electrical Engineering', code: 'EE-BTECH', duration_years: 4, degree_type: 'Undergraduate', description: '4-Year EE degree' }
    ],

    academic_terms: [
      { id: 'term-1', name: 'Fall 2026 (Odd Sem)', start_date: '2026-08-01', end_date: '2026-12-20', is_current: true },
      { id: 'term-2', name: 'Spring 2026 (Even Sem)', start_date: '2026-01-10', end_date: '2026-05-30', is_current: false }
    ],

    subjects: [
      { id: 'sub-1', course_id: 'course-1', department_id: 'dept-1', name: 'Data Structures & Algorithms', code: 'CS-201', credits: 4, semester_number: 3, type: 'Core' },
      { id: 'sub-2', course_id: 'course-1', department_id: 'dept-1', name: 'Database Management Systems', code: 'CS-204', credits: 4, semester_number: 3, type: 'Core' },
      { id: 'sub-3', course_id: 'course-1', department_id: 'dept-1', name: 'Operating Systems', code: 'CS-301', credits: 3, semester_number: 5, type: 'Core' },
      { id: 'sub-4', course_id: 'course-2', department_id: 'dept-2', name: 'Circuit Theory', code: 'EE-201', credits: 4, semester_number: 3, type: 'Core' }
    ],

    divisions: [
      { id: 'div-1', course_id: 'course-1', semester_number: 3, academic_term_id: 'term-1', division_name: 'CS-3A', class_teacher_id: 'fac-1', capacity: 60 },
      { id: 'div-2', course_id: 'course-1', semester_number: 5, academic_term_id: 'term-1', division_name: 'CS-5A', class_teacher_id: 'fac-2', capacity: 60 }
    ],

    faculty: [
      { id: 'fac-1', user_id: 'usr-fac-1', faculty_code: 'FAC-101', full_name: 'Dr. Alan Turing', department_id: 'dept-1', designation: 'Professor & HOD', email: 'turing@smartcampus.edu', phone: '+1 555-0192', joining_date: '2018-06-01', is_active: true },
      { id: 'fac-2', user_id: 'usr-fac-2', faculty_code: 'FAC-102', full_name: 'Dr. Grace Hopper', department_id: 'dept-2', designation: 'Associate Professor', email: 'hopper@smartcampus.edu', phone: '+1 555-0193', joining_date: '2019-08-15', is_active: true }
    ],

    students: [
      {
        id: 'stu-1',
        user_id: 'usr-stu-1',
        student_code: 'STU-2026-001',
        roll_number: '26CS001',
        full_name: 'Alice Johnson',
        gender: 'Female',
        date_of_birth: '2004-04-12',
        email: 'alice@student.smartcampus.edu',
        phone: '+1 555-0101',
        address: '124 Innovation Way, Tech City',
        emergency_contact_name: 'Mary Johnson',
        emergency_contact_phone: '+1 555-0100',
        department_id: 'dept-1',
        course_id: 'course-1',
        specialization: 'Artificial Intelligence',
        batch: '2024-2028',
        admission_year: 2024,
        expected_graduation_year: 2028,
        current_year: 2,
        current_semester_number: 3,
        current_division_id: 'div-1',
        status: 'active',
        cgpa: 3.85,
        attendance_percentage: 92
      },
      {
        id: 'stu-2',
        user_id: 'usr-stu-2',
        student_code: 'STU-2026-002',
        roll_number: '26CS002',
        full_name: 'Bob Smith',
        gender: 'Male',
        date_of_birth: '2004-09-22',
        email: 'bob@student.smartcampus.edu',
        phone: '+1 555-0102',
        address: '88 Campus Road',
        emergency_contact_name: 'John Smith',
        emergency_contact_phone: '+1 555-0103',
        department_id: 'dept-1',
        course_id: 'course-1',
        specialization: 'Software Engineering',
        batch: '2024-2028',
        admission_year: 2024,
        expected_graduation_year: 2028,
        current_year: 2,
        current_semester_number: 3,
        current_division_id: 'div-1',
        status: 'active',
        cgpa: 3.40,
        attendance_percentage: 71 // Low attendance warning flag (<75%)
      },
      {
        id: 'stu-3',
        user_id: 'usr-stu-3',
        student_code: 'STU-2026-003',
        roll_number: '26CS003',
        full_name: 'Charlie Brown',
        gender: 'Male',
        date_of_birth: '2004-01-15',
        email: 'charlie@student.smartcampus.edu',
        phone: '+1 555-0104',
        address: '42 Academic Ave',
        emergency_contact_name: 'David Brown',
        emergency_contact_phone: '+1 555-0105',
        department_id: 'dept-1',
        course_id: 'course-1',
        specialization: 'Cybersecurity',
        batch: '2024-2028',
        admission_year: 2024,
        expected_graduation_year: 2028,
        current_year: 2,
        current_semester_number: 3,
        current_division_id: 'div-1',
        status: 'active',
        cgpa: 3.90,
        attendance_percentage: 88
      }
    ],

    faculty_subject_assignments: [
      { id: 'fsa-1', faculty_id: 'fac-1', subject_id: 'sub-1', division_id: 'div-1', academic_term_id: 'term-1' },
      { id: 'fsa-2', faculty_id: 'fac-1', subject_id: 'sub-2', division_id: 'div-1', academic_term_id: 'term-1' },
      { id: 'fsa-3', faculty_id: 'fac-2', subject_id: 'sub-3', division_id: 'div-2', academic_term_id: 'term-1' }
    ],

    timetable_entries: [
      { id: 'tt-1', division_id: 'div-1', subject_id: 'sub-1', faculty_id: 'fac-1', day_of_week: 1, start_time: '09:00', end_time: '10:00', classroom: 'Lecture Hall 101' },
      { id: 'tt-2', division_id: 'div-1', subject_id: 'sub-2', faculty_id: 'fac-1', day_of_week: 1, start_time: '10:15', end_time: '11:15', classroom: 'CS Lab 2' },
      { id: 'tt-3', division_id: 'div-1', subject_id: 'sub-1', faculty_id: 'fac-1', day_of_week: 3, start_time: '11:30', end_time: '12:30', classroom: 'Lecture Hall 101' },
      { id: 'tt-4', division_id: 'div-2', subject_id: 'sub-3', faculty_id: 'fac-2', day_of_week: 2, start_time: '09:00', end_time: '10:00', classroom: 'Lecture Hall 202' }
    ],

    profile_sections: [
      { id: 'sec-1', name: 'Skills', description: 'Technical and soft skills', icon: '⚡', is_default: true, is_deletable: false, is_active: true, display_order: 1, student_editable: true },
      { id: 'sec-2', name: 'Achievements', description: 'Awards, hackathons & recognitions', icon: '🏆', is_default: true, is_deletable: false, is_active: true, display_order: 2, student_editable: false },
      { id: 'sec-3', name: 'Certifications', description: 'Professional certificates and courses', icon: '📜', is_default: false, is_deletable: true, is_active: true, display_order: 3, student_editable: true }
    ],

    profile_fields: [
      { id: 'fld-1', section_id: 'sec-1', label: 'Skill Name', field_type: 'text', is_required: true, display_order: 1 },
      { id: 'fld-2', section_id: 'sec-1', label: 'Category', field_type: 'dropdown', is_required: false, display_order: 2, options: { choices: ['Technical', 'Communication', 'Leadership', 'Design'] } },
      { id: 'fld-3', section_id: 'sec-1', label: 'Proficiency (1-5)', field_type: 'rating', is_required: false, display_order: 3, options: { max: 5 } },

      { id: 'fld-4', section_id: 'sec-2', label: 'Achievement Title', field_type: 'text', is_required: true, display_order: 1 },
      { id: 'fld-5', section_id: 'sec-2', label: 'Description', field_type: 'long_text', is_required: false, display_order: 2 },
      { id: 'fld-6', section_id: 'sec-2', label: 'Date Received', field_type: 'date', is_required: false, display_order: 3 },

      { id: 'fld-7', section_id: 'sec-3', label: 'Certificate Name', field_type: 'text', is_required: true, display_order: 1 },
      { id: 'fld-8', section_id: 'sec-3', label: 'Issuing Organization', field_type: 'text', is_required: true, display_order: 2 },
      { id: 'fld-9', section_id: 'sec-3', label: 'Certificate URL', field_type: 'url', is_required: false, display_order: 3 }
    ],

    profile_entries: [
      { id: 'ent-1', student_id: 'stu-1', section_id: 'sec-1', data: { 'Skill Name': 'Python Programming', 'Category': 'Technical', 'Proficiency (1-5)': 5 } },
      { id: 'ent-2', student_id: 'stu-1', section_id: 'sec-1', data: { 'Skill Name': 'Data Modeling', 'Category': 'Technical', 'Proficiency (1-5)': 4 } },
      { id: 'ent-3', student_id: 'stu-1', section_id: 'sec-2', data: { 'Achievement Title': '1st Place Hackathon', 'Description': 'Built AI Attendance scanner app', 'Date Received': '2026-03-15' } },
      { id: 'ent-4', student_id: 'stu-2', section_id: 'sec-1', data: { 'Skill Name': 'JavaScript', 'Category': 'Technical', 'Proficiency (1-5)': 3 } }
    ],

    attendance_sessions: [
      { id: 'sess-1', division_id: 'div-1', subject_id: 'sub-2', faculty_id: 'fac-1', session_date: '2026-08-21', start_time: '10:15', qr_token: 'QR-CS204-88492', qr_expires_at: Date.now() + 45000, status: 'open' }
    ],

    attendance_records: [
      { id: 'att-1', session_id: 'sess-1', student_id: 'stu-1', status: 'present', marked_at: '2026-08-21T10:16:00Z', method: 'qr' },
      { id: 'att-2', session_id: 'sess-1', student_id: 'stu-3', status: 'present', marked_at: '2026-08-21T10:17:12Z', method: 'qr' }
    ],

    campus_categories: [
      { id: 'cat-1', name: 'Academic', is_default: true },
      { id: 'cat-2', name: 'Administration', is_default: true },
      { id: 'cat-3', name: 'Facilities', is_default: true }
    ],

    campus_locations: [
      { id: 'loc-1', name: 'Lecture Hall 101', category_id: 'cat-1', building: 'Main Academic Block', floor: '1st Floor', room_number: 'LH-101', description: 'Capacity 120, Projector equipped', map_x: 35, map_y: 40 },
      { id: 'loc-2', name: 'CS Computing Lab 2', category_id: 'cat-1', building: 'Turing Hall', floor: '2nd Floor', room_number: 'LAB-204', description: '60 High performance workstations', map_x: 65, map_y: 25 },
      { id: 'loc-3', name: 'Central Campus Library', category_id: 'cat-3', building: 'Library Pavilion', floor: 'Ground Floor', room_number: 'LIB-01', description: 'Study areas and digital archives', map_x: 50, map_y: 75 }
    ],

    notices: [
      { id: 'not-1', title: 'Mid-Semester Examination Schedule', description: 'Mid-term exams for Fall 2026 will commence from Oct 10th.', priority: 'high', published_at: '2026-08-20', expiry_date: '2026-10-20', category: 'Academic' },
      { id: 'not-2', title: 'Annual SmartCampus Hackathon', description: 'Registration opens for 24-hour innovation challenge.', priority: 'normal', published_at: '2026-08-18', expiry_date: '2026-09-15', category: 'Event' }
    ],

    events: [
      { id: 'evt-1', name: 'SmartCampus Innovation Day', description: 'Showcase of student AI projects and research.', event_date: '2026-09-05', start_time: '10:00', end_time: '16:00', location_name: 'Main Auditorium', organizer: 'Dept of CS', registration_enabled: true }
    ],

    event_registrations: [
      { id: 'reg-1', event_id: 'evt-1', user_id: 'usr-stu-1', registered_at: '2026-08-20T14:30:00Z' }
    ],

    notifications: [
      { id: 'ntf-1', user_id: 'usr-stu-1', title: 'New Notice Posted', message: 'Mid-Semester Examination Schedule has been published.', is_read: false, created_at: '2026-08-20T09:00:00Z' },
      { id: 'ntf-2', user_id: 'usr-stu-1', title: 'Low Attendance Warning', message: 'Your attendance in CS-204 (DBMS) is below 75%. Please attend classes regularly.', is_read: false, created_at: '2026-08-19T08:00:00Z' },
      { id: 'ntf-3', user_id: 'usr-stu-2', title: 'Low Attendance Warning', message: 'Your overall attendance is 71%, below the 75% minimum threshold.', is_read: false, created_at: '2026-08-19T08:00:00Z' },
      { id: 'ntf-4', user_id: 'usr-fac-1', title: 'Timetable Updated', message: 'Your CS-201 lecture on Wednesday has been moved to Room LH-201.', is_read: true, created_at: '2026-08-18T10:00:00Z' }
    ],

    subject_grades: [
      { id: 'grd-1', student_id: 'stu-1', subject_id: 'sub-1', academic_term_id: 'term-1', marks: 88, grade: 'A', exam_type: 'final' },
      { id: 'grd-2', student_id: 'stu-1', subject_id: 'sub-2', academic_term_id: 'term-1', marks: 82, grade: 'A-', exam_type: 'mid_term' },
      { id: 'grd-3', student_id: 'stu-2', subject_id: 'sub-1', academic_term_id: 'term-1', marks: 74, grade: 'B+', exam_type: 'final' },
      { id: 'grd-4', student_id: 'stu-3', subject_id: 'sub-1', academic_term_id: 'term-1', marks: 91, grade: 'A+', exam_type: 'final' },
      { id: 'grd-5', student_id: 'stu-3', subject_id: 'sub-2', academic_term_id: 'term-1', marks: 87, grade: 'A', exam_type: 'final' }
    ],

    audit_logs: []
  };

  let state = {};

  function init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {
        state = JSON.parse(JSON.stringify(defaultSeed));
      }
    } else {
      state = JSON.parse(JSON.stringify(defaultSeed));
      save();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetToSeed() {
    state = JSON.parse(JSON.stringify(defaultSeed));
    save();
  }

  return {
    init,
    save,
    resetToSeed,
    getState: () => state,

    // ── Role Switcher ──────────────────────────────────────────────────────────
    setRole: (role) => {
      state.currentRole = role;
      if (role === 'admin') state.currentUserId = 'usr-admin-1';
      else if (role === 'faculty') state.currentUserId = 'usr-fac-1';
      else if (role === 'student') state.currentUserId = 'usr-stu-1';
      save();
    },
    getCurrentRole: () => state.currentRole || 'admin',
    getCurrentUser: () => state.users.find(u => u.id === state.currentUserId) || state.users[0],

    // ── Getters ─────────────────────────────────────────────────────────────────
    getDepartments: () => state.departments,
    getCourses: (deptId) => deptId ? state.courses.filter(c => c.department_id === deptId) : state.courses,
    getSubjects: (courseId) => courseId ? state.subjects.filter(s => s.course_id === courseId) : state.subjects,
    getTerms: () => state.academic_terms,
    getCurrentTerm: () => state.academic_terms.find(t => t.is_current),
    getDivisions: (courseId) => courseId ? state.divisions.filter(d => d.course_id === courseId) : state.divisions,
    getFaculty: () => state.faculty,
    getStudents: (query) => {
      let list = state.students;
      if (query) {
        const q = query.toLowerCase();
        list = list.filter(s =>
          s.full_name.toLowerCase().includes(q) ||
          s.roll_number.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.status.includes(q)
        );
      }
      return list;
    },
    getAssignments: () => state.faculty_subject_assignments,
    getAssignmentsForFaculty: (facId) => state.faculty_subject_assignments.filter(a => a.faculty_id === facId),
    getTimetable: (divId) => divId ? state.timetable_entries.filter(t => t.division_id === divId) : state.timetable_entries,
    getCampusLocations: () => state.campus_locations,
    getCampusCategories: () => state.campus_categories,
    getNotices: () => state.notices,
    getEvents: () => state.events,
    getEventRegistrations: () => state.event_registrations,
    getAttendanceSessions: () => state.attendance_sessions,
    getAttendanceRecords: (sessionId) => sessionId ? state.attendance_records.filter(r => r.session_id === sessionId) : state.attendance_records,
    getAttendanceForStudent: (stuId) => state.attendance_records.filter(r => r.student_id === stuId),
    getProfileSections: () => [...state.profile_sections].sort((a, b) => a.display_order - b.display_order),
    getProfileFields: (secId) => state.profile_fields.filter(f => f.section_id === secId).sort((a, b) => a.display_order - b.display_order),
    getProfileEntries: (stuId, secId) => state.profile_entries.filter(e => e.student_id === stuId && e.section_id === secId),
    getGrades: (stuId) => stuId ? state.subject_grades.filter(g => g.student_id === stuId) : state.subject_grades,
    getNotificationsForUser: (userId) => state.notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    getUnreadCount: (userId) => state.notifications.filter(n => n.user_id === userId && !n.is_read).length,
    getAuditLogs: () => state.audit_logs || [],

    // ── Audit Log ──────────────────────────────────────────────────────────────
    _audit: (action, entityType, entityId, diff) => {
      if (!state.audit_logs) state.audit_logs = [];
      state.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        actor_id: state.currentUserId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        diff,
        created_at: new Date().toISOString()
      });
      if (state.audit_logs.length > 100) state.audit_logs.pop();
    },

    // ── Department CRUD ────────────────────────────────────────────────────────
    addDepartment: (dept) => {
      dept.id = 'dept-' + Date.now();
      state.departments.push(dept);
      window.SmartCampusStore._audit('CREATE', 'department', dept.id, dept);
      save(); return dept;
    },
    updateDepartment: (id, data) => {
      const idx = state.departments.findIndex(d => d.id === id);
      if (idx > -1) { Object.assign(state.departments[idx], data); window.SmartCampusStore._audit('UPDATE', 'department', id, data); save(); }
    },
    deleteDepartment: (id) => {
      state.departments = state.departments.filter(d => d.id !== id);
      window.SmartCampusStore._audit('DELETE', 'department', id, {});
      save();
    },

    // ── Course CRUD ────────────────────────────────────────────────────────────
    addCourse: (c) => { c.id = 'course-' + Date.now(); state.courses.push(c); save(); return c; },
    updateCourse: (id, data) => { const i = state.courses.findIndex(c => c.id === id); if (i > -1) { Object.assign(state.courses[i], data); save(); } },
    deleteCourse: (id) => { state.courses = state.courses.filter(c => c.id !== id); save(); },

    // ── Subject CRUD ───────────────────────────────────────────────────────────
    addSubject: (s) => { s.id = 'sub-' + Date.now(); state.subjects.push(s); save(); return s; },
    updateSubject: (id, data) => { const i = state.subjects.findIndex(s => s.id === id); if (i > -1) { Object.assign(state.subjects[i], data); save(); } },
    deleteSubject: (id) => { state.subjects = state.subjects.filter(s => s.id !== id); save(); },

    // ── Academic Term CRUD ─────────────────────────────────────────────────────
    addAcademicTerm: (term) => {
      term.id = 'term-' + Date.now();
      if (term.is_current === true || term.is_current === 'true') {
        state.academic_terms.forEach(t => t.is_current = false);
        term.is_current = true;
      } else { term.is_current = false; }
      state.academic_terms.push(term); save(); return term;
    },
    setCurrentTerm: (id) => {
      state.academic_terms.forEach(t => t.is_current = t.id === id);
      window.SmartCampusStore._audit('UPDATE', 'academic_term', id, { is_current: true });
      save();
    },
    deleteTerm: (id) => { state.academic_terms = state.academic_terms.filter(t => t.id !== id); save(); },

    // ── Division CRUD ──────────────────────────────────────────────────────────
    addDivision: (div) => { div.id = 'div-' + Date.now(); state.divisions.push(div); save(); return div; },
    updateDivision: (id, data) => { const i = state.divisions.findIndex(d => d.id === id); if (i > -1) { Object.assign(state.divisions[i], data); save(); } },
    deleteDivision: (id) => { state.divisions = state.divisions.filter(d => d.id !== id); save(); },

    // ── Faculty CRUD ───────────────────────────────────────────────────────────
    addFaculty: (fac) => {
      const usrId = 'usr-fac-' + Date.now();
      state.users.push({ id: usrId, role: 'faculty', email: fac.email, is_active: true });
      fac.id = 'fac-' + Date.now(); fac.user_id = usrId; fac.is_active = true;
      state.faculty.push(fac); save(); return fac;
    },
    updateFaculty: (id, data) => { const i = state.faculty.findIndex(f => f.id === id); if (i > -1) { Object.assign(state.faculty[i], data); save(); } },
    toggleFacultyActive: (id) => {
      const f = state.faculty.find(f => f.id === id);
      if (f) { f.is_active = !f.is_active; window.SmartCampusStore._audit('UPDATE', 'faculty', id, { is_active: f.is_active }); save(); }
    },

    // ── Student CRUD ───────────────────────────────────────────────────────────
    addStudent: (stu) => {
      const usrId = 'usr-stu-' + Date.now();
      state.users.push({ id: usrId, role: 'student', email: stu.email, is_active: true });
      stu.id = 'stu-' + Date.now(); stu.user_id = usrId; stu.status = 'active';
      stu.cgpa = parseFloat(stu.cgpa) || 3.50; stu.attendance_percentage = 100;
      stu.current_semester_number = parseInt(stu.current_semester_number) || 1;
      stu.admission_year = parseInt(stu.admission_year) || new Date().getFullYear();
      state.students.push(stu); save(); return stu;
    },
    updateStudent: (id, data) => {
      const i = state.students.findIndex(s => s.id === id);
      if (i > -1) { Object.assign(state.students[i], data); window.SmartCampusStore._audit('UPDATE', 'student', id, data); save(); }
    },
    setStudentStatus: (id, status) => {
      const s = state.students.find(s => s.id === id);
      if (s) { s.status = status; window.SmartCampusStore._audit('UPDATE', 'student_status', id, { status }); save(); }
    },

    // ── Faculty Subject Assignment ─────────────────────────────────────────────
    addAssignment: (asg) => {
      // Enforce unique constraint: same subject+division+term cannot be double-assigned
      const dup = state.faculty_subject_assignments.find(a =>
        a.subject_id === asg.subject_id && a.division_id === asg.division_id && a.academic_term_id === asg.academic_term_id
      );
      if (dup) return { success: false, message: 'This subject+division+term is already assigned to another faculty member.' };
      asg.id = 'fsa-' + Date.now();
      state.faculty_subject_assignments.push(asg); save();
      return { success: true, data: asg };
    },
    deleteAssignment: (id) => { state.faculty_subject_assignments = state.faculty_subject_assignments.filter(a => a.id !== id); save(); },

    // ── Timetable CRUD ─────────────────────────────────────────────────────────
    addTimetableEntry: (entry) => {
      entry.id = 'tt-' + Date.now();
      state.timetable_entries.push(entry); save(); return entry;
    },
    deleteTimetableEntry: (id) => { state.timetable_entries = state.timetable_entries.filter(t => t.id !== id); save(); },

    // ── Campus CRUD ────────────────────────────────────────────────────────────
    addCampusLocation: (loc) => { loc.id = 'loc-' + Date.now(); state.campus_locations.push(loc); save(); return loc; },
    updateCampusLocation: (id, data) => { const i = state.campus_locations.findIndex(l => l.id === id); if (i > -1) { Object.assign(state.campus_locations[i], data); save(); } },
    deleteCampusLocation: (id) => { state.campus_locations = state.campus_locations.filter(l => l.id !== id); save(); },

    // ── Notices & Events CRUD ──────────────────────────────────────────────────
    addNotice: (notice) => {
      notice.id = 'not-' + Date.now();
      notice.published_at = new Date().toISOString().split('T')[0];
      state.notices.unshift(notice);
      // Push notifications to all users
      state.users.forEach(u => {
        state.notifications.push({ id: 'ntf-' + Date.now() + Math.random(), user_id: u.id, title: 'New Notice: ' + notice.title, message: notice.description, is_read: false, created_at: new Date().toISOString() });
      });
      save(); return notice;
    },
    deleteNotice: (id) => { state.notices = state.notices.filter(n => n.id !== id); save(); },
    addEvent: (evt) => { evt.id = 'evt-' + Date.now(); state.events.unshift(evt); save(); return evt; },
    deleteEvent: (id) => { state.events = state.events.filter(e => e.id !== id); save(); },

    // ── Event Registration ─────────────────────────────────────────────────────
    registerForEvent: (eventId, userId) => {
      const exists = state.event_registrations.find(r => r.event_id === eventId && r.user_id === userId);
      if (exists) return false;
      state.event_registrations.push({ id: 'reg-' + Date.now(), event_id: eventId, user_id: userId, registered_at: new Date().toISOString() });
      save(); return true;
    },
    unregisterFromEvent: (eventId, userId) => {
      state.event_registrations = state.event_registrations.filter(r => !(r.event_id === eventId && r.user_id === userId));
      save();
    },
    isRegisteredForEvent: (eventId, userId) => state.event_registrations.some(r => r.event_id === eventId && r.user_id === userId),

    // ── Notifications ──────────────────────────────────────────────────────────
    markNotificationRead: (id) => {
      const n = state.notifications.find(n => n.id === id);
      if (n) { n.is_read = true; save(); }
    },
    markAllNotificationsRead: (userId) => {
      state.notifications.filter(n => n.user_id === userId).forEach(n => n.is_read = true);
      save();
    },
    pushNotification: (userId, title, message) => {
      state.notifications.unshift({ id: 'ntf-' + Date.now(), user_id: userId, title, message, is_read: false, created_at: new Date().toISOString() });
      save();
    },

    // ── Profile Section CRUD ───────────────────────────────────────────────────
    addProfileSection: (sec) => {
      sec.id = 'sec-' + Date.now(); sec.is_default = false; sec.is_deletable = true;
      sec.is_active = true; sec.display_order = state.profile_sections.length + 1;
      state.profile_sections.push(sec); save(); return sec;
    },
    deleteProfileSection: (id) => {
      const sec = state.profile_sections.find(s => s.id === id);
      if (sec && !sec.is_deletable) return false;
      state.profile_sections = state.profile_sections.filter(s => s.id !== id);
      state.profile_fields = state.profile_fields.filter(f => f.section_id !== id);
      save(); return true;
    },
    addProfileField: (field) => {
      field.id = 'fld-' + Date.now();
      field.display_order = state.profile_fields.filter(f => f.section_id === field.section_id).length + 1;
      state.profile_fields.push(field); save(); return field;
    },
    deleteProfileField: (id) => { state.profile_fields = state.profile_fields.filter(f => f.id !== id); save(); },
    addProfileEntry: (entry) => { entry.id = 'ent-' + Date.now(); state.profile_entries.push(entry); save(); return entry; },
    deleteProfileEntry: (id) => { state.profile_entries = state.profile_entries.filter(e => e.id !== id); save(); },

    // ── Attendance QR ──────────────────────────────────────────────────────────
    createQRSession: (divisionId, subjectId, facultyId) => {
      state.attendance_sessions.forEach(s => {
        if (s.division_id === divisionId && s.subject_id === subjectId) s.status = 'closed';
      });
      const token = 'QR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const session = {
        id: 'sess-' + Date.now(), division_id: divisionId, subject_id: subjectId, faculty_id: facultyId,
        session_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        qr_token: token, qr_expires_at: Date.now() + 45000, status: 'open'
      };
      state.attendance_sessions.push(session); save(); return session;
    },
    markAttendanceViaToken: (token, studentId) => {
      const sess = state.attendance_sessions.find(s => s.qr_token === token && s.status === 'open');
      if (!sess) return { success: false, message: 'Invalid or expired QR token.' };
      if (Date.now() > sess.qr_expires_at) {
        sess.status = 'closed'; save();
        return { success: false, message: 'QR token expired. Ask faculty to regenerate.' };
      }
      if (state.attendance_records.find(r => r.session_id === sess.id && r.student_id === studentId)) {
        return { success: false, message: 'Attendance already recorded for this session.' };
      }
      state.attendance_records.push({ id: 'att-' + Date.now(), session_id: sess.id, student_id: studentId, status: 'present', marked_at: new Date().toISOString(), method: 'qr' });
      save(); return { success: true, message: 'Attendance marked PRESENT successfully!' };
    },
    manualMarkAttendance: (sessionId, studentId, status) => {
      const existing = state.attendance_records.find(r => r.session_id === sessionId && r.student_id === studentId);
      if (existing) { existing.status = status; existing.method = 'manual'; }
      else { state.attendance_records.push({ id: 'att-' + Date.now(), session_id: sessionId, student_id: studentId, status, marked_at: new Date().toISOString(), method: 'manual' }); }
      window.SmartCampusStore._audit('OVERRIDE', 'attendance', studentId, { status, sessionId });
      save();
    }
  };
})();

