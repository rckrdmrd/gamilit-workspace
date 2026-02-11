# Testing Cheatsheet - GAMILIT

**Ultima actualizacion:** 2026-01-04

---

## Backend Testing (NestJS + Jest)

### Ejecutar Tests

```bash
cd apps/backend

# Todos los tests
npm run test

# Con coverage
npm run test:cov

# Watch mode
npm run test:watch

# Un archivo especifico
npm run test -- auth.service.spec.ts
```

### Estructura de Test

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: 'pass' };

      // Act
      const result = await service.login(credentials);

      // Assert
      expect(result.token).toBeDefined();
    });
  });
});
```

---

## Frontend Testing (Vitest + React Testing Library)

### Ejecutar Tests

```bash
cd apps/frontend

# Todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Estructura de Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});
```

---

## E2E Testing

### Scripts de Testing Manual

```bash
# Backend endpoints
apps/backend/scripts/test-alerts-endpoints.sh
apps/backend/scripts/test-analytics-endpoints.sh
apps/backend/scripts/test-progress-endpoints.sh
apps/backend/scripts/test-monitoring-endpoints.sh
```

---

## Database Testing

```sql
-- Test RLS policies
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-uuid", "role": "student"}';

SELECT * FROM educational_content.exercises;  -- Should filter by user
```

---

## Mocking

### Backend Mocks

```typescript
// Mock repository
const repositoryMockFactory = jest.fn(() => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}));

// Mock service
jest.mock('./auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    validateUser: jest.fn().mockResolvedValue({ id: '1' }),
  })),
}));
```

### Frontend Mocks

```typescript
// Mock API
vi.mock('../api/auth', () => ({
  login: vi.fn().mockResolvedValue({ token: 'mock-token' }),
}));

// Mock hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '1' }, isAuthenticated: true }),
}));
```

---

## Referencias

- [TESTING-GUIDE.md](../95-guias-desarrollo/backend/TESTING-GUIDE.md)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Vitest Docs](https://vitest.dev/guide/)
