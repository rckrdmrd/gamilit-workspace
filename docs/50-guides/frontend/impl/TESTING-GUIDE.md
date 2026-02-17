# Guía de Testing Frontend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/frontend/src/

---

## Resumen

GAMILIT utiliza Vitest como framework de testing para el frontend, junto con React Testing Library para tests de componentes y MSW para mocking de API.

---

## Stack de Testing

- **Vitest**: Framework de testing (compatible con Jest)
- **React Testing Library**: Testing de componentes React
- **MSW (Mock Service Worker)**: Mocking de API
- **Testing Library User Event**: Simulación de interacciones

---

## Ejecutar Tests

```bash
# Todos los tests
npm run test

# Modo watch
npm run test:watch

# Con UI interactiva
npm run test:ui

# Coverage
npm run test:coverage

# Un archivo específico
npm run test -- RankBadge.test.tsx
```

---

## Estructura de Tests

```
features/gamification/
├── components/
│   ├── RankBadge.tsx
│   └── __tests__/
│       └── RankBadge.test.tsx
├── hooks/
│   ├── useUserStats.ts
│   └── __tests__/
│       └── useUserStats.test.ts
└── services/
    ├── gamification.service.ts
    └── __tests__/
        └── gamification.service.test.ts
```

---

## Testing de Componentes

### Test Básico

```typescript
// features/gamification/components/__tests__/RankBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { RankBadge } from '../RankBadge';

describe('RankBadge', () => {
  const mockRank = {
    id: '1',
    name: 'Ajaw',
    level: 1,
    iconUrl: '/icons/ajaw.png',
    minXp: 0,
    maxXp: 500,
  };

  it('renders rank name', () => {
    render(<RankBadge rank={mockRank} />);

    expect(screen.getByText('Ajaw')).toBeInTheDocument();
  });

  it('renders rank icon', () => {
    render(<RankBadge rank={mockRank} />);

    const img = screen.getByRole('img', { name: 'Ajaw' });
    expect(img).toHaveAttribute('src', '/icons/ajaw.png');
  });

  it('applies size classes', () => {
    render(<RankBadge rank={mockRank} size="lg" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('w-16', 'h-16');
  });

  it('hides label when showLabel is false', () => {
    render(<RankBadge rank={mockRank} showLabel={false} />);

    expect(screen.queryByText('Ajaw')).not.toBeInTheDocument();
  });
});
```

### Test con Interacciones

```typescript
// features/gamification/components/__tests__/ComodinCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComodinCard } from '../ComodinCard';

describe('ComodinCard', () => {
  const mockComodin = {
    id: '1',
    name: 'Segunda Oportunidad',
    price: 50,
    description: 'Permite reintentar un ejercicio',
  };

  it('calls onPurchase when buy button is clicked', async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();

    render(
      <ComodinCard
        comodin={mockComodin}
        onPurchase={onPurchase}
        userCoins={100}
      />
    );

    await user.click(screen.getByRole('button', { name: /comprar/i }));

    expect(onPurchase).toHaveBeenCalledWith('1');
  });

  it('disables buy button when insufficient coins', () => {
    render(
      <ComodinCard
        comodin={mockComodin}
        onPurchase={vi.fn()}
        userCoins={30}
      />
    );

    const button = screen.getByRole('button', { name: /comprar/i });
    expect(button).toBeDisabled();
  });
});
```

---

## Testing de Hooks

### Hook con React Query

```typescript
// features/gamification/hooks/__tests__/useUserStats.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStats } from '../useUserStats';
import { gamificationService } from '../../services/gamification.service';

vi.mock('../../services/gamification.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserStats', () => {
  it('returns user stats on success', async () => {
    const mockStats = {
      totalXp: 500,
      mlCoins: 100,
      currentLevel: 2,
    };

    vi.mocked(gamificationService.getMyStats).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useUserStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
  });

  it('handles error state', async () => {
    vi.mocked(gamificationService.getMyStats).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useUserStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### Hook con Zustand

```typescript
// features/auth/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../../stores/auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('sets auth state on login', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth('token123', { id: '1', name: 'Test' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('token123');
    expect(result.current.user).toEqual({ id: '1', name: 'Test' });
  });

  it('clears auth state on logout', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth('token123', { id: '1', name: 'Test' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
  });
});
```

---

## Mocking de API con MSW

### Setup

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/gamification/stats', () => {
    return HttpResponse.json({
      totalXp: 500,
      mlCoins: 100,
      currentLevel: 2,
    });
  }),

  http.get('/api/v1/gamification/achievements', () => {
    return HttpResponse.json([
      { id: '1', name: 'First Steps', isCompleted: true },
      { id: '2', name: 'Explorer', isCompleted: false },
    ]);
  }),

  http.post('/api/v1/gamification/comodines/purchase', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true });
  }),
];

// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// test/setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Usar en Tests

```typescript
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('GamificationPage', () => {
  it('displays stats from API', async () => {
    render(<GamificationPage />);

    await waitFor(() => {
      expect(screen.getByText('500 XP')).toBeInTheDocument();
      expect(screen.getByText('100 ML Coins')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    server.use(
      http.get('/api/v1/gamification/stats', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<GamificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing de Formularios

```typescript
// features/auth/components/__tests__/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
});
```

---

## Providers Wrapper

```typescript
// test/utils/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: WrapperProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Uso

```typescript
import { render, screen } from '@/test/utils/test-utils';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    // Test...
  });
});
```

---

## Coverage Thresholds

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/index.ts',
      ],
    },
  },
});
```

---

## Buenas Prácticas

1. **Testear comportamiento, no implementación**: Qué hace, no cómo lo hace
2. **Queries accesibles primero**: `getByRole`, `getByLabelText`
3. **User events sobre fireEvent**: `userEvent.click()` más realista
4. **Evitar testing de estilos**: Salvo que sea funcional
5. **Un expect por test** cuando sea posible
6. **Describir escenarios**: `describe` anidados claros
7. **Mock solo lo necesario**: No sobre-mockear

---

## Ver También

- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) - Dónde ubicar tests
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Testing de stores
- [../../testing/TESTING-GUIDE.md](../../testing/TESTING-GUIDE.md) - Guía general de testing
