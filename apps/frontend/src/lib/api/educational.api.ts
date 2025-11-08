/**
 * Educational API
 * API client for Educational Module endpoints
 *
 * Endpoints:
 * - getModules: Get all modules (with optional difficulty filter)
 * - getModuleById: Get a specific module by ID
 * - getModuleExercises: Get all exercises for a module
 * - getExerciseById: Get a specific exercise by ID
 */

import apiClient from './client';
import type { Module, Exercise, DifficultyLevel } from '@/shared/types/educational.types';

/**
 * Get all modules
 * @param difficulty - Optional difficulty filter
 * @returns Array of Module
 */
export const getModules = async (difficulty?: DifficultyLevel): Promise<Module[]> => {
  const { data } = await apiClient.get('/educational/modules', {
    params: difficulty ? { difficulty } : undefined,
  });
  return data;
};

/**
 * Get a specific module by ID
 * @param id - Module ID
 * @returns Module
 */
export const getModuleById = async (id: string): Promise<Module> => {
  const { data } = await apiClient.get(`/educational/modules/${id}`);
  return data;
};

/**
 * Get all exercises for a module
 * @param moduleId - Module ID
 * @returns Array of Exercise
 */
export const getModuleExercises = async (moduleId: string): Promise<Exercise[]> => {
  const { data } = await apiClient.get(`/educational/modules/${moduleId}/exercises`);
  return data;
};

/**
 * Get a specific exercise by ID
 * @param id - Exercise ID
 * @returns Exercise
 */
export const getExerciseById = async (id: string): Promise<Exercise> => {
  const { data } = await apiClient.get(`/educational/exercises/${id}`);
  return data;
};

/**
 * Search modules by keyword
 * @param keyword - Search keyword
 * @returns Array of Module
 */
export const searchModules = async (keyword: string): Promise<Module[]> => {
  const { data } = await apiClient.get('/educational/modules/search', {
    params: { q: keyword },
  });
  return data;
};

// Export all as educationalApi object
export const educationalApi = {
  getModules,
  getModuleById,
  getModuleExercises,
  getExerciseById,
  searchModules,
};

export default educationalApi;
