# Implementación - Setup & Migration Guide

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Implementation - Setup, Migration & Best Practices
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene guías de implementación para:
- **Package Setup**: Configuración del paquete NPM
- **Publishing Strategy**: Estrategia de publicación
- **Migration Guide**: Guía de migración gradual
- **Breaking Changes Strategy**: Manejo de cambios incompatibles
- **Testing Strategy**: Estrategias de testing

---

## 8. Implementation Recommendations

### 8.1 Package Setup

**package.json**:
```json
{
  "name": "@glit/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for GAMILITplatform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "typescript",
    "types",
    "glit",
    "shared"
  ],
  "author": "GAMILIT Team",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "peerDependencies": {
    "zod": "^3.22.4"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 8.2 Publishing Strategy

1. **Private NPM Registry (Recommended)**:
   ```bash
   npm publish --registry=https://npm.glit.internal
   ```

2. **Git Submodule** (Alternative):
   ```bash
   git submodule add https://github.com/glit/shared-types.git packages/shared-types
   ```

3. **Local Development**:
   ```json
   {
     "dependencies": {
       "@glit/shared-types": "file:../shared-types"
     }
   }
   ```

### 8.3 Consuming in Backend

**Installation**:
```bash
npm install @glit/shared-types
```

**Usage**:
```typescript
import {
  User,
  LoginDto,
  AuthResponse,
  loginSchema,
  isLoginDto
} from '@glit/shared-types';

// In service
async function login(credentials: LoginDto): Promise<AuthResponse> {
  // ...
}

// In controller with validation
router.post('/login', validate(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});
```

### 8.4 Consuming in Frontend

**Installation**:
```bash
npm install @glit/shared-types
```

**Usage**:
```typescript
import {
  Module,
  Exercise,
  SubmitExerciseDto,
  submitExerciseSchema
} from '@glit/shared-types';

// In API client
const api = {
  async submitExercise(data: SubmitExerciseDto) {
    return axios.post<SubmissionResponse>('/exercises/submit', data);
  }
};

// In React component
const ExercisePlayer = () => {
  const { register, handleSubmit } = useValidatedForm(submitExerciseSchema);

  const onSubmit = async (data: SubmitExerciseDto) => {
    const result = await api.submitExercise(data);
    // ...
  };
};
```

---

## 9. Migration Guide

### 9.1 Phase 1: Install Shared Types Package

```bash
# Backend
cd /home/isem/workspace/projects/glit/backend
npm install @glit/shared-types

# Frontend
cd /home/isem/workspace/gamilit-platform-web
npm install @glit/shared-types
```

### 9.2 Phase 2: Gradual Migration

**Step 1**: Start with core types (User, UserProfile, AuthUser)

```typescript
// Before
interface User {
  id: string;
  email: string;
  role: string;
}

// After
import { User } from '@glit/shared-types';
```

**Step 2**: Migrate DTOs

```typescript
// Before
interface LoginRequest {
  email: string;
  password: string;
}

// After
import { LoginDto } from '@glit/shared-types';
```

**Step 3**: Migrate domain types

```typescript
// Before
interface Module {
  id: string;
  title: string;
  // ...
}

// After
import { Module } from '@glit/shared-types';
```

### 9.3 Phase 3: Update Imports

**Backend**:
```typescript
// Old
import { User } from '../shared/types';

// New
import { User } from '@glit/shared-types';
```

**Frontend**:
```typescript
// Old
import { Module } from '@/shared/types';

// New
import { Module } from '@glit/shared-types';
```

### 9.4 Phase 4: Remove Old Types

After migration is complete:

```bash
# Backend
rm -rf src/shared/types

# Frontend
rm -rf src/shared/types
```

### 9.5 Backward Compatibility

During migration, maintain backward compatibility:

```typescript
// src/shared/types/index.ts (temporary)
export * from '@glit/shared-types';

// This allows old imports to continue working:
// import { User } from '../shared/types'; // Still works
```

---

## 10. Breaking Changes Strategy

### 10.1 Deprecation Process

1. **Add deprecation notice**:
```typescript
interface User {
  id: string;
  email: string;

  /** @deprecated Use display_name instead. Will be removed in v3.0.0 */
  displayName?: string;

  display_name: string;
}
```

2. **Log warnings in development**:
```typescript
if (process.env.NODE_ENV === 'development') {
  if (user.displayName !== undefined) {
    console.warn('Warning: user.displayName is deprecated. Use display_name instead.');
  }
}
```

3. **Update documentation**:
```markdown
## Breaking Changes in v3.0.0
- **User.displayName** has been removed. Use **User.display_name** instead.
```

### 10.2 Version Migration

**Major Version Bump (v1.x.x → v2.0.0)**:

```typescript
// v1.x.x
interface Module {
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

// v2.0.0
interface Module {
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
```

**Migration Guide**:
```typescript
// Migration helper
function migrateModuleV1toV2(moduleV1: ModuleV1): ModuleV2 {
  const difficultyMap = {
    easy: 'beginner',
    medium: 'intermediate',
    hard: 'advanced'
  };

  return {
    ...moduleV1,
    difficulty_level: difficultyMap[moduleV1.difficultyLevel] || 'beginner'
  };
}
```

### 10.3 Testing Strategy

**Unit Tests**:
```typescript
import { userSchema } from '@glit/shared-types';

describe('User Schema Validation', () => {
  it('should validate a correct user', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      role: 'student'
    };

    const result = userSchema.safeParse(user);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const user = {
      id: '123',
      email: 'invalid-email',
      role: 'student'
    };

    const result = userSchema.safeParse(user);
    expect(result.success).toBe(false);
  });
});
```

---

## Summary

This shared types library provides:

1. **70+ fully documented types** covering all domains
2. **Zod schemas** for runtime validation
3. **Type guards** for type safety
4. **Backward compatibility** strategy
5. **Migration guide** for smooth adoption
6. **Complete examples** for backend and frontend usage

### Key Benefits

- **Type Safety**: Compile-time checking across the stack
- **Single Source of Truth**: No duplicate definitions
- **Runtime Validation**: Zod schemas at API boundaries
- **Developer Experience**: IntelliSense, autocomplete, inline docs
- **Maintainability**: Centralized type definitions

### Next Steps

1. Create `@glit/shared-types` package
2. Implement all types with Zod schemas
3. Add comprehensive tests
4. Publish to private npm registry
5. Begin gradual migration in backend and frontend
6. Remove old duplicate types after migration

---

**Document Status**: Production Ready
**Last Review**: 2025-10-27
**Version**: 1.0.0
