# Plan de Validacion y Correcciones de Documentacion

**Fecha:** 2026-01-04
**Tipo:** Plan de Correcciones
**Estado:** Pendiente de Aprobacion
**Ejecutor:** Claude Code (Architecture-Analyst)

---

## Resumen Ejecutivo

Se identificaron **158 problemas** en la documentacion de GAMILIT que requieren correccion:

| Categoria | Cantidad | Severidad | Prioridad |
|-----------|----------|-----------|-----------|
| Referencias rotas | 99 | CRITICA | P0 |
| _MAP.md inconsistentes | 33 | ALTA | P1 |
| User Stories sin YAML | 23 | MEDIA | P2 |
| Duplicaciones | 3 | ALTA | P1 |

---

## GRUPO 1: Referencias Rotas (99 referencias)

### Problema
Los documentos contienen referencias a directorios que NO existen:
- `docs/01-requerimientos/` (28 refs)
- `docs/02-especificaciones-tecnicas/` (39 refs)
- `docs/03-desarrollo/` (32 refs)

### Mapeo de Rutas Legacy a Nuevas

| Ruta Legacy | Ruta Nueva |
|-------------|------------|
| `docs/01-requerimientos/` | `01-fase-alcance-inicial/EAI-*/requerimientos/` |
| `docs/02-especificaciones-tecnicas/` | `01-fase-alcance-inicial/EAI-*/especificaciones/` |
| `docs/03-desarrollo/` | `95-guias-desarrollo/` o `90-transversal/` |
| `docs/03-desarrollo/backend/` | `95-guias-desarrollo/backend/` |
| `docs/03-desarrollo/base-de-datos/` | `90-transversal/inventarios-database/` |

### Archivos a Corregir (Ordenados por Prioridad)

#### P0 - Guias de Referencia (Critico)

1. **`95-guias-desarrollo/GUIA-REFERENCIAS-SIMCO.md`** (12 referencias)
   - Es guia de patrones - DEBE mostrar rutas correctas
   - Actualizar todos los ejemplos a estructura nueva

2. **`95-guias-desarrollo/_MAP.md`** (11 referencias)
   - Mapa maestro de guias de desarrollo
   - Actualizar todas las referencias internas

3. **`96-quick-reference/README.md`** (6 referencias)
   - Documento publico de entrada
   - Links rotos afectan experiencia de usuario

#### P1 - Auto-referencias en Documentos ET-* y RF-*

Estos documentos contienen auto-referencias al final con formato legacy:

**Especificaciones Tecnicas (ET-*):**
- `EAI-001-fundamentos/especificaciones/ET-AUTH-001-rbac.md` (linea 585)
- `EAI-001-fundamentos/especificaciones/ET-AUTH-002-estados-cuenta.md` (linea 731)
- `EAI-001-fundamentos/especificaciones/ET-AUTH-003-oauth.md` (linea 538)
- `EAI-003-gamificacion/especificaciones/ET-GAM-001-achievements.md` (linea 1599)
- `EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md` (linea 1151)
- `EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md` (linea 2440)

**Requerimientos Funcionales (RF-*):**
- `EAI-001-fundamentos/requerimientos/RF-AUTH-001-roles.md` (linea 403)
- `EAI-001-fundamentos/requerimientos/RF-AUTH-002-estados-cuenta.md` (linea 590)
- `EAI-001-fundamentos/requerimientos/RF-AUTH-003-oauth.md` (linea 842)
- `EAI-003-gamificacion/requerimientos/RF-GAM-001-achievements.md` (linea 603)
- `EAI-003-gamificacion/requerimientos/RF-GAM-002-comodines.md` (linea 963)
- `EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md` (linea 1111)

#### P2 - Documentos de Migracion BD

- `02-fase-robustecimiento/EMR-001-migracion-bd/tareas/02-scripts/SCRIPTS-INSTALACION.md`
- `02-fase-robustecimiento/EMR-001-migracion-bd/tareas/02-scripts/DATOS-SEED.md`
- `02-fase-robustecimiento/EMR-001-migracion-bd/tareas/03-documentacion/ESQUEMA-44-TABLAS.md`
- `02-fase-robustecimiento/EMR-001-migracion-bd/tareas/03-documentacion/INDICES-PARTE-1.md`
- `02-fase-robustecimiento/EMR-001-migracion-bd/tareas/03-documentacion/INDICES-PARTE-2.md`

#### P3 - Quick Reference

- `96-quick-reference/DB-CHEATSHEET.md`
- `96-quick-reference/API-CHEATSHEET.md`

---

## GRUPO 2: Duplicaciones (3 archivos)

### Archivos Duplicados Identificados

| Archivo | Ubicacion Archivada | Ubicacion Activa (SSOT) |
|---------|--------------------|-----------------------|
| COMPONENTES-INVENTARIO.md | archivados/frontend-original/ | 95-guias-desarrollo/frontend/ |
| TRIGGERS-INVENTORY.md | archivados/database-original/ | 90-transversal/arquitectura-database/ |
| VIEWS-INVENTARIO.md | archivados/database-original/ | 90-transversal/arquitectura-database/ |

### Acciones

1. **ELIMINAR** versiones en `/archivados/`:
   - archivados/frontend-original/COMPONENTES-INVENTARIO.md
   - archivados/database-original/TRIGGERS-INVENTORY.md
   - archivados/database-original/VIEWS-INVENTARIO.md

2. **RENOMBRAR** para consistencia de nomenclatura:
   - TRIGGERS-INVENTORY.md -> TRIGGERS-INVENTARIO.md

3. **ACTUALIZAR** referencias en _MAP.md afectados

---

## GRUPO 3: Inconsistencias en _MAP.md (33 archivos)

### Tipo A: Fechas Incorrectas (21 archivos)

Archivos con fecha declarada diferente a fecha real de modificacion:

| Archivo | Fecha Declarada | Fecha Real | Correccion |
|---------|-----------------|------------|------------|
| 01-fase-alcance-inicial/EAI-001-fundamentos/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 01-fase-alcance-inicial/EAI-006-configuracion-sistema/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 01-fase-alcance-inicial/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 02-fase-robustecimiento/EMR-001-migracion-bd/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 02-fase-robustecimiento/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-003-notificaciones/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-004-perfiles/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-005-reportes/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-006-contenido/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-010-parent-notifications/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/_MAP.md | 2025-11-08 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-007-lti-integration/_MAP.md | 2025-11-20 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-008-white-label/_MAP.md | 2025-11-20 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-009-peer-challenges/_MAP.md | 2025-11-20 | 2026-01-04 | Actualizar |
| 03-fase-extensiones/EXT-011-parent-portal/_MAP.md | 2025-11-20 | 2026-01-04 | Actualizar |
| 90-transversal/_MAP.md | 2025-12-18 | 2026-01-04 | Actualizar |
| 90-transversal/arquitectura-database/_MAP.md | 2025-01-04 | 2026-01-04 | Corregir ano |
| 90-transversal/correcciones/_MAP.md | 2025-01-04 | 2026-01-04 | Corregir ano |
| 95-guias-desarrollo/ERRORES-COMUNES/_MAP.md | 2025-12-28 | 2026-01-04 | Actualizar |
| 95-guias-desarrollo/_MAP.md | 2025-12-18 | 2026-01-04 | Actualizar |
| 95-guias-desarrollo/backend/_MAP.md | 2025-01-04 | 2026-01-04 | Corregir ano |

### Tipo B: Sin Fecha Declarada (12 archivos)

Agregar seccion de fecha a:
- 01-fase-alcance-inicial/EAI-002-actividades/_MAP.md
- 01-fase-alcance-inicial/EAI-003-gamificacion/_MAP.md
- 01-fase-alcance-inicial/EAI-004-analytics/_MAP.md
- 01-fase-alcance-inicial/EAI-005-admin-base/_MAP.md
- 01-fase-alcance-inicial/EAI-008-portal-admin/archivados/_MAP.md
- 03-fase-extensiones/EXT-001-portal-maestros/_MAP.md
- 03-fase-extensiones/EXT-002-admin-extendido/_MAP.md
- 90-transversal/features/_MAP.md
- 90-transversal/metricas/_MAP.md
- 90-transversal/roadmap/_MAP.md
- 90-transversal/sprints/_MAP.md
- archivados/historicos-2025/_MAP.md

### Tipo C: Referencia Interna Rota (1 archivo)

**Archivo:** 01-fase-alcance-inicial/_MAP.md
**Linea:** 48
**Error:** `[_MAP.md](./MAP.md)` deberia ser `[_MAP.md](./_MAP.md)`

---

## GRUPO 4: User Stories sin YAML Front-matter (23 archivos)

### Distribucion por Fase

| Fase | Cantidad | Archivos |
|------|----------|----------|
| Fase 2 | 1 | US-M4-001 |
| Fase 3 - EXT-001 | 11 | US-PM-002a/b/c, US-PM-003a/b, US-PM-004a/b, US-PM-005a/b/c, US-PM-006 |
| Fase 3 - EXT-002 | 11 | US-AE-000 a US-AE-011 (excepto US-AE-007) |

### Campos YAML Requeridos (Estandar)

```yaml
---
id: US-XXX-YYY
title: "Titulo descriptivo"
epic: EAI-XXX | EXT-XXX
prioridad: P0|P1|P2|P3
status: Draft|Ready|In Progress|Done|Backlog
story_points: N
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Lista de Archivos a Actualizar

1. US-M4-001-backend-dtos.md
2. US-PM-002a-assignment-crud.md
3. US-PM-002b-assignment-distribution.md
4. US-PM-002c-submissions-view.md
5. US-PM-003a-grading-queue.md
6. US-PM-003b-grading-interface.md
7. US-PM-004a-progress-analytics.md
8. US-PM-004b-teacher-notes.md
9. US-PM-005a-classroom-analytics.md
10. US-PM-005b-report-generation.md
11. US-PM-005c-engagement-metrics.md
12. US-PM-006-bloquear-alumnos-maestro.md
13. US-AE-000-admin-dashboard.md
14. US-AE-001-user-management.md
15. US-AE-002-organizations.md
16. US-AE-003-content-management.md
17. US-AE-004-system-monitoring.md
18. US-AE-005-parametrizacion-gamificacion.md
19. US-AE-006-admin-reports.md
20. US-AE-008-system-settings.md
21. US-AE-009-admin-assignments-view.md
22. US-AE-010-create-users.md
23. US-AE-011-audit-logs-viewer.md

---

## Plan de Ejecucion

### Fase 1: Preparacion
- [ ] Crear backup de archivos a modificar
- [ ] Validar que no hay trabajo en progreso en los archivos

### Fase 2: Correccion de _MAP.md (P0)
- [ ] Actualizar fechas en 21 archivos
- [ ] Agregar fechas a 12 archivos
- [ ] Corregir referencia rota en 01-fase-alcance-inicial/_MAP.md

### Fase 3: Eliminacion de Duplicados (P1)
- [ ] Eliminar 3 archivos duplicados en /archivados/
- [ ] Renombrar TRIGGERS-INVENTORY.md a TRIGGERS-INVENTARIO.md
- [ ] Actualizar referencias afectadas

### Fase 4: Correccion de Referencias (P1)
- [ ] Actualizar GUIA-REFERENCIAS-SIMCO.md
- [ ] Actualizar 95-guias-desarrollo/_MAP.md
- [ ] Actualizar 96-quick-reference/README.md
- [ ] Actualizar auto-referencias en ET-* y RF-*
- [ ] Actualizar documentos EMR-001

### Fase 5: Agregar YAML a User Stories (P2)
- [ ] Agregar YAML a 23 archivos US-*.md
- [ ] Validar formato consistente

### Fase 6: Validacion Final
- [ ] Ejecutar grep para verificar referencias rotas
- [ ] Verificar que no hay duplicados
- [ ] Validar fechas en _MAP.md
- [ ] Verificar YAML en User Stories

---

## Metricas de Exito

| Metrica | Antes | Despues |
|---------|-------|---------|
| Referencias rotas | 99 | 0 |
| Archivos duplicados | 3 | 0 |
| _MAP.md inconsistentes | 33 | 0 |
| US sin YAML | 23 | 0 |
| Cumplimiento estandares | 64% | 100% |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Links rotos post-correccion | Media | Bajo | Validacion exhaustiva |
| Archivos en uso | Baja | Medio | Coordinar con equipo |
| Perdida de datos | Baja | Alto | Backup previo |

---

## Dependencias

- Ningun archivo esta siendo editado actualmente
- No hay PRs abiertos que afecten estos archivos
- Documentacion no esta en proceso de revision

---

**Creado:** 2026-01-04
**Version:** 1.0
**Estado:** Pendiente Aprobacion
