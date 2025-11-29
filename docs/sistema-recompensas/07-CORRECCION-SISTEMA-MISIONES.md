# 07 - CORRECCIONES SISTEMA DE MISIONES

**Versión:** v2.5.0
**Fecha:** 2025-11-28
**Estado:** IMPLEMENTADO
**Autor:** Architecture-Analyst

---

## RESUMEN v2.5.0

### Triggers Multi-Objetivo Implementados (6 nuevos)

Se implementaron **6 nuevas funciones trigger** para cubrir TODOS los tipos de objetivos de misiones:

| Tipo Objetivo | Función | Trigger | Tabla Origen | Estado |
|---------------|---------|---------|--------------|--------|
| `complete_exercises` | update_missions_on_exercise_complete | trg_update_missions_on_exercise | exercise_attempts | ✅ Ya existía |
| `correct_streak` | update_missions_on_correct_streak | trg_update_missions_on_streak | exercise_attempts | ✅ Ya existía |
| `earn_xp` | update_missions_on_earn_xp | trg_update_missions_on_earn_xp | user_stats | ✅ **NUEVO v2.5** |
| `use_comodines` | update_missions_on_use_comodines | trg_update_missions_on_use_comodines | comodin_usage_log | ✅ **NUEVO v2.5** |
| `daily_streak` | update_missions_on_daily_streak | trg_update_missions_on_daily_streak | user_stats | ✅ **NUEVO v2.5** |
| `perfect_scores` | update_missions_on_perfect_scores | trg_update_missions_on_perfect_scores | exercise_attempts | ✅ **NUEVO v2.5** |
| `complete_modules` | update_missions_on_complete_modules | trg_update_missions_on_complete_modules | module_progress | ✅ **NUEVO v2.5** |
| `explore_modules` | update_missions_on_explore_modules | trg_update_missions_on_explore_modules | module_progress | ✅ **NUEVO v2.5** |

### Archivos Creados (v2.5.0)

**Funciones** (`apps/database/ddl/schemas/gamilit/functions/`):
- `21-update_missions_on_use_comodines.sql`
- `22-update_missions_on_earn_xp.sql`
- `23-update_missions_on_daily_streak.sql`
- `24-update_missions_on_perfect_scores.sql`
- `25-update_missions_on_complete_modules.sql`
- `26-update_missions_on_explore_modules.sql`

**Triggers** (`gamification_system/triggers/` y `progress_tracking/triggers/`):
- `27-trg_update_missions_on_earn_xp.sql`
- `28-trg_update_missions_on_use_comodines.sql`
- `29-trg_update_missions_on_daily_streak.sql`
- `28-trg_update_missions_on_perfect_scores.sql`
- `29-trg_update_missions_on_complete_modules.sql`
- `30-trg_update_missions_on_explore_modules.sql`

### Validación de Recreación Limpia

Todos los archivos cumplen con la directiva de **recreación limpia**:
- ✅ Funciones usan `CREATE OR REPLACE FUNCTION` (idempotente)
- ✅ Triggers usan `DROP TRIGGER IF EXISTS` antes de `CREATE TRIGGER`
- ✅ Sin sentencias ALTER, FIX, PATCH, MIGRATION
- ✅ Archivos autocontenidos y ejecutables múltiples veces

---

## 1. RESUMEN EJECUTIVO

### Problemas Identificados

Se identificaron **4 bugs críticos** en el sistema de misiones que impiden su correcto funcionamiento:

| ID | Bug | Severidad | Impacto |
|----|-----|-----------|---------|
| BUG-001 | Trigger solo para `exercise_attempts` | CRÍTICO | Ejercicios con revisión manual no actualizan misiones |
| BUG-002 | Solo objetivo `complete_exercises` procesado | CRÍTICO | 60% de misiones nunca se actualizan |
| BUG-003 | `ExerciseSubmissionService` no integrado | ALTO | Duplicidad de lógica no integrada |
| BUG-004 | Error al reclamar recompensas | MEDIO | UX degradada en página de misiones |

### Alcance de Correcciones

- **Database:** 4 nuevos archivos (funciones + triggers)
- **Backend:** 1 archivo modificado
- **Frontend:** Verificación (sin cambios esperados)
- **Testing:** Validación end-to-end

---

## 2. ANÁLISIS DETALLADO DE BUGS

### BUG-001: Trigger solo para `exercise_attempts`

**Ubicación:**
`apps/database/ddl/schemas/progress_tracking/triggers/24-trg_update_missions_on_exercise.sql`

**Código actual:**
```sql
CREATE TRIGGER trg_update_missions_on_exercise
  AFTER INSERT ON progress_tracking.exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_missions_on_exercise_complete();
```

**Problema:**
El trigger solo se ejecuta cuando se inserta en `exercise_attempts`. Los ejercicios que usan `exercise_submissions` (Rueda de Inferencias, Detective Textual, Identificación de Argumentos) **NUNCA** actualizan el progreso de misiones.

**Evidencia:**
- `exercise_submissions` solo tiene trigger `updated_at` (archivo 22)
- No existe trigger para actualizar misiones en `exercise_submissions`

---

### BUG-002: Solo objetivo `complete_exercises` procesado

**Ubicación:**
`apps/database/ddl/schemas/gamilit/functions/17-update_missions_on_exercise_complete.sql:39,52`

**Código actual:**
```sql
-- Línea 39: Filtro de búsqueda
AND objectives @> '[{"type": "complete_exercises"}]'::jsonb

-- Línea 52: Procesamiento
IF v_objective->>'type' = 'complete_exercises' THEN
```

**Problema:**
La función trigger SOLO busca y actualiza misiones con objetivo tipo `complete_exercises`. Otros tipos de objetivos son ignorados.

**Tipos de objetivos NO procesados:**

| Tipo | Misión Afectada | Descripción |
|------|-----------------|-------------|
| `correct_streak` | "Racha de aciertos" (daily) | Racha de ejercicios correctos consecutivos |
| `study_time` | "Tiempo de estudio" (daily) | Minutos de estudio acumulados |
| `consecutive_days` | "Racha semanal" (weekly) | Días consecutivos de actividad |

**Impacto:**
- Solo 2 de 5 misiones funcionan (40%)
- "Completar ejercicios" (daily) ✅
- "Maratón de ejercicios" (weekly) ✅
- 3 misiones restantes nunca se actualizan ❌

---

### BUG-003: `ExerciseSubmissionService.claimRewards()` no integrado

**Ubicación:**
`apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Código actual (líneas 816-831):**
```typescript
async claimRewards(id: string): Promise<{...}> {
  // Actualiza user_stats con XP y ML Coins
  await this.userStatsService.addXp(submission.user_id, xpEarned);
  await this.mlCoinsService.addCoins(...);
  // ❌ NO HAY LLAMADA a updateMissionsProgress()
}
```

**Problema:**
El método `claimRewards()` otorga XP y ML Coins pero NO actualiza el progreso de misiones.

**Evidencia:**
grep de `updateMissionsProgress|missionsService` en el archivo retornó "No matches found"

---

### BUG-004: Error al reclamar recompensas en página de misiones

**Ubicación:**
Frontend: `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts`
Backend: `apps/backend/src/modules/gamification/controllers/missions.controller.ts`

**Causa raíz identificada:**
El frontend esperaba formato `{ success: true, data: { mission, rewards } }` pero el controller
retornaba directamente `{ mission, rewards, rewards_granted }`.

**Corrección aplicada (v2.4.1):**
```typescript
// missions.controller.ts - línea 167
// ANTES:
return this.missionsService.claimRewards(missionId, userId);

// DESPUÉS:
const result = await this.missionsService.claimRewards(missionId, userId);
return { success: true, data: result };
```

---

## 3. PLAN DE CORRECCIONES

### CORRECCIÓN A: Crear trigger para `exercise_submissions`

**Objetivo:**
Actualizar misiones cuando se califican ejercicios con revisión manual.

**Archivos a crear:**

| Archivo | Descripción |
|---------|-------------|
| `progress_tracking/triggers/25-trg_update_missions_on_submission.sql` | Trigger AFTER UPDATE |

**Lógica del trigger:**
```sql
CREATE TRIGGER trg_update_missions_on_submission
  AFTER UPDATE ON progress_tracking.exercise_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'graded' AND NEW.is_correct = true AND
        (OLD.status IS DISTINCT FROM NEW.status OR OLD.is_correct IS DISTINCT FROM NEW.is_correct))
  EXECUTE FUNCTION gamilit.update_missions_on_exercise_complete();
```

**Condiciones:**
- Se dispara cuando `status` cambia a `'graded'`
- Solo si `is_correct = true`
- Evita re-disparos con cláusula `WHEN`

---

### CORRECCIÓN B: Crear funciones para otros tipos de objetivos

**Objetivo:**
Soportar todos los tipos de objetivos definidos en el sistema.

**Archivos a crear:**

| Archivo | Tipo Objetivo | Trigger Asociado |
|---------|---------------|------------------|
| `gamilit/functions/18-update_missions_on_streak.sql` | `correct_streak` | En `exercise_attempts` |
| `gamilit/functions/19-update_missions_on_study_time.sql` | `study_time` | En `user_activity` (si existe) |
| `gamilit/functions/20-update_missions_on_consecutive_days.sql` | `consecutive_days` | Cron job / función programada |

**Nota:**
`correct_streak` requiere tracking de rachas. Se implementará lógica para contar ejercicios correctos consecutivos.

---

### CORRECCIÓN C: Integrar `ExerciseSubmissionService` con misiones

**Objetivo:**
Asegurar que ejercicios con revisión manual actualicen misiones via backend (complemento al trigger de DB).

**Archivo a modificar:**
`apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Cambios requeridos:**

1. **Importar MissionsService:**
```typescript
import { MissionsService } from '@/modules/gamification/services/missions.service';
```

2. **Inyectar en constructor:**
```typescript
constructor(
  // ... existing dependencies
  private readonly missionsService: MissionsService,
) {}
```

3. **Llamar en claimRewards():**
```typescript
async claimRewards(id: string): Promise<{...}> {
  // ... existing logic

  // Actualizar progreso de misiones
  await this.updateMissionsProgress(submission.user_id, 'complete_exercises', 1);
}

private async updateMissionsProgress(userId: string, objectiveType: string, increment: number): Promise<void> {
  // Buscar misiones activas del usuario con este tipo de objetivo
  // Actualizar progreso
}
```

---

### CORRECCIÓN D: Investigar y corregir error de claim rewards

**Objetivo:**
Identificar y corregir el error al reclamar recompensas en frontend.

**Acciones:**
1. Verificar logs del backend durante intento de claim
2. Validar que misión está en status `completed` antes del claim
3. Confirmar formato de respuesta API vs expectativa del frontend
4. Agregar manejo de errores mejorado si es necesario

---

## 4. DEPENDENCIAS Y ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDEN DE EJECUCIÓN                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CORRECCIÓN A: Trigger exercise_submissions              │
│     └── No tiene dependencias                               │
│                                                             │
│  2. CORRECCIÓN B: Funciones para otros objetivos            │
│     └── Dependencia: Estructura actual de missions          │
│                                                             │
│  3. CORRECCIÓN C: Backend integration                       │
│     └── Dependencia: MissionsService existente              │
│                                                             │
│  4. CORRECCIÓN D: Error de claim                            │
│     └── Dependencia: Correcciones A, B, C completadas       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. ARCHIVOS AFECTADOS

### Database (Nuevos)

| Archivo | Tipo | Schema |
|---------|------|--------|
| `25-trg_update_missions_on_submission.sql` | Trigger | progress_tracking |
| `18-update_missions_on_streak.sql` | Function | gamilit |

### Database (Modificaciones)

| Archivo | Cambio |
|---------|--------|
| `create-database.sh` | Agregar referencia a nuevos archivos |

### Backend (Modificaciones)

| Archivo | Cambio |
|---------|--------|
| `exercise-submission.service.ts` | Integrar MissionsService |
| `progress.module.ts` | Agregar import de MissionsModule |

---

## 6. VALIDACIÓN POST-IMPLEMENTACIÓN

### Tests a ejecutar

1. **Test de trigger `exercise_submissions`:**
   - Insertar submission con status='pending'
   - Actualizar a status='graded', is_correct=true
   - Verificar que misión con objetivo `complete_exercises` se actualiza

2. **Test de racha (`correct_streak`):**
   - Completar 2 ejercicios correctos consecutivos
   - Verificar que misión "Racha de aciertos" se actualiza

3. **Test de claim rewards:**
   - Completar misión hasta progress=100%
   - Ejecutar claim via API
   - Verificar respuesta exitosa y status='claimed'

4. **Test end-to-end frontend:**
   - Navegar a página de misiones
   - Verificar que todas las misiones muestran progreso
   - Reclamar recompensa de misión completada
   - Verificar actualización de balance (XP, ML Coins)

---

## 7. CHANGELOG

### v2.5.0 (2025-11-28) - TRIGGERS MULTI-OBJETIVO

- [x] **Implementar triggers para todos los tipos de objetivos**
  - 6 nuevas funciones trigger creadas
  - 6 nuevos triggers implementados
  - Cobertura: 8/8 tipos de objetivos (100%)

- [x] **Nuevas funciones creadas:**
  - `gamilit/functions/21-update_missions_on_use_comodines.sql`
  - `gamilit/functions/22-update_missions_on_earn_xp.sql`
  - `gamilit/functions/23-update_missions_on_daily_streak.sql`
  - `gamilit/functions/24-update_missions_on_perfect_scores.sql`
  - `gamilit/functions/25-update_missions_on_complete_modules.sql`
  - `gamilit/functions/26-update_missions_on_explore_modules.sql`

- [x] **Nuevos triggers creados:**
  - `gamification_system/triggers/27-trg_update_missions_on_earn_xp.sql`
  - `gamification_system/triggers/28-trg_update_missions_on_use_comodines.sql`
  - `gamification_system/triggers/29-trg_update_missions_on_daily_streak.sql`
  - `progress_tracking/triggers/28-trg_update_missions_on_perfect_scores.sql`
  - `progress_tracking/triggers/29-trg_update_missions_on_complete_modules.sql`
  - `progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql`

- [x] **Validación de recreación limpia:** 100% cumplimiento
- [x] **Documentación actualizada**

### v2.4.1 (2025-11-28) - BUG-004 CORREGIDO

- [x] **Corregir BUG-004: Error de claim rewards**
  - Archivo: `backend/src/modules/gamification/controllers/missions.controller.ts`
  - Causa: Frontend esperaba `{ success: true, data: {...} }`, backend retornaba objeto directo
  - Solución: Envolver respuesta en formato esperado
  - Estado: IMPLEMENTADO

### v2.4.0 (2025-11-26) - IMPLEMENTADO

- [x] **Crear trigger para `exercise_submissions`**
  - Archivo: `progress_tracking/triggers/25-trg_update_missions_on_submission.sql`
  - Dispara cuando `status='graded'` AND `is_correct=true`
  - Reutiliza función `gamilit.update_missions_on_exercise_complete()`

- [x] **Crear función para `correct_streak`**
  - Archivo: `gamilit/functions/19-update_missions_on_correct_streak.sql`
  - Calcula racha de ejercicios correctos consecutivos
  - Actualiza misiones con objetivo `correct_streak`

- [x] **Crear trigger para `correct_streak`**
  - Archivo: `progress_tracking/triggers/26-trg_update_missions_on_streak.sql`
  - Dispara AFTER INSERT en `exercise_attempts`
  - Llama a `gamilit.update_missions_on_correct_streak()`

- [x] **Integrar `ExerciseSubmissionService` con `MissionsService`**
  - Archivo: `backend/src/modules/progress/services/exercise-submission.service.ts`
  - Importa y usa `MissionsService`
  - Nuevo método `updateMissionsProgressAfterCompletion()`
  - Se llama en `claimRewards()` después de otorgar XP/MLCoins

- [x] Documentación actualizada
- [ ] Tests end-to-end verificados (requiere BD reinicializada)

---

## 8. REFERENCIAS

- [04-DATABASE-SCHEMA.md](./04-DATABASE-SCHEMA.md) - Schema de base de datos
- [02-FLUJO-END-TO-END.md](./02-FLUJO-END-TO-END.md) - Flujo de recompensas
- [17-update_missions_on_exercise_complete.sql](../../apps/database/ddl/schemas/gamilit/functions/17-update_missions_on_exercise_complete.sql) - Función trigger actual
- [24-trg_update_missions_on_exercise.sql](../../apps/database/ddl/schemas/progress_tracking/triggers/24-trg_update_missions_on_exercise.sql) - Trigger actual

---

**Última actualización:** 2025-11-28
**Mantenido por:** Architecture-Analyst
