# MAPA DE DOCUMENTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-01-07
**Version:** 2.1.0 (Post-purga documentacion)

---

## Estructura de Documentacion

```
docs/
+-- 00-vision-general/       # Vision, glosario, onboarding
+-- 01-fase-alcance-inicial/ # Fase 1: EAI-001 a EAI-008 (7 EPICs)
+-- 02-fase-robustecimiento/ # Fase 2: EAI-007 (Modulos M4-M5)
+-- 03-fase-extensiones/     # Fase 3: EXT-001 a EXT-011 (11 EPICs)
+-- 04-fase-backlog/         # Backlog de features pendientes
+-- 90-transversal/          # Documentacion transversal
+-- 95-guias-desarrollo/     # Guias para desarrolladores
+-- 96-quick-reference/      # Cheatsheets (API, DB, Git, Testing, Docker, Deploy)
+-- 97-adr/                  # 21 Architecture Decision Records
+-- 99-finiquito/            # Documentacion de cierre y entrega
+-- 99-troubleshooting/      # Guias de resolucion de problemas
+-- archivados/              # Documentacion deprecada/historica
+-- audits/                  # Reportes de auditoria
+-- planning/                # Planificacion y tracking
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

### 90-transversal/
Documentacion transversal: arquitectura, API, roadmap, sprints, inventarios.

### 95-guias-desarrollo/
Guias para backend, frontend, testing.

### 96-quick-reference/
Cheatsheets: API, DB, Git, Testing, Docker, Deployment.

### 97-adr/
21 Architecture Decision Records documentados.

### 99-troubleshooting/
Guías de resolución de problemas comunes.

### audits/
Reportes de auditoría y validación.

### planning/
Planificación y tracking de tareas.

### 99-finiquito/
Documentacion de entrega, manuales, credenciales.

### archivados/
Documentacion deprecada: 98-standards, frontend-original, database-original.

---

## Metricas de Documentacion

| Metrica | Valor |
|---------|-------|
| EPICs documentadas | 19 |
| ADRs | 21 |
| Cheatsheets | 8 |
| Guias de desarrollo | 10+ |

---

**Actualizado:** 2026-01-07
**Sistema:** NEXUS v4.0 + SIMCO
**Cambios:** Purga de 18 archivos obsoletos, actualización de métricas
