/**
 * AuditLogStats - Summary stat cards for audit logs.
 *
 * Displays total records, success count, and failed count
 * for the current page of audit log results.
 *
 * @see US-AE-011 - Visor de Audit Logs
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface AuditLogStatsProps {
  total: number;
  successCount: number;
  failedCount: number;
}

export const AuditLogStats = ({
  total,
  successCount,
  failedCount,
}: AuditLogStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <DetectiveCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-detective-text">{total}</div>
            <div className="text-sm text-detective-text-secondary">Total de registros</div>
          </div>
        </div>
      </DetectiveCard>

      <DetectiveCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-500/20 p-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-detective-text">{successCount}</div>
            <div className="text-sm text-detective-text-secondary">
              Exitosos (pagina actual)
            </div>
          </div>
        </div>
      </DetectiveCard>

      <DetectiveCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-500/20 p-2">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-detective-text">{failedCount}</div>
            <div className="text-sm text-detective-text-secondary">
              Fallidos (pagina actual)
            </div>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
};
