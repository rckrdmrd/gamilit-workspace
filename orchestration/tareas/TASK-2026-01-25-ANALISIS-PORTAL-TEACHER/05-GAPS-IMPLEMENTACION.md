# 05-GAPS-IMPLEMENTACION.md - Funcionalidades Documentadas Sin Implementar

**Tarea:** TASK-2026-01-25-ANALISIS-PORTAL-TEACHER
**Fase:** FASE-1 - Auditoría de Coherencia
**Fecha:** 2026-01-25

---

## 1. User Stories NO Implementadas

### GAP-IMPL-001: US-PM-006 - Bloquear/Desbloquear Alumnos

**Severidad:** 🔴 CRÍTICA
**Story Points:** 8 SP
**Presupuesto:** $3,200 MXN
**Dependencias:** RF-AUTH-002, ET-AUTH-002, EXT-010 (opcional)

#### Estado de Componentes

| Capa | Componente | Estado | Notas |
|------|-----------|--------|-------|
| **BD** | Columna `profiles.status` | ✅ Existe | Valores: active, inactive, suspended |
| **BD** | Columna `profiles.status_changed_at` | ❌ Falta | Timestamp de cambio |
| **BD** | Columna `profiles.status_changed_by` | ❌ Falta | UUID del teacher |
| **BD** | Columna `profiles.status_reason` | ❌ Falta | Motivo de suspensión |
| **BD** | RLS policy para suspend | ❌ Falta | Solo teacher del classroom |
| **Backend** | `UpdateStudentStatusDto` | ❌ Falta | DTO para el endpoint |
| **Backend** | `TeacherService.updateStudentStatus()` | ❌ Falta | Método del servicio |
| **Backend** | `PATCH /teacher/students/:id/status` | ❌ Falta | Endpoint |
| **Frontend** | `useStudentStatus` hook | ❌ Falta | Hook para gestión |
| **Frontend** | `SuspendStudentModal.tsx` | ❌ Falta | Modal de suspensión |
| **Frontend** | `StudentActionsMenu.tsx` | ❌ Falta | Menú de acciones |
| **Frontend** | Integración en TeacherStudentsPage | ❌ Falta | Botón/menú |

#### Plan de Implementación

```
Fase 1: Base de Datos (2h)
├── 1.1 Agregar columnas a profiles
├── 1.2 Crear índice en status
├── 1.3 Crear RLS policy
└── 1.4 Crear trigger de auditoría

Fase 2: Backend (4h)
├── 2.1 Crear UpdateStudentStatusDto
├── 2.2 Crear método en TeacherService
├── 2.3 Agregar endpoint al controller
├── 2.4 Validaciones de ownership
└── 2.5 Tests unitarios

Fase 3: Frontend (4h)
├── 3.1 Crear useStudentStatus hook
├── 3.2 Crear SuspendStudentModal
├── 3.3 Crear StudentActionsMenu
├── 3.4 Integrar en TeacherStudentsPage
└── 3.5 Tests unitarios
```

**Estimación total:** 10 horas

---

### GAP-IMPL-002: US-PM-007 - Configuración de Alertas

**Severidad:** 🔴 CRÍTICA
**Story Points:** 5 SP
**Presupuesto:** $2,200 MXN
**Dependencias:** US-PM-001a, Intervention Alerts System

#### Estado de Componentes

| Capa | Componente | Estado | Notas |
|------|-----------|--------|-------|
| **BD** | Tabla `teacher_alert_configurations` | ❌ Falta | Config por classroom |
| **BD** | Columnas: classroom_id, alert_type, enabled, threshold, config | ❌ Falta | Estructura |
| **BD** | RLS policies | ❌ Falta | Teacher del classroom |
| **Backend** | `AlertConfigService` | ❌ Falta | Servicio completo |
| **Backend** | `AlertConfigController` | ❌ Falta | Controlador |
| **Backend** | DTOs (Get, Update, Preview) | ❌ Falta | Todos |
| **Backend** | `GET /classrooms/:id/alert-config` | ❌ Falta | Obtener config |
| **Backend** | `PATCH /classrooms/:id/alert-config` | ❌ Falta | Actualizar |
| **Backend** | `POST /classrooms/:id/alert-config/preview` | ❌ Falta | Preview |
| **Backend** | `GET /classrooms/:id/alert-config/history` | ❌ Falta | Historial |
| **Frontend** | `TeacherAlertConfigPage.tsx` | ❌ Falta | Página principal |
| **Frontend** | `AlertConfigCard.tsx` | ❌ Falta | Card de config |
| **Frontend** | `ThresholdSlider.tsx` | ❌ Falta | Slider de umbral |
| **Frontend** | `AffectedStudentsPreview.tsx` | ❌ Falta | Preview |
| **Frontend** | `useAlertConfig` hook | ❌ Falta | Hook |
| **Frontend** | Ruta `/teacher/classrooms/:id/alert-config` | ❌ Falta | Ruta |

#### Plan de Implementación

```
Fase 1: Base de Datos (3h)
├── 1.1 Crear tabla teacher_alert_configurations
│   ├── id (UUID, PK)
│   ├── classroom_id (UUID, FK)
│   ├── alert_type (enum)
│   ├── enabled (boolean)
│   ├── threshold_value (decimal)
│   ├── threshold_days (int)
│   ├── custom_config (jsonb)
│   ├── created_at, updated_at, updated_by
├── 1.2 Crear índices
├── 1.3 Crear RLS policies
├── 1.4 Crear tabla alert_config_history
└── 1.5 Crear trigger de auditoría

Fase 2: Backend (6h)
├── 2.1 Crear Entity AlertConfiguration
├── 2.2 Crear DTOs
│   ├── AlertConfigResponseDto
│   ├── UpdateAlertConfigDto
│   ├── PreviewAffectedStudentsDto
├── 2.3 Crear AlertConfigService
│   ├── getConfig(classroomId)
│   ├── updateConfig(classroomId, dto)
│   ├── previewAffectedStudents(classroomId, threshold)
│   ├── getConfigHistory(classroomId)
├── 2.4 Crear AlertConfigController
├── 2.5 Validaciones
└── 2.6 Tests unitarios

Fase 3: Frontend (6h)
├── 3.1 Crear useAlertConfig hook
├── 3.2 Crear componentes
│   ├── AlertConfigCard
│   ├── ThresholdSlider
│   ├── AffectedStudentsPreview
│   ├── ConfigHistoryModal
├── 3.3 Crear TeacherAlertConfigPage
├── 3.4 Agregar ruta en App.tsx
├── 3.5 Integrar botón en TeacherAlertsPage
└── 3.6 Tests unitarios
```

**Estimación total:** 15 horas

---

### GAP-IMPL-003: US-PM-009 - Página de Recursos (Parcial)

**Severidad:** 🟡 MEDIA
**Story Points:** 2 SP (solo página faltante)
**Estado:** 60% implementado

#### Estado de Componentes

| Capa | Componente | Estado | Notas |
|------|-----------|--------|-------|
| **Backend** | Media endpoints | ✅ Existe | CRUD completo |
| **Backend** | Storage service | ✅ Existe | Upload/download |
| **Frontend** | `ResourceSharingPanel.tsx` | ✅ Existe | Panel en dashboard |
| **Frontend** | `TeacherResourcesPage.tsx` | ❌ Falta | Página dedicada |
| **Frontend** | Ruta `/teacher/resources` | ⚠️ Redirect | Redirige a dashboard |

#### Opciones de Resolución

**Opción A: Crear página dedicada (Recomendado)**
```
1. Crear TeacherResourcesPage.tsx basado en ResourceSharingPanel
2. Agregar funcionalidades adicionales:
   - Vista de grid/lista
   - Filtros avanzados
   - Bulk operations
3. Actualizar ruta en App.tsx
```

**Opción B: Documentar como parte del Dashboard**
```
1. Actualizar US-PM-009 indicando que recursos está integrado en dashboard
2. Eliminar ruta /teacher/resources
3. Mejorar ResourceSharingPanel si es necesario
```

**Estimación:** 4 horas (Opción A) / 1 hora (Opción B)

---

## 2. Servicios API Faltantes

### GAP-API-001: manualReviewApi.ts ✅ RESUELTO

**Controlador:** ManualReviewController
**Endpoints:** 11
**Estado:** ✅ IMPLEMENTADO (2026-01-25)

#### Implementación Requerida

```typescript
// services/api/teacher/manualReviewApi.ts

import { axiosInstance } from '@/services/axios';
import { API_ENDPOINTS } from '@/services/api/apiConfig';

export const manualReviewApi = {
  // GET /teacher/reviews/config/exercises
  getExercisesConfig: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.teacher.reviews.config
    );
    return response.data;
  },

  // GET /teacher/reviews/pending
  getPendingReviews: async (params?: PaginationParams) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.teacher.reviews.pending,
      { params }
    );
    return response.data;
  },

  // GET /teacher/reviews/pending/module/:moduleOrder
  getPendingByModule: async (moduleOrder: number) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.teacher.reviews.pending}/module/${moduleOrder}`
    );
    return response.data;
  },

  // GET /teacher/reviews/stats
  getStats: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.teacher.reviews.stats
    );
    return response.data;
  },

  // GET /teacher/reviews/my-reviews
  getMyReviews: async (params?: PaginationParams) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.teacher.reviews.myReviews,
      { params }
    );
    return response.data;
  },

  // GET /teacher/reviews/:id
  getById: async (id: string) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.teacher.reviews.base}/${id}`
    );
    return response.data;
  },

  // POST /teacher/reviews
  create: async (data: CreateReviewDto) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.teacher.reviews.base,
      data
    );
    return response.data;
  },

  // PUT /teacher/reviews/:id
  update: async (id: string, data: UpdateReviewDto) => {
    const response = await axiosInstance.put(
      `${API_ENDPOINTS.teacher.reviews.base}/${id}`,
      data
    );
    return response.data;
  },

  // POST /teacher/reviews/:id/start
  start: async (id: string) => {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.teacher.reviews.base}/${id}/start`
    );
    return response.data;
  },

  // POST /teacher/reviews/:id/complete
  complete: async (id: string, data: CompleteReviewDto) => {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.teacher.reviews.base}/${id}/complete`,
      data
    );
    return response.data;
  },

  // POST /teacher/reviews/:id/return
  returnForRevision: async (id: string, data: ReturnReviewDto) => {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.teacher.reviews.base}/${id}/return`,
      data
    );
    return response.data;
  },
};
```

**Estimación:** 2 horas

---

## 3. Endpoints Backend Sin Uso Completo

Endpoints implementados en backend pero no consumidos completamente en frontend:

| Controlador | Endpoint | Estado FE | Gap |
|-------------|----------|-----------|-----|
| TeacherClassrooms | `POST /:id/students/:studentId/block` | ❌ No usado | US-PM-006 pendiente |
| TeacherClassrooms | `POST /:id/students/:studentId/unblock` | ❌ No usado | US-PM-006 pendiente |
| TeacherClassrooms | `GET /:id/students/:studentId/permissions` | ❌ No usado | Feature avanzado |
| TeacherClassrooms | `PATCH /:id/students/:studentId/permissions` | ❌ No usado | Feature avanzado |
| Assignments | `POST /:id/duplicate` | ⚠️ Parcial | Wizard no lo usa |
| Assignments | `POST /:id/close` | ⚠️ Parcial | Solo desde card |

---

## 4. Resumen de Trabajo Pendiente

### Por Prioridad

| Prioridad | Item | Tipo | Horas |
|-----------|------|------|-------|
| ~~P0~~ | ~~Crear manualReviewApi.ts~~ | ~~Código~~ | ~~2h~~ ✅ HECHO |
| P1 | Implementar US-PM-006 (Bloquear Alumnos) | Full-stack | 10h |
| P1 | Implementar US-PM-007 (Config Alertas) | Full-stack | 15h |
| P2 | Resolver US-PM-009 (Recursos) | Frontend | 4h |
| P3 | Integrar endpoints no usados | Frontend | 4h |

### Por Capa

| Capa | Horas Estimadas |
|------|-----------------|
| Base de Datos | 5h |
| Backend | 10h |
| Frontend | 20h |
| **TOTAL** | **35h** |

---

## 5. Orden de Implementación Recomendado

```
Semana 1:
├── Día 1-2: manualReviewApi.ts + refactor hooks
├── Día 3: DDL para US-PM-006 y US-PM-007
└── Día 4-5: Backend US-PM-007 (más sencillo)

Semana 2:
├── Día 1-2: Frontend US-PM-007
├── Día 3: Backend US-PM-006
├── Día 4: Frontend US-PM-006
└── Día 5: US-PM-009 + pruebas integrales
```

---

## 6. Dependencias Externas

| Gap | Dependencia | Estado | Impacto |
|-----|-------------|--------|---------|
| US-PM-006 | EXT-010 (Parent Notifications) | 35% | CA-7 (notif padres) no implementable |
| US-PM-006 | RF-AUTH-002 | ✅ | Roles teacher OK |
| US-PM-007 | Intervention Alerts System | ✅ | Sistema funcional |
| US-PM-007 | US-PM-001a (Classrooms) | ✅ | Classrooms OK |

---

**Generado:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED
