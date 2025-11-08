# Testing GAMILIT - Índice de Documentación

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Módulo:** Testing - Documentación Principal
**Fecha:** 2025-10-27
**Versión:** 1.0
**Documento RFC:** RFC-0001

---

## Introducción

Esta carpeta contiene la documentación completa de testing para el proyecto GAMILIT. La guía está modularizada en cuatro documentos especializados que cubren testing de backend, frontend, integración/E2E y métricas de cobertura.

### Objetivo General

Mantener un estándar de calidad de **80% de cobertura** en todas las capas críticas del sistema mediante testing unitario, de integración y end-to-end.

---

## Estructura de Documentación

### 1. [Testing Backend](./Testing-Backend.md)

**Líneas:** ~250
**Contenido:**
- Stack de testing backend (Jest, TypeScript, Supertest)
- Configuración de Jest (jest.config.js)
- Ejemplos de tests de servicios, repositorios y controladores
- Testing de middlewares y validaciones
- Mocking de dependencias (DB, bcrypt, JWT)
- Comandos NPM y mejores prácticas
- Patrones comunes de testing backend

**Cuándo consultar:**
- Implementando tests para servicios Node.js/Express
- Configurando Jest en nuevos módulos
- Mockeando repositorios o dependencias externas
- Escribiendo tests de integración HTTP

---

### 2. [Testing Frontend](./Testing-Frontend.md)

**Líneas:** ~250
**Contenido:**
- Stack de testing frontend (Vitest, React Testing Library)
- Configuración de Vitest (vitest.config.ts)
- Tests de componentes React
- Testing de stores Zustand
- Testing de custom hooks
- Simulación de interacciones de usuario (userEvent)
- Testing de utilidades y API clients
- Comandos NPM y mejores prácticas
- Queries semánticas de Testing Library

**Cuándo consultar:**
- Escribiendo tests de componentes React
- Testeando hooks personalizados
- Configurando Vitest en nuevas features
- Implementando tests de stores o contextos
- Validando interacciones de usuario

---

### 3. [Testing de Integración y E2E](./Testing-Integracion.md)

**Líneas:** ~150
**Contenido:**
- Tests de integración backend con Supertest
- Tests de integración frontend con MSW (Mock Service Worker)
- Configuración de Playwright para E2E
- Ejemplos de flujos completos de usuario
- Setup de base de datos de test
- Estrategias de autenticación en tests
- Testing de flujos multi-paso
- Mejores prácticas de aislamiento

**Cuándo consultar:**
- Implementando tests de endpoints completos
- Validando flujos de usuario end-to-end
- Configurando MSW para mock de API
- Escribiendo tests E2E con Playwright
- Testeando interacciones frontend-backend

---

### 4. [Métricas y Cobertura](./Testing-Cobertura.md)

**Líneas:** ~94
**Contenido:**
- Objetivo de cobertura: 80% mínimo
- Explicación de métricas (Lines, Functions, Branches, Statements)
- Configuración de thresholds en Jest y Vitest
- Interpretación de reportes HTML de cobertura
- Exclusiones de cobertura justificadas
- Integración con CI/CD (GitHub Actions, SonarQube)
- Estrategias para mejorar cobertura
- Comandos útiles de análisis

**Cuándo consultar:**
- Configurando thresholds de cobertura
- Interpretando reportes de coverage
- Identificando áreas sin testear
- Integrando cobertura con CI/CD
- Estableciendo estándares de calidad

---

## Flujo de Trabajo de Testing

### 1. Desarrollo de Feature Nueva

```
1. Escribir tests antes o durante el desarrollo (TDD/BDD)
2. Ejecutar tests en modo watch: npm run test:watch
3. Verificar cobertura: npm run test:coverage
4. Asegurar mínimo 80% en código nuevo
```

### 2. Code Review

```
1. Verificar que PR incluye tests
2. Revisar calidad de tests (no solo cobertura)
3. Validar que tests pasan en CI/CD
4. Comprobar que cobertura global no disminuye
```

### 3. Integración Continua

```
1. Tests unitarios se ejecutan en cada push
2. Tests de integración en cada PR
3. Tests E2E en pre-merge a main
4. Reportes de cobertura publicados automáticamente
```

---

## Quick Start

### Configuración Inicial

**Backend:**
```bash
cd backend
npm install
npm test
```

**Frontend:**
```bash
cd frontend
npm install
npm run test
```

### Comandos Principales

| Comando | Backend (Jest) | Frontend (Vitest) |
|---------|---------------|-------------------|
| Ejecutar todos los tests | `npm test` | `npm run test` |
| Modo watch | `npm run test:watch` | `npm run test:watch` |
| Cobertura | `npm run test:coverage` | `npm run test:coverage` |
| UI interactiva | N/A | `npm run test:ui` |
| Tests específicos | `npm test -- file.test.ts` | `npm run test -- file.test.tsx` |

### Ejecutar Tests E2E

```bash
# Playwright
npx playwright test
npx playwright test --headed
npx playwright test --debug
```

---

## Stack de Tecnologías

### Backend
- **Framework:** Jest 29.x
- **TypeScript:** ts-jest
- **HTTP Testing:** Supertest
- **Mocking:** jest.mock(), jest.fn()
- **Coverage:** Istanbul (integrado en Jest)

### Frontend
- **Framework:** Vitest 1.x
- **Testing Library:** @testing-library/react 14.x
- **User Events:** @testing-library/user-event
- **Mocking:** vi.mock() (Vitest)
- **Coverage:** c8 / vitest coverage

### E2E
- **Framework:** Playwright
- **Navegadores:** Chromium, Firefox, WebKit
- **Alternativa:** Cypress

### Integración
- **API Mocking:** MSW (Mock Service Worker)
- **DB Testing:** PostgreSQL test database

---

## Estándares de Cobertura

### Objetivo Mínimo: 80%

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| **Lines** | Líneas ejecutadas | 80% |
| **Functions** | Funciones llamadas | 80% |
| **Branches** | Ramas de decisión | 80% |
| **Statements** | Sentencias ejecutadas | 80% |

### Priorización por Criticidad

| Nivel | Tipo de Código | Cobertura |
|-------|----------------|-----------|
| Crítico | Auth, Pagos, Servicios core | 90-95% |
| Alto | Repositorios, Controladores | 80-90% |
| Medio | Componentes UI, Hooks | 70-80% |
| Bajo | Config, Constantes, Tipos | 50-70% |

---

## Mejores Prácticas Generales

### 1. Principios Fundamentales

- **AAA Pattern:** Arrange (preparar), Act (ejecutar), Assert (verificar)
- **Test Isolation:** Cada test debe ser independiente
- **Descriptive Names:** Usar formato `should [behavior] when [condition]`
- **Mock External Dependencies:** Mockear APIs, DBs, servicios externos
- **Test Behavior, Not Implementation:** Testear el "qué", no el "cómo"

### 2. Organización de Tests

```
src/
  modules/
    auth/
      __tests__/
        auth.service.test.ts
        auth.controller.test.ts
        auth.middleware.test.ts
      auth.service.ts
      auth.controller.ts
      auth.middleware.ts
```

### 3. Nomenclatura de Archivos

- **Backend:** `*.test.ts` o `*.spec.ts`
- **Frontend:** `*.test.tsx` o `*.spec.tsx`
- **E2E:** `*.spec.ts` en carpeta `/e2e`

### 4. Cobertura vs Calidad

- 80% de cobertura con tests significativos > 100% con tests triviales
- Priorizar código crítico de negocio
- No perseguir 100% a ciegas
- Revisar reportes HTML regularmente

---

## Estructura de Carpeta testing/

```
testing/
├── README.md                    # Este archivo (índice principal)
├── Testing-Backend.md           # Testing backend con Jest
├── Testing-Frontend.md          # Testing frontend con Vitest
├── Testing-Integracion.md       # Tests de integración y E2E
└── Testing-Cobertura.md         # Métricas y cobertura
```

---

## Recursos Adicionales

### Documentación Externa

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest GitHub](https://github.com/ladjs/supertest)
- [MSW Documentation](https://mswjs.io/docs/)

### Documentación Interna GAMILIT

**Backend:**
- [Estructura Backend](../backend/ESTRUCTURA-Y-MODULOS.md)
- [Servicios Principales](../backend/SERVICIOS-PRINCIPALES.md)

**Frontend:**
- [Estructura Frontend](../frontend/ESTRUCTURA-Y-FEATURES.md)
- [Guía de Componentes](../frontend/COMPONENTES-UI.md)

**Base de Datos:**
- [Modelo de Datos](../base-de-datos/MODELO-DE-DATOS.md)

---

## Soporte y Contribución

### Reportar Problemas

Si encuentras problemas o tienes sugerencias para mejorar la documentación de testing:

1. Crea un issue en el repositorio
2. Etiqueta con `documentation` y `testing`
3. Describe el problema o sugerencia con detalle

### Contribuir

Para contribuir a la documentación de testing:

1. Lee la documentación actual completamente
2. Identifica áreas de mejora o contenido faltante
3. Crea un PR con tus cambios
4. Asegúrate de que los ejemplos funcionan
5. Actualiza este README si agregas nuevas secciones

---

## Changelog

### Versión 1.0 (2025-10-27)

- Creación inicial de documentación modularizada
- Separación de TESTING-GUIDE.md en 4 documentos especializados
- Testing-Backend.md: Stack Jest, ejemplos y configuración
- Testing-Frontend.md: Stack Vitest, componentes, hooks y stores
- Testing-Integracion.md: Supertest, MSW, Playwright
- Testing-Cobertura.md: Métricas, thresholds y mejores prácticas
- README.md: Índice de navegación y quick start

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**RFC:** RFC-0001
**Cobertura objetivo:** 80%
