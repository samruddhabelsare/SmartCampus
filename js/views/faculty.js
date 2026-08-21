/**
 * SmartCampus Faculty View Module
 * Handles My Classes, Smart Attendance QR Session Generator, Roster, Timetable.
 */

window.FacultyView = (function () {
  const store = window.SmartCampusStore;
  let activeTimerInterval = null;

  function renderClasses() {
    const faculty = store.getFaculty()[0] || {};
    const assignments = store.getAssignments().filter(a => a.faculty_id === faculty.id || true);
    const subjects = store.getSubjects();
    const divisions = store.getDivisions();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Faculty Course & Division Assignments</div>
            <div class="card-subtitle">Logged in as: <strong>${faculty.full_name || 'Faculty Member'}</strong> (${faculty.faculty_code || 'FAC-101'})</div>
          </div>
          <button class="btn btn-accent" onclick="App.navigate('faculty-attendance')">⚡ Launch Attendance QR Session</button>
        </div>

        <div class="grid-2">
          ${assignments.map(asg => {
            const sub = subjects.find(s => s.id === asg.subject_id) || subjects[0];
            const div = divisions.find(d => d.id === asg.division_id) || divisions[0];

            return `
              <div style="border: 1px solid var(--line); border-radius: var(--radius-md); padding: 18px; background: var(--surface);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                  <div>
                    <span class="code-chip">${sub.code}</span>
                    <strong style="font-family:var(--font-serif); font-size:16px; display:block; margin-top:4px;">${sub.name}</strong>
                  </div>
                  <span class="badge badge-neutral">${div.division_name}</span>
                </div>
                <div style="font-size:13px; color:var(--slate); margin-bottom:14px;">
                  Semester ${sub.semester_number} · ${sub.credits} Credits · Division Capacity: ${div.capacity}
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-primary btn-sm" onclick="FacultyView.startQRSession('${div.id}', '${sub.id}')">⚡ Generate Attendance QR</button>
                  <button class="btn btn-secondary btn-sm" onclick="App.navigate('faculty-roster')">📋 View Class Roster</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderAttendanceGenerator(divId, subId) {
    const subjects = store.getSubjects();
    const divisions = store.getDivisions();

    const selectedDiv = divId ? divisions.find(d => d.id === divId) : divisions[0];
    const selectedSub = subId ? subjects.find(s => s.id === subId) : subjects[0];

    const openSessions = store.getAttendanceSessions().filter(s => s.status === 'open');
    const activeSession = openSessions[0];

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Smart Attendance QR Session Generator</div>
            <div class="card-subtitle">Generate dynamic, short-lived QR tokens for classroom attendance scanning</div>
          </div>
        </div>

        <div class="grid-2">
          <div style="border: 1px solid var(--line); border-radius: var(--radius-md); padding: 20px; background: var(--surface);">
            <h3 class="h3" style="margin-bottom:14px;">Session Configuration</h3>
            <div class="form-group">
              <label class="form-label">Select Division</label>
              <select id="qr-div-select" class="form-control">
                ${divisions.map(d => `<option value="${d.id}" ${selectedDiv && selectedDiv.id === d.id ? 'selected' : ''}>${d.division_name} (Sem ${d.semester_number})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Select Subject</label>
              <select id="qr-sub-select" class="form-control">
                ${subjects.map(s => `<option value="${s.id}" ${selectedSub && selectedSub.id === s.id ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('')}
              </select>
            </div>

            <button class="btn btn-accent btn-lg" style="width:100%; margin-top:10px;" onclick="FacultyView.triggerQRCreation()">
              ⚡ Generate Live QR Code Session
            </button>
          </div>

          <div id="qr-display-panel" class="qr-container">
            ${activeSession ? renderQROutput(activeSession) : `
              <div class="empty-state" style="border:none;">
                <div class="empty-title">No Active Attendance Session</div>
                <div class="empty-desc">Select a division and subject on the left, then click "Generate Live QR Code" to broadcast QR scanning to students.</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function renderQROutput(session) {
    const records = store.getState().attendance_records.filter(r => r.session_id === session.id);
    const students = store.getStudents();

    return `
      <div style="font-size:12px; color:var(--slate); font-weight:500; text-transform:uppercase; letter-spacing:0.5px;">Live Classroom Broadcast</div>
      <div style="font-family:var(--font-serif); font-size:18px; font-weight:500; margin-top:4px;">Scanning Open</div>

      <div class="qr-box">
        <div style="text-align:center;">
          <div style="font-size:32px; margin-bottom:4px;">📱 Check-In</div>
          <span class="code-chip" style="font-size:16px; font-weight:600; padding:6px 12px; background:var(--brass-light); color:var(--brass); border-color:var(--brass);">
            ${session.qr_token}
          </span>
        </div>
      </div>

      <div style="font-size:13px; color:var(--slate);">Regenerates token automatically every 45 seconds</div>
      <div id="qr-timer-countdown" class="qr-timer">TTL: -- sec</div>

      <div style="margin-top:20px; width:100%; text-align:left; border-top:1px solid var(--line); padding-top:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong>Live Attendance Scans (${records.length})</strong>
          <span class="badge badge-active">Active Stream</span>
        </div>
        ${records.length === 0 ? '<div style="font-size:12px; color:var(--slate);">Waiting for students to scan in...</div>' : ''}
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${records.map(r => {
            const st = students.find(s => s.id === r.student_id);
            return `
              <div style="display:flex; justify-content:space-between; font-size:12.5px; background:var(--paper); padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--line);">
                <span>${st ? st.full_name : 'Student'} (<span class="code-chip">${st ? st.roll_number : ''}</span>)</span>
                <span style="color:var(--signal-green); font-weight:500;">✓ PRESENT</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function startQRSession(divId, subId) {
    App.navigate('faculty-attendance');
    setTimeout(() => {
      document.getElementById('qr-div-select').value = divId;
      document.getElementById('qr-sub-select').value = subId;
      triggerQRCreation();
    }, 50);
  }

  function triggerQRCreation() {
    const divId = document.getElementById('qr-div-select').value;
    const subId = document.getElementById('qr-sub-select').value;
    const faculty = store.getFaculty()[0] || { id: 'fac-1' };

    const session = store.createQRSession(divId, subId, faculty.id);
    document.getElementById('qr-display-panel').innerHTML = renderQROutput(session);

    if (activeTimerInterval) clearInterval(activeTimerInterval);

    activeTimerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((session.qr_expires_at - Date.now()) / 1000));
      const timerEl = document.getElementById('qr-timer-countdown');
      if (timerEl) {
        timerEl.innerText = `TTL: ${remaining} sec`;
      }

      // Update live scanned student list if panel exists
      const livePanel = document.getElementById('qr-display-panel');
      if (livePanel) {
        livePanel.innerHTML = renderQROutput(session);
      }

      if (remaining <= 0) {
        clearInterval(activeTimerInterval);
        if (timerEl) timerEl.innerText = 'Token Expired - Click Generate to refresh';
      }
    }, 1000);
  }

  function renderRoster() {
    const students = store.getStudents();

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Class Roster & Manual Attendance Log</div>
            <div class="card-subtitle">Review enrolled students and override attendance records</div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Semester & Division</th>
                <th>Attendance Score</th>
                <th>Today's Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td><span class="code-chip">${s.roll_number}</span></td>
                  <td><strong>${s.full_name}</strong></td>
                  <td>Sem ${s.current_semester_number} · CS-3A</td>
                  <td>
                    <span style="font-weight:500; ${s.attendance_percentage < 75 ? 'color:var(--signal-red);' : 'color:var(--signal-green);'}">
                      ${s.attendance_percentage}%
                    </span>
                  </td>
                  <td><span class="badge badge-present">Present</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="App.toast('Attendance manual override recorded for ${s.full_name}')">✏️ Override</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderFacultyTimetable() {
    const timetable = store.getTimetable();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['09:00 - 10:00', '10:15 - 11:15', '11:30 - 12:30', '14:00 - 15:00'];

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Faculty Weekly Teaching Schedule</div>
            <div class="card-subtitle">Assigned lectures and lab sessions</div>
          </div>
        </div>

        <div class="timetable-grid">
          <div class="timetable-cell timetable-header">Time</div>
          ${days.map(d => `<div class="timetable-cell timetable-header">${d}</div>`).join('')}

          ${timeSlots.map((slot, idx) => `
            <div class="timetable-cell timetable-time">${slot}</div>
            ${days.map((day, dayIdx) => {
              const entry = timetable.find(t => t.day_of_week === (dayIdx + 1));
              if (idx === 0 && dayIdx === 0) {
                return `
                  <div class="timetable-cell">
                    <div class="timetable-slot-card">
                      <div class="timetable-slot-subject">CS-201: DSA</div>
                      <div class="timetable-slot-meta">Lecture Hall 101</div>
                    </div>
                  </div>
                `;
              } else if (idx === 1 && dayIdx === 0) {
                return `
                  <div class="timetable-cell">
                    <div class="timetable-slot-card">
                      <div class="timetable-slot-subject">CS-204: DBMS</div>
                      <div class="timetable-slot-meta">CS Lab 2</div>
                    </div>
                  </div>
                `;
              } else {
                return `<div class="timetable-cell"></div>`;
              }
            }).join('')}
          `).join('')}
        </div>
      </div>
    `;
  }

  return {
    renderClasses,
    renderAttendanceGenerator,
    renderRoster,
    renderFacultyTimetable,
    startQRSession,
    triggerQRCreation
  };
})();
