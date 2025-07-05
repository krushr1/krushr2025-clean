import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: 'page' | 'component' | 'critical'
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service (Sentry, LogRocket, etc.)
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/#/workspace'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'component' } = this.props

      // Different UI based on error level
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-krushr-gray-50 p-6">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 bg-krushr-danger-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-krushr-danger" />
              </div>
              <h1 className="text-2xl font-brand font-bold text-krushr-gray-900 mb-4">
                Critical Error
              </h1>
              <p className="text-base font-brand text-krushr-gray-600 mb-6">
                The application encountered a critical error and needs to be restarted. Your work may not be saved.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-krushr-danger text-white px-6 py-3 rounded-button font-medium hover:bg-krushr-danger-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Restart Application
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full border border-krushr-gray-300 text-krushr-gray-700 px-6 py-3 rounded-button font-medium hover:bg-krushr-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )
      }

      if (level === 'page') {
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-krushr-warning-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-krushr-warning" />
              </div>
              <h2 className="text-xl font-brand font-semibold text-krushr-gray-800 mb-3">
                Page Error
              </h2>
              <p className="text-sm font-brand text-krushr-gray-600 mb-4">
                This page encountered an error, but the rest of the application is still working.
              </p>
              <div className="space-y-2">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-krushr-primary text-white px-4 py-2 rounded-button font-medium hover:bg-krushr-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full border border-krushr-gray-300 text-krushr-gray-700 px-4 py-2 rounded-button font-medium hover:bg-krushr-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )
      }

      // Component level (default)
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4 bg-krushr-gray-50 rounded-lg border border-krushr-gray-200">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 bg-krushr-info-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-krushr-info" />
            </div>
            <h3 className="text-base font-brand font-medium text-krushr-gray-800 mb-2">
              Component Error
            </h3>
            <p className="text-sm font-brand text-krushr-gray-600 mb-3">
              This component failed to load, but other features are still available.
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-krushr-primary text-white px-3 py-1.5 rounded-button text-sm font-medium hover:bg-krushr-primary-700 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3 text-left">
                <summary className="text-xs text-krushr-gray-500 cursor-pointer hover:text-krushr-gray-700">
                  Error Details
                </summary>
                <pre className="text-xs text-krushr-gray-600 mt-2 p-2 bg-white rounded border overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Convenience components for different levels
export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
)

export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
)

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">{children}</ErrorBoundary>
)