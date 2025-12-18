# Admin Progress Module - Frontend Integration Guide

**Backend Module:** Admin Progress (Plan 3)
**Status:** ✅ Ready for Integration
**Date:** 2025-11-24

---

## Overview

The Admin Progress Module provides 6 REST endpoints for tracking and analyzing student, classroom, module, and exercise progress. All endpoints require admin authentication.

---

## Authentication

All requests must include JWT token:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/admin/progress
```

---

## 1. System Overview

### Endpoint
```
GET /admin/progress/overview
```

### Purpose
Get system-wide progress statistics for the dashboard.

### Response Type
```typescript
interface ProgressOverview {
  total_users: number;
  active_users: number;
  total_submissions: number;
  correct_submissions: number;
  avg_score: number;
  completed_modules: number;
  in_progress_modules: number;
  avg_progress_percent: number;
  total_time_spent_hours: number;
}
```

### Example Usage
```typescript
const getProgressOverview = async () => {
  const response = await fetch('/admin/progress/overview', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### UI Components Needed
- Statistics cards (total users, submissions, etc.)
- Progress chart (avg_progress_percent)
- Time spent visualization

---

## 2. Classroom Progress

### Endpoint
```
GET /admin/progress/classrooms/:id
```

### Purpose
View detailed progress for a specific classroom including all students.

### Response Type
```typescript
interface ClassroomProgress {
  classroom_id: string;
  classroom_name: string;
  teacher_name: string;
  total_students: number;
  active_students: number;
  avg_class_progress_percent: number;
  students: StudentProgressSummary[];
}

interface StudentProgressSummary {
  user_id: string;
  display_name: string;
  email: string;
  level: number;
  total_xp: number;
  exercises_completed: number;
  modules_completed: number;
  streak_days: number;
  last_activity_at: string | null;
  avg_module_progress: number;
  modules_completed_count: number;
  total_submissions: number;
  correct_submissions: number;
  avg_score: number | null;
}
```

### Example Usage
```typescript
const getClassroomProgress = async (classroomId: string) => {
  const response = await fetch(`/admin/progress/classrooms/${classroomId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### UI Components Needed
- Classroom info card
- Student list/table with sorting
- Progress bars for each student
- Activity indicators (last_activity_at)

---

## 3. Student Progress

### Endpoint
```
GET /admin/progress/students/:id
```

### Query Parameters
- `classroom_id` (optional): Filter modules by classroom
- `module_id` (optional): Filter by specific module

### Purpose
View comprehensive progress for a single student.

### Response Type
```typescript
interface StudentProgress {
  user_info: {
    id: string;
    display_name: string;
    email: string;
    status: string;
    level: number;
    total_xp: number;
    ml_coins: number;
    exercises_completed: number;
    modules_completed: number;
    streak_days: number;
    max_streak: number;
    achievements_earned: number;
    last_activity_at: string | null;
  };
  modules_progress: ModuleProgressDetail[];
  recent_submissions: RecentSubmission[];
}

interface ModuleProgressDetail {
  id: string;
  module_id: string;
  module_title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed' | 'mastered';
  progress_percentage: number;
  completed_exercises: number;
  total_exercises: number;
  average_score: number | null;
  total_xp_earned: number;
  time_spent_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  classroom_id: string | null;
  classroom_name: string | null;
}

interface RecentSubmission {
  id: string;
  exercise_id: string;
  exercise_title: string;
  exercise_type: string;
  score: number;
  max_score: number;
  is_correct: boolean;
  time_spent_seconds: number | null;
  attempt_number: number;
  status: string;
  submitted_at: string;
}
```

### Example Usage
```typescript
const getStudentProgress = async (
  studentId: string,
  filters?: { classroom_id?: string; module_id?: string }
) => {
  const params = new URLSearchParams();
  if (filters?.classroom_id) params.append('classroom_id', filters.classroom_id);
  if (filters?.module_id) params.append('module_id', filters.module_id);

  const url = `/admin/progress/students/${studentId}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### UI Components Needed
- Student profile card
- Module progress list with status badges
- Recent submissions timeline
- Filter dropdowns (classroom, module)

---

## 4. Module Statistics

### Endpoint
```
GET /admin/progress/modules/:id
```

### Query Parameters
- `classroom_id` (optional): Filter statistics by classroom

### Purpose
View aggregated statistics for a module across all students.

### Response Type
```typescript
interface ModuleProgressStats {
  module_info: {
    id: string;
    title: string;
    description: string | null;
    difficulty_level: string;
    estimated_duration: number | null;
    order_number: number;
    total_exercises: number;
  };
  progress_stats: {
    total_students: number;
    not_started_count: number;
    in_progress_count: number;
    completed_count: number;
    avg_progress_percent: number;
    avg_score: number | null;
    avg_time_spent_minutes: number;
    total_xp_distributed: number;
  };
}
```

### Example Usage
```typescript
const getModuleStats = async (moduleId: string, classroomId?: string) => {
  const params = new URLSearchParams();
  if (classroomId) params.append('classroom_id', classroomId);

  const url = `/admin/progress/modules/${moduleId}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### UI Components Needed
- Module info card
- Completion funnel chart (not_started → in_progress → completed)
- Average score gauge
- Time spent visualization

---

## 5. Exercise Statistics

### Endpoint
```
GET /admin/progress/exercises/:id
```

### Purpose
View submission statistics for a specific exercise.

### Response Type
```typescript
interface ExerciseStats {
  exercise_info: {
    id: string;
    title: string;
    description: string | null;
    exercise_type: string;
    difficulty: string;
    xp_reward: number;
    ml_coins_reward: number;
    module_id: string;
    module_title: string;
  };
  submission_stats: {
    total_students_attempted: number;
    total_submissions: number;
    students_completed: number;
    completion_rate: number;
    avg_score: number | null;
    max_score_achieved: number | null;
    min_score_achieved: number | null;
    avg_time_seconds: number | null;
    avg_attempts: number;
  };
}
```

### Example Usage
```typescript
const getExerciseStats = async (exerciseId: string) => {
  const response = await fetch(`/admin/progress/exercises/${exerciseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### UI Components Needed
- Exercise info card
- Completion rate progress bar
- Score distribution chart
- Attempt statistics

---

## 6. CSV Export

### Endpoint
```
GET /admin/progress/export
```

### Query Parameters
- `type` (required): `students` | `classrooms` | `modules`
- `classroom_id` (optional): Filter by classroom
- `format` (optional): `csv` (default)

### Purpose
Export progress data to CSV file.

### Response
- Content-Type: `text/csv`
- File download with appropriate filename

### Example Usage
```typescript
const exportProgress = async (
  type: 'students' | 'classrooms' | 'modules',
  classroomId?: string
) => {
  const params = new URLSearchParams({ type });
  if (classroomId) params.append('classroom_id', classroomId);

  const url = `/admin/progress/export?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `progress-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
```

### UI Components Needed
- Export button with dropdown (students/classrooms/modules)
- Classroom filter (optional)
- Loading indicator during export

---

## Error Handling

All endpoints can return these errors:

### 401 Unauthorized
```typescript
{
  statusCode: 401,
  message: "Unauthorized"
}
```
**Action:** Redirect to login or refresh token.

### 403 Forbidden
```typescript
{
  statusCode: 403,
  message: "Forbidden resource"
}
```
**Action:** Show "Insufficient permissions" message.

### 404 Not Found
```typescript
{
  statusCode: 404,
  message: "Classroom with ID {uuid} not found"
}
```
**Action:** Show "Resource not found" message.

### Example Error Handling
```typescript
const handleApiCall = async (apiCall: () => Promise<any>) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to access this resource');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else {
      toast.error('An error occurred. Please try again.');
    }
    throw error;
  }
};
```

---

## TypeScript API Client Example

```typescript
// api/admin-progress.ts

import { apiClient } from './api-client';

export const adminProgressApi = {
  getOverview: async () => {
    const { data } = await apiClient.get<ProgressOverview>('/admin/progress/overview');
    return data;
  },

  getClassroomProgress: async (classroomId: string) => {
    const { data } = await apiClient.get<ClassroomProgress>(
      `/admin/progress/classrooms/${classroomId}`
    );
    return data;
  },

  getStudentProgress: async (
    studentId: string,
    filters?: { classroom_id?: string; module_id?: string }
  ) => {
    const { data } = await apiClient.get<StudentProgress>(
      `/admin/progress/students/${studentId}`,
      { params: filters }
    );
    return data;
  },

  getModuleStats: async (moduleId: string, classroomId?: string) => {
    const { data } = await apiClient.get<ModuleProgressStats>(
      `/admin/progress/modules/${moduleId}`,
      { params: { classroom_id: classroomId } }
    );
    return data;
  },

  getExerciseStats: async (exerciseId: string) => {
    const { data } = await apiClient.get<ExerciseStats>(
      `/admin/progress/exercises/${exerciseId}`
    );
    return data;
  },

  exportProgress: async (type: 'students' | 'classrooms' | 'modules', classroomId?: string) => {
    const response = await apiClient.get('/admin/progress/export', {
      params: { type, classroom_id: classroomId, format: 'csv' },
      responseType: 'blob'
    });
    return response.data;
  }
};
```

---

## React Hook Example

```typescript
// hooks/useAdminProgress.ts

import { useQuery } from '@tanstack/react-query';
import { adminProgressApi } from '@/api/admin-progress';

export const useProgressOverview = () => {
  return useQuery({
    queryKey: ['admin', 'progress', 'overview'],
    queryFn: () => adminProgressApi.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClassroomProgress = (classroomId: string) => {
  return useQuery({
    queryKey: ['admin', 'progress', 'classroom', classroomId],
    queryFn: () => adminProgressApi.getClassroomProgress(classroomId),
    enabled: !!classroomId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useStudentProgress = (
  studentId: string,
  filters?: { classroom_id?: string; module_id?: string }
) => {
  return useQuery({
    queryKey: ['admin', 'progress', 'student', studentId, filters],
    queryFn: () => adminProgressApi.getStudentProgress(studentId, filters),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
```

---

## Page Component Example

```typescript
// pages/AdminProgressPage.tsx

import { useProgressOverview } from '@/hooks/useAdminProgress';

export const AdminProgressPage = () => {
  const { data: overview, isLoading, error } = useProgressOverview();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!overview) return null;

  return (
    <div className="admin-progress-page">
      <h1>Progress Overview</h1>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={overview.total_users}
          subtitle={`${overview.active_users} active`}
        />
        <StatCard
          title="Total Submissions"
          value={overview.total_submissions}
          subtitle={`${overview.correct_submissions} correct`}
        />
        <StatCard
          title="Average Score"
          value={`${overview.avg_score.toFixed(1)}%`}
        />
        <StatCard
          title="Time Spent"
          value={`${overview.total_time_spent_hours.toFixed(1)}h`}
        />
      </div>

      <div className="progress-chart">
        <h2>Module Progress</h2>
        <ProgressChart
          completed={overview.completed_modules}
          inProgress={overview.in_progress_modules}
          avgProgress={overview.avg_progress_percent}
        />
      </div>
    </div>
  );
};
```

---

## Recommended Frontend Structure

```
src/
├── api/
│   └── admin-progress.ts          # API client
├── hooks/
│   └── useAdminProgress.ts        # React Query hooks
├── pages/
│   ├── AdminProgressPage.tsx      # Overview page
│   ├── ClassroomProgressPage.tsx  # Classroom detail
│   └── StudentProgressPage.tsx    # Student detail
├── components/
│   ├── StatCard.tsx
│   ├── ProgressChart.tsx
│   ├── StudentTable.tsx
│   └── ExportButton.tsx
└── types/
    └── admin-progress.ts          # TypeScript interfaces
```

---

## Testing Checklist

- [ ] Test progress overview rendering
- [ ] Test classroom progress with valid ID
- [ ] Test student progress with filters
- [ ] Test module statistics display
- [ ] Test exercise statistics display
- [ ] Test CSV export functionality
- [ ] Test error handling (401, 403, 404)
- [ ] Test loading states
- [ ] Test with empty data
- [ ] Test sorting and filtering
- [ ] Test responsive design
- [ ] Test accessibility

---

## Performance Recommendations

1. **Caching:**
   - Use React Query with appropriate staleTime
   - Cache overview data for 5 minutes
   - Cache specific resources for 1-2 minutes

2. **Pagination:**
   - Consider pagination for large student lists
   - Use virtual scrolling for very large lists

3. **Lazy Loading:**
   - Load detailed views only when needed
   - Use React.lazy for page components

4. **Optimistic Updates:**
   - Not applicable (read-only endpoints)

---

## Support

- **Swagger Documentation:** http://localhost:3000/api/docs#/Admin%20-%20Progress
- **Backend Implementation Report:** `/IMPLEMENTATION-REPORT-ADMIN-PROGRESS-MODULE-2025-11-24.md`
- **Quick Reference:** `/apps/backend/PROGRESS-MODULE-QUICK-REFERENCE.md`

For questions or issues, contact the backend team.

---

**Last Updated:** 2025-11-24
**Backend Status:** ✅ Production Ready
