# REPORTE DE ANÁLISIS: Alcances y Páginas "En Construcción" - Portal Teacher

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 1.0.0
**Severidad:** 🟡 MEDIA-ALTA

---

## 📋 TABLA DE CONTENIDO

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Páginas Identificadas en Sidebar](#páginas-identificadas-en-sidebar)
3. [Análisis de Estado por Página](#análisis-de-estado-por-página)
4. [Páginas Fuera de Alcance](#páginas-fuera-de-alcance)
5. [Funciones Incompletas Dentro de Alcance](#funciones-incompletas-dentro-de-alcance)
6. [Dependencias Críticas](#dependencias-críticas)
7. [Plan de Correcciones](#plan-de-correcciones)
8. [Recomendaciones](#recomendaciones)

---

## 🎯 RESUMEN EJECUTIVO

### Problema Identificado

El portal teacher tiene **11 páginas en el sidebar**, pero no todas están dentro del alcance MVP actual. Algunas páginas están parcialmente implementadas y dependen de endpoints backend faltantes, lo que causa **errores 404 y funcionalidades rotas**.

### Hallazgos Clave

| Métrica | Valor |
|---------|-------|
| **Total de páginas en sidebar** | 11 |
| **Páginas fuera de alcance** | 2 (18%) |
| **Páginas con funciones incompletas** | 6 (55%) |
| **Páginas completamente funcionales** | 2 (18%) |
| **Páginas parcialmente funcionales** | 1 (9%) |
| **Necesitan componente UnderConstruction** | 4 páginas adicionales |

### Estado General

- ✅ **Funcionales (2):** Dashboard, Alertas
- ⚠️ **Parcialmente funcionales (7):** Monitoreo, Asignaciones, Progreso, Analíticas, Reportes, Contenido, Gamificación
- ❌ **Fuera de alcance (2):** Comunicación, Recursos

---

## 📱 PÁGINAS IDENTIFICADAS EN SIDEBAR

**Fuente:** `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx` (líneas 190-251)

### Lista Completa (11 páginas)

| # | ID | Label | Ruta | Estado Actual |
|---|----|----|------|---------------|
| 1 | `dashboard` | Dashboard | `/teacher/dashboard` | ✅ Funcional |
| 2 | `monitoring` | Monitoreo | `/teacher/monitoring` | ⚠️ Parcial - Depende de classrooms API |
| 3 | `assignments` | Asignaciones | `/teacher/assignments` | ⚠️ Parcial - Solo lectura |
| 4 | `progress` | Progreso | `/teacher/progress` | ⚠️ Parcial - Depende de classrooms API |
| 5 | `alerts` | Alertas | `/teacher/alerts` | ✅ Funcional |
| 6 | `analytics` | Analíticas | `/teacher/analytics` | ⚠️ Parcial - Wrapper |
| 7 | `reports` | Reportes | `/teacher/reports` | ⚠️ Parcial - Fallback a mocks |
| 8 | `communication` | Comunicación | `/teacher/communication` | ❌ **FUERA DE ALCANCE** |
| 9 | `content` | Contenido | `/teacher/content` | ⚠️ Parcial - Wrapper |
| 10 | `gamification` | Gamificación | `/teacher/gamification` | ⚠️ Parcial - Wrapper |
| 11 | `resources` | Recursos | `/teacher/resources` | ❌ **FUERA DE ALCANCE** |

---

## 🔍 ANÁLISIS DE ESTADO POR PÁGINA

### 1. Dashboard ✅ FUNCIONAL

**Archivo:** `TeacherDashboardPage.tsx`

**Estado:** ✅ Completamente funcional

**Implementación:**
- Wrapper funcional con `TeacherLayout`
- Integración con `useUserGamification` hook
- Renderiza `TeacherDashboard` component interno
- Gamification data con fallback apropiado

**Funcionalidades:**
- ✅ Vista general de aulas
- ✅ Estadísticas de gamificación en header
- ✅ Métricas básicas
- ✅ Navegación funcional

**Acciones Requeridas:** Ninguna

---

### 2. Monitoreo ⚠️ PARCIAL

**Archivo:** `TeacherMonitoringPage.tsx`

**Estado:** ⚠️ Parcialmente funcional - **DEPENDE DE APIs FALTANTES**

**Problema Crítico:**
```typescript
const { classrooms, selectedClassroom, students, loading, error, selectClassroom, refresh } = useClassrooms();
```
**Endpoint faltante:** `GET /teacher/classrooms` (404)

**Funcionalidades Implementadas:**
- ✅ UI completa con filtros
- ✅ Auto-selección de primera clase
- ✅ Manejo de estados (loading, error)
- ✅ Integración con `StudentMonitoringPanel`
- ✅ Auto-refresh configurado

**Funcionalidades Rotas:**
- ❌ Carga de classrooms falla con 404
- ❌ No puede seleccionar classrooms
- ❌ `StudentMonitoringPanel` no recibe classroom válido

**Acciones Requeridas:**
1. **P0 - CRÍTICO:** Implementar endpoint `GET /teacher/classrooms`
2. Validar integración con `StudentMonitoringPanel`
3. Testing de flujo completo

---

### 3. Asignaciones ⚠️ PARCIAL

**Archivo:** `TeacherAssignmentsPage.tsx`

**Estado:** ⚠️ Parcialmente funcional - **SOLO LECTURA**

**Implementación:**
- Wrapper a componente `TeacherAssignments`
- Funcionalidad de solo lectura implementada

**Funcionalidades Implementadas:**
- ✅ Ver lista de 12 asignaciones de demostración
- ✅ Filtrar por aula y estado
- ✅ Ver detalles de asignaciones
- ✅ Ver entregas (submissions)

**Funcionalidades Faltantes (Documentadas en Manual):**
- ❌ Crear nuevas asignaciones (**US-PM-002a** - POST-MVP)
- ❌ Editar asignaciones existentes
- ❌ Eliminar asignaciones
- ❌ Duplicar asignaciones

**Dependencias Backend Faltantes:**
- ❌ `POST /teacher/assignments` (crear)
- ❌ `PUT /teacher/assignments/:id` (editar)
- ❌ `DELETE /teacher/assignments/:id` (eliminar)
- ❌ `POST /teacher/assignments/:id/duplicate` (duplicar)

**Acciones Requeridas:**
1. **OPCIÓN A:** Si está en alcance MVP → Implementar CRUD completo
2. **OPCIÓN B:** Si NO está en alcance → Agregar mensajes "Próximamente" en botones

---

### 4. Progreso ⚠️ PARCIAL

**Archivo:** `TeacherProgressPage.tsx`

**Estado:** ⚠️ Parcialmente funcional - **DEPENDE DE APIs FALTANTES**

**Problema Crítico:**
```typescript
const { classrooms, loading, error, refresh } = useClassrooms();
```
**Endpoint faltante:** `GET /teacher/classrooms` (404)

**Funcionalidades Implementadas:**
- ✅ UI completa con selector de classroom
- ✅ Dashboard de progreso (`ClassProgressDashboard`)
- ✅ Estadísticas generales calculadas
- ✅ Filtros por classroom

**Funcionalidades Rotas:**
- ❌ No puede cargar classrooms (404)
- ❌ Selector de classroom vacío
- ❌ Estadísticas no se calculan sin datos

**Acciones Requeridas:**
1. **P0 - CRÍTICO:** Implementar endpoint `GET /teacher/classrooms`
2. Validar `ClassProgressDashboard` con datos reales

---

### 5. Alertas ✅ FUNCIONAL

**Archivo:** `TeacherAlertsPage.tsx`

**Estado:** ✅ Completamente funcional

**Implementación:**
- UI completa con filtros avanzados
- Integración con `InterventionAlertsPanel`
- Sistema de priorización (crítica, alta, media, baja)
- Tipos de alertas (inactividad, bajo rendimiento, tendencias, fallos)

**Funcionalidades:**
- ✅ Filtros por prioridad y tipo
- ✅ Panel de alertas de intervención
- ✅ Sistema de detección automática
- ✅ Priorización inteligente
- ✅ Información contextual

**Acciones Requeridas:** Ninguna

---

### 6. Analíticas ⚠️ PARCIAL

**Archivo:** `TeacherAnalyticsPage.tsx`

**Estado:** ⚠️ Wrapper - Depende de implementación de `TeacherAnalytics`

**Implementación:**
- Wrapper funcional con `TeacherLayout`
- Delega toda funcionalidad a `TeacherAnalytics`

**Acciones Requeridas:**
1. Revisar `TeacherAnalytics.tsx` para identificar funcionalidades
2. Validar si usa endpoints faltantes
3. Documentar funcionalidades disponibles vs faltantes

---

### 7. Reportes ⚠️ PARCIAL

**Archivo:** `TeacherReportsPage.tsx`

**Estado:** ⚠️ Parcialmente funcional - **FALLBACK A MOCK DATA**

**Problema:**
```typescript
// Fallback con datos mock cuando API falla
const response = await fetch('/api/teacher/classrooms', { ... });
if (!classroomsResponse.ok) {
  // Usa datos mock en caso de error
}
```

**Funcionalidades Implementadas:**
- ✅ UI completa de generación de reportes
- ✅ Selector de classroom
- ✅ Selector de estudiantes
- ✅ Tipos de reportes (progress, evaluation, intervention, custom)
- ✅ Formatos de exportación (PDF, Excel, CSV)
- ✅ Lista de reportes recientes con fallback
- ✅ Estadísticas de reportes con fallback

**Funcionalidades con Fallback:**
- ⚠️ Carga de classrooms (fallback a error manejado)
- ⚠️ Carga de estudiantes (fallback a mock)
- ⚠️ Carga de reportes recientes (fallback a mock)
- ⚠️ Estadísticas (fallback a mock)

**Dependencias Backend:**
- ❌ `GET /teacher/classrooms` (404 - usa fallback)
- ❌ `GET /teacher/classrooms/:id/students` (404 - usa fallback)
- ❌ `GET /api/reports/recent` (no verificado)
- ❌ `GET /api/reports/stats` (no verificado)
- ❌ `POST /api/reports/:reportId/download` (no verificado)

**Acciones Requeridas:**
1. **P0:** Implementar `GET /teacher/classrooms`
2. **P1:** Implementar `GET /teacher/classrooms/:id/students`
3. **P2:** Implementar endpoints de reportes si están en alcance
4. **ALTERNATIVA:** Mejorar mensajes de fallback o agregar UnderConstruction

---

### 8. Comunicación ❌ FUERA DE ALCANCE

**Archivo:** `TeacherCommunicationPage.tsx`

**Estado:** ❌ **FUERA DE ALCANCE MVP**

**Implementación Actual:**
```typescript
<UnderConstruction
  title="Comunicación"
  message="Podrás comunicarte con estudiantes, padres de familia y otros profesores..."
  upcomingFeatures={[...]}
/>
```

**Funcionalidades Planificadas (POST-MVP):**
- Mensajería directa con estudiantes
- Comunicación con padres de familia
- Anuncios grupales por classroom
- Notificaciones automáticas
- Historial de comunicaciones

**Estado:** ✅ **CORRECTO** - Usa componente `UnderConstruction`

**Acciones Requeridas:** Ninguna (ya implementado correctamente)

---

### 9. Contenido ⚠️ PARCIAL

**Archivo:** `TeacherContentPage.tsx`

**Estado:** ⚠️ Wrapper - Depende de implementación de `TeacherContentManagement`

**Implementación:**
- Wrapper funcional con `TeacherLayout`
- Delega toda funcionalidad a `TeacherContentManagement`

**Estado Documentado (Manual Portal Teacher - Capítulo 8.2):**
- Estado: ⏸️ Estructura básica (30% completado)
- ✅ Ver catálogo de ejercicios (12 disponibles)
- ⏳ Filtrar por módulo y tipo
- ⏳ Previsualizar ejercicios
- ❌ Crear nuevos ejercicios
- ❌ Editar ejercicios existentes
- ❌ Subir recursos (imágenes, videos)

**Acciones Requeridas:**
1. Revisar `TeacherContentManagement.tsx`
2. Validar contra documentación
3. Decidir si funciones faltantes están en alcance
4. Si NO están en alcance: Agregar mensajes UnderConstruction para funciones específicas

---

### 10. Gamificación ⚠️ PARCIAL

**Archivo:** `TeacherGamificationPage.tsx`

**Estado:** ⚠️ Wrapper - Depende de implementación de `TeacherGamification`

**Implementación:**
- Wrapper funcional con `TeacherLayout`
- Delega toda funcionalidad a `TeacherGamification`

**Estado Documentado (Manual Portal Teacher - Capítulo 8.3):**
- Estado: ⏸️ Estructura básica
- ⏸️ Vista de solo lectura de configuración global
- ⏸️ NO permite modificaciones (solo Admin puede editar)

**Funcionalidades Planificadas:**
- Ver configuración de gamificación del sistema
- Consultar rangos Maya y umbrales
- Ver insignias disponibles
- Consultar sistema de puntos
- Ver recompensas y power-ups disponibles

**Acciones Requeridas:**
1. Revisar `TeacherGamification.tsx`
2. Validar implementación actual
3. Si faltan funcionalidades básicas de visualización → Implementar
4. Si funcionalidades de edición están fuera de alcance → Mantener como está

---

### 11. Recursos ❌ FUERA DE ALCANCE

**Archivo:** `TeacherResourcesPage.tsx`

**Estado:** ❌ **FUERA DE ALCANCE MVP**

**Implementación Actual:**
```typescript
<UnderConstruction
  title="Recursos Educativos"
  message="Gestiona y organiza materiales didácticos..."
  upcomingFeatures={[...]}
/>
```

**Funcionalidades Planificadas (POST-MVP):**
- Biblioteca de recursos educativos
- Subir y organizar materiales didácticos
- Compartir recursos con estudiantes
- Buscar recursos por materia y tema
- Favoritos y colecciones personalizadas
- Integración con Google Drive

**Estado:** ✅ **CORRECTO** - Usa componente `UnderConstruction`

**Acciones Requeridas:** Ninguna (ya implementado correctamente)

---

## 🚫 PÁGINAS FUERA DE ALCANCE

### Resumen

| Página | Ruta | Estado UnderConstruction |
|--------|------|--------------------------|
| **Comunicación** | `/teacher/communication` | ✅ Implementado |
| **Recursos** | `/teacher/resources` | ✅ Implementado |

### Componente UnderConstruction

**Ubicación:** `apps/frontend/src/shared/components/UnderConstruction.tsx`

**Uso Correcto en:**
- ✅ `TeacherCommunicationPage.tsx`
- ✅ `TeacherResourcesPage.tsx`

**Props del Componente:**
```typescript
interface UnderConstructionProps {
  title: string;
  message: string;
  upcomingFeatures: string[];
}
```

**Ejemplo de Uso:**
```typescript
<UnderConstruction
  title="Comunicación"
  message="Podrás comunicarte con estudiantes, padres..."
  upcomingFeatures={[
    'Mensajería directa con estudiantes',
    'Comunicación con padres de familia',
    ...
  ]}
/>
```

---

## ⚠️ FUNCIONES INCOMPLETAS DENTRO DE ALCANCE

### 1. Gestión de Classrooms (CRÍTICO)

**Impacto:** Afecta a 4 páginas principales

**Páginas Afectadas:**
- Monitoreo
- Progreso
- Reportes
- Contenido (posiblemente)

**Endpoint Faltante:**
```
GET /teacher/classrooms
```

**Error Actual:**
```
GET http://localhost:3006/api/v1/teacher/classrooms 404 (Not Found)
```

**Implementación Requerida:**

**Backend (`TeacherClassroomsController.ts`):**
```typescript
@Get('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async getTeacherClassrooms(@CurrentUser() user: User) {
  return this.teacherService.getClassroomsByTeacherId(user.id);
}
```

**Service (`TeacherService.ts`):**
```typescript
async getClassroomsByTeacherId(teacherId: string) {
  return this.prisma.classroom.findMany({
    where: {
      teacher_id: teacherId,
    },
    include: {
      _count: {
        select: { students: true }
      }
    }
  });
}
```

**Prioridad:** P0 - CRÍTICO

---

### 2. CRUD de Asignaciones (ALTA)

**Estado Actual:** Solo lectura (GET)

**Funcionalidades Faltantes:**
- Crear asignación
- Editar asignación
- Eliminar asignación
- Duplicar asignación

**Endpoints Faltantes:**
```
POST   /teacher/assignments          (crear)
PUT    /teacher/assignments/:id      (editar)
DELETE /teacher/assignments/:id      (eliminar)
POST   /teacher/assignments/:id/duplicate  (duplicar)
```

**Documentación:** US-PM-002a (Manual Portal Teacher, Capítulo 5.4)

**Prioridad:** P1 - ALTA (si está en alcance MVP)

**Decisión Requerida:**
- ¿CRUD de asignaciones está en alcance MVP?
- Si SÍ → Implementar endpoints
- Si NO → Agregar mensajes "Próximamente" en botones UI

---

### 3. Sistema de Calificaciones (ALTA)

**Estado Actual:** Ejercicios auto-calificados funcionan

**Funcionalidades Faltantes:**
- Calificar ejercicios de texto abierto
- Cola de calificaciones
- Interfaz de calificación avanzada
- Rúbricas personalizadas
- Feedback detallado por pregunta

**Endpoints Faltantes:**
```
GET  /teacher/grading/pending            (cola de calificaciones)
GET  /teacher/grading/:submissionId      (detalles para calificación)
POST /teacher/grading/:submissionId/feedback  (feedback)
```

**Documentación:** US-PM-003a/b (Manual Portal Teacher, Capítulo 5.5)

**Prioridad:** P1 - ALTA (si está en alcance MVP)

**Workaround Temporal:**
- Enfocarse en ejercicios auto-calificados del Módulo 1
- Exportar respuestas a Excel/CSV para calificación manual

---

### 4. Gestión de Contenido (MEDIA)

**Estado Actual:** 30% completado

**Funcionalidades Disponibles:**
- ✅ Ver catálogo de ejercicios

**Funcionalidades Faltantes:**
- ❌ Filtrar por módulo y tipo
- ❌ Previsualizar ejercicios
- ❌ Crear nuevos ejercicios
- ❌ Editar ejercicios existentes
- ❌ Subir recursos (imágenes, videos)

**Prioridad:** P2 - MEDIA (probablemente POST-MVP según manual)

**Recomendación:**
- Agregar componente `UnderConstruction` para funciones de creación/edición
- Mantener visualización del catálogo
- Indicar claramente qué funciones están disponibles

---

### 5. Analytics Avanzados (MEDIA)

**Estado Actual:** Wrapper implementado

**Funcionalidades a Validar:**
- Ver si `TeacherAnalytics.tsx` está completo
- Identificar dependencias de APIs
- Validar gráficas y métricas

**Prioridad:** P2 - MEDIA

**Acciones:**
1. Auditoría completa de `TeacherAnalytics.tsx`
2. Documentar funcionalidades disponibles
3. Identificar funciones incompletas

---

### 6. Gamificación - Vista Teacher (BAJA)

**Estado Actual:** Vista de solo lectura

**Funcionalidades Esperadas:**
- Ver configuración de gamificación
- Consultar rangos Maya
- Ver insignias disponibles
- Consultar sistema de puntos

**Prioridad:** P3 - BAJA

**Nota:** Solo visualización, edición es función de Admin portal

---

## 🔗 DEPENDENCIAS CRÍTICAS

### Endpoints Backend Faltantes (Por Prioridad)

#### P0 - CRÍTICO (Bloquea múltiples páginas)

```
❌ GET /teacher/classrooms
   Afecta: Monitoreo, Progreso, Reportes
   Severidad: CRÍTICA
   Páginas Rotas: 3

❌ GET /teacher/classrooms/:id/students
   Afecta: Monitoreo, Reportes
   Severidad: ALTA
   Páginas Rotas: 2
```

#### P1 - ALTA (Funcionalidad principal incompleta)

```
❌ POST /teacher/assignments
❌ PUT /teacher/assignments/:id
❌ DELETE /teacher/assignments/:id
❌ POST /teacher/assignments/:id/duplicate
   Afecta: Asignaciones
   Severidad: ALTA (si está en alcance MVP)
   Funcionalidad: CRUD completo

❌ GET /teacher/grading/pending
❌ GET /teacher/grading/:submissionId
❌ POST /teacher/grading/:submissionId/feedback
   Afecta: Asignaciones (calificación)
   Severidad: ALTA (si está en alcance MVP)
   Funcionalidad: Sistema de calificación
```

#### P2 - MEDIA (Mejoras y features adicionales)

```
❌ GET /api/reports/recent
❌ GET /api/reports/stats
❌ POST /api/reports/:reportId/download
   Afecta: Reportes
   Severidad: MEDIA
   Estado: Tiene fallback a mock data
```

---

## 🛠️ PLAN DE CORRECCIONES

### Fase 1: Críticas - Endpoints Bloqueantes (1-2 días)

**Objetivo:** Implementar endpoints que desbloquean múltiples páginas

**Tareas:**

1. **Implementar GET /teacher/classrooms**
   - **Backend:**
     - Crear `TeacherClassroomsController.getClassrooms()`
     - Crear `TeacherService.getClassroomsByTeacherId()`
     - RLS: Filtrar solo classrooms del teacher
     - Testing: Unit tests + E2E
   - **Validación:**
     - TeacherMonitoringPage carga classrooms
     - TeacherProgressPage carga classrooms
     - TeacherReportsPage carga classrooms

2. **Implementar GET /teacher/classrooms/:id/students**
   - **Backend:**
     - Crear `TeacherClassroomsController.getClassroomStudents()`
     - Validar que el classroom pertenece al teacher
     - RLS: Filtrar estudiantes del classroom
     - Testing: Unit tests + E2E
   - **Validación:**
     - TeacherMonitoringPage muestra estudiantes
     - TeacherReportsPage carga estudiantes

**Prioridad:** P0 - URGENTE

**Estimación:** 8-12 horas

**Responsable:** Backend-Developer

---

### Fase 2: Páginas con Funciones Parciales (3-5 días)

**Objetivo:** Completar o marcar como "En Construcción" funciones faltantes

#### Opción A: Si funciones están EN ALCANCE MVP

1. **Asignaciones CRUD**
   - Implementar endpoints POST, PUT, DELETE
   - Implementar UI de creación/edición
   - Testing completo
   - **Estimación:** 16-24 horas

2. **Sistema de Calificaciones**
   - Implementar cola de calificaciones
   - Implementar interfaz de calificación
   - Implementar rúbricas básicas
   - **Estimación:** 24-32 horas

#### Opción B: Si funciones están FUERA DE ALCANCE MVP

1. **Agregar mensajes UnderConstruction granulares**
   - Identificar botones/secciones de funciones futuras
   - Agregar tooltips o modales "Próximamente"
   - Deshabilitar botones con indicador visual
   - **Estimación:** 4-8 horas

**Prioridad:** P1 - ALTA

**Decisión Requerida:** ¿Qué funciones están en alcance MVP?

---

### Fase 3: Mejoras de UX y Fallbacks (1-2 días)

**Objetivo:** Mejorar experiencia cuando APIs fallan

**Tareas:**

1. **Mejorar Manejo de Errores en Reportes**
   - Mensajes más claros cuando API falla
   - Indicar que se están usando datos de ejemplo
   - Botón para reintentar carga

2. **Validar Analytics y Gamification**
   - Auditoría de `TeacherAnalytics.tsx`
   - Auditoría de `TeacherGamification.tsx`
   - Documentar funcionalidades disponibles
   - Agregar UnderConstruction donde aplique

3. **Validar ContentManagement**
   - Revisar `TeacherContentManagement.tsx`
   - Identificar funciones completas vs incompletas
   - Agregar indicadores visuales apropiados

**Prioridad:** P2 - MEDIA

**Estimación:** 8-12 horas

---

## 📊 RECOMENDACIONES

### 1. Decisión Inmediata Requerida

**Pregunta Crítica:** ¿Cuáles funcionalidades están en alcance MVP?

**Definir Alcance de:**
- ✅ CRUD de Asignaciones (crear, editar, eliminar)
- ✅ Sistema de Calificaciones (manual vs solo auto-calificado)
- ✅ Gestión de Contenido (crear ejercicios vs solo visualizar)
- ✅ Analytics Avanzados (qué métricas son MVP)

**Impacto:**
- Si SÍ está en alcance → Requiere 3-5 días de desarrollo adicional
- Si NO está en alcance → Requiere 1 día para agregar mensajes apropiados

---

### 2. Componente UnderConstruction Granular

**Problema Actual:**
- UnderConstruction se usa a nivel de página completa
- No hay indicadores para funciones específicas dentro de páginas parcialmente completas

**Propuesta:**
Crear componente `UnderConstructionButton` para funciones específicas:

```typescript
<UnderConstructionButton
  feature="Crear Asignación"
  estimatedDate="Enero 2026"
  tooltipMessage="Esta funcionalidad estará disponible próximamente"
/>
```

**Uso:**
```typescript
// En TeacherAssignmentsPage
<DetectiveButton disabled>
  <UnderConstructionButton feature="Crear Asignación" />
</DetectiveButton>
```

**Beneficios:**
- Usuario sabe exactamente qué funciones están disponibles
- No hay confusión sobre estado de funcionalidades
- Mejor experiencia de usuario

---

### 3. Documentación de Alcances

**Crear archivo:** `docs/teacher-portal/ALCANCES-MVP.md`

**Contenido:**
- Lista definitiva de funciones en alcance MVP
- Lista de funciones POST-MVP con fechas estimadas
- Matriz de prioridades
- Dependencias entre funciones

**Beneficios:**
- Claridad para todo el equipo
- Evita retrabajos
- Facilita comunicación con stakeholders

---

### 4. Testing E2E Crítico

**Prioridad:** Después de implementar endpoints P0

**Tests Críticos:**
```
E2E Test Suite: Teacher Portal Critical Flows

1. Teacher Login → Dashboard → Ver Classrooms
   ✅ Debe cargar classrooms sin 404

2. Teacher → Monitoreo → Seleccionar Classroom → Ver Estudiantes
   ✅ Debe cargar estudiantes del classroom

3. Teacher → Progreso → Filtrar por Classroom → Ver Métricas
   ✅ Debe mostrar métricas correctas

4. Teacher → Reportes → Seleccionar Classroom → Generar Reporte
   ✅ Debe generar reporte sin fallback a mocks
```

---

### 5. Plan de Rollout

**Recomendación:** Release incremental

**Sprint 1 (Semana actual):**
- ✅ Implementar endpoints P0 (classrooms)
- ✅ Validar páginas críticas (Monitoreo, Progreso)
- ✅ Testing E2E básico

**Sprint 2 (Próxima semana):**
- ✅ Decidir alcance de funciones P1
- ✅ Implementar o marcar como "En Construcción"
- ✅ Testing E2E completo

**Sprint 3 (2 semanas):**
- ✅ Mejoras de UX
- ✅ Documentación de usuario actualizada
- ✅ Testing de regresión

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Pre-Implementación
- [ ] Definir alcance MVP con stakeholders
- [ ] Aprobar plan de correcciones
- [ ] Asignar recursos (Backend-Developer, Frontend-Developer)

### Fase 1: Endpoints Críticos
- [ ] Implementar `GET /teacher/classrooms`
- [ ] Implementar `GET /teacher/classrooms/:id/students`
- [ ] Testing de endpoints
- [ ] Validar TeacherMonitoringPage
- [ ] Validar TeacherProgressPage
- [ ] Validar TeacherReportsPage

### Fase 2: Funciones Parciales (según alcance)
- [ ] Si en alcance: Implementar CRUD Asignaciones
- [ ] Si en alcance: Implementar Sistema Calificaciones
- [ ] Si fuera de alcance: Agregar UnderConstruction granular
- [ ] Actualizar documentación de usuario

### Fase 3: Mejoras y Validación
- [ ] Auditoría de TeacherAnalytics.tsx
- [ ] Auditoría de TeacherGamification.tsx
- [ ] Auditoría de TeacherContentManagement.tsx
- [ ] Mejorar manejo de errores y fallbacks
- [ ] Testing E2E completo

### Post-Implementación
- [ ] Documentar alcances definitivos (ALCANCES-MVP.md)
- [ ] Actualizar Manual Portal Teacher
- [ ] Actualizar trazas del proyecto
- [ ] Demo con stakeholders

---

## 📚 REFERENCIAS

**Documentación Analizada:**
- `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`
- `apps/frontend/src/apps/teacher/pages/*.tsx` (11 páginas)
- `docs/finiquito/Manual_Portal_Maestros_ACTUALIZADO.md`
- `docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-000-dashboard-maestro.md`
- `orchestration/agentes/architecture-analyst/gap-analysis-teacher-portal-2025-11-24/RESUMEN-EJECUTIVO.md`

**Inventarios:**
- `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`

**ADRs:**
- `docs/97-adr/ADR-015-centralized-api-routes-configuration.md`

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0.0
**Próxima Revisión:** Después de implementar Fase 1
