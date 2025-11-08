# Testing en Frontend

**Código que mapea:** `apps/frontend/__tests__/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Estrategia y guía de testing para el frontend.

---

## 🧪 Stack de Testing

- **Framework:** Vitest
- **Testing Library:** React Testing Library
- **Coverage:** Vitest coverage

---

## 📊 Estado Actual

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| **Tests unitarios** | ~15 | 60 |
| **Coverage** | 13% | 70% |
| **Tests componentes** | ~10 | 180 |

**Gap:** 57% de cobertura faltante

---

## 📐 Estructura de Tests

```
apps/frontend/
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── Card.test.tsx
│   ├── features/
│   │   ├── auth/
│   │   └── exercises/
│   └── e2e/
│       └── user-flow.e2e.test.tsx
```

---

## 🎯 Comandos

```bash
npm test              # Ejecutar tests
npm run test:watch    # Watch mode
npm run test:ui       # UI de tests
npm run test:cov      # Con coverage
```

---

## 📝 Ejemplo de Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## 🚨 Tests Críticos Faltantes

1. **33 mecánicas educativas** - 0/33 testeadas
2. **Componentes compartidos** - 10/180 (5%)
3. **Integration tests** - Frontend ↔ Backend

**Prioridad:** P0

---

## 📚 Referencias

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

---

**Última actualización:** 2025-11-07
