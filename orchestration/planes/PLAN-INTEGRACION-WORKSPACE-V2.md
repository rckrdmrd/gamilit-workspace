# Plan de Integración: Gamilit Workspace V2

> **Fecha:** 2026-02-03
> **Estado:** PLANIFICADO
> **Prioridad:** ALTA
> **Principio:** CAPVED
> **Responsable:** Meta-Orquestador

## Contexto

Gamilit requiere integración total con las mejoras del `workspace-v2`. Al ser un workspace independiente con redundancia, debe poseer su propia copia completa de la estructura estándar, directivas y procesos, eliminando dependencias heredadas implícitas y estructuras obsoletas.

## Objetivos
1.  **Estandarizar Estructura:** Alinear `docs` y `orchestration` con V2.
2.  **Redundancia Completa:** Asegurar que todos los módulos operativos existan localmente.
3.  **Purga Inteligente:** Eliminar legacy asegurando migración de conocimiento.
4.  **Integridad:** Mantener el proyecto funcional durante la transición.

---

## Estrategia de Ejecución (Fases)

### Fase 1: Análisis y Planeación (ACTUAL)
- [x] Análisis de Brechas (Gap Analysis).
- [x] Creación de Reporte de Análisis.
- [x] Definición del Plan Maestro (Este documento).
- [ ] Validación del Plan.

### Fase 2: Alineación Estructural (Infrastructure)
**Objetivo:** Crear el "esqueleto" correcto antes de mover contenido.

**Subtareas:**
1.  **TASK-GAM-001: Estructura Orchestration**
    - Crear las 16 carpetas faltantes en `orchestration/`.
    - Copiar `_INDEX.md` / `README.md` base del root para cada una.
2.  **TASK-GAM-002: Estructura Docs**
    - Crear estructura estándar (`10-arquitectura`, `20-perfiles`, etc.) en `docs/`.
    - Asegurar presencia de `_INDEX.md` en cada una.

### Fase 3: Migración y Purga (Content)
**Objetivo:** Mover contenido valioso a la nueva estructura y eliminar lo obsoleto.

**Subtareas:**
1.  **TASK-GAM-003: Migración de Definiciones**
    - Mover contenido de `01-fase-alcance` -> `00-vision-general` / `50-requerimientos`.
    - Mover contenido de `03-analisis-tecnico` -> `10-arquitectura`.
    - Mover contenido de `05-modelado` -> `10-arquitectura` / `40-estandares`.
2.  **TASK-GAM-004: Purga Legacy**
    - Eliminar carpetas `docs/01` a `docs/05` post-migración.
    - Eliminar `orchestration/00-guidelines` (validando no perder directivas únicas).
    - Unificar `_MAP.md` a `_INDEX.md`.

### Fase 4: Sincronización Operativa (Sync)
**Objetivo:** Traer herramientas y plantillas del root.

**Subtareas:**
1.  **TASK-GAM-005: Sync Orchestration Content**
    - Copiar plantillas actualizadas a `orchestration/templates`.
    - Actualizar `directivas` con la última versión de V2.
    - Instaurar `scrum` y `planes` con plantillas base.

---

## Asignación de Agentes (Sub-Orquestación)

Para las fases de ejecución, se sugiere la siguiente orquestación paralela:

| Agente | Perfil | Tarea Asignada |
|--------|--------|----------------|
| **Architect-Bot** | `codebase_investigator` | Verificación de integridad y mapeo de dependencias durante migración. |
| **Ops-Bot** | `meta-orquestador` | Creación de carpetas y copia de archivos estructurales (Fase 2 y 4). |
| **Content-Bot** | `documentation` | Lectura, clasificación y migración de contenido markdown (Fase 3). |

## Validación (Gate)

Antes de proceder a Fase 2:
- Confirmar que el `GAP-ANALYSIS` es correcto.
- Aprobar este plan de acción.
