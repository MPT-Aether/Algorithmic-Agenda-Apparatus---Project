/* ============================================
   AUTHENTICATION MODULE
   ============================================ */

let registrationData = {};

function showLoginPage() { 
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainAppContainer');
    if (loginPage) loginPage.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    if (typeof initializeLoginPanels === 'function') initializeLoginPanels(); 
    if (typeof loadRememberedCredentials === 'function') loadRememberedCredentials(); 
}

function showMainApp() { 
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainAppContainer');
    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
}

function clearSavedCredentials() {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_ID);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_PASSWORD);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_IS_ADMIN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME_FLAG);
}

function saveRememberedCredentials(id, password, isAdmin = false) {
    const studentRememberMe = document.getElementById('rememberMe')?.checked;
    const adminRememberMe = document.getElementById('rememberMeAdmin')?.checked;
    const rememberMeChecked = isAdmin ? adminRememberMe : studentRememberMe;
    
    if (rememberMeChecked) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_ID, id);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_PASSWORD, password);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_IS_ADMIN, isAdmin);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME_FLAG, 'true');
    } else {
        clearSavedCredentials();
    }
}

function loadRememberedCredentials() {
    const rememberMeFlag = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME_FLAG);
    const rememberedId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_ID);
    const rememberedPassword = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_PASSWORD);
    const rememberedIsAdmin = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_IS_ADMIN);
    
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

function togglePassword(inputId) { 
    const input = document.getElementById(inputId); 
    if (input) input.type = input.type === 'password' ? 'text' : 'password'; 
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

function initAuth() {
    // Student Login
    const studentLoginBtn = document.getElementById('studentLoginBtn');
    if (studentLoginBtn) {
        studentLoginBtn.addEventListener('click', () => {
            const id = document.getElementById('loginStudentId')?.value.trim();
            const pwd = document.getElementById('loginStudentPassword')?.value;
            const student = window.usersDB.students.find(s => s.id === id && s.password === pwd);
            
            if (student) {
                window.currentUser = { type: 'student', data: student };
                student.loginCount = (student.loginCount || 0) + 1;
                student.lastLogin = new Date().toISOString();
                saveData();
                saveRememberedCredentials(id, pwd, false);
                saveUserSession();
                showMainApp();
                updateUIAfterLogin();
                customConsoleLog(`STUDENT LOGIN: ${student.name} (${student.id})`, 'success');
                showCustomNotification(`Welcome back, ${student.name}!`, 'success');
                switchContent('dashboard');
            } else {
                showCustomNotification('Invalid credentials', 'error');
            }
        });
    }
    
    // Admin Login
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            const email = document.getElementById('loginAdminEmail')?.value.trim();
            const pwd = document.getElementById('loginAdminPassword')?.value;
            const admin = window.usersDB.admins.find(a => a.email === email && a.password === pwd);
            
            if (admin) {
                window.currentUser = { type: 'admin', data: admin };
                admin.lastLogin = new Date().toISOString();
                saveData();
                saveRememberedCredentials(email, pwd, true);
                saveUserSession();
                showMainApp();
                updateUIAfterLogin();
                customConsoleLog(`ADMIN LOGIN: ${admin.name} (${email})`, 'success');
                showCustomNotification(`Welcome, ${admin.name}!`, 'success');
            } else {
                showCustomNotification('Invalid credentials. Default: admin@school.edu / admin123', 'error');
            }
        });
    }
    
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
            window.usersDB.students.push({ 
                id: studentId, password, name, email: null, level: null, sublevel: null,
                strand: null, program: null, yearLevel: null, registrationCompleted: false,
                enrolledSubjects: [], grades: {}, attendance: {}, loginCount: 0, lastLogin: null,
                scheduleConfirmed: false, termType: 'Semester', termPeriod: '1st Semester',
                scheduleChangeLimit: APP_CONFIG.SCHEDULE_CHANGE_LIMIT, scheduleChangesUsed: 0,
                defaultSchedule: null, modifiedSchedule: null, modificationStatus: null
            });
            saveData();
            customConsoleLog(`NEW STUDENT: ${name} (${studentId})`, 'success');
            showCustomNotification(`Account created! Student ID: ${studentId}`, 'success');
            
            document.getElementById('studentSignupPanel').style.display = 'none';
            document.getElementById('studentLoginForm').style.display = 'block';
            document.getElementById('loginStudentId').value = studentId;
            clearSavedCredentials();
        });
    }
    
    // Signup links
    const showSignupLink = document.getElementById('showSignupFormLink');
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('studentLoginForm').style.display = 'none';
            document.getElementById('adminLoginForm').style.display = 'none';
            document.getElementById('studentSignupPanel').style.display = 'block';
            document.getElementById('signupStudentIdPreview').value = generateStudentId();
        });
    }
    
    const showAdminSignupLink = document.getElementById('showAdminSignupFormLink');
    if (showAdminSignupLink) {
        showAdminSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('studentLoginForm').style.display = 'none';
            document.getElementById('adminLoginForm').style.display = 'none';
            document.getElementById('adminSignupPanel').style.display = 'block';
        });
    }
    
    // Back to login
    const backToStudentLogin = document.getElementById('backToStudentLogin');
    if (backToStudentLogin) {
        backToStudentLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('studentSignupPanel').style.display = 'none';
            document.getElementById('studentLoginForm').style.display = 'block';
            document.querySelector('.login-tab-btn[data-login-tab="student"]').click();
        });
    }
    
    const backToAdminLogin = document.getElementById('backToAdminLogin');
    if (backToAdminLogin) {
        backToAdminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('adminSignupPanel').style.display = 'none';
            document.getElementById('adminLoginForm').style.display = 'block';
            document.querySelector('.login-tab-btn[data-login-tab="admin"]').click();
        });
    }
    
    // Forgot password
    const showForgotPassword = document.getElementById('showForgotPassword');
    if (showForgotPassword) {
        showForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('studentLoginForm').style.display = 'none';
            document.getElementById('adminLoginForm').style.display = 'none';
            document.getElementById('forgotPasswordPanel').style.display = 'block';
        });
    }
    
    const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');
    if (backToLoginFromForgot) {
        backToLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('forgotPasswordPanel').style.display = 'none';
            document.querySelector('.login-tab-btn.active').click();
        });
    }
    
    // Reset password
    const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
    if (sendResetCodeBtn) {
        sendResetCodeBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail')?.value;
            const user = [...window.usersDB.students, ...window.usersDB.admins].find(u => u.email === email);
            if (user) {
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                window.resetCodes[email] = code;
                showCustomNotification(`Reset code sent to ${email}`, 'info');
                document.getElementById('resetCodeSection').style.display = 'block';
            } else {
                showCustomNotification('Email not found', 'error');
            }
        });
    }
    
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail')?.value;
            const code = document.getElementById('resetCode')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            if (window.resetCodes[email] === code) {
                const student = window.usersDB.students.find(s => s.email === email);
                const admin = window.usersDB.admins.find(a => a.email === email);
                if (student) student.password = newPassword;
                if (admin) admin.password = newPassword;
                saveData();
                showCustomNotification('Password reset successfully!', 'success');
                document.getElementById('forgotPasswordPanel').style.display = 'none';
                document.querySelector('.login-tab-btn.active').click();
            } else {
                showCustomNotification('Invalid code', 'error');
            }
        });
    }
    
    // Password validation
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', updatePasswordUI);
    }
}

window.showLoginPage = showLoginPage;
window.showMainApp = showMainApp;
window.initAuth = initAuth;
window.togglePassword = togglePassword;
window.setupLoginTabs = setupLoginTabs;
window.initializeLoginPanels = initializeLoginPanels;
window.loadRememberedCredentials = loadRememberedCredentials;
window.updatePasswordUI = updatePasswordUI;
window.registrationData = registrationData;