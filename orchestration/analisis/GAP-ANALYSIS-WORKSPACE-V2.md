# Gap Analysis: Gamilit vs Workspace V2

> **Fecha:** 2026-02-03
> **Estado:** COMPLETADO
> **Alcance:** /docs y /orchestration
> **Objetivo:** Identificar brechas para la integración de Workspace V2

## 1. Resumen Ejecutivo

El proyecto `gamilit` opera como un workspace independiente que requiere redundancia total (REPLICA_COMPLETA) del `workspace-v2` raíz. El análisis detectó que `gamilit` se encuentra en un estado "híbrido", adoptando parcialmente directivas V2 pero conservando una estructura de documentación y orquestación legada ("Legacy").

## 2. Análisis de Orquestación

### 2.1 Carpetas Faltantes (Crítico)
A pesar de la política de herencia, faltan las siguientes carpetas operacionales estándar:

| Carpeta | Impacto |
|---------|---------|
| `_internal` | Falta de herramientas internas |
| `analisis` | Sin espacio para reportes de análisis |
| `cambios` | Sin registro de control de cambios |
| `checklists` | Falta de estandarización de procesos |
| `errores` | Sin catálogo de errores conocidos |
| `escalamientos` | Sin protocolos de escalación |
| `features` | Sin gestión de features V2 |
| `patrones` | Sin biblioteca de patrones de diseño |
| `perfiles-giro` | Sin definiciones específicas de negocio |
| `planes` | **Bloqueante para la planificación actual** |
| `procesos` | Sin documentación de procesos |
| `propagacion` | Sin scripts/reglas de propagación local |
| `propuestas` | Sin espacio para RFCs |
| `reports` | Sin espacio para reportes automáticos |
| `retrospectivas` | Sin mejora continua |
| `scrum` | Sin artefactos de gestión ágil |

### 2.2 Archivos Clave Faltantes
- `orchestration/tareas/README.md`
- `orchestration/tareas/_FEATURES-MAP.yml`
- Indices estándar (`_INDEX.yml`) en subcarpetas existentes.

## 3. Análisis de Documentación (Docs)

### 3.1 Divergencia Estructural
La estructura actual de `gamilit/docs` no sigue el estándar V2.

**Estándar V2 (Esperado):**
- `00-vision-general`
- `10-arquitectura`
- `20-perfiles`
- `30-directivas`
- `40-estandares`
- `50-requerimientos`
- `60-proyectos`
- `70-onboarding`
- `80-referencias`
- `90-adr`

**Estado Actual Gamilit (Legacy):**
- `01-fase-alcance-inicial` (Candidato a Purga/Migración)
- `02-investigacion` (Candidato a Purga/Migración)
- `03-analisis-tecnico` (Candidato a Purga/Migración)
- `04-diseno-ux-ui` (Candidato a Purga/Migración)
- `05-modelado` (Candidato a Purga/Migración)
- `90-transversal` (No estándar)

### 3.2 Inconsistencias de Indexado
- Se utiliza `_MAP.md` inconsistentemente en lugar del estándar `_INDEX.md` o `README.md`.

## 4. Candidatos a Purga

Los siguientes elementos deben ser revisados para eliminación o migración:
1.  Todas las carpetas `docs/0X-fase...`. Su contenido debe migrarse a las carpetas estándar (ej. requisitos a `50-requerimientos`, diseño a `10-arquitectura`).
2.  `orchestration/00-guidelines`: Parece duplicar `30-directivas`.
3.  Archivos `TRACEABILITY.yml` antiguos si no cumplen el formato V2.

## 5. Conclusión

Se requiere una intervención mayor en 4 fases (ver Plan de Integración) para alinear el proyecto sin perder información valiosa contenida en las carpetas legacy.
