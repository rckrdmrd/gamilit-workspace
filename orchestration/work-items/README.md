# Work Items - GAMILIT

Gestion de trabajo del proyecto GAMILIT.

> **NOTA:** Restructurado a jerarquia EPIC/Stories el 2026-02-07.
> Cada EPIC tiene su directorio con `EPIC.yml` enriquecido y subdirectorio `stories/` con `STORY.md` + `STORY.yml` por historia.

---

## Estructura

```
work-items/
+-- epics/                              # 11 EPICs (162 SP total, 27 User Stories)
|   +-- EPIC-GAM-SCAFFOLD/
|   |   +-- EPIC.yml                    # Metadatos enriquecidos v2.0.0
|   +-- EPIC-GAM-REQUIREMENTS/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-ARCHITECTURE/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-DATABASE/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-BACKEND/
|   |   +-- EPIC.yml
|   |   +-- stories/                    # 14 User Stories
|   |       +-- US-GAM-{ID}/
|   |           +-- STORY.md            # Contenido completo
|   |           +-- STORY.yml           # Metadatos estructurados
|   +-- EPIC-GAM-FRONTEND/
|   |   +-- EPIC.yml
|   |   +-- stories/                    # 13 User Stories
|   |       +-- US-GAM-{ID}/
|   |           +-- STORY.md
|   |           +-- STORY.yml
|   +-- EPIC-GAM-INTEGRATION/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-K8S/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-TESTING/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-DEVOPS/
|   |   +-- EPIC.yml
|   +-- EPIC-GAM-DOCS/
|       +-- EPIC.yml
+-- sprints/                            # Sprint planning y tracking
+-- releases/                           # Release notes y versiones
```

---

## Indice de EPICs

| # | ID | Titulo | SP | Stories | Estado |
|---|-----|--------|----|---------|--------|
| 1 | EPIC-GAM-SCAFFOLD | Scaffolding Gamilit | 5 | 0 | COMPLETADO |
| 2 | EPIC-GAM-REQUIREMENTS | Requerimientos Gamilit | 13 | 0 | COMPLETADO |
| 3 | EPIC-GAM-ARCHITECTURE | Arquitectura Gamificacion | 13 | 0 | COMPLETADO |
| 4 | EPIC-GAM-DATABASE | Esquema BD Gamilit | 21 | 0 | COMPLETADO |
| 5 | EPIC-GAM-BACKEND | Backend Gamilit | 34 | 14 | COMPLETADO |
| 6 | EPIC-GAM-FRONTEND | Frontend Gamilit | 34 | 13 | COMPLETADO |
| 7 | EPIC-GAM-INTEGRATION | Integracion Gamilit | 5 | 0 | COMPLETADO |
| 8 | EPIC-GAM-K8S | Kubernetes Gamilit | 8 | 0 | EN_PROGRESO |
| 9 | EPIC-GAM-TESTING | Tests Gamilit | 13 | 0 | EN_PROGRESO |
| 10 | EPIC-GAM-DEVOPS | DevOps Gamilit | 8 | 0 | EN_PROGRESO |
| 11 | EPIC-GAM-DOCS | Documentacion Gamilit | 8 | 0 | EN_PROGRESO |

**Total:** 11 EPICs | 162 Story Points | 27 User Stories

---

## EPICs con Stories

### EPIC-GAM-BACKEND (14 stories, 34 SP)

| # | Story ID | SP | Estado |
|---|----------|----|--------|
| 1 | US-GAM-ANALYTICS-01 | 5 | COMPLETADO |
| 2 | US-GAM-ANL-01 | 13 | COMPLETADO |
| 3 | US-GAM-CLASSROOM-01 | 5 | COMPLETADO |
| 4 | US-GAM-CONTENT-01 | 5 | COMPLETADO |
| 5 | US-GAM-EDU-01 | 21 | COMPLETADO |
| 6 | US-GAM-EDU-02 | 13 | COMPLETADO |
| 7 | US-GAM-GAM-01 | 13 | COMPLETADO |
| 8 | US-GAM-GAM-02 | 8 | COMPLETADO |
| 9 | US-GAM-GAMIFICATION-01 | 5 | COMPLETADO |
| 10 | US-GAM-GAMIFICATION-02 | 5 | COMPLETADO |
| 11 | US-GAM-GAMIFICATION-03 | 5 | COMPLETADO |
| 12 | US-GAM-MUL-01 | 13 | EN_PROGRESO |
| 13 | US-GAM-RT-01 | 13 | COMPLETADO |
| 14 | US-GAM-TEACHER-01 | 5 | COMPLETADO |

### EPIC-GAM-FRONTEND (13 stories, 34 SP)

| # | Story ID | SP | Estado |
|---|----------|----|--------|
| 1 | US-GAM-ACS-01 | 8 | EN_PROGRESO |
| 2 | US-GAM-ADM-01 | 8 | COMPLETADO |
| 3 | US-GAM-EXERCISES-01 | 5 | COMPLETADO |
| 4 | US-GAM-EXERCISES-02 | 5 | COMPLETADO |
| 5 | US-GAM-EXERCISES-03 | 8 | COMPLETADO |
| 6 | US-GAM-EXERCISES-04 | 5 | COMPLETADO |
| 7 | US-GAM-EXERCISES-05 | 8 | COMPLETADO |
| 8 | US-GAM-LEADERBOARD-01 | 5 | COMPLETADO |
| 9 | US-GAM-PAR-01 | 8 | COMPLETADO |
| 10 | US-GAM-PARENT-01 | 5 | COMPLETADO |
| 11 | US-GAM-SOCIAL-01 | 5 | EN_PROGRESO |
| 12 | US-GAM-STD-01 | 13 | COMPLETADO |
| 13 | US-GAM-TCH-01 | 13 | COMPLETADO |

---

## Navegacion Rapida

- **EPIC.yml enriquecido:** `epics/EPIC-GAM-{SUFFIX}/EPIC.yml`
- **Story completa:** `epics/EPIC-GAM-{SUFFIX}/stories/US-GAM-{ID}/STORY.md`
- **Story metadatos:** `epics/EPIC-GAM-{SUFFIX}/stories/US-GAM-{ID}/STORY.yml`
- **EPIC YAML plano (legacy):** `epics/EPIC-GAM-{SUFFIX}.yml`

---

*Reestructuracion FASE 1 completada 2026-02-07*
*GAMILIT - Work Items*
