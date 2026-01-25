# CHECKLIST-FASE-D: Gate de Documentacion

**Version:** 1.0.0
**Actualizado:** 2026-01-18
**Alias:** `@CHK-DOCUMENTACION`

## Proposito

Validar que toda la documentacion necesaria ha sido actualizada.

---

## Checklist

### Inventarios (OBLIGATORIO)

- [ ] DATABASE_INVENTORY.yml actualizado (si cambio DDL):
  - [ ] Conteo de tablas correcto
  - [ ] Conteo de enums correcto
  - [ ] Conteo de funciones/triggers correcto

- [ ] BACKEND_INVENTORY.yml actualizado (si cambio backend):
  - [ ] Conteo de entities correcto
  - [ ] Conteo de DTOs correcto
  - [ ] Conteo de services/controllers correcto

- [ ] FRONTEND_INVENTORY.yml actualizado (si cambio frontend):
  - [ ] Conteo de components correcto
  - [ ] Conteo de pages correcto
  - [ ] Conteo de stores correcto

- [ ] MASTER_INVENTORY.yml actualizado:
  - [ ] Resumen consolidado correcto
  - [ ] Fecha de actualizacion

### Trazas (OBLIGATORIO)

- [ ] TRAZA-TAREAS-DATABASE.md actualizado (si cambio DDL)
- [ ] TRAZA-TAREAS-BACKEND.md actualizado (si cambio backend)
- [ ] TRAZA-TAREAS-FRONTEND.md actualizado (si cambio frontend)
- [ ] TRAZA-CORRECCIONES.md actualizado (si fue fix)

### Indice de Tareas (OBLIGATORIO)

- [ ] _INDEX.yml actualizado con nueva entrada:
  ```yaml
  - id: TASK-YYYY-MM-DD-NNN
    title: "Titulo"
    date: "YYYY-MM-DD"
    status: completed
    path: "orchestration/tareas/TASK-.../"
  ```

### SSOT (si aplica)

- [ ] docs/_SSOT/TRACEABILITY-MASTER.yml actualizado (si nueva funcionalidad)
- [ ] docs/_SSOT/EPIC-INDEX.yml actualizado (si cambio estado de epica)
- [ ] docs/_SSOT/CODE-MAPPINGS.yml actualizado (si nuevos mappings)

### Documentacion de Tarea

- [ ] METADATA.yml de la tarea completado:
  - [ ] Status: completed
  - [ ] Completion: 100%
  - [ ] Todas las fases marcadas como completed
  - [ ] Metricas finales

- [ ] SUBTASKS.yml de la tarea actualizado:
  - [ ] Todas las subtareas marcadas como completed
  - [ ] Summary actualizado

### Lecciones Aprendidas

- [ ] LESSONS-LEARNED.yml iniciado:
  - [ ] Al menos "what_worked" o "what_didnt_work" completado
  - [ ] Recomendaciones si aplica

### Propagacion (si aplica)

- [ ] Evaluada necesidad de propagacion a otros proyectos
- [ ] Si requiere propagacion: documentado en METADATA.yml

---

## Criterios de Paso

**PASA** si:
- Inventarios afectados actualizados
- _INDEX.yml actualizado
- METADATA.yml de tarea completado
- SUBTASKS.yml con summary correcto

**NO PASA** si:
- Inventarios desactualizados
- Tarea no registrada en _INDEX.yml
- METADATA.yml incompleto

---

## Siguiente Fase

Si PASA: Continuar a **CHECKLIST-CIERRE.md** (Gate Final)
Si NO PASA: Completar documentacion faltante

---

## Referencias

- Trigger Inventarios: `orchestration/directivas/triggers/TRIGGER-INVENTARIOS-SINCRONIZADOS.md`
- Inventarios: `orchestration/inventarios/`
- SSOT: `docs/_SSOT/`
