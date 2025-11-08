# Contributing to GAMILIT

¡Gracias por tu interés en contribuir a GAMILIT! Este documento te guiará a través del proceso de contribución.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Pre-requisitos](#pre-requisitos)
3. [Setup del Entorno de Desarrollo](#setup-del-entorno-de-desarrollo)
4. [Workflow de Desarrollo](#workflow-de-desarrollo)
5. [**Constants SSOT - Pre-Commit Checklist**](#constants-ssot---pre-commit-checklist) ⭐
6. [Estándares de Código](#estándares-de-código)
7. [Commits y Pull Requests](#commits-y-pull-requests)
8. [Testing](#testing)
9. [Documentación](#documentación)

---

## Código de Conducta

Este proyecto sigue un código de conducta profesional. Se espera que todos los contribuyentes:

- Sean respetuosos y constructivos en sus interacciones
- Acepten críticas constructivas con profesionalismo
- Se enfoquen en lo mejor para la comunidad y el proyecto
- Muestren empatía hacia otros miembros de la comunidad

---

## Pre-requisitos

Antes de contribuir, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** >= 2.30
- **PostgreSQL** >= 15.x (para desarrollo local)
- **Docker** (opcional, para contenedores)

---

## Setup del Entorno de Desarrollo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/gamilit.git
cd gamilit/projects/gamilit

# Agrega el upstream
git remote add upstream https://github.com/GAMILIT_ORG/gamilit.git
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias root (incluye postinstall que ejecuta sync:enums)
npm install

# Instalar dependencias Backend
cd apps/backend
npm install

# Instalar dependencias Frontend
cd ../frontend
npm install

# Volver a root
cd ../..
```

### 3. Configurar Variables de Entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env con tus credenciales

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
# Editar apps/frontend/.env con tu API URL
```

### 4. Setup de Base de Datos

```bash
# Crear base de datos
createdb gamilit_dev

# Ejecutar migraciones (cuando estén disponibles)
cd apps/backend
npm run migration:run
```

### 5. Verificar Setup

```bash
# Desde root, ejecutar validaciones
npm run validate:all

# Debe retornar:
# ✅ ENUMs sincronizados exitosamente
# ✅ EXCELENTE! No se encontraron violaciones de hardcoding
# ✅ API Contract validado
```

---

## Workflow de Desarrollo

### 1. Crear Branch

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear feature branch
git checkout -b feature/mi-nueva-funcionalidad
# O bug fix branch
git checkout -b fix/corregir-bug-autenticacion
```

**Convención de nombres de branches:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `refactor/` - Refactorización de código
- `docs/` - Cambios en documentación
- `test/` - Agregar o mejorar tests
- `chore/` - Tareas de mantenimiento

### 2. Desarrollar

```bash
# Backend
cd apps/backend
npm run dev  # Modo desarrollo con hot-reload

# Frontend (en otra terminal)
cd apps/frontend
npm run dev  # Vite dev server
```

### 3. Hacer Commits

Ver sección [Commits y Pull Requests](#commits-y-pull-requests) para convenciones.

---

## Constants SSOT - Pre-Commit Checklist ⭐

**IMPORTANTE:** Antes de hacer commit, **SIEMPRE** ejecutar este checklist para asegurar el cumplimiento de la política SSOT.

### Checklist Obligatorio

```bash
# ✅ 1. Sincronizar ENUMs Backend → Frontend
npm run sync:enums

# ✅ 2. Validar que no haya hardcoding (33 patrones detectados)
npm run validate:constants

# ✅ 3. Validar contrato API Backend ↔ Frontend
npm run validate:api-contract

# ✅ 4. Ejecutar tests
npm run test

# ✅ 5. Ejecutar linter
npm run lint

# ✅ 6. Si TODO pasa, hacer commit
git add .
git commit -m "feat: agregar nueva funcionalidad"
```

**Atajo para validar todo:**

```bash
npm run validate:all && npm run test && git commit
```

### ¿Cuándo actualizar constantes?

#### Al crear nueva tabla Database:

1. ✅ Crear DDL en `platform/db/ddl/schemas/{schema}/tables/{tabla}.sql`
2. ✅ **INMEDIATAMENTE** agregar entrada en `apps/backend/src/shared/constants/database.constants.ts`:

```typescript
export const DB_TABLES = {
  AUTH: {
    // ... existing tables
    NEW_TABLE: 'new_table', // ← AGREGAR AQUÍ
  },
};
```

3. ✅ Crear Entity usando la nueva constante:

```typescript
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.NEW_TABLE })
export class NewTable { ... }
```

#### Al crear nueva ruta API Backend:

1. ✅ **PRIMERO** agregar entrada en `apps/backend/src/shared/constants/routes.constants.ts`:

```typescript
export const API_ROUTES = {
  NEW_MODULE: {
    BASE: '/new-module',
    BY_ID: (id: string) => `/new-module/${id}`,
  },
};
```

2. ✅ Crear Controller usando la nueva constante:

```typescript
import { API_ROUTES } from '@/shared/constants';

@Controller(API_ROUTES.NEW_MODULE.BASE.replace('/', ''))
export class NewModuleController { ... }
```

3. ✅ **INMEDIATAMENTE** agregar en Frontend `apps/frontend/src/shared/constants/api-endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
  NEW_MODULE: {
    BASE: `${API_BASE_URL}/new-module`,
    BY_ID: (id: string) => `${API_BASE_URL}/new-module/${id}`,
  },
};
```

4. ✅ Validar sincronización:

```bash
npm run validate:api-contract
# Debe retornar: ✅ API Contract validado
```

#### Al crear nuevo ENUM:

1. ✅ **Definir ENUM solo en Backend** `apps/backend/src/shared/constants/enums.constants.ts`:

```typescript
export enum NewEnum {
  VALUE_1 = 'value_1',
  VALUE_2 = 'value_2',
}
```

2. ✅ **Ejecutar script de sincronización:**

```bash
npm run sync:enums
```

3. ✅ **Verificar** que Frontend tiene el mismo ENUM:

```bash
diff apps/backend/src/shared/constants/enums.constants.ts \
     apps/frontend/src/shared/constants/enums.constants.ts

# Debe retornar: (sin diferencias)
```

4. ✅ **NO modificar manualmente** el archivo Frontend (se sobrescribe en sync).

### Violaciones Comunes y Cómo Evitarlas

#### ❌ Violación 1: Hardcoded schema en Entity

**Detectado por:** `npm run validate:constants`

```typescript
// ❌ MAL
@Entity({ schema: 'auth_management', name: 'users' })
export class User { ... }

// ✅ BIEN
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.USERS })
export class User { ... }
```

#### ❌ Violación 2: Hardcoded API URL en Frontend

**Detectado por:** `npm run validate:constants`

```typescript
// ❌ MAL
await fetch('http://localhost:3000/api/v1/users/123');

// ✅ BIEN
import { API_ENDPOINTS } from '@/shared/constants';

await fetch(API_ENDPOINTS.USERS.BY_ID('123'));
```

#### ❌ Violación 3: Discrepancia Backend ↔ Frontend

**Detectado por:** `npm run validate:api-contract`

```
❌ Ruta "/users/:id/settings" existe en Backend pero NO en Frontend
```

**Solución:** Sincronizar ambos archivos (Backend routes.constants.ts y Frontend api-endpoints.ts)

### Documentación de Referencia

- **Arquitectura completa:** [CONSTANTS-ARCHITECTURE.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/CONSTANTS-ARCHITECTURE.md)
- **Políticas obligatorias:** [POLITICA-CONSTANTS-SSOT.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/POLITICA-CONSTANTS-SSOT.md)

---

## Estándares de Código

### TypeScript

- **Estilo:** Airbnb TypeScript Style Guide
- **Linter:** ESLint con reglas de @typescript-eslint
- **Formatter:** Prettier con configuración del proyecto

```bash
# Ejecutar linter
npm run lint

# Ejecutar formatter
npm run format
```

### Naming Conventions

**Variables y Funciones:**
```typescript
// camelCase
const userName = 'John';
function getUserById(id: string) { ... }
```

**Clases y Interfaces:**
```typescript
// PascalCase
class UserService { ... }
interface IUserRepository { ... }
```

**Constantes:**
```typescript
// UPPER_SNAKE_CASE para constantes globales
export const MAX_LOGIN_ATTEMPTS = 3;

// PascalCase para ENUMs
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}
```

**Archivos:**
```
user.entity.ts        # Entities
user.dto.ts           # DTOs
user.service.ts       # Services
user.controller.ts    # Controllers
user.module.ts        # Modules
user.spec.ts          # Tests
```

### Import Organization

```typescript
// 1. Node modules
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

// 2. Internal modules
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';
import { User } from '@/modules/auth/entities/user.entity';

// 3. Relative imports
import { CreateUserDto } from './dto/create-user.dto';
```

---

## Commits y Pull Requests

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización de código
- `docs`: Cambios en documentación
- `test`: Agregar o mejorar tests
- `chore`: Tareas de mantenimiento
- `style`: Cambios de formato (no afectan lógica)
- `perf`: Mejoras de performance

**Ejemplos:**

```bash
feat(auth): agregar autenticación con Google OAuth

fix(gamification): corregir cálculo de puntos en quiz

refactor(database): migrar entities a usar DB_SCHEMAS constants

docs(readme): actualizar sección de Constants SSOT

test(users): agregar tests para UserService
```

### Pull Request Process

1. **Actualizar branch con main:**

```bash
git checkout main
git pull upstream main
git checkout tu-feature-branch
git rebase main
```

2. **Ejecutar validaciones:**

```bash
# ✅ Validar SSOT
npm run validate:all

# ✅ Ejecutar tests
npm run test

# ✅ Ejecutar linter
npm run lint
```

3. **Crear Pull Request en GitHub:**

**Título:** Usar Conventional Commits format

```
feat(auth): agregar autenticación con Google OAuth
```

**Descripción:** Incluir template

```markdown
## Descripción

Breve descripción de los cambios realizados.

## Tipo de cambio

- [ ] 🐛 Bug fix (cambio que corrige un issue)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (fix o feature que causa cambios incompatibles)
- [ ] 📝 Documentación

## Checklist

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He ejecutado `npm run validate:all` ✅
- [ ] He ejecutado `npm run test` y todos los tests pasan ✅
- [ ] He ejecutado `npm run lint` ✅
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi fix/funcionalidad
- [ ] Tests unitarios y de integración pasan localmente
- [ ] He sincronizado ENUMs si modifiqué Backend enums (`npm run sync:enums`)
- [ ] He actualizado constantes si agregué schemas/tablas/rutas

## Screenshots (si aplica)

## Notas adicionales
```

4. **Code Review:**

- Mínimo **1 aprobación** requerida
- CI/CD debe pasar (validate-constants.yml + tests)
- Resolver todos los comentarios antes de merge

5. **Merge:**

- **Squash and merge** preferido para features pequeñas
- **Merge commit** para features grandes
- **Rebase and merge** para branches con commits limpios

---

## Testing

### Backend Tests

```bash
cd apps/backend

# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Cobertura de tests
npm run test:cov
```

**Estructura de tests:**

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, /* ... */],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', email: 'test@test.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user as User);

      expect(await service.findById('1')).toBe(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Frontend Tests

```bash
cd apps/frontend

# Ejecutar tests
npm run test

# Tests con UI
npm run test:ui

# Cobertura
npm run test:coverage
```

**Estructura de tests:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: expect.any(String),
    });
  });
});
```

---

## Documentación

### Documentar Código

**JSDoc para funciones públicas:**

```typescript
/**
 * Obtiene un usuario por su ID
 *
 * @param id - UUID del usuario
 * @returns Promise con el usuario encontrado
 * @throws NotFoundException si el usuario no existe
 *
 * @example
 * ```typescript
 * const user = await userService.findById('123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
async findById(id: string): Promise<User> {
  // ...
}
```

### Actualizar Documentación

Si tus cambios afectan:

- **API Endpoints:** Actualizar Swagger/OpenAPI docs
- **Schemas de Database:** Actualizar DDL y documentation
- **Funcionalidades nuevas:** Actualizar README.md y docs relevantes
- **Cambios arquitectónicos:** Crear ADR (Architecture Decision Record)

---

## ¿Preguntas?

- **Slack:** #dev-support
- **Email:** dev@gamilit.com
- **Issues:** [GitHub Issues](https://github.com/GAMILIT_ORG/gamilit/issues)

---

**¡Gracias por contribuir a GAMILIT!** 🚀

**Versión:** 1.0
**Última actualización:** 2025-11-02
