# FL-PRN-06 - Dashboard Portal Padres

**Portal:** Parents  
**Prioridad:** Alta  
**Estado:** Documentado

---

## Resumen

Flujo para cargar el dashboard de padres con estudiantes vinculados y resumen de progreso.

## Diagrama Mermaid

```mermaid
flowchart TD
    page[ParentDashboardPage] --> api[/parent-portal/dashboard]
    api --> service[ParentDashboardService]
    service --> db[(parent_accounts + parent_student_links + progress_tracking)]
    db --> ui[Widgets y resumen]
```

## Secuencia FE -> BE -> DB

1. Padre abre dashboard.
2. FE solicita datos agregados del portal.
3. Backend valida vinculación y permisos.
4. Se agregan métricas de progreso y actividad.
5. FE renderiza tarjetas y resumen.

## Trazabilidad

- Requerimiento: `EPIC-GAM-F3-PARENT-PORTAL`
- Matriz: `../TRACEABILITY-MATRIX.md`
- Cobertura total: `../COBERTURA-TOTAL-PROCESOS.md`
