import React, { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { Beaker, Play, Pause, Trophy, Users, CheckCircle } from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  trafficSplit: Record<string, number>;
  metrics: string[];
  startDate?: string;
  endDate?: string;
  results?: ExperimentResults;
}

interface Variant {
  id: string;
  name: string;
  description: string;
}

interface ExperimentResults {
  totalUsers: number;
  variantStats: Record<string, VariantStats>;
  winner?: string;
  confidenceLevel?: number;
}

interface VariantStats {
  users: number;
  conversions: number;
  conversionRate: number;
  avgEngagement: number;
}

export const ABTestingDashboard: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: '1',
      name: 'New Onboarding Flow',
      description: 'Test new vs old onboarding experience',
      status: 'running',
      variants: [
        { id: 'A', name: 'Control (Old Flow)', description: 'Current onboarding experience' },
        { id: 'B', name: 'New Flow v1', description: 'Simplified 3-step onboarding' },
        { id: 'C', name: 'New Flow v2', description: 'Interactive tutorial onboarding' },
      ],
      trafficSplit: { A: 50, B: 25, C: 25 },
      metrics: ['completion_rate', 'time_to_complete', 'first_exercise_started'],
      startDate: '2024-10-10',
      results: {
        totalUsers: 1250,
        variantStats: {
          A: { users: 625, conversions: 450, conversionRate: 72, avgEngagement: 8.5 },
          B: { users: 312, conversions: 265, conversionRate: 84.9, avgEngagement: 9.2 },
          C: { users: 313, conversions: 280, conversionRate: 89.5, avgEngagement: 9.8 },
        },
        winner: 'C',
        confidenceLevel: 95,
      },
    },
    {
      id: '2',
      name: 'Dashboard Layout Test',
      description: 'Compare different dashboard layouts',
      status: 'paused',
      variants: [
        { id: 'A', name: 'Grid Layout', description: 'Card-based grid layout' },
        { id: 'B', name: 'List Layout', description: 'Vertical list layout' },
      ],
      trafficSplit: { A: 50, B: 50 },
      metrics: ['time_on_page', 'clicks', 'navigation_depth'],
      startDate: '2024-10-01',
      results: {
        totalUsers: 850,
        variantStats: {
          A: { users: 425, conversions: 340, conversionRate: 80, avgEngagement: 7.2 },
          B: { users: 425, conversions: 357, conversionRate: 84, avgEngagement: 7.8 },
        },
      },
    },
    {
      id: '3',
      name: 'Call-to-Action Button Color',
      description: 'Test button color impact on conversions',
      status: 'draft',
      variants: [
        { id: 'A', name: 'Orange (Current)', description: 'Current detective orange' },
        { id: 'B', name: 'Blue', description: 'Blue variant' },
        { id: 'C', name: 'Green', description: 'Green variant' },
      ],
      trafficSplit: { A: 34, B: 33, C: 33 },
      metrics: ['click_through_rate', 'conversion_rate'],
    },
  ]);

  const [, setCreatingExperiment] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  const handleStartExperiment = (id: string) => {
    setExperiments((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? { ...exp, status: 'running' as const, startDate: new Date().toISOString() }
          : exp,
      ),
    );
  };

  const handlePauseExperiment = (id: string) => {
    setExperiments((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, status: 'paused' as const } : exp)),
    );
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<{ experimentId: string; variantId: string } | null>(null);

  const handleDeclareWinner = (experimentId: string, variantId: string) => {
    setPendingWinner({ experimentId, variantId });
    setShowConfirm(true);
  };

  const confirmDeclareWinner = () => {
    if (!pendingWinner) return;
    setExperiments((prev) =>
      prev.map((exp) =>
        exp.id === pendingWinner.experimentId
          ? {
              ...exp,
              status: 'completed' as const,
              endDate: new Date().toISOString(),
              results: { ...exp.results!, winner: pendingWinner.variantId },
            }
          : exp,
      ),
    );
    setShowConfirm(false);
    setPendingWinner(null);
  };

  const selectedExp = experiments.find((e) => e.id === selectedExperiment);

  return (
    <div className="space-y-6">
      {/* Future Feature Banner */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-4 py-3 text-sm font-medium text-yellow-300">
        FUTURE FEATURE — Not yet connected to backend
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Beaker className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-detective-subtitle">A/B Testing Dashboard</h2>
            <p className="text-detective-small text-gray-400">{experiments.length} experiments</p>
          </div>
        </div>
        <DetectiveButton
          variant="primary"
          icon={<Beaker className="h-4 w-4" />}
          onClick={() => setCreatingExperiment(true)}
        >
          New Experiment
        </DetectiveButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DetectiveCard className="border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3">
            <Play className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-detective-small text-gray-400">Running</p>
              <p className="text-2xl font-bold text-green-500">
                {experiments.filter((e) => e.status === 'running').length}
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <div className="flex items-center gap-3">
            <Pause className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-detective-small text-gray-400">Paused</p>
              <p className="text-2xl font-bold text-yellow-500">
                {experiments.filter((e) => e.status === 'paused').length}
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-detective-small text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-500">
                {experiments.filter((e) => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-detective-small text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-purple-500">
                {experiments.reduce((sum, e) => sum + (e.results?.totalUsers || 0), 0)}
              </p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Experiments List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-detective-base font-semibold">All Experiments</h3>
          {experiments.map((exp) => (
            <DetectiveCard
              key={exp.id}
              className={`cursor-pointer ${selectedExperiment === exp.id ? 'border-2 border-detective-orange' : ''}`}
              onClick={() => setSelectedExperiment(exp.id)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-detective-base font-semibold">{exp.name}</h4>
                  <p className="text-detective-small text-gray-400">{exp.description}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    exp.status === 'running'
                      ? 'border border-green-500/30 bg-green-500/20 text-green-500'
                      : exp.status === 'paused'
                        ? 'border border-yellow-500/30 bg-yellow-500/20 text-yellow-500'
                        : exp.status === 'completed'
                          ? 'border border-blue-500/30 bg-blue-500/20 text-blue-500'
                          : 'border border-gray-500/30 bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {exp.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-detective-small flex items-center gap-2">
                  <span className="text-gray-400">Variants:</span>
                  <span className="text-detective-text">{exp.variants.length}</span>
                </div>
                {exp.results && (
                  <div className="text-detective-small flex items-center gap-2">
                    <span className="text-gray-400">Users:</span>
                    <span className="text-detective-text">{exp.results.totalUsers}</span>
                  </div>
                )}
                {exp.results?.winner && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-detective-small text-yellow-500">
                      Winner: Variant {exp.results.winner}
                    </span>
                  </div>
                )}
              </div>
            </DetectiveCard>
          ))}
        </div>

        {/* Experiment Details */}
        <div>
          {selectedExp ? (
            <div className="space-y-4">
              <DetectiveCard>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-detective-subtitle">{selectedExp.name}</h3>
                  <div className="flex gap-2">
                    {selectedExp.status === 'draft' && (
                      <DetectiveButton
                        variant="green"
                        icon={<Play className="h-4 w-4" />}
                        onClick={() => handleStartExperiment(selectedExp.id)}
                      >
                        Start
                      </DetectiveButton>
                    )}
                    {selectedExp.status === 'running' && (
                      <DetectiveButton
                        variant="primary"
                        icon={<Pause className="h-4 w-4" />}
                        onClick={() => handlePauseExperiment(selectedExp.id)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Pause
                      </DetectiveButton>
                    )}
                    {selectedExp.status === 'paused' && (
                      <DetectiveButton
                        variant="green"
                        icon={<Play className="h-4 w-4" />}
                        onClick={() => handleStartExperiment(selectedExp.id)}
                      >
                        Resume
                      </DetectiveButton>
                    )}
                  </div>
                </div>

                <p className="text-detective-small mb-4 text-gray-400">{selectedExp.description}</p>

                <div className="mb-4 space-y-2">
                  {selectedExp.startDate && (
                    <div className="flex items-center justify-between rounded bg-detective-bg-secondary p-2">
                      <span className="text-detective-small text-gray-400">Start Date</span>
                      <span className="text-detective-small">
                        {selectedExp.startDate
                          ? new Date(selectedExp.startDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                  {selectedExp.endDate && (
                    <div className="flex items-center justify-between rounded bg-detective-bg-secondary p-2">
                      <span className="text-detective-small text-gray-400">End Date</span>
                      <span className="text-detective-small">
                        {selectedExp.endDate
                          ? new Date(selectedExp.endDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 text-detective-base font-semibold">Traffic Split</h4>
                  <div className="space-y-2">
                    {selectedExp.variants.map((variant) => (
                      <div key={variant.id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-detective-small">Variant {variant.id}</span>
                          <span className="text-detective-small font-bold">
                            {selectedExp.trafficSplit[variant.id]}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-detective-bg-secondary">
                          <div
                            className="h-full bg-detective-orange"
                            style={{ width: `${selectedExp.trafficSplit[variant.id]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-detective-base font-semibold">Metrics Tracked</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExp.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-500"
                      >
                        {metric.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </DetectiveCard>

              {/* Results */}
              {selectedExp.results && (
                <DetectiveCard>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-detective-base font-semibold">Results</h4>
                    {selectedExp.results.confidenceLevel && (
                      <span className="rounded-lg bg-green-500/20 px-3 py-1 text-sm text-green-500">
                        {selectedExp.results.confidenceLevel}% Confidence
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedExp.variants.map((variant) => {
                      const stats = selectedExp.results?.variantStats[variant.id];
                      if (!stats) return null;

                      const isWinner = selectedExp.results?.winner === variant.id;

                      return (
                        <div
                          key={variant.id}
                          className={`rounded-lg border p-4 ${
                            isWinner
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-detective-bg-secondary bg-detective-bg-secondary'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h5 className="text-detective-base font-semibold">
                                Variant {variant.id}
                              </h5>
                              {isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                            </div>
                            {selectedExp.status === 'running' && !selectedExp.results?.winner && (
                              <DetectiveButton
                                variant="primary"
                                onClick={() => handleDeclareWinner(selectedExp.id, variant.id)}
                              >
                                Declare Winner
                              </DetectiveButton>
                            )}
                          </div>

                          <p className="text-detective-small mb-3 text-gray-400">
                            {variant.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-400">Users</p>
                              <p className="text-lg font-bold">{stats.users}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Conversions</p>
                              <p className="text-lg font-bold">{stats.conversions}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Conversion Rate</p>
                              <p className="text-lg font-bold text-detective-orange">
                                {stats.conversionRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Avg Engagement</p>
                              <p className="text-lg font-bold">{stats.avgEngagement}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DetectiveCard>
              )}

              {/* Statistical Significance */}
              {selectedExp.results && selectedExp.status === 'running' && (
                <DetectiveCard className="border border-blue-500/30 bg-blue-500/10">
                  <h4 className="mb-2 text-detective-base font-semibold text-blue-500">
                    Statistical Significance
                  </h4>
                  <p className="text-detective-small text-gray-400">
                    Experiment has reached {selectedExp.results.confidenceLevel}% confidence level.
                    You can declare a winner or continue collecting data for higher confidence.
                  </p>
                </DetectiveCard>
              )}
            </div>
          ) : (
            <DetectiveCard>
              <div className="py-12 text-center text-gray-400">
                <Beaker className="mx-auto mb-2 h-12 w-12" />
                <p>Select an experiment to view details</p>
              </div>
            </DetectiveCard>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingWinner(null); }}
        onConfirm={confirmDeclareWinner}
        title="Declarar ganador"
        message={pendingWinner ? `¿Declarar la variante ${pendingWinner.variantId} como ganadora y finalizar el experimento?` : ''}
        variant="warning"
        confirmText="Declarar ganador"
      />
    </div>
  );
};
