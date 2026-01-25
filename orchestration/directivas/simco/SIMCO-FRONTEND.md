# SIMCO: OPERACIONES FRONTEND (React/TypeScript)

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todo agente que trabaje con código frontend React
**Prioridad:** OBLIGATORIA para operaciones de frontend

---

## RESUMEN EJECUTIVO

> **Types alineados con Backend + Componentes tipados + Hooks para lógica = Frontend robusto.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  ALINEACIÓN BACKEND ↔ FRONTEND                                       ║
║                                                                       ║
║  • Types/Interfaces DEBEN coincidir con DTOs del backend             ║
║  • Endpoints DEBEN consumirse según Swagger                          ║
║  • Estados de error DEBEN manejarse consistentemente                 ║
║  • Si Backend cambia, Frontend DEBE cambiar                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ESTRUCTURA DE FRONTEND

```
{FRONTEND_SRC}/
├── apps/                            # Aplicaciones
│   └── {app}/
│       ├── pages/                   # Páginas/rutas
│       │   └── {Nombre}Page.tsx
│       ├── components/              # Componentes de la app
│       │   └── {Nombre}.tsx
│       ├── hooks/                   # Hooks de la app
│       │   └── use{Nombre}.ts
│       └── layouts/                 # Layouts de la app
│           └── {Nombre}Layout.tsx
├── shared/                          # Compartido entre apps
│   ├── components/                  # Componentes compartidos
│   │   ├── ui/                      # Componentes UI base
│   │   └── common/                  # Componentes comunes
│   ├── hooks/                       # Hooks compartidos
│   │   └── use{Nombre}.ts
│   ├── services/                    # Servicios
│   │   └── api/                     # Servicios de API
│   │       └── {nombre}.api.ts
│   ├── stores/                      # State management
│   │   └── {nombre}Store.ts
│   ├── types/                       # Tipos/Interfaces
│   │   └── {nombre}.types.ts
│   └── utils/                       # Utilidades
│       └── {nombre}.utils.ts
└── config/                          # Configuraciones
    └── api.config.ts
```

---

## CONVENCIONES DE NOMENCLATURA

### Archivos
```typescript
// Componentes: PascalCase.tsx
UserProfile.tsx
LoginForm.tsx
DashboardCard.tsx

// Páginas: PascalCase + Page.tsx
DashboardPage.tsx
UserProfilePage.tsx
SettingsPage.tsx

// Hooks: use + PascalCase.ts
useUser.ts
useAuth.ts
useDashboard.ts

// Types: camelCase.types.ts
user.types.ts
auth.types.ts
dashboard.types.ts

// API services: camelCase.api.ts
user.api.ts
auth.api.ts

// Stores: camelCase + Store.ts
userStore.ts
authStore.ts
```

### Componentes y Funciones
```typescript
// Componentes: PascalCase
export const UserProfile: React.FC<UserProfileProps> = () => {}
export const LoginForm: React.FC<LoginFormProps> = () => {}

// Hooks: use + PascalCase
export const useUser = () => {}
export const useAuth = () => {}

// Funciones helper: camelCase
export const formatDate = () => {}
export const validateEmail = () => {}

// Constantes: UPPER_SNAKE_CASE
export const API_BASE_URL = ''
export const MAX_RETRIES = 3
```

### Types e Interfaces
```typescript
// Interfaces para props: PascalCase + Props
interface UserProfileProps {}
interface LoginFormProps {}

// Types de dominio: PascalCase
type User = {}
type AuthState = {}

// Types de API response: PascalCase + Response
type UserResponse = {}
type LoginResponse = {}

// Enums: PascalCase
enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
}
```

---

## TEMPLATES

### Types (alineados con Backend)

```typescript
// shared/types/user.types.ts

/**
 * User Types
 *
 * Tipos alineados con DTOs del backend.
 * @see {BACKEND_SRC}/modules/users/dto/
 */

/**
 * User entity type
 * Alineado con: UserEntity del backend
 */
export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * Estado del usuario
 */
export enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
    Suspended = 'suspended',
}

/**
 * DTO para crear usuario
 * Alineado con: CreateUserDto del backend
 */
export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

/**
 * DTO para actualizar usuario
 * Alineado con: UpdateUserDto del backend
 */
export interface UpdateUserInput {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    status?: UserStatus;
}

/**
 * Respuesta de lista de usuarios
 */
export interface UsersListResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
}
```

### API Service

```typescript
// shared/services/api/user.api.ts

import { apiClient } from '@/config/api.config';
import type {
    User,
    CreateUserInput,
    UpdateUserInput,
    UsersListResponse,
} from '@/shared/types/user.types';

/**
 * User API Service
 *
 * Servicios para interactuar con endpoints de usuarios.
 * @see Swagger: /api/docs#/Users
 */

const BASE_PATH = '/users';

/**
 * Obtiene lista de usuarios
 */
export const getUsers = async (
    page = 1,
    limit = 20,
): Promise<UsersListResponse> => {
    const response = await apiClient.get(BASE_PATH, {
        params: { page, limit },
    });
    return response.data;
};

/**
 * Obtiene un usuario por ID
 */
export const getUserById = async (id: string): Promise<User> => {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
};

/**
 * Crea un nuevo usuario
 */
export const createUser = async (data: CreateUserInput): Promise<User> => {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (
    id: string,
    data: UpdateUserInput,
): Promise<User> => {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
};

/**
 * Elimina un usuario
 */
export const deleteUser = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
};
```

### Hook

```typescript
// shared/hooks/useUser.ts

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/shared/types/user.types';
import * as userApi from '@/shared/services/api/user.api';

/**
 * Hook para gestión de usuario
 *
 * Proporciona estado y operaciones para un usuario.
 *
 * @example
 * ```tsx
 * const { user, loading, error, refetch } = useUser(userId);
 * ```
 */
export const useUser = (userId: string | null) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Carga el usuario
     */
    const fetchUser = useCallback(async () => {
        if (!userId) {
            setUser(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await userApi.getUserById(userId);
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /**
     * Actualiza el usuario
     */
    const updateUser = useCallback(
        async (data: Partial<User>) => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                const updated = await userApi.updateUser(userId, data);
                setUser(updated);
                return updated;
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Update failed'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [userId],
    );

    // Cargar usuario al montar o cambiar ID
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {
        user,
        loading,
        error,
        refetch: fetchUser,
        updateUser,
    };
};
```

### Componente

```typescript
// apps/{app}/components/UserProfile.tsx

import React from 'react';
import type { User } from '@/shared/types/user.types';

/**
 * Props del componente UserProfile
 */
interface UserProfileProps {
    /** Usuario a mostrar */
    user: User;
    /** Si mostrar avatar */
    showAvatar?: boolean;
    /** Callback al editar */
    onEdit?: (user: User) => void;
    /** Clases CSS adicionales */
    className?: string;
}

/**
 * UserProfile - Muestra información del perfil de usuario
 *
 * @component
 * @example
 * ```tsx
 * <UserProfile
 *   user={currentUser}
 *   showAvatar={true}
 *   onEdit={handleEdit}
 * />
 * ```
 */
export const UserProfile: React.FC<UserProfileProps> = ({
    user,
    showAvatar = true,
    onEdit,
    className = '',
}) => {
    const handleEditClick = () => {
        onEdit?.(user);
    };

    return (
        <div className={`user-profile ${className}`}>
            {showAvatar && (
                <div className="user-profile__avatar">
                    {/* Avatar implementation */}
                </div>
            )}

            <div className="user-profile__info">
                <h2 className="user-profile__name">
                    {user.firstName} {user.lastName}
                </h2>
                <p className="user-profile__email">{user.email}</p>
                <span className={`user-profile__status user-profile__status--${user.status}`}>
                    {user.status}
                </span>
            </div>

            {onEdit && (
                <button
                    className="user-profile__edit-btn"
                    onClick={handleEditClick}
                    aria-label="Edit profile"
                >
                    Edit
                </button>
            )}
        </div>
    );
};

export default UserProfile;
```

### Página

```typescript
// apps/{app}/pages/UserProfilePage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/shared/hooks/useUser';
import { UserProfile } from '../components/UserProfile';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';

/**
 * UserProfilePage - Página de perfil de usuario
 *
 * @page
 * @route /users/:id
 */
export const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loading, error, refetch } = useUser(id ?? null);

    const handleEdit = () => {
        navigate(`/users/${id}/edit`);
    };

    if (loading) {
        return <LoadingSpinner message="Loading user profile..." />;
    }

    if (error) {
        return (
            <ErrorMessage
                message={error.message}
                onRetry={refetch}
            />
        );
    }

    if (!user) {
        return <ErrorMessage message="User not found" />;
    }

    return (
        <div className="user-profile-page">
            <header className="user-profile-page__header">
                <h1>User Profile</h1>
            </header>

            <main className="user-profile-page__content">
                <UserProfile
                    user={user}
                    showAvatar={true}
                    onEdit={handleEdit}
                />
            </main>
        </div>
    );
};

export default UserProfilePage;
```

---

## VALIDACIONES OBLIGATORIAS

> **Definición canónica:** @DEF_VAL_FE
> Ver: `_definitions/validations/VALIDATION-FRONTEND.md`

```yaml
# Resumen (ver @DEF_VAL_FE para detalle completo):
obligatorio:
  - "npm run build     # DEBE pasar"
  - "npm run lint      # DEBE pasar"
  - "npm run typecheck # DEBE pasar"
adicional:
  - "npm run dev       # Verificar que inicia"
  - "Revisar consola   # Sin errores"
```

---

## CHECKLIST FRONTEND

```
TYPES
├── [ ] Alineados con DTOs del backend
├── [ ] Interfaces para props documentadas
├── [ ] Enums para valores fijos
├── [ ] Types de API response
└── [ ] JSDoc en types públicos

API SERVICE
├── [ ] Endpoints según Swagger
├── [ ] Manejo de errores
├── [ ] Tipos de request/response
└── [ ] Documentación de cada función

HOOKS
├── [ ] Estados: data, loading, error
├── [ ] useCallback para funciones
├── [ ] useEffect para side effects
├── [ ] Cleanup si necesario
└── [ ] JSDoc con ejemplo

COMPONENTES
├── [ ] Props tipadas e interface
├── [ ] Props documentadas con JSDoc
├── [ ] defaultProps donde aplique
├── [ ] Accesibilidad (aria-*, roles)
├── [ ] Manejo de estados (loading, error)
└── [ ] className para estilos externos

PÁGINAS
├── [ ] Manejo de parámetros de ruta
├── [ ] Estados de carga y error
├── [ ] Layout apropiado
└── [ ] SEO (title, meta) si aplica

VALIDACIÓN
├── [ ] npm run build pasa
├── [ ] npm run lint pasa
├── [ ] npm run typecheck pasa
├── [ ] Sin errores en consola del navegador
└── [ ] Interacciones funcionan
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Types desalineados | Backend cambió | Actualizar types según Swagger |
| Infinite loop | useEffect sin deps | Agregar dependencias correctas |
| Memory leak | Sin cleanup | Agregar cleanup en useEffect |
| Props any | Falta tipar | Crear interface de props |
| Build falla | Errores TypeScript | Corregir antes de continuar |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Backend:** @OP_BACKEND (SIMCO-BACKEND.md)
- **Guías Frontend:** @GUIAS_FE
- **Nomenclatura:** @DIRECTIVAS/ESTANDARES-NOMENCLATURA-BASE.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
