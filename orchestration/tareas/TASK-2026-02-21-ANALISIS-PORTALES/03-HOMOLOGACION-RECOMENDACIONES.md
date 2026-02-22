# 03 - Homologacion y Recomendaciones Cross-Portal

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** WS07 + WS08 consolidados (con inputs de WS01-WS06)

---

## 1. Duplicacion de Layouts

### 1.1 AdminLayout vs TeacherLayout -- 97% Identicos

**Hallazgo (WS07):** Los dos layouts principales comparten estructura identica:
- Sidebar con navegacion
- Header con breadcrumbs y notificaciones
- Content area con padding estandarizado
- Footer con version del sistema

**Diferencias (el 3% restante):**
- Rutas de navegacion del sidebar (items de menu)
- Color accent del sidebar (ambos dentro de detective-theme, pero distinto shade)
- Titulo del portal en el header

**Recomendacion H-001: Crear SharedPortalLayout**

```
Prioridad: P1
Esfuerzo: 3-5 dias
Impacto: Elimina ~500 lineas duplicadas

Implementacion:
1. Crear `shared/components/layouts/SharedPortalLayout.tsx`
2. Aceptar props: { navItems, portalTitle, accentColor, children }
3. Migrar AdminLayout y TeacherLayout a wrappers thin de SharedPortalLayout
4. Mantener backward-compat: AdminLayout y TeacherLayout siguen existiendo como re-exports
```

### 1.2 AdminPageShell vs AdminLayout

**Hallazgo (WS04):** Existen DOS sistemas de layout para el portal Admin:
- `AdminLayout` (en `features/admin/`) -- sidebar + header completo
- `AdminPageShell` (en `apps/admin/`) -- wrapper mas ligero

**Causa raiz:** Dualidad `features/admin/` vs `apps/admin/` en la estructura de carpetas.

**Recomendacion H-002: Unificar a AdminPageShell**

```
Prioridad: P2
Esfuerzo: 2-3 dias
Impacto: Elimina confusion de patrones

Implementacion:
1. Migrar paginas de `features/admin/` al patron `apps/admin/pages/` + AdminPageShell
2. BrandingSettingsPage y AdminLtiPage deben usar AdminPageShell
3. Eliminar `features/admin/components/AdminLayout.tsx` legacy
```

---

## 2. Divergencia de Temas

### 2.1 Detective Theme

**Estado actual por portal:**

| Portal | Usa detective-theme | Tema | Paleta |
|--------|---------------------|------|--------|
| Admin | Si | Orange/amber detective | `--detective-primary`, `--detective-accent` |
| Teacher | Si | Orange/amber detective | Mismo CSS custom properties |
| Student | Si | Orange/amber detective | Mismo CSS custom properties |
| Parent | **NO** | Indigo/purple aislado | Tailwind classes hardcoded |

**Recomendacion H-003: Integrar Parent al Detective Theme**

```
Prioridad: P1
Esfuerzo: 2-3 dias
Impacto: Consistencia visual cross-portal

Implementacion:
1. Aplicar detective-theme CSS variables al portal Parent
2. Reemplazar Tailwind hardcoded colors por CSS custom properties
3. Agregar BrandingProvider wrapper al portal Parent
4. Resultado: 4 portales con identidad visual coherente
```

### 2.2 Loading States

**Patrones detectados (WS08):**

| Patron | Donde |
|--------|-------|
| `<LoadingSpinner />` (generico) | Admin, Teacher |
| Skeleton screens | Student (parcial) |
| Shimmer effect | Student (dashboard) |
| Sin loading state | Parent (la mayoria de paginas) |
| `isLoading && <div>Loading...</div>` | Teacher (legacy pages) |

**Recomendacion H-004: Estandarizar Loading States**

```
Prioridad: P2
Esfuerzo: 3-4 dias
Impacto: UX consistente

Implementacion:
1. Definir 3 patrones canonicos en STANDARD-UX-PATTERNS.md:
   a. PageSkeleton -- para carga inicial de pagina
   b. ComponentSkeleton -- para secciones individuales
   c. InlineSpinner -- para acciones puntuales
2. Crear componentes shared reutilizables
3. Migrar progresivamente portales
```

### 2.3 Error Handling

**Patrones detectados (WS08):**

| Patron | Donde |
|--------|-------|
| React Query `onError` + toast | Admin (parcial), Student |
| try/catch con setState | Teacher (legacy pages) |
| ErrorBoundary global | Todos (pero solo captura render errors) |
| Sin error handling | Parent (mayoria), Admin (algunos hooks) |
| Error generico sin contexto | Admin (useRoles, useReports) |

**Recomendacion H-005: Estandarizar Error Handling**

```
Prioridad: P1
Esfuerzo: 5-7 dias (refactor progresivo)
Impacto: Reliability y debuggability

Implementacion:
1. Definir ErrorHandler util con categorias:
   a. Network errors -> retry con exponential backoff (React Query default)
   b. Auth errors (401) -> redirect to login
   c. Permission errors (403) -> toast descriptivo
   d. Validation errors (422) -> form field errors
   e. Server errors (5xx) -> toast + log a analytics
2. Crear useErrorHandler() hook compartido
3. Integrar con React Query global onError
```

---

## 3. Inconsistencias de State Management

### 3.1 Mapa de Patrones por Portal

| Portal | React Query | Zustand | useState/useEffect | Mixto |
|--------|-------------|---------|---------------------|-------|
| Admin | 60% (RQ hooks) | 10% (notifications) | 30% (legacy) | Si |
| Teacher | 40% | 15% (calendar, resources) | 45% | Si |
| Student | 70% | 20% (gamification, exercise) | 10% | Menor |
| Parent | 0% | 100% (parentStore) | 0% | No (pero antipatron) |

### 3.2 Problemas Detectados

1. **Teacher hybrid:** Algunas paginas usan React Query para fetch + Zustand para UI, otras usan useState/useEffect directo con `fetch()`. No hay patron consistente.

2. **Parent isolation:** `parentStore` maneja TODO el estado (auth, data fetching, UI). Esto viola la separacion React Query (server) + Zustand (client) establecida en ADR-047.

3. **Admin Notifications:** `AdminNotificationsPage` usa `notificationsStore` (Zustand) para fetch de datos del servidor, cuando deberia usar React Query. El store fue disenado para estado push (WebSocket), no para polling.

4. **Dual Auth:** `AuthContext` + `authStore` coexisten y requieren sincronizacion manual en login/logout. Fuente de bugs sutiles.

**Recomendacion H-006: Normalizar State Management**

```
Prioridad: P2 (Teacher), P1 (Parent)
Esfuerzo: 5-8 dias por portal
Impacto: Mantenibilidad a largo plazo

Plan:
1. Parent: Migrar data fetching de parentStore a React Query hooks
   - Mantener parentStore solo para auth state y UI state
   - Crear useParentDashboard(), useChildProgress() como RQ hooks
2. Teacher: Identificar paginas con useState/useEffect directo
   - Migrar a React Query hooks progresivamente
   - Priorizar paginas de mayor trafico
3. Admin Notifications: Separar fetch (RQ) de push (Zustand)
```

---

## 4. Autenticacion y Rutas

### 4.1 Sistema Dual de Auth

| Aspecto | AuthContext | authStore (Zustand) | parentStore (Zustand) |
|---------|------------|---------------------|----------------------|
| Login | useAuth().login() | Sincronizado post-login | parentStore.login() |
| Logout | useAuth().logout() | Sincronizado post-logout | parentStore.logout() |
| Token storage | localStorage | localStorage (same key) | localStorage (distinto key?) |
| User data | AuthContext.user | authStore.user | parentStore.user |
| Usado por | Legacy components | ProtectedRoute, hooks | Solo Parent portal |

**Recomendacion H-007: Documentar o Unificar Auth**

```
Prioridad: P2
Esfuerzo: Decision ADR (1 dia) + implementacion (3-5 dias si se unifica)

Opciones:
A. Documentar como patron intencional (ADR existente?) y garantizar sincronizacion 100%
B. Migrar todo a authStore (Zustand) y eliminar AuthContext progresivamente
C. Migrar todo a AuthContext y eliminar authStore

Recomendacion: Opcion A a corto plazo (documentar), Opcion B a medio plazo
```

### 4.2 Redirect Issues

| Issue | Actual | Esperado | Impacto |
|-------|--------|----------|---------|
| Parent auth redirect | `/login` | `/parent/login` | Parent termina en login incorrecto |
| Parent forgot-password | `/forgot-password` | `/parent/forgot-password` | Ruta inexistente |
| BottomNavigation rutas | 2 rutas invalidas | Rutas validas | Navegacion rota en mobile |

**Recomendacion H-008: Corregir Redirects**

```
Prioridad: P0/P1
Esfuerzo: 1 dia

Implementacion:
1. ProtectedRoute: Agregar logica para detectar portal origin y redirigir a login correcto
2. ParentLoginPage: Corregir href de forgot-password
3. BottomNavigation: Corregir o eliminar rutas invalidas
```

---

## 5. Componentes Compartidos

### 5.1 Reutilizacion Actual

| Componente | Admin | Teacher | Student | Parent |
|------------|-------|---------|---------|--------|
| Modal | Si | Si | Si | Si |
| ProtectedRoute | Si | Si | Si | Si |
| ErrorBoundary | Si | Si | Si | Si |
| GamificationOverlay | Si (no deberia) | Si | Si | Si (no deberia) |
| ConfirmDialog | Si | Si | No (usa Modal) | No |
| FormField | Si | Si | Parcial | No |
| LoadingSpinner | Si | Si | Si | No |
| EmptyState | Si | Si | Si | No |
| AdminTabBar | Si | No (tiene TabBar propio) | No | No |
| DataTable | Si | Si | No | No |
| Toast (react-hot-toast) | Si | Si | Si | Parcial |

### 5.2 Gap de Reutilizacion en Parent

El portal Parent usa solo 3 componentes shared: Modal, ProtectedRoute, ErrorBoundary. Todo lo demas es custom. Esto resulta en:
- UI inconsistente con el resto de la plataforma
- Duplicacion de logica (loading, errors, formularios)
- Esfuerzo de mantenimiento multiplicado

**Recomendacion H-009: Incrementar Reutilizacion en Parent**

```
Prioridad: P2
Esfuerzo: 3-4 dias

Implementacion:
1. Adoptar LoadingSpinner, EmptyState, ConfirmDialog en Parent
2. Adoptar FormField para formularios de Parent
3. Adoptar toast pattern (react-hot-toast) consistente
4. Resultado: Parent usa ~10 shared components en vez de 3
```

### 5.3 GamificationOverlay Leak

**Hallazgo (WS08):** `GamificationOverlay` (animaciones de logros y rangos) se renderiza dentro de `ProtectedRoute`, que envuelve TODOS los portales. Esto significa que:
- En Admin: animaciones de gamificacion aparecen (irrelevante para admin)
- En Parent: animaciones de gamificacion aparecen (confuso para padres)

**Recomendacion H-010: Restringir GamificationOverlay**

```
Prioridad: P1
Esfuerzo: 0.5 dias

Implementacion:
1. Agregar prop `enableGamification` a ProtectedRoute
2. Solo habilitar en Student y Teacher (roles que interactuan con gamificacion)
3. O: mover GamificationOverlay fuera de ProtectedRoute, colocarlo solo en StudentPageShell y TeacherPageShell
```

---

## 6. Roadmap de Homologacion

### Fase 1: Quick Wins (1 semana)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| 1 | H-008: Corregir redirects (Parent auth) | 1 dia | P0 fix |
| 2 | H-010: Restringir GamificationOverlay | 0.5 dia | P1 fix |
| 3 | H-003: Integrar Parent al detective-theme | 2-3 dias | Visual consistency |

### Fase 2: Layout Unification (2 semanas)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| 4 | H-001: SharedPortalLayout (Admin+Teacher) | 3-5 dias | Elimina duplicacion |
| 5 | H-002: Unificar AdminPageShell | 2-3 dias | Patron consistente |
| 6 | H-004: Estandarizar loading states | 3-4 dias | UX consistente |

### Fase 3: Deep Homologation (3-4 semanas)

| # | Recomendacion | Esfuerzo | Impacto |
|---|--------------|----------|---------|
| 7 | H-005: Estandarizar error handling | 5-7 dias | Reliability |
| 8 | H-006: Normalizar state management | 5-8 dias | Mantenibilidad |
| 9 | H-009: Reutilizacion shared en Parent | 3-4 dias | Consistency |
| 10 | H-007: Documentar/unificar auth | 1-5 dias | Claridad |

### Totales Estimados

| Fase | Dias estimados | Prioridad |
|------|---------------|-----------|
| Fase 1 | 3-4 dias | Sprint actual |
| Fase 2 | 8-12 dias | Sprint siguiente |
| Fase 3 | 14-24 dias | Sprint 3-4 |
| **Total** | **25-40 dias** | 3-4 sprints |

---

## 7. Resumen de Recomendaciones

| ID | Titulo | Prioridad | Esfuerzo |
|----|--------|-----------|----------|
| H-001 | SharedPortalLayout (Admin+Teacher) | P1 | 3-5d |
| H-002 | Unificar AdminPageShell | P2 | 2-3d |
| H-003 | Parent al detective-theme | P1 | 2-3d |
| H-004 | Estandarizar loading states | P2 | 3-4d |
| H-005 | Estandarizar error handling | P1 | 5-7d |
| H-006 | Normalizar state management | P1/P2 | 5-8d |
| H-007 | Documentar/unificar auth | P2 | 1-5d |
| H-008 | Corregir redirects | P0/P1 | 1d |
| H-009 | Reutilizacion shared en Parent | P2 | 3-4d |
| H-010 | Restringir GamificationOverlay | P1 | 0.5d |
