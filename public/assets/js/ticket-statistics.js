/**
 * TicketStatisticsCalculator - Calculates and displays ticket statistics for the dashboard
 * Handles counting tickets by status and updating DOM elements
 * Optimized for performance with caching and efficient DOM operations
 */
class TicketStatisticsCalculator {
    constructor() {
        this.storageKey = 'tickets';
        this.cachedStats = null;
        this.cachedTickets = null;
        this.lastCalculationTime = 0;
        this.cacheTimeout = 1000; // Cache for 1 second to avoid redundant calculations
    }

    /**
     * Calculate ticket statistics by status with caching for performance
     * @param {boolean} forceRefresh - Force recalculation even if cached
     * @returns {Object} Statistics object with counts by status
     */
    calculateStatistics(forceRefresh = false) {
        const now = Date.now();
        
        // Return cached stats if available and not expired
        if (!forceRefresh && this.cachedStats && (now - this.lastCalculationTime) < this.cacheTimeout) {
            return this.cachedStats;
        }
        
        const tickets = this.getTickets();
        
        // Optimize counting with a single pass through the array
        const stats = {
            total: tickets.length,
            open: 0,
            inProgress: 0,
            closed: 0
        };
        
        // Single iteration instead of multiple filter operations
        for (let i = 0; i < tickets.length; i++) {
            const status = tickets[i].status;
            if (status === 'Open') {
                stats.open++;
            } else if (status === 'In Progress') {
                stats.inProgress++;
            } else if (status === 'Closed') {
                stats.closed++;
            }
        }
        
        // Cache the results
        this.cachedStats = stats;
        this.lastCalculationTime = now;
        
        return stats;
    }
    
    /**
     * Invalidate the cache to force fresh calculation
     */
    invalidateCache() {
        this.cachedStats = null;
        this.cachedTickets = null;
        this.lastCalculationTime = 0;
    }

    /**
     * Retrieve tickets from localStorage with error handling
     * @returns {Array} Array of ticket objects or empty array on error
     */
    getTickets() {
        try {
            // Check if localStorage is available
            if (typeof localStorage === 'undefined') {
                console.warn('localStorage is not available');
                return [];
            }

            // Attempt to read from localStorage
            const data = localStorage.getItem(this.storageKey);
            
            // Handle empty or null data
            if (!data || data === 'null' || data === 'undefined') {
                return [];
            }

            // Parse JSON with error handling
            let tickets;
            try {
                tickets = JSON.parse(data);
            } catch (parseError) {
                console.error('JSON parsing error for tickets data:', parseError);
                // Attempt to clear corrupted data
                try {
                    localStorage.removeItem(this.storageKey);
                } catch (clearError) {
                    console.error('Failed to clear corrupted data:', clearError);
                }
                return [];
            }
            
            // Validate that we got an array
            if (!Array.isArray(tickets)) {
                console.error('Invalid tickets data format in localStorage - expected array, got:', typeof tickets);
                return [];
            }

            return tickets;

        } catch (error) {
            // Handle various localStorage errors
            if (error.name === 'SecurityError') {
                console.error('localStorage access denied due to security settings:', error);
            } else if (error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded:', error);
            } else {
                console.error('Unexpected error reading tickets from localStorage:', error);
            }
            
            // Always return empty array as fallback
            return [];
        }
    }

    /**
     * Update statistics display in the DOM with smooth transitions
     * Optimized with batched DOM operations to minimize reflows
     * @param {Object} stats - Statistics object with counts
     */
    updateStatisticsDisplay(stats) {
        // Batch DOM reads and writes to minimize layout thrashing
        // Use DocumentFragment for efficient updates
        const updates = [
            { id: 'totalCount', value: stats.total },
            { id: 'openCount', value: stats.open },
            { id: 'inProgressCount', value: stats.inProgress },
            { id: 'closedCount', value: stats.closed }
        ];
        
        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
            // Perform all DOM updates in a single batch
            updates.forEach(update => {
                const element = document.getElementById(update.id);
                if (element) {
                    element.textContent = update.value;
                }
            });
            
            // Remove loading state and add loaded state with smooth transition
            this.transitionToLoadedState();
        });
    }

    /**
     * Transition from loading to loaded state with smooth animations
     * Optimized to minimize DOM operations and reflows
     */
    transitionToLoadedState() {
        // Use requestAnimationFrame for smooth animation timing
        requestAnimationFrame(() => {
            // Get all stat cards once
            const statCards = document.querySelectorAll('.stat-card');
            
            // Batch class operations
            statCards.forEach((card, index) => {
                // Remove loading class and aria-busy in one operation
                card.classList.remove('loading');
                card.removeAttribute('aria-busy');
                
                // Add loaded class for fade-in animation
                card.classList.add('loaded');
                
                // Schedule cleanup after animation completes
                // Use single timeout per card instead of nested operations
                const cleanupDelay = 300 + (index * 50);
                setTimeout(() => {
                    card.classList.remove('loaded');
                }, cleanupDelay);
            });

            // Handle quick actions section
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.classList.remove('loading');
                quickActions.removeAttribute('aria-busy');
                quickActions.classList.add('loaded');
                
                // Clean up after animation
                setTimeout(() => {
                    quickActions.classList.remove('loaded');
                }, 500);
            }
        });
    }

    /**
     * Show loading state for statistics cards
     */
    showLoadingState() {
        // Batch DOM operations for better performance
        requestAnimationFrame(() => {
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.classList.add('loading');
                card.setAttribute('aria-busy', 'true');
            });

            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.classList.add('loading');
                quickActions.setAttribute('aria-busy', 'true');
            }
        });
    }
    
    /**
     * Preload tickets data for faster initial render
     * This can be called early in the page lifecycle
     */
    preloadTickets() {
        // Trigger a read from localStorage to warm up the cache
        this.getTickets();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TicketStatisticsCalculator };
}
