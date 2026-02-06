---
id: "RF-AE-011"
title: "Audit Logs Viewer"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_audit"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Audit Logs Viewer

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-011 |
| Modulo | admin_audit |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe proporcionar un visor de logs de auditoria que permita a los administradores consultar todas las acciones registradas en el sistema. Soporta rutas canonicas y alias para compatibilidad con frontend, con filtros por tipo de accion, usuario, fecha y nivel de severidad.

## Requerimiento Funcional

- **RF-AE-011.1:** Listar logs de auditoria con paginacion y filtros multiples.
- **RF-AE-011.2:** Filtrar por tipo de accion, usuario, rango de fechas y nivel de severidad.
- **RF-AE-011.3:** Soportar ruta canonica /admin/system/audit-log y alias /admin/logs.
- **RF-AE-011.4:** Mostrar metadata completa de cada log: accion, usuario, IP, timestamp, detalles.
- **RF-AE-011.5:** Ambas rutas delegaran al mismo servicio AdminSystemService.getAuditLog().

## Criterios de Aceptacion

- [x] AC-001: GET /admin/logs y GET /admin/system/audit-log retornan datos identicos.
- [x] AC-002: Filtros por fecha, usuario y tipo de accion funcionan correctamente.
- [x] AC-003: Paginacion funcional con page y limit.
- [x] AC-004: Cada log incluye accion, usuario, IP, timestamp y detalles.

## Referencias

- **User Story:** US-AE-011
- **Especificacion:** ET-ADM-005-audit-logs
- **EPIC:** EXT-002
