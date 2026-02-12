# Estandar Backend Profesional - Manejo de Errores

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 5 de 8**

---

## 5. Manejo de Errores

### 5.1 Jerarquia de Excepciones

```typescript
// domain/errors/base.error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// domain/errors/not-found.error.ts
export abstract class NotFoundError extends DomainError {
  readonly httpStatus = 404;
}

// domain/errors/validation.error.ts
export abstract class ValidationError extends DomainError {
  readonly httpStatus = 400;
}

// domain/errors/conflict.error.ts
export abstract class ConflictError extends DomainError {
  readonly httpStatus = 409;
}

// domain/errors/forbidden.error.ts
export abstract class ForbiddenError extends DomainError {
  readonly httpStatus = 403;
}
```

### 5.2 Custom Exceptions Tipadas

```typescript
// domain/errors/user.errors.ts
export class UserNotFoundError extends NotFoundError {
  readonly code = 'USER_NOT_FOUND';

  constructor(identifier: string) {
    super(`Usuario con identificador '${identifier}' no encontrado`);
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  readonly code = 'EMAIL_ALREADY_EXISTS';

  constructor(email: string) {
    super(`El email '${email}' ya esta registrado`);
  }
}

export class InvalidEmailError extends ValidationError {
  readonly code = 'INVALID_EMAIL';

  constructor(email: string) {
    super(`El formato del email '${email}' es invalido`);
  }
}

export class UserInactiveError extends ForbiddenError {
  readonly code = 'USER_INACTIVE';

  constructor(userId: string) {
    super(`El usuario '${userId}' esta inactivo`);
  }
}

// domain/errors/order.errors.ts
export class OrderNotFoundError extends NotFoundError {
  readonly code = 'ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Orden '${orderId}' no encontrada`);
  }
}

export class InsufficientStockError extends ValidationError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(productId: string, requested: number, available: number) {
    super(
      `Stock insuficiente para producto '${productId}'. ` +
      `Solicitado: ${requested}, Disponible: ${available}`
    );
  }
}

export class OrderNotModifiableError extends ForbiddenError {
  readonly code = 'ORDER_NOT_MODIFIABLE';

  constructor(orderId: string) {
    super(`La orden '${orderId}' no puede ser modificada en su estado actual`);
  }
}

export class InvalidOrderTransitionError extends ValidationError {
  readonly code = 'INVALID_ORDER_TRANSITION';

  constructor(currentStatus: OrderStatus, targetStatus: OrderStatus) {
    super(`No es posible cambiar de '${currentStatus}' a '${targetStatus}'`);
  }
}
```

### 5.3 Exception Filter Global

```typescript
// infrastructure/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log solo errores 5xx o errores no esperados
    if (exception.httpStatus >= 500) {
      this.logger.error(
        `[${exception.code}] ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(`[${exception.code}] ${exception.message}`);
    }

    response.status(exception.httpStatus).json(errorResponse);
  }
}

// infrastructure/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error interno';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message;
      code = this.getCodeFromStatus(status);
    }

    this.logger.error(
      `Unhandled exception: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getCodeFromStatus(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}

// main.ts - Registro de filters
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);

  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new DomainExceptionFilter(logger),
  );

  await app.listen(3000);
}
```

### 5.4 Codigos de Error Estandarizados

| Categoria | Prefijo | HTTP Status | Ejemplo |
|-----------|---------|-------------|---------|
| Validacion | `VALIDATION_*` | 400 | `VALIDATION_INVALID_EMAIL` |
| Autenticacion | `AUTH_*` | 401 | `AUTH_TOKEN_EXPIRED` |
| Autorizacion | `AUTHZ_*` | 403 | `AUTHZ_INSUFFICIENT_PERMISSIONS` |
| No Encontrado | `*_NOT_FOUND` | 404 | `USER_NOT_FOUND` |
| Conflicto | `*_ALREADY_EXISTS`, `CONFLICT_*` | 409 | `EMAIL_ALREADY_EXISTS` |
| Negocio | `BUSINESS_*` | 422 | `BUSINESS_INSUFFICIENT_STOCK` |
| Interno | `INTERNAL_*` | 500 | `INTERNAL_DATABASE_ERROR` |

### Checklist Manejo de Errores

- [ ] Jerarquia de excepciones de dominio definida
- [ ] Cada error tiene codigo unico y mensaje descriptivo
- [ ] Exception filters globales configurados
- [ ] Errores loggeados apropiadamente (warn vs error)
- [ ] Respuestas de error consistentes (JSON estandarizado)
- [ ] No se exponen detalles internos en produccion
