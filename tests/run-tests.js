/**
 * Node.js test runner for authentication module
 * This allows running tests from command line without browser
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

// Load the authentication module
const fs = require('fs');
const path = require('path');

// Read and evaluate the auth.js file
const authModulePath = path.join(__dirname, '../public/assets/js/auth.js');
const authModuleCode = fs.readFileSync(authModulePath, 'utf8');

// Remove browser-specific code and evaluate
const cleanedCode = authModuleCode
    .replace(/if \(typeof document !== 'undefined'\) \{[\s\S]*?\}\);?/g, '')
    .replace(/document\.addEventListener[\s\S]*?\}\);?/g, '');

// Create a module context and evaluate
const moduleContext = { module: { exports: {} }, exports: {} };
const contextCode = `
(function(module, exports) {
    ${cleanedCode}
})(moduleContext.module, moduleContext.exports);
`;

eval(contextCode);

// Extract classes from the module
const { AuthManager, AuthFormValidator, AuthErrorHandler, AuthFormHandler } = moduleContext.module.exports;

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
describe('AuthManager - Login Functionality', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        authManager = new AuthManager();
    }

    it('should successfully login with valid credentials', async () => {
        setup();
        const credentials = { username: 'demo', password: 'password' };
        
        const result = await authManager.login(credentials);
        
        expect(result.success).toBe(true);
        expect(result.user.username).toBe('demo');
        expect(result.message).toBe('Login successful');
    });

    it('should store session token in localStorage on successful login', async () => {
        setup();
        const credentials = { username: 'admin', password: 'admin123' };
        
        await authManager.login(credentials);
        
        const sessionData = global.localStorage.getItem('ticketapp_session');
        expect(sessionData).toBeTruthy();
        
        const session = JSON.parse(sessionData);
        expect(session.token).toBeTruthy();
        expect(session.user.username).toBe('admin');
        expect(session.expiresAt).toBeTruthy();
    });

    it('should fail login with invalid credentials', async () => {
        setup();
        const credentials = { username: 'invalid', password: 'wrong' };
        
        const result = await authManager.login(credentials);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid username or password');
    });

    it('should fail login with missing credentials', async () => {
        setup();
        
        const result1 = await authManager.login({});
        expect(result1.success).toBe(false);
        expect(result1.error).toContain('Username and password are required');
        
        const result2 = await authManager.login({ username: 'test' });
        expect(result2.success).toBe(false);
        expect(result2.error).toContain('Username and password are required');
    });

    it('should accept email addresses as usernames', async () => {
        setup();
        const credentials = { username: 'test@example.com', password: 'password123' };
        
        const result = await authManager.login(credentials);
        
        expect(result.success).toBe(true);
        expect(result.user.email).toBe('test@example.com');
    });
});

describe('AuthManager - Logout Functionality', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        authManager = new AuthManager();
    }

    it('should successfully logout and clear session data', () => {
        setup();
        
        // Set up a session first
        const sessionData = {
            token: 'test-token',
            user: { id: '1', username: 'test' },
            expiresAt: Date.now() + 86400000
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        global.localStorage.setItem('user_preferences', 'some-data');
        
        const result = authManager.logout();
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Logged out successfully');
        expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
        expect(global.localStorage.getItem('user_preferences')).toBe(null);
    });

    it('should handle logout when no session exists', () => {
        setup();
        
        const result = authManager.logout();
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Logged out successfully');
    });
});

describe('AuthManager - Session Validation', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        authManager = new AuthManager();
    }

    it('should return true for valid, non-expired session', () => {
        setup();
        
        const sessionData = {
            token: 'valid-token',
            user: { id: '1', username: 'test' },
            expiresAt: Date.now() + 86400000 // 24 hours from now
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        
        expect(authManager.isAuthenticated()).toBe(true);
    });

    it('should return false when no session exists', () => {
        setup();
        
        expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should return false and cleanup expired session', () => {
        setup();
        
        const expiredSessionData = {
            token: 'expired-token',
            user: { id: '1', username: 'test' },
            expiresAt: Date.now() - 1000 // 1 second ago
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(expiredSessionData));
        
        expect(authManager.isAuthenticated()).toBe(false);
        expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
    });

    it('should return false for malformed session data', () => {
        setup();
        
        global.localStorage.setItem('ticketapp_session', 'invalid-json');
        
        expect(authManager.isAuthenticated()).toBe(false);
        expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
    });

    it('should return false for session missing required properties', () => {
        setup();
        
        const incompleteSession = {
            token: 'test-token'
            // missing user and expiresAt
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(incompleteSession));
        
        expect(authManager.isAuthenticated()).toBe(false);
    });
});

describe('AuthManager - Session Management', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        authManager = new AuthManager();
    }

    it('should return session data when authenticated', () => {
        setup();
        
        const sessionData = {
            token: 'test-token',
            user: { id: '1', username: 'test' },
            expiresAt: Date.now() + 86400000
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        
        const session = authManager.getSession();
        expect(session).toBeTruthy();
        expect(session.user.username).toBe('test');
    });

    it('should return null when not authenticated', () => {
        setup();
        
        const session = authManager.getSession();
        expect(session).toBe(null);
    });

    it('should return current user data', () => {
        setup();
        
        const sessionData = {
            token: 'test-token',
            user: { id: '1', username: 'testuser', email: 'test@example.com' },
            expiresAt: Date.now() + 86400000
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        
        const user = authManager.getCurrentUser();
        expect(user).toBeTruthy();
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
    });

    it('should refresh session expiration time', () => {
        setup();
        
        const originalExpiry = Date.now() + 3600000; // 1 hour
        const sessionData = {
            token: 'test-token',
            user: { id: '1', username: 'test' },
            expiresAt: originalExpiry
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        
        const result = authManager.refreshSession();
        expect(result).toBe(true);
        
        const updatedSession = JSON.parse(global.localStorage.getItem('ticketapp_session'));
        expect(updatedSession.expiresAt).toBeGreaterThan(originalExpiry);
    });
});

describe('AuthManager - Route Protection', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        global.sessionStorage.clear();
        global.window.location.href = '';
        authManager = new AuthManager();
    }

    it('should redirect to login when not authenticated', () => {
        setup();
        
        const redirected = authManager.redirectIfNotAuth();
        
        expect(redirected).toBe(true);
        expect(global.window.location.href).toBe('/auth/login');
    });

    it('should not redirect when authenticated', () => {
        setup();
        
        const sessionData = {
            token: 'test-token',
            user: { id: '1', username: 'test' },
            expiresAt: Date.now() + 86400000
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
        
        const redirected = authManager.redirectIfNotAuth();
        
        expect(redirected).toBe(false);
        expect(global.window.location.href).toBe('');
    });

    it('should store redirect URL and message', () => {
        setup();
        
        authManager.redirectIfNotAuth('/dashboard', 'Please log in to continue');
        
        expect(global.sessionStorage.getItem('auth_redirect')).toBe('/dashboard');
        expect(global.sessionStorage.getItem('auth_message')).toBe('Please log in to continue');
    });
});

describe('AuthManager - Error Handling', () => {
    let authManager;

    function setup() {
        global.localStorage.clear();
        authManager = new AuthManager();
    }

    it('should validate credential format', async () => {
        setup();
        
        const shortUsername = { username: 'ab', password: 'password' };
        const result1 = await authManager.login(shortUsername);
        expect(result1.success).toBe(false);
        
        const shortPassword = { username: 'validuser', password: '12345' };
        const result2 = await authManager.login(shortPassword);
        expect(result2.success).toBe(false);
    });

    it('should handle malformed JSON in localStorage', () => {
        setup();
        
        global.localStorage.setItem('ticketapp_session', '{invalid json}');
        
        expect(authManager.isAuthenticated()).toBe(false);
        expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
    });
});

// Run tests and print summary
const success = testRunner.printSummary();
process.exit(success ? 0 : 1);