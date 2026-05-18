/* ============================================
   STORAGE MODULE - Data persistence
   COMPLETE - Includes session restoration
   ============================================ */

function loadData() {
    const savedUsers = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USERS_DB);
    if (savedUsers) {
        try {
            window.usersDB = JSON.parse(savedUsers);
            window.usersDB.students = window.usersDB.students.map(s => ({
                ...s,
                enrolledSubjects: s.enrolledSubjects || [],
                grades: s.grades || {},
                attendance: s.attendance || {},
                registrationCompleted: s.registrationCompleted || false,
                loginCount: s.loginCount || 0,
                scheduleConfirmed: s.scheduleConfirmed || false,
                scheduleChangeLimit: s.scheduleChangeLimit || APP_CONFIG.SCHEDULE_CHANGE_LIMIT,
                scheduleChangesUsed: s.scheduleChangesUsed || 0,
                defaultSchedule: s.defaultSchedule || null,
                modifiedSchedule: s.modifiedSchedule || null,
                modificationStatus: s.modificationStatus || null,
                email: s.email || null,
                contact: s.contact || null,
                address: s.address || null
            }));
            window.usersDB.scheduleChangeRequests = window.usersDB.scheduleChangeRequests || [];
            window.usersDB.customPrograms = window.usersDB.customPrograms || [];
            window.usersDB.customCurricula = window.usersDB.customCurricula || [];
            window.usersDB.sectionAssignments = window.usersDB.sectionAssignments || {};
        } catch(e) {
            initializeDefaultData();
        }
    } else {
        initializeDefaultData();
    }
}

function initializeDefaultData() {
    window.usersDB = { students: [], admins: [], scheduleChangeRequests: [], customPrograms: [], customCurricula: [], sectionAssignments: {} };
    window.usersDB.admins.push({ 
        email: "admin@school.edu", 
        password: "admin123", 
        name: "Professor Maria Santos", 
        lastLogin: null 
    });
    saveData();
}

function saveData() { 
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USERS_DB, JSON.stringify(window.usersDB));
    } catch(e) {
        if (typeof customConsoleLog === 'function') customConsoleLog('Error saving data: ' + e.message, 'error');
    }
}

function loadNotifications() { 
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.NOTIFICATIONS_DB); 
    if (saved) {
        try {
            window.notificationsDB = JSON.parse(saved);
        } catch(e) {
            window.notificationsDB = { schedule: [], room: [], professor: [] };
        }
    } else {
        window.notificationsDB = { schedule: [], room: [], professor: [] };
    }
}

function saveNotifications() { 
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.NOTIFICATIONS_DB, JSON.stringify(window.notificationsDB)); 
}

function saveUserSession() {
    if (window.currentUser) {
        let currentPage = 'dashboard';
        const activePanel = document.querySelector('.content-panel.active');
        if (activePanel) {
            if (activePanel.id === 'dashboard-content') currentPage = 'dashboard';
            else if (activePanel.id === 'self-enrollment-content') currentPage = 'self-enrollment';
            else if (activePanel.id === 'student-registration-content') currentPage = 'student-registration';
            else if (activePanel.id === 'student-records-content') currentPage = 'student-records';
            else if (activePanel.id === 'updates-content') currentPage = 'updates';
            else if (activePanel.id === 'sched-gen-1-content') currentPage = 'sched-gen-1';
        }
        
        const sessionData = {
            userId: window.currentUser.data.id,
            userType: window.currentUser.type,
            timestamp: Date.now(),
            currentPage: currentPage
        };
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    } else {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
    }
}

function restoreUserSession() {
    const savedSession = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            const sessionAge = Date.now() - session.timestamp;
            
            if (sessionAge < APP_CONFIG.SESSION_TIMEOUT && session.userId) {
                if (session.userType === 'student') {
                    const freshStudent = window.usersDB.students.find(s => s.id === session.userId);
                    if (freshStudent) {
                        window.currentUser = { type: 'student', data: freshStudent };
                    }
                } else if (session.userType === 'admin') {
                    const freshAdmin = window.usersDB.admins.find(a => a.email === session.userId);
                    if (freshAdmin) {
                        window.currentUser = { type: 'admin', data: freshAdmin };
                    }
                }
                
                if (window.currentUser) {
                    if (typeof showMainApp === 'function') showMainApp();
                    if (typeof updateUIAfterLogin === 'function') updateUIAfterLogin();
                    // Restore to the last page they were on
                    let lastPage = session.currentPage || 'dashboard';
                    if (typeof switchContent === 'function') switchContent(lastPage);
                    if (typeof customConsoleLog === 'function') customConsoleLog(`Session restored for ${window.currentUser.data.name}`, 'success');
                    return true;
                }
            }
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
        } catch (e) {
            console.error('Failed to restore session:', e);
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
        }
    }
    return false;
}

window.loadData = loadData;
window.saveData = saveData;
window.loadNotifications = loadNotifications;
window.saveNotifications = saveNotifications;
window.saveUserSession = saveUserSession;
window.restoreUserSession = restoreUserSession;