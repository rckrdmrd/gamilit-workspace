# DIAGRAMA: JOINs Antes vs Después

## ANTES (Incorrecto)

```
┌─────────────────────────────────────────────────────────────────┐
│ INSERT INTO student_intervention_alerts                         │
│   (student_id, tenant_id, ...)                                  │
│ SELECT                                                           │
│   mp.user_id,      ← PROBLEMA: mp.user_id es profiles.id       │
│   u.tenant_id,     ← Usando auth.users directamente            │
│   ...                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FROM progress_tracking.module_progress mp                       │
│ JOIN auth.users u ON mp.user_id = u.id  ← FK NO EXISTE         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PROBLEMA:                                                        │
│ - module_progress.user_id → profiles(id)                        │
│ - Pero JOIN va directo a auth.users(id)                         │
│ - Funciona SOLO porque profiles.id = auth.users.id (datos)      │
│ - Arquitectónicamente INCORRECTO                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Flujo de datos:**
```
module_progress.user_id
         |
         | (JOIN directo - FK no existe)
         |
         ↓
    auth.users.id
         |
         ↓
    u.tenant_id → student_intervention_alerts.tenant_id
    mp.user_id  → student_intervention_alerts.student_id
```

---

## DESPUÉS (Correcto)

```
┌─────────────────────────────────────────────────────────────────┐
│ INSERT INTO student_intervention_alerts                         │
│   (student_id, tenant_id, ...)                                  │
│ SELECT                                                           │
│   p.user_id,       ← CORRECTO: p.user_id es auth.users.id      │
│   p.tenant_id,     ← Usando profiles correctamente             │
│   ...                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FROM progress_tracking.module_progress mp                       │
│ JOIN auth_management.profiles p ON mp.user_id = p.id  ← FK ✓   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SOLUCIÓN:                                                        │
│ - module_progress.user_id → profiles.id ✓                       │
│ - JOIN respeta la FK definida                                   │
│ - Usa profiles.user_id → auth.users.id (FK existe)             │
│ - Arquitectónicamente CORRECTO                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Flujo de datos:**
```
module_progress.user_id
         |
         | FK: module_progress_user_id_fkey
         |     REFERENCES profiles(id) ✓
         ↓
auth_management.profiles.id
         |
         | p.user_id (profiles.user_id)
         | FK: profiles_user_id_fkey
         | REFERENCES auth.users(id) ✓
         ↓
    auth.users.id
         |
         ↓
    p.tenant_id → student_intervention_alerts.tenant_id
    p.user_id   → student_intervention_alerts.student_id
                  FK: student_intervention_alerts_student_id_fkey
                  REFERENCES auth.users(id) ✓
```

---

## COMPARACIÓN DETALLADA

### Alerta 1: no_activity

**ANTES:**
```sql
SELECT DISTINCT
  mp.user_id,        -- profiles.id (incorrecto para student_id)
  mp.classroom_id,
  ...
  u.tenant_id        -- de auth.users
FROM progress_tracking.module_progress mp
JOIN auth.users u ON mp.user_id = u.id  -- FK no existe
```

**DESPUÉS:**
```sql
SELECT DISTINCT
  p.user_id,         -- auth.users.id (correcto para student_id)
  mp.classroom_id,
  ...
  p.tenant_id        -- de profiles
FROM progress_tracking.module_progress mp
JOIN auth_management.profiles p ON mp.user_id = p.id  -- FK existe ✓
```

### Alerta 2: low_score

**ANTES:**
```sql
SELECT
  mp.user_id,        -- profiles.id (incorrecto)
  mp.classroom_id,
  ...
  u.tenant_id        -- de auth.users
FROM progress_tracking.module_progress mp
JOIN auth.users u ON mp.user_id = u.id  -- FK no existe
```

**DESPUÉS:**
```sql
SELECT
  p.user_id,         -- auth.users.id (correcto)
  mp.classroom_id,
  ...
  p.tenant_id        -- de profiles
FROM progress_tracking.module_progress mp
JOIN auth_management.profiles p ON mp.user_id = p.id  -- FK existe ✓
```

### Alerta 3: repeated_failures

**ANTES:**
```sql
SELECT
  es.user_id,        -- profiles.id (incorrecto)
  mp.classroom_id,
  ...
  u.tenant_id        -- de auth.users
FROM progress_tracking.exercise_submissions es
JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id
JOIN auth.users u ON es.user_id = u.id  -- FK no existe
```

**DESPUÉS:**
```sql
SELECT
  p.user_id,         -- auth.users.id (correcto)
  mp.classroom_id,
  ...
  p.tenant_id        -- de profiles
FROM progress_tracking.exercise_submissions es
JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id
JOIN auth_management.profiles p ON es.user_id = p.id  -- FK existe ✓
```

---

## ARQUITECTURA DE FOREIGN KEYS

```
┌──────────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA COMPLETA                         │
└──────────────────────────────────────────────────────────────────┘

auth.users (Supabase Auth)
    │
    │ ← profiles_user_id_fkey
    │    UNIQUE, ON DELETE CASCADE
    │
    ↓ user_id
auth_management.profiles
    │
    ├─→ tenant_id (profiles_tenant_id_fkey → tenants.id)
    │
    │ ← module_progress_user_id_fkey
    │    ON DELETE CASCADE
    │
    ↓ user_id = profiles.id
progress_tracking.module_progress
    │
    │ ← fk_exercise_submissions_user
    │    ON DELETE CASCADE
    │
    ↓ user_id = profiles.id
progress_tracking.exercise_submissions

                ↓

student_intervention_alerts.student_id
    │
    │ student_intervention_alerts_student_id_fkey
    │ REFERENCES auth.users(id) ON DELETE CASCADE
    │
    ↓
auth.users.id
```

**Campos importantes:**

```
profiles:
  - id (PK uuid)
  - user_id (FK → auth.users.id, UNIQUE)
  - tenant_id (FK → tenants.id)

module_progress:
  - user_id (FK → profiles.id)

exercise_submissions:
  - user_id (FK → profiles.id)

student_intervention_alerts:
  - student_id (FK → auth.users.id)
  - tenant_id (uuid)
```

---

## RESUMEN DE CAMBIOS

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **JOIN Tabla** | `auth.users` | `auth_management.profiles` |
| **JOIN Alias** | `u` | `p` |
| **JOIN Condición** | `mp.user_id = u.id` | `mp.user_id = p.id` |
| **student_id** | `mp.user_id` (profiles.id) | `p.user_id` (auth.users.id) |
| **tenant_id** | `u.tenant_id` | `p.tenant_id` |
| **FK Respetada** | ❌ NO (mp.user_id no tiene FK a auth.users) | ✅ SÍ (mp.user_id → profiles.id) |
| **Arquitectura** | ❌ Incorrecta | ✅ Correcta |
| **Funcionalidad** | ⚠️ Funciona por coincidencia | ✅ Funciona arquitectónicamente |

---

## BENEFICIOS DE LA CORRECCIÓN

1. **Respeta FKs Definidas:**
   - Los JOINs ahora siguen las foreign keys reales del esquema

2. **Más Robusto:**
   - No depende de la coincidencia `profiles.id = auth.users.id`
   - Funciona correctamente aunque esa igualdad cambie en el futuro

3. **Más Mantenible:**
   - El código refleja la arquitectura real
   - Más fácil de entender para nuevos desarrolladores

4. **Preparado para Evolución:**
   - Si la relación profiles-users cambia, el código seguirá siendo válido

5. **Mejor Integridad Referencial:**
   - Los datos insertados en `student_intervention_alerts` garantizan existencia en `auth.users`

---

**Database-Agent | 2025-11-24**
