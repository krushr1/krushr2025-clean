#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugWorkspace() {
  console.log('📷 Starting workspace debugging...');
  
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

    console.log('📷 Taking initial screenshot...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/step1-initial.png',
      fullPage: true 
    });

    console.log('🔐 Waiting for login form...');
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      console.log('✅ Found email input');
      
      console.log('🔒 Clicking login button...');
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📷 Taking post-login screenshot...');
        await page.screenshot({ 
          path: '/Users/justindoff/Cursor Projects/Krushr/frontend/step2-post-login.png',
          fullPage: true 
        });
      }
    } catch (error) {
      console.log('⚠️ No login form found or already logged in');
    }

    console.log('🎯 Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📷 Taking final screenshot...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/step3-final.png',
      fullPage: true 
    });

    console.log('🔍 Analyzing page content...');
    const title = await page.title();
    const url = page.url();
    console.log('📝 Page title:', title);
    console.log('📝 Current URL:', url);

    // Look for any buttons that might be create/add buttons
    const allButtons = await page.$$('button');
    console.log(`🔍 Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const button = allButtons[i];
      const text = await button.evaluate(el => el.textContent?.trim() || '');
      const className = await button.evaluate(el => el.className || '');
      const id = await button.evaluate(el => el.id || '');
      
      if (text.length > 0 || className.includes('create') || className.includes('add') || id.includes('create') || id.includes('add')) {
        console.log(`  Button ${i}: "${text}" (class: ${className}, id: ${id})`);
      }
    }

    console.log('✅ Debug complete. Check the screenshots.');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
    
    // Take a screenshot of the error state
    try {
      await page.screenshot({ 
        path: '/Users/justindoff/Cursor Projects/Krushr/frontend/error-debug.png',
        fullPage: true 
      });
      console.log('📷 Error state screenshot saved as error-debug.png');
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser kept open for manual inspection. Close it when done.');
    // await browser.close();
  }
}

// Run the debug function
debugWorkspace().catch(console.error);