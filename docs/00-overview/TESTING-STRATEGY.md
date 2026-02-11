# Testing Strategy - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Tests Activos:** 833 passing

---

## Resumen

GAMILIT implementa una estrategia de testing basada en la piramide de tests, con enfasis en tests unitarios para logica de negocio y tests de integracion para flujos criticos.

| Nivel | Framework | Cantidad | Cobertura Target |
|-------|-----------|----------|------------------|
| Unit Tests (Backend) | Jest | ~550 | 80% |
| Unit Tests (Frontend) | Vitest | ~200 | 70% |
| Integration Tests | Jest + Supertest | ~70 | Flujos criticos |
| E2E Tests | Pending | ~13 | Flujos principales |
| **Total** | | **833** | **80% global** |

---

## Piramide de Tests

```
        /\
       /  \
      / E2E \         <- Flujos principales (13 planificados)
     /--------\
    / Integracion \    <- Flujos criticos entre modulos (~70)
   /--------------\
  /   Unit Tests    \  <- Logica de negocio, services, hooks (~750)
 /------------------\
```

---

## Backend (Jest)

### Configuracion
```typescript
// jest.config.ts
{
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 }
  }
}
```

### Tests Unitarios (~550)
Cada modulo tiene tests unitarios para:
- **Services:** Logica de negocio aislada con mocks de repositorios
- **Controllers:** Validacion de rutas, parametros, respuestas
- **Guards:** Verificacion de autorizacion y roles
- **Pipes:** Validacion y transformacion de datos

Modulos con mayor cobertura:
| Modulo | Tests | Cobertura |
|--------|-------|-----------|
| auth | ~45 | 90% |
| gamification | ~40 | 85% |
| exercises | ~50 | 85% |
| users | ~30 | 90% |
| students | ~30 | 80% |
| content | ~25 | 80% |

### Tests de Integracion (~70)
Tests que validan interaccion entre modulos:
- Auth -> Users (registro completo)
- Exercises -> Gamification (XP award on completion)
- Exercises -> Students (progress tracking)
- Gamification -> Leaderboard (ranking update)
- Gamification -> Achievements (unlock check)
- Notifications -> Email/Push (delivery flow)
- Teachers -> Classrooms -> Students (assignment flow)

### Comandos
```bash
cd apps/backend

# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests de un modulo
npm run test -- --testPathPattern=modules/gamification

# Watch mode
npm run test:watch
```

---

## Frontend (Vitest)

### Configuracion
```typescript
// vitest.config.ts
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: { lines: 70, functions: 70, branches: 65, statements: 70 }
    }
  }
}
```

### Tests Unitarios (~200)
- **Components:** Renderizado, interacciones de usuario, estados
- **Hooks:** Logica custom, side effects, estado
- **Stores:** Estado Zustand, acciones, selectors
- **Services:** Llamadas API, transformacion de datos

Componentes con mayor cobertura:
| Area | Tests | Cobertura |
|------|-------|-----------|
| Gamification components | ~35 | 80% |
| Exercise components | ~40 | 75% |
| Auth components | ~20 | 85% |
| Student portal | ~30 | 70% |
| Shared components | ~25 | 75% |

### Testing Library
- **@testing-library/react:** Renderizado y queries
- **@testing-library/user-event:** Simulacion de interacciones
- **MSW (Mock Service Worker):** Mock de API calls

### Comandos
```bash
cd apps/frontend

# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npm run test:coverage

# Watch mode
npm run test:watch

# Tests de un directorio
npm run test -- --testPathPattern=components/gamification
```

---

## Tests de Integracion

### Flujos Criticos Cubiertos

1. **Flujo de autenticacion completo**
   - Register -> Login -> Refresh -> Logout
   - OAuth flow
   - Password reset

2. **Flujo de ejercicio completo**
   - Student selects exercise -> Loads content -> Submits answer -> Evaluates -> Awards XP -> Updates leaderboard

3. **Flujo de asignacion**
   - Teacher creates assignment -> Students receive notification -> Complete -> Teacher reviews

4. **Flujo de gamificacion**
   - Exercise completion -> XP calculation -> Level check -> Rank promotion -> Achievement unlock -> Notification

5. **Flujo de tienda**
   - Earn ML Coins -> Browse store -> Purchase item -> Add to inventory -> Apply effect

---

## Database Testing

### Validacion DDL
```bash
# Recrear BD completa y validar schemas
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-arch/workspace-projects/scripts/database/unified-recreate-db.sh' gamilit --drop
```

### Validaciones Automaticas
- RLS policies activas en todas las tablas multi-tenant (282 policies)
- Funciones SQL ejecutan sin errores (128 funciones)
- Triggers disparan correctamente (49 triggers)
- Foreign keys validas (299 FKs)
- ENUMs sincronizados con backend (36 ENUMs)

---

## Metricas de Calidad

### Estado Actual
| Metrica | Valor | Target |
|---------|-------|--------|
| Tests pasando | 833 | 100% |
| Cobertura backend | ~75% | 80% |
| Cobertura frontend | ~65% | 70% |
| Coherencia DDL-Backend | 82.5% | 100% |
| Tests de integracion | ~70 | 100+ |
| E2E tests | Planificados | 13+ |

### Objetivos Post-MVP
- Alcanzar 80% cobertura global
- Implementar E2E tests para flujos principales
- Agregar tests de carga (k6/Artillery)
- Tests de accesibilidad (axe-core)
- Tests de visual regression

---

## CI/CD Integration

### Pre-commit Hooks
```bash
# Verificaciones antes de commit
npm run lint
npm run typecheck
npm run test -- --bail
```

### Pipeline de CI
```
Push to main
  -> Install dependencies
  -> Lint (backend + frontend)
  -> TypeCheck (backend + frontend)
  -> Unit tests (backend + frontend)
  -> Integration tests
  -> Build (backend + frontend)
  -> Deploy (if all pass)
```

---

*GAMILIT - Testing Strategy*
*833 tests pasando - Target 80% cobertura*
