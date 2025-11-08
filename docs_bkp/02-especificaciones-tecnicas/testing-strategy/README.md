# TESTING STRATEGY - GAMILIT PLATFORM

**Proyecto:** Gamilit Platform
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Base
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Introducción

Esta es la estrategia completa de testing para la plataforma Gamilit, una plataforma educativa gamificada que requiere los más altos estándares de calidad.

**Objetivo:** Garantizar calidad, confiabilidad y performance mediante una suite completa de tests automatizados.

---

## Documentación Modular

La estrategia de testing ha sido dividida en módulos especializados para facilitar la navegación y mantenimiento:

### 📋 Documentos Disponibles

1. **[Unit Testing](./unit-testing.md)**
   - Estrategias de testing unitario
   - Configuración de Jest y Vitest
   - Patrones de testing (AAA, mocking)
   - Coverage targets por módulo
   - **Líneas:** ~350

2. **[Integration Testing](./integration-testing.md)**
   - API testing con Supertest
   - Test database strategies
   - WebSocket testing
   - API endpoint coverage
   - **Líneas:** ~300

3. **[E2E Testing](./e2e-testing.md)**
   - Playwright setup y configuración
   - Flujos críticos de usuario
   - Page Object Model
   - Ejemplos completos de E2E tests
   - **Líneas:** ~320

4. **[Performance Testing](./performance-testing.md)**
   - Load testing con k6
   - Frontend performance (Lighthouse)
   - Database performance testing
   - Benchmarks y targets
   - **Líneas:** ~280

5. **[Security Testing](./security-testing.md)**
   - SAST (SonarQube)
   - DAST (OWASP ZAP)
   - Dependency scanning (npm audit, Snyk)
   - Security testing checklist
   - OWASP Top 10 coverage
   - **Líneas:** ~350

6. **[Test Infrastructure](./test-infrastructure.md)**
   - Test environment setup
   - Test utilities y helpers
   - Test data management
   - CI/CD pipelines
   - Best practices
   - **Líneas:** ~380

---

## Visión General de la Estrategia

### Pirámide de Testing

```
                    ┌──────────────┐
                    │  E2E (10%)   │  ← 7 flujos críticos
                    │   ~30 tests  │     User journeys completos
                    └──────────────┘
                  ┌──────────────────┐
                  │ Integration (20%)│  ← 60 tests
                  │   API + DB       │     Contratos, endpoints
                  └──────────────────┘
               ┌────────────────────────┐
               │   Unit Tests (70%)     │  ← 210 tests
               │  Functions, Services   │     Business logic, utils
               └────────────────────────┘
```

**Distribución Objetivo (300 tests total):**
- **210 Unit Tests (70%):** Funciones puras, services, utils, validations
- **60 Integration Tests (20%):** API endpoints, database operations, service integration
- **30 E2E Tests (10%):** User flows críticos end-to-end

---

## Objetivos de Calidad

| Objetivo | Target | Actual | Prioridad |
|----------|--------|--------|-----------|
| **Functional Correctness** | 99.5%+ features según spec | TBD | 🔴 CRÍTICO |
| **Code Coverage Backend** | 80%+ | ~15% | 🟡 ALTA |
| **Code Coverage Frontend** | 70%+ | ~20% | 🟡 ALTA |
| **Performance P95** | < 500ms | TBD | 🟡 ALTA |
| **Security Vulnerabilities** | 0 críticas | TBD | 🔴 CRÍTICO |
| **Availability** | 99.5% uptime | TBD | 🟡 ALTA |
| **Test Execution Time** | < 5 min (unit), < 15 min (all) | TBD | 🟢 MEDIA |

---

## Herramientas y Frameworks

### Backend (Node.js + TypeScript + Express)

```json
{
  "testing": {
    "unit-integration": "Jest 30.x",
    "e2e": "Supertest",
    "mocking": "jest.mock",
    "coverage": "Istanbul (built-in Jest)",
    "test-db": "PostgreSQL Test Instance",
    "assertions": "Jest Matchers"
  }
}
```

### Frontend (React + Vite + TypeScript)

```json
{
  "testing": {
    "unit-integration": "Vitest 3.x",
    "component-testing": "React Testing Library 16.x",
    "e2e": "Playwright",
    "mocking": "vi (Vitest)",
    "coverage": "c8 (via Vitest)",
    "dom-testing": "jsdom 27.x",
    "user-simulation": "@testing-library/user-event 14.x",
    "accessibility": "@axe-core/react 4.x"
  }
}
```

### Performance Testing

| Tool | Purpose | Target Metrics |
|------|---------|----------------|
| **k6** | Load testing | Concurrent users, throughput |
| **Artillery** | Alternative load testing | RPS, latency |
| **Lighthouse** | Frontend performance | LCP < 2.5s, FID < 100ms |

### Security Testing

| Tool | Type | Frequency |
|------|------|-----------|
| **SonarQube** | SAST | Every commit (CI/CD) |
| **npm audit** | Dependency scan | Daily |
| **Snyk** | Vulnerability scan | Weekly |
| **OWASP ZAP** | DAST | Weekly (staging) |

---

## Estado Actual del Testing

### Tests Existentes (13 archivos)

**Backend (5):**
1. ✅ `rls.middleware.security.test.ts` - SQL injection protection
2. ✅ `ownership.middleware.test.ts` - Ownership validation
3. ✅ `idor-protection.test.ts` - IDOR integration tests
4. ✅ `security-token-hashing.test.ts` - Token security
5. ✅ `maya-ranks-consistency.test.ts` - Rank system tests

**Frontend (8):**
1. ✅ `LoginPage.test.tsx` - Login flow + account states
2. ✅ `RegisterPage.test.tsx` - Registration flow
3. ✅ `EmailVerificationPage.test.tsx` - Email verification
4. ✅ `UserManagementPage.test.tsx` - Admin user management
5. ✅ `StatusBadge.test.tsx` - UI component
6. ✅ `DeactivateUserModal.test.tsx` - Admin modal
7. ✅ `LiveLeaderboard.test.tsx` - Leaderboard component
8. ✅ `useSanitizedHTML.test.ts` - Security hook

### Gap Analysis

**Cobertura Actual:**
- ✅ **Security Tests:** ~60% (BUENO - SQL injection, IDOR, token hashing)
- 🔴 **Unit Tests:** ~15% (CRÍTICO - falta cobertura en exercise engine, gamification)
- 🔴 **Integration Tests:** ~10% (CRÍTICO - solo IDOR protection)
- 🔴 **E2E Tests:** 0% (CRÍTICO - ningún flujo completo implementado)

**Gaps Críticos:**
1. ❌ Exercise engine (crucigrama, word search, matching) - 0 tests
2. ❌ Gamification system (ML Coins, ranks, power-ups) - 0 tests
3. ❌ Social features (guilds, chat) - 0 tests
4. ❌ E2E user flows - 0 tests
5. ❌ Performance tests - 0 tests
6. ❌ Load tests - 0 tests

---

## Próximos Pasos (Prioridad)

### Fase 1: Fundamentos (Sprint 1-2)
1. 🔴 Crear tests para exercise engine (CRÍTICO para core business)
2. 🔴 Implementar E2E tests para flujo estudiante completo
3. 🟡 Setup de Playwright para E2E

### Fase 2: Cobertura Completa (Sprint 3-4)
4. 🟡 Aumentar cobertura de gamification system
5. 🟡 Tests de integración para APIs educativas
6. 🟢 Configurar k6 para performance testing

### Fase 3: Optimización (Sprint 5+)
7. 🟢 Performance testing automatizado
8. 🟢 Security scanning en CI/CD
9. 🟢 Coverage reporting automatizado

---

## Quick Start

### Ejecutar Tests

```bash
# Backend - Unit Tests
cd projects/gamilit-platform-backend
npm test
npm run test:watch
npm run test:coverage

# Frontend - Unit Tests
cd projects/gamilit-platform-web
npm test
npm run test:watch
npm run test:coverage

# Integration Tests
npm run test:integration

# E2E Tests (Playwright)
npx playwright test
npx playwright test --ui
npx playwright test --debug

# Performance Tests (k6)
k6 run load-tests/api-exercises.js

# Security Scan
npm audit
snyk test
```

### Generar Reportes

```bash
# Coverage report
npm run test:coverage
open coverage/index.html

# E2E report
npx playwright show-report

# Performance report
k6 run --out json=results.json load-tests/api-exercises.js
```

---

## Flujos Críticos a Testear (E2E)

### Prioridad CRÍTICA (7 flujos)

1. **User Registration → Email Verification → Login**
   - Estado: Parcialmente implementado (tests unitarios)
   - Gap: Falta flujo completo E2E

2. **Student: Browse → Select Exercise → Solve → Submit → See Results**
   - Estado: NO IMPLEMENTADO
   - Prioridad: CRÍTICA
   - Valor de negocio: Core functionality

3. **Student: Buy Power-up → Use in Exercise → See Effect**
   - Estado: NO IMPLEMENTADO
   - Prioridad: ALTA

4. **Student: Complete Module → Rank Up → Unlock New Content**
   - Estado: NO IMPLEMENTADO
   - Prioridad: CRÍTICA (Sistema de progresión)

5. **Teacher: Create Classroom → Invite Students → Assign Task**
   - Estado: NO IMPLEMENTADO
   - Prioridad: ALTA

6. **Teacher: Grade Submission → Give Feedback → Student Notified**
   - Estado: NO IMPLEMENTADO
   - Prioridad: MEDIA

7. **Admin: Moderate Content → Approve/Reject → Notify Creator**
   - Estado: Parcialmente implementado (UserManagementPage.test.tsx)

---

## Coverage Targets

### Global Targets

```
┌──────────────────────┬─────────┬─────────┬──────────┐
│ Component            │ Target  │ Actual  │ Status   │
├──────────────────────┼─────────┼─────────┼──────────┤
│ Backend Global       │ 80%     │ ~15%    │ 🔴 GAP   │
│ Frontend Global      │ 70%     │ ~20%    │ 🔴 GAP   │
│ Critical Modules     │ 95%     │ ~30%    │ 🔴 GAP   │
│ Security Functions   │ 100%    │ ~60%    │ 🟡 GOOD  │
└──────────────────────┴─────────┴─────────┴──────────┘
```

### Module-Specific Targets

Ver [Unit Testing - Coverage Targets](./unit-testing.md#coverage-targets) para detalles completos por módulo.

---

## Contacto y Soporte

**Owner:** QA Team + Engineering Team
**Próxima revisión:** Cada sprint
**Última actualización:** 01 de Noviembre, 2025

Para preguntas o sugerencias sobre la estrategia de testing, contactar al equipo de QA.

---

## Changelog

### v1.0 - 01 Nov 2025
- ✅ Modularización completa de TESTING-STRATEGY.md (2,468 líneas → 6 archivos)
- ✅ Creación de documentos especializados por tipo de testing
- ✅ Headers estándar RFC-0001 aplicados
- ✅ README principal con navegación y overview
- ✅ Respaldo del archivo original creado

---

**Archivo original respaldado en:**
`/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/02-especificaciones-tecnicas/TESTING-STRATEGY.md.backup`
