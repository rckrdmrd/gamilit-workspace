# Auditoria AS-IS de Integracion de Perfiles, Principios y Skills

**Fecha:** 2026-02-17  
**Scope:** `gamilit` standalone  
**Objetivo:** establecer brechas reales entre la integracion documentada y la integracion ejecutable.

## Matriz Real vs Esperada

| Area | Esperado | Estado real | Brecha |
|---|---|---|---|
| Seleccion de perfil en inicializacion | Resolucion automatica y deterministica | Reglas en texto en `SIMCO-INICIALIZACION` y `SHARED-LOAD-SEQUENCE` | Falta motor ejecutable |
| Mapeo tarea -> perfil -> skills | SSOT machine-readable | Mapeos dispersos en markdown/yaml | No hay fuente unica ejecutable |
| Principios por perfil | Carga reproducible por tipo de tarea | Existe `MATRIZ-PERFIL-DIRECTIVAS.yml` + docs dispersos | Integracion parcial, no enlazada a motor |
| Skills registry operativo | `SKILLS-REGISTRY.yml` + `orchestration/skills/` | Solo existe estandar (`ESTANDAR-SKILLS.md`) | Falta implementacion |
| Skills Vercel | Skills evaluadas e integradas por entorno | Solo menciones en docs/workflows | No hay skill operativo |
| Carga de contexto L0-L3 | Mapeo actualizado y consumible | `CONTEXT-MAP.yml` actualizado | Correcto pero no acoplado a selector |

## Fuentes de Verdad Detectadas

### Fuentes primarias vigentes
- `orchestration/CONTEXT-MAP.yml` (contexto y aliases)
- `orchestration/inventarios/MASTER_INVENTORY.yml` (SSOT de metricas)
- `orchestration/agents/perfiles/_MAP.md` (asignacion operativa humana)
- `orchestration/referencias/MATRIZ-PERFIL-DIRECTIVAS.yml` (perfil -> directivas)
- `docs/40-standards/ESTANDAR-SKILLS.md` (contrato de skills)

### Duplicidades/riesgos
- Alias en `orchestration/referencias/ALIASES.yml` y `orchestration/agents/ALIASES.yml`.
- Seleccion de perfil declarada como automatica en texto, sin componente ejecutable.
- Referencias Vercel sin artefactos de skill ni gating por entorno.

## Clasificacion de Brechas

### Criticas
1. No existe resolvedor ejecutable para `task -> profile`.
2. No existe `SKILLS-REGISTRY.yml`.
3. No existe directorio operativo `orchestration/skills/`.

### Medias
1. Mapeos de perfiles/disparadores fragmentados en varios documentos.
2. No existe vinculo automatizado `perfil -> principios -> skills -> context_pack`.

### Bajas
1. Alias duplicados legacy que pueden inducir rutas obsoletas.
2. Referencias Vercel no estandarizadas en estructura de skills.

## Remediacion Definida

1. Introducir SSOT machine-readable: `orchestration/agents/configs/PROFILE-SKILL-MAP.json`.
2. Implementar resolvedor deterministico: `orchestration/agents/tools/profile_skill_resolver.py`.
3. Crear `orchestration/inventarios/SKILLS-REGISTRY.yml`.
4. Crear skills base SIMCO y skills community Vercel con formato estandar.
5. Actualizar directivas de inicializacion/asignacion/carga para usar el resolvedor.
6. Ejecutar validacion funcional y documental con evidencia reproducible.
