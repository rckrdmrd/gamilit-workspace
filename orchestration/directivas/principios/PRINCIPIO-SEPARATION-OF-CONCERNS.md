---
tipo: principio-arquitectonico
nivel: 3-completo
version: 1.0.0
fecha: 2026-02-02
aplica_a:
  - backend-nestjs
  - frontend-react
  - todos-los-proyectos
alias:
  - "@SOC"
  - "@SEPARATION-OF-CONCERNS"
  - "@SEPARACION-RESPONSABILIDADES"
---

# PRINCIPIO: SEPARATION OF CONCERNS (SoC)

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Principio Arquitectonico - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los proyectos del workspace
**Origen:** Edsger W. Dijkstra, 1974

---

## DECLARACION DEL PRINCIPIO

```
+============================================================================+
|                                                                             |
|     "La separacion de preocupaciones (SoC) es un principio de diseno      |
|      para separar un programa en secciones distintas, donde cada          |
|      seccion aborda una preocupacion separada."                           |
|                                                                             |
|     "Una preocupacion es un conjunto de informacion que afecta            |
|      al codigo de un programa."                                            |
|                                                                             |
|                                            - Edsger W. Dijkstra, 1974      |
|                                                                             |
+============================================================================+
```

---

## 1. DEFINICION

### Que es SoC

> **"Cada modulo o capa tiene UNA SOLA responsabilidad claramente definida."**

La Separacion de Preocupaciones divide un sistema en partes distintas, minimizando la superposicion de funcionalidad. Cada parte aborda una "preocupacion" - un conjunto cohesivo de funcionalidad.

### Preocupaciones Tipicas

```yaml
Preocupaciones_Backend:
  - Validacion de entrada (DTOs)
  - Logica de negocio (Services)
  - Acceso a datos (Repositories)
  - Autorizacion (Guards)
  - Transformacion de respuesta (Presenters)
  - Logging (Interceptors)
  - Manejo de errores (Filters)

Preocupaciones_Frontend:
  - Renderizado UI (Components)
  - Estado local (useState/useReducer)
  - Estado global (Context/Store)
  - Logica de negocio (Hooks)
  - Comunicacion con API (Services)
  - Enrutamiento (Router)
  - Estilizado (CSS/Styled)
```

---

## 2. APLICACION EN CAPAS BACKEND

### Arquitectura por Capas NestJS

```
                    +------------------------+
                    |      PRESENTATION      |
                    |    (Controllers)       |
                    |  - Recibe HTTP         |
                    |  - Valida entrada      |
                    |  - Devuelve respuesta  |
                    +------------------------+
                              |
                              v
                    +------------------------+
                    |       APPLICATION      |
                    |      (Services)        |
                    |  - Orquesta logica     |
                    |  - Coordina repos      |
                    |  - Aplica reglas       |
                    +------------------------+
                              |
                              v
                    +------------------------+
                    |         DOMAIN         |
                    |     (Entities)         |
                    |  - Reglas de negocio   |
                    |  - Validaciones        |
                    |  - Value Objects       |
                    +------------------------+
                              |
                              v
                    +------------------------+
                    |     INFRASTRUCTURE     |
                    |    (Repositories)      |
                    |  - Acceso a BD         |
                    |  - APIs externas       |
                    |  - Cache               |
                    +------------------------+
```

### Responsabilidades por Capa

#### Controller - Capa de Presentacion

```typescript
// CORRECTO: Controller solo maneja HTTP
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,  // Validacion via class-validator
  ): Promise<UserResponseDto> {
    // Solo orquesta: recibe -> delega -> responde
    const user = await this.userService.create(createUserDto);
    return UserPresenter.toResponse(user);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,  // Validacion de parametro
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return UserPresenter.toResponse(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, updateUserDto);
    return UserPresenter.toResponse(user);
  }
}

// INCORRECTO: Controller con logica de negocio
@Controller('users')
export class BadUserController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,  // Acceso directo a BD!
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // MAL: Logica de negocio en controller
    if (dto.email.endsWith('@blocked.com')) {
      throw new BadRequestException('Email domain blocked');
    }

    // MAL: Acceso directo a BD
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email exists');
    }

    // MAL: Transformaciones en controller
    const user = this.repo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      createdAt: new Date(),
    });

    return this.repo.save(user);
  }
}
```

#### Service - Capa de Aplicacion

```typescript
// CORRECTO: Service orquesta logica de negocio
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // Validacion de reglas de negocio
    await this.validateBusinessRules(dto);

    // Crear entidad de dominio
    const user = User.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });

    // Persistir
    const savedUser = await this.userRepository.save(user);

    // Efectos secundarios (via eventos)
    this.eventEmitter.emit('user.created', new UserCreatedEvent(savedUser));

    return savedUser;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Aplicar cambios via metodos del dominio
    if (dto.name) {
      user.updateName(dto.name);
    }
    if (dto.email) {
      await this.validateEmailChange(user, dto.email);
      user.updateEmail(dto.email);
    }

    return this.userRepository.save(user);
  }

  private async validateBusinessRules(dto: CreateUserDto): Promise<void> {
    // Regla: email unico
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    // Regla: dominio permitido
    if (this.isBlockedDomain(dto.email)) {
      throw new BadRequestException('Email domain not allowed');
    }
  }

  private isBlockedDomain(email: string): boolean {
    const blockedDomains = ['spam.com', 'temp-mail.com'];
    const domain = email.split('@')[1];
    return blockedDomains.includes(domain);
  }

  private async validateEmailChange(user: User, newEmail: string): Promise<void> {
    if (user.email === newEmail) return;

    const exists = await this.userRepository.existsByEmail(newEmail);
    if (exists) {
      throw new ConflictException('Email already in use');
    }
  }
}

// INCORRECTO: Service que hace demasiado
@Injectable()
export class BadUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly mailer: MailerService,
  ) {}

  async create(dto: any) {  // MAL: sin tipos
    // MAL: Validacion de HTTP en service
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Missing fields');
    }

    // MAL: Acceso directo a ORM
    const user = this.repo.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
    });

    const saved = await this.repo.save(user);

    // MAL: Efecto secundario sincrono bloqueante
    await this.mailer.sendMail({
      to: saved.email,
      subject: 'Welcome',
      html: '<h1>Welcome!</h1>',  // MAL: HTML en service
    });

    return saved;
  }
}
```

#### Repository - Capa de Infraestructura

```typescript
// CORRECTO: Repository solo acceso a datos
@Injectable()
export class PostgresUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['profile'],
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email } });
    return count > 0;
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);
    const saved = await this.repo.save(entity);
    return UserMapper.toDomain(saved);
  }

  async findAll(options: FindUsersOptions): Promise<PaginatedResult<User>> {
    const query = this.repo.createQueryBuilder('user');

    if (options.filter?.isActive !== undefined) {
      query.andWhere('user.is_active = :isActive', {
        isActive: options.filter.isActive,
      });
    }

    if (options.search) {
      query.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    const [entities, total] = await query
      .skip(options.offset)
      .take(options.limit)
      .getManyAndCount();

    return {
      data: entities.map(UserMapper.toDomain),
      total,
      limit: options.limit,
      offset: options.offset,
    };
  }
}

// INCORRECTO: Repository con logica de negocio
@Injectable()
export class BadUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async createUser(dto: CreateUserDto) {
    // MAL: Validacion de negocio en repository
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email exists');  // Logica de negocio!
    }

    // MAL: Transformacion/hashing en repository
    const entity = this.repo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      role: dto.isAdmin ? 'admin' : 'user',  // Logica de negocio!
    });

    return this.repo.save(entity);
  }
}
```

---

## 3. APLICACION EN FRONTEND

### Arquitectura por Responsabilidad React

```
+------------------------------------------------------------------+
|                         PRESENTATION                               |
|  +------------------------------------------------------------+  |
|  |  Pages          - Composicion de componentes               |  |
|  |  Components     - UI pura, solo renderizado                |  |
|  |  Layouts        - Estructura de pagina                     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                           LOGIC                                   |
|  +------------------------------------------------------------+  |
|  |  Custom Hooks   - Logica reutilizable                      |  |
|  |  Context        - Estado compartido                        |  |
|  |  Reducers       - Manejo de estado complejo                |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                           DATA                                    |
|  +------------------------------------------------------------+  |
|  |  Services       - Llamadas a API                           |  |
|  |  Repositories   - Abstraccion de datos                     |  |
|  |  Adapters       - Transformacion de datos                  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Separacion UI / Logic / Data

#### Componentes de Presentacion (UI)

```tsx
// CORRECTO: Componente puro - solo renderizado
interface UserCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function UserCard({ user, onEdit, onDelete, isDeleting }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} className="user-card__avatar" />
      <div className="user-card__info">
        <h3 className="user-card__name">{user.name}</h3>
        <p className="user-card__email">{user.email}</p>
        <span className={`user-card__status user-card__status--${user.status}`}>
          {user.status}
        </span>
      </div>
      <div className="user-card__actions">
        <Button variant="secondary" onClick={onEdit}>
          Editar
        </Button>
        <Button
          variant="danger"
          onClick={onDelete}
          disabled={isDeleting}
          loading={isDeleting}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

// INCORRECTO: Componente con logica mezclada
function BadUserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // MAL: Fetch de datos en componente de presentacion
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  // MAL: Logica de negocio en componente
  const handleDelete = async () => {
    if (!confirm('Estas seguro?')) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      // MAL: Navegacion en componente de tarjeta
      window.location.href = '/users';
    } catch (error) {
      alert('Error al eliminar');
    }
    setIsDeleting(false);
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={handleDelete}>Eliminar</button>
    </div>
  );
}
```

#### Custom Hooks (Logic)

```tsx
// CORRECTO: Hook que encapsula logica
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await userService.getById(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, isLoading, error };
}

function useDeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      await userService.delete(userId);
      queryClient.invalidateQueries(['users']);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteUser, isDeleting, error };
}

function useUserList(filters: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await userService.getAll({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
    setUsers(result.data);
    setPagination(prev => ({ ...prev, total: result.total }));
    setIsLoading(false);
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const refresh = () => {
    fetchUsers();
  };

  return { users, pagination, isLoading, goToPage, refresh };
}
```

#### Services (Data)

```tsx
// CORRECTO: Service que maneja comunicacion con API
class UserService {
  private readonly baseUrl = '/api/users';

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`${this.baseUrl}/${id}`);
    return this.mapToUser(response.data);
  }

  async getAll(params: GetUsersParams): Promise<PaginatedResult<User>> {
    const response = await apiClient.get<PaginatedResponse<UserResponse>>(
      this.baseUrl,
      { params }
    );

    return {
      data: response.data.data.map(this.mapToUser),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  }

  async create(data: CreateUserInput): Promise<User> {
    const response = await apiClient.post<UserResponse>(
      this.baseUrl,
      this.mapToRequest(data)
    );
    return this.mapToUser(response.data);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const response = await apiClient.patch<UserResponse>(
      `${this.baseUrl}/${id}`,
      this.mapToRequest(data)
    );
    return this.mapToUser(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Mappers privados
  private mapToUser(response: UserResponse): User {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      avatar: response.avatar_url,
      status: response.is_active ? 'active' : 'inactive',
      createdAt: new Date(response.created_at),
    };
  }

  private mapToRequest(data: CreateUserInput | UpdateUserInput): Record<string, any> {
    return {
      name: data.name,
      email: data.email,
      avatar_url: data.avatar,
    };
  }
}

export const userService = new UserService();
```

#### Composicion en Page

```tsx
// CORRECTO: Page que compone todo
function UserListPage() {
  const [filters, setFilters] = useState<UserFilters>({});
  const { users, pagination, isLoading, goToPage, refresh } = useUserList(filters);
  const { deleteUser, isDeleting } = useDeleteUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleEdit = (userId: string) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDelete = async (userId: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Eliminar usuario',
      message: 'Esta accion no se puede deshacer. Continuar?',
    });

    if (!confirmed) return;

    const success = await deleteUser(userId);
    if (success) {
      showNotification({ type: 'success', message: 'Usuario eliminado' });
    } else {
      showNotification({ type: 'error', message: 'Error al eliminar' });
    }
  };

  return (
    <PageLayout title="Usuarios">
      <UserFiltersPanel
        filters={filters}
        onChange={setFilters}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <UserList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeletingId={isDeleting ? deletingId : undefined}
          />

          <Pagination
            current={pagination.page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={goToPage}
          />
        </>
      )}
    </PageLayout>
  );
}
```

---

## 4. BENEFICIOS

### Testabilidad

```yaml
Sin_SoC:
  - Tests requieren mockear todo el sistema
  - Tests lentos por dependencias cruzadas
  - Dificil aislar bugs

Con_SoC:
  - Cada capa testeable independientemente
  - Mocks simples por capa
  - Bugs facilmente localizables

Ejemplos:
  Service_Test:
    - Mock del repository
    - Test de logica de negocio aislada
    - Sin BD, sin HTTP

  Component_Test:
    - Props controlados
    - Sin hooks reales
    - Solo verifica renderizado
```

### Mantenibilidad

```yaml
Sin_SoC:
  - Cambios en BD afectan toda la app
  - Dificil encontrar donde vive la logica
  - Efectos secundarios inesperados

Con_SoC:
  - Cambios localizados en su capa
  - Estructura predecible
  - Impacto de cambios controlado

Metricas_Esperadas:
  - Tiempo_para_encontrar_bug: -50%
  - Tiempo_para_agregar_feature: -40%
  - Codigo_afectado_por_cambio: -60%
```

### Reutilizacion

```yaml
Sin_SoC:
  - Logica duplicada en multiples lugares
  - Imposible reusar componentes
  - Copy/paste como patron

Con_SoC:
  - Hooks reutilizables entre paginas
  - Services compartidos
  - Componentes composables
```

---

## 5. CHECKLIST DE VALIDACION

### Antes de Crear Codigo

```markdown
[ ] Identificada la capa donde pertenece el codigo
[ ] Definidas las responsabilidades del modulo
[ ] Sin dependencias hacia capas superiores
[ ] Interfaz clara con otras capas
```

### Durante Code Review

```markdown
Backend:
[ ] Controllers NO tienen logica de negocio
[ ] Services NO acceden directamente a BD
[ ] Repositories NO validan reglas de negocio
[ ] DTOs validados en capa de presentacion

Frontend:
[ ] Componentes de UI son puros (sin fetch, sin logica compleja)
[ ] Hooks encapsulan logica reutilizable
[ ] Services manejan comunicacion con API
[ ] Pages solo componen y coordinan
```

### Senales de Violacion

| Senal | Problema | Solucion |
|-------|----------|----------|
| Controller > 100 lineas | Logica en controller | Mover a service |
| Componente con useEffect fetch | Mezcla UI + Data | Extraer a hook |
| Service con decoradores HTTP | Mezcla capas | Separar controller |
| Repository con if/throw negocio | Logica en infra | Mover a service |
| Hook con JSX | Mezcla logic + UI | Separar componente |

---

## ANTI-PATRONES

```yaml
Anti_Patron_1_God_Component:
  Descripcion: Componente que hace todo (fetch, logica, UI)
  Problema: Imposible testear, mantener o reutilizar
  Solucion: Dividir en hooks + componentes puros

Anti_Patron_2_Smart_Repository:
  Descripcion: Repository con reglas de negocio
  Problema: Logica dispersa, dificil de testear
  Solucion: Mover logica a Service

Anti_Patron_3_Anemic_Service:
  Descripcion: Service que solo pasa datos al repository
  Problema: Sin valor agregado, capas innecesarias
  Solucion: Agregar validacion y orquestacion, o eliminar capa

Anti_Patron_4_Leaky_Abstraction:
  Descripcion: Detalles de implementacion expuestos entre capas
  Problema: Acoplamiento fuerte
  Solucion: Usar interfaces y mappers
```

---

## REFERENCIAS

```yaml
Articulos:
  - "Separation of Concerns" - Dijkstra (1974)
  - "Clean Architecture" - Robert C. Martin

SIMCO_Relacionados:
  - "@CLEAN-ARCH" - Clean Architecture
  - "@SOLID" - Principios SOLID
  - "@SRP" - Single Responsibility Principle
```

---

## ALIAS

```yaml
@SOC:                        orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md
@SEPARATION-OF-CONCERNS:     orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md
@SEPARACION-RESPONSABILIDADES: orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md
```

---

**Este principio es OBLIGATORIO para todos los proyectos del workspace.**

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Principio Arquitectonico
