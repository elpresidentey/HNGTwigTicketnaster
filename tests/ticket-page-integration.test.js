/**
 * Node.js integration test runner for Ticket Page Controller
 * Run with: node tests/ticket-page-integration.test.js
 */

// Mock browser APIs for Node.js environment
global.window = {
    localStorage: {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = String(value); },
        removeItem(key) { delete this.store[key]; },
        clear() { this.store = {}; }
    },
    location: {
        href: '',
        get href() { return this._href || ''; },
        set href(value) { this._href = value; }
    },
    requestAnimationFrame: (callback) => callback(),
    performance: {
        now: () => Date.now()
    },
    addEventListener: function() {},
    dispatchEvent: function() { return true; },
    StorageEvent: function(type, options) {
        this.type = type;
        this.key = options?.key;
    },
    Event: function(type) {
        this.type = type;
    }
};

global.localStorage = global.window.localStorage;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.performance = global.window.performance;

// Mock document for DOM operations
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ 
        id: '', 
        className: '', 
        classList: { contains: () => false, add: () => {}, remove: () => {} }
    }),
    body: { appendChild: () => {} }
};

// Load the modules
const fs = require('fs');
const path = require('path');

// Load module code
const authModulePath = path.join(__dirname, '../public/assets/js/auth.js');
const authModuleCode = fs.readFileSync(authModulePath, 'utf8');

const statsModulePath = path.join(__dirname, '../public/assets/js/ticket-statistics.js');
const statsModuleCode = fs.readFileSync(statsModulePath, 'utf8');

const controllerModulePath = path.join(__dirname, '../public/assets/js/ticket-page-controller.js');
const controllerModuleCode = fs.readFileSync(controllerModulePath, 'utf8');

// Execute modules and capture classes
// Use Function constructor to execute in a scope where we can capture the class
const AuthManager = new Function(authModuleCode + '; return AuthManager;')();
const TicketStatisticsCalculator = new Function(statsModuleCode + '; return TicketStatisticsCalculator;')();

// For TicketPageController, we need to provide dependencies
const TicketPageController = new Function('AuthManager', 'TicketStatisticsCalculator', 
    controllerModuleCode + '; return TicketPageController;'
)(AuthManager, TicketStatisticsCalculator);

// Make classes available globally
global.AuthManager = AuthManager;
global.TicketStatisticsCalculator = TicketStatisticsCalculator;
global.TicketPageController = TicketPageController;

// Simple test framework
class TestRunner {
    constructor() {
        this.results = [];
        this.currentSuite = '';
    }

    describe(suiteName, testFn) {
        this.currentSuite = suiteName;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${suiteName}`);
        console.log('='.repeat(60));
        testFn();
    }

    it(testName, testFn) {
        try {
            testFn();
            this.results.push({ suite: this.currentSuite, name: testName, status: 'pass' });
            console.log(`  ✓ ${testName}`);
        } catch (error) {
            this.results.push({ 
                suite: this.currentSuite, 
                name: testName, 
                status: 'fail', 
                error: error.message 
            });
            console.error(`  ✗ ${testName}`);
            console.error(`    Error: ${error.message}`);
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
                if (typeof actual === 'string') {
                    if (!actual.includes(expected)) {
                        throw new Error(`Expected "${actual}" to contain "${expected}"`);
                    }
                } else if (Array.isArray(actual)) {
                    if (!actual.includes(expected)) {
                        throw new Error(`Expected array to contain ${expected}`);
                    }
                } else {
                    throw new Error(`toContain() requires string or array, got ${typeof actual}`);
                }
            }
        };
    }

    printSummary() {
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const total = this.results.length;
        
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`✓ Passed: ${passed}`);
        console.log(`✗ Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n' + '-'.repeat(60));
            console.log('FAILED TESTS:');
            console.log('-'.repeat(60));
            this.results.filter(r => r.status === 'fail').forEach(result => {
                console.log(`\n  Suite: ${result.suite}`);
                console.log(`  Test: ${result.name}`);
                console.log(`  Error: ${result.error}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
        
        return failed === 0;
    }
}

// Initialize test runner
const testRunner = new TestRunner();
const describe = testRunner.describe.bind(testRunner);
const it = testRunner.it.bind(testRunner);
const expect = testRunner.expect.bind(testRunner);

// Helper to create sample tickets
function createSampleTickets(counts = { open: 2, inProgress: 1, closed: 1 }) {
    const tickets = [];
    let id = 1;
    
    ['open', 'inProgress', 'closed'].forEach(statusKey => {
        const statusMap = {
            open: 'Open',
            inProgress: 'In Progress',
            closed: 'Closed'
        };
        const status = statusMap[statusKey];
        const count = counts[statusKey];
        
        for (let i = 0; i < count; i++) {
            tickets.push({
                id: `ticket_${id++}`,
                title: `${status} Ticket ${i + 1}`,
                description: 'Test ticket',
                status: status,
                createdAt: Date.now() - (i * 1000),
                updatedAt: Date.now() - (i * 1000),
                userId: 'user123'
            });
        }
    });
    
    return tickets;
}

// Helper to create mock session
function createMockSession(username = 'TestUser') {
    return {
        token: 'mock-token-123',
        user: {
            id: 'user123',
            username: username,
            email: 'test@example.com'
        },
        expiresAt: Date.now() + 3600000 // 1 hour from now
    };
}

// Run tests
describe('TicketPageController - Page Initialization', () => {
    let controller;
    let mockElements;

    function setup() {
        global.localStorage.clear();
        global.window.location.href = '';
        
        // Mock DOM elements
        mockElements = {
            username: { textContent: '' },
            totalCount: { textContent: '' },
            openCount: { textContent: '' },
            inProgressCount: { textContent: '' },
            closedCount: { textContent: '' },
            createTicketBtn: { 
                addEventListener: function() {},
                click: function() {}
            },
            viewAllTicketsBtn: { 
                addEventListener: function() {},
                click: function() {}
            }
        };

        global.document.getElementById = (id) => mockElements[id] || null;
        
        controller = new TicketPageController();
    }

    it('should redirect to login when not authenticated', () => {
        setup();
        
        // No session in localStorage
        controller.init();

        expect(global.window.location.href).toContain('/auth/login');
    });

    it('should initialize successfully when authenticated', () => {
        setup();
        
        // Set up authenticated session
        const session = createMockSession('DemoUser');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));
        
        // Set up tickets
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const initialHref = global.window.location.href;
        controller.init();

        // Should not redirect
        expect(global.window.location.href).toBe(initialHref);
    });

    it('should display username from session on initialization', () => {
        setup();
        
        // Set up authenticated session
        const session = createMockSession('JohnDoe');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));
        
        // Set up tickets
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.init();

        expect(mockElements.username.textContent).toBe('JohnDoe');
    });

    it('should calculate and display statistics on initialization', (done) => {
        setup();
        
        // Set up authenticated session
        const session = createMockSession('TestUser');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));
        
        // Set up tickets
        const tickets = createSampleTickets({ open: 3, inProgress: 2, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.init();

        // Wait for async statistics update
        setTimeout(() => {
            expect(mockElements.totalCount.textContent).toBe(6);
            expect(mockElements.openCount.textContent).toBe(3);
            expect(mockElements.inProgressCount.textContent).toBe(2);
            expect(mockElements.closedCount.textContent).toBe(1);
            done();
        }, 100);
    });

    it('should attach event listeners to action buttons', () => {
        setup();
        
        // Set up authenticated session
        const session = createMockSession('TestUser');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));
        
        let createBtnListenerAdded = false;
        let viewBtnListenerAdded = false;
        
        mockElements.createTicketBtn.addEventListener = () => { createBtnListenerAdded = true; };
        mockElements.viewAllTicketsBtn.addEventListener = () => { viewBtnListenerAdded = true; };

        controller.init();

        expect(createBtnListenerAdded).toBeTruthy();
        expect(viewBtnListenerAdded).toBeTruthy();
    });
});

describe('TicketPageController - Username Display', () => {
    let controller;
    let mockElements;

    function setup() {
        global.localStorage.clear();
        
        mockElements = {
            username: { textContent: '' }
        };

        global.document.getElementById = (id) => mockElements[id] || null;
        
        controller = new TicketPageController();
    }

    it('should display username from valid session', () => {
        setup();
        
        const session = createMockSession('AliceSmith');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));

        controller.displayUsername();

        expect(mockElements.username.textContent).toBe('AliceSmith');
    });

    it('should display fallback username when session is missing', () => {
        setup();

        controller.displayUsername();

        expect(mockElements.username.textContent).toBe('User');
    });

    it('should display fallback username when session is malformed', () => {
        setup();
        
        global.localStorage.setItem('ticketapp_session', '{invalid json}');

        controller.displayUsername();

        expect(mockElements.username.textContent).toBe('User');
    });

    it('should display fallback username when username is missing from session', () => {
        setup();
        
        const session = {
            token: 'mock-token',
            user: {
                id: 'user123',
                email: 'test@example.com'
                // username missing
            },
            expiresAt: Date.now() + 3600000
        };
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));

        controller.displayUsername();

        expect(mockElements.username.textContent).toBe('User');
    });

    it('should handle missing username element gracefully', () => {
        setup();
        
        mockElements = {}; // No username element
        global.document.getElementById = (id) => mockElements[id] || null;
        
        const session = createMockSession('TestUser');
        global.localStorage.setItem('ticketapp_session', JSON.stringify(session));

        // Should not throw error
        controller.displayUsername();

        expect(true).toBeTruthy();
    });
});

describe('TicketPageController - Navigation', () => {
    let controller;

    function setup() {
        global.localStorage.clear();
        global.window.location.href = '';
        
        controller = new TicketPageController();
    }

    it('should navigate to ticket list when View All Tickets is clicked', () => {
        setup();

        controller.handleViewAllTickets();

        expect(global.window.location.href).toContain('/tickets/list');
    });

    it('should handle Create New Ticket button click', () => {
        setup();
        
        // Mock TicketManager not being available
        global.TicketManager = undefined;

        controller.handleCreateTicket();

        // Should redirect to tickets page when TicketManager is not available
        expect(global.window.location.href).toContain('/tickets');
    });
});

describe('TicketPageController - Statistics Refresh', () => {
    let controller;
    let mockElements;

    function setup() {
        global.localStorage.clear();
        
        mockElements = {
            totalCount: { textContent: '' },
            openCount: { textContent: '' },
            inProgressCount: { textContent: '' },
            closedCount: { textContent: '' }
        };

        global.document.getElementById = (id) => mockElements[id] || null;
        
        controller = new TicketPageController();
    }

    it('should refresh statistics when called', (done) => {
        setup();
        
        const tickets = createSampleTickets({ open: 5, inProgress: 3, closed: 2 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.refreshStatistics(true);

        setTimeout(() => {
            expect(mockElements.totalCount.textContent).toBe(10);
            expect(mockElements.openCount.textContent).toBe(5);
            expect(mockElements.inProgressCount.textContent).toBe(3);
            expect(mockElements.closedCount.textContent).toBe(2);
            done();
        }, 100);
    });

    it('should update statistics after ticket creation', (done) => {
        setup();
        
        // Initial tickets
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.refreshStatistics(true);

        setTimeout(() => {
            // Add a new ticket
            tickets.push({
                id: 'ticket_new',
                title: 'New Ticket',
                description: 'Test',
                status: 'Open',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                userId: 'user123'
            });
            global.localStorage.setItem('tickets', JSON.stringify(tickets));

            // Refresh statistics
            controller.refreshStatisticsPublic(true);

            setTimeout(() => {
                expect(mockElements.totalCount.textContent).toBe(5);
                expect(mockElements.openCount.textContent).toBe(3);
                done();
            }, 100);
        }, 100);
    });

    it('should update statistics after ticket status change', (done) => {
        setup();
        
        // Initial tickets
        const tickets = createSampleTickets({ open: 3, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.refreshStatistics(true);

        setTimeout(() => {
            // Change a ticket status from Open to Closed
            tickets[0].status = 'Closed';
            global.localStorage.setItem('tickets', JSON.stringify(tickets));

            // Refresh statistics
            controller.refreshStatisticsPublic(true);

            setTimeout(() => {
                expect(mockElements.openCount.textContent).toBe(2);
                expect(mockElements.closedCount.textContent).toBe(2);
                done();
            }, 100);
        }, 100);
    });

    it('should update statistics after ticket deletion', (done) => {
        setup();
        
        // Initial tickets
        let tickets = createSampleTickets({ open: 3, inProgress: 2, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.refreshStatistics(true);

        setTimeout(() => {
            // Delete a ticket
            tickets = tickets.slice(1);
            global.localStorage.setItem('tickets', JSON.stringify(tickets));

            // Refresh statistics
            controller.refreshStatisticsPublic(true);

            setTimeout(() => {
                expect(mockElements.totalCount.textContent).toBe(5);
                done();
            }, 100);
        }, 100);
    });

    it('should handle empty tickets after deletion', (done) => {
        setup();
        
        // Initial tickets
        const tickets = createSampleTickets({ open: 1, inProgress: 0, closed: 0 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        controller.refreshStatistics(true);

        setTimeout(() => {
            // Delete all tickets
            global.localStorage.setItem('tickets', JSON.stringify([]));

            // Refresh statistics
            controller.refreshStatisticsPublic(true);

            setTimeout(() => {
                expect(mockElements.totalCount.textContent).toBe(0);
                expect(mockElements.openCount.textContent).toBe(0);
                expect(mockElements.inProgressCount.textContent).toBe(0);
                expect(mockElements.closedCount.textContent).toBe(0);
                done();
            }, 100);
        }, 100);
    });
});

describe('TicketPageController - Event Listeners', () => {
    let controller;
    let eventListeners;

    function setup() {
        global.localStorage.clear();
        
        // Track event listeners
        eventListeners = {};
        global.window.addEventListener = (event, handler) => {
            if (!eventListeners[event]) {
                eventListeners[event] = [];
            }
            eventListeners[event].push(handler);
        };
        
        global.window.dispatchEvent = (event) => {
            const handlers = eventListeners[event.type] || [];
            handlers.forEach(handler => handler(event));
            return true;
        };
        
        controller = new TicketPageController();
    }

    it('should listen for ticketCreated event', (done) => {
        setup();
        
        let refreshCalled = false;
        controller.refreshStatisticsPublic = () => { refreshCalled = true; };

        // Set up event listener
        controller.setupTicketChangeListeners();

        // Dispatch event
        global.window.dispatchEvent(new global.window.Event('ticketCreated'));

        setTimeout(() => {
            expect(refreshCalled).toBeTruthy();
            done();
        }, 50);
    });

    it('should listen for ticketUpdated event', (done) => {
        setup();
        
        let refreshCalled = false;
        controller.refreshStatisticsPublic = () => { refreshCalled = true; };

        // Set up event listener
        controller.setupTicketChangeListeners();

        // Dispatch event
        global.window.dispatchEvent(new global.window.Event('ticketUpdated'));

        setTimeout(() => {
            expect(refreshCalled).toBeTruthy();
            done();
        }, 50);
    });

    it('should listen for ticketDeleted event', (done) => {
        setup();
        
        let refreshCalled = false;
        controller.refreshStatisticsPublic = () => { refreshCalled = true; };

        // Set up event listener
        controller.setupTicketChangeListeners();

        // Dispatch event
        global.window.dispatchEvent(new global.window.Event('ticketDeleted'));

        setTimeout(() => {
            expect(refreshCalled).toBeTruthy();
            done();
        }, 50);
    });

    it('should listen for storage changes', (done) => {
        setup();
        
        let refreshCalled = false;
        controller.refreshStatisticsPublic = () => { refreshCalled = true; };

        // Set up event listener
        controller.setupTicketChangeListeners();

        // Dispatch storage event
        const storageEvent = new global.window.StorageEvent('storage', { key: 'tickets' });
        global.window.dispatchEvent(storageEvent);

        setTimeout(() => {
            expect(refreshCalled).toBeTruthy();
            done();
        }, 50);
    });
});

// Run tests and print summary
const success = testRunner.printSummary();
process.exit(success ? 0 : 1);

