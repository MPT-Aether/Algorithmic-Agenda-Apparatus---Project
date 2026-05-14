/* ============================================
   HELPER FUNCTIONS & UTILITIES
   ============================================ */

function escapeHtml(str) {
    if (!str) return str;
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function generateStudentId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const existingIds = (window.usersDB?.students || []).map(s => s.id);
    let maxSeq = 0;
    const pattern = new RegExp(`^${year}${month}${day}-(\\d+)$`);
    existingIds.forEach(id => { const match = id.match(pattern); if (match) maxSeq = Math.max(maxSeq, parseInt(match[1])); });
    return `${year}${month}${day}-${String(maxSeq + 1).padStart(4, '0')}`;
}

function validatePassword(password) {
    return { 
        length: password.length >= 12, 
        uppercase: /[A-Z]/.test(password), 
        number: /[0-9]/.test(password), 
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password) 
    };
}

function formatDate(date) {
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function getSubjectSchedule(subjectName, index) {
    const hash = (subjectName.length * 7 + index * 13) % SCHEDULE_TIME_SLOTS.length;
    const secondHash = (hash + 7) % SCHEDULE_TIME_SLOTS.length;
    return `${SCHEDULE_TIME_SLOTS[hash]}; ${SCHEDULE_TIME_SLOTS[secondHash]}`;
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

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function ensureSlotFields(student) {
    if (typeof student.scheduleChangeLimit !== 'number') {
        student.scheduleChangeLimit = APP_CONFIG.SCHEDULE_CHANGE_LIMIT;
    }
    if (typeof student.scheduleChangesUsed !== 'number') {
        student.scheduleChangesUsed = 0;
    }
}

function getSlotsRemaining(student) {
    ensureSlotFields(student);
    return Math.max(0, student.scheduleChangeLimit - student.scheduleChangesUsed);
}

// Make helpers globally available
window.escapeHtml = escapeHtml;
window.generateStudentId = generateStudentId;
window.validatePassword = validatePassword;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.getSubjectSchedule = getSubjectSchedule;
window.assignSchedulesToSubjects = assignSchedulesToSubjects;
window.getScheduleInfo = getScheduleInfo;
window.deepClone = deepClone;
window.ensureSlotFields = ensureSlotFields;
window.getSlotsRemaining = getSlotsRemaining;