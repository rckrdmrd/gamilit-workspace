# ANÁLISIS DETALLADO: AdminDashboardPage

**Fecha:** 2025-11-26
**Página:** 1 de 12
**Estado:** ANÁLISIS COMPLETADO

---

## RESUMEN EJECUTIVO

### Flujo de Datos
```
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                            │
│  ├─ admin_dashboard.system_overview_mv (Vista Materializada)        │
│  ├─ admin_dashboard.user_stats_summary (Vista - PROBLEMAS)          │
│  ├─ admin_dashboard.recent_activity (Vista)                         │
│  ├─ auth.users, auth_management.profiles, tenants                   │
│  └─ audit_logging.activity_log, system_logs                         │
├─────────────────────────────────────────────────────────────────────┤
│  BACKEND                                                             │
│  ├─ AdminDashboardController (10 endpoints)                         │
│  ├─ AdminDashboardService                                           │
│  └─ AdminSystemController (health, metrics)                         │
├─────────────────────────────────────────────────────────────────────┤
│  API FRONTEND                                                        │
│  ├─ getSystemHealth() → GET /admin/system/health                    │
│  ├─ getSystemMetrics() → GET /admin/system/metrics                  │
│  ├─ getRecentActions() → GET /admin/dashboard/actions/recent        │
│  ├─ getAlerts() → GET /admin/dashboard/alerts                       │
│  └─ getUserActivity() → GET /admin/dashboard/analytics/user-activity│
├─────────────────────────────────────────────────────────────────────┤
│  HOOK                                                                │
│  └─ useAdminDashboard.ts                                            │
│     ├─ useEffect (línea 388) - Carga inicial ✅                      │
│     ├─ transformSystemHealth() - Transformación ⚠️                   │
│     ├─ transformSystemMetrics() - Transformación ⚠️                  │
│     └─ Auto-refresh con intervalos ✅                                │
├─────────────────────────────────────────────────────────────────────┤
│  COMPONENTE                                                          │
│  └─ AdminDashboardPage.tsx                                          │
│     ├─ Desestructura datos del hook ✅                               │
│     ├─ Manejo de loading ✅                                          │
│     ├─ Manejo de error ✅                                            │
│     └─ Renderizado de métricas ⚠️ (algunos campos siempre 0)        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PROBLEMAS IDENTIFICADOS

### CRÍTICOS (P0) - Bloquean funcionalidad

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 1 | **Campos hardcodeados a 0 en transformación** | useAdminDashboard.ts:166-173 | Métricas falsas en UI |
| 2 | **apiUptime usado como porcentaje pero es SEGUNDOS** | useAdminDashboard.ts:124 → AdminDashboardPage.tsx:204 | Muestra "3600% uptime" |
| 3 | **Promise.all puede cancelar todas las llamadas si una falla** | useAdminDashboard.ts:309 | Dashboard incompleto si una API falla |
| 4 | **Vista user_stats_summary referencia tabla incorrecta** | admin_dashboard/views/user_stats_summary.sql | Query puede fallar |

### ALTOS (P1) - Degradan experiencia

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 5 | **avgResponseTime hardcodeado a 125ms** | admin-dashboard.service.ts:108 | Métrica falsa |
| 6 | **getRecentActions solo muestra 2 tipos de acciones** | admin-dashboard.service.ts | Acciones incompletas |
| 7 | **adminName siempre "Sistema"** | admin-dashboard.service.ts | No muestra quién hizo la acción |
| 8 | **Alertas pueden retornar array vacío** | admin-dashboard.service.ts | UI sin feedback de status OK |
| 9 | **Vistas materializadas requieren refresh manual** | 01-materialized_views.sql | Datos desactualizados |

### MEDIOS (P2) - Mejoras recomendadas

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 10 | **Error state global para múltiples APIs** | useAdminDashboard.ts | No se sabe cuál API falló |
| 11 | **MayaRanks transformación compleja** | adminAPI.ts:186-221 | Mantenimiento difícil |
| 12 | **Fallbacks inconsistentes entre endpoints** | admin-dashboard.service.ts | UX inconsistente |

---

## DETALLE DE CAMPOS CON PROBLEMAS

### Campos que muestran 0 (NO vienen del backend):

| Campo en UI | Fuente Hook | Fuente Backend | Estado |
|-------------|-------------|----------------|--------|
| Almacenamiento (GB) | `metrics.storageUsed` | NO EXISTE | ❌ Siempre 0 |
| Almacenamiento Total | `metrics.storageTotal` | NO EXISTE | ❌ Siempre 0 |
| Contenido Flagged | `metrics.flaggedContentCount` | NO EXISTE | ❌ Siempre 0 |
| Usuarios Activos (Health) | `systemHealth.activeUsers` | NO EXISTE | ❌ Siempre 0 |
| Crecimiento Usuarios | `metrics.userGrowth` | NO EXISTE | ❌ Siempre 0 |
| Crecimiento Orgs | `metrics.organizationGrowth` | NO EXISTE | ❌ Siempre 0 |

### Campos que funcionan correctamente:

| Campo en UI | Fuente Hook | Fuente Backend | Estado |
|-------------|-------------|----------------|--------|
| Usuarios Totales | `metrics.totalUsers` | `total_users` | ✅ OK |
| Sesiones Activas | `metrics.activeSessions` | `active_users_24h` | ✅ OK |
| Organizaciones | `metrics.totalOrganizations` | `total_organizations` | ✅ OK |
| Status Sistema | `systemHealth.status` | `status` | ✅ OK |
| CPU % | `systemHealth.cpu` | `cpu.usage_percent` | ✅ OK |
| Memoria % | `systemHealth.memory` | `memory.usage_percent` | ✅ OK |
| Estado DB | `systemHealth.database` | `database.status` | ✅ OK |

---

## PLAN DE CORRECCIONES

### FASE A: Correcciones en Frontend (Hook + Componente)

**Objetivo:** Corregir transformaciones y mostrar datos correctamente

1. **Corregir apiUptime** - Convertir segundos a formato legible o porcentaje real
2. **Usar Promise.allSettled** - Permitir que continúen llamadas si una falla
3. **Remover o marcar campos sin datos** - No mostrar métricas falsas (0)

### FASE B: Correcciones en Backend (Service)

**Objetivo:** Completar datos faltantes

4. **Agregar flaggedContentCount a SystemMetrics**
5. **Agregar storageUsed/storageTotal a SystemMetrics** (o remover de UI)
6. **Mejorar getRecentActions** - Incluir más tipos de acciones
7. **Corregir avgResponseTime** - Implementar tracking real o remover

### FASE C: Correcciones en Database (Opcional)

**Objetivo:** Asegurar que las vistas funcionen

8. **Validar user_stats_summary** - Verificar que use tablas correctas
9. **Crear cron job para refresh de MVs** (documentar proceso)

---

## ARCHIVOS A MODIFICAR

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts` | Hook | Transformaciones, Promise.allSettled |
| `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx` | Componente | UI para campos sin datos |
| `apps/backend/src/modules/admin/services/admin-dashboard.service.ts` | Service | Agregar campos faltantes |
| `apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts` | DTO | Agregar campos |

---

## CRITERIOS DE ACEPTACIÓN

- [ ] Dashboard carga datos al entrar (sin spinner infinito)
- [ ] Métricas muestran datos reales (no 0 falsos)
- [ ] Si una API falla, las otras siguen mostrando datos
- [ ] apiUptime muestra formato legible
- [ ] Error se muestra claramente si hay problema
- [ ] Botón refresh funciona correctamente

---

## PRÓXIMO PASO

Proceder con correcciones empezando por Frontend (más rápido de validar).

¿Listo para validar en navegador mientras implemento correcciones?
