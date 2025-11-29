// Error boundary HOC for React components

"use client";

import React, { Component, type ComponentType, type ReactNode } from "react";
import { logError } from "~/lib/errors";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary component class
 */
class ErrorBoundaryComponent extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    logError("ErrorBoundary", { error, errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-red-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-red-700">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component to wrap components with error boundary
 * @param Component - Component to wrap
 * @param fallback - Optional custom error fallback
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: (error: Error) => ReactNode,
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundaryComponent fallback={fallback}>
        <Component {...props} />
      </ErrorBoundaryComponent>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
}

/**
 * Error Boundary component for direct use
 */
export const ErrorBoundary = ErrorBoundaryComponent;
