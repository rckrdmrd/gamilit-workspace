# Guards y Seguridad del Backend GAMILIT

**Proyecto:** GAMILIT Platform
**Módulo:** Backend - Seguridad
**Última actualización:** 2025-11-07
**Estado:** ✅ Actualizado según código real

> **Nota importante:** Este documento refleja la arquitectura REAL implementada en el código.
> El sistema usa **NestJS Guards** + **RLS en PostgreSQL**, NO middleware tradicional de Express.

---

## Índice

1. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
2. [NestJS Guards Implementados](#nestjs-guards-implementados)
3. [RLS Interceptor](#rls-interceptor)
4. [Pipeline de Request](#pipeline-de-request)
5. [Decoradores Personalizados](#decoradores-personalizados)
6. [Buenas Prácticas](#buenas-prácticas)

---

## Arquitectura de Seguridad

> **Decisión arquitectónica:** [¿Por qué Guards + RLS?](../../02-especificaciones-tecnicas/arquitectura/DECISION-AUTENTICACION-AUTORIZACION.md)
>
> **Fuente de decisión:** [ADR-003 - RLS vs App Layer Authorization](../../02-especificaciones-tecnicas/adr/ADR-003-rls-vs-app-layer-authorization.md)

### Capas de Seguridad Implementadas

GAMILIT implementa un modelo de seguridad en **3 capas**:

```
┌─────────────────────────────────────────────────────────┐
│  1. AUTENTICACIÓN                                       │
│     NestJS Guards (JwtAuthGuard)                        │
│     ↓ Valida token JWT                                  │
│     ↓ Verifica identidad del usuario                    │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  2. AUTORIZACIÓN RBAC                                   │
│     NestJS Guards (RolesGuard, OwnershipGuard)          │
│     ↓ Valida roles de usuario                           │
│     ↓ Valida propiedad de recursos                      │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  3. AUTORIZACIÓN MULTI-TENANT                           │
│     RLS en PostgreSQL + RLS Interceptor                 │
│     ↓ Aplica SET LOCAL en cada request                  │
│     ↓ Políticas RLS filtran datos automáticamente       │
└─────────────────────────────────────────────────────────┘
```

### Por qué NO usamos Express Middleware

Según **ADR-003**, se decidió:

- ✅ **NestJS Guards** para autenticación y RBAC (mejor integración con framework)
- ✅ **RLS en PostgreSQL** para multi-tenancy (más seguro, cannot be bypassed)
- ❌ **NO middleware tradicional** de Express (menor integración con NestJS)

**Ventajas:**
- Guards se integran nativamente con decoradores de NestJS
- RLS en BD es imposible de bypass (seguridad defense-in-depth)
- Mejor tipado con TypeScript
- Más fácil testing con módulos de NestJS

---

## NestJS Guards Implementados

### 1. JwtAuthGuard

**Ubicación:** `apps/backend/src/shared/guards/jwt-auth.guard.ts`

**Propósito:** Validar autenticación JWT en requests

**Implementación:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Extiende el Passport JwtStrategy
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

**Uso:**
```typescript
@Controller('gamification')
@UseGuards(JwtAuthGuard) // ← Protege todo el controller
export class GamificationController {

  @Get('stats')
  getUserStats(@Request() req) {
    // req.user disponible (inyectado por guard)
    const userId = req.user.id;
    return this.gamificationService.getStats(userId);
  }
}
```

**Flujo:**
1. Extrae token de header `Authorization: Bearer <token>`
2. Valida JWT con secret (configurado en JwtStrategy)
3. Verifica estado de cuenta (active, no deleted)
4. Inyecta `user` en request
5. Si falla → `401 Unauthorized`

---

### 2. RolesGuard

**Ubicación:** `apps/backend/src/shared/guards/roles.guard.ts`

**Propósito:** Validar roles de usuario (RBAC)

**Implementación:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No requiere roles específicos
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

**Uso con decorador `@Roles()`:**
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // ← Orden importante
export class AdminController {

  @Get('users')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) // ← Solo admin o super admin
  getAllUsers() {
    return this.adminService.getAllUsers();
  }
}
```

**Roles disponibles:**
```typescript
enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

---

### 3. OwnershipGuard

**Ubicación:** `apps/backend/src/shared/guards/ownership.guard.ts`

**Propósito:** Validar que el usuario sea dueño del recurso (Anti-IDOR)

**Implementación:**
```typescript
@Injectable()
export class OwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // Validar ownership según tipo de recurso
    const resource = await this.findResource(resourceId);

    if (resource.userId !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
```

**Uso:**
```typescript
@Controller('progress')
export class ProgressController {

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard) // ← Valida ownership
  getProgress(@Param('id') id: string) {
    return this.progressService.getProgress(id);
  }
}
```

**Casos de uso:**
- Estudiante solo puede ver SU progreso
- Profesor solo puede ver SUS aulas
- Admin puede ver todo (bypass)

---

## RLS Interceptor

**Ubicación:** `apps/backend/src/shared/interceptors/rls.interceptor.ts`

**Propósito:** Activar Row Level Security en cada request

> **Estado actual:** ⚠️ PARCIALMENTE IMPLEMENTADO
> **Issue:** Falta aplicar `SET LOCAL` (ver [Issue #RLS-001](#issue-rls-001))

**Implementación esperada:**
```typescript
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // ⚠️ CRÍTICO: Estas líneas DEBEN ejecutarse
      await queryRunner.query(
        `SET LOCAL app.current_tenant_id = '${user.organizationId}'`
      );
      await queryRunner.query(
        `SET LOCAL app.current_user_id = '${user.id}'`
      );

      // Ejecutar request con RLS activo
      const result = await next.handle().toPromise();

      await queryRunner.release();
      return result;
    }

    return next.handle();
  }
}
```

**Cómo funciona RLS:**
```sql
-- Política RLS en tabla user_stats (ejemplo)
CREATE POLICY user_stats_tenant_isolation ON gamification_system.user_stats
  USING (organization_id = current_setting('app.current_tenant_id')::uuid);

-- Cuando se ejecuta SET LOCAL:
SET LOCAL app.current_tenant_id = '123e4567-e89b-12d3-a456-426614174000';

-- TODAS las queries automáticamente filtran:
SELECT * FROM user_stats;
-- Se convierte en:
SELECT * FROM user_stats
WHERE organization_id = '123e4567-e89b-12d3-a456-426614174000';
```

**Ventajas de RLS:**
- ✅ Cannot be bypassed (seguridad a nivel de BD)
- ✅ Aplica a TODAS las queries (SELECT, UPDATE, DELETE)
- ✅ No requiere filtros manuales en código
- ✅ Cumple con GDPR/FERPA (aislamiento de datos sensibles)

---

## Pipeline de Request

### Flujo Completo

```
REQUEST
  ↓
┌─────────────────────────────────────────┐
│ NestJS Global Middleware                │
│ - helmet (seguridad headers)            │
│ - cors (validar origen)                 │
│ - body-parser (parse JSON)              │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ JwtAuthGuard                            │
│ - Valida token JWT                      │
│ - Inyecta req.user                      │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ RolesGuard (si aplica)                  │
│ - Valida roles de usuario               │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ OwnershipGuard (si aplica)              │
│ - Valida ownership de recurso           │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ RLS Interceptor                         │
│ - Aplica SET LOCAL para tenant          │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ ValidationPipe                          │
│ - Valida DTOs con class-validator       │
└─────────────────────────────────────────┘
  ↓
CONTROLLER
  ↓
SERVICE (queries con RLS activo)
  ↓
DATABASE (políticas RLS aplican)
  ↓
RESPONSE
```

---

## Decoradores Personalizados

### @Roles()

**Ubicación:** `apps/backend/src/shared/decorators/roles.decorator.ts`

```typescript
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Uso:**
```typescript
@Roles(Role.ADMIN)
deleteUser() { ... }
```

### @Public()

**Ubicación:** `apps/backend/src/shared/decorators/public.decorator.ts`

```typescript
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Uso:**
```typescript
@Public() // ← Bypass JwtAuthGuard
@Post('login')
login() { ... }
```

### @CurrentUser()

**Ubicación:** `apps/backend/src/shared/decorators/current-user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Uso:**
```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  // user inyectado automáticamente
  return user;
}
```

---

## Buenas Prácticas

### 1. Orden de Guards Importa

```typescript
// ✅ CORRECTO
@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
// Primero autenticación, luego roles, luego ownership

// ❌ INCORRECTO
@UseGuards(RolesGuard, JwtAuthGuard)
// RolesGuard falla porque req.user no existe aún
```

### 2. Validar Roles vs Ownership

**Roles:** Para operaciones amplias
```typescript
@Roles(Role.TEACHER)
getAllClassrooms() { ... } // Todos los classrooms del teacher
```

**Ownership:** Para recursos específicos
```typescript
@UseGuards(OwnershipGuard)
getClassroom(@Param('id') id) { ... } // Solo SU classroom
```

### 3. Rutas Públicas

```typescript
@Controller('auth')
export class AuthController {

  @Public() // ← Rutas de auth deben ser públicas
  @Post('login')
  login() { ... }

  @Public()
  @Post('register')
  register() { ... }
}
```

### 4. Testing de Guards

```typescript
describe('RolesGuard', () => {
  it('should allow access if user has required role', async () => {
    const context = mockExecutionContext({
      user: { roles: [Role.ADMIN] }
    });

    const guard = new RolesGuard(reflector);
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
```

---

## Issues Conocidos

### Issue #RLS-001: RLS Interceptor No Aplica SET LOCAL

**Estado:** 🔴 CRÍTICO
**Severidad:** Alta
**Impacto:** RLS policies definidas pero NO activas

**Problema:**
El `RlsInterceptor` existe en código pero NO ejecuta `SET LOCAL`, por lo que las políticas RLS en la base de datos no se activan.

**Ubicación:** `apps/backend/src/shared/interceptors/rls.interceptor.ts:97-98`

**Fix requerido:**
```typescript
// Línea 97-98: Agregar
await queryRunner.query(
  `SET LOCAL app.current_tenant_id = '${user.organizationId}'`
);
await queryRunner.query(
  `SET LOCAL app.current_user_id = '${user.id}'`
);
```

**Riesgo:**
- Datos multi-tenant podrían filtrarse entre organizaciones
- Violación GDPR/FERPA si datos sensibles de menores son accesibles

**Prioridad:** P0 - Resolver antes de deployment a producción

---

## Referencias

### Documentación relacionada

> **Requerimientos:**
> - [RNF-SEC-001 - Autenticación JWT](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-001.md)
> - [RNF-SEC-003 - RBAC](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-003.md)

> **Especificaciones técnicas:**
> - [Sistema de Seguridad](../../02-especificaciones-tecnicas/seguridad/SISTEMA-SEGURIDAD.md)
> - [ADR-002 - JWT Security Implementation](../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
> - [ADR-003 - RLS vs App Layer Authorization](../../02-especificaciones-tecnicas/adr/ADR-003-rls-vs-app-layer-authorization.md)
> - [ADR-005 - Multi-tenancy Implementation](../../02-especificaciones-tecnicas/adr/ADR-005-multi-tenancy-implementation.md)

> **Código fuente:**
> - Guards: `apps/backend/src/shared/guards/`
> - Interceptors: `apps/backend/src/shared/interceptors/`
> - Decoradores: `apps/backend/src/shared/decorators/`
> - RLS Policies: `apps/database/ddl/schemas/*/rls-policies/`

### Recursos externos

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Top 10 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

**Última revisión:** 2025-11-07
**Próxima actualización:** Cuando se resuelva Issue #RLS-001
**Responsable:** @backend-team
