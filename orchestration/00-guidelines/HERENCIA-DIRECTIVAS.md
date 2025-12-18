# Herencia de Directivas - Gamilit

## Arquitectura de Directivas

Este proyecto hereda directivas del workspace (core) y define directivas específicas.

## Directivas Globales (heredadas de core)

**Path:** `~/workspace/core/orchestration/directivas/`

Estas directivas aplican a TODOS los proyectos del workspace:

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-FLUJO-5-FASES.md` | Workflow obligatorio de 5 fases |
| `DIRECTIVA-VALIDACION-SUBAGENTES.md` | Validación de entregables |
| `POLITICAS-USO-AGENTES.md` | Reglas de delegación |
| `DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | Documentación requerida |
| `DIRECTIVA-CALIDAD-CODIGO.md` | Estándares de código |
| `DIRECTIVA-CONTROL-VERSIONES.md` | Git y versionado |
| `DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md` | Backups y gitignore |
| `PROTOCOLO-ESCALAMIENTO-PO.md` | Escalamiento al PO |
| `ESTANDARES-NOMENCLATURA-BASE.md` | Nomenclatura base |
| `SISTEMA-RETROALIMENTACION.md` | Mejora continua |

## Directivas Específicas de Gamilit

**Path:** `~/workspace/projects/gamilit/orchestration/directivas/`

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-DISENO-BASE-DATOS.md` | Diseño de BD con 14 schemas PostgreSQL |
| `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` | DDL-first, sin migraciones |
| `ESTANDARES-API-ROUTES.md` | Convenciones de rutas REST |
| `ESTANDARES-TESTING-API.md` | Estándares de testing para API |
| `PITFALLS-API-ROUTES.md` | Errores comunes a evitar |
| `AUTOMATIZACION-VALIDACION-RUTAS.md` | Validación automática de rutas |
| `GUIA-NOMENCLATURA-COMPLETA.md` | Nomenclatura específica Gamilit |

## Prompts Base (heredados de core)

**Path:** `~/workspace/core/orchestration/prompts/base/`

| Prompt | Uso |
|--------|-----|
| `PROMPT-SUBAGENTES-BASE.md` | Instrucciones generales para subagentes |
| `PROMPT-BUG-FIXER.md` | Corrección de bugs genérico |
| `PROMPT-CODE-REVIEWER.md` | Revisión de código |
| `PROMPT-FEATURE-DEVELOPER.md` | Desarrollo de features |
| `PROMPT-DOCUMENTATION-VALIDATOR.md` | Validación de documentación |
| `PROMPT-POLICY-AUDITOR.md` | Auditoría de políticas |
| `PROMPT-REQUIREMENTS-ANALYST.md` | Análisis de requerimientos |
| `PROMPT-WORKSPACE-MANAGER.md` | Gestión del workspace |

## Prompts Específicos de Gamilit

**Path:** `~/workspace/projects/gamilit/orchestration/prompts/`

| Prompt | Uso |
|--------|-----|
| `PROMPT-DATABASE-AGENT.md` | Agente para tareas de BD PostgreSQL |
| `PROMPT-DATABASE-AUDITOR.md` | Auditoría y optimización de BD |
| `PROMPT-BACKEND-AGENT.md` | Desarrollo backend NestJS |
| `PROMPT-FRONTEND-AGENT.md` | Desarrollo frontend React |
| `PROMPT-ARCHITECTURE-ANALYST.md` | Análisis arquitectónico |

## Templates y Checklists (core)

**Path:** `~/workspace/core/orchestration/templates/`
- `TEMPLATE-ANALISIS.md`
- `TEMPLATE-PLAN.md`
- `TEMPLATE-VALIDACION.md`
- `TEMPLATE-CONTEXTO-SUBAGENTE.md`

**Path:** `~/workspace/core/orchestration/checklists/`
- `CHECKLIST-CODE-REVIEW-API.md`
- `CHECKLIST-REFACTORIZACION.md`

## Orden de Precedencia

Cuando hay conflicto entre directivas:

1. **Directivas específicas del proyecto** (mayor prioridad)
2. **Directivas globales del workspace**
3. **Prompts específicos del proyecto**
4. **Prompts base del workspace**

## Uso para Subagentes

Al invocar un subagente, incluir en el contexto:

```yaml
DIRECTIVAS_A_LEER:
  globales:
    - ~/workspace/core/orchestration/directivas/DIRECTIVA-FLUJO-5-FASES.md
    - ~/workspace/core/orchestration/directivas/POLITICAS-USO-AGENTES.md
  especificas:
    - ~/workspace/projects/gamilit/orchestration/directivas/[DIRECTIVA-RELEVANTE].md
  prompt_base:
    - ~/workspace/core/orchestration/prompts/base/PROMPT-SUBAGENTES-BASE.md
  prompt_especifico:
    - ~/workspace/projects/gamilit/orchestration/prompts/[PROMPT-AGENTE].md
  contexto_proyecto:
    - ~/workspace/projects/gamilit/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
```

---
*Sistema NEXUS - Gamilit v2.0*
*Actualizado: 2025-12-05*
