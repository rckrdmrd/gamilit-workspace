# _MAP: docs/01-requerimientos/teacher-portal/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales del portal de maestros (gestión de aulas, tareas, calificaciones, analytics)
**Audiencia:** Product Owners, Desarrolladores Frontend/Backend, Maestros (usuarios finales)
**Estado:** 🟡 En desarrollo activo

---

## 📁 Contenido de esta Carpeta

### Documentos Principales

| Documento | Descripción | Estado | Prioridad |
|-----------|-------------|--------|-----------|
| [README.md](./README.md) | Índice general del portal de maestros | ✅ Completo | - |
| [REQUERIMIENTOS-TEACHER-PORTAL.md](./REQUERIMIENTOS-TEACHER-PORTAL.md) | Documento consolidado de requerimientos | ✅ Completo | Alta |

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| REQ-TEACHER-001 | Gestión de Aulas (Classrooms) | [REQ-TEACHER-CLASSROOMS.md](./REQ-TEACHER-CLASSROOMS.md) | ✅ Implementado | Alta |
| REQ-TEACHER-002 | Asignación de Tareas | [REQ-TEACHER-ASSIGNMENTS.md](./REQ-TEACHER-ASSIGNMENTS.md) | ✅ Implementado | Alta |
| REQ-TEACHER-003 | Calificación y Progreso | [REQ-TEACHER-GRADING-PROGRESS.md](./REQ-TEACHER-GRADING-PROGRESS.md) | ✅ Implementado | Alta |
| REQ-TEACHER-004 | Analytics y Reportes | [REQ-TEACHER-ANALYTICS.md](./REQ-TEACHER-ANALYTICS.md) | 🟡 En desarrollo | Media |

**Total requerimientos:** 4

---

## 🔗 Interdependencias

### Módulos Relacionados

**Depende de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Rol `admin_teacher`, autenticación
- [03-contenido-educativo](../03-contenido-educativo/) - Ejercicios que se asignan
- [04-progreso-seguimiento](../04-progreso-seguimiento/) - Tracking de progreso de estudiantes
- [02-gamificacion](../02-gamificacion/) - Visualización de logros de estudiantes

**Usado por:**
- Maestros (usuarios finales)
- [Admin Portal](../admin-portal/) - Gestión de maestros y permisos

### Documentación Relacionada

**Especificaciones Técnicas:**
- [APIs Teacher Portal](../../02-especificaciones-tecnicas/apis/TEACHER-PORTAL-API.md)
- [Autenticación](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/)

**Desarrollo:**
- Backend: `apps/backend/src/modules/teacher/`
- Frontend: `apps/frontend/src/features/teacher/`

**Database:**
- Schema: `auth_management` (roles, profiles)
- Schema: `educational_content` (classrooms, assignments)
- Schema: `progress_tracking` (student progress)

---

## 📊 Métricas

- **Total documentos:** 6
- **RFs completos:** 3/4 (75%)
- **RFs implementados:** 3/4 (75%)
- **Cobertura implementación:** 85%

---

## 🎯 Funcionalidades Clave del Portal

### 1. Gestión de Aulas (REQ-TEACHER-001)
- Crear, editar, archivar aulas
- Agregar/remover estudiantes
- Códigos de invitación
- Gestión de co-maestros

### 2. Asignación de Tareas (REQ-TEACHER-002)
- Asignar ejercicios a aulas/estudiantes
- Configurar fechas límite
- Tareas individuales vs grupales
- Programación de tareas

### 3. Calificación y Progreso (REQ-TEACHER-003)
- Visualización de entregas
- Calificación manual/automática
- Feedback a estudiantes
- Reportes de progreso individual

### 4. Analytics y Reportes (REQ-TEACHER-004) 🟡
- Dashboard de métricas de aula
- Reportes de rendimiento
- Identificación de estudiantes en riesgo
- Exportación de datos

---

## 🚀 Próximos Pasos

### En Desarrollo
- [ ] Completar analytics avanzados (REQ-TEACHER-004)
- [ ] Agregar referencias a implementación en todos los documentos

### Planeado (Futuras Extensiones)
- [ ] REQ-TEACHER-005: Sistema de Mensajería con Estudiantes
- [ ] REQ-TEACHER-006: Biblioteca de Recursos Educativos
- [ ] REQ-TEACHER-007: Generación de Exámenes con IA

---

## ⚠️ Issues Conocidos

- [ ] **REQ-TEACHER-ANALYTICS.md** - Falta sección de referencias a implementación
- [ ] **REQ-TEACHER-ASSIGNMENTS.md** - Falta sección de referencias a implementación
- [ ] **REQ-TEACHER-CLASSROOMS.md** - Falta sección de referencias a implementación
- [ ] **REQ-TEACHER-GRADING-PROGRESS.md** - Falta sección de referencias a implementación

---

## 📚 Recursos Adicionales

**Wireframes:**
- [Interfaces Teacher Portal](../interfaces/) (cuando exista)

**User Stories:**
- [Casos de Uso Teacher](../casos-uso/) (cuando exista)

**Testing:**
- [Testing Strategy Teacher Portal](../../02-especificaciones-tecnicas/testing-strategy/) (cuando exista)
