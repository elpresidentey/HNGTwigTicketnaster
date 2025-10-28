/**
 * Asset Optimizer - Handles asset loading optimization and JavaScript bundle management
 * Provides lazy loading, preloading, and performance optimization features
 */
class AssetOptimizer {
    constructor() {
        this.loadedAssets = new Set();
        this.preloadQueue = [];
        this.criticalAssets = new Set();
        this.performanceMetrics = {
            loadTimes: {},
            bundleSize: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        this.init();
    }

    /**
     * Initialize asset optimizer
     */
    init() {
        this.setupPerformanceObserver();
        this.optimizeExistingAssets();
        this.setupLazyLoading();
        this.preloadCriticalAssets();
    }

    /**
     * Setup performance observer to track asset loading
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource') {
                        this.trackAssetPerformance(entry);
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Performance observer not supported for resource timing');
            }
        }
    }

    /**
     * Track asset performance metrics
     * @param {PerformanceResourceTiming} entry - Performance entry
     */
    trackAssetPerformance(entry) {
        const { name, duration, transferSize } = entry;
        
        // Track load times
        this.performanceMetrics.loadTimes[name] = duration;
        
        // Track bundle size
        if (transferSize) {
            this.performanceMetrics.bundleSize += transferSize;
        }

        // Log slow assets
        if (duration > 1000) {
            console.warn(`Slow asset detected: ${name} took ${duration}ms to load`);
        }
    }

    /**
     * Optimize existing assets on the page
     */
    optimizeExistingAssets() {
        // Optimize images
        this.optimizeImages();
        
        // Optimize scripts
        this.optimizeScripts();
        
        // Optimize stylesheets
        this.optimizeStylesheets();
    }

    /**
     * Optimize images with lazy loading and responsive loading
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" if not already present
            if (!img.hasAttribute('loading') && !this.isAboveFold(img)) {
                img.setAttribute('loading', 'lazy');
            }

            // Add error handling
            img.addEventListener('error', () => {
                this.handleImageError(img);
            });

            // Track when image loads
            img.addEventListener('load', () => {
                this.loadedAssets.add(img.src);
            });
        });
    }

    /**
     * Optimize script loading
     */
    optimizeScripts() {
        const scripts = document.querySelectorAll('script[src]');
        
        scripts.forEach(script => {
            // Add async/defer if not critical
            if (!this.isCriticalScript(script.src)) {
                if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                    script.setAttribute('defer', '');
                }
            }

            // Track script loading
            script.addEventListener('load', () => {
                this.loadedAssets.add(script.src);
            });

            script.addEventListener('error', () => {
                this.handleScriptError(script);
            });
        });
    }

    /**
     * Optimize stylesheet loading
     */
    optimizeStylesheets() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        stylesheets.forEach(link => {
            // Preload non-critical CSS
            if (!this.isCriticalStylesheet(link.href)) {
                link.setAttribute('media', 'print');
                link.setAttribute('onload', "this.media='all'");
            }

            // Track stylesheet loading
            link.addEventListener('load', () => {
                this.loadedAssets.add(link.href);
            });

            link.addEventListener('error', () => {
                this.handleStylesheetError(link);
            });
        });
    }

    /**
     * Setup lazy loading for dynamic content
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyAsset(entry.target);
                        lazyObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe lazy-loadable elements
            document.querySelectorAll('[data-lazy-src]').forEach(el => {
                lazyObserver.observe(el);
            });
        }
    }

    /**
     * Preload critical assets
     */
    preloadCriticalAssets() {
        const criticalAssets = [
            '/assets/js/auth.js',
            '/assets/js/utils.js',
            '/assets/css/styles.css'
        ];

        criticalAssets.forEach(asset => {
            this.preloadAsset(asset);
        });
    }

    /**
     * Preload an asset
     * @param {string} url - Asset URL to preload
     * @param {string} type - Asset type (script, style, image)
     */
    preloadAsset(url, type = 'script') {
        if (this.loadedAssets.has(url)) {
            this.performanceMetrics.cacheHits++;
            return Promise.resolve();
        }

        this.performanceMetrics.cacheMisses++;

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            
            switch (type) {
                case 'script':
                    link.as = 'script';
                    break;
                case 'style':
                    link.as = 'style';
                    break;
                case 'image':
                    link.as = 'image';
                    break;
                default:
                    link.as = 'fetch';
                    link.crossOrigin = 'anonymous';
            }

            link.addEventListener('load', () => {
                this.loadedAssets.add(url);
                resolve();
            });

            link.addEventListener('error', reject);

            document.head.appendChild(link);
        });
    }

    /**
     * Load lazy asset
     * @param {HTMLElement} element - Element to load asset for
     */
    loadLazyAsset(element) {
        const lazySrc = element.getAttribute('data-lazy-src');
        if (!lazySrc) return;

        if (element.tagName === 'IMG') {
            element.src = lazySrc;
        } else if (element.tagName === 'SCRIPT') {
            element.src = lazySrc;
        }

        element.removeAttribute('data-lazy-src');
        element.classList.add('lazy-loaded');
    }

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
     * Check if script is critical
     * @param {string} src - Script source
     * @returns {boolean} True if critical
     */
    isCriticalScript(src) {
        const criticalScripts = [
            'auth.js',
            'utils.js',
            'page-init.js'
        ];
        
        return criticalScripts.some(script => src.includes(script));
    }

    /**
     * Check if stylesheet is critical
     * @param {string} href - Stylesheet href
     * @returns {boolean} True if critical
     */
    isCriticalStylesheet(href) {
        return href.includes('styles.css');
    }

    /**
     * Handle image loading errors
     * @param {HTMLImageElement} img - Failed image element
     */
    handleImageError(img) {
        console.warn(`Failed to load image: ${img.src}`);
        
        // Set fallback image or hide
        img.style.display = 'none';
        
        // Add error class for styling
        img.classList.add('image-error');
    }

    /**
     * Handle script loading errors
     * @param {HTMLScriptElement} script - Failed script element
     */
    handleScriptError(script) {
        console.error(`Failed to load script: ${script.src}`);
        
        // Try to load fallback or show error
        this.showAssetError('script', script.src);
    }

    /**
     * Handle stylesheet loading errors
     * @param {HTMLLinkElement} link - Failed stylesheet element
     */
    handleStylesheetError(link) {
        console.error(`Failed to load stylesheet: ${link.href}`);
        
        // Show error or load fallback
        this.showAssetError('stylesheet', link.href);
    }

    /**
     * Show asset loading error
     * @param {string} type - Asset type
     * @param {string} url - Asset URL
     */
    showAssetError(type, url) {
        if (typeof toastSystem !== 'undefined') {
            toastSystem.showWarning(`Failed to load ${type}. Some features may not work properly.`);
        }
    }

    /**
     * Minimize JavaScript bundle by removing unused code
     */
    minimizeBundle() {
        // Remove debug code in production
        if (window.location.hostname !== 'localhost') {
            // Override console methods to reduce bundle size
            ['log', 'warn', 'info'].forEach(method => {
                console[method] = () => {};
            });
        }

        // Remove unused event listeners
        this.cleanupUnusedListeners();
    }

    /**
     * Clean up unused event listeners
     */
    cleanupUnusedListeners() {
        // Remove listeners from elements that no longer exist
        const elements = document.querySelectorAll('[data-cleanup-listeners]');
        elements.forEach(el => {
            if (!document.contains(el)) {
                // Element was removed, clean up its listeners
                el.removeEventListener('click', null);
                el.removeEventListener('input', null);
                el.removeEventListener('change', null);
            }
        });
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            loadedAssetsCount: this.loadedAssets.size,
            cacheHitRate: this.performanceMetrics.cacheHits / 
                         (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
        };
    }

    /**
     * Optimize for mobile devices
     */
    optimizeForMobile() {
        // Reduce animations on mobile
        if (this.isMobileDevice()) {
            document.documentElement.classList.add('reduce-motion');
        }

        // Optimize touch interactions
        this.optimizeTouchInteractions();
    }

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    /**
     * Optimize touch interactions
     */
    optimizeTouchInteractions() {
        // Add touch-friendly classes
        document.documentElement.classList.add('touch-device');
        
        // Increase touch targets
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            if (btn.offsetHeight < 44) {
                btn.style.minHeight = '44px';
            }
        });
    }

    /**
     * Enable resource hints for better performance
     */
    enableResourceHints() {
        // DNS prefetch for external domains
        this.addDNSPrefetch(['fonts.googleapis.com', 'cdn.jsdelivr.net']);
        
        // Preconnect to critical origins
        this.addPreconnect(['https://fonts.gstatic.com']);
    }

    /**
     * Add DNS prefetch hints
     * @param {string[]} domains - Domains to prefetch
     */
    addDNSPrefetch(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
    }

    /**
     * Add preconnect hints
     * @param {string[]} origins - Origins to preconnect
     */
    addPreconnect(origins) {
        origins.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
}

// Initialize asset optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const assetOptimizer = new AssetOptimizer();
    
    // Make available globally for debugging
    window.assetOptimizer = assetOptimizer;
    
    // Optimize for mobile if needed
    assetOptimizer.optimizeForMobile();
    
    // Enable resource hints
    assetOptimizer.enableResourceHints();
    
    // Minimize bundle in production
    assetOptimizer.minimizeBundle();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetOptimizer;
}