const puppeteer = require('puppeteer');

async function debugChecklist() {
  console.log('🔍 Debugging checklist in task creation form...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--window-size=1400,900']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.log('Browser error:', err.message));
    
    console.log('📍 Navigating to Krushr...');
    await page.goto('http://127.0.0.1:8001/#/workspace', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click on "Add a task" button
    console.log('🔍 Looking for Add a task button...');
    try {
      // Look for the button with text
      const buttons = await page.$$('button');
      let addTaskButton = null;
      
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Add a task') || text.includes('Add a card'))) {
          addTaskButton = button;
          break;
        }
      }
      
      if (addTaskButton) {
        await addTaskButton.click();
        console.log('✅ Clicked Add a task button');
      } else {
        console.log('⚠️ Add task button not found, trying alternative approach...');
        // Try clicking on the kanban column footer
        const columnFooters = await page.$$('.kanban-column-footer, .add-task-button, [class*="add"]');
        if (columnFooters.length > 0) {
          await columnFooters[0].click();
          console.log('✅ Clicked column footer');
        }
      }
    } catch (e) {
      console.log('⚠️ Could not find add task button:', e.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for the checklist section
    console.log('🔍 Looking for checklist input...');
    
    // Try to find the checklist input by placeholder
    const checklistInput = await page.$('input[placeholder="Add item..."]');
    if (checklistInput) {
      console.log('✅ Found checklist input!');
      
      // Click on the input to focus it
      await checklistInput.click();
      
      // Type a checklist item
      console.log('📝 Typing checklist item...');
      await checklistInput.type('Test checklist item 1');
      
      // Press Enter
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the item was added
      const checklistItems = await page.$$('.flex.items-center.gap-1.group');
      console.log(`📋 Found ${checklistItems.length} checklist items`);
      
      // Try adding another item
      await checklistInput.type('Test checklist item 2');
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Take a screenshot
      await page.screenshot({ 
        path: 'checklist-debug.png',
        fullPage: false 
      });
      console.log('📸 Screenshot saved: checklist-debug.png');
      
      // Check the console for any errors
      await page.evaluate(() => {
        console.log('Checklist state:', window);
      });
      
    } else {
      console.log('❌ Could not find checklist input');
      
      // Take a debug screenshot
      await page.screenshot({ 
        path: 'no-checklist-input.png',
        fullPage: false 
      });
      console.log('📸 Debug screenshot saved: no-checklist-input.png');
    }
    
    console.log('\n🔍 Debugging complete. Check screenshots and console output.');
    console.log('Browser left open for manual inspection. Press Ctrl+C to close.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await browser.close();
  }
}

debugChecklist().catch(console.error);