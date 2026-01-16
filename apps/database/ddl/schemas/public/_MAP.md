# _MAP: public/

**Ultima actualizacion:** 2026-01-14
**Estado:** RESERVADO (vacio intencionalmente)
**Tipo:** System/PostgreSQL Core
**Objetos activos:** 0

---

## Proposito

Schema reservado para objetos del core de PostgreSQL y extensiones del sistema.
**NO debe contener objetos propios de la aplicacion GAMILIT.**

**Audiencia:** DBAs, Arquitectos de BD

---

## Estructura

```
ddl/schemas/public/
└── _MAP.md          # Este archivo (documentacion)
```

**Total objetos DDL:** 0 (schema vacio por diseño)

---

## Politica de Arquitectura

Todos los objetos propios de GAMILIT deben ubicarse en schemas especificos:

| Categoria | Schemas |
|-----------|---------|
| **Auth Core** | auth, storage |
| **Application** | auth_management, system_configuration |
| **Domain** | educational_content, gamification_system, progress_tracking, social_features, content_management |
| **Integration** | audit_logging, admin_dashboard, lti_integration, notifications, communication |
| **Utilities** | gamilit |

---

## Historia de Migraciones

| Fecha | Objeto | Destino | Razon |
|-------|--------|---------|-------|
| 2025-11-11 | assignment_submission_stats | admin_dashboard | Vista analitica |
| 2025-11-11 | classroom_overview | admin_dashboard | Vista analitica |
| 2025-11-11 | number_series | gamilit | Vista utilitaria |

---

## Referencia

- `create-database.sh` Fase 15 - public schema comentado intencionalmente
- `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` - Prohibe objetos en public

---

**Mantenido por:** Database Team
**Version:** 2.0
