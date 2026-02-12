# SIMCO: ORCHESTRATION PATTERNS

**Version:** 1.0.0
**Sistema:** SIMCO v4.0
**Proposito:** Patrones de orquestacion probados en proyectos reales
**Fecha:** 2026-02-11

---

## PATRONES VALIDADOS

### P1: N-Dimension Audit

**Use Case:** Auditoria integral de un proyecto existente
**Agents:** N parallel analysis agents (Claude subagents or Gemini CLI)
**Observed:** Trading Platform (7D), erp-core (9D), Gamilit (5D)

```yaml
FLOW:
  1_define_dimensions:
    - Cada dimension = 1 agente independiente
    - Ejemplo 7D: docs, arch, DDL, backend, frontend, MCP, devops
  2_parallel_audit:
    - Lanzar N agentes simultaneos (max 5 Claude, max 2 Gemini)
    - Cada agente produce 1 reporte con score 0-100
  3_consolidate:
    - Orquestador consolida N reportes → 1 plan de correccion
    - Priorizar por score: P0 (<60), P1 (<75), P2 (<85), P3 (<95)
  4_execute_waves:
    - Ejecutar correcciones usando P2 (Wave Execution)

SCORES_OBSERVADOS:
  trading: 77 → 97 (7D, 6 waves)
  erp-core: 55 → 90 (9D, 6 sprints)
  gamilit: 78 → 96 (5D, 4 phases)

DURACION: 2-4h por proyecto (incluye correcciones)

PLATFORM_NOTES:
  - Gemini CLI: max 2 paralelos, foreground only on Windows
  - Claude subagents: max 5 paralelos, background may fail on Windows
  - Always validate agent output on filesystem (don't trust output alone)
```

### P2: Wave Execution

**Use Case:** Correcciones ordenadas por dependencia post-auditoria
**Agents:** Orquestador + N subagentes por wave
**Observed:** Trading (6 waves), erp-core (6 sprints), Gamilit (5 phases)

```yaml
FLOW:
  1_dependency_sort:
    - Ordenar hallazgos por dependencia (schema→code→docs→tests)
    - Agrupar en waves (cada wave = grupo sin dependencias internas)
  2_execute_wave:
    - Lanzar subagentes paralelos dentro de cada wave
    - Wave N+1 NO inicia hasta Wave N complete
  3_validate_wave:
    - Post-wave: verificar filesystem, counts, coherencia
    - Si fallo: corregir antes de siguiente wave
  4_score_update:
    - Recalcular score despues de cada wave

REGLAS:
  - Wave 0: siempre infraestructura/config
  - Waves 1-3: codigo + docs
  - Wave final: tests + validacion
  - max_waves: 8 (si > 8, re-evaluar scope)
```

### P3: Round-Based Validation

**Use Case:** Validacion iterativa con multiples rondas de agentes
**Agents:** Orquestador + agentes especializados por ronda
**Observed:** Gamilit Teacher Portal (2 rounds, 9 agents)

```yaml
FLOW:
  1_initial_round:
    - Lanzar agentes especializados por area (portal, API, DDL)
    - Cada agente produce lista de hallazgos con severity
  2_remediate:
    - Corregir hallazgos de ronda 1
    - Crear archivos/endpoints faltantes
  3_validation_round:
    - Re-lanzar agentes para verificar correcciones
    - Score debe mejorar o mantener (nunca decrementar sin justificacion)
  4_close:
    - Solo cerrar cuando score >= target

SCORES_OBSERVADOS:
  gamilit: Round 1 → 86%, Round 2 → 96%
```

### P4: Sprint Module Analysis

**Use Case:** Analisis profundo modulo por modulo de un proyecto
**Agents:** 1-2 agentes por modulo (secuencial por sprint)
**Observed:** erp-core (6 sprints, 238 entities, 13/32 routes)

```yaml
FLOW:
  1_inventory:
    - Listar todos los modulos del proyecto
    - Agrupar en sprints (4-6 modulos por sprint)
  2_per_sprint:
    - Analizar entities, services, controllers, DTOs
    - Validar DDL-Entity parity
    - Verificar route mounts
    - Contar tests
  3_cross_validate:
    - Cruzar resultados entre sprints
    - Detectar orphan code y missing coverage
  4_aggregate:
    - Health Score global del proyecto

DURACION: 30-60 min por sprint, 3-6h total
```

### P5: Block Migration

**Use Case:** Migrar proyecto completo desde cero o desde otra estructura
**Agents:** Orquestador + subagentes por bloque
**Observed:** erp-construccion (8 blocks, 156 tables, 177 entities, score 95%)

```yaml
FLOW:
  1_define_blocks:
    - B1: DDL (schemas + tables)
    - B2: Entities (TypeORM/TypeScript)
    - B3: Services + Controllers
    - B4: DTOs + Validation
    - B5: Routes + Auth
    - B6: Tests
    - B7: Documentation (CLAUDE.md, inventories)
    - B8: Infra (docker, scripts)
  2_execute_blocks:
    - Secuencial B1→B8 (cada uno depende del anterior)
    - Dentro de cada bloque: paralelo por modulo
  3_validate:
    - Post-block: count tables/entities/files vs expected
    - Final: tsc --noEmit, score calculation

SCORES_OBSERVADOS:
  erp-construccion: 0 → 95% (8 blocks, ~4h)
```

---

## MATRIZ DE SELECCION

```yaml
SELECCION_PATRON:
  proyecto_existente_sin_auditoria: P1 (N-Dimension Audit)
  post_auditoria_con_hallazgos: P2 (Wave Execution)
  validacion_post_correccion: P3 (Round-Based Validation)
  analisis_profundo_por_modulo: P4 (Sprint Module Analysis)
  proyecto_nuevo_o_migracion: P5 (Block Migration)

  combinaciones_comunes:
    auditoria_completa: P1 → P2 → P3
    mejora_continua: P4 → P2
    onboarding_proyecto: P5 → P1
```

---

## ANTI-PATTERNS

```yaml
ANTI_PATTERNS:
  - name: "Big Bang"
    descripcion: "Intentar corregir todo en 1 paso sin waves"
    consecuencia: "Errores en cascada, imposible debuggear"

  - name: "Trust Agent Output"
    descripcion: "Confiar en output de agente sin verificar filesystem"
    consecuencia: "Conteos fabricados, archivos vacios (0-byte)"

  - name: "Gemini Overload"
    descripcion: "> 2 Gemini CLI paralelos o > 4 en 30 min"
    consecuencia: "429 rate limit, recovery time impredecible"

  - name: "Background on Windows"
    descripcion: "Usar background agents en Windows para tareas criticas"
    consecuencia: "Output files vacios, resultados perdidos"
```

---

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `SIMCO-DELEGACION-PARALELA.md` | Limites de paralelismo |
| `SIMCO-MODEL-SELECTION.md` | Seleccion de modelo por tarea |
| `SIMCO-ORCHESTRATOR-VALIDATION-LOOP.md` | Validacion post-subagente |
| `SIMCO-PLATFORM-CONSTRAINTS.md` | Restricciones de plataforma |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0 | **Tipo:** Directiva de Orquestacion
