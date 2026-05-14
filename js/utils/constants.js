/* ============================================
   CONSTANTS & CONFIGURATION
   ============================================ */

// Application Configuration
const APP_CONFIG = {
    APP_NAME: 'Algorithmic Agenda Apparatus',
    APP_VERSION: '3.0',
    COMPANY: 'Novulution Tech.',
    DEV_ACCESS_CODE: '712189',
    
    STORAGE_KEYS: {
        USERS_DB: 'usersDB',
        NOTIFICATIONS_DB: 'notificationsDB',
        USER_SESSION: 'userSession',
        REMEMBERED_ID: 'rememberedId',
        REMEMBERED_PASSWORD: 'rememberedPassword',
        REMEMBERED_IS_ADMIN: 'rememberedIsAdmin',
        REMEMBER_ME_FLAG: 'rememberMeFlag',
        RESET_CODES: 'resetCodes'
    },
    
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    SCHEDULE_CHANGE_LIMIT: 50,
    
    USER_ROLES: {
        STUDENT: 'student',
        ADMIN: 'admin'
    },
    
    ACADEMIC_LEVELS: {
        JUNIOR_HIGH: 'juniorHigh',
        SENIOR_HIGH: 'seniorHigh',
        COLLEGE: 'college'
    }
};

// Term Distributions
const TERM_DISTRIBUTIONS = {
    'Semester': { periods: ['1st Semester', '2nd Semester'], sizes: [7, 7] },
    'Tri-Semester': { periods: ['1st Tri-Semester', '2nd Tri-Semester', '3rd Tri-Semester'], sizes: [5, 5, 4] },
    'Quarter': { periods: ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'], sizes: [4, 4, 3, 3] },
    'Block Plan': { periods: ['Block A', 'Block B'], sizes: [7, 7] }
};

// Schedule Time Slots
const SCHEDULE_TIME_SLOTS = [
    "Monday 8:00 AM - 10:00 AM", "Monday 10:00 AM - 12:00 PM", "Monday 1:00 PM - 3:00 PM", "Monday 3:00 PM - 5:00 PM",
    "Tuesday 8:00 AM - 10:00 AM", "Tuesday 10:00 AM - 12:00 PM", "Tuesday 1:00 PM - 3:00 PM", "Tuesday 3:00 PM - 5:00 PM",
    "Wednesday 8:00 AM - 10:00 AM", "Wednesday 10:00 AM - 12:00 PM", "Wednesday 1:00 PM - 3:00 PM", "Wednesday 3:00 PM - 5:00 PM",
    "Thursday 8:00 AM - 10:00 AM", "Thursday 10:00 AM - 12:00 PM", "Thursday 1:00 PM - 3:00 PM", "Thursday 3:00 PM - 5:00 PM",
    "Friday 8:00 AM - 10:00 AM", "Friday 10:00 AM - 12:00 PM", "Friday 1:00 PM - 3:00 PM", "Friday 3:00 PM - 5:00 PM"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "3:00 PM - 5:00 PM"];

// Tuition and Fees
const FEES = {
    TUITION: 18000.00,
    MISCELLANEOUS: 3500.00,
    TOTAL: 23500.00,
    MIN_DOWN_PAYMENT: 5000.00
};

window.APP_CONFIG = APP_CONFIG;
window.TERM_DISTRIBUTIONS = TERM_DISTRIBUTIONS;
window.SCHEDULE_TIME_SLOTS = SCHEDULE_TIME_SLOTS;
window.DAYS_OF_WEEK = DAYS_OF_WEEK;
window.TIME_SLOTS = TIME_SLOTS;
window.FEES = FEES;