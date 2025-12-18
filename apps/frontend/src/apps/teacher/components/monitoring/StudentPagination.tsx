/**
 * StudentPagination Component
 *
 * Componente de paginacion para el panel de monitoreo de estudiantes.
 * Incluye selector de limite por pagina y controles de navegacion.
 *
 * CORR-2025-12-18: Implementacion de paginacion server-side
 *
 * @component
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

// ============================================================================
// TYPES
// ============================================================================

interface StudentPaginationProps {
  /** Pagina actual (1-indexed) */
  page: number;
  /** Limite de registros por pagina */
  limit: number;
  /** Total de registros */
  total: number;
  /** Total de paginas */
  totalPages: number;
  /** Si hay pagina siguiente */
  hasNextPage: boolean;
  /** Si hay pagina anterior */
  hasPreviousPage: boolean;
  /** Estado de carga */
  loading?: boolean;
  /** Callback al cambiar de pagina */
  onPageChange: (page: number) => void;
  /** Callback al cambiar limite por pagina */
  onLimitChange: (limit: number) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LIMIT_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Genera array de numeros de pagina con ellipsis para navegacion
 * @param current - Pagina actual
 * @param total - Total de paginas
 * @returns Array de numeros o '...' para ellipsis
 */
function generatePageNumbers(current: number, total: number): (number | string)[] {
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

export function StudentPagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  loading = false,
  onPageChange,
  onLimitChange,
}: StudentPaginationProps) {
  // Calcular rango de items mostrados
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // No mostrar paginacion si no hay datos
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-gray-700 bg-detective-bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Info y Selector de Limite */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm text-detective-text-secondary">
          Mostrando{' '}
          <span className="font-semibold text-detective-text">{startItem}</span> -{' '}
          <span className="font-semibold text-detective-text">{endItem}</span> de{' '}
          <span className="font-semibold text-detective-text">{total}</span> estudiantes
        </span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-detective-text-secondary">Por pagina:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={loading}
            className="rounded-lg border border-gray-600 bg-detective-bg px-2 py-1.5 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de Navegacion */}
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        {/* Boton Anterior */}
        <DetectiveButton
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || loading}
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </DetectiveButton>

        {/* Numeros de pagina */}
        <div className="flex items-center gap-1">
          {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-detective-text-secondary"
              >
                ...
              </span>
            ) : (
              <DetectiveButton
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={loading}
                className="min-w-[32px]"
              >
                {pageNum}
              </DetectiveButton>
            )
          )}
        </div>

        {/* Boton Siguiente */}
        <DetectiveButton
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Pagina siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </DetectiveButton>
      </div>
    </div>
  );
}
