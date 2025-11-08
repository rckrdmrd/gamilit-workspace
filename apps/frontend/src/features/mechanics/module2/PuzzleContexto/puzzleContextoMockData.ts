import type { PuzzleExercise } from './puzzleContextoTypes';

export const mockPuzzle: PuzzleExercise = {
  id: 'puzzle-1',
  title: 'El Contexto de Marie Curie',
  description: 'Ordena los eventos y contextos para comprender la vida de Marie Curie',
  pieces: [
    { id: 'p1', content: 'Polonia bajo dominio ruso - Limitaciones para mujeres en educación', correctPosition: 0, category: 'historical' },
    { id: 'p2', content: 'Marie se muda a París para estudiar en la Sorbonne', correctPosition: 1, category: 'personal' },
    { id: 'p3', content: 'Descubrimiento de la radiactividad por Becquerel inspira investigación', correctPosition: 2, category: 'scientific' },
    { id: 'p4', content: 'Colaboración con Pierre Curie en laboratorio improvisado', correctPosition: 3, category: 'personal' },
    { id: 'p5', content: 'Aislamiento del radio tras años de trabajo extenuante', correctPosition: 4, category: 'scientific' },
    { id: 'p6', content: 'Premio Nobel de Física 1903 compartido con Pierre y Becquerel', correctPosition: 5, category: 'social' },
  ],
  difficulty: 'medio',
};
