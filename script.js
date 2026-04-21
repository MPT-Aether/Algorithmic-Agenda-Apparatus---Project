// Algorithmic Agenda Apparatus System - Complete Enhanced Version
let usersDB = { students: [], admins: [] };
let currentUser = null;
let registrationData = {};
let notificationsDB = { schedule: [], room: [], professor: [] };

// ============ CUSTOM CONSOLE LOGGER ============
function logToCustomConsole(message, type = "info", autoShow = false) {
    const consoleContent = document.getElementById('consoleContent');
    if (!consoleContent) return;
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement("div");
    logEntry.className = "console-log";
    
    let formattedMessage = "";
    switch(type) {
        case "user": formattedMessage = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-user">${message}</span>`; break;
        case "action": formattedMessage = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-action">${message}</span>`; break;
        case "success": formattedMessage = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-success">${message}</span>`; break;
        case "error": formattedMessage = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-error">${message}</span>`; break;
        default: formattedMessage = `<span class="console-timestamp">[${timestamp}]</span> <span class="console-info">${message}</span>`;
    }
    
    logEntry.innerHTML = formattedMessage;
    consoleContent.appendChild(logEntry);
    consoleContent.scrollTop = consoleContent.scrollHeight;
    
    if(autoShow) {
        showConsole();
        if(type !== 'error') setTimeout(() => closeConsole(), 4000);
    }
}

function showConsole() { 
    const overlay = document.getElementById("consoleOverlay");
    if (overlay) overlay.style.display = "flex";
}
function closeConsole() { 
    const overlay = document.getElementById("consoleOverlay");
    if (overlay) overlay.style.display = "none";
}
function clearConsole() { 
    const consoleContent = document.getElementById('consoleContent');
    if (consoleContent) {
        consoleContent.innerHTML = '<div class="console-log"><span class="console-timestamp">[System]</span> <span class="console-info">Console cleared.</span></div>';
    }
}

document.getElementById("consoleOverlay")?.addEventListener("click", function(e) { if (e.target === this) closeConsole(); });
document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeConsole(); });

// ============ PAGE TITLE UPDATER ============
function updatePageTitleAndHeader(pageName) {
    const titles = {
        'dashboard': 'Dashboard', 'student-registration': 'Student Registration',
        'self-enrollment': 'Self-Enrollment', 'student-records': 'Student Records',
        'updates': 'Updates', 'sched-gen-1': 'Schedule Generator', 'login': 'System Access'
    };
    document.title = `${titles[pageName] || 'Algorithmic Agenda'} - Algorithmic Agenda`;
    const pageHeader = document.getElementById('pageTitle');
    if (pageHeader) pageHeader.textContent = titles[pageName] || 'Algorithmic Agenda';
}

// ============ CREDITS MODAL ============
function showCredits() {
    const overlay = document.getElementById('creditsOverlay');
    if (overlay) overlay.style.display = 'flex';
}
function closeCredits() {
    const overlay = document.getElementById('creditsOverlay');
    if (overlay) overlay.style.display = 'none';
}
document.getElementById('creditsBtn')?.addEventListener('click', showCredits);
document.getElementById('creditsOverlay')?.addEventListener('click', function(e) { if (e.target === this) closeCredits(); });

// ============ COMPLETE CURRICULUM DATABASE ============
const highSchoolCurriculum = {
    "Grade 9": [
        { name: "English 9", room: "RM 201", professor: "Prof. Maria Santos", category: "core" },
        { name: "Mathematics 9", room: "RM 202", professor: "Prof. Jose Rizal", category: "core" },
        { name: "Science 9", room: "LAB 101", professor: "Prof. Gregorio Y. Zara", category: "core" },
        { name: "Araling Panlipunan 9", room: "RM 203", professor: "Prof. Teodoro Agoncillo", category: "core" },
        { name: "Filipino 9", room: "RM 204", professor: "Prof. Virgilio Almario", category: "core" },
        { name: "MAPEH 9", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "major" },
        { name: "TLE 9", room: "WSHOP 1", professor: "Prof. Ramon Magsaysay", category: "major" },
        { name: "Values Education 9", room: "RM 205", professor: "Prof. Carmen Perez", category: "core" }
    ],
    "Grade 10": [
        { name: "English 10", room: "RM 206", professor: "Prof. Maria Santos", category: "core" },
        { name: "Mathematics 10", room: "RM 207", professor: "Prof. Jose Rizal", category: "core" },
        { name: "Science 10", room: "LAB 102", professor: "Prof. Gregorio Y. Zara", category: "core" },
        { name: "Araling Panlipunan 10", room: "RM 208", professor: "Prof. Teodoro Agoncillo", category: "core" },
        { name: "Filipino 10", room: "RM 209", professor: "Prof. Virgilio Almario", category: "core" },
        { name: "MAPEH 10", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "major" },
        { name: "Research 10", room: "LIB 101", professor: "Prof. Fe Del Mundo", category: "major" }
    ],
    "Grade 11": [
        { name: "21st Century Literature", room: "RM 301", professor: "Prof. F. Sionil Jose", category: "core" },
        { name: "Oral Communication", room: "RM 302", professor: "Prof. Lualhati Bautista", category: "core" },
        { name: "General Mathematics", room: "RM 306", professor: "Prof. Jose Rizal", category: "core" },
        { name: "Statistics", room: "RM 307", professor: "Prof. Raymundo Favila", category: "core" },
        { name: "Earth Science", room: "LAB 201", professor: "Prof. Gregorio Y. Zara", category: "core" },
        { name: "Personal Development", room: "RM 308", professor: "Prof. Carmen Perez", category: "major" }
    ],
    "Grade 12": [
        { name: "Contemporary Arts", room: "RM 310", professor: "Prof. Carlos Francisco", category: "core" },
        { name: "Media Literacy", room: "COMP LAB 3", professor: "Prof. Diosdado Banatao", category: "core" },
        { name: "Practical Research 1", room: "LIB 102", professor: "Prof. Fe Del Mundo", category: "core" },
        { name: "Entrepreneurship", room: "RM 313", professor: "Prof. Socorro Ramos", category: "major" },
        { name: "Empowerment Technologies", room: "COMP LAB 4", professor: "Prof. Diosdado Banatao", category: "major" }
    ]
};

const collegeCurriculum = {
    "Bachelor of Science in Information Technology": {
        "1st Year": [
            { name: "Introduction to Computing", room: "IT LAB 101", professor: "Prof. James Dela Cruz", category: "core" },
            { name: "Computer Programming 1", room: "IT LAB 101", professor: "Prof. Michael Santos", category: "major" },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "core" },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "core" },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "core" }
        ],
        "2nd Year": [
            { name: "Computer Programming 2", room: "IT LAB 201", professor: "Prof. Michael Santos", category: "major" },
            { name: "Data Structures", room: "IT LAB 201", professor: "Prof. Jennifer Cruz", category: "major" },
            { name: "Object-Oriented Programming", room: "IT LAB 202", professor: "Prof. Daniel Tan", category: "major" },
            { name: "Networking 1", room: "NET LAB 301", professor: "Prof. Christopher Lee", category: "major" },
            { name: "Database Systems", room: "IT LAB 203", professor: "Prof. Angela Martinez", category: "major" }
        ],
        "3rd Year": [
            { name: "Integrative Programming", room: "IT LAB 301", professor: "Prof. Daniel Tan", category: "major" },
            { name: "Mobile Technologies", room: "IT LAB 301", professor: "Prof. Patricia Lim", category: "major" },
            { name: "Advanced Database", room: "IT LAB 302", professor: "Prof. Angela Martinez", category: "major" },
            { name: "Networking 2", room: "NET LAB 302", professor: "Prof. Christopher Lee", category: "major" },
            { name: "Software Engineering", room: "IT LAB 304", professor: "Prof. Daniel Tan", category: "major" }
        ],
        "4th Year": [
            { name: "Capstone Project 1", room: "IT LAB 401", professor: "Prof. James Dela Cruz", category: "major" },
            { name: "Capstone Project 2", room: "IT LAB 401", professor: "Prof. Jennifer Cruz", category: "major" },
            { name: "Cloud Computing", room: "IT LAB 402", professor: "Prof. Christopher Lee", category: "elective" },
            { name: "Web and Mobile UX", room: "IT LAB 402", professor: "Prof. Patricia Lim", category: "elective" },
            { name: "Practicum", room: "OFFSITE", professor: "Industry Supervisor", category: "major" }
        ]
    },
    "Bachelor of Science in Computer Science": {
        "1st Year": [
            { name: "Introduction to Computing", room: "CS LAB 101", professor: "Prof. James Dela Cruz", category: "core" },
            { name: "Fundamentals of Programming", room: "CS LAB 101", professor: "Prof. Michael Santos", category: "major" },
            { name: "Discrete Structures 1", room: "RM 409", professor: "Prof. Jose Rizal", category: "core" },
            { name: "Purposive Communication", room: "RM 411", professor: "Prof. Maria Santos", category: "core" }
        ],
        "2nd Year": [
            { name: "Data Structures", room: "CS LAB 201", professor: "Prof. Jennifer Cruz", category: "major" },
            { name: "Object-Oriented Programming", room: "CS LAB 202", professor: "Prof. Daniel Tan", category: "major" },
            { name: "Operating Systems", room: "CS LAB 203", professor: "Prof. James Dela Cruz", category: "major" },
            { name: "Algorithms", room: "CS LAB 204", professor: "Prof. Jennifer Cruz", category: "major" }
        ],
        "3rd Year": [
            { name: "Software Engineering", room: "CS LAB 301", professor: "Prof. Daniel Tan", category: "major" },
            { name: "Networks", room: "NET LAB 303", professor: "Prof. Christopher Lee", category: "major" },
            { name: "Intelligent Systems", room: "CS LAB 303", professor: "Prof. Jennifer Cruz", category: "elective" },
            { name: "Thesis 1", room: "CS LAB 401", professor: "Prof. Jennifer Cruz", category: "major" }
        ],
        "4th Year": [
            { name: "Thesis 2", room: "CS LAB 401", professor: "Prof. Daniel Tan", category: "major" },
            { name: "Machine Learning", room: "CS LAB 402", professor: "Prof. Patricia Lim", category: "elective" },
            { name: "Practicum", room: "OFFSITE", professor: "Industry Supervisor", category: "major" }
        ]
    },
    "Bachelor of Science in Nursing": {
        "1st Year": [
            { name: "Anatomy and Physiology", room: "NUR LAB 101", professor: "Prof. Richard Mendoza", category: "core" },
            { name: "Microbiology", room: "NUR LAB 102", professor: "Prof. Susan Rivera", category: "core" },
            { name: "Foundations of Nursing", room: "NUR LAB 103", professor: "Prof. Susan Rivera", category: "major" }
        ],
        "2nd Year": [
            { name: "Health Assessment", room: "NUR LAB 201", professor: "Prof. Susan Rivera", category: "major" },
            { name: "Pharmacology", room: "NUR LAB 203", professor: "Prof. Maria Garcia", category: "major" },
            { name: "Adult Health Nursing 1", room: "NUR LAB 203", professor: "Prof. Richard Mendoza", category: "major" }
        ],
        "3rd Year": [
            { name: "Adult Health Nursing 2", room: "NUR LAB 301", professor: "Prof. Susan Rivera", category: "major" },
            { name: "Child Health Nursing", room: "NUR LAB 301", professor: "Prof. Richard Mendoza", category: "major" },
            { name: "Psychiatric Nursing", room: "NUR LAB 302", professor: "Prof. Carmen Perez", category: "major" }
        ],
        "4th Year": [
            { name: "Community Health Nursing", room: "NUR LAB 401", professor: "Prof. Susan Rivera", category: "major" },
            { name: "Intensive Practicum", room: "CLINICAL", professor: "Clinical Instructor", category: "major" },
            { name: "Competency Appraisal", room: "NUR LAB 403", professor: "Prof. Susan Rivera", category: "major" }
        ]
    },
    "Bachelor of Science in Tourism Management": {
        "1st Year": [
            { name: "Introduction to Tourism", room: "TOUR 101", professor: "Prof. Christine Flores", category: "core" },
            { name: "Principles of Management", room: "TOUR 102", professor: "Prof. Mark Rivera", category: "core" },
            { name: "Marketing Fundamentals", room: "TOUR 103", professor: "Prof. Christine Flores", category: "major" }
        ],
        "2nd Year": [
            { name: "Tourism Planning", room: "TOUR 201", professor: "Prof. Christine Flores", category: "major" },
            { name: "Event Management", room: "TOUR 204", professor: "Prof. Mark Rivera", category: "major" },
            { name: "Quality Service", room: "TOUR 206", professor: "Prof. Maria Santos", category: "major" }
        ],
        "3rd Year": [
            { name: "Strategic Management", room: "TOUR 301", professor: "Prof. Mark Rivera", category: "major" },
            { name: "Destination Marketing", room: "TOUR 302", professor: "Prof. Christine Flores", category: "major" },
            { name: "International Tourism", room: "TOUR 304", professor: "Prof. Christine Flores", category: "elective" }
        ],
        "4th Year": [
            { name: "Tourism Research", room: "TOUR 401", professor: "Prof. Fe Del Mundo", category: "major" },
            { name: "Tourism Practicum", room: "OFFSITE", professor: "Industry Supervisor", category: "major" }
        ]
    },
    "Bachelor of Science in Civil Engineering": {
        "1st Year": [
            { name: "Calculus 1", room: "ENG 101", professor: "Prof. Robert Reyes", category: "core" },
            { name: "Physics for Engineers", room: "PHY LAB 101", professor: "Prof. William Ong", category: "core" },
            { name: "Engineering Drawing", room: "ENG DRAW 101", professor: "Prof. Victor Santos", category: "major" }
        ],
        "2nd Year": [
            { name: "Differential Equations", room: "ENG 201", professor: "Prof. Robert Reyes", category: "core" },
            { name: "Mechanics", room: "ENG 203", professor: "Prof. Victor Santos", category: "major" },
            { name: "Fluid Mechanics", room: "ENG 204", professor: "Prof. William Ong", category: "major" }
        ],
        "3rd Year": [
            { name: "Structural Theory", room: "ENG 301", professor: "Prof. Victor Santos", category: "major" },
            { name: "Steel Design", room: "ENG 302", professor: "Prof. Victor Santos", category: "major" },
            { name: "Geotechnical Engineering", room: "ENG 303", professor: "Prof. William Ong", category: "major" }
        ],
        "4th Year": [
            { name: "Concrete Design", room: "ENG 401", professor: "Prof. Victor Santos", category: "major" },
            { name: "Construction Management", room: "ENG 402", professor: "Prof. Victor Santos", category: "major" },
            { name: "Capstone Project", room: "ENG 407", professor: "Prof. Victor Santos", category: "major" }
        ]
    },
    "Bachelor of Arts in Literature": {
        "1st Year": [
            { name: "Introduction to Literature", room: "LIT 101", professor: "Prof. Nick Joaquin", category: "core" },
            { name: "Creative Writing", room: "LIT 106", professor: "Prof. Nick Joaquin", category: "major" }
        ],
        "2nd Year": [
            { name: "Shakespeare", room: "LIT 201", professor: "Prof. Nick Joaquin", category: "major" },
            { name: "World Literature", room: "LIT 205", professor: "Prof. F. Sionil Jose", category: "core" }
        ],
        "3rd Year": [
            { name: "Philippine Literature", room: "LIT 301", professor: "Prof. Nick Joaquin", category: "major" },
            { name: "Literary Criticism", room: "LIT 303", professor: "Prof. Lualhati Bautista", category: "major" }
        ],
        "4th Year": [
            { name: "Advanced Literary Theory", room: "LIT 401", professor: "Prof. Nick Joaquin", category: "major" },
            { name: "Capstone Portfolio", room: "LIT 404", professor: "Prof. Nick Joaquin", category: "major" }
        ]
    },
    "Bachelor of Science in Astronomy": {
        "1st Year": [
            { name: "University Physics 1", room: "PHY LAB 201", professor: "Prof. William Ong", category: "core" },
            { name: "Introduction to Astronomy", room: "AST LAB 101", professor: "Prof. William Ong", category: "major" }
        ],
        "2nd Year": [
            { name: "Introduction to Astrophysics", room: "AST 201", professor: "Prof. William Ong", category: "major" },
            { name: "Modern Physics", room: "PHY LAB 204", professor: "Prof. William Ong", category: "core" }
        ],
        "3rd Year": [
            { name: "Astrophysics: Stars", room: "AST 301", professor: "Prof. William Ong", category: "major" },
            { name: "Scientific Computing", room: "AST COMP LAB", professor: "Prof. James Dela Cruz", category: "elective" }
        ],
        "4th Year": [
            { name: "Galaxies and Cosmology", room: "AST 401", professor: "Prof. William Ong", category: "major" },
            { name: "Capstone Research", room: "AST LAB 401", professor: "Prof. William Ong", category: "major" }
        ]
    }
};

function getSubjectsForProgram(program, isHighschool, yearLevel) {
    if (isHighschool) {
        return highSchoolCurriculum[yearLevel] || [];
    }
    return collegeCurriculum[program]?.[yearLevel] || [];
}

function getScheduleInfo(subject) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];
    const hash = subject.name.length;
    return {
        day: days[hash % 5],
        time: times[hash % 4],
        room: subject.room,
        professor: subject.professor,
        timeSlot: hash % 2 === 0 ? "7-10" : "1-4"
    };
}

function generateStudentId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const existingIds = usersDB.students.map(s => s.id);
    let maxSeq = 0;
    const pattern = new RegExp(`^${year}${month}${day}-(\\d+)$`);
    existingIds.forEach(id => {
        const match = id.match(pattern);
        if (match) maxSeq = Math.max(maxSeq, parseInt(match[1]));
    });
    return `${year}${month}${day}-${String(maxSeq + 1).padStart(4, '0')}`;
}

function loadNotifications() {
    const saved = localStorage.getItem('notificationsDB');
    if (saved) {
        notificationsDB = JSON.parse(saved);
    }
}
function saveNotifications() {
    localStorage.setItem('notificationsDB', JSON.stringify(notificationsDB));
}
loadNotifications();

function loadData() {
    const savedUsers = localStorage.getItem('usersDB');
    if (savedUsers) {
        usersDB = JSON.parse(savedUsers);
        console.log("Loaded users from localStorage:", usersDB);
    } else {
        // Create default admin account
        usersDB.admins.push({ 
            email: "admin@school.edu", 
            password: "admin123", 
            name: "Professor Maria Santos" 
        });
        console.log("Created default admin account");
        saveData();
    }
}
function saveData() { 
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    console.log("Saved users to localStorage:", usersDB);
}
loadData();

// Navigation
const loginPanel = document.getElementById('login-panel');
const dashboardContent = document.getElementById('dashboard-content');
const registrationContent = document.getElementById('student-registration-content');
const selfEnrollmentContent = document.getElementById('self-enrollment-content');
const recordsContent = document.getElementById('student-records-content');
const navLinks = document.querySelectorAll('.sidebar nav ul li a');

function switchContent(action) {
    const panels = {
        dashboard: dashboardContent, 'student-registration': registrationContent,
        'self-enrollment': selfEnrollmentContent, 'student-records': recordsContent,
        updates: document.getElementById('updates-content'), 'sched-gen-1': document.getElementById('sched-gen-1-content')
    };
    Object.values(panels).forEach(panel => { if (panel) panel.classList.remove('active'); });
    if (panels[action]) panels[action].classList.add('active');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-action') === action) link.classList.add('active');
    });
    if (action === 'dashboard') updateDashboard();
    if (action === 'self-enrollment') {
        loadAvailableSubjects();
        setupSubjectTabsAndSearch();
    }
    if (action === 'updates') loadNotificationsView();
    if (action === 'sched-gen-1') updateEnrolledSubjectsPreview();
    updatePageTitleAndHeader(action);
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) { alert('Please login first.'); return; }
        switchContent(link.getAttribute('data-action'));
    });
});

// ============ FIXED ROLE TOGGLE FOR ADMIN LOGIN ============
document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all role buttons
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const role = this.getAttribute('data-role');
        
        // Hide both login panels first
        document.getElementById('student-login-panel').classList.remove('active-panel');
        document.getElementById('admin-login-panel').classList.remove('active-panel');
        
        // Show the selected panel
        if (role === 'student') {
            document.getElementById('student-login-panel').classList.add('active-panel');
        } else if (role === 'admin') {
            document.getElementById('admin-login-panel').classList.add('active-panel');
        }
        
        // Also hide any open signup forms
        const signupForm = document.getElementById('signup-form');
        const adminSignupForm = document.getElementById('admin-signup-form');
        if (signupForm) signupForm.style.display = 'none';
        if (adminSignupForm) adminSignupForm.style.display = 'none';
    });
});

// ============ FIXED SHOW/HIDE STUDENT SIGNUP ============
document.getElementById('showSignupLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    const signupForm = document.getElementById('signup-form');
    const adminSignupForm = document.getElementById('admin-signup-form');
    if (signupForm) signupForm.style.display = 'block';
    if (adminSignupForm) adminSignupForm.style.display = 'none';
    const previewInput = document.getElementById('signupStudentIdPreview');
    if (previewInput) previewInput.value = generateStudentId();
});

document.getElementById('hideSignupLink')?.addEventListener('click', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.style.display = 'none';
});

// ============ FIXED SHOW/HIDE ADMIN SIGNUP ============
const showAdminSignupLink = document.getElementById('showAdminSignupLink');
const hideAdminSignupLink = document.getElementById('hideAdminSignupLink');

if (showAdminSignupLink) {
    showAdminSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        const signupForm = document.getElementById('signup-form');
        const adminSignupForm = document.getElementById('admin-signup-form');
        if (signupForm) signupForm.style.display = 'none';
        if (adminSignupForm) adminSignupForm.style.display = 'block';
    });
}

if (hideAdminSignupLink) {
    hideAdminSignupLink.addEventListener('click', () => {
        const adminSignupForm = document.getElementById('admin-signup-form');
        if (adminSignupForm) adminSignupForm.style.display = 'none';
    });
}

// ============ STUDENT SIGNUP ============
document.getElementById('studentSignupBtn')?.addEventListener('click', () => {
    const name = document.getElementById('signupName').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirmPassword').value;
    
    if (!name || !password) { alert('Please fill all fields'); return; }
    if (password !== confirm) { alert('Passwords do not match'); return; }
    
    const studentId = generateStudentId();
    usersDB.students.push({ 
        id: studentId, password, name, 
        educationLevel: null, program: null, yearLevel: null,
        registrationCompleted: false, enrolledSubjects: [], grades: {}, attendance: {}
    });
    saveData();
    
    logToCustomConsole(`NEW STUDENT ACCOUNT: ${name} (${studentId})`, "success", true);
    alert(`Account created! Student ID: ${studentId}`);
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('studentIdInput').value = studentId;
});

// ============ ADMIN SIGNUP ============
document.getElementById('adminSignupBtn')?.addEventListener('click', () => {
    const name = document.getElementById('adminSignupName').value.trim();
    const email = document.getElementById('adminSignupEmail').value.trim();
    const password = document.getElementById('adminSignupPassword').value;
    const confirm = document.getElementById('adminSignupConfirmPassword').value;
    const adminCode = document.getElementById('adminSignupCode').value;
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    if (adminCode !== 'ADMIN2024') {
        alert('Invalid Admin Registration Code. Use: ADMIN2024');
        return;
    }
    if (usersDB.admins.some(a => a.email === email)) {
        alert('Admin email already exists');
        return;
    }
    
    usersDB.admins.push({ email, password, name });
    saveData();
    logToCustomConsole(`ADMIN ACCOUNT CREATED: ${name} (${email})`, "success", true);
    alert('Admin account created successfully! Please login.');
    
    document.getElementById('adminSignupName').value = '';
    document.getElementById('adminSignupEmail').value = '';
    document.getElementById('adminSignupPassword').value = '';
    document.getElementById('adminSignupConfirmPassword').value = '';
    document.getElementById('adminSignupCode').value = '';
    document.getElementById('admin-signup-form').style.display = 'none';
});

// ============ STUDENT LOGIN ============
document.getElementById('studentLoginBtn')?.addEventListener('click', () => {
    const id = document.getElementById('studentIdInput').value.trim();
    const pwd = document.getElementById('studentPasswordInput').value;
    const student = usersDB.students.find(s => s.id === id && s.password === pwd);
    
    if (student) {
        currentUser = { type: 'student', data: student };
        logToCustomConsole(`STUDENT LOGIN: ${student.name} (${student.id})`, "success", true);
        updateUIAfterLogin();
    } else {
        logToCustomConsole(`FAILED STUDENT LOGIN: ${id}`, "error", true);
        alert('Invalid Student ID or Password');
    }
});

// ============ FIXED ADMIN LOGIN ============
document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
    const email = document.getElementById('adminEmailInput').value.trim();
    const pwd = document.getElementById('adminPasswordInput').value;
    
    console.log("=== ADMIN LOGIN ATTEMPT ===");
    console.log("Email entered:", email);
    console.log("Available admins:", usersDB.admins);
    
    // Check if credentials match any admin
    const admin = usersDB.admins.find(a => a.email === email && a.password === pwd);
    
    if (admin) {
        currentUser = { type: 'admin', data: admin };
        logToCustomConsole(`✅ ADMIN LOGIN SUCCESS: ${admin.name} (${email})`, "success", true);
        updateUIAfterLogin();
    } else {
        logToCustomConsole(`❌ ADMIN LOGIN FAILED: ${email}`, "error", true);
        alert('Invalid Admin Email or Password.\n\nDefault Admin:\nEmail: admin@school.edu\nPassword: admin123');
    }
});

document.getElementById('logoutBtnSidebar')?.addEventListener('click', () => {
    logToCustomConsole(`LOGOUT: ${currentUser?.data?.name}`, "action", true);
    currentUser = null;
    loginPanel.classList.add('active');
    dashboardContent.classList.remove('active');
    document.getElementById('sidebarUserName').textContent = 'Guest';
    document.getElementById('sidebarUserRole').textContent = 'Not logged in';
    document.getElementById('logoutBtnSidebar').style.display = 'none';
    updatePageTitleAndHeader('login');
});

function updateUIAfterLogin() {
    loginPanel.classList.remove('active');
    dashboardContent.classList.add('active');
    document.getElementById('sidebarUserName').textContent = currentUser.data.name;
    document.getElementById('sidebarUserRole').textContent = currentUser.type === 'student' ? 'Student' : 'Administrator';
    document.getElementById('logoutBtnSidebar').style.display = 'block';
    document.getElementById('welcomeUserName').textContent = currentUser.data.name;
    
    const programDisplay = currentUser.data.program || 'Not set';
    const yearDisplay = currentUser.data.yearLevel || 'Not set';
    document.getElementById('welcomeDetails').innerHTML = `<i class="fas fa-id-card"></i> ${currentUser.data.id || 'N/A'} | <i class="fas fa-graduation-cap"></i> ${programDisplay} | <i class="fas fa-calendar"></i> ${yearDisplay}`;
    document.getElementById('enrolledCount').textContent = currentUser.data.enrolledSubjects?.length || 0;
    
    if (currentUser.type === 'admin') {
        document.getElementById('adminRecordsView').style.display = 'block';
        document.getElementById('studentRecordsView').style.display = 'none';
        document.getElementById('adminUpdatesView').style.display = 'block';
        document.getElementById('studentUpdatesView').style.display = 'none';
        loadAdminStudentSelect();
        setupAdminUpdateTabs();
    } else {
        document.getElementById('adminRecordsView').style.display = 'none';
        document.getElementById('studentRecordsView').style.display = 'block';
        document.getElementById('adminUpdatesView').style.display = 'none';
        document.getElementById('studentUpdatesView').style.display = 'block';
        document.getElementById('userProgramDisplay').textContent = currentUser.data.program || 'Not set';
        document.getElementById('userYearDisplay').textContent = currentUser.data.yearLevel || 'Not set';
        updateEnrolledSubjectsPreview();
    }
    updateDashboard();
    updatePageTitleAndHeader('dashboard');
}

function updateDashboard() {
    if (!currentUser || currentUser.type !== 'student') return;
    const enrolled = currentUser.data.enrolledSubjects || [];
    if (enrolled.length === 0) {
        document.getElementById('enrolledCoursesTable').innerHTML = '<p>No subjects enrolled. Go to <strong>Self-Enrollment</strong>.</p>';
    } else {
        let html = '<div class="enrolled-courses-table">';
        enrolled.forEach(subject => {
            const info = getScheduleInfo(subject);
            html += `<div class="course-schedule-item">
                        <span class="course-name">${subject.name}</span>
                        <span class="course-schedule"><i class="fas fa-calendar"></i> ${info.day} ${info.time}</span>
                        <span class="course-schedule"><i class="fas fa-door-open"></i> ${info.room}</span>
                        <span class="course-professor"><i class="fas fa-chalkboard-teacher"></i> ${info.professor}</span>
                     </div>`;
        });
        html += '</div>';
        document.getElementById('enrolledCoursesTable').innerHTML = html;
    }
}

// ============ ENROLLED SUBJECTS PREVIEW FOR SCHEDULE GENERATOR ============
function updateEnrolledSubjectsPreview() {
    const enrolled = currentUser?.data?.enrolledSubjects || [];
    const container = document.getElementById('enrolledSubjectsListPreview');
    const avoidSelect = document.getElementById('subjectsToAvoid');
    
    if (!container) return;
    
    if (enrolled.length === 0) {
        container.innerHTML = '<p class="text-muted">No enrolled subjects yet. Go to Self-Enrollment first.</p>';
        if (avoidSelect) avoidSelect.innerHTML = '<option value="">No subjects available</option>';
        return;
    }
    
    let badges = '';
    let avoidOptions = '<option value="">None</option>';
    enrolled.forEach(subject => {
        badges += `<span class="enrolled-preview-badge">${subject.name}</span>`;
        avoidOptions += `<option value="${subject.name}">${subject.name}</option>`;
    });
    container.innerHTML = badges;
    if (avoidSelect) avoidSelect.innerHTML = avoidOptions;
}

// ============ ENHANCED SELF-ENROLLMENT ============
let currentSubjects = [];
let currentFilter = "all";
let currentSearch = "";

function setupSubjectTabsAndSearch() {
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-tab');
            filterAndDisplaySubjects();
        });
    });
    
    document.getElementById('subjectSearch')?.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        filterAndDisplaySubjects();
    });
}

function filterAndDisplaySubjects() {
    let filtered = [...currentSubjects];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(s => s.category === currentFilter);
    }
    
    if (currentSearch) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(currentSearch));
    }
    
    displaySubjectsGrid(filtered);
    updateSelectedCount();
}

function displaySubjectsGrid(subjects) {
    const container = document.getElementById('availableSubjectsList');
    const enrolled = currentUser.data.enrolledSubjects || [];
    const enrolledNames = new Set(enrolled.map(e => e.name));
    
    if (subjects.length === 0) {
        container.innerHTML = '<p class="text-center">No subjects found.</p>';
        return;
    }
    
    let html = '<div class="subjects-grid">';
    subjects.forEach(subject => {
        const isEnrolled = enrolledNames.has(subject.name);
        html += `<div class="subject-card ${isEnrolled ? 'selected' : ''}" data-subject='${JSON.stringify(subject)}'>
                    <input type="checkbox" class="subject-checkbox" value="${subject.name}" ${isEnrolled ? 'checked disabled' : ''}>
                    <div class="subject-info">
                        <strong>${subject.name}</strong>
                        <small>${subject.room} | ${subject.professor}</small>
                    </div>
                    ${isEnrolled ? '<i class="fas fa-check-circle" style="color:#10B981;"></i>' : ''}
                </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.subject-card').forEach(card => {
        const checkbox = card.querySelector('.subject-checkbox');
        if (!checkbox.disabled) {
            card.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    card.classList.toggle('selected', checkbox.checked);
                    updateSelectedCount();
                }
            });
            checkbox.addEventListener('change', () => {
                card.classList.toggle('selected', checkbox.checked);
                updateSelectedCount();
            });
        }
    });
}

function updateSelectedCount() {
    const selected = document.querySelectorAll('.subject-checkbox:checked:not([disabled])').length;
    document.getElementById('selectedCount').textContent = selected;
    document.getElementById('selectedCountBtn').textContent = selected;
}

function loadAvailableSubjects() {
    if (!currentUser || currentUser.type !== 'student') return;
    const student = currentUser.data;
    
    if (!student.program) {
        document.getElementById('availableSubjectsList').innerHTML = '<p>⚠️ Please complete the Registration Wizard first.</p>';
        return;
    }
    
    const isHighschool = student.educationLevel === 'highschool';
    currentSubjects = getSubjectsForProgram(student.program, isHighschool, student.yearLevel);
    
    if (currentSubjects.length === 0) {
        document.getElementById('availableSubjectsList').innerHTML = `<p>No subjects found for ${student.program} - ${student.yearLevel}.</p>`;
        return;
    }
    
    filterAndDisplaySubjects();
}

document.getElementById('enrollSelectedBtn')?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.subject-checkbox:checked:not([disabled])');
    if (checkboxes.length === 0) { alert('Select at least one subject.'); return; }
    
    const student = currentUser.data;
    const allSubjects = currentSubjects;
    const newSubjects = Array.from(checkboxes).map(cb => allSubjects.find(s => s.name === cb.value));
    const enrolled = student.enrolledSubjects || [];
    const updatedEnrolled = [...enrolled, ...newSubjects];
    currentUser.data.enrolledSubjects = updatedEnrolled;
    
    const studentIndex = usersDB.students.findIndex(s => s.id === currentUser.data.id);
    if (studentIndex !== -1) usersDB.students[studentIndex].enrolledSubjects = updatedEnrolled;
    saveData();
    
    logToCustomConsole(`ENROLLED ${newSubjects.length} subjects`, "success", true);
    alert(`Enrolled ${newSubjects.length} subjects!`);
    loadAvailableSubjects();
    updateDashboard();
    updateEnrolledSubjectsPreview();
});

// ============ UPDATES FEATURE ============
function loadNotificationsView() {
    if (!currentUser) return;
    
    if (currentUser.type === 'admin') {
        return;
    }
    
    const container = document.getElementById('studentNotificationsList');
    let allNotifications = [];
    
    notificationsDB.schedule.forEach(n => allNotifications.push({ ...n, type: 'schedule', icon: '📅', color: '#3B82F6' }));
    notificationsDB.room.forEach(n => allNotifications.push({ ...n, type: 'room', icon: '🏠', color: '#F59E0B' }));
    notificationsDB.professor.forEach(n => allNotifications.push({ ...n, type: 'professor', icon: '👨‍🏫', color: '#10B981' }));
    
    allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allNotifications.length === 0) {
        container.innerHTML = '<p>No announcements yet.</p>';
        return;
    }
    
    let html = '';
    allNotifications.forEach(n => {
        html += `<div class="notification-item">
                    <div class="notification-icon ${n.type}" style="background: ${n.color}20; color: ${n.color}">
                        <i class="fas ${n.type === 'schedule' ? 'fa-clock' : n.type === 'room' ? 'fa-door-open' : 'fa-chalkboard-teacher'}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${n.title}</div>
                        <div class="notification-details">${n.details}</div>
                        <div class="notification-reason">Reason: ${n.reason}</div>
                        <div class="notification-date">Posted: ${new Date(n.date).toLocaleString()}</div>
                    </div>
                </div>`;
    });
    container.innerHTML = html;
}

function setupAdminUpdateTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const panel = tab.getAttribute('data-admin-tab');
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active-panel'));
            document.getElementById(`${panel}ChangePanel`).classList.add('active-panel');
        });
    });
}

function addNotification(type, title, details, reason) {
    const notification = {
        id: Date.now(),
        title: title,
        details: details,
        reason: reason,
        date: new Date().toISOString()
    };
    
    if (type === 'schedule') notificationsDB.schedule.unshift(notification);
    else if (type === 'room') notificationsDB.room.unshift(notification);
    else if (type === 'professor') notificationsDB.professor.unshift(notification);
    
    saveNotifications();
    logToCustomConsole(`NOTIFICATION POSTED: ${title}`, "success", true);
    alert('Announcement posted successfully!');
    
    if (type === 'schedule') {
        document.getElementById('scheduleSubject').value = '';
        document.getElementById('oldSchedule').value = '';
        document.getElementById('newSchedule').value = '';
        document.getElementById('scheduleReason').value = '';
    } else if (type === 'room') {
        document.getElementById('roomSubject').value = '';
        document.getElementById('oldRoom').value = '';
        document.getElementById('newRoom').value = '';
        document.getElementById('roomReason').value = '';
    } else {
        document.getElementById('profSubject').value = '';
        document.getElementById('oldProfessor').value = '';
        document.getElementById('newProfessor').value = '';
        document.getElementById('profReason').value = '';
    }
}

document.getElementById('postScheduleChangeBtn')?.addEventListener('click', () => {
    const subject = document.getElementById('scheduleSubject').value;
    const oldSchedule = document.getElementById('oldSchedule').value;
    const newSchedule = document.getElementById('newSchedule').value;
    const reason = document.getElementById('scheduleReason').value;
    
    if (!subject || !oldSchedule || !newSchedule) {
        alert('Please fill all fields');
        return;
    }
    
    addNotification('schedule', `Schedule Change: ${subject}`, `From: ${oldSchedule} → To: ${newSchedule}`, reason || 'No reason provided');
});

document.getElementById('postRoomChangeBtn')?.addEventListener('click', () => {
    const subject = document.getElementById('roomSubject').value;
    const oldRoom = document.getElementById('oldRoom').value;
    const newRoom = document.getElementById('newRoom').value;
    const reason = document.getElementById('roomReason').value;
    
    if (!subject || !oldRoom || !newRoom) {
        alert('Please fill all fields');
        return;
    }
    
    addNotification('room', `Room Change: ${subject}`, `From: ${oldRoom} → To: ${newRoom}`, reason || 'No reason provided');
});

document.getElementById('postProfessorChangeBtn')?.addEventListener('click', () => {
    const subject = document.getElementById('profSubject').value;
    const oldProfessor = document.getElementById('oldProfessor').value;
    const newProfessor = document.getElementById('newProfessor').value;
    const reason = document.getElementById('profReason').value;
    
    if (!subject || !oldProfessor || !newProfessor) {
        alert('Please fill all fields');
        return;
    }
    
    addNotification('professor', `Professor Change: ${subject}`, `From: ${oldProfessor} → To: ${newProfessor}`, reason || 'No reason provided');
});

// ============ AI SCHEDULE GENERATOR WITH ATTENDANCE ANALYSIS ============
function analyzeAttendanceAndGenerateInsights() {
    const attendance = currentUser.data.attendance || {};
    const enrolled = currentUser.data.enrolledSubjects || [];
    
    if (enrolled.length === 0) {
        return '<div class="ai-insight-item"><i class="fas fa-info-circle"></i> No enrolled subjects yet. Enroll first to generate schedule.</div>';
    }
    
    let hasData = false;
    Object.values(attendance).forEach(rate => { if (rate) hasData = true; });
    
    if (!hasData) {
        return '<div class="ai-insight-item"><i class="fas fa-info-circle"></i> No attendance data yet. Schedule will use default optimization.</div>';
    }
    
    let insights = '<div class="ai-insight-item"><i class="fas fa-chart-line"></i> 📊 Attendance Analysis Complete:</div>';
    let worstSlot = null;
    let worstRate = 100;
    const timeSlotCount = { "7-10": 0, "10-1": 0, "1-4": 0, "4-7": 0 };
    const timeSlotTotal = { "7-10": 0, "10-1": 0, "1-4": 0, "4-7": 0 };
    
    enrolled.forEach(subject => {
        const info = getScheduleInfo(subject);
        const attendanceRate = attendance[subject.name] || 75;
        const slot = info.timeSlot;
        timeSlotTotal[slot] += attendanceRate;
        timeSlotCount[slot]++;
    });
    
    for (const slot in timeSlotTotal) {
        if (timeSlotCount[slot] > 0) {
            const avg = timeSlotTotal[slot] / timeSlotCount[slot];
            if (avg < worstRate) {
                worstRate = avg;
                worstSlot = slot;
            }
        }
    }
    
    if (worstSlot) {
        const slotNames = { "7-10": "7:00 AM - 10:00 AM", "10-1": "10:00 AM - 1:00 PM", "1-4": "1:00 PM - 4:00 PM", "4-7": "4:00 PM - 7:00 PM" };
        insights += `<div class="ai-insight-item"><i class="fas fa-exclamation-triangle"></i> ⚠️ Your lowest attendance is during ${slotNames[worstSlot]} (${Math.round(worstRate)}%)</div>`;
        insights += `<div class="ai-insight-item"><i class="fas fa-lightbulb"></i> 💡 AI will avoid scheduling classes during this time slot.</div>`;
        const avoidSelect = document.getElementById('avoidTimeSlot');
        if (avoidSelect) avoidSelect.value = worstSlot;
    }
    
    return insights;
}

function generateAISchedule() {
    const enrolled = currentUser.data.enrolledSubjects || [];
    if (enrolled.length === 0) {
        document.getElementById('scheduleResult').innerHTML = '<div class="warning-message"><i class="fas fa-exclamation-triangle"></i> You have no enrolled subjects. Please go to Self-Enrollment first.</div>';
        document.getElementById('scheduleResult').classList.add('show');
        return null;
    }
    
    const subjectToAvoid = document.getElementById('subjectsToAvoid')?.value;
    const preferredTime = document.getElementById('preferredTime').value;
    const preferredDays = document.getElementById('preferredDays').value;
    
    let customDays = [];
    if (preferredDays === 'custom') {
        document.querySelectorAll('#customDaysContainer input:checked').forEach(cb => {
            customDays.push(cb.value);
        });
    }
    
    let availableSubjects = [...enrolled];
    
    // Check if subject to avoid is being removed
    if (subjectToAvoid) {
        const subjectExists = availableSubjects.some(s => s.name === subjectToAvoid);
        if (subjectExists) {
            if (availableSubjects.length <= 1) {
                document.getElementById('scheduleResult').innerHTML = '<div class="warning-message"><i class="fas fa-exclamation-triangle"></i> ⚠️ Request Not Granted due to Schedule Inadequacy! You cannot remove this subject as it would leave you with an incomplete schedule.</div>';
                document.getElementById('scheduleResult').classList.add('show');
                return null;
            }
            availableSubjects = availableSubjects.filter(s => s.name !== subjectToAvoid);
            logToCustomConsole(`Subject "${subjectToAvoid}" removed from schedule generation`, "action", false);
        }
    }
    
    // Filter by preferred time
    if (preferredTime !== 'any') {
        availableSubjects = availableSubjects.filter(subj => {
            const info = getScheduleInfo(subj);
            const hour = parseInt(info.time.match(/(\d+):/)?.[1] || 8);
            if (preferredTime === 'morning') return hour >= 8 && hour < 12;
            if (preferredTime === 'afternoon') return hour >= 13 && hour < 17;
            if (preferredTime === 'evening') return hour >= 17;
            return true;
        });
    }
    
    // Filter by preferred days
    if (preferredDays === 'mon-wed-fri') {
        availableSubjects = availableSubjects.filter(subj => {
            const info = getScheduleInfo(subj);
            return ['Monday', 'Wednesday', 'Friday'].includes(info.day);
        });
    } else if (preferredDays === 'tue-thu') {
        availableSubjects = availableSubjects.filter(subj => {
            const info = getScheduleInfo(subj);
            return ['Tuesday', 'Thursday'].includes(info.day);
        });
    } else if (preferredDays === 'custom' && customDays.length > 0) {
        availableSubjects = availableSubjects.filter(subj => {
            const info = getScheduleInfo(subj);
            return customDays.includes(info.day);
        });
    }
    
    if (availableSubjects.length === 0) {
        document.getElementById('scheduleResult').innerHTML = '<div class="warning-message"><i class="fas fa-exclamation-triangle"></i> No subjects match your preferences. Please adjust your filters.</div>';
        document.getElementById('scheduleResult').classList.add('show');
        return null;
    }
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];
    let schedule = {};
    days.forEach(day => { schedule[day] = {}; times.forEach(time => { schedule[day][time] = null; }); });
    
    availableSubjects.forEach(subject => {
        const info = getScheduleInfo(subject);
        if (schedule[info.day] && schedule[info.day][info.time] === null) {
            schedule[info.day][info.time] = subject;
        }
    });
    
    return schedule;
}

function renderAISchedule(schedule) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];
    
    let html = '<div class="schedule-ai-result"><h4><i class="fas fa-brain"></i> AI-Optimized Schedule</h4>';
    html += '<table class="schedule-table"><thead><tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead><tbody>';
    
    times.forEach(time => {
        html += `<tr><td class="time-col">${time}</td>`;
        days.forEach(day => {
            const subject = schedule[day]?.[time];
            if (subject) {
                const info = getScheduleInfo(subject);
                html += `<td><div class="subject-cell">${subject.name}</div>
                         <div class="room-cell"><i class="fas fa-door-open"></i> ${info.room}</div>
                         <div class="professor-cell"><i class="fas fa-chalkboard-teacher"></i> ${info.professor}</div></td>`;
            } else {
                html += `<td style="color:#94a3b8;">— Free —</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}

document.getElementById('generateAIScheduleBtn')?.addEventListener('click', () => {
    if (!currentUser || currentUser.type !== 'student') {
        alert('Please login as student');
        return;
    }
    
    updateEnrolledSubjectsPreview();
    
    const enrolled = currentUser.data.enrolledSubjects || [];
    if (enrolled.length === 0) {
        alert('Please enroll in subjects first using Self-Enrollment');
        return;
    }
    
    const insights = analyzeAttendanceAndGenerateInsights();
    document.getElementById('aiInsights').innerHTML = insights;
    
    const schedule = generateAISchedule();
    if (schedule) {
        const html = renderAISchedule(schedule);
        document.getElementById('scheduleResult').innerHTML = html;
        document.getElementById('scheduleResult').classList.add('show');
        logToCustomConsole(`AI SCHEDULE GENERATED for ${currentUser.data.enrolledSubjects.length} enrolled subjects`, "success", true);
    }
});

// Custom days container toggle
document.getElementById('preferredDays')?.addEventListener('change', (e) => {
    document.getElementById('customDaysContainer').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// ============ REGISTRATION WIZARD ============
let currentPhase = 1;
function showPhase(phase) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`wizard-phase-${i}`);
        if (el) el.classList.toggle('active-phase', i === phase);
    }
    currentPhase = phase;
    document.querySelectorAll('.wizard-step').forEach((step, idx) => {
        step.classList.remove('active', 'completed');
        if (idx + 1 < phase) step.classList.add('completed');
        if (idx + 1 === phase) step.classList.add('active');
    });
    if (phase === 5) {
        const personal = registrationData.personal || {};
        const schoolType = registrationData.school?.level === 'highschool' ? 'High School' : 'College';
        const schoolValue = registrationData.school?.level === 'highschool' ? `Grade: ${registrationData.school?.grade}` : `Program: ${registrationData.school?.program}, Year: ${registrationData.school?.year}`;
        document.getElementById('confirmationDetails').innerHTML = `
            <p><strong>Name:</strong> ${personal.fullName || 'N/A'}</p>
            <p><strong>Education:</strong> ${schoolType}<br>${schoolValue}</p>
            <p><strong>Down Payment:</strong> ₱${registrationData.downPayment || '0'}</p>
        `;
    }
}

document.querySelectorAll('.next-phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const next = parseInt(btn.getAttribute('data-next'));
        if (currentPhase === 1) registrationData.downPayment = document.getElementById('downPaymentAmount').value;
        if (currentPhase === 2) {
            registrationData.personal = {
                fullName: document.getElementById('personalFullName').value,
                contact: document.getElementById('personalContact').value,
                email: document.getElementById('personalEmail').value,
                address: document.getElementById('personalAddress').value
            };
        }
        if (currentPhase === 3) {
            const level = document.getElementById('schoolLevel').value;
            registrationData.school = { level };
            if (level === 'highschool') {
                registrationData.school.grade = document.getElementById('highschoolGrade').value;
            } else if (level === 'college') {
                registrationData.school.program = document.getElementById('collegeProgram').value;
                registrationData.school.year = document.getElementById('collegeYear').value;
            }
        }
        if (currentPhase === 4) registrationData.paymentPlan = document.getElementById('paymentPlan').value;
        showPhase(next);
    });
});

document.querySelectorAll('.prev-phase-btn').forEach(btn => {
    btn.addEventListener('click', () => showPhase(parseInt(btn.getAttribute('data-prev'))));
});

document.getElementById('finalConfirmBtn')?.addEventListener('click', () => {
    if (!document.getElementById('agreeTerms').checked) { alert('Please agree to terms'); return; }
    if (!registrationData.school || !registrationData.school.level) { alert('Complete school details'); return; }
    
    if (currentUser && currentUser.type === 'student') {
        if (registrationData.school.level === 'highschool') {
            currentUser.data.educationLevel = 'highschool';
            currentUser.data.program = registrationData.school.grade;
            currentUser.data.yearLevel = registrationData.school.grade;
        } else {
            currentUser.data.educationLevel = 'college';
            currentUser.data.program = registrationData.school.program;
            currentUser.data.yearLevel = registrationData.school.year;
        }
        currentUser.data.registrationCompleted = true;
        
        const idx = usersDB.students.findIndex(s => s.id === currentUser.data.id);
        if (idx !== -1) {
            usersDB.students[idx] = currentUser.data;
            saveData();
        }
        
        logToCustomConsole(`REGISTRATION COMPLETED: ${currentUser.data.program} - ${currentUser.data.yearLevel}`, "success", true);
        alert('Registration completed! Go to Self-Enrollment.');
        switchContent('dashboard');
        loadAvailableSubjects();
        updateDashboard();
        document.getElementById('userProgramDisplay').textContent = currentUser.data.program;
        document.getElementById('userYearDisplay').textContent = currentUser.data.yearLevel;
    }
});

// ============ STUDENT RECORDS ============
function loadStudentRecordsView() {
    if (!currentUser) return;
    const grades = currentUser.data.grades || {};
    const attendance = currentUser.data.attendance || {};
    
    let gradesHtml = '<table class="tuition-table"><thead><tr><th>Subject</th><th>Grade</th><th>Attendance</th></tr></thead><tbody>';
    let totalGrade = 0;
    let gradeCount = 0;
    
    Object.keys(grades).forEach(subject => {
        const grade = grades[subject];
        const att = attendance[subject] || 'N/A';
        totalGrade += grade;
        gradeCount++;
        gradesHtml += `<tr><td><strong>${subject}</strong></td><td>${grade}%</td><td>${att}%</td></tr>`;
    });
    const average = gradeCount > 0 ? (totalGrade / gradeCount).toFixed(2) : 'N/A';
    gradesHtml += `<tr class="total-row"><td><strong>Average</strong></td><td colspan="2"><strong>${average}%</strong></td></tr></tbody></table>`;
    document.getElementById('studentGradesDisplay').innerHTML = gradesHtml || '<p>No grades yet.</p>';
}

function loadAdminStudentSelect() {
    const select = document.getElementById('adminStudentSelect');
    select.innerHTML = '<option>Select Student</option>' + usersDB.students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
    select.addEventListener('change', () => {
        const student = usersDB.students.find(s => s.id === select.value);
        if (student && student.program) {
            const subjects = getSubjectsForProgram(student.program, student.educationLevel === 'highschool', student.yearLevel);
            document.getElementById('gradeSubjectSelect').innerHTML = '<option>Select Subject</option>' + subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
        }
    });
}

document.getElementById('saveGradeBtn')?.addEventListener('click', () => {
    const studentId = document.getElementById('adminStudentSelect').value;
    const subject = document.getElementById('gradeSubjectSelect').value;
    const grade = parseInt(document.getElementById('gradeInput').value);
    const attendance = parseInt(document.getElementById('attendanceInput').value);
    
    if (!studentId || !subject || isNaN(grade)) { alert('Fill all fields'); return; }
    const student = usersDB.students.find(s => s.id === studentId);
    if (student) {
        if (!student.grades) student.grades = {};
        if (!student.attendance) student.attendance = {};
        student.grades[subject] = grade;
        if (!isNaN(attendance)) student.attendance[subject] = attendance;
        saveData();
        logToCustomConsole(`GRADE SAVED: ${student.name} - ${subject}: ${grade}%`, "success", true);
        alert('Grade saved!');
        document.getElementById('gradeInput').value = '';
        document.getElementById('attendanceInput').value = '';
    }
});

// ============ UI EVENT LISTENERS ============
document.getElementById('schoolLevel')?.addEventListener('change', (e) => {
    document.getElementById('highschoolFields').style.display = e.target.value === 'highschool' ? 'block' : 'none';
    document.getElementById('collegeFields').style.display = e.target.value === 'college' ? 'block' : 'none';
});

// ============ INITIALIZE ============
updatePageTitleAndHeader('login');
logToCustomConsole("System Ready - AI Schedule Generator & Enhanced Features", "success", false);
logToCustomConsole("7 College Programs + High School - Complete Curricula", "info", false);
logToCustomConsole("Default Admin Login: admin@school.edu / admin123", "info", false);
setTimeout(() => closeConsole(), 5000);