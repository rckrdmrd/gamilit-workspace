---
titulo: Estandar Frontend - Definiciones de Tipos
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-19
ultima_actualizacion: 2026-02-27
---

# ESTANDAR-FRONTEND-TYPES — Estándar de Definiciones de Tipos

**Version:** 1.0.0 | **Fecha:** 2026-02-19 | **Estado:** Activo
**Basado en:** 04-AUDIT-TYPE-DEFINITIONS.md (91 archivos de tipos, 215 inline types)

## 1. Jerarquía de Tipos

### 1.1 Regla: 3 niveles, prioridad de importación top-down

```
shared/types/              ← Nivel 1: Tipos compartidos cross-portal
  api.types.ts             ← PaginatedResponse, ApiResponse, ApiError
  auth.types.ts            ← User, Session, AuthState
  entities.types.ts        ← Student, Teacher, Classroom, Exercise
  gamification.types.ts    ← Achievement, Rank, MLCoins, XP
  ...

apps/{portal}/types/       ← Nivel 2: Tipos específicos del portal
  admin.types.ts           ← SystemAlert, AdminDashboard, etc.
  teacher.types.ts         ← TeacherAssignment, GradingRubric, etc.
  student.types.ts         ← StudentProgress, ExerciseAttempt, etc.

features/*/types/          ← Nivel 3: Tipos feature-specific (solo si no encajan arriba)
  auth.types.ts            ← LoginForm, RegisterForm (formularios)
  mechanics/*.types.ts     ← Tipos de mecánicas de ejercicio
```

### 1.2 Regla: Importación SIEMPRE top-down

```tsx
// ✅ CORRECTO — importar del nivel más alto posible
import type { Student, Exercise } from '@shared/types/entities.types';
import type { TeacherAssignment } from '@/apps/teacher/types/teacher.types';

// ❌ INCORRECTO — importar del nivel más bajo
import type { Student } from '@/features/progress/types/progress.types';
import type { Exercise } from '@/apps/student/types/student.types';
```

---

## 2. Anti-Duplicados

### 2.1 Regla: Un tipo, una definición

| Tipo | Ubicación SSOT | NO duplicar en |
|------|---------------|---------------|
| `PaginatedResponse` | `shared/types/api.types.ts` | apiTypes.ts, hooks inline |
| `Exercise` | `shared/types/entities.types.ts` | progress.types.ts, student hooks |
| `Achievement` | `shared/types/gamification.types.ts` | achievementsAPI.ts, store inline |
| `User` | `shared/types/auth.types.ts` | adminTypes.ts, hooks inline |
| `ExerciseAttempt` | `shared/types/entities.types.ts` | progress hooks, student hooks |
| `LeaderboardEntry` | `shared/types/gamification.types.ts` | components inline |
| `Organization` | `apps/admin/types/admin.types.ts` | adminTypes.ts, Zod schemas |

### 2.2 Regla: Extensión via composition, NO redefinición

```tsx
// ✅ CORRECTO — Extender tipo existente
import type { Exercise } from '@shared/types/entities.types';

interface ExerciseWithProgress extends Exercise {
  completedAt: string;
  score: number;
}

// ✅ CORRECTO — Pick/Omit para subset
type ExerciseSummary = Pick<Exercise, 'id' | 'title' | 'type'>;

// ❌ INCORRECTO — Redefinir con los mismos campos
interface Exercise {
  id: string;
  title: string;
  type: string;
  // ... mismo contenido que shared/types
}
```

---

## 3. Inline Types

### 3.1 Regla: NO tipos inline en hooks (extraer a archivos)

```tsx
// ❌ INCORRECTO — tipos inline en hook
export function useStudents() {
  interface StudentResponse {
    students: Student[];
    total: number;
  }
  // ...
}

// ✅ CORRECTO — tipos en archivo dedicado
// apps/admin/types/admin.types.ts
export interface StudentResponse {
  students: Student[];
  total: number;
}

// hooks/useStudents.ts
import type { StudentResponse } from '@/apps/admin/types/admin.types';
```

**Impacto:** ~215 tipos inline en 87 hooks necesitan extracción.

### 3.2 Excepción: Tipos de componentes props

Los props de componentes SÍ pueden estar inline en el mismo archivo:

```tsx
// ✅ ACEPTABLE — Props co-located con componente
interface StudentCardProps {
  name: string;
  rank: string;
}

export function StudentCard({ name, rank }: StudentCardProps) { ... }
```

---

## 4. Convenciones de Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Interface de entidad | PascalCase singular | `Student`, `Exercise` |
| Interface de respuesta API | Entity + `Response` | `StudentResponse`, `PaginatedStudentResponse` |
| Interface de request | Entity + `Request` o `Payload` | `CreateStudentPayload` |
| Interface de props | Component + `Props` | `StudentCardProps` |
| Type alias (union) | PascalCase | `ExerciseType`, `UserRole` |
| Enum-like types | PascalCase | `RankLevel`, `AlertSeverity` |
| Type file | camelCase + `.types.ts` | `admin.types.ts`, `gamification.types.ts` |

---

## 5. `any` Policy

### 5.1 Regla: ZERO `any` en archivos de tipos

```tsx
// ❌ PROHIBIDO en archivos .types.ts
interface Exercise {
  metadata: any;
  adapter: (exercise: any) => any;
}

// ✅ CORRECTO — Usar unknown o tipos específicos
interface Exercise {
  metadata: Record<string, unknown>;
  adapter: (exercise: ExerciseData) => ExerciseResult;
}
```

**En archivos no-tipo:** `any` se tolera con `eslint-disable` comment explicativo, pero nunca en definiciones de tipos.

---

## Migración

**Prioridad 1:** Resolver 7 tipos duplicados críticos (PaginatedResponse, Exercise, Achievement, ExerciseAttempt, User, Organization, LeaderboardEntry)
**Prioridad 2:** Mover `src/types/admin/` → `apps/admin/types/`
**Prioridad 3:** Extraer tipos inline de hooks más usados (gradual)
**Prioridad 4:** Eliminar 9 `any` en archivos de tipos
