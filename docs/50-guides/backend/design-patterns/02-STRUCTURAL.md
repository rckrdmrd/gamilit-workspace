---
titulo: Patrones Estructurales en NestJS (Adapter, Decorator)
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, nestjs, typescript, estructural]
aplica_a: [backend]
estado: vigente
origen: GUIA-DESIGN-PATTERNS-NESTJS.md
seccion: "Secciones 3, 4"
---

# Patrones Estructurales en NestJS (Adapter, Decorator)

> **Aplica a:** `apps/backend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, TypeScript 5.x

---

## 3. Adapter Pattern

**Categoria GoF:** Estructural

**Descripcion:** El patron Adapter permite que interfaces incompatibles trabajen juntas, envolviendo una clase existente con una interfaz nueva. En gamilit, los repositorios TypeORM adaptan la interfaz de persistencia SQL a la interfaz de dominio, y `RedisIoAdapter` adapta Redis a la interfaz de Socket.IO.

### 3.1 TypeORM Repositories como Adaptadores

Los repositorios TypeORM adaptan la interfaz de persistencia de PostgreSQL a la interfaz de dominio que esperan los servicios:

```typescript
// El adaptador traduce entre dominio e infraestructura
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  // Adapta la interfaz de dominio a operaciones TypeORM
  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = UserPersistenceMapper.toOrmEntity(user);
    await this.repository.save(entity);
  }
}
```

> **Referencia completa:** Ver `docs/40-standards/backend-profesional/03-repository-pattern.md`
> para el patron Repository en detalle.

### 3.2 RedisIoAdapter para Socket.IO

El `RedisIoAdapter` es un adaptador que conecta la interfaz de Socket.IO con Redis para escalamiento horizontal:

```typescript
// apps/backend/src/adapters/redis-io.adapter.ts
export class RedisIoAdapter extends IoAdapter {
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;

  // Adapta la interfaz de IoAdapter para usar Redis pub/sub
  async connectToRedis(): Promise<boolean> {
    this.pubClient = createClient(clientOptions) as RedisClientType;
    this.subClient = this.pubClient.duplicate() as RedisClientType;
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
    return true;
  }

  // Override del metodo de IoAdapter para inyectar el adaptador Redis
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, serverOptions);
    if (this.adapterConstructor && this.isConnected) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
```

**Beneficio clave:** Los gateways de WebSocket (`NotificationsGateway`, `MatchmakingGateway`, `BattleGateway`) no necesitan saber si usan memoria local o Redis. El adaptador encapsula esa decision.

### 3.3 Adaptadores de Servicio Externo

Patron para adaptar servicios externos (email, S3, SMS) a interfaces de dominio:

```typescript
// Interfaz de dominio (puerto secundario)
export interface IFileStorageService {
  upload(file: Buffer, key: string): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// Adaptador para S3
@Injectable()
export class S3StorageAdapter implements IFileStorageService {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: Buffer, key: string): Promise<string> {
    await this.s3Client.send(new PutObjectCommand({ /* ... */ }));
    return `https://bucket.s3.amazonaws.com/${key}`;
  }
}

// Adaptador para filesystem local (desarrollo)
@Injectable()
export class LocalStorageAdapter implements IFileStorageService {
  async upload(file: Buffer, key: string): Promise<string> {
    await fs.writeFile(`./uploads/${key}`, file);
    return `/uploads/${key}`;
  }
}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Integrar librerias externas con interfaces propias | Cuando la libreria ya expone la interfaz que necesitas |
| Abstraer detalles de persistencia (SQL, Redis, S3) | Para clases que no necesitan ser intercambiables |
| Facilitar testing con mocks/stubs | Si solo hay una implementacion y nunca cambiara |
| Permitir cambio de proveedor sin impacto | Para adaptaciones triviales (un wrapper sin logica) |

---

## 4. Decorator Pattern

**Categoria GoF:** Estructural

**Descripcion:** El patron Decorator agrega responsabilidades a un objeto dinamicamente, sin modificar su clase. En NestJS, los decoradores de TypeScript (`@Decorator()`) son la manifestacion mas directa: agregan metadatos, comportamiento o validaciones a clases y metodos sin alterar su codigo.

### 4.1 Decoradores de Metadata en gamilit

Los decoradores custom de gamilit usan `SetMetadata` y `createParamDecorator` para agregar informacion a los handlers sin modificarlos:

```typescript
// apps/backend/src/shared/decorators/roles.decorator.ts
// Agrega metadata de roles requeridos sin modificar el controller
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Uso:
@Roles('admin', 'super_admin')
@Delete('users/:id')
deleteUser() { /* ... */ }
```

```typescript
// apps/backend/src/shared/decorators/current-user.decorator.ts
// Extrae el usuario del request sin que el controller conozca la implementacion
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return null;
    return data ? user[data] : user;
  },
);

// Uso:
@Get('profile')
getProfile(@CurrentUser() user: RequestUser) { /* ... */ }

// O para extraer solo una propiedad:
@Get('profile')
getProfile(@CurrentUser('email') email: string) { /* ... */ }
```

### 4.2 Decoradores Adicionales en gamilit

```typescript
// apps/backend/src/shared/decorators/tenant.decorator.ts
// Extrae el tenantId del usuario autenticado
export const TenantId = createParamDecorator(/* ... */);

// apps/backend/src/shared/decorators/permissions.decorator.ts
// Define permisos granulares requeridos
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// apps/backend/src/shared/decorators/public.decorator.ts
// Marca una ruta como publica (sin autenticacion)
export const Public = () => SetMetadata('isPublic', true);

// apps/backend/src/modules/parents/decorators/parent-account.decorator.ts
// Extrae la cuenta de padre del request
export const ParentAccount = createParamDecorator(/* ... */);

// apps/backend/src/modules/ml/decorators/cache-prediction.decorator.ts
// Cachea resultados de prediccion ML
export const CachePrediction = () => /* ... */;
```

### 4.3 Composicion de Decoradores

Los decoradores se pueden componer para crear "super-decoradores" que combinan multiples responsabilidades:

```typescript
// Composicion: Un solo decorador que aplica autenticacion + documentacion
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuth(...roles: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token invalido o expirado' }),
  );
}

// Uso simplificado:
@ApiAuth('teacher', 'admin')
@Post('assignments')
createAssignment() { /* ... */ }
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Agregar metadata a rutas (roles, permisos, cache) | Para logica de negocio compleja |
| Extraer datos del request de forma reutilizable | Si la extraccion es especifica de un solo endpoint |
| Componer comportamiento transversal (auth + docs) | Para reemplazar guards o interceptors |
| Documentar contratos de API con Swagger | Si el decorador solo agrega complejidad sin beneficio |
