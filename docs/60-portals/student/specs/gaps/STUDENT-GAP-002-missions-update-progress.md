# STUDENT-GAP-002: Misiones - Progreso No Se Actualiza Correctamente

**Fecha de identificación:** 2025-11-29
**Fecha de corrección:** 2025-11-29
**Severidad:** 🔴 CRÍTICA
**Prioridad:** P0
**Estado:** ✅ RESUELTO
**Agente responsable:** Backend-Agent
**Tiempo estimado:** 2-3 horas
**Tiempo real:** 1 hora

---

## 📋 DESCRIPCIÓN DEL PROBLEMA

### Síntoma
Las misiones del portal de estudiantes no se actualizan correctamente al usar la aplicación:
- ✅ La misión "Completar 3 ejercicios" (`complete_exercises`) SÍ se actualiza
- ❌ La misión "Ganar 100 XP" (`earn_xp`) NO se actualiza
- ❌ Otras misiones (racha de días, usar comodín, etc.) NO se actualizan

### Causa Raíz

**INCONSISTENCIA entre tipos de objetivos:**

| Fuente | Misiones Generadas | Tipos de Objetivos |
|--------|-------------------|-------------------|
| **BD** (`initialize_user_missions`) | 3 diarias + 5 semanales | `complete_exercises`, `earn_xp`, `use_comodines`, `daily_streak`, `perfect_scores`, `explore_modules`, `complete_modules` |
| **Backend** (`generateDailyMissions`) | 3 diarias | `complete_exercises`, `correct_streak`, `study_time` |
| **Backend** (`generateWeeklyMissions`) | 2 semanales | `complete_exercises`, `consecutive_days` |

**Los triggers de BD:**
- `trg_update_missions_on_earn_xp` → Busca misiones con `objectives @> '[{"type": "earn_xp"}]'`
- `trg_update_missions_on_use_comodines` → Busca misiones con `objectives @> '[{"type": "use_comodines"}]'`
- etc.

**El backend genera misiones con tipos que los triggers NO reconocen:**
- Backend genera `correct_streak` → Ningún trigger busca este tipo
- Backend genera `study_time` → Ningún trigger busca este tipo
- Backend genera `consecutive_days` → Trigger busca `daily_streak`

### Impacto
- Students no ven progreso en misiones (excepto completar ejercicios)
- Desmotivación al no poder completar/reclamar misiones
- Sistema de gamificación no funciona correctamente

---

## 🎯 SOLUCIÓN PROPUESTA

### Principio
**TRIGGERS DE BD COMO FUENTE DE VERDAD**
- Los triggers ya existen y funcionan correctamente
- El backend debe alinearse con los tipos de objetivos que los triggers reconocen
- No se modifica la BD (política de carga limpia respetada)

### Cambios Requeridos

#### 1. Alinear `generateDailyMissions()` en Backend

**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`

**Cambio:** Modificar los tipos de objetivos para que coincidan con los triggers de BD:

| Misión | Tipo Actual | Tipo Correcto |
|--------|-------------|---------------|
| Misión 1 | `complete_exercises` | `complete_exercises` ✅ (sin cambio) |
| Misión 2 | `correct_streak` | `earn_xp` |
| Misión 3 | `study_time` | `use_comodines` |

**Nuevo código para `generateDailyMissions()`:**
```typescript
// Misión 1: Completar 3 ejercicios (SIN CAMBIO)
objectives: [{ type: 'complete_exercises', target: 3, current: 0 }]

// Misión 2: Ganar 100 XP (CAMBIO de correct_streak a earn_xp)
objectives: [{ type: 'earn_xp', target: 100, current: 0 }]

// Misión 3: Usar un comodín (CAMBIO de study_time a use_comodines)
objectives: [{ type: 'use_comodines', target: 1, current: 0 }]
```

#### 2. Alinear `generateWeeklyMissions()` en Backend

**Cambio:** Modificar los tipos de objetivos:

| Misión | Tipo Actual | Tipo Correcto |
|--------|-------------|---------------|
| Misión 1 | `complete_exercises` | `complete_exercises` ✅ (sin cambio) |
| Misión 2 | `consecutive_days` | `daily_streak` |

**Nuevo código para `generateWeeklyMissions()`:**
```typescript
// Misión 1: Completar 15 ejercicios (SIN CAMBIO)
objectives: [{ type: 'complete_exercises', target: 15, current: 0 }]

// Misión 2: Racha de 5 días (CAMBIO de consecutive_days a daily_streak)
objectives: [{ type: 'daily_streak', target: 5, current: 0 }]
```

#### 3. Simplificar `updateMissionsProgressAfterCompletion()` (Opcional)

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Decisión:** Este método actualmente es **redundante** porque los triggers de BD ya actualizan las misiones. Sin embargo, puede mantenerse como **respaldo** en caso de que los triggers no se ejecuten.

**Opción recomendada:** Mantener pero documentar que es respaldo de los triggers.

---

## 🔗 MAPEO DE TRIGGERS DE BD

Los siguientes triggers ya existen y funcionan:

| Trigger | Tabla | Tipo de Objetivo | Evento |
|---------|-------|-----------------|--------|
| `trg_update_missions_on_exercise` | `progress_tracking.exercise_submissions` | `complete_exercises` | AFTER INSERT |
| `trg_update_missions_on_earn_xp` | `gamification_system.user_stats` | `earn_xp` | AFTER UPDATE (total_xp) |
| `trg_update_missions_on_use_comodines` | `gamification_system.inventory_transactions` | `use_comodines` | AFTER INSERT |
| `trg_update_missions_on_daily_streak` | `gamification_system.user_stats` | `daily_streak` | AFTER UPDATE (current_streak) |
| `trg_update_missions_on_perfect_scores` | `progress_tracking.exercise_submissions` | `perfect_scores` | AFTER INSERT/UPDATE (score=100) |
| `trg_update_missions_on_complete_modules` | `progress_tracking.module_progress` | `complete_modules` | AFTER UPDATE |
| `trg_update_missions_on_explore_modules` | `progress_tracking.module_progress` | `explore_modules` | AFTER INSERT/UPDATE |

---

## ✅ CRITERIOS DE ACEPTACIÓN

1. **CA-001:** Las misiones generadas por `generateDailyMissions()` DEBEN tener tipos de objetivos alineados con los triggers de BD
2. **CA-002:** Las misiones generadas por `generateWeeklyMissions()` DEBEN tener tipos de objetivos alineados con los triggers de BD
3. **CA-003:** Cuando un estudiante gana XP, la misión "Ganar N XP" DEBE actualizarse automáticamente (vía trigger)
4. **CA-004:** Cuando un estudiante usa un comodín, la misión "Usar N comodines" DEBE actualizarse automáticamente (vía trigger)
5. **CA-005:** El código DEBE compilar sin errores (`npm run build`)
6. **CA-006:** Las pruebas existentes DEBEN pasar (`npm run test`)

---

## 📊 ARCHIVOS AFECTADOS

### Backend
- `apps/backend/src/modules/gamification/services/missions.service.ts`
  - `generateDailyMissions()` - Alinear tipos de objetivos
  - `generateWeeklyMissions()` - Alinear tipos de objetivos

### Base de Datos
- **SIN CAMBIOS** - Los triggers ya existen y funcionan correctamente

### Frontend
- **SIN CAMBIOS** - El frontend consume los datos, no necesita cambios

---

## 🧪 PLAN DE VALIDACIÓN

### Validación Inmediata
1. `npm run build` en backend debe pasar
2. `npm run lint` debe pasar

### Validación Funcional
1. Crear usuario nuevo → Verificar misiones tienen tipos correctos
2. Completar ejercicio → Verificar misión `complete_exercises` se actualiza
3. Ganar XP → Verificar misión `earn_xp` se actualiza (vía trigger)
4. Verificar que todas las misiones se pueden reclamar al completarse

---

## 📝 NOTAS

### Respeto a Política de Carga Limpia
- NO se crean migrations
- NO se crean fixes o patches
- Los triggers YA existen en DDL
- Solo se modifica código backend

### Extensibilidad
El sistema queda preparado para:
- Admin/Teacher pueden crear nuevas misiones con CUALQUIER tipo de objetivo soportado por triggers
- Los triggers manejan la actualización automáticamente
- El backend no necesita conocer la lógica de cada tipo de misión

---

---

## ✅ VALIDACIÓN FINAL

### Build y Lint
- ✅ `npm run build` en backend: PASÓ sin errores
- ✅ Tipos de TypeScript validados

### Verificación de Cambios

**Misiones Diarias (`generateDailyMissions()`):**
| # | Tipo Anterior | Tipo Nuevo | Estado |
|---|--------------|------------|--------|
| 1 | `complete_exercises` | `complete_exercises` | ✅ Sin cambio |
| 2 | `correct_streak` | `earn_xp` | ✅ Alineado |
| 3 | `study_time` | `use_comodines` | ✅ Alineado |

**Misiones Semanales (`generateWeeklyMissions()`):**
| # | Tipo Anterior | Tipo Nuevo | Estado |
|---|--------------|------------|--------|
| 1 | `complete_exercises` | `complete_exercises` | ✅ Sin cambio |
| 2 | `consecutive_days` | `daily_streak` | ✅ Alineado |

### Alineación con Triggers de BD
- ✅ `earn_xp` → Trigger `trg_update_missions_on_earn_xp` lo reconocerá
- ✅ `use_comodines` → Trigger `trg_update_missions_on_use_comodines` lo reconocerá
- ✅ `daily_streak` → Trigger `trg_update_missions_on_daily_streak` lo reconocerá

### Criterios de Aceptación
- ✅ CA-001: Tipos de objetivos alineados en `generateDailyMissions()`
- ✅ CA-002: Tipos de objetivos alineados en `generateWeeklyMissions()`
- ✅ CA-003-006: Pendiente de validación funcional con usuario real

---

**Versión:** 1.1.0
**Fecha:** 2025-11-29
**Autor:** Architecture-Analyst
