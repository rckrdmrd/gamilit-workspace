import { ComprensiónAuditivaData } from './comprensionAuditivaTypes';
import { DifficultyLevel } from '@shared/types/educational.types';

export const mockComprensiónAuditivaExercises: ComprensiónAuditivaData[] = [{
  id: 'comprension-auditiva-001',
  title: 'Comprensión Auditiva: La Vida de Marie Curie',
  description: 'Escucha el audio sobre Marie Curie y responde las preguntas de comprensión.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 420,
  topic: 'Marie Curie - Comprensión Oral',
  hints: [
    { id: 'h1', text: 'Escucha con atención los años y fechas mencionados', cost: 10 },
    { id: 'h2', text: 'Presta atención a los nombres de los elementos descubiertos', cost: 15 },
    { id: 'h3', text: 'Puedes reproducir el audio varias veces', cost: 5 }
  ],
  audioUrl: '/audio/marie-curie-biografia.mp3',
  audioTitle: 'Biografía de Marie Curie',
  audioDuration: 115,
  questions: [
    {
      id: 'q1',
      time: 5,
      question: '¿Dónde nació Marie Curie?',
      options: ['Francia', 'Polonia', 'Rusia', 'Alemania'],
      correctAnswer: 1
    },
    {
      id: 'q2',
      time: 25,
      question: '¿Qué elementos descubrió Marie Curie junto con su esposo?',
      options: ['Uranio', 'Polonio y Radio', 'Hierro', 'Oro'],
      correctAnswer: 1
    },
    {
      id: 'q3',
      time: 45,
      question: '¿Cuántos Premios Nobel ganó Marie Curie?',
      options: ['Uno', 'Dos', 'Tres', 'Ninguno'],
      correctAnswer: 1
    },
    {
      id: 'q4',
      time: 65,
      question: '¿En qué campos ganó Marie Curie los Premios Nobel?',
      options: ['Física y Química', 'Medicina y Física', 'Química y Medicina', 'Literatura y Paz'],
      correctAnswer: 0
    }
  ]
}];
