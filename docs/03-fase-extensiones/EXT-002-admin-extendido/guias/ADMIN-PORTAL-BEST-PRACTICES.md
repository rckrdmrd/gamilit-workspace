# Admin Portal - Directivas, Patrones y Buenas Practicas

**Version:** 1.0.0
**Fecha creacion:** 2025-11-29
**Estado:** VIGENTE
**Aplica a:** apps/backend/src/modules/admin/ y apps/frontend/src/apps/admin/

---

## Indice

1. [Directivas Obligatorias](#1-directivas-obligatorias)
2. [Patrones de Diseno](#2-patrones-de-diseno)
3. [Buenas Practicas](#3-buenas-practicas)
4. [Checklist de Implementacion](#4-checklist-de-implementacion)
5. [Referencias](#5-referencias)
6. [Inventario Backend](#6-inventario-backend)
7. [Inventario Frontend](#7-inventario-frontend)
8. [Troubleshooting](#8-troubleshooting)
9. [FAQ](#9-faq)
10. [Inconsistencias Conocidas](#10-inconsistencias-conocidas)

---

## 1. Directivas Obligatorias

### 1.1 Seguridad y Autenticacion

**DIRECTIVA-ADMIN-001: Guards Obligatorios**

Todo endpoint del portal admin DEBE usar ambos guards:

```typescript
@Controller('admin/*')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController { }
```

| Guard | Proposito |
|-------|-----------|
| `JwtAuthGuard` | Valida token JWT, extrae user |
| `AdminGuard` | Verifica `user.role === 'admin'` o `'super_admin'` |

**DIRECTIVA-ADMIN-002: Roles Permitidos**

| Rol | Acceso Admin Portal |
|-----|---------------------|
| `super_admin` | Acceso completo |
| `admin` | Acceso completo |
| `teacher` | Sin acceso (403 Forbidden) |
| `student` | Sin acceso (403 Forbidden) |

**DIRECTIVA-ADMIN-003: Audit Trail**

Toda accion critica DEBE registrarse:
- Cambios en `system_settings` → campo `updated_by`
- Operaciones bulk → tabla `bulk_operations`
- Aprobaciones/rechazos → tabla `content_approvals`
- Acciones de usuario → log de actividad

### 1.2 Convenciones de Rutas

**DIRECTIVA-ADMIN-004: Prefijo de Rutas**

Todas las rutas del admin portal DEBEN comenzar con `/admin/`:

```
CORRECTO:
  /admin/dashboard
  /admin/users
  /admin/organizations
  /admin/content
  /admin/monitoring
  /admin/reports
  /admin/settings
  /admin/gamification
  /admin/alerts

INCORRECTO:
  /api/admin/...   (no duplicar prefijos)
  /management/...  (usar admin)
  /system/...      (usar admin)
```

**DIRECTIVA-ADMIN-005: Estructura de Endpoints REST**

| Accion | Metodo | Patron |
|--------|--------|--------|
| Listar | GET | `/admin/{resource}` |
| Obtener uno | GET | `/admin/{resource}/:id` |
| Crear | POST | `/admin/{resource}` |
| Actualizar | PUT/PATCH | `/admin/{resource}/:id` |
| Eliminar | DELETE | `/admin/{resource}/:id` |
| Accion especial | POST | `/admin/{resource}/:id/{action}` |
| Bulk operation | POST | `/admin/{resource}/bulk/{action}` |

### 1.3 Separacion de Portales

**DIRECTIVA-ADMIN-006: Portales Independientes**

El proyecto tiene 3 portales separados:

| Portal | Ruta | Proposito | Rol Requerido |
|--------|------|-----------|---------------|
| **Admin** | `/admin/*` | Gestion global, multi-tenant, sistema | super_admin, admin |
| **Teacher** | `/teacher/*` | Gestion de aulas, estudiantes | teacher |
| **Student** | `/student/*` | Aprendizaje, ejercicios | student |

**NO mezclar funcionalidades entre portales.** Si una funcion aplica a multiples roles, crear endpoints separados en cada portal.

---

## 2. Patrones de Diseno

### 2.1 Backend (NestJS)

**PATRON-ADMIN-001: Arquitectura en Capas**

```
┌──────────────────────────────────────────────────────────┐
│  Controller Layer (HTTP handling, DTOs validation)       │
│  - Recibe requests HTTP                                  │
│  - Valida DTOs con class-validator                       │
│  - Retorna respuestas tipadas                            │
└──────────────────────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Service Layer (Business logic)                          │
│  - Logica de negocio                                     │
│  - Orquesta repositorios                                 │
│  - Maneja transacciones                                  │
└──────────────────────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Repository Layer (Data access via TypeORM)              │
│  - Queries a base de datos                               │
│  - CRUD basico                                           │
│  - Queries complejas                                     │
└──────────────────────────────────────────────────────────┘
```

**PATRON-ADMIN-002: Controller Standard**

```typescript
@Controller('admin/ejemplo')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiTags('Admin - Ejemplo')
@ApiBearerAuth()
export class AdminEjemploController {
  constructor(private readonly ejemploService: AdminEjemploService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ejemplos' })
  @ApiPaginatedResponse(EjemploDto)
  async findAll(
    @Query() query: ListEjemploDto,
  ): Promise<PaginatedResponse<EjemploDto>> {
    return this.ejemploService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ejemplo por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EjemploDto> {
    return this.ejemploService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear ejemplo' })
  async create(@Body() dto: CreateEjemploDto): Promise<EjemploDto> {
    return this.ejemploService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ejemplo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEjemploDto,
  ): Promise<EjemploDto> {
    return this.ejemploService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ejemplo' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ejemploService.remove(id);
  }
}
```

**PATRON-ADMIN-003: Service Standard**

```typescript
@Injectable()
export class AdminEjemploService {
  constructor(
    @InjectRepository(EjemploEntity)
    private readonly ejemploRepository: Repository<EjemploEntity>,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(AdminEjemploService.name);
  }

  async findAll(query: ListEjemploDto): Promise<PaginatedResponse<EjemploDto>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ejemploRepository.createQueryBuilder('e');

    if (search) {
      queryBuilder.where('e.name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(this.toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<EjemploDto> {
    const entity = await this.ejemploRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Ejemplo ${id} not found`);
    }
    return this.toDto(entity);
  }

  private toDto(entity: EjemploEntity): EjemploDto {
    return {
      id: entity.id,
      name: entity.name,
      // ... mapeo
    };
  }
}
```

**PATRON-ADMIN-004: DTO con Validacion**

```typescript
// Request DTO
export class CreateEjemploDto {
  @ApiProperty({ description: 'Nombre del ejemplo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripcion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

// Response DTO
export class EjemploDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: string;
}

// Paginacion DTO
export class ListEjemploDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
```

### 2.2 Frontend (React)

**PATRON-ADMIN-005: Estructura de Pagina Admin**

```typescript
// apps/admin/pages/AdminEjemploPage.tsx

export const AdminEjemploPage: React.FC = () => {
  // 1. Hooks de datos
  const { data, isLoading, error, refetch } = useEjemplos();
  const { mutate: deleteEjemplo } = useDeleteEjemplo();

  // 2. Estado local
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Handlers
  const handleDelete = useCallback((id: string) => {
    if (confirm('Esta seguro?')) {
      deleteEjemplo(id, { onSuccess: refetch });
    }
  }, [deleteEjemplo, refetch]);

  // 4. Early returns
  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  // 5. Render
  return (
    <AdminLayout>
      <PageHeader
        title="Gestion de Ejemplos"
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            Nuevo Ejemplo
          </Button>
        }
      />

      <EjemploTable
        data={data}
        onSelect={setSelectedId}
        onDelete={handleDelete}
      />

      <CreateEjemploModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </AdminLayout>
  );
};
```

**PATRON-ADMIN-006: Hook de Datos Admin**

```typescript
// apps/admin/hooks/useEjemplos.ts

export function useEjemplos(filters?: EjemploFilters) {
  return useQuery({
    queryKey: ['admin', 'ejemplos', filters],
    queryFn: () => adminAPI.ejemplos.list(filters),
    staleTime: 30000, // 30 segundos
  });
}

export function useEjemplo(id: string) {
  return useQuery({
    queryKey: ['admin', 'ejemplos', id],
    queryFn: () => adminAPI.ejemplos.getById(id),
    enabled: !!id,
  });
}

export function useCreateEjemplo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.ejemplos.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ejemplos'] });
    },
  });
}

export function useDeleteEjemplo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.ejemplos.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ejemplos'] });
    },
  });
}
```

**PATRON-ADMIN-007: Componente de Tabla Admin**

```typescript
// apps/admin/components/EjemploTable.tsx

interface EjemploTableProps {
  data: EjemploDto[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EjemploTable: React.FC<EjemploTableProps> = ({
  data,
  onSelect,
  onDelete,
}) => {
  const columns = useMemo<ColumnDef<EjemploDto>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha Creacion',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <ActionMenu
          onView={() => onSelect(row.original.id)}
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    },
  ], [onSelect, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
    />
  );
};
```

### 2.3 Comunicacion API

**PATRON-ADMIN-008: API Client Estructurado**

```typescript
// apps/admin/services/adminAPI.ts

export const adminAPI = {
  dashboard: {
    getStats: () => api.get<DashboardStatsDto>('/admin/dashboard/stats'),
    getRecentActivity: (params?: { limit?: number }) =>
      api.get<RecentActivityDto>('/admin/dashboard/recent-activity', { params }),
    getTopUsers: (params?: { limit?: number }) =>
      api.get<TopUsersDto>('/admin/dashboard/top-users', { params }),
  },

  users: {
    list: (params?: ListUsersParams) =>
      api.get<PaginatedResponse<UserDto>>('/admin/users', { params }),
    getById: (id: string) => api.get<UserDto>(`/admin/users/${id}`),
    update: (id: string, data: UpdateUserDto) =>
      api.patch<UserDto>(`/admin/users/${id}`, data),
    suspend: (id: string, data: SuspendUserDto) =>
      api.post<UserDto>(`/admin/users/${id}/suspend`, data),
    bulkSuspend: (data: BulkSuspendDto) =>
      api.post('/admin/users/bulk/suspend', data),
  },

  // ... otros modulos
};
```

---

## 3. Buenas Practicas

### 3.1 Performance

**BP-ADMIN-001: Queries Paralelas en Dashboard**

```typescript
// CORRECTO - Paralelo
const [stats, activity, topUsers] = await Promise.all([
  this.getDashboardStats(),
  this.getRecentActivity(),
  this.getTopUsers(),
]);

// INCORRECTO - Secuencial (3x mas lento)
const stats = await this.getDashboardStats();
const activity = await this.getRecentActivity();
const topUsers = await this.getTopUsers();
```

**BP-ADMIN-002: Auto-refresh en Dashboard**

```typescript
// Polling cada 60 segundos para datos en tiempo real
useEffect(() => {
  fetchDashboardData();
  const interval = setInterval(fetchDashboardData, 60000);
  return () => clearInterval(interval);
}, [fetchDashboardData]);
```

**BP-ADMIN-003: Paginacion Obligatoria**

Todas las listas DEBEN implementar paginacion:
- Default: 10 items por pagina
- Maximo: 100 items por pagina
- Usar `skip/take` en TypeORM

### 3.2 Manejo de Errores

**BP-ADMIN-004: Graceful Degradation**

```typescript
// Mostrar ultimo estado conocido si un endpoint falla
const fetchData = async () => {
  try {
    const result = await api.get('/admin/stats');
    setStats(result);
    setLastUpdated(new Date());
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    // NO limpiar stats - mantener ultimo valor conocido
    setError('No se pudo actualizar. Mostrando datos anteriores.');
  }
};
```

**BP-ADMIN-005: Feedback de Usuario**

```typescript
// Siempre informar al usuario el resultado de acciones
const handleDelete = async () => {
  try {
    await deleteUser(id);
    toast.success('Usuario eliminado correctamente');
    refetch();
  } catch (error) {
    toast.error('Error al eliminar usuario');
    console.error(error);
  }
};
```

### 3.3 Estado y Carga

**BP-ADMIN-006: Loading States**

Toda pagina/componente que carga datos debe mostrar:
1. **Loading inicial**: Skeleton o spinner
2. **Loading de refetch**: Indicador sutil (no bloquear UI)
3. **Error state**: Mensaje descriptivo con opcion de reintentar
4. **Empty state**: Mensaje cuando no hay datos

```typescript
if (isLoading) return <TableSkeleton rows={5} />;
if (error) return <ErrorCard message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyState message="No hay usuarios" />;
```

**BP-ADMIN-007: Confirmacion de Acciones Destructivas**

```typescript
// Siempre confirmar antes de eliminar o suspender
const handleSuspend = () => {
  openConfirmDialog({
    title: 'Suspender Usuario',
    message: `Esta seguro de suspender a ${user.name}?`,
    confirmLabel: 'Suspender',
    variant: 'warning',
    onConfirm: () => suspendUser(user.id),
  });
};
```

### 3.4 Seguridad

**BP-ADMIN-008: Validar Siempre en Backend**

Nunca confiar solo en validacion frontend:

```typescript
// Backend DTO con validacion
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // Solo roles validos
}
```

**BP-ADMIN-009: No Exponer Datos Sensibles**

```typescript
// Nunca retornar password_hash, tokens, etc.
private toDto(user: UserEntity): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // NO incluir: password_hash, reset_token, etc.
  };
}
```

---

## 4. Checklist de Implementacion

### Nueva Pagina Admin

- [ ] Crear pagina en `apps/admin/pages/Admin{Nombre}Page.tsx`
- [ ] Crear hook(s) en `apps/admin/hooks/use{Nombre}.ts`
- [ ] Usar `AdminLayout` como wrapper
- [ ] Implementar estados: loading, error, empty, data
- [ ] Agregar ruta en router
- [ ] Verificar guards (`JwtAuthGuard`, `AdminGuard`)

### Nuevo Endpoint Admin

- [ ] Controller con decoradores `@UseGuards(JwtAuthGuard, AdminGuard)`
- [ ] DTOs con validacion `class-validator`
- [ ] Documentacion Swagger (`@ApiTags`, `@ApiOperation`)
- [ ] Service con logica de negocio
- [ ] Manejo de errores apropiado
- [ ] Paginacion si lista
- [ ] Tests unitarios

### Nuevo Componente Admin

- [ ] Props tipadas con interface
- [ ] Estados de loading/error
- [ ] Memoizacion si es costoso
- [ ] Acciones con confirmacion si destructivas
- [ ] Responsive design

---

## 5. Referencias

### Documentacion del Portal Admin

| Documento | Descripcion | Ubicacion |
|-----------|-------------|-----------|
| **Arquitectura Tecnica** | Stack, DTOs, endpoints, seguridad | [ET-EXT-002-ARQUITECTURA-TECNICA.md](../especificaciones/ET-EXT-002-ARQUITECTURA-TECNICA.md) |
| **README Epica** | Overview, estado, US | [README.md](../README.md) |
| **ADR-017** | Decision portal avanzado | [ADR-017](../../../../97-adr/ADR-017-admin-portal-avanzado-vs-alcance-inicial.md) |
| **User Stories** | Historias de usuario | [historias-usuario/](../historias-usuario/) |

### Guias de Desarrollo Generales

| Guia | Ubicacion |
|------|-----------|
| Patrones de Componentes | [COMPONENT-PATTERNS.md](../../../../95-guias-desarrollo/frontend/COMPONENT-PATTERNS.md) |
| Estructura de Modulos Backend | [ESTRUCTURA-MODULOS.md](../../../../95-guias-desarrollo/backend/ESTRUCTURA-MODULOS.md) |
| Convenciones API | [API-CONVENTIONS.md](../../../../95-guias-desarrollo/backend/API-CONVENTIONS.md) |
| Patrones de Hooks | [HOOK-PATTERNS.md](../../../../95-guias-desarrollo/frontend/HOOK-PATTERNS.md) |

### Codigo Fuente

| Area | Ubicacion |
|------|-----------|
| Backend Admin | `apps/backend/src/modules/admin/` |
| Frontend Admin | `apps/frontend/src/apps/admin/` |
| Types Admin | `apps/frontend/src/types/admin/` |

---

## 6. Inventario Backend

### 6.1 Controllers (17 total)

| Controller | Archivo | Endpoints | Guards | Swagger |
|------------|---------|-----------|--------|---------|
| `AdminAlertsController` | `admin-alerts.controller.ts` | 5 | ✅ | ✅ |
| `AdminBulkOperationsController` | `admin-bulk-operations.controller.ts` | 4 | ✅ | ✅ |
| `AdminContentController` | `admin-content.controller.ts` | 8 | ✅ | ✅ |
| `AdminDashboardController` | `admin-dashboard.controller.ts` | 5 | ✅ | ✅ |
| `AdminGamificationConfigController` | `admin-gamification-config.controller.ts` | 6 | ✅ | ✅ |
| `AdminInterventionsController` | `admin-interventions.controller.ts` | 4 | ✅ | ✅ |
| `AdminLogsController` | `admin-logs.controller.ts` | 3 | ✅ | ✅ |
| `AdminOrganizationsController` | `admin-organizations.controller.ts` | 8 | ✅ | ✅ |
| `AdminProgressController` | `admin-progress.controller.ts` | 5 | ✅ | ✅ |
| `AdminReportsController` | `admin-reports.controller.ts` | 4 | ✅ | ✅ |
| `AdminRolesController` | `admin-roles.controller.ts` | 4 | ✅ | ✅ |
| `AdminSystemController` | `admin-system.controller.ts` | 7 | ✅ | ✅ |
| `AdminUsersController` | `admin-users.controller.ts` | 10 | ✅ | ✅ |
| `ClassroomAssignmentsController` | `classroom-assignments.controller.ts` | 6 | ✅ | ✅ |
| `ClassroomTeachersRestController` | `classroom-teachers-rest.controller.ts` | 5 | ✅ | ✅ |

**Total Endpoints:** ~84 endpoints
**Cumplimiento Guards:** 100%
**Cumplimiento Swagger:** 100%

### 6.2 Services (15 total)

| Service | Responsabilidad | Patron |
|---------|-----------------|--------|
| `AdminContentService` | CRUD contenido, moderacion | Repository + Pagination |
| `AdminDashboardService` | Stats, actividad, metricas | Aggregation |
| `AdminMonitoringService` | Health checks, metricas sistema | Polling |
| `AdminOrganizationsService` | CRUD organizaciones, subscriptions | Repository |
| `AdminProgressService` | Consultas de progreso agregado | Read-only Aggregation |
| `AdminReportsService` | Generacion de reportes | Factory + Strategy |
| `AdminRolesService` | CRUD roles, permisos | Repository |
| `AdminSystemService` | Config sistema, maintenance | Singleton Config |
| `AdminUsersService` | CRUD usuarios, suspend/activate | Repository + Events |
| `BulkOperationsService` | Operaciones masivas async | Queue-based |
| `ClassroomAssignmentsService` | Asignacion aulas-profesores | Repository |
| `GamificationConfigService` | Config parametros gamificacion | Singleton Config |

### 6.3 DTOs Organizados

```
apps/backend/src/modules/admin/dto/
├── alerts/            (7 DTOs)
├── analytics/         (10 DTOs)
├── bulk-operations/   (5 DTOs)
├── classroom-assignments/ (15 DTOs)
├── content/           (12 DTOs)
├── dashboard/         (11 DTOs)
├── gamification-config/ (7 DTOs)
├── interventions/     (5 DTOs)
├── monitoring/        (6 DTOs)
├── organizations/     (9 DTOs)
├── progress/          (12 DTOs)
├── reports/           (2 DTOs)
├── roles/             (2 DTOs)
├── system/            (9 DTOs)
└── users/             (6 DTOs)
```

**Total DTOs:** ~118 archivos

---

## 7. Inventario Frontend

### 7.1 Paginas Admin (14 total)

| Pagina | Archivo | Hook Principal | Patron Estado | LOC |
|--------|---------|----------------|---------------|-----|
| `AdminDashboardPage` | `AdminDashboardPage.tsx` | `useAdminDashboard` | React Query | 350 |
| `AdminUsersPage` | `AdminUsersPage.tsx` | `useUsers` | useState | 700 |
| `AdminInstitutionsPage` | `AdminInstitutionsPage.tsx` | `useOrganizations` | React Query | 600 |
| `AdminContentPage` | `AdminContentPage.tsx` | `useContentManagement` | useState | 850 |
| `AdminMonitoringPage` | `AdminMonitoringPage.tsx` | `useMonitoring` (5 sub-hooks) | useState | 1,459 |
| `AdminReportsPage` | `AdminReportsPage.tsx` | `useReports` | useState | 552 |
| `AdminSettingsPage` | `AdminSettingsPage.tsx` | `useSettings` | useState | 884 |
| `AdminAlertsPage` | `AdminAlertsPage.tsx` | `useAlerts` | useState | 400 |
| `AdminLogsPage` | `AdminLogsPage.tsx` | `useLogs` | useState | 380 |
| `AdminRolesPage` | `AdminRolesPage.tsx` | `useRoles` | useState | 420 |
| `AdminClassroomsPage` | `AdminClassroomsPage.tsx` | `useClassrooms` | useState | 550 |
| `AdminProgressPage` | `AdminProgressPage.tsx` | `useAdminProgress` | useState | 480 |
| `AdminInterventionsPage` | `AdminInterventionsPage.tsx` | `useInterventions` | useState | 390 |
| `AdminBulkOpsPage` | `AdminBulkOpsPage.tsx` | `useBulkOperations` | useState | 520 |

**Total LOC Paginas:** ~8,535 lineas

### 7.2 Hooks Admin (20 total)

| Hook | Patron | Cache | Auto-refresh |
|------|--------|-------|--------------|
| `useAdminDashboard` | React Query | 30s staleTime | refetchInterval 60s |
| `useUsers` | useState + fetch | Manual | No |
| `useOrganizations` | React Query | 60s staleTime | No |
| `useContentManagement` | useState + fetch | Manual | No |
| `useMonitoring` | useState + setInterval | Manual | 30s |
| `useMetrics` | useState + fetch | Manual | 30s |
| `useSystemHealth` | useState + fetch | Manual | 60s |
| `useErrorTracking` | useState + fetch | Manual | 30s |
| `useUserActivity` | useState + fetch | Manual | 60s |
| `useReports` | useState + fetch | Manual | No |
| `useSettings` | useState + fetch | Manual | No |
| `useAlerts` | useState + fetch | Manual | 30s |
| `useLogs` | useState + fetch | Manual | No |
| `useRoles` | useState + fetch | Manual | No |
| `useClassrooms` | useState + fetch | Manual | No |
| `useAdminProgress` | useState + fetch | Manual | No |
| `useInterventions` | useState + fetch | Manual | 30s |
| `useBulkOperations` | useState + fetch | Manual | 10s (polling) |
| `useGamificationConfig` | useState + fetch | Manual | No |
| `useClassroomAssignments` | useState + fetch | Manual | No |

**Distribucion Patrones:**
- React Query: 4 hooks (20%)
- useState + fetch: 16 hooks (80%)

### 7.3 Componentes Especializados

```
apps/frontend/src/apps/admin/components/
├── dashboard/
│   ├── StatsCards.tsx
│   ├── RecentActivityList.tsx
│   ├── TopUsersWidget.tsx
│   └── ActivityGraph.tsx
├── monitoring/
│   ├── SystemHealthCard.tsx (267 LOC)
│   ├── ErrorTrackingPanel.tsx (189 LOC)
│   ├── MetricsChart.tsx (156 LOC)
│   └── UserActivityHeatmap.tsx (335 LOC)
├── users/
│   ├── UserTable.tsx
│   ├── UserDetailModal.tsx
│   └── UserFilters.tsx
├── organizations/
│   ├── OrganizationCard.tsx
│   └── SubscriptionEditor.tsx
└── shared/
    ├── AdminLayout.tsx
    ├── PageHeader.tsx
    ├── DataTable.tsx
    ├── ActionMenu.tsx
    └── ConfirmDialog.tsx
```

---

## 8. Troubleshooting

### 8.1 Errores Comunes

**ERROR: 401 Unauthorized en endpoints admin**

```
Causa: Token JWT invalido o expirado
Solucion:
1. Verificar que el usuario tiene rol 'admin' o 'super_admin'
2. Renovar token con refresh endpoint
3. Verificar que JwtAuthGuard esta aplicado al controller
```

**ERROR: 403 Forbidden en operaciones admin**

```
Causa: Usuario autenticado pero sin permisos de admin
Solucion:
1. Verificar rol del usuario en base de datos
2. Verificar que AdminGuard esta aplicado al controller
3. Confirmar que el usuario no esta suspendido
```

**ERROR: 500 en /admin/system/metrics**

```
Causa: Query usando 'user_id' en lugar de 'email' para join
Solucion: Corregido en commit 2025-11-20 - usar campo 'email'
Referencia: Ver admin-system.service.ts linea 145
```

**ERROR: Datos duplicados en dashboard**

```
Causa: useEffect sin dependencias ejecutando fetch multiple veces
Solucion:
1. Agregar array de dependencias correcto
2. Usar AbortController para cancelar requests anteriores
3. Preferir React Query con staleTime apropiado
```

**ERROR: Organizations retorna formato incorrecto**

```
Causa: Respuesta usaba 'data' en lugar de 'items' con paginacion
Solucion: Corregido en commit 2025-11-20 - estandarizado a { items, pagination }
```

### 8.2 Performance Issues

**Problema: Dashboard carga lento (>3s)**

```
Diagnostico:
1. Verificar Network tab - cual endpoint es lento?
2. Revisar si queries son secuenciales vs paralelas

Solucion:
- Usar Promise.all() para queries independientes
- Implementar paginacion en endpoints pesados
- Considerar caching con staleTime apropiado
```

**Problema: Tabla de usuarios lagea con >1000 registros**

```
Diagnostico: Renderizado excesivo de filas

Solucion:
1. Implementar virtualizacion (react-virtual)
2. Reducir page size a 25-50
3. Usar memo en componente de fila
```

**Problema: Memory leak en monitoring page**

```
Diagnostico: setInterval no limpiado

Solucion:
useEffect(() => {
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval); // Limpiar!
}, []);
```

### 8.3 Debugging Tips

```typescript
// 1. Verificar token y rol actual
console.log('Current user:', JSON.parse(atob(token.split('.')[1])));

// 2. Interceptar requests
axios.interceptors.request.use(req => {
  console.log('Admin Request:', req.url, req.headers);
  return req;
});

// 3. Verificar guards aplicados (backend)
// En controller, agregar log temporal:
@Get()
async findAll() {
  this.logger.debug('Guards passed for user:', this.request.user);
}
```

---

## 9. FAQ

### General

**Q: Como agrego un nuevo modulo al admin portal?**

A: Seguir estos pasos:
1. Crear controller en `modules/admin/controllers/`
2. Crear service en `modules/admin/services/`
3. Crear DTOs en `modules/admin/dto/{modulo}/`
4. Registrar en `admin.module.ts`
5. Crear pagina en `apps/admin/pages/`
6. Crear hook en `apps/admin/hooks/`
7. Agregar ruta en router admin

**Q: Puedo reutilizar componentes del portal student?**

A: No directamente. Los portales son independientes. Si necesitas funcionalidad comun:
1. Extraer a `@shared/components/`
2. O crear wrapper especifico en admin con estilos propios

**Q: Por que hay dos patrones de estado (React Query vs useState)?**

A: Inconsistencia historica. Ver [Seccion 10: Inconsistencias](#10-inconsistencias-conocidas) para plan de migracion.

### Seguridad

**Q: Que roles pueden acceder al admin portal?**

A: Solo `admin` y `super_admin`. Ver DIRECTIVA-ADMIN-002.

**Q: Como implemento una accion que solo super_admin puede hacer?**

A: Usar guard adicional:
```typescript
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Post('dangerous-action')
async dangerousAction() { }
```

**Q: Debo validar en frontend y backend?**

A: Si. Frontend para UX, backend para seguridad real. Ver BP-ADMIN-008.

### Datos

**Q: Como implemento paginacion correctamente?**

A: Ver PATRON-ADMIN-003 (Service Standard). Usar:
- `skip = (page - 1) * limit`
- `take = limit`
- Retornar `{ items, total, page, limit, totalPages }`

**Q: Cual es el limite maximo de registros por pagina?**

A: 100. Ver BP-ADMIN-003.

**Q: Como exporto datos a CSV/Excel?**

A: Usar `AdminReportsService`:
```typescript
const report = await reportsService.generate({
  type: 'users',
  format: 'csv',
  filters: { ... }
});
```

### Frontend

**Q: Debo usar memo() en todos los componentes?**

A: No. Solo cuando:
- Props no cambian frecuentemente
- Componente es costoso de renderizar
- Es item de lista grande

**Q: Como manejo el auto-refresh en paginas criticas?**

A: Preferir React Query con refetchInterval:
```typescript
useQuery({
  queryKey: ['admin', 'metrics'],
  queryFn: fetchMetrics,
  refetchInterval: 30000, // 30 segundos
});
```

**Q: Como muestro feedback de acciones al usuario?**

A: Usar toast notifications:
```typescript
try {
  await deleteUser(id);
  toast.success('Usuario eliminado');
} catch (e) {
  toast.error('Error al eliminar');
}
```

---

## 10. Inconsistencias Conocidas

### INC-001: Patrones de Estado Mixtos

**Descripcion:** El frontend usa dos patrones diferentes para manejo de estado:
- 20% React Query (Dashboard, Organizations)
- 80% useState + fetch manual (resto de paginas)

**Impacto:** Inconsistencia en caching, invalidacion, y UX (loading states)

**Recomendacion:** Migrar gradualmente a React Query

**Plan de Migracion:**
```
Fase 1 (Prioridad Alta):
- [ ] useUsers → React Query
- [ ] useMonitoring → React Query
- [ ] useAlerts → React Query

Fase 2 (Prioridad Media):
- [ ] useReports → React Query
- [ ] useSettings → React Query
- [ ] useRoles → React Query

Fase 3 (Prioridad Baja):
- [ ] Resto de hooks
```

**Ejemplo de migracion:**
```typescript
// ANTES (useState + fetch)
const useUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/admin/users')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};

// DESPUES (React Query)
const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminAPI.users.list(filters),
    staleTime: 30000,
  });
};
```

---

### INC-002: Fallbacks Inconsistentes

**Descripcion:** Algunos componentes muestran spinner, otros skeleton, otros nada durante carga

**Impacto:** UX inconsistente

**Componentes afectados:**
- `AdminUsersPage` - usa spinner
- `AdminContentPage` - usa skeleton
- `AdminLogsPage` - no muestra nada

**Recomendacion:** Estandarizar a skeleton para tablas, spinner para acciones

**Solucion:**
```typescript
// Crear componentes estandar
<TableSkeleton rows={10} cols={5} />  // Para tablas
<CardSkeleton />                       // Para cards
<ButtonSpinner />                      // Para acciones
```

---

### INC-003: Auto-refresh No Estandarizado

**Descripcion:** Cada pagina implementa auto-refresh de forma diferente

| Pagina | Implementacion | Intervalo |
|--------|----------------|-----------|
| Dashboard | useEffect + setInterval | 60s |
| Monitoring | useEffect + setInterval | 30s |
| Alerts | Polling manual | 30s |
| Bulk Ops | setTimeout recursivo | 10s |

**Impacto:** Codigo duplicado, dificil de mantener

**Recomendacion:** Usar hook centralizado o React Query refetchInterval

**Solucion:**
```typescript
// Hook centralizado
const useAutoRefresh = (
  fetcher: () => Promise<void>,
  intervalMs: number
) => {
  useEffect(() => {
    fetcher();
    const id = setInterval(fetcher, intervalMs);
    return () => clearInterval(id);
  }, [fetcher, intervalMs]);
};

// O con React Query
useQuery({
  queryKey: ['admin', 'alerts'],
  queryFn: fetchAlerts,
  refetchInterval: 30000,
});
```

---

### INC-004: Logging Backend Inconsistente

**Descripcion:** Algunos services usan Logger, otros console.log, otros nada

**Impacto:** Dificil debugging en produccion

**Services afectados:**
- ✅ AdminUsersService - usa Logger correctamente
- ⚠️ AdminContentService - mezcla Logger y console.log
- ❌ AdminReportsService - no tiene logging
- ❌ ClassroomAssignmentsService - no tiene logging

**Recomendacion:** Todos los services deben usar Logger de NestJS

**Solucion:**
```typescript
@Injectable()
export class AdminExampleService {
  private readonly logger = new Logger(AdminExampleService.name);

  async findAll() {
    this.logger.debug('Finding all examples');
    try {
      const result = await this.repo.find();
      this.logger.log(`Found ${result.length} examples`);
      return result;
    } catch (error) {
      this.logger.error('Failed to find examples', error.stack);
      throw error;
    }
  }
}
```

---

## Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.1.0 | 2025-11-29 | Anadido inventario backend/frontend, troubleshooting, FAQ, inconsistencias |
| 1.0.0 | 2025-11-29 | Creacion inicial - consolidacion de directivas, patrones y buenas practicas |

---

**Autor:** Architecture-Analyst
**Aprobado por:** [Pendiente revision]
**Proxima revision:** 2025-12-31
