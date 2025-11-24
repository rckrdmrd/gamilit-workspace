# ANÁLISIS: Progreso Inconsistente Entre Páginas (BUG-005)

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Prioridad:** P1 - CRITICAL
**Estado:** ANALYZED - ROOT CAUSE IDENTIFIED

---

## 1. RESUMEN DEL PROBLEMA

**Reporte del Product Owner:**
- Se completaron 5/5 ejercicios del módulo 2
- `ModuleDetailPage` muestra 5/5 ejercicios completados ✅
- `DashboardComplete` muestra solo 4/5 ejercicios completados ❌
- **Inconsistencia de datos** en el conteo de progreso

---

## 2. ANÁLISIS DE PÁGINAS

### 2.1 DashboardComplete (Muestra 4/5 - INCORRECTO)

**Ubicación:** `/apps/frontend/src/apps/student/pages/DashboardComplete.tsx`

**Flujo de datos:**
```
DashboardComplete
  ↓
useUserModules hook
  ↓
getUserModules API call
  ↓
GET /api/v1/educational/modules/user/:userId
  ↓
ModulesService.getUserModules()
  ↓
Query con exercise_attempts (TABLA INCORRECTA)
```

**Hook usado:** `useUserModules` (línea 53)
```typescript
const {
  modules: userModules,
  loading: modulesLoading,
  error: modulesError,
} = useUserModules();
```

**API endpoint:** `/educational/modules/user/${userId}`
- Definido en: `apps/frontend/src/services/api/apiConfig.ts:204`

**Componente de visualización:** `ModulesSection`
- Ubicación: `apps/frontend/src/apps/student/components/dashboard/ModulesSection.tsx`
- Muestra: `{module.completedExercises} / {module.totalExercises}` (línea 217)

### 2.2 ModuleDetailPage (Muestra 5/5 - CORRECTO)

**Ubicación:** `/apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`

**Flujo de datos:**
```
ModuleDetailPage
  ↓
useModuleDetail hook
  ↓
Fetch directo (sin API abstraction)
  ↓
GET /api/v1/educational/exercises (todos los ejercicios)
  ↓
Filtra por module_id en frontend
  ↓
Calcula completedExercises basado en exercise.completed
```

**Hook usado:** `useModuleDetail` (línea 172)
```typescript
const {
  module,
  exercises,
  loading,
  error,
} = useModuleDetail(moduleId || '');
```

**API endpoint:**
1. `/api/v1/educational/modules/${moduleId}` - Para el módulo
2. `/api/v1/educational/exercises` - Para TODOS los ejercicios (filtrados localmente)

**Cálculo de progreso:** (línea 284-286)
```typescript
const completedExercises = exercises.filter(ex => ex.completed).length;
const totalExercises = exercises.length;
const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
```

---

## 3. ANÁLISIS DE BACKEND

### 3.1 Endpoint Correcto: `/educational/modules` (con auth)

**Ubicación:** `apps/backend/src/modules/educational/controllers/modules.controller.ts`
**Método:** `findAll()` (líneas 101-148)

**Lógica de cálculo:**
```typescript
// 1. Obtiene todos los módulos
const modules = await this.modulesService.findAll();

// 2. Obtiene SUBMISSIONS del usuario (TABLA CORRECTA)
const allSubmissions = await this.exerciseSubmissionService.findByUserId(userId);

// 3. Mapea ejercicios completados basados en status = 'graded'
const completedExercisesMap = new Map<string, boolean>();
allSubmissions.forEach((submission) => {
  if (submission.status === 'graded') {  // ✅ CORRECTO
    completedExercisesMap.set(submission.exercise_id, true);
  }
});

// 4. Calcula progreso por módulo
const completedExercises = moduleExercises.filter((ex) =>
  completedExercisesMap.has(ex.id),
).length;
```

**Tabla usada:** `progress_tracking.exercise_submissions`
**Campo de validación:** `status = 'graded'` ✅

### 3.2 Endpoint Incorrecto: `/educational/modules/user/:userId`

**Ubicación:** `apps/backend/src/modules/educational/services/modules.service.ts`
**Método:** `getUserModules()` (líneas 124-173)

**Query SQL:**
```sql
SELECT
  m.id,
  m.title,
  ...
  COALESCE(completed_ex.completed, 0) as "completedExercises",
  COALESCE(total_ex.total, 0) as "totalExercises",
  ...
FROM educational_content.modules m
...
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT e.id) as completed
  FROM educational_content.exercises e
  INNER JOIN progress_tracking.exercise_attempts ea  -- ❌ TABLA INCORRECTA
    ON e.id = ea.exercise_id AND ea.user_id = $1
  WHERE e.module_id = m.id
    AND e.is_active = true
    AND ea.is_correct = true  -- ❌ CAMPO INCORRECTO
) completed_ex ON true
```

**Tabla usada:** `progress_tracking.exercise_attempts` ❌
**Campo de validación:** `is_correct = true` ❌

---

## 4. COMPARACIÓN DE TABLAS

### Tabla CORRECTA: `exercise_submissions`

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

**Estructura:**
```sql
CREATE TABLE progress_tracking.exercise_submissions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  answer_data jsonb NOT NULL,
  is_correct boolean,
  score integer DEFAULT 0,
  status text DEFAULT 'submitted',  -- ✅ CAMPO USADO
  ...
);
```

**Estados válidos:**
- `'draft'` - Borrador no enviado
- `'submitted'` - Enviado pero no calificado
- `'graded'` - Calificado (ejercicio completado) ✅
- `'reviewed'` - Revisado manualmente

### Tabla INCORRECTA: `exercise_attempts`

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`

**Estructura:**
```sql
CREATE TABLE progress_tracking.exercise_attempts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  submitted_answers jsonb NOT NULL,
  is_correct boolean,  -- ❌ CAMPO USADO (legacy)
  score integer,
  ...
);
```

**Problema:**
- Tabla legacy/obsoleta
- Campo `is_correct` no confiable
- No tiene concepto de "graded" vs "submitted"

---

## 5. CAUSA RAÍZ IDENTIFICADA

### 🎯 PROBLEMA PRINCIPAL:

El endpoint `/educational/modules/user/:userId` está usando:
1. **Tabla incorrecta:** `exercise_attempts` (legacy) en lugar de `exercise_submissions` (actual)
2. **Campo incorrecto:** `is_correct = true` en lugar de `status = 'graded'`

### IMPACTO:

**Escenario del bug:**
1. Usuario completa 5 ejercicios del módulo 2
2. Backend guarda en `exercise_submissions` con `status = 'graded'`
3. Backend puede NO guardar en `exercise_attempts` o guardar con `is_correct = NULL`
4. Endpoint `/educational/modules` (correcto) lee `exercise_submissions` → ve 5/5
5. Endpoint `/educational/modules/user/:userId` (incorrecto) lee `exercise_attempts` → ve 4/5

---

## 6. ENDPOINTS AFECTADOS

### ✅ CORRECTO (usa exercise_submissions):
- `GET /api/v1/educational/modules` (con JWT auth)
  - Usado por: Dashboard principal (?? - verificar)
  - Servicio: `ModulesController.findAll()`

### ❌ INCORRECTO (usa exercise_attempts):
- `GET /api/v1/educational/modules/user/:userId`
  - Usado por: `DashboardComplete`, `useUserModules`
  - Servicio: `ModulesService.getUserModules()`

### ⚠️ VERIFICAR:
- `GET /api/v1/educational/exercises`
  - Usado por: `ModuleDetailPage`
  - ¿Tiene campo `completed`? ¿Cómo lo calcula?

---

## 7. DATOS DE VERIFICACIÓN

### Test Case Reportado:
- Módulo: #2
- Ejercicios totales: 5
- Ejercicios completados (real): 5
- DashboardComplete muestra: 4/5 ❌
- ModuleDetailPage muestra: 5/5 ✅

### Hipótesis de datos:
```sql
-- exercise_submissions (CORRECTA)
SELECT COUNT(*) FROM progress_tracking.exercise_submissions
WHERE user_id = '<user_id>'
  AND exercise_id IN (SELECT id FROM exercises WHERE module_id = '<module_2_id>')
  AND status = 'graded';
-- Resultado: 5 ✅

-- exercise_attempts (INCORRECTA)
SELECT COUNT(DISTINCT exercise_id) FROM progress_tracking.exercise_attempts
WHERE user_id = '<user_id>'
  AND exercise_id IN (SELECT id FROM exercises WHERE module_id = '<module_2_id>')
  AND is_correct = true;
-- Resultado: 4 ❌
```

---

## 8. PLAN DE CORRECCIÓN

### Opción A: Unificar en `exercise_submissions` (RECOMENDADA)

**Cambios necesarios:**

1. **Backend - ModulesService.getUserModules()**
   - Archivo: `apps/backend/src/modules/educational/services/modules.service.ts`
   - Líneas: 124-173
   - Cambio: Reemplazar JOIN con `exercise_attempts` por JOIN con `exercise_submissions`
   - Query nueva:
     ```sql
     LEFT JOIN LATERAL (
       SELECT COUNT(DISTINCT e.id) as completed
       FROM educational_content.exercises e
       INNER JOIN progress_tracking.exercise_submissions es
         ON e.id = es.exercise_id AND es.user_id = $1
       WHERE e.module_id = m.id
         AND e.is_active = true
         AND es.status = 'graded'  -- ✅ CAMBIO CLAVE
     ) completed_ex ON true
     ```

2. **Testing:**
   - Verificar que `DashboardComplete` muestra 5/5
   - Verificar que `ModuleDetailPage` sigue mostrando 5/5
   - Verificar consistencia en todos los módulos

### Opción B: Unificar en `/educational/modules` endpoint

**Problema:** El endpoint `/educational/modules` requiere JWT auth, pero `/educational/modules/user/:userId` es público

**No recomendado:** Requiere cambios más extensos en frontend

---

## 9. SIGUIENTE PASO

**DELEGAR A:** Backend-Developer

**TAREA:** Corregir query SQL en `ModulesService.getUserModules()`

**ARCHIVO:** `apps/backend/src/modules/educational/services/modules.service.ts`

**ESPECIFICACIÓN:** Ver sección 8 - Opción A

---

## 10. CRITERIOS DE ACEPTACIÓN

- [ ] `DashboardComplete` muestra 5/5 para módulo 2
- [ ] `ModuleDetailPage` sigue mostrando 5/5 para módulo 2
- [ ] Progreso consistente en ambas páginas para todos los módulos
- [ ] Tests de integración pasan
- [ ] Query usa `exercise_submissions` con `status = 'graded'`

---

**Análisis completado:** 2025-11-23 21:45 UTC-6
**Próximo paso:** Implementación por Backend-Developer
