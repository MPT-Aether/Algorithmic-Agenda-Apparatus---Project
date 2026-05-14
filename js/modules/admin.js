/* ============================================
   ADMIN MODULE - Complete with term-based grade management
   ============================================ */

// ============ TERM-BASED GRADE MANAGEMENT FOR ADMIN ============

function loadAdminStudentSelect() {
    const select = document.getElementById('adminStudentSelect');
    if (select) {
        select.innerHTML = '<option value="">Select Student</option>' + window.usersDB.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${s.id})</option>`).join('');
    }
    
    // Add term selector for admin
    const termSelectContainer = document.getElementById('adminTermSelectContainer');
    if (termSelectContainer) {
        const availableTerms = getAvailableTermsForAdmin();
        termSelectContainer.innerHTML = `
            <label>Academic Term</label>
            <select id="adminTermSelect" class="dark-select">
                ${availableTerms.map(term => `<option value="${term}">${term}</option>`).join('')}
            </select>
        `;
    }
    
    const gradeSubjectSelect = document.getElementById('gradeSubjectSelect');
    if (gradeSubjectSelect) {
        gradeSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
    }
    
    const adminStudentSelect = document.getElementById('adminStudentSelect');
    if (adminStudentSelect) {
        adminStudentSelect.addEventListener('change', function() {
            const studentId = this.value;
            // Rebuild term options for this student's term type
            const student = window.usersDB.students.find(s => s.id === studentId);
            const termContainer = document.getElementById('adminTermSelectContainer');
            if (termContainer && student) {
                const termType = student.termType || 'Semester';
                let terms = ['1st Semester', '2nd Semester'];
                if (termType === 'Tri-Semester') terms = ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'];
                if (termType === 'Quarter') terms = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
                if (termType === 'Block Plan') terms = ['Block A', 'Block B'];
                termContainer.innerHTML = `
                    <label>Academic Term</label>
                    <select id="adminTermSelect" class="dark-select">
                        ${terms.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                `;
                document.getElementById('adminTermSelect')?.addEventListener('change', function() {
                    const sid = document.getElementById('adminStudentSelect')?.value;
                    if (sid) loadStudentSubjectsForTerm(sid, this.value);
                });
            }
            refreshAdminSubTermSelect(studentId);
            const selectedTerm = document.getElementById('adminTermSelect')?.value || '1st Semester';
            loadStudentSubjectsForTerm(studentId, selectedTerm);
        });
    }
    
    const adminTermSelect = document.getElementById('adminTermSelect');
    if (adminTermSelect) {
        adminTermSelect.addEventListener('change', function() {
            const studentId = document.getElementById('adminStudentSelect')?.value;
            if (studentId) {
                loadStudentSubjectsForTerm(studentId, this.value);
            }
        });
    }
    
    const saveGradeBtn = document.getElementById('saveGradeBtn');
    if (saveGradeBtn) {
        const newSaveBtn = saveGradeBtn.cloneNode(true);
        saveGradeBtn.parentNode.replaceChild(newSaveBtn, saveGradeBtn);
        newSaveBtn.addEventListener('click', saveGradeWithTerm);
    }

    const saveAttBtn = document.getElementById('saveQuickAttendanceBtn');
    if (saveAttBtn) {
        const newAttBtn = saveAttBtn.cloneNode(true);
        saveAttBtn.parentNode.replaceChild(newAttBtn, saveAttBtn);
        newAttBtn.addEventListener('click', saveQuickAttendance);
    }
}

function getAvailableTermsForAdmin() {
    const studentId = document.getElementById('adminStudentSelect')?.value;
    if (studentId) {
        const student = window.usersDB.students.find(s => s.id === studentId);
        if (student) {
            const termType = student.termType || 'Semester';
            if (termType === 'Semester') return ['1st Semester', '2nd Semester'];
            if (termType === 'Tri-Semester') return ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'];
            if (termType === 'Quarter') return ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
            if (termType === 'Block Plan') return ['Block A', 'Block B'];
        }
    }
    return ['1st Semester', '2nd Semester'];
}

function getSubTermsForTermType(termType) {
    if (termType === 'Semester') return ['Prelim', 'Midterm', 'Finals'];
    if (termType === 'Tri-Semester') return ['Prelim', 'Finals'];
    if (termType === 'Quarter') return ['Midterm', 'Finals'];
    if (termType === 'Block Plan') return ['Prelim', 'Finals'];
    return ['Prelim', 'Midterm', 'Finals'];
}

function refreshAdminSubTermSelect(studentId) {
    const subTermContainer = document.getElementById('adminSubTermSelectContainer');
    if (!subTermContainer) return;
    if (!studentId) {
        subTermContainer.innerHTML = '';
        return;
    }
    const student = window.usersDB.students.find(s => s.id === studentId);
    const termType = student?.termType || 'Semester';
    const subTerms = getSubTermsForTermType(termType);
    subTermContainer.innerHTML = `
        <label>Assessment Period</label>
        <select id="adminSubTermSelect" class="dark-select">
            ${subTerms.map(st => `<option value="${st}">${st}</option>`).join('')}
        </select>
    `;
    document.getElementById('adminSubTermSelect')?.addEventListener('change', function() {
        const sid = document.getElementById('adminStudentSelect')?.value;
        const term = document.getElementById('adminTermSelect')?.value;
        if (sid && term) loadStudentSubjectsForTerm(sid, term);
    });
}

function loadStudentSubjectsForTerm(studentId, term) {
    const student = window.usersDB.students.find(s => s.id === studentId);
    const gradeSubjectSelect = document.getElementById('gradeSubjectSelect');
    const currentGradeDisplay = document.getElementById('currentGradeDisplay');
    const currentAttendanceDisplay = document.getElementById('currentAttendanceDisplay');
    
    if (student && student.enrolledSubjects && gradeSubjectSelect) {
        gradeSubjectSelect.innerHTML = '<option value="">Select Subject</option>' + 
            student.enrolledSubjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${s.category ? s.category.toUpperCase() : 'N/A'} | ${s.units || 3} units)</option>`).join('');
        
        // Add event listener to show current grade when subject is selected
        gradeSubjectSelect.onchange = function() {
            const subject = this.value;
            const subTerm = document.getElementById('adminSubTermSelect')?.value || '';
            if (subject && student) {
                // Look up grade: prefer subterm key, then term key, then legacy key
                const subTermKey = subTerm ? `${subject}_${term}_${subTerm}` : null;
                const termKey = `${subject}_${term}`;
                const currentGrade = (subTermKey && student.grades?.[subTermKey]) || student.grades?.[termKey] || student.grades?.[subject] || '';
                const gradeInput = document.getElementById('gradeInput');
                if (gradeInput) gradeInput.value = currentGrade;
                
                const subTermLabel = subTerm ? ` — ${subTerm}` : '';
                if (currentGradeDisplay) {
                    currentGradeDisplay.innerHTML = currentGrade ? `Current Grade (${escapeHtml(term)}${subTermLabel}): <strong>${currentGrade}%</strong>` : `No grade recorded yet for ${escapeHtml(term)}${subTermLabel}`;
                }
                
                const attendanceData = student.attendanceHistory?.[term]?.[subject] || { present: 0, absent: 0, tardy: 0 };
                if (currentAttendanceDisplay) {
                    const p = attendanceData.present || 0, a = attendanceData.absent || 0, t = attendanceData.tardy || 0;
                    const total = p + a + t;
                    const rate = total > 0 ? ((p / total) * 100).toFixed(1) : 0;
                    currentAttendanceDisplay.innerHTML = `
                        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                            <span style="font-weight:700;color:#1e4a6f;"><i class="fas fa-user-check"></i> Attendance (${escapeHtml(term)}):</span>
                            <span style="color:#10B981;font-weight:600;"><i class="fas fa-check-circle"></i> Present: ${p}</span>
                            <span style="color:#ef4444;font-weight:600;"><i class="fas fa-times-circle"></i> Absent: ${a}</span>
                            <span style="color:#F59E0B;font-weight:600;"><i class="fas fa-clock"></i> Tardy: ${t}</span>
                            <span style="background:#e0f7ee;color:#059669;padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:700;">${rate}% Rate</span>
                        </div>
                    `;
                }
            }
        };
    }
}

function saveGradeWithTerm() {
    const studentId = document.getElementById('adminStudentSelect')?.value;
    const subject = document.getElementById('gradeSubjectSelect')?.value;
    const grade = document.getElementById('gradeInput')?.value;
    const selectedTerm = document.getElementById('adminTermSelect')?.value || '1st Semester';
    const selectedSubTerm = document.getElementById('adminSubTermSelect')?.value || '';
    
    if (!studentId || !subject || !grade) {
        showCustomNotification('Please select a student, subject, and enter a grade.', 'warning');
        return;
    }
    
    const student = window.usersDB.students.find(s => s.id === studentId);
    if (student) {
        if (!student.grades) student.grades = {};
        
        // Save with subterm key (e.g. Math_1st Semester_Prelim)
        if (selectedSubTerm) {
            student.grades[`${subject}_${selectedTerm}_${selectedSubTerm}`] = grade;
        }
        // Also save with term key (backward compat + student records view)
        student.grades[`${subject}_${selectedTerm}`] = grade;
        // And bare key for legacy fallback
        student.grades[subject] = grade;
        
        saveData();
        const subTermLabel = selectedSubTerm ? ` — ${selectedSubTerm}` : '';
        customConsoleLog(`GRADE SAVED: ${student.name} - ${subject} (${selectedTerm}${subTermLabel}): ${grade}%`, 'success');
        showCustomNotification(`Grade saved for ${student.name} (${selectedTerm}${subTermLabel})`, 'success');

        // Refresh admin subject selector
        loadStudentSubjectsForTerm(studentId, selectedTerm);

        // Refresh student-side records if the same student is logged in
        if (window.currentUser?.type === 'student' && window.currentUser.data.id === student.id) {
            if (typeof loadStudentRecordsView === 'function') loadStudentRecordsView();
            if (typeof updateDashboardCharts === 'function') updateDashboardCharts();
        }
    }
}

function saveQuickAttendance() {
    const studentId = document.getElementById('adminStudentSelect')?.value;
    const subject = document.getElementById('gradeSubjectSelect')?.value;
    const attendanceStatus = document.getElementById('attendanceStatus')?.value;
    const selectedTerm = document.getElementById('adminTermSelect')?.value || '1st Semester';

    if (!studentId || !subject) {
        showCustomNotification('Please select a student and subject first.', 'warning');
        return;
    }
    if (!attendanceStatus) {
        showCustomNotification('Please select an attendance status.', 'warning');
        return;
    }

    const student = window.usersDB.students.find(s => s.id === studentId);
    if (!student) { showCustomNotification('Student not found.', 'error'); return; }

    if (!student.attendanceHistory) student.attendanceHistory = {};
    if (!student.attendanceHistory[selectedTerm]) student.attendanceHistory[selectedTerm] = {};
    if (!student.attendanceHistory[selectedTerm][subject]) {
        student.attendanceHistory[selectedTerm][subject] = { present: 0, absent: 0, tardy: 0 };
    }

    const attendance = student.attendanceHistory[selectedTerm][subject];
    const statusNorm = attendanceStatus.toLowerCase();
    if (statusNorm === 'present') attendance.present = (attendance.present || 0) + 1;
    else if (statusNorm === 'absent') attendance.absent = (attendance.absent || 0) + 1;
    else if (statusNorm === 'tardy') attendance.tardy = (attendance.tardy || 0) + 1;

    saveData();
    customConsoleLog(`ATTENDANCE: ${student.name} — ${subject} (${selectedTerm}): +1 ${attendanceStatus}`, 'success');
    showCustomNotification(`Attendance recorded — ${attendanceStatus} for ${student.name}`, 'success');

    const attData = student.attendanceHistory?.[selectedTerm]?.[subject] || { present: 0, absent: 0, tardy: 0 };
    const attBanner = document.getElementById('adminAttendanceSavedBanner');
    if (attBanner) {
        attBanner.innerHTML = `<i class="fas fa-calendar-check" style="color:#065f46;"></i> &nbsp;<strong>${escapeHtml(student.name)}</strong> — <strong>${escapeHtml(subject)}</strong> (${escapeHtml(selectedTerm)}): <span style="color:#10B981;font-weight:700;">Present: ${attData.present}</span> · <span style="color:#ef4444;font-weight:700;">Absent: ${attData.absent}</span> · <span style="color:#F59E0B;font-weight:700;">Tardy: ${attData.tardy}</span>`;
        attBanner.style.display = 'flex';
    }

    // Refresh the current attendance display in the subject selector
    loadStudentSubjectsForTerm(studentId, selectedTerm);
    // Trigger subject onchange to refresh attendance display in the panel
    const subjectSel = document.getElementById('gradeSubjectSelect');
    if (subjectSel && subjectSel.value) {
        const evt = new Event('change');
        subjectSel.dispatchEvent(evt);
    }
}

window.saveQuickAttendance = saveQuickAttendance;

// ============ ENHANCED STUDENT RECORDS VIEW (Already implemented) ============

function loadStudentRecordsView() {
    if (!window.currentUser || window.currentUser.type !== 'student') return;
    
    const currentTerm = window.currentUser.data.termPeriod || '1st Semester';
    const enrolledSubjects = window.currentUser.data.enrolledSubjects || [];
    const grades = window.currentUser.data.grades || {};
    const attendanceHistory = window.currentUser.data.attendanceHistory || {};
    const container = document.getElementById('studentGradesDisplay');
    
    if (!container) return;
    
    if (enrolledSubjects.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>No subjects enrolled yet. Please go to Self-Enrollment to enroll in subjects.</p></div>';
        return;
    }
    
    const availableTerms = getAvailableTermsForStudent();
    
    let html = `
        <div class="student-records-wrapper">
            <div class="records-header">
                <div class="records-header-top">
                    <h4><i class="fas fa-chart-line"></i> Academic Performance</h4>
                    <div class="term-selector">
                        <label><i class="fas fa-calendar-alt"></i> Select Term:</label>
                        <select id="termSelector" class="term-select-dropdown">
                            ${availableTerms.map(term => `<option value="${term}" ${term === currentTerm ? 'selected' : ''}>${term}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <p class="records-note">Grades and attendance are recorded per academic term. Select a term above to view.</p>
            </div>
            
            <div class="academic-summary-cards">
                <div class="summary-card">
                    <i class="fas fa-book"></i>
                    <div class="summary-info">
                        <span class="summary-value" id="totalSubjectsCount">${enrolledSubjects.length}</span>
                        <span class="summary-label">Total Subjects</span>
                    </div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-hourglass-half"></i>
                    <div class="summary-info">
                        <span class="summary-value" id="totalUnitsCount">${enrolledSubjects.reduce((sum, s) => sum + (s.units || 3), 0)}</span>
                        <span class="summary-label">Total Units</span>
                    </div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-chart-simple"></i>
                    <div class="summary-info">
                        <span class="summary-value" id="averageGrade">--</span>
                        <span class="summary-label">Average Grade</span>
                    </div>
                </div>
                <div class="summary-card">
                    <i class="fas fa-calendar-check"></i>
                    <div class="summary-info">
                        <span class="summary-value" id="attendanceRate">0%</span>
                        <span class="summary-label">Attendance Rate</span>
                    </div>
                </div>
            </div>
            
            <div id="gradesTableContainer">
                ${generateGradeTable(enrolledSubjects, grades, currentTerm)}
            </div>
            
            <div class="attendance-section">
                <h4><i class="fas fa-calendar-check"></i> Attendance Records</h4>
                <div class="attendance-tabs">
                    <button class="attendance-tab active" data-view="weekly">Weekly View</button>
                    <button class="attendance-tab" data-view="monthly">Monthly View</button>
                    <button class="attendance-tab" data-view="term">Term Summary</button>
                </div>
                <div id="attendanceViewContainer">
                    ${generateWeeklyAttendanceView(attendanceHistory, currentTerm, enrolledSubjects)}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    const termSelector = document.getElementById('termSelector');
    if (termSelector) {
        termSelector.addEventListener('change', (e) => {
            refreshStudentTermData(e.target.value);
        });
    }
    
    document.querySelectorAll('.attendance-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.attendance-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.getAttribute('data-view');
            switchStudentAttendanceView(view, attendanceHistory, currentTerm, enrolledSubjects);
        });
    });
    
    updateStudentAcademicSummary(enrolledSubjects, grades, attendanceHistory, currentTerm);
}

function getAvailableTermsForStudent() {
    const student = window.currentUser.data;
    const termType = student.termType || 'Semester';
    
    if (termType === 'Semester') return ['1st Semester', '2nd Semester'];
    if (termType === 'Tri-Semester') return ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'];
    if (termType === 'Quarter') return ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
    if (termType === 'Block Plan') return ['Block A', 'Block B'];
    return ['1st Semester', '2nd Semester'];
}

function generateGradeTable(subjects, grades, term) {
    const gradeColors = {
        passing:     { bg: 'linear-gradient(135deg,#10B981,#059669)', text: '#fff', icon: 'fa-check-circle' },
        conditional: { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', text: '#fff', icon: 'fa-exclamation-circle' },
        failing:     { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', text: '#fff', icon: 'fa-times-circle' },
        pending:     { bg: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', text: '#475569', icon: 'fa-hourglass-half' }
    };

    let html = `<div class="grade-cards-grid">`;

    subjects.forEach((subject, index) => {
        const subjectCode = subject.code || `SUB${String(index + 1).padStart(3, '0')}`;
        const units = subject.units || 3;
        const grade = grades[`${subject.name}_${term}`] || grades[subject.name] || null;
        const categoryLower = (subject.category || 'minor').toLowerCase();
        const categoryUpper = categoryLower.toUpperCase();

        let gradeDisplay = '--', statusClass = 'pending', statusText = 'Not Graded', remarksText = 'Awaiting admin input', numGrade = null;
        if (grade !== null) {
            numGrade = parseFloat(grade);
            if (!isNaN(numGrade)) {
                gradeDisplay = numGrade.toFixed(1) + '%';
                if (numGrade >= 75)      { statusClass = 'passing';     statusText = 'PASSING';     remarksText = 'Good standing'; }
                else if (numGrade >= 60) { statusClass = 'conditional'; statusText = 'CONDITIONAL'; remarksText = 'Needs improvement'; }
                else                     { statusClass = 'failing';     statusText = 'FAILING';     remarksText = 'See your advisor'; }
            }
        }
        const col = gradeColors[statusClass];

        html += `
        <div class="grade-subject-card">
            <div class="gsc-header" style="background:${col.bg};">
                <div class="gsc-icon-wrap"><i class="fas ${col.icon}" style="color:${col.text};font-size:1.4rem;"></i></div>
                <div class="gsc-grade-num" style="color:${col.text};">${gradeDisplay}</div>
            </div>
            <div class="gsc-body">
                <div class="gsc-subject-name">${escapeHtml(subject.name)}</div>
                <div class="gsc-meta">
                    <span class="gsc-code">${escapeHtml(subjectCode)}</span>
                    <span class="category-badge ${categoryLower}">${categoryUpper}</span>
                    <span class="gsc-units"><i class="fas fa-layer-group"></i> ${units} units</span>
                </div>
                <div class="gsc-footer">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="gsc-remark">${remarksText}</span>
                </div>
            </div>
        </div>`;
    });

    html += `</div>`;
    return html;
}

function generateWeeklyAttendanceView(attendanceHistory, term, subjects) {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
    const termData = attendanceHistory[term] || {};
    
    let totalPresent = 0, totalAbsent = 0, totalTardy = 0;
    Object.values(termData).forEach(subjectData => {
        if (subjectData) {
            totalPresent += subjectData.present || 0;
            totalAbsent += subjectData.absent || 0;
            totalTardy += subjectData.tardy || 0;
        }
    });
    const totalDays = totalPresent + totalAbsent + totalTardy;
    const attendanceRate = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : 0;
    
    let html = `
        <div class="attendance-weekly-view">
            <div class="attendance-stats-cards">
                <div class="attendance-stat-card">
                    <i class="fas fa-check-circle" style="color:#10B981"></i>
                    <div class="stat-details">
                        <span class="stat-number" id="totalPresent">${totalPresent}</span>
                        <span class="stat-label">Days Present</span>
                    </div>
                </div>
                <div class="attendance-stat-card">
                    <i class="fas fa-times-circle" style="color:#ef4444"></i>
                    <div class="stat-details">
                        <span class="stat-number" id="totalAbsent">${totalAbsent}</span>
                        <span class="stat-label">Days Absent</span>
                    </div>
                </div>
                <div class="attendance-stat-card">
                    <i class="fas fa-clock" style="color:#F59E0B"></i>
                    <div class="stat-details">
                        <span class="stat-number" id="totalTardy">${totalTardy}</span>
                        <span class="stat-label">Days Tardy</span>
                    </div>
                </div>
                <div class="attendance-stat-card">
                    <i class="fas fa-chart-line" style="color:#FFB347"></i>
                    <div class="stat-details">
                        <span class="stat-number" id="attendancePercentage">${attendanceRate}%</span>
                        <span class="stat-label">Attendance Rate</span>
                    </div>
                </div>
            </div>
            
            <div class="attendance-summary-table">
                <table class="attendance-subject-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Category</th>
                            <th>Units</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Tardy</th>
                            <th>Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    subjects.forEach(subject => {
        const subjectData = termData[subject.name] || { present: 0, absent: 0, tardy: 0 };
        const subjectTotal = subjectData.present + subjectData.absent + subjectData.tardy;
        const subjectRate = subjectTotal > 0 ? ((subjectData.present / subjectTotal) * 100).toFixed(1) : 0;
        html += `
            <tr>
                <td><strong>${escapeHtml(subject.name)}</strong></td>
                <td><span class="category-badge ${subject.category || 'minor'}">${(subject.category || 'N/A').toUpperCase()}</span></td>
                <td>${subject.units || 3}</td>
                <td class="attendance-present-count">${subjectData.present || 0}</td>
                <td class="attendance-absent-count">${subjectData.absent || 0}</td>
                <td class="attendance-tardy-count">${subjectData.tardy || 0}</td>
                <td><div class="attendance-rate-bar"><div class="attendance-rate-fill" style="width: ${subjectRate}%"></div><span>${subjectRate}%</span></div></td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

function generateMonthlyAttendanceView(attendanceHistory, term, subjects) {
    const months = ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
    const termData = attendanceHistory[term] || {};
    
    let html = `
        <div class="attendance-monthly-view">
            <div class="months-grid">
    `;
    
    months.forEach(month => {
        let monthPresent = 0, monthAbsent = 0, monthTardy = 0;
        
        subjects.forEach(subject => {
            const subjectData = termData[subject.name] || {};
            // Simulate monthly distribution (in real system, this would be stored per month)
            const monthlyFactor = Math.random() * 0.3 + 0.1;
            monthPresent += Math.floor((subjectData.present || 0) * monthlyFactor);
            monthAbsent += Math.floor((subjectData.absent || 0) * monthlyFactor);
            monthTardy += Math.floor((subjectData.tardy || 0) * monthlyFactor);
        });
        
        const total = monthPresent + monthAbsent + monthTardy;
        const rate = total > 0 ? ((monthPresent / total) * 100).toFixed(1) : 0;
        
        html += `
            <div class="month-card">
                <div class="month-name">${month}</div>
                <div class="month-stats">
                    <div class="month-stat present"><span>${monthPresent}</span> Present</div>
                    <div class="month-stat absent"><span>${monthAbsent}</span> Absent</div>
                    <div class="month-stat tardy"><span>${monthTardy}</span> Tardy</div>
                </div>
                <div class="month-rate">
                    <div class="rate-circle" style="--percentage: ${rate}">
                        <span>${rate}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function generateTermSummaryView(attendanceHistory, term, subjects) {
    const termData = attendanceHistory[term] || {};
    let totalPresent = 0, totalAbsent = 0, totalTardy = 0;
    let subjectDetails = [];
    
    subjects.forEach(subject => {
        const subjectData = termData[subject.name] || { present: 0, absent: 0, tardy: 0 };
        totalPresent += subjectData.present || 0;
        totalAbsent += subjectData.absent || 0;
        totalTardy += subjectData.tardy || 0;
        subjectDetails.push({
            name: subject.name,
            category: subject.category,
            present: subjectData.present || 0,
            absent: subjectData.absent || 0,
            tardy: subjectData.tardy || 0
        });
    });
    
    const totalDays = totalPresent + totalAbsent + totalTardy;
    const attendanceRate = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : 0;
    
    let html = `
        <div class="attendance-term-view">
            <div class="term-summary-cards">
                <div class="term-summary-card">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="term-summary-info">
                        <span class="term-summary-value">${totalDays}</span>
                        <span class="term-summary-label">Total Recorded Days</span>
                    </div>
                </div>
                <div class="term-summary-card">
                    <i class="fas fa-check-circle"></i>
                    <div class="term-summary-info">
                        <span class="term-summary-value">${totalPresent}</span>
                        <span class="term-summary-label">Days Present</span>
                    </div>
                </div>
                <div class="term-summary-card">
                    <i class="fas fa-times-circle"></i>
                    <div class="term-summary-info">
                        <span class="term-summary-value">${totalAbsent}</span>
                        <span class="term-summary-label">Days Absent</span>
                    </div>
                </div>
                <div class="term-summary-card">
                    <i class="fas fa-clock"></i>
                    <div class="term-summary-info">
                        <span class="term-summary-value">${totalTardy}</span>
                        <span class="term-summary-label">Days Tardy</span>
                    </div>
                </div>
            </div>
            
            <div class="attendance-chart-container">
                <canvas id="attendanceDistributionChart" width="400" height="300"></canvas>
            </div>
            
            <div class="attendance-rate-display">
                <div class="rate-circle-large">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#10B981" stroke-width="10" 
                                stroke-dasharray="${attendanceRate * 2.83}" stroke-dashoffset="283" 
                                transform="rotate(-90 50 50)" class="rate-circle-progress"/>
                    </svg>
                    <div class="rate-text">
                        <span class="rate-percentage">${attendanceRate}%</span>
                        <span class="rate-label">Overall Attendance</span>
                    </div>
                </div>
            </div>
            
            <div class="subject-attendance-breakdown">
                <h5>Attendance by Subject</h5>
                <table class="subject-breakdown-table">
                    <thead>
                        <tr><th>Subject</th><th>Category</th><th>Present</th><th>Absent</th><th>Tardy</th><th>Rate</th></tr>
                    </thead>
                    <tbody>
    `;
    
    subjectDetails.forEach(subject => {
        const subTotal = subject.present + subject.absent + subject.tardy;
        const rate = subTotal > 0 ? ((subject.present / subTotal) * 100).toFixed(1) : 0;
        html += `
            <tr>
                <td><strong>${escapeHtml(subject.name)}</strong></td>
                <td><span class="category-badge ${subject.category || 'minor'}">${(subject.category || 'N/A').toUpperCase()}</span></td>
                <td class="present-num">${subject.present}</td>
                <td class="absent-num">${subject.absent}</td>
                <td class="tardy-num">${subject.tardy}</td>
                <td><div class="mini-rate-bar"><div style="width: ${rate}%; background: #10B981; height: 8px; border-radius: 4px;"></div><span>${rate}%</span></div></td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setTimeout(() => createAttendanceDistributionChart(totalPresent, totalAbsent, totalTardy), 100);
    return html;
}

function createAttendanceDistributionChart(present, absent, tardy) {
    const ctx = document.getElementById('attendanceDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.attendanceDistChart) window.attendanceDistChart.destroy();
    
    window.attendanceDistChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Tardy'],
            datasets: [{
                data: [present, absent, tardy],
                backgroundColor: ['#10B981', '#ef4444', '#F59E0B'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#1e2a3e', font: { size: 12 }, usePointStyle: true, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = present + absent + tardy;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} days (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function switchStudentAttendanceView(view, attendanceHistory, term, subjects) {
    const container = document.getElementById('attendanceViewContainer');
    if (!container) return;
    
    if (view === 'weekly') {
        container.innerHTML = generateWeeklyAttendanceView(attendanceHistory, term, subjects);
    } else if (view === 'monthly') {
        container.innerHTML = generateMonthlyAttendanceView(attendanceHistory, term, subjects);
    } else if (view === 'term') {
        container.innerHTML = generateTermSummaryView(attendanceHistory, term, subjects);
    }
}

function updateStudentAcademicSummary(subjects, grades, attendanceHistory, term) {
    let totalGrade = 0;
    let gradedCount = 0;
    
    subjects.forEach(subject => {
        const grade = grades[`${subject.name}_${term}`] || grades[subject.name];
        if (grade && !isNaN(parseFloat(grade))) {
            totalGrade += parseFloat(grade);
            gradedCount++;
        }
    });
    
    const averageGrade = gradedCount > 0 ? (totalGrade / gradedCount).toFixed(1) : '--';
    const avgEl = document.getElementById('averageGrade');
    if (avgEl) avgEl.textContent = averageGrade !== '--' ? `${averageGrade}%` : '--';
    
    const termData = attendanceHistory[term] || {};
    let totalPresent = 0, totalAbsent = 0, totalTardy = 0;
    
    Object.values(termData).forEach(subjectData => {
        if (subjectData) {
            totalPresent += subjectData.present || 0;
            totalAbsent += subjectData.absent || 0;
            totalTardy += subjectData.tardy || 0;
        }
    });
    
    const totalDays = totalPresent + totalAbsent + totalTardy;
    const attendanceRate = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : 0;
    const rateEl = document.getElementById('attendanceRate');
    if (rateEl) rateEl.textContent = `${attendanceRate}%`;
}

function refreshStudentTermData(term) {
    const enrolledSubjects = window.currentUser.data.enrolledSubjects || [];
    const grades = window.currentUser.data.grades || {};
    const attendanceHistory = window.currentUser.data.attendanceHistory || {};
    
    const gradesContainer = document.getElementById('gradesTableContainer');
    const attendanceContainer = document.getElementById('attendanceViewContainer');
    
    if (gradesContainer) {
        gradesContainer.innerHTML = generateGradeTable(enrolledSubjects, grades, term);
    }
    
    if (attendanceContainer) {
        attendanceContainer.innerHTML = generateWeeklyAttendanceView(attendanceHistory, term, enrolledSubjects);
        
        document.querySelectorAll('.attendance-tab').forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            newTab.addEventListener('click', (e) => {
                document.querySelectorAll('.attendance-tab').forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                const view = newTab.getAttribute('data-view');
                switchStudentAttendanceView(view, attendanceHistory, term, enrolledSubjects);
            });
        });
    }
    
    updateStudentAcademicSummary(enrolledSubjects, grades, attendanceHistory, term);
}

// ============ EXISTING FUNCTIONS (Preserved) ============

function setupAdminUpdateTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const panel = tab.getAttribute('data-admin-tab');
            const adminPanels = document.querySelectorAll('.admin-panel');
            adminPanels.forEach(p => p.classList.remove('active-panel'));
            
            let panelId = '';
            if (panel === 'schedule') panelId = 'scheduleChangePanel';
            else if (panel === 'room') panelId = 'roomChangePanel';
            else if (panel === 'professor') panelId = 'professorChangePanel';
            else if (panel === 'requests') panelId = 'requestsPanel';
            else if (panel === 'programs') panelId = 'programsPanel';
            else if (panel === 'curriculum') panelId = 'curriculumPanel';
            
            const activePanel = document.getElementById(panelId);
            if (activePanel) activePanel.classList.add('active-panel');
            
            if (panel === 'requests' && typeof renderRequestsPanel === 'function') {
                renderRequestsPanel();
            }
            if (panel === 'programs' && typeof renderCustomProgramsList === 'function') {
                renderCustomProgramsList();
            }
            if (panel === 'curriculum' && typeof renderCurriculumMappedList === 'function') {
                renderCurriculumMappedList();
            }
        });
    });
    
    // Post announcement buttons
    const postScheduleBtn = document.getElementById('postScheduleChangeBtn');
    if (postScheduleBtn) {
        postScheduleBtn.addEventListener('click', () => {
            const subject = document.getElementById('scheduleSubject')?.value;
            const oldSchedule = document.getElementById('oldSchedule')?.value;
            const newSchedule = document.getElementById('newSchedule')?.value;
            const reason = document.getElementById('scheduleReason')?.value;
            if (!subject || !oldSchedule || !newSchedule) { showCustomNotification('Fill all fields', 'warning'); return; }
            addNotification('schedule', `Schedule Change: ${subject}`, `From: ${oldSchedule} → To: ${newSchedule}`, reason || 'No reason');
            ['scheduleSubject', 'oldSchedule', 'newSchedule', 'scheduleReason'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        });
    }
    
    const postRoomBtn = document.getElementById('postRoomChangeBtn');
    if (postRoomBtn) {
        postRoomBtn.addEventListener('click', () => {
            const subject = document.getElementById('roomSubject')?.value;
            const oldRoom = document.getElementById('oldRoom')?.value;
            const newRoom = document.getElementById('newRoom')?.value;
            const reason = document.getElementById('roomReason')?.value;
            if (!subject || !oldRoom || !newRoom) { showCustomNotification('Fill all fields', 'warning'); return; }
            addNotification('room', `Room Change: ${subject}`, `From: ${oldRoom} → To: ${newRoom}`, reason || 'No reason');
            ['roomSubject', 'oldRoom', 'newRoom', 'roomReason'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        });
    }
    
    const postProfessorBtn = document.getElementById('postProfessorChangeBtn');
    if (postProfessorBtn) {
        postProfessorBtn.addEventListener('click', () => {
            const subject = document.getElementById('profSubject')?.value;
            const oldProfessor = document.getElementById('oldProfessor')?.value;
            const newProfessor = document.getElementById('newProfessor')?.value;
            const reason = document.getElementById('profReason')?.value;
            if (!subject || !oldProfessor || !newProfessor) { showCustomNotification('Fill all fields', 'warning'); return; }
            addNotification('professor', `Professor Change: ${subject}`, `From: ${oldProfessor} → To: ${newProfessor}`, reason || 'No reason');
            ['profSubject', 'oldProfessor', 'newProfessor', 'profReason'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        });
    }
}

function renderAdminDashboardSummary() {
    if (!window.currentUser || window.currentUser.type !== 'admin') return;
    let card = document.getElementById('adminDashboardSummary');
    if (!card) {
        card = document.createElement('div');
        card.id = 'adminDashboardSummary';
        card.className = 'admin-dashboard-section';
        const dashContent = document.getElementById('dashboard-content');
        if (dashContent) dashContent.appendChild(card);
    }
    
    const totalStudentsCt = window.usersDB.students.length;
    const totalAdminsCt = window.usersDB.admins.length;
    const enrolledCt = window.usersDB.students.filter(s => s.enrolledSubjects?.length > 0).length;
    const pendingReqCt = (window.usersDB.scheduleChangeRequests || []).filter(r => r.status === 'pending').length;
    const customProgCt = (window.usersDB.customPrograms || []).length;
    const collegeProgramsCount = Object.keys(window.collegeCurriculum || {}).length;
    
    card.innerHTML = `
        <h3><i class="fas fa-gauge-high"></i> Administrator Overview</h3>
        <div class="admin-stat-grid">
            <div class="admin-stat-tile"><span class="num">${totalStudentsCt}</span><small>Total Students</small></div>
            <div class="admin-stat-tile"><span class="num">${enrolledCt}</span><small>Enrolled Students</small></div>
            <div class="admin-stat-tile"><span class="num">${totalAdminsCt}</span><small>Total Admins</small></div>
            <div class="admin-stat-tile"><span class="num">${pendingReqCt}</span><small>Pending Schedule Requests</small></div>
            <div class="admin-stat-tile"><span class="num">${collegeProgramsCount}</span><small>College Programs</small></div>
            <div class="admin-stat-tile"><span class="num">${customProgCt}</span><small>Custom Programs</small></div>
        </div>
    `;
    card.style.display = 'block';
}

// ============ REGISTRATION WIZARD FUNCTIONS ============

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
    if (phase === 5 && typeof generateRegistrationReceipt === 'function') {
        generateRegistrationReceipt();
    }
}

function generateRegistrationReceipt() {
    const personal = window.registrationData.personal || {};
    const downPayment = window.registrationData.downPayment || 5000;
    const paymentPlan = window.registrationData.paymentPlan || 'Full Payment';
    const enrolledCount = window.currentUser?.data?.enrolledSubjects?.length || 0;
    const totalTuition = FEES.TOTAL + (enrolledCount * 500);
    const balance = totalTuition - parseInt(downPayment);
    
    const receiptHtml = `
        <div class="receipt-header">
            <h2><i class="fas fa-graduation-cap"></i> Official Registration Receipt</h2>
            <p><i class="fas fa-calendar-alt"></i> Date: ${new Date().toLocaleString()}</p>
            <p><i class="fas fa-receipt"></i> Receipt No: REG-${Date.now()}</p>
        </div>
        
        <div class="receipt-section">
            <h4><i class="fas fa-user-graduate"></i> Student Information</h4>
            <p><strong>Student ID:</strong> ${escapeHtml(window.currentUser?.data?.id || 'N/A')}</p>
            <p><strong>Full Name:</strong> ${escapeHtml(personal.fullName || window.currentUser?.data?.name || 'N/A')}</p>
            <p><strong>Contact Number:</strong> ${escapeHtml(personal.contact || 'N/A')}</p>
            <p><strong>Email Address:</strong> ${escapeHtml(personal.email || 'N/A')}</p>
            <p><strong>Complete Address:</strong> ${escapeHtml(personal.address || 'N/A')}</p>
        </div>
        
        <div class="receipt-section">
            <h4><i class="fas fa-book-open"></i> Academic Information</h4>
            <p><strong>Education Level:</strong> ${getEducationLevelDisplay()}</p>
            <p><strong>Program/Strand:</strong> ${escapeHtml(window.currentUser?.data?.program || window.currentUser?.data?.strand || 'N/A')}</p>
            <p><strong>Year/Grade Level:</strong> ${escapeHtml(window.currentUser?.data?.yearLevel || window.currentUser?.data?.sublevel || 'N/A')}</p>
            <p><strong>Term Type:</strong> ${escapeHtml(window.currentUser?.data?.termType || 'Semester')}</p>
            <p><strong>Term Period:</strong> ${escapeHtml(window.currentUser?.data?.termPeriod || '1st Semester')}</p>
            <p><strong>Total Enrolled Subjects:</strong> ${enrolledCount}</p>
        </div>
        
        <div class="receipt-section">
            <h4><i class="fas fa-money-bill-wave"></i> Payment Information</h4>
            <div class="tuition-summary">
                <table class="tuition-table">
                    <tr><td>Tuition Fee:</td><td>${formatCurrency(FEES.TUITION)}</td></tr>
                    <tr><td>Miscellaneous Fee:</td><td>${formatCurrency(FEES.MISCELLANEOUS)}</td></tr>
                    <tr><td>Additional Fees (per subject):</td><td>${formatCurrency(enrolledCount * 500)}</td></tr>
                    <tr class="total-row"><td><strong>TOTAL TUITION:</strong></td><td><strong>${formatCurrency(totalTuition)}</strong></td></tr>
                    <tr><td>Down Payment:</td><td>${formatCurrency(parseInt(downPayment))}</td></tr>
                    <tr><td>Payment Plan:</td><td>${escapeHtml(paymentPlan)}</td></tr>
                    <tr class="total-row"><td><strong>REMAINING BALANCE:</strong></td><td><strong>${formatCurrency(balance)}</strong></td></tr>
                </table>
            </div>
        </div>
        
        <div class="receipt-section">
            <h4><i class="fas fa-check-circle"></i> Enrollment Status</h4>
            <p><strong>Status:</strong> <span style="color: #10B981;">✓ Successfully Enrolled</span></p>
            <p><strong>Academic Year:</strong> 2024-2025</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="receipt-footer">
            <i class="fas fa-stamp"></i> This is a computer-generated receipt. No signature required.
        </div>
    `;
    
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) confirmationDetails.innerHTML = receiptHtml;
}

function getEducationLevelDisplay() {
    const level = window.currentUser?.data?.level;
    if (level === 'juniorHigh') return 'Junior High School';
    if (level === 'seniorHigh') return 'Senior High School';
    if (level === 'college') return 'College';
    return 'Not Specified';
}

function updateRegistrationForm() {
    if (!window.currentUser || window.currentUser.type !== 'student') return;
    const fullName = document.getElementById('personalFullName');
    const studentId = document.getElementById('schoolStudentId');
    const program = document.getElementById('schoolProgram');
    const yearLevel = document.getElementById('schoolYearLevel');
    
    if (fullName) fullName.value = window.currentUser.data.name;
    if (studentId) studentId.value = window.currentUser.data.id;
    if (program) program.value = window.currentUser.data.program || window.currentUser.data.strand || 'N/A';
    if (yearLevel) yearLevel.value = window.currentUser.data.yearLevel || window.currentUser.data.sublevel || 'N/A';
}

// Wizard navigation
document.querySelectorAll('.next-phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const next = parseInt(btn.getAttribute('data-next'));
        if (currentPhase === 1) {
            const downPayment = document.getElementById('downPaymentAmount');
            if (downPayment) window.registrationData.downPayment = downPayment.value;
        }
        if (currentPhase === 2) {
            window.registrationData.personal = { 
                fullName: document.getElementById('personalFullName')?.value || '', 
                contact: document.getElementById('personalContact')?.value || '', 
                email: document.getElementById('personalEmail')?.value || '', 
                address: document.getElementById('personalAddress')?.value || '' 
            };
        }
        if (currentPhase === 4) {
            const paymentPlan = document.getElementById('paymentPlan');
            if (paymentPlan) window.registrationData.paymentPlan = paymentPlan.value;
        }
        showPhase(next);
    });
});

document.querySelectorAll('.prev-phase-btn').forEach(btn => { 
    btn.addEventListener('click', () => showPhase(parseInt(btn.getAttribute('data-prev')))); 
});

const finalConfirmBtn = document.getElementById('finalConfirmBtn');
if (finalConfirmBtn) {
    finalConfirmBtn.addEventListener('click', () => {
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms?.checked) { showCustomNotification('Please agree to terms', 'warning'); return; }
        if (window.currentUser?.type === 'student') {
            if (window.registrationData.personal) { 
                window.currentUser.data.email = window.registrationData.personal.email; 
                window.currentUser.data.contact = window.registrationData.personal.contact; 
                window.currentUser.data.address = window.registrationData.personal.address; 
            }
            window.currentUser.data.registrationCompleted = true;
            const idx = window.usersDB.students.findIndex(s => s.id === window.currentUser.data.id);
            if (idx !== -1) window.usersDB.students[idx] = deepClone(window.currentUser.data);
            saveData();
            customConsoleLog(`Registration completed for ${window.currentUser.data.name}`, 'success');
            showCustomNotification('Registration completed successfully!', 'success');
            switchContent('dashboard');
            updateDashboard();
            updateDashboardCharts();
        }
    });
}

// ============ PROGRAMS PANEL ============

function addProgramSubjectRow() {
    const list = document.getElementById('newProgramSubjectList');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'program-subject-row';
    row.innerHTML = '<input type="text" class="prog-subj-name dark-input" placeholder="Subject name" style="flex:1">' +
        '<button type="button" class="remove-row-btn" onclick="this.closest(\'.program-subject-row\').remove()"><i class="fas fa-times"></i></button>';
    list.appendChild(row);
}

function renderCustomProgramsList() {
    const container = document.getElementById('customProgramsList');
    if (!container) return;
    const programs = window.usersDB.customPrograms || [];
    if (programs.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No custom programs yet.</p></div>';
        return;
    }
    container.innerHTML = programs.map((prog, idx) =>
        '<div class="custom-program-card">' +
            '<div><strong>' + (prog.name || '') + '</strong><br><small>' + (prog.yearLevel || '') + ' — ' + (prog.subjects ? prog.subjects.length : 0) + ' subject(s)</small></div>' +
            '<button class="delete-program-btn" onclick="deleteCustomProgram(' + idx + ')"><i class="fas fa-trash"></i></button>' +
        '</div>'
    ).join('');
}

window.deleteCustomProgram = function(idx) {
    if (!window.usersDB.customPrograms) return;
    window.usersDB.customPrograms.splice(idx, 1);
    saveData();
    renderCustomProgramsList();
    if (typeof showCustomNotification === 'function') showCustomNotification('Program deleted.', 'info');
};

function setupProgramsPanel() {
    const addBtn = document.getElementById('addProgramSubjectBtn');
    if (addBtn && !addBtn._hasProgramListener) {
        addBtn._hasProgramListener = true;
        addBtn.addEventListener('click', addProgramSubjectRow);
    }
    const clearBtn = document.getElementById('clearProgramFormBtn');
    if (clearBtn && !clearBtn._hasProgramListener) {
        clearBtn._hasProgramListener = true;
        clearBtn.addEventListener('click', () => {
            const nameEl = document.getElementById('newProgramName');
            if (nameEl) nameEl.value = '';
            const list = document.getElementById('newProgramSubjectList');
            if (list) list.innerHTML = '';
        });
    }
    const saveBtn = document.getElementById('saveProgramBtn');
    if (saveBtn && !saveBtn._hasProgramListener) {
        saveBtn._hasProgramListener = true;
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('newProgramName')?.value?.trim();
            const yearLevel = document.getElementById('newProgramYear')?.value;
            if (!name) { if (typeof showCustomNotification === 'function') showCustomNotification('Please enter a program name.', 'warning'); return; }
            const rows = document.querySelectorAll('#newProgramSubjectList .prog-subj-name');
            const subjects = Array.from(rows).map(r => r.value.trim()).filter(Boolean);
            if (subjects.length === 0) { if (typeof showCustomNotification === 'function') showCustomNotification('Add at least one subject.', 'warning'); return; }
            if (!window.usersDB.customPrograms) window.usersDB.customPrograms = [];
            window.usersDB.customPrograms.push({ name, yearLevel, subjects });
            saveData();
            renderCustomProgramsList();
            document.getElementById('newProgramName').value = '';
            document.getElementById('newProgramSubjectList').innerHTML = '';
            if (typeof showCustomNotification === 'function') showCustomNotification('Program "' + name + '" saved.', 'success');
        });
    }
    const list = document.getElementById('newProgramSubjectList');
    if (list && list.children.length === 0) addProgramSubjectRow();
}

// ============ CURRICULUM MAPPING PANEL ============

function addCurriculumSubjectRow() {
    const list = document.getElementById('curriculumSubjectList');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'program-subject-row';
    row.innerHTML =
        '<input type="text" class="curric-subj-name dark-input" placeholder="Subject name" style="flex:2">' +
        '<input type="number" class="curric-subj-units dark-input" placeholder="Units" min="1" max="9" value="3" style="flex:0.5;min-width:60px">' +
        '<select class="curric-subj-type dark-select" style="flex:1">' +
            '<option value="major">Major</option>' +
            '<option value="ge">GE</option>' +
            '<option value="elective">Elective</option>' +
            '<option value="specialized">Specialized</option>' +
            '<option value="core">Core</option>' +
            '<option value="minor">Minor</option>' +
            '<option value="research">Research</option>' +
            '<option value="practicum">Practicum</option>' +
        '</select>' +
        '<button type="button" class="remove-row-btn" onclick="this.closest(\'.program-subject-row\').remove()"><i class="fas fa-times"></i></button>';
    list.appendChild(row);
}

function renderCurriculumMappedList() {
    const container = document.getElementById('curriculumMappedList');
    if (!container) return;
    const curricula = window.usersDB.customCurricula || [];
    if (curricula.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-sitemap"></i><p>No curricula mapped yet.</p></div>';
        return;
    }
    container.innerHTML = curricula.map((c, idx) =>
        '<div class="custom-program-card">' +
            '<div><strong>' + (c.courseName || '') + '</strong><br><small>' + (c.yearLevel || '') + ' — ' + (c.subjects ? c.subjects.length : 0) + ' subject(s)</small></div>' +
            '<button class="delete-program-btn" onclick="deleteCustomCurriculum(' + idx + ')"><i class="fas fa-trash"></i></button>' +
        '</div>'
    ).join('');
}

window.deleteCustomCurriculum = function(idx) {
    if (!window.usersDB.customCurricula) return;
    window.usersDB.customCurricula.splice(idx, 1);
    saveData();
    renderCurriculumMappedList();
    if (typeof showCustomNotification === 'function') showCustomNotification('Curriculum deleted.', 'info');
};

function setupCurriculumPanel() {
    const addBtn = document.getElementById('addCurriculumSubjectBtn');
    if (addBtn && !addBtn._hasCurricListener) {
        addBtn._hasCurricListener = true;
        addBtn.addEventListener('click', addCurriculumSubjectRow);
    }
    const clearBtn = document.getElementById('clearCurriculumFormBtn');
    if (clearBtn && !clearBtn._hasCurricListener) {
        clearBtn._hasCurricListener = true;
        clearBtn.addEventListener('click', () => {
            const nameEl = document.getElementById('curriculumCourseName');
            if (nameEl) nameEl.value = '';
            const list = document.getElementById('curriculumSubjectList');
            if (list) list.innerHTML = '';
        });
    }
    const saveBtn = document.getElementById('saveCurriculumBtn');
    if (saveBtn && !saveBtn._hasCurricListener) {
        saveBtn._hasCurricListener = true;
        saveBtn.addEventListener('click', () => {
            const courseName = document.getElementById('curriculumCourseName')?.value?.trim();
            const yearLevel = document.getElementById('curriculumYearLevel')?.value;
            if (!courseName) { if (typeof showCustomNotification === 'function') showCustomNotification('Please enter a course name.', 'warning'); return; }
            const rows = document.querySelectorAll('#curriculumSubjectList .program-subject-row');
            const subjects = Array.from(rows).map(row => ({
                name: row.querySelector('.curric-subj-name')?.value?.trim(),
                units: parseInt(row.querySelector('.curric-subj-units')?.value || '3'),
                type: row.querySelector('.curric-subj-type')?.value || 'major'
            })).filter(s => s.name);
            if (subjects.length === 0) { if (typeof showCustomNotification === 'function') showCustomNotification('Add at least one subject.', 'warning'); return; }
            if (!window.usersDB.customCurricula) window.usersDB.customCurricula = [];
            window.usersDB.customCurricula.push({ courseName, yearLevel, subjects });
            saveData();
            renderCurriculumMappedList();
            document.getElementById('curriculumCourseName').value = '';
            document.getElementById('curriculumSubjectList').innerHTML = '';
            if (typeof showCustomNotification === 'function') showCustomNotification('Curriculum "' + courseName + '" saved.', 'success');
        });
    }
    const list = document.getElementById('curriculumSubjectList');
    if (list && list.children.length === 0) addCurriculumSubjectRow();
}

// Initialize panels on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setupProgramsPanel();
    setupCurriculumPanel();
});

// ============ EXPORTS ============
window.loadStudentRecordsView = loadStudentRecordsView;
window.loadAdminStudentSelect = loadAdminStudentSelect;
window.setupAdminUpdateTabs = setupAdminUpdateTabs;
window.renderAdminDashboardSummary = renderAdminDashboardSummary;
window.updateRegistrationForm = updateRegistrationForm;
window.showPhase = showPhase;
window.generateRegistrationReceipt = generateRegistrationReceipt;
window.currentPhase = currentPhase;
window.saveGradeWithTerm = saveGradeWithTerm;
window.loadStudentSubjectsForTerm = loadStudentSubjectsForTerm;

console.log('[Admin Module] Loaded');