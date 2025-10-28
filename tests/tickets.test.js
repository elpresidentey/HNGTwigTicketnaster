/**
 * Node.js test runner for ticket management module
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

// Mock document for DOM operations
global.document = {
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        className: '',
        innerHTML: '',
        id: '',
        classList: {
            add: function() {},
            remove: function() {},
            contains: function() { return false; }
        },
        setAttribute: function() {},
        getAttribute: function() { return null; },
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; },
        appendChild: function() {},
        remove: function() {}
    }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
        appendChild: function() {},
        insertBefore: function() {}
    }
};

// Load the required modules
const fs = require('fs');
const path = require('path');

// Read and evaluate the auth.js file
const authModulePath = path.join(__dirname, '../public/assets/js/auth.js');
const authModuleCode = fs.readFileSync(authModulePath, 'utf8');

// Read and evaluate the tickets.js file
const ticketsModulePath = path.join(__dirname, '../public/assets/js/tickets.js');
const ticketsModuleCode = fs.readFileSync(ticketsModulePath, 'utf8');

// Remove browser-specific code and evaluate
const cleanAuthCode = authModuleCode
    .replace(/if \(typeof document !== 'undefined'\) \{[\s\S]*?\}\);?/g, '')
    .replace(/document\.addEventListener[\s\S]*?\}\);?/g, '');

const cleanTicketsCode = ticketsModuleCode
    .replace(/if \(typeof document !== 'undefined'\) \{[\s\S]*?\}\);?/g, '')
    .replace(/document\.addEventListener[\s\S]*?\}\);?/g, '');

// Create module contexts and evaluate
const authModuleContext = { module: { exports: {} }, exports: {} };
const ticketsModuleContext = { module: { exports: {} }, exports: {} };

const authContextCode = `
(function(module, exports) {
    ${cleanAuthCode}
})(authModuleContext.module, authModuleContext.exports);
`;

const ticketsContextCode = `
(function(module, exports) {
    ${cleanTicketsCode}
})(ticketsModuleContext.module, ticketsModuleContext.exports);
`;

eval(authContextCode);
eval(ticketsContextCode);

// Extract classes from the modules
const { AuthManager } = authModuleContext.module.exports;
const { TicketManager, TicketValidator, TicketErrorHandler } = ticketsModuleContext.module.exports;

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
            toHaveLength: (expected) => {
                if (!actual || actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
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

// Helper function to create authenticated session
function createAuthenticatedSession() {
    const sessionData = {
        token: 'test-token',
        user: { id: 'user123', username: 'testuser', email: 'test@example.com' },
        expiresAt: Date.now() + 86400000
    };
    global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
}

// Helper function to create sample tickets
function createSampleTickets() {
    return [
        {
            id: 'ticket_1',
            title: 'Test Ticket 1',
            description: 'First test ticket',
            status: 'Open',
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
            userId: 'user123'
        },
        {
            id: 'ticket_2',
            title: 'Test Ticket 2',
            description: 'Second test ticket',
            status: 'In Progress',
            createdAt: Date.now() - 43200000,
            updatedAt: Date.now() - 43200000,
            userId: 'user123'
        }
    ];
}

// Run tests
describe('TicketManager - CRUD Operations', () => {
    let ticketManager;

    function setup() {
        global.localStorage.clear();
        createAuthenticatedSession();
        ticketManager = new TicketManager();
    }

    it('should create a new ticket with valid data', async () => {
        setup();
        
        const ticketData = {
            title: 'New Test Ticket',
            description: 'This is a test ticket',
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(true);
        expect(result.ticket.title).toBe('New Test Ticket');
        expect(result.ticket.description).toBe('This is a test ticket');
        expect(result.ticket.status).toBe('Open');
        expect(result.ticket.id).toBeTruthy();
        expect(result.ticket.userId).toBe('user123');
    });

    it('should fail to create ticket without authentication', async () => {
        global.localStorage.clear();
        ticketManager = new TicketManager();

        const ticketData = {
            title: 'Test Ticket',
            description: 'Test description',
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(false);
        expect(result.error).toContain('authenticated');
    });

    it('should retrieve all tickets for current user', () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const tickets = ticketManager.getTickets();

        expect(tickets).toHaveLength(2);
        expect(tickets[0].title).toBe('Test Ticket 2'); // Newest first
        expect(tickets[1].title).toBe('Test Ticket 1');
    });

    it('should return empty array when no tickets exist', () => {
        setup();

        const tickets = ticketManager.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should update an existing ticket', async () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const updates = {
            title: 'Updated Ticket Title',
            status: 'Closed'
        };

        const result = await ticketManager.updateTicket('ticket_1', updates);

        expect(result.success).toBe(true);
        expect(result.ticket.title).toBe('Updated Ticket Title');
        expect(result.ticket.status).toBe('Closed');
        expect(result.ticket.updatedAt).toBeGreaterThan(result.ticket.createdAt);
    });

    it('should fail to update non-existent ticket', async () => {
        setup();

        const updates = { title: 'Updated Title' };
        const result = await ticketManager.updateTicket('nonexistent', updates);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });

    it('should delete a ticket with confirmation', async () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const result = await ticketManager.deleteTicket('ticket_1', true);

        expect(result.success).toBe(true);
        expect(result.deletedTicket.id).toBe('ticket_1');
        
        const remainingTickets = ticketManager.getTickets();
        expect(remainingTickets).toHaveLength(1);
        expect(remainingTickets[0].id).toBe('ticket_2');
    });

    it('should require confirmation for ticket deletion', async () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const result = await ticketManager.deleteTicket('ticket_1', false);

        expect(result.success).toBe(false);
        expect(result.requiresConfirmation).toBe(true);
        expect(result.ticket.id).toBe('ticket_1');
    });
});

describe('TicketManager - Validation Logic', () => {
    let ticketManager;

    function setup() {
        global.localStorage.clear();
        createAuthenticatedSession();
        ticketManager = new TicketManager();
    }

    it('should validate required title field', async () => {
        setup();

        const ticketData = {
            description: 'Test description',
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(false);
        expect(result.errors.title).toBeTruthy();
    });

    it('should validate title length limits', async () => {
        setup();

        const longTitle = 'a'.repeat(101);
        const ticketData = {
            title: longTitle,
            description: 'Test description',
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(false);
        expect(result.errors.title).toContain('100 characters');
    });

    it('should validate status values', async () => {
        setup();

        const ticketData = {
            title: 'Test Ticket',
            description: 'Test description',
            status: 'Invalid Status'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(false);
        expect(result.errors.status).toBeTruthy();
    });

    it('should validate description length', async () => {
        setup();

        const longDescription = 'a'.repeat(501);
        const ticketData = {
            title: 'Test Ticket',
            description: longDescription,
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(false);
        expect(result.errors.description).toContain('500 characters');
    });

    it('should allow empty description', async () => {
        setup();

        const ticketData = {
            title: 'Test Ticket',
            description: '',
            status: 'Open'
        };

        const result = await ticketManager.createTicket(ticketData);

        expect(result.success).toBe(true);
        expect(result.ticket.description).toBe('');
    });
});

describe('TicketManager - Utility Methods', () => {
    let ticketManager;

    function setup() {
        global.localStorage.clear();
        createAuthenticatedSession();
        ticketManager = new TicketManager();
    }

    it('should get ticket by ID', () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const ticket = ticketManager.getTicketById('ticket_1');

        expect(ticket).toBeTruthy();
        expect(ticket.title).toBe('Test Ticket 1');
    });

    it('should return null for non-existent ticket ID', () => {
        setup();

        const ticket = ticketManager.getTicketById('nonexistent');

        expect(ticket).toBe(null);
    });

    it('should get tickets by status', () => {
        setup();
        
        const sampleTickets = createSampleTickets();
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const openTickets = ticketManager.getTicketsByStatus('Open');
        const inProgressTickets = ticketManager.getTicketsByStatus('In Progress');

        expect(openTickets).toHaveLength(1);
        expect(openTickets[0].status).toBe('Open');
        expect(inProgressTickets).toHaveLength(1);
        expect(inProgressTickets[0].status).toBe('In Progress');
    });

    it('should generate ticket statistics', () => {
        setup();
        
        const sampleTickets = [
            ...createSampleTickets(),
            {
                id: 'ticket_3',
                title: 'Closed Ticket',
                description: 'Closed test ticket',
                status: 'Closed',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                userId: 'user123'
            }
        ];
        global.localStorage.setItem('tickets', JSON.stringify(sampleTickets));

        const stats = ticketManager.getTicketStats();

        expect(stats.total).toBe(3);
        expect(stats.open).toBe(1);
        expect(stats.inProgress).toBe(1);
        expect(stats.closed).toBe(1);
    });

    it('should generate unique ticket IDs', () => {
        setup();

        const id1 = ticketManager.generateTicketId();
        const id2 = ticketManager.generateTicketId();

        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1 !== id2).toBe(true);
        expect(id1).toContain('ticket_');
        expect(id2).toContain('ticket_');
    });
});

describe('TicketValidator - Field Validation', () => {
    let validator;

    function setup() {
        validator = new TicketValidator();
    }

    it('should validate create ticket data', () => {
        setup();

        const validData = {
            title: 'Valid Title',
            description: 'Valid description',
            status: 'Open'
        };

        const result = validator.validateCreateTicket(validData);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject invalid title', () => {
        setup();

        const invalidData = {
            title: '',
            description: 'Valid description',
            status: 'Open'
        };

        const result = validator.validateCreateTicket(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.title).toBeTruthy();
    });

    it('should reject title that is too long', () => {
        setup();

        const invalidData = {
            title: 'a'.repeat(101),
            description: 'Valid description',
            status: 'Open'
        };

        const result = validator.validateCreateTicket(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.title).toContain('100 characters');
    });

    it('should reject title that is too short', () => {
        setup();

        const invalidData = {
            title: 'ab',
            description: 'Valid description',
            status: 'Open'
        };

        const result = validator.validateCreateTicket(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.title).toContain('3 characters');
    });

    it('should reject invalid status', () => {
        setup();

        const invalidData = {
            title: 'Valid Title',
            description: 'Valid description',
            status: 'Invalid Status'
        };

        const result = validator.validateCreateTicket(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.status).toBeTruthy();
    });

    it('should reject description that is too long', () => {
        setup();

        const invalidData = {
            title: 'Valid Title',
            description: 'a'.repeat(501),
            status: 'Open'
        };

        const result = validator.validateCreateTicket(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.description).toContain('500 characters');
    });

    it('should validate update data with partial fields', () => {
        setup();

        const updateData = {
            title: 'Updated Title'
        };

        const result = validator.validateUpdateTicket(updateData);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });
});

describe('TicketErrorHandler - Error Handling', () => {
    let errorHandler;

    function setup() {
        errorHandler = new TicketErrorHandler();
    }

    it('should handle storage quota exceeded error', () => {
        setup();

        const quotaError = new Error('Storage quota exceeded');
        quotaError.name = 'QuotaExceededError';

        const result = errorHandler.handleStorageError(quotaError, 'create ticket');

        expect(result.success).toBe(false);
        expect(result.errorType).toBe('quota');
        expect(result.error).toContain('Storage limit reached');
    });

    it('should handle security errors', () => {
        setup();

        const securityError = new Error('Security error');
        securityError.name = 'SecurityError';

        const result = errorHandler.handleStorageError(securityError, 'save data');

        expect(result.success).toBe(false);
        expect(result.errorType).toBe('security');
        expect(result.error).toContain('Storage access denied');
    });

    it('should handle validation errors', () => {
        setup();

        const errors = {
            title: 'Title is required',
            status: 'Invalid status'
        };

        const result = errorHandler.handleValidationErrors(errors, 'ticket creation');

        expect(result.success).toBe(false);
        expect(result.errorType).toBe('validation');
        expect(result.errors).toEqual(errors);
    });

    it('should handle authentication errors', () => {
        setup();

        const result = errorHandler.handleAuthError('User not authenticated');

        expect(result.success).toBe(false);
        expect(result.errorType).toBe('authentication');
        expect(result.requiresAuth).toBe(true);
    });

    it('should handle general application errors', () => {
        setup();

        const appError = new Error('Something went wrong');
        const result = errorHandler.handleApplicationError(appError, 'ticket processing');

        expect(result.success).toBe(false);
        expect(result.errorType).toBe('application');
        expect(result.error).toContain('unexpected error');
    });
});

// Run tests and print summary
const success = testRunner.printSummary();
process.exit(success ? 0 : 1);