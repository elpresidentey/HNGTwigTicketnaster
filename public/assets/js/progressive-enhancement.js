/**
 * Progressive Enhancement - Handles graceful degradation and error boundaries
 * Provides fallbacks for JavaScript failures and ensures core functionality works without JS
 */
class ProgressiveEnhancement {
    constructor() {
        this.errorBoundaries = new Map();
        this.fallbackStrategies = new Map();
        this.enhancementLayers = [];
        this.criticalErrors = [];
        this.init();
    }

    /**
     * Initialize progressive enhancement system
     */
    init() {
        this.setupGlobalErrorHandling();
        this.setupErrorBoundaries();
        this.setupFallbackStrategies();
        this.enhanceBasicFunctionality();
        this.monitorCriticalFeatures();
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
        });

        // Handle resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event.target);
            }
        }, true);
    }

    /**
     * Setup error boundaries for different application sections
     */
    setupErrorBoundaries() {
        // Authentication boundary
        this.createErrorBoundary('auth', {
            selector: '.auth-container, #loginForm, #signupForm',
            fallback: this.authFallback.bind(this),
            critical: true
        });

        // Ticket management boundary
        this.createErrorBoundary('tickets', {
            selector: '#ticketContainer, .ticket-management',
            fallback: this.ticketsFallback.bind(this),
            critical: true
        });

        // Dashboard boundary
        this.createErrorBoundary('dashboard', {
            selector: '.dashboard-container, .stats-grid',
            fallback: this.dashboardFallback.bind(this),
            critical: false
        });

        // Navigation boundary
        this.createErrorBoundary('navigation', {
            selector: 'nav, .navigation',
            fallback: this.navigationFallback.bind(this),
            critical: true
        });
    }

    /**
     * Create an error boundary for a specific section
     * @param {string} name - Boundary name
     * @param {Object} config - Boundary configuration
     */
    createErrorBoundary(name, config) {
        const boundary = {
            name,
            config,
            errors: [],
            isActive: true,
            fallbackActive: false
        };

        this.errorBoundaries.set(name, boundary);

        // Wrap functions in try-catch for this boundary
        this.wrapBoundaryFunctions(boundary);
    }

    /**
     * Wrap functions with error handling for a boundary
     * @param {Object} boundary - Error boundary object
     */
    wrapBoundaryFunctions(boundary) {
        const elements = document.querySelectorAll(boundary.config.selector);
        
        elements.forEach(element => {
            // Wrap event listeners
            this.wrapElementEventListeners(element, boundary);
        });
    }

    /**
     * Wrap element event listeners with error handling
     * @param {HTMLElement} element - Element to wrap
     * @param {Object} boundary - Error boundary
     */
    wrapElementEventListeners(element, boundary) {
        const originalAddEventListener = element.addEventListener;
        
        element.addEventListener = function(type, listener, options) {
            const wrappedListener = (event) => {
                try {
                    return listener.call(this, event);
                } catch (error) {
                    boundary.errors.push({
                        error,
                        element,
                        eventType: type,
                        timestamp: Date.now()
                    });
                    
                    // Activate fallback if too many errors
                    if (boundary.errors.length > 3 && !boundary.fallbackActive) {
                        boundary.config.fallback(element, error);
                        boundary.fallbackActive = true;
                    }
                    
                    console.error(`Error in ${boundary.name} boundary:`, error);
                }
            };
            
            return originalAddEventListener.call(this, type, wrappedListener, options);
        };
    }

    /**
     * Setup fallback strategies for core functionality
     */
    setupFallbackStrategies() {
        // LocalStorage fallback
        this.fallbackStrategies.set('localStorage', {
            check: () => this.hasLocalStorage(),
            fallback: this.createCookieStorage.bind(this)
        });

        // Fetch API fallback
        this.fallbackStrategies.set('fetch', {
            check: () => 'fetch' in window,
            fallback: this.createXHRFallback.bind(this)
        });

        // IntersectionObserver fallback
        this.fallbackStrategies.set('intersectionObserver', {
            check: () => 'IntersectionObserver' in window,
            fallback: this.createScrollObserverFallback.bind(this)
        });

        // Apply fallbacks
        this.applyFallbacks();
    }

    /**
     * Apply fallback strategies
     */
    applyFallbacks() {
        this.fallbackStrategies.forEach((strategy, name) => {
            if (!strategy.check()) {
                console.warn(`${name} not supported, applying fallback`);
                strategy.fallback();
            }
        });
    }

    /**
     * Enhance basic functionality progressively
     */
    enhanceBasicFunctionality() {
        // Enhance forms
        this.enhanceForms();
        
        // Enhance navigation
        this.enhanceNavigation();
        
        // Enhance buttons
        this.enhanceButtons();
        
        // Add loading states
        this.addLoadingStates();
    }

    /**
     * Enhance forms with progressive features
     */
    enhanceForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add client-side validation if supported
            if (this.supportsFormValidation()) {
                this.addClientSideValidation(form);
            }
            
            // Add loading states
            this.addFormLoadingState(form);
            
            // Add error handling
            this.addFormErrorHandling(form);
        });
    }

    /**
     * Enhance navigation with progressive features
     */
    enhanceNavigation() {
        const navLinks = document.querySelectorAll('nav a, .navigation a');
        
        navLinks.forEach(link => {
            // Add smooth scrolling for anchor links
            if (link.getAttribute('href').startsWith('#')) {
                this.addSmoothScrolling(link);
            }
            
            // Add loading indicators for page navigation
            this.addNavigationLoading(link);
        });
    }

    /**
     * Enhance buttons with progressive features
     */
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn');
        
        buttons.forEach(button => {
            // Add ripple effect if supported
            if (this.supportsAnimations()) {
                this.addRippleEffect(button);
            }
            
            // Add loading state capability
            this.addButtonLoadingState(button);
            
            // Add keyboard navigation
            this.addKeyboardNavigation(button);
        });
    }

    /**
     * Add loading states throughout the application
     */
    addLoadingStates() {
        // Create loading overlay
        this.createLoadingOverlay();
        
        // Add skeleton screens
        this.addSkeletonScreens();
        
        // Add progress indicators
        this.addProgressIndicators();
    }

    /**
     * Monitor critical features and provide fallbacks
     */
    monitorCriticalFeatures() {
        // Monitor authentication
        this.monitorAuthentication();
        
        // Monitor data persistence
        this.monitorDataPersistence();
        
        // Monitor network connectivity
        this.monitorNetworkConnectivity();
    }

    // Error Boundary Fallback Functions

    /**
     * Authentication fallback
     * @param {HTMLElement} element - Failed element
     * @param {Error} error - Error that occurred
     */
    authFallback(element, error) {
        console.warn('Authentication system failed, providing basic fallback');
        
        // Show basic login form without JavaScript enhancement
        const fallbackHTML = `
            <div class="auth-fallback">
                <p class="error-message">
                    Enhanced login features are temporarily unavailable. 
                    Please use the basic form below.
                </p>
                <noscript>
                    <p>JavaScript is required for enhanced features. Please enable JavaScript or use the basic form.</p>
                </noscript>
            </div>
        `;
        
        element.insertAdjacentHTML('afterbegin', fallbackHTML);
        element.classList.add('fallback-mode');
    }

    /**
     * Tickets fallback
     * @param {HTMLElement} element - Failed element
     * @param {Error} error - Error that occurred
     */
    ticketsFallback(element, error) {
        console.warn('Ticket management system failed, providing basic fallback');
        
        const fallbackHTML = `
            <div class="tickets-fallback">
                <p class="error-message">
                    Ticket management features are temporarily unavailable. 
                    Please refresh the page or contact support.
                </p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Refresh Page
                </button>
            </div>
        `;
        
        element.innerHTML = fallbackHTML;
        element.classList.add('fallback-mode');
    }

    /**
     * Dashboard fallback
     * @param {HTMLElement} element - Failed element
     * @param {Error} error - Error that occurred
     */
    dashboardFallback(element, error) {
        console.warn('Dashboard system failed, providing basic fallback');
        
        const fallbackHTML = `
            <div class="dashboard-fallback">
                <h2>Dashboard</h2>
                <p class="error-message">
                    Some dashboard features are temporarily unavailable.
                </p>
                <div class="basic-actions">
                    <a href="/tickets" class="btn btn-primary">Manage Tickets</a>
                    <a href="/auth/login" class="btn btn-secondary">Logout</a>
                </div>
            </div>
        `;
        
        element.innerHTML = fallbackHTML;
        element.classList.add('fallback-mode');
    }

    /**
     * Navigation fallback
     * @param {HTMLElement} element - Failed element
     * @param {Error} error - Error that occurred
     */
    navigationFallback(element, error) {
        console.warn('Navigation system failed, ensuring basic links work');
        
        // Ensure all navigation links work without JavaScript
        const links = element.querySelectorAll('a');
        links.forEach(link => {
            if (!link.getAttribute('href')) {
                link.setAttribute('href', '#');
            }
        });
        
        element.classList.add('fallback-mode');
    }

    // Fallback Strategy Implementations

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    hasLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Create cookie-based storage fallback
     */
    createCookieStorage() {
        window.localStorage = {
            getItem: (key) => {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === key) {
                        return decodeURIComponent(value);
                    }
                }
                return null;
            },
            setItem: (key, value) => {
                const expires = new Date();
                expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
                document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
            },
            removeItem: (key) => {
                document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
            }
        };
    }

    /**
     * Create XMLHttpRequest fallback for fetch
     */
    createXHRFallback() {
        window.fetch = (url, options = {}) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(options.method || 'GET', url);
                
                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                xhr.onload = () => {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        text: () => Promise.resolve(xhr.responseText),
                        json: () => Promise.resolve(JSON.parse(xhr.responseText))
                    });
                };
                
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(options.body);
            });
        };
    }

    /**
     * Create scroll-based observer fallback
     */
    createScrollObserverFallback() {
        window.IntersectionObserver = function(callback) {
            this.observedElements = [];
            
            this.observe = (element) => {
                this.observedElements.push(element);
            };
            
            this.disconnect = () => {
                this.observedElements = [];
            };
            
            // Check visibility on scroll
            const checkVisibility = () => {
                this.observedElements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (isVisible) {
                        callback([{ target: element, isIntersecting: true }]);
                    }
                });
            };
            
            window.addEventListener('scroll', checkVisibility, { passive: true });
            window.addEventListener('resize', checkVisibility, { passive: true });
        };
    }

    // Enhancement Helper Functions

    /**
     * Check if form validation is supported
     * @returns {boolean} True if supported
     */
    supportsFormValidation() {
        return 'checkValidity' in document.createElement('input');
    }

    /**
     * Check if animations are supported and preferred
     * @returns {boolean} True if supported
     */
    supportsAnimations() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Add client-side validation to form
     * @param {HTMLFormElement} form - Form to enhance
     */
    addClientSideValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (!input.checkValidity()) {
                    this.showValidationError(input);
                } else {
                    this.clearValidationError(input);
                }
            });
        });
    }

    /**
     * Add loading state to form
     * @param {HTMLFormElement} form - Form to enhance
     */
    addFormLoadingState(form) {
        form.addEventListener('submit', () => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('loading');
                submitButton.textContent = 'Please wait...';
            }
        });
    }

    /**
     * Add error handling to form
     * @param {HTMLFormElement} form - Form to enhance
     */
    addFormErrorHandling(form) {
        form.addEventListener('submit', (event) => {
            try {
                // Form submission logic would go here
            } catch (error) {
                event.preventDefault();
                this.showFormError(form, 'An error occurred. Please try again.');
            }
        });
    }

    /**
     * Create loading overlay
     */
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Error Handling Functions

    /**
     * Handle global JavaScript errors
     * @param {Error} error - Error object
     * @param {string} filename - File where error occurred
     * @param {number} lineno - Line number where error occurred
     */
    handleGlobalError(error, filename, lineno) {
        this.criticalErrors.push({
            error,
            filename,
            lineno,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });

        console.error('Global error:', error);

        // Show user-friendly error message
        if (typeof toastSystem !== 'undefined') {
            toastSystem.showError('Something went wrong. Please refresh the page if problems persist.');
        }

        // Activate fallback mode if too many errors
        if (this.criticalErrors.length > 5) {
            this.activateGlobalFallback();
        }
    }

    /**
     * Handle promise rejections
     * @param {any} reason - Rejection reason
     */
    handlePromiseRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        if (typeof toastSystem !== 'undefined') {
            toastSystem.showWarning('A background operation failed. Some features may not work properly.');
        }
    }

    /**
     * Handle resource loading errors
     * @param {HTMLElement} target - Failed resource element
     */
    handleResourceError(target) {
        console.warn('Resource failed to load:', target.src || target.href);
        
        // Add error class for styling
        target.classList.add('resource-error');
        
        // Try to provide fallback
        if (target.tagName === 'IMG') {
            target.style.display = 'none';
        } else if (target.tagName === 'SCRIPT') {
            this.handleScriptFailure(target);
        } else if (target.tagName === 'LINK') {
            this.handleStylesheetFailure(target);
        }
    }

    /**
     * Activate global fallback mode
     */
    activateGlobalFallback() {
        document.body.classList.add('global-fallback');
        
        // Show global error message
        const errorBanner = document.createElement('div');
        errorBanner.className = 'global-error-banner';
        errorBanner.innerHTML = `
            <p>Some features are experiencing issues. Basic functionality is still available.</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }

    /**
     * Get error report for debugging
     * @returns {Object} Error report
     */
    getErrorReport() {
        return {
            criticalErrors: this.criticalErrors,
            boundaryErrors: Array.from(this.errorBoundaries.entries()).map(([name, boundary]) => ({
                name,
                errorCount: boundary.errors.length,
                fallbackActive: boundary.fallbackActive
            })),
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }
}

// Initialize progressive enhancement when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const progressiveEnhancement = new ProgressiveEnhancement();
    
    // Make available globally for debugging
    window.progressiveEnhancement = progressiveEnhancement;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressiveEnhancement;
}