# FASE 3: PLAN DE IMPLEMENTACIONES Y CORRECCIONES

**Fecha:** 2025-12-18
**Perfil:** Requirements Analyst
**Proyecto:** Gamilit

---

## RESUMEN DE GAPS A RESOLVER

| Prioridad | Cantidad | Descripción |
|-----------|----------|-------------|
| CRÍTICOS | 4 | Bloquean producción |
| ALTOS | 5 | Afectan calidad |
| MEDIOS | 3 | Mejoras |
| **TOTAL** | **12** | |

---

## SPRINT 0: CORRECCIONES CRÍTICAS

### TASK-001: Integrar Emparejamiento en ExerciseContentRenderer

**Prioridad:** CRÍTICA
**Impacto:** Respuestas de ejercicios Emparejamiento no renderizan

**Archivo a modificar:**
- `/apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx`

**Cambios requeridos:**
```typescript
// Agregar case para 'emparejamiento'
case 'emparejamiento':
  return <EmparejamientoRenderer data={answerData} correct={correctAnswer} showComparison={showComparison} />;
```

**Dependencias:**
- Crear componente EmparejamientoRenderer si no existe
- Importar desde features/mechanics/module1/Emparejamiento/

**Archivos impactados:**
1. `ExerciseContentRenderer.tsx` - Agregar case
2. Posiblemente crear `EmparejamientoRenderer.tsx`

**Estimación:** 2-4 horas

---

### TASK-002: Completar Mecánicas Auxiliares (Tipos y Schemas)

**Prioridad:** CRÍTICA
**Impacto:** 4 mecánicas no son producción-ready

**Mecánicas afectadas:**
1. ComprensiónAuditiva
2. CollagePrensa
3. TextoEnMovimiento
4. CallToAction

**Archivos a crear por cada mecánica:**

#### ComprensiónAuditiva
```
/features/mechanics/auxiliar/ComprensiónAuditiva/
├── comprensiónAuditivaTypes.ts (CREAR)
├── comprensiónAuditivaSchemas.ts (CREAR)
├── comprensiónAuditivaMockData.ts (CREAR)
```

#### CollagePrensa
```
/features/mechanics/auxiliar/CollagePrensa/
├── collagePrensaTypes.ts (CREAR)
├── collagePrensaSchemas.ts (CREAR)
├── collagePrensa MockData.ts (CREAR)
```

#### TextoEnMovimiento
```
/features/mechanics/auxiliar/TextoEnMovimiento/
├── textoEnMovimientoTypes.ts (CREAR)
├── textoEnMovimientoSchemas.ts (CREAR)
├── textoEnMovimientoMockData.ts (CREAR)
```

#### CallToAction
```
/features/mechanics/auxiliar/CallToAction/
├── callToActionTypes.ts (CREAR)
├── callToActionSchemas.ts (CREAR)
├── callToActionMockData.ts (CREAR)
```

**Dependencias:**
- Refactorizar interfaces inline de componentes existentes
- Importar zod para schemas

**Archivos impactados:**
- 12 archivos nuevos
- 4 componentes existentes (refactorizar imports)

**Estimación:** 8-12 horas

---

### TASK-003: Implementar Gamification API Completo

**Prioridad:** CRÍTICA
**Impacto:** Solo 20% de endpoints gamification implementados

**Archivo a modificar:**
- `/apps/frontend/src/services/api/gamificationAPI.ts`

**Endpoints a implementar:**

```typescript
// Endpoints faltantes
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  const response = await apiClient.get(`/gamification/achievements/${userId}`);
  return response.data;
};

export const getUserRanks = async (userId: string): Promise<UserRank> => {
  const response = await apiClient.get(`/gamification/ranks/${userId}`);
  return response.data;
};

export const getLeaderboard = async (params: LeaderboardParams): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get('/gamification/leaderboard', { params });
  return response.data;
};

export const getUserCoins = async (userId: string): Promise<CoinsStatus> => {
  const response = await apiClient.get(`/gamification/coins/${userId}`);
  return response.data;
};

export const getUserXP = async (userId: string): Promise<XPStatus> => {
  const response = await apiClient.get(`/gamification/xp/${userId}`);
  return response.data;
};

export const claimAchievement = async (userId: string, achievementId: string): Promise<ClaimResult> => {
  const response = await apiClient.post(`/gamification/achievements/${userId}/claim/${achievementId}`);
  return response.data;
};
```

**Dependencias:**
- Verificar que endpoints existan en backend
- Crear tipos TypeScript correspondientes
- Agregar error handling

**Archivos impactados:**
1. `gamificationAPI.ts` - Agregar funciones
2. Posiblemente crear `gamificationTypes.ts`

**Estimación:** 4-6 horas

---

### TASK-004: Agregar Tests para Teacher Portal (Crítico)

**Prioridad:** CRÍTICA
**Impacto:** 97 archivos sin tests, riesgo de regresiones

**Estructura de tests a crear:**
```
/apps/frontend/src/apps/teacher/__tests__/
├── hooks/
│   ├── useTeacherDashboard.test.ts
│   ├── useGrading.test.ts
│   ├── useMasteryTracking.test.ts
│   ├── useClassroomRealtime.test.ts
│   ├── useMissionStats.test.ts
├── components/
│   ├── dashboard/
│   │   └── TeacherDashboardStats.test.tsx
│   ├── grading/
│   │   └── RubricEvaluator.test.tsx
│   ├── responses/
│   │   └── ResponseDetailModal.test.tsx
├── pages/
│   ├── TeacherDashboardPage.test.tsx
│   ├── TeacherAssignmentsPage.test.tsx
│   ├── TeacherMonitoringPage.test.tsx
```

**Prioridad de tests:**
1. Hooks (core logic)
2. Páginas principales
3. Componentes críticos

**Dependencias:**
- Configuración Vitest existente
- Mocks para APIs y stores

**Estimación:** 16-24 horas

---

## SPRINT 1: CORRECCIONES ALTAS

### TASK-005: Eliminar Páginas Huérfanas y Duplicadas

**Prioridad:** ALTA
**Impacto:** Código muerto, confusión en mantenimiento

**Archivos a ELIMINAR:**
```
/apps/frontend/src/apps/student/pages/
├── GamificationTestPage.tsx (ELIMINAR)
├── GamificationPage.tsx (ELIMINAR - legacy)
├── PasswordRecoveryPage.tsx (ELIMINAR - duplicada)
├── ProfilePage.tsx (ELIMINAR - usar EnhancedProfilePage)
├── LoginPage.tsx (ELIMINAR - usar pages/auth)
├── RegisterPage.tsx (ELIMINAR - usar pages/auth)
├── admin/RolesPermissionsPage.tsx (MOVER a apps/admin/)
├── admin/UserManagementPage.tsx (MOVER a apps/admin/)
```

**Archivo a EVALUAR:**
- `NewLeaderboardPage.tsx` - Comparar con LeaderboardPage actual

**Dependencias:**
- Verificar que no hay imports a estos archivos
- Actualizar rutas si es necesario

**Archivos impactados:**
- 8 archivos a eliminar
- 2 archivos a mover
- Posibles imports a actualizar

**Estimación:** 2-4 horas

---

### TASK-006: Implementar Schemas Module 2

**Prioridad:** ALTA
**Impacto:** Validación débil en 4 mecánicas

**Archivos a crear:**
```
/features/mechanics/module2/
├── LecturaInferencial/lecturaInferencialSchemas.ts (CREAR)
├── PuzzleContexto/puzzleContextoSchemas.ts (CREAR)
├── PrediccionNarrativa/prediccionNarrativaSchemas.ts (CREAR)
├── ConstruccionHipotesis/construccionHipotesisSchemas.ts (CREAR)
```

**Patrón a seguir (de DetectiveTextual):**
```typescript
import { z } from 'zod';

export const lecturaInferencialAnswerSchema = z.object({
  selectedOption: z.string(),
  timestamp: z.number(),
  // ... otros campos según tipo
});

export const lecturaInferencialExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('lectura_inferencial'),
  // ... estructura del ejercicio
});

export type LecturaInferencialAnswer = z.infer<typeof lecturaInferencialAnswerSchema>;
```

**Dependencias:**
- Importar zod
- Revisar tipos existentes para estructura

**Archivos impactados:**
- 4 archivos nuevos
- Posiblemente actualizar imports en componentes

**Estimación:** 4-6 horas

---

### TASK-007: Agregar Error Handling a APIs Pendientes

**Prioridad:** ALTA
**Impacto:** UX pobre en errores

**Archivos a modificar:**
1. `profileAPI.ts`
2. `passwordAPI.ts`
3. `schoolsAPI.ts`
4. `missionsAPI.ts`

**Patrón a implementar:**
```typescript
import { handleAPIError } from './apiErrorHandler';

export const updateProfile = async (userId: string, data: ProfileData) => {
  try {
    const response = await apiClient.put(`/users/${userId}/profile`, data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};
```

**Dependencias:**
- `apiErrorHandler.ts` ya existe

**Archivos impactados:**
- 4 archivos a modificar

**Estimación:** 2-3 horas

---

### TASK-008: Tests para Mechanics

**Prioridad:** ALTA
**Impacto:** 80+ archivos sin tests

**Estructura de tests a crear:**
```
/features/mechanics/__tests__/
├── module1/
│   ├── VerdaderoFalso.test.tsx
│   ├── Crucigrama.test.tsx
│   ├── SopaLetras.test.tsx
│   ├── Emparejamiento.test.tsx
│   ├── Timeline.test.tsx
├── module2/
│   ├── DetectiveTextual.test.tsx
│   ├── RuedaInferencias.test.tsx
├── module3/
│   ├── AnalisisFuentes.test.tsx
│   ├── PodcastArgumentativo.test.tsx
├── shared/
│   └── ExerciseContentRenderer.test.tsx
```

**Prioridad de tests:**
1. ExerciseContentRenderer (crítico)
2. Mecánicas Module 1 (base)
3. Mecánicas Module 3 (producción)

**Estimación:** 12-16 horas

---

### TASK-009: Tests para Assignments

**Prioridad:** ALTA
**Impacto:** 15 archivos sin tests

**Estructura:**
```
/features/assignments/__tests__/
├── hooks/
│   └── useAssignments.test.ts
├── components/
│   └── AssignmentCard.test.tsx
├── api/
│   └── assignmentsApi.test.ts
```

**Estimación:** 6-8 horas

---

## SPRINT 2: MEJORAS

### TASK-010: Completar Páginas Teacher en Construcción

**Prioridad:** MEDIA
**Impacto:** Funcionalidad pendiente

**Archivos a completar:**
1. `TeacherContentPage.tsx` - Remover flag SHOW_UNDER_CONSTRUCTION
2. `TeacherResourcesPage.tsx` - Implementar funcionalidad

**Dependencias:**
- Definir requerimientos de estas páginas
- Verificar APIs necesarias

**Estimación:** 8-16 horas (depende de alcance)

---

### TASK-011: Agregar Mock Data Faltante

**Prioridad:** MEDIA
**Impacto:** Testing difícil

**Archivos a crear:**
```
/features/mechanics/
├── module2/LecturaInferencial/lecturaInferencialMockData.ts (CREAR)
├── module2/ConstruccionHipotesis/construccionHipotesisMockData.ts (CREAR)
```

**Patrón:**
```typescript
export const lecturaInferencialMockExercise = {
  id: 'mock-li-001',
  type: 'lectura_inferencial',
  title: 'Ejercicio de prueba',
  // ... estructura completa
};

export const lecturaInferencialMockData = [
  lecturaInferencialMockExercise,
  // más ejemplos
];
```

**Estimación:** 2-4 horas

---

### TASK-012: Conectar analyticsInterceptor

**Prioridad:** MEDIA
**Impacto:** Métricas perdidas

**Archivo a modificar:**
- `/apps/frontend/src/services/api/apiInterceptors.ts`

**Cambios:**
```typescript
// Conectar a servicio de analytics real
export const analyticsInterceptor = {
  onRequest: (config) => {
    analyticsService.trackAPICall({
      endpoint: config.url,
      method: config.method,
      timestamp: Date.now()
    });
    return config;
  },
  onResponse: (response) => {
    analyticsService.trackAPIResponse({
      endpoint: response.config.url,
      status: response.status,
      duration: Date.now() - response.config.metadata?.startTime
    });
    return response;
  }
};
```

**Dependencias:**
- Definir analyticsService
- Decidir destino de métricas

**Estimación:** 2-4 horas

---

## MATRIZ DE DEPENDENCIAS

```
TASK-001 (Emparejamiento ECR)
    └── No tiene dependencias

TASK-002 (Mecánicas Auxiliares)
    └── No tiene dependencias

TASK-003 (Gamification API)
    └── Depende de: Backend endpoints existentes

TASK-004 (Tests Teacher)
    └── No tiene dependencias

TASK-005 (Eliminar páginas)
    └── Depende de: Verificar imports

TASK-006 (Schemas Module 2)
    └── No tiene dependencias

TASK-007 (Error Handling APIs)
    └── No tiene dependencias

TASK-008 (Tests Mechanics)
    └── Depende de: TASK-001 (Emparejamiento)

TASK-009 (Tests Assignments)
    └── No tiene dependencias

TASK-010 (Páginas Teacher)
    └── Depende de: Definición de requerimientos

TASK-011 (Mock Data)
    └── Depende de: TASK-006 (Schemas)

TASK-012 (Analytics)
    └── Depende de: Definición de analyticsService
```

---

## CRONOGRAMA SUGERIDO

### Semana 1: Sprint 0 - Críticos
| Día | Tasks | Horas |
|-----|-------|-------|
| 1-2 | TASK-001, TASK-002 | 12-16h |
| 3 | TASK-003 | 4-6h |
| 4-5 | TASK-004 (inicio) | 8-12h |

### Semana 2: Sprint 1 - Altos
| Día | Tasks | Horas |
|-----|-------|-------|
| 1 | TASK-005, TASK-006 | 6-10h |
| 2 | TASK-007 | 2-3h |
| 3-5 | TASK-004 (cont), TASK-008 | 16-20h |

### Semana 3: Sprint 2 - Mejoras
| Día | Tasks | Horas |
|-----|-------|-------|
| 1-2 | TASK-009 | 6-8h |
| 3-4 | TASK-010, TASK-011 | 10-20h |
| 5 | TASK-012 | 2-4h |

---

## ESTIMACIÓN TOTAL

| Sprint | Tasks | Horas Est. |
|--------|-------|------------|
| Sprint 0 | 4 | 30-48h |
| Sprint 1 | 5 | 26-37h |
| Sprint 2 | 3 | 18-36h |
| **TOTAL** | **12** | **74-121h** |

---

**Estado:** FASE 3 COMPLETADA
**Siguiente:** FASE 4 - Validación de Planeación vs Análisis
