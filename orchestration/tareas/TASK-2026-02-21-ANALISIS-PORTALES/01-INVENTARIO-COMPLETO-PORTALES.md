# 01 - Inventario Completo de Portales Frontend

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** WS01-WS08 consolidados

---

## 1. Portal Admin (19 paginas)

### 1.1 Paginas

| # | Pagina | Ruta | Ubicacion | Workstream |
|---|--------|------|-----------|------------|
| 1 | AdminDashboardPage | `/admin/dashboard` | `apps/admin/pages/` | WS01 |
| 2 | AdminMonitoringPage | `/admin/monitoring` | `apps/admin/pages/` | WS01 |
| 3 | AdminAnalyticsPage | `/admin/analytics` | `apps/admin/pages/` | WS01 |
| 4 | AdminAuditLogsPage | `/admin/audit-logs` | `apps/admin/pages/` | WS01 |
| 5 | AdminUsersPage | `/admin/users` | `apps/admin/pages/` | WS02 |
| 6 | AdminRolesPage | `/admin/roles` | `apps/admin/pages/` | WS02 |
| 7 | AdminInstitutionsPage | `/admin/institutions` | `apps/admin/pages/` | WS02 |
| 8 | AdminClassroomTeacherPage | `/admin/classroom-teacher` | `apps/admin/pages/` | WS02 |
| 9 | AdminContentPage | `/admin/content` | `apps/admin/pages/` | WS03 |
| 10 | AdminExerciseCreatePage | `/admin/exercises/create` | `apps/admin/pages/` | WS03 |
| 11 | AdminGamificationPage | `/admin/gamification` | `apps/admin/pages/` | WS03 |
| 12 | AdminAssignmentsPage | `/admin/assignments` | `apps/admin/pages/` | WS03 |
| 13 | AdminProgressPage | `/admin/progress` | `apps/admin/pages/` | WS03 |
| 14 | AdminSettingsPage | `/admin/settings` | `apps/admin/pages/` | WS04 |
| 15 | AdminAlertsPage | `/admin/alerts` | `apps/admin/pages/` | WS04 |
| 16 | AdminNotificationsPage | `/admin/notifications` | `apps/admin/pages/` | WS04 |
| 17 | AdminNotificationPreferencesPage | `/admin/notification-preferences` | `apps/admin/pages/` | WS04 |
| 18 | AdminReportsPage | `/admin/reports` | `apps/admin/pages/` | WS04 |
| 19 | AdminAdvancedPage | `/admin/advanced` | `apps/admin/pages/` | WS04 |

**Paginas adicionales en `features/admin/`:** BrandingSettingsPage, AdminLtiPage (rutas bajo `/admin/` pero ubicadas fuera de `apps/admin/pages/`).

### 1.2 Componentes (por workstream)

#### WS01 - Dashboard/Monitoring (~26 componentes, 14 huerfanos)

| Componente | Estado | Notas |
|------------|--------|-------|
| DashboardStatsGrid | Activo | Admin dashboard main stats |
| SystemHealthCard | Activo | Health check card |
| AlertsNotificationsCard | Activo | Alertas rapidas |
| DashboardQuickActions | Activo | Accesos rapidos |
| LogsViewer | Activo (P1) | Duplica funcionalidad de AuditLogsPage |
| MetricsTab | Activo | Metricas del sistema |
| ErrorTrackingTab | Activo (P1) | Period selector decorativo |
| AdminDashboardHero | **Huerfano** | No importado |
| SystemMetricsGrid | **Huerfano** | No importado |
| PlatformMetrics | **Huerfano** | No importado |
| AnalyticsCharts | **Huerfano** | No importado |
| ActivityFeed | **Huerfano** | No importado |
| UserGrowthChart | **Huerfano** | No importado |
| ResourceMonitor | **Huerfano** | No importado |
| (+ 7 mas huerfanos) | **Huerfano** | Documentados en WS01 |

#### WS02 - Users/Roles/Institutions (19 componentes)

| Componente | Estado |
|------------|--------|
| UsersStatsGrid | Activo |
| UsersSearchFilters | Activo |
| UsersTable | Activo |
| CreateUserModal | Activo |
| UserDetailModal | Activo |
| BulkActionsPanel | Activo |
| RolesTable | Activo |
| RoleEditor | Activo |
| InstitutionFilters | Activo |
| InstitutionsTable | Activo |
| InstitutionFormModals | Activo |
| InstitutionDetailModal | Activo |
| ClassroomTeachersTab | Activo |
| TeacherClassroomsTab | Activo |
| (+ 5 mas) | Activo |

#### WS03 - Content/Exercises/Gamification (42 componentes)

| Componente | Estado |
|------------|--------|
| PendingExercisesTab | Activo |
| ContentPreviewModal | Activo |
| MediaLibraryTab | Activo |
| ContentVersionsTab | Activo |
| StepBasicInfo | Activo |
| ExerciseTypeSelector | Activo (P1: solo 17 de 23+ tipos) |
| ExercisePreview | Activo |
| TYPE_CONFIG_MAP components (17) | Activo |
| RanksTab | Activo |
| AchievementsTab | Activo |
| EconomyTab | Activo |
| StatsTab | Activo |
| MayaRankEditModal | Activo |
| ParameterEditModal | Activo |
| AssignmentFiltersComponent | Activo |
| AssignmentsTable | Activo |
| AssignmentDetailModal | Activo |
| (+ exercise builder files x25) | Activo |

#### WS04 - Settings/Alerts/Advanced (15 componentes)

| Componente | Estado |
|------------|--------|
| GeneralSettings | Activo |
| SecuritySettings | Activo |
| ProfileSettings | Activo |
| AlertsStats | Activo |
| AlertFilters | Activo |
| AlertsList | Activo |
| AlertDetailsModal | Activo |
| AcknowledgeAlertModal | Activo |
| ResolveAlertModal | Activo |
| NotificationHeader | Activo |
| NotificationFilters | Activo |
| NotificationItem | Activo |
| ReportGenerationForm | Activo |
| ReportsList | Activo |
| FeatureFlagsManager | Activo (P0: mock data) |

### 1.3 Hooks Admin (~32 hooks)

| Hook | Workstream | Estado |
|------|------------|--------|
| useAdminDashboard | WS01 | Activo (P1: AND-gate loading) |
| useSystemMonitoring | WS01 | **Huerfano** |
| useSystemMetrics | WS01 | **Huerfano** |
| useHealthStatus | WS01 | **Huerfano** |
| useAdminData | WS01 | **Huerfano** |
| useUserManagement | WS02 | Activo |
| useUserActions | WS02 | Activo |
| useCreateUserFlow | WS02 | Activo |
| useRoles | WS02 | Activo |
| useRolePermissions | WS02 | **P0: anti-patron** |
| useInstitutionActions | WS02 | Activo |
| usePendingExercisesQuery | WS03 | Activo |
| useGamificationConfig | WS03 | Activo |
| useAssignments | WS03 | Activo |
| useAssignmentsStats | WS03 | Activo |
| useMonitoring | WS04 | Activo |
| useAlerts | WS04 | Activo |
| useReports | WS04 | Activo |
| useSystemConfig | WS04 | Activo |
| useBranding | WS04 | Activo |
| useLtiConsumers | WS04 | Activo |
| useNotificationsStore | WS04 | Activo (Zustand) |
| (+ ~10 mas) | Various | Activo |

---

## 2. Portal Teacher (19 paginas)

### 2.1 Paginas

| # | Pagina | Ruta | Workstream |
|---|--------|------|------------|
| 1 | TeacherDashboardPage | `/teacher/dashboard` | WS05 |
| 2 | TeacherClassesPage | `/teacher/classes` | WS05 |
| 3 | TeacherStudentsPage | `/teacher/students` | WS05 |
| 4 | TeacherAssignmentsPage | `/teacher/assignments` | WS05 |
| 5 | TeacherProgressPage | `/teacher/progress` | WS05 |
| 6 | TeacherReviewPanelPage | `/teacher/reviews` | WS05 |
| 7 | TeacherReportsPage | `/teacher/reports` | WS05 (P0) |
| 8 | TeacherContentPage | `/teacher/content` | WS05 |
| 9 | TeacherContentManagementPage | `/teacher/content-management` | WS05 |
| 10 | TeacherExerciseResponsesPage | `/teacher/exercise-responses` | WS05 |
| 11 | TeacherCommunicationPage | `/teacher/communication` | WS05 |
| 12 | TeacherGamificationPage | `/teacher/gamification` | WS05 |
| 13 | TeacherNotificationsPage | `/teacher/notifications` | WS05 |
| 14 | TeacherNotificationPreferencesPage | `/teacher/notification-preferences` | WS05 |
| 15 | TeacherAlertConfigPage | `/teacher/settings/alerts` | WS05 |
| 16 | TeacherProfilePage | `/teacher/profile` | WS05 |
| 17 | TeacherSettingsPage | `/teacher/settings` | WS05 |
| 18 | TeacherCalendarPage | `/teacher/calendar` | WS05 |
| 19 | TeacherResourcesPage | `/teacher/resources` | WS05 |

### 2.2 Componentes (50 principales)

| Componente | Funcion |
|------------|---------|
| TeacherPageShell | Layout wrapper |
| DashboardStatsSection | Stats del dashboard |
| DashboardClassroomsList | Lista de aulas en dashboard |
| DashboardRecentActivity | Actividad reciente |
| ImprovedAssignmentWizard | Wizard 4 pasos para asignaciones |
| ReviewList | Lista de revisiones pendientes |
| ReviewDetail | Detalle de revision con rubrica |
| LearningAnalyticsDashboard | Dashboard de analiticas |
| StudentMonitoringPanel | Monitoreo en tiempo real |
| InterventionAlertsPanel | Alertas de intervencion |
| AssignmentCreator | Creador de asignaciones |
| ResourceSharingPanel | Panel de recursos compartidos |
| GradeSubmissionModal | Modal de calificacion |
| ReportGenerator | Generador de reportes |
| RecentReportsTable | Tabla de reportes recientes |
| ScheduledReportsTab | Tab de reportes programados |
| SharedReportsTab | Tab de reportes compartidos |
| MessageComposer | Compositor de mensajes |
| ConversationsList | Lista de conversaciones |
| ClassProgressDashboard | Dashboard de progreso por aula |
| (+ ~30 mas) | Varios |

### 2.3 Hooks Teacher (25 hooks)

| Hook | Funcion | Estado |
|------|---------|--------|
| useTeacherDashboard | Datos del dashboard | Activo |
| useClassrooms | CRUD de aulas | Activo |
| useAssignments | Gestion de asignaciones | Activo |
| useDashboardData | Datos tabulados | Activo |
| useMyReviews | Revisiones del docente | Activo |
| useManualReviewDetail | Detalle de revision | Activo |
| useManualReviewConfig | Config de revision manual | Activo |
| useTeacherMessages | Mensajes y comunicacion | Activo |
| useWebSocket | Conexion Socket.IO | Activo |
| useTeacherReports (reportsApi) | Reportes | Activo |
| (+ ~15 mas) | Varios | Activo |

---

## 3. Portal Student (24 paginas)

### 3.1 Paginas

| # | Pagina | Ruta | Workstream |
|---|--------|------|------------|
| 1 | DashboardComplete | `/dashboard` | WS06 |
| 2 | LearningPage | `/learning` | WS06 |
| 3 | ModuleDetailPage | `/modules/:moduleId` | WS06 |
| 4 | ExercisePage | `/exercises/:exerciseId` | WS06 |
| 5 | MyProgressPage | `/progress` | WS06 |
| 6 | ModuleDetailsPage | `/progress/modules/:moduleId` | WS06 |
| 7 | AchievementsPage | `/achievements` | WS06 |
| 8 | MissionsPage | `/missions` | WS06 |
| 9 | LeaderboardPage | `/leaderboard` | WS06 |
| 10 | ShopPage | `/shop` | WS06 |
| 11 | InventoryPage | `/inventory` | WS06 |
| 12 | AssignmentsPage | `/assignments` | WS06 |
| 13 | AssignmentDetailPage | `/assignments/:id` | WS06 |
| 14 | FriendsPage | `/friends` | WS06 |
| 15 | GuildsPage | `/guilds` | WS06 |
| 16 | EnhancedProfilePage | `/profile` | WS06 |
| 17 | SettingsPage | `/settings` | WS06 |
| 18 | NotificationsPage | `/notifications` | WS06 |
| 19 | StorePurchaseHistoryPage | `/shop/history` | WS06 |
| 20 | ItemDetailPage | `/shop/items/:id` | WS06 |
| 21 | ChallengesPage | `/challenges` | WS06 |
| 22 | GuildDetailPage | `/guilds/:id` | WS06 |
| 23 | CalendarPage | `/calendar` | WS06 |
| 24 | HelpPage | `/help` | WS06 |

**Codigo muerto:** LegacyExercisePage (993 lineas, no routed, no imported).

### 3.2 Mecanicas de Ejercicio (34 total)

#### Modulo 1 - Comprension Literal (7 mecanicas)

| Mecanica | Componente | Auto-scoring |
|----------|-----------|--------------|
| Completar Espacios | CompletarEspaciosExercise | Si |
| Crucigrama | CrucigramaExercise | Si |
| Emparejamiento | EmparejamientoExercise | Si |
| Mapa Conceptual | MapaConceptualExercise | Si |
| Sopa de Letras | SopaLetrasExercise | Si |
| Timeline | TimelineExercise | Si |
| Verdadero/Falso | VerdaderoFalsoExercise | Si |

#### Modulo 2 - Comprension Inferencial (6 mecanicas)

| Mecanica | Componente | Auto-scoring |
|----------|-----------|--------------|
| Causa-Efecto | CausaEfectoExercise | Si |
| Detective Textual | DetectiveTextualExercise | Si |
| Lectura Inferencial | LecturaInferencialExercise | Si |
| Prediccion Narrativa | PrediccionNarrativaExercise | Si |
| Puzzle de Contexto | PuzzleContextoExercise | Si |
| Rueda de Inferencias | RuedaInferenciasExercise | Si |

#### Modulo 3 - Comprension Critica (5 mecanicas)

| Mecanica | Componente | Revision Manual |
|----------|-----------|----------------|
| Analisis de Fuentes | AnalisisFuentesExercise | Si |
| Debate Digital | DebateDigitalExercise | Si |
| Matriz de Perspectivas | MatrizPerspectivasExercise | Si |
| Podcast Argumentativo | PodcastArgumentativoExercise | Si |
| Tribunal de Opiniones | TribunalOpinionesExercise | Si |

#### Modulo 4 - Alfabetizacion Digital (5 mecanicas)

| Mecanica | Componente | Revision Manual |
|----------|-----------|----------------|
| Analisis de Memes | AnalisisMemesExercise | Si |
| Infografia Interactiva | InfografiaInteractivaExercise | Si |
| Navegacion Hipertextual | NavegacionHipertextualExercise | Si |
| Quiz TikTok | QuizTikTokExercise | Si |
| Verificador Fake News | VerificadorFakeNewsExercise | Si |

#### Modulo 5 - Produccion Creativa (3 mecanicas)

| Mecanica | Componente | Revision Manual |
|----------|-----------|----------------|
| Comic Digital | ComicDigitalExercise | Si |
| Diario Multimedia | DiarioMultimediaExercise | Si |
| Video Carta | VideoCartaExercise | Si |

#### Auxiliares (4 componentes)

| Componente | Modulo | Funcion |
|------------|--------|---------|
| CrucigramaClue | M1 | Pistas del crucigrama |
| MatchingCard | M1 | Tarjeta de emparejamiento |
| ConceptNode | M1 | Nodo de mapa conceptual |
| TimelineEvent | M1 | Evento de timeline |

**No registrado:** VerdaderoFalsoExercise.SECURE.tsx (existe en filesystem pero no en registry).

### 3.3 Componentes Student (~83 de feature)

| Grupo | Componentes | Notas |
|-------|-------------|-------|
| Dashboard | EnhancedStatsGrid, RankProgressWidget, ModulesSection, MissionsPanel, RecentActivityPanel, QuickActionsWidget | Core dashboard |
| Exercise System | ExerciseProvider, ExerciseLayout, ExerciseHeader, ConsumablesPanel, UnifiedExerciseLayout, FeedbackModal, ProgressTracker, ScoreDisplay, TimerWidget, ExerciseGradientHeader | Registry-based |
| Gamification | AchievementCard, AchievementFilter, AchievementModal, ShopItemCard, PurchaseModal, LeaderboardLayout, LeaderboardTabs, MissionGrid, MissionCard, ActiveMissionTracker | Gamification UI |
| Social | FriendsPage subcomponents, GuildsPage subcomponents | Social features |
| Profile | EnhancedProfilePage subcomponents | Perfil mejorado |
| Navigation | StudentPageShell, BottomNavigation | Layout y nav |

### 3.4 Hooks Student (14 de feature)

| Hook | Funcion |
|------|---------|
| useDashboardData | Datos del dashboard |
| useMissions | Misiones del estudiante |
| useUserModules | Modulos del usuario |
| useRecentActivities | Actividad reciente |
| useExerciseData | Datos del ejercicio |
| useExerciseProgress | Progreso del ejercicio |
| useExerciseComodines | Comodines/power-ups |
| useAchievements | Logros del estudiante |
| useAchievementFilters | Filtros de logros |
| useLeaderboards | Rankings |
| useCoins | Balance de ML Coins |
| useShopData | Datos de la tienda |
| useShopPurchase | Compra en tienda |
| useInvalidateDashboard | Invalidacion de cache RQ |

---

## 4. Portal Parent (4 paginas)

### 4.1 Paginas

| # | Pagina | Ruta | Workstream |
|---|--------|------|------------|
| 1 | ParentLoginPage | `/parent/login` | WS07 |
| 2 | ParentRegisterPage | `/parent/register` | WS07 |
| 3 | ParentDashboardPage | `/parent/dashboard` | WS07 |
| 4 | ChildProgressPage | `/parent/child/:studentId` | WS07 |

### 4.2 Componentes Parent (~6 de feature)

| Componente | Funcion |
|------------|---------|
| ChildProgressCard | Card de progreso del hijo |
| WeeklyReportView | Vista de reporte semanal |
| LinkStudentModal | Modal de vinculacion |
| NotificationPreferences | Preferencias de notificaciones |
| ParentHeader | Header del portal |
| ParentLoginForm | Formulario de login |

### 4.3 Estado

| Elemento | Tipo | Notas |
|----------|------|-------|
| parentStore | Zustand | Store independiente del auth principal |
| parentAPI | API service | API dedicada, no usa shared API infrastructure |

---

## 5. Shared Infrastructure (52 componentes)

### 5.1 Componentes Compartidos Activos

| Componente | Usado por | Notas |
|------------|-----------|-------|
| Modal | Admin, Teacher, Student, Parent | Universal |
| ProtectedRoute | Admin, Teacher, Student, Parent | RBAC + WebSocket |
| ErrorBoundary | Admin, Teacher, Student, Parent | Universal |
| GamificationOverlay | Admin, Teacher, Student, Parent | P2: renderiza en admin/parent |
| AdminLayout | Admin | 97% identico a TeacherLayout |
| TeacherLayout | Teacher | 97% identico a AdminLayout |
| StudentPageShell | Student | Sin sidebar |
| AdminPageShell | Admin (parcial) | Usado en `apps/admin/` |
| AdminTabBar | Admin | Navegacion por tabs |
| TabBar | Teacher | Navegacion por tabs |
| LoginPage | Admin, Teacher, Student | Shared auth |
| LoginForm | Admin, Teacher, Student | react-hook-form + zod |
| ConfirmDialog | Admin, Teacher | Confirmacion de acciones |
| FormField | Admin, Teacher | Campos de formulario |
| LoadingSpinner | Todos | Indicador de carga |
| EmptyState | Todos | Estado vacio |

### 5.2 Componentes Huerfanos Compartidos (6)

| Componente | Notas |
|------------|-------|
| Footer | No importado por ningun portal |
| Header | No importado (cada portal tiene el suyo) |
| Sidebar | No importado (legacy) |
| ExerciseAttemptCard | No importado |
| UserStatsCard | No importado |
| ActivityTimeline | No importado |

### 5.3 API Services (67 archivos)

| Categoria | Ubicacion | Archivos | Documentados |
|-----------|-----------|----------|-------------|
| Core API | `services/api/` | ~30 | 37 (parcial) |
| Shared API | `shared/api/` | ~20 | Parcial |
| Feature API | `features/*/api/` | ~17 | Minimo |
| **Total** | -- | **67** | **37/67 (55%)** |

### 5.4 Zustand Stores (13 activos)

| Store | Portal | Funcion |
|-------|--------|---------|
| authStore | Cross-portal | Estado de autenticacion |
| notificationsStore | Cross-portal | Notificaciones |
| parentStore | Parent | Estado del portal padre |
| uiStore | Cross-portal | UI state (sidebar, modals) |
| gamificationStore | Student | Estado de gamificacion |
| exerciseStore | Student | Estado del ejercicio |
| shopStore | Student | Estado de la tienda |
| leaderboardStore | Student | Rankings |
| achievementsStore | Student | Logros |
| socialStore | Student | Social features |
| settingsStore | Cross-portal | Configuraciones |
| calendarStore | Teacher/Student | Calendario |
| resourceStore | Teacher | Recursos compartidos |

---

## 6. Resumen de Conteo

| Dimension | Admin | Teacher | Student | Parent | Shared | Total |
|-----------|-------|---------|---------|--------|--------|-------|
| Paginas | 19 (+2 features) | 19 | 24 | 4 | 6 auth | **72+** |
| Componentes feature | ~102 | 50 | ~83 | ~6 | -- | **~241** |
| Componentes shared | -- | -- | -- | -- | 52 (6 huerfanos) | **52** |
| Hooks feature | ~32 (4 huerfanos) | 25 | 14 | 1 store | -- | **~72** |
| Hooks shared | -- | -- | -- | -- | ~55 | **~55** |
| Mecanicas | -- | -- | 30+4 | -- | -- | **34** |
| Stores Zustand | 1 (partial) | 1 (partial) | ~6 | 1 | 4 cross | **13** |
| API files | -- | -- | -- | -- | 67 | **67** |
| Rutas App.tsx | ~21 | ~19 | ~24 | ~4 | ~5 | **73** |
