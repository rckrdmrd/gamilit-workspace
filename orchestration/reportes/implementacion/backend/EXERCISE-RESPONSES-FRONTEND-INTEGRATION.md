# Exercise Responses API - Frontend Integration Guide

**Module:** Teacher - Exercise Responses
**Date:** 2025-11-24
**Status:** Ready for Frontend Integration

---

## 🎯 Quick Reference

### Base Endpoint
```
/api/teacher/attempts
```

### Authentication
All endpoints require:
- JWT Bearer token
- Role: ADMIN_TEACHER or SUPER_ADMIN

---

## 📋 Available Endpoints

### 1. Get Paginated Attempts List

**Endpoint:** `GET /api/teacher/attempts`

**Query Parameters:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  student_id?: string;     // UUID
  exercise_id?: string;    // UUID
  module_id?: string;      // UUID
  classroom_id?: string;   // UUID
  from_date?: string;      // ISO 8601 (e.g., "2024-01-01T00:00:00Z")
  to_date?: string;        // ISO 8601
  is_correct?: boolean;    // true or false
  sort_by?: 'submitted_at' | 'score' | 'time';  // Default: 'submitted_at'
  sort_order?: 'asc' | 'desc';  // Default: 'desc'
}
```

**Response:**
```typescript
{
  data: AttemptResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

**Example Request:**
```typescript
const response = await fetch('/api/teacher/attempts?page=1&limit=20&is_correct=true', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 2. Get Attempt Detail

**Endpoint:** `GET /api/teacher/attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt UUID

**Response:**
```typescript
{
  id: string;
  student_id: string;
  student_name: string;
  exercise_id: string;
  exercise_title: string;
  module_name: string;
  attempt_number: number;
  submitted_answers: object;
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  hints_used: number;
  comodines_used: string[];
  xp_earned: number;
  ml_coins_earned: number;
  submitted_at: string;
  // Additional fields for detail:
  correct_answer: object;
  exercise_type: string;
  max_score: number;
}
```

**Example Request:**
```typescript
const response = await fetch(`/api/teacher/attempts/${attemptId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### 3. Get Student Attempts

**Endpoint:** `GET /api/teacher/attempts/student/:studentId`

**Parameters:**
- `studentId` (path parameter) - Student profile UUID

**Response:**
```typescript
AttemptResponseDto[]  // Array of attempts
```

**Example Request:**
```typescript
const response = await fetch(`/api/teacher/attempts/student/${studentId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### 4. Get Exercise Responses

**Endpoint:** `GET /api/teacher/exercises/:exerciseId/responses`

**Parameters:**
- `exerciseId` (path parameter) - Exercise UUID

**Response:**
```typescript
{
  data: AttemptResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

**Example Request:**
```typescript
const response = await fetch(`/api/teacher/exercises/${exerciseId}/responses`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🎨 TypeScript Interfaces

```typescript
// apps/frontend/src/apps/teacher/types/exercise-responses.types.ts

export enum AttemptSortField {
  SUBMITTED_AT = 'submitted_at',
  SCORE = 'score',
  TIME = 'time',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface GetAttemptsQuery {
  page?: number;
  limit?: number;
  student_id?: string;
  exercise_id?: string;
  module_id?: string;
  classroom_id?: string;
  from_date?: string;
  to_date?: string;
  is_correct?: boolean;
  sort_by?: AttemptSortField;
  sort_order?: SortOrder;
}

export interface AttemptResponse {
  id: string;
  student_id: string;
  student_name: string;
  exercise_id: string;
  exercise_title: string;
  module_name: string;
  attempt_number: number;
  submitted_answers: Record<string, any>;
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  hints_used: number;
  comodines_used: string[];
  xp_earned: number;
  ml_coins_earned: number;
  submitted_at: string;
}

export interface AttemptDetail extends AttemptResponse {
  correct_answer: Record<string, any>;
  exercise_type: string;
  max_score: number;
}

export interface AttemptsListResponse {
  data: AttemptResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

---

## 🔧 Suggested React Hooks

### useExerciseResponses Hook

```typescript
// apps/frontend/src/apps/teacher/hooks/useExerciseResponses.ts

import { useState, useEffect } from 'react';
import { exerciseResponsesApi } from '@/services/api/teacher/exerciseResponsesApi';
import type { GetAttemptsQuery, AttemptsListResponse } from '../types/exercise-responses.types';

export const useExerciseResponses = (filters: GetAttemptsQuery) => {
  const [data, setData] = useState<AttemptsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const result = await exerciseResponsesApi.getAttempts(filters);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
};
```

### useStudentAttempts Hook

```typescript
export const useStudentAttempts = (studentId: string) => {
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const result = await exerciseResponsesApi.getStudentAttempts(studentId);
        setAttempts(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAttempts();
    }
  }, [studentId]);

  return { attempts, loading, error };
};
```

### useAttemptDetail Hook

```typescript
export const useAttemptDetail = (attemptId: string) => {
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const result = await exerciseResponsesApi.getAttemptDetail(attemptId);
        setAttempt(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId]);

  return { attempt, loading, error };
};
```

---

## 🌐 API Client Implementation

```typescript
// apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts

import { apiClient } from '../apiClient';
import type {
  GetAttemptsQuery,
  AttemptsListResponse,
  AttemptResponse,
  AttemptDetail,
} from '@/apps/teacher/types/exercise-responses.types';

export const exerciseResponsesApi = {
  /**
   * Get paginated list of attempts with filters
   */
  async getAttempts(query: GetAttemptsQuery): Promise<AttemptsListResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/teacher/attempts?${params.toString()}`);
    return response.data;
  },

  /**
   * Get attempt detail by ID
   */
  async getAttemptDetail(attemptId: string): Promise<AttemptDetail> {
    const response = await apiClient.get(`/teacher/attempts/${attemptId}`);
    return response.data;
  },

  /**
   * Get all attempts by student
   */
  async getStudentAttempts(studentId: string): Promise<AttemptResponse[]> {
    const response = await apiClient.get(`/teacher/attempts/student/${studentId}`);
    return response.data;
  },

  /**
   * Get all responses for an exercise
   */
  async getExerciseResponses(exerciseId: string): Promise<AttemptsListResponse> {
    const response = await apiClient.get(`/teacher/exercises/${exerciseId}/responses`);
    return response.data;
  },
};
```

---

## 🎨 Example React Components

### AttemptsList Component

```typescript
// apps/frontend/src/apps/teacher/components/attempts/AttemptsList.tsx

import React from 'react';
import { useExerciseResponses } from '@/apps/teacher/hooks/useExerciseResponses';
import { AttemptCard } from './AttemptCard';

interface AttemptsListProps {
  classroomId?: string;
  studentId?: string;
}

export const AttemptsList: React.FC<AttemptsListProps> = ({
  classroomId,
  studentId,
}) => {
  const [page, setPage] = React.useState(1);

  const { data, loading, error } = useExerciseResponses({
    page,
    limit: 20,
    classroom_id: classroomId,
    student_id: studentId,
    sort_by: 'submitted_at',
    sort_order: 'desc',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Student Attempts ({data.total})</h2>
      <div className="attempts-grid">
        {data.data.map((attempt) => (
          <AttemptCard key={attempt.id} attempt={attempt} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={data.total_pages}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### AttemptCard Component

```typescript
// apps/frontend/src/apps/teacher/components/attempts/AttemptCard.tsx

import React from 'react';
import type { AttemptResponse } from '@/apps/teacher/types/exercise-responses.types';

interface AttemptCardProps {
  attempt: AttemptResponse;
}

export const AttemptCard: React.FC<AttemptCardProps> = ({ attempt }) => {
  return (
    <div className={`attempt-card ${attempt.is_correct ? 'correct' : 'incorrect'}`}>
      <div className="student-info">
        <h3>{attempt.student_name}</h3>
        <span className="attempt-number">Attempt #{attempt.attempt_number}</span>
      </div>

      <div className="exercise-info">
        <p className="exercise-title">{attempt.exercise_title}</p>
        <p className="module-name">{attempt.module_name}</p>
      </div>

      <div className="metrics">
        <div className="score">
          <span className="label">Score:</span>
          <span className="value">{attempt.score}</span>
        </div>
        <div className="time">
          <span className="label">Time:</span>
          <span className="value">{formatTime(attempt.time_spent_seconds)}</span>
        </div>
        <div className="rewards">
          <span className="xp">+{attempt.xp_earned} XP</span>
          <span className="coins">+{attempt.ml_coins_earned} ML</span>
        </div>
      </div>

      {attempt.comodines_used.length > 0 && (
        <div className="comodines">
          <span className="label">Power-ups:</span>
          {attempt.comodines_used.map((comodin, idx) => (
            <span key={idx} className="comodin-badge">{comodin}</span>
          ))}
        </div>
      )}

      <div className="submitted-at">
        {new Date(attempt.submitted_at).toLocaleString()}
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### AttemptDetailModal Component

```typescript
// apps/frontend/src/apps/teacher/components/attempts/AttemptDetailModal.tsx

import React from 'react';
import { useAttemptDetail } from '@/apps/teacher/hooks/useExerciseResponses';

interface AttemptDetailModalProps {
  attemptId: string;
  onClose: () => void;
}

export const AttemptDetailModal: React.FC<AttemptDetailModalProps> = ({
  attemptId,
  onClose,
}) => {
  const { attempt, loading, error } = useAttemptDetail(attemptId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!attempt) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Attempt Detail</h2>

        <div className="attempt-header">
          <h3>{attempt.student_name}</h3>
          <p>{attempt.exercise_title}</p>
          <span className={`status ${attempt.is_correct ? 'correct' : 'incorrect'}`}>
            {attempt.is_correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
        </div>

        <div className="attempt-stats">
          <div>Score: {attempt.score}/{attempt.max_score}</div>
          <div>Time: {formatTime(attempt.time_spent_seconds)}</div>
          <div>Hints used: {attempt.hints_used}</div>
        </div>

        <div className="answers-section">
          <h4>Student's Answers</h4>
          <pre>{JSON.stringify(attempt.submitted_answers, null, 2)}</pre>
        </div>

        <div className="correct-answers-section">
          <h4>Correct Answers</h4>
          <pre>{JSON.stringify(attempt.correct_answer, null, 2)}</pre>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

---

## 📊 Example Use Cases

### 1. Teacher Dashboard - Recent Attempts

```typescript
// Show last 10 attempts across all classrooms
const { data } = useExerciseResponses({
  page: 1,
  limit: 10,
  sort_by: 'submitted_at',
  sort_order: 'desc',
});
```

### 2. Student Progress Page - Individual Student

```typescript
// Show all attempts for a specific student
const { attempts } = useStudentAttempts(studentId);
```

### 3. Exercise Analytics - Performance Overview

```typescript
// Analyze how all students performed on an exercise
const { data } = useExerciseResponses({
  exercise_id: exerciseId,
  limit: 100,
});

// Calculate stats
const totalAttempts = data.total;
const correctAttempts = data.data.filter(a => a.is_correct).length;
const avgScore = data.data.reduce((sum, a) => sum + a.score, 0) / data.data.length;
```

### 4. Classroom Monitoring - Today's Activity

```typescript
// Show attempts from today in a specific classroom
const today = new Date();
today.setHours(0, 0, 0, 0);

const { data } = useExerciseResponses({
  classroom_id: classroomId,
  from_date: today.toISOString(),
  sort_by: 'submitted_at',
  sort_order: 'desc',
});
```

### 5. Intervention Alerts - Students Struggling

```typescript
// Find incorrect attempts to identify students needing help
const { data } = useExerciseResponses({
  classroom_id: classroomId,
  is_correct: false,
  sort_by: 'submitted_at',
  sort_order: 'desc',
});
```

---

## 🎯 Integration Checklist

- [ ] Create types file: `apps/frontend/src/apps/teacher/types/exercise-responses.types.ts`
- [ ] Create API client: `apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts`
- [ ] Create hooks: `apps/frontend/src/apps/teacher/hooks/useExerciseResponses.ts`
- [ ] Create components:
  - [ ] `AttemptsList.tsx`
  - [ ] `AttemptCard.tsx`
  - [ ] `AttemptDetailModal.tsx`
  - [ ] `AttemptFilters.tsx`
- [ ] Integrate into pages:
  - [ ] Teacher Dashboard
  - [ ] Student Progress Page
  - [ ] Analytics Page
- [ ] Add to teacher routes
- [ ] Test all endpoints
- [ ] Handle error states
- [ ] Add loading states
- [ ] Implement pagination

---

## 🔒 Security Notes

1. **JWT Token Required:**
   - All requests must include valid JWT token
   - Token must have ADMIN_TEACHER or SUPER_ADMIN role

2. **RLS Enforced:**
   - Teachers can only see attempts from students in their classrooms
   - Cross-tenant data is blocked
   - Attempting to access unauthorized data returns 403 Forbidden

3. **Input Validation:**
   - All IDs are validated as UUIDs
   - Dates must be in ISO 8601 format
   - Pagination limits are enforced (max 100)

---

## 📚 Related Documentation

- Backend Implementation: `apps/backend/EXERCISE-RESPONSES-IMPLEMENTATION-REPORT.md`
- API Testing: `apps/backend/scripts/test-exercise-responses.sh`
- Entity Reference: `apps/backend/src/modules/progress/entities/exercise-attempt.entity.ts`

---

**Ready for Frontend Integration!** 🚀

Contact Backend-Agent for any questions or issues.

---

**Backend-Agent** | 2025-11-24
