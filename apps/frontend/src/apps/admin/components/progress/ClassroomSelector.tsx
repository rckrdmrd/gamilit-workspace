/**
 * ClassroomSelector Component
 *
 * Dropdown to select a classroom.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import { School, ChevronDown } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
}

interface ClassroomSelectorProps {
  classrooms: Classroom[];
  selectedClassroomId: string | null;
  onSelect: (classroomId: string) => void;
  isLoading?: boolean;
}

export const ClassroomSelector = ({
  classrooms,
  selectedClassroomId,
  onSelect,
  isLoading = false,
}: ClassroomSelectorProps) => {
  return (
    <div className="relative">
      <label
        htmlFor="classroom-select"
        className="mb-2 block text-sm font-medium text-detective-text-secondary"
      >
        Seleccionar Aula
      </label>
      <div className="relative">
        <School className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
        <select
          id="classroom-select"
          value={selectedClassroomId || ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={isLoading}
          className="border-detective-border w-full cursor-pointer appearance-none rounded-lg border bg-detective-bg-secondary py-3 pl-10 pr-10 text-detective-text transition-all hover:border-detective-orange focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">-- Seleccionar aula --</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
      </div>
    </div>
  );
};
