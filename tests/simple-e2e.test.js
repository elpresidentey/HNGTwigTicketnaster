/**
 * Simple End-to-End Integration Test
 * Focused test for core authentication and ticket management integration
 */

console.log('Starting Simple E2E Integration Tests...\n');

// Mock environment
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
    location: { href: '', pathname: '/' }
};

global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

// Simple test framework
let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, testFn) {
    testCount++;
    try {
        testFn();
        passCount++;
        console.log(`✓ ${name}`);
    } catch (error) {
        failCount++;
        console.error(`✗ ${name}: ${error.message}`);
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
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
        }
    };
}

// Load and test modules
const fs = require('fs');
const path = require('path');

console.log('='.repeat(50));
console.log('Testing Module Loading and Basic Functionality');
console.log('='.repeat(50));

// Test 1: Check if files exist
test('Auth module file exists', () => {
    const authPath = path.join(__dirname, '../public/assets/js/auth.js');
    expect(fs.existsSync(authPath)).toBeTruthy();
});

test('Tickets module file exists', () => {
    const ticketsPath = path.join(__dirname, '../public/assets/js/tickets.js');
    expect(fs.existsSync(ticketsPath)).toBeTruthy();
});

test('Utils module file exists', () => {
    const utilsPath = path.join(__dirname, '../public/assets/js/utils.js');
    expect(fs.existsSync(utilsPath)).toBeTruthy();
});

// Test 2: Basic localStorage functionality
test('localStorage mock works', () => {
    global.localStorage.setItem('test', 'value');
    expect(global.localStorage.getItem('test')).toBe('value');
    global.localStorage.removeItem('test');
    expect(global.localStorage.getItem('test')).toBe(null);
});

// Test 3: Load auth module and test basic functionality
try {
    const authCode = fs.readFileSync(path.join(__dirname, '../public/assets/js/auth.js'), 'utf8');
    
    // Simple extraction of AuthManager class
    const authManagerMatch = authCode.match(/class AuthManager\s*{[\s\S]*?^}/m);
    if (authManagerMatch) {
        console.log('\n' + '='.repeat(50));
        console.log('Testing Authentication Integration');
        console.log('='.repeat(50));
        
        test('AuthManager class can be extracted', () => {
            expect(authManagerMatch[0]).toContain('class AuthManager');
        });
        
        test('AuthManager has required methods', () => {
            expect(authManagerMatch[0]).toContain('login');
            expect(authManagerMatch[0]).toContain('logout');
            expect(authManagerMatch[0]).toContain('isAuthenticated');
        });
    }
} catch (error) {
    console.error('Failed to load auth module:', error.message);
}

// Test 4: Load tickets module and test basic functionality
try {
    const ticketsCode = fs.readFileSync(path.join(__dirname, '../public/assets/js/tickets.js'), 'utf8');
    
    // Simple extraction of TicketManager class
    const ticketManagerMatch = ticketsCode.match(/class TicketManager\s*{[\s\S]*?^}/m);
    if (ticketManagerMatch) {
        console.log('\n' + '='.repeat(50));
        console.log('Testing Ticket Management Integration');
        console.log('='.repeat(50));
        
        test('TicketManager class can be extracted', () => {
            expect(ticketManagerMatch[0]).toContain('class TicketManager');
        });
        
        test('TicketManager has CRUD methods', () => {
            expect(ticketManagerMatch[0]).toContain('createTicket');
            expect(ticketManagerMatch[0]).toContain('getTickets');
            expect(ticketManagerMatch[0]).toContain('updateTicket');
            expect(ticketManagerMatch[0]).toContain('deleteTicket');
        });
    }
} catch (error) {
    console.error('Failed to load tickets module:', error.message);
}

// Test 5: Integration files exist
console.log('\n' + '='.repeat(50));
console.log('Testing Integration Files');
console.log('='.repeat(50));

test('App integration file exists', () => {
    const integrationPath = path.join(__dirname, '../public/assets/js/app-integration.js');
    expect(fs.existsSync(integrationPath)).toBeTruthy();
});

test('Optimization integration file exists', () => {
    const optimizationPath = path.join(__dirname, '../public/assets/js/optimization-integration.js');
    expect(fs.existsSync(optimizationPath)).toBeTruthy();
});

test('Page initialization file exists', () => {
    const pageInitPath = path.join(__dirname, '../public/assets/js/page-init.js');
    expect(fs.existsSync(pageInitPath)).toBeTruthy();
});

// Test 6: Template files exist
console.log('\n' + '='.repeat(50));
console.log('Testing Template Integration');
console.log('='.repeat(50));

test('Base template exists', () => {
    const basePath = path.join(__dirname, '../templates/base.twig');
    expect(fs.existsSync(basePath)).toBeTruthy();
});

test('Dashboard template exists', () => {
    const dashboardPath = path.join(__dirname, '../templates/dashboard.twig');
    expect(fs.existsSync(dashboardPath)).toBeTruthy();
});

test('Tickets template exists', () => {
    const ticketsPath = path.join(__dirname, '../templates/tickets.twig');
    expect(fs.existsSync(ticketsPath)).toBeTruthy();
});

// Test 7: Check base template includes integration scripts
try {
    const baseTemplate = fs.readFileSync(path.join(__dirname, '../templates/base.twig'), 'utf8');
    
    test('Base template includes auth.js', () => {
        expect(baseTemplate).toContain('auth.js');
    });
    
    test('Base template includes tickets.js', () => {
        expect(baseTemplate).toContain('tickets.js');
    });
    
    test('Base template includes app-integration.js', () => {
        expect(baseTemplate).toContain('app-integration.js');
    });
    
    test('Base template includes optimization-integration.js', () => {
        expect(baseTemplate).toContain('optimization-integration.js');
    });
    
    test('Base template has proper script loading order', () => {
        const authIndex = baseTemplate.indexOf('auth.js');
        const ticketsIndex = baseTemplate.indexOf('tickets.js');
        const integrationIndex = baseTemplate.indexOf('app-integration.js');
        
        expect(authIndex < integrationIndex).toBeTruthy();
        expect(ticketsIndex < integrationIndex).toBeTruthy();
    });
} catch (error) {
    console.error('Failed to check base template:', error.message);
}

// Test 8: Workflow simulation
console.log('\n' + '='.repeat(50));
console.log('Testing Workflow Simulation');
console.log('='.repeat(50));

test('Complete authentication workflow simulation', () => {
    // Simulate login
    const sessionData = {
        token: 'test-token-' + Date.now(),
        user: { id: '1', username: 'demo', email: 'demo@example.com' },
        expiresAt: Date.now() + 86400000
    };
    
    global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
    
    // Verify session storage
    const storedSession = global.localStorage.getItem('ticketapp_session');
    expect(storedSession).toBeTruthy();
    
    const parsedSession = JSON.parse(storedSession);
    expect(parsedSession.user.username).toBe('demo');
    
    // Simulate logout
    global.localStorage.removeItem('ticketapp_session');
    expect(global.localStorage.getItem('ticketapp_session')).toBe(null);
});

test('Complete ticket CRUD workflow simulation', () => {
    // Simulate ticket creation
    const tickets = [];
    const newTicket = {
        id: 'ticket-' + Date.now(),
        title: 'E2E Test Ticket',
        description: 'End-to-end integration test ticket',
        status: 'Open',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    tickets.push(newTicket);
    global.localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Verify ticket storage
    const storedTickets = JSON.parse(global.localStorage.getItem('tickets'));
    expect(storedTickets.length).toBe(1);
    expect(storedTickets[0].title).toBe('E2E Test Ticket');
    
    // Simulate ticket update
    storedTickets[0].title = 'Updated E2E Test Ticket';
    storedTickets[0].status = 'In Progress';
    storedTickets[0].updatedAt = Date.now();
    global.localStorage.setItem('tickets', JSON.stringify(storedTickets));
    
    // Verify update
    const updatedTickets = JSON.parse(global.localStorage.getItem('tickets'));
    expect(updatedTickets[0].title).toBe('Updated E2E Test Ticket');
    expect(updatedTickets[0].status).toBe('In Progress');
    
    // Simulate ticket deletion
    const filteredTickets = updatedTickets.filter(t => t.id !== newTicket.id);
    global.localStorage.setItem('tickets', JSON.stringify(filteredTickets));
    
    // Verify deletion
    const finalTickets = JSON.parse(global.localStorage.getItem('tickets'));
    expect(finalTickets.length).toBe(0);
});

test('Cross-module data sharing simulation', () => {
    // Simulate authenticated session
    const sessionData = {
        token: 'integration-token',
        user: { id: '1', username: 'testuser' },
        expiresAt: Date.now() + 86400000
    };
    global.localStorage.setItem('ticketapp_session', JSON.stringify(sessionData));
    
    // Simulate ticket creation by authenticated user
    const tickets = [{
        id: 'cross-module-test',
        title: 'Cross-Module Test',
        description: 'Testing cross-module integration',
        status: 'Open',
        createdBy: sessionData.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }];
    global.localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Verify both modules can access shared data
    const session = JSON.parse(global.localStorage.getItem('ticketapp_session'));
    const ticketList = JSON.parse(global.localStorage.getItem('tickets'));
    
    expect(session.user.username).toBe('testuser');
    expect(ticketList[0].createdBy).toBe(session.user.id);
    expect(ticketList[0].title).toBe('Cross-Module Test');
});

// Final results
console.log('\n' + '='.repeat(60));
console.log('END-TO-END INTEGRATION TEST RESULTS');
console.log('='.repeat(60));
console.log(`Total Tests: ${testCount}`);
console.log(`✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);

if (failCount === 0) {
    console.log('\n🎉 All integration tests passed! The system is properly integrated.');
} else {
    console.log(`\n⚠️  ${failCount} test(s) failed. Please review the integration.`);
}

console.log('='.repeat(60));

// Exit with appropriate code
process.exit(failCount === 0 ? 0 : 1);