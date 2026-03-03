# Guia de Principios Tecnicos

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Sistema:** SIMCO v4.0.0
**Tipo:** Guia de Uso

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

## Resumen de Niveles

| Nivel | Significado | Consecuencia de Violacion |
|-------|-------------|---------------------------|
| Obligatorio | Debe cumplirse siempre | Bloquea merge/deploy |
| Recomendado | Deberia cumplirse | Genera advertencia en code review |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Guia de Uso
