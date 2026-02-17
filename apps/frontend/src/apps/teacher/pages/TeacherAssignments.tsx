/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TeacherAssignments - Enhanced page for managing assignments
 *
 * Features:
 * - Improved creation wizard with 4 steps
 * - Assignment cards with status badges
 * - Submissions modal with filters
 * - Quick actions (grade, reminder, view responses)
 * - Loading, error, and empty states
 *
 * @module apps/teacher/pages/TeacherAssignments
 */

import { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { ToastContainer, useToast } from '@shared/components/base/Toast';
import {
  Plus,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Target,
} from 'lucide-react';
import { useAssignments } from '../hooks/useAssignments';
import { useClassrooms } from '../hooks/useClassrooms';
import { ImprovedAssignmentWizard } from '../components/assignments/ImprovedAssignmentWizard';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { SubmissionsModal } from '../components/assignments/SubmissionsModal';
import { GradeSubmissionModal } from '../components/dashboard/GradeSubmissionModal';
import type { Assignment, Submission, DashboardSubmission, GradeSubmissionData } from '../types';

export default function TeacherAssignments() {
  const { toasts, showToast } = useToast();
  const {
    assignments,
    exercises,
    loading,
    error,
    createAssignment: createAssignmentAPI,
    getSubmissions: getSubmissionsAPI,
    gradeSubmission: gradeSubmissionAPI,
    sendReminder: sendReminderAPI,
    refresh,
  } = useAssignments();

  // Get classrooms data
  const { classrooms, selectedClassroom, loading: classroomsLoading } = useClassrooms();

  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Data states
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<DashboardSubmission | null>(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Get classroom ID from selected classroom or first available
  const classroomId = selectedClassroom?.id ?? classrooms[0]?.id;

  /**
   * Handle assignment creation
   */
  const handleCreateAssignment = async (data: any) => {
    try {
      await createAssignmentAPI({
        title: data.title,
        description: data.description,
        type: data.type,
        due_date: data.due_date,
        classroom_id: data.classroom_id,
        exercise_ids: data.exercise_ids,
      });
      setIsWizardOpen(false);
    } catch (err: unknown) {
      console.error('[TeacherAssignments] Error creating assignment:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Error al crear la asignación. Por favor intenta nuevamente.',
      });
    }
  };

  /**
   * View submissions for an assignment
   */
  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      setSubmissionsLoading(true);
      const data = await getSubmissionsAPI(assignment.id);
      setSubmissions(data);
      setIsSubmissionsModalOpen(true);
    } catch (err: unknown) {
      console.error('[TeacherAssignments] Error fetching submissions:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las entregas. Por favor intenta nuevamente.',
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  /**
   * Open grading modal for a submission
   */
  const handleGradeSubmission = (submission: Submission) => {
    // Calculate maxScore from assignment exercises
    const maxScore =
      selectedAssignment?.custom_points ??
      ((selectedAssignment?.exercise_ids?.length ?? 0) * 10 || 100);

    // Convert Submission to DashboardSubmission format
    const dashboardSubmission: DashboardSubmission = {
      id: submission.id,
      assignmentId: submission.assignment_id,
      assignmentTitle: selectedAssignment?.title || '',
      studentId: submission.student_id,
      studentName: submission.student_name,
      answers: [], // Answers not available in submissions list - would need separate fetch
      score: submission.score || null,
      maxScore: maxScore,
      grade: null,
      feedback: null,
      status: submission.status === 'graded' ? 'graded' : 'pending',
      submittedAt: new Date(submission.submitted_at),
      gradedAt: submission.graded_at ? new Date(submission.graded_at) : null,
      attemptNumber: 1, // Default attempt number
    };

    setSelectedSubmission(dashboardSubmission);
    setIsGradeModalOpen(true);
  };

  /**
   * Submit grade for a submission
   */
  const handleSubmitGrade = async (data: GradeSubmissionData) => {
    try {
      if (!selectedSubmission) return;

      await gradeSubmissionAPI(data.submissionId, {
        feedback: data.feedback,
        score: data.score,
        grade: data.grade,
      });

      // Refresh submissions
      if (selectedAssignment) {
        const updatedSubmissions = await getSubmissionsAPI(selectedAssignment.id);
        setSubmissions(updatedSubmissions);
      }
    } catch (err: unknown) {
      console.error('[TeacherAssignments] Error grading submission:', err);
      throw err;
    }
  };

  /**
   * Send reminder to students who haven't submitted
   * MEDIO-005: Connected to backend API
   */
  const handleSendReminder = async (assignmentId: string) => {
    try {
      const result = await sendReminderAPI(assignmentId);
      showToast({ type: 'success', title: 'Listo', message: result.message });
    } catch (err: unknown) {
      console.error('[TeacherAssignments] Error sending reminder:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Error al enviar recordatorio. Por favor intenta nuevamente.',
      });
    }
  };

  // Calculate stats
  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => a.status === 'active').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    pendingReviews: assignments.reduce((sum, a) => sum + (a.pendingReviews || 0), 0),
  };

  return (
    <>
      <ToastContainer toasts={toasts} position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <main className="detective-container py-8">
          {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-detective-text">Asignaciones</h1>
          <p className="text-detective-text-secondary">
            Crea y gestiona asignaciones para tus estudiantes
          </p>
        </div>

        {/* No Classrooms State */}
        {!classroomsLoading && classrooms.length === 0 && (
          <DetectiveCard variant="info">
            <div className="py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-20 w-20 text-yellow-500 opacity-50" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">
                No hay clases disponibles
              </h3>
              <p className="mb-6 text-detective-text-secondary">
                Necesitas crear o tener asignada al menos una clase para poder gestionar
                asignaciones.
              </p>
            </div>
          </DetectiveCard>
        )}

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-detective-text">{stats.total}</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-detective-text">{stats.active}</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-detective-text">{stats.completed}</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Pendientes Revisar</p>
                <p className="text-2xl font-bold text-detective-text">{stats.pendingReviews}</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Error State */}
        {error && !loading && (
          <DetectiveCard variant="danger" className="mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-detective-text">
                  Error al cargar asignaciones
                </h3>
                <p className="mb-4 text-detective-text-secondary">
                  No se pudieron cargar las asignaciones. Por favor, intenta nuevamente.
                </p>
                <p className="mb-4 rounded bg-red-950 p-2 font-mono text-sm text-red-400">
                  {error.message}
                </p>
                <DetectiveButton onClick={refresh} variant="primary">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Create Button & Refresh */}
        {!loading && !error && classrooms.length > 0 && (
          <div className="mb-6 flex gap-3">
            <DetectiveButton variant="primary" onClick={() => setIsWizardOpen(true)}>
              <Plus className="h-5 w-5" />
              Crear Asignación
            </DetectiveButton>
            <DetectiveButton variant="secondary" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </DetectiveButton>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">Cargando asignaciones...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && assignments.length === 0 && (
          <DetectiveCard>
            <div className="py-16 text-center">
              <Target className="mx-auto mb-4 h-20 w-20 text-detective-text-secondary opacity-50" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">No hay asignaciones</h3>
              <p className="mb-6 text-detective-text-secondary">
                Comienza creando tu primera asignación para los estudiantes
              </p>
              <DetectiveButton variant="primary" onClick={() => setIsWizardOpen(true)}>
                <Plus className="h-5 w-5" />
                Crear Primera Asignación
              </DetectiveButton>
            </div>
          </DetectiveCard>
        )}

        {/* Assignments Grid */}
        {!loading && !error && assignments.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onViewSubmissions={handleViewSubmissions}
                onSendReminder={handleSendReminder}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Assignment Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Crear Nueva Asignación"
        size="xl"
      >
        <ImprovedAssignmentWizard
          exercises={exercises}
          classroomId={classroomId}
          onComplete={handleCreateAssignment}
          onCancel={() => setIsWizardOpen(false)}
        />
      </Modal>

      {/* Submissions Modal */}
      <SubmissionsModal
        isOpen={isSubmissionsModalOpen}
        onClose={() => {
          setIsSubmissionsModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        submissions={submissions}
        loading={submissionsLoading}
        onGradeSubmission={handleGradeSubmission}
      />

      {/* Grade Submission Modal */}
      <GradeSubmissionModal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onSubmit={handleSubmitGrade}
      />
      </div>
    </>
  );
}
