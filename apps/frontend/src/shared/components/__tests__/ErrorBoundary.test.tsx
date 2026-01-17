/**
 * ErrorBoundary Component Unit Tests
 *
 * Tests for the Error Boundary component covering:
 * - Normal rendering (no errors)
 * - Error catching and fallback UI
 * - Reset functionality
 * - Custom fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

// Component that throws a specific error
const CustomErrorComponent = ({ error }: { error: Error }) => {
  throw error;
};

describe('ErrorBoundary', () => {
  // Suppress console.error during error boundary tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Safe content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <p>First child</p>
          <p>Second child</p>
        </ErrorBoundary>
      );
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <span>Nested</span>;
      render(
        <ErrorBoundary>
          <div>
            <NestedComponent />
          </div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Nested')).toBeInTheDocument();
    });
  });

  describe('error catching', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
      // The component uses Spanish text
      expect(screen.getByText('Oops! Algo salió mal')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should catch different types of errors', () => {
      const typeError = new TypeError('Type error occurred');
      render(
        <ErrorBoundary>
          <CustomErrorComponent error={typeError} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Type error occurred')).toBeInTheDocument();
    });

    it('should display default message when error has no message', () => {
      const emptyError = new Error();
      emptyError.message = '';
      render(
        <ErrorBoundary>
          <CustomErrorComponent error={emptyError} />
        </ErrorBoundary>
      );
      // Falls back to default Spanish message
      expect(screen.getByText('Ha ocurrido un error inesperado.')).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should display reset button with Spanish text', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument();
    });

    it('should attempt to re-render children after reset', () => {
      let shouldThrow = true;
      const ToggleComponent = () => {
        if (shouldThrow) {
          throw new Error('Initial error');
        }
        return <div>Recovered content</div>;
      };

      render(
        <ErrorBoundary>
          <ToggleComponent />
        </ErrorBoundary>
      );

      // Should show error
      expect(screen.getByText('Oops! Algo salió mal')).toBeInTheDocument();

      // Fix the component
      shouldThrow = false;

      // Click reset
      fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

      // Should now show recovered content
      expect(screen.getByText('Recovered content')).toBeInTheDocument();
    });

    it('should show error again if error persists after reset', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Click reset
      fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

      // Should still show error since component still throws
      expect(screen.getByText('Oops! Algo salió mal')).toBeInTheDocument();
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error page</div>}>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Custom error page')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Algo salió mal')).not.toBeInTheDocument();
    });

    it('should render custom fallback as complex component', () => {
      const CustomFallback = () => (
        <div>
          <h1>Custom Error</h1>
          <p>Something went wrong</p>
          <button>Reload</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByRole('heading', { name: 'Custom Error' })).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    });
  });

  describe('default fallback styling', () => {
    it('should have centered layout', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const container = screen.getByText('Oops! Algo salió mal').closest('.flex');
      expect(container?.className).toContain('min-h-screen');
      expect(container?.className).toContain('items-center');
      expect(container?.className).toContain('justify-center');
    });

    it('should have card styling', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const card = screen.getByText('Oops! Algo salió mal').closest('.rounded-lg');
      expect(card?.className).toContain('bg-white');
      expect(card?.className).toContain('shadow-lg');
    });

    it('should have error heading styling', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const heading = screen.getByText('Oops! Algo salió mal');
      expect(heading.className).toContain('text-red-600');
      expect(heading.className).toContain('font-bold');
    });

    it('should have styled reset button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const button = screen.getByRole('button', { name: 'Intentar de nuevo' });
      expect(button.className).toContain('bg-blue-600');
      expect(button.className).toContain('text-white');
      expect(button.className).toContain('w-full');
    });
  });

  describe('componentDidCatch', () => {
    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Console.error is called by React and by our component
      expect(console.error).toHaveBeenCalled();
      // Check that at least one call contains our error message
      const calls = (console.error as any).mock.calls;
      const hasOurLog = calls.some((call: any[]) =>
        call.some((arg: any) =>
          typeof arg === 'string' && arg.includes('ErrorBoundary caught error')
        )
      );
      expect(hasOurLog).toBe(true);
    });
  });

  describe('isolation', () => {
    it('should not affect sibling components', () => {
      render(
        <div>
          <ErrorBoundary>
            <ThrowingComponent />
          </ErrorBoundary>
          <div>Sibling content</div>
        </div>
      );

      expect(screen.getByText('Sibling content')).toBeInTheDocument();
    });

    it('should catch errors only in subtree', () => {
      const ParentComponent = () => (
        <div>
          <span>Parent content</span>
          <ErrorBoundary>
            <ThrowingComponent />
          </ErrorBoundary>
        </div>
      );

      render(<ParentComponent />);

      expect(screen.getByText('Parent content')).toBeInTheDocument();
      expect(screen.getByText('Oops! Algo salió mal')).toBeInTheDocument();
    });
  });

  describe('recovery scenarios', () => {
    it('should handle component remount after error via key change', () => {
      const { rerender } = render(
        <ErrorBoundary key="error-state">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Algo salió mal')).toBeInTheDocument();

      // Remount with new key to reset error boundary
      rerender(
        <ErrorBoundary key="clean-state">
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });
});
