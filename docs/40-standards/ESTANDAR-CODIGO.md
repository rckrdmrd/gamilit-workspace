---
tipo: estandar-workspace
scope: workspace
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/API-STANDARDS.md para APIs especificas.
actualizado: 2026-01-16
---

# Estandar de Codigo

> Convenciones de lint, formato y estilo de codigo
>
> **Nota de herencia:** Los proyectos heredan este estandar y pueden agregar reglas adicionales especificas (ej: API-STANDARDS.md)

## Herramientas Obligatorias

| Herramienta | Propósito | Config |
|-------------|-----------|--------|
| ESLint | Linting | `.eslintrc.js` |
| Prettier | Formato | `.prettierrc` |
| TypeScript | Tipado | `tsconfig.json` |

## Configuración ESLint

### Backend (NestJS)
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### Frontend (Next.js)
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

## Configuración Prettier

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## TypeScript

### Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Reglas de Tipado

| Regla | Requerido | Ejemplo |
|-------|-----------|---------|
| Tipos explícitos en funciones públicas | Sí | `function getUser(): User` |
| Evitar `any` | Sí | Usar tipos específicos |
| Interfaces para objetos | Sí | `interface UserData {}` |
| Enums para constantes relacionadas | Preferido | `enum Status {}` |

## Patrones de Código

### Funciones

```typescript
// ✅ Bueno: función pura, nombre descriptivo
function calculateTotalPrice(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Malo: efectos secundarios, nombre genérico
function process(data: any) {
  globalState.data = data;
  return data;
}
```

### Clases

```typescript
// ✅ Bueno: responsabilidad única
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### Componentes React

```typescript
// ✅ Bueno: componente funcional tipado
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect(user.id)}>
      {user.name}
    </div>
  );
}
```

## Manejo de Errores

```typescript
// ✅ Bueno: errores tipados y descriptivos
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

// En servicio
async findById(id: string): Promise<User> {
  const user = await this.repository.findOne({ where: { id } });
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}
```

## Comentarios

| Cuándo | Ejemplo |
|--------|---------|
| Lógica compleja | `// Algoritmo de Dijkstra modificado para...` |
| Workarounds | `// FIXME: Workaround para bug en librería X` |
| TODO | `// TODO: Refactorizar cuando se actualice Y` |
| NO para código obvio | Evitar `// Incrementa contador` |

## Imports

```typescript
// ✅ Orden recomendado
// 1. Librerías externas
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// 2. Módulos internos (absolutos)
import { LoggerService } from '@/common/logger';

// 3. Módulos relativos
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
```

## Validaciones Obligatorias

Antes de commit:
```bash
npm run lint        # Sin errores
npm run build       # Sin errores
npm run typecheck   # Sin errores (frontend)
npm run test        # Tests pasan
```

---

## Referencias

- [ESTANDAR-NOMENCLATURA.md](./ESTANDAR-NOMENCLATURA.md) - Nombres
- [ESTANDAR-GIT.md](./ESTANDAR-GIT.md) - Commits y branches
- [ESLint Docs](https://eslint.org/) - Documentación ESLint
