# Frontend Integration Guide: Submissions DTO (BE-003)

**Updated:** 2025-11-24
**Backend Endpoint:** `GET /api/admin/progress/students/:studentId`
**DTO:** `RecentSubmissionDto`

---

## Quick Reference

### TypeScript Interface for Frontend

```typescript
/**
 * Recent Submission DTO
 * Includes gamification data, feedback, and grading information
 */
interface RecentSubmission {
  // Basic Submission Info
  id: string;
  exercise_id: string;
  exercise_title: string;
  exercise_type: string;

  // Scoring & Correctness
  score: number;
  max_score: number;
  is_correct: boolean;

  // Gamification Rewards
  xp_earned: number;              // NEW: XP points earned
  ml_coins_earned: number;        // NEW: ML Coins earned
  ml_coins_spent: number;         // NEW: ML Coins spent on comodines

  // Feedback & Grading
  feedback?: string | null;       // NEW: System or teacher feedback
  grading_status: GradingStatus;  // NEW: 'pending' | 'auto_graded' | 'manually_graded'
  graded_by?: string | null;      // NEW: Teacher ID (currently null)
  graded_at?: string | null;      // NEW: Grading timestamp

  // Comodines & Hints
  comodines_used: string[];       // NEW: Array of comodin types used
  hints_used: number;             // NEW: Number of hints used

  // Time & Attempt Tracking
  time_spent_seconds?: number | null;
  attempt_number: number;

  // Status & Timestamps
  status: string;                 // 'draft' | 'submitted' | 'graded' | 'reviewed'
  submitted_at: string;           // ISO 8601 timestamp
}

type GradingStatus = 'pending' | 'auto_graded' | 'manually_graded';
```

---

## API Response Example

```json
{
  "user_info": {
    "id": "user-123",
    "display_name": "María García",
    "email": "maria@example.com",
    "status": "ACTIVE",
    "level": 5,
    "total_xp": 1250,
    "ml_coins": 450,
    "exercises_completed": 45,
    "modules_completed": 3,
    "streak_days": 7,
    "max_streak": 14,
    "achievements_earned": 8,
    "last_activity_at": "2025-11-24T10:30:00Z"
  },
  "modules_progress": [ /* ... */ ],
  "recent_submissions": [
    {
      "id": "sub-123",
      "exercise_id": "ex-456",
      "exercise_title": "Suma de números de dos dígitos",
      "exercise_type": "multiple_choice",
      "score": 85,
      "max_score": 100,
      "is_correct": true,
      "xp_earned": 50,
      "ml_coins_earned": 10,
      "ml_coins_spent": 5,
      "feedback": "¡Excelente trabajo! Solo revisa el paso 3.",
      "grading_status": "manually_graded",
      "graded_by": null,
      "graded_at": "2025-11-24T10:35:00Z",
      "comodines_used": ["pistas", "vision_lectora"],
      "hints_used": 2,
      "time_spent_seconds": 120,
      "attempt_number": 1,
      "status": "graded",
      "submitted_at": "2025-11-24T10:30:00Z"
    }
  ]
}
```

---

## Frontend Components - Usage Examples

### 1. Display Submission Card

```tsx
import { RecentSubmission } from '@/types/admin';

interface SubmissionCardProps {
  submission: RecentSubmission;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const getGradingBadge = (status: string) => {
    const badges = {
      pending: { color: 'yellow', text: 'Pendiente' },
      auto_graded: { color: 'blue', text: 'Auto-calificado' },
      manually_graded: { color: 'green', text: 'Calificado por profesor' }
    };
    return badges[status] || badges.pending;
  };

  const badge = getGradingBadge(submission.grading_status);

  return (
    <div className="submission-card">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3>{submission.exercise_title}</h3>
        <Badge color={badge.color}>{badge.text}</Badge>
      </div>

      {/* Score */}
      <div className="score-section">
        <ScoreCircle
          score={submission.score}
          maxScore={submission.max_score}
          isCorrect={submission.is_correct}
        />
      </div>

      {/* Gamification Rewards */}
      <div className="rewards-section">
        <RewardBadge
          icon="⭐"
          value={submission.xp_earned}
          label="XP Ganado"
        />
        <RewardBadge
          icon="🪙"
          value={submission.ml_coins_earned}
          label="ML Coins Ganados"
        />
        {submission.ml_coins_spent > 0 && (
          <RewardBadge
            icon="💸"
            value={submission.ml_coins_spent}
            label="ML Coins Gastados"
            variant="expense"
          />
        )}
      </div>

      {/* Comodines Used */}
      {submission.comodines_used.length > 0 && (
        <div className="comodines-section">
          <p className="text-sm text-gray-600">Comodines usados:</p>
          <div className="flex gap-2">
            {submission.comodines_used.map((comodin) => (
              <ComodinBadge key={comodin} type={comodin} />
            ))}
          </div>
        </div>
      )}

      {/* Hints Used */}
      {submission.hints_used > 0 && (
        <div className="hints-section">
          <p className="text-sm text-gray-600">
            💡 {submission.hints_used} pista{submission.hints_used > 1 ? 's' : ''} usada{submission.hints_used > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Feedback */}
      {submission.feedback && (
        <div className="feedback-section">
          <p className="text-sm font-semibold text-gray-700">Retroalimentación:</p>
          <p className="text-sm text-gray-600">{submission.feedback}</p>
        </div>
      )}

      {/* Meta Info */}
      <div className="meta-section">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Intento #{submission.attempt_number}</span>
          <span>{formatRelativeTime(submission.submitted_at)}</span>
        </div>
        {submission.time_spent_seconds && (
          <p className="text-xs text-gray-500">
            ⏱️ Tiempo: {formatDuration(submission.time_spent_seconds)}
          </p>
        )}
      </div>
    </div>
  );
};
```

### 2. Submissions Table (Admin Dashboard)

```tsx
import { RecentSubmission } from '@/types/admin';

interface SubmissionsTableProps {
  submissions: RecentSubmission[];
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions }) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Ejercicio</th>
          <th>Puntaje</th>
          <th>XP</th>
          <th>ML Coins</th>
          <th>Comodines</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => (
          <tr key={sub.id}>
            <td>
              <div>
                <p className="font-medium">{sub.exercise_title}</p>
                <p className="text-sm text-gray-500">{sub.exercise_type}</p>
              </div>
            </td>
            <td>
              <ScoreBadge
                score={sub.score}
                maxScore={sub.max_score}
                isCorrect={sub.is_correct}
              />
            </td>
            <td>
              <span className="text-purple-600 font-semibold">
                +{sub.xp_earned} XP
              </span>
            </td>
            <td>
              <div>
                <span className="text-green-600">
                  +{sub.ml_coins_earned}
                </span>
                {sub.ml_coins_spent > 0 && (
                  <span className="text-red-600 ml-2">
                    -{sub.ml_coins_spent}
                  </span>
                )}
              </div>
            </td>
            <td>
              {sub.comodines_used.length > 0 ? (
                <div className="flex gap-1">
                  {sub.comodines_used.map((c) => (
                    <ComodinIcon key={c} type={c} size="sm" />
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td>
              <GradingStatusBadge status={sub.grading_status} />
            </td>
            <td>
              <time dateTime={sub.submitted_at}>
                {formatDate(sub.submitted_at)}
              </time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 3. Statistics Summary

```tsx
import { RecentSubmission } from '@/types/admin';

interface SubmissionsStatsProps {
  submissions: RecentSubmission[];
}

export const SubmissionsStats: React.FC<SubmissionsStatsProps> = ({ submissions }) => {
  const stats = {
    totalXP: submissions.reduce((sum, s) => sum + s.xp_earned, 0),
    totalCoinsEarned: submissions.reduce((sum, s) => sum + s.ml_coins_earned, 0),
    totalCoinsSpent: submissions.reduce((sum, s) => sum + s.ml_coins_spent, 0),
    comodinesUsed: submissions.reduce((sum, s) => sum + s.comodines_used.length, 0),
    hintsUsed: submissions.reduce((sum, s) => sum + s.hints_used, 0),
    avgScore: submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length,
    correctCount: submissions.filter(s => s.is_correct).length,
    pendingGrading: submissions.filter(s => s.grading_status === 'pending').length,
  };

  return (
    <div className="stats-grid">
      <StatCard
        icon="⭐"
        value={stats.totalXP}
        label="XP Total Ganado"
        color="purple"
      />
      <StatCard
        icon="🪙"
        value={stats.totalCoinsEarned}
        label="ML Coins Ganados"
        color="green"
      />
      <StatCard
        icon="💸"
        value={stats.totalCoinsSpent}
        label="ML Coins Gastados"
        color="red"
      />
      <StatCard
        icon="🎯"
        value={`${stats.correctCount}/${submissions.length}`}
        label="Respuestas Correctas"
        color="blue"
      />
      <StatCard
        icon="🎁"
        value={stats.comodinesUsed}
        label="Comodines Usados"
        color="orange"
      />
      <StatCard
        icon="💡"
        value={stats.hintsUsed}
        label="Pistas Usadas"
        color="yellow"
      />
      <StatCard
        icon="⏳"
        value={stats.pendingGrading}
        label="Pendientes de Calificar"
        color="gray"
      />
      <StatCard
        icon="📊"
        value={`${stats.avgScore.toFixed(1)}%`}
        label="Promedio de Puntaje"
        color="indigo"
      />
    </div>
  );
};
```

---

## Helper Functions

```typescript
// Format duration from seconds to human-readable
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

// Format relative time
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-MX');
};

// Get comodin display name
export const getComodinName = (type: string): string => {
  const names: Record<string, string> = {
    pistas: 'Pistas',
    vision_lectora: 'Visión Lectora',
    segunda_oportunidad: 'Segunda Oportunidad',
  };
  return names[type] || type;
};

// Get comodin icon
export const getComodinIcon = (type: string): string => {
  const icons: Record<string, string> = {
    pistas: '💡',
    vision_lectora: '👁️',
    segunda_oportunidad: '🔄',
  };
  return icons[type] || '🎁';
};
```

---

## Filtering & Sorting

```typescript
// Filter submissions by grading status
export const filterByGradingStatus = (
  submissions: RecentSubmission[],
  status: GradingStatus
): RecentSubmission[] => {
  return submissions.filter(s => s.grading_status === status);
};

// Filter submissions that used comodines
export const filterWithComodines = (
  submissions: RecentSubmission[]
): RecentSubmission[] => {
  return submissions.filter(s => s.comodines_used.length > 0);
};

// Sort by XP earned (descending)
export const sortByXP = (submissions: RecentSubmission[]): RecentSubmission[] => {
  return [...submissions].sort((a, b) => b.xp_earned - a.xp_earned);
};

// Sort by ML Coins net (earned - spent, descending)
export const sortByCoinsNet = (submissions: RecentSubmission[]): RecentSubmission[] => {
  return [...submissions].sort((a, b) => {
    const netA = a.ml_coins_earned - a.ml_coins_spent;
    const netB = b.ml_coins_earned - b.ml_coins_spent;
    return netB - netA;
  });
};
```

---

## API Client Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface StudentProgressResponse {
  user_info: UserInfo;
  modules_progress: ModuleProgress[];
  recent_submissions: RecentSubmission[];
}

export const useStudentProgress = (studentId: string) => {
  return useQuery({
    queryKey: ['admin', 'progress', 'students', studentId],
    queryFn: async () => {
      const response = await apiClient.get<StudentProgressResponse>(
        `/api/admin/progress/students/${studentId}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage in component
const StudentProgressPage = ({ studentId }: { studentId: string }) => {
  const { data, isLoading, error } = useStudentProgress(studentId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <UserInfoCard userInfo={data.user_info} />
      <ModulesProgress modules={data.modules_progress} />
      <SubmissionsTable submissions={data.recent_submissions} />
    </div>
  );
};
```

---

## Validation & Type Guards

```typescript
// Type guard to check if submission is manually graded
export const isManuallyGraded = (submission: RecentSubmission): boolean => {
  return submission.grading_status === 'manually_graded';
};

// Type guard to check if submission has feedback
export const hasFeedback = (submission: RecentSubmission): submission is RecentSubmission & { feedback: string } => {
  return submission.feedback !== null && submission.feedback !== undefined;
};

// Type guard to check if submission used comodines
export const usedComodines = (submission: RecentSubmission): boolean => {
  return submission.comodines_used.length > 0;
};

// Validate submission data
export const validateSubmission = (submission: any): submission is RecentSubmission => {
  return (
    typeof submission.id === 'string' &&
    typeof submission.exercise_id === 'string' &&
    typeof submission.xp_earned === 'number' &&
    typeof submission.ml_coins_earned === 'number' &&
    typeof submission.ml_coins_spent === 'number' &&
    Array.isArray(submission.comodines_used) &&
    typeof submission.hints_used === 'number' &&
    ['pending', 'auto_graded', 'manually_graded'].includes(submission.grading_status)
  );
};
```

---

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { SubmissionCard } from './SubmissionCard';

const mockSubmission: RecentSubmission = {
  id: 'sub-123',
  exercise_id: 'ex-456',
  exercise_title: 'Test Exercise',
  exercise_type: 'multiple_choice',
  score: 85,
  max_score: 100,
  is_correct: true,
  xp_earned: 50,
  ml_coins_earned: 10,
  ml_coins_spent: 5,
  feedback: 'Great job!',
  grading_status: 'manually_graded',
  graded_by: null,
  graded_at: '2025-11-24T10:35:00Z',
  comodines_used: ['pistas', 'vision_lectora'],
  hints_used: 2,
  time_spent_seconds: 120,
  attempt_number: 1,
  status: 'graded',
  submitted_at: '2025-11-24T10:30:00Z',
};

describe('SubmissionCard', () => {
  it('should display gamification rewards', () => {
    render(<SubmissionCard submission={mockSubmission} />);

    expect(screen.getByText(/50.*XP/i)).toBeInTheDocument();
    expect(screen.getByText(/10.*ML Coins/i)).toBeInTheDocument();
  });

  it('should display comodines used', () => {
    render(<SubmissionCard submission={mockSubmission} />);

    expect(screen.getByText(/pistas/i)).toBeInTheDocument();
    expect(screen.getByText(/vision_lectora/i)).toBeInTheDocument();
  });

  it('should display feedback when available', () => {
    render(<SubmissionCard submission={mockSubmission} />);

    expect(screen.getByText(/Great job!/i)).toBeInTheDocument();
  });
});
```

---

## Notes

1. **All new fields are now available** in the API response
2. **Backward compatible** - existing code will continue to work
3. **Type-safe** - Use the TypeScript interface for full type checking
4. **Performance** - Data includes pre-computed grading_status
5. **Future-proof** - `graded_by` field is prepared for future use

---

**Last Updated:** 2025-11-24
**Backend Version:** BE-003
**Contact:** Backend Team
