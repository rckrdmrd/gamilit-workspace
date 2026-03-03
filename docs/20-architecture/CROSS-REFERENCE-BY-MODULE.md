---
tipo: vista-derivada
ssot: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml
fecha: "2026-03-03"
---

# Cross-Reference por Modulo Backend

> Vista derivada. SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml

Mapeo de los 23 modulos backend con sus schemas, metricas de implementacion, flujos referenciados y estado.

## Modulos de Dominio (15)

| Modulo | Schemas | Entities | Services | Controllers | Endpoints | Flows | Status |
|--------|---------|----------|----------|-------------|-----------|-------|--------|
| **auth** | auth, auth_management | 18 | 6 | 3 | 29 | FL-AUTH-01/02/03, FL-SHR-01/02, FL-STU-05, FL-TCH-06/14, FL-ADM-01, FL-SYS-04/05 | 100% |
| **admin** | audit_logging, admin_dashboard, system_configuration | 16 | 22 | 21 | 158 | FL-ADM-01/02/03/04/06/09/10/11/12/13/15/16/17/18/19/20/21/22, FL-SHR-03, FL-SYS-05 | 90% |
| **educational** | educational_content | 16 | 7 | 5 | 51 | FL-STU-01/06/15, FL-ADM-07, FL-SYS-02 | 95% |
| **gamification** | gamification_system | 22 | 19 | 12 | 73 | FL-STU-03/04/06/07/08/13/19/20/21, FL-ADM-08, FL-TCH-11, FL-SYS-03 | 95% |
| **social** | social_features | 26 | 13 | 13 | 135 | FL-STU-09/10/14, FL-TCH-04/09, FL-ADM-18 | 60% |
| **progress** | progress_tracking | 20 | 13 | 6 | 59 | FL-STU-01/02/06/13/16, FL-TCH-01/10, FL-ADM-17, FL-SYS-02 | 90% |
| **content** | content_management | 10 | 10 | 10 | 102 | FL-TCH-05, FL-ADM-03 | 95% |
| **notifications** | notifications, gamification_system | 7 | 12 | 8 | 46 | FL-STU-05/11/12/18, FL-TCH-03/15/16, FL-PRN-03, FL-ADM-13/14 | 90% |
| **teacher** | educational_content, progress_tracking, social_features, communication | 9 | 21 | 10 | 117 | FL-STU-02, FL-TCH-01/02/03/04/05/07/08/09/10/11/12/13/14/17, FL-SYS-02 | 95% |
| **parents** | auth_management | 0 | 7 | 2 | 17 | FL-PRN-01/02/03/04/05/06/07 | 100% |
| **profile** | auth_management | 0 | 1 | 1 | 3 | FL-SHR-01, FL-STU-18 | 100% |
| **audit** | audit_logging | 3 | 1 | 0 | 0 | FL-ADM-06 | 100% |
| **assignments** | educational_content | 4 | 1 | 2 | 19 | FL-STU-17, FL-TCH-02, FL-ADM-19 | 95% |
| **communication** | communication | 2 | 0 | 0 | 0 | FL-TCH-07, FL-PRN-03 | 20% |
| **lti** | lti_integration | 3 | 5 | 5 | 42 | FL-ADM-05 | 75% |

## Modulos de Infraestructura (8)

| Modulo | Schemas | Entities | Services | Controllers | Endpoints | Flows | Status | Nota |
|--------|---------|----------|----------|-------------|-----------|-------|--------|------|
| **health** | — | 0 | 2 | 1 | 4 | FL-ADM-04 | 100% | Health checks |
| **tasks** | — | 0 | 5 | 0 | 0 | — | 100% | CRON jobs: achievements, materialized views, missions, notifications |
| **websocket** | — | 0 | 2 | 0 | 0 | — (indirecto FL-TCH-03) | 100% | Socket.IO gateway |
| **mail** | — | 0 | 1 | 0 | 0 | — | 100% | Transitivo via auth/notifications/teacher/parents/progress |
| **etl** | data_warehouse | 0 | 9 | 3 | 16 | — | 75% | Condicional (ENABLE_DATA_WAREHOUSE=true) |
| **ml** | data_warehouse | 0 | 13 | 3 | 21 | — | 50% | Condicional (ENABLE_DATA_WAREHOUSE=true) |
| **visualization** | data_warehouse | 0 | 4 | 4 | 21 | — | 50% | Condicional (ENABLE_DATA_WAREHOUSE=true) |

## Totales

| Metrica | Valor |
|---------|-------|
| Total modulos | 23 (15 dominio + 8 infraestructura) |
| Total entities | 156 files (157 classes) |
| Total services | 173 |
| Total controllers | 109 |
| Total endpoints | 915 |

---

*Generado: 2026-03-03 | SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml*
