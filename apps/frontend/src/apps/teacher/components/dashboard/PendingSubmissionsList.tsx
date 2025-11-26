import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  FileCheck,
  Eye,
  CheckCircle,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { DashboardSubmission } from '../../types';

interface PendingSubmissionsListProps {
  submissions: DashboardSubmission[];
  loading?: boolean;
  onGradeSubmission: (submissionId: string) => void;
  onViewSubmission: (submissionId: string) => void;
}

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const getPriorityLevel = (submittedAt: Date): 'high' | 'medium' | 'low' => {
  const hours = (new Date().getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
  if (hours > 72) return 'high'; // Over 3 days
  if (hours > 24) return 'medium'; // Over 1 day
  return 'low';
};

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-orange-500 bg-orange-50';
    case 'low':
      return 'border-l-blue-500 bg-blue-50';
  }
};

const SubmissionCard: React.FC<{
  submission: DashboardSubmission;
  index: number;
  onGrade: (id: string) => void;
  onView: (id: string) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ submission, index, onGrade, onView, selected, onSelect }) => {
  const priority = getPriorityLevel(submission.submittedAt);
  const priorityColor = getPriorityColor(priority);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`rounded-lg border-l-4 bg-white ${priorityColor} relative border border-gray-200 p-5 transition-all duration-300 hover:shadow-lg`}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-4 top-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(submission.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="ml-8">
        {/* Student Info */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-white">
              {submission.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{submission.studentName}</h3>
              <p className="text-sm text-gray-500">Attempt #{submission.attemptNumber}</p>
            </div>
          </div>

          {/* Priority Badge */}
          {priority === 'high' && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-3 w-3" />
              Urgent
            </span>
          )}
        </div>

        {/* Assignment Info */}
        <div className="mb-3 rounded-lg bg-gray-50 p-3">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{submission.assignmentTitle}</p>
              <p className="mt-1 text-xs text-gray-500">
                {submission.answers.length} exercises completed
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{getTimeAgo(submission.submittedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {submission.submittedAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="mb-1 text-xs font-medium text-blue-600">Questions</p>
            <p className="text-lg font-bold text-blue-700">{submission.answers.length}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="mb-1 text-xs font-medium text-purple-600">Max Score</p>
            <p className="text-lg font-bold text-purple-700">{submission.maxScore} pts</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGrade(submission.id)}
            className="flex flex-1 transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CheckCircle className="h-4 w-4" />
            Grade Now
          </button>
          <button
            onClick={() => onView(submission.id)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 py-12 text-center"
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <FileCheck className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-800">All Caught Up!</h3>
      <p className="text-sm text-gray-600">No pending submissions to grade at the moment</p>
    </motion.div>
  );
};

const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse rounded-lg border border-l-4 border-gray-200 border-l-gray-300 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <div className="mb-1 h-4 w-48 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-gray-200" />
        <div className="h-10 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
};

export const PendingSubmissionsList: React.FC<PendingSubmissionsListProps> = ({
  submissions,
  loading = false,
  onGradeSubmission,
  onViewSubmission,
}) => {
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'oldest' | 'newest'>('oldest');

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === 'oldest') {
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    } else {
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    }
  });

  const handleSelectSubmission = (id: string) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubmissions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map((s) => s.id)));
    }
  };

  const handleBulkGrade = () => {
    if (selectedSubmissions.size === 0) return;
    // In a real implementation, this would open a bulk grading modal
    console.log('Bulk grading:', Array.from(selectedSubmissions));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Header with Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedSubmissions.size === submissions.length}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <h3 className="text-lg font-bold text-gray-800">
            Pending Submissions ({submissions.length})
          </h3>
          {selectedSubmissions.size > 0 && (
            <span className="text-sm font-medium text-blue-600">
              {selectedSubmissions.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedSubmissions.size > 0 && (
            <button
              onClick={handleBulkGrade}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4" />
              Grade Selected
            </button>
          )}
          <button
            onClick={() => setSortBy('oldest')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              sortBy === 'oldest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Oldest First
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              sortBy === 'newest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Newest First
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedSubmissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              index={index}
              onGrade={onGradeSubmission}
              onView={onViewSubmission}
              selected={selectedSubmissions.has(submission.id)}
              onSelect={handleSelectSubmission}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
