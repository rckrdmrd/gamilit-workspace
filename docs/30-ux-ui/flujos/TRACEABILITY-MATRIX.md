---
titulo: Matriz de Trazabilidad de Flujos
tipo: flujo
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-03-03"
estado: activo
---

# Matriz de Trazabilidad de Flujos

**Version:** 1.9.0
**Fecha:** 2026-03-03

> **Nota 3NF:** Este archivo y `COBERTURA-TOTAL-PROCESOS.md` comparten ~80% de datos. El SSOT unificado es `orchestration/inventarios/CROSS-REFERENCE-MASTER.yml`. Este archivo aporta: 11 flujos adicionales (FL-STU-16..20, FL-TCH-08/09, FL-ADM-09..11) y detalle fino de componentes FE.

---

## Convenciones

- **Definicion:** documento funcional/requisito/guia aplicable.
- **FE:** pagina/componente de accion/hook-store/api service.
- **BE:** endpoint/controller/service.
- **DB:** tablas o artefactos de datos implicados.

---

## Matriz

| Flujo ID | Definicion | Frontend (accion) | Backend (endpoint/capa) | Datos implicados |
|----------|------------|-------------------|--------------------------|------------------|
| FL-AUTH-01 | [FLUJO-REGISTRO-LOGIN.md](./auth/FLUJO-REGISTRO-LOGIN.md) | `features/auth/components/RegisterForm.tsx`, `features/auth/components/LoginForm.tsx` | `/auth/register`, `/auth/login` en `modules/auth` | `auth_management.profiles`, `auth.users`, `gamification_system.user_stats` |
| FL-AUTH-02 | [FLUJO-RECUPERACION-PASSWORD.md](./auth/FLUJO-RECUPERACION-PASSWORD.md) | `pages/auth/ForgotPasswordPage.tsx`, `apps/student/pages/PasswordResetPage.tsx` | `/auth/forgot-password`, `/auth/reset-password` | `auth_management.password_reset_tokens`, `auth.users` |
| FL-AUTH-03 | [FLUJO-VERIFICACION-EMAIL.md](./auth/FLUJO-VERIFICACION-EMAIL.md) | `features/auth/store/authStore.ts` (estado de verificacion) | `modules/auth/services/email-verification.service.ts` | `auth_management.email_verification_tokens`, `auth.users` |
| FL-STU-01 | [FLUJO-EJERCICIO-COMPLETO.md](./student/FLUJO-EJERCICIO-COMPLETO.md) | `apps/student/pages/ExercisePage.tsx` (guardar/enviar) | `/api/v1/progress/submissions/submit`, `exercise-grading.service.ts` | `progress_tracking.exercise_attempts`, `progress_tracking.exercise_submissions`, `gamification_system.user_stats` |
| FL-STU-02 | [FLUJO-EJERCICIO-M3-M5.md](./student/FLUJO-EJERCICIO-M3-M5.md) | `apps/student/pages/ExercisePage.tsx` (submit para revision) | `/api/v1/progress/submissions/submit`, `teacher/manual-review` | `progress_tracking.manual_reviews`, `progress_tracking.exercise_submissions` |
| FL-STU-03 | [FLUJO-TIENDA-COMPRA.md](./student/FLUJO-TIENDA-COMPRA.md) | `apps/student/pages/ShopPage.tsx` (boton comprar) | `/api/v1/gamification/shop/purchase`, `shop.service.ts`, `boost.service.ts` (activacion post-compra para xp_boost/coins_boost) | `gamification_system.shop_items`, `user_purchases`, `ml_coins_transactions`, `user_stats`, `active_boosts` |
| FL-STU-20 | [FLUJO-COMPRA-INVENTARIO-EQUIPAR.md](./student/FLUJO-COMPRA-INVENTARIO-EQUIPAR.md) **(Compuesto)** | `apps/student/pages/ShopPage.tsx`, `apps/student/pages/InventoryPage.tsx` | Sub-flujos: FL-STU-03, FL-STU-19 | `gamification_system.shop_items`, `user_purchases`, `user_equipped_items`, `ml_coins_transactions` |
| FL-STU-21 | [FLUJO-TIENDA-COMPRA.md](./student/FLUJO-TIENDA-COMPRA.md) (rama boost) | `shared/components/layout/GamifiedHeader.tsx` (indicador de boost activo) | `GET /api/v1/gamification/boosts/:userId/active`, `boost.controller.ts`, `boost.service.ts` | `gamification_system.active_boosts` |
| FL-STU-04 | [FLUJO-LOGROS-MISIONES-CLAIM.md](./student/FLUJO-LOGROS-MISIONES-CLAIM.md) | `apps/student/pages/AchievementsPage.tsx`, `apps/student/pages/MissionsPage.tsx` | `/api/v1/gamification/achievements/:id/claim`, `/api/v1/gamification/missions/:id/claim` | `gamification_system.user_achievements`, `missions`, `ml_coins_transactions`, `user_stats` |
| FL-STU-05 | [FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md](./student/FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md) v1.2.0 **(Compuesto)** | `apps/student/pages/SettingsPage.tsx` (orquestador) + `settings/ProfileSection.tsx`, `AccountSection.tsx`, `NotificationsSection.tsx`, `PrivacySection.tsx` | Sub-flujos: FL-SHR-01, FL-STU-11, FL-STU-12 | `auth_management.profiles`, `auth.users`, `notifications.notification_preferences` |
| FL-STU-06 | [FLUJO-DASHBOARD-ACADEMICO.md](./student/FLUJO-DASHBOARD-ACADEMICO.md) **(Compuesto)** | `apps/student/pages/DashboardComplete.tsx` (orquestador) | Sub-flujos: FL-STU-13, FL-STU-01, FL-STU-04, FL-STU-15 | `progress_tracking.*`, `gamification_system.*`, `educational_content.*` |
| FL-SHR-01 | [FLUJO-PERFIL-CONFIGURACION.md](./shared/FLUJO-PERFIL-CONFIGURACION.md) v1.1.0 | `apps/student/pages/settings/ProfileSection.tsx` + `AvatarSelectionModal.tsx`, `apps/teacher/pages/TeacherSettings.tsx`, `apps/admin/components/settings/*` | `PUT /users/profile` (avatar DiceBear URL, display_name, bio) | `auth_management.profiles`, `auth.users` |
| FL-SHR-02 | [FLUJO-SESION-SEGURIDAD.md](./shared/FLUJO-SESION-SEGURIDAD.md) **(Compuesto)** | `features/auth/components/RegisterForm.tsx`, `LoginForm.tsx`, `ForgotPasswordPage.tsx`, `PasswordResetPage.tsx` | Sub-flujos: FL-AUTH-01, FL-AUTH-02, FL-AUTH-03 | `auth.users`, `auth_management.profiles`, `auth_management.password_reset_tokens`, `auth_management.email_verification_tokens` |
| FL-TCH-01 | [FLUJO-REVISION-MANUAL-M3-M5.md](./teacher/FLUJO-REVISION-MANUAL-M3-M5.md) | `apps/teacher/pages/TeacherReviewPanel.tsx`, `apps/teacher/components/review-panel/ReviewDetail.tsx` | `/api/v1/teacher/reviews/*`, `manual-review.service.ts` | `progress_tracking.manual_reviews`, `exercise_submissions`, `gamification_system.user_stats` |
| FL-TCH-02 | [FLUJO-ASIGNACIONES-CLASE.md](./teacher/FLUJO-ASIGNACIONES-CLASE.md) | `apps/teacher/pages/TeacherAssignments.tsx`, `apps/teacher/components/assignments/AssignmentCreator.tsx` | `/api/v1/teacher/assignments/*` | `educational_content.*`, `progress_tracking.*` |
| FL-TCH-03 | [FLUJO-MONITOREO-ALERTAS.md](./teacher/FLUJO-MONITOREO-ALERTAS.md) v1.1.0 | `apps/teacher/pages/TeacherAlerts.tsx`, `apps/teacher/components/alerts/AlertCard.tsx`, `TeacherMonitoringPage.tsx`, `useClassroomRealtime.ts` | `/api/v1/teacher/alerts/*`, WebSocket: 7 eventos (exercise_started/completed, achievement_unlocked, level_up, student_online/offline, help_requested) | `progress_tracking.student_intervention_alerts`, `progress_tracking.alert_configurations` |
| FL-ADM-01 | [FLUJO-GESTION-USUARIOS-ROLES.md](./admin/FLUJO-GESTION-USUARIOS-ROLES.md) | `apps/admin/pages/AdminUsersPage.tsx` | `/api/v1/admin/users/*`, `/api/v1/admin/roles/*` | `auth.users`, `auth_management.user_roles`, `auth_management.profiles` |
| FL-ADM-02 | [FLUJO-CONFIGURACION-SISTEMA.md](./admin/FLUJO-CONFIGURACION-SISTEMA.md) v1.1.0 | `apps/admin/pages/AdminAdvancedPage.tsx`, `apps/admin/components/shared/AdminPageShell.tsx`, `apps/admin/components/shared/AdminTabBar.tsx`, `apps/admin/components/settings/*` | `/api/v1/settings/*`, `/api/v1/admin/config/*` | `system_configuration.*`, `audit.*` |
| FL-ADM-03 | [FLUJO-APROBACION-CONTENIDO.md](./admin/FLUJO-APROBACION-CONTENIDO.md) v1.1.0 | `apps/admin/pages/AdminContentPage.tsx`, `apps/admin/components/content/ContentPreviewModal.tsx`, `ContentVersionsTab.tsx`, `MediaLibraryTab.tsx`, `PendingExercisesTab.tsx`, `RejectExerciseModal.tsx`, `apps/admin/hooks/useContentQueries.ts` | `/api/v1/admin/content/approvals/*` | `educational_content.content_approvals`, `educational_content.content_tags` |
| FL-ADM-04 | [FLUJO-MONITOREO-SISTEMA.md](./admin/FLUJO-MONITOREO-SISTEMA.md) v1.1.0 | `apps/admin/pages/AdminMonitoringPage.tsx`, `apps/admin/components/shared/AdminPageShell.tsx`, `AdminTabBar.tsx`, `apps/admin/components/monitoring/SystemHealthIndicators.tsx` | `/health`, `/api/v1/admin/monitoring/*` | `audit_logging.*`, `audit.*` |
| FL-PRN-01 | [FLUJO-VINCULACION-PADRE-ESTUDIANTE.md](./parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md) | `portal padres (vinculacion)` | `/api/v1/parents/links/*` | `auth_management.parent_student_links`, `auth_management.parent_accounts`, `auth_management.profiles` |
| FL-PRN-02 | [FLUJO-SEGUIMIENTO-PROGRESO.md](./parents/FLUJO-SEGUIMIENTO-PROGRESO.md) | `portal padres (dashboard progreso)` | `/api/v1/parents/students/:id/progress` | `progress_tracking.*`, `analytics.*` |
| FL-PRN-03 | [FLUJO-NOTIFICACIONES-PADRES.md](./parents/FLUJO-NOTIFICACIONES-PADRES.md) | `portal padres (inbox)` | `/api/v1/parents/notifications/*` | `notifications.*`, `communication.*` |
| FL-STU-07 | [FLUJO-TIENDA-OVERVIEW.md](./student/FLUJO-TIENDA-OVERVIEW.md) | `apps/student/pages/ShopPage.tsx` | `/gamification/shop/categories`, `/gamification/shop/items`, `/gamification/shop/purchases/:userId` | `gamification_system.shop_categories`, `shop_items`, `user_purchases` |
| FL-STU-08 | [FLUJO-INVENTARIO-ITEMS.md](./student/FLUJO-INVENTARIO-ITEMS.md) | `apps/student/pages/InventoryPage.tsx` | `/gamification/comodines/users/:userId/inventory`, `/gamification/comodines/use` | `gamification_system.comodines_inventory`, `comodin_usage_log` |
| FL-STU-19 | [FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md](./student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md) | `apps/student/pages/InventoryPage.tsx`, `apps/student/components/profile/ProfileInventoryTab.tsx`, `features/gamification/social/hooks/useEquipment.ts` | `/gamification/inventory/equipped`, `/gamification/inventory/equip`, `/gamification/inventory/unequip` | `gamification_system.user_equipped_items`, `shop_items`, `user_purchases` |
| FL-STU-09 | [FLUJO-AMIGOS.md](./student/FLUJO-AMIGOS.md) | `apps/student/pages/FriendsPage.tsx` | `/social/users/:userId/friends`, `/social/friendships/request`, `/social/activities/feed` | `social_features.friendships`, `friend_requests`, `user_activities` |
| FL-STU-10 | [FLUJO-GREMIOS.md](./student/FLUJO-GREMIOS.md) | `apps/student/pages/GuildsPage.tsx` | `/social/teams`, `/social/teams/:teamId/members/:userId` | `social_features.guilds`, `guild_members` |
| FL-STU-11 | [FLUJO-SETTINGS-DISPOSITIVOS.md](./student/FLUJO-SETTINGS-DISPOSITIVOS.md) | `apps/student/pages/DeviceManagementSection.tsx` | `/notifications/devices`, `/notifications/devices/:id` | `notifications.user_devices` |
| FL-STU-12 | [FLUJO-SETTINGS-NOTIFICACIONES.md](./student/FLUJO-SETTINGS-NOTIFICACIONES.md) | `apps/student/pages/NotificationPreferencesPage.tsx` | `/notifications/preferences`, `/notifications/preferences/:type` | `notifications.notification_preferences` |
| FL-ADM-05 | [FLUJO-INTEGRACIONES-LTI.md](./admin/FLUJO-INTEGRACIONES-LTI.md) | `features/admin/lti/AdminLtiPage.tsx` | `/lti/consumers`, `/lti/consumers/:id`, `/lti/consumers/:id/test-connection` | `lti_integration.lti_consumers` |
| FL-ADM-06 | [FLUJO-AUDIT-LOGS.md](./admin/FLUJO-AUDIT-LOGS.md) | `apps/admin/pages/AdminAuditLogsPage.tsx` | `/admin/system/audit-log` | `audit_logging.system_logs`, `audit_logging.user_activity`, `auth_management.login_attempts` |
| FL-PRN-04 | [FLUJO-LOGIN-PADRES.md](./parents/FLUJO-LOGIN-PADRES.md) | `apps/parent/pages/ParentLoginPage.tsx` | `/parent-portal/auth/login` | `auth.users`, `auth_management.parent_accounts` |
| FL-PRN-05 | [FLUJO-REGISTRO-PADRES.md](./parents/FLUJO-REGISTRO-PADRES.md) | `apps/parent/pages/ParentRegisterPage.tsx` | `/parent-portal/auth/register` | `auth.users`, `auth_management.parent_accounts` |
| FL-PRN-06 | [FLUJO-DASHBOARD-PADRES.md](./parents/FLUJO-DASHBOARD-PADRES.md) | `apps/parent/pages/ParentDashboardPage.tsx` | `/parent-portal/dashboard`, `/parent-portal/students` | `auth_management.parent_student_links`, `progress_tracking.*`, `analytics.*` |
| FL-PRN-07 | [FLUJO-PROGRESO-HIJO.md](./parents/FLUJO-PROGRESO-HIJO.md) | `apps/parent/pages/ChildProgressPage.tsx` | `/parent-portal/students/:id/progress` | `progress_tracking.*`, `analytics.*` |
| FL-STU-13 | [FLUJO-DASHBOARD-PROGRESO.md](./student/FLUJO-DASHBOARD-PROGRESO.md) | `apps/student/pages/DashboardComplete.tsx`, `apps/student/hooks/useDashboardData.ts` | `/api/v1/progress/*`, `/api/v1/gamification/user-stats/*` | `progress_tracking.module_progress`, `gamification_system.user_stats` |
| FL-STU-14 | [FLUJO-LEADERBOARDS.md](./student/FLUJO-LEADERBOARDS.md) | `apps/student/pages/LeaderboardPage.tsx`, `features/gamification/social/store/leaderboardsStore.ts` | `/api/v1/social/leaderboards/*` | `social_features.leaderboard_entries`, `gamification_system.user_stats` |
| FL-STU-15 | [FLUJO-PAGINA-APRENDIZAJE.md](./student/FLUJO-PAGINA-APRENDIZAJE.md) | `apps/student/pages/LearningPage.tsx` | `/api/v1/educational/modules/*`, `/api/v1/educational/exercises/*` | `educational_content.modules`, `educational_content.exercises` |
| FL-STU-16 | [FLUJO-PROGRESO-ACADEMICO.md](./student/FLUJO-PROGRESO-ACADEMICO.md) | `apps/student/pages/MyProgressPage.tsx`, `apps/student/pages/ModuleDetailsPage.tsx` | `/api/v1/progress/modules/*`, `module-progress.controller.ts`, `exercise-attempt.controller.ts` | `progress_tracking.module_progress`, `progress_tracking.exercise_attempts`, `progress_tracking.learning_sessions` |
| FL-STU-17 | [FLUJO-ASIGNACIONES-ESTUDIANTE.md](./student/FLUJO-ASIGNACIONES-ESTUDIANTE.md) | `apps/student/pages/AssignmentsPage.tsx`, `apps/student/pages/AssignmentDetailPage.tsx` | `/api/v1/assignments/*`, `assignment.controller.ts`, `assignment-student.controller.ts` | `educational_content.assignments`, `educational_content.assignment_students`, `educational_content.assignment_submissions` |
| FL-STU-18 | [FLUJO-PERFIL-NOTIFICACIONES.md](./student/FLUJO-PERFIL-NOTIFICACIONES.md) | `apps/student/pages/EnhancedProfilePage.tsx`, `apps/student/pages/NotificationsPage.tsx` | `/api/v1/profile/*`, `/api/v1/notifications/*`, `profile.controller.ts`, `notifications.controller.ts` | `auth_management.profiles`, `notifications.notifications`, `notifications.notification_preferences` |
| FL-TCH-04 | [FLUJO-ANALYTICS-REPORTES.md](./teacher/FLUJO-ANALYTICS-REPORTES.md) v1.1.0 | `apps/teacher/pages/TeacherAnalytics.tsx`, `apps/teacher/pages/TeacherReports.tsx`, `ScheduledReportsTab.tsx`, `SharedReportsTab.tsx` | `/api/v1/teacher/analytics/*`, `/api/v1/teacher/reports/*`, `scheduledReportsApi` (7ep), `sharedReportsApi` (6ep) | `progress_tracking.*`, `gamification_system.*`, `social_features.teacher_reports`, `social_features.scheduled_reports`, `social_features.shared_reports` |
| FL-TCH-05 | [FLUJO-GESTION-CONTENIDO.md](./teacher/FLUJO-GESTION-CONTENIDO.md) | `apps/teacher/pages/TeacherContentManagement.tsx` | `/api/v1/content/*`, `/api/v1/teacher/content/*` | `educational_content.content_items`, `educational_content.content_templates` |
| FL-TCH-06 | [FLUJO-LOGIN-DOCENTE.md](./teacher/FLUJO-LOGIN-DOCENTE.md) | `apps/teacher/layouts/TeacherLayout.tsx` | `/auth/login` (role-based redirect) | `auth.users`, `auth_management.profiles`, `auth_management.user_roles` |
| FL-TCH-07 | [FLUJO-PERFIL-CONFIGURACION.md](./shared/FLUJO-PERFIL-CONFIGURACION.md) | `apps/teacher/pages/TeacherSettings.tsx` | `/api/v1/teacher/settings/*`, `/api/v1/messages/*` | `auth_management.profiles`, `communication.*` |
| FL-TCH-08 | [FLUJO-DASHBOARD-DOCENTE.md](./teacher/FLUJO-DASHBOARD-DOCENTE.md) | `apps/teacher/pages/TeacherDashboardPage.tsx` | `/api/v1/teacher/dashboard/*`, `teacher.controller.ts` | `social_features.teacher_classrooms`, `progress_tracking.module_progress`, `progress_tracking.exercise_attempts`, `gamification_system.user_stats` |
| FL-TCH-09 | [FLUJO-GESTION-CLASES.md](./teacher/FLUJO-GESTION-CLASES.md) | `apps/teacher/pages/TeacherClassesPage.tsx`, `apps/teacher/pages/TeacherStudentsPage.tsx` | `/api/v1/teacher/classrooms/*`, `teacher-classrooms.controller.ts`, `classrooms.controller.ts` | `social_features.classrooms`, `social_features.classroom_members`, `auth_management.profiles` |
| FL-ADM-07 | [FLUJO-CONSTRUCTOR-EJERCICIOS.md](./admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md) v1.2.0 | `apps/admin/pages/AdminExerciseCreatePage.tsx`, `apps/admin/components/exercise-builder/StepBasicInfo.tsx`, `type-configs/index.ts`, `ExercisePreview.tsx` | `/api/v1/educational/exercises` (useMutation + apiClient.post), `/api/v1/educational/exercises/:id` | `educational_content.exercises`, `educational_content.exercise_options` |
| FL-ADM-08 | [FLUJO-GESTION-GAMIFICACION.md](./admin/FLUJO-GESTION-GAMIFICACION.md) v1.1.0 | `apps/admin/components/gamification/AchievementsTab.tsx`, `RanksTab.tsx`, `EconomyTab.tsx`, `StatsTab.tsx`, `features/gamification/social/api/achievementsAPI.ts` | `/api/v1/gamification/achievements/*`, `/api/v1/gamification/missions/*` | `gamification_system.achievements`, `gamification_system.mission_templates` |
| FL-ADM-09 | [FLUJO-DASHBOARD-ADMIN.md](./admin/FLUJO-DASHBOARD-ADMIN.md) v1.1.0 | `apps/admin/pages/AdminDashboardPage.tsx`, `components/dashboard/DashboardStatsGrid.tsx`, `SystemHealthCard.tsx`, `AlertsNotificationsCard.tsx`, `DashboardQuickActions.tsx`, `hooks/useAdminPageSetup.ts` | `/api/v1/admin/dashboard/*`, `admin-dashboard.controller.ts`, `admin-system.controller.ts` | `admin_dashboard.admin_reports`, `admin_dashboard.system_alerts`, `admin_dashboard.performance_metrics`, `audit_logging.system_logs` |
| FL-ADM-10 | [FLUJO-INSTITUCIONES-ROLES.md](./admin/FLUJO-INSTITUCIONES-ROLES.md) v1.1.0 | `apps/admin/pages/AdminInstitutionsPage.tsx`, `components/institutions/InstitutionFormModals.tsx`, `hooks/useInstitutionActions.ts`, `apps/admin/pages/AdminRolesPage.tsx` | `/api/v1/admin/organizations/*`, `/api/v1/admin/roles/*`, `admin-organizations.controller.ts`, `admin-roles.controller.ts` | `auth_management.tenants`, `auth_management.roles`, `auth_management.user_roles`, `auth_management.role_permissions` |
| FL-ADM-11 | [FLUJO-REPORTES-ANALYTICS-ADMIN.md](./admin/FLUJO-REPORTES-ANALYTICS-ADMIN.md) v1.1.0 | `apps/admin/pages/AdminReportsPage.tsx`, `apps/admin/pages/AdminAnalyticsPage.tsx`, `components/shared/AdminPageShell.tsx` | `/api/v1/admin/reports/*`, `/api/v1/admin/progress/analytics`, `admin-reports.controller.ts`, `admin-progress.controller.ts` | `admin_dashboard.admin_reports`, `data_warehouse.fact_daily_progress`, `data_warehouse.fact_exercise_completions` |
| FL-SHR-03 | [FLUJO-WHITE-LABEL-THEMING.md](./shared/FLUJO-WHITE-LABEL-THEMING.md) | `features/admin/branding/BrandingSettingsPage.tsx` | `/api/v1/tenants/:id/branding`, `/api/v1/tenants/:id/theme` | `auth_management.tenants`, `auth_management.tenant_settings` |

---

## Notas de consistencia

1. Las rutas y nombres de endpoints deben contrastarse contra [docs/40-api/API-REFERENCE.md](../../40-api/API-REFERENCE.md).
2. La cobertura global debe revisarse contra los inventarios SSOT en `orchestration/inventarios/`.
3. Cualquier gap entre flujo y comportamiento real debe registrarse en [VALIDACION-ANALISIS-VS-INTEGRACION.md](./VALIDACION-ANALISIS-VS-INTEGRACION.md).
4. Para cobertura total usar tambien [COBERTURA-TOTAL-PROCESOS.md](./COBERTURA-TOTAL-PROCESOS.md) y [AUDITORIA-RESIDUAL-FULL.md](./AUDITORIA-RESIDUAL-FULL.md).

---

## Changelog

### v1.9.0 (2026-03-03)
- **FL-STU-03** actualizado: Agregado `boost.service.ts` como componente backend participante en la compra de items tipo `xp_boost`/`coins_boost`. Tabla `active_boosts` agregada a datos implicados.
- **FL-STU-21** nuevo: Flujo de consulta de boosts activos. Documenta `GamifiedHeader.tsx` → `GET /api/v1/gamification/boosts/:userId/active` → `boost.controller.ts` → `boost.service.ts` → `active_boosts`.

### v1.8.0 (2026-02-21)
- **FL-STU-19** actualizado: Agregado `ProfileInventoryTab.tsx` como segundo punto de entrada para equipamiento. Reemplazado `useInventory.ts` (deprecado) por `useEquipment.ts` (hook canonico).

### v1.7.0 (2026-02-19)
- **FL-TCH-04** enriquecido: Agregado TabBar con 3 pestanas (Generador, Programados, Compartidos), `ScheduledReportsTab`, `SharedReportsTab`, `scheduledReportsApi` (7 endpoints), `sharedReportsApi` (6 endpoints), hooks `useScheduledReports` y `useSharedReports`. Datos actualizados a tablas reales (`social_features.*`).
- **FL-TCH-03** enriquecido: Agregada integracion WebSocket via `useClassroomRealtime` hook con 7 eventos en tiempo real, indicador de conexion y live activity feed. Degradacion graciosa documentada.
- **FL-ADM-07** actualizado: Eliminada nota de simulacion (`setTimeout`); confirmada integracion real con `useMutation` de React Query y `apiClient.post(API_ENDPOINTS.educational.exercises)`.
- **FL-ADM-05** verificado: La ruta del API service ya apuntaba correctamente a `apps/frontend/src/services/api/admin/ltiAPI.ts` (sin cambios necesarios).
