// ============ DATA STORAGE ==========
let usersDB = { students: [], admins: [] };
let currentUser = null;
let registrationData = {};
let notificationsDB = { schedule: [], room: [], professor: [] };
let resetCodes = {};
let gradeChart = null;
let attendanceChart = null;
let pendingEnrollment = null;
let devStudentChart = null;
let isDeveloperModeActive = false;

// ============ DISABLE BROWSER CONSOLE ==========
(function() {
    const noop = function() {};
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;
})();

// ============ HELPER FUNCTIONS ==========
function escapeHtml(str) {
    if (!str) return str;
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============ CUSTOM NOTIFICATION SYSTEM ==========
function showCustomNotification(message, type = "info", duration = 4000) {
    const existingNotif = document.getElementById('customNotification');
    if (existingNotif) {
        existingNotif.classList.add('hide');
        setTimeout(() => {
            if (existingNotif.parentElement) existingNotif.remove();
        }, 300);
    }
    
    const notification = document.createElement('div');
    notification.id = 'customNotification';
    notification.className = `custom-notification ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    notification.innerHTML = `
        <div class="notification-icon"><i class="fas ${icon}"></i></div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
            <div class="notification-time"><i class="fas fa-clock"></i> ${timeString}</div>
        </div>
        <button class="notification-close" onclick="this.closest('.custom-notification').classList.add('hide'); setTimeout(() => this.closest('.custom-notification')?.remove(), 300);">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) notification.remove();
            }, 300);
        }
    }, duration);
}

// ============ CUSTOM CONSOLE FUNCTIONS ==========
function customConsoleLog(message, type = "info") {
    const consoleContent = document.getElementById('customConsoleContent');
    if (!consoleContent) return;
    const timestamp = new Date().toLocaleTimeString();
    const logLine = document.createElement('div');
    logLine.className = 'console-line';
    let color = '#00ff9d';
    if (type === 'error') color = '#ff4444';
    else if (type === 'success') color = '#4CAF50';
    else if (type === 'action') color = '#FFB347';
    logLine.innerHTML = `<span style="color: #FFB347;">[${timestamp}]</span> <span style="color: ${color}">${escapeHtml(message)}</span>`;
    consoleContent.appendChild(logLine);
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

function showCustomConsole() { 
    const consoleEl = document.getElementById('customConsole');
    if (consoleEl) consoleEl.style.display = 'flex';
}
function hideCustomConsole() { 
    const consoleEl = document.getElementById('customConsole');
    if (consoleEl) consoleEl.style.display = 'none';
}
function clearCustomConsole() {
    const consoleContent = document.getElementById('customConsoleContent');
    if (consoleContent) consoleContent.innerHTML = '';
    customConsoleLog('Console cleared.', 'info');
}

function executeConsoleCommand() {
    const input = document.getElementById('consoleCommandInput');
    const command = input.value.trim();
    if (!command) return;
    customConsoleLog(`> ${command}`, 'action');
    if (command === 'help') {
        customConsoleLog('Available commands: stats, clear, help', 'info');
        customConsoleLog('  stats - Show system statistics', 'info');
        customConsoleLog('  clear - Clear console', 'info');
        customConsoleLog('  help - Show this help', 'info');
    } else if (command === 'clear') {
        const consoleContent = document.getElementById('customConsoleContent');
        if (consoleContent) consoleContent.innerHTML = '';
        customConsoleLog('Console cleared.', 'info');
    } else if (command === 'stats') {
        customConsoleLog(`System Statistics:`, 'success');
        customConsoleLog(`- Students: ${usersDB.students.length}`, 'info');
        customConsoleLog(`- Admins: ${usersDB.admins.length}`, 'info');
        let totalEnrollments = usersDB.students.reduce((sum, s) => sum + (s.enrolledSubjects?.length || 0), 0);
        customConsoleLog(`- Total Enrollments: ${totalEnrollments}`, 'info');
        let completedReg = usersDB.students.filter(s => s.registrationCompleted).length;
        customConsoleLog(`- Completed Registrations: ${completedReg}`, 'info');
    } else {
        customConsoleLog(`Unknown command: ${command}. Type 'help'`, 'error');
    }
    input.value = '';
}

// ============ DEVELOPER MODE ==========
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
    isDeveloperModeActive = true;
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainAppContainer');
    const devDashboard = document.getElementById('developerDashboard');
    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (devDashboard) devDashboard.style.display = 'flex';
    updateDeveloperStats();
    addTerminalLine('Developer Command Center Activated', 'success');
    addTerminalLine('Student list is displayed below. Use refresh button to update.', 'info');
}

function exitDeveloperMode() {
    isDeveloperModeActive = false;
    const devDashboard = document.getElementById('developerDashboard');
    if (devDashboard) devDashboard.style.display = 'none';
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
    
    if (totalStudents) totalStudents.textContent = usersDB.students.length;
    if (totalAdmins) totalAdmins.textContent = usersDB.admins.length;
    let totalEnrollments = usersDB.students.reduce((sum, s) => sum + (s.enrolledSubjects?.length || 0), 0);
    if (totalEnrollmentsEl) totalEnrollmentsEl.textContent = totalEnrollments;
    let storageSize = (JSON.stringify(usersDB).length / 1024).toFixed(2);
    if (storageSizeEl) storageSizeEl.textContent = `${storageSize} KB`;
    updateDeveloperChart();
    loadDeveloperStudentTable();
    addTerminalLine(`Statistics updated: ${usersDB.students.length} students`, 'info');
}

function updateDeveloperChart() {
    const ctx = document.getElementById('devStudentChart')?.getContext('2d');
    if (!ctx) return;
    const cumulativeData = [];
    for (let i = 1; i <= 5; i++) {
        cumulativeData.push(Math.floor(usersDB.students.length * (i / 5)));
    }
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
    if (usersDB.students.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users-slash"></i><p>No student accounts found.</p><p>Create student accounts through the main login page.</p></div>';
        return;
    }
    let html = `<div class="dev-table-wrapper"><table class="dev-table"><thead>
        <tr>
            <th>#</th><th>Full Name</th><th>Student ID</th><th>Password</th><th>Program/Course</th><th>Year/Grade</th>
            <th>Education Level</th><th>Email</th><th>Contact</th><th>Address</th><th>Enrolled</th><th>Status</th><th>Login Count</th><th>Last Login</th><th>Actions</th>
        </tr>
    </thead><tbody>`;
    
    usersDB.students.forEach((student, index) => {
        const lastLoginDate = student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never';
        const regStatus = student.registrationCompleted ? '✓ Completed' : '⏳ Pending';
        const statusColor = student.registrationCompleted ? '#4CAF50' : '#FFB347';
        const enrolledCount = student.enrolledSubjects?.length || 0;
        const educationLevel = student.level === 'juniorHigh' ? 'Junior High' : student.level === 'seniorHigh' ? 'Senior High' : student.level === 'college' ? 'College' : 'Not set';
        const programDisplay = student.program || student.strand || 'Not set';
        const yearDisplay = student.yearLevel || student.sublevel || 'Not set';
        const escapedPassword = (student.password || '').replace(/'/g, "\\'");
        
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
            <td>${enrolledCount}</td>
            <td><span style="color: ${statusColor}">${regStatus}</span></td>
            <td>${student.loginCount || 0}</td>
            <td style="font-size: 0.7rem;">${lastLoginDate}</td>
            <td><button onclick="window.deleteStudentFromDev(${index})" class="delete-student-dev">Delete</button></td>
        </tr>`;
    });
    html += `</tbody><td></div>`;
    container.innerHTML = html;
}

function deleteStudentFromDev(index) {
    if (confirm('⚠️ WARNING: This will permanently delete the student account and all associated data!\n\nAre you sure you want to continue?')) {
        const studentName = usersDB.students[index].name;
        usersDB.students.splice(index, 1);
        saveData();
        updateDeveloperStats();
        addTerminalLine(`Student "${studentName}" deleted. Total students: ${usersDB.students.length}`, 'success');
        showCustomNotification(`Student "${studentName}" has been deleted.`, 'success');
    }
}

function executeDevCommand() {
    const input = document.getElementById('devTerminalCommand');
    const command = input.value.trim().toLowerCase();
    if (!command) return;
    addTerminalLine(`${command}`, 'action');
    switch(command) {
        case 'help':
            addTerminalLine('Available commands: help, stats, clear, refresh, export', 'info');
            break;
        case 'stats':
            addTerminalLine(`Students: ${usersDB.students.length} | Admins: ${usersDB.admins.length}`, 'info');
            break;
        case 'clear':
            const output = document.getElementById('devTerminalOutput');
            if (output) output.innerHTML = '<div class="terminal-line">> System ready.</div>';
            break;
        case 'refresh':
            loadDeveloperStudentTable();
            addTerminalLine('Student table refreshed', 'success');
            break;
        case 'export':
            const dataStr = JSON.stringify(usersDB, null, 2);
            const blob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_export_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addTerminalLine('Data exported', 'success');
            break;
        default:
            addTerminalLine(`Unknown command: ${command}`, 'error');
    }
    input.value = '';
}

// ============ DATA PERSISTENCE ==========
function loadData() {
    const savedUsers = localStorage.getItem('usersDB');
    if (savedUsers) {
        try {
            usersDB = JSON.parse(savedUsers);
            usersDB.students = usersDB.students.map(s => ({
                ...s,
                enrolledSubjects: s.enrolledSubjects || [],
                grades: s.grades || {},
                attendance: s.attendance || {},
                registrationCompleted: s.registrationCompleted || false,
                loginCount: s.loginCount || 0,
                scheduleConfirmed: s.scheduleConfirmed || false
            }));
        } catch(e) {
            initializeDefaultData();
        }
    } else {
        initializeDefaultData();
    }
}

function initializeDefaultData() {
    usersDB = { students: [], admins: [] };
    usersDB.admins.push({ 
        email: "admin@school.edu", 
        password: "admin123", 
        name: "Professor Maria Santos", 
        lastLogin: null 
    });
    saveData();
}

function saveData() { 
    try {
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
    } catch(e) {
        customConsoleLog('Error saving data: ' + e.message, 'error');
    }
}

loadData();

function loadNotifications() { 
    const saved = localStorage.getItem('notificationsDB'); 
    if (saved) {
        try {
            notificationsDB = JSON.parse(saved);
        } catch(e) {
            notificationsDB = { schedule: [], room: [], professor: [] };
        }
    }
}
function saveNotifications() { localStorage.setItem('notificationsDB', JSON.stringify(notificationsDB)); }
loadNotifications();

// ============ LOGIN MANAGEMENT ==========
function showLoginPage() { 
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainAppContainer');
    if (loginPage) loginPage.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    initializeLoginPanels(); 
    loadRememberedCredentials(); 
}
function showMainApp() { 
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainAppContainer');
    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
}

function clearSavedCredentials() {
    localStorage.removeItem('rememberedId');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberedIsAdmin');
    localStorage.removeItem('rememberMeFlag');
}

function saveRememberedCredentials(id, password, isAdmin = false) {
    const studentRememberMe = document.getElementById('rememberMe')?.checked;
    const adminRememberMe = document.getElementById('rememberMeAdmin')?.checked;
    const rememberMeChecked = isAdmin ? adminRememberMe : studentRememberMe;
    
    if (rememberMeChecked) {
        localStorage.setItem('rememberedId', id);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberedIsAdmin', isAdmin);
        localStorage.setItem('rememberMeFlag', 'true');
    } else {
        clearSavedCredentials();
    }
}

function loadRememberedCredentials() {
    const rememberMeFlag = localStorage.getItem('rememberMeFlag');
    const rememberedId = localStorage.getItem('rememberedId');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const rememberedIsAdmin = localStorage.getItem('rememberedIsAdmin');
    
    if (rememberMeFlag === 'true' && rememberedId && rememberedPassword) {
        if (rememberedIsAdmin === 'true') {
            const adminEmail = document.getElementById('loginAdminEmail');
            const adminPwd = document.getElementById('loginAdminPassword');
            const adminCheckbox = document.getElementById('rememberMeAdmin');
            if (adminEmail) adminEmail.value = rememberedId;
            if (adminPwd) adminPwd.value = rememberedPassword;
            if (adminCheckbox) adminCheckbox.checked = true;
            const adminTab = document.querySelector('.login-tab-btn[data-login-tab="admin"]');
            if (adminTab) adminTab.click();
        } else {
            const studentId = document.getElementById('loginStudentId');
            const studentPwd = document.getElementById('loginStudentPassword');
            const studentCheckbox = document.getElementById('rememberMe');
            if (studentId) studentId.value = rememberedId;
            if (studentPwd) studentPwd.value = rememberedPassword;
            if (studentCheckbox) studentCheckbox.checked = true;
        }
    } else {
        clearSavedCredentials();
    }
}

function initializeLoginPanels() {
    const studentLogin = document.getElementById('studentLoginForm');
    const adminLogin = document.getElementById('adminLoginForm');
    const studentSignup = document.getElementById('studentSignupPanel');
    const adminSignup = document.getElementById('adminSignupPanel');
    const forgotPwd = document.getElementById('forgotPasswordPanel');
    
    if (studentLogin) studentLogin.style.display = 'block';
    if (adminLogin) adminLogin.style.display = 'none';
    if (studentSignup) studentSignup.style.display = 'none';
    if (adminSignup) adminSignup.style.display = 'none';
    if (forgotPwd) forgotPwd.style.display = 'none';
    
    const activeTab = document.querySelector('.login-tab-btn.active');
    if (activeTab && activeTab.getAttribute('data-login-tab') === 'admin') {
        const studentTab = document.querySelector('.login-tab-btn[data-login-tab="student"]');
        if (studentTab) studentTab.click();
    }
}

function setupLoginTabs() {
    document.querySelectorAll('.login-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.login-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.getAttribute('data-login-tab');
            const studentLogin = document.getElementById('studentLoginForm');
            const adminLogin = document.getElementById('adminLoginForm');
            const studentSignup = document.getElementById('studentSignupPanel');
            const adminSignup = document.getElementById('adminSignupPanel');
            const forgotPwd = document.getElementById('forgotPasswordPanel');
            
            if (studentLogin) studentLogin.style.display = tab === 'student' ? 'block' : 'none';
            if (adminLogin) adminLogin.style.display = tab === 'admin' ? 'block' : 'none';
            if (studentSignup) studentSignup.style.display = 'none';
            if (adminSignup) adminSignup.style.display = 'none';
            if (forgotPwd) forgotPwd.style.display = 'none';
        });
    });
}

function validatePassword(password) {
    return { 
        length: password.length >= 12, 
        uppercase: /[A-Z]/.test(password), 
        number: /[0-9]/.test(password), 
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password) 
    };
}

function updatePasswordUI() {
    const password = document.getElementById('signupPassword')?.value || '';
    const reqs = validatePassword(password);
    const lengthEl = document.getElementById('reqLength');
    const upperEl = document.getElementById('reqUppercase');
    const numEl = document.getElementById('reqNumber');
    const specialEl = document.getElementById('reqSpecial');
    if (lengthEl) lengthEl.style.color = reqs.length ? '#10B981' : '#ef4444';
    if (upperEl) upperEl.style.color = reqs.uppercase ? '#10B981' : '#ef4444';
    if (numEl) numEl.style.color = reqs.number ? '#10B981' : '#ef4444';
    if (specialEl) specialEl.style.color = reqs.special ? '#10B981' : '#ef4444';
    return reqs.length && reqs.uppercase && reqs.number && reqs.special;
}

function togglePassword(inputId) { 
    const input = document.getElementById(inputId); 
    if (input) input.type = input.type === 'password' ? 'text' : 'password'; 
}

// ============ SCHEDULE ASSIGNMENT ==========
const scheduleTimeSlots = [
    "Monday 8:00 AM - 10:00 AM", "Monday 10:00 AM - 12:00 PM", "Monday 1:00 PM - 3:00 PM", "Monday 3:00 PM - 5:00 PM",
    "Tuesday 8:00 AM - 10:00 AM", "Tuesday 10:00 AM - 12:00 PM", "Tuesday 1:00 PM - 3:00 PM", "Tuesday 3:00 PM - 5:00 PM",
    "Wednesday 8:00 AM - 10:00 AM", "Wednesday 10:00 AM - 12:00 PM", "Wednesday 1:00 PM - 3:00 PM", "Wednesday 3:00 PM - 5:00 PM",
    "Thursday 8:00 AM - 10:00 AM", "Thursday 10:00 AM - 12:00 PM", "Thursday 1:00 PM - 3:00 PM", "Thursday 3:00 PM - 5:00 PM",
    "Friday 8:00 AM - 10:00 AM", "Friday 10:00 AM - 12:00 PM", "Friday 1:00 PM - 3:00 PM", "Friday 3:00 PM - 5:00 PM"
];

function getSubjectSchedule(subjectName, index) {
    const hash = (subjectName.length * 7 + index * 13) % scheduleTimeSlots.length;
    const secondHash = (hash + 7) % scheduleTimeSlots.length;
    return `${scheduleTimeSlots[hash]}; ${scheduleTimeSlots[secondHash]}`;
}

function assignSchedulesToSubjects(subjects) {
    return subjects.map((subject, idx) => ({
        ...subject,
        schedule: getSubjectSchedule(subject.name, idx)
    }));
}

function getScheduleInfo(subject) {
    const schedules = subject.schedule ? subject.schedule.split('; ') : ["Monday 8:00 AM - 10:00 AM"];
    return {
        schedules: schedules.map(s => {
            const parts = s.split(' ');
            return { day: parts[0], time: parts.slice(1).join(' ') };
        }),
        room: subject.room,
        professor: subject.professor,
        category: subject.category,
        units: subject.units || 3
    };
}

function renderScheduleTable(subjects, containerId) {
    console.log("renderScheduleTable called with", subjects, "subjects, containerId:", containerId);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found:", containerId);
        customConsoleLog(`ERROR: Container ${containerId} not found`, 'error');
        return;
    }
    
    if (!subjects || subjects.length === 0) {
        const isPreview = containerId === 'previewScheduleTable';
        const headline = isPreview
            ? 'No subjects selected yet.'
            : 'No subjects enrolled yet.';
        const subline = isPreview
            ? 'Tick a subject from the list above to see it appear on this schedule canvas.'
            : 'Please go to Self-Enrollment to select your subjects.';
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 16px; display: block;"></i><p>${headline}</p><p>${subline}</p></div>`;
        return;
    }
    
    // Create days and times
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];
    
    // Create schedule grid
    let scheduleGrid = {};
    days.forEach(day => {
        scheduleGrid[day] = {};
        times.forEach(time => {
            scheduleGrid[day][time] = null;
        });
    });
    
    // Fill schedule grid with subjects
    subjects.forEach((subject, idx) => {
        // Get schedule info for this subject
        let subjectSchedule = subject.schedule || "";
        let scheduleParts = subjectSchedule.split('; ');
        
        scheduleParts.forEach((part, partIdx) => {
            if (part && part.trim()) {
                // Find matching day and time
                for (let day of days) {
                    if (part.includes(day)) {
                        let timePart = part.replace(day, "").trim();
                        for (let time of times) {
                            if (timePart === time) {
                                if (scheduleGrid[day][time] === null) {
                                    scheduleGrid[day][time] = subject;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        });
    });
    
    // Build HTML table
    let html = '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
    
    // Table header
    html += '<thead><tr style="background: linear-gradient(135deg, #FFB347, #FF8C00); color: white;">';
    html += '<th style="padding: 14px; text-align: center; font-weight: 600;">Time</th>';
    days.forEach(day => {
        html += `<th style="padding: 14px; text-align: center; font-weight: 600;">${day}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Table rows for each time slot
    times.forEach(time => {
        html += '<tr style="border-bottom: 1px solid #e2e8f0;">';
        html += `<td style="padding: 12px; background: #f8fafc; font-weight: 600; text-align: center; border: 1px solid #e2e8f0;">${time}</td>`;
        
        days.forEach(day => {
            const subject = scheduleGrid[day][time];
            if (subject) {
                html += `<td style="padding: 12px; border: 1px solid #e2e8f0; vertical-align: top; background: white;">
                            <div style="font-weight: 700; color: #1e4a6f; margin-bottom: 6px;">${escapeHtml(subject.name)}</div>
                            <div style="font-size: 11px; color: #10B981; margin-top: 4px;"><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</div>
                            <div style="font-size: 11px; color: #FFB347; margin-top: 2px;"><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</div>
                           </td>`;
            } else {
                html += `<td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-style: italic; background: #fefefe;">— Free —</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log("Schedule table rendered successfully with", subjects.length, "subjects");
    customConsoleLog(`Schedule displayed for ${subjects.length} subjects`, 'success');
}

function generateStudentId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const existingIds = usersDB.students.map(s => s.id);
    let maxSeq = 0;
    const pattern = new RegExp(`^${year}${month}${day}-(\\d+)$`);
    existingIds.forEach(id => { const match = id.match(pattern); if (match) maxSeq = Math.max(maxSeq, parseInt(match[1])); });
    return `${year}${month}${day}-${String(maxSeq + 1).padStart(4, '0')}`;
}

function unlockScheduleGenerator() {
    const schedGenLink = document.getElementById('schedGenNavItem');
    if (schedGenLink && currentUser?.type === 'student') {
        const link = schedGenLink.querySelector('a');
        if (link) {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
            const span = link.querySelector('span');
            if (span) span.textContent = 'Sched. Gen.';
        }
    }
}

// ============ DASHBOARD CHARTS ==========
function createAttendancePieChart() {
    const attendance = currentUser?.data?.attendance || {};
    const present = attendance.present || 0;
    const absent = attendance.absent || 0;
    const tardy = attendance.tardy || 0;
    
    const ctx = document.getElementById('attendancePieChart')?.getContext('2d');
    if (!ctx) return;
    
    if (attendanceChart) attendanceChart.destroy();
    
    if (present === 0 && absent === 0 && tardy === 0) {
        attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e2e8f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#1e2a3e' } }
                }
            }
        });
    } else {
        attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Tardy'],
                datasets: [{
                    data: [present, absent, tardy],
                    backgroundColor: ['#10B981', '#ef4444', '#F59E0B'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#1e2a3e', usePointStyle: true } },
                    tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} records` } }
                }
            }
        });
    }
}

function updateDashboardCharts() {
    if (!currentUser || currentUser.type !== 'student') return;
    
    const grades = currentUser.data.grades || {};
    const gradeCtx = document.getElementById('gradeBarChart')?.getContext('2d');
    if (gradeCtx) {
        if (gradeChart) gradeChart.destroy();
        if (Object.keys(grades).length > 0) {
            gradeChart = new Chart(gradeCtx, { 
                type: 'bar', 
                data: { 
                    labels: Object.keys(grades), 
                    datasets: [{ 
                        label: 'Grade (%)', 
                        data: Object.values(grades), 
                        backgroundColor: 'rgba(255, 179, 71, 0.7)', 
                        borderColor: '#FFB347', 
                        borderWidth: 1 
                    }] 
                }, 
                options: { 
                    responsive: true, 
                    maintainAspectRatio: true, 
                    scales: { y: { beginAtZero: true, max: 100 } } 
                } 
            });
        } else {
            gradeChart = new Chart(gradeCtx, { 
                type: 'bar', 
                data: { 
                    labels: ['No Data'], 
                    datasets: [{ 
                        label: 'Grade (%)', 
                        data: [0], 
                        backgroundColor: '#e2e8f0' 
                    }] 
                }, 
                options: { responsive: true } 
            });
        }
    }
    
    createAttendancePieChart();
}

// ============ CURRICULUM DATA ==========
const highSchoolCurriculum = {
    "Grade 9": [
        { name: "English 9", room: "RM 201", professor: "Prof. Maria Santos", category: "core", units: 1 },
        { name: "Mathematics 9", room: "RM 202", professor: "Prof. Jose Rizal", category: "core", units: 1 },
        { name: "Science 9", room: "LAB 101", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
        { name: "Filipino 9", room: "RM 204", professor: "Prof. Virgilio Almario", category: "core", units: 1 },
        { name: "Araling Panlipunan 9", room: "RM 203", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
        { name: "MAPEH 9", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "minor", units: 1 },
        { name: "TLE 9", room: "WSHOP 1", professor: "Prof. Ramon Magsaysay", category: "minor", units: 1 },
        { name: "Values Education 9", room: "RM 205", professor: "Prof. Carmen Perez", category: "core", units: 1 },
        { name: "Research 9", room: "LIB 101", professor: "Prof. Fe Del Mundo", category: "minor", units: 1 }
    ],
    "Grade 10": [
        { name: "English 10", room: "RM 206", professor: "Prof. Maria Santos", category: "core", units: 1 },
        { name: "Mathematics 10", room: "RM 207", professor: "Prof. Jose Rizal", category: "core", units: 1 },
        { name: "Science 10", room: "LAB 102", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
        { name: "Filipino 10", room: "RM 209", professor: "Prof. Virgilio Almario", category: "core", units: 1 },
        { name: "Araling Panlipunan 10", room: "RM 208", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
        { name: "MAPEH 10", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "minor", units: 1 },
        { name: "Research 10", room: "LIB 101", professor: "Prof. Fe Del Mundo", category: "minor", units: 1 },
        { name: "Values Education 10", room: "RM 210", professor: "Prof. Carmen Perez", category: "core", units: 1 },
        { name: "Career Guidance", room: "RM 211", professor: "Prof. Maria Santos", category: "minor", units: 1 }
    ]
};

const seniorHighStrandSubjects = {
    "STEM": {
        "Grade 11": [
            { name: "Pre-Calculus", room: "RM 301", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "General Biology 1", room: "LAB 201", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
            { name: "General Chemistry 1", room: "LAB 203", professor: "Prof. Paulo Campos", category: "core", units: 1 },
            { name: "Earth Science", room: "LAB 205", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 302", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 303", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Basic Calculus", room: "RM 305", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "General Physics 2", room: "PHY LAB 202", professor: "Prof. William Ong", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 306", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Media & Information Literacy", room: "RM 307", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "ABM": {
        "Grade 11": [
            { name: "Business Mathematics", room: "RM 311", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Organization & Management", room: "RM 312", professor: "Prof. Socorro Ramos", category: "core", units: 1 },
            { name: "Principles of Marketing", room: "RM 313", professor: "Prof. Christine Flores", category: "core", units: 1 },
            { name: "Fundamentals of ABM 1", room: "RM 314", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 315", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 316", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Business Finance", room: "RM 317", professor: "Prof. Christine Flores", category: "core", units: 1 },
            { name: "Applied Economics", room: "RM 318", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 322", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "HUMMS": {
        "Grade 11": [
            { name: "Introduction to World Religions", room: "RM 331", professor: "Prof. Nick Joaquin", category: "core", units: 1 },
            { name: "Creative Writing", room: "RM 332", professor: "Prof. Lualhati Bautista", category: "core", units: 1 },
            { name: "Philippine Politics", room: "RM 333", professor: "Prof. F. Sionil Jose", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 334", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 335", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Introduction to Philosophy", room: "RM 336", professor: "Prof. Nick Joaquin", category: "core", units: 1 },
            { name: "Community Engagement", room: "RM 339", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Media & Information Literacy", room: "RM 341", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "GAS": {
        "Grade 11": [
            { name: "Academic Elective 1", room: "RM 351", professor: "Prof. Maria Santos", category: "elective", units: 1 },
            { name: "Academic Elective 2", room: "RM 352", professor: "Prof. Jose Rizal", category: "elective", units: 1 },
            { name: "Oral Communication", room: "RM 353", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 354", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Statistics & Probability", room: "RM 355", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 358", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    }
};

// Each year contains exactly 14 subjects, sourced from common CHED-aligned
// curricula for these Philippine programs. Subject ORDER controls term
// distribution: filterSubjectsByTerm() slices the array for whichever term
// (Semester, Tri-Semester, Quarter, Block Plan) the student picks.
const collegeCurriculum = {
    "Bachelor of Science in Information Technology": {
        "1st Year": [
            { name: "Introduction to Computing", room: "IT LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Computer Programming 1", room: "IT LAB 101", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Computer Programming 2", room: "IT LAB 102", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Mathematics", room: "RM 406", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Web Systems and Technologies 1", room: "IT LAB 103", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Object-Oriented Programming", room: "IT LAB 201", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Data Structures and Algorithms", room: "IT LAB 202", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Database Management Systems", room: "IT LAB 203", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Computer Architecture and Organization", room: "IT LAB 204", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Networking 1", room: "NET LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Quantitative Methods", room: "RM 414", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Web Systems and Technologies 2", room: "IT LAB 205", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Information Management", room: "IT LAB 206", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Human-Computer Interaction", room: "IT LAB 207", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 }
        ],
        "3rd Year": [
            { name: "Software Engineering 1", room: "IT LAB 301", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security 1", room: "IT LAB 302", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Operating Systems", room: "IT LAB 303", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Networking 2", room: "NET LAB 302", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Mobile Application Development", room: "IT LAB 304", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Quantitative Research Methods", room: "RM 417", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Technical Writing", room: "RM 418", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Software Engineering 2", room: "IT LAB 305", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security 2", room: "IT LAB 306", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Systems Integration and Architecture", room: "IT LAB 307", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Application Development and Emerging Tech", room: "IT LAB 308", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Multimedia Systems", room: "IT LAB 309", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "IT Project Management", room: "IT LAB 310", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "IT Elective 1 - Cloud Computing", room: "IT LAB 311", professor: "Prof. Daniel Tan", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Capstone Project 1", room: "IT LAB 401", professor: "Prof. James Dela Cruz", category: "research", units: 3 },
            { name: "Professional Ethics in IT", room: "IT LAB 402", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "IT Elective 2 - DevOps Engineering", room: "IT LAB 403", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "Cybersecurity Fundamentals", room: "IT LAB 404", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Enterprise Architecture", room: "IT LAB 405", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "IT Service Management", room: "IT LAB 406", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Capstone Project 2", room: "IT LAB 407", professor: "Prof. James Dela Cruz", category: "research", units: 3 },
            { name: "IT Practicum / Internship (486 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "IT Elective 3 - Data Analytics", room: "IT LAB 408", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "IT Elective 4 - AI Foundations", room: "IT LAB 409", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "Emerging Technologies in IT", room: "IT LAB 410", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 }
        ]
    },
    "Bachelor of Science in Computer Science": {
        "1st Year": [
            { name: "Introduction to Computing", room: "CS LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Fundamentals of Programming", room: "CS LAB 101", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Structures 1", room: "RM 401", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 402", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 403", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Intermediate Programming", room: "CS LAB 102", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Structures 2", room: "RM 404", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Calculus 1", room: "RM 411", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Understanding the Self", room: "RM 406", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Object-Oriented Programming", room: "CS LAB 201", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Data Structures and Algorithms", room: "CS LAB 202", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Logic Design and Digital Computer Circuits", room: "CS LAB 203", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Database Systems", room: "CS LAB 204", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Calculus 2", room: "RM 412", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 413", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Architecture and Organization", room: "CS LAB 205", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Information Management", room: "CS LAB 206", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Networks and Communications", room: "NET LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Linear Algebra", room: "RM 414", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Operating Systems", room: "CS LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Software Engineering 1", room: "CS LAB 302", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Automata Theory and Formal Languages", room: "CS LAB 303", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Algorithms and Complexity", room: "CS LAB 304", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Programming Languages", room: "CS LAB 305", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Probability and Statistics", room: "RM 417", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Software Engineering 2", room: "CS LAB 306", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Artificial Intelligence", room: "CS LAB 307", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Human-Computer Interaction", room: "CS LAB 308", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Numerical and Symbolic Computation", room: "CS LAB 309", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Research Methods in Computing", room: "LIB 301", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "CS Elective 1 - Web Engineering", room: "CS LAB 310", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "CS Elective 2 - Game Programming", room: "CS LAB 311", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Thesis Writing 1", room: "LIB 303", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Professional Ethics in CS", room: "CS LAB 401", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "CS Elective 3 - Distributed Systems", room: "CS LAB 402", professor: "Prof. Christopher Lee", category: "elective", units: 3 },
            { name: "CS Elective 4 - Machine Learning", room: "CS LAB 403", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "Compiler Design", room: "CS LAB 404", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security", room: "CS LAB 405", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Thesis Writing 2", room: "LIB 304", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "CS Practicum / Internship (200 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "CS Elective 5 - Computer Graphics", room: "CS LAB 406", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "CS Elective 6 - Cloud and Parallel Computing", room: "CS LAB 407", professor: "Prof. Christopher Lee", category: "elective", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "CS Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 },
            { name: "Capstone Defense", room: "AUD 2", professor: "Prof. Fe Del Mundo", category: "research", units: 1 }
        ]
    },
    "Bachelor of Science in Tourism Management": {
        "1st Year": [
            { name: "Introduction to Tourism and Hospitality", room: "TOUR 101", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Macro Perspective of Tourism and Hospitality", room: "TOUR 102", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Principles of Management", room: "TOUR 103", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Microeconomics with Land Reform & Taxation", room: "RM 410", professor: "Prof. Mark Rivera", category: "ge", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Quality Service Management in Tourism", room: "TOUR 104", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Risk Management as Applied to Safety & Security", room: "TOUR 105", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Tourism and Hospitality Marketing", room: "TOUR 201", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Philippine Culture and Tourism Geography", room: "TOUR 202", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Multicultural Diversity in the Workplace", room: "TOUR 203", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Sustainable Tourism", room: "TOUR 204", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Legal Aspects in Tourism and Hospitality", room: "TOUR 205", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 413", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "World Tourism Geography", room: "TOUR 206", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism and Hospitality Research 1", room: "TOUR 207", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Macroeconomics", room: "RM 411", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Tour Operations Management", room: "TOUR 301", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Travel Agency Operations", room: "TOUR 302", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "MICE Management (Meetings, Incentives, Conventions, Events)", room: "TOUR 303", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Transportation Management", room: "TOUR 304", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Front Office Management", room: "TOUR 305", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism and Hospitality Research 2", room: "TOUR 306", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Cruise Line Operations and Management", room: "TOUR 307", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Sustainable and Ecotourism", room: "TOUR 308", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Policy Planning and Development", room: "TOUR 309", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Information Systems", room: "TOUR 310", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Foreign Language - Mandarin Basics", room: "TOUR 311", professor: "Prof. Maria Santos", category: "elective", units: 3 },
            { name: "Tourism Elective 1 - Heritage Tourism", room: "TOUR 312", professor: "Prof. Christine Flores", category: "elective", units: 3 },
            { name: "Tourism Elective 2 - Rural and Farm Tourism", room: "TOUR 313", professor: "Prof. Mark Rivera", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Strategic Management for Tourism", room: "TOUR 401", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Entrepreneurship", room: "TOUR 402", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Capstone Project 1", room: "LIB 401", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "International Tourism and Hospitality", room: "TOUR 403", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism Elective 3 - Cultural Tourism", room: "TOUR 404", professor: "Prof. Christine Flores", category: "elective", units: 3 },
            { name: "Tourism Elective 4 - Wellness Tourism", room: "TOUR 405", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Capstone Project 2", room: "LIB 402", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Tourism Practicum / Internship (600 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "Foreign Language - Spanish Basics", room: "TOUR 406", professor: "Prof. Maria Santos", category: "elective", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Tourism Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 },
            { name: "On-the-Job Training Briefing", room: "TOUR 407", professor: "Prof. Christine Flores", category: "major", units: 1 },
            { name: "Professional Ethics in Tourism", room: "TOUR 408", professor: "Prof. Carmen Perez", category: "major", units: 3 }
        ]
    }
};

function getSubjectsForLevel(level, sublevel = null, strand = null, program = null, year = null) {
    if (level === 'juniorHigh') {
        return assignSchedulesToSubjects(highSchoolCurriculum[sublevel] || []);
    } else if (level === 'seniorHigh') {
        const gradeData = seniorHighStrandSubjects[strand]?.[sublevel];
        return assignSchedulesToSubjects(gradeData || []);
    } else if (level === 'college') {
        const programData = collegeCurriculum[program]?.[year];
        return assignSchedulesToSubjects(programData || []);
    }
    return [];
}

// ============ ACADEMIC TERM FILTER ==========
// Distributes a year's subjects across the chosen term structure.
// 14 subjects per year: Semester=7+7, Tri-Sem=5+5+4, Quarter=4+4+3+3, Block=7+7
const TERM_DISTRIBUTIONS = {
    'Semester': {
        periods: ['1st Semester', '2nd Semester'],
        sizes: [7, 7]
    },
    'Tri-Semester': {
        periods: ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'],
        sizes: [5, 5, 4]
    },
    'Quarter': {
        periods: ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'],
        sizes: [4, 4, 3, 3]
    },
    'Block Plan': {
        periods: ['Block A', 'Block B'],
        sizes: [7, 7]
    }
};

function filterSubjectsByTerm(subjects, termType, termPeriod) {
    if (!subjects || subjects.length === 0) return subjects;
    
    const dist = TERM_DISTRIBUTIONS[termType] || TERM_DISTRIBUTIONS['Semester'];
    const periodIndex = dist.periods.indexOf(termPeriod);
    
    // Junior High and other non-college pools just return the whole list.
    if (subjects.length < 14 || periodIndex === -1) {
        const termInfoDisplay = document.getElementById('termInfoDisplay');
        if (termInfoDisplay) {
            termInfoDisplay.innerHTML = `<small><i class="fas fa-info-circle"></i> ${termType} - ${termPeriod}: ${subjects.length} subjects available</small>`;
        }
        return subjects;
    }
    
    let start = 0;
    for (let i = 0; i < periodIndex; i++) start += dist.sizes[i];
    const count = dist.sizes[periodIndex];
    const filtered = subjects.slice(start, start + count);
    
    const termInfoDisplay = document.getElementById('termInfoDisplay');
    if (termInfoDisplay) {
        termInfoDisplay.innerHTML = `<small><i class="fas fa-info-circle"></i> ${termType} - ${termPeriod}: ${filtered.length} subjects this term (out of ${subjects.length} total for the year)</small>`;
    }
    
    return filtered;
}

// ============ SELF-ENROLLMENT ==========
function initSelfEnrollment() {
    const enrollmentLevel = document.getElementById('enrollmentLevel');
    if (enrollmentLevel) {
        enrollmentLevel.addEventListener('change', function() {
            const level = this.value;
            const juniorHigh = document.getElementById('juniorHighOptions');
            const seniorHigh = document.getElementById('seniorHighOptions');
            const college = document.getElementById('collegeOptions');
            const subjectsArea = document.getElementById('subjectsDisplayArea');
            
            if (juniorHigh) juniorHigh.style.display = level === 'juniorHigh' ? 'block' : 'none';
            if (seniorHigh) seniorHigh.style.display = level === 'seniorHigh' ? 'block' : 'none';
            if (college) college.style.display = level === 'college' ? 'block' : 'none';
            if (subjectsArea) subjectsArea.style.display = 'none';
            if (level) setTimeout(() => loadSubjectsForLevel(), 100);
        });
    }
    
    const juniorHighGrade = document.getElementById('juniorHighGrade');
    const seniorHighGrade = document.getElementById('seniorHighGrade');
    const seniorHighStrand = document.getElementById('seniorHighStrand');
    const collegeProgram = document.getElementById('collegeProgramSelect');
    const collegeYear = document.getElementById('collegeYearSelect');
    
    if (juniorHighGrade) juniorHighGrade.addEventListener('change', () => loadSubjectsForLevel());
    if (seniorHighGrade) seniorHighGrade.addEventListener('change', () => loadSubjectsForLevel());
    if (seniorHighStrand) seniorHighStrand.addEventListener('change', () => loadSubjectsForLevel());
    if (collegeProgram) collegeProgram.addEventListener('change', () => loadSubjectsForLevel());
    if (collegeYear) collegeYear.addEventListener('change', () => loadSubjectsForLevel());
    
    const academicTermSelect = document.getElementById('academicTermSelect');
    if (academicTermSelect) {
        academicTermSelect.addEventListener('change', function() {
            const termType = this.value;
            const termPeriodSelect = document.getElementById('termPeriodSelect');
            if (!termPeriodSelect) return;
            
            let options = [];
            if (termType === 'Semester') {
                options = ['1st Semester', '2nd Semester'];
            } else if (termType === 'Tri-Semester') {
                options = ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'];
            } else if (termType === 'Quarter') {
                options = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
            } else if (termType === 'Block Plan') {
                options = ['Block A', 'Block B'];
            }
            
            termPeriodSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            
            const enrollmentLevelVal = document.getElementById('enrollmentLevel');
            if (enrollmentLevelVal && enrollmentLevelVal.value) {
                loadSubjectsForLevel();
            }
        });
    }

    // Refresh subjects whenever the user picks a different term period
    // (e.g. switching from "1st Semester" to "2nd Semester").
    const termPeriodSelectInit = document.getElementById('termPeriodSelect');
    if (termPeriodSelectInit) {
        termPeriodSelectInit.addEventListener('change', function() {
            const enrollmentLevelVal = document.getElementById('enrollmentLevel');
            if (enrollmentLevelVal && enrollmentLevelVal.value) {
                loadSubjectsForLevel();
            }
        });
    }
}

function loadSubjectsForLevel() {
    const level = document.getElementById('enrollmentLevel').value;
    if (!level) { 
        const subjectsArea = document.getElementById('subjectsDisplayArea');
        if (subjectsArea) subjectsArea.style.display = 'none';
        return; 
    }
    
    const termType = document.getElementById('academicTermSelect')?.value || 'Semester';
    const termPeriod = document.getElementById('termPeriodSelect')?.value || '1st Semester';
    
    let subjects = [];
    let levelInfo = {};
    
    if (level === 'juniorHigh') {
        const grade = document.getElementById('juniorHighGrade').value;
        if (!grade) { showCustomNotification('Please select a grade level', 'warning'); return; }
        subjects = getSubjectsForLevel('juniorHigh', grade);
        levelInfo = { level, sublevel: grade };
        customConsoleLog(`Loading Junior High subjects for ${grade}`, 'info');
    } else if (level === 'seniorHigh') {
        const grade = document.getElementById('seniorHighGrade').value;
        const strand = document.getElementById('seniorHighStrand').value;
        if (!grade || !strand) { showCustomNotification('Please select both grade and strand', 'warning'); return; }
        subjects = getSubjectsForLevel('seniorHigh', grade, strand);
        levelInfo = { level, sublevel: grade, strand: strand };
        customConsoleLog(`Loading Senior High subjects for ${strand} - ${grade}`, 'info');
    } else if (level === 'college') {
        const program = document.getElementById('collegeProgramSelect').value;
        const year = document.getElementById('collegeYearSelect').value;
        if (!program || !year) { showCustomNotification('Please select both program and year level', 'warning'); return; }
        subjects = getSubjectsForLevel('college', null, null, program, year);
        levelInfo = { level, program, year };
        customConsoleLog(`Loading College subjects for ${program} - ${year}`, 'info');
    }
    
    if (!subjects || subjects.length === 0) {
        showCustomNotification('No subjects found for the selected options', 'warning');
        const subjectsArea = document.getElementById('subjectsDisplayArea');
        if (subjectsArea) subjectsArea.style.display = 'none';
        return;
    }
    
    subjects = filterSubjectsByTerm(subjects, termType, termPeriod);
    
    pendingEnrollment = { subjects, levelInfo };
    displayAvailableSubjects(subjects);
    // Schedule canvas starts EMPTY; subjects only appear once the user
    // ticks them in the list above.
    renderScheduleTable([], 'previewScheduleTable');
    
    const subjectsArea = document.getElementById('subjectsDisplayArea');
    if (subjectsArea) subjectsArea.style.display = 'block';
    showCustomNotification(`Loaded ${subjects.length} subjects for ${termType} - ${termPeriod}. Select your courses then click "Confirm Schedule".`, 'success');
}

function displayAvailableSubjects(subjects) {
    const container = document.getElementById('availableSubjectsList');
    if (!container) return;
    if (!subjects || subjects.length === 0) { 
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No subjects found.</p></div>'; 
        return; 
    }
    let html = '';
    subjects.forEach((subject, idx) => {
        const unitsDisplay = subject.units ? `<small><i class="fas fa-hourglass-half"></i> ${subject.units} units</small>` : '';
        html += `<div class="subject-card" data-subject-index="${idx}">
                    <input type="checkbox" class="subject-checkbox" value="${subject.name.replace(/'/g, "\\'")}">
                    <div class="subject-info">
                        <strong>${escapeHtml(subject.name)}</strong>
                        <div class="subject-details">
                            <small><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</small>
                            <small><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</small>
                            <small><i class="fas fa-tag"></i> ${subject.category.toUpperCase()}</small>
                            <small><i class="fas fa-calendar-week"></i> ${escapeHtml(subject.schedule || 'Schedule TBD')}</small>
                            ${unitsDisplay}
                        </div>
                    </div>
                </div>`;
    });
    container.innerHTML = html;
    
    document.querySelectorAll('.subject-card').forEach(card => {
        const cb = card.querySelector('.subject-checkbox');
        card.addEventListener('click', (e) => {
            if (e.target !== cb) { 
                cb.checked = !cb.checked; 
                card.classList.toggle('selected', cb.checked); 
                refreshPreviewScheduleFromTicks();
            }
        });
        if (cb) {
            cb.addEventListener('change', () => {
                card.classList.toggle('selected', cb.checked);
                refreshPreviewScheduleFromTicks();
            });
        }
    });
}

// Read the currently-ticked subject cards and re-render the schedule
// canvas with ONLY those subjects. The canvas is empty until at least
// one subject is ticked.
function refreshPreviewScheduleFromTicks() {
    const all = (pendingEnrollment && pendingEnrollment.subjects) || [];
    const cards = document.querySelectorAll('#availableSubjectsList .subject-card');
    const picked = [];
    cards.forEach(card => {
        const cb = card.querySelector('.subject-checkbox');
        if (cb && cb.checked) {
            const idx = parseInt(card.getAttribute('data-subject-index'), 10);
            if (!isNaN(idx) && all[idx]) picked.push(all[idx]);
        }
    });
    renderScheduleTable(picked, 'previewScheduleTable');
}

// ============ CONFIRM SCHEDULE FUNCTION ==========
function confirmSchedule() {
    if (!pendingEnrollment) { 
        showCustomNotification('Please select your education level and subjects first', 'warning'); 
        return; 
    }
    
    const selectedCheckboxes = document.querySelectorAll('.subject-checkbox:checked');
    if (selectedCheckboxes.length === 0) { 
        showCustomNotification('Please select at least one subject to enroll', 'warning'); 
        return; 
    }
    
    const selectedSubjectNames = Array.from(selectedCheckboxes).map(cb => cb.value);
    const selectedSubjects = pendingEnrollment.subjects.filter(s => selectedSubjectNames.includes(s.name));
    
    const termType = document.getElementById('academicTermSelect')?.value || 'Semester';
    const termPeriod = document.getElementById('termPeriodSelect')?.value || '1st Semester';
    
    if (currentUser && currentUser.type === 'student') {
        currentUser.data.level = pendingEnrollment.levelInfo.level;
        currentUser.data.sublevel = pendingEnrollment.levelInfo.sublevel;
        currentUser.data.strand = pendingEnrollment.levelInfo.strand;
        currentUser.data.program = pendingEnrollment.levelInfo.program;
        currentUser.data.yearLevel = pendingEnrollment.levelInfo.year;
        currentUser.data.enrolledSubjects = selectedSubjects;
        currentUser.data.scheduleConfirmed = true;
        currentUser.data.termType = termType;
        currentUser.data.termPeriod = termPeriod;
        
        const idx = usersDB.students.findIndex(s => s.id === currentUser.data.id);
        if (idx !== -1) {
            usersDB.students[idx] = JSON.parse(JSON.stringify(currentUser.data));
        }
        saveData();
        
        unlockScheduleGenerator();
        
        customConsoleLog(`Schedule confirmed with ${selectedSubjects.length} subjects`, 'success');
        showCustomNotification(`✅ Successfully enrolled in ${selectedSubjects.length} subjects!`, 'success');
        
        switchContent('student-registration');
        updateRegistrationForm();
    }
}

// ============ HELPER: PICK ACTIVE SUBJECTS FOR SCHED GEN ==========
// Returns confirmed enrolledSubjects when present; otherwise falls back to
// the user's current selection (checked boxes) or the full preview list,
// so "Modify Schedule" works before the user has confirmed enrollment.
function getActiveScheduleSubjects() {
    if (currentUser && currentUser.data && Array.isArray(currentUser.data.enrolledSubjects) && currentUser.data.enrolledSubjects.length > 0) {
        return currentUser.data.enrolledSubjects;
    }
    if (typeof pendingEnrollment !== 'undefined' && pendingEnrollment && Array.isArray(pendingEnrollment.subjects) && pendingEnrollment.subjects.length > 0) {
        const checked = document.querySelectorAll('.subject-checkbox:checked');
        if (checked.length > 0) {
            const checkedNames = new Set(Array.from(checked).map(cb => cb.value));
            const filtered = pendingEnrollment.subjects.filter(s => checkedNames.has(s.name));
            if (filtered.length > 0) return filtered;
        }
        return pendingEnrollment.subjects;
    }
    return [];
}

// ============ MODIFY SCHEDULE FUNCTION - FIXED ==========
function modifySchedule() {
    console.log("=== MODIFY SCHEDULE CALLED ===");
    
    if (!currentUser) {
        showCustomNotification('Please login first', 'warning');
        return;
    }
    
    const activeSubjects = getActiveScheduleSubjects();
    if (!activeSubjects || activeSubjects.length === 0) {
        showCustomNotification('Please select your level and subjects first.', 'warning');
        switchContent('self-enrollment');
        return;
    }
    
    // Unlock schedule generator in sidebar
    const schedGenLink = document.getElementById('schedGenNavItem');
    if (schedGenLink) {
        const link = schedGenLink.querySelector('a');
        if (link) {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
            const span = link.querySelector('span');
            if (span) span.textContent = 'Sched. Gen.';
        }
    }
    
    // Switch to schedule generator page
    switchContent('sched-gen-1');
    
    // Small delay to ensure DOM is ready
    setTimeout(function() {
        const enrolledSubjects = activeSubjects;
        console.log("Enrolled subjects count:", enrolledSubjects.length);
        
        // Update preview badges
        const preview = document.getElementById('enrolledSubjectsListPreview');
        if (preview) {
            preview.innerHTML = '';
            enrolledSubjects.forEach(function(subject) {
                const badge = document.createElement('span');
                badge.className = 'enrolled-preview-badge';
                badge.innerHTML = escapeHtml(subject.name);
                preview.appendChild(badge);
            });
            console.log("Preview updated with", enrolledSubjects.length, "badges");
        } else {
            console.error("Preview container not found!");
        }
        
        // Render schedule table
        renderScheduleTable(enrolledSubjects, 'scheduleResult');
        
        showCustomNotification('Schedule loaded successfully!', 'success');
    }, 100);
}

// ============ REGISTRATION WIZARD ==========
function updateRegistrationForm() {
    if (!currentUser || currentUser.type !== 'student') return;
    const fullName = document.getElementById('personalFullName');
    const studentId = document.getElementById('schoolStudentId');
    const program = document.getElementById('schoolProgram');
    const yearLevel = document.getElementById('schoolYearLevel');
    
    if (fullName) fullName.value = currentUser.data.name;
    if (studentId) studentId.value = currentUser.data.id;
    if (program) program.value = currentUser.data.program || currentUser.data.strand || 'N/A';
    if (yearLevel) yearLevel.value = currentUser.data.yearLevel || currentUser.data.sublevel || 'N/A';
}

let currentPhase = 1;
function showPhase(phase) {
    for (let i = 1; i <= 5; i++) { 
        const el = document.getElementById(`wizard-phase-${i}`); 
        if (el) el.classList.toggle('active-phase', i === phase); 
    }
    currentPhase = phase;
    const steps = document.querySelectorAll('.wizard-step');
    steps.forEach((step, idx) => { 
        step.classList.remove('active', 'completed'); 
        if (idx + 1 < phase) step.classList.add('completed'); 
        if (idx + 1 === phase) step.classList.add('active'); 
    });
    if (phase === 5) generateRegistrationReceipt();
}

function generateRegistrationReceipt() {
    const personal = registrationData.personal || {};
    const schoolType = currentUser?.data?.level === 'juniorHigh' || currentUser?.data?.level === 'seniorHigh' ? 'High School' : 'College';
    const schoolValue = currentUser?.data?.program || currentUser?.data?.strand || 'N/A';
    const receiptHtml = `<div class="receipt-header"><h2>🎓 Official Registration Receipt</h2><p>Date: ${new Date().toLocaleString()}</p></div>
        <div class="receipt-section"><h4>Student Information</h4><p><strong>ID:</strong> ${currentUser?.data?.id}</p><p><strong>Name:</strong> ${personal.fullName || currentUser?.data?.name}</p><p><strong>Contact:</strong> ${personal.contact || 'N/A'}</p><p><strong>Email:</strong> ${personal.email || 'N/A'}</p><p><strong>Address:</strong> ${personal.address || 'N/A'}</p></div>
        <div class="receipt-section"><h4>Academic Information</h4><p><strong>Level:</strong> ${schoolType}</p><p><strong>Program/Strand:</strong> ${schoolValue}</p><p><strong>Year/Grade:</strong> ${currentUser?.data?.yearLevel || currentUser?.data?.sublevel || 'N/A'}</p><p><strong>Enrolled Subjects:</strong> ${currentUser?.data?.enrolledSubjects?.length || 0}</p></div>
        <div class="receipt-section"><h4>Payment Information</h4><p><strong>Total Tuition:</strong> ₱${(23500 + (currentUser?.data?.enrolledSubjects?.length || 0) * 500).toLocaleString()}.00</p><p><strong>Down Payment:</strong> ₱${registrationData.downPayment || '0'}</p><p><strong>Balance:</strong> ₱${(23500 + (currentUser?.data?.enrolledSubjects?.length || 0) * 500) - (registrationData.downPayment || 0)}</p><p><strong>Plan:</strong> ${registrationData.paymentPlan || 'Full Payment'}</p></div>
        <div class="receipt-section"><h4>Status</h4><p><strong style="color:#10B981;">✓ Successfully Enrolled</strong></p><p>Academic Year: 2024-2025</p></div>`;
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) confirmationDetails.innerHTML = receiptHtml;
}

const nextPhaseBtns = document.querySelectorAll('.next-phase-btn');
nextPhaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const next = parseInt(btn.getAttribute('data-next'));
        if (currentPhase === 1) {
            const downPayment = document.getElementById('downPaymentAmount');
            if (downPayment) registrationData.downPayment = downPayment.value;
        }
        if (currentPhase === 2) {
            const fullName = document.getElementById('personalFullName');
            const contact = document.getElementById('personalContact');
            const email = document.getElementById('personalEmail');
            const address = document.getElementById('personalAddress');
            registrationData.personal = { 
                fullName: fullName ? fullName.value : '', 
                contact: contact ? contact.value : '', 
                email: email ? email.value : '', 
                address: address ? address.value : '' 
            };
        }
        if (currentPhase === 4) {
            const paymentPlan = document.getElementById('paymentPlan');
            if (paymentPlan) registrationData.paymentPlan = paymentPlan.value;
        }
        showPhase(next);
    });
});

const prevPhaseBtns = document.querySelectorAll('.prev-phase-btn');
prevPhaseBtns.forEach(btn => { 
    btn.addEventListener('click', () => showPhase(parseInt(btn.getAttribute('data-prev')))); 
});

const finalConfirmBtn = document.getElementById('finalConfirmBtn');
if (finalConfirmBtn) {
    finalConfirmBtn.addEventListener('click', () => {
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms || !agreeTerms.checked) { 
            showCustomNotification('Please agree to terms', 'warning'); 
            return; 
        }
        if (currentUser && currentUser.type === 'student') {
            if (registrationData.personal) { 
                currentUser.data.email = registrationData.personal.email; 
                currentUser.data.contact = registrationData.personal.contact; 
                currentUser.data.address = registrationData.personal.address; 
            }
            currentUser.data.registrationCompleted = true;
            const idx = usersDB.students.findIndex(s => s.id === currentUser.data.id);
            if (idx !== -1) usersDB.students[idx] = JSON.parse(JSON.stringify(currentUser.data));
            saveData();
            customConsoleLog(`REGISTRATION COMPLETED for ${currentUser.data.name}`, 'success');
            showCustomNotification('Registration completed successfully!', 'success');
            switchContent('dashboard');
            updateDashboard();
            updateDashboardCharts();
        }
    });
}

// ============ UI UPDATE AFTER LOGIN ==========
function updateUIAfterLogin() {
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.data.name;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.type === 'student' ? 'Student' : 'Administrator';
    
    if (currentUser.type === 'student') {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeDetails = document.getElementById('welcomeDetails');
        const enrolledCount = document.getElementById('enrolledCount');
        
        if (welcomeMessage) welcomeMessage.textContent = currentUser.data.loginCount === 1 ? 'Welcome to the System' : `Welcome back, ${currentUser.data.name}!`;
        if (welcomeDetails) welcomeDetails.innerHTML = `<i class="fas fa-id-card"></i> ${currentUser.data.id}`;
        if (enrolledCount) enrolledCount.textContent = currentUser.data.enrolledSubjects?.length || 0;
        
        document.querySelectorAll('.student-only').forEach(item => item.style.display = 'block');
        
        const adminRecords = document.getElementById('adminRecordsView');
        const adminUpdates = document.getElementById('adminUpdatesView');
        const studentDashboard = document.querySelector('.student-dashboard-section');
        const studentRecords = document.getElementById('studentRecordsView');
        const studentUpdates = document.getElementById('studentUpdatesView');
        const dashboardGraphs = document.querySelector('.dashboard-graphs');
        
        if (adminRecords) adminRecords.style.display = 'none';
        if (adminUpdates) adminUpdates.style.display = 'none';
        if (studentDashboard) studentDashboard.style.display = 'block';
        if (studentRecords) studentRecords.style.display = 'block';
        if (studentUpdates) studentUpdates.style.display = 'block';
        if (dashboardGraphs) dashboardGraphs.style.display = 'grid';
        
        if (!currentUser.data.scheduleConfirmed && (!currentUser.data.enrolledSubjects || currentUser.data.enrolledSubjects.length === 0)) {
            switchContent('self-enrollment');
        } else { 
            updateRegistrationForm(); 
            updateDashboard(); 
            updateDashboardCharts();
            if (currentUser.data.enrolledSubjects?.length > 0) unlockScheduleGenerator();
        }
    } else if (currentUser.type === 'admin') {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeDetails = document.getElementById('welcomeDetails');
        const welcomeUserRole = document.getElementById('welcomeUserRole');
        
        if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${currentUser.data.name || 'Admin'}!`;
        if (welcomeUserRole) welcomeUserRole.textContent = 'Administrator';
        if (welcomeDetails) welcomeDetails.innerHTML = `<i class="fas fa-envelope"></i> ${currentUser.data.email}`;
        
        document.querySelectorAll('.student-only').forEach(item => item.style.display = 'none');
        
        const adminRecords = document.getElementById('adminRecordsView');
        const adminUpdates = document.getElementById('adminUpdatesView');
        const studentDashboardSection = document.getElementById('studentDashboardSection');
        const scheduleHistorySection = document.getElementById('scheduleHistorySection');
        const studentRecords = document.getElementById('studentRecordsView');
        const studentUpdates = document.getElementById('studentUpdatesView');
        const dashboardGraphs = document.querySelector('.dashboard-graphs');
        const welcomeStats = document.querySelector('.welcome-stats');
        
        if (adminRecords) adminRecords.style.display = 'block';
        if (adminUpdates) adminUpdates.style.display = 'block';
        if (studentDashboardSection) studentDashboardSection.style.display = 'none';
        if (scheduleHistorySection) scheduleHistorySection.style.display = 'none';
        if (studentRecords) studentRecords.style.display = 'none';
        if (studentUpdates) studentUpdates.style.display = 'none';
        if (dashboardGraphs) dashboardGraphs.style.display = 'none';
        if (welcomeStats) welcomeStats.style.display = 'none';
        
        renderAdminDashboardSummary();
        loadAdminStudentSelect();
        setupAdminUpdateTabs();
    } else {
        const welcomeUserRole = document.getElementById('welcomeUserRole');
        if (welcomeUserRole) welcomeUserRole.textContent = 'Student';
    }
    
    // When a STUDENT logs in, restore the elements that the admin path hides
    if (currentUser.type === 'student') {
        const dashboardGraphs = document.querySelector('.dashboard-graphs');
        const welcomeStats = document.querySelector('.welcome-stats');
        const welcomeUserRole = document.getElementById('welcomeUserRole');
        if (dashboardGraphs) dashboardGraphs.style.display = 'grid';
        if (welcomeStats) welcomeStats.style.display = '';
        if (welcomeUserRole) welcomeUserRole.textContent = 'Student';
    }
    updatePageTitleAndHeader('dashboard');
}

function updateDashboard() {
    if (!currentUser || currentUser.type !== 'student') return;
    const enrolled = currentUser.data.enrolledSubjects || [];
    const enrolledTable = document.getElementById('enrolledCoursesTable');
    if (!enrolledTable) return;
    
    if (enrolled.length === 0) {
        enrolledTable.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>No subjects enrolled yet. Go to Self-Enrollment to select your subjects.</p></div>';
    } else {
        let html = '<div class="enrolled-courses-table">';
        enrolled.forEach(subject => {
            const info = getScheduleInfo(subject);
            html += `<div class="course-schedule-item">
                        <span class="course-name">${escapeHtml(subject.name)}</span>
                        <span class="course-schedule"><i class="fas fa-calendar"></i> ${info.schedules[0]?.day || ''} ${info.schedules[0]?.time || ''}</span>
                        <span class="course-schedule"><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</span>
                        <span class="course-professor"><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</span>
                    </div>`;
        });
        html += '</div>';
        enrolledTable.innerHTML = html;
    }
}

function loadStudentRecordsView() {
    if (!currentUser || currentUser.type !== 'student') return;
    const grades = currentUser.data.grades || {};
    const container = document.getElementById('studentGradesDisplay');
    if (!container) return;
    
    if (Object.keys(grades).length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-simple"></i><p>No grade records available yet.</p></div>';
    } else {
        let html = '<table class="tuition-table"><thead><tr><th>Subject</th><th>Grade</th><th>Status</th></tr></thead><tbody>';
        Object.entries(grades).forEach(([subject, grade]) => { 
            html += `<tr><td><strong>${escapeHtml(subject)}</strong></td><td>${grade}%</td><td>${grade >= 75 ? '<span style="color:#10B981;">✓ Passing</span>' : '<span style="color:#ef4444;">⚠ Needs Improvement</span>'}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }
}

function loadAdminStudentSelect() { 
    const select = document.getElementById('adminStudentSelect'); 
    if (select) {
        select.innerHTML = '<option value="">Select Student</option>' + usersDB.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${s.id})</option>`).join('');
    }
    
    const gradeSubjectSelect = document.getElementById('gradeSubjectSelect');
    if (gradeSubjectSelect) {
        gradeSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
    }
}

const adminStudentSelect = document.getElementById('adminStudentSelect');
if (adminStudentSelect) {
    adminStudentSelect.addEventListener('change', function() {
        const studentId = this.value;
        const student = usersDB.students.find(s => s.id === studentId);
        const gradeSubjectSelect = document.getElementById('gradeSubjectSelect');
        if (student && student.enrolledSubjects && gradeSubjectSelect) {
            gradeSubjectSelect.innerHTML = '<option value="">Select Subject</option>' + 
                student.enrolledSubjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
        } else if (gradeSubjectSelect) {
            gradeSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
        }
    });
}

const saveGradeBtn = document.getElementById('saveGradeBtn');
if (saveGradeBtn) {
    saveGradeBtn.addEventListener('click', () => {
        const studentId = document.getElementById('adminStudentSelect')?.value;
        const subject = document.getElementById('gradeSubjectSelect')?.value;
        const grade = document.getElementById('gradeInput')?.value;
        const attendanceStatus = document.getElementById('attendanceStatus')?.value;
        
        if (!studentId || !subject || !grade) { 
            showCustomNotification('Fill all fields', 'warning'); 
            return; 
        }
        
        const student = usersDB.students.find(s => s.id === studentId);
        if (student) {
            if (!student.grades) student.grades = {};
            student.grades[subject] = grade;
            
            if (!student.attendance) student.attendance = {};
            student.attendance[attendanceStatus] = (student.attendance[attendanceStatus] || 0) + 1;
            
            saveData();
            customConsoleLog(`GRADE SAVED: ${student.name} - ${subject}: ${grade}%`, 'success');
            showCustomNotification(`Grade saved for ${student.name}`, 'success');
            if (currentUser?.type === 'student') updateDashboardCharts();
        }
    });
}

// ============ NOTIFICATIONS ==========
function setupAdminUpdateTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const panel = tab.getAttribute('data-admin-tab');
            const adminPanels = document.querySelectorAll('.admin-panel');
            adminPanels.forEach(p => p.classList.remove('active-panel'));
            const activePanel = document.getElementById(`${panel}ChangePanel`);
            if (activePanel) activePanel.classList.add('active-panel');
        });
    });
}

function addNotification(type, title, details, reason) {
    const notification = { id: Date.now(), title, details, reason, date: new Date().toISOString() };
    if (type === 'schedule') notificationsDB.schedule.unshift(notification);
    else if (type === 'room') notificationsDB.room.unshift(notification);
    else notificationsDB.professor.unshift(notification);
    saveNotifications();
    customConsoleLog(`NOTIFICATION POSTED: ${title}`, 'action');
    showCustomNotification(`Announcement posted: ${title}`, 'success');
}

const postScheduleBtn = document.getElementById('postScheduleChangeBtn');
if (postScheduleBtn) {
    postScheduleBtn.addEventListener('click', () => {
        const subject = document.getElementById('scheduleSubject')?.value;
        const oldSchedule = document.getElementById('oldSchedule')?.value;
        const newSchedule = document.getElementById('newSchedule')?.value;
        const reason = document.getElementById('scheduleReason')?.value;
        if (!subject || !oldSchedule || !newSchedule) { 
            showCustomNotification('Fill all fields', 'warning'); 
            return; 
        }
        addNotification('schedule', `Schedule Change: ${subject}`, `From: ${oldSchedule} → To: ${newSchedule}`, reason || 'No reason');
        const scheduleSubject = document.getElementById('scheduleSubject');
        const oldScheduleInput = document.getElementById('oldSchedule');
        const newScheduleInput = document.getElementById('newSchedule');
        const scheduleReason = document.getElementById('scheduleReason');
        if (scheduleSubject) scheduleSubject.value = '';
        if (oldScheduleInput) oldScheduleInput.value = '';
        if (newScheduleInput) newScheduleInput.value = '';
        if (scheduleReason) scheduleReason.value = '';
    });
}

const postRoomBtn = document.getElementById('postRoomChangeBtn');
if (postRoomBtn) {
    postRoomBtn.addEventListener('click', () => {
        const subject = document.getElementById('roomSubject')?.value;
        const oldRoom = document.getElementById('oldRoom')?.value;
        const newRoom = document.getElementById('newRoom')?.value;
        const reason = document.getElementById('roomReason')?.value;
        if (!subject || !oldRoom || !newRoom) { 
            showCustomNotification('Fill all fields', 'warning'); 
            return; 
        }
        addNotification('room', `Room Change: ${subject}`, `From: ${oldRoom} → To: ${newRoom}`, reason || 'No reason');
        const roomSubject = document.getElementById('roomSubject');
        const oldRoomInput = document.getElementById('oldRoom');
        const newRoomInput = document.getElementById('newRoom');
        const roomReason = document.getElementById('roomReason');
        if (roomSubject) roomSubject.value = '';
        if (oldRoomInput) oldRoomInput.value = '';
        if (newRoomInput) newRoomInput.value = '';
        if (roomReason) roomReason.value = '';
    });
}

const postProfessorBtn = document.getElementById('postProfessorChangeBtn');
if (postProfessorBtn) {
    postProfessorBtn.addEventListener('click', () => {
        const subject = document.getElementById('profSubject')?.value;
        const oldProfessor = document.getElementById('oldProfessor')?.value;
        const newProfessor = document.getElementById('newProfessor')?.value;
        const reason = document.getElementById('profReason')?.value;
        if (!subject || !oldProfessor || !newProfessor) { 
            showCustomNotification('Fill all fields', 'warning'); 
            return; 
        }
        addNotification('professor', `Professor Change: ${subject}`, `From: ${oldProfessor} → To: ${newProfessor}`, reason || 'No reason');
        const profSubject = document.getElementById('profSubject');
        const oldProfessorInput = document.getElementById('oldProfessor');
        const newProfessorInput = document.getElementById('newProfessor');
        const profReason = document.getElementById('profReason');
        if (profSubject) profSubject.value = '';
        if (oldProfessorInput) oldProfessorInput.value = '';
        if (newProfessorInput) newProfessorInput.value = '';
        if (profReason) profReason.value = '';
    });
}

function loadNotificationsView() {
    if (!currentUser || currentUser.type !== 'student') return;
    const container = document.getElementById('studentNotificationsList');
    if (!container) return;
    
    let all = [];
    if (notificationsDB.schedule) notificationsDB.schedule.forEach(n => all.push({ ...n, type: 'schedule' }));
    if (notificationsDB.room) notificationsDB.room.forEach(n => all.push({ ...n, type: 'room' }));
    if (notificationsDB.professor) notificationsDB.professor.forEach(n => all.push({ ...n, type: 'professor' }));
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (all.length === 0) { 
        container.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No announcements at this time.</p></div>'; 
        return; 
    }
    
    let html = '';
    all.forEach(n => { 
        const icon = n.type === 'schedule' ? 'fa-clock' : n.type === 'room' ? 'fa-door-open' : 'fa-chalkboard-teacher';
        html += `<div class="notification-item">
                    <div class="notification-icon ${n.type}"><i class="fas ${icon}"></i></div>
                    <div class="notification-content">
                        <div class="notification-title">${escapeHtml(n.title)}</div>
                        <div class="notification-details">${escapeHtml(n.details)}</div>
                        <div class="notification-reason">${escapeHtml(n.reason)}</div>
                        <div class="notification-date">${new Date(n.date).toLocaleString()}</div>
                    </div>
                </div>`; 
    });
    container.innerHTML = html;
}

// ============ SCHEDULE GENERATOR - FIXED ==========
function generateSchedule() {
    console.log("=== GENERATE SCHEDULE CALLED ===");
    
    if (!currentUser) {
        showCustomNotification('Please login first', 'warning');
        return;
    }
    
    const subjects = currentUser.data.enrolledSubjects || [];
    if (subjects.length === 0) {
        showCustomNotification('No subjects enrolled yet', 'warning');
        return;
    }
    
    // Update preview badges
    const preview = document.getElementById('enrolledSubjectsListPreview');
    if (preview) {
        preview.innerHTML = '';
        subjects.forEach(function(subject) {
            const badge = document.createElement('span');
            badge.className = 'enrolled-preview-badge';
            badge.innerHTML = escapeHtml(subject.name);
            preview.appendChild(badge);
        });
    }
    
    // Render schedule
    renderScheduleTable(subjects, 'scheduleResult');
    showCustomNotification('Schedule generated!', 'success');
}

const generateScheduleBtn = document.getElementById('generateCustomScheduleBtn');
if (generateScheduleBtn) generateScheduleBtn.addEventListener('click', generateSchedule);

// ============ NAVIGATION ==========
function switchContent(action) {
    const panels = {
        dashboard: document.getElementById('dashboard-content'),
        'student-registration': document.getElementById('student-registration-content'),
        'self-enrollment': document.getElementById('self-enrollment-content'),
        'student-records': document.getElementById('student-records-content'),
        updates: document.getElementById('updates-content'),
        'sched-gen-1': document.getElementById('sched-gen-1-content')
    };
    
    Object.values(panels).forEach(panel => { 
        if (panel) panel.classList.remove('active'); 
    });
    
    const activePanel = panels[action];
    if (activePanel) activePanel.classList.add('active');
    
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-action') === action) link.classList.add('active');
    });
    
    if (action === 'dashboard') { 
        updateDashboard(); 
        updateDashboardCharts(); 
    }
    if (action === 'student-records') loadStudentRecordsView();
    if (action === 'updates') loadNotificationsView();
    if (action === 'self-enrollment') {
        const subjectsArea = document.getElementById('subjectsDisplayArea');
        if (subjectsArea) subjectsArea.style.display = 'none';
        const levelSelect = document.getElementById('enrollmentLevel');
        if (levelSelect && levelSelect.value) setTimeout(() => loadSubjectsForLevel(), 100);
    }
    if (action === 'sched-gen-1') {
        console.log("Switching to Schedule Generator");
        
        if (!currentUser) {
            showCustomNotification('Please login first', 'warning');
            return;
        }
        
        const enrolledSubjects = getActiveScheduleSubjects();
        if (!enrolledSubjects || enrolledSubjects.length === 0) {
            showCustomNotification('Please select your level and subjects first.', 'warning');
            switchContent('self-enrollment');
            return;
        }
        
        console.log("Enrolled subjects count:", enrolledSubjects.length);
        
        // Update preview badges
        const preview = document.getElementById('enrolledSubjectsListPreview');
        if (preview) {
            preview.innerHTML = '';
            enrolledSubjects.forEach(function(subject) {
                const badge = document.createElement('span');
                badge.className = 'enrolled-preview-badge';
                badge.innerHTML = escapeHtml(subject.name);
                preview.appendChild(badge);
            });
        }
        
        // Render schedule
        if (enrolledSubjects.length > 0) {
            renderScheduleTable(enrolledSubjects, 'scheduleResult');
        }
    }
    updatePageTitleAndHeader(action);
}

const navLinkElements = document.querySelectorAll('.sidebar nav ul li a');
navLinkElements.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser && !isDeveloperModeActive) { 
            showCustomNotification('Please login first', 'warning'); 
            return; 
        }
        if (isDeveloperModeActive) { 
            showCustomNotification('Exit developer mode to access features', 'warning'); 
            return; 
        }
        switchContent(link.getAttribute('data-action'));
    });
});

function updatePageTitleAndHeader(pageName) {
    const titles = { 
        'dashboard': 'Dashboard', 
        'student-registration': 'Student Registration', 
        'self-enrollment': 'Self-Enrollment', 
        'student-records': 'Student Records', 
        'updates': 'Updates', 
        'sched-gen-1': 'Schedule Generator' 
    };
    const pageHeader = document.getElementById('pageTitle');
    if (pageHeader) pageHeader.textContent = titles[pageName] || 'Algorithmic Agenda';
}

function showCredits() { 
    const creditsOverlay = document.getElementById('creditsOverlay');
    if (creditsOverlay) creditsOverlay.style.display = 'flex';
}
function closeCredits() { 
    const creditsOverlay = document.getElementById('creditsOverlay');
    if (creditsOverlay) creditsOverlay.style.display = 'none';
}

const creditsBtn = document.getElementById('creditsBtn');
if (creditsBtn) creditsBtn.addEventListener('click', showCredits);

const creditsOverlay = document.getElementById('creditsOverlay');
if (creditsOverlay) {
    creditsOverlay.addEventListener('click', function(e) { 
        if (e.target === this) closeCredits(); 
    });
}

// ============ EVENT LISTENERS ==========
const devModeTrigger = document.getElementById('devModeTrigger');
if (devModeTrigger) devModeTrigger.addEventListener('click', showDeveloperPrompt);

const devCodeSubmit = document.getElementById('devCodeSubmit');
if (devCodeSubmit) devCodeSubmit.addEventListener('click', verifyDeveloperCode);

const devCodeCancel = document.getElementById('devCodeCancel');
if (devCodeCancel) devCodeCancel.addEventListener('click', closeDeveloperPrompt);

const customDevPrompt = document.getElementById('customDevPrompt');
if (customDevPrompt) {
    customDevPrompt.addEventListener('click', function(e) {
        if (e.target === this) closeDeveloperPrompt();
    });
}

const devCodeInput = document.getElementById('devCodeInput');
if (devCodeInput) {
    devCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') verifyDeveloperCode();
    });
}

const devExitBtn = document.getElementById('devExitBtn');
if (devExitBtn) devExitBtn.addEventListener('click', exitDeveloperMode);

const devTerminalExecute = document.getElementById('devTerminalExecute');
if (devTerminalExecute) devTerminalExecute.addEventListener('click', executeDevCommand);

const devTerminalCommand = document.getElementById('devTerminalCommand');
if (devTerminalCommand) {
    devTerminalCommand.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') executeDevCommand(); 
    });
}

const devRefreshTableBtn = document.getElementById('devRefreshTableBtn');
if (devRefreshTableBtn) {
    devRefreshTableBtn.addEventListener('click', () => { 
        loadDeveloperStudentTable(); 
        addTerminalLine('Student table refreshed', 'success'); 
    });
}

const termCmds = document.querySelectorAll('.term-cmd');
termCmds.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        const devTerminalCmd = document.getElementById('devTerminalCommand');
        if (devTerminalCmd) devTerminalCmd.value = cmd;
        executeDevCommand();
    });
});

const confirmScheduleBtn = document.getElementById('confirmScheduleBtn');
if (confirmScheduleBtn) confirmScheduleBtn.addEventListener('click', confirmSchedule);

const modifyScheduleBtn = document.getElementById('modifyScheduleBtn');
if (modifyScheduleBtn) modifyScheduleBtn.addEventListener('click', modifySchedule);

function closeModifyModal() { 
    const modal = document.getElementById('scheduleModifyModal');
    if (modal) modal.style.display = 'none';
}

const goToSchedGenBtn = document.getElementById('goToSchedGenBtn');
if (goToSchedGenBtn) {
    goToSchedGenBtn.addEventListener('click', () => { 
        closeModifyModal(); 
        modifySchedule();
    });
}

// Login/Signup Event Listeners
const showSignupLink = document.getElementById('showSignupFormLink');
if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const studentLogin = document.getElementById('studentLoginForm');
        const adminLogin = document.getElementById('adminLoginForm');
        const studentSignup = document.getElementById('studentSignupPanel');
        const signupPreview = document.getElementById('signupStudentIdPreview');
        
        if (studentLogin) studentLogin.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'none';
        if (studentSignup) studentSignup.style.display = 'block';
        if (signupPreview) signupPreview.value = generateStudentId();
    });
}

const showAdminSignupLink = document.getElementById('showAdminSignupFormLink');
if (showAdminSignupLink) {
    showAdminSignupLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const studentLogin = document.getElementById('studentLoginForm');
        const adminLogin = document.getElementById('adminLoginForm');
        const adminSignup = document.getElementById('adminSignupPanel');
        
        if (studentLogin) studentLogin.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'none';
        if (adminSignup) adminSignup.style.display = 'block';
    });
}

const backToStudentLogin = document.getElementById('backToStudentLogin');
if (backToStudentLogin) {
    backToStudentLogin.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const studentSignup = document.getElementById('studentSignupPanel');
        const studentLogin = document.getElementById('studentLoginForm');
        
        if (studentSignup) studentSignup.style.display = 'none';
        if (studentLogin) studentLogin.style.display = 'block';
        
        const studentTab = document.querySelector('.login-tab-btn[data-login-tab="student"]');
        if (studentTab) studentTab.click();
    });
}

const backToAdminLogin = document.getElementById('backToAdminLogin');
if (backToAdminLogin) {
    backToAdminLogin.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const adminSignup = document.getElementById('adminSignupPanel');
        const adminLogin = document.getElementById('adminLoginForm');
        
        if (adminSignup) adminSignup.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'block';
        
        const adminTab = document.querySelector('.login-tab-btn[data-login-tab="admin"]');
        if (adminTab) adminTab.click();
    });
}

const showForgotPassword = document.getElementById('showForgotPassword');
if (showForgotPassword) {
    showForgotPassword.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const studentLogin = document.getElementById('studentLoginForm');
        const adminLogin = document.getElementById('adminLoginForm');
        const forgotPanel = document.getElementById('forgotPasswordPanel');
        
        if (studentLogin) studentLogin.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'none';
        if (forgotPanel) forgotPanel.style.display = 'block';
    });
}

const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');
if (backToLoginFromForgot) {
    backToLoginFromForgot.addEventListener('click', (e) => { 
        e.preventDefault(); 
        const forgotPanel = document.getElementById('forgotPasswordPanel');
        if (forgotPanel) forgotPanel.style.display = 'none';
        
        const activeTab = document.querySelector('.login-tab-btn.active');
        if (activeTab) activeTab.click();
    });
}

const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
if (sendResetCodeBtn) {
    sendResetCodeBtn.addEventListener('click', () => { 
        const email = document.getElementById('forgotEmail')?.value; 
        const user = [...usersDB.students, ...usersDB.admins].find(u => u.email === email); 
        if (user) { 
            const code = Math.floor(100000 + Math.random() * 900000).toString(); 
            resetCodes[email] = code; 
            showCustomNotification(`Reset code sent to ${email}`, 'info'); 
            const resetSection = document.getElementById('resetCodeSection');
            if (resetSection) resetSection.style.display = 'block';
        } else showCustomNotification('Email not found', 'error'); 
    });
}

const resetPasswordBtn = document.getElementById('resetPasswordBtn');
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', () => { 
        const email = document.getElementById('forgotEmail')?.value; 
        const code = document.getElementById('resetCode')?.value; 
        const newPassword = document.getElementById('newPassword')?.value; 
        if (resetCodes[email] === code) { 
            const student = usersDB.students.find(s => s.email === email); 
            const admin = usersDB.admins.find(a => a.email === email); 
            if (student) student.password = newPassword; 
            if (admin) admin.password = newPassword; 
            saveData(); 
            showCustomNotification('Password reset successfully!', 'success'); 
            const forgotPanel = document.getElementById('forgotPasswordPanel');
            if (forgotPanel) forgotPanel.style.display = 'none';
            
            const activeTab = document.querySelector('.login-tab-btn.active');
            if (activeTab) activeTab.click();
        } else showCustomNotification('Invalid code', 'error'); 
    });
}

const signupPassword = document.getElementById('signupPassword');
if (signupPassword) signupPassword.addEventListener('input', updatePasswordUI);

// Student Signup
const studentSignupSubmit = document.getElementById('studentSignupSubmitBtn');
if (studentSignupSubmit) {
    studentSignupSubmit.addEventListener('click', () => {
        const name = document.getElementById('signupFullName')?.value.trim();
        const password = document.getElementById('signupPassword')?.value;
        const confirm = document.getElementById('signupConfirmPassword')?.value;
        
        if (!name || !password) { 
            showCustomNotification('Fill all fields', 'error'); 
            return; 
        }
        if (password !== confirm) { 
            showCustomNotification('Passwords do not match', 'error'); 
            return; 
        }
        if (!updatePasswordUI()) { 
            showCustomNotification('Password requirements not met', 'error'); 
            return; 
        }
        
        const studentId = generateStudentId();
        usersDB.students.push({ 
            id: studentId, 
            password, 
            name, 
            email: null, 
            level: null, 
            sublevel: null, 
            strand: null, 
            program: null, 
            yearLevel: null, 
            registrationCompleted: false, 
            enrolledSubjects: [], 
            grades: {}, 
            attendance: {}, 
            loginCount: 0, 
            lastLogin: null,
            scheduleConfirmed: false,
            termType: 'Semester',
            termPeriod: '1st Semester'
        });
        saveData();
        customConsoleLog(`NEW STUDENT: ${name} (${studentId})`, 'success');
        showCustomNotification(`Account created! Student ID: ${studentId}`, 'success');
        
        const studentSignup = document.getElementById('studentSignupPanel');
        const studentLogin = document.getElementById('studentLoginForm');
        const loginStudentId = document.getElementById('loginStudentId');
        
        if (studentSignup) studentSignup.style.display = 'none';
        if (studentLogin) studentLogin.style.display = 'block';
        if (loginStudentId) loginStudentId.value = studentId;
        
        clearSavedCredentials();
    });
}

// Admin Signup
const adminSignupSubmit = document.getElementById('adminSignupSubmitBtn');
if (adminSignupSubmit) {
    adminSignupSubmit.addEventListener('click', () => {
        const name = document.getElementById('adminSignupFullName')?.value.trim();
        const email = document.getElementById('adminSignupEmail')?.value.trim();
        const password = document.getElementById('adminSignupPassword')?.value;
        const confirm = document.getElementById('adminSignupConfirmPassword')?.value;
        const adminCode = document.getElementById('adminRegCode')?.value;
        
        if (!name || !email || !password) { 
            showCustomNotification('Fill all fields', 'error'); 
            return; 
        }
        if (password !== confirm) { 
            showCustomNotification('Passwords do not match', 'error'); 
            return; 
        }
        if (adminCode !== 'ADMIN2024') { 
            showCustomNotification('Invalid admin code', 'error'); 
            return; 
        }
        if (usersDB.admins.some(a => a.email === email)) { 
            showCustomNotification('Admin exists', 'error'); 
            return; 
        }
        
        usersDB.admins.push({ email, password, name, lastLogin: null });
        saveData();
        customConsoleLog(`ADMIN CREATED: ${name} (${email})`, 'success');
        showCustomNotification('Admin account created!', 'success');
        
        const adminSignup = document.getElementById('adminSignupPanel');
        const adminLogin = document.getElementById('adminLoginForm');
        
        if (adminSignup) adminSignup.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'block';
        
        clearSavedCredentials();
    });
}

// Student Login
const studentLoginBtn = document.getElementById('studentLoginBtn');
if (studentLoginBtn) {
    studentLoginBtn.addEventListener('click', () => {
        const id = document.getElementById('loginStudentId')?.value.trim();
        const pwd = document.getElementById('loginStudentPassword')?.value;
        const student = usersDB.students.find(s => s.id === id && s.password === pwd);
        
        if (student) {
            currentUser = { type: 'student', data: student };
            student.loginCount = (student.loginCount || 0) + 1;
            student.lastLogin = new Date().toISOString();
            saveData();
            saveRememberedCredentials(id, pwd, false);
            showMainApp();
            updateUIAfterLogin();
            customConsoleLog(`STUDENT LOGIN: ${student.name} (${student.id})`, 'success');
            showCustomNotification(`Welcome back, ${student.name}!`, 'success');
            switchContent('dashboard');
        } else showCustomNotification('Invalid credentials', 'error');
    });
}

// Admin Login
const adminLoginBtn = document.getElementById('adminLoginBtn');
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        const email = document.getElementById('loginAdminEmail')?.value.trim();
        const pwd = document.getElementById('loginAdminPassword')?.value;
        const admin = usersDB.admins.find(a => a.email === email && a.password === pwd);
        
        if (admin) {
            currentUser = { type: 'admin', data: admin };
            admin.lastLogin = new Date().toISOString();
            saveData();
            saveRememberedCredentials(email, pwd, true);
            showMainApp();
            updateUIAfterLogin();
            customConsoleLog(`ADMIN LOGIN: ${admin.name} (${email})`, 'success');
            showCustomNotification(`Welcome, ${admin.name}!`, 'success');
        } else showCustomNotification('Invalid credentials. Default: admin@school.edu / admin123', 'error');
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtnSidebar');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => { 
        currentUser = null; 
        showLoginPage(); 
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        
        if (sidebarUserName) sidebarUserName.textContent = 'Guest'; 
        if (sidebarUserRole) sidebarUserRole.textContent = 'Not logged in';
        showCustomNotification('Logged out successfully', 'info');
    });
}

// Custom Console Setup
const toggleConsoleBtn = document.getElementById('toggleConsoleBtn');
if (toggleConsoleBtn) toggleConsoleBtn.addEventListener('click', showCustomConsole);

const closeConsoleBtn = document.getElementById('closeConsoleBtn');
if (closeConsoleBtn) closeConsoleBtn.addEventListener('click', hideCustomConsole);

const clearConsoleBtn = document.getElementById('clearConsoleBtn');
if (clearConsoleBtn) clearConsoleBtn.addEventListener('click', clearCustomConsole);

const consoleExecuteBtn = document.getElementById('consoleExecuteBtn');
if (consoleExecuteBtn) consoleExecuteBtn.addEventListener('click', executeConsoleCommand);

const consoleCommandInput = document.getElementById('consoleCommandInput');
if (consoleCommandInput) {
    consoleCommandInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') executeConsoleCommand(); 
    });
}

// =====================================================================
// ============  NEW FEATURES (slot system, modify flow,        ========
// ============  schedule editor, admin approval, SMS OTP)       =======
// =====================================================================

const DEFAULT_SCHEDULE_CHANGE_LIMIT = 50;

if (!Array.isArray(usersDB.scheduleChangeRequests)) {
    usersDB.scheduleChangeRequests = [];
}

function ensureSlotFields(student) {
    if (typeof student.scheduleChangeLimit !== 'number') {
        student.scheduleChangeLimit = DEFAULT_SCHEDULE_CHANGE_LIMIT;
    }
    if (typeof student.scheduleChangesUsed !== 'number') {
        student.scheduleChangesUsed = 0;
    }
}

function getSlotsRemaining(student) {
    ensureSlotFields(student);
    return Math.max(0, student.scheduleChangeLimit - student.scheduleChangesUsed);
}

function persistCurrentStudent() {
    if (!currentUser || currentUser.type !== 'student') return;
    const idx = usersDB.students.findIndex(s => s.id === currentUser.data.id);
    if (idx !== -1) usersDB.students[idx] = JSON.parse(JSON.stringify(currentUser.data));
    saveData();
}

function deepCloneSubjects(subjects) {
    return JSON.parse(JSON.stringify(subjects || []));
}

// ============ TIME SLOT HELPERS ==========
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];

function parseFirstSlot(scheduleString) {
    if (!scheduleString) return { day: DAYS_OF_WEEK[0], time: TIME_SLOTS[0] };
    const part = scheduleString.split(';')[0].trim();
    for (const day of DAYS_OF_WEEK) {
        if (part.startsWith(day)) {
            const time = part.replace(day, '').trim();
            if (TIME_SLOTS.includes(time)) return { day, time };
            return { day, time: TIME_SLOTS[0] };
        }
    }
    return { day: DAYS_OF_WEEK[0], time: TIME_SLOTS[0] };
}

function buildScheduleString(day, time) {
    return `${day} ${time}`;
}

// ============ CONFIRM SCHEDULE - now also stores defaultSchedule snapshot ===
const _origConfirmSchedule = confirmSchedule;
confirmSchedule = function() {
    _origConfirmSchedule();
    if (currentUser && currentUser.type === 'student' && currentUser.data.enrolledSubjects?.length) {
        // Snapshot becomes the "default" schedule (only if not already set
        // for this enrollment). Clear any pending modification.
        currentUser.data.defaultSchedule = deepCloneSubjects(currentUser.data.enrolledSubjects);
        currentUser.data.modifiedSchedule = null;
        currentUser.data.modificationStatus = null;
        ensureSlotFields(currentUser.data);
        persistCurrentStudent();
    }
};
window.confirmSchedule = confirmSchedule;

// ============ MODIFY SCHEDULE FLOW ==========
// When user clicks "Modify Schedule" in self-enrollment, we:
//   1) Save selections as enrolledSubjects + defaultSchedule snapshot
//   2) Open the explanation modal
//   3) The "Go to Schedule Generator" button (already wired) takes them there
const modifyBtnEl = document.getElementById('modifyScheduleBtn');
if (modifyBtnEl) {
    modifyBtnEl.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        const selectedCheckboxes = document.querySelectorAll('.subject-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            showCustomNotification('Select at least one subject before modifying.', 'warning');
            return;
        }
        if (currentUser && currentUser.type === 'student' && pendingEnrollment) {
            const names = Array.from(selectedCheckboxes).map(cb => cb.value);
            const selectedSubjects = pendingEnrollment.subjects.filter(s => names.includes(s.name));
            currentUser.data.level = pendingEnrollment.levelInfo.level;
            currentUser.data.sublevel = pendingEnrollment.levelInfo.sublevel;
            currentUser.data.strand = pendingEnrollment.levelInfo.strand;
            currentUser.data.program = pendingEnrollment.levelInfo.program;
            currentUser.data.yearLevel = pendingEnrollment.levelInfo.year;
            currentUser.data.enrolledSubjects = selectedSubjects;
            currentUser.data.defaultSchedule = deepCloneSubjects(selectedSubjects);
            currentUser.data.modifiedSchedule = null;
            currentUser.data.modificationStatus = null;
            currentUser.data.scheduleConfirmed = true;
            currentUser.data.termType = document.getElementById('academicTermSelect')?.value || 'Semester';
            currentUser.data.termPeriod = document.getElementById('termPeriodSelect')?.value || '1st Semester';
            ensureSlotFields(currentUser.data);
            persistCurrentStudent();
            unlockScheduleGenerator();
            customConsoleLog(`Default schedule saved (${selectedSubjects.length} subjects). User chose Modify path.`, 'info');
        }
        const modal = document.getElementById('scheduleModifyModal');
        if (modal) modal.style.display = 'flex';
    }, true);
}

// ============ SCHEDULE EDITOR (sched-gen-1) ==========
let scheduleDraft = null;  // working copy of enrolledSubjects with user's edits

function getEffectiveSchedule() {
    if (!currentUser || !currentUser.data) return [];
    return currentUser.data.enrolledSubjects || [];
}

function initScheduleDraft() {
    scheduleDraft = deepCloneSubjects(getEffectiveSchedule());
}

function renderSubjectScheduleEditor() {
    const container = document.getElementById('subjectEditorList');
    const wrapper = document.getElementById('subjectScheduleEditor');
    const slotIndicator = document.getElementById('scheduleSlotIndicator');
    if (!container || !wrapper) return;
    if (!currentUser || currentUser.type !== 'student') {
        wrapper.style.display = 'none';
        if (slotIndicator) slotIndicator.style.display = 'none';
        return;
    }
    if (!scheduleDraft || scheduleDraft.length === 0) {
        wrapper.style.display = 'none';
        if (slotIndicator) slotIndicator.style.display = 'none';
        return;
    }

    ensureSlotFields(currentUser.data);
    if (slotIndicator) {
        slotIndicator.style.display = 'flex';
        const remEl = document.getElementById('slotsRemainingDisplay');
        const limEl = document.getElementById('slotsLimitDisplay');
        if (remEl) remEl.textContent = getSlotsRemaining(currentUser.data);
        if (limEl) limEl.textContent = currentUser.data.scheduleChangeLimit;
    }

    wrapper.style.display = 'block';
    let html = '';
    scheduleDraft.forEach((subj, idx) => {
        const slot = parseFirstSlot(subj.schedule);
        const defaultSubj = (currentUser.data.defaultSchedule || [])[idx];
        const defaultSlot = defaultSubj ? parseFirstSlot(defaultSubj.schedule) : slot;
        const dirty = (slot.day !== defaultSlot.day || slot.time !== defaultSlot.time);
        html += `<div class="subject-editor-row${dirty ? ' dirty' : ''}" data-row-idx="${idx}">
            <div class="subject-editor-name">${escapeHtml(subj.name)}</div>
            <select class="subject-editor-day" data-idx="${idx}">
                ${DAYS_OF_WEEK.map(d => `<option value="${d}" ${d === slot.day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            <select class="subject-editor-time" data-idx="${idx}">
                ${TIME_SLOTS.map(t => `<option value="${t}" ${t === slot.time ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
        </div>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.subject-editor-day, .subject-editor-time').forEach(sel => {
        sel.addEventListener('change', function() {
            const idx = parseInt(this.getAttribute('data-idx'), 10);
            const row = this.closest('.subject-editor-row');
            const day = row.querySelector('.subject-editor-day').value;
            const time = row.querySelector('.subject-editor-time').value;
            scheduleDraft[idx].schedule = buildScheduleString(day, time);
            // Live re-render canvas and toggle dirty flag
            renderScheduleTable(scheduleDraft, 'scheduleResult');
            const defaultSubj = (currentUser.data.defaultSchedule || [])[idx];
            const defaultSlot = defaultSubj ? parseFirstSlot(defaultSubj.schedule) : { day, time };
            const dirty = (day !== defaultSlot.day || time !== defaultSlot.time);
            row.classList.toggle('dirty', dirty);
        });
    });
}

function getDirtySubjects() {
    if (!currentUser || !currentUser.data || !scheduleDraft) return [];
    const def = currentUser.data.defaultSchedule || [];
    const dirty = [];
    scheduleDraft.forEach((subj, idx) => {
        const cur = parseFirstSlot(subj.schedule);
        const orig = def[idx] ? parseFirstSlot(def[idx].schedule) : cur;
        if (cur.day !== orig.day || cur.time !== orig.time) {
            dirty.push({
                name: subj.name,
                from: buildScheduleString(orig.day, orig.time),
                to: buildScheduleString(cur.day, cur.time)
            });
        }
    });
    return dirty;
}

function submitScheduleChangeRequest() {
    if (!currentUser || currentUser.type !== 'student') return;
    if (!scheduleDraft || scheduleDraft.length === 0) {
        showCustomNotification('No schedule loaded to modify.', 'warning');
        return;
    }
    const dirty = getDirtySubjects();
    if (dirty.length === 0) {
        showCustomNotification('No changes to submit. Adjust at least one subject\'s day or time first.', 'warning');
        return;
    }
    ensureSlotFields(currentUser.data);
    if (getSlotsRemaining(currentUser.data) <= 0) {
        showCustomNotification(`Slot limit reached (${currentUser.data.scheduleChangeLimit}). Ask the developer to reset your slots.`, 'error');
        return;
    }

    const req = {
        id: 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        studentId: currentUser.data.id,
        studentName: currentUser.data.name,
        defaultSchedule: deepCloneSubjects(currentUser.data.defaultSchedule || []),
        modifiedSchedule: deepCloneSubjects(scheduleDraft),
        changes: dirty,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        reviewedAt: null,
        reviewedBy: null
    };
    usersDB.scheduleChangeRequests.push(req);

    currentUser.data.modifiedSchedule = deepCloneSubjects(scheduleDraft);
    currentUser.data.modificationStatus = 'pending';
    currentUser.data.scheduleChangesUsed = (currentUser.data.scheduleChangesUsed || 0) + 1;
    persistCurrentStudent();

    customConsoleLog(`Schedule change request ${req.id} submitted (${dirty.length} edits, ${getSlotsRemaining(currentUser.data)} slots left)`, 'success');
    showCustomNotification(`✅ ${dirty.length} change(s) submitted for admin approval. Slots remaining: ${getSlotsRemaining(currentUser.data)}.`, 'success');
    renderSubjectScheduleEditor();
    updatePendingRequestsBadge();
}

function resetScheduleDraftToDefault() {
    if (!currentUser || !currentUser.data || !currentUser.data.defaultSchedule) {
        showCustomNotification('No default schedule to reset to.', 'warning');
        return;
    }
    scheduleDraft = deepCloneSubjects(currentUser.data.defaultSchedule);
    renderScheduleTable(scheduleDraft, 'scheduleResult');
    renderSubjectScheduleEditor();
    showCustomNotification('Schedule reset to default.', 'info');
}

const submitChangeBtn = document.getElementById('submitScheduleChangeBtn');
if (submitChangeBtn) submitChangeBtn.addEventListener('click', submitScheduleChangeRequest);
const resetChangeBtn = document.getElementById('resetScheduleBtn');
if (resetChangeBtn) resetChangeBtn.addEventListener('click', resetScheduleDraftToDefault);

// ============ SCHED-GEN: apply preferred-time / preferred-days filter ==========
// Replaces the trivial generateSchedule with one that actually re-orders the
// schedule grid based on the user's preferences and uses the live draft.
generateSchedule = function() {
    if (!currentUser) {
        showCustomNotification('Please login first', 'warning');
        return;
    }
    if (!scheduleDraft || scheduleDraft.length === 0) {
        initScheduleDraft();
    }
    const subjects = scheduleDraft;
    if (!subjects || subjects.length === 0) {
        showCustomNotification('No subjects enrolled yet', 'warning');
        return;
    }

    const prefTime = document.getElementById('preferredTime')?.value || 'any';
    const prefDays = document.getElementById('preferredDays')?.value || 'all';

    const allowedDays = (
        prefDays === 'mon-wed-fri' ? ['Monday', 'Wednesday', 'Friday'] :
        prefDays === 'tue-thu' ? ['Tuesday', 'Thursday'] :
        DAYS_OF_WEEK
    );
    const allowedTimes = (
        prefTime === 'morning' ? ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM'] :
        prefTime === 'afternoon' ? ['1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM'] :
        TIME_SLOTS
    );

    // Reassign slots: for any subject whose current slot violates the
    // preferences, move it to the next available allowed slot.
    const occupied = new Set();
    subjects.forEach(s => {
        const cur = parseFirstSlot(s.schedule);
        const okDay = allowedDays.includes(cur.day);
        const okTime = allowedTimes.includes(cur.time);
        if (okDay && okTime) {
            const key = `${cur.day}|${cur.time}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                return;
            }
        }
        // Find a free allowed slot
        for (const d of allowedDays) {
            for (const t of allowedTimes) {
                const key = `${d}|${t}`;
                if (!occupied.has(key)) {
                    occupied.add(key);
                    s.schedule = buildScheduleString(d, t);
                    return;
                }
            }
        }
        // No free slot — keep the original
    });

    // Refresh the badge list
    const preview = document.getElementById('enrolledSubjectsListPreview');
    if (preview) {
        preview.innerHTML = '';
        subjects.forEach(function(subject) {
            const badge = document.createElement('span');
            badge.className = 'enrolled-preview-badge';
            badge.innerHTML = escapeHtml(subject.name);
            preview.appendChild(badge);
        });
    }

    renderScheduleTable(subjects, 'scheduleResult');
    renderSubjectScheduleEditor();
    showCustomNotification(`Schedule generated! (${prefTime}, ${prefDays}) — edit any subject below to customize.`, 'success');
};
window.generateSchedule = generateSchedule;

// Re-bind generate button (the original handler captured the old reference)
const genBtnRebind = document.getElementById('generateCustomScheduleBtn');
if (genBtnRebind) {
    const newBtn = genBtnRebind.cloneNode(true);
    genBtnRebind.parentNode.replaceChild(newBtn, genBtnRebind);
    newBtn.addEventListener('click', generateSchedule);
}

// Hook into switchContent so opening sched-gen seeds the draft + editor.
const _origSwitchContent = switchContent;
switchContent = function(action) {
    _origSwitchContent(action);
    if (action === 'sched-gen-1' && currentUser && currentUser.type === 'student') {
        initScheduleDraft();
        renderScheduleTable(scheduleDraft, 'scheduleResult');
        renderSubjectScheduleEditor();
    }
    if (action === 'updates' && currentUser && currentUser.type === 'admin') {
        renderRequestsPanel();
    }
    if (action === 'dashboard' && currentUser && currentUser.type === 'student') {
        renderScheduleHistorySection();
    }
};

// Sched-gen nav "data-action" link bypasses our wrapper because it was
// captured earlier — re-bind those nav handlers.
document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
    const fresh = link.cloneNode(true);
    link.parentNode.replaceChild(fresh, link);
    fresh.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser && !isDeveloperModeActive) {
            showCustomNotification('Please login first', 'warning');
            return;
        }
        if (isDeveloperModeActive) {
            showCustomNotification('Exit developer mode to access features', 'warning');
            return;
        }
        switchContent(fresh.getAttribute('data-action'));
    });
});

// ============ DASHBOARD: show default vs modified schedule history =========
function renderScheduleHistorySection() {
    const section = document.getElementById('scheduleHistorySection');
    if (!section || !currentUser || currentUser.type !== 'student') return;
    const data = currentUser.data;
    const hasDefault = Array.isArray(data.defaultSchedule) && data.defaultSchedule.length > 0;
    const hasModified = Array.isArray(data.modifiedSchedule) && data.modifiedSchedule.length > 0;
    if (!hasDefault && !hasModified) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';

    const defaultEl = document.getElementById('defaultScheduleDisplay');
    const modifiedEl = document.getElementById('modifiedScheduleDisplay');
    const statusEl = document.getElementById('modifiedScheduleStatus');

    if (defaultEl) {
        if (hasDefault) {
            renderScheduleTable(data.defaultSchedule, 'defaultScheduleDisplay');
        } else {
            defaultEl.innerHTML = '<p style="color:#888;">No default schedule on file.</p>';
        }
    }
    if (modifiedEl) {
        if (hasModified) {
            renderScheduleTable(data.modifiedSchedule, 'modifiedScheduleDisplay');
        } else {
            modifiedEl.innerHTML = '<p style="color:#888;">No modification submitted yet. Use the Schedule Generator to propose one.</p>';
        }
    }
    if (statusEl) {
        const st = data.modificationStatus || (hasModified ? 'pending' : '');
        statusEl.textContent = st ? st.toUpperCase() : '';
        statusEl.className = 'schedule-status-badge' + (st ? ' ' + st : '');
        statusEl.style.display = st ? 'inline-block' : 'none';
    }
}

// Augment updateDashboard to also refresh the history section
const _origUpdateDashboard = updateDashboard;
updateDashboard = function() {
    _origUpdateDashboard();
    renderScheduleHistorySection();
};
window.updateDashboard = updateDashboard;

// ============ ADMIN: pending change requests panel =========
function getPendingRequestCount() {
    return (usersDB.scheduleChangeRequests || []).filter(r => r.status === 'pending').length;
}

function updatePendingRequestsBadge() {
    const badge = document.getElementById('pendingRequestsBadge');
    if (!badge) return;
    const count = getPendingRequestCount();
    if (count > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = count;
    } else {
        badge.style.display = 'none';
    }
}

function renderRequestsPanel() {
    const container = document.getElementById('requestsList');
    if (!container) return;
    const pending = (usersDB.scheduleChangeRequests || []).filter(r => r.status === 'pending');
    if (pending.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No pending schedule change requests.</p></div>';
        updatePendingRequestsBadge();
        return;
    }
    let html = '';
    pending.forEach(req => {
        const submitted = new Date(req.submittedAt).toLocaleString();
        const changeLines = (req.changes || []).map(c =>
            `<div class="request-change-line"><strong>${escapeHtml(c.name)}</strong> <span class="old">${escapeHtml(c.from)}</span> → <span class="new">${escapeHtml(c.to)}</span></div>`
        ).join('');
        html += `<div class="request-card" data-req-id="${req.id}">
            <div class="request-card-header">
                <div><strong>${escapeHtml(req.studentName || req.studentId)}</strong><br><small>${escapeHtml(req.studentId)} • ${changeLines.length ? (req.changes.length + ' change(s)') : 'no diff'}</small></div>
                <small>${submitted}</small>
            </div>
            <div class="request-changes">${changeLines || '<small style="color:#888;">No diff recorded.</small>'}</div>
            <div class="request-actions">
                <button class="reject-btn" data-action="reject" data-req-id="${req.id}"><i class="fas fa-xmark"></i> Reject</button>
                <button class="approve-btn" data-action="approve" data-req-id="${req.id}"><i class="fas fa-check"></i> Approve</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.approve-btn, .reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reqId = this.getAttribute('data-req-id');
            const action = this.getAttribute('data-action');
            handleRequestDecision(reqId, action);
        });
    });
    updatePendingRequestsBadge();
}

function handleRequestDecision(requestId, action) {
    const req = (usersDB.scheduleChangeRequests || []).find(r => r.id === requestId);
    if (!req) return;
    const student = usersDB.students.find(s => s.id === req.studentId);
    if (!student) {
        showCustomNotification('Student not found for this request.', 'error');
        return;
    }
    if (action === 'approve') {
        student.enrolledSubjects = deepCloneSubjects(req.modifiedSchedule);
        student.defaultSchedule = deepCloneSubjects(req.modifiedSchedule);
        student.modifiedSchedule = null;
        student.modificationStatus = 'approved';
        req.status = 'approved';
        customConsoleLog(`Approved request ${req.id} for ${student.name}`, 'success');
        showCustomNotification(`Approved schedule change for ${student.name}.`, 'success');
    } else if (action === 'reject') {
        student.modifiedSchedule = null;
        student.modificationStatus = 'rejected';
        req.status = 'rejected';
        customConsoleLog(`Rejected request ${req.id} for ${student.name}`, 'warning');
        showCustomNotification(`Rejected schedule change for ${student.name}.`, 'info');
    }
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = currentUser?.data?.email || 'admin';

    // If the affected student is the one currently logged in, mirror updates
    if (currentUser?.type === 'student' && currentUser.data.id === student.id) {
        currentUser.data = student;
    }
    saveData();
    renderRequestsPanel();
}

// Wire the new admin "requests" tab. The original tab handler already toggles
// .admin-panel; we only need to rebind so the new tab actually exists in its
// element list.
document.querySelectorAll('.admin-tab').forEach(tab => {
    const fresh = tab.cloneNode(true);
    tab.parentNode.replaceChild(fresh, tab);
    fresh.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-admin-tab');
        const map = {
            'schedule': 'scheduleChangePanel',
            'room': 'roomChangePanel',
            'professor': 'professorChangePanel',
            'requests': 'requestsPanel'
        };
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active-panel'));
        const panel = document.getElementById(map[target]);
        if (panel) panel.classList.add('active-panel');
        if (target === 'requests') renderRequestsPanel();
    });
});

// ============ ADMIN SIGNUP — SMS OTP ==========
let pendingAdminOtp = null; // { code, phone, expiresAt }

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function showOtpModal(phone, code) {
    const modal = document.getElementById('otpSentModal');
    if (!modal) return;
    const phoneEl = document.getElementById('otpModalPhone');
    const codeEl = document.getElementById('otpModalCode');
    if (phoneEl) phoneEl.textContent = phone;
    if (codeEl) codeEl.textContent = code;
    modal.style.display = 'flex';
    startOtpCountdown();
}

let otpCountdownTimer = null;
function startOtpCountdown() {
    if (otpCountdownTimer) clearInterval(otpCountdownTimer);
    const el = document.getElementById('otpExpiryCountdown');
    if (!el || !pendingAdminOtp) return;
    const tick = () => {
        const remaining = Math.max(0, pendingAdminOtp.expiresAt - Date.now());
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        el.textContent = `${m}:${String(s).padStart(2, '0')}`;
        if (remaining <= 0) {
            clearInterval(otpCountdownTimer);
            otpCountdownTimer = null;
        }
    };
    tick();
    otpCountdownTimer = setInterval(tick, 1000);
}

function closeOtpModal() {
    const modal = document.getElementById('otpSentModal');
    if (modal) modal.style.display = 'none';
}
window.closeOtpModal = closeOtpModal;

const sendOtpBtn = document.getElementById('adminSendOtpBtn');
if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
        const phone = document.getElementById('adminSignupPhone')?.value.trim();
        if (!phone || phone.replace(/\D/g, '').length < 7) {
            showCustomNotification('Enter a valid mobile number first.', 'warning');
            return;
        }
        const code = generateOtpCode();
        pendingAdminOtp = {
            code,
            phone,
            expiresAt: Date.now() + 5 * 60 * 1000
        };
        const hint = document.getElementById('adminOtpHint');
        if (hint) hint.textContent = `Code sent to ${phone} • Expires in 5 min. Resend if needed.`;
        sendOtpBtn.textContent = 'Resend';
        showOtpModal(phone, code);
        customConsoleLog(`SMS OTP issued (simulated): ${code} → ${phone}`, 'info');
    });
}

// Replace the previous admin-code signup handler entirely.
const adminSignupBtnNew = document.getElementById('adminSignupSubmitBtn');
if (adminSignupBtnNew) {
    const fresh = adminSignupBtnNew.cloneNode(true);
    adminSignupBtnNew.parentNode.replaceChild(fresh, adminSignupBtnNew);
    fresh.addEventListener('click', () => {
        const name = document.getElementById('adminSignupFullName')?.value.trim();
        const email = document.getElementById('adminSignupEmail')?.value.trim();
        const password = document.getElementById('adminSignupPassword')?.value;
        const confirm = document.getElementById('adminSignupConfirmPassword')?.value;
        const phone = document.getElementById('adminSignupPhone')?.value.trim();
        const otpEntered = document.getElementById('adminOtpInput')?.value.trim();

        if (!name || !email || !password || !phone) {
            showCustomNotification('Fill all fields including mobile number.', 'error');
            return;
        }
        if (password !== confirm) {
            showCustomNotification('Passwords do not match', 'error');
            return;
        }
        if (!pendingAdminOtp) {
            showCustomNotification('Click "Send Code" first to receive your SMS verification code.', 'warning');
            return;
        }
        if (Date.now() > pendingAdminOtp.expiresAt) {
            showCustomNotification('Verification code expired. Click "Resend" to get a new one.', 'error');
            return;
        }
        if (otpEntered !== pendingAdminOtp.code) {
            showCustomNotification('Incorrect verification code.', 'error');
            return;
        }
        if (pendingAdminOtp.phone !== phone) {
            showCustomNotification('The verification code was sent to a different number. Click "Resend" for the current number.', 'warning');
            return;
        }
        if (usersDB.admins.some(a => a.email === email)) {
            showCustomNotification('Admin with this email already exists.', 'error');
            return;
        }

        usersDB.admins.push({ email, password, name, phone, lastLogin: null, createdAt: new Date().toISOString() });
        saveData();
        pendingAdminOtp = null;
        customConsoleLog(`ADMIN CREATED via SMS OTP: ${name} (${email}, ${phone})`, 'success');
        showCustomNotification('Admin account created!', 'success');

        const adminSignup = document.getElementById('adminSignupPanel');
        const adminLogin = document.getElementById('adminLoginForm');
        if (adminSignup) adminSignup.style.display = 'none';
        if (adminLogin) adminLogin.style.display = 'block';
        clearSavedCredentials();
    });
}

// ============ DEV MODE: extend terminal with slot commands ==========
function devExecuteSlotCommand(cmd) {
    // setlimit <studentIdOrAll> <number>
    // resetslots <studentIdOrAll>
    // listslots
    const parts = cmd.trim().split(/\s+/);
    const head = (parts[0] || '').toLowerCase();
    if (head === 'setlimit') {
        const target = parts[1];
        const n = parseInt(parts[2], 10);
        if (!target || isNaN(n) || n < 0) return 'Usage: setlimit <studentId|all> <number>';
        let touched = 0;
        usersDB.students.forEach(s => {
            if (target === 'all' || s.id === target) {
                s.scheduleChangeLimit = n;
                touched++;
            }
        });
        saveData();
        return `Updated limit to ${n} for ${touched} student(s).`;
    }
    if (head === 'resetslots') {
        const target = parts[1];
        if (!target) return 'Usage: resetslots <studentId|all>';
        let touched = 0;
        usersDB.students.forEach(s => {
            if (target === 'all' || s.id === target) {
                s.scheduleChangesUsed = 0;
                touched++;
            }
        });
        saveData();
        return `Reset slot usage for ${touched} student(s).`;
    }
    if (head === 'listslots') {
        if (usersDB.students.length === 0) return 'No students.';
        return usersDB.students.map(s => {
            ensureSlotFields(s);
            return `${s.id} (${s.name}): ${s.scheduleChangesUsed}/${s.scheduleChangeLimit} used`;
        }).join('\n');
    }
    if (head === 'requests') {
        const list = usersDB.scheduleChangeRequests || [];
        if (list.length === 0) return 'No requests on file.';
        return list.map(r => `${r.id} ${r.status} student=${r.studentId} edits=${(r.changes||[]).length}`).join('\n');
    }
    return null; // not handled
}

// Hook into the developer terminal (#devTerminalCommand). The original handler
// is in the codebase too; we add a listener so our command runs FIRST and only
// echoes "Unknown" if neither path handles it.
const devTerminalInputEl = document.getElementById('devTerminalCommand');
const devTerminalExecBtn = document.getElementById('devTerminalExecute');
function runDevSlotCommand() {
    const cmd = (devTerminalInputEl?.value || '').trim();
    if (!cmd) return;
    const out = devExecuteSlotCommand(cmd);
    if (out !== null) {
        addTerminalLine(`> ${cmd}`, 'action');
        out.split('\n').forEach(line => addTerminalLine(line, 'info'));
        if (devTerminalInputEl) devTerminalInputEl.value = '';
    }
}
if (devTerminalExecBtn) devTerminalExecBtn.addEventListener('click', runDevSlotCommand, true);
if (devTerminalInputEl) {
    devTerminalInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runDevSlotCommand();
    }, true);
}

// On boot: refresh badge so admins see pending count immediately
updatePendingRequestsBadge();

// ============ COLLEGE PROGRAM DROPDOWN + CUSTOM PROGRAM MANAGER ==========

// Standard 14-subject curriculum builder for new programs.
// 7 program-major subjects + 7 GE/PE/NSTP per year. Used for both
// the 5 built-in extras below and any program added via admin UI.
const _COMMON_GE_BY_YEAR = {
    "1st Year": [
        { name: "Mathematics in the Modern World", units: 3 },
        { name: "Purposive Communication", units: 3 },
        { name: "Understanding the Self", units: 3 },
        { name: "Readings in Philippine History", units: 3 },
        { name: "Art Appreciation", units: 3 },
        { name: "PE 1 - Movement Enhancement", units: 2 },
        { name: "NSTP 1 - CWTS", units: 3 }
    ],
    "2nd Year": [
        { name: "The Contemporary World", units: 3 },
        { name: "Science, Technology and Society", units: 3 },
        { name: "Ethics", units: 3 },
        { name: "Filipino sa Iba't Ibang Disiplina", units: 3 },
        { name: "Life and Works of Rizal", units: 3 },
        { name: "PE 2 - Rhythmic Activities", units: 2 },
        { name: "NSTP 2 - CWTS", units: 3 }
    ],
    "3rd Year": [
        { name: "Research Methods", units: 3 },
        { name: "Technical Writing", units: 3 },
        { name: "Statistics and Probability", units: 3 },
        { name: "Foreign Language Elective", units: 3 },
        { name: "Free Elective 1", units: 3 },
        { name: "PE 3 - Team Sports", units: 2 },
        { name: "Professional Ethics", units: 3 }
    ],
    "4th Year": [
        { name: "Capstone / Thesis 1", units: 3 },
        { name: "Capstone / Thesis 2", units: 3 },
        { name: "Internship / Practicum", units: 6 },
        { name: "Industry Seminar", units: 1 },
        { name: "Free Elective 2", units: 3 },
        { name: "Strategic Planning", units: 3 },
        { name: "Leadership and Management", units: 3 }
    ]
};

function buildStandardYear(majorSubjects, year) {
    const ge = (_COMMON_GE_BY_YEAR[year] || []).map(s =>
        ({ ...s, room: "RM 100", professor: "TBA", category: "ge" })
    );
    const majors = majorSubjects.map(s => ({
        room: s.room || "RM 200",
        professor: s.professor || "TBA",
        category: s.category || "major",
        units: s.units || 3,
        ...s
    }));
    return [...majors.slice(0, 7), ...ge.slice(0, Math.max(0, 14 - majors.slice(0, 7).length))];
}

// 5 extra built-in programs (CHED-aligned major titles per year).
const _EXTRA_BUILTIN_PROGRAMS = {
    "Bachelor of Science in Business Administration": {
        majors: {
            "1st Year": ["Principles of Management", "Microeconomics", "Financial Accounting 1", "Business Mathematics", "Introduction to Business", "Marketing Principles", "Business Communication"],
            "2nd Year": ["Macroeconomics", "Financial Accounting 2", "Operations Management", "Human Resource Management", "Business Statistics", "Money and Banking", "Organizational Behavior"],
            "3rd Year": ["Strategic Management", "Business Law", "Taxation", "Investment and Portfolio Mgmt", "Entrepreneurship", "International Business", "Business Research"],
            "4th Year": ["Capstone in Business", "Business Policy and Strategy", "Corporate Governance", "Risk Management", "Business Internship", "Innovation Management", "Global Trade Operations"]
        }
    },
    "Bachelor of Science in Accountancy": {
        majors: {
            "1st Year": ["Financial Accounting 1", "Financial Accounting 2", "Business Mathematics", "Microeconomics", "Principles of Management", "Business Communication", "Computer Fundamentals for Accountants"],
            "2nd Year": ["Cost Accounting", "Intermediate Accounting 1", "Intermediate Accounting 2", "Macroeconomics", "Statistics for Accountants", "Business Law", "Income Taxation"],
            "3rd Year": ["Auditing Theory", "Advanced Accounting 1", "Advanced Accounting 2", "Management Advisory Services", "Business Taxation", "Auditing Practice", "Accounting Information Systems"],
            "4th Year": ["CPA Review - FAR", "CPA Review - AFAR", "CPA Review - Audit", "CPA Review - Tax", "Accountancy Internship", "Government Accounting", "Capstone Audit Case"]
        }
    },
    "Bachelor of Science in Civil Engineering": {
        majors: {
            "1st Year": ["Engineering Drawing 1", "Calculus 1", "Chemistry for Engineers", "Engineering Mechanics - Statics", "Computer-Aided Drafting", "Physics for Engineers 1", "Workshop Theory and Practice"],
            "2nd Year": ["Calculus 2", "Differential Equations", "Strength of Materials", "Surveying 1", "Engineering Mechanics - Dynamics", "Construction Materials and Testing", "Physics for Engineers 2"],
            "3rd Year": ["Hydraulics", "Structural Theory", "Reinforced Concrete Design", "Steel Design", "Geotechnical Engineering 1", "Surveying 2", "Transportation Engineering"],
            "4th Year": ["CE Capstone Design", "Construction Project Management", "Earthquake Engineering", "Foundation Engineering", "CE Practicum", "Environmental Engineering", "Estimating and Costing"]
        }
    },
    "Bachelor of Science in Nursing": {
        majors: {
            "1st Year": ["Anatomy and Physiology", "Biochemistry for Nursing", "Theoretical Foundations of Nursing", "Nursing Informatics", "Health Assessment", "Microbiology and Parasitology", "Nutrition and Dietetics"],
            "2nd Year": ["Pharmacology", "Pathophysiology", "Care of Mother and Child 1", "Care of Adults 1", "Community Health Nursing 1", "Nursing Research 1", "Nursing Skills Lab"],
            "3rd Year": ["Care of Mother and Child 2", "Care of Adults 2", "Care of Older Persons", "Mental Health Nursing", "Community Health Nursing 2", "Nursing Research 2", "Pediatric Nursing"],
            "4th Year": ["Critical Care Nursing", "Leadership and Management in Nursing", "Disaster Nursing", "Nursing Practicum (Hospital)", "Nursing Practicum (Community)", "NCLEX Review", "Comprehensive Case Study"]
        }
    },
    "Bachelor of Elementary Education": {
        majors: {
            "1st Year": ["Child and Adolescent Learners", "The Teaching Profession", "Foundations of Special Education", "Facilitating Learner-Centered Teaching", "Building Inclusive Classrooms", "Educational Technology 1", "Field Study 1 - Observation"],
            "2nd Year": ["Curriculum Development", "Assessment of Learning 1", "Teaching Math in Elementary", "Teaching Science in Elementary", "Educational Technology 2", "Field Study 2 - Experiencing the Learning Environment", "Teaching Reading"],
            "3rd Year": ["Teaching Filipino in Elementary", "Teaching English in Elementary", "Teaching Social Studies in Elementary", "Teaching Music, Arts, PE and Health", "Assessment of Learning 2", "Edukasyon sa Pagpapakatao", "Action Research in Education"],
            "4th Year": ["Practice Teaching - Internship", "Classroom Management", "School Culture and Organization", "Capstone Education Research", "Special Topics in Education", "Education Leadership", "Comprehensive Final Demo"]
        }
    }
};

(function seedExtraBuiltinPrograms() {
    Object.entries(_EXTRA_BUILTIN_PROGRAMS).forEach(([progName, def]) => {
        if (collegeCurriculum[progName]) return;
        const yearObj = {};
        Object.entries(def.majors).forEach(([year, titles]) => {
            const majorSubjs = titles.map(t => ({ name: t, room: "TBA", professor: "TBA", category: "major", units: 3 }));
            yearObj[year] = buildStandardYear(majorSubjs, year);
        });
        collegeCurriculum[progName] = yearObj;
    });
})();

// Hydrate any admin-created custom programs from storage
if (!Array.isArray(usersDB.customPrograms)) usersDB.customPrograms = [];
function hydrateCustomPrograms() {
    (usersDB.customPrograms || []).forEach(prog => {
        if (!collegeCurriculum[prog.name]) collegeCurriculum[prog.name] = {};
        Object.entries(prog.years || {}).forEach(([year, subjects]) => {
            collegeCurriculum[prog.name][year] = subjects;
        });
    });
}
hydrateCustomPrograms();

function populateCollegeProgramDropdown() {
    const sel = document.getElementById('collegeProgramSelect');
    if (!sel) return;
    const previousValue = sel.value;
    const programs = Object.keys(collegeCurriculum).sort();
    let html = '<option value="">— Select Program —</option>';
    programs.forEach(name => {
        const isCustom = (usersDB.customPrograms || []).some(p => p.name === name);
        const label = name.replace(/^Bachelor of (Science|Arts) in /, 'BS$1 ').replace('BSScience ', 'BS ').replace('BSArts ', 'AB ');
        html += `<option value="${escapeHtml(name)}">${escapeHtml(label)}${isCustom ? ' ★' : ''}</option>`;
    });
    sel.innerHTML = html;
    if (previousValue && programs.includes(previousValue)) sel.value = previousValue;
}
populateCollegeProgramDropdown();

// ============ ADMIN: ADD A PROGRAM/COURSE FORM ==========
function addProgramSubjectRow(prefill) {
    const list = document.getElementById('newProgramSubjectList');
    if (!list) return;
    const data = prefill || { name: '', units: 3, room: 'TBA', professor: 'TBA', category: 'major' };
    const row = document.createElement('div');
    row.className = 'program-subject-row';
    row.innerHTML = `
        <input type="text" class="ps-name" placeholder="Subject name" value="${escapeHtml(data.name)}">
        <input type="text" class="ps-room" placeholder="Room" value="${escapeHtml(data.room)}">
        <input type="text" class="ps-prof" placeholder="Professor" value="${escapeHtml(data.professor)}">
        <select class="ps-cat">
            ${['major','ge','elective','research','practicum'].map(c => `<option value="${c}" ${c === data.category ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <input type="number" class="ps-units" min="1" max="9" value="${data.units || 3}">
        <button type="button" class="remove-row-btn" title="Remove">×</button>
    `;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    list.appendChild(row);
}

function clearProgramForm() {
    const nameEl = document.getElementById('newProgramName');
    if (nameEl) nameEl.value = '';
    const list = document.getElementById('newProgramSubjectList');
    if (list) list.innerHTML = '';
    addProgramSubjectRow();
}

function readProgramFormSubjects() {
    const rows = document.querySelectorAll('#newProgramSubjectList .program-subject-row');
    const out = [];
    rows.forEach(r => {
        const name = r.querySelector('.ps-name').value.trim();
        if (!name) return;
        out.push({
            name,
            room: r.querySelector('.ps-room').value.trim() || 'TBA',
            professor: r.querySelector('.ps-prof').value.trim() || 'TBA',
            category: r.querySelector('.ps-cat').value,
            units: parseInt(r.querySelector('.ps-units').value, 10) || 3
        });
    });
    return out;
}

function saveProgramFromForm() {
    const name = document.getElementById('newProgramName')?.value.trim();
    const year = document.getElementById('newProgramYear')?.value;
    if (!name) { showCustomNotification('Enter a program name.', 'warning'); return; }
    if (!year) { showCustomNotification('Select a year level.', 'warning'); return; }
    const subjects = readProgramFormSubjects();
    if (subjects.length === 0) { showCustomNotification('Add at least one subject.', 'warning'); return; }

    if (!collegeCurriculum[name]) collegeCurriculum[name] = {};
    collegeCurriculum[name][year] = assignSchedulesToSubjects(subjects);

    let entry = (usersDB.customPrograms || []).find(p => p.name === name);
    if (!entry) {
        entry = { name, years: {}, addedAt: new Date().toISOString(), addedBy: currentUser?.data?.email || 'admin' };
        usersDB.customPrograms.push(entry);
    }
    entry.years[year] = collegeCurriculum[name][year];
    saveData();
    populateCollegeProgramDropdown();
    renderCustomProgramsList();
    customConsoleLog(`Saved program "${name}" - ${year} (${subjects.length} subjects)`, 'success');
    showCustomNotification(`✅ Program saved: ${name} — ${year} (${subjects.length} subjects).`, 'success');
    clearProgramForm();
}

function renderCustomProgramsList() {
    const container = document.getElementById('customProgramsList');
    if (!container) return;
    const list = usersDB.customPrograms || [];
    if (list.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No custom programs yet.</p></div>';
        return;
    }
    let html = '';
    list.forEach(p => {
        const years = Object.keys(p.years || {}).sort();
        const totalSubj = years.reduce((sum, y) => sum + (p.years[y]?.length || 0), 0);
        html += `<div class="custom-program-card">
            <div><strong>${escapeHtml(p.name)}</strong><br><small>${years.join(', ') || '—'} • ${totalSubj} subject(s)</small></div>
            <button type="button" class="delete-program-btn" data-program="${escapeHtml(p.name)}"><i class="fas fa-trash"></i> Delete</button>
        </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.delete-program-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.getAttribute('data-program');
            if (!confirm(`Delete the custom program "${name}"? This cannot be undone.`)) return;
            usersDB.customPrograms = (usersDB.customPrograms || []).filter(p => p.name !== name);
            delete collegeCurriculum[name];
            saveData();
            populateCollegeProgramDropdown();
            renderCustomProgramsList();
            showCustomNotification(`Deleted program "${name}".`, 'info');
        });
    });
}

const addProgSubjBtn = document.getElementById('addProgramSubjectBtn');
if (addProgSubjBtn) addProgSubjBtn.addEventListener('click', () => addProgramSubjectRow());
const saveProgBtn = document.getElementById('saveProgramBtn');
if (saveProgBtn) saveProgBtn.addEventListener('click', saveProgramFromForm);
const clearProgBtn = document.getElementById('clearProgramFormBtn');
if (clearProgBtn) clearProgBtn.addEventListener('click', clearProgramForm);
// Seed one empty row so the form is usable on first open
addProgramSubjectRow();
renderCustomProgramsList();

// Extend the admin-tab handler to include the new "programs" panel.
// The earlier rewrite of admin tabs (above) used a static map; extend it
// here so "programs" -> programsPanel works without rewriting that block.
document.querySelectorAll('.admin-tab[data-admin-tab="programs"]').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active-panel'));
        const panel = document.getElementById('programsPanel');
        if (panel) panel.classList.add('active-panel');
        renderCustomProgramsList();
    });
});

// ============ ADMIN DASHBOARD SUMMARY ==========
function renderAdminDashboardSummary() {
    if (!currentUser || currentUser.type !== 'admin') return;
    let card = document.getElementById('adminDashboardSummary');
    if (!card) {
        card = document.createElement('div');
        card.id = 'adminDashboardSummary';
        card.className = 'admin-dashboard-section';
        const dashContent = document.getElementById('dashboard-content');
        if (dashContent) dashContent.appendChild(card);
    }
    const totalStudentsCt = usersDB.students.length;
    const totalAdminsCt = usersDB.admins.length;
    const enrolledCt = usersDB.students.filter(s => (s.enrolledSubjects || []).length > 0).length;
    const pendingReqCt = getPendingRequestCount();
    const customProgCt = (usersDB.customPrograms || []).length;
    card.innerHTML = `
        <h3><i class="fas fa-gauge-high"></i> Administrator Overview</h3>
        <div class="admin-stat-grid">
            <div class="admin-stat-tile"><span class="num">${totalStudentsCt}</span><small>Total Students</small></div>
            <div class="admin-stat-tile"><span class="num">${enrolledCt}</span><small>Enrolled Students</small></div>
            <div class="admin-stat-tile"><span class="num">${totalAdminsCt}</span><small>Total Admins</small></div>
            <div class="admin-stat-tile"><span class="num">${pendingReqCt}</span><small>Pending Schedule Requests</small></div>
            <div class="admin-stat-tile"><span class="num">${Object.keys(collegeCurriculum).length}</span><small>College Programs Available</small></div>
            <div class="admin-stat-tile"><span class="num">${customProgCt}</span><small>Custom Programs Added</small></div>
        </div>
    `;
    card.style.display = 'block';
}

// Hide the admin overview when a STUDENT logs in afterward
const _origUpdateUIAfterLogin_admin = updateUIAfterLogin;
updateUIAfterLogin = function() {
    _origUpdateUIAfterLogin_admin();
    if (currentUser && currentUser.type === 'student') {
        const card = document.getElementById('adminDashboardSummary');
        if (card) card.style.display = 'none';
    }
};

// Make new helpers globally accessible
window.toggleDevPassword = toggleDevPassword;
window.deleteStudentFromDev = deleteStudentFromDev;
window.showCustomNotification = showCustomNotification;
window.closeModifyModal = closeModifyModal;
window.closeCredits = closeCredits;
window.togglePassword = togglePassword;
window.confirmSchedule = confirmSchedule;
window.modifySchedule = modifySchedule;
window.generateSchedule = generateSchedule;
window.submitScheduleChangeRequest = submitScheduleChangeRequest;
window.resetScheduleDraftToDefault = resetScheduleDraftToDefault;
window.renderRequestsPanel = renderRequestsPanel;

// ============ INITIALIZE ==========
setupLoginTabs();
initializeLoginPanels();
initSelfEnrollment();
showLoginPage();
customConsoleLog("System Ready - All Features Implemented", 'success');
customConsoleLog("Developer Mode: Click ⚡ (Code: 712189) | Admin: admin@school.edu / admin123", 'info');/* ============================================================================
   Algorithmic Agenda Apparatus — patches.js
   Novulution Tech
   ----------------------------------------------------------------------------
   Adds four features on top of the original script.js without modifying it:
     1. Sched. Gen.: multi-day subjects edit as a CONJOINED unit
     2. Self-Enrollment: real-time clash detection between ticked subjects
     3. Self-Enrollment: live unit total + confirm modal that defers
        un-ticked subjects to the next term period
     4. Updates page: admin chooses audience (All / Section / Specific
        Student); enrollment auto-assigns a section; section is visible
        in the Developer Mode student table
   ========================================================================== */

(function () {
    'use strict';

    // patches.js loads AFTER script.js, so all globals are already defined.
    // We still wait one tick so the script.js init listeners (already
    // attached) finish wiring before we re-clone any buttons.
    function whenReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            setTimeout(fn, 0);
        }
    }

    /* ====================================================================
       SHARED HELPERS (multi-slot aware)
       ==================================================================== */
    var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    var TIMES = [
        '8:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '1:00 PM - 3:00 PM',
        '3:00 PM - 5:00 PM'
    ];

    function dayIdx(d) { var i = DAYS.indexOf(d); return i < 0 ? 0 : i; }
    function timeIdx(t) { var i = TIMES.indexOf(t); return i < 0 ? 0 : i; }
    function clampDay(i)  { return Math.max(0, Math.min(DAYS.length - 1, i)); }
    function clampTime(i) { return Math.max(0, Math.min(TIMES.length - 1, i)); }

    // Parse a subject's full schedule string ("Mon 8-10; Wed 8-10") into
    // an array of {day, time} slots. Defaults to one slot if unparsable.
    function parseAllSlots(scheduleString) {
        if (!scheduleString) return [{ day: DAYS[0], time: TIMES[0] }];
        var parts = String(scheduleString).split(';').map(function (p) { return p.trim(); }).filter(Boolean);
        var slots = [];
        parts.forEach(function (part) {
            for (var i = 0; i < DAYS.length; i++) {
                var d = DAYS[i];
                if (part.indexOf(d) === 0) {
                    var rest = part.substring(d.length).trim();
                    var t = TIMES.indexOf(rest) >= 0 ? rest : TIMES[0];
                    slots.push({ day: d, time: t });
                    return;
                }
            }
        });
        return slots.length ? slots : [{ day: DAYS[0], time: TIMES[0] }];
    }

    function buildScheduleStringMulti(slots) {
        return slots.map(function (s) { return s.day + ' ' + s.time; }).join('; ');
    }

    function escHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function safeNotify(msg, kind) {
        if (typeof window.showCustomNotification === 'function') {
            try { window.showCustomNotification(msg, kind || 'info'); return; } catch (e) {}
        }
        try { console.log('[notify ' + (kind || 'info') + ']', msg); } catch (e) {}
    }

    function getCurrentUser() {
        return currentUser;
    }

    function getUsersDB() {
        return usersDB;
    }

    function persistAll() {
        if (typeof window.saveData === 'function') { try { window.saveData(); } catch (e) {} }
    }

    /* ====================================================================
       FEATURE 4 (part A): SECTIONS
       ==================================================================== */
    var SECTION_CAPACITY = 30;

    function shortLevelTag(student) {
        if (!student) return 'GEN';
        if (student.level === 'juniorHigh') {
            return 'JH-' + (student.sublevel || 'Gx').replace(/\s+/g, '');
        }
        if (student.level === 'seniorHigh') {
            var strand = (student.strand || 'GEN').replace(/\s+/g, '');
            var grade = (student.sublevel || 'Gx').replace(/\s+/g, '');
            return strand + '-' + grade;
        }
        if (student.level === 'college') {
            // Compress program name to initials, e.g.
            // "Bachelor of Science in Computer Science" -> "BSCS"
            var p = student.program || 'PROG';
            var compact = p
                .replace(/Bachelor of Science in /i, 'BS ')
                .replace(/Bachelor of Arts in /i, 'AB ')
                .replace(/Bachelor of /i, 'B ');
            var letters = compact.split(/\s+/).map(function (w) {
                return w && w[0] ? w[0].toUpperCase() : '';
            }).join('');
            if (!letters) letters = 'PROG';
            var year = (student.yearLevel || 'Yx').replace(/\s+/g, '').replace(/Year/i, 'Y');
            return letters + '-' + year;
        }
        return 'GEN';
    }

    function ensureSectionsStore() {
        var db = getUsersDB();
        if (!db) return null;
        if (!db.sectionAssignments || typeof db.sectionAssignments !== 'object') {
            db.sectionAssignments = {};
        }
        return db.sectionAssignments;
    }

    // Return the section ID this student should belong to. Reuses an
    // existing section with capacity, or opens the next letter (A, B, C…).
    function assignSectionToStudent(student) {
        if (!student) return null;
        var sections = ensureSectionsStore();
        if (sections === null) return null;
        if (student.section && sections[student.section]) {
            // Already assigned and the section still exists.
            if (sections[student.section].indexOf(student.id) === -1) {
                sections[student.section].push(student.id);
            }
            return student.section;
        }
        var prefix = shortLevelTag(student);
        // Find first existing section with this prefix that has capacity
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (var i = 0; i < letters.length; i++) {
            var id = prefix + '-' + letters[i];
            if (!sections[id]) sections[id] = [];
            if (sections[id].indexOf(student.id) === -1 &&
                sections[id].length >= SECTION_CAPACITY) continue;
            if (sections[id].indexOf(student.id) === -1) {
                sections[id].push(student.id);
            }
            student.section = id;
            return id;
        }
        // Fallback (more than 26 sections of one prefix — vanishingly unlikely)
        var fallback = prefix + '-AA';
        sections[fallback] = sections[fallback] || [];
        sections[fallback].push(student.id);
        student.section = fallback;
        return fallback;
    }

    // Migrate any existing students who don't have a section yet.
    function backfillSections() {
        var db = getUsersDB();
        if (!db || !Array.isArray(db.students)) return;
        var changed = false;
        db.students.forEach(function (s) {
            // Only assign sections to students who actually completed
            // self-enrollment (have a level + at least one enrolled subject)
            if (s && s.level && Array.isArray(s.enrolledSubjects) && s.enrolledSubjects.length > 0 && !s.section) {
                assignSectionToStudent(s);
                changed = true;
            }
        });
        if (changed) persistAll();
    }

    function getAllKnownSections() {
        var sections = ensureSectionsStore() || {};
        return Object.keys(sections).sort();
    }

    /* ====================================================================
       FEATURE 2 + 3: enrollment summary (units + clash) and confirm modal
       ==================================================================== */

    function gatherTickedSubjects() {
        var pending = pendingEnrollment;
        if (!pending || !Array.isArray(pending.subjects)) return [];
        var picked = [];
        var cards = document.querySelectorAll('#availableSubjectsList .subject-card');
        cards.forEach(function (card) {
            var cb = card.querySelector('.subject-checkbox');
            if (!cb || !cb.checked) return;
            var idx = parseInt(card.getAttribute('data-subject-index'), 10);
            if (!isNaN(idx) && pending.subjects[idx]) picked.push(pending.subjects[idx]);
        });
        return picked;
    }

    function gatherUntickedSubjects() {
        var pending = pendingEnrollment;
        if (!pending || !Array.isArray(pending.subjects)) return [];
        var unticked = [];
        var cards = document.querySelectorAll('#availableSubjectsList .subject-card');
        cards.forEach(function (card) {
            var cb = card.querySelector('.subject-checkbox');
            if (cb && cb.checked) return;
            var idx = parseInt(card.getAttribute('data-subject-index'), 10);
            if (!isNaN(idx) && pending.subjects[idx]) unticked.push(pending.subjects[idx]);
        });
        return unticked;
    }

    // Returns array of clash descriptions:
    //   [{ day, time, names: ['Subj A', 'Subj B'] }, ...]
    function detectClashes(subjects) {
        var grid = {};
        subjects.forEach(function (s) {
            var slots = parseAllSlots(s.schedule);
            slots.forEach(function (slot) {
                var key = slot.day + '|' + slot.time;
                if (!grid[key]) grid[key] = [];
                grid[key].push(s.name);
            });
        });
        var out = [];
        Object.keys(grid).forEach(function (k) {
            if (grid[k].length > 1) {
                var parts = k.split('|');
                out.push({ day: parts[0], time: parts[1], names: grid[k].slice() });
            }
        });
        return out;
    }

    function updateEnrollmentSummary() {
        var bar = document.getElementById('enrollmentSummaryBar');
        if (!bar) return;
        var ticked = gatherTickedSubjects();
        var anyCardsExist = document.querySelectorAll('#availableSubjectsList .subject-card').length > 0;
        bar.style.display = anyCardsExist ? 'flex' : 'none';

        var countEl = document.getElementById('summarySelectedCount');
        var unitsEl = document.getElementById('summaryTotalUnits');
        var clashBox = document.getElementById('summaryClashBox');
        var clashText = document.getElementById('summaryClashText');

        if (countEl) countEl.textContent = ticked.length;
        var totalUnits = ticked.reduce(function (sum, s) {
            var u = parseInt(s.units, 10);
            return sum + (isNaN(u) ? 0 : u);
        }, 0);
        if (unitsEl) unitsEl.textContent = totalUnits;

        var clashes = detectClashes(ticked);
        if (clashBox && clashText) {
            if (clashes.length === 0) {
                clashBox.style.display = 'none';
                clashBox.classList.remove('clash-active');
            } else {
                clashBox.style.display = 'flex';
                clashBox.classList.add('clash-active');
                var first = clashes[0];
                var more = clashes.length > 1 ? ' (and ' + (clashes.length - 1) + ' more)' : '';
                clashText.innerHTML =
                    '<strong>SCHEDULE CLASH:</strong> ' +
                    escHtml(first.names.join(' ↔ ')) +
                    ' overlap on <strong>' + escHtml(first.day) + ' ' + escHtml(first.time) + '</strong>' +
                    escHtml(more) + '. Untick one to resolve.';
            }
        }

        // Decorate the cards themselves so the user can spot the clashing pair
        var clashKeys = {};
        clashes.forEach(function (c) {
            c.names.forEach(function (n) { clashKeys[n] = true; });
        });
        document.querySelectorAll('#availableSubjectsList .subject-card').forEach(function (card) {
            var cb = card.querySelector('.subject-checkbox');
            if (!cb) return;
            var name = cb.value;
            if (cb.checked && clashKeys[name]) card.classList.add('clash-flag');
            else card.classList.remove('clash-flag');
        });
    }

    // Use event delegation so this works even after script.js re-renders
    // the available-subjects list. Attaching once on document means we
    // never lose the binding.
    document.addEventListener('change', function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('subject-checkbox')) {
            updateEnrollmentSummary();
        }
    }, true);
    document.addEventListener('click', function (e) {
        if (!e.target) return;
        var card = e.target.closest && e.target.closest('#availableSubjectsList .subject-card');
        if (card) setTimeout(updateEnrollmentSummary, 0);
    }, true);

    // The list itself gets repopulated by displayAvailableSubjects().
    // Watch for that and refresh the summary bar.
    whenReady(function () {
        var list = document.getElementById('availableSubjectsList');
        if (list) {
            var mo = new MutationObserver(function () {
                updateEnrollmentSummary();
                applyDeferredHints();
            });
            mo.observe(list, { childList: true, subtree: false });
        }
    });

    /* ====================================================================
       FEATURE 3: confirm-with-deferral modal
       ==================================================================== */

    var TERM_PERIODS = {
        'Semester':     ['1st Semester', '2nd Semester'],
        'Tri-Semester': ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'],
        'Quarter':      ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'],
        'Block Plan':   ['Block A', 'Block B']
    };

    function getNextTermPeriod(termType, currentPeriod) {
        var list = TERM_PERIODS[termType] || TERM_PERIODS['Semester'];
        var i = list.indexOf(currentPeriod);
        if (i === -1 || i === list.length - 1) return null; // last period — nowhere to defer to
        return list[i + 1];
    }

    function openConfirmEnrollmentModal() {
        var ticked = gatherTickedSubjects();
        var unticked = gatherUntickedSubjects();
        var modal = document.getElementById('confirmEnrollmentModal');
        var body = document.getElementById('confirmEnrollmentBody');
        if (!modal || !body) {
            // Modal markup missing — fall back to direct confirm.
            invokeOriginalConfirm();
            return;
        }
        if (ticked.length === 0) {
            safeNotify('Please select at least one subject to enroll.', 'warning');
            return;
        }
        var totalUnits = ticked.reduce(function (sum, s) {
            var u = parseInt(s.units, 10); return sum + (isNaN(u) ? 0 : u);
        }, 0);
        var clashes = detectClashes(ticked);
        var termType = (document.getElementById('academicTermSelect') || {}).value || 'Semester';
        var termPeriod = (document.getElementById('termPeriodSelect') || {}).value || '1st Semester';
        var nextPeriod = getNextTermPeriod(termType, termPeriod);

        var clashHtml = '';
        if (clashes.length > 0) {
            clashHtml = '<div class="confirm-modal-clash"><i class="fas fa-triangle-exclamation"></i> ' +
                '<strong>' + clashes.length + ' schedule clash(es) detected.</strong> ' +
                'You may still enroll, but you will have overlapping classes.<ul>';
            clashes.forEach(function (c) {
                clashHtml += '<li>' + escHtml(c.names.join(' ↔ ')) +
                             ' on ' + escHtml(c.day) + ' ' + escHtml(c.time) + '</li>';
            });
            clashHtml += '</ul></div>';
        }

        var enrollList = ticked.map(function (s) {
            var u = parseInt(s.units, 10) || 0;
            return '<li><strong>' + escHtml(s.name) + '</strong> ' +
                   '<small>(' + u + ' units · ' + escHtml(s.schedule || 'TBD') + ')</small></li>';
        }).join('');

        var deferHtml;
        if (unticked.length === 0) {
            deferHtml = '<p class="confirm-modal-defer-none"><i class="fas fa-check"></i> ' +
                        'You\'ve selected every subject for this period — nothing will be deferred.</p>';
        } else if (!nextPeriod) {
            deferHtml = '<div class="confirm-modal-defer"><i class="fas fa-circle-exclamation"></i> ' +
                '<strong>' + unticked.length + ' subject(s)</strong> will NOT be enrolled. ' +
                'This is the last period of <em>' + escHtml(termType) + '</em>, so they cannot be auto-deferred. ' +
                'You will need to enroll them manually next academic year.<ul>' +
                unticked.map(function (s) { return '<li>' + escHtml(s.name) + '</li>'; }).join('') +
                '</ul></div>';
        } else {
            deferHtml = '<div class="confirm-modal-defer"><i class="fas fa-forward"></i> ' +
                '<strong>' + unticked.length + ' un-ticked subject(s)</strong> will be automatically deferred to ' +
                '<strong>' + escHtml(nextPeriod) + '</strong> and shown at the top when you load that period.<ul>' +
                unticked.map(function (s) { return '<li>' + escHtml(s.name) + '</li>'; }).join('') +
                '</ul></div>';
        }

        body.innerHTML =
            '<div class="confirm-modal-summary">' +
                '<div class="confirm-stat"><span class="num">' + ticked.length + '</span><small>Subjects</small></div>' +
                '<div class="confirm-stat"><span class="num">' + totalUnits + '</span><small>Total Units</small></div>' +
                '<div class="confirm-stat"><span class="num">' + clashes.length + '</span><small>Clash(es)</small></div>' +
                '<div class="confirm-stat"><span class="num">' + unticked.length + '</span><small>To Defer</small></div>' +
            '</div>' +
            clashHtml +
            '<h4 style="margin:16px 0 6px;">Subjects you will enroll in:</h4>' +
            '<ul class="confirm-modal-enroll-list">' + enrollList + '</ul>' +
            deferHtml +
            '<div class="confirm-modal-actions">' +
                '<button type="button" class="modify-btn" id="confirmEnrollmentCancelBtn">Back</button>' +
                '<button type="button" class="confirm-btn" id="confirmEnrollmentProceedBtn">' +
                    '<i class="fas fa-check"></i> Confirm Enrollment</button>' +
            '</div>';

        modal.style.display = 'flex';

        var cancel = document.getElementById('confirmEnrollmentCancelBtn');
        var proceed = document.getElementById('confirmEnrollmentProceedBtn');
        if (cancel) cancel.onclick = closeConfirmEnrollmentModal;
        if (proceed) proceed.onclick = function () {
            // Capture the deferral list BEFORE the original confirm fires
            // (because the original repaints / navigates away).
            var deferList = unticked.slice();
            invokeOriginalConfirm();
            stashDeferredSubjects(termType, termPeriod, deferList);
            assignSectionAfterConfirm();
            closeConfirmEnrollmentModal();
        };
    }

    function closeConfirmEnrollmentModal() {
        var modal = document.getElementById('confirmEnrollmentModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeConfirmEnrollmentModal = closeConfirmEnrollmentModal;

    function stashDeferredSubjects(termType, currentPeriod, unticked) {
        if (!unticked || unticked.length === 0) return;
        var u = getCurrentUser();
        if (!u || u.type !== 'student' || !u.data) return;
        var nextPeriod = getNextTermPeriod(termType, currentPeriod);
        if (!nextPeriod) return; // nowhere to defer to
        if (!u.data.deferredSubjects || typeof u.data.deferredSubjects !== 'object') {
            u.data.deferredSubjects = {};
        }
        // Clone so future mutations don't leak
        var clones = JSON.parse(JSON.stringify(unticked));
        // Mark each so we can show a hint when they reappear later
        clones.forEach(function (s) { s.__deferredFrom = currentPeriod; });
        u.data.deferredSubjects[nextPeriod] = (u.data.deferredSubjects[nextPeriod] || []).concat(clones);

        // Mirror to usersDB store
        var db = getUsersDB();
        if (db && Array.isArray(db.students)) {
            var idx = db.students.findIndex(function (s) { return s.id === u.data.id; });
            if (idx !== -1) db.students[idx] = JSON.parse(JSON.stringify(u.data));
        }
        persistAll();
        safeNotify(unticked.length + ' subject(s) deferred to ' + nextPeriod + '.', 'info');
    }

    function assignSectionAfterConfirm() {
        var u = getCurrentUser();
        if (!u || u.type !== 'student' || !u.data) return;
        // Only assign once a real enrollment exists
        if (!Array.isArray(u.data.enrolledSubjects) || u.data.enrolledSubjects.length === 0) return;
        // Reset section if the level/program changed since last time
        if (u.data.section) {
            var sections = ensureSectionsStore() || {};
            var arr = sections[u.data.section] || [];
            var expectedPrefix = shortLevelTag(u.data);
            if (u.data.section.indexOf(expectedPrefix + '-') !== 0) {
                // Remove from old section, then re-assign
                sections[u.data.section] = arr.filter(function (id) { return id !== u.data.id; });
                u.data.section = null;
            }
        }
        var sec = assignSectionToStudent(u.data);
        // Mirror to usersDB
        var db = getUsersDB();
        if (db && Array.isArray(db.students)) {
            var idx = db.students.findIndex(function (s) { return s.id === u.data.id; });
            if (idx !== -1) db.students[idx] = JSON.parse(JSON.stringify(u.data));
        }
        persistAll();
        if (sec) safeNotify('Assigned to section ' + sec + '.', 'success');
    }

    // Annotate the available-subjects list when deferred subjects show up
    function applyDeferredHints() {
        var u = getCurrentUser();
        if (!u || u.type !== 'student' || !u.data) return;
        var pending = pendingEnrollment;
        if (!pending) return;
        var period = (document.getElementById('termPeriodSelect') || {}).value;
        if (!period) return;
        var deferred = (u.data.deferredSubjects || {})[period] || [];
        if (deferred.length === 0) return;
        var deferredNames = {};
        deferred.forEach(function (s) { deferredNames[s.name] = s.__deferredFrom || true; });
        document.querySelectorAll('#availableSubjectsList .subject-card').forEach(function (card) {
            var cb = card.querySelector('.subject-checkbox');
            if (!cb) return;
            if (deferredNames[cb.value] && !card.querySelector('.deferred-tag')) {
                var tag = document.createElement('span');
                tag.className = 'deferred-tag';
                tag.innerHTML = '<i class="fas fa-clock-rotate-left"></i> Deferred from ' +
                    escHtml(deferredNames[cb.value] === true ? 'previous period' : deferredNames[cb.value]);
                card.appendChild(tag);
            }
        });
    }

    // Capture the original confirmSchedule chain (script.js wraps it once
    // already to snapshot defaultSchedule). We invoke that wrapped version.
    var originalConfirmSchedule = null;
    function captureOriginalConfirm() {
        if (originalConfirmSchedule) return;
        originalConfirmSchedule = window.confirmSchedule;
    }
    function invokeOriginalConfirm() {
        if (typeof originalConfirmSchedule === 'function') {
            originalConfirmSchedule();
        } else if (typeof window.confirmSchedule === 'function') {
            window.confirmSchedule();
        }
    }

    // Re-clone the confirm button so its click handler is OURS and ours
    // alone — script.js's previous listener is dropped along with the
    // old node.
    whenReady(function () {
        captureOriginalConfirm();
        var btn = document.getElementById('confirmScheduleBtn');
        if (btn) {
            var fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);
            fresh.addEventListener('click', openConfirmEnrollmentModal);
        }
        // Click-outside-to-close on the modal overlay
        var modal = document.getElementById('confirmEnrollmentModal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeConfirmEnrollmentModal();
            });
        }
        // Initial summary state
        updateEnrollmentSummary();
        // Section migration for any existing students
        backfillSections();
    });

    /* ====================================================================
       FEATURE 1: conjoined multi-day schedule editor
       ==================================================================== */

    // Apply red clash highlighting to subject-editor rows whose schedule
    // collides with another subject in the same draft. Called after the
    // editor is (re)rendered, including after each conjoined slot shift.
    function applyEditorClashHighlights(draft, container) {
        if (!container || !Array.isArray(draft)) return;
        var clashes = detectClashes(draft);
        var clashingNames = {};
        clashes.forEach(function (c) {
            (c.names || []).forEach(function (n) { clashingNames[n] = true; });
        });
        container.querySelectorAll('.subject-editor-row').forEach(function (row) {
            var idx = parseInt(row.getAttribute('data-row-idx'), 10);
            var name = (!isNaN(idx) && draft[idx]) ? draft[idx].name : null;
            var tag = row.querySelector('.clash-row-tag');
            if (name && clashingNames[name]) {
                row.classList.add('clash');
                if (tag) tag.style.display = 'inline-flex';
            } else {
                row.classList.remove('clash');
                if (tag) tag.style.display = 'none';
            }
        });
    }

    function renderSubjectScheduleEditorPatched() {
        var container = document.getElementById('subjectEditorList');
        var wrapper = document.getElementById('subjectScheduleEditor');
        var slotIndicator = document.getElementById('scheduleSlotIndicator');
        if (!container || !wrapper) return;
        var u = getCurrentUser();
        if (!u || u.type !== 'student') {
            wrapper.style.display = 'none';
            if (slotIndicator) slotIndicator.style.display = 'none';
            return;
        }
        var draft = scheduleDraft;
        if (!draft || draft.length === 0) {
            wrapper.style.display = 'none';
            if (slotIndicator) slotIndicator.style.display = 'none';
            return;
        }

        if (typeof window.ensureSlotFields === 'function') window.ensureSlotFields(u.data);
        if (slotIndicator) {
            slotIndicator.style.display = 'flex';
            var remEl = document.getElementById('slotsRemainingDisplay');
            var limEl = document.getElementById('slotsLimitDisplay');
            if (remEl && typeof window.getSlotsRemaining === 'function')
                remEl.textContent = window.getSlotsRemaining(u.data);
            if (limEl) limEl.textContent = u.data.scheduleChangeLimit;
        }

        wrapper.style.display = 'block';
        var defaultSched = u.data.defaultSchedule || [];
        var html = '';
        draft.forEach(function (subj, idx) {
            var slots = parseAllSlots(subj.schedule);
            var defaultSubj = defaultSched[idx];
            var defaultSlots = defaultSubj ? parseAllSlots(defaultSubj.schedule) : slots;
            var dirty = false;
            for (var i = 0; i < slots.length; i++) {
                var ds = defaultSlots[i] || slots[i];
                if (slots[i].day !== ds.day || slots[i].time !== ds.time) { dirty = true; break; }
            }
            var multi = slots.length > 1;
            var slotRowsHtml = slots.map(function (slot, sIdx) {
                var dayOpts = DAYS.map(function (d) {
                    return '<option value="' + d + '"' + (d === slot.day ? ' selected' : '') + '>' + d + '</option>';
                }).join('');
                var timeOpts = TIMES.map(function (t) {
                    return '<option value="' + t + '"' + (t === slot.time ? ' selected' : '') + '>' + t + '</option>';
                }).join('');
                var sessionLabel = multi ? '<span class="session-pill">Session ' + (sIdx + 1) + '</span>' : '';
                return '<div class="subject-editor-slot" data-slot-idx="' + sIdx + '">' +
                       sessionLabel +
                       '<select class="subject-editor-day-multi" data-subj-idx="' + idx + '" data-slot-idx="' + sIdx + '">' + dayOpts + '</select>' +
                       '<select class="subject-editor-time-multi" data-subj-idx="' + idx + '" data-slot-idx="' + sIdx + '">' + timeOpts + '</select>' +
                       '</div>';
            }).join('');
            var conjoinedBadge = multi
                ? '<span class="conjoined-badge" title="Editing one session moves all sessions of this subject together."><i class="fas fa-link"></i> Conjoined (' + slots.length + ' sessions)</span>'
                : '';
            html += '<div class="subject-editor-row' + (dirty ? ' dirty' : '') + '" data-row-idx="' + idx + '">' +
                       '<div class="subject-editor-name">' + escHtml(subj.name) + ' ' + conjoinedBadge + '<span class="clash-row-tag" style="display:none;"><i class="fas fa-triangle-exclamation"></i> Conflict</span></div>' +
                       '<div class="subject-editor-slots">' + slotRowsHtml + '</div>' +
                   '</div>';
        });
        container.innerHTML = html;

        // Mark any rows whose subject collides with another subject in the
        // working draft (same day + time). Reuses detectClashes() so the
        // editor and the self-enrollment summary use the exact same rule.
        applyEditorClashHighlights(draft, container);

        // Bind change listeners — change in ANY slot shifts ALL the slots
        // of that subject by the same day/time delta (conjoined behavior).
        container.querySelectorAll('.subject-editor-day-multi, .subject-editor-time-multi').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var subjIdx = parseInt(this.getAttribute('data-subj-idx'), 10);
                var slotIdx = parseInt(this.getAttribute('data-slot-idx'), 10);
                if (isNaN(subjIdx) || !draft[subjIdx]) return;

                var oldSlots = parseAllSlots(draft[subjIdx].schedule);
                var oldSlot = oldSlots[slotIdx] || oldSlots[0];
                var row = this.closest('.subject-editor-row');
                var slotEl = this.closest('.subject-editor-slot');
                var newDay = slotEl.querySelector('.subject-editor-day-multi').value;
                var newTime = slotEl.querySelector('.subject-editor-time-multi').value;

                var dayDelta = dayIdx(newDay) - dayIdx(oldSlot.day);
                var timeDelta = timeIdx(newTime) - timeIdx(oldSlot.time);

                // Apply delta to ALL slots (conjoined). Uses the OLD positions
                // as the basis so the original gap pattern is preserved.
                var newSlots = oldSlots.map(function (s) {
                    return {
                        day: DAYS[clampDay(dayIdx(s.day) + dayDelta)],
                        time: TIMES[clampTime(timeIdx(s.time) + timeDelta)]
                    };
                });
                draft[subjIdx].schedule = buildScheduleStringMulti(newSlots);

                // Re-render the canvas + this editor (so the other slot
                // selects update to reflect the conjoined shift).
                if (typeof window.renderScheduleTable === 'function') {
                    window.renderScheduleTable(draft, 'scheduleResult');
                }
                renderSubjectScheduleEditorPatched();
            });
        });
    }

    function getDirtySubjectsPatched() {
        var u = getCurrentUser();
        var draft = scheduleDraft;
        if (!u || !u.data || !draft) return [];
        var def = u.data.defaultSchedule || [];
        var dirty = [];
        draft.forEach(function (subj, idx) {
            var cur = parseAllSlots(subj.schedule);
            var orig = def[idx] ? parseAllSlots(def[idx].schedule) : cur;
            var changed = false;
            var maxLen = Math.max(cur.length, orig.length);
            for (var i = 0; i < maxLen; i++) {
                var a = cur[i] || cur[0];
                var b = orig[i] || orig[0];
                if (a.day !== b.day || a.time !== b.time) { changed = true; break; }
            }
            if (changed) {
                dirty.push({
                    name: subj.name,
                    from: orig.map(function (s) { return s.day + ' ' + s.time; }).join('; '),
                    to: cur.map(function (s) { return s.day + ' ' + s.time; }).join('; ')
                });
            }
        });
        return dirty;
    }

    // Override the script.js versions. These are top-level function
    // declarations there, so reassigning the window/global property
    // changes what later callers see.
    window.renderSubjectScheduleEditor = renderSubjectScheduleEditorPatched;
    window.getDirtySubjects = getDirtySubjectsPatched;

    // Re-clone the buttons that bound the OLD renderer/submit logic so they
    // route through the patched versions.
    whenReady(function () {
        var submitBtn = document.getElementById('submitScheduleChangeBtn');
        if (submitBtn) {
            var fresh = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(fresh, submitBtn);
            fresh.addEventListener('click', function () {
                if (typeof window.submitScheduleChangeRequest === 'function') {
                    window.submitScheduleChangeRequest();
                }
            });
        }
        var resetBtn = document.getElementById('resetScheduleBtn');
        if (resetBtn) {
            var freshR = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(freshR, resetBtn);
            freshR.addEventListener('click', function () {
                if (typeof window.resetScheduleDraftToDefault === 'function') {
                    window.resetScheduleDraftToDefault();
                }
                renderSubjectScheduleEditorPatched();
            });
        }
    });

    /* ====================================================================
       FEATURE 4 (part B): admin audience block + filtered notifications
       ==================================================================== */

    function populateAudienceDropdowns() {
        var sectionSel = document.getElementById('audienceSectionSelect');
        var studentSel = document.getElementById('audienceStudentSelect');
        if (sectionSel) {
            var prevS = sectionSel.value;
            var sections = getAllKnownSections();
            sectionSel.innerHTML = '<option value="">— Select section —</option>' +
                sections.map(function (id) {
                    var count = ((ensureSectionsStore() || {})[id] || []).length;
                    return '<option value="' + escHtml(id) + '">' + escHtml(id) + ' (' + count + ' student' + (count === 1 ? '' : 's') + ')</option>';
                }).join('');
            if (prevS) sectionSel.value = prevS;
        }
        if (studentSel) {
            var prevSt = studentSel.value;
            var db = getUsersDB();
            var enrolled = (db && Array.isArray(db.students))
                ? db.students.filter(function (s) {
                    return s.level && Array.isArray(s.enrolledSubjects) && s.enrolledSubjects.length > 0;
                })
                : [];
            studentSel.innerHTML = '<option value="">— Select student —</option>' +
                enrolled.map(function (s) {
                    return '<option value="' + escHtml(s.id) + '">' +
                        escHtml(s.name) + ' (' + escHtml(s.id) + ')' +
                        (s.section ? ' — ' + escHtml(s.section) : '') +
                    '</option>';
                }).join('');
            if (prevSt) studentSel.value = prevSt;
        }
    }

    function refreshAudienceSummary() {
        var summary = document.getElementById('audienceSummary');
        if (!summary) return;
        var type = (document.getElementById('audienceType') || {}).value || 'all';
        if (type === 'all') {
            summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent to <strong>all enrolled students</strong>.';
            return;
        }
        if (type === 'section') {
            var sec = (document.getElementById('audienceSectionSelect') || {}).value;
            if (!sec) {
                summary.innerHTML = '<i class="fas fa-circle-exclamation"></i> Pick a section above to continue.';
                return;
            }
            var members = ((ensureSectionsStore() || {})[sec] || []).length;
            summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent to section <strong>' + escHtml(sec) + '</strong> (' + members + ' student' + (members === 1 ? '' : 's') + ').';
            return;
        }
        if (type === 'student') {
            var sid = (document.getElementById('audienceStudentSelect') || {}).value;
            if (!sid) {
                summary.innerHTML = '<i class="fas fa-circle-exclamation"></i> Pick a student above to continue.';
                return;
            }
            var db = getUsersDB();
            var who = (db && db.students || []).find(function (s) { return s.id === sid; });
            summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent only to <strong>' + escHtml(who ? who.name : sid) + '</strong>.';
        }
    }

    function getCurrentAudienceSelection() {
        var type = (document.getElementById('audienceType') || {}).value || 'all';
        var out = { type: type };
        if (type === 'section') out.sectionId = (document.getElementById('audienceSectionSelect') || {}).value || null;
        if (type === 'student') out.studentId = (document.getElementById('audienceStudentSelect') || {}).value || null;
        return out;
    }

    function audienceLabel(audience) {
        if (!audience || audience.type === 'all') return '📢 All Students';
        if (audience.type === 'section') return '🏷️ Section ' + (audience.sectionId || '?');
        if (audience.type === 'student') {
            var db = getUsersDB();
            var who = (db && db.students || []).find(function (s) { return s.id === audience.studentId; });
            return '👤 ' + (who ? who.name : audience.studentId || '?');
        }
        return '📢 All';
    }

    function notificationMatchesUser(n, user) {
        var a = n.audience;
        if (!a || a.type === 'all') return true;
        if (!user || user.type !== 'student' || !user.data) return false;
        if (a.type === 'student') return a.studentId === user.data.id;
        if (a.type === 'section') return a.sectionId && user.data.section === a.sectionId;
        return true;
    }

    // Wrap addNotification to attach the currently-selected audience
    var originalAddNotification = window.addNotification;
    window.addNotification = function (type, title, details, reason) {
        var audience = getCurrentAudienceSelection();
        // Validate
        if (audience.type === 'section' && !audience.sectionId) {
            safeNotify('Please pick a section in the audience block first.', 'warning');
            return;
        }
        if (audience.type === 'student' && !audience.studentId) {
            safeNotify('Please pick a student in the audience block first.', 'warning');
            return;
        }
        // Call original to push & save
        if (typeof originalAddNotification === 'function') {
            originalAddNotification(type, title, details, reason);
        }
        // Attach audience to the most recently added notification of that type
        var notifDB = notificationsDB;
        if (notifDB && notifDB[type] && notifDB[type][0]) {
            notifDB[type][0].audience = audience;
            if (typeof window.saveNotifications === 'function') {
                try { window.saveNotifications(); } catch (e) {}
            }
        }
        safeNotify('Sent to ' + audienceLabel(audience) + '.', 'info');
    };

    // Filter the student-side notifications view by audience
    var originalLoadNotificationsView = window.loadNotificationsView;
    window.loadNotificationsView = function () {
        var u = getCurrentUser();
        if (!u || u.type !== 'student') {
            if (typeof originalLoadNotificationsView === 'function') originalLoadNotificationsView();
            return;
        }
        var container = document.getElementById('studentNotificationsList');
        if (!container) return;
        var notifDB = notificationsDB;
        if (!notifDB) {
            if (typeof originalLoadNotificationsView === 'function') originalLoadNotificationsView();
            return;
        }
        var all = [];
        ['schedule', 'room', 'professor'].forEach(function (kind) {
            (notifDB[kind] || []).forEach(function (n) { all.push(Object.assign({}, n, { type: kind })); });
        });
        all.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
        all = all.filter(function (n) { return notificationMatchesUser(n, u); });

        if (all.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No announcements addressed to you right now.</p></div>';
            return;
        }
        var html = '';
        all.forEach(function (n) {
            var icon = n.type === 'schedule' ? 'fa-clock' : (n.type === 'room' ? 'fa-door-open' : 'fa-chalkboard-teacher');
            var audTag = n.audience && n.audience.type !== 'all'
                ? '<div class="notification-audience-tag"><i class="fas fa-tag"></i> ' + escHtml(audienceLabel(n.audience)) + '</div>'
                : '';
            html += '<div class="notification-item">' +
                       '<div class="notification-icon ' + n.type + '"><i class="fas ' + icon + '"></i></div>' +
                       '<div class="notification-content">' +
                           '<div class="notification-title">' + escHtml(n.title) + '</div>' +
                           '<div class="notification-details">' + escHtml(n.details || '') + '</div>' +
                           '<div class="notification-reason">' + escHtml(n.reason || '') + '</div>' +
                           audTag +
                           '<div class="notification-date">' + new Date(n.date).toLocaleString() + '</div>' +
                       '</div>' +
                   '</div>';
        });
        container.innerHTML = html;
    };

    // Wire the audience block UI
    whenReady(function () {
        var typeSel = document.getElementById('audienceType');
        var secWrap = document.getElementById('audienceSectionWrap');
        var stuWrap = document.getElementById('audienceStudentWrap');
        var secSel = document.getElementById('audienceSectionSelect');
        var stuSel = document.getElementById('audienceStudentSelect');

        function applyVisibility() {
            var v = (typeSel && typeSel.value) || 'all';
            if (secWrap) secWrap.style.display = (v === 'section') ? 'block' : 'none';
            if (stuWrap) stuWrap.style.display = (v === 'student') ? 'block' : 'none';
            refreshAudienceSummary();
        }
        if (typeSel) typeSel.addEventListener('change', applyVisibility);
        if (secSel) secSel.addEventListener('change', refreshAudienceSummary);
        if (stuSel) stuSel.addEventListener('change', refreshAudienceSummary);

        // Refresh dropdowns whenever the admin opens the Updates page
        var navLinks = document.querySelectorAll('[data-action="updates"]');
        navLinks.forEach(function (a) {
            a.addEventListener('click', function () {
                setTimeout(function () { populateAudienceDropdowns(); applyVisibility(); }, 50);
            });
        });
        // Also refresh when admin clicks any of the announcement tabs
        ['schedule', 'room', 'professor'].forEach(function (k) {
            document.querySelectorAll('.admin-tab[data-admin-tab="' + k + '"]').forEach(function (t) {
                t.addEventListener('click', function () {
                    populateAudienceDropdowns(); applyVisibility();
                });
            });
        });

        // Hide the audience block when admin is on a non-announcement tab
        // (requests / programs panels don't post announcements)
        document.querySelectorAll('.admin-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                var t = this.getAttribute('data-admin-tab');
                var block = document.getElementById('adminAudienceBlock');
                if (!block) return;
                var showFor = (t === 'schedule' || t === 'room' || t === 'professor');
                block.style.display = showFor ? 'block' : 'none';
            });
        });

        populateAudienceDropdowns();
        applyVisibility();
    });

    /* ====================================================================
       FEATURE 4 (part C): Section column in Developer Mode student table
       ==================================================================== */

    function patchDevTableWithSections() {
        var container = document.getElementById('devStudentTable');
        if (!container) return;
        var table = container.querySelector('table.dev-table');
        if (!table) return;
        if (table.getAttribute('data-section-patched') === '1') return;
        var thead = table.querySelector('thead tr');
        if (thead && !thead.querySelector('.section-th')) {
            // Insert "Section" before the last "Actions" column
            var actionsTh = thead.lastElementChild;
            var th = document.createElement('th');
            th.className = 'section-th';
            th.textContent = 'Section';
            if (actionsTh) thead.insertBefore(th, actionsTh);
            else thead.appendChild(th);
        }
        var rows = table.querySelectorAll('tbody tr');
        var db = getUsersDB();
        var students = (db && db.students) || [];
        rows.forEach(function (row, i) {
            if (row.querySelector('.section-td')) return;
            var s = students[i];
            var sec = s && s.section ? s.section : '—';
            var td = document.createElement('td');
            td.className = 'section-td';
            td.innerHTML = sec === '—'
                ? '<span style="color:#999;">—</span>'
                : '<span class="section-pill">' + escHtml(sec) + '</span>';
            var actionsTd = row.lastElementChild;
            if (actionsTd) row.insertBefore(td, actionsTd);
            else row.appendChild(td);
        });
        table.setAttribute('data-section-patched', '1');
    }

    whenReady(function () {
        var devContainer = document.getElementById('devStudentTable');
        if (!devContainer) return;
        // Run once if the table is already there
        patchDevTableWithSections();
        // And re-run whenever the original loadDeveloperStudentTable refreshes it
        var mo = new MutationObserver(function () {
            // Reset the flag each time the table itself is rebuilt
            var t = devContainer.querySelector('table.dev-table');
            if (t) t.removeAttribute('data-section-patched');
            patchDevTableWithSections();
        });
        mo.observe(devContainer, { childList: true, subtree: true });
    });

})();
