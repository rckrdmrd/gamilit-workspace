import { useState } from 'react';
import toast from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { GitBranch, History, RotateCcw, User, Calendar } from 'lucide-react';

interface Version {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  changes: string;
  changesSummary: { added: number; modified: number; deleted: number };
  content: Record<string, unknown>;
}

export const ContentVersionControl = () => {
  // Mock data - replace with actual API calls
  const [versions] = useState<Version[]>([
    {
      id: '1',
      version: 'v3.2.1',
      timestamp: '2024-10-16T10:30:00Z',
      author: 'admin@glit.com',
      changes: 'Updated exercise instructions\nFixed typo in question 3\nImproved hints',
      changesSummary: { added: 2, modified: 5, deleted: 1 },
      content: {},
    },
    {
      id: '2',
      version: 'v3.2.0',
      timestamp: '2024-10-15T14:20:00Z',
      author: 'teacher@glit.com',
      changes: 'Added new questions\nReorganized content structure',
      changesSummary: { added: 8, modified: 3, deleted: 0 },
      content: {},
    },
    {
      id: '3',
      version: 'v3.1.0',
      timestamp: '2024-10-14T09:15:00Z',
      author: 'admin@glit.com',
      changes: 'Initial version after migration',
      changesSummary: { added: 15, modified: 0, deleted: 0 },
      content: {},
    },
  ]);

  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleRestore = async (versionId: string) => {
    setConfirmMessage('Restore to this version? Current changes will be saved as a new version.');
    setPendingAction(() => async () => {
      try {
        // TODO: Implement version restore API call
        void versionId;
        toast.success('Version restored successfully!');
      } catch (error) {
        console.error('Restore failed:', error);
        toast.error('Restore failed');
      }
    });
    setShowConfirm(true);
  };

  const selectedVersionData = versions.find((v) => v.id === selectedVersion);
  const compareVersionData = versions.find((v) => v.id === compareVersion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-detective-subtitle">Content Version Control</h2>
            <p className="text-detective-small text-gray-400">Track and restore content changes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Version History */}
        <div className="lg:col-span-1">
          <DetectiveCard>
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-detective-orange" />
              <h3 className="text-detective-subtitle">Version History</h3>
            </div>

            <div className="space-y-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    selectedVersion === version.id
                      ? 'border border-detective-orange bg-detective-orange/20'
                      : 'bg-detective-bg-secondary hover:bg-detective-bg-secondary/70'
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-detective-base font-bold">{version.version}</span>
                    {index === 0 && (
                      <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <div className="text-detective-small mb-2 flex items-center gap-2 text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{version.author}</span>
                  </div>

                  <div className="text-detective-small flex items-center gap-2 text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {version.timestamp
                        ? new Date(version.timestamp).toLocaleString('es-ES')
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-green-500">+{version.changesSummary.added}</span>
                    <span className="text-yellow-500">~{version.changesSummary.modified}</span>
                    <span className="text-red-500">-{version.changesSummary.deleted}</span>
                  </div>
                </div>
              ))}
            </div>
          </DetectiveCard>
        </div>

        {/* Version Details */}
        <div className="lg:col-span-2">
          {selectedVersionData ? (
            <div className="space-y-4">
              <DetectiveCard>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-detective-subtitle">{selectedVersionData.version}</h3>
                    <p className="text-detective-small text-gray-400">
                      by {selectedVersionData.author} on{' '}
                      {selectedVersionData.timestamp
                        ? new Date(selectedVersionData.timestamp).toLocaleString('es-ES')
                        : 'N/A'}
                    </p>
                  </div>
                  <DetectiveButton
                    variant="blue"
                    icon={<RotateCcw className="h-4 w-4" />}
                    onClick={() => handleRestore(selectedVersionData.id)}
                    disabled
                    title="Proximamente"
                  >
                    Restore
                  </DetectiveButton>
                </div>

                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-detective-small text-gray-400">Added</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{selectedVersionData.changesSummary.added}
                    </p>
                  </div>
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <p className="text-detective-small text-gray-400">Modified</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      ~{selectedVersionData.changesSummary.modified}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-detective-small text-gray-400">Deleted</p>
                    <p className="text-2xl font-bold text-red-500">
                      -{selectedVersionData.changesSummary.deleted}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-detective-base font-semibold">Changes:</h4>
                  <div className="rounded-lg bg-detective-bg-secondary p-3">
                    <pre className="text-detective-small whitespace-pre-wrap text-gray-300">
                      {selectedVersionData.changes}
                    </pre>
                  </div>
                </div>
              </DetectiveCard>

              {/* Compare Versions */}
              <DetectiveCard>
                <h4 className="mb-3 text-detective-base font-semibold">Compare with:</h4>
                <select
                  className="input-detective mb-4"
                  value={compareVersion || ''}
                  onChange={(e) => setCompareVersion(e.target.value || null)}
                >
                  <option value="">Select version to compare...</option>
                  {versions
                    .filter((v) => v.id !== selectedVersion)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.version} -{' '}
                        {v.timestamp ? new Date(v.timestamp).toLocaleDateString('es-ES') : 'N/A'}
                      </option>
                    ))}
                </select>

                {compareVersionData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-detective-small mb-2 text-gray-400">
                        {selectedVersionData.version} (Selected)
                      </p>
                      <div className="rounded-lg bg-detective-bg-secondary p-3">
                        <pre className="whitespace-pre-wrap text-xs text-gray-300">
                          {selectedVersionData.changes}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <p className="text-detective-small mb-2 text-gray-400">
                        {compareVersionData.version} (Compare)
                      </p>
                      <div className="rounded-lg bg-detective-bg-secondary p-3">
                        <pre className="whitespace-pre-wrap text-xs text-gray-300">
                          {compareVersionData.changes}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </DetectiveCard>

              {/* Audit Trail */}
              <DetectiveCard>
                <h4 className="mb-3 text-detective-base font-semibold">Audit Trail</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded bg-detective-bg-secondary p-2">
                    <span className="text-detective-small">Created by</span>
                    <span className="text-detective-small text-detective-orange">
                      {selectedVersionData.author}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-detective-bg-secondary p-2">
                    <span className="text-detective-small">Created at</span>
                    <span className="text-detective-small text-gray-400">
                      {selectedVersionData.timestamp
                        ? new Date(selectedVersionData.timestamp).toLocaleString('es-ES')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-detective-bg-secondary p-2">
                    <span className="text-detective-small">Total changes</span>
                    <span className="text-detective-small text-gray-400">
                      {selectedVersionData.changesSummary.added +
                        selectedVersionData.changesSummary.modified +
                        selectedVersionData.changesSummary.deleted}
                    </span>
                  </div>
                </div>
              </DetectiveCard>
            </div>
          ) : (
            <DetectiveCard>
              <div className="py-12 text-center text-gray-400">
                <GitBranch className="mx-auto mb-2 h-12 w-12" />
                <p>Select a version to view details</p>
              </div>
            </DetectiveCard>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          pendingAction?.();
          setShowConfirm(false);
        }}
        title="Confirmar accion"
        message={confirmMessage}
      />
    </div>
  );
};
