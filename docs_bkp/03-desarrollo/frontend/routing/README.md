# Mapa de Routing y Navegación - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Routing y Navegación - Índice General
**Router:** React Router v6.20.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ROUTING-INDEX-000
título: Mapa de Routing y Navegación - Índice General
estado: Activo
fecha_creación: 2025-11-01
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

---

## 1. Resumen Ejecutivo

Este directorio contiene la documentación modular del **sistema de routing y navegación** del frontend de GAMILIT Platform v2, basado en React Router v6 con más de 60 rutas organizadas por roles.

### Estructura de Documentación:

```
routing/
├── README.md                    # Este archivo (índice)
├── Routing-Configuracion.md    # Configuración base (~250 líneas)
├── Routing-Rutas.md            # Rutas por rol (~200 líneas)
└── Navegacion-Guards.md        # Guards de navegación (~77 líneas)
```

---

## 2. Índice de Documentos

### 2.1 Configuración de Routing

**Archivo:** `Routing-Configuracion.md`

**Contenido:**
- Setup de React Router v6
- Router principal con lazy loading
- Layouts por rol (Public, Student, Teacher, Admin)
- Loading Screen
- Scroll Restoration
- Hooks de navegación (`useNavigation`)

**Ver detalles:** [`Routing-Configuracion.md`](./Routing-Configuracion.md)

---

### 2.2 Rutas por Rol

**Archivo:** `Routing-Rutas.md`

**Contenido:**
- Estructura completa de rutas (60+)
- Rutas públicas (landing, login, register)
- Rutas de estudiante (dashboard, learning, achievements, shop, social)
- Rutas de profesor (monitoring, assignments, analytics)
- Rutas de administrador (users, organizations, system)
- Query parameters
- Navegación programática

**Ver detalles:** [`Routing-Rutas.md`](./Routing-Rutas.md)

---

### 2.3 Guards de Navegación

**Archivo:** `Navegacion-Guards.md`

**Contenido:**
- ProtectedRoute component
- Autenticación y autorización
- Redirección post-login
- RoleRedirect component
- Unauthorized page
- Hooks de autenticación (`useAuth`)
- Conditional rendering por rol
- Breadcrumbs

**Ver detalles:** [`Navegacion-Guards.md`](./Navegacion-Guards.md)

---

## 3. Mapa de Rutas Completo

### 3.1 Rutas Públicas (4)

```
/                    → LandingPage
/login               → LoginPage
/register            → RegisterPage
/forgot-password     → ForgotPasswordPage
```

---

### 3.2 Rutas de Estudiante (25+)

```
/dashboard           → StudentDashboard

/learning            → LearningPage (lista de módulos)
/learning/:moduleId  → ModuleDetailPage
/learning/:moduleId/exercise/:exerciseId → ExercisePage

/achievements        → AchievementsPage
/achievements/:id    → AchievementDetailPage

/shop                → ShopPage
/shop/cart           → CartPage
/shop/inventory      → InventoryPage

/social/guilds       → GuildsPage
/social/friends      → FriendsPage
/social/leaderboard  → LeaderboardPage

/profile             → ProfilePage
/profile/edit        → EditProfilePage
```

---

### 3.3 Rutas de Profesor (15+)

```
/teacher/dashboard        → TeacherDashboard
/teacher/monitoring       → MonitoringPage
/teacher/monitoring/live  → LiveMonitoring
/teacher/assignments      → AssignmentsPage
/teacher/analytics        → AnalyticsPage
/teacher/interventions    → InterventionsPage
```

---

### 3.4 Rutas de Administrador (15+)

```
/admin/dashboard              → AdminDashboard
/admin/users                  → UsersPage
/admin/organizations          → OrganizationsPage
/admin/monitoring/health      → SystemHealth
/admin/content/modules        → ModulesManagement
```

**Total de Rutas:** 60+

---

## 4. Guía Rápida

### 4.1 Configurar Router

```typescript
// src/routes.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { path: 'dashboard', element: <StudentDashboard /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
```

---

### 4.2 Proteger Rutas

```typescript
import { ProtectedRoute } from '@shared/components/routing/ProtectedRoute';

// Solo estudiantes
<ProtectedRoute allowedRoles={['student']} />

// Solo profesores
<ProtectedRoute allowedRoles={['admin_teacher']} />

// Múltiples roles
<ProtectedRoute allowedRoles={['student', 'admin_teacher']} />
```

---

### 4.3 Navegar Programáticamente

```typescript
import { useNavigation } from '@shared/hooks/useNavigation';

const MyComponent = () => {
  const { goToDashboard, goToModule, navigate } = useNavigation();

  return (
    <>
      <button onClick={goToDashboard}>Dashboard</button>
      <button onClick={() => goToModule('module-1')}>Módulo 1</button>
      <button onClick={() => navigate('/shop')}>Tienda</button>
    </>
  );
};
```

---

### 4.4 Verificar Autenticación

```typescript
import { useAuth } from '@shared/hooks/useAuth';

const MyComponent = () => {
  const { isAuthenticated, isStudent, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>;
  }

  return (
    <div>
      {isStudent() && <StudentFeature />}
      {hasRole('admin_teacher') && <TeacherFeature />}
    </div>
  );
};
```

---

## 5. Componentes Clave

### 5.1 ProtectedRoute

**Ubicación:** `src/shared/components/routing/ProtectedRoute.tsx`

**Funcionalidad:**
- Verifica autenticación
- Verifica autorización por rol
- Redirige a login si no está autenticado
- Redirige a unauthorized si no tiene el rol

**Uso:**
```typescript
<ProtectedRoute allowedRoles={['student']}>
  <Outlet />
</ProtectedRoute>
```

---

### 5.2 Layouts

| Layout | Ubicación | Uso |
|--------|-----------|-----|
| `PublicLayout` | `src/shared/components/layout/PublicLayout.tsx` | Rutas públicas |
| `StudentLayout` | `src/shared/components/layout/StudentLayout.tsx` | Rutas de estudiante |
| `TeacherLayout` | `src/shared/components/layout/TeacherLayout.tsx` | Rutas de profesor |
| `AdminLayout` | `src/shared/components/layout/AdminLayout.tsx` | Rutas de admin |

---

### 5.3 Hooks

| Hook | Ubicación | Funcionalidad |
|------|-----------|---------------|
| `useNavigation` | `src/shared/hooks/useNavigation.ts` | Navegación programática |
| `useAuth` | `src/shared/hooks/useAuth.ts` | Verificación de autenticación/autorización |

---

## 6. Flujos de Navegación

### 6.1 Flujo de Login

```
1. Usuario accede a /learning (ruta protegida)
   ↓
2. ProtectedRoute detecta que no está autenticado
   ↓
3. Redirige a /login con state: { from: '/learning' }
   ↓
4. Usuario inicia sesión
   ↓
5. LoginPage redirige a /learning (ubicación guardada)
```

---

### 6.2 Flujo de Autorización

```
1. Estudiante intenta acceder a /teacher/dashboard
   ↓
2. ProtectedRoute verifica el rol
   ↓
3. Detecta que 'student' no está en allowedRoles
   ↓
4. Redirige a /unauthorized
```

---

### 6.3 Flujo de Navegación por Rol

```
1. Usuario inicia sesión
   ↓
2. Sistema verifica el rol
   ↓
3. Redirige según rol:
   - Student → /dashboard
   - Teacher → /teacher/dashboard
   - Admin → /admin/dashboard
```

---

## 7. Patrones de Uso

### 7.1 Lazy Loading

```typescript
const DashboardPage = lazy(() => import('@apps/student/pages/dashboard'));

<Suspense fallback={<LoadingScreen />}>
  <DashboardPage />
</Suspense>
```

---

### 7.2 Nested Routes

```typescript
{
  path: 'learning',
  children: [
    { index: true, element: <LearningPage /> },
    { path: ':moduleId', element: <ModuleDetailPage /> },
    { path: ':moduleId/exercise/:exerciseId', element: <ExercisePage /> },
  ],
}
```

---

### 7.3 Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

const category = searchParams.get('category');
setSearchParams({ category: 'avatars' });
```

---

## 8. Mejores Prácticas

### 8.1 Organización de Rutas

✅ **Correcto:**
```typescript
// Agrupar por rol/feature
{
  path: '/teacher',
  element: <ProtectedRoute allowedRoles={['admin_teacher']} />,
  children: [/* rutas de profesor */],
}
```

❌ **Incorrecto:**
```typescript
// Rutas mezcladas sin organización
{ path: '/teacher-dashboard', element: <TeacherDashboard /> },
{ path: '/student-dashboard', element: <StudentDashboard /> },
```

---

### 8.2 Lazy Loading

✅ **Correcto:**
```typescript
const DashboardPage = lazy(() => import('./pages/Dashboard'));
```

❌ **Incorrecto:**
```typescript
import DashboardPage from './pages/Dashboard'; // Carga síncrona
```

---

### 8.3 Protected Routes

✅ **Correcto:**
```typescript
<ProtectedRoute allowedRoles={['student']} />
```

❌ **Incorrecto:**
```typescript
// Verificación manual en cada componente
const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  // ...
};
```

---

## 9. Navegación entre Documentos

### Documentos de Routing:

- **Configuración de Routing:** [`Routing-Configuracion.md`](./Routing-Configuracion.md)
- **Rutas por Rol:** [`Routing-Rutas.md`](./Routing-Rutas.md)
- **Guards de Navegación:** [`Navegacion-Guards.md`](./Navegacion-Guards.md)

### Otros Módulos Frontend:

- **Componentes:** [`../componentes/README.md`](../componentes/README.md)
- **Estados:** [`../estados/README.md`](../estados/README.md)
- **Estilos:** [`../estilos/README.md`](../estilos/README.md)
- **Features:** [`../features/README.md`](../features/README.md)
- **Mecánicas:** [`../mecanicas/README.md`](../mecanicas/README.md)

### Documentos Originales:

- **Backup Original:** [`../.backup/ROUTING-Y-NAVEGACION.md.backup`](../.backup/ROUTING-Y-NAVEGACION.md.backup)

---

## 10. Estadísticas

### Por Documento:

| Documento | Líneas Aprox. | Contenido |
|-----------|---------------|-----------|
| `Routing-Configuracion.md` | ~250 | Setup, layouts, hooks |
| `Routing-Rutas.md` | ~200 | Rutas completas (60+) |
| `Navegacion-Guards.md` | ~77 | Guards, auth, redirecciones |
| **TOTAL** | **~527** | - |

### Por Tipo de Ruta:

| Tipo | Cantidad |
|------|----------|
| Públicas | 4 |
| Estudiante | 25+ |
| Profesor | 15+ |
| Administrador | 15+ |
| **TOTAL** | **60+** |

### Por Rol:

| Rol | Rutas | Porcentaje |
|-----|-------|------------|
| Público | 4 | ~7% |
| Estudiante | 25+ | ~42% |
| Profesor | 15+ | ~25% |
| Administrador | 15+ | ~25% |

---

## 11. Changelog

### 2025-11-01
- **Creado:** Modularización de `ROUTING-Y-NAVEGACION.md`
- **Dividido en:**
  - `Routing-Configuracion.md` (250 líneas aprox.)
  - `Routing-Rutas.md` (200 líneas aprox.)
  - `Navegacion-Guards.md` (77 líneas aprox.)
- **Creado:** Este archivo `README.md` como mapa de rutas

### 2025-10-27
- **Original:** Creación de `ROUTING-Y-NAVEGACION.md` (527 líneas)

---

## 12. Recursos Adicionales

### 12.1 Documentación Oficial

- [React Router v6 Docs](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)

### 12.2 Herramientas

- **React Router DevTools** - Debugging de rutas
- **React Developer Tools** - Inspeccionar componentes

---

## 13. Contacto y Soporte

Para preguntas o mejoras a la documentación de routing:

- **Equipo:** Frontend GAMILIT
- **Documentación:** `/docs/03-desarrollo/frontend/routing/`
- **Configuración:** `/src/routes.tsx`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Rutas:** 60+
**Router:** React Router v6.20.0
