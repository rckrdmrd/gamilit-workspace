# REPORTE DE COHERENCIA ARQUITECTONICA
## Portal Teacher - Consumos API y Tipos

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Alcance:** Portal Teacher - Dashboard, APIs, Tipos, DTOs

---

## RESUMEN EJECUTIVO

| Metrica | Valor |
|---------|-------|
| Coherente | 40% |
| Desviaciones Mayores | 45% |
| Desviaciones Menores | 15% |
| Impacto | **CRITICO** - Dashboard no funcional |

---

## TAREA: Analisis de Coherencia API/Tipos - Portal Teacher

### FASE 1: ANALISIS ✅
**Estado:** Completado

**Hallazgos Criticos:**

#### HAL-001: Desalineacion Estructura de Respuesta Paginada (CRITICO)
- **Ubicacion:** `apps/frontend/src/services/api/teacher/classroomsApi.ts:80-90`
- **Error visible:** `classrooms.map is not a function`
- **Causa raiz:**
  - Backend devuelve: `PaginatedTeacherClassroomsResponseDto { data: Classroom[], pagination: {...} }`
  - Frontend espera: `Promise<Classroom[]>` (array directo)
  - El apiClient hace unwrap de `{ success, data }` → `data`
  - Resultado: `classrooms` es `{ data: [...], pagination: {...} }`, no un array

#### HAL-002: Campos de Tipo Diferente Frontend vs Backend
| Campo Frontend (Classroom) | Campo Backend (TeacherClassroomResponseDto) | Problema |
|---------------------------|---------------------------------------------|----------|
| `student_count: number` | `current_students_count: number` | Nombre diferente |
| `created_at: string` | `created_at: Date` | Tipo diferente |
| `updated_at: string` | `updated_at: Date` | Tipo diferente |
| `teacher_id: string` | `teacher_id: string` | OK |

#### HAL-003: Tipos StudentMonitoring vs StudentInClassroomDto
| Campo Frontend | Campo Backend | Problema |
|---------------|---------------|----------|
| `full_name` | `full_name` | OK |
| `status: StudentStatus` | `status: string` | Tipo enum vs string |
| `last_activity: string` | `last_activity: Date` | Tipo string vs Date |
| `id` | `user_id` | Nombre diferente |

#### HAL-004: Respuesta Estudiantes Tambien Paginada
- **Endpoint:** `GET /teacher/classrooms/:id/students`
- **Backend retorna:** `PaginatedStudentsResponseDto { data: StudentInClassroomDto[], pagination }`
- **Frontend espera:** `StudentMonitoring[]`

**Archivos afectados:**
- `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx:82-92` - Error classrooms.map
- `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts:36-37` - setClassrooms(data) incorrecto
- `apps/frontend/src/services/api/teacher/classroomsApi.ts:80-90` - Tipo retorno incorrecto
- `apps/frontend/src/apps/teacher/types/index.ts:274-283` - Interface Classroom desalineada
- `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts` - DTOs de referencia

**Impacto:** DB: ❌ | Backend: ✅ Correcto | Frontend: ❌ Incorrecto

---

### FASE 2: PLANEACION ✅
**Estado:** Completado

**Agentes a orquestar:**

| # | Agente | Tarea | Paralelo/Secuencial |
|---|--------|-------|---------------------|
| 1 | Frontend-Agent | FIX-001: Corregir classroomsApi para manejar respuesta paginada | Paralelo (grupo 1) |
| 2 | Frontend-Agent | FIX-002: Actualizar tipos Classroom y StudentMonitoring | Paralelo (grupo 1) |
| 3 | Frontend-Agent | FIX-003: Crear tipos de respuesta paginada centralizados | Paralelo (grupo 1) |
| 4 | Frontend-Agent | FIX-004: Corregir useClassrooms para extraer data del objeto paginado | Secuencial (despues grupo 1) |

---

## DETALLE DE GAPS IDENTIFICADOS

### GAP-TC-001: classroomsApi.getClassrooms() retorna tipo incorrecto (CRITICO)

**Severidad:** CRITICA
**Area:** Frontend - API Service

**Evidencia:**

```typescript
// ACTUAL (incorrecto) - classroomsApi.ts:80-90
async getClassrooms(query?: GetClassroomsQueryDto): Promise<Classroom[]> {
  const { data } = await axiosInstance.get<Classroom[]>(
    API_ENDPOINTS.teacher.classrooms,
    { params: query }
  );
  return data;  // data es { data: [...], pagination: {...} }, NO Classroom[]
}
```

**Solucion propuesta:**

```typescript
// CORREGIDO
interface PaginatedClassroomsResponse {
  data: Classroom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

async getClassrooms(query?: GetClassroomsQueryDto): Promise<PaginatedClassroomsResponse> {
  const { data } = await axiosInstance.get<PaginatedClassroomsResponse>(
    API_ENDPOINTS.teacher.classrooms,
    { params: query }
  );
  return data;
}
```

---

### GAP-TC-002: useClassrooms no maneja respuesta paginada

**Severidad:** CRITICA
**Area:** Frontend - Hook

**Evidencia:**

```typescript
// ACTUAL (incorrecto) - useClassrooms.ts:36-37
const data = await classroomsApi.getClassrooms(filters);
setClassrooms(data);  // data es objeto paginado, no array
```

**Solucion propuesta:**

```typescript
// CORREGIDO
const response = await classroomsApi.getClassrooms(filters);
setClassrooms(response.data);  // Extraer array de data
// Opcionalmente guardar pagination: setPagination(response.pagination);
```

---

### GAP-TC-003: Interface Classroom desalineada con backend

**Severidad:** ALTA
**Area:** Frontend - Types

**Evidencia:**

```typescript
// Frontend (apps/frontend/src/apps/teacher/types/index.ts:274-283)
export interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  student_count: number;        // Backend: current_students_count
  created_at: string;           // Backend: Date
  updated_at: string;           // Backend: Date
  teacher_id: string;
}

// Backend (classroom-response.dto.ts)
export class TeacherClassroomResponseDto {
  id!: string;
  tenant_id!: string;
  name!: string;
  code?: string;
  description?: string;
  grade_level?: string;
  section?: string;
  subject?: string;
  academic_year?: string;
  teacher_id!: string;
  capacity!: number;
  current_students_count!: number;  // Frontend: student_count
  schedule?: any[];
  is_active!: boolean;
  is_archived!: boolean;
  start_date?: Date;
  end_date?: Date;
  created_at!: Date;                // Frontend: string
  updated_at!: Date;                // Frontend: string
}
```

---

### GAP-TC-004: getClassroomStudents retorna tipo incorrecto

**Severidad:** ALTA
**Area:** Frontend - API Service

**Solucion:** Mismo patron que GAP-TC-001, pero para estudiantes.

---

## CONFIGURACION DE API (REVISION)

### Estado: BUENAS PRACTICAS IMPLEMENTADAS ✅

La configuracion de API esta centralizada correctamente:

**Archivo principal:** `apps/frontend/src/config/api.config.ts`

```typescript
// Variables de entorno
const API_HOST = import.meta.env.VITE_API_HOST;
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// URL construida
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;

// Endpoints centralizados
export const API_ENDPOINTS = {
  teacher: {
    classrooms: '/teacher/classrooms',
    classroom: (id: string) => `/teacher/classrooms/${id}`,
    // ... etc
  }
}
```

**Hallazgos positivos:**
- ✅ URLs NO hardcodeadas en codigo de produccion
- ✅ Variables de entorno configuradas en `.env.example`
- ✅ `api.config.ts` es single source of truth
- ✅ `API_ENDPOINTS` centraliza todas las rutas
- ✅ Funciones helper (`buildApiUrl`, `buildWsUrl`)

**Archivos con localhost (solo testing):**
- `apps/frontend/vite.config.ts` - Configuracion de dev server (OK)
- `apps/frontend/src/config/env.ts` - Default fallback (OK)
- `apps/frontend/e2e/*.ts` - Tests E2E (OK)
- `apps/frontend/src/test/setup.ts` - Test setup (OK)

---

## PROBLEMA DE DATE INVALID

### Causa probable:
El backend envia fechas como ISO strings (`"2024-11-24T15:30:00Z"`), pero los DTOs declaran `Date`.

Cuando el frontend recibe el JSON, `created_at` es un string. Si el codigo intenta usar metodos de Date directamente, falla:

```typescript
// Frontend recibe:
activity.timestamp = "2024-11-24T15:30:00Z"  // string

// Si el codigo hace:
new Date(activity.timestamp).toLocaleString()  // Funciona

// Pero si el codigo asume Date:
activity.timestamp.toISOString()  // ERROR: toISOString is not a function
```

### Solucion:
1. Frontend types deben declarar fechas como `string` (JSON no tiene tipo Date)
2. Crear funciones helper para parsear/formatear fechas consistentemente

---

## PLAN DE CORRECCION

### Prioridad P0 (Critico - Inmediato)

| ID | Tarea | Agente | Archivos |
|----|-------|--------|----------|
| FIX-001 | Crear tipos de respuesta paginada centralizados | Frontend-Agent | `types/api-responses.ts` |
| FIX-002 | Corregir classroomsApi para manejar paginacion | Frontend-Agent | `classroomsApi.ts` |
| FIX-003 | Actualizar useClassrooms para extraer array | Frontend-Agent | `useClassrooms.ts` |
| FIX-004 | Alinear interface Classroom con backend | Frontend-Agent | `types/index.ts` |

### Prioridad P1 (Alto - Siguiente)

| ID | Tarea | Agente | Archivos |
|----|-------|--------|----------|
| FIX-005 | Crear helpers para manejo de fechas | Frontend-Agent | `utils/dateHelpers.ts` |
| FIX-006 | Alinear StudentMonitoring con backend | Frontend-Agent | `types/index.ts` |

---

## ESPECIFICACIONES PARA AGENTES

### SPEC-FIX-001: Tipos de Respuesta Paginada

**Crear archivo:** `apps/frontend/src/shared/types/api-responses.ts`

```typescript
/**
 * Generic paginated response type
 * Matches backend PaginatedResponseDto
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### SPEC-FIX-002: Corregir classroomsApi

**Modificar:** `apps/frontend/src/services/api/teacher/classroomsApi.ts`

1. Importar `PaginatedResponse` del nuevo archivo
2. Cambiar tipo de retorno de `getClassrooms()` a `Promise<PaginatedResponse<Classroom>>`
3. Cambiar tipo de retorno de `getClassroomStudents()` a `Promise<PaginatedResponse<StudentMonitoring>>`

### SPEC-FIX-003: Corregir useClassrooms

**Modificar:** `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`

1. Importar `PaginatedResponse`
2. Agregar estado para pagination (opcional)
3. Extraer `response.data` al setear classrooms:
   ```typescript
   const response = await classroomsApi.getClassrooms(filters);
   setClassrooms(response.data);
   ```

### SPEC-FIX-004: Alinear Interface Classroom

**Modificar:** `apps/frontend/src/apps/teacher/types/index.ts`

1. Renombrar `student_count` a `current_students_count`
2. Cambiar `created_at: string` (mantener string por JSON)
3. Agregar campos faltantes del backend
4. Agregar comentario de alineacion con backend DTO

---

## VALIDACION POST-IMPLEMENTACION

Despues de aplicar correcciones, verificar:

- [ ] No errores en consola al cargar TeacherDashboard
- [ ] `classrooms.map()` funciona correctamente
- [ ] Fechas se muestran correctamente (no "Invalid Date")
- [ ] Lista de estudiantes carga correctamente
- [ ] Tipos TypeScript compilan sin errores

---

**Siguiente paso:** Ejecutar FASE 3 (Ejecucion) - Orquestar Frontend-Agent para implementar correcciones.
