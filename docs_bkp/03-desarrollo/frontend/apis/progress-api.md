# Progress API Module

API client for tracking student progress, exercise submissions, and learning analytics in the Gamilit platform.

## Quick Start

```typescript
import { submitExercise, getProgress, getModuleProgress } from '@/features/progress/api';

// Submit an exercise
const result = await submitExercise(exerciseId, {
  userId: user.id,
  answers: userAnswers,
  startedAt: startTime,
  hintsUsed: 2,
  powerupsUsed: ['pistas'],
});

// Get user progress
const progress = await getProgress(userId);

// Get module progress
const moduleProgress = await getModuleProgress(userId, moduleId);
```

## Features

- ✅ Exercise submission with server-side validation
- ✅ User progress tracking (overall and per-module)
- ✅ Exercise attempt history
- ✅ Activity feed and statistics
- ✅ Dashboard data consolidation
- ✅ Rate limiting protection
- ✅ Anti-cheat timestamp validation
- ✅ Mock data support for development

## API Functions

### `submitExercise(exerciseId, request)`

Submit exercise answers for scoring and feedback.

**Parameters:**
- `exerciseId` (string): Exercise ID
- `request` (SubmitExerciseRequest):
  - `userId` (string): User ID
  - `answers` (unknown): Exercise answers
  - `startedAt` (number | Date): Start timestamp
  - `hintsUsed?` (number): Number of hints used
  - `powerupsUsed?` (PowerupType[]): Power-ups used
  - `sessionId?` (string): Session identifier

**Returns:** `Promise<SubmitExerciseResponse>`

### `getProgress(userId)`

Get overall user progress overview.

**Returns:** `Promise<UserProgressOverview>`

### `getModuleProgress(userId, moduleId)`

Get detailed progress for a specific module.

**Returns:** `Promise<ModuleProgressDetail>`

### `getExerciseAttempts(userId, filters?)`

Get user's exercise attempt history.

**Filters:**
- `exerciseId?` (string): Filter by exercise
- `moduleId?` (string): Filter by module

**Returns:** `Promise<ExerciseAttempt[]>`

### `getUserActivities(userId, limit?)`

Get recent user activities.

**Returns:** `Promise<Activity[]>`

### `getActivityStats(userId)`

Get activity statistics.

**Returns:** `Promise<ActivityStats>`

### `getUserActivitiesByType(userId, type, limit?)`

Get activities filtered by type.

**Types:**
- `exercise_completed`
- `achievement_unlocked`
- `module_completed`

**Returns:** `Promise<Activity[]>`

### `getUserDashboard(userId)`

Get consolidated dashboard data.

**Returns:** `Promise<UserDashboard>`

## Types

All types are exported from the module:

```typescript
import type {
  SubmitExerciseRequest,
  SubmitExerciseResponse,
  UserProgressOverview,
  ModuleProgressDetail,
  ExerciseAttempt,
  Activity,
  UserDashboard,
} from '@/features/progress/api';
```

## Security

The module implements several security measures:

1. **Rate Limiting**: Maximum 1 submission every 5 seconds per user/exercise
2. **Timestamp Validation**: Prevents instant submissions (min 1s) and stale sessions (max 24h)
3. **Server-side Validation**: Correct answers are validated on the server
4. **Protected Endpoints**: All endpoints require authentication and ownership verification

## Mock Data

Enable mock data for development:

```bash
# .env.local
VITE_USE_MOCK_DATA=true
```

## Error Handling

```typescript
try {
  const result = await submitExercise(exerciseId, request);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit (show retry timer)
  } else if (error.code === 'SUBMISSION_TOO_FAST') {
    // Handle instant submission
  } else {
    // Handle other errors
  }
}
```

## Integration with React

Example with React Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProgress, submitExercise } from '@/features/progress/api';

// Query for progress
const { data: progress, isLoading } = useQuery({
  queryKey: ['progress', userId],
  queryFn: () => getProgress(userId),
});

// Mutation for submission
const submitMutation = useMutation({
  mutationFn: (data) => submitExercise(exerciseId, data),
  onSuccess: (result) => {
    console.log('Score:', result.score);
  },
});
```

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/educational/exercises/:id/submit` | POST | Submit exercise |
| `/educational/progress/user/:userId` | GET | Get user progress |
| `/educational/progress/user/:userId/module/:moduleId` | GET | Get module progress |
| `/educational/progress/attempts/:userId` | GET | Get exercise attempts |
| `/educational/progress/activities/:userId` | GET | Get user activities |
| `/educational/progress/activities/:userId/stats` | GET | Get activity stats |
| `/educational/progress/user/:userId/dashboard` | GET | Get dashboard data |

## Files

```
progress/
├── api/
│   ├── progressAPI.ts      # Main API functions
│   ├── progressTypes.ts    # TypeScript types
│   └── index.ts           # Exports
└── README.md              # This file
```

## License

Copyright (c) 2025 Gamilit Platform
