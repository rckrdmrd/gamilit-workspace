# Testing Strategy - Redirect

> **Este documento es un redirect.** La estrategia de testing se mantiene en ubicaciones especializadas.

---

## Resumen de Estrategia

GAMILIT usa una piramide de tests con Jest (backend) y Vitest (frontend). El umbral minimo es 50% de cobertura con objetivo gradual a 80% (ADR-044). Tests de integracion cubren flujos criticos (auth, ejercicios, gamificacion). Estado actual: 2324 tests (2296 passed + 28 skipped), 63 spec files.

## Documentos SSOT

### Politica y Estandar
- **[ESTANDAR-TESTING.md](../40-standards/ESTANDAR-TESTING.md)** -- Estandar de testing (politica, umbrales, convenciones)
- **[ADR-044](../90-adr/ADR-044-testing-coverage-strategy.md)** -- Decision arquitectonica: cobertura 50% minimo, objetivo 80%

### Guias de Implementacion
- **[docs/50-guides/testing/](../50-guides/testing/_INDEX.md)** -- Indice completo de guias de testing
- [GUIA-COVERAGE-TESTING.md](../50-guides/testing/GUIA-COVERAGE-TESTING.md) -- Estrategia de cobertura
- [GUIA-E2E-PLAYWRIGHT.md](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) -- Testing E2E con Playwright
- [GUIA-ARCHITECTURE-TESTING.md](../50-guides/testing/GUIA-ARCHITECTURE-TESTING.md) -- Testing de arquitectura
- [GUIA-RESPONSIVE-TESTING.md](../50-guides/testing/GUIA-RESPONSIVE-TESTING.md) -- Testing responsive

### Testing de Ejercicios Educativos
- **[exercise-guides/](../50-guides/testing/exercise-guides/_INDEX.md)** -- Respuestas ejemplo y criterios de validacion para 23 tipos de ejercicio (5 modulos)

## Comandos Rapidos

```bash
# Backend tests
cd apps/backend && npm run test && npm run test:cov

# Frontend tests
cd apps/frontend && npm run test && npm run test:coverage

# Database validation
bash apps/database/scripts/recreate-database.sh
```

---

*Redirect creado 2026-02-27 -- Wave 3 Documentation Audit*
