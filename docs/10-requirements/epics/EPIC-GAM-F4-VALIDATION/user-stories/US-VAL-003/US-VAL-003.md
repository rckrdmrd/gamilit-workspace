---
id: "US-VAL-003"
title: "Backend API Smoke"
type: "User Story"
status: "Pendiente"
priority: "Alta"
epic: "EPIC-GAM-F4-VALIDATION"
story_points: 13
sprint: "Sprint-15"
created_date: "2026-02-10"
updated_date: "2026-02-10"
---

# US-VAL-003: Backend API Smoke

**Epica:** EPIC-GAM-F4-VALIDATION — Validacion Integral
**Sprint:** Sprint 15 | **SP:** 13 | **Prioridad:** Alta | **Estado:** Pendiente

---

## Descripcion

**Como** backend developer
**Quiero** verificar que todos los 23 modulos del backend responden correctamente
**Para** confirmar que la API esta funcional y lista para integracion

## Criterios de Aceptacion

### CA-01: Health Check
GET /health retorna 200 OK con todas las datasources conectadas

### CA-02: Auth Flow
Register → login → refresh → logout funciona end-to-end

### CA-03: Module Smoke
23/23 modulos responden con status correcto (1 endpoint por modulo)

### CA-04: WebSocket
Socket.IO handshake exitoso con autenticacion JWT

### CA-05: Multi-Tenancy
Sin X-Tenant-ID → 401, con header → 200 (RLS filtra por tenant)

## Tasks

| Task | Titulo | Subtipo |
|------|--------|---------|
| [TASK-VAL-003-F2-BACKEND](TASK-VAL-003-F2-BACKEND/) | Health check endpoint | Health |
| [TASK-VAL-003-F2-BACKEND-AUTH](TASK-VAL-003-F2-BACKEND-AUTH/) | Auth flow completo | Auth |
| [TASK-VAL-003-F2-BACKEND-SMOKE](TASK-VAL-003-F2-BACKEND-SMOKE/) | Smoke test 23 modulos | Smoke |
| [TASK-VAL-003-F2-BACKEND-WEBSOCKET](TASK-VAL-003-F2-BACKEND-WEBSOCKET/) | WebSocket handshake | WebSocket |
| [TASK-VAL-003-F2-BACKEND-TENANCY](TASK-VAL-003-F2-BACKEND-TENANCY/) | Multi-tenancy verification | Tenancy |

---

*Actualizado: 2026-02-10*
