'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { tokens } from '@/lib/design-tokens';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div className="max-w-md w-full text-center">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
              }}
            >
              <span className="text-4xl">⚠</span>
            </div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              Bir Hata Oluştu
            </h1>
            <p
              className="text-lg mb-6"
              style={{ color: tokens.colors.text.secondary }}
            >
              {this.state.error?.message || 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
              >
                Tekrar Dene
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

