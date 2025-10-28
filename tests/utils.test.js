/**
 * Node.js test runner for utility modules
 * Tests ToastSystem, StorageManager, SecurityUtils, ValidationUtils, and other utility classes
 */

// Mock DOM and browser APIs for Node.js environment
global.window = {
    localStorage: {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = String(value); },
        removeItem(key) { delete this.store[key]; },
        clear() { this.store = {}; }
    },
    sessionStorage: {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = String(value); },
        removeItem(key) { delete this.store[key]; },
        clear() { this.store = {}; }
    },
    location: { href: '' }
};

global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

// Mock DOM methods
global.document = {
    createElement: (tag) => {
        const element = {
            tagName: tag.toUpperCase(),
            id: '',
            className: '',
            innerHTML: '',
            textContent: '',
            style: {},
            children: [],
            appendChild: function(child) {
                this.children.push(child);
                child.parentNode = this;
            },
            removeChild: function(child) {
                const index = this.children.indexOf(child);
                if (index > -1) {
                    this.children.splice(index, 1);
                    child.parentNode = null;
                }
            },
            querySelector: function(selector) {
                // Simple mock - return first child if exists
                return this.children[0] || null;
            },
            querySelectorAll: () => [],
            addEventListener: () => {},
            removeEventListener: () => {},
            parentNode: null,
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            }
        };
        return element;
    },
    getElementById: (id) => {
        if (id === 'toast-container') {
            return null; // Force creation of new container
        }
        return null;
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
        appendChild: () => {}
    }
};

global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;

// Load the utility modules
const fs = require('fs');
const path = require('path');

// Read and evaluate the utils.js file
const utilsModulePath = path.join(__dirname, '../public/assets/js/utils.js');
const utilsModuleCode = fs.readFileSync(utilsModulePath, 'utf8');

// Create a module context and evaluate
const moduleContext = { module: { exports: {} }, exports: {} };
const contextCode = `
(function(module, exports) {
    ${utilsModuleCode}
})(moduleContext.module, moduleContext.exports);
`;

eval(contextCode);

// Extract classes from the module
const { 
    ToastSystem, 
    StorageManager, 
    SecurityUtils, 
    ValidationUtils, 
    DateUtils, 
    IdUtils, 
    DOMUtils 
} = moduleContext.module.exports;

// Simple test framework
class TestRunner {
    constructor() {
        this.results = [];
        this.currentSuite = '';
    }

    describe(suiteName, testFn) {
        this.currentSuite = suiteName;
        console.log(`\n=== ${suiteName} ===`);
        testFn();
    }

    it(testName, testFn) {
        try {
            testFn();
            this.results.push({ suite: this.currentSuite, name: testName, status: 'pass' });
            console.log(`✓ ${testName}`);
        } catch (error) {
            this.results.push({ 
                suite: this.currentSuite, 
                name: testName, 
                status: 'fail', 
                error: error.message 
            });
            console.error(`✗ ${testName}: ${error.message}`);
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (typeof actual === 'string' && !actual.includes(expected)) {
                    throw new Error(`Expected "${actual}" to contain "${expected}"`);
                }
                if (Array.isArray(actual) && !actual.includes(expected)) {
                    throw new Error(`Expected array to contain ${expected}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan: (expected) => {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            },
            toMatch: (pattern) => {
                if (!pattern.test(actual)) {
                    throw new Error(`Expected "${actual}" to match pattern ${pattern}`);
                }
            }
        };
    }

    printSummary() {
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const total = this.results.length;
        
        console.log('\n' + '='.repeat(50));
        console.log(`Test Summary: ${total} tests`);
        console.log(`✓ Passed: ${passed}`);
        console.log(`✗ Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\nFailed tests:');
            this.results.filter(r => r.status === 'fail').forEach(result => {
                console.log(`  - ${result.suite}: ${result.name}`);
                console.log(`    Error: ${result.error}`);
            });
        }
        
        return failed === 0;
    }
}

// Initialize test runner
const testRunner = new TestRunner();
const describe = testRunner.describe.bind(testRunner);
const it = testRunner.it.bind(testRunner);
const expect = testRunner.expect.bind(testRunner);

// Run the tests
describe('ToastSystem - Core Functionality', () => {
    let toastSystem;

    function setup() {
        toastSystem = new ToastSystem();
    }

    it('should create toast container on initialization', () => {
        setup();
        expect(toastSystem.container).toBeTruthy();
        expect(toastSystem.container.id).toBe('toast-container');
        expect(toastSystem.container.className).toBe('toast-container');
    });

    it('should get correct icon for toast type', () => {
        setup();
        expect(toastSystem.getIcon('success')).toBe('✓');
        expect(toastSystem.getIcon('error')).toBe('✕');
        expect(toastSystem.getIcon('warning')).toBe('⚠');
        expect(toastSystem.getIcon('info')).toBe('ℹ');
        expect(toastSystem.getIcon('unknown')).toBe('ℹ');
    });

    it('should escape HTML in messages', () => {
        setup();
        const input = '<script>alert("xss")</script>';
        const escaped = toastSystem.escapeHtml(input);
        expect(typeof escaped).toBe('string');
        expect(escaped !== input).toBe(true);
    });

    it('should initialize toast counter and maps', () => {
        setup();
        expect(toastSystem.toastCounter).toBe(0);
        expect(toastSystem.toasts).toBeTruthy();
        expect(toastSystem.toasts instanceof Map).toBe(true);
    });
});

describe('StorageManager - LocalStorage Operations', () => {
    let storageManager;

    function setup() {
        global.localStorage.clear();
        storageManager = new StorageManager();
    }

    it('should check localStorage availability', () => {
        setup();
        expect(storageManager.isAvailable).toBe(true);
    });

    it('should set and get items successfully', () => {
        setup();
        const testData = { name: 'test', value: 123 };
        
        const setResult = storageManager.setItem('test-key', testData);
        expect(setResult).toBe(true);
        
        const retrievedData = storageManager.getItem('test-key');
        expect(retrievedData).toEqual(testData);
    });

    it('should return default value for non-existent keys', () => {
        setup();
        const defaultValue = { default: true };
        
        const result = storageManager.getItem('non-existent', defaultValue);
        expect(result).toEqual(defaultValue);
    });

    it('should remove items successfully', () => {
        setup();
        storageManager.setItem('test-key', 'test-value');
        
        const removeResult = storageManager.removeItem('test-key');
        expect(removeResult).toBe(true);
        
        const retrievedData = storageManager.getItem('test-key');
        expect(retrievedData).toBe(null);
    });

    it('should clear all storage', () => {
        setup();
        storageManager.setItem('key1', 'value1');
        storageManager.setItem('key2', 'value2');
        
        const clearResult = storageManager.clear();
        expect(clearResult).toBe(true);
        
        expect(storageManager.getItem('key1')).toBe(null);
        expect(storageManager.getItem('key2')).toBe(null);
    });

    it('should get all storage keys', () => {
        setup();
        storageManager.setItem('key1', 'value1');
        storageManager.setItem('key2', 'value2');
        
        const keys = storageManager.getAllKeys();
        expect(keys.length).toBeGreaterThan(0);
    });

    it('should handle storage errors gracefully', () => {
        setup();
        
        // Mock localStorage to throw error
        const originalSetItem = global.localStorage.setItem;
        global.localStorage.setItem = () => {
            throw new Error('Storage quota exceeded');
        };
        
        const result = storageManager.setItem('test', 'data');
        expect(result).toBe(false);
        
        // Restore original method
        global.localStorage.setItem = originalSetItem;
    });
});

describe('SecurityUtils - Input Sanitization', () => {
    it('should escape HTML characters correctly', () => {
        const input = '<script>alert("xss")</script>';
        const escaped = SecurityUtils.escapeHtml(input);
        expect(escaped).toContain('&lt;');
        expect(escaped).toContain('&gt;');
    });

    it('should handle non-string input in escapeHtml', () => {
        expect(SecurityUtils.escapeHtml(123)).toBe('123');
        expect(SecurityUtils.escapeHtml(null)).toBe('null');
        expect(SecurityUtils.escapeHtml(undefined)).toBe('undefined');
    });

    it('should sanitize input with default options', () => {
        const input = '  <script>alert("test")</script>  ';
        const sanitized = SecurityUtils.sanitizeInput(input);
        expect(sanitized).toContain('&lt;');
        expect(sanitized).toContain('&gt;');
    });

    it('should trim whitespace when requested', () => {
        const input = '  test input  ';
        const sanitized = SecurityUtils.sanitizeInput(input, { trim: true });
        expect(sanitized).toBe('test input');
    });

    it('should apply character whitelist', () => {
        const input = 'abc123!@#';
        const sanitized = SecurityUtils.sanitizeInput(input, { 
            allowedChars: 'a-zA-Z0-9' 
        });
        expect(sanitized).toBe('abc123');
    });

    it('should apply length limit', () => {
        const input = 'This is a very long input string';
        const sanitized = SecurityUtils.sanitizeInput(input, { 
            maxLength: 10 
        });
        expect(sanitized.length).toBeLessThan(11);
    });

    it('should allow HTML when specified', () => {
        const input = '<b>Bold text</b>';
        const sanitized = SecurityUtils.sanitizeInput(input, { 
            allowHtml: true 
        });
        expect(sanitized).toBe('<b>Bold text</b>');
    });

    it('should sanitize URLs correctly', () => {
        expect(SecurityUtils.sanitizeUrl('https://example.com')).toBe('https://example.com/');
        expect(SecurityUtils.sanitizeUrl('http://test.org')).toBe('http://test.org/');
        expect(SecurityUtils.sanitizeUrl('javascript:alert(1)')).toBe(null);
        expect(SecurityUtils.sanitizeUrl('ftp://files.com')).toBe(null);
        expect(SecurityUtils.sanitizeUrl('invalid-url')).toBe(null);
    });
});

describe('ValidationUtils - Form Validation', () => {
    it('should validate email addresses correctly', () => {
        expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
        expect(ValidationUtils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
        expect(ValidationUtils.isValidEmail('test@')).toBe(false);
        expect(ValidationUtils.isValidEmail('@domain.com')).toBe(false);
    });

    it('should validate required fields correctly', () => {
        expect(ValidationUtils.isRequired('test')).toBe(true);
        expect(ValidationUtils.isRequired('  test  ')).toBe(true);
        expect(ValidationUtils.isRequired('')).toBe(false);
        expect(ValidationUtils.isRequired('   ')).toBe(false);
        expect(ValidationUtils.isRequired(null)).toBe(false);
        expect(ValidationUtils.isRequired(undefined)).toBe(false);
        expect(ValidationUtils.isRequired(123)).toBe(true);
    });

    it('should validate string length correctly', () => {
        expect(ValidationUtils.isValidLength('test', 1, 10)).toBe(true);
        expect(ValidationUtils.isValidLength('test', 5, 10)).toBe(false);
        expect(ValidationUtils.isValidLength('test', 1, 3)).toBe(false);
        expect(ValidationUtils.isValidLength('  test  ', 1, 10)).toBe(true);
        expect(ValidationUtils.isValidLength(123, 1, 10)).toBe(false);
    });

    it('should validate option selection correctly', () => {
        const options = ['Open', 'In Progress', 'Closed'];
        expect(ValidationUtils.isValidOption('Open', options)).toBe(true);
        expect(ValidationUtils.isValidOption('Invalid', options)).toBe(false);
        expect(ValidationUtils.isValidOption(null, options)).toBe(false);
    });

    it('should validate ticket data correctly', () => {
        const validTicket = {
            title: 'Test Ticket',
            description: 'Test description',
            status: 'Open'
        };
        
        const result = ValidationUtils.validateTicket(validTicket);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid ticket data', () => {
        const invalidTicket = {
            title: '',
            description: 'A'.repeat(501), // Too long
            status: 'Invalid Status'
        };
        
        const result = ValidationUtils.validateTicket(invalidTicket);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(3);
        expect(result.errors.some(e => e.field === 'title')).toBe(true);
        expect(result.errors.some(e => e.field === 'description')).toBe(true);
        expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });

    it('should validate user credentials correctly', () => {
        const validCredentials = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        
        const result = ValidationUtils.validateCredentials(validCredentials);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid credentials', () => {
        const invalidCredentials = {
            username: 'ab', // Too short
            email: 'invalid-email',
            password: '123' // Too short
        };
        
        const result = ValidationUtils.validateCredentials(invalidCredentials);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(3);
    });
});

describe('DateUtils - Date Formatting', () => {
    it('should format dates correctly', () => {
        const testDate = new Date('2023-12-25T10:30:00');
        
        const shortFormat = DateUtils.formatDate(testDate, { format: 'short' });
        expect(shortFormat).toContain('Dec');
        expect(shortFormat).toContain('25');
        expect(shortFormat).toContain('2023');
        
        const longFormat = DateUtils.formatDate(testDate, { format: 'long' });
        expect(longFormat).toContain('December');
    });

    it('should include time when requested', () => {
        const testDate = new Date('2023-12-25T10:30:00');
        
        const withTime = DateUtils.formatDate(testDate, { includeTime: true });
        expect(withTime).toContain('10:30');
    });

    it('should handle invalid dates', () => {
        const result1 = DateUtils.formatDate('invalid-date');
        const result2 = DateUtils.formatDate(null);
        // Should return some string, even if not "Invalid Date"
        expect(typeof result1).toBe('string');
        expect(typeof result2).toBe('string');
    });

    it('should calculate relative time correctly', () => {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        expect(DateUtils.getRelativeTime(fiveMinutesAgo)).toContain('5 minutes ago');
        expect(DateUtils.getRelativeTime(twoHoursAgo)).toContain('2 hours ago');
        expect(DateUtils.getRelativeTime(threeDaysAgo)).toContain('3 days ago');
    });

    it('should check if date is today', () => {
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        expect(DateUtils.isToday(today)).toBe(true);
        expect(DateUtils.isToday(yesterday)).toBe(false);
    });
});

describe('IdUtils - ID Generation', () => {
    it('should generate unique IDs', () => {
        const id1 = IdUtils.generateId();
        const id2 = IdUtils.generateId();
        
        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1 !== id2).toBe(true);
    });

    it('should generate IDs with prefix', () => {
        const id = IdUtils.generateId('ticket');
        expect(id).toContain('ticket_');
    });

    it('should generate valid UUIDs', () => {
        const uuid = IdUtils.generateUUID();
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        expect(uuid).toMatch(uuidPattern);
    });

    it('should generate short IDs with correct length', () => {
        const shortId = IdUtils.generateShortId(10);
        expect(shortId.length).toBe(10);
        
        const defaultId = IdUtils.generateShortId();
        expect(defaultId.length).toBe(8);
    });
});

describe('DOMUtils - DOM Operations', () => {
    it('should handle querySelector safely', () => {
        const result = DOMUtils.querySelector('#test');
        expect(result).toBe(null); // Mock returns null
    });

    it('should handle querySelectorAll safely', () => {
        const result = DOMUtils.querySelectorAll('.test');
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid selectors gracefully', () => {
        const result = DOMUtils.querySelector('invalid[selector');
        expect(result).toBe(null);
    });

    it('should add event listeners safely', () => {
        const mockElement = {
            addEventListener: () => {}
        };
        
        // Should not throw error
        DOMUtils.addEventListener(mockElement, 'click', () => {});
        DOMUtils.addEventListener(null, 'click', () => {}); // Should handle null
        DOMUtils.addEventListener(mockElement, 'click', null); // Should handle null handler
    });

    it('should remove event listeners safely', () => {
        const mockElement = {
            removeEventListener: () => {}
        };
        
        // Should not throw error
        DOMUtils.removeEventListener(mockElement, 'click', () => {});
        DOMUtils.removeEventListener(null, 'click', () => {}); // Should handle null
    });
});

// Run tests and print summary
const success = testRunner.printSummary();
process.exit(success ? 0 : 1);