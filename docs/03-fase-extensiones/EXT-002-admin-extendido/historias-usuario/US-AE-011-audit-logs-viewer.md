---
id: "US-AE-011"
title: "Visor de Audit Logs"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-TBD"
labels: ["admin-extendido", "audit-logs", "security", "compliance", "v2-core"]
created_date: "2025-11-29"
updated_date: "2026-01-04"
---

# HU-EP010-11: Visor de Audit Logs

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-011 |
| **Épica** | EXT-002 - Admin Extendido |
| **Título** | Visor de Audit Logs del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | ⏳ ESPECIFICADO |
| **Sprint** | Sprint TBD |
| **Duración Estimada** | 2 días |
| **Origen** | GAP-C08 (Análisis Portal Students 2025-11-29) |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** visualizar los audit logs de todas las acciones administrativas
**Para** tener trazabilidad completa de cambios, auditar acciones de otros admins, investigar incidentes de seguridad, y cumplir con requisitos de compliance

---

## Contexto del Problema

### Situación Actual
- Backend registra audit logs en tabla `audit_logging.audit_logs`
- Hook `useAuditLogs()` existe pero NO hay página que lo consuma
- AdminSettingsPage tiene placeholder para "Audit Logs" pero sin implementación
- Los logs se generan pero no hay forma de consultarlos desde UI

### Impacto del Gap
- No hay forma de auditar acciones de admins
- No se puede investigar quién hizo qué cambio
- Imposible detectar accesos no autorizados
- No cumple con requisitos básicos de compliance/auditoría

---

## Endpoints API Requeridos (3 endpoints)

```yaml
1. GET /api/admin/audit-logs
   Descripción: Lista audit logs con filtros
   Query Params:
     - actor_id: UUID (opcional) - quién realizó la acción
     - action_type: string (opcional) - tipo de acción
     - resource_type: string (opcional) - tipo de recurso afectado
     - resource_id: UUID (opcional) - recurso específico
     - date_from: ISO date (opcional)
     - date_to: ISO date (opcional)
     - page: number (default: 1)
     - limit: number (default: 50)
   Response: PaginatedResponse<AuditLog>

2. GET /api/admin/audit-logs/:id
   Descripción: Detalle completo de un audit log
   Response: AuditLogDetail (incluye old_values, new_values, metadata)

3. GET /api/admin/audit-logs/export
   Descripción: Exportar audit logs a CSV
   Query Params: mismos filtros que endpoint 1
   Response: File download (CSV)
```

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit`
**Rate Limit:** 30 req/min

---

## Tipos TypeScript

```typescript
interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  action_type: AuditActionType;
  resource_type: string;
  resource_id: string;
  resource_name?: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface AuditLogDetail extends AuditLog {
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any>;
  changes_summary: ChangeItem[];
}

interface ChangeItem {
  field: string;
  old_value: string;
  new_value: string;
}

type AuditActionType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'user.password_reset'
  | 'organization.created'
  | 'organization.updated'
  | 'content.approved'
  | 'content.rejected'
  | 'settings.updated'
  | 'gamification.parameter_updated'
  | 'report.generated'
  | 'bulk_operation.executed';
```

---

## Criterios de Aceptación

### Funcionales

| # | Criterio | Prioridad |
|---|----------|-----------|
| 1 | Página dedicada AdminAuditLogsPage con tabla de logs | P0 |
| 2 | Filtros: actor, tipo de acción, recurso, rango de fechas | P0 |
| 3 | Cada fila muestra: fecha, actor, acción, recurso, IP | P0 |
| 4 | Click en fila abre modal con detalle completo | P0 |
| 5 | Detalle muestra old_values vs new_values (diff view) | P1 |
| 6 | Exportar a CSV con filtros aplicados | P1 |
| 7 | Link en sidebar de admin (bajo Settings o sección Security) | P0 |
| 8 | Búsqueda por texto en descripción | P1 |
| 9 | Paginación: 50, 100, 200 items por página | P0 |
| 10 | Auto-refresh opcional (cada 30s) | P2 |

### No Funcionales

| # | Criterio |
|---|----------|
| 1 | Response time p95 <500ms para lista paginada |
| 2 | Solo role='super_admin' puede acceder |
| 3 | Rate limiting: 30 req/min |
| 4 | Retención de logs: 90 días mínimo |
| 5 | Export soporta hasta 50,000 registros |

---

## Componentes Frontend Requeridos

```
apps/frontend/src/apps/admin/
├── pages/
│   └── AdminAuditLogsPage.tsx               # Nueva página
├── hooks/
│   └── useAuditLogs.ts                       # Ya existe - verificar/actualizar
├── components/
│   └── audit/
│       ├── AuditLogsTable.tsx               # Tabla principal
│       ├── AuditLogDetailModal.tsx          # Modal detalle
│       ├── AuditLogsFilters.tsx             # Filtros
│       └── ChangesDiffView.tsx              # Vista de cambios
└── types/
    └── audit-logs.types.ts                   # Tipos específicos
```

---

## Backend - Archivos a Crear/Modificar

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-system.controller.ts            # MODIFICAR - agregar endpoints
├── services/
│   └── admin-system.service.ts               # MODIFICAR - agregar queries
└── dto/
    └── system/
        ├── audit-log-query.dto.ts            # Ya existe - verificar
        └── audit-log.dto.ts                  # Ya existe - verificar
```

---

## Wireframe Conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Portal > Audit Logs                           [🔄] [📥]  │
├─────────────────────────────────────────────────────────────────┤
│ Filters:                                                        │
│ [Actor ▼] [Action Type ▼] [Resource ▼] [Date From] [Date To]   │
│ [🔍 Search description...]                                      │
├─────────────────────────────────────────────────────────────────┤
│ Date/Time        │ Actor         │ Action           │ Resource │
│ ────────────────────────────────────────────────────────────────│
│ Nov 29 14:30:22  │ admin@co.com  │ user.suspended   │ User#123 │
│ Nov 29 14:25:10  │ admin@co.com  │ user.updated     │ User#456 │
│ Nov 29 13:15:45  │ super@co.com  │ settings.updated │ System   │
│ Nov 29 12:00:00  │ admin@co.com  │ content.approved │ Ex#789   │
├─────────────────────────────────────────────────────────────────┤
│ Page 1 of 45                              [< Prev] [Next >]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Definición de Hecho (DoD)

- [ ] 3 endpoints implementados en backend
- [ ] DTOs con validación
- [ ] AdminAuditLogsPage funcional
- [ ] Hook useAuditLogs actualizado
- [ ] Filtros y búsqueda funcionando
- [ ] Modal de detalle con diff view
- [ ] Export a CSV funcionando
- [ ] Integración en router admin (ruta /admin/audit-logs)
- [ ] Link en sidebar
- [ ] Tests unitarios >80% coverage
- [ ] Documentación API actualizada

---

## Referencias

- **Gap detectado:** GAP-C08
- **Hook existente:** `apps/frontend/src/apps/admin/hooks/useAuditLogs.ts`
- **Tabla BD:** `audit_logging.audit_logs`
- **Admin System Controller:** `apps/backend/src/modules/admin/controllers/admin-system.controller.ts`

---

**Creado:** 2025-11-29
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-C08, REQ-ADM-006
