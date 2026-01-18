# Analisis de Discrepancias Backend-Frontend - Gamilit

**Fecha:** 2026-01-18
**Autor:** Agente de Analisis
**Version:** 1.0.0
**Estado:** Analisis Completado

---

## Resumen Ejecutivo

Este documento presenta el analisis detallado de las discrepancias identificadas entre Backend y Frontend en el proyecto Gamilit. Se analizaron 5 areas principales de discrepancia, confirmando que **3 de las 5 discrepancias reportadas originalmente han sido RESUELTAS**, mientras que **2 requieren atencion**.

### Estadisticas

| Categoria | Estado | Cantidad |
|-----------|--------|----------|
| Resueltas | CONFIRMADO | 3 |
| Pendientes | REQUIERE ACCION | 2 |
| Total Analizadas | - | 5 |

---

## DISCREPANCIA 1: UserRankProgress - RESUELTA

### Descripcion Original
> Frontend espera `currentLevel/currentXP/totalXP`, Backend devuelve `current_rank/rank_progress_percentage`

### Analisis Detallado

**Backend (Resuelto):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/user-rank-progress-response.dto.ts`
- El DTO `UserRankProgressResponseDto` **YA incluye todos los campos necesarios**:
  - `level` (linea 53) - Nivel actual
  - `total_xp` (linea 60) - XP total acumulado
  - `current_xp` (linea 67) - XP dentro del nivel actual
  - `current_rank` (linea 34) - Rango maya actual
  - `rank_progress_percentage` (linea 96) - Porcentaje de progreso

**Frontend (Adaptado):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts`
- **Existe mapper de snake_case a camelCase** (lineas 112-127):
  ```typescript
  const mapUserProgressResponse = (response: BackendUserProgressResponse): UserRankProgress => ({
    currentRank: response.current_rank,
    currentLevel: response.level,
    currentXP: response.current_xp,
    totalXP: response.total_xp,
    // ... otros campos
  });
  ```

**Endpoint:**
- `GET /api/v1/gamification/ranks/users/:userId/progress` (linea 167 del controller)
- El endpoint llama a `ranksService.getFullUserProgress(userId)` (linea 501 del service)

### Estado: RESUELTO

**Evidencia:**
- El DTO backend tiene todos los campos
- El frontend tiene mapper implementado
- El endpoint existe y esta documentado con Swagger

### Archivos Afectados
| Archivo | Path Absoluto | Estado |
|---------|--------------|--------|
| DTO Backend | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/user-rank-progress-response.dto.ts` | OK |
| API Frontend | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts` | OK |
| Controller | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/controllers/ranks.controller.ts` | OK |
| Service | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/services/ranks.service.ts` | OK |

---

## DISCREPANCIA 2: Transaction source - PARCIALMENTE RESUELTA

### Descripcion Original
> Frontend espera `"exercise_completion"`, Backend devuelve `reference_type: "exercise"`

### Analisis Detallado

**Backend:**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/ml-coins/transaction-response.dto.ts`
- El DTO `TransactionResponseDto` devuelve:
  - `transaction_type: TransactionTypeEnum` (linea 46) - Enum con valores como `EARNED_EXERCISE`, `EARNED_MODULE`, etc.
  - `reference_type: string` (linea 70) - Tipo de referencia (ej: "exercise")

**Frontend:**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/types/economyTypes.ts`
- El tipo `EarningSource` (linea 65-74) define valores legacy:
  ```typescript
  export type EarningSource =
    | 'exercise_completion'
    | 'streak_bonus'
    | 'perfect_score'
    // ...
  ```
- **PERO** el tipo `Transaction` (linea 99) usa:
  ```typescript
  source: EarningSource | string;  // Source of earn or item purchased
  ```

**Discrepancia:**
1. **Backend usa enum `TransactionTypeEnum`** con valores como `earned_exercise`
2. **Frontend espera tipo `EarningSource`** con valores como `exercise_completion`
3. **NO hay mapper** que convierta `earned_exercise` -> `exercise_completion`

### Estado: REQUIERE ATENCION MENOR

**Impacto:** Bajo - El frontend acepta `string` como fallback pero las estadisticas por fuente pueden no funcionar correctamente.

### Propuesta de Correccion

**Opcion A - Agregar mapper en Frontend (RECOMENDADA):**

Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/api/economyAPI.ts` (si existe) o crear mapper

```typescript
const mapTransactionTypeToSource = (type: string): EarningSource => {
  const mapping: Record<string, EarningSource> = {
    'earned_exercise': 'exercise_completion',
    'earned_streak': 'streak_bonus',
    'earned_achievement': 'achievement_unlock',
    'earned_daily': 'daily_login',
    // ... otros mapeos
  };
  return mapping[type] || type;
};
```

**Opcion B - Deprecar EarningSource (Largo plazo):**

Eliminar `EarningSource` y usar directamente `TransactionTypeEnum` sincronizado del backend.

### Archivos Afectados
| Archivo | Path Absoluto | Accion Requerida |
|---------|--------------|------------------|
| Types Frontend | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/types/economyTypes.ts` | Actualizar o deprecar `EarningSource` |
| DTO Backend | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/ml-coins/transaction-response.dto.ts` | Sin cambios |
| Hooks Frontend | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/hooks/useTransactions.ts` | Revisar uso de `source` |

---

## DISCREPANCIA 3: ShopItem campos no expuestos - RESUELTA

### Descripcion Original
> `max_per_user`, `duration_days` no expuestos en DTO

### Analisis Detallado

**Backend (Resuelto):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/shop/shop-item-response.dto.ts`
- **Los campos YA estan expuestos** (agregados en TASK-2026-01-17-002):
  - `max_per_user` (linea 123) - Maximo de items por usuario
  - `duration_days` (linea 129) - Duracion en dias
  - `effect_data` (linea 135) - Datos del efecto
  - `metadata` (linea 145) - Metadatos adicionales

**Comentario en el archivo (lineas 11-13):**
```typescript
* @update 2026-01-18: Agregados campos faltantes para frontend
* - max_per_user, duration_days, effect_data, metadata
```

### Estado: RESUELTO

### Archivos Afectados
| Archivo | Path Absoluto | Estado |
|---------|--------------|--------|
| DTO Backend | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/shop/shop-item-response.dto.ts` | OK |

---

## DISCREPANCIA 4: Multipliers endpoint - RESUELTA

### Descripcion Original
> `GET /gamification/ranks/:userId/multipliers` NO EXISTE

### Analisis Detallado

**Backend (Implementado):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
- **Endpoint implementado** (lineas 205-234):
  ```typescript
  @Get('users/:userId/multipliers')
  async getUserMultipliers(@Param('userId') userId: string): Promise<MultiplierBreakdownResponseDto>
  ```

**Service (Implementado):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/services/ranks.service.ts`
- Metodo `getMultiplierBreakdown(userId)` (linea 585)

**DTO (Completo):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/multiplier-breakdown-response.dto.ts`
- Incluye: `base`, `rank`, `sources`, `total`, `has_expiring_soon`, `expiring_soon`

**Frontend (Adaptado):**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts`
- Funcion `getMultipliers(userId)` (linea 490)
- Mapper `mapMultiplierResponse` (linea 146)

### Estado: RESUELTO

### Archivos Afectados
| Archivo | Path Absoluto | Estado |
|---------|--------------|--------|
| Controller | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/controllers/ranks.controller.ts` | OK |
| Service | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/services/ranks.service.ts` | OK |
| DTO | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/multiplier-breakdown-response.dto.ts` | OK |
| API Frontend | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts` | OK |

---

## DISCREPANCIA 5: Role mapping - PENDIENTE REVISION

### Descripcion Original
> Frontend espera 7 roles, Backend tiene 3

### Analisis Detallado

**Backend - GamilityRoleEnum:**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/shared/constants/enums.constants.ts`
- Define **3 roles principales** (lineas 651-655):
  ```typescript
  export enum GamilityRoleEnum {
    STUDENT = 'student',
    ADMIN_TEACHER = 'admin_teacher',
    SUPER_ADMIN = 'super_admin',
  }
  ```

**Backend - Role Entity:**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/auth/entities/role.entity.ts`
- Soporta roles dinamicos (tabla `roles`) con permisos JSONB
- Comentario menciona 6 roles: student, teacher, parent, admin, content_creator, school_admin

**Frontend - UserRole:**
- Archivo: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/types/user.types.ts`
- Define **7 roles** (lineas 36-43):
  ```typescript
  export type UserRole =
    | 'student'           // BD: 'student'
    | 'admin_teacher'     // BD: 'admin_teacher' (CANONICO)
    | 'teacher'           // ALIAS -> 'admin_teacher'
    | 'admin'             // ALIAS -> 'admin_teacher'
    | 'institution_admin' // ALIAS -> 'admin_teacher'
    | 'super_admin'       // BD: 'super_admin'
    | 'content_creator';  // ALIAS -> 'admin_teacher' (pendiente)
  ```

### Analisis de Coherencia

La discrepancia **NO es un bug critico** sino una **decision de diseno documentada**:

1. **Backend tiene 3 roles canonicos** en el enum `GamilityRoleEnum` que coinciden con la BD
2. **Frontend acepta 7 valores** para compatibilidad con UI/UX
3. **Documentacion inline explica el mapeo** (comentarios en user.types.ts)
4. **Logica de conversion existe** en `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/auth/hooks/useRole.ts`:
   ```typescript
   const isTeacher = user?.role === 'admin_teacher';
   ```

### Estado: REVISION MENOR NECESARIA

**Problemas identificados:**
1. `content_creator` marcado como "pendiente definicion"
2. No hay mapeo formal documentado de aliases a valores canonicos
3. Riesgo de inconsistencia si alguien usa `'teacher'` en lugar de `'admin_teacher'`

### Propuesta de Correccion

**Crear helper de normalizacion de roles:**

Archivo sugerido: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/utils/roleUtils.ts`

```typescript
/**
 * Normaliza un rol a su valor canonico de BD
 */
export const normalizeRole = (role: UserRole): GamilityRole => {
  const mapping: Record<string, GamilityRole> = {
    'student': 'student',
    'admin_teacher': 'admin_teacher',
    'teacher': 'admin_teacher',
    'admin': 'admin_teacher',
    'institution_admin': 'admin_teacher',
    'super_admin': 'super_admin',
    'content_creator': 'admin_teacher', // TODO: definir rol propio
  };
  return mapping[role] || 'student';
};
```

### Archivos Afectados
| Archivo | Path Absoluto | Accion Requerida |
|---------|--------------|------------------|
| Enum Backend | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/shared/constants/enums.constants.ts` | Documentar decision |
| Types Frontend | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/types/user.types.ts` | Agregar JSDoc completo |
| Role Entity | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/auth/entities/role.entity.ts` | Sincronizar comentarios |
| Nuevo archivo | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/utils/roleUtils.ts` | Crear helper |

---

## Resumen de Acciones Requeridas

### Alta Prioridad
Ninguna - Las discrepancias criticas han sido resueltas.

### Media Prioridad

| # | Discrepancia | Accion | Estimacion |
|---|--------------|--------|------------|
| 2 | Transaction source | Crear mapper `TransactionType` -> `EarningSource` | 2h |
| 5 | Role mapping | Crear helper `normalizeRole()` y documentar | 1h |

### Baja Prioridad (Mejoras)

1. **Deprecar `EarningSource`** - Usar `TransactionTypeEnum` directamente (Discrepancia 2)
2. **Documentar modelo de roles** - ADR sobre decision de roles Frontend vs Backend (Discrepancia 5)

---

## Verificacion de Endpoints Criticos

### Endpoints de Gamificacion Verificados

| Endpoint | Metodo | Estado | Swagger |
|----------|--------|--------|---------|
| `/gamification/ranks` | GET | OK | Si |
| `/gamification/ranks/current` | GET | OK | Si |
| `/gamification/ranks/users/:userId/progress` | GET | OK | Si |
| `/gamification/ranks/users/:userId/multipliers` | GET | OK | Si |
| `/gamification/ranks/users/:userId/rank-history` | GET | OK | Si |
| `/gamification/ranks/check-promotion/:userId` | GET | OK | Si |
| `/gamification/ranks/promote/:userId` | POST | OK | Si |

---

## Anexo: Archivos Analizados

### Backend
1. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/user-rank-progress-response.dto.ts`
2. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/ml-coins/transaction-response.dto.ts`
3. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/shop/shop-item-response.dto.ts`
4. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/dto/user-ranks/multiplier-breakdown-response.dto.ts`
5. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
6. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/services/ranks.service.ts`
7. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/shared/constants/enums.constants.ts`
8. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/auth/entities/role.entity.ts`

### Frontend
1. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts`
2. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts`
3. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/types/economyTypes.ts`
4. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/gamification/economy/hooks/useTransactions.ts`
5. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/types/user.types.ts`
6. `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/auth/hooks/useRole.ts`

---

*Documento generado automaticamente por analisis de codigo - 2026-01-18*
