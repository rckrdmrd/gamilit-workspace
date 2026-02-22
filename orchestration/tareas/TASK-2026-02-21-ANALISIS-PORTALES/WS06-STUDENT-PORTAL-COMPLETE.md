# WS06 - Student Portal: Complete Analysis (24 Pages + 30 Mechanics)

**Fecha:** 2026-02-21
**Scope:** Student Portal completo — 24 paginas routed, ~83 componentes, 14 hooks, 30 mecanicas de ejercicio + 4 auxiliares
**Version:** 1.0.0

---

## 1. Inventario de Paginas (24 Routed Pages)

### 1.1 DashboardComplete
- **Ruta:** `/dashboard`
- **Archivo:** `apps/frontend/src/apps/student/pages/DashboardComplete.tsx`
- **Componentes:** StudentPageShell, EnhancedStatsGrid, MissionsPanel, ModulesSection, RecentActivityPanel, RankProgressWidget, QuickActionsWidget
- **Hooks:** useAuth, useDashboardData, useMissions, useUserModules, useRecentActivities, useUserClassroom
- **Endpoints API:**
  - `GET /gamification/users/:userId/ml-coins`
  - `GET /gamification/ranks/current`
  - `GET /gamification/ranks/users/:userId/rank-progress`
  - `GET /gamification/users/:userId/achievements`
  - `GET /progress/users/:userId/summary`
  - `GET /educational/users/:userId/modules`
  - `GET /educational/users/:userId/activities`
  - `GET /missions/*` (via useMissions)
  - `GET /social/classroom-members/users/:userId`
- **Estado:** React Query (useDashboardData, useUserModules, useRecentActivities), useMissions hook (React Query internally)
- **Interacciones:** Navigate to modules (`/modules/:id`), navigate to missions (`/missions`), refresh on error
- **Loading:** Loading flags per section (loading, missionsLoading, modulesLoading, activitiesLoading)
- **Error:** Error per section with retry buttons
- **Issues:** None critical. Rank "nextRank" field has `// TODO: Get from backend` placeholder (line 71).

### 1.2 LearningPage
- **Ruta:** `/learning`
- **Archivo:** `apps/frontend/src/apps/student/pages/LearningPage.tsx`
- **Componentes:** StudentPageShell, ModuleCard, LoadingSpinner
- **Hooks:** useUserModules
- **Endpoints API:** `GET /educational/users/:userId/modules`
- **Estado:** React Query via useUserModules
- **Interacciones:** Search filter, navigate to module detail (`/modules/:id`)
- **Loading:** LoadingSpinner with text
- **Error:** AlertCircle with retry button
- **Issues:** None.

### 1.3 ModuleDetailPage
- **Ruta:** `/modules/:moduleId`
- **Archivo:** `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`
- **Componentes:** StudentPageShell, EnhancedCard, ColorfulCard, DetectiveButton, ProgressBar, ExerciseCard, ModuleMetaSections
- **Hooks:** useAuth, useModuleDetail (shared hook), useNavigate, useSearchParams
- **Endpoints API:** `GET /educational/modules/:moduleId` (with exercises and progress)
- **Estado:** React Query via useModuleDetail
- **Interacciones:** Back to dashboard, navigate to exercise (`/exercises/:id`), mission-linked highlighting (exercise_type filter via query params)
- **Loading:** Skeleton animation (pulse)
- **Error:** Error message with retry
- **Issues:** None. Good mission-linked navigation pattern.

### 1.4 ExercisePage (Current - v2.0.0)
- **Ruta:** `/exercises/:exerciseId`
- **Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`
- **Componentes:** ExerciseProvider (context), ExerciseLayout
- **Hooks:** useParams, Navigate
- **Endpoints API:** Via ExerciseContext/hooks — see Section 3
- **Estado:** ExerciseContext (React Context wrapping all exercise state)
- **Interacciones:** Full exercise flow — see Section 3
- **Loading/Error/Completed:** Delegated to ExerciseLayout sub-components
- **Issues:** None. Clean thin-shell pattern (33 lines).

### 1.5 AchievementsPage
- **Ruta:** `/achievements`
- **Archivo:** `apps/frontend/src/apps/student/pages/AchievementsPage.tsx`
- **Componentes:** StudentPageShell, AchievementCard, AchievementFilter, AchievementModal
- **Hooks:** useAchievements, useAchievementFilters
- **Endpoints API:** `GET /gamification/achievements`, `GET /gamification/users/:userId/achievements`, `POST /gamification/achievements/:id/claim`
- **Estado:** React Query via useAchievements, local filter state
- **Interacciones:** Filter by category/status/search, sort, click to view detail modal, claim rewards
- **Loading:** Loader spinner with text
- **Error:** Alert with retry
- **Issues:** None. Well-structured with 3 sections (earned, pending, hidden).

### 1.6 LeaderboardPage
- **Ruta:** `/leaderboard`
- **Archivo:** `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`
- **Componentes:** StudentPageShell, LeaderboardTabs, SeasonSelector, LeaderboardLayout, UserPositionCard, LeaderboardStatsGrid, CategoryBreakdownPanel, FriendsMiniLeaderboard, LeaderboardTipsPanel
- **Hooks:** useAuth, useLeaderboards, useBatchEquipment, useUserClassroom, useDashboardData
- **Endpoints API:** `GET /gamification/leaderboards/:type`, `GET /social/classroom-members/users/:userId`, `GET /gamification/social/equipment/batch`
- **Estado:** useLeaderboards (Zustand + API), useDashboardData (React Query)
- **Interacciones:** Tab switching (global/school/grade/classroom/friends), season/period selector, auto-scroll to user, refresh
- **Loading:** RefreshCw spinner
- **Error:** AlertCircle with retry
- **Issues:** None. 4-column grid with sidebar panels.

### 1.7 MissionsPage
- **Ruta:** `/missions`
- **Archivo:** `apps/frontend/src/apps/student/pages/MissionsPage.tsx`
- **Componentes:** StudentPageShell, MissionTabs, MissionGrid, ActiveMissionTracker, RewardsPreview
- **Hooks:** useMissions, useInvalidateDashboard, useUserModules, useSearchParams
- **Endpoints API:** `GET /missions/*`, `POST /missions/:id/start`, `POST /missions/:id/claim`
- **Estado:** useMissions (React Query), URL search params for tab
- **Interacciones:** Tab navigation (daily/weekly/special), start mission, claim reward, track/untrack mission, navigate to exercise for special missions
- **Loading:** Via MissionGrid
- **Error:** Motion alert with retry
- **Issues:** None. Solid mission-to-exercise navigation.

### 1.8 ShopPage
- **Ruta:** `/shop`
- **Archivo:** `apps/frontend/src/apps/student/pages/ShopPage.tsx`
- **Componentes:** StudentPageShell, DetectiveCard, UnderConstruction, ShopItemCard, PurchaseModal
- **Hooks:** useCoins, useShopData, useShopPurchase
- **Endpoints API:** `GET /gamification/shop/items`, `GET /gamification/shop/categories`, `POST /gamification/shop/purchase`
- **Estado:** useCoins/useShopData (Zustand/React Query), local UI state for filters
- **Interacciones:** Category tabs, sub-type filters, search, sort, purchase confirmation modal
- **Loading:** Loader spinner
- **Error:** Empty state cards
- **Issues:** None. Dynamic categories from API.

### 1.9 InventoryPage
- **Ruta:** `/inventory`
- **Archivo:** `apps/frontend/src/apps/student/pages/InventoryPage.tsx`
- **Componentes:** StudentPageShell, DetectiveCard, TabBar, InventoryStatsGrid, ActivePowerUpsBanner, ActivePowerUpsList, InventoryItemCard, PowerUpModal
- **Hooks:** useInventoryData, useActivatePowerUp, useEquipment
- **Endpoints API:** `GET /gamification/inventory/items`, `GET /gamification/inventory/active-powerups`, `POST /gamification/inventory/equip`, `POST /gamification/inventory/activate-powerup`
- **Estado:** useInventoryData/useEquipment (React Query), local UI state
- **Interacciones:** Tab navigation (all/cosmetics/powerups/active), search, equip/unequip cosmetics, activate power-ups
- **Loading:** Loader spinner
- **Error:** Empty state
- **Issues:** None.

### 1.10 FriendsPage
- **Ruta:** `/friends`
- **Archivo:** `apps/frontend/src/apps/student/pages/FriendsPage.tsx`
- **Componentes:** StudentPageShell, FriendsStatsGrid, FriendsListTab, FriendRequestsTab, FindFriendsTab, FriendActivitiesTab, ConfirmDialog
- **Hooks:** useFriends, useBatchEquipment
- **Endpoints API:** `GET /social/friends/*`, `POST /social/friends/request`, `POST /social/friends/accept`, `DELETE /social/friends/:id`
- **Estado:** useFriends (Zustand), local tab/filter state
- **Interacciones:** 4 tabs (friends/requests/search/activities), search friends, send/accept/decline requests, remove friend (with confirmation), praise activity
- **Loading:** Via child components
- **Error:** Confirm dialog for removals
- **Issues:** UI labels in English (e.g. "My Friends", "Requests", "Find Friends") while rest of portal is Spanish. **[P2 - i18n inconsistency]**

### 1.11 GuildsPage
- **Ruta:** `/guilds`
- **Archivo:** `apps/frontend/src/apps/student/pages/GuildsPage.tsx`
- **Componentes:** StudentPageShell, GuildStatsGrid, DiscoverGuildsTab, MyGuildTab, GuildChallengesTab, CreateGuildModal, ConfirmDialog
- **Hooks:** useGuilds
- **Endpoints API:** `GET /social/guilds/*`, `POST /social/guilds/join`, `POST /social/guilds/create`, `DELETE /social/guilds/leave`
- **Estado:** useGuilds (Zustand), local tab/modal state
- **Interacciones:** 3 tabs (discover/my-guild/challenges), search guilds, join guild, leave guild (with confirmation), create guild
- **Loading:** Via child components
- **Error:** ConfirmDialog for leave
- **Issues:** UI labels in English ("Discover Guilds", "My Guild", "Challenges"). **[P2 - i18n inconsistency]**

### 1.12 EnhancedProfilePage
- **Ruta:** `/profile`
- **Archivo:** `apps/frontend/src/apps/student/pages/EnhancedProfilePage.tsx`
- **Componentes:** StudentPageShell, DetectiveCard, AvatarSelectionModal, ProfileHero, ProfileStatsTab, ProfileRankHistoryTab, ProfileAchievementsTab, ProfileInventoryTab
- **Hooks:** useProfileData, useAvatarUpdate, useEquipment, useEquippedVisuals
- **Endpoints API:** `GET /gamification/ranks/*`, `GET /gamification/economy/*`, `GET /gamification/achievements/*`, `PATCH /profiles/:id` (avatar update), `GET /gamification/social/equipment/*`
- **Estado:** Zustand stores (auth, ranks, economy, achievements), local tab/modal state
- **Interacciones:** 5 tabs (overview/stats/history/achievements/inventory), avatar selection modal, view equipped cosmetics (frame/background/title/badge)
- **Loading:** Via stores
- **Error:** Via stores
- **Issues:** Racha value hardcoded to '7 dias' (line 73). **[P1 - needs backend integration]**

### 1.13 SettingsPage
- **Ruta:** `/settings`
- **Archivo:** `apps/frontend/src/apps/student/pages/SettingsPage.tsx`
- **Componentes:** StudentPageShell, AvatarDisplay, SettingsSidebar, ProfileSection, AccountSection, NotificationsSection, PrivacySection
- **Hooks:** useAuth, useUserGamification
- **Endpoints API:** Via sub-sections (profile update, password change, notification prefs, privacy settings)
- **Estado:** useAuth (context), local section state
- **Interacciones:** Sidebar navigation between 4 sections (profile/account/notifications/privacy)
- **Loading:** Via sub-components
- **Error:** Via sub-components
- **Issues:** None. Clean sidebar pattern.

### 1.14 NotificationsPage
- **Ruta:** `/notifications`
- **Archivo:** `apps/frontend/src/apps/student/pages/NotificationsPage.tsx`
- **Componentes:** StudentPageShell
- **Hooks:** useNotificationsStore (Zustand), useWebSocket
- **Endpoints API:** `GET /notifications/*`, `PATCH /notifications/:id/read`, `DELETE /notifications/:id`
- **Estado:** Zustand notificationsStore, WebSocket for real-time
- **Interacciones:** Filter by status/type, mark as read (individual + bulk), delete, pagination
- **Loading:** Via store
- **Error:** Via store
- **Issues:** None. Real-time via WebSocket.

### 1.15 NotificationPreferencesPage
- **Ruta:** `/settings/notifications`
- **Archivo:** `apps/frontend/src/apps/student/pages/NotificationPreferencesPage.tsx`
- **Componentes:** StudentPageShell
- **Hooks:** useNotificationsStore, useApiError
- **Endpoints API:** `GET /notifications/preferences`, `PATCH /notifications/preferences`
- **Estado:** Zustand notificationsStore, local toggle state
- **Interacciones:** Toggle in-app/email/push per notification type
- **Issues:** None.

### 1.16 DeviceManagementSection
- **Ruta:** `/settings/devices`
- **Archivo:** `apps/frontend/src/apps/student/pages/DeviceManagementSection.tsx`
- **Componentes:** ConfirmDialog
- **Hooks:** useNotificationsStore, usePushNotifications
- **Endpoints API:** `GET /notifications/devices`, `DELETE /notifications/devices/:id`
- **Estado:** Zustand notificationsStore
- **Interacciones:** View devices, delete device (with confirmation)
- **Issues:** None. Named export (not default) - lazy loaded with `.then()` wrapper.

### 1.17 AssignmentsPage
- **Ruta:** `/assignments`
- **Archivo:** `apps/frontend/src/apps/student/pages/AssignmentsPage.tsx`
- **Componentes:** StudentPageShell
- **Hooks:** useStudentAssignmentsStore (Zustand)
- **Endpoints API:** `GET /educational/student-assignments`
- **Estado:** Zustand studentAssignmentsStore
- **Interacciones:** Filter by status, navigate to assignment detail (`/assignments/:id`)
- **Issues:** None. Created P1-002.

### 1.18 AssignmentDetailPage
- **Ruta:** `/assignments/:id`
- **Archivo:** `apps/frontend/src/apps/student/pages/AssignmentDetailPage.tsx`
- **Componentes:** StudentPageShell, LoadingSpinner
- **Hooks:** useApiError, studentAssignmentsAPI (direct)
- **Endpoints API:** `GET /educational/student-assignments/:id`
- **Estado:** Local useState
- **Interacciones:** Back to assignments, navigate to exercise (`/exercises/:id`), view exercises list
- **Issues:** None. Created P0-008.

### 1.19 MyProgressPage
- **Ruta:** `/progress`
- **Archivo:** `apps/frontend/src/pages/MyProgressPage.tsx` (NOT under student/pages/)
- **Componentes:** GamifiedHeader, ProgressCard, ProgressFilter, StatsOverview
- **Hooks:** useAuth, progressApi (direct), getModules (direct)
- **Endpoints API:** `GET /progress/users/:userId/summary`, `GET /progress/users/:userId`, `GET /educational/modules`
- **Estado:** Local useState + useEffect (NOT React Query)
- **Interacciones:** Filter/sort modules, navigate to module details (`/progress/modules/:moduleId`)
- **Issues:** **[P1 - NOT using React Query pattern]** - uses older useState+useEffect pattern. Lives outside `apps/student/pages/` directory. Uses GamifiedHeader directly instead of StudentPageShell.

### 1.20 ModuleDetailsPage (Progress)
- **Ruta:** `/progress/modules/:moduleId`
- **Archivo:** `apps/frontend/src/pages/ModuleDetailsPage.tsx` (NOT under student/pages/)
- **Componentes:** GamifiedHeader, ModuleProgressCard
- **Hooks:** useAuth, progressApi (direct)
- **Endpoints API:** `GET /progress/users/:userId/modules/:moduleId`
- **Estado:** Local useState + useEffect
- **Issues:** **[P1 - NOT using React Query pattern]**. Lives outside `apps/student/pages/`. Named export (not default) - lazy loaded with `.then()` wrapper.

### 1.21 PasswordResetPage
- **Ruta:** `/reset-password` (public)
- **Archivo:** `apps/frontend/src/apps/student/pages/PasswordResetPage.tsx`
- **Componentes:** DetectiveCard, DetectiveButton, PasswordInput, FormErrorDisplay
- **Hooks:** useForm (react-hook-form), useNavigate, useSearchParams, BrandingContext
- **Endpoints API:** `POST /auth/reset-password`
- **Estado:** react-hook-form + local loading/error state
- **Interacciones:** Password reset form with validation (zod), token from URL params
- **Issues:** None. Statically imported (critical path).

### 1.22 EmailVerificationPage
- **Ruta:** `/verify-email` (public)
- **Archivo:** `apps/frontend/src/apps/student/pages/EmailVerificationPage.tsx`
- **Componentes:** DetectiveCard, DetectiveButton
- **Hooks:** useNavigate, BrandingContext
- **Endpoints API:** None
- **Estado:** None
- **Issues:** **DEPRECATED** since 2025-10. Displays informational message only. Could be removed. **[P2 - dead code candidate]**

### 1.23 NotFoundPage
- **Ruta:** `*` (catch-all)
- **Archivo:** `apps/frontend/src/apps/student/pages/NotFoundPage.tsx`
- **Componentes:** DetectiveCard, DetectiveButton
- **Hooks:** useNavigate
- **Endpoints API:** None
- **Issues:** None. Simple 404 page.

### 1.24 LegacyExercisePage (NOT ROUTED)
- **Ruta:** None (no route in App.tsx)
- **Archivo:** `apps/frontend/src/apps/student/pages/LegacyExercisePage.tsx`
- **Status:** See Section 4 (Dead Code Analysis)

---

## 2. Mecanicas de Ejercicio (30 + 4 auxiliares = 34 registradas)

### 2.1 Modulo 1: Comprension Literal (7 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Sub-Componentes | Types File | Schemas | Mock Data | Adapter |
|---|----------|---------------|---------------------|-----------------|------------|---------|-----------|---------|
| 1 | Crucigrama | `crucigrama`, `crucigrama_cientifico` | CrucigramaExercise.tsx | CrucigramaGrid.tsx, CrucigramaClue.tsx | crucigramaTypes.ts | crucigramaSchemas.ts | crucigramaMockData.ts | adaptToCrucigramaData |
| 2 | Linea de Tiempo | `linea_tiempo`, `timeline` | TimelineExercise.tsx | TimelineEvent.tsx, TimelineDragDrop.tsx | timelineTypes.ts | timelineSchemas.ts | timelineMockData.ts | adaptToTimelineData |
| 3 | Sopa de Letras | `sopa_letras` | SopaLetrasExercise.tsx | SopaLetrasGrid.tsx, WordList.tsx | sopaLetrasTypes.ts | sopaLetrasSchemas.ts | sopaLetrasMockData.ts | adaptToSopaLetrasData |
| 4 | Mapa Conceptual | `mapa_conceptual` | MapaConceptualExercise.tsx | ConceptNode.tsx, ConnectionLine.tsx | mapaConceptualTypes.ts | mapaConceptualSchemas.ts | mapaConceptualMockData.ts | adaptToMapaConceptualData |
| 5 | Emparejamiento | `emparejamiento` | EmparejamientoExercise.tsx | MatchingCard.tsx, MatchingDragDrop.tsx | emparejamientoTypes.ts | emparejamientoSchemas.ts | emparejamientoMockData.ts | adaptToEmparejamientoData |
| 6 | Verdadero/Falso | `verdadero_falso` | VerdaderoFalsoExercise.tsx | (VerdaderoFalsoExercise.SECURE.tsx) | verdaderoFalsoTypes.ts | verdaderoFalsoSchemas.ts | verdaderoFalsoMockData.ts | adaptToVerdaderoFalsoData |
| 7 | Completar Espacios | `completar_espacios` | CompletarEspaciosExercise.tsx | - | completarEspaciosTypes.ts | completarEspaciosSchemas.ts | completarEspaciosMockData.ts | adaptToCompletarEspaciosData |

**Nota:** VerdaderoFalso tiene un archivo `.SECURE.tsx` que parece ser una version con anti-cheating (server-side validation).

### 2.2 Modulo 2: Comprension Inferencial (6 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Sub-Componentes | Types File | Schemas | Mock Data | Adapter |
|---|----------|---------------|---------------------|-----------------|------------|---------|-----------|---------|
| 8 | Detective Textual | `detective_textual` | DetectiveTextualExercise.tsx | - | detectiveTextualTypes.ts | detectiveTextualSchemas.ts | detectiveTextualMockData.ts | adaptToLecturaInferencialData |
| 9 | Lectura Inferencial | `lectura_inferencial` | LecturaInferencialExercise.tsx | - | lecturaInferencialTypes.ts | lecturaInferencialSchemas.ts | lecturaInferencialMockData.ts | adaptToLecturaInferencialData |
| 10 | Causa y Efecto | `construccion_hipotesis` | CausaEfectoExercise.tsx | - | causaEfectoTypes.ts | causaEfectoSchemas.ts | causaEfectoMockData.ts | adaptToCausaEfectoData |
| 11 | Prediccion Narrativa | `prediccion_narrativa` | PrediccionNarrativaExercise.tsx | - | prediccionNarrativaTypes.ts | prediccionNarrativaSchemas.ts | prediccionNarrativaMockData.ts | adaptToPrediccionNarrativaData |
| 12 | Puzzle de Contexto | `puzzle_contexto` | PuzzleContextoExercise.tsx | - | puzzleContextoTypes.ts | puzzleContextoSchemas.ts | puzzleContextoMockData.ts | adaptToPuzzleContextoData |
| 13 | Rueda de Inferencias | `rueda_inferencias` | RuedaInferenciasExercise.tsx | WheelSpinner.tsx, CountdownTimer.tsx | ruedaInferenciasTypes.ts | ruedaInferenciasSchemas.ts | ruedaInferenciasMockData.ts | adaptToLecturaInferencialData |

**Nota:** Detective Textual y Rueda de Inferencias comparten el adapter `adaptToLecturaInferencialData`.
**API Files:** ruedaInferenciasAPI.ts (dedicated API client)

### 2.3 Modulo 3: Comprension Critica (5 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Types File | Schemas | Mock Data | API File | Adapter |
|---|----------|---------------|---------------------|------------|---------|-----------|----------|---------|
| 14 | Analisis de Fuentes | `analisis_fuentes` | AnalisisFuentesExercise.tsx | analisisFuentesTypes.ts | analisisFuentesSchemas.ts | analisisFuentesMockData.ts | analisisFuentesAPI.ts | adaptToBaseExercise |
| 15 | Debate Digital | `debate_digital` | DebateDigitalExercise.tsx | debateDigitalTypes.ts | debateDigitalSchemas.ts | debateDigitalMockData.ts | debateDigitalAPI.ts | adaptToBaseExercise |
| 16 | Matriz de Perspectivas | `matriz_perspectivas` | MatrizPerspectivasExercise.tsx | matrizPerspectivasTypes.ts | matrizPerspectivasSchemas.ts | matrizPerspectivasMockData.ts | matrizPerspectivasAPI.ts | adaptToBaseExercise |
| 17 | Podcast Argumentativo | `podcast_argumentativo` | PodcastArgumentativoExercise.tsx | podcastArgumentativoTypes.ts | podcastArgumentativoSchemas.ts | podcastArgumentativoMockData.ts | podcastArgumentativoAPI.ts | adaptToBaseExercise |
| 18 | Tribunal de Opiniones | `tribunal_opiniones` | TribunalOpinionesExercise.tsx | tribunalOpinionesTypes.ts | tribunalOpinionesSchemas.ts | tribunalOpinionesMockData.ts | - | adaptToTribunalOpinionesData |

**Nota:** M3 mecanicas (excepto TribunalOpiniones) usan `adaptToBaseExercise` — son evaluacion manual (M3-M5 pattern). Cada una tiene su propio API file para interaccion con AI backend.

### 2.4 Modulo 4: Textos Digitales y Multimediales (5 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Sub-Componentes | Types File | Schemas | Mock Data | Adapter |
|---|----------|---------------|---------------------|-----------------|------------|---------|-----------|---------|
| 19 | Verificador Fake News | `verificador_fake_news`, `verificador_fakenews`, `fake_news` | VerificadorFakeNewsExercise.tsx | ArticleParser.tsx, FactCheckDashboard.tsx | verificadorFakeNewsTypes.ts | verificadorFakeNewsSchemas.ts | verificadorFakeNewsMockData.ts | adaptToVerificadorFakeNewsData |
| 20 | Quiz TikTok | `quiz_tiktok` | QuizTikTokExercise.tsx | TikTokCard.tsx, SwipeGesture.tsx | quizTikTokTypes.ts | quizTikTokSchemas.ts | quizTikTokMockData.ts | adaptToQuizTikTokData |
| 21 | Navegacion Hipertextual | `navegacion_hipertextual` | NavegacionHipertextualExercise.tsx | HypertextDocument.tsx, NavigationBreadcrumbs.tsx | navegacionHipertextualTypes.ts | navegacionHipertextualSchemas.ts | navegacionHipertextualMockData.ts | adaptToNavegacionHipertextualData |
| 22 | Analisis de Memes | `analisis_memes` | AnalisisMemesExercise.tsx | MemeAnnotator.tsx, AnnotationMarker.tsx | analisisMemesTypes.ts | analisisMemesSchemas.ts | - | adaptToAnalisisMemesData |
| 23 | Infografia Interactiva | `infografia_interactiva` | InfografiaInteractivaExercise.tsx | DataVisualization.tsx, DroppableZone.tsx, InteractiveCard.tsx, DraggableCard.tsx | infografiaInteractivaTypes.ts | infografiaInteractivaSchemas.ts | infografiaInteractivaMockData.ts | adaptToInfografiaInteractivaData |

**Nota:** Verificador Fake News registra 3 aliases de tipo (mas que cualquier otra mecanica). Analisis de Memes no tiene mockData file.

### 2.5 Modulo 5: Produccion Creativa (3 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Types File | Schemas | Mock Data | Adapter |
|---|----------|---------------|---------------------|------------|---------|-----------|---------|
| 24 | Diario Multimedia | `diario_multimedia` | DiarioMultimediaExercise.tsx | diarioMultimediaTypes.ts | diarioMultimediaSchemas.ts | diarioMultimediaMockData.ts | adaptToDiarioMultimediaData |
| 25 | Comic Digital | `comic_digital` | ComicDigitalExercise.tsx | comicDigitalTypes.ts | comicDigitalSchemas.ts | comicDigitalMockData.ts | adaptToComicDigitalData |
| 26 | Video Carta | `video_carta` | VideoCartaExercise.tsx | videoCartaTypes.ts | videoCartaSchemas.ts | videoCartaMockData.ts | adaptToVideoCartaData |

### 2.6 Mecanicas Auxiliares (4 mecanicas)

| # | Mecanica | Tipo Registry | Componente Principal | Types File | Schemas | Mock Data | Adapter |
|---|----------|---------------|---------------------|------------|---------|-----------|---------|
| 27 | Call to Action | `call_to_action` | CallToActionExercise.tsx | callToActionTypes.ts | callToActionSchemas.ts | callToActionMockData.ts | adaptToBaseExercise |
| 28 | Collage de Prensa | `collage_prensa` | CollagePrensaExercise.tsx | collagePrensaTypes.ts | collagePrensaSchemas.ts | collagePrensaMockData.ts | adaptToBaseExercise |
| 29 | Comprension Auditiva | `comprension_auditiva` | ComprensiónAuditivaExercise.tsx | comprensionAuditivaTypes.ts | comprensionAuditivaSchemas.ts | comprensionAuditivaMockData.ts | adaptToComprensionAuditivaData |
| 30 | Texto en Movimiento | `texto_movimiento` | TextoEnMovimientoExercise.tsx | textoEnMovimientoTypes.ts | textoEnMovimientoSchemas.ts | textoEnMovimientoMockData.ts | adaptToBaseExercise |

### 2.7 Resumen de Mecanicas

| Modulo | Mecanicas | Sub-Componentes | Types Files | Schemas Files | Mock Data Files | API Files Dedicados |
|--------|-----------|-----------------|-------------|---------------|-----------------|---------------------|
| M1 - Literal | 7 | 8 | 7 | 7 | 7 | 0 |
| M2 - Inferencial | 6 | 2 | 6 | 6 | 6 | 1 |
| M3 - Critica | 5 | 0 | 5 | 5 | 5 | 4 |
| M4 - Digital | 5 | 7 | 5 | 5 | 4 | 0 |
| M5 - Produccion | 3 | 0 | 3 | 3 | 3 | 0 |
| Auxiliar | 4 | 0 | 4 | 4 | 4 | 0 |
| **Total** | **30** | **17** | **30** | **30** | **29** | **5** |

**Shared resources:**
- `features/mechanics/shared/aiService.ts` - AI service for M3-M5 manual review
- `features/mechanics/shared/aiMockResponses.ts` - Mock AI responses
- `features/mechanics/shared/aiTypes.ts` - AI type definitions
- `features/mechanics/shared/api/aiServiceAPI.ts` - AI service API client
- `features/mechanics/shared/api/mechanicsAPI.ts` - General mechanics API client
- `features/mechanics/constants/manualReviewMessages.ts` - Manual review messages
- `features/mechanics/index.ts` - Barrel export (30 + 4 aux)

---

## 3. Exercise Registry & Flow

### 3.1 Registry Pattern

**Location:** `apps/frontend/src/features/exercises/registry/`

The exercise system uses a **Registry Pattern** that decouples exercise mechanics from the page shell:

1. **exercise-registry.ts** - Core Map-based registry with `registerExercise()`, `getExerciseEntry()`, `getAllRegisteredTypes()`, `isExerciseRegistered()`, `getExerciseMeta()`
2. **registrations.ts** - Single file registering all 30+4 mechanics with their loaders, adapters, and metadata

**Registration structure per mechanic:**
```typescript
registerExercise('type_key', {
  loader: () => import('@/features/mechanics/...'),  // Dynamic import
  adapter: adaptToSpecificData,                        // Data transformer
  meta: { displayName, module, category, icon },       // Metadata
});
```

**Total registered types:** 38 keys mapping to 34 unique mechanics (some have aliases).

### 3.2 ExercisePage Flow (v2.0.0)

```
Student clicks exercise → /exercises/:exerciseId
  → ExercisePage.tsx (thin shell, 33 lines)
    → ExerciseProvider (ExerciseContext.tsx)
      ├── useExerciseData → GET /educational/exercises/:id → adapt data
      ├── useExerciseProgress → auto-save, time tracking
      ├── useExerciseComodines → GET /gamification/comodines/:exerciseId
      ├── useExercisePowerUps → GET /gamification/powerups/:exerciseId
      └── ExerciseLayout.tsx
            ├── GamifiedHeader
            ├── ExercisePageHeader (title, auto-save indicator)
            ├── ExerciseGuide (pedagogical notes, how-to-solve)
            ├── ExerciseLoader (dynamic import via registry → MechanicComponent)
            ├── ExerciseSidebar (actions, score, timer, progress, comodines)
            └── FeedbackModal (success/error/info)
```

### 3.3 Exercise Submission Flow

```
Student completes mechanic → onProgressUpdate({ progress, answers })
  → handleSubmit()
    → submitExercise(exerciseId, { answers, startedAt, hintsUsed, powerupsUsed })
    → POST /progress/exercises/:exerciseId/submit
    → Response: { score, isPerfect, rewards: { xp, mlCoins, bonuses }, rankUp? }
    → syncAndInvalidate() → invalidate dashboard cache
    → FeedbackModal with confetti if isPerfect or score >= 80
    → Navigate back to module
```

### 3.4 Key Supporting Files

| File | Purpose |
|------|---------|
| `features/exercises/context/ExerciseContext.tsx` | Central context provider (100+ interface fields) |
| `features/exercises/components/ExerciseLayout.tsx` | Main layout (header + guide + mechanic + sidebar + feedback) |
| `features/exercises/components/ExerciseLoader.tsx` | Lazy-loads mechanic component from registry |
| `features/exercises/components/ExerciseSidebar.tsx` | Actions, score, timer, progress, comodines panel |
| `features/exercises/components/ExerciseGuide.tsx` | Pedagogical guide accordion |
| `features/exercises/components/MechanicCompatWrapper.tsx` | Compatibility wrapper for legacy mechanic props |
| `features/exercises/components/ActionsPanel.tsx` | Mechanic-specific action buttons |
| `features/exercises/components/ConsumablesPanel.tsx` | Comodines/consumables UI |
| `features/exercises/components/ExerciseHeader.tsx` | Exercise header with title and metadata |
| `features/exercises/hooks/useExerciseData.ts` | Fetches exercise + hints + mechanic component |
| `features/exercises/hooks/useExerciseProgress.ts` | Progress tracking + auto-save |
| `features/exercises/hooks/useExerciseComodines.ts` | Comodines (hints/skips) management |
| `features/exercises/hooks/useExerciseTimer.ts` | Timer management |
| `features/exercises/hooks/useExerciseRewards.ts` | Post-submission rewards display |
| `shared/utils/exerciseAdapter.ts` | 22 adapter functions (one per mechanic family) |

---

## 4. Dead Code Analysis

### 4.1 LegacyExercisePage

**File:** `apps/frontend/src/apps/student/pages/LegacyExercisePage.tsx`
**Lines:** 993 lines
**Status:** **DEAD CODE** - confirmed

**Evidence:**
1. **Not routed** - No reference in `App.tsx` routes
2. **Not imported** - `grep` for "LegacyExercisePage" across entire `src/` returns ONLY one comment in `ExercisePage.tsx` line 11: `"Original monolithic implementation preserved in LegacyExercisePage.tsx"`
3. **Not lazy-loaded** - Not in any `lazy()` call
4. **Duplicates functionality** - Contains the exact same `loadMechanic()` map (30+4 mechanics), same API calls, same UI layout that is now in ExerciseContext + ExerciseLayout

**Why it exists:** Historical preservation. The comment in ExercisePage.tsx explicitly states it was preserved during the exercise system restructuring.

**Content:** Monolithic 993-line component containing:
- Own `loadMechanic()` mapping (lines 81-163) — duplicates registry
- Own data fetching (lines 243-347) — duplicates useExerciseData
- Own auto-save (lines 354-409) — duplicates useExerciseProgress
- Own submission handler (lines 448-525) — duplicates ExerciseContext
- Own sidebar with actions/score/timer/progress (lines 797-950)
- Uses StudentPageShell (not ExerciseLayout pattern)

**Recommendation:** **DELETE** - This is 993 lines of dead code. The current `ExercisePage.tsx` (33 lines) + `ExerciseContext` + `ExerciseLayout` fully replace it. If historical reference is needed, git history preserves it.

### 4.2 EmailVerificationPage

**File:** `apps/frontend/src/apps/student/pages/EmailVerificationPage.tsx`
**Status:** **DEPRECATED** since 2025-10 (explicitly documented in file header)
**Routed:** Yes (`/verify-email` - public route)
**Recommendation:** Keep for backward compatibility with old email links but mark clearly in routing comments. **[P2]**

### 4.3 VerdaderoFalsoExercise.SECURE.tsx

**File:** `apps/frontend/src/features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise.SECURE.tsx`
**Status:** **Not registered in registry** - the registry points to `VerdaderoFalsoExercise.tsx` (not the SECURE version)
**Recommendation:** Investigate if this is a newer version with server-side answer validation. If so, update registry. If not, clarify purpose or remove. **[P1]**

---

## 5. Known Gaps (G-001 to G-008)

Per `docs/60-portals/student/specs/gaps/_MAP.md`:

> **All gaps G-001 through G-008 have been RESOLVED** (2025-11).

| Gap | Description | Status | Consolidated In |
|-----|-------------|--------|-----------------|
| G-001 | Missions rewards system | **RESUELTO** | SPEC-GAMIFICATION.md |
| G-002 | Missions progress update | **RESUELTO** | SPEC-GAMIFICATION.md, SPEC-PROGRESS.md |
| G-003 | (not in directory) | N/A | - |
| G-004 | (not in directory) | N/A | - |
| G-005 | Inactive exercise handling | **RESUELTO** | Implemented in ExerciseContext (is_active check) |
| G-006 | Profile stats | **RESUELTO** | SPEC-PROFILE.md |
| G-007 | Settings persistence | **RESUELTO** | SPEC-PROFILE.md |
| G-008 | Backend statistics | **RESUELTO** | SPEC-PROFILE.md, SPEC-API-CONTRACTS.md |

**Note:** G-003 and G-004 gap files do not exist in the gaps directory. They may have been resolved and removed earlier or were never formally documented as separate files.

For current gaps (2026-01+), the documentation references:
- `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`
- `orchestration/analisis/AUDITORIA-STUDENT-PORTAL-2026-01-24.md`

---

## 6. Catalogo de Componentes (~83 production)

### 6.1 Shared Shell (1)

| Componente | Path | Props | Proposito |
|-----------|------|-------|-----------|
| StudentPageShell | `components/shared/StudentPageShell.tsx` | `children, showHeader?` | Wrapper with GamifiedHeader + delayed rewards modal listener |

### 6.2 Dashboard (14)

| Componente | Path | Proposito |
|-----------|------|-----------|
| AchievementMilestones | `components/dashboard/AchievementMilestones.tsx` | Recent milestones display |
| AchievementMilestones.example | `components/dashboard/AchievementMilestones.example.tsx` | Example/story |
| BottomNavigation | `components/dashboard/BottomNavigation.tsx` | Mobile bottom nav |
| MLCoinsWidget | `components/dashboard/MLCoinsWidget.tsx` | Coins balance widget |
| ModuleGridCard | `components/dashboard/ModuleGridCard.tsx` | Module card for grid |
| ModuleGridCardEnhanced | `components/dashboard/ModuleGridCardEnhanced.tsx` | Enhanced module card |
| ModulesSection | `components/dashboard/ModulesSection.tsx` | Modules grid section |
| ProgressStats | `components/dashboard/ProgressStats.tsx` | Progress statistics |
| QuickActionsCard | `components/dashboard/QuickActionsCard.tsx` | Quick action card |
| QuickActionsPanel | `components/dashboard/QuickActionsPanel.tsx` | Quick actions panel |
| QuickActionsWidget | `components/dashboard/QuickActionsWidget.tsx` | Quick actions widget |
| RecentActivityFeed | `components/dashboard/RecentActivityFeed.tsx` | Activity feed |
| RecentActivityPanel | `components/dashboard/RecentActivityPanel.tsx` | Activity panel |
| ResponsiveLayout | `components/dashboard/ResponsiveLayout.tsx` | Responsive layout helper |
| StatsGrid | `components/dashboard/StatsGrid.tsx` | Stats grid |
| EnhancedStatsGrid | `components/dashboard/EnhancedStatsGrid.tsx` | Enhanced stats grid |
| MissionsPanel | `components/dashboard/MissionsPanel.tsx` | Active missions summary |
| RankProgressWidget | `components/dashboard/RankProgressWidget.tsx` | Rank progress bar |

### 6.3 Exercise (12)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ExerciseHeader | `components/exercise/ExerciseHeader.tsx` | Exercise header bar |
| ExerciseSidebar | `components/exercise/ExerciseSidebar.tsx` | Sidebar with actions (Legacy) |
| PowerUpEffects | `components/exercise/PowerUpEffects.tsx` | Power-up visual effects |
| ExercisePageHeader | `components/exercise/ExercisePageHeader.tsx` | Header with auto-save status |
| CompletionModal | `components/exercise/CompletionModal.tsx` | Exercise completion modal |
| CompletionModalSections | `components/exercise/CompletionModalSections.tsx` | Modal sub-sections |
| CompletionActions | `components/exercise/CompletionActions.tsx` | Post-completion action buttons |
| CompletionHeader | `components/exercise/CompletionHeader.tsx` | Completion modal header |
| DelayedRewardsModal | `components/exercise/DelayedRewardsModal.tsx` | Delayed rewards display modal |
| PowerUpBar | `components/PowerUpBar.tsx` | Power-ups activation bar |

### 6.4 Achievements (4)

| Componente | Path | Proposito |
|-----------|------|-----------|
| AchievementFilters | `components/achievements/AchievementFilters.tsx` | Filter controls |
| AchievementGrid | `components/achievements/AchievementGrid.tsx` | Achievement grid layout |
| AchievementsPageHeader | `components/achievements/AchievementsPageHeader.tsx` | Page header |
| AchievementStatistics | `components/achievements/AchievementStatistics.tsx` | Stats summary |
| AchievementDetailModal | `components/achievements/AchievementDetailModal.tsx` | Detail modal |

### 6.5 Gamification (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| LeaderboardPreview | `components/gamification/LeaderboardPreview.tsx` | Leaderboard preview card |
| MLCoinsSection | `components/gamification/MLCoinsSection.tsx` | Coins section |
| AchievementsPreview | `components/gamification/AchievementsPreview.tsx` | Achievements preview |
| RanksSection | `components/gamification/RanksSection.tsx` | Ranks display |
| GamificationHero | `components/gamification/GamificationHero.tsx` | Gamification hero section |
| StreaksMissionsSection | `components/gamification/StreaksMissionsSection.tsx` | Streaks and missions |

### 6.6 Leaderboard (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| UserPositionCard | `components/leaderboard/UserPositionCard.tsx` | User's position card |
| LeaderboardStatsGrid | `components/leaderboard/LeaderboardStatsGrid.tsx` | Stats grid |
| FriendsMiniLeaderboard | `components/leaderboard/FriendsMiniLeaderboard.tsx` | Friends mini leaderboard |
| LeaderboardTipsPanel | `components/leaderboard/LeaderboardTipsPanel.tsx` | Tips panel |
| CategoryBreakdownPanel | `components/leaderboard/CategoryBreakdownPanel.tsx` | Category breakdown |

### 6.7 Friends (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| FriendsListTab | `components/friends/FriendsListTab.tsx` | Friends list |
| FriendRequestsTab | `components/friends/FriendRequestsTab.tsx` | Pending requests |
| FindFriendsTab | `components/friends/FindFriendsTab.tsx` | Search/discover friends |
| FriendActivitiesTab | `components/friends/FriendActivitiesTab.tsx` | Friends activity feed |
| FriendsStatsGrid | `components/friends/FriendsStatsGrid.tsx` | Stats grid |

### 6.8 Guilds (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| DiscoverGuildsTab | `components/guilds/DiscoverGuildsTab.tsx` | Browse guilds |
| MyGuildTab | `components/guilds/MyGuildTab.tsx` | Current guild view |
| GuildChallengesTab | `components/guilds/GuildChallengesTab.tsx` | Guild challenges |
| CreateGuildModal | `components/guilds/CreateGuildModal.tsx` | Create guild form |
| GuildStatsGrid | `components/guilds/GuildStatsGrid.tsx` | Stats grid |

### 6.9 Shop (3)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ShopIcon | `components/shop/ShopIcon.tsx` | Shop item icon |
| ShopItemCard | `components/shop/ShopItemCard.tsx` | Shop item card |
| PurchaseModal | `components/shop/PurchaseModal.tsx` | Purchase confirmation modal |

### 6.10 Inventory (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| InventoryItemCard | `components/inventory/InventoryItemCard.tsx` | Inventory item card |
| PowerUpModal | `components/inventory/PowerUpModal.tsx` | Power-up activation modal |
| ActivePowerUpsBanner | `components/inventory/ActivePowerUpsBanner.tsx` | Active power-ups banner |
| ActivePowerUpsList | `components/inventory/ActivePowerUpsList.tsx` | Active power-ups list |
| InventoryStatsGrid | `components/inventory/InventoryStatsGrid.tsx` | Stats grid |

### 6.11 Profile (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ProfileHero | `components/profile/ProfileHero.tsx` | Profile hero section with avatar |
| ProfileStatsTab | `components/profile/ProfileStatsTab.tsx` | Stats tab content |
| ProfileRankHistoryTab | `components/profile/ProfileRankHistoryTab.tsx` | Rank history tab |
| ProfileAchievementsTab | `components/profile/ProfileAchievementsTab.tsx` | Achievements tab |
| ProfileInventoryTab | `components/profile/ProfileInventoryTab.tsx` | Inventory tab |

### 6.12 Module (2)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ExerciseCard | `components/module/ExerciseCard.tsx` | Exercise card in module detail |
| ModuleMetaSections | `components/module/ModuleMetaSections.tsx` | Module metadata sections |

### 6.13 Learning (1)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ModuleCard | `components/learning/ModuleCard.tsx` | Module card in learning hub |

### 6.14 Progress (1)

| Componente | Path | Proposito |
|-----------|------|-----------|
| ModuleProgressCard | `components/progress/ModuleProgressCard.tsx` | Progress card |

### 6.15 Notifications (2)

| Componente | Path | Proposito |
|-----------|------|-----------|
| AchievementToast | `components/notifications/AchievementToast.tsx` | Achievement toast notification |
| CelebrationModal | `components/notifications/CelebrationModal.tsx` | Celebration modal (rank up, etc.) |

### 6.16 Interactions (1)

| Componente | Path | Proposito |
|-----------|------|-----------|
| SwipeableContainer | `components/interactions/SwipeableContainer.tsx` | Swipeable container for mobile |

### 6.17 Settings Sub-Components (5)

| Componente | Path | Proposito |
|-----------|------|-----------|
| SettingsSidebar | `pages/settings/SettingsSidebar.tsx` | Settings navigation sidebar |
| ProfileSection | `pages/settings/ProfileSection.tsx` | Profile settings section |
| AccountSection | `pages/settings/AccountSection.tsx` | Account settings section |
| NotificationsSection | `pages/settings/NotificationsSection.tsx` | Notification settings section |
| PrivacySection | `pages/settings/PrivacySection.tsx` | Privacy settings section |
| ToggleSwitch | `pages/settings/ToggleSwitch.tsx` | Toggle switch component |
| PasswordStrengthIndicator | `pages/settings/PasswordStrengthIndicator.tsx` | Password strength indicator |

**Total production components:** ~83 (excluding test files, example files, and story files)

---

## 7. Analisis de Hooks (14 en apps/student/hooks/)

| # | Hook | File | API Calls | Consumers | Pattern |
|---|------|------|-----------|-----------|---------|
| 1 | **useDashboardData** | `useDashboardData.ts` | 5 endpoints via `Promise.allSettled` (ml-coins, ranks/current, rank-progress, achievements, progress/summary) | DashboardComplete, LeaderboardPage | React Query |
| 2 | **useUserModules** | `useUserModules.ts` | `GET /educational/users/:userId/modules` | DashboardComplete, LearningPage, MissionsPage | React Query |
| 3 | **useRecentActivities** | `useRecentActivities.ts` | `GET /educational/users/:userId/activities` | DashboardComplete | useState+useEffect |
| 4 | **useUserClassroom** | `useUserClassroom.ts` | `GET /social/classroom-members/users/:userId` | DashboardComplete, LeaderboardPage | useState+useEffect |
| 5 | **useExerciseState** | `useExerciseState.ts` | None (local state) | Legacy use | useState |
| 6 | **useExerciseAutoSave** | `useExerciseAutoSave.ts` | `POST /progress/exercises/:id/auto-save` | LegacyExercisePage, ExerciseContext | Custom with debounce |
| 7 | **useExercisePowerUps** | `useExercisePowerUps.ts` | `GET /gamification/powerups/:exerciseId` | LegacyExercisePage, ExerciseContext | useState+useEffect |
| 8 | **useProfileData** | `useProfileData.ts` | Aggregates 4 Zustand stores (auth, ranks, economy, achievements) | EnhancedProfilePage | Zustand |
| 9 | **useAvatarUpdate** | `useAvatarUpdate.ts` | `PATCH /profiles/:userId` | EnhancedProfilePage | Zustand + API |
| 10 | **useSwipeGesture** | `useSwipeGesture.ts` | None | SwipeableContainer | Gesture detection |
| 11 | **useResponsiveLayout** | `useResponsiveLayout.ts` | None | Various components | Media queries |
| 12 | **useStudentPageSetup** | `useStudentPageSetup.ts` | Via useAuth + useUserGamification | StudentPageShell | Composition |
| 13 | **useAchievementsEnhanced** | `useAchievementsEnhanced.ts` | Via achievementsStore | AchievementsPage (alternative) | Zustand + computed |
| 14 | **useExerciseState** (barrel) | `index.ts` | - | Barrel re-export | - |

**Note:** The barrel `index.ts` exports 9 of the 14 hooks. `useAchievementsEnhanced`, `useProfileData`, and `useAvatarUpdate` are not in the barrel.

### Hook Pattern Inconsistency

| Pattern | Hooks Using It | Count |
|---------|---------------|-------|
| React Query | useDashboardData, useUserModules | 2 |
| useState + useEffect | useRecentActivities, useUserClassroom, useExercisePowerUps | 3 |
| Zustand store | useProfileData, useAchievementsEnhanced | 2 |
| Local state only | useExerciseState, useSwipeGesture, useResponsiveLayout | 3 |
| Composition | useStudentPageSetup, useAvatarUpdate, useExerciseAutoSave | 3 |

**Recommendation:** Migrate `useRecentActivities` and `useUserClassroom` to React Query for consistency. **[P2]**

---

## 8. Issues y Recomendaciones

### P0 - Critical (0)

None identified. The student portal is production-ready.

### P1 - High Priority (4)

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| P1-001 | Dead code: LegacyExercisePage | `pages/LegacyExercisePage.tsx` | 993 lines of dead code. Not routed, not imported. DELETE recommended. |
| P1-002 | Hardcoded streak | `pages/EnhancedProfilePage.tsx:73` | `'7 dias'` hardcoded instead of from backend data |
| P1-003 | Legacy pages outside student dir | `src/pages/MyProgressPage.tsx`, `src/pages/ModuleDetailsPage.tsx` | 2 pages live outside `apps/student/pages/`. Use useState+useEffect instead of React Query. Should be migrated. |
| P1-004 | VerdaderoFalso.SECURE.tsx unused | `features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise.SECURE.tsx` | Exists but not registered in registry. Unclear if it should replace the regular version. |

### P2 - Medium Priority (5)

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| P2-001 | i18n inconsistency (FriendsPage) | `pages/FriendsPage.tsx` | UI labels in English ("My Friends", "Requests", etc.) while rest of portal is Spanish |
| P2-002 | i18n inconsistency (GuildsPage) | `pages/GuildsPage.tsx` | UI labels in English ("Discover Guilds", "My Guild", etc.) |
| P2-003 | i18n inconsistency (InventoryPage) | `pages/InventoryPage.tsx` | UI labels in English ("All Items", "Cosmetics", "My Inventory", etc.) |
| P2-004 | Deprecated EmailVerificationPage | `pages/EmailVerificationPage.tsx` | Deprecated since 2025-10 but still routed. Consider removing or adding redirect. |
| P2-005 | Hook pattern inconsistency | `hooks/useRecentActivities.ts`, `hooks/useUserClassroom.ts` | Use useState+useEffect instead of React Query pattern |

### P3 - Low Priority (3)

| ID | Issue | Location | Description |
|----|-------|----------|-------------|
| P3-001 | TODO in DashboardComplete | `pages/DashboardComplete.tsx:71` | `// TODO: Get from backend` for nextRank field |
| P3-002 | Missing mockData for AnalisisMemes | `features/mechanics/module4/AnalisisMemes/` | No mock data file (all other mechanics have one) |
| P3-003 | MechanicType in mechanicsAPI outdated | `features/mechanics/shared/api/mechanicsAPI.ts:20-28` | Lists old mechanic types ('wordoku', 'ahorcado', etc.) that don't match current registry |

---

## 9. Cobertura de Documentacion

### 9.1 Portal Documentation (`docs/60-portals/student/`)

| Document | Content | Status |
|----------|---------|--------|
| PORTAL-STUDENT-GUIDE.md | Main student portal guide | Exists |
| specs/SPEC-DASHBOARD.md | Dashboard specifications | Exists |
| specs/SPEC-GAMIFICATION.md | Gamification system spec | Exists |
| specs/SPEC-MODULES.md | Modules spec | Exists |
| specs/SPEC-MULTIMEDIA.md | Multimedia spec | Exists |
| specs/SPEC-PDF-EXCEL.md | PDF/Excel export spec | Exists |
| specs/SPEC-PROFILE.md | Profile spec | Exists |
| specs/SPEC-PROGRESS.md | Progress spec | Exists |
| specs/SPEC-SOCIAL.md | Social features spec | Exists |
| specs/SPEC-ACHIEVEMENTS.md | Achievements spec | Exists |
| specs/SPEC-EXERCISES.md | Exercises spec | Exists |
| specs/SPEC-API-CONTRACTS.md | API contracts spec | Exists |
| specs/AUTH-PAGES-SPEC.md | Auth pages spec | Exists |
| specs/ASSIGNMENTS-SPEC.md | Assignments spec | Exists |
| specs/STUDENT-HOOKS-SPEC.md | Hooks spec | Exists |

### 9.2 UX/UI Flow Documentation (`docs/30-ux-ui/flujos/student/`)

| Flow Document | Route/Feature Covered |
|--------------|----------------------|
| FLUJO-DASHBOARD-ACADEMICO.md | /dashboard |
| FLUJO-DASHBOARD-PROGRESO.md | /dashboard progress section |
| FLUJO-PAGINA-APRENDIZAJE.md | /learning |
| FLUJO-EJERCICIO-COMPLETO.md | /exercises/:id (full flow) |
| FLUJO-EJERCICIO-M3-M5.md | M3-M5 manual review exercises |
| FLUJO-PROGRESO-ACADEMICO.md | /progress |
| FLUJO-LOGROS-MISIONES-CLAIM.md | /achievements, /missions |
| FLUJO-LEADERBOARDS.md | /leaderboard |
| FLUJO-TIENDA-OVERVIEW.md | /shop (overview) |
| FLUJO-TIENDA-COMPRA.md | /shop (purchase flow) |
| FLUJO-INVENTARIO-ITEMS.md | /inventory |
| FLUJO-COMPRA-INVENTARIO-EQUIPAR.md | /shop -> /inventory equip flow |
| FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md | Cosmetic equip flow |
| FLUJO-AMIGOS.md | /friends |
| FLUJO-GREMIOS.md | /guilds |
| FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md | /profile, /settings |
| FLUJO-PERSONALIZACION-AVATAR.md | Avatar customization |
| FLUJO-PERFIL-NOTIFICACIONES.md | /notifications |
| FLUJO-SETTINGS-NOTIFICACIONES.md | /settings/notifications |
| FLUJO-SETTINGS-DISPOSITIVOS.md | /settings/devices |
| FLUJO-ASIGNACIONES-ESTUDIANTE.md | /assignments |

**Total:** 21 flow documents covering all student portal routes.

### 9.3 Documentation Gaps

| Missing Documentation | Priority |
|----------------------|----------|
| No spec for FriendsPage tabs/UX details | P3 |
| No spec for GuildsPage tabs/UX details | P3 |
| No spec for DeviceManagementSection details | P3 |
| No spec for InventoryPage equip/powerup flow | P3 |
| VerdaderoFalso.SECURE variant not documented | P2 |
| Exercise registry pattern not documented in specs | P2 |

---

## 10. Resumen Ejecutivo

### Metricas Finales

| Metrica | Valor |
|---------|-------|
| Pages routed (App.tsx) | 24 (20 student-only + 2 shared-portal + 2 public auth) |
| Pages in `apps/student/pages/` | 22 files (+ 7 settings sub-components) |
| Pages outside student dir | 2 (MyProgressPage, ModuleDetailsPage in `src/pages/`) |
| Components (production) | ~83 in `apps/student/components/` |
| Hooks | 14 in `apps/student/hooks/` |
| Exercise mechanics (registered) | 34 (30 main + 4 auxiliary) |
| Registry type keys | 38 (some mechanics have aliases) |
| Mechanic components | 55 TSX files in `features/mechanics/` |
| Mechanic type files | 30 |
| Mechanic schema files | 30 |
| Mechanic mock data files | 29 (missing: AnalisisMemes) |
| Dedicated mechanic API files | 5 (M2: 1, M3: 4) |
| Flow documents | 21 |
| Spec documents | 15 |
| Dead code files | 1 (LegacyExercisePage, 993 lines) |
| Deprecated files | 1 (EmailVerificationPage) |
| P1 issues | 4 |
| P2 issues | 5 |
| P3 issues | 3 |

### Architecture Assessment

The student portal follows a **clean, well-structured architecture**:

1. **Page Shell Pattern:** `StudentPageShell` eliminates boilerplate across 18+ pages
2. **Exercise Registry Pattern:** Decoupled mechanics registration from page logic (34 mechanics, single registration point)
3. **Thin Shell + Context:** ExercisePage (33 lines) delegates to ExerciseContext + ExerciseLayout
4. **React Query for server state:** Dashboard and modules use React Query with proper cache management
5. **Feature-based organization:** Mechanics organized by module (module1-5 + auxiliar)
6. **Complete adapter layer:** 22 adapter functions handle backend-to-frontend data transformation

**Primary concern:** The LegacyExercisePage (993 lines) should be deleted. Secondary concerns are i18n inconsistency in social features (Friends, Guilds, Inventory pages using English labels) and two legacy pages outside the student directory that don't follow React Query patterns.

---

*Generado: 2026-02-21 | Agente: Claude Opus 4.6 | Modo: ANALYSIS*
