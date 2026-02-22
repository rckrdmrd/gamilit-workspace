# WS08 - Homologacion Cross-Portal

**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Analista:** Claude Sonnet 4.6
**Alcance:** 4 portales (Admin, Teacher, Student, Parent) — comparacion sistematica

---

## 1. Resumen Comparativo

| Dimension | Admin | Teacher | Student | Parent |
|-----------|-------|---------|---------|--------|
| Layout base | `AdminLayout.tsx` con `GamilitSidebar` + `GamifiedHeader` | `TeacherLayout.tsx` con `GamilitSidebar` + `GamifiedHeader` | No tiene Layout dedicado; usa `StudentPageShell` que solo envuelve `GamifiedHeader` | Sin layout — header propio inline en cada pagina |
| PageShell | `AdminPageShell` (usa `AdminLayout` + `useAdminPageSetup`) | `TeacherPageShell` (usa `TeacherLayout` + `useTeacherPageSetup`) | `StudentPageShell` (solo `GamifiedHeader` + `DelayedRewardsModal`) | **Ninguno** — paginas son standalone |
| Sidebar | `GamilitSidebar` rol `admin` | `GamilitSidebar` rol `teacher` | `GamilitSidebar` rol `student` (NO en la mayoria de paginas) | **Ninguno** |
| Tema | detective-theme (naranja/amarillo; `from-detective-bg`) | detective-theme (naranja/amarillo; `from-detective-bg`) | detective-theme (naranja/amarillo) | **Indigo/purple** — tema distinto (`bg-indigo-600`, `bg-gray-50`) |
| Dark mode | No implementado | No implementado | No implementado | No implementado |
| Error handling | `DetectiveCard` con `role="alert"` + `aria-live` | `DetectiveCard variant="danger"` con `role="alert"` | Inline `div` rojo `role="alert"` | Inline `div` rojo con `motion.div` + `role="alert"` |
| Loading states | `SkeletonStats`, `SkeletonCard` (shared/loading) | `SkeletonStats`, `SkeletonCard` (shared/loading) | Inline `animate-spin` (border-amber-500) | Inline `animate-spin` (border-indigo-500) — sin skeletons |
| Notificaciones | `react-hot-toast` (global) + `NotificationBell` en header | `react-hot-toast` (global) + `NotificationBell` en header | `react-hot-toast` (global) + `NotificationBell` en header | **Ningun sistema** — sin toasts, sin bell |
| Navegacion | Sidebar con 12 items | Sidebar con 16 items | Sidebar con 6 items + `BottomNavigation` mobile | Header minimalista (iconos Bell/Settings/LogOut) |
| Auth check | `ProtectedRoute` con `allowedRoles=['super_admin']` | `ProtectedRoute` con `allowedRoles=['teacher','admin_teacher']` | `ProtectedRoute` con `allowedRoles=['student']` | `ProtectedRoute` con `allowedRoles=['parent']` (excepto login/register) |
| Auth store | `useAuthStore` (Zustand) via `ProtectedRoute` | `useAuthStore` (Zustand) via `ProtectedRoute` | `useAuthStore` (Zustand) via `ProtectedRoute` | `useParentStore` (Zustand separado) |
| Responsive | Sidebar colapsable mobile (FAB boton abajo-derecha) | Sidebar colapsable mobile (FAB boton abajo-derecha) | `BottomNavigation` mobile + GamifiedHeader | Responsive con `max-w-7xl mx-auto` + breakpoints `sm:` / `md:` / `lg:` |
| React Query | Minimo (4 archivos) | Minimo (2 archivos) | Minimo (0 archivos) | **Ninguno** — usa Zustand store para todo |
| State mgmt | Zustand stores + hooks propios | Zustand stores + hooks propios | Zustand stores + hooks propios | `useParentStore` (Zustand) — todo en 1 store |
| ErrorBoundary | Si — `<ErrorBoundary portal="Admin">` en App.tsx | Si — `<ErrorBoundary portal="Teacher">` en App.tsx | Si — `<ErrorBoundary portal="Student">` en App.tsx | Si — `<ErrorBoundary portal="Parent">` en App.tsx |
| Rutas publicas | No (solo protegidas) | No (solo protegidas) | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` (globales) | `/parent/login`, `/parent/register` |

---

## 2. Layouts

### AdminLayout (`apps/frontend/src/apps/admin/layouts/AdminLayout.tsx`)

Estructura:
```
<div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
  <a href="#main-content" className="sr-only ...">  {/* WCAG 2.4.1 skip link */}
  <header role="banner">
    <GamifiedHeader />
  </header>
  <div className="flex h-[calc(100vh-4rem)]">
    <nav role="navigation">
      <GamilitSidebar isOpen userRole="admin" />
    </nav>
    <button className="lg:hidden fixed bottom-4 right-4 ...">  {/* FAB mobile */}
    <main id="main-content" role="main" className="flex-1 overflow-y-auto">
      <div className="detective-container py-8">
        {children}
      </div>
    </main>
  </div>
</div>
```

Caracteristicas:
- Fondo: `bg-gradient-to-br from-detective-bg to-detective-bg-secondary` (tonos amber/cream)
- Sidebar abierto por defecto (`useState(true)`), colapsable en mobile
- Usa `BrandingContext` para resolver nombre de plataforma
- Organizacion name hardcodeada: `"GAMILIT Platform Admin"` en `AdminPageShell`
- Skip link accesible con foco naranja

### TeacherLayout (`apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx`)

Estructura identica a `AdminLayout` — **es una copia casi literal** con dos diferencias:
1. `userRole="teacher"` en `GamilitSidebar`
2. `resolvedOrganizationName = organizationName ?? platformName` (Admin tiene logica extra para filtrar `'GAMILIT Platform Admin'`)

Las clases CSS, estructura HTML semantica y comportamiento mobile son identicos.

### StudentPageShell (`apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx`)

**Fundamental diferencia**: No existe un `StudentLayout` con sidebar integrado. La `StudentPageShell` solo envuelve `GamifiedHeader` sin sidebar.

```
<>
  {showHeader && <GamifiedHeader user onLogout />}
  {children}
  <DelayedRewardsModal />  {/* Extra: modal de recompensas diferidas */}
</>
```

El sidebar para el estudiante existe (`GamilitSidebar rol="student"`) pero NO esta integrado en `StudentPageShell`. Aparece en algunas paginas individuales (como `DashboardComplete` via `ResponsiveLayout`), pero no es universal.

El portal estudiante tiene `BottomNavigation` (componente mobile-first) que aparece via CSS `md:hidden` en el componente `DashboardComplete`.

### ParentLayout (INEXISTENTE)

El portal de padres no tiene layout componente. Cada pagina implementa su propio header inline:

```tsx
{/* ParentDashboardPage */}
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Logo emoji + titulo + Bell/Settings/LogOut iconos */}
    </div>
  </header>
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {children}
  </main>
</div>
```

No tiene sidebar. El fondo es `bg-gray-50` con tarjetas `bg-white` — completamente diferente al tema detective.

### Discrepancias de Layout

| Problema | Severidad |
|---------|-----------|
| Student no tiene `StudentLayout` — el sidebar no esta garantizado en todas las paginas | Alta |
| Parent no tiene layout reutilizable — header duplicado entre `ParentDashboardPage` y `ChildProgressPage` | Alta |
| `AdminLayout` y `TeacherLayout` son copias casi identicas — violacion DRY | Media |
| `StudentPageShell` no incluye sidebar — inconsistencia con Admin/Teacher | Alta |
| Fondo de pagina: Admin/Teacher usan `from-detective-bg`, Student usa varias clases, Parent usa `bg-gray-50` | Media |

---

## 3. Themes & Styles

### Sistema de Colores

El proyecto define un tema detective centralizado en `tailwind.config.js` y `shared/styles/detective-theme.css`:

**Colores detective-theme:**
- `detective-bg`: `#fffbeb` (amber-50)
- `detective-bg-secondary`: `#fef3c7` (amber-100)
- `detective-orange`: `#f97316` (orange-500)
- `detective-text`: `#1f2937` (gray-800)
- `detective-text-secondary`: `#6b7280` (gray-500)

**Uso por portal:**

| Portal | Background | Accent | Input focus | Boton primario |
|--------|-----------|--------|------------|----------------|
| Admin | `from-detective-bg to-detective-bg-secondary` | naranja (`detective-orange`) | `ring-orange` | `DetectiveButton` (naranja) |
| Teacher | `from-detective-bg to-detective-bg-secondary` | naranja | `ring-orange` | `DetectiveButton` (naranja) |
| Student | Mixto: `detective-bg`, `gray-900` en PageLoader, blanco en algunas paginas | naranja | `ring-orange` | `DetectiveButton` (naranja) / inline |
| Parent | `bg-gray-50` (dashboard), `from-blue-50 via-indigo-50 to-purple-50` (login) | **indigo** (`indigo-600`) | `ring-indigo-500` | Inline `bg-indigo-600 hover:bg-indigo-700` |

### Dark Mode

`tailwind.config.js` tiene `darkMode: 'class'` configurado, pero **ningun portal implementa soporte de dark mode**. Solo 37 archivos usan prefijo `dark:` y son principalmente componentes del portal student con uso muy parcial (ej: `ExerciseSidebar`, algunas listas de amigos).

### Componentes de UI Base

**Detective theme (compartido Admin + Teacher + Student):**
- `DetectiveCard` — tarjeta con bordes amber, sombra
- `DetectiveButton` — boton naranja con variantes
- `SkeletonCard`, `SkeletonStats` — skeletons themed
- `TabBar` con `variant="detective-pills"`
- `InputDetective` — input con focus naranja

**Parent portal:** Utiliza 0 componentes `Detective*`. Implementa todo con clases Tailwind planas (`border-gray-300`, `focus:ring-indigo-500`, `bg-indigo-600`).

### Inconsistencias de Estilo Criticas

1. **Parent portal tiene su propio sistema de colores** (indigo/purple) sin relacion con el tema detective. Los usuarios que van de portal Student a portal Parent veran un cambio visual total.
2. **PageLoader global** (`App.tsx`) usa `bg-gray-900` y `border-amber-500` — diferente a todos los portales.
3. **`UnauthorizedPage`** usa `bg-gray-50` con texto en ingles ("Access Denied", "You don't have permission...") — inconsistente con el idioma espanol del resto.
4. **`ProtectedRoute` loading** usa `bg-gray-50 border-orange-600` con texto ingles `"Loading..."` — inconsistente con la UI en espanol y el tema detective.

---

## 4. Error Handling

### Nivel de Aplicacion (ErrorBoundary)

Todos los portales tienen `<ErrorBoundary portal="X">` en `App.tsx`. El ErrorBoundary usa clases detective:
```tsx
<div className="flex min-h-screen items-center justify-center bg-detective-bg">
  <div className="w-full max-w-md rounded-xl bg-detective-bg-secondary p-8 shadow-lg">
    <h2>Oops! Algo salio mal</h2>
    <button className="bg-detective-orange ...">Intentar de nuevo</button>
  </div>
</div>
```
Consistente entre todos los portales (mismo componente compartido).

### Nivel de Pagina (API Errors)

| Portal | Patron de error en paginas |
|--------|---------------------------|
| Admin | `DetectiveCard` con `div.bg-red-500/20.text-red-500 role="alert"` + `aria-live="polite"` wrapper |
| Teacher | `DetectiveCard variant="danger"` con `AlertCircle` icon + boton `Reintentar` |
| Student | Inline `div.bg-red-50.text-red-700 role="alert"` (sin DetectiveCard) |
| Parent | `motion.div.bg-red-50.text-red-700 role="alert"` con `AlertCircle` icon (similar a student pero con Framer Motion) |

**Inconsistencias:**
- Admin usa `DetectiveCard` para envolver el error; Teacher usa `DetectiveCard variant="danger"`; Student y Parent no usan DetectiveCard
- Teacher es el unico que ofrece boton "Reintentar" en el error de pagina principal
- Admin usa `aria-live="polite"` sobre el contenedor del error; los demas no
- Parent usa `motion.div` animado para el error; los otros no

### Errores 404 y de Permiso

- **404**: Solo existe `NotFoundPage` en `apps/student/pages/NotFoundPage.tsx` — se registra en `App.tsx` como `path="*"` global. No hay 404s especificos por portal.
- **403/Unauthorized**: `UnauthorizedPage` en `shared/components/ProtectedRoute.tsx` con texto en **ingles**, `bg-gray-50` (sin tema detective), y links en ingles "Go to Home" / "Go to Dashboard"
- Los portales Teacher, Admin y Parent no tienen paginas 404 propias — usan el 404 del portal student.

---

## 5. Loading States

### Global (App.tsx)

```tsx
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-400 text-sm">Cargando...</p>
  </div>
);
```
Fondo oscuro (`bg-gray-900`) — contrasta con todos los portales que son claros.

### Por Portal

| Portal | Skeleton components | Spinner inline | Patron |
|--------|--------------------|--------------|-|
| Admin | `SkeletonStats`, `SkeletonCard` — de `shared/components/loading` | `RefreshCw animate-spin` en botones | Consistente, usa shared |
| Teacher | `SkeletonStats`, `SkeletonCard` — de `shared/components/loading` | `RefreshCw animate-spin` en botones | Consistente, usa shared |
| Student | Minimo uso de skeletons; inline `animate-spin` `border-amber-500` | Spinner personalizado inline | Inconsistente |
| Parent | **Sin skeletons** — usa spinner inline con `border-indigo-500` y texto `"Cargando dashboard..."` | `RefreshCw animate-spin` en boton de recarga | Sin shared loading |

### Componentes Shared de Loading Disponibles

En `shared/components/loading/index.ts` existen: `Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonCard`, `SkeletonStats`, `SkeletonList`, `SkeletonTable`, `SkeletonAchievement`, `LoadingSpinner`, `LoadingOverlay`.

**Problema:** Solo Admin y Teacher los usan consistentemente. Student los usa esporadicamente y Parent no los usa en absoluto.

### ProtectedRoute Loading

```tsx
// Cuando isLoading=true:
<div className="flex min-h-screen items-center justify-center bg-gray-50">
  <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600"></div>
  <p className="mt-4 text-gray-600">Loading...</p>  {/* en ingles */}
</div>
```
- Fondo `bg-gray-50` (no detective-bg)
- Texto "Loading..." en ingles
- Spinner `border-b-2 border-orange-600` — diferente al `border-4 border-amber-500` del PageLoader global

---

## 6. Notifications & Alerts

### Sistema Global de Toasts

`react-hot-toast` esta configurado en `App.tsx` con:
```tsx
<Toaster
  position="top-right"
  toastOptions={{
    style: { background: '#333', color: '#fff' },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
  }}
/>
```

Este `Toaster` es **global para toda la aplicacion**, incluyendo todos los portales. Pero:
- Admin: usa `toast()` en muchos componentes (67 ocurrencias totales en 44 archivos del directorio `apps/`)
- Teacher: usa `toast()` ampliamente
- Student: usa `toast()` moderadamente
- **Parent: NO usa `toast()` en ninguna de sus 4 paginas**

### NotificationBell

`GamifiedHeader` incluye `<NotificationBell />` (en `features/notifications/components/NotificationBell`). Este campanita de notificaciones aparece en:
- Admin: SI (via GamifiedHeader en AdminLayout)
- Teacher: SI (via GamifiedHeader en TeacherLayout)
- Student: SI (via GamifiedHeader en StudentPageShell)
- **Parent: NO** — tiene su propia implementacion de campana inline (solo icono `Bell` de lucide-react + contador de `unreadNotifications` del store — sin conectar a NotificationBell compartida)

### Alertas en Pagina (Alert Banners)

No existe un componente compartido de alert banner. Cada portal maneja alertas de forma diferente:
- Admin: `DetectiveCard` (detective-themed)
- Teacher: `DetectiveCard variant="danger"` con icono + retry button
- Student: `div.bg-red-50` o `div.bg-amber-50` inline
- Parent: `motion.div.bg-red-50` (sin sistema compartido)

---

## 7. Navigation

### Routes en App.tsx vs Sidebar Items

#### Portal Admin — Rutas vs Sidebar

**Rutas registradas en App.tsx:**
```
/admin/dashboard, /admin/institutions, /admin/users, /admin/roles,
/admin/content, /admin/gamification, /admin/monitoring, /admin/advanced,
/admin/reports, /admin/settings, /admin/notifications, /admin/settings/notifications,
/admin/alerts, /admin/analytics, /admin/progress, /admin/classroom-teachers,
/admin/assignments, /admin/audit-logs, /admin/settings/branding,
/admin/integrations/lti, /admin/exercises/create, /admin/exercises/:id/edit
```
**Total rutas admin: 22**

**Items en sidebar admin (GamilitSidebar):**
```
/admin/dashboard, /admin/institutions, /admin/users, /admin/roles,
/admin/content, /admin/exercises/create, /admin/gamification,
/admin/monitoring, /admin/alerts, /admin/reports, /admin/settings,
/admin/classroom-teachers
```
**Total items sidebar admin: 12 (+ 1 Dashboard = 13)**

**Rutas SIN entrada en sidebar (9 rutas huerfanas):**
- `/admin/advanced` — comentada en sidebar ("OCULTO PARA FASE 2"), ruta activa
- `/admin/notifications` — sin entrada
- `/admin/settings/notifications` — sin entrada (sub-ruta de settings)
- `/admin/analytics` — sin entrada
- `/admin/progress` — sin entrada
- `/admin/assignments` — sin entrada
- `/admin/audit-logs` — sin entrada
- `/admin/settings/branding` — sin entrada (sub-ruta de settings)
- `/admin/integrations/lti` — sin entrada
- `/admin/exercises/:id/edit` — solo create en sidebar, no edit

#### Portal Teacher — Rutas vs Sidebar

**Rutas registradas en App.tsx:**
```
/teacher/dashboard, /teacher/alerts, /teacher/analytics, /teacher/assignments,
/teacher/communication, /teacher/content, /teacher/gamification, /teacher/monitoring,
/teacher/progress, /teacher/reports, /teacher/responses, /teacher/resources (redirect),
/teacher/classes, /teacher/students, /teacher/settings, /teacher/notifications,
/teacher/settings/notifications, /teacher/settings/alerts, /teacher/reviews
```
**Total rutas teacher: 19 (incluyendo 1 redirect)**

**Items en sidebar teacher:**
```
/teacher/dashboard, /teacher/classes, /teacher/monitoring, /teacher/assignments,
/teacher/responses, /teacher/reviews, /teacher/progress, /teacher/alerts,
/teacher/reports, /teacher/gamification, /teacher/content, /teacher/communication,
/teacher/analytics, /teacher/notifications, /teacher/settings, /teacher/students
```
**Total: 16 (+ 1 Dashboard = 17)**

**Rutas SIN entrada en sidebar (2 rutas huerfanas):**
- `/teacher/settings/notifications` — sub-ruta accesible desde Settings
- `/teacher/settings/alerts` — sub-ruta accesible desde Settings

Nota: `/teacher/resources` es redirect, no necesita sidebar entry.

#### Portal Student — Rutas vs Sidebar

**Rutas registradas en App.tsx:**
```
/dashboard, /learning, /progress, /progress/modules/:moduleId, /achievements,
/leaderboard, /exercises/:exerciseId, /missions, /assignments, /assignments/:id,
/modules/:moduleId, /profile, /settings, /notifications, /settings/notifications,
/settings/devices, /friends, /guilds, /shop, /inventory
```
**Total rutas student: 20**

**Items en sidebar student:**
```
/dashboard, /achievements, /shop, /learning, /profile, /progress
```
**Total: 6 (+ 1 Dashboard = 7)**

**Rutas SIN entrada en sidebar (13 rutas huerfanas):**
- `/leaderboard` — no en sidebar principal (hay `LeaderboardPreview` dentro del dashboard)
- `/exercises/:exerciseId` — pagina de ejercicio, sin sidebar esperado
- `/missions` — sin entrada en sidebar
- `/assignments` — sin entrada
- `/assignments/:id` — sub-ruta
- `/modules/:moduleId` — sin entrada
- `/notifications` — sin entrada (pero si en BottomNavigation)
- `/settings/notifications` — sub-ruta
- `/settings/devices` — sub-ruta
- `/friends` — sin entrada
- `/guilds` — sin entrada
- `/inventory` — sin entrada

El `BottomNavigation` mobile tiene items adicionales: `/modules`, `/gamification` — ambos no coinciden con rutas reales de App.tsx (son orphan links).

#### Portal Parent — Rutas vs Sidebar

**Rutas registradas en App.tsx:**
```
/parent/login, /parent/register, /parent/dashboard, /parent/child/:studentId
```
**Total rutas parent: 4**

**No tiene sidebar.** El dashboard tiene links directos a rutas que **NO existen** en App.tsx:
- `/parent/notifications` — referenciada en dashboard, NO registrada en App.tsx
- `/parent/settings` — referenciada en dashboard, NO registrada en App.tsx
- `/parent/activity` — referenciada en dashboard, NO registrada en App.tsx
- `/parent/assignments` — referenciada en dashboard, NO registrada en App.tsx

**4 links huerfanos que causarian 404.**

### Discrepancias Criticas de Navegacion

| Problema | Portal | Severidad |
|---------|--------|-----------|
| 4 links apuntan a rutas no registradas | Parent | **Critica** |
| `/admin/analytics`, `/admin/progress`, `/admin/assignments`, `/admin/audit-logs` — sin sidebar entry | Admin | Alta |
| `BottomNavigation` student tiene `/modules` y `/gamification` que no existen en App.tsx | Student | Alta |
| `/admin/advanced` existe en App.tsx pero oculta en sidebar sin redirect | Admin | Media |
| 13 rutas student sin sidebar — navegacion fragmentada | Student | Media |
| Sidebar teacher lista 16 items — puede ser dificil de usar verticalmente | Teacher | Baja |

---

## 8. Authentication & Authorization

### Flujo de Autenticacion

**Portales Admin, Teacher, Student:**
```
1. Usuario visita ruta protegida
2. ProtectedRoute lee useAuthStore (Zustand)
3. Si isLoading=true: spinner "Loading..."
4. Si !isAuthenticated: Navigate to="/login" con state.from preservado
5. Si rol incorrecto: Navigate to="/unauthorized"
6. Si ok: render children + GamificationOverlay
```

**Portal Parent (separado):**
```
1. Usuario visita /parent/dashboard
2. ProtectedRoute lee useAuthStore (allowedRoles=['parent'])
3. Si !isAuthenticated: Navigate to="/login" (ruta global, no /parent/login)
4. Login del padre usa useParentStore.login() — API diferente
```

**Problema:** El portal parent tiene su propio sistema de login (`/parent/login` con `useParentStore`) pero el `ProtectedRoute` redirecciona a `/login` (login global) cuando no esta autenticado. Esto crea confusion: el padre puede autenticarse via `/parent/login` pero si su sesion expira, es redirigido a `/login` (el login de estudiante/admin).

### Roles y Permisos

| Portal | Roles permitidos | Nivel de granularidad |
|--------|-----------------|----------------------|
| Student | `['student']` | 1 rol |
| Teacher | `['teacher', 'admin_teacher']` | 2 roles |
| Admin | `['super_admin']` | 1 rol (solo super_admin) |
| Parent | `['parent']` | 1 rol |

**Nota:** No existe separacion de permisos dentro de cada portal (ej: admin no puede restringir sub-rutas a diferentes niveles de admin).

### useAuth vs useParentStore

- **Admin, Teacher, Student** usan el patron unificado: `useAuth()` → `useAuthStore` (Zustand) → JWT token en headers via interceptor Axios
- **Parent** usa `useParentStore` separado con su propio metodo `login()`. Esto significa que el sistema de autenticacion del padre es paralelo al sistema principal, y no comparte el JWT del usuario base.

### GamificationOverlay en ProtectedRoute

`ProtectedRoute` renderiza `<GamificationOverlay />` para TODOS los portales protegidos, incluyendo Admin y Parent. La `GamificationOverlay` es probablemente solo relevante para estudiantes (muestra XP ganado, rank-up etc). Renderizarla en Admin puede ser inofensivo pero es semanticamente incorrecto.

---

## 9. Responsive Design

### Portal Admin

- Sidebar de `w-80` (320px) siempre visible en `lg:` y superior
- En mobile: sidebar oculto (`-translate-x-full`), boton FAB en `bottom-4 right-4 z-40`
- Contenido: `detective-container` (max-w-80rem con padding adaptativo)
- Ningun componente exclusivo mobile

### Portal Teacher

- Identico a Admin (mismo codigo de layout)
- FAB mobile identico

### Portal Student

- `GamifiedHeader` es responsive: oculta stats XP/ML/Rank en pantallas pequenas
- `BottomNavigation` solo visible en `md:hidden` — navegacion mobile dedicada
- `ResponsiveLayout.tsx` en dashboard maneja columnas adaptativas
- NO tiene FAB de sidebar en mobile — la navegacion mobile es completamente diferente (bottom bar)

**Inconsistencia:** El sidebar del estudiante no colapsa en mobile de la misma forma que Admin/Teacher. En mobile, el estudiante no tiene acceso al sidebar `GamilitSidebar` en la mayoria de paginas.

### Portal Parent

- Header propio con `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` — responsive nativo
- Grid de estudiantes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Stats grid: `grid-cols-2 md:grid-cols-4`
- Actividad y tareas: `grid-cols-1 lg:grid-cols-2`
- No tiene BottomNavigation ni sidebar en ninguna resolucion

### Comparacion Mobile

| Portal | Mobile navigation | Breakpoint clave | Min touch target |
|--------|------------------|-----------------|-----------------|
| Admin | FAB button 44px para abrir sidebar | `lg:` (1024px) | FAB: `p-3` (48px aprox) |
| Teacher | FAB button 44px para abrir sidebar | `lg:` (1024px) | FAB: `p-3` (48px aprox) |
| Student | BottomNavigation con `min-h-[44px] min-w-[44px]` | `md:` (768px) | 44px (explicito) |
| Parent | Solo iconos en header (Bell, Settings, Logout) con `p-2` | `sm:` (640px) | `p-2` = ~36px (falta en WCAG) |

---

## 10. Shared Component Usage Matrix

| Componente | Admin | Teacher | Student | Parent |
|-----------|-------|---------|---------|--------|
| `GamifiedHeader` | SI (via AdminLayout) | SI (via TeacherLayout) | SI (via StudentPageShell) | NO |
| `GamilitSidebar` | SI (via AdminLayout) | SI (via TeacherLayout) | Parcial (no universal) | NO |
| `ErrorBoundary` | SI | SI | SI | SI |
| `ProtectedRoute` | SI | SI | SI | SI |
| `DetectiveCard` | SI extensivo | SI extensivo | Minimo | NO |
| `DetectiveButton` | SI extensivo | SI extensivo | Minimo | NO |
| `TabBar` | SI | SI | NO | NO |
| `SkeletonCard/Stats` | SI | SI | Parcial | NO |
| `LoadingSpinner` | NO | NO | NO | NO |
| `Modal` (shared) | SI | SI | SI | SI (LinkStudentModal) |
| `DataTable` | SI | SI | NO | NO |
| `EmptyState` | NO | SI | NO | NO |
| `NotificationBell` | SI (via GamifiedHeader) | SI (via GamifiedHeader) | SI (via GamifiedHeader) | NO (propia) |
| `GamificationOverlay` | SI (via ProtectedRoute) | SI (via ProtectedRoute) | SI (via ProtectedRoute) | SI (via ProtectedRoute) |
| `AvatarDisplay` | SI (via GamifiedHeader) | SI (via GamifiedHeader) | SI (via GamifiedHeader) | NO |
| `BrandingContext` | SI (via AdminLayout) | SI (via TeacherLayout) | Parcial | NO |
| `ConfirmDialog` | NO | NO | NO | NO |
| `Pagination` | SI | SI | NO | NO |
| `FormField` | Parcial | Parcial | NO | NO |
| `FeatureBadge` | SI | NO | NO | NO |
| `ActivityTimeline` | NO | SI | NO | NO |
| `react-hot-toast` | SI | SI | SI | NO |

**Resumen:** El portal Parent usa el menor numero de componentes compartidos. Solo comparte `ErrorBoundary`, `ProtectedRoute`, `Modal`, y `GamificationOverlay` (este ultimo por herencia de ProtectedRoute, no intencionalmente).

---

## 11. Inconsistent Patterns

### P1 — Criticos (impacto en UX y funcionalidad)

1. **Parent portal sin sistema de notificaciones/toasts:** Las 4 paginas del portal padre no usan `react-hot-toast`. Cuando falla `linkStudent()` o `logout()`, el error se muestra via el store pero sin feedback visual consistente. El `Toaster` global esta disponible pero no se usa.

2. **4 rutas fantasma en Parent portal:** `/parent/notifications`, `/parent/settings`, `/parent/activity`, `/parent/assignments` son referenciadas con `<Link to="...">` pero no estan registradas en App.tsx. Navegando a ellas mostraria la pagina 404 del portal estudiante.

3. **ProtectedRoute redirige a `/login` global para padres:** Cuando el token del padre expira, es redirigido a `/login` (interfaz de estudiante/profesor) en lugar de `/parent/login`.

4. **`BottomNavigation` del student tiene links a rutas inexistentes:** `/modules` (ruta: `/modules/:moduleId` necesita param) y `/gamification` (no existe en App.tsx). Hacer click en estos items resulta en 404.

5. **`UnauthorizedPage` en ingles:** Toda la interfaz esta en espanol menos esta pagina critica de error de permisos.

### P2 — Altos (inconsistencias visuales y de patron)

6. **Parent portal con tema visual completamente diferente:** Indigo/purple vs naranja detective. Un usuario con rol dual o al comparar portales ve dos aplicaciones distintas.

7. **Student no tiene `StudentLayout` — sidebar no garantizado:** Paginas nuevas de estudiante pueden olvidar incluir navegacion. Admin y Teacher garantizan sidebar via Layout.

8. **`AdminLayout` y `TeacherLayout` son duplicados exactos** (excepto `userRole` y logica de `organizationName`). Violacion DRY severa.

9. **`ProtectedRoute` loading state** usa `bg-gray-50` + texto "Loading..." en ingles — ajeno al tema detective y al idioma del proyecto.

10. **`PageLoader` global** (`App.tsx`) usa `bg-gray-900` (oscuro) mientras todos los portales son claros. Es el primer estado visible para usuarios con conexion lenta.

11. **`GamificationOverlay` renderiza en Admin y Parent** — semanticamente incorrecto (admin no tiene gamificacion activa, padre no juega).

12. **Loading styles inconsistentes:** Admin/Teacher usan `SkeletonStats`/`SkeletonCard` (themed); Parent usa spinner inline con `border-indigo-500`; App.tsx usa `border-amber-500`; ProtectedRoute usa `border-orange-600`.

### P3 — Medios (deuda tecnica / mejoras)

13. **`useAdminPageSetup`, `useTeacherPageSetup`, `useStudentPageSetup` son casi identicos:** Solo difieren en el rank default string (`'Ajaw'` vs `'Novato'`). Podrian unificarse en `usePortalPageSetup(role)`.

14. **Admin sidebar omite 9 rutas activas:** Analytics, Progress, Assignments, Audit Logs, Notifications, Branding, LTI, Advanced — sin acceso desde navegacion lateral.

15. **Student sidebar omite 13 rutas activas:** La mayoria del portal student es inaccesible desde el sidebar.

16. **`ErrorBoundary` fallback no tiene accesibilidad aria-live:** El error critico no anuncia a lectores de pantalla.

17. **Falta `404 por portal`:** Solo existe un `NotFoundPage` en el portal estudiante usado globalmente. Un admin que escribe una URL incorrecta ve la pagina 404 con tema de detective/estudiante.

18. **React Query casi inexistente (9 ocurrencias en 4 archivos):** La mayoria del fetching usa `useEffect` + state local o Zustand. React Query esta configurado pero subaprovechado — inconsistencia de patron de datos.

19. **Sidebar items sin iconos tematizados para admin:** Labels con asterisco (`"Instituciones *"`, `"Usuarios *"`) sugieren trabajo en progreso o convenciones sin documentar.

20. **No hay `ConfirmDialog` standard:** Cada portal implementa sus propios dialogos de confirmacion inline.

---

## 12. Recomendaciones de Homologacion

### P0 — Bloqueadores (urgente, afectan funcionalidad)

**H-001: Registrar rutas fantasma del portal Parent**
Registrar en App.tsx las rutas: `/parent/notifications`, `/parent/settings`, `/parent/activity`, `/parent/assignments`, o bien eliminar los `<Link to="...">` en `ParentDashboardPage`.
- Archivo: `apps/frontend/src/App.tsx`
- Archivo: `apps/frontend/src/apps/parent/pages/ParentDashboardPage.tsx`

**H-002: Corregir redirect de auth para portal Parent**
Crear `ProtectedParentRoute` con `redirectTo="/parent/login"` o configurar el `ProtectedRoute` para que padres sean redirigidos a `/parent/login`.
- Archivo: `apps/frontend/src/App.tsx` (rutas `/parent/*`)

**H-003: Corregir BottomNavigation links invalidos**
Cambiar `/modules` a `/dashboard` y `/gamification` a `/achievements` en `BottomNavigation`, o registrar las rutas correspondientes.
- Archivo: `apps/frontend/src/apps/student/components/dashboard/BottomNavigation.tsx`

### P1 — Alta prioridad (impacto en UX cross-portal)

**H-004: Integrar react-hot-toast en portal Parent**
Las acciones en `useParentStore` (login, linkStudent, logout) deben emitir toasts de exito/error.
- Archivo: `apps/frontend/src/features/parent/store/parentStore.ts`

**H-005: Traducir textos en ingles a espanol**
- `UnauthorizedPage`: "Access Denied" → "Acceso Denegado", "You don't have permission..." → espanol
- `ProtectedRoute` loading: "Loading..." → "Cargando..."
- Archivos: `shared/components/ProtectedRoute.tsx`

**H-006: Crear ParentLayout reutilizable**
Extraer el header inline de `ParentDashboardPage` y `ChildProgressPage` a un `ParentLayout` componente. Esto elimina duplicacion y garantiza consistencia.
- Crear: `apps/frontend/src/apps/parent/layouts/ParentLayout.tsx`
- Crear: `apps/frontend/src/apps/parent/components/shared/ParentPageShell.tsx`

**H-007: Crear BaseLayout compartido para Admin y Teacher**
`AdminLayout` y `TeacherLayout` son identicos excepto `userRole`. Crear `PortalLayout` con prop `role` y que ambos layouts reutilicen.
- Crear: `apps/frontend/src/shared/components/layout/PortalLayout.tsx`
- Modificar: `AdminLayout.tsx`, `TeacherLayout.tsx`

**H-008: Integrar SkeletonCard/Stats en portal Parent**
Reemplazar el spinner inline de `ParentDashboardPage` y `ChildProgressPage` con `SkeletonCard`/`SkeletonList` de `shared/components/loading`.

**H-009: Homologar tema visual Parent con detective-theme**
Sustituir `bg-indigo-600`, `ring-indigo-500`, `focus:ring-indigo-500` por equivalentes detective-theme (`bg-detective-orange`, `ring-detective-orange`). El portal padre debe lucir como parte del mismo sistema.

**H-010: Corregir GamificationOverlay en portales no-student**
Extraer `<GamificationOverlay />` de `ProtectedRoute` y solo incluirlo en rutas del portal Student.
- Archivo: `apps/frontend/src/shared/components/ProtectedRoute.tsx`

### P2 — Media prioridad (mejoras de calidad)

**H-011: Crear StudentLayout con sidebar universal**
Crear `StudentLayout.tsx` equivalente a `AdminLayout`/`TeacherLayout` que garantice sidebar en todas las paginas. Actualizar `StudentPageShell` para usarlo.

**H-012: Homologar PageLoader global**
Cambiar `PageLoader` en `App.tsx` de `bg-gray-900` a `bg-detective-bg` para consistencia visual inicial.
- Archivo: `apps/frontend/src/App.tsx`

**H-013: Homologar ProtectedRoute loading state**
Cambiar `bg-gray-50` a `bg-detective-bg` y usar `LoadingSpinner` de shared.
- Archivo: `apps/frontend/src/shared/components/ProtectedRoute.tsx`

**H-014: Unificar hooks de setup de pagina**
`useAdminPageSetup`, `useTeacherPageSetup`, `useStudentPageSetup` son casi identicos. Crear `usePortalPageSetup(options)` generico y reusar.

**H-015: Agregar entradas faltantes al sidebar Admin**
Agregar al sidebar: Analytics, Progress, Assignments, Audit Logs, Notifications. Mover branding/LTI/advanced a sub-menu de Settings.

**H-016: Agregar entradas faltantes al sidebar Student**
Agregar al sidebar student: Missions, Friends, Leaderboard, Inventory, Guilds. El sidebar actual solo expone 6 de 20 rutas.

**H-017: Homologar NotificationBell en portal Parent**
Reemplazar la implementacion custom de campana en `ParentDashboardPage` con `NotificationBell` de shared (o crear `ParentNotificationBell` que comparta la misma interfaz).

**H-018: Crear 404 por portal**
Crear paginas `NotFoundPage` para cada portal con el tema visual correspondiente. Registrar en App.tsx como rutas de fallback dentro de cada grupo de portal.

**H-019: Agregar aria-live al ErrorBoundary**
El error de `ErrorBoundary` debe incluir `role="alert"` y `aria-live="assertive"` para lectores de pantalla.
- Archivo: `apps/frontend/src/shared/components/ErrorBoundary.tsx`

**H-020: Documentar convencion de asterisco en sidebar admin**
Los labels `"Instituciones *"`, `"Usuarios *"` son confusos. Definir si el asterisco indica algo especifico y documentarlo o eliminarlo.
- Archivo: `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

---

## Apendice: Conteo de Rutas por Portal

| Portal | Rutas en App.tsx | Items en Sidebar | Rutas sin Sidebar | Links sin Ruta |
|--------|-----------------|-----------------|-------------------|----------------|
| Admin | 22 | 13 (incl. Dashboard) | 9 | 0 |
| Teacher | 19 | 17 (incl. Dashboard) | 2 sub-rutas | 0 |
| Student | 20 | 7 (incl. Dashboard) | 13 | 0 (BottomNav tiene 2) |
| Parent | 4 (protegidas) | 0 | N/A | 4 links fantasma |

## Apendice: Archivos Clave por Componente

| Componente | Ruta Absoluta |
|-----------|---------------|
| App.tsx | `apps/frontend/src/App.tsx` |
| AdminLayout | `apps/frontend/src/apps/admin/layouts/AdminLayout.tsx` |
| TeacherLayout | `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx` |
| AdminPageShell | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |
| TeacherPageShell | `apps/frontend/src/apps/teacher/components/shared/TeacherPageShell.tsx` |
| StudentPageShell | `apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx` |
| GamifiedHeader | `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx` |
| GamilitSidebar | `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx` |
| ErrorBoundary | `apps/frontend/src/shared/components/ErrorBoundary.tsx` |
| ProtectedRoute | `apps/frontend/src/shared/components/ProtectedRoute.tsx` |
| Loading components | `apps/frontend/src/shared/components/loading/SkeletonCard.tsx` |
| detective-theme CSS | `apps/frontend/src/shared/styles/detective-theme.css` |
| tailwind.config | `apps/frontend/tailwind.config.js` |
| BottomNavigation | `apps/frontend/src/apps/student/components/dashboard/BottomNavigation.tsx` |
| ParentDashboardPage | `apps/frontend/src/apps/parent/pages/ParentDashboardPage.tsx` |
| useAdminPageSetup | `apps/frontend/src/apps/admin/hooks/useAdminPageSetup.ts` |
| useTeacherPageSetup | `apps/frontend/src/apps/teacher/hooks/useTeacherPageSetup.ts` |
| useStudentPageSetup | `apps/frontend/src/apps/student/hooks/useStudentPageSetup.ts` |
