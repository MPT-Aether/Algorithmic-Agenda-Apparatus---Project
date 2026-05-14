/* ============================================
   UI MODULE - UI updates and navigation
   COMPLETE - Preserves user state after login
   ============================================ */

let gradeChart = null;
let attendanceChart = null;

function createAttendancePieChart() {
    const student = window.currentUser?.data;
    const ctx = document.getElementById('attendancePieChart')?.getContext('2d');
    if (!ctx) return;

    if (attendanceChart) attendanceChart.destroy();

    // Aggregate attendance from attendanceHistory for the current term
    let present = 0, absent = 0, tardy = 0;
    if (student) {
        const currentTerm = student.termPeriod || '1st Semester';
        const attendanceHistory = student.attendanceHistory || {};
        const termData = attendanceHistory[currentTerm] || {};
        Object.values(termData).forEach(subjectData => {
            if (subjectData && typeof subjectData === 'object') {
                present += subjectData.present || 0;
                absent += subjectData.absent || 0;
                tardy += subjectData.tardy || 0;
            }
        });
        // Fallback to legacy flat attendance if attendanceHistory is empty
        if (present === 0 && absent === 0 && tardy === 0) {
            const legacy = student.attendance || {};
            present = legacy.present || 0;
            absent = legacy.absent || 0;
            tardy = legacy.tardy || 0;
        }
    }
    
    if (present === 0 && absent === 0 && tardy === 0) {
        attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: { labels: ['No Attendance Data'], datasets: [{ data: [1], backgroundColor: ['#e2e8f0'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#1e2a3e' } } } }
        });
    } else {
        attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: { labels: ['Present', 'Absent', 'Tardy'], datasets: [{ data: [present, absent, tardy], backgroundColor: ['#10B981', '#ef4444', '#F59E0B'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#1e2a3e', usePointStyle: true } }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} days` } } } }
        });
    }
}

function updateDashboardCharts() {
    if (!window.currentUser || window.currentUser.type !== 'student') return;
    
    const student = window.currentUser.data;
    const grades = student.grades || {};
    const currentTerm = student.termPeriod || '1st Semester';
    const enrolledSubjects = student.enrolledSubjects || [];
    const gradeCtx = document.getElementById('gradeBarChart')?.getContext('2d');
    if (gradeCtx) {
        if (gradeChart) gradeChart.destroy();

        // Build per-subject grade entries for current term only
        const chartLabels = [];
        const chartData = [];
        enrolledSubjects.forEach(subject => {
            const name = subject.name;
            // Prefer current-term grade, fall back to any grade for subject
            const termGrade = grades[`${name}_${currentTerm}`] || grades[name] || null;
            if (termGrade !== null && !isNaN(parseFloat(termGrade))) {
                chartLabels.push(name.length > 18 ? name.substring(0, 18) + '…' : name);
                chartData.push(parseFloat(termGrade));
            }
        });

        if (chartLabels.length > 0) {
            gradeChart = new Chart(gradeCtx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{ label: 'Grade (%)', data: chartData, backgroundColor: 'rgba(255, 179, 71, 0.8)', borderColor: '#FF8C00', borderWidth: 2, borderRadius: 6 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true, max: 100 },
                        x: { ticks: { maxRotation: 45, minRotation: 0 } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        } else {
            gradeChart = new Chart(gradeCtx, {
                type: 'bar',
                data: { labels: ['No Grades Yet'], datasets: [{ label: 'Grade (%)', data: [0], backgroundColor: '#e2e8f0' }] },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }
    }
    createAttendancePieChart();
}

function updateDashboard() {
    if (!window.currentUser || window.currentUser.type !== 'student') return;
    const enrolled = window.currentUser.data.enrolledSubjects || [];
    const enrolledTable = document.getElementById('enrolledCoursesTable');
    if (!enrolledTable) return;
    
    if (enrolled.length === 0) {
        enrolledTable.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>No subjects enrolled yet. Go to Self-Enrollment to select your subjects.</p></div>';
    } else {
        let html = '<div class="enrolled-courses-wrapper"><table class="enrolled-courses-table"><thead>';
        html += '<tr>';
        html += '<th>Subject Name</th>';
        html += '<th>Type</th>';
        html += '<th>Units</th>';
        html += '<th>Room</th>';
        html += '<th>Professor</th>';
        html += '</tr></thead><tbody>';
        
        enrolled.forEach(subject => {
            let categoryDisplay = subject.category ? subject.category.toUpperCase() : 'N/A';
            let badgeClass = '';
            if (subject.category === 'major') badgeClass = 'type-major';
            else if (subject.category === 'ge') badgeClass = 'type-ge';
            else if (subject.category === 'elective') badgeClass = 'type-elective';
            else if (subject.category === 'research') badgeClass = 'type-research';
            else if (subject.category === 'practicum') badgeClass = 'type-practicum';
            else badgeClass = 'type-minor';
            
            html += `<tr>
                        <td class="subject-cell-table"><strong>${escapeHtml(subject.name)}</strong></td>
                        <td class="type-cell-table"><span class="${badgeClass}">${categoryDisplay}</span></td>
                        <td class="units-cell-table">${subject.units || 3} units</td>
                        <td class="room-cell-table"><i class="fas fa-door-open"></i> ${escapeHtml(subject.room)}</td>
                        <td class="professor-cell-table"><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(subject.professor)}</td>
                      </tr>`;
        });
        html += '</tbody></table></div>';
        enrolledTable.innerHTML = html;
    }
}

function updateUIAfterLogin() {
    console.log("[UI] Updating UI after login for:", window.currentUser?.type);
    
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserName) sidebarUserName.textContent = window.currentUser.data.name;
    if (sidebarUserRole) sidebarUserRole.textContent = window.currentUser.type === 'student' ? 'Student' : 'Administrator';
    
    if (window.currentUser.type === 'student') {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeDetails = document.getElementById('welcomeDetails');
        const enrolledCount = document.getElementById('enrolledCount');
        const welcomeUserRole = document.getElementById('welcomeUserRole');
        
        if (welcomeMessage) welcomeMessage.textContent = window.currentUser.data.loginCount === 1 ? 'Welcome to the System' : `Welcome back, ${window.currentUser.data.name}!`;
        if (welcomeDetails) welcomeDetails.innerHTML = `<i class="fas fa-id-card"></i> ${window.currentUser.data.id}`;
        if (enrolledCount) enrolledCount.textContent = window.currentUser.data.enrolledSubjects?.length || 0;
        if (welcomeUserRole) welcomeUserRole.textContent = 'Student';
        
        document.querySelectorAll('.student-only').forEach(item => item.style.display = 'block');
        
        const adminRecords = document.getElementById('adminRecordsView');
        const adminUpdates = document.getElementById('adminUpdatesView');
        const studentDashboard = document.querySelector('.student-dashboard-section');
        const studentRecords = document.getElementById('studentRecordsView');
        const studentUpdates = document.getElementById('studentUpdatesView');
        const dashboardGraphs = document.querySelector('.dashboard-graphs');
        const welcomeStats = document.querySelector('.welcome-stats');
        
        if (adminRecords) adminRecords.style.display = 'none';
        if (adminUpdates) adminUpdates.style.display = 'none';
        if (studentDashboard) studentDashboard.style.display = 'block';
        if (studentRecords) studentRecords.style.display = 'block';
        if (studentUpdates) studentUpdates.style.display = 'block';
        if (dashboardGraphs) dashboardGraphs.style.display = 'grid';
        if (welcomeStats) welcomeStats.style.display = '';
        
        // CHECK USER STATE - This is critical for not redirecting enrolled users
        const hasEnrolled = window.currentUser.data.enrolledSubjects && window.currentUser.data.enrolledSubjects.length > 0;
        const hasConfirmed = window.currentUser.data.scheduleConfirmed === true;
        const hasRegistered = window.currentUser.data.registrationCompleted === true;
        
        console.log("[UI] Student state:", { hasEnrolled, hasConfirmed, hasRegistered });
        
        // ONLY redirect if they haven't completed the steps
        if (!hasEnrolled || !hasConfirmed) {
            console.log("[UI] No enrollment found, redirecting to self-enrollment");
            if (typeof switchContent === 'function') switchContent('self-enrollment');
        } else if (hasEnrolled && hasConfirmed && !hasRegistered) {
            console.log("[UI] Has enrollment but not registered, redirecting to registration");
            if (typeof switchContent === 'function') switchContent('student-registration');
            if (typeof updateRegistrationForm === 'function') updateRegistrationForm();
            if (typeof showPhase === 'function') showPhase(1);
        } else {
            console.log("[UI] Fully enrolled and registered, showing dashboard");
            if (typeof switchContent === 'function') switchContent('dashboard');
            if (typeof updateRegistrationForm === 'function') updateRegistrationForm();
            updateDashboard();
            updateDashboardCharts();
            if (window.currentUser.data.enrolledSubjects?.length > 0 && typeof unlockScheduleGenerator === 'function') unlockScheduleGenerator();
            if (typeof renderScheduleHistorySection === 'function') renderScheduleHistorySection();
        }
    } else if (window.currentUser.type === 'admin') {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const welcomeDetails = document.getElementById('welcomeDetails');
        const welcomeUserRole = document.getElementById('welcomeUserRole');
        
        if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${window.currentUser.data.name || 'Admin'}!`;
        if (welcomeUserRole) welcomeUserRole.textContent = 'Administrator';
        if (welcomeDetails) welcomeDetails.innerHTML = `<i class="fas fa-envelope"></i> ${window.currentUser.data.email}`;
        
        document.querySelectorAll('.student-only').forEach(item => item.style.display = 'none');
        
        const adminRecords = document.getElementById('adminRecordsView');
        const adminUpdates = document.getElementById('adminUpdatesView');
        const studentDashboardSection = document.getElementById('studentDashboardSection');
        const scheduleHistorySection = document.getElementById('scheduleHistorySection');
        const studentRecords = document.getElementById('studentRecordsView');
        const studentUpdates = document.getElementById('studentUpdatesView');
        const dashboardGraphs = document.querySelector('.dashboard-graphs');
        const welcomeStats = document.querySelector('.welcome-stats');
        
        const schedGenNavItem = document.getElementById('schedGenNavItem');
        if (schedGenNavItem) schedGenNavItem.style.display = 'none';

        if (adminRecords) adminRecords.style.display = 'block';
        if (adminUpdates) adminUpdates.style.display = 'block';
        if (studentDashboardSection) studentDashboardSection.style.display = 'none';
        if (scheduleHistorySection) scheduleHistorySection.style.display = 'none';
        if (studentRecords) studentRecords.style.display = 'none';
        if (studentUpdates) studentUpdates.style.display = 'none';
        if (dashboardGraphs) dashboardGraphs.style.display = 'none';
        if (welcomeStats) welcomeStats.style.display = 'none';
        
        if (typeof renderAdminDashboardSummary === 'function') renderAdminDashboardSummary();
        if (typeof loadAdminStudentSelect === 'function') loadAdminStudentSelect();
        if (typeof setupAdminUpdateTabs === 'function') setupAdminUpdateTabs();
    }
    
    if (typeof updatePageTitleAndHeader === 'function') updatePageTitleAndHeader('dashboard');
}

function switchContent(action) {
    console.log("[UI] Switching content to:", action);
    
    const panels = {
        dashboard: document.getElementById('dashboard-content'),
        'student-registration': document.getElementById('student-registration-content'),
        'self-enrollment': document.getElementById('self-enrollment-content'),
        'student-records': document.getElementById('student-records-content'),
        updates: document.getElementById('updates-content'),
        'sched-gen-1': document.getElementById('sched-gen-1-content')
    };
    
    Object.values(panels).forEach(panel => { if (panel) panel.classList.remove('active'); });
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
        if (window.currentUser && window.currentUser.type === 'student' && typeof renderScheduleHistorySection === 'function') {
            renderScheduleHistorySection();
        }
    }
    if (action === 'student-records' && window.currentUser && window.currentUser.type === 'student' && typeof loadStudentRecordsView === 'function') {
        loadStudentRecordsView();
    }
    if (action === 'updates' && window.currentUser && window.currentUser.type === 'student' && typeof loadNotificationsView === 'function') {
        loadNotificationsView();
    }
    if (action === 'self-enrollment') {
        // Show completion overlay if student is already enrolled and confirmed
        if (window.currentUser && window.currentUser.type === 'student') {
            const hasEnrolled = window.currentUser.data.enrolledSubjects && window.currentUser.data.enrolledSubjects.length > 0;
            const hasConfirmed = window.currentUser.data.scheduleConfirmed === true;
            if (hasEnrolled && hasConfirmed) {
                const count = window.currentUser.data.enrolledSubjects.length;
                setTimeout(function() {
                    if (typeof showCompletionOverlay === 'function') {
                        showCompletionOverlay(
                            'Already Enrolled!',
                            'You have successfully enrolled in ' + count + ' subject(s) and your schedule is confirmed. You can still review or change selections here.',
                            'enrollment'
                        );
                    }
                }, 250);
            }
        }
        const subjectsArea = document.getElementById('subjectsDisplayArea');
        if (subjectsArea) subjectsArea.style.display = 'none';
        const levelSelect = document.getElementById('enrollmentLevel');
        if (levelSelect && levelSelect.value && typeof loadSubjectsForLevel === 'function') {
            setTimeout(() => loadSubjectsForLevel(), 100);
        }
        // Re-setup enrollment buttons when entering self-enrollment
        setTimeout(() => {
            if (typeof window.setupEnrollmentButtons === 'function') {
                window.setupEnrollmentButtons();
            }
        }, 200);
    }
    if (action === 'student-registration' && window.currentUser && window.currentUser.type === 'student') {
        if (typeof updateRegistrationForm === 'function') updateRegistrationForm();
        if (window.currentUser.data.registrationCompleted && typeof showPhase === 'function') {
            showPhase(5);
        } else if (typeof showPhase === 'function') {
            showPhase(1);
        }
    }
    if (action === 'sched-gen-1') {
        console.log("[UI] Opening Schedule Generator");
        // Show completion overlay if student already submitted a modification
        if (window.currentUser && window.currentUser.type === 'student') {
            const hasModified = window.currentUser.data.modifiedSchedule && window.currentUser.data.modifiedSchedule.length > 0;
            if (hasModified) {
                const status = (window.currentUser.data.modificationStatus || 'pending').toLowerCase();
                setTimeout(function() {
                    if (typeof showCompletionOverlay === 'function') {
                        showCompletionOverlay(
                            'Schedule Already Modified!',
                            'Your schedule modification has been submitted and is currently ' + status + '. You can still make additional adjustments below.',
                            'schedule'
                        );
                    }
                }, 250);
            }
            if (typeof generateSchedule === 'function') {
                generateSchedule();
            }
        }
        // Re-setup enrollment buttons when entering schedule generator
        setTimeout(() => {
            if (typeof window.setupEnrollmentButtons === 'function') {
                window.setupEnrollmentButtons();
            }
        }, 200);
    }
    
    if (typeof updatePageTitleAndHeader === 'function') updatePageTitleAndHeader(action);
    if (typeof saveUserSession === 'function') saveUserSession();
}

function showCredits() {
    const creditsOverlay = document.getElementById('creditsOverlay');
    if (creditsOverlay) creditsOverlay.style.display = 'flex';
}

function closeCredits() {
    const creditsOverlay = document.getElementById('creditsOverlay');
    if (creditsOverlay) creditsOverlay.style.display = 'none';
}

function closeModifyModal() {
    const modal = document.getElementById('scheduleModifyModal');
    if (modal) modal.style.display = 'none';
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

// Expose UI functions globally
window.createAttendancePieChart = createAttendancePieChart;
window.updateDashboardCharts = updateDashboardCharts;
window.updateDashboard = updateDashboard;
window.updateUIAfterLogin = updateUIAfterLogin;
window.switchContent = switchContent;
window.updatePageTitleAndHeader = updatePageTitleAndHeader;
window.showCredits = showCredits;
window.closeCredits = closeCredits;
window.closeModifyModal = closeModifyModal;
window.unlockScheduleGenerator = unlockScheduleGenerator;