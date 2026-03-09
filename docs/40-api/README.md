---
titulo: "API Documentation - GAMILIT"
tipo: readme
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# API Documentation - GAMILIT

Documentacion de APIs del proyecto.

---

## Contenido

| Documento | Descripcion |
|-----------|-------------|
| [API-REFERENCE.md](API-REFERENCE.md) | ~915 endpoints organizados por modulo (7 archivos por dominio en `api-reference/`) |
| [ENDPOINTS-INVENTORY-EQUIP.md](ENDPOINTS-INVENTORY-EQUIP.md) | Contratos API de equipamiento cosmetico |
| [WEB-PUSH-MIGRATION.md](WEB-PUSH-MIGRATION.md) | Guia de migracion Web Push notifications |

> **Vistas por portal**: Ver `docs/60-portals/{portal}/PORTAL-*-API-REFERENCE.md` para APIs por consumidor.

---

## Quick Reference

**Base URL:** http://localhost:3006 (dev)
**Auth:** JWT Bearer Token
**Total Endpoints:** 915
**WebSocket:** Socket.IO (3 namespaces)
**Swagger:** http://localhost:3006/api-docs

---

## API Documentation Gap

> **NOTE (2026-03-09):** This directory contains only 14 documentation files (7 domain-specific API reference docs + supporting files) covering ~915 real backend endpoints. The documentation provides a high-level overview organized by domain (auth, educational, gamification, etc.) but does not include per-endpoint contract details (request/response schemas, error codes, examples) for the majority of endpoints. Expanding API documentation to include full endpoint contracts is a priority work item. See `orchestration/PROXIMA-ACCION.md` for tracking.

---

*GAMILIT - API Documentation*
