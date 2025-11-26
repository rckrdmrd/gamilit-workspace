# User Type Expansion - Quick Reference

**Actualizado**: 2025-11-26
**Archivo**: `apps/frontend/src/features/auth/types/auth.types.ts`

---

## ✅ 7 Campos Agregados

```typescript
// PERFIL
avatar_url?: string;           // URL de imagen de perfil
status?: string;               // Estado: active/inactive/suspended
phone?: string;                // Teléfono de contacto

// ADMINISTRACIÓN
is_super_admin?: boolean;      // Flag de super admin
banned_until?: string;         // Timestamp de expiración de ban

// VERIFICACIÓN
email_confirmed_at?: string;   // Timestamp de confirmación de email
last_sign_in_at?: string;      // Timestamp de último login
```

---

## 📊 Comparación Rápida

| Aspecto | ANTES | DESPUÉS | Cambio |
|---------|-------|---------|--------|
| **Total campos** | 12 | 19 | +7 |
| **Campos perfil** | 0 | 3 | +3 |
| **Campos admin** | 0 | 2 | +2 |
| **Campos verificación** | 1 | 3 | +2 |
| **UserExtended campos** | 7 | 2 | -5 |

---

## 🔄 User vs Profile

### User (Auth-focused)
```typescript
✅ Usar para: Login, Sessions, Auth checks
📍 Tabla: auth.users
🎯 Propósito: Autenticación y roles
```

### Profile (Rich data)
```typescript
✅ Usar para: Settings, Profile pages, Academic info
📍 Tabla: auth_management.profiles
🎯 Propósito: Información completa de usuario
```

### Campos Compartidos (Intencional)
- `avatar_url` - Performance (evita fetch adicional)
- `phone` - Seguridad (2FA en auth, contacto en profile)
- `status` - Control (auth verifica, profile gestiona)
- `email` - Identidad (campo principal)

---

## 🛠️ Type Guards Recomendados

```typescript
// ¿Usuario baneado?
export function isUserBanned(user: User): boolean {
  return !!user.banned_until && new Date(user.banned_until) > new Date();
}

// ¿Email confirmado?
export function isEmailConfirmed(user: User): boolean {
  return !!user.email_confirmed_at;
}

// ¿Super admin?
export function isSuperAdmin(user: User): boolean {
  return user.is_super_admin === true;
}

// ¿Usuario activo?
export function isUserActive(user: User): boolean {
  return user.status === 'active' && !isUserBanned(user);
}
```

---

## 📝 Uso Ejemplo

### Antes
```typescript
const user: User = {
  id: 'uuid',
  email: 'user@example.com',
  role: 'student',
  emailVerified: false, // Campo derivado
};
```

### Después
```typescript
const user: User = {
  id: 'uuid',
  email: 'user@example.com',
  role: 'student',

  // NUEVOS CAMPOS
  avatar_url: 'https://cdn.example.com/avatar.jpg',
  status: 'active',
  phone: '+1234567890',
  is_super_admin: false,
  banned_until: null,
  email_confirmed_at: '2025-11-26T10:00:00Z',
  last_sign_in_at: '2025-11-26T10:00:00Z',

  // Campo derivado (sigue existiendo)
  emailVerified: true,
};
```

---

## ✅ Validación

### TypeScript Compilation
```bash
npx tsc --noEmit
# ✅ Sin errores
```

### Breaking Changes
```
🟢 NINGUNO - Todos los campos son opcionales
```

### Compatibilidad
```
✅ Backend → Frontend: Completa
✅ Código Existente: Sin cambios requeridos
✅ Tests: Pasan sin modificaciones
```

---

## 📍 Mapeo Backend → Frontend

| Backend Field | Frontend Field | Tipo Backend | Tipo Frontend |
|---------------|----------------|--------------|---------------|
| `avatar_url` | `avatar_url` | `text?` | `string?` |
| `status` | `status` | `varchar(50)` | `string?` |
| `phone` | `phone` | `text?` | `string?` |
| `is_super_admin` | `is_super_admin` | `boolean` | `boolean?` |
| `banned_until` | `banned_until` | `timestamptz?` | `string?` |
| `email_confirmed_at` | `email_confirmed_at` | `timestamptz?` | `string?` |
| `last_sign_in_at` | `last_sign_in_at` | `timestamptz?` | `string?` |

---

## 🎯 Status del Proyecto

```
Estado: ✅ COMPLETADO
Validación: ✅ EXITOSA
Breaking Changes: 🟢 NINGUNO
Compatibilidad: ✅ 100%
Tests: ✅ PASAN
Documentación: ✅ ACTUALIZADA
```

---

## 📚 Referencias Rápidas

```
Frontend Type:
  apps/frontend/src/features/auth/types/auth.types.ts

Backend Entity:
  apps/backend/src/modules/auth/entities/user.entity.ts

Backend DTO:
  apps/backend/src/modules/auth/dto/user-response.dto.ts

Database DDL:
  apps/database/ddl/schemas/auth/tables/01-users.sql
```

---

## 🚀 Próximos Pasos (Opcional)

1. ✅ Implementar type guards sugeridos
2. ✅ Crear UserStatus enum si se prefiere type safety
3. ✅ Documentar qué endpoints devuelven qué campos
4. ✅ Agregar tests para nuevos campos
5. ✅ Actualizar mocks con nuevos campos

---

**Fin del Quick Reference**
