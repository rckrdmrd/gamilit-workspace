# CHECKLIST: GOBERNANZA DE TAREA

**Versión:** 1.0.0
**Alias:** @DEF_CHK_GOB
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**Prioridad:** P0 - BLOQUEANTE

---

## PROPÓSITO

Este checklist es **OBLIGATORIO** y **BLOQUEANTE** para toda tarea que se marque como completada.
Debe ejecutarse ANTES de cualquier otra validación post-tarea.

> **REGLA:** Sin gobernanza documentada, la tarea NO está completada.

---

## SECUENCIA DE EJECUCIÓN

```
TAREA FINALIZA EJECUCIÓN
         │
         ▼
┌─────────────────────────────┐
│ CHECKLIST-GOBERNANZA-TAREA  │  ← PRIMERO (este checklist)
│ (BLOQUEANTE)                │
└─────────────┬───────────────┘
              │
              ▼
    ¿Todos los items pasan?
         /          \
       Sí            No
       │             │
       ▼             ▼
CHECKLIST-POST-TASK  BLOQUEAR
(validaciones        (no continuar
 técnicas)           hasta resolver)
```

---

## CHECKLIST (8 Items)

### 1. Carpeta de Tarea

```markdown
[ ] Existe carpeta: orchestration/tareas/TASK-{YYYY-MM-DD}-{NNN}/
```

**Si no existe:**
```bash
# Crear carpeta
mkdir -p orchestration/tareas/TASK-$(date +%Y-%m-%d)-00X

# Copiar templates
cp -r orchestration/tareas/_templates/TASK-TEMPLATE/* orchestration/tareas/TASK-$(date +%Y-%m-%d)-00X/
```

### 2. METADATA.yml

```markdown
[ ] METADATA.yml existe y tiene campos obligatorios:
    [ ] task_id
    [ ] identificacion.titulo
    [ ] identificacion.tipo
    [ ] responsabilidad.agente_responsable
    [ ] alcance.nivel
    [ ] temporalidad.fecha_inicio
    [ ] estado.actual = "completada"
    [ ] artefactos.archivos_creados (lista)
    [ ] artefactos.archivos_modificados (lista)
```

### 3. Fase C - Contexto (OBLIGATORIA)

```markdown
[ ] 01-CONTEXTO.md existe y documenta:
    [ ] Qué se solicitó
    [ ] Por qué se necesita
    [ ] Proyecto/módulo afectado
    [ ] Contexto cargado
```

### 4. Fase E - Ejecución (OBLIGATORIA)

```markdown
[ ] 05-EJECUCION.md existe y documenta:
    [ ] Subtareas ejecutadas
    [ ] Archivos creados/modificados
    [ ] Validaciones ejecutadas
    [ ] Problemas encontrados y cómo se resolvieron
```

### 5. Fase D - Documentación (OBLIGATORIA)

```markdown
[ ] 06-DOCUMENTACION.md existe y documenta:
    [ ] Resumen de cambios
    [ ] Inventarios actualizados
    [ ] Propagación evaluada
    [ ] Referencias actualizadas
```

### 6. Índice de Tareas

```markdown
[ ] orchestration/tareas/_INDEX.yml actualizado:
    [ ] Estadísticas actualizadas
    [ ] Tarea en historial_por_fecha
    [ ] Tarea en por_proyecto
    [ ] Tarea en por_agente
    [ ] Tarea en por_tipo
```

### 7. Traza de Agente (Recomendado)

```markdown
[ ] orchestration/agents/trazas/TRAZA-AGENTE-{PERFIL}.md actualizada
    O
[ ] Excepción documentada en METADATA.yml
```

### 8. Validación Final

```markdown
[ ] Carpeta de tarea contiene mínimo:
    - METADATA.yml (completo)
    - 01-CONTEXTO.md (documentado)
    - 05-EJECUCION.md (documentado)
    - 06-DOCUMENTACION.md (documentado)
```

---

## DECISIÓN

```yaml
SI_PASA_TODO:
  accion: "Continuar con CHECKLIST-POST-TASK"
  nota: "Gobernanza validada"

SI_FALLA_CUALQUIER_ITEM:
  accion: "BLOQUEAR"
  mensaje: |
    ❌ GOBERNANZA INCOMPLETA

    La tarea NO puede marcarse como completada.
    Items faltantes:
    - {lista de items faltantes}

    Acciones requeridas:
    1. Completar items faltantes
    2. Re-ejecutar este checklist
    3. Continuar con validaciones técnicas
```

---

## TEMPLATE RÁPIDO

Para crear documentación de gobernanza rápidamente:

```bash
# Variables
TASK_ID="TASK-$(date +%Y-%m-%d)-00X"
TASK_DIR="orchestration/tareas/$TASK_ID"

# 1. Crear estructura
mkdir -p $TASK_DIR
cp orchestration/tareas/_templates/TASK-TEMPLATE/* $TASK_DIR/

# 2. Completar METADATA.yml
# 3. Documentar 01-CONTEXTO.md
# 4. Documentar 05-EJECUCION.md
# 5. Documentar 06-DOCUMENTACION.md
# 6. Actualizar _INDEX.yml
```

---

## INTEGRACIÓN CON TODOLIST

Al iniciar cualquier tarea, el TodoList DEBE incluir:

```yaml
todos:
  # ... otras tareas ...

  # SIEMPRE al final:
  - content: "Crear documentación de gobernanza (TASK-{ID})"
    status: "pending"
    activeForm: "Documentando gobernanza"
```

---

## USO

```yaml
# En cualquier perfil de agente:
al_completar_trabajo_tecnico:
  - Cargar: "@DEF_CHK_GOB"
  - Ejecutar: "8 items de gobernanza"
  - Si pasa: "Continuar con @DEF_CHK_POST"
  - Si falla: "Completar gobernanza primero"
```

---

## REFERENCIAS

| Alias | Descripción |
|-------|-------------|
| @DEF_CHK_GOB | Este checklist |
| @DEF_CHK_POST | Checklist post-tarea (validaciones técnicas) |
| @TRIGGER-DOC | Trigger de documentación obligatoria |
| @TAREAS | Directorio de tareas |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist Bloqueante
