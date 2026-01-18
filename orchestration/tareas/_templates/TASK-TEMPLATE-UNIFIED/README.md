# TASK-TEMPLATE-UNIFIED

**Version:** 2.0.0
**Actualizado:** 2026-01-18

## Proposito

Template unificado para tareas que integra:
- Metadata estructurada (METADATA.yml)
- Sistema recursivo de subtareas N niveles (SUBTASKS.yml)
- Registro de lecciones aprendidas (LESSONS-LEARNED.yml)

## Archivos

| Archivo | Proposito |
|---------|-----------|
| `METADATA.yml` | Identificacion, clasificacion, estado, fases CAPVED |
| `SUBTASKS.yml` | Desglose recursivo hasta 5 niveles |
| `LESSONS-LEARNED.yml` | Documentacion de aprendizajes post-tarea |
| `README.md` | Este archivo |

## Como Usar

### 1. Crear nueva tarea

```bash
# Crear carpeta con ID de tarea
mkdir orchestration/tareas/TASK-2026-01-18-001

# Copiar template
cp -r orchestration/tareas/_templates/TASK-TEMPLATE-UNIFIED/* orchestration/tareas/TASK-2026-01-18-001/
```

### 2. Actualizar METADATA.yml

```yaml
task:
  id: "TASK-2026-01-18-001"
  title: "Titulo real de la tarea"
  created: "2026-01-18"
```

### 3. Definir subtareas en SUBTASKS.yml

Adaptar las subtareas segun los dominios afectados:
- Eliminar grupos no necesarios (ej: E.FE si no hay cambios frontend)
- Agregar subtareas especificas
- Definir criterios de aceptacion

### 4. Ejecutar tarea siguiendo CAPVED

1. **C** - Contexto: Vincular con RF/ET/US
2. **A** - Analisis: Mapear dependencias e impacto
3. **P** - Plan: Detallar subtareas en SUBTASKS.yml
4. **V** - Validacion: Gate de aprobacion
5. **E** - Ejecucion: Implementar por checkpoints (CP1-CP4)
6. **D** - Documentacion: Actualizar inventarios, trazas, lecciones

### 5. Completar LESSONS-LEARNED.yml

Al finalizar la tarea:
- Documentar que funciono bien
- Documentar problemas y resoluciones
- Agregar recomendaciones

## Estructura de Niveles (SUBTASKS.yml)

```
NIVEL 1: FASE
├── C (Contexto)
├── A (Analisis)
├── P (Plan)
├── V (Validacion)
├── E (Ejecucion)          ← NIVEL 2: GRUPO
│   ├── E.DB (Database)
│   ├── E.BE (Backend)     ← NIVEL 3: SUBTAREA
│   │   ├── E.BE.01
│   │   │   ├── E.BE.01.AC1  ← NIVEL 4: CRITERIO
│   │   │   │   └── AC1.1    ← NIVEL 5: SUB-CRITERIO
│   │   │   └── E.BE.01.AC2
│   │   └── E.BE.02
│   ├── E.FE (Frontend)
│   └── E.COH (Coherencia)
└── D (Documentacion)
```

## Checkpoints de Ejecucion

| Checkpoint | Validaciones |
|------------|--------------|
| CP1: Post-Database | DDL ejecuta, recreate-database.sh exitoso |
| CP2: Post-Backend | npm run build, lint, test - PASAN |
| CP3: Post-Frontend | npm run build, typecheck - PASAN |
| CP4: Coherencia | Entity↔DDL, DTO↔Entity, FE↔BE alineados |

## Estados de Subtareas

| Estado | Descripcion |
|--------|-------------|
| `pending` | No iniciado |
| `in_progress` | En ejecucion |
| `completed` | Terminado exitosamente |
| `blocked` | Bloqueado por dependencia |
| `skipped` | Omitido (documentar razon) |

## Integracion con Sistema

### Actualizar _INDEX.yml al completar

```yaml
tasks:
  - id: TASK-2026-01-18-001
    title: "Titulo de la tarea"
    date: "2026-01-18"
    status: completed
    path: "orchestration/tareas/TASK-2026-01-18-001/"
```

### Propagar lecciones al workspace

Si `propagation.should_propagate: true` en LESSONS-LEARNED.yml:
1. Copiar entrada relevante a `workspace-v2/orchestration/retrospectivas/LECCIONES-INDEX.yml`
2. Marcar `propagated: true`

## Referencias

- SSOT: `docs/_SSOT/`
- Checklists CAPVED: `orchestration/directivas/checklists/`
- Template anterior: `workspace-v2/orchestration/tareas/_templates/TASK-TEMPLATE/`
