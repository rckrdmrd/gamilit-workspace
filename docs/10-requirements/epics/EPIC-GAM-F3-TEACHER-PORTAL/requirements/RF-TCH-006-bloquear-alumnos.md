---
id: "RF-TCH-006"
title: "Bloquear o Restringir Acceso de Alumnos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Bloquear o Restringir Acceso de Alumnos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-006 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros bloquear temporalmente o restringir el acceso de un alumno a un aula especifica. El bloqueo impide que el estudiante vea contenido nuevo, entregue tareas o participe en actividades del aula. El maestro puede especificar la razon del bloqueo y la duracion. Esta funcionalidad es necesaria para gestionar conducta y situaciones disciplinarias.

## Requerimiento Funcional

- **RF-TCH-006.1:** El maestro puede bloquear a un estudiante de un aula especificando motivo (conducta, plagio, solicitud administrativa, otro) y duracion (temporal con fecha fin o indefinido).
- **RF-TCH-006.2:** Un estudiante bloqueado no puede entregar tareas, ver nuevas tareas ni acceder a contenido publicado posterior al bloqueo en esa aula.
- **RF-TCH-006.3:** El maestro puede desbloquear al estudiante en cualquier momento, restaurando su acceso completo al aula.
- **RF-TCH-006.4:** Se mantiene un registro de auditoria con todas las acciones de bloqueo/desbloqueo incluyendo maestro, fecha, motivo y duracion.

## Criterios de Aceptacion

- [ ] AC-001: El bloqueo se aplica inmediatamente y el estudiante recibe notificacion del bloqueo.
- [ ] AC-002: El estudiante bloqueado ve un mensaje informativo al intentar acceder al aula.
- [ ] AC-003: El desbloqueo restaura acceso completo incluyendo tareas pendientes cuya fecha limite no ha pasado.
- [ ] AC-004: El registro de auditoria es inmutable y accesible desde el panel de administracion.
- [ ] AC-005: Los bloqueos temporales se levantan automaticamente al cumplirse la fecha fin.

## Reglas de Negocio

- El bloqueo es por aula, no global; el estudiante mantiene acceso a otras aulas.
- Las calificaciones previas al bloqueo permanecen intactas.
- El motivo de bloqueo es obligatorio y tiene un minimo de 10 caracteres.
- Los bloqueos indefinidos requieren revision cada 30 dias por el maestro.

## Dependencias

- Tabla `user_blocks` en esquema `auth` o `classroom`.
- Politicas RLS para filtrar contenido del estudiante bloqueado.
- Servicio de auditoria para registro inmutable.

## Referencias

- **User Story:** US-PM-006
- **Especificacion:** ET-TCH-006
- **EPIC:** EXT-001
