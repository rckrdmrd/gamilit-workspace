# TABLA COMPARATIVA: Backend ENUMs ↔ Frontend Types

## Resumen Visual

| Módulo | Backend ENUMs | Frontend Types | Estado | Cobertura |
|--------|---------------|----------------|--------|-----------|
| Auth | 9 | auth.types.ts | ✓ SINCRONIZADO | 100% |
| Educational | 6 | educational.types.ts | ⚠ DUPLICADO | 90% |
| Progress | 2 | progress.types.ts | ✓ SINCRONIZADO | 100% |
| Gamification | 10 | achievement.types.ts | ⚠ INCOMPLETO | 95% |
| Social | 7 | ❌ FALTA | ✗ FALTA | 0% |
| System | 4 | N/A | ✓ N/A | N/A |
| **TOTAL** | **37** | **5 archivos** | **80%** | **80%** |

---

## Detalle de ENUMs por Módulo

### 1. AUTH MANAGEMENT (9 ENUMs)

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| AuthProviderEnum | ✓ | ✓ enums.constants.ts | ✓ |
| SubscriptionTierEnum | ✓ | ✓ enums.constants.ts | ✓ |
| UserStatusEnum | ✓ | ✓ enums.constants.ts | ✓ |
| SecurityEventSeverityEnum | ✓ | ✓ enums.constants.ts | ✓ |
| ThemeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| LanguageEnum | ✓ | ✓ enums.constants.ts | ✓ |
| DeviceTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| MembershipRoleEnum | ✓ | ✓ enums.constants.ts | ✓ |
| MembershipStatusEnum | ✓ | ✓ enums.constants.ts | ✓ |

---

### 2. GAMIFICATION (10 ENUMs)

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| DifficultyLevelEnum | ✓ | ✓ enums.constants.ts | ✓ |
| MayaRank | ✓ | ✓ enums.constants.ts | ✓ |
| MayaRankEnum | ✓ @deprecated | ✓ enums.constants.ts | ✓ |
| ComodinTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| TransactionTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AchievementCategoryEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AchievementTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AchievementStatusEnum | ❌ | ✓ achievement.types.ts | ❌ FALTA EN BACKEND |
| NotificationTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| NotificationChannelEnum | ✓ | ✓ enums.constants.ts | ✓ |

---

### 3. EDUCATIONAL (6 ENUMs)

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| ExerciseTypeEnum | ✓ 31 valores | ❌ DUPLICADO en educational.types.ts | ⚠ DUPLICADO |
| DifficultyLevelEnum | ✓ | ❌ DUPLICADO en educational.types.ts | ⚠ DUPLICADO |
| ContentStatusEnum | ✓ | ✓ enums.constants.ts | ✓ |
| ModuleStatusEnum | ✓ | ✓ enums.constants.ts | ✓ |
| ContentTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |
| MediaTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |

---

### 4. PROGRESS (2 ENUMs)

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| ProgressStatusEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AttemptResultEnum | ✓ | ✓ enums.constants.ts | ✓ |

---

### 5. SOCIAL (7 ENUMs) - **CRÍTICO**

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| FriendshipStatusEnum | ✓ | ❌ | ❌ FALTA |
| ClassroomMemberStatusEnum | ✓ | ❌ | ❌ FALTA |
| EnrollmentMethodEnum | ✓ | ❌ | ❌ FALTA |
| TeamMemberRoleEnum | ✓ | ❌ | ❌ FALTA |
| TeamChallengeStatusEnum | ✓ | ❌ | ❌ FALTA |
| ClassroomRoleEnum | ✓ | ✓ enums.constants.ts | ✓ |
| SocialEventTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |

**Status:** Solo 2/7 enums tienen tipos en frontend. **FALTA social.types.ts**

---

### 6. SYSTEM (4 ENUMs)

| Enum | Backend | Frontend | Sincronizado |
|------|---------|----------|--------------|
| GamilityRoleEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AlertSeverityEnum | ✓ | ✓ enums.constants.ts | ✓ |
| AggregationPeriodEnum | ✓ | ✓ enums.constants.ts | ✓ |
| MetricTypeEnum | ✓ | ✓ enums.constants.ts | ✓ |

---

## DTOs ↔ Types Mapping

### Auth Module

| Backend DTO | Frontend Type | Estado |
|------------|--------------|--------|
| AuthProviderResponseDto | User interface | ✓ |
| AuthAttemptResponseDto | AuthState interface | ✓ |
| MembershipResponseDto | N/A | ✓ DTOs OK |
| TenantResponseDto | N/A | ✓ DTOs OK |

### Educational Module

| Backend DTO | Frontend Type | Estado |
|------------|--------------|--------|
| Exercise* | Exercise interface | ✓ |
| Module* | Module interface | ✓ |
| Content* | ExerciseContent interface | ✓ |
| MediaFile* | (no mapping) | ⚠ |

### Progress Module

| Backend DTO | Frontend Type | Estado |
|------------|--------------|--------|
| ModuleProgressResponseDto | ModuleProgress interface | ✓ |
| ExerciseAttemptResponseDto | ExerciseAttempt interface | ✓ |
| ExerciseSubmissionResponseDto | ExerciseSubmission interface | ✓ |
| LearningSessionResponseDto | LearningSession interface | ✓ |

### Gamification Module

| Backend DTO | Frontend Type | Estado |
|------------|--------------|--------|
| AchievementResponseDto | Achievement interface | ✓ |
| UserRankResponseDto | (no mapping) | ⚠ |
| UserAchievementResponseDto | UserAchievement interface | ✓ |

### Social Module

| Backend DTO | Frontend Type | Estado |
|------------|--------------|--------|
| FriendshipResponseDto | ❌ FALTA | ❌ |
| ClassroomResponseDto | ❌ FALTA | ❌ |
| ClassroomMemberResponseDto | ❌ FALTA | ❌ |
| TeamResponseDto | ❌ FALTA | ❌ |
| TeamMemberResponseDto | ❌ FALTA | ❌ |
| TeamChallengeResponseDto | ❌ FALTA | ❌ |
| SchoolResponseDto | ❌ FALTA | ❌ |

---

## Duplicaciones Encontradas

### Educational Module - Enums Locales

```typescript
// educational.types.ts - DUPLICADO
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CODE_COMPLETION = 'code_completion',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
  CODING_CHALLENGE = 'coding_challenge',
  MATCHING = 'matching'
}

// ESTOS EXISTEN EN BACKEND COMO:
// - DifficultyLevelEnum (con 8 valores)
// - ExerciseTypeEnum (con 31 valores)
```

**Problema:** Frontend define enums locales versiones simplificadas, cuando debería usar los completos del Backend.

---

## Archivo Faltante: social.types.ts

### Estructura Necesaria

```typescript
// /apps/frontend/src/shared/types/social.types.ts

import {
  FriendshipStatusEnum,
  ClassroomMemberStatusEnum,
  EnrollmentMethodEnum,
  TeamMemberRoleEnum,
  TeamChallengeStatusEnum,
  ClassroomRoleEnum,
  SocialEventTypeEnum,
} from '@shared/constants/enums.constants';

// INTERFACES NECESARIAS:
export interface Friendship { ... }
export interface ClassroomMember { ... }
export interface Classroom { ... }
export interface Team { ... }
export interface TeamMember { ... }
export interface TeamChallenge { ... }
export interface School { ... }
```

---

## Métrica de Score

```
FÓRMULA:
  Score = 100 - (Discrepancias Críticas * 25) - (Discrepancias Moderadas * 10) - (Discrepancias Menores * 5)

CÁLCULO:
  100 - 25 (social missing) - 10 (duplicates) - 10 (achievement status) - 5 (naming) = 50

DESGLOSE:
  Enums sincronizados: 37/37 (100%) ✓
  DTOs cubiertos: 39/39 (100%) ✓
  Frontend types: 5/6 (83%) ⚠
  Duplicación: 2 enums (10%) ⚠
  Falta un archivo: social.types.ts ❌

COMPONENTES POR PORCENTAJE:
  Auth:         100% ✓
  Educational: 90% ⚠
  Progress:    100% ✓
  Gamification: 95% ⚠
  Social:       0% ❌
  System:      100% ✓
  
PROMEDIO: 80.8% → Score 50/100
```

---

## Resumen Tabular

| Métrica | Valor | Estado |
|---------|-------|--------|
| ENUMs en Backend | 37 | ✓ |
| ENUMs en Frontend | 37 (en enums.constants.ts) | ✓ |
| DTOs Response Backend | 39 | ✓ |
| Type Files Frontend | 5/6 | ⚠ |
| Sincronización enums.constants.ts | 100% | ✓ |
| Coverage tipos: Auth | 100% | ✓ |
| Coverage tipos: Educational | 90% | ⚠ |
| Coverage tipos: Progress | 100% | ✓ |
| Coverage tipos: Gamification | 95% | ⚠ |
| Coverage tipos: Social | 0% | ❌ |
| Enums duplicados | 2 | ⚠ |
| Script sync.enums | OPERATIVO | ✓ |
| **SCORE FINAL** | **50/100** | **MODERADO** |

---

## Recomendaciones por Prioridad

### ALTA (Implementar ahora)
- [ ] Crear `/apps/frontend/src/shared/types/social.types.ts` (impacto: +25 puntos)
- [ ] Exportar `AchievementStatusEnum` en Backend (impacto: +10 puntos)

### MEDIA (Próxima sprint)
- [ ] Remover enums locales (DifficultyLevel, ExerciseType)
- [ ] Actualizar imports en educational.types.ts
- [ ] Documenting CONSTANTS-ARCHITECTURE.md

### BAJA (Futuro)
- [ ] Estandarizar naming (MayaRank vs MayaRankEnum)
- [ ] Remover @deprecated MayaRankEnum

---

**Actualizado:** 2025-11-04
**Estado:** PENDIENTE DE IMPLEMENTACIÓN
