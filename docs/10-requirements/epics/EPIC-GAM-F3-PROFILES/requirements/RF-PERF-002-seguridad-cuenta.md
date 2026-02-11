---
id: "RF-PERF-002"
title: "Seguridad Cuenta"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "profiles"
epic: "EXT-004"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Seguridad Cuenta

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PERF-002 |
| Modulo | profiles |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-004 |

## Descripcion

El sistema debe permitir a los usuarios gestionar la seguridad de su cuenta: cambiar contrasena, ver sesiones activas, cerrar sesiones remotas, y configurar verificacion de dos pasos. Incluye historial de intentos de login y alertas de actividad sospechosa.

## Requerimiento Funcional

- **RF-PERF-002.1:** Cambiar contrasena con validacion de contrasena actual y requisitos de complejidad.
- **RF-PERF-002.2:** Ver sesiones activas con informacion de dispositivo, IP, navegador y ultima actividad.
- **RF-PERF-002.3:** Cerrar sesiones remotas individualmente o todas excepto la actual.
- **RF-PERF-002.4:** Ver historial de intentos de login (exitosos y fallidos) de los ultimos 30 dias.
- **RF-PERF-002.5:** Recibir alerta por email al detectar login desde dispositivo o ubicacion nueva.

## Criterios de Aceptacion

- [x] AC-001: Cambio de contrasena requiere contrasena actual y cumple politica de complejidad.
- [x] AC-002: Lista de sesiones activas muestra al menos 5 campos de informacion.
- [x] AC-003: Cierre de sesion remota invalida el token JWT inmediatamente.
- [x] AC-004: Historial de login muestra ultimos 50 intentos con resultado.

## Referencias

- **User Story:** US-PERF-002
- **Especificacion:** ET-PERF-001
- **EPIC:** EXT-004
