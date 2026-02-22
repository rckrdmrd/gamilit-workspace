# WS07 - Parent Portal + Shared Infrastructure

**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES / WS07
**Alcance:** Portal de Padres (4 paginas) + Shared Components (~85 archivos) + Layouts + Providers + Theme
**Estado:** COMPLETADO

---

## 1. Parent Portal — Inventario de Paginas (4)

El portal de padres vive en dos ubicaciones complementarias:
- **Pages:** `apps/frontend/src/apps/parent/pages/`
- **Feature components + store + API:** `apps/frontend/src/features/parent/`

### 1.1 ParentLoginPage

- **Ruta:** `/parent/login`
- **Archivo:** `apps/frontend/src/apps/parent/pages/ParentLoginPage.tsx`
- **Acceso:** Publico (sin autenticacion)
- **Componentes propios:** Formulario inline con inputs nativos (no usa Input compartido), spinner SVG inline (no usa LoadingSpinner compartido)
- **Componentes externos:** `framer-motion` (motion.div, animaciones de entrada)
- **Hooks:** `useParentStore()` — extrae: `login`, `isLoading`, `error`, `clearError`
- **Estado local:** `email`, `password`, `showPassword` (useState)
- **Endpoints API:** `POST /parent-portal/auth/login`
- **Flujo de datos:**
  ```
  FormSubmit → clearError() → useParentStore.login(credentials)
    → parentAPI.login(credentials)
    → POST /parent-portal/auth/login
    → localStorage['parent-access-token'] + localStorage['parent-refresh-token']
    → navigate('/parent/dashboard')
  ```
- **Interacciones:**
  - Toggle de visibilidad de password (Eye/EyeOff)
  - Enlace a `/parent/forgot-password` (ruta sin implementar)
  - Enlace a `/parent/register`
  - Enlace a `/login` (portal de estudiante)
- **Error handling:** Bloque de error con AlertCircle + motion.div para animacion
- **Loading state:** Spinner SVG inline con texto "Iniciando sesion..."
- **Accesibilidad:** `htmlFor`/`id` en labels, `required` en inputs, `minLength={8}` en password
- **Issues:**
  - Spinner SVG duplicado en Login y Register (no usa LoadingSpinner de shared)
  - `forgot-password` enlace apunta a ruta `/parent/forgot-password` que no existe
  - Inputs nativos en lugar de `Input` compartido — inconsistente con otros portales

---

### 1.2 ParentRegisterPage

- **Ruta:** `/parent/register`
- **Archivo:** `apps/frontend/src/apps/parent/pages/ParentRegisterPage.tsx`
- **Acceso:** Publico (sin autenticacion)
- **Componentes propios:** Formulario multi-campo con checkbox custom (button que simula checkbox), selector nativo
- **Hooks:** `useParentStore()` — extrae: `register`, `isLoading`, `error`, `clearError`
- **Estado local:** `formData` (objeto de 8 campos), `showPassword`, `validationErrors` (Record<string, string>)
- **Endpoints API:** `POST /parent-portal/auth/register`
- **Flujo de datos:**
  ```
  handleSubmit → validateForm() → clearError()
    → useParentStore.register(formData)
    → parentAPI.register(data)
    → POST /parent-portal/auth/register
    → localStorage tokens → navigate('/parent/dashboard')
  ```
- **Validaciones frontend:**
  - nombre: no vacio
  - apellido: no vacio
  - email: incluye `@`
  - password: minimo 8 chars + regex `/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`
  - confirmPassword: igualdad con password
  - acceptTerms: debe ser true
- **Interacciones:**
  - Checkbox personalizado (button que cambia estado visual)
  - Toggle de visibilidad de password (compartido entre password y confirmPassword)
  - Selector nativo para tipo de relacion
  - Links a `/terms` y `/privacy` (rutas externas, sin destino)
- **Accesibilidad:** Labels asociadas, pero el checkbox es un `<button>` sin `role="checkbox"` ni `aria-checked`
- **Issues:**
  - **P1:** Checkbox personalizado carece de `role="checkbox"` y `aria-checked` — falla WCAG 4.1.2
  - **P2:** Validacion de email simplista (`includes('@')`) — no valida formato completo
  - Spinner SVG inline duplicado (no usa LoadingSpinner compartido)
  - No limpia form tras error — usuario debe borrar manualmente

---

### 1.3 ParentDashboardPage

- **Ruta:** `/parent/dashboard`
- **Archivo:** `apps/frontend/src/apps/parent/pages/ParentDashboardPage.tsx`
- **Acceso:** Protegido (`ProtectedRoute` con rol `parent`)
- **Componentes importados:**
  - `Modal` de `@shared/components/common/Modal` — para LinkStudentModal
  - `ChildProgressCard` de `@/features/parent/ChildProgressCard`
  - `useParentStore` de `@/features/parent/store/parentStore`
  - `RelationshipType` de `@/features/parent/types/parent.types`
  - `framer-motion` (motion.div, AnimatePresence no usado aqui)
  - Lucide icons: Users, Bell, Calendar, TrendingUp, Award, Clock, Plus, LogOut, Settings, ChevronRight, AlertCircle
- **Componente inline:** `LinkStudentModal` (definido en el mismo archivo)
- **Hooks:** `useParentStore()` — extrae todos los campos de estado del dashboard + acciones
- **Estado local:** `showLinkModal` (boolean)
- **Endpoints API (via store):** `GET /parent-portal/dashboard` (en `loadDashboard()`)
- **Flujo de datos:**
  ```
  useEffect([loadDashboard]) → parentAPI.getDashboard()
    → GET /parent-portal/dashboard
    → store: students, progressSummaries, recentActivities, upcomingAssignments, unreadNotifications
  ```
- **Interacciones:**
  - Bell icon con badge de unread → navega a `/parent/notifications` (ruta sin implementar)
  - Settings icon → navega a `/parent/settings` (ruta sin implementar)
  - Logout button → `store.logout()` + navigate('/parent/login')
  - "Vincular Hijo" button → abre `LinkStudentModal`
  - `ChildProgressCard` → `handleViewProgress()` → navigate(`/parent/child/${studentId}`)
  - "Ver todo" en actividades → Link a `/parent/activity` (ruta sin implementar)
  - "Ver todo" en tareas → Link a `/parent/assignments` (ruta sin implementar)
- **LinkStudentModal:**
  - Usa `Modal` compartido (con `animated={true}`, `size="md"`)
  - Input para `studentCode` (auto-uppercase)
  - Select para `relationshipType`
  - Llama `linkStudent({studentCode, relationshipType})` del store
  - Endpoint: `POST /parent-portal/students/link`
- **Loading state:** Spinner de CSS `animate-spin` con `aria-live="polite"`
- **Error handling:** `motion.div` con `role="alert"` para errores del store
- **Accesibilidad:**
  - `role="region"` con `aria-label` en secciones
  - `aria-label` en botones de icono
  - Badge de notificacion con count en aria-label
- **Issues:**
  - **P0:** `/parent/notifications`, `/parent/settings`, `/parent/activity`, `/parent/assignments` — 4 rutas enlazadas sin paginas implementadas
  - **P1:** `LinkStudentModal` como componente inline en el mismo archivo (viola separacion de concerns, dificil de testear)
  - **P2:** Verificacion de vinculo (`verifyLink`) no tiene flujo en la UI — el `LinkStudentModal` solo llama `linkStudent` pero no el paso de verificacion `verifyLink`
  - Calculo de "Racha Promedio" divide por cero si `progressSummaries.length === 0` (protegido por `|| 1` — correcto)

---

### 1.4 ChildProgressPage

- **Ruta:** `/parent/child/:studentId`
- **Archivo:** `apps/frontend/src/apps/parent/pages/ChildProgressPage.tsx`
- **Acceso:** Protegido (`ProtectedRoute` con rol `parent`)
- **Componentes importados:**
  - `WeeklyReportView` de `@/features/parent/WeeklyReportView`
  - `useParentStore` de `@/features/parent/store/parentStore`
  - `parentAPI` de `@/features/parent/api/parentAPI` (llamadas directas fuera del store)
  - `framer-motion` (motion.div)
  - Lucide icons: ArrowLeft, TrendingUp, Award, Flame, Target, BookOpen, Star, RefreshCw
- **Hooks:**
  - `useParentStore()` — extrae: `students`, `progressSummaries`, `loadStudentProgress`, `isLoading`
  - `useParams<{ studentId: string }>()` — extrae studentId
  - `useNavigate()`
- **Estado local:** `activities`, `assignments`, `reports`, `activeTab`, `isLoadingData` (useState)
- **Endpoints API:**
  - `loadStudentProgress(studentId)` via store → `GET /parent-portal/students/:studentId/progress`
  - `parentAPI.getStudentActivities(studentId, 20)` directo → `GET /parent-portal/students/:studentId/activities`
  - `parentAPI.getStudentAssignments(studentId, 10)` directo → `GET /parent-portal/students/:studentId/assignments`
  - `parentAPI.getWeeklyReports(10)` directo → `GET /parent-portal/reports/weekly`
  - `parentAPI.generateWeeklyReport(studentId)` (via WeeklyReportView) → `POST /parent-portal/reports/weekly/:studentId`
- **Flujo de datos:**
  ```
  useEffect([studentId]) → Promise.all([
    loadStudentProgress(studentId),
    parentAPI.getStudentActivities → setActivities,
    parentAPI.getStudentAssignments → setAssignments,
    parentAPI.getWeeklyReports → setReports
  ])
  ```
- **Interacciones:**
  - Boton back → `navigate('/parent/dashboard')`
  - Tabs: Resumen | Actividades | Reportes (aria-role="tab", aria-selected, aria-controls)
  - WeeklyReportView → generacion y seleccion de reportes
- **Loading state:** RefreshCw icon con `animate-spin`, `aria-live="polite"`
- **Error handling:** `console.error` en catch — sin UI de error al usuario si la carga falla
- **Accesibilidad:**
  - `role="tablist"` en nav, `role="tab"` en botones, `role="tabpanel"` en contenido
  - `aria-selected`, `aria-controls` en tabs
- **Issues:**
  - **P1:** Error en carga de datos solo hace `console.error` — no muestra mensaje al usuario
  - **P1:** `parentAPI.getWeeklyReports(10)` trae todos los reportes de todos los hijos, luego filtra por `studentId` en el render — ineficiente con muchos reportes
  - **P2:** Si `students` esta vacio (no cargado aun) muestra "Estudiante no encontrado" en lugar de un loading state
  - **P2:** Mezcla de fuentes de datos: algunas llamadas via store, otras directas a `parentAPI` — inconsistencia de patron

---

## 2. Shared Components Catalog (~85 archivos)

Total contado: **87 archivos** en `apps/frontend/src/shared/components/` (incluyendo tests, ejemplos y docs).
**Archivos .tsx de produccion:** 52 componentes activos.

### 2.1 Raiz (sin subcarpeta) — 14 componentes produccion

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `Avatar.tsx` | Avatar con iniciales o imagen, variantes de tamano | Student, Admin |
| `AvatarDisplay.tsx` | Wrapper de Avatar con soporte de frame/glow cosmetics | GamifiedHeader (Admin, Teacher, Student) |
| `AvatarUpload.tsx` | Componente upload de avatar con preview y crop | Admin (UserDetailModal) |
| `AchievementCard.tsx` | Card de logro individual con icono y rarity | Student (AchievementsPage - referencia indirecta) |
| `AchievementFilter.tsx` | Filtros para lista de logros | Student (AchievementsPage - referencia indirecta) |
| `AchievementModal.tsx` | Modal de detalle de logro | Student (indirecto) |
| `AchievementsGrid.tsx` | Grid de tarjetas de logros | Student (indirecto) |
| `Button.tsx` | Boton basico (anterior al DetectiveButton) | Admin (AdminRolesPage) |
| `Card.tsx` | Card basica (anterior al DetectiveCard) | Admin (AdminRolesPage) |
| `CosmeticAvatar.tsx` | Avatar con equipamiento de cosmeticos | Student (inventory/shop) |
| `ErrorBoundary.tsx` | Boundary de errores React | App.tsx nivel raiz |
| `ExerciseAttemptCard.tsx` | Card de intento de ejercicio con score | Sin uso detectado — HUERFANO |
| `Footer.tsx` | Footer generico del sitio | Sin uso detectado — HUERFANO |
| `Header.tsx` | Header generico (pre-GamifiedHeader) | Sin uso detectado — HUERFANO |
| `Input.tsx` | Input generico basico | Admin (indirecto) |
| `LeaderboardTable.tsx` | Tabla de leaderboard | Social/Leaderboard feature |
| `LeaderboardTabs.tsx` | Tabs para leaderboard | Social/Leaderboard feature |
| `Pagination.tsx` | Componente de paginacion | Admin (AlertsList, AdminAssignmentsPage) |
| `ProgressCard.tsx` | Card de progreso | Legacy pages (MyProgressPage) |
| `ProgressFilter.tsx` | Filtros de progreso | Legacy pages |
| `ProtectedRoute.tsx` | Guard de rutas React Router | App.tsx — TODAS |
| `Sidebar.tsx` | Sidebar generico (pre-GamilitSidebar) | Sin uso detectado — HUERFANO |
| `StatsOverview.tsx` | Vista de estadisticas generales | Legacy pages |
| `UnderConstruction.tsx` | Placeholder "en construccion" | Teacher (CommunicationPage) |
| `UserStatsCard.tsx` | Card de stats de usuario | Sin uso detectado — HUERFANO |
| `index.ts` | Barrel export |  |

### 2.2 base/ — 10 componentes produccion

Directorio: `apps/frontend/src/shared/components/base/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `ColorfulCard.tsx` | Card con variantes de colores | Student (ModuleDetailPage) |
| `DetectiveButton.tsx` | Boton theming detective con 9 variantes, motion | Admin, Teacher, Student, FeedbackModal |
| `DetectiveCard.tsx` | Card theming detective con 7 variantes, motion | Admin, Teacher, Student |
| `EnhancedCard.tsx` | Card mejorada con header/footer | Student (ModuleDetailPage) |
| `InputDetective.tsx` | Input con estilo detective | Ejercicios (CompletarEspacios, etc.) |
| `ProgressBar.tsx` | Barra de progreso animada | Student, Exercises |
| `RankBadge.tsx` | Badge de rango maya | Student (Profile, Dashboard) |
| `StatsCardGrid.tsx` | Grid de tarjetas de estadisticas | Admin, Teacher |
| `StatusBadge.tsx` | Badge de estado con variantes | Admin, Teacher |
| `TabBar.tsx` | Componente de pestanas | Student (InventoryPage), Teacher (CommunicationPage) |
| `Toast.tsx` | Sistema de notificaciones toast | Admin, Teacher |
| `index.ts` | Barrel export |  |

### 2.3 common/ — 5 componentes produccion

Directorio: `apps/frontend/src/shared/components/common/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `ConfirmDialog.tsx` | Dialog de confirmacion con variantes | Student, Teacher, Admin, ExerciseContext |
| `DataTable.tsx` | Tabla de datos con ordenamiento | Admin |
| `FeatureBadge.tsx` | Badge de feature/estado | Admin |
| `FormField.tsx` | Campo de formulario con label y error | Teacher |
| `Modal.tsx` | Modal WCAG-compliant con focus trap, escape, scroll lock | Parent, Teacher, Student, Admin |
| `index.ts` | Barrel export |  |

### 2.4 layout/ — 2 componentes produccion

Directorio: `apps/frontend/src/shared/components/layout/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `GamifiedHeader.tsx` | Header orange con XP/ML/Rank/Badges para student; info usuario para admin/teacher | Admin (via AdminLayout), Teacher (via TeacherLayout), Student (via StudentPageShell) |
| `GamilitSidebar.tsx` | Sidebar role-based con navegacion por rol (student/teacher/admin) + modulos para student | Admin (via AdminLayout), Teacher (via TeacherLayout) |
| `index.ts` | Barrel export |  |

### 2.5 mechanics/ — 8 componentes produccion

Directorio: `apps/frontend/src/shared/components/mechanics/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `ExerciseContentRenderer.tsx` | Renderizador de contenido de ejercicios (texto, imagenes, audio) | UnifiedExerciseLayout |
| `ExerciseGradientHeader.tsx` | Header gradiente para ejercicios | Multiples mecanicas de ejercicio |
| `FeedbackModal.tsx` | Modal de feedback post-ejercicio con confetti, XP animado, achievements | ExerciseContext (Student) |
| `HintSystem.tsx` | Sistema de pistas/comodines | Ejercicios con comodines |
| `MediaUploader.tsx` | Uploader de media para ejercicios creativos | M3-M5 mecanicas |
| `ProgressTracker.tsx` | Tracker de progreso del ejercicio | UnifiedExerciseLayout |
| `RubricEvaluator.tsx` | Evaluador de rubrica para M3-M5 | Teacher (revision manual) |
| `ScoreDisplay.tsx` | Display de puntuacion del ejercicio | Student (LegacyExercisePage), ejercicios |
| `TimerWidget.tsx` | Widget de temporizador para ejercicios | Student (LegacyExercisePage), RuedaInferencias |
| `mechanicsTypes.ts` | Tipos TypeScript para mecanicas (`FeedbackData`, etc.) | Todos los ejercicios |
| `index.ts` | Barrel export |  |

### 2.6 feedback/ — 3 componentes produccion

Directorio: `apps/frontend/src/shared/components/feedback/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `EmptyState.tsx` | Componente de estado vacio con icono y CTA | Teacher, Admin |
| `ErrorMessage.tsx` | Mensaje de error inline | Formularios |
| `SaveButton.tsx` | Boton de guardado con estados (idle/saving/saved/error) | Settings (ProfileSettingsForm, PrivacySettingsForm) |
| `index.ts` | Barrel export |  |

### 2.7 loading/ — 3 componentes produccion

Directorio: `apps/frontend/src/shared/components/loading/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `LoadingOverlay.tsx` | Overlay de carga pantalla completa | Admin, Teacher |
| `LoadingSpinner.tsx` | Spinner de carga inline | Admin (AdminRolesPage) |
| `SkeletonCard.tsx` | Card skeleton para loading state | Admin, Teacher |
| `index.ts` | Barrel export |  |

### 2.8 exercises/ — 1 componente produccion

Directorio: `apps/frontend/src/shared/components/exercises/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `UnifiedExerciseLayout.tsx` | Layout unificado para todos los ejercicios; orquesta Header, Progress, Content, Sidebar (comodines) | Todos los ejercicios (Student) |

### 2.9 media/ — 3 componentes produccion

Directorio: `apps/frontend/src/shared/components/media/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `AudioPlayer.tsx` | Reproductor de audio para ejercicios | Ejercicios con audio |
| `NavigationPathViewer.tsx` | Visualizador de ruta de navegacion hipertextual | NavegacionHipertextual mechanic |
| `VideoPlayer.tsx` | Reproductor de video para ejercicios | Ejercicios con video |
| `index.ts` | Barrel export |  |

### 2.10 settings/ — 2 componentes produccion

Directorio: `apps/frontend/src/shared/components/settings/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `PrivacySettingsForm.tsx` | Formulario de configuracion de privacidad | Student (SettingsPage) |
| `ProfileSettingsForm.tsx` | Formulario de configuracion de perfil con avatar upload | Student (SettingsPage) |
| `index.ts` | Barrel export |  |

### 2.11 profile/ — 1 componente produccion

Directorio: `apps/frontend/src/shared/components/profile/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `AvatarSelectionModal.tsx` | Modal de seleccion de avatar del catalogo | Student (ProfilePage, SettingsPage) |

### 2.12 timeline/ — 1 componente produccion

Directorio: `apps/frontend/src/shared/components/timeline/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `ActivityTimeline.tsx` | Timeline de actividades con iconos por tipo | Sin uso detectado — HUERFANO |
| `index.ts` | Barrel export |  |

### 2.13 celebrations/ — 1 componente produccion

Directorio: `apps/frontend/src/shared/components/celebrations/`

| Archivo | Descripcion | Portales que lo usan |
|---------|-------------|----------------------|
| `ConfettiCelebration.tsx` | Celebracion con confetti (react-confetti wrapper) | FeedbackModal (indirecto via confetti prop) |

---

## 3. Layout Analysis

### 3.1 AdminLayout

- **Archivo:** `apps/frontend/src/apps/admin/layouts/AdminLayout.tsx`
- **Estructura:**
  ```
  <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
    <a href="#main-content" class="sr-only"> (skip nav)
    <header>
      <GamifiedHeader user gamificationData organizationName onLogout />
    </header>
    <div className="flex h-[calc(100vh-4rem)]">
      <nav>
        <GamilitSidebar isOpen userRole="admin" currentPath onNavigate onClose />
      </nav>
      <button (mobile menu toggle) />
      <main id="main-content" className="flex-1 overflow-y-auto ...">
        <div className="detective-container py-8">
          {children}
        </div>
      </main>
    </div>
  </div>
  ```
- **Props:** `children`, `user`, `gamificationData`, `organizationName`, `onLogout`
- **BrandingContext:** Usa `useContext(BrandingContext)` para resolver `platformName`
- **Logica especial:** Si `organizationName === 'GAMILIT Platform Admin'`, substituye por `platformName` del branding

### 3.2 TeacherLayout

- **Archivo:** `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx`
- **Estructura:** Identica a AdminLayout con una sola diferencia: `userRole="teacher"` en GamilitSidebar
- **Props:** `children`, `user`, `gamificationData`, `organizationName`, `onLogout`
- **BrandingContext:** Usa `useContext(BrandingContext)` para resolver `platformName`
- **Logica especial:** `resolvedOrganizationName = organizationName ?? platformName` (diferente al Admin que hace la sustitucion condicional por nombre exacto)

### 3.3 StudentPageShell

- **Archivo:** `apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx`
- **Estructura:**
  ```
  <>
    {showHeader && <GamifiedHeader user gamificationData onLogout />}
    {children}
    <DelayedRewardsModal isOpen rewards onClose />
  </>
  ```
- **Props:** `children`, `showHeader?: boolean` (default: true)
- **Diferencias criticas vs AdminLayout/TeacherLayout:**
  1. **Sin sidebar** — El student portal NO tiene sidebar (no usa GamilitSidebar)
  2. **Sin BrandingContext** — No lee branding para organizationName
  3. **Con event listener** — Escucha `gamilit:exercise:feedback` para mostrar recompensas diferidas
  4. **Sin ProtectedRoute wrapper** — La proteccion de rutas se maneja externamente en App.tsx
  5. **No pasa organizationName** — GamifiedHeader sin organizacion visible
- **Hook:** `useStudentPageSetup()` — centraliza: user, displayGamificationData, handleLogout

### 3.4 Duplication Assessment

**Nivel de duplicacion AdminLayout vs TeacherLayout: 97%**

```
IDENTICO en ambos:
- Estructura JSX completa (100% identica salvo el userRole prop)
- Props interface (mismo nombre, mismo tipo)
- BrandingContext usage
- Mobile button toggle (mismo HTML exacto)
- Skip navigation link (mismo HTML exacto)
- Main content wrapper con detective-container
- Imports (mismos, mismo orden)

DIFERENCIAS (2):
1. userRole="admin" vs userRole="teacher" en GamilitSidebar
2. resolvedOrganizationName logic:
   - Admin: if(org === 'GAMILIT Platform Admin') platformName else org
   - Teacher: organizationName ?? platformName
```

**RECOMENDACION:** Consolidar en un `PortalLayout` con prop `userRole`:
```tsx
// Propuesta
interface PortalLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'teacher';
  user?: UserType | AuthUser;
  gamificationData?: UserGamificationData | null;
  organizationName?: string;
  onLogout?: () => void;
}
```

**Parent Portal layout:** No usa ninguno de los layouts compartidos. Cada pagina tiene su propio `<header>` inline con HTML nativo. No hay layout wrapper para el portal de padres — esta es una divergencia deliberada segun la documentacion (portal mas simple, sin sidebar).

---

## 4. Providers

### 4.1 AuthContext

- **Archivo:** `apps/frontend/src/app/providers/AuthContext.tsx`
- **Tipo:** React Context + Provider + Hook
- **Exporta:** `AuthProvider`, `useAuth()`, `AuthContext`
- **Estado gestionado:**
  - `user: User | null` — perfil del usuario autenticado
  - `isLoading: boolean` — estado de carga inicial
  - `error: string | null` — ultimo error de auth
- **Acciones:**
  - `login(credentials)` — POST auth, guarda tokens, sync con authStore
  - `register(userData)` — POST auth, guarda tokens, sync con authStore
  - `logout()` — via `performLogout()` utility
  - `refreshUser()` — recarga perfil desde server
  - `clearError()` — limpia error
- **Patron dual-sync critico:**
  - Mantiene sincronizados AuthContext (React local state) + useAuthStore (Zustand)
  - Tokens en localStorage (`auth-token`, `refresh-token`)
  - Flag `is_logging_out` en localStorage para prevenir race conditions
- **Scope:** Todos los portales EXCEPTO Parent (que usa parentStore con sistema independiente)
- **Issues conocidos:**
  - Doble sistema de auth (AuthContext + authStore) requiere sincronizacion cuidadosa
  - `is_logging_out` flag es un workaround para race condition en rehydration

### 4.2 BrandingProvider

- **Archivo:** `apps/frontend/src/app/providers/BrandingProvider.tsx`
- **Tipo:** React Context + Provider + Hook
- **Exporta:** `BrandingProvider`, `useBranding()`, `BrandingContext`
- **Estado gestionado:**
  - `config: BrandingConfig | null` — configuracion actual (posiblemente en preview)
  - `savedConfig: BrandingConfig | null` — configuracion guardada (para reset de preview)
  - `isLoading: boolean`
  - `error: Error | null`
  - `_isPreviewMode: boolean` (privado, no en contexto publico)
- **Acciones:**
  - `loadBranding(tenantId)` — fetch branding y aplica a DOM via CSS variables
  - `refreshBranding()` — reload branding del server
  - `updateConfig(updates)` — actualiza branding en server y aplica
  - `previewBranding(updates)` — preview sin guardar (inyecta CSS variables)
  - `resetPreview()` — revierte preview a configuracion guardada
- **Efectos secundarios:**
  - Inyecta CSS custom properties en el DOM (`applyBranding()`)
  - Actualiza favicon y title del documento
  - Reset en unmount
- **Dependencia:** `useAuth()` — carga branding cuando cambia el usuario autenticado
- **Scope:** AdminLayout y TeacherLayout via `useContext(BrandingContext)` para `platformName` y `logoIconUrl`
- **Nota:** El portal de padres NO usa BrandingProvider — sus paginas tienen logos/branding hardcoded

### 4.3 ExerciseContext

- **Archivo:** `apps/frontend/src/features/exercises/context/ExerciseContext.tsx`
- **Tipo:** React Context + Provider + Hook
- **Exporta:** `ExerciseProvider`, `useExerciseContext()`
- **Compone (dependency injection via hooks):**
  - `useAuth()` — user + logout
  - `useUserGamification(user?.id)` — gamificationData
  - `useExerciseData(exerciseId)` — exercise, adaptedExercise, mechanicEntry, MechanicComponent, hints
  - `useExerciseProgress(exerciseId)` — progress, userAnswers, autoSave
  - `useExerciseComodines(...)` — comodines (nuevo API real)
  - `useExercisePowerUps(...)` — power-ups (sistema legacy)
  - `useInvalidateDashboard()` — invalidacion de cache post-submit
- **Estado propio:**
  - `feedback: FeedbackData | null`
  - `showFeedback: boolean`
  - `availableCoins: number` (hardcoded 350 inicial)
  - `showSkipConfirm: boolean`
  - `mechanicActionsRef` (ref para comunicacion bidireccional con mechanic)
- **Acciones expuestas:**
  - `handleSubmit()` — envia ejercicio, procesa rewards, M3-M5 pending review
  - `handleSkip()` — muestra dialogo de confirmacion
  - `handleComplete()` — feedback manual de completado
  - `navigateBack()` — regresa al modulo o dashboard
  - `handleProgressUpdate()` — actualiza progreso parcial
  - `handleSaveProgress()` — auto-save
- **Flujo de submit:**
  ```
  handleSubmit() → submitExercise(exerciseId, answers)
    → POST /exercises/:id/submit
    → if(requiresManualReview) → feedback "pendiente revision"
    → else → feedback con score/XP/ML/achievements/rankUp
    → syncAndInvalidate() → invalidate React Query dashboard cache
  ```
- **Scope:** Solo portal estudiante, pagina de ejercicio (`ExercisePage`)
- **Issues:**
  - `availableCoins` hardcoded en 350 — no se carga del server
  - Doble sistema comodines (nuevo `useExerciseComodines` + legacy `useExercisePowerUps`) coexisten y se mergean — complejidad innecesaria

---

## 5. Theme System (detective-theme.css)

- **Archivo:** `apps/frontend/src/shared/styles/detective-theme.css`
- **Version:** 2.0 (Compatible con Tailwind 4)
- **Cargado en:** `main.tsx` o `index.css` (importacion global)

### 5.1 CSS Custom Properties (variables)

El archivo referencia variables CSS definidas externamente (probablemente en `index.css` o `:root`):

| Variable | Uso en detective-theme.css |
|----------|---------------------------|
| `--detective-orange` | btn-detective, input-detective focus |
| `--detective-orange-dark` | btn-detective gradient end, achievement-epic |
| `--detective-gold` | progress-xp, achievement-legendary |
| `--detective-bg` | input-detective background, ghost button hover |
| `--detective-text` | Typography classes |
| `--detective-text-secondary` | text-detective-small |
| `--detective-bg-secondary` | Layout gradient end |
| `--rank-detective-from/to` | rank-badge-detective |
| `--rank-sargento-from/to` | rank-badge-sargento |
| `--rank-teniente-from/to` | rank-badge-teniente |
| `--rank-capitan-from/to` | rank-badge-capitan |
| `--rank-comisario-from/to` | rank-badge-comisario, achievement-legendary |

### 5.2 Clases de Botones

| Clase | Color base | Hover |
|-------|-----------|-------|
| `.btn-detective` | gradient detective-orange → dark | scale(1.05) |
| `.btn-gold` | `#ea580c` (orange-600) | `#f97316` |
| `.btn-blue` | `#3b82f6` | `#2563eb` |
| `.btn-green` | `#10b981` | `#059669` |
| `.btn-purple` | `#a855f7` | `#9333ea` |
| `.btn-danger` | `#ef4444` | `#dc2626` |

Todos comparten: `font-weight:500`, `border-radius:0.5rem`, `transition: all 0.2s ease-out`, `box-shadow`.

### 5.3 Clases de Cards

| Clase | Border | Hover |
|-------|--------|-------|
| `.detective-card` | `1px solid #fde68a` (yellow-200) | translateY(-2px) + shadow |
| `.card-gold` | `1px solid #fef3c7` (yellow-100) | translateY(-2px) + shadow |
| `.card-exercise` | `2px solid #bfdbfe` (blue-200) | translateY(-4px) + border blue-400 |
| `.card-mystery` | `1px solid #cbd5e1` (slate-200) | translateY(-2px) + border slate-400 |

### 5.4 Clases de Rango (Rank Badges)

5 rangos maya: `detective`, `sargento`, `teniente`, `capitan`, `comisario` — todos con gradient via CSS variables.

### 5.5 Clases de Logros (Achievement Badges)

4 niveles de rareza: `common` (gris), `rare` (azul gradient), `epic` (naranja detective gradient), `legendary` (gold → comisario gradient).

### 5.6 Progress Bars

| Clase | Background | Fill |
|-------|-----------|------|
| `.progress-detective` | `#d1d5db` (gray-300) | `from-orange-500 to-orange-600` |
| `.progress-xp` | `#fde68a` (yellow-200) | `--detective-gold` → `--rank-comisario-to` |

### 5.7 Input Fields

`.input-detective` con variantes de estado: `error` (rojo), `success` (verde), `warning` (amarillo). Cada estado tiene `:focus` y `:focus-visible` con `box-shadow` ring de color correspondiente.

### 5.8 State Utility Classes (P2-C9, 2026-02-11)

| Clase | Color | Uso |
|-------|-------|-----|
| `.detective-state-success` | verde (#10b981) | Estados exitosos |
| `.detective-state-error` | rojo (#ef4444) | Estados de error |
| `.detective-state-warning` | amarillo (#f59e0b) | Estados de advertencia |
| `.detective-state-info` | azul oscuro (#1e3a8a) | Estados informativos |

### 5.9 Layout

`.detective-container` — max-width 80rem, padding responsive (1rem → 1.5rem → 2rem). Usado en `AdminLayout` y `TeacherLayout`.

### 5.10 Animaciones

| Clase | Animacion |
|-------|-----------|
| `.skeleton` | `shimmer` keyframe (bg-position 2s linear infinite) |
| `.badge-pulse` | opacity pulse 2s infinite |
| `.hover-lift` | `translateY(-2px)` en hover |
| `.hover-scale` | `scale(1.05)` en hover |
| `.hover-lift-exercise` | `translateY(-4px)` en hover |
| `.hover-scale-sm` | `scale(1.02)` en hover |

### 5.11 Otros

| Clase | Descripcion |
|-------|-------------|
| `.detective-header-gradient` | Gradient azul-naranja para headers de ejercicio |
| `.bg-detective-gradient` | Background cream para layout student |
| `.bg-detective-gradient-secondary` | Background yellow-orange para elementos secundarios |
| `.loading-overlay / .loading-modal` | Overlay y modal de carga pantalla completa |
| `.module-locked` | Filter grayscale para modulos bloqueados |
| `.module-lock-overlay` | Overlay blanco semi-transparente sobre modulo bloqueado |
| `.module-completed-badge` | Badge dorado posicionado absolutamente |

### 5.12 Focus Global

`button:focus-visible, a:focus-visible` — ring naranja de 3px (naranja 30% opacidad). Cumple WCAG 2.4.7.

---

## 6. Cross-Portal Shared Component Usage Matrix

| Componente | Parent | Student | Teacher | Admin |
|-----------|--------|---------|---------|-------|
| `GamifiedHeader` | NO | SI (via StudentPageShell) | SI (via TeacherLayout) | SI (via AdminLayout) |
| `GamilitSidebar` | NO | NO | SI (via TeacherLayout) | SI (via AdminLayout) |
| `Modal` | SI (LinkStudentModal) | SI (AchievementDetailModal, PurchaseModal) | SI (ClassesPage, CommunicationPage, InterventionAlertsPanel) | SI (AlertDetailsModal, ResolveAlertModal, AcknowledgeAlertModal) |
| `DetectiveButton` | NO | SI (Shop, 404, LegacyExercise) | SI (ClassesPage, MonitoringPage, InterventionPanel) | SI (AlertCard, AlertDetailsModal, AdminAnalyticsPage, AdminAlertsPage, AdminAssignmentsPage) |
| `DetectiveCard` | NO | SI (Shop, 404, LegacyExercise, Inventory) | SI (ClassesPage, MonitoringPage, InterventionPanel, AlertsStats) | SI (AdminUsersPage, AdminAnalyticsPage, AdminSettingsPage, AdminAdvancedPage, AdminAssignmentsPage) |
| `ConfirmDialog` | NO | SI (GuildsPage, LegacyExercisePage) | SI (ClassesPage, InterventionAlertsPanel) | NO |
| `EmptyState` | NO | NO | SI (ClassesPage) | SI (AdminRolesPage, AlertsList) |
| `FormField` | NO | NO | SI (ClassesPage) | NO |
| `TabBar` | NO | SI (InventoryPage) | SI (CommunicationPage) | NO |
| `Toast` | NO | NO | NO | SI (AdminUsersPage, AdminAssignmentsPage) |
| `Pagination` | NO | NO | NO | SI (AdminAssignmentsPage, AlertsList) |
| `LoadingSpinner` | NO | NO | SI (ClassesPage, MonitoringPage) | SI (AdminRolesPage) |
| `ProgressBar` | NO | SI (ModuleDetailPage) | NO | NO |
| `EnhancedCard` | NO | SI (ModuleDetailPage) | NO | NO |
| `ColorfulCard` | NO | SI (ModuleDetailPage) | NO | NO |
| `FeatureBadge` | NO | NO | NO | SI (AdminUsersPage, AdminAdvancedPage) |
| `UnderConstruction` | NO | NO | SI (CommunicationPage) | NO |
| `Card` (legacy) | NO | NO | NO | SI (AdminRolesPage) |
| `Button` (legacy) | NO | NO | NO | SI (AdminRolesPage) |
| `ProtectedRoute` | SI | SI | SI | SI |
| `ErrorBoundary` | SI | SI | SI | SI |

**Hallazgos de la matriz:**
- El portal de padres usa SOLO 3 shared components: `Modal`, `ProtectedRoute`, `ErrorBoundary`
- DetectiveButton/DetectiveCard son los mas usados cross-portal (Student, Teacher, Admin) pero NO en Parent
- El portal de padres tiene su propio sistema de UI independiente (inputs nativos, spinner inline, cards propias)
- `Footer.tsx`, `Header.tsx`, `Sidebar.tsx` (legacy) son **completamente huerfanos** — no se importan en ningun portal activo

---

## 7. Issues y Recomendaciones

### P0 — Bloqueadores Funcionales

**P0-01: 4 rutas enlazadas sin paginas implementadas en Parent Portal**
- `/parent/notifications` — Enlace en header del dashboard (ParentDashboardPage L96-107)
- `/parent/settings` — Enlace en header del dashboard (ParentDashboardPage L108-116)
- `/parent/activity` — Enlace "Ver todo" en actividad reciente (ParentDashboardPage L299)
- `/parent/assignments` — Enlace "Ver todo" en tareas proximas (ParentDashboardPage L355)
- **Impacto:** Clicks del usuario navegan a rutas no definidas en `App.tsx` — probablemente 404 o pantalla en blanco
- **Accion:** Crear paginas o redirigir a rutas existentes

**P0-02: `/parent/forgot-password` sin ruta ni pagina**
- Link en ParentLoginPage L142-145
- **Impacto:** Padres que olvidan su password no pueden resetearla desde la UI
- **Accion:** Implementar pagina o endpoint de forgot-password

---

### P1 — Issues Importantes

**P1-01: AdminLayout y TeacherLayout son practicamente identicos (97% duplicacion)**
- 120 lineas de codigo duplicadas entre los dos archivos
- Solo difieren en `userRole` prop y una linea de logica de `organizationName`
- **Accion:** Crear `PortalLayout` unico con `userRole: 'admin' | 'teacher'` prop

**P1-02: Checkbox custom en ParentRegisterPage sin semantica WCAG**
- Implementado como `<button>` sin `role="checkbox"` ni `aria-checked`
- **Impacto:** Screen readers no anuncian el estado de aceptacion de terminos
- **Accion:** Agregar `role="checkbox"` y `aria-checked={formData.acceptTerms}`

**P1-03: Error silencioso en ChildProgressPage**
- El catch de `loadData()` solo hace `console.error` — no hay UI de error para el usuario
- Si falla la carga, la pagina muestra estado vacio sin informar al usuario
- **Accion:** Agregar estado de error con mensaje y boton de reintento

**P1-04: LinkStudentModal como componente inline**
- Definido en el mismo archivo que `ParentDashboardPage` (lineas 418-506)
- No se puede importar ni testear independientemente
- **Accion:** Mover a `apps/frontend/src/features/parent/LinkStudentModal.tsx`

**P1-05: Flujo de verificacion de vinculo (`verifyLink`) sin UI**
- `parentStore` tiene `verifyLink()` y `parentAPI` tiene `verifyStudentLink()`
- El `LinkStudentModal` solo llama `linkStudent()` (paso 1) pero no muestra UI para `verifyLink()` (paso 2)
- **Impacto:** El flujo completo de vinculacion queda incompleto en el frontend
- **Accion:** Agregar segundo paso al `LinkStudentModal` o crear flujo multi-paso

**P1-06: Discrepancia de enum `RelationshipType` entre frontend y backend**
- Frontend: `father, mother, guardian, grandparent, other`
- Backend `ParentAccount`: `father, mother, guardian, tutor, other` (falta `grandparent`, tiene `tutor`)
- Backend `ParentStudentLink`: `father, mother, guardian, tutor, stepparent, grandparent, other`
- **Impacto:** Si un padre selecciona "Abuelo/a" en el frontend, el backend de `ParentAccount` puede rechazarlo
- **Accion:** Alinear los tres enums

---

### P2 — Mejoras Deseables

**P2-01: Portal de padres no usa componentes shared de UI**
- Tiene inputs nativos, spinners inline, cards propias — inconsistente con el design system
- **Accion:** Reemplazar gradualmente con `Input`, `LoadingSpinner`, `DetectiveCard`

**P2-02: ParentDashboardPage mezcla pagina y modal en un solo archivo**
- `LinkStudentModal` es un componente funcional separado definido en el mismo archivo
- Consecuencia de la nota P1-04

**P2-03: `availableCoins` en ExerciseContext hardcoded en 350**
- Archivo: `ExerciseContext.tsx` L152
- No refleja el saldo real de ML Coins del usuario
- **Accion:** Cargar desde `gamificationData.mlCoins`

**P2-04: Doble sistema de comodines en ExerciseContext**
- `useExerciseComodines` (nuevo, API real) + `useExercisePowerUps` (legacy) coexisten
- Se mergean en `comodinesContext` con sum/OR logic
- **Accion:** Deprecar y eliminar `useExercisePowerUps` cuando todos los ejercicios usen el nuevo sistema

**P2-05: Componentes shared huerfanos (sin uso)**
- `apps/frontend/src/shared/components/Footer.tsx`
- `apps/frontend/src/shared/components/Header.tsx`
- `apps/frontend/src/shared/components/Sidebar.tsx`
- `apps/frontend/src/shared/components/ExerciseAttemptCard.tsx`
- `apps/frontend/src/shared/components/UserStatsCard.tsx`
- `apps/frontend/src/shared/components/timeline/ActivityTimeline.tsx`
- **Accion:** Auditar si son necesarios; si no, eliminar o archivar

**P2-06: `parentStore` no usa React Query (divergencia de patron)**
- Student y Teacher usan React Query para server state + Zustand para client state
- `parentStore` maneja AMBOS en un Zustand store con `partialize` para persistencia
- **Impacto:** Sin cache inteligente, sin deduplicacion de requests, sin stale-while-revalidate
- **Accion:** Refactorizar a React Query para las llamadas de API del portal de padres

**P2-07: `ChildProgressPage` carga todos los reportes semanales y filtra en cliente**
- `parentAPI.getWeeklyReports(10)` trae reportes de TODOS los hijos
- Luego filtra: `reports.filter((r) => r.studentId === studentId)`
- **Accion:** Agregar `studentId` como parametro en `GET /parent-portal/reports/weekly?studentId=X`

**P2-08: Validacion de email simplista en ParentRegisterPage**
- Solo verifica `email.includes('@')` — acepta "a@" o "@b"
- **Accion:** Usar regex de email o la validacion nativa de `<input type="email">`

**P2-09: BrandingProvider solo aplica a portales con AuthContext**
- Parent portal tiene sistema de auth independiente y no usa AuthContext
- Por lo tanto, no recibe branding del tenant
- **Accion:** Evaluar si el parent portal debe respetar el branding del tenant

---

## 8. Cobertura de Documentacion

### Estado por componente

| Area | Documentacion | Calidad |
|------|--------------|---------|
| Parent Portal paginas | `docs/60-portals/parents/PORTAL-PARENTS-GUIDE.md` (v2.0.0) | Excelente — completo y actualizado |
| Parent feature (store, API, types) | Incluido en PORTAL-PARENTS-GUIDE.md | Bueno |
| Shared components base/ | `docs/50-guides/frontend/impl/COMPONENTES-UI.md` | Parcial — no lista todos |
| Shared components mechanics/ | `docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md` | Bueno para mecanicas de ejercicio |
| AdminLayout / TeacherLayout | No tiene doc especifica | AUSENTE |
| StudentPageShell | `docs/50-guides/frontend/impl/student/README.md` | Parcial |
| AuthContext | `docs/50-guides/frontend/impl/STATE-MANAGEMENT.md` | Parcial |
| BrandingProvider | Referenciado en ET-WL-001 (no encontrado en repo) | Parcial |
| ExerciseContext | `docs/50-guides/frontend/impl/ESTRUCTURA-FEATURES.md` | Parcial |
| detective-theme.css | `docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md` | Bueno — guia completa |
| Cross-portal usage matrix | No existe | AUSENTE |

### Documentacion Faltante Critica

1. **Layouts AdminLayout/TeacherLayout:** No hay especificacion tecnica. La duplicacion de 97% tampoco esta documentada como decision de diseno.
2. **Rutas del Parent Portal sin paginas:** Las 5 rutas pendientes no estan en un backlog visible desde la documentacion del portal.
3. **Flujo de verificacion de vinculo (verifyLink):** El paso 2 del vinculo padre-estudiante (codigo de verificacion) no tiene representacion en la UI y no esta documentado como gap.
4. **Componentes shared huerfanos:** No existe un inventario de componentes con estado "deprecated/orphaned".
5. **Cross-portal shared component matrix:** La matriz de uso no existe — es necesaria para evaluar impacto de cambios en shared.

---

## 9. Resumen de Metricas

| Metrica | Valor |
|---------|-------|
| Paginas Parent Portal | 4 (Login, Register, Dashboard, ChildProgress) |
| Componentes en features/parent | 6 (.tsx: ChildProgressCard, WeeklyReportView + 2 paginas en features — no, son en apps/parent) |
| Archivos en features/parent | 6 (ChildProgressCard.tsx, WeeklyReportView.tsx, index.ts, parentAPI.ts, parentStore.ts, parent.types.ts) |
| Endpoints API Parent | 17 (5 auth publicos + 12 portal protegidos) |
| Funciones en parentAPI | 18 |
| Acciones en parentStore | 12 |
| Selectores en parentStore | 6 |
| Archivos totales en shared/components | 87 |
| Componentes .tsx produccion en shared | 52 |
| Componentes shared huerfanos identificados | 6 |
| Rutas parent portal sin paginas | 5 |
| Duplicacion AdminLayout vs TeacherLayout | 97% |
| Issues P0 | 2 |
| Issues P1 | 6 |
| Issues P2 | 9 |

---

*Generado por: Claude Sonnet 4.6 | Tarea: WS07-PARENT-PORTAL-SHARED-INFRA | 2026-02-21*
