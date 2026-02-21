/**
 * StudentPagination Component
 *
 * Thin wrapper around the shared Pagination component, preserving the
 * original props interface for backward compatibility.
 *
 * CORR-2025-12-18: Implementacion de paginacion server-side
 * REFACTOR-2026-02-20: Delegates to shared Pagination component
 *
 * @component
 */

import { Pagination } from '@shared/components/Pagination';

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
// COMPONENT
// ============================================================================

export function StudentPagination({
  page,
  limit,
  total,
  totalPages,
  loading = false,
  onPageChange,
  onLimitChange,
}: StudentPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={total}
      pageSize={limit}
      pageSizeOptions={LIMIT_OPTIONS}
      onPageSizeChange={onLimitChange}
      loading={loading}
      variant="full"
      itemLabel="estudiantes"
      className="bg-detective-bg-secondary"
    />
  );
}
