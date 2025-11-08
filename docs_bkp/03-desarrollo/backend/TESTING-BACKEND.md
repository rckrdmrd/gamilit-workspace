# Testing en Backend

**Código que mapea:** `apps/backend/__tests__/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Estrategia y guía de testing para el backend.

---

## 🧪 Stack de Testing

- **Framework:** Jest
- **Coverage:** Jest coverage
- **Mocking:** Jest mocks

---

## 📊 Estado Actual

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| **Tests unitarios** | ~40 | 210 |
| **Coverage** | 15% | 70% |
| **Tests integración** | ~5 | 50 |

**Gap:** 81.7% de cobertura faltante

---

## 📐 Estructura de Tests

```
apps/backend/
├── __tests__/
│   ├── unit/
│   │   ├── auth/
│   │   │   └── auth.service.spec.ts
│   │   ├── educational/
│   │   └── gamification/
│   ├── integration/
│   │   └── api/
│   │       └── auth.api.spec.ts
│   └── e2e/
│       └── full-flow.e2e.spec.ts
```

---

## 🎯 Comandos

```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Watch mode
npm run test:cov      # Con coverage
npm run test:e2e      # Solo E2E
```

---

## 📝 Ejemplo de Test Unitario

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should validate correct credentials', async () => {
    const result = await service.validateUser('user@test.com', 'password123');
    expect(result).toBeDefined();
  });
});
```

---

## 🚨 Tests Críticos Faltantes

1. **Exercise engine** - 0/27 mecánicas testeadas
2. **RLS policies** - 0/41 policies testeadas
3. **Integration tests** - 3-capas

**Prioridad:** P0

---

## 📚 Referencias

- [docs/02-especificaciones-tecnicas/testing-strategy/](../../02-especificaciones-tecnicas/testing-strategy/)

---

**Última actualización:** 2025-11-07
