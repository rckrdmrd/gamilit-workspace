/**
 * useModuleAccess Hook
 *
 * Manages module access control with full configuration from database
 * - Checks prerequisites (module IDs) from educational_content.modules
 * - Validates rango_maya_required from DB
 * - Computes is_locked and can_access dynamically
 * - NO hardcoded unlock logic
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Module } from '@shared/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleAccessState {
  isLocked: boolean;
  canAccess: boolean;
  lockReason: 'prerequisites' | 'rango' | 'not_published' | null;
  missingPrerequisites: string[];
  requiredRango: string | null;
  currentRango: string | null;
  hasRangoAccess: boolean;
  completedPrerequisites: string[];
  prerequisitesProgress: number; // 0-100%
}

export interface UseModuleAccessOptions {
  module: Module;
  userId: string;
  userRango?: string;
  completedModuleIds?: string[]; // From progress_tracking.module_progress
  onAccessDenied?: (reason: string) => void;
}

export interface UseModuleAccessReturn extends ModuleAccessState {
  checkAccess: () => boolean;
  getAccessMessage: () => string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// RANGO MAYA HIERARCHY (from DB ENUM)
// ============================================================================

const RANGO_MAYA_HIERARCHY: Record<string, number> = {
  mercenario: 1,
  guerrero: 2,
  holcatte: 3,
  batab: 4,
  nacom: 5,
};

function hasRequiredRango(currentRango: string | undefined, requiredRango: string | undefined): boolean {
  if (!requiredRango) return true; // No rango required
  if (!currentRango) return false; // User has no rango

  const current = RANGO_MAYA_HIERARCHY[currentRango.toLowerCase()] || 0;
  const required = RANGO_MAYA_HIERARCHY[requiredRango.toLowerCase()] || 0;

  return current >= required;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useModuleAccess({
  module,
  userId,
  userRango,
  completedModuleIds = [],
  onAccessDenied,
}: UseModuleAccessOptions): UseModuleAccessReturn {
  // ========== State ==========
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<string[]>(completedModuleIds);

  // ========== Configuration from DB (NO hardcoded values) ==========
  const prerequisites = module.prerequisites || [];
  const requiredRango = module.rango_maya_required || null;
  const isPublished = module.is_published ?? true;
  const isFree = module.is_free ?? false;

  // ========== Computed Access State ==========
  const accessState = useMemo((): ModuleAccessState => {
    // Check 1: Module must be published
    if (!isPublished) {
      return {
        isLocked: true,
        canAccess: false,
        lockReason: 'not_published',
        missingPrerequisites: [],
        requiredRango,
        currentRango: userRango || null,
        hasRangoAccess: true,
        completedPrerequisites: [],
        prerequisitesProgress: 0,
      };
    }

    // Check 2: Prerequisites
    const completedPrereqs = prerequisites.filter((prereqId) =>
      userProgress.includes(prereqId)
    );
    const missingPrereqs = prerequisites.filter(
      (prereqId) => !userProgress.includes(prereqId)
    );
    const prereqsProgress =
      prerequisites.length > 0
        ? Math.round((completedPrereqs.length / prerequisites.length) * 100)
        : 100;

    const hasAllPrerequisites = missingPrereqs.length === 0;

    // Check 3: Rango Maya
    const hasRango = hasRequiredRango(userRango, requiredRango);

    // Determine lock state and reason
    let isLocked = false;
    let lockReason: ModuleAccessState['lockReason'] = null;

    if (!hasAllPrerequisites) {
      isLocked = true;
      lockReason = 'prerequisites';
    } else if (!hasRango && !isFree) {
      isLocked = true;
      lockReason = 'rango';
    }

    const canAccess = !isLocked;

    return {
      isLocked,
      canAccess,
      lockReason,
      missingPrerequisites: missingPrereqs,
      requiredRango,
      currentRango: userRango || null,
      hasRangoAccess: hasRango,
      completedPrerequisites: completedPrereqs,
      prerequisitesProgress: prereqsProgress,
    };
  }, [isPublished, prerequisites, userProgress, requiredRango, userRango, isFree]);

  // ========== Load User Progress from DB ==========
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to progress_tracking.module_progress
        // const response = await fetch(`/api/users/${userId}/module-progress`);
        // const data = await response.json();
        // const completed = data
        //   .filter((p: any) => p.status === 'completed')
        //   .map((p: any) => p.module_id);

        // For now, use provided completedModuleIds
        setUserProgress(completedModuleIds);
      } catch (err) {
        console.error('Error loading user progress:', err);
        setError('Failed to load user progress');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProgress();
  }, [userId, completedModuleIds]);

  // ========== Notify on Access Denied ==========
  useEffect(() => {
    if (!accessState.canAccess && onAccessDenied) {
      const message = getAccessMessage();
      onAccessDenied(message);
    }
  }, [accessState.canAccess, onAccessDenied]);

  // ========== Check Access ==========
  const checkAccess = useCallback((): boolean => {
    return accessState.canAccess;
  }, [accessState.canAccess]);

  // ========== Get Access Message ==========
  const getAccessMessage = useCallback((): string => {
    if (accessState.canAccess) {
      return 'Acceso permitido';
    }

    switch (accessState.lockReason) {
      case 'not_published':
        return 'Este módulo aún no está disponible.';

      case 'prerequisites':
        const missing = accessState.missingPrerequisites.length;
        return `Debes completar ${missing} módulo${
          missing > 1 ? 's' : ''
        } anterior${missing > 1 ? 'es' : ''} antes de acceder a este módulo.`;

      case 'rango':
        return `Necesitas el rango ${accessState.requiredRango} o superior para acceder a este módulo. Tu rango actual es ${
          accessState.currentRango || 'ninguno'
        }.`;

      default:
        return 'No tienes acceso a este módulo.';
    }
  }, [accessState]);

  // ========== Refresh ==========
  const refresh = useCallback(async () => {
    // TODO: Reload from API
    setIsLoading(true);
    try {
      // Simulated refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========== Return State and Methods ==========
  return {
    ...accessState,
    checkAccess,
    getAccessMessage,
    isLoading,
    error,
    refresh,
  };
}
