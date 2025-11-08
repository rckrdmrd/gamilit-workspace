# Definición de Rutas - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Routing y Navegación - Rutas por Rol
**Router:** React Router v6.20.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ROUTING-RUTAS-002
título: Definición de Rutas por Rol
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde ROUTING-Y-NAVEGACION.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe la **estructura completa de rutas** del frontend de GAMILIT, organizada por roles (público, estudiante, profesor, administrador) con más de 60 rutas.

---

## 2. Estructura Completa de Rutas

```
/                                 # Landing page (public)
├── /login                        # Login (public)
├── /register                     # Register (public)
├── /forgot-password              # Password reset (public)
│
├── /dashboard                    # Student Dashboard (protected)
│   ├── /overview
│   ├── /stats
│   └── /recent
│
├── /learning                     # Learning (protected - student)
│   ├── /                         # Módulos list
│   ├── /:moduleId                # Detalle módulo
│   ├── /:moduleId/exercise/:id   # Ejercicio específico
│   └── /progress                 # Progreso general
│
├── /achievements                 # Achievements (protected - student)
│   ├── /                         # Lista de logros
│   ├── /unlocked                 # Logros desbloqueados
│   ├── /in-progress              # En progreso
│   └── /:achievementId           # Detalle logro
│
├── /shop                         # Shop (protected - student)
│   ├── /                         # Tienda
│   ├── /cart                     # Carrito
│   ├── /inventory                # Inventario
│   └── /item/:itemId             # Detalle item
│
├── /social                       # Social (protected - student)
│   ├── /guilds                   # Gremios
│   │   ├── /                     # Lista gremios
│   │   ├── /my-guild             # Mi gremio
│   │   └── /:guildId             # Detalle gremio
│   ├── /friends                  # Amigos
│   │   ├── /                     # Lista amigos
│   │   ├── /requests             # Solicitudes
│   │   └── /:friendId            # Perfil amigo
│   └── /leaderboard              # Rankings
│       ├── /xp                   # Por XP
│       ├── /coins                # Por ML Coins
│       └── /streak               # Por racha
│
├── /profile                      # Perfil (protected)
│   ├── /                         # Perfil general
│   ├── /edit                     # Editar perfil
│   ├── /settings                 # Configuración
│   └── /history                  # Historial
│
├── /teacher                      # Teacher App (protected - teacher)
│   ├── /dashboard                # Dashboard profesor
│   ├── /monitoring               # Monitoreo
│   │   ├── /                     # Monitoreo general
│   │   ├── /live                 # Tiempo real
│   │   └── /student/:id          # Detalle estudiante
│   ├── /assignments              # Tareas
│   │   ├── /                     # Lista tareas
│   │   ├── /create               # Crear tarea
│   │   ├── /:assignmentId        # Detalle tarea
│   │   └── /:assignmentId/edit   # Editar tarea
│   ├── /analytics                # Analytics
│   │   ├── /overview             # Vista general
│   │   ├── /performance          # Rendimiento
│   │   ├── /engagement           # Engagement
│   │   └── /reports              # Reportes
│   └── /interventions            # Intervenciones
│       ├── /                     # Alertas
│       ├── /active               # Activas
│       └── /history              # Historial
│
└── /admin                        # Admin App (protected - admin)
    ├── /dashboard                # Dashboard admin
    ├── /users                    # Gestión usuarios
    │   ├── /                     # Lista usuarios
    │   ├── /create               # Crear usuario
    │   ├── /:userId              # Detalle usuario
    │   └── /:userId/edit         # Editar usuario
    ├── /organizations            # Organizaciones
    │   ├── /                     # Lista
    │   ├── /create               # Crear
    │   └── /:orgId               # Detalle
    ├── /monitoring               # Monitoreo sistema
    │   ├── /health               # Salud del sistema
    │   ├── /logs                 # Logs
    │   └── /metrics              # Métricas
    └── /content                  # Gestión contenido
        ├── /modules              # Módulos
        ├── /exercises            # Ejercicios
        └── /settings             # Configuración
```

---

## 3. Rutas Públicas

### 3.1 Landing y Autenticación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `LandingPage` | Landing page pública |
| `/login` | `LoginPage` | Inicio de sesión |
| `/register` | `RegisterPage` | Registro de usuario |
| `/forgot-password` | `ForgotPasswordPage` | Recuperación de contraseña |

**Implementación:**
```typescript
{
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <LandingPage /> },
    { path: 'login', element: <LoginPage /> },
    { path: 'register', element: <RegisterPage /> },
    { path: 'forgot-password', element: <ForgotPasswordPage /> },
  ],
}
```

---

## 4. Rutas de Estudiante

### 4.1 Dashboard

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/dashboard` | `StudentDashboard` | Dashboard principal del estudiante |
| `/dashboard/overview` | `DashboardOverview` | Vista general |
| `/dashboard/stats` | `DashboardStats` | Estadísticas |
| `/dashboard/recent` | `DashboardRecent` | Actividad reciente |

---

### 4.2 Learning (Aprendizaje)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/learning` | `LearningPage` | Lista de módulos |
| `/learning/:moduleId` | `ModuleDetailPage` | Detalle de módulo |
| `/learning/:moduleId/exercise/:exerciseId` | `ExercisePage` | Ejercicio específico |
| `/learning/progress` | `ProgressPage` | Progreso general |

**Parámetros:**
- `:moduleId` - ID del módulo (e.g., `module-1`)
- `:exerciseId` - ID del ejercicio (e.g., `ex-001`)

---

### 4.3 Achievements (Logros)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/achievements` | `AchievementsPage` | Lista de logros |
| `/achievements/unlocked` | `UnlockedAchievements` | Logros desbloqueados |
| `/achievements/in-progress` | `InProgressAchievements` | Logros en progreso |
| `/achievements/:achievementId` | `AchievementDetail` | Detalle de logro |

---

### 4.4 Shop (Tienda)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/shop` | `ShopPage` | Tienda de items |
| `/shop/cart` | `CartPage` | Carrito de compras |
| `/shop/inventory` | `InventoryPage` | Inventario del jugador |
| `/shop/item/:itemId` | `ItemDetailPage` | Detalle de item |

**Query Parameters:**
- `?category=avatars` - Filtrar por categoría
- `?sort=price` - Ordenar por precio
- `?rarity=legendary` - Filtrar por rareza

---

### 4.5 Social

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/social/guilds` | `GuildsPage` | Lista de gremios |
| `/social/guilds/my-guild` | `MyGuildPage` | Mi gremio |
| `/social/guilds/:guildId` | `GuildDetailPage` | Detalle de gremio |
| `/social/friends` | `FriendsPage` | Lista de amigos |
| `/social/friends/requests` | `FriendRequestsPage` | Solicitudes de amistad |
| `/social/friends/:friendId` | `FriendProfilePage` | Perfil de amigo |
| `/social/leaderboard/xp` | `LeaderboardXP` | Ranking por XP |
| `/social/leaderboard/coins` | `LeaderboardCoins` | Ranking por ML Coins |
| `/social/leaderboard/streak` | `LeaderboardStreak` | Ranking por racha |

---

### 4.6 Profile (Perfil)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/profile` | `ProfilePage` | Perfil del usuario |
| `/profile/edit` | `EditProfilePage` | Editar perfil |
| `/profile/settings` | `SettingsPage` | Configuración |
| `/profile/history` | `HistoryPage` | Historial de actividad |

---

## 5. Rutas de Profesor

### 5.1 Dashboard

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/teacher/dashboard` | `TeacherDashboard` | Dashboard del profesor |

---

### 5.2 Monitoring (Monitoreo)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/teacher/monitoring` | `MonitoringPage` | Monitoreo general |
| `/teacher/monitoring/live` | `LiveMonitoring` | Monitoreo en tiempo real |
| `/teacher/monitoring/student/:id` | `StudentDetailPage` | Detalle de estudiante |

---

### 5.3 Assignments (Tareas)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/teacher/assignments` | `AssignmentsPage` | Lista de tareas |
| `/teacher/assignments/create` | `CreateAssignmentPage` | Crear tarea |
| `/teacher/assignments/:assignmentId` | `AssignmentDetailPage` | Detalle de tarea |
| `/teacher/assignments/:assignmentId/edit` | `EditAssignmentPage` | Editar tarea |

---

### 5.4 Analytics

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/teacher/analytics/overview` | `AnalyticsOverview` | Vista general |
| `/teacher/analytics/performance` | `PerformanceAnalytics` | Análisis de rendimiento |
| `/teacher/analytics/engagement` | `EngagementAnalytics` | Análisis de engagement |
| `/teacher/analytics/reports` | `ReportsPage` | Reportes |

---

### 5.5 Interventions (Intervenciones)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/teacher/interventions` | `InterventionsPage` | Alertas e intervenciones |
| `/teacher/interventions/active` | `ActiveInterventions` | Intervenciones activas |
| `/teacher/interventions/history` | `InterventionsHistory` | Historial |

---

## 6. Rutas de Administrador

### 6.1 Dashboard

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/dashboard` | `AdminDashboard` | Dashboard del admin |

---

### 6.2 Users (Usuarios)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/users` | `UsersPage` | Lista de usuarios |
| `/admin/users/create` | `CreateUserPage` | Crear usuario |
| `/admin/users/:userId` | `UserDetailPage` | Detalle de usuario |
| `/admin/users/:userId/edit` | `EditUserPage` | Editar usuario |

---

### 6.3 Organizations (Organizaciones)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/organizations` | `OrganizationsPage` | Lista de organizaciones |
| `/admin/organizations/create` | `CreateOrgPage` | Crear organización |
| `/admin/organizations/:orgId` | `OrgDetailPage` | Detalle de organización |

---

### 6.4 Monitoring (Monitoreo del Sistema)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/monitoring/health` | `SystemHealth` | Salud del sistema |
| `/admin/monitoring/logs` | `SystemLogs` | Logs del sistema |
| `/admin/monitoring/metrics` | `SystemMetrics` | Métricas del sistema |

---

### 6.5 Content Management (Gestión de Contenido)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/content/modules` | `ModulesManagement` | Gestión de módulos |
| `/admin/content/exercises` | `ExercisesManagement` | Gestión de ejercicios |
| `/admin/content/settings` | `ContentSettings` | Configuración de contenido |

---

## 7. Navegación Programática

### 7.1 Ejemplos de Navegación

**Ir a módulo específico:**
```typescript
import { useNavigation } from '@shared/hooks/useNavigation';

const { goToModule } = useNavigation();

// Navegar a módulo
goToModule('module-1');
// Resultado: /learning/module-1
```

**Ir a ejercicio:**
```typescript
const { goToExercise } = useNavigation();

goToExercise('module-1', 'ex-001');
// Resultado: /learning/module-1/exercise/ex-001
```

**Ir al dashboard según rol:**
```typescript
const { goToDashboard } = useNavigation();

goToDashboard();
// Student: /dashboard
// Teacher: /teacher/dashboard
// Admin: /admin/dashboard
```

---

### 7.2 Navegación con Parámetros

**useNavigate:**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Con parámetros de ruta
navigate(`/learning/${moduleId}`);

// Con query params
navigate('/shop?category=avatars&sort=price');

// Con state
navigate('/login', { state: { from: location } });

// Volver atrás
navigate(-1);
```

---

## 8. Query Parameters

### 8.1 Shop Filters

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

// Leer parámetros
const category = searchParams.get('category') || 'all';
const sort = searchParams.get('sort') || 'name';
const rarity = searchParams.get('rarity');

// Actualizar parámetros
setSearchParams({
  category: 'avatars',
  sort: 'price',
  rarity: 'legendary',
});
// URL: /shop?category=avatars&sort=price&rarity=legendary
```

---

### 8.2 Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1', 10);
const limit = parseInt(searchParams.get('limit') || '20', 10);

const handlePageChange = (newPage: number) => {
  setSearchParams({
    ...Object.fromEntries(searchParams),
    page: newPage.toString(),
  });
};
```

---

## 9. Mejores Prácticas

### 9.1 URLs Amigables

✅ **Correcto:**
```
/learning/module-1/exercise/ex-001
/shop/item/avatar-detective
```

❌ **Incorrecto:**
```
/learning/12345/exercise/67890
/shop/item?id=12345
```

### 9.2 Consistencia

✅ **Correcto:**
```
/teacher/assignments
/teacher/assignments/create
/teacher/assignments/:id
```

❌ **Incorrecto:**
```
/teacher/assignments
/teacher/create-assignment
/teacher/assignment-detail/:id
```

---

## 10. Referencias

- **Archivo Original:** `ROUTING-Y-NAVEGACION.md` (líneas 25-304)
- **Configuración de Routing:** Ver `Routing-Configuracion.md`
- **Guards de Navegación:** Ver `Navegacion-Guards.md`
- **README Principal:** Ver `routing/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Rutas:** 60+
