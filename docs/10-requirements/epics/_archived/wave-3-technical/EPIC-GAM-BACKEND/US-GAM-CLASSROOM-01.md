---
titulo: "US-GAM-CLASSROOM-01: Gestion de Aula y Estudiantes"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# US-GAM-CLASSROOM-01: Gestion de Aula y Estudiantes

**Prefijo:** GAM | **Modulo:** classrooms | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** maestro responsable de una o mas aulas,
**Quiero** gestionar mis aulas, agregar estudiantes y configurar los modulos habilitados,
**Para** organizar mi trabajo docente y controlar el contenido al que acceden mis estudiantes.

---

## Criterios de Aceptacion

### Escenario 1: Ver mis aulas
**Given** un maestro autenticado con rol "teacher"
**When** accede a su dashboard de maestro
**Then** ve la lista de aulas asignadas con: nombre, grado, numero de estudiantes, modulos activos
**And** puede acceder al detalle de cada aula

### Escenario 2: Agregar estudiantes a aula
**Given** un maestro en la vista de detalle de un aula
**When** busca estudiantes por nombre o correo y los selecciona
**Then** los estudiantes se agregan al aula
**And** los estudiantes ven el aula en su dashboard
**And** heredan la configuracion de modulos del aula

### Escenario 3: Configurar modulos por aula
**Given** un maestro que quiere activar solo los Modulos 1 y 2 para su aula de 3er grado
**When** accede a la configuracion del aula y desactiva Modulos 3, 4, 5
**Then** los estudiantes de esa aula solo ven ejercicios de Modulos 1 y 2
**And** la configuracion no afecta a otras aulas del mismo tenant

---

## Definition of Done

- [ ] CRUD de aulas funciona correctamente
- [ ] Asignacion de estudiantes a aulas
- [ ] Configuracion de modulos por aula
- [ ] Dashboard de maestro con vista de aulas
- [ ] RLS: maestro solo ve aulas de su tenant
- [ ] Tests de integracion para flujo completo
