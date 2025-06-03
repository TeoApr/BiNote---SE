// Authentication Module - js/auth.js

// Global variables for authentication
let currentUser = null;

// Authentication functions
const Auth = {
    // Login user
    login: function(email, password) {
        console.log('Auth.login called with:', email);
        
        const user = DataService.authenticateUser(email, password);
        console.log('DataService.authenticateUser result:', user);
        
        if (user) {
            currentUser = { ...user, id: user.id || generateUserId() };
            
            // Load user data from localStorage if exists
            const savedUserData = Storage.get(`user_${currentUser.email}`);
            if (savedUserData) {
                currentUser = { ...currentUser, ...savedUserData };
            }
            
            this.updateNavigation();
            showNotification('Login successful!');
            if (typeof eventBus !== 'undefined') {
                eventBus.emit('user:login', currentUser);
            }
            return { success: true, user: currentUser };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    // Register new user
    register: function(userData) {
        console.log('Auth.register called with:', userData.email);
        
        // Validate input
        const validation = this.validateRegistrationData(userData);
        if (!validation.isValid) {
            return { success: false, message: validation.message };
        }

        // Check if email already exists
        const existingUser = DataService.getUserByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: generateUserId(),
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            institution: userData.institution,
            major: userData.major,
            phone: userData.phone,
            birthDate: userData.birthDate,
            description: userData.description || '',
            purchasedNotes: [],
            soldNotes: [],
            earnings: 0,
            joinDate: new Date().toISOString()
        };

        // Add to sample users (in real app, this would be API call)
        if (typeof sampleUsers !== 'undefined') {
            sampleUsers.push(newUser);
        }
        currentUser = newUser;

        // Save to localStorage
        this.saveUserData(currentUser);

        this.updateNavigation();
        showNotification('Registration successful! Welcome to BINotes!');
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('user:register', currentUser);
        }
        return { success: true, user: currentUser };
    },

    // Logout user
    logout: function() {
        const wasLoggedIn = !!currentUser;
        currentUser = null;
        this.updateNavigation();
        
        if (wasLoggedIn) {
            showNotification('Logged out successfully');
            if (typeof eventBus !== 'undefined') {
                eventBus.emit('user:logout');
            }
        }
    },

    // Update navigation based on login status
    updateNavigation: function() {
        const navActions = document.getElementById('navActions');
        const userMenu = document.getElementById('userMenu');

        if (currentUser) {
            if (navActions) navActions.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';

            const initials = getInitials(currentUser.firstName, currentUser.lastName);
            const userInitialsEl = document.getElementById('userInitials');
            if (userInitialsEl) {
                userInitialsEl.textContent = initials;
            }
        } else {
            if (navActions) navActions.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    },

    // Validate registration data
    validateRegistrationData: function(data) {
        // Required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'institution', 'major', 'phone', 'birthDate'];
        
        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return {
                    isValid: false,
                    message: `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
                };
            }
        }

        // Email validation
        if (!isValidEmail(data.email)) {
            return {
                isValid: false,
                message: 'Please enter a valid email address'
            };
        }

        // Password validation
        if (data.password.length < 6) {
            return {
                isValid: false,
                message: 'Password must be at least 6 characters long'
            };
        }

        // Password confirmation
        if (data.password !== data.confirmPassword) {
            return {
                isValid: false,
                message: 'Passwords do not match'
            };
        }

        // Phone validation
        if (!isValidPhoneNumber(data.phone)) {
            return {
                isValid: false,
                message: 'Please enter a valid Indonesian phone number'
            };
        }

        // Age validation (must be at least 13 years old)
        const birthDate = new Date(data.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            return {
                isValid: false,
                message: 'You must be at least 13 years old to register'
            };
        }

        return { isValid: true };
    },

    // Save user data to localStorage
    saveUserData: function(user) {
        if (typeof Storage !== 'undefined') {
            Storage.set(`user_${user.email}`, {
                ...user,
                lastLogin: new Date().toISOString()
            });
        }
    },

    // Get current user
    getCurrentUser: function() {
        return currentUser;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return !!currentUser;
    },

    // Update user profile
    updateProfile: function(profileData) {
        if (!currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        // Validate profile data
        const requiredFields = ['firstName', 'lastName', 'email', 'institution', 'major'];
        
        for (let field of requiredFields) {
            if (!profileData[field] || profileData[field].trim() === '') {
                return {
                    success: false,
                    message: `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
                };
            }
        }

        if (!isValidEmail(profileData.email)) {
            return {
                success: false,
                message: 'Please enter a valid email address'
            };
        }

        // Update current user
        Object.assign(currentUser, profileData);

        // Save to localStorage
        this.saveUserData(currentUser);

        showNotification('Profile updated successfully!');
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('user:profileUpdated', currentUser);
        }
        return { success: true, user: currentUser };
    },

    // Change password
    changePassword: function(currentPassword, newPassword, confirmNewPassword) {
        if (!currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        if (currentPassword !== currentUser.password) {
            return { success: false, message: 'Current password is incorrect' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'New password must be at least 6 characters long' };
        }

        if (newPassword !== confirmNewPassword) {
            return { success: false, message: 'New passwords do not match' };
        }

        // Update password
        currentUser.password = newPassword;

        // Save to localStorage
        this.saveUserData(currentUser);

        showNotification('Password changed successfully!');
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('user:passwordChanged');
        }
        return { success: true };
    },

    // Toggle user dropdown
    toggleUserDropdown: function() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    },

    // Initialize authentication on page load
    init: function() {
        console.log('Initializing Auth module...');
        
        // Try to restore user session from localStorage
        this.updateNavigation();

        // Set up form event listeners
        this.setupFormHandlers();

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById('userDropdown');
            const userMenu = document.getElementById('userMenu');

            if (userMenu && !userMenu.contains(event.target)) {
                dropdown?.classList.remove('show');
            }
        });
        
        console.log('Auth module initialized successfully');
    },

    // Setup form event handlers
    setupFormHandlers: function() {
        console.log('Setting up form handlers...');
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('Login form handler attached');
        } else {
            console.warn('Login form not found');
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
            console.log('Register form handler attached');
        } else {
            console.warn('Register form not found');
        }

        // Edit profile form (if exists)
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfile);
            console.log('Edit profile form handler attached');
        }

        // Change password form (if exists)
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', handleChangePassword);
            console.log('Change password form handler attached');
        }
    }
};

// Form handlers
function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    console.log('Login attempt:', email);

    // Check if required functions exist
    if (typeof DataService === 'undefined') {
        console.error('DataService not found');
        showNotification('System error: DataService not available', 'error');
        return;
    }

    const result = Auth.login(email, password);
    if (result.success) {
        console.log('Login successful');
        event.target.reset();
        closeModal('loginModal');
    } else {
        console.log('Login failed:', result.message);
        showNotification(result.message, 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    console.log('Register form submitted');
    
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData);

    console.log('Registration attempt:', userData.email);

    const result = Auth.register(userData);
    if (result.success) {
        console.log('Registration successful');
        event.target.reset();
        closeModal('registerModal');
    } else {
        console.log('Registration failed:', result.message);
        showNotification(result.message, 'error');
    }
}

function handleEditProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData);

    const result = Auth.updateProfile(profileData);
    if (result.success) {
        closeModal('editProfileModal');
        // Refresh profile display
        if (typeof initializeProfile === 'function') {
            initializeProfile();
        }
    } else {
        showNotification(result.message, 'error');
    }
}

function handleChangePassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { currentPassword, newPassword, confirmNewPassword } = Object.fromEntries(formData);

    const result = Auth.changePassword(currentPassword, newPassword, confirmNewPassword);
    if (result.success) {
        closeModal('changePasswordModal');
        event.target.reset();
    } else {
        showNotification(result.message, 'error');
    }
}

// Initialize edit profile modal with current user data
function showEditProfileModal() {
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
}

// Global functions for HTML onclick handlers
window.logout = () => Auth.logout();
window.toggleUserDropdown = () => Auth.toggleUserDropdown();
window.showEditProfileModal = showEditProfileModal;

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Auth...');
    // Small delay to ensure other modules are loaded
    setTimeout(() => {
        Auth.init();
        console.log('✅ Auth.js initialized successfully');
    }, 100);
});

// Make Auth available globally
window.Auth = Auth;

console.log('✅ Auth.js loaded successfully');

// Add debugging function
window.debugAuth = function() {
    console.log('Auth Debug Info:');
    console.log('- Current User:', currentUser);
    console.log('- DataService available:', typeof DataService !== 'undefined');
    console.log('- Storage available:', typeof Storage !== 'undefined');
    console.log('- EventBus available:', typeof eventBus !== 'undefined');
    console.log('- Modal functions available:', {
        showModal: typeof showModal !== 'undefined',
        closeModal: typeof closeModal !== 'undefined',
        showNotification: typeof showNotification !== 'undefined'
    });
    console.log('- Sample users:', typeof sampleUsers !== 'undefined' ? sampleUsers : 'Not available');
};