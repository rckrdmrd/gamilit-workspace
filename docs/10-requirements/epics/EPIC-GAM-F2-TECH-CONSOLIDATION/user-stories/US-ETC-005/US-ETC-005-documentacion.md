---
titulo: "US-ETC-005: Actualizacion de Documentacion"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# US-ETC-005: Actualizacion de Documentacion

**Historia de Usuario ID:** US-ETC-005
**EPIC:** ETC-001 - Consolidacion Tecnica
**Sprint:** 2
**Story Points:** 3
**Estado:** Planificada

---

## Historia

**Como** desarrollador/mantenedor
**Quiero** tener documentacion actualizada que refleje el estado real del sistema
**Para** poder navegar el codebase eficientemente y tomar decisiones informadas

---

## Contexto

Despues de la consolidacion tecnica, los inventarios y documentacion deben reflejar:
- Nuevas ubicaciones canonicas de APIs
- Archivos eliminados
- Entities agregadas
- Metricas actualizadas

---

## Tareas

### TASK-001: Actualizar MASTER_INVENTORY.yml
**Estimacion:** 30min

1. Actualizar conteos de archivos
2. Actualizar metricas post-consolidacion
3. Agregar nota de consolidacion
4. Actualizar fecha de ultima validacion

### TASK-002: Actualizar BACKEND_INVENTORY.yml
**Estimacion:** 30min

1. Actualizar lista de entities
2. Agregar entities nuevas (AchievementCategory, UserActivity, UserFollow)
3. Actualizar conteo de services
4. Documentar archivos eliminados

### TASK-003: Actualizar FRONTEND_INVENTORY.yml
**Estimacion:** 30min

1. Actualizar lista de API services (ubicaciones canonicas)
2. Eliminar referencias a archivos duplicados
3. Actualizar conteo de componentes
4. Actualizar metricas de bundle size

### TASK-004: Actualizar Mapas de Navegacion
**Estimacion:** 30min

1. Actualizar `docs/_MAP.md` con ETC-001
2. Actualizar `docs/02-fase-robustecimiento/_MAP.md`
3. Actualizar `orchestration/_MAP.md`

### TASK-005: Crear ADR de Consolidacion
**Estimacion:** 1h

1. Documentar decisiones tomadas
2. Justificar eliminaciones
3. Documentar nuevas convenciones
4. Registrar metricas antes/despues

**Archivo a crear:**
```
docs/90-adr/ADR-022-consolidacion-tecnica-2026-01.md
```

---

## Criterios de Aceptacion

- [ ] Todos los inventarios actualizados
- [ ] Mapas de navegacion sincronizados
- [ ] ADR documentando decisiones
- [ ] Metricas reflejando estado post-consolidacion

---

## Definition of Done

- [ ] MASTER_INVENTORY.yml actualizado
- [ ] BACKEND_INVENTORY.yml actualizado
- [ ] FRONTEND_INVENTORY.yml actualizado
- [ ] Mapas de navegacion actualizados
- [ ] ADR-022 creado y completo
- [ ] Commit descriptivo

---

## Dependencias

Esta HU depende de la completitud de:
- US-ETC-004: Validacion de Integracion E2E

---

## Template ADR

```markdown
## ADR-022: Consolidacion Tecnica 2026-01

## Estado
Aceptado

## Contexto
[Descripcion del contexto que llevo a la consolidacion]

## Decision
[Decisiones tomadas durante la consolidacion]

## Consecuencias
### Positivas
- Reduccion de duplicidades
- Mayor mantenibilidad
- Bundle size reducido

### Negativas
- Cambios en imports existentes

## Metricas
| Metrica | Antes | Despues | Delta |
|---------|-------|---------|-------|
| Duplicidades | 47 | 0 | -47 |
| Coherencia DB-BE | 90% | 98% | +8% |
```

---

**Creado:** 2026-01-16
**Asignado:** META-ORQUESTADOR
