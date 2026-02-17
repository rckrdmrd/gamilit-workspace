# Matriz de Trazabilidad de Flujos

**Version:** 1.4.0
**Fecha:** 2026-02-17

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
| FL-STU-03 | [FLUJO-TIENDA-COMPRA.md](./student/FLUJO-TIENDA-COMPRA.md) | `apps/student/pages/ShopPage.tsx` (boton comprar) | `/api/v1/gamification/shop/purchase`, `shop.service.ts` | `gamification_system.shop_items`, `user_purchases`, `ml_coins_transactions`, `user_stats` |
| FL-STU-04 | [FLUJO-LOGROS-MISIONES-CLAIM.md](./student/FLUJO-LOGROS-MISIONES-CLAIM.md) | `pages/AchievementsPage.tsx`, `apps/student/pages/MissionsPage.tsx` | `/api/v1/gamification/achievements/:id/claim`, `/api/v1/gamification/missions/:id/claim` | `gamification_system.user_achievements`, `missions`, `ml_coins_transactions`, `user_stats` |
| FL-SHR-01 | [FLUJO-PERFIL-CONFIGURACION.md](./shared/FLUJO-PERFIL-CONFIGURACION.md) | `apps/student/pages/SettingsPage.tsx`, `apps/teacher/pages/TeacherSettingsPage.tsx`, `apps/admin/components/settings/*` | `/api/v1/profile/:userId`, `/api/auth/profile` | `auth_management.profiles`, `auth.users` |
| FL-TCH-01 | [FLUJO-REVISION-MANUAL-M3-M5.md](./teacher/FLUJO-REVISION-MANUAL-M3-M5.md) | `apps/teacher/pages/TeacherReviewPanelPage.tsx`, `apps/teacher/components/review-panel/ReviewDetail.tsx` | `/api/v1/teacher/reviews/*`, `manual-review.service.ts` | `progress_tracking.manual_reviews`, `exercise_submissions`, `gamification_system.user_stats` |
| FL-TCH-02 | [FLUJO-ASIGNACIONES-CLASE.md](./teacher/FLUJO-ASIGNACIONES-CLASE.md) | `apps/teacher/pages/TeacherAssignments.tsx`, `apps/teacher/components/assignments/AssignmentCreator.tsx` | `/api/v1/teacher/assignments/*` | `educational_content.*`, `progress_tracking.*` |
| FL-TCH-03 | [FLUJO-MONITOREO-ALERTAS.md](./teacher/FLUJO-MONITOREO-ALERTAS.md) | `apps/teacher/pages/TeacherAlertsPage.tsx`, `apps/teacher/components/alerts/AlertCard.tsx` | `/api/v1/teacher/alerts/*` | `notifications.*`, `analytics.*` |
| FL-ADM-01 | [FLUJO-GESTION-USUARIOS-ROLES.md](./admin/FLUJO-GESTION-USUARIOS-ROLES.md) | `apps/admin/pages/AdminUsersPage.tsx` | `/api/v1/admin/users/*`, `/api/v1/admin/roles/*` | `auth.users`, `auth_management.user_roles`, `auth_management.profiles` |
| FL-ADM-02 | [FLUJO-CONFIGURACION-SISTEMA.md](./admin/FLUJO-CONFIGURACION-SISTEMA.md) | `apps/admin/pages/AdminAdvancedPage.tsx`, `apps/admin/components/settings/*` | `/api/v1/settings/*`, `/api/v1/admin/config/*` | `platform_settings.*`, `audit.*` |
| FL-ADM-03 | [FLUJO-APROBACION-CONTENIDO.md](./admin/FLUJO-APROBACION-CONTENIDO.md) | `apps/admin/components/content/ContentApprovalQueue.tsx` | `/api/v1/admin/content/approvals/*` | `educational_content.content_approvals`, `educational_content.content_tags` |
| FL-ADM-04 | [FLUJO-MONITOREO-SISTEMA.md](./admin/FLUJO-MONITOREO-SISTEMA.md) | `apps/admin/components/monitoring/SystemHealthIndicators.tsx` | `/health`, `/api/v1/admin/monitoring/*` | `monitoring.*`, `audit.*` |
| FL-PRN-01 | [FLUJO-VINCULACION-PADRE-ESTUDIANTE.md](./parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md) | `portal padres (vinculacion)` | `/api/v1/parents/links/*` | `auth_management.parent_student_links`, `auth_management.parent_accounts`, `auth_management.profiles` |
| FL-PRN-02 | [FLUJO-SEGUIMIENTO-PROGRESO.md](./parents/FLUJO-SEGUIMIENTO-PROGRESO.md) | `portal padres (dashboard progreso)` | `/api/v1/parents/students/:id/progress` | `progress_tracking.*`, `analytics.*` |
| FL-PRN-03 | [FLUJO-NOTIFICACIONES-PADRES.md](./parents/FLUJO-NOTIFICACIONES-PADRES.md) | `portal padres (inbox)` | `/api/v1/parents/notifications/*` | `notifications.*`, `communication.*` |
| FL-STU-07 | [FLUJO-TIENDA-OVERVIEW.md](./student/FLUJO-TIENDA-OVERVIEW.md) | `apps/student/pages/ShopPage.tsx` | `/gamification/shop/categories`, `/gamification/shop/items`, `/gamification/shop/purchases/:userId` | `gamification_system.shop_categories`, `shop_items`, `user_purchases` |
| FL-STU-08 | [FLUJO-INVENTARIO-ITEMS.md](./student/FLUJO-INVENTARIO-ITEMS.md) | `apps/student/pages/InventoryPage.tsx` | `/gamification/comodines/users/:userId/inventory`, `/gamification/comodines/use` | `gamification_system.comodines_inventory`, `comodin_usage_log` |
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
| FL-TCH-04 | [FLUJO-ANALYTICS-REPORTES.md](./teacher/FLUJO-ANALYTICS-REPORTES.md) | `apps/teacher/pages/TeacherAnalytics.tsx`, `apps/teacher/pages/TeacherReportsPage.tsx` | `/api/v1/analytics/*`, `/api/v1/reports/*` | `analytics.*`, `data_warehouse.*` |
| FL-TCH-05 | [FLUJO-GESTION-CONTENIDO.md](./teacher/FLUJO-GESTION-CONTENIDO.md) | `apps/teacher/pages/TeacherContentManagement.tsx` | `/api/v1/content/*`, `/api/v1/teacher/content/*` | `educational_content.content_items`, `educational_content.content_templates` |
| FL-TCH-06 | [FLUJO-LOGIN-DOCENTE.md](./teacher/FLUJO-LOGIN-DOCENTE.md) | `apps/teacher/layouts/TeacherLayout.tsx` | `/auth/login` (role-based redirect) | `auth.users`, `auth_management.profiles`, `auth_management.user_roles` |
| FL-ADM-07 | [FLUJO-CONSTRUCTOR-EJERCICIOS.md](./admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md) | `apps/admin/pages/AdminExerciseCreatePage.tsx`, `apps/admin/components/exercise-builder/*` | `/api/v1/educational/exercises`, `/api/v1/educational/exercises/:id` | `educational_content.exercises`, `educational_content.exercise_options` |
| FL-ADM-08 | [FLUJO-GESTION-GAMIFICACION.md](./admin/FLUJO-GESTION-GAMIFICACION.md) | `apps/admin/components/gamification/AchievementsTab.tsx` | `/api/v1/gamification/achievements/*`, `/api/v1/gamification/missions/*` | `gamification_system.achievements`, `gamification_system.mission_templates` |
| FL-SHR-03 | [FLUJO-WHITE-LABEL-THEMING.md](./shared/FLUJO-WHITE-LABEL-THEMING.md) | `features/admin/branding/BrandingSettingsPage.tsx` | `/api/v1/tenants/:id/branding`, `/api/v1/tenants/:id/theme` | `auth_management.tenants`, `auth_management.tenant_settings` |

---

## Notas de consistencia

1. Las rutas y nombres de endpoints deben contrastarse contra [docs/40-api/API-REFERENCE.md](../../40-api/API-REFERENCE.md).
2. La cobertura global debe revisarse contra los inventarios SSOT en `orchestration/inventarios/`.
3. Cualquier gap entre flujo y comportamiento real debe registrarse en [VALIDACION-ANALISIS-VS-INTEGRACION.md](./VALIDACION-ANALISIS-VS-INTEGRACION.md).
4. Para cobertura total usar tambien [COBERTURA-TOTAL-PROCESOS.md](./COBERTURA-TOTAL-PROCESOS.md) y [AUDITORIA-RESIDUAL-FULL.md](./AUDITORIA-RESIDUAL-FULL.md).
