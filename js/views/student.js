/**
 * SmartCampus Student View Module
 * Handles Student Dashboard, QR Scanner, Dynamic Profile System, Timetable, Campus Map, Notices.
 */

window.StudentView = (function () {
  const store = window.SmartCampusStore;

  function getActiveStudent() {
    return store.getStudents()[0] || {};
  }

  function renderDashboard() {
    const student = getActiveStudent();
    const isLowAttendance = student.attendance_percentage < 75;

    return `
      ${isLowAttendance ? `
        <div style="background:var(--signal-red-light); border:1px solid rgba(179,38,30,0.3); padding:14px 18px; border-radius:var(--radius-md); margin-bottom:20px; color:var(--signal-red); display:flex; align-items:center; justify-content:space-between;">
          <div>
            <strong>⚠️ Low Attendance Warning Flag (< 75%)</strong>
            <div style="font-size:12.5px; opacity:0.9;">Your current overall attendance is ${student.attendance_percentage}%. You are below the 75% institutional requirement.</div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="App.navigate('student-attendance')">Check In Now</button>
        </div>
      ` : ''}

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Overall Attendance</div>
          <div class="stat-number ${isLowAttendance ? 'warning' : ''}">${student.attendance_percentage}%</div>
          <div class="metric-trend ${isLowAttendance ? 'negative' : 'positive'}">
            ${isLowAttendance ? '⚠️ Below 75% Threshold' : '✓ Good Attendance Standing'}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Cumulative GPA (CGPA)</div>
          <div class="stat-number">${student.cgpa}</div>
          <div class="metric-trend positive">Semester 3 Current</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Enrolled Division</div>
          <div style="font-family:var(--font-serif); font-size:22px; font-weight:500; margin-top:4px;">
            <span class="code-chip" style="font-size:16px;">CS-3A</span>
          </div>
          <div class="metric-trend">B.Tech Computer Science</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Subject-Wise Attendance Breakdown</div>
              <div class="card-subtitle">Current semester attendance tracking</div>
            </div>
            <button class="btn btn-accent btn-sm" onclick="App.navigate('student-scan')">📱 Scan Attendance QR</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span><span class="code-chip">CS-201</span> Data Structures & Algorithms</span>
                <strong style="color:var(--signal-green);">94% (16/17 Attended)</strong>
              </div>
              <div style="height:8px; background:var(--paper); border-radius:4px; border:1px solid var(--line); overflow:hidden;">
                <div style="height:100%; width:94%; background:var(--signal-green);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span><span class="code-chip">CS-204</span> Database Management Systems</span>
                <strong style="color:var(--signal-red);">68% (11/16 Attended) ⚠️</strong>
              </div>
              <div style="height:8px; background:var(--paper); border-radius:4px; border:1px solid var(--line); overflow:hidden;">
                <div style="height:100%; width:68%; background:var(--signal-red);"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Next Scheduled Class</div>
              <div class="card-subtitle">Today's timetable timetable highlight</div>
            </div>
          </div>

          <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; background:var(--paper);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="code-chip">10:15 AM - 11:15 AM</span>
              <span class="badge badge-active">UPCOMING NEXT</span>
            </div>
            <h3 class="h3">CS-204: Database Management Systems</h3>
            <div style="font-size:13px; color:var(--slate); margin-top:4px;">📍 CS Computing Lab 2 · Faculty: Dr. Alan Turing</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQRScanner() {
    const sessions = store.getAttendanceSessions().filter(s => s.status === 'open');
    const sampleToken = sessions[0] ? sessions[0].qr_token : 'QR-CS204-88492';

    return `
      <div class="card" style="max-width:600px; margin:0 auto;">
        <div class="card-header">
          <div>
            <div class="card-title">Classroom Smart Attendance Check-In</div>
            <div class="card-subtitle">Scan classroom QR code or enter token code</div>
          </div>
        </div>

        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:12px;">📱</div>
          <div style="font-family:var(--font-serif); font-size:18px; font-weight:500;">Enter Classroom QR Attendance Code</div>
          <div style="font-size:13px; color:var(--slate); margin-top:4px; margin-bottom:20px;">
            Codes refresh every 45 seconds on the instructor screen.
          </div>

          <div style="background:var(--paper); padding:16px; border-radius:var(--radius-md); border:1px solid var(--line); margin-bottom:20px;">
            <div style="font-size:12px; color:var(--slate); margin-bottom:6px;">Sample Active Session Code (Faculty Broadcast):</div>
            <span class="code-chip" style="font-size:16px; font-weight:600; cursor:pointer;" onclick="document.getElementById('token-input-field').value='${sampleToken}'">
              ${sampleToken} (Click to auto-fill)
            </span>
          </div>

          <div class="form-group" style="text-align:left;">
            <label class="form-label">QR Token Code</label>
            <input type="text" id="token-input-field" class="form-control" placeholder="e.g. QR-CS204-88492" style="font-family:var(--font-mono); font-size:16px; text-transform:uppercase;" />
          </div>

          <button class="btn btn-accent btn-lg" style="width:100%;" onclick="StudentView.submitAttendanceToken()">
            ✓ Check In & Record Attendance
          </button>
        </div>
      </div>
    `;
  }

  function submitAttendanceToken() {
    const token = document.getElementById('token-input-field').value.trim();
    if (!token) {
      App.toast('Please enter a QR token code.', 'danger');
      return;
    }

    const student = getActiveStudent();
    const res = store.markAttendanceViaToken(token, student.id);

    if (res.success) {
      App.toast(res.message, 'success');
      App.navigate('student-dashboard');
    } else {
      App.toast(res.message, 'danger');
    }
  }

  function renderProfile() {
    const student = getActiveStudent();
    const sections = store.getProfileSections();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Digital Student Profile</div>
            <div class="card-subtitle">${student.full_name} · <span class="code-chip">${student.roll_number}</span> · ${student.specialization}</div>
          </div>
        </div>

        <div class="tab-bar">
          <button class="tab-btn active" onclick="StudentView.switchProfileTab(event, 'prof-personal')">Personal Info</button>
          <button class="tab-btn" onclick="StudentView.switchProfileTab(event, 'prof-academic')">Academic Grades</button>
          ${sections.map(sec => `
            <button class="tab-btn" onclick="StudentView.switchProfileTab(event, 'prof-sec-${sec.id}')">${sec.icon || ''} ${sec.name}</button>
          `).join('')}
        </div>

        <!-- Personal Info Tab -->
        <div id="prof-personal" class="profile-tab-content">
          <div class="grid-2">
            <div>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <div class="form-control" style="background:var(--paper);">${student.full_name}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Roll Number / Student Code</label>
                <div class="form-control" style="background:var(--paper); font-family:var(--font-mono);">${student.roll_number} (${student.student_code})</div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div class="form-control" style="background:var(--paper);">${student.email}</div>
              </div>
            </div>

            <div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <div class="form-control" style="background:var(--paper);">${student.phone}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <div class="form-control" style="background:var(--paper);">${student.address}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Emergency Contact</label>
                <div class="form-control" style="background:var(--paper);">${student.emergency_contact_name} (${student.emergency_contact_phone})</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Academic Grades Tab -->
        <div id="prof-academic" class="profile-tab-content" style="display:none;">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr><th>Subject Code</th><th>Subject Name</th><th>Exam Type</th><th>Marks</th><th>Grade</th></tr>
              </thead>
              <tbody>
                <tr><td><span class="code-chip">CS-201</span></td><td>Data Structures & Algorithms</td><td>Final Exam</td><td>88 / 100</td><td><span class="badge badge-active">A</span></td></tr>
                <tr><td><span class="code-chip">CS-204</span></td><td>Database Management Systems</td><td>Mid-Term</td><td>82 / 100</td><td><span class="badge badge-active">A-</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Dynamic Profile Sections Tabs -->
        ${sections.map(sec => {
          const fields = store.getProfileFields(sec.id);
          const entries = store.getProfileEntries(student.id, sec.id);

          return `
            <div id="prof-sec-${sec.id}" class="profile-tab-content" style="display:none;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                  <h3 class="h3">${sec.name}</h3>
                  <div style="font-size:13px; color:var(--slate);">${sec.description}</div>
                </div>
                ${sec.student_editable ? `
                  <button class="btn btn-primary btn-sm" onclick="StudentView.openAddEntryModal('${sec.id}', '${sec.name}')">+ Add ${sec.name} Entry</button>
                ` : '<span class="badge badge-neutral">Admin Managed Section</span>'}
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      ${fields.map(f => `<th>${f.label}</th>`).join('')}
                      ${sec.student_editable ? '<th>Actions</th>' : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${entries.length === 0 ? `<tr><td colspan="${fields.length + 1}" style="text-align:center; color:var(--slate);">No entries recorded yet. Click "+ Add Entry" above.</td></tr>` : ''}
                    ${entries.map(ent => `
                      <tr>
                        ${fields.map(f => {
                          const val = ent.data[f.label] || '-';
                          if (f.field_type === 'rating') {
                            return `<td>${'⭐'.repeat(Number(val) || 1)}</td>`;
                          }
                          if (f.field_type === 'url') {
                            return `<td><a href="${val}" target="_blank">${val}</a></td>`;
                          }
                          return `<td>${val}</td>`;
                        }).join('')}
                        ${sec.student_editable ? `
                          <td>
                            <button class="btn btn-danger btn-sm" onclick="StudentView.deleteEntry('${ent.id}')">Delete</button>
                          </td>
                        ` : ''}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function switchProfileTab(evt, tabId) {
    document.querySelectorAll('.profile-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-bar .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    evt.target.classList.add('active');
  }

  function openAddEntryModal(secId, secName) {
    const fields = store.getProfileFields(secId);

    const formHtml = `
      <form id="dynamic-entry-form" onsubmit="StudentView.saveDynamicEntry(event, '${secId}')">
        ${fields.map(f => {
          if (f.field_type === 'dropdown') {
            const choices = (f.options && f.options.choices) || ['Option 1', 'Option 2'];
            return `
              <div class="form-group">
                <label class="form-label">${f.label} ${f.is_required ? '<span class="required">*</span>' : ''}</label>
                <select name="${f.label}" class="form-control" ${f.is_required ? 'required' : ''}>
                  ${choices.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
            `;
          }
          if (f.field_type === 'long_text') {
            return `
              <div class="form-group">
                <label class="form-label">${f.label} ${f.is_required ? '<span class="required">*</span>' : ''}</label>
                <textarea name="${f.label}" class="form-control" ${f.is_required ? 'required' : ''}></textarea>
              </div>
            `;
          }
          if (f.field_type === 'rating') {
            return `
              <div class="form-group">
                <label class="form-label">${f.label} (1-5)</label>
                <input type="number" name="${f.label}" min="1" max="5" value="5" class="form-control" />
              </div>
            `;
          }
          return `
            <div class="form-group">
              <label class="form-label">${f.label} ${f.is_required ? '<span class="required">*</span>' : ''}</label>
              <input type="${f.field_type === 'date' ? 'date' : (f.field_type === 'url' ? 'url' : 'text')}" name="${f.label}" class="form-control" ${f.is_required ? 'required' : ''} />
            </div>
          `;
        }).join('')}
        <button type="submit" class="btn btn-primary" style="width:100%;">Save Entry</button>
      </form>
    `;

    App.showCustomModal(`Add ${secName} Entry`, formHtml);
  }

  function saveDynamicEntry(evt, secId) {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const dataObj = {};
    formData.forEach((val, key) => dataObj[key] = val);

    const student = getActiveStudent();
    store.addProfileEntry({
      student_id: student.id,
      section_id: secId,
      data: dataObj
    });

    App.closeModal();
    App.toast('Profile entry added successfully!', 'success');
    App.render();
  }

  function deleteEntry(entryId) {
    store.deleteProfileEntry(entryId);
    App.toast('Entry removed.', 'info');
    App.render();
  }

  function renderStudentTimetable() {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Student Weekly Class Schedule</div>
            <div class="card-subtitle">Division CS-3A Weekly Timetable Grid</div>
          </div>
        </div>

        <div class="timetable-grid">
          <div class="timetable-cell timetable-header">Time</div>
          <div class="timetable-cell timetable-header">Monday</div>
          <div class="timetable-cell timetable-header">Tuesday</div>
          <div class="timetable-cell timetable-header">Wednesday</div>
          <div class="timetable-cell timetable-header">Thursday</div>
          <div class="timetable-cell timetable-header">Friday</div>
          <div class="timetable-cell timetable-header">Saturday</div>

          <div class="timetable-cell timetable-time">09:00 - 10:00</div>
          <div class="timetable-cell">
            <div class="timetable-slot-card">
              <div class="timetable-slot-subject">CS-201: DSA</div>
              <div class="timetable-slot-meta">Lecture Hall 101</div>
            </div>
          </div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>

          <div class="timetable-cell timetable-time">10:15 - 11:15</div>
          <div class="timetable-cell">
            <div class="timetable-slot-card">
              <div class="timetable-slot-subject">CS-204: DBMS</div>
              <div class="timetable-slot-meta">CS Lab 2</div>
            </div>
          </div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
          <div class="timetable-cell"></div>
        </div>
      </div>
    `;
  }

  function renderCampusMap() {
    const locations = store.getCampusLocations();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Campus Map & Building Navigator</div>
            <div class="card-subtitle">Find classrooms, labs, and administrative offices</div>
          </div>
        </div>

        <div class="grid-2">
          <div style="border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; background: var(--paper); position: relative; min-height: 320px;">
            <div style="font-family: var(--font-serif); font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              🗺️ Interactive Campus Map
            </div>
            <div style="position: absolute; top: 40px; bottom: 16px; left: 16px; right: 16px; border: 2px solid var(--line); background: #FFFFFF; border-radius: var(--radius-md); overflow: hidden;">
              ${locations.map(loc => `
                <div style="position: absolute; left: ${loc.map_x}%; top: ${loc.map_y}%; transform: translate(-50%, -50%); cursor: pointer; text-align: center;" onclick="App.toast('${loc.name}: ${loc.description}')">
                  <div style="background: var(--brass); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; margin: 0 auto; border: 2px solid white;">📍</div>
                  <span style="font-size: 10px; background: rgba(27,39,51,0.85); color: white; padding: 1px 4px; border-radius: 3px; white-space: nowrap;">${loc.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${locations.map(loc => `
              <div style="border:1px solid var(--line); border-radius:var(--radius-md); padding:14px; background:var(--surface);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <strong>${loc.name}</strong>
                    <div style="font-size:12.5px; color:var(--slate); margin-top:2px;">${loc.building} · ${loc.floor}</div>
                  </div>
                  <span class="code-chip">${loc.room_number}</span>
                </div>
                <div style="font-size:12px; color:var(--slate-muted); margin-top:8px;">${loc.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderDashboard,
    renderQRScanner,
    submitAttendanceToken,
    renderProfile,
    switchProfileTab,
    openAddEntryModal,
    saveDynamicEntry,
    deleteEntry,
    renderStudentTimetable,
    renderCampusMap
  };
})();
