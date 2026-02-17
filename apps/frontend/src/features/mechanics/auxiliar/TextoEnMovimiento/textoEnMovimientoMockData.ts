import { TextoEnMovimientoData } from './textoEnMovimientoTypes';
import { DifficultyLevel } from '@shared/types/educational.types';

export const mockTextoEnMovimientoExercises: TextoEnMovimientoData[] = [{
  id: 'texto-movimiento-001',
  title: 'Texto en Movimiento: Cronología de Marie Curie',
  description: 'Crea animaciones de texto sobre Marie Curie y sus descubrimientos científicos.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 360,
  topic: 'Marie Curie - Producción Multimedia',
  hints: [
    { id: 'h1', text: 'Combina diferentes tipos de animación para mayor impacto', cost: 10 },
    { id: 'h2', text: 'Ajusta la duración de cada texto para crear un ritmo agradable', cost: 15 },
    { id: 'h3', text: 'Usa colores que resalten sobre el fondo oscuro', cost: 10 }
  ],
  availableAnimations: [
    {
      id: 'fadeIn',
      name: 'Aparecer',
      variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    },
    {
      id: 'slideUp',
      name: 'Deslizar Arriba',
      variants: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } }
    },
    {
      id: 'slideDown',
      name: 'Deslizar Abajo',
      variants: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } }
    },
    {
      id: 'slideLeft',
      name: 'Deslizar Izquierda',
      variants: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } }
    },
    {
      id: 'slideRight',
      name: 'Deslizar Derecha',
      variants: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } }
    },
    {
      id: 'scale',
      name: 'Escalar',
      variants: { hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } }
    },
    {
      id: 'rotate',
      name: 'Rotar',
      variants: { hidden: { rotate: -180, opacity: 0 }, visible: { rotate: 0, opacity: 1 } }
    },
    {
      id: 'bounce',
      name: 'Rebotar',
      variants: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } }
    }
  ],
  availableColors: ['#f97316', '#1e3a8a', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
  minDuration: 0.5,
  maxDuration: 5,
  minFontSize: 16,
  maxFontSize: 96,
}];
