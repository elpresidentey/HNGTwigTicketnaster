/**
 * Page Initialization System
 * Handles page-specific initialization and progressive enhancement
 */

/**
 * PageInitializer - Main class for handling page initialization
 */
class PageInitializer {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.features = new FeatureDetection();
        this.isInitialized = false;
    }

    /**
     * Initialize the current page
     */
    async init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Check feature availability
            await this.features.checkFeatures();
            
            // Initialize based on current page
            switch (this.currentPage) {
                case 'landing':
                    await this.initLandingPage();
                    break;
                case 'dashboard':
                    await this.initDashboardPage();
                    break;
                case 'tickets':
                    await this.initTicketManagementPage();
                    break;
                case 'login':
                case 'signup':
                    await this.initAuthenticationPage();
                    break;
                default:
                    console.log('No specific initialization for page:', this.currentPage);
            }

            this.isInitialized = true;
            console.log(`Page initialized: ${this.currentPage}`);

        } catch (error) {
            console.error('Page initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Detect current page based on URL and DOM elements
     * @returns {string} Page identifier
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const body = document.body;

        // Check URL patterns
        if (path === '/' || path === '/index.php') {
            return 'landing';
        } else if (path.includes('/dashboard')) {
            return 'dashboard';
        } else if (path.includes('/tickets')) {
            return 'tickets';
        } else if (path.includes('/auth/login')) {
            return 'login';
        } else if (path.includes('/auth/signup')) {
            return 'signup';
        }

        // Fallback: check body classes
        if (body.classList.contains('landing-page-body')) {
            return 'landing';
        } else if (body.classList.contains('auth-page')) {
            return path.includes('signup') ? 'signup' : 'login';
        }

        // Check for specific page elements
        if (document.querySelector('.dashboard-container')) {
            return 'dashboard';
        } else if (document.querySelector('#ticketContainer')) {
            return 'tickets';
        } else if (document.querySelector('.hero-section')) {
            return 'landing';
        } else if (document.querySelector('#loginForm')) {
            return 'login';
        } else if (document.querySelector('#signupForm')) {
            return 'signup';
        }

        return 'unknown';
    }

    /**
     * Initialize landing page interactions
     */
    async initLandingPage() {
        console.log('Initializing landing page...');

        // Smooth scrolling for anchor links
        this.initSmoothScrolling();

        // Intersection observer for animations
        if (this.features.hasIntersectionObserver) {
            this.initScrollAnimations();
        }

        // Parallax effects for decorative elements
        if (this.features.hasRequestAnimationFrame) {
            this.initParallaxEffects();
        }

        // Enhanced button interactions
        this.initLandingButtonEffects();

        console.log('Landing page initialization complete');
    }

    /**
     * Initialize dashboard page with auth checking
     */
    async initDashboardPage() {
        console.log('Initializing dashboard page...');

        // Check authentication first
        if (typeof AuthManager !== 'undefined') {
            const authManager = new AuthManager();
            
            if (!authManager.isAuthenticated()) {
                authManager.redirectIfNotAuth(window.location.href, 'Please log in to access the dashboard');
                return;
            }

            // Refresh session
            authManager.refreshSession();
        }

        // Initialize dashboard functionality
        this.initDashboardStats();
        this.initDashboardActions();
        this.initDashboardRefresh();

        // Auto-refresh stats periodically
        if (this.features.hasLocalStorage) {
            this.initStatsAutoRefresh();
        }

        console.log('Dashboard page initialization complete');
    }

    /**
     * Initialize ticket management page
     */
    async initTicketManagementPage() {
        console.log('Initializing ticket management page...');

        // Check authentication
        if (typeof AuthManager !== 'undefined') {
            const authManager = new AuthManager();
            
            if (!authManager.isAuthenticated()) {
                authManager.redirectIfNotAuth(window.location.href, 'Please log in to manage tickets');
                return;
            }
        }

        // Initialize ticket manager if available
        if (typeof TicketManager !== 'undefined') {
            const ticketManager = new TicketManager();
            
            // Initialize ticket display
            this.initTicketDisplay(ticketManager);
            
            // Initialize ticket forms
            this.initTicketForms(ticketManager);
            
            // Initialize ticket filters and sorting
            this.initTicketFilters(ticketManager);
            
            // Store reference for other functions
            window.ticketManagerInstance = ticketManager;
        }

        console.log('Ticket management page initialization complete');
    }

    /**
     * Initialize authentication pages with form handling
     */
    async initAuthenticationPage() {
        console.log(`Initializing ${this.currentPage} page...`);

        // Check if user is already authenticated
        if (typeof AuthManager !== 'undefined') {
            const authManager = new AuthManager();
            
            if (authManager.isAuthenticated()) {
                // Redirect to dashboard if already logged in
                window.location.href = '/dashboard';
                return;
            }
        }

        // Initialize form handling
        if (typeof AuthFormHandler !== 'undefined') {
            const authFormHandler = new AuthFormHandler();
            authFormHandler.init();
        }

        // Initialize form enhancements
        this.initAuthFormEnhancements();

        // Show any pending messages
        this.showAuthMessages();

        console.log(`${this.currentPage} page initialization complete`);
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Initialize scroll animations using Intersection Observer
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        const animatedElements = document.querySelectorAll(
            '.feature-card, .cta-content, .stat-card, .action-card'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Initialize parallax effects for decorative elements
     */
    initParallaxEffects() {
        const circles = document.querySelectorAll('.decorative-circles .circle');
        
        if (circles.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            circles.forEach((circle, index) => {
                const speed = (index + 1) * 0.1;
                circle.style.transform = `translateY(${rate * speed}px)`;
            });

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * Initialize enhanced button effects for landing page
     */
    initLandingButtonEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            // Add ripple effect on click
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for ripple animation if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Initialize dashboard statistics display
     */
    initDashboardStats() {
        // Load initial stats
        if (typeof loadTicketStatistics === 'function') {
            loadTicketStatistics();
        }
    }

    /**
     * Initialize dashboard actions
     */
    initDashboardActions() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && typeof AuthManager !== 'undefined') {
            const authManager = new AuthManager();
            
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    const result = authManager.logout();
                    if (result.success) {
                        window.location.href = '/';
                    }
                }
            });
        }

        // Create ticket button
        const createTicketBtn = document.getElementById('createTicketBtn');
        if (createTicketBtn) {
            createTicketBtn.addEventListener('click', () => {
                window.location.href = '/tickets';
            });
        }

        // Refresh stats button
        const refreshStatsBtn = document.getElementById('refreshStatsBtn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => {
                refreshStatsBtn.classList.add('refreshing');
                refreshStatsBtn.disabled = true;
                
                setTimeout(() => {
                    if (typeof loadTicketStatistics === 'function') {
                        loadTicketStatistics();
                    }
                    refreshStatsBtn.classList.remove('refreshing');
                    refreshStatsBtn.disabled = false;
                }, 500);
            });
        }
    }

    /**
     * Initialize dashboard refresh functionality
     */
    initDashboardRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            if (typeof loadTicketStatistics === 'function') {
                loadTicketStatistics();
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Initialize stats auto-refresh
     */
    initStatsAutoRefresh() {
        // Listen for storage changes to update stats in real-time
        window.addEventListener('storage', (e) => {
            if (e.key === 'tickets' && typeof loadTicketStatistics === 'function') {
                loadTicketStatistics();
            }
        });
    }

    /**
     * Initialize ticket display
     */
    initTicketDisplay(ticketManager) {
        // Load and render tickets
        ticketManager.renderTickets();
    }

    /**
     * Initialize ticket forms
     */
    initTicketForms(ticketManager) {
        // Create ticket button
        const createBtn = document.getElementById('createTicketBtn');
        const createFirstBtn = document.getElementById('createFirstTicketBtn');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                ticketManager.showCreateForm('createTicketModal');
            });
        }
        
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => {
                ticketManager.showCreateForm('createTicketModal');
            });
        }
    }

    /**
     * Initialize ticket filters and sorting
     */
    initTicketFilters(ticketManager) {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply filter
                const status = btn.getAttribute('data-status');
                this.applyTicketFilter(ticketManager, status);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.applySorting(ticketManager, sortSelect.value);
            });
        }
    }

    /**
     * Apply ticket filter
     */
    applyTicketFilter(ticketManager, status) {
        let tickets = ticketManager.getTickets();
        
        if (status !== 'all') {
            tickets = tickets.filter(ticket => ticket.status === status);
        }
        
        ticketManager.renderTickets('ticketContainer', tickets);
    }

    /**
     * Apply sorting to tickets
     */
    applySorting(ticketManager, sortBy) {
        let tickets = ticketManager.getTickets();
        
        switch (sortBy) {
            case 'newest':
                tickets.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'oldest':
                tickets.sort((a, b) => a.createdAt - b.createdAt);
                break;
            case 'title':
                tickets.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'status':
                tickets.sort((a, b) => a.status.localeCompare(b.status));
                break;
        }
        
        ticketManager.renderTickets('ticketContainer', tickets);
    }

    /**
     * Initialize authentication form enhancements
     */
    initAuthFormEnhancements() {
        // Real-time validation feedback
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Clear errors on input
                this.clearFieldError(input);
            });
        });

        // Password visibility toggle
        this.initPasswordToggle();

        // Form submission loading states
        this.initFormLoadingStates();
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'username':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Username is required';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Username must be at least 3 characters';
                }
                break;
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Password is required';
                } else if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'Password must be at least 6 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           field.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
        
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           field.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Initialize password visibility toggle
     */
    initPasswordToggle() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.className = 'password-field-wrapper';
            wrapper.style.position = 'relative';
            
            field.parentNode.insertBefore(wrapper, field);
            wrapper.appendChild(field);
            
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '👁️';
            toggleBtn.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
            `;
            
            toggleBtn.addEventListener('click', () => {
                const isPassword = field.type === 'password';
                field.type = isPassword ? 'text' : 'password';
                toggleBtn.innerHTML = isPassword ? '🙈' : '👁️';
            });
            
            wrapper.appendChild(toggleBtn);
        });
    }

    /**
     * Initialize form loading states
     */
    initFormLoadingStates() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('loading');
                    
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    
                    if (btnText) btnText.style.display = 'none';
                    if (btnLoading) btnLoading.style.display = 'inline-flex';
                }
            });
        });
    }

    /**
     * Show authentication messages
     */
    showAuthMessages() {
        const message = sessionStorage.getItem('auth_message');
        if (message) {
            if (typeof toastSystem !== 'undefined') {
                toastSystem.showInfo(message);
            } else {
                alert(message);
            }
            sessionStorage.removeItem('auth_message');
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Page initialization error:', error);
        
        // Show user-friendly error message
        if (typeof toastSystem !== 'undefined') {
            toastSystem.showError('Some features may not work properly. Please refresh the page.');
        }
    }
}

/**
 * Feature Detection - Check browser capabilities and graceful degradation
 */
class FeatureDetection {
    constructor() {
        this.features = {
            hasLocalStorage: false,
            hasSessionStorage: false,
            hasIntersectionObserver: false,
            hasRequestAnimationFrame: false,
            hasWebGL: false,
            hasServiceWorker: false,
            hasNotifications: false,
            isTouchDevice: false,
            isOnline: true
        };
    }

    /**
     * Check all browser features
     */
    async checkFeatures() {
        this.checkLocalStorage();
        this.checkSessionStorage();
        this.checkIntersectionObserver();
        this.checkRequestAnimationFrame();
        this.checkWebGL();
        this.checkServiceWorker();
        this.checkNotifications();
        this.checkTouchDevice();
        this.checkOnlineStatus();
        
        // Log feature support for debugging
        console.log('Feature detection results:', this.features);
        
        // Apply fallbacks for unsupported features
        this.applyFallbacks();
    }

    /**
     * Check localStorage availability
     */
    checkLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this.features.hasLocalStorage = true;
        } catch (e) {
            this.features.hasLocalStorage = false;
            console.warn('localStorage not available');
        }
    }

    /**
     * Check sessionStorage availability
     */
    checkSessionStorage() {
        try {
            const test = '__sessionStorage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            this.features.hasSessionStorage = true;
        } catch (e) {
            this.features.hasSessionStorage = false;
            console.warn('sessionStorage not available');
        }
    }

    /**
     * Check IntersectionObserver support
     */
    checkIntersectionObserver() {
        this.features.hasIntersectionObserver = 'IntersectionObserver' in window;
        if (!this.features.hasIntersectionObserver) {
            console.warn('IntersectionObserver not supported');
        }
    }

    /**
     * Check requestAnimationFrame support
     */
    checkRequestAnimationFrame() {
        this.features.hasRequestAnimationFrame = 'requestAnimationFrame' in window;
        if (!this.features.hasRequestAnimationFrame) {
            console.warn('requestAnimationFrame not supported');
        }
    }

    /**
     * Check WebGL support
     */
    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            this.features.hasWebGL = !!(
                window.WebGLRenderingContext && 
                canvas.getContext('webgl')
            );
        } catch (e) {
            this.features.hasWebGL = false;
        }
    }

    /**
     * Check Service Worker support
     */
    checkServiceWorker() {
        this.features.hasServiceWorker = 'serviceWorker' in navigator;
    }

    /**
     * Check Notifications API support
     */
    checkNotifications() {
        this.features.hasNotifications = 'Notification' in window;
    }

    /**
     * Check if device supports touch
     */
    checkTouchDevice() {
        this.features.isTouchDevice = (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    /**
     * Check online status
     */
    checkOnlineStatus() {
        this.features.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.features.isOnline = true;
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.features.isOnline = false;
            this.handleOnlineStatusChange(false);
        });
    }

    /**
     * Handle online status changes
     */
    handleOnlineStatusChange(isOnline) {
        if (typeof toastSystem !== 'undefined') {
            if (isOnline) {
                toastSystem.showSuccess('Connection restored');
            } else {
                toastSystem.showWarning('You are offline. Some features may not work.');
            }
        }
    }

    /**
     * Apply fallbacks for unsupported features
     */
    applyFallbacks() {
        // localStorage fallback
        if (!this.features.hasLocalStorage) {
            this.createLocalStorageFallback();
        }

        // IntersectionObserver fallback
        if (!this.features.hasIntersectionObserver) {
            this.createIntersectionObserverFallback();
        }

        // requestAnimationFrame fallback
        if (!this.features.hasRequestAnimationFrame) {
            this.createRequestAnimationFrameFallback();
        }

        // Add CSS classes for feature detection
        this.addFeatureClasses();
    }

    /**
     * Create localStorage fallback using cookies
     */
    createLocalStorageFallback() {
        if (typeof Storage === 'undefined') {
            window.localStorage = {
                getItem: function(key) {
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                        const [name, value] = cookie.trim().split('=');
                        if (name === key) {
                            return decodeURIComponent(value);
                        }
                    }
                    return null;
                },
                setItem: function(key, value) {
                    const expires = new Date();
                    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
                    document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
                },
                removeItem: function(key) {
                    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
                }
            };
        }
    }

    /**
     * Create IntersectionObserver fallback
     */
    createIntersectionObserverFallback() {
        // Simple scroll-based animation trigger
        let animatedElements = [];
        
        window.IntersectionObserver = function(callback) {
            this.observe = function(element) {
                animatedElements.push(element);
            };
            
            this.disconnect = function() {
                animatedElements = [];
            };
        };

        // Trigger animations on scroll
        const checkVisibility = () => {
            animatedElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    element.classList.add('animate-in');
                }
            });
        };

        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
    }

    /**
     * Create requestAnimationFrame fallback
     */
    createRequestAnimationFrameFallback() {
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                return setTimeout(callback, 1000 / 60);
            };
    }

    /**
     * Add CSS classes for feature detection
     */
    addFeatureClasses() {
        const html = document.documentElement;
        
        // Add feature classes
        Object.keys(this.features).forEach(feature => {
            const className = this.features[feature] ? feature : `no-${feature}`;
            html.classList.add(className);
        });
    }

    /**
     * Get feature support status
     */
    hasFeature(featureName) {
        return this.features[featureName] || false;
    }

    /**
     * Get all features
     */
    getAllFeatures() {
        return { ...this.features };
    }
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const pageInitializer = new PageInitializer();
    await pageInitializer.init();
    
    // Make available globally for debugging
    window.pageInitializer = pageInitializer;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PageInitializer,
        FeatureDetection
    };
}/
/ Enhanced Navigation Bar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    function handleNavbarScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Set active nav link based on current page
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Check if the link href matches current path
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    // Set active link on page load
    setActiveNavLink();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navbarMenu = document.getElementById('navbar-menu');
        
        if (mobileMenuBtn && navbarMenu && 
            !mobileMenuBtn.contains(event.target) && 
            !navbarMenu.contains(event.target)) {
            
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navbarMenu.classList.remove('navbar-menu-open');
            mobileMenuBtn.classList.remove('mobile-menu-toggle-active');
        }
    });
});