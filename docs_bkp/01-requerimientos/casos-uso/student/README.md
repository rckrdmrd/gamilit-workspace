# Casos de Uso - Student

**Total casos de uso:** 3
**Archivo original:** STUDENT-USE-CASES.md (2,238 líneas) - Modularizado
**Fecha modularización:** 2025-11-01

## Índice

| ID | Caso de Uso | Archivo | Líneas |
|---|---|---|---|
| UC-STU-001 | Registro de nuevo estudiante | [UC-STU-001-registro.md](./UC-STU-001-registro.md) | 664 |
| UC-STU-002 | Onboarding y tutorial inicial | [UC-STU-002-onboarding.md](./UC-STU-002-onboarding.md) | 583 |
| UC-STU-003 | Seleccionar y resolver ejercicio | [UC-STU-003-resolver-ejercicio.md](./UC-STU-003-resolver-ejercicio.md) | 1008 |

## Descripción

Este directorio contiene los casos de uso principales para el rol **Student** en la plataforma GAMILIT. Los estudiantes son los usuarios principales del sistema, interactuando con contenido educativo gamificado sobre Marie Curie a través de 5 módulos de comprensión lectora con 33 mecánicas educativas implementadas.

El sistema utiliza:
- Rangos inspirados en la cultura Maya
- Economía de ML Coins
- Power-ups
- Achievements y misiones
- Leaderboards

## Casos de Uso

### UC-STU-001: Registro de nuevo estudiante
Estudiante crea una cuenta nueva en la plataforma GAMILIT para acceder al contenido educativo gamificado.
- **Precondiciones:** Usuario no autenticado
- **Postcondiciones:** Usuario registrado con 50 ML Coins de bienvenida, rango 'nacom' asignado
- **Actores:** Student (no autenticado), Sistema de Notificaciones, Sistema de Gamificación

### UC-STU-002: Onboarding y tutorial inicial
Estudiante nuevo completa el flujo de onboarding interactivo para aprender las mecánicas básicas de la plataforma.
- **Precondiciones:** Usuario registrado, primer login exitoso
- **Postcondiciones:** Tutorial completado, 20 ML Coins de recompensa, achievement "Explorador Maya" desbloqueado
- **Actores:** Student (autenticado), Sistema de Gamificación, Sistema de Tutorial

### UC-STU-003: Seleccionar y resolver ejercicio
Estudiante selecciona un ejercicio de comprensión lectora del catálogo y lo resuelve para ganar puntos, ML Coins y avanzar en su progreso.
- **Precondiciones:** Usuario autenticado, módulo desbloqueado
- **Postcondiciones:** Ejercicio completado, recompensas otorgadas, progreso actualizado
- **Actores:** Student (autenticado), Sistema de Gamificación, Sistema de Ejercicios

## Notas

**Sobre el límite de 400 líneas:**
Cada caso de uso en este proyecto está documentado de forma muy detallada siguiendo un formato estandarizado de 15 secciones (Descripción, Actores, Precondiciones, Postcondiciones, Flujos Principal/Alternativos/Excepción, Requisitos No Funcionales, Reglas de Negocio, Trazabilidad, Diagramas, Mockups, Criterios de Aceptación, Notas y Historial).

Esta documentación exhaustiva hace que cada caso de uso supere las 400 líneas. Subdividir un caso de uso individual en múltiples archivos rompería la coherencia y usabilidad de la documentación. Por lo tanto, cada caso de uso se mantiene como una unidad completa en un solo archivo.

**Migración RFC-0001:**
- **Micro-microciclo:** 1-2-2
- **Estado:** Completado
- **Archivo original preservado:** STUDENT-USE-CASES.md.backup

## Ver también
- [Documentación de requerimientos](../../README.md)
- [Casos de uso Teacher](../teacher/)
- [Casos de uso Admin](../admin/)
