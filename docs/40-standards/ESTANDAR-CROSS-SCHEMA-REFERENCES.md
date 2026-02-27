---
titulo: Estandar - Referencias Cross-Schema
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-17
ultima_actualizacion: 2026-02-27
---

# Estandar: Referencias Cross-Schema

**Version:** 1.0.0
**Fecha:** 2026-02-17
**Aplica a:** Todo agente que trabaje con entidades, DDL, o seeds que crucen schemas

## 1. Foreign Keys a Usuarios

**Regla:** Casi TODAS las FKs de `user_id` referencian `auth_management.profiles(id)`, NO `auth.users(id)`.

| Columna FK | Tabla Destino | Excepcion |
|-----------|--------------|-----------|
| user_id (general) | `auth_management.profiles(id)` | Regla por defecto |
| user_id (security_events) | `auth.users(id)` | Unica excepcion documentada |

**Razon:** `auth.users` es la tabla base de autenticacion. `auth_management.profiles` es la tabla de perfil con `tenant_id`, `display_name`, etc. El modelo de negocio opera sobre profiles.

---

## 2. Entities Cross-Datasource (TypeORM)

**Regla:** Cualquier datasource con entities que tengan `@ManyToOne` a `Profile` o `Tenant` DEBE registrar esas entities explicitamente en su datasource config.

**Ejemplo en `app.module.ts`:**
```typescript
TypeOrmModule.forRoot({
  name: 'gamification',
  entities: [
    ...gamificationEntities,
    Profile,  // <-- REQUERIDO si alguna entity tiene @ManyToOne(() => Profile)
    Tenant,   // <-- REQUERIDO si alguna entity tiene @ManyToOne(() => Tenant)
  ],
})
```

**Datasources que YA registran Profile/Tenant:** auth, gamification, progress, social, audit, lti.

**Patron de verificacion:** Antes de agregar `@ManyToOne(() => Profile)` a una entity, verificar que el datasource de esa entity ya tiene Profile registrado.

---

## 3. Funciones RLS Cross-Schema

**Regla:** Para policies RLS que necesitan identificar al usuario actual, usar funciones del schema `gamilit`:

| Funcion | Uso |
|---------|-----|
| `gamilit.get_current_user_id()` | Obtener UUID del usuario actual |
| `gamilit.is_admin()` | Verificar si es admin_teacher |
| `gamilit.is_super_admin()` | Verificar si es super_admin |

**NUNCA usar:**
- `auth.uid()` directamente en policies (legacy, migrar a gamilit.*)
- `current_setting('app.current_user_id', true)::uuid` directamente (encapsulado en `gamilit.get_current_user_id()`)

---

## 4. Patron de Lookup en Seeds

Para seeds que necesitan referenciar usuarios por email:

```sql
-- Patron CORRECTO: lookup dinamico via profile
SELECT p.id FROM auth.users u
JOIN auth_management.profiles p ON p.user_id = u.id
WHERE u.email = 'admin@demo.glit.edu.mx'
```

Para tenant_id:
```sql
-- Patron CORRECTO: lookup dinamico de tenant
SELECT id FROM auth_management.tenants WHERE slug = 'demo'
```

**NUNCA usar UUIDs hardcodeados** en seeds, ya que cambian entre recreaciones de BD.

---

## 5. Verificacion Pre-Commit

Antes de hacer commit de archivos que crucen schemas, verificar:

1. FKs apuntan a `profiles(id)` (no `users(id)`) excepto `security_events`
2. Entities con `@ManyToOne` a Profile/Tenant tienen su datasource configurado
3. Policies RLS usan `gamilit.*` functions (no `auth.uid()`)
4. Seeds usan lookup dinamico (no UUIDs hardcodeados)

---

*Estandar creado a partir de hallazgos H-DB-02, FIX-ECONN-001/002, HM-002*
