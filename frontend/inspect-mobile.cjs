const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto('http://127.0.0.1:8001/#/workspace');
  await new Promise(r => setTimeout(r, 2000));
  
  // Get the actual computed styles of navigation items
  const navStyles = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return 'No nav found';
    
    const buttons = nav.querySelectorAll('button');
    const navContainer = nav.parentElement;
    
    const styles = window.getComputedStyle(buttons[0]);
    const navComputedStyles = window.getComputedStyle(nav);
    const containerStyles = window.getComputedStyle(navContainer);
    
    // Get space between buttons
    const buttonRects = Array.from(buttons).map(b => b.getBoundingClientRect());
    const gaps = [];
    for (let i = 1; i < buttonRects.length; i++) {
      gaps.push(buttonRects[i].top - buttonRects[i-1].bottom);
    }
    
    return {
      button: {
        height: styles.height,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        lineHeight: styles.lineHeight,
        fontSize: styles.fontSize,
        boxSizing: styles.boxSizing
      },
      nav: {
        gap: navComputedStyles.gap,
        rowGap: navComputedStyles.rowGap,
        display: navComputedStyles.display,
        className: nav.className
      },
      container: {
        padding: containerStyles.padding,
        className: navContainer.className
      },
      measuredGaps: gaps,
      buttonCount: buttons.length
    };
  });
  
  console.log('Navigation styles:', JSON.stringify(navStyles, null, 2));
  
  await browser.close();
})();