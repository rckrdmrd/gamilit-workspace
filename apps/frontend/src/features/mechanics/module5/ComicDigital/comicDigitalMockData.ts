/**
 * Comic Digital Mock Data
 * Sample data for development and testing
 */

import type { ComicPanel, ComicTemplate, LayoutOption, BackgroundOption } from './comicDigitalTypes';

export const mockLayouts: LayoutOption[] = [
  { id: 'full', name: 'Panel Completo', cols: 1 },
  { id: 'half', name: '2 Paneles', cols: 2 },
  { id: 'third', name: '3 Paneles', cols: 3 },
];

export const mockBackgrounds: BackgroundOption[] = [
  { id: 'lab', name: 'Laboratorio', color: 'bg-gray-100' },
  { id: 'university', name: 'Universidad', color: 'bg-blue-50' },
  { id: 'award', name: 'Ceremonia', color: 'bg-yellow-50' },
  { id: 'research', name: 'Investigación', color: 'bg-purple-50' },
  { id: 'home', name: 'Hogar', color: 'bg-green-50' },
  { id: 'outdoor', name: 'Exterior', color: 'bg-cyan-50' },
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
    background: 'home',
  },
  {
    id: 'panel-2',
    layout: 'half',
    text: 'Marie estudia en la Sorbona',
    speechBubbles: [],
    background: 'university',
  },
];

export const mockExerciseConfig = {
  minPanels: 6,
  maxPanels: 12,
  allowImageUpload: true,
  requireSpeechBubbles: false,
};
