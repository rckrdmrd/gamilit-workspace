# GAMILIT Platform - Shared Types Library

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Package Structure](#package-structure)
3. [Naming Conventions](#naming-conventions)
4. [Export Strategy](#export-strategy)
5. [Versioning Strategy](#versioning-strategy)
6. [Complete Types Catalog](#complete-types-catalog)
7. [Type Guards & Validators](#type-guards--validators)
8. [Implementation Recommendations](#implementation-recommendations)
9. [Migration Guide](#migration-guide)
10. [Breaking Changes Strategy](#breaking-changes-strategy)

---

## 1. Overview

This document defines the complete shared types library for the GAMILITplatform, ensuring type safety and consistency across backend (Node.js/Express) and frontend (React/TypeScript) applications.

### Goals

- **Type Safety**: Ensure compile-time type checking across the stack
- **Single Source of Truth**: Eliminate duplicate type definitions
- **Runtime Validation**: Provide Zod schemas for API boundaries
- **Developer Experience**: Clear, documented, and maintainable types
- **Backward Compatibility**: Graceful migration path from legacy types

### Architecture

```
@glit/shared-types (npm package)
├── Backend (Express/Node.js)
├── Frontend (React/TypeScript)
└── Shared validation (Zod schemas)
```

---

## 2. Package Structure

### Proposed Directory Structure

```
@glit/shared-types/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
├── src/
│   ├── index.ts                    # Main export file
│   ├── core/                       # Core domain types
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── profile.types.ts
│   │   ├── session.types.ts
│   │   └── role.types.ts
│   ├── auth/                       # Authentication types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── auth.dto.ts
│   │   ├── auth.schemas.ts         # Zod schemas
│   │   └── auth.guards.ts          # Type guards
│   ├── educational/                # Educational content types
│   │   ├── index.ts
│   │   ├── module.types.ts
│   │   ├── exercise.types.ts
│   │   ├── submission.types.ts
│   │   ├── progress.types.ts
│   │   ├── analytics.types.ts
│   │   ├── educational.schemas.ts
│   │   └── educational.guards.ts
│   ├── gamification/               # Gamification types
│   │   ├── index.ts
│   │   ├── rank.types.ts
│   │   ├── achievement.types.ts
│   │   ├── coins.types.ts
│   │   ├── powerups.types.ts
│   │   ├── leaderboard.types.ts
│   │   ├── missions.types.ts
│   │   ├── streaks.types.ts
│   │   ├── gamification.schemas.ts
│   │   └── gamification.guards.ts
│   ├── social/                     # Social features types
│   │   ├── index.ts
│   │   ├── friends.types.ts
│   │   ├── guilds.types.ts
│   │   ├── social.schemas.ts
│   │   └── social.guards.ts
│   ├── teacher/                    # Teacher module types
│   │   ├── index.ts
│   │   ├── classroom.types.ts
│   │   ├── assignment.types.ts
│   │   ├── grading.types.ts
│   │   ├── analytics.types.ts
│   │   ├── teacher.schemas.ts
│   │   └── teacher.guards.ts
│   ├── admin/                      # Admin module types
│   │   ├── index.ts
│   │   ├── user-admin.types.ts
│   │   ├── organization.types.ts
│   │   ├── moderation.types.ts
│   │   ├── system.types.ts
│   │   ├── audit.types.ts
│   │   ├── admin.schemas.ts
│   │   └── admin.guards.ts
│   ├── notifications/              # Notification types
│   │   ├── index.ts
│   │   ├── notification.types.ts
│   │   ├── websocket.types.ts
│   │   ├── notifications.schemas.ts
│   │   └── notifications.guards.ts
│   ├── api/                        # API response types
│   │   ├── index.ts
│   │   ├── response.types.ts
│   │   ├── pagination.types.ts
│   │   ├── error.types.ts
│   │   ├── api.schemas.ts
│   │   └── api.guards.ts
│   └── utility/                    # Utility types
│       ├── index.ts
│       ├── timestamps.types.ts
│       ├── soft-delete.types.ts
│       ├── audit.types.ts
│       ├── metadata.types.ts
│       └── common.types.ts
├── dist/                           # Compiled output
│   ├── index.js
│   ├── index.d.ts
│   └── ...
└── tests/
    ├── unit/
    └── integration/
```

---

## 3. Naming Conventions

### General Rules

1. **Interfaces**: PascalCase, descriptive nouns
   ```typescript
   interface User { }
   interface UserProfile { }
   interface Achievement { }
   ```

2. **DTOs (Data Transfer Objects)**: PascalCase with `Dto` suffix
   ```typescript
   interface LoginDto { }
   interface RegisterDto { }
   interface CreateModuleDto { }
   ```

3. **Response Types**: PascalCase with `Response` suffix
   ```typescript
   interface AuthResponse { }
   interface ModuleResponse { }
   interface SubmissionResponse { }
   ```

4. **Enums**: PascalCase for name, UPPER_SNAKE_CASE for values
   ```typescript
   enum ErrorCode {
     UNAUTHORIZED = 'UNAUTHORIZED',
     NOT_FOUND = 'NOT_FOUND'
   }
   ```

5. **Type Aliases**: PascalCase
   ```typescript
   type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K'in' | 'Halach Uinic' | 'K'uk'ulkan';
   type TransactionType = 'earned_exercise' | 'spent_powerup';
   ```

6. **Zod Schemas**: camelCase with `Schema` suffix
   ```typescript
   const loginSchema = z.object({ ... });
   const registerSchema = z.object({ ... });
   ```

7. **Type Guards**: camelCase with `is` prefix
   ```typescript
   function isUser(value: unknown): value is User { }
   function isAuthResponse(value: unknown): value is AuthResponse { }
   ```

### Naming Patterns by Category

| Category | Pattern | Example |
|----------|---------|---------|
| Database Entity | `{Entity}` | `User`, `Module`, `Exercise` |
| Create DTO | `Create{Entity}Dto` | `CreateUserDto`, `CreateModuleDto` |
| Update DTO | `Update{Entity}Dto` | `UpdateUserDto`, `UpdateModuleDto` |
| Response Type | `{Entity}Response` | `UserResponse`, `ModuleResponse` |
| API Response | `{Action}Response` | `AuthResponse`, `SubmissionResponse` |
| Query Params | `{Entity}QueryParams` | `UserQueryParams`, `ModuleQueryParams` |
| Filter Options | `{Entity}Filters` | `UserFilters`, `ModuleFilters` |
| Statistics | `{Entity}Stats` | `UserStats`, `OrganizationStats` |
| Summary | `{Entity}Summary` | `ExerciseSummary`, `ModuleSummary` |
| Detail | `{Entity}Detail` | `ModuleDetail`, `ProgressDetail` |

---

## 4. Export Strategy

### Barrel Exports (index.ts)

Each module should have an `index.ts` that exports all public types:

```typescript
// src/auth/index.ts
export * from './auth.types';
export * from './auth.dto';
export * from './auth.schemas';
export * from './auth.guards';
```

### Main Entry Point

```typescript
// src/index.ts
export * from './core';
export * from './auth';
export * from './educational';
export * from './gamification';
export * from './social';
export * from './teacher';
export * from './admin';
export * from './notifications';
export * from './api';
export * from './utility';
```

### Usage in Applications

```typescript
// Backend
import { User, LoginDto, loginSchema } from '@glit/shared-types';

// Frontend
import { Module, ExerciseResponse } from '@glit/shared-types';
```

---

## 5. Versioning Strategy

### Semantic Versioning (SemVer)

Follow strict semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., removing fields, changing types)
- **MINOR**: New features (e.g., adding optional fields)
- **PATCH**: Bug fixes (e.g., fixing type definitions)

### Version Ranges in Applications

```json
{
  "dependencies": {
    "@glit/shared-types": "^1.0.0"
  }
}
```

### Deprecation Strategy

1. Mark deprecated fields with `@deprecated` JSDoc
2. Provide alternative in deprecation message
3. Maintain deprecated fields for 2 major versions
4. Log warnings in development mode

```typescript
interface User {
  id: string;
  email: string;

  /** @deprecated Use display_name instead. Will be removed in v3.0.0 */
  displayName?: string;

  display_name: string;
}
```

---

## 6. Complete Types Catalog

This section documents all 70+ shared types with complete examples.

---

### 6.1 Core Types

#### 6.1.1 User

**Description**: Core user entity from auth.users table

**TypeScript Definition**:
```typescript
interface User {
  id: string;
  email: string;
  encrypted_password: string;
  role: UserRole;
  raw_user_meta_data?: any;
  created_at: Date;
  updated_at: Date;
  last_sign_in_at?: Date;
  email_confirmed_at?: Date;
  confirmation_token?: string;
  confirmation_sent_at?: Date;
  recovery_token?: string;
  recovery_sent_at?: Date;
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: Date;
  phone?: string;
  phone_confirmed_at?: Date;
  phone_change?: string;
  phone_change_token?: string;
  phone_change_sent_at?: Date;
  reauthentication_token?: string;
  reauthentication_sent_at?: Date;
  is_sso_user: boolean;
  deleted_at?: Date;
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  encrypted_password: z.string(),
  role: z.enum(['student', 'admin_teacher', 'super_admin']),
  raw_user_meta_data: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  last_sign_in_at: z.date().optional(),
  email_confirmed_at: z.date().optional(),
  confirmation_token: z.string().optional(),
  confirmation_sent_at: z.date().optional(),
  recovery_token: z.string().optional(),
  recovery_sent_at: z.date().optional(),
  email_change_token_new: z.string().optional(),
  email_change: z.string().optional(),
  email_change_sent_at: z.date().optional(),
  phone: z.string().optional(),
  phone_confirmed_at: z.date().optional(),
  phone_change: z.string().optional(),
  phone_change_token: z.string().optional(),
  phone_change_sent_at: z.date().optional(),
  reauthentication_token: z.string().optional(),
  reauthentication_sent_at: z.date().optional(),
  is_sso_user: z.boolean(),
  deleted_at: z.date().optional(),
});
```

**Type Guard**:
```typescript
function isUser(value: unknown): value is User {
  return userSchema.safeParse(value).success;
}
```

**Example Data**:
```typescript
const exampleUser: User = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'estudiante@glit.com',
  encrypted_password: '$2b$10$...',
  role: 'student',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15'),
  last_sign_in_at: new Date('2025-01-15'),
  email_confirmed_at: new Date('2025-01-01'),
  is_sso_user: false
};
```

**Backend Usage**:
```typescript
import { User } from '@glit/shared-types';

async function getUserById(id: string): Promise<User> {
  const result = await db.query('SELECT * FROM auth.users WHERE id = $1', [id]);
  return result.rows[0];
}
```

**Frontend Usage**:
```typescript
import { User } from '@glit/shared-types';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({ user: null, isLoading: true });
```

---

#### 6.1.2 UserProfile

**Description**: User profile data from auth_management.profiles table

**TypeScript Definition**:
```typescript
interface UserProfile {
  id: string;
  user_id: string;
  tenant_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  student_id?: string;
  grade_level?: string;
  school_id?: string;
  is_active: boolean;
  preferences?: any;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const userProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  school_id: z.string().uuid().optional(),
  is_active: z.boolean(),
  preferences: z.any().optional(),
  metadata: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});
```

**Example Data**:
```typescript
const exampleProfile: UserProfile = {
  id: 'profile-123',
  user_id: 'user-456',
  full_name: 'María García López',
  first_name: 'María',
  last_name: 'García López',
  display_name: 'María G.',
  avatar_url: 'https://cdn.glit.com/avatars/maria.jpg',
  bio: 'Estudiante apasionada por la lectura',
  student_id: 'EST-2025-001',
  grade_level: '9',
  is_active: true,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15')
};
```

---

#### 6.1.3 AuthUser

**Description**: Authenticated user object stored in request

**TypeScript Definition**:
```typescript
interface AuthUser {
  id: string;
  email: string;
  role: string;
  rank?: string;
  tenant_id?: string;
}
```

**Zod Schema**:
```typescript
const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  rank: z.string().optional(),
  tenant_id: z.string().uuid().optional(),
});
```

**Backend Usage**:
```typescript
import { Request } from 'express';
import { AuthUser } from '@glit/shared-types';

interface AuthRequest extends Request {
  user?: AuthUser;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract token and populate req.user
  req.user = {
    id: decodedToken.sub,
    email: decodedToken.email,
    role: decodedToken.role
  };
  next();
};
```

---

#### 6.1.4 UserRole

**Description**: User role enumeration

**TypeScript Definition**:
```typescript
type UserRole = 'student' | 'admin_teacher' | 'super_admin';

enum UserRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}
```

**Zod Schema**:
```typescript
const userRoleSchema = z.enum(['student', 'admin_teacher', 'super_admin']);
```

**Example Usage**:
```typescript
function hasPermission(role: UserRole, action: string): boolean {
  const permissions = {
    student: ['read:own_profile', 'update:own_profile'],
    admin_teacher: ['read:classroom', 'update:classroom', 'grade:assignment'],
    super_admin: ['*']
  };

  return permissions[role]?.includes(action) || permissions[role]?.includes('*');
}
```

---

#### 6.1.5 Session

**Description**: User session information

**TypeScript Definition**:
```typescript
interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  last_activity_at: Date;
  is_active: boolean;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location?: string;
}
```

**Zod Schema**:
```typescript
const deviceInfoSchema = z.object({
  type: z.enum(['desktop', 'mobile', 'tablet']),
  browser: z.string(),
  os: z.string(),
  location: z.string().optional(),
});

const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string(),
  refresh_token: z.string().optional(),
  device_info: deviceInfoSchema.optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  expires_at: z.date(),
  created_at: z.date(),
  last_activity_at: z.date(),
  is_active: z.boolean(),
});
```

---

### 6.2 Auth Types

#### 6.2.1 LoginDto

**Description**: Login request payload

**TypeScript Definition**:
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

**Zod Schema**:
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
```

**Type Guard**:
```typescript
function isLoginDto(value: unknown): value is LoginDto {
  return loginSchema.safeParse(value).success;
}
```

**Backend Usage**:
```typescript
import { LoginDto, loginSchema } from '@glit/shared-types';

router.post('/login', async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData);
  res.json(result);
});
```

**Frontend Usage**:
```typescript
import { LoginDto, loginSchema } from '@glit/shared-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginDto) => {
    await api.post('/auth/login', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
};
```

---

#### 6.2.2 RegisterDto

**Description**: Registration request payload

**TypeScript Definition**:
```typescript
interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'admin_teacher';
}
```

**Zod Schema**:
```typescript
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['student', 'admin_teacher']).default('student'),
});
```

**Example Data**:
```typescript
const exampleRegister: RegisterDto = {
  email: 'nuevo@estudiante.com',
  password: 'SecurePass123',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'student'
};
```

---

#### 6.2.3 AuthResponse

**Description**: Authentication response with tokens

**TypeScript Definition**:
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  token: string;
  refreshToken?: string;
  expiresIn: string;
}
```

**Zod Schema**:
```typescript
const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.string(),
});
```

**Example Data**:
```typescript
const exampleAuthResponse: AuthResponse = {
  user: {
    id: 'user-123',
    email: 'estudiante@glit.com',
    role: 'student',
    firstName: 'María',
    lastName: 'García',
    displayName: 'María G.'
  },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expiresIn: '7d'
};
```

**Backend Usage**:
```typescript
import { AuthResponse } from '@glit/shared-types';

async function login(credentials: LoginDto): Promise<AuthResponse> {
  const user = await validateCredentials(credentials);
  const token = generateJWT(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name
    },
    token,
    refreshToken,
    expiresIn: '7d'
  };
}
```

---

#### 6.2.4 RefreshTokenDto

**Description**: Refresh token request

**TypeScript Definition**:
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

**Zod Schema**:
```typescript
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});
```

---

#### 6.2.5 UpdatePasswordDto

**Description**: Update password request

**TypeScript Definition**:
```typescript
interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
```

**Zod Schema**:
```typescript
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});
```

---

#### 6.2.6 ForgotPasswordDto

**Description**: Forgot password request

**TypeScript Definition**:
```typescript
interface ForgotPasswordDto {
  email: string;
}
```

**Zod Schema**:
```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});
```

---

#### 6.2.7 ResetPasswordDto

**Description**: Reset password with token

**TypeScript Definition**:
```typescript
interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
```

**Zod Schema**:
```typescript
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
});
```

---

#### 6.2.8 VerifyEmailDto

**Description**: Email verification request

**TypeScript Definition**:
```typescript
interface VerifyEmailDto {
  token: string;
}
```

**Zod Schema**:
```typescript
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});
```

---

#### 6.2.9 SessionInfoDto

**Description**: Session information response

**TypeScript Definition**:
```typescript
interface SessionInfoDto {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
}
```

**Zod Schema**:
```typescript
const sessionInfoSchema = z.object({
  id: z.string().uuid(),
  deviceType: z.string(),
  browser: z.string(),
  os: z.string(),
  ipAddress: z.string(),
  location: z.string(),
  createdAt: z.string(),
  lastActivity: z.string(),
  isCurrent: z.boolean(),
});
```

---

### 6.3 Educational Types

#### 6.3.1 Module

**Description**: Educational module entity

**TypeScript Definition**:
```typescript
interface Module {
  id: string;
  tenant_id?: string;

  // Basic Info
  title: string;
  subtitle?: string;
  description: string;
  summary?: string;

  // Module Organization
  order_index: number;
  module_code?: string;

  // Academic Configuration
  difficulty_level?: DifficultyLevel;
  grade_levels?: string[];
  subjects?: string[];
  estimated_duration_minutes?: number;
  estimated_sessions?: number;

  // Learning Objectives
  learning_objectives?: string[];
  competencies?: string[];
  skills_developed?: string[];

  // Prerequisites
  prerequisites?: string[];
  prerequisite_skills?: string[];

  // Gamification
  rango_maya_required?: MayaRank;
  rango_maya_granted?: MayaRank;
  xp_reward?: number;
  ml_coins_reward?: number;

  // Publishing
  status?: ContentStatus;
  is_published?: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  is_demo_module?: boolean;
  published_at?: string;
  archived_at?: string;

  // Search & Discovery
  keywords?: string[];
  tags?: string[];
  thumbnail_url?: string;
  cover_image_url?: string;

  // Configuration
  settings?: ModuleSettings;
  metadata?: Record<string, any>;

  // Client-side computed
  progress?: number;
  exercises_count?: number;
  completed_exercises?: number;
  is_locked?: boolean;
  can_access?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface ModuleSettings {
  allow_skip?: boolean;
  sequential_completion?: boolean;
  adaptive_difficulty?: boolean;
  show_progress?: boolean;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const moduleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1),
  summary: z.string().max(500).optional(),
  order_index: z.number().int().min(0),
  module_code: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  grade_levels: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  estimated_sessions: z.number().int().positive().optional(),
  learning_objectives: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  skills_developed: z.array(z.string()).optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
  prerequisite_skills: z.array(z.string()).optional(),
  rango_maya_required: z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']).optional(),
  rango_maya_granted: z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']).optional(),
  xp_reward: z.number().int().min(0).optional(),
  ml_coins_reward: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_free: z.boolean().optional(),
  is_demo_module: z.boolean().optional(),
  published_at: z.string().datetime().optional(),
  archived_at: z.string().datetime().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  thumbnail_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  progress: z.number().min(0).max(100).optional(),
  exercises_count: z.number().int().min(0).optional(),
  completed_exercises: z.number().int().min(0).optional(),
  is_locked: z.boolean().optional(),
  can_access: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
```

**Example Data**:
```typescript
const exampleModule: Module = {
  id: 'module-001',
  title: 'Comprensión Literal',
  subtitle: 'Fundamentos de la lectura',
  description: 'Módulo introductorio para desarrollar habilidades de comprensión literal',
  order_index: 1,
  difficulty_level: 'beginner',
  grade_levels: ['7', '8', '9'],
  subjects: ['Lengua y Literatura'],
  estimated_duration_minutes: 180,
  estimated_sessions: 6,
  learning_objectives: [
    'Identificar información explícita en textos',
    'Comprender el significado literal de las palabras'
  ],
  rango_maya_required: 'Ajaw',
  rango_maya_granted: 'Nacom',
  xp_reward: 500,
  ml_coins_reward: 100,
  is_published: true,
  thumbnail_url: 'https://cdn.glit.com/modules/comprension-literal.jpg',
  exercises_count: 10,
  completed_exercises: 0,
  progress: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z'
};
```

---

#### 6.3.2 Exercise

**Description**: Exercise entity with 27 mechanics

**TypeScript Definition**:
```typescript
type ExerciseType =
  // Module 1 - Comprensión Literal
  | 'crucigrama_cientifico'
  | 'crucigrama'
  | 'linea_tiempo'
  | 'timeline'
  | 'sopa_letras'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'verdadero_falso'
  | 'completar_espacios'
  // Module 2 - Comprensión Inferencial
  | 'detective_textual'
  | 'construccion_hipotesis'
  | 'prediccion_narrativa'
  | 'puzzle_contexto'
  | 'rueda_inferencias'
  // Module 3 - Comprensión Crítica
  | 'analisis_fuentes'
  | 'debate_digital'
  | 'matriz_perspectivas'
  | 'podcast_argumentativo'
  | 'tribunal_opiniones'
  // Module 4 - Textos Digitales
  | 'verificador_fakenews'
  | 'fake_news'
  | 'quiz_tiktok'
  | 'navegacion_hipertextual'
  | 'analisis_memes'
  | 'infografia_interactiva'
  | 'email_formal'
  | 'chat_literario'
  | 'ensayo_argumentativo'
  | 'resena_critica'
  // Module 5 - Producción Creativa
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta'
  // Auxiliar
  | 'call_to_action'
  | 'collage_prensa'
  | 'comprension_auditiva'
  | 'texto_movimiento';

interface Exercise {
  id: string;
  module_id: string;

  // Basic Info
  title: string;
  subtitle?: string;
  description?: string;
  instructions?: string;

  // Exercise Type
  type: ExerciseType;
  exercise_type?: ExerciseType;
  order_index: number;

  // Configuration
  config: ExerciseConfig;

  // Content & Solution
  content: ExerciseContent;
  solution?: any;
  rubric?: any;

  // Grading
  auto_gradable?: boolean;
  difficulty_level?: DifficultyLevel;
  max_points?: number;
  passing_score?: number;

  // Time Management
  estimated_time_minutes?: number;
  time_limit_minutes?: number;

  // Attempts & Retries
  max_attempts?: number;
  allow_retry?: boolean;
  retry_delay_minutes?: number;

  // Hints & Help
  hints?: string[];
  enable_hints?: boolean;
  hint_cost_ml_coins?: number;

  // Power-ups
  comodines_allowed?: ComodinType[];
  comodines_config?: ComodinesConfig;

  // Rewards
  xp_reward?: number;
  ml_coins_reward?: number;
  bonus_multiplier?: number;

  // Status & Flags
  is_active?: boolean;
  is_optional?: boolean;
  is_bonus?: boolean;

  // Advanced Features
  adaptive_difficulty?: boolean;
  prerequisites?: string[];

  // Versioning
  version?: number;
  version_notes?: string;

  // Metadata
  metadata?: Record<string, any>;

  // Client-side computed
  completed?: boolean;
  points?: number;
  user_attempts?: number;
  best_score?: number;
  is_locked?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface ExerciseConfig {
  estimated_time_minutes?: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  allow_retry?: boolean;
  retry_delay_minutes?: number;
  hints?: string[];
  enable_hints?: boolean;
  hint_cost_ml_coins?: number;
  comodines_allowed?: ComodinType[];
  comodines_config?: ComodinesConfig;
  auto_gradable?: boolean;
  max_points?: number;
  passing_score?: number;
  xp_reward?: number;
  ml_coins_reward?: number;
  bonus_multiplier?: number;
  adaptive_difficulty?: boolean;
  prerequisites?: string[];
  [key: string]: any;
}

interface ExerciseContent {
  question?: string;
  options?: any[];
  correct_answers?: any[];
  explanations?: Record<string, string>;
  marieCurieContext?: Record<string, any>;
  resources?: any[];
  [key: string]: any;
}

type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

interface ComodinesConfig {
  pistas?: { enabled: boolean; cost: number };
  vision_lectora?: { enabled: boolean; cost: number };
  segunda_oportunidad?: { enabled: boolean; cost: number };
}
```

**Zod Schema**:
```typescript
const exerciseTypeSchema = z.enum([
  'crucigrama_cientifico',
  'crucigrama',
  'linea_tiempo',
  'timeline',
  'sopa_letras',
  'mapa_conceptual',
  'emparejamiento',
  'verdadero_falso',
  'completar_espacios',
  'detective_textual',
  'construccion_hipotesis',
  'prediccion_narrativa',
  'puzzle_contexto',
  'rueda_inferencias',
  'analisis_fuentes',
  'debate_digital',
  'matriz_perspectivas',
  'podcast_argumentativo',
  'tribunal_opiniones',
  'verificador_fakenews',
  'fake_news',
  'quiz_tiktok',
  'navegacion_hipertextual',
  'analisis_memes',
  'infografia_interactiva',
  'email_formal',
  'chat_literario',
  'ensayo_argumentativo',
  'resena_critica',
  'diario_multimedia',
  'comic_digital',
  'video_carta',
  'call_to_action',
  'collage_prensa',
  'comprension_auditiva',
  'texto_movimiento'
]);

const comodinTypeSchema = z.enum(['pistas', 'vision_lectora', 'segunda_oportunidad']);

const exerciseSchema = z.object({
  id: z.string().uuid(),
  module_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  type: exerciseTypeSchema,
  exercise_type: exerciseTypeSchema.optional(),
  order_index: z.number().int().min(0),
  config: z.record(z.any()),
  content: z.record(z.any()),
  solution: z.any().optional(),
  rubric: z.any().optional(),
  auto_gradable: z.boolean().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  max_points: z.number().int().positive().optional(),
  passing_score: z.number().min(0).max(100).optional(),
  estimated_time_minutes: z.number().int().positive().optional(),
  time_limit_minutes: z.number().int().positive().optional(),
  max_attempts: z.number().int().positive().optional(),
  allow_retry: z.boolean().optional(),
  retry_delay_minutes: z.number().int().min(0).optional(),
  hints: z.array(z.string()).optional(),
  enable_hints: z.boolean().optional(),
  hint_cost_ml_coins: z.number().int().min(0).optional(),
  comodines_allowed: z.array(comodinTypeSchema).optional(),
  comodines_config: z.record(z.object({
    enabled: z.boolean(),
    cost: z.number().int().min(0)
  })).optional(),
  xp_reward: z.number().int().min(0).optional(),
  ml_coins_reward: z.number().int().min(0).optional(),
  bonus_multiplier: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
  is_optional: z.boolean().optional(),
  is_bonus: z.boolean().optional(),
  adaptive_difficulty: z.boolean().optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
  version: z.number().int().positive().optional(),
  version_notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  completed: z.boolean().optional(),
  points: z.number().optional(),
  user_attempts: z.number().int().min(0).optional(),
  best_score: z.number().min(0).max(100).optional(),
  is_locked: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
```

**Example Data**:
```typescript
const exampleExercise: Exercise = {
  id: 'exercise-001',
  module_id: 'module-001',
  title: 'Crucigrama Científico: Marie Curie',
  description: 'Completa el crucigrama sobre la vida de Marie Curie',
  instructions: 'Lee el texto y completa el crucigrama con las palabras correctas',
  type: 'crucigrama_cientifico',
  order_index: 1,
  difficulty_level: 'beginner',
  estimated_time_minutes: 15,
  max_points: 100,
  passing_score: 70,
  auto_gradable: true,
  config: {
    max_attempts: 3,
    allow_retry: true,
    hints: ['La primera pista...', 'La segunda pista...'],
    enable_hints: true,
    hint_cost_ml_coins: 10,
    comodines_allowed: ['pistas', 'segunda_oportunidad'],
    xp_reward: 50,
    ml_coins_reward: 25
  },
  content: {
    text: 'Marie Curie fue una científica pionera...',
    grid: {
      rows: 10,
      cols: 10,
      cells: [/* ... */]
    },
    clues: {
      across: [
        { number: 1, clue: 'País de origen de Marie Curie', answer: 'POLONIA' }
      ],
      down: [
        { number: 1, clue: 'Elemento descubierto por Marie Curie', answer: 'POLONIO' }
      ]
    }
  },
  xp_reward: 50,
  ml_coins_reward: 25,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z'
};
```

---

#### 6.3.3 SubmitExerciseDto

**Description**: Exercise submission payload

**TypeScript Definition**:
```typescript
interface SubmitExerciseDto {
  userId: string;
  exerciseId: string;
  answer?: any;
  answers?: any;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed?: ComodinType[];
  comodinesUsed?: {
    type: ComodinType;
    count: number;
  }[];
  attemptNumber?: number;
  startedAt?: string | Date;
  sessionId?: string;
}
```

**Zod Schema**:
```typescript
const submitExerciseSchema = z.object({
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  answer: z.any().optional(),
  answers: z.any().optional(),
  timeSpent: z.number().int().min(0),
  hintsUsed: z.number().int().min(0).default(0),
  powerupsUsed: z.array(comodinTypeSchema).optional().default([]),
  comodinesUsed: z.array(z.object({
    type: comodinTypeSchema,
    count: z.number().int().positive()
  })).optional(),
  attemptNumber: z.number().int().positive().default(1),
  startedAt: z.union([z.string().datetime(), z.date()]).optional(),
  sessionId: z.string().optional(),
}).refine(data => data.answer !== undefined || data.answers !== undefined, {
  message: 'Se requiere answer o answers'
});
```

**Backend Usage**:
```typescript
import { SubmitExerciseDto, submitExerciseSchema } from '@glit/shared-types';

router.post('/exercises/:id/submit', async (req: AuthRequest, res: Response) => {
  const exerciseId = req.params.id;
  const userId = req.user!.id;

  const validatedData = submitExerciseSchema.parse({
    ...req.body,
    userId,
    exerciseId
  });

  const result = await exerciseService.submitExercise(validatedData);
  res.json(result);
});
```

---

#### 6.3.4 SubmissionResponse

**Description**: Exercise submission result

**TypeScript Definition**:
```typescript
interface SubmissionResponse {
  attemptId: string;
  score: number;
  isPerfect: boolean;
  correctAnswers: number;
  totalQuestions: number;
  rewards: SubmissionRewards;
  feedback: SubmissionFeedback;
  achievements: AchievementUnlocked[];
  rankUp?: RankUpInfo | null;
  createdAt: Date;
}

interface SubmissionRewards {
  mlCoins: number;
  xp: number;
  bonuses: {
    perfectScore?: number;
    noHints?: number;
    speedBonus?: number;
    firstAttempt?: number;
  };
}

interface SubmissionFeedback {
  overall: string;
  answerReview: AnswerReview[];
}

interface AnswerReview {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

interface AchievementUnlocked {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

interface RankUpInfo {
  newRank: string;
  previousRank?: string;
  bonusMLCoins: number;
  newMultiplier: number;
}
```

**Zod Schema**:
```typescript
const submissionResponseSchema = z.object({
  attemptId: z.string().uuid(),
  score: z.number().min(0).max(100),
  isPerfect: z.boolean(),
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
  rewards: z.object({
    mlCoins: z.number().int().min(0),
    xp: z.number().int().min(0),
    bonuses: z.object({
      perfectScore: z.number().int().min(0).optional(),
      noHints: z.number().int().min(0).optional(),
      speedBonus: z.number().int().min(0).optional(),
      firstAttempt: z.number().int().min(0).optional(),
    })
  }),
  feedback: z.object({
    overall: z.string(),
    answerReview: z.array(z.object({
      questionId: z.string(),
      isCorrect: z.boolean(),
      userAnswer: z.string(),
      correctAnswer: z.string(),
      explanation: z.string().optional()
    }))
  }),
  achievements: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    icon: z.string(),
    rarity: z.string()
  })),
  rankUp: z.object({
    newRank: z.string(),
    previousRank: z.string().optional(),
    bonusMLCoins: z.number().int().min(0),
    newMultiplier: z.number().min(1)
  }).nullable().optional(),
  createdAt: z.date()
});
```

**Example Data**:
```typescript
const exampleSubmissionResponse: SubmissionResponse = {
  attemptId: 'attempt-123',
  score: 85,
  isPerfect: false,
  correctAnswers: 17,
  totalQuestions: 20,
  rewards: {
    mlCoins: 50,
    xp: 100,
    bonuses: {
      speedBonus: 10,
      firstAttempt: 20
    }
  },
  feedback: {
    overall: 'Buen trabajo! Alcanzaste el 85% de respuestas correctas',
    answerReview: [
      {
        questionId: 'q1',
        isCorrect: true,
        userAnswer: 'POLONIA',
        correctAnswer: 'POLONIA'
      },
      {
        questionId: 'q2',
        isCorrect: false,
        userAnswer: 'RADIO',
        correctAnswer: 'POLONIO',
        explanation: 'Marie Curie descubrió el elemento Polonio, nombrado por su país natal'
      }
    ]
  },
  achievements: [],
  rankUp: null,
  createdAt: new Date('2025-01-15T10:30:00Z')
};
```

---

#### 6.3.5 ExerciseAttempt

**Description**: Historical exercise attempt record

**TypeScript Definition**:
```typescript
interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed: ComodinType[];
  answers: any;
  feedback: any;
  isPerfect: boolean;
  mlCoinsEarned: number;
  xpEarned: number;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
}
```

**Zod Schema**:
```typescript
const exerciseAttemptSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  exerciseTitle: z.string(),
  score: z.number().min(0),
  maxScore: z.number().positive(),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  powerupsUsed: z.array(comodinTypeSchema),
  answers: z.any(),
  feedback: z.any(),
  isPerfect: z.boolean(),
  mlCoinsEarned: z.number().int().min(0),
  xpEarned: z.number().int().min(0),
  attemptNumber: z.number().int().positive(),
  startedAt: z.date(),
  completedAt: z.date()
});
```

---

#### 6.3.6 ModuleProgress

**Description**: User progress in a module

**TypeScript Definition**:
```typescript
interface ModuleProgress {
  userId: string;
  moduleId: string;
  moduleName: string;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  averageScore: number;
  timeSpent: number;
  lastActivityAt: Date;
}
```

**Zod Schema**:
```typescript
const moduleProgressSchema = z.object({
  userId: z.string().uuid(),
  moduleId: z.string().uuid(),
  moduleName: z.string(),
  totalExercises: z.number().int().min(0),
  completedExercises: z.number().int().min(0),
  progressPercentage: z.number().min(0).max(100),
  averageScore: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  lastActivityAt: z.date()
});
```

---

#### 6.3.7 LearningAnalytics

**Description**: Comprehensive learning analytics

**TypeScript Definition**:
```typescript
interface LearningAnalytics {
  timeframe: string;
  summary: AnalyticsSummary;
  performanceByModule: ModulePerformance[];
  performanceByType: TypePerformance[];
  studyPattern: StudyPattern;
  trends: AnalyticsTrends;
}

interface AnalyticsSummary {
  totalTimeStudied: number;
  exercisesCompleted: number;
  averageScore: number;
  perfectScores: number;
  improvementRate: number;
}

interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  averageScore: number;
  exercisesCompleted: number;
  timeSpent: number;
  improvement: number;
}

interface TypePerformance {
  exerciseType: ExerciseType;
  averageScore: number;
  totalAttempts: number;
  successRate: number;
}

interface StudyPattern {
  averageSessionDuration: number;
  preferredStudyTime: string;
  mostActiveDay: string;
  studyConsistency: number;
}

interface AnalyticsTrends {
  scoreOverTime: Array<{ date: string; averageScore: number }>;
  activityOverTime: Array<{
    date: string;
    exercisesCompleted: number;
    minutesStudied: number
  }>;
}
```

**Zod Schema**:
```typescript
const learningAnalyticsSchema = z.object({
  timeframe: z.string(),
  summary: z.object({
    totalTimeStudied: z.number().min(0),
    exercisesCompleted: z.number().int().min(0),
    averageScore: z.number().min(0).max(100),
    perfectScores: z.number().int().min(0),
    improvementRate: z.number()
  }),
  performanceByModule: z.array(z.object({
    moduleId: z.string().uuid(),
    moduleName: z.string(),
    averageScore: z.number().min(0).max(100),
    exercisesCompleted: z.number().int().min(0),
    timeSpent: z.number().int().min(0),
    improvement: z.number()
  })),
  performanceByType: z.array(z.object({
    exerciseType: exerciseTypeSchema,
    averageScore: z.number().min(0).max(100),
    totalAttempts: z.number().int().min(0),
    successRate: z.number().min(0).max(100)
  })),
  studyPattern: z.object({
    averageSessionDuration: z.number().min(0),
    preferredStudyTime: z.string(),
    mostActiveDay: z.string(),
    studyConsistency: z.number().min(0).max(100)
  }),
  trends: z.object({
    scoreOverTime: z.array(z.object({
      date: z.string(),
      averageScore: z.number().min(0).max(100)
    })),
    activityOverTime: z.array(z.object({
      date: z.string(),
      exercisesCompleted: z.number().int().min(0),
      minutesStudied: z.number().int().min(0)
    }))
  })
});
```

---

### 6.4 Gamification Types

#### 6.4.1 MayaRank

**Description**: Maya civilization rank system

**TypeScript Definition**:
```typescript
type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K'in' | 'Halach Uinic' | 'K'uk'ulkan';

enum MayaRankEnum {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  Ah K'in = 'Ah K'in',
  Halach Uinic = 'Halach Uinic',
  K'uk'ulkan = 'K'uk'ulkan'
}
```

**Zod Schema**:
```typescript
const mayaRankSchema = z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']);
```

---

#### 6.4.2 UserStats

**Description**: User gamification statistics

**TypeScript Definition**:
```typescript
interface UserStats {
  user_id: string;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  total_xp: number;
  current_level: number;
  current_rank: MayaRank;
  rank_progress: number;
  current_streak: number;
  longest_streak: number;
  last_login_at?: Date;
  total_exercises_completed: number;
  perfect_scores: number;
  average_score: number;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const userStatsSchema = z.object({
  user_id: z.string().uuid(),
  ml_coins: z.number().int().min(0),
  ml_coins_earned_total: z.number().int().min(0),
  ml_coins_spent_total: z.number().int().min(0),
  total_xp: z.number().int().min(0),
  current_level: z.number().int().min(1),
  current_rank: mayaRankSchema,
  rank_progress: z.number().min(0).max(100),
  current_streak: z.number().int().min(0),
  longest_streak: z.number().int().min(0),
  last_login_at: z.date().optional(),
  total_exercises_completed: z.number().int().min(0),
  perfect_scores: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  created_at: z.date(),
  updated_at: z.date()
});
```

**Example Data**:
```typescript
const exampleUserStats: UserStats = {
  user_id: 'user-123',
  ml_coins: 450,
  ml_coins_earned_total: 1200,
  ml_coins_spent_total: 750,
  total_xp: 3500,
  current_level: 12,
  current_rank: 'Nacom',
  rank_progress: 65,
  current_streak: 7,
  longest_streak: 15,
  last_login_at: new Date('2025-01-15'),
  total_exercises_completed: 45,
  perfect_scores: 12,
  average_score: 82.5,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15')
};
```

---

#### 6.4.3 Achievement

**Description**: Achievement definition

**TypeScript Definition**:
```typescript
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'progress' | 'streak' | 'completion' | 'social' | 'special' | 'mastery' | 'exploration';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  ml_coins_reward: number;
  xp_reward: number;
  conditions?: any;
  is_secret: boolean;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const achievementRaritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);
const achievementCategorySchema = z.enum(['progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration']);

const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: achievementCategorySchema,
  icon: z.string(),
  rarity: achievementRaritySchema,
  ml_coins_reward: z.number().int().min(0),
  xp_reward: z.number().int().min(0),
  conditions: z.any().optional(),
  is_secret: z.boolean(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleAchievement: Achievement = {
  id: 'achievement-001',
  name: 'Primera Victoria',
  description: 'Completa tu primer ejercicio',
  category: 'progress',
  icon: '🏆',
  rarity: 'common',
  ml_coins_reward: 50,
  xp_reward: 100,
  conditions: {
    exercises_completed: 1
  },
  is_secret: false,
  created_at: new Date('2025-01-01')
};
```

---

#### 6.4.4 MLCoinsTransaction

**Description**: ML Coins transaction record

**TypeScript Definition**:
```typescript
type TransactionType =
  | 'earned_exercise'
  | 'earned_module'
  | 'earned_achievement'
  | 'earned_rank'
  | 'earned_streak'
  | 'earned_daily'
  | 'earned_bonus'
  | 'spent_powerup'
  | 'spent_hint'
  | 'spent_retry'
  | 'admin_adjustment'
  | 'refund'
  | 'bonus'
  | 'welcome_bonus';

interface MLCoinsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  reason: string;
  reference_id?: string;
  reference_type?: string;
  balance_after: number;
  balance_before?: number;
  multiplier?: number;
  bonus_applied?: boolean;
  metadata?: any;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const transactionTypeSchema = z.enum([
  'earned_exercise',
  'earned_module',
  'earned_achievement',
  'earned_rank',
  'earned_streak',
  'earned_daily',
  'earned_bonus',
  'spent_powerup',
  'spent_hint',
  'spent_retry',
  'admin_adjustment',
  'refund',
  'bonus',
  'welcome_bonus'
]);

const mlCoinsTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int(),
  transaction_type: transactionTypeSchema,
  reason: z.string(),
  reference_id: z.string().optional(),
  reference_type: z.string().optional(),
  balance_after: z.number().int().min(0),
  balance_before: z.number().int().min(0).optional(),
  multiplier: z.number().min(1).optional(),
  bonus_applied: z.boolean().optional(),
  metadata: z.any().optional(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleTransaction: MLCoinsTransaction = {
  id: 'txn-123',
  user_id: 'user-456',
  amount: 50,
  transaction_type: 'earned_exercise',
  reason: 'Ejercicio completado: Crucigrama Científico',
  reference_id: 'exercise-001',
  reference_type: 'exercise',
  balance_before: 400,
  balance_after: 450,
  multiplier: 1.0,
  bonus_applied: false,
  created_at: new Date('2025-01-15T10:30:00Z')
};
```

---

#### 6.4.5 RankRequirements

**Description**: Requirements for achieving a rank

**TypeScript Definition**:
```typescript
interface RankRequirements {
  rank: MayaRank;
  xpRequired: number;
  modulesRequired: number;
  mlCoinsThreshold: number;
  achievementsRequired: number;
  minimumScore: number;
  multiplier: number;
  mlBonus: number;
}
```

**Zod Schema**:
```typescript
const rankRequirementsSchema = z.object({
  rank: mayaRankSchema,
  xpRequired: z.number().int().min(0),
  modulesRequired: z.number().int().min(0),
  mlCoinsThreshold: z.number().int().min(0),
  achievementsRequired: z.number().int().min(0),
  minimumScore: z.number().min(0).max(100),
  multiplier: z.number().min(1),
  mlBonus: z.number().int().min(0)
});
```

**Example Data**:
```typescript
const rankRequirements: Record<MayaRank, RankRequirements> = {
  Ajaw: {
    rank: 'Ajaw',
    xpRequired: 0,
    modulesRequired: 0,
    mlCoinsThreshold: 0,
    achievementsRequired: 0,
    minimumScore: 0,
    multiplier: 1.0,
    mlBonus: 0
  },
  Nacom: {
    rank: 'Nacom',
    xpRequired: 500,
    modulesRequired: 2,
    mlCoinsThreshold: 200,
    achievementsRequired: 3,
    minimumScore: 70,
    multiplier: 1.2,
    mlBonus: 100
  },
  Ah K'in: {
    rank: 'Ah K'in',
    xpRequired: 1500,
    modulesRequired: 5,
    mlCoinsThreshold: 500,
    achievementsRequired: 8,
    minimumScore: 75,
    multiplier: 1.5,
    mlBonus: 250
  },
  Halach Uinic: {
    rank: 'Halach Uinic',
    xpRequired: 3500,
    modulesRequired: 10,
    mlCoinsThreshold: 1000,
    achievementsRequired: 15,
    minimumScore: 80,
    multiplier: 2.0,
    mlBonus: 500
  },
  K'uk'ulkan: {
    rank: 'K'uk'ulkan',
    xpRequired: 7500,
    modulesRequired: 20,
    mlCoinsThreshold: 2500,
    achievementsRequired: 30,
    minimumScore: 85,
    multiplier: 3.0,
    mlBonus: 1000
  }
};
```

---

#### 6.4.6 PowerupInventory

**Description**: User's powerup inventory

**TypeScript Definition**:
```typescript
interface PowerupInventory {
  pistas: PowerupItem;
  visionLectora: PowerupItem;
  segundaOportunidad: PowerupItem;
}

interface PowerupItem {
  available: number;
  purchased: number;
  used: number;
  cost: number;
}
```

**Zod Schema**:
```typescript
const powerupItemSchema = z.object({
  available: z.number().int().min(0),
  purchased: z.number().int().min(0),
  used: z.number().int().min(0),
  cost: z.number().int().min(0)
});

const powerupInventorySchema = z.object({
  pistas: powerupItemSchema,
  visionLectora: powerupItemSchema,
  segundaOportunidad: powerupItemSchema
});
```

**Example Data**:
```typescript
const exampleInventory: PowerupInventory = {
  pistas: {
    available: 3,
    purchased: 5,
    used: 2,
    cost: 50
  },
  visionLectora: {
    available: 1,
    purchased: 2,
    used: 1,
    cost: 100
  },
  segundaOportunidad: {
    available: 2,
    purchased: 3,
    used: 1,
    cost: 75
  }
};
```

---

#### 6.4.7 LeaderboardEntry

**Description**: Entry in the leaderboard

**TypeScript Definition**:
```typescript
interface LeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  xp?: number;
  mlCoins?: number;
  modulesCompleted?: number;
  achievementsEarned?: number;
  streak?: number;
  rank?: MayaRank;
  weeklyXp?: number;
  avatarUrl?: string;
}
```

**Zod Schema**:
```typescript
const leaderboardEntrySchema = z.object({
  position: z.number().int().positive(),
  userId: z.string().uuid(),
  name: z.string(),
  xp: z.number().int().min(0).optional(),
  mlCoins: z.number().int().min(0).optional(),
  modulesCompleted: z.number().int().min(0).optional(),
  achievementsEarned: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  rank: mayaRankSchema.optional(),
  weeklyXp: z.number().int().min(0).optional(),
  avatarUrl: z.string().url().optional()
});
```

---

#### 6.4.8 Mission

**Description**: User mission/quest

**TypeScript Definition**:
```typescript
type MissionType = 'daily' | 'weekly' | 'special';
type MissionStatus = 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired';
type ObjectiveType =
  | 'exercises_completed'
  | 'ml_coins_earned'
  | 'modules_completed'
  | 'powerups_used'
  | 'achievements_unlocked'
  | 'perfect_scores'
  | 'streak_maintained'
  | 'friends_helped'
  | 'login_days'
  | 'rank_up'
  | 'guild_joined'
  | 'exercises_no_hints'
  | 'weekly_exercises'
  | 'total_xp_earned';

interface MissionObjective {
  type: ObjectiveType;
  target: number;
  current: number;
  description?: string;
}

interface MissionRewards {
  ml_coins: number;
  xp: number;
  items?: string[];
}

interface Mission {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  description: string;
  mission_type: MissionType;
  objectives: MissionObjective[];
  rewards: MissionRewards;
  status: MissionStatus;
  progress: number;
  start_date: Date;
  end_date: Date;
  completed_at?: Date;
  claimed_at?: Date;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const missionTypeSchema = z.enum(['daily', 'weekly', 'special']);
const missionStatusSchema = z.enum(['active', 'in_progress', 'completed', 'claimed', 'expired']);
const objectiveTypeSchema = z.enum([
  'exercises_completed',
  'ml_coins_earned',
  'modules_completed',
  'powerups_used',
  'achievements_unlocked',
  'perfect_scores',
  'streak_maintained',
  'friends_helped',
  'login_days',
  'rank_up',
  'guild_joined',
  'exercises_no_hints',
  'weekly_exercises',
  'total_xp_earned'
]);

const missionObjectiveSchema = z.object({
  type: objectiveTypeSchema,
  target: z.number().int().positive(),
  current: z.number().int().min(0),
  description: z.string().optional()
});

const missionRewardsSchema = z.object({
  ml_coins: z.number().int().min(0),
  xp: z.number().int().min(0),
  items: z.array(z.string()).optional()
});

const missionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  mission_type: missionTypeSchema,
  objectives: z.array(missionObjectiveSchema),
  rewards: missionRewardsSchema,
  status: missionStatusSchema,
  progress: z.number().min(0).max(100),
  start_date: z.date(),
  end_date: z.date(),
  completed_at: z.date().optional(),
  claimed_at: z.date().optional(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleMission: Mission = {
  id: 'mission-123',
  user_id: 'user-456',
  template_id: 'template-daily-001',
  title: 'Explorador Diario',
  description: 'Completa 3 ejercicios hoy',
  mission_type: 'daily',
  objectives: [
    {
      type: 'exercises_completed',
      target: 3,
      current: 1,
      description: 'Completar 3 ejercicios'
    }
  ],
  rewards: {
    ml_coins: 100,
    xp: 50
  },
  status: 'in_progress',
  progress: 33,
  start_date: new Date('2025-01-15T00:00:00Z'),
  end_date: new Date('2025-01-15T23:59:59Z'),
  created_at: new Date('2025-01-15T00:00:00Z')
};
```

---

### 6.5 Social Types

#### 6.5.1 Friendship

**Description**: Friendship relationship

**TypeScript Definition**:
```typescript
type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
  accepted_at?: Date;
}
```

**Zod Schema**:
```typescript
const friendshipStatusSchema = z.enum(['pending', 'accepted', 'declined', 'blocked']);

const friendshipSchema = z.object({
  id: z.string().uuid(),
  requester_id: z.string().uuid(),
  addressee_id: z.string().uuid(),
  status: friendshipStatusSchema,
  created_at: z.date(),
  updated_at: z.date(),
  accepted_at: z.date().optional()
});
```

---

#### 6.5.2 FriendProfile

**Description**: Friend profile information

**TypeScript Definition**:
```typescript
interface FriendProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  currentRank?: MayaRank;
  totalXP?: number;
  isOnline?: boolean;
  lastSeenAt?: Date;
  friendshipId: string;
  friendsSince: Date;
}
```

**Zod Schema**:
```typescript
const friendProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  currentRank: mayaRankSchema.optional(),
  totalXP: z.number().int().min(0).optional(),
  isOnline: z.boolean().optional(),
  lastSeenAt: z.date().optional(),
  friendshipId: z.string().uuid(),
  friendsSince: z.date()
});
```

---

#### 6.5.3 Guild

**Description**: Team/guild entity

**TypeScript Definition**:
```typescript
type GuildRole = 'owner' | 'admin' | 'member';

interface Guild {
  id: string;
  classroom_id?: string;
  tenant_id: string;
  name: string;
  description?: string;
  motto?: string;
  color_primary: string;
  color_secondary: string;
  avatar_url?: string;
  banner_url?: string;
  badges?: any;
  creator_id: string;
  leader_id?: string;
  team_code?: string;
  max_members: number;
  current_members_count: number;
  is_public: boolean;
  allow_join_requests: boolean;
  require_approval: boolean;
  total_xp: number;
  total_ml_coins: number;
  modules_completed: number;
  achievements_earned: number;
  is_active: boolean;
  is_verified: boolean;
  founded_at: Date;
  last_activity_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const guildRoleSchema = z.enum(['owner', 'admin', 'member']);

const guildSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  motto: z.string().max(100).optional(),
  color_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  color_secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  avatar_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  badges: z.any().optional(),
  creator_id: z.string().uuid(),
  leader_id: z.string().uuid().optional(),
  team_code: z.string().optional(),
  max_members: z.number().int().positive(),
  current_members_count: z.number().int().min(0),
  is_public: z.boolean(),
  allow_join_requests: z.boolean(),
  require_approval: z.boolean(),
  total_xp: z.number().int().min(0),
  total_ml_coins: z.number().int().min(0),
  modules_completed: z.number().int().min(0),
  achievements_earned: z.number().int().min(0),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  founded_at: z.date(),
  last_activity_at: z.date().optional(),
  metadata: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.5.4 GuildMember

**Description**: Guild member information

**TypeScript Definition**:
```typescript
type GuildMemberStatus = 'active' | 'inactive' | 'kicked' | 'left';

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: GuildRole;
  status: GuildMemberStatus;
  joined_at: Date;
  left_at?: Date;
  kicked_at?: Date;
  kick_reason?: string;
  contribution_xp: number;
  contribution_coins: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const guildMemberStatusSchema = z.enum(['active', 'inactive', 'kicked', 'left']);

const guildMemberSchema = z.object({
  id: z.string().uuid(),
  guild_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: guildRoleSchema,
  status: guildMemberStatusSchema,
  joined_at: z.date(),
  left_at: z.date().optional(),
  kicked_at: z.date().optional(),
  kick_reason: z.string().optional(),
  contribution_xp: z.number().int().min(0),
  contribution_coins: z.number().int().min(0),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

### 6.6 Teacher Types

#### 6.6.1 Classroom

**Description**: Classroom entity

**TypeScript Definition**:
```typescript
interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  description?: string;
  school_id?: string;
  grade_level?: string;
  subject?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const classroomSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  school_id: z.string().uuid().optional(),
  grade_level: z.string().optional(),
  subject: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.6.2 Assignment

**Description**: Teacher assignment

**TypeScript Definition**:
```typescript
type AssignmentType = 'practice' | 'quiz' | 'exam' | 'homework';

interface Assignment {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  assignment_type: AssignmentType;
  due_date?: Date;
  total_points: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const assignmentTypeSchema = z.enum(['practice', 'quiz', 'exam', 'homework']);

const assignmentSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  assignment_type: assignmentTypeSchema,
  due_date: z.date().optional(),
  total_points: z.number().int().positive(),
  is_published: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.6.3 AssignmentSubmission

**Description**: Student assignment submission

**TypeScript Definition**:
```typescript
type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at?: Date;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
}
```

**Zod Schema**:
```typescript
const submissionStatusSchema = z.enum(['not_started', 'in_progress', 'submitted', 'graded']);

const assignmentSubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  submitted_at: z.date().optional(),
  status: submissionStatusSchema,
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  graded_at: z.date().optional(),
  graded_by: z.string().uuid().optional()
});
```

---

#### 6.6.4 ClassroomAnalytics

**Description**: Classroom performance analytics

**TypeScript Definition**:
```typescript
interface ClassroomAnalytics {
  classroom_id: string;
  classroom_name: string;
  total_students: number;
  active_students: number;
  average_score: number;
  total_assignments: number;
  completion_rate: number;
  students: StudentPerformance[];
}

interface StudentPerformance {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  ml_coins: number;
  rank: MayaRank;
  last_activity?: Date;
}
```

**Zod Schema**:
```typescript
const studentPerformanceSchema = z.object({
  student_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  total_assignments: z.number().int().min(0),
  completed_assignments: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  ml_coins: z.number().int().min(0),
  rank: mayaRankSchema,
  last_activity: z.date().optional()
});

const classroomAnalyticsSchema = z.object({
  classroom_id: z.string().uuid(),
  classroom_name: z.string(),
  total_students: z.number().int().min(0),
  active_students: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  total_assignments: z.number().int().min(0),
  completion_rate: z.number().min(0).max(100),
  students: z.array(studentPerformanceSchema)
});
```

---

### 6.7 Admin Types

#### 6.7.1 UserAdmin

**Description**: Extended user information for admin

**TypeScript Definition**:
```typescript
type UserStatus = 'active' | 'suspended' | 'banned' | 'deleted';

interface UserAdmin {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  role: UserRole;
  status: UserStatus;
  tenant_id?: string;
  tenant_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  student_id?: string;
  grade_level?: string;
  is_active: boolean;
  last_sign_in_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

  // Gamification stats
  total_xp?: number;
  current_level?: number;
  current_rank?: MayaRank;
  ml_coins?: number;
  total_exercises_completed?: number;

  // Suspension info
  suspension_reason?: string;
  suspension_until?: Date;
  suspended_by?: string;
  suspended_at?: Date;
}
```

**Zod Schema**:
```typescript
const userStatusSchema = z.enum(['active', 'suspended', 'banned', 'deleted']);

const userAdminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().optional(),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  role: userRoleSchema,
  status: userStatusSchema,
  tenant_id: z.string().uuid().optional(),
  tenant_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  is_active: z.boolean(),
  last_sign_in_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional(),
  total_xp: z.number().int().min(0).optional(),
  current_level: z.number().int().min(1).optional(),
  current_rank: mayaRankSchema.optional(),
  ml_coins: z.number().int().min(0).optional(),
  total_exercises_completed: z.number().int().min(0).optional(),
  suspension_reason: z.string().optional(),
  suspension_until: z.date().optional(),
  suspended_by: z.string().uuid().optional(),
  suspended_at: z.date().optional()
});
```

---

#### 6.7.2 Organization

**Description**: Organization/tenant entity

**TypeScript Definition**:
```typescript
type OrganizationType = 'school' | 'university' | 'company' | 'other';

interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  admin_id?: string;
  admin_email?: string;
  admin_name?: string;
  student_count: number;
  teacher_count: number;
  is_active: boolean;
  subscription_tier?: string;
  subscription_expires_at?: Date;
  max_students?: number;
  max_teachers?: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const organizationTypeSchema = z.enum(['school', 'university', 'company', 'other']);

const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: organizationTypeSchema,
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  admin_id: z.string().uuid().optional(),
  admin_email: z.string().email().optional(),
  admin_name: z.string().optional(),
  student_count: z.number().int().min(0),
  teacher_count: z.number().int().min(0),
  is_active: z.boolean(),
  subscription_tier: z.string().optional(),
  subscription_expires_at: z.date().optional(),
  max_students: z.number().int().positive().optional(),
  max_teachers: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.7.3 SystemMetrics

**Description**: System health and performance metrics

**TypeScript Definition**:
```typescript
interface SystemMetrics {
  api_response_time: {
    p50: number;
    p95: number;
    p99: number;
  };
  database_queries_per_sec: number;
  database_connections_active: number;
  database_connections_idle: number;
  database_query_time_avg: number;
  active_users_count: number;
  active_users_5min: number;
  active_users_1hour: number;
  total_users_count: number;
  requests_per_min: number;
  requests_per_hour: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
  websocket_connections: number;
  timestamp: Date;
}
```

**Zod Schema**:
```typescript
const systemMetricsSchema = z.object({
  api_response_time: z.object({
    p50: z.number().min(0),
    p95: z.number().min(0),
    p99: z.number().min(0)
  }),
  database_queries_per_sec: z.number().min(0),
  database_connections_active: z.number().int().min(0),
  database_connections_idle: z.number().int().min(0),
  database_query_time_avg: z.number().min(0),
  active_users_count: z.number().int().min(0),
  active_users_5min: z.number().int().min(0),
  active_users_1hour: z.number().int().min(0),
  total_users_count: z.number().int().min(0),
  requests_per_min: z.number().min(0),
  requests_per_hour: z.number().min(0),
  error_rate: z.number().min(0).max(100),
  cpu_usage: z.number().min(0).max(100),
  memory_usage: z.number().min(0).max(100),
  memory_used_mb: z.number().min(0),
  memory_total_mb: z.number().positive(),
  uptime_seconds: z.number().int().min(0),
  websocket_connections: z.number().int().min(0),
  timestamp: z.date()
});
```

---

### 6.8 Notification Types

#### 6.8.1 Notification

**Description**: User notification entity

**TypeScript Definition**:
```typescript
enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITATION = 'guild_invitation',
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ML_COINS_EARNED = 'ml_coins_earned',
  STREAK_MILESTONE = 'streak_milestone',
  EXERCISE_FEEDBACK = 'exercise_feedback',
}

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

interface NotificationData {
  achievement_id?: string;
  achievement_name?: string;
  achievement_icon?: string;
  rank?: string;
  previous_rank?: string;
  friend_id?: string;
  friend_name?: string;
  guild_id?: string;
  guild_name?: string;
  mission_id?: string;
  mission_name?: string;
  level?: number;
  coins_amount?: number;
  current_streak?: number;
  exercise_id?: string;
  reference_url?: string;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const notificationTypeSchema = z.enum([
  'achievement_unlocked',
  'rank_up',
  'friend_request',
  'guild_invitation',
  'mission_completed',
  'level_up',
  'message_received',
  'system_announcement',
  'ml_coins_earned',
  'streak_milestone',
  'exercise_feedback'
]);

const notificationDataSchema = z.object({
  achievement_id: z.string().uuid().optional(),
  achievement_name: z.string().optional(),
  achievement_icon: z.string().optional(),
  rank: z.string().optional(),
  previous_rank: z.string().optional(),
  friend_id: z.string().uuid().optional(),
  friend_name: z.string().optional(),
  guild_id: z.string().uuid().optional(),
  guild_name: z.string().optional(),
  mission_id: z.string().uuid().optional(),
  mission_name: z.string().optional(),
  level: z.number().int().optional(),
  coins_amount: z.number().int().optional(),
  current_streak: z.number().int().optional(),
  exercise_id: z.string().uuid().optional(),
  reference_url: z.string().url().optional()
}).passthrough();

const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: notificationDataSchema.optional(),
  read: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

### 6.9 API Response Types

#### 6.9.1 APIResponse

**Description**: Standard API response wrapper

**TypeScript Definition**:
```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

interface APIError {
  code: string;
  message: string;
  details?: any;
}

interface ResponseMeta {
  timestamp: string;
  requestId?: string;
}
```

**Zod Schema**:
```typescript
const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional()
});

const responseMetaSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().optional()
});

const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: apiErrorSchema.optional(),
    meta: responseMetaSchema.optional()
  });
```

**Example Usage**:
```typescript
// Backend
const response: APIResponse<User> = {
  success: true,
  data: user,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'req-123'
  }
};

// Frontend
const handleResponse = async () => {
  const response = await api.get<APIResponse<User>>('/users/me');
  if (response.data.success && response.data.data) {
    setUser(response.data.data);
  }
};
```

---

#### 6.9.2 PaginatedResponse

**Description**: Paginated list response

**TypeScript Definition**:
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Zod Schema**:
```typescript
const paginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0)
});

const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: paginationMetaSchema
  });
```

**Example Usage**:
```typescript
const response: PaginatedResponse<Module> = {
  success: true,
  data: modules,
  meta: {
    total: 25,
    page: 1,
    limit: 10,
    totalPages: 3
  }
};
```

---

#### 6.9.3 ErrorCode

**Description**: Standard error codes

**TypeScript Definition**:
```typescript
enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

**Zod Schema**:
```typescript
const errorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'INVALID_CREDENTIALS',
  'EMAIL_EXISTS',
  'ACCOUNT_INACTIVE',
  'ACCOUNT_SUSPENDED',
  'FORBIDDEN',
  'VALIDATION_ERROR',
  'WEAK_PASSWORD',
  'NOT_FOUND',
  'ALREADY_EXISTS',
  'INSUFFICIENT_FUNDS',
  'INTERNAL_ERROR',
  'DATABASE_ERROR'
]);
```

---

### 6.10 Utility Types

#### 6.10.1 Timestamps

**Description**: Common timestamp fields

**TypeScript Definition**:
```typescript
interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

interface TimestampsOptional {
  created_at?: Date;
  updated_at?: Date;
}
```

**Zod Schema**:
```typescript
const timestampsSchema = z.object({
  created_at: z.date(),
  updated_at: z.date()
});

const timestampsOptionalSchema = z.object({
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});
```

---

#### 6.10.2 SoftDelete

**Description**: Soft delete functionality

**TypeScript Definition**:
```typescript
interface SoftDelete {
  deleted_at?: Date;
  is_deleted?: boolean;
}
```

**Zod Schema**:
```typescript
const softDeleteSchema = z.object({
  deleted_at: z.date().optional(),
  is_deleted: z.boolean().optional()
});
```

---

#### 6.10.3 AuditFields

**Description**: Audit trail fields

**TypeScript Definition**:
```typescript
interface AuditFields {
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const auditFieldsSchema = z.object({
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.10.4 PaginationParams

**Description**: Query parameters for pagination

**TypeScript Definition**:
```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
```

**Zod Schema**:
```typescript
const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});
```

---

#### 6.10.5 FilterOptions

**Description**: Generic filter options

**TypeScript Definition**:
```typescript
interface FilterOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const filterOptionsSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.string().optional()
}).passthrough();
```

---

## 7. Type Guards & Validators

### 7.1 Zod Integration

All types should have corresponding Zod schemas for runtime validation.

**Example Implementation**:

```typescript
// src/auth/auth.schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['student', 'admin_teacher']).default('student')
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional()
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.string()
});
```

### 7.2 Type Guards

**Example Implementation**:

```typescript
// src/auth/auth.guards.ts
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { loginSchema, registerSchema, authResponseSchema } from './auth.schemas';

export function isLoginDto(value: unknown): value is LoginDto {
  return loginSchema.safeParse(value).success;
}

export function isRegisterDto(value: unknown): value is RegisterDto {
  return registerSchema.safeParse(value).success;
}

export function isAuthResponse(value: unknown): value is AuthResponse {
  return authResponseSchema.safeParse(value).success;
}

export function assertLoginDto(value: unknown): asserts value is LoginDto {
  const result = loginSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid LoginDto: ${result.error.message}`);
  }
}
```

### 7.3 Validation Middleware (Backend)

**Example Implementation**:

```typescript
// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: error.errors
          }
        });
      } else {
        next(error);
      }
    }
  };
}

// Usage
import { loginSchema } from '@glit/shared-types';

router.post('/login', validate(loginSchema), authController.login);
```

### 7.4 React Hook Form Integration (Frontend)

**Example Implementation**:

```typescript
// hooks/useValidatedForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function useValidatedForm<T extends z.ZodTypeAny>(schema: T) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema)
  });
}

// Component usage
import { LoginDto, loginSchema } from '@glit/shared-types';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useValidatedForm(loginSchema);

  const onSubmit = async (data: LoginDto) => {
    await api.post('/auth/login', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
};
```

---

## 8. Implementation Recommendations

### 8.1 Package Setup

**package.json**:
```json
{
  "name": "@glit/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for GAMILITplatform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "typescript",
    "types",
    "glit",
    "shared"
  ],
  "author": "GAMILIT Team",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "peerDependencies": {
    "zod": "^3.22.4"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 8.2 Publishing Strategy

1. **Private NPM Registry (Recommended)**:
   ```bash
   npm publish --registry=https://npm.glit.internal
   ```

2. **Git Submodule** (Alternative):
   ```bash
   git submodule add https://github.com/glit/shared-types.git packages/shared-types
   ```

3. **Local Development**:
   ```json
   {
     "dependencies": {
       "@glit/shared-types": "file:../shared-types"
     }
   }
   ```

### 8.3 Consuming in Backend

**Installation**:
```bash
npm install @glit/shared-types
```

**Usage**:
```typescript
import {
  User,
  LoginDto,
  AuthResponse,
  loginSchema,
  isLoginDto
} from '@glit/shared-types';

// In service
async function login(credentials: LoginDto): Promise<AuthResponse> {
  // ...
}

// In controller with validation
router.post('/login', validate(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});
```

### 8.4 Consuming in Frontend

**Installation**:
```bash
npm install @glit/shared-types
```

**Usage**:
```typescript
import {
  Module,
  Exercise,
  SubmitExerciseDto,
  submitExerciseSchema
} from '@glit/shared-types';

// In API client
const api = {
  async submitExercise(data: SubmitExerciseDto) {
    return axios.post<SubmissionResponse>('/exercises/submit', data);
  }
};

// In React component
const ExercisePlayer = () => {
  const { register, handleSubmit } = useValidatedForm(submitExerciseSchema);

  const onSubmit = async (data: SubmitExerciseDto) => {
    const result = await api.submitExercise(data);
    // ...
  };
};
```

---

## 9. Migration Guide

### 9.1 Phase 1: Install Shared Types Package

```bash
# Backend
cd /home/isem/workspace/projects/glit/backend
npm install @glit/shared-types

# Frontend
cd /home/isem/workspace/gamilit-platform-web
npm install @glit/shared-types
```

### 9.2 Phase 2: Gradual Migration

**Step 1**: Start with core types (User, UserProfile, AuthUser)

```typescript
// Before
interface User {
  id: string;
  email: string;
  role: string;
}

// After
import { User } from '@glit/shared-types';
```

**Step 2**: Migrate DTOs

```typescript
// Before
interface LoginRequest {
  email: string;
  password: string;
}

// After
import { LoginDto } from '@glit/shared-types';
```

**Step 3**: Migrate domain types

```typescript
// Before
interface Module {
  id: string;
  title: string;
  // ...
}

// After
import { Module } from '@glit/shared-types';
```

### 9.3 Phase 3: Update Imports

**Backend**:
```typescript
// Old
import { User } from '../shared/types';

// New
import { User } from '@glit/shared-types';
```

**Frontend**:
```typescript
// Old
import { Module } from '@/shared/types';

// New
import { Module } from '@glit/shared-types';
```

### 9.4 Phase 4: Remove Old Types

After migration is complete:

```bash
# Backend
rm -rf src/shared/types

# Frontend
rm -rf src/shared/types
```

### 9.5 Backward Compatibility

During migration, maintain backward compatibility:

```typescript
// src/shared/types/index.ts (temporary)
export * from '@glit/shared-types';

// This allows old imports to continue working:
// import { User } from '../shared/types'; // Still works
```

---

## 10. Breaking Changes Strategy

### 10.1 Deprecation Process

1. **Add deprecation notice**:
```typescript
interface User {
  id: string;
  email: string;

  /** @deprecated Use display_name instead. Will be removed in v3.0.0 */
  displayName?: string;

  display_name: string;
}
```

2. **Log warnings in development**:
```typescript
if (process.env.NODE_ENV === 'development') {
  if (user.displayName !== undefined) {
    console.warn('Warning: user.displayName is deprecated. Use display_name instead.');
  }
}
```

3. **Update documentation**:
```markdown
## Breaking Changes in v3.0.0
- **User.displayName** has been removed. Use **User.display_name** instead.
```

### 10.2 Version Migration

**Major Version Bump (v1.x.x → v2.0.0)**:

```typescript
// v1.x.x
interface Module {
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

// v2.0.0
interface Module {
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
```

**Migration Guide**:
```typescript
// Migration helper
function migrateModuleV1toV2(moduleV1: ModuleV1): ModuleV2 {
  const difficultyMap = {
    easy: 'beginner',
    medium: 'intermediate',
    hard: 'advanced'
  };

  return {
    ...moduleV1,
    difficulty_level: difficultyMap[moduleV1.difficultyLevel] || 'beginner'
  };
}
```

### 10.3 Testing Strategy

**Unit Tests**:
```typescript
import { userSchema } from '@glit/shared-types';

describe('User Schema Validation', () => {
  it('should validate a correct user', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      role: 'student'
    };

    const result = userSchema.safeParse(user);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const user = {
      id: '123',
      email: 'invalid-email',
      role: 'student'
    };

    const result = userSchema.safeParse(user);
    expect(result.success).toBe(false);
  });
});
```

---

## Summary

This shared types library provides:

1. **70+ fully documented types** covering all domains
2. **Zod schemas** for runtime validation
3. **Type guards** for type safety
4. **Backward compatibility** strategy
5. **Migration guide** for smooth adoption
6. **Complete examples** for backend and frontend usage

### Key Benefits

- **Type Safety**: Compile-time checking across the stack
- **Single Source of Truth**: No duplicate definitions
- **Runtime Validation**: Zod schemas at API boundaries
- **Developer Experience**: IntelliSense, autocomplete, inline docs
- **Maintainability**: Centralized type definitions

### Next Steps

1. Create `@glit/shared-types` package
2. Implement all types with Zod schemas
3. Add comprehensive tests
4. Publish to private npm registry
5. Begin gradual migration in backend and frontend
6. Remove old duplicate types after migration

---

**Document Status**: Production Ready
**Last Review**: 2025-10-27
**Version**: 1.0.0
