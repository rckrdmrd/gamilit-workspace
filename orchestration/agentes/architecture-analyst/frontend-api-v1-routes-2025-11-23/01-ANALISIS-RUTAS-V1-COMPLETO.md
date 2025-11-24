# ANÁLISIS COMPLETO: Rutas con /v1/ Incorrectas en Frontend

**Fecha:** 2025-11-23
**Agente:** Architecture-Analyst
**Bug ID:** BUG-FRONTEND-003
**Severidad:** CRÍTICA
**Prioridad:** P0

---

## 🔴 RESUMEN EJECUTIVO

**Problema:** Se encontraron **7 ocurrencias de `/v1/` en rutas** del frontend que no existen en el backend, causando errores 404 en múltiples funcionalidades.

**Root Cause:** Hard-coding sistemático de rutas con `/v1/` incorrecto en stores y API clients.

**Impacto:**
- ❌ **Ejercicio 3 Módulo 1:** No puede enviar respuestas (submissions)
- ❌ **Economy Store:** No puede obtener stats de usuario
- ❌ **Ranks Store:** No puede obtener stats ni rank-progress
- ❌ Funcionalidad de gamificación parcialmente rota

**Solución:** Eliminar `/v1/` de 6 rutas + actualizar 1 comentario.

---

## 📋 EVIDENCIA DEL PROBLEMA

### Error Principal (Ejercicio 3 - Submissions)

**Error en Console:**
```
POST http://localhost:3006/api/v1/progress/submissions/submit 404 (Not Found)
[API] Resource not found: /v1/progress/submissions/submit

❌ [CompletarEspacios] Submission error: NotFoundError: Cannot POST /api/v1/progress/submissions/submit
```

**Archivo:** `apps/frontend/src/features/progress/api/progressAPI.ts:387`

---

### Errores Adicionales Identificados

**Economy Store (3 ocurrencias):**
```
GET http://localhost:3006/api/v1/gamification/users/{userId}/stats 404 (Not Found)
```

**Archivo:** `apps/frontend/src/features/gamification/economy/store/economyStore.ts`
- Línea 120
- Línea 178
- Línea 556

---

**Ranks Store (2 ocurrencias):**
```
GET http://localhost:3006/api/v1/gamification/users/{userId}/stats 404 (Not Found)
GET http://localhost:3006/api/v1/gamification/users/{userId}/rank-progress 404 (Not Found)
```

**Archivo:** `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`
- Línea 155
- Línea 601

---

## 🔍 ANÁLISIS DETALLADO

### Búsqueda Global de /v1/

```bash
grep -rn "/v1/" apps/frontend/src --include="*.ts" --include="*.tsx"
```

**Resultado:** 7 ocurrencias encontradas

| # | Archivo | Línea | Tipo | Severidad |
|---|---------|-------|------|-----------|
| 1 | `progressAPI.ts` | 378 | Comentario | BAJA |
| 2 | `progressAPI.ts` | 387 | **Ruta real** | **CRÍTICA** |
| 3 | `economyStore.ts` | 120 | **Ruta real** | **CRÍTICA** |
| 4 | `economyStore.ts` | 178 | **Ruta real** | **CRÍTICA** |
| 5 | `economyStore.ts` | 556 | **Ruta real** | **CRÍTICA** |
| 6 | `ranksStore.ts` | 155 | **Ruta real** | **CRÍTICA** |
| 7 | `ranksStore.ts` | 601 | **Ruta real** | **CRÍTICA** |

**Total a corregir:**
- 6 rutas reales (CRÍTICAS)
- 1 comentario (OPCIONAL)

---

## 📂 ARCHIVOS AFECTADOS

### 1. progressAPI.ts (Progress Module)

**Ubicación:** `apps/frontend/src/features/progress/api/progressAPI.ts`

**Ocurrencias:** 2 (1 comentario + 1 ruta)

#### Línea 378 (Comentario)

**Estado actual:**
```typescript
// Backend endpoint: POST /api/v1/progress/submissions/submit
```

**Fix requerido:**
```typescript
// Backend endpoint: POST /api/progress/submissions/submit
```

**Severidad:** BAJA (es solo comentario, pero debe coincidir con realidad)

---

#### Línea 387 (Ruta Real) ⚠️ **CRÍTICO**

**Estado actual:**
```typescript
const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
  '/v1/progress/submissions/submit',  // ❌ con /v1/
  backendPayload
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
  '/progress/submissions/submit',  // ✅ sin /v1/
  backendPayload
);
```

**Impacto:** Bloquea envío de ejercicios (submissions)
**Backend real:** `/api/progress/submissions/submit`

---

### 2. economyStore.ts (Gamification - Economy)

**Ubicación:** `apps/frontend/src/features/gamification/economy/store/economyStore.ts`

**Ocurrencias:** 3

#### Línea 120 ⚠️ **CRÍTICO**

**Contexto:** Función `updateUserStats` (actualizar stats después de comprar item)

**Estado actual:**
```typescript
const { data } = await apiClient.patch(
  `/v1/gamification/users/${userId}/stats`,  // ❌ con /v1/
  { ml_coins: updatedCoins }
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.patch(
  `/gamification/users/${userId}/stats`,  // ✅ sin /v1/
  { ml_coins: updatedCoins }
);
```

**Impacto:** No puede actualizar ML Coins después de compra
**Backend real:** `/api/gamification/users/:userId/stats`

---

#### Línea 178 ⚠️ **CRÍTICO**

**Contexto:** Función `spendMLCoins` (gastar ML Coins)

**Estado actual:**
```typescript
const { data } = await apiClient.patch(
  `/v1/gamification/users/${userId}/stats`,  // ❌ con /v1/
  { ml_coins: updatedCoins }
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.patch(
  `/gamification/users/${userId}/stats`,  // ✅ sin /v1/
  { ml_coins: updatedCoins }
);
```

**Impacto:** No puede descontar ML Coins en transacciones
**Backend real:** `/api/gamification/users/:userId/stats`

---

#### Línea 556 ⚠️ **CRÍTICO**

**Contexto:** Función `fetchUserStats` (obtener stats del usuario)

**Estado actual:**
```typescript
const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);  // ❌ con /v1/
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);  // ✅ sin /v1/
```

**Impacto:** No puede cargar stats de usuario en economy store
**Backend real:** `/api/gamification/users/:userId/stats`

---

### 3. ranksStore.ts (Gamification - Ranks)

**Ubicación:** `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`

**Ocurrencias:** 2

#### Línea 155 ⚠️ **CRÍTICO**

**Contexto:** Función `fetchUserProgress` (obtener progreso de rank)

**Estado actual:**
```typescript
const { data } = await apiClient.get(
  `/v1/gamification/users/${userId}/stats`,  // ❌ con /v1/
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(
  `/gamification/users/${userId}/stats`,  // ✅ sin /v1/
);
```

**Impacto:** No puede cargar stats para calcular progreso de rank
**Backend real:** `/api/gamification/users/:userId/stats`

---

#### Línea 601 ⚠️ **CRÍTICO**

**Contexto:** Función `calculateRankProgress` (calcular progreso hacia siguiente rank)

**Estado actual:**
```typescript
const { data } = await apiClient.get(`/v1/gamification/users/${userId}/rank-progress`);  // ❌ con /v1/
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(`/gamification/users/${userId}/rank-progress`);  // ✅ sin /v1/
```

**Impacto:** No puede obtener progreso detallado de rank
**Backend real:** `/api/gamification/users/:userId/rank-progress`

---

## 🎯 ROOT CAUSE ANALYSIS

### Causa Raíz: Hard-Coding Sistemático Incorrecto

#### Patrón Identificado

Múltiples desarrolladores o sesiones de desarrollo han hard-coded rutas con `/v1/` asumiendo incorrectamente que el backend lo tiene.

**Evidencia:**
- Archivos en diferentes módulos (progress, economy, ranks)
- Creados en diferentes momentos
- Patrón consistente: todos agregan `/v1/`

#### ¿Por Qué Asumieron /v1/?

**Hipótesis:**
1. **Comentarios engañosos:** El backend tiene comentarios que dicen `@route /api/v1/...` pero NO está configurado así
2. **Asunción de versioning:** Developers asumieron API versioning (práctica común)
3. **Falta de documentación:** No existía guía clara sobre rutas (hasta hoy con ADR-011)
4. **No usan API modules:** Hard-coding en lugar de usar `gamificationApi`, `progressApi`

#### Configuración Real del Backend

**Global prefix:**
```typescript
// apps/backend/src/main.ts:17
app.setGlobalPrefix('api');  // Solo /api, NO /api/v1
```

**Controllers:**
```typescript
// apps/backend/src/modules/gamification/controllers/user-stats.controller.ts
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))  // 'gamification'
@Get('users/:userId/stats')

// Ruta final: /api + /gamification + /users/:userId/stats
//           = /api/gamification/users/:userId/stats ✅
```

---

## 📊 IMPACTO

### Funcionalidad Afectada

| Módulo | Funcionalidad | Severidad | Estado |
|--------|---------------|-----------|--------|
| **Progress** | Submit exercise (ejercicio 3) | CRÍTICA | ❌ Roto |
| **Economy** | Update ML Coins after purchase | ALTA | ❌ Roto |
| **Economy** | Spend ML Coins | ALTA | ❌ Roto |
| **Economy** | Fetch user stats | ALTA | ❌ Roto |
| **Ranks** | Fetch user progress | MEDIA | ❌ Roto |
| **Ranks** | Calculate rank progress | MEDIA | ❌ Roto |

### Experiencia de Usuario

- ❌ **No puede enviar ejercicio completado** → Bloquea aprendizaje
- ❌ **No puede ver su progreso de rank** → UX degradada
- ❌ **No puede gastar ML Coins** → Economía del juego rota
- ❌ **No puede ver stats actualizadas** → Información desactualizada

---

## ✅ SOLUCIÓN PROPUESTA

### Estrategia: Fix Mínimo (MINIMAL CHANGE)

Eliminar `/v1/` de las 6 rutas reales + actualizar 1 comentario.

### Archivos a Modificar (3 archivos, 7 líneas)

#### 1. progressAPI.ts (2 cambios)

**Línea 378 (comentario):**
```diff
- // Backend endpoint: POST /api/v1/progress/submissions/submit
+ // Backend endpoint: POST /api/progress/submissions/submit
```

**Línea 387 (ruta):**
```diff
- '/v1/progress/submissions/submit',
+ '/progress/submissions/submit',
```

---

#### 2. economyStore.ts (3 cambios)

**Línea 120:**
```diff
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
```

**Línea 178:**
```diff
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
```

**Línea 556:**
```diff
- const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);
+ const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
```

---

#### 3. ranksStore.ts (2 cambios)

**Línea 155:**
```diff
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
```

**Línea 601:**
```diff
- const { data } = await apiClient.get(`/v1/gamification/users/${userId}/rank-progress`);
+ const { data } = await apiClient.get(`/gamification/users/${userId}/rank-progress`);
```

---

### Validación Backend

**Rutas que el backend SÍ expone:**

```bash
# Progress - Submissions
✅ POST /api/progress/submissions/submit

# Gamification - User Stats
✅ GET  /api/gamification/users/:userId/stats
✅ PATCH /api/gamification/users/:userId/stats

# Gamification - Rank Progress
✅ GET /api/gamification/users/:userId/rank-progress
```

**Rutas que el frontend intenta llamar (INCORRECTAS):**

```bash
# Con /v1/ de más ❌
❌ POST /api/v1/progress/submissions/submit
❌ GET  /api/v1/gamification/users/:userId/stats
❌ PATCH /api/v1/gamification/users/:userId/stats
❌ GET  /api/v1/gamification/users/:userId/rank-progress
```

---

## 🚀 PRÓXIMOS PASOS

### P0 - Inmediato (HOY)

- [ ] **Bug-Fixer:** Corregir 3 archivos (7 líneas totales)
  - progressAPI.ts (2 líneas)
  - economyStore.ts (3 líneas)
  - ranksStore.ts (2 líneas)

- [ ] **Bug-Fixer:** Validar que ejercicio 3 funciona
  - Usuario puede enviar respuestas
  - Sin errores 404 en console

- [ ] **Bug-Fixer:** Validar economy y ranks
  - ML Coins se actualizan correctamente
  - Rank progress se calcula correctamente

### P1 - Esta Semana (Prevención)

- [ ] **Frontend-Developer:** Refactorizar stores para usar API modules
  - `economyStore.ts` debe usar `gamificationApi.getUserStats()`
  - `ranksStore.ts` debe usar `gamificationApi.getUserStats()`
  - Eliminar hard-coding de rutas

- [ ] **Architecture-Analyst:** Auditar otros stores/hooks
  - Buscar más hard-coding de rutas
  - Documentar en reporte

### P2 - Próximas 2 Semanas (Automatización)

- [ ] **DevOps-Agent:** Implementar validación automática
  - ESLint rule custom para detectar `/v1/` en strings
  - Pre-commit hook que falla si encuentra `/v1/`
  - CI/CD que valida no hay hard-coded routes

---

## 📚 LECCIONES APRENDIDAS

### Nuevas Lecciones

1. **Comentarios engañosos son peligrosos**
   - Backend tiene comentarios con `/v1/` pero no está configurado así
   - Developers copian de comentarios sin verificar

2. **Hard-coding es sistemático**
   - No es error aislado, está en múltiples módulos
   - Necesita auditoría completa del codebase

3. **Stores no deben hacer llamadas directas**
   - `economyStore.ts` hace `apiClient.get()` directamente
   - `ranksStore.ts` hace `apiClient.get()` directamente
   - Deben usar API modules (`gamificationApi`)

### Recomendaciones

4. **Crear linter rule anti-/v1/**
   ```javascript
   // .eslintrc.js
   rules: {
     'no-restricted-syntax': [
       'error',
       {
         selector: "Literal[value=/\\/v1\\//]",
         message: "Do not use /v1/ in API routes. Backend does not have /v1/ prefix.",
       },
     ],
   }
   ```

5. **Actualizar comentarios del backend**
   - Cambiar `@route /api/v1/...` → `@route /api/...`
   - Previene confusión de developers

6. **Auditoría completa necesaria**
   - Pueden existir más `/v1/` en otros archivos
   - Buscar en todos los stores, hooks, services

---

## 🔗 REFERENCIAS

### Archivos Problemáticos

- ❌ `apps/frontend/src/features/progress/api/progressAPI.ts` (líneas 378, 387)
- ❌ `apps/frontend/src/features/gamification/economy/store/economyStore.ts` (líneas 120, 178, 556)
- ❌ `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts` (líneas 155, 601)

### Backend Controllers

- ✅ `apps/backend/src/modules/progress/controllers/exercise-submission.controller.ts`
- ✅ `apps/backend/src/modules/gamification/controllers/user-stats.controller.ts`
- ✅ `apps/backend/src/main.ts` (global prefix)

### Documentación Relacionada

- [BUG-FRONTEND-002](../frontend-api-routes-404-2025-11-23/01-ANALISIS-RUTAS-404.md) - Primer bug de /v1/ encontrado
- [ADR-011](../../../docs/97-adr/ADR-011-frontend-api-client-structure.md) - Arquitectura de API Clients
- [API Architecture](../../../docs/frontend/api-architecture.md) - Guía completa

---

**Estado:** ✅ ANÁLISIS COMPLETADO
**Siguiente acción:** Crear especificación para Bug-Fixer
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23

**Bugs encontrados:** 6 rutas críticas + 1 comentario
**Archivos afectados:** 3
**Severidad:** CRÍTICA - Bloquea múltiples funcionalidades
