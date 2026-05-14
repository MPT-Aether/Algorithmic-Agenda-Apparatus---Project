/* ============================================
   CONSOLE MODULE
   ============================================ */

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
        clearCustomConsole();
    } else if (command === 'stats') {
        customConsoleLog(`System Statistics:`, 'success');
        customConsoleLog(`- Students: ${window.usersDB.students.length}`, 'info');
        customConsoleLog(`- Admins: ${window.usersDB.admins.length}`, 'info');
        let totalEnrollments = window.usersDB.students.reduce((sum, s) => sum + (s.enrolledSubjects?.length || 0), 0);
        customConsoleLog(`- Total Enrollments: ${totalEnrollments}`, 'info');
        let completedReg = window.usersDB.students.filter(s => s.registrationCompleted).length;
        customConsoleLog(`- Completed Registrations: ${completedReg}`, 'info');
        let pendingRequests = (window.usersDB.scheduleChangeRequests || []).filter(r => r.status === 'pending').length;
        customConsoleLog(`- Pending Schedule Requests: ${pendingRequests}`, 'info');
    } else {
        customConsoleLog(`Unknown command: ${command}. Type 'help'`, 'error');
    }
    input.value = '';
}

function initializeConsole() {
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
}

window.customConsoleLog = customConsoleLog;
window.showCustomConsole = showCustomConsole;
window.hideCustomConsole = hideCustomConsole;
window.clearCustomConsole = clearCustomConsole;
window.executeConsoleCommand = executeConsoleCommand;
window.initializeConsole = initializeConsole;