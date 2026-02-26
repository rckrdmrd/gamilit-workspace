# FL-PRN-07 - Progreso por Hijo

**Portal:** Parents  
**Prioridad:** Alta  
**Estado:** Documentado

---

## Resumen

Flujo para consultar el progreso detallado de un estudiante vinculado.

## Diagrama Mermaid

```mermaid
flowchart TD
    page[ChildProgressPage] --> api[/parent-portal/students/:id/progress]
    api --> service[ParentProgressService]
    service --> db[(progress_tracking + data_warehouse)]
    db --> ui[Detalle por modulo]
```

## Nota Tecnica

> **Nota Tecnica:** El datasource `data_warehouse` NO esta configurado como datasource activo en `app.module.ts`. Los endpoints que dependen de analytics/data_warehouse pueden no estar operativos hasta que se configure.

## Secuencia FE -> BE -> DB

1. Padre selecciona estudiante.
2. FE consulta progreso detallado.
3. Backend valida vínculo activo.
4. Se agregan métricas y estados.
5. FE muestra detalle por módulo.

## Trazabilidad

- Requerimiento: `EPIC-GAM-F3-PARENT-PORTAL`
- Matriz: `../TRACEABILITY-MATRIX.md`
- Cobertura total: `../COBERTURA-TOTAL-PROCESOS.md`
