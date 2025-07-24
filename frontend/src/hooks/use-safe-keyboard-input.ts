import { useEffect, useRef } from 'react'

/**
 * Hook that ensures keyboard input works properly in text fields
 * by preventing global keyboard handlers from interfering
 */
export function useSafeKeyboardInput<T extends HTMLElement>(enabled: boolean = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const element = ref.current

    // Stop propagation of keyboard events to prevent global handlers
    const stopKeyboardPropagation = (e: KeyboardEvent) => {
      // Allow Cmd/Ctrl+Enter for form submission
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        return
      }

      // Allow Escape to close modals
      if (e.key === 'Escape') {
        return
      }

      // Stop all other keyboard events from bubbling up
      e.stopPropagation()
    }

    // Add event listeners with capture phase to intercept early
    element.addEventListener('keydown', stopKeyboardPropagation, true)
    element.addEventListener('keypress', stopKeyboardPropagation, true)
    element.addEventListener('keyup', stopKeyboardPropagation, true)

    return () => {
      element.removeEventListener('keydown', stopKeyboardPropagation, true)
      element.removeEventListener('keypress', stopKeyboardPropagation, true)
      element.removeEventListener('keyup', stopKeyboardPropagation, true)
    }
  }, [enabled])

  return ref
}