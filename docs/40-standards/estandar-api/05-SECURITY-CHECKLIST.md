---
titulo: Estandar de API - Rate Limiting, Seguridad y Checklist
status: activo
last_updated: "2026-02-28"
---

# Rate Limiting, Seguridad y Checklist de Validacion

> Rate limiting con throttler, requisitos de seguridad y checklist de validacion para APIs NestJS

---

## 7. Rate Limiting

### 7.1 Configuracion con @nestjs/throttler

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 segundo
        limit: 3,    // 3 requests
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 segundos
        limit: 20,   // 20 requests
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minuto
        limit: 100,  // 100 requests
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 7.2 Headers de Rate Limit

```typescript
// interceptors/rate-limit-headers.interceptor.ts
@Injectable()
export class RateLimitHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    // Estos headers se calculan basados en la configuracion del throttler
    // En produccion, obtener valores reales del guard
    response.setHeader('X-RateLimit-Limit', '100');
    response.setHeader('X-RateLimit-Remaining', '95');
    response.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 60);

    return next.handle();
  }
}
```

### 7.3 Respuesta 429 Personalizada

```typescript
// filters/throttle-exception.filter.ts
@Catch(ThrottlerException)
export class ThrottleExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Por favor espere antes de intentar nuevamente.',
      timestamp: new Date().toISOString(),
      path: request.url,
      retryAfter: 60, // segundos
    });
  }
}
```

### 7.4 Rate Limit por Endpoint

```typescript
// Limite especifico para endpoint sensible
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 por 5 minutos
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto);
  }
}

// Omitir rate limit para endpoints especificos
@Controller('health')
export class HealthController {
  @Get()
  @SkipThrottle()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
```

---

## 8. Seguridad en APIs

> **Referencia completa:** La seguridad de APIs esta documentada en detalle en los estandares de seguridad dedicados.

| Tema | Referencia |
|------|-----------|
| OWASP Web Top 10 | [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md) §1 |
| OWASP API Security Top 10 | [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md) §1 |
| Validacion de Input (class-validator) | [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md) §2 |
| Sanitizacion de Output | [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md) §3 |
| Headers de Seguridad (Helmet) | [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md) §7 |

### Resumen Rapido

Los endpoints de GAMILIT DEBEN cumplir:

1. **CORS:** Configurado via `@nestjs/common` con whitelist de origenes permitidos
2. **Input:** Todos los DTOs usan `class-validator` + `ValidationPipe` global
3. **Output:** Response DTOs con `@Exclude()` para campos sensibles
4. **Headers:** Helmet middleware habilitado globalmente
5. **Rate Limiting:** `@nestjs/throttler` con limites por endpoint (ver §7 de este documento)

---

## 9. Checklist de Validacion

### 9.1 Checklist RESTful

- [ ] URLs usan sustantivos en plural
- [ ] URLs en minusculas con guiones
- [ ] No hay verbos en las URLs
- [ ] Verbos HTTP usados correctamente
- [ ] Subrecursos anidados cuando corresponde

### 9.2 Checklist Versionamiento

- [ ] API tiene prefijo de version `/api/v1/`
- [ ] Politica de deprecacion documentada
- [ ] Headers de deprecacion en endpoints obsoletos

### 9.3 Checklist Swagger

- [ ] Todos los endpoints tienen @ApiOperation
- [ ] Todos los parametros documentados (@ApiParam, @ApiQuery)
- [ ] Todos los DTOs con @ApiProperty
- [ ] Todos los codigos de respuesta documentados (@ApiResponse)
- [ ] Ejemplos incluidos en la documentacion
- [ ] Autenticacion documentada (@ApiBearerAuth)

### 9.4 Checklist Codigos HTTP

- [ ] 200 para GET/PATCH/PUT exitosos
- [ ] 201 para POST exitoso (creacion)
- [ ] 204 para DELETE exitoso
- [ ] 400 para errores de formato/sintaxis
- [ ] 401 para falta de autenticacion
- [ ] 403 para falta de autorizacion
- [ ] 404 para recursos no encontrados
- [ ] 409 para conflictos de estado
- [ ] 422 para errores de logica de negocio

### 9.5 Checklist Respuestas

- [ ] Estructura consistente: `{ data, meta? }`
- [ ] Errores con: `{ code, message, timestamp }`
- [ ] Paginacion incluye metadata completa
- [ ] Campos sensibles excluidos de respuestas

### 9.6 Checklist Seguridad

> Ver checklist completo en [ESTANDAR-SEGURIDAD.md](../ESTANDAR-SEGURIDAD.md).

Verificaciones minimas para endpoints de esta API:

- [ ] CORS configurado con whitelist de origenes (ver §8 de este documento)
- [ ] ValidationPipe global activo con `whitelist: true`
- [ ] Helmet middleware habilitado globalmente
- [ ] Rate limiting implementado (ver §7 de este documento)
- [ ] Response DTOs con `@Exclude()` en campos sensibles

---

## Referencias

### Seguridad
- [ESTANDAR-SEGURIDAD](../ESTANDAR-SEGURIDAD.md) - OWASP Top 10, autenticacion JWT, validacion de inputs

### Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL.md](../ESTANDAR-BACKEND-PROFESIONAL.md) - Patrones backend
- [ESTANDAR-CODIGO.md](../ESTANDAR-CODIGO.md) - Convenciones de codigo
- [ESTANDAR-NOMENCLATURA.md](../ESTANDAR-NOMENCLATURA.md) - Nombres de archivos
- [NestJS Documentation](https://docs.nestjs.com/) - Documentacion oficial
- [Swagger/OpenAPI](https://swagger.io/) - Especificacion OpenAPI
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - Codigos HTTP MDN
