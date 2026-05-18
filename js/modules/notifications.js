/* ============================================
   NOTIFICATIONS MODULE - Color-coded cards
   ============================================ */

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

function deleteNotification(notificationId, notificationType) {
    if (confirm('Are you sure you want to remove this announcement?')) {
        const index = window.notificationsDB[notificationType].findIndex(n => n.id == notificationId);
        if (index !== -1) {
            window.notificationsDB[notificationType].splice(index, 1);
            saveNotifications();
            if (typeof customConsoleLog === 'function') customConsoleLog(`Notification deleted: ${notificationId}`, 'success');
            showCustomNotification('Announcement removed', 'success');
            loadNotificationsView();
        }
    }
}

function clearNotifications(notificationType = null) {
    let message = '';
    if (notificationType === 'schedule') {
        message = 'Are you sure you want to clear ALL schedule change announcements?';
    } else if (notificationType === 'room') {
        message = 'Are you sure you want to clear ALL room change announcements?';
    } else if (notificationType === 'professor') {
        message = 'Are you sure you want to clear ALL professor change announcements?';
    } else {
        message = 'Are you sure you want to clear ALL announcements? This cannot be undone.';
    }
    
    if (confirm(message)) {
        if (notificationType) {
            window.notificationsDB[notificationType] = [];
        } else {
            window.notificationsDB = { schedule: [], room: [], professor: [] };
        }
        saveNotifications();
        if (typeof customConsoleLog === 'function') customConsoleLog(`Cleared ${notificationType || 'all'} notifications`, 'success');
        showCustomNotification('Announcements cleared', 'success');
        loadNotificationsView();
    }
}

function loadNotificationsView() {
    console.log("[Notifications] Loading notifications view...");
    
    if (!window.currentUser || window.currentUser.type !== 'student') {
        console.log("[Notifications] Not a student or no user");
        return;
    }
    
    const container = document.getElementById('studentNotificationsList');
    if (!container) {
        console.log("[Notifications] Container not found!");
        return;
    }
    
    let all = [];
    if (window.notificationsDB.schedule) window.notificationsDB.schedule.forEach(n => all.push({ ...n, type: 'schedule' }));
    if (window.notificationsDB.room) window.notificationsDB.room.forEach(n => all.push({ ...n, type: 'room' }));
    if (window.notificationsDB.professor) window.notificationsDB.professor.forEach(n => all.push({ ...n, type: 'professor' }));
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("[Notifications] Found", all.length, "notifications");
    
    let html = `
        <div class="notifications-header">
            <h3><i class="fas fa-bell"></i> Announcements & Updates</h3>
            <div class="notifications-actions">
                <button class="clear-all-btn" onclick="clearNotifications()">
                    <i class="fas fa-trash-alt"></i> Clear All
                </button>
            </div>
        </div>
    `;
    
    if (all.length === 0) { 
        html += '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No announcements at this time.</p><small>Check back later for updates</small></div>'; 
        container.innerHTML = html;
        return; 
    }
    
    html += '<div class="notifications-color-grid">';
    
    all.forEach(n => { 
        const icon = n.type === 'schedule' ? 'fa-calendar-alt' : n.type === 'room' ? 'fa-door-open' : 'fa-chalkboard-teacher';
        const typeName = n.type === 'schedule' ? 'Schedule Change' : n.type === 'room' ? 'Room Change' : 'Professor Change';
        const date = new Date(n.date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let cardClass = '';
        if (n.type === 'schedule') {
            cardClass = 'notification-card-yellow';
        } else if (n.type === 'room') {
            cardClass = 'notification-card-blue';
        } else {
            cardClass = 'notification-card-orange';
        }
        
        html += `
            <div class="notification-card ${cardClass}" data-id="${n.id}" data-type="${n.type}">
                <div class="notification-card-header">
                    <div class="notification-icon-circle">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-card-actions">
                        <span class="notification-type-badge">${typeName}</span>
                        <button class="delete-notification-btn" onclick="deleteNotification(${n.id}, '${n.type}')" title="Delete this announcement">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="notification-card-title">${escapeHtml(n.title)}</div>
                <div class="notification-card-details">${escapeHtml(n.details || 'No additional details')}</div>
                <div class="notification-card-reason">
                    <i class="fas fa-quote-left"></i> ${escapeHtml(n.reason || 'No reason provided')}
                </div>
                <div class="notification-card-footer">
                    <i class="fas fa-calendar-alt"></i> ${formattedDate} at ${formattedTime}
                </div>
            </div>
        `; 
    });
    html += '</div>';
    container.innerHTML = html;
    console.log("[Notifications] View loaded successfully");
}

function addNotification(type, title, details, reason) {
    const notification = { id: Date.now(), title, details, reason, date: new Date().toISOString() };
    if (type === 'schedule') window.notificationsDB.schedule.unshift(notification);
    else if (type === 'room') window.notificationsDB.room.unshift(notification);
    else window.notificationsDB.professor.unshift(notification);
    saveNotifications();
    if (typeof customConsoleLog === 'function') customConsoleLog(`NOTIFICATION POSTED: ${title}`, 'action');
    showCustomNotification(`Announcement posted: ${title}`, 'success');
}

function showFloatingNotification(title, message, type = 'success') {
    const existing = document.getElementById('floatingNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'floatingNotification';
    notification.className = `floating-notification ${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'info') icon = 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="floating-notification-icon"><i class="fas ${icon}"></i></div>
        <div class="floating-notification-content">
            <div class="floating-notification-title">${escapeHtml(title)}</div>
            <div class="floating-notification-message">${escapeHtml(message)}</div>
        </div>
        <button class="floating-notification-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

window.showCustomNotification = showCustomNotification;
window.loadNotificationsView = loadNotificationsView;
window.addNotification = addNotification;
window.deleteNotification = deleteNotification;
window.clearNotifications = clearNotifications;

console.log("[Notifications Module] Loaded");