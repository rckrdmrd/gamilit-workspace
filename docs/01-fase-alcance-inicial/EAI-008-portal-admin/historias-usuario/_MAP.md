# Historias de Usuario - EAI-008

**EPIC:** EAI-008 - Portal de Administracion
**Ultima actualizacion:** 2026-01-04

---

## Nota

Esta EPIC fue implementada antes de la estandarizacion SCRUM. Las historias de usuario fueron documentadas de forma implicita en los implementation reports.

**Documentacion original:** `../archivados/modulos-legacy/`

---

## Indice de Historias de Usuario

### Fase 1 - Implementadas

| ID | Titulo | SP | Estado |
|----|--------|-----|--------|
| US-ADM-001 | Gestionar alertas del sistema | 8 | Done |
| US-ADM-002 | Visualizar dashboard de analiticas | 13 | Done |
| US-ADM-003 | Seguir progreso de estudiantes | 8 | Done |
| US-ADM-004 | Monitorear sistema en tiempo real | 8 | Done |
| US-ADM-005 | Gestionar usuarios del sistema | 5 | Done |
| US-ADM-006 | Gestionar instituciones | 5 | Done |
| US-ADM-007 | Gestionar roles y permisos | 5 | Done |

**Subtotal Fase 1:** 52 SP (Done)

### Fase 2 - Backlog

| ID | Titulo | SP | Estado |
|----|--------|-----|--------|
| US-ADM-008 | Configurar feature flags y A/B testing | 13 | Backlog |
| US-ADM-009 | Configurar opciones generales y seguridad | 8 | Backlog |
| US-ADM-010 | Generar reportes con persistencia | 13 | Backlog |

**Subtotal Fase 2:** 34 SP (Backlog)

---

## Descripciones

### US-ADM-001: Gestionar alertas del sistema

**Como** administrador del sistema
**Quiero** gestionar las alertas del sistema con estados y acciones
**Para** mantener el sistema funcionando correctamente

**Criterios de Aceptacion:**
- Listar alertas con filtros
- Cambiar estado de alertas (FSM)
- Ver historial de alertas
- Acciones masivas

### US-ADM-002: Visualizar dashboard de analiticas

**Como** administrador del sistema
**Quiero** visualizar dashboards de analiticas interactivos
**Para** entender el uso y rendimiento de la plataforma

**Criterios de Aceptacion:**
- 4 tabs: Overview, Engagement, Gamification, Retention
- 7 graficos interactivos
- Filtros por fecha y dimension
- Exportacion de datos

### US-ADM-003: Seguir progreso de estudiantes

**Como** administrador del sistema
**Quiero** seguir el progreso de estudiantes y aulas
**Para** identificar areas de mejora

**Criterios de Aceptacion:**
- Vista overview de progreso
- Drill-down por aula
- Detalle por estudiante
- Export CSV

### US-ADM-004: Monitorear sistema en tiempo real

**Como** administrador del sistema
**Quiero** monitorear el sistema en tiempo real
**Para** detectar problemas rapidamente

**Criterios de Aceptacion:**
- 4 tabs: Logs, Metrics, Errors, Alerts
- Auto-refresh configurable
- Filtros avanzados
- Health check

---

## Documentacion Detallada

Para criterios de aceptacion detallados, consultar:
- `../archivados/modulos-legacy/0X-modulo-*/IMPLEMENTATION-REPORT-*.md`
- `../archivados/modulos-legacy/99-reportes-progreso/REPORTE-FINAL-PORTAL-ADMIN-COMPLETO-2025-11-24.md`

---

**Nota:** Las US formales pueden crearse si se requiere ampliar esta EPIC.
