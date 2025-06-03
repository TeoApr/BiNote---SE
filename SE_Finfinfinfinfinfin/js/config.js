// Application Configuration
const CONFIG = {
    // App Settings
    APP_NAME: 'BINotes',
    VERSION: '1.0.0',
    
    // API Settings (if needed)
    API_BASE_URL: '',
    
    // Payment Settings
    ADMIN_FEE: 1500,
    TAX_RATE: 0.05,
    
    // Timer Settings
    CHECKOUT_TIMER: 30 * 60, // 30 minutes in seconds
    VIEWING_TIMER: 15 * 60,  // 15 minutes in seconds
    PREVIEW_TIMER: 5 * 60,   // 5 minutes in seconds
    QRIS_TIMER: 10 * 60,     // 10 minutes in seconds
    
    // Preview Settings
    MAX_PREVIEW_PAGES: 3,
    
    // Security Settings
    MAX_BLUR_COUNT: 3,
    SECURITY_LOG_ENABLED: true,
    
    // File Upload Settings
    ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx'],
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    
    // UI Settings
    NOTIFICATION_DURATION: 3000,
    ANIMATION_DURATION: 300,
    
    // Subjects
    SUBJECTS: [
        'Computer Science',
        'Biology',
        'Engineering',
        'Mathematics',
        'Physics',
        'Chemistry'
    ],
    
    // Currency
    CURRENCY: {
        CODE: 'IDR',
        SYMBOL: 'Rp',
        LOCALE: 'id-ID'
    }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}