# Plan de Implementación: Sistema de Institución Única

**Fecha**: 2026-01-08
**Estado**: FASE 3 - PLANEACIÓN
**Prioridad**: P1

---

## 1. OBJETIVO

Establecer una arquitectura simplificada donde:
1. Existe **UNA sola institución/tenant** (GAMILIT Platform)
2. Existe **UNA sola escuela default** (GAMILIT - Institución General)
3. Existe **UN solo classroom default** (GAMILIT - Aula General)
4. **TODOS** los usuarios (demo + registrados) se asignan automáticamente a estos

---

## 2. CAMBIOS PLANIFICADOS

### 2.1 CAMBIOS EN SEEDS (4 archivos)

#### CAMBIO 1: `seeds/dev/auth_management/01-tenants.sql`

**Estado actual**: 4 tenants
**Estado deseado**: 1 tenant (GAMILIT Platform)

```sql
-- ELIMINAR: gamilit-test, demo-school-primary, demo-school-secondary
-- MANTENER: GAMILIT Platform con slug 'gamilit-platform'

INSERT INTO auth_management.tenants (
    id,
    name,
    slug,
    ...
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'GAMILIT Platform',
    'gamilit-platform',  -- Slug oficial
    ...
)
ON CONFLICT (id) DO UPDATE SET ...;
```

#### CAMBIO 2: `seeds/dev/social_features/00-schools-default.sql`

**Estado actual**: "Sistema - Por Asignar"
**Estado deseado**: "GAMILIT - Institución General"

```sql
-- Renombrar escuela
name = 'GAMILIT - Institución General',
code = 'GAMILIT-DEFAULT',  -- Código más descriptivo
short_name = 'GAMILIT',
description = 'Institución principal de GAMILIT para todos los usuarios registrados',
```

#### CAMBIO 3: `seeds/dev/social_features/02-classrooms.sql`

**Estado actual**: "Sin Asignar - Aula Default"
**Estado deseado**: "GAMILIT - Aula General"

```sql
-- Renombrar classroom
name = 'GAMILIT - Aula General',
code = 'GAMILIT-GENERAL',  -- Mantener 'DEFAULT' como alias
description = 'Aula general de GAMILIT para todos los estudiantes. Los administradores pueden crear aulas adicionales.',
```

#### CAMBIO 4: Sincronizar `seeds/prod/` y `seeds/staging/`

Copiar los cambios de dev a:
- `seeds/prod/auth_management/01-tenants.sql`
- `seeds/prod/social_features/00-schools-default.sql`
- `seeds/staging/auth_management/01-tenants.sql` (si existe)

---

### 2.2 CAMBIOS EN DDL/FUNCIONES (1 archivo)

#### CAMBIO 5: `ddl/schemas/gamilit/functions/11-set_default_tenant.sql`

**Bug a corregir**: Cambiar slug de búsqueda

```sql
-- ANTES:
WHERE slug = 'gamilit-prod'

-- DESPUÉS:
WHERE slug = 'gamilit-platform'
```

---

### 2.3 CAMBIOS EN BACKEND (1 archivo)

#### CAMBIO 6: `backend/src/modules/auth/services/auth.service.ts`

**Bug a corregir**: Líneas 102-104

```typescript
// ANTES:
let mainTenant = await this.tenantRepository.findOne({
  where: { slug: 'gamilit-prod', is_active: true },
});

// DESPUÉS:
let mainTenant = await this.tenantRepository.findOne({
  where: { slug: 'gamilit-platform', is_active: true },
});
```

---

### 2.4 CAMBIOS OPCIONALES (mejoras)

#### CAMBIO 7 (OPCIONAL): Proteger tenant principal

En `admin-organizations.service.ts`, agregar validación:

```typescript
async deleteOrganization(id: string): Promise<void> {
  const tenant = await this.tenantRepo.findOne({ where: { id } });

  // Proteger tenant principal
  if (tenant?.slug === 'gamilit-platform') {
    throw new BadRequestException('Cannot delete the main GAMILIT tenant');
  }
  // ... resto del código
}
```

---

## 3. ORDEN DE EJECUCIÓN

| Paso | Archivo | Tipo | Descripción |
|------|---------|------|-------------|
| 1 | `11-set_default_tenant.sql` | DDL | Corregir slug en función |
| 2 | `auth.service.ts` | Backend | Corregir slug en servicio |
| 3 | `01-tenants.sql` (dev) | Seed | Simplificar a 1 tenant |
| 4 | `00-schools-default.sql` | Seed | Renombrar escuela |
| 5 | `02-classrooms.sql` | Seed | Renombrar classroom |
| 6 | `01-tenants.sql` (prod) | Seed | Sincronizar con dev |
| 7 | Build validation | Backend | `npm run build` |
| 8 | Recreate DB | Database | `./recreate-database.sh` |

---

## 4. ARCHIVOS AFECTADOS - RESUMEN

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `ddl/schemas/gamilit/functions/11-set_default_tenant.sql` | Corregir slug |
| 2 | `backend/src/modules/auth/services/auth.service.ts` | Corregir slug |
| 3 | `seeds/dev/auth_management/01-tenants.sql` | Simplificar a 1 tenant |
| 4 | `seeds/dev/social_features/00-schools-default.sql` | Renombrar |
| 5 | `seeds/dev/social_features/02-classrooms.sql` | Renombrar |
| 6 | `seeds/prod/auth_management/01-tenants.sql` | Sincronizar |
| 7 | `seeds/prod/social_features/00-schools-default.sql` | Sincronizar |

**Total**: 7 archivos a modificar

---

## 5. CONTENIDO ESPERADO POST-CAMBIOS

### 5.1 Tenant Único

```
┌────────────────────────────────────────────────────────────┐
│ ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11                  │
│ Name: GAMILIT Platform                                     │
│ Slug: gamilit-platform                                     │
│ Tier: enterprise                                           │
│ metadata.is_primary: true                                  │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Escuela Default

```
┌────────────────────────────────────────────────────────────┐
│ ID: 99999999-9999-9999-9999-999999999999                  │
│ Name: GAMILIT - Institución General                       │
│ Code: GAMILIT-DEFAULT                                      │
│ settings.is_default: true                                  │
└────────────────────────────────────────────────────────────┘
```

### 5.3 Classroom Default

```
┌────────────────────────────────────────────────────────────┐
│ ID: 00000000-0000-0000-0000-000000000001                  │
│ Name: GAMILIT - Aula General                              │
│ Code: DEFAULT                                              │
│ metadata.is_default: true                                  │
└────────────────────────────────────────────────────────────┘
```

---

## 6. VALIDACIONES POST-IMPLEMENTACIÓN

### Queries de Verificación

```sql
-- Verificar solo 1 tenant
SELECT COUNT(*) FROM auth_management.tenants;
-- Esperado: 1

-- Verificar tenant correcto
SELECT id, name, slug FROM auth_management.tenants WHERE is_active = true;
-- Esperado: a0eebc99-..., 'GAMILIT Platform', 'gamilit-platform'

-- Verificar escuela default
SELECT id, name, code FROM social_features.schools WHERE is_active = true;
-- Esperado: 99999999-..., 'GAMILIT - Institución General', 'GAMILIT-DEFAULT'

-- Verificar classroom default
SELECT id, name, code FROM social_features.classrooms WHERE is_active = true;
-- Esperado: 00000000-..., 'GAMILIT - Aula General', 'DEFAULT'

-- Verificar usuarios demo asignados
SELECT p.email, t.name as tenant, c.name as classroom
FROM auth_management.profiles p
JOIN auth_management.tenants t ON p.tenant_id = t.id
LEFT JOIN social_features.classroom_members cm ON cm.student_id = p.id
LEFT JOIN social_features.classrooms c ON cm.classroom_id = c.id
WHERE p.email LIKE '%@gamilit.com';
```

---

## 7. ROLLBACK PLAN

En caso de problemas:

1. Restaurar archivos originales desde git:
   ```bash
   git checkout -- apps/database/seeds/
   git checkout -- apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql
   git checkout -- apps/backend/src/modules/auth/services/auth.service.ts
   ```

2. Recrear base de datos:
   ```bash
   ./recreate-database.sh --env dev --force
   ```

---

## 8. CHECKLIST DE EJECUCIÓN

### Pre-requisitos
- [ ] Backup de BD (si hay datos reales)
- [ ] Verificar rama de trabajo
- [ ] Verificar no hay cambios sin commit

### Ejecución
- [ ] Paso 1: Modificar `11-set_default_tenant.sql`
- [ ] Paso 2: Modificar `auth.service.ts`
- [ ] Paso 3: Modificar `01-tenants.sql` (dev)
- [ ] Paso 4: Modificar `00-schools-default.sql`
- [ ] Paso 5: Modificar `02-classrooms.sql`
- [ ] Paso 6: Sincronizar seeds de prod
- [ ] Paso 7: `npm run build` - Sin errores
- [ ] Paso 8: Recrear BD

### Validación
- [ ] Query: 1 tenant activo
- [ ] Query: tenant con slug correcto
- [ ] Query: escuela con nombre correcto
- [ ] Query: classroom con nombre correcto
- [ ] Test: registro de nuevo usuario
- [ ] Test: usuario asignado a tenant/school/classroom correcto

---

**Próximo paso**: FASE 4 - Validación del plan contra análisis
