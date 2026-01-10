# Análisis Detallado: Sistema de Institución Única

**Fecha**: 2026-01-08
**Estado**: FASE 2 COMPLETADA
**Tipo**: Análisis de Arquitectura

---

## 1. RESUMEN EJECUTIVO

### Objetivo
Simplificar el sistema para que exista una sola institución genérica donde todos los usuarios (demo y registrados) estén ligados por defecto, incluyendo una clase default.

### Estado Actual
- **4 tenants** en desarrollo (seeds)
- **1 escuela default** (SYSTEM-UNASSIGNED)
- **1 classroom default** (DEFAULT)
- **BUG DETECTADO**: El trigger busca `gamilit-prod` pero el seed crea `gamilit-platform`

---

## 2. INVENTARIO DE ARCHIVOS ANALIZADOS

### 2.1 Archivos de Seeds (Tenants/Instituciones)

| # | Archivo | Contenido Actual | Acción Requerida |
|---|---------|------------------|------------------|
| 1 | `seeds/dev/auth_management/01-tenants.sql` | 4 tenants: gamilit-test, demo-school-primary, demo-school-secondary, gamilit-platform | **MODIFICAR**: Reducir a 1 tenant |
| 2 | `seeds/prod/auth_management/01-tenants.sql` | Similar a dev | **MODIFICAR**: Sincronizar con dev |
| 3 | `seeds/staging/auth_management/01-tenants.sql` | Similar a dev | **MODIFICAR**: Sincronizar con dev |

### 2.2 Archivos de Triggers y Funciones

| # | Archivo | Contenido Actual | Acción Requerida |
|---|---------|------------------|------------------|
| 4 | `ddl/schemas/auth_management/triggers/01-trg_set_default_tenant.sql` | BEFORE INSERT en profiles | **VERIFICAR**: Sin cambios |
| 5 | `ddl/schemas/gamilit/functions/11-set_default_tenant.sql` | Busca: 1) gamilit-prod, 2) GAMILIT Platform, 3) primer tenant | **MODIFICAR**: Corregir slug a `gamilit-platform` |
| 6 | `ddl/schemas/auth_management/triggers/08-trg_assign_default_classroom.sql` | AFTER INSERT asigna classroom default | **VERIFICAR**: Sin cambios |
| 7 | `ddl/schemas/gamilit/functions/15-assign_default_classroom.sql` | Busca metadata->>'is_default'='true' o code='DEFAULT' | **VERIFICAR**: Sin cambios |

### 2.3 Archivos de Schools y Classrooms

| # | Archivo | Contenido Actual | Acción Requerida |
|---|---------|------------------|------------------|
| 8 | `seeds/dev/social_features/00-schools-default.sql` | 1 escuela: "Sistema - Por Asignar" (SYSTEM-UNASSIGNED) | **MODIFICAR**: Renombrar a "GAMILIT - Institución Principal" |
| 9 | `seeds/dev/social_features/01-schools.sql` | Vacío (solo verificación) | Sin cambios |
| 10 | `seeds/dev/social_features/02-classrooms.sql` | 1 classroom: "Sin Asignar - Aula Default" (DEFAULT) | **MODIFICAR**: Renombrar a "GAMILIT - Aula General" |

### 2.4 Backend Services

| # | Archivo | Contenido Actual | Acción Requerida |
|---|---------|------------------|------------------|
| 11 | `backend/src/modules/auth/services/auth.service.ts` | Busca tenant por slug `gamilit-prod` | **MODIFICAR**: Cambiar a `gamilit-platform` |
| 12 | `backend/src/modules/admin/services/admin-organizations.service.ts` | CRUD de tenants | **OPCIONAL**: Agregar validación para no eliminar tenant principal |

### 2.5 Archivos de Seeds de Demo Users

| # | Archivo | Contenido Actual | Acción Requerida |
|---|---------|------------------|------------------|
| 13 | `seeds/dev/auth/01-demo-users.sql` | 3 usuarios demo | **VERIFICAR**: Usar tenant correcto |
| 14 | `seeds/dev/auth_management/03-profiles.sql` | Profiles de demo | **VERIFICAR**: Usar tenant correcto |

---

## 3. ANÁLISIS DETALLADO POR ARCHIVO

### 3.1 `01-tenants.sql` - Estado Actual

```sql
-- TENANT 1: gamilit-test (ID: 00000000-0000-0000-0000-000000000001)
-- TENANT 2: demo-school-primary (ID: 00000000-0000-0000-0000-000000000002)
-- TENANT 3: demo-school-secondary (ID: 00000000-0000-0000-0000-000000000003)
-- TENANT 4: gamilit-platform (ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11) ← PRINCIPAL
```

**Problema**: Múltiples tenants causan confusión y el trigger no encuentra el correcto.

**Solución**: Mantener SOLO el tenant principal con UUID conocido.

### 3.2 `11-set_default_tenant.sql` - BUG DETECTADO

```sql
-- Paso 1: Intentar obtener el tenant principal de GAMILIT por slug
SELECT id INTO v_main_tenant_id
FROM auth_management.tenants
WHERE slug = 'gamilit-prod'  -- ❌ NO EXISTE EN SEEDS
  AND is_active = true
LIMIT 1;

-- Paso 2: Si no existe, buscar por nombre
SELECT id INTO v_main_tenant_id
FROM auth_management.tenants
WHERE name = 'GAMILIT Platform'  -- ✅ EXISTE
  AND is_active = true
LIMIT 1;
```

**Bug**: El slug `gamilit-prod` no existe, siempre cae en fallback (Paso 2).

**Solución**: Cambiar `gamilit-prod` → `gamilit-platform` para consistencia.

### 3.3 `auth.service.ts` - Mismo Bug

```typescript
// Línea 102-104
let mainTenant = await this.tenantRepository.findOne({
  where: { slug: 'gamilit-prod', is_active: true },  // ❌ NO EXISTE
});
```

**Solución**: Cambiar a `gamilit-platform`.

### 3.4 `00-schools-default.sql` - Estado Actual

```sql
-- Escuela: "Sistema - Por Asignar"
-- Código: SYSTEM-UNASSIGNED
-- UUID: 99999999-9999-9999-9999-999999999999
```

**Propuesta**: Renombrar a algo más profesional como "GAMILIT - Institución General".

### 3.5 `02-classrooms.sql` - Estado Actual

```sql
-- Classroom: "Sin Asignar - Aula Default"
-- Código: DEFAULT
-- UUID: 00000000-0000-0000-0000-000000000001
```

**Propuesta**: Renombrar a "GAMILIT - Aula General".

---

## 4. FLUJO DE REGISTRO ACTUAL

```
[Usuario se registra]
        ↓
[auth.service.ts]
    → Busca tenant por slug 'gamilit-prod' (NO EXISTE)
    → Fallback: primer tenant activo (gamilit-test)
    → Crea User + Profile
        ↓
[TRIGGER: trg_set_default_tenant]
    → Busca 'gamilit-prod' (NO EXISTE)
    → Busca 'GAMILIT Platform' (EXISTE)
    → Asigna tenant_id
        ↓
[TRIGGER: trg_initialize_user_stats]
    → Crea gamificación (100 ML Coins, ranks, etc.)
        ↓
[TRIGGER: trg_assign_default_classroom]
    → Busca classroom con is_default=true
    → Asigna a classroom DEFAULT
```

**Problema en el flujo**: El auth.service asigna tenant ANTES del trigger, causando potencial inconsistencia.

---

## 5. DEPENDENCIAS IDENTIFICADAS

### 5.1 Dependencias de Tenant ID

Los siguientes archivos usan el UUID del tenant principal `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`:

| Archivo | Uso |
|---------|-----|
| `00-schools-default.sql` | Busca tenant por nombre |
| `02-classrooms.sql` | Busca tenant por nombre |
| `03-profiles.sql` | Referencias a tenant |
| Múltiples seeds de gamificación | FK tenant_id |

### 5.2 Dependencias de School ID

El UUID de la escuela default `99999999-9999-9999-9999-999999999999` es usado en:
- `02-classrooms.sql` - FK school_id
- `classroom_members` inserts

### 5.3 Dependencias de Classroom ID

El UUID del classroom default `00000000-0000-0000-0000-000000000001` es usado en:
- `classroom_members` automáticos
- Trigger `assign_default_classroom`

---

## 6. MATRIZ DE IMPACTO

| Cambio | Archivos Afectados | Riesgo | Mitigación |
|--------|-------------------|--------|------------|
| Reducir a 1 tenant | 3 seeds | BAJO | ON CONFLICT maneja existentes |
| Corregir slug | 2 archivos | BAJO | Test de registro |
| Renombrar school | 1 seed | BAJO | ON CONFLICT UPDATE |
| Renombrar classroom | 1 seed | BAJO | ON CONFLICT UPDATE |
| Sincronizar prod/staging | 2 seeds | MEDIO | Validar con recreate-db |

---

## 7. VALIDACIONES REQUERIDAS

### Pre-implementación
- [ ] Backup de base de datos actual (si existe data real)
- [ ] Verificar no hay usuarios reales en otros tenants

### Post-implementación
- [ ] `npm run build` exitoso
- [ ] Recrear base de datos: `./recreate-database.sh --env dev --force`
- [ ] Verificar solo 1 tenant activo
- [ ] Test de registro nuevo usuario
- [ ] Verificar asignación automática a tenant/school/classroom

---

## 8. CONCLUSIONES FASE 2

1. **Bug crítico encontrado**: Slug mismatch entre seeds y código
2. **Simplificación necesaria**: Reducir de 4 tenants a 1
3. **Arquitectura ya preparada**: Los triggers y funciones soportan el modelo propuesto
4. **Cambios mínimos**: Solo seeds y corrección de slug en 2 archivos de código

**Próximo paso**: FASE 3 - Planeación detallada de cambios.
