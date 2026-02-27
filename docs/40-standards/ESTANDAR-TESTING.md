---
titulo: Estandar de Testing
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - unit-tests
  - integration-tests
  - e2e-tests
  - jest
  - playwright
aplica_a:
  - backend
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing — GAMILIT

> Este estandar ha sido dividido en archivos especializados para mejor mantenibilidad.
> Version anterior (2.0.0, 1582 lineas, 2026-02-14) fue refactorizada a v3.0.0 el 2026-02-27.

## Archivos

| Archivo | Contenido | Secciones |
|---------|-----------|-----------|
| [ESTANDAR-TESTING-UNIT.md](ESTANDAR-TESTING-UNIT.md) | Unit tests, naming, mocking, test data | Piramide + Unit + Naming + Mocking + Data |
| [ESTANDAR-TESTING-INTEGRATION.md](ESTANDAR-TESTING-INTEGRATION.md) | Integration tests (backend, frontend, DB) | Integration Tests |
| [ESTANDAR-TESTING-E2E.md](ESTANDAR-TESTING-E2E.md) | E2E tests + visual regression | E2E + Playwright + Visual Regression |
| [ESTANDAR-TESTING-ARCHITECTURE.md](ESTANDAR-TESTING-ARCHITECTURE.md) | Architecture tests (ts-arch, circular deps) | Architecture Tests |

---

## 5. Cobertura Minima

### 5.1 Objetivos de Cobertura

| Metrica | Minimo | Objetivo | Critico |
|---------|--------|----------|---------|
| Statements | 75% | 80% | 85% |
| Branches | 70% | 75% | 80% |
| Functions | 80% | 85% | 90% |
| Lines | 75% | 80% | 85% |

### 5.2 Configuracion Jest Coverage

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/**/*.mock.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
    // Umbrales mas estrictos para codigo critico
    './src/core/auth/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
    './src/core/payments/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 100,
      lines: 95,
    },
  },
};
```

### 5.3 Excepciones Documentadas

Las excepciones a la cobertura minima deben documentarse:

```typescript
// coverage-exceptions.ts
/**
 * EXCEPCIONES DE COBERTURA
 *
 * Archivo: src/infrastructure/external/legacy-adapter.ts
 * Cobertura actual: 45%
 * Razon: Codigo legacy en proceso de deprecacion
 * Responsable: @dev-lead
 * Fecha revision: 2026-03-01
 * Ticket: TECH-456
 *
 * Archivo: src/utils/dev-tools.ts
 * Cobertura actual: 0%
 * Razon: Utilidades solo para desarrollo, no se ejecutan en produccion
 * Responsable: @platform-team
 */
```

---

## 9. Checklist de Testing

### 9.1 Antes de Crear un Test

```markdown
[ ] He identificado el tipo de test necesario (unit/integration/e2e)
[ ] He verificado que no existe un test similar
[ ] He preparado los datos de prueba necesarios
[ ] He identificado las dependencias a mockear
```

### 9.2 Durante la Escritura del Test

```markdown
[ ] El nombre del test sigue la convencion should_X_when_Y
[ ] El test sigue el patron AAA (Arrange-Act-Assert)
[ ] El test es independiente de otros tests
[ ] El test es determinista (mismo resultado siempre)
[ ] He mockeado correctamente las dependencias externas
[ ] He evitado mockear la logica bajo test
```

### 9.3 Despues de Escribir el Test

```markdown
[ ] El test pasa consistentemente
[ ] El test falla cuando la funcionalidad esta rota
[ ] La cobertura cumple con los umbrales minimos
[ ] He ejecutado la suite completa para verificar no hay regresiones
[ ] He documentado casos especiales o excepciones
```

### 9.4 Para Tests de Integracion/E2E

```markdown
[ ] He configurado el cleanup de base de datos
[ ] He verificado que los tests se pueden ejecutar en paralelo
[ ] He configurado timeouts apropiados
[ ] He manejado estados de espera (loading, async)
[ ] He verificado que funcionan en CI/CD
```

### 9.5 Revision de PR con Tests

```markdown
[ ] Los tests nuevos cubren el codigo nuevo
[ ] No hay tests comentados o saltados sin justificacion
[ ] Los mocks son apropiados y minimos
[ ] Los nombres de test son descriptivos
[ ] No hay hardcoded waits (usar waitFor, expect.poll)
[ ] Los tests son mantenibles y legibles
```

---

## Referencias Cruzadas

### Estandares Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL.md](ESTANDAR-BACKEND-PROFESIONAL.md) - Testing patterns para backend NestJS
- [ESTANDAR-FRONTEND-PROFESIONAL.md](ESTANDAR-FRONTEND-PROFESIONAL.md) - Testing patterns para React

### Guias de Implementacion
- [GUIA-E2E-PLAYWRIGHT](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) - Testing E2E con Playwright para los 4 portales
- [GUIA-COVERAGE-TESTING](../50-guides/testing/GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas actuales

### Principios Aplicados
- [PRINCIPIO-SOLID](../../orchestration/directivas/principios/PRINCIPIO-SOLID.md) - Diseño testeable (SRP, DIP)
- [PRINCIPIO-VALIDACION-OBLIGATORIA](../../orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md) - Principio de validacion obligatoria (build + lint + tests)

---

## Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW - Mock Service Worker](https://mswjs.io/docs/)
- [Testing Trophy - Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
