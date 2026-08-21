/**
 * SmartCampus Main Application Controller & Router
 */

window.App = (function () {
  const store = window.SmartCampusStore;
  let currentView = 'overview';

  function init() {
    store.init();
    render();
    setupEventListeners();
  }

  function setupEventListeners() {
    document.getElementById('role-select-input').addEventListener('change', (e) => {
      switchRole(e.target.value);
    });
  }

  function switchRole(newRole) {
    store.setRole(newRole);
    if (newRole === 'admin') currentView = 'overview';
    else if (newRole === 'faculty') currentView = 'faculty-classes';
    else if (newRole === 'student') currentView = 'student-dashboard';

    render();
    toast(`Switched persona to ${newRole.toUpperCase()} mode`, 'info');
  }

  function navigate(viewKey) {
    currentView = viewKey;
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const role = store.getCurrentRole();
    const roleSelect = document.getElementById('role-select-input');
    if (roleSelect) roleSelect.value = role;

    renderSidebar(role);
    renderTopbar(role);
    renderMainContent(role);
  }

  function renderSidebar(role) {
    const navContainer = document.getElementById('sidebar-nav-list');
    let navItems = [];

    if (role === 'admin') {
      navItems = [
        { section: 'Overview' },
        { id: 'overview', label: 'Admin Dashboard', icon: '📊' },
        { section: 'College Operations' },
        { id: 'structure', label: 'College Structure', icon: '🏛️' },
        { id: 'people', label: 'People Directory', icon: '👥' },
        { id: 'profile-builder', label: 'Dynamic Profile Engine', icon: '⚡' },
        { section: 'Campus & Communication' },
        { id: 'campus', label: 'Campus Locations', icon: '📍' },
        { id: 'notices', label: 'Notices & Events', icon: '📢' },
        { id: 'analytics', label: 'System Analytics', icon: '📈' }
      ];
    } else if (role === 'faculty') {
      navItems = [
        { section: 'Academic Teaching' },
        { id: 'faculty-classes', label: 'My Assigned Classes', icon: '📚' },
        { id: 'faculty-attendance', label: 'Smart Attendance QR', icon: '⚡' },
        { id: 'faculty-roster', label: 'Class Roster', icon: '📋' },
        { id: 'faculty-timetable', label: 'My Timetable', icon: '📅' }
      ];
    } else if (role === 'student') {
      navItems = [
        { section: 'Student Portal' },
        { id: 'student-dashboard', label: 'My Dashboard', icon: '🎓' },
        { id: 'student-scan', label: 'Scan Attendance QR', icon: '📱' },
        { id: 'student-profile', label: 'My Profile & Records', icon: '👤' },
        { id: 'student-timetable', label: 'My Timetable', icon: '📅' },
        { id: 'student-campus', label: 'Campus Navigator', icon: '🗺️' }
      ];
    }

    navContainer.innerHTML = navItems.map(item => {
      if (item.section) {
        return `<div class="nav-section-label">${item.section}</div>`;
      }
      const isActive = currentView === item.id;
      return `
        <div class="nav-item ${isActive ? 'active' : ''}" onclick="App.navigate('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `;
    }).join('');

    // Update user info badge in sidebar footer
    const user = store.getCurrentUser();
    document.getElementById('user-name-display').innerText = role === 'admin' ? 'College Registrar' : (role === 'faculty' ? 'Dr. Alan Turing' : 'Alice Johnson');
    document.getElementById('user-role-display').innerText = role.toUpperCase() + ' ROLE';
  }

  function renderTopbar(role) {
    const titleMap = {
      'overview': 'Institutional Overview Dashboard',
      'structure': 'College Academic Structure Management',
      'people': 'People & User Directory',
      'profile-builder': 'Dynamic Profile System Builder',
      'campus': 'Campus Navigation & Location Pins',
      'notices': 'Notices & Event Communications',
      'analytics': 'Institutional Analytics',

      'faculty-classes': 'Faculty Teaching Assignments',
      'faculty-attendance': 'Smart Attendance QR Code Generator',
      'faculty-roster': 'Class Attendance Roster',
      'faculty-timetable': 'Faculty Weekly Schedule',

      'student-dashboard': 'Student Academic Dashboard',
      'student-scan': 'Classroom Smart Attendance Check-In',
      'student-profile': 'Student Profile & Academic Records',
      'student-timetable': 'Weekly Class Timetable',
      'student-campus': 'Campus Map & Location Finder'
    };

    document.getElementById('page-heading-title').innerText = titleMap[currentView] || 'SmartCampus Portal';
  }

  function renderMainContent(role) {
    const viewport = document.getElementById('view-viewport');
    let html = '';

    if (currentView === 'overview') html = window.AdminView.renderOverview();
    else if (currentView === 'structure') html = window.AdminView.renderStructure();
    else if (currentView === 'people') html = window.AdminView.renderPeople();
    else if (currentView === 'profile-builder') html = window.AdminView.renderProfileBuilder();
    else if (currentView === 'campus') html = window.AdminView.renderCampus();
    else if (currentView === 'notices') html = window.AdminView.renderNotices();
    else if (currentView === 'analytics') html = window.AdminView.renderAnalytics();

    else if (currentView === 'faculty-classes') html = window.FacultyView.renderClasses();
    else if (currentView === 'faculty-attendance') html = window.FacultyView.renderAttendanceGenerator();
    else if (currentView === 'faculty-roster') html = window.FacultyView.renderRoster();
    else if (currentView === 'faculty-timetable') html = window.FacultyView.renderFacultyTimetable();

    else if (currentView === 'student-dashboard') html = window.StudentView.renderDashboard();
    else if (currentView === 'student-scan') html = window.StudentView.renderQRScanner();
    else if (currentView === 'student-profile') html = window.StudentView.renderProfile();
    else if (currentView === 'student-timetable') html = window.StudentView.renderStudentTimetable();
    else if (currentView === 'student-campus') html = window.StudentView.renderCampusMap();

    viewport.innerHTML = html;
  }

  // Toast Notification Engine
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      background: var(--ink);
      color: #FFFFFF;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      font-size: 13.5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid ${type === 'success' ? 'var(--signal-green)' : (type === 'danger' ? 'var(--signal-red)' : 'var(--brass)')};
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeIn 0.2s ease;
    `;
    toastEl.innerHTML = `<span>${type === 'success' ? '✓' : (type === 'danger' ? '⚠️' : 'ℹ️')}</span> <span>${message}</span>`;
    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.remove();
    }, 3500);
  }

  // Modal Handlers
  function openModal(modalType) {
    let title = 'SmartCampus Action';
    let body = '';

    if (modalType === 'addDepartment') {
      title = 'Add Academic Department';
      body = `
        <form onsubmit="App.handleFormSubmit(event, 'department')">
          <div class="form-group">
            <label class="form-label">Department Code <span class="required">*</span></label>
            <input type="text" name="code" class="form-control" placeholder="e.g. CSE" required />
          </div>
          <div class="form-group">
            <label class="form-label">Department Name <span class="required">*</span></label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Department of Computer Science" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-control"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Department</button>
        </form>
      `;
    } else if (modalType === 'addCourse') {
      title = 'Add Academic Course';
      body = `
        <form onsubmit="App.handleFormSubmit(event, 'course')">
          <div class="form-group">
            <label class="form-label">Course Code <span class="required">*</span></label>
            <input type="text" name="code" class="form-control" placeholder="e.g. CS-BTECH" required />
          </div>
          <div class="form-group">
            <label class="form-label">Course Name <span class="required">*</span></label>
            <input type="text" name="name" class="form-control" placeholder="e.g. B.Tech Computer Science" required />
          </div>
          <div class="form-group">
            <label class="form-label">Degree Type</label>
            <input type="text" name="degree_type" class="form-control" value="Undergraduate" />
          </div>
          <div class="form-group">
            <label class="form-label">Duration (Years)</label>
            <input type="number" name="duration_years" class="form-control" value="4" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Course</button>
        </form>
      `;
    } else if (modalType === 'addStudent') {
      title = 'Add New Student Record';
      body = `
        <form onsubmit="App.handleFormSubmit(event, 'student')">
          <div class="form-group">
            <label class="form-label">Roll Number <span class="required">*</span></label>
            <input type="text" name="roll_number" class="form-control" placeholder="e.g. 26CS004" required />
          </div>
          <div class="form-group">
            <label class="form-label">Student Code <span class="required">*</span></label>
            <input type="text" name="student_code" class="form-control" placeholder="e.g. STU-2026-004" required />
          </div>
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" name="full_name" class="form-control" placeholder="e.g. Edward Nygma" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" name="email" class="form-control" placeholder="edward@student.smartcampus.edu" required />
          </div>
          <div class="form-group">
            <label class="form-label">Specialization</label>
            <input type="text" name="specialization" class="form-control" value="Software Engineering" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Enroll Student</button>
        </form>
      `;
    } else if (modalType === 'addProfileSection') {
      title = 'Create Dynamic Profile Section';
      body = `
        <form onsubmit="App.handleFormSubmit(event, 'profileSection')">
          <div class="form-group">
            <label class="form-label">Section Name <span class="required">*</span></label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Internships & Projects" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" name="description" class="form-control" placeholder="e.g. Industry internships and capstones" />
          </div>
          <div class="form-group">
            <label class="form-label">Icon Emoji</label>
            <input type="text" name="icon" class="form-control" value="💼" />
          </div>
          <div class="form-group">
            <label style="display:flex; align-items:center; gap:8px; font-size:13.5px;">
              <input type="checkbox" name="student_editable" value="true" checked /> Allow Students to Self-Edit Entries
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Section</button>
        </form>
      `;
    }

    showCustomModal(title, body);
  }

  function openAddFieldModal(sectionId, sectionName) {
    const title = `Add Field to "${sectionName}" Section`;
    const body = `
      <form onsubmit="App.handleAddFieldSubmit(event, '${sectionId}')">
        <div class="form-group">
          <label class="form-label">Field Label <span class="required">*</span></label>
          <input type="text" name="label" class="form-control" placeholder="e.g. Organization Name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Field Type</label>
          <select name="field_type" class="form-control">
            <option value="text">Short Text</option>
            <option value="long_text">Long Text / Paragraph</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="dropdown">Dropdown Selection</option>
            <option value="url">URL Link</option>
            <option value="rating">Rating (1-5)</option>
          </select>
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; font-size:13.5px;">
            <input type="checkbox" name="is_required" value="true" /> Mark Required (*)
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Add Field to Section</button>
      </form>
    `;
    showCustomModal(title, body);
  }

  function handleFormSubmit(evt, entityType) {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const data = {};
    formData.forEach((val, key) => data[key] = val);

    if (entityType === 'department') store.addDepartment(data);
    else if (entityType === 'course') store.addCourse(data);
    else if (entityType === 'student') store.addStudent(data);
    else if (entityType === 'profileSection') {
      data.student_editable = formData.get('student_editable') === 'true';
      store.addProfileSection(data);
    }

    closeModal();
    toast(`${entityType.toUpperCase()} record created successfully!`, 'success');
    render();
  }

  function handleAddFieldSubmit(evt, sectionId) {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const data = {
      section_id: sectionId,
      label: formData.get('label'),
      field_type: formData.get('field_type'),
      is_required: formData.get('is_required') === 'true'
    };

    if (data.field_type === 'dropdown') {
      data.options = { choices: ['Option A', 'Option B', 'Option C'] };
    }

    store.addProfileField(data);
    closeModal();
    toast('Custom field added to profile section!', 'success');
    render();
  }

  function showCustomModal(title, bodyHtml) {
    document.getElementById('modal-title-text').innerText = title;
    document.getElementById('modal-body-container').innerHTML = bodyHtml;
    document.getElementById('modal-overlay-el').classList.add('active');
  }

  function closeModal() {
    document.getElementById('modal-overlay-el').classList.remove('active');
  }

  return {
    init,
    navigate,
    switchRole,
    render,
    toast,
    openModal,
    openAddFieldModal,
    showCustomModal,
    closeModal,
    handleFormSubmit,
    handleAddFieldSubmit
  };
})();

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
