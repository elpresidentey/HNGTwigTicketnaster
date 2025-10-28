/**
 * End-to-End Integration Test Runner
 * Node.js version of the integration tests for automated testing
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
    location: { href: '', pathname: '/' },
    navigator: { userAgent: 'Node.js Test Environment' },
    document: {
        addEventListener: () => {},
        createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } }),
        body: { classList: { add: () => {}, remove: () => {} } }
    },
    addEventListener: () => {},
    showTicketToast: (type, message) => {
        console.log(`Toast [${type}]: ${message}`);
    }
};

global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;
global.document = global.window.document;
global.navigator = global.window.navigator;

// Load required modules
const fs = require('fs');
const path = require('path');

// Helper function to load and evaluate JavaScript modules
function loadModule(modulePath) {
    const fullPath = path.join(__dirname, '..', modulePath);
    const moduleCode = fs.readFileSync(fullPath, 'utf8');
    
    // Clean up browser-specific code
    const cleanedCode = moduleCode
        .replace(/if \(typeof document !== 'undefined'\)[\s\S]*?\}\);?/g, '')
        .replace(/document\.addEventListener[\s\S]*?\}\);?/g, '')
        .replace(/window\.addEventListener[\s\S]*?\}\);?/g, '');
    
    // Create module context
    const moduleContext = { 
        module: { exports: {} }, 
        exports: {},
        window: global.window,
        localStorage: global.localStorage,
        sessionStorage: global.sessionStorage,
        document: global.document,
        console: console
    };
    
    // Evaluate in context
    const contextCode = `
        (function(module, exports, window, localStorage, sessionStorage, document, console) {
            ${cleanedCode}
        })(moduleContext.module, moduleContext.exports, moduleContext.window, moduleContext.localStorage, moduleContext.sessionStorage, moduleContext.document, moduleContext.console);
    `;
    
    try {
        eval(contextCode);
        return moduleContext.module.exports;
    } catch (error) {
        console.warn(`Failed to load module ${modulePath}:`, error.message);
        return {};
    }
}

// Load all required modules
console.log('Loading modules...');
const utilsModule = loadModule('public/assets/js/utils.js');
console.log('Utils module loaded');
const authModule = loadModule('public/assets/js/auth.js');
console.log('Auth module loaded');
const ticketsModule = loadModule('public/assets/js/tickets.js');
console.log('Tickets module loaded');

// Extract classes from modules
const { AuthManager, AuthFormValidator, AuthErrorHandler } = authModule;
const { TicketManager, TicketValidator, TicketRenderer } = ticketsModule;

// Test framework
class E2ETestRunner {
    constructor() {
        this.results = [];
        this.currentSuite = '';
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    describe(suiteName, testFn) {
        this.currentSuite = suiteName;
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Testing: ${suiteName}`);
        console.log('='.repeat(50));
        return testFn();
    }

    async it(testName, testFn) {
        this.totalTests++;
        try {
            await testFn();
            this.results.push({ suite: this.currentSuite, name: testName, status: 'pass' });
            this.passedTests++;
            console.log(`✓ ${testName}`);
        } catch (error) {
            this.results.push({ 
                suite: this.currentSuite, 
                name: testName, 
                status: 'fail', 
                error: error.message 
            });
            this.failedTests++;
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
            toHaveLength: (expected) => {
                if (!actual || actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
                }
            }
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('END-TO-END INTEGRATION TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`✓ Passed: ${this.passedTests}`);
        console.log(`✗ Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
        
        if (this.failedTests > 0) {
            console.log('\nFailed Tests:');
            this.results.filter(r => r.status === 'fail').forEach(result => {
                console.log(`  - ${result.suite}: ${result.name}`);
                console.log(`    Error: ${result.error}`);
            });
        }
        
        console.log('='.repeat(60));
        return this.failedTests === 0;
    }
}

// Test setup helper
function setupTestEnvironment() {
    global.localStorage.clear();
    global.sessionStorage.clear();
    global.window.location.href = '';
}

// Main test execution
async function runE2EIntegrationTests() {
    const testRunner = new E2ETestRunner();

    console.log('Starting End-to-End Integration Tests...\n');

    // Authentication Flow Tests
    await testRunner.describe('Authentication Flow Integration', async () => {
        setupTestEnvironment();

        await testRunner.it('should initialize authentication system', async () => {
            const authManager = new AuthManager();
            testRunner.expect(authManager).toBeTruthy();
            testRunner.expect(typeof authManager.login).toBe('function');
            testRunner.expect(typeof authManager.logout).toBe('function');
            testRunner.expect(typeof authManager.isAuthenticated).toBe('function');
        });

        await testRunner.it('should complete full authentication workflow', async () => {
            const authManager = new AuthManager();
            
            // Initial state - not authenticated
            testRunner.expect(authManager.isAuthenticated()).toBeFalsy();
            
            // Login with valid credentials
            const loginResult = await authManager.login({ username: 'demo', password: 'password' });
            testRunner.expect(loginResult.success).toBeTruthy();
            testRunner.expect(loginResult.user).toBeTruthy();
            testRunner.expect(loginResult.user.username).toBe('demo');
            
            // Should be authenticated after login
            testRunner.expect(authManager.isAuthenticated()).toBeTruthy();
            
            // Should have valid session
            const session = authManager.getSession();
            testRunner.expect(session).toBeTruthy();
            testRunner.expect(session.token).toBeTruthy();
            testRunner.expect(session.user.username).toBe('demo');
            
            // Logout
            const logoutResult = authManager.logout();
            testRunner.expect(logoutResult.success).toBeTruthy();
            
            // Should not be authenticated after logout
            testRunner.expect(authManager.isAuthenticated()).toBeFalsy();
        });

        await testRunner.it('should handle authentication errors gracefully', async () => {
            const authManager = new AuthManager();
            
            // Test invalid credentials
            const invalidResult = await authManager.login({ username: 'invalid', password: 'wrong' });
            testRunner.expect(invalidResult.success).toBeFalsy();
            testRunner.expect(invalidResult.error).toContain('Invalid username or password');
            
            // Test missing credentials
            const missingResult = await authManager.login({});
            testRunner.expect(missingResult.success).toBeFalsy();
            testRunner.expect(missingResult.error).toContain('Username and password are required');
        });

        await testRunner.it('should handle session expiration', async () => {
            const authManager = new AuthManager();
            
            // Set expired session manually
            const expiredSession = {
                token: 'expired-token',
                user: { id: '1', username: 'test' },
                expiresAt: Date.now() - 1000
            };
            global.localStorage.setItem('ticketapp_session', JSON.stringify(expiredSession));
            
            // Should detect expired session
            testRunner.expect(authManager.isAuthenticated()).toBeFalsy();
            
            // Session should be cleaned up
            testRunner.expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
        });
    });

    // Ticket CRUD Workflow Tests
    await testRunner.describe('Ticket CRUD Workflow Integration', async () => {
        setupTestEnvironment();
        
        // Setup authenticated session
        const authManager = new AuthManager();
        await authManager.login({ username: 'demo', password: 'password' });

        await testRunner.it('should initialize ticket management system', async () => {
            const ticketManager = new TicketManager();
            testRunner.expect(ticketManager).toBeTruthy();
            testRunner.expect(typeof ticketManager.createTicket).toBe('function');
            testRunner.expect(typeof ticketManager.getTickets).toBe('function');
            testRunner.expect(typeof ticketManager.updateTicket).toBe('function');
            testRunner.expect(typeof ticketManager.deleteTicket).toBe('function');
        });

        await testRunner.it('should complete full CRUD workflow', async () => {
            const ticketManager = new TicketManager();
            
            // CREATE - Create a new ticket
            const createData = {
                title: 'E2E Test Ticket',
                description: 'This is a comprehensive end-to-end test ticket',
                status: 'Open'
            };
            
            const createResult = await ticketManager.createTicket(createData);
            testRunner.expect(createResult.success).toBeTruthy();
            testRunner.expect(createResult.ticket).toBeTruthy();
            testRunner.expect(createResult.ticket.title).toBe(createData.title);
            testRunner.expect(createResult.ticket.id).toBeTruthy();
            
            const ticketId = createResult.ticket.id;
            
            // READ - Retrieve the ticket
            const retrievedTicket = ticketManager.getTicketById(ticketId);
            testRunner.expect(retrievedTicket).toBeTruthy();
            testRunner.expect(retrievedTicket.title).toBe(createData.title);
            testRunner.expect(retrievedTicket.description).toBe(createData.description);
            
            // UPDATE - Modify the ticket
            const updateData = {
                title: 'Updated E2E Test Ticket',
                description: 'Updated description for comprehensive testing',
                status: 'In Progress'
            };
            
            const updateResult = await ticketManager.updateTicket(ticketId, updateData);
            testRunner.expect(updateResult.success).toBeTruthy();
            
            const updatedTicket = ticketManager.getTicketById(ticketId);
            testRunner.expect(updatedTicket.title).toBe(updateData.title);
            testRunner.expect(updatedTicket.description).toBe(updateData.description);
            testRunner.expect(updatedTicket.status).toBe(updateData.status);
            
            // DELETE - Remove the ticket
            const initialCount = ticketManager.getTickets().length;
            const deleteResult = await ticketManager.deleteTicket(ticketId, true);
            testRunner.expect(deleteResult.success).toBeTruthy();
            
            const finalCount = ticketManager.getTickets().length;
            testRunner.expect(finalCount).toBe(initialCount - 1);
            
            const deletedTicket = ticketManager.getTicketById(ticketId);
            testRunner.expect(deletedTicket).toBeFalsy();
        });

        await testRunner.it('should handle ticket validation correctly', async () => {
            const ticketManager = new TicketManager();
            
            // Test invalid ticket data
            const invalidTicket = { title: '', description: '', status: 'InvalidStatus' };
            const result = await ticketManager.createTicket(invalidTicket);
            
            testRunner.expect(result.success).toBeFalsy();
            testRunner.expect(result.errors).toBeTruthy();
            testRunner.expect(result.errors.title).toBeTruthy();
        });

        await testRunner.it('should generate accurate statistics', async () => {
            const ticketManager = new TicketManager();
            
            // Create tickets with different statuses
            await ticketManager.createTicket({ title: 'Open 1', description: 'Test', status: 'Open' });
            await ticketManager.createTicket({ title: 'Open 2', description: 'Test', status: 'Open' });
            await ticketManager.createTicket({ title: 'Progress 1', description: 'Test', status: 'In Progress' });
            await ticketManager.createTicket({ title: 'Closed 1', description: 'Test', status: 'Closed' });
            
            const stats = ticketManager.getTicketStats();
            testRunner.expect(stats).toBeTruthy();
            testRunner.expect(stats.open).toBeGreaterThan(0);
            testRunner.expect(stats.inProgress).toBeGreaterThan(0);
            testRunner.expect(stats.closed).toBeGreaterThan(0);
            
            // Verify total consistency
            const allTickets = ticketManager.getTickets();
            const totalFromStats = stats.open + stats.inProgress + stats.closed;
            testRunner.expect(totalFromStats).toBe(allTickets.length);
        });
    });

    // Full Integration Workflow Tests
    await testRunner.describe('Complete System Integration', async () => {
        setupTestEnvironment();

        await testRunner.it('should handle complete user journey', async () => {
            // Step 1: User authentication
            const authManager = new AuthManager();
            const loginResult = await authManager.login({ username: 'admin', password: 'admin123' });
            testRunner.expect(loginResult.success).toBeTruthy();
            testRunner.expect(authManager.isAuthenticated()).toBeTruthy();
            
            // Step 2: Ticket management operations
            const ticketManager = new TicketManager();
            
            // Create multiple tickets
            const tickets = [];
            for (let i = 1; i <= 3; i++) {
                const result = await ticketManager.createTicket({
                    title: `Journey Ticket ${i}`,
                    description: `Complete user journey test ticket ${i}`,
                    status: i === 1 ? 'Open' : i === 2 ? 'In Progress' : 'Closed'
                });
                testRunner.expect(result.success).toBeTruthy();
                tickets.push(result.ticket);
            }
            
            // Step 3: Update tickets
            const updateResult = await ticketManager.updateTicket(tickets[0].id, {
                title: 'Updated Journey Ticket 1',
                status: 'In Progress'
            });
            testRunner.expect(updateResult.success).toBeTruthy();
            
            // Step 4: Verify statistics
            const stats = ticketManager.getTicketStats();
            testRunner.expect(stats.inProgress).toBeGreaterThan(1);
            
            // Step 5: Clean up and logout
            await ticketManager.deleteTicket(tickets[2].id, true);
            const logoutResult = authManager.logout();
            testRunner.expect(logoutResult.success).toBeTruthy();
            testRunner.expect(authManager.isAuthenticated()).toBeFalsy();
        });

        await testRunner.it('should handle concurrent operations safely', async () => {
            const authManager = new AuthManager();
            await authManager.login({ username: 'demo', password: 'password' });
            
            const ticketManager = new TicketManager();
            
            // Create multiple tickets concurrently
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(ticketManager.createTicket({
                    title: `Concurrent Ticket ${i}`,
                    description: `Testing concurrent operations ${i}`,
                    status: 'Open'
                }));
            }
            
            const results = await Promise.all(promises);
            
            // All operations should succeed
            results.forEach((result, index) => {
                testRunner.expect(result.success).toBeTruthy();
                testRunner.expect(result.ticket.title).toContain(`Concurrent Ticket ${index}`);
            });
            
            // All tickets should have unique IDs
            const ids = results.map(r => r.ticket.id);
            const uniqueIds = [...new Set(ids)];
            testRunner.expect(uniqueIds.length).toBe(ids.length);
        });

        await testRunner.it('should maintain data consistency across operations', async () => {
            const authManager = new AuthManager();
            await authManager.login({ username: 'demo', password: 'password' });
            
            const ticketManager1 = new TicketManager();
            const ticketManager2 = new TicketManager();
            
            // Create ticket with first instance
            const createResult = await ticketManager1.createTicket({
                title: 'Consistency Test',
                description: 'Testing data consistency',
                status: 'Open'
            });
            testRunner.expect(createResult.success).toBeTruthy();
            
            // Read with second instance
            const tickets = ticketManager2.getTickets();
            const foundTicket = tickets.find(t => t.id === createResult.ticket.id);
            testRunner.expect(foundTicket).toBeTruthy();
            testRunner.expect(foundTicket.title).toBe('Consistency Test');
            
            // Update with second instance
            const updateResult = await ticketManager2.updateTicket(createResult.ticket.id, {
                title: 'Updated Consistency Test',
                status: 'Closed'
            });
            testRunner.expect(updateResult.success).toBeTruthy();
            
            // Verify with first instance
            const updatedTicket = ticketManager1.getTicketById(createResult.ticket.id);
            testRunner.expect(updatedTicket.title).toBe('Updated Consistency Test');
            testRunner.expect(updatedTicket.status).toBe('Closed');
        });
    });

    // Error Handling and Recovery Tests
    await testRunner.describe('Error Handling and Recovery', async () => {
        setupTestEnvironment();

        await testRunner.it('should handle storage errors gracefully', async () => {
            // Simulate localStorage failure
            const originalSetItem = global.localStorage.setItem;
            global.localStorage.setItem = () => {
                throw new Error('Storage quota exceeded');
            };
            
            try {
                const authManager = new AuthManager();
                // Should not crash even if storage fails
                const result = await authManager.login({ username: 'demo', password: 'password' });
                // May succeed or fail, but should return a valid result object
                testRunner.expect(typeof result).toBe('object');
                testRunner.expect(typeof result.success).toBe('boolean');
            } finally {
                // Restore original function
                global.localStorage.setItem = originalSetItem;
            }
        });

        await testRunner.it('should recover from corrupted data', async () => {
            // Set corrupted session data
            global.localStorage.setItem('ticketapp_session', 'corrupted-data');
            global.localStorage.setItem('tickets', 'also-corrupted');
            
            const authManager = new AuthManager();
            const ticketManager = new TicketManager();
            
            // Should handle corrupted data gracefully
            testRunner.expect(authManager.isAuthenticated()).toBeFalsy();
            
            const tickets = ticketManager.getTickets();
            testRunner.expect(Array.isArray(tickets)).toBeTruthy();
            
            // Should be able to continue normal operations
            const loginResult = await authManager.login({ username: 'demo', password: 'password' });
            testRunner.expect(loginResult.success).toBeTruthy();
            
            const createResult = await ticketManager.createTicket({
                title: 'Recovery Test',
                description: 'Testing recovery from corruption',
                status: 'Open'
            });
            testRunner.expect(createResult.success).toBeTruthy();
        });

        await testRunner.it('should maintain system stability after errors', async () => {
            const authManager = new AuthManager();
            const ticketManager = new TicketManager();
            
            // Login successfully
            await authManager.login({ username: 'admin', password: 'admin123' });
            
            // Try operations that should fail
            const invalidTicketResult = await ticketManager.createTicket({
                title: '', // Invalid - empty title
                description: '',
                status: 'InvalidStatus'
            });
            testRunner.expect(invalidTicketResult.success).toBeFalsy();
            
            // System should still be stable
            testRunner.expect(authManager.isAuthenticated()).toBeTruthy();
            
            // Valid operations should still work
            const validResult = await ticketManager.createTicket({
                title: 'Stability Test',
                description: 'Testing system stability after errors',
                status: 'Open'
            });
            testRunner.expect(validResult.success).toBeTruthy();
        });

        await testRunner.it('should handle rapid successive operations', async () => {
            const authManager = new AuthManager();
            await authManager.login({ username: 'demo', password: 'password' });
            
            const ticketManager = new TicketManager();
            
            // Perform rapid operations
            const operations = [];
            for (let i = 0; i < 10; i++) {
                operations.push(
                    ticketManager.createTicket({
                        title: `Rapid Test ${i}`,
                        description: `Rapid operation test ${i}`,
                        status: 'Open'
                    })
                );
            }
            
            const results = await Promise.all(operations);
            
            // All operations should complete
            testRunner.expect(results).toHaveLength(10);
            
            // Most should succeed (allowing for some potential conflicts)
            const successCount = results.filter(r => r.success).length;
            testRunner.expect(successCount).toBeGreaterThan(7); // At least 70% success rate
        });
    });

    // Print final results
    const success = testRunner.printSummary();
    return success;
}

// Run tests if this file is executed directly
if (require.main === module) {
    console.log('Starting End-to-End Integration Tests...\n');
    
    runE2EIntegrationTests()
        .then(success => {
            console.log('\nTest execution completed.');
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runE2EIntegrationTests, E2ETestRunner };