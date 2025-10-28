/**
 * Cross-Device Compatibility Tests for Landing Page Responsive Design
 * Tests Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

class ResponsiveCompatibilityTests {
    constructor() {
        this.testResults = {
            mobile: {},
            tablet: {},
            desktop: {},
            largeDesktop: {},
            extraLarge: {}
        };
        
        this.deviceProfiles = {
            // Mobile devices (320px-768px)
            mobile: [
                { name: 'iPhone SE', width: 375, height: 667 },
                { name: 'iPhone 12', width: 390, height: 844 },
                { name: 'Samsung Galaxy S21', width: 360, height: 800 },
                { name: 'Small Mobile', width: 320, height: 568 }
            ],
            
            // Tablet devices (768px-1024px)
            tablet: [
                { name: 'iPad', width: 768, height: 1024 },
                { name: 'iPad Pro', width: 834, height: 1194 },
                { name: 'Surface Pro', width: 912, height: 1368 },
                { name: 'Android Tablet', width: 800, height: 1280 }
            ],
            
            // Desktop devices (1024px+)
            desktop: [
                { name: 'Small Desktop', width: 1024, height: 768 },
                { name: 'Standard Desktop', width: 1280, height: 720 },
                { name: 'Large Desktop', width: 1440, height: 900 },
                { name: 'Ultra Wide', width: 1920, height: 1080 }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupTestEnvironment();
        this.runAllCompatibilityTests();
    }
    
    /**
     * Setup test environment
     */
    setupTestEnvironment() {
        // Create test viewport container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'responsive-test-container';
        this.testContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            visibility: hidden;
            pointer-events: none;
            z-index: -1;
        `;
        document.body.appendChild(this.testContainer);
        
        // Store original viewport
        this.originalViewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    /**
     * Run comprehensive compatibility tests across all device categories
     */
    async runAllCompatibilityTests() {
        console.group('🔍 Cross-Device Compatibility Testing');
        
        try {
            // Test mobile devices
            await this.testDeviceCategory('mobile');
            
            // Test tablet devices  
            await this.testDeviceCategory('tablet');
            
            // Test desktop devices
            await this.testDeviceCategory('desktop');
            
            // Test max-width centering specifically
            await this.testMaxWidthCentering();
            
            // Generate comprehensive report
            this.generateCompatibilityReport();
            
        } catch (error) {
            console.error('Error during compatibility testing:', error);
        }
        
        console.groupEnd();
    }
    
    /**
     * Test specific device category
     */
    async testDeviceCategory(category) {
        console.group(`📱 Testing ${category} devices`);
        
        const devices = this.deviceProfiles[category];
        const categoryResults = {};
        
        for (const device of devices) {
            console.log(`Testing ${device.name} (${device.width}x${device.height})`);
            
            // Simulate device viewport
            await this.simulateViewport(device.width, device.height);
            
            // Run device-specific tests
            const deviceResults = await this.runDeviceTests(device, category);
            categoryResults[device.name] = deviceResults;
            
            // Small delay between tests
            await this.delay(100);
        }
        
        this.testResults[category] = categoryResults;
        console.groupEnd();
    }
    
    /**
     * Simulate viewport size for testing
     */
    async simulateViewport(width, height) {
        // Update CSS custom properties for testing
        document.documentElement.style.setProperty('--test-viewport-width', `${width}px`);
        document.documentElement.style.setProperty('--test-viewport-height', `${height}px`);
        
        // Add viewport class for CSS targeting
        document.body.className = document.body.className.replace(/test-viewport-\w+/g, '');
        
        if (width <= 767) {
            document.body.classList.add('test-viewport-mobile');
        } else if (width <= 1023) {
            document.body.classList.add('test-viewport-tablet');
        } else {
            document.body.classList.add('test-viewport-desktop');
        }
        
        // Trigger resize event for responsive components
        window.dispatchEvent(new Event('resize'));
        
        // Allow time for layout recalculation
        await this.delay(50);
    }
    
    /**
     * Run comprehensive tests for a specific device
     */
    async runDeviceTests(device, category) {
        const results = {
            device: device,
            category: category,
            tests: {},
            passed: true,
            issues: []
        };
        
        // Test 1: Container max-width and centering (Requirement 3.1, 3.2)
        results.tests.containerMaxWidth = this.testContainerMaxWidth(device);
        
        // Test 2: Layout adaptation (Requirement 3.3, 3.4)
        results.tests.layoutAdaptation = this.testLayoutAdaptation(device, category);
        
        // Test 3: Interactive elements accessibility (Requirement 3.5)
        results.tests.interactiveElements = this.testInteractiveElements(device, category);
        
        // Test 4: Typography scaling
        results.tests.typographyScaling = this.testTypographyScaling(device, category);
        
        // Test 5: Image and media responsiveness
        results.tests.mediaResponsiveness = this.testMediaResponsiveness(device);
        
        // Test 6: Navigation usability
        results.tests.navigationUsability = this.testNavigationUsability(device, category);
        
        // Test 7: Performance optimization
        results.tests.performanceOptimization = this.testPerformanceOptimization(device, category);
        
        // Aggregate results
        const testsPassed = Object.values(results.tests).every(test => test.passed);
        results.passed = testsPassed;
        
        if (!testsPassed) {
            Object.values(results.tests).forEach(test => {
                if (!test.passed && test.issues) {
                    results.issues.push(...test.issues);
                }
            });
        }
        
        return results;
    }
    
    /**
     * Test container max-width and centering (Requirements 3.1, 3.2)
     */
    testContainerMaxWidth(device) {
        const result = {
            passed: true,
            issues: [],
            containers: []
        };
        
        const containers = document.querySelectorAll(
            '.landing-container, .hero-container, .footer-content, .responsive-container, .desktop-container, .xl-desktop-container'
        );
        
        containers.forEach((container, index) => {
            const styles = window.getComputedStyle(container);
            const maxWidth = parseInt(styles.maxWidth) || Infinity;
            const marginLeft = styles.marginLeft;
            const marginRight = styles.marginRight;
            const width = container.getBoundingClientRect().width;
            
            const containerResult = {
                selector: container.className,
                maxWidth: maxWidth,
                actualWidth: width,
                marginLeft: marginLeft,
                marginRight: marginRight,
                passed: true
            };
            
            // Test max-width constraint (1440px requirement)
            if (device.width >= 1440 && maxWidth > 1440) {
                containerResult.passed = false;
                result.passed = false;
                result.issues.push(`Container exceeds 1440px max-width: ${maxWidth}px on ${device.name}`);
            }
            
            // Test horizontal centering on larger screens
            if (device.width >= 1440) {
                if (marginLeft !== 'auto' || marginRight !== 'auto') {
                    containerResult.passed = false;
                    result.passed = false;
                    result.issues.push(`Container not horizontally centered on ${device.name}`);
                }
            }
            
            // Test container doesn't overflow viewport
            if (width > device.width) {
                containerResult.passed = false;
                result.passed = false;
                result.issues.push(`Container overflows viewport on ${device.name}: ${width}px > ${device.width}px`);
            }
            
            result.containers.push(containerResult);
        });
        
        return result;
    }
    
    /**
     * Test layout adaptation (Requirements 3.3, 3.4)
     */
    testLayoutAdaptation(device, category) {
        const result = {
            passed: true,
            issues: [],
            layouts: []
        };
        
        // Test grid layouts
        const grids = document.querySelectorAll('.feature-boxes-grid, .responsive-grid');
        grids.forEach((grid, index) => {
            const styles = window.getComputedStyle(grid);
            const columns = styles.gridTemplateColumns;
            const columnCount = columns.split(' ').filter(col => col !== 'none').length;
            
            const gridResult = {
                selector: grid.className,
                columns: columns,
                columnCount: columnCount,
                passed: true
            };
            
            // Test expected column counts per device category
            if (category === 'mobile' && columnCount > 1) {
                gridResult.passed = false;
                result.passed = false;
                result.issues.push(`Grid should have 1 column on mobile, has ${columnCount} on ${device.name}`);
            } else if (category === 'tablet' && (columnCount < 2 || columnCount > 3)) {
                gridResult.passed = false;
                result.passed = false;
                result.issues.push(`Grid should have 2-3 columns on tablet, has ${columnCount} on ${device.name}`);
            } else if (category === 'desktop' && columnCount !== 3) {
                gridResult.passed = false;
                result.passed = false;
                result.issues.push(`Grid should have 3 columns on desktop, has ${columnCount} on ${device.name}`);
            }
            
            result.layouts.push(gridResult);
        });
        
        // Test flex layouts
        const flexContainers = document.querySelectorAll('.hero-actions, .cta-actions');
        flexContainers.forEach((container, index) => {
            const styles = window.getComputedStyle(container);
            const flexDirection = styles.flexDirection;
            
            const flexResult = {
                selector: container.className,
                flexDirection: flexDirection,
                passed: true
            };
            
            // Test expected flex directions per device category
            if (category === 'mobile' && flexDirection !== 'column') {
                flexResult.passed = false;
                result.passed = false;
                result.issues.push(`Flex container should stack vertically on mobile on ${device.name}`);
            } else if (category !== 'mobile' && flexDirection !== 'row') {
                flexResult.passed = false;
                result.passed = false;
                result.issues.push(`Flex container should be horizontal on ${category} on ${device.name}`);
            }
            
            result.layouts.push(flexResult);
        });
        
        return result;
    }
    
    /**
     * Test interactive elements accessibility (Requirement 3.5)
     */
    testInteractiveElements(device, category) {
        const result = {
            passed: true,
            issues: [],
            elements: []
        };
        
        const interactiveElements = document.querySelectorAll(
            'button, a, input, [role="button"], .cta-btn, .feature-box-link, .footer-link'
        );
        
        interactiveElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            
            // Minimum touch target sizes
            const minSize = category === 'mobile' ? 48 : 44;
            
            const elementResult = {
                selector: element.className || element.tagName,
                width: rect.width,
                height: rect.height,
                minSize: minSize,
                passed: true
            };
            
            // Test touch target size
            if (rect.width < minSize || rect.height < minSize) {
                elementResult.passed = false;
                result.passed = false;
                result.issues.push(
                    `Interactive element too small on ${device.name}: ${rect.width}x${rect.height}px (min: ${minSize}px)`
                );
            }
            
            // Test element visibility
            if (rect.width === 0 || rect.height === 0) {
                elementResult.passed = false;
                result.passed = false;
                result.issues.push(`Interactive element not visible on ${device.name}`);
            }
            
            // Test element accessibility
            const hasAccessibleName = element.getAttribute('aria-label') || 
                                    element.getAttribute('title') || 
                                    element.textContent.trim() ||
                                    element.querySelector('img[alt]');
            
            if (!hasAccessibleName) {
                elementResult.passed = false;
                result.passed = false;
                result.issues.push(`Interactive element lacks accessible name on ${device.name}`);
            }
            
            result.elements.push(elementResult);
        });
        
        return result;
    }
    
    /**
     * Test typography scaling across devices
     */
    testTypographyScaling(device, category) {
        const result = {
            passed: true,
            issues: [],
            typography: []
        };
        
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .hero-description-enhanced');
        
        textElements.forEach((element, index) => {
            const styles = window.getComputedStyle(element);
            const fontSize = parseInt(styles.fontSize);
            const lineHeight = parseFloat(styles.lineHeight) || 1.2;
            
            const typographyResult = {
                selector: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : ''),
                fontSize: fontSize,
                lineHeight: lineHeight,
                passed: true
            };
            
            // Test minimum font sizes per device category
            let minFontSize;
            if (category === 'mobile') {
                minFontSize = element.tagName === 'H1' ? 24 : element.tagName.startsWith('H') ? 18 : 14;
            } else if (category === 'tablet') {
                minFontSize = element.tagName === 'H1' ? 32 : element.tagName.startsWith('H') ? 20 : 16;
            } else {
                minFontSize = element.tagName === 'H1' ? 36 : element.tagName.startsWith('H') ? 24 : 16;
            }
            
            if (fontSize < minFontSize) {
                typographyResult.passed = false;
                result.passed = false;
                result.issues.push(
                    `Font size too small on ${device.name}: ${fontSize}px (min: ${minFontSize}px) for ${element.tagName}`
                );
            }
            
            // Test line height
            if (lineHeight < 1.2) {
                typographyResult.passed = false;
                result.passed = false;
                result.issues.push(`Line height too tight on ${device.name}: ${lineHeight} for ${element.tagName}`);
            }
            
            result.typography.push(typographyResult);
        });
        
        return result;
    }
    
    /**
     * Test media responsiveness
     */
    testMediaResponsiveness(device) {
        const result = {
            passed: true,
            issues: [],
            media: []
        };
        
        const mediaElements = document.querySelectorAll('img, svg, video, .hero-visual, .mockup-content');
        
        mediaElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            
            const mediaResult = {
                selector: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : ''),
                width: rect.width,
                maxWidth: styles.maxWidth,
                objectFit: styles.objectFit,
                passed: true
            };
            
            // Test media doesn't overflow viewport
            if (rect.width > device.width) {
                mediaResult.passed = false;
                result.passed = false;
                result.issues.push(`Media overflows viewport on ${device.name}: ${rect.width}px > ${device.width}px`);
            }
            
            // Test responsive behavior
            if (styles.maxWidth === 'none' && rect.width > device.width * 0.9) {
                mediaResult.passed = false;
                result.passed = false;
                result.issues.push(`Media should have max-width constraint on ${device.name}`);
            }
            
            result.media.push(mediaResult);
        });
        
        return result;
    }
    
    /**
     * Test navigation usability
     */
    testNavigationUsability(device, category) {
        const result = {
            passed: true,
            issues: [],
            navigation: []
        };
        
        const navElements = document.querySelectorAll('nav, .site-header, .hero-actions, .footer-nav');
        
        navElements.forEach((nav, index) => {
            const styles = window.getComputedStyle(nav);
            const rect = nav.getBoundingClientRect();
            
            const navResult = {
                selector: nav.className || nav.tagName,
                width: rect.width,
                height: rect.height,
                passed: true
            };
            
            // Test navigation doesn't overflow
            if (rect.width > device.width) {
                navResult.passed = false;
                result.passed = false;
                result.issues.push(`Navigation overflows on ${device.name}: ${rect.width}px > ${device.width}px`);
            }
            
            // Test navigation links are accessible
            const links = nav.querySelectorAll('a, button');
            links.forEach((link, linkIndex) => {
                const linkRect = link.getBoundingClientRect();
                const minSize = category === 'mobile' ? 48 : 44;
                
                if (linkRect.width < minSize || linkRect.height < minSize) {
                    navResult.passed = false;
                    result.passed = false;
                    result.issues.push(
                        `Navigation link ${linkIndex + 1} too small on ${device.name}: ${linkRect.width}x${linkRect.height}px`
                    );
                }
            });
            
            result.navigation.push(navResult);
        });
        
        return result;
    }
    
    /**
     * Test performance optimization
     */
    testPerformanceOptimization(device, category) {
        const result = {
            passed: true,
            issues: [],
            performance: {}
        };
        
        // Test animation performance
        const animatedElements = document.querySelectorAll('.feature-box, .decorative-circle, .cta-btn');
        const animationCount = animatedElements.length;
        
        result.performance.animationCount = animationCount;
        
        // Reduce animations on mobile for performance
        if (category === 'mobile' && animationCount > 10) {
            result.passed = false;
            result.issues.push(`Too many animations for mobile performance on ${device.name}: ${animationCount}`);
        }
        
        // Test CSS complexity
        const stylesheets = document.styleSheets;
        let ruleCount = 0;
        
        try {
            for (let i = 0; i < stylesheets.length; i++) {
                const sheet = stylesheets[i];
                if (sheet.cssRules) {
                    ruleCount += sheet.cssRules.length;
                }
            }
        } catch (e) {
            // Cross-origin stylesheets may not be accessible
        }
        
        result.performance.cssRuleCount = ruleCount;
        
        return result;
    }
    
    /**
     * Test max-width centering specifically for requirement 3.1, 3.2
     */
    async testMaxWidthCentering() {
        console.group('🎯 Testing Max-Width Centering (1440px)');
        
        const centeringResults = {
            passed: true,
            issues: [],
            tests: []
        };
        
        // Test at various screen sizes above 1440px
        const testSizes = [1440, 1600, 1920, 2560];
        
        for (const width of testSizes) {
            await this.simulateViewport(width, 900);
            
            const containers = document.querySelectorAll(
                '.landing-container, .hero-container, .footer-content, .responsive-container'
            );
            
            containers.forEach((container, index) => {
                const styles = window.getComputedStyle(container);
                const rect = container.getBoundingClientRect();
                const maxWidth = parseInt(styles.maxWidth) || Infinity;
                const marginLeft = styles.marginLeft;
                const marginRight = styles.marginRight;
                
                const test = {
                    viewportWidth: width,
                    containerIndex: index,
                    containerClass: container.className,
                    maxWidth: maxWidth,
                    actualWidth: rect.width,
                    marginLeft: marginLeft,
                    marginRight: marginRight,
                    centered: false,
                    passed: true
                };
                
                // Check max-width constraint
                if (maxWidth > 1440) {
                    test.passed = false;
                    centeringResults.passed = false;
                    centeringResults.issues.push(
                        `Container ${index + 1} exceeds 1440px max-width: ${maxWidth}px at ${width}px viewport`
                    );
                }
                
                // Check horizontal centering
                if (marginLeft === 'auto' && marginRight === 'auto') {
                    test.centered = true;
                } else {
                    test.passed = false;
                    centeringResults.passed = false;
                    centeringResults.issues.push(
                        `Container ${index + 1} not horizontally centered at ${width}px viewport`
                    );
                }
                
                // Check actual width doesn't exceed 1440px
                if (rect.width > 1440) {
                    test.passed = false;
                    centeringResults.passed = false;
                    centeringResults.issues.push(
                        `Container ${index + 1} actual width exceeds 1440px: ${rect.width}px at ${width}px viewport`
                    );
                }
                
                centeringResults.tests.push(test);
            });
        }
        
        this.testResults.maxWidthCentering = centeringResults;
        
        if (centeringResults.passed) {
            console.log('✅ Max-width centering tests passed');
        } else {
            console.warn('⚠️ Max-width centering tests failed:', centeringResults.issues);
        }
        
        console.groupEnd();
    }
    
    /**
     * Generate comprehensive compatibility report
     */
    generateCompatibilityReport() {
        console.group('📊 Cross-Device Compatibility Report');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalDevicesTested: 0,
                devicesPassed: 0,
                devicesWithIssues: 0,
                criticalIssues: [],
                overallPassed: true
            },
            deviceResults: this.testResults,
            recommendations: []
        };
        
        // Analyze results
        Object.entries(this.testResults).forEach(([category, devices]) => {
            if (typeof devices === 'object' && devices !== null) {
                Object.entries(devices).forEach(([deviceName, results]) => {
                    if (results.device) {
                        report.summary.totalDevicesTested++;
                        
                        if (results.passed) {
                            report.summary.devicesPassed++;
                        } else {
                            report.summary.devicesWithIssues++;
                            report.summary.overallPassed = false;
                            
                            // Collect critical issues
                            if (results.issues && results.issues.length > 0) {
                                report.summary.criticalIssues.push(...results.issues);
                            }
                        }
                    }
                });
            }
        });
        
        // Generate recommendations
        if (report.summary.criticalIssues.length > 0) {
            report.recommendations = this.generateRecommendations(report.summary.criticalIssues);
        }
        
        // Log summary
        console.log(`📱 Devices Tested: ${report.summary.totalDevicesTested}`);
        console.log(`✅ Devices Passed: ${report.summary.devicesPassed}`);
        console.log(`⚠️ Devices with Issues: ${report.summary.devicesWithIssues}`);
        
        if (report.summary.overallPassed) {
            console.log('🎉 Overall Result: PASSED - All devices compatible!');
        } else {
            console.warn('❌ Overall Result: FAILED - Issues found on some devices');
            console.log('Critical Issues:', report.summary.criticalIssues);
            console.log('Recommendations:', report.recommendations);
        }
        
        console.groupEnd();
        
        // Store report globally for debugging
        window.compatibilityReport = report;
        
        return report;
    }
    
    /**
     * Generate recommendations based on issues found
     */
    generateRecommendations(issues) {
        const recommendations = [];
        
        // Analyze common issue patterns
        const issuePatterns = {
            'max-width': issues.filter(issue => issue.includes('max-width')),
            'centering': issues.filter(issue => issue.includes('centered')),
            'touch-target': issues.filter(issue => issue.includes('too small')),
            'overflow': issues.filter(issue => issue.includes('overflow')),
            'columns': issues.filter(issue => issue.includes('column'))
        };
        
        // Generate specific recommendations
        if (issuePatterns['max-width'].length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Layout',
                issue: 'Max-width constraint violations',
                solution: 'Ensure all containers have max-width: 1440px and margin: 0 auto for centering'
            });
        }
        
        if (issuePatterns['touch-target'].length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Accessibility',
                issue: 'Touch targets too small',
                solution: 'Increase button and link sizes to minimum 44px (48px on mobile) for accessibility'
            });
        }
        
        if (issuePatterns['overflow'].length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Responsive Design',
                issue: 'Content overflow on small screens',
                solution: 'Add responsive padding and ensure content scales properly with viewport'
            });
        }
        
        if (issuePatterns['columns'].length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Layout',
                issue: 'Incorrect grid columns for device size',
                solution: 'Implement proper responsive grid: 1 column (mobile), 2-3 columns (tablet), 3 columns (desktop)'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Utility: Delay function for async operations
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Cleanup test environment
     */
    cleanup() {
        if (this.testContainer) {
            document.body.removeChild(this.testContainer);
        }
        
        // Restore original viewport classes
        document.body.className = document.body.className.replace(/test-viewport-\w+/g, '');
        
        // Remove test CSS properties
        document.documentElement.style.removeProperty('--test-viewport-width');
        document.documentElement.style.removeProperty('--test-viewport-height');
    }
    
    /**
     * Get test results
     */
    getResults() {
        return this.testResults;
    }
}

// Initialize compatibility tests when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run tests if in test environment or explicitly requested
    if (window.location.search.includes('test=responsive') || window.runResponsiveTests) {
        window.responsiveCompatibilityTests = new ResponsiveCompatibilityTests();
    }
    
    // Expose testing methods globally
    window.runResponsiveCompatibilityTests = () => {
        return new ResponsiveCompatibilityTests();
    };
    
    window.getCompatibilityReport = () => {
        return window.compatibilityReport || null;
    };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveCompatibilityTests;
}