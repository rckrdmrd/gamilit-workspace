# NOTA: Consolidacion de educationalAPI y progressAPI

**Fecha:** 2026-01-16
**Estado:** COMPLETADO (educationalAPI) / NO APLICA (progressAPI)
**Tarea:** TASK-ETC-001-003 y TASK-ETC-001-004
**Actualizado:** 2026-01-16

---

## Hallazgos

### educationalAPI - 2 Versiones

| Version | Ubicacion | Imports | Funciones Exportadas |
|---------|-----------|---------|---------------------|
| Canonica | services/api/educationalAPI.ts | 3 | 20+ funciones completas |
| Legacy | lib/api/educational.api.ts | 3 | 6 funciones basicas |

**Archivos que usan lib/api (legacy):**
- `pages/ModuleDetailsPage.tsx`
- `pages/MyProgressPage.tsx`
- `pages/_legacy/DashboardPage.tsx`

**Funciones usadas de lib/api:**
- `educationalApi.getModules()`
- `educationalApi.getModuleById()`
- `educationalApi.getModuleExercises()`

**Mapeo de funciones para migracion:**
| lib/api | services/api |
|---------|--------------|
| `getModuleById(id)` | `getModule(moduleId)` |
| `getExerciseById(id)` | `getExercise(exerciseId)` |
| `getModules()` | `getModules()` |
| `getModuleExercises()` | `getModuleExercises()` |

---

### progressAPI - 2 Versiones

| Version | Ubicacion | Imports | Funciones Exportadas |
|---------|-----------|---------|---------------------|
| Principal | features/progress/api/progressAPI.ts | 21 | submitExercise, saveProgress |
| Legacy | lib/api/progress.api.ts | 5 | progressApi object |

**Archivos que usan lib/api (legacy):**
- `pages/ModuleDetailsPage.tsx`
- `pages/MyProgressPage.tsx`
- `pages/_legacy/DashboardPage.tsx`
- `components/_legacy/dashboard-migration-sprint/RecentActivityFeed.tsx`

---

## Plan de Consolidacion

### Fase 1: educationalAPI
1. Verificar que `services/api/educationalAPI.ts` tiene todas las funciones
2. Actualizar imports en `ModuleDetailsPage.tsx`
3. Actualizar imports en `MyProgressPage.tsx`
4. Eliminar `lib/api/educational.api.ts`

### Fase 2: progressAPI
1. Verificar funcionalidad en `features/progress/api/progressAPI.ts`
2. Agregar funciones faltantes si es necesario
3. Actualizar imports en pages legacy
4. Eliminar `lib/api/progress.api.ts`

---

## Riesgo

- **Bajo**: Las funciones equivalentes existen en las versiones canonicas
- **Accion requerida**: Actualizar imports y ajustar nombres de funciones
- **Testing**: Verificar que ModuleDetailsPage y MyProgressPage funcionan post-migracion

---

## Resolucion

### educationalAPI - CONSOLIDADO

**Acciones realizadas:**
1. Migrados imports en `ModuleDetailsPage.tsx`:
   - `educationalApi.getModuleById` → `getModule` de `services/api/educationalAPI`
   - `educationalApi.getModuleExercises` → `getModuleExercises` de `services/api/educationalAPI`
2. Migrados imports en `MyProgressPage.tsx`:
   - `educationalApi.getModules` → `getModules` de `services/api/educationalAPI`
3. Eliminado `lib/api/educational.api.ts`
4. `pages/_legacy/DashboardPage.tsx` no esta ruteado - no requiere actualizacion

**Resultado:** ✅ Build exitoso

### progressAPI - NO APLICA (APIs Complementarias)

**Analisis:**
Las dos APIs NO son duplicadas, son complementarias:

| API | Ubicacion | Proposito |
|-----|-----------|-----------|
| Progress Tracking | `lib/api/progress.api.ts` | Seguimiento de progreso del usuario |
| Exercise Mechanics | `features/progress/api/progressAPI.ts` | Envio de ejercicios y autosave |

**Funciones unicas de cada API:**

`lib/api/progress.api.ts`:
- `getUserProgressSummary()` - Resumen general
- `getUserProgress()` - Progreso por modulos
- `getLearningSessions()` - Sesiones de aprendizaje
- `getSessionStats()` - Estadisticas de sesion

`features/progress/api/progressAPI.ts`:
- `submitExercise()` - Envio de ejercicios
- `autoSaveProgress()` - Guardado automatico
- `getAutoSavedProgress()` - Recuperar progreso guardado

**Decision:** Mantener ambas APIs ya que sirven propositos diferentes.

---

## Estado Final

- [x] Migrar educationalAPI imports
- [x] Eliminar lib/api/educational.api.ts
- [x] Validar build
- [N/A] progressAPI - Son APIs complementarias, no duplicadas

**Completado:** 2026-01-16

---

**Creado:** 2026-01-16
**Actualizado:** 2026-01-16
**Asignado:** NEXUS-FRONTEND
