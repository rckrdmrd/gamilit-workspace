# Code Map - M-AUD

**Última actualización:** 2025-11-07
**Total de objetos:** 11

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-AUD-FN-LOG-AUDIT-EVENT` | function | `log_audit_event` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/functions/log_audit_event.sql` | 73 |
| `OBJ-DB-AUD-UNKN-01-POLICIES` | unknown | `01-policies` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policies/01-policies.sql` | 166 |
| `OBJ-DB-AUD-IDX-AUDIT-LOGS` | index | `audit_logs` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql` | 125 |
| `OBJ-DB-AUD-IDX-PERFORMANCE-METRICS` | index | `performance_metrics` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/02-performance_metrics.sql` | 103 |
| `OBJ-DB-AUD-TRG-SYSTEM-ALERTS` | trigger | `system_alerts` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql` | 135 |
| `OBJ-DB-AUD-IDX-SYSTEM-LOGS` | index | `system_logs` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql` | 116 |
| `OBJ-DB-AUD-IDX-USER-ACTIVITY-LOGS` | index | `user_activity_logs` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql` | 120 |
| `OBJ-DB-AUD-IDX-FOR` | index | `for` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/06-user_activity.sql` | 25 |
| `OBJ-DB-AUD-TRG-TRG-SYSTEM-ALERTS-UPDATED-AT` | trigger | `trg_system_alerts_updated_at` | audit_logging | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/triggers/01-trg_system_alerts_updated_at.sql` | 15 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-AUD-SVC-AUDIT-SERVICE` | service | `audit.service` | `audit/services/audit.service.ts` |
| `OBJ-BE-AUD-ENT-AUDIT-LOG-ENTITY` | entity | `audit-log.entity` | `audit/entities/audit-log.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|