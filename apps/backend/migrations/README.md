# Migraciones de Base de Datos - Gamilit Backend

> **⚠️ NOTA IMPORTANTE (2025-11-29)**
>
> Los archivos de migración P0-001 han sido **DEPRECADOS** y movidos a:
> `apps/backend/_deprecated/migrations-maya-rank-2025-11-29/`
>
> Las funciones helper fueron **INTEGRADAS AL DDL** en:
> `apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql`
>
> **Para nuevas instalaciones:** Usar recreación limpia de BD.
> **Para datos legacy:** Ver archivos en `_deprecated/` solo si es necesario migrar datos existentes.

---

## Estado Actual

Este directorio está **VACÍO** (excepto este README) porque:

1. **Política de Carga Limpia:** No usamos migraciones activas
2. **DDL como Fuente de Verdad:** Toda la estructura de BD está en `/apps/database/ddl/`
3. **Recreación Limpia:** Usamos `create-database.sh` para recrear BD desde cero

---

## Historial de Migraciones Deprecadas

### P0-001: Migración de MayaRank Legacy (DEPRECADO 2025-11-29)

**Ubicación:** `apps/backend/_deprecated/migrations-maya-rank-2025-11-29/`

**Problema Original:**
- Valores legacy incorrectos: `NACOM`, `BATAB`, `HOLCATTE`, etc.
- Valores correctos: `Ajaw`, `Nacom`, `Ah K'in`, `Halach Uinic`, `K'uk'ulkan`

**Solución Implementada:**
- Funciones helper integradas al DDL permanentemente
- Datos legacy solo necesitan corrección en BD existentes (no nuevas)

---

## Funciones Ahora en DDL

Las siguientes funciones fueron integradas al DDL y ya NO están en migraciones:

| Función | Ubicación DDL | Descripción |
|---------|---------------|-------------|
| `calculate_maya_rank_from_xp(INTEGER)` | `calculate_maya_rank_helpers.sql` | Calcula rango desde XP |
| `calculate_rank_progress_percentage(INTEGER, TEXT)` | `calculate_maya_rank_helpers.sql` | Calcula % progreso dentro del rango |

**Uso:**
```sql
SELECT gamification_system.calculate_maya_rank_from_xp(5000);
-- Resultado: 'Ah K'in'

SELECT gamification_system.calculate_rank_progress_percentage(1500, 'Nacom');
-- Resultado: 25.00
```

---

## Referencias

- **Deprecación:** `apps/backend/_deprecated/migrations-maya-rank-2025-11-29/README.md`
- **DDL Actual:** `apps/database/ddl/schemas/gamification_system/functions/`
- **Plan de Validación:** `orchestration/agentes/architecture-analyst/PLAN-VALIDACION-CLEAN-CREATION-2025-11-29.md`
- **Fecha de Actualización:** 2025-11-29

---

**Política:** Este directorio debe permanecer vacío. Cualquier nueva corrección de datos debe documentarse y deprecarse apropiadamente.
