'use client'

import React, { Component, ReactNode } from 'react'
import Button from '@/components/ui/Button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin panel error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Something Went Wrong
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {this.props.fallbackMessage || 
                'An error occurred in the admin panel. Your recent changes may have been saved, but the UI encountered an issue.'}
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={this.handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-xs">
                <summary className="cursor-pointer text-gray-600 dark:text-gray-400 mb-2">
                  Technical Details
                </summary>
                <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-64 text-gray-800 dark:text-gray-200">
                  {this.state.errorInfo.componentStack}
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
