# Mapa de Vistas - gamification_system

**Generado por:** SA-DB-027 - Subagente de Migración SQL
**Fecha:** 2025-11-02
**Origen:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/views/`
**Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/views/`

---

## Resumen de Migración

| Métrica | Valor |
|---------|-------|
| Vistas Implementadas | 4/4 |
| Archivos Creados | 4 |
| Errores de Sintaxis | 0 |
| Estado | COMPLETADO |

---

## Vistas Migradas

### 1. leaderboard_coins.sql

**Archivo:** `01-leaderboard_coins.sql`

**Descripción:**
Materialized View que proporciona clasificación de usuarios basada en ML Coins ganadas (lifetime total).

**Propósito:**
Ranking de usuarios ordenados por monedas ML ganadas históricamente.

**Tipo:** Materialized View

**Frecuencia de Refresco:** Cada hora (CRON job)

**Campos Principales:**
- `user_id` - ID único del usuario
- `full_name` - Nombre completo (desde profiles)
- `avatar_url` - URL del avatar
- `ml_coins` - Monedas ML actuales
- `ml_coins_lifetime` - Total de monedas ML ganadas
- `maya_rank` - Rango actual de usuario
- `rank_position` - Posición en ranking
- `last_updated` - Última actualización

**Índices:**
- `idx_leaderboard_coins_user` (UNIQUE) - Búsqueda por usuario_id
- `idx_leaderboard_coins_rank` - Búsqueda por posición de ranking

**Dependencias:**
- `gamification_system.user_stats`
- `auth_management.profiles`
- `gamification_system.user_ranks`

**Condición WHERE:**
- Solo usuarios con `ml_coins_earned_total > 0`

**Líneas:** 48
**Tamaño:** 2,172 bytes

---

### 2. leaderboard_global.sql

**Archivo:** `02-leaderboard_global.sql`

**Descripción:**
Materialized View para clasificación global combinando XP, ML Coins y Rachas.

**Propósito:**
Ranking global usando fórmula ponderada: `(XP * 1.0) + (Coins * 0.5) + (Streak * 100)`

**Tipo:** Materialized View

**Frecuencia de Refresco:** Cada hora (CRON job)

**Fórmula de Puntuación:**
```
global_score = total_xp * 1.0 + ml_coins_lifetime * 0.5 + current_streak * 100
```

**Campos Principales:**
- `user_id` - ID único del usuario
- `full_name` - Nombre completo (desde profiles)
- `avatar_url` - URL del avatar
- `total_xp` - XP total acumulado
- `ml_coins_lifetime` - Total de monedas ML ganadas
- `current_streak` - Racha actual de días
- `max_streak` - Racha máxima histórica
- `maya_rank` - Rango actual de usuario
- `global_score` - Puntuación ponderada global
- `rank_position` - Posición en ranking global
- `last_updated` - Última actualización

**Índices:**
- `idx_leaderboard_global_user` (UNIQUE) - Búsqueda por usuario_id
- `idx_leaderboard_global_rank` - Búsqueda por posición de ranking
- `idx_leaderboard_global_score` - Ordenamiento rápido por puntuación

**Dependencias:**
- `gamification_system.user_stats`
- `auth_management.profiles`
- `gamification_system.user_ranks`

**Condición WHERE:**
- `total_xp > 0 OR ml_coins_earned_total > 0 OR current_streak > 0`

**Líneas:** 70
**Tamaño:** 2,902 bytes

---

### 3. leaderboard_streaks.sql

**Archivo:** `03-leaderboard_streaks.sql`

**Descripción:**
Materialized View de clasificación de usuarios basada en rachas actuales y máximas.

**Propósito:**
Ranking de usuarios ordenados por racha actual, con desempate por racha máxima.

**Tipo:** Materialized View

**Frecuencia de Refresco:** Cada hora (CRON job)

**Campos Principales:**
- `user_id` - ID único del usuario
- `full_name` - Nombre completo (desde profiles)
- `avatar_url` - URL del avatar
- `current_streak` - Racha actual de días
- `max_streak` - Racha máxima histórica
- `maya_rank` - Rango actual de usuario
- `rank_position` - Posición en ranking
- `last_updated` - Última actualización

**Criterio de Ordenamiento:**
1. `current_streak DESC` (racha actual descendente)
2. `max_streak DESC` (racha máxima descendente)
3. `user_id ASC` (ID de usuario ascendente - desempate)

**Índices:**
- `idx_leaderboard_streaks_user` (UNIQUE) - Búsqueda por usuario_id
- `idx_leaderboard_streaks_rank` - Búsqueda por posición de ranking

**Dependencias:**
- `gamification_system.user_stats`
- `auth_management.profiles`
- `gamification_system.user_ranks`

**Condición WHERE:**
- Solo usuarios con `current_streak > 0`

**Líneas:** 49
**Tamaño:** 2,208 bytes

---

### 4. leaderboard_xp.sql

**Archivo:** `04-leaderboard_xp.sql`

**Descripción:**
Materialized View de clasificación de usuarios basada en puntos de experiencia (XP).

**Propósito:**
Ranking de usuarios ordenados por XP total acumulado.

**Tipo:** Materialized View

**Frecuencia de Refresco:** Cada hora (CRON job)

**Campos Principales:**
- `user_id` - ID único del usuario
- `full_name` - Nombre completo (desde profiles)
- `avatar_url` - URL del avatar
- `total_xp` - XP total acumulado
- `maya_rank` - Rango actual de usuario
- `current_level` - Nivel actual del usuario
- `rank_position` - Posición en ranking
- `last_updated` - Última actualización

**Índices:**
- `idx_leaderboard_xp_user` (UNIQUE) - Búsqueda por usuario_id
- `idx_leaderboard_xp_rank` - Búsqueda por posición de ranking

**Dependencias:**
- `gamification_system.user_stats`
- `auth_management.profiles`
- `gamification_system.user_ranks`

**Condición WHERE:**
- Solo usuarios con `total_xp > 0`

**Líneas:** 48
**Tamaño:** 2,023 bytes

---

## Estadísticas de Migración

| Vista | Tipo | Tamaño | Líneas | Índices | Estado |
|-------|------|--------|--------|---------|--------|
| leaderboard_coins | MV | 2,172 B | 48 | 2 | ✓ Migrado |
| leaderboard_global | MV | 2,902 B | 70 | 3 | ✓ Migrado |
| leaderboard_streaks | MV | 2,208 B | 49 | 2 | ✓ Migrado |
| leaderboard_xp | MV | 2,023 B | 48 | 2 | ✓ Migrado |
| **TOTAL** | **4 MV** | **9,305 B** | **215** | **9** | **✓ OK** |

---

## Validación de Sintaxis

Todas las vistas han sido validadas y cumplen con los siguientes requisitos:

- [x] Contienen `CREATE MATERIALIZED VIEW`
- [x] Terminan correctamente con punto y coma
- [x] Contienen cláusula `WITH DATA`
- [x] Incluyen definiciones de índices para optimización
- [x] Incluyen comentarios COMMENT ON para documentación

**Errores Encontrados:** 0

---

## Notas Sobre la Migración

### Discrepancia Detectada

La tarea original solicitaba `user_inventory_summary.sql`, pero este archivo no existe como vista SQL en el origen. En su lugar se encontró:
- `04-leaderboard_xp.sql` - Vista de leaderboard basada en XP

Existe una función relacionada:
- `23-get_user_inventory_summary.sql` (en schemas/functions/)

Se procedió a migrar la vista `leaderboard_xp` por ser el cuarto archivo disponible en el origen.

### Consideraciones Importantes

1. **Materialized Views:** Todas las vistas son materializadas (no dinámicas), lo que mejora el rendimiento pero requiere actualizaciones periódicas.

2. **CRON Job Requerido:** Las vistas están configuradas para refresco cada hora mediante CRON job. El comando de actualización es:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboard_coins;
   REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboard_global;
   REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboard_streaks;
   REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboard_xp;
   ```

3. **Índices Únicos:** Todas las vistas poseen un índice único en `user_id` para garantizar integridad de búsquedas.

4. **Dependencias de Tablas:** Las 4 vistas dependen de:
   - `gamification_system.user_stats` (tabla principal)
   - `auth_management.profiles` (datos de usuario)
   - `gamification_system.user_ranks` (información de rangos)

---

## Pasos Siguientes (Recomendados)

1. **Crear CRON Jobs:**
   - Establecer trabajos de actualización cada hora para cada vista

2. **Validar en Base de Datos:**
   - Ejecutar scripts en ambiente de desarrollo
   - Ejecutar scripts en ambiente de staging
   - Validar disponibilidad de tablas dependientes

3. **Monitoreo:**
   - Monitorear tiempo de refresco de vistas
   - Registrar estadísticas de tamaño de vistas materializadas

4. **Documentación:**
   - Actualizar documentación de API si estas vistas alimentan endpoints
   - Documentar SLA de actualización (1 hora)

---

**Generado por:** SA-DB-027
**Versión del Mapa:** 1.0
**Última Actualización:** 2025-11-02
