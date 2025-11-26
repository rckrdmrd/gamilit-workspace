import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * GamificationErrorBoundary
 *
 * Error boundary specifically for gamification features.
 * Provides graceful degradation when gamification data fails to load.
 *
 * @example
 * ```tsx
 * <GamificationErrorBoundary>
 *   <GamifiedHeader user={user} gamificationData={data} />
 * </GamificationErrorBoundary>
 * ```
 */
export class GamificationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Gamification error:', error, errorInfo);

    // Send to error tracking service (e.g., Sentry)
    // trackError(error, { context: 'gamification', ...errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="m-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="mb-2 text-lg font-semibold text-yellow-900">
                Gamification Temporarily Unavailable
              </h3>
              <p className="mb-4 text-yellow-800">
                We're having trouble loading your gamification data. Don't worry, your progress is
                safe and will be restored automatically!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="rounded bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
