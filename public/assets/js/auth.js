/**
 * AuthManager - Handles user authentication using localStorage simulation
 * Provides login, logout, session validation, and route protection
 */
class AuthManager {
    constructor() {
        this.tokenKey = 'ticketapp_session';
        this.maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }

    /**
     * Authenticate user with credentials and store session token
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.username - Username or email
     * @param {string} credentials.password - User password
     * @returns {Promise<Object>} Authentication result
     */
    async login(credentials) {
        try {
            // Validate input credentials
            if (!credentials || !credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }

            // Simulate authentication validation
            // In a real app, this would be an API call
            const isValidCredentials = this.validateCredentials(credentials);
            
            if (!isValidCredentials) {
                throw new Error('Invalid username or password');
            }

            // Create session token with user data
            const sessionData = {
                token: this.generateToken(),
                user: {
                    id: this.generateUserId(credentials.username),
                    username: credentials.username,
                    email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@example.com`
                },
                expiresAt: Date.now() + this.maxAge,
                createdAt: Date.now()
            };

            // Store session in localStorage
            localStorage.setItem(this.tokenKey, JSON.stringify(sessionData));

            return {
                success: true,
                user: sessionData.user,
                message: 'Login successful'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Login failed'
            };
        }
    }

    /**
     * Clear user session and logout
     * @returns {Object} Logout result
     */
    logout() {
        try {
            // Remove session token from localStorage
            localStorage.removeItem(this.tokenKey);
            
            // Clear any other auth-related data
            localStorage.removeItem('user_preferences');
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Logout failed'
            };
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        try {
            const sessionData = localStorage.getItem(this.tokenKey);
            
            if (!sessionData) {
                return false;
            }

            const session = JSON.parse(sessionData);
            
            // Check if session has required properties
            if (!session.token || !session.expiresAt || !session.user) {
                return false;
            }

            // Check if session is expired
            if (Date.now() > session.expiresAt) {
                // Clean up expired session
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            // If there's any error parsing session data, consider not authenticated
            this.logout();
            return false;
        }
    }

    /**
     * Redirect to login page if user is not authenticated
     * @param {string} redirectUrl - URL to redirect to after login (optional)
     * @param {string} message - Message to display on login page (optional)
     */
    redirectIfNotAuth(redirectUrl = null, message = null) {
        if (!this.isAuthenticated()) {
            // Store redirect URL for after login
            if (redirectUrl) {
                sessionStorage.setItem('auth_redirect', redirectUrl);
            }
            
            // Store message to display
            if (message) {
                sessionStorage.setItem('auth_message', message);
            }
            
            // Redirect to login page
            window.location.href = '/auth/login';
            return true;
        }
        return false;
    }

    /**
     * Get current user session data
     * @returns {Object|null} User session data or null if not authenticated
     */
    getSession() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const sessionData = localStorage.getItem(this.tokenKey);
            return JSON.parse(sessionData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get current user data
     * @returns {Object|null} User data or null if not authenticated
     */
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    }

    /**
     * Refresh session expiration time
     * @returns {boolean} Success status
     */
    refreshSession() {
        try {
            const session = this.getSession();
            if (session) {
                session.expiresAt = Date.now() + this.maxAge;
                localStorage.setItem(this.tokenKey, JSON.stringify(session));
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Private helper methods

    /**
     * Validate user credentials (simulation)
     * @param {Object} credentials - User credentials
     * @returns {boolean} Validation result
     */
    validateCredentials(credentials) {
        // Simulate credential validation
        // In a real app, this would validate against a backend
        const { username, password } = credentials;
        
        // Basic validation rules for demo
        if (username.length < 3 || password.length < 6) {
            return false;
        }
        
        // Simulate some valid demo users
        const validUsers = [
            { username: 'demo', password: 'password' },
            { username: 'admin', password: 'admin123' },
            { username: 'user@example.com', password: 'userpass' }
        ];
        
        return validUsers.some(user => 
            user.username === username && user.password === password
        ) || (username.includes('@') && password.length >= 6); // Allow any email with 6+ char password
    }

    /**
     * Generate a simulated authentication token
     * @returns {string} Generated token
     */
    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    /**
     * Generate a user ID based on username
     * @param {string} username - Username
     * @returns {string} Generated user ID
     */
    generateUserId(username) {
        // Simple hash-like ID generation for demo
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            const char = username.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
/**
 *
 AuthFormValidator - Handles client-side form validation for authentication
 */
class AuthFormValidator {
    constructor() {
        this.errors = {};
    }

    /**
     * Validate login form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result with errors
     */
    validateLoginForm(formData) {
        this.errors = {};

        // Username validation
        if (!formData.username || formData.username.trim() === '') {
            this.errors.username = 'Username or email is required';
        } else if (formData.username.trim().length < 3) {
            this.errors.username = 'Username must be at least 3 characters long';
        }

        // Password validation
        if (!formData.password || formData.password === '') {
            this.errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            this.errors.password = 'Password must be at least 6 characters long';
        }

        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    /**
     * Validate signup form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result with errors
     */
    validateSignupForm(formData) {
        this.errors = {};

        // Username validation
        if (!formData.username || formData.username.trim() === '') {
            this.errors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
            this.errors.username = 'Username must be at least 3 characters long';
        } else if (formData.username.trim().length > 20) {
            this.errors.username = 'Username must be less than 20 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
            this.errors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email || formData.email.trim() === '') {
            this.errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email.trim())) {
            this.errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password || formData.password === '') {
            this.errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            this.errors.password = 'Password must be at least 6 characters long';
        } else if (formData.password.length > 50) {
            this.errors.password = 'Password must be less than 50 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword || formData.confirmPassword === '') {
            this.errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            this.errors.confirmPassword = 'Passwords do not match';
        }

        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get all validation errors
     * @returns {Object} Current validation errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Clear all validation errors
     */
    clearErrors() {
        this.errors = {};
    }
}

/**
 * AuthErrorHandler - Handles authentication error display and user feedback
 */
class AuthErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.fieldErrors = {};
    }

    /**
     * Initialize error handler with DOM elements
     */
    init() {
        // Create or find error container
        this.errorContainer = document.getElementById('auth-errors') || this.createErrorContainer();
    }

    /**
     * Display authentication errors to user
     * @param {Object} errors - Errors to display
     * @param {string} type - Type of error (field, general, network)
     */
    displayErrors(errors, type = 'field') {
        this.clearErrors();

        if (type === 'field') {
            this.displayFieldErrors(errors);
        } else if (type === 'general') {
            this.displayGeneralError(errors.message || 'An error occurred');
        } else if (type === 'network') {
            this.displayNetworkError(errors.message || 'Network error occurred');
        }
    }

    /**
     * Display field-specific validation errors
     * @param {Object} errors - Field errors object
     */
    displayFieldErrors(errors) {
        Object.keys(errors).forEach(fieldName => {
            const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
            const errorMessage = errors[fieldName];

            if (field) {
                // Add error class to field
                field.classList.add('error', 'border-red-500');
                field.setAttribute('aria-invalid', 'true');

                // Create or update error message element
                const errorElement = this.createFieldErrorElement(fieldName, errorMessage);
                
                // Insert error message after the field
                if (field.nextElementSibling && field.nextElementSibling.classList.contains('field-error')) {
                    field.nextElementSibling.replaceWith(errorElement);
                } else {
                    field.parentNode.insertBefore(errorElement, field.nextSibling);
                }

                this.fieldErrors[fieldName] = errorElement;
            }
        });
    }

    /**
     * Display general authentication error
     * @param {string} message - Error message
     */
    displayGeneralError(message) {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span class="block sm:inline">${this.escapeHtml(message)}</span>
                </div>
            `;
            this.errorContainer.style.display = 'block';
        }
    }

    /**
     * Display network error with retry option
     * @param {string} message - Error message
     */
    displayNetworkError(message) {
        const networkMessage = message || 'Unable to connect. Please check your internet connection and try again.';
        
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
                    <div class="flex items-center">
                        <span class="block sm:inline">${this.escapeHtml(networkMessage)}</span>
                        <button type="button" class="ml-4 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" onclick="location.reload()">
                            Retry
                        </button>
                    </div>
                </div>
            `;
            this.errorContainer.style.display = 'block';
        }
    }

    /**
     * Clear all displayed errors
     */
    clearErrors() {
        // Clear general errors
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
            this.errorContainer.style.display = 'none';
        }

        // Clear field errors
        Object.keys(this.fieldErrors).forEach(fieldName => {
            const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.remove('error', 'border-red-500');
                field.removeAttribute('aria-invalid');
            }

            if (this.fieldErrors[fieldName] && this.fieldErrors[fieldName].parentNode) {
                this.fieldErrors[fieldName].parentNode.removeChild(this.fieldErrors[fieldName]);
            }
        });

        this.fieldErrors = {};
    }

    /**
     * Create error container element
     * @returns {HTMLElement} Error container element
     */
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'auth-errors';
        container.className = 'auth-errors';
        container.style.display = 'none';
        
        // Insert at the top of the form or body
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(container, form.firstChild);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }
        
        return container;
    }

    /**
     * Create field error element
     * @param {string} fieldName - Field name
     * @param {string} message - Error message
     * @returns {HTMLElement} Error element
     */
    createFieldErrorElement(fieldName, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-500 text-sm mt-1';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        errorElement.textContent = message;
        return errorElement;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

/**
 * AuthFormHandler - Handles form submission and integration with AuthManager
 */
class AuthFormHandler {
    constructor() {
        this.authManager = new AuthManager();
        this.validator = new AuthFormValidator();
        this.errorHandler = new AuthErrorHandler();
        this.isSubmitting = false;
    }

    /**
     * Initialize form handler
     */
    init() {
        this.errorHandler.init();
        this.bindEvents();
    }

    /**
     * Bind form events
     */
    bindEvents() {
        // Handle login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        // Handle signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignupSubmit(e));
        }

        // Clear errors on input
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"], input[type="email"], input[type="password"]')) {
                this.clearFieldError(e.target);
            }
        });
    }

    /**
     * Handle login form submission
     * @param {Event} event - Form submit event
     */
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        const form = event.target;
        const formData = new FormData(form);
        const credentials = {
            username: formData.get('username')?.trim(),
            password: formData.get('password')
        };

        // Validate form
        const validation = this.validator.validateLoginForm(credentials);
        if (!validation.isValid) {
            this.errorHandler.displayErrors(validation.errors, 'field');
            return;
        }

        this.isSubmitting = true;
        this.setSubmitButtonState(form, true);

        try {
            const result = await this.authManager.login(credentials);
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.errorHandler.displayErrors({ message: result.error }, 'general');
            }
        } catch (error) {
            this.errorHandler.displayErrors({ message: 'Network error. Please try again.' }, 'network');
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(form, false);
        }
    }

    /**
     * Handle signup form submission
     * @param {Event} event - Form submit event
     */
    async handleSignupSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username')?.trim(),
            email: formData.get('email')?.trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validate form
        const validation = this.validator.validateSignupForm(userData);
        if (!validation.isValid) {
            this.errorHandler.displayErrors(validation.errors, 'field');
            return;
        }

        this.isSubmitting = true;
        this.setSubmitButtonState(form, true);

        try {
            // For signup, we'll use the login method with the new credentials
            const result = await this.authManager.login({
                username: userData.email,
                password: userData.password
            });
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.errorHandler.displayErrors({ message: 'Registration failed. Please try again.' }, 'general');
            }
        } catch (error) {
            this.errorHandler.displayErrors({ message: 'Network error. Please try again.' }, 'network');
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(form, false);
        }
    }

    /**
     * Handle successful login/signup
     * @param {Object} result - Login result
     */
    handleLoginSuccess(result) {
        // Check for redirect URL
        const redirectUrl = sessionStorage.getItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('auth_message');

        // Redirect to dashboard or specified URL
        window.location.href = redirectUrl || '/dashboard';
    }

    /**
     * Clear error for specific field
     * @param {HTMLElement} field - Input field element
     */
    clearFieldError(field) {
        field.classList.remove('error', 'border-red-500');
        field.removeAttribute('aria-invalid');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Set submit button loading state
     * @param {HTMLFormElement} form - Form element
     * @param {boolean} isLoading - Loading state
     */
    setSubmitButtonState(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.textContent = 'Please wait...';
                submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Submit';
                submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const authFormHandler = new AuthFormHandler();
        authFormHandler.init();
    });
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthManager,
        AuthFormValidator,
        AuthErrorHandler,
        AuthFormHandler
    };
}