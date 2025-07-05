#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function simpleModalCapture() {
  console.log('📷 Starting simple modal capture...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    console.log('🌐 Navigating to workspace...');
    await page.goto('http://127.0.0.1:8001/#/workspace', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Handle login if needed
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 3000 });
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log('⚠️ No login form found or already logged in');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('➕ Clicking floating action button...');
    // Click the floating action button (red + button)
    const fabButton = await page.$('button[class*="fixed"], .floating-action-button, button[style*="position: fixed"]');
    
    if (fabButton) {
      await fabButton.click();
      console.log('✅ Clicked floating action button');
    } else {
      // Try clicking one of the "Add a task" buttons in columns
      const addTaskButtons = await page.$$('button');
      for (const button of addTaskButtons) {
        const text = await button.evaluate(el => el.textContent?.trim() || '');
        if (text.includes('Add a task')) {
          await button.click();
          console.log('✅ Clicked "Add a task" button');
          break;
        }
      }
    }

    console.log('⏱️ Waiting 3 seconds for modal to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📷 Taking screenshot after button click...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/after-click.png',
      fullPage: true 
    });

    console.log('✅ Screenshot saved as after-click.png');

    // Check what elements are visible on page
    console.log('🔍 Checking for any modal-like elements...');
    const modals = await page.$$('[role="dialog"], .modal, .dialog, .sheet, .overlay, [data-state="open"], .task-modal, .create-task-modal');
    console.log(`Found ${modals.length} potential modal elements`);

    // Check for any elements with z-index or overlay styles
    const overlayElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return (
          style.position === 'fixed' || 
          style.position === 'absolute' ||
          style.zIndex > 100 ||
          style.backgroundColor === 'rgba(0, 0, 0, 0.5)' ||
          el.className.includes('modal') ||
          el.className.includes('dialog') ||
          el.className.includes('overlay')
        );
      }).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 100) || ''
      }));
    });

    console.log('🔍 Found overlay-like elements:', overlayElements.length);
    overlayElements.forEach((el, i) => {
      console.log(`  ${i}: ${el.tagName} (class: ${el.className}, id: ${el.id}) - "${el.text}"`);
    });

  } catch (error) {
    console.error('❌ Error during capture:', error);
  } finally {
    console.log('🔍 Browser kept open for inspection. Close when done.');
    // await browser.close();
  }
}

// Run the capture function
simpleModalCapture().catch(console.error);