/**
 * StudentSearch Component
 *
 * Search input with autocomplete for students.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface StudentSearchProps {
  students: Student[];
  onSelect: (studentId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({
  students,
  onSelect,
  isLoading = false,
  placeholder = 'Buscar estudiante...',
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const lowerQuery = query.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(lowerQuery) ||
          student.email.toLowerCase().includes(lowerQuery),
      );
      setFilteredStudents(filtered);
      setShowResults(true);
    } else {
      setFilteredStudents([]);
      setShowResults(false);
    }
  }, [query, students]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (student: Student) => {
    setQuery(student.name);
    setShowResults(false);
    onSelect(student.id);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor="student-search"
        className="mb-2 block text-sm font-medium text-detective-text-secondary"
      >
        Buscar Estudiante
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
        <input
          ref={inputRef}
          id="student-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (filteredStudents.length > 0) {
              setShowResults(true);
            }
          }}
          disabled={isLoading}
          placeholder={placeholder}
          className="border-detective-border w-full rounded-lg border bg-detective-bg-secondary py-3 pl-10 pr-10 text-detective-text transition-all placeholder:text-detective-text-secondary/50 focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-detective-bg-secondary"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4 text-detective-text-secondary" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && filteredStudents.length > 0 && (
        <div
          ref={resultsRef}
          className="border-detective-border absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border bg-detective-bg-secondary shadow-xl"
        >
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelect(student)}
              className="border-detective-border w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-detective-orange/10"
            >
              <p className="font-medium text-detective-text">{student.name}</p>
              <p className="text-sm text-detective-text-secondary">{student.email}</p>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && filteredStudents.length === 0 && (
        <div
          ref={resultsRef}
          className="border-detective-border absolute z-10 mt-2 w-full rounded-lg border bg-detective-bg-secondary p-4 shadow-xl"
        >
          <p className="text-center text-detective-text-secondary">No se encontraron estudiantes</p>
        </div>
      )}
    </div>
  );
};
