import { continueNarrative } from '../../shared/aiService';
import type { Story } from './prediccionNarrativaTypes';
import { mockStory } from './prediccionNarrativaMockData';

export const fetchStory = async (id: string): Promise<Story> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockStory;
};

export const submitPrediction = async (storyBeginning: string, userPrediction: string) => {
  return continueNarrative(storyBeginning, userPrediction);
};
