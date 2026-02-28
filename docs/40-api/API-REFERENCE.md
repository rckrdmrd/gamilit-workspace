---
titulo: "API Reference - GAMILIT"
tipo: api
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# API Reference - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Total Endpoints:** 914
**Base URL:** http://localhost:3006 (dev) | https://api.gamilit.com (prod)
**Auth:** JWT Bearer Token
**Format:** JSON

> **Nota:** Este documento cubre ~669 de 914 endpoints totales (incluyendo ~159 del modulo Admin, ~141 Social, ~103 Content, ~42 LTI, ~18 Assignments, +32 Notifications Extended). Para el inventario completo, consultar orchestration/inventarios/BACKEND_INVENTORY.yml

---

## Trazabilidad de Flujos End-to-End

Para validar los endpoints dentro de procesos funcionales completos (UI -> API -> datos), ver:

- [docs/30-ux-ui/flujos/README.md](../30-ux-ui/flujos/README.md)
- [docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md](../30-ux-ui/flujos/TRACEABILITY-MATRIX.md)
- [docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md](../30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md)
- [docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md](../30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md)
- [ENDPOINTS-INVENTORY-EQUIP.md](./ENDPOINTS-INVENTORY-EQUIP.md)

> Nota de cobertura total (2026-02-17): los endpoints del portal `parents/*` quedaron trazados y planificados en la oleada full.
> La consolidacion completa del contrato API de parents se gestiona en:
> `orchestration/tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/02-PLAN-IMPLEMENTACION-ISSUES.md` (`ISSUE-FULL-PLAN-001`).

---

## Autenticacion

Todos los endpoints (excepto login/register) requieren un header de autorizacion:
```
Authorization: Bearer <jwt_token>
```

---

## Secciones

| Archivo | Contenido | Endpoints |
|---------|-----------|-----------|
| [Auth, Users & Tenants](api-reference/01-AUTH-USERS-TENANTS.md) | Auth, Users, Profile, Tenants | ~103 |
| [Educational](api-reference/02-EDUCATIONAL.md) | Modules, Exercises, Validation | ~91 |
| [Gamification](api-reference/03-GAMIFICATION.md) | Gamification, Achievements, Social | ~234 |
| [Classrooms, Students & Teachers](api-reference/04-CLASSROOMS-STUDENTS-TEACHERS.md) | Classrooms, Students, Teachers | ~85 |
| [Support](api-reference/05-SUPPORT.md) | Parents, Analytics, Content, Notifications, Reports, Settings, Health, Core | ~229 |
| [Admin, LTI & Assignments](api-reference/06-ADMIN-LTI-ASSIGNMENTS.md) | Admin, LTI, Assignments | ~219 |
| [Infrastructure](api-reference/07-INFRASTRUCTURE.md) | WebSocket, Errors, Rate Limiting, Swagger | -- |

> **Total Endpoints:** 914 (activos) + 58 condicionales (ETL + ML + Visualization, requieren `ENABLE_DATA_WAREHOUSE=true`)

---

*GAMILIT - API Reference Hub*
*914 endpoints | 23 modulos + Admin + LTI + Assignments | JWT Auth | Socket.IO Real-time*
