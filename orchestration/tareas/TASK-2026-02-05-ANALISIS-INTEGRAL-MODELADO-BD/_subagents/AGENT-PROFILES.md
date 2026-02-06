# PERFILES DE AGENTES - TASK-2026-02-05

**Fecha:** 2026-02-05

---

## Agentes Requeridos por Fase

### FASE-1: Reconciliacion (6 agentes max)

| ID | Perfil | Tarea | Tipo |
|----|--------|-------|------|
| SA-F1-01 | DDL Cataloger | 1.1.1 Tablas (schemas 1-6) | Explore |
| SA-F1-02 | DDL Cataloger | 1.1.1 Tablas (schemas 7-12) | Explore |
| SA-F1-03 | DDL Cataloger | 1.1.1 Tablas (schemas 13-18) | Explore |
| SA-F1-04 | SQL Analyzer | 1.1.2 Funciones + 1.1.3 Objetos | Explore |
| SA-F1-05 | Entity Cataloger | 1.2.1 Entities TypeORM | Explore |
| SA-F1-06 | Cross-Referencer | 1.3.1 Matriz DDL↔Entity | general-purpose |

### FASE-2: Validacion por Schema (hasta 10 agentes)

| ID | Perfil | Schema | Tipo |
|----|--------|--------|------|
| SA-F2-01 | Schema Validator | auth_management | general-purpose |
| SA-F2-02 | Schema Validator | gamification_system | general-purpose |
| SA-F2-03 | Schema Validator | educational_content | general-purpose |
| SA-F2-04 | Schema Validator | progress_tracking | general-purpose |
| SA-F2-05 | Schema Validator | social_features | general-purpose |
| SA-F2-06 | Schema Validator | content_management | general-purpose |
| SA-F2-07 | Schema Validator | notifications | general-purpose |
| SA-F2-08 | Schema Validator | admin_dashboard + audit_logging | general-purpose |
| SA-F2-09 | Schema Validator | schemas menores (6) | general-purpose |

### FASE-3: Validacion por Proceso (hasta 8 agentes)

| ID | Perfil | Proceso | Tipo |
|----|--------|---------|------|
| SA-F3-01 | Process Validator | Auth E2E | general-purpose |
| SA-F3-02 | Process Validator | Educativo E2E | general-purpose |
| SA-F3-03 | Process Validator | Gamificacion E2E | general-purpose |
| SA-F3-04 | Process Validator | Social E2E | general-purpose |
| SA-F3-05 | Process Validator | Admin E2E | general-purpose |
| SA-F3-06 | Process Validator | Notificaciones E2E | general-purpose |
| SA-F3-07 | Process Validator | Padres + LTI E2E | general-purpose |

### FASE-4: Definiciones (4 agentes)

| ID | Perfil | Documento | Tipo |
|----|--------|-----------|------|
| SA-F4-01 | ER Designer | Diagrama ER | general-purpose |
| SA-F4-02 | Traceability Analyst | Matriz Trazabilidad | general-purpose |
| SA-F4-03 | Tech Writer | Specs Tecnicas | general-purpose |
| SA-F4-04 | Requirements Analyst | User Stories | general-purpose |

### FASE-5: Purga (4 agentes)

| ID | Perfil | Area | Tipo |
|----|--------|------|------|
| SA-F5-01 | Doc Cleaner | _archive evaluation | Explore |
| SA-F5-02 | Doc Cleaner | Active tasks evaluation | Explore |
| SA-F5-03 | Doc Cleaner | Guias + deprecated | Explore |
| SA-F5-04 | Index Updater | Indices y mapas | general-purpose |

---

## Totales

| Fase | Agentes | Tipo Predominante |
|------|---------|-------------------|
| FASE-1 | 6 | Explore |
| FASE-2 | 9 | general-purpose |
| FASE-3 | 7 | general-purpose |
| FASE-4 | 4 | general-purpose |
| FASE-5 | 4 | Explore/general-purpose |
| FASE-6 | 1 | Orquestador |
| **TOTAL** | **31 instancias** | - |

**Nota:** No todos se ejecutan simultaneamente. Maximo concurrente: 10 agentes (FASE-2).

---

*Agent Profiles v1.0.0 - 2026-02-05*
