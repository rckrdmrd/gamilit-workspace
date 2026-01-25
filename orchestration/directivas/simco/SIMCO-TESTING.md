# SIMCO-TESTING
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P0
**Alias:** @TESTING
**Creado:** 2026-01-10
**Depende de:** SIMCO-BACKEND.md, SIMCO-FRONTEND.md

---

## 1. Proposito

Establecer estandares minimos de testing para todos los proyectos, definiendo cobertura requerida, tipos de tests y convenciones de nomenclatura.

---

## 2. Principios de Testing

### 2.1 Testing como Requisito

- Todo codigo nuevo DEBE incluir tests
- Tests antes de PR (no despues)
- Cobertura minima es un gate de CI/CD

### 2.2 Piramide de Testing

```
         ╱╲
        ╱  ╲
       ╱E2E ╲        (pocos, lentos, costosos)
      ╱──────╲
     ╱Integr. ╲      (algunos, moderados)
    ╱──────────╲
   ╱   Unit     ╲    (muchos, rapidos, baratos)
  ╱──────────────╲
```

### 2.3 Test-Driven Approach

1. Escribir test que falla
2. Implementar codigo minimo
3. Refactorizar
4. Repetir

---

## 3. Cobertura Minima por Tipo

### 3.1 Backend

| Tipo | Cobertura Minima | Herramienta |
|------|------------------|-------------|
| Unit | 70% | Jest |
| Integration | 50% | Jest + Supertest |
| E2E | 30% | Jest + Supertest |

### 3.2 Frontend

| Tipo | Cobertura Minima | Herramienta |
|------|------------------|-------------|
| Components | 60% | Jest + Testing Library |
| Hooks | 70% | Jest |
| E2E | 20% | Playwright/Cypress |

### 3.3 Database

| Tipo | Cobertura | Herramienta |
|------|-----------|-------------|
| Migrations | 100% | Script validacion |
| Rollback | 100% | Script validacion |
| Functions | 80% | pgTAP |

---

## 4. Tipos de Tests Requeridos

### 4.1 Unit Tests

**Proposito:** Probar funciones/metodos aislados

**Caracteristicas:**
- Sin dependencias externas
- Mocks para servicios
- Rapidos (<100ms por test)

```typescript
// Ejemplo: user.service.spec.ts
describe('UserService', () => {
  describe('create', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const dto = { email: 'test@test.com', password: '123456' };

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
    });
  });
});
```

### 4.2 Integration Tests

**Proposito:** Probar interaccion entre componentes

**Caracteristicas:**
- Base de datos de prueba
- Servicios reales (no mocks)
- Moderadamente rapidos

```typescript
// Ejemplo: auth.integration.spec.ts
describe('Auth Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  it('should login and return valid token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### 4.3 E2E Tests

**Proposito:** Probar flujos completos de usuario

**Caracteristicas:**
- Ambiente completo
- Desde UI hasta DB
- Lentos pero completos

```typescript
// Ejemplo: login.e2e.spec.ts
describe('Login Flow', () => {
  it('should allow user to login', async () => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@test.com');
    await page.fill('[data-testid="password"]', '123456');
    await page.click('[data-testid="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 5. Nomenclatura de Archivos de Test

### 5.1 Patrones por Tipo

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Unit | `{nombre}.spec.ts` | `user.service.spec.ts` |
| Integration | `{nombre}.integration.spec.ts` | `auth.integration.spec.ts` |
| E2E | `{nombre}.e2e.spec.ts` | `login.e2e.spec.ts` |

### 5.2 Ubicacion

```
src/
├── modules/
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.service.spec.ts        # Unit test junto al archivo
│       └── __tests__/
│           └── auth.integration.spec.ts
test/
└── e2e/
    └── auth/
        └── login.e2e.spec.ts
```

---

## 6. Estructura de Carpetas de Test

### 6.1 Backend (NestJS)

```
apps/backend/
├── src/
│   └── modules/
│       └── {modulo}/
│           ├── {modulo}.service.spec.ts
│           ├── {modulo}.controller.spec.ts
│           └── __tests__/
│               ├── {modulo}.integration.spec.ts
│               └── fixtures/
├── test/
│   ├── e2e/
│   │   └── {modulo}/
│   │       └── {feature}.e2e.spec.ts
│   ├── fixtures/
│   └── setup.ts
└── jest.config.js
```

### 6.2 Frontend (React)

```
apps/frontend/
├── src/
│   └── components/
│       └── {Component}/
│           ├── {Component}.tsx
│           ├── {Component}.test.tsx
│           └── __tests__/
│               └── integration.test.tsx
├── tests/
│   └── e2e/
│       └── {feature}/
│           └── {scenario}.spec.ts
└── playwright.config.ts
```

---

## 7. Comandos de Ejecucion

### 7.1 Backend

```bash
# Unit tests
npm run test

# Unit tests con cobertura
npm run test:cov

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### 7.2 Frontend

```bash
# Component tests
npm run test

# Cobertura
npm run test:coverage

# E2E con Playwright
npm run test:e2e

# E2E con UI
npm run test:e2e:ui
```

### 7.3 Scripts en package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:cov": "jest --coverage",
    "test:watch": "jest --watch",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "jest --config jest.e2e.config.js"
  }
}
```

---

## 8. Monitoreo Basico

### 8.1 Metricas de Testing

| Metrica | Descripcion | Umbral |
|---------|-------------|--------|
| Coverage % | Porcentaje de lineas cubiertas | >70% |
| Test Pass Rate | % de tests pasando | 100% |
| Test Duration | Tiempo total de ejecucion | <5min CI |
| Flaky Tests | Tests inconsistentes | 0 |

### 8.2 Reportes

```bash
# Generar reporte HTML de cobertura
npm run test:cov -- --coverageReporters=html

# Ubicacion: coverage/lcov-report/index.html
```

### 8.3 CI/CD Integration

```yaml
# .github/workflows/test.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run tests
      run: npm run test:cov
    - name: Check coverage threshold
      run: |
        coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
        if (( $(echo "$coverage < 70" | bc -l) )); then
          echo "Coverage $coverage% is below 70%"
          exit 1
        fi
```

---

## 9. Integracion con CI/CD

### 9.1 Gates de Calidad

| Gate | Descripcion | Bloquea PR |
|------|-------------|------------|
| Tests Pass | Todos los tests pasan | SI |
| Coverage Min | Cobertura >= umbral | SI |
| No New Flaky | Sin tests flaky nuevos | SI |
| Performance | Tiempo < limite | NO |

### 9.2 Pre-commit Hooks

```bash
# .husky/pre-commit
npm run test:staged
npm run lint-staged
```

---

## 10. Anti-patrones a Evitar

| Anti-patron | Problema | Solucion |
|-------------|----------|----------|
| Tests sin asserts | No validan nada | Agregar expect() |
| Mocks excesivos | No prueban integracion | Balance unit/integration |
| Tests lentos | Bloquean desarrollo | Optimizar o mover a nightly |
| Datos hardcoded | Fragiles | Usar factories/fixtures |
| Skip tests | Deuda tecnica | Arreglar o eliminar |

---

## 11. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-BACKEND.md | Estructura backend |
| SIMCO-FRONTEND.md | Estructura frontend |
| SIMCO-DEVOPS.md | CI/CD |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
