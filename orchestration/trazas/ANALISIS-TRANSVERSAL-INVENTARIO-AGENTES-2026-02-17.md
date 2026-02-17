# ANALISIS TRANSVERSAL - INVENTARIO TOTAL DE AGENTES

**Fecha:** 2026-02-17  
**Alcance:** perfiles, skills, procesos SIMCO y plantillas operativas  
**Estado:** COMPLETADO

---

## 1) Inventario canónico de perfiles

### Resumen
- Perfiles full activos: 28
- Perfiles compact: 15
- Perfiles archivados: 5
- Índices/catálogos de perfiles: 4
- Total en `orchestration/agents/perfiles/`: 52 archivos `.md`

### Fuentes
- `orchestration/agents/perfiles/_MAP.md`
- `orchestration/agents/perfiles/CATALOG.md`
- `orchestration/agents/perfiles/compact/_MAP-COMPACT.md`

### Perfiles transversales (prioridad de estandarización)
1. `PERFIL-ORQUESTADOR.md`
2. `PERFIL-BACKEND-NESTJS.md`
3. `PERFIL-FRONTEND-REACT.md`
4. `PERFIL-DATABASE-POSTGRESQL.md`
5. `PERFIL-INTEGRATION-VALIDATOR.md`

---

## 2) Inventario canónico de skills

### Skills activos detectados
- `orchestration/skills/simco-task-execution/SKILL.md`
- `orchestration/skills/simco-safe-edit/SKILL.md`
- `orchestration/skills/simco-apply-standard/SKILL.md`
- `orchestration/skills/community/vercel-labs-vercel-v0-dev/SKILL.md`
- `orchestration/skills/community/vercel-labs-vercel-next-deploy/SKILL.md`

### Registro y SSOT
- `orchestration/inventarios/SKILLS-REGISTRY.yml`
- `orchestration/agents/configs/PROFILE-SKILL-MAP.json`
- `docs/40-standards/ESTANDAR-SKILLS.md`

---

## 3) Inventario de procesos/tareas SIMCO

### Procesos principales de ejecución
- `orchestration/directivas/simco/SIMCO-TAREA.md`
- `orchestration/directivas/simco/SIMCO-INICIALIZACION.md`
- `orchestration/directivas/simco/SIMCO-WORK-ITEMS.md`

### Procesos de delegación/subagentes
- `orchestration/directivas/simco/SIMCO-DELEGACION.md`
- `orchestration/directivas/simco/SIMCO-DELEGACION-PARALELA.md`
- `orchestration/directivas/simco/SIMCO-SUBAGENTE.md`

### Procesos de contexto (NEXUS v4.1)
- `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md`
- `orchestration/directivas/simco/SIMCO-CONTEXT-CLEANUP.md`
- `orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md`
- `orchestration/CONTEXT-MAP.yml`

---

## 4) Inventario de plantillas operativas

### Delegación
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-CONTEXTO-SUBAGENTE.md`
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-DELEGACION-MINIMA.md`
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-DELEGACION-ESTANDAR.md`
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-DELEGACION-COMPLETA.md`
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-DELEGACION-SUBAGENTE.md`

### Session tracking / recovery
- `orchestration/templates/03-por-proceso/session-tracking/PROXIMA-ACCION-TEMPLATE.md`
- `orchestration/templates/03-por-proceso/session-tracking/TEMPLATE-RECOVERY-CONTEXT.md`
- `orchestration/templates/03-por-proceso/session-tracking/SESSION-TRACKING-TEMPLATE.yml`

### Work items
- `orchestration/templates/03-por-proceso/work-items/EPIC-TEMPLATE.yml`
- `orchestration/templates/03-por-proceso/work-items/STORY-TEMPLATE.yml`
- `orchestration/templates/03-por-proceso/work-items/STORY-TRACKING-TEMPLATE.yml`
- `orchestration/templates/03-por-proceso/work-items/TASK-METADATA-TEMPLATE.yml`

---

## 5) Hallazgos de baseline

- El ecosistema ya tiene cobertura documental amplia, pero con variaciones en contratos entre perfiles/skills/procesos.
- Hay integración parcial entre delegación y tracking paralelo; faltaba template explícito para Claude Task tool.
- El estándar de skills existe, pero no formaliza completamente contrato de entrada/salida por skill.
- La relación Story -> Task CAPVED está definida conceptualmente, pero requiere plantilla operativa explícita.

---

## 6) Resultado del to-do `inventario-total`

**Estado:** COMPLETADO  
**Evidencia:** este archivo + actualización de artefactos en lotes posteriores.
