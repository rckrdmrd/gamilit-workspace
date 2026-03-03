---
tipo: vista-derivada
ssot: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml
fecha: "2026-03-03"
---

# Cross-Reference por Schema

> Vista derivada. SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml

Mapeo de los 18 schemas de PostgreSQL con sus tablas, enums, modulos consumidores y flujos que los tocan.

## Schemas Activos con Tablas (14)

| Schema | Tablas | ENUMs | Modulos que lo consumen | Flujos que lo tocan |
|--------|--------|-------|-------------------------|---------------------|
| **auth** | 1 | 2 | auth | FL-AUTH-01/02/03, FL-SHR-02, FL-STU-05, FL-TCH-06, FL-ADM-01, FL-PRN-04/05 |
| **auth_management** | 17 | 3 | auth, admin, profile, parents, teacher | FL-AUTH-01, FL-SHR-01/02/03, FL-STU-05/18, FL-TCH-06/07/09/14, FL-ADM-01/06/10/20/22, FL-PRN-01/04/05/06, FL-SYS-04/05 |
| **educational_content** | 24 | 7 | educational, assignments, teacher, content | FL-STU-01/02/06/15/17, FL-TCH-02/05/10/12, FL-ADM-03/07/19, FL-SYS-02 |
| **gamification_system** | 21 | 8 | gamification, notifications | FL-AUTH-01, FL-STU-01/03/04/06/07/08/13/14/19/20/21, FL-TCH-01/04/08/11, FL-ADM-08, FL-SYS-02/03 |
| **progress_tracking** | 21 | 5 | progress, teacher | FL-STU-01/02/06/13/16, FL-TCH-01/02/03/04/08/10/12/13/17, FL-PRN-02/06/07, FL-ADM-17, FL-SYS-02 |
| **social_features** | 30 | 7 | social, assignments, teacher | FL-STU-09/10/14, FL-TCH-04/08/09, FL-ADM-18 |
| **notifications** | 7 | 0 | notifications | FL-STU-05/11/12/18, FL-TCH-03/15/16, FL-PRN-03, FL-ADM-13/14 |
| **content_management** | 10 | 4 | content | FL-TCH-05, FL-ADM-03 |
| **system_configuration** | 9 | 1 | admin | FL-ADM-02/12/21, FL-SYS-05 |
| **audit_logging** | 7 | 5 | audit, admin | FL-ADM-02/04/06/09/15 |
| **admin_dashboard** | 3 (+7 views, +3 mat. views) | 0 | admin | FL-ADM-09/11/16 |
| **data_warehouse** | 16 | 1 | etl, ml, visualization | FL-ADM-11/16 |
| **communication** | 4 | 0 | communication, teacher | FL-TCH-07, FL-PRN-03 |
| **lti_integration** | 3 | 0 | lti | FL-ADM-05 |

## Schemas de Utilidad / Placeholder (4)

| Schema | Tablas | ENUMs | Modulos | Flows | Nota |
|--------|--------|-------|---------|-------|------|
| **gamilit** | 0 | 0 | — (transitivo) | — | 37 funciones utility (now_mexico, RLS helpers). Usado transitivamente por todos via RLS |
| **optimization** | 0 | 0 | — | — | Indices de performance y triggers a traves de todos los schemas |
| **public** | 0 | 0 | — | — | Placeholder |
| **storage** | 0 | 0 | — | — | Placeholder |

## Resumen por Densidad

| Categoria | Schemas | Tablas totales | ENUMs totales |
|-----------|---------|----------------|---------------|
| Alta densidad (>15 tablas) | 4 | social_features(30) + educational_content(24) + auth_management(17) + data_warehouse(16) + progress_tracking(21) + gamification_system(21) | — |
| Media densidad (5-15 tablas) | 5 | content_management(10) + system_configuration(9) + notifications(7) + audit_logging(7) + admin_dashboard(3) | — |
| Baja densidad (<5 tablas) | 5 | auth(1) + communication(4) + lti_integration(3) + gamilit(0) + optimization(0) | — |
| Placeholders | 2 | public(0) + storage(0) | — |
| **TOTAL activo** | **18** | **173 tablas** | **42 ENUMs** |

---

*Generado: 2026-03-03 | SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml*
