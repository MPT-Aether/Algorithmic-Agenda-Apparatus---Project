/* ============================================
   SCHEDULE MODULE - Display and generation
   WITH WORKING TOGGLE BETWEEN DEFAULT AND MODIFIED SCHEDULES
   ============================================ */

let scheduleDraft = null;
let currentScheduleView = 'default';

function toggleScheduleView() {
    const defaultCard = document.querySelector('#scheduleHistorySection .schedule-history-card:first-child');
    const modifiedCard = document.querySelector('#scheduleHistorySection .schedule-history-card:last-child');
    const toggleBtn = document.getElementById('toggleScheduleViewBtn');
    
    if (!defaultCard || !modifiedCard) return;
    
    if (currentScheduleView === 'default') {
        // Hide default card, show modified card
        defaultCard.style.display = 'none';
        modifiedCard.style.display = 'block';
        currentScheduleView = 'modified';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-calendar-day"></i> Show Default Schedule';
    } else {
        // Show default card, hide modified card
        defaultCard.style.display = 'block';
        modifiedCard.style.display = 'none';
        currentScheduleView = 'default';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-pen-fancy"></i> Show Modified Schedule';
    }
}

function renderScheduleTable(subjects, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        if (typeof customConsoleLog === 'function') customConsoleLog(`ERROR: Container ${containerId} not found`, 'error');
        return;
    }
    
    if (!subjects || subjects.length === 0) {
        const isPreview = containerId === 'previewScheduleTable';
        const headline = isPreview ? 'No subjects selected yet.' : 'No subjects enrolled yet.';
        const subline = isPreview ? 'Tick a subject from the list above to see it appear on this schedule canvas.' : 'Please go to Self-Enrollment to select your subjects.';
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 16px; display: block;"></i><p>${headline}</p><p>${subline}</p></div>`;
        return;
    }
    
    const days = DAYS_OF_WEEK;
    const times = TIME_SLOTS;
    
    let scheduleGrid = {};
    days.forEach(day => {
        scheduleGrid[day] = {};
        times.forEach(time => { scheduleGrid[day][time] = null; });
    });
    
    subjects.forEach(subject => {
        let subjectSchedule = subject.schedule || "";
        let scheduleParts = subjectSchedule.split('; ');
        scheduleParts.forEach(part => {
            if (part && part.trim()) {
                for (let day of days) {
                    if (part.includes(day)) {
                        let timePart = part.replace(day, "").trim();
                        for (let time of times) {
                            if (timePart === time) {
                                if (scheduleGrid[day][time] === null) scheduleGrid[day][time] = subject;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        });
    });
    
    let html = '<div style="overflow-x: auto;"><table class="schedule-table-fixed" style="width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #a0aec0;">';
    html += '<thead><tr style="background: linear-gradient(135deg, #FFB347, #FF8C00); color: white; text-align: center;">';
    html += '<th style="padding: 14px; text-align: center; font-weight: 600;">Time</th>';
    days.forEach(day => { html += `<th style="padding: 14px; text-align: center; font-weight: 600;">${day}</th>`; });
    html += '<tr></thead><tbody>';
    
    times.forEach(time => {
        html += '<tr style="border-bottom: 1px solid #e2e8f0;">';
        html += `<td style="padding: 12px; background: #f8fafc; font-weight: 600; text-align: center; border: 1px solid #a0aec0;">${time}</td>`;
        days.forEach(day => {
            const subject = scheduleGrid[day][time];
            if (subject) {
                html += `<td style="padding: 12px; border: 1px solid #a0aec0; vertical-align: top; background: white;">
                            <div style="font-weight: 700; color: #1e4a6f; margin-bottom: 6px;">${escapeHtml(subject.name)}</div>
                            <div style="font-size: 11px; color: #10B981; margin-top: 4px;"><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</div>
                            <div style="font-size: 11px; color: #FFB347; margin-top: 2px;"><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</div>
                            </td>`;
            } else {
                html += `<td style="padding: 12px; border: 1px solid #a0aec0; text-align: center; color: #94a3b8; font-style: italic; background: #fefefe;">— Free —</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    if (typeof customConsoleLog === 'function') customConsoleLog(`Schedule displayed for ${subjects.length} subjects`, 'success');
}

function renderScheduleHistorySection() {
    const section = document.getElementById('scheduleHistorySection');
    if (!section || !window.currentUser || window.currentUser.type !== 'student') return;
    
    const data = window.currentUser.data;
    const hasDefault = data.defaultSchedule && data.defaultSchedule.length > 0;
    const hasModified = data.modifiedSchedule && data.modifiedSchedule.length > 0;
    
    if (!hasDefault && !hasModified) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    currentScheduleView = 'default';
    
    function formatScheduleTable(subjects) {
        if (!subjects || !subjects.length) {
            return '<div class="schedule-empty-state"><i class="fas fa-calendar-times"></i><p>No schedule data available.</p></div>';
        }
        
        let html = '<div class="compact-schedule-wrapper"><table class="compact-schedule-table"><thead>';
        html += '<tr><th>Subject</th><th>Type</th><th>Units</th><th>Schedule</th><th>Room</th><th>Professor</th></tr>';
        html += '</thead><tbody>';
        
        subjects.forEach(subject => {
            let meetings = [];
            let scheduleStr = subject.schedule || "";
            if (scheduleStr) {
                scheduleStr.split(';').forEach(part => {
                    for (let d of DAYS_OF_WEEK) {
                        if (part.trim().startsWith(d)) {
                            let timePart = part.replace(d, "").trim();
                            let shortDay = d.substring(0, 3);
                            meetings.push(TIME_SLOTS.includes(timePart) ? `${shortDay} (${timePart})` : shortDay);
                            break;
                        }
                    }
                });
            }
            const categoryDisplay = subject.category ? subject.category.toUpperCase() : 'N/A';
            let badgeClass = '';
            if (categoryDisplay === 'MAJOR') badgeClass = 'type-major';
            else if (categoryDisplay === 'GE') badgeClass = 'type-ge';
            else if (categoryDisplay === 'ELECTIVE') badgeClass = 'type-elective';
            else if (categoryDisplay === 'RESEARCH') badgeClass = 'type-research';
            else if (categoryDisplay === 'PRACTICUM') badgeClass = 'type-practicum';
            else badgeClass = 'type-minor';
            
            html += `<tr>
                        <td class="compact-subject"><strong>${escapeHtml(subject.name)}</strong></td>
                        <td><span class="${badgeClass}" style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${categoryDisplay}</span></td>
                        <td>${subject.units || 3} units</td>
                        <td class="compact-days"><i class="fas fa-calendar"></i> ${meetings.length ? meetings.join(', ') : 'TBD'}</td>
                        <td class="compact-room"><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</td>
                        <td class="compact-prof"><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</td>
                       </tr>`;
        });
        html += '</tbody></table></div>';
        return html;
    }
    
    const defaultContainer = document.getElementById('defaultScheduleDisplay');
    const modifiedContainer = document.getElementById('modifiedScheduleDisplay');
    const toggleBtn = document.getElementById('toggleScheduleViewBtn');
    const statusBadge = document.getElementById('currentScheduleStatus');
    
    const defaultCard = document.querySelector('#scheduleHistorySection .schedule-history-card:first-child');
    const modifiedCard = document.querySelector('#scheduleHistorySection .schedule-history-card:last-child');
    
    if (defaultContainer) {
        defaultContainer.innerHTML = hasDefault ? formatScheduleTable(data.defaultSchedule) : '<div class="schedule-empty-state"><i class="fas fa-calendar-times"></i><p>No default schedule.</p></div>';
    }
    
    if (modifiedContainer) {
        if (hasModified && data.modifiedSchedule && data.modifiedSchedule.length) {
            modifiedContainer.innerHTML = formatScheduleTable(data.modifiedSchedule);
            if (statusBadge && data.modificationStatus) {
                statusBadge.textContent = (data.modificationStatus || 'PENDING').toUpperCase();
                statusBadge.className = 'schedule-status-badge ' + (data.modificationStatus || 'pending');
                statusBadge.style.display = 'inline-block';
            }
        } else {
            modifiedContainer.innerHTML = '<div class="schedule-empty-state"><i class="fas fa-pen-fancy"></i><p>No modification submitted yet. Use the Schedule Generator to propose changes.</p></div>';
            if (statusBadge) statusBadge.style.display = 'none';
        }
    }
    
    // Set initial visibility - show default card, hide modified card
    if (defaultCard) defaultCard.style.display = 'block';
    if (modifiedCard) modifiedCard.style.display = 'none';
    currentScheduleView = 'default';
    
    // REMOVE THE DEFAULT SCHEDULE LABEL NEXT TO BUTTON - hide the status badge
    if (statusBadge) {
        statusBadge.style.display = 'none';
    }
    
    if (toggleBtn) {
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        if (hasModified) {
            newToggleBtn.disabled = false;
            newToggleBtn.style.opacity = '1';
            newToggleBtn.style.cursor = 'pointer';
            newToggleBtn.addEventListener('click', toggleScheduleView);
            newToggleBtn.innerHTML = '<i class="fas fa-pen-fancy"></i> Show Modified Schedule';
        } else {
            newToggleBtn.disabled = true;
            newToggleBtn.style.opacity = '0.5';
            newToggleBtn.style.cursor = 'not-allowed';
            newToggleBtn.innerHTML = '<i class="fas fa-pen-fancy"></i> No Modification Yet';
        }
    }
}

function generateSchedule() {
    console.log("[Schedule] Generating schedule...");
    
    if (!window.currentUser) {
        if (typeof showCustomNotification === 'function') showCustomNotification('Please login first', 'warning');
        return;
    }
    
    // CHECK IF ALREADY HAS A PENDING MODIFICATION
    if (window.currentUser.data.modificationStatus === 'pending') {
        var alreadyPopup = document.getElementById('alreadyModifiedPopup');
        if (alreadyPopup) alreadyPopup.style.display = 'flex';
        return;
    }
    
    var subjects = window.currentUser.data.enrolledSubjects || [];
    if (subjects.length === 0) {
        if (typeof showCustomNotification === 'function') showCustomNotification('No subjects enrolled yet', 'warning');
        return;
    }
    
    // Check if schedule is already confirmed (show "Already Enrolled" popup)
    if (window.currentUser.data.scheduleConfirmed === true && window.currentUser.data.registrationCompleted === true) {
        var enrolledCount = subjects.length;
        var enrolledPopup = document.getElementById('enrollmentCompletionPopup');
        var countEl = document.getElementById('enrollCompletionCount');
        if (enrolledPopup && countEl) {
            countEl.textContent = enrolledCount;
            enrolledPopup.style.display = 'flex';
        }
        // Still show the schedule but with the popup
    }
    
    window.scheduleDraft = deepClone(subjects);
    
    var preview = document.getElementById('enrolledSubjectsListPreview');
    if (preview) {
        preview.innerHTML = '';
        window.scheduleDraft.forEach(function(subject) {
            var badge = document.createElement('span');
            badge.className = 'enrolled-preview-badge';
            badge.innerHTML = escapeHtml(subject.name);
            preview.appendChild(badge);
        });
    }
    
    renderScheduleTable(window.scheduleDraft, 'scheduleResult');
    
    if (typeof window.renderSubjectScheduleEditor === 'function') {
        window.renderSubjectScheduleEditor();
    }
    
    var editorSection = document.getElementById('subjectScheduleEditor');
    if (editorSection) editorSection.style.display = 'block';
    
    var slotIndicator = document.getElementById('scheduleSlotIndicator');
    if (slotIndicator) {
        ensureSlotFields(window.currentUser.data);
        var remEl = document.getElementById('slotsRemainingDisplay');
        var limEl = document.getElementById('slotsLimitDisplay');
        if (remEl) remEl.textContent = getSlotsRemaining(window.currentUser.data);
        if (limEl) limEl.textContent = window.currentUser.data.scheduleChangeLimit;
        slotIndicator.style.display = 'flex';
    }
    
    if (typeof showCustomNotification === 'function') showCustomNotification('Schedule generated!', 'success');
}

function unlockScheduleGenerator() {
    const schedGenLink = document.getElementById('schedGenNavItem');
    if (schedGenLink && window.currentUser?.type === 'student') {
        const link = schedGenLink.querySelector('a');
        if (link && window.currentUser.data.enrolledSubjects && window.currentUser.data.enrolledSubjects.length > 0) {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
            const span = link.querySelector('span');
            if (span) span.textContent = 'Sched. Gen.';
            console.log("[UI] Schedule Generator unlocked");
        }
    }
}

// Expose functions globally
window.renderScheduleTable = renderScheduleTable;
window.generateSchedule = generateSchedule;
window.renderScheduleHistorySection = renderScheduleHistorySection;
window.toggleScheduleView = toggleScheduleView;
window.unlockScheduleGenerator = unlockScheduleGenerator;
window.scheduleDraft = scheduleDraft;
window.currentScheduleView = currentScheduleView;

console.log('[Schedule Module] Loaded');