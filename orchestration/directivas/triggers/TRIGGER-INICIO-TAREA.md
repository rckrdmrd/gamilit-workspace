# ═══════════════════════════════════════════════════════════════════════════════
# TRIGGER-INICIO-TAREA
# ═══════════════════════════════════════════════════════════════════════════════
#
# Version: 1.0.0
# Creado: 2026-01-16
# Origen: Auditoría post-tarea TASK-2026-01-16-004
# Proposito: Garantizar creación de carpeta de tarea ANTES de ejecutar código
#
# ═══════════════════════════════════════════════════════════════════════════════

## CONDICION DE ACTIVACION

Este trigger se activa **AUTOMATICAMENTE** cuando:

1. Se recibe una solicitud que implica **modificar código**
2. Se recibe una solicitud que implica **crear archivos nuevos**
3. Se usa `@FULL` o `@CREATE-SAFE` o `@MODIFY-SAFE`
4. El primer item de TodoWrite incluye una tarea de implementación

**EXCEPCION:** No aplica para:
- Modo `@QUICK` en fixes menores (typos, config simple)
- Modo `@ANALYSIS` (solo investigación)
- Tareas puramente de lectura/exploración

---

## ACCION OBLIGATORIA

### Paso 0: Determinar Ubicacion de Documentacion (NUEVO)

**Aplicar reglas de @UBICACION-DOC:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ¿Afecta SOLO 1 proyecto?                                        │
│     SÍ → projects/{proyecto}/orchestration/tareas/             │
│     NO → orchestration/tareas/{YYYY-MM-DD}/                    │
│                                                                 │
│ ¿Modifica orchestration/ del workspace, CLAUDE.md, o shared/?  │
│     SÍ → orchestration/tareas/{YYYY-MM-DD}/                    │
│                                                                 │
│ EN CASO DE DUDA → orchestration/tareas/ (workspace)            │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 1: Generar ID de Tarea

```
WORKSPACE: TASK-{YYYY-MM-DD}-{NNN}  (ej: TASK-2026-01-24-001)
PROYECTO:  TASK-{NNN}               (ej: TASK-001)
```

Donde:
- `YYYY-MM-DD`: Fecha actual (solo para workspace)
- `NNN`: Siguiente secuencial (consultar `_INDEX.yml` correspondiente)

### Paso 2: Crear Estructura de Carpeta

```bash
# Si WORKSPACE:
orchestration/tareas/{YYYY-MM-DD}/TASK-{NNN}-{descripcion}/

# Si PROYECTO:
projects/{proyecto}/orchestration/tareas/TASK-{NNN}-{descripcion}/

# Archivos mínimos obligatorios (en ambos casos)
├── METADATA.yml          # Copiar de _templates/TASK-TEMPLATE/
├── 01-CONTEXTO.md        # Llenar con clasificación inicial
└── (otros según avance)
```

### Paso 3: Registrar en Inventario

Agregar entrada en `tareas_activas` del `_INDEX.yml` **CORRESPONDIENTE**:

```yaml
# Si WORKSPACE: orchestration/tareas/_INDEX.yml
# Si PROYECTO: projects/{proyecto}/orchestration/tareas/_INDEX.yml

tareas_activas:
  - task_id: "TASK-{ID}"
    titulo: "Título descriptivo"
    agente: "PERFIL-AGENTE"
    estado: "en_progreso"
    fase: "C"  # Inicia en Contexto
    proyecto: "nombre-proyecto"
    ubicacion: "workspace|proyecto"  # NUEVO: indicar ubicación
```

### Paso 4: Incluir en TodoWrite

El **PRIMER item** de TodoWrite debe ser:

```
# Si WORKSPACE:
- Crear carpeta de tarea TASK-{ID} en orchestration/tareas/{YYYY-MM-DD}/

# Si PROYECTO:
- Crear carpeta de tarea TASK-{ID} en projects/{proyecto}/orchestration/tareas/
```

O si ya existe:

```
- Documentar contexto en TASK-{ID}/01-CONTEXTO.md
```

---

## CHECKPOINT DE VALIDACION

**ANTES de ejecutar cualquier código (fase E):**

```
[ ] ¿Existe carpeta orchestration/tareas/TASK-{ID}/?
[ ] ¿Existe METADATA.yml con información básica?
[ ] ¿Se registró en _INDEX.yml como tarea activa?
[ ] ¿TodoWrite incluye la tarea de documentación?
```

**SI algún checkbox falla:** BLOQUEAR ejecución hasta completar.

---

## INTEGRACION CON TODOWRITE

Cuando se use TodoWrite para planificar una tarea de código, incluir SIEMPRE:

```typescript
// Ejemplo de TodoWrite correcto
[
  { content: "Crear carpeta TASK-2026-01-16-004", status: "pending" },
  { content: "Documentar contexto y clasificación", status: "pending" },
  { content: "Analizar dependencias", status: "pending" },
  // ... tareas técnicas ...
  { content: "Actualizar _INDEX.yml al completar", status: "pending" }
]
```

---

## REFERENCIAS

- `@TAREAS` - orchestration/tareas/
- `@NUEVA-TAREA` - orchestration/tareas/_templates/TASK-TEMPLATE/
- `@TRIGGER-DOC` - TRIGGER-DOCUMENTACION-OBLIGATORIA.md
- `@MAPA-DOC` - orchestration/MAPA-DOCUMENTACION.yml

---

## CASO DE ESTUDIO: TASK-2026-01-16-004

Esta directiva nace del análisis post-mortem de la tarea:

**"Integración de Servicios de API en Trading Platform Frontend"**

### Problema Detectado
- La tarea se ejecutó correctamente (build pasa, código funcional)
- PERO no se creó carpeta de tarea antes de ejecutar
- No se documentaron fases C, A, P, V formalmente
- No se actualizó _INDEX.yml hasta auditoría posterior

### Causa Raíz
1. No existía trigger bloqueante para creación de carpeta
2. TodoWrite no recordaba incluir checkpoint de gobernanza
3. Las reglas estaban en CLAUDE.md pero sin enforcement automático

### Solución Implementada
1. Crear este trigger (TRIGGER-INICIO-TAREA)
2. Documentación retroactiva de la tarea
3. Actualización de _INDEX.yml
4. Propuesta de mejora a flujo de TodoWrite

---

## METRICAS DE CUMPLIMIENTO

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tareas con carpeta antes de E | 100% | `tareas_con_carpeta / total_tareas` |
| Fases documentadas por tarea | >= 3 | `promedio(fases_doc)` |
| _INDEX.yml actualizado | 100% | `tareas_en_index / total_tareas` |

---

# ═══════════════════════════════════════════════════════════════════════════════
# FIN DEL TRIGGER
# ═══════════════════════════════════════════════════════════════════════════════
