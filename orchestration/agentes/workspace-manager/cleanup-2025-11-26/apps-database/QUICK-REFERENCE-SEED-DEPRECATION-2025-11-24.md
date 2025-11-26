# QUICK REFERENCE: Deprecación de Seed 10-missions-init.sql

**Fecha:** 2025-11-24
**Tarea:** Deprecar seed de misiones obsoleto
**Estado:** COMPLETADO

## CAMBIOS REALIZADOS

### 1. Archivo Movido
```
ANTES: apps/database/seeds/prod/gamification_system/10-missions-init.sql
AHORA: apps/database/seeds/prod/gamification_system/_deprecated/10-missions-init.sql
```

### 2. Scripts Actualizados
- `create-database.sh` - línea 553-554 comentada
- `validate-create-database.sh` - línea 239-240 comentada

### 3. Resultado
- Base de datos recreada exitosamente
- Cada usuario tiene exactamente 8 misiones (sin duplicados)
- 3 misiones diarias + 5 misiones semanales por usuario

## RAZÓN DE LA DEPRECACIÓN

El seed creaba misiones manualmente, pero la función `gamilit.initialize_user_missions()` ya las crea automáticamente al crear un perfil, causando duplicación (16 misiones en lugar de 8).

## REEMPLAZO

**Función automática:**
```
apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql
```

**Invocada por trigger:**
```
gamilit.initialize_user_stats() → AFTER INSERT en auth_management.profiles
```

## VALIDACIÓN

```sql
-- Verificar misiones por usuario
SELECT p.email, COUNT(m.id) as misiones
FROM auth_management.profiles p
LEFT JOIN gamification_system.missions m ON m.user_id = p.id
GROUP BY p.email
ORDER BY p.email;

-- Resultado esperado: 8 misiones por usuario
```

## ARCHIVOS DE REFERENCIA

- **Reporte completo:** `REPORTE-DEPRECACION-SEED-MISSIONS-2025-11-24.md`
- **Archivo deprecado:** `seeds/prod/gamification_system/_deprecated/10-missions-init.sql`

---
**Database-Agent** | 2025-11-24
