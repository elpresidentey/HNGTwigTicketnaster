/**
 * Optimization Integration - Coordinates all optimization systems
 * Integrates asset optimization, loading states, error boundaries, and responsive design
 */
class OptimizationIntegration {
    constructor() {
        this.systems = {
            assetOptimizer: null,
            loadingStates: null,
            errorBoundaries: null,
            responsiveVerifier: null,
            featureDetector: null
        };
        this.isInitialized = false;
        this.performanceMetrics = {
            initTime: 0,
            loadTime: 0,
            interactionTime: 0,
            errorCount: 0,
            optimizationLevel: 'basic'
        };
        this.init();
    }

    /**
     * Initialize optimization integration
     */
    async init() {
        if (this.isInitialized) return;

        const startTime = performance.now();

        try {
            // Initialize systems in order of priority
            await this.initializeCoreSystems();
            await this.initializeOptimizationSystems();
            await this.setupIntegrations();
            await this.performInitialOptimizations();
            
            this.performanceMetrics.initTime = performance.now() - startTime;
            this.isInitialized = true;
            
            console.log(`Optimization integration initialized in ${this.performanceMetrics.initTime.toFixed(2)}ms`);
            
            // Start monitoring
            this.startPerformanceMonitoring();
            
        } catch (error) {
            console.error('Optimization integration failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        // Initialize feature detector first
        if (typeof FeatureDetector !== 'undefined') {
            this.systems.featureDetector = window.featureDetector || new FeatureDetector();
        }

        // Initialize error boundaries early for error handling
        if (typeof ErrorBoundariesSystem !== 'undefined') {
            this.systems.errorBoundaries = window.errorBoundariesSystem || new ErrorBoundariesSystem();
        }

        // Initialize loading states for user feedback
        if (typeof LoadingStatesManager !== 'undefined') {
            this.systems.loadingStates = window.loadingStates || new LoadingStatesManager();
        }
    }

    /**
     * Initialize optimization systems
     */
    async initializeOptimizationSystems() {
        // Initialize asset optimizer
        if (typeof AssetOptimizer !== 'undefined') {
            this.systems.assetOptimizer = window.assetOptimizer || new AssetOptimizer();
        }

        // Initialize responsive verifier
        if (typeof ResponsiveVerifier !== 'undefined') {
            this.systems.responsiveVerifier = window.responsiveVerifier || new ResponsiveVerifier();
        }
    }

    /**
     * Setup integrations between systems
     */
    async setupIntegrations() {
        this.setupErrorBoundaryIntegration();
        this.setupLoadingStateIntegration();
        this.setupResponsiveIntegration();
        this.setupAssetOptimizationIntegration();
        this.setupPerformanceIntegration();
    }

    /**
     * Setup error boundary integration
     */
    setupErrorBoundaryIntegration() {
        if (!this.systems.errorBoundaries) return;

        // Integrate with loading states
        if (this.systems.loadingStates) {
            this.systems.errorBoundaries.addGlobalErrorHandler((errorInfo) => {
                // Hide any active loading states on critical errors
                if (this.isCriticalError(errorInfo)) {
                    this.systems.loadingStates.hideGlobalLoading();
                }
            });
        }

        // Integrate with asset optimizer
        if (this.systems.assetOptimizer) {
            this.systems.errorBoundaries.addGlobalErrorHandler((errorInfo) => {
                // Track asset loading errors
                if (errorInfo.type === 'resource') {
                    console.warn('Asset loading error tracked:', errorInfo.message);
                }
            });
        }
    }

    /**
     * Setup loading state integration
     */
    setupLoadingStateIntegration() {
        if (!this.systems.loadingStates) return;

        // Integrate with responsive verifier
        if (this.systems.responsiveVerifier) {
            // Show loading during responsive verification
            this.systems.responsiveVerifier.addResizeHandler(() => {
                const loaderId = this.systems.loadingStates.showLoading(
                    document.body, 
                    'Optimizing layout...', 
                    { spinner: 'pulse', showMessage: false }
                );
                
                setTimeout(() => {
                    this.systems.loadingStates.hideLoading(loaderId);
                }, 300);
            });
        }

        // Integrate with asset optimizer
        if (this.systems.assetOptimizer) {
            // Show progress for asset loading
            this.interceptAssetLoading();
        }
    }

    /**
     * Setup responsive integration
     */
    setupResponsiveIntegration() {
        if (!this.systems.responsiveVerifier) return;

        // Integrate with asset optimizer
        if (this.systems.assetOptimizer) {
            this.systems.responsiveVerifier.addResizeHandler((breakpoint) => {
                // Optimize assets for new breakpoint
                this.optimizeAssetsForBreakpoint(breakpoint);
            });
        }

        // Integrate with loading states
        if (this.systems.loadingStates) {
            this.systems.responsiveVerifier.addOrientationChangeHandler(() => {
                // Adjust loading indicators for orientation
                this.adjustLoadingForOrientation();
            });
        }
    }

    /**
     * Setup asset optimization integration
     */
    setupAssetOptimizationIntegration() {
        if (!this.systems.assetOptimizer) return;

        // Integrate with feature detector
        if (this.systems.featureDetector) {
            const features = this.systems.featureDetector.getAllFeatures();
            
            // Optimize based on detected features
            if (!features.capabilities.graphics.webgl) {
                this.disableHeavyAnimations();
            }
            
            if (!features.capabilities.network.fetch) {
                this.enableXHRFallbacks();
            }
        }

        // Integrate with responsive verifier
        if (this.systems.responsiveVerifier) {
            // Optimize touch targets on mobile
            if (this.systems.responsiveVerifier.isMobile()) {
                this.optimizeForMobile();
            }
        }
    }

    /**
     * Setup performance integration
     */
    setupPerformanceIntegration() {
        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();
        
        // Setup performance observers
        this.setupPerformanceObservers();
        
        // Monitor resource loading
        this.monitorResourceLoading();
    }

    /**
     * Perform initial optimizations
     */
    async performInitialOptimizations() {
        // Optimize critical rendering path
        this.optimizeCriticalRenderingPath();
        
        // Preload critical resources
        await this.preloadCriticalResources();
        
        // Optimize images
        this.optimizeImages();
        
        // Setup lazy loading
        this.setupLazyLoading();
        
        // Optimize fonts
        this.optimizeFonts();
        
        // Minimize JavaScript bundles
        this.minimizeJavaScriptBundles();
    }

    /**
     * Optimize critical rendering path
     */
    optimizeCriticalRenderingPath() {
        // Inline critical CSS if not already done
        this.inlineCriticalCSS();
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
        
        // Optimize script loading
        this.optimizeScriptLoading();
    }

    /**
     * Inline critical CSS
     */
    inlineCriticalCSS() {
        // Check if critical CSS is already inlined
        if (document.querySelector('style[data-critical]')) return;

        const criticalCSS = `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); z-index: 9999; }
            .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
            .btn-primary { background: #3B82F6; color: white; }
            .hidden { display: none; }
        `;

        const style = document.createElement('style');
        style.setAttribute('data-critical', 'true');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    /**
     * Defer non-critical CSS
     */
    deferNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        stylesheets.forEach(link => {
            if (!this.isCriticalStylesheet(link.href)) {
                // Use media="print" trick to defer loading
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                };
            }
        });
    }

    /**
     * Optimize script loading
     */
    optimizeScriptLoading() {
        const scripts = document.querySelectorAll('script[src]');
        
        scripts.forEach(script => {
            if (!this.isCriticalScript(script.src)) {
                if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                    script.setAttribute('defer', '');
                }
            }
        });
    }

    /**
     * Preload critical resources
     */
    async preloadCriticalResources() {
        const criticalResources = [
            { href: '/assets/css/styles.css', as: 'style' },
            { href: '/assets/js/utils.js', as: 'script' },
            { href: '/assets/js/auth.js', as: 'script' }
        ];

        const preloadPromises = criticalResources.map(resource => {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href;
                link.as = resource.as;
                link.onload = resolve;
                link.onerror = resolve; // Don't fail on preload errors
                document.head.appendChild(link);
                
                // Timeout after 3 seconds
                setTimeout(resolve, 3000);
            });
        });

        await Promise.all(preloadPromises);
    }

    /**
     * Optimize images
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" for below-fold images
            if (!this.isAboveFold(img)) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add decoding="async" for better performance
            img.setAttribute('decoding', 'async');
            
            // Ensure responsive images
            if (!img.style.maxWidth) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });
    }

    /**
     * Setup lazy loading
     */
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyElements = document.querySelectorAll('[data-lazy-src], [data-lazy-background]');
        
        if (lazyElements.length === 0) return;

        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyElements.forEach(el => lazyObserver.observe(el));
    }

    /**
     * Load lazy element
     * @param {HTMLElement} element - Element to load
     */
    loadLazyElement(element) {
        const lazySrc = element.getAttribute('data-lazy-src');
        const lazyBackground = element.getAttribute('data-lazy-background');

        if (lazySrc) {
            if (element.tagName === 'IMG') {
                element.src = lazySrc;
            } else {
                element.style.backgroundImage = `url(${lazySrc})`;
            }
            element.removeAttribute('data-lazy-src');
        }

        if (lazyBackground) {
            element.style.backgroundImage = `url(${lazyBackground})`;
            element.removeAttribute('data-lazy-background');
        }

        element.classList.add('lazy-loaded');
    }

    /**
     * Optimize fonts
     */
    optimizeFonts() {
        // Add font-display: swap to existing font faces
        const fontFaces = document.querySelectorAll('link[href*="fonts"]');
        
        fontFaces.forEach(link => {
            link.setAttribute('rel', 'preload');
            link.setAttribute('as', 'font');
            link.setAttribute('crossorigin', '');
        });

        // Add font-display CSS if not present
        if (!document.querySelector('style[data-font-display]')) {
            const style = document.createElement('style');
            style.setAttribute('data-font-display', 'true');
            style.textContent = `
                @font-face {
                    font-display: swap;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Minimize JavaScript bundles
     */
    minimizeJavaScriptBundles() {
        // Remove debug code in production
        if (!this.isDevelopment()) {
            this.removeDebugCode();
        }

        // Optimize event listeners
        this.optimizeEventListeners();

        // Remove unused polyfills
        this.removeUnusedPolyfills();
    }

    /**
     * Remove debug code
     */
    removeDebugCode() {
        // Override console methods in production
        if (window.location.hostname !== 'localhost') {
            ['debug', 'info', 'warn'].forEach(method => {
                console[method] = () => {};
            });
        }
    }

    /**
     * Optimize event listeners
     */
    optimizeEventListeners() {
        // Use passive listeners where appropriate
        const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
        
        passiveEvents.forEach(eventType => {
            this.makeEventListenersPassive(eventType);
        });
    }

    /**
     * Make event listeners passive
     * @param {string} eventType - Event type
     */
    makeEventListenersPassive(eventType) {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === eventType && typeof options !== 'object') {
                options = { passive: true };
            } else if (type === eventType && typeof options === 'object' && options.passive === undefined) {
                options.passive = true;
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    /**
     * Remove unused polyfills
     */
    removeUnusedPolyfills() {
        // Check if polyfills are needed
        const features = this.systems.featureDetector?.getAllFeatures();
        
        if (features?.capabilities.network.fetch) {
            // Remove fetch polyfill if native fetch is available
            delete window.fetchPolyfill;
        }
        
        if (features?.capabilities.graphics.intersectionObserver) {
            // Remove intersection observer polyfill if native is available
            delete window.IntersectionObserverPolyfill;
        }
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Monitor Largest Contentful Paint (LCP)
        this.monitorLCP();
        
        // Monitor First Input Delay (FID)
        this.monitorFID();
        
        // Monitor Cumulative Layout Shift (CLS)
        this.monitorCLS();
    }

    /**
     * Monitor Largest Contentful Paint
     */
    monitorLCP() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.performanceMetrics.lcp = lastEntry.startTime;
                
                if (lastEntry.startTime > 2500) {
                    console.warn(`LCP is slow: ${lastEntry.startTime}ms`);
                    this.optimizeLCP();
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('LCP monitoring not supported');
        }
    }

    /**
     * Monitor First Input Delay
     */
    monitorFID() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.performanceMetrics.fid = entry.processingStart - entry.startTime;
                    
                    if (entry.processingStart - entry.startTime > 100) {
                        console.warn(`FID is slow: ${entry.processingStart - entry.startTime}ms`);
                        this.optimizeFID();
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('FID monitoring not supported');
        }
    }

    /**
     * Monitor Cumulative Layout Shift
     */
    monitorCLS() {
        if (!('PerformanceObserver' in window)) return;

        try {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.performanceMetrics.cls = clsValue;
                
                if (clsValue > 0.1) {
                    console.warn(`CLS is high: ${clsValue}`);
                    this.optimizeCLS();
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('CLS monitoring not supported');
        }
    }

    /**
     * Setup performance observers
     */
    setupPerformanceObservers() {
        if (!('PerformanceObserver' in window)) return;

        // Monitor resource loading
        try {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 1000) {
                        console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
                    }
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.warn('Resource monitoring not supported');
        }
    }

    /**
     * Monitor resource loading
     */
    monitorResourceLoading() {
        // Track failed resources
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.performanceMetrics.errorCount++;
                console.warn('Resource failed to load:', event.target.src || event.target.href);
            }
        }, true);
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Monitor page load time
        window.addEventListener('load', () => {
            this.performanceMetrics.loadTime = performance.now();
            this.analyzePerformance();
        });

        // Monitor interaction time
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!this.performanceMetrics.interactionTime) {
                    this.performanceMetrics.interactionTime = performance.now();
                }
            }, { once: true, passive: true });
        });

        // Periodic performance check
        setInterval(() => {
            this.performPerformanceCheck();
        }, 30000); // Every 30 seconds
    }

    /**
     * Analyze performance and suggest optimizations
     */
    analyzePerformance() {
        const metrics = this.performanceMetrics;
        
        // Determine optimization level
        if (metrics.loadTime < 1000 && metrics.errorCount === 0) {
            metrics.optimizationLevel = 'excellent';
        } else if (metrics.loadTime < 2000 && metrics.errorCount < 3) {
            metrics.optimizationLevel = 'good';
        } else if (metrics.loadTime < 3000 && metrics.errorCount < 5) {
            metrics.optimizationLevel = 'fair';
        } else {
            metrics.optimizationLevel = 'poor';
        }

        console.log('Performance Analysis:', metrics);

        // Apply optimizations based on performance
        if (metrics.optimizationLevel === 'poor') {
            this.applyAggressiveOptimizations();
        } else if (metrics.optimizationLevel === 'fair') {
            this.applyModerateOptimizations();
        }
    }

    /**
     * Perform periodic performance check
     */
    performPerformanceCheck() {
        // Check memory usage
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            
            if (memoryUsage > 0.8) {
                console.warn('High memory usage detected:', memoryUsage);
                this.optimizeMemoryUsage();
            }
        }

        // Check for long tasks
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry.duration + 'ms');
                        }
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    // Optimization Methods

    /**
     * Optimize for LCP
     */
    optimizeLCP() {
        // Preload LCP element
        const lcpElement = this.findLCPElement();
        if (lcpElement) {
            this.preloadLCPElement(lcpElement);
        }

        // Optimize critical resources
        this.optimizeCriticalResources();
    }

    /**
     * Optimize for FID
     */
    optimizeFID() {
        // Break up long tasks
        this.breakUpLongTasks();
        
        // Defer non-critical JavaScript
        this.deferNonCriticalJavaScript();
    }

    /**
     * Optimize for CLS
     */
    optimizeCLS() {
        // Add size attributes to images
        this.addImageDimensions();
        
        // Reserve space for dynamic content
        this.reserveSpaceForDynamicContent();
    }

    /**
     * Apply aggressive optimizations
     */
    applyAggressiveOptimizations() {
        console.log('Applying aggressive optimizations');
        
        // Disable non-essential features
        this.disableNonEssentialFeatures();
        
        // Reduce animation complexity
        this.reduceAnimationComplexity();
        
        // Optimize images more aggressively
        this.aggressiveImageOptimization();
    }

    /**
     * Apply moderate optimizations
     */
    applyModerateOptimizations() {
        console.log('Applying moderate optimizations');
        
        // Optimize animations
        this.optimizeAnimations();
        
        // Lazy load more content
        this.expandLazyLoading();
    }

    /**
     * Optimize memory usage
     */
    optimizeMemoryUsage() {
        // Clean up unused event listeners
        this.cleanupEventListeners();
        
        // Clear caches
        this.clearCaches();
        
        // Garbage collect if possible
        if (window.gc) {
            window.gc();
        }
    }

    // Utility Methods

    /**
     * Check if element is above the fold
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if above fold
     */
    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight;
    }

    /**
     * Check if stylesheet is critical
     * @param {string} href - Stylesheet href
     * @returns {boolean} True if critical
     */
    isCriticalStylesheet(href) {
        return href.includes('styles.css') || href.includes('critical');
    }

    /**
     * Check if script is critical
     * @param {string} src - Script src
     * @returns {boolean} True if critical
     */
    isCriticalScript(src) {
        const criticalScripts = ['utils.js', 'auth.js', 'page-init.js'];
        return criticalScripts.some(script => src.includes(script));
    }

    /**
     * Check if error is critical
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if critical
     */
    isCriticalError(errorInfo) {
        return errorInfo.type === 'javascript' && 
               (errorInfo.message.includes('Cannot read property') || 
                errorInfo.message.includes('is not a function'));
    }

    /**
     * Check if in development mode
     * @returns {boolean} True if development
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    /**
     * Find LCP element
     * @returns {HTMLElement|null} LCP element
     */
    findLCPElement() {
        // Simple heuristic to find likely LCP element
        const candidates = document.querySelectorAll('img, h1, h2, .hero, .banner');
        let largestElement = null;
        let largestSize = 0;

        candidates.forEach(element => {
            const rect = element.getBoundingClientRect();
            const size = rect.width * rect.height;
            
            if (size > largestSize && this.isAboveFold(element)) {
                largestSize = size;
                largestElement = element;
            }
        });

        return largestElement;
    }

    /**
     * Preload LCP element
     * @param {HTMLElement} element - LCP element
     */
    preloadLCPElement(element) {
        if (element.tagName === 'IMG' && element.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = element.src;
            link.as = 'image';
            document.head.appendChild(link);
        }
    }

    /**
     * Handle initialization error
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        console.error('Optimization integration initialization failed:', error);
        
        // Fallback to basic optimizations
        this.applyBasicOptimizations();
    }

    /**
     * Apply basic optimizations as fallback
     */
    applyBasicOptimizations() {
        // Basic image optimization
        this.optimizeImages();
        
        // Basic script optimization
        this.optimizeScriptLoading();
        
        // Basic CSS optimization
        this.deferNonCriticalCSS();
    }

    /**
     * Get optimization report
     * @returns {Object} Optimization report
     */
    getOptimizationReport() {
        return {
            isInitialized: this.isInitialized,
            systems: Object.keys(this.systems).reduce((acc, key) => {
                acc[key] = !!this.systems[key];
                return acc;
            }, {}),
            performanceMetrics: this.performanceMetrics,
            timestamp: Date.now()
        };
    }
}

// Initialize optimization integration when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.optimizationIntegration = new OptimizationIntegration();
    
    console.log('Optimization integration started');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizationIntegration;
}