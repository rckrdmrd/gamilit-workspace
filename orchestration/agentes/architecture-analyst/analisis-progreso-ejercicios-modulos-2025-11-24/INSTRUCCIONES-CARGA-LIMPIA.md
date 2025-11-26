# INSTRUCCIONES: Carga Limpia para Estandarización XP

**Fecha:** 2025-11-24
**Proyecto:** GAMILIT
**Política Aplicable:** DIRECTIVA-POLITICA-CARGA-LIMPIA.md
**Estado:** ✅ LISTO PARA EJECUTAR

---

## 📋 RESUMEN EJECUTIVO

Los seeds de ejercicios YA están corregidos con valores estándar (100 XP / 20 ML Coins). Para que estos cambios se reflejen en la base de datos en ejecución, se requiere **recreación completa** siguiendo la política de carga limpia del proyecto.

**❌ MIGRATIONS PROHIBIDAS** - Este proyecto NO usa migrations. Siempre se recrea la base de datos desde seeds.

---

## ✅ PREREQUISITOS

Antes de ejecutar la carga limpia, verificar:

### 1. Seeds Validados

```bash
# Verificar que seeds tienen valores correctos (100 XP / 20 ML Coins)
for module in 02-exercises-module1 03-exercises-module2 04-exercises-module3; do
  echo "=== $module.sql ==="
  grep -A1 "xp_reward, ml_coins_reward" apps/database/seeds/dev/educational_content/${module}.sql | grep "^\s\+[0-9]" | head -5
done
```

**Resultado esperado:** Todas las líneas deben mostrar `100, 20,`

### 2. Script de Recreación Disponible

```bash
# Verificar que script existe y es ejecutable
ls -lh apps/database/drop-and-recreate-database.sh
# Si no es ejecutable: chmod +x apps/database/drop-and-recreate-database.sh
```

### 3. Variables de Entorno Configuradas

```bash
# Verificar DATABASE_URL o credenciales individuales
echo $DATABASE_URL
# O verificar:
# - PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
```

---

## 🚀 PROCEDIMIENTO DE CARGA LIMPIA

### Paso 1: Backup de Seguridad (Opcional en DEV)

Si hay datos de testing que quieres preservar para referencia:

```bash
cd apps/database

# Crear backup
pg_dump -U gamilit_user -d gamilit_platform -F c \
  -f backups/backup-pre-estandarizacion-xp-$(date +%Y%m%d-%H%M%S).dump

echo "✅ Backup creado en backups/"
```

**NOTA:** En desarrollo este paso es opcional ya que los datos se van a perder de todos modos.

---

### Paso 2: Ejecutar Recreación de Base de Datos

**IMPORTANTE:** Este comando ELIMINA la base de datos existente y la recrea desde cero.

```bash
cd apps/database

# Opción 1: Usando DATABASE_URL
DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform" \
  ./drop-and-recreate-database.sh

# Opción 2: Usando variables individuales
PGHOST=localhost \
PGPORT=5432 \
PGDATABASE=gamilit_platform \
PGUSER=gamilit_user \
PGPASSWORD=PASSWORD \
  ./drop-and-recreate-database.sh
```

**Duración estimada:** 2-5 minutos (dependiendo del tamaño de seeds)

**Output esperado:**
```
🗑️  Eliminando base de datos anterior...
DROP DATABASE

🆕 Creando base de datos limpia...
CREATE DATABASE

📊 Cargando schemas...
✅ Schema public creado
✅ Schema educational_content creado
✅ Schema gamification_system creado
✅ Schema progress_tracking creado

📋 Ejecutando DDL...
✅ Tablas creadas: 47 objetos
✅ Funciones creadas: 23 objetos
✅ Triggers creados: 15 objetos

🌱 Cargando seeds...
✅ auth/01-roles.sql
✅ auth/02-test-users.sql
✅ educational_content/01-modules.sql
✅ educational_content/02-exercises-module1.sql
✅ educational_content/03-exercises-module2.sql
✅ educational_content/04-exercises-module3.sql
✅ gamification_system/03-maya_ranks.sql

🔍 Validando integridad...
✅ Todos los ejercicios cargados: 19 ejercicios
✅ Usuarios de prueba creados: 4 usuarios

✅ BASE DE DATOS RECREADA EXITOSAMENTE
```

---

### Paso 3: Validar Estandarización de XP

Ejecutar query de validación para confirmar que todos los ejercicios tienen 100 XP:

```bash
psql -U gamilit_user -d gamilit_platform <<SQL
SELECT
    mod.module_code AS modulo,
    COUNT(ex.id) AS total_ejercicios,
    MIN(ex.xp_reward) AS min_xp,
    MAX(ex.xp_reward) AS max_xp,
    AVG(ex.xp_reward)::INTEGER AS promedio_xp,
    STDDEV(ex.xp_reward)::INTEGER AS desviacion_std,
    SUM(ex.xp_reward) AS xp_total_disponible,
    CASE
        WHEN MIN(ex.xp_reward) = MAX(ex.xp_reward) AND MIN(ex.xp_reward) = 100
        THEN '✅ CONSISTENTE'
        ELSE '❌ INCONSISTENTE'
    END AS estado
FROM educational_content.modules mod
JOIN educational_content.exercises ex ON ex.module_id = mod.id
WHERE mod.module_code IN ('MOD-01-LITERAL', 'MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
GROUP BY mod.module_code
ORDER BY mod.module_code;
SQL
```

**Resultado esperado:**
```
      modulo        | total_ejercicios | min_xp | max_xp | promedio_xp | desviacion_std | xp_total_disponible |    estado
────────────────────┼──────────────────┼────────┼────────┼─────────────┼────────────────┼─────────────────────┼────────────────
 MOD-01-LITERAL     |                5 |    100 |    100 |         100 |              0 |                 500 | ✅ CONSISTENTE
 MOD-02-INFERENCIAL |                5 |    100 |    100 |         100 |              0 |                 500 | ✅ CONSISTENTE
 MOD-03-CRITICA     |                9 |    100 |    100 |         100 |              0 |                 900 | ✅ CONSISTENTE
```

**Criterios de éxito:**
- ✅ min_xp = 100
- ✅ max_xp = 100
- ✅ desviacion_std = 0
- ✅ estado = "✅ CONSISTENTE" en los 3 módulos

---

### Paso 4: Validar Progresión de Rangos

Verificar que la tabla de rangos está correctamente cargada:

```bash
psql -U gamilit_user -d gamilit_platform <<SQL
SELECT
    rank_name,
    min_xp_required,
    max_xp_threshold,
    ml_coins_bonus,
    xp_multiplier,
    next_rank
FROM gamification_system.maya_ranks
WHERE is_active = true
ORDER BY min_xp_required;
SQL
```

**Resultado esperado:**
```
   rank_name    | min_xp_required | max_xp_threshold | ml_coins_bonus | xp_multiplier |  next_rank
────────────────┼─────────────────┼──────────────────┼────────────────┼───────────────┼──────────────
 Ajaw           |               0 |              499 |              0 |          1.00 | Nacom
 Nacom          |             500 |              999 |            100 |          1.10 | Ah K'in
 Ah K'in        |            1000 |             1499 |            250 |          1.15 | Halach Uinic
 Halach Uinic   |            1500 |             2249 |            500 |          1.20 | K'uk'ulkan
 K'uk'ulkan     |            2250 |                  |           1000 |          1.25 |
```

---

### Paso 5: Testing Funcional Básico

Opcional pero recomendado - probar flujo completo de ejercicio:

```bash
# 1. Crear usuario de prueba (si no existe)
psql -U gamilit_user -d gamilit_platform <<SQL
INSERT INTO auth.users (id, email, username, role)
VALUES (
    'test-user-xp-validation'::UUID,
    'test-xp@gamilit.local',
    'test_xp_user',
    'student'
)
ON CONFLICT (id) DO NOTHING;

-- Inicializar stats
INSERT INTO gamification_system.user_stats (user_id, current_rank, total_xp)
VALUES ('test-user-xp-validation'::UUID, 'Ajaw', 0)
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Usuario de prueba creado' AS resultado;
SQL

# 2. Simular completar ejercicio del Módulo 2 (debería dar 100 XP)
psql -U gamilit_user -d gamilit_platform <<SQL
-- Obtener ID del primer ejercicio del Módulo 2
WITH exercise AS (
    SELECT ex.id, ex.xp_reward
    FROM educational_content.exercises ex
    JOIN educational_content.modules mod ON ex.module_id = mod.id
    WHERE mod.module_code = 'MOD-02-INFERENCIAL'
    ORDER BY ex.order_index
    LIMIT 1
)
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    is_correct,
    score,
    xp_earned,
    ml_coins_earned,
    submitted_at
)
SELECT
    'test-user-xp-validation'::UUID,
    exercise.id,
    true,
    100,
    exercise.xp_reward,  -- Debería ser 100
    20,
    NOW()
FROM exercise;

-- Verificar que XP se acumuló correctamente
SELECT
    user_id,
    current_rank,
    total_xp,
    ml_coins,
    exercises_completed
FROM gamification_system.user_stats
WHERE user_id = 'test-user-xp-validation'::UUID;
SQL
```

**Resultado esperado:**
```
              user_id               | current_rank | total_xp | ml_coins | exercises_completed
────────────────────────────────────┼──────────────┼──────────┼──────────┼────────────────────
 test-user-xp-validation            | Ajaw         |      100 |       20 |                   1
```

**Validaciones:**
- ✅ total_xp = 100 (no 15 ni 20, debe ser 100)
- ✅ ml_coins = 20
- ✅ exercises_completed = 1

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de completar la carga limpia, verificar:

### Base de Datos

- [ ] Base de datos recreada sin errores
- [ ] Todos los schemas creados (public, educational_content, gamification_system, progress_tracking, etc.)
- [ ] Todas las tablas creadas (≥40 tablas esperadas)
- [ ] Todos los triggers creados (≥10 triggers esperados)
- [ ] Todas las funciones creadas (≥20 funciones esperadas)

### Seeds de Ejercicios

- [ ] Módulo 1: 5 ejercicios cargados
- [ ] Módulo 2: 5 ejercicios cargados
- [ ] Módulo 3: 9 ejercicios cargados (ajustar según configuración real)
- [ ] **TODOS los ejercicios con xp_reward = 100**
- [ ] **TODOS los ejercicios con ml_coins_reward = 20**
- [ ] Desviación estándar XP = 0 en los 3 módulos

### Sistema de Rangos

- [ ] 5 rangos Maya cargados (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan)
- [ ] Umbrales correctos (0, 500, 1000, 1500, 2250 XP)
- [ ] Bonos ML Coins correctos (0, 100, 250, 500, 1000)
- [ ] Multiplicadores XP correctos (1.0, 1.10, 1.15, 1.20, 1.25)

### Usuarios de Prueba

- [ ] Usuario student cargado
- [ ] Usuario teacher cargado
- [ ] Usuario admin cargado (si aplicable)
- [ ] Stats inicializados para todos (current_rank = 'Ajaw', total_xp = 0)

---

## 🐛 TROUBLESHOOTING

### Error: "DROP DATABASE cannot be executed from a function"

**Causa:** Script intentó eliminar DB mientras hay conexiones activas.

**Solución:**
```bash
# Cerrar todas las conexiones
psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'gamilit_platform' AND pid <> pg_backend_pid();
"

# Intentar de nuevo
./drop-and-recreate-database.sh
```

---

### Error: "database does not exist"

**Causa:** Primera ejecución, DB no existe todavía.

**Solución:** Es esperado. El script creará la DB automáticamente.

---

### Error: Valores XP siguen siendo 15-20 después de recrear

**Causa:** Seeds NO fueron actualizados correctamente en git, o se está usando rama incorrecta.

**Solución:**
```bash
# 1. Verificar rama actual
git branch --show-current

# 2. Verificar valores en seeds (deben ser 100)
grep -n "xp_reward, ml_coins_reward" apps/database/seeds/dev/educational_content/03-exercises-module2.sql

# 3. Si valores son incorrectos, verificar commits recientes
git log --oneline --all --grep="seed\|xp\|reward" -10

# 4. Si necesario, cambiar a rama con seeds corregidos
git checkout <rama-correcta>
```

---

### Warning: "Seeds tardando más de 5 minutos"

**Causa:** Volumen grande de seeds o DB lenta.

**Solución:** Es normal. Esperar hasta que complete. Monitorear logs:
```bash
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 📊 IMPACTO ESPERADO

### Antes de Carga Limpia (BD desactualizada)

```
Módulo 2 - Ejercicios:
  2.1: 100 XP ✅
  2.2:  20 XP ❌ (outlier)
  2.3: 100 XP ✅
  2.4:  15 XP ❌ (outlier)
  2.5: 100 XP ✅
  Total: 335 XP
  Desviación: σ = 41.5 XP (CV = 62%)

Usuario completa Módulo 2:
  → 335 XP acumulados
  → NO alcanza Nacom (requiere 500 XP)
  → Percepción: "Sistema no funciona"
```

### Después de Carga Limpia (BD actualizada)

```
Módulo 2 - Ejercicios:
  2.1: 100 XP ✅
  2.2: 100 XP ✅ (corregido)
  2.3: 100 XP ✅
  2.4: 100 XP ✅ (corregido)
  2.5: 100 XP ✅
  Total: 500 XP
  Desviación: σ = 0 XP (CV = 0%)

Usuario completa Módulo 2:
  → 500 XP acumulados
  → Alcanza Nacom automáticamente ✅
  → Percepción: "Todo funciona perfecto"
```

---

## 📚 REFERENCIAS

**Documentación:**
- `docs/97-adr/ADR-017-estandarizacion-recompensas-xp-ejercicios.md`
- `orchestration/agentes/architecture-analyst/analisis-progreso-ejercicios-modulos-2025-11-24/REPORTE-ANALISIS-INCONSISTENCIAS-XP-RECOMPENSAS.md`

**Seeds Validados:**
- `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
- `apps/database/seeds/dev/educational_content/03-exercises-module2.sql`
- `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

**Script Principal:**
- `apps/database/drop-and-recreate-database.sh`

**Política:**
- `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md` (buscar si existe)

---

## ✅ RESUMEN

**Estado de Seeds:** ✅ Corregidos y validados
**Método Requerido:** ✅ Carga limpia (NO migrations)
**Comando Principal:** `./drop-and-recreate-database.sh`
**Duración Estimada:** 2-5 minutos
**Riesgo:** BAJO (proyecto en desarrollo)
**Backup Requerido:** Opcional (datos de testing no críticos)

**Próximo Paso:** Ejecutar `./drop-and-recreate-database.sh` y validar con queries proporcionadas.

---

**Elaborado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0 (Corregida - Política de Carga Limpia)
