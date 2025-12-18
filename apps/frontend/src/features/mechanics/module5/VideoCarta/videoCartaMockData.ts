/**
 * Video Carta Mock Data
 * Sample data for development and testing
 */

import type { VideoSection, VideoRecipient, VideoFilter } from './videoCartaTypes';

export const mockVideoSections: VideoSection[] = [
  {
    id: 'intro',
    name: 'Introducción',
    duration: 30,
    prompt: '¿Quién eres y por qué escribes?',
  },
  {
    id: 'main',
    name: 'Mensaje Principal',
    duration: 90,
    prompt: '¿Qué quieres decirle a Marie Curie?',
  },
  {
    id: 'reflection',
    name: 'Reflexiones',
    duration: 45,
    prompt: '¿Qué aprendiste de ella?',
  },
  {
    id: 'closing',
    name: 'Cierre',
    duration: 15,
    prompt: 'Despedida y agradecimiento',
  },
];

export const mockRecipient: VideoRecipient = {
  name: 'Marie Curie',
  description:
    'Científica polaco-francesa, pionera en la investigación de la radioactividad, dos veces ganadora del Premio Nobel',
  imageUrl: '/images/marie-curie-portrait.jpg',
};

export const mockVideoFilters: VideoFilter[] = [
  { id: 'none', name: 'Sin filtro', cssFilter: 'none' },
  { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(100%)' },
  { id: 'grayscale', name: 'Blanco y Negro', cssFilter: 'grayscale(100%)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(50%) contrast(90%)' },
  { id: 'bright', name: 'Brillante', cssFilter: 'brightness(110%) saturate(120%)' },
  { id: 'warm', name: 'Cálido', cssFilter: 'sepia(20%) saturate(110%)' },
];

export const mockAlternativeRecipients: VideoRecipient[] = [
  {
    name: 'Pierre Curie',
    description: 'Físico francés, esposo y colaborador científico de Marie Curie',
    imageUrl: '/images/pierre-curie-portrait.jpg',
  },
  {
    name: 'Tu yo del futuro',
    description: 'Una carta de motivación para ti mismo en el futuro',
    imageUrl: '/images/future-self.jpg',
  },
  {
    name: 'Un joven científico',
    description: 'Inspira a la próxima generación de científicos',
    imageUrl: '/images/young-scientist.jpg',
  },
];

export const mockExerciseConfig = {
  maxDuration: 180,
  allowFilters: true,
  allowReRecording: true,
  requireAllSections: true,
};

export const mockPromptSuggestions = {
  intro: [
    'Preséntate brevemente',
    'Explica tu interés en la ciencia',
    'Menciona por qué admirar a Marie Curie',
  ],
  main: [
    'Habla sobre lo que has aprendido',
    'Comparte cómo te inspira su historia',
    'Haz preguntas que te gustaría hacerle',
  ],
  reflection: [
    'Reflexiona sobre los obstáculos que superó',
    'Relaciona su experiencia con la tuya',
    'Piensa en qué puedes aplicar en tu vida',
  ],
  closing: [
    'Agradece su legado',
    'Comparte un mensaje de esperanza',
    'Despídete de forma personal',
  ],
};
