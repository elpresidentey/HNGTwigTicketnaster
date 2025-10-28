/**
 * Loading States Manager - Provides comprehensive loading states and user feedback
 * Handles loading indicators, progress bars, skeleton screens, and user feedback
 */
class LoadingStatesManager {
    constructor() {
        this.activeLoaders = new Map();
        this.loadingQueue = [];
        this.globalLoadingState = false;
        this.loadingMetrics = {
            totalOperations: 0,
            completedOperations: 0,
            averageLoadTime: 0,
            loadTimes: []
        };
        this.init();
    }

    /**
     * Initialize loading states manager
     */
    init() {
        this.createGlobalLoadingOverlay();
        this.setupProgressIndicators();
        this.setupSkeletonScreens();
        this.setupFormLoadingStates();
        this.setupButtonLoadingStates();
        this.setupNetworkStatusIndicator();
    }

    /**
     * Create global loading overlay
     */
    createGlobalLoadingOverlay() {
        if (document.getElementById('global-loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'global-loading-overlay';
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner-large">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">Loading...</div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    /**
     * Show global loading overlay
     * @param {string} message - Loading message
     * @param {boolean} showProgress - Whether to show progress bar
     */
    showGlobalLoading(message = 'Loading...', showProgress = false) {
        const overlay = document.getElementById('global-loading-overlay');
        const textElement = overlay.querySelector('.loading-text');
        const progressElement = overlay.querySelector('.loading-progress');
        
        if (textElement) textElement.textContent = message;
        if (progressElement) {
            progressElement.style.display = showProgress ? 'block' : 'none';
        }
        
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.globalLoadingState = true;
    }

    /**
     * Hide global loading overlay
     */
    hideGlobalLoading() {
        const overlay = document.getElementById('global-loading-overlay');
        overlay.classList.add('hidden');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        this.globalLoadingState = false;
    }

    /**
     * Update global loading progress
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} message - Optional progress message
     */
    updateGlobalProgress(percentage, message = null) {
        const overlay = document.getElementById('global-loading-overlay');
        const progressFill = overlay.querySelector('.progress-fill');
        const progressText = overlay.querySelector('.progress-text');
        const loadingText = overlay.querySelector('.loading-text');
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
        
        if (message && loadingText) {
            loadingText.textContent = message;
        }
    }

    /**
     * Setup progress indicators for various operations
     */
    setupProgressIndicators() {
        // Create progress indicator template
        this.createProgressIndicatorTemplate();
        
        // Monitor fetch requests for automatic progress
        this.interceptFetchRequests();
        
        // Monitor form submissions
        this.monitorFormSubmissions();
    }

    /**
     * Create progress indicator template
     */
    createProgressIndicatorTemplate() {
        if (document.getElementById('progress-indicator-template')) return;

        const template = document.createElement('template');
        template.id = 'progress-indicator-template';
        template.innerHTML = `
            <div class="progress-indicator">
                <div class="progress-spinner">
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                </div>
                <div class="progress-message">Processing...</div>
            </div>
        `;
        
        document.head.appendChild(template);
    }

    /**
     * Intercept fetch requests to show loading states
     */
    interceptFetchRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const loaderId = this.generateLoaderId();
            
            try {
                // Show loading for requests that might take time
                const url = args[0];
                if (this.shouldShowLoadingForRequest(url)) {
                    this.showRequestLoading(loaderId, url);
                }
                
                const response = await originalFetch.apply(window, args);
                
                // Track metrics
                const endTime = performance.now();
                this.trackLoadTime(endTime - startTime);
                
                return response;
            } catch (error) {
                throw error;
            } finally {
                this.hideRequestLoading(loaderId);
            }
        };
    }

    /**
     * Monitor form submissions for loading states
     */
    monitorFormSubmissions() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                this.showFormLoading(form);
            }
        });
    }

    /**
     * Setup skeleton screens for content loading
     */
    setupSkeletonScreens() {
        this.createSkeletonTemplates();
        this.setupIntersectionObserver();
    }

    /**
     * Create skeleton screen templates
     */
    createSkeletonTemplates() {
        const templates = {
            'ticket-card': `
                <div class="skeleton-card">
                    <div class="skeleton-header">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-badge"></div>
                    </div>
                    <div class="skeleton-body">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line skeleton-short"></div>
                    </div>
                    <div class="skeleton-footer">
                        <div class="skeleton-line skeleton-date"></div>
                        <div class="skeleton-actions">
                            <div class="skeleton-button"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                </div>
            `,
            'stat-card': `
                <div class="skeleton-stat">
                    <div class="skeleton-number"></div>
                    <div class="skeleton-label"></div>
                </div>
            `,
            'form': `
                <div class="skeleton-form">
                    <div class="skeleton-field">
                        <div class="skeleton-label"></div>
                        <div class="skeleton-input"></div>
                    </div>
                    <div class="skeleton-field">
                        <div class="skeleton-label"></div>
                        <div class="skeleton-textarea"></div>
                    </div>
                    <div class="skeleton-actions">
                        <div class="skeleton-button skeleton-primary"></div>
                        <div class="skeleton-button"></div>
                    </div>
                </div>
            `
        };

        Object.keys(templates).forEach(type => {
            const template = document.createElement('template');
            template.id = `skeleton-${type}-template`;
            template.innerHTML = templates[type];
            document.head.appendChild(template);
        });
    }

    /**
     * Setup intersection observer for lazy loading with skeletons
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const skeletonType = element.getAttribute('data-skeleton');
                    
                    if (skeletonType) {
                        this.showSkeleton(element, skeletonType);
                        
                        // Simulate content loading
                        setTimeout(() => {
                            this.hideSkeleton(element);
                        }, 1000 + Math.random() * 2000);
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe elements with skeleton data attribute
        document.querySelectorAll('[data-skeleton]').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Setup form loading states
     */
    setupFormLoadingStates() {
        // Add loading state capability to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.enhanceFormWithLoadingState(form);
        });
    }

    /**
     * Enhance form with loading state capability
     * @param {HTMLFormElement} form - Form to enhance
     */
    enhanceFormWithLoadingState(form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (!submitButton) return;

        // Store original button content
        const originalContent = submitButton.innerHTML;
        submitButton.setAttribute('data-original-content', originalContent);

        // Add loading state methods to form
        form.showLoading = () => this.showFormLoading(form);
        form.hideLoading = () => this.hideFormLoading(form);
    }

    /**
     * Setup button loading states
     */
    setupButtonLoadingStates() {
        // Enhance buttons with loading capability
        const buttons = document.querySelectorAll('button[data-loading], .btn[data-loading]');
        buttons.forEach(button => {
            this.enhanceButtonWithLoadingState(button);
        });
    }

    /**
     * Enhance button with loading state capability
     * @param {HTMLButtonElement} button - Button to enhance
     */
    enhanceButtonWithLoadingState(button) {
        const originalContent = button.innerHTML;
        button.setAttribute('data-original-content', originalContent);

        // Add loading state methods to button
        button.showLoading = (message = 'Loading...') => this.showButtonLoading(button, message);
        button.hideLoading = () => this.hideButtonLoading(button);
    }

    /**
     * Setup network status indicator
     */
    setupNetworkStatusIndicator() {
        this.createNetworkStatusIndicator();
        this.monitorNetworkStatus();
    }

    /**
     * Create network status indicator
     */
    createNetworkStatusIndicator() {
        if (document.getElementById('network-status')) return;

        const indicator = document.createElement('div');
        indicator.id = 'network-status';
        indicator.className = 'network-status hidden';
        indicator.innerHTML = `
            <div class="network-status-content">
                <div class="network-icon">📡</div>
                <div class="network-message">Checking connection...</div>
            </div>
        `;
        
        document.body.appendChild(indicator);
    }

    /**
     * Monitor network status
     */
    monitorNetworkStatus() {
        const updateNetworkStatus = () => {
            const indicator = document.getElementById('network-status');
            const message = indicator.querySelector('.network-message');
            
            if (navigator.onLine) {
                indicator.classList.add('hidden');
            } else {
                message.textContent = 'No internet connection';
                indicator.classList.remove('hidden');
                indicator.classList.add('offline');
            }
        };

        window.addEventListener('online', () => {
            const indicator = document.getElementById('network-status');
            const message = indicator.querySelector('.network-message');
            
            message.textContent = 'Connection restored';
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            
            setTimeout(() => {
                indicator.classList.add('hidden');
                indicator.classList.remove('online');
            }, 3000);
        });

        window.addEventListener('offline', updateNetworkStatus);
        
        // Initial check
        updateNetworkStatus();
    }

    // Public API Methods

    /**
     * Show loading state for an element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} message - Loading message
     * @param {Object} options - Loading options
     */
    showLoading(element, message = 'Loading...', options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        const loaderId = this.generateLoaderId();
        const loader = this.createLoader(message, options);
        
        // Store original content
        const originalContent = el.innerHTML;
        el.setAttribute('data-original-content', originalContent);
        el.setAttribute('data-loader-id', loaderId);
        
        // Show loader
        el.innerHTML = '';
        el.appendChild(loader);
        el.classList.add('loading-state');
        
        this.activeLoaders.set(loaderId, {
            element: el,
            originalContent,
            startTime: performance.now()
        });

        return loaderId;
    }

    /**
     * Hide loading state for an element
     * @param {HTMLElement|string} element - Element, selector, or loader ID
     */
    hideLoading(element) {
        let el, loaderId;
        
        if (typeof element === 'string') {
            // Could be selector or loader ID
            el = document.querySelector(element);
            if (!el) {
                // Assume it's a loader ID
                loaderId = element;
                const loaderData = this.activeLoaders.get(loaderId);
                if (loaderData) {
                    el = loaderData.element;
                }
            } else {
                loaderId = el.getAttribute('data-loader-id');
            }
        } else {
            el = element;
            loaderId = el.getAttribute('data-loader-id');
        }

        if (!el || !loaderId) return;

        const loaderData = this.activeLoaders.get(loaderId);
        if (loaderData) {
            // Restore original content
            el.innerHTML = loaderData.originalContent;
            el.classList.remove('loading-state');
            el.removeAttribute('data-original-content');
            el.removeAttribute('data-loader-id');
            
            // Track metrics
            const loadTime = performance.now() - loaderData.startTime;
            this.trackLoadTime(loadTime);
            
            this.activeLoaders.delete(loaderId);
        }
    }

    /**
     * Show skeleton screen
     * @param {HTMLElement} element - Element to show skeleton for
     * @param {string} type - Skeleton type
     */
    showSkeleton(element, type) {
        const template = document.getElementById(`skeleton-${type}-template`);
        if (!template) return;

        const skeleton = template.content.cloneNode(true);
        const originalContent = element.innerHTML;
        
        element.setAttribute('data-original-content', originalContent);
        element.innerHTML = '';
        element.appendChild(skeleton);
        element.classList.add('skeleton-loading');
    }

    /**
     * Hide skeleton screen
     * @param {HTMLElement} element - Element to hide skeleton for
     */
    hideSkeleton(element) {
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }
        element.classList.remove('skeleton-loading');
    }

    /**
     * Show form loading state
     * @param {HTMLFormElement} form - Form element
     */
    showFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea, select, button');
        
        // Disable all form elements
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        // Show loading on submit button
        if (submitButton) {
            this.showButtonLoading(submitButton, 'Processing...');
        }
        
        form.classList.add('form-loading');
    }

    /**
     * Hide form loading state
     * @param {HTMLFormElement} form - Form element
     */
    hideFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea, select, button');
        
        // Re-enable all form elements
        inputs.forEach(input => {
            input.disabled = false;
        });
        
        // Hide loading on submit button
        if (submitButton) {
            this.hideButtonLoading(submitButton);
        }
        
        form.classList.remove('form-loading');
    }

    /**
     * Show button loading state
     * @param {HTMLButtonElement} button - Button element
     * @param {string} message - Loading message
     */
    showButtonLoading(button, message = 'Loading...') {
        const originalContent = button.getAttribute('data-original-content') || button.innerHTML;
        button.setAttribute('data-original-content', originalContent);
        
        button.innerHTML = `
            <span class="button-spinner">
                <span class="spinner-dot"></span>
                <span class="spinner-dot"></span>
                <span class="spinner-dot"></span>
            </span>
            <span class="button-loading-text">${message}</span>
        `;
        
        button.disabled = true;
        button.classList.add('button-loading');
    }

    /**
     * Hide button loading state
     * @param {HTMLButtonElement} button - Button element
     */
    hideButtonLoading(button) {
        const originalContent = button.getAttribute('data-original-content');
        if (originalContent) {
            button.innerHTML = originalContent;
        }
        
        button.disabled = false;
        button.classList.remove('button-loading');
    }

    /**
     * Show progress for a specific operation
     * @param {string} operationId - Operation identifier
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    showProgress(operationId, progress, message = '') {
        let progressElement = document.getElementById(`progress-${operationId}`);
        
        if (!progressElement) {
            progressElement = this.createProgressElement(operationId);
            document.body.appendChild(progressElement);
        }
        
        const progressBar = progressElement.querySelector('.progress-fill');
        const progressText = progressElement.querySelector('.progress-text');
        const progressMessage = progressElement.querySelector('.progress-message');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        if (progressMessage && message) {
            progressMessage.textContent = message;
        }
        
        progressElement.classList.remove('hidden');
        
        // Auto-hide when complete
        if (progress >= 100) {
            setTimeout(() => {
                this.hideProgress(operationId);
            }, 1000);
        }
    }

    /**
     * Hide progress for a specific operation
     * @param {string} operationId - Operation identifier
     */
    hideProgress(operationId) {
        const progressElement = document.getElementById(`progress-${operationId}`);
        if (progressElement) {
            progressElement.classList.add('hidden');
            setTimeout(() => {
                if (progressElement.parentNode) {
                    progressElement.parentNode.removeChild(progressElement);
                }
            }, 300);
        }
    }

    // Private Helper Methods

    /**
     * Generate unique loader ID
     * @returns {string} Loader ID
     */
    generateLoaderId() {
        return `loader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create loader element
     * @param {string} message - Loading message
     * @param {Object} options - Loader options
     * @returns {HTMLElement} Loader element
     */
    createLoader(message, options = {}) {
        const loader = document.createElement('div');
        loader.className = 'inline-loader';
        
        const spinnerType = options.spinner || 'dots';
        const showMessage = options.showMessage !== false;
        
        loader.innerHTML = `
            <div class="loader-spinner loader-${spinnerType}">
                ${this.getSpinnerHTML(spinnerType)}
            </div>
            ${showMessage ? `<div class="loader-message">${message}</div>` : ''}
        `;
        
        return loader;
    }

    /**
     * Get spinner HTML for different types
     * @param {string} type - Spinner type
     * @returns {string} Spinner HTML
     */
    getSpinnerHTML(type) {
        switch (type) {
            case 'ring':
                return '<div class="spinner-ring"></div>';
            case 'pulse':
                return '<div class="spinner-pulse"></div>';
            case 'dots':
            default:
                return `
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                `;
        }
    }

    /**
     * Create progress element
     * @param {string} operationId - Operation ID
     * @returns {HTMLElement} Progress element
     */
    createProgressElement(operationId) {
        const element = document.createElement('div');
        element.id = `progress-${operationId}`;
        element.className = 'operation-progress hidden';
        element.innerHTML = `
            <div class="progress-content">
                <div class="progress-message"></div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">0%</div>
            </div>
        `;
        
        return element;
    }

    /**
     * Check if loading should be shown for request
     * @param {string} url - Request URL
     * @returns {boolean} True if loading should be shown
     */
    shouldShowLoadingForRequest(url) {
        // Show loading for API calls or slow operations
        return url.includes('/api/') || 
               url.includes('upload') || 
               url.includes('process');
    }

    /**
     * Show loading for request
     * @param {string} loaderId - Loader ID
     * @param {string} url - Request URL
     */
    showRequestLoading(loaderId, url) {
        // Could show a small network indicator
        console.log(`Loading request: ${url}`);
    }

    /**
     * Hide loading for request
     * @param {string} loaderId - Loader ID
     */
    hideRequestLoading(loaderId) {
        // Hide network indicator
        console.log(`Request completed: ${loaderId}`);
    }

    /**
     * Track load time for metrics
     * @param {number} loadTime - Load time in milliseconds
     */
    trackLoadTime(loadTime) {
        this.loadingMetrics.totalOperations++;
        this.loadingMetrics.completedOperations++;
        this.loadingMetrics.loadTimes.push(loadTime);
        
        // Keep only last 100 load times
        if (this.loadingMetrics.loadTimes.length > 100) {
            this.loadingMetrics.loadTimes.shift();
        }
        
        // Calculate average
        const sum = this.loadingMetrics.loadTimes.reduce((a, b) => a + b, 0);
        this.loadingMetrics.averageLoadTime = sum / this.loadingMetrics.loadTimes.length;
    }

    /**
     * Get loading metrics
     * @returns {Object} Loading metrics
     */
    getMetrics() {
        return {
            ...this.loadingMetrics,
            activeLoaders: this.activeLoaders.size,
            globalLoadingActive: this.globalLoadingState
        };
    }
}

// Initialize loading states manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loadingStatesManager = new LoadingStatesManager();
    
    // Make available globally
    window.loadingStates = loadingStatesManager;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingStatesManager;
}