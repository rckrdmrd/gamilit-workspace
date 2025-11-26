# REPORTE DE DEPRECACIÓN: Seed 10-missions-init.sql

**Fecha:** 2025-11-24 23:24
**Agente:** Database-Agent
**Tarea:** Deprecar seed de misiones obsoleto
**Estado:** COMPLETADO

---

## RESUMEN EJECUTIVO

Se deprecó exitosamente el seed `10-missions-init.sql` que estaba causando duplicación de misiones para usuarios de testing. Las misiones ahora se crean automáticamente mediante la función `gamilit.initialize_user_missions()` que es invocada por el trigger `initialize_user_stats()` al crear un nuevo perfil.

## PROBLEMA IDENTIFICADO

**Duplicación de Misiones:**
- El seed `10-missions-init.sql` creaba manualmente 8 misiones para cada usuario de testing
- La función `gamilit.initialize_user_missions()` también creaba automáticamente 8 misiones al crear un perfil
- Resultado: Cada usuario tenía 16 misiones en lugar de 8 (duplicación 2x)

## SOLUCIÓN IMPLEMENTADA

### 1. Archivo Movido a _deprecated

**Origen:**
```
apps/database/seeds/prod/gamification_system/10-missions-init.sql
```

**Destino:**
```
apps/database/seeds/prod/gamification_system/_deprecated/10-missions-init.sql
```

**Comentario de Deprecación Agregado:**
```sql
-- =====================================================
-- ⚠️ ARCHIVO DEPRECADO ⚠️
-- =====================================================
-- DEPRECADO EL: 2025-11-24
-- RAZÓN: Las misiones ahora se crean automáticamente mediante la función
--        gamilit.initialize_user_missions() que es invocada por el trigger
--        initialize_user_stats() al crear un nuevo perfil.
--
-- REEMPLAZO: Ver gamilit.initialize_user_missions() en:
--            apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql
--
-- PROBLEMA QUE CAUSABA: Este seed creaba duplicación de misiones para los
--                       usuarios de testing, ya que las misiones se creaban
--                       dos veces:
--                       1. Por el trigger al crear el perfil
--                       2. Por este seed manualmente
--
-- HISTÓRICO: Mantener como referencia de la estructura de misiones
-- =====================================================
```

### 2. Scripts Actualizados

**Archivo:** `create-database.sh`
```bash
# ANTES:
execute_sql "$SEEDS_DIR/gamification_system/10-missions-init.sql" "Seeds: missions initialization (student)"

# DESPUÉS:
# DEPRECADO 2025-11-24: Misiones ahora se crean automáticamente via gamilit.initialize_user_missions()
# execute_sql "$SEEDS_DIR/gamification_system/10-missions-init.sql" "Seeds: missions initialization (student)"
```

**Archivo:** `validate-create-database.sh`
```bash
# ANTES:
check_file "$SEEDS_DIR/gamification_system/10-missions-init.sql" "gamification_system/10-missions-init.sql"

# DESPUÉS:
# DEPRECADO 2025-11-24: Misiones ahora se crean automáticamente via gamilit.initialize_user_missions()
# check_file "$SEEDS_DIR/gamification_system/10-missions-init.sql" "gamification_system/10-missions-init.sql"
```

### 3. Base de Datos Recreada

**Comando ejecutado:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
./drop-and-recreate-database.sh "postgresql://gamilit_user:C5hq7253pdVyVKUC@localhost:5432/gamilit_platform"
```

**Resultado:**
```
✅ BASE DE DATOS CREADA EXITOSAMENTE
   - Schemas:     18
   - Tablas:     124
   - ENUMs:       37
   - Funciones:  183
   - Triggers:    77
```

## VALIDACIÓN DE RESULTADOS

### Cantidad de Misiones por Usuario

**Query ejecutada:**
```sql
SELECT p.email, COUNT(m.id) as misiones
FROM auth_management.profiles p
LEFT JOIN gamification_system.missions m ON m.user_id = p.id
GROUP BY p.email
ORDER BY p.email;
```

**Resultado:**
```
email                                     | misiones
------------------------------------------+----------
Aragon494gt54@icloud.com                  |        8
Gomezfornite92@gmail.com                  |        8
admin@gamilit.com                         |        8
barraganfer03@gmail.com                   |        8
blu3wt7@gmail.com                         |        8
diego.colores09@gmail.com                 |        8
hernandezfonsecabenjamin7@gmail.com       |        8
joseal.guirre34@gmail.com                 |        8
jr7794315@gmail.com                       |        8
marbancarlos916@gmail.com                 |        8
ricardolugo786@icloud.com                 |        8
rodrigoguerrero0914@gmail.com             |        8
roman.rebollar.marcoantonio1008@gmail.com |        8
sergiojimenezesteban63@gmail.com          |        8
student@gamilit.com                       |        8
teacher@gamilit.com                       |        8
(16 rows)
```

### Tipos de Misiones (Usuarios Demo)

**Query ejecutada:**
```sql
SELECT
    p.email,
    m.mission_type,
    COUNT(*) as cantidad,
    STRING_AGG(DISTINCT m.template_id, ', ') as templates
FROM auth_management.profiles p
JOIN gamification_system.missions m ON m.user_id = p.id
WHERE p.email IN ('student@gamilit.com', 'admin@gamilit.com', 'teacher@gamilit.com')
GROUP BY p.email, m.mission_type
ORDER BY p.email, m.mission_type;
```

**Resultado:**
```
email               | mission_type | cantidad | templates
--------------------+--------------+----------+--------------------------------
admin@gamilit.com   | daily        |        3 | daily_complete_exercises, daily_earn_xp, daily_use_comodin
admin@gamilit.com   | weekly       |        5 | weekly_complete_module, weekly_daily_streak, weekly_explorer, weekly_master_learner, weekly_perfect_scores
student@gamilit.com | daily        |        3 | daily_complete_exercises, daily_earn_xp, daily_use_comodin
student@gamilit.com | weekly       |        5 | weekly_complete_module, weekly_daily_streak, weekly_explorer, weekly_master_learner, weekly_perfect_scores
teacher@gamilit.com | daily        |        3 | daily_complete_exercises, daily_earn_xp, daily_use_comodin
teacher@gamilit.com | weekly       |        5 | weekly_complete_module, weekly_daily_streak, weekly_explorer, weekly_master_learner, weekly_perfect_scores
```

## CRITERIOS DE ACEPTACIÓN

- [x] Archivo movido a `_deprecated`
- [x] Comentario de deprecación agregado
- [x] Scripts `create-database.sh` y `validate-create-database.sh` actualizados
- [x] Base de datos recreada sin errores
- [x] Cada usuario tiene exactamente 8 misiones (no duplicadas)
- [x] 3 misiones diarias por usuario
- [x] 5 misiones semanales por usuario
- [x] No hay duplicados de template_id por usuario

## ARCHIVOS MODIFICADOS

1. **Movido:**
   - De: `apps/database/seeds/prod/gamification_system/10-missions-init.sql`
   - A: `apps/database/seeds/prod/gamification_system/_deprecated/10-missions-init.sql`

2. **Editados:**
   - `apps/database/create-database.sh` (línea 553-554)
   - `apps/database/validate-create-database.sh` (línea 239-240)

3. **Creado:**
   - `apps/database/REPORTE-DEPRECACION-SEED-MISSIONS-2025-11-24.md` (este archivo)

## FUNCIONALIDAD ACTUAL

Las misiones ahora se crean automáticamente mediante:

1. **Trigger:** `initialize_user_stats()`
   - Se ejecuta AFTER INSERT en `auth_management.profiles`
   - Llama a `gamilit.initialize_user_missions(p_user_id)`

2. **Función:** `gamilit.initialize_user_missions(p_user_id UUID)`
   - Ubicación: `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql`
   - Crea 8 misiones (3 diarias + 5 semanales)
   - Usa la fecha actual de México via `gamilit.now_mexico()`
   - Maneja errores con `ON CONFLICT DO NOTHING`

## NOTAS ADICIONALES

- El archivo deprecado se mantiene como referencia histórica
- No se eliminó el archivo, solo se movió a `_deprecated`
- La estructura de misiones (3 diarias + 5 semanales) se mantiene igual
- Los templates de misiones no cambiaron:
  - **Diarias:** `daily_complete_exercises`, `daily_earn_xp`, `daily_use_comodin`
  - **Semanales:** `weekly_complete_module`, `weekly_daily_streak`, `weekly_perfect_scores`, `weekly_explorer`, `weekly_master_learner`

## IMPACTO

**Antes de la deprecación:**
- 16 usuarios de producción × 8 misiones duplicadas = 256 misiones (128 reales + 128 duplicadas)

**Después de la deprecación:**
- 16 usuarios de producción × 8 misiones = 128 misiones (sin duplicados)

**Reducción:** 50% menos de filas en `gamification_system.missions`

---

**Database-Agent**
2025-11-24 23:24
