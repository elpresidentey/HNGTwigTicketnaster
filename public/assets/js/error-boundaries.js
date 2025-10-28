/**
 * Error Boundaries System - Provides comprehensive error handling and fallback mechanisms
 * Implements error boundaries similar to React's error boundaries for vanilla JavaScript
 */
class ErrorBoundariesSystem {
    constructor() {
        this.boundaries = new Map();
        this.globalErrorHandlers = [];
        this.errorLog = [];
        this.maxErrorLogSize = 100;
        this.errorThresholds = {
            boundary: 5, // Max errors per boundary before fallback
            global: 20,  // Max global errors before emergency mode
            timeWindow: 60000 // 1 minute time window
        };
        this.emergencyMode = false;
        this.init();
    }

    /**
     * Initialize error boundaries system
     */
    init() {
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandling();
        this.setupResourceErrorHandling();
        this.createErrorBoundaries();
        this.setupErrorReporting();
        this.setupRecoveryMechanisms();
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            const errorInfo = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: Date.now(),
                type: 'javascript',
                stack: event.error?.stack
            };

            this.handleError(errorInfo);
        });
    }

    /**
     * Setup unhandled promise rejection handling
     */
    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            const errorInfo = {
                message: event.reason?.message || 'Unhandled Promise Rejection',
                error: event.reason,
                timestamp: Date.now(),
                type: 'promise',
                stack: event.reason?.stack
            };

            this.handleError(errorInfo);
            
            // Prevent the default browser behavior
            event.preventDefault();
        });
    }

    /**
     * Setup resource loading error handling
     */
    setupResourceErrorHandling() {
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                const errorInfo = {
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target,
                    timestamp: Date.now(),
                    type: 'resource',
                    resourceType: event.target.tagName.toLowerCase()
                };

                this.handleResourceError(errorInfo);
            }
        }, true);
    }

    /**
     * Create predefined error boundaries
     */
    createErrorBoundaries() {
        // Authentication boundary
        this.createBoundary('auth', {
            selector: '.auth-container, #loginForm, #signupForm',
            fallback: this.authFallback.bind(this),
            critical: true,
            retryable: true
        });

        // Ticket management boundary
        this.createBoundary('tickets', {
            selector: '#ticketContainer, .ticket-management',
            fallback: this.ticketsFallback.bind(this),
            critical: true,
            retryable: true
        });

        // Dashboard boundary
        this.createBoundary('dashboard', {
            selector: '.dashboard-container, .stats-grid',
            fallback: this.dashboardFallback.bind(this),
            critical: false,
            retryable: true
        });

        // Navigation boundary
        this.createBoundary('navigation', {
            selector: 'nav, .navigation',
            fallback: this.navigationFallback.bind(this),
            critical: true,
            retryable: false
        });

        // Forms boundary
        this.createBoundary('forms', {
            selector: 'form',
            fallback: this.formsFallback.bind(this),
            critical: false,
            retryable: true
        });
    }

    /**
     * Create an error boundary
     * @param {string} name - Boundary name
     * @param {Object} config - Boundary configuration
     */
    createBoundary(name, config) {
        const boundary = {
            name,
            config,
            errors: [],
            fallbackActive: false,
            retryCount: 0,
            maxRetries: config.retryable ? 3 : 0,
            lastError: null,
            elements: []
        };

        // Find and wrap elements
        const elements = document.querySelectorAll(config.selector);
        elements.forEach(element => {
            this.wrapElementWithBoundary(element, boundary);
            boundary.elements.push(element);
        });

        this.boundaries.set(name, boundary);
        console.log(`Created error boundary: ${name} with ${elements.length} elements`);
    }

    /**
     * Wrap element with error boundary
     * @param {HTMLElement} element - Element to wrap
     * @param {Object} boundary - Boundary configuration
     */
    wrapElementWithBoundary(element, boundary) {
        // Store original event listeners
        const originalAddEventListener = element.addEventListener;
        const originalRemoveEventListener = element.removeEventListener;
        const listeners = new Map();

        // Wrap addEventListener
        element.addEventListener = function(type, listener, options) {
            const wrappedListener = (event) => {
                try {
                    return listener.call(this, event);
                } catch (error) {
                    const errorInfo = {
                        message: error.message,
                        error,
                        element,
                        eventType: type,
                        boundary: boundary.name,
                        timestamp: Date.now(),
                        type: 'boundary',
                        stack: error.stack
                    };

                    window.errorBoundariesSystem.handleBoundaryError(boundary, errorInfo);
                }
            };

            listeners.set(listener, wrappedListener);
            return originalAddEventListener.call(this, type, wrappedListener, options);
        };

        // Wrap removeEventListener
        element.removeEventListener = function(type, listener, options) {
            const wrappedListener = listeners.get(listener);
            if (wrappedListener) {
                listeners.delete(listener);
                return originalRemoveEventListener.call(this, type, wrappedListener, options);
            }
            return originalRemoveEventListener.call(this, type, listener, options);
        };

        // Add boundary marker
        element.setAttribute('data-error-boundary', boundary.name);
    }

    /**
     * Handle boundary-specific errors
     * @param {Object} boundary - Error boundary
     * @param {Object} errorInfo - Error information
     */
    handleBoundaryError(boundary, errorInfo) {
        boundary.errors.push(errorInfo);
        boundary.lastError = errorInfo;

        console.error(`Error in boundary ${boundary.name}:`, errorInfo);

        // Check if threshold exceeded
        const recentErrors = this.getRecentErrors(boundary.errors);
        if (recentErrors.length >= this.errorThresholds.boundary && !boundary.fallbackActive) {
            this.activateBoundaryFallback(boundary);
        }

        // Log error globally
        this.logError(errorInfo);

        // Show user notification for critical boundaries
        if (boundary.config.critical) {
            this.showErrorNotification(errorInfo, boundary);
        }
    }

    /**
     * Activate fallback for a boundary
     * @param {Object} boundary - Error boundary
     */
    activateBoundaryFallback(boundary) {
        console.warn(`Activating fallback for boundary: ${boundary.name}`);
        
        boundary.fallbackActive = true;
        
        try {
            boundary.config.fallback(boundary);
        } catch (fallbackError) {
            console.error(`Fallback failed for boundary ${boundary.name}:`, fallbackError);
            this.activateEmergencyFallback(boundary);
        }

        // Add retry mechanism if retryable
        if (boundary.config.retryable && boundary.retryCount < boundary.maxRetries) {
            this.scheduleRetry(boundary);
        }
    }

    /**
     * Schedule retry for a boundary
     * @param {Object} boundary - Error boundary
     */
    scheduleRetry(boundary) {
        const retryDelay = Math.min(1000 * Math.pow(2, boundary.retryCount), 30000); // Exponential backoff, max 30s
        
        setTimeout(() => {
            if (boundary.fallbackActive && boundary.retryCount < boundary.maxRetries) {
                boundary.retryCount++;
                console.log(`Retrying boundary ${boundary.name} (attempt ${boundary.retryCount})`);
                
                try {
                    this.retryBoundary(boundary);
                } catch (error) {
                    console.error(`Retry failed for boundary ${boundary.name}:`, error);
                    
                    if (boundary.retryCount >= boundary.maxRetries) {
                        this.activateEmergencyFallback(boundary);
                    } else {
                        this.scheduleRetry(boundary);
                    }
                }
            }
        }, retryDelay);
    }

    /**
     * Retry a boundary
     * @param {Object} boundary - Error boundary
     */
    retryBoundary(boundary) {
        // Clear error state
        boundary.errors = [];
        boundary.fallbackActive = false;
        
        // Restore original functionality
        boundary.elements.forEach(element => {
            element.classList.remove('error-boundary-fallback');
            
            // Remove fallback content if present
            const fallbackElement = element.querySelector('.error-fallback');
            if (fallbackElement) {
                fallbackElement.remove();
            }
        });

        // Re-initialize if needed
        if (typeof window.appIntegration !== 'undefined') {
            window.appIntegration.init();
        }
    }

    /**
     * Activate emergency fallback
     * @param {Object} boundary - Error boundary
     */
    activateEmergencyFallback(boundary) {
        console.error(`Emergency fallback activated for boundary: ${boundary.name}`);
        
        boundary.elements.forEach(element => {
            element.innerHTML = `
                <div class="emergency-fallback">
                    <div class="emergency-icon">⚠️</div>
                    <h3>Service Temporarily Unavailable</h3>
                    <p>This feature is experiencing technical difficulties.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Refresh Page
                    </button>
                </div>
            `;
            element.classList.add('emergency-fallback-active');
        });
    }

    /**
     * Handle general errors
     * @param {Object} errorInfo - Error information
     */
    handleError(errorInfo) {
        this.logError(errorInfo);

        // Check for emergency mode
        const recentErrors = this.getRecentErrors(this.errorLog);
        if (recentErrors.length >= this.errorThresholds.global && !this.emergencyMode) {
            this.activateEmergencyMode();
        }

        // Execute global error handlers
        this.globalErrorHandlers.forEach(handler => {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                console.error('Error in global error handler:', handlerError);
            }
        });

        // Show user notification for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showCriticalErrorNotification(errorInfo);
        }
    }

    /**
     * Handle resource loading errors
     * @param {Object} errorInfo - Error information
     */
    handleResourceError(errorInfo) {
        this.logError(errorInfo);

        const element = errorInfo.element;
        
        switch (errorInfo.resourceType) {
            case 'script':
                this.handleScriptError(element, errorInfo);
                break;
            case 'link':
                this.handleStylesheetError(element, errorInfo);
                break;
            case 'img':
                this.handleImageError(element, errorInfo);
                break;
            default:
                console.warn('Unknown resource error:', errorInfo);
        }
    }

    /**
     * Handle script loading errors
     * @param {HTMLElement} element - Script element
     * @param {Object} errorInfo - Error information
     */
    handleScriptError(element, errorInfo) {
        console.error('Script loading failed:', errorInfo.message);
        
        // Try to load fallback or show error
        const src = element.src;
        if (src.includes('auth.js')) {
            this.showScriptErrorFallback('Authentication features may not work properly.');
        } else if (src.includes('tickets.js')) {
            this.showScriptErrorFallback('Ticket management features may not work properly.');
        } else {
            this.showScriptErrorFallback('Some features may not work properly.');
        }
    }

    /**
     * Handle stylesheet loading errors
     * @param {HTMLElement} element - Link element
     * @param {Object} errorInfo - Error information
     */
    handleStylesheetError(element, errorInfo) {
        console.error('Stylesheet loading failed:', errorInfo.message);
        
        // Add fallback styles
        this.addFallbackStyles();
    }

    /**
     * Handle image loading errors
     * @param {HTMLElement} element - Image element
     * @param {Object} errorInfo - Error information
     */
    handleImageError(element, errorInfo) {
        // Hide broken image
        element.style.display = 'none';
        
        // Add error indicator
        const errorIndicator = document.createElement('div');
        errorIndicator.className = 'image-error-indicator';
        errorIndicator.textContent = 'Image unavailable';
        element.parentNode.insertBefore(errorIndicator, element.nextSibling);
    }

    /**
     * Activate emergency mode
     */
    activateEmergencyMode() {
        console.error('Emergency mode activated - too many errors detected');
        
        this.emergencyMode = true;
        
        // Show emergency banner
        this.showEmergencyBanner();
        
        // Disable non-critical features
        this.disableNonCriticalFeatures();
        
        // Enable safe mode
        document.body.classList.add('emergency-mode');
    }

    /**
     * Show emergency banner
     */
    showEmergencyBanner() {
        if (document.getElementById('emergency-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'emergency-banner';
        banner.className = 'emergency-banner';
        banner.innerHTML = `
            <div class="emergency-content">
                <span class="emergency-icon">⚠️</span>
                <span class="emergency-message">
                    The application is experiencing technical difficulties. 
                    Some features may not work properly.
                </span>
                <button onclick="location.reload()" class="emergency-refresh">
                    Refresh Page
                </button>
            </div>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
    }

    /**
     * Setup error reporting
     */
    setupErrorReporting() {
        // Report errors to console in development
        if (window.location.hostname === 'localhost') {
            this.addGlobalErrorHandler((errorInfo) => {
                console.group('🚨 Error Report');
                console.error('Error:', errorInfo.message);
                console.error('Type:', errorInfo.type);
                console.error('Timestamp:', new Date(errorInfo.timestamp).toISOString());
                if (errorInfo.stack) {
                    console.error('Stack:', errorInfo.stack);
                }
                console.groupEnd();
            });
        }
    }

    /**
     * Setup recovery mechanisms
     */
    setupRecoveryMechanisms() {
        // Auto-recovery for certain error types
        this.addGlobalErrorHandler((errorInfo) => {
            if (this.isRecoverableError(errorInfo)) {
                this.attemptAutoRecovery(errorInfo);
            }
        });

        // Periodic health check
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
    }

    /**
     * Perform health check
     */
    performHealthCheck() {
        const recentErrors = this.getRecentErrors(this.errorLog, 300000); // Last 5 minutes
        
        if (recentErrors.length === 0 && this.emergencyMode) {
            console.log('Health check: No recent errors, attempting recovery');
            this.attemptRecovery();
        }
    }

    /**
     * Attempt recovery from emergency mode
     */
    attemptRecovery() {
        console.log('Attempting recovery from emergency mode');
        
        // Remove emergency mode
        this.emergencyMode = false;
        document.body.classList.remove('emergency-mode');
        
        // Remove emergency banner
        const banner = document.getElementById('emergency-banner');
        if (banner) {
            banner.remove();
        }
        
        // Reset boundaries
        this.boundaries.forEach(boundary => {
            boundary.errors = [];
            boundary.fallbackActive = false;
            boundary.retryCount = 0;
        });
        
        // Show recovery notification
        if (typeof window.toastSystem !== 'undefined') {
            window.toastSystem.showSuccess('System recovered successfully');
        }
    }

    // Fallback Methods

    /**
     * Authentication fallback
     * @param {Object} boundary - Error boundary
     */
    authFallback(boundary) {
        boundary.elements.forEach(element => {
            element.innerHTML = `
                <div class="error-fallback auth-fallback">
                    <div class="fallback-icon">🔐</div>
                    <h3>Authentication Unavailable</h3>
                    <p>Login features are temporarily unavailable. Please try refreshing the page.</p>
                    <div class="fallback-actions">
                        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                    </div>
                </div>
            `;
            element.classList.add('error-boundary-fallback');
        });
    }

    /**
     * Tickets fallback
     * @param {Object} boundary - Error boundary
     */
    ticketsFallback(boundary) {
        boundary.elements.forEach(element => {
            element.innerHTML = `
                <div class="error-fallback tickets-fallback">
                    <div class="fallback-icon">🎫</div>
                    <h3>Ticket Management Unavailable</h3>
                    <p>Ticket features are temporarily unavailable. Your data is safe.</p>
                    <div class="fallback-actions">
                        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                        <button onclick="window.history.back()" class="btn btn-secondary">Go Back</button>
                    </div>
                </div>
            `;
            element.classList.add('error-boundary-fallback');
        });
    }

    /**
     * Dashboard fallback
     * @param {Object} boundary - Error boundary
     */
    dashboardFallback(boundary) {
        boundary.elements.forEach(element => {
            element.innerHTML = `
                <div class="error-fallback dashboard-fallback">
                    <div class="fallback-icon">📊</div>
                    <h3>Dashboard Temporarily Unavailable</h3>
                    <p>Statistics and dashboard features are temporarily unavailable.</p>
                    <div class="fallback-actions">
                        <a href="/tickets" class="btn btn-primary">View Tickets</a>
                        <button onclick="location.reload()" class="btn btn-secondary">Refresh</button>
                    </div>
                </div>
            `;
            element.classList.add('error-boundary-fallback');
        });
    }

    /**
     * Navigation fallback
     * @param {Object} boundary - Error boundary
     */
    navigationFallback(boundary) {
        boundary.elements.forEach(element => {
            element.innerHTML = `
                <div class="error-fallback navigation-fallback">
                    <div class="basic-nav">
                        <a href="/" class="nav-link">Home</a>
                        <a href="/dashboard" class="nav-link">Dashboard</a>
                        <a href="/tickets" class="nav-link">Tickets</a>
                        <a href="/auth/login" class="nav-link">Login</a>
                    </div>
                </div>
            `;
            element.classList.add('error-boundary-fallback');
        });
    }

    /**
     * Forms fallback
     * @param {Object} boundary - Error boundary
     */
    formsFallback(boundary) {
        boundary.elements.forEach(element => {
            if (element.tagName === 'FORM') {
                const fallback = document.createElement('div');
                fallback.className = 'error-fallback form-fallback';
                fallback.innerHTML = `
                    <div class="fallback-icon">📝</div>
                    <h4>Form Temporarily Unavailable</h4>
                    <p>This form is experiencing issues. Please try again later.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                `;
                
                element.style.display = 'none';
                element.parentNode.insertBefore(fallback, element.nextSibling);
            }
        });
    }

    // Utility Methods

    /**
     * Log error to internal log
     * @param {Object} errorInfo - Error information
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Maintain log size
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }
    }

    /**
     * Get recent errors within time window
     * @param {Array} errors - Error array
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Array} Recent errors
     */
    getRecentErrors(errors, timeWindow = this.errorThresholds.timeWindow) {
        const now = Date.now();
        return errors.filter(error => (now - error.timestamp) < timeWindow);
    }

    /**
     * Check if error is critical
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if critical
     */
    isCriticalError(errorInfo) {
        const criticalPatterns = [
            /cannot read property/i,
            /undefined is not a function/i,
            /network error/i,
            /failed to fetch/i
        ];
        
        return criticalPatterns.some(pattern => pattern.test(errorInfo.message));
    }

    /**
     * Check if error is recoverable
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if recoverable
     */
    isRecoverableError(errorInfo) {
        const recoverablePatterns = [
            /network error/i,
            /failed to fetch/i,
            /timeout/i
        ];
        
        return recoverablePatterns.some(pattern => pattern.test(errorInfo.message));
    }

    /**
     * Attempt auto-recovery for recoverable errors
     * @param {Object} errorInfo - Error information
     */
    attemptAutoRecovery(errorInfo) {
        console.log('Attempting auto-recovery for:', errorInfo.message);
        
        // Implement specific recovery strategies
        if (errorInfo.message.includes('fetch')) {
            // Retry network requests
            setTimeout(() => {
                console.log('Retrying failed network request');
            }, 2000);
        }
    }

    /**
     * Show error notification to user
     * @param {Object} errorInfo - Error information
     * @param {Object} boundary - Error boundary
     */
    showErrorNotification(errorInfo, boundary) {
        // Only show notifications for the first few errors to avoid spam
        if (boundary.errors.length <= 2 && typeof window.toastSystem !== 'undefined') {
            const message = `${boundary.name} feature encountered an error. Attempting to recover...`;
            window.toastSystem.showWarning(message);
        }
    }

    /**
     * Show critical error notification
     * @param {Object} errorInfo - Error information
     */
    showCriticalErrorNotification(errorInfo) {
        // Only show critical notifications occasionally to avoid spam
        const recentCriticalErrors = this.getRecentErrors(this.errorLog.filter(e => this.isCriticalError(e)), 10000);
        if (recentCriticalErrors.length <= 1 && typeof window.toastSystem !== 'undefined') {
            window.toastSystem.showError('A critical error occurred. Please refresh the page if problems persist.');
        }
    }

    /**
     * Show script error fallback
     * @param {string} message - Error message
     */
    showScriptErrorFallback(message) {
        if (typeof window.toastSystem !== 'undefined') {
            window.toastSystem.showWarning(message);
        } else {
            console.warn(message);
        }
    }

    /**
     * Add fallback styles
     */
    addFallbackStyles() {
        if (document.getElementById('fallback-styles')) return;

        const style = document.createElement('style');
        style.id = 'fallback-styles';
        style.textContent = `
            body { font-family: Arial, sans-serif; }
            .btn { padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 0.25rem; }
            .error-fallback { padding: 2rem; text-align: center; border: 1px solid #ddd; border-radius: 0.5rem; }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Disable non-critical features
     */
    disableNonCriticalFeatures() {
        // Disable animations
        document.body.classList.add('disable-animations');
        
        // Disable non-essential JavaScript
        const nonCriticalElements = document.querySelectorAll('[data-non-critical]');
        nonCriticalElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Public API

    /**
     * Add global error handler
     * @param {Function} handler - Error handler function
     */
    addGlobalErrorHandler(handler) {
        this.globalErrorHandlers.push(handler);
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const recentErrors = this.getRecentErrors(this.errorLog);
        
        return {
            totalErrors: this.errorLog.length,
            recentErrors: recentErrors.length,
            emergencyMode: this.emergencyMode,
            boundaries: Array.from(this.boundaries.entries()).map(([name, boundary]) => ({
                name,
                errorCount: boundary.errors.length,
                fallbackActive: boundary.fallbackActive,
                retryCount: boundary.retryCount
            }))
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('Error log cleared');
    }

    /**
     * Export error log for debugging
     * @returns {Array} Error log
     */
    exportErrorLog() {
        return this.errorLog.map(error => ({
            ...error,
            timestamp: new Date(error.timestamp).toISOString()
        }));
    }
}

// Initialize error boundaries system
document.addEventListener('DOMContentLoaded', () => {
    // Temporarily disable error boundaries system to prevent notification spam
    // Uncomment the line below to re-enable when needed
    // window.errorBoundariesSystem = new ErrorBoundariesSystem();
    
    console.log('Error boundaries system disabled temporarily');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorBoundariesSystem;
}