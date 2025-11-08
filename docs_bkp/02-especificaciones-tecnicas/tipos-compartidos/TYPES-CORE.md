# Tipos Compartidos - Core

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Core (User, Profile, Session, Role)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene los tipos fundamentales del sistema, incluyendo:
- **User**: Entidad principal de usuario del sistema de autenticación
- **UserProfile**: Perfil extendido del usuario con información personal
- **AuthUser**: Usuario autenticado para contexto de request
- **UserRole**: Roles y permisos del sistema
- **Session**: Información de sesiones de usuario

---

### 6.1 Core Types

#### 6.1.1 User

**Description**: Core user entity from auth.users table

**TypeScript Definition**:
```typescript
interface User {
  id: string;
  email: string;
  encrypted_password: string;
  role: UserRole;
  raw_user_meta_data?: any;
  created_at: Date;
  updated_at: Date;
  last_sign_in_at?: Date;
  email_confirmed_at?: Date;
  confirmation_token?: string;
  confirmation_sent_at?: Date;
  recovery_token?: string;
  recovery_sent_at?: Date;
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: Date;
  phone?: string;
  phone_confirmed_at?: Date;
  phone_change?: string;
  phone_change_token?: string;
  phone_change_sent_at?: Date;
  reauthentication_token?: string;
  reauthentication_sent_at?: Date;
  is_sso_user: boolean;
  deleted_at?: Date;
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  encrypted_password: z.string(),
  role: z.enum(['student', 'admin_teacher', 'super_admin']),
  raw_user_meta_data: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  last_sign_in_at: z.date().optional(),
  email_confirmed_at: z.date().optional(),
  confirmation_token: z.string().optional(),
  confirmation_sent_at: z.date().optional(),
  recovery_token: z.string().optional(),
  recovery_sent_at: z.date().optional(),
  email_change_token_new: z.string().optional(),
  email_change: z.string().optional(),
  email_change_sent_at: z.date().optional(),
  phone: z.string().optional(),
  phone_confirmed_at: z.date().optional(),
  phone_change: z.string().optional(),
  phone_change_token: z.string().optional(),
  phone_change_sent_at: z.date().optional(),
  reauthentication_token: z.string().optional(),
  reauthentication_sent_at: z.date().optional(),
  is_sso_user: z.boolean(),
  deleted_at: z.date().optional(),
});
```

**Type Guard**:
```typescript
function isUser(value: unknown): value is User {
  return userSchema.safeParse(value).success;
}
```

**Example Data**:
```typescript
const exampleUser: User = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'estudiante@glit.com',
  encrypted_password: '$2b$10$...',
  role: 'student',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15'),
  last_sign_in_at: new Date('2025-01-15'),
  email_confirmed_at: new Date('2025-01-01'),
  is_sso_user: false
};
```

**Backend Usage**:
```typescript
import { User } from '@glit/shared-types';

async function getUserById(id: string): Promise<User> {
  const result = await db.query('SELECT * FROM auth.users WHERE id = $1', [id]);
  return result.rows[0];
}
```

**Frontend Usage**:
```typescript
import { User } from '@glit/shared-types';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({ user: null, isLoading: true });
```

---

#### 6.1.2 UserProfile

**Description**: User profile data from auth_management.profiles table

**TypeScript Definition**:
```typescript
interface UserProfile {
  id: string;
  user_id: string;
  tenant_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  student_id?: string;
  grade_level?: string;
  school_id?: string;
  is_active: boolean;
  preferences?: any;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const userProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  school_id: z.string().uuid().optional(),
  is_active: z.boolean(),
  preferences: z.any().optional(),
  metadata: z.any().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});
```

**Example Data**:
```typescript
const exampleProfile: UserProfile = {
  id: 'profile-123',
  user_id: 'user-456',
  full_name: 'María García López',
  first_name: 'María',
  last_name: 'García López',
  display_name: 'María G.',
  avatar_url: 'https://cdn.glit.com/avatars/maria.jpg',
  bio: 'Estudiante apasionada por la lectura',
  student_id: 'EST-2025-001',
  grade_level: '9',
  is_active: true,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15')
};
```

---

#### 6.1.3 AuthUser

**Description**: Authenticated user object stored in request

**TypeScript Definition**:
```typescript
interface AuthUser {
  id: string;
  email: string;
  role: string;
  rank?: string;
  tenant_id?: string;
}
```

**Zod Schema**:
```typescript
const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  rank: z.string().optional(),
  tenant_id: z.string().uuid().optional(),
});
```

**Backend Usage**:
```typescript
import { Request } from 'express';
import { AuthUser } from '@glit/shared-types';

interface AuthRequest extends Request {
  user?: AuthUser;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract token and populate req.user
  req.user = {
    id: decodedToken.sub,
    email: decodedToken.email,
    role: decodedToken.role
  };
  next();
};
```

---

#### 6.1.4 UserRole

**Description**: User role enumeration

**TypeScript Definition**:
```typescript
type UserRole = 'student' | 'admin_teacher' | 'super_admin';

enum UserRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}
```

**Zod Schema**:
```typescript
const userRoleSchema = z.enum(['student', 'admin_teacher', 'super_admin']);
```

**Example Usage**:
```typescript
function hasPermission(role: UserRole, action: string): boolean {
  const permissions = {
    student: ['read:own_profile', 'update:own_profile'],
    admin_teacher: ['read:classroom', 'update:classroom', 'grade:assignment'],
    super_admin: ['*']
  };

  return permissions[role]?.includes(action) || permissions[role]?.includes('*');
}
```

---

#### 6.1.5 Session

**Description**: User session information

**TypeScript Definition**:
```typescript
interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  last_activity_at: Date;
  is_active: boolean;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location?: string;
}
```

**Zod Schema**:
```typescript
const deviceInfoSchema = z.object({
  type: z.enum(['desktop', 'mobile', 'tablet']),
  browser: z.string(),
  os: z.string(),
  location: z.string().optional(),
});

const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string(),
  refresh_token: z.string().optional(),
  device_info: deviceInfoSchema.optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  expires_at: z.date(),
  created_at: z.date(),
  last_activity_at: z.date(),
  is_active: z.boolean(),
});
```

---

