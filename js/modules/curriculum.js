/* ============================================
   CURRICULUM MODULE - Academic Data
   COMPLETE - All JHS, SHS, and ALL 7 College programs
   ============================================ */

const highSchoolCurriculum = {
    "Grade 9": [
        { name: "English 9", room: "RM 201", professor: "Prof. Maria Santos", category: "core", units: 1 },
        { name: "Mathematics 9", room: "RM 202", professor: "Prof. Jose Rizal", category: "core", units: 1 },
        { name: "Science 9", room: "LAB 101", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
        { name: "Filipino 9", room: "RM 204", professor: "Prof. Virgilio Almario", category: "core", units: 1 },
        { name: "Araling Panlipunan 9", room: "RM 203", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
        { name: "MAPEH 9", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "minor", units: 1 },
        { name: "TLE 9", room: "WSHOP 1", professor: "Prof. Ramon Magsaysay", category: "minor", units: 1 },
        { name: "Values Education 9", room: "RM 205", professor: "Prof. Carmen Perez", category: "core", units: 1 },
        { name: "Research 9", room: "LIB 101", professor: "Prof. Fe Del Mundo", category: "minor", units: 1 }
    ],
    "Grade 10": [
        { name: "English 10", room: "RM 206", professor: "Prof. Maria Santos", category: "core", units: 1 },
        { name: "Mathematics 10", room: "RM 207", professor: "Prof. Jose Rizal", category: "core", units: 1 },
        { name: "Science 10", room: "LAB 102", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
        { name: "Filipino 10", room: "RM 209", professor: "Prof. Virgilio Almario", category: "core", units: 1 },
        { name: "Araling Panlipunan 10", room: "RM 208", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
        { name: "MAPEH 10", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "minor", units: 1 },
        { name: "Research 10", room: "LIB 101", professor: "Prof. Fe Del Mundo", category: "minor", units: 1 },
        { name: "Values Education 10", room: "RM 210", professor: "Prof. Carmen Perez", category: "core", units: 1 },
        { name: "Career Guidance", room: "RM 211", professor: "Prof. Maria Santos", category: "minor", units: 1 }
    ]
};

const seniorHighStrandSubjects = {
    "STEM": {
        "Grade 11": [
            { name: "Pre-Calculus", room: "RM 301", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "General Biology 1", room: "LAB 201", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
            { name: "General Chemistry 1", room: "LAB 203", professor: "Prof. Paulo Campos", category: "core", units: 1 },
            { name: "Earth Science", room: "LAB 205", professor: "Prof. Gregorio Y. Zara", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 302", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 303", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Basic Calculus", room: "RM 305", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "General Physics 2", room: "PHY LAB 202", professor: "Prof. William Ong", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 306", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Media & Information Literacy", room: "RM 307", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "ABM": {
        "Grade 11": [
            { name: "Business Mathematics", room: "RM 311", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Organization & Management", room: "RM 312", professor: "Prof. Socorro Ramos", category: "core", units: 1 },
            { name: "Principles of Marketing", room: "RM 313", professor: "Prof. Christine Flores", category: "core", units: 1 },
            { name: "Fundamentals of ABM 1", room: "RM 314", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 315", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 316", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Business Finance", room: "RM 317", professor: "Prof. Christine Flores", category: "core", units: 1 },
            { name: "Applied Economics", room: "RM 318", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 322", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "HUMMS": {
        "Grade 11": [
            { name: "Introduction to World Religions", room: "RM 331", professor: "Prof. Nick Joaquin", category: "core", units: 1 },
            { name: "Creative Writing", room: "RM 332", professor: "Prof. Lualhati Bautista", category: "core", units: 1 },
            { name: "Philippine Politics", room: "RM 333", professor: "Prof. F. Sionil Jose", category: "core", units: 1 },
            { name: "Oral Communication", room: "RM 334", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 335", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Introduction to Philosophy", room: "RM 336", professor: "Prof. Nick Joaquin", category: "core", units: 1 },
            { name: "Community Engagement", room: "RM 339", professor: "Prof. Teodoro Agoncillo", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Media & Information Literacy", room: "RM 341", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    },
    "GAS": {
        "Grade 11": [
            { name: "Academic Elective 1", room: "RM 351", professor: "Prof. Maria Santos", category: "elective", units: 1 },
            { name: "Academic Elective 2", room: "RM 352", professor: "Prof. Jose Rizal", category: "elective", units: 1 },
            { name: "Oral Communication", room: "RM 353", professor: "Prof. Maria Santos", category: "core", units: 1 },
            { name: "Reading & Writing", room: "RM 354", professor: "Prof. Jose Rizal", category: "core", units: 1 }
        ],
        "Grade 12": [
            { name: "Statistics & Probability", room: "RM 355", professor: "Prof. Robert Reyes", category: "core", units: 1 },
            { name: "Research Project", room: "LIB 201", professor: "Prof. Fe Del Mundo", category: "research", units: 1 },
            { name: "Entrepreneurship", room: "RM 358", professor: "Prof. Mark Rivera", category: "core", units: 1 },
            { name: "Work Immersion", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 2 }
        ]
    }
};

const collegeCurriculum = {
    "Bachelor of Science in Information Technology": {
        "1st Year": [
            { name: "Introduction to Computing", room: "IT LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Computer Programming 1", room: "IT LAB 101", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Computer Programming 2", room: "IT LAB 102", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Mathematics", room: "RM 406", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Web Systems and Technologies 1", room: "IT LAB 103", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Object-Oriented Programming", room: "IT LAB 201", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Data Structures and Algorithms", room: "IT LAB 202", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Database Management Systems", room: "IT LAB 203", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Computer Architecture and Organization", room: "IT LAB 204", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Networking 1", room: "NET LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Quantitative Methods", room: "RM 414", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Web Systems and Technologies 2", room: "IT LAB 205", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Information Management", room: "IT LAB 206", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Human-Computer Interaction", room: "IT LAB 207", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 }
        ],
        "3rd Year": [
            { name: "Software Engineering 1", room: "IT LAB 301", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security 1", room: "IT LAB 302", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Operating Systems", room: "IT LAB 303", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Networking 2", room: "NET LAB 302", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Mobile Application Development", room: "IT LAB 304", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Quantitative Research Methods", room: "RM 417", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Technical Writing", room: "RM 418", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Software Engineering 2", room: "IT LAB 305", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security 2", room: "IT LAB 306", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Systems Integration and Architecture", room: "IT LAB 307", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Application Development and Emerging Tech", room: "IT LAB 308", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Multimedia Systems", room: "IT LAB 309", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "IT Project Management", room: "IT LAB 310", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "IT Elective 1 - Cloud Computing", room: "IT LAB 311", professor: "Prof. Daniel Tan", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Capstone Project 1", room: "IT LAB 401", professor: "Prof. James Dela Cruz", category: "research", units: 3 },
            { name: "Professional Ethics in IT", room: "IT LAB 402", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "IT Elective 2 - DevOps Engineering", room: "IT LAB 403", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "Cybersecurity Fundamentals", room: "IT LAB 404", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Enterprise Architecture", room: "IT LAB 405", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "IT Service Management", room: "IT LAB 406", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Capstone Project 2", room: "IT LAB 407", professor: "Prof. James Dela Cruz", category: "research", units: 3 },
            { name: "IT Practicum / Internship (486 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "IT Elective 3 - Data Analytics", room: "IT LAB 408", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "IT Elective 4 - AI Foundations", room: "IT LAB 409", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "Emerging Technologies in IT", room: "IT LAB 410", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 }
        ]
    },
    "Bachelor of Science in Computer Science": {
        "1st Year": [
            { name: "Introduction to Computing", room: "CS LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Fundamentals of Programming", room: "CS LAB 101", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Structures 1", room: "RM 401", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 402", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 403", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Intermediate Programming", room: "CS LAB 102", professor: "Prof. Michael Santos", category: "major", units: 3 },
            { name: "Discrete Structures 2", room: "RM 404", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Calculus 1", room: "RM 411", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Understanding the Self", room: "RM 406", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Object-Oriented Programming", room: "CS LAB 201", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Data Structures and Algorithms", room: "CS LAB 202", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Logic Design and Digital Computer Circuits", room: "CS LAB 203", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Database Systems", room: "CS LAB 204", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Calculus 2", room: "RM 412", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 413", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Architecture and Organization", room: "CS LAB 205", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Information Management", room: "CS LAB 206", professor: "Prof. Angela Martinez", category: "major", units: 3 },
            { name: "Networks and Communications", room: "NET LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Linear Algebra", room: "RM 414", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Operating Systems", room: "CS LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Software Engineering 1", room: "CS LAB 302", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Automata Theory and Formal Languages", room: "CS LAB 303", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Algorithms and Complexity", room: "CS LAB 304", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Programming Languages", room: "CS LAB 305", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Probability and Statistics", room: "RM 417", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Software Engineering 2", room: "CS LAB 306", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Artificial Intelligence", room: "CS LAB 307", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Human-Computer Interaction", room: "CS LAB 308", professor: "Prof. Jennifer Cruz", category: "major", units: 3 },
            { name: "Numerical and Symbolic Computation", room: "CS LAB 309", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Research Methods in Computing", room: "LIB 301", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "CS Elective 1 - Web Engineering", room: "CS LAB 310", professor: "Prof. Daniel Tan", category: "elective", units: 3 },
            { name: "CS Elective 2 - Game Programming", room: "CS LAB 311", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Thesis Writing 1", room: "LIB 303", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Professional Ethics in CS", room: "CS LAB 401", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "CS Elective 3 - Distributed Systems", room: "CS LAB 402", professor: "Prof. Christopher Lee", category: "elective", units: 3 },
            { name: "CS Elective 4 - Machine Learning", room: "CS LAB 403", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "Compiler Design", room: "CS LAB 404", professor: "Prof. Daniel Tan", category: "major", units: 3 },
            { name: "Information Assurance and Security", room: "CS LAB 405", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Thesis Writing 2", room: "LIB 304", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "CS Practicum / Internship (200 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "CS Elective 5 - Computer Graphics", room: "CS LAB 406", professor: "Prof. Jennifer Cruz", category: "elective", units: 3 },
            { name: "CS Elective 6 - Cloud and Parallel Computing", room: "CS LAB 407", professor: "Prof. Christopher Lee", category: "elective", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "CS Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 },
            { name: "Capstone Defense", room: "AUD 2", professor: "Prof. Fe Del Mundo", category: "research", units: 1 }
        ]
    },
    "Bachelor of Science in Tourism Management": {
        "1st Year": [
            { name: "Introduction to Tourism and Hospitality", room: "TOUR 101", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Macro Perspective of Tourism and Hospitality", room: "TOUR 102", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Principles of Management", room: "TOUR 103", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Microeconomics with Land Reform & Taxation", room: "RM 410", professor: "Prof. Mark Rivera", category: "ge", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Quality Service Management in Tourism", room: "TOUR 104", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Risk Management as Applied to Safety & Security", room: "TOUR 105", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Tourism and Hospitality Marketing", room: "TOUR 201", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Philippine Culture and Tourism Geography", room: "TOUR 202", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Multicultural Diversity in the Workplace", room: "TOUR 203", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Sustainable Tourism", room: "TOUR 204", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Legal Aspects in Tourism and Hospitality", room: "TOUR 205", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 413", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "World Tourism Geography", room: "TOUR 206", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism and Hospitality Research 1", room: "TOUR 207", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Macroeconomics", room: "RM 411", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Tour Operations Management", room: "TOUR 301", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Travel Agency Operations", room: "TOUR 302", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "MICE Management (Meetings, Incentives, Conventions, Events)", room: "TOUR 303", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Transportation Management", room: "TOUR 304", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Front Office Management", room: "TOUR 305", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism and Hospitality Research 2", room: "TOUR 306", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Cruise Line Operations and Management", room: "TOUR 307", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Sustainable and Ecotourism", room: "TOUR 308", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Policy Planning and Development", room: "TOUR 309", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Information Systems", room: "TOUR 310", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Foreign Language - Mandarin Basics", room: "TOUR 311", professor: "Prof. Maria Santos", category: "elective", units: 3 },
            { name: "Tourism Elective 1 - Heritage Tourism", room: "TOUR 312", professor: "Prof. Christine Flores", category: "elective", units: 3 },
            { name: "Tourism Elective 2 - Rural and Farm Tourism", room: "TOUR 313", professor: "Prof. Mark Rivera", category: "elective", units: 3 }
        ],
        "4th Year": [
            { name: "Strategic Management for Tourism", room: "TOUR 401", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Tourism Entrepreneurship", room: "TOUR 402", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Capstone Project 1", room: "LIB 401", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "International Tourism and Hospitality", room: "TOUR 403", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Tourism Elective 3 - Cultural Tourism", room: "TOUR 404", professor: "Prof. Christine Flores", category: "elective", units: 3 },
            { name: "Tourism Elective 4 - Wellness Tourism", room: "TOUR 405", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Free Elective 1", room: "RM 419", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Capstone Project 2", room: "LIB 402", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Tourism Practicum / Internship (600 hrs)", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "Foreign Language - Spanish Basics", room: "TOUR 406", professor: "Prof. Maria Santos", category: "elective", units: 3 },
            { name: "Free Elective 2", room: "RM 420", professor: "Prof. Mark Rivera", category: "elective", units: 3 },
            { name: "Tourism Industry Seminar", room: "AUD 1", professor: "Industry Supervisor", category: "major", units: 1 },
            { name: "On-the-Job Training Briefing", room: "TOUR 407", professor: "Prof. Christine Flores", category: "major", units: 1 },
            { name: "Professional Ethics in Tourism", room: "TOUR 408", professor: "Prof. Carmen Perez", category: "major", units: 3 }
        ]
    },
    "Bachelor of Science in Business Administration": {
        "1st Year": [
            { name: "Principles of Management", room: "RM 501", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Microeconomics", room: "RM 502", professor: "Prof. Jose Rizal", category: "major", units: 3 },
            { name: "Financial Accounting 1", room: "RM 503", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Business Mathematics", room: "RM 504", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Introduction to Business", room: "RM 505", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Marketing Principles", room: "RM 506", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Business Communication", room: "RM 507", professor: "Prof. Maria Santos", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Macroeconomics", room: "RM 511", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Financial Accounting 2", room: "RM 512", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Operations Management", room: "RM 513", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Human Resource Management", room: "RM 514", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Business Statistics", room: "RM 515", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Money and Banking", room: "RM 516", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Organizational Behavior", room: "RM 517", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Strategic Management", room: "RM 521", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Business Law", room: "RM 522", professor: "Prof. Nick Joaquin", category: "major", units: 3 },
            { name: "Taxation", room: "RM 523", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Investment and Portfolio Management", room: "RM 524", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Entrepreneurship", room: "RM 525", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "International Business", room: "RM 526", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Business Research", room: "LIB 401", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 }
        ],
        "4th Year": [
            { name: "Capstone in Business", room: "RM 531", professor: "Prof. Mark Rivera", category: "research", units: 3 },
            { name: "Business Policy and Strategy", room: "RM 532", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Corporate Governance", room: "RM 533", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Risk Management", room: "RM 534", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Business Internship", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "Innovation Management", room: "RM 535", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Global Trade Operations", room: "RM 536", professor: "Prof. Christine Flores", category: "major", units: 3 }
        ]
    },
    "Bachelor of Science in Accountancy": {
        "1st Year": [
            { name: "Financial Accounting 1", room: "RM 601", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Financial Accounting 2", room: "RM 602", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Business Mathematics", room: "RM 603", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Microeconomics", room: "RM 604", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Principles of Management", room: "RM 605", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Business Communication", room: "RM 606", professor: "Prof. Maria Santos", category: "major", units: 3 },
            { name: "Computer Fundamentals for Accountants", room: "IT LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Cost Accounting", room: "RM 611", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Intermediate Accounting 1", room: "RM 612", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Intermediate Accounting 2", room: "RM 613", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Macroeconomics", room: "RM 614", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Statistics for Accountants", room: "RM 615", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Business Law", room: "RM 616", professor: "Prof. Nick Joaquin", category: "major", units: 3 },
            { name: "Income Taxation", room: "RM 617", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 }
        ],
        "3rd Year": [
            { name: "Auditing Theory", room: "RM 621", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Advanced Accounting 1", room: "RM 622", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Advanced Accounting 2", room: "RM 623", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Management Advisory Services", room: "RM 624", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Business Taxation", room: "RM 625", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Auditing Practice", room: "RM 626", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Accounting Information Systems", room: "IT LAB 201", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 }
        ],
        "4th Year": [
            { name: "CPA Review - FAR", room: "RM 631", professor: "Prof. Christine Flores", category: "review", units: 6 },
            { name: "CPA Review - AFAR", room: "RM 632", professor: "Prof. Christine Flores", category: "review", units: 6 },
            { name: "CPA Review - Audit", room: "RM 633", professor: "Prof. Christine Flores", category: "review", units: 6 },
            { name: "CPA Review - Tax", room: "RM 634", professor: "Prof. Christine Flores", category: "review", units: 6 },
            { name: "Accountancy Internship", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "Government Accounting", room: "RM 635", professor: "Prof. Christine Flores", category: "major", units: 3 },
            { name: "Capstone Audit Case", room: "RM 636", professor: "Prof. Christine Flores", category: "research", units: 3 }
        ]
    },
    "Bachelor of Science in Civil Engineering": {
        "1st Year": [
            { name: "Engineering Drawing 1", room: "ENG 101", professor: "Prof. Robert Reyes", category: "major", units: 2 },
            { name: "Calculus 1", room: "RM 411", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Chemistry for Engineers", room: "LAB 101", professor: "Prof. Gregorio Y. Zara", category: "major", units: 3 },
            { name: "Engineering Mechanics - Statics", room: "RM 701", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Computer-Aided Drafting", room: "ENG LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 2 },
            { name: "Physics for Engineers 1", room: "PHY LAB 101", professor: "Prof. William Ong", category: "major", units: 3 },
            { name: "Workshop Theory and Practice", room: "WSHOP 2", professor: "Prof. Ramon Magsaysay", category: "major", units: 2 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Calculus 2", room: "RM 412", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Differential Equations", room: "RM 413", professor: "Prof. Robert Reyes", category: "major", units: 3 },
            { name: "Strength of Materials", room: "RM 702", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Surveying 1", room: "FIELD 1", professor: "Prof. Christopher Lee", category: "major", units: 2 },
            { name: "Engineering Mechanics - Dynamics", room: "RM 703", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Construction Materials and Testing", room: "LAB 301", professor: "Prof. Christopher Lee", category: "major", units: 2 },
            { name: "Physics for Engineers 2", room: "PHY LAB 102", professor: "Prof. William Ong", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 }
        ],
        "3rd Year": [
            { name: "Hydraulics", room: "LAB 302", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Structural Theory", room: "RM 704", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Reinforced Concrete Design", room: "RM 705", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Steel Design", room: "RM 706", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Geotechnical Engineering 1", room: "LAB 303", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Surveying 2", room: "FIELD 2", professor: "Prof. Christopher Lee", category: "major", units: 2 },
            { name: "Transportation Engineering", room: "RM 707", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 }
        ],
        "4th Year": [
            { name: "CE Capstone Design", room: "RM 708", professor: "Prof. Christopher Lee", category: "research", units: 3 },
            { name: "Construction Project Management", room: "RM 709", professor: "Prof. Mark Rivera", category: "major", units: 3 },
            { name: "Earthquake Engineering", room: "RM 710", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Foundation Engineering", room: "RM 711", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "CE Practicum", room: "OFFSITE", professor: "Industry Supervisor", category: "practicum", units: 6 },
            { name: "Environmental Engineering", room: "RM 712", professor: "Prof. Christopher Lee", category: "major", units: 3 },
            { name: "Estimating and Costing", room: "RM 713", professor: "Prof. Mark Rivera", category: "major", units: 3 }
        ]
    },
    "Bachelor of Science in Nursing": {
        "1st Year": [
            { name: "Anatomy and Physiology", room: "NURS 101", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Biochemistry for Nursing", room: "NURS 102", professor: "Prof. Gregorio Y. Zara", category: "major", units: 3 },
            { name: "Theoretical Foundations of Nursing", room: "NURS 103", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Nursing Informatics", room: "NURS LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Health Assessment", room: "NURS LAB 102", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "Microbiology and Parasitology", room: "NURS LAB 103", professor: "Prof. Gregorio Y. Zara", category: "major", units: 3 },
            { name: "Nutrition and Dietetics", room: "NURS 104", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Pharmacology", room: "NURS 201", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Pathophysiology", room: "NURS 202", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "Care of Mother and Child 1", room: "NURS LAB 201", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Care of Adults 1", room: "NURS LAB 202", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Community Health Nursing 1", room: "NURS 203", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "Nursing Research 1", room: "NURS 204", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Nursing Skills Lab", room: "NURS LAB 203", professor: "Prof. Carmen Perez", category: "major", units: 2 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 }
        ],
        "3rd Year": [
            { name: "Care of Mother and Child 2", room: "NURS LAB 301", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Care of Adults 2", room: "NURS LAB 302", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Care of Older Persons", room: "NURS 301", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Mental Health Nursing", room: "NURS 302", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "Community Health Nursing 2", room: "NURS 303", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "Nursing Research 2", room: "NURS 304", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Pediatric Nursing", room: "NURS LAB 303", professor: "Prof. Carmen Perez", category: "major", units: 4 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 }
        ],
        "4th Year": [
            { name: "Critical Care Nursing", room: "NURS LAB 401", professor: "Prof. Carmen Perez", category: "major", units: 5 },
            { name: "Leadership and Management in Nursing", room: "NURS 401", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Disaster Nursing", room: "NURS 402", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Nursing Practicum (Hospital)", room: "HOSPITAL", professor: "Clinical Instructor", category: "practicum", units: 6 },
            { name: "Nursing Practicum (Community)", room: "COMMUNITY", professor: "Clinical Instructor", category: "practicum", units: 3 },
            { name: "NCLEX Review", room: "NURS 403", professor: "Prof. Carmen Perez", category: "review", units: 3 },
            { name: "Comprehensive Case Study", room: "NURS 404", professor: "Prof. Fe Del Mundo", category: "research", units: 3 }
        ]
    },
    "Bachelor of Elementary Education": {
        "1st Year": [
            { name: "Child and Adolescent Learners", room: "EDUC 101", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "The Teaching Profession", room: "EDUC 102", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Foundations of Special Education", room: "EDUC 103", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Facilitating Learner-Centered Teaching", room: "EDUC 104", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Building Inclusive Classrooms", room: "EDUC 105", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Educational Technology 1", room: "EDUC LAB 101", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Field Study 1 - Observation", room: "FIELD", professor: "Prof. Carmen Perez", category: "practicum", units: 2 },
            { name: "Mathematics in the Modern World", room: "RM 401", professor: "Prof. Jose Rizal", category: "ge", units: 3 },
            { name: "Purposive Communication", room: "RM 402", professor: "Prof. Maria Santos", category: "ge", units: 3 },
            { name: "Understanding the Self", room: "RM 403", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "PE 1 - Movement Enhancement", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 1 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Readings in Philippine History", room: "RM 408", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Art Appreciation", room: "RM 412", professor: "Prof. Carmen Perez", category: "ge", units: 3 }
        ],
        "2nd Year": [
            { name: "Curriculum Development", room: "EDUC 201", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Assessment of Learning 1", room: "EDUC 202", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Teaching Math in Elementary", room: "EDUC 203", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Teaching Science in Elementary", room: "EDUC 204", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Educational Technology 2", room: "EDUC LAB 201", professor: "Prof. James Dela Cruz", category: "major", units: 3 },
            { name: "Field Study 2 - Experiencing the Learning Environment", room: "FIELD", professor: "Prof. Carmen Perez", category: "practicum", units: 2 },
            { name: "Teaching Reading", room: "EDUC 205", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "The Contemporary World", room: "RM 407", professor: "Prof. Teodoro Agoncillo", category: "ge", units: 3 },
            { name: "Science, Technology and Society", room: "RM 415", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Ethics", room: "RM 416", professor: "Prof. Nick Joaquin", category: "ge", units: 3 },
            { name: "PE 2 - Rhythmic Activities", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "NSTP 2 - CWTS", room: "RM 405", professor: "Prof. Carmen Perez", category: "ge", units: 3 },
            { name: "Life and Works of Rizal", room: "RM 409", professor: "Prof. Jose Rizal", category: "ge", units: 3 }
        ],
        "3rd Year": [
            { name: "Teaching Filipino in Elementary", room: "EDUC 301", professor: "Prof. Virgilio Almario", category: "major", units: 3 },
            { name: "Teaching English in Elementary", room: "EDUC 302", professor: "Prof. Maria Santos", category: "major", units: 3 },
            { name: "Teaching Social Studies in Elementary", room: "EDUC 303", professor: "Prof. Teodoro Agoncillo", category: "major", units: 3 },
            { name: "Teaching Music, Arts, PE and Health", room: "EDUC 304", professor: "Prof. Francisca Aquino", category: "major", units: 3 },
            { name: "Assessment of Learning 2", room: "EDUC 305", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Edukasyon sa Pagpapakatao", room: "EDUC 306", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Action Research in Education", room: "EDUC 307", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "PE 3 - Team Sports", room: "GYM 1", professor: "Prof. Francisca Aquino", category: "ge", units: 2 },
            { name: "Filipino sa Iba't Ibang Disiplina", room: "RM 421", professor: "Prof. Virgilio Almario", category: "ge", units: 3 }
        ],
        "4th Year": [
            { name: "Practice Teaching - Internship", room: "ELEMENTARY SCHOOL", professor: "Cooperating Teacher", category: "practicum", units: 6 },
            { name: "Classroom Management", room: "EDUC 401", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "School Culture and Organization", room: "EDUC 402", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Capstone Education Research", room: "EDUC 403", professor: "Prof. Fe Del Mundo", category: "research", units: 3 },
            { name: "Special Topics in Education", room: "EDUC 404", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Education Leadership", room: "EDUC 405", professor: "Prof. Carmen Perez", category: "major", units: 3 },
            { name: "Comprehensive Final Demo", room: "EDUC LAB 401", professor: "Prof. Carmen Perez", category: "practicum", units: 2 }
        ]
    }
};

function getSubjectsForLevel(level, sublevel = null, strand = null, program = null, year = null) {
    if (level === 'juniorHigh') {
        return assignSchedulesToSubjects(highSchoolCurriculum[sublevel] || []);
    } else if (level === 'seniorHigh') {
        const gradeData = seniorHighStrandSubjects[strand]?.[sublevel];
        return assignSchedulesToSubjects(gradeData || []);
    } else if (level === 'college') {
        const programData = collegeCurriculum[program]?.[year];
        return assignSchedulesToSubjects(programData || []);
    }
    return [];
}

// Populate college program dropdown
function populateCollegeProgramDropdown() {
    const sel = document.getElementById('collegeProgramSelect');
    if (!sel) return;
    const previousValue = sel.value;
    const programs = Object.keys(collegeCurriculum).sort();
    let html = '<option value="">— Select Program —</option>';
    programs.forEach(name => {
        html += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
    });
    sel.innerHTML = html;
    if (previousValue && programs.includes(previousValue)) sel.value = previousValue;
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
    
    collegeProgramSelect.innerHTML = '<option value="">— Select Program —</option>';
    programs.forEach(program => {
        collegeProgramSelect.innerHTML += `<option value="${program}">${program}</option>`;
    });
}



window.highSchoolCurriculum = highSchoolCurriculum;
window.seniorHighStrandSubjects = seniorHighStrandSubjects;
window.collegeCurriculum = collegeCurriculum;
window.getSubjectsForLevel = getSubjectsForLevel;
window.populateCollegeProgramDropdown = populateCollegeProgramDropdown;