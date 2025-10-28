/**
 * Responsive Design Verifier
 * Tests and optimizes cross-device compatibility for the landing page
 */

class ResponsiveVerifier {
    constructor() {
        this.breakpoints = {
            mobile: { min: 320, max: 767 },
            tablet: { min: 768, max: 1023 },
            desktop: { min: 1024, max: 1279 },
            largeDesktop: { min: 1280, max: 1439 },
            extraLarge: { min: 1440, max: Infinity }
        };
        
        this.currentBreakpoint = null;
        this.testResults = {};
        
        this.init();
    }
    
    init() {
        this.detectCurrentBreakpoint();
        this.setupResizeListener();
        this.runCompatibilityTests();
        this.optimizeForDevice();
        
        // Run tests on load and resize
        window.addEventListener('load', () => this.runAllTests());
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    }
    
    /**
     * Detect current breakpoint based on viewport width
     */
    detectCurrentBreakpoint() {
        const width = window.innerWidth;
        
        for (const [name, range] of Object.entries(this.breakpoints)) {
            if (width >= range.min && width <= range.max) {
                this.currentBreakpoint = name;
                break;
            }
        }
        
        // Add breakpoint class to body for CSS targeting
        document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
        document.body.classList.add(`breakpoint-${this.currentBreakpoint}`);
        
        return this.currentBreakpoint;
    }
    
    /**
     * Setup resize listener for responsive behavior
     */
    setupResizeListener() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.detectCurrentBreakpoint();
                this.optimizeForDevice();
                this.testMaxWidthCentering();
            }, 100);
        });
    }
    
    /**
     * Run comprehensive compatibility tests
     */
    runCompatibilityTests() {
        this.testResults = {
            maxWidthCentering: this.testMaxWidthCentering(),
            mobileAdaptations: this.testMobileAdaptations(),
            tabletLayout: this.testTabletLayout(),
            desktopLayout: this.testDesktopLayout(),
            touchTargets: this.testTouchTargets(),
            textReadability: this.testTextReadability(),
            imageScaling: this.testImageScaling(),
            navigationUsability: this.testNavigationUsability()
        };
        
        return this.testResults;
    }
    
    /**
     * Test 1440px max-width centering requirement
     */
    testMaxWidthCentering() {
        const containers = document.querySelectorAll(
            '.landing-container, .hero-container, .footer-content, .responsive-container'
        );
        
        const results = {
            passed: true,
            issues: [],
            containers: []
        };
        
        containers.forEach((container, index) => {
            const styles = window.getComputedStyle(container);
            const maxWidth = parseInt(styles.maxWidth);
            const marginLeft = styles.marginLeft;
            const marginRight = styles.marginRight;
            
            const containerResult = {
                element: container.className,
                maxWidth: maxWidth,
                centered: marginLeft === 'auto' && marginRight === 'auto',
                passed: true
            };
            
            // Check max-width constraint (should be 1440px or less)
            if (maxWidth > 1440 || isNaN(maxWidth)) {
                containerResult.passed = false;
                results.passed = false;
                results.issues.push(`Container ${index + 1} exceeds 1440px max-width: ${maxWidth}px`);
            }
            
            // Check horizontal centering
            if (marginLeft !== 'auto' || marginRight !== 'auto') {
                containerResult.passed = false;
                results.passed = false;
                results.issues.push(`Container ${index + 1} is not horizontally centered`);
            }
            
            results.containers.push(containerResult);
        });
        
        return results;
    }
    
    /**
     * Test mobile adaptations (320px-768px)
     */
    testMobileAdaptations() {
        if (this.currentBreakpoint !== 'mobile') {
            return { skipped: true, reason: 'Not on mobile breakpoint' };
        }
        
        const results = {
            passed: true,
            issues: [],
            tests: {}
        };
        
        // Test button touch targets
        const buttons = document.querySelectorAll('.cta-btn, .feature-box-link, .footer-link');
        buttons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            const minSize = 44; // Accessibility minimum
            
            if (rect.height < minSize || rect.width < minSize) {
                results.passed = false;
                results.issues.push(`Button ${index + 1} touch target too small: ${rect.width}x${rect.height}px`);
            }
        });
        
        // Test text readability
        const textElements = document.querySelectorAll('h1, h2, h3, p, .hero-description-enhanced');
        textElements.forEach((element, index) => {
            const styles = window.getComputedStyle(element);
            const fontSize = parseInt(styles.fontSize);
            const lineHeight = parseFloat(styles.lineHeight);
            
            if (fontSize < 14) {
                results.passed = false;
                results.issues.push(`Text element ${index + 1} font size too small: ${fontSize}px`);
            }
            
            if (lineHeight < 1.4) {
                results.passed = false;
                results.issues.push(`Text element ${index + 1} line height too tight: ${lineHeight}`);
            }
        });
        
        // Test single column layout
        const grids = document.querySelectorAll('.feature-boxes-grid, .responsive-grid');
        grids.forEach((grid, index) => {
            const styles = window.getComputedStyle(grid);
            const columns = styles.gridTemplateColumns;
            
            if (!columns.includes('1fr') || columns.split(' ').length > 1) {
                results.passed = false;
                results.issues.push(`Grid ${index + 1} not using single column on mobile: ${columns}`);
            }
        });
        
        return results;
    }
    
    /**
     * Test tablet layout (768px-1024px)
     */
    testTabletLayout() {
        if (this.currentBreakpoint !== 'tablet') {
            return { skipped: true, reason: 'Not on tablet breakpoint' };
        }
        
        const results = {
            passed: true,
            issues: [],
            tests: {}
        };
        
        // Test two-column layouts
        const grids = document.querySelectorAll('.feature-boxes-grid');
        grids.forEach((grid, index) => {
            const styles = window.getComputedStyle(grid);
            const columns = styles.gridTemplateColumns;
            const columnCount = columns.split(' ').length;
            
            if (columnCount < 2 || columnCount > 3) {
                results.passed = false;
                results.issues.push(`Grid ${index + 1} should have 2-3 columns on tablet: ${columnCount} columns`);
            }
        });
        
        // Test button layouts
        const buttonContainers = document.querySelectorAll('.hero-actions, .cta-actions');
        buttonContainers.forEach((container, index) => {
            const styles = window.getComputedStyle(container);
            const flexDirection = styles.flexDirection;
            
            if (flexDirection !== 'row') {
                results.passed = false;
                results.issues.push(`Button container ${index + 1} should use row layout on tablet`);
            }
        });
        
        return results;
    }
    
    /**
     * Test desktop layout (1024px+)
     */
    testDesktopLayout() {
        if (!['desktop', 'largeDesktop', 'extraLarge'].includes(this.currentBreakpoint)) {
            return { skipped: true, reason: 'Not on desktop breakpoint' };
        }
        
        const results = {
            passed: true,
            issues: [],
            tests: {}
        };
        
        // Test three-column layouts
        const grids = document.querySelectorAll('.feature-boxes-grid');
        grids.forEach((grid, index) => {
            const styles = window.getComputedStyle(grid);
            const columns = styles.gridTemplateColumns;
            const columnCount = columns.split(' ').length;
            
            if (columnCount !== 3) {
                results.passed = false;
                results.issues.push(`Grid ${index + 1} should have 3 columns on desktop: ${columnCount} columns`);
            }
        });
        
        // Test hero layout
        const heroContainer = document.querySelector('.hero-container');
        if (heroContainer) {
            const styles = window.getComputedStyle(heroContainer);
            const columns = styles.gridTemplateColumns;
            
            if (!columns.includes('1fr 1fr')) {
                results.passed = false;
                results.issues.push('Hero container should use two-column layout on desktop');
            }
        }
        
        return results;
    }
    
    /**
     * Test touch target sizes for accessibility
     */
    testTouchTargets() {
        const results = {
            passed: true,
            issues: [],
            elements: []
        };
        
        const interactiveElements = document.querySelectorAll(
            'button, a, input, [role="button"], .cta-btn, .feature-box-link'
        );
        
        interactiveElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const minSize = this.currentBreakpoint === 'mobile' ? 48 : 44;
            
            const elementResult = {
                element: element.tagName.toLowerCase(),
                className: element.className,
                width: rect.width,
                height: rect.height,
                passed: rect.width >= minSize && rect.height >= minSize
            };
            
            if (!elementResult.passed) {
                results.passed = false;
                results.issues.push(
                    `Element ${index + 1} (${element.tagName}) touch target too small: ${rect.width}x${rect.height}px`
                );
            }
            
            results.elements.push(elementResult);
        });
        
        return results;
    }
    
    /**
     * Test text readability across devices
     */
    testTextReadability() {
        const results = {
            passed: true,
            issues: [],
            elements: []
        };
        
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
        
        textElements.forEach((element, index) => {
            const styles = window.getComputedStyle(element);
            const fontSize = parseInt(styles.fontSize);
            const lineHeight = parseFloat(styles.lineHeight) || 1.2;
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            const elementResult = {
                element: element.tagName.toLowerCase(),
                fontSize: fontSize,
                lineHeight: lineHeight,
                passed: true
            };
            
            // Check minimum font size
            const minFontSize = this.currentBreakpoint === 'mobile' ? 14 : 12;
            if (fontSize < minFontSize) {
                elementResult.passed = false;
                results.passed = false;
                results.issues.push(`Text element ${index + 1} font size too small: ${fontSize}px`);
            }
            
            // Check line height
            if (lineHeight < 1.2) {
                elementResult.passed = false;
                results.passed = false;
                results.issues.push(`Text element ${index + 1} line height too tight: ${lineHeight}`);
            }
            
            results.elements.push(elementResult);
        });
        
        return results;
    }
    
    /**
     * Test image scaling and responsiveness
     */
    testImageScaling() {
        const results = {
            passed: true,
            issues: [],
            images: []
        };
        
        const images = document.querySelectorAll('img, svg, .hero-visual, .mockup-content');
        
        images.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            
            const imageResult = {
                element: element.tagName.toLowerCase(),
                width: rect.width,
                maxWidth: styles.maxWidth,
                objectFit: styles.objectFit,
                passed: true
            };
            
            // Check if image overflows container
            const parent = element.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                if (rect.width > parentRect.width) {
                    imageResult.passed = false;
                    results.passed = false;
                    results.issues.push(`Image ${index + 1} overflows container: ${rect.width}px > ${parentRect.width}px`);
                }
            }
            
            results.images.push(imageResult);
        });
        
        return results;
    }
    
    /**
     * Test navigation usability across devices
     */
    testNavigationUsability() {
        const results = {
            passed: true,
            issues: [],
            navigation: []
        };
        
        const navElements = document.querySelectorAll('nav, .site-header, .footer-nav, .hero-actions');
        
        navElements.forEach((nav, index) => {
            const styles = window.getComputedStyle(nav);
            const display = styles.display;
            const flexDirection = styles.flexDirection;
            
            const navResult = {
                element: nav.className,
                display: display,
                flexDirection: flexDirection,
                passed: true
            };
            
            // Check mobile navigation stacking
            if (this.currentBreakpoint === 'mobile' && flexDirection !== 'column') {
                const links = nav.querySelectorAll('a, button');
                if (links.length > 2) {
                    navResult.passed = false;
                    results.passed = false;
                    results.issues.push(`Navigation ${index + 1} should stack vertically on mobile`);
                }
            }
            
            results.navigation.push(navResult);
        });
        
        return results;
    }
    
    /**
     * Optimize performance and layout for current device
     */
    optimizeForDevice() {
        // Optimize animations based on device capabilities
        if (this.currentBreakpoint === 'mobile') {
            this.optimizeForMobile();
        } else if (this.currentBreakpoint === 'tablet') {
            this.optimizeForTablet();
        } else {
            this.optimizeForDesktop();
        }
        
        // Apply device-specific optimizations
        this.applyDeviceOptimizations();
    }
    
    /**
     * Mobile-specific optimizations
     */
    optimizeForMobile() {
        // Reduce animation complexity
        const animatedElements = document.querySelectorAll('.feature-box, .decorative-circle');
        animatedElements.forEach(element => {
            element.style.willChange = 'auto';
            element.style.transform = 'none';
        });
        
        // Optimize touch interactions
        const touchElements = document.querySelectorAll('.cta-btn, .feature-box-link');
        touchElements.forEach(element => {
            element.style.minHeight = '48px';
            element.style.minWidth = '48px';
        });
        
        // Ensure single column layout
        const grids = document.querySelectorAll('.feature-boxes-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = '1fr';
        });
    }
    
    /**
     * Tablet-specific optimizations
     */
    optimizeForTablet() {
        // Optimize for two-column layouts
        const grids = document.querySelectorAll('.feature-boxes-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        });
        
        // Adjust button layouts
        const buttonContainers = document.querySelectorAll('.hero-actions');
        buttonContainers.forEach(container => {
            container.style.flexDirection = 'row';
            container.style.justifyContent = 'center';
        });
    }
    
    /**
     * Desktop-specific optimizations
     */
    optimizeForDesktop() {
        // Enable full animations
        const animatedElements = document.querySelectorAll('.feature-box, .decorative-circle');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform';
        });
        
        // Optimize for three-column layouts
        const grids = document.querySelectorAll('.feature-boxes-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        });
        
        // Ensure max-width centering
        const containers = document.querySelectorAll('.landing-container, .hero-container');
        containers.forEach(container => {
            container.style.maxWidth = '1440px';
            container.style.margin = '0 auto';
        });
    }
    
    /**
     * Apply general device optimizations
     */
    applyDeviceOptimizations() {
        // Detect device capabilities
        const hasTouch = 'ontouchstart' in window;
        const hasHover = window.matchMedia('(hover: hover)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Apply touch-specific optimizations
        if (hasTouch) {
            document.body.classList.add('touch-device');
            
            // Remove hover effects on touch devices
            const hoverElements = document.querySelectorAll('.feature-box, .cta-btn');
            hoverElements.forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                });
                
                element.addEventListener('touchend', function() {
                    setTimeout(() => {
                        this.classList.remove('touch-active');
                    }, 150);
                });
            });
        }
        
        // Apply reduced motion preferences
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            
            const animatedElements = document.querySelectorAll('*');
            animatedElements.forEach(element => {
                element.style.animation = 'none';
                element.style.transition = 'none';
            });
        }
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        const previousBreakpoint = this.currentBreakpoint;
        this.detectCurrentBreakpoint();
        
        if (previousBreakpoint !== this.currentBreakpoint) {
            this.optimizeForDevice();
            this.runCompatibilityTests();
            
            // Dispatch custom event for breakpoint change
            window.dispatchEvent(new CustomEvent('breakpointChange', {
                detail: {
                    previous: previousBreakpoint,
                    current: this.currentBreakpoint,
                    width: window.innerWidth
                }
            }));
        }
    }
    
    /**
     * Run all tests and return comprehensive results
     */
    runAllTests() {
        const results = this.runCompatibilityTests();
        
        // Log results for debugging
        console.group('Responsive Design Verification Results');
        console.log('Current Breakpoint:', this.currentBreakpoint);
        console.log('Viewport Size:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('Test Results:', results);
        
        // Check overall pass/fail status
        const allPassed = Object.values(results).every(test => 
            test.skipped || test.passed !== false
        );
        
        if (allPassed) {
            console.log('✅ All responsive design tests passed!');
        } else {
            console.warn('⚠️ Some responsive design tests failed. Check individual test results.');
        }
        
        console.groupEnd();
        
        return results;
    }
    
    /**
     * Get current test results
     */
    getTestResults() {
        return {
            breakpoint: this.currentBreakpoint,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            tests: this.testResults,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize responsive verifier when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.responsiveVerifier = new ResponsiveVerifier();
    
    // Expose testing methods globally for debugging
    window.testResponsiveDesign = () => window.responsiveVerifier.runAllTests();
    window.getResponsiveResults = () => window.responsiveVerifier.getTestResults();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveVerifier;
}