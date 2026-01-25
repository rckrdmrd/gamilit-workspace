# INDICE: Modos de Ejecucion

**Sistema:** SAAD (Sistema de Activacion Automatica de Directivas)
**Version:** 1.0.0
**Ubicacion:** `orchestration/directivas/modos/`

---

## Descripcion General

Los Modos de Ejecucion definen como el sistema procesa una tarea. Cada modo
especifica que fases del ciclo CAPVED ejecutar, que triggers activar, y que
validaciones requerir.

---

## Modos Disponibles

| Modo | Alias | Fases | Descripcion |
|------|-------|-------|-------------|
| MODE-FULL | @FULL | C-A-P-V-E-D | Ciclo completo con todas las validaciones |
| MODE-QUICK | @QUICK | E-D | Solo ejecucion y documentacion para cambios menores |
| MODE-ANALYSIS | @ANALYSIS | C-A-P | Solo analisis sin modificar codigo |
| MODE-PROPAGATION | @PROPAGATE | C-A-P-V-E-D | Especializado en propagacion entre proyectos |

---

## Seleccion de Modo

### Automatica (Por Defecto)
Si no se especifica modo, el Meta-Orquestador selecciona automaticamente
basandose en:
- Palabras clave en la solicitud
- Tipo de tarea detectado
- Complejidad aparente

### Manual (Usando Alias)
Especificar el alias al inicio del prompt:
```
@FULL Implementar feature X
@QUICK Corregir typo
@ANALYSIS Investigar problema Y
@PROPAGATE Distribuir cambio Z
```

---

## Archivos en Este Directorio

```
modos/
├── _INDEX.md              <- Este archivo
├── MODE-FULL.md           <- Ejecucion completa CAPVED
├── MODE-QUICK.md          <- Ejecucion rapida E+D
├── MODE-ANALYSIS.md       <- Solo analisis C+A+P
└── MODE-PROPAGATION.md    <- Propagacion entre proyectos
```

---

## Matriz de Decision

| Tipo de Tarea | Modo Recomendado | Razon |
|---------------|------------------|-------|
| Nueva feature | MODE-FULL | Requiere todas las fases |
| Bug fix | MODE-FULL | Requiere analisis de impacto |
| Refactorizacion | MODE-FULL | Requiere analisis de dependencias |
| Typo/fix menor | MODE-QUICK | No requiere analisis |
| Investigacion | MODE-ANALYSIS | No modifica codigo |
| Auditoria | MODE-ANALYSIS | Solo genera reporte |
| Propagar cambio | MODE-PROPAGATION | Enfocado en distribucion |
| Security fix | MODE-FULL + @PROPAGATE-ERP | Urgente y propagacion |

---

## Fases CAPVED por Modo

```
Fase         | FULL | QUICK | ANALYSIS | PROPAGATION
-------------|------|-------|----------|------------
C: Contexto  |  X   |       |    X     |     X
A: Analisis  |  X   |       |    X     |     X
P: Planeacion|  X   |       |    X     |     X
V: Validacion|  X   |       |          |     X
E: Ejecucion |  X   |   X   |          |     X
D: Document. |  X   |   X   |          |     X
```

---

## Triggers por Modo

```
Trigger              | FULL | QUICK | ANALYSIS | PROPAGATION
---------------------|------|-------|----------|------------
Anti-Duplicacion     |  X   |       |          |
Analisis Dependencias|  X   |       |    X     |     X
Propagacion Auto     |  X   |       |          |     X
Duplicados           |  X   |       |          |
```

---

## Lectura Recomendada

1. Leer `MODE-FULL.md` para entender el ciclo completo
2. Leer `../principios/PRINCIPIO-CAPVED.md` para las fases
3. Leer `../../referencias/INVOCACIONES.yml` para todos los aliases

---

*Modos de Ejecucion v1.0.0 - Sistema SAAD*
