# AGENT-PROFILES - Perfiles de Subagentes Utilizados

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Orquestador:** claude-opus-4-5

---

## 1. Resumen de Agentes

| ID | Tipo | Propósito | Resultado |
|----|------|-----------|-----------|
| SA-001 | Explore | Análisis funciones SQL | 13 duplicadas |
| SA-002 | Explore | Análisis triggers BD | 9 redundantes |
| SA-003 | Explore | Análisis tablas/schemas | 7 solapadas |
| SA-004 | Explore | Análisis RLS policies | 5 faltantes |
| SA-005 | Explore | Análisis documentación | ~120 MB obsoleta |
| SA-006 | Bash | Ejecución bloque 1 | Triggers deprecados |
| SA-007 | Bash | Ejecución bloque 2 | RLS + índices |
| SA-008 | Bash | Ejecución bloque 3 | Funciones + bugs |
| SA-009 | Explore | Ejecución bloque 4 | Análisis tablas |
| SA-010 | Bash | Ejecución bloque 5 | Purga docs |

---

## 2. Perfiles Detallados

### 2.1 SA-001: Analizador de Funciones SQL

**Tipo:** Explore (subagent_type)
**Modelo:** Heredado del orquestador (Opus 4.5)

**Capacidades:**
- Búsqueda de patrones en archivos .sql
- Análisis de duplicación de código
- Detección de funciones con mismo nombre en diferentes schemas
- Identificación de bugs en lógica SQL

**Herramientas Disponibles:**
- Glob: Búsqueda de archivos
- Grep: Búsqueda de contenido
- Read: Lectura de archivos

**Limitaciones:**
- No puede editar archivos
- No puede ejecutar comandos bash
- Límite de tokens por respuesta

---

### 2.2 SA-002: Analizador de Triggers

**Tipo:** Explore
**Modelo:** Heredado

**Capacidades:**
- Mapeo de triggers por tabla
- Detección de triggers que ejecutan misma lógica
- Análisis de orden de ejecución (BEFORE/AFTER)
- Identificación de cascadas peligrosas

**Herramientas:** Glob, Grep, Read

---

### 2.3 SA-003: Analizador de Schemas/Tablas

**Tipo:** Explore
**Modelo:** Heredado

**Capacidades:**
- Comparación de estructuras de tablas
- Detección de campos redundantes
- Análisis de FKs y relaciones
- Evaluación de normalización

**Herramientas:** Glob, Grep, Read

---

### 2.4 SA-004: Analizador de RLS Policies

**Tipo:** Explore
**Modelo:** Heredado

**Capacidades:**
- Inventario de policies existentes
- Detección de tablas sin protección
- Análisis de patrones de policies
- Evaluación de cobertura de seguridad

**Herramientas:** Glob, Grep, Read

---

### 2.5 SA-005: Analizador de Documentación

**Tipo:** Explore
**Modelo:** Heredado

**Capacidades:**
- Identificación de archivos obsoletos
- Detección de duplicados
- Análisis de estructura de carpetas
- Evaluación de contenido vs fecha

**Herramientas:** Glob, Grep, Read

---

### 2.6 SA-006 a SA-010: Agentes de Ejecución

**Tipo:** Bash (para ejecución) o Explore (para análisis)
**Modelo:** Heredado

**Capacidades:**
- Ejecución de comandos git
- Movimiento de archivos
- Creación de carpetas _deprecated/
- Edición de archivos SQL

**Herramientas:** Bash, Edit, Write, Read

---

## 3. Configuración del Orquestador

### 3.1 Modelo Principal

```yaml
orchestrator:
  model: claude-opus-4-5
  model_id: claude-opus-4-5-20251101
  context_window: unlimited (summarization)
  tools_available:
    - Task (spawn subagents)
    - Bash (execute commands)
    - Read, Write, Edit (file operations)
    - Glob, Grep (search)
    - WebFetch, WebSearch (optional)
```

### 3.2 Estrategia de Paralelización

```yaml
parallelization:
  max_concurrent_agents: 5
  strategy: "fan-out-fan-in"
  sync_points:
    - after_analysis: "consolidate findings"
    - after_execution: "verify commits"
    - after_validation: "generate report"
```

### 3.3 Delegación de Tareas

| Complejidad | Tipo de Agente | Razón |
|-------------|----------------|-------|
| Búsqueda simple | Explore | Rápido, bajo costo |
| Análisis profundo | Explore (thorough) | Completo, preciso |
| Ejecución de comandos | Bash | Acceso a shell |
| Edición de archivos | Directo (orquestador) | Control de calidad |

---

## 4. Métricas de Agentes

### 4.1 Tokens Consumidos (Estimado)

| Agente | Tokens Input | Tokens Output | Total |
|--------|--------------|---------------|-------|
| SA-001 | ~20,000 | ~5,000 | ~25,000 |
| SA-002 | ~15,000 | ~3,000 | ~18,000 |
| SA-003 | ~25,000 | ~8,000 | ~33,000 |
| SA-004 | ~10,000 | ~2,000 | ~12,000 |
| SA-005 | ~30,000 | ~5,000 | ~35,000 |
| **Análisis Total** | ~100,000 | ~23,000 | ~123,000 |
| Ejecución (5 bloques) | ~50,000 | ~15,000 | ~65,000 |
| **TOTAL ESTIMADO** | ~150,000 | ~38,000 | ~188,000 |

### 4.2 Duración de Agentes

| Fase | Agentes | Duración Total | Duración Paralela |
|------|---------|----------------|-------------------|
| Análisis | 5 | ~5 min c/u | ~5 min (paralelo) |
| Ejecución | 5 | ~3 min c/u | ~3 min (paralelo) |
| **Total** | 10 | ~40 min sec | ~8 min paralelo |

**Ahorro por paralelización:** ~80%

---

## 5. Lecciones para Reutilización

### 5.1 Perfil Recomendado: Auditor de BD

```yaml
profile: database-auditor
type: Explore
thoroughness: "very thorough"

prompt_template: |
  Analiza el schema {schema_name} en {ddl_path} buscando:
  1. {specific_objects} duplicados o redundantes
  2. Patrones de código repetido
  3. Referencias cruzadas con otros schemas
  4. Objetos faltantes según estándares

  Reporta en formato tabla con columnas:
  | Objeto | Ubicación | Problema | Recomendación |

tools_to_use:
  - Glob: "**/{schema_name}/**/*.sql"
  - Grep: patterns específicos
  - Read: archivos relevantes
```

### 5.2 Perfil Recomendado: Ejecutor de Remediación

```yaml
profile: remediation-executor
type: Bash (via orquestador)

prompt_template: |
  Ejecuta la remediación {remediation_id}:
  1. Verifica estado actual con git status
  2. Crea carpeta _deprecated/ si no existe
  3. Mueve archivos obsoletos
  4. Verifica no hay errores de sintaxis
  5. Commit con mensaje estándar

  NO modificar archivos que no estén en la lista.

tools_to_use:
  - Bash: git, mkdir, mv
  - Read: verificar contenido
```

---

## 6. Mejoras Propuestas

### 6.1 Para Análisis

| Mejora | Beneficio | Esfuerzo |
|--------|-----------|----------|
| Cache de resultados de Glob | Reducir llamadas repetidas | Bajo |
| Template de reporte estándar | Consistencia entre agentes | Medio |
| Validación cruzada automática | Detectar contradicciones | Alto |

### 6.2 Para Ejecución

| Mejora | Beneficio | Esfuerzo |
|--------|-----------|----------|
| Dry-run antes de ejecución | Prevenir errores | Bajo |
| Rollback automático en falla | Seguridad | Medio |
| Verificación post-commit | Garantía de integridad | Bajo |

---

## Referencias

- `@AGENT-ROLES`: orchestration/agents/AGENT-ROLES.md
- `@EXEC-STANDARDS`: orchestration/agents/AGENT-EXECUTION-STANDARDS.md
- `@FLUJO-AGENTES`: orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md

---

*Documento generado: 2026-02-03*
*Para análisis de mejora continua*
