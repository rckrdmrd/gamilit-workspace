# ANALISIS DE REGRESIONES - Student Portal Gamilit

**Fecha:** 2026-01-13
**Version:** 1.0.0
**Tipo:** Investigacion de Problemas
**Estado:** Analisis Completado

---

## RESUMEN EJECUTIVO

Se han identificado regresiones en tres paginas del Student Portal:

| Pagina | Error | Severidad | Causa Raiz |
|--------|-------|-----------|------------|
| Leaderboard | Muestra usuarios genericos | ALTA | Feature flag retorna array vacio |
| Achievements | No muestra ni funciona nada | ALTA | Sin datos en BD / APIs duplicadas |
| Module Detail | Marca error | MEDIA | Validacion de parametros faltante |

---

## 1. ERROR EN LEADERBOARD

### 1.1 Descripcion del Problema
La pagina de Leaderboard muestra usuarios como "usuario generico" o no muestra datos reales.

### 1.2 Causa Raiz Identificada

**Cadena de Fallo:**

1. **Feature Flag `USE_MOCK_DATA` activado incorrectamente**
   - Ubicacion: `/apps/frontend/src/config/api.config.ts:715`
   - Cuando `VITE_USE_MOCK_DATA=true`, la API retorna `[]` en lugar de datos mock

2. **socialAPI.ts retorna array vacio**
   - Ubicacion: `/apps/frontend/src/features/gamification/social/api/socialAPI.ts:390-392`
   ```typescript
   if (FEATURE_FLAGS.USE_MOCK_DATA) {
     await new Promise((resolve) => setTimeout(resolve, 600));
     return [];  // PROBLEMA: Retorna array vacio en lugar de mock data
   }
   ```

3. **Mock data nunca se usa**
   - Ubicacion: `/apps/frontend/src/features/gamification/social/mockData/leaderboardsMockData.ts`
   - El archivo existe con 100+ entradas pero nunca se invoca

4. **Backend usa fallback "Usuario"**
   - Ubicacion: `/apps/backend/src/modules/gamification/services/leaderboard.service.ts:138`
   - Si no hay perfiles en BD, usa 'Usuario' como fallback

### 1.3 Archivos Afectados

**Frontend:**
- `/apps/frontend/src/features/gamification/social/api/socialAPI.ts`
- `/apps/frontend/src/config/api.config.ts`
- `/apps/frontend/src/features/gamification/social/store/leaderboardsStore.ts`
- `/apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`
- `/apps/frontend/src/features/gamification/social/mockData/leaderboardsMockData.ts`

**Backend:**
- `/apps/backend/src/modules/gamification/services/leaderboard.service.ts`
- `/apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts`

### 1.4 Dependencias

```
LeaderboardPage.tsx
  └─> useLeaderboards() hook
      └─> leaderboardsStore (Zustand)
          └─> socialAPI.ts -> getLeaderboard()
              └─> FEATURE_FLAGS.USE_MOCK_DATA check
                  └─> Returns [] (PROBLEMA)

Backend:
LeaderboardController
  └─> leaderboardService.getGlobalLeaderboard()
      └─> userStatsRepo (gamification.user_stats)
      └─> profileRepo (auth.profiles)
          └─> Fallback a 'Usuario' si no hay perfil
```

### 1.5 Propuesta de Solucion

**Opcion A: Corregir socialAPI.ts para usar mock data real**
```typescript
// socialAPI.ts:390-392
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  return getLeaderboardByType(type); // Usar datos de leaderboardsMockData.ts
}
```

**Opcion B: Usar API real con datos en BD**
- Configurar `VITE_USE_MOCK_DATA=false`
- Verificar que tablas `user_stats` y `profiles` tengan datos

---

## 2. ERROR EN ACHIEVEMENTS

### 2.1 Descripcion del Problema
La pagina de Achievements no muestra ni funciona nada de lo esperado.

### 2.2 Causa Raiz Identificada

**Problemas Multiples:**

1. **Sin achievements en base de datos**
   - Tabla `gamification_system.achievements` vacia o sin `is_active = true`
   - Backend filtra por `is_active = true` (achievements.service.ts:109)

2. **Dos APIs de Achievements incompatibles**
   - Legacy: `/apps/frontend/src/services/api/achievementsAPI.ts`
   - Actual: `/apps/frontend/src/lib/api/gamification.api.ts`
   - TODO sin resolver en codigo (lineas 14-20 de achievementsAPI.ts)

3. **Incompatibilidad en transformacion de datos**
   - `/apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts`
   - Mapeos de campos inconsistentes entre APIs

4. **Backend retorna datos envueltos**
   - Backend: `{ data: { achievements: [...], total: N } }`
   - Frontend tiene multiples verificaciones de formato

### 2.3 Archivos Afectados

**Frontend:**
- `/apps/frontend/src/pages/AchievementsPage.tsx`
- `/apps/frontend/src/lib/api/gamification.api.ts`
- `/apps/frontend/src/services/api/achievementsAPI.ts` (LEGACY - duplicado)
- `/apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts`
- `/apps/frontend/src/shared/types/achievement.types.ts`
- `/apps/frontend/src/apps/student/components/achievements/*.tsx`

**Backend:**
- `/apps/backend/src/modules/gamification/controllers/achievements.controller.ts`
- `/apps/backend/src/modules/gamification/services/achievements.service.ts`
- `/apps/backend/src/modules/gamification/entities/achievement.entity.ts`

### 2.4 Dependencias

```
AchievementsPage.tsx
  └─> gamificationApi (lib/api/gamification.api.ts)
      └─> transformAchievements()
          └─> achievementTransformer.ts
      └─> GET /gamification/achievements
      └─> GET /gamification/users/{userId}/achievements

achievementsAPI.ts (LEGACY - no usar)
  └─> Funciones duplicadas que causan confusion
```

### 2.5 Propuesta de Solucion

**Paso 1: Verificar/Crear datos en BD**
```sql
-- Verificar achievements activos
SELECT COUNT(*) FROM gamification_system.achievements WHERE is_active = true;

-- Si esta vacio, crear seed data
INSERT INTO gamification_system.achievements (name, description, is_active, ...) VALUES (...);
```

**Paso 2: Consolidar APIs**
- Eliminar `/services/api/achievementsAPI.ts`
- Usar solo `/lib/api/gamification.api.ts`

**Paso 3: Agregar validaciones de respuesta**
```typescript
// gamification.api.ts
getAllAchievements: async (): Promise<Achievement[]> => {
  const { data } = await apiClient.get(...);
  if (!Array.isArray(data)) {
    console.warn('Invalid response:', data);
    return [];
  }
  return transformAchievements(data);
}
```

---

## 3. ERROR EN MODULE DETAIL

### 3.1 Descripcion del Problema
La pagina de detalle de modulo marca error al acceder.

### 3.2 Causa Raiz Identificada

**Problemas Identificados:**

1. **Rutas duplicadas con componentes diferentes**
   - `/modules/:moduleId` -> `ModuleDetailPage.tsx`
   - `/progress/modules/:moduleId` -> `ModuleDetailsPage.tsx`
   - Dos componentes diferentes para la misma funcionalidad

2. **Falta validacion de moduleId**
   - `ModuleDetailPage.tsx:183` no valida si `moduleId` es undefined
   - useParams() puede retornar undefined

3. **Endpoint de ejercicios puede retornar null**
   - `/educational/modules/{moduleId}/exercises` puede retornar null
   - Frontend espera siempre un array

### 3.3 Archivos Afectados

**Frontend:**
- `/apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`
- `/apps/frontend/src/pages/ModuleDetailsPage.tsx` (duplicado)
- `/apps/frontend/src/shared/hooks/useModules.ts`
- `/apps/frontend/src/App.tsx` (rutas)

**Backend:**
- `/apps/backend/src/modules/educational/controllers/modules.controller.ts`
- `/apps/backend/src/modules/educational/controllers/exercises.controller.ts`
- `/apps/backend/src/modules/educational/services/modules.service.ts`

### 3.4 Dependencias

```
ModuleDetailPage.tsx
  └─> useParams<{ moduleId: string }>()
  └─> useModuleDetail(moduleId, userId)
      └─> GET /educational/modules/{moduleId}
      └─> GET /educational/modules/{moduleId}/exercises
      └─> GET /progress/users/{userId}/modules/{moduleId}
  └─> useAuth() -> user.id
```

### 3.5 Propuesta de Solucion

**Paso 1: Agregar validacion de parametros**
```typescript
// ModuleDetailPage.tsx
const { moduleId } = useParams<{ moduleId: string }>();
if (!moduleId || moduleId === 'undefined') {
  return <ErrorPage message="Module ID is required" />;
}
```

**Paso 2: Consolidar rutas duplicadas**
```typescript
// App.tsx - Eliminar ruta duplicada o redirigir
<Route
  path="/progress/modules/:moduleId"
  element={<Navigate to="/modules/:moduleId" replace />}
/>
```

**Paso 3: Mejorar manejo de errores en useModules.ts**
```typescript
// useModules.ts
const exercisesResponse = await apiClient.get(...);
const moduleExercises = exercisesResponse.data;
const sortedExercises = Array.isArray(moduleExercises)
  ? moduleExercises.sort(...)
  : [];
```

---

## 4. ANALISIS DE DEPENDENCIAS CRUZADAS

### 4.1 Archivos Compartidos

```
Configuracion Global:
- /apps/frontend/src/config/api.config.ts
  └─> FEATURE_FLAGS.USE_MOCK_DATA (afecta Leaderboard)

API Client:
- /apps/frontend/src/services/api/apiClient.ts
  └─> Usado por todas las APIs

Auth Context:
- /apps/frontend/src/app/providers/AuthContext.tsx
  └─> Provee user.id para todas las paginas
```

### 4.2 Impacto de Cambios

| Archivo a Modificar | Impacto | Riesgo |
|---------------------|---------|--------|
| socialAPI.ts | Solo Leaderboard | BAJO |
| api.config.ts | Todas las APIs | MEDIO |
| gamification.api.ts | Achievements | BAJO |
| useModules.ts | Module Detail | BAJO |
| App.tsx (rutas) | Navegacion | MEDIO |

---

## 5. CHECKLIST DE VALIDACION PRE-FIX

### 5.1 Verificaciones de Base de Datos
- [ ] `SELECT COUNT(*) FROM gamification_system.achievements WHERE is_active = true`
- [ ] `SELECT COUNT(*) FROM gamification_system.user_stats`
- [ ] `SELECT COUNT(*) FROM auth.profiles WHERE profile_display_name IS NOT NULL`

### 5.2 Verificaciones de Configuracion
- [ ] Valor de `VITE_USE_MOCK_DATA` en `.env.local`
- [ ] Valor de `VITE_USE_MOCK_DATA` en `.env.development`
- [ ] Backend corriendo en puerto correcto

### 5.3 Verificaciones de API (con curl o Postman)
- [ ] `GET /gamification/leaderboard/global`
- [ ] `GET /gamification/achievements`
- [ ] `GET /gamification/users/{userId}/achievements`
- [ ] `GET /educational/modules/{moduleId}`
- [ ] `GET /educational/modules/{moduleId}/exercises`

---

## 6. PLAN DE CORRECCION (PROPUESTO)

### Fase 1: Leaderboard (Prioridad ALTA)
1. Modificar `socialAPI.ts:390-392` para retornar datos mock reales
2. O configurar `VITE_USE_MOCK_DATA=false` y verificar BD

### Fase 2: Achievements (Prioridad ALTA)
1. Verificar/crear seed data en BD
2. Eliminar API legacy (`/services/api/achievementsAPI.ts`)
3. Agregar validaciones en `gamification.api.ts`

### Fase 3: Module Detail (Prioridad MEDIA)
1. Agregar validacion de `moduleId` en `ModuleDetailPage.tsx`
2. Consolidar rutas duplicadas en `App.tsx`
3. Mejorar manejo de errores en `useModules.ts`

### Fase 4: Validacion
1. Ejecutar build completo
2. Probar cada pagina manualmente
3. Verificar consola del navegador sin errores

---

## 7. REFERENCIAS

### Archivos Clave
- Leaderboard: `apps/frontend/src/features/gamification/social/`
- Achievements: `apps/frontend/src/lib/api/gamification.api.ts`
- Modules: `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`

### Documentacion Relacionada
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/`
- `docs/01-fase-alcance-inicial/EAI-002-actividades/`

---

**Generado por:** Sistema SIMCO + CAPVED
**Modo:** MODE-ANALYSIS
**Siguiente Accion:** Crear plan de implementacion detallado
