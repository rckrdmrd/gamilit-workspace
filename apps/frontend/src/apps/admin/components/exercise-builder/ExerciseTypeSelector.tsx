import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/utils/cn';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

export interface ExerciseType {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  moduleName: string;
  icon: string;
  complexity: 'simple' | 'medium' | 'complex';
}

const EXERCISE_TYPES: ExerciseType[] = [
  // Module 1 - Comprension Literal (7 types)
  { id: 'completar_espacios', name: 'Completar Espacios', description: 'Texto con blancos para rellenar con la palabra correcta', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F4DD}', complexity: 'simple' },
  { id: 'crucigrama', name: 'Crucigrama', description: 'Resuelve el crucigrama con pistas del texto', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F524}', complexity: 'medium' },
  { id: 'emparejamiento', name: 'Emparejamiento', description: 'Conecta conceptos, definiciones o ideas relacionadas', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F517}', complexity: 'simple' },
  { id: 'linea_tiempo', name: 'Linea de Tiempo', description: 'Ordena eventos cronologicamente', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F4C5}', complexity: 'medium' },
  { id: 'mapa_conceptual', name: 'Mapa Conceptual', description: 'Construye un mapa de relaciones entre conceptos', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F5FA}\uFE0F', complexity: 'complex' },
  { id: 'sopa_letras', name: 'Sopa de Letras', description: 'Encuentra palabras ocultas en la cuadricula', moduleId: 'module-1', moduleName: 'Literal', icon: '\u{1F50D}', complexity: 'simple' },
  { id: 'verdadero_falso', name: 'Verdadero o Falso', description: 'Evalua si las afirmaciones son correctas', moduleId: 'module-1', moduleName: 'Literal', icon: '\u2705', complexity: 'simple' },
  // Module 2 - Comprension Inferencial (5 types)
  { id: 'construccion_hipotesis', name: 'Construccion de Hipotesis', description: 'Formula hipotesis basadas en evidencia textual', moduleId: 'module-2', moduleName: 'Inferencial', icon: '\u{1F4A1}', complexity: 'complex' },
  { id: 'detective_textual', name: 'Detective Textual', description: 'Encuentra pistas en el texto para resolver misterios', moduleId: 'module-2', moduleName: 'Inferencial', icon: '\u{1F575}\uFE0F', complexity: 'medium' },
  { id: 'prediccion_narrativa', name: 'Prediccion Narrativa', description: 'Predice que sucedera en la historia', moduleId: 'module-2', moduleName: 'Inferencial', icon: '\u{1F52E}', complexity: 'medium' },
  { id: 'puzzle_contexto', name: 'Puzzle de Contexto', description: 'Descifra significados usando el contexto', moduleId: 'module-2', moduleName: 'Inferencial', icon: '\u{1F9E9}', complexity: 'medium' },
  { id: 'rueda_inferencias', name: 'Rueda de Inferencias', description: 'Conecta inferencias con evidencia en formato radial', moduleId: 'module-2', moduleName: 'Inferencial', icon: '\u{1F3AF}', complexity: 'complex' },
  // Module 3 - Comprension Critica (5 types)
  { id: 'analisis_fuentes', name: 'Analisis de Fuentes', description: 'Evalua credibilidad y sesgo de multiples fuentes', moduleId: 'module-3', moduleName: 'Critica', icon: '\u{1F4F0}', complexity: 'complex' },
  { id: 'debate_digital', name: 'Debate Digital', description: 'Construye argumentos para un debate estructurado', moduleId: 'module-3', moduleName: 'Critica', icon: '\u{1F4AC}', complexity: 'complex' },
  { id: 'matriz_perspectivas', name: 'Matriz de Perspectivas', description: 'Analiza un tema desde multiples puntos de vista', moduleId: 'module-3', moduleName: 'Critica', icon: '\u{1F4CA}', complexity: 'complex' },
  { id: 'podcast_argumentativo', name: 'Podcast Argumentativo', description: 'Estructura un argumento tipo podcast', moduleId: 'module-3', moduleName: 'Critica', icon: '\u{1F399}\uFE0F', complexity: 'complex' },
  { id: 'tribunal_opiniones', name: 'Tribunal de Opiniones', description: 'Juzga un caso evaluando evidencia y argumentos', moduleId: 'module-3', moduleName: 'Critica', icon: '\u2696\uFE0F', complexity: 'complex' },
];

const MODULE_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'module-1', label: 'M1 Literal' },
  { id: 'module-2', label: 'M2 Inferencial' },
  { id: 'module-3', label: 'M3 Critica' },
];

const COMPLEXITY_COLORS: Record<string, string> = {
  simple: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  complex: 'bg-red-500/20 text-red-400',
};

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: 'Simple',
  medium: 'Medio',
  complex: 'Complejo',
};

export interface ExerciseTypeSelectorProps {
  selectedType: string;
  moduleFilter: string;
  onSelect: (typeId: string) => void;
}

export function ExerciseTypeSelector({
  selectedType,
  moduleFilter,
  onSelect,
}: ExerciseTypeSelectorProps) {
  const [activeTab, setActiveTab] = useState(moduleFilter || 'all');

  const filteredTypes = useMemo(() => {
    if (activeTab === 'all') return EXERCISE_TYPES;
    return EXERCISE_TYPES.filter((t) => t.moduleId === activeTab);
  }, [activeTab]);

  return (
    <DetectiveCard hoverable={false}>
      <h2 className="mb-4 text-xl font-bold text-detective-text">Tipo de Ejercicio</h2>

      {/* Module Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-detective-orange text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(type.id)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-colors',
                isSelected
                  ? 'border-detective-orange bg-detective-orange/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <span className="text-2xl">{type.icon}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    COMPLEXITY_COLORS[type.complexity]
                  )}
                >
                  {COMPLEXITY_LABELS[type.complexity]}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-detective-text">{type.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{type.description}</p>
              <div className="mt-2">
                <span className="rounded bg-gray-700/50 px-2 py-0.5 text-xs text-gray-400">
                  {type.moduleName}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </DetectiveCard>
  );
}

export default ExerciseTypeSelector;
