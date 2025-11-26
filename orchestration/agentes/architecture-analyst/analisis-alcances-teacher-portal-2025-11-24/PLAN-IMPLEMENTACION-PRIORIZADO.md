# PLAN DE IMPLEMENTACIÓN PRIORIZADO - Portal Teacher

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 1.0.0

---

## 🎯 OBJETIVO

Implementar componentes "En Construcción" y completar funcionalidades parciales del Portal Teacher para evitar enlaces rotos, errores 404 y confusión del usuario.

---

## 📊 RESUMEN DE HALLAZGOS

| Categoría | Cantidad | Acción Requerida |
|-----------|----------|------------------|
| Páginas Fuera de Alcance | 2 | ✅ Ya usan `UnderConstruction` |
| Páginas Parciales con APIs Faltantes | 4 | 🔧 Implementar endpoints P0 |
| Funciones Incompletas Dentro de Alcance | 3 | ❓ Definir alcance + Implementar o marcar |
| Páginas Funcionales | 2 | ✅ Sin acción requerida |

---

## 🚀 PLAN DE ACCIÓN PRIORIZADO

### FASE 1: ENDPOINTS CRÍTICOS (P0 - URGENTE)

**Duración:** 1-2 días
**Impacto:** Desbloquea 4 páginas
**Responsable:** Backend-Developer

#### Tareas

**1.1. Implementar GET /teacher/classrooms**

**Archivos a crear/modificar:**
- `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
- `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Implementación:**
```typescript
// Controller
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async getTeacherClassrooms(@CurrentUser() user: User) {
  return this.teacherClassroomsService.getByTeacherId(user.id);
}

// Service
async getByTeacherId(teacherId: string) {
  return this.prisma.classroom.findMany({
    where: { teacher_id: teacherId },
    include: {
      _count: { select: { students: true } }
    }
  });
}
```

**Páginas Desbloqueadas:**
- ✅ Monitoreo
- ✅ Progreso
- ✅ Reportes

**Validación:**
```bash
curl -X GET http://localhost:3006/api/v1/teacher/classrooms \
  -H "Authorization: Bearer <TOKEN>"
# Debe retornar array de classrooms, NO 404
```

---

**1.2. Implementar GET /teacher/classrooms/:id/students**

**Implementación:**
```typescript
// Controller
@Get(':id/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async getClassroomStudents(
  @Param('id') classroomId: string,
  @CurrentUser() user: User
) {
  // Validar que classroom pertenece al teacher
  await this.validateTeacherOwnsClassroom(user.id, classroomId);
  return this.teacherClassroomsService.getStudents(classroomId);
}
```

**Páginas Desbloqueadas:**
- ✅ Monitoreo (ver estudiantes)
- ✅ Reportes (selector de estudiantes)

**Validación:**
```bash
curl -X GET http://localhost:3006/api/v1/teacher/classrooms/CLASSROOM_ID/students \
  -H "Authorization: Bearer <TOKEN>"
# Debe retornar array de students
```

---

**Checklist Fase 1:**
- [ ] Implementar `GET /teacher/classrooms`
- [ ] Implementar `GET /teacher/classrooms/:id/students`
- [ ] Testing unitario de servicios
- [ ] Testing E2E de endpoints
- [ ] Validar TeacherMonitoringPage (debe cargar classrooms)
- [ ] Validar TeacherProgressPage (debe cargar classrooms)
- [ ] Validar TeacherReportsPage (debe cargar classrooms y students)
- [ ] Actualizar `DATABASE_INVENTORY.yml` si aplica

---

### FASE 2: FUNCIONES PARCIALES (P1 - ALTA)

**Duración:** 3-5 días (según alcance)
**Dependencia:** Decisión de alcance MVP
**Responsable:** Product Owner + Backend/Frontend Developers

#### 🔍 DECISIÓN REQUERIDA

**Pregunta Crítica:** ¿Las siguientes funciones están en alcance MVP?

| Función | Estimación si SÍ | Estimación si NO |
|---------|------------------|------------------|
| CRUD de Asignaciones | 16-24 horas | 2-4 horas (mensajes) |
| Sistema de Calificaciones | 24-32 horas | 2-4 horas (mensajes) |
| Gestión de Contenido | 8-12 horas | 2-4 horas (mensajes) |

---

#### OPCIÓN A: Si funciones están EN ALCANCE MVP

**2.1. Implementar CRUD de Asignaciones**

**Endpoints a implementar:**
```
POST   /teacher/assignments          (crear)
PUT    /teacher/assignments/:id      (editar)
DELETE /teacher/assignments/:id      (eliminar)
POST   /teacher/assignments/:id/duplicate  (duplicar)
```

**Frontend a implementar:**
- `CreateAssignmentModal.tsx`
- `EditAssignmentModal.tsx`
- `DeleteConfirmationModal.tsx`

**Prioridad:** P1 - ALTA
**Estimación:** 16-24 horas

---

**2.2. Implementar Sistema de Calificaciones**

**Endpoints a implementar:**
```
GET  /teacher/grading/pending
GET  /teacher/grading/:submissionId
POST /teacher/grading/:submissionId/feedback
```

**Frontend a implementar:**
- `GradingQueue.tsx`
- `GradingInterface.tsx`
- `RubricEditor.tsx`

**Prioridad:** P1 - ALTA
**Estimación:** 24-32 horas

---

#### OPCIÓN B: Si funciones están FUERA DE ALCANCE MVP

**2.1. Agregar Mensajes "En Construcción" Granulares**

**Crear componente:**
```typescript
// apps/frontend/src/shared/components/common/UnderConstructionButton.tsx
export const UnderConstructionButton: React.FC<{
  feature: string;
  estimatedDate?: string;
  tooltipMessage?: string;
}> = ({ feature, estimatedDate, tooltipMessage }) => {
  return (
    <Tooltip content={tooltipMessage || `${feature} estará disponible próximamente`}>
      <DetectiveButton disabled variant="secondary" className="opacity-60">
        <Lock className="w-4 h-4 mr-2" />
        {feature}
        {estimatedDate && (
          <span className="ml-2 text-xs">({estimatedDate})</span>
        )}
      </DetectiveButton>
    </Tooltip>
  );
};
```

**Implementar en:**
- `TeacherAssignmentsPage` (botón "Crear Asignación")
- `TeacherAssignmentsPage` (botones de editar/eliminar)
- `TeacherContentPage` (botón "Crear Ejercicio")
- `TeacherAnalyticsPage` (funciones avanzadas faltantes)

**Prioridad:** P1 - ALTA
**Estimación:** 4-8 horas

---

**Checklist Fase 2 (Opción A - SI en alcance):**
- [ ] Decidir alcance MVP con stakeholders
- [ ] Implementar endpoints de Asignaciones CRUD
- [ ] Implementar UI de Asignaciones CRUD
- [ ] Implementar endpoints de Calificaciones
- [ ] Implementar UI de Calificaciones
- [ ] Testing E2E completo
- [ ] Actualizar Manual Portal Teacher

**Checklist Fase 2 (Opción B - NO en alcance):**
- [ ] Decidir alcance MVP con stakeholders
- [ ] Crear componente `UnderConstructionButton`
- [ ] Implementar en todas las páginas afectadas
- [ ] Agregar tooltips explicativos
- [ ] Validar que mensajes son claros
- [ ] Actualizar Manual Portal Teacher

---

### FASE 3: AUDITORÍA Y MEJORAS (P2 - MEDIA)

**Duración:** 1-2 días
**Responsable:** Frontend-Developer

#### Tareas

**3.1. Auditoría de Páginas con Wrappers**

**Archivos a revisar:**
- `TeacherAnalyticsPage.tsx` → `TeacherAnalytics.tsx`
- `TeacherGamificationPage.tsx` → `TeacherGamification.tsx`
- `TeacherContentPage.tsx` → `TeacherContentManagement.tsx`

**Objetivo:**
- Identificar funcionalidades implementadas vs faltantes
- Validar que no haya errores ocultos
- Documentar estado real de cada página

**Checklist por página:**
- [ ] ¿Carga correctamente?
- [ ] ¿Usa APIs que existen?
- [ ] ¿Muestra datos reales o mocks?
- [ ] ¿Hay funciones rotas o sin implementar?
- [ ] ¿Necesita UnderConstruction granular?

---

**3.2. Mejorar Manejo de Errores en Reportes**

**Problema Actual:**
```typescript
// TeacherReportsPage.tsx usa fallback silencioso a mock data
```

**Mejora Propuesta:**
```typescript
{error && (
  <DetectiveCard variant="warning">
    <AlertCircle className="w-5 h-5 text-yellow-500" />
    <div>
      <h4 className="font-bold">Usando Datos de Ejemplo</h4>
      <p>No se pudieron cargar datos reales. Mostrando datos de demostración.</p>
      <DetectiveButton onClick={refresh}>
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </DetectiveButton>
    </div>
  </DetectiveCard>
)}
```

**Beneficio:**
- Usuario sabe que está viendo datos de ejemplo
- Puede reintentar la carga

---

**Checklist Fase 3:**
- [ ] Auditoría de `TeacherAnalytics.tsx`
- [ ] Auditoría de `TeacherGamification.tsx`
- [ ] Auditoría de `TeacherContentManagement.tsx`
- [ ] Documentar hallazgos de cada auditoría
- [ ] Mejorar manejo de errores en `TeacherReportsPage`
- [ ] Agregar UnderConstruction donde sea necesario
- [ ] Testing de flujos completos

---

## 📋 DECISIONES REQUERIDAS

### Decisión 1: Alcance MVP (URGENTE)

**Pregunta:** ¿Cuáles funcionalidades están en alcance MVP?

**Opciones:**

| Función | SÍ en MVP | NO en MVP | Impacto |
|---------|-----------|-----------|---------|
| CRUD Asignaciones | ☐ | ☐ | +16-24h vs +4h |
| Sistema Calificaciones | ☐ | ☐ | +24-32h vs +4h |
| Crear Ejercicios | ☐ | ☐ | +8-12h vs +2h |

**Responsable:** Product Owner / Tech Lead
**Fecha Límite:** Antes de iniciar Fase 2

---

### Decisión 2: Priorización de Fase 3 (OPCIONAL)

**Pregunta:** ¿Ejecutar Fase 3 antes o después del release MVP?

**Opción A:** Ejecutar ahora (Pre-release)
- ✅ Mayor calidad del MVP
- ✅ Menos sorpresas post-release
- ❌ Retrasa 1-2 días el release

**Opción B:** Ejecutar después (Post-release)
- ✅ Release más rápido
- ❌ Posibles problemas ocultos en producción

**Responsable:** Product Owner / Tech Lead
**Fecha Límite:** Fin de Fase 1

---

## 🧪 VALIDACIÓN FINAL

### Pre-Release Checklist

**Funcionalidad:**
- [ ] Todas las páginas cargan sin errores 404
- [ ] No hay enlaces rotos
- [ ] Funciones fuera de alcance muestran UnderConstruction o están deshabilitadas
- [ ] Fallbacks a mock data tienen indicadores visuales claros

**Testing:**
- [ ] E2E tests pasan para flujos críticos
- [ ] Testing manual de todas las 11 páginas del sidebar
- [ ] Validación de que no hay mensajes de error en consola

**Documentación:**
- [ ] Manual Portal Teacher actualizado
- [ ] ALCANCES-MVP.md creado
- [ ] Trazas actualizadas

**Comunicación:**
- [ ] Demo con stakeholders completada
- [ ] Funcionalidades POST-MVP comunicadas
- [ ] Roadmap de próximas features visible

---

## 📊 ESTIMACIONES TOTALES

### Escenario A: Funciones EN alcance MVP

| Fase | Duración | Responsable |
|------|----------|-------------|
| Fase 1: Endpoints Críticos | 1-2 días | Backend-Developer |
| Fase 2: Implementar Funciones | 3-5 días | Backend + Frontend |
| Fase 3: Auditoría y Mejoras | 1-2 días | Frontend-Developer |
| **TOTAL** | **5-9 días** | - |

---

### Escenario B: Funciones FUERA de alcance MVP

| Fase | Duración | Responsable |
|------|----------|-------------|
| Fase 1: Endpoints Críticos | 1-2 días | Backend-Developer |
| Fase 2: Mensajes UnderConstruction | 0.5-1 día | Frontend-Developer |
| Fase 3: Auditoría y Mejoras | 1-2 días | Frontend-Developer |
| **TOTAL** | **2.5-5 días** | - |

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Hoy (2025-11-24)

1. **[ ] Decisión de Alcance MVP** (Product Owner + Tech Lead)
   - Reunión de 30 minutos
   - Definir qué funciones están en alcance
   - Aprobar plan según Escenario A o B

2. **[ ] Asignación de Recursos** (Tech Lead)
   - Asignar Backend-Developer para Fase 1
   - Asignar Frontend-Developer para Fase 2/3
   - Estimar fechas de entrega

### Mañana (2025-11-25)

3. **[ ] Iniciar Fase 1** (Backend-Developer)
   - Implementar `GET /teacher/classrooms`
   - Testing unitario
   - Deploy a dev/staging

### Fin de Semana (2025-11-26)

4. **[ ] Completar Fase 1** (Backend-Developer)
   - Implementar `GET /teacher/classrooms/:id/students`
   - Testing E2E
   - Validar páginas desbloqueadas

### Próxima Semana (2025-11-27+)

5. **[ ] Ejecutar Fase 2** (según decisión de alcance)
6. **[ ] Ejecutar Fase 3** (según decisión de priorización)
7. **[ ] Validación Final y Release**

---

## 📞 CONTACTOS Y RESPONSABLES

| Rol | Responsable | Contacto |
|-----|-------------|----------|
| Product Owner | [NOMBRE] | [EMAIL/SLACK] |
| Tech Lead | [NOMBRE] | [EMAIL/SLACK] |
| Backend-Developer | [NOMBRE] | [EMAIL/SLACK] |
| Frontend-Developer | [NOMBRE] | [EMAIL/SLACK] |
| QA/Tester | [NOMBRE] | [EMAIL/SLACK] |

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0.0
**Próxima Actualización:** Después de Decisión de Alcance MVP
