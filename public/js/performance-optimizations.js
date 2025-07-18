
// Performance Optimization Utilities
window.KrushrPerformance = {
  // Debounce utility
  debounce: function(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },
  
  // Throttle utility
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Optimize message handlers
  optimizeMessageHandlers: function() {
    // Debounce message handlers that are taking too long
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'message' && typeof listener === 'function') {
        const debouncedListener = window.KrushrPerformance.debounce(listener, 100);
        originalAddEventListener.call(this, type, debouncedListener, options);
      } else {
        originalAddEventListener.call(this, type, listener, options);
      }
    };
  },
  
  // Initialize optimizations
  init: function() {
    this.optimizeMessageHandlers();
    console.log('🚀 Krushr performance optimizations enabled');
  }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.KrushrPerformance.init());
} else {
  window.KrushrPerformance.init();
}
