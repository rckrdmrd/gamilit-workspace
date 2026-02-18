# SIMCO-MIGRACIONES-BD (DEPRECADA)

**Version:** 2.0.0  
**Tipo:** Directiva de referencia historica  
**Estado:** DEPRECADA - NO OPERATIVA  
**Fecha:** 2026-02-17

---

## Estado actual

Esta directiva queda deprecada y no debe usarse como base operacional.

El proyecto `gamilit` opera bajo politica **DDL-first con recreacion limpia**:

- Todo cambio de BD se hace en `apps/database/ddl/` y/o `apps/database/seeds/`.
- No se permite flujo operativo por archivos `migrations/`, `fix-*`, `patch-*`, `hotfix-*`.
- La validacion obligatoria es recreacion por scripts shell canónicos.

---

## Fuentes de verdad vigentes

Usar exclusivamente:

1. `orchestration/directivas/simco/SIMCO-DDL.md`
2. `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
3. `docs/20-architecture/AMBIENTES-DEV-PROD.md`
4. `docs/90-adr/ADR-018-removal-migrations-folders.md`

---

## Nota de trazabilidad

El contenido previo sobre protocolo de migraciones incrementales se conserva en el historial de Git.
No debe reactivarse ni aplicarse en este repositorio standalone.
