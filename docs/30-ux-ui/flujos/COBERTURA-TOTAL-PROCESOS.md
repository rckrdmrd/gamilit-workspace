# Cobertura Total de Procesos End-to-End

**Version:** 1.3.2
**Fecha:** 2026-02-17
**Estado:** Activo

---

## Objetivo

Consolidar la cobertura total de procesos del sistema en una sola matriz trazable:

`Proceso -> Requerimiento -> Pagina -> Componente/accion -> Endpoint -> Datos -> Documento`.

---

## Matriz maestra de cobertura total

| Proceso ID | Portal | Proceso | Requerimiento base | Pagina principal | Componente/accion | Endpoint/capa | Datos implicados | Documento de flujo |
|------------|--------|---------|--------------------|------------------|-------------------|---------------|------------------|--------------------|
| FL-AUTH-01 | Shared | Registro + login + inicializacion | EPIC-GAM-F1-AUTH | `pages/auth/*` | `RegisterForm`, `LoginForm` | `/auth/register`, `/auth/login` | `auth.users`, `auth_management.profiles`, `gamification_system.user_stats` | `auth/FLUJO-REGISTRO-LOGIN.md` |
| FL-AUTH-02 | Shared | Recuperacion de password | EPIC-GAM-F1-AUTH | `pages/auth/ForgotPasswordPage.tsx` | formulario reset request | `/auth/forgot-password`, `/auth/reset-password` | `auth_management.password_reset_tokens`, `auth.users` | `auth/FLUJO-RECUPERACION-PASSWORD.md` |
| FL-AUTH-03 | Shared | Verificacion de email | EPIC-GAM-F1-AUTH | `features/auth/store/authStore.ts` | estado de verificacion | `email-verification.service.ts` | `auth_management.email_verification_tokens`, `auth.users` | `auth/FLUJO-VERIFICACION-EMAIL.md` |
| FL-STU-01 | Student | Resolucion de ejercicio autocalificable (M1-M2) | EPIC-GAM-F1-EXERCISES | `apps/student/pages/ExercisePage.tsx` | guardar/enviar respuesta | `/api/v1/progress/submissions/submit` | `progress_tracking.exercise_attempts`, `exercise_submissions`, `gamification_system.user_stats` | `student/FLUJO-EJERCICIO-COMPLETO.md` |
| FL-STU-02 | Student | Resolucion de ejercicio con revision (M3-M5) | EPIC-GAM-F2-MODULES-M4M5 | `apps/student/pages/ExercisePage.tsx` | submit para revision docente | `/api/v1/progress/submissions/submit`, `teacher/reviews/*` | `progress_tracking.exercise_submissions`, `manual_reviews` | `student/FLUJO-EJERCICIO-M3-M5.md` |
| FL-STU-03 | Student | Compra en tienda + asignacion | EPIC-GAM-F1-GAMIFICATION | `apps/student/pages/ShopPage.tsx` | boton comprar | `/api/v1/gamification/shop/purchase` | `gamification_system.shop_items`, `user_purchases`, `ml_coins_transactions`, `user_stats` | `student/FLUJO-TIENDA-COMPRA.md` |
| FL-STU-04 | Student | Claim de logros y misiones | EPIC-GAM-F1-GAMIFICATION | `pages/AchievementsPage.tsx`, `apps/student/pages/MissionsPage.tsx` | boton claim reward | `/api/v1/gamification/achievements/:id/claim`, `/api/v1/gamification/missions/:id/claim` | `gamification_system.user_achievements`, `missions`, `ml_coins_transactions`, `user_stats` | `student/FLUJO-LOGROS-MISIONES-CLAIM.md` |
| FL-STU-05 | Student | Perfil y ajustes del estudiante **(Compuesto)** | EPIC-GAM-F3-PROFILES | `apps/student/pages/SettingsPage.tsx` | editar perfil/preferencias | `/api/v1/profile/:userId`, `/api/auth/profile`, `/notifications/devices`, `/notifications/preferences` | `auth_management.profiles`, `auth.users`, `notifications.user_devices`, `notifications.notification_preferences` | `student/FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md` (sub: FL-SHR-01, FL-STU-11, FL-STU-12) |
| FL-STU-06 | Student | Dashboard y progreso academico **(Compuesto)** | EPIC-GAM-F1-ANALYTICS | `apps/student/pages/DashboardComplete.tsx` | ciclo completo: dashboard, aprendizaje, ejercicio, rewards | `/api/v1/progress/*`, `/api/v1/gamification/*`, `/api/v1/educational/*` | `progress_tracking.*`, `gamification_system.*`, `educational_content.*` | `student/FLUJO-DASHBOARD-ACADEMICO.md` (sub: FL-STU-13, FL-STU-01, FL-STU-04, FL-STU-15) |
| FL-STU-07 | Student | Tienda: overview y catalogo | EPIC-GAM-F1-GAMIFICATION | `apps/student/pages/ShopPage.tsx` | ver catalogo, filtros | `/gamification/shop/categories`, `/gamification/shop/items`, `/gamification/shop/purchases/:userId` | `gamification_system.shop_categories`, `shop_items`, `user_purchases` | `student/FLUJO-TIENDA-OVERVIEW.md` |
| FL-STU-08 | Student | Inventario de items | EPIC-GAM-F1-GAMIFICATION | `apps/student/pages/InventoryPage.tsx` | ver inventario, usar power-up | `/gamification/comodines/users/:userId/inventory`, `/gamification/comodines/use` | `gamification_system.comodines_inventory`, `comodin_usage_log` | `student/FLUJO-INVENTARIO-ITEMS.md` |
| FL-STU-09 | Student | Sistema de amigos | EPIC-GAM-F3-SOCIAL-GAMIFICATION | `apps/student/pages/FriendsPage.tsx` | listar/agregar amigos | `/social/users/:userId/friends`, `/social/friendships/request`, `/social/activities/feed` | `social_features.friendships`, `friend_requests`, `user_activities` | `student/FLUJO-AMIGOS.md` |
| FL-STU-10 | Student | Gremios | EPIC-GAM-F3-SOCIAL-GAMIFICATION | `apps/student/pages/GuildsPage.tsx` | crear/gestionar gremio | `/social/teams`, `/social/teams/:teamId/members/:userId` | `social_features.guilds`, `guild_members` | `student/FLUJO-GREMIOS.md` |
| FL-STU-11 | Student | Settings dispositivos | EPIC-GAM-F3-PROFILES | `apps/student/pages/DeviceManagementSection.tsx` | gestionar dispositivos | `/notifications/devices`, `/notifications/devices/:id` | `notifications.user_devices` | `student/FLUJO-SETTINGS-DISPOSITIVOS.md` |
| FL-STU-12 | Student | Settings notificaciones | EPIC-GAM-F3-NOTIFICATIONS | `apps/student/pages/NotificationPreferencesPage.tsx` | preferencias notificaciones | `/notifications/preferences`, `/notifications/preferences/:type` | `notifications.notification_preferences` | `student/FLUJO-SETTINGS-NOTIFICACIONES.md` |
| FL-TCH-01 | Teacher | Revision manual y cierre de calificacion M3-M5 | EPIC-GAM-F3-TEACHER-PORTAL | `apps/teacher/pages/TeacherReviewPanelPage.tsx` | revisar, calificar, completar | `/api/v1/teacher/reviews/*` | `progress_tracking.manual_reviews`, `exercise_submissions`, `gamification_system.user_stats` | `teacher/FLUJO-REVISION-MANUAL-M3-M5.md` |
| FL-TCH-02 | Teacher | Gestion de asignaciones | EPIC-GAM-F3-TEACHER-PORTAL | `apps/teacher/pages/TeacherAssignments.tsx` | crear/publicar asignacion | `/api/v1/teacher/assignments/*` | `educational_content.*`, `progress_tracking.*` | `teacher/FLUJO-ASIGNACIONES-CLASE.md` |
| FL-TCH-03 | Teacher | Monitoreo y alertas docentes | EPIC-GAM-F3-NOTIFICATIONS | `apps/teacher/pages/TeacherAlertsPage.tsx` | ack/resolucion alerta | `/api/v1/teacher/alerts/*` | `notifications.*`, `analytics.*` | `teacher/FLUJO-MONITOREO-ALERTAS.md` |
| FL-TCH-07 | Teacher | Configuracion docente y mensajeria | EPIC-GAM-F3-TEACHER-PORTAL | `apps/teacher/pages/TeacherSettingsPage.tsx` | actualizar preferencias/canales | `/api/v1/teacher/settings/*`, `/api/v1/messages/*` | `auth_management.profiles`, `communication.*` | `shared/FLUJO-PERFIL-CONFIGURACION.md` |
| FL-ADM-01 | Admin | Gestion de usuarios y roles | EPIC-GAM-F1-ADMIN | `apps/admin/pages/AdminUsersPage.tsx` | alta/edicion/rol de usuario | `/api/v1/admin/users/*`, `/api/v1/admin/roles/*` | `auth.users`, `auth_management.profiles`, `auth_management.user_roles` | `admin/FLUJO-GESTION-USUARIOS-ROLES.md` |
| FL-ADM-02 | Admin | Configuracion global del sistema | EPIC-GAM-F1-CONFIG | `apps/admin/pages/AdminAdvancedPage.tsx` | guardar configuracion | `/api/v1/settings/*`, `/api/v1/admin/config/*` | `platform_settings.*` | `admin/FLUJO-CONFIGURACION-SISTEMA.md` |
| FL-ADM-03 | Admin | Aprobacion de contenido | EPIC-GAM-F3-CONTENT | `apps/admin/components/content/ContentApprovalQueue.tsx` | aprobar/rechazar contenido | `/api/v1/admin/content/approvals/*` | `educational_content.content_approvals`, `content_tags` | `admin/FLUJO-APROBACION-CONTENIDO.md` |
| FL-ADM-04 | Admin | Salud operativa y alertas de plataforma | EPIC-GAM-F3-ADMIN-EXTENDED | `apps/admin/components/monitoring/SystemHealthIndicators.tsx` | consultar indicadores/alertas | `/health`, `/api/v1/admin/monitoring/*` | `monitoring.*`, `audit.*` | `admin/FLUJO-MONITOREO-SISTEMA.md` |
| FL-ADM-05 | Admin | Integraciones LTI | EPIC-GAM-F3-LTI | `features/admin/lti/AdminLtiPage.tsx` | configurar plataforma LTI | `/lti/consumers`, `/lti/consumers/:id`, `/lti/consumers/:id/test-connection` | `lti_integration.lti_consumers` | `admin/FLUJO-INTEGRACIONES-LTI.md` |
| FL-ADM-06 | Admin | Audit logs | EPIC-GAM-F3-ADMIN-EXTENDED | `apps/admin/pages/AdminAuditLogsPage.tsx` | consultar auditoria | `/admin/system/audit-log` | `audit_logging.system_logs`, `audit_logging.user_activity`, `auth_management.login_attempts` | `admin/FLUJO-AUDIT-LOGS.md` |
| FL-PRN-01 | Parents | Vinculacion padre-estudiante | EPIC-GAM-F3-PARENT-PORTAL | Portal padres (requerimiento) | alta de vinculacion/codigo invitacion | `/api/v1/parents/links/*` | `auth_management.parent_student_links`, `auth_management.parent_accounts`, `auth_management.profiles`, `auth_management.profiles` | `parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md` |
| FL-PRN-02 | Parents | Seguimiento de progreso del estudiante | EPIC-GAM-F3-PARENT-PORTAL | Portal padres (dashboard) | ver progreso, filtros, detalle | `/api/v1/parents/students/:id/progress` | `progress_tracking.*`, `analytics.*` | `parents/FLUJO-SEGUIMIENTO-PROGRESO.md` |
| FL-PRN-03 | Parents | Notificaciones escuela-familia | EPIC-GAM-F3-PARENT-NOTIFICATIONS | Portal padres (inbox/notificaciones) | confirmar lectura/notificacion | `/api/v1/parents/notifications/*` | `notifications.*`, `communication.*` | `parents/FLUJO-NOTIFICACIONES-PADRES.md` |
| FL-PRN-04 | Parents | Login portal padres | EPIC-GAM-F3-PARENT-PORTAL | `apps/parent/pages/ParentLoginPage.tsx` | login portal padres | `/parent-portal/auth/login` | `auth.users`, `auth_management.parent_accounts`, `auth_management.profiles` | `parents/FLUJO-LOGIN-PADRES.md` |
| FL-PRN-05 | Parents | Registro portal padres | EPIC-GAM-F3-PARENT-PORTAL | `apps/parent/pages/ParentRegisterPage.tsx` | registro portal padres | `/parent-portal/auth/register` | `auth.users`, `auth_management.parent_accounts`, `auth_management.profiles` | `parents/FLUJO-REGISTRO-PADRES.md` |
| FL-PRN-06 | Parents | Dashboard portal padres | EPIC-GAM-F3-PARENT-PORTAL | `apps/parent/pages/ParentDashboardPage.tsx` | ver progreso general | `/parent-portal/dashboard`, `/parent-portal/students` | `auth_management.parent_student_links`, `progress_tracking.*`, `analytics.*` | `parents/FLUJO-DASHBOARD-PADRES.md` |
| FL-PRN-07 | Parents | Vista progreso hijo | EPIC-GAM-F3-PARENT-PORTAL | `apps/parent/pages/ChildProgressPage.tsx` | ver detalle por estudiante | `/parent-portal/students/:id/progress` | `progress_tracking.*`, `analytics.*` | `parents/FLUJO-PROGRESO-HIJO.md` |
| FL-SHR-01 | Shared | Perfil/configuracion multportal | EPIC-GAM-F3-PROFILES | Student/Teacher/Admin settings | edicion de perfil/seguridad | `/api/v1/profile/:userId`, `/api/auth/profile` | `auth_management.profiles`, `auth.users` | `shared/FLUJO-PERFIL-CONFIGURACION.md` |
| FL-SHR-02 | Shared | Sesion/seguridad y recuperacion de acceso **(Compuesto)** | EPIC-GAM-F1-AUTH | login/reset flows | acciones de seguridad de cuenta | `/auth/*` | `auth.users`, `auth_management.*` | `shared/FLUJO-SESION-SEGURIDAD.md` (sub: FL-AUTH-01, FL-AUTH-02, FL-AUTH-03) |
| FL-STU-13 | Student | Dashboard y overview de progreso | EPIC-GAM-F1-ANALYTICS | `apps/student/pages/DashboardComplete.tsx` | consultas dashboard, filtros | `/api/v1/progress/*`, `/api/v1/gamification/user-stats/*` | `progress_tracking.module_progress`, `gamification_system.user_stats` | `student/FLUJO-DASHBOARD-PROGRESO.md` |
| FL-STU-14 | Student | Leaderboards y rankings | EPIC-GAM-F3-SOCIAL-GAMIFICATION | `apps/student/pages/LeaderboardPage.tsx` | ver rankings, filtros | `/api/v1/social/leaderboards/*` | `social_features.leaderboard_entries`, `gamification_system.user_stats` | `student/FLUJO-LEADERBOARDS.md` |
| FL-STU-15 | Student | Pagina de aprendizaje | EPIC-GAM-F1-EXERCISES | `apps/student/pages/LearningPage.tsx` | ver modulos, seleccionar ejercicio | `/api/v1/educational/modules/*`, `/api/v1/educational/exercises/*` | `educational_content.modules`, `educational_content.exercises` | `student/FLUJO-PAGINA-APRENDIZAJE.md` |
| FL-TCH-04 | Teacher | Analytics y reportes docentes | EPIC-GAM-F1-ANALYTICS | `apps/teacher/pages/TeacherAnalytics.tsx`, `TeacherReportsPage.tsx` | ver metricas, generar reportes | `/api/v1/analytics/*`, `/api/v1/reports/*` | `analytics.*`, `data_warehouse.*` | `teacher/FLUJO-ANALYTICS-REPORTES.md` |
| FL-TCH-05 | Teacher | Gestion de contenido docente | EPIC-GAM-F3-CONTENT | `apps/teacher/pages/TeacherContentManagement.tsx` | crear/editar contenido | `/api/v1/content/*`, `/api/v1/teacher/content/*` | `educational_content.content_items`, `educational_content.content_templates` | `teacher/FLUJO-GESTION-CONTENIDO.md` |
| FL-TCH-06 | Teacher | Login con redireccion por rol | EPIC-GAM-F1-AUTH | `apps/teacher/layouts/TeacherLayout.tsx` | autenticacion + redirect docente | `/auth/login`, role-based redirect | `auth.users`, `auth_management.profiles`, `auth_management.user_roles` | `teacher/FLUJO-LOGIN-DOCENTE.md` |
| FL-ADM-07 | Admin | Constructor de ejercicios | EPIC-GAM-F1-EXERCISES | `apps/admin/pages/AdminExerciseCreatePage.tsx` | crear/configurar ejercicios | `/api/v1/educational/exercises`, `/api/v1/educational/exercises/:id` | `educational_content.exercises`, `educational_content.exercise_options` | `admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md` |
| FL-ADM-08 | Admin | Gestion de gamificacion | EPIC-GAM-F1-GAMIFICATION | `apps/admin/components/gamification/AchievementsTab.tsx` | configurar logros/misiones | `/api/v1/gamification/achievements/*`, `/api/v1/gamification/missions/*` | `gamification_system.achievements`, `gamification_system.mission_templates` | `admin/FLUJO-GESTION-GAMIFICACION.md` |
| FL-SHR-03 | Shared | White-label y theming | EPIC-GAM-F3-WHITE-LABEL | `features/admin/branding/BrandingSettingsPage.tsx` | configurar tema/branding | `/api/v1/tenants/:id/branding`, `/api/v1/tenants/:id/theme` | `auth_management.tenants`, `auth_management.tenant_settings` | `shared/FLUJO-WHITE-LABEL-THEMING.md` |

---

## Resumen de cobertura por portal

| Portal | Procesos mapeados | Procesos con doc de flujo | Cobertura |
|--------|-------------------|---------------------------|-----------|
| Auth/Shared | 6 | 6 | 100% |
| Student | 15 | 15 | 100% |
| Teacher | 7 | 7 | 100% |
| Admin | 8 | 8 | 100% |
| Parents | 7 | 7 | 100% |
| **Total** | **43** | **43** | **100%** |

---

## Notas de control

1. Los procesos `FL-PRN-*` quedan documentados a nivel de trazabilidad y plan de desarrollo por ausencia de guia de portal dedicada en `docs/60-portals/`.
2. Todo gap tecnico detectado y no implementado por codigo se registra en:
   - `docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md`
   - `orchestration/tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/`
3. Esta matriz alimenta la validacion final en `VALIDACION-ANALISIS-VS-INTEGRACION.md`.
4. **Endpoints sociales backend-only:** 40 endpoints del modulo social (team challenges: 9, peer challenges: 16, challenge participants: 15) tienen implementacion backend pero NO integracion frontend. Documentados como "Backend Only — Pending FE Integration" en el inventario.
5. Flujos FL-STU-13 a FL-SHR-03 agregados en v1.3.0 para cubrir 9 procesos existentes en codigo sin documentacion previa.
6. **v1.3.1 (TRZ-001):** Colision FL-TCH-04 resuelta. El proceso "Configuracion docente y mensajeria" renumerado a FL-TCH-07. FL-TCH-04 queda asignado exclusivamente a "Analytics y reportes docentes".
7. **v1.3.2 (TRZ-002):** Flujos compuestos normalizados. FL-STU-05, FL-STU-06 y FL-SHR-02 ahora tienen documentos dedicados con seccion `## Tipo de Flujo` y sub-flujos explicitamente referenciados. Marcados como **(Compuesto)** en la columna Proceso.
