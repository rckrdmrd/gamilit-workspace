# MAPEO DETALLADO DE ARCHIVOS FRONTEND

**Tarea:** TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION
**Fecha:** 2026-02-12
**Proposito:** Referencia para directivas de agentes y subagentes

---

## 1. Estructura Top-Level (`apps/frontend/src/`)

| Directorio | .tsx | .ts | Total | Proposito |
|-----------|------|-----|-------|-----------|
| `app/` | 2 | 1 | 3 | App root (AuthContext, BrandingProvider, routes) |
| `apps/` | 228 | 82 | 310 | Portal-specific code (admin, teacher, student, parent) |
| `components/` | 9 | 3 | 12 | Legacy/top-level components |
| `config/` | 0 | 4 | 4 | API config, env, firebase, webpush |
| `features/` | 147 | 107 | 254 | Domain features (auth, gamification, exercises, etc.) |
| `generated/` | 0 | 2 | 2 | Auto-generated API types |
| `hooks/` | 0 | 4 | 4 | Root hooks (useAchievements, useBranding, useFavicon) |
| `lib/` | 0 | 6 | 6 | API wrapper modules |
| `pages/` | 8 | 2 | 10 | Shared pages (auth, achievements, progress) |
| `services/` | 0 | 43 | 43 | API services + infrastructure |
| `shared/` | 72 | 82 | 154 | Shared components, hooks, types, utils, constants |
| `stories/` | 3 | 3 | 6 | Storybook stories + assets |
| `test/` | 0 | 1 | 1 | Test setup |
| `types/` | 0 | 5 | 5 | Root type definitions |
| `utils/` | 0 | 5 | 5 | Root utilities |
| **Total** | **517** | **483** | **1,000** | |

---

## 2. Portal Admin (`apps/admin/`) — 93 .tsx

### Componentes por Subdirectorio

| Subdirectorio | .tsx | Archivos Clave |
|--------------|------|----------------|
| components/advanced/ | 8 | ABTestingDashboard, FeatureFlagsPanel, TenantManagementPanel |
| components/alerts/ | 7 | AlertCard, AlertsList, AlertDetailsModal, ResolveAlertModal |
| components/analytics/ | 4 | EngagementTab, GamificationTab, OverviewTab, RetentionTab |
| components/assignments/ | 3 | AssignmentsTable, AssignmentDetailModal, AssignmentFilters |
| components/classroom-teacher/ | 2 | ClassroomTeachersTab, TeacherClassroomsTab |
| components/content/ | 5 | ExerciseContentEditor, ContentApprovalQueue, MediaLibraryManager |
| components/dashboard/ | 9 | AdminDashboardHero, SystemMetricsGrid, UserManagementTable |
| components/gamification/ | 6 | AchievementsTab, MayaRankEditModal, BulkUpdateDialog |
| components/institutions/ | 4 | InstitutionsTable, InstitutionDetailModal, InstitutionStats |
| components/monitoring/ | 9 | SystemPerformanceDashboard, ErrorTrackingPanel, LogsViewer |
| components/progress/ | 5 | ClassroomsView, StudentDetailView, OverviewView |
| components/reports/ | 3 | ReportGenerationForm, ReportsList, BetaBanner |
| components/roles/ | 4 | PermissionMatrix, RolesTable, RoleEditor |
| components/settings/ | 2 | GeneralSettings, SecuritySettings |
| components/users/ | 5 | UserDetailModal, CreateUserModal, BulkActionsPanel |
| layouts/ | 1 | AdminLayout |
| pages/ | 18 | AdminDashboardPage, AdminUsersPage, AdminAnalyticsPage, etc. |

### Hooks Admin (25)
- hooks/ — 25 custom hooks para admin portal

### API Services Admin
- Primario: `services/api/adminAPI.ts` (78 calls)
- Sub-APIs: `services/api/admin/classroomTeacherApi.ts` (9), `achievementsApi.ts` (3), `gamificationConfigApi.ts` (11)

---

## 3. Portal Teacher (`apps/teacher/`) — 68 .tsx

### Componentes por Subdirectorio

| Subdirectorio | .tsx | Archivos Clave |
|--------------|------|----------------|
| components/alerts/ | 2 | AlertCard, InterventionAlertsPanel |
| components/analytics/ | 3 | LearningAnalyticsDashboard, EngagementMetricsChart |
| components/assignments/ | 6 | AssignmentWizard, ImprovedAssignmentWizard, SubmissionsModal |
| components/collaboration/ | 2 | ParentCommunicationHub, ResourceSharingPanel |
| components/communication/ | 6 | MessageComposer, ConversationsList, FeedbackForm |
| components/dashboard/ | 10 | TeacherDashboardHero, ClassroomsGrid, CreateClassroomModal |
| components/monitoring/ | 7 | StudentMonitoringPanel, StudentDetailModal, SuspendStudentModal |
| components/progress/ | 4 | ClassProgressDashboard, StudentProgressList, ProgressChart |
| components/reports/ | 2 | ReportGenerator, ReportTemplateSelector |
| components/responses/ | 3 | ResponsesTable, ResponseDetailModal, ResponseFilters |
| components/review-panel/ | 2 | ReviewDetail, ReviewList |
| layouts/ | 1 | TeacherLayout |
| pages/ | 19 | TeacherDashboard, TeacherAssignments, TeacherAnalytics, etc. |

### Hooks Teacher (24)
- hooks/ — 24 custom hooks para teacher portal

### API Services Teacher (14 sub-APIs)
- `services/api/teacher/teacherApi.ts` (5), `classroomsApi.ts` (11), `assignmentsApi.ts` (11), `analyticsApi.ts` (8), `gradingApi.ts` (4), `manualReviewApi.ts` (11), `interventionAlertsApi.ts` (7), `teacherMessagesApi.ts` (8), `teacherContentApi.ts` (7), `studentProgressApi.ts` (5), `bonusCoinsApi.ts` (1), `exerciseResponsesApi.ts` (4), `reportsApi.ts` (5), `alertConfigApi.ts` (7)

---

## 4. Portal Student (`apps/student/`) — 63 .tsx

### Componentes por Subdirectorio

| Subdirectorio | .tsx | Archivos Clave |
|--------------|------|----------------|
| components/achievements/ | 5 | AchievementDetailModal, AchievementGrid, AchievementFilters |
| components/dashboard/ | 22 | MLCoinsWidget, ModulesSection, QuickActionsCard, RankProgressWidget |
| components/exercise/ | 4 | CompletionModal, ExerciseHeader, ExerciseSidebar, PowerUpEffects |
| components/gamification/ | 6 | GamificationHero, LeaderboardPreview, MLCoinsSection, RanksSection |
| components/interactions/ | 1 | SwipeableContainer |
| components/notifications/ | 2 | AchievementToast, CelebrationModal |
| components/progress/ | 1 | ModuleProgressCard |
| components/ root | 1 | PowerUpBar |
| pages/ | 20 | DashboardComplete, ExercisePage, ShopPage, MissionsPage, FriendsPage |

### Hooks Student (10)
- hooks/ — 10 custom hooks para student portal

---

## 5. Portal Parent (`apps/parent/`) — 4 .tsx

| Archivo | Proposito |
|---------|-----------|
| pages/ParentDashboardPage.tsx | Dashboard principal |
| pages/ChildProgressPage.tsx | Progreso del hijo |
| pages/ParentLoginPage.tsx | Login |
| pages/ParentRegisterPage.tsx | Registro |

### API Service Parent
- `features/parent/api/parentAPI.ts` (17 calls)
- `features/parent/store/parentStore.ts` (Zustand)

---

## 6. Features (`features/`) — 147 .tsx

### Gamification (109 .tsx) — Mas grande

| Subdominio | .tsx | Hooks | Store | API |
|-----------|------|-------|-------|-----|
| battles/ | 3 | 1 | battleStore | - |
| economy/ | 13 | 5 | economyStore | economyAPI, comodinesAPI, shopAPI, inventoryAPI |
| leaderboard/ | 4 | 0 | - | (via gamification.api) |
| missions/ | 6 | 1 | missionsStore | missionsAPI |
| ranks/ | 8 | 5 | ranksStore | ranksAPI |
| social/Achievements/ | 7 | - | achievementsStore | socialAPI |
| social/Friends/ | 7 | - | friendsStore | socialAPI |
| social/Guilds/ | 9 | - | guildsStore | socialAPI |
| social/Leaderboards/ | 14 | - | leaderboardsStore, newLeaderboardsStore | socialAPI |
| social/PowerUps/ | 6 | - | powerUpsStore | socialAPI |

### Auth (18 .tsx)
- components/: LoginForm, RegisterForm, PasswordInput, PermissionMatrix, UserTable
- examples/: DashboardExample, LoginExample, ProtectedRouteExample
- providers/: AuthProvider (lightweight session initializer)
- hooks/: 5 hooks, store/: authStore, api/: authAPI

### Admin Features (13 .tsx)
- branding/: BrandingSettingsPage, ColorPicker, LogoUploader, ThemePreview
- components/: ActivateUserModal, DeactivateUserModal
- lti/: AdminLtiPage, LtiConsumerForm, LtiConsumerList

### Exercises (4 .tsx)
- ExerciseFeedback, ExerciseGuide, ExerciseHeader, UnderConstructionExercise
- hooks/: 2 hooks

### Notifications (3 .tsx)
- NotificationBell, NotificationDropdown
- hooks/: 2 hooks, store/: notificationsStore

---

## 7. Shared (`shared/`) — 72 .tsx, 82 .ts

### Componentes (72 .tsx)

| Subdirectorio | .tsx | Archivos |
|--------------|------|----------|
| components/ (root) | 26 | Avatar, Button, Card, ErrorBoundary, Footer, Header, Input, Modal, ProgressCard, Sidebar, Skeleton, etc. |
| components/__tests__/ | 13 | Tests para los componentes root |
| components/base/ | 12 | ColorfulCard, DetectiveButton, ProgressBar, RankBadge, StatusBadge, Toast |
| components/celebrations/ | 1 | ConfettiCelebration |
| components/common/ | 7 | ConfirmDialog, DataTable, FeatureBadge, FormField |
| components/layout/ | 2 | GamifiedHeader, GamilitSidebar |
| components/loading/ | 1 | SkeletonCard |
| components/mechanics/ | 8 | ExerciseContentRenderer, FeedbackModal, HintSystem, MediaUploader, TimerWidget |
| components/media/ | 3 | AudioPlayer, VideoPlayer, NavigationPathViewer |
| components/timeline/ | 1 | ActivityTimeline |

### Hooks (11 archivos)
- `shared/hooks/` — useDebounce, useLocalStorage, useMediaQuery, etc.

### Types (27 archivos, 148 tipos)
- `shared/types/` — Types compartidos entre portales

### Utils (17 archivos)
- `shared/utils/` — cn, authCleanup, exerciseAdapter (904 lines), format, validation (420 lines), scoring, etc.

### Constants (7 archivos)
- `shared/constants/` — enums.constants (807 lines SSOT), colors, breakpoints, ranks, exerciseFeedback

### API (2 archivos)
- `shared/api/` — mediaApi, manualReviewApi

---

## 8. Services (`services/`) — 43 .ts

### API Services (31 archivos)

| Directorio | Archivos | Calls |
|-----------|----------|-------|
| services/api/ (root) | 14 | adminAPI(78), educationalAPI(18), progressAPI(20), contentAPI(17), ltiAPI(16), friendsAPI(10), teamsAPI(16), notificationsAPI(14), missionsAPI(6), profileAPI(8), passwordAPI(3), schoolsAPI(2), studentAssignmentsAPI(3), twoFactorAPI(6) |
| services/api/admin/ | 3 | classroomTeacherApi(9), achievementsApi(3), gamificationConfigApi(11) |
| services/api/teacher/ | 14 | teacherApi(5), classroomsApi(11), assignmentsApi(11), analyticsApi(8), gradingApi(4), manualReviewApi(11), interventionAlertsApi(7), teacherMessagesApi(8), teacherContentApi(7), studentProgressApi(5), bonusCoinsApi(1), exerciseResponsesApi(4), reportsApi(5), alertConfigApi(7) |

### Infraestructura (12 archivos, no contados como services)
- apiClient.ts, apiErrorHandler.ts, apiInterceptors.ts, apiTypes.ts, axios.instance.ts
- adminTypes.ts, adminSchemas.ts
- api.config.ts, api-types.ts, api-responses.ts
- NotificationService.ts (Push/Firebase)
- index.ts barrel

---

## 9. Mecanicas de Ejercicio (`features/mechanics/`) — 30 unicas

### Modulo 1: Comprension Literal (7 mecanicas, 16 .tsx)
- Crucigrama, SopaDeLetras, Timeline, OrdenSecuencias, ClasificacionPalabras, MapaConceptual, CompletarTexto

### Modulo 2: Comprension Inferencial (6 mecanicas, 9 .tsx)
- LecturaInferencial, CausaEfecto, PrediccionNarrativa, InferenciasMultiples, PuzzleContexto, AnalogiasVisual

### Modulo 3: Comprension Critica (5 mecanicas, 5 .tsx)
- TribunalOpiniones, QuizTikTok, DebateEstructurado, AnalisisArgumentos, EvaluacionFuentes

### Modulo 4: Literacidad Digital (5 mecanicas, 14 .tsx)
- InfografiaInteractiva, VerificadorFakeNews, NavegacionHipertextual, AnalisisMemes, BusquedaEficiente

### Modulo 5: Creacion y Expresion (3 mecanicas, 3 .tsx)
- DiarioMultimedia, ComicDigital, VideoCarta

### Auxiliar (4 mecanicas, 4 .tsx)
- Mecanicas cross-module compartidas

---

## 10. Configuracion Root (`apps/frontend/`)

| Archivo | Proposito Clave |
|---------|----------------|
| vite.config.ts | React SWC, 10 path aliases, proxy API:3006/WS, 5 vendor chunks |
| tsconfig.json | ES2020, strict, 11 path aliases |
| tsconfig.build.json | Relaxed for prod (strict disabled) |
| tailwind.config.js | Detective theme (25+ colors), Maya rank gradients, 12 shadows, 6 animations |
| eslint.config.js | TS-ESLint, react-hooks, react-refresh, storybook |
| vitest.config.ts | jsdom, v8 coverage 60% threshold |
| playwright.config.ts | ./e2e, parallel, CI retries |
| .env.example | 27 VITE_* vars (API, WS, JWT, Firebase, GA, Sentry, AI, test creds) |
| .env.production.example | HTTPS/WSS config for 74.208.126.102 |
| package.json | Node >=18, 27 deps, 36 devDeps, 26 scripts |

---

## 11. Referencia Rapida para Agentes

### Agente Frontend General
```
CONTEXTO CRITICO:
- src/shared/constants/enums.constants.ts (807 lines) = SSOT enums PostgreSQL
- src/services/api/apiClient.ts = HTTP client centralizado
- src/config/api.config.ts = API_ENDPOINTS registry
- src/app/providers/AuthContext.tsx = Auth principal (392 lines)
- src/shared/utils/exerciseAdapter.ts = Router mecanicas (904 lines)
```

### Agente Admin Portal
```
ROOT: apps/admin/
PAGES: 18 en pages/
COMPONENTS: 93 .tsx en components/
HOOKS: 25 en hooks/
API: adminAPI.ts (78 calls) + admin/ sub-APIs (3 files, 23 calls)
LAYOUT: AdminLayout.tsx
```

### Agente Teacher Portal
```
ROOT: apps/teacher/
PAGES: 19 en pages/
COMPONENTS: 68 .tsx en components/
HOOKS: 24 en hooks/
API: services/api/teacher/ (14 files, ~95 calls)
LAYOUT: TeacherLayout.tsx
```

### Agente Student Portal
```
ROOT: apps/student/
PAGES: 19+1 en pages/
COMPONENTS: 63 .tsx en components/
HOOKS: 10 en hooks/
API: educationalAPI + progressAPI + gamification APIs
LAYOUT: (uses shared GamifiedHeader + GamilitSidebar)
```

### Agente Gamification
```
ROOT: features/gamification/
COMPONENTS: 109 .tsx across 10 subdominios
STORES: 10 Zustand stores (battles, economy, ranks, achievements, friends, guilds, leaderboards x2, powerUps, missions)
HOOKS: 18 (battles:1, economy:5, missions:1, ranks:5, social:6)
API: economyAPI, comodinesAPI, shopAPI, inventoryAPI, ranksAPI, socialAPI (34 calls!)
```

---

*Generado por: Claude Code - TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION*
