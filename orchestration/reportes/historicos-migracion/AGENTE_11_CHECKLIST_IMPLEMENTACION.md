# AGENTE 11: Checklist de Implementación

## Estado: PENDIENTE
**Objetivo:** Aumentar Score de 50/100 a 95/100
**Tiempo Estimado:** 6 horas
**Prioridad:** ALTA

---

## FASE 1: CREAR social.types.ts (3 horas) - CRÍTICO

### Tarea 1.1: Crear archivo base
- [ ] Crear `/apps/frontend/src/shared/types/social.types.ts`
- [ ] Importar enums desde `enums.constants.ts`
- [ ] Estructura inicial

### Tarea 1.2: Interfaces básicas

```typescript
// Basarse en Backend DTOs:
// - /apps/backend/src/modules/social/dto/friendship-response.dto.ts
// - /apps/backend/src/modules/social/dto/classroom-response.dto.ts
// - /apps/backend/src/modules/social/dto/classroom-member-response.dto.ts
// - /apps/backend/src/modules/social/dto/team-response.dto.ts
// - /apps/backend/src/modules/social/dto/team-member-response.dto.ts
// - /apps/backend/src/modules/social/dto/team-challenge-response.dto.ts
// - /apps/backend/src/modules/social/dto/school-response.dto.ts
```

Interfaces a crear:
- [ ] Friendship
  - id
  - user_id
  - friend_id
  - status: FriendshipStatusEnum
  - created_at
  - updated_at

- [ ] Classroom
  - id
  - tenant_id
  - teacher_id
  - name
  - description
  - code
  - member_count
  - is_active
  - created_at
  - updated_at

- [ ] ClassroomMember
  - id
  - classroom_id
  - user_id
  - status: ClassroomMemberStatusEnum
  - enrollment_method: EnrollmentMethodEnum
  - role: ClassroomRoleEnum
  - joined_at
  - created_at
  - updated_at

- [ ] Team
  - id
  - tenant_id
  - name
  - description
  - member_count
  - created_at
  - updated_at

- [ ] TeamMember
  - id
  - team_id
  - user_id
  - role: TeamMemberRoleEnum
  - joined_at
  - created_at
  - updated_at

- [ ] TeamChallenge
  - id
  - team_id
  - challenge_name
  - status: TeamChallengeStatusEnum
  - started_at
  - completed_at
  - winner_team_id
  - participants_count
  - created_at
  - updated_at

- [ ] School
  - id
  - name
  - code
  - address
  - city
  - country
  - principal_name
  - email
  - phone
  - website
  - logo_url
  - created_at
  - updated_at

### Tarea 1.3: Barrel export
- [ ] Actualizar `/apps/frontend/src/shared/types/index.ts`
  ```typescript
  export * from './social.types';
  ```

### Tarea 1.4: Validación
- [ ] Verificar que todos los imports compilan
- [ ] Checkear tipos no tienen errores TypeScript
- [ ] Validar contra DTOs Backend

---

## FASE 2: EXPORTAR AchievementStatusEnum (1 hora) - CRÍTICO

### Tarea 2.1: Backend - Añadir enum
- [ ] Abrir `/apps/backend/src/shared/constants/enums.constants.ts`
- [ ] Añadir después de `AchievementTypeEnum`:

```typescript
/**
 * Estados de logros (achievement)
 * @see DDL: achievement_status ENUM
 */
export enum AchievementStatusEnum {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  EARNED = 'earned',
  CLAIMED = 'claimed',
}
```

- [ ] Guardar archivo

### Tarea 2.2: Ejecutar sync
- [ ] Ejecutar: `npm run sync:enums`
- [ ] Verificar que se sincroniza correctamente

### Tarea 2.3: Frontend - Actualizar imports
- [ ] Abrir `/apps/frontend/src/shared/types/achievement.types.ts`
- [ ] Reemplazar enum local:
  ```typescript
  // ANTES:
  export enum AchievementStatus {
    LOCKED = 'locked',
    IN_PROGRESS = 'in_progress',
    EARNED = 'earned',
    CLAIMED = 'claimed',
  }
  
  // DESPUÉS:
  import { AchievementStatusEnum } from '@shared/constants/enums.constants';
  export type AchievementStatus = AchievementStatusEnum;
  ```
- [ ] Actualizar referencias en interfaces

### Tarea 2.4: Validación
- [ ] Verificar compilación TypeScript
- [ ] Buscar referencias de AchievementStatus en todo frontend

---

## FASE 3: CONSOLIDAR ENUMS DUPLICADOS (2 horas) - MODERADO

### Tarea 3.1: Remover duplicados en educational.types.ts
- [ ] Abrir `/apps/frontend/src/shared/types/educational.types.ts`

### Tarea 3.2: DifficultyLevel
- [ ] ANTES:
  ```typescript
  export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
  }
  ```

- [ ] DESPUÉS:
  ```typescript
  import { DifficultyLevelEnum } from '@shared/constants/enums.constants';
  export type DifficultyLevel = DifficultyLevelEnum;
  ```

- [ ] Actualizar referencias en Exercise interface:
  ```typescript
  difficulty: DifficultyLevelEnum; // en lugar de DifficultyLevel
  ```

### Tarea 3.3: ExerciseType
- [ ] ANTES:
  ```typescript
  export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    CODE_COMPLETION = 'code_completion',
    // ... solo 6 valores
  }
  ```

- [ ] DESPUÉS:
  ```typescript
  import { ExerciseTypeEnum } from '@shared/constants/enums.constants';
  export type ExerciseType = ExerciseTypeEnum;
  ```

- [ ] Actualizar referencias en Exercise interface:
  ```typescript
  type: ExerciseTypeEnum; // en lugar de ExerciseType
  ```

### Tarea 3.4: Actualizar comentarios
- [ ] Actualizar comentarios en Exercise interface:
  ```typescript
  /**
   * Exercise type (using ExerciseTypeEnum from shared constants)
   * All 31 values supported: crucigrama, sopa_letras, ...
   */
  type: ExerciseTypeEnum;
  ```

### Tarea 3.5: Validación
- [ ] Verificar compilación TypeScript
- [ ] Buscar referencias de enums locales removidos
- [ ] Actualizar tests si existen

---

## FASE 4: ACTUALIZAR DOCUMENTACIÓN (1 hora) - IMPORTANTE

### Tarea 4.1: Actualizar CONSTANTS-ARCHITECTURE.md
- [ ] Abrir doc de arquitectura
- [ ] Añadir sección: "Tipos Compartidos (Types/DTOs)"
- [ ] Documentar mapping Backend DTOs ↔ Frontend Types

### Tarea 4.2: Crear guía de sincronización
- [ ] Documento: "ENUM_SYNC_GUIDE.md"
- [ ] Paso a paso para mantener sincronización
- [ ] Checklist para cambios futuros

### Tarea 4.3: Actualizar README
- [ ] Mencionar social.types.ts nuevo
- [ ] Referencias a documentación

---

## VALIDACIÓN FINAL

### Testing Checklist
- [ ] `npm run sync:enums` ejecuta sin errores
- [ ] TypeScript: `tsc --noEmit` sin errores
- [ ] ESLint: `npm run lint` sin errores
- [ ] Compilación Build: `npm run build` exitosa

### Git Checklist
- [ ] Crear rama: `feature/agente-11-types-sync`
- [ ] Commits atómicos:
  1. "feat: create social.types.ts"
  2. "feat: export AchievementStatusEnum in backend"
  3. "refactor: consolidate educational enum duplicates"
  4. "docs: update CONSTANTS-ARCHITECTURE.md"
  
- [ ] PR Review antes de merge
- [ ] Squash merge a main

### Post-Implementation
- [ ] Ejecutar test suite
- [ ] Verificar app compila
- [ ] Hacer push a main
- [ ] Crear tag: `agente-11-completed`

---

## MÉTRICAS DE ÉXITO

### Antes vs Después

```
ANTES (50/100):
  ✓ Auth: 100%
  ⚠ Educational: 90% (duplicados)
  ✓ Progress: 100%
  ⚠ Gamification: 95% (sin AchievementStatus)
  ❌ Social: 0% (falta types)
  ✓ System: 100%

DESPUÉS (95/100):
  ✓ Auth: 100%
  ✓ Educational: 100% (sin duplicados)
  ✓ Progress: 100%
  ✓ Gamification: 100% (con AchievementStatus)
  ✓ Social: 100% (con social.types.ts)
  ✓ System: 100%
```

### Indicadores Clave
- [ ] ENUMs sincronizados: 37/37 (100%)
- [ ] Types coverage: 6/6 archivos (100%)
- [ ] Duplicación: 0 enums
- [ ] DTOs mapeados: 39/39 (100%)
- [ ] Score final: 95/100 (o más)

---

## ESTIMACIÓN DE TIEMPO

| Fase | Tarea | Tiempo | Dependencias |
|------|-------|--------|--------------|
| 1 | Crear social.types.ts | 3h | - |
| 2 | AchievementStatusEnum | 1h | sync-enums |
| 3 | Consolidar duplicados | 2h | - |
| 4 | Documentación | 1h | Fases 1-3 |
| 5 | Testing & Validation | 1h | Todas |
| **TOTAL** | | **6-7h** | |

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Imports en componentes | Media | Buscar referencias antes de cambios |
| Break tipos frontend | Baja | Test build antes de merge |
| Sync incorrecto | Baja | Ejecutar sync script manualmente |
| Documentación desactualizada | Media | Actualizar simultáneamente |

---

## NOTAS IMPORTANTES

1. **No modificar backend DTOs:** Solo añadir AchievementStatusEnum, no cambiar DTOs existentes

2. **Mantener compatibilidad:** Después de consolidar duplicados, frontend debe seguir compilando

3. **Sync bidireccional:** El script sync-enums.ts solo va Backend → Frontend, no viceversa

4. **Testing exhaustivo:** Verificar que no hay regresiones en componentes sociales

5. **Documentación principal:** Actualizar en orden: código → docs → tests

---

**Generado:** 2025-11-04
**Estado:** LISTO PARA IMPLEMENTACIÓN
**Asignado a:** Developer Team
