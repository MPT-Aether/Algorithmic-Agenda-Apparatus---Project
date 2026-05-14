/* ============================================
   MAIN APPLICATION ENTRY POINT
   Initializes all modules
   ============================================ */

// Global state
window.usersDB = { students: [], admins: [], scheduleChangeRequests: [], customPrograms: [], sectionAssignments: {} };
window.currentUser = null;
window.registrationData = {};
window.notificationsDB = { schedule: [], room: [], professor: [] };
window.resetCodes = {};
window.pendingEnrollment = null;
window.isDeveloperModeActive = false;
window.scheduleDraft = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Main] DOM ready, initializing application...');
    
    // Load data from storage
    if (typeof loadData === 'function') { loadData(); console.log('[Main] Data loaded'); }
    if (typeof loadNotifications === 'function') { loadNotifications(); console.log('[Main] Notifications loaded'); }
    
    // Initialize all modules
    if (typeof setupLoginTabs === 'function') { setupLoginTabs(); console.log('[Main] Login tabs initialized'); }
    if (typeof initializeLoginPanels === 'function') { initializeLoginPanels(); console.log('[Main] Login panels initialized'); }
    if (typeof initSelfEnrollment === 'function') { initSelfEnrollment(); console.log('[Main] Self-enrollment initialized'); }
    if (typeof initAuth === 'function') { initAuth(); console.log('[Main] Auth initialized'); }
    if (typeof initializeConsole === 'function') { initializeConsole(); console.log('[Main] Console initialized'); }
    if (typeof setupAdminUpdateTabs === 'function') { setupAdminUpdateTabs(); console.log('[Main] Admin tabs initialized'); }
    
    // Setup credits button
    const creditsBtn = document.getElementById('creditsBtn');
    if (creditsBtn && typeof showCredits === 'function') creditsBtn.addEventListener('click', showCredits);
    
    // Setup dev mode trigger
    const devModeTrigger = document.getElementById('devModeTrigger');
    if (devModeTrigger && typeof showDeveloperPrompt === 'function') devModeTrigger.addEventListener('click', showDeveloperPrompt);
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { 
            window.currentUser = null; 
            if (typeof showLoginPage === 'function') showLoginPage(); 
            const sidebarUserName = document.getElementById('sidebarUserName'); 
            const sidebarUserRole = document.getElementById('sidebarUserRole'); 
            if (sidebarUserName) sidebarUserName.textContent = 'Guest'; 
            if (sidebarUserRole) sidebarUserRole.textContent = 'Not logged in'; 
            if (typeof showCustomNotification === 'function') showCustomNotification('Logged out successfully', 'info'); 
            if (typeof saveUserSession === 'function') saveUserSession(); 
        });
    }
    
    // Try to restore session
    const sessionRestored = typeof restoreUserSession === 'function' ? restoreUserSession() : false;
    if (!sessionRestored && typeof showLoginPage === 'function') showLoginPage();
    
    // Save session before page unload
    window.addEventListener('beforeunload', function() { if (typeof saveUserSession === 'function') saveUserSession(); });
    
    // Setup navigation after all modules are loaded
    setTimeout(() => {
        document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (!window.currentUser && !window.isDeveloperModeActive) { 
                    if (typeof showCustomNotification === 'function') showCustomNotification('Please login first', 'warning'); 
                    return; 
                }
                if (window.isDeveloperModeActive) { 
                    if (typeof showCustomNotification === 'function') showCustomNotification('Exit developer mode to access features', 'warning'); 
                    return; 
                }
                const action = newLink.getAttribute('data-action');
                if (action && typeof switchContent === 'function') switchContent(action);
            });
        });
        
        // Setup enrollment buttons after navigation is ready
        setupEnrollmentButtons();
    }, 100);
    
    if (typeof customConsoleLog === 'function') {
        customConsoleLog("System Ready - All Features Implemented", 'success');
        customConsoleLog("Developer Mode: Click ⚡ (Code: 712189) | Admin: admin@school.edu / admin123", 'info');
    }
});

// Setup enrollment buttons - called after DOM is ready and again when content switches
function setupEnrollmentButtons() {
    console.log('[Main] Setting up enrollment buttons...');
    
    // Confirm Schedule Button
    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) {
        // Remove old listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Main] Confirm button clicked');
            if (typeof confirmSchedule === 'function') {
                // First check for conflicts
                if (typeof getSelectedSubjectsFromUI === 'function') {
                    const selected = getSelectedSubjectsFromUI();
                    if (typeof getAllConflicts === 'function') {
                        const conflicts = getAllConflicts(selected);
                        if (conflicts.length > 0) {
                            showCustomNotification('❌ Cannot confirm: Schedule conflict detected! Please resolve conflicts first.', 'error');
                            return;
                        }
                    }
                }
                confirmSchedule();
            } else {
                console.error('[Main] confirmSchedule function not found');
                showCustomNotification('Error: Enrollment function not available', 'error');
            }
        });
        console.log('[Main] Confirm button bound');
    }
    
    // Modify Schedule Button
    const modifyBtn = document.getElementById('modifyScheduleBtn');
    if (modifyBtn) {
        const newModifyBtn = modifyBtn.cloneNode(true);
        modifyBtn.parentNode.replaceChild(newModifyBtn, modifyBtn);
        newModifyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Main] Modify button clicked');
            if (typeof modifySchedule === 'function') {
                modifySchedule();
            } else {
                console.error('[Main] modifySchedule function not found');
                showCustomNotification('Error: Modify function not available', 'error');
            }
        });
        console.log('[Main] Modify button bound');
    }
    
    // Schedule Generator Submit Button
    const generateBtn = document.getElementById('generateCustomScheduleBtn');
    if (generateBtn) {
        const newGenerateBtn = generateBtn.cloneNode(true);
        generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);
        newGenerateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[Main] Generate schedule button clicked');
            if (typeof generateSchedule === 'function') {
                generateSchedule();
            }
        });
    }
    
    // Submit Schedule Change Button
    const submitChangeBtn = document.getElementById('submitScheduleChangeBtn');
    if (submitChangeBtn) {
        const newSubmitBtn = submitChangeBtn.cloneNode(true);
        submitChangeBtn.parentNode.replaceChild(newSubmitBtn, submitChangeBtn);
        newSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[Main] Submit schedule change button clicked');
            if (typeof submitScheduleChangeRequest === 'function') {
                submitScheduleChangeRequest();
            }
        });
    }
    
    // Reset Schedule Button
    const resetBtn = document.getElementById('resetScheduleBtn');
    if (resetBtn) {
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        newResetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[Main] Reset schedule button clicked');
            if (typeof resetScheduleDraftToDefault === 'function') {
                resetScheduleDraftToDefault();
            }
        });
    }
}

// Make setupEnrollmentButtons available globally
window.setupEnrollmentButtons = setupEnrollmentButtons;

// Also call setupEnrollmentButtons when switching to self-enrollment content
const originalSwitchContent = window.switchContent;
window.switchContent = function(action) {
    if (originalSwitchContent) originalSwitchContent(action);
    if (action === 'self-enrollment') {
        setTimeout(setupEnrollmentButtons, 100);
    }
    if (action === 'sched-gen-1') {
        setTimeout(setupEnrollmentButtons, 100);
    }
};

// Expose modal close functions globally
window.closeConfirmEnrollmentModal = function() { 
    const modal = document.getElementById('confirmEnrollmentModal'); 
    if (modal) modal.style.display = 'none'; 
};

window.closeModifyModal = function() { 
    const modal = document.getElementById('scheduleModifyModal'); 
    if (modal) modal.style.display = 'none'; 
};

window.closeOtpModal = function() { 
    const modal = document.getElementById('otpSentModal'); 
    if (modal) modal.style.display = 'none'; 
};

window.togglePassword = function(id) { 
    const input = document.getElementById(id); 
    if (input) input.type = input.type === 'password' ? 'text' : 'password'; 
};