#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function captureTaskModal() {
  console.log('📷 Starting task modal capture...');
  
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

    console.log('🔐 Handling login...');
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log('⚠️ No login form found or already logged in');
    }

    console.log('🎯 Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📷 Taking pre-modal screenshot...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/pre-modal.png',
      fullPage: true 
    });

    console.log('➕ Looking for task creation buttons...');
    
    // Try the floating action button first
    let createButton = await page.$('.floating-action-button, button[class*="floating"], button[style*="position: fixed"]');
    
    if (!createButton) {
      // Try the "Add a task" buttons in columns
      const addTaskButtons = await page.$$('button');
      for (const button of addTaskButtons) {
        const text = await button.evaluate(el => el.textContent?.trim() || '');
        if (text.includes('Add a task') || text.includes('add a task') || text.includes('Add Task')) {
          createButton = button;
          console.log(`✅ Found "Add a task" button`);
          break;
        }
      }
    }

    if (!createButton) {
      // Try the + button at the bottom right
      createButton = await page.$('button[class*="bg-red"], button[style*="background"], .fixed button');
    }

    if (!createButton) {
      console.log('❌ No create task button found');
      return;
    }

    console.log('🖱️ Clicking create task button...');
    await createButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🎯 Waiting for modal to appear...');
    // Wait for modal with various possible selectors
    await page.waitForSelector('.modal, .dialog, [role="dialog"], .task-modal, .create-task-modal, .sheet, [data-state="open"]', { timeout: 10000 });

    console.log('📷 Taking task modal screenshot...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/task-modal-screenshot.png',
      fullPage: true 
    });

    console.log('✅ Task modal screenshot saved as task-modal-screenshot.png');

  } catch (error) {
    console.error('❌ Error during capture:', error);
    
    try {
      await page.screenshot({ 
        path: '/Users/justindoff/Cursor Projects/Krushr/frontend/error-capture.png',
        fullPage: true 
      });
      console.log('📷 Error state screenshot saved as error-capture.png');
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser kept open for manual inspection. Close it when done.');
    // await browser.close();
  }
}

// Run the capture function
captureTaskModal().catch(console.error);