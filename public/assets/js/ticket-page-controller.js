/**
 * TicketPageController - Orchestrates ticket dashboard page initialization and interactions
 * Handles authentication, statistics display, username greeting, and action button navigation
 */
class TicketPageController {
    constructor() {
        this.authManager = new AuthManager();
        this.statsCalculator = new TicketStatisticsCalculator();
        this.ticketManager = null; // Will be initialized if needed
        this.refreshTimeout = null;
    }

    /**
     * Initialize the ticket page
     * Orchestrates authentication check, username display, statistics refresh, and event listeners
     * Optimized for performance with lazy loading and efficient initialization
     */
    init() {
        // Check authentication and redirect if not authenticated
        if (!this.authManager.isAuthenticated()) {
            window.location.href = '/auth/login';
            return;
        }

        // Preload tickets data early for better performance
        this.statsCalculator.preloadTickets();

        // Display personalized username greeting (synchronous, fast)
        this.displayUsername();

        // Attach event listeners early (before statistics load)
        // This makes the page feel more responsive
        this.attachEventListeners();
        
        // Set up global ticket change listeners for statistics refresh
        this.setupTicketChangeListeners();

        // Calculate and display ticket statistics (async, lazy loaded)
        this.refreshStatistics();
    }

    /**
     * Display username in the welcome message
     * Retrieves user session from localStorage and updates the greeting
     */
    displayUsername() {
        try {
            // Get current user session
            const session = this.authManager.getSession();
            
            // Extract username with fallback
            const username = session?.user?.username || 'User';
            
            // Update username in the DOM
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = username;
            }
        } catch (error) {
            console.error('Error displaying username:', error);
            // Fallback to default username on error
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = 'User';
            }
        }
    }

    /**
     * Refresh ticket statistics with lazy loading and debouncing
     * Calculates current ticket counts asynchronously and updates the display
     * Debounced to prevent excessive recalculations
     * @param {boolean} forceRefresh - Force immediate refresh without debouncing
     */
    refreshStatistics(forceRefresh = false) {
        // Clear any pending refresh
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        
        // If force refresh, execute immediately
        if (forceRefresh) {
            this.executeStatisticsRefresh(true);
            return;
        }
        
        // Use requestAnimationFrame for better performance
        // This defers the calculation until the browser is ready to paint
        requestAnimationFrame(() => {
            // Wrap in setTimeout to make it truly async and non-blocking
            this.refreshTimeout = setTimeout(() => {
                this.executeStatisticsRefresh(false);
            }, 0);
        });
    }
    
    /**
     * Execute the actual statistics refresh
     * @param {boolean} forceRefresh - Force recalculation even if cached
     * @private
     */
    executeStatisticsRefresh(forceRefresh) {
        try {
            // Calculate statistics from localStorage
            const stats = this.statsCalculator.calculateStatistics(forceRefresh);
            
            // Update statistics display in DOM with smooth transition
            this.statsCalculator.updateStatisticsDisplay(stats);
        } catch (error) {
            console.error('Error refreshing statistics:', error);
            // Display zeros on error and remove loading state
            this.statsCalculator.updateStatisticsDisplay({
                total: 0,
                open: 0,
                inProgress: 0,
                closed: 0
            });
        }
    }

    /**
     * Attach event listeners to action buttons
     * Sets up click handlers for Create New Ticket and View All Tickets buttons
     */
    attachEventListeners() {
        // Attach click handler to "Create New Ticket" button
        const createTicketBtn = document.getElementById('createTicketBtn');
        if (createTicketBtn) {
            createTicketBtn.addEventListener('click', () => this.handleCreateTicket());
            this.addKeyboardSupport(createTicketBtn, () => this.handleCreateTicket());
        }

        // Attach click handler to "View All Tickets" button
        const viewAllTicketsBtn = document.getElementById('viewAllTicketsBtn');
        if (viewAllTicketsBtn) {
            viewAllTicketsBtn.addEventListener('click', () => this.handleViewAllTickets());
            this.addKeyboardSupport(viewAllTicketsBtn, () => this.handleViewAllTickets());
        }
    }

    /**
     * Add keyboard navigation support to an element
     * Handles Enter and Space key presses for accessibility
     * @param {HTMLElement} element - The element to add keyboard support to
     * @param {Function} callback - The function to call when Enter or Space is pressed
     */
    addKeyboardSupport(element, callback) {
        element.addEventListener('keydown', (event) => {
            // Handle Enter key (key code 13) or Space key (key code 32)
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); // Prevent default space scrolling
                callback();
            }
        });
    }

    /**
     * Handle Create New Ticket button click
     * Navigates to the full tickets page where users can create tickets
     */
    handleCreateTicket() {
        // Navigate to tickets list page where ticket creation is available
        window.location.href = '/tickets/list';
    }

    /**
     * Handle View All Tickets button click
     * Navigates to ticket list page with full ticket management interface
     */
    handleViewAllTickets() {
        window.location.href = '/tickets/list';
    }

    /**
     * Set up global event listeners for ticket changes
     * Listens for custom events dispatched by TicketManager
     * @private
     */
    setupTicketChangeListeners() {
        // Listen for ticket created event
        window.addEventListener('ticketCreated', () => {
            this.refreshStatisticsPublic(true);
        });
        
        // Listen for ticket updated event
        window.addEventListener('ticketUpdated', () => {
            this.refreshStatisticsPublic(true);
        });
        
        // Listen for ticket deleted event
        window.addEventListener('ticketDeleted', () => {
            this.refreshStatisticsPublic(true);
        });
        
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key === 'tickets') {
                this.refreshStatisticsPublic(true);
            }
        });
    }
    
    /**
     * Public method to refresh statistics from external code
     * Useful after ticket creation, update, or deletion
     * @param {boolean} forceRefresh - Force immediate refresh bypassing cache
     */
    refreshStatisticsPublic(forceRefresh = true) {
        // Invalidate cache to ensure fresh data
        if (forceRefresh) {
            this.statsCalculator.invalidateCache();
        }
        this.refreshStatistics(forceRefresh);
    }
}

// Initialize controller when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const controller = new TicketPageController();
        controller.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TicketPageController };
}
