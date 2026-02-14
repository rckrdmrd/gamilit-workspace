# Express.js → NestJS Mapping — Equivalencias Tecnicas

**Version:** 1.0.0
**Fecha:** 2026-02-14
**Tarea:** TASK-2026-02-14-INTEGRACION-DEEP-RESEARCH
**Fase:** 0 — Analisis de Aplicabilidad

---

## Proposito

Los documentos de workspace-arch usan Express.js como framework de referencia. Gamilit usa **NestJS 11**. Este documento mapea cada concepto Express a su equivalente NestJS para facilitar la adaptacion de los 18 documentos clasificados como ADAPTAR.

---

## 1. Middleware → Guards / Interceptors / Pipes / Filters

| Express.js | NestJS Equivalente | Uso en Gamilit |
|------------|-------------------|----------------|
| `app.use(middleware)` | `@UseGuards()`, `@UseInterceptors()`, `app.useGlobalPipes()` | Global en `main.ts` o por controller |
| `express-rate-limit` | `@nestjs/throttler` (ThrottlerModule + ThrottlerGuard) | Ya configurado en gamilit AuthModule |
| `helmet()` | `app.use(helmet())` en `main.ts` | Directo — compatible con NestJS |
| `cors()` | `app.enableCors()` | Ya configurado en gamilit `main.ts` |
| `morgan` (logging) | `LoggingInterceptor` custom | Interceptor custom en gamilit |
| `express-validator` | `class-validator` + `class-transformer` + `ValidationPipe` | DTOs con decorators, 399 DTOs existentes |
| `passport.authenticate()` | `@nestjs/passport` + `@UseGuards(AuthGuard('jwt'))` | JwtAuthGuard en gamilit |
| Error handling middleware | `@Catch()` ExceptionFilter | 2 filters existentes en gamilit |

### Ejemplo de Traduccion

```typescript
// EXPRESS.js (workspace-arch)
app.use('/api', rateLimiter({ windowMs: 60000, max: 100 }));
app.use('/api', authMiddleware);
app.use('/api', validateInput);

// NESTJS (gamilit)
@Controller('api')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ApiController { ... }
```

---

## 2. Router Groups → Controllers + Modules

| Express.js | NestJS Equivalente | Notas |
|------------|-------------------|-------|
| `express.Router()` | `@Controller('prefix')` | 107 controllers en gamilit |
| Router groups | `@Module({ controllers: [...] })` | 22 modules en gamilit |
| Route params | `@Param()` decorator | Identico concepto |
| Query params | `@Query()` decorator | Identico concepto |
| Request body | `@Body()` decorator | Con DTO + class-validator |
| `router.get()` | `@Get()` | Method decorators |
| `router.post()` | `@Post()` | Method decorators |
| `router.use()` (sub-router) | `@Module({ imports: [ChildModule] })` | Module composition |

---

## 3. Dependency Injection

| Express.js | NestJS Equivalente | Notas |
|------------|-------------------|-------|
| Manual `new Service()` | `@Injectable()` + DI container | Automatico en NestJS |
| Factory functions | `useFactory` provider | ConfigModule pattern |
| Service locator | `@Inject()` decorator | Token-based injection |
| Singleton pattern | Default scope (`SINGLETON`) | NestJS default |
| Request-scoped | `@Injectable({ scope: Scope.REQUEST })` | Multi-tenancy pattern |

---

## 4. Security Middleware → NestJS Guards

| Express Middleware | NestJS Guard/Decorator | Gamilit Implementacion |
|--------------------|----------------------|----------------------|
| `isAuthenticated()` | `JwtAuthGuard` | `apps/backend/src/modules/auth/guards/jwt-auth.guard.ts` |
| `isAuthorized(roles)` | `RolesGuard` + `@Roles()` | `apps/backend/src/modules/auth/guards/roles.guard.ts` |
| `isTenantMember()` | `TenantGuard` | `apps/backend/src/modules/tenants/guards/tenant.guard.ts` |
| `checkOwnership()` | Custom guard per resource | Por implementar en controllers |
| `csrfProtection()` | No aplica (JWT stateless) | N/A — API REST stateless |

---

## 5. Error Handling

| Express.js | NestJS Equivalente | Notas |
|------------|-------------------|-------|
| `app.use((err, req, res, next) => ...)` | `@Catch() ExceptionFilter` | Global o por controller |
| `next(error)` | `throw new HttpException()` | Built-in exceptions |
| Custom error classes | `extends HttpException` | BadRequestException, NotFoundException, etc. |
| Error logging middleware | ExceptionFilter + Logger | Logger service injection |

```typescript
// EXPRESS.js
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// NESTJS (gamilit)
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // ... handle exception
  }
}
```

---

## 6. Database / ORM

| Express.js (Prisma/Drizzle) | NestJS (TypeORM 0.3.x) | Gamilit |
|------------------------------|----------------------|---------|
| `prisma.user.findMany()` | `repository.find()` | 152 entities con Repository pattern |
| Prisma middleware | TypeORM subscribers/listeners | Entity listeners |
| Prisma migrations | DDL-first (archivos SQL) | `apps/database/ddl/` |
| `prisma.$transaction()` | `queryRunner.startTransaction()` | Transacciones explicitas |
| Prisma schema | TypeORM entity decorators | `@Entity()`, `@Column()`, etc. |

---

## 7. Configuration

| Express.js | NestJS Equivalente | Gamilit |
|------------|-------------------|---------|
| `dotenv` | `@nestjs/config` (ConfigModule) | ConfigModule.forRoot() en AppModule |
| `process.env.X` | `configService.get('X')` | Inyectado via DI |
| Config validation (Joi) | `validationSchema` en ConfigModule | Ya implementado |

---

## 8. WebSocket

| Express.js (socket.io) | NestJS Equivalente | Gamilit |
|------------------------|-------------------|---------|
| `io.on('connection')` | `@WebSocketGateway()` | NotificationsGateway |
| `socket.emit()` | `@SubscribeMessage()` + `server.emit()` | Socket.IO 4.8+ |
| `io.use(authMiddleware)` | `handleConnection()` + JWT validation | RedisIoAdapter |
| Socket.IO adapter | `@nestjs/platform-socket.io` | Redis adapter configurado |

---

## 9. Testing

| Express.js | NestJS Equivalente | Gamilit |
|------------|-------------------|---------|
| `supertest` | `supertest` (identico) + `@nestjs/testing` | `Test.createTestingModule()` |
| Manual mocks | `jest.mock()` + NestJS providers override | 833 tests, 57 spec files |
| Integration setup | `TestingModule.compile()` + `createNestApplication()` | Setup file existente |

---

## Impacto en Documentos a Adaptar

Para cada documento clasificado como ADAPTAR, se debe:

1. **Reemplazar** imports de Express (`express`, `express-rate-limit`, `express-validator`) por equivalentes NestJS
2. **Cambiar** middleware functions por decorators (`@UseGuards`, `@UseInterceptors`, `@UsePipes`)
3. **Usar** modulos reales de gamilit (auth, users, educational, gamification) en ejemplos
4. **Referenciar** paths reales de gamilit (`apps/backend/src/modules/...`)
5. **Mantener** conceptos de seguridad/arquitectura (son stack-agnosticos)

---

*Documento generado como parte de TASK-2026-02-14-INTEGRACION-DEEP-RESEARCH*
