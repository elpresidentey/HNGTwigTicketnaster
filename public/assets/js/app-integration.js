/**
 * Application Integration Module
 * Connects all JavaScript modules and templates for the Twig Ticket Management App
 * Handles cross-module communication and shared functionality
 */

/**
 * AppIntegration - Main integration class that wires all components together
 */
class AppIntegration {
    constructor() {
        this.authManager = null;
        this.ticketManager = null;
        this.toastSystem = null;
        this.pageInitializer = null;
        this.currentPage = this.detectCurrentPage();
        this.isInitialized = false;
    }

    /**
     * Initialize the application integration
     */
    async init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize core systems
            await this.initializeCoreModules();
            
            // Wire authentication to all pages
            this.wireAuthenticationSystem();
            
            // Connect ticket management to templates
            this.wireTicketManagement();
            
            // Integrate toast system across all pages
            this.wireToastSystem();
            
            // Link dashboard statistics to ticket data
            this.wireDashboardStatistics();
            
            // Set up cross-page navigation
            this.wireNavigation();
            
            // Initialize page-specific integrations
            await this.initializePageSpecificIntegrations();
            
            this.isInitialized = true;
            console.log('Application integration complete');

        } catch (error) {
            console.error('Application integration failed:', error);
            this.handleIntegrationError(error);
        }
    }

    /**
     * Initialize core modules
     */
    async initializeCoreModules() {
        // Initialize toast system first (needed by other modules)
        if (typeof ToastSystem !== 'undefined') {
            this.toastSystem = new ToastSystem();
            window.appToast = this.toastSystem; // Make globally available
        }

        // Initialize authentication manager
        if (typeof AuthManager !== 'undefined') {
            this.authManager = new AuthManager();
            window.appAuth = this.authManager; // Make globally available
        }

        // Initialize ticket manager
        if (typeof TicketManager !== 'undefined') {
            this.ticketManager = new TicketManager();
            window.appTickets = this.ticketManager; // Make globally available
        }

        // Initialize page initializer
        if (typeof PageInitializer !== 'undefined') {
            this.pageInitializer = new PageInitializer();
        }
    }

    /**
     * Wire authentication system to login/signup templates
     */
    wireAuthenticationSystem() {
        if (!this.authManager) return;

        // Enhanced login form handling
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.setupLoginFormIntegration(loginForm);
        }

        // Enhanced signup form handling
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            this.setupSignupFormIntegration(signupForm);
        }

        // Global logout functionality
        this.setupGlobalLogout();

        // Authentication state monitoring
        this.setupAuthStateMonitoring();
    }

    /**
     * Connect ticket management module to ticket templates
     */
    wireTicketManagement() {
        if (!this.ticketManager || this.currentPage !== 'tickets') return;

        // Wire create ticket functionality
        this.wireCreateTicketForm();
        
        // Wire edit ticket functionality
        this.wireEditTicketForm();
        
        // Wire delete ticket functionality
        this.wireDeleteTicketConfirmation();
        
        // Wire ticket filtering and sorting
        this.wireTicketFiltering();
        
        // Wire ticket display updates
        this.wireTicketDisplayUpdates();
    }

    /**
     * Integrate toast system across all pages
     */
    wireToastSystem() {
        if (!this.toastSystem) return;

        // Override console methods to show toasts for important messages
        this.setupConsoleToastIntegration();
        
        // Set up form validation toast integration
        this.setupFormValidationToasts();
        
        // Set up authentication toast integration
        this.setupAuthToastIntegration();
        
        // Set up ticket operation toast integration
        this.setupTicketOperationToasts();
    }

    /**
     * Link dashboard statistics to ticket data
     */
    wireDashboardStatistics() {
        if (this.currentPage !== 'dashboard' || !this.ticketManager) return;

        // Enhanced statistics loading with real-time updates
        this.setupDashboardStatsIntegration();
        
        // Auto-refresh statistics when tickets change
        this.setupStatsAutoRefresh();
        
        // Wire dashboard action buttons
        this.setupDashboardActions();
    }

    /**
     * Set up cross-page navigation
     */
    wireNavigation() {
        // Enhanced navigation with authentication checks
        this.setupAuthenticatedNavigation();
        
        // Breadcrumb integration
        this.setupBreadcrumbIntegration();
        
        // Page transition handling
        this.setupPageTransitions();
    }

    /**
     * Initialize page-specific integrations
     */
    async initializePageSpecificIntegrations() {
        switch (this.currentPage) {
            case 'landing':
                await this.initializeLandingPageIntegration();
                break;
            case 'dashboard':
                await this.initializeDashboardIntegration();
                break;
            case 'tickets':
                await this.initializeTicketPageIntegration();
                break;
            case 'login':
            case 'signup':
                await this.initializeAuthPageIntegration();
                break;
        }
    }

    // Authentication Integration Methods

    /**
     * Setup enhanced login form integration
     */
    setupLoginFormIntegration(form) {
        const submitHandler = async (event) => {
            event.preventDefault();
            
            const formData = new FormData(form);
            const credentials = {
                username: formData.get('username')?.trim(),
                password: formData.get('password')
            };

            // Show loading state
            this.setFormLoadingState(form, true);

            try {
                const result = await this.authManager.login(credentials);
                
                if (result.success) {
                    this.toastSystem?.showSuccess('Login successful! Redirecting...');
                    
                    // Redirect after short delay for UX
                    setTimeout(() => {
                        const redirectUrl = sessionStorage.getItem('auth_redirect') || '/dashboard';
                        sessionStorage.removeItem('auth_redirect');
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    this.toastSystem?.showError(result.error || 'Login failed');
                    this.setFormLoadingState(form, false);
                }
            } catch (error) {
                this.toastSystem?.showError('Network error. Please try again.');
                this.setFormLoadingState(form, false);
            }
        };

        form.addEventListener('submit', submitHandler);
    }

    /**
     * Setup enhanced signup form integration
     */
    setupSignupFormIntegration(form) {
        const submitHandler = async (event) => {
            event.preventDefault();
            
            const formData = new FormData(form);
            const userData = {
                username: formData.get('username')?.trim(),
                email: formData.get('email')?.trim(),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            // Validate password confirmation
            if (userData.password !== userData.confirmPassword) {
                this.toastSystem?.showError('Passwords do not match');
                return;
            }

            this.setFormLoadingState(form, true);

            try {
                // For demo purposes, use login with email
                const result = await this.authManager.login({
                    username: userData.email,
                    password: userData.password
                });
                
                if (result.success) {
                    this.toastSystem?.showSuccess('Account created successfully! Redirecting...');
                    
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    this.toastSystem?.showError('Registration failed. Please try again.');
                    this.setFormLoadingState(form, false);
                }
            } catch (error) {
                this.toastSystem?.showError('Network error. Please try again.');
                this.setFormLoadingState(form, false);
            }
        };

        form.addEventListener('submit', submitHandler);
    }

    /**
     * Setup global logout functionality
     */
    setupGlobalLogout() {
        // Handle all logout buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('#logoutBtn, .logout-btn')) {
                event.preventDefault();
                this.handleLogout();
            }
        });
    }

    /**
     * Handle logout process
     */
    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            const result = this.authManager.logout();
            
            if (result.success) {
                this.toastSystem?.showSuccess('Logged out successfully');
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            } else {
                this.toastSystem?.showError('Logout failed');
            }
        }
    }

    /**
     * Setup authentication state monitoring
     */
    setupAuthStateMonitoring() {
        // Check authentication on page load for protected pages
        const protectedPages = ['dashboard', 'tickets'];
        
        if (protectedPages.includes(this.currentPage)) {
            if (!this.authManager.isAuthenticated()) {
                this.toastSystem?.showWarning('Please log in to access this page');
                this.authManager.redirectIfNotAuth(window.location.href);
                return;
            }
        }

        // Redirect authenticated users away from auth pages
        const authPages = ['login', 'signup'];
        if (authPages.includes(this.currentPage) && this.authManager.isAuthenticated()) {
            window.location.href = '/dashboard';
        }
    }

    // Ticket Management Integration Methods

    /**
     * Wire create ticket form
     */
    wireCreateTicketForm() {
        const createBtn = document.getElementById('createTicketBtn');
        const createFirstBtn = document.getElementById('createFirstTicketBtn');
        const modal = document.getElementById('createTicketModal');
        const form = document.getElementById('createTicketForm');

        // Show create modal
        [createBtn, createFirstBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showModal(modal);
                    this.resetForm(form);
                });
            }
        });

        // Handle form submission
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleCreateTicket(form, modal);
            });
        }

        // Handle modal close
        this.setupModalClose(modal);
    }

    /**
     * Wire edit ticket form
     */
    wireEditTicketForm() {
        const modal = document.getElementById('editTicketModal');
        const form = document.getElementById('editTicketForm');

        // Handle edit button clicks (delegated)
        document.addEventListener('click', async (event) => {
            if (event.target.matches('.edit-ticket-btn, .edit-btn')) {
                const ticketId = event.target.closest('[data-ticket-id]')?.getAttribute('data-ticket-id');
                if (ticketId) {
                    await this.showEditTicketModal(ticketId, modal, form);
                }
            }
        });

        // Handle form submission
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleEditTicket(form, modal);
            });
        }

        // Handle modal close
        this.setupModalClose(modal);
    }

    /**
     * Wire delete ticket confirmation
     */
    wireDeleteTicketConfirmation() {
        const modal = document.getElementById('deleteConfirmModal');

        // Handle delete button clicks (delegated)
        document.addEventListener('click', (event) => {
            if (event.target.matches('.delete-ticket-btn, .delete-btn')) {
                const ticketId = event.target.closest('[data-ticket-id]')?.getAttribute('data-ticket-id');
                if (ticketId) {
                    this.showDeleteConfirmation(ticketId, modal);
                }
            }
        });

        // Handle confirmation
        const confirmBtn = document.getElementById('confirmDeleteTicket');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                await this.handleDeleteTicket(modal);
            });
        }

        // Handle modal close
        this.setupModalClose(modal);
    }

    /**
     * Wire ticket filtering and sorting
     */
    wireTicketFiltering() {
        // Filter buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('.filter-btn')) {
                this.handleTicketFilter(event.target);
            }
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.handleTicketSort(sortSelect.value);
            });
        }
    }

    /**
     * Wire ticket display updates
     */
    wireTicketDisplayUpdates() {
        // Initial load
        this.refreshTicketDisplay();

        // Listen for storage changes (for multi-tab sync)
        window.addEventListener('storage', (event) => {
            if (event.key === 'tickets') {
                this.refreshTicketDisplay();
            }
        });
    }

    // Dashboard Integration Methods

    /**
     * Setup dashboard statistics integration
     */
    setupDashboardStatsIntegration() {
        // Enhanced statistics loading
        this.loadDashboardStatistics();

        // Refresh button
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboardStats(refreshBtn);
            });
        }
    }

    /**
     * Setup statistics auto-refresh
     */
    setupStatsAutoRefresh() {
        // Listen for ticket changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'tickets') {
                this.loadDashboardStatistics();
            }
        });

        // Periodic refresh
        setInterval(() => {
            this.loadDashboardStatistics();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Setup dashboard actions
     */
    setupDashboardActions() {
        console.log('Setting up dashboard actions...');
        
        // Create ticket button - redirect to tickets page
        const createBtn = document.getElementById('createTicketBtn');
        if (createBtn) {
            console.log('Found create ticket button');
            createBtn.addEventListener('click', () => {
                console.log('Create ticket button clicked');
                // Store a flag to open create modal on tickets page
                sessionStorage.setItem('openCreateModal', 'true');
                window.location.href = '/tickets';
            });
        } else {
            console.log('Create ticket button not found');
        }

        // Handle placeholder action cards (analytics, support)
        const analyticsCard = document.querySelector('a[href="/analytics"]');
        const supportCard = document.querySelector('a[href="/support"]');
        
        console.log('Analytics card:', analyticsCard);
        console.log('Support card:', supportCard);
        
        if (analyticsCard) {
            analyticsCard.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Analytics card clicked');
                if (this.toastSystem) {
                    this.toastSystem.showInfo('Analytics & Reports feature coming soon!');
                } else {
                    alert('Analytics & Reports feature coming soon!');
                }
            });
        }
        
        if (supportCard) {
            supportCard.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Support card clicked');
                if (this.toastSystem) {
                    this.toastSystem.showInfo('Help & Support feature coming soon!');
                } else {
                    alert('Help & Support feature coming soon!');
                }
            });
        }

        // Stat card navigation - let links work naturally
        // No need to intercept clicks, the href attributes will handle navigation
    }

    // Navigation Integration Methods

    /**
     * Setup authenticated navigation
     */
    setupAuthenticatedNavigation() {
        // Placeholder for authenticated navigation logic
        // This ensures protected pages require authentication
    }

    /**
     * Setup breadcrumb integration
     */
    setupBreadcrumbIntegration() {
        // Placeholder for breadcrumb logic
        // This would update breadcrumbs based on current page
    }

    /**
     * Setup page transitions
     */
    setupPageTransitions() {
        // Placeholder for page transition animations
        // This would add smooth transitions between pages
    }

    // Toast System Integration Methods

    /**
     * Setup console toast integration
     */
    setupConsoleToastIntegration() {
        // Override console.error to show error toasts
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            
            // Show toast for user-facing errors
            const message = args[0];
            if (typeof message === 'string' && !message.includes('Failed to load resource')) {
                this.toastSystem?.showError('An error occurred. Please try again.');
            }
        };
    }

    /**
     * Setup form validation toasts
     */
    setupFormValidationToasts() {
        // Listen for form validation events
        document.addEventListener('invalid', (event) => {
            event.preventDefault();
            const field = event.target;
            const message = field.validationMessage || 'Please check this field';
            this.toastSystem?.showWarning(message);
        }, true);
    }

    /**
     * Setup authentication toast integration
     */
    setupAuthToastIntegration() {
        // Show pending auth messages
        const authMessage = sessionStorage.getItem('auth_message');
        if (authMessage) {
            this.toastSystem?.showInfo(authMessage);
            sessionStorage.removeItem('auth_message');
        }
    }

    /**
     * Setup ticket operation toasts
     */
    setupTicketOperationToasts() {
        // This will be called by ticket operations
        window.showTicketToast = (type, message) => {
            switch (type) {
                case 'success':
                    this.toastSystem?.showSuccess(message);
                    break;
                case 'error':
                    this.toastSystem?.showError(message);
                    break;
                case 'warning':
                    this.toastSystem?.showWarning(message);
                    break;
                default:
                    this.toastSystem?.showInfo(message);
            }
        };
    }

    // Utility Methods

    /**
     * Detect current page
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.php') return 'landing';
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/tickets')) return 'tickets';
        if (path.includes('/auth/login')) return 'login';
        if (path.includes('/auth/signup')) return 'signup';
        
        // Check body classes or elements
        if (document.body.classList.contains('landing-page-body')) return 'landing';
        if (document.querySelector('.dashboard-container')) return 'dashboard';
        if (document.querySelector('#ticketContainer')) return 'tickets';
        if (document.querySelector('#loginForm')) return 'login';
        if (document.querySelector('#signupForm')) return 'signup';
        
        return 'unknown';
    }

    /**
     * Set form loading state
     */
    setFormLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea, select, button');
        
        if (isLoading) {
            inputs.forEach(input => input.disabled = true);
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'inline-flex';
            }
        } else {
            inputs.forEach(input => input.disabled = false);
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        }
    }

    /**
     * Show modal
     */
    showModal(modal) {
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide modal
     */
    hideModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * Setup modal close functionality
     */
    setupModalClose(modal) {
        if (!modal) return;

        // Close button
        const closeBtn = modal.querySelector('[id*="close"], .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal(modal));
        }

        // Cancel button
        const cancelBtn = modal.querySelector('[id*="cancel"], .cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal(modal));
        }

        // Click outside to close
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideModal(modal);
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideModal(modal);
            }
        });
    }

    /**
     * Reset form
     */
    resetForm(form) {
        if (form) {
            form.reset();
            // Clear any error states
            const errorElements = form.querySelectorAll('.error-message, .field-error');
            errorElements.forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.classList.remove('field-error', 'border-red-500');
            });
        }
    }

    /**
     * Handle integration errors
     */
    handleIntegrationError(error) {
        console.error('Integration error:', error);
        
        if (this.toastSystem) {
            this.toastSystem.showError('Some features may not work properly. Please refresh the page.');
        } else {
            // Fallback if toast system isn't available
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee;
                color: #c00;
                padding: 1rem;
                border-radius: 0.5rem;
                border: 1px solid #fcc;
                z-index: 10000;
            `;
            errorDiv.textContent = 'Some features may not work properly. Please refresh the page.';
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    }

    // Page-specific initialization methods will be added in the next part...

    // Page-specific Integration Methods

    /**
     * Initialize landing page integration
     */
    async initializeLandingPageIntegration() {
        // Enhanced CTA button interactions
        const ctaButtons = document.querySelectorAll('.cta-btn, .btn-primary');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                // Add ripple effect
                this.addRippleEffect(event.target, event);
            });
        });

        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * Initialize dashboard integration
     */
    async initializeDashboardIntegration() {
        // Load initial statistics
        this.loadDashboardStatistics();
        
        // Set up real-time updates
        this.setupDashboardRealTimeUpdates();
        
        // Initialize dashboard shortcuts
        this.setupDashboardShortcuts();
    }

    /**
     * Initialize ticket page integration
     */
    async initializeTicketPageIntegration() {
        // Load and display tickets
        this.refreshTicketDisplay();
        
        // Set up real-time character counters
        this.setupCharacterCounters();
        
        // Set up form validation
        this.setupTicketFormValidation();
        
        // Initialize keyboard shortcuts
        this.setupTicketKeyboardShortcuts();
        
        // Check if we should open create modal (from dashboard)
        if (sessionStorage.getItem('openCreateModal') === 'true') {
            sessionStorage.removeItem('openCreateModal');
            setTimeout(() => {
                const createBtn = document.getElementById('createTicketBtn');
                if (createBtn) {
                    createBtn.click();
                }
            }, 300);
        }
    }

    /**
     * Initialize auth page integration
     */
    async initializeAuthPageIntegration() {
        // Set up real-time validation
        this.setupAuthFormValidation();
        
        // Set up password visibility toggles
        this.setupPasswordToggles();
        
        // Show any pending messages
        this.showAuthMessages();
    }

    // Ticket Operation Methods

    /**
     * Handle create ticket
     */
    async handleCreateTicket(form, modal) {
        const formData = new FormData(form);
        const ticketData = {
            title: formData.get('title')?.trim(),
            description: formData.get('description')?.trim(),
            status: formData.get('status')
        };

        this.setFormLoadingState(form, true);

        try {
            const result = await this.ticketManager.createTicket(ticketData);
            
            if (result.success) {
                this.toastSystem?.showSuccess('Ticket created successfully!');
                this.hideModal(modal);
                this.refreshTicketDisplay();
                this.resetForm(form);
            } else {
                if (result.errors) {
                    this.displayFormErrors(form, result.errors);
                } else {
                    this.toastSystem?.showError(result.error || 'Failed to create ticket');
                }
            }
        } catch (error) {
            this.toastSystem?.showError('Failed to create ticket. Please try again.');
        } finally {
            this.setFormLoadingState(form, false);
        }
    }

    /**
     * Show edit ticket modal
     */
    async showEditTicketModal(ticketId, modal, form) {
        const ticket = this.ticketManager.getTicketById(ticketId);
        if (!ticket) {
            this.toastSystem?.showError('Ticket not found');
            return;
        }

        // Populate form
        form.querySelector('#editTicketId').value = ticket.id;
        form.querySelector('#editTitle').value = ticket.title;
        form.querySelector('#editDescription').value = ticket.description || '';
        form.querySelector('#editStatus').value = ticket.status;

        // Update character counters
        this.updateCharacterCounter('editTitle', ticket.title.length);
        this.updateCharacterCounter('editDescription', (ticket.description || '').length);

        // Update metadata display
        const createdDate = form.querySelector('#editCreatedDate');
        const updatedDate = form.querySelector('#editUpdatedDate');
        if (createdDate) createdDate.textContent = this.formatDate(ticket.createdAt);
        if (updatedDate) updatedDate.textContent = this.formatDate(ticket.updatedAt);

        this.showModal(modal);
    }

    /**
     * Handle edit ticket
     */
    async handleEditTicket(form, modal) {
        const formData = new FormData(form);
        const ticketId = formData.get('id');
        const updates = {
            title: formData.get('title')?.trim(),
            description: formData.get('description')?.trim(),
            status: formData.get('status')
        };

        this.setFormLoadingState(form, true);

        try {
            const result = await this.ticketManager.updateTicket(ticketId, updates);
            
            if (result.success) {
                this.toastSystem?.showSuccess('Ticket updated successfully!');
                this.hideModal(modal);
                this.refreshTicketDisplay();
            } else {
                if (result.errors) {
                    this.displayFormErrors(form, result.errors);
                } else {
                    this.toastSystem?.showError(result.error || 'Failed to update ticket');
                }
            }
        } catch (error) {
            this.toastSystem?.showError('Failed to update ticket. Please try again.');
        } finally {
            this.setFormLoadingState(form, false);
        }
    }

    /**
     * Show delete confirmation
     */
    showDeleteConfirmation(ticketId, modal) {
        const ticket = this.ticketManager.getTicketById(ticketId);
        if (!ticket) {
            this.toastSystem?.showError('Ticket not found');
            return;
        }

        // Update modal content
        const titleElement = modal.querySelector('#deleteTicketTitle');
        const statusElement = modal.querySelector('#deleteTicketStatus');
        
        if (titleElement) titleElement.textContent = ticket.title;
        if (statusElement) statusElement.textContent = `Status: ${ticket.status}`;

        // Store ticket ID for deletion
        modal.setAttribute('data-delete-ticket-id', ticketId);

        this.showModal(modal);
    }

    /**
     * Handle delete ticket
     */
    async handleDeleteTicket(modal) {
        const ticketId = modal.getAttribute('data-delete-ticket-id');
        if (!ticketId) return;

        try {
            const result = await this.ticketManager.deleteTicket(ticketId, true);
            
            if (result.success) {
                this.toastSystem?.showSuccess('Ticket deleted successfully!');
                this.hideModal(modal);
                this.refreshTicketDisplay();
            } else {
                this.toastSystem?.showError(result.error || 'Failed to delete ticket');
            }
        } catch (error) {
            this.toastSystem?.showError('Failed to delete ticket. Please try again.');
        }
    }

    /**
     * Handle ticket filter
     */
    handleTicketFilter(filterBtn) {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        filterBtn.classList.add('active');

        // Apply filter
        const status = filterBtn.getAttribute('data-status');
        this.applyTicketFilter(status);
    }

    /**
     * Apply ticket filter
     */
    applyTicketFilter(status) {
        let tickets = this.ticketManager.getTickets();
        
        if (status !== 'all') {
            tickets = tickets.filter(ticket => ticket.status === status);
        }
        
        this.renderTickets(tickets);
    }

    /**
     * Handle ticket sort
     */
    handleTicketSort(sortBy) {
        let tickets = this.ticketManager.getTickets();
        
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
        
        this.renderTickets(tickets);
    }

    /**
     * Refresh ticket display
     */
    refreshTicketDisplay() {
        if (this.currentPage === 'tickets' && this.ticketManager) {
            const tickets = this.ticketManager.getTickets();
            this.renderTickets(tickets);
        }
    }

    /**
     * Render tickets using enhanced template
     */
    renderTickets(tickets) {
        const container = document.getElementById('ticketContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Show empty state if no tickets
        if (tickets.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.classList.add('hidden');
        }

        // Render tickets
        tickets.forEach(ticket => {
            const ticketElement = this.createTicketElement(ticket);
            container.appendChild(ticketElement);
        });
    }

    /**
     * Create ticket element
     */
    createTicketElement(ticket) {
        const template = document.getElementById('ticketCardTemplate');
        if (!template) {
            // Fallback if template not found
            return this.createTicketElementFallback(ticket);
        }

        const element = template.content.cloneNode(true);
        const card = element.querySelector('.ticket-card');
        
        // Set ticket ID
        card.setAttribute('data-ticket-id', ticket.id);
        
        // Populate content
        element.querySelector('.ticket-title').textContent = ticket.title;
        element.querySelector('.ticket-description').textContent = ticket.description || 'No description';
        element.querySelector('.status-text').textContent = ticket.status;
        element.querySelector('.created-date').textContent = this.formatDate(ticket.createdAt);
        element.querySelector('.updated-date').textContent = this.formatDate(ticket.updatedAt);
        
        // Set status classes
        const statusBadge = element.querySelector('.ticket-status-badge');
        const statusIndicator = element.querySelector('.status-indicator');
        const statusClass = this.getStatusClass(ticket.status);
        
        statusBadge.className = `ticket-status-badge px-3 py-1 rounded-full text-sm font-medium ${statusClass}`;
        statusIndicator.className = `status-indicator w-2 h-2 rounded-full inline-block mr-2 ${this.getStatusIndicatorClass(ticket.status)}`;
        
        // Set up event listeners
        const editBtn = element.querySelector('.edit-ticket-btn');
        const deleteBtn = element.querySelector('.delete-ticket-btn');
        
        if (editBtn) editBtn.setAttribute('data-ticket-id', ticket.id);
        if (deleteBtn) deleteBtn.setAttribute('data-ticket-id', ticket.id);

        return element;
    }

    /**
     * Create ticket element fallback
     */
    createTicketElementFallback(ticket) {
        const card = document.createElement('div');
        card.className = 'ticket-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200';
        card.setAttribute('data-ticket-id', ticket.id);
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 truncate">${this.escapeHtml(ticket.title)}</h3>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusClass(ticket.status)}">
                            <span class="w-2 h-2 rounded-full inline-block mr-2 ${this.getStatusIndicatorClass(ticket.status)}"></span>
                            ${ticket.status}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm line-clamp-2">${this.escapeHtml(ticket.description || 'No description')}</p>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button class="edit-ticket-btn text-gray-400 hover:text-blue-600 transition-colors duration-200" data-ticket-id="${ticket.id}" title="Edit ticket">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-ticket-btn text-gray-400 hover:text-red-600 transition-colors duration-200" data-ticket-id="${ticket.id}" title="Delete ticket">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Created: ${this.formatDate(ticket.createdAt)}</span>
                <span>Updated: ${this.formatDate(ticket.updatedAt)}</span>
            </div>
        `;
        
        return card;
    }

    // Dashboard Methods

    /**
     * Load dashboard statistics
     */
    loadDashboardStatistics() {
        if (this.currentPage !== 'dashboard' || !this.ticketManager) return;

        try {
            const stats = this.ticketManager.getTicketStats();
            
            // Animate counters
            this.animateCounter('openCount', stats.open);
            this.animateCounter('progressCount', stats.inProgress);
            this.animateCounter('closedCount', stats.closed);
            
            // Update card states
            this.updateStatCardStates(stats);
            
            // Update timestamp
            this.updateLastUpdatedTime();
            
        } catch (error) {
            console.error('Error loading dashboard statistics:', error);
            this.toastSystem?.showError('Failed to load statistics');
        }
    }

    /**
     * Refresh dashboard stats with loading indicator
     */
    refreshDashboardStats(refreshBtn) {
        refreshBtn.classList.add('refreshing');
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            this.loadDashboardStatistics();
            refreshBtn.classList.remove('refreshing');
            refreshBtn.disabled = false;
            this.toastSystem?.showSuccess('Statistics refreshed');
        }, 500);
    }

    /**
     * Animate counter
     */
    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = targetValue;
            }
        };
        
        requestAnimationFrame(updateCount);
    }

    /**
     * Update stat card states
     */
    updateStatCardStates(stats) {
        const cards = {
            open: document.querySelector('.stat-card-open'),
            progress: document.querySelector('.stat-card-progress'),
            closed: document.querySelector('.stat-card-closed')
        };
        
        Object.keys(cards).forEach(key => {
            const card = cards[key];
            const count = key === 'progress' ? stats.inProgress : stats[key];
            
            if (card) {
                card.classList.toggle('has-tickets', count > 0);
            }
        });
    }

    /**
     * Update last updated time
     */
    updateLastUpdatedTime() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            const span = element.querySelector('span');
            if (span) {
                span.textContent = `Updated at ${timeString}`;
            }
        }
    }

    /**
     * Setup dashboard real-time updates
     */
    setupDashboardRealTimeUpdates() {
        // Listen for ticket changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'tickets') {
                this.loadDashboardStatistics();
            }
        });
    }

    /**
     * Setup dashboard shortcuts
     */
    setupDashboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'n':
                        event.preventDefault();
                        window.location.href = '/tickets';
                        break;
                    case 'r':
                        event.preventDefault();
                        this.loadDashboardStatistics();
                        break;
                }
            }
        });
    }

    // Form Enhancement Methods

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        const fields = [
            { input: '#createTitle', counter: '#createTitleCount', max: 100 },
            { input: '#createDescription', counter: '#createDescriptionCount', max: 500 },
            { input: '#editTitle', counter: '#editTitleCount', max: 100 },
            { input: '#editDescription', counter: '#editDescriptionCount', max: 500 }
        ];

        fields.forEach(field => {
            const input = document.querySelector(field.input);
            const counter = document.querySelector(field.counter);
            
            if (input && counter) {
                input.addEventListener('input', () => {
                    this.updateCharacterCounter(field.input.substring(1), input.value.length, field.max);
                });
            }
        });
    }

    /**
     * Update character counter
     */
    updateCharacterCounter(fieldName, currentLength, maxLength = null) {
        const counter = document.getElementById(`${fieldName}Count`);
        if (!counter) return;
        
        counter.textContent = currentLength;
        
        if (maxLength) {
            const percentage = (currentLength / maxLength) * 100;
            
            counter.classList.remove('char-limit-warning', 'char-limit-exceeded');
            
            if (percentage >= 100) {
                counter.classList.add('char-limit-exceeded');
            } else if (percentage >= 80) {
                counter.classList.add('char-limit-warning');
            }
        }
    }

    /**
     * Setup ticket form validation
     */
    setupTicketFormValidation() {
        const forms = ['#createTicketForm', '#editTicketForm'];
        
        forms.forEach(formSelector => {
            const form = document.querySelector(formSelector);
            if (!form) return;
            
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    /**
     * Setup auth form validation
     */
    setupAuthFormValidation() {
        const forms = ['#loginForm', '#signupForm'];
        
        forms.forEach(formSelector => {
            const form = document.querySelector(formSelector);
            if (!form) return;
            
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateAuthField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    /**
     * Setup password toggles
     */
    setupPasswordToggles() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            if (field.parentNode.querySelector('.password-toggle')) return; // Already set up
            
            const wrapper = document.createElement('div');
            wrapper.className = 'relative';
            
            field.parentNode.insertBefore(wrapper, field);
            wrapper.appendChild(field);
            
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600';
            toggleBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
            `;
            
            toggleBtn.addEventListener('click', () => {
                const isPassword = field.type === 'password';
                field.type = isPassword ? 'text' : 'password';
                
                toggleBtn.innerHTML = isPassword ? `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                ` : `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                `;
            });
            
            wrapper.appendChild(toggleBtn);
        });
    }

    /**
     * Setup ticket keyboard shortcuts
     */
    setupTicketKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'n':
                        event.preventDefault();
                        const createBtn = document.getElementById('createTicketBtn');
                        if (createBtn) createBtn.click();
                        break;
                    case 'r':
                        event.preventDefault();
                        this.refreshTicketDisplay();
                        break;
                }
            }
        });
    }

    // Utility Methods

    /**
     * Validate field
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'title':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Title is required';
                } else if (value.length > 100) {
                    isValid = false;
                    errorMessage = 'Title must be less than 100 characters';
                }
                break;
            case 'description':
                if (value.length > 500) {
                    isValid = false;
                    errorMessage = 'Description must be less than 500 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Validate auth field
     */
    validateAuthField(field) {
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
        field.classList.add('field-error', 'border-red-500');
        
        const errorId = `${field.name}Error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = field.parentNode.querySelector('.error-message, .field-error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            errorElement.classList.add('show');
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('field-error', 'border-red-500');
        
        const errorId = `${field.name}Error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = field.parentNode.querySelector('.error-message, .field-error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
            errorElement.classList.remove('show');
        }
    }

    /**
     * Display form errors
     */
    displayFormErrors(form, errors) {
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, errors[fieldName]);
            }
        });
    }

    /**
     * Show auth messages
     */
    showAuthMessages() {
        const message = sessionStorage.getItem('auth_message');
        if (message) {
            this.toastSystem?.showInfo(message);
            sessionStorage.removeItem('auth_message');
        }
    }

    /**
     * Add ripple effect
     */
    addRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
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
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Get status class
     */
    getStatusClass(status) {
        const classes = {
            'Open': 'bg-green-100 text-green-800',
            'In Progress': 'bg-amber-100 text-amber-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Get status indicator class
     */
    getStatusIndicatorClass(status) {
        const classes = {
            'Open': 'bg-green-500',
            'In Progress': 'bg-amber-500',
            'Closed': 'bg-gray-500'
        };
        return classes[status] || 'bg-gray-500';
    }

    /**
     * Format date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize integration when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const appIntegration = new AppIntegration();
    await appIntegration.init();
    
    // Make available globally for debugging
    window.appIntegration = appIntegration;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppIntegration;
}