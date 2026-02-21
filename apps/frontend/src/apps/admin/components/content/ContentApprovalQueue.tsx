import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useApprovals } from '../../hooks/useContentManagement';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

export const ContentApprovalQueue: React.FC = () => {
  const { approvals, loading, approve, reject } = useApprovals();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await reject(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      console.error('Rejection failed:', error);
      toast.error('Rejection failed');
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <FileText className="h-5 w-5" />;
      case 'media':
        return <ImageIcon className="h-5 w-5" />;
      case 'content':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-detective-orange border-t-transparent"></div>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-detective-subtitle">Content Approval Queue</h2>
            <p className="text-detective-small text-gray-400">{pendingCount} pending approvals</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetectiveCard className="border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-detective-small text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-detective-small text-gray-400">Approved</p>
              <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard className="border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-detective-small text-gray-400">Rejected</p>
              <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Approval Queue */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <DetectiveCard>
            <div className="py-12 text-center text-gray-400">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
              <p>No items in approval queue</p>
            </div>
          </DetectiveCard>
        ) : (
          approvals.map((item) => (
            <DetectiveCard
              key={item.id}
              className={
                item.status === 'pending'
                  ? 'border border-yellow-500/30'
                  : item.status === 'approved'
                    ? 'border border-green-500/30 opacity-60'
                    : 'border border-red-500/30 opacity-60'
              }
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div
                  className={`rounded-lg p-3 ${
                    item.type === 'exercise'
                      ? 'bg-blue-500/20 text-blue-500'
                      : item.type === 'media'
                        ? 'bg-purple-500/20 text-purple-500'
                        : 'bg-orange-500/20 text-orange-500'
                  }`}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-detective-base font-semibold">{item.title}</h4>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            item.status === 'pending'
                              ? 'border border-yellow-500/30 bg-yellow-500/20 text-yellow-500'
                              : item.status === 'approved'
                                ? 'border border-green-500/30 bg-green-500/20 text-green-500'
                                : 'border border-red-500/30 bg-red-500/20 text-red-500'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-detective-small text-gray-400">
                        Submitted by{' '}
                        <span className="text-detective-orange">{item.submittedBy}</span> on{' '}
                        {item.submittedAt
                          ? new Date(item.submittedAt).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        item.type === 'exercise'
                          ? 'bg-blue-500/20 text-blue-500'
                          : item.type === 'media'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-orange-500/20 text-orange-500'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-3 rounded-lg bg-detective-bg-secondary p-3">
                    <pre className="text-detective-small whitespace-pre-wrap text-gray-400">
                      {JSON.stringify(item.content, null, 2).slice(0, 200)}
                      {JSON.stringify(item.content).length > 200 && '...'}
                    </pre>
                  </div>

                  {/* Actions */}
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      {rejectingId === item.id ? (
                        <div className="flex flex-1 gap-2">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            className="input-detective flex-1"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                          />
                          <DetectiveButton
                            variant="primary"
                            onClick={() => handleReject(item.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Confirm
                          </DetectiveButton>
                          <DetectiveButton variant="primary" onClick={() => setRejectingId(null)}>
                            Cancel
                          </DetectiveButton>
                        </div>
                      ) : (
                        <>
                          <DetectiveButton
                            variant="green"
                            icon={<CheckCircle className="h-4 w-4" />}
                            onClick={() => handleApprove(item.id)}
                          >
                            Approve
                          </DetectiveButton>
                          <DetectiveButton
                            variant="primary"
                            icon={<XCircle className="h-4 w-4" />}
                            onClick={() => setRejectingId(item.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Reject
                          </DetectiveButton>
                        </>
                      )}
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {item.status === 'rejected' && (
                    <div className="text-detective-small rounded border border-red-500/30 bg-red-500/10 p-2 text-red-400">
                      Rejection reason:{' '}
                      {typeof item.content?.rejectionReason === 'string'
                        ? item.content.rejectionReason
                        : 'No reason provided'}
                    </div>
                  )}
                </div>
              </div>
            </DetectiveCard>
          ))
        )}
      </div>

      {/* Approval History */}
      {approvals.filter((a) => a.status !== 'pending').length > 0 && (
        <DetectiveCard>
          <h3 className="text-detective-subtitle mb-4">Approval History</h3>
          <div className="space-y-2">
            {approvals
              .filter((a) => a.status !== 'pending')
              .slice(0, 5)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-detective-bg-secondary p-3"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-detective-base">{item.title}</p>
                      <p className="text-detective-small text-gray-400">by {item.submittedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        item.status === 'approved' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </DetectiveCard>
      )}
    </div>
  );
};
