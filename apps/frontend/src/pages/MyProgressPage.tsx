import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { GamifiedHeader } from '@/shared/components/layout/GamifiedHeader';
import { ProgressCard } from '@/shared/components/ProgressCard';
import { ProgressFilter, ProgressFilterState } from '@/shared/components/ProgressFilter';
import { StatsOverview } from '@/shared/components/StatsOverview';
import { progressApi } from '@/lib/api/progress.api';
import { educationalApi } from '@/lib/api/educational.api';
import type { Module } from '@/shared/types/educational.types';
import type { ModuleProgress, ProgressSummary } from '@/shared/types/progress.types';

/**
 * MyProgressPage Component
 * Main progress page showing all modules with user progress
 *
 * Features:
 * - Progress summary stats
 * - Filter/sort modules
 * - Grid of progress cards
 * - Empty states
 * - Loading states
 * - Error handling
 * - Navigate to module details
 *
 * Data Sources:
 * - getUserProgressSummary: Overall stats
 * - getUserProgress: All module progress
 * - getModules: All modules
 */
export const MyProgressPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [progressList, setProgressList] = useState<ModuleProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [filter, setFilter] = useState<ProgressFilterState>({
    status: 'all',
    difficulty: 'all',
    sortBy: 'progress',
  });

  // Loading states
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Combined loading state
  const isLoading = isLoadingSummary || isLoadingProgress || isLoadingModules;

  // Fetch progress summary
  useEffect(() => {
    const loadSummary = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingSummary(true);
        setError(null);
        const data = await progressApi.getUserProgressSummary(user.id);
        setSummary(data);
      } catch (err) {
        console.error('Failed to load progress summary:', err);
        setError('Failed to load progress summary. Please try again.');
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadSummary();
  }, [user?.id]);

  // Fetch user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingProgress(true);
        const data = await progressApi.getUserProgress(user.id);
        setProgressList(data);
      } catch (err) {
        console.error('Failed to load user progress:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadProgress();
  }, [user?.id]);

  // Fetch modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        setIsLoadingModules(true);
        const data = await educationalApi.getModules();
        setModules(data);
      } catch (err) {
        console.error('Failed to load modules:', err);
        setError('Failed to load modules. Please try again.');
      } finally {
        setIsLoadingModules(false);
      }
    };

    loadModules();
  }, []);

  // Combine modules with progress
  const modulesWithProgress = useMemo(() => {
    return modules.map((module) => ({
      module,
      progress: progressList.find((p) => p.module_id === module.id),
    }));
  }, [modules, progressList]);

  // Filter and sort modules
  const filteredModules = useMemo(() => {
    let filtered = [...modulesWithProgress];

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter((item) => item.progress?.status === filter.status);
    }

    // Filter by difficulty
    if (filter.difficulty !== 'all') {
      filtered = filtered.filter((item) => item.module.difficulty === filter.difficulty);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'progress':
          return (b.progress?.progress_percentage || 0) - (a.progress?.progress_percentage || 0);
        case 'name':
          return a.module.title.localeCompare(b.module.title);
        case 'last_accessed': {
          const aDate = a.progress?.last_accessed_at
            ? new Date(a.progress.last_accessed_at).getTime()
            : 0;
          const bDate = b.progress?.last_accessed_at
            ? new Date(b.progress.last_accessed_at).getTime()
            : 0;
          return bDate - aDate;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [modulesWithProgress, filter]);

  // Handle module click
  const handleModuleClick = (moduleId: string) => {
    navigate(`/progress/modules/${moduleId}`);
  };

  // Retry loading
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader user={user || undefined} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
          <p className="mt-2 text-gray-600">
            Track your learning journey and see how far you've come.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="mb-8">
          {isLoadingSummary ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-gray-200 bg-white p-5"
                >
                  <div className="mb-3 h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="mb-2 h-8 w-16 rounded bg-gray-200" />
                  <div className="mb-1 h-4 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : summary ? (
            <StatsOverview summary={summary} />
          ) : null}
        </div>

        {/* Filters */}
        {!isLoading && modules.length > 0 && (
          <ProgressFilter currentFilter={filter} onFilterChange={setFilter} />
        )}

        {/* Progress List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Modules</h2>
            {!isLoading && (
              <span className="text-sm text-gray-600">
                {filteredModules.length} {filteredModules.length === 1 ? 'module' : 'modules'}
              </span>
            )}
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <div className="h-32 bg-gray-200" />
                  <div className="p-4">
                    <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                    <div className="mb-4 h-4 w-2/3 rounded bg-gray-200" />
                    <div className="mb-4 h-2 w-full rounded bg-gray-200" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-12 rounded bg-gray-200" />
                      <div className="h-12 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress Cards Grid */}
          {!isLoading && filteredModules.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map(({ module, progress }) => (
                <ProgressCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  onClick={() => handleModuleClick(module.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredModules.length === 0 && modules.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No modules found</h3>
              <p className="mx-auto max-w-md text-gray-600">
                No modules match your current filters. Try adjusting your filter settings.
              </p>
              <button
                onClick={() => setFilter({ status: 'all', difficulty: 'all', sortBy: 'progress' })}
                className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* No Modules Available */}
          {!isLoading && modules.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No modules available</h3>
              <p className="mx-auto max-w-md text-gray-600">
                There are no learning modules available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Learning Path Section - Placeholder */}
        {!isLoading && modules.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Recommended Next</h2>
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Personalized Recommendations Coming Soon
                </h3>
                <p className="mx-auto max-w-md text-gray-600">
                  {/* TODO: Implement ML-based learning path recommendations */}
                  Get AI-powered module recommendations based on your progress and learning style.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProgressPage;
