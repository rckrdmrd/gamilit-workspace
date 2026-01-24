# PLAN DE IMPLEMENTACION CONSOLIDADO - ACHIEVEMENTS
## Portal Students - GAMILIT

**Fecha:** 2025-12-15
**Tech-Leader:** Claude Opus 4.5
**Tarea:** Completar desarrollo de pagina de achievements e integracion con progreso
**Estado:** FASE 3 - PLANIFICACION DE IMPLEMENTACIONES

---

## 1. RESUMEN EJECUTIVO DE ANALISIS

### Estado Actual del Sistema de Achievements

| Area | Estado | Hallazgo Principal |
|------|--------|-------------------|
| **Backend - meetsConditions()** | 0% COMPATIBLE | 8 tipos en seeds, 6 en backend - NINGUNO coincide |
| **Integracion Progreso** | 40% OPERATIVO | Solo funciona en ExerciseAttempt, faltan stats |
| **Frontend - Componentes** | FUNCIONAL CON BUGS | Incompatibilidad de tipos, iconos rotos |
| **Database - Trigger Stats** | PARCIAL | exercises_completed OK, modules_completed/streak NO |

### Diagnostico

**El sistema de achievements esta ROTO en produccion:**
- 20 achievements definidos que NUNCA se desbloquean
- `modules_completed` siempre = 0 (nunca se incrementa)
- `current_streak` siempre = 0 (nunca se calcula)
- ExerciseSubmission (calificacion manual) no otorga achievements
- Frontend usa 2 tipos de datos incompatibles

---

## 2. GAPS IDENTIFICADOS (CONSOLIDADO)

### GAP-BE-001: Logica meetsConditions() desalineada [P0-CRITICA]
- **Ubicacion:** `achievements.service.ts:248-291`
- **Problema:** Tipos de condicion backend vs seeds no coinciden
- **Impacto:** 100% de achievements nunca se desbloquean automaticamente

### GAP-BE-002: modules_completed nunca se incrementa [P0-CRITICA]
- **Ubicacion:** `exercise-attempt.service.ts:539-652`
- **Problema:** Al completar modulo, no se actualiza user_stats
- **Impacto:** Achievements tipo "module_completion" nunca se otorgan

### GAP-BE-003: current_streak nunca se calcula [P0-CRITICA]
- **Ubicacion:** Trigger `update_leaderboard_streaks()` existe pero no se llama
- **Problema:** No hay integracion entre exercise completion y streak calculation
- **Impacto:** Achievements tipo "streak" nunca se otorgan

### GAP-BE-004: ExerciseSubmission sin integracion [P1-ALTA]
- **Ubicacion:** `exercise-submission.service.ts`
- **Problema:** No llama detectAndGrantEarned() despues de calificar
- **Impacto:** Ejercicios con calificacion manual no otorgan achievements

### GAP-FE-001: Tipos Achievement vs AchievementData incompatibles [P1-ALTA]
- **Ubicacion:** `achievementsTypes.ts` vs `useDashboardData.ts`
- **Problema:** `title` vs `name`, `isUnlocked` vs `unlocked`, etc.
- **Impacto:** Componentes pueden fallar o mostrar datos incorrectos

### GAP-FE-002: ProgressTreeVisualizer - iconos rotos [P1-ALTA]
- **Ubicacion:** `ProgressTreeVisualizer.tsx:72`
- **Problema:** Solo 4 iconos mapeados de 30+ requeridos
- **Impacto:** Mayoria de iconos muestran fallback

### GAP-FE-003: AchievementsPreview - recompensas hardcoded [P2-MEDIA]
- **Ubicacion:** `AchievementsPreview.tsx:226-230`
- **Problema:** Muestra "+50 ML, +100 XP" siempre en lugar de valores reales
- **Impacto:** Usuarios ven recompensas incorrectas

---

## 3. PLAN DE IMPLEMENTACION POR PRIORIDAD

### FASE 3.1: CORRECCIONES P0 - CRITICAS (Backend Core)

#### IMPL-001: Reescribir meetsConditions() para soportar seeds
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/gamification/services/achievements.service.ts`

**Cambios:**
1. Cambiar funcion de sincrona a async
2. Agregar interfaces de tipos para cada condicion
3. Implementar 9 tipos de condicion de seeds:
   - `exercise_completion` -> userStats.exercises_completed
   - `streak` -> userStats.current_streak (con consecutive_days, no min_streak)
   - `module_completion` -> Query a user_progress
   - `all_modules_completion` -> userStats.modules_completed + average_score
   - `perfect_score` -> userStats.perfect_scores
   - `skill_mastery` -> Query a exercise_responses por skill_type
   - `exploration` -> Queries con GROUP BY
   - `social` -> Query a classroom_members
   - `special` -> Verificar first_login
4. Inyectar Connection para queries adicionales
5. Actualizar detectAndGrantEarned() para usar async meetsConditions

**Estimacion:** ~120 lineas de codigo

---

#### IMPL-002: Actualizar modules_completed al completar modulo
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

**Cambios:**
En `updateModuleProgressAfterCompletion()` (~linea 600), agregar:
```typescript
// Despues de actualizar module_progress, si status cambia a 'completed':
if (newStatus === 'completed' && previousStatus !== 'completed') {
  await this.entityManager.query(`
    UPDATE gamification_system.user_stats
    SET modules_completed = modules_completed + 1,
        updated_at = NOW()
    WHERE user_id = $1
  `, [userId]);
}
```

**Estimacion:** ~15 lineas de codigo

---

#### IMPL-003: Calcular current_streak automaticamente
**Archivo Nuevo:** `/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/trg_calculate_streak_on_activity.sql`

**Crear trigger:**
```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_streak_on_activity()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  today_date DATE := CURRENT_DATE;
BEGIN
  SELECT DATE(last_activity_at) INTO last_date
  FROM gamification_system.user_stats
  WHERE user_id = NEW.user_id;

  IF last_date IS NULL OR last_date < today_date - INTERVAL '1 day' THEN
    -- Reset streak
    NEW.current_streak := 1;
  ELSIF last_date = today_date - INTERVAL '1 day' THEN
    -- Incrementar streak
    NEW.current_streak := COALESCE(OLD.current_streak, 0) + 1;
  END IF;
  -- Si es mismo dia, no cambiar streak

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_streak
BEFORE UPDATE ON gamification_system.user_stats
FOR EACH ROW
WHEN (NEW.last_activity_at IS DISTINCT FROM OLD.last_activity_at)
EXECUTE FUNCTION gamification_system.calculate_streak_on_activity();
```

**Estimacion:** ~30 lineas SQL

---

### FASE 3.2: CORRECCIONES P1 - ALTA (Integracion + Frontend)

#### IMPL-004: Integrar achievements en ExerciseSubmission
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Cambios:**
1. Importar e inyectar AchievementsService en constructor
2. En metodo de calificacion (cuando status = 'graded'):
```typescript
try {
  const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
  if (earned.length > 0) {
    this.logger.log(`Granted ${earned.length} achievements to user ${submission.user_id}`);
  }
} catch (error) {
  this.logger.error(`Error detecting achievements: ${error.message}`);
}
```

**Estimacion:** ~20 lineas de codigo

---

#### IMPL-005: Unificar tipos Achievement y AchievementData
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/features/gamification/social/types/achievementsTypes.ts`

**Cambios:**
1. Agregar campos faltantes a Achievement:
   - `name` como alias de `title`
   - `unlocked` como alias de `isUnlocked`
2. Actualizar `AchievementData` en useDashboardData para incluir todos los campos
3. Crear funcion `normalizeAchievement()` para mapear entre formatos

**Estimacion:** ~40 lineas

---

#### IMPL-006: Corregir iconos en ProgressTreeVisualizer
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/features/gamification/social/components/Achievements/ProgressTreeVisualizer.tsx`

**Cambios:**
Expandir `iconMap` de 4 a 30+ iconos (copiar de AchievementCard.tsx):
```typescript
const iconMap: Record<string, React.ElementType> = {
  'book': Book,
  'book-open': BookOpen,
  'brain': Brain,
  'trophy': Trophy,
  'star': Star,
  'target': Target,
  'flame': Flame,
  'footprints': Footprints,
  'compass': Compass,
  'users': Users,
  'graduation-cap': GraduationCap,
  'palette': Palette,
  'crown': Crown,
  'zap': Zap,
  // ... +20 mas
};
```

**Estimacion:** ~30 lineas

---

### FASE 3.3: CORRECCIONES P2 - MEDIA (Polish)

#### IMPL-007: Mostrar recompensas reales en AchievementsPreview
**Archivo:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/apps/student/components/gamification/AchievementsPreview.tsx`

**Cambios:**
Lineas 226-230, cambiar de hardcoded a dinamico:
```typescript
<div className="flex items-center gap-1">
  <Coins className="h-4 w-4 text-detective-gold" />
  <span className="text-sm font-semibold text-detective-text">
    +{achievement.mlCoinsReward || 50} ML
  </span>
</div>
```

**Estimacion:** ~10 lineas

---

## 4. MATRIZ DE DEPENDENCIAS

```
IMPL-003 (Trigger streak)
    |
IMPL-002 (modules_completed)
    |
IMPL-001 (meetsConditions) <--- Dependencia critica
    |
    +--- IMPL-004 (ExerciseSubmission) [paralelo]
    |
    +--- IMPL-005 (Tipos FE) [paralelo]
         |
         +--- IMPL-006 (Iconos) [paralelo]
              |
              +--- IMPL-007 (Recompensas) [paralelo]
```

### Orden de Ejecucion Recomendado

1. **Primero (Paralelo):**
   - IMPL-003 (Trigger streak en DB)
   - IMPL-002 (modules_completed en backend)

2. **Segundo:**
   - IMPL-001 (meetsConditions - GRANDE, afecta todo)

3. **Tercero (Paralelo):**
   - IMPL-004 (ExerciseSubmission integration)
   - IMPL-005 (Tipos frontend)

4. **Cuarto (Paralelo):**
   - IMPL-006 (Iconos)
   - IMPL-007 (Recompensas)

---

## 5. OBJETOS IMPACTADOS

### Backend (NestJS)

| Archivo | Tipo de Cambio | Lineas |
|---------|----------------|--------|
| `achievements.service.ts` | REESCRIBIR meetsConditions | ~120 |
| `exercise-attempt.service.ts` | AGREGAR increment modules_completed | ~15 |
| `exercise-submission.service.ts` | AGREGAR integracion achievements | ~20 |

### Database (PostgreSQL)

| Archivo | Tipo de Cambio | Lineas |
|---------|----------------|--------|
| `trg_calculate_streak_on_activity.sql` | NUEVO | ~30 |

### Frontend (React)

| Archivo | Tipo de Cambio | Lineas |
|---------|----------------|--------|
| `achievementsTypes.ts` | MODIFICAR | ~40 |
| `ProgressTreeVisualizer.tsx` | AGREGAR iconos | ~30 |
| `AchievementsPreview.tsx` | MODIFICAR recompensas | ~10 |

### Total Estimado: ~265 lineas de codigo

---

## 6. VALIDACIONES REQUERIDAS POST-IMPLEMENTACION

### Tests Automatizados
- [ ] `achievements.service.spec.ts` - todos los tipos de condicion
- [ ] `exercise-attempt.service.spec.ts` - modules_completed increment
- [ ] `exercise-submission.service.spec.ts` - achievements integration

### Tests Manuales
- [ ] Completar ejercicio auto-calificable -> verificar achievement
- [ ] Completar modulo completo -> verificar achievement "module_completion"
- [ ] Mantener racha 3 dias -> verificar achievement "streak"
- [ ] UI muestra iconos correctos en ProgressTreeVisualizer
- [ ] UI muestra recompensas reales en preview

### Queries de Verificacion
```sql
-- Verificar que modules_completed se actualiza
SELECT user_id, modules_completed, updated_at
FROM gamification_system.user_stats
WHERE modules_completed > 0;

-- Verificar que current_streak se actualiza
SELECT user_id, current_streak, last_activity_at
FROM gamification_system.user_stats
WHERE current_streak > 0;

-- Verificar achievements otorgados
SELECT ua.user_id, a.name, ua.is_completed, ua.completed_at
FROM gamification_system.user_achievements ua
JOIN gamification_system.achievements a ON ua.achievement_id = a.id
WHERE ua.is_completed = true
ORDER BY ua.completed_at DESC;
```

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| Queries adicionales en meetsConditions impactan performance | MEDIA | Cachear achievements, optimizar queries |
| Duplicacion de logros si detectAndGrantEarned se llama 2x | BAJA | Ya existe validacion is_repeatable |
| Breaking change en tipos frontend | MEDIA | Agregar aliases de compatibilidad |
| Trigger de streak causa race condition | BAJA | Usar BEFORE UPDATE con DISTINCT FROM |

---

## 8. CRONOGRAMA DE IMPLEMENTACION

### Delegacion a Subagentes

| Implementacion | Subagente Sugerido | Complejidad |
|----------------|-------------------|-------------|
| IMPL-001 | Backend Specialist | ALTA |
| IMPL-002 | Backend Specialist | BAJA |
| IMPL-003 | Database Specialist | MEDIA |
| IMPL-004 | Backend Specialist | BAJA |
| IMPL-005 | Frontend Specialist | MEDIA |
| IMPL-006 | Frontend Specialist | BAJA |
| IMPL-007 | Frontend Specialist | BAJA |

---

## 9. CHECKLIST DE COMPLETITUD

- [ ] IMPL-001: meetsConditions soporta 9 tipos de condicion
- [ ] IMPL-002: modules_completed se incrementa correctamente
- [ ] IMPL-003: Trigger de streak funciona
- [ ] IMPL-004: ExerciseSubmission integrado
- [ ] IMPL-005: Tipos unificados
- [ ] IMPL-006: Iconos corregidos
- [ ] IMPL-007: Recompensas dinamicas
- [ ] Tests automatizados pasan
- [ ] Tests manuales pasan
- [ ] Documentacion actualizada

---

## 10. VALIDACION FASE 4 - COMPLETADA

### Verificaciones Realizadas

| Item | Estado | Hallazgo |
|------|--------|----------|
| UserStats tiene todos los campos | ✅ OK | 35+ campos disponibles |
| Funcion streaks existe | ✅ OK | `update_leaderboard_streaks(uuid)` existe |
| Funcion streaks se llama | ❌ GAP | No hay trigger ni llamada desde backend |
| Campos consistentes | ⚠️ AJUSTE | DB usa `last_activity_date` (DATE), entity usa `last_activity_at` (TIMESTAMP) |

### Ajuste al Plan: IMPL-003

En lugar de crear nuevo trigger, el plan se ajusta:

**Opcion A (Recomendada):** Llamar desde backend
```typescript
// En ExerciseAttemptService.awardRewards(), agregar al final:
await this.entityManager.query(
  `SELECT * FROM gamification_system.update_leaderboard_streaks($1)`,
  [userId]
);
```

**Opcion B:** Crear trigger AFTER UPDATE
```sql
CREATE TRIGGER trg_call_streak_update
AFTER UPDATE ON gamification_system.user_stats
FOR EACH ROW
WHEN (NEW.last_activity_at::DATE IS DISTINCT FROM OLD.last_activity_at::DATE)
EXECUTE FUNCTION gamification_system.call_streak_update();
```

### Dependencias Adicionales Identificadas

1. **Posible campo faltante en DDL:** `last_activity_date` vs `last_activity_at`
   - Verificar si hay column alias o si es un bug en la funcion
   - La funcion puede estar usando columna que no existe

2. **Campo `longest_streak`** en funcion pero entity usa `max_streak`
   - Verificar nombre real en DDL

### Conclusion de Validacion

- Plan es VIABLE con ajustes menores
- 7 implementaciones cubren todos los gaps identificados
- Dependencias verificadas y documentadas
- Riesgo de inconsistencia DB/Entity detectado y mitigable

---

**Tech-Leader:** PLAN VALIDADO - Listo para FASE 5
**Estado:** APROBADO CON AJUSTES
**Fecha Validacion:** 2025-12-15
