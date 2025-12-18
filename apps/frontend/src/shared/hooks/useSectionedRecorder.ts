import { useState, useRef, useCallback, useEffect } from 'react';
import { useVideoRecorder, UseVideoRecorderReturn } from './useVideoRecorder';

/**
 * Video Section Definition
 */
export interface VideoSection {
  id: string;
  name: string;
  duration: number; // Duration in seconds
  prompt: string;
}

/**
 * Section Recording State
 */
export interface SectionRecording {
  sectionId: string;
  blob: Blob | null;
  duration: number;
  completed: boolean;
}

/**
 * Sectioned Recorder Return Type
 */
export interface UseSectionedRecorderReturn extends UseVideoRecorderReturn {
  // Section-specific state
  sections: VideoSection[];
  currentSectionIndex: number;
  currentSection: VideoSection | null;
  sectionTimeRemaining: number;
  sectionProgress: number; // 0-100
  totalProgress: number; // 0-100

  // Section recordings
  sectionRecordings: Map<string, SectionRecording>;
  allSectionsCompleted: boolean;

  // Section-specific actions
  goToNextSection: () => void;
  goToPreviousSection: () => void;
  goToSection: (index: number) => void;
  reRecordSection: (sectionId: string) => void;

  // Override standard actions with section awareness
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

/**
 * useSectionedRecorder Hook
 *
 * Extends useVideoRecorder with section-based recording capabilities
 */
export function useSectionedRecorder(sections: VideoSection[]): UseSectionedRecorderReturn {
  const baseRecorder = useVideoRecorder();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(sections[0]?.duration || 0);
  const [sectionRecordings, setSectionRecordings] = useState<Map<string, SectionRecording>>(
    new Map(),
  );

  const sectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRecordingStartTime = useRef<number>(0);

  // Current section
  const currentSection = sections[currentSectionIndex] || null;

  // Calculate section progress (0-100)
  const sectionProgress = currentSection
    ? ((currentSection.duration - sectionTimeRemaining) / currentSection.duration) * 100
    : 0;

  // Calculate total progress (0-100)
  const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);
  const completedDuration = sections
    .slice(0, currentSectionIndex)
    .reduce((sum, s) => sum + s.duration, 0);
  const currentSectionElapsed = currentSection ? currentSection.duration - sectionTimeRemaining : 0;
  const totalProgress = ((completedDuration + currentSectionElapsed) / totalDuration) * 100;

  // Check if all sections are completed
  const allSectionsCompleted = sections.every(
    (section) => sectionRecordings.get(section.id)?.completed,
  );

  /**
   * Start section timer
   */
  const startSectionTimer = useCallback(() => {
    if (sectionTimerRef.current) {
      clearInterval(sectionTimerRef.current);
    }

    const section = sections[currentSectionIndex];
    if (!section) return;

    setSectionTimeRemaining(section.duration);
    currentRecordingStartTime.current = Date.now();

    sectionTimerRef.current = setInterval(() => {
      setSectionTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Auto-advance to next section when time runs out
        if (newTime <= 0) {
          if (sectionTimerRef.current) {
            clearInterval(sectionTimerRef.current);
            sectionTimerRef.current = null;
          }

          // Mark current section as completed
          const recordingDuration = Math.floor(
            (Date.now() - currentRecordingStartTime.current) / 1000,
          );
          setSectionRecordings((prev) => {
            const newMap = new Map(prev);
            newMap.set(section.id, {
              sectionId: section.id,
              blob: null, // Will be set when stopped
              duration: recordingDuration,
              completed: true,
            });
            return newMap;
          });

          // Auto-advance or stop
          if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex((prev) => prev + 1);
          } else {
            // All sections completed, stop recording
            baseRecorder.stopRecording();
          }

          return 0;
        }

        return newTime;
      });
    }, 1000);
  }, [currentSectionIndex, sections, baseRecorder]);

  /**
   * Stop section timer
   */
  const stopSectionTimer = useCallback(() => {
    if (sectionTimerRef.current) {
      clearInterval(sectionTimerRef.current);
      sectionTimerRef.current = null;
    }
  }, []);

  /**
   * Start recording (override base)
   */
  const startRecording = useCallback(async () => {
    await baseRecorder.startRecording();
    startSectionTimer();
  }, [baseRecorder, startSectionTimer]);

  /**
   * Stop recording (override base)
   */
  const stopRecording = useCallback(() => {
    stopSectionTimer();
    baseRecorder.stopRecording();

    // Save current section recording
    const section = sections[currentSectionIndex];
    if (section && baseRecorder.videoBlob) {
      const recordingDuration = Math.floor((Date.now() - currentRecordingStartTime.current) / 1000);
      setSectionRecordings((prev) => {
        const newMap = new Map(prev);
        newMap.set(section.id, {
          sectionId: section.id,
          blob: baseRecorder.videoBlob,
          duration: recordingDuration,
          completed: true,
        });
        return newMap;
      });
    }
  }, [baseRecorder, currentSectionIndex, sections, stopSectionTimer]);

  /**
   * Go to next section
   */
  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      const wasPaused = baseRecorder.isPaused;

      // Mark current section as completed
      const section = sections[currentSectionIndex];
      const recordingDuration = Math.floor((Date.now() - currentRecordingStartTime.current) / 1000);
      setSectionRecordings((prev) => {
        const newMap = new Map(prev);
        newMap.set(section.id, {
          sectionId: section.id,
          blob: null,
          duration: recordingDuration,
          completed: true,
        });
        return newMap;
      });

      setCurrentSectionIndex((prev) => prev + 1);

      // Reset timer for new section
      if (baseRecorder.isRecording || wasPaused) {
        stopSectionTimer();
        startSectionTimer();
      }
    }
  }, [
    currentSectionIndex,
    sections,
    baseRecorder.isRecording,
    baseRecorder.isPaused,
    startSectionTimer,
    stopSectionTimer,
  ]);

  /**
   * Go to previous section
   */
  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);

      // Reset timer for new section
      if (baseRecorder.isRecording) {
        stopSectionTimer();
        startSectionTimer();
      }
    }
  }, [currentSectionIndex, baseRecorder.isRecording, startSectionTimer, stopSectionTimer]);

  /**
   * Go to specific section
   */
  const goToSection = useCallback(
    (index: number) => {
      if (index >= 0 && index < sections.length) {
        setCurrentSectionIndex(index);

        // Reset timer for new section
        if (baseRecorder.isRecording) {
          stopSectionTimer();
          startSectionTimer();
        }
      }
    },
    [sections.length, baseRecorder.isRecording, startSectionTimer, stopSectionTimer],
  );

  /**
   * Re-record a specific section
   */
  const reRecordSection = useCallback(
    (sectionId: string) => {
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex !== -1) {
        // Remove the recording for this section
        setSectionRecordings((prev) => {
          const newMap = new Map(prev);
          newMap.delete(sectionId);
          return newMap;
        });

        // Navigate to that section
        goToSection(sectionIndex);

        // Reset the recording if needed
        if (baseRecorder.videoUrl) {
          baseRecorder.resetRecording();
        }
      }
    },
    [sections, goToSection, baseRecorder],
  );

  /**
   * Update section time when section changes
   */
  useEffect(() => {
    const section = sections[currentSectionIndex];
    if (section && !baseRecorder.isRecording) {
      setSectionTimeRemaining(section.duration);
    }
  }, [currentSectionIndex, sections, baseRecorder.isRecording]);

  /**
   * Handle pause/resume for section timer
   */
  useEffect(() => {
    if (baseRecorder.isPaused) {
      stopSectionTimer();
    } else if (baseRecorder.isRecording && !sectionTimerRef.current) {
      startSectionTimer();
    }
  }, [baseRecorder.isPaused, baseRecorder.isRecording, startSectionTimer, stopSectionTimer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (sectionTimerRef.current) {
        clearInterval(sectionTimerRef.current);
      }
    };
  }, []);

  return {
    ...baseRecorder,

    // Section-specific state
    sections,
    currentSectionIndex,
    currentSection,
    sectionTimeRemaining,
    sectionProgress,
    totalProgress,

    // Section recordings
    sectionRecordings,
    allSectionsCompleted,

    // Section-specific actions
    goToNextSection,
    goToPreviousSection,
    goToSection,
    reRecordSection,

    // Override actions
    startRecording,
    stopRecording,
  };
}
