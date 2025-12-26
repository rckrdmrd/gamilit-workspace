import { CollagePrensaData } from './collagePrensaTypes';
import { DifficultyLevel } from '@shared/types/educational.types';

export const mockCollagePrensaExercises: CollagePrensaData[] = [{
  id: 'collage-prensa-001',
  title: 'Collage de Prensa: Marie Curie y sus Logros',
  description: 'Crea un collage estilo periódico sobre Marie Curie y sus descubrimientos científicos.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 480,
  topic: 'Marie Curie - Producción Visual',
  hints: [
    { id: 'h1', text: 'Combina imágenes con titulares impactantes', cost: 10 },
    { id: 'h2', text: 'Usa texto descriptivo para explicar los descubrimientos', cost: 15 },
    { id: 'h3', text: 'Organiza los elementos de forma visualmente atractiva', cost: 20 }
  ],
  newspaperTitle: 'LE JOURNAL SCIENTIFIQUE',
  newspaperDate: 'Paris, 1903',
  canvasAspectRatio: '3/4',
  minCanvasHeight: 800,
  defaultHeadlineText: 'MARIE CURIE GANA PREMIO NOBEL',
  defaultBodyText: 'La científica descubre el radio...',
  defaultElementWidth: 30,
  defaultElementHeight: 30
}];
