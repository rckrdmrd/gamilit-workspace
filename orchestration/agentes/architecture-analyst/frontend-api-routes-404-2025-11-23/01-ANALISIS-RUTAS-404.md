# ANÁLISIS: Errores 404 en Rutas de Gamificación

**Fecha:** 2025-11-23
**Agente:** Architecture-Analyst
**Bug ID:** BUG-FRONTEND-002
**Severidad:** ALTA
**Prioridad:** P0

---

## 🔴 RESUMEN EJECUTIVO

**Problema:** El hook `useUserGamification` está llamando a rutas con `/v1/` que no existen en el backend, causando errores 404.

**Root Cause:** Inconsistencia entre las rutas definidas en `gamification.api.ts` (correctas) y las rutas hard-coded en `useUserGamification.ts` (incorrectas).

**Impacto:**
- ❌ Los usuarios no ven sus stats de gamificación
- ❌ No se cargan achievements
- ❌ Experiencia de usuario degradada

**Solución:** Eliminar `/v1/` de las rutas en `useUserGamification.ts` (2 líneas).

---

## 📋 EVIDENCIA DEL PROBLEMA

### Errores en Browser Console

```
GET http://localhost:3006/api/v1/gamification/users/5536d729-d3cc-4f56-b507-c033b33e6224/stats
404 (Not Found)

GET http://localhost:3006/api/v1/gamification/users/5536d729-d3cc-4f56-b507-c033b33e6224/achievements
404 (Not Found)

[API] Resource not found: /v1/gamification/users/.../stats
[API] Resource not found: /v1/gamification/users/.../achievements

Failed to fetch gamification data: AxiosError
```

### Rutas Llamadas por el Frontend

**useUserGamification.ts (líneas 54-55):**
```typescript
const [statsResponse, achievementsResponse] = await Promise.all([
  apiClient.get(`/v1/gamification/users/${userId}/stats`),        // ❌ con /v1/
  apiClient.get(`/v1/gamification/users/${userId}/achievements`)  // ❌ con /v1/
]);
```

**Rutas completas que intenta llamar:**
- `http://localhost:3006/api/v1/gamification/users/{userId}/stats` ❌
- `http://localhost:3006/api/v1/gamification/users/{userId}/achievements` ❌

---

## 🔍 ANÁLISIS DEL BACKEND

### Configuración del Backend

**main.ts (línea 17):**
```typescript
app.setGlobalPrefix('api');  // Solo /api, NO /api/v1
```

**user-stats.controller.ts (líneas 18, 45):**
```typescript
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))  // 'gamification'
// ...
@Get('users/:userId/stats')
```

**achievements.controller.ts (líneas 19, 158):**
```typescript
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))  // 'gamification'
// ...
@Get('users/:userId/achievements')
```

### Rutas Reales del Backend

**Ruta real user stats:**
```
Global prefix:    /api
Controller:       gamification
Método:           users/:userId/stats
---
Ruta completa:    /api/gamification/users/:userId/stats ✅
```

**Ruta real achievements:**
```
Global prefix:    /api
Controller:       gamification
Método:           users/:userId/achievements
---
Ruta completa:    /api/gamification/users/:userId/achievements ✅
```

### Validación con CURL

```bash
# Ruta con /v1/ (la que usa useUserGamification) ❌
$ curl http://localhost:3006/api/v1/gamification/users/test/stats
{"message":"Cannot GET /api/v1/gamification/users/test/stats","error":"Not Found","statusCode":404}

# Ruta sin /v1/ (la correcta) ✅
$ curl http://localhost:3006/api/gamification/users/test/stats
{"message":"Unauthorized","statusCode":401}  # 401 = ruta existe, pero necesita auth
```

---

## 🎯 ROOT CAUSE ANALYSIS

### Causa Raíz: INCONSISTENCIA EN FRONTEND

El frontend tiene **DOS formas diferentes** de llamar a las rutas de gamificación:

#### ✅ CORRECTO: gamification.api.ts

```typescript
// apps/frontend/src/lib/api/gamification.api.ts:35
getUserStats: async (userId: string): Promise<UserStats> => {
  const { data } = await apiClient.get<UserStats>(`/gamification/users/${userId}/stats`);
  //                                                 ^^^^^^^^^^^^^ sin /v1/
  return data;
},
```

**Ruta completa:** `http://localhost:3006/api/gamification/users/${userId}/stats` ✅

#### ❌ INCORRECTO: useUserGamification.ts

```typescript
// apps/frontend/src/shared/hooks/useUserGamification.ts:54-55
const [statsResponse, achievementsResponse] = await Promise.all([
  apiClient.get(`/v1/gamification/users/${userId}/stats`),
  //              ^^^^ tiene /v1/ de más
  apiClient.get(`/v1/gamification/users/${userId}/achievements`)
  //              ^^^^ tiene /v1/ de más
]);
```

**Ruta completa:** `http://localhost:3006/api/v1/gamification/users/${userId}/stats` ❌

### ¿Por Qué Existe Esta Inconsistencia?

**Hipótesis:**
1. `useUserGamification.ts` se escribió antes que `gamification.api.ts`
2. El autor asumió incorrectamente que las rutas tenían `/v1/`
3. Cuando se creó `gamification.api.ts`, se usaron las rutas correctas
4. `useUserGamification.ts` nunca se actualizó para usar `gamification.api.ts`

**Evidencia:**
- `useUserGamification.ts` tiene un TODO (línea 10) que menciona "implementar endpoint"
- Las rutas están hard-coded en lugar de usar `gamification.api.ts`
- No hay importación de `gamification.api` en el archivo

---

## 📊 IMPACTO

### Funcionalidad Afectada
- ❌ **GamifiedHeader**: No muestra stats correctos (level, XP, coins, rank)
- ❌ **Achievements Page**: No carga achievements del usuario
- ❌ **Progress Tracking**: Stats no se actualizan
- ❌ **Leaderboard**: Puede estar afectado si usa el mismo hook

### Páginas Afectadas
- Todas las páginas que usan `useUserGamification` hook
- Cualquier componente que muestre `GamifiedHeader`

### Severidad
**ALTA** - Funcionalidad core de gamificación no funciona correctamente

---

## ✅ SOLUCIÓN PROPUESTA

### Opción A: Fix Rápido (RECOMENDADA)

Eliminar `/v1/` de las rutas en `useUserGamification.ts`.

**Archivo:** `apps/frontend/src/shared/hooks/useUserGamification.ts`
**Líneas:** 54-55

**Cambio:**
```diff
const [statsResponse, achievementsResponse] = await Promise.all([
- apiClient.get(`/v1/gamification/users/${userId}/stats`),
+ apiClient.get(`/gamification/users/${userId}/stats`),
- apiClient.get(`/v1/gamification/users/${userId}/achievements`)
+ apiClient.get(`/gamification/users/${userId}/achievements`)
]);
```

**Ventajas:**
- ✅ Fix inmediato (2 líneas)
- ✅ Bajo riesgo
- ✅ Alinea con `gamification.api.ts`

**Desventajas:**
- ⚠️ Rutas aún hard-coded (no usa `gamification.api.ts`)

---

### Opción B: Refactorización Completa (MEJOR, pero más esfuerzo)

Hacer que `useUserGamification.ts` use `gamification.api.ts` en lugar de hard-coding rutas.

**Archivo:** `apps/frontend/src/shared/hooks/useUserGamification.ts`

**Cambio:**
```diff
+import { gamificationApi } from '@/lib/api/gamification.api';

const fetchGamificationData = async () => {
  try {
    setLoading(true);
    setError(null);

-   const [statsResponse, achievementsResponse] = await Promise.all([
-     apiClient.get(`/v1/gamification/users/${userId}/stats`),
-     apiClient.get(`/v1/gamification/users/${userId}/achievements`)
-   ]);
-
-   const stats = statsResponse.data;
-   const achievements = achievementsResponse.data;
+   const [stats, achievements] = await Promise.all([
+     gamificationApi.getUserStats(userId),
+     gamificationApi.getUserAchievements(userId)
+   ]);

    const data: UserGamificationData = {
      userId: stats.user_id,
      level: stats.level,
      totalXP: stats.total_xp,
      mlCoins: stats.ml_coins,
      rank: stats.current_rank,
      achievements: achievements.map((a: any) => a.achievement_id),
    };
```

**Ventajas:**
- ✅ DRY - usa API client centralizado
- ✅ Rutas definidas en un solo lugar
- ✅ Type-safe (TypeScript types de gamification.api.ts)
- ✅ Más fácil de mantener

**Desventajas:**
- ⚠️ Requiere más cambios (~10 líneas)
- ⚠️ Mayor tiempo de implementación

---

## 🎯 RECOMENDACIÓN

**Para P0 (Inmediato):** Implementar **Opción A** (Fix rápido)
- Restaura funcionalidad inmediatamente
- Bajo riesgo de regresión
- 2 líneas de código

**Para P1 (Esta semana):** Implementar **Opción B** (Refactorización)
- Mejora calidad del código
- Previene problemas futuros
- Alinea con arquitectura de API clients

---

## 🔗 ARCHIVOS RELACIONADOS

### Frontend
- ❌ `apps/frontend/src/shared/hooks/useUserGamification.ts` (rutas incorrectas)
- ✅ `apps/frontend/src/lib/api/gamification.api.ts` (rutas correctas)
- ✅ `apps/frontend/src/services/api/apiClient.ts` (baseURL correcto)

### Backend
- ✅ `apps/backend/src/modules/gamification/controllers/user-stats.controller.ts`
- ✅ `apps/backend/src/modules/gamification/controllers/achievements.controller.ts`
- ✅ `apps/backend/src/main.ts` (global prefix `/api`)
- ✅ `apps/backend/src/shared/constants/routes.constants.ts` (definiciones de rutas)

---

## 📚 LECCIONES APRENDIDAS

### ❌ Anti-patrones Identificados

1. **Hard-coding de rutas API** en hooks
   - Las rutas deben estar centralizadas en `*.api.ts`
   - Hooks deben usar API clients, no hacer llamadas directas

2. **Inconsistencia entre módulos API**
   - `gamification.api.ts` usa rutas correctas
   - `useUserGamification.ts` usa rutas incorrectas
   - No hay source of truth único

3. **Falta de validación de contratos API**
   - Frontend y backend no comparten definiciones de rutas
   - No hay tests que validen alineación

### ✅ Mejoras Necesarias

1. **Centralizar rutas API en frontend**
   - Crear `shared/constants/api-endpoints.ts`
   - Importar en todos los `*.api.ts`
   - Nunca hard-codear rutas

2. **Hooks deben usar API clients**
   - No hacer llamadas directas con `apiClient.get()`
   - Usar métodos de `*.api.ts`

3. **Validación automática de contratos**
   - Crear script que compare rutas frontend vs backend
   - Ejecutar en CI/CD

---

## 🚀 PRÓXIMOS PASOS

### P0 - Inmediato (Hoy)
- [ ] **Bug-Fixer:** Aplicar Opción A (quitar /v1/ en useUserGamification.ts)
- [ ] **Bug-Fixer:** Validar que stats y achievements cargan correctamente

### P1 - Esta semana
- [ ] **Frontend-Developer:** Aplicar Opción B (usar gamification.api en hook)
- [ ] **Architecture-Analyst:** Documentar arquitectura de API clients
- [ ] **Architecture-Analyst:** Crear ADR sobre centralización de rutas

### P2 - Próximas 2 semanas
- [ ] **Frontend-Developer:** Crear `api-endpoints.ts` centralizado
- [ ] **DevOps-Agent:** Implementar validación de contratos API en CI/CD

---

**Estado:** ✅ ANÁLISIS COMPLETADO
**Siguiente acción:** Delegar corrección a Bug-Fixer (Opción A)
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
