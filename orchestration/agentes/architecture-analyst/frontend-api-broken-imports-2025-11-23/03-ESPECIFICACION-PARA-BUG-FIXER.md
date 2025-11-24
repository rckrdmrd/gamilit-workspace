# ESPECIFICACIÓN PARA BUG-FIXER: Corregir Imports Rotos en API Client

**Fecha:** 2025-11-23
**Agente Solicitante:** Architecture-Analyst
**Agente Ejecutor:** Bug-Fixer
**Severidad:** CRÍTICA
**Prioridad:** P0 (Inmediato)

---

## 🔴 BUG IDENTIFICADO

**ID:** BUG-FRONTEND-001
**Título:** Imports rotos de API Client impiden iniciar frontend
**Descripción:** Cinco archivos en `src/lib/api/` importan desde `'./client'` que no existe

---

## 📋 CONTEXTO COMPLETO

### Problema
El archivo `apps/frontend/src/lib/api/client.ts` fue eliminado durante una refactorización, pero las referencias a él no fueron actualizadas. Esto causa error 500 en el servidor Vite y hace imposible usar el frontend.

### Evidencia
**Error en terminal:**
```
[vite] Internal server error: Failed to resolve import "./client"
from "src/lib/api/gamification.api.ts". Does the file exist?
```

**Git status:**
```
D apps/frontend/src/lib/api/client.ts
```

### Archivo Correcto
El cliente API correcto ya existe en:
```
apps/frontend/src/services/api/apiClient.ts
```

Este archivo:
- ✅ Exporta `apiClient` como default
- ✅ Tiene interceptors configurados
- ✅ Maneja auth, refresh token, errores
- ✅ Está completo y funcional

---

## 🎯 ESPECIFICACIÓN DEL FIX

### Archivos a Modificar (5 archivos)

#### 1. `apps/frontend/src/lib/api/auth.api.ts`
**Línea:** 1

**Estado actual:**
```typescript
import apiClient from './client';
```

**Fix requerido:**
```typescript
import apiClient from '@/services/api/apiClient';
```

---

#### 2. `apps/frontend/src/lib/api/gamification.api.ts`
**Línea:** 1

**Estado actual:**
```typescript
import apiClient from './client';
```

**Fix requerido:**
```typescript
import apiClient from '@/services/api/apiClient';
```

---

#### 3. `apps/frontend/src/lib/api/progress.api.ts`
**Línea:** 16

**Estado actual:**
```typescript
import apiClient from './client';
```

**Fix requerido:**
```typescript
import apiClient from '@/services/api/apiClient';
```

---

#### 4. `apps/frontend/src/lib/api/educational.api.ts`
**Línea:** 12

**Estado actual:**
```typescript
import apiClient from './client';
```

**Fix requerido:**
```typescript
import apiClient from '@/services/api/apiClient';
```

---

#### 5. `apps/frontend/src/lib/api/index.ts`
**Línea:** 1

**Estado actual:**
```typescript
export { default as apiClient } from './client';
```

**Fix requerido:**
```typescript
export { default as apiClient } from '@/services/api/apiClient';
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### Pre-Fix
- [ ] Confirmar que los 5 archivos tienen import roto
- [ ] Confirmar que `npm run dev` falla con error de import

### Durante Fix
- [ ] Usar Edit tool para cada archivo (NO Write, son archivos existentes)
- [ ] Cambiar EXACTAMENTE el import, sin tocar nada más (MINIMAL CHANGE)
- [ ] Verificar sintaxis correcta en cada cambio

### Post-Fix
- [ ] Ejecutar búsqueda global: `grep -r "from './client'" apps/frontend/src/lib/api/`
  - Resultado esperado: **0 matches**
- [ ] Iniciar servidor: `npm run dev`
  - Resultado esperado: **Servidor inicia sin errores**
- [ ] Verificar browser console
  - Resultado esperado: **Sin errores 500**
- [ ] Cargar página /progress o /achievements
  - Resultado esperado: **Página carga correctamente**

---

## 📊 IMPACTO ESPERADO

**Antes del Fix:**
- ❌ Frontend caído (error 500)
- ❌ Imposible desarrollar
- ❌ Imposible usar la aplicación

**Después del Fix:**
- ✅ Frontend funcional
- ✅ Todas las páginas cargan
- ✅ APIs funcionan correctamente

---

## 🚫 RESTRICCIONES

### LO QUE SÍ DEBES HACER
- ✅ Modificar EXACTAMENTE los 5 imports especificados
- ✅ Usar Edit tool (son archivos existentes)
- ✅ Validar que servidor funciona post-fix
- ✅ Documentar el fix en traza

### LO QUE NO DEBES HACER
- ❌ NO refactorizar código adicional
- ❌ NO "mejorar" otros imports de paso
- ❌ NO agregar comentarios adicionales
- ❌ NO modificar la lógica de los archivos
- ❌ NO tocar otros archivos fuera de los 5 especificados

**PRINCIPIO:** MINIMAL CHANGE - Solo el cambio necesario para corregir el bug.

---

## 📚 DOCUMENTACIÓN REQUERIDA

### Traza
Actualizar: `orchestration/trazas/TRAZA-BUGS.md`

**Contenido esperado:**
```markdown
## BUG-FRONTEND-001: Imports rotos en API Client

**Fecha detección:** 2025-11-23
**Reportado por:** Usuario / Architecture-Analyst
**Severidad:** CRÍTICA
**Estado:** Corregido

### Problema
Cinco archivos importaban `'./client'` que no existe.

### Root Cause
Refactorización incompleta: archivo movido pero referencias no actualizadas.

### Fix Aplicado
Actualizado import en 5 archivos:
- auth.api.ts
- gamification.api.ts
- progress.api.ts
- educational.api.ts
- index.ts

Cambio: `'./client'` → `'@/services/api/apiClient'`

### Validación
✅ Servidor inicia correctamente
✅ No errores en console
✅ Páginas cargan sin problemas

### Archivos modificados
- apps/frontend/src/lib/api/auth.api.ts
- apps/frontend/src/lib/api/gamification.api.ts
- apps/frontend/src/lib/api/progress.api.ts
- apps/frontend/src/lib/api/educational.api.ts
- apps/frontend/src/lib/api/index.ts

**Tiempo de fix:** ~5 minutos
**Corregido por:** Bug-Fixer
```

---

## 🔗 REFERENCIAS

### Análisis Previo
- `orchestration/agentes/architecture-analyst/frontend-api-broken-imports-2025-11-23/01-ANALISIS-PROBLEMA.md`
- `orchestration/agentes/architecture-analyst/frontend-api-broken-imports-2025-11-23/02-GAP-ANALYSIS.md`

### Archivos Clave
- ✅ **Archivo correcto:** `apps/frontend/src/services/api/apiClient.ts`
- ❌ **Archivo eliminado:** `apps/frontend/src/lib/api/client.ts` (ya no existe)
- 🔧 **Archivos a corregir:** 5 archivos en `apps/frontend/src/lib/api/`

### Comandos Útiles

**Verificar import roto:**
```bash
grep -n "from './client'" apps/frontend/src/lib/api/*.ts
```

**Verificar después del fix (debe ser 0):**
```bash
grep -r "from './client'" apps/frontend/src/lib/api/
```

**Validar servidor:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit
npm run dev
# Debe iniciar sin errores
```

**Verificar páginas:**
```
http://localhost:3005/progress
http://localhost:3005/achievements
# No deben tener errores 500 en console
```

---

## ⏱️ ESTIMACIÓN

**Esfuerzo:** 5-10 minutos
**Complejidad:** Baja (cambio trivial)
**Riesgo:** Muy bajo (fix validado y simple)

---

## ✅ CHECKLIST DE EJECUCIÓN

### Pre-ejecución
- [ ] Leer especificación completa
- [ ] Confirmar entendimiento del problema
- [ ] Identificar los 5 archivos a modificar

### Ejecución
- [ ] Modificar `auth.api.ts` (línea 1)
- [ ] Modificar `gamification.api.ts` (línea 1)
- [ ] Modificar `progress.api.ts` (línea 16)
- [ ] Modificar `educational.api.ts` (línea 12)
- [ ] Modificar `index.ts` (línea 1)

### Validación
- [ ] Verificar 0 matches de import roto
- [ ] Ejecutar `npm run dev` y confirmar éxito
- [ ] Verificar browser console sin errores
- [ ] Cargar al menos 1 página y confirmar funcionamiento

### Documentación
- [ ] Actualizar TRAZA-BUGS.md
- [ ] Actualizar TRAZA-CORRECCIONES.md

---

**Estado:** ✅ Especificación completa
**Listo para ejecución:** SÍ
**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
**Esperando:** Bug-Fixer para ejecutar fix
