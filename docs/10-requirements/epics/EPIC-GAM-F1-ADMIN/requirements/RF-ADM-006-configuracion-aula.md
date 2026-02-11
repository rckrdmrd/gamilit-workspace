---
id: "RF-ADM-006"
title: "Configuracion Basica de Aula"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Configuracion Basica de Aula

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ADM-006 |
| Modulo | Admin Base |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-005 |

## Descripcion

El sistema debe permitir a los profesores configurar aspectos basicos de su aula como fechas de inicio/fin, visibilidad de modulos, y opciones de gamificacion para controlar la experiencia de sus estudiantes. Las configuraciones son simples (on/off, fechas, valores basicos). No incluye configuracion avanzada por modulo, parametrizacion de gamificacion, ni reglas personalizadas (eso va a EXT-001).

## Requerimiento Funcional

- **RF-ADM-006.1:** Configurar fechas de inicio y fin del aula, con validacion de que la fecha de fin es posterior a la de inicio. El aula se activa/desactiva automaticamente segun las fechas.
- **RF-ADM-006.2:** Configurar visibilidad de modulos: toggles on/off para mostrar u ocultar modulos educativos individuales para los estudiantes del aula.
- **RF-ADM-006.3:** Configurar opciones basicas de gamificacion: habilitar/deshabilitar leaderboard del aula, mostrar/ocultar XP y monedas, y activar/desactivar notificaciones de logros.
- **RF-ADM-006.4:** Configurar codigo de acceso del aula para que nuevos estudiantes se unan, con opcion de regenerar el codigo y establecer si la inscripcion requiere aprobacion del maestro.
- **RF-ADM-006.5:** Persistir todas las configuraciones en BD (tabla social_features.classroom_settings o campos en classrooms) con valores por defecto sensatos para aulas nuevas.

## Criterios de Aceptacion

- [ ] AC-001: Las fechas de inicio/fin se configuran con validacion correcta
- [ ] AC-002: Los toggles de visibilidad de modulos funcionan inmediatamente para estudiantes
- [ ] AC-003: Las opciones de gamificacion se reflejan en la experiencia del estudiante
- [ ] AC-004: El codigo de acceso se genera y regenera correctamente
- [ ] AC-005: Los valores por defecto se aplican automaticamente a aulas nuevas

## Referencias

- **User Story:** US-ADM-006
- **Especificacion:** ET-ADM-006
- **EPIC:** EAI-005
