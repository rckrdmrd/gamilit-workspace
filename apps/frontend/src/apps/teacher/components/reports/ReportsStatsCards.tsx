import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import {
  FileText,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatDate } from './RecentReportsTable';
import type { ReportFormat } from '../../types';

export interface ReportsStatsCardsProps {
  totalReportsGenerated: number;
  lastGeneratedDate: string;
  mostUsedFormat: ReportFormat;
  averageStudentsPerReport: number;
}

export function ReportsStatsCards({
  totalReportsGenerated,
  lastGeneratedDate,
  mostUsedFormat,
  averageStudentsPerReport,
}: ReportsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <DetectiveCard>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-detective-orange/10 p-3">
            <FileText className="h-6 w-6 text-detective-orange" />
          </div>
          <div>
            <p className="text-sm text-detective-text-secondary">Total Generados</p>
            <p className="text-2xl font-bold text-detective-text">
              {totalReportsGenerated}
            </p>
          </div>
        </div>
      </DetectiveCard>

      <DetectiveCard>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-500/10 p-3">
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-detective-text-secondary">Ultimo Reporte</p>
            <p className="text-lg font-bold text-detective-text">
              {formatDate(lastGeneratedDate)}
            </p>
          </div>
        </div>
      </DetectiveCard>

      <DetectiveCard>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-detective-blue/10 p-3">
            <TrendingUp className="h-6 w-6 text-detective-blue" />
          </div>
          <div>
            <p className="text-sm text-detective-text-secondary">Formato Preferido</p>
            <p className="text-lg font-bold uppercase text-detective-text">
              {mostUsedFormat}
            </p>
          </div>
        </div>
      </DetectiveCard>

      <DetectiveCard>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-detective-gold/10 p-3">
            <Users className="h-6 w-6 text-detective-gold" />
          </div>
          <div>
            <p className="text-sm text-detective-text-secondary">Promedio Estudiantes</p>
            <p className="text-2xl font-bold text-detective-text">
              {averageStudentsPerReport}
            </p>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
}
