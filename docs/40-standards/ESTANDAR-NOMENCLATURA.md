# Estandar de Nomenclatura

> Convenciones de nombres para archivos, variables y estructuras

> **NOTA:** Este estandar cubre nomenclatura GENERAL (archivos, variables, BD, CSS).
> Para nomenclatura especifica de API endpoints, ver [ESTANDAR-NOMENCLATURA-API.md](./ESTANDAR-NOMENCLATURA-API.md).

## Archivos y Directorios

### Archivos de Codigo

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Entidad | `{nombre}.entity.ts` | `user.entity.ts` |
| DTO | `{nombre}.dto.ts` | `create-user.dto.ts` |
| Service | `{nombre}.service.ts` | `user.service.ts` |
| Controller | `{nombre}.controller.ts` | `user.controller.ts` |
| Module | `{nombre}.module.ts` | `user.module.ts` |
| Test | `{nombre}.spec.ts` | `user.service.spec.ts` |
| Componente React | `{Nombre}.tsx` | `UserProfile.tsx` |
| Hook | `use{Nombre}.ts` | `useAuth.ts` |
| Tipo | `{nombre}.types.ts` | `user.types.ts` |

### Archivos de Documentacion

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Markdown general | `NOMBRE-DESCRIPCION.md` | `VISION-WORKSPACE.md` |
| Indice | `_INDEX.md` | `_INDEX.md` |
| Mapa | `_MAP.md` | `_MAP.md` |
| YAML config | `NOMBRE-DESCRIPCION.yml` | `CATALOG-INDEX.yml` |

### Directorios

| Nivel | Patron | Ejemplo |
|-------|--------|---------|
| Categoria | `NN-nombre/` | `00-vision-general/` |
| Modulo | `{nombre}/` | `users/` |
| Tarea | `TASK-{YYYY-MM-DD}-{NNN}/` | `TASK-2026-01-16-001/` |

## Variables y Codigo

### TypeScript/JavaScript

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Variable | camelCase | `userName` |
| Constante | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Funcion | camelCase | `getUserById()` |
| Clase | PascalCase | `UserService` |
| Interface | PascalCase | `IUserRepository` |
| Tipo | PascalCase | `UserDto` |
| Enum | PascalCase | `UserStatus` |
| Enum value | UPPER_SNAKE_CASE | `ACTIVE` |

### Base de Datos (PostgreSQL)

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Tabla | snake_case (plural) | `users` |
| Columna | snake_case | `created_at` |
| Primary Key | `id` | `id` |
| Foreign Key | `{tabla_singular}_id` | `user_id` |
| Indice | `idx_{tabla}_{columna}` | `idx_users_email` |
| Constraint | `chk_{tabla}_{regla}` | `chk_users_age` |

### CSS/Tailwind

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Clase custom | kebab-case | `user-profile` |
| Variable CSS | --kebab-case | `--primary-color` |
| Tailwind | Usar clases estandar | `bg-blue-500` |

## Nombres Prohibidos

| Evitar | Preferir | Razon |
|--------|----------|-------|
| `data` | `userData`, `responseData` | Muy generico |
| `info` | `userInfo`, `accountDetails` | Muy generico |
| `temp` | `temporaryFile`, `stagingData` | Clarificar proposito |
| `x`, `y` (excepto coords) | Nombre descriptivo | No autoexplicativo |
| Abreviaciones ambiguas | Nombre completo | `usr` -> `user` |

## Prefijos y Sufijos

### Recomendados

| Prefijo/Sufijo | Uso | Ejemplo |
|----------------|-----|---------|
| `is-`, `has-`, `can-` | Booleanos | `isActive`, `hasPermission` |
| `get-`, `set-` | Getters/Setters | `getUser()`, `setEmail()` |
| `create-`, `update-`, `delete-` | CRUD | `createUser()` |
| `-List`, `-Map`, `-Set` | Colecciones | `userList`, `roleMap` |
| `-Dto` | Data Transfer Object | `CreateUserDto` |
| `-Entity` | Entidad de BD | `UserEntity` |

### Evitar

| Prefijo | Razon |
|---------|-------|
| `I-` para interfaces | TypeScript ya distingue |
| `_` para privados | Usar `private` keyword |
| Hungaro (`strName`) | Obsoleto, tipado estatico |

## Ejemplos Completos

### Modulo de Usuarios (Backend)
```
src/modules/users/
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── users.service.ts
├── users.controller.ts
├── users.module.ts
└── users.service.spec.ts
```

### Componente de Usuarios (Frontend)
```
src/components/features/users/
├── UserProfile.tsx
├── UserList.tsx
├── UserForm.tsx
├── useUser.ts
└── user.types.ts
```

---

## Referencias

- [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) - Convenciones de codigo
- [ESTANDAR-DOCUMENTACION.md](./ESTANDAR-DOCUMENTACION.md) - Formato de documentos
- [ESTANDAR-NOMENCLATURA-API.md](./ESTANDAR-NOMENCLATURA-API.md) - Nomenclatura especifica de endpoints API
