
// React Performance Optimizations
window.KrushrReact = {
  // React DevTools check
  checkDevTools: function() {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.info('💡 Install React DevTools for better debugging: https://reactjs.org/link/react-devtools');
      }
    }
  },
  
  // Performance monitoring
  measureRender: function(componentName, renderFn) {
    return function(...args) {
      const start = performance.now();
      const result = renderFn.apply(this, args);
      const end = performance.now();
      
      if (end - start > 16) { // Longer than one frame
        console.warn(`⚠️ Slow render in ${componentName}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    };
  },
  
  init: function() {
    this.checkDevTools();
    console.log('⚛️ React optimizations loaded');
  }
};

// Initialize React optimizations
if (typeof window !== 'undefined') {
  window.KrushrReact.init();
}
