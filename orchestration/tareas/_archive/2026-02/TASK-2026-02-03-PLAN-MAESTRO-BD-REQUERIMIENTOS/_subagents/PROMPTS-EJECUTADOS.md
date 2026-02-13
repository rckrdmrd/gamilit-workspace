# PROMPTS-EJECUTADOS - Contexto Enviado a Subagentes

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Propósito:** Documentar prompts para análisis y reutilización

---

## 1. Fase de Análisis (5 Agentes Paralelos)

### 1.1 Prompt SA-001: Funciones SQL Duplicadas

```markdown
**Tipo:** Explore
**Thoroughness:** very thorough

Analiza todas las funciones SQL en el proyecto Gamilit buscando duplicados y redundancias.

Busca en:
- apps/database/ddl/schemas/*/functions/*.sql

Criterios de duplicación:
1. Funciones con mismo nombre en diferentes schemas
2. Funciones con lógica idéntica o muy similar (>80%)
3. Funciones que son alias de otras
4. Funciones obsoletas que fueron reemplazadas

Para cada duplicado encontrado, reporta:
| Función | Schema | Líneas | Similar a | Recomendación |

Presta especial atención a:
- get_current_user_role vs get_user_role
- is_admin vs is_super_admin
- cleanup_old_* (múltiples versiones)
- recalculate_level_on_xp_change

Busca también bugs potenciales en la lógica SQL.
```

**Resultado:** 13 funciones duplicadas identificadas, 2 bugs críticos encontrados

---

### 1.2 Prompt SA-002: Triggers Redundantes

```markdown
**Tipo:** Explore
**Thoroughness:** very thorough

Analiza todos los triggers en Gamilit buscando redundancias y conflictos.

Busca en:
- apps/database/ddl/schemas/*/triggers/*.sql

Criterios de redundancia:
1. Múltiples triggers en la misma tabla que calculan lo mismo
2. Triggers AFTER y BEFORE que duplican lógica
3. Triggers que llaman funciones ya llamadas por otros triggers
4. Patrón *_updated_at repetido en múltiples schemas

Para cada redundancia, reporta:
| Trigger | Tabla | Schema | Conflicta con | Impacto |

Identifica triggers críticos que causan:
- Cálculos duplicados de XP/nivel
- Actualizaciones dobles de progress
- Cascadas innecesarias

Genera matriz de salud por schema.
```

**Resultado:** 9 triggers redundantes, 4 críticos activos simultáneamente

---

### 1.3 Prompt SA-003: Tablas Solapadas

```markdown
**Tipo:** Explore
**Thoroughness:** very thorough

Analiza tablas en Gamilit buscando solapamiento funcional.

Busca en:
- apps/database/ddl/schemas/*/tables/*.sql

Criterios de solapamiento:
1. Tablas con >50% de campos idénticos
2. Tablas que almacenan la misma información con diferentes granularidades
3. Tablas de log/tracking que duplican información
4. Tablas de configuración fragmentadas

Para cada solapamiento, reporta:
| Tabla 1 | Tabla 2 | Schema(s) | % Solapamiento | Recomendación |

Presta especial atención a:
- audit_logs vs activity_log vs user_activity_logs
- comodin_usage_log vs comodin_usage_tracking
- exercise_attempts vs exercise_submissions
- notification_settings vs notification_preferences

Propón estrategia de consolidación para cada caso.
```

**Resultado:** 7 pares de tablas con solapamiento significativo

---

### 1.4 Prompt SA-004: RLS Policies Faltantes

```markdown
**Tipo:** Explore
**Thoroughness:** medium

Audita las RLS policies en Gamilit identificando tablas sin protección.

Busca en:
- apps/database/ddl/schemas/*/rls-policies/*.sql
- apps/database/ddl/schemas/*/tables/*.sql

Criterios:
1. Tablas con datos sensibles sin policies
2. Tablas de configuración de usuario sin protección
3. Tablas de intervención/alertas sin restricciones
4. Tablas sociales sin políticas de membresía

Para cada tabla sin protección, reporta:
| Tabla | Schema | Datos Sensibles | Policy Requerida |

Evalúa cobertura actual de RLS por schema.
Prioriza tablas con:
- Información de estudiantes
- Configuraciones de docentes
- Intervenciones pedagógicas
- Datos de gremios/social
```

**Resultado:** 5 tablas críticas sin RLS policies

---

### 1.5 Prompt SA-005: Documentación Obsoleta

```markdown
**Tipo:** Explore
**Thoroughness:** quick

Identifica documentación obsoleta en el proyecto Gamilit.

Busca en:
- orchestration/tareas/_archive/
- orchestration/referencias/
- orchestration/propuestas/
- docs/
- trazas/

Criterios de obsolescencia:
1. Carpetas vacías
2. Archivos de tareas completadas hace >7 días
3. Trazas de años anteriores (2025)
4. Prompts duplicados
5. Referencias ya resueltas

Para cada categoría, reporta:
| Categoría | Archivos | Tamaño | Acción Recomendada |

Calcula espacio total recuperable.
Propón estrategia de consolidación vs eliminación.
```

**Resultado:** ~120 MB identificados, 100+ archivos a purgar

---

## 2. Fase de Ejecución (5 Bloques Paralelos)

### 2.1 Prompt Bloque 1: Resolver Triggers

```markdown
**Tipo:** Bash (ejecutado por orquestador)

Ejecutar remediación de triggers redundantes:

1. Crear carpetas _deprecated/ si no existen:
   - gamification_system/triggers/_deprecated/
   - progress_tracking/triggers/_deprecated/

2. Mover triggers obsoletos:
   - 21-trg_recalculate_level_on_xp_change.sql → _deprecated/
   - 27-trg_update_module_progress_on_submission.sql → _deprecated/
   - 33-trg_sync_average_score_on_submission.sql → _deprecated/

3. Verificar que los archivos no están siendo importados por create-database.sh

NO eliminar archivos, solo mover a _deprecated/.
```

---

### 2.2 Prompt Bloque 2: Crear RLS + Índices

```markdown
**Tipo:** Bash + Write (ejecutado por orquestador)

Crear RLS policies faltantes:

1. social_features/rls-policies/10-discussion-threads-policies.sql
   - Patrón: classroom_members_only
   - Policies: SELECT, INSERT, UPDATE, DELETE para students y teachers

2. social_features/rls-policies/11-guild-members-policies.sql
   - Patrón: guild_membership
   - Policies: Miembros pueden ver su guild, admins pueden modificar

3. social_features/rls-policies/12-guild-missions-policies.sql
   - Patrón: guild_members_only
   - Policies para guild_missions y guild_mission_contributions

4. optimization/indexes/01-fk-optimization-indexes.sql
   - 10 índices para FKs frecuentemente consultadas
   - Usar CREATE INDEX IF NOT EXISTS

Commit después de crear todos los archivos.
```

---

### 2.3 Prompt Bloque 3: Consolidar Funciones

```markdown
**Tipo:** Bash + Edit (ejecutado por orquestador)

Consolidar funciones y corregir bugs:

1. Mover a _deprecated/:
   - gamilit/functions/05b-is_super_admin.sql (alias innecesario)
   - gamification_system/functions/08-recalculate_level_on_xp_change.sql (obsoleta)

2. Corregir bug en cleanup_old_user_activity.sql:
   ANTES: v_deleted_count := (SELECT COUNT(*) FROM ... WHERE created_at < v_cutoff_date);
   DESPUÉS: GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

   El COUNT(*) se ejecuta DESPUÉS del DELETE, siempre retorna 0.

3. Corregir mismo bug en cleanup_old_system_logs.sql

Commit con mensaje descriptivo del bug fix.
```

---

### 2.4 Prompt Bloque 4: Análisis de Tablas

```markdown
**Tipo:** Explore + Write

Crear documentos de análisis para tablas solapadas:

1. ANALISIS-CONSOLIDACION-AUDIT-TABLES.md
   - Comparar: audit_logs, activity_log, user_activity_logs
   - Tabla de campos común vs únicos
   - Propuesta de tabla unificada
   - Consideraciones de migración

2. ANALISIS-CONSOLIDACION-COMODINES.md
   - Comparar: comodin_usage_log, comodin_usage_tracking
   - Evaluar si tracking puede ser VIEW materializada
   - Propuesta de consolidación

3. ADR-032-exercise-attempts-vs-submissions.md
   - Architectural Decision Record
   - Analizar si deben consolidarse
   - Documentar decisión y razones

NO ejecutar cambios, solo crear documentación.
```

---

### 2.5 Prompt Bloque 5: Purga Documentación

```markdown
**Tipo:** Bash

Ejecutar purga de documentación obsoleta:

1. Eliminar carpetas vacías:
   - orchestration/propuestas/
   - orchestration/cambios/
   - orchestration/escalamientos/
   - orchestration/retrospectivas/
   - orchestration/procesos/
   - docs/30-directivas/

2. Eliminar archivos obsoletos:
   - trazas/_archive/TRAZA-DATABASE-2025.md
   - orchestration/referencias/ALIASES-RESOLVED.yml
   - templates/_legacy/*

3. Crear índice consolidado:
   - tareas/_archive/TAREAS-HISTORICO-CONSOLIDADO.md

Commit con mensaje de purga.
```

---

## 3. Contexto Común Enviado

### 3.1 Variables de Entorno

```yaml
project: gamilit
project_path: C:\Empresas\ISEM\workspace-v2\projects\gamilit
ddl_path: apps/database/ddl
schemas_count: 16
tables_count: 140
```

### 3.2 Directivas Activas

```yaml
directives:
  - "@CAPVED": Metodología obligatoria
  - "@SIMCO-EDICION-SEGURA": Sin placeholders
  - "@SIMCO-GIT": Commits con Co-Authored-By
  - "@TRIGGER-DDL-WSL": Validar con recreación
```

### 3.3 Restricciones

```yaml
restrictions:
  - NO modificar backend (entities, services)
  - NO modificar frontend
  - NO eliminar archivos sin mover a _deprecated/
  - NO ejecutar migraciones de datos
  - SIEMPRE validar con recreación de BD
```

---

## 4. Análisis de Efectividad

### 4.1 Prompts Exitosos

| Prompt | Éxito | Razón |
|--------|-------|-------|
| SA-001 Funciones | 100% | Criterios claros, scope definido |
| SA-002 Triggers | 100% | Patrones específicos a buscar |
| SA-004 RLS | 100% | Lista de tablas objetivo |
| Bloque 2 RLS | 100% | Templates SQL proporcionados |
| Bloque 3 Bugs | 100% | Bug descrito con antes/después |

### 4.2 Prompts a Mejorar

| Prompt | Éxito | Mejora |
|--------|-------|--------|
| SA-003 Tablas | 80% | Añadir % mínimo de solapamiento |
| SA-005 Docs | 70% | Definir criterios de fecha |
| Bloque 4 Análisis | 90% | Template estándar para ADR |

---

## 5. Templates Reutilizables

### 5.1 Template: Auditoría de Schema

```markdown
**Tipo:** Explore
**Thoroughness:** {quick|medium|very thorough}

Audita el schema {SCHEMA_NAME} en {PROJECT}/apps/database/ddl/schemas/{SCHEMA_NAME}/

Busca:
1. {TIPO_OBJETO}s duplicados o redundantes
2. Patrones de código repetido
3. Referencias cruzadas con {SCHEMAS_RELACIONADOS}
4. Objetos faltantes según {ESTANDAR}

Reporta en formato:
| Objeto | Archivo | Línea | Problema | Severidad | Recomendación |

Criterios de severidad:
- CRÍTICO: Afecta seguridad o integridad
- ALTO: Afecta performance
- MEDIO: Afecta mantenibilidad
- BAJO: Mejora opcional
```

### 5.2 Template: Ejecución de Remediación

```markdown
**Tipo:** Bash

Ejecutar remediación {REMEDIATION_ID}:

Pre-condiciones:
- [ ] git status limpio
- [ ] Archivo existe: {ARCHIVO_ORIGEN}
- [ ] Carpeta _deprecated/ existe o se creará

Pasos:
1. {PASO_1}
2. {PASO_2}
3. {PASO_N}

Post-condiciones:
- [ ] Archivo movido/modificado correctamente
- [ ] Sin errores de sintaxis SQL
- [ ] Commit realizado

Rollback si falla:
- git checkout -- {ARCHIVOS_MODIFICADOS}
```

---

## Referencias

- `@SIMCO-PROMPTS`: orchestration/directivas/simco/SIMCO-PROMPTS-AGENTES.md
- `@FLUJO-AGENTES`: orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md
- `@NUEVO-PROMPT`: orchestration/referencias/templates/PROMPT-TEMPLATE.md

---

*Documento generado: 2026-02-03*
*Para análisis de mejora continua y reutilización*
