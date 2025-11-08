import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
}

export interface TimelineData extends BaseExercise {
  events: TimelineEvent[];
  correctOrder?: string[]; // Optional - if not provided, will be calculated by sorting events by year
}

export interface DraggedEvent extends TimelineEvent {
  position: number;
}
