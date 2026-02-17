# Ciclo Operativo de Mantenimiento de Trazabilidad

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Objetivo

Evitar degradacion documental y de planeacion mediante una rutina fija por sprint que mantenga sincronizados flujos, backlog e inventarios.

---

## Cadencia

- **Frecuencia minima:** semanal o cierre de sprint (lo que ocurra primero).
- **Responsables:** Product/Tech Lead + responsables de dominio DB/BE/FE/Docs.
- **Entrada:** cambios de sprint, cambios de flujos, nuevas tareas, cierre de tareas.
- **Salida:** brechas registradas, backlog actualizado, estado de trazabilidad publicado.

---

## Fases del ciclo

1. **Auditoria corta de flujos (30-60 min)**
   - Validar IDs unicos `FL-*`.
   - Validar documento por flujo o alias formalmente declarado.
   - Validar Mermaid + secuencia FE->BE->DB + trazabilidad.

2. **Reconciliacion de planeacion (30 min)**
   - Revisar `docs/10-requirements/epics` vs `orchestration/work-items` vs `orchestration/scrum/BACKLOG.yml`.
   - Confirmar mapeo en `orchestration/scrum/BACKLOG-MAPPING.yml`.

3. **Gate de calidad de tareas (30 min)**
   - Muestreo de tasks nuevas/cerradas:
     - `standards_applied`
     - `related_adrs`
     - `skills_applied`
     - `quality_gates`

4. **Cierre y publicacion (15 min)**
   - Actualizar matriz de brechas.
   - Abrir items nuevos en backlog (si aplica).
   - Registrar resultado en traza/tarea operativa activa.

---

## Checklist de salida obligatorio

- [ ] No hay IDs `FL-*` duplicados en cobertura total.
- [ ] Todo flujo critico tiene US y TASK activa o planificada.
- [ ] No hay diferencias de estado entre backlog operativo y work-items.
- [ ] Tasks revisadas incluyen estandares, ADR, skills y quality gates.
- [ ] Matriz de brechas actualizada con prioridad y responsable.

---

## KPIs minimos

| KPI | Formula | Meta |
|-----|---------|------|
| Cobertura de flujo documentado | `flujos_con_documento / flujos_declarados` | 100% |
| Trazabilidad a task | `flujos_criticos_con_task / flujos_criticos` | 100% |
| Calidad de task | `tasks_con_campos_obligatorios / tasks_nuevas` | >= 95% |
| Brechas P0 abiertas | conteo `P0` en matriz | 0 |
| Brechas P1 abiertas | conteo `P1` en matriz | tendencia descendente por sprint |

---

## Referencias

- `docs/30-ux-ui/flujos/AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md`
- `docs/30-ux-ui/flujos/MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md`
- `orchestration/scrum/BACKLOG.yml`
- `orchestration/scrum/BACKLOG-MAPPING.yml`
