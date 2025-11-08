# API Reference - Gamilit Platform

**Proyecto:** Gamilit Platform
**Módulo:** API Reference General
**Categoría:** API Documentation Index
**Archivo original:** API-REFERENCE.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Referencia completa de todas las APIs de la plataforma Gamilit. Este documento sirve como índice central que apunta a las especificaciones detalladas de cada módulo.

---

## Base URLs

- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.glit.edu/api`

---

## Autenticación

**Método:** JWT Bearer Token

```
Authorization: Bearer <token>
```

**Tokens:**
- **Access Token:** Válido por 7 días
- **Refresh Token:** Válido por 30 días

---

## Estadísticas de API

| Métrica | Valor |
|---------|-------|
| **Total Endpoints** | 470+ |
| **Endpoints Documentados** | 90 |
| **Cobertura Documentación** | ~24% |
| **Módulos** | 11 módulos funcionales |
| **Autenticación** | JWT (7 días) + Refresh (30 días) |
| **Rate Limiting** | 100 req/15min (general) |
| **Response Time (p95)** | < 200ms |

---

## Módulos de API

### 1. Authentication Module
**Total Endpoints:** 15
**Documentación:** [01-AUTH-API.md](./01-AUTH-API.md)

Autenticación, registro, manejo de sesiones y recuperación de contraseña.

**Endpoints Principales:**
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Autenticar usuario
- `GET /api/auth/me` - Obtener usuario autenticado
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

---

### 2. Educational Module
**Total Endpoints:** 60
**Documentación:** [02-EDUCATIONAL-API.md](./02-EDUCATIONAL-API.md)

Módulos educativos, ejercicios, y sistema de evaluación Marie Curie.

**Endpoints Principales:**
- `GET /api/educational/modules` - Listar módulos
- `GET /api/educational/exercises/:id` - Detalle de ejercicio
- `POST /api/educational/exercises/:id/submit` - Enviar respuesta
- `GET /api/educational/modules/:id` - Detalle de módulo

---

### 3. Gamification Module
**Total Endpoints:** 45
**Documentación:** [../gamificacion-api/](../gamificacion-api/)

Sistema completo de gamificación con rangos Maya, ML Coins, logros, power-ups y leaderboards.

**Sub-módulos:**
- [Rangos Maya API](../gamificacion-api/01-RANGOS-MAYA.md) - 6 endpoints
- [ML Coins API](../gamificacion-api/02-ML-COINS.md) - 8 endpoints
- [Achievements API](../gamificacion-api/03-ACHIEVEMENTS.md) - 6 endpoints
- [Power-ups API](../gamificacion-api/04-POWER-UPS.md) - 6 endpoints
- [Leaderboards API](../gamificacion-api/05-LEADERBOARDS.md) - 6 endpoints

---

### 4. Teacher Module
**Total Endpoints:** 29 (100% documentado)
**Documentación:** [03-TEACHER-API.md](./03-TEACHER-API.md)

Portal del profesor para gestión de clases, assignments y evaluación.

**Sub-módulos:**
- Classroom Management (8 endpoints)
- Assignments (8 endpoints)
- Grading (4 endpoints)
- Student Progress (4 endpoints)
- Analytics (5 endpoints)

---

### 5. Admin Module
**Total Endpoints:** 31 (100% documentado)
**Documentación:** [04-ADMIN-API.md](./04-ADMIN-API.md)

Administración del sistema, gestión de usuarios y organizaciones.

**Sub-módulos:**
- User Management (10 endpoints)
- Organizations (8 endpoints)
- Content Management (6 endpoints)
- System (7 endpoints)

---

### 6. Progress Module
**Total Endpoints:** 40
**Documentación:** [05-PROGRESS-API.md](./05-PROGRESS-API.md)

Tracking de progreso, intentos y analytics del estudiante.

**Endpoints Principales:**
- `GET /api/progress/:userId` - Progreso general
- `GET /api/progress/attempts/:userId` - Historial de intentos
- `GET /api/progress/analytics/:userId` - Analytics detallados

---

### 7. Social Module
**Total Endpoints:** 55
**Documentación:** [06-SOCIAL-API.md](./06-SOCIAL-API.md)

Sistema social: classrooms, teams, guilds y competencias.

**Endpoints Principales:**
- `GET /api/social/classrooms` - Listar classrooms
- `POST /api/social/classrooms/join` - Unirse a classroom
- `GET /api/social/teams` - Listar equipos

---

### 8. Content Module
**Total Endpoints:** 30
**Documentación Completa:** Ver archivo original API-REFERENCE.md (líneas 565-585)

Upload y gestión de contenido multimedia.

---

### 9. Notifications Module
**Total Endpoints:** 25
**Documentación Completa:** Ver archivo original API-REFERENCE.md (líneas 2220-2240)

Sistema de notificaciones en tiempo real.

---

### 10. Analytics Module
**Total Endpoints:** 35
**Documentación:** Cubierto parcialmente en Teacher Analytics

Dashboard y reportes del sistema.

---

### 11. System Module
**Total Endpoints:** 15
**Documentación:** Cubierto en Admin System endpoints

Health checks, logs y métricas del sistema.

---

## Formato de Respuesta Estándar

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## Códigos de Error Comunes

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Token missing o inválido |
| `FORBIDDEN` | 403 | Permisos insuficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Datos inválidos |
| `CONFLICT` | 409 | Recurso duplicado |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas requests |

**Formato de Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { "field": "email" }
  }
}
```

---

## Rate Limiting

| Categoría | Límite | Ventana |
|-----------|--------|---------|
| Auth endpoints | 5 requests | 15 min |
| General API | 100 requests | 15 min |
| File upload | 10 requests | 1 hour |
| Admin endpoints | 30 requests | 1 min |

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## WebSocket Events

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: { token: 'JWT_TOKEN' }
});
```

**Eventos:**
- `achievement:unlocked` - Nuevo logro desbloqueado
- `ml_coins:updated` - Balance de ML Coins actualizado
- `leaderboard:updated` - Leaderboard actualizado
- `notification:new` - Nueva notificación

---

## Endpoints Deprecados

**Última actualización:** Octubre 2025

### Email Verification (REMOVIDO Oct 2025)

| Endpoint | Método | Removido | Reemplazo |
|----------|--------|----------|-----------|
| `/api/auth/verify-email` | POST | 2025-10-28 | Registro directo sin verificación |
| `/api/auth/resend-verification` | POST | 2025-10-28 | N/A |

**Razón:** Email verification removido del diseño según ADR-001.

---

## Estado de Documentación

| Módulo | Endpoints | Documentados | Cobertura | Nivel |
|--------|-----------|--------------|-----------|-------|
| Auth | 15 | 3 | 20% | Básico |
| Educational | 60 | 4 | 7% | Básico |
| **Gamification** | **45** | **32** | **71%** | **Completo** |
| **Teacher** | **29** | **29** | **100%** | **Completo** |
| **Admin** | **31** | **31** | **100%** | **Completo** |
| Progress | 40 | 3 | 8% | Básico |
| Social | 55 | 2 | 4% | Básico |
| Content | 30 | 1 | 3% | Básico |
| Notifications | 25 | 1 | 4% | Básico |
| Analytics | 35 | 5 | 14% | Medio |
| System | 15 | 7 | 47% | Completo |
| **TOTAL** | **~380** | **118** | **31%** | **Mixto** |

---

## Referencias

- [Gamification API Completa](../gamificacion-api/)
- [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md)
- [Sistema de Seguridad](../seguridad/SISTEMA-SEGURIDAD.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** GAMILIT Platform Team
