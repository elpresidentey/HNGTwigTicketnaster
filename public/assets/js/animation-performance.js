/**
 * Animation Performance Optimization and Monitoring
 * Handles GPU acceleration, performance monitoring, and adaptive animations
 */

class AnimationPerformanceManager {
  constructor() {
    this.isHighPerformanceDevice = this.detectPerformanceCapability();
    this.reducedMotion = this.checkReducedMotionPreference();
    this.animationFrameId = null;
    this.performanceMetrics = {
      frameDrops: 0,
      averageFPS: 60,
      lastFrameTime: performance.now()
    };
    
    this.init();
  }

  /**
   * Initialize the performance manager
   */
  init() {
    this.setupPerformanceMonitoring();
    this.optimizeAnimationsForDevice();
    this.setupIntersectionObserver();
    this.handleReducedMotion();
    this.setupEventListeners();
  }

  /**
   * Detect device performance capability
   */
  detectPerformanceCapability() {
    // Check for hardware acceleration support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    // Check device memory (if available)
    const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB
    
    // Check CPU cores
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Determine if this is a high-performance device
    return hasWebGL && deviceMemory >= 4 && hardwareConcurrency >= 4;
  }

  /**
   * Check user's reduced motion preference
   */
  checkReducedMotionPreference() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if (!this.isHighPerformanceDevice || this.reducedMotion) {
      return; // Skip monitoring on low-performance devices or when reduced motion is preferred
    }

    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitorFrame = (currentTime) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.performanceMetrics.averageFPS = fps;
        
        // Detect frame drops
        if (fps < 50) {
          this.performanceMetrics.frameDrops++;
          this.adaptAnimationsForPerformance();
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      this.animationFrameId = requestAnimationFrame(monitorFrame);
    };
    
    this.animationFrameId = requestAnimationFrame(monitorFrame);
  }

  /**
   * Adapt animations based on performance
   */
  adaptAnimationsForPerformance() {
    const body = document.body;
    
    if (this.performanceMetrics.averageFPS < 30) {
      // Very poor performance - disable complex animations
      body.classList.add('low-performance');
      this.disableComplexAnimations();
    } else if (this.performanceMetrics.averageFPS < 50) {
      // Moderate performance - reduce animation complexity
      body.classList.add('reduced-performance');
      this.reduceAnimationComplexity();
    } else {
      // Good performance - enable all animations
      body.classList.remove('low-performance', 'reduced-performance');
    }
  }

  /**
   * Optimize animations based on device capability
   */
  optimizeAnimationsForDevice() {
    const body = document.body;
    
    if (this.isHighPerformanceDevice) {
      body.classList.add('high-performance');
      this.enableGPUAcceleration();
    } else {
      body.classList.add('low-performance');
      this.disableComplexAnimations();
    }
    
    // Add device-specific classes
    if (this.isMobileDevice()) {
      body.classList.add('mobile-device');
    }
    
    if (this.isTabletDevice()) {
      body.classList.add('tablet-device');
    }
  }

  /**
   * Enable GPU acceleration for supported elements
   */
  enableGPUAcceleration() {
    const animatedElements = document.querySelectorAll(
      '.feature-box, .cta-btn, .decorative-circle, .hero-section'
    );
    
    animatedElements.forEach(element => {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
    });
  }

  /**
   * Disable complex animations for performance
   */
  disableComplexAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .low-performance .decorative-circle {
        animation: none !important;
        opacity: 0.05 !important;
      }
      
      .low-performance .feature-box:hover {
        transform: none !important;
      }
      
      .low-performance .cta-btn:hover {
        transform: none !important;
      }
      
      .low-performance .hero-badge,
      .low-performance .title-line,
      .low-performance .hero-description-enhanced,
      .low-performance .hero-actions {
        animation: none !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Reduce animation complexity
   */
  reduceAnimationComplexity() {
    const style = document.createElement('style');
    style.textContent = `
      .reduced-performance .decorative-circle {
        animation-duration: 10s !important;
      }
      
      .reduced-performance .feature-box:hover {
        transform: translateY(-4px) !important;
      }
      
      .reduced-performance .cta-btn:hover {
        transform: translateY(-2px) !important;
      }
      
      .reduced-performance .hero-badge,
      .reduced-performance .title-line,
      .reduced-performance .hero-description-enhanced,
      .reduced-performance .hero-actions {
        animation-duration: 0.4s !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup Intersection Observer for scroll animations
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      this.fallbackScrollAnimations();
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Fallback scroll animations for older browsers
   */
  fallbackScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const checkScroll = () => {
      animateElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
          element.classList.add('in-view');
        }
      });
    };
    
    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Initial check
    checkScroll();
  }

  /**
   * Handle reduced motion preference
   */
  handleReducedMotion() {
    if (this.reducedMotion) {
      document.body.classList.add('reduced-motion');
      this.disableAllAnimations();
    }

    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
        this.disableAllAnimations();
      } else {
        document.body.classList.remove('reduced-motion');
        this.enableAnimations();
      }
    });
  }

  /**
   * Disable all animations for accessibility
   */
  disableAllAnimations() {
    const style = document.createElement('style');
    style.id = 'reduced-motion-styles';
    style.textContent = `
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      .reduced-motion .decorative-circle {
        animation: none !important;
        opacity: 0.05 !important;
      }
      
      .reduced-motion .feature-box:hover,
      .reduced-motion .cta-btn:hover {
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Re-enable animations
   */
  enableAnimations() {
    const existingStyle = document.getElementById('reduced-motion-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  /**
   * Setup event listeners for performance optimization
   */
  setupEventListeners() {
    // Pause animations when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });

    // Optimize for battery level (if available)
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2) { // Low battery
          this.reduceAnimationComplexity();
        }
        
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            this.reduceAnimationComplexity();
          }
        });
      });
    }

    // Handle window resize for responsive animations
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  /**
   * Pause animations when page is hidden
   */
  pauseAnimations() {
    const animatedElements = document.querySelectorAll('.decorative-circle');
    animatedElements.forEach(element => {
      element.style.animationPlayState = 'paused';
    });
  }

  /**
   * Resume animations when page is visible
   */
  resumeAnimations() {
    const animatedElements = document.querySelectorAll('.decorative-circle');
    animatedElements.forEach(element => {
      element.style.animationPlayState = 'running';
    });
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate performance for new viewport
    this.optimizeAnimationsForDevice();
    
    // Update intersection observer if needed
    if (window.innerWidth < 768) {
      document.body.classList.add('mobile-viewport');
    } else {
      document.body.classList.remove('mobile-viewport');
    }
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  /**
   * Check if device is tablet
   */
  isTabletDevice() {
    return /iPad|Android/i.test(navigator.userAgent) && 
           window.innerWidth >= 768 && 
           window.innerWidth < 1024;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      isHighPerformanceDevice: this.isHighPerformanceDevice,
      reducedMotion: this.reducedMotion
    };
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    window.removeEventListener('scroll', this.checkScroll);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.pauseAnimations);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on landing page
  if (document.body.classList.contains('landing-page') || 
      window.location.pathname === '/' || 
      window.location.pathname === '/index.php') {
    
    window.animationManager = new AnimationPerformanceManager();
    
    // Expose performance metrics for debugging
    if (window.location.search.includes('debug=performance')) {
      setInterval(() => {
        console.log('Animation Performance:', window.animationManager.getPerformanceMetrics());
      }, 5000);
    }
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationPerformanceManager;
}