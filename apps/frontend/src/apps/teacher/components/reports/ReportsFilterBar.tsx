import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Users } from 'lucide-react';

export interface ReportsFilterBarProps {
  selectedClassroom: string;
  onClassroomChange: (classroomId: string) => void;
  classrooms: Array<{ id: string; name: string }>;
}

export function ReportsFilterBar({
  selectedClassroom,
  onClassroomChange,
  classrooms,
}: ReportsFilterBarProps) {
  return (
    <DetectiveCard>
      <div className="flex items-center gap-4">
        <Users className="h-6 w-6 text-detective-orange" />
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-detective-text">
            Selecciona un Aula
          </label>
          <select
            value={selectedClassroom}
            onChange={(e) => onClassroomChange(e.target.value)}
            className="w-full rounded-lg border border-detective-orange bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
          >
            {classrooms.length === 0 ? (
              <option value="">No hay aulas disponibles</option>
            ) : (
              classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </DetectiveCard>
  );
}
