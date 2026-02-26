# ANALISIS TRANSVERSAL AGENTES — 2026-02-17 (Consolidado)

> Consolidado: 2026-02-26 | Fusiona 4 archivos originales en 1

**Estado global:** COMPLETADO

---

## 1) Inventario de Agentes

- Perfiles full activos: 28 | Compact: 15 | Archivados: 5 | Total: 52 archivos
- Skills activos: 5 (3 SIMCO + 2 community)
- Registry SSOT: `orchestration/inventarios/SKILLS-REGISTRY.yml`
- Perfiles transversales: ORQUESTADOR, BACKEND-NESTJS, FRONTEND-REACT, DATABASE-POSTGRESQL, INTEGRATION-VALIDATOR

## 2) Matriz Transversal Perfil-Skill-Proceso-Template

| Perfil | Skills | Procesos | Templates | Estado |
|--------|--------|----------|-----------|--------|
| ORQUESTADOR | task-execution, safe-edit, apply-standard | TAREA, INICIALIZACION, DELEGACION* | delegacion*, session-tracking | Parcial |
| BACKEND-NESTJS | task-execution, safe-edit, apply-standard | TAREA, BACKEND, MODIFICAR | delegacion estandar/completa | Parcial |
| FRONTEND-REACT | +vercel-v0-dev | TAREA, FRONTEND, MODIFICAR | delegacion estandar/completa | Parcial |
| DATABASE-POSTGRESQL | task-execution, safe-edit, apply-standard | TAREA, DDL, MODIFICAR | delegacion estandar/completa | Parcial |
| INTEGRATION-VALIDATOR | task-execution, apply-standard | TAREA, VALIDAR, CONTEXT-MANAGEMENT | validacion + session-tracking | Parcial |

### Gaps identificados (6)
- G-T1 (Alta): Contrato Claude Task tool no propagado a delegacion
- G-T2 (Alta): Skills sin contrato I/O en frontmatter
- G-T3..G-T6 (Media): SOLID documental, Story->Task template, tracking paralelo, resolver validation

## 3) Validacion IoC de Contexto

3 escenarios simulados — todos PASS:
- A: Tarea documental amplia (IoC via CONTEXT-MAP)
- B: Bug fix puntual (carga L0+L1+L2+L3 lazy)
- C: Recovery post-compactacion (via PROXIMA-ACCION)

### Gaps cerrados (4)
- GAP-1: Claude Code Task tool → sec 8.5 en SIMCO-CONTEXT-MANAGEMENT-V2
- GAP-2: Reference-Not-Content → nota en SIMCO-CONTEXT-CLEANUP
- GAP-3: Directiva legacy → deprecada con redireccion
- GAP-4: Mapping documental → CONTEXT-MAP extendido

## 4) Implementacion (4 lotes completados)

- **Lote 1:** Contrato transversal perfiles (PERFIL-CONTRATO-TRANSVERSAL.md, PERFIL-CONTRATO-COMPACT.md)
- **Lote 2:** Skills con contrato I/O + resolver/registry actualizado
- **Lote 3:** Procesos SIMCO alineados (TAREA, INICIALIZACION, DELEGACION*)
- **Lote 4:** Templates nuevos (CLAUDE-TASK-TOOL, STORY-TO-TASK) + tracking/README

### Validacion tecnica
- Resolver SSOT: `ok: true, errors: []`
- Lints: sin errores

## 5) Riesgos Residuales

- Perfiles legacy con refs historicas a rutas de otros workspaces
- Validacion del resolver es sintactica; falta prueba de integracion automatizada
