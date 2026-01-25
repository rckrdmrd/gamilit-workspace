# CHECKLIST-FASE-C: Gate de Contexto

**Version:** 1.0.0
**Actualizado:** 2026-01-18
**Alias:** `@CHK-CONTEXTO`

## Proposito

Validar que la tarea esta correctamente contextualizada antes de pasar a Analisis.

---

## Checklist

### Identificacion

- [ ] Task ID asignado (TASK-YYYY-MM-DD-NNN)
- [ ] Titulo descriptivo definido
- [ ] Tipo de tarea clasificado (feature/bug/refactor/audit/migration/documentation)
- [ ] Prioridad asignada (P0-P3)
- [ ] Epic relacionada identificada (si aplica)

### Vinculacion con Requerimientos

- [ ] RF (Requerimientos Funcionales) vinculados
- [ ] ET (Especificaciones Tecnicas) vinculados
- [ ] US (User Stories) vinculadas
- [ ] Verificado que RF existe en documentacion (no inventado)

### Verificacion Anti-Duplicacion

- [ ] Consultado `shared/catalog/CATALOG-INDEX.yml` por funcionalidad similar
- [ ] Verificado en inventarios que no existe duplicado
- [ ] Si existe similar: documentado diferencia o marcado como extension

### Dominios Afectados

- [ ] Identificados dominios que seran afectados:
  - [ ] Database (DDL, seeds, migrations)
  - [ ] Backend (entities, services, controllers)
  - [ ] Frontend (components, pages, stores)
  - [ ] Documentation (inventarios, trazas)

### Metadata Inicial

- [ ] METADATA.yml creado con campos basicos
- [ ] SUBTASKS.yml inicializado (puede estar vacio)

---

## Criterios de Paso

**PASA** si:
- Todos los items de "Identificacion" estan marcados
- Al menos 1 RF o US esta vinculado
- Verificacion anti-duplicacion realizada
- Dominios afectados identificados

**NO PASA** si:
- Tarea no tiene RF/ET/US vinculados y no es tarea tecnica
- No se verifico duplicacion
- Dominios no estan claros

---

## Siguiente Fase

Si PASA: Continuar a **Fase A: Analisis**
Si NO PASA: Completar items faltantes antes de continuar

---

## Referencias

- Trigger Anti-Duplicacion: `orchestration/directivas/triggers/TRIGGER-ANTI-DUPLICACION.md`
- SSOT: `docs/_SSOT/REQUIREMENTS-INDEX.yml`
- Catalogo: `shared/catalog/CATALOG-INDEX.yml`
