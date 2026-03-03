# Indice de Principios Tecnicos

**Version:** 1.1.0
**Fecha:** 2026-02-02
**Sistema:** SIMCO v4.0.0
**Tipo:** Indice Maestro

---

Los principios tecnicos son directivas fundamentales de **HERENCIA OBLIGATORIA** que guian todas las decisiones de diseno, desarrollo y operacion. Aplican a todos los proyectos sin excepcion.

Para orden de lectura, dependencias y matriz de aplicabilidad, ver [GUIA-PRINCIPIOS.md](GUIA-PRINCIPIOS.md).

---

## Principios de Diseno

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-SOLID | PRINCIPIO-SOLID.md | Obligatorio | 5 principios fundamentales del diseno orientado a objetos (SRP, OCP, LSP, ISP, DIP) |
| PRINCIPIO-CLEAN-ARCHITECTURE | PRINCIPIO-CLEAN-ARCHITECTURE.md | Obligatorio | Arquitectura en capas con dependencias hacia el centro |
| PRINCIPIO-PATRONES-DISENO | PRINCIPIO-PATRONES-DISENO.md | Recomendado | Patrones de diseno GoF aplicados a NestJS y React |
| PRINCIPIO-SEPARATION-OF-CONCERNS | PRINCIPIO-SEPARATION-OF-CONCERNS.md | Obligatorio | Separacion de responsabilidades entre capas y modulos |

## Principios de Codigo

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-DRY | PRINCIPIO-DRY.md | Obligatorio | Don't Repeat Yourself - Evitar duplicacion de conocimiento |
| PRINCIPIO-KISS | PRINCIPIO-KISS.md | Obligatorio | Keep It Simple, Stupid - Preferir soluciones simples |
| PRINCIPIO-YAGNI | PRINCIPIO-YAGNI.md | Obligatorio | You Aren't Gonna Need It - No agregar funcionalidad prematura |

## Principios de Base de Datos

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-NORMALIZACION-BD | PRINCIPIO-NORMALIZACION-BD.md | Obligatorio | Formas normales y diseno relacional correcto |

## Principios de Proceso

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-CAPVED | PRINCIPIO-CAPVED.md | Obligatorio | Ciclo de vida de tareas: Contexto, Analisis, Planeacion, Validacion, Ejecucion, Documentacion |
| PRINCIPIO-DOC-PRIMERO | PRINCIPIO-DOC-PRIMERO.md | Obligatorio | Documentar antes de implementar |
| PRINCIPIO-ANTI-DUPLICACION | PRINCIPIO-ANTI-DUPLICACION.md | Obligatorio | Verificar existencia antes de crear nuevo codigo |
| PRINCIPIO-VALIDACION-OBLIGATORIA | PRINCIPIO-VALIDACION-OBLIGATORIA.md | Obligatorio | Build, lint y tests deben pasar siempre |
| PRINCIPIO-ECONOMIA-TOKENS | PRINCIPIO-ECONOMIA-TOKENS.md | Recomendado | Optimizar uso de tokens en interacciones con LLMs |
| PRINCIPIO-NO-ASUMIR | PRINCIPIO-NO-ASUMIR.md | Obligatorio | Verificar hechos, no asumir estado del sistema |
| PRINCIPIO-BRANCHING-STRATEGY | PRINCIPIO-BRANCHING-STRATEGY.md | Obligatorio | Estrategia trunk-based con prefijo GAM-, deploy workflow, checklists |

## Guia Extendida

| Archivo | Descripcion |
|---------|-------------|
| GUIA-PRINCIPIOS.md | Orden de lectura, dependencias entre principios, matriz de aplicabilidad, niveles |

---

## Alias Rapidos

```yaml
# Principios de Diseno
@SOLID:              orchestration/directivas/principios/PRINCIPIO-SOLID.md
@CLEAN-ARCH:         orchestration/directivas/principios/PRINCIPIO-CLEAN-ARCHITECTURE.md
@PATRONES:           orchestration/directivas/principios/PRINCIPIO-PATRONES-DISENO.md
@SOC:                orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md

# Principios de Codigo
@DRY:                orchestration/directivas/principios/PRINCIPIO-DRY.md
@KISS:               orchestration/directivas/principios/PRINCIPIO-KISS.md
@YAGNI:              orchestration/directivas/principios/PRINCIPIO-YAGNI.md

# Principios de BD
@NORMALIZACION:      orchestration/directivas/principios/PRINCIPIO-NORMALIZACION-BD.md

# Principios de Proceso
@CAPVED:             orchestration/directivas/principios/PRINCIPIO-CAPVED.md
@DOC-PRIMERO:        orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
@ANTI-DUPLICACION:   orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
@VALIDACION:         orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
@ECONOMIA-TOKENS:    orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md
@NO-ASUMIR:          orchestration/directivas/principios/PRINCIPIO-NO-ASUMIR.md
@BRANCHING:          orchestration/directivas/principios/PRINCIPIO-BRANCHING-STRATEGY.md

# Guia
@GUIA-PRINCIPIOS:    orchestration/directivas/principios/GUIA-PRINCIPIOS.md
```

---

## Referencias

- **Sistema SIMCO:** orchestration/directivas/simco/
- **Triggers Relacionados:** orchestration/directivas/triggers/
- **Checklists:** orchestration/_definitions/checklists/

---

**Version:** 1.1.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Indice Maestro
