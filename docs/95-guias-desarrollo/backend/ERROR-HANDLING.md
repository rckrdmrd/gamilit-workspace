# Manejo de Errores Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/

---

## Resumen

GAMILIT implementa un sistema de manejo de errores consistente usando excepciones de NestJS, filtros personalizados y logging estructurado.

---

## Excepciones HTTP de NestJS

### Excepciones Incorporadas

```typescript
import {
  BadRequestException,      // 400
  UnauthorizedException,    // 401
  ForbiddenException,       // 403
  NotFoundException,        // 404
  ConflictException,        // 409
  UnprocessableEntityException, // 422
  InternalServerErrorException, // 500
} from '@nestjs/common';
```

### Uso Básico

```typescript
@Injectable()
export class UsersService {
  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

---

## Excepciones Personalizadas

### Definición

```typescript
// shared/exceptions/business.exception.ts
export class InsufficientCoinsException extends BadRequestException {
  constructor(required: number, available: number) {
    super({
      code: 'INSUFFICIENT_COINS',
      message: `Insufficient ML Coins. Required: ${required}, Available: ${available}`,
      required,
      available,
    });
  }
}

export class AchievementAlreadyUnlockedException extends ConflictException {
  constructor(achievementId: string) {
    super({
      code: 'ACHIEVEMENT_ALREADY_UNLOCKED',
      message: `Achievement ${achievementId} is already unlocked`,
      achievementId,
    });
  }
}
```

### Uso

```typescript
async purchaseComodin(userId: string, comodinId: string): Promise<void> {
  const stats = await this.userStatsRepository.findOne({ where: { userId } });
  const comodin = await this.comodinRepository.findOne({ where: { id: comodinId } });

  if (stats.mlCoins < comodin.price) {
    throw new InsufficientCoinsException(comodin.price, stats.mlCoins);
  }

  // Procesar compra...
}
```

---

## Filtro Global de Excepciones

### Implementación

```typescript
// shared/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code || this.getCodeFromStatus(status);
        errors = (exceptionResponse as any).errors || [];
      } else {
        message = exceptionResponse;
      }
    }

    // Log del error
    this.logger.error({
      path: request.url,
      method: request.method,
      status,
      code,
      message,
      userId: request.user?.id,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      code,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
```

### Registro Global

```typescript
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## Errores de Validación

### Formato Automático

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints || {}),
      }));

      return new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: formattedErrors,
      });
    },
  }),
);
```

### Respuesta de Ejemplo

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "messages": ["email must be a valid email address"]
    },
    {
      "field": "password",
      "messages": ["password must be at least 8 characters"]
    }
  ],
  "timestamp": "2025-11-28T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

---

## Manejo en Servicios

### Patrón Try-Catch

```typescript
@Injectable()
export class ExerciseSubmissionService {
  private readonly logger = new Logger(ExerciseSubmissionService.name);

  async submit(userId: string, exerciseId: string, answer: any): Promise<SubmissionResult> {
    try {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });

      if (!exercise) {
        throw new NotFoundException(`Exercise ${exerciseId} not found`);
      }

      if (!exercise.isActive) {
        throw new BadRequestException('Exercise is not active');
      }

      const isCorrect = await this.validateAnswer(exercise, answer);

      return this.createSubmission(userId, exerciseId, answer, isCorrect);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-lanzar excepciones HTTP
      }

      this.logger.error(`Failed to submit exercise: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process submission');
    }
  }
}
```

### Errores de Base de Datos

```typescript
async create(dto: CreateUserDto): Promise<UserEntity> {
  try {
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      throw new ConflictException('Email already exists');
    }
    if (error.code === '23503') { // PostgreSQL foreign key violation
      throw new BadRequestException('Referenced entity does not exist');
    }
    throw error;
  }
}
```

---

## Códigos de Error Personalizados

### Catálogo

```typescript
// shared/constants/error-codes.constants.ts
export const ERROR_CODES = {
  // Auth (1xxx)
  INVALID_CREDENTIALS: 'AUTH_1001',
  TOKEN_EXPIRED: 'AUTH_1002',
  EMAIL_NOT_VERIFIED: 'AUTH_1003',
  ACCOUNT_SUSPENDED: 'AUTH_1004',

  // Gamification (2xxx)
  INSUFFICIENT_COINS: 'GAM_2001',
  ACHIEVEMENT_LOCKED: 'GAM_2002',
  COMODIN_NOT_AVAILABLE: 'GAM_2003',
  DAILY_LIMIT_REACHED: 'GAM_2004',

  // Progress (3xxx)
  EXERCISE_NOT_AVAILABLE: 'PROG_3001',
  SESSION_EXPIRED: 'PROG_3002',
  ALREADY_SUBMITTED: 'PROG_3003',

  // Social (4xxx)
  NOT_CLASSROOM_MEMBER: 'SOC_4001',
  TEAM_FULL: 'SOC_4002',
  CHALLENGE_ENDED: 'SOC_4003',
} as const;
```

### Uso

```typescript
throw new BadRequestException({
  code: ERROR_CODES.INSUFFICIENT_COINS,
  message: 'Not enough ML Coins to purchase this comodin',
  required: 50,
  available: 30,
});
```

---

## Logging de Errores

### Configuración del Logger

```typescript
// shared/utils/logger.util.ts
import { Logger, LogLevel } from '@nestjs/common';

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Niveles según entorno
export const getLogLevels = (): LogLevel[] => {
  if (process.env.NODE_ENV === 'production') {
    return ['error', 'warn', 'log'];
  }
  return ['error', 'warn', 'log', 'debug', 'verbose'];
};
```

### Logging Estructurado

```typescript
this.logger.error({
  event: 'SUBMISSION_FAILED',
  userId,
  exerciseId,
  errorCode: 'VALIDATION_FAILED',
  details: validationErrors,
  timestamp: new Date().toISOString(),
});
```

---

## Errores Asíncronos

### Manejo de Promesas

```typescript
async processMultipleSubmissions(submissions: SubmissionDto[]): Promise<SubmissionResult[]> {
  const results = await Promise.allSettled(
    submissions.map((sub) => this.processSubmission(sub))
  );

  const successful: SubmissionResult[] = [];
  const failed: { index: number; error: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({ index, error: result.reason.message });
    }
  });

  if (failed.length > 0 && successful.length === 0) {
    throw new BadRequestException({
      code: 'ALL_SUBMISSIONS_FAILED',
      errors: failed,
    });
  }

  return successful;
}
```

---

## Errores en WebSocket

```typescript
// websocket/notifications.gateway.ts
@WebSocketGateway()
export class NotificationsGateway {
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribeDto,
  ) {
    try {
      // Validar y suscribir...
    } catch (error) {
      client.emit('error', {
        code: 'SUBSCRIPTION_FAILED',
        message: error.message,
      });
    }
  }
}
```

---

## Testing de Errores

```typescript
describe('UsersService', () => {
  describe('findOne', () => {
    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should return user when found', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('uuid');
      expect(result).toEqual(mockUser);
    });
  });
});
```

---

## Buenas Prácticas

1. **Nunca exponer stack traces** en producción
2. **Usar códigos de error** consistentes
3. **Loggear contexto suficiente** para debugging
4. **Re-lanzar HttpExceptions** sin modificar
5. **Convertir errores internos** a excepciones HTTP apropiadas
6. **Validar temprano** en la capa de controlador
7. **Mensajes de error** claros y accionables

---

## Ver También

- [API-CONVENTIONS.md](./API-CONVENTIONS.md) - Convenciones de API
- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Filtros y excepciones compartidas
