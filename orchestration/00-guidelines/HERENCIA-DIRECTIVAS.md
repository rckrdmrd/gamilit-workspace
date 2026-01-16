# Herencia de Directivas - Gamilit

## Arquitectura de Directivas

Este proyecto hereda directivas del workspace-v2 y define directivas específicas.

## Directivas del Workspace-V2 (heredadas)

**Path:** `/home/isem/workspace-v2/orchestration/directivas/`

Estas directivas aplican a TODOS los proyectos del workspace:

### Principios Fundamentales
| Directiva | Path | Propósito |
|-----------|------|-----------|
| `PRINCIPIO-CAPVED.md` | `principios/` | Ciclo de 6 fases obligatorio |
| `PRINCIPIO-DOC-PRIMERO.md` | `principios/` | Documentación antes de implementar |
| `PRINCIPIO-ANTI-DUPLICACION.md` | `principios/` | Verificar catálogo antes de crear |
| `PRINCIPIO-VALIDACION-OBLIGATORIA.md` | `principios/` | Build y lint deben pasar |
| `PRINCIPIO-ECONOMIA-TOKENS.md` | `principios/` | Desglosar tareas grandes |

### Directivas SIMCO
| Directiva | Path | Propósito |
|-----------|------|-----------|
| `SIMCO-TAREA.md` | `simco/` | Punto de entrada para toda tarea |
| `SIMCO-CREAR.md` | `simco/` | Crear archivos nuevos |
| `SIMCO-MODIFICAR.md` | `simco/` | Modificar archivos existentes |
| `SIMCO-VALIDAR.md` | `simco/` | Validar código |
| `SIMCO-DOCUMENTAR.md` | `simco/` | Documentar trabajo |
| `SIMCO-DELEGACION.md` | `simco/` | Delegar a subagentes |

### Modos de Ejecución
| Modo | Path | Propósito |
|------|------|-----------|
| `MODE-FULL.md` | `modos/` | Ciclo CAPVED completo |
| `MODE-QUICK.md` | `modos/` | Solo ejecución y documentación |
| `MODE-ANALYSIS.md` | `modos/` | Solo investigación |
| `MODE-PROPAGATION.md` | `modos/` | Propagar cambios entre proyectos |

## Directivas Específicas de Gamilit

**Path:** `/home/isem/workspace-v2/projects/gamilit/orchestration/directivas/`

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-DISENO-BASE-DATOS.md` | Diseño de BD con 14 schemas PostgreSQL |
| `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` | DDL-first, sin migraciones |
| `ESTANDARES-API-ROUTES.md` | Convenciones de rutas REST |
| `ESTANDARES-TESTING-API.md` | Estándares de testing para API |
| `PITFALLS-API-ROUTES.md` | Errores comunes a evitar |
| `AUTOMATIZACION-VALIDACION-RUTAS.md` | Validación automática de rutas |
| `GUIA-NOMENCLATURA-COMPLETA.md` | Nomenclatura específica Gamilit |

## Directivas NEXUS (extensiones locales)

**Path:** `/home/isem/workspace-v2/projects/gamilit/.claude/directivas/`

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVAS-PRINCIPALES.md` | Consolidado de directivas NEXUS |
| `DIRECTIVA-VALIDACION-DOCUMENTACION.md` | Validación contra /docs/ |
| `DIRECTIVAS-MICROCICLOS-ANIDADOS.md` | Microciclos hasta 5 niveles |
| `POLITICAS-MODULARIZACION.md` | Archivos <400L |
| `PRINCIPIOS-SOLID-DOCS.md` | SOLID aplicado a documentación |

## Prompts Específicos de Gamilit

**Path:** `/home/isem/workspace-v2/projects/gamilit/orchestration/prompts/`

| Prompt | Uso |
|--------|-----|
| `PROMPT-DATABASE-AGENT.md` | Agente para tareas de BD PostgreSQL |
| `PROMPT-DATABASE-AUDITOR.md` | Auditoría y optimización de BD |
| `PROMPT-BACKEND-AGENT.md` | Desarrollo backend NestJS |
| `PROMPT-FRONTEND-AGENT.md` | Desarrollo frontend React |
| `PROMPT-ARCHITECTURE-ANALYST.md` | Análisis arquitectónico |

## Perfiles de Agentes del Workspace

**Path:** `/home/isem/workspace-v2/orchestration/agents/perfiles/`

Ver `_MAP.md` para asignación de perfiles según tipo de tarea.

## Orden de Precedencia

Cuando hay conflicto entre directivas:

1. **Directivas específicas del proyecto** (mayor prioridad)
2. **Directivas del workspace-v2**
3. **Prompts específicos del proyecto**
4. **Perfiles base del workspace**

## Uso para Subagentes

Al invocar un subagente, cargar contexto según CCA Protocol:

```yaml
DIRECTIVAS_A_LEER:
  workspace:
    - /home/isem/workspace-v2/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
    - /home/isem/workspace-v2/orchestration/directivas/simco/SIMCO-TAREA.md
  proyecto:
    - /home/isem/workspace-v2/projects/gamilit/orchestration/directivas/[DIRECTIVA-RELEVANTE].md
  contexto:
    - /home/isem/workspace-v2/projects/gamilit/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
    - /home/isem/workspace-v2/projects/gamilit/orchestration/00-guidelines/HERENCIA-SIMCO.md
```

---
*Sistema SIMCO v3.8 - Gamilit*
*Actualizado: 2026-01-13*
