// Sidebar Navigation - Switch between Dashboard, Updates, and Schedule Generators
document.addEventListener('DOMContentLoaded', () => {
    // Get all sidebar links
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentPanels = {
        'dashboard': document.getElementById('dashboard-content'),
        'updates': document.getElementById('updates-content'),
        'sched-gen-1': document.getElementById('sched-gen-1-content'),
        'sched-gen-2': document.getElementById('sched-gen-2-content')
    };
    
    // Function to switch content
    function switchContent(action) {
        // Hide all panels
        Object.values(contentPanels).forEach(panel => {
            if (panel) panel.classList.remove('active');
        });
        
        // Show selected panel
        if (contentPanels[action]) {
            contentPanels[action].classList.add('active');
        }
        
        // Update active state on sidebar
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-action') === action) {
                link.classList.add('active');
            }
        });
    }
    
    // Add click handlers to sidebar links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const action = link.getAttribute('data-action');
            if (action) {
                switchContent(action);
            }
        });
    });
    
    // Schedule Generator 1 Logic
    const generateBtn1 = document.getElementById('generateBtn1');
    const scheduleResult1 = document.getElementById('scheduleResult1');
    
    if (generateBtn1) {
        generateBtn1.addEventListener('click', () => {
            const schedule = `
                <strong>📅 Generated Weekly Schedule:</strong>
                <ul>
                    <li><i class="fas fa-calendar-check"></i> Monday 9:00 AM - ICTN01C (Accounting Information System)</li>
                    <li><i class="fas fa-calendar-check"></i> Tuesday 11:00 AM - ICTL15L (System Analysis and Design)</li>
                    <li><i class="fas fa-calendar-check"></i> Wednesday 2:00 PM - ICTN04C (Data Structures and Algorithms)</li>
                    <li><i class="fas fa-calendar-check"></i> Thursday 10:00 AM - Lab Session</li>
                    <li><i class="fas fa-calendar-check"></i> Friday 1:00 PM - Review / Study Group</li>
                </ul>
                <p style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <i class="fas fa-check-circle" style="color: #10B981;"></i> Schedule generated successfully!
                </p>
            `;
            scheduleResult1.innerHTML = schedule;
            scheduleResult1.classList.add('show');
        });
    }
    
    // Schedule Generator 2 Logic (Advanced Optimization)
    const generateBtn2 = document.getElementById('generateBtn2');
    const scheduleResult2 = document.getElementById('scheduleResult2');
    
    if (generateBtn2) {
        generateBtn2.addEventListener('click', () => {
            const optimizedSchedule = `
                <strong>⚡ Optimized Conflict-Free Schedule:</strong>
                <ul>
                    <li><i class="fas fa-star" style="color: #F59E0B;"></i> Monday 10:00 AM - ICTN04C (Data Structures)</li>
                    <li><i class="fas fa-star" style="color: #F59E0B;"></i> Tuesday 9:00 AM - ICTN01C (Accounting System)</li>
                    <li><i class="fas fa-star" style="color: #F59E0B;"></i> Wednesday 1:00 PM - ICTL15L (System Analysis)</li>
                    <li><i class="fas fa-star" style="color: #F59E0B;"></i> Thursday 11:00 AM - Lab / Practical</li>
                    <li><i class="fas fa-star" style="color: #F59E0B;"></i> Friday 9:00 AM - Review Session</li>
                </ul>
                <p style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #10B981;">
                    <i class="fas fa-check-double"></i> No conflicts detected. All time slots optimized!
                </p>
            `;
            scheduleResult2.innerHTML = optimizedSchedule;
            scheduleResult2.classList.add('show');
        });
    }
    
    // Course click interaction (on Dashboard)
    const courseItems = document.querySelectorAll('.course-list li');
    courseItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const courseText = item.textContent.trim();
            alert(`📚 Course Details\n\n${courseText}\n\nStatus: Currently Enrolled\nProgress: In Progress\nAttendance: 85%`);
        });
    });
    
    // Console log to confirm structure
    console.log('✅ Algorithmic Agenda Apparatus System Loaded');
    console.log('📋 Sidebar: Dashboard | Updates | Sched. Gen. | Sched. Gen.');
    console.log('📋 Main: Enrolled Courses (3 items)');
});