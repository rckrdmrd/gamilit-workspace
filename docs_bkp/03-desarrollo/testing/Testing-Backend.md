# Testing Backend - GAMILIT

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Módulo:** Testing Backend (Node.js/Express con Jest)
**Fecha:** 2025-10-27
**Versión:** 1.0
**Documento RFC:** RFC-0001

---

## Introducción

Esta guía presenta ejemplos prácticos de testing para el backend de GAMILIT, desarrollado con Node.js/Express y Jest. El objetivo de cobertura es **80%** como mínimo en todas las capas críticas: servicios, repositorios, controladores.

El backend utiliza Jest 29.x con soporte completo para TypeScript mediante ts-jest, proporcionando un entorno de testing robusto y eficiente.

---

## Stack de Testing Backend

### Tecnologías Principales

- **Framework:** Jest 29.x
- **TypeScript Support:** ts-jest
- **Mocking:** jest.mock(), jest.fn()
- **Coverage:** Istanbul integrado en Jest
- **HTTP Testing:** Supertest para tests de integración
- **Database:** Mock de PostgreSQL pool

### Características Principales

- Testing unitario de servicios y repositorios
- Mocking de dependencias externas (bcrypt, JWT, DB)
- Tests de integración con Supertest
- Validación de middlewares
- Cobertura de código con Istanbul

---

## Configuración de Jest

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
};
```

### Descripción de Configuración

- **preset:** Usa ts-jest para soporte TypeScript
- **testEnvironment:** Node.js (no DOM)
- **roots:** Directorio raíz de tests
- **testMatch:** Patrón para archivos de test
- **collectCoverageFrom:** Incluye archivos TypeScript excepto tipos y definiciones
- **coverageThreshold:** Umbral mínimo 80% en todas las métricas
- **moduleNameMapper:** Alias de paths para imports

---

## Ejemplos de Tests Backend

### 1. Test de Servicio - AuthService.login()

**Tipo:** Test Unitario
**Capa:** Servicio
**Descripción:** Valida el flujo de autenticación con credenciales válidas.

```typescript
import { AuthService } from '../auth.service';
import { UsersRepository } from '../users.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../users.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersRepo: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockUsersRepo = new UsersRepository() as jest.Mocked<UsersRepository>;
    authService = new AuthService(mockUsersRepo);
  });

  describe('login()', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'student@glit.com',
        password_hash: 'hashed_password',
        role: 'student',
        status: 'active',
      };

      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login('student@glit.com', 'Test1234');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('student@glit.com');
      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('student@glit.com');
    });
  });
});
```

**Puntos Clave:**
- Mock de UsersRepository, bcrypt y jsonwebtoken
- Preparación de datos de prueba (mockUser)
- Validación de propiedades del resultado
- Verificación de llamadas a dependencias

---

### 2. Test de Repositorio - ExerciseRepository.findById()

**Tipo:** Test Unitario
**Capa:** Repositorio
**Descripción:** Valida búsqueda de ejercicios por ID con mock de PostgreSQL.

```typescript
import { ExerciseRepository } from '../exercise.repository';
import { pool } from '@/database/pool';

jest.mock('@/database/pool');

describe('ExerciseRepository', () => {
  let repo: ExerciseRepository;
  let mockPool: jest.Mocked<typeof pool>;

  beforeEach(() => {
    mockPool = pool as jest.Mocked<typeof pool>;
    repo = new ExerciseRepository();
  });

  describe('findById()', () => {
    it('should return exercise when found', async () => {
      const mockExercise = {
        id: 'ex-123',
        module_id: 'mod-1',
        title: 'Crucigrama Maya',
        type: 'crucigrama',
        config: { size: 10, words: [] },
        xp_reward: 100,
        ml_coins_reward: 50,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockExercise],
        rowCount: 1,
      } as any);

      const result = await repo.findById('ex-123');

      expect(result).toEqual(mockExercise);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE id = $1',
        ['ex-123']
      );
    });
  });
});
```

**Puntos Clave:**
- Mock del pool de PostgreSQL
- Simulación de respuesta de query SQL
- Validación de estructura de datos retornada
- Verificación de query SQL correcta

---

### 3. Test de Middleware - authenticate()

**Tipo:** Test Unitario
**Capa:** Middleware
**Descripción:** Valida autenticación JWT en requests protegidos.

```typescript
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../auth.middleware';
import { AuthRequest } from '@/shared/types';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should attach user to request on valid token', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token',
    };

    const mockPayload = {
      id: 'user-123',
      email: 'student@glit.com',
      role: 'student',
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 on missing token', () => {
    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

**Puntos Clave:**
- Mock de objetos Express (Request, Response, NextFunction)
- Validación de adjunción de usuario al request
- Verificación de respuesta 401 en caso de error
- Comprobación de que next() se llama correctamente

---

### 4. Test de Validación - loginSchema (Joi)

**Tipo:** Test Unitario
**Capa:** Validación
**Descripción:** Valida esquemas de validación de DTOs con Joi.

```typescript
import Joi from 'joi';
import { loginSchema } from '../auth.validation';

describe('Auth Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'student@glit.com',
        password: 'Test1234',
      };

      const { error, value } = loginSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Test1234',
      };

      const { error } = loginSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('valid email');
    });

    it('should reject weak passwords', () => {
      const weakPassword = {
        email: 'student@glit.com',
        password: '123',
      };

      const { error } = loginSchema.validate(weakPassword);

      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('password');
    });
  });
});
```

**Puntos Clave:**
- Validación de datos correctos e incorrectos
- Verificación de mensajes de error descriptivos
- Testeo de reglas de negocio (formato email, complejidad password)

---

## Comandos de Testing Backend

### Comandos NPM

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar tests específicos
npm test -- auth.service.test.ts

# Tests con output verbose
npm test -- --verbose

# Tests en modo debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Limpiar cache de Jest
npm test -- --clearCache
```

### Configuración en package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Mejores Prácticas - Backend

### Estructura de Tests

1. **AAA Pattern (Arrange-Act-Assert)**
   - Arrange: Preparar datos y mocks
   - Act: Ejecutar la función bajo prueba
   - Assert: Verificar resultados

2. **Test Isolation**
   - Cada test debe ser independiente
   - Usar beforeEach para resetear estado
   - No compartir datos entre tests

3. **Nombres Descriptivos**
   - Usar formato: `should [expected behavior] when [condition]`
   - Ejemplo: `should return 401 when token is invalid`

### Mocking

4. **Mock de Dependencias Externas**
   - Mockear siempre DB, APIs externas, servicios de terceros
   - Usar jest.mock() para módulos completos
   - Usar jest.fn() para funciones individuales

5. **Mock de Base de Datos**
   - No conectar a DB real en tests unitarios
   - Mockear el pool de conexiones
   - Simular respuestas de queries

### Validación

6. **Testear Edge Cases**
   - Casos de error (validación, permisos, recursos no encontrados)
   - Casos límite (valores null, undefined, arrays vacíos)
   - Casos de éxito

7. **Verificar Side Effects**
   - Comprobar que se llamaron las funciones correctas
   - Validar parámetros de llamadas
   - Verificar orden de ejecución

### Cobertura

8. **Cobertura Significativa**
   - 80% es el objetivo mínimo
   - Priorizar código crítico de negocio
   - No perseguir 100% a ciegas

---

## Patrones Comunes

### Patrón: Mock de Repositorio

```typescript
const mockRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<ExerciseRepository>;
```

### Patrón: Mock de Request/Response

```typescript
const mockReq = {
  params: { id: 'ex-123' },
  body: { title: 'New Exercise' },
  user: { id: 'user-123', role: 'student' },
} as Partial<AuthRequest>;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as Partial<Response>;
```

### Patrón: Testeo de Errores

```typescript
it('should throw error when user not found', async () => {
  mockUsersRepo.findById.mockResolvedValue(null);

  await expect(authService.login('invalid@email.com', 'pass'))
    .rejects
    .toThrow('User not found');
});
```

---

## Referencias

### Documentación Oficial
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)
- [Supertest](https://github.com/ladjs/supertest)

### Documentación Interna GAMILIT
- [Estructura Backend](../backend/ESTRUCTURA-Y-MODULOS.md)
- [Servicios Principales](../backend/SERVICIOS-PRINCIPALES.md)
- [Testing Integración](./Testing-Integracion.md)
- [Testing Cobertura](./Testing-Cobertura.md)

### Código de Ejemplo
- Backend Tests: `/projects/glit/backend/src/__tests__/`

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**RFC:** RFC-0001
**Cobertura objetivo:** 80%
