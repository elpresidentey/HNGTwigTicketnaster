/**
 * TicketManager - Handles CRUD operations for ticket management
 * Provides create, read, update, delete functionality with localStorage persistence
 */
class TicketManager {
    constructor() {
        this.storageKey = 'tickets';
        this.authManager = new AuthManager();
        this.currentTickets = [];
        this.editingTicketId = null;
    }

    /**
     * Create a new ticket with validation and storage
     * @param {Object} ticketData - Ticket data to create
     * @param {string} ticketData.title - Ticket title (required)
     * @param {string} ticketData.description - Ticket description (optional)
     * @param {string} ticketData.status - Ticket status (default: 'Open')
     * @returns {Object} Creation result
     */
    async createTicket(ticketData) {
        try {
            // Validate user authentication
            if (!this.authManager.isAuthenticated()) {
                throw new Error('User must be authenticated to create tickets');
            }

            // Validate ticket data
            const validation = this.validateTicketData(ticketData);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    message: 'Validation failed'
                };
            }

            // Create new ticket object
            const newTicket = {
                id: this.generateTicketId(),
                title: ticketData.title.trim(),
                description: ticketData.description ? ticketData.description.trim() : '',
                status: ticketData.status || 'Open',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                userId: this.authManager.getCurrentUser().id
            };

            // Get existing tickets
            const tickets = this.getTickets();
            
            // Add new ticket
            tickets.push(newTicket);
            
            // Save to localStorage
            this.saveTickets(tickets);
            
            // Update current tickets cache
            this.currentTickets = tickets;
            
            // Dispatch custom event for ticket creation
            this.dispatchTicketEvent('ticketCreated', newTicket);

            return {
                success: true,
                ticket: newTicket,
                message: 'Ticket created successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create ticket'
            };
        }
    }

    /**
     * Retrieve all stored tickets for the current user
     * @returns {Array} Array of ticket objects
     */
    getTickets() {
        try {
            // Check authentication
            if (!this.authManager.isAuthenticated()) {
                return [];
            }

            const currentUser = this.authManager.getCurrentUser();
            if (!currentUser) {
                return [];
            }

            // Get tickets from localStorage
            const storedTickets = localStorage.getItem(this.storageKey);
            if (!storedTickets) {
                return [];
            }

            const allTickets = JSON.parse(storedTickets);
            
            // Filter tickets for current user
            const userTickets = allTickets.filter(ticket => ticket.userId === currentUser.id);
            
            // Sort by creation date (newest first)
            userTickets.sort((a, b) => b.createdAt - a.createdAt);
            
            // Update cache
            this.currentTickets = userTickets;
            
            return userTickets;

        } catch (error) {
            console.error('Error retrieving tickets:', error);
            return [];
        }
    }

    /**
     * Update an existing ticket
     * @param {string} ticketId - ID of ticket to update
     * @param {Object} updates - Updates to apply
     * @returns {Object} Update result
     */
    async updateTicket(ticketId, updates) {
        try {
            // Validate authentication
            if (!this.authManager.isAuthenticated()) {
                throw new Error('User must be authenticated to update tickets');
            }

            // Get all tickets
            const allTickets = this.getAllTicketsFromStorage();
            const ticketIndex = allTickets.findIndex(ticket => ticket.id === ticketId);
            
            if (ticketIndex === -1) {
                throw new Error('Ticket not found');
            }

            const currentUser = this.authManager.getCurrentUser();
            const ticket = allTickets[ticketIndex];
            
            // Verify ownership
            if (ticket.userId !== currentUser.id) {
                throw new Error('Not authorized to update this ticket');
            }

            // Validate update data
            const validation = this.validateTicketData(updates, true);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    message: 'Validation failed'
                };
            }

            // Apply updates
            const updatedTicket = {
                ...ticket,
                ...updates,
                updatedAt: Date.now()
            };

            // Ensure required fields are not empty
            if (updates.title !== undefined) {
                updatedTicket.title = updates.title.trim();
            }
            if (updates.description !== undefined) {
                updatedTicket.description = updates.description.trim();
            }

            // Update ticket in array
            allTickets[ticketIndex] = updatedTicket;
            
            // Save to localStorage
            this.saveAllTickets(allTickets);
            
            // Update current tickets cache
            this.currentTickets = this.getTickets();
            
            // Dispatch custom event for ticket update
            this.dispatchTicketEvent('ticketUpdated', updatedTicket);

            return {
                success: true,
                ticket: updatedTicket,
                message: 'Ticket updated successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update ticket'
            };
        }
    }

    /**
     * Delete a ticket with confirmation handling
     * @param {string} ticketId - ID of ticket to delete
     * @param {boolean} confirmed - Whether deletion is confirmed
     * @returns {Object} Deletion result
     */
    async deleteTicket(ticketId, confirmed = false) {
        try {
            // Validate authentication
            if (!this.authManager.isAuthenticated()) {
                throw new Error('User must be authenticated to delete tickets');
            }

            // Get all tickets
            const allTickets = this.getAllTicketsFromStorage();
            const ticketIndex = allTickets.findIndex(ticket => ticket.id === ticketId);
            
            if (ticketIndex === -1) {
                throw new Error('Ticket not found');
            }

            const currentUser = this.authManager.getCurrentUser();
            const ticket = allTickets[ticketIndex];
            
            // Verify ownership
            if (ticket.userId !== currentUser.id) {
                throw new Error('Not authorized to delete this ticket');
            }

            // If not confirmed, return confirmation request
            if (!confirmed) {
                return {
                    success: false,
                    requiresConfirmation: true,
                    ticket: ticket,
                    message: `Are you sure you want to delete "${ticket.title}"?`
                };
            }

            // Remove ticket from array
            allTickets.splice(ticketIndex, 1);
            
            // Save to localStorage
            this.saveAllTickets(allTickets);
            
            // Update current tickets cache
            this.currentTickets = this.getTickets();
            
            // Dispatch custom event for ticket deletion
            this.dispatchTicketEvent('ticketDeleted', ticket);

            return {
                success: true,
                deletedTicket: ticket,
                message: 'Ticket deleted successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete ticket'
            };
        }
    }

    /**
     * Get ticket by ID
     * @param {string} ticketId - Ticket ID
     * @returns {Object|null} Ticket object or null if not found
     */
    getTicketById(ticketId) {
        const tickets = this.getTickets();
        return tickets.find(ticket => ticket.id === ticketId) || null;
    }

    /**
     * Get tickets by status
     * @param {string} status - Status to filter by
     * @returns {Array} Filtered tickets
     */
    getTicketsByStatus(status) {
        const tickets = this.getTickets();
        return tickets.filter(ticket => ticket.status === status);
    }

    /**
     * Get ticket statistics
     * @returns {Object} Statistics object
     */
    getTicketStats() {
        const tickets = this.getTickets();
        
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'Open').length,
            inProgress: tickets.filter(t => t.status === 'In Progress').length,
            closed: tickets.filter(t => t.status === 'Closed').length
        };
    }

    // UI Rendering Methods

    /**
     * Render tickets in the ticket container
     * @param {string} containerId - ID of container element
     * @param {Array} tickets - Tickets to render (optional, uses current tickets if not provided)
     */
    renderTickets(containerId = 'ticketContainer', tickets = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }

        const ticketsToRender = tickets || this.getTickets();

        // Clear container
        container.innerHTML = '';

        // Handle empty state
        if (ticketsToRender.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // Create tickets grid
        const ticketsGrid = document.createElement('div');
        ticketsGrid.className = 'tickets-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3';

        // Render each ticket
        ticketsToRender.forEach(ticket => {
            const ticketCard = this.createTicketCard(ticket);
            ticketsGrid.appendChild(ticketCard);
        });

        container.appendChild(ticketsGrid);
    }

    /**
     * Show create ticket form
     * @param {string} modalId - ID of modal container
     */
    showCreateForm(modalId = 'ticketModal') {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found`);
            return;
        }

        // Reset editing state
        this.editingTicketId = null;

        // Set modal content
        modal.innerHTML = this.createTicketFormHTML('Create New Ticket', {
            title: '',
            description: '',
            status: 'Open'
        });

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Focus on title field
        const titleField = modal.querySelector('#ticketTitle');
        if (titleField) {
            titleField.focus();
        }

        // Bind form events
        this.bindFormEvents(modal);
    }

    /**
     * Show edit ticket form
     * @param {string} ticketId - ID of ticket to edit
     * @param {string} modalId - ID of modal container
     */
    showEditForm(ticketId, modalId = 'ticketModal') {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found`);
            return;
        }

        const ticket = this.getTicketById(ticketId);
        if (!ticket) {
            console.error(`Ticket with ID '${ticketId}' not found`);
            return;
        }

        // Set editing state
        this.editingTicketId = ticketId;

        // Set modal content
        modal.innerHTML = this.createTicketFormHTML('Edit Ticket', ticket);

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Focus on title field
        const titleField = modal.querySelector('#ticketTitle');
        if (titleField) {
            titleField.focus();
        }

        // Bind form events
        this.bindFormEvents(modal);
    }

    /**
     * Show delete confirmation dialog
     * @param {string} ticketId - ID of ticket to delete
     * @param {string} modalId - ID of modal container
     */
    showDeleteConfirmation(ticketId, modalId = 'confirmModal') {
        const ticket = this.getTicketById(ticketId);
        if (!ticket) {
            console.error(`Ticket with ID '${ticketId}' not found`);
            return;
        }

        let modal = document.getElementById(modalId);
        if (!modal) {
            // Create confirmation modal if it doesn't exist
            modal = this.createConfirmationModal(modalId);
            document.body.appendChild(modal);
        }

        // Set modal content
        modal.innerHTML = this.createDeleteConfirmationHTML(ticket);

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Bind confirmation events
        this.bindConfirmationEvents(modal, ticketId);
    }

    /**
     * Hide modal
     * @param {string} modalId - ID of modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // Private helper methods

    /**
     * Validate ticket data
     * @param {Object} ticketData - Data to validate
     * @param {boolean} isUpdate - Whether this is an update operation
     * @returns {Object} Validation result
     */
    validateTicketData(ticketData, isUpdate = false) {
        const errors = {};

        // Title validation
        if (!isUpdate || ticketData.title !== undefined) {
            if (!ticketData.title || ticketData.title.trim() === '') {
                errors.title = 'Title is required';
            } else if (ticketData.title.trim().length > 100) {
                errors.title = 'Title must be less than 100 characters';
            }
        }

        // Status validation
        if (!isUpdate || ticketData.status !== undefined) {
            const validStatuses = ['Open', 'In Progress', 'Closed'];
            if (ticketData.status && !validStatuses.includes(ticketData.status)) {
                errors.status = 'Status must be one of: Open, In Progress, Closed';
            }
        }

        // Description validation
        if (ticketData.description !== undefined && ticketData.description !== null) {
            if (ticketData.description.length > 500) {
                errors.description = 'Description must be less than 500 characters';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Generate unique ticket ID
     * @returns {string} Generated ID
     */
    generateTicketId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 9);
        return `ticket_${timestamp}_${random}`;
    }

    /**
     * Get all tickets from storage (all users)
     * @returns {Array} All tickets
     */
    getAllTicketsFromStorage() {
        try {
            const storedTickets = localStorage.getItem(this.storageKey);
            return storedTickets ? JSON.parse(storedTickets) : [];
        } catch (error) {
            console.error('Error reading tickets from storage:', error);
            return [];
        }
    }

    /**
     * Save tickets to localStorage (current user only)
     * @param {Array} tickets - Tickets to save
     */
    saveTickets(tickets) {
        try {
            // Get all tickets from storage
            const allTickets = this.getAllTicketsFromStorage();
            const currentUser = this.authManager.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('No authenticated user');
            }

            // Remove current user's tickets from all tickets
            const otherUsersTickets = allTickets.filter(ticket => ticket.userId !== currentUser.id);
            
            // Add current user's tickets
            const updatedAllTickets = [...otherUsersTickets, ...tickets];
            
            // Save all tickets
            this.saveAllTickets(updatedAllTickets);
            
        } catch (error) {
            console.error('Error saving tickets:', error);
            throw new Error('Failed to save tickets to storage');
        }
    }

    /**
     * Save all tickets to localStorage
     * @param {Array} allTickets - All tickets to save
     */
    saveAllTickets(allTickets) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(allTickets));
        } catch (error) {
            console.error('Error saving all tickets:', error);
            throw new Error('Failed to save tickets to storage');
        }
    }

    /**
     * Create ticket card element
     * @param {Object} ticket - Ticket data
     * @returns {HTMLElement} Ticket card element
     */
    createTicketCard(ticket) {
        const card = document.createElement('div');
        card.className = 'ticket-card bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow';
        card.setAttribute('data-ticket-id', ticket.id);

        // Set border color based on status
        const statusColors = {
            'Open': 'border-green-500',
            'In Progress': 'border-yellow-500',
            'Closed': 'border-gray-500'
        };
        card.classList.add(statusColors[ticket.status] || 'border-gray-300');

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold text-gray-900 truncate pr-2">${this.escapeHtml(ticket.title)}</h3>
                <span class="ticket-status px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClasses(ticket.status)}">
                    ${ticket.status}
                </span>
            </div>
            
            ${ticket.description ? `
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${this.escapeHtml(ticket.description)}</p>
            ` : ''}
            
            <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>Created: ${this.formatDate(ticket.createdAt)}</span>
                ${ticket.updatedAt !== ticket.createdAt ? `
                    <span>Updated: ${this.formatDate(ticket.updatedAt)}</span>
                ` : ''}
            </div>
            
            <div class="flex justify-end space-x-2">
                <button 
                    class="edit-btn px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    data-ticket-id="${ticket.id}"
                >
                    Edit
                </button>
                <button 
                    class="delete-btn px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    data-ticket-id="${ticket.id}"
                >
                    Delete
                </button>
            </div>
        `;

        // Bind card events
        this.bindCardEvents(card);

        return card;
    }

    /**
     * Create ticket form HTML
     * @param {string} title - Form title
     * @param {Object} ticket - Ticket data for form
     * @returns {string} Form HTML
     */
    createTicketFormHTML(title, ticket) {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-gray-900">${title}</h2>
                        <button class="close-modal text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="ticketForm" class="space-y-4">
                        <div>
                            <label for="ticketTitle" class="block text-sm font-medium text-gray-700 mb-1">
                                Title <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="ticketTitle" 
                                name="title" 
                                value="${this.escapeHtml(ticket.title)}"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxlength="100"
                                required
                            >
                            <div class="text-red-500 text-sm mt-1 hidden" id="titleError"></div>
                        </div>
                        
                        <div>
                            <label for="ticketStatus" class="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select 
                                id="ticketStatus" 
                                name="status"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                                <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                            </select>
                            <div class="text-red-500 text-sm mt-1 hidden" id="statusError"></div>
                        </div>
                        
                        <div>
                            <label for="ticketDescription" class="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea 
                                id="ticketDescription" 
                                name="description" 
                                rows="4"
                                maxlength="500"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Optional description..."
                            >${this.escapeHtml(ticket.description || '')}</textarea>
                            <div class="text-gray-500 text-xs mt-1">
                                <span id="descriptionCount">${(ticket.description || '').length}</span>/500 characters
                            </div>
                            <div class="text-red-500 text-sm mt-1 hidden" id="descriptionError"></div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button 
                                type="button" 
                                class="cancel-btn px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                class="submit-btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                ${this.editingTicketId ? 'Update' : 'Create'} Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Create delete confirmation HTML
     * @param {Object} ticket - Ticket to delete
     * @returns {string} Confirmation HTML
     */
    createDeleteConfirmationHTML(ticket) {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Ticket</h3>
                        <p class="text-sm text-gray-500 mb-4">
                            Are you sure you want to delete "<strong>${this.escapeHtml(ticket.title)}</strong>"? 
                            This action cannot be undone.
                        </p>
                    </div>
                    
                    <div class="flex justify-center space-x-3">
                        <button 
                            type="button" 
                            class="cancel-delete px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            class="confirm-delete px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Delete Ticket
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state
     * @returns {string} Empty state HTML
     */
    renderEmptyState() {
        return `
            <div class="empty-state text-center py-12">
                <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                <p class="text-gray-500 mb-6">Get started by creating your first ticket.</p>
                <button 
                    id="createFirstTicket"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Create Your First Ticket
                </button>
            </div>
        `;
    }

    /**
     * Create confirmation modal element
     * @param {string} modalId - Modal ID
     * @returns {HTMLElement} Modal element
     */
    createConfirmationModal(modalId) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 hidden';
        return modal;
    }

    /**
     * Bind form events
     * @param {HTMLElement} modal - Modal element
     */
    bindFormEvents(modal) {
        const form = modal.querySelector('#ticketForm');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const descriptionField = modal.querySelector('#ticketDescription');
        const descriptionCount = modal.querySelector('#descriptionCount');

        // Close modal events
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal(modal.id));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal(modal.id));
        }

        // Description character count
        if (descriptionField && descriptionCount) {
            descriptionField.addEventListener('input', () => {
                descriptionCount.textContent = descriptionField.value.length;
            });
        }

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e, modal));
        }

        // Clear errors on input
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Bind confirmation events
     * @param {HTMLElement} modal - Modal element
     * @param {string} ticketId - Ticket ID to delete
     */
    bindConfirmationEvents(modal, ticketId) {
        const cancelBtn = modal.querySelector('.cancel-delete');
        const confirmBtn = modal.querySelector('.confirm-delete');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal(modal.id));
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                await this.handleDeleteConfirmation(ticketId, modal.id);
            });
        }
    }

    /**
     * Bind card events
     * @param {HTMLElement} card - Card element
     */
    bindCardEvents(card) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ticketId = editBtn.getAttribute('data-ticket-id');
                this.showEditForm(ticketId);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ticketId = deleteBtn.getAttribute('data-ticket-id');
                this.showDeleteConfirmation(ticketId);
            });
        }
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     * @param {HTMLElement} modal - Modal element
     */
    async handleFormSubmit(event, modal) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const ticketData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status')
        };

        // Clear previous errors
        this.clearAllFormErrors(modal);

        let result;
        if (this.editingTicketId) {
            result = await this.updateTicket(this.editingTicketId, ticketData);
        } else {
            result = await this.createTicket(ticketData);
        }

        if (result.success) {
            this.hideModal(modal.id);
            this.renderTickets(); // Refresh the display
            
            // Show success message (would use toast system when available)
            console.log(result.message);
        } else {
            if (result.errors) {
                this.displayFormErrors(modal, result.errors);
            } else {
                console.error(result.message);
            }
        }
    }

    /**
     * Handle delete confirmation
     * @param {string} ticketId - Ticket ID to delete
     * @param {string} modalId - Modal ID
     */
    async handleDeleteConfirmation(ticketId, modalId) {
        const result = await this.deleteTicket(ticketId, true);
        
        if (result.success) {
            this.hideModal(modalId);
            this.renderTickets(); // Refresh the display
            
            // Show success message (would use toast system when available)
            console.log(result.message);
        } else {
            console.error(result.message);
        }
    }

    /**
     * Display form errors
     * @param {HTMLElement} modal - Modal element
     * @param {Object} errors - Errors object
     */
    displayFormErrors(modal, errors) {
        Object.keys(errors).forEach(fieldName => {
            const errorElement = modal.querySelector(`#${fieldName}Error`);
            const field = modal.querySelector(`#ticket${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
            
            if (errorElement && field) {
                errorElement.textContent = errors[fieldName];
                errorElement.classList.remove('hidden');
                field.classList.add('border-red-500');
            }
        });
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Input field
     */
    clearFieldError(field) {
        field.classList.remove('border-red-500');
        const fieldName = field.name;
        const errorElement = document.querySelector(`#${fieldName}Error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
        }
    }

    /**
     * Clear all form errors
     * @param {HTMLElement} modal - Modal element
     */
    clearAllFormErrors(modal) {
        const errorElements = modal.querySelectorAll('[id$="Error"]');
        const fields = modal.querySelectorAll('input, textarea, select');
        
        errorElements.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });
        
        fields.forEach(field => {
            field.classList.remove('border-red-500');
        });
    }

    /**
     * Get status CSS classes
     * @param {string} status - Ticket status
     * @returns {string} CSS classes
     */
    getStatusClasses(status) {
        const statusClasses = {
            'Open': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Format date for display
     * @param {number} timestamp - Timestamp to format
     * @returns {string} Formatted date
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
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    
    /**
     * Dispatch custom event for ticket changes
     * Allows other components to listen for ticket operations
     * @param {string} eventName - Name of the event (ticketCreated, ticketUpdated, ticketDeleted)
     * @param {Object} ticketData - Ticket data associated with the event
     */
    dispatchTicketEvent(eventName, ticketData) {
        try {
            const event = new CustomEvent(eventName, {
                detail: {
                    ticket: ticketData,
                    timestamp: Date.now()
                },
                bubbles: true,
                cancelable: false
            });
            
            window.dispatchEvent(event);
        } catch (error) {
            console.error(`Error dispatching ${eventName} event:`, error);
        }
    }
}

/**
 * TicketValidator - Handles client-side validation for ticket fields
 */
class TicketValidator {
    constructor() {
        this.errors = {};
        this.validStatuses = ['Open', 'In Progress', 'Closed'];
    }

    /**
     * Validate ticket data for creation
     * @param {Object} ticketData - Ticket data to validate
     * @returns {Object} Validation result
     */
    validateCreateTicket(ticketData) {
        this.errors = {};

        // Title validation
        this.validateTitle(ticketData.title);
        
        // Status validation
        this.validateStatus(ticketData.status);
        
        // Description validation
        this.validateDescription(ticketData.description);

        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    /**
     * Validate ticket data for updates
     * @param {Object} updates - Update data to validate
     * @returns {Object} Validation result
     */
    validateUpdateTicket(updates) {
        this.errors = {};

        // Only validate fields that are being updated
        if (updates.title !== undefined) {
            this.validateTitle(updates.title);
        }
        
        if (updates.status !== undefined) {
            this.validateStatus(updates.status);
        }
        
        if (updates.description !== undefined) {
            this.validateDescription(updates.description);
        }

        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    /**
     * Validate title field
     * @param {string} title - Title to validate
     */
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            this.errors.title = 'Title is required';
            return;
        }

        const trimmedTitle = title.trim();
        
        if (trimmedTitle.length === 0) {
            this.errors.title = 'Title cannot be empty';
        } else if (trimmedTitle.length > 100) {
            this.errors.title = 'Title must be less than 100 characters';
        } else if (trimmedTitle.length < 3) {
            this.errors.title = 'Title must be at least 3 characters long';
        }
    }

    /**
     * Validate status field
     * @param {string} status - Status to validate
     */
    validateStatus(status) {
        if (!status || typeof status !== 'string') {
            this.errors.status = 'Status is required';
            return;
        }

        if (!this.validStatuses.includes(status)) {
            this.errors.status = `Status must be one of: ${this.validStatuses.join(', ')}`;
        }
    }

    /**
     * Validate description field
     * @param {string} description - Description to validate
     */
    validateDescription(description) {
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string') {
                this.errors.description = 'Description must be a string';
                return;
            }

            if (description.length > 500) {
                this.errors.description = 'Description must be less than 500 characters';
            }
        }
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
 * TicketErrorHandler - Handles error display and localStorage error handling
 */
class TicketErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.fieldErrors = {};
    }

    /**
     * Initialize error handler
     */
    init() {
        this.errorContainer = document.getElementById('ticket-errors') || this.createErrorContainer();
    }

    /**
     * Handle localStorage operation errors
     * @param {Error} error - Error object
     * @param {string} operation - Operation that failed
     * @returns {Object} Standardized error response
     */
    handleStorageError(error, operation = 'storage operation') {
        console.error(`Storage error during ${operation}:`, error);

        let errorMessage = 'Unable to save data. ';
        let errorType = 'storage';

        if (error.name === 'QuotaExceededError') {
            errorMessage = 'Storage limit reached. Please delete some tickets to free up space.';
            errorType = 'quota';
        } else if (error.name === 'SecurityError') {
            errorMessage = 'Storage access denied. Please check your browser settings.';
            errorType = 'security';
        } else if (error.message.includes('localStorage')) {
            errorMessage = 'Local storage is not available. Please enable it in your browser settings.';
            errorType = 'unavailable';
        } else {
            errorMessage += 'Please try again or refresh the page.';
        }

        return {
            success: false,
            error: errorMessage,
            errorType: errorType,
            originalError: error,
            message: `Failed to complete ${operation}`
        };
    }

    /**
     * Handle validation errors
     * @param {Object} errors - Validation errors
     * @param {string} context - Context where validation failed
     * @returns {Object} Standardized error response
     */
    handleValidationErrors(errors, context = 'form validation') {
        return {
            success: false,
            errors: errors,
            errorType: 'validation',
            message: `${context} failed`,
            context: context
        };
    }

    /**
     * Handle authentication errors
     * @param {string} message - Error message
     * @returns {Object} Standardized error response
     */
    handleAuthError(message = 'Authentication required') {
        return {
            success: false,
            error: message,
            errorType: 'authentication',
            message: 'Authentication failed',
            requiresAuth: true
        };
    }

    /**
     * Handle general application errors
     * @param {Error} error - Application error
     * @param {string} context - Context where error occurred
     * @returns {Object} Standardized error response
     */
    handleApplicationError(error, context = 'application') {
        console.error(`Application error in ${context}:`, error);

        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
            errorType: 'application',
            originalError: error,
            message: `${context} failed`,
            context: context
        };
    }

    /**
     * Create error container
     * @returns {HTMLElement} Error container element
     */
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'ticket-errors';
        container.className = 'ticket-errors';
        container.style.display = 'none';
        
        // Insert at appropriate location
        const main = document.querySelector('main') || document.body;
        main.insertBefore(container, main.firstChild);
        
        return container;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TicketManager,
        TicketValidator,
        TicketErrorHandler
    };
}