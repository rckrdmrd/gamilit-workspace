import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useExercises, Exercise } from '../../hooks/useContentManagement';
import { ExercisePreviewModal } from './ExercisePreviewModal';
import { Plus, Edit, Copy, Trash2, Eye, Save, X } from 'lucide-react';

export const ExerciseContentEditor: React.FC = () => {
  const { exercises, loading, createExercise, updateExercise, deleteExercise, duplicateExercise } =
    useExercises();
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const handleCreate = () => {
    setEditingExercise({
      title: '',
      description: '',
      difficulty: 'facil',
      points: 100,
      type: 'multiple-choice',
      instructions: '',
      content: {},
      status: 'draft',
    });
    setPreviewMode(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!editingExercise) return;

    try {
      if (editingExercise.id) {
        await updateExercise(editingExercise.id, editingExercise);
      } else {
        await createExercise(editingExercise);
      }
      setEditingExercise(null);
    } catch (error) {
      console.error('Failed to save exercise:', error);
      toast.error('Error al guardar el ejercicio');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExercise(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      toast.error('Error al eliminar el ejercicio');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateExercise(id);
    } catch (error) {
      console.error('Failed to duplicate exercise:', error);
      toast.error('Error al duplicar el ejercicio');
    }
  };

  if (loading && !editingExercise) {
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
        <h2 className="text-detective-subtitle">Exercise Content Editor</h2>
        <DetectiveButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreate}
        >
          New Exercise
        </DetectiveButton>
      </div>

      {/* Editor Modal */}
      {editingExercise && (
        <DetectiveCard className="border-2 border-detective-orange">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-detective-subtitle">
              {editingExercise.id ? 'Edit Exercise' : 'Create New Exercise'}
            </h3>
            <div className="flex items-center gap-2">
              <DetectiveButton
                variant="blue"
                icon={previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </DetectiveButton>
              <DetectiveButton
                variant="green"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
              >
                Save
              </DetectiveButton>
              <DetectiveButton
                variant="primary"
                icon={<X className="h-4 w-4" />}
                onClick={() => setEditingExercise(null)}
              >
                Cancel
              </DetectiveButton>
            </div>
          </div>

          {previewMode ? (
            <div className="rounded-lg bg-detective-bg-secondary p-6">
              <h4 className="mb-2 text-xl font-bold">
                {editingExercise.title || 'Untitled Exercise'}
              </h4>
              <p className="mb-4 text-gray-400">{editingExercise.description}</p>
              <div className="mb-4 flex gap-2">
                <span className="rounded-lg bg-detective-orange/20 px-3 py-1 text-sm text-detective-orange">
                  {editingExercise.difficulty}
                </span>
                <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-500">
                  {editingExercise.points} points
                </span>
              </div>
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: editingExercise.instructions || '' }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-detective-small mb-2 block text-gray-400">Title *</label>
                <input
                  type="text"
                  className="input-detective"
                  value={editingExercise.title || ''}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, title: e.target.value })
                  }
                  placeholder="Exercise title..."
                />
              </div>

              <div>
                <label className="text-detective-small mb-2 block text-gray-400">Type</label>
                <select
                  className="input-detective"
                  value={editingExercise.type || 'multiple-choice'}
                  onChange={(e) => setEditingExercise({ ...editingExercise, type: e.target.value })}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="code">Code Exercise</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label className="text-detective-small mb-2 block text-gray-400">Difficulty</label>
                <select
                  className="input-detective"
                  value={editingExercise.difficulty || 'facil'}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      difficulty: e.target.value as 'facil' | 'medio' | 'dificil' | 'experto',
                    })
                  }
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                  <option value="experto">Experto</option>
                </select>
              </div>

              <div>
                <label className="text-detective-small mb-2 block text-gray-400">Points</label>
                <input
                  type="number"
                  className="input-detective"
                  value={editingExercise.points || 100}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, points: parseInt(e.target.value) })
                  }
                  min="0"
                  step="10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-detective-small mb-2 block text-gray-400">Description</label>
                <textarea
                  className="input-detective"
                  rows={3}
                  value={editingExercise.description || ''}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, description: e.target.value })
                  }
                  placeholder="Brief description..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-detective-small mb-2 block text-gray-400">
                  Instructions (HTML supported)
                </label>
                <textarea
                  className="input-detective font-mono text-sm"
                  rows={8}
                  value={editingExercise.instructions || ''}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, instructions: e.target.value })
                  }
                  placeholder="<p>Complete the following exercise...</p>"
                />
              </div>

              <div>
                <label className="text-detective-small mb-2 block text-gray-400">Status</label>
                <select
                  className="input-detective"
                  value={editingExercise.status || 'draft'}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      status: e.target.value as 'draft' | 'published' | 'archived',
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </DetectiveCard>
      )}

      {/* Exercise List */}
      <DetectiveCard>
        <h3 className="text-detective-subtitle mb-4">All Exercises ({exercises.length})</h3>
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/70"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="mb-1 text-detective-base font-semibold">{exercise.title}</h4>
                  <p className="text-detective-small mb-2 text-gray-400">{exercise.description}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        exercise.difficulty === 'facil'
                          ? 'bg-green-500/20 text-green-500'
                          : exercise.difficulty === 'medio'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : exercise.difficulty === 'dificil'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-purple-500/20 text-purple-500'
                      }`}
                    >
                      {exercise.difficulty}
                    </span>
                    <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-500">
                      {exercise.points} pts
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        exercise.status === 'published'
                          ? 'bg-green-500/20 text-green-500'
                          : exercise.status === 'draft'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-orange-500/20 text-orange-500'
                      }`}
                    >
                      {exercise.status}
                    </span>
                    <span className="text-xs text-gray-500">{exercise.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewExercise(exercise)}
                    className="rounded p-2 text-detective-orange transition-colors hover:bg-detective-orange/20"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="rounded p-2 text-blue-500 transition-colors hover:bg-blue-500/20"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(exercise.id)}
                    className="rounded p-2 text-purple-500 transition-colors hover:bg-purple-500/20"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(exercise.id)}
                    className="rounded p-2 text-red-500 transition-colors hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showDeleteConfirm === exercise.id && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="mb-3 text-sm text-red-500">
                    Are you sure you want to delete this exercise? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <DetectiveButton
                      variant="primary"
                      onClick={() => handleDelete(exercise.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Confirm Delete
                    </DetectiveButton>
                    <DetectiveButton variant="primary" onClick={() => setShowDeleteConfirm(null)}>
                      Cancel
                    </DetectiveButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DetectiveCard>

      {/* Preview Modal */}
      <ExercisePreviewModal
        isOpen={previewExercise !== null}
        exercise={previewExercise}
        onClose={() => setPreviewExercise(null)}
      />
    </div>
  );
};
