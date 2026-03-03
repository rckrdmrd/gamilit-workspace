---
titulo: "Epics — Mapa de Navegacion"
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Epics — Mapa de Navegacion

## Estructura

```
epics/
├── _INDEX.md
├── _MAP.md
├── _TEMPLATE-TASK-TRAZABILIDAD.md
├── README.md
├── EPIC-GAM-F1-AUTH/
├── EPIC-GAM-F1-EXERCISES/
├── EPIC-GAM-F1-GAMIFICATION/
├── EPIC-GAM-F1-ANALYTICS/
├── EPIC-GAM-F1-ADMIN/
├── EPIC-GAM-F1-CONFIG/
├── EPIC-GAM-F1-PORTAL-ADMIN/
├── EPIC-GAM-F2-MODULES-M4M5/
├── EPIC-GAM-F2-DB-MIGRATION/
├── EPIC-GAM-F2-TECH-CONSOLIDATION/
├── EPIC-GAM-F3-SOCIAL-GAMIFICATION/
├── EPIC-GAM-F3-TEACHER-PORTAL/
├── EPIC-GAM-F3-ADMIN-EXTENDED/
├── EPIC-GAM-F3-NOTIFICATIONS/
├── EPIC-GAM-F3-PROFILES/
├── EPIC-GAM-F3-REPORTS/
├── EPIC-GAM-F3-CONTENT/
├── EPIC-GAM-F3-LTI/
├── EPIC-GAM-F3-WHITE-LABEL/
├── EPIC-GAM-F3-PEER-CHALLENGES/
├── EPIC-GAM-F3-PARENT-NOTIFICATIONS/
├── EPIC-GAM-F3-PARENT-PORTAL/
└── EPIC-GAM-F4-VALIDATION/
```

## Archivos

| Archivo | Descripcion |
|---------|-------------|
| `README.md` | Overview de epics |
| `_TEMPLATE-TASK-TRAZABILIDAD.md` | Template para trazabilidad de tareas |

## Fases Funcionales

### Wave 3 - EPICs Tecnicas (11 EPICs, 162 SP, 100% completado)

| Epic ID | Titulo | SP | Estado |
|---------|--------|-----|--------|
| EPIC-GAM-SCAFFOLD | Scaffolding Gamilit | 5 | completed |
| EPIC-GAM-REQUIREMENTS | Requerimientos Gamilit | 13 | completed |
| EPIC-GAM-ARCHITECTURE | Arquitectura Gamificacion | 13 | completed |
| EPIC-GAM-DATABASE | Esquema BD Gamilit | 21 | completed |
| EPIC-GAM-BACKEND | Backend Gamilit | 34 | completed |
| EPIC-GAM-FRONTEND | Frontend Gamilit | 34 | completed |
| EPIC-GAM-K8S | Kubernetes Gamilit | 8 | completed |
| EPIC-GAM-TESTING | Tests Gamilit | 13 | completed |
| EPIC-GAM-DEVOPS | DevOps Gamilit | 8 | completed |
| EPIC-GAM-DOCS | Documentacion Gamilit | 8 | completed |
| EPIC-GAM-INTEGRATION | Integracion Gamilit | 5 | completed |

### F1 - Alcance Inicial (7 EPICs, 230 SP, 100% completado)

| Epic ID | Titulo | SP |
|---------|--------|-----|
| EPIC-GAM-F1-AUTH | Autenticacion y Fundamentos | 34 |
| EPIC-GAM-F1-EXERCISES | Ejercicios y Actividades | 34 |
| EPIC-GAM-F1-GAMIFICATION | Sistema de Gamificacion | 34 |
| EPIC-GAM-F1-ANALYTICS | Analytics y Reportes | 21 |
| EPIC-GAM-F1-ADMIN | Administracion Base | 21 |
| EPIC-GAM-F1-CONFIG | Configuracion del Sistema | 8 |
| EPIC-GAM-F1-PORTAL-ADMIN | Portal Administrador | 78 |

### F2 - Robustecimiento (3 EPICs, 42 SP, 100% completado)

| Epic ID | Titulo | SP |
|---------|--------|-----|
| EPIC-GAM-F2-MODULES-M4M5 | Modulos M4 y M5 | 21 |
| EPIC-GAM-F2-DB-MIGRATION | Migracion BD | 13 |
| EPIC-GAM-F2-TECH-CONSOLIDATION | Consolidacion Tecnica | 8 |

### F3 - Extensiones (12 EPICs, 165 SP, ~58% completado)

| Epic ID | Titulo | SP | Estado |
|---------|--------|-----|--------|
| EPIC-GAM-F3-SOCIAL-GAMIFICATION | Gamificacion Social | 13 | in_progress |
| EPIC-GAM-F3-TEACHER-PORTAL | Portal Maestros | 34 | completed |
| EPIC-GAM-F3-ADMIN-EXTENDED | Admin Extendido | 34 | completed |
| EPIC-GAM-F3-NOTIFICATIONS | Notificaciones | 8 | completed |
| EPIC-GAM-F3-PROFILES | Perfiles | 8 | planned |
| EPIC-GAM-F3-REPORTS | Reportes | 8 | planned |
| EPIC-GAM-F3-CONTENT | Contenido | 8 | planned |
| EPIC-GAM-F3-LTI | Integracion LTI | 13 | planned |
| EPIC-GAM-F3-WHITE-LABEL | White Label | 13 | planned |
| EPIC-GAM-F3-PEER-CHALLENGES | Retos Entre Pares | 8 | planned |
| EPIC-GAM-F3-PARENT-NOTIFICATIONS | Notificaciones Padres | 5 | planned |
| EPIC-GAM-F3-PARENT-PORTAL | Portal Padres | 13 | planned |

### F4 - Validacion (1 EPIC, 89 SP, En progreso)

| Epic ID | Titulo | SP |
|---------|--------|-----|
| EPIC-GAM-F4-VALIDATION | Validacion e Integracion Integral | 89 |

---

**SSOT:** Este directorio es la fuente unica de documentacion narrativa de epicas del proyecto.
**Tracking:** [orchestration/work-items/epics/](../../../orchestration/work-items/epics/)
**ADR:** [ADR-034](../../90-adr/ADR-034-jerarquia-anidada-profunda.md) - Jerarquia anidada profunda
**Padre:** [docs/10-requirements/](../README.md)
