/**
 * useModuleAccess Hook
 *
 * Determines if a user can access a module based on:
 * - Prerequisites completion
 * - Required rango/rank
 * - Module configuration
 */

import { useEffect, useMemo } from 'react';
import type { Module } from '@shared/types';

export interface UseModuleAccessParams {
  module: Module;
  userId: string;
  userRango?: string;
  completedModuleIds?: string[];
  onAccessDenied?: (reason: 'prerequisites' | 'rango' | 'both') => void;
}

export interface UseModuleAccessReturn {
  isLocked: boolean;
  canAccess: boolean;
  lockReason: 'prerequisites' | 'rango' | 'both' | null;
  missingPrerequisites: string[];
  requiredRango: string | null;
  currentRango: string | null;
  hasRangoAccess: boolean;
  prerequisitesProgress: number;
  getAccessMessage: () => string;
  isLoading: boolean;
}

export function useModuleAccess({
  module,
  userId: _userId,
  userRango,
  completedModuleIds = [],
  onAccessDenied,
}: UseModuleAccessParams): UseModuleAccessReturn {
  const isLoading = false;

  // Parse prerequisites from module
  const prerequisites = useMemo(() => {
    if (!module.prerequisites) return [];
    if (typeof module.prerequisites === 'string') {
      try {
        return JSON.parse(module.prerequisites);
      } catch {
        return [];
      }
    }
    return module.prerequisites;
  }, [module.prerequisites]);

  // Check prerequisites completion
  const missingPrerequisites = useMemo(() => {
    return prerequisites.filter((prereqId: string) => !completedModuleIds.includes(prereqId));
  }, [prerequisites, completedModuleIds]);

  const hasPrerequisites = prerequisites.length > 0;
  const prerequisitesMet = missingPrerequisites.length === 0;

  // Calculate prerequisites progress
  const prerequisitesProgress = useMemo(() => {
    if (!hasPrerequisites) return 100;
    const completed = prerequisites.length - missingPrerequisites.length;
    return Math.round((completed / prerequisites.length) * 100);
  }, [prerequisites.length, missingPrerequisites.length, hasPrerequisites]);

  // Check rango requirement
  const requiredRango = module.maya_rank_required || null;
  const currentRango = userRango || null;

  // Simple rango check (can be enhanced with actual rango hierarchy)
  const hasRangoAccess = useMemo(() => {
    if (!requiredRango) return true;
    if (!currentRango) return false;
    // TODO: Implement proper rango hierarchy comparison
    return true; // For now, assume access if user has any rango
  }, [requiredRango, currentRango]);

  // Determine lock reason
  const lockReason = useMemo((): 'prerequisites' | 'rango' | 'both' | null => {
    const prereqBlocked = hasPrerequisites && !prerequisitesMet;
    const rangoBlocked = requiredRango && !hasRangoAccess;

    if (prereqBlocked && rangoBlocked) return 'both';
    if (prereqBlocked) return 'prerequisites';
    if (rangoBlocked) return 'rango';
    return null;
  }, [hasPrerequisites, prerequisitesMet, requiredRango, hasRangoAccess]);

  const isLocked = lockReason !== null;
  const canAccess = !isLocked;

  // Get access message
  const getAccessMessage = (): string => {
    if (!isLocked) return 'Tienes acceso a este módulo';

    switch (lockReason) {
      case 'prerequisites':
        return `Completa ${missingPrerequisites.length} módulo${missingPrerequisites.length > 1 ? 's' : ''} antes de desbloquear`;
      case 'rango':
        return `Requiere rango ${requiredRango} para desbloquear`;
      case 'both':
        return `Completa prerequisitos y alcanza rango ${requiredRango}`;
      default:
        return '';
    }
  };

  // Call onAccessDenied callback when access is denied
  useEffect(() => {
    if (isLocked && onAccessDenied && lockReason) {
      onAccessDenied(lockReason);
    }
  }, [isLocked, lockReason, onAccessDenied]);

  return {
    isLocked,
    canAccess,
    lockReason,
    missingPrerequisites,
    requiredRango,
    currentRango,
    hasRangoAccess,
    prerequisitesProgress,
    getAccessMessage,
    isLoading,
  };
}
