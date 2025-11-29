# Deprecated Migrations - Maya Rank P0-001

**Fecha de deprecación:** 2025-11-29
**Motivo:** Integración de funciones al DDL permanente

---

## Archivos Deprecados

| Archivo | Propósito Original | Estado |
|---------|-------------------|--------|
| `P0-001-migrate-maya-rank-values.sql` | Migrar valores legacy de Maya Rank | DEPRECATED |
| `P0-000-pre-migration-backup.sh` | Script de backup pre-migración | DEPRECATED |

---

## Razón de Deprecación

Las funciones útiles de esta migración han sido **integradas permanentemente** al DDL:

**Nuevo archivo DDL:**
`apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql`

**Funciones integradas:**
- `calculate_maya_rank_from_xp(INTEGER)` → Calcula rango Maya desde XP
- `calculate_rank_progress_percentage(INTEGER, TEXT)` → Calcula progreso dentro del rango

---

## Cuándo Usar Estos Archivos

**NUNCA** para nuevas instalaciones - el DDL ya incluye las funciones necesarias.

**SOLO** para migración de datos legacy en bases de datos existentes que:
1. Fueron creadas antes de 2025-11-07
2. Contienen valores de rank incorrectos (NACOM, BATAB, HOLCATTE, etc.)
3. Requieren corrección manual de datos existentes

---

## Alternativa Recomendada

Para nuevas instalaciones, usar recreación limpia:

```bash
cd apps/database
./drop-and-recreate-database.sh $DATABASE_URL
```

---

**Deprecado por:** Architecture-Analyst
**Referencia:** PLAN-VALIDACION-CLEAN-CREATION-2025-11-29.md
