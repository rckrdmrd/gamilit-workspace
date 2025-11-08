# Manejo de Errores

**Código que mapea:** `apps/backend/src/shared/filters/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Estrategia de manejo de errores en el backend NestJS.

---

## 🚨 Exception Filters

### HttpExceptionFilter

**Path:** `apps/backend/src/shared/filters/http-exception.filter.ts`

**Maneja:** HttpException y derivados

**Formato de respuesta:**

```json
{
  "error": {
    "statusCode": 404,
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado",
    "timestamp": "2025-11-07T10:00:00Z",
    "path": "/api/v1/users/123"
  }
}
```

### AllExceptionsFilter

**Path:** `apps/backend/src/shared/filters/all-exceptions.filter.ts`

**Maneja:** Todas las excepciones no capturadas

---

## 📝 Códigos de Error Estándar

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `INVALID_CREDENTIALS` | 401 | Credenciales inválidas |
| `UNAUTHORIZED` | 401 | No autorizado |
| `FORBIDDEN` | 403 | Acceso prohibido |
| `BAD_REQUEST` | 400 | Request inválido |
| `INTERNAL_SERVER_ERROR` | 500 | Error interno |

---

## 🎯 Uso en Controladores

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.userService.findOne(id);

  if (!user) {
    throw new NotFoundException('USER_NOT_FOUND');
  }

  return user;
}
```

---

## 📚 Custom Exceptions

**Path:** `apps/backend/src/shared/exceptions/`

```typescript
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`USER_NOT_FOUND: ${userId}`);
  }
}
```

---

**Última actualización:** 2025-11-07
