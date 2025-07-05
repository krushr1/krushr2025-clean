#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function captureTaskModal() {
  console.log('📷 Starting browser automation to capture task modal...');
  
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

    console.log('🔐 Waiting for login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('🔒 Clicking login button...');
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎯 Waiting for workspace to load...');
    await page.waitForSelector('[data-testid="workspace"], .kanban-board, .workspace-container', { timeout: 15000 });

    console.log('➕ Looking for task creation button...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try multiple selectors for the task creation button
    const possibleSelectors = [
      'button:has-text("Create Task")',
      'button:has-text("Add Task")',
      '[data-testid="create-task-button"]',
      '[data-testid="add-task-button"]',
      '.kanban-column button:has-text("+")',
      '.kanban-column .add-task-button',
      'button[title*="Create"]',
      'button[title*="Add"]',
      '.floating-action-button',
      'button:has-text("+ Add Task")'
    ];

    let createButton = null;
    for (const selector of possibleSelectors) {
      try {
        createButton = await page.$(selector);
        if (createButton) {
          console.log(`✅ Found create button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // If no button found, look for any button with "+" or "Create" text
    if (!createButton) {
      console.log('🔍 Searching for any button with create/add text...');
      const allButtons = await page.$$('button');
      for (const button of allButtons) {
        const text = await button.evaluate(el => el.textContent?.toLowerCase() || '');
        if (text.includes('create') || text.includes('add') || text.includes('+')) {
          console.log(`🎯 Found potential create button with text: "${text}"`);
          createButton = button;
          break;
        }
      }
    }

    if (!createButton) {
      console.log('❌ No create task button found. Taking screenshot of current state...');
      await page.screenshot({ 
        path: '/Users/justindoff/Cursor Projects/Krushr/frontend/workspace-no-button.png',
        fullPage: true 
      });
      
      // Get HTML content for debugging
      const content = await page.content();
      console.log('📝 Current page title:', await page.title());
      console.log('📝 URL:', page.url());
      
      return;
    }

    console.log('🖱️ Clicking create task button...');
    await createButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🎯 Waiting for modal to appear...');
    await page.waitForSelector('.modal, .dialog, [role="dialog"], .task-modal, .create-task-modal', { timeout: 10000 });

    console.log('📷 Taking screenshot of task creation modal...');
    await page.screenshot({ 
      path: '/Users/justindoff/Cursor Projects/Krushr/frontend/task-modal-screenshot.png',
      fullPage: true 
    });

    console.log('✅ Screenshot saved as task-modal-screenshot.png');

  } catch (error) {
    console.error('❌ Error during automation:', error);
    
    // Take a screenshot of the error state
    try {
      await page.screenshot({ 
        path: '/Users/justindoff/Cursor Projects/Krushr/frontend/error-state.png',
        fullPage: true 
      });
      console.log('📷 Error state screenshot saved as error-state.png');
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  } finally {
    await browser.close();
  }
}

// Run the capture function
captureTaskModal().catch(console.error);