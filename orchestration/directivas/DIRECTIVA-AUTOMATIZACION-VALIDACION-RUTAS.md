# AUTOMATIZACIÓN DE VALIDACIÓN DE RUTAS API

**Versión:** 1.0
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Motivación:** Prevenir bugs de rutas API mediante automatización y validación continua

---

## PROBLEMA IDENTIFICADO

La validación manual de rutas API es propensa a errores humanos. Se requiere automatización para:

1. **Detectar duplicación de `/api`** en fase de desarrollo
2. **Validar configuración** antes de commit
3. **Ejecutar checks en CI/CD** antes de merge
4. **Monitorear rutas en runtime** (desarrollo)
5. **Generar reportes** de configuración de rutas

---

## ESTRATEGIA DE AUTOMATIZACIÓN

### Niveles de Validación

```
Desarrollo Local (IDE)
  ↓ ESLint Rules
  ↓ TypeScript Compiler

Pre-commit Hooks
  ↓ Git Hooks
  ↓ Husky + lint-staged

CI/CD Pipeline
  ↓ GitHub Actions
  ↓ Automated Tests

Runtime (Development)
  ↓ Request Interceptors
  ↓ Logging & Alerts

Monitoring (Production)
  ↓ Error Tracking
  ↓ Analytics
```

---

## 1. ESLINT RULES

### 1.1. Custom ESLint Rule - No API Prefix in Endpoints

**Archivo:** `eslint-rules/no-api-prefix-in-endpoints.js`

```javascript
/**
 * ESLint rule to prevent /api prefix in endpoint definitions
 *
 * Detects patterns like:
 * - apiClient.get('/api/health')
 * - apiClient.post('/api/users')
 * - fetch('/api/...')
 *
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow /api prefix in endpoint definitions',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noApiPrefix:
        'Endpoint should not include /api prefix. The baseURL already includes /api. Use "{{suggested}}" instead.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        // Detectar apiClient.get/post/put/delete/patch
        const isApiClientCall =
          node.callee?.object?.name === 'apiClient' &&
          node.callee?.property?.name &&
          ['get', 'post', 'put', 'delete', 'patch'].includes(
            node.callee.property.name
          );

        if (!isApiClientCall) return;

        const firstArg = node.arguments[0];

        // Verificar si el primer argumento es un string literal
        if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
          const endpoint = firstArg.value;

          // Detectar /api/ en el endpoint
          if (endpoint.startsWith('/api/')) {
            const suggested = endpoint.replace(/^\/api/, '');

            context.report({
              node: firstArg,
              messageId: 'noApiPrefix',
              data: {
                suggested,
              },
              fix(fixer) {
                // Auto-fix: remover /api del endpoint
                return fixer.replaceText(
                  firstArg,
                  `'${suggested}'`
                );
              },
            });
          }
        }

        // Verificar template literals
        if (firstArg?.type === 'TemplateLiteral') {
          const firstQuasi = firstArg.quasis[0];
          if (firstQuasi?.value?.raw?.startsWith('/api/')) {
            context.report({
              node: firstArg,
              messageId: 'noApiPrefix',
              data: {
                suggested: firstQuasi.value.raw.replace(/^\/api/, ''),
              },
            });
          }
        }
      },
    };
  },
};
```

### 1.2. Configuración de ESLint

**Archivo:** `.eslintrc.js`

```javascript
module.exports = {
  // ... otras configuraciones

  rules: {
    // ... otras reglas

    // Custom rule para prevenir /api en endpoints
    'no-api-prefix-in-endpoints': 'error',

    // Reglas adicionales útiles
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='apiClient'] Literal[value=/^\\/api\\//]",
        message: 'Endpoint should not include /api prefix',
      },
    ],
  },

  plugins: ['@typescript-eslint', 'react', 'custom-rules'],
};
```

### 1.3. Uso y Ejemplos

```bash
# Ejecutar ESLint
npm run lint

# Auto-fix
npm run lint -- --fix
```

**Resultado:**

```typescript
// Antes (con error)
apiClient.get('/api/health');  // ❌ ESLint error

// Después (auto-fixed)
apiClient.get('/health');  // ✅
```

---

## 2. TYPESCRIPT COMPILER CHECKS

### 2.1. Type-Safe Endpoint Helper

**Archivo:** `apps/frontend/web/src/lib/apiEndpoints.ts`

```typescript
/**
 * Type-safe endpoint helper to prevent /api prefix
 */

// Tipo que previene /api en endpoints
type ValidEndpoint = string & { __brand: 'ValidEndpoint' };

/**
 * Valida y crea un endpoint type-safe
 * @throws Error si endpoint contiene /api
 */
export function endpoint(path: string): ValidEndpoint {
  if (path.includes('/api/')) {
    throw new Error(
      `Invalid endpoint: "${path}" contains /api prefix. ` +
      `Remove /api as it's already in baseURL.`
    );
  }

  if (!path.startsWith('/')) {
    throw new Error(
      `Invalid endpoint: "${path}" must start with /`
    );
  }

  return path as ValidEndpoint;
}

/**
 * API Client wrapper con validación de endpoints
 */
export const api = {
  get<T = any>(path: ValidEndpoint, config?: AxiosRequestConfig) {
    return apiClient.get<T>(path, config);
  },

  post<T = any>(path: ValidEndpoint, data?: any, config?: AxiosRequestConfig) {
    return apiClient.post<T>(path, data, config);
  },

  put<T = any>(path: ValidEndpoint, data?: any, config?: AxiosRequestConfig) {
    return apiClient.put<T>(path, data, config);
  },

  delete<T = any>(path: ValidEndpoint, config?: AxiosRequestConfig) {
    return apiClient.delete<T>(path, config);
  },

  patch<T = any>(path: ValidEndpoint, data?: any, config?: AxiosRequestConfig) {
    return apiClient.patch<T>(path, data, config);
  },
};
```

### 2.2. Uso del Helper

```typescript
// apps/frontend/web/src/services/healthService.ts

import { api, endpoint } from '@/lib/apiEndpoints';

export const healthService = {
  async checkHealth() {
    // ✅ Compilación exitosa
    const response = await api.get(endpoint('/health'));
    return response.data;
  },

  // ❌ Error de compilación
  async invalid() {
    // TypeScript error: Invalid endpoint contains /api
    const response = await api.get(endpoint('/api/health'));
    return response.data;
  },
};
```

---

## 3. PRE-COMMIT HOOKS

### 3.1. Husky Configuration

**Instalación:**

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Archivo:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged
npx lint-staged

# Custom API route validation
node scripts/validate-api-routes.js

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit validation failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### 3.2. Lint-Staged Configuration

**Archivo:** `package.json`

```json
{
  "lint-staged": {
    "apps/frontend/web/src/services/**/*.ts": [
      "eslint --fix",
      "node scripts/validate-api-routes.js"
    ],
    "apps/backend/src/**/*.controller.ts": [
      "eslint --fix",
      "node scripts/validate-backend-routes.js"
    ]
  }
}
```

### 3.3. Custom Validation Script

**Archivo:** `scripts/validate-api-routes.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Validating API routes configuration...\n');

let hasErrors = false;

// Validar servicios de frontend
const serviceFiles = glob.sync('apps/frontend/web/src/services/**/*.ts');

serviceFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');

  // Buscar apiClient.get/post/etc con /api/
  const apiPrefixRegex = /apiClient\.(get|post|put|delete|patch)\s*\(\s*['"`]\/api\//g;
  const matches = content.match(apiPrefixRegex);

  if (matches) {
    hasErrors = true;
    console.error(`❌ Error in ${file}:`);
    console.error(`   Found ${matches.length} endpoint(s) with /api prefix`);
    matches.forEach((match) => {
      console.error(`   - ${match}`);
    });
    console.error('');
  }
});

// Validar controladores de backend
const controllerFiles = glob.sync('apps/backend/src/**/*.controller.ts');

controllerFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');

  // Buscar @Controller con /api
  const controllerRegex = /@Controller\s*\(\s*['"`](?:\/)?api\//g;
  const matches = content.match(controllerRegex);

  if (matches) {
    hasErrors = true;
    console.error(`❌ Error in ${file}:`);
    console.error(`   @Controller should not include /api prefix`);
    matches.forEach((match) => {
      console.error(`   - ${match}`);
    });
    console.error('');
  }
});

if (hasErrors) {
  console.error('❌ API route validation failed\n');
  console.error('Fix the errors above before committing.\n');
  process.exit(1);
} else {
  console.log('✅ All API routes are correctly configured\n');
  process.exit(0);
}
```

---

## 4. CI/CD PIPELINE

### 4.1. GitHub Actions Workflow

**Archivo:** `.github/workflows/api-validation.yml`

```yaml
name: API Routes Validation

on:
  pull_request:
    paths:
      - 'apps/frontend/web/src/services/**'
      - 'apps/backend/src/**/*.controller.ts'
      - 'apps/frontend/web/src/lib/apiClient.ts'
  push:
    branches:
      - main
      - develop

jobs:
  validate-api-routes:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Validate API routes
        run: node scripts/validate-api-routes.js

      - name: Check for /api/api/ in codebase
        run: |
          if grep -r "apiClient\.\(get\|post\|put\|delete\|patch\)(['\"]\/api\/" apps/frontend/web/src/services; then
            echo "❌ Found /api prefix in endpoint definitions"
            exit 1
          fi

      - name: Check for hardcoded URLs
        run: |
          if grep -r "http://localhost:3000" apps/frontend/web/src --exclude-dir=node_modules --exclude="*.test.ts" --exclude="*.spec.ts"; then
            echo "❌ Found hardcoded URLs"
            exit 1
          fi

      - name: Validate baseURL configuration
        run: |
          # Verificar que apiClient usa variable de entorno
          if ! grep -q "import.meta.env.VITE_API_URL" apps/frontend/web/src/lib/apiClient.ts; then
            echo "❌ apiClient should use VITE_API_URL environment variable"
            exit 1
          fi

      - name: Run tests
        run: npm run test

      - name: Upload validation report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: api-validation-report
          path: |
            eslint-report.json
            test-results/
```

### 4.2. Pull Request Template

**Archivo:** `.github/pull_request_template.md`

```markdown
## API Changes Checklist

- [ ] No `/api` prefix in endpoint definitions (services)
- [ ] No `/api` prefix in `@Controller()` decorators
- [ ] `baseURL` uses environment variable (`VITE_API_URL`)
- [ ] No hardcoded URLs in code
- [ ] Tested in browser Network tab
- [ ] All tests pass
- [ ] ESLint validation passes

### Endpoints Modified

List all API endpoints added or modified:

- GET /api/...
- POST /api/...
- PUT /api/...
- DELETE /api/...

### Testing Evidence

Please attach screenshot of Network tab showing correct URLs:

- [ ] Screenshot attached
- [ ] URLs do not contain `/api/api/`
- [ ] Status codes are correct
- [ ] No CORS errors
```

---

## 5. RUNTIME VALIDATION

### 5.1. Request Interceptor con Validación

**Archivo:** `apps/frontend/web/src/lib/apiClient.ts`

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
});

// Interceptor para validación en desarrollo
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(
    (config) => {
      const url = config.url || '';

      // Validación 1: Detectar /api/api/
      if (url.includes('/api/')) {
        const error = new Error(
          `[API Configuration Error]\n\n` +
          `Endpoint contains /api prefix: ${url}\n` +
          `This will create duplicate /api/api/ in final URL.\n\n` +
          `Fix: Remove /api from endpoint definition.\n` +
          `Example: Use '/health' instead of '/api/health'\n\n` +
          `See: ESTANDARES-API-ROUTES.md for details`
        );

        console.error(error);

        // En desarrollo, lanzar error para detener la ejecución
        throw error;
      }

      // Validación 2: Detectar falta de slash inicial
      if (url && !url.startsWith('/') && !url.startsWith('http')) {
        console.warn(
          `[API Warning] Endpoint missing leading slash: ${url}\n` +
          `This may cause incorrect URL concatenation.`
        );
      }

      // Validación 3: Detectar trailing slash
      if (url.endsWith('/') && url !== '/') {
        console.warn(
          `[API Warning] Endpoint has trailing slash: ${url}\n` +
          `Consider removing it for consistency.`
        );
      }

      // Logging detallado en desarrollo
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`[API Final URL] ${config.baseURL}${config.url}`);

      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      console.log(
        `[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
      return response;
    },
    (error) => {
      console.error('[API Response Error]', error);
      return Promise.reject(error);
    }
  );
}
```

### 5.2. Runtime Validation Test

**Archivo:** `apps/frontend/web/src/lib/__tests__/apiClient.runtime.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../apiClient';

describe('apiClient Runtime Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error for /api prefix in endpoint', async () => {
    // En desarrollo, debe lanzar error
    if (import.meta.env.DEV) {
      await expect(
        apiClient.get('/api/health')
      ).rejects.toThrow('Endpoint contains /api prefix');
    }
  });

  it('should allow valid endpoint', async () => {
    // Mock successful response
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { status: 'ok' },
    });

    await expect(
      apiClient.get('/health')
    ).resolves.toBeDefined();
  });
});
```

---

## 6. MONITORING Y ANALYTICS

### 6.1. Error Tracking (Sentry)

**Configuración:**

```typescript
// apps/frontend/web/src/lib/errorTracking.ts

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,

  beforeSend(event, hint) {
    // Detectar errores de configuración de API
    const error = hint.originalException;

    if (
      error instanceof Error &&
      error.message.includes('/api/api/')
    ) {
      // Marcar como error de configuración
      event.tags = {
        ...event.tags,
        error_type: 'api_configuration',
        severity: 'critical',
      };

      // Agregar contexto adicional
      event.contexts = {
        ...event.contexts,
        api_config: {
          baseURL: import.meta.env.VITE_API_URL,
          endpoint: error.message,
        },
      };
    }

    return event;
  },
});
```

### 6.2. Analytics Dashboard

```typescript
// apps/frontend/web/src/lib/analytics.ts

export function trackApiRequest(endpoint: string, method: string, status: number) {
  // Detectar anomalías
  if (endpoint.includes('/api/api/')) {
    console.error('[Analytics] Invalid API endpoint detected:', endpoint);

    // Enviar a analytics
    if (window.gtag) {
      window.gtag('event', 'api_error', {
        error_type: 'duplicate_api_prefix',
        endpoint,
        method,
      });
    }
  }

  // Track normal request
  if (window.gtag) {
    window.gtag('event', 'api_request', {
      endpoint,
      method,
      status,
    });
  }
}
```

---

## 7. HERRAMIENTAS DE DESARROLLO

### 7.1. VSCode Extension

**Archivo:** `.vscode/settings.json`

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },

  "editor.formatOnSave": true,

  "files.associations": {
    "*.service.ts": "typescript",
    "*.controller.ts": "typescript"
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },

  "eslint.options": {
    "overrideConfigFile": ".eslintrc.js"
  }
}
```

### 7.2. Snippets para VSCode

**Archivo:** `.vscode/api-snippets.code-snippets`

```json
{
  "API Service Method": {
    "prefix": "api-service-method",
    "body": [
      "async ${1:methodName}(${2:params}): Promise<${3:ReturnType}> {",
      "  try {",
      "    const response = await apiClient.${4:get}<${3:ReturnType}>('/${5:endpoint}');",
      "    return response.data;",
      "  } catch (error) {",
      "    console.error('[${TM_FILENAME_BASE}] Error:', error);",
      "    throw new Error('${6:Error message}');",
      "  }",
      "}"
    ],
    "description": "Create API service method with proper error handling"
  },

  "API Controller Method": {
    "prefix": "api-controller-method",
    "body": [
      "@${1:Get}('${2:path}')",
      "async ${3:methodName}(${4:params}): Promise<${5:ReturnType}> {",
      "  return this.${6:service}.${3:methodName}(${7:args});",
      "}"
    ],
    "description": "Create API controller method"
  }
}
```

---

## 8. DOCUMENTACIÓN AUTOMÁTICA

### 8.1. Swagger/OpenAPI Generation

```typescript
// apps/backend/src/main.ts

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('GAMILIT API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addServer('/api', 'API prefix')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Validar que todas las rutas tienen prefijo /api
  const paths = Object.keys(document.paths);
  const invalidPaths = paths.filter(path => !path.startsWith('/api/'));

  if (invalidPaths.length > 0) {
    console.error('❌ Invalid routes detected (missing /api prefix):');
    invalidPaths.forEach(path => console.error(`  - ${path}`));
    throw new Error('API routes validation failed');
  }

  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
```

---

## RESUMEN DE HERRAMIENTAS

| Herramienta | Fase | Propósito | Severidad |
|-------------|------|-----------|-----------|
| ESLint Rule | Desarrollo | Detectar /api en endpoints | Error |
| TypeScript Helper | Desarrollo | Type-safe endpoints | Error |
| Pre-commit Hook | Pre-commit | Validar antes de commit | Bloqueante |
| GitHub Actions | CI/CD | Validar en PR | Bloqueante |
| Request Interceptor | Runtime (Dev) | Detectar en ejecución | Error |
| Sentry | Production | Track errors | Monitoring |
| Swagger | Documentation | Validar rutas | Warning |

---

## REFERENCIAS

- [ESTANDARES-API-ROUTES.md](./ESTANDARES-API-ROUTES.md) - Estándares de rutas API
- [CHECKLIST-CODE-REVIEW-API.md](./CHECKLIST-CODE-REVIEW-API.md) - Checklist de code review
- [ESTANDARES-TESTING-API.md](./ESTANDARES-TESTING-API.md) - Testing de APIs
- [PITFALLS-API-ROUTES.md](./PITFALLS-API-ROUTES.md) - Errores comunes
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Uso:** Implementar herramientas de automatización progresivamente
**Prioridad:** ESLint > Pre-commit hooks > CI/CD > Runtime validation
**Mantenimiento:** Actualizar reglas conforme evoluciona el proyecto
