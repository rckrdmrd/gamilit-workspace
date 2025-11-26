import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader, Award, FileText, Calendar } from 'lucide-react';
import type { DashboardSubmission, GradeSubmissionData } from '../../types';

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: DashboardSubmission | null;
  onSubmit: (data: GradeSubmissionData) => Promise<void>;
}

const calculateLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A':
      return 'text-green-600 bg-green-100';
    case 'B':
      return 'text-blue-600 bg-blue-100';
    case 'C':
      return 'text-yellow-600 bg-yellow-100';
    case 'D':
      return 'text-orange-600 bg-orange-100';
    case 'F':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  isOpen,
  onClose,
  submission,
  onSubmit,
}) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    if (!isSubmitting) {
      setScores({});
      setFeedback('');
      setSubmitStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  const handleScoreChange = (exerciseId: string, value: number, maxPoints: number) => {
    const clampedValue = Math.max(0, Math.min(maxPoints, value));
    setScores((prev) => ({ ...prev, [exerciseId]: clampedValue }));
  };

  const calculateTotalScore = (): number => {
    if (!submission) return 0;
    return submission.answers.reduce((total, answer) => {
      return total + (scores[answer.exerciseId] ?? 0);
    }, 0);
  };

  const totalScore = calculateTotalScore();
  const maxScore = submission?.maxScore ?? 0;
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const letterGrade = calculateLetterGrade(percentage);

  const handleSubmit = async () => {
    if (!submission) return;

    // Validate all exercises are graded
    const allGraded = submission.answers.every((answer) => scores[answer.exerciseId] !== undefined);
    if (!allGraded) {
      setErrorMessage('Please grade all exercises before submitting');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await onSubmit({
        submissionId: submission.id,
        score: totalScore,
        feedback,
        grade: letterGrade,
      });
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Grade Submission</h2>
                    <p className="text-sm text-purple-100">
                      {submission.studentName} - {submission.assignmentTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-lg p-2 transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
                {/* Student Info */}
                <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                        {submission.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Student</p>
                        <p className="font-bold text-gray-800">{submission.studentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">Submitted</p>
                        <p className="font-semibold text-gray-800">
                          {submission.submittedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">Attempt</p>
                        <p className="font-semibold text-gray-800">#{submission.attemptNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Grade Display */}
                <div className="mb-6 rounded-xl border-2 border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm text-gray-600">Current Score</p>
                      <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-bold text-gray-800">
                          {totalScore} <span className="text-xl text-gray-500">/ {maxScore}</span>
                        </p>
                        <p className="text-2xl font-semibold text-gray-600">
                          ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-xl px-8 py-4 ${getGradeColor(letterGrade)}`}>
                      <p className="text-5xl font-bold">{letterGrade}</p>
                    </div>
                  </div>
                </div>

                {/* Answers and Scoring */}
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Exercise Responses</h3>
                  {submission.answers.map((answer, index) => (
                    <div
                      key={answer.exerciseId}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                              Q{index + 1}
                            </span>
                            <h4 className="font-semibold text-gray-800">{answer.exerciseTitle}</h4>
                          </div>
                          <div className="mb-3 rounded-lg bg-white p-3">
                            <p className="text-sm text-gray-700">{answer.answer}</p>
                          </div>
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">Score:</label>
                        <input
                          type="number"
                          min="0"
                          max={answer.maxPoints}
                          value={scores[answer.exerciseId] ?? ''}
                          onChange={(e) =>
                            handleScoreChange(
                              answer.exerciseId,
                              parseFloat(e.target.value) || 0,
                              answer.maxPoints,
                            )
                          }
                          placeholder="0"
                          className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center font-bold focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-600">/ {answer.maxPoints} points</span>
                        <div className="ml-4 h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                            style={{
                              width: `${((scores[answer.exerciseId] ?? 0) / answer.maxPoints) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="Provide constructive feedback to help the student improve..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        Grade submitted successfully!
                      </p>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex flex-1 transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Submit Grade
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
