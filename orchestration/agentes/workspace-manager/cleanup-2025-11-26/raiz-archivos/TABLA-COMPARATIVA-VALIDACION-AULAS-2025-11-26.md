# Tabla Comparativa: Validacion de Tablas de Aulas

## Comparativa General

| Aspecto | classrooms | teacher_classrooms |
|---------|------------|--------------------|
| **Archivo** | `03-classrooms.sql` | `teacher_classrooms.sql` |
| **Estado** | ✅ Bien definida | ❌ Problemas criticos |
| **Columnas** | 25 | 7 |
| **Tamaño DDL** | ~200 lineas | ~30 lineas |
| **Primary Key** | ✅ `id` | ✅ `id` |
| **Unique Keys** | ✅ `code` | ✅ `(teacher_id, classroom_id)` |
| **Check Constraints** | Ninguno | ✅ `role IN (...)` |
| **Foreign Keys** | ✅ 3 FKs | ❌ 1 FK inconsistente |
| **Indices** | ✅ 5 indices | ✅ 4 indices |
| **RLS Policies** | ✅ 5 policies | ❌ 0 policies |
| **Soft Delete** | ✅ is_deleted | ❌ No |
| **Timestamps** | ✅ created_at, updated_at | ⚠️ assigned_at, created_at |
| **JSONB Fields** | ✅ settings, schedule, metadata | ❌ No |
| **Datos Prueba** | ✅ 7 registros | ✅ Via sincronizacion |

---

## Estructura de Columnas

### classrooms (25 columnas)

```
Core Identifiers:
  id                    UUID PRIMARY KEY
  school_id             UUID (FK) -> schools
  tenant_id             UUID (FK) -> tenants
  teacher_id            UUID (FK) -> auth_management.profiles ✅ CORRECTO

Metadata:
  name                  TEXT (required)
  code                  TEXT UNIQUE
  description           TEXT
  grade_level           TEXT
  section               TEXT
  subject               TEXT
  academic_year         TEXT
  semester              TEXT

Capacity:
  capacity              INTEGER (default: 40)
  current_students_count INTEGER (default: 0)

Configuration:
  co_teachers           UUID[] (array)
  settings              JSONB
  schedule              JSONB
  meeting_url           TEXT

Status:
  is_active             BOOLEAN (default: true)
  is_archived           BOOLEAN (default: false)
  is_deleted            BOOLEAN (default: false)
  start_date            DATE
  end_date              DATE

Audit:
  metadata              JSONB
  created_at            TIMESTAMP
  updated_at            TIMESTAMP
```

### teacher_classrooms (7 columnas)

```
Core Identifiers:
  id                    UUID PRIMARY KEY
  teacher_id            UUID (FK) -> auth.users ❌ PROBLEMA
  classroom_id          UUID (FK) -> classrooms
  tenant_id             UUID (FK) -> tenants

Configuration:
  role                  VARCHAR(50) CHECK IN ('owner', 'teacher', 'assistant')

Audit:
  assigned_at           TIMESTAMP
  created_at            TIMESTAMP
```

---

## Comparativa de Foreign Keys

### classrooms - Foreign Keys ✅

| Nombre | Columna | Target | Action |
|--------|---------|--------|--------|
| classrooms_school_id_fkey | school_id | social_features.schools(id) | CASCADE |
| classrooms_teacher_id_fkey | teacher_id | auth_management.profiles(id) | RESTRICT |
| classrooms_tenant_id_fkey | tenant_id | auth_management.tenants(id) | CASCADE |

### teacher_classrooms - Foreign Keys ❌

| Nombre | Columna | Target | Status | Problema |
|--------|---------|--------|--------|----------|
| (innominate) | teacher_id | **auth.users(id)** | INCONSISTENTE | Diferente schema que classrooms |
| (innominate) | classroom_id | social_features.classrooms(id) | OK | Correcto |
| teacher_classrooms_tenant_fkey | tenant_id | auth_management.tenants(id) | OK | Correcto |

---

## Comparativa de Indices

### classrooms - 5 Indices

```
idx_classrooms_active       ON is_active WHERE is_active = true
idx_classrooms_not_deleted  ON created_at DESC WHERE is_deleted = false
idx_classrooms_code         ON code
idx_classrooms_school       ON school_id
idx_classrooms_teacher      ON teacher_id
```

### teacher_classrooms - 4 Indices

```
idx_teacher_classrooms_teacher_id     ON teacher_id
idx_teacher_classrooms_classroom_id   ON classroom_id
idx_teacher_classrooms_role           ON role
idx_teacher_classrooms_tenant_id      ON tenant_id
```

---

## Comparativa de RLS Policies

### classrooms - 5 Policies ✅

| Policy | Type | Audience | Condition |
|--------|------|----------|-----------|
| classrooms_read_student | SELECT | Students | In classroom_members |
| classrooms_read_teacher | SELECT | Teachers | teacher_id = current_user |
| classrooms_read_admin | SELECT | Admins | is super_admin |
| classrooms_insert_teacher | INSERT | Teachers | teacher_id = current_user AND admin_teacher |
| classrooms_update_teacher | UPDATE | Teachers | teacher_id = current_user |

### teacher_classrooms - 0 Policies ❌

```
NO POLICIES DEFINED
SECURITY RISK: Any authenticated user can view all teacher-classroom assignments
```

---

## Comparativa de Validaciones

### classrooms

```
CHECK CONSTRAINTS:
  - None explicitly defined
  - Grade level, section, etc. are optional TEXT fields
  
JSONB Validations:
  - settings: JSON schema not enforced
  - schedule: JSON schema not enforced
  - metadata: JSON schema not enforced

ENUM/DOMAIN Types:
  - is_active, is_archived, is_deleted are BOOLEAN
  - status fields use string literals
```

### teacher_classrooms

```
CHECK CONSTRAINTS:
  ✅ role IN ('owner', 'teacher', 'assistant')
  
Unique Constraints:
  ✅ (teacher_id, classroom_id) prevents duplicates
  
No JSONB fields
No ENUM types
```

---

## Resumen de Consistencia

### Relacion Entre Tablas

```
classrooms
  ├─ teacher_id ──→ auth_management.profiles(id) ✅
  ├─ school_id ──→ social_features.schools(id) ✅
  └─ tenant_id ──→ auth_management.tenants(id) ✅

teacher_classrooms
  ├─ teacher_id ──→ auth.users(id) ❌ INCONSISTENCIA
  ├─ classroom_id ──→ social_features.classrooms(id) ✅
  └─ tenant_id ──→ auth_management.tenants(id) ✅
```

### Problem: Dos Schemas de Usuarios

```
System Architecture:
  
  auth.users (Supabase Auth)
    └─ Tabla de autenticacion pura
    └─ Used by: teacher_classrooms
    
  auth_management.profiles (Custom)
    └─ Tabla de perfiles de usuario extendida
    └─ Used by: classrooms
    
INCONSISTENCY: ¿Cual es la fuente de verdad para profesores?
```

---

## Matriz de Validacion Final

### classrooms - 10/10 Criterios

```
[✅] Archivo DDL existe
[✅] Nombre de tabla apropiado
[✅] Columnas bien tipadas
[✅] Primary key configurado
[✅] Unique constraints
[✅] Foreign keys definidas
[✅] Indices creados
[✅] RLS policies implementadas
[✅] Datos de prueba disponibles
[✅] Documentacion inline
```

### teacher_classrooms - 6/10 Criterios

```
[✅] Archivo DDL existe
[✅] Nombre de tabla apropiado
[✅] Columnas bien tipadas
[✅] Primary key configurado
[✅] Unique constraints
[❌] Foreign keys INCONSISTENTES
[✅] Indices creados
[❌] RLS policies NO DEFINIDAS
[✅] Sincronizacion con classrooms
[⚠️] Documentacion incompleta
```

