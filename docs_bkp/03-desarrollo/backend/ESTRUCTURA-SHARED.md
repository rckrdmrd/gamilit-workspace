# Estructura de Código Compartido (Shared)

**Código que mapea:** `apps/backend/src/shared/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta el código compartido utilizado por todos los módulos del backend.

---

## 🗂️ Estructura

| Carpeta | Propósito | Ejemplos |
|---------|-----------|----------|
| **constants/** | Constants SSOT (Single Source of Truth) | database.constants.ts, api-routes.constants.ts |
| **decorators/** | Decoradores personalizados | @Roles(), @Public(), @CurrentUser() |
| **filters/** | Exception filters globales | http-exception.filter.ts, all-exceptions.filter.ts |
| **guards/** | Guards globales | jwt-auth.guard.ts, roles.guard.ts, user-status.guard.ts |
| **interceptors/** | Interceptors globales | logging.interceptor.ts, transform.interceptor.ts |
| **mappers/** | Mappers de datos | entity-to-dto.mapper.ts |
| **middleware/** | Middleware personalizados | logger.middleware.ts, cors.middleware.ts |
| **pipes/** | Validation pipes | validation.pipe.ts |
| **services/** | Servicios compartidos | database.service.ts, config.service.ts |
| **types/** | Tipos TypeScript compartidos | 70+ tipos e interfaces |
| **utils/** | Utilidades generales | date.utils.ts, string.utils.ts |

---

## 🔑 Constants SSOT (Single Source of Truth)

**Path:** `apps/backend/src/shared/constants/`

### database.constants.ts

```typescript
export const DB_SCHEMAS = {
  AUTH: 'auth_management',
  EDUCATIONAL: 'educational_content',
  GAMIFICATION: 'gamification_system',
  // ... 9 schemas total
};

export const DB_TABLES = {
  AUTH: {
    USERS: 'users',
    PROFILES: 'profiles',
    ROLES: 'roles',
  },
  // ... por cada schema
};
```

**Uso obligatorio en código:**
```typescript
// ❌ PROHIBIDO
@Entity({ schema: 'auth_management', name: 'users' })

// ✅ OBLIGATORIO
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.USERS })
```

**Validación:** `npm run validate:constants` detecta 33 patrones de hardcoding

---

## 🎯 Guards Principales

### JwtAuthGuard

**Path:** `apps/backend/src/shared/guards/jwt-auth.guard.ts`

**Propósito:** Validar JWT token

**Uso:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### RolesGuard

**Path:** `apps/backend/src/shared/guards/roles.guard.ts`

**Propósito:** Validar roles de usuario (student, admin_teacher, super_admin)

**Uso:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_teacher', 'super_admin')
@Get('admin-only')
adminEndpoint() {
  // Solo admin_teacher y super_admin
}
```

### UserStatusGuard

**Path:** `apps/backend/src/shared/guards/user-status.guard.ts`

**Propósito:** Validar estado de cuenta (active, inactive, suspended, etc.)

---

## 🎨 Decoradores Personalizados

### @Roles()

```typescript
@Roles('student', 'admin_teacher')
```

### @Public()

```typescript
@Public()  // Endpoint público, sin autenticación
@Get('health')
```

### @CurrentUser()

```typescript
@CurrentUser() user: User  // Obtener usuario actual del token
```

---

## 📚 Referencias

- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md)
- [API-CONVENTIONS.md](./API-CONVENTIONS.md)

---

**Última actualización:** 2025-11-07
