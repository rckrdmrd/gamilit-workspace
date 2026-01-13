/**
 * ExerciseHistory Component Tests
 *
 * Tests for ExerciseHistory component rendering and functionality
 * Created: 2026-01-13
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExerciseHistory } from '../ExerciseHistory';
import { exerciseAttemptsAPI } from '@/services/api/exerciseAttemptsAPI';

// Mock the API
vi.mock('@/services/api/exerciseAttemptsAPI', () => ({
  exerciseAttemptsAPI: {
    getUserAttempts: vi.fn(),
  },
}));

describe('ExerciseHistory Component', () => {
  const mockUserId = 'user-123';
  const mockExerciseId = 'exercise-456';

  const mockAttempts = [
    {
      id: 'attempt-1',
      user_id: mockUserId,
      exercise_id: mockExerciseId,
      status: 'completed',
      started_at: '2026-01-13T10:00:00Z',
      completed_at: '2026-01-13T10:02:00Z',
      time_spent: 120,
      percentage: 100,
      is_correct: true,
      xp_earned: 50,
      ml_coins_earned: 10,
      answers: { q1: 'correct' },
      created_at: '2026-01-13T10:00:00Z',
    },
    {
      id: 'attempt-2',
      user_id: mockUserId,
      exercise_id: mockExerciseId,
      status: 'completed',
      started_at: '2026-01-13T09:00:00Z',
      completed_at: '2026-01-13T09:01:30Z',
      time_spent: 90,
      percentage: 0,
      is_correct: false,
      xp_earned: 0,
      ml_coins_earned: 0,
      answers: { q1: 'wrong' },
      created_at: '2026-01-13T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching', async () => {
      // Delay the API response
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100)),
      );

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      expect(screen.getByText('Cargando historial...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no attempts', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Sin intentos aún')).toBeInTheDocument();
      });
    });

    it('should show appropriate message for empty state', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(
          screen.getByText('Este ejercicio no tiene intentos registrados todavía.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('With Attempts', () => {
    beforeEach(() => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );
    });

    it('should render attempt history', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });
    });

    it('should show statistics section', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Total Intentos')).toBeInTheDocument();
        expect(screen.getByText('Tasa de éxito')).toBeInTheDocument();
      });
    });

    it('should display correct attempt count', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('2 intento(s) registrado(s)')).toBeInTheDocument();
      });
    });

    it('should show filter buttons', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Todos/)).toBeInTheDocument();
        expect(screen.getByText(/Correctos/)).toBeInTheDocument();
        expect(screen.getByText(/Incorrectos/)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );
    });

    it('should filter to show only correct attempts', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      const correctButton = screen.getByText(/Correctos/);
      fireEvent.click(correctButton);

      // Should show only correct attempts
      await waitFor(() => {
        // The correct attempt should be visible
        expect(screen.getByText('Intento #2')).toBeInTheDocument();
      });
    });

    it('should filter to show only incorrect attempts', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      const incorrectButton = screen.getByText(/Incorrectos/);
      fireEvent.click(incorrectButton);

      // Should show only incorrect attempts
      await waitFor(() => {
        expect(screen.getByText('Intento #1')).toBeInTheDocument();
      });
    });

    it('should show all attempts when "Todos" filter is selected', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      // First filter to incorrect
      const incorrectButton = screen.getByText(/Incorrectos/);
      fireEvent.click(incorrectButton);

      // Then back to all
      const allButton = screen.getByText(/Todos/);
      fireEvent.click(allButton);

      await waitFor(() => {
        expect(screen.getByText('Intento #1')).toBeInTheDocument();
        expect(screen.getByText('Intento #2')).toBeInTheDocument();
      });
    });
  });

  describe('Expandable Details', () => {
    beforeEach(() => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );
    });

    it('should expand attempt details when clicked', async () => {
      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} showAnswers />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      // Find and click on an attempt to expand
      const attemptButton = screen.getByText('Intento #2').closest('button');
      if (attemptButton) {
        fireEvent.click(attemptButton);
      }

      // Should show expanded details
      await waitFor(() => {
        expect(screen.getByText('Respuesta dada:')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with correct parameters', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(exerciseAttemptsAPI.getUserAttempts).toHaveBeenCalledWith(mockUserId, {
          exercise_id: mockExerciseId,
        });
      });
    });

    it('should handle API error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Sin intentos aún')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate success rate correctly', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        // 1 correct out of 2 = 50%
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    it('should show total XP earned', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} />);

      await waitFor(() => {
        // Total XP: 50 + 0 = 50
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('XP Total ganado')).toBeInTheDocument();
      });
    });
  });

  describe('Props', () => {
    it('should hide answers when showAnswers is false', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );

      render(
        <ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} showAnswers={false} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      // Expand an attempt
      const attemptButton = screen.getByText('Intento #2').closest('button');
      if (attemptButton) {
        fireEvent.click(attemptButton);
      }

      // Should NOT show answer details when showAnswers is false
      // Even when expanded, the answers section should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Respuesta dada:')).not.toBeInTheDocument();
      });
    });

    it('should show answers when showAnswers is true', async () => {
      (exerciseAttemptsAPI.getUserAttempts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAttempts,
      );

      render(<ExerciseHistory exerciseId={mockExerciseId} userId={mockUserId} showAnswers={true} />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Intentos')).toBeInTheDocument();
      });

      // Expand an attempt
      const attemptButton = screen.getByText('Intento #2').closest('button');
      if (attemptButton) {
        fireEvent.click(attemptButton);
      }

      // Should show answer details when showAnswers is true
      await waitFor(() => {
        expect(screen.getByText('Respuesta dada:')).toBeInTheDocument();
      });
    });
  });
});
