---
id: "US-FUND-007"
title: "Navegación y routing"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-001"
story_points: 5
budget: "$1,800 MXN"
sprint: "Sprint-1"
labels: ["frontend", "routing", "navigation", "react-router", "ux"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-FUND-007: Navegación y routing

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 2
**Story Points:** 5 SP
**Presupuesto:** $1,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripción

Como **usuario**, quiero **navegar fluidamente entre las diferentes secciones de la aplicación** para **acceder a las funcionalidades que necesito de manera intuitiva**.

**Contexto del Alcance Inicial:**
El MVP implementa un sistema de routing básico con React Router, incluyendo rutas protegidas que requieren autenticación y redirección automática según el rol del usuario. La navegación es simple y directa, sin transiciones complejas ni lazy loading avanzado.

---

## Criterios de Aceptación

### Rutas Básicas
- [ ] **CA-01:** Rutas públicas accesibles sin autenticación: `/login`, `/register`, `/forgot-password`
- [ ] **CA-02:** Rutas protegidas requieren autenticación: `/dashboard`, `/profile`, `/modules/*`
- [ ] **CA-03:** Redirección automática a `/login` si usuario no autenticado intenta acceder a ruta protegida
- [ ] **CA-04:** Redirección automática a `/dashboard` si usuario autenticado intenta acceder a `/login`
- [ ] **CA-05:** Ruta `/` redirige a `/dashboard` si autenticado, o `/login` si no

### Navegación
- [ ] **CA-06:** Navbar con links a secciones principales (Dashboard, Módulos, Perfil)
- [ ] **CA-07:** Navbar muestra opciones según rol (estudiante vs profesor)
- [ ] **CA-08:** Botón de logout funcional en navbar
- [ ] **CA-09:** Indicador visual de ruta activa en navbar
- [ ] **CA-10:** Breadcrumbs en páginas anidadas (ej: Módulo > Actividad)

### UX
- [ ] **CA-11:** Página 404 personalizada para rutas no encontradas
- [ ] **CA-12:** Loading state al cambiar de ruta
- [ ] **CA-13:** Scroll to top al cambiar de página
- [ ] **CA-14:** Navegación con botón "atrás" del navegador funciona correctamente

---

## Especificaciones Técnicas

### Estructura de Rutas

**Definición de Rutas:**
```typescript
// routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

export const router = createBrowserRouter([
  // Rutas públicas
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    )
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    )
  },

  // Rutas protegidas
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'profile/edit',
        element: <ProfileEditPage />
      },
      {
        path: 'modules',
        element: <ModulesListPage />
      },
      {
        path: 'modules/:moduleId',
        element: <ModuleDetailPage />
      },
      {
        path: 'modules/:moduleId/activities/:activityId',
        element: <ActivityPage />
      },
      {
        path: 'leaderboard',
        element: <LeaderboardPage />
      },
      {
        path: 'achievements',
        element: <AchievementsPage />
      }
    ]
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />
  }
])
```

**ProtectedRoute Component:**
```typescript
// routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isLoading = useAuthStore(state => state.isLoading)
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

**PublicRoute Component:**
```typescript
// routes/PublicRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
```

### Layout Principal

**AppLayout Component:**
```typescript
// components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ScrollToTop } from './ScrollToTop'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <ScrollToTop />
    </div>
  )
}
```

**Navbar Component:**
```typescript
// components/layout/Navbar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function Navbar() {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/dashboard" className="text-2xl font-bold text-green-600">
              GAMILIT
            </NavLink>
          </div>

          {/* Nav Links */}
          <div className="flex space-x-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${
                  isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/modules"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${
                  isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Módulos
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${
                  isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Clasificación
            </NavLink>

            <NavLink
              to="/achievements"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${
                  isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Logros
            </NavLink>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <NavLink to="/profile" className="flex items-center space-x-2">
              <img
                src={user?.photoUrl || '/default-avatar.png'}
                alt={user?.firstName}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">{user?.firstName}</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

**ScrollToTop Component:**
```typescript
// components/layout/ScrollToTop.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```

**Breadcrumbs Component:**
```typescript
// components/layout/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Inicio
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1

          return (
            <li key={name} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {isLast ? (
                <span className="text-gray-900 font-medium capitalize">
                  {name.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link to={routeTo} className="text-gray-500 hover:text-gray-700 capitalize">
                  {name.replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

**404 Page:**
```typescript
// pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mt-2">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
```

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación)
- US-FUND-004 (Infraestructura)
- US-FUND-005 (Sesiones)

**Después:**
- Todas las páginas dependen de este sistema de routing

---

## Definición de Hecho (DoD)

- [x] React Router configurado
- [x] Rutas públicas y protegidas implementadas
- [x] Navbar con navegación funcional
- [x] Página 404 personalizada
- [x] Scroll to top al cambiar ruta
- [x] Breadcrumbs en rutas anidadas
- [x] Redirecciones automáticas funcionando
- [x] Tests de navegación
- [x] Responsive navbar (mobile menu)

---

## Notas del Alcance Inicial

- Done Routing básico con React Router v6
- Done Sin lazy loading de rutas
- Done Sin transiciones animadas entre páginas
- Done Sin pre-fetching de datos
- Done Navbar simple sin mega-menu
- **Extensión futura:** EXT-014-UX (lazy loading, transiciones, pre-fetching)
- **Extensión futura:** EXT-015-Mobile (app nativa con navegación móvil)

---

## Testing

### Tests Unitarios
```typescript
describe('ProtectedRoute', () => {
  it('should redirect to login if not authenticated')
  it('should render children if authenticated')
  it('should show loading while checking auth')
})

describe('PublicRoute', () => {
  it('should redirect to dashboard if authenticated')
  it('should render children if not authenticated')
})
```

### Tests E2E
```typescript
describe('Navigation', () => {
  it('should navigate to dashboard after login')
  it('should redirect to login when accessing protected route')
  it('should show 404 for invalid routes')
  it('should navigate using navbar links')
  it('should logout and redirect to login')
  it('should maintain state after navigation')
})
```

---

## Estimación

**Desglose de Esfuerzo (5 SP = ~2 días):**
- React Router setup: 0.5 días
- Protected/Public routes: 0.5 días
- Navbar + layout: 0.75 días
- Breadcrumbs + 404: 0.25 días
- Testing: 0.5 días

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-04
**Responsable:** Equipo Frontend
