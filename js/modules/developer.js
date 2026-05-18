/* ============================================
   DEVELOPER MODULE - Developer mode
   ============================================ */

let devStudentChart = null;

function showDeveloperPrompt() { 
    const promptEl = document.getElementById('customDevPrompt'); 
    if (promptEl) promptEl.style.display = 'flex'; 
}

function closeDeveloperPrompt() { 
    const promptEl = document.getElementById('customDevPrompt'); 
    if (promptEl) promptEl.style.display = 'none'; 
    const codeInput = document.getElementById('devCodeInput'); 
    if (codeInput) codeInput.value = ''; 
}

function verifyDeveloperCode() {
    const codeInput = document.getElementById('devCodeInput');
    const code = codeInput ? codeInput.value : '';
    if (code === "712189") { 
        closeDeveloperPrompt(); 
        enterDeveloperMode(); 
    } else { 
        showCustomNotification("Invalid Developer Code", "error"); 
        if (codeInput) codeInput.value = ''; 
    }
}

function enterDeveloperMode() {
    window.isDeveloperModeActive = true;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainAppContainer').style.display = 'none';
    document.getElementById('developerDashboard').style.display = 'flex';
    updateDeveloperStats();
    addTerminalLine('Developer Command Center Activated', 'success');
    addTerminalLine('Student list is displayed below. Use refresh button to update.', 'info');
}

function exitDeveloperMode() {
    window.isDeveloperModeActive = false;
    document.getElementById('developerDashboard').style.display = 'none';
    showLoginPage();
}

function addTerminalLine(message, type = 'info') {
    const output = document.getElementById('devTerminalOutput');
    if (!output) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = `> ${escapeHtml(message)}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function updateDeveloperStats() {
    const totalStudents = document.getElementById('devTotalStudents');
    const totalAdmins = document.getElementById('devTotalAdmins');
    const totalEnrollmentsEl = document.getElementById('devTotalEnrollments');
    const storageSizeEl = document.getElementById('devStorageSize');
    
    if (totalStudents) totalStudents.textContent = window.usersDB.students.length;
    if (totalAdmins) totalAdmins.textContent = window.usersDB.admins.length;
    let totalEnrollments = window.usersDB.students.reduce((sum, s) => sum + (s.enrolledSubjects?.length || 0), 0);
    if (totalEnrollmentsEl) totalEnrollmentsEl.textContent = totalEnrollments;
    let storageSize = (JSON.stringify(window.usersDB).length / 1024).toFixed(2);
    if (storageSizeEl) storageSizeEl.textContent = `${storageSize} KB`;
    updateDeveloperChart();
    loadDeveloperStudentTable();
    addTerminalLine(`Statistics updated: ${window.usersDB.students.length} students`, 'info');
}

function updateDeveloperChart() {
    const ctx = document.getElementById('devStudentChart')?.getContext('2d');
    if (!ctx) return;
    const cumulativeData = [];
    for (let i = 1; i <= 5; i++) cumulativeData.push(Math.floor(window.usersDB.students.length * (i / 5)));
    if (devStudentChart) devStudentChart.destroy();
    devStudentChart = new Chart(ctx, {
        type: 'line', 
        data: { 
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'], 
            datasets: [{ 
                label: 'Student Registrations', 
                data: cumulativeData, 
                borderColor: '#FFB347', 
                backgroundColor: 'rgba(255, 179, 71, 0.1)', 
                fill: true, 
                tension: 0.4, 
                pointBackgroundColor: '#FFB347', 
                pointBorderColor: '#fff', 
                pointRadius: 5, 
                pointHoverRadius: 7 
            }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: true, 
            plugins: { 
                legend: { labels: { color: '#e2e8f0' } }, 
                tooltip: { backgroundColor: '#1a1a2e', titleColor: '#FFB347', bodyColor: '#e2e8f0' } 
            }, 
            scales: { 
                y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#e2e8f0' } }, 
                x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#e2e8f0' } } 
            } 
        } 
    });
}

function toggleDevPassword(element, password) {
    const td = element.parentElement;
    if (td.innerHTML.includes('••••••••')) {
        td.innerHTML = password + ' <button onclick="window.toggleDevPassword(this, \'' + password.replace(/'/g, "\\'") + '\')" class="toggle-password-dev">Hide</button>';
    } else {
        td.innerHTML = '•••••••• <button onclick="window.toggleDevPassword(this, \'' + password.replace(/'/g, "\\'") + '\')" class="toggle-password-dev">Show</button>';
    }
}

function loadDeveloperStudentTable() {
    const container = document.getElementById('devStudentTable');
    if (!container) return;
    if (window.usersDB.students.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users-slash"></i><p>No student accounts found.</p><p>Create student accounts through the main login page.</p></div>';
        return;
    }
    
    let html = `<div class="dev-table-wrapper"><table class="dev-table"><thead>
        <tr><th>#</th><th>Full Name</th><th>Student ID</th><th>Password</th><th>Program</th><th>Year</th>
            <th>Level</th><th>Email</th><th>Contact</th><th>Address</th><th>Section</th><th>Enrolled</th><th>Status</th><th>Login Count</th><th>Last Login</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    window.usersDB.students.forEach((student, index) => {
        const lastLoginDate = student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never';
        const regStatus = student.registrationCompleted ? '✓ Completed' : '⏳ Pending';
        const statusColor = student.registrationCompleted ? '#4CAF50' : '#FFB347';
        const enrolledCount = student.enrolledSubjects?.length || 0;
        const educationLevel = student.level === 'juniorHigh' ? 'Junior High' : student.level === 'seniorHigh' ? 'Senior High' : student.level === 'college' ? 'College' : 'Not set';
        const programDisplay = student.program || student.strand || 'Not set';
        const yearDisplay = student.yearLevel || student.sublevel || 'Not set';
        const escapedPassword = (student.password || '').replace(/'/g, "\\'");
        const sectionDisplay = student.section || '—';
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td style="font-family: monospace;">${student.id}</td>
            <td class="password-cell">•••••••• <button onclick="window.toggleDevPassword(this, '${escapedPassword}')" class="toggle-password-dev">Show</button></td>
            <td>${escapeHtml(programDisplay)}</td>
            <td>${escapeHtml(yearDisplay)}</td>
            <td>${educationLevel}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.contact || 'N/A'}</td>
            <td>${escapeHtml(student.address || 'N/A')}</td>
            <td><span class="section-pill">${escapeHtml(sectionDisplay)}</span></td>
            <td>${enrolledCount}</td>
            <td><span style="color: ${statusColor}">${regStatus}</span></td>
            <td>${student.loginCount || 0}</td>
            <td style="font-size: 0.7rem;">${lastLoginDate}</td>
            <td><button onclick="window.deleteStudentFromDev(${index})" class="delete-student-dev">Delete</button></td>
        </tr>`;
    });
    html += `</tbody>}</div>`;
    container.innerHTML = html;
}

function deleteStudentFromDev(index) {
    if (confirm('⚠️ WARNING: This will permanently delete the student account and all associated data!\n\nAre you sure you want to continue?')) {
        const studentName = window.usersDB.students[index].name;
        window.usersDB.students.splice(index, 1);
        saveData();
        updateDeveloperStats();
        addTerminalLine(`Student "${studentName}" deleted. Total students: ${window.usersDB.students.length}`, 'success');
        showCustomNotification(`Student "${studentName}" has been deleted.`, 'success');
    }
}

function executeDevCommand() {
    const input = document.getElementById('devTerminalCommand');
    if (!input) return;
    const command = input.value.trim().toLowerCase();
    if (!command) return;
    addTerminalLine(`${command}`, 'action');
    
    const parts = command.split(/\s+/);
    const head = parts[0];
    
    if (head === 'setlimit') {
        const target = parts[1]; 
        const n = parseInt(parts[2], 10);
        if (!target || isNaN(n) || n < 0) {
            addTerminalLine('Usage: setlimit <studentId|all> <number>', 'error');
        } else {
            let touched = 0;
            window.usersDB.students.forEach(s => {
                if (target === 'all' || s.id === target) { s.scheduleChangeLimit = n; touched++; }
            });
            saveData();
            addTerminalLine(`Updated limit to ${n} for ${touched} student(s).`, 'success');
        }
    } else if (head === 'resetslots') {
        const target = parts[1];
        if (!target) {
            addTerminalLine('Usage: resetslots <studentId|all>', 'error');
        } else {
            let touched = 0;
            window.usersDB.students.forEach(s => {
                if (target === 'all' || s.id === target) { s.scheduleChangesUsed = 0; touched++; }
            });
            saveData();
            addTerminalLine(`Reset slot usage for ${touched} student(s).`, 'success');
        }
    } else if (head === 'listslots') {
        if (window.usersDB.students.length === 0) {
            addTerminalLine('No students.', 'info');
        } else {
            window.usersDB.students.forEach(s => { 
                ensureSlotFields(s); 
                addTerminalLine(`${s.id} (${s.name}): ${s.scheduleChangesUsed}/${s.scheduleChangeLimit} used`, 'info'); 
            });
        }
    } else {
        switch(command) {
            case 'help': addTerminalLine('Commands: help, stats, clear, refresh, export, setlimit, resetslots, listslots', 'info'); break;
            case 'stats': addTerminalLine(`Students: ${window.usersDB.students.length} | Admins: ${window.usersDB.admins.length}`, 'info'); break;
            case 'clear': const output = document.getElementById('devTerminalOutput'); if (output) output.innerHTML = '<div class="terminal-line">> System ready.</div>'; break;
            case 'refresh': loadDeveloperStudentTable(); addTerminalLine('Student table refreshed', 'success'); break;
            case 'export': 
                const dataStr = JSON.stringify(window.usersDB, null, 2);
                const blob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `students_export_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addTerminalLine('Data exported', 'success');
                break;
            default: addTerminalLine(`Unknown command: ${command}`, 'error');
        }
    }
    input.value = '';
}

// Setup event listeners for developer mode
document.addEventListener('DOMContentLoaded', () => {
    const devTerminalExecute = document.getElementById('devTerminalExecute');
    if (devTerminalExecute) devTerminalExecute.addEventListener('click', executeDevCommand);
    
    const devTerminalCommand = document.getElementById('devTerminalCommand');
    if (devTerminalCommand) devTerminalCommand.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeDevCommand(); });
    
    const devRefreshTableBtn = document.getElementById('devRefreshTableBtn');
    if (devRefreshTableBtn) devRefreshTableBtn.addEventListener('click', () => { loadDeveloperStudentTable(); addTerminalLine('Student table refreshed', 'success'); });
    
    const termCmds = document.querySelectorAll('.term-cmd');
    termCmds.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            const devTerminalCmd = document.getElementById('devTerminalCommand');
            if (devTerminalCmd) devTerminalCmd.value = cmd;
            executeDevCommand();
        });
    });
    
    const devExitBtn = document.getElementById('devExitBtn');
    if (devExitBtn) devExitBtn.addEventListener('click', exitDeveloperMode);
    
    const devCodeSubmit = document.getElementById('devCodeSubmit');
    if (devCodeSubmit) devCodeSubmit.addEventListener('click', verifyDeveloperCode);
    
    const devCodeCancel = document.getElementById('devCodeCancel');
    if (devCodeCancel) devCodeCancel.addEventListener('click', closeDeveloperPrompt);
});

window.showDeveloperPrompt = showDeveloperPrompt;
window.verifyDeveloperCode = verifyDeveloperCode;
window.enterDeveloperMode = enterDeveloperMode;
window.exitDeveloperMode = exitDeveloperMode;
window.updateDeveloperStats = updateDeveloperStats;
window.loadDeveloperStudentTable = loadDeveloperStudentTable;
window.deleteStudentFromDev = deleteStudentFromDev;
window.executeDevCommand = executeDevCommand;
window.toggleDevPassword = toggleDevPassword;
window.addTerminalLine = addTerminalLine;