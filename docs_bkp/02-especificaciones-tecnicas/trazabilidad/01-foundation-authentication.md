# Trazabilidad: Foundation & Authentication

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Foundation, Authentication
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa del flujo de autenticacion de usuarios en la plataforma GAMILIT, desde la interfaz de usuario hasta la base de datos PostgreSQL.

**Alcance:** Autenticacion de usuario (Login)

---

## Flujo 1: Autenticacion de Usuario (Login)

**Trigger:** Usuario ingresa credenciales en LoginPage

### Capa de Presentacion (Frontend)
```typescript
// apps/student/pages/login/LoginPage.tsx
const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />;
};
```

### Capa de Estado (Zustand Store)
```typescript
// features/auth/store/authStore.ts
login: async (email, password) => {
  set({ isLoading: true, error: null });

  try {
    const response = await authAPI.login({ email, password });

    set({
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      isAuthenticated: true,
      sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      isLoading: false,
    });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
}
```

### Capa de API (API Client)
```typescript
// services/api/authAPI.ts
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }
};
```

### Capa de Backend (Node.js)
```typescript
// backend/modules/auth/auth.controller.ts
async login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await authService.login(
    email,
    password,
    req.headers['user-agent'],
    req.ip
  );

  res.json({ success: true, data: result });
}
```

### Capa de Servicio (Business Logic)
```typescript
// backend/modules/auth/auth.service.ts
async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
  // 1. Buscar usuario
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Verificar contraseña
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 3. Validar estado
  if (user.status !== 'active') {
    throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');
  }

  // 4. Generar tokens
  const token = this.generateAccessToken(user);
  const refreshToken = this.generateRefreshToken(user);

  // 5. Crear sesion
  await sessionService.createSession(user.id, token, refreshToken, userAgent, ipAddress);

  // 6. Actualizar ultimo login
  await authRepository.updateLastLogin(user.id);

  return {
    user: this.sanitizeUser(user),
    token,
    refreshToken,
    expiresIn: '7d'
  };
}
```

### Capa de Repositorio (Data Access)
```typescript
// backend/modules/auth/auth.repository.ts
async findByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT
      id, email, password_hash, full_name, role, status,
      avatar_url, created_at, updated_at
    FROM auth_management.profiles
    WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  return result.rows[0] || null;
}
```

### Capa de Base de Datos (PostgreSQL)
```sql
-- auth_management.profiles table
SELECT
  id,                 -- UUID
  email,              -- TEXT
  password_hash,      -- TEXT (bcrypt)
  full_name,          -- TEXT
  role,               -- gamilit_role ENUM
  status,             -- user_status ENUM
  avatar_url,         -- TEXT
  created_at,         -- TIMESTAMPTZ
  updated_at          -- TIMESTAMPTZ
FROM auth_management.profiles
WHERE email = $1 AND deleted_at IS NULL;
```

### Diagrama de Secuencia
```
Usuario → LoginPage → authStore → authAPI → Backend Controller → AuthService → AuthRepository → PostgreSQL
                                                                                                    ↓
Usuario ← LoginPage ← authStore ← authAPI ← Backend Controller ← AuthService ← AuthRepository ← Query Result
```

---

## Tipos de Datos

### Frontend Types
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: string;
}
```

### Backend Types
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: GamilitRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 02-educational-mechanics.md, 06-teacher-classroom.md
- **RFC-0001:** Governance Model GAMILIT Platform
