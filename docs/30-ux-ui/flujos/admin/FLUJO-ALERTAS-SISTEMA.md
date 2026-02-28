---
title: Gestion de Alertas del Sistema
category: admin
id: FL-ADM-15
version: 1.0.0
last_updated: 2026-02-27
---

# FL-ADM-15 - Gestion de Alertas del Sistema

**ID:** FL-ADM-15
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Admin
**Prioridad:** P1

---

## 1. Resumen

Flujo de la pagina `/admin/alerts` donde el super_admin gestiona las alertas del sistema. Muestra estadisticas agregadas (por estado y severidad), lista paginada de alertas con filtros avanzados (severidad, estado, tipo, rango de fechas) y acciones sobre alertas: reconocer (acknowledge), resolver (con nota de resolucion) y suprimir (falso positivo). El admin tambien puede crear alertas manuales. Los estados de alerta son: open → acknowledged → resolved (o suppressed). Todos los endpoints estan implementados en `AdminAlertsController`.

---

## 2. Precondiciones

- Usuario autenticado con rol `super_admin`.
- Sesion activa con JWT valido.
- Servicio de alertas activo.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Admin navega a /admin/alerts] --> B[AdminAlertsPage monta]
    B --> C[useAlerts hook]
    C --> D[GET /admin/alerts/stats/summary]
    C --> E[GET /admin/alerts con filtros default]
    D --> F[AlertsStats renderiza contadores]
    E --> G[AlertsList renderiza lista paginada]

    G --> H{Accion sobre alerta?}
    H -- Click detalle --> I[AlertDetailsModal abre]
    I --> J[GET /admin/alerts/:id]

    H -- Acknowledge --> K[AcknowledgeAlertModal abre]
    K --> L[PATCH /admin/alerts/:id/acknowledge { acknowledgment_note }]
    L --> M[Alerta: open -> acknowledged]

    H -- Resolve --> N[ResolveAlertModal abre]
    N --> O[PATCH /admin/alerts/:id/resolve { resolution_note }]
    O --> P[Alerta: open|acknowledged -> resolved]

    H -- Suppress --> Q[ConfirmDialog abre]
    Q --> R[PATCH /admin/alerts/:id/suppress]
    R --> S[Alerta: -> suppressed]

    B --> T[AlertFilters - filtros avanzados]
    T --> U{Filtros cambian?}
    U -- Si --> V[GET /admin/alerts?severity=&status=&type=&date_from=&date_to=]
    V --> G

    B --> W[Boton crear alerta manual]
    W --> X[POST /admin/alerts { type, severity, message }]
    X --> Y[Nueva alerta en lista]
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga inicial ===
1. FE: AdminAlertsPage monta -> useAlerts hook inicializa
2. FE: GET /api/v1/admin/alerts/stats/summary
3. BE: AdminAlertsController.getAlertsStats()
4. BE: AdminAlertsService -> COUNT GROUP BY status, COUNT GROUP BY severity
5. DB: SELECT FROM audit_logging.system_alerts (o tabla de alertas dedicada)
6. BE: Retorna { byStatus: {open, acknowledged, resolved, suppressed}, bySeverity: {critical, high, medium, low},
                 last24h, last7d, avgResolutionTimeMinutes }
7. FE: AlertsStats renderiza contadores

8. FE: GET /api/v1/admin/alerts?page=1&limit=20
9. BE: AdminAlertsController.listAlerts(query)
10. BE: AdminAlertsService.listAlerts() -> ORDER BY severity DESC, triggered_at DESC
11. DB: SELECT FROM alerts tabla con filtros y paginacion
12. BE: Retorna PaginatedAlertsDto { data: AlertResponseDto[], total, page, limit }
13. FE: AlertsList renderiza filas

=== Reconocer alerta (acknowledge) ===
14. FE: Admin click "Acknowledge" -> AcknowledgeAlertModal
15. FE: Admin escribe acknowledgment_note
16. FE: PATCH /api/v1/admin/alerts/:id/acknowledge { acknowledgment_note: '...' }
17. BE: AdminAlertsService.acknowledgeAlert(id, note, userId)
18. BE: Verifica estado == 'open' (solo alertas abiertas se pueden reconocer)
19. DB: UPDATE alerts SET status = 'acknowledged', acknowledged_by = :userId, acknowledged_at = NOW()
20. BE: Retorna alerta actualizada
21. FE: Lista actualiza estado de la alerta

=== Resolver alerta ===
22. FE: Admin click "Resolve" -> ResolveAlertModal
23. FE: Admin escribe resolution_note (obligatoria)
24. FE: PATCH /api/v1/admin/alerts/:id/resolve { resolution_note: '...' }
25. BE: Verifica estado == 'open' o 'acknowledged'
26. DB: UPDATE alerts SET status = 'resolved', resolved_by = :userId, resolved_at = NOW(), resolution_note = :note
27. FE: Lista actualiza estado

=== Suprimir alerta ===
28. FE: Admin confirma en ConfirmDialog
29. FE: PATCH /api/v1/admin/alerts/:id/suppress
30. DB: UPDATE alerts SET status = 'suppressed'
31. FE: Lista actualiza estado

=== Crear alerta manual ===
32. FE: POST /api/v1/admin/alerts { alert_type: 'manual', severity: 'high', message: '...', details: '...' }
33. BE: AdminAlertsService.createAlert(dto, userId)
34. DB: INSERT INTO alerts TABLE
35. FE: Nueva alerta aparece en lista
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx` |
| Hook | `apps/frontend/src/apps/admin/hooks/useAlerts.ts` |
| Componente stats | `apps/frontend/src/apps/admin/components/alerts/AlertsStats.tsx` |
| Componente filtros | `apps/frontend/src/apps/admin/components/alerts/AlertFilters.tsx` |
| Componente lista | `apps/frontend/src/apps/admin/components/alerts/AlertsList.tsx` |
| Modal detalles | `apps/frontend/src/apps/admin/components/alerts/AlertDetailsModal.tsx` |
| Modal acknowledge | `apps/frontend/src/apps/admin/components/alerts/AcknowledgeAlertModal.tsx` |
| Modal resolve | `apps/frontend/src/apps/admin/components/alerts/ResolveAlertModal.tsx` |
| Layout | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |
| API types | `apps/frontend/src/services/api/adminTypes.ts` |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller | `apps/backend/src/modules/admin/controllers/admin-alerts.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/admin-alerts.service.ts` |
| DTOs | `apps/backend/src/modules/admin/dto/alerts/` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla system_alerts | `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql` |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Solo super_admin | BE | JwtAuthGuard + AdminGuard |
| Acknowledge solo desde open | BE | Verifica estado antes de transicion |
| Resolve desde open o acknowledged | BE | Valida estado previo |
| resolution_note obligatoria | BE | MinLength(1) en ResolveAlertDto |
| Orden por severidad | BE | critical > high > medium > low, luego por fecha desc |
| Auditoria de acciones | BE | acknowledged_by, resolved_by registran userId del admin |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Rol insuficiente | BE | 403 | ForbiddenException |
| Alerta no encontrada | BE | 404 | NotFoundException |
| Estado invalido para transicion | BE | 400 | "Alert is not in open status" |
| resolution_note vacia | BE | 400 | BadRequestException |
| Error de red | FE | N/A | Retry button visible |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx` | Dashboard de alertas |
| Frontend Hook | `apps/frontend/src/apps/admin/hooks/useAlerts.ts` | Estado y acciones de alertas |
| Backend Controller | `apps/backend/src/modules/admin/controllers/admin-alerts.controller.ts` | 7 endpoints REST |
| Backend Service | `apps/backend/src/modules/admin/services/admin-alerts.service.ts` | Logica de negocio alertas |
| DDL system_alerts | `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql` | Tabla de alertas |

---

## 9. Referencias

- Flujo audit logs: [FL-ADM-06](./FLUJO-AUDIT-LOGS.md)
- Flujo monitoreo sistema: [FL-ADM-04](./FLUJO-MONITOREO-SISTEMA.md)
- Flujo dashboard admin: [FL-ADM-09](./FLUJO-DASHBOARD-ADMIN.md)
