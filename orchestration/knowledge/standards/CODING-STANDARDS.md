# Coding Standards - GAMILIT Platform

**Owner:** @tech-lead
**Última actualización:** 2025-11-07
**Versión:** 1.0
**Enforcement:** ESLint, Prettier, TypeScript compiler, Code reviews

---

## 📋 Tabla de Contenidos

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React Standards](#react-standards)
4. [Backend Standards](#backend-standards)
5. [Database Standards](#database-standards)
6. [File Organization](#file-organization)
7. [Naming Conventions](#naming-conventions)
8. [Comments and Documentation](#comments-and-documentation)
9. [Testing Standards](#testing-standards)
10. [Error Handling](#error-handling)
11. [Performance](#performance)
12. [Security](#security)

---

## 🎯 General Principles

### DRY (Don't Repeat Yourself)

**❌ Evitar:**
```typescript
// Duplicated validation
if (!user.email || !user.email.includes('@')) {
  throw new Error('Invalid email');
}
// ... 50 líneas después ...
if (!user.email || !user.email.includes('@')) {
  throw new Error('Invalid email');
}
```

**✅ Preferir:**
```typescript
// Shared validation function
function validateEmail(email: string): void {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
}

validateEmail(user.email);
```

### KISS (Keep It Simple, Stupid)

**❌ Evitar:**
```typescript
const result = array.reduce((acc, curr) =>
  acc.concat(curr.items.filter(i => i.active)
    .map(i => ({ ...i, processed: true }))),
  [] as Item[]
);
```

**✅ Preferir:**
```typescript
const activeItems = array
  .flatMap(item => item.items)
  .filter(item => item.active)
  .map(item => ({ ...item, processed: true }));
```

### YAGNI (You Aren't Gonna Need It)

No implementes features "por si acaso". Solo lo que se necesita ahora.

---

## 📘 TypeScript Standards

### 1. Strict Mode

**Configuración requerida en `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true
  }
}
```

### 2. No `any` Types

**❌ Prohibido:**
```typescript
function processData(data: any): any {
  return data.value;
}
```

**✅ Requerido:**
```typescript
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data structure');
}

// O mejor con types
interface DataStructure {
  value: string;
}

function processData(data: DataStructure): string {
  return data.value;
}
```

### 3. Prefer `const` over `let`

**❌ Evitar:**
```typescript
let name = 'John';
name = 'Jane';  // Si no se modifica, usar const
```

**✅ Preferir:**
```typescript
const name = 'John';

// Si necesitas mutación
let counter = 0;
counter++;
```

### 4. No `var`

**❌ Prohibido:**
```typescript
var x = 10;
```

**✅ Requerido:**
```typescript
const x = 10;
// o
let y = 20;
```

### 5. Explicit Return Types

**❌ Evitar:**
```typescript
function calculate(x: number, y: number) {
  return x + y;  // Return type implicit
}
```

**✅ Preferir:**
```typescript
function calculate(x: number, y: number): number {
  return x + y;
}
```

### 6. Use Union Types Instead of Overloads

**❌ Evitar:**
```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}
```

**✅ Preferir:**
```typescript
function format(value: string | number): string {
  return String(value);
}
```

---

## ⚛️ React Standards

### 1. Functional Components + Hooks

**❌ Prohibido:**
```typescript
// Class components
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

**✅ Requerido:**
```typescript
// Functional component
function MyComponent() {
  return <div>Hello</div>;
}

// O con arrow function para exports
export const MyComponent = () => {
  return <div>Hello</div>;
};
```

### 2. Props Interface Siempre Tipada

**❌ Prohibido:**
```typescript
export const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

**✅ Requerido:**
```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button = ({ onClick, children, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
```

### 3. Max 300 Líneas por Componente

Si tu componente excede 300 líneas, refactoriza:

**❌ Evitar:**
```typescript
export const Dashboard = () => {
  // 500 líneas de código
  return (
    <div>
      {/* Todo mezclado */}
    </div>
  );
};
```

**✅ Preferir:**
```typescript
// Separar en subcomponentes
export const Dashboard = () => {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActions />
    </div>
  );
};
```

### 4. Un Componente por Archivo

**❌ Evitar:**
```typescript
// Button.tsx
export const PrimaryButton = () => { ... };
export const SecondaryButton = () => { ... };
export const DangerButton = () => { ... };
```

**✅ Preferir:**
```typescript
// Button.tsx
export const Button = () => { ... };

// PrimaryButton.tsx
export const PrimaryButton = () => { ... };

// SecondaryButton.tsx
export const SecondaryButton = () => { ... };
```

### 5. Custom Hooks con Prefijo `use`

**❌ Prohibido:**
```typescript
function fetchData() {
  const [data, setData] = useState(null);
  // ...
}
```

**✅ Requerido:**
```typescript
function useFetchData() {
  const [data, setData] = useState(null);
  // ...
  return data;
}
```

### 6. useEffect Dependencies Completas

**❌ Prohibido:**
```typescript
useEffect(() => {
  fetchData(userId);
}, []);  // ❌ Missing userId dependency
```

**✅ Requerido:**
```typescript
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]);  // ✅ All dependencies listed
```

---

## 🔧 Backend Standards

### 1. Controllers: Max 10 Endpoints

**❌ Evitar:**
```typescript
@Controller('users')
export class UsersController {
  // 20 endpoints...
}
```

**✅ Preferir:**
```typescript
// Separar por dominio
@Controller('users')
export class UsersController {
  // 5 endpoints básicos
}

@Controller('users/profile')
export class UsersProfileController {
  // 5 endpoints de perfil
}
```

### 2. Validación con Zod

**❌ Evitar:**
```typescript
@Post()
create(@Body() data: any) {
  if (!data.email) throw new Error('Email required');
  // ...
}
```

**✅ Requerido:**
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'teacher', 'admin'])
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

@Post()
create(@Body() data: CreateUserDto) {
  const validated = CreateUserSchema.parse(data);
  // ...
}
```

### 3. Error Handling Consistente

**❌ Evitar:**
```typescript
throw new Error('User not found');
throw 'Invalid input';
throw { message: 'Something went wrong' };
```

**✅ Requerido:**
```typescript
// Usar custom exceptions
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input');
throw new InternalServerErrorException('Something went wrong');

// O custom error classes
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}
```

### 4. Lógica de Negocio en Services

**❌ Evitar:**
```typescript
// Controller con lógica de negocio
@Get(':id')
async getUser(@Param('id') id: string) {
  const user = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!user) throw new NotFoundException();
  user.fullName = `${user.firstName} ${user.lastName}`;
  return user;
}
```

**✅ Requerido:**
```typescript
// Controller delgado
@Get(':id')
async getUser(@Param('id') id: string) {
  return this.usersService.findOne(id);
}

// Service con lógica
@Injectable()
export class UsersService {
  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToDto(user);
  }

  private mapToDto(user: User): UserDto {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    };
  }
}
```

### 5. Dependency Injection

**✅ Requerido:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(dto);
    await this.emailService.sendWelcome(user.email);
    this.logger.log(`User created: ${user.id}`);
    return user;
  }
}
```

---

## 🗄️ Database Standards

### 1. Usar Prepared Statements (NO String Interpolation)

**❌ Prohibido (SQL Injection risk):**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.query(query);
```

**✅ Requerido:**
```typescript
const query = 'SELECT * FROM users WHERE email = $1';
await db.query(query, [email]);
```

### 2. Índices para Queries Frecuentes

**✅ Requerido:**
```sql
-- Frequently queried columns
CREATE INDEX idx_users_email ON auth_management.users(email);
CREATE INDEX idx_sessions_expires ON auth_management.user_sessions(expires_at);

-- Composite indexes for common WHERE clauses
CREATE INDEX idx_exercise_attempts_user_module
  ON progress_tracking.exercise_attempts(user_id, module_id);
```

### 3. RLS Policies para Security

**✅ Requerido:**
```sql
-- Enable RLS
ALTER TABLE progress_tracking.module_progress ENABLE ROW LEVEL SECURITY;

-- Students can only see their own data
CREATE POLICY students_view_own_data
  ON progress_tracking.module_progress
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 4. Transactions para Operaciones Atómicas

**✅ Requerido:**
```typescript
async transferMLCoins(fromId: string, toId: string, amount: number) {
  const client = await this.pool.connect();

  try {
    await client.query('BEGIN');

    // Deduct from sender
    await client.query(
      'UPDATE gamification_system.user_stats SET ml_coins = ml_coins - $1 WHERE user_id = $2',
      [amount, fromId]
    );

    // Add to receiver
    await client.query(
      'UPDATE gamification_system.user_stats SET ml_coins = ml_coins + $1 WHERE user_id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 📂 File Organization

### Backend Structure

```
src/
├── modules/
│   └── [module-name]/
│       ├── [module-name].controller.ts
│       ├── [module-name].service.ts
│       ├── [module-name].module.ts
│       ├── dto/
│       │   ├── create-[name].dto.ts
│       │   └── update-[name].dto.ts
│       ├── entities/
│       │   └── [name].entity.ts
│       └── __tests__/
│           ├── [module-name].controller.spec.ts
│           └── [module-name].service.spec.ts
├── shared/
│   ├── constants/
│   ├── types/
│   └── utils/
└── config/
```

### Frontend Structure

```
src/
├── features/
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── pages/
    └── [page-name]/
```

---

## 🏷️ Naming Conventions

### Variables y Functions

**camelCase:**
```typescript
const userName = 'John';
const totalScore = 100;

function calculateScore(attempts: number): number {
  return attempts * 10;
}
```

### Classes e Interfaces

**PascalCase:**
```typescript
class UserService { }
interface UserProfile { }
type ApiResponse = { };
```

### Constants

**UPPER_SNAKE_CASE:**
```typescript
const MAX_RETRIES = 3;
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 5000;
```

### Files

**kebab-case:**
```
user-profile.service.ts
ml-coins-calculator.ts
authentication-guard.ts
```

### Database

**snake_case:**
```sql
CREATE TABLE auth_management.user_sessions (...);
CREATE INDEX idx_users_email ON users(email);
```

### Booleans

**Prefijo `is`, `has`, `can`, `should`:**
```typescript
const isActive = true;
const hasPermission = false;
const canEdit = true;
const shouldRetry = false;
```

---

## 💬 Comments and Documentation

### 1. JSDoc para Funciones Públicas

**✅ Requerido:**
```typescript
/**
 * Calculates ML Coins earned based on score and multipliers
 * @param score - Exercise score (0-100)
 * @param multiplier - User's rank multiplier (1.0-2.0)
 * @param isFirstAttempt - Whether this is the first attempt
 * @returns Total ML Coins earned
 */
export function calculateMLCoins(
  score: number,
  multiplier: number,
  isFirstAttempt: boolean
): number {
  const baseCoins = Math.floor(score / 10);
  const bonus = isFirstAttempt ? 15 : 0;
  return Math.floor((baseCoins + bonus) * multiplier);
}
```

### 2. Inline Comments: Explica "Por Qué", No "Qué"

**❌ Evitar:**
```typescript
// Increment counter
counter++;

// Check if user is active
if (user.isActive) { }
```

**✅ Preferir:**
```typescript
// Increment counter to track rate limiting attempts
// (reset happens in daily cron job at midnight)
counter++;

// Only active users can access premium features
// per business requirement BR-042
if (user.isActive) { }
```

### 3. TODO Comments con Owner

**✅ Formato:**
```typescript
// TODO(@username): Add error handling for network failures
// TODO(2025-12-01, @tech-lead): Refactor to use new API endpoint
// FIXME(@backend-team): Race condition when updating ML Coins
```

---

## 🧪 Testing Standards

### 1. Test Coverage Mínimo

| Type | Target | Current |
|------|--------|---------|
| **Backend** | 70% | 15% ⚠️ |
| **Frontend** | 70% | 13% ⚠️ |

### 2. Test Naming

**✅ Formato:** `should [expected behavior] when [condition]`

```typescript
describe('UsersService', () => {
  describe('findOne', () => {
    it('should return user when user exists', async () => {
      // ...
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // ...
    });

    it('should include fullName when user has firstName and lastName', async () => {
      // ...
    });
  });
});
```

### 3. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate ML Coins correctly', () => {
  // Arrange
  const score = 85;
  const multiplier = 1.5;
  const isFirstAttempt = true;

  // Act
  const result = calculateMLCoins(score, multiplier, isFirstAttempt);

  // Assert
  expect(result).toBe(30);  // (8 + 15) * 1.5 = 34.5 → floor → 34
});
```

---

## ⚠️ Error Handling

### 1. Usar Try-Catch para Async Operations

**✅ Requerido:**
```typescript
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new UserNotFoundError(userId);
    }
    throw new Error('Failed to fetch user data');
  }
}
```

### 2. Log Errors con Context

**✅ Requerido:**
```typescript
catch (error) {
  this.logger.error('Failed to create user', {
    error: error.message,
    stack: error.stack,
    userId: user.id,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

---

## ⚡ Performance

### 1. Evitar N+1 Queries

**❌ Evitar:**
```typescript
// N+1 query problem
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.stats = await db.query('SELECT * FROM user_stats WHERE user_id = $1', [user.id]);
}
```

**✅ Preferir:**
```typescript
// Single JOIN query
const users = await db.query(`
  SELECT u.*, us.*
  FROM users u
  LEFT JOIN user_stats us ON u.id = us.user_id
`);
```

### 2. Memoization en React

**✅ Requerido para cálculos costosos:**
```typescript
const expensiveCalculation = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);

const memoizedCallback = useCallback(() => {
  doSomething(value);
}, [value]);
```

---

## 🔐 Security

### 1. Sanitize User Input

**✅ Requerido:**
```typescript
import { sanitize } from 'sanitize-html';

const cleanInput = sanitize(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {}
});
```

### 2. Secrets en Environment Variables

**❌ Prohibido:**
```typescript
const JWT_SECRET = 'my-super-secret-key';  // ❌ Hardcoded
```

**✅ Requerido:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

## 🔍 Enforcement

### Automated

- **ESLint:** `npm run lint`
- **Prettier:** `npm run format`
- **TypeScript:** `npm run build`
- **Tests:** `npm test`

### Manual

- **Code reviews:** Todos los PRs requieren 1+ aprobación
- **Pre-commit hooks:** Lint + format automático
- **CI/CD:** Pipeline falla si lint/tests fallan

---

## 📚 Referencias

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Clean Code (Robert C. Martin)](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Próxima revisión:** 2025-12-07
