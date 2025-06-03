// Main Application Controller
// This file initializes and coordinates all modules

// Global application state
window.App = {
    initialized: false,
    currentPage: 'home',
    
    // Initialize the application
    init: function() {
        if (this.initialized) return;
        
        console.log('Initializing BINotes Application...');
        
        try {
            // Initialize core modules
            this.initializeAuth();
            this.initializeNotes();
            this.initializeCart();
            this.initializeModals();
            this.initializeNavigation();
            this.initializeEventListeners();
            
            // Initialize page-specific modules
            if (typeof Security !== 'undefined') {
                Security.init();
            }
            
            // Load initial page
            this.loadInitialPage();
            
            this.initialized = true;
            eventBus.emit('app:ready');
            console.log('BINotes Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showNotification('Application failed to initialize. Please refresh the page.', 'error');
        }
    },
    
    // Initialize authentication module
    initializeAuth: function() {
        if (typeof Auth !== 'undefined') {
            Auth.init();
        }
    },
    
    // Initialize notes module
    initializeNotes: function() {
        if (typeof Notes !== 'undefined') {
            Notes.init();
        }
    },
    
    // Initialize cart module
    initializeCart: function() {
        if (typeof Cart !== 'undefined') {
            Cart.init();
        }
    },
    
    // Initialize modal system
    initializeModals: function() {
        // Load modals HTML if not already present
        this.loadModalsHTML();
        
        // Set up form handlers
        this.setupFormHandlers();
        
        // Set up modal event listeners
        this.setupModalEventListeners();
    },
    
    // Load modals HTML content
    loadModalsHTML: function() {
        const modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) {
            console.warn('Modals container not found');
            return;
        }
        
        // In a real application, you would fetch this from modals.html
        // For now, we'll assume the modals are already in the main HTML
        if (modalsContainer.children.length === 0) {
            console.log('Loading modal HTML content...');
            // You could fetch and inject modal HTML here
        }
    },
    
    // Set up form handlers
    setupFormHandlers: function() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Sell form
        const sellForm = document.getElementById('sellForm');
        if (sellForm && typeof Notes !== 'undefined') {
            sellForm.addEventListener('submit', Notes.handleSell);
        }
        
        // Edit profile form
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfile);
        }
        
        // Change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', handleChangePassword);
        }
    },
    
    // Set up modal event listeners
    setupModalEventListeners: function() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    const modalId = modal.id;
                    closeModal(modalId);
                    eventBus.emit('modal:closed', modalId);
                }
            });
        });
        
        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const activeModal = document.querySelector('.modal[style*="block"]');
                if (activeModal) {
                    const modalId = activeModal.id;
                    closeModal(modalId);
                    eventBus.emit('modal:closed', modalId);
                }
            }
        });
    },
    
    // Initialize navigation
    initializeNavigation: function() {
        // Set up page navigation
        this.setupPageNavigation();
        
        // Set up search functionality
        this.setupSearch();
        
        // Set up responsive navigation
        this.setupResponsiveNav();
    },
    
    // Set up page navigation
    setupPageNavigation: function() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || 'home';
            this.navigateToPage(page, false);
        });
        
        // Set initial page state
        const initialPage = this.getPageFromURL();
        if (initialPage !== 'home') {
            history.replaceState({ page: initialPage }, '', `#${initialPage}`);
        }
    },
    
    // Set up search functionality
    setupSearch: function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && typeof Notes !== 'undefined') {
            // Debounced search
            const debouncedSearch = debounce(() => {
                Notes.search();
            }, 300);
            
            searchInput.addEventListener('input', debouncedSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    Notes.search();
                }
            });
        }
    },
    
    // Set up responsive navigation
    setupResponsiveNav: function() {
        // Mobile menu toggle if needed
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('show');
            });
        }
    },
    
    // Initialize global event listeners
    initializeEventListeners: function() {
        // File upload handling
        this.setupFileUpload();
        
        // Notification click handlers
        this.setupNotificationHandlers();
        
        // Global error handling
        this.setupErrorHandling();
        
        // Online/offline detection
        this.setupConnectionHandling();
    },
    
    // Set up file upload functionality
    setupFileUpload: function() {
        const fileInput = document.getElementById('noteFile');
        const uploadArea = document.querySelector('.file-upload');
        
        if (fileInput && uploadArea) {
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
            
            // File input change handler
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Validate file
                if (!isAllowedFileType(file.name)) {
                    showNotification('Only PDF, DOC, and DOCX files are allowed', 'error');
                    fileInput.value = '';
                    return;
                }
                
                if (file.size > CONFIG.MAX_FILE_SIZE) {
                    showNotification(`File size must be less than ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`, 'error');
                    fileInput.value = '';
                    return;
                }
                
                // Update upload status
                const uploadStatus = document.getElementById('uploadStatus');
                if (uploadStatus) {
                    uploadStatus.innerHTML = `
                        <div>✅ ${sanitizeHTML(file.name)}</div>
                        <p>File uploaded successfully (${formatFileSize(file.size)})</p>
                    `;
                    uploadArea.classList.add('has-file');
                }
            });
        }
    },
    
    // Set up notification handlers
    setupNotificationHandlers: function() {
        // Click to dismiss notifications
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification')) {
                e.target.closest('.notification').classList.remove('show');
            }
        });
    },
    
    // Set up global error handling
    setupErrorHandling: function() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            if (CONFIG.DEBUG) {
                showNotification(`Error: ${e.error.message}`, 'error');
            } else {
                showNotification('An unexpected error occurred', 'error');
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            
            if (CONFIG.DEBUG) {
                showNotification(`Promise rejection: ${e.reason}`, 'error');
            }
        });
    },
    
    // Set up connection handling
    setupConnectionHandling: function() {
        window.addEventListener('online', () => {
            showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            showNotification('Connection lost. Some features may not work.', 'error');
        });
    },
    
    // Navigate to a specific page
    navigateToPage: function(pageId, updateHistory = true) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Update URL if needed
            if (updateHistory) {
                history.pushState({ page: pageId }, '', `#${pageId}`);
            }
            
            // Initialize page-specific functionality
            this.initializePage(pageId);
            
            eventBus.emit('page:changed', pageId);
        } else {
            console.warn(`Page '${pageId}' not found`);
        }
    },
    
    // Initialize page-specific functionality
    initializePage: function(pageId) {
        switch (pageId) {
            case 'home':
                if (typeof Notes !== 'undefined') {
                    Notes.render();
                }
                break;
                
            case 'profile':
                if (!Auth.isLoggedIn()) {
                    showNotification('Please login first', 'error');
                    showModal('loginModal');
                    this.navigateToPage('home');
                    return;
                }
                this.initializeProfile();
                break;
                
            case 'bucket':
                if (!Auth.isLoggedIn()) {
                    showNotification('Please login first', 'error');
                    showModal('loginModal');
                    this.navigateToPage('home');
                    return;
                }
                if (typeof Cart !== 'undefined') {
                    Cart.render();
                }
                break;
                
            case 'purchased':
                if (!Auth.isLoggedIn()) {
                    showNotification('Please login first', 'error');
                    showModal('loginModal');
                    this.navigateToPage('home');
                    return;
                }
                this.renderPurchasedNotes();
                break;
                
            case 'sell':
                if (!Auth.isLoggedIn()) {
                    showNotification('Please login to sell notes', 'error');
                    showModal('loginModal');
                    this.navigateToPage('home');
                    return;
                }
                break;
        }
    },
    
    // Initialize profile page
    initializeProfile: function() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        const elements = {
            avatar: document.getElementById('profileAvatar'),
            name: document.getElementById('profileName'),
            email: document.getElementById('profileEmail'),
            institution: document.getElementById('profileInstitution'),
            purchasedCount: document.getElementById('purchasedCount'),
            soldCount: document.getElementById('soldCount'),
            totalEarnings: document.getElementById('totalEarnings')
        };
        
        if (elements.avatar) {
            const initials = getInitials(currentUser.firstName, currentUser.lastName);
            elements.avatar.textContent = initials;
        }
        
        if (elements.name) {
            elements.name.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
        
        if (elements.email) {
            elements.email.textContent = currentUser.email;
        }
        
        if (elements.institution) {
            elements.institution.textContent = `Student of ${currentUser.major} in ${currentUser.institution}`;
        }
        
        // Get user statistics (in a real app, this would be an API call)
        const purchasedNotes = currentUser.purchasedNotes || [];
        const soldNotes = currentUser.soldNotes || [];
        const earnings = currentUser.earnings || 0;
        
        if (elements.purchasedCount) elements.purchasedCount.textContent = purchasedNotes.length;
        if (elements.soldCount) elements.soldCount.textContent = soldNotes.length;
        if (elements.totalEarnings) elements.totalEarnings.textContent = formatCurrency(earnings);
    },
    
    // Render purchased notes
    renderPurchasedNotes: function() {
        const container = document.getElementById('purchasedNotes');
        if (!container) return;
        
        const currentUser = Auth.getCurrentUser();
        const purchasedNotes = currentUser?.purchasedNotes || [];
        
        if (purchasedNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No purchased notes</h3>
                    <p>You haven't purchased any notes yet.</p>
                    <button class="btn btn-primary" onclick="App.navigateToPage('home')">Browse Notes</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = purchasedNotes.map(note => `
            <div class="purchased-note">
                <div class="purchased-note-image">${note.icon || '📄'}</div>
                <div class="purchased-note-details">
                    <h4>${sanitizeHTML(note.title)}</h4>
                    <p>by ${sanitizeHTML(note.author)}</p>
                    <div class="purchased-date">Purchased on ${formatDate(note.purchaseDate)}</div>
                    <div class="note-price">${formatCurrency(note.price)}</div>
                </div>
                <button class="download-btn" onclick="this.openSecureViewer(${note.id})">View Document</button>
            </div>
        `).join('');
    },
    
    // Open secure document viewer
    openSecureViewer: function(noteId) {
        if (typeof Security !== 'undefined' && typeof Security.openSecureViewer === 'function') {
            Security.openSecureViewer(noteId);
        } else {
            // Fallback for basic viewing
            showNotification('Document viewer is loading...', 'info');
            // In a real app, this would open a secure document viewer
        }
    },
    
    // Get current page from URL
    getPageFromURL: function() {
        const hash = window.location.hash.substring(1);
        return hash || 'home';
    },
    
    // Load initial page based on URL
    loadInitialPage: function() {
        const initialPage = this.getPageFromURL();
        this.navigateToPage(initialPage, false);
    },
    
    // Show edit profile modal with current data
    showEditProfileModal: function() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        const form = document.getElementById('editProfileForm');
        if (!form) return;
        
        // Populate form with current data
        const fields = ['firstName', 'lastName', 'email', 'institution', 'major', 'description'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && currentUser[field]) {
                input.value = currentUser[field];
            }
        });
        
        showModal('editProfileModal');
    },
    
    // Utility method to check if user can access page
    canAccessPage: function(pageId) {
        const protectedPages = ['profile', 'bucket', 'purchased', 'sell'];
        if (protectedPages.includes(pageId)) {
            return Auth.isLoggedIn();
        }
        return true;
    },
    
    // Get application state
    getState: function() {
        return {
            initialized: this.initialized,
            currentPage: this.currentPage,
            user: Auth.getCurrentUser(),
            cartItems: typeof Cart !== 'undefined' ? Cart.getItems() : []
        };
    },
    
    // Debug information
    debug: function() {
        console.log('BINotes Debug Information:');
        console.log('- Application State:', this.getState());
        console.log('- Config:', CONFIG);
        console.log('- Available Modules:', {
            Auth: typeof Auth !== 'undefined',
            Notes: typeof Notes !== 'undefined',
            Cart: typeof Cart !== 'undefined',
            Payment: typeof Payment !== 'undefined',
            Security: typeof Security !== 'undefined'
        });
        console.log('- Event Bus Listeners:', eventBus.events);
    }
};

// Global functions for HTML onclick handlers
window.showPage = (pageId) => App.navigateToPage(pageId);
window.showModal = showModal;
window.closeModal = closeModal;
window.showEditProfileModal = () => App.showEditProfileModal();

// Modal functions (if not defined elsewhere)
if (typeof showModal === 'undefined') {
    window.showModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            eventBus.emit('modal:opened', modalId);
        }
    };
}

if (typeof closeModal === 'undefined') {
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            eventBus.emit('modal:closed', modalId);
        }
    };
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing BINotes...');
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        App.init();
    }, 100);
});

// Expose App globally for debugging
window.BINotes = App;

// Add some helpful global utilities
window.BINotes.utils = {
    formatCurrency,
    formatDate,
    sanitizeHTML,
    debounce,
    throttle,
    Storage,
    Browser
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}