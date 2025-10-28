/**
 * ToastSystem - User feedback notification system
 * Provides success, error, warning, and info toast notifications
 */
class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.toastCounter = 0;
        this.recentMessages = new Map(); // Track recent messages to prevent duplicates
        this.duplicateTimeout = 3000; // 3 seconds to prevent duplicates
        this.init();
    }

    /**
     * Initialize the toast container
     */
    init() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     * @returns {string} - Toast ID for manual dismissal
     */
    show(message, type = 'info', duration = 3000) {
        // Check for duplicate messages
        const messageKey = `${type}:${message}`;
        const now = Date.now();
        
        if (this.recentMessages.has(messageKey)) {
            const lastShown = this.recentMessages.get(messageKey);
            if (now - lastShown < this.duplicateTimeout) {
                // Skip duplicate message
                return null;
            }
        }
        
        // Record this message
        this.recentMessages.set(messageKey, now);
        
        // Clean up old messages
        this.cleanupRecentMessages();
        
        const toastId = `toast-${++this.toastCounter}`;
        
        // Create toast element
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Create toast content
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toastId));

        // Add to container with animation
        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Store toast reference
        this.toasts.set(toastId, {
            element: toast,
            timer: null,
            messageKey: messageKey
        });

        // Auto-dismiss if duration is set
        if (duration > 0) {
            const timer = setTimeout(() => {
                this.dismiss(toastId);
            }, duration);
            
            this.toasts.get(toastId).timer = timer;
        }

        return toastId;
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     * @returns {string} - Toast ID
     */
    showSuccess(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     * @returns {string} - Toast ID
     */
    showError(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     * @param {number} duration - Duration in milliseconds
     * @returns {string} - Toast ID
     */
    showWarning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info toast
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds
     * @returns {string} - Toast ID
     */
    showInfo(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Manually dismiss a toast
     * @param {string} toastId - ID of the toast to dismiss
     */
    dismiss(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer, messageKey } = toastData;

        // Clear timer if exists
        if (timer) {
            clearTimeout(timer);
        }

        // Animate out
        element.classList.add('toast-hide');
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
            
            // Remove from recent messages when dismissed
            if (messageKey) {
                this.recentMessages.delete(messageKey);
            }
        }, 300);
    }

    /**
     * Clean up old recent messages
     */
    cleanupRecentMessages() {
        const now = Date.now();
        for (const [messageKey, timestamp] of this.recentMessages.entries()) {
            if (now - timestamp > this.duplicateTimeout) {
                this.recentMessages.delete(messageKey);
            }
        }
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        const toastIds = Array.from(this.toasts.keys());
        toastIds.forEach(id => this.dismiss(id));
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} - Icon HTML
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
/**

 * LocalStorage wrapper with error handling
 * Provides safe localStorage operations with fallback mechanisms
 */
class StorageManager {
    constructor() {
        this.isAvailable = this.checkAvailability();
        this.fallbackStorage = new Map();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} - True if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available, using fallback storage');
            return false;
        }
    }

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     * @returns {boolean} - True if successful
     */
    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.isAvailable) {
                localStorage.setItem(key, serializedValue);
            } else {
                this.fallbackStorage.set(key, serializedValue);
            }
            return true;
        } catch (e) {
            console.error('Storage setItem failed:', e);
            return false;
        }
    }

    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key not found
     * @returns {any} - Parsed value or default
     */
    getItem(key, defaultValue = null) {
        try {
            let serializedValue;
            
            if (this.isAvailable) {
                serializedValue = localStorage.getItem(key);
            } else {
                serializedValue = this.fallbackStorage.get(key);
            }
            
            if (serializedValue === null || serializedValue === undefined) {
                return defaultValue;
            }
            
            return JSON.parse(serializedValue);
        } catch (e) {
            console.error('Storage getItem failed:', e);
            return defaultValue;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @returns {boolean} - True if successful
     */
    removeItem(key) {
        try {
            if (this.isAvailable) {
                localStorage.removeItem(key);
            } else {
                this.fallbackStorage.delete(key);
            }
            return true;
        } catch (e) {
            console.error('Storage removeItem failed:', e);
            return false;
        }
    }

    /**
     * Clear all storage
     * @returns {boolean} - True if successful
     */
    clear() {
        try {
            if (this.isAvailable) {
                localStorage.clear();
            } else {
                this.fallbackStorage.clear();
            }
            return true;
        } catch (e) {
            console.error('Storage clear failed:', e);
            return false;
        }
    }

    /**
     * Get all keys in storage
     * @returns {string[]} - Array of storage keys
     */
    getAllKeys() {
        try {
            if (this.isAvailable) {
                return Object.keys(localStorage);
            } else {
                return Array.from(this.fallbackStorage.keys());
            }
        } catch (e) {
            console.error('Storage getAllKeys failed:', e);
            return [];
        }
    }
}

/**
 * Input sanitization and XSS prevention utilities
 */
class SecurityUtils {
    /**
     * Escape HTML characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;'
        };
        
        return text.replace(/[&<>"'/]/g, (match) => map[match]);
    }

    /**
     * Sanitize input by removing potentially dangerous characters
     * @param {string} input - Input to sanitize
     * @param {Object} options - Sanitization options
     * @returns {string} - Sanitized input
     */
    static sanitizeInput(input, options = {}) {
        if (typeof input !== 'string') {
            return String(input);
        }

        const {
            allowHtml = false,
            maxLength = null,
            allowedChars = null,
            trim = true
        } = options;

        let sanitized = input;

        // Trim whitespace if requested
        if (trim) {
            sanitized = sanitized.trim();
        }

        // Escape HTML if not allowed
        if (!allowHtml) {
            sanitized = this.escapeHtml(sanitized);
        }

        // Apply character whitelist if provided
        if (allowedChars) {
            const regex = new RegExp(`[^${allowedChars}]`, 'g');
            sanitized = sanitized.replace(regex, '');
        }

        // Apply length limit if provided
        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Validate and sanitize URL
     * @param {string} url - URL to validate
     * @returns {string|null} - Sanitized URL or null if invalid
     */
    static sanitizeUrl(url) {
        if (typeof url !== 'string') {
            return null;
        }

        try {
            const urlObj = new URL(url);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return null;
            }
            return urlObj.toString();
        } catch (e) {
            return null;
        }
    }
}

/**
 * Form validation helper functions
 */
class ValidationUtils {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate required field
     * @param {any} value - Value to validate
     * @returns {boolean} - True if value is not empty
     */
    static isRequired(value) {
        if (value === null || value === undefined) {
            return false;
        }
        
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        
        return true;
    }

    /**
     * Validate string length
     * @param {string} value - String to validate
     * @param {number} min - Minimum length
     * @param {number} max - Maximum length
     * @returns {boolean} - True if length is within bounds
     */
    static isValidLength(value, min = 0, max = Infinity) {
        if (typeof value !== 'string') {
            return false;
        }
        
        const length = value.trim().length;
        return length >= min && length <= max;
    }

    /**
     * Validate that value is one of allowed options
     * @param {any} value - Value to validate
     * @param {Array} allowedValues - Array of allowed values
     * @returns {boolean} - True if value is allowed
     */
    static isValidOption(value, allowedValues) {
        return allowedValues.includes(value);
    }

    /**
     * Validate ticket data
     * @param {Object} ticketData - Ticket data to validate
     * @returns {Object} - Validation result with errors array
     */
    static validateTicket(ticketData) {
        const errors = [];
        const { title, description, status } = ticketData;

        // Validate title
        if (!this.isRequired(title)) {
            errors.push({
                field: 'title',
                message: 'Title is required'
            });
        } else if (!this.isValidLength(title, 1, 100)) {
            errors.push({
                field: 'title',
                message: 'Title must be between 1 and 100 characters'
            });
        }

        // Validate status
        const validStatuses = ['Open', 'In Progress', 'Closed'];
        if (!this.isValidOption(status, validStatuses)) {
            errors.push({
                field: 'status',
                message: 'Status must be Open, In Progress, or Closed'
            });
        }

        // Validate description (optional)
        if (description && !this.isValidLength(description, 0, 500)) {
            errors.push({
                field: 'description',
                message: 'Description must be less than 500 characters'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate user credentials
     * @param {Object} credentials - User credentials to validate
     * @returns {Object} - Validation result with errors array
     */
    static validateCredentials(credentials) {
        const errors = [];
        const { username, email, password } = credentials;

        // Validate username
        if (!this.isRequired(username)) {
            errors.push({
                field: 'username',
                message: 'Username is required'
            });
        } else if (!this.isValidLength(username, 3, 50)) {
            errors.push({
                field: 'username',
                message: 'Username must be between 3 and 50 characters'
            });
        }

        // Validate email if provided
        if (email && !this.isValidEmail(email)) {
            errors.push({
                field: 'email',
                message: 'Please enter a valid email address'
            });
        }

        // Validate password
        if (!this.isRequired(password)) {
            errors.push({
                field: 'password',
                message: 'Password is required'
            });
        } else if (!this.isValidLength(password, 6, 100)) {
            errors.push({
                field: 'password',
                message: 'Password must be at least 6 characters long'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Date formatting and utility functions
 */
class DateUtils {
    /**
     * Format date to readable string
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted date string
     */
    static formatDate(date, options = {}) {
        const {
            format = 'short',
            includeTime = false,
            locale = 'en-US'
        } = options;

        try {
            const dateObj = new Date(date);
            
            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }

            const formatOptions = {
                year: 'numeric',
                month: format === 'long' ? 'long' : 'short',
                day: 'numeric'
            };

            if (includeTime) {
                formatOptions.hour = '2-digit';
                formatOptions.minute = '2-digit';
            }

            return dateObj.toLocaleDateString(locale, formatOptions);
        } catch (e) {
            console.error('Date formatting failed:', e);
            return 'Invalid Date';
        }
    }

    /**
     * Get relative time string (e.g., "2 hours ago")
     * @param {Date|string|number} date - Date to compare
     * @returns {string} - Relative time string
     */
    static getRelativeTime(date) {
        try {
            const dateObj = new Date(date);
            const now = new Date();
            const diffMs = now.getTime() - dateObj.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffSeconds < 60) {
                return 'Just now';
            } else if (diffMinutes < 60) {
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                return this.formatDate(dateObj);
            }
        } catch (e) {
            console.error('Relative time calculation failed:', e);
            return 'Unknown time';
        }
    }

    /**
     * Check if date is today
     * @param {Date|string|number} date - Date to check
     * @returns {boolean} - True if date is today
     */
    static isToday(date) {
        try {
            const dateObj = new Date(date);
            const today = new Date();
            
            return dateObj.getDate() === today.getDate() &&
                   dateObj.getMonth() === today.getMonth() &&
                   dateObj.getFullYear() === today.getFullYear();
        } catch (e) {
            return false;
        }
    }
}

/**
 * ID generation utilities
 */
class IdUtils {
    /**
     * Generate a unique ID using timestamp and random number
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} - Unique ID
     */
    static generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
    }

    /**
     * Generate a UUID v4
     * @returns {string} - UUID v4 string
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate a short random ID
     * @param {number} length - Length of the ID (default: 8)
     * @returns {string} - Short random ID
     */
    static generateShortId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
}

/**
 * DOM utility functions
 */
class DOMUtils {
    /**
     * Safely query selector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {Element|null} - Found element or null
     */
    static querySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (e) {
            console.error('Invalid selector:', selector, e);
            return null;
        }
    }

    /**
     * Safely query all selectors with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {NodeList} - Found elements
     */
    static querySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (e) {
            console.error('Invalid selector:', selector, e);
            return [];
        }
    }

    /**
     * Add event listener with error handling
     * @param {Element} element - Element to add listener to
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') {
            console.error('Invalid element or handler for event listener');
            return;
        }

        try {
            element.addEventListener(event, handler, options);
        } catch (e) {
            console.error('Failed to add event listener:', e);
        }
    }

    /**
     * Remove event listener with error handling
     * @param {Element} element - Element to remove listener from
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    static removeEventListener(element, event, handler) {
        if (!element || typeof handler !== 'function') {
            return;
        }

        try {
            element.removeEventListener(event, handler);
        } catch (e) {
            console.error('Failed to remove event listener:', e);
        }
    }
}

// Create global instances for easy access
const storage = new StorageManager();
const toastSystem = new ToastSystem();

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ToastSystem,
        StorageManager,
        SecurityUtils,
        ValidationUtils,
        DateUtils,
        IdUtils,
        DOMUtils,
        storage,
        toastSystem
    };
}