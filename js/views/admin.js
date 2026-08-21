/**
 * SmartCampus Admin View Module
 * Handles Admin Dashboard, College Structure, People, Profile Builder, Campus, Notices, Analytics.
 */

window.AdminView = (function () {
  const store = window.SmartCampusStore;

  function renderOverview() {
    const students = store.getStudents();
    const faculty = store.getFaculty();
    const depts = store.getDepartments();
    const lowAttCount = students.filter(s => s.attendance_percentage < 75).length;

    return `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Active Students</div>
          <div class="stat-number">${students.length}</div>
          <div class="metric-trend positive">↑ 100% Enrolled</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Faculty Members</div>
          <div class="stat-number">${faculty.length}</div>
          <div class="metric-trend">Professors & Instructors</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Academic Departments</div>
          <div class="stat-number">${depts.length}</div>
          <div class="metric-trend">Active Faculties</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Low Attendance Alert (<75%)</div>
          <div class="stat-number warning">${lowAttCount}</div>
          <div class="metric-trend negative">Requires Attention</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Recent Student Enrollees</div>
              <div class="card-subtitle">Showing current enrolled students</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.openModal('addStudent')">+ Add Student</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td><span class="code-chip">${s.roll_number}</span></td>
                    <td><strong>${s.full_name}</strong><br/><span style="font-size:11px;color:var(--slate);">${s.email}</span></td>
                    <td>${s.specialization}</td>
                    <td>
                      <span style="font-weight:500; ${s.attendance_percentage < 75 ? 'color:var(--signal-red);' : 'color:var(--signal-green);'}">
                        ${s.attendance_percentage}%
                      </span>
                    </td>
                    <td><span class="badge badge-${s.status}">${s.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Quick College Operations</div>
              <div class="card-subtitle">Frequent administrative actions</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <button class="btn btn-secondary" onclick="App.navigate('structure')">🏛️ Manage Departments & Courses</button>
            <button class="btn btn-secondary" onclick="App.navigate('profile-builder')">⚡ Configure Dynamic Profile Engine</button>
            <button class="btn btn-secondary" onclick="App.navigate('campus')">📍 Manage Campus Locations & Pins</button>
            <button class="btn btn-secondary" onclick="App.navigate('notices')">📢 Post Campus Notice / Event</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderStructure() {
    const depts = store.getDepartments();
    const courses = store.getCourses();
    const subjects = store.getSubjects();
    const terms = store.getTerms();
    const divisions = store.getDivisions();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">College Academic Structure</div>
            <div class="card-subtitle">Manage Departments, Courses, Subjects, Terms, and Divisions</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="App.openModal('addDepartment')">+ Add Department</button>
            <button class="btn btn-secondary btn-sm" onclick="App.openModal('addCourse')">+ Add Course</button>
            <button class="btn btn-secondary btn-sm" onclick="App.openModal('addSubject')">+ Add Subject</button>
          </div>
        </div>

        <div class="tab-bar">
          <button class="tab-btn active" onclick="AdminView.switchStructTab(event, 'tab-depts')">Departments (${depts.length})</button>
          <button class="tab-btn" onclick="AdminView.switchStructTab(event, 'tab-courses')">Courses (${courses.length})</button>
          <button class="tab-btn" onclick="AdminView.switchStructTab(event, 'tab-subjects')">Subjects (${subjects.length})</button>
          <button class="tab-btn" onclick="AdminView.switchStructTab(event, 'tab-terms')">Academic Terms (${terms.length})</button>
          <button class="tab-btn" onclick="AdminView.switchStructTab(event, 'tab-divs')">Divisions (${divisions.length})</button>
        </div>

        <div id="tab-depts" class="struct-tab-content">
          <table class="data-table">
            <thead>
              <tr><th>Code</th><th>Department Name</th><th>Description</th></tr>
            </thead>
            <tbody>
              ${depts.map(d => `
                <tr>
                  <td><span class="code-chip">${d.code}</span></td>
                  <td><strong>${d.name}</strong></td>
                  <td>${d.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="tab-courses" class="struct-tab-content" style="display:none;">
          <table class="data-table">
            <thead>
              <tr><th>Code</th><th>Course Name</th><th>Degree</th><th>Duration</th></tr>
            </thead>
            <tbody>
              ${courses.map(c => `
                <tr>
                  <td><span class="code-chip">${c.code}</span></td>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.degree_type}</td>
                  <td>${c.duration_years} Years</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="tab-subjects" class="struct-tab-content" style="display:none;">
          <table class="data-table">
            <thead>
              <tr><th>Code</th><th>Subject Name</th><th>Credits</th><th>Semester</th><th>Type</th></tr>
            </thead>
            <tbody>
              ${subjects.map(s => `
                <tr>
                  <td><span class="code-chip">${s.code}</span></td>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.credits} Credits</td>
                  <td>Semester ${s.semester_number}</td>
                  <td><span class="badge badge-neutral">${s.type}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="tab-terms" class="struct-tab-content" style="display:none;">
          <table class="data-table">
            <thead>
              <tr><th>Term Name</th><th>Start Date</th><th>End Date</th><th>Current Status</th></tr>
            </thead>
            <tbody>
              ${terms.map(t => `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td>${t.start_date}</td>
                  <td>${t.end_date}</td>
                  <td>
                    ${t.is_current ? '<span class="badge badge-active">CURRENT TERM</span>' : '<span class="badge badge-neutral">Inactive</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="tab-divs" class="struct-tab-content" style="display:none;">
          <table class="data-table">
            <thead>
              <tr><th>Division Name</th><th>Semester</th><th>Capacity</th></tr>
            </thead>
            <tbody>
              ${divisions.map(dv => `
                <tr>
                  <td><span class="code-chip">${dv.division_name}</span></td>
                  <td>Semester ${dv.semester_number}</td>
                  <td>${dv.capacity} Students</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function switchStructTab(evt, tabId) {
    document.querySelectorAll('.struct-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-bar .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    evt.target.classList.add('active');
  }

  function renderPeople() {
    const students = store.getStudents();
    const faculty = store.getFaculty();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">People Directory</div>
            <div class="card-subtitle">Manage Students, Faculty, and Assignments</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="App.openModal('addStudent')">+ Add Student</button>
            <button class="btn btn-secondary btn-sm" onclick="App.openModal('addFaculty')">+ Add Faculty</button>
          </div>
        </div>

        <div class="tab-bar">
          <button class="tab-btn active" onclick="AdminView.switchPeopleTab(event, 'tab-students')">Students (${students.length})</button>
          <button class="tab-btn" onclick="AdminView.switchPeopleTab(event, 'tab-faculty')">Faculty (${faculty.length})</button>
        </div>

        <div id="tab-students">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code & Roll</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Semester</th>
                <th>CGPA</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td>
                    <span class="code-chip">${s.roll_number}</span>
                    <br/><span style="font-size:11px;color:var(--slate);">${s.student_code}</span>
                  </td>
                  <td><strong>${s.full_name}</strong></td>
                  <td>${s.email}</td>
                  <td>Sem ${s.current_semester_number}</td>
                  <td><strong style="font-family:var(--font-serif); font-size:15px;">${s.cgpa}</strong></td>
                  <td>
                    <span style="font-weight:500; ${s.attendance_percentage < 75 ? 'color:var(--signal-red);' : 'color:var(--signal-green);'}">
                      ${s.attendance_percentage}% ${s.attendance_percentage < 75 ? '⚠️' : ''}
                    </span>
                  </td>
                  <td><span class="badge badge-${s.status}">${s.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="tab-faculty" style="display:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Faculty Code</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${faculty.map(f => `
                <tr>
                  <td><span class="code-chip">${f.faculty_code}</span></td>
                  <td><strong>${f.full_name}</strong></td>
                  <td>${f.designation}</td>
                  <td>${f.email}</td>
                  <td>${f.phone || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function switchPeopleTab(evt, tabId) {
    document.getElementById('tab-students').style.display = 'none';
    document.getElementById('tab-faculty').style.display = 'none';
    document.querySelectorAll('.tab-bar .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    evt.target.classList.add('active');
  }

  function renderProfileBuilder() {
    const sections = store.getProfileSections();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Dynamic Profile System Builder</div>
            <div class="card-subtitle">Configure custom student profile sections and fields without developer code changes</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.openModal('addProfileSection')">+ Create Profile Section</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          ${sections.map(sec => {
            const fields = store.getProfileFields(sec.id);
            return `
              <div style="border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; background-color: var(--surface);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:20px;">${sec.icon || '📄'}</span>
                      <strong style="font-family:var(--font-serif); font-size:18px;">${sec.name}</strong>
                      ${sec.is_default ? '<span class="badge badge-neutral">Default Section</span>' : '<span class="badge badge-active">Custom Section</span>'}
                      ${sec.student_editable ? '<span class="badge badge-present">Student Self-Editable</span>' : '<span class="badge badge-absent">Admin Only Edit</span>'}
                    </div>
                    <div style="font-size:13px; color:var(--slate); margin-top:2px;">${sec.description || ''}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="App.openAddFieldModal('${sec.id}', '${sec.name}')">+ Add Field</button>
                </div>

                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Field Label</th>
                        <th>Field Type</th>
                        <th>Required</th>
                        <th>Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${fields.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--slate);">No custom fields added yet. Click "+ Add Field" above.</td></tr>' : ''}
                      ${fields.map(f => `
                        <tr>
                          <td>#${f.display_order}</td>
                          <td><strong>${f.label}</strong></td>
                          <td><span class="code-chip">${f.field_type}</span></td>
                          <td>${f.is_required ? '<span style="color:var(--brass); font-weight:500;">Yes (*)</span>' : 'No'}</td>
                          <td>${f.options ? `<pre style="font-size:11px; margin:0; font-family:var(--font-mono);">${JSON.stringify(f.options)}</pre>` : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderCampus() {
    const locations = store.getCampusLocations();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Campus Navigation & Floorplan Locations</div>
            <div class="card-subtitle">Manage campus buildings, room numbers, and floorplan map pins</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.openModal('addCampusLocation')">+ Add Location Pin</button>
        </div>

        <div class="grid-2">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Location / Room</th>
                  <th>Building & Floor</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                ${locations.map(loc => `
                  <tr>
                    <td>
                      <strong>${loc.name}</strong><br/>
                      <span class="code-chip">${loc.room_number}</span>
                    </td>
                    <td>${loc.building}<br/><span style="font-size:12px;color:var(--slate);">${loc.floor}</span></td>
                    <td><span class="code-chip">X:${loc.map_x}% Y:${loc.map_y}%</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; background-color: var(--paper); position: relative; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-family: var(--font-serif); font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              🗺️ Static Campus Floorplan Map View
            </div>
            <div style="position: absolute; top: 40px; bottom: 16px; left: 16px; right: 16px; border: 2px dashed var(--line); background: #FFFFFF; border-radius: var(--radius-md); overflow: hidden;">
              ${locations.map(loc => `
                <div style="position: absolute; left: ${loc.map_x}%; top: ${loc.map_y}%; transform: translate(-50%, -50%); cursor: pointer; text-align: center;" title="${loc.name} (${loc.room_number})">
                  <div style="background: var(--brass); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; margin: 0 auto; border: 2px solid white;">📍</div>
                  <span style="font-size: 10px; background: rgba(27,39,51,0.85); color: white; padding: 1px 4px; border-radius: 3px; white-space: nowrap;">${loc.room_number}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderNotices() {
    const notices = store.getNotices();
    const events = store.getEvents();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Notices & Campus Events Management</div>
            <div class="card-subtitle">Broadcast announcements and schedule events</div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 class="h3">Official Notices</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${notices.map(n => `
                <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:14px; background:var(--surface);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <strong>${n.title}</strong>
                    <span class="badge badge-${n.priority}">${n.priority}</span>
                  </div>
                  <div style="font-size:13px; color:var(--slate); margin-bottom:8px;">${n.description}</div>
                  <div style="font-size:11px; color:var(--slate-muted);">Published: ${n.published_at} · Category: ${n.category}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 class="h3">Upcoming Events</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${events.map(e => `
                <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:14px; background:var(--surface);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <strong>${e.name}</strong>
                    <span class="badge badge-active">REGISTRATION OPEN</span>
                  </div>
                  <div style="font-size:13px; color:var(--slate); margin-bottom:8px;">${e.description}</div>
                  <div style="font-size:12px;">📅 ${e.event_date} (${e.start_time} - ${e.end_time})</div>
                  <div style="font-size:12px; color:var(--slate); margin-top:2px;">📍 ${e.location_name} · Org: ${e.organizer}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnalytics() {
    const students = store.getStudents();
    const depts = store.getDepartments();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Institutional Analytics Dashboard</div>
            <div class="card-subtitle">Aggregated metrics and performance distribution</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Average Institutional CGPA</div>
            <div class="stat-number">3.71</div>
            <div class="metric-trend positive">Based on 3 Student Records</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Overall Attendance Avg</div>
            <div class="stat-number">83.6%</div>
            <div class="metric-trend">Above 75% target threshold</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Profile Skills Logged</div>
            <div class="stat-number">4</div>
            <div class="metric-trend">Dynamic Engine Entries</div>
          </div>
        </div>

        <div class="grid-2">
          <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; background:var(--surface);">
            <h3 class="h3" style="margin-bottom:12px;">Departmental Student Breakdown</h3>
            ${depts.map(d => {
              const deptStudents = students.filter(s => s.department_id === d.id);
              return `
                <div style="margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span>${d.name} (${d.code})</span>
                    <strong>${deptStudents.length} Students</strong>
                  </div>
                  <div style="height:8px; background:var(--paper); border-radius:4px; overflow:hidden; border:1px solid var(--line);">
                    <div style="height:100%; width:${(deptStudents.length / Math.max(students.length, 1)) * 100}%; background:var(--brass);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; background:var(--surface);">
            <h3 class="h3" style="margin-bottom:12px;">Attendance Compliance Status</h3>
            <div style="display:flex; gap:16px; align-items:center; margin-top:20px;">
              <div style="flex:1; text-align:center; padding:16px; background:var(--signal-green-light); border-radius:var(--radius-md); border:1px solid rgba(46,125,79,0.2);">
                <div style="font-size:24px; font-family:var(--font-serif); font-weight:500; color:var(--signal-green);">66.7%</div>
                <div style="font-size:12px; color:var(--signal-green);">Safe (>= 75%)</div>
              </div>
              <div style="flex:1; text-align:center; padding:16px; background:var(--signal-red-light); border-radius:var(--radius-md); border:1px solid rgba(179,38,30,0.2);">
                <div style="font-size:24px; font-family:var(--font-serif); font-weight:500; color:var(--signal-red);">33.3%</div>
                <div style="font-size:12px; color:var(--signal-red);">At Risk (< 75%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderOverview,
    renderStructure,
    renderPeople,
    renderProfileBuilder,
    renderCampus,
    renderNotices,
    renderAnalytics,
    switchStructTab,
    switchPeopleTab
  };
})();
