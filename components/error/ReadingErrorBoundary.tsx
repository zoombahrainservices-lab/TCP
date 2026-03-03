'use client';

import React, { Component, ReactNode } from 'react';
import ContentNotAvailable from './ContentNotAvailable';

interface Props {
  children: ReactNode;
  fallbackUrl?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ReadingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Reading Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a hooks error or navigation error
      const isHooksError = this.state.error?.message?.includes('hooks');
      const isNavigationError = this.state.error?.message?.includes('navigation');

      return (
        <ContentNotAvailable
          title="Content Not Available"
          message={
            isHooksError || isNavigationError
              ? "This content is not ready yet. We're working on adding it soon!"
              : this.props.fallbackMessage || "Something went wrong while loading this content. Please try again or go back to the dashboard."
          }
          backUrl={this.props.fallbackUrl || '/dashboard'}
          backLabel="Go to Dashboard"
        />
      );
    }

    return this.props.children;
  }
}
