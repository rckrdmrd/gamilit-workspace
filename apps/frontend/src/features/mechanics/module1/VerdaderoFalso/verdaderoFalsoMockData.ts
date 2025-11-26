import { VerdaderoFalsoData } from './verdaderoFalsoTypes';

export const mockVerdaderoFalsoExercises: VerdaderoFalsoData[] = [
  {
    id: 'verdadero-falso-001',
    title: 'Evalúa si estas afirmaciones sobre la juventud de Marie Curie son verdaderas o falsas',
    description:
      'Lee cada afirmación y determina si es verdadera o falsa según el contexto histórico de Marie Curie. Módulo 1 - Ejercicio 2',
    difficulty: 'facil',
    estimatedTime: 300,
    topic: 'Marie Curie - Módulo 1: Comprensión Literal',
    hints: [
      {
        id: 'hint-vf1',
        text: 'Marie Curie nació en Polonia y vivió allí durante su infancia',
        cost: 15,
      },
      { id: 'hint-vf2', text: 'Su padre enseñaba tanto matemáticas como física', cost: 15 },
      {
        id: 'hint-vf3',
        text: 'La familia Sklodowska valoraba profundamente la educación',
        cost: 15,
      },
    ],
    contextText:
      'Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad científica. Su padre le enseñó los primeros principios de las matemáticas y la física, mientras su madre la inspiró con su dedicación a la educación.',
    statements: [
      {
        id: 'stmt-1',
        statement: 'Marie mostró curiosidad excepcional por las ciencias desde muy pequeña',
      },
      {
        id: 'stmt-2',
        statement: 'Su padre era profesor de química solamente',
      },
      {
        id: 'stmt-3',
        statement: 'Marie nació en Francia',
      },
      {
        id: 'stmt-4',
        statement: 'Su familia valoraba mucho la educación',
      },
    ],
  },
];
