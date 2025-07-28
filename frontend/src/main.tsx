import { createRoot } from 'react-dom/client'
import './shadcn.css'
import './styles/landing.css'
import App from './App'
import { Toaster } from 'sonner'
import { CriticalErrorBoundary } from './components/ErrorBoundary'

function preventDuplicateCustomElements(): void {
  if (typeof window !== 'undefined' && window.customElements) {
    const originalDefine = window.customElements.define.bind(window.customElements)
    const definedElements = new Set<string>()
    
    try {
      const existingElements = Object.getOwnPropertyNames(window.customElements)
      existingElements.forEach(name => definedElements.add(name))
    } catch (e) {
      const commonElements = ['mce-autosize-textarea', 'mce-editor', 'tinymce-editor']
      commonElements.forEach(name => {
        if (window.customElements.get(name)) {
          definedElements.add(name)
        }
      })
    }
    
    window.customElements.define = function(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
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
        if (isDevelopment()) {
          console.warn(`⚠️ Custom element '${name}' error suppressed in dev:`, error.message)
          return
        }
        console.error(`❌ Failed to define custom element '${name}':`, error)
        throw error
      }
    }

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

    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('already been defined')) {
        console.warn('⚠️ Global error handler caught custom element duplicate registration:', event.error.message)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }, true)

    if (window.WebComponents && window.WebComponents.ready) {
      console.warn('⚠️ WebComponents polyfill detected - enhanced error suppression active')
    }
  }
}

preventDuplicateCustomElements()

// Suppress React DevTools suggestion in development
if (isDevelopment()) {
  const originalLog = console.log
  const originalInfo = console.info
  const originalWarn = console.warn
  
  const filterDevTools = (method: Function) => {
    return function(...args: any[]) {
      // Filter out React DevTools suggestion
      if (args.length > 0 && typeof args[0] === 'string' && 
          args[0].includes('Download the React DevTools')) {
        return
      }
      return method.apply(console, args)
    }
  }
  
  console.log = filterDevTools(originalLog)
  console.info = filterDevTools(originalInfo)
  console.warn = filterDevTools(originalWarn)
}

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

// Service Worker completely disabled for Vercel deployment
// This prevents any 404 errors from trying to load sw.js

async function cleanupServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    // Only clean up existing service workers, don't register new ones
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (let registration of registrations) {
      await registration.unregister()
      console.log('🗑️ Unregistered existing service worker:', registration.scope)
    }
    console.log('🚫 Service Worker cleanup completed for Vercel deployment')
  } catch (error) {
    // Silently handle any cleanup errors
  }
}

window.addEventListener('load', cleanupServiceWorkers)

const root = createRoot(document.getElementById('app')!)
root.render(
  <CriticalErrorBoundary>
    <App />
    <Toaster position="top-right" richColors />
  </CriticalErrorBoundary>
)
