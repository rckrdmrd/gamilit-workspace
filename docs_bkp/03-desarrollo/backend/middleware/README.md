# Middleware y Seguridad - Índice

**Proyecto:** GAMILIT
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Estructura de Middleware

Este directorio contiene la documentación de los middlewares de seguridad, autenticación y validación del backend de GAMILIT.

---

## Middlewares Disponibles

### 1. Middleware de Autenticación
**Archivo:** [Middleware-Autenticacion.md](./Middleware-Autenticacion.md)

Middlewares de autenticación y autorización:
- `authenticateJWT` - Validación de JWT
- `requireRole` - Autorización por rol
- `optionalAuth` - Autenticación opcional
- `requireOwnership` - Anti-IDOR

**Líneas:** ~350

---

### 2. Middleware de Validación
**Archivo:** [Middleware-Validacion.md](./Middleware-Validacion.md)

Validación de datos con Joi:
- `validate` - Validación genérica
- `validateBody` - Validar body
- `validateQuery` - Validar query params
- `validateParams` - Validar route params

**Líneas:** ~300

---

### 3. Seguridad CORS
**Archivo:** [Seguridad-CORS.md](./Seguridad-CORS.md)

Configuración de CORS y headers de seguridad:
- Helmet.js
- CORS policy
- Security headers
- CSP (Content Security Policy)

**Líneas:** ~300

---

### 4. Rate Limiting
**Archivo:** [Seguridad-Rate-Limiting.md](./Seguridad-Rate-Limiting.md)

Sistema de limitación de tasa:
- Rate limiters pre-configurados
- Custom rate limiters
- Headers de rate limit
- Arquitectura del sistema

**Líneas:** ~270

---

## Pipeline de Request

```
Request
  ↓
helmet (seguridad headers)
  ↓
cors (validar origen)
  ↓
body parser (JSON)
  ↓
logging (si dev)
  ↓
rate-limit (si configurado)
  ↓
auth (si requiere autenticación)
  ↓
validation (si hay esquema)
  ↓
ownership/permission (si requiere)
  ↓
Controller
  ↓
error handler (si hay error)
  ↓
Response
```

---

## Los 8 Middlewares Principales

| Middleware | Propósito | Ubicación en Pipeline |
|-----------|-----------|----------------------|
| **helmet** | Seguridad HTTP headers | Global (primero) |
| **cors** | CORS policy | Global (segundo) |
| **auth** | Autenticación JWT | Por ruta |
| **validation** | Validación de datos | Por ruta |
| **rate-limit** | Limitación de tasa | Por ruta |
| **ownership** | Anti-IDOR | Por ruta |
| **permission** | Autorización granular | Por ruta |
| **error** | Manejo de errores | Global (último) |

---

## Navegación Rápida

### Por Tipo de Seguridad

| Tipo | Middlewares | Archivo |
|------|-------------|---------|
| **Autenticación** | JWT, Role, Ownership | [Middleware-Autenticacion.md](./Middleware-Autenticacion.md) |
| **Validación** | Joi schemas, Input validation | [Middleware-Validacion.md](./Middleware-Validacion.md) |
| **Rate Limiting** | Auth, API, Upload limiters | [Seguridad-Rate-Limiting.md](./Seguridad-Rate-Limiting.md) |
| **Headers** | Helmet, CORS, CSP | [Seguridad-CORS.md](./Seguridad-CORS.md) |

---

## Ejemplo de Uso Completo

```typescript
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { authRateLimiter } from '@/middleware/rate-limit.middleware';
import { createClassroomSchema } from '@/validations/classroom.validation';

// Endpoint protegido completo
router.post('/api/teacher/classrooms',
  authRateLimiter,                      // 1. Rate limiting
  authenticateJWT,                      // 2. Autenticación
  requireRole('teacher', 'admin'),      // 3. Autorización por rol
  validate(createClassroomSchema),      // 4. Validación de datos
  classroomController.createClassroom   // 5. Controller
);
```

---

## Buenas Prácticas

### 1. Orden Correcto de Middlewares
```typescript
// ✓ Orden correcto
router.post('/api/resource',
  authRateLimiter,           // 1. Rate limiting primero
  authenticateJWT,           // 2. Autenticación
  requireRole('admin'),      // 3. Autorización por rol
  validate(schema),          // 4. Validación de datos
  controller.action          // 5. Controller
);
```

### 2. Usar requireOwnership para IDOR
```typescript
// ✓ PROTEGIDO
router.get('/api/users/:userId/data',
  authenticateJWT,
  requireOwnership('userId'),  // Anti-IDOR
  dataController.getData
);
```

### 3. Validar TODOS los Inputs
```typescript
router.get('/api/users/:id/posts',
  authenticateJWT,
  validateParams(userIdSchema),     // params
  validateQuery(paginationSchema),  // query
  controller.getUserPosts
);
```

---

## Diagrama de Seguridad en Capas

```
┌─────────────────────────────────────────────────────┐
│ Capa 1: Network Security                           │
│ - HTTPS/TLS                                         │
│ - Firewall rules                                    │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 2: HTTP Security (helmet)                     │
│ - Content Security Policy                           │
│ - X-Frame-Options: DENY                             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 3: Rate Limiting                              │
│ - Previene brute force                              │
│ - Previene DDoS                                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 4: Authentication (JWT)                       │
│ - Verifica identidad                                │
│ - Valida cuenta activa                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 5: Authorization                              │
│ - Roles (requireRole)                               │
│ - Ownership (requireOwnership) ← Anti-IDOR          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 6: Input Validation                           │
│ - Joi schemas                                       │
│ - Type checking                                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 7: Business Logic                            │
│ - Service layer validations                         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 8: Data Layer (PostgreSQL RLS)               │
│ - Row Level Security                                │
└─────────────────────────────────────────────────────┘
```

---

## Checklist de Seguridad

**Para cada endpoint nuevo:**

- [ ] Requiere autenticación? → `authenticateJWT`
- [ ] Requiere rol específico? → `requireRole(...)`
- [ ] Accede a datos de usuario? → `requireOwnership(...)`
- [ ] Es sensible a abuse? → Rate limiter apropiado
- [ ] Valida inputs? → `validate(schema)`
- [ ] Logs de seguridad? → `log.warn(...)` para intentos sospechosos
- [ ] Manejo de errores? → No expone info sensible
- [ ] Tests de seguridad? → Tests de IDOR, auth bypass, etc.

---

## Documentos Relacionados

- [Servicios](../servicios/README.md) - Lógica de negocio
- [API Endpoints](../api/README.md) - Documentación de API
- [Arquitectura](../ARQUITECTURA.md) - Visión general del sistema

---

## Contribuir

Al documentar nuevos middlewares:
1. Seguir estructura de middlewares existentes
2. Incluir ejemplos de uso
3. Documentar todos los parámetros
4. Especificar orden en pipeline
5. Listar posibles errores
6. Actualizar este README

---

**Última revisión:** 2025-11-01
