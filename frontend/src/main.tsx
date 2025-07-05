import { createRoot } from 'react-dom/client'
import './shadcn.css'
import './shadcn.css'
import App from './App'
import { Toaster } from 'sonner'
import { CriticalErrorBoundary } from './components/ErrorBoundary'

/**
 * Enhanced Custom Element Safety Guard
 * Prevents duplicate custom element registration errors from any source
 */
function preventDuplicateCustomElements(): void {
  if (typeof window !== 'undefined' && window.customElements) {
    const originalDefine = window.customElements.define.bind(window.customElements)
    const definedElements = new Set<string>()
    
    // Track already defined elements
    try {
      // Get currently defined elements if possible
      const existingElements = Object.getOwnPropertyNames(window.customElements)
      existingElements.forEach(name => definedElements.add(name))
    } catch (e) {
      // Fallback: check for common problematic elements
      const commonElements = ['mce-autosize-textarea', 'mce-editor', 'tinymce-editor']
      commonElements.forEach(name => {
        if (window.customElements.get(name)) {
          definedElements.add(name)
        }
      })
    }
    
    window.customElements.define = function(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
      // Check both our tracker and the actual registry
      if (definedElements.has(name) || window.customElements.get(name)) {
        console.warn(`⚠️ Custom element '${name}' already defined, skipping duplicate registration`)
        return
      }
      
      try {
        const result = originalDefine(name, constructor, options)
        definedElements.add(name)
        return result
      } catch (error) {
        if (error instanceof Error && (
          error.message.includes('already been defined') ||
          error.message.includes('already defined') ||
          error.name === 'NotSupportedError'
        )) {
          console.warn(`⚠️ Custom element '${name}' registration prevented:`, error.message)
          definedElements.add(name)
          return
        }
        // For development, suppress all custom element errors to prevent console spam
        if (isDevelopment()) {
          console.warn(`⚠️ Custom element '${name}' error suppressed in dev:`, error.message)
          return
        }
        console.error(`❌ Failed to define custom element '${name}':`, error)
        throw error
      }
    }

    // Also prevent errors from external scripts
    const originalAddEventListener = window.addEventListener
    window.addEventListener = function(type, listener, options) {
      if (type === 'error') {
        const wrappedListener = function(event: ErrorEvent) {
          if (event.error && event.error.message && event.error.message.includes('already been defined')) {
            console.warn('⚠️ Prevented custom element duplicate registration error:', event.error.message)
            event.preventDefault()
            return
          }
          if (typeof listener === 'function') {
            return listener.call(this, event)
          }
        }
        return originalAddEventListener.call(this, type, wrappedListener, options)
      }
      return originalAddEventListener.call(this, type, listener, options)
    }

    // Global error handler for uncaught custom element errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('already been defined')) {
        console.warn('⚠️ Global error handler caught custom element duplicate registration:', event.error.message)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }, true)

    // Try to patch webcomponents polyfill if it's being used
    if (window.WebComponents && window.WebComponents.ready) {
      console.warn('⚠️ WebComponents polyfill detected - enhanced error suppression active')
    }
  }
}

// Initialize custom element safeguards immediately
preventDuplicateCustomElements()

// Additional global error suppression for webcomponents
window.addEventListener('error', (event) => {
  const message = event.error?.message || event.message || ''
  if (message.includes('mce-autosize-textarea') || 
      message.includes('already been defined') ||
      message.includes('custom element') ||
      event.filename?.includes('webcomponents') ||
      event.filename?.includes('overlay_bundle')) {
    console.warn('⚠️ Suppressed webcomponents error:', message)
    event.preventDefault()
    event.stopPropagation()
    return false
  }
}, true)

/**
 * Service Worker Registration Strategy
 * - Development: Skip registration to avoid request interception issues
 * - Production: Register for offline functionality and caching
 */

function isDevelopment(): boolean {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.port !== '' ||
    window.location.protocol === 'http:' ||
    process.env.NODE_ENV === 'development'
  )
}

async function initServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('🚫 Service Worker not supported by browser')
    return
  }

  try {
    // First, clean up any existing problematic service workers
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (let registration of registrations) {
      await registration.unregister()
      console.log('🗑️ Unregistered existing service worker:', registration.scope)
    }

    if (isDevelopment()) {
      console.log('🚫 Service Worker registration skipped (development mode)')
      console.log('📍 Environment detected:', {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        nodeEnv: process.env.NODE_ENV
      })
      return
    }

    // Production: Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    })

    console.log('✅ SW registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        console.log('🔄 SW update found, installing...')
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 SW update ready - consider refreshing page')
          }
        })
      }
    })

  } catch (error) {
    console.error('❌ SW registration failed:', error)
  }
}

// Initialize service worker after page load
window.addEventListener('load', initServiceWorker)

const root = createRoot(document.getElementById('app')!)
root.render(
  <CriticalErrorBoundary>
    <App />
    <Toaster position="top-right" richColors />
  </CriticalErrorBoundary>
)
