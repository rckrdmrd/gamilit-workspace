# MAPA DE DOCUMENTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-01-24
**Version:** 2.4.0 (Reestructurado segun SIMCO-DOCUMENTACION-PROYECTO v1.0.0)

---

## Estructura de Documentacion

```
docs/
+-- _SSOT/                   # Single Source of Truth - Consolidado central
+-- 00-vision-general/       # Vision, glosario, onboarding
+-- 01-fase-alcance-inicial/ # Fase 1: EAI-001 a EAI-008 (7 EPICs)
+-- 02-fase-robustecimiento/ # Fase 2: EAI-007 (Modulos M4-M5)
+-- 03-fase-extensiones/     # Fase 3: EXT-001 a EXT-011 (11 EPICs)
+-- 04-fase-backlog/         # Backlog de features pendientes
+-- 05-modelado/             # Modelado de datos y diagramas
+-- 40-estandares/           # Estandares de desarrollo (API, nomenclatura)
+-- 90-transversal/          # Documentacion transversal (arquitectura, API, planning)
+-- 95-guias-desarrollo/     # Guias para desarrolladores (incluye troubleshooting)
+-- 96-quick-reference/      # Cheatsheets (API, DB, Git, Testing, Docker, Deploy)
+-- 97-adr/                  # 21 Architecture Decision Records
+-- 98-audits/               # Reportes de auditoria y validacion
+-- 99-finiquito/            # Documentacion de cierre (incluye archivados/)
```

---

## Archivos Principales

| Archivo | Descripcion |
|---------|-------------|
| README.md | Indice principal de documentacion |
| 90-transversal/arquitectura/ARCHITECTURE.md | Arquitectura del sistema |
| 90-transversal/api/API.md | Documentacion de API |
| 90-transversal/roadmap/ROADMAP-GENERAL.md | Plan estrategico |
| 90-transversal/sprints/SPRINTS-DETALLADOS.md | Plan de sprints |
| 95-guias-desarrollo/DEPLOYMENT.md | Guia de despliegue |
| 04-fase-backlog/DEFINITION-OF-READY.md | Criterios DoR |

---

## EPICs por Fase

### 01-fase-alcance-inicial (7 EPICs)

| EPIC | Nombre | Estado |
|------|--------|--------|
| EAI-001 | Fundamentos | Done |
| EAI-002 | Actividades | Done |
| EAI-003 | Gamificacion | Done |
| EAI-004 | Analytics | Done |
| EAI-005 | Admin Base | Done |
| EAI-006 | Configuracion Sistema | Done |
| EAI-008 | Portal Admin | Done |

### 02-fase-robustecimiento (1 EPIC)

| EPIC | Nombre | Estado |
|------|--------|--------|
| EAI-007 | Modulos M4-M5 | Done |

### 03-fase-extensiones (11 EPICs)

| EPIC | Nombre | Estado |
|------|--------|--------|
| EXT-001 | Portal Maestros | Backlog |
| EXT-002 | Admin Extendido | Parcial |
| EXT-003 | Notificaciones | Backlog |
| EXT-004 | Perfiles | Backlog |
| EXT-005 | Reportes | Backlog |
| EXT-006 | Contenido | Backlog |
| EXT-007 | LTI Integration | Backlog |
| EXT-008 | White Label | Backlog |
| EXT-009 | Peer Challenges | Backlog |
| EXT-010 | Parent Notifications | Backlog |
| EXT-011 | Parent Portal | Backlog |

---

## Subdirectorios

### _SSOT/ (Single Source of Truth)
Consolidado central de trazabilidad del proyecto.

| Archivo | Proposito | Alias |
|---------|-----------|-------|
| TRACEABILITY-MASTER.yml | Consolidado de 22 epicas | @TRACE-MASTER |
| EPIC-INDEX.yml | Indice de epicas con estados | @EPIC-INDEX |
| REQUIREMENTS-INDEX.yml | Mapeo RF -> ET -> US | @REQ-INDEX |
| CODE-MAPPINGS.yml | Mapeo docs <-> codigo | @CODE-MAP |
| COMPLETENESS-TRACKER.yml | Rutas para epicas parciales | @COMPLETENESS |
| API-CONTRACTS.yml | Contratos de API | - |
| ENTITIES-CATALOG.md | Catalogo de entidades | - |

### 00-vision-general/
Vision del producto, glosario, datos de gamificacion, guias de pruebas.

### 01-fase-alcance-inicial/
Documentacion SCRUM de EPICs del alcance inicial (requerimientos, especificaciones, historias-usuario, tareas).

### 02-fase-robustecimiento/
Mejoras y modulos adicionales (M4-M5).

### 03-fase-extensiones/
Extensiones futuras del sistema (portales, notificaciones, reportes).

### 04-fase-backlog/
Features pendientes con Definition of Ready.

### 05-modelado/
Modelado de datos y diagramas del sistema.

### 40-estandares/
Estandares de desarrollo: nomenclatura API, convenciones de codigo.

### 90-transversal/
Documentacion transversal: arquitectura, API, roadmap, sprints, inventarios.
- **planning/** - Planificacion y tracking de tareas (PLAN-ESTANDARIZACION-SCRUM, etc.)

### 95-guias-desarrollo/
Guias para backend, frontend, testing.
- **troubleshooting/** - Guias de resolucion de problemas comunes

### 96-quick-reference/
Cheatsheets: API, DB, Git, Testing, Docker, Deployment.

### 97-adr/
21 Architecture Decision Records documentados.

### 98-audits/
Reportes de auditoria y validacion del proyecto.

### 99-finiquito/
Documentacion de cierre y entrega.
- **archivados/** - Documentacion deprecada: 98-standards, frontend-original, database-original

---

## Metricas de Documentacion

| Metrica | Valor |
|---------|-------|
| EPICs documentadas | 22 |
| EPICs completadas | 17 |
| EPICs parciales | 5 |
| ADRs | 21 |
| Cheatsheets | 8 |
| Guias de desarrollo | 10+ |
| SSOT archivos | 7 |
| Mecanicas documentadas | 33 |

---

## Actualizaciones Recientes (2026-01-20)

### Estandares
- **[ESTANDAR-NOMENCLATURA-API.md](40-estandares/ESTANDAR-NOMENCLATURA-API.md)** - Convenciones snake_case/camelCase para APIs

### Especificaciones Transversales
- **[90-transversal/mecanicas/](90-transversal/mecanicas/_MAP.md)** - 33 mecanicas de ejercicios documentadas
  - SPEC-MECANICAS-M1-M3.md (23 mecanicas basicas)
  - SPEC-MECANICAS-M4.md (5 mecanicas creativas)
  - SPEC-MECANICAS-M5.md (3 mecanicas multimedia)
  - SPEC-MECANICAS-EJERCICIOS.md (consolidado)

### Guias de Desarrollo
- **[95-guias-desarrollo/student-portal/](95-guias-desarrollo/student-portal/_MAP.md)** - README y _MAP actualizados con metricas 2026

### Extensiones
- **[EXT-001-portal-maestros](03-fase-extensiones/EXT-001-portal-maestros/_MAP.md)** - 15 US, 4 especificaciones tecnicas
- **[EXT-002-admin-extendido](03-fase-extensiones/EXT-002-admin-extendido/_MAP.md)** - 19 US (17 implementadas), 204 SP

---

**Actualizado:** 2026-01-24
**Sistema:** SIMCO v4.3.0 + SSOT
**Cambios:** Reestructurado segun SIMCO-DOCUMENTACION-PROYECTO v1.0.0 - Eliminados prefijos duplicados, consolidadas carpetas sin prefijo numerico
