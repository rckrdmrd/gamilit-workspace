# README - Inicialización de Misiones para Usuarios

**Fecha:** 2025-11-24
**Autor:** Database-Agent

---

## 📚 ÍNDICE

1. [Descripción General](#descripción-general)
2. [Scripts Disponibles](#scripts-disponibles)
3. [Uso y Ejecución](#uso-y-ejecución)
4. [Verificación](#verificación)
5. [Troubleshooting](#troubleshooting)

---

## 📖 DESCRIPCIÓN GENERAL

Este directorio contiene scripts SQL para inicializar misiones en el sistema de gamificación de GAMILIT.

### Scripts Incluidos

| Script | Propósito | Usuarios Objetivo |
|--------|-----------|-------------------|
| `10-missions-init.sql` | Inicialización para usuarios de test | @gamilit.com |
| `11-missions-production-users.sql` | Inicialización para usuarios de producción | Todos excepto @gamilit.com |

### Misiones Creadas (8 por usuario)

Cada usuario recibe:
- **3 misiones diarias:** Complete exercises, Earn XP, Use comodín
- **5 misiones semanales:** Complete module, Daily streak, Perfect scores, Explorer, Master learner

---

## 📁 SCRIPTS DISPONIBLES

### 1. `10-missions-init.sql` (Usuarios de Test)

**Propósito:** Inicializa misiones para usuarios de prueba con email @gamilit.com

**Usuarios afectados:**
- student@gamilit.com
- teacher@gamilit.com
- admin@gamilit.com

**Ejecución:**
```bash
cd apps/database
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f seeds/prod/gamification_system/10-missions-init.sql
```

### 2. `11-missions-production-users.sql` (Usuarios de Producción)

**Propósito:** Inicializa misiones para usuarios de producción (backup) que NO tienen misiones

**Características:**
- ✅ Idempotente (puede ejecutarse múltiples veces)
- ✅ Solo afecta usuarios sin misiones
- ✅ Excluye usuarios @gamilit.com
- ✅ Incluye verificación post-ejecución

**Ejecución:**
```bash
cd apps/database
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f seeds/prod/gamification_system/11-missions-production-users.sql
```

**Salida esperada (primera ejecución):**
```
========================================
INICIALIZANDO MISIONES PARA USUARIOS DE PRODUCCIÓN
========================================

📊 Usuarios sin misiones encontrados: 13

🔄 Procesando usuario 1/13: Jose Aguirre (student)
   ✅ 8 misiones creadas (3 diarias + 5 semanales)
...

========================================
PROCESO COMPLETADO
========================================
Usuarios procesados:    13
Misiones creadas:       104
Promedio por usuario:   8.0
========================================
```

**Salida esperada (segunda ejecución - idempotencia):**
```
📊 Usuarios sin misiones encontrados: 0

✅ Todos los usuarios de producción ya tienen misiones
   (usuarios de test @gamilit.com se excluyen automáticamente)
```

---

## 🔍 VERIFICACIÓN

### Script de Verificación Automática

Se incluye un script bash para verificar el estado de las misiones:

```bash
cd apps/database
./scripts/verify-missions-status.sh
```

**Output esperado:**
```
========================================
VERIFICACIÓN DE MISIONES - GAMILIT
========================================

1. RESUMEN GENERAL
-------------------------------------------
 total_missions | unique_users | daily_missions | weekly_missions
----------------+--------------+----------------+-----------------
            128 |           16 |             48 |              80

2. USUARIOS CON Y SIN MISIONES
-------------------------------------------
    user_type     | total_users | with_missions | without_missions
------------------+-------------+---------------+------------------
 Production Users |          13 |            13 |                0
 Test Users       |           3 |             3 |                0

3. DISTRIBUCIÓN DE MISIONES POR USUARIO
-------------------------------------------
(Lista de todos los usuarios con estado ✅ OK (8))

4. MISIONES POR TEMPLATE
-------------------------------------------
(8 templates, todas con estado ✅ No duplicadas)

5. USUARIOS SIN MISIONES
-------------------------------------------
(0 rows) ← Todos tienen misiones
```

### Verificación Manual con SQL

#### Ver total de misiones
```sql
SELECT
    COUNT(*) as total_missions,
    COUNT(DISTINCT user_id) as unique_users
FROM gamification_system.missions;
```

#### Ver misiones por usuario
```sql
SELECT
    p.email,
    COUNT(m.id) as mission_count
FROM auth_management.profiles p
LEFT JOIN gamification_system.missions m ON p.id = m.user_id
GROUP BY p.email
ORDER BY p.email;
```

#### Identificar usuarios sin misiones
```sql
SELECT
    p.email,
    p.role
FROM auth_management.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
);
```

---

## 🚀 USO Y EJECUCIÓN

### Caso 1: Inicialización Completa (Primera Vez)

Si acabas de crear la base de datos y necesitas inicializar misiones para todos:

```bash
cd apps/database

# 1. Inicializar misiones para usuarios de test
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f seeds/prod/gamification_system/10-missions-init.sql

# 2. Inicializar misiones para usuarios de producción
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f seeds/prod/gamification_system/11-missions-production-users.sql

# 3. Verificar
./scripts/verify-missions-status.sh
```

### Caso 2: Nuevo Usuario de Producción

Si se crea un nuevo usuario de producción y necesita misiones:

```bash
cd apps/database

# Ejecutar script de producción (es idempotente)
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f seeds/prod/gamification_system/11-missions-production-users.sql

# Verificar
./scripts/verify-missions-status.sh
```

### Caso 3: Verificación Rápida

Para verificar el estado actual sin modificar nada:

```bash
cd apps/database
./scripts/verify-missions-status.sh
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Usuarios sin misiones encontrados: 0" pero algunos usuarios no tienen

**Causa:** El usuario tiene email @gamilit.com (se excluye automáticamente)

**Solución:** Usar script `10-missions-init.sql` para usuarios de test

### Problema: Usuario tiene más de 8 misiones

**Causa:** Script ejecutado múltiples veces antes de implementar idempotencia

**Solución:** Limpiar duplicados manualmente
```sql
-- Ver duplicados
SELECT user_id, COUNT(*) as missions
FROM gamification_system.missions
GROUP BY user_id
HAVING COUNT(*) > 8;

-- Eliminar duplicados (CUIDADO: Revisar antes de ejecutar)
DELETE FROM gamification_system.missions
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, template_id ORDER BY created_at DESC) as rn
        FROM gamification_system.missions
    ) t
    WHERE rn > 1
);
```

### Problema: Error de conexión a PostgreSQL

**Causa:** Credenciales incorrectas o servidor no disponible

**Solución:**
1. Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
2. Verificar credenciales en `database-credentials-dev.txt`
3. Probar conexión: `psql -U gamilit_user -d gamilit_platform -h localhost`

### Problema: "Table gamification_system.missions does not exist"

**Causa:** Schema de gamificación no creado

**Solución:**
```bash
cd apps/database
./create-database.sh  # Recrea la base de datos completa
```

---

## 📊 MÉTRICAS ESPERADAS

### Base de Datos Completa (16 usuarios)

- **Total misiones:** 128 (16 usuarios × 8 misiones)
- **Misiones diarias:** 48 (16 usuarios × 3 misiones)
- **Misiones semanales:** 80 (16 usuarios × 5 misiones)
- **Usuarios de test:** 3 (con 24 misiones totales)
- **Usuarios de producción:** 13 (con 104 misiones totales)

### Por Usuario

Cada usuario debe tener:
- **3 misiones diarias**
  - daily_complete_exercises
  - daily_earn_xp
  - daily_use_comodin
- **5 misiones semanales**
  - weekly_complete_module
  - weekly_daily_streak
  - weekly_perfect_scores
  - weekly_explorer
  - weekly_master_learner

---

## 📝 NOTAS IMPORTANTES

### Idempotencia

- ✅ El script `11-missions-production-users.sql` es idempotente
- ✅ Puede ejecutarse múltiples veces sin crear duplicados
- ✅ Solo procesa usuarios que NO tienen misiones

### Exclusiones

- ❌ Usuarios con email `%@gamilit.com` se excluyen automáticamente
- ✅ Son manejados por el script `10-missions-init.sql`

### Fechas de Misiones

- **Diarias:** Desde hoy hasta fin del día (23:59)
- **Semanales:** Desde hoy hasta +7 días

### Automación Futura

**Recomendación:** Implementar trigger automático para nuevos usuarios

```sql
CREATE OR REPLACE FUNCTION gamification_system.initialize_user_missions()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar misiones automáticamente para nuevos usuarios
    -- (Implementación pendiente)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_initialize_user_missions
AFTER INSERT ON auth_management.profiles
FOR EACH ROW
EXECUTE FUNCTION gamification_system.initialize_user_missions();
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

### Archivos de Referencia

- `REPORTE-VALIDACION-MISIONES-PRODUCCION.md` - Reporte detallado de validación
- `../../scripts/verify-missions-status.sh` - Script de verificación
- `10-missions-init.sql` - Script para usuarios de test
- `11-missions-production-users.sql` - Script para usuarios de producción

### Enlaces Útiles

- Tabla de misiones: `apps/database/ddl/schemas/gamification_system/tables/06-missions.sql`
- Tabla de profiles: `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`

---

**Última actualización:** 2025-11-24
**Mantenido por:** Database-Agent
