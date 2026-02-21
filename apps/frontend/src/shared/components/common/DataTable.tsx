import React, { useCallback, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { Pagination } from '@shared/components/Pagination';

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/** Action button definition for the row actions column */
export interface RowAction<T> {
  /** Unique key for the action — 'view', 'edit', 'delete' get default icons */
  key: string;
  /** Accessible label (used as tooltip and aria-label) */
  label: string;
  /** Custom icon to render (overrides the default for the key) */
  icon?: React.ReactNode;
  /** Callback when the action is triggered */
  onClick: (row: T) => void;
  /** Conditionally hide the action for a given row */
  hidden?: (row: T) => boolean;
  /** Conditionally disable the action for a given row */
  disabled?: (row: T) => boolean;
  /** Visual variant — 'danger' renders red tones */
  variant?: 'default' | 'danger';
}

/** Pagination configuration for the DataTable */
export interface DataTablePagination {
  /** Current page (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  total: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Page-size options to show in the selector */
  pageSizeOptions?: number[];
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Label for the items being paginated (e.g. "usuarios") */
  itemLabel?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  searchPlaceholder?: string;
  searchable?: boolean;
  itemsPerPage?: number;
  variant?: 'default' | 'detective';
  rowKey?: (row: T) => string;
  rowClassName?: (row: T) => string;

  // --- New features ---

  /** Built-in pagination controls rendered below the table */
  pagination?: DataTablePagination;
  /** Row action buttons rendered in an extra column on the right */
  rowActions?: RowAction<T>[];
  /** Enable checkbox selection column on the left */
  selectable?: boolean;
  /** Callback with array of selected row IDs (rows must have an `id` field or use rowIdKey) */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Key used to extract unique ID from each row for selection (defaults to 'id') */
  rowIdKey?: string;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

/** Style tokens per variant to keep JSX clean */
const VARIANT_STYLES = {
  default: {
    wrapper: '',
    table: 'min-w-full divide-y divide-gray-200',
    thead: 'bg-gray-50',
    theadRowBorder: '',
    th: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
    thSortHover: 'hover:bg-gray-100',
    tbody: 'divide-y divide-gray-200 bg-white',
    trBorder: '',
    trStriped: 'bg-gray-50',
    trDefault: 'bg-white',
    trHover: 'hover:bg-gray-100',
    trSelected: 'bg-blue-50',
    td: 'whitespace-nowrap px-6 py-4 text-sm text-gray-900',
    checkbox: 'accent-blue-600',
    actionBtn: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    actionBtnDanger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    loadingSpinner: 'h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent',
    emptyText: 'text-gray-500',
    paginationBg: 'bg-gray-50',
  },
  detective: {
    wrapper: 'rounded-detective-lg border border-detective-border',
    table: 'w-full',
    thead: '',
    theadRowBorder: 'border-b border-gray-700',
    th: 'px-4 py-3 text-left text-sm font-semibold text-gray-400',
    thSortHover: 'hover:bg-detective-bg-tertiary',
    tbody: '',
    trBorder: 'border-b border-gray-800',
    trStriped: '',
    trDefault: '',
    trHover: 'hover:bg-detective-bg-secondary',
    trSelected: 'bg-detective-orange/10',
    td: 'px-4 py-3 text-sm text-gray-300',
    checkbox: 'accent-detective-orange',
    actionBtn: 'text-detective-text-secondary hover:text-detective-orange hover:bg-detective-bg-secondary',
    actionBtnDanger: 'text-detective-danger hover:text-red-700 hover:bg-red-50/10',
    loadingSpinner: 'h-8 w-8 animate-spin rounded-full border-4 border-detective-orange border-t-transparent',
    emptyText: 'text-gray-400',
    paginationBg: 'bg-detective-bg-secondary',
  },
} as const;

// ============================================================================
// DEFAULT ACTION ICONS
// ============================================================================

const DEFAULT_ACTION_ICONS: Record<string, React.ReactNode> = {
  view: <Eye size={16} />,
  edit: <Pencil size={16} />,
  delete: <Trash2 size={16} />,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  sortColumn,
  sortDirection,
  onSort,
  className = '',
  striped = true,
  hoverable = true,
  variant = 'default',
  rowKey,
  rowClassName,
  pagination,
  rowActions,
  selectable = false,
  onSelectionChange,
  rowIdKey = 'id',
}: DataTableProps<T>): React.ReactElement {
  const styles = VARIANT_STYLES[variant];

  // -----------------------------------------------------------------------
  // Selection state
  // -----------------------------------------------------------------------
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /** Extract a unique ID string from each row for selection tracking */
  const rowIds = useMemo(() => {
    if (!selectable) return [];
    return data.map((row) => String((row as Record<string, unknown>)[rowIdKey] ?? ''));
  }, [data, selectable, rowIdKey]);

  const allSelected = selectable && rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = selectable && rowIds.some((id) => selectedIds.has(id)) && !allSelected;

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        rowIds.forEach((id) => next.delete(id));
      } else {
        rowIds.forEach((id) => next.add(id));
      }
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [allSelected, rowIds, onSelectionChange]);

  const handleToggleRow = useCallback(
    (rowId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) {
          next.delete(rowId);
        } else {
          next.add(rowId);
        }
        onSelectionChange?.(Array.from(next));
        return next;
      });
    },
    [onSelectionChange],
  );

  // -----------------------------------------------------------------------
  // Sort handler
  // -----------------------------------------------------------------------
  const handleSort = (columnKey: string): void => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  const renderCell = (row: T, column: Column<T>): React.ReactNode => {
    if (column.render) {
      return column.render(row);
    }
    return String(row[column.key as keyof T] ?? '');
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Pagination metadata
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 0;

  const hasActions = rowActions && rowActions.length > 0;

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Cargando datos">
        <div className={styles.loadingSpinner} aria-hidden="true"></div>
        <span className="sr-only">Cargando datos...</span>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', styles.emptyText)}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', styles.wrapper, className)}>
      <table className={styles.table} aria-label="Tabla de datos">
        {/* ===== THEAD ===== */}
        <thead className={styles.thead}>
          <tr className={styles.theadRowBorder}>
            {/* Checkbox header */}
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleToggleAll}
                  aria-label="Seleccionar todos"
                  className={cn('h-4 w-4 cursor-pointer rounded', styles.checkbox)}
                />
              </th>
            )}

            {/* Data columns */}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  styles.th,
                  alignmentClasses[column.align || 'left'],
                  column.sortable && `cursor-pointer select-none ${styles.thSortHover}`,
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={
                  column.sortable && sortColumn === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : column.sortable
                      ? 'none'
                      : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    <span className="inline-flex" aria-hidden="true">
                      {sortDirection === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}

            {/* Actions header */}
            {hasActions && (
              <th
                className={cn(
                  styles.th,
                  'text-center',
                )}
              >
                Acciones
              </th>
            )}
          </tr>
        </thead>

        {/* ===== TBODY ===== */}
        <tbody className={styles.tbody}>
          {data.map((row, rowIndex) => {
            const key = rowKey ? rowKey(row) : rowIndex;
            const extraRowClass = rowClassName ? rowClassName(row) : '';
            const rowId = selectable
              ? String((row as Record<string, unknown>)[rowIdKey] ?? rowIndex)
              : '';
            const isSelected = selectable && selectedIds.has(rowId);

            return (
              <tr
                key={key}
                className={cn(
                  styles.trBorder,
                  striped && rowIndex % 2 === 0 ? styles.trStriped : styles.trDefault,
                  hoverable && styles.trHover,
                  onRowClick && 'cursor-pointer',
                  isSelected && styles.trSelected,
                  extraRowClass,
                  'transition-colors',
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {/* Checkbox cell */}
                {selectable && (
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleRow(rowId);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Seleccionar fila ${rowIndex + 1}`}
                      className={cn('h-4 w-4 cursor-pointer rounded', styles.checkbox)}
                    />
                  </td>
                )}

                {/* Data cells */}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      styles.td,
                      alignmentClasses[column.align || 'left'],
                    )}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}

                {/* Actions cell */}
                {hasActions && (
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {rowActions!.map((action) => {
                        if (action.hidden?.(row)) return null;
                        const isDisabled = action.disabled?.(row) ?? false;
                        const icon =
                          action.icon ?? DEFAULT_ACTION_ICONS[action.key] ?? null;
                        return (
                          <button
                            key={action.key}
                            type="button"
                            title={action.label}
                            aria-label={action.label}
                            disabled={isDisabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) action.onClick(row);
                            }}
                            className={cn(
                              'inline-flex items-center justify-center rounded-lg p-2 transition-colors',
                              action.variant === 'danger'
                                ? styles.actionBtnDanger
                                : styles.actionBtn,
                              isDisabled && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      {pagination && totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageSizeChange={pagination.onPageSizeChange}
          loading={loading}
          variant="full"
          itemLabel={pagination.itemLabel ?? 'resultados'}
          className={cn('mt-0 border-t-0', styles.paginationBg)}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
