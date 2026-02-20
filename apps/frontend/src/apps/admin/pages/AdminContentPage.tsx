/**
 * AdminContentPage - Content management and moderation hub
 *
 * Provides three tabs: pending exercise review, media library, and approval history.
 * Extracted tab components handle their own data fetching via React Query.
 *
 * Sprint 1 - Admin Portal Refactor
 * Refactored: 2026-02-18 - Extracted tabs + modals, adopted AdminPageShell + AdminTabBar
 */

import { useState, useCallback } from 'react';
import { AdminPageShell } from '../components/shared/AdminPageShell';
import { AdminTabBar } from '../components/shared/AdminTabBar';
import type { AdminTab } from '../components/shared/AdminTabBar';
import {
  PendingExercisesTab,
  MediaLibraryTab,
  ContentVersionsTab,
  ContentPreviewModal,
  RejectExerciseModal,
} from '../components/content';
import { usePendingExercisesQuery } from '../hooks/useContentQueries';
import { useApiError } from '@shared/hooks';
import { FileText, Image, History } from 'lucide-react';
import type { PendingExercise } from '../types';

// ---- Tab definitions ----

type ContentTabId = 'pending' | 'media' | 'versions';

function buildTabs(pendingCount: number): AdminTab<ContentTabId>[] {
  return [
    {
      id: 'pending',
      label: 'Pendientes',
      icon: FileText,
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    { id: 'media', label: 'Multimedia', icon: Image },
    { id: 'versions', label: 'Versiones', icon: History },
  ];
}

// ---- Component ----

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTabId>('pending');
  const [selectedExercise, setSelectedExercise] = useState<PendingExercise | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const handleError = useApiError();

  const { pendingExercises, approveExercise, rejectExercise } = usePendingExercisesQuery();
  const tabs = buildTabs(pendingExercises.length);

  // ---- Modal handlers ----

  const handleOpenPreview = useCallback((exercise: PendingExercise) => {
    setSelectedExercise(exercise);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setSelectedExercise(null);
  }, []);

  const handleOpenReject = useCallback((exercise: PendingExercise) => {
    setSelectedExercise(exercise);
    setIsRejectOpen(true);
  }, []);

  const handleCloseReject = useCallback(() => {
    setIsRejectOpen(false);
    setSelectedExercise(null);
  }, []);

  const handleApproveFromPreview = useCallback(
    async (exerciseId: string) => {
      try {
        await approveExercise(exerciseId);
      } catch (err) {
        handleError(err as Parameters<typeof handleError>[0], 'Error al aprobar ejercicio');
      }
    },
    [approveExercise],
  );

  const handleOpenRejectFromPreview = useCallback(() => {
    setIsPreviewOpen(false);
    setIsRejectOpen(true);
  }, []);

  const handleRejectExercise = useCallback(
    async (exerciseId: string, reason: string) => {
      await rejectExercise(exerciseId, reason);
    },
    [rejectExercise],
  );

  // ---- Render ----

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Gestion de Contenido</h1>
          <p className="mt-1 text-detective-text-secondary">
            Modera ejercicios, gestiona multimedia y controla versiones del sistema
          </p>
        </div>

        <AdminTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'pending' && (
          <PendingExercisesTab onPreview={handleOpenPreview} onReject={handleOpenReject} />
        )}
        {activeTab === 'media' && <MediaLibraryTab />}
        {activeTab === 'versions' && <ContentVersionsTab />}
      </div>

      <ContentPreviewModal
        isOpen={isPreviewOpen}
        exercise={selectedExercise}
        onClose={handleClosePreview}
        onApprove={handleApproveFromPreview}
        onReject={handleOpenRejectFromPreview}
      />

      <RejectExerciseModal
        isOpen={isRejectOpen}
        exercise={selectedExercise}
        onClose={handleCloseReject}
        onReject={handleRejectExercise}
      />
    </AdminPageShell>
  );
}
