# PLAN DE EJECUCION ORDENADO

**Tarea:** TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS
**Fase:** Post-Analisis
**Fecha:** 2026-02-02
**Objetivo:** Corregir discrepancias y establecer SSOT

---

## RESUMEN DE HALLAZGOS

### Discrepancias Criticas Identificadas

| Metrica | Antes (Documentado) | Despues (Auditado) | Delta |
|---------|---------------------|-------------------|-------|
| Funciones activas | 15-232 | **119** | Reconciliado |
| Triggers activos | 10-109 | **58** | Reconciliado |
| Tablas | 138-147 | **140** | Menor |
| ENUMs | 36-39 | **36** | Menor |
| Views | 13-20 | **13** | Corregido |
| Materialized Views | 4-11 | **4** | Corregido |

### SSOT Establecido

El archivo `INVENTARIO-RECONCILIADO.yml` es ahora la fuente de verdad.

---

## FASE A: CORRECCIONES CRITICAS (P0)

**Tiempo estimado:** 30 minutos
**Ejecutable en paralelo:** Si (3 agentes)

### A.1 Corregir MASTER_INVENTORY.yml

**Archivo:** `orchestration/inventarios/MASTER_INVENTORY.yml`

**Cambios requeridos:**
```yaml
database:
  functions: 119   # Era: 15 (ERROR)
  triggers: 58     # Era: 10 (ERROR), nota: 37 archivos
  tables: 140      # Era: 138
  views: 13        # Era: 20 (ERROR)
  materialized_views: 4  # Era: 11 (ERROR)
  enums: 36        # Sin cambios
```

**Verificacion:**
- [ ] Campo functions actualizado
- [ ] Campo triggers actualizado
- [ ] Campo views actualizado
- [ ] Campo materialized_views actualizado
- [ ] Fecha de actualizacion cambiada a 2026-02-02
- [ ] Referencia a TASK-2026-02-02 agregada

---

### A.2 Corregir DATABASE_INVENTORY.yml

**Archivo:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

**Cambios requeridos:**
```yaml
metadata:
  last_updated: "2026-02-02"
  last_update_task: "TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS"

database_counts:
  functions_active: 119      # Era: 232 (incluia built-ins)
  functions_deprecated: 14   # Mantener
  triggers_active: 58        # Era: 109
  triggers_files: 37         # Nuevo campo
  enums: 36                  # Era: 39
```

**Agregar seccion:**
```yaml
audit_2026_02_02:
  description: "Reconciliacion de metricas mediante auditoria directa DDL"
  task_id: "TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS"
  methodology: "Conteo directo de archivos .sql excluyendo _deprecated"
  changes_summary:
    - "CORREGIDO: functions_active 232 -> 119 (conteo real)"
    - "CORREGIDO: triggers_active 109 -> 58 (conteo real)"
    - "CORREGIDO: enums 39 -> 36 (excluyendo deprecated)"
  discrepancy_analysis: |
    El valor anterior (232 funciones) incluia:
    - Funciones built-in de PostgreSQL en el resumen de DB recreation
    - Funciones deprecated contadas como activas
    - Posibles duplicados entre schemas y 00-prerequisites.sql
```

---

### A.3 Corregir PROJECT-STATUS.md

**Archivo:** `orchestration/PROJECT-STATUS.md`

**Cambios en seccion "Metricas Reales Auditadas":**

```markdown
| DDL | Funciones | 119 (+14 deprecated) |  # Era: 89
| DDL | Triggers | 58 (37 archivos) |      # Era: 37
```

**Agregar nota:**
```markdown
*Metricas reconciliadas en TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS*
```

---

## FASE B: TRAZABILIDAD DDL-REQUERIMIENTOS (P1)

**Tiempo estimado:** 2 horas
**Dependencias:** Fase A (inventarios correctos)

### B.1 Crear Matriz Schema-Dominio

**Archivo a crear:** `MATRIZ-TRAZABILIDAD-DDL-RF.yml`

**Contenido:**
```yaml
schema_to_domain_mapping:
  auth_management:
    primary_domain: RF-AUTH
    secondary_domains: [RF-SYS]
    tables: 18
    coverage: "100%"

  gamification_system:
    primary_domain: RF-GAM
    secondary_domains: [RF-PEER]
    tables: 19
    coverage: "100%"

  educational_content:
    primary_domain: RF-EDU
    secondary_domains: [RF-CONT]
    tables: 21
    coverage: "100%"

  # ... continuar para todos los schemas
```

### B.2 Mapear Tablas a User Stories

**Metodologia:**
1. Para cada tabla, identificar US que la requiere
2. Usar nombre de tabla y documentacion DDL
3. Marcar tablas de infraestructura como "N/A - Infraestructura"

**Campos del mapeo:**
```yaml
table_to_us:
  auth_management.users:
    user_stories: [US-FUND-001, US-FUND-002]
    epic: EAI-001
    status: implemented

  gamification_system.user_achievements:
    user_stories: [US-GAM-001]
    epic: EAI-003
    status: implemented
```

### B.3 Mapear Funciones a Especificaciones

**Metodologia por categoria:**

| Categoria | Patron | Mapeo ET |
|-----------|--------|----------|
| Validadores | validate_* | ET-EDU-004 |
| Gamificacion | award_*, check_*, promote_* | ET-GAM-xxx |
| Autenticacion | get_current_*, is_admin | ET-AUTH-xxx |
| Utilidades | update_*, cleanup_* | Infraestructura |

### B.4 Identificar Objetos Huerfanos

**Criterio:** Objetos sin US/ET asignado que no sean infraestructura

**Acciones por tipo:**
- **Tablas huerfanas:** Crear US o marcar para depreciacion
- **Funciones huerfanas:** Evaluar si son realmente usadas
- **Triggers huerfanos:** Verificar si tienen funcion clara

---

## FASE C: DETECCION DE ANOMALIAS (P1)

**Tiempo estimado:** 1 hora
**Ejecutable en paralelo con:** Fase B

### C.1 Verificar Duplicados

**Funciones a verificar:**
- Buscar funciones con mismo nombre en diferentes schemas
- Buscar funciones con funcionalidad similar

**Resultado esperado:** Lista de duplicados con recomendacion

### C.2 Verificar Triggers Redundantes

**Verificar:**
- Multiples triggers en misma tabla para mismo evento
- Triggers que hacen lo mismo que funciones de aplicacion

### C.3 Verificar Tablas Redundantes

**Patrones a buscar:**
- *_log vs *_logs
- *_activity vs *_activities
- Tablas con >80% columnas iguales

---

## FASE D: ACTUALIZACION FINAL (P2)

**Tiempo estimado:** 30 minutos
**Dependencias:** Fases A, B, C

### D.1 Actualizar Trazas

**Archivos:**
- orchestration/trazas/TRAZA-TAREAS-DATABASE.md
- orchestration/trazas/TRAZA-REQUERIMIENTOS.md

### D.2 Actualizar _INDEX.yml

**Archivo:** orchestration/tareas/_INDEX.yml

**Agregar:**
```yaml
TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS:
  estado: completada
  tipo: ANALYSIS
  fecha: 2026-02-02
  descripcion: "Auditoria integral BD vs Requerimientos, reconciliacion inventarios"
```

### D.3 Commit Final

```bash
git add orchestration/tareas/TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS/
git add orchestration/inventarios/
git commit -m "[GAMILIT] docs: Complete database audit and inventory reconciliation

TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS

Reconciled metrics:
- Functions: 232 -> 119 (actual active)
- Triggers: 109 -> 58 (actual active)
- Tables: 140 (verified)
- ENUMs: 36 (verified)

Created:
- INVENTARIO-RECONCILIADO.yml (new SSOT)
- PLAN-AUDITORIA-BD.md (21 subtasks)
- MATRIZ-TRAZABILIDAD-DDL-RF.yml

Updated:
- DATABASE_INVENTORY.yml
- MASTER_INVENTORY.yml
- PROJECT-STATUS.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main
```

---

## DIAGRAMA DE EJECUCION

```
                    ┌─────────────────────────────┐
                    │      FASE A: P0             │
                    │  Correcciones Criticas      │
                    │       (30 min)              │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │   A.1    │  │   A.2    │  │   A.3    │
              │ MASTER_  │  │DATABASE_ │  │ PROJECT_ │
              │INVENTORY │  │INVENTORY │  │ STATUS   │
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   └─────────────┼─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌───────────┐      ┌───────────┐      ┌───────────┐
        │  FASE B   │      │  FASE C   │      │    ...    │
        │Trazabilidad│     │ Anomalias │      │           │
        │  (2h)     │      │  (1h)     │      │           │
        └─────┬─────┘      └─────┬─────┘      └───────────┘
              │                  │
              └────────┬─────────┘
                       │
                       ▼
                ┌───────────────┐
                │    FASE D     │
                │  Actualizacion│
                │    Final      │
                │   (30 min)    │
                └───────────────┘
```

---

## CRITERIOS DE EXITO

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Inventarios con mismos valores | Pendiente |
| 2 | Funciones = 119 en todos los docs | Pendiente |
| 3 | Triggers = 58 en todos los docs | Pendiente |
| 4 | SSOT establecido (INVENTARIO-RECONCILIADO.yml) | COMPLETADO |
| 5 | Matriz de trazabilidad creada | Pendiente |
| 6 | Anomalias documentadas | Pendiente |
| 7 | Commit realizado | Pendiente |

---

## ASIGNACION DE AGENTES

| Fase | Agente Recomendado | Paralelismo |
|------|-------------------|-------------|
| A.1, A.2, A.3 | 3 agentes Edit | Paralelo |
| B.1-B.4 | 1 agente Explore + 1 agente Edit | Secuencial |
| C.1-C.3 | 1 agente Explore | Secuencial |
| D.1-D.3 | 1 agente principal | Secuencial |

---

*Sistema SIMCO v4.3.0 - GAMILIT*
*Ciclo CAPVED completado en Fase 1*
*Fecha: 2026-02-02*
