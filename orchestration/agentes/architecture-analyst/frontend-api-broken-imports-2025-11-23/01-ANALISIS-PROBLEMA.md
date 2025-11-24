# ANÁLISIS DE PROBLEMA: Imports Rotos en Frontend API Client

**Fecha:** 2025-11-23
**Agente:** Architecture-Analyst
**Severidad:** CRÍTICA
**Estado:** Análisis completado - Pendiente de corrección

---

## 🔴 RESUMEN EJECUTIVO

**Problema:** El servidor de desarrollo frontend está fallando debido a imports rotos de un archivo eliminado (`src/lib/api/client.ts`).

**Impacto:**
- ❌ Frontend completamente caído (error 500 en servidor Vite)
- ❌ Imposible cargar páginas que usan APIs (MyProgressPage, AchievementsPage, Auth, etc.)
- ❌ Bloquea desarrollo y testing

**Causa Raíz:** Refactorización incompleta - se movió `apiClient` de una ubicación a otra pero no se actualizaron las referencias.

---

## 📋 ANÁLISIS DETALLADO

### 1. ARCHIVO ELIMINADO

```
❌ apps/frontend/src/lib/api/client.ts
```

**Evidencia:** Visible en `git status` con marcador "D" (deleted)

**Rol:** Exportaba la instancia de Axios configurada (`apiClient`) usada por todos los módulos API.

---

### 2. ARCHIVO CORRECTO (REEMPLAZO)

```
✅ apps/frontend/src/services/api/apiClient.ts
```

**Contenido:**
- Instancia de Axios con baseURL, timeout, headers
- Interceptors de request (auth token, tenant-id)
- Interceptors de response (manejo de 401, refresh token, errores)
- Funciones utilitarias (setAuthToken, clearAuthTokens, isAuthenticated)
- Export default: `apiClient`

**Calidad:** ✅ Completo, bien documentado, sigue mejores prácticas

---

### 3. ARCHIVOS CON IMPORTS ROTOS (5 archivos)

#### 3.1 `apps/frontend/src/lib/api/auth.api.ts`
**Línea 1:**
```typescript
import apiClient from './client';  // ❌ ROTO
```

**Debe ser:**
```typescript
import apiClient from '@/services/api/apiClient';  // ✅ CORRECTO
```

---

#### 3.2 `apps/frontend/src/lib/api/gamification.api.ts`
**Línea 1:**
```typescript
import apiClient from './client';  // ❌ ROTO
```

**Debe ser:**
```typescript
import apiClient from '@/services/api/apiClient';  // ✅ CORRECTO
```

---

#### 3.3 `apps/frontend/src/lib/api/progress.api.ts`
**Línea 16:**
```typescript
import apiClient from './client';  // ❌ ROTO
```

**Debe ser:**
```typescript
import apiClient from '@/services/api/apiClient';  // ✅ CORRECTO
```

---

#### 3.4 `apps/frontend/src/lib/api/educational.api.ts`
**Línea 12:**
```typescript
import apiClient from './client';  // ❌ ROTO
```

**Debe ser:**
```typescript
import apiClient from '@/services/api/apiClient';  // ✅ CORRECTO
```

---

#### 3.5 `apps/frontend/src/lib/api/index.ts`
**Línea 1:**
```typescript
export { default as apiClient } from './client';  // ❌ ROTO
```

**Debe ser:**
```typescript
export { default as apiClient } from '@/services/api/apiClient';  // ✅ CORRECTO
```

---

## 🔍 ERRORES OBSERVADOS

### Error en Terminal (Vite Server)
```
8:05:58 PM [vite] Internal server error: Failed to resolve import "./client"
from "src/lib/api/gamification.api.ts". Does the file exist?
Plugin: vite:import-analysis
File: /home/isem/.../apps/frontend/src/lib/api/gamification.api.ts:1:22
```

### Errores en Consola del Browser
```
GET http://localhost:3005/src/lib/api/auth.api.ts
net::ERR_ABORTED 500 (Internal Server Error)

GET http://localhost:3005/src/lib/api/progress.api.ts
net::ERR_ABORTED 500 (Internal Server Error)

GET http://localhost:3005/src/lib/api/educational.api.ts
net::ERR_ABORTED 500 (Internal Server Error)

GET http://localhost:3005/src/lib/api/gamification.api.ts
net::ERR_ABORTED 500 (Internal Server Error)
```

---

## 🎯 CAUSA RAÍZ

**Tipo:** Refactorización incompleta

**Contexto:**
1. Se realizó migración de estructura de API client
2. Se movió `src/lib/api/client.ts` → `src/services/api/apiClient.ts`
3. Se eliminó archivo antiguo
4. **NO se actualizaron** las referencias en archivos dependientes

**Lecciones aprendidas:**
- ❌ Faltó paso de actualización de imports en refactorización
- ❌ No se ejecutó verificación post-refactorización
- ❌ Cambio no validado antes de commit

---

## 📊 IMPACTO

### Frontend Afectado
- ✅ **auth.api.ts** - Sistema de autenticación (login, register, logout, profile)
- ✅ **gamification.api.ts** - Gamificación (stats, achievements, leaderboard, ML coins)
- ✅ **progress.api.ts** - Progreso (módulos, sesiones, intentos, actividades)
- ✅ **educational.api.ts** - Contenido educativo (módulos, ejercicios, búsqueda)
- ✅ **index.ts** - Re-exportación de todos los APIs

### Páginas Bloqueadas
- MyProgressPage.tsx
- AchievementsPage.tsx
- Cualquier página que use autenticación
- Cualquier página que use APIs de gamificación/progreso/contenido

### Severidad
**CRÍTICA** - Frontend completamente inoperativo

---

## ✅ SOLUCIÓN PROPUESTA

### Estrategia
Actualizar los 5 archivos con imports rotos para usar la ruta correcta.

### Cambios Específicos

**Patrón de cambio (archivos .api.ts):**
```diff
- import apiClient from './client';
+ import apiClient from '@/services/api/apiClient';
```

**Patrón de cambio (index.ts):**
```diff
- export { default as apiClient } from './client';
+ export { default as apiClient } from '@/services/api/apiClient';
```

### Archivos a Modificar
1. `apps/frontend/src/lib/api/auth.api.ts` (línea 1)
2. `apps/frontend/src/lib/api/gamification.api.ts` (línea 1)
3. `apps/frontend/src/lib/api/progress.api.ts` (línea 16)
4. `apps/frontend/src/lib/api/educational.api.ts` (línea 12)
5. `apps/frontend/src/lib/api/index.ts` (línea 1)

### Validación Post-Corrección
```bash
# 1. Verificar que no quedan imports rotos
grep -r "from './client'" apps/frontend/src/lib/api/

# 2. Verificar que servidor inicia correctamente
npm run dev

# 3. Verificar que no hay errores 500 en console
# Abrir browser y verificar console limpia

# 4. Verificar que páginas cargan
# - /progress
# - /achievements
# - /login
```

---

## 🚀 PRÓXIMOS PASOS

### Inmediato (P0)
- [ ] **DELEGAR a Frontend-Developer:** Corregir los 5 imports rotos
- [ ] **DELEGAR a Frontend-Developer:** Validar que servidor inicia sin errores
- [ ] **DELEGAR a Frontend-Developer:** Verificar páginas funcionales

### Corto Plazo (P1)
- [ ] **Architecture-Analyst:** Documentar ADR sobre estructura de API clients
- [ ] **Architecture-Analyst:** Actualizar directivas de refactorización
- [ ] **DevOps-Agent:** Agregar pre-commit hook para detectar imports rotos

### Mediano Plazo (P2)
- [ ] **Architecture-Analyst:** Crear checklist de refactorización
- [ ] **Frontend-Developer:** Implementar tests que verifiquen imports válidos

---

## 📚 REFERENCIAS

### Archivos Relacionados
- ✅ `apps/frontend/src/services/api/apiClient.ts` - Cliente correcto
- ❌ `apps/frontend/src/lib/api/client.ts` - Archivo eliminado (ya no existe)
- 📄 `apps/frontend/src/lib/api/*.api.ts` - Archivos con imports rotos

### Git Status
```
D apps/frontend/src/features/auth/api/apiClient.ts
D apps/frontend/src/lib/api/client.ts
D apps/frontend/src/shared/utils/api.util.ts
M apps/frontend/src/services/api/apiClient.ts
```

### Directivas Aplicables
- `orchestration/directivas/DIRECTIVA-CALIDAD-CODIGO.md`
- `orchestration/directivas/ESTANDARES-NOMENCLATURA.md`

---

## 🏷️ TAGS

`#bug` `#critical` `#frontend` `#refactoring` `#imports` `#api-client` `#vite` `#axios`

---

**Estado:** ✅ Análisis completo
**Siguiente acción:** Delegar corrección a Frontend-Developer
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
