/**
 * Diario Multimedia Mock Data
 * Sample data for development and testing
 */

import type { DiaryEntry, DiaryTheme, UploadedFile } from './diarioMultimediaTypes';

export const mockThemes: DiaryTheme[] = [
  {
    id: 'learning',
    name: 'Mi Aprendizaje',
    description: 'Reflexiones sobre lo que has aprendido',
    suggestedPrompts: [
      '¿Qué aprendiste hoy sobre Marie Curie?',
      '¿Qué te sorprendió más de su historia?',
      '¿Cómo aplicarías sus enseñanzas en tu vida?',
    ],
  },
  {
    id: 'inspiration',
    name: 'Inspiración',
    description: 'Cómo Marie Curie te inspira',
    suggestedPrompts: [
      '¿Qué cualidades de Marie Curie admiras?',
      '¿Cómo te motiva su perseverancia?',
      '¿Qué metas quieres alcanzar inspirado por ella?',
    ],
  },
  {
    id: 'challenges',
    name: 'Superando Obstáculos',
    description: 'Reflexiones sobre desafíos personales',
    suggestedPrompts: [
      '¿Qué obstáculos has enfrentado tú?',
      '¿Cómo los superaste o planeas superarlos?',
      '¿Qué puedes aprender de cómo Marie superó los suyos?',
    ],
  },
];

export const mockPrompts: string[] = [
  '¿Qué aprendiste hoy sobre Marie Curie que no sabías?',
  '¿Cómo describirías la perseverancia de Marie Curie?',
  '¿Qué desafíos enfrentó Marie como mujer en la ciencia?',
  '¿Cómo cambió el mundo gracias a sus descubrimientos?',
  '¿Qué consejo crees que te daría Marie Curie?',
  '¿Cómo aplicarías el método científico en tu vida diaria?',
  '¿Qué significa para ti ser un "científico ciudadano"?',
];

export const mockSampleEntry: DiaryEntry = {
  id: 'sample-entry-1',
  date: new Date(),
  title: 'Mi primera reflexión sobre Marie Curie',
  content:
    'Hoy aprendí que Marie Curie tuvo que superar muchos obstáculos para convertirse en científica. Me impresiona su determinación y cómo nunca se rindió ante las dificultades. Esto me hace pensar en mis propios desafíos y cómo puedo enfrentarlos con la misma actitud.',
  media: [],
  isPrivate: false,
};

export const mockSampleMedia: UploadedFile[] = [
  {
    id: 'media-1',
    name: 'foto-laboratorio.jpg',
    url: '/placeholder-images/lab.jpg',
    type: 'image',
  },
  {
    id: 'media-2',
    name: 'audio-reflexion.mp3',
    url: '/placeholder-audio/reflection.mp3',
    type: 'audio',
  },
];

export const mockExerciseConfig = {
  minEntries: 5,
  maxEntries: 10,
  minContentLength: 150,
  allowMediaUpload: true,
  allowPrivateEntries: true,
};
