# ANÁLISIS: Bug en Carga de Módulos/Ejercicios - Portal Student

**Fecha:** 2025-11-24
**Agente:** Requirements-Analyst
**Tipo:** Bug Fix - Critical
**Prioridad:** P0 (Bloqueador)
**Módulo:** Frontend - Student Portal

---

## 🔴 PROBLEMA REPORTADO

### Error en Consola
```
Error fetching module detail: TypeError: allExercises.filter is not a function
    at fetchModuleDetail (useModules.ts:108:12)
```

### Síntomas
- Portal de estudiantes NO carga los módulos educativos
- Lista de ejercicios NO se muestra
- Error en hook `useModules.ts` al intentar filtrar ejercicios
- Widgets de dashboard funcionan correctamente (RankProgressWidget OK)

### Ubicación del Error
- **Archivo:** `apps/frontend/src/shared/hooks/useModules.ts`
- **Línea:** 108
- **Función:** `fetchModuleDetail()`

---

## 🔍 ROOT CAUSE ANALYSIS

### 1. Backend: Interceptor Global de Respuestas

**Ubicación:** `apps/backend/src/main.ts:65`
```typescript
// Global response transformation interceptor
app.useGlobalInterceptors(new TransformResponseInterceptor());
```

**Comportamiento del Interceptor:**
- **Archivo:** `apps/backend/src/shared/interceptors/transform-response.interceptor.ts`
- **Función:** Envuelve TODAS las respuestas en formato estándar:
```json
{
  "success": true,
  "data": [...],  // ← Payload real aquí
  "timestamp": "2025-11-24T10:30:00Z",
  "path": "/api/v1/educational/exercises"
}
```

**Ejemplo Real:**
```json
// Endpoint: GET /api/v1/educational/exercises
// Respuesta del Controller (línea 168):
[
  { "id": "...", "title": "Ejercicio 1", ... },
  { "id": "...", "title": "Ejercicio 2", ... }
]

// Respuesta REAL enviada al Frontend (después del interceptor):
{
  "success": true,
  "data": [
    { "id": "...", "title": "Ejercicio 1", ... },
    { "id": "...", "title": "Ejercicio 2", ... }
  ],
  "timestamp": "2025-11-24T10:30:00Z",
  "path": "/api/v1/educational/exercises"
}
```

### 2. Frontend: Uso de fetch() Directo Sin Unwrapper

**Ubicación:** `apps/frontend/src/shared/hooks/useModules.ts:95-109`

**Código Problemático:**
```typescript
// Línea 95-104: Fetch directo sin unwrapping
const exercisesResponse = await fetch(
  `${API_BASE_URL}/educational/exercises`,
  { headers }
);

if (!exercisesResponse.ok) {
  throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText}`);
}

const allExercises = await exercisesResponse.json();
// ❌ allExercises = { success: true, data: [...], ... } (objeto)
// ✅ Se espera: allExercises = [...] (array directo)

// Línea 107-109: Error aquí
const moduleExercises = allExercises
  .filter((ex: Exercise) => ex.module_id === moduleId)  // ❌ TypeError!
  .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index);
```

**Por qué falla:**
- `allExercises` es un **objeto** con estructura `{success, data, timestamp, path}`
- `.filter()` es un método de **arrays**, no de objetos
- JavaScript lanza: `TypeError: allExercises.filter is not a function`

### 3. Inconsistencia con el Resto del Frontend

**El proyecto YA tiene un `apiClient` preparado:**
- **Ubicación:** `apps/frontend/src/services/api/apiClient.ts`
- **Líneas 88-92:** Interceptor que unwrappea automáticamente:
```typescript
// Unwrap backend response format: { success, data, timestamp, path }
if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
  response.data = response.data.data;  // Extrae el array del wrapper
}
```

**Problema:**
- `useModules.ts` usa `fetch()` directo (NO usa `apiClient`)
- Por lo tanto, NO se beneficia del unwrapping automático
- Resto de archivos del proyecto SÍ usan `apiClient` correctamente

---

## ✅ SOLUCIÓN PROPUESTA

### Opción 1: Migrar a apiClient (RECOMENDADA)

**Ventajas:**
- ✅ Consistencia con el resto del proyecto
- ✅ Unwrapping automático ya implementado
- ✅ Autenticación manejada automáticamente (headers)
- ✅ Manejo de errores centralizado
- ✅ Refresh token automático en 401
- ✅ Logging en modo debug

**Cambios Necesarios:**

```typescript
// ❌ ANTES:
import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api.config';

const API_BASE_URL = API_CONFIG.baseURL;

// ...dentro de useEffect:
const token = localStorage.getItem('auth-token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const exercisesResponse = await fetch(
  `${API_BASE_URL}/educational/exercises`,
  { headers }
);

if (!exercisesResponse.ok) {
  throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText}`);
}

const allExercises = await exercisesResponse.json();

// ✅ DESPUÉS:
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/apiClient';

// ...dentro de useEffect:
const exercisesResponse = await apiClient.get('/educational/exercises');
const allExercises = exercisesResponse.data;  // Ya unwrapped ✅
```

**Mismo cambio para módulos (líneas 82-92):**
```typescript
// ❌ ANTES:
const moduleResponse = await fetch(
  `${API_BASE_URL}/educational/modules/${moduleId}`,
  { headers }
);

// ✅ DESPUÉS:
const moduleResponse = await apiClient.get(`/educational/modules/${moduleId}`);
const moduleData = moduleResponse.data;
```

### Opción 2: Unwrap Manual (NO recomendada)

Si por algún motivo se DEBE seguir usando `fetch()`:

```typescript
const responseData = await exercisesResponse.json();
const allExercises = responseData.data;  // Extraer campo 'data'
```

**Desventajas:**
- ❌ Inconsistente con el resto del código
- ❌ Requiere manejar auth headers manualmente
- ❌ Requiere manejar errores manualmente
- ❌ No aprovecha infraestructura existente

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Tarea FE-100: Migrar useModules.ts a apiClient

**Tipo:** Bug Fix - Critical
**Prioridad:** P0
**Duración:** 1 hora
**Agente:** Frontend-Agent

**Checklist:**

**1. Modificar imports:**
- [ ] Añadir: `import { apiClient } from '@/services/api/apiClient';`
- [ ] Eliminar: `const API_BASE_URL = API_CONFIG.baseURL;` (ya no se usa)

**2. Modificar función `fetchModuleDetail()` (líneas 66-121):**
- [ ] Eliminar construcción de headers manualmente (líneas 71-79)
- [ ] Reemplazar `fetch()` del módulo con `apiClient.get()` (líneas 82-92)
- [ ] Reemplazar `fetch()` de ejercicios con `apiClient.get()` (líneas 95-104)
- [ ] Extraer `.data` de las respuestas de axios

**3. Código final esperado:**
```typescript
const fetchModuleDetail = async () => {
  setLoading(true);
  setError(null);

  try {
    // Fetch module details
    const moduleResponse = await apiClient.get(
      `/educational/modules/${moduleId}`
    );
    setModule(moduleResponse.data);

    // Fetch all exercises (with completed field)
    const exercisesResponse = await apiClient.get('/educational/exercises');
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

**4. Testing manual:**
- [ ] Verificar que portal Student carga módulos sin errores
- [ ] Verificar que lista de ejercicios se muestra correctamente
- [ ] Verificar que filtrado por módulo funciona
- [ ] Verificar que orden de ejercicios es correcto (order_index)
- [ ] Verificar en consola: NO debe aparecer el error `filter is not a function`

---

## 🎯 VALIDACIÓN POST-FIX

### Criterios de Aceptación
- [ ] Portal Student carga sin errores en consola
- [ ] Módulos educativos se muestran correctamente
- [ ] Ejercicios se filtran por módulo correctamente
- [ ] Ejercicios se ordenan por `order_index`
- [ ] Campo `completed` se muestra en cada ejercicio
- [ ] Widgets de dashboard siguen funcionando (no regresión)

### Pruebas de Regresión
- [ ] RankProgressWidget sigue funcionando
- [ ] DashboardComplete sigue mostrando datos de rango
- [ ] Autenticación sigue funcionando
- [ ] Tokens se renuevan automáticamente en 401

---

## 📊 IMPACTO

### Módulos Afectados
- ✅ **Frontend - Student Portal:** Módulos y ejercicios
- ✅ **Shared Hooks:** `useModules.ts`

### Riesgo de la Corrección
- **Bajo:** Cambio quirúrgico en 1 archivo
- **No breaking:** Solo cambia implementación interna del hook
- **No afecta:** Componentes que usan el hook (interfaz igual)

### Beneficios
- ✅ Portal Student funcional
- ✅ Consistencia con resto del proyecto
- ✅ Mejor manejo de errores
- ✅ Autenticación más robusta

---

## 📚 REFERENCIAS

### Archivos Clave
- `apps/frontend/src/shared/hooks/useModules.ts` (a modificar)
- `apps/frontend/src/services/api/apiClient.ts` (unwrapper ya existe)
- `apps/backend/src/main.ts:65` (interceptor global)
- `apps/backend/src/shared/interceptors/transform-response.interceptor.ts` (wrapper)

### Endpoints Backend
- `GET /api/v1/educational/modules/:id` (retorna objeto Module)
- `GET /api/v1/educational/exercises` (retorna array de Exercise[])

### Controllers Backend
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts:146` (findAll)

---

## 🚨 DELEGACIÓN

### Frontend-Agent
**Contexto:** Bug crítico bloqueando portal Student
**Prioridad:** P0 (arreglar ASAP)
**Tareas pendientes:**
- FE-100: Migrar useModules.ts de fetch() a apiClient

**Referencia:** Este documento
**Estimación:** 1 hora (cambio quirúrgico)
**Bloqueadores:** Ninguno

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-24
**Estado:** ⏳ Pendiente de implementación
