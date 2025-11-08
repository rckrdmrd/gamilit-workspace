# Trazabilidad: Type Mappings & Reference Guide

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Referencia de Tipos
- **Categoria:** Type Mappings, Data Transformation, Type Safety
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este documento proporciona una referencia completa del mapeo de tipos de datos a traves de todas las capas del sistema GAMILIT, desde PostgreSQL hasta React.

**Alcance:** Database Types, Backend Types, Frontend Types, Transformations

---

## 1. Modulo: User/Profile

### Database Schema
```sql
-- auth_management.profiles
CREATE TABLE auth_management.profiles (
  id UUID PRIMARY KEY,
  tenant_id UUID FK,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  role gamilit_role DEFAULT 'student',
  status user_status DEFAULT 'active',
  avatar_url TEXT,
  bio TEXT,
  grade_level TEXT,
  school_name TEXT,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Backend Types
```typescript
// backend/modules/auth/auth.types.ts
export interface Profile {
  id: string;
  tenant_id: string | null;
  email: string;
  username: string | null;
  full_name: string | null;
  role: GamilaRole;
  status: UserStatus;
  avatar_url: string | null;
  bio: string | null;
  grade_level: string | null;
  school_name: string | null;
  preferences: UserPreferences;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type GamilaRole = 'student' | 'admin_teacher' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserPreferences {
  theme: 'detective' | 'light' | 'dark';
  notifications_enabled: boolean;
  sound_enabled: boolean;
  language: 'es' | 'en';
}
```

### Frontend Types
```typescript
// features/auth/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
  bio?: string;
  gradeLevel?: string;
  preferences: {
    theme: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    language: string;
  };
  createdAt: string; // ISO date string
  updatedAt: string;
}

export type UserRole = 'student' | 'admin_teacher' | 'super_admin';
```

### Mapping Flow
```
PostgreSQL                Backend                    Frontend
─────────────────────────────────────────────────────────────────
id: UUID                  id: string                 id: string
email: TEXT               email: string              email: string
full_name: TEXT           full_name: string | null   fullName?: string
role: gamilit_role        role: GamilaRole           role: UserRole
created_at: TIMESTAMPTZ   created_at: Date           createdAt: string (ISO)
preferences: JSONB        preferences: UserPreferences   preferences: { theme, ... }
```

---

## 2. Modulo: Exercise & Submissions

### Database Schema
```sql
CREATE TABLE educational_content.exercises (
  id UUID PRIMARY KEY,
  module_id UUID FK,
  title TEXT NOT NULL,
  exercise_type exercise_type,
  content JSONB,
  config JSONB,
  max_score INTEGER,
  passing_score INTEGER,
  xp_reward INTEGER,
  ml_coins_reward INTEGER
);

CREATE TABLE progress_tracking.exercise_attempts (
  id UUID PRIMARY KEY,
  user_id UUID FK,
  exercise_id UUID FK,
  submitted_answers JSONB,
  is_correct BOOLEAN,
  score INTEGER,
  time_spent_seconds INTEGER,
  xp_earned INTEGER,
  ml_coins_earned INTEGER
);
```

### Backend Types
```typescript
export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  exercise_type: ExerciseType;
  content: ExerciseContent;
  config: ExerciseConfig;
  max_score: number;
  passing_score: number;
  xp_reward: number;
  ml_coins_reward: number;
}

export interface ExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  submitted_answers: any;
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  xp_earned: number;
  ml_coins_earned: number;
}
```

### Frontend Types
```typescript
export interface ExerciseData {
  id: string;
  moduleId: string;
  title: string;
  type: string;
  content: any;
  maxScore: number;
  passingScore: number;
  rewards: {
    xp: number;
    mlCoins: number;
  };
}

export interface SubmissionResult {
  submissionId: string;
  score: number;
  passed: boolean;
  rewards: {
    xp: number;
    mlCoins: number;
  };
}
```

---

## 3. Modulo: Gamification

### Database Schema
```sql
CREATE TABLE gamification_system.user_stats (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE FK,
  ml_coins INTEGER DEFAULT 0,
  ml_coins_earned_total INTEGER DEFAULT 0,
  ml_coins_spent_total INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  exercises_completed INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0
);

CREATE TABLE gamification_system.user_ranks (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE FK,
  current_rank rango_maya DEFAULT 'nacom',
  rank_achieved_at TIMESTAMPTZ,
  rank_progress_percentage INTEGER
);
```

### Backend Types
```typescript
export interface UserStats {
  id: string;
  user_id: string;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  total_xp: number;
  level: number;
  exercises_completed: number;
  modules_completed: number;
}

export interface UserRanks {
  id: string;
  user_id: string;
  current_rank: RangoMaya;
  rank_achieved_at: Date;
  rank_progress_percentage: number;
}

export type RangoMaya = 'nacom' | 'chilan' | 'ah_kin' | 'halach_uinik' | 'batab';
```

### Frontend Types
```typescript
export interface UserProgress {
  userId: string;
  currentRank: string;
  currentXP: number;
  totalXP: number;
  currentLevel: number;
  mlCoins: number;
  modulesCompleted: number;
  exercisesCompleted: number;
}

export interface EconomyBalance {
  current: number;
  lifetime: number;
  spent: number;
}
```

---

## 4. Matriz de Trazabilidad Completa

### 4.1 Authentication Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `auth_management.profiles` | `id` | `Profile.id: string` | `AuthService.login()` | `POST /auth/login` | `authStore.user.id` | `LoginPage` |
| `auth_management.profiles` | `email` | `Profile.email: string` | `AuthService.findByEmail()` | - | `authStore.user.email` | `LoginForm` |
| `auth_management.profiles` | `password_hash` | (not exposed) | `AuthService.comparePassword()` | - | - | - |
| `auth_management.profiles` | `role` | `Profile.role: GamilaRole` | `AuthService.sanitizeUser()` | - | `authStore.user.role` | `RoleBadge` |
| `auth_management.user_sessions` | `session_token` | `Session.session_token` | `SessionService.createSession()` | - | `authStore.token` | (localStorage) |

---

### 4.2 Exercise Submission Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `educational_content.exercises` | `id` | `Exercise.id: string` | `ExercisesService.submitExercise()` | `POST /exercises/:id/submit` | - | `CrucigramaExercise` |
| `educational_content.exercises` | `exercise_type` | `Exercise.exercise_type: ExerciseType` | - | - | - | Component router |
| `educational_content.exercises` | `content` | `Exercise.content: JSONB` | - | - | Local state | Mechanic UI |
| `progress_tracking.exercise_attempts` | `submitted_answers` | `ExerciseAttempt.submitted_answers` | `ExercisesRepository.createAttempt()` | - | - | - |
| `progress_tracking.exercise_attempts` | `score` | `ExerciseAttempt.score` | `ScoringService.evaluate()` | Response | - | `ScoreDisplay` |
| `progress_tracking.exercise_attempts` | `xp_earned` | `ExerciseAttempt.xp_earned` | - | Response | `ranksStore.addXP()` | `XPGainAnimation` |
| `progress_tracking.exercise_attempts` | `ml_coins_earned` | `ExerciseAttempt.ml_coins_earned` | - | Response | `economyStore.addCoins()` | `CoinsGainAnimation` |

---

### 4.3 ML Coins Economy Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `gamification_system.user_stats` | `ml_coins` | `UserStats.ml_coins: number` | `GamificationService.addMLCoins()` | `GET /gamification/stats` | `economyStore.balance.current` | `WalletWidget` |
| `gamification_system.user_stats` | `ml_coins_earned_total` | `UserStats.ml_coins_earned_total` | - | - | `economyStore.balance.lifetime` | `StatsCard` |
| `gamification_system.ml_coins_transactions` | `amount` | `Transaction.amount: number` | `GamificationService.addMLCoins()` | `GET /gamification/coins/transactions` | `economyStore.transactions[].amount` | `TransactionItem` |
| `gamification_system.ml_coins_transactions` | `balance_after` | `Transaction.balance_after` | - | - | `economyStore.transactions[].balanceAfter` | Balance history |

---

## 5. Transformacion de Datos

### Naming Convention Transformation

**Snake_case (DB) → camelCase (Frontend)**

```typescript
// Backend serializer
function serializeProfile(dbProfile: any): Profile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    fullName: dbProfile.full_name,          // snake_case → camelCase
    avatarUrl: dbProfile.avatar_url,        // snake_case → camelCase
    gradeLevel: dbProfile.grade_level,      // snake_case → camelCase
    createdAt: dbProfile.created_at.toISOString(), // Date → ISO string
  };
}
```

### Date Transformation

```typescript
// PostgreSQL TIMESTAMPTZ → Backend Date → Frontend ISO string
DB:       2024-10-15 10:30:00-06
Backend:  new Date('2024-10-15T10:30:00-06:00')
Frontend: '2024-10-15T10:30:00.000Z'
```

### JSONB Transformation

```typescript
// PostgreSQL JSONB → Backend Object → Frontend Object
DB:       '{"theme":"detective","notifications_enabled":true}'
Backend:  { theme: 'detective', notifications_enabled: true }
Frontend: { theme: 'detective', notificationsEnabled: true }
```

---

## 6. Type Safety Guidelines

### Backend Type Guards
```typescript
export function isValidRole(role: string): role is GamilaRole {
  return ['student', 'admin_teacher', 'super_admin'].includes(role);
}

export function isExerciseAttempt(obj: any): obj is ExerciseAttempt {
  return obj && typeof obj.user_id === 'string' && typeof obj.score === 'number';
}
```

### Frontend Type Guards
```typescript
export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}
```

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** Todos los modulos de trazabilidad
- **RFC-0001:** Governance Model GAMILIT Platform
- **TypeScript Version:** 5.0+
