import { CallToActionData } from './callToActionTypes';
import { DifficultyLevel } from '@shared/types/educational.types';

export const mockCallToActionExercises: CallToActionData[] = [{
  id: 'call-to-action-001',
  title: 'Call to Action: Campaña por las Mujeres en STEM',
  description: 'Crea una campaña de acción social inspirada en el legado de Marie Curie para promover la participación de mujeres en ciencia y tecnología.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 600,
  topic: 'Marie Curie - Activismo Social',
  hints: [
    { id: 'h1', text: 'Piensa en las barreras que enfrentan las mujeres en STEM actualmente', cost: 10 },
    { id: 'h2', text: 'Conecta tu campaña con los valores y logros de Marie Curie', cost: 15 },
    { id: 'h3', text: 'Define acciones concretas y alcanzables para tu campaña', cost: 20 }
  ],
  availableCauses: [
    'Más mujeres en STEM',
    'Becas científicas para mujeres',
    'Reconocimiento a científicas',
    'Educación científica inclusiva',
    'Igualdad en investigación'
  ],
  availableTags: [
    'Ciencia',
    'Educación',
    'Igualdad',
    'Marie Curie',
    'Mujeres',
    'Investigación',
    'Nobel',
    'Física',
    'Química'
  ],
  minGoal: 50,
  maxGoal: 1000,
  goalStep: 50,
  minCampaigns: 1
}];
