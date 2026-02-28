---
titulo: "Portal Admin - Patrones de Diseño, Rutas, APIs y Estado"
tipo: portal
portal: admin
status: activo
last_updated: "2026-02-28"
---

# Portal Admin — Patrones de Diseño, Rutas, APIs y Estado

**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Arquitectura](01-ARQUITECTURA.md) | [Siguiente: Seguridad y Flujos →](03-SEGURIDAD-FLUJOS.md)

---

## 4. Patrones de Diseño

### 4.1 Frontend Patterns

#### 4.1.1 Page + Hook Pattern

Cada página tiene un hook correspondiente que encapsula la lógica:

```typescript
// Pattern: Page con Hook dedicado

// AdminUsersPage.tsx
export default function AdminUsersPage() {
  const {
    users,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
  } = useUserManagement();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <AdminLayout>
      <UserFilters filters={filters} onChange={setFilters} />
      <UserStats stats={stats} />
      <UserTable
        users={users}
        onEdit={updateUser}
        onDelete={deleteUser}
        onSuspend={suspendUser}
      />
    </AdminLayout>
  );
}

// useUserManagement.ts
export function useUserManagement() {
  const [filters, setFilters] = useState<UserFilters>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminAPI.listUsers(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => adminAPI.getUserStats(),
  });

  const { mutate: createUser } = useMutation({
    mutationFn: adminAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  // ... más mutations

  return {
    users,
    stats,
    loading: isLoading,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
  };
}
```

#### 4.1.1b AdminPageShell Pattern (Sprint 0+1+2)

Todas las páginas admin usan `AdminPageShell` como wrapper estándar, eliminando boilerplate repetitivo:

```typescript
// Pattern: AdminPageShell (reemplaza AdminLayout + useAuth + gamification boilerplate)

// ANTES (Sprint 0 — cada página repetía ~15-35 líneas):
export default function AdminSomePage() {
  const { user } = useAuth();
  const { data: gamData } = useUserGamification(user?.id);
  const displayData = gamData ? formatGamification(gamData) : null;
  const handleLogout = () => { /* logout logic */ };

  return (
    <AdminLayout
      user={user}
      gamificationData={displayData}
      onLogout={handleLogout}
    >
      {/* page content */}
    </AdminLayout>
  );
}

// DESPUÉS (Sprint 2 — todas las páginas usan AdminPageShell):
export default function AdminSomePage() {
  return (
    <AdminPageShell title="Some Page" subtitle="Description">
      {/* page content only */}
    </AdminPageShell>
  );
}
```

#### 4.1.1c AdminTabBar Pattern (Sprint 0+1+2)

Tabs con variantes `underline` y `cards`, accesible (ARIA):

```typescript
// Pattern: AdminTabBar con variantes

<AdminTabBar
  tabs={[
    { id: 'overview', label: 'Vista General' },
    { id: 'details', label: 'Detalles' },
    { id: 'settings', label: 'Configuración' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline" // o "cards"
/>
```

#### 4.1.2 Auto-Refresh Pattern

Para datos que requieren actualización frecuente:

```typescript
// Pattern: Auto-refresh con control manual

export function useAdminDashboard(customIntervals?: RefreshIntervals) {
  const [isPaused, setIsPaused] = useState(false);

  // Fetch functions
  const fetchHealth = useCallback(async () => {
    const data = await adminAPI.getSystemHealth();
    setHealth(data);
  }, []);

  // Auto-refresh intervals
  useEffect(() => {
    if (isPaused) return;

    const healthInterval = setInterval(fetchHealth, 10000);
    const metricsInterval = setInterval(fetchMetrics, 30000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, [isPaused, fetchHealth, fetchMetrics]);

  return {
    health,
    metrics,
    pauseRefresh: () => setIsPaused(true),
    resumeRefresh: () => setIsPaused(false),
    isPaused,
  };
}
```

#### 4.1.3 Bulk Operations Pattern

Para operaciones masivas con feedback de progreso:

```typescript
// Pattern: Bulk operations con progress tracking

export function useBulkOperations() {
  const [operation, setOperation] = useState<BulkOperation | null>(null);

  const { mutate: bulkSuspend } = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await adminAPI.bulkSuspendUsers({
        user_ids: userIds,
        reason: 'Admin bulk suspend',
      });

      // Poll operation status
      return pollOperationStatus(result.operation_id);
    },
    onSuccess: (operation) => {
      setOperation(operation);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  // Poll para status updates
  const pollOperationStatus = async (operationId: string) => {
    let status = await adminAPI.getBulkOperationStatus(operationId);

    while (status.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await adminAPI.getBulkOperationStatus(operationId);
    }

    return status;
  };

  return {
    bulkSuspend,
    bulkDelete,
    bulkUpdateRole,
    operation,
  };
}
```

#### 4.1.4 Modal Pattern

Modales para operaciones complejas:

```typescript
// Pattern: Modal con confirmación

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (userId: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === user.username;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2>Confirmar eliminación</h2>
        <p>Para eliminar al usuario {user.username}, escribe su nombre:</p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Nombre de usuario"
        />

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(user.id)}
            disabled={!canDelete}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### 4.2 Backend Patterns

#### 4.2.1 Guard-Based Authorization

```typescript
// Pattern: AdminGuard para proteger rutas

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)  // Requiere autenticación + rol admin
@ApiTags('Admin')
export class AdminUsersController {

  @Get('users')
  async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
    return this.adminUsersService.listUsers(query);
  }
}
```

#### 4.2.2 AdminGuard Implementation

```typescript
// guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Verificar rol admin o super_admin
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    if (!isAdmin) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}
```

#### 4.2.3 Service Layer with Pagination

```typescript
// Pattern: Service con paginación y filtros

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
  ) {}

  async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
    const { page = 1, limit = 20, role, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = query;

    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Aplicar filtros
    if (role) {
      qb.andWhere('role.name = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR profile.first_name ILIKE :search OR profile.last_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    qb.orderBy(`user.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

#### 4.2.4 Bulk Operations Pattern

```typescript
// Pattern: Operaciones masivas con tracking

@Injectable()
export class BulkOperationsService {
  constructor(
    @InjectRepository(BulkOperation, 'auth')
    private bulkOpRepo: Repository<BulkOperation>,
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
  ) {}

  async bulkSuspendUsers(dto: BulkSuspendUsersDto): Promise<BulkOperationStatusDto> {
    // Crear registro de operación
    const operation = this.bulkOpRepo.create({
      operation_type: 'suspend_users',
      target_count: dto.user_ids.length,
      status: 'in_progress',
      initiated_by: dto.admin_id,
    });
    await this.bulkOpRepo.save(operation);

    // Ejecutar operación en background
    this.executeBulkSuspend(operation.id, dto).catch(err => {
      this.logger.error(`Bulk suspend failed: ${err.message}`);
    });

    return {
      operation_id: operation.id,
      status: 'in_progress',
      total: dto.user_ids.length,
      completed: 0,
      failed: 0,
    };
  }

  private async executeBulkSuspend(operationId: string, dto: BulkSuspendUsersDto): Promise<void> {
    const operation = await this.bulkOpRepo.findOne({ where: { id: operationId } });
    let completed = 0;
    let failed = 0;

    for (const userId of dto.user_ids) {
      try {
        await this.userRepo.update(userId, { status: 'suspended' });
        completed++;
      } catch (error) {
        failed++;
      }

      // Actualizar progreso
      operation.completed_count = completed;
      operation.failed_count = failed;
      await this.bulkOpRepo.save(operation);
    }

    // Marcar como completado
    operation.status = 'completed';
    operation.completed_at = new Date();
    await this.bulkOpRepo.save(operation);
  }
}
```

#### 4.2.5 Audit Logging Pattern

```typescript
// Pattern: Audit logging automático

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private auditLogService: AuditLogService,
  ) {}

  async updateUser(userId: string, dto: UpdateUserDto, adminId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Guardar estado anterior para audit
    const previousState = { ...user };

    // Actualizar
    Object.assign(user, dto);
    await this.userRepo.save(user);

    // Log de auditoría
    await this.auditLogService.log({
      event_type: 'user_updated',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      changes: {
        before: previousState,
        after: user,
      },
      metadata: {
        updated_fields: Object.keys(dto),
      },
    });

    return user;
  }
}
```

---

## 5. Rutas y Navegación

### 5.1 Rutas Frontend

```typescript
// Estructura de rutas del portal admin
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },

      // Gestión
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'institutions', element: <AdminInstitutionsPage /> },
      { path: 'roles', element: <AdminRolesPage /> },

      // Contenido
      { path: 'content', element: <AdminContentPage /> },
      { path: 'classroom-teacher', element: <AdminClassroomTeacherPage /> },

      // Configuración
      { path: 'gamification', element: <AdminGamificationPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'advanced', element: <AdminAdvancedPage /> },

      // Monitoreo
      { path: 'monitoring', element: <AdminMonitoringPage /> },
      { path: 'alerts', element: <AdminAlertsPage /> },

      // Analytics
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'progress', element: <AdminProgressPage /> },
    ],
  },
];
```

### 5.2 Navegación Lateral

```typescript
// Sidebar navigation items
const navigationItems = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard />,
    path: '/admin/dashboard',
  },
  {
    label: 'Gestión',
    icon: <Users />,
    children: [
      { label: 'Usuarios', path: '/admin/users' },
      { label: 'Instituciones', path: '/admin/institutions' },
      { label: 'Roles', path: '/admin/roles' },
    ],
  },
  {
    label: 'Contenido',
    icon: <BookOpen />,
    children: [
      { label: 'Moderación', path: '/admin/content' },
      { label: 'Asignación Aulas', path: '/admin/classroom-teacher' },
    ],
  },
  {
    label: 'Configuración',
    icon: <Settings />,
    children: [
      { label: 'Gamificación', path: '/admin/gamification' },
      { label: 'Sistema', path: '/admin/settings' },
      { label: 'Avanzado', path: '/admin/advanced' },
    ],
  },
  {
    label: 'Monitoreo',
    icon: <Activity />,
    children: [
      { label: 'Sistema', path: '/admin/monitoring' },
      { label: 'Alertas', path: '/admin/alerts' },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChart />,
    children: [
      { label: 'Estadísticas', path: '/admin/analytics' },
      { label: 'Reportes', path: '/admin/reports' },
      { label: 'Progreso', path: '/admin/progress' },
    ],
  },
];
```

---

## 6. APIs del Portal Admin

### 6.1 Tabla Resumen de Endpoints

| Categoría | Método | Endpoint | Descripción | Guard |
|-----------|--------|----------|-------------|-------|
| **Dashboard** | GET | `/admin/dashboard` | Dashboard completo | AdminGuard |
| | GET | `/admin/dashboard/stats` | Estadísticas | AdminGuard |
| | GET | `/admin/dashboard/recent-activity` | Actividad reciente | AdminGuard |
| | GET | `/admin/dashboard/actions/recent` | Acciones de admins | AdminGuard |
| | GET | `/admin/dashboard/alerts` | Alertas | AdminGuard |
| **Users** | GET | `/admin/users` | Lista de usuarios | AdminGuard |
| | GET | `/admin/users/stats` | Estadísticas usuarios | AdminGuard |
| | GET | `/admin/users/:id` | Detalles usuario | AdminGuard |
| | PUT | `/admin/users/:id` | Actualizar usuario | AdminGuard |
| | DELETE | `/admin/users/:id` | Eliminar usuario | AdminGuard |
| | POST | `/admin/users/:id/suspend` | Suspender usuario | AdminGuard |
| | POST | `/admin/users/:id/activate` | Activar usuario | AdminGuard |
| | POST | `/admin/users/bulk/suspend` | Suspender múltiples | AdminGuard |
| | POST | `/admin/users/bulk/delete` | Eliminar múltiples | AdminGuard |
| **Organizations** | GET | `/admin/organizations` | Lista organizaciones | AdminGuard |
| | POST | `/admin/organizations` | Crear organización | AdminGuard |
| | GET | `/admin/organizations/:id` | Detalles organización | AdminGuard |
| | PUT | `/admin/organizations/:id` | Actualizar organización | AdminGuard |
| | PATCH | `/admin/organizations/:id/subscription` | Actualizar suscripción | AdminGuard |
| **Roles** | GET | `/admin/roles` | Lista de roles | AdminGuard |
| | GET | `/admin/roles/:id/permissions` | Permisos del rol | AdminGuard |
| | PATCH | `/admin/roles/:id/permissions` | Actualizar permisos | AdminGuard |
| **Content** | GET | `/admin/content` | Lista contenido | AdminGuard |
| | GET | `/admin/content/pending` | Pendiente moderación | AdminGuard |
| | POST | `/admin/content/:id/approve` | Aprobar contenido | AdminGuard |
| | POST | `/admin/content/:id/reject` | Rechazar contenido | AdminGuard |
| **Gamification** | GET | `/admin/gamification/settings` | Config gamificación | AdminGuard |
| | PATCH | `/admin/gamification/settings` | Actualizar config | AdminGuard |
| | GET | `/admin/gamification/parameters` | Parámetros | AdminGuard |
| | PATCH | `/admin/gamification/parameters/:id` | Actualizar parámetro | AdminGuard |
| **System** | GET | `/admin/system/config` | Config sistema | AdminGuard |
| | PATCH | `/admin/system/config` | Actualizar config | AdminGuard |
| | GET | `/admin/system/health` | Salud del sistema | AdminGuard |
| | POST | `/admin/system/maintenance/toggle` | Toggle mantenimiento | AdminGuard |
| **Monitoring** | GET | `/admin/monitoring/health` | Health check | AdminGuard |
| | GET | `/admin/monitoring/metrics` | Métricas actuales | AdminGuard |
| | GET | `/admin/monitoring/errors/recent` | Errores recientes | AdminGuard |
| **Alerts** | GET | `/admin/alerts` | Lista alertas | AdminGuard |
| | POST | `/admin/alerts` | Crear alerta | AdminGuard |
| | PATCH | `/admin/alerts/:id/acknowledge` | Acknowledge | AdminGuard |
| | PATCH | `/admin/alerts/:id/resolve` | Resolver | AdminGuard |
| **Analytics** | GET | `/admin/analytics/overview` | Overview | AdminGuard |
| | GET | `/admin/analytics/engagement` | Engagement | AdminGuard |
| | GET | `/admin/analytics/retention` | Retention | AdminGuard |
| | POST | `/admin/analytics/export` | Exportar datos | AdminGuard |
| **Reports** | GET | `/admin/reports` | Lista reportes | AdminGuard |
| | POST | `/admin/reports/generate` | Generar reporte | AdminGuard |
| **Progress** | GET | `/admin/progress/overview` | Overview progreso | AdminGuard |
| | GET | `/admin/progress/students` | Progreso estudiantes | AdminGuard |
| | GET | `/admin/progress/export` | Exportar progreso | AdminGuard |
| **Classroom** | GET | `/admin/classroom-assignments` | Lista asignaciones | AdminGuard |
| | POST | `/admin/classroom-assignments/assign` | Asignar | AdminGuard |
| | POST | `/admin/classroom-assignments/bulk-assign` | Bulk assign | AdminGuard |
| **Logs** | GET | `/admin/logs` | Audit logs | AdminGuard |

### 6.2 Frontend API Services

Las API services del admin portal están en `apps/frontend/src/services/api/`:

```
services/api/
├── adminAPI.ts                     # Main admin API (dashboard, users, organizations, roles, system, monitoring, alerts, analytics, reports, progress, content, bulk operations)
├── apiClient.ts                    # Axios client configurado
└── profileAPI.ts                   # Profile management (shared)
```

**Nota:** A diferencia del diagrama original que mostraba 14 archivos separados (`adminUsersAPI.ts`, `adminOrganizationsAPI.ts`, etc.), el admin portal usa un **único archivo `adminAPI.ts`** que exporta todas las funciones organizadas por dominio. Esto simplifica imports y mantiene coherencia con el patrón monolítico del frontend.

Los hooks en `apps/admin/hooks/` consumen directamente las funciones de `adminAPI.ts`:

```typescript
// Ejemplo: useAdminDashboard.ts
import { adminAPI } from '@/services/api/adminAPI';

export function useAdminDashboard() {
  // Consume adminAPI.getDashboard(), adminAPI.getSystemHealth(), etc.
}
```

---

## 7. Estado y Stores

### 7.1 Zustand Stores (Opcional)

El portal admin usa principalmente React Query para state management, pero puede usar Zustand para estado global:

```typescript
// stores/adminStore.ts
interface AdminState {
  // Global admin state
  selectedOrganization: Organization | null;
  maintenanceMode: boolean;

  // Actions
  setSelectedOrganization: (org: Organization | null) => void;
  setMaintenanceMode: (mode: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedOrganization: null,
  maintenanceMode: false,

  setSelectedOrganization: (org) => set({ selectedOrganization: org }),
  setMaintenanceMode: (mode) => set({ maintenanceMode: mode }),
}));
```

### 7.2 React Query Cache

```typescript
// Configuración de React Query para admin
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Query keys structure
const adminQueryKeys = {
  all: ['admin'] as const,

  dashboard: () => [...adminQueryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...adminQueryKeys.dashboard(), 'stats'] as const,

  users: () => [...adminQueryKeys.all, 'users'] as const,
  usersList: (filters: UserFilters) => [...adminQueryKeys.users(), 'list', filters] as const,
  usersStats: () => [...adminQueryKeys.users(), 'stats'] as const,

  organizations: () => [...adminQueryKeys.all, 'organizations'] as const,
  organizationsList: () => [...adminQueryKeys.organizations(), 'list'] as const,

  monitoring: () => [...adminQueryKeys.all, 'monitoring'] as const,
  monitoringHealth: () => [...adminQueryKeys.monitoring(), 'health'] as const,
  monitoringMetrics: () => [...adminQueryKeys.monitoring(), 'metrics'] as const,
};
```

---

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Arquitectura](01-ARQUITECTURA.md) | [Siguiente: Seguridad y Flujos →](03-SEGURIDAD-FLUJOS.md)
