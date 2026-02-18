import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@shared/components/common';
import { adminAPI } from '@/services/api/adminAPI';
import type { ApprovalHistory } from '@/services/api/adminTypes';

export function ContentVersionsTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'content', 'approval-history'],
    queryFn: async () => {
      const response = await adminAPI.content.getApprovalHistory();
      return response.items;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const approvalHistory = data ?? [];
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  const versionsColumns: Column<ApprovalHistory>[] = [
    {
      key: 'contentType',
      label: 'Tipo',
      sortable: true,
    },
    {
      key: 'action',
      label: 'Accion',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.action === 'approved'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {row.action === 'approved' ? 'Aprobado' : 'Rechazado'}
        </span>
      ),
    },
    {
      key: 'approvedByName',
      label: 'Revisor',
      sortable: true,
    },
    {
      key: 'approvedAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.approvedAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'reason',
      label: 'Razon',
      render: (row) => row.reason || '-',
    },
  ];

  return (
    <div>
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
          <p className="font-semibold">Error:</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {isLoading && !approvalHistory.length ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <p className="mt-4 text-detective-text-secondary">
            Cargando historial de aprobaciones...
          </p>
        </div>
      ) : (
        <DataTable
          data={approvalHistory}
          columns={versionsColumns}
          searchPlaceholder="Buscar en historial..."
        />
      )}
    </div>
  );
}
