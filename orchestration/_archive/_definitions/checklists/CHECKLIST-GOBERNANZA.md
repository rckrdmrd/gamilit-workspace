# CHECKLIST: GOBERNANZA DE TAREA

**Version:** 1.0.0
**Alias:** @DEF_CHK_GOB
**Fecha:** 2026-01-18
**Sistema:** SIMCO v4.0.0 (adaptado para gamilit)
**Prioridad:** P0 - BLOQUEANTE
**Propagado desde:** workspace-v2/orchestration/_definitions/checklists/CHECKLIST-GOBERNANZA-TAREA.md

---

## PROPOSITO

Este checklist es **OBLIGATORIO** y **BLOQUEANTE** para toda tarea que se marque como completada.
Debe ejecutarse ANTES de cualquier otra validacion post-tarea.

> **REGLA:** Sin gobernanza documentada, la tarea NO esta completada.

---

## SECUENCIA DE EJECUCION

```
TAREA FINALIZA EJECUCION
         |
         v
+-----------------------------+
| CHECKLIST-GOBERNANZA        |  <- PRIMERO (este checklist)
| (BLOQUEANTE)                |
+-------------+---------------+
              |
              v
    Todos los items pasan?
         /          \
       Si            No
       |             |
       v             v
CHECKLIST-POST-TASK  BLOQUEAR
(validaciones        (no continuar
 tecnicas)           hasta resolver)
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
cp -r orchestration/templates/TASK-TEMPLATE/* orchestration/tareas/TASK-$(date +%Y-%m-%d)-00X/
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
    [ ] Que se solicito
    [ ] Por que se necesita
    [ ] Modulo afectado
    [ ] Contexto cargado
```

### 4. Fase E - Ejecucion (OBLIGATORIA)

```markdown
[ ] 05-EJECUCION.md existe y documenta:
    [ ] Subtareas ejecutadas
    [ ] Archivos creados/modificados
    [ ] Validaciones ejecutadas
    [ ] Problemas encontrados y como se resolvieron
```

### 5. Fase D - Documentacion (OBLIGATORIA)

```markdown
[ ] 06-DOCUMENTACION.md existe y documenta:
    [ ] Resumen de cambios
    [ ] Inventarios actualizados
    [ ] Referencias actualizadas
```

### 6. Indice de Tareas

```markdown
[ ] orchestration/tareas/_INDEX.yml actualizado:
    [ ] Estadisticas actualizadas
    [ ] Tarea en historial_por_fecha
    [ ] Tarea en por_tipo
```

### 7. Traza de Agente (Recomendado)

```markdown
[ ] orchestration/trazas/TRAZA-AGENTE-{PERFIL}.md actualizada
    O
[ ] Excepcion documentada en METADATA.yml
```

### 8. Validacion Final

```markdown
[ ] Carpeta de tarea contiene minimo:
    - METADATA.yml (completo)
    - 01-CONTEXTO.md (documentado)
    - 05-EJECUCION.md (documentado)
    - 06-DOCUMENTACION.md (documentado)
```

---

## DECISION

```yaml
SI_PASA_TODO:
  accion: "Continuar con CHECKLIST-POST-TASK"
  nota: "Gobernanza validada"

SI_FALLA_CUALQUIER_ITEM:
  accion: "BLOQUEAR"
  mensaje: |
    GOBERNANZA INCOMPLETA

    La tarea NO puede marcarse como completada.
    Items faltantes:
    - {lista de items faltantes}

    Acciones requeridas:
    1. Completar items faltantes
    2. Re-ejecutar este checklist
    3. Continuar con validaciones tecnicas
```

---

## TEMPLATE RAPIDO

Para crear documentacion de gobernanza rapidamente:

```bash
# Variables
TASK_ID="TASK-$(date +%Y-%m-%d)-00X"
TASK_DIR="orchestration/tareas/$TASK_ID"

# 1. Crear estructura
mkdir -p $TASK_DIR
cp orchestration/templates/TASK-TEMPLATE/* $TASK_DIR/

# 2. Completar METADATA.yml
# 3. Documentar 01-CONTEXTO.md
# 4. Documentar 05-EJECUCION.md
# 5. Documentar 06-DOCUMENTACION.md
# 6. Actualizar _INDEX.yml
```

---

## INTEGRACION CON TODOLIST

Al iniciar cualquier tarea, el TodoList DEBE incluir:

```yaml
todos:
  # ... otras tareas ...

  # SIEMPRE al final:
  - content: "Crear documentacion de gobernanza (TASK-{ID})"
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

| Alias | Descripcion |
|-------|-------------|
| @DEF_CHK_GOB | Este checklist |
| @DEF_CHK_POST | Checklist post-tarea (validaciones tecnicas) |
| @TAREAS | Directorio de tareas |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist Bloqueante
**Propagado desde:** workspace-v2
