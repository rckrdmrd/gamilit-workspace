# QUICK REFERENCE: initialize_user_missions

## Función Creada
```sql
gamilit.initialize_user_missions(p_user_id UUID) RETURNS void
```

## Ubicación
```
apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql
```

## Uso
```sql
-- Llamar durante registro de usuario
SELECT gamilit.initialize_user_missions('profile_uuid_here');
```

## Misiones Creadas

### DIARIAS (3)
```
┌──────────────────────────┬───────────────────────────┬────────┬─────┬──────────┐
│ Template ID              │ Título                    │ Target │ XP  │ ML Coins │
├──────────────────────────┼───────────────────────────┼────────┼─────┼──────────┤
│ daily_complete_exercises │ Completar 3 ejercicios    │ 3      │ 50  │ 25       │
│ daily_earn_xp            │ Ganar 100 XP              │ 100    │ 30  │ 15       │
│ daily_use_comodin        │ Usar un comodín           │ 1      │ 20  │ 10       │
└──────────────────────────┴───────────────────────────┴────────┴─────┴──────────┘
```

### SEMANALES (5)
```
┌───────────────────────┬──────────────────────────┬────────┬─────┬──────────┐
│ Template ID           │ Título                   │ Target │ XP  │ ML Coins │
├───────────────────────┼──────────────────────────┼────────┼─────┼──────────┤
│ weekly_complete_module│ Completar un módulo      │ 1      │ 200 │ 100      │
│ weekly_daily_streak   │ Racha de 5 días          │ 5      │ 150 │ 75       │
│ weekly_perfect_scores │ Perfección absoluta      │ 3      │ 180 │ 90       │
│ weekly_explorer       │ Explorador curioso       │ 3      │ 120 │ 60       │
│ weekly_master_learner │ Maestro del aprendizaje  │ 15     │ 250 │ 125      │
└───────────────────────┴──────────────────────────┴────────┴─────┴──────────┘
```

## Totales
- **Misiones:** 8 (3 diarias + 5 semanales)
- **XP Total:** 1,000
- **ML Coins Total:** 500

## Integración con initialize_user_stats

### Archivo a modificar
```
apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

### Cambio requerido (línea 86)
```sql
-- ANTES (comentado):
-- PERFORM gamilit.initialize_user_missions(NEW.user_id);  -- TODO: Implementar función

-- DESPUÉS (descomentar y corregir):
PERFORM gamilit.initialize_user_missions(NEW.id);  -- ⚠️ usar NEW.id, no NEW.user_id
```

### ⚠️ IMPORTANTE
- Usar `NEW.id` (que es `profiles.id`)
- NO usar `NEW.user_id` (que es `auth.users.id`)
- La FK de `missions.user_id` apunta a `auth_management.profiles(id)`

## Verificación

### Comprobar función existe
```sql
\df gamilit.initialize_user_missions
```

### Ejecutar para un usuario
```sql
SELECT gamilit.initialize_user_missions('user_profile_id_here');
```

### Verificar misiones creadas
```sql
SELECT mission_type, COUNT(*) 
FROM gamification_system.missions 
WHERE user_id = 'user_profile_id_here'
GROUP BY mission_type;

-- Resultado esperado:
-- daily:  3
-- weekly: 5
```

## Características Técnicas

### Zona Horaria
```sql
v_today_start := gamilit.now_mexico()::date;
```

### Fechas
- **Diarias:** Válidas hasta las 23:59 del día actual
- **Semanales:** Válidas por 7 días completos

### Prevención de Duplicados
```sql
ON CONFLICT DO NOTHING;
```

### Estado Inicial
- `status = 'active'`
- `progress = 0`

## Referencias
- **Seed de referencia:** `apps/database/seeds/prod/gamification_system/10-missions-init.sql`
- **Tabla missions:** `apps/database/ddl/schemas/gamification_system/tables/06-missions.sql`
- **Prompt Database-Agent:** `orchestration/prompts/PROMPT-DATABASE-AGENT.md`

---
**Creado:** 2025-11-24  
**Database-Agent**
