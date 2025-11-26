# QUICK REFERENCE: Activación de initialize_user_missions

**Fecha:** 2025-11-24 | **Status:** ✅ COMPLETADO

---

## 🎯 QUÉ SE HIZO

Se activó la llamada a `initialize_user_missions()` en la función `initialize_user_stats()`.

**Archivo modificado:**
```
apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

---

## 📝 CAMBIO EXACTO

### ANTES (línea 86 - comentada)
```sql
-- PERFORM gamilit.initialize_user_missions(NEW.user_id);  -- TODO: Implementar función
```

### DESPUÉS (líneas 84-85 - activa)
```sql
-- Initialize daily and weekly missions for new users
PERFORM gamilit.initialize_user_missions(NEW.id);
```

---

## ⚠️ PUNTO CRÍTICO

**Se usa `NEW.id` (NO `NEW.user_id`)**

| Campo | Valor | FK Destino |
|-------|-------|------------|
| `NEW.id` ✅ | `profiles.id` | `missions.user_id → profiles(id)` |
| `NEW.user_id` ❌ | `auth.users.id` | INCORRECTO |

---

## 🚀 CÓMO APLICAR

### Método 1: Recrear BD (Recomendado)
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
./drop-and-recreate-database.sh
```

### Método 2: Solo la Función
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
psql -d gamilit_platform -f ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

---

## ✅ VALIDACIÓN RÁPIDA

```sql
-- 1. Crear usuario de prueba
INSERT INTO auth_management.profiles (user_id, tenant_id, role, username, email)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001'::uuid,
    'student',
    'test_missions_' || floor(random() * 1000),
    'test_missions_' || floor(random() * 1000) || '@example.com'
);

-- 2. Verificar misiones creadas (debe retornar 8)
SELECT COUNT(*) as "Misiones creadas"
FROM gamification_system.missions
WHERE user_id = (
    SELECT id FROM auth_management.profiles
    ORDER BY created_at DESC LIMIT 1
);

-- Resultado esperado: 8 misiones (3 diarias + 5 semanales)
```

---

## 📊 RESULTADO ESPERADO

| Tipo | Cantidad | XP Total | ML Coins Total |
|------|----------|----------|----------------|
| Diarias | 3 | 100 | 50 |
| Semanales | 5 | 730 | 365 |
| **TOTAL** | **8** | **830** | **415** |

---

## 🔍 TROUBLESHOOTING

### Error: "relation does not exist"
**Causa:** Base de datos no está actualizada
**Solución:** Ejecutar `./drop-and-recreate-database.sh`

### Error: "function initialize_user_missions does not exist"
**Causa:** Función 18-initialize_user_missions.sql no se cargó
**Solución:**
```bash
psql -d gamilit_platform -f ddl/schemas/gamilit/functions/18-initialize_user_missions.sql
psql -d gamilit_platform -f ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

### No se crean misiones para un usuario
**Verificar:**
1. ¿El rol es `student`, `admin_teacher` o `super_admin`?
2. ¿La función `initialize_user_stats()` está actualizada?
3. ¿El trigger `trg_profiles_after_insert_stats` está activo?

```sql
-- Verificar trigger
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trg_profiles_after_insert_stats';
```

---

## 📁 DOCUMENTACIÓN COMPLETA

- **Reporte detallado:** `apps/database/REPORTE-ACTIVACION-INITIALIZE-USER-MISSIONS-2025-11-24.md`
- **Resumen ejecutivo:** `RESUMEN-EJECUTIVO-ACTIVACION-MISSIONS-2025-11-24.md`
- **Script de validación:** `apps/database/test-initialize-user-stats-update.sql`

---

**Database-Agent | 2025-11-24**
