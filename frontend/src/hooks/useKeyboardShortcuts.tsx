import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { TaskFilter } from '../components/dashboard/TaskFilters'

interface ShortcutCallbacks {
  onCreateTask: () => void
  onChangeFilter: (filter: TaskFilter) => void
  onToggleFocusMode: () => void
  onShowHelp: () => void
  onRefresh: () => void
  onCloseModal?: () => void
}

export function useKeyboardShortcuts({
  onCreateTask,
  onChangeFilter,
  onToggleFocusMode,
  onShowHelp,
  onRefresh,
  onCloseModal
}: ShortcutCallbacks) {
  const [isTextFieldFocused, setIsTextFieldFocused] = useState(false)
  const navigate = useNavigate()

  // Track if a text input is focused
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      const isTextField = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.getAttribute('contenteditable') === 'true' ||
        target.closest('[contenteditable="true"]')
      
      setIsTextFieldFocused(!!isTextField)
    }

    const handleFocusOut = () => {
      // Small delay to handle focus transitions
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement
        const isTextField = 
          activeElement?.tagName === 'INPUT' || 
          activeElement?.tagName === 'TEXTAREA' || 
          activeElement?.getAttribute('contenteditable') === 'true' ||
          activeElement?.closest('[contenteditable="true"]')
        
        setIsTextFieldFocused(!!isTextField)
      }, 50)
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in text fields
    if (isTextFieldFocused) {
      // Still allow Escape to work in text fields
      if (e.key === 'Escape' && onCloseModal) {
        onCloseModal()
      }
      return
    }

    // Prevent default for handled shortcuts
    const preventDefault = () => {
      e.preventDefault()
      e.stopPropagation()
    }

    // Create task: C or Cmd+K
    if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
      preventDefault()
      onCreateTask()
      return
    }
    
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      preventDefault()
      onCreateTask()
      return
    }

    // Filter shortcuts: 1-5
    const filterMap: Record<string, TaskFilter> = {
      '1': 'all',
      '2': 'my-tasks',
      '3': 'urgent',
      '4': 'due-today',
      '5': 'unassigned'
    }

    if (filterMap[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
      preventDefault()
      onChangeFilter(filterMap[e.key])
      return
    }

    // Toggle focus mode: F
    if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
      preventDefault()
      onToggleFocusMode()
      return
    }

    // Show help: ? or Cmd+/
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      preventDefault()
      onShowHelp()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      preventDefault()
      onShowHelp()
      return
    }

    // Refresh: R
    if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
      preventDefault()
      onRefresh()
      return
    }

    // Close modal: Escape
    if (e.key === 'Escape' && onCloseModal) {
      preventDefault()
      onCloseModal()
      return
    }

    // Navigation shortcuts (optional, for power users)
    // These work even without callbacks
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
      // Wait for second key
      const handleSecondKey = (e2: KeyboardEvent) => {
        e2.preventDefault()
        switch (e2.key) {
          case 'h': navigate('/'); break
          case 'b': navigate('/board'); break
          case 'c': navigate('/calendar'); break
          case 'm': navigate('/chat'); break
          case 'n': navigate('/notes'); break
        }
        document.removeEventListener('keydown', handleSecondKey)
      }
      
      document.addEventListener('keydown', handleSecondKey)
      // Remove listener after 2 seconds if no second key
      setTimeout(() => {
        document.removeEventListener('keydown', handleSecondKey)
      }, 2000)
    }
  }, [isTextFieldFocused, onCreateTask, onChangeFilter, onToggleFocusMode, onShowHelp, onRefresh, onCloseModal, navigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return { isTextFieldFocused }
}

// Keyboard shortcut definitions for the help modal
export const KEYBOARD_SHORTCUTS = {
  navigation: [
    { keys: ['G', 'H'], description: 'Go to Home' },
    { keys: ['G', 'B'], description: 'Go to Board' },
    { keys: ['G', 'C'], description: 'Go to Calendar' },
    { keys: ['G', 'M'], description: 'Go to Chat' },
    { keys: ['G', 'N'], description: 'Go to Notes' },
  ],
  actions: [
    { keys: ['C'], description: 'Create new task', modifiers: [] },
    { keys: ['⌘', 'K'], description: 'Create new task', modifiers: ['Ctrl', 'K'] },
    { keys: ['R'], description: 'Refresh data' },
    { keys: ['F'], description: 'Toggle focus mode (hide completed)' },
    { keys: ['Esc'], description: 'Close modals/dialogs' },
  ],
  filters: [
    { keys: ['1'], description: 'All tasks' },
    { keys: ['2'], description: 'My tasks' },
    { keys: ['3'], description: 'Urgent tasks' },
    { keys: ['4'], description: 'Due today' },
    { keys: ['5'], description: 'Unassigned tasks' },
  ],
  help: [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', modifiers: ['Ctrl', '/'] },
  ]
}