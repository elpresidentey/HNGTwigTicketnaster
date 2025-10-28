/**
 * Feature Detection - Advanced browser capability detection and polyfill management
 * Provides comprehensive feature detection and graceful degradation strategies
 */
class FeatureDetector {
    constructor() {
        this.features = new Map();
        this.polyfills = new Map();
        this.capabilities = {
            storage: {},
            network: {},
            graphics: {},
            input: {},
            apis: {},
            performance: {}
        };
        this.init();
    }

    /**
     * Initialize feature detection
     */
    init() {
        this.detectStorageFeatures();
        this.detectNetworkFeatures();
        this.detectGraphicsFeatures();
        this.detectInputFeatures();
        this.detectAPIFeatures();
        this.detectPerformanceFeatures();
        this.applyFeatureClasses();
        this.loadRequiredPolyfills();
    }

    /**
     * Detect storage-related features
     */
    detectStorageFeatures() {
        // LocalStorage
        this.capabilities.storage.localStorage = this.testFeature('localStorage', () => {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        });

        // SessionStorage
        this.capabilities.storage.sessionStorage = this.testFeature('sessionStorage', () => {
            const test = '__sessionStorage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        });

        // IndexedDB
        this.capabilities.storage.indexedDB = this.testFeature('indexedDB', () => {
            return 'indexedDB' in window;
        });

        // WebSQL (deprecated but still check)
        this.capabilities.storage.webSQL = this.testFeature('webSQL', () => {
            return 'openDatabase' in window;
        });

        // Cache API
        this.capabilities.storage.cacheAPI = this.testFeature('cacheAPI', () => {
            return 'caches' in window;
        });
    }

    /**
     * Detect network-related features
     */
    detectNetworkFeatures() {
        // Fetch API
        this.capabilities.network.fetch = this.testFeature('fetch', () => {
            return 'fetch' in window;
        });

        // XMLHttpRequest Level 2
        this.capabilities.network.xhr2 = this.testFeature('xhr2', () => {
            return 'FormData' in window && 'upload' in new XMLHttpRequest();
        });

        // WebSockets
        this.capabilities.network.webSockets = this.testFeature('webSockets', () => {
            return 'WebSocket' in window;
        });

        // Server-Sent Events
        this.capabilities.network.eventSource = this.testFeature('eventSource', () => {
            return 'EventSource' in window;
        });

        // Network Information API
        this.capabilities.network.networkInfo = this.testFeature('networkInfo', () => {
            return 'connection' in navigator;
        });

        // Online/Offline detection
        this.capabilities.network.onlineEvents = this.testFeature('onlineEvents', () => {
            return 'onLine' in navigator;
        });
    }

    /**
     * Detect graphics and animation features
     */
    detectGraphicsFeatures() {
        // Canvas
        this.capabilities.graphics.canvas = this.testFeature('canvas', () => {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        });

        // WebGL
        this.capabilities.graphics.webgl = this.testFeature('webgl', () => {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        });

        // SVG
        this.capabilities.graphics.svg = this.testFeature('svg', () => {
            return !!(document.createElementNS && 
                     document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
        });

        // CSS Animations
        this.capabilities.graphics.cssAnimations = this.testFeature('cssAnimations', () => {
            const element = document.createElement('div');
            return 'animationName' in element.style;
        });

        // CSS Transforms
        this.capabilities.graphics.cssTransforms = this.testFeature('cssTransforms', () => {
            const element = document.createElement('div');
            return 'transform' in element.style;
        });

        // RequestAnimationFrame
        this.capabilities.graphics.requestAnimationFrame = this.testFeature('requestAnimationFrame', () => {
            return 'requestAnimationFrame' in window;
        });

        // Intersection Observer
        this.capabilities.graphics.intersectionObserver = this.testFeature('intersectionObserver', () => {
            return 'IntersectionObserver' in window;
        });
    }

    /**
     * Detect input-related features
     */
    detectInputFeatures() {
        // Touch Events
        this.capabilities.input.touch = this.testFeature('touch', () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        });

        // Pointer Events
        this.capabilities.input.pointer = this.testFeature('pointer', () => {
            return 'onpointerdown' in window;
        });

        // Gamepad API
        this.capabilities.input.gamepad = this.testFeature('gamepad', () => {
            return 'getGamepads' in navigator;
        });

        // Device Orientation
        this.capabilities.input.deviceOrientation = this.testFeature('deviceOrientation', () => {
            return 'DeviceOrientationEvent' in window;
        });

        // Device Motion
        this.capabilities.input.deviceMotion = this.testFeature('deviceMotion', () => {
            return 'DeviceMotionEvent' in window;
        });
    }

    /**
     * Detect API features
     */
    detectAPIFeatures() {
        // Geolocation
        this.capabilities.apis.geolocation = this.testFeature('geolocation', () => {
            return 'geolocation' in navigator;
        });

        // Notifications
        this.capabilities.apis.notifications = this.testFeature('notifications', () => {
            return 'Notification' in window;
        });

        // Service Workers
        this.capabilities.apis.serviceWorker = this.testFeature('serviceWorker', () => {
            return 'serviceWorker' in navigator;
        });

        // Web Workers
        this.capabilities.apis.webWorkers = this.testFeature('webWorkers', () => {
            return 'Worker' in window;
        });

        // File API
        this.capabilities.apis.fileAPI = this.testFeature('fileAPI', () => {
            return 'FileReader' in window;
        });

        // Drag and Drop
        this.capabilities.apis.dragDrop = this.testFeature('dragDrop', () => {
            const div = document.createElement('div');
            return 'draggable' in div || 'ondragstart' in div;
        });

        // History API
        this.capabilities.apis.history = this.testFeature('history', () => {
            return !!(window.history && history.pushState);
        });

        // Fullscreen API
        this.capabilities.apis.fullscreen = this.testFeature('fullscreen', () => {
            const element = document.createElement('div');
            return !!(element.requestFullscreen || 
                     element.webkitRequestFullscreen || 
                     element.mozRequestFullScreen || 
                     element.msRequestFullscreen);
        });
    }

    /**
     * Detect performance-related features
     */
    detectPerformanceFeatures() {
        // Performance API
        this.capabilities.performance.performanceAPI = this.testFeature('performanceAPI', () => {
            return 'performance' in window;
        });

        // Performance Observer
        this.capabilities.performance.performanceObserver = this.testFeature('performanceObserver', () => {
            return 'PerformanceObserver' in window;
        });

        // User Timing API
        this.capabilities.performance.userTiming = this.testFeature('userTiming', () => {
            return !!(window.performance && 
                     performance.mark && 
                     performance.measure);
        });

        // Navigation Timing
        this.capabilities.performance.navigationTiming = this.testFeature('navigationTiming', () => {
            return !!(window.performance && performance.timing);
        });

        // Resource Timing
        this.capabilities.performance.resourceTiming = this.testFeature('resourceTiming', () => {
            return !!(window.performance && performance.getEntriesByType);
        });
    }

    /**
     * Test a feature safely
     * @param {string} name - Feature name
     * @param {Function} test - Test function
     * @returns {boolean} Test result
     */
    testFeature(name, test) {
        try {
            const result = test();
            this.features.set(name, result);
            return result;
        } catch (error) {
            console.warn(`Feature detection failed for ${name}:`, error);
            this.features.set(name, false);
            return false;
        }
    }

    /**
     * Apply feature classes to HTML element
     */
    applyFeatureClasses() {
        const html = document.documentElement;
        
        // Add feature classes
        this.features.forEach((supported, feature) => {
            const className = supported ? `has-${feature}` : `no-${feature}`;
            html.classList.add(className);
        });

        // Add device type classes
        this.addDeviceClasses(html);
        
        // Add browser classes
        this.addBrowserClasses(html);
    }

    /**
     * Add device-specific classes
     * @param {HTMLElement} html - HTML element
     */
    addDeviceClasses(html) {
        // Mobile detection
        if (this.isMobile()) {
            html.classList.add('mobile-device');
        } else {
            html.classList.add('desktop-device');
        }

        // Tablet detection
        if (this.isTablet()) {
            html.classList.add('tablet-device');
        }

        // Touch device
        if (this.capabilities.input.touch) {
            html.classList.add('touch-device');
        } else {
            html.classList.add('no-touch');
        }

        // High DPI
        if (this.isHighDPI()) {
            html.classList.add('high-dpi');
        }
    }

    /**
     * Add browser-specific classes
     * @param {HTMLElement} html - HTML element
     */
    addBrowserClasses(html) {
        const browser = this.detectBrowser();
        html.classList.add(`browser-${browser.name}`);
        html.classList.add(`browser-${browser.name}-${browser.majorVersion}`);
        
        if (browser.isModern) {
            html.classList.add('modern-browser');
        } else {
            html.classList.add('legacy-browser');
        }
    }

    /**
     * Load required polyfills based on feature detection
     */
    loadRequiredPolyfills() {
        const polyfillsToLoad = [];

        // Check which polyfills are needed
        if (!this.capabilities.network.fetch) {
            polyfillsToLoad.push('fetch');
        }

        if (!this.capabilities.graphics.intersectionObserver) {
            polyfillsToLoad.push('intersection-observer');
        }

        if (!this.capabilities.graphics.requestAnimationFrame) {
            polyfillsToLoad.push('raf');
        }

        if (!this.capabilities.apis.webWorkers) {
            polyfillsToLoad.push('web-workers');
        }

        // Load polyfills
        this.loadPolyfills(polyfillsToLoad);
    }

    /**
     * Load polyfills
     * @param {string[]} polyfills - Array of polyfill names to load
     */
    loadPolyfills(polyfills) {
        polyfills.forEach(polyfill => {
            switch (polyfill) {
                case 'fetch':
                    this.loadFetchPolyfill();
                    break;
                case 'intersection-observer':
                    this.loadIntersectionObserverPolyfill();
                    break;
                case 'raf':
                    this.loadRAFPolyfill();
                    break;
                case 'web-workers':
                    this.loadWebWorkersPolyfill();
                    break;
            }
        });
    }

    /**
     * Load fetch polyfill
     */
    loadFetchPolyfill() {
        if (!this.capabilities.network.fetch) {
            // Simple fetch polyfill using XMLHttpRequest
            window.fetch = (url, options = {}) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open(options.method || 'GET', url);
                    
                    if (options.headers) {
                        Object.keys(options.headers).forEach(key => {
                            xhr.setRequestHeader(key, options.headers[key]);
                        });
                    }
                    
                    xhr.onload = () => {
                        resolve({
                            ok: xhr.status >= 200 && xhr.status < 300,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            text: () => Promise.resolve(xhr.responseText),
                            json: () => Promise.resolve(JSON.parse(xhr.responseText))
                        });
                    };
                    
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(options.body);
                });
            };
            
            this.polyfills.set('fetch', true);
        }
    }

    /**
     * Load IntersectionObserver polyfill
     */
    loadIntersectionObserverPolyfill() {
        if (!this.capabilities.graphics.intersectionObserver) {
            // Simple IntersectionObserver polyfill
            window.IntersectionObserver = function(callback, options = {}) {
                this.callback = callback;
                this.options = options;
                this.observedElements = [];
                
                this.observe = (element) => {
                    this.observedElements.push(element);
                    this.checkIntersection();
                };
                
                this.unobserve = (element) => {
                    const index = this.observedElements.indexOf(element);
                    if (index > -1) {
                        this.observedElements.splice(index, 1);
                    }
                };
                
                this.disconnect = () => {
                    this.observedElements = [];
                };
                
                this.checkIntersection = () => {
                    this.observedElements.forEach(element => {
                        const rect = element.getBoundingClientRect();
                        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                        
                        this.callback([{
                            target: element,
                            isIntersecting,
                            intersectionRatio: isIntersecting ? 1 : 0
                        }]);
                    });
                };
                
                // Check on scroll and resize
                window.addEventListener('scroll', () => this.checkIntersection(), { passive: true });
                window.addEventListener('resize', () => this.checkIntersection(), { passive: true });
            };
            
            this.polyfills.set('intersection-observer', true);
        }
    }

    /**
     * Load requestAnimationFrame polyfill
     */
    loadRAFPolyfill() {
        if (!this.capabilities.graphics.requestAnimationFrame) {
            let lastTime = 0;
            
            window.requestAnimationFrame = (callback) => {
                const currTime = new Date().getTime();
                const timeToCall = Math.max(0, 16 - (currTime - lastTime));
                const id = window.setTimeout(() => {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
            
            window.cancelAnimationFrame = (id) => {
                clearTimeout(id);
            };
            
            this.polyfills.set('raf', true);
        }
    }

    /**
     * Load Web Workers polyfill (limited functionality)
     */
    loadWebWorkersPolyfill() {
        if (!this.capabilities.apis.webWorkers) {
            // Very basic Worker polyfill that runs in main thread
            window.Worker = function(scriptURL) {
                console.warn('Web Workers not supported, running in main thread');
                
                this.postMessage = (data) => {
                    // Simulate async execution
                    setTimeout(() => {
                        if (this.onmessage) {
                            this.onmessage({ data: `Echo: ${JSON.stringify(data)}` });
                        }
                    }, 0);
                };
                
                this.terminate = () => {
                    // No-op for polyfill
                };
            };
            
            this.polyfills.set('web-workers', true);
        }
    }

    // Device Detection Methods

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && this.capabilities.input.touch);
    }

    /**
     * Check if device is tablet
     * @returns {boolean} True if tablet
     */
    isTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ||
               (window.innerWidth > 768 && window.innerWidth <= 1024 && this.capabilities.input.touch);
    }

    /**
     * Check if device has high DPI
     * @returns {boolean} True if high DPI
     */
    isHighDPI() {
        return window.devicePixelRatio > 1;
    }

    /**
     * Detect browser information
     * @returns {Object} Browser information
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = { name: 'unknown', version: '0', majorVersion: 0, isModern: false };

        // Chrome
        if (userAgent.includes('Chrome')) {
            const match = userAgent.match(/Chrome\/(\d+)/);
            browser.name = 'chrome';
            browser.version = match ? match[1] : '0';
            browser.majorVersion = parseInt(browser.version);
            browser.isModern = browser.majorVersion >= 60;
        }
        // Firefox
        else if (userAgent.includes('Firefox')) {
            const match = userAgent.match(/Firefox\/(\d+)/);
            browser.name = 'firefox';
            browser.version = match ? match[1] : '0';
            browser.majorVersion = parseInt(browser.version);
            browser.isModern = browser.majorVersion >= 55;
        }
        // Safari
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            const match = userAgent.match(/Version\/(\d+)/);
            browser.name = 'safari';
            browser.version = match ? match[1] : '0';
            browser.majorVersion = parseInt(browser.version);
            browser.isModern = browser.majorVersion >= 11;
        }
        // Edge
        else if (userAgent.includes('Edge')) {
            const match = userAgent.match(/Edge\/(\d+)/);
            browser.name = 'edge';
            browser.version = match ? match[1] : '0';
            browser.majorVersion = parseInt(browser.version);
            browser.isModern = browser.majorVersion >= 16;
        }
        // Internet Explorer
        else if (userAgent.includes('Trident')) {
            const match = userAgent.match(/rv:(\d+)/);
            browser.name = 'ie';
            browser.version = match ? match[1] : '0';
            browser.majorVersion = parseInt(browser.version);
            browser.isModern = false; // IE is never considered modern
        }

        return browser;
    }

    // Public API Methods

    /**
     * Check if a feature is supported
     * @param {string} feature - Feature name
     * @returns {boolean} True if supported
     */
    hasFeature(feature) {
        return this.features.get(feature) || false;
    }

    /**
     * Get all detected features
     * @returns {Object} All features and capabilities
     */
    getAllFeatures() {
        return {
            features: Object.fromEntries(this.features),
            capabilities: this.capabilities,
            polyfills: Object.fromEntries(this.polyfills)
        };
    }

    /**
     * Get feature support report
     * @returns {Object} Detailed feature report
     */
    getFeatureReport() {
        const browser = this.detectBrowser();
        
        return {
            browser,
            device: {
                isMobile: this.isMobile(),
                isTablet: this.isTablet(),
                isHighDPI: this.isHighDPI(),
                hasTouch: this.capabilities.input.touch
            },
            capabilities: this.capabilities,
            polyfillsLoaded: Object.fromEntries(this.polyfills),
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
    }
}

// Initialize feature detection immediately
const featureDetector = new FeatureDetector();

// Make available globally
window.featureDetector = featureDetector;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureDetector;
}