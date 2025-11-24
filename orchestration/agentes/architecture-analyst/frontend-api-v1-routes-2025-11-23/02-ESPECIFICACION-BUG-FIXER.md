# ESPECIFICACIÓN PARA BUG-FIXER: Eliminar /v1/ de Rutas API

**Fecha:** 2025-11-23
**Agente Solicitante:** Architecture-Analyst
**Agente Ejecutor:** Bug-Fixer
**Bug ID:** BUG-FRONTEND-003
**Severidad:** CRÍTICA
**Prioridad:** P0 (Inmediato)

---

## 🔴 BUG IDENTIFICADO

**Título:** 7 ocurrencias de `/v1/` en rutas que causan errores 404
**Descripción:** Rutas tienen `/v1/` de más, backend no expone `/v1/` en paths

---

## 📋 CONTEXTO COMPLETO

### Problema

Múltiples archivos del frontend llaman rutas con `/v1/` que no existen en el backend:
- `POST /api/v1/progress/submissions/submit` → ❌ 404
- `GET /api/v1/gamification/users/:id/stats` → ❌ 404
- `PATCH /api/v1/gamification/users/:id/stats` → ❌ 404
- `GET /api/v1/gamification/users/:id/rank-progress` → ❌ 404

Backend real expone (sin `/v1/`):
- `POST /api/progress/submissions/submit` → ✅ Existe
- `GET /api/gamification/users/:id/stats` → ✅ Existe
- `PATCH /api/gamification/users/:id/stats` → ✅ Existe
- `GET /api/gamification/users/:id/rank-progress` → ✅ Existe

### Evidencia del Error

**Error principal (Ejercicio 3):**
```
POST http://localhost:3006/api/v1/progress/submissions/submit 404 (Not Found)
❌ [CompletarEspacios] Submission error: Cannot POST /api/v1/progress/submissions/submit
```

**Impacto:** Usuario no puede enviar respuestas del ejercicio 3.

### Confirmación Backend

```bash
# Backend config:
app.setGlobalPrefix('api');  // Solo /api, NO /api/v1

# Controllers:
@Controller('progress')  // NO tiene /v1/
@Controller('gamification')  // NO tiene /v1/

# Rutas finales: /api/progress/..., /api/gamification/...
```

---

## 🎯 ESPECIFICACIÓN DEL FIX

### Archivos a Modificar (3 archivos, 7 líneas)

---

## ARCHIVO 1: progressAPI.ts

**Ubicación:** `apps/frontend/src/features/progress/api/progressAPI.ts`
**Cambios:** 2 líneas (1 comentario + 1 ruta)

### Cambio 1.1: Línea 378 (Comentario)

**Estado actual:**
```typescript
// Backend endpoint: POST /api/v1/progress/submissions/submit
```

**Fix requerido:**
```typescript
// Backend endpoint: POST /api/progress/submissions/submit
```

**Diff:**
```diff
- // Backend endpoint: POST /api/v1/progress/submissions/submit
+ // Backend endpoint: POST /api/progress/submissions/submit
```

---

### Cambio 1.2: Línea 387 (Ruta Real) ⚠️ **CRÍTICO**

**Estado actual:**
```typescript
const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
  '/v1/progress/submissions/submit',
  backendPayload
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
  '/progress/submissions/submit',
  backendPayload
);
```

**Diff:**
```diff
const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
- '/v1/progress/submissions/submit',
+ '/progress/submissions/submit',
  backendPayload
);
```

---

## ARCHIVO 2: economyStore.ts

**Ubicación:** `apps/frontend/src/features/gamification/economy/store/economyStore.ts`
**Cambios:** 3 líneas

### Cambio 2.1: Línea 120 ⚠️ **CRÍTICO**

**Contexto:** Función `updateUserStats`

**Estado actual:**
```typescript
const { data } = await apiClient.patch(
  `/v1/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.patch(
  `/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

**Diff:**
```diff
const { data } = await apiClient.patch(
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

---

### Cambio 2.2: Línea 178 ⚠️ **CRÍTICO**

**Contexto:** Función `spendMLCoins`

**Estado actual:**
```typescript
const { data } = await apiClient.patch(
  `/v1/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.patch(
  `/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

**Diff:**
```diff
const { data } = await apiClient.patch(
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
  { ml_coins: updatedCoins }
);
```

---

### Cambio 2.3: Línea 556 ⚠️ **CRÍTICO**

**Contexto:** Función `fetchUserStats`

**Estado actual:**
```typescript
const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
```

**Diff:**
```diff
- const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);
+ const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
```

---

## ARCHIVO 3: ranksStore.ts

**Ubicación:** `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`
**Cambios:** 2 líneas

### Cambio 3.1: Línea 155 ⚠️ **CRÍTICO**

**Contexto:** Función `fetchUserProgress`

**Estado actual:**
```typescript
const { data } = await apiClient.get(
  `/v1/gamification/users/${userId}/stats`,
);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(
  `/gamification/users/${userId}/stats`,
);
```

**Diff:**
```diff
const { data } = await apiClient.get(
- `/v1/gamification/users/${userId}/stats`,
+ `/gamification/users/${userId}/stats`,
);
```

---

### Cambio 3.2: Línea 601 ⚠️ **CRÍTICO**

**Contexto:** Función `calculateRankProgress`

**Estado actual:**
```typescript
const { data } = await apiClient.get(`/v1/gamification/users/${userId}/rank-progress`);
```

**Fix requerido:**
```typescript
const { data } = await apiClient.get(`/gamification/users/${userId}/rank-progress`);
```

**Diff:**
```diff
- const { data } = await apiClient.get(`/v1/gamification/users/${userId}/rank-progress`);
+ const { data } = await apiClient.get(`/gamification/users/${userId}/rank-progress`);
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### Pre-Fix
- [ ] Confirmar que 7 líneas tienen `/v1/` en las rutas
- [ ] Verificar que error 404 aparece en ejercicio 3

### Durante Fix
- [ ] Usar Edit tool (archivos existentes, NO Write)
- [ ] Cambiar EXACTAMENTE las 7 líneas (MINIMAL CHANGE)
- [ ] No modificar nada más

### Post-Fix - Verificación Global

- [ ] **Búsqueda global de /v1/:**
  ```bash
  grep -rn "/v1/" apps/frontend/src --include="*.ts" --include="*.tsx"
  # Debe devolver 0 matches
  ```

### Post-Fix - Validación Funcional

- [ ] **Reiniciar frontend:**
  ```bash
  npm run dev
  ```

- [ ] **Validar Ejercicio 3 (Submission):**
  - Abrir Módulo 1, Ejercicio 3
  - Completar ejercicio
  - Click en "Verificar"
  - **Resultado esperado:** Sin error 404, submission exitosa

- [ ] **Validar Economy Store:**
  - Intentar comprar algo con ML Coins
  - **Resultado esperado:** Sin error 404, ML Coins se actualizan

- [ ] **Validar Ranks Store:**
  - Navegar a página de progreso/ranks
  - **Resultado esperado:** Sin error 404, rank progress se muestra

- [ ] **Verificar browser console:**
  - **Resultado esperado:** Sin errores 404 en rutas de progress/gamification

---

## 📊 IMPACTO ESPERADO

**Antes del Fix:**
- ❌ Ejercicio 3 no puede enviar respuestas (404)
- ❌ Economy store no puede actualizar ML Coins (404)
- ❌ Ranks store no puede obtener progreso (404)
- ❌ Usuario ve errores y funcionalidad rota

**Después del Fix:**
- ✅ Ejercicio 3 envía respuestas correctamente
- ✅ Economy store actualiza ML Coins sin errores
- ✅ Ranks store obtiene y muestra progreso
- ✅ Sin errores 404 en console
- ✅ Funcionalidad 100% operativa

---

## 🚫 RESTRICCIONES

### LO QUE SÍ DEBES HACER
- ✅ Modificar EXACTAMENTE 7 líneas (3 archivos)
- ✅ Usar Edit tool (son archivos existentes)
- ✅ Quitar `/v1/` de rutas
- ✅ Actualizar comentario (línea 378)
- ✅ Validar que ejercicio 3 funciona post-fix
- ✅ Documentar en TRAZA-BUGS.md

### LO QUE NO DEBES HACER
- ❌ NO refactorizar para usar API modules (eso es P1)
- ❌ NO modificar otras partes de los archivos
- ❌ NO agregar comentarios adicionales
- ❌ NO cambiar la lógica de stores/API
- ❌ NO tocar otros archivos

**PRINCIPIO:** MINIMAL CHANGE - Solo quitar `/v1/` de 7 líneas.

---

## 📚 DOCUMENTACIÓN REQUERIDA

### Traza
Actualizar: `orchestration/trazas/TRAZA-BUGS.md`

**Contenido esperado:**
```markdown
## BUG-FRONTEND-003: Rutas con /v1/ en múltiples módulos

**Fecha detección:** 2025-11-23
**Reportado por:** Usuario (Ejercicio 3) / Architecture-Analyst
**Severidad:** CRÍTICA
**Estado:** Corregido

### Problema
7 ocurrencias de `/v1/` en rutas frontend que no existen en backend.

### Root Cause
Hard-coding sistemático de rutas con `/v1/` incorrecto en:
- progressAPI.ts (submissions)
- economyStore.ts (ML Coins updates)
- ranksStore.ts (rank progress)

### Fix Aplicado
Eliminado `/v1/` de 7 líneas en 3 archivos:
- progressAPI.ts (2 líneas: comentario + ruta)
- economyStore.ts (3 líneas: 3 rutas)
- ranksStore.ts (2 líneas: 2 rutas)

### Validación
✅ Sin errores 404 en console
✅ Ejercicio 3 funciona correctamente
✅ Economy store actualiza ML Coins
✅ Ranks store muestra progreso
✅ Búsqueda global: 0 ocurrencias de /v1/

### Archivos modificados
- apps/frontend/src/features/progress/api/progressAPI.ts
- apps/frontend/src/features/gamification/economy/store/economyStore.ts
- apps/frontend/src/features/gamification/ranks/store/ranksStore.ts

**Tiempo de fix:** ~10 minutos
**Corregido por:** Bug-Fixer
```

---

## 🔗 REFERENCIAS

### Análisis Previo
- `orchestration/agentes/architecture-analyst/frontend-api-v1-routes-2025-11-23/01-ANALISIS-RUTAS-V1-COMPLETO.md`

### Archivos a Corregir
- 🔧 `apps/frontend/src/features/progress/api/progressAPI.ts` (líneas 378, 387)
- 🔧 `apps/frontend/src/features/gamification/economy/store/economyStore.ts` (líneas 120, 178, 556)
- 🔧 `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts` (líneas 155, 601)

### Backend Controllers (Referencias)
- ✅ `apps/backend/src/modules/progress/controllers/exercise-submission.controller.ts`
- ✅ `apps/backend/src/modules/gamification/controllers/user-stats.controller.ts`
- ✅ `apps/backend/src/main.ts` (global prefix `/api`)

### Comandos Útiles

**Verificar archivos antes del fix:**
```bash
grep -n "/v1/" apps/frontend/src/features/progress/api/progressAPI.ts
grep -n "/v1/" apps/frontend/src/features/gamification/economy/store/economyStore.ts
grep -n "/v1/" apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
# Debe mostrar 7 líneas total
```

**Verificar después del fix (debe ser 0):**
```bash
grep -r "/v1/" apps/frontend/src --include="*.ts" --include="*.tsx"
# Debe devolver nada (0 matches)
```

**Validar ejercicio 3:**
```
1. Abrir http://localhost:3005
2. Login como estudiante
3. Navegar a Módulo 1 > Ejercicio 3
4. Completar ejercicio
5. Click "Verificar"
6. Verificar en DevTools Console: NO debe haber error 404
7. Verificar que muestra feedback del submission
```

---

## ⏱️ ESTIMACIÓN

**Esfuerzo:** 10-15 minutos
**Complejidad:** Baja (cambio repetitivo)
**Riesgo:** Muy bajo (solo quitar `/v1/` de strings)

---

## ✅ CHECKLIST DE EJECUCIÓN

### Pre-ejecución
- [ ] Leer especificación completa
- [ ] Leer análisis en 01-ANALISIS-RUTAS-V1-COMPLETO.md
- [ ] Confirmar entendimiento del problema
- [ ] Confirmar los 3 archivos a modificar

### Ejecución
- [ ] Modificar `progressAPI.ts` línea 378 (comentario)
- [ ] Modificar `progressAPI.ts` línea 387 (ruta)
- [ ] Modificar `economyStore.ts` línea 120 (ruta)
- [ ] Modificar `economyStore.ts` línea 178 (ruta)
- [ ] Modificar `economyStore.ts` línea 556 (ruta)
- [ ] Modificar `ranksStore.ts` línea 155 (ruta)
- [ ] Modificar `ranksStore.ts` línea 601 (ruta)

### Validación
- [ ] Verificar 0 matches de `/v1/` en búsqueda global
- [ ] Reiniciar frontend (`npm run dev`)
- [ ] Validar ejercicio 3 funciona
- [ ] Validar economy store funciona
- [ ] Validar ranks store funciona
- [ ] Verificar console sin errores 404

### Documentación
- [ ] Actualizar TRAZA-BUGS.md con BUG-FRONTEND-003
- [ ] Crear reporte de corrección

---

**Estado:** ✅ Especificación completa
**Listo para ejecución:** SÍ
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
**Esperando:** Bug-Fixer para ejecutar fix inmediato

**Total de cambios:** 3 archivos, 7 líneas (6 rutas críticas + 1 comentario)
