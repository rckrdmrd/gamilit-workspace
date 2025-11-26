/**
 * MessageFilters Component
 *
 * Barra de filtros para buscar y filtrar mensajes.
 * Permite filtrar por tipo, estado de lectura y búsqueda de texto.
 *
 * @module apps/teacher/components/communication/MessageFilters
 */

import React from 'react';
import { Filter } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../../shared/components/base/DetectiveButton';
import { MessageType } from '../../../../services/api/teacher/teacherMessagesApi';

// ============================================================================
// TYPES
// ============================================================================

interface MessageFiltersProps {
  filters: {
    type?: MessageType;
    unread?: boolean;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Barra de filtros para mensajes
 *
 * @example
 * ```tsx
 * <MessageFilters
 *   filters={filters}
 *   onFiltersChange={(newFilters) => updateFilters(newFilters)}
 *   onRefresh={() => refresh()}
 * />
 * ```
 */
export const MessageFilters: React.FC<MessageFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  return (
    <DetectiveCard>
      <div className="flex items-center gap-4 p-4">
        <Filter className="h-5 w-5 text-detective-orange" />

        {/* Filtro por tipo */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value || undefined })}
          className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
        >
          <option value="">Todos los tipos</option>
          <option value={MessageType.DIRECT}>Mensajes directos</option>
          <option value={MessageType.CLASSROOM_ANNOUNCEMENT}>Anuncios</option>
          <option value={MessageType.PRIVATE_FEEDBACK}>Feedback privado</option>
          <option value={MessageType.CLASSROOM_CHAT}>Chat de clase</option>
          <option value={MessageType.ASSIGNMENT_COMMENT}>Comentarios de tarea</option>
        </select>

        {/* Filtro por estado de lectura */}
        <select
          value={filters.unread === undefined ? '' : filters.unread.toString()}
          onChange={(e) => {
            const value = e.target.value === '' ? undefined : e.target.value === 'true';
            onFiltersChange({ ...filters, unread: value });
          }}
          className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
        >
          <option value="">Todos los mensajes</option>
          <option value="true">No leídos</option>
          <option value="false">Leídos</option>
        </select>

        {/* Campo de búsqueda */}
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
        />

        {/* Botón Actualizar */}
        <DetectiveButton onClick={onRefresh} size="sm">
          Actualizar
        </DetectiveButton>
      </div>
    </DetectiveCard>
  );
};
