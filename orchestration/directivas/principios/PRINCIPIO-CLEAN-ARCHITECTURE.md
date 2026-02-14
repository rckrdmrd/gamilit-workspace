---
tipo: principio-arquitectonico
nivel: 3-completo
version: 1.0.0
fecha: 2026-02-02
autor: Robert C. Martin (Uncle Bob)
aplica_a:
  - backend-nestjs
  - frontend-react
  - todos-los-proyectos
alias:
  - "@CLEAN-ARCH"
  - "@CLEAN-ARCHITECTURE"
  - "@CAPAS-ARQUITECTURA"
---

# PRINCIPIO: CLEAN ARCHITECTURE

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Principio Arquitectonico - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los proyectos del workspace
**Origen:** Robert C. Martin (Uncle Bob), 2012

---

## DECLARACION DEL PRINCIPIO

```
+============================================================================+
|                                                                             |
|     "Las dependencias del codigo fuente solo deben apuntar hacia adentro,  |
|      hacia las politicas de nivel superior."                               |
|                                                                             |
|     "El software debe ser independiente de frameworks, bases de datos,     |
|      interfaces de usuario y cualquier agencia externa."                   |
|                                                                             |
|                                            - Robert C. Martin, 2012        |
|                                                                             |
+============================================================================+
```

---

## 1. DEFINICION DE CLEAN ARCHITECTURE

### Origen

Clean Architecture fue propuesta por Robert C. Martin ("Uncle Bob") en 2012, consolidando ideas de:

- **Hexagonal Architecture** (Alistair Cockburn, 2005)
- **Onion Architecture** (Jeffrey Palermo, 2008)
- **Screaming Architecture** (Robert C. Martin, 2011)

### Objetivo Principal

```
+--------------------------------------------------------------------------+
|  INDEPENDENCIA TOTAL del codigo de negocio respecto a:                   |
|                                                                          |
|  1. FRAMEWORKS    - El negocio no depende de NestJS, React, etc.        |
|  2. UI            - La logica no sabe si es web, mobile o CLI           |
|  3. BASE DE DATOS - PostgreSQL, MongoDB, memoria... intercambiables     |
|  4. AGENTES EXT.  - APIs, servicios externos son detalles               |
+--------------------------------------------------------------------------+
```

### Por Que Importa

```yaml
Sin_Clean_Architecture:
  - Cambiar BD requiere reescribir logica de negocio
  - Tests requieren levantar toda la infraestructura
  - El framework dicta la estructura del proyecto
  - Logica de negocio dispersa en controllers y UI

Con_Clean_Architecture:
  - Cambiar BD = cambiar solo el adaptador
  - Tests unitarios rapidos sin dependencias externas
  - La estructura grita el proposito del negocio
  - Logica de negocio centralizada y protegida
```

---

## 2. LAS 4 CAPAS

### Diagrama de Capas

```
                    +----------------------------------------------------+
                    |                                                     |
                    |              FRAMEWORKS & DRIVERS                   |
                    |     (DB, Web, UI, External Services, Devices)       |
                    |                                                     |
                    |    +------------------------------------------+     |
                    |    |                                          |     |
                    |    |         INTERFACE ADAPTERS               |     |
                    |    |   (Controllers, Gateways, Presenters)    |     |
                    |    |                                          |     |
                    |    |    +--------------------------------+    |     |
                    |    |    |                                |    |     |
                    |    |    |      APPLICATION BUSINESS      |    |     |
                    |    |    |         (Use Cases)            |    |     |
                    |    |    |                                |    |     |
                    |    |    |    +--------------------+      |    |     |
                    |    |    |    |                    |      |    |     |
                    |    |    |    |    ENTERPRISE      |      |    |     |
                    |    |    |    |  BUSINESS RULES    |      |    |     |
                    |    |    |    |   (Entities)       |      |    |     |
                    |    |    |    |                    |      |    |     |
                    |    |    |    +--------------------+      |    |     |
                    |    |    |                                |    |     |
                    |    |    +--------------------------------+    |     |
                    |    |                                          |     |
                    |    +------------------------------------------+     |
                    |                                                     |
                    +----------------------------------------------------+

                    <-------- Las dependencias apuntan hacia ADENTRO -------->
```

### Capa 1: Entities (Enterprise Business Rules)

```yaml
Definicion:
  - Logica de negocio CENTRAL y mas estable
  - Reglas que NO cambian con frecuencia
  - Independiente de CUALQUIER aplicacion especifica

Caracteristicas:
  - SIN dependencias de otras capas
  - Puede ser usado por MULTIPLES aplicaciones
  - Contiene reglas de negocio criticas

Ejemplos:
  - Entidad Usuario con reglas de validacion de email
  - Entidad Pedido con calculo de totales
  - Entidad Factura con reglas fiscales

NO_Contiene:
  - Decoradores de frameworks (@Entity, @Column)
  - Referencias a bases de datos
  - Logica de presentacion
```

### Capa 2: Use Cases (Application Business Rules)

```yaml
Definicion:
  - Logica especifica de la APLICACION
  - Orquesta el flujo de datos hacia/desde entities
  - Define COMO se usa el sistema

Caracteristicas:
  - Depende SOLO de Entities
  - Define interfaces para dependencias externas (ports)
  - Un caso de uso = una accion del usuario

Ejemplos:
  - CrearPedidoUseCase
  - CancelarReservaUseCase
  - GenerarReporteVentasUseCase

NO_Contiene:
  - Implementaciones de persistencia
  - Logica de HTTP/REST
  - Codigo de UI
```

### Capa 3: Interface Adapters

```yaml
Definicion:
  - Convierte datos entre USE CASES y FRAMEWORKS
  - Adaptadores que conectan el nucleo con el exterior
  - Implementa las interfaces definidas en Use Cases

Tipos:
  Controllers:
    - Reciben input externo (HTTP, CLI, eventos)
    - Convierten a formato de Use Case
    - Invocan el Use Case correspondiente

  Presenters:
    - Reciben output del Use Case
    - Formatean para la vista (JSON, HTML, etc.)

  Gateways:
    - Implementan interfaces de persistencia
    - Convierten entidades a modelos de BD
    - Convierten modelos de BD a entidades

Ejemplos:
  - UserController (HTTP -> UseCase)
  - UserPresenter (UseCase -> JSON)
  - PostgresUserRepository (UseCase.IUserRepo -> PostgreSQL)
```

### Capa 4: Frameworks & Drivers

```yaml
Definicion:
  - Capa MAS EXTERNA
  - Detalles tecnicos e infraestructura
  - FACILMENTE reemplazable

Componentes:
  - Base de datos (PostgreSQL, MongoDB)
  - Framework web (Express, NestJS core)
  - Framework UI (React, Vue)
  - Servicios externos (AWS, Stripe)
  - Dispositivos (sensores, impresoras)

Principio:
  - "Mantener frameworks a distancia"
  - Minimo codigo en esta capa
  - Solo configuracion y conexion
```

---

## 3. LA REGLA DE DEPENDENCIAS

### El Principio Fundamental

```
+============================================================================+
|                                                                             |
|  LAS DEPENDENCIAS DEL CODIGO FUENTE SOLO DEBEN APUNTAR HACIA ADENTRO      |
|                                                                             |
|  - Entities NO conocen Use Cases                                           |
|  - Use Cases NO conocen Controllers ni Repositories                        |
|  - Controllers SI conocen Use Cases                                        |
|  - Repositories SI conocen Entities                                        |
|                                                                             |
+============================================================================+
```

### Diagrama de Dependencias

```
CODIGO INTERNO                    |                    CODIGO EXTERNO
(Politicas de alto nivel)         |                    (Detalles de bajo nivel)
                                  |
                                  |
  +-------------+                 |
  |  Entities   |<----------------+---- No depende de nada
  +-------------+                 |
        ^                         |
        |                         |
  +-------------+                 |
  | Use Cases   |<----------------+---- Solo depende de Entities
  +-------------+                 |
        ^                         |
        |                         |
  +-------------+                 |
  | Adapters    |<----------------+---- Depende de Use Cases + Entities
  +-------------+                 |
        ^                         |
        |                         |
  +-------------+                 |
  | Frameworks  |<----------------+---- Depende de todo (pero nadie depende de el)
  +-------------+                 |
```

### Inversion de Dependencias (DIP)

```yaml
Problema:
  - Use Case necesita guardar en BD
  - Pero Use Case NO DEBE conocer PostgreSQL

Solucion_con_DIP:
  1. Use Case DEFINE interfaz: IUserRepository
  2. Adapter IMPLEMENTA: PostgresUserRepository implements IUserRepository
  3. Framework INYECTA: la implementacion en runtime

Codigo_Ejemplo:
  # En Use Case (capa interna)
  interface IUserRepository:
    save(user: User): Promise<void>
    findById(id: string): Promise<User>

  # En Adapter (capa externa)
  class PostgresUserRepository implements IUserRepository:
    save(user): # implementacion con PostgreSQL
    findById(id): # implementacion con PostgreSQL

  # El Use Case usa la INTERFAZ, no la implementacion
  class CreateUserUseCase:
    constructor(private userRepo: IUserRepository)
```

---

## 4. APLICACION EN NESTJS

### Mapeo de Capas a Estructura NestJS

```yaml
Clean_Architecture_Layer:   NestJS_Mapping:
  Entities                  -> domain/entities/
  Use Cases                 -> application/use-cases/
  Interface Adapters        -> infrastructure/controllers/
                            -> infrastructure/repositories/
                            -> infrastructure/presenters/
  Frameworks & Drivers      -> NestJS modules, TypeORM, etc.
```

### Estructura de Carpetas Recomendada

```
src/
|-- domain/                          # CAPA ENTITIES
|   |-- entities/
|   |   |-- user.entity.ts           # Entidad pura (sin decoradores ORM)
|   |   |-- order.entity.ts
|   |   +-- invoice.entity.ts
|   |-- value-objects/
|   |   |-- email.vo.ts              # Value Objects
|   |   +-- money.vo.ts
|   +-- repositories/
|       +-- user.repository.interface.ts  # Interfaces (ports)
|
|-- application/                     # CAPA USE CASES
|   |-- use-cases/
|   |   |-- user/
|   |   |   |-- create-user.use-case.ts
|   |   |   |-- update-user.use-case.ts
|   |   |   +-- delete-user.use-case.ts
|   |   +-- order/
|   |       +-- create-order.use-case.ts
|   |-- dtos/
|   |   |-- create-user.dto.ts       # DTOs de entrada
|   |   +-- user-response.dto.ts     # DTOs de salida
|   +-- services/
|       +-- user.service.ts          # Orquestacion de use cases
|
|-- infrastructure/                  # CAPA ADAPTERS + FRAMEWORKS
|   |-- controllers/
|   |   |-- user.controller.ts       # Adaptador HTTP
|   |   +-- order.controller.ts
|   |-- persistence/
|   |   |-- typeorm/
|   |   |   |-- entities/
|   |   |   |   +-- user.orm-entity.ts   # Entidad ORM (con decoradores)
|   |   |   |-- repositories/
|   |   |   |   +-- user.repository.ts   # Implementacion PostgreSQL
|   |   |   +-- mappers/
|   |   |       +-- user.mapper.ts       # Mapper ORM <-> Domain
|   |   +-- in-memory/
|   |       +-- user.repository.ts   # Implementacion en memoria (tests)
|   |-- external-services/
|   |   |-- stripe/
|   |   +-- email/
|   +-- config/
|       +-- database.config.ts
|
+-- main.ts                          # Bootstrap NestJS
```

### Flujo de una Request

```
1. HTTP Request llega
        |
        v
+------------------+
|   Controller     |  <-- Infrastructure: recibe HTTP, valida, extrae datos
+------------------+
        |
        | DTO de entrada
        v
+------------------+
|    Use Case      |  <-- Application: ejecuta logica de negocio
+------------------+
        |
        | Usa interfaces (ports)
        v
+------------------+
|    Repository    |  <-- Infrastructure: implementa persistencia
+------------------+
        |
        | Entidad de dominio
        v
+------------------+
|     Entity       |  <-- Domain: valida reglas de negocio
+------------------+
        |
        | Resultado
        v
+------------------+
|   Presenter      |  <-- Infrastructure: formatea respuesta
+------------------+
        |
        v
   HTTP Response
```

### Ejemplo de Codigo NestJS

```typescript
// domain/entities/user.entity.ts (SIN dependencias externas)
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private readonly createdAt: Date
  ) {
    this.validateEmail(email);
  }

  private validateEmail(email: string): void {
    if (!email.includes('@')) {
      throw new Error('Email invalido');
    }
  }

  public updateName(newName: string): User {
    return new User(this.id, this.email, newName, this.createdAt);
  }
}

// domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

// application/use-cases/create-user.use-case.ts
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Usuario ya existe');
    }

    const user = new User(
      generateId(),
      input.email,
      input.name,
      new Date()
    );

    await this.userRepository.save(user);
    return user;
  }
}

// infrastructure/persistence/typeorm/repositories/user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepo: Repository<UserOrmEntity>
  ) {}

  async save(user: User): Promise<void> {
    const ormEntity = UserMapper.toOrm(user);
    await this.ormRepo.save(ormEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepo.findOne({ where: { id } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }
}

// infrastructure/controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserPresenter.toResponse(user);
  }
}
```

---

## 5. APLICACION EN REACT

### Separacion de UI y Logica

```yaml
Principio:
  - Componentes React = SOLO presentacion
  - Logica de negocio = Custom Hooks y Services
  - Estado global = Contextos o stores (Zustand/Redux)

Capas_React:
  UI_Components:     # Solo renderizado, sin logica
  Custom_Hooks:      # Use Cases del frontend
  Services:          # Comunicacion con API
  Domain:            # Tipos y validaciones
```

### Estructura de Carpetas React

```
src/
|-- domain/                          # CAPA DOMAIN
|   |-- entities/
|   |   |-- user.ts                  # Interfaces/Types
|   |   +-- order.ts
|   +-- validators/
|       +-- user.validator.ts        # Validaciones de negocio
|
|-- application/                     # CAPA USE CASES
|   |-- hooks/
|   |   |-- useCreateUser.ts         # Custom hook = Use Case
|   |   |-- useUserList.ts
|   |   +-- useAuth.ts
|   +-- services/
|       |-- api.service.ts           # Cliente HTTP base
|       |-- user.service.ts          # Llamadas a API de usuarios
|       +-- auth.service.ts
|
|-- presentation/                    # CAPA UI
|   |-- components/
|   |   |-- common/
|   |   |   |-- Button.tsx
|   |   |   +-- Input.tsx
|   |   +-- user/
|   |       |-- UserCard.tsx
|   |       +-- UserForm.tsx
|   |-- pages/
|   |   |-- HomePage.tsx
|   |   +-- UserPage.tsx
|   +-- layouts/
|       +-- MainLayout.tsx
|
+-- infrastructure/                  # CAPA FRAMEWORKS
    |-- config/
    |   +-- api.config.ts
    +-- providers/
        +-- AuthProvider.tsx
```

### Custom Hooks como Use Cases

```typescript
// application/hooks/useCreateUser.ts
export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createUser = async (input: CreateUserInput): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validacion de dominio
      UserValidator.validate(input);

      // Llamada al servicio
      const user = await userService.create(input);

      // Invalidar cache
      queryClient.invalidateQueries(['users']);

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading, error };
}

// Uso en componente (Presentation Layer)
function CreateUserPage() {
  const { createUser, isLoading, error } = useCreateUser();

  const handleSubmit = async (data: FormData) => {
    await createUser(data);
    navigate('/users');
  };

  return (
    <UserForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### Services para API Calls

```typescript
// application/services/user.service.ts
class UserService {
  private readonly api: ApiService;

  constructor() {
    this.api = new ApiService('/api/users');
  }

  async create(input: CreateUserInput): Promise<User> {
    const response = await this.api.post<UserResponse>('/', input);
    return this.mapToDomain(response);
  }

  async findById(id: string): Promise<User> {
    const response = await this.api.get<UserResponse>(`/${id}`);
    return this.mapToDomain(response);
  }

  async findAll(): Promise<User[]> {
    const response = await this.api.get<UserResponse[]>('/');
    return response.map(this.mapToDomain);
  }

  private mapToDomain(response: UserResponse): User {
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      createdAt: new Date(response.created_at)
    };
  }
}

export const userService = new UserService();
```

---

## 6. BENEFICIOS

### Testabilidad

```yaml
Sin_Clean_Architecture:
  - Tests requieren BD real o mocks complejos
  - Tests lentos por dependencias de infraestructura
  - Dificil aislar logica de negocio

Con_Clean_Architecture:
  - Use Cases testeables con mocks simples
  - Tests rapidos (milisegundos)
  - Logica de negocio 100% cubierta

Ejemplo:
  # Test de Use Case (sin BD, sin HTTP)
  const mockRepo = { save: jest.fn(), findById: jest.fn() };
  const useCase = new CreateUserUseCase(mockRepo);

  const result = await useCase.execute({ email: 'test@test.com' });

  expect(mockRepo.save).toHaveBeenCalled();
```

### Mantenibilidad

```yaml
Sin_Clean_Architecture:
  - Cambios pequenos afectan multiples archivos
  - Dificil encontrar donde vive la logica
  - Codigo espagueti con dependencias cruzadas

Con_Clean_Architecture:
  - Cambios localizados en su capa
  - Estructura predecible y consistente
  - Facil onboarding de nuevos desarrolladores

Metricas:
  - Tiempo_para_encontrar_bug: -60%
  - Tiempo_para_agregar_feature: -40%
  - Tiempo_de_onboarding: -50%
```

### Flexibilidad para Cambiar Frameworks

```yaml
Escenarios_Reales:
  Cambiar_BD:
    De: PostgreSQL
    A: MongoDB
    Afecta: Solo infrastructure/persistence/
    No_afecta: domain/, application/

  Cambiar_Framework_Web:
    De: NestJS
    A: Fastify
    Afecta: Solo infrastructure/controllers/
    No_afecta: domain/, application/

  Cambiar_ORM:
    De: TypeORM
    A: Prisma
    Afecta: Solo infrastructure/persistence/
    No_afecta: domain/, application/
```

---

## 7. CHECKLIST DE VALIDACION

### Antes de Crear Codigo

```markdown
[ ] Identifique en cual capa pertenece el codigo
[ ] Las dependencias apuntan hacia adentro (no al reves)
[ ] Entities NO importan nada de otras capas
[ ] Use Cases definen interfaces, no implementaciones
```

### Durante el Desarrollo

```markdown
[ ] Controllers NO contienen logica de negocio
[ ] Repositories implementan interfaces definidas en domain/application
[ ] Entidades de dominio NO tienen decoradores de frameworks
[ ] Use Cases reciben dependencias por inyeccion
```

### Durante Code Review

```markdown
[ ] No hay imports de infrastructure en domain/application
[ ] Los tests de Use Cases no requieren BD ni HTTP
[ ] Cambiar un adapter no requiere cambiar Use Cases
[ ] La estructura de carpetas refleja las capas
```

### Validacion Automatizada

```bash
# Verificar que domain/ no importa de infrastructure/
grep -r "from.*infrastructure" src/domain/
# Debe retornar vacio

# Verificar que application/ no importa de infrastructure/
grep -r "from.*infrastructure" src/application/
# Debe retornar vacio

# Verificar que entities no tienen decoradores ORM
grep -r "@Entity\|@Column\|@PrimaryGeneratedColumn" src/domain/entities/
# Debe retornar vacio (usar entidades ORM separadas)
```

---

## ANTI-PATRONES A EVITAR

```yaml
Anti_Patron_1_Anemic_Domain:
  Descripcion: Entidades sin logica, solo datos
  Problema: La logica se dispersa en servicios
  Solucion: Mover logica de negocio a las entidades

Anti_Patron_2_Fat_Controllers:
  Descripcion: Controllers con logica de negocio
  Problema: Imposible reutilizar logica
  Solucion: Extraer a Use Cases

Anti_Patron_3_Leaky_Abstractions:
  Descripcion: Detalles de BD en Use Cases
  Problema: Use Cases acoplados a infraestructura
  Solucion: Usar interfaces y mappers

Anti_Patron_4_Framework_Lock_In:
  Descripcion: Decoradores de framework en entidades
  Problema: Imposible cambiar framework
  Solucion: Separar entidades de dominio y ORM
```

---

## REFERENCIAS

```yaml
Libros:
  - "Clean Architecture" - Robert C. Martin (2017)
  - "Domain-Driven Design" - Eric Evans (2003)
  - "Implementing Domain-Driven Design" - Vaughn Vernon (2013)

Articulos:
  - "The Clean Architecture" - blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - "Hexagonal Architecture" - alistair.cockburn.us/hexagonal-architecture/

SIMCO_Relacionados:
  - "@CAPVED" - Ciclo de vida de tareas
  - "@ESTANDARES" - Estandares de codigo
  - "@BACKEND" - Directiva SIMCO-BACKEND.md
  - "@FRONTEND" - Directiva SIMCO-FRONTEND.md
```

---

## ALIAS

```yaml
@CLEAN-ARCH:        orchestration/directivas/principios/PRINCIPIO-CLEAN-ARCHITECTURE.md
@CLEAN-ARCHITECTURE: orchestration/directivas/principios/PRINCIPIO-CLEAN-ARCHITECTURE.md
@CAPAS-ARQUITECTURA: orchestration/directivas/principios/PRINCIPIO-CLEAN-ARCHITECTURE.md
```

---

**Este principio es RECOMENDADO para todos los proyectos del workspace.**

---

## Ver tambien

- [ESTANDAR-BACKEND-PROFESIONAL](../../../docs/40-standards/ESTANDAR-BACKEND-PROFESIONAL.md) - Estandar backend profesional (incluye Clean Architecture en NestJS)

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Arquitectonico
