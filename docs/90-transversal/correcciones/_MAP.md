# _MAP: Correcciones e Issues

**Carpeta:** docs/90-transversal/correcciones/
**Ultima Actualizacion:** 2025-12-26
**Proposito:** Backlog de issues pendientes y reportes de correcciones
**Estado:** Vigente

---

## Contenido Actual

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `ISSUES-CRITICOS.md` | Backlog de issues pendientes (66+ issues) | Vigente |
| `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md` | Correcciones Portal Admin Sprint 1-4 (23 issues) | Completado |

---

## Correcciones Recientes (2025-12-26)

### Portal Admin - Sprint 1-4

**Documento:** `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md`

| Prioridad | Identificados | Corregidos | N/A |
|-----------|---------------|------------|-----|
| P0 - CRITICAL | 5 | 5 | 1 |
| P1 - HIGH | 5 | 2 | 3 |
| P2 - MEDIUM | 8 | 3 | 5 |
| P3 - LOW | 5 | 3 | 2 |
| **TOTAL** | **23** | **13** | **11** |

**Archivos Modificados (13):**
- `useUserManagement.ts` - Mapeo correcto de campos usuario
- `AdminReportsPage.tsx` - Error handling tipado
- `FeatureFlagsPanel.tsx` - Mensajes en español
- `ABTestingDashboard.tsx` - Mensajes en español
- `useSettings.ts` - Funciones mock deprecadas
- `AssignmentFilters.tsx` - Validacion de fechas
- `useFeatureFlags.ts` - Rutas y flags dinamicos
- `useMonitoring.ts` - Error handling tipado
- `useAnalytics.ts` - Error handling tipado
- `AdminGamificationPage.tsx` - Eliminado hardcode
- `useAdminDashboard.ts` - Intervalos optimizados
- `useSystemMetrics.ts` - Tipo HealthStatus
- `useClassroomTeacher.ts` - Mensajes en español

---

## Documentacion Movida (2025-12-18)

Los siguientes archivos fueron movidos a `orchestration/reportes/correcciones/`:

| Archivo | Razon |
|---------|-------|
| `CORRECCIONES-BUILD-AUTH-2025-11-25.md` | Correccion completada |
| `CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md` | Correccion completada |
| `CORRECCION-EJERCICIOS-MODULO3-REQUIRES-MANUAL-GRADING-2025-11-29.md` | Correccion completada |
| `REPORTE-VALIDACION-DOCS-FE-059-2025-11-19.md` | Reporte completado |
| `ANALISIS-FORMATOS-DTO-FE-059.md` | Analisis completado |

**Ver traza completa:** `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md`

---

## Issues Criticos Pendientes

Ver detalles en `ISSUES-CRITICOS.md`:

**P0 (Critico):**
- Testing coverage bajo (12-15%)
- Monitoring no implementado
- `check_and_award_achievements()` funcion rota - Requiere refactorizacion JSONB

**P1 (Alto):**
- Tipo Mission NO EXISTE en Frontend - 14 campos pendientes
- MayaRank KUKUKULKAN - Typo en backend (debe ser KUKULKAN)
- MessageTypeEnum - Falta en Frontend

**P2 (Medio):**
- DeviceTypeEnum falta valor 'unknown' en backend
- Tipos incompletos en varios componentes

---

## Navegacion

### Para ver issues pendientes:
- Consultar `ISSUES-CRITICOS.md` en esta carpeta

### Para ver correcciones aplicadas:
- Consultar `orchestration/reportes/correcciones/`

### Para ver historico de cambios:
- Consultar `orchestration/reportes/historicos/2025-11/`

---

## Metricas de Integracion (Ultima validacion: 2025-11-26)

```
Database → Backend:              89.0%
Database → Frontend (via APIs):  86.0%
PROMEDIO GLOBAL:                 87.5%
ESTADO:                          PRODUCTION READY
```

---

**Actualizado:** 2025-12-26
**Por:** Claude Code (Requirements-Analyst)
