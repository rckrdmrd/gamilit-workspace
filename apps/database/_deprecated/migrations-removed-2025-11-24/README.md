# Migrations Deprecated - 2025-11-24

**Fecha de deprecación:** 2025-11-24
**Razón:** Bug fix implementado en DDL (Política de Carga Limpia)
**Estado:** ✅ Problema resuelto permanentemente

---

## 📋 Contexto Histórico

### Problema Original

**Fecha descubrimiento:** 2025-11-24
**Reportado por:** Usuario
**Síntoma:** "Cuando se realiza una corrección en los módulos la gamificación presenta errores"

**Causa raíz identificada:**
El trigger `gamilit.initialize_user_stats()` estaba **incompleto**. Al crear un usuario nuevo, solo inicializaba 3 de 4 tablas necesarias:

- ✅ `gamification_system.user_stats`
- ✅ `gamification_system.comodines_inventory`
- ✅ `gamification_system.user_ranks`
- ❌ `progress_tracking.module_progress` ← **FALTABA**

**Impacto:**
- Usuarios nuevos no podían ver módulos disponibles
- Dashboard mostraba "No modules available"
- Gamificación rota desde el registro
- 100% tasa de error en onboarding

---

## 🔧 Solución Implementada

### Corrección Permanente en DDL

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

**Cambio:** Agregada inicialización de `module_progress` en el trigger (líneas 60-82)

```sql
-- BUG FIX #1: Initialize module progress for all active modules
INSERT INTO progress_tracking.module_progress (
    user_id, module_id, status, progress_percentage, ...
)
SELECT NEW.id, m.id, 'not_started', 0, ...
FROM educational_content.modules m
WHERE m.is_published = true AND m.status = 'published'
ON CONFLICT (user_id, module_id) DO NOTHING;
```

**Resultado:**
- ✅ Trigger ahora crea las 4 tablas automáticamente
- ✅ Usuarios nuevos ven 5 módulos inmediatamente
- ✅ 0% tasa de error en registro
- ✅ Cumple con Política de Carga Limpia (fix en DDL, no en migrations)

---

## 📁 Archivos en Esta Carpeta

### 1. `2025-11-24-backfill-module-progress.sql`

**Propósito:** Crear `module_progress` para usuarios existentes (creados antes del 2025-11-24)

**Cuándo usarlo:**

#### ✅ SÍ ejecutar en:

1. **Bases de datos de producción existentes:**
   - Si tienes usuarios registrados **antes del 2025-11-24**
   - Estos usuarios no tienen `module_progress` porque el trigger estaba incompleto

2. **Restauración de backups antiguos:**
   - Si restauras un backup de antes del 2025-11-24
   - El backup no incluye el fix del trigger

#### ❌ NO ejecutar en:

1. **Cargas limpias (fresh installs):**
   - El script `create-database.sh` ya crea todo correctamente
   - El trigger funcionará automáticamente
   - Ejecutar esto sería redundante (aunque seguro por `ON CONFLICT DO NOTHING`)

2. **Ambientes de desarrollo recreados:**
   - Si ejecutas `./drop-and-recreate-database.sh`, NO necesitas este script
   - El DDL corregido ya está en el código

**Cómo ejecutar:**

```bash
# Solo para BD existentes con usuarios pre-2025-11-24
export DATABASE_URL="postgresql://user:pass@host:port/database"
psql "$DATABASE_URL" -f _deprecated/migrations-removed-2025-11-24/2025-11-24-backfill-module-progress.sql
```

**Seguridad:**
- ✅ Idempotente: Usa `ON CONFLICT DO NOTHING`
- ✅ Seguro ejecutar múltiples veces
- ✅ No modifica registros existentes
- ✅ Solo crea registros faltantes

**Output esperado:**
```
Migration: Backfill module_progress
Total usuarios: N
Usuarios sin module_progress: M
Registros creados: M × 5
✅ SUCCESS: All users now have module_progress records!
```

---

### 2. `2025-11-24-test-initialize-user-stats.sql`

**Propósito:** Validar que el trigger `initialize_user_stats()` funciona correctamente

**Cuándo usarlo:**

#### ✅ SÍ ejecutar:

1. **Después de aplicar corrección en producción:**
   - Para validar que el trigger funciona
   - Para confirmar que no hay usuarios sin módulos

2. **En CI/CD:**
   - Como test de integración
   - Valida que el trigger no se rompa en futuros cambios

3. **Debugging:**
   - Si sospechas que el trigger no funciona
   - Para diagnosticar problemas de inicialización

**Cómo ejecutar:**

```bash
psql "$DATABASE_URL" -f _deprecated/migrations-removed-2025-11-24/2025-11-24-test-initialize-user-stats.sql
```

**Tests incluidos:**

1. ✅ TEST 1: Verificar `user_stats` creation
2. ✅ TEST 2: Verificar `user_ranks` creation (Bug Fix #2)
3. ✅ TEST 3: Verificar `module_progress` creation (Bug Fix #1 - CRITICAL)
4. ✅ TEST 4: Verificar `comodines_inventory` creation

**Output esperado:**
```
TEST SUITE: initialize_user_stats() Bug Fixes
✓ PASS: Found N user_stats records
✓ PASS: Found N user_ranks records
✓ PASS: Found N module_progress records
✓ PASS: Found N comodines_inventory records
RESULT: ✓ ALL TESTS PASSED
```

---

## 🎯 Casos de Uso

### Caso 1: Despliegue a Producción (Primera Vez)

**Situación:** Tienes una BD de producción con usuarios registrados antes del fix.

**Pasos:**

```bash
# 1. Backup completo
pg_dump -d gamilit_production > backup-pre-fix-$(date +%Y%m%d).sql

# 2. Aplicar función corregida (DDL)
psql -d gamilit_production -f apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql

# 3. Ejecutar backfill para usuarios existentes
psql -d gamilit_production -f _deprecated/migrations-removed-2025-11-24/2025-11-24-backfill-module-progress.sql

# 4. Validar que funciona
psql -d gamilit_production -f _deprecated/migrations-removed-2025-11-24/2025-11-24-test-initialize-user-stats.sql

# 5. Crear usuario test y verificar trigger
psql -d gamilit_production -c "
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', crypt('password', gen_salt('bf')), NOW())
RETURNING id;
-- Usar el ID retornado para crear profile y verificar
"
```

---

### Caso 2: Restauración de Backup Antiguo

**Situación:** Necesitas restaurar un backup de antes del 2025-11-24.

**Pasos:**

```bash
# 1. Restaurar backup
psql -d gamilit_restored < backup-old.sql

# 2. Aplicar DDL actualizado (sobrescribe trigger viejo)
psql -d gamilit_restored -f apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql

# 3. Backfill usuarios del backup (no tienen module_progress)
psql -d gamilit_restored -f _deprecated/migrations-removed-2025-11-24/2025-11-24-backfill-module-progress.sql

# 4. Validar
psql -d gamilit_restored -f _deprecated/migrations-removed-2025-11-24/2025-11-24-test-initialize-user-stats.sql
```

---

### Caso 3: Carga Limpia (Fresh Install)

**Situación:** Instalación nueva o recreación completa de BD.

**Pasos:**

```bash
# 1. Ejecutar script de creación normal
cd apps/database
./drop-and-recreate-database.sh

# 2. ✅ LISTO - No necesitas ejecutar NADA de _deprecated/
# El trigger corregido ya está en el DDL
# Los usuarios se crearán correctamente automáticamente
```

**Nota:** El script `create-database.sh` ahora carga módulos ANTES de profiles (desde 2025-11-24), lo que hace que el trigger funcione perfectamente.

---

## 📊 Verificación Manual

Si quieres verificar manualmente que usuarios tienen `module_progress`:

```sql
-- Ver estado de inicialización de usuarios
SELECT
    p.email,
    p.role,
    COUNT(DISTINCT us.id) as user_stats,
    COUNT(DISTINCT ur.id) as user_ranks,
    COUNT(DISTINCT ci.id) as comodines,
    COUNT(DISTINCT mp.id) as modules,
    (SELECT COUNT(*) FROM educational_content.modules
     WHERE is_published = true AND status = 'published') as expected_modules
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.user_id
LEFT JOIN gamification_system.comodines_inventory ci ON ci.user_id = p.id
LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND p.deleted_at IS NULL
GROUP BY p.id, p.email, p.role
ORDER BY p.email;
```

**Resultado esperado:**
```
email              | role | user_stats | user_ranks | comodines | modules | expected
-------------------|------|------------|------------|-----------|---------|----------
admin@test.com     | sa   | 1          | 1          | 1         | 5       | 5 ✅
student@test.com   | st   | 1          | 1          | 1         | 5       | 5 ✅
teacher@test.com   | at   | 1          | 1          | 1         | 5       | 5 ✅
```

Si algún usuario tiene `modules < expected`, ejecuta el backfill.

---

## 📚 Referencias

### Documentación Relacionada

- **ADR-012:** `docs/90-adr/ADR-012-automatic-user-initialization-trigger.md`
- **CHANGELOG:** `apps/database/docs/database/CHANGELOG.md` (v2.5.2)
- **Functions README:** `apps/database/ddl/schemas/gamilit/functions/README.md`
- **Reporte completo:** `orchestration/reportes/REPORTE-VALIDACION-COMPLETA-USER-INITIALIZATION-2025-11-24.md`

### Análisis Original

- **Carpeta:** `orchestration/agentes/architecture-analyst/user-initialization-bug-fix-2025-11-24/`
- **Resumen:** `RESUMEN-FINAL-CORRECCION.md`
- **Validación:** Ejecutada por Database-Agent, Backend-Agent, Frontend-Agent

### Bugs Corregidos

1. **BUG #1 (CRÍTICO):** `module_progress` nunca se creaba
2. **BUG #2 (MEDIO):** `user_ranks` sin protección contra duplicados
3. **BUG #3 (CRÍTICO):** FK reference incorrecta (profiles.id vs auth.users.id)
4. **BUG #4 (BAJO):** Referencia a columna `deleted_at` inexistente
5. **BUG #5 (CRÍTICO):** Migration con FK incorrecta

---

## ⚠️ Importante

**Estos scripts están DEPRECADOS pero NO ELIMINADOS por:**

1. **Historial:** Documentan el problema y la solución
2. **Backfill:** Útiles para BD de producción existentes
3. **Testing:** Script de validación reutilizable
4. **Auditoría:** Trazabilidad de cambios críticos

**El fix permanente está en:**
- `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql` (líneas 60-82)

**Política de Carga Limpia:**
- ✅ DDL es la fuente de verdad
- ✅ Migrations solo para BD existentes
- ✅ Scripts deprecados NO se ejecutan en carga limpia

---

## 🔗 Enlaces Rápidos

**Para aprender más:**
- [Política de Carga Limpia](../../orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md)
- [Sistema de Rangos Maya](../../docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md)
- [Arquitectura Database](../../docs/06-database/README.md)

**Para ejecutar:**
```bash
# Backfill (solo si necesario)
psql "$DATABASE_URL" -f _deprecated/migrations-removed-2025-11-24/2025-11-24-backfill-module-progress.sql

# Test (siempre seguro)
psql "$DATABASE_URL" -f _deprecated/migrations-removed-2025-11-24/2025-11-24-test-initialize-user-stats.sql
```

---

**Última actualización:** 2025-11-24
**Mantenido por:** Database-Agent, Architecture-Analyst
**Estado:** ✅ RESOLVED - Fix permanente en DDL
