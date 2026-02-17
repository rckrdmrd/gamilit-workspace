# Fase 5 (Legacy): Guias y Referencias

**Tipo:** Referencia historica  
**Estado:** Completado (legacy)  
**Ultima actualizacion:** 2026-02-17

---

## Proposito

Conservar trazabilidad del cierre de migracion documental sin duplicar SSOT.  
Este archivo actua como puente hacia la estructura canonica actual.

## Navegacion canonica vigente

| Dominio | Ruta canonica |
|---------|---------------|
| Vision general | [../README.md](../README.md) |
| Guias de desarrollo | [../../50-guides/_INDEX.md](../../50-guides/_INDEX.md) |
| Referencias transversales | [../../80-references/transversal/README.md](../../80-references/transversal/README.md) |
| ADRs | [../../90-adr/README.md](../../90-adr/README.md) |
| Estandares | [../../40-standards/README.md](../../40-standards/README.md) |

## Inventarios SSOT

- [../../../orchestration/inventarios/MASTER_INVENTORY.yml](../../../orchestration/inventarios/MASTER_INVENTORY.yml)
- [../../../orchestration/inventarios/DATABASE_INVENTORY.yml](../../../orchestration/inventarios/DATABASE_INVENTORY.yml)
- [../../../orchestration/inventarios/BACKEND_INVENTORY.yml](../../../orchestration/inventarios/BACKEND_INVENTORY.yml)
- [../../../orchestration/inventarios/FRONTEND_INVENTORY.yml](../../../orchestration/inventarios/FRONTEND_INVENTORY.yml)
- [../../../orchestration/inventarios/TRACEABILITY_MATRIX.yml](../../../orchestration/inventarios/TRACEABILITY_MATRIX.yml)

## Nota de normalizacion

- 1FN: este archivo mantiene una unica responsabilidad (puente de fase).
- 2FN: no incluye contenido operativo detallado de guias/ADR/estandares.
- 3FN: toda metrica y detalle se referencia por enlace a su fuente SSOT.
