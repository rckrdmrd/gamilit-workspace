/**
 * Pagination — Shared pagination component for tables and lists
 *
 * Supports two variants:
 * - 'full': Page number buttons with ellipsis, prev/next, items info, page-size selector
 * - 'simple': Prev/Next buttons with page indicator
 *
 * Uses detective theme tokens. Accessible with ARIA attributes.
 *
 * Replaces inline pagination across admin, teacher, and student portals.
 *
 * @module shared/components/Pagination
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Total number of items (optional, used for "Showing X of Y" text) */
  totalItems?: number;
  /** Items per page (optional, used for range calculation) */
  pageSize?: number;
  /** Available page size options (enables page-size selector when provided) */
  pageSizeOptions?: number[];
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Whether the parent is in a loading state */
  loading?: boolean;
  /** Visual variant */
  variant?: 'full' | 'simple';
  /** Label for the items being paginated (e.g., "usuarios", "registros") */
  itemLabel?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates an array of page numbers with ellipsis for navigation.
 * Shows at most 7 items: first, last, current, and neighbors with ellipsis.
 */
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading = false,
  variant = 'full',
  itemLabel = 'resultados',
  className,
}: PaginationProps) {
  // Don't render if there's nothing to paginate
  if (totalPages <= 0) {
    return null;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Calculate item range
  const startItem =
    totalItems !== undefined && totalItems > 0 && pageSize
      ? (currentPage - 1) * pageSize + 1
      : undefined;
  const endItem =
    totalItems !== undefined && pageSize
      ? Math.min(currentPage * pageSize, totalItems)
      : undefined;

  const showItemsInfo = startItem !== undefined && endItem !== undefined && totalItems !== undefined;
  const showPageSizeSelector =
    pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange;

  // ------------------------------------------------------------------
  // Simple variant: Prev/Next with page indicator
  // ------------------------------------------------------------------
  if (variant === 'simple') {
    return (
      <nav
        aria-label="Paginacion"
        className={cn(
          'flex items-center justify-between border-t border-gray-700 pt-4',
          className,
        )}
      >
        {showItemsInfo ? (
          <div className="text-sm text-detective-text-secondary">
            Mostrando{' '}
            <span className="font-semibold text-detective-text">{startItem}</span> -{' '}
            <span className="font-semibold text-detective-text">{endItem}</span> de{' '}
            <span className="font-semibold text-detective-text">{totalItems}</span>{' '}
            {itemLabel}
          </div>
        ) : (
          <div className="text-sm text-detective-text-secondary">
            Pagina {currentPage} de {totalPages}
            {totalItems !== undefined && ` (${totalItems} ${itemLabel} totales)`}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage || loading}
            aria-label="Pagina anterior"
            className={cn(
              'flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-sm font-medium text-gray-300 transition-colors',
              'hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
            aria-label="Pagina siguiente"
            className={cn(
              'flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-sm font-medium text-gray-300 transition-colors',
              'hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    );
  }

  // ------------------------------------------------------------------
  // Full variant: Page numbers with ellipsis, prev/next, items info
  // ------------------------------------------------------------------
  return (
    <nav
      aria-label="Paginacion"
      className={cn(
        'flex flex-col gap-4 border-t border-gray-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {/* Left side: Items info + optional page-size selector */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {showItemsInfo && (
          <span className="text-sm text-detective-text-secondary">
            Mostrando{' '}
            <span className="font-semibold text-detective-text">{startItem}</span> -{' '}
            <span className="font-semibold text-detective-text">{endItem}</span> de{' '}
            <span className="font-semibold text-detective-text">{totalItems}</span>{' '}
            {itemLabel}
          </span>
        )}

        {!showItemsInfo && totalItems !== undefined && (
          <span className="text-sm text-detective-text-secondary">
            Pagina {currentPage} de {totalPages} ({totalItems} {itemLabel} totales)
          </span>
        )}

        {!showItemsInfo && totalItems === undefined && (
          <span className="text-sm text-detective-text-secondary">
            Pagina {currentPage} de {totalPages}
          </span>
        )}

        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="pagination-page-size"
              className="text-sm text-detective-text-secondary"
            >
              Por pagina:
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange!(Number(e.target.value))}
              disabled={loading}
              className="rounded-lg border border-gray-600 bg-detective-bg px-2 py-1.5 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
            >
              {(pageSizeOptions || DEFAULT_PAGE_SIZE_OPTIONS).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation controls */}
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || loading}
          aria-label="Pagina anterior"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            'bg-detective-bg-secondary text-gray-300',
            'hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-detective-text-secondary"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                aria-label={`Pagina ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                className={cn(
                  'flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  currentPage === pageNum
                    ? 'bg-detective-orange text-white shadow-md'
                    : 'bg-detective-bg-secondary text-gray-300 hover:bg-detective-bg',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Pagina siguiente"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            'bg-detective-bg-secondary text-gray-300',
            'hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
