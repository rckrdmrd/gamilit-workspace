/**
 * LtiConsumerList Component
 *
 * Displays a list of LTI consumers with status indicators and actions.
 * Used in the AdminLtiPage for managing LMS integrations.
 *
 * @module features/admin/lti/components/LtiConsumerList
 * @see ET-LTI-001-integration.md
 */

import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Play,
  ExternalLink,
  Shield,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { LtiConsumer } from '@/shared/types/lti.types';

interface LtiConsumerListProps {
  /** List of LTI consumers to display */
  consumers: LtiConsumer[];
  /** Whether data is loading */
  loading: boolean;
  /** Callback when edit button is clicked */
  onEdit: (consumer: LtiConsumer) => void;
  /** Callback when deactivate button is clicked */
  onDeactivate: (consumer: LtiConsumer) => void;
  /** Callback when activate button is clicked */
  onActivate: (consumer: LtiConsumer) => void;
  /** Callback when test connection button is clicked */
  onTestConnection: (consumer: LtiConsumer) => void;
  /** Callback when view credentials button is clicked */
  onViewCredentials: (consumer: LtiConsumer) => void;
}

/**
 * Status badge component for LTI consumer
 */
function StatusBadge({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-1 text-xs font-medium text-gray-400">
        <XCircle className="h-3 w-3" />
        Inactive
      </span>
    );
  }

  if (!isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-500">
        <AlertTriangle className="h-3 w-3" />
        Pending Verification
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-500">
      <CheckCircle className="h-3 w-3" />
      Active & Verified
    </span>
  );
}

/**
 * Feature badge for LTI Advantage services
 */
function FeatureBadge({
  label,
  enabled,
  tooltip,
}: {
  label: string;
  enabled: boolean;
  tooltip: string;
}) {
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
        enabled
          ? 'bg-detective-orange/20 text-detective-orange'
          : 'bg-gray-500/20 text-gray-500'
      }`}
    >
      {label}
    </span>
  );
}

/**
 * LtiConsumerList Component
 */
export function LtiConsumerList({
  consumers,
  loading,
  onEdit,
  onDeactivate,
  onActivate,
  onTestConnection,
  onViewCredentials,
}: LtiConsumerListProps) {
  if (loading && consumers.length === 0) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-detective-orange border-t-transparent" />
          <span className="ml-3 text-detective-text-secondary">Loading consumers...</span>
        </div>
      </DetectiveCard>
    );
  }

  if (consumers.length === 0) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-detective-text-secondary" />
          <h3 className="mt-4 text-lg font-medium text-detective-text">No LTI Consumers</h3>
          <p className="mt-2 text-sm text-detective-text-secondary">
            Get started by adding your first LTI consumer to integrate with an LMS.
          </p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-4">
      {consumers.map((consumer) => (
        <DetectiveCard key={consumer.id} hoverable>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Consumer Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-detective-orange/20">
                  {consumer.isVerified ? (
                    <ShieldCheck className="h-5 w-5 text-detective-orange" />
                  ) : (
                    <Shield className="h-5 w-5 text-detective-text-secondary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-detective-text">{consumer.platformName}</h3>
                  <p className="text-sm text-detective-text-secondary">
                    {consumer.platformId}
                  </p>
                </div>
              </div>

              {/* Status and Features */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge isActive={consumer.isActive} isVerified={consumer.isVerified} />
                <FeatureBadge
                  label="DL"
                  enabled={consumer.supportsDeepLinking}
                  tooltip="Deep Linking"
                />
                <FeatureBadge
                  label="NRPS"
                  enabled={consumer.supportsNrps}
                  tooltip="Names and Role Provisioning Services"
                />
                <FeatureBadge
                  label="AGS"
                  enabled={consumer.supportsAgs}
                  tooltip="Assignment and Grade Services"
                />
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-detective-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Client ID:</span>
                  <code className="rounded bg-detective-bg-secondary px-1.5 py-0.5">
                    {consumer.clientId}
                  </code>
                </span>
                {consumer.deploymentId && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Deployment:</span>
                    <code className="rounded bg-detective-bg-secondary px-1.5 py-0.5">
                      {consumer.deploymentId}
                    </code>
                  </span>
                )}
                {consumer.lastUsedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last used: {new Date(consumer.lastUsedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTestConnection(consumer)}
                className="rounded-lg border border-detective-border bg-detective-bg-secondary p-2 text-detective-text-secondary transition-colors hover:border-detective-orange hover:text-detective-orange"
                title="Test Connection"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewCredentials(consumer)}
                className="rounded-lg border border-detective-border bg-detective-bg-secondary p-2 text-detective-text-secondary transition-colors hover:border-detective-orange hover:text-detective-orange"
                title="View Credentials"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(consumer)}
                className="rounded-lg border border-detective-border bg-detective-bg-secondary p-2 text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-400/10"
                title="Edit Consumer"
              >
                <Edit className="h-4 w-4" />
              </button>
              {consumer.isActive ? (
                <button
                  onClick={() => onDeactivate(consumer)}
                  className="rounded-lg border border-detective-border bg-detective-bg-secondary p-2 text-red-400 transition-colors hover:border-red-400 hover:bg-red-400/10"
                  title="Deactivate Consumer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => onActivate(consumer)}
                  className="rounded-lg border border-detective-border bg-detective-bg-secondary p-2 text-green-400 transition-colors hover:border-green-400 hover:bg-green-400/10"
                  title="Activate Consumer"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
}

export default LtiConsumerList;
