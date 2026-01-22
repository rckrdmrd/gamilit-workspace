# ÍNDICE DE PÁGINAS - GAMILIT

**Fecha:** 2026-01-22
**Total páginas activas:** 67
**Total archivos:** 77

---

## Resumen por Portal

| Portal | Páginas Activas | Archivos | Ruta Base |
|--------|-----------------|----------|-----------|
| Student | 23 | 26 | `/student/*` |
| Teacher | 17 | 25 | `/teacher/*` |
| Admin | 18 | 18 | `/admin/*` |
| Auth/Shared | 6 | 8 | `/` |
| **Total** | **67** | **77** | - |

---

## Student Portal (23 páginas)

### Dashboard y Navegación
| Página | Archivo | Ruta |
|--------|---------|------|
| Dashboard | `DashboardComplete.tsx` | `/student/dashboard` |
| 404 | `NotFoundPage.tsx` | `/student/*` |

### Módulos y Ejercicios
| Página | Archivo | Ruta |
|--------|---------|------|
| Detalle Módulo | `ModuleDetailPage.tsx` | `/student/modules/:moduleId` |
| Ejercicio | `ExercisePage.tsx` | `/student/exercises/:exerciseId` |
| Asignaciones | `AssignmentsPage.tsx` | `/student/assignments` |
| Detalle Asignación | `AssignmentDetailPage.tsx` | `/student/assignments/:id` |

### Gamificación
| Página | Archivo | Ruta |
|--------|---------|------|
| Gamificación | `GamificationPage.tsx` | `/student/gamification` |
| Leaderboard | `LeaderboardPage.tsx` | `/student/leaderboard` |
| Misiones | `MissionsPage.tsx` | `/student/missions` |
| Tienda | `ShopPage.tsx` | `/student/shop` |
| Inventario | `InventoryPage.tsx` | `/student/inventory` |

### Social
| Página | Archivo | Ruta |
|--------|---------|------|
| Amigos | `FriendsPage.tsx` | `/student/friends` |
| Gremios | `GuildsPage.tsx` | `/student/guilds` |

### Perfil y Configuración
| Página | Archivo | Ruta |
|--------|---------|------|
| Perfil | `ProfilePage.tsx` | `/student/profile` |
| Perfil Extendido | `EnhancedProfilePage.tsx` | `/student/profile/enhanced` |
| Configuración | `SettingsPage.tsx` | `/student/settings` |
| Notificaciones | `NotificationsPage.tsx` | `/student/notifications` |
| Pref. Notificaciones | `NotificationPreferencesPage.tsx` | `/student/settings/notifications` |
| Dispositivos | `DeviceManagementSection.tsx` | `/student/settings/devices` |

### Autenticación
| Página | Archivo | Ruta |
|--------|---------|------|
| Verificar Email | `EmailVerificationPage.tsx` | `/student/verify-email` |
| Recuperar Contraseña | `PasswordRecoveryPage.tsx` | `/student/password-recovery` |
| Reset Contraseña | `PasswordResetPage.tsx` | `/student/password-reset` |
| 2FA | `TwoFactorAuthPage.tsx` | `/student/security/2fa` |

---

## Teacher Portal (17 páginas)

### Dashboard
| Página | Archivo | Ruta |
|--------|---------|------|
| Dashboard | `TeacherDashboardPage.tsx` | `/teacher/dashboard` |

### Clases y Estudiantes
| Página | Archivo | Ruta |
|--------|---------|------|
| Clases | `TeacherClassesPage.tsx` | `/teacher/classes` |
| Estudiantes | `TeacherStudentsPage.tsx` | `/teacher/students` |
| Monitoreo | `TeacherMonitoringPage.tsx` | `/teacher/monitoring` |

### Contenido y Asignaciones
| Página | Archivo | Ruta |
|--------|---------|------|
| Asignaciones | `TeacherAssignmentsPage.tsx` | `/teacher/assignments` |
| Contenido | `TeacherContentPage.tsx` | `/teacher/content` |
| Recursos | `TeacherResourcesPage.tsx` | `/teacher/resources` |
| Respuestas | `TeacherExerciseResponsesPage.tsx` | `/teacher/responses` |
| Panel Revisión | `TeacherReviewPanelPage.tsx` | `/teacher/review` |

### Analytics
| Página | Archivo | Ruta |
|--------|---------|------|
| Analytics | `TeacherAnalyticsPage.tsx` | `/teacher/analytics` |
| Progreso | `TeacherProgressPage.tsx` | `/teacher/progress` |
| Reportes | `TeacherReportsPage.tsx` | `/teacher/reports` |

### Gamificación y Alertas
| Página | Archivo | Ruta |
|--------|---------|------|
| Gamificación | `TeacherGamificationPage.tsx` | `/teacher/gamification` |
| Alertas | `TeacherAlertsPage.tsx` | `/teacher/alerts` |

### Configuración
| Página | Archivo | Ruta |
|--------|---------|------|
| Comunicación | `TeacherCommunicationPage.tsx` | `/teacher/communication` |
| Notificaciones | `TeacherNotificationsPage.tsx` | `/teacher/notifications` |
| Configuración | `TeacherSettingsPage.tsx` | `/teacher/settings` |

---

## Admin Portal (18 páginas)

### Dashboard
| Página | Archivo | Ruta |
|--------|---------|------|
| Dashboard | `AdminDashboardPage.tsx` | `/admin/dashboard` |

### Usuarios y Roles
| Página | Archivo | Ruta |
|--------|---------|------|
| Usuarios | `AdminUsersPage.tsx` | `/admin/users` |
| Roles | `AdminRolesPage.tsx` | `/admin/roles` |

### Instituciones
| Página | Archivo | Ruta |
|--------|---------|------|
| Instituciones | `AdminInstitutionsPage.tsx` | `/admin/institutions` |
| Asignación Profesores | `AdminClassroomTeacherPage.tsx` | `/admin/classroom-teachers` |

### Contenido
| Página | Archivo | Ruta |
|--------|---------|------|
| Contenido | `AdminContentPage.tsx` | `/admin/content` |
| Asignaciones | `AdminAssignmentsPage.tsx` | `/admin/assignments` |

### Analytics
| Página | Archivo | Ruta |
|--------|---------|------|
| Analytics | `AdminAnalyticsPage.tsx` | `/admin/analytics` |
| Progreso | `AdminProgressPage.tsx` | `/admin/progress` |
| Reportes | `AdminReportsPage.tsx` | `/admin/reports` |

### Sistema
| Página | Archivo | Ruta |
|--------|---------|------|
| Gamificación | `AdminGamificationPage.tsx` | `/admin/gamification` |
| Monitoreo | `AdminMonitoringPage.tsx` | `/admin/monitoring` |
| Alertas | `AdminAlertsPage.tsx` | `/admin/alerts` |
| Audit Logs | `AdminAuditLogsPage.tsx` | `/admin/audit-logs` |

### Configuración
| Página | Archivo | Ruta |
|--------|---------|------|
| Configuración | `AdminSettingsPage.tsx` | `/admin/settings` |
| Avanzado | `AdminAdvancedPage.tsx` | `/admin/advanced` |
| Notificaciones | `AdminNotificationsPage.tsx` | `/admin/notifications` |
| Pref. Notificaciones | `AdminNotificationPreferencesPage.tsx` | `/admin/settings/notifications` |

---

## Auth/Shared (6 páginas)

| Página | Archivo | Ruta |
|--------|---------|------|
| Login | `auth/LoginPage.tsx` | `/login` |
| Registro | `auth/RegisterPage.tsx` | `/register` |
| Olvidé Contraseña | `auth/ForgotPasswordPage.tsx` | `/forgot-password` |
| Logros | `AchievementsPage.tsx` | `/achievements` |
| Detalles Módulo | `ModuleDetailsPage.tsx` | `/modules/:moduleId` |
| Mi Progreso | `MyProgressPage.tsx` | `/progress` |

---

## Notas

1. **Archivos duplicados en Teacher Portal:** Existen 8 archivos que parecen ser versiones alternativas (ej: `TeacherAnalytics.tsx` vs `TeacherAnalyticsPage.tsx`). Requieren investigación.

2. **Páginas excluidas:**
   - 3 archivos de test en Student Portal
   - 1 archivo legacy en Auth/Shared
   - 1 archivo de test en Auth/Shared

3. **Validación pendiente:** Las rutas son estimadas. Se recomienda validar contra el router de React.
