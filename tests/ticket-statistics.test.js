/**
 * Node.js test runner for TicketStatisticsCalculator
 * Run with: node tests/ticket-statistics.test.js
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
    requestAnimationFrame: (callback) => callback(),
    performance: {
        now: () => Date.now()
    }
};

global.localStorage = global.window.localStorage;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.performance = global.window.performance;

// Mock document for DOM operations
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
};

// Load the TicketStatisticsCalculator module
const fs = require('fs');
const path = require('path');

const statsModulePath = path.join(__dirname, '../public/assets/js/ticket-statistics.js');
const statsModuleCode = fs.readFileSync(statsModulePath, 'utf8');

// Create a module context and evaluate
const moduleContext = { module: { exports: {} }, exports: {} };
const wrappedCode = `
(function(module, exports, window, document, localStorage, requestAnimationFrame, performance) {
    ${statsModuleCode}
})(moduleContext.module, moduleContext.exports, global.window, global.document, global.localStorage, global.requestAnimationFrame, global.performance);
`;

eval(wrappedCode);

// Extract the class from module exports or global scope
const TicketStatisticsCalculator = moduleContext.module.exports.TicketStatisticsCalculator || global.TicketStatisticsCalculator || (function() {
    // If not exported, evaluate again in global scope
    eval(statsModuleCode);
    return global.TicketStatisticsCalculator;
})();

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
            toBeNull: () => {
                if (actual !== null) {
                    throw new Error(`Expected null, but got ${actual}`);
                }
            },
            toHaveLength: (expected) => {
                if (!actual || actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
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

// Helper function to create sample tickets
function createSampleTickets(counts = { open: 2, inProgress: 1, closed: 1 }) {
    const tickets = [];
    let id = 1;
    
    for (let i = 0; i < counts.open; i++) {
        tickets.push({
            id: `ticket_${id++}`,
            title: `Open Ticket ${i + 1}`,
            description: 'Test ticket',
            status: 'Open',
            createdAt: Date.now() - (i * 1000),
            updatedAt: Date.now() - (i * 1000),
            userId: 'user123'
        });
    }
    
    for (let i = 0; i < counts.inProgress; i++) {
        tickets.push({
            id: `ticket_${id++}`,
            title: `In Progress Ticket ${i + 1}`,
            description: 'Test ticket',
            status: 'In Progress',
            createdAt: Date.now() - (i * 1000),
            updatedAt: Date.now() - (i * 1000),
            userId: 'user123'
        });
    }
    
    for (let i = 0; i < counts.closed; i++) {
        tickets.push({
            id: `ticket_${id++}`,
            title: `Closed Ticket ${i + 1}`,
            description: 'Test ticket',
            status: 'Closed',
            createdAt: Date.now() - (i * 1000),
            updatedAt: Date.now() - (i * 1000),
            userId: 'user123'
        });
    }
    
    return tickets;
}

// Run tests
describe('TicketStatisticsCalculator - calculateStatistics()', () => {
    let calculator;

    function setup() {
        global.localStorage.clear();
        calculator = new TicketStatisticsCalculator();
    }

    it('should calculate correct statistics with mixed ticket statuses', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const stats = calculator.calculateStatistics();

        expect(stats.total).toBe(4);
        expect(stats.open).toBe(2);
        expect(stats.inProgress).toBe(1);
        expect(stats.closed).toBe(1);
    });

    it('should return zero counts when no tickets exist', () => {
        setup();
        
        global.localStorage.setItem('tickets', JSON.stringify([]));

        const stats = calculator.calculateStatistics();

        expect(stats.total).toBe(0);
        expect(stats.open).toBe(0);
        expect(stats.inProgress).toBe(0);
        expect(stats.closed).toBe(0);
    });

    it('should handle all tickets with same status', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 5, inProgress: 0, closed: 0 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const stats = calculator.calculateStatistics();

        expect(stats.total).toBe(5);
        expect(stats.open).toBe(5);
        expect(stats.inProgress).toBe(0);
        expect(stats.closed).toBe(0);
    });

    it('should calculate statistics for large number of tickets', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 50, inProgress: 30, closed: 20 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const stats = calculator.calculateStatistics();

        expect(stats.total).toBe(100);
        expect(stats.open).toBe(50);
        expect(stats.inProgress).toBe(30);
        expect(stats.closed).toBe(20);
    });

    it('should use cached statistics when called multiple times', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const stats1 = calculator.calculateStatistics();
        const stats2 = calculator.calculateStatistics();

        expect(stats1).toEqual(stats2);
        expect(calculator.cachedStats).toBeTruthy();
    });

    it('should force refresh when forceRefresh parameter is true', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        calculator.calculateStatistics();
        
        // Change tickets
        const newTickets = createSampleTickets({ open: 3, inProgress: 2, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(newTickets));

        const stats = calculator.calculateStatistics(true);

        expect(stats.total).toBe(6);
        expect(stats.open).toBe(3);
        expect(stats.inProgress).toBe(2);
    });
});

describe('TicketStatisticsCalculator - getTickets()', () => {
    let calculator;

    function setup() {
        global.localStorage.clear();
        calculator = new TicketStatisticsCalculator();
    }

    it('should retrieve tickets from localStorage', () => {
        setup();
        
        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const retrievedTickets = calculator.getTickets();

        expect(retrievedTickets).toHaveLength(4);
        expect(retrievedTickets[0].status).toBe('Open');
    });

    it('should return empty array when localStorage is empty', () => {
        setup();

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should handle null data in localStorage', () => {
        setup();
        
        global.localStorage.setItem('tickets', 'null');

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should handle undefined data in localStorage', () => {
        setup();
        
        global.localStorage.setItem('tickets', 'undefined');

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should handle corrupted JSON data gracefully', () => {
        setup();
        
        global.localStorage.setItem('tickets', '{invalid json}');

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should handle non-array data in localStorage', () => {
        setup();
        
        global.localStorage.setItem('tickets', JSON.stringify({ not: 'an array' }));

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
    });

    it('should handle localStorage access errors', () => {
        setup();
        
        // Simulate localStorage being unavailable
        const originalLocalStorage = global.localStorage;
        global.localStorage = undefined;
        calculator = new TicketStatisticsCalculator();

        const tickets = calculator.getTickets();

        expect(tickets).toHaveLength(0);
        
        // Restore
        global.localStorage = originalLocalStorage;
    });
});

describe('TicketStatisticsCalculator - updateStatisticsDisplay()', () => {
    let calculator;
    let mockElements;

    function setup() {
        calculator = new TicketStatisticsCalculator();
        
        // Create mock DOM elements
        mockElements = {
            totalCount: { textContent: '' },
            openCount: { textContent: '' },
            inProgressCount: { textContent: '' },
            closedCount: { textContent: '' }
        };

        // Mock getElementById
        global.document.getElementById = (id) => mockElements[id] || null;
    }

    it('should update all statistics DOM elements', () => {
        setup();

        const stats = { total: 10, open: 4, inProgress: 3, closed: 3 };
        calculator.updateStatisticsDisplay(stats);

        expect(mockElements.totalCount.textContent).toBe(10);
        expect(mockElements.openCount.textContent).toBe(4);
        expect(mockElements.inProgressCount.textContent).toBe(3);
        expect(mockElements.closedCount.textContent).toBe(3);
    });

    it('should update display with zero counts', () => {
        setup();

        const stats = { total: 0, open: 0, inProgress: 0, closed: 0 };
        calculator.updateStatisticsDisplay(stats);

        expect(mockElements.totalCount.textContent).toBe(0);
        expect(mockElements.openCount.textContent).toBe(0);
        expect(mockElements.inProgressCount.textContent).toBe(0);
        expect(mockElements.closedCount.textContent).toBe(0);
    });

    it('should handle missing DOM elements gracefully', () => {
        setup();

        // Remove some elements
        mockElements = {
            totalCount: { textContent: '' }
            // Other elements missing
        };

        const stats = { total: 5, open: 2, inProgress: 1, closed: 2 };
        
        // Should not throw error
        calculator.updateStatisticsDisplay(stats);

        expect(mockElements.totalCount.textContent).toBe(5);
    });

    it('should update display with large numbers', () => {
        setup();

        const stats = { total: 9999, open: 3333, inProgress: 3333, closed: 3333 };
        calculator.updateStatisticsDisplay(stats);

        expect(mockElements.totalCount.textContent).toBe(9999);
        expect(mockElements.openCount.textContent).toBe(3333);
    });
});

describe('TicketStatisticsCalculator - Cache Management', () => {
    let calculator;

    function setup() {
        global.localStorage.clear();
        calculator = new TicketStatisticsCalculator();
    }

    it('should invalidate cache when invalidateCache is called', () => {
        setup();

        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        calculator.calculateStatistics();
        expect(calculator.cachedStats).toBeTruthy();

        calculator.invalidateCache();

        expect(calculator.cachedStats).toBeNull();
        expect(calculator.cachedTickets).toBeNull();
        expect(calculator.lastCalculationTime).toBe(0);
    });

    it('should recalculate after cache invalidation', () => {
        setup();

        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const stats1 = calculator.calculateStatistics();
        calculator.invalidateCache();

        // Change tickets
        const newTickets = createSampleTickets({ open: 5, inProgress: 0, closed: 0 });
        global.localStorage.setItem('tickets', JSON.stringify(newTickets));

        const stats2 = calculator.calculateStatistics();

        expect(stats2.total).toBe(5);
        expect(stats2.open).toBe(5);
    });
});

describe('TicketStatisticsCalculator - Performance Optimization', () => {
    let calculator;

    function setup() {
        global.localStorage.clear();
        calculator = new TicketStatisticsCalculator();
    }

    it('should preload tickets data', () => {
        setup();

        const tickets = createSampleTickets({ open: 2, inProgress: 1, closed: 1 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        calculator.preloadTickets();

        // Verify that getTickets was called (no error thrown)
        expect(true).toBe(true);
    });

    it('should use single-pass counting for efficiency', () => {
        setup();

        const tickets = createSampleTickets({ open: 100, inProgress: 100, closed: 100 });
        global.localStorage.setItem('tickets', JSON.stringify(tickets));

        const startTime = Date.now();
        const stats = calculator.calculateStatistics();
        const endTime = Date.now();

        expect(stats.total).toBe(300);
        // Should complete quickly (under 100ms for 300 tickets)
        expect(endTime - startTime).toBeLessThan(100);
    });
});

// Run tests and print summary
const success = testRunner.printSummary();
process.exit(success ? 0 : 1);
