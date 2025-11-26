# PLAN DE IMPLEMENTACIÓN: PORTAL TEACHER - FUNCIONALIDAD COMPLETA

**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Versión:** 1.0
**Estado:** FASE 2 - PLANIFICACIÓN

---

## RESUMEN DEL PLAN

### Objetivo
Hacer que **TODAS las páginas del sidebar del Portal Teacher sean completamente funcionales**.

### Alcance
- 5 GAPs identificados
- 3 prioridades (P0, P1, P2/P3)
- 3 capas afectadas (Database, Backend, Frontend)

### Estimación de Agentes
- **Total de agentes a orquestar:** 8
- **Paralelos máximos:** 5 (límite del sistema)
- **Secuenciales:** 3 grupos

---

## 1. GAPS A IMPLEMENTAR

### GRUPO 1: PRIORIDAD ALTA (MVP)

#### GAP-T002: TeacherAlertsPage - Conectar gestión de alertas
**Prioridad:** P0
**Capas:** Frontend solamente
**Esfuerzo:** Bajo (2-4 horas)

**Problema:** Los endpoints de gestión de alertas EXISTEN en backend pero el frontend NO los usa.

**Endpoints disponibles (backend):**
- `PATCH /teacher/alerts/:id/acknowledge` - Reconocer alerta
- `PATCH /teacher/alerts/:id/resolve` - Resolver alerta con notas
- `PATCH /teacher/alerts/:id/dismiss` - Descartar alerta

**Tareas:**
1. Modificar `TeacherAlertsPage.tsx` para habilitar botones de gestión
2. Conectar `InterventionAlertsPanel` con métodos del hook `useInterventionAlerts`
3. Implementar modales de confirmación para resolver/descartar
4. Agregar feedback visual (toast notifications)

**Archivos a modificar:**
- `apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx`
- `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx`

---

#### GAP-T005: TeacherCommunicationPage - Selectores dinámicos
**Prioridad:** P1
**Capas:** Frontend solamente
**Esfuerzo:** Bajo (2-4 horas)

**Problema:** Los selectores de clase y estudiante usan placeholders hardcodeados.

**Tareas:**
1. Reemplazar placeholder de clase con dropdown dinámico usando `useClassrooms()`
2. Reemplazar placeholder de estudiante con dropdown dinámico
3. Conectar selecciones con endpoints de anuncios y feedback
4. Validar flujo completo de envío

**Archivos a modificar:**
- `apps/frontend/src/apps/teacher/pages/TeacherCommunicationPage.tsx`
- `apps/frontend/src/apps/teacher/components/communication/` (si existen)

---

### GRUPO 2: PRIORIDAD MEDIA (Fase 3 - Opcional)

#### GAP-T003: TeacherContentManagement - CRUD de contenido personalizado
**Prioridad:** P2
**Capas:** Backend + Frontend
**Esfuerzo:** Alto (8-16 horas)

**Problema:** La tabla `teacher_content` existe pero no hay endpoints CRUD ni conexión frontend.

**Tareas Backend:**
1. Crear `TeacherContentController` con endpoints CRUD
2. Crear `TeacherContentService` con lógica de negocio
3. Crear DTOs para create/update/filter
4. Implementar validaciones y permisos

**Tareas Frontend:**
1. Reemplazar mock data con llamadas a API
2. Habilitar botones de crear/editar/clonar/eliminar
3. Implementar modales de formulario
4. Conectar con `teacherContentApi`

**Archivos a crear/modificar:**
- Backend:
  - `apps/backend/src/modules/teacher/controllers/teacher-content.controller.ts` (CREAR)
  - `apps/backend/src/modules/teacher/services/teacher-content.service.ts` (CREAR)
  - `apps/backend/src/modules/teacher/dto/teacher-content.dto.ts` (CREAR)
- Frontend:
  - `apps/frontend/src/apps/teacher/pages/TeacherContentManagement.tsx`
  - `apps/frontend/src/services/api/teacher/teacherContentApi.ts` (CREAR)

---

#### GAP-T004: TeacherGamification - Otorgar bonus manual
**Prioridad:** P2
**Capas:** Backend + Frontend
**Esfuerzo:** Medio (4-8 horas)

**Problema:** No existe endpoint para que teachers otorguen ML coins manualmente.

**Tareas Backend:**
1. Crear endpoint `POST /teacher/students/:id/bonus`
2. Implementar lógica de otorgar coins en `UserStatsService` o similar
3. Validar que teacher tiene acceso al estudiante
4. Registrar transacción en historial

**Tareas Frontend:**
1. Habilitar botón "Otorgar Bonus" en TeacherGamification
2. Implementar modal con cantidad y razón
3. Conectar con nuevo endpoint
4. Mostrar feedback de éxito

**Archivos a crear/modificar:**
- Backend:
  - `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` (agregar endpoint)
  - `apps/backend/src/modules/gamification/services/user-stats.service.ts` (agregar método)
- Frontend:
  - `apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx`

---

### GRUPO 3: PRIORIDAD BAJA (Fase 3 - Post-MVP)

#### GAP-T001: TeacherResourcesPage - Módulo completo
**Prioridad:** P3
**Capas:** Database + Backend + Frontend
**Esfuerzo:** Muy Alto (16-32 horas)

**Problema:** Funcionalidad completamente sin implementar.

**Tareas Database:**
1. Crear tabla `teacher_resources` en schema `educational_content`
2. Crear tabla `resource_categories`
3. Crear tabla `resource_shares` (para compartir entre teachers/estudiantes)
4. Agregar índices y RLS

**Tareas Backend:**
1. Crear `TeacherResourcesController` con CRUD completo
2. Crear `TeacherResourcesService`
3. Implementar upload de archivos (S3 o local)
4. Implementar búsqueda y filtrado
5. Implementar compartir recursos

**Tareas Frontend:**
1. Reemplazar `UnderConstruction` con UI real
2. Implementar lista de recursos con filtros
3. Implementar upload de archivos
4. Implementar compartir/favoritos
5. Implementar búsqueda

**Archivos a crear:**
- Database:
  - `apps/database/ddl/schemas/educational_content/tables/26-teacher_resources.sql`
  - `apps/database/ddl/schemas/educational_content/tables/27-resource_categories.sql`
- Backend:
  - `apps/backend/src/modules/teacher/controllers/teacher-resources.controller.ts`
  - `apps/backend/src/modules/teacher/services/teacher-resources.service.ts`
  - `apps/backend/src/modules/teacher/dto/teacher-resources.dto.ts`
- Frontend:
  - `apps/frontend/src/apps/teacher/pages/TeacherResourcesPage.tsx` (reescribir)
  - `apps/frontend/src/services/api/teacher/teacherResourcesApi.ts`
  - `apps/frontend/src/apps/teacher/hooks/useTeacherResources.ts`

---

## 2. PLAN DE ORQUESTACIÓN

### FASE 3A: Implementación MVP (GAPs P0 y P1)

**Agentes a ejecutar EN PARALELO (Grupo 1):**

| # | Agente | GAP | Tarea | Dependencia |
|---|--------|-----|-------|-------------|
| 1 | Frontend-Agent | GAP-T002 | Conectar gestión de alertas | Ninguna |
| 2 | Frontend-Agent | GAP-T005 | Selectores dinámicos comunicación | Ninguna |

**Tiempo estimado:** 2-4 horas paralelas

---

### FASE 3B: Implementación Fase 3 - Contenido (GAP-T003)

**Agentes a ejecutar SECUENCIALMENTE:**

| # | Agente | GAP | Tarea | Dependencia |
|---|--------|-----|-------|-------------|
| 3 | Backend-Agent | GAP-T003 | Crear endpoints CRUD teacher_content | Ninguna |
| 4 | Frontend-Agent | GAP-T003 | Conectar UI con APIs | Agente 3 |

**Tiempo estimado:** 8-16 horas secuenciales

---

### FASE 3C: Implementación Fase 3 - Gamification (GAP-T004)

**Agentes a ejecutar SECUENCIALMENTE:**

| # | Agente | GAP | Tarea | Dependencia |
|---|--------|-----|-------|-------------|
| 5 | Backend-Agent | GAP-T004 | Crear endpoint bonus manual | Ninguna |
| 6 | Frontend-Agent | GAP-T004 | Conectar UI con endpoint | Agente 5 |

**Tiempo estimado:** 4-8 horas secuenciales

---

### FASE 3D: Implementación Fase 3 - Recursos (GAP-T001)

**Agentes a ejecutar SECUENCIALMENTE:**

| # | Agente | GAP | Tarea | Dependencia |
|---|--------|-----|-------|-------------|
| 7 | Database-Agent | GAP-T001 | Crear tablas de recursos | Ninguna |
| 8 | Backend-Agent | GAP-T001 | Crear módulo completo | Agente 7 |
| 9 | Frontend-Agent | GAP-T001 | Implementar UI completa | Agente 8 |

**Tiempo estimado:** 16-32 horas secuenciales

---

## 3. ESPECIFICACIONES TÉCNICAS PARA AGENTES

### Agente 1: Frontend-Agent - GAP-T002

```markdown
TAREA: Habilitar gestión de alertas en TeacherAlertsPage

CONTEXTO:
- Los endpoints de gestión YA EXISTEN en backend
- El hook useInterventionAlerts YA TIENE los métodos
- Solo falta conectar la UI

ARCHIVOS A MODIFICAR:
1. apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx
2. apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx

ESPECIFICACIÓN:
1. En InterventionAlertsPanel, habilitar los botones de:
   - Reconocer (acknowledgeAlert)
   - Resolver (resolveAlert) - con modal para notas
   - Descartar (dismissAlert) - con confirmación
2. Conectar con métodos del hook useInterventionAlerts
3. Agregar toast notifications para feedback
4. Remover el banner de "Sistema de Alertas Básico"

CRITERIOS DE ACEPTACIÓN:
- ✅ Botones de gestión habilitados y funcionales
- ✅ Modal de resolución con campo de notas
- ✅ Confirmación antes de descartar
- ✅ Feedback visual con toast
- ✅ Lista de alertas se actualiza después de acción

RESTRICCIONES:
- NO crear nuevos endpoints
- NO modificar backend
- Usar hooks existentes
```

### Agente 2: Frontend-Agent - GAP-T005

```markdown
TAREA: Implementar selectores dinámicos en TeacherCommunicationPage

CONTEXTO:
- Los endpoints de anuncios y feedback YA EXISTEN
- Los hooks useClassrooms YA EXISTE
- Solo faltan los selectores dinámicos

ARCHIVOS A MODIFICAR:
1. apps/frontend/src/apps/teacher/pages/TeacherCommunicationPage.tsx

ESPECIFICACIÓN:
1. En sección de Anuncios:
   - Reemplazar "CLASSROOM_ID_PLACEHOLDER" con dropdown de clases
   - Usar useClassrooms() para obtener lista
   - Conectar selección con sendClassroomAnnouncement()
2. En sección de Feedback:
   - Agregar selector de clase primero
   - Luego selector de estudiante (filtrado por clase)
   - Conectar con sendPrivateFeedback()
3. Remover mensajes de "Próximamente"

CRITERIOS DE ACEPTACIÓN:
- ✅ Dropdown de clases funcional en Anuncios
- ✅ Dropdown de clase + estudiante en Feedback
- ✅ Anuncios se envían a clase seleccionada
- ✅ Feedback se envía a estudiante seleccionado
- ✅ Validación antes de enviar

RESTRICCIONES:
- NO crear nuevos endpoints
- NO modificar backend
- Usar hooks existentes
```

### Agente 3: Backend-Agent - GAP-T003

```markdown
TAREA: Crear endpoints CRUD para teacher_content

CONTEXTO:
- La tabla teacher_content YA EXISTE en educational_content schema
- Solo faltan los endpoints y service

ARCHIVOS A CREAR:
1. apps/backend/src/modules/teacher/controllers/teacher-content.controller.ts
2. apps/backend/src/modules/teacher/services/teacher-content.service.ts
3. apps/backend/src/modules/teacher/dto/teacher-content.dto.ts

ESPECIFICACIÓN:
1. Crear TeacherContentController con:
   - GET /teacher/content - listar contenido del teacher
   - GET /teacher/content/:id - obtener detalle
   - POST /teacher/content - crear nuevo
   - PUT /teacher/content/:id - actualizar
   - DELETE /teacher/content/:id - eliminar (soft delete)
   - POST /teacher/content/:id/clone - clonar contenido
2. Crear TeacherContentService con lógica de negocio
3. Crear DTOs de validación
4. Agregar al teacher.module.ts

CRITERIOS DE ACEPTACIÓN:
- ✅ CRUD completo funcional
- ✅ Validación de ownership (solo propio contenido)
- ✅ Soft delete implementado
- ✅ Clonar contenido funciona
- ✅ Filtrado por tipo, estado, etc.

RESTRICCIONES:
- Usar patterns existentes del módulo teacher
- Seguir DIRECTIVA-BACKEND.md
- NO modificar tabla existente
```

---

## 4. ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 3A: MVP (PARALELO)                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Agente 1         │    │ Agente 2         │              │
│  │ GAP-T002         │    │ GAP-T005         │              │
│  │ Frontend-Agent   │    │ Frontend-Agent   │              │
│  │ Alertas gestión  │    │ Selectores      │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      ▼                                      │
│              [VALIDAR MVP]                                  │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 3B: Contenido (SECUENCIAL)                            │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Agente 3         │                                      │
│  │ GAP-T003 Backend │───┐                                  │
│  │ CRUD endpoints   │   │                                  │
│  └──────────────────┘   │                                  │
│                         ▼                                   │
│                 ┌──────────────────┐                       │
│                 │ Agente 4         │                       │
│                 │ GAP-T003 Frontend│                       │
│                 │ Conectar UI      │                       │
│                 └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 3C: Gamification (SECUENCIAL)                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Agente 5         │                                      │
│  │ GAP-T004 Backend │───┐                                  │
│  │ Endpoint bonus   │   │                                  │
│  └──────────────────┘   │                                  │
│                         ▼                                   │
│                 ┌──────────────────┐                       │
│                 │ Agente 6         │                       │
│                 │ GAP-T004 Frontend│                       │
│                 │ Habilitar UI     │                       │
│                 └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 3D: Recursos (SECUENCIAL)                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Agente 7         │                                      │
│  │ GAP-T001 Database│───┐                                  │
│  │ Crear tablas     │   │                                  │
│  └──────────────────┘   │                                  │
│                         ▼                                   │
│                 ┌──────────────────┐                       │
│                 │ Agente 8         │                       │
│                 │ GAP-T001 Backend │───┐                   │
│                 │ Módulo completo  │   │                   │
│                 └──────────────────┘   │                   │
│                                        ▼                    │
│                                ┌──────────────────┐        │
│                                │ Agente 9         │        │
│                                │ GAP-T001 Frontend│        │
│                                │ UI completa      │        │
│                                └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. DECISIÓN DE ALCANCE

### Opción A: Solo MVP (P0 + P1)
- **GAPs:** GAP-T002, GAP-T005
- **Agentes:** 2 en paralelo
- **Tiempo:** 2-4 horas
- **Resultado:** 100% de páginas con funcionalidad básica

### Opción B: MVP + Fase 3 Parcial (P0 + P1 + P2)
- **GAPs:** GAP-T002, GAP-T005, GAP-T003, GAP-T004
- **Agentes:** 6 (2 paralelos + 4 secuenciales)
- **Tiempo:** 12-24 horas
- **Resultado:** Contenido y Gamificación completamente funcionales

### Opción C: Implementación Completa (Todos los GAPs)
- **GAPs:** Todos (5)
- **Agentes:** 9 (2 paralelos + 7 secuenciales)
- **Tiempo:** 32-48 horas
- **Resultado:** 100% funcionalidad en todas las páginas

---

## 6. RECOMENDACIÓN

**Recomiendo ejecutar Opción A (Solo MVP)** primero para validar el enfoque, y luego proceder con fases adicionales según necesidad del usuario.

**Razones:**
1. Menor riesgo - validamos el proceso con tareas pequeñas
2. Valor inmediato - las páginas más usadas quedan funcionales
3. Feedback temprano - podemos ajustar antes de invertir más tiempo
4. Los GAPs de Fase 3 pueden no ser prioritarios para el MVP

---

**Estado del Plan:** ✅ FASE 2 COMPLETADA
**Próxima Fase:** FASE 3 - EJECUCIÓN (pendiente decisión del usuario)
