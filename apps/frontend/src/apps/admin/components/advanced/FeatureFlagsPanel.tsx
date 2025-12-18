/**
 * FeatureFlagsPanel Component
 *
 * Main panel for managing feature flags.
 * Features:
 * - List of all feature flags
 * - Quick toggle to enable/disable
 * - Rollout percentage indicator
 * - Filter by status (enabled/disabled/all)
 * - Create/Edit/Delete operations
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 */

import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Flag,
  Plus,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { FeatureFlagEditor } from './FeatureFlagEditor';
import type { FeatureFlag, CreateFlagDto, UpdateFlagDto } from '../../types';

type FilterStatus = 'all' | 'enabled' | 'disabled';

export const FeatureFlagsPanel: React.FC = () => {
  const { flags, loading, error, createFlag, updateFlag, deleteFlag, toggleFlag, fetchFlags } =
    useFeatureFlags();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch flags on mount
  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // Filter flags
  const filteredFlags = flags.filter((flag) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'enabled' && flag.isEnabled) ||
      (filterStatus === 'disabled' && !flag.isEnabled);

    const matchesSearch =
      searchTerm === '' ||
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleCreateFlag = () => {
    setEditingFlag(null);
    setShowEditor(true);
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setShowEditor(true);
  };

  const handleSaveFlag = async (data: CreateFlagDto | UpdateFlagDto) => {
    if (editingFlag) {
      await updateFlag(editingFlag.key, data as UpdateFlagDto);
    } else {
      await createFlag(data as CreateFlagDto);
    }
    await fetchFlags();
  };

  const handleDeleteFlag = async (key: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      await deleteFlag(key);
    }
  };

  const handleToggleFlag = async (key: string) => {
    await toggleFlag(key);
  };

  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.isEnabled).length,
    disabled: flags.filter((f) => !f.isEnabled).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-2xl font-bold text-detective-text">Feature Flags</h2>
            <p className="text-sm text-gray-400">
              Control feature rollout and availability across the platform
            </p>
          </div>
        </div>
        <DetectiveButton
          variant="green"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreateFlag}
        >
          New Feature Flag
        </DetectiveButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetectiveCard className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-400">Total Flags</p>
              <p className="text-2xl font-bold text-blue-500">{stats.total}</p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3">
            <ToggleRight className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-400">Enabled</p>
              <p className="text-2xl font-bold text-green-500">{stats.enabled}</p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <div className="flex items-center gap-3">
            <ToggleLeft className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm text-gray-400">Disabled</p>
              <p className="text-2xl font-bold text-red-500">{stats.disabled}</p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Filters */}
      <DetectiveCard>
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, key, or description..."
              className="input-detective w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by status:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-detective-orange text-white'
                    : 'bg-detective-bg-secondary text-gray-400 hover:bg-gray-700'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('enabled')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  filterStatus === 'enabled'
                    ? 'bg-green-500 text-white'
                    : 'bg-detective-bg-secondary text-gray-400 hover:bg-gray-700'
                }`}
              >
                Enabled ({stats.enabled})
              </button>
              <button
                onClick={() => setFilterStatus('disabled')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  filterStatus === 'disabled'
                    ? 'bg-red-500 text-white'
                    : 'bg-detective-bg-secondary text-gray-400 hover:bg-gray-700'
                }`}
              >
                Disabled ({stats.disabled})
              </button>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Error Display */}
      {error && (
        <DetectiveCard className="border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-500">{error}</p>
        </DetectiveCard>
      )}

      {/* Loading State */}
      {loading && (
        <DetectiveCard>
          <div className="py-8 text-center text-gray-400">Loading feature flags...</div>
        </DetectiveCard>
      )}

      {/* Flags List */}
      {!loading && (
        <div className="space-y-4">
          {filteredFlags.length === 0 ? (
            <DetectiveCard>
              <div className="py-8 text-center text-gray-400">
                {searchTerm || filterStatus !== 'all'
                  ? 'No feature flags match your filters'
                  : 'No feature flags created yet'}
              </div>
            </DetectiveCard>
          ) : (
            filteredFlags.map((flag) => (
              <DetectiveCard key={flag.id}>
                <div className="flex items-start gap-4">
                  {/* Flag Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-bold text-detective-text">{flag.name}</h3>
                          <span className="rounded bg-detective-orange/20 px-2 py-0.5 font-mono text-xs text-detective-orange">
                            {flag.key}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{flag.description}</p>
                      </div>
                    </div>

                    {/* Status and Rollout */}
                    <div className="mb-3 flex items-center gap-4">
                      <button
                        onClick={() => handleToggleFlag(flag.key)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors ${
                          flag.isEnabled
                            ? 'border-green-500/30 bg-green-500/20 text-green-500 hover:bg-green-500/30'
                            : 'border-red-500/30 bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                      >
                        {flag.isEnabled ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        <span className="text-xs font-bold">
                          {flag.isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Rollout:</span>
                        <span className="text-sm font-bold text-detective-orange">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>

                      {flag.targetRoles.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Roles:</span>
                          <span className="text-sm text-detective-text">
                            {flag.targetRoles.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Target Roles */}
                    {flag.targetRoles.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {flag.targetRoles.map((role) => (
                          <span
                            key={role}
                            className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Updated: {new Date(flag.updatedAt).toLocaleDateString('es-ES')}</span>
                      {flag.lastModifiedBy && <span>By: {flag.lastModifiedBy}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <DetectiveButton
                      variant="blue"
                      icon={<Edit2 className="h-4 w-4" />}
                      onClick={() => handleEditFlag(flag)}
                    >
                      Edit
                    </DetectiveButton>
                    <DetectiveButton
                      variant="primary"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDeleteFlag(flag.key)}
                      className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    >
                      Delete
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            ))
          )}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <FeatureFlagEditor
          flag={editingFlag}
          onSave={handleSaveFlag}
          onClose={() => {
            setShowEditor(false);
            setEditingFlag(null);
          }}
        />
      )}
    </div>
  );
};
