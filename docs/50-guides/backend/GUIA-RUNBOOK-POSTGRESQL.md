---
title: "Runbook PostgreSQL para Gamilit"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL para Gamilit

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

> Este documento es la pagina principal del runbook. El contenido completo esta dividido en archivos tematicos bajo `runbook-postgresql/`.

---

## Contenido

| Archivo | Secciones | Tema |
|---------|-----------|------|
| [01-ENTORNO-MONITOREO.md](./runbook-postgresql/01-ENTORNO-MONITOREO.md) | 1-2 | Informacion del Entorno, Monitoreo de Salud |
| [02-VACUUM-INDICES.md](./runbook-postgresql/02-VACUUM-INDICES.md) | 3-4 | VACUUM y Autovacuum, Indices y Performance |
| [03-BACKUP-RESTORE.md](./runbook-postgresql/03-BACKUP-RESTORE.md) | 5 | Backup y Restore |
| [04-TROUBLESHOOTING.md](./runbook-postgresql/04-TROUBLESHOOTING.md) | 6-7 | Troubleshooting Deadlocks, RLS Debugging |
| [05-MANTENIMIENTO.md](./runbook-postgresql/05-MANTENIMIENTO.md) | 8-9 | Mantenimiento de Estadisticas, Queries de Referencia |
| [06-EMERGENCIA.md](./runbook-postgresql/06-EMERGENCIA.md) | 10, refs | Procedimientos de Emergencia, Referencias |

---

## Resumen del Entorno

| Aspecto | Dev (WSL/Windows) | Produccion (74.208.126.102) |
|---------|-------------------|----------------------------|
| Version | PostgreSQL 15 | PostgreSQL 15 |
| Database | gamilit_platform | gamilit_platform |
| Usuario App | gamilit_user | gamilit_user |
| Puerto | 5432 | 5432 |

**Schemas activos:** 16 | **Tablas:** 173 | **Politicas RLS:** 251 | **Triggers:** 68

---

## Referencias Rapidas

- `apps/database/ddl/` — Archivos DDL del proyecto
- `apps/database/scripts/recreate-database.sh` — Recrear BD desde DDL
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` — Guia de deploy
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
