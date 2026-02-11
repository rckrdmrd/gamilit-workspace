---
id: "RF-PAR-004"
title: "Data Model"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_portal"
epic: "EXT-011"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Data Model

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-004 |
| Modulo | parent_portal |
| Prioridad | Alta |
| Status | Partial (25%) |
| EPIC | EXT-011 |

## Descripcion

El sistema debe implementar el modelo de datos para el portal de padres: relacion padre-hijo (parent_student_link), autenticacion de padres con permisos especificos, soporte multi-hijo, y vinculacion segura mediante codigo de invitacion generado por el maestro o administrador.

## Requerimiento Funcional

- **RF-PAR-004.1:** Tabla parent_student_link con relacion N:N entre padres y estudiantes, con estado y permisos.
- **RF-PAR-004.2:** Autenticacion de padres con rol 'parent' y permisos de solo lectura sobre datos del hijo.
- **RF-PAR-004.3:** Codigo de invitacion unico generado por maestro/admin para vincular padre con estudiante.
- **RF-PAR-004.4:** Soporte multi-hijo: un padre puede tener multiples estudiantes vinculados.
- **RF-PAR-004.5:** Proceso de verificacion de vinculacion con aprobacion del maestro.

## Criterios de Aceptacion

- [x] AC-001: Tabla parent_student_link creada con DDL y entity TypeORM.
- [ ] AC-002: Codigo de invitacion generado y consumible una sola vez.
- [ ] AC-003: Rol parent con permisos de solo lectura sobre progreso del hijo.
- [ ] AC-004: Multi-hijo funcional: padre ve selector de hijos en dashboard.

## Referencias

- **User Story:** US-PP-001
- **Especificacion:** ET-PARPORT-001
- **EPIC:** EXT-011
