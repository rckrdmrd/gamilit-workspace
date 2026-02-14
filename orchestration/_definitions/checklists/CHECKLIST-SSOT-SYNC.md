# CHECKLIST: SSOT-SYNC

**Version:** 1.0.0
**Alias:** @CHECKLIST-SSOT-SYNC
**Fecha:** 2026-02-06
**Sistema:** SIMCO v4.0.1

---

## PROPOSITO

Verificar sincronizacion SSOT entre archivos maestros y inventarios de proyecto.
Ejecutar como parte de @DEF_CHK_POST o cuando @TRIGGER-SSOT-SYNC se active.

---

## CHECKLIST

### 1. Sincronizacion Archivos Maestros (BLOQUEANTE)

```markdown
[ ] TRACEABILITY, ROADMAP y DEPENDENCY-GRAPH reportan el MISMO valor
    de completitud para el proyecto modificado
[ ] Los 3 archivos usan el mismo valor de estado (del enum canonico)
[ ] Nomenclatura correcta: "completitud" (no completeness), "estado" (no status)
[ ] Valores de estado pertenecen al enum: planificado | en_desarrollo | mvp |
    activo | produccion | produccion_listo | mantenimiento | archivado
```

### 2. Sincronizacion Inventarios Locales (RECOMENDADO)

```markdown
[ ] MASTER_INVENTORY.yml del proyecto refleja metricas actuales
[ ] DATABASE_INVENTORY.yml coincide con DDL real (tablas, schemas)
[ ] BACKEND_INVENTORY.yml coincide con codigo real (entities, services)
[ ] FRONTEND_INVENTORY.yml coincide con codigo real (pages, components)
```

### 3. Proyecto Nuevo (si aplica)

```markdown
[ ] Proyecto agregado a TRACEABILITY-MASTER.yml
[ ] Proyecto agregado a ROADMAP.yml
[ ] Nodo agregado a DEPENDENCY-GRAPH.yml
[ ] total_projects actualizado en TRACEABILITY
```

### 4. Verificacion Cruzada

```markdown
[ ] No hay campos "completeness" (ingles) en ningun archivo maestro
[ ] No hay campos "status" (ingles) en secciones de proyectos
[ ] Todos los proyectos en projects/ estan en los 3 archivos maestros
    (o tienen justificacion documentada de exclusion)
```

---

## DECISION

```yaml
SI_PASA_TODO:
  accion: "Continuar con cierre de tarea"

SI_HAY_DISCREPANCIA:
  accion: "Corregir ANTES de cerrar tarea"
  proceso:
    1: "Identificar valor correcto"
    2: "Actualizar archivos desincronizados"
    3: "Commit atomico"
    4: "Re-ejecutar este checklist"
```

---

## REFERENCIA

- **Trigger:** `@TRIGGER-SSOT-SYNC`
- **Politica:** `@POLITICA-CAMPOS-MAESTROS`
- **Directiva:** `@SIMCO-VALIDACION-SSOT`
