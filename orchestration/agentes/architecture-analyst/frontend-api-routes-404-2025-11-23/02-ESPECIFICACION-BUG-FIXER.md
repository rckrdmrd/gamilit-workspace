# ESPECIFICACIÓN PARA BUG-FIXER: Corregir Rutas con /v1/ Incorrectas

**Fecha:** 2025-11-23
**Agente Solicitante:** Architecture-Analyst
**Agente Ejecutor:** Bug-Fixer
**Bug ID:** BUG-FRONTEND-002
**Severidad:** ALTA
**Prioridad:** P0 (Inmediato)

---

## 🔴 BUG IDENTIFICADO

**Título:** Hook useUserGamification llama rutas con `/v1/` que no existen
**Descripción:** Las rutas tienen `/v1/` de más, causando errores 404

---

## 📋 CONTEXTO COMPLETO

### Problema
El hook `useUserGamification.ts` está llamando a:
- `/v1/gamification/users/${userId}/stats`
- `/v1/gamification/users/${userId}/achievements`

Pero el backend expone:
- `/gamification/users/${userId}/stats` (sin `/v1/`)
- `/gamification/users/${userId}/achievements` (sin `/v1/`)

### Evidencia del Error

**Browser console:**
```
GET http://localhost:3006/api/v1/gamification/users/.../stats 404 (Not Found)
GET http://localhost:3006/api/v1/gamification/users/.../achievements 404 (Not Found)
```

**Backend config:**
- Global prefix: `/api` (sin /v1/)
- Controllers exponen: `/gamification/...`
- Rutas completas: `/api/gamification/...`

### Confirmación

```bash
# Ruta correcta (sin /v1/) funciona:
$ curl http://localhost:3006/api/gamification/users/test/stats
{"message":"Unauthorized","statusCode":401}  # Ruta existe, solo necesita auth ✅

# Ruta con /v1/ no funciona:
$ curl http://localhost:3006/api/v1/gamification/users/test/stats
{"message":"Cannot GET /api/v1/gamification/users/test/stats","statusCode":404}  # ❌
```

---

## 🎯 ESPECIFICACIÓN DEL FIX

### Archivo a Modificar

**Archivo:** `apps/frontend/src/shared/hooks/useUserGamification.ts`
**Líneas:** 54-55

### Cambios Específicos

#### Línea 54

**Estado actual:**
```typescript
apiClient.get(`/v1/gamification/users/${userId}/stats`),
```

**Fix requerido:**
```typescript
apiClient.get(`/gamification/users/${userId}/stats`),
```

**Cambio:** Eliminar `/v1/` del path

---

#### Línea 55

**Estado actual:**
```typescript
apiClient.get(`/v1/gamification/users/${userId}/achievements`)
```

**Fix requerido:**
```typescript
apiClient.get(`/gamification/users/${userId}/achievements`)
```

**Cambio:** Eliminar `/v1/` del path

---

### Diff Completo

```diff
const [statsResponse, achievementsResponse] = await Promise.all([
- apiClient.get(`/v1/gamification/users/${userId}/stats`),
+ apiClient.get(`/gamification/users/${userId}/stats`),
- apiClient.get(`/v1/gamification/users/${userId}/achievements`)
+ apiClient.get(`/gamification/users/${userId}/achievements`)
]);
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### Pre-Fix
- [ ] Confirmar que líneas 54-55 tienen `/v1/` en las rutas
- [ ] Verificar que errors 404 aparecen en browser console

### Durante Fix
- [ ] Usar Edit tool (archivo existente, NO usar Write)
- [ ] Cambiar SOLO las 2 rutas (MINIMAL CHANGE)
- [ ] No modificar nada más del archivo

### Post-Fix
- [ ] Reiniciar frontend (`npm run dev`)
- [ ] Abrir browser y verificar console
  - Resultado esperado: **Sin errores 404 en rutas de gamification**
- [ ] Verificar que GamifiedHeader muestra datos correctos
  - Level, XP, ML Coins, Rank
- [ ] Verificar que AchievementsPage carga achievements
  - No debe mostrar error "Failed to fetch gamification data"

---

## 📊 IMPACTO ESPERADO

**Antes del Fix:**
- ❌ Errores 404 en console
- ❌ GamifiedHeader muestra datos fallback (level 1, 0 XP, etc.)
- ❌ "Failed to fetch gamification data" en console

**Después del Fix:**
- ✅ Sin errores 404
- ✅ GamifiedHeader muestra datos reales del usuario
- ✅ Stats y achievements cargan correctamente

---

## 🚫 RESTRICCIONES

### LO QUE SÍ DEBES HACER
- ✅ Modificar EXACTAMENTE 2 líneas (54 y 55)
- ✅ Usar Edit tool (es archivo existente)
- ✅ Quitar `/v1/` de ambas rutas
- ✅ Validar que datos cargan correctamente post-fix
- ✅ Documentar en TRAZA-BUGS.md

### LO QUE NO DEBES HACER
- ❌ NO refactorizar para usar gamificationApi (eso es P1, no P0)
- ❌ NO modificar otras partes del archivo
- ❌ NO agregar comentarios adicionales
- ❌ NO cambiar la lógica del hook
- ❌ NO tocar otros archivos

**PRINCIPIO:** MINIMAL CHANGE - Solo quitar `/v1/` de 2 rutas.

---

## 📚 DOCUMENTACIÓN REQUERIDA

### Traza
Actualizar: `orchestration/trazas/TRAZA-BUGS.md`

**Contenido esperado:**
```markdown
## BUG-FRONTEND-002: Rutas con /v1/ incorrectas en useUserGamification

**Fecha detección:** 2025-11-23
**Reportado por:** Usuario / Architecture-Analyst
**Severidad:** ALTA
**Estado:** Corregido

### Problema
Hook useUserGamification llamaba rutas con `/v1/` que no existen en backend.

### Root Cause
Hard-coding de rutas con `/v1/` incorrecto. Backend expone `/api/gamification/...` (sin /v1/).

### Fix Aplicado
Eliminado `/v1/` de 2 líneas en useUserGamification.ts:
- Línea 54: `/v1/gamification/...` → `/gamification/...`
- Línea 55: `/v1/gamification/...` → `/gamification/...`

### Validación
✅ Sin errores 404 en console
✅ GamifiedHeader muestra datos correctos
✅ Achievements cargan correctamente

### Archivos modificados
- apps/frontend/src/shared/hooks/useUserGamification.ts

**Tiempo de fix:** ~2 minutos
**Corregido por:** Bug-Fixer
```

---

## 🔗 REFERENCIAS

### Análisis Previo
- `orchestration/agentes/architecture-analyst/frontend-api-routes-404-2025-11-23/01-ANALISIS-RUTAS-404.md`

### Archivos Clave
- 🔧 **Archivo a corregir:** `apps/frontend/src/shared/hooks/useUserGamification.ts` (líneas 54-55)
- ✅ **Rutas correctas (referencia):** `apps/frontend/src/lib/api/gamification.api.ts`
- ✅ **Backend controllers:** `apps/backend/src/modules/gamification/controllers/`

### Comandos Útiles

**Verificar archivo antes del fix:**
```bash
grep -n "/v1/gamification" apps/frontend/src/shared/hooks/useUserGamification.ts
# Debe mostrar 2 líneas con /v1/
```

**Verificar después del fix (debe ser 0):**
```bash
grep -n "/v1/gamification" apps/frontend/src/shared/hooks/useUserGamification.ts
# No debe mostrar nada
```

**Validar backend está corriendo:**
```bash
curl http://localhost:3006/api/gamification/users/test/stats
# Debe devolver 401 (Unauthorized), no 404
```

**Validar frontend después del fix:**
```
1. Abrir http://localhost:3005
2. Login como usuario
3. Abrir DevTools Console
4. Verificar NO hay errores 404 en rutas de gamification
5. Verificar GamifiedHeader muestra level, XP, coins, rank correctos
```

---

## ⏱️ ESTIMACIÓN

**Esfuerzo:** 2-5 minutos
**Complejidad:** Muy baja (cambio trivial)
**Riesgo:** Muy bajo (solo quitar /v1/ de 2 rutas)

---

## ✅ CHECKLIST DE EJECUCIÓN

### Pre-ejecución
- [ ] Leer especificación completa
- [ ] Leer análisis en 01-ANALISIS-RUTAS-404.md
- [ ] Confirmar entendimiento del problema

### Ejecución
- [ ] Abrir `useUserGamification.ts` con Edit tool
- [ ] Modificar línea 54 (quitar `/v1/`)
- [ ] Modificar línea 55 (quitar `/v1/`)

### Validación
- [ ] Verificar 0 matches de `/v1/gamification` en el archivo
- [ ] Reiniciar frontend (`npm run dev`)
- [ ] Abrir browser y verificar console sin errores 404
- [ ] Verificar GamifiedHeader muestra datos correctos

### Documentación
- [ ] Actualizar TRAZA-BUGS.md con BUG-FRONTEND-002
- [ ] Crear reporte de corrección

---

**Estado:** ✅ Especificación completa
**Listo para ejecución:** SÍ
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
**Esperando:** Bug-Fixer para ejecutar fix inmediato
