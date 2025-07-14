// Quick diagnostic to identify page freeze issues
console.log('🔍 KRUSHR DIAGNOSTIC: Starting analysis...');

// Performance timing
const startTime = performance.now();
let checks = [];

// Check 1: DOM size
const domSize = document.querySelectorAll('*').length;
checks.push({ name: 'DOM Size', value: domSize, threshold: 5000, status: domSize > 5000 ? 'WARNING' : 'OK' });

// Check 2: Active animations
const animations = document.getAnimations ? document.getAnimations() : [];
const animationCount = animations.length;
checks.push({ name: 'Active Animations', value: animationCount, threshold: 20, status: animationCount > 20 ? 'WARNING' : 'OK' });

// Check 3: Infinite animations
let infiniteAnimations = 0;
document.querySelectorAll('[style*="animation"]').forEach(el => {
    if (el.style.animation.includes('infinite')) infiniteAnimations++;
});
document.querySelectorAll('[class*="animation"]').forEach(el => {
    if (el.className.includes('infinite')) infiniteAnimations++;
});
checks.push({ name: 'Infinite Animations', value: infiniteAnimations, threshold: 10, status: infiniteAnimations > 10 ? 'ERROR' : 'OK' });

// Check 4: Script execution time
const scriptTime = performance.now() - startTime;
checks.push({ name: 'Script Execution', value: scriptTime.toFixed(2) + 'ms', threshold: 100, status: scriptTime > 100 ? 'WARNING' : 'OK' });

// Check 5: Memory usage
if (performance.memory) {
    const memoryMB = performance.memory.usedJSHeapSize / 1048576;
    checks.push({ name: 'Memory Usage', value: memoryMB.toFixed(2) + 'MB', threshold: 50, status: memoryMB > 50 ? 'WARNING' : 'OK' });
}

// Check 6: CSS animations
const cssAnimations = document.querySelectorAll('[style*="animation"], [class*="animate"]').length;
checks.push({ name: 'CSS Animations', value: cssAnimations, threshold: 30, status: cssAnimations > 30 ? 'WARNING' : 'OK' });

// Check 7: Event listeners (estimation)
let eventListeners = 0;
document.querySelectorAll('*').forEach(el => {
    if (el.onclick || el.onmouseover || el.onmouseout || el.onmouseenter || el.onmouseleave) eventListeners++;
});
checks.push({ name: 'Event Listeners', value: eventListeners, threshold: 100, status: eventListeners > 100 ? 'WARNING' : 'OK' });

// Check 8: Large images
const images = document.querySelectorAll('img');
let largeImages = 0;
images.forEach(img => {
    if (img.naturalWidth > 2000 || img.naturalHeight > 2000) largeImages++;
});
checks.push({ name: 'Large Images', value: largeImages, threshold: 5, status: largeImages > 5 ? 'WARNING' : 'OK' });

// Check 9: Failed resources
const failedResources = [];
document.querySelectorAll('img, link, script').forEach(el => {
    if (el.tagName === 'IMG' && !el.complete) failedResources.push(el.src);
    if (el.tagName === 'LINK' && el.sheet === null) failedResources.push(el.href);
});
checks.push({ name: 'Failed Resources', value: failedResources.length, threshold: 0, status: failedResources.length > 0 ? 'ERROR' : 'OK' });

// Check 10: Webflow components
const webflowElements = document.querySelectorAll('[data-w-id], .w-slider, .w-nav, .w-form').length;
checks.push({ name: 'Webflow Elements', value: webflowElements, threshold: 50, status: webflowElements > 50 ? 'WARNING' : 'OK' });

// Check 11: GSAP animations
const gsapElements = document.querySelectorAll('[data-gsap]').length;
checks.push({ name: 'GSAP Elements', value: gsapElements, threshold: 20, status: gsapElements > 20 ? 'WARNING' : 'OK' });

// Performance monitoring
let frameCount = 0;
let lastFrameTime = performance.now();
let fps = 0;

function measureFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
        frameCount = 0;
        lastFrameTime = currentTime;
        
        if (fps < 30) {
            console.warn('🔴 LOW FPS DETECTED:', fps);
        }
    }
    requestAnimationFrame(measureFPS);
}

measureFPS();

// Main thread blocking test
const mainThreadStart = performance.now();
setTimeout(() => {
    const mainThreadDelay = performance.now() - mainThreadStart;
    checks.push({ name: 'Main Thread Block', value: mainThreadDelay.toFixed(2) + 'ms', threshold: 10, status: mainThreadDelay > 10 ? 'ERROR' : 'OK' });
    
    // Generate report
    generateReport();
}, 0);

function generateReport() {
    console.log('\n🔍 KRUSHR DIAGNOSTIC REPORT');
    console.log('=' .repeat(40));
    
    let errors = 0;
    let warnings = 0;
    
    checks.forEach(check => {
        const icon = check.status === 'ERROR' ? '🔴' : check.status === 'WARNING' ? '⚠️' : '✅';
        console.log(`${icon} ${check.name}: ${check.value} (${check.status})`);
        
        if (check.status === 'ERROR') errors++;
        if (check.status === 'WARNING') warnings++;
    });
    
    console.log('\n📊 SUMMARY');
    console.log(`Errors: ${errors}, Warnings: ${warnings}`);
    console.log(`Total checks: ${checks.length}`);
    console.log(`Current FPS: ${fps}`);
    
    // Specific issue identification
    if (infiniteAnimations > 15) {
        console.log('\n🚨 LIKELY ISSUE: Too many infinite animations');
        console.log('   Solution: Reduce animation frequency or remove infinite loops');
    }
    
    if (domSize > 8000) {
        console.log('\n🚨 LIKELY ISSUE: DOM too large');
        console.log('   Solution: Reduce DOM complexity or lazy load content');
    }
    
    if (failedResources.length > 0) {
        console.log('\n🚨 LIKELY ISSUE: Failed resources causing delays');
        console.log('   Failed resources:', failedResources);
    }
    
    // Export to window for external access
    window.krushrDiagnostic = {
        checks,
        fps,
        errors,
        warnings,
        failedResources,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n✅ Diagnostic complete. Data available in window.krushrDiagnostic');
}

// Monitor for freezes
let lastActivityTime = performance.now();
let freezeDetected = false;

function detectFreeze() {
    const currentTime = performance.now();
    const timeSinceActivity = currentTime - lastActivityTime;
    
    if (timeSinceActivity > 5000 && !freezeDetected) { // 5 second freeze
        freezeDetected = true;
        console.error('🚨 PAGE FREEZE DETECTED!');
        console.error('Time since last activity:', timeSinceActivity, 'ms');
        
        // Try to identify the cause
        const activeAnimations = document.getAnimations ? document.getAnimations().length : 0;
        console.error('Active animations during freeze:', activeAnimations);
        
        // Check for infinite loops in setTimeout/setInterval
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(...args) {
            console.warn('setTimeout called during freeze:', args[0]);
            return originalSetTimeout.apply(this, args);
        };
        
        window.setInterval = function(...args) {
            console.warn('setInterval called during freeze:', args[0]);
            return originalSetInterval.apply(this, args);
        };
    }
    
    lastActivityTime = currentTime;
    requestAnimationFrame(detectFreeze);
}

detectFreeze();

// Auto-run diagnostic after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔍 Running post-load diagnostic...');
            generateReport();
        }, 2000);
    });
} else {
    setTimeout(() => {
        console.log('🔍 Running immediate diagnostic...');
        generateReport();
    }, 1000);
}