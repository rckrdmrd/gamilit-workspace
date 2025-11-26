# DELEGACIÓN A FRONTEND-AGENT - FE-100

**Fecha:** 2025-11-24
**Delegado por:** Requirements-Analyst
**Agente responsable:** Frontend-Agent
**Prioridad:** P0 (Bloqueador crítico)
**Estado:** ⏳ Pendiente

---

## 🎯 CONTEXTO

El portal de estudiantes NO está cargando los módulos ni ejercicios educativos debido a un bug en el hook `useModules.ts`.

**Error en consola:**
```
Error fetching module detail: TypeError: allExercises.filter is not a function
    at fetchModuleDetail (useModules.ts:108:12)
```

**Root Cause:**
- Backend envuelve TODAS las respuestas con `TransformResponseInterceptor` en formato `{success, data, ...}`
- `useModules.ts` usa `fetch()` directo sin unwrapper
- Espera array directo `[...]` pero recibe objeto `{success: true, data: [...]}`
- Intenta hacer `.filter()` en objeto → TypeError

**Análisis completo:** Ver `ANALISIS-BUG-MODULES-LOADING.md` en esta carpeta

---

## 📋 TAREA: FE-100 - Migrar useModules.ts a apiClient

### Objetivo
Migrar el hook `useModules.ts` de `fetch()` directo a `apiClient` de axios para corregir el bug de unwrapping.

### Archivo a Modificar
- **Ubicación:** `apps/frontend/src/shared/hooks/useModules.ts`
- **Líneas afectadas:** 66-121 (función `fetchModuleDetail`)

### Prerrequisitos Verificados
✅ `apiClient` ya existe en `apps/frontend/src/services/api/apiClient.ts`
✅ `apiClient` ya tiene interceptor de unwrapping (líneas 88-92)
✅ Endpoints backend funcionan correctamente:
   - `GET /api/v1/educational/modules/:id` → retorna Module
   - `GET /api/v1/educational/exercises` → retorna Exercise[]

---

## 🔧 CAMBIOS REQUERIDOS

### 1. Modificar Imports

**ANTES:**
```typescript
import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api.config';

const API_BASE_URL = API_CONFIG.baseURL;
```

**DESPUÉS:**
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/apiClient';
// Eliminar: import { API_CONFIG } from '@/config/api.config';
// Eliminar: const API_BASE_URL = API_CONFIG.baseURL;
```

### 2. Modificar función fetchModuleDetail()

**CÓDIGO ACTUAL (líneas 66-121) - COMPLETO:**
```typescript
const fetchModuleDetail = async () => {
  setLoading(true);
  setError(null);

  try {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Fetch module details
    const moduleResponse = await fetch(
      `${API_BASE_URL}/educational/modules/${moduleId}`,
      { headers }
    );

    if (!moduleResponse.ok) {
      throw new Error(`Failed to fetch module: ${moduleResponse.statusText}`);
    }

    const moduleData = await moduleResponse.json();
    setModule(moduleData);

    // Fetch all exercises (with completed field)
    const exercisesResponse = await fetch(
      `${API_BASE_URL}/educational/exercises`,
      { headers }
    );

    if (!exercisesResponse.ok) {
      throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText}`);
    }

    const allExercises = await exercisesResponse.json();

    // Filter exercises for this module and sort by order_index
    const moduleExercises = allExercises
      .filter((ex: Exercise) => ex.module_id === moduleId)
      .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index);

    setExercises(moduleExercises);
  } catch (err) {
    console.error('Error fetching module detail:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

**CÓDIGO NUEVO (REEMPLAZAR COMPLETO):**
```typescript
const fetchModuleDetail = async () => {
  setLoading(true);
  setError(null);

  try {
    // Fetch module details using apiClient
    const moduleResponse = await apiClient.get(
      `/educational/modules/${moduleId}`
    );

    // apiClient unwraps the response automatically
    // Backend sends: { success: true, data: {...}, ... }
    // apiClient extracts: {...}
    setModule(moduleResponse.data);

    // Fetch all exercises (with completed field) using apiClient
    const exercisesResponse = await apiClient.get('/educational/exercises');

    // apiClient unwraps the response automatically
    // Backend sends: { success: true, data: [...], ... }
    // apiClient extracts: [...]
    const allExercises = exercisesResponse.data;

    // Filter exercises for this module and sort by order_index
    const moduleExercises = allExercises
      .filter((ex: Exercise) => ex.module_id === moduleId)
      .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index);

    setExercises(moduleExercises);
  } catch (err) {
    console.error('Error fetching module detail:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Cambios Específicos Realizados:

1. ✅ **Eliminado:** Construcción manual de token y headers (líneas 71-79)
   - `apiClient` ya maneja autenticación automáticamente

2. ✅ **Eliminado:** Validación manual `.ok` (líneas 87-89, 100-102)
   - `apiClient` lanza error automáticamente en status 4xx/5xx

3. ✅ **Reemplazado:** `fetch()` por `apiClient.get()`
   - Módulo: `await apiClient.get(/educational/modules/${moduleId})`
   - Ejercicios: `await apiClient.get('/educational/exercises')`

4. ✅ **Modificado:** Extracción de datos
   - De: `await response.json()`
   - A: `response.data` (ya unwrapped por interceptor)

5. ✅ **Mantenido:** Lógica de filtrado y sorting (sin cambios)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Paso 1: Modificar Archivo
- [ ] Abrir `apps/frontend/src/shared/hooks/useModules.ts`
- [ ] Modificar imports (líneas 1-10)
- [ ] Reemplazar función `fetchModuleDetail()` completa (líneas 66-121)
- [ ] Guardar archivo

### Paso 2: Validación de TypeScript
- [ ] Ejecutar: `npm run type-check` (desde apps/frontend/)
- [ ] Verificar: 0 errores de tipo

### Paso 3: Testing Manual
- [ ] Ejecutar: `npm run dev` (desde apps/frontend/)
- [ ] Abrir navegador: http://localhost:5173
- [ ] Login como estudiante (student@gamilit.com)
- [ ] Navegar a portal de estudiantes
- [ ] Verificar consola: NO debe aparecer error `filter is not a function`
- [ ] Verificar UI: Módulos y ejercicios se cargan correctamente

### Paso 4: Testing de Regresión
- [ ] Dashboard sigue funcionando (RankProgressWidget)
- [ ] Autenticación sigue funcionando
- [ ] Navegación entre páginas funciona

### Paso 5: Build de Producción
- [ ] Ejecutar: `npm run build`
- [ ] Verificar: Build exitoso sin warnings

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Funcionales
- [ ] Portal Student carga módulos educativos sin errores
- [ ] Lista de ejercicios se muestra correctamente
- [ ] Ejercicios se filtran por módulo correctamente
- [ ] Ejercicios se ordenan por `order_index`
- [ ] Campo `completed` se muestra en cada ejercicio

### Técnicos
- [ ] TypeScript compila sin errores
- [ ] Build de producción exitoso
- [ ] NO hay errores en consola del navegador
- [ ] NO hay warnings de React en consola

### No Regresión
- [ ] Widgets de dashboard funcionan (RankProgressWidget)
- [ ] Autenticación funciona correctamente
- [ ] Navegación entre páginas funciona

---

## ⚠️ IMPORTANTE

### NO MODIFICAR:
- ❌ `apps/backend/` (interceptor ya está correcto)
- ❌ `apps/frontend/src/services/api/apiClient.ts` (unwrapper ya existe)
- ❌ Interfaces `Module` y `Exercise` (ya están correctas)
- ❌ Componentes que consumen el hook (solo implementación interna del hook)

### SÍ MODIFICAR:
- ✅ SOLO `apps/frontend/src/shared/hooks/useModules.ts`

### Beneficios del Cambio:
- ✅ Corrección del bug crítico
- ✅ Consistencia con resto del proyecto
- ✅ Mejor manejo de errores (401 refresh automático)
- ✅ Código más limpio (menos boilerplate)

---

## 📚 REFERENCIAS

### Documentos
- Análisis completo: `./ANALISIS-BUG-MODULES-LOADING.md`
- Prompt Frontend-Agent: `orchestration/prompts/PROMPT-FRONTEND-AGENT.md`

### Archivos Clave
- Hook a modificar: `apps/frontend/src/shared/hooks/useModules.ts`
- apiClient (referencia): `apps/frontend/src/services/api/apiClient.ts`
- Backend interceptor: `apps/backend/src/shared/interceptors/transform-response.interceptor.ts`

### Endpoints Backend (para referencia)
- `GET /api/v1/educational/modules/:id`
- `GET /api/v1/educational/exercises`

---

## 📊 ESTIMACIÓN

- **Duración:** 1 hora
- **Complejidad:** Baja (cambio quirúrgico en 1 archivo)
- **Riesgo:** Bajo (no breaking change)
- **Impacto:** Alto (desbloquea portal Student completo)

---

**Delegado por:** Requirements-Analyst
**Fecha delegación:** 2025-11-24
**Deadline:** ASAP (P0 - Bloqueador crítico)
