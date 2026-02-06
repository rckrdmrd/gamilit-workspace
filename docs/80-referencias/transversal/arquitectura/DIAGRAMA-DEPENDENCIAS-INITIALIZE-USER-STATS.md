# Diagrama de Dependencias: initialize_user_stats()

**Última actualización:** 2025-11-24
**Relacionado con:** ADR-012, GAP-003 Bug Fix
**Propósito:** Documentar todas las dependencias, FK references y relaciones de la función de inicialización

---

## 📋 Descripción General

La función `gamilit.initialize_user_stats()` tiene dependencias con múltiples tablas y esquemas. Este documento mapea exhaustivamente todas estas relaciones para facilitar el mantenimiento y prevenir errores futuros.

---

## 🔄 Diagrama de Dependencias Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISPARADO POR                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │ auth_management.profiles (INSERT)    │
        │                                      │
        │ Trigger: trg_initialize_user_stats   │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ gamilit.initialize_user_stats()      │
        │                                      │
        │ Función de inicialización            │
        └──────────────────┬───────────────────┘
                           │
                           │
        ┌──────────────────┴───────────────────┐
        │                                      │
        │ LEE DE (SELECT):                     │
        │                                      │
        │ educational_content.modules          │
        │   WHERE is_published = true          │
        │     AND status = 'published'         │
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           │
        ┌──────────────────┴───────────────────┐
        │                                      │
        │ INSERTA EN (4 tablas):               │
        │                                      │
        ├──────────────────────────────────────┤
        │                                      │
        │ 1. gamification_system.user_stats    │
        │    FK: user_id → auth.users.id       │
        │                                      │
        ├──────────────────────────────────────┤
        │                                      │
        │ 2. gamification_system.              │
        │    comodines_inventory               │
        │    FK: user_id → profiles.id         │
        │                                      │
        ├──────────────────────────────────────┤
        │                                      │
        │ 3. gamification_system.user_ranks    │
        │    FK: user_id → auth.users.id       │
        │                                      │
        ├──────────────────────────────────────┤
        │                                      │
        │ 4. progress_tracking.module_progress │
        │    FK1: user_id → profiles.id        │
        │    FK2: module_id → modules.id       │
        │                                      │
        └──────────────────────────────────────┘
```

---

## 🗃️ Tablas Involucradas

### Tabla 1: auth.users (sistema)

**Rol:** Proveedor de user_id para tablas de gamificación

**Schema:** `auth` (sistema auth)

**Columnas relevantes:**
- `id` (uuid, PK) - UUID del usuario de autenticación estándar

**Usado por:**
- `gamification_system.user_stats.user_id` (FK)
- `gamification_system.user_ranks.user_id` (FK)
- `auth_management.profiles.user_id` (FK)

**Relación con initialize_user_stats:**
- ✅ Referenciado indirectamente vía `NEW.user_id` en trigger
- ✅ Usado para user_stats y user_ranks

---

### Tabla 2: auth_management.profiles

**Rol:** Tabla que dispara el trigger de inicialización

**Schema:** `auth_management`

**Archivo DDL:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`

**Columnas relevantes:**
- `id` (uuid, PK) - ID del perfil
- `user_id` (uuid, FK) → auth.users.id
- `email` (text, UNIQUE)
- `role` (gamilit_role)

**Trigger configurado:**
```sql
CREATE TRIGGER trg_initialize_user_stats
  AFTER INSERT ON auth_management.profiles
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.initialize_user_stats();
```

**Variables disponibles en trigger:**
- `NEW.id` → profiles.id (usado para module_progress, comodines_inventory)
- `NEW.user_id` → auth.users.id (usado para user_stats, user_ranks)

**Relación con initialize_user_stats:**
- ✅ Dispara el trigger en INSERT
- ✅ Provee NEW.id y NEW.user_id

---

### Tabla 3: educational_content.modules

**Rol:** Proveedor de módulos disponibles para inicialización

**Schema:** `educational_content`

**Archivo DDL:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`

**Columnas relevantes:**
- `id` (uuid, PK) - ID del módulo
- `is_published` (boolean)
- `status` (module_status ENUM)

**Query ejecutada por initialize_user_stats:**
```sql
SELECT m.id
FROM educational_content.modules m
WHERE m.is_published = true
  AND m.status = 'published';
```

**Resultado típico:** 5 módulos (M1-M5)

**Relación con initialize_user_stats:**
- ✅ Se lee para obtener lista de módulos disponibles
- ✅ No se modifica (solo SELECT)

---

### Tabla 4: gamification_system.user_stats

**Rol:** Almacenar estadísticas de gamificación del usuario

**Schema:** `gamification_system`

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`

**Columnas relevantes:**
- `user_id` (uuid, PK, FK) → auth.users.id
- `total_xp` (bigint)
- `level` (integer)
- `ml_coins` (integer)
- `current_streak` (integer)

**FK Constraint:**
```sql
CONSTRAINT user_stats_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE
```

**Índices:**
- `user_stats_pkey` (PK en user_id)
- `idx_user_stats_user_id` (índice en user_id)

**INSERT ejecutado:**
```sql
INSERT INTO gamification_system.user_stats (
  user_id, total_xp, level, ml_coins, current_streak
)
VALUES (NEW.user_id, 0, 1, 100, 0)
ON CONFLICT (user_id) DO NOTHING;
```

**Estrategia de conflicto:** ON CONFLICT DO NOTHING (idempotente)

**Relación con initialize_user_stats:**
- ✅ Se inserta un registro
- ✅ FK apunta a auth.users.id (no profiles.id)

---

### Tabla 5: gamification_system.comodines_inventory

**Rol:** Almacenar inventario de comodines del usuario

**Schema:** `gamification_system`

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql`

**Columnas relevantes:**
- `user_id` (uuid, PK, FK) → auth_management.profiles.id
- `total_comodines_earned` (integer)
- `total_comodines_used` (integer)

**FK Constraint:**
```sql
CONSTRAINT comodines_inventory_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth_management.profiles(id)
  ON DELETE CASCADE
```

**Índices:**
- `comodines_inventory_pkey` (PK en user_id)

**INSERT ejecutado:**
```sql
INSERT INTO gamification_system.comodines_inventory (
  user_id, total_comodines_earned, total_comodines_used
)
VALUES (NEW.id, 0, 0)
ON CONFLICT (user_id) DO NOTHING;
```

**Estrategia de conflicto:** ON CONFLICT DO NOTHING (idempotente)

**Relación con initialize_user_stats:**
- ✅ Se inserta un registro
- ✅ FK apunta a profiles.id (no auth.users.id)

---

### Tabla 6: gamification_system.user_ranks

**Rol:** Almacenar rango Maya del usuario

**Schema:** `gamification_system`

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql`

**Columnas relevantes:**
- `user_id` (uuid, PK, FK) → auth.users.id
- `current_rank` (maya_rank ENUM)
- `rank_progress` (integer)

**FK Constraint:**
```sql
CONSTRAINT user_ranks_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE
```

**Índices:**
- `user_ranks_pkey` (PK en user_id)

**⚠️ Nota importante:** Esta tabla NO tiene constraint UNIQUE en user_id, por lo que no se puede usar `ON CONFLICT`. Se usa `WHERE NOT EXISTS` en su lugar.

**INSERT ejecutado:**
```sql
INSERT INTO gamification_system.user_ranks (
  user_id, current_rank, rank_progress
)
SELECT NEW.user_id, 'Ajaw'::gamification_system.maya_rank, 0
WHERE NOT EXISTS (
  SELECT 1 FROM gamification_system.user_ranks
  WHERE user_id = NEW.user_id
);
```

**Estrategia de conflicto:** WHERE NOT EXISTS (previene duplicados)

**Relación con initialize_user_stats:**
- ✅ Se inserta un registro
- ✅ FK apunta a auth.users.id (no profiles.id)

---

### Tabla 7: progress_tracking.module_progress

**Rol:** Almacenar progreso del usuario en cada módulo

**Schema:** `progress_tracking`

**Archivo DDL:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

**Columnas relevantes:**
- `user_id` (uuid, FK) → auth_management.profiles.id
- `module_id` (uuid, FK) → educational_content.modules.id
- `status` (progress_status ENUM)
- `progress_percentage` (numeric)

**FK Constraints:**
```sql
-- FK 1: Usuario
CONSTRAINT module_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth_management.profiles(id)
  ON DELETE CASCADE

-- FK 2: Módulo
CONSTRAINT module_progress_module_id_fkey
  FOREIGN KEY (module_id)
  REFERENCES educational_content.modules(id)
  ON DELETE CASCADE
```

**Índices:**
- `module_progress_pkey` (PK compuesto en user_id, module_id)
- `idx_module_progress_user_id` (índice en user_id)
- `idx_module_progress_module_id` (índice en module_id)

**INSERT ejecutado:**
```sql
INSERT INTO progress_tracking.module_progress (
  user_id, module_id, status, progress_percentage
)
SELECT
  NEW.id,  -- profiles.id
  m.id,    -- modules.id
  'not_started'::progress_tracking.progress_status,
  0
FROM educational_content.modules m
WHERE m.is_published = true
  AND m.status = 'published'
ON CONFLICT (user_id, module_id) DO NOTHING;
```

**Estrategia de conflicto:** ON CONFLICT DO NOTHING (idempotente)

**Registros típicos creados:** 5 (uno por cada módulo publicado)

**Relación con initialize_user_stats:**
- ✅ Se insertan múltiples registros (1 por módulo)
- ✅ FK user_id apunta a profiles.id (no auth.users.id)
- ✅ FK module_id apunta a modules.id

---

## 🔑 Mapa de Foreign Keys

### Resumen de FK References

```
auth.users.id
     ↓ (FK)
auth_management.profiles.user_id
     ↓
     ├─ [NEW.user_id en trigger]
     │       ↓ (usado para)
     │       ├─ gamification_system.user_stats.user_id
     │       └─ gamification_system.user_ranks.user_id
     │
     └─ [NEW.id en trigger] (profiles.id)
             ↓ (usado para)
             ├─ gamification_system.comodines_inventory.user_id
             └─ progress_tracking.module_progress.user_id

educational_content.modules.id
     ↓ (FK)
progress_tracking.module_progress.module_id
```

### Regla Mnemotécnica

**Para recordar qué usar (NEW.id vs NEW.user_id):**

```
Tablas de GAMIFICACIÓN → NEW.user_id (auth.users.id)
├─ user_stats
└─ user_ranks

Tablas de PROGRESS/INVENTORY → NEW.id (profiles.id)
├─ module_progress
└─ comodines_inventory
```

**Razón histórica:**
- `gamification_system` fue diseñado primero, referencia auth.users directamente
- `progress_tracking` fue diseñado después, referencia profiles (más limpio)

---

## 📊 Matriz de Dependencias

| Tabla Destino | Schema | FK Column | Referencia | Valor en Trigger | Constraint |
|---------------|--------|-----------|------------|------------------|------------|
| user_stats | gamification_system | user_id | auth.users.id | NEW.user_id | ON CONFLICT |
| comodines_inventory | gamification_system | user_id | profiles.id | NEW.id | ON CONFLICT |
| user_ranks | gamification_system | user_id | auth.users.id | NEW.user_id | WHERE NOT EXISTS |
| module_progress | progress_tracking | user_id | profiles.id | NEW.id | ON CONFLICT |
| module_progress | progress_tracking | module_id | modules.id | m.id (SELECT) | ON CONFLICT |

---

## 🔍 Casos Críticos a Considerar

### Caso 1: Cambiar FK de module_progress

**Escenario hipotético:** Migrar module_progress.user_id de profiles.id a auth.users.id

**Impacto:**
```sql
-- ANTES (actual):
INSERT INTO module_progress (user_id, ...)
VALUES (NEW.id, ...)  -- profiles.id

-- DESPUÉS (hipotético):
INSERT INTO module_progress (user_id, ...)
VALUES (NEW.user_id, ...)  -- auth.users.id
```

**Cambios requeridos:**
1. ✅ Modificar constraint FK en tabla module_progress
2. ✅ Actualizar función initialize_user_stats (NEW.id → NEW.user_id)
3. ✅ Migración de datos existentes
4. ✅ Actualizar queries en backend (JOIN diferentes)

**Recomendación:** ❌ NO HACER - Mantener consistencia actual

---

### Caso 2: Agregar Nueva Tabla de Inicialización

**Escenario:** Agregar tabla `user_preferences` que debe inicializarse

**Pasos:**
1. Crear tabla `user_management.user_preferences`
2. Decidir FK: ¿profiles.id o auth.users.id?
3. Actualizar `gamilit.initialize_user_stats()`
4. Agregar INSERT con ON CONFLICT
5. Actualizar tests de validación
6. Actualizar esta documentación

**Template de INSERT:**
```sql
-- Si FK apunta a profiles.id:
INSERT INTO user_management.user_preferences (user_id, ...)
VALUES (NEW.id, ...)
ON CONFLICT (user_id) DO NOTHING;

-- Si FK apunta a auth.users.id:
INSERT INTO user_management.user_preferences (user_id, ...)
VALUES (NEW.user_id, ...)
ON CONFLICT (user_id) DO NOTHING;
```

---

### Caso 3: Módulos Dinámicos

**Escenario:** Se publica un nuevo módulo M6 después de que usuarios ya están registrados

**Problema:**
- Usuarios existentes no tienen module_progress para M6
- Trigger solo funciona en nuevos registros

**Soluciones:**

**Opción A: Migration Manual (Recomendada)**
```sql
-- Script: apps/database/migrations/YYYY-MM-DD-add-module-6-progress.sql
INSERT INTO progress_tracking.module_progress (
  user_id, module_id, status, progress_percentage
)
SELECT
  p.id,
  'm6-uuid'::uuid,
  'not_started',
  0
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM progress_tracking.module_progress mp
    WHERE mp.user_id = p.id AND mp.module_id = 'm6-uuid'::uuid
  );
```

**Opción B: Lazy Loading en Backend**
```typescript
// En module.service.ts
async getModuleProgress(userId: string, moduleId: string) {
  let progress = await this.findProgress(userId, moduleId);

  if (!progress) {
    // Crear module_progress si no existe
    progress = await this.createProgress({
      userId,
      moduleId,
      status: 'not_started',
      progressPercentage: 0,
    });
  }

  return progress;
}
```

**Recomendación:** Opción A (migration) para consistencia

---

## 🧪 Testing de Dependencias

### Test 1: Validar Todas las FK

```sql
-- Verificar que todas las FK existen y son correctas
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (
    (tc.table_schema = 'gamification_system' AND tc.table_name IN ('user_stats', 'comodines_inventory', 'user_ranks'))
    OR
    (tc.table_schema = 'progress_tracking' AND tc.table_name = 'module_progress')
  )
ORDER BY tc.table_schema, tc.table_name;
```

**Resultado esperado:** 5 FK constraints listadas

---

### Test 2: Validar Idempotencia del Trigger

```sql
-- Test de idempotencia: Ejecutar trigger múltiples veces
DO $$
DECLARE
  test_profile_id uuid;
  test_user_id uuid;
BEGIN
  -- Crear usuario de prueba
  INSERT INTO auth.users (email, encrypted_password)
  VALUES ('test-idempotence@test.com', 'hashed')
  RETURNING id INTO test_user_id;

  -- Crear perfil (dispara trigger 1ra vez)
  INSERT INTO auth_management.profiles (user_id, email, role)
  VALUES (test_user_id, 'test-idempotence@test.com', 'student')
  RETURNING id INTO test_profile_id;

  -- Intentar insertar duplicados (simular trigger 2da vez)
  -- Todos deben fallar gracefully con ON CONFLICT
  PERFORM gamilit.initialize_user_stats();

  -- Verificar conteo
  ASSERT (SELECT COUNT(*) FROM gamification_system.user_stats WHERE user_id = test_user_id) = 1,
    'Debe haber exactamente 1 user_stats';

  ASSERT (SELECT COUNT(*) FROM gamification_system.user_ranks WHERE user_id = test_user_id) = 1,
    'Debe haber exactamente 1 user_ranks';

  ASSERT (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE user_id = test_profile_id) = 5,
    'Debe haber exactamente 5 module_progress';

  RAISE NOTICE 'Test de idempotencia: OK';
END $$;
```

---

### Test 3: Validar Cascade Deletes

```sql
-- Test de cascade: Eliminar usuario debe eliminar todo
DO $$
DECLARE
  test_profile_id uuid;
  test_user_id uuid;
BEGIN
  -- Crear usuario de prueba
  INSERT INTO auth.users (email, encrypted_password)
  VALUES ('test-cascade@test.com', 'hashed')
  RETURNING id INTO test_user_id;

  INSERT INTO auth_management.profiles (user_id, email, role)
  VALUES (test_user_id, 'test-cascade@test.com', 'student')
  RETURNING id INTO test_profile_id;

  -- Eliminar usuario (debe hacer CASCADE)
  DELETE FROM auth.users WHERE id = test_user_id;

  -- Verificar que todo se eliminó
  ASSERT (SELECT COUNT(*) FROM gamification_system.user_stats WHERE user_id = test_user_id) = 0;
  ASSERT (SELECT COUNT(*) FROM auth_management.profiles WHERE user_id = test_user_id) = 0;
  ASSERT (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE user_id = test_profile_id) = 0;

  RAISE NOTICE 'Test de cascade delete: OK';
END $$;
```

---

## 📚 Referencias

**Documentación relacionada:**
- ADR: `docs/90-adr/ADR-012-automatic-user-initialization-trigger.md`
- Flujo: `docs/90-transversal/FLUJO-INICIALIZACION-USUARIO.md`
- Función: `docs/90-transversal/FUNCIONES-UTILITARIAS-GAMILIT.md`

**Código fuente:**
- Trigger: `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`
- Función: `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

**Tablas DDL:**
- `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`
- `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`
- `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql`
- `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`

---

**FIN DEL DOCUMENTO**

**Última actualización:** 2025-11-24
**Mantenedores:** Architecture-Analyst, Database-Agent
**Revisión necesaria:** Sí, al agregar nuevas tablas de inicialización o modificar FK
