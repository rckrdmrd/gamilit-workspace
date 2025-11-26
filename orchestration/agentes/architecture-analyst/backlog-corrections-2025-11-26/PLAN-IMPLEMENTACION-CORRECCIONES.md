# PLAN DE IMPLEMENTACION - CORRECCIONES BACKLOG

**Fecha:** 2025-11-26
**Ejecutor:** Architecture-Analyst
**Issues:** 4 (1 P0, 3 P1)

---

## RESUMEN DE HALLAZGOS FASE 1

### Issue P0: check_and_award_achievements() ROTA
**Severidad:** CRITICA - Bloquea gamificacion de achievements
**Problema:** Funcion accede a columnas inexistentes:
- `condition_type`, `condition_value`, `xp_reward` en achievements (no existen, usar JSONB)
- `missions_completed` en user_stats (no existe)
- `earned_at` en user_achievements (no existe, usar `completed_at`)

### Issue P1-A: Tipo Mission en Frontend
**Severidad:** ALTA - Conflictos de tipos
**Problema:** 3 definiciones diferentes e incompatibles:
- `missionsTypes.ts` (CORRECTA - 20+ campos)
- `missionsAPI.ts` (ANTIGUA - 13 campos, `objective` singular)
- `useGamificationData.ts` (AISLADA - 11 campos)

### Issue P1-B: MayaRank KUKUKULKAN vs KUKULKAN
**Severidad:** MEDIA - Inconsistencia ortografica
**Problema:** Backend usa KUKUKULKAN (doble K), Frontend usa KUKULKAN (una K)
**Archivos afectados:** 3 en backend (enums.constants.ts, ranks.service.ts, ranks.service.spec.ts)

### Issue P1-C: MessageTypeEnum falta en Frontend
**Severidad:** MEDIA - Falta centralizacion
**Problema:** Enum definido localmente en teacherMessagesApi.ts, no en shared/constants
**Archivos afectados:** 4 (teacherMessagesApi.ts, useTeacherMessages.ts, MessageFilters.tsx, MessagesList.tsx)

---

## PLAN DE EJECUCION

### RONDA 1: CORRECCIONES P0 (Criticas)

| Tarea | Archivo | Cambio |
|-------|---------|--------|
| 1.1 | `gamification_system/functions/check_and_award_achievements.sql` | Refactorizar SELECT para usar JSONB |
| 1.2 | Mismo archivo | Cambiar acceso a conditions->>'type' |
| 1.3 | Mismo archivo | Extraer rewards->'xp' para xp_reward |
| 1.4 | Mismo archivo | Cambiar `earned_at` por `completed_at` en INSERT |
| 1.5 | Mismo archivo | Eliminar referencia a `missions_completed` o usar alternativa |

**Dependencias:** Ninguna
**Riesgo:** ALTO - Funcion critica de gamificacion
**Validacion:** Ejecutar script de test post-correccion

### RONDA 2: CORRECCIONES P1 (En paralelo)

#### Tarea 2.1: Unificar tipo Mission
| Subtarea | Archivo | Cambio |
|----------|---------|--------|
| 2.1.1 | `missionsStore.ts` | Cambiar import a missionsTypes.ts |
| 2.1.2 | `missionsStore.ts` | Cambiar `m.objective` a `m.objectives` |
| 2.1.3 | `useGamificationData.ts` | Importar Mission de missionsTypes |
| 2.1.4 | `missionsAPI.ts` | Eliminar definicion local de Mission |

#### Tarea 2.2: Corregir MayaRank KUKUKULKAN
| Subtarea | Archivo | Cambio |
|----------|---------|--------|
| 2.2.1 | `enums.constants.ts` | KUKUKULKAN -> KUKULKAN |
| 2.2.2 | `ranks.service.ts` | MayaRank.KUKUKULKAN -> MayaRank.KUKULKAN (2 refs) |
| 2.2.3 | `ranks.service.spec.ts` | MayaRank.KUKUKULKAN -> MayaRank.KUKULKAN (5 refs) |

#### Tarea 2.3: Centralizar MessageTypeEnum
| Subtarea | Archivo | Cambio |
|----------|---------|--------|
| 2.3.1 | `enums.constants.ts` (frontend) | Agregar MessageTypeEnum |
| 2.3.2 | `teacherMessagesApi.ts` | Eliminar definicion local, importar de shared |
| 2.3.3 | `useTeacherMessages.ts` | Actualizar import |
| 2.3.4 | `MessageFilters.tsx` | Actualizar import |
| 2.3.5 | `MessagesList.tsx` | Actualizar import |

---

## DETALLE DE CAMBIOS

### P0: check_and_award_achievements.sql

**ANTES (lineas 42-51):**
```sql
SELECT a.id, a.name, a.condition_type, a.condition_value,
       a.xp_reward, a.ml_coins_reward
FROM gamification_system.achievements a
WHERE a.is_active = true
  AND a.condition_type = p_event_type
```

**DESPUES:**
```sql
SELECT a.id, a.name,
       a.conditions->>'type' as condition_type,
       (a.conditions->'requirements'->>'target')::integer as condition_value,
       COALESCE((a.rewards->>'xp')::integer, 0) as xp_reward,
       COALESCE(a.ml_coins_reward, 0) as ml_coins_reward
FROM gamification_system.achievements a
WHERE a.is_active = true
  AND a.conditions->>'type' = p_event_type
```

**ANTES (linea 58):**
```sql
v_condition_met := v_user_stats.missions_completed >= v_achievement.condition_value;
```

**DESPUES:**
```sql
-- Opcion A: Usar modules_completed como alternativa
v_condition_met := v_user_stats.modules_completed >= v_achievement.condition_value;
-- O agregar columna missions_completed a user_stats
```

**ANTES (lineas 72-76):**
```sql
INSERT INTO gamification_system.user_achievements (
    user_id, achievement_id, earned_at
) VALUES (
    p_user_id, v_achievement.id, NOW()
);
```

**DESPUES:**
```sql
INSERT INTO gamification_system.user_achievements (
    user_id, achievement_id, is_completed, completed_at
) VALUES (
    p_user_id, v_achievement.id, true, NOW()
);
```

### P1-A: Tipo Mission

**missionsStore.ts - Cambiar import:**
```typescript
// ANTES
import { missionsAPI, Mission } from '@/services/api/missionsAPI';

// DESPUES
import { missionsAPI } from '@/services/api/missionsAPI';
import type { Mission } from '@/features/gamification/missions/types/missionsTypes';
```

**missionsStore.ts - Cambiar acceso:**
```typescript
// ANTES (linea 99)
const newObjective = { ...m.objective, current };

// DESPUES
const newObjectives = m.objectives.map(obj => ({...obj}));
```

### P1-B: MayaRank

**enums.constants.ts (backend):**
```typescript
// ANTES (linea 165)
KUKUKULKAN = 'K\'uk\'ulkan',

// DESPUES
KUKULKAN = 'K\'uk\'ulkan',
```

### P1-C: MessageTypeEnum

**enums.constants.ts (frontend) - Agregar:**
```typescript
export enum MessageTypeEnum {
  DIRECT = 'direct',
  CLASSROOM_ANNOUNCEMENT = 'classroom_announcement',
  CLASSROOM_CHAT = 'classroom_chat',
  PRIVATE_FEEDBACK = 'private_feedback',
  ASSIGNMENT_COMMENT = 'assignment_comment',
  SYSTEM = 'system',
}
```

---

## CONFLICTOS/INCOHERENCIAS IDENTIFICADOS EN PLAN

### Conflicto 1: missions_completed no existe
**Problema:** La funcion check_and_award_achievements espera `missions_completed` en user_stats
**Solucion propuesta:** Usar `modules_completed` como alternativa O agregar columna
**Decision:** Usar `modules_completed` (menos invasivo)

### Conflicto 2: Status enum Mission diferente
**Frontend missionsTypes:** 'not_started' | 'in_progress' | 'completed' | 'claimed'
**Backend:** 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired'
**Impacto:** missionTransformer.ts necesita mapeo
**Decision:** Agregar mapeo en transformer, no modificar tipos

### Conflicto 3: MessageType vs MessageTypeEnum
**Backend usa:** MessageTypeEnum
**Frontend usa:** MessageType (local)
**Decision:** Usar MessageTypeEnum en frontend, re-exportar como MessageType para compatibilidad

### Conflicto 4: Valor 'system' falta en enums
**BD tiene:** 'system' como valor valido
**Enums no tienen:** 'system'
**Decision:** Agregar SYSTEM al enum en ambos lados

---

## ORDEN DE EJECUCION

```
RONDA 1 (Secuencial - P0):
+-- 1.1 Corregir check_and_award_achievements.sql
    |
    +-- Validar sintaxis SQL
    |
    +-- Test manual de funcion

RONDA 2 (Paralelo - P1):
+-- 2.1 Unificar Mission (Frontend-Agent)
|
+-- 2.2 Corregir MayaRank (Backend-Agent)
|
+-- 2.3 Centralizar MessageTypeEnum (Frontend-Agent)

RONDA 3 (Validacion):
+-- 3.1 Verificar TypeScript sin errores
+-- 3.2 Verificar SQL sintaxis
+-- 3.3 Run tests afectados
```

---

## ESTIMACION

| Tarea | Tiempo | Riesgo |
|-------|--------|--------|
| P0: check_and_award_achievements | 20 min | ALTO |
| P1-A: Unificar Mission | 15 min | MEDIO |
| P1-B: Corregir MayaRank | 10 min | BAJO |
| P1-C: MessageTypeEnum | 10 min | BAJO |
| Validacion | 10 min | - |
| **TOTAL** | **~65 min** | - |

---

## VALIDACIONES POST-EJECUCION

1. [ ] TypeScript frontend: 0 errores
2. [ ] TypeScript backend: 0 errores
3. [ ] SQL sintaxis valida
4. [ ] Tests de ranks.service.spec.ts pasan
5. [ ] Imports resueltos correctamente

---

**PLAN LISTO PARA EJECUCION**

Fecha: 2025-11-26
Architecture-Analyst
