---
tipo: principio-diseno
nivel: 3-completo
version: 1.0.0
fecha: 2026-02-02
aplica_a:
  - backend-nestjs
  - frontend-react
  - todos-los-proyectos
alias:
  - "@DRY"
  - "@DONT-REPEAT-YOURSELF"
  - "@NO-REPETIR"
---

# PRINCIPIO: DRY - Don't Repeat Yourself

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Principio de Diseno - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los proyectos del workspace
**Origen:** Andy Hunt & Dave Thomas, "The Pragmatic Programmer", 1999

---

## DECLARACION DEL PRINCIPIO

```
+============================================================================+
|                                                                             |
|     "Every piece of knowledge must have a single, unambiguous,            |
|      authoritative representation within a system."                        |
|                                                                             |
|     "Cada pieza de conocimiento debe tener una unica, inequivoca          |
|      y autoritativa representacion dentro de un sistema."                 |
|                                                                             |
|                                            - The Pragmatic Programmer      |
|                                                                             |
+============================================================================+
```

---

## 1. DEFINICION

### Que es DRY

> **"No te repitas. La duplicacion es el enemigo del cambio."**

DRY no es solo sobre codigo duplicado. Es sobre **conocimiento duplicado**. Cada pieza de logica, cada regla de negocio, cada decision, debe existir en un solo lugar.

### Tipos de Duplicacion

```yaml
Duplicacion_de_Codigo:
  - Lineas identicas copiadas
  - Funciones similares con pequenas variaciones
  - Estructuras de datos repetidas

Duplicacion_de_Conocimiento:
  - Reglas de negocio en multiples lugares
  - Validaciones repetidas
  - Constantes con el mismo significado
  - Documentacion desincronizada del codigo

Duplicacion_Accidental:
  - Codigo que parece igual pero representa cosas diferentes
  - Coincidencia temporal que divergira
```

---

## 2. CUANDO EXTRAER CODIGO REUTILIZABLE

### La Regla de Tres (Rule of Three)

```yaml
Regla:
  - Primera vez: solo hazlo
  - Segunda vez: nota la duplicacion pero dejala
  - Tercera vez: AHORA refactoriza y extrae

Razon:
  - Dos ocurrencias pueden ser coincidencia
  - Tres ocurrencias confirman un patron
  - Extraer antes puede crear abstraccion incorrecta
```

### Criterios para Extraer

```typescript
// ANTES: Codigo duplicado en multiples lugares
// archivo1.ts
async function createUser(dto: CreateUserDto) {
  // Validacion duplicada
  if (!dto.email || !dto.email.includes('@')) {
    throw new BadRequestException('Invalid email');
  }
  if (!dto.password || dto.password.length < 8) {
    throw new BadRequestException('Password too short');
  }
  // ... crear usuario
}

// archivo2.ts
async function updateUser(dto: UpdateUserDto) {
  // Misma validacion duplicada
  if (dto.email && !dto.email.includes('@')) {
    throw new BadRequestException('Invalid email');
  }
  if (dto.password && dto.password.length < 8) {
    throw new BadRequestException('Password too short');
  }
  // ... actualizar usuario
}

// archivo3.ts
async function inviteUser(dto: InviteUserDto) {
  // Otra vez la misma validacion
  if (!dto.email || !dto.email.includes('@')) {
    throw new BadRequestException('Invalid email');
  }
  // ... invitar usuario
}


// DESPUES: Codigo extraido y reutilizado
// validators/email.validator.ts
export function validateEmail(email: string | undefined, required = true): void {
  if (required && !email) {
    throw new BadRequestException('Email is required');
  }
  if (email && !email.includes('@')) {
    throw new BadRequestException('Invalid email format');
  }
}

// validators/password.validator.ts
export function validatePassword(password: string | undefined, required = true): void {
  const MIN_LENGTH = 8;

  if (required && !password) {
    throw new BadRequestException('Password is required');
  }
  if (password && password.length < MIN_LENGTH) {
    throw new BadRequestException(`Password must be at least ${MIN_LENGTH} characters`);
  }
}

// Uso simplificado
async function createUser(dto: CreateUserDto) {
  validateEmail(dto.email, true);
  validatePassword(dto.password, true);
  // ... crear usuario
}

async function updateUser(dto: UpdateUserDto) {
  validateEmail(dto.email, false);
  validatePassword(dto.password, false);
  // ... actualizar usuario
}
```

### Senales de que Debes Extraer

| Senal | Accion |
|-------|--------|
| Copy-paste de codigo | Extraer a funcion/clase |
| Cambio que requiere modificar multiples archivos | Centralizar logica |
| Constantes con mismo valor en varios lugares | Crear archivo de constantes |
| Misma validacion en DTOs diferentes | Crear decorator personalizado |
| Mismo calculo en varios services | Crear utility function |

---

## 3. CUANDO NO APLICAR DRY

### Abstraccion Prematura

```typescript
// ANTI-PATRON: Abstraccion prematura
// Dos funciones que parecen similares pero son de dominios diferentes

// Sistema de usuarios
function calculateUserDiscount(user: User): number {
  const baseDiscount = 0.05;
  const loyaltyBonus = user.yearsActive * 0.01;
  return Math.min(baseDiscount + loyaltyBonus, 0.20);
}

// Sistema de productos
function calculateProductDiscount(product: Product): number {
  const baseDiscount = 0.05;
  const seasonalBonus = product.isOnSale ? 0.10 : 0;
  return Math.min(baseDiscount + seasonalBonus, 0.25);
}

// MAL: Forzar abstraccion incorrecta
// Estas funciones PARECEN similares pero representan CONOCIMIENTO DIFERENTE
// Si cambian las reglas de descuento de usuarios, no deberia afectar productos
function calculateDiscount(entity: User | Product, type: 'user' | 'product'): number {
  const baseDiscount = 0.05;
  let bonus = 0;
  let maxDiscount = 0;

  if (type === 'user') {
    bonus = (entity as User).yearsActive * 0.01;
    maxDiscount = 0.20;
  } else {
    bonus = (entity as Product).isOnSale ? 0.10 : 0;
    maxDiscount = 0.25;
  }

  return Math.min(baseDiscount + bonus, maxDiscount);
}

// CORRECTO: Mantener separado - es duplicacion ACCIDENTAL, no de conocimiento
// Cada funcion evoluciona independientemente segun su dominio
```

### WET - Write Everything Twice

```yaml
WET_Es_Valido_Cuando:
  - El codigo parece similar pero representa conceptos diferentes
  - La abstraccion seria mas compleja que la duplicacion
  - Los requisitos de cada copia pueden divergir
  - Estamos en exploracion/prototipo
  - La duplicacion es trivial (< 5 lineas)

Ejemplo:
  # Dos endpoints que validan emails
  # Si usuarios y contactos pueden tener reglas de email diferentes
  # en el futuro, mantenerlos separados es valido
```

### Balance con KISS

```typescript
// ANTES: DRY extremo que viola KISS
// Archivo de utilidades "todo en uno" que nadie entiende

type Transformer<T, U> = (input: T) => U;
type Predicate<T> = (input: T) => boolean;

function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  }) as T;
}

// DESPUES: Solucion mas simple y directa
// utils/format.ts - funciones especificas y claras
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-MX');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```

---

## 4. PATRONES DE REUTILIZACION

### Constantes y Configuracion

```typescript
// constants/validation.constants.ts
export const VALIDATION = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
} as const;

// constants/api.constants.ts
export const API = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

// Uso en DTOs
class CreateUserDto {
  @MaxLength(VALIDATION.EMAIL.MAX_LENGTH)
  @Matches(VALIDATION.EMAIL.PATTERN)
  email: string;

  @MinLength(VALIDATION.PASSWORD.MIN_LENGTH)
  @MaxLength(VALIDATION.PASSWORD.MAX_LENGTH)
  password: string;
}
```

### Utility Functions

```typescript
// utils/array.utils.ts
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// utils/date.utils.ts
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

  return date.toLocaleDateString('es-MX');
}
```

### Custom Decorators (NestJS)

```typescript
// decorators/validate-id.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export function ValidateId(description = 'Unique identifier') {
  return applyDecorators(
    IsNotEmpty(),
    IsUUID('4'),
    ApiProperty({
      description,
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
  );
}

// Uso
class GetUserDto {
  @ValidateId('User ID')
  id: string;
}

class GetOrderDto {
  @ValidateId('Order ID')
  orderId: string;
}


// decorators/paginated.decorator.ts
export function Paginated() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiOkResponse({
      schema: {
        properties: {
          data: { type: 'array' },
          total: { type: 'number' },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
      },
    }),
  );
}

// Uso
@Get()
@Paginated()
async findAll(@Query() query: PaginationDto) {
  return this.service.findAll(query);
}
```

### Custom Hooks (React)

```tsx
// hooks/useAsync.ts
interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// Uso en cualquier componente
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, refetch } = useAsync(
    () => userService.getById(userId),
    [userId]
  );

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
}


// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Uso
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Solo se ejecuta cuando debouncedSearch cambia (despues de 300ms de inactividad)
  const { data: results } = useAsync(
    () => searchService.search(debouncedSearch),
    [debouncedSearch]
  );

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <SearchResults results={results} />
    </div>
  );
}
```

### Shared Components (React)

```tsx
// components/common/DataTable.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No hay datos',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)} style={{ width: col.width }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'clickable' : ''}
          >
            {columns.map(col => (
              <td key={`${item.id}-${String(col.key)}`}>
                {col.render
                  ? col.render(item)
                  : String(item[col.key as keyof T] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Uso
function UserList() {
  const columns: Column<User>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Estado',
      render: user => <StatusBadge status={user.status} />,
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: user => formatDate(user.createdAt),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      onRowClick={user => navigate(`/users/${user.id}`)}
    />
  );
}
```

---

## 5. CHECKLIST DE VALIDACION

### Antes de Duplicar Codigo

```markdown
[ ] Busque codigo similar existente en el proyecto?
[ ] La logica que voy a escribir ya existe en otro lugar?
[ ] Hay una utilidad o helper que pueda usar?
[ ] Este es un patron comun que deberia centralizar?
```

### Antes de Extraer Codigo

```markdown
[ ] El codigo aparece 3+ veces?
[ ] Las copias representan el MISMO conocimiento/concepto?
[ ] La abstraccion es mas simple que la duplicacion?
[ ] Los usos evolucionaran juntos o separados?
[ ] La extraccion mejora la legibilidad?
```

### Senales de Violacion DRY

| Senal | Problema | Accion |
|-------|----------|--------|
| Copy-paste frecuente | Duplicacion de codigo | Extraer a funcion |
| Cambio en multiples archivos | Duplicacion de conocimiento | Centralizar |
| Constantes repetidas | Valores magicos duplicados | Crear constants file |
| Validaciones similares | Reglas duplicadas | Crear decorator/validator |
| Misma estructura de datos | Tipos duplicados | Crear type compartido |

---

## BALANCE DRY vs OTROS PRINCIPIOS

```yaml
DRY_vs_KISS:
  Problema: Abstraccion DRY puede volverse compleja
  Solucion: Si la abstraccion es mas compleja que duplicar, duplicar es valido
  Regla: La abstraccion debe ser mas CLARA que el codigo duplicado

DRY_vs_YAGNI:
  Problema: Crear abstraccion "por si acaso" se usa despues
  Solucion: Solo extraer cuando hay 3+ usos REALES
  Regla: No crear utilidades "genericas" para un solo uso

DRY_vs_SRP:
  Problema: Agrupar codigo no relacionado solo porque es similar
  Solucion: Solo agrupar codigo del mismo DOMINIO
  Regla: La reutilizacion no justifica violar responsabilidades
```

---

## REFERENCIAS

```yaml
Libros:
  - "The Pragmatic Programmer" - Hunt & Thomas (1999)
  - "Clean Code" - Robert C. Martin (2008)
  - "Refactoring" - Martin Fowler (2018)

Articulos:
  - "The Rule of Three" - Martin Fowler
  - "DRY is about Knowledge" - Dave Thomas

SIMCO_Relacionados:
  - "@KISS" - Keep It Simple
  - "@YAGNI" - You Aren't Gonna Need It
  - "@SOLID" - Principios SOLID
  - "@REUSABLE-CODE-INVENTORY" - Inventario de codigo reutilizable
```

---

## ALIAS

```yaml
@DRY:                  orchestration/directivas/principios/PRINCIPIO-DRY.md
@DONT-REPEAT-YOURSELF: orchestration/directivas/principios/PRINCIPIO-DRY.md
@NO-REPETIR:           orchestration/directivas/principios/PRINCIPIO-DRY.md
```

---

**Este principio es OBLIGATORIO para todos los proyectos del workspace.**

---

## Ver tambien

- [ESTANDAR-CODIGO](../../../docs/40-standards/ESTANDAR-CODIGO.md) - Estandar de codigo (lint, formato y estilo)

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Principio de Diseno
