# CHECKLIST-CIERRE: Gate Final de Tarea

**Version:** 1.0.0
**Actualizado:** 2026-01-18
**Alias:** `@CHK-CIERRE`, `@DEF_CHK_POST`

## Proposito

Gate BLOQUEANTE final antes de marcar una tarea como completada.
**NINGUN ITEM PUEDE QUEDAR SIN MARCAR.**

---

## SECCION 1: GOBERNANZA (OBLIGATORIO)

### Estructura de Tarea

- [ ] Carpeta de tarea existe: `orchestration/tareas/TASK-YYYY-MM-DD-NNN/`
- [ ] METADATA.yml completo y correcto
- [ ] SUBTASKS.yml con summary actualizado
- [ ] LESSONS-LEARNED.yml iniciado (minimo summary)

### Registro en Indices

- [ ] Entrada en `orchestration/tareas/_INDEX.yml`
- [ ] Status: completed
- [ ] Path correcto

---

## SECCION 2: VALIDACIONES TECNICAS (OBLIGATORIO)

### Build (segun dominios afectados)

- [ ] Backend: `npm run build` PASA
- [ ] Frontend: `npm run build` PASA
- [ ] Database: `recreate-database.sh` exitoso

### Lint

- [ ] Backend: `npm run lint` PASA (< 5 warnings nuevos)
- [ ] Frontend: `npm run lint` PASA

### Tests

- [ ] Backend: `npm run test` PASA (tests existentes)
- [ ] Frontend: `npm run test` PASA (si existen)
- [ ] Ningun test nuevo falla

### TypeCheck

- [ ] Frontend: `npm run typecheck` PASA

---

## SECCION 3: COHERENCIA ENTRE CAPAS (OBLIGATORIO)

### DDL -> Backend

- [ ] Toda tabla nueva tiene entity correspondiente
- [ ] Campos de entity coinciden con columnas de tabla
- [ ] Tipos TypeScript compatibles con tipos PostgreSQL
- [ ] EXCEPCIONES documentadas (tablas M:N, audit, etc.)

### Backend -> Frontend (si aplica)

- [ ] Endpoints nuevos documentados
- [ ] DTOs expuestos correctamente
- [ ] Frontend consume endpoints correctamente

---

## SECCION 4: INVENTARIOS (OBLIGATORIO)

### Actualizacion

- [ ] DATABASE_INVENTORY.yml actualizado (si cambio DDL)
- [ ] BACKEND_INVENTORY.yml actualizado (si cambio backend)
- [ ] FRONTEND_INVENTORY.yml actualizado (si cambio frontend)
- [ ] MASTER_INVENTORY.yml actualizado con totales

### Cobertura

- [ ] Cobertura de inventarios = 100% (sin objetos sin documentar)

---

## SECCION 5: TRAZAS (OBLIGATORIO)

### Archivos de Traza

- [ ] TRAZA-TAREAS-*.md correspondiente actualizado
- [ ] Cambios documentados con fecha y descripcion

### SSOT (si nueva funcionalidad)

- [ ] TRACEABILITY-MASTER.yml actualizado
- [ ] EPIC-INDEX.yml actualizado si cambio estado de epica

---

## SECCION 6: PROPAGACION (EVALUACION)

### Evaluacion

- [ ] Se evaluo si cambio requiere propagacion a otros proyectos
- [ ] Si SI requiere: plan de propagacion documentado
- [ ] Si NO requiere: marcado como N/A

---

## SECCION 7: GIT (OBLIGATORIO)

### Estado del Repositorio

- [ ] `git status` = "working tree clean"
- [ ] Todos los cambios commiteados
- [ ] Commit message sigue convencion: `[TASK-ID] tipo: descripcion`

### Push (segun politica)

- [ ] Cambios pusheados a remote (si aplica)
- [ ] `git log origin/main..HEAD` vacio (si aplica)

---

## RESUMEN DE VALIDACION

| Seccion | Estado |
|---------|--------|
| 1. Gobernanza | [ ] PASA |
| 2. Validaciones Tecnicas | [ ] PASA |
| 3. Coherencia Entre Capas | [ ] PASA |
| 4. Inventarios | [ ] PASA |
| 5. Trazas | [ ] PASA |
| 6. Propagacion | [ ] EVALUADO |
| 7. Git | [ ] PASA |

---

## CRITERIO FINAL

### TAREA COMPLETADA si:
- [ ] **TODAS** las secciones marcadas como PASA/EVALUADO
- [ ] **NINGUN** item critico sin marcar
- [ ] **NINGUN** build/lint/test fallando

### TAREA NO COMPLETADA si:
- Cualquier seccion falla
- Items pendientes sin justificacion
- Errores de build/lint/test

---

## ACCION POST-CIERRE

Si PASA:
1. Marcar METADATA.yml status: completed
2. Marcar SUBTASKS.yml todas completadas
3. Actualizar _INDEX.yml con status: completed
4. Commit final con mensaje: `[TASK-ID] docs: cierre de tarea`

Si NO PASA:
1. Identificar items faltantes
2. Completar items
3. Re-ejecutar este checklist

---

## NOTAS

Este checklist integra:
- `@TRIGGER_CIERRE` - Trigger de cierre obligatorio
- `@TRIGGER_COHERENCIA` - Coherencia entre capas
- `@TRIGGER_INVENTARIOS` - Inventarios sincronizados

**NO se puede marcar tarea como completada sin pasar este checklist.**

---

## Referencias

- Trigger Cierre: `orchestration/directivas/triggers/TRIGGER-CIERRE-TAREA-OBLIGATORIO.md`
- Trigger Coherencia: `orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md`
- Trigger Inventarios: `orchestration/directivas/triggers/TRIGGER-INVENTARIOS-SINCRONIZADOS.md`
