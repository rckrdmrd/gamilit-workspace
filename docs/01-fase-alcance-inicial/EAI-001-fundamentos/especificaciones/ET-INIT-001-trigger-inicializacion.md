# ET-INIT-001: Especificación Técnica - Trigger de Inicialización de Usuario

**Proyecto:** GAMILIT
**Épica:** EAI-001 - Fundamentos
**Versión:** 1.1
**Fecha de creación:** 2025-11-24
**Última actualización:** 2025-11-24
**Estado:** ✅ Implementado
**Relacionado con:** RF-INIT-001, ADR-012

---

## 📋 Información de la Especificación

| Atributo | Valor |
|----------|-------|
| **ID** | ET-INIT-001 |
| **Tipo** | Especificación Técnica |
| **Categoría** | Base de Datos / Triggers |
| **Requerimiento** | RF-INIT-001 |
| **Epic** | EAI-001 - Fundamentos |
| **Complejidad** | Media-Alta |
| **Impacto** | Crítico |

---

## 🎯 Objetivo Técnico

Especificar la implementación técnica del sistema de inicialización automática de usuarios mediante un **Database Trigger** que se ejecuta al momento de crear un perfil de usuario, inicializando todos los componentes necesarios para gamificación y progreso educativo.

---

## 🏗️ Arquitectura de la Solución

### Diagrama de Componentes

```
┌────────────────┐
│  Backend API   │
│  (NestJS)      │
└───────┬────────┘
        │ POST /auth/register
        │
        ▼
┌────────────────────────────────────────┐
│  Database (PostgreSQL 15+)             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 1. INSERT INTO                    │ │
│  │    auth_management.profiles       │ │
│  └──────────┬───────────────────────┘ │
│             │                          │
│             ▼                          │
│  ┌──────────────────────────────────┐ │
│  │ 2. ⚡ TRIGGER:                   │ │
│  │    trg_initialize_user_stats     │ │
│  │    AFTER INSERT                  │ │
│  │    FOR EACH ROW                  │ │
│  └──────────┬───────────────────────┘ │
│             │                          │
│             ▼                          │
│  ┌──────────────────────────────────┐ │
│  │ 3. FUNCTION:                     │ │
│  │    gamilit.initialize_user_stats()│ │
│  │                                  │ │
│  │    ├─ 3.1 INSERT user_stats     │ │
│  │    ├─ 3.2 INSERT comodines      │ │
│  │    ├─ 3.3 INSERT user_ranks     │ │
│  │    └─ 3.4 INSERT module_progress│ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
apps/database/ddl/
├── schemas/gamilit/functions/
│   └── 04-initialize_user_stats.sql     ← Función principal
│
└── schemas/auth_management/triggers/
    └── 04-trg_initialize_user_stats.sql ← Trigger

docs/
├── 97-adr/
│   └── ADR-012-automatic-user-initialization-trigger.md
│
├── 90-transversal/
│   ├── FLUJO-INICIALIZACION-USUARIO.md
│   ├── DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md
│   └── FUNCIONES-UTILITARIAS-GAMILIT.md
│
└── 01-fase-alcance-inicial/EAI-001-fundamentos/
    ├── requerimientos/
    │   └── RF-INIT-001-inicializacion-automatica-usuario.md
    └── especificaciones/
        └── ET-INIT-001-trigger-inicializacion.md (este archivo)
```

---

## 🔧 Implementación Técnica

### Componente 1: Trigger

**Archivo:** `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`

**Especificación:**

```sql
CREATE TRIGGER trg_initialize_user_stats
    AFTER INSERT ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.initialize_user_stats();
```

**Características:**

| Propiedad | Valor | Razón |
|-----------|-------|-------|
| **Timing** | `AFTER INSERT` | Asegurar que profile existe antes de inicialización |
| **Level** | `FOR EACH ROW` | Inicialización individual por usuario |
| **Event** | `INSERT` únicamente | Solo para nuevos usuarios, no para updates |
| **Schema** | `auth_management` | Trigger vive en el schema del objeto |
| **Table** | `profiles` | Tabla que dispara el evento |
| **Function** | `gamilit.initialize_user_stats()` | Función en schema central gamilit |

**Decisiones de Diseño:**

1. **¿Por qué AFTER y no BEFORE?**
   - AFTER garantiza que el perfil ya está persistido en DB
   - BEFORE podría causar problemas si el INSERT falla
   - AFTER permite que la inicialización sea asíncrona/eventual

2. **¿Por qué en profiles y no en auth.users?**
   - `auth.users` es tabla de Supabase (auth externo)
   - `profiles` es nuestra tabla local con tenant_id
   - Necesitamos tenant_id para multi-tenancy

3. **¿Por qué una función separada y no código inline?**
   - Reusabilidad: Función puede llamarse manualmente para migración
   - Testabilidad: Función puede probarse independientemente
   - Mantenibilidad: Cambios en lógica no requieren DROP/CREATE trigger

---

### Componente 2: Función de Inicialización

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

**Firma:**

```sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
```

**Características:**

| Propiedad | Valor |
|-----------|-------|
| **Return Type** | `trigger` (no devuelve datos, sino NEW/OLD/NULL) |
| **Language** | `plpgsql` |
| **Volatility** | VOLATILE (modifican

 datos) |
| **Security** | SECURITY INVOKER (ejecuta como usuario que dispara) |
| **Cost Estimate** | ~100-500 ms (depende de módulos publicados) |

---

### Implementación de la Función: Paso a Paso

#### Paso 1: Validación de Rol

```sql
IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
    -- Continuar con inicialización
ELSE
    -- Skip, role no tiene gamificación
    RETURN NEW;
END IF;
```

**Propósito:** Filtrar roles que NO participan en gamificación

**Roles incluidos:** `student`, `admin_teacher`, `super_admin`

**Roles excluidos:** Cualquier otro rol futuro (ej: `viewer`, `auditor`)

---

#### Paso 2: Inicializar user_stats

**Tabla:** `gamification_system.user_stats`

**Código:**

```sql
INSERT INTO gamification_system.user_stats (
    user_id,
    tenant_id,
    ml_coins,
    ml_coins_earned_total
) VALUES (
    NEW.user_id,  -- ⚠️ CRITICAL: usar user_id (auth.users.id), NO NEW.id
    NEW.tenant_id,
    100,          -- Monedas de bienvenida
    100
)
ON CONFLICT (user_id) DO NOTHING;  -- Idempotencia
```

**Detalles Técnicos:**

| Campo | Valor | Tipo | Constraint | Razón |
|-------|-------|------|------------|-------|
| `user_id` | `NEW.user_id` | UUID | FK → auth.users.id, PK | Identificador de Supabase |
| `tenant_id` | `NEW.tenant_id` | UUID | FK → tenants.id | Multi-tenancy |
| `ml_coins` | `100` | INTEGER | CHECK >= 0 | Monedas iniciales |
| `ml_coins_earned_total` | `100` | INTEGER | CHECK >= 0 | Historial acumulado |
| `total_xp` | `0` (default) | INTEGER | CHECK >= 0 | Experiencia inicial |
| `level` | `1` (default) | INTEGER | CHECK > 0 | Nivel inicial |

**FK Reference:** ⚠️ **CRÍTICO**

- ✅ `user_id` → `auth.users.id` (tabla de Supabase)
- ❌ **NO** usar `NEW.id` (profiles.id)

**Razón:** Gamificación necesita vincular con user_id de Supabase para autenticación y permisos.

**Estrategia de Idempotencia:**

```sql
ON CONFLICT (user_id) DO NOTHING
```

- Si ya existe user_stats para este user_id → Skip (no error)
- Permite re-ejecutar función sin crear duplicados
- `user_id` tiene UNIQUE constraint

---

#### Paso 3: Inicializar comodines_inventory

**Tabla:** `gamification_system.comodines_inventory`

**Código:**

```sql
INSERT INTO gamification_system.comodines_inventory (
    user_id
) VALUES (
    NEW.id  -- ⚠️ CRITICAL: usar NEW.id (profiles.id), NO NEW.user_id
)
ON CONFLICT (user_id) DO NOTHING;
```

**Detalles Técnicos:**

| Campo | Valor | Tipo | Constraint | Razón |
|-------|-------|------|------------|-------|
| `user_id` | `NEW.id` | UUID | FK → profiles.id, PK | Identificador local con tenant |
| Otros campos | Defaults | INTEGER | - | Cantidades en 0 |

**FK Reference:** ⚠️ **CRÍTICO**

- ✅ `user_id` → `profiles.id` (nuestra tabla local)
- ❌ **NO** usar `NEW.user_id` (auth.users.id)

**Razón:** Inventario necesita contexto de tenant local (profiles tiene tenant_id).

**Comentario en Código:**

```sql
-- IMPORTANT: comodines_inventory.user_id references profiles.id (NOT auth.users.id)
-- CORRECTED: usar NEW.id (profiles.id) porque FK apunta a profiles(id)
```

---

#### Paso 4: Inicializar user_ranks

**Tabla:** `gamification_system.user_ranks`

**Código:**

```sql
INSERT INTO gamification_system.user_ranks (
    user_id,
    tenant_id,
    current_rank
)
SELECT
    NEW.user_id,
    NEW.tenant_id,
    'Ajaw'::gamification_system.maya_rank
WHERE NOT EXISTS (
    SELECT 1 FROM gamification_system.user_ranks WHERE user_id = NEW.user_id
);
```

**Detalles Técnicos:**

| Campo | Valor | Tipo | Constraint | Razón |
|-------|-------|------|------------|-------|
| `user_id` | `NEW.user_id` | UUID | FK → auth.users.id | Identificador Supabase |
| `tenant_id` | `NEW.tenant_id` | UUID | FK → tenants.id | Multi-tenancy |
| `current_rank` | `'Ajaw'` | maya_rank | ENUM | Rango más bajo |

**FK Reference:** ⚠️ **CRÍTICO**

- ✅ `user_id` → `auth.users.id`
- ❌ **NO** usar `NEW.id` (profiles.id)

**Razón:** Igual que user_stats, necesita vincular con auth.users.id

**Estrategia de Idempotencia: WHERE NOT EXISTS**

**BUG FIX #2:** Cambio de `ON CONFLICT` a `WHERE NOT EXISTS`

**Problema anterior:**
```sql
-- ❌ INCORRECTO (antes del fix)
ON CONFLICT (user_id) DO NOTHING
```

**¿Por qué falla?**
- La tabla `user_ranks` NO tiene unique constraint en `user_id`
- `ON CONFLICT` requiere un constraint único
- PostgreSQL rechazaría el DDL

**Solución actual:**
```sql
-- ✅ CORRECTO (después del fix)
WHERE NOT EXISTS (
    SELECT 1 FROM gamification_system.user_ranks WHERE user_id = NEW.user_id
)
```

**Beneficios:**
- Funciona sin unique constraint
- Previene duplicados verificando antes de INSERT
- Idempotente: puede ejecutarse N veces

**Comentario en Código:**

```sql
-- BUG FIX #2: Use WHERE NOT EXISTS instead of ON CONFLICT (no unique constraint on user_id)
```

---

#### Paso 5: Inicializar module_progress (BUG FIX #1 - GAP-003)

**Tabla:** `progress_tracking.module_progress`

**Código:**

```sql
INSERT INTO progress_tracking.module_progress (
    user_id,
    module_id,
    status,
    progress_percentage,
    created_at,
    updated_at
)
SELECT
    NEW.id,  -- ⚠️ CRITICAL: profiles.id, NO NEW.user_id
    m.id,
    'not_started'::progress_tracking.progress_status,
    0,
    NOW(),
    NOW()
FROM educational_content.modules m
WHERE m.is_published = true
  AND m.status = 'published'
ON CONFLICT (user_id, module_id) DO NOTHING;
```

**Detalles Técnicos:**

| Campo | Valor | Tipo | Constraint | Razón |
|-------|-------|------|------------|-------|
| `user_id` | `NEW.id` | UUID | FK → profiles.id, parte de PK | Identificador local |
| `module_id` | `m.id` | UUID | FK → modules.id, parte de PK | Módulo educativo |
| `status` | `'not_started'` | progress_status | ENUM | Estado inicial |
| `progress_percentage` | `0` | INTEGER | CHECK 0-100 | Sin progreso aún |
| `created_at` | `NOW()` | TIMESTAMP | NOT NULL | Timestamp de creación |
| `updated_at` | `NOW()` | TIMESTAMP | NOT NULL | Timestamp actualización |

**FK Reference:** ⚠️ **CRÍTICO**

- ✅ `user_id` → `profiles.id`
- ❌ **NO** usar `NEW.user_id` (auth.users.id)

**Razón:** Igual que comodines, necesita contexto de tenant local.

**Filtro de Módulos:**

```sql
WHERE m.is_published = true AND m.status = 'published'
```

- Solo módulos visibles para estudiantes
- Módulos en draft o archived quedan fuera

**Resultado:** Si hay 5 módulos publicados → 5 registros creados

**Estrategia de Idempotencia:**

```sql
ON CONFLICT (user_id, module_id) DO NOTHING
```

- La tabla tiene unique constraint compuesto: `(user_id, module_id)`
- Si ya existe progreso para ese usuario+módulo → Skip
- Permite re-ejecutar función sin duplicados

**BUG FIX #1 - GAP-003: Este código faltaba completamente**

**Problema anterior:**
```sql
-- ❌ FALTABA ESTE BLOQUE COMPLETO (antes de 2025-11-24)
-- Usuarios no tenían module_progress inicializado
-- Dashboard mostraba "No modules available"
```

**Solución:** Se agregó el bloque completo (líneas 60-82 del DDL)

**Comentarios en Código:**

```sql
-- BUG FIX #1: Initialize module progress for all active modules
-- CRITICAL: New users must see available modules immediately
-- This was missing and caused "no modules available" errors
-- IMPORTANT: module_progress.user_id references profiles.id (NOT auth.users.id)
-- FIXED: Use NEW.id (profiles.id) not NEW.user_id (auth.users.id)
```

**Evidencia del Fix:** Ver `VALIDACION-GAP-003-MODULE-PROGRESS.md`

---

#### Paso 6: Return NEW

```sql
END IF;
RETURN NEW;
```

**Propósito:**
- En un trigger AFTER INSERT, RETURN NEW es obligatorio
- No afecta los datos (ya están persistidos)
- Es requerido por la sintaxis de PostgreSQL

---

## 🔍 Análisis de FK References

### Tabla de Referencias

| Tabla | Campo | FK Apunta a | NEW.field | Razón |
|-------|-------|-------------|-----------|-------|
| `user_stats` | `user_id` | `auth.users.id` | `NEW.user_id` | Gamificación usa auth de Supabase |
| `comodines_inventory` | `user_id` | `profiles.id` | `NEW.id` | Necesita tenant_id local |
| `user_ranks` | `user_id` | `auth.users.id` | `NEW.user_id` | Gamificación usa auth de Supabase |
| `module_progress` | `user_id` | `profiles.id` | `NEW.id` | Necesita tenant_id local |

### Regla Mnemotécnica

**Schema gamification_system:**
- ✅ Usa `auth.users.id` (Supabase)
- ❌ EXCEPTO `comodines_inventory` → usa `profiles.id`

**Otros schemas (progress_tracking, etc.):**
- ✅ Usan `profiles.id` (local con tenant)

**¿Por qué la excepción?**
- `comodines_inventory` necesita tenant_id para multi-tenancy
- No necesita vincular directamente con Supabase auth
- Prioriza consistencia de tenant sobre auth global

---

## ⚡ Análisis de Performance

### Complejidad Temporal

**Operaciones:**

| Operación | Complejidad | Tiempo Estimado |
|-----------|-------------|-----------------|
| INSERT user_stats | O(1) | ~5 ms |
| INSERT comodines_inventory | O(1) | ~5 ms |
| INSERT user_ranks | O(1) + EXISTS check | ~10 ms |
| SELECT modules publicados | O(M) donde M = módulos | ~20 ms (5 módulos) |
| INSERT module_progress (N veces) | O(N) donde N = módulos | ~50 ms (5 módulos) |
| **Total** | **O(M + N)** | **~90 ms** |

**Escalabilidad:**

- Con 5 módulos: ~90 ms ✅ Excelente
- Con 20 módulos: ~200 ms ✅ Aceptable
- Con 100 módulos: ~800 ms ⚠️ Considerar batch processing

### Análisis de Índices

**Índices Requeridos:**

1. `gamification_system.user_stats(user_id)` - UNIQUE (PK)
2. `gamification_system.comodines_inventory(user_id)` - UNIQUE (PK)
3. `progress_tracking.module_progress(user_id, module_id)` - UNIQUE (composite)
4. `educational_content.modules(is_published, status)` - INDEX compuesto

**Impacto:**
- ON CONFLICT requiere índices únicos (ya existen)
- WHERE NOT EXISTS se beneficia de índice en user_id
- SELECT modules con filtro usa índice compuesto

**Todos los índices necesarios ya están presentes en el schema.**

---

## 🧪 Testing

### Test 1: Inicialización Completa

**Setup:**
```sql
-- Crear usuario de prueba
INSERT INTO auth.users (id, email) VALUES
('11111111-1111-1111-1111-111111111111', 'test@example.com');

-- Crear perfil (dispara trigger)
INSERT INTO auth_management.profiles (id, user_id, tenant_id, email, role)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'tenant-uuid',
    'test@example.com',
    'student'
);
```

**Validación:**
```sql
-- Query de validación
WITH user_check AS (
    SELECT
        COUNT(DISTINCT us.user_id) as has_user_stats,
        COUNT(DISTINCT ci.user_id) as has_comodines,
        COUNT(DISTINCT ur.user_id) as has_ranks,
        COUNT(mp.id) as module_count
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
    LEFT JOIN gamification_system.comodines_inventory ci ON ci.user_id = p.id
    LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.user_id
    LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id
    WHERE p.id = '22222222-2222-2222-2222-222222222222'
)
SELECT * FROM user_check;

-- Resultado esperado:
-- has_user_stats = 1
-- has_comodines = 1
-- has_ranks = 1
-- module_count = 5 (o número de módulos publicados)
```

**Cleanup:**
```sql
DELETE FROM auth_management.profiles WHERE id = '22222222-2222-2222-2222-222222222222';
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';
```

---

### Test 2: Idempotencia

**Setup:**
```sql
-- Crear usuario con inicialización completa (Test 1)

-- Re-ejecutar función manualmente
SELECT gamilit.initialize_user_stats();
```

**Validación:**
```sql
-- Verificar que NO se crearon duplicados
SELECT
    (SELECT COUNT(*) FROM gamification_system.user_stats WHERE user_id = 'user-uuid') as count_user_stats,
    (SELECT COUNT(*) FROM gamification_system.comodines_inventory WHERE user_id = 'profile-uuid') as count_comodines,
    (SELECT COUNT(*) FROM gamification_system.user_ranks WHERE user_id = 'user-uuid') as count_ranks,
    (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE user_id = 'profile-uuid') as count_modules;

-- Resultado esperado:
-- count_user_stats = 1 (no duplicado)
-- count_comodines = 1 (no duplicado)
-- count_ranks = 1 (no duplicado)
-- count_modules = 5 (no duplicados)
```

---

### Test 3: Filtrado de Roles

**Setup:**
```sql
-- Crear perfil con rol excluido
INSERT INTO auth_management.profiles (id, user_id, tenant_id, email, role)
VALUES (
    'profile-uuid',
    'user-uuid',
    'tenant-uuid',
    'viewer@example.com',
    'viewer'  -- Role sin gamificación
);
```

**Validación:**
```sql
-- Verificar que NO se creó nada
SELECT COUNT(*) FROM gamification_system.user_stats WHERE user_id = 'user-uuid';
-- Resultado esperado: 0

SELECT COUNT(*) FROM gamification_system.comodines_inventory WHERE user_id = 'profile-uuid';
-- Resultado esperado: 0
```

---

## 🐛 Debugging y Troubleshooting

### Problema 1: Usuario sin module_progress

**Síntoma:** Dashboard muestra "No modules available"

**Diagnóstico:**
```sql
-- Verificar progreso del usuario
SELECT COUNT(*) FROM progress_tracking.module_progress
WHERE user_id = '<profile_id>';

-- Si retorna 0, inicialización falló
```

**Posibles Causas:**
1. No hay módulos publicados (is_published=false)
2. Trigger no se disparó (bug en DDL)
3. FK reference incorrecto (user_id vs profile_id)

**Solución Manual:**
```sql
-- Ejecutar inicialización manual
DO $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT id, user_id, tenant_id, role INTO v_profile
    FROM auth_management.profiles
    WHERE id = '<profile_id>';

    -- Inicializar module_progress
    INSERT INTO progress_tracking.module_progress (user_id, module_id, status, progress_percentage, created_at, updated_at)
    SELECT v_profile.id, m.id, 'not_started'::progress_tracking.progress_status, 0, NOW(), NOW()
    FROM educational_content.modules m
    WHERE m.is_published = true AND m.status = 'published'
    ON CONFLICT (user_id, module_id) DO NOTHING;
END $$;
```

---

### Problema 2: Duplicate Key Error

**Síntoma:** Error "duplicate key value violates unique constraint"

**Diagnóstico:**
```sql
-- Verificar si ya existen registros
SELECT user_id FROM gamification_system.user_stats WHERE user_id = '<user_id>';
SELECT user_id FROM gamification_system.comodines_inventory WHERE user_id = '<profile_id>';
```

**Causa Común:** Trigger se ejecutó múltiples veces

**Solución:**
- Verificar idempotencia (ON CONFLICT / WHERE NOT EXISTS)
- Código actual ya maneja esto correctamente

---

### Problema 3: FK Constraint Violation

**Síntoma:** Error "violates foreign key constraint"

**Diagnóstico:**
```sql
-- Verificar que auth.users existe
SELECT id FROM auth.users WHERE id = '<user_id>';

-- Verificar que profiles existe
SELECT id, user_id FROM auth_management.profiles WHERE id = '<profile_id>';

-- Verificar FK references en user_stats
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'user_stats' AND constraint_name LIKE '%fkey%';
```

**Causa Común:** Usar NEW.id en lugar de NEW.user_id (o viceversa)

**Solución:** Ver sección "Análisis de FK References" arriba

---

## 📊 Monitoreo en Producción

### Queries de Monitoreo

**Query 1: Usuarios sin inicialización completa**
```sql
SELECT
    p.id as profile_id,
    p.email,
    p.created_at,
    CASE WHEN us.user_id IS NULL THEN 0 ELSE 1 END as has_user_stats,
    CASE WHEN ci.user_id IS NULL THEN 0 ELSE 1 END as has_comodines,
    CASE WHEN ur.user_id IS NULL THEN 0 ELSE 1 END as has_ranks,
    CASE WHEN COUNT(mp.id) > 0 THEN 1 ELSE 0 END as has_module_progress,
    COUNT(mp.id) as module_count
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
LEFT JOIN gamification_system.comodines_inventory ci ON ci.user_id = p.id
LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.user_id
LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND p.created_at > NOW() - INTERVAL '24 hours'
GROUP BY p.id, p.email, p.created_at, us.user_id, ci.user_id, ur.user_id
HAVING
    COUNT(DISTINCT us.user_id) = 0 OR
    COUNT(DISTINCT ci.user_id) = 0 OR
    COUNT(DISTINCT ur.user_id) = 0 OR
    COUNT(mp.id) = 0;
```

**Alerta:** Si retorna > 0 filas → Inicialización falló para algunos usuarios

---

**Query 2: Estadísticas de inicialización**
```sql
SELECT
    COUNT(*) as total_users,
    SUM(CASE WHEN has_user_stats = 1 THEN 1 ELSE 0 END) as users_with_user_stats,
    SUM(CASE WHEN has_comodines = 1 THEN 1 ELSE 0 END) as users_with_comodines,
    SUM(CASE WHEN has_ranks = 1 THEN 1 ELSE 0 END) as users_with_ranks,
    SUM(CASE WHEN has_module_progress = 1 THEN 1 ELSE 0 END) as users_with_module_progress,
    AVG(module_count) as avg_modules_per_user
FROM (
    SELECT
        COUNT(DISTINCT us.user_id) as has_user_stats,
        COUNT(DISTINCT ci.user_id) as has_comodines,
        COUNT(DISTINCT ur.user_id) as has_ranks,
        COUNT(DISTINCT mp.user_id) as has_module_progress,
        COUNT(mp.id) as module_count
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
    LEFT JOIN gamification_system.comodines_inventory ci ON ci.user_id = p.id
    LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.user_id
    LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
    GROUP BY p.id
) stats;
```

**Objetivo:** 100% en todos los campos

---

## 📚 Referencias

### Documentación Relacionada

- **RF-INIT-001:** `docs/01-fase-alcance-inicial/EAI-001-fundamentos/requerimientos/RF-INIT-001-inicializacion-automatica-usuario.md`
- **ADR-012:** `docs/97-adr/ADR-012-automatic-user-initialization-trigger.md`
- **FLUJO:** `docs/90-transversal/FLUJO-INICIALIZACION-USUARIO.md`
- **DIAGRAMA:** `docs/90-transversal/DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md`
- **FUNCIONES:** `docs/90-transversal/FUNCIONES-UTILITARIAS-GAMILIT.md`
- **TRACEABILITY:** `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/TRACEABILITY.yml`

### Código Fuente

- **Función:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql` (93 líneas)
- **Trigger:** `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql` (14 líneas)

### Validaciones

- **GAP-003:** `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-GAP-003-MODULE-PROGRESS.md`
- **FINAL:** `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-FINAL-EXHAUSTIVA.md`
- **CONFLICTOS:** `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-CONFLICTOS-DUPLICIDADES-REFERENCIAS.md`

---

**Fin de la Especificación Técnica ET-INIT-001**

**Autor:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.1
**Estado:** ✅ Implementado, Validado y Documentado
