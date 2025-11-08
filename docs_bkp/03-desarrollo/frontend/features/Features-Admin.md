# Features de Administrador - GAMILIT Platform v2

**Rol:** Super Admin
**Objetivo:** Administración del sistema
**App:** `/src/apps/admin/`

---

## Páginas Principales

### 1. Dashboard (`/admin/dashboard`)

**Objetivo:** Métricas del sistema completo

**Componentes destacados:**

```typescript
// apps/admin/pages/dashboard/AdminDashboardPage.tsx
export const AdminDashboardPage: React.FC = () => {
  const systemMetrics = useSystemMetrics();
  const systemHealth = useSystemHealth();

  return (
    <AdminLayout>
      <SystemHealthOverview
        health={systemHealth}
        metrics={systemMetrics}
      />

      <MetricsGrid>
        <UserMetrics metrics={systemMetrics.users} />
        <ActivityMetrics metrics={systemMetrics.activity} />
        <PerformanceMetrics metrics={systemMetrics.performance} />
        <StorageMetrics metrics={systemMetrics.storage} />
      </MetricsGrid>

      <SystemAlerts alerts={systemMetrics.alerts} />
    </AdminLayout>
  );
};

// apps/admin/components/dashboard/SystemHealth.tsx
interface SystemHealthProps {
  metrics: SystemMetrics;
  health: SystemHealth;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  metrics,
  health,
}) => (
  <div className="grid grid-cols-3 gap-4">
    <MetricCard
      label="CPU Usage"
      value={`${health.cpu}%`}
      status={health.cpu > 80 ? 'critical' : 'healthy'}
    />
    <MetricCard
      label="Memory"
      value={`${health.memory}%`}
      status={health.memory > 80 ? 'critical' : 'healthy'}
    />
    <MetricCard
      label="Active Users"
      value={health.activeUsers}
      status="healthy"
    />
  </div>
);
```

**Hooks especializados:**
- `useSystemMetrics()` - Métricas del sistema
- `useSystemHealth()` - Estado de salud del sistema
- `useSystemMonitoring()` - Monitoreo en tiempo real

---

### 2. Gestión de Usuarios (`/admin/users`)

**Objetivo:** Administrar todos los usuarios del sistema

**Componentes:**

```typescript
// apps/admin/pages/users/UsersManagementPage.tsx
export const UsersManagementPage: React.FC = () => {
  const { users, createUser, updateUser, deleteUser, suspendUser } =
    useUserManagement();

  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: '',
  });

  return (
    <AdminLayout>
      <UsersHeader>
        <button onClick={() => openCreateUserModal()}>
          Crear Usuario
        </button>
      </UsersHeader>

      <UsersFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <UsersTable
        users={users}
        onEdit={updateUser}
        onDelete={deleteUser}
        onSuspend={suspendUser}
        onViewDetails={viewUserDetails}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={createUser}
      />
    </AdminLayout>
  );
};
```

---

### 3. Gestión de Organizaciones (`/admin/organizations`)

**Objetivo:** Administrar escuelas y organizaciones

**Componentes:**

```typescript
// apps/admin/pages/organizations/OrganizationsPage.tsx
export const OrganizationsPage: React.FC = () => {
  const { organizations, createOrg, updateOrg, deleteOrg } =
    useOrganizations();

  return (
    <AdminLayout>
      <OrganizationsHeader>
        <button onClick={() => openCreateOrgModal()}>
          Nueva Organización
        </button>
      </OrganizationsHeader>

      <OrganizationsGrid
        organizations={organizations}
        onEdit={updateOrg}
        onDelete={deleteOrg}
        onViewDetails={viewOrgDetails}
      />

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={createOrg}
      />
    </AdminLayout>
  );
};
```

---

### 4. Monitoreo del Sistema (`/admin/monitoring`)

**Objetivo:** Supervisar salud y rendimiento del sistema

**Componentes:**

```typescript
// apps/admin/pages/monitoring/SystemMonitoringPage.tsx
export const SystemMonitoringPage: React.FC = () => {
  const monitoring = useSystemMonitoring();

  return (
    <AdminLayout>
      <MonitoringDashboard>
        <ServerStatus servers={monitoring.servers} />
        <DatabaseStatus databases={monitoring.databases} />
        <APIStatus endpoints={monitoring.endpoints} />
        <QueueStatus queues={monitoring.queues} />
      </MonitoringDashboard>

      <LogsViewer logs={monitoring.logs} />
      <ErrorTracker errors={monitoring.errors} />
    </AdminLayout>
  );
};
```

---

### 5. Gestión de Contenido (`/admin/content`)

**Objetivo:** Administrar módulos y ejercicios

**Componentes:**

```typescript
// apps/admin/pages/content/ContentManagementPage.tsx
export const ContentManagementPage: React.FC = () => {
  const { modules, exercises, createModule, createExercise } =
    useContentManagement();

  return (
    <AdminLayout>
      <ContentHeader>
        <button onClick={() => openCreateModuleModal()}>
          Nuevo Módulo
        </button>
        <button onClick={() => openCreateExerciseModal()}>
          Nuevo Ejercicio
        </button>
      </ContentHeader>

      <Tabs>
        <TabPanel title="Módulos">
          <ModulesTable
            modules={modules}
            onEdit={editModule}
            onDelete={deleteModule}
          />
        </TabPanel>

        <TabPanel title="Ejercicios">
          <ExercisesTable
            exercises={exercises}
            onEdit={editExercise}
            onDelete={deleteExercise}
          />
        </TabPanel>
      </Tabs>
    </AdminLayout>
  );
};
```

---

### 6. Configuración Global (`/admin/settings`)

**Objetivo:** Configurar parámetros del sistema

**Componentes:**

```typescript
// apps/admin/pages/settings/SystemSettingsPage.tsx
export const SystemSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSystemSettings();

  return (
    <AdminLayout>
      <SettingsTabs>
        <TabPanel title="General">
          <GeneralSettings settings={settings.general} />
        </TabPanel>

        <TabPanel title="Gamificación">
          <GamificationSettings settings={settings.gamification} />
        </TabPanel>

        <TabPanel title="Seguridad">
          <SecuritySettings settings={settings.security} />
        </TabPanel>

        <TabPanel title="Notificaciones">
          <NotificationSettings settings={settings.notifications} />
        </TabPanel>
      </SettingsTabs>
    </AdminLayout>
  );
};
```

---

## Hooks Especializados

```typescript
// apps/admin/hooks/useSystemMetrics.ts
export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await adminAPI.getSystemMetrics();
      setMetrics(data);
    };

    fetchMetrics();

    // Actualizar cada minuto
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// apps/admin/hooks/useUserManagement.ts
export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  const createUser = async (userData: CreateUserData) => {
    const newUser = await adminAPI.createUser(userData);
    setUsers(prev => [...prev, newUser]);
    toast.success('Usuario creado exitosamente');
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    await adminAPI.updateUser(userId, updates);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    toast.success('Usuario actualizado');
  };

  const deleteUser = async (userId: string) => {
    await adminAPI.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuario eliminado');
  };

  const suspendUser = async (userId: string) => {
    await adminAPI.suspendUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
    toast.success('Usuario suspendido');
  };

  return { users, createUser, updateUser, deleteUser, suspendUser };
};

// apps/admin/hooks/useOrganizations.ts
export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const fetchOrganizations = async () => {
    const data = await adminAPI.getOrganizations();
    setOrganizations(data);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    createOrg: async (data: CreateOrgData) => {
      const newOrg = await adminAPI.createOrganization(data);
      setOrganizations(prev => [...prev, newOrg]);
    },
    updateOrg: async (orgId: string, updates: Partial<Organization>) => {
      await adminAPI.updateOrganization(orgId, updates);
      fetchOrganizations();
    },
    deleteOrg: async (orgId: string) => {
      await adminAPI.deleteOrganization(orgId);
      fetchOrganizations();
    },
  };
};
```

---

## Layouts

```typescript
// apps/admin/layouts/AdminLayout.tsx
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <AdminSidebar />
      <main className="admin-main">{children}</main>
      <AdminFooter />
    </div>
  );
};
```

---

## Types Específicos

```typescript
// apps/admin/types/system.types.ts
export interface SystemMetrics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  activity: {
    exercisesCompleted: number;
    averageSessionTime: number;
    activeNow: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  alerts: SystemAlert[];
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  activeUsers: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface Organization {
  id: string;
  name: string;
  type: 'school' | 'district' | 'university';
  students: number;
  teachers: number;
  createdAt: Date;
  status: 'active' | 'inactive';
}
```

---

## Permisos y Acceso

```typescript
// apps/admin/utils/permissions.ts
export const hasPermission = (
  user: User,
  permission: AdminPermission
): boolean => {
  if (user.role !== 'super_admin') return false;

  const permissions: Record<AdminPermission, boolean> = {
    manage_users: true,
    manage_organizations: true,
    manage_content: true,
    view_analytics: true,
    system_settings: true,
    delete_data: user.isSuperAdmin,
  };

  return permissions[permission] || false;
};
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
