# PLAN DE IMPLEMENTACIÓN - FLUJO DE CREACIÓN DE USUARIOS

**Tech-Leader:** Claude Opus 4.5
**Proyecto:** GAMILIT
**Fecha:** 2025-12-15
**Estado:** FASE 3 - Planeación de Implementaciones

---

## 1. RESUMEN EJECUTIVO

### Objetivo
Implementar los siguientes cambios en el sistema GAMILIT:
1. Crear School Default "Sistema - Por Asignar"
2. Asignar admin (admin@gamilit.com) a la School Default
3. Corregir el problema de "Nunca" en último acceso (seeds)

### Corrección del Análisis Inicial
| Item | Análisis Inicial | Análisis Profundo | Acción |
|------|------------------|-------------------|--------|
| AuthService.register() | NO IMPLEMENTADO | ✅ SÍ IMPLEMENTADO | No requiere cambios |
| AuthService.login() | NO IMPLEMENTADO | ✅ SÍ IMPLEMENTADO | No requiere cambios |
| last_sign_in_at update | No se actualiza | ✅ SÍ SE ACTUALIZA | Problema es datos NULL en seeds |
| School Default | NO EXISTE | NO EXISTE | **CREAR** |
| Admin school_id | NULL | NULL | **ASIGNAR** |

---

## 2. CAMBIOS A IMPLEMENTAR

### 2.1 CAPA DATABASE - PRIORIDAD P0

#### Cambio DB-001: Crear Seed de School Default
**Archivo a crear:** `apps/database/seeds/prod/social_features/00-schools-default.sql`

**Contenido:**
```sql
-- School Default: "Sistema - Por Asignar"
-- UUID: 99999999-9999-9999-9999-999999999999
-- Código: SYSTEM-UNASSIGNED
-- Propósito: Escuela de sistema para usuarios pendientes de asignación
```

**Campos requeridos (según DDL social_features.schools):**
- id: `99999999-9999-9999-9999-999999999999`
- tenant_id: (variable, obtener de GAMILIT Platform)
- name: "Sistema - Por Asignar"
- code: "SYSTEM-UNASSIGNED"
- short_name: "Sistema"
- description: "Escuela de sistema para asignación pendiente"
- is_active: true
- metadata: `{"is_system": true, "is_default": true}`

#### Cambio DB-002: Actualizar Classroom Default
**Archivo:** `apps/database/seeds/prod/social_features/02-classrooms.sql`

**Acción:** Modificar el classroom default para apuntar a la nueva School Default
- school_id: Cambiar de `50000000-0000-0000-0000-000000000001` (Marie Curie) a `99999999-9999-9999-9999-999999999999` (System)

#### Cambio DB-003: Asignar School a Admin
**Archivo a crear:** `apps/database/seeds/prod/auth_management/08-assign-admin-schools.sql`

**Contenido:**
```sql
-- Asignar escuela default a usuarios admin
UPDATE auth_management.profiles
SET school_id = '99999999-9999-9999-9999-999999999999'
WHERE role IN ('admin_teacher', 'super_admin')
  AND school_id IS NULL;
```

#### Cambio DB-004: Actualizar last_sign_in_at en Seeds (OPCIONAL)
**Archivos:** `apps/database/seeds/prod/auth/01-demo-users.sql`

**Acción:** Agregar valor default para `last_sign_in_at`
```sql
-- Para usuarios demo, establecer last_sign_in_at = created_at
-- Esto evita que muestren "Nunca" en el portal admin
last_sign_in_at = gamilit.now_mexico()
```

**Nota:** Este cambio es cosmético para demo. En producción real, los usuarios harán login.

---

### 2.2 CAPA BACKEND - SIN CAMBIOS REQUERIDOS

El análisis profundo confirmó que:
- ✅ `AuthService.register()` implementado correctamente
- ✅ `AuthService.login()` implementado correctamente
- ✅ `last_sign_in_at` se actualiza en ambos métodos
- ✅ `AdminUsersService.listUsers()` retorna el campo correctamente

**NO SE REQUIEREN CAMBIOS EN BACKEND**

---

### 2.3 CAPA FRONTEND - SIN CAMBIOS REQUERIDOS

El análisis profundo confirmó que:
- ✅ `transformUser()` mapea `last_sign_in_at → lastLogin` correctamente
- ✅ `useUserManagement` procesa el campo correctamente
- ✅ `AdminUsersPage` renderiza "Nunca" solo cuando el valor es NULL (esperado)

**NO SE REQUIEREN CAMBIOS EN FRONTEND**

---

## 3. ORDEN DE IMPLEMENTACIÓN

```
FASE 1: Database Seeds (15 min)
├─ 1.1 Crear 00-schools-default.sql (School Default)
├─ 1.2 Actualizar 02-classrooms.sql (Classroom apunta a School Default)
├─ 1.3 Crear 08-assign-admin-schools.sql (Admin → School Default)
└─ 1.4 (Opcional) Actualizar 01-demo-users.sql (last_sign_in_at)

FASE 2: Validación (10 min)
├─ 2.1 Ejecutar drop-and-recreate-database.sh
├─ 2.2 Verificar escuela default creada
├─ 2.3 Verificar admin tiene school_id asignado
├─ 2.4 Verificar classroom default apunta a school default
└─ 2.5 Verificar último acceso en admin/users

FASE 3: Documentación (5 min)
├─ 3.1 Actualizar DATABASE_INVENTORY.yml
├─ 3.2 Actualizar SEEDS_INVENTORY.yml
└─ 3.3 Agregar entrada a CHANGELOG.md
```

---

## 4. ARCHIVOS A CREAR/MODIFICAR

### Crear (3 archivos):
| Archivo | Prioridad | Descripción |
|---------|-----------|-------------|
| `seeds/prod/social_features/00-schools-default.sql` | P0 | School Default |
| `seeds/dev/social_features/00-schools-default.sql` | P0 | (copia para dev) |
| `seeds/prod/auth_management/08-assign-admin-schools.sql` | P0 | Asignar admin |

### Modificar (2 archivos):
| Archivo | Prioridad | Cambio |
|---------|-----------|--------|
| `seeds/prod/social_features/02-classrooms.sql` | P0 | school_id del classroom default |
| `apps/database/create-database.sh` | P1 | Agregar nuevo seed en orden |

---

## 5. DEPENDENCIAS IDENTIFICADAS

### Orden de Ejecución de Seeds:
```
1. auth_management/01-tenants.sql        (tenant_id)
2. social_features/00-schools-default.sql (school default) ← NUEVO
3. social_features/01-schools.sql        (escuelas demo)
4. social_features/02-classrooms.sql     (classrooms)
5. auth/01-demo-users.sql                (usuarios)
6. auth_management/04-profiles-complete.sql (profiles)
7. auth_management/08-assign-admin-schools.sql ← NUEVO
8. social_features/03-classroom-members.sql (membresías)
```

### FKs Involucradas:
- `profiles.school_id → schools.id` (FK diferida, Fase 9.5)
- `classrooms.school_id → schools.id`
- `classrooms.teacher_id → profiles.id`

---

## 6. VALIDACIÓN POST-IMPLEMENTACIÓN

### Queries de Verificación:
```sql
-- 1. Verificar School Default existe
SELECT * FROM social_features.schools WHERE code = 'SYSTEM-UNASSIGNED';

-- 2. Verificar Classroom Default apunta a School Default
SELECT c.name, c.code, s.name as school_name
FROM social_features.classrooms c
JOIN social_features.schools s ON c.school_id = s.id
WHERE c.code = 'DEFAULT';

-- 3. Verificar Admin tiene school_id
SELECT email, role, school_id
FROM auth_management.profiles
WHERE role IN ('admin_teacher', 'super_admin');

-- 4. Verificar último acceso de usuarios demo
SELECT email, last_sign_in_at
FROM auth.users
WHERE email LIKE '%@gamilit.com';
```

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Orden incorrecto de seeds | FK violation | Validar con drop-and-recreate completo |
| Classroom default sin school | Estudiantes huérfanos | Verificar FK antes de cambio |
| Scripts no idempotentes | Error en re-ejecución | Usar ON CONFLICT DO UPDATE |

---

## 8. SIGUIENTE PASO

**FASE 4: Validación de Planeación**
- Verificar que no falten objetos dependientes
- Confirmar orden de seeds en create-database.sh
- Validar estructura de School Default contra DDL

---

**Fin del Plan de Implementación - FASE 3**
*Documento generado por Tech-Leader - 2025-12-15*
