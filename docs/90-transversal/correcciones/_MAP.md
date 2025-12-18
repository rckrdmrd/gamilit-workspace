# _MAP: Correcciones e Issues

**Carpeta:** docs/90-transversal/correcciones/
**Ultima Actualizacion:** 2025-12-18
**Proposito:** Backlog de issues pendientes
**Estado:** Vigente

---

## Contenido Actual

Esta carpeta contiene **solo el backlog de issues pendientes**. Los reportes de correcciones completadas han sido movidos a `orchestration/reportes/correcciones/`.

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `ISSUES-CRITICOS.md` | Backlog de issues pendientes (66+ issues) | Vigente |

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

**Actualizado:** 2025-12-18
**Por:** Requirements-Analyst
