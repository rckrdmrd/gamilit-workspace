# Decisión Arquitectónica: Autenticación y Autorización en GAMILIT

**Proyecto:** GAMILIT Platform
**Categoría:** Arquitectura de Backend
**Última actualización:** 2025-11-07
**Estado:** ✅ Implementado
**Decisión:** Usar NestJS Guards + PostgreSQL RLS en lugar de Express Middleware tradicional

---

## Índice

1. [Contexto](#contexto)
2. [Decisión](#decisión)
3. [Alternativas Consideradas](#alternativas-consideradas)
4. [Razones de la Decisión](#razones-de-la-decisión)
5. [Consecuencias](#consecuencias)
6. [Implementación](#implementación)
7. [Referencias](#referencias)

---

## Contexto

GAMILIT es una plataforma educativa multi-tenant que requiere:

1. **Autenticación robusta** de estudiantes, profesores y administradores
2. **Autorización granular** basada en roles (RBAC)
3. **Aislamiento de datos** entre organizaciones (multi-tenancy)
4. **Protección IDOR** (Insecure Direct Object Reference)
5. **Cumplimiento legal** (GDPR, FERPA) para datos de menores

### Requerimientos de Seguridad

| Requerimiento | Descripción | Severidad |
|--------------|-------------|-----------|
| **RNF-SEC-001** | Autenticación JWT | Alta |
| **RNF-SEC-003** | RBAC (Role-Based Access Control) | Alta |
| **RNF-SEC-005** | Multi-tenant data isolation | Crítica |
| **RNF-SEC-007** | Anti-IDOR protection | Alta |
| **RNF-SEC-009** | Defense-in-Depth | Crítica |

### Problema

Al migrar de un backend inicial en Express a NestJS 11, surgió la pregunta:

> ¿Deberíamos mantener middlewares tradicionales de Express o adoptar el modelo de Guards de NestJS?
>
> ¿Cómo garantizar aislamiento multi-tenant que no pueda ser bypassed?

---

## Decisión

**Adoptar una arquitectura híbrida de 3 capas:**

```
┌──────────────────────────────────────────────┐
│  1. AUTENTICACIÓN: NestJS Guards             │
│     - JwtAuthGuard (Passport JWT Strategy)   │
│     - Valida token y estado de cuenta        │
└──────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  2. AUTORIZACIÓN RBAC: NestJS Guards         │
│     - RolesGuard (valida roles)              │
│     - OwnershipGuard (valida ownership)      │
│     - Anti-IDOR protection                   │
└──────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  3. MULTI-TENANT: PostgreSQL RLS             │
│     - RLS Interceptor (SET LOCAL)            │
│     - Row Level Security policies            │
│     - Cannot be bypassed                     │
└──────────────────────────────────────────────┘
```

### Componentes Clave

1. **NestJS Guards** para autenticación y RBAC
2. **PostgreSQL RLS** para multi-tenancy
3. **NO middlewares tradicionales** de Express

---

## Alternativas Consideradas

### Alternativa 1: Express Middleware Tradicional

**Descripción:** Usar middlewares de Express para toda la seguridad

```typescript
// Enfoque tradicional Express
app.use(authenticateJWT);
app.use(extractTenantId);
router.get('/data', requireRole('admin'), getData);
```

**Ventajas:**
- ✅ Familiar para desarrolladores Express
- ✅ Muchos ejemplos y librerías disponibles

**Desventajas:**
- ❌ No integra bien con decoradores de NestJS
- ❌ Dificulta testing con módulos NestJS
- ❌ Menos type-safe con TypeScript
- ❌ Filtrado multi-tenant en app layer (puede bypassed)
- ❌ No aprovecha características de NestJS

**Decisión:** ❌ Rechazada

---

### Alternativa 2: NestJS Guards + App-Layer Filtering

**Descripción:** Usar Guards de NestJS pero filtrar multi-tenancy en código

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
async getData(@CurrentUser() user: User) {
  // Filtrar manualmente por tenant
  return this.service.getData({ tenantId: user.tenantId });
}
```

**Ventajas:**
- ✅ Integra bien con NestJS
- ✅ Type-safe con TypeScript
- ✅ Fácil de testear

**Desventajas:**
- ❌ Filtrado multi-tenant puede olvidarse
- ❌ Vulnerable a bypass si desarrollador olvida filtrar
- ❌ No cumple Defense-in-Depth
- ❌ Difícil de auditar (disperso en código)

**Decisión:** ❌ Rechazada (ver ADR-003)

---

### Alternativa 3: NestJS Guards + PostgreSQL RLS ✅

**Descripción:** Guards para auth/RBAC + RLS para multi-tenancy

```typescript
// Guard maneja autenticación
@UseGuards(JwtAuthGuard, RolesGuard)
async getData(@CurrentUser() user: User) {
  // RLS automáticamente filtra por tenant
  return this.service.getData(); // No necesita tenant_id manual
}
```

**Ventajas:**
- ✅ Integración nativa con NestJS
- ✅ Type-safe con TypeScript
- ✅ RLS en BD **cannot be bypassed**
- ✅ Defense-in-Depth (múltiples capas)
- ✅ Cumple GDPR/FERPA
- ✅ Fácil de testear
- ✅ Fácil de auditar

**Desventajas:**
- ⚠️ Requiere conocimiento de RLS en PostgreSQL
- ⚠️ Configuración inicial más compleja
- ⚠️ Requiere RLS Interceptor bien implementado

**Decisión:** ✅ **SELECCIONADA**

---

## Razones de la Decisión

### 1. Integración con NestJS

**Guards son el mecanismo nativo de NestJS** para autenticación y autorización.

```typescript
// ✅ Idiomatic NestJS
@Controller('data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataController {
  @Get()
  @Roles(Role.ADMIN)
  getData(@CurrentUser() user: User) {
    return this.service.getData();
  }
}

// ❌ No idiomatic (mixing Express + NestJS)
@Controller('data')
export class DataController {
  @Get()
  getData(@Req() req: AuthRequest) { // AuthRequest es de Express
    // ...
  }
}
```

**Beneficios:**
- Decoradores expresivos (`@UseGuards`, `@Roles`, `@CurrentUser`)
- Mejor documentación automática (Swagger)
- Testing más simple con `TestingModule`

---

### 2. Type Safety

Guards permiten **tipado fuerte** con TypeScript:

```typescript
// ✅ Type-safe con Guards
@Get()
getData(@CurrentUser() user: User) { // user es tipo User
  const id: string = user.id; // TS valida
}

// ⚠️ Menos type-safe con middleware
getData(req: Request) {
  const user = req.user; // tipo 'any'
  const id = user.id; // No hay validación TS
}
```

---

### 3. Defense-in-Depth con RLS

**RLS en PostgreSQL es la última línea de defensa** que no puede ser bypassed.

```sql
-- Política RLS en tabla user_stats
CREATE POLICY user_stats_tenant_isolation
ON gamification_system.user_stats
USING (organization_id = current_setting('app.current_tenant_id')::uuid);
```

**Flujo completo:**

```
1. Request → JwtAuthGuard → Valida token ✓
2. Request → RolesGuard → Valida role='teacher' ✓
3. Request → RLS Interceptor → SET LOCAL app.current_tenant_id = '123'
4. Query → SELECT * FROM user_stats
5. PostgreSQL automáticamente aplica:
   WHERE organization_id = '123'
```

**Ventaja crítica:**
- Aunque un desarrollador olvide validar tenant en código
- Aunque exista un bug en el servicio
- **RLS siempre filtra** a nivel de base de datos
- Cannot be bypassed desde código de aplicación

**Cumplimiento legal:**
- ✅ GDPR: Datos de organizaciones no se mezclan
- ✅ FERPA: Datos de menores protegidos por defecto
- ✅ Auditable: Logs a nivel de BD

---

### 4. Separation of Concerns

Cada capa tiene una **responsabilidad clara**:

| Capa | Responsabilidad | Implementación |
|------|----------------|----------------|
| **Guards** | ¿Quién eres? (Autenticación) | JwtAuthGuard |
| **Guards** | ¿Qué puedes hacer? (RBAC) | RolesGuard, OwnershipGuard |
| **RLS** | ¿Qué datos ves? (Multi-tenant) | PostgreSQL policies |

**Ventajas:**
- Fácil de razonar sobre seguridad
- Fácil de testear cada capa independientemente
- Fácil de auditar

---

### 5. Referencia a ADR-003

Esta decisión fue formalmente documentada en:

> [ADR-003: RLS vs App Layer Authorization](../../adr/ADR-003-rls-vs-app-layer-authorization.md)

**Conclusión de ADR-003:**
- App-layer filtering es propenso a errores
- RLS garantiza aislamiento a nivel de BD
- Implementar ambos (Defense-in-Depth) es óptimo

---

## Consecuencias

### Positivas ✅

1. **Seguridad mejorada**
   - Defense-in-Depth con múltiples capas
   - RLS cannot be bypassed
   - Cumplimiento GDPR/FERPA garantizado

2. **Código más limpio**
   - Decoradores expresivos (`@UseGuards`, `@Roles`)
   - No necesita filtrar tenant manualmente en cada query
   - Type-safe con TypeScript

3. **Testing más simple**
   - Guards se mockean fácilmente
   - Testing de RLS se hace a nivel de BD
   - Tests de integración más confiables

4. **Mejor mantenibilidad**
   - Separación clara de responsabilidades
   - Fácil de auditar seguridad
   - Fácil de agregar nuevos roles/permisos

### Negativas ⚠️

1. **Curva de aprendizaje**
   - Desarrolladores deben aprender RLS de PostgreSQL
   - Debe entenderse el modelo de Guards de NestJS

2. **Configuración inicial**
   - Setup de RLS policies requiere SQL
   - RLS Interceptor debe configurarse correctamente
   - Más setup que simple middleware

3. **Debugging complejo**
   - RLS puede dificultar debugging (queries filtran silenciosamente)
   - Requiere entender ejecución de Guards

### Mitigaciones

1. **Documentación exhaustiva**
   - [GUARDS-Y-SEGURIDAD.md](../../03-desarrollo/backend/GUARDS-Y-SEGURIDAD.md)
   - Ejemplos de uso de cada Guard
   - Documentación de RLS policies

2. **Helper de debugging**
   ```typescript
   // Disable RLS temporalmente para debugging
   if (process.env.DEBUG_RLS === 'true') {
     await queryRunner.query('SET LOCAL app.bypass_rls = true');
   }
   ```

3. **Tests exhaustivos**
   - Tests unitarios de Guards
   - Tests de integración de RLS
   - Tests de seguridad (intentos de bypass)

---

## Implementación

### Guards Implementados

1. **JwtAuthGuard** (`apps/backend/src/shared/guards/jwt-auth.guard.ts`)
   - Extiende Passport `AuthGuard('jwt')`
   - Valida token JWT
   - Inyecta `user` en request

2. **RolesGuard** (`apps/backend/src/shared/guards/roles.guard.ts`)
   - Valida roles usando metadata `@Roles()`
   - Permite acceso según roles requeridos

3. **OwnershipGuard** (`apps/backend/src/shared/guards/ownership.guard.ts`)
   - Valida ownership de recursos
   - Previene ataques IDOR

### RLS Interceptor

**Ubicación:** `apps/backend/src/shared/interceptors/rls.interceptor.ts`

**Implementación:**
```typescript
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // ⚠️ CRÍTICO: Configurar variables de sesión
      await queryRunner.query(
        `SET LOCAL app.current_tenant_id = '${user.organizationId}'`
      );
      await queryRunner.query(
        `SET LOCAL app.current_user_id = '${user.id}'`
      );

      const result = await next.handle().toPromise();
      await queryRunner.release();
      return result;
    }

    return next.handle();
  }
}
```

### Decoradores Personalizados

1. **@Roles(...roles)** - Especifica roles permitidos
2. **@Public()** - Marca endpoint como público
3. **@CurrentUser()** - Inyecta usuario autenticado

### Ejemplo de Uso Completo

```typescript
@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassroomController {

  // Solo teachers pueden crear aulas
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  createClassroom(@CurrentUser() user: User, @Body() dto: CreateClassroomDto) {
    // RLS automáticamente asegura que se crea en tenant correcto
    return this.classroomService.create(dto);
  }

  // Solo el owner o admin puede acceder
  @Get(':id')
  @UseGuards(OwnershipGuard)
  getClassroom(@Param('id') id: string) {
    // RLS automáticamente filtra por tenant
    return this.classroomService.findOne(id);
  }
}
```

---

## Referencias

### Documentación Interna

> **Requerimientos:**
> - [RNF-SEC-001 - Autenticación JWT](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-001.md)
> - [RNF-SEC-003 - RBAC](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-003.md)
> - [RNF-SEC-005 - Multi-tenancy](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-005.md)

> **ADRs:**
> - [ADR-002 - JWT Security Implementation](../adr/ADR-002-jwt-security-implementation.md)
> - [ADR-003 - RLS vs App Layer Authorization](../adr/ADR-003-rls-vs-app-layer-authorization.md)
> - [ADR-005 - Multi-tenancy Implementation](../adr/ADR-005-multi-tenancy-implementation.md)

> **Implementación:**
> - [GUARDS-Y-SEGURIDAD.md](../../03-desarrollo/backend/GUARDS-Y-SEGURIDAD.md)
> - [SISTEMA-SEGURIDAD.md](../seguridad/SISTEMA-SEGURIDAD.md)

> **Código fuente:**
> - Guards: `apps/backend/src/shared/guards/`
> - Interceptors: `apps/backend/src/shared/interceptors/`
> - RLS Policies: `apps/database/ddl/schemas/*/rls-policies/`

### Recursos Externos

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Top 10 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP - Insecure Direct Object Reference](https://owasp.org/www-community/vulnerabilities/Insecure_Direct_Object_Reference)

---

**Última revisión:** 2025-11-07
**Próxima revisión:** Cuando se implemente autenticación adicional (OAuth, SSO)
**Responsables:** @backend-team, @security-team
