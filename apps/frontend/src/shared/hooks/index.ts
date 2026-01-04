/**
 * Shared Hooks Export Index
 * Re-exports all shared hooks for easier importing
 */

export { useModuleDetail } from './useModules';
export { useUserStatistics } from './useUserStatistics';
export type { UserStatistics } from './useUserStatistics';
export { useModuleAccess } from './useModuleAccess';
export type { UseModuleAccessParams, UseModuleAccessReturn } from './useModuleAccess';
export { usePersistedFilters, clearAllPersistedFilters } from './usePersistedFilters';
export { useAudioRecorder } from './useAudioRecorder';
export type {
  UseAudioRecorderReturn,
  AudioRecorderError,
  RecordingState,
  PermissionState,
} from './useAudioRecorder';
export { useInvalidateDashboard } from './useInvalidateDashboard';
export type { UseInvalidateDashboardReturn } from './useInvalidateDashboard';
export { useUserPreferences } from './useUserPreferences';
export type { UserPreferences, UseUserPreferencesReturn } from './useUserPreferences';
export { useSpeechToText } from './useSpeechToText';
export type {
  UseSpeechToTextReturn,
  UseSpeechToTextOptions,
  SpeechError,
  SpeechState,
  SpeechLanguage,
} from './useSpeechToText';
