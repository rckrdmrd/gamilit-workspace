# Indice de Principios Tecnicos

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Sistema:** SIMCO v4.0.0
**Tipo:** Indice Maestro

---

## Descripcion del Sistema de Principios

Los principios tecnicos son directivas fundamentales que guian todas las decisiones de diseno, desarrollo y operacion dentro del workspace. Estos principios son de **HERENCIA OBLIGATORIA** y aplican a todos los proyectos sin excepcion.

Cada principio define:
- **Declaracion clara** del concepto
- **Ejemplos practicos** en NestJS y React
- **Checklist de validacion** para verificar cumplimiento
- **Senales de violacion** y como corregirlas
- **Balance** con otros principios

---

## Tabla de Principios por Categoria

### Principios de Diseno

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-SOLID | PRINCIPIO-SOLID.md | Obligatorio | 5 principios fundamentales del diseno orientado a objetos (SRP, OCP, LSP, ISP, DIP) |
| PRINCIPIO-CLEAN-ARCHITECTURE | PRINCIPIO-CLEAN-ARCHITECTURE.md | Obligatorio | Arquitectura en capas con dependencias hacia el centro |
| PRINCIPIO-PATRONES-DISENO | PRINCIPIO-PATRONES-DISENO.md | Recomendado | Patrones de diseno GoF aplicados a NestJS y React |
| PRINCIPIO-SEPARATION-OF-CONCERNS | PRINCIPIO-SEPARATION-OF-CONCERNS.md | Obligatorio | Separacion de responsabilidades entre capas y modulos |

### Principios de Codigo

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-DRY | PRINCIPIO-DRY.md | Obligatorio | Don't Repeat Yourself - Evitar duplicacion de conocimiento |
| PRINCIPIO-KISS | PRINCIPIO-KISS.md | Obligatorio | Keep It Simple, Stupid - Preferir soluciones simples |
| PRINCIPIO-YAGNI | PRINCIPIO-YAGNI.md | Obligatorio | You Aren't Gonna Need It - No agregar funcionalidad prematura |

### Principios de Base de Datos

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-NORMALIZACION-BD | PRINCIPIO-NORMALIZACION-BD.md | Obligatorio | Formas normales y diseno relacional correcto |

### Principios de Proceso

| Principio | Archivo | Nivel | Descripcion |
|-----------|---------|-------|-------------|
| PRINCIPIO-CAPVED | PRINCIPIO-CAPVED.md | Obligatorio | Ciclo de vida de tareas: Contexto, Analisis, Planeacion, Validacion, Ejecucion, Documentacion |
| PRINCIPIO-DOC-PRIMERO | PRINCIPIO-DOC-PRIMERO.md | Obligatorio | Documentar antes de implementar |
| PRINCIPIO-ANTI-DUPLICACION | PRINCIPIO-ANTI-DUPLICACION.md | Obligatorio | Verificar existencia antes de crear nuevo codigo |
| PRINCIPIO-VALIDACION-OBLIGATORIA | PRINCIPIO-VALIDACION-OBLIGATORIA.md | Obligatorio | Build, lint y tests deben pasar siempre |
| PRINCIPIO-ECONOMIA-TOKENS | PRINCIPIO-ECONOMIA-TOKENS.md | Recomendado | Optimizar uso de tokens en interacciones con LLMs |
| PRINCIPIO-NO-ASUMIR | PRINCIPIO-NO-ASUMIR.md | Obligatorio | Verificar hechos, no asumir estado del sistema |
| PRINCIPIO-BRANCHING-STRATEGY | PRINCIPIO-BRANCHING-STRATEGY.md | Obligatorio | Estrategia trunk-based con prefijo GAM-, deploy workflow, checklists |

---

## Orden de Lectura Recomendado

Para agentes y desarrolladores nuevos, se recomienda leer los principios en el siguiente orden:

### Fase 1: Fundamentos de Proceso (Leer Primero)

1. **PRINCIPIO-CAPVED** - Entender el ciclo de vida de tareas
2. **PRINCIPIO-DOC-PRIMERO** - Documentar antes de implementar
3. **PRINCIPIO-NO-ASUMIR** - Verificar antes de actuar
4. **PRINCIPIO-VALIDACION-OBLIGATORIA** - Siempre validar build/lint

### Fase 2: Fundamentos de Codigo

5. **PRINCIPIO-DRY** - Evitar duplicacion
6. **PRINCIPIO-KISS** - Mantener simplicidad
7. **PRINCIPIO-YAGNI** - No sobreingenieria
8. **PRINCIPIO-ANTI-DUPLICACION** - Verificar antes de crear

### Fase 3: Fundamentos de Arquitectura

9. **PRINCIPIO-SOLID** - Los 5 principios fundamentales
10. **PRINCIPIO-CLEAN-ARCHITECTURE** - Arquitectura en capas
11. **PRINCIPIO-SEPARATION-OF-CONCERNS** - Separacion de responsabilidades
12. **PRINCIPIO-PATRONES-DISENO** - Patrones comunes

### Fase 4: Especializados

13. **PRINCIPIO-NORMALIZACION-BD** - Diseno de base de datos
14. **PRINCIPIO-ECONOMIA-TOKENS** - Optimizacion para LLMs
15. **PRINCIPIO-BRANCHING-STRATEGY** - Estrategia de branching y deploy

---

## Dependencias Entre Principios

```
CAPVED
   |
   +---> DOC-PRIMERO (D de CAPVED requiere documentacion)
   |
   +---> VALIDACION-OBLIGATORIA (V de CAPVED incluye validaciones)
   |
   +---> ANTI-DUPLICACION (A de CAPVED incluye verificacion)

SOLID
   |
   +---> CLEAN-ARCHITECTURE (DIP es fundamento de Clean Arch)
   |
   +---> SEPARATION-OF-CONCERNS (SRP es fundamento de SoC)
   |
   +---> PATRONES-DISENO (SOLID habilita patrones correctos)

DRY
   |
   +---> ANTI-DUPLICACION (ambos previenen repeticion)
   |
   +---> KISS (balance - DRY no debe complicar)
   |
   +---> YAGNI (balance - no abstraer prematuramente)

NO-ASUMIR
   |
   +---> VALIDACION-OBLIGATORIA (verificar siempre)
   |
   +---> CAPVED (A de Analisis requiere no asumir)
```

---

## Matriz de Aplicabilidad

| Principio | Backend NestJS | Frontend React | Base de Datos | Documentacion |
|-----------|----------------|----------------|---------------|---------------|
| SOLID | Si | Si | - | - |
| CLEAN-ARCHITECTURE | Si | Si | - | - |
| PATRONES-DISENO | Si | Si | - | - |
| SEPARATION-OF-CONCERNS | Si | Si | Si | - |
| DRY | Si | Si | Si | Si |
| KISS | Si | Si | Si | Si |
| YAGNI | Si | Si | Si | Si |
| NORMALIZACION-BD | - | - | Si | - |
| CAPVED | Si | Si | Si | Si |
| DOC-PRIMERO | Si | Si | Si | Si |
| ANTI-DUPLICACION | Si | Si | Si | Si |
| VALIDACION-OBLIGATORIA | Si | Si | Si | - |
| ECONOMIA-TOKENS | - | - | - | Si |
| NO-ASUMIR | Si | Si | Si | Si |
| BRANCHING-STRATEGY | Si | Si | Si | - |

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
```

---

## Resumen de Niveles

| Nivel | Significado | Consecuencia de Violacion |
|-------|-------------|---------------------------|
| Obligatorio | Debe cumplirse siempre | Bloquea merge/deploy |
| Recomendado | Deberia cumplirse | Genera advertencia en code review |

---

## Referencias

- **Sistema SIMCO:** orchestration/directivas/simco/
- **Triggers Relacionados:** orchestration/directivas/triggers/
- **Checklists:** orchestration/_definitions/checklists/

---

**Version:** 1.1.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Indice Maestro
