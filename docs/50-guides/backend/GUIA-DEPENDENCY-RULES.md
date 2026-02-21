---
titulo: Guia de Reglas de Dependencia
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [arquitectura, dependencias, imports, nestjs]
aplica_a: [backend]
estado: vigente
---

# Guia de Reglas de Dependencia en NestJS

> **Aplica a:** `apps/backend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, TypeScript 5.x

---

## 1. Principio Fundamental

**Las dependencias SIEMPRE apuntan hacia el dominio (hacia adentro).**

Esto significa que las capas externas (infraestructura) conocen a las capas internas (dominio), pero NUNCA al reves. El dominio es independiente del framework, la base de datos y cualquier servicio externo.

```
┌─────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (Controllers, Repos, Adapters)          │
│    │                                                    │
│    ▼                                                    │
│  APPLICATION (Services, Use Cases, DTOs)                │
│    │                                                    │
│    ▼                                                    │
│  DOMAIN (Entities, Value Objects, Interfaces)           │
│  ══════════════════════════════════════════              │
│  SIN dependencias externas                              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Reglas de Import para gamilit

### 2.1 Regla 1: Controllers NO importan Repositories directamente

Los controllers deben depender **unicamente de servicios** (Application Layer), nunca de repositorios ni de la capa de persistencia.

```typescript
// CORRECTO: Controller depende de Service
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }
}

// INCORRECTO: Controller accede directamente al Repository
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>, // VIOLACION
  ) {}
}
```

**Razon:** El controller es un adaptador primario. Su responsabilidad es traducir HTTP a invocaciones de servicio, no contener logica de acceso a datos.

### 2.2 Regla 2: Entities de dominio NO importan de infrastructure

Las entidades de dominio no deben depender de detalles de implementacion como bases de datos, HTTP, o servicios externos.

```typescript
// CORRECTO: Entity pura con logica de dominio
export class User {
  activate(): void {
    if (this.status !== UserStatus.PENDING) {
      throw new InvalidUserStateError('Solo usuarios pendientes pueden activarse');
    }
    this.status = UserStatus.ACTIVE;
  }
}

// EXCEPCION PRAGMATICA: Decoradores TypeORM en la misma entity
// En gamilit usamos entities con decoradores TypeORM por pragmatismo.
// Esto es una concesion aceptada (ver ADR correspondiente).
@Entity('users', { schema: 'auth_management' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
}
```

> **Nota:** La separacion completa entre Domain Entity y ORM Entity (como se muestra en
> `docs/40-standards/backend-profesional/02-clean-architecture.md`, seccion 2.3) es el ideal.
> En la practica, gamilit usa una unica entidad con decoradores TypeORM por pragmatismo en la
> mayoria de modulos. Para modulos criticos como `auth` y `gamification`, se recomienda la
> separacion completa.

### 2.3 Regla 3: Services NO importan Controllers

El flujo de dependencia es unidireccional: Controller -> Service -> Repository. Un servicio NUNCA debe conocer al controller que lo invoca.

```typescript
// CORRECTO: Service es independiente del controller
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    // Logica de negocio, sin referencia a HTTP/WS
  }
}

// INCORRECTO: Service importa Controller o usa Request/Response
@Injectable()
export class AuthService {
  constructor(
    private readonly authController: AuthController, // VIOLACION
  ) {}
}
```

### 2.4 Regla 4: Un modulo NO importa internals de otro modulo

Los modulos solo pueden acceder a la API publica de otros modulos, definida por sus barrel exports (`index.ts`) y los providers listados en `exports` del `@Module`.

```typescript
// CORRECTO: Importar desde barrel export
import { AuthService } from '@/modules/auth';
import { User } from '@/modules/auth/entities';

// INCORRECTO: Importar archivo interno directamente
import { AuthService } from '@/modules/auth/services/auth.service';
import { validatePassword } from '@/modules/auth/utils/password-validator';
```

**Estructura de barrel exports en gamilit:**

```
src/modules/auth/
├── index.ts              # Barrel principal del modulo
├── entities/index.ts     # Barrel de entities
├── dto/index.ts          # Barrel de DTOs
├── guards/index.ts       # Barrel de guards
├── services/index.ts     # Barrel de services
└── controllers/index.ts  # Barrel de controllers
```

### 2.5 Regla 5: Shared/Core puede ser importado por cualquier modulo

Los modulos `shared/` y `core/` contienen utilidades transversales que cualquier modulo puede usar.

```typescript
// CORRECTO: Cualquier modulo puede importar de shared
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '@/shared/decorators/current-user.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { GamilityRoleEnum } from '@/shared/constants';

// Decoradores compartidos en gamilit:
// - @Roles()       → shared/decorators/roles.decorator.ts
// - @CurrentUser() → shared/decorators/current-user.decorator.ts
// - @TenantId()    → shared/decorators/tenant.decorator.ts
// - @Permissions() → shared/decorators/permissions.decorator.ts
// - @Public()      → shared/decorators/public.decorator.ts

// Guards compartidos en gamilit:
// - AuthGuard              → shared/guards/auth.guard.ts
// - RolesGuard             → shared/guards/roles.guard.ts
// - PermissionsGuard       → shared/guards/permissions.guard.ts
// - AccountStatusGuard     → shared/guards/account-status.guard.ts
// - EmailVerifiedGuard     → shared/guards/email-verified.guard.ts
// - ResourceOwnershipGuard → shared/guards/resource-ownership.guard.ts
```

---

## 3. Deteccion de Violaciones

### 3.1 ESLint con Plugin de Boundaries

Se recomienda configurar `eslint-plugin-boundaries` para detectar automaticamente violaciones de las reglas de dependencia.

**Instalacion:**

```bash
npm install --save-dev eslint-plugin-boundaries
```

**Configuracion de zonas para gamilit:**

```javascript
// .eslintrc.js (seccion relevante)
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      {
        type: 'domain',
        pattern: 'src/modules/*/domain/**',
        capture: ['module'],
      },
      {
        type: 'application',
        pattern: 'src/modules/*/application/**',
        capture: ['module'],
      },
      {
        type: 'infrastructure',
        pattern: 'src/modules/*/infrastructure/**',
        capture: ['module'],
      },
      {
        type: 'shared',
        pattern: 'src/shared/**',
      },
      {
        type: 'module-public',
        pattern: 'src/modules/*/index.ts',
        capture: ['module'],
      },
    ],
  },
  rules: {
    // Domain NO puede importar de Application ni Infrastructure
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'domain',
            allow: ['domain', 'shared'],
          },
          {
            from: 'application',
            allow: ['domain', 'application', 'shared'],
          },
          {
            from: 'infrastructure',
            allow: ['domain', 'application', 'infrastructure', 'shared'],
          },
          {
            // Cualquier capa puede importar shared
            from: 'shared',
            allow: ['shared'],
          },
        ],
      },
    ],
    // Modulos solo acceden a otros modulos via su API publica
    'boundaries/entry-point': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            target: 'module-public',
            allow: '**',
          },
        ],
      },
    ],
  },
};
```

### 3.2 Alternativa con @rushstack/eslint-plugin

Para proyectos que prefieren un enfoque basado en `@rushstack`:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@rushstack/eslint-plugin'],
  rules: {
    '@rushstack/no-internal-imports': [
      'error',
      {
        // Solo permitir imports desde index.ts de otros modulos
        allowedPackages: ['@nestjs/*', 'typeorm'],
      },
    ],
  },
};
```

### 3.3 Script de Validacion Manual

Para verificar rapidamente violaciones sin ESLint configurado:

```bash
# Buscar controllers que importan Repository directamente
grep -rn "InjectRepository" apps/backend/src/modules/*/controllers/ 2>/dev/null

# Buscar services que importan controllers
grep -rn "import.*Controller" apps/backend/src/modules/*/services/ 2>/dev/null

# Buscar imports internos entre modulos (saltando barrels)
grep -rn "from '@/modules/[^']*/" apps/backend/src/modules/ \
  | grep -v "index" \
  | grep -v "entities" \
  | grep -v "dto"
```

---

## 4. Dependencias Circulares

### 4.1 Deteccion

Las dependencias circulares son uno de los problemas mas comunes en aplicaciones NestJS grandes. Se detectan con la herramienta `madge`:

```bash
# Instalar madge
npm install -g madge

# Detectar dependencias circulares
madge --circular apps/backend/src

# Generar grafo visual (requiere graphviz)
madge --circular --image graph.svg apps/backend/src
```

NestJS tambien reporta dependencias circulares en tiempo de ejecucion con el error:
```
Error: A circular dependency has been detected (ModuleA -> ModuleB -> ModuleA).
```

### 4.2 Solucion Temporal: forwardRef()

`forwardRef()` es la solucion inmediata que NestJS provee, pero debe tratarse como **deuda tecnica**, no como solucion permanente.

```typescript
// Modulo A necesita Modulo B y viceversa
@Module({
  imports: [
    forwardRef(() => ModuleBModule), // Solucion temporal
  ],
})
export class ModuleAModule {}

// En el servicio:
@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private readonly serviceB: ServiceB,
  ) {}
}
```

> **IMPORTANTE:** `forwardRef()` es una solucion temporal. Todo uso de `forwardRef()` debe
> documentarse como deuda tecnica con un plan para resolverlo.

### 4.3 Solucion Permanente: Extraer Interfaz Compartida

El patron recomendado es extraer la dependencia compartida a un modulo comun:

```
ANTES (circular):
  AuthModule ←→ UserModule

DESPUES (resuelto):
  SharedAuthModule (interfaces/tipos compartidos)
       ↑                    ↑
  AuthModule           UserModule
```

```typescript
// shared/interfaces/auth-user.interface.ts
export interface IAuthUser {
  id: string;
  email: string;
  roles: string[];
  tenantId: string;
}

// Ambos modulos dependen de la interfaz compartida,
// no el uno del otro
```

### 4.4 Patron Alternativo: Event-Based Decoupling

Cuando dos modulos necesitan comunicarse bidireccionalmente, usar eventos desacopla la dependencia:

```typescript
// Modulo A emite evento (no conoce a Modulo B)
@Injectable()
export class UserService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepo.save(dto);
    // Emitir evento en vez de llamar a GamificationService directamente
    this.eventEmitter.emit('user.created', { userId: user.id });
    return user;
  }
}

// Modulo B escucha evento (no conoce a Modulo A)
@Injectable()
export class GamificationListener {
  @OnEvent('user.created')
  async handleUserCreated(payload: { userId: string }): Promise<void> {
    // Asignar XP inicial, crear perfil de gamificacion, etc.
    await this.xpService.grantInitialXP(payload.userId);
  }
}
```

---

## 5. Diagrama de Dependencias Permitidas entre Modulos gamilit

El siguiente diagrama muestra las dependencias permitidas entre los 23 modulos principales. Las flechas indican "depende de" (A <- B significa "B depende de A").

```
                    ┌──────────┐
                    │  shared  │  (decorators, guards, constants, utils)
                    └────┬─────┘
                         │ (puede ser importado por TODOS)
            ┌────────────┼────────────────────────────────────┐
            │            │                                    │
     ┌──────▼──────┐  ┌──▼───────┐                    ┌──────▼──────┐
     │    auth      │  │  core    │                    │   health    │
     │ (JWT, RBAC)  │  │ (utils)  │                    │ (checks)   │
     └──────┬───────┘  └──────────┘                    └─────────────┘
            │
    ┌───────┼──────────────┬──────────────────────┐
    │       │              │                      │
┌───▼───┐ ┌─▼──────────┐ ┌▼────────────┐  ┌──────▼──────┐
│ users │ │  tenants    │ │ settings    │  │notifications│
└───┬───┘ └─────────────┘ └─────────────┘  └─────────────┘
    │
    ├─────────────────────┬──────────────────────────────┐
    │                     │                              │
┌───▼──────────┐   ┌─────▼───────┐              ┌───────▼──────┐
│  educational  │   │ gamification │              │   teacher    │
│ (modulos,     │   │ (XP, rangos, │              │ (aulas,      │
│  ejercicios,  │   │  logros,     │              │  asignaciones│
│  contenido)   │   │  ML coins)   │              │  reportes)   │
└───────┬───────┘   └──────┬───────┘              └──────┬───────┘
        │                  │                             │
        │           ┌──────┼──────────┐                  │
        │           │      │          │                  │
        │    ┌──────▼──┐ ┌─▼────┐ ┌──▼─────┐     ┌──────▼──────┐
        │    │ missions │ │ store│ │ social │     │   parents   │
        │    └──────────┘ └──────┘ └────────┘     └─────────────┘
        │
   ┌────▼──────┐
   │  progress  │
   │ (sesiones, │
   │  envios)   │
   └────┬───────┘
        │
   ┌────▼──────────┐
   │   analytics   │
   │  (reportes,   │
   │   metricas)   │
   └───────────────┘
```

### Reglas del Diagrama

| Regla | Descripcion |
|-------|-------------|
| `shared` y `core` | Son transversales, cualquier modulo puede importarlos |
| `auth` | Es la base de seguridad, casi todos dependen de el |
| `educational` | Modulo de contenido educativo, depende de `auth` y `users` |
| `gamification` | Depende de `auth` y `users`; `missions`, `store`, `social` dependen de el |
| `progress` | Depende de `educational` (ejercicios) y `auth` (usuarios) |
| `analytics` | Depende de `progress` y puede leer datos de cualquier modulo (solo lectura) |
| `tasks` | Modulo de cron jobs, puede importar servicios de cualquier modulo |
| Modulos **NO** deben | Crear dependencias circulares directas entre si |

### Dependencias Prohibidas

```
PROHIBIDO:
  gamification -> educational    (gamification NO depende de educational)
  educational -> gamification    (educational NO depende de gamification)
  progress -> teacher           (progress NO depende de teacher)
  auth -> users                 (auth NO depende de users como modulo separado)

  Si un modulo necesita datos de otro con dependencia prohibida:
  1. Usar eventos (EventEmitter2)
  2. Extraer interfaz compartida a shared/
  3. Usar un modulo intermediario
```

---

## 6. Checklist de Dependency Rules

### Pre-Desarrollo

- [ ] Identificar en que modulo vivira el nuevo codigo
- [ ] Verificar que las dependencias requeridas son permitidas segun el diagrama
- [ ] Si se necesita un modulo nuevo, definir sus dependencias antes de implementar

### Durante Desarrollo

- [ ] Controllers solo inyectan Services, nunca Repositories
- [ ] Services no importan Controllers ni Gateways
- [ ] Imports entre modulos usan barrel exports (`index.ts`)
- [ ] No se usa `forwardRef()` sin documentar la razon
- [ ] Imports de `shared/` se hacen desde rutas estandarizadas

### Post-Desarrollo

- [ ] Ejecutar `madge --circular apps/backend/src` — cero dependencias circulares nuevas
- [ ] Verificar que no hay imports directos a archivos internos de otros modulos
- [ ] Si se agrego `forwardRef()`, crear ticket de deuda tecnica para resolverlo
- [ ] Barrel exports actualizados con las nuevas exportaciones publicas

### Revision de PR

- [ ] Ningun controller accede a Repository directamente
- [ ] Ningun service importa un controller
- [ ] No hay dependencias circulares nuevas
- [ ] Imports entre modulos respetan el diagrama de dependencias
- [ ] Shared/core no depende de ningun modulo especifico
