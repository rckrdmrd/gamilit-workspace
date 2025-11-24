# CHECKLIST DE CODE REVIEW PARA APIs

**Versión:** 1.0
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Motivación:** Prevenir bugs de configuración de rutas API mediante revisión sistemática

---

## PROBLEMA IDENTIFICADO

La falta de un checklist específico para revisión de código API resultó en:

1. Bugs de duplicación de rutas (`/api/api/`)
2. Configuraciones inconsistentes entre backend y frontend
3. URLs hardcodeadas en lugar de usar variables de entorno
4. Falta de validación de configuración de rutas
5. Errores que solo se detectaban en runtime

Este checklist establece **revisiones obligatorias** antes de aprobar cualquier PR que involucre APIs.

---

## CHECKLIST COMPLETO

### SECCIÓN 1: CONFIGURACIÓN DE BASE URL

#### 1.1. Variables de Entorno

- [ ] Verificar que existe variable `VITE_API_URL` en `.env` (frontend)
- [ ] Verificar que existe variable `PORT` en `.env` (backend)
- [ ] Verificar que NO hay `/api` en la variable `VITE_API_URL`
- [ ] Verificar que variables están documentadas en `.env.example`
- [ ] Verificar configuración para todos los ambientes (dev, staging, prod)

**Ejemplo Correcto:**
```env
# .env
VITE_API_URL=http://localhost:3000  # ✅ Sin /api al final
```

**Ejemplo Incorrecto:**
```env
# .env
VITE_API_URL=http://localhost:3000/api  # ❌ Incluye /api
```

#### 1.2. Configuración de API Client

- [ ] Verificar que `baseURL` incluye `${VITE_API_URL}/api`
- [ ] Verificar que `baseURL` NO incluye rutas de recursos
- [ ] Verificar que timeout está configurado (ej: 10000ms)
- [ ] Verificar que headers default están configurados
- [ ] Verificar que NO hay URLs absolutas hardcodeadas

**Archivo a revisar:** `apps/frontend/web/src/lib/apiClient.ts`

```typescript
// ✅ CORRECTO
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
});

// ❌ INCORRECTO
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',  // ❌ Hardcoded
});
```

---

### SECCIÓN 2: DEFINICIÓN DE ENDPOINTS (FRONTEND)

#### 2.1. Services de API

- [ ] Verificar que endpoints NO incluyen prefijo `/api`
- [ ] Verificar que endpoints comienzan con `/`
- [ ] Verificar que NO hay trailing slashes innecesarios
- [ ] Verificar que NO hay URLs completas (solo paths relativos)
- [ ] Verificar que parámetros dinámicos usan template literals correctamente

**Archivos a revisar:** `apps/frontend/web/src/services/*.ts`

```typescript
// ✅ CORRECTO
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('/health');  // ✅
    return response.data;
  },
};

// ❌ INCORRECTO
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('/api/health');  // ❌ Duplica /api
    return response.data;
  },
};
```

#### 2.2. Endpoints con Parámetros

- [ ] Verificar que IDs se pasan como parámetros de ruta
- [ ] Verificar que query params usan objeto `params`
- [ ] Verificar que template literals tienen validación
- [ ] Verificar que NO hay concatenación de strings insegura

```typescript
// ✅ CORRECTO
async findById(id: string) {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

async searchUsers(query: string, page: number) {
  const response = await apiClient.get('/users', {
    params: { q: query, page },  // ✅ Query params
  });
  return response.data;
}

// ❌ INCORRECTO
async findById(id: string) {
  const response = await apiClient.get('/users?id=' + id);  // ❌ Concatenación
  return response.data;
}
```

#### 2.3. Manejo de Respuestas

- [ ] Verificar que se retorna `response.data`
- [ ] Verificar que hay manejo de errores apropiado
- [ ] Verificar que tipos de respuesta están definidos
- [ ] Verificar que NO se exponen errores internos al usuario

```typescript
// ✅ CORRECTO
export const userService = {
  async findById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('[UserService] Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },
};
```

---

### SECCIÓN 3: CONTROLADORES (BACKEND)

#### 3.1. Decoradores de Controlador

- [ ] Verificar que `@Controller()` NO incluye prefijo `/api`
- [ ] Verificar que ruta del controlador es singular o plural consistente
- [ ] Verificar que decoradores de método están correctos
- [ ] Verificar que NO hay rutas hardcodeadas

**Archivos a revisar:** `apps/backend/src/modules/*/controllers/*.controller.ts`

```typescript
// ✅ CORRECTO
@Controller('health')  // ✅ Sin /api
export class HealthController {
  @Get()              // GET /api/health
  @Get('database')    // GET /api/health/database
}

// ❌ INCORRECTO
@Controller('api/health')  // ❌ Genera /api/api/health
export class HealthController {
  // ...
}

@Controller('/health')     // ❌ / inicial innecesario
export class HealthController {
  // ...
}
```

#### 3.2. Métodos de Controlador

- [ ] Verificar que decoradores HTTP son correctos (`@Get`, `@Post`, etc.)
- [ ] Verificar que parámetros usan decoradores apropiados (`@Param`, `@Query`, `@Body`)
- [ ] Verificar que tipos de respuesta están definidos
- [ ] Verificar que hay validación de DTOs

```typescript
// ✅ CORRECTO
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Get()
  async findAll(@Query('page') page: number = 1): Promise<User[]> {
    return this.usersService.findAll(page);
  }
}
```

#### 3.3. Prefijo Global

- [ ] Verificar que `app.setGlobalPrefix('api')` está en `main.ts`
- [ ] Verificar que prefijo es consistente en toda la aplicación
- [ ] Verificar que NO hay múltiples prefijos globales

**Archivo a revisar:** `apps/backend/src/main.ts`

```typescript
// ✅ CORRECTO
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');  // ✅ Prefijo global
  await app.listen(3000);
}
```

---

### SECCIÓN 4: CORS Y SEGURIDAD

#### 4.1. Configuración CORS

- [ ] Verificar que CORS está habilitado
- [ ] Verificar que `origin` usa variable de entorno
- [ ] Verificar que métodos permitidos son apropiados
- [ ] Verificar que headers permitidos incluyen los necesarios
- [ ] Verificar que `credentials: true` si se usan cookies

```typescript
// ✅ CORRECTO
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### 4.2. Autenticación

- [ ] Verificar que token se envía en header `Authorization`
- [ ] Verificar que interceptor agrega token automáticamente
- [ ] Verificar que hay manejo de token expirado (401)
- [ ] Verificar que NO se guarda token en localStorage si no es necesario

```typescript
// ✅ CORRECTO
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### SECCIÓN 5: TESTING

#### 5.1. Tests de Servicios (Frontend)

- [ ] Verificar que hay tests para cada método de servicio
- [ ] Verificar que se mockea `apiClient`
- [ ] Verificar que se validan endpoints correctos
- [ ] Verificar que se validan parámetros y body

```typescript
// ✅ CORRECTO
describe('healthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call correct endpoint', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: { status: 'ok' },
    });

    await healthService.checkHealth();

    expect(getSpy).toHaveBeenCalledWith('/health');  // ✅ Validar endpoint
  });
});
```

#### 5.2. Tests de Controladores (Backend)

- [ ] Verificar que hay tests para cada endpoint
- [ ] Verificar que se validan rutas correctas
- [ ] Verificar que se validan status codes
- [ ] Verificar que se validan respuestas

```typescript
// ✅ CORRECTO
describe('HealthController', () => {
  it('GET /api/health should return health status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')  // ✅ Ruta completa con /api
      .expect(200);

    expect(response.body).toHaveProperty('status');
  });
});
```

#### 5.3. Tests E2E

- [ ] Verificar que hay tests E2E para flujos críticos
- [ ] Verificar que tests validan URLs completas
- [ ] Verificar que NO hay URLs hardcodeadas en tests
- [ ] Verificar que tests usan variables de entorno

---

### SECCIÓN 6: VALIDACIÓN EN BROWSER

#### 6.1. Network Tab

- [ ] Abrir DevTools > Network tab
- [ ] Ejecutar request que se está revisando
- [ ] Verificar que URL final NO tiene `/api/api/`
- [ ] Verificar que status code es correcto (200, 201, etc.)
- [ ] Verificar que response body es correcto
- [ ] Verificar que headers incluyen `Authorization` si es necesario

**Ejemplo de validación:**
```
Request URL: http://localhost:3000/api/health  ✅
Request Method: GET
Status Code: 200 OK
```

#### 6.2. Console Logs

- [ ] Verificar que NO hay errores en consola
- [ ] Verificar que logs de API son correctos
- [ ] Verificar que NO hay warnings de CORS
- [ ] Verificar que NO hay errores 404

```typescript
// Logs esperados en desarrollo
[API] GET /health
[API] Response: { status: 'ok' }
```

---

### SECCIÓN 7: DOCUMENTACIÓN

#### 7.1. Comentarios en Código

- [ ] Verificar que servicios tienen JSDoc
- [ ] Verificar que endpoints están documentados
- [ ] Verificar que parámetros están explicados
- [ ] Verificar que respuestas esperadas están documentadas

```typescript
// ✅ CORRECTO
/**
 * Health Service
 * Handles health check endpoints
 */
export const healthService = {
  /**
   * Check API health status
   * @returns Promise<HealthStatus>
   * @endpoint GET /api/health
   */
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },
};
```

#### 7.2. README y Docs

- [ ] Verificar que endpoints están documentados en README
- [ ] Verificar que ejemplos de uso son correctos
- [ ] Verificar que variables de entorno están listadas
- [ ] Verificar que setup instructions son actuales

---

### SECCIÓN 8: CONSISTENCIA

#### 8.1. Backend ↔ Frontend

- [ ] Verificar que rutas de backend coinciden con frontend
- [ ] Verificar que DTOs son consistentes
- [ ] Verificar que tipos de respuesta coinciden
- [ ] Verificar que manejo de errores es consistente

**Tabla de verificación:**

| Backend | Frontend | Status |
|---------|----------|--------|
| GET /api/health | apiClient.get('/health') | ✅ |
| GET /api/health/database | apiClient.get('/health/database') | ✅ |
| GET /api/users/:id | apiClient.get(`/users/${id}`) | ✅ |

#### 8.2. Nombrado

- [ ] Verificar que nombres de servicios siguen convención
- [ ] Verificar que nombres de controladores siguen convención
- [ ] Verificar que nombres de métodos son descriptivos
- [ ] Verificar que nombres de archivos son consistentes

**Referencia:** [ESTANDARES-NOMENCLATURA.md](./ESTANDARES-NOMENCLATURA.md)

---

## CHECKLIST RESUMIDO (QUICK CHECK)

### Para Reviewers: Mínimo Obligatorio

**Frontend:**
- [ ] NO hay `/api` en endpoints de servicios
- [ ] `baseURL` usa variable de entorno
- [ ] Hay manejo de errores

**Backend:**
- [ ] `@Controller()` NO incluye `/api`
- [ ] Prefijo global está en `main.ts`
- [ ] CORS está configurado

**Testing:**
- [ ] Probar en Network tab del navegador
- [ ] Verificar URL final correcta
- [ ] Verificar status 200 OK

**General:**
- [ ] NO hay URLs hardcodeadas
- [ ] Documentación actualizada
- [ ] Tests pasan

---

## PROCESO DE REVISIÓN

### 1. Pre-Review (Autor del PR)

Antes de crear el PR, ejecutar:

```bash
# 1. Linter
npm run lint

# 2. Tests
npm run test

# 3. Build
npm run build

# 4. Verificar archivos modificados
git diff --name-only main
```

### 2. Code Review (Reviewer)

1. **Leer descripción del PR**
   - Entender qué endpoints se agregaron/modificaron
   - Verificar que hay context sobre los cambios

2. **Revisar archivos en orden:**
   - Backend: `main.ts` → controladores → servicios
   - Frontend: `apiClient.ts` → servicios → componentes
   - Tests: Backend → Frontend → E2E

3. **Usar este checklist** como guía

4. **Probar localmente:**
   ```bash
   git checkout feature/branch-name
   npm install
   npm run dev
   # Abrir http://localhost:5173
   # Abrir DevTools > Network
   # Probar endpoints
   ```

5. **Dejar comentarios:**
   - Bloquear si hay errores críticos
   - Solicitar cambios si hay issues menores
   - Aprobar si todo está correcto

### 3. Post-Merge

- [ ] Verificar que CI/CD pasa
- [ ] Verificar deployment en staging
- [ ] Smoke test en staging
- [ ] Notificar al equipo de cambios en API

---

## HERRAMIENTAS DE APOYO

### 1. VSCode Extension

```json
// .vscode/settings.json
{
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. GitHub PR Template

```markdown
<!-- .github/pull_request_template.md -->

## API Changes

- [ ] Backend endpoints modified
- [ ] Frontend services modified
- [ ] Tests added/updated
- [ ] Tested in Network tab
- [ ] Documentation updated

### Endpoints Changed

List of endpoints:
- GET /api/...
- POST /api/...

### Testing

- [ ] Local testing done
- [ ] No /api/api/ duplicates
- [ ] CORS working
- [ ] All tests pass
```

### 3. Automated Checks

```yaml
# .github/workflows/api-validation.yml

name: API Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check for /api/api/ duplicates
        run: |
          if grep -r "apiClient\.\(get\|post\|put\|delete\|patch\)(['\"]\/api\/" apps/frontend/; then
            echo "ERROR: Found /api prefix in endpoint"
            exit 1
          fi

      - name: Check for hardcoded URLs
        run: |
          if grep -r "http://localhost:3000" apps/frontend/web/src --exclude-dir=node_modules; then
            echo "ERROR: Found hardcoded URL"
            exit 1
          fi
```

---

## REFERENCIAS

- [ESTANDARES-API-ROUTES.md](./ESTANDARES-API-ROUTES.md) - Estándares de rutas API
- [ESTANDARES-TESTING-API.md](./ESTANDARES-TESTING-API.md) - Estándares de testing
- [PITFALLS-API-ROUTES.md](./PITFALLS-API-ROUTES.md) - Errores comunes
- [ESTANDARES-NOMENCLATURA.md](./ESTANDARES-NOMENCLATURA.md) - Nomenclatura

---

**Uso:** Obligatorio en todos los code reviews que involucren APIs
**Responsable:** Code reviewer asignado al PR
**Frecuencia:** En cada PR antes de merge
