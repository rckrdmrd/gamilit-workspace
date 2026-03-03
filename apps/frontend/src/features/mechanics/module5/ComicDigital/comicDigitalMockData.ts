/**
 * Comic Digital Mock Data
 * Sample data for development and testing
 */

import type { ComicPanel, ComicTemplate, LayoutOption, BackgroundOption, StickerDefinition } from './comicDigitalTypes';

export const mockLayouts: LayoutOption[] = [
  { id: 'full', name: 'Panel Completo', cols: 1 },
  { id: 'half', name: '½ Panel', cols: 2 },
  { id: 'third', name: '⅓ Panel', cols: 3 },
];

export const mockBackgrounds: BackgroundOption[] = [
  {
    id: 'lab',
    name: 'Laboratorio',
    color: 'bg-gray-100',
    gradientClasses: 'bg-gradient-to-br from-slate-200 via-gray-100 to-zinc-200',
    accentBorder: 'border-l-4 border-l-slate-400',
    icon: '🧪',
  },
  {
    id: 'university',
    name: 'Universidad',
    color: 'bg-blue-100',
    gradientClasses: 'bg-gradient-to-br from-blue-200 via-indigo-100 to-sky-200',
    accentBorder: 'border-l-4 border-l-blue-400',
    icon: '🏛️',
  },
  {
    id: 'award',
    name: 'Ceremonia',
    color: 'bg-yellow-100',
    gradientClasses: 'bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200',
    accentBorder: 'border-l-4 border-l-amber-400',
    icon: '🏆',
  },
  {
    id: 'research',
    name: 'Investigación',
    color: 'bg-purple-100',
    gradientClasses: 'bg-gradient-to-br from-purple-200 via-fuchsia-100 to-violet-200',
    accentBorder: 'border-l-4 border-l-purple-400',
    icon: '🔬',
  },
  {
    id: 'home',
    name: 'Hogar',
    color: 'bg-green-100',
    gradientClasses: 'bg-gradient-to-br from-green-200 via-emerald-100 to-teal-200',
    accentBorder: 'border-l-4 border-l-green-400',
    icon: '🏡',
  },
  {
    id: 'outdoor',
    name: 'Exterior',
    color: 'bg-cyan-100',
    gradientClasses: 'bg-gradient-to-br from-cyan-200 via-sky-100 to-blue-200',
    accentBorder: 'border-l-4 border-l-cyan-400',
    icon: '🌳',
  },
  {
    id: 'library',
    name: 'Biblioteca',
    color: 'bg-amber-50',
    gradientClasses: 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100',
    accentBorder: 'border-l-4 border-l-amber-600',
    icon: '📚',
    illustrationUrl: '/assets/backgrounds/magic-library.svg',
  },
  {
    id: 'cenote',
    name: 'Cenote Sagrado',
    color: 'bg-teal-50',
    gradientClasses: 'bg-gradient-to-br from-teal-200 via-emerald-100 to-cyan-200',
    accentBorder: 'border-l-4 border-l-teal-600',
    icon: '💎',
    illustrationUrl: '/assets/backgrounds/cenote-sagrado.svg',
  },
];

export const STICKER_DEFINITIONS: StickerDefinition[] = [
  // Characters (6)
  { id: 'marie-curie', emoji: '👩‍🔬', label: 'Marie Curie', category: 'character' },
  { id: 'pierre-curie', emoji: '👨‍🔬', label: 'Pierre Curie', category: 'character' },
  { id: 'narrator', emoji: '📢', label: 'Narrador', category: 'character' },
  { id: 'student', emoji: '👩‍🎓', label: 'Estudiante', category: 'character' },
  { id: 'doctor', emoji: '🧑‍⚕️', label: 'Médico', category: 'character' },
  { id: 'professor', emoji: '👨‍🏫', label: 'Profesor', category: 'character' },
  // Props (8)
  { id: 'flask', emoji: '🧪', label: 'Matraz', category: 'prop' },
  { id: 'atom', emoji: '⚛️', label: 'Átomo', category: 'prop' },
  { id: 'book', emoji: '📖', label: 'Libro', category: 'prop' },
  { id: 'medal', emoji: '🏅', label: 'Medalla', category: 'prop' },
  { id: 'microscope', emoji: '🔬', label: 'Microscopio', category: 'prop' },
  { id: 'radioactive', emoji: '☢️', label: 'Radio', category: 'prop' },
  { id: 'lightbulb', emoji: '💡', label: 'Bombilla', category: 'prop' },
  { id: 'star', emoji: '⭐', label: 'Estrella', category: 'prop' },
  // Effects (5)
  { id: 'explosion', emoji: '💥', label: 'Explosión', category: 'effect' },
  { id: 'sparkles', emoji: '✨', label: 'Brillos', category: 'effect' },
  { id: 'question', emoji: '❓', label: 'Pregunta', category: 'effect' },
  { id: 'exclamation', emoji: '❗', label: 'Exclamación', category: 'effect' },
  { id: 'fire', emoji: '🔥', label: 'Fuego', category: 'effect' },
];

export const mockTemplates: ComicTemplate[] = [
  {
    id: 'biography',
    name: 'Biografía en 6 Viñetas',
    description: 'Cuenta la vida de Marie Curie en 6 momentos clave',
    panelCount: 6,
    layouts: ['full', 'half', 'half', 'third', 'third', 'full'],
  },
  {
    id: 'discovery',
    name: 'El Descubrimiento',
    description: 'Narra el proceso de descubrimiento del radio',
    panelCount: 4,
    layouts: ['full', 'half', 'half', 'full'],
  },
  {
    id: 'challenges',
    name: 'Superando Obstáculos',
    description: 'Los desafíos que Marie enfrentó',
    panelCount: 5,
    layouts: ['full', 'third', 'third', 'third', 'full'],
  },
];

export const mockSuggestedScenes: string[] = [
  'Infancia de Marie en Varsovia, Polonia',
  'Llegada a París y la Sorbona',
  'Conoce a Pierre Curie en el laboratorio',
  'Descubrimiento del Polonio y Radio',
  'Primer Premio Nobel de Física (1903)',
  'Segundo Premio Nobel de Química (1911)',
  'Marie como profesora en la Sorbona',
  'Trabajo durante la Primera Guerra Mundial',
  'Legado científico y mujeres en ciencia',
];

export const mockInitialPanels: ComicPanel[] = [
  {
    id: 'panel-1',
    layout: 'full',
    text: 'Varsovia, Polonia - 1867',
    speechBubbles: [
      {
        id: 'bubble-1',
        text: '¡Un día seré científica!',
        x: 60,
        y: 30,
        type: 'speech',
      },
    ],
    stickers: [],
    background: 'home',
  },
  {
    id: 'panel-2',
    layout: 'half',
    text: 'Marie estudia en la Sorbona',
    speechBubbles: [],
    stickers: [],
    background: 'university',
  },
];

export const mockExerciseConfig = {
  minPanels: 4,
  maxPanels: 6,
  allowImageUpload: true,
  requireSpeechBubbles: false,
};
