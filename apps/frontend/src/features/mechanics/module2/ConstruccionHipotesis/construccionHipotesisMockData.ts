import type { HypothesisExercise, Variable } from './construccionHipotesisTypes';

export const mockVariables: Variable[] = [
  {
    id: 'var-1',
    name: 'Masa de pechblenda',
    type: 'independent',
    description: 'Cantidad de mineral de pechblenda utilizado',
    unit: 'gramos',
  },
  {
    id: 'var-2',
    name: 'Intensidad de radiación',
    type: 'dependent',
    description: 'Nivel de radiación emitida medida',
    unit: 'becquerels',
  },
  {
    id: 'var-3',
    name: 'Temperatura ambiente',
    type: 'controlled',
    description: 'Temperatura del laboratorio durante experimento',
    unit: 'grados Celsius',
  },
  {
    id: 'var-4',
    name: 'Tiempo de exposición',
    type: 'independent',
    description: 'Duración del experimento',
    unit: 'horas',
  },
  {
    id: 'var-5',
    name: 'Pureza del material',
    type: 'controlled',
    description: 'Nivel de pureza del elemento radiactivo',
    unit: 'porcentaje',
  },
];

export const mockExercise: HypothesisExercise = {
  id: 'exercise-hypothesis-1',
  title: 'Radioactividad del Radio',
  context:
    'Marie Curie descubrió que la pechblenda emitía más radiación que el uranio puro. Esto la llevó a formular hipótesis sobre la presencia de nuevos elementos radiactivos.',
  scientificQuestion:
    '¿Cómo afecta la masa de pechblenda a la intensidad de radiación emitida?',
  availableVariables: mockVariables,
  difficulty: 'medio',
};
