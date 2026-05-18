/* ============================================
   ENROLLMENT MODULE - Self-enrollment
   COMPLETE - All enrollment functionality
   ============================================ */

function filterSubjectsByTerm(subjects, termType, termPeriod) {
    if (!subjects || subjects.length === 0) return subjects;
    const dist = TERM_DISTRIBUTIONS[termType] || TERM_DISTRIBUTIONS['Semester'];
    const periodIndex = dist.periods.indexOf(termPeriod);
    if (subjects.length < 14 || periodIndex === -1) return subjects;
    
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

function populateCollegePrograms() {
    const collegeProgramSelect = document.getElementById('collegeProgramSelect');
    if (!collegeProgramSelect) return;
    
    const programs = [
        "Bachelor of Science in Information Technology",
        "Bachelor of Science in Computer Science",
        "Bachelor of Science in Tourism Management",
        "Bachelor of Science in Business Administration",
        "Bachelor of Science in Accountancy",
        "Bachelor of Science in Civil Engineering",
        "Bachelor of Science in Nursing",
        "Bachelor of Elementary Education"
    ];
    
    const previousValue = collegeProgramSelect.value;
    collegeProgramSelect.innerHTML = '<option value="">— Select Program —</option>';
    programs.forEach(program => {
        collegeProgramSelect.innerHTML += `<option value="${escapeHtml(program)}">${escapeHtml(program)}</option>`;
    });
    if (previousValue && programs.includes(previousValue)) {
        collegeProgramSelect.value = previousValue;
    }
}

// Parse schedule string into slots - FIXED to handle various formats
function parseScheduleSlots(scheduleString) {
    if (!scheduleString) return [{ day: 'Monday', time: '8:00 AM - 10:00 AM' }];
    const parts = String(scheduleString).split(';').map(p => p.trim()).filter(Boolean);
    const slots = [];
    const days = DAYS_OF_WEEK;
    const times = TIME_SLOTS;
    
    parts.forEach(part => {
        for (let day of days) {
            if (part.startsWith(day) || part.includes(day)) {
                let timePart = part.replace(day, "").trim();
                // Check if timePart matches any known time slot
                let matchedTime = times.find(t => timePart === t || timePart.includes(t));
                if (matchedTime) {
                    slots.push({ day: day, time: matchedTime });
                } else if (times.includes(timePart)) {
                    slots.push({ day: day, time: timePart });
                } else {
                    slots.push({ day: day, time: times[0] });
                }
                break;
            }
        }
    });
    return slots.length ? slots : [{ day: 'Monday', time: '8:00 AM - 10:00 AM' }];
}

// Check for conflicts between subjects - IMPROVED
function hasScheduleConflict(subject1, subject2) {
    if (!subject1 || !subject2) return false;
    if (subject1.name === subject2.name) return false;
    
    const slots1 = parseScheduleSlots(subject1.schedule);
    const slots2 = parseScheduleSlots(subject2.schedule);
    
    for (let s1 of slots1) {
        for (let s2 of slots2) {
            if (s1.day === s2.day && s1.time === s2.time) {
                return true;
            }
        }
    }
    return false;
}

// Get selected subjects from the UI
function getSelectedSubjectsFromUI() {
    const allSubjects = (window.pendingEnrollment && window.pendingEnrollment.subjects) || [];
    const cards = document.querySelectorAll('#availableSubjectsList .subject-card');
    const selected = [];
    
    cards.forEach(card => {
        const cb = card.querySelector('.subject-checkbox');
        if (cb && cb.checked) {
            const idx = parseInt(card.getAttribute('data-subject-index'), 10);
            if (!isNaN(idx) && allSubjects[idx]) {
                selected.push(allSubjects[idx]);
            }
        }
    });
    return selected;
}

// Get all conflicts among selected subjects
function getAllConflicts(selectedSubjects) {
    const conflicts = [];
    for (let i = 0; i < selectedSubjects.length; i++) {
        for (let j = i + 1; j < selectedSubjects.length; j++) {
            if (hasScheduleConflict(selectedSubjects[i], selectedSubjects[j])) {
                conflicts.push({
                    subject1: selectedSubjects[i],
                    subject2: selectedSubjects[j]
                });
            }
        }
    }
    return conflicts;
}

// Update button states based on conflicts
function updateEnrollmentButtonsState() {
    const selectedSubjects = getSelectedSubjectsFromUI();
    const confirmBtn = document.getElementById('confirmScheduleBtn');
    const modifyBtn = document.getElementById('modifyScheduleBtn');
    
    if (!confirmBtn || !modifyBtn) return;
    
    const conflicts = getAllConflicts(selectedSubjects);
    const hasAnyConflict = conflicts.length > 0;
    
    if (selectedSubjects.length === 0) {
        // Nothing selected – both buttons grey out
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
        modifyBtn.disabled = true;
        modifyBtn.style.opacity = '0.5';
        modifyBtn.style.cursor = 'not-allowed';
    } else if (hasAnyConflict) {
        // Conflicts – only lock Confirm; Modify stays active so user can go fix them in Sched. Gen.
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
        modifyBtn.disabled = false;
        modifyBtn.style.opacity = '1';
        modifyBtn.style.cursor = 'pointer';
    } else {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
        modifyBtn.disabled = false;
        modifyBtn.style.opacity = '1';
        modifyBtn.style.cursor = 'pointer';
    }
    
    // Update summary clash display
    updateEnrollmentSummaryWithConflicts(selectedSubjects, conflicts);
    
    return hasAnyConflict;
}

// Update enrollment summary with conflict display
function updateEnrollmentSummaryWithConflicts(selectedSubjects, conflicts) {
    const summaryBar = document.getElementById('enrollmentSummaryBar');
    const clashBox = document.getElementById('summaryClashBox');
    const clashText = document.getElementById('summaryClashText');
    const selectedCountEl = document.getElementById('summarySelectedCount');
    const totalUnitsEl = document.getElementById('summaryTotalUnits');
    
    if (summaryBar) {
        summaryBar.style.display = selectedSubjects.length > 0 ? 'flex' : 'none';
    }
    
    if (selectedCountEl) {
        selectedCountEl.textContent = selectedSubjects.length;
    }
    
    if (totalUnitsEl) {
        const totalUnits = selectedSubjects.reduce((sum, s) => sum + (parseInt(s.units) || 3), 0);
        totalUnitsEl.textContent = totalUnits;
    }
    
    if (clashBox && clashText) {
        if (conflicts.length === 0) {
            clashBox.style.display = 'none';
            clashBox.classList.remove('clash-active');
        } else {
            clashBox.style.display = 'flex';
            clashBox.classList.add('clash-active');
            const firstConflict = conflicts[0];
            const moreCount = conflicts.length - 1;
            clashText.innerHTML = `<strong>SCHEDULE CLASH:</strong> "${firstConflict.subject1.name}" ↔ "${firstConflict.subject2.name}" overlap${moreCount > 0 ? ` (and ${moreCount} more)` : ''}. Untick one to resolve.`;
        }
    }
}

// Update card colors based on conflicts - FIXED to actually highlight conflicting cards
function updateCardColors() {
    const selectedSubjects = getSelectedSubjectsFromUI();
    const cards = document.querySelectorAll('#availableSubjectsList .subject-card');
    const allSubjects = (window.pendingEnrollment && window.pendingEnrollment.subjects) || [];
    
    // First, find all conflicts
    const conflicts = getAllConflicts(selectedSubjects);
    const conflictingSubjectNames = new Set();
    
    conflicts.forEach(conflict => {
        conflictingSubjectNames.add(conflict.subject1.name);
        conflictingSubjectNames.add(conflict.subject2.name);
    });
    
    // Update each card
    cards.forEach(card => {
        const cb = card.querySelector('.subject-checkbox');
        const idx = parseInt(card.getAttribute('data-subject-index'), 10);
        const subject = allSubjects[idx];
        
        if (cb && cb.checked && subject) {
            const hasConflict = conflictingSubjectNames.has(subject.name);
            if (hasConflict) {
                card.classList.add('clash-flag');
                card.classList.remove('selected');
            } else {
                card.classList.remove('clash-flag');
                card.classList.add('selected');
            }
            // Let CSS classes handle all visual styling – clear any lingering inline overrides
            card.style.removeProperty('border');
            card.style.removeProperty('box-shadow');
            card.style.removeProperty('background-color');
            card.style.removeProperty('background');
        } else {
            card.classList.remove('selected');
            card.classList.remove('clash-flag');
            card.style.removeProperty('border');
            card.style.removeProperty('box-shadow');
            card.style.removeProperty('background-color');
            card.style.removeProperty('background');
        }
    });
    
    // Update button states
    updateEnrollmentButtonsState();
    refreshPreviewSchedule();
}

function initSelfEnrollment() {
    console.log("[Enrollment] Initializing self-enrollment...");
    
    populateCollegePrograms();
    
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
            if (termType === 'Semester') options = ['1st Semester', '2nd Semester'];
            else if (termType === 'Tri-Semester') options = ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'];
            else if (termType === 'Quarter') options = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
            else if (termType === 'Block Plan') options = ['Block A', 'Block B'];
            
            termPeriodSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            const enrollmentLevelVal = document.getElementById('enrollmentLevel');
            if (enrollmentLevelVal && enrollmentLevelVal.value) {
                loadSubjectsForLevel();
            }
        });
    }
    
    const termPeriodSelectInit = document.getElementById('termPeriodSelect');
    if (termPeriodSelectInit) {
        termPeriodSelectInit.addEventListener('change', function() {
            const enrollmentLevelVal = document.getElementById('enrollmentLevel');
            if (enrollmentLevelVal && enrollmentLevelVal.value) {
                loadSubjectsForLevel();
            }
        });
    }
    
    // Setup search functionality
    const subjectSearchInput = document.getElementById('subjectSearchInput');
    if (subjectSearchInput) {
        subjectSearchInput.addEventListener('input', function() {
            filterSubjectCards(this.value);
        });
    }
}

function filterSubjectCards(searchTerm) {
    const cards = document.querySelectorAll('#availableSubjectsList .subject-card');
    const term = searchTerm.toLowerCase().trim();
    
    cards.forEach(card => {
        const subjectName = card.querySelector('.subject-info strong')?.textContent.toLowerCase() || '';
        const matches = term === '' || subjectName.includes(term);
        card.style.display = matches ? 'flex' : 'none';
    });
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
    
    window.pendingEnrollment = { subjects, levelInfo };
    displayAvailableSubjects(subjects);
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
        let badgeClass = 'subject-badge-major';
        let categoryDisplay = 'MAJOR';
        if (subject.category === 'ge') {
            badgeClass = 'subject-badge-ge';
            categoryDisplay = 'GE';
        } else if (subject.category === 'elective') {
            badgeClass = 'subject-badge-elective';
            categoryDisplay = 'ELECTIVE';
        } else if (subject.category === 'minor') {
            badgeClass = 'subject-badge-minor';
            categoryDisplay = 'MINOR';
        } else if (subject.category === 'research') {
            badgeClass = 'subject-badge-research';
            categoryDisplay = 'RESEARCH';
        } else if (subject.category === 'practicum') {
            badgeClass = 'subject-badge-practicum';
            categoryDisplay = 'PRACTICUM';
        }
        
        const unitsDisplay = subject.units ? `${subject.units} units` : '3 units';
        const scheduleDisplay = subject.schedule || 'Schedule TBD';
        
        html += `<div class="subject-card" data-subject-index="${idx}" style="transition: all 0.2s ease;">
                    <input type="checkbox" class="subject-checkbox" value="${subject.name.replace(/'/g, "\\'")}">
                    <div class="subject-info">
                        <strong>${escapeHtml(subject.name)}</strong>
                        <div class="subject-badges">
                            <span class="${badgeClass}">${categoryDisplay}</span>
                            <span class="subject-badge-units"><i class="fas fa-hourglass-half"></i> ${unitsDisplay}</span>
                        </div>
                        <div class="subject-details">
                            <small><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</small>
                            <small><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</small>
                            <small><i class="fas fa-calendar-week"></i> ${escapeHtml(scheduleDisplay)}</small>
                        </div>
                    </div>
                </div>`;
    });
    container.innerHTML = html;
    
    document.querySelectorAll('.subject-card').forEach(card => {
        const cb = card.querySelector('.subject-checkbox');
        
        card.addEventListener('click', (e) => {
            if (e.target !== cb && e.target !== card.querySelector('.subject-info strong') && !card.querySelector('.subject-info').contains(e.target)) {
                cb.checked = !cb.checked;
                updateCardColors();
                refreshPreviewSchedule();
            }
        });
        if (cb) {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                updateCardColors();
                refreshPreviewSchedule();
            });
        }
    });
    
    updateCardColors();
}

function refreshPreviewSchedule() {
    const selectedSubjects = getSelectedSubjectsFromUI();
    renderScheduleTable(selectedSubjects, 'previewScheduleTable');
}

function getActiveScheduleSubjects() {
    if (window.currentUser && window.currentUser.data && Array.isArray(window.currentUser.data.enrolledSubjects) && window.currentUser.data.enrolledSubjects.length > 0) {
        return window.currentUser.data.enrolledSubjects;
    }
    const selected = getSelectedSubjectsFromUI();
    if (selected.length > 0) return selected;
    if (window.pendingEnrollment && window.pendingEnrollment.subjects) {
        return window.pendingEnrollment.subjects;
    }
    return [];
}

function confirmSchedule() {
    console.log("[Enrollment] confirmSchedule called");
    
    if (!window.pendingEnrollment) { 
        showCustomNotification('Please select your education level and subjects first', 'warning'); 
        return; 
    }
    
    var selectedSubjects = getSelectedSubjectsFromUI();
    console.log("[Enrollment] Selected subjects:", selectedSubjects.length);
    
    if (selectedSubjects.length === 0) { 
        showCustomNotification('Please select at least one subject to enroll', 'warning'); 
        return; 
    }
    
    var conflicts = getAllConflicts(selectedSubjects);
    console.log("[Enrollment] Conflicts detected:", conflicts.length);
    
    if (conflicts.length > 0) {
        showCustomNotification('Cannot confirm enrollment due to schedule conflicts. Please resolve conflicts first.', 'error');
        return;
    }
    
    var termType = document.getElementById('academicTermSelect')?.value || 'Semester';
    var termPeriod = document.getElementById('termPeriodSelect')?.value || '1st Semester';
    
    if (window.currentUser && window.currentUser.type === 'student') {
        window.currentUser.data.level = window.pendingEnrollment.levelInfo.level;
        window.currentUser.data.sublevel = window.pendingEnrollment.levelInfo.sublevel;
        window.currentUser.data.strand = window.pendingEnrollment.levelInfo.strand;
        window.currentUser.data.program = window.pendingEnrollment.levelInfo.program;
        window.currentUser.data.yearLevel = window.pendingEnrollment.levelInfo.year;
        window.currentUser.data.enrolledSubjects = selectedSubjects;
        window.currentUser.data.defaultSchedule = deepClone(selectedSubjects);
        window.currentUser.data.scheduleConfirmed = true;
        window.currentUser.data.termType = termType;
        window.currentUser.data.termPeriod = termPeriod;
        ensureSlotFields(window.currentUser.data);
        
        var idx = window.usersDB.students.findIndex(function(s) { return s.id === window.currentUser.data.id; });
        if (idx !== -1) {
            window.usersDB.students[idx] = deepClone(window.currentUser.data);
        }
        saveData();
        
        if (typeof unlockScheduleGenerator === 'function') unlockScheduleGenerator();
        
        customConsoleLog('Schedule confirmed with ' + selectedSubjects.length + ' subjects', 'success');
        showCustomNotification('✅ Successfully enrolled in ' + selectedSubjects.length + ' subjects!', 'success');
        
        // SHOW THE SELF-ENROLLMENT SUCCESS POPUP (matches Schedule Generator popup style)
        var countEl = document.getElementById('selfEnrollCount');
        if (countEl) countEl.textContent = selectedSubjects.length;
        
        var successPopup = document.getElementById('selfEnrollmentPopup');
        if (successPopup) successPopup.style.display = 'flex';
        
        if (typeof switchContent === 'function') {
            // Wait for popup to be seen before redirecting
            setTimeout(function() {
                switchContent('student-registration');
            }, 3000);
        }
        if (typeof updateRegistrationForm === 'function') updateRegistrationForm();
    }
}

function modifySchedule() {
    console.log("[Enrollment] modifySchedule called");
    
    if (!window.currentUser) {
        showCustomNotification('Please login first', 'warning');
        return;
    }
    
    const selectedSubjects = getSelectedSubjectsFromUI();
    console.log("[Enrollment] Selected subjects for modify:", selectedSubjects.length);
    
    if (selectedSubjects.length === 0) {
        showCustomNotification('Please select your level and subjects first.', 'warning');
        if (typeof switchContent === 'function') switchContent('self-enrollment');
        return;
    }
    
    if (window.currentUser && window.currentUser.type === 'student') {
        window.currentUser.data.enrolledSubjects = selectedSubjects;
        window.currentUser.data.defaultSchedule = deepClone(selectedSubjects);
        window.currentUser.data.scheduleConfirmed = true;
        ensureSlotFields(window.currentUser.data);
        const idx = window.usersDB.students.findIndex(s => s.id === window.currentUser.data.id);
        if (idx !== -1) window.usersDB.students[idx] = deepClone(window.currentUser.data);
        saveData();
    }
    
    if (typeof unlockScheduleGenerator === 'function') unlockScheduleGenerator();
    if (typeof switchContent === 'function') switchContent('sched-gen-1');
    
    setTimeout(function() {
        const enrolledSubjects = selectedSubjects;
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
        renderScheduleTable(enrolledSubjects, 'scheduleResult');
        showCustomNotification('Schedule loaded successfully!', 'success');
    }, 100);
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

// Expose functions globally
window.initSelfEnrollment = initSelfEnrollment;
window.loadSubjectsForLevel = loadSubjectsForLevel;
window.displayAvailableSubjects = displayAvailableSubjects;
window.refreshPreviewSchedule = refreshPreviewSchedule;
window.getActiveScheduleSubjects = getActiveScheduleSubjects;
window.filterSubjectsByTerm = filterSubjectsByTerm;
window.confirmSchedule = confirmSchedule;
window.modifySchedule = modifySchedule;
window.populateCollegePrograms = populateCollegePrograms;
window.getSelectedSubjectsFromUI = getSelectedSubjectsFromUI;
window.hasScheduleConflict = hasScheduleConflict;
window.updateEnrollmentButtonsState = updateEnrollmentButtonsState;
window.updateCardColors = updateCardColors;
window.showFloatingNotification = showFloatingNotification;
window.getAllConflicts = getAllConflicts;

console.log('[Enrollment Module] Loaded');