# Flujo Completo: Inicialización de Usuario

**Última actualización:** 2025-12-18
**Relacionado con:** ADR-012
**Propósito:** Documentar el flujo end-to-end desde registro de usuario hasta plataforma lista para usar

---

## 📋 Descripción General

Este documento describe el flujo completo de inicialización automática cuando un usuario se registra en GAMILIT. El sistema utiliza un **trigger de base de datos** para garantizar que cada nuevo usuario tenga todos los registros necesarios creados automáticamente en 0 segundos.

**Resultado final:**
- ✅ Usuario registrado puede usar la plataforma inmediatamente
- ✅ Ve 5 módulos disponibles sin esperar
- ✅ Gamificación funciona desde el primer momento
- ✅ 0 errores en dashboard

---

## 🔄 Flujo End-to-End

### 1. Usuario se Registra (Frontend)

**Componente:** `apps/frontend/src/apps/student/pages/RegisterPage.tsx`

**Acción del usuario:**
```typescript
// Usuario llena formulario de registro
{
  email: "student@example.com",
  password: "SecurePass123!",
  role: "student",
  displayName: "Juan Pérez"
}
```

**Request HTTP:**
```typescript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "displayName": "Juan Pérez"
}
```

---

### 2. Backend Procesa Registro

**Servicio:** `apps/backend/src/auth/auth.service.ts`

**Código simplificado:**
```typescript
async register(dto: RegisterDto) {
  // Paso 1: Crear usuario en auth.users (autenticación estándar)
  const { data: authUser, error } = await this.dbClient.auth.signUp({
    email: dto.email,
    password: dto.password,
  });

  if (error) throw new UnauthorizedException(error.message);

  // Paso 2: Crear perfil en auth_management.profiles
  const { data: profile, error: profileError } = await this.dbClient
    .from('profiles')
    .insert({
      user_id: authUser.user.id,     // FK a auth.users
      email: dto.email,
      role: dto.role,
      display_name: dto.displayName,
    })
    .select()
    .single();

  // ⚡ En este punto, el TRIGGER se dispara automáticamente
  // No se requiere código adicional para inicialización

  return {
    user: profile,
    accessToken: authUser.session.access_token,
  };
}
```

**Observaciones importantes:**
- ✅ El backend NO necesita código para inicializar gamificación
- ✅ El backend NO necesita código para crear module_progress
- ✅ Todo es manejado automáticamente por el trigger
- ✅ Código más simple y menos propenso a errores

---

### 3. Triggers de Base de Datos se Disparan

#### 3.1. Trigger: Aseguramiento de Nombre (BEFORE INSERT)

**Trigger:** `trg_ensure_profile_name`
**Ubicación:** `apps/database/ddl/schemas/auth_management/triggers/03b-trg_ensure_profile_name.sql`

**Definición:**
```sql
CREATE TRIGGER trg_ensure_profile_name
  BEFORE INSERT ON auth_management.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auth_management.ensure_profile_name();
```

**Propósito:**
- Asegura que `first_name`, `last_name` y `full_name` tengan valores válidos
- Si están vacíos, extrae el nombre del email automáticamente
- Computa `full_name` como concatenación de `first_name + last_name`
- Previene usuarios con "Unknown Student" en la UI

**Lógica:**
```sql
-- Si first_name está vacío, extraer del email
IF NEW.first_name IS NULL OR TRIM(NEW.first_name) = '' THEN
  NEW.first_name := INITCAP(SPLIT_PART(NEW.email, '@', 1));
END IF;

-- Si last_name está vacío, poner valor por defecto
IF NEW.last_name IS NULL OR TRIM(NEW.last_name) = '' THEN
  NEW.last_name := 'Usuario';
END IF;

-- Siempre computar full_name como concatenación
NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
```

#### 3.2. Trigger: Inicialización de Estadísticas (AFTER INSERT)

**Trigger:** `trg_initialize_user_stats`
**Ubicación:** `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`

**Definición:**
```sql
CREATE TRIGGER trg_initialize_user_stats
  AFTER INSERT ON auth_management.profiles
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.initialize_user_stats();
```

**Orden de ejecución:**
1. `trg_ensure_profile_name` (BEFORE INSERT) - Asegura datos del perfil
2. INSERT en `profiles` se completa
3. `trg_initialize_user_stats` (AFTER INSERT) - Inicializa gamificación

---

### 4. Función de Inicialización Ejecuta

**Función:** `gamilit.initialize_user_stats()`
**Ubicación:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

**Acciones realizadas (en orden):**

#### 4.1. Inicializar Estadísticas de Gamificación

```sql
INSERT INTO gamification_system.user_stats (
  user_id,
  total_xp,
  level,
  ml_coins,
  current_streak,
  created_at,
  updated_at
)
VALUES (
  NEW.user_id,  -- auth.users.id
  0,            -- XP inicial
  1,            -- Nivel inicial
  100,          -- 100 ML Coins de bienvenida
  0,            -- Racha inicial
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;
```

**Resultado:**
- ✅ Usuario tiene 100 ML Coins para gastar
- ✅ Nivel 1 asignado
- ✅ Estadísticas listas para tracking

#### 4.2. Inicializar Inventario de Comodines

```sql
INSERT INTO gamification_system.comodines_inventory (
  user_id,
  total_comodines_earned,
  total_comodines_used,
  created_at,
  updated_at
)
VALUES (
  NEW.id,  -- profiles.id
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;
```

**Resultado:**
- ✅ Inventario vacío creado
- ✅ Listo para acumular comodines

#### 4.3. Asignar Rango Maya Inicial

```sql
INSERT INTO gamification_system.user_ranks (
  user_id,
  current_rank,
  rank_progress,
  created_at,
  updated_at
)
SELECT
  NEW.user_id,  -- auth.users.id
  'Ajaw'::gamification_system.maya_rank,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM gamification_system.user_ranks
  WHERE user_id = NEW.user_id
);
```

**Resultado:**
- ✅ Rango inicial "Ajaw" asignado
- ✅ Sistema de progresión activado

#### 4.4. Crear Progreso para Todos los Módulos Publicados

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
  NEW.id,                                    -- profiles.id
  m.id,                                      -- modules.id
  'not_started'::progress_tracking.progress_status,
  0,
  NOW(),
  NOW()
FROM educational_content.modules m
WHERE m.is_published = true
  AND m.status = 'published'
ON CONFLICT (user_id, module_id) DO NOTHING;
```

**Resultado:**
- ✅ Un registro por cada módulo publicado (típicamente 5 registros)
- ✅ Usuario ve módulos disponibles inmediatamente
- ✅ Sin errores de "no modules available"

---

### 5. Backend Retorna Respuesta

**Response HTTP:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "role": "student",
    "displayName": "Juan Pérez",
    "createdAt": "2025-11-24T10:30:00.000Z"
  },
  "accessToken": "eyJhbGc..."
}
```

**Estado de base de datos en este momento:**
```sql
-- user_stats: 1 registro ✅
-- comodines_inventory: 1 registro ✅
-- user_ranks: 1 registro ✅
-- module_progress: 5 registros ✅
-- TOTAL: 8 registros creados automáticamente
```

---

### 6. Frontend Carga Dashboard

**Componente:** `apps/frontend/src/apps/student/pages/DashboardPage.tsx`

**Queries automáticas:**
```typescript
// 1. Cargar módulos disponibles
const { data: modules } = useQuery({
  queryKey: ['modules'],
  queryFn: () => api.get('/api/v1/modules'),
});
// Retorna: 5 módulos con status 'not_started'

// 2. Cargar estadísticas
const { data: stats } = useQuery({
  queryKey: ['user-stats'],
  queryFn: () => api.get('/api/v1/gamification/stats'),
});
// Retorna: { level: 1, ml_coins: 100, xp: 0, streak: 0 }

// 3. Cargar rango actual
const { data: rank } = useQuery({
  queryKey: ['user-rank'],
  queryFn: () => api.get('/api/v1/gamification/rank'),
});
// Retorna: { current_rank: 'Ajaw', progress: 0 }
```

**Resultado visual:**
```
┌─────────────────────────────────────┐
│ Dashboard - Bienvenido Juan Pérez   │
├─────────────────────────────────────┤
│ Nivel: 1    │ Coins: 100 💰        │
│ Rango: Ajaw │ XP: 0/100            │
├─────────────────────────────────────┤
│ Módulos Disponibles:                │
│ ✅ M1: María y su Huerto            │
│ ✅ M2: Detective Numérico           │
│ ✅ M3: La Gran Carrera              │
│ ✅ M4: Mercado de las Fracciones    │
│ ✅ M5: Aventura en el Museo         │
└─────────────────────────────────────┘
```

✅ **Usuario puede empezar a usar la plataforma inmediatamente**

---

## 📊 Diagrama de Secuencia Completo

```
┌────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐
│ Usuario│    │ Frontend │    │ Backend │    │ Database │    │ Trigger │
└───┬────┘    └────┬─────┘    └────┬────┘    └────┬─────┘    └────┬────┘
    │              │              │              │              │
    │ Registro     │              │              │              │
    │─────────────>│              │              │              │
    │              │              │              │              │
    │              │ POST /register              │              │
    │              │─────────────>│              │              │
    │              │              │              │              │
    │              │              │ INSERT       │              │
    │              │              │ auth.users   │              │
    │              │              │─────────────>│              │
    │              │              │<─────────────│              │
    │              │              │   User ID    │              │
    │              │              │              │              │
    │              │              │ INSERT       │              │
    │              │              │ profiles     │              │
    │              │              │─────────────>│              │
    │              │              │              │              │
    │              │              │              │ ⚡ TRIGGER  │
    │              │              │              │──────────────>│
    │              │              │              │              │
    │              │              │              │ INSERT       │
    │              │              │              │ user_stats   │
    │              │              │              │<─────────────│
    │              │              │              │              │
    │              │              │              │ INSERT       │
    │              │              │              │ comodines    │
    │              │              │              │<─────────────│
    │              │              │              │              │
    │              │              │              │ INSERT       │
    │              │              │              │ user_ranks   │
    │              │              │              │<─────────────│
    │              │              │              │              │
    │              │              │              │ INSERT       │
    │              │              │              │ module_progress (x5)
    │              │              │              │<─────────────│
    │              │              │              │              │
    │              │              │<─────────────│              │
    │              │              │   Profile + Session       │
    │              │<─────────────│              │              │
    │              │ User + Token │              │              │
    │<─────────────│              │              │              │
    │              │              │              │              │
    │ Redirect     │              │              │              │
    │ Dashboard    │              │              │              │
    │─────────────>│              │              │              │
    │              │              │              │              │
    │              │ GET /modules │              │              │
    │              │─────────────>│              │              │
    │              │              │ SELECT       │              │
    │              │              │ module_progress             │
    │              │              │─────────────>│              │
    │              │              │<─────────────│              │
    │              │              │   5 modules  │              │
    │              │<─────────────│              │              │
    │              │   5 modules  │              │              │
    │              │              │              │              │
    │ 🎉 Plataforma│              │              │              │
    │    Lista     │              │              │              │
    │<─────────────│              │              │              │
```

**Tiempo total:** ~300ms
- Registro: ~100ms
- Trigger: ~50ms (4 INSERTs en paralelo)
- Primera carga: ~150ms

---

## 🔍 Validación del Flujo

### Query de Validación Post-Registro

```sql
-- Verificar que nuevo usuario tiene todo inicializado
WITH new_user AS (
  SELECT id, user_id, email
  FROM auth_management.profiles
  WHERE email = 'student@example.com'
)
SELECT
  'auth_management.profiles' as tabla,
  1 as esperado,
  COUNT(*) as real,
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END as status
FROM new_user

UNION ALL

SELECT
  'gamification_system.user_stats',
  1,
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END
FROM new_user nu
JOIN gamification_system.user_stats us ON us.user_id = nu.user_id

UNION ALL

SELECT
  'gamification_system.comodines_inventory',
  1,
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END
FROM new_user nu
JOIN gamification_system.comodines_inventory ci ON ci.user_id = nu.id

UNION ALL

SELECT
  'gamification_system.user_ranks',
  1,
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END
FROM new_user nu
JOIN gamification_system.user_ranks ur ON ur.user_id = nu.user_id

UNION ALL

SELECT
  'progress_tracking.module_progress',
  5,  -- Asumiendo 5 módulos publicados
  COUNT(*),
  CASE WHEN COUNT(*) = 5 THEN '✅' ELSE '❌' END
FROM new_user nu
JOIN progress_tracking.module_progress mp ON mp.user_id = nu.id;
```

**Resultado esperado:**
```
tabla                                      | esperado | real | status
-------------------------------------------+----------+------+--------
auth_management.profiles                   |        1 |    1 | ✅
gamification_system.user_stats             |        1 |    1 | ✅
gamification_system.comodines_inventory    |        1 |    1 | ✅
gamification_system.user_ranks             |        1 |    1 | ✅
progress_tracking.module_progress          |        5 |    5 | ✅
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Usuario se Registra por Primera Vez

**Escenario:**
- Usuario nuevo
- Email no existe en sistema
- Primer registro

**Flujo:**
1. POST /api/v1/auth/register
2. Trigger crea 8 registros (1+1+1+5)
3. Usuario ve dashboard completo
4. ✅ Resultado: Usuario listo para usar plataforma

---

### Caso 2: Re-registro del Mismo Usuario (Idempotencia)

**Escenario:**
- Usuario intenta registrarse 2 veces con mismo email
- Sistema debe manejar gracefully

**Flujo:**
1. POST /api/v1/auth/register (segunda vez)
2. Trigger intenta crear registros
3. `ON CONFLICT DO NOTHING` previene duplicados
4. ✅ Resultado: Sin errores, registros existentes no se alteran

**SQL:**
```sql
-- Todas las inserciones usan ON CONFLICT
ON CONFLICT (user_id) DO NOTHING;
ON CONFLICT (user_id, module_id) DO NOTHING;
```

---

### Caso 3: Se Publica un Nuevo Módulo (M6)

**Escenario:**
- Admin publica módulo M6
- Usuarios existentes deben poder acceder

**Opción 1: Migration Manual**
```sql
-- Crear module_progress para usuarios existentes
INSERT INTO progress_tracking.module_progress (
  user_id, module_id, status, progress_percentage
)
SELECT
  p.id,
  'm6-new-module'::uuid,
  'not_started',
  0
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (
    SELECT 1 FROM progress_tracking.module_progress mp
    WHERE mp.user_id = p.id AND mp.module_id = 'm6-new-module'::uuid
  );
```

**Opción 2: Lazy Loading en Backend**
- Crear module_progress al primer acceso
- Más simple pero menos consistente

**Recomendación:** Opción 1 (migration) para consistencia

---

## 🚨 Troubleshooting

### Problema 1: Usuario Sin Módulos

**Síntoma:**
```
Dashboard muestra: "No modules available"
```

**Diagnóstico:**
```sql
SELECT COUNT(*) FROM progress_tracking.module_progress
WHERE user_id = 'USER_PROFILE_ID';
-- Resultado esperado: 5
-- Si retorna 0: Trigger no se ejecutó
```

**Causas posibles:**
1. ❌ Trigger deshabilitado
2. ❌ No hay módulos publicados
3. ❌ FK incorrecta (user_id → auth.users.id en vez de profiles.id)

**Solución:**
```sql
-- Verificar trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trg_initialize_user_stats';

-- Verificar módulos publicados
SELECT COUNT(*) FROM educational_content.modules
WHERE is_published = true AND status = 'published';

-- Re-inicializar manualmente
SELECT gamilit.initialize_user_stats() FROM auth_management.profiles
WHERE id = 'USER_PROFILE_ID';
```

---

### Problema 2: Usuario Sin Stats

**Síntoma:**
```
Dashboard muestra: "Error loading stats"
```

**Diagnóstico:**
```sql
SELECT * FROM gamification_system.user_stats
WHERE user_id = 'USER_AUTH_ID';
-- Resultado esperado: 1 fila
```

**Solución:**
```sql
-- Insertar stats manualmente
INSERT INTO gamification_system.user_stats (
  user_id, total_xp, level, ml_coins, current_streak
)
VALUES ('USER_AUTH_ID', 0, 1, 100, 0)
ON CONFLICT (user_id) DO NOTHING;
```

---

### Problema 3: Duplicados en module_progress

**Síntoma:**
```
ERROR: duplicate key value violates unique constraint "module_progress_pkey"
```

**Diagnóstico:**
```sql
SELECT user_id, module_id, COUNT(*)
FROM progress_tracking.module_progress
GROUP BY user_id, module_id
HAVING COUNT(*) > 1;
```

**Solución:**
```sql
-- Eliminar duplicados, mantener el más antiguo
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, module_id ORDER BY created_at
  ) as rn
  FROM progress_tracking.module_progress
)
DELETE FROM progress_tracking.module_progress
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
```

---

## 📚 Referencias

**Documentación relacionada:**
- ADR: `docs/97-adr/ADR-012-automatic-user-initialization-trigger.md`
- Función: `docs/90-transversal/FUNCIONES-UTILITARIAS-GAMILIT.md`
- Dependencias: `docs/90-transversal/DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md`

**Código fuente:**
- Trigger aseguramiento nombre: `apps/database/ddl/schemas/auth_management/triggers/03b-trg_ensure_profile_name.sql`
- Trigger inicialización: `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`
- Función inicialización: `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
- Backend: `apps/backend/src/modules/auth/services/auth.service.ts`
- Frontend: `apps/frontend/src/apps/student/pages/DashboardPage.tsx`

**Inventarios:**
- `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`
- `orchestration/inventarios/MASTER_INVENTORY.yml`

---

**FIN DEL DOCUMENTO**

**Última actualización:** 2025-12-18
**Mantenedores:** Architecture-Analyst, Database-Agent
**Revisión necesaria:** Sí, al agregar nuevos módulos o cambiar proceso de registro
