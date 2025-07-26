/**
 * Utility functions for keyboard event handling
 */

/**
 * Check if the user is currently typing in an input field
 * This prevents hotkeys from firing when the user is entering text
 */
export function isUserTyping(): boolean {
  const activeElement = document.activeElement
  
  if (!activeElement) return false
  
  const tagName = activeElement.tagName.toLowerCase()
  
  // Check if it's a form input element
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true
  }
  
  // Check if it's a contenteditable element
  if (activeElement.getAttribute('contenteditable') === 'true') {
    return true
  }
  
  // Check if it's inside a contenteditable element
  let parent = activeElement.parentElement
  while (parent) {
    if (parent.getAttribute('contenteditable') === 'true') {
      return true
    }
    parent = parent.parentElement
  }
  
  // Check for specific classes that indicate text input
  if (activeElement.classList.contains('ProseMirror') || 
      activeElement.classList.contains('tiptap') ||
      activeElement.classList.contains('ql-editor')) {
    return true
  }
  
  // Check if the active element has role="textbox"
  if (activeElement.getAttribute('role') === 'textbox') {
    return true
  }
  
  // Check if we're inside a modal or dialog that might have input fields
  const closestDialog = activeElement.closest('[role="dialog"], [role="alertdialog"], .sheet-content')
  if (closestDialog) {
    // If we're in a dialog/modal and the element can receive text input, block hotkeys
    if (activeElement.getAttribute('contenteditable') || 
        tagName === 'input' || 
        tagName === 'textarea') {
      return true
    }
  }
  
  return false
}

/**
 * Check if a keyboard event should trigger a hotkey
 * @param event The keyboard event
 * @returns true if the hotkey should be processed, false if it should be ignored
 */
export function shouldProcessHotkey(event: KeyboardEvent): boolean {
  // Don't process hotkeys if user is typing
  if (isUserTyping()) {
    return false
  }
  
  // Allow hotkeys in certain cases even in input fields
  // For example, Cmd+Enter to submit forms
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    return true
  }
  
  return true
}