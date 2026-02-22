# 02 - Hallazgos Criticos (P0 + P1)

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** WS01-WS08 consolidados

---

## 1. Issues P0 -- Criticos / Bloqueantes

Total: **8 issues P0**

### P0-001: Feature Flags opera con datos mock (Admin)

- **Workstream:** WS04
- **Ubicacion:** `AdminAdvancedPage` > FeatureFlagsManager
- **Descripcion:** Los toggles de feature flags se gestionan con estado local (useState). Los cambios no persisten tras refresh porque no hay llamada API real de persistencia.
- **Impacto:** Toda la funcionalidad de feature flags es ilusoria -- no tiene efecto real en el sistema.
- **Correccion:** Implementar endpoints `GET/PUT /admin/system/feature-flags` y conectar el componente a API real con React Query mutation.

### P0-002: A/B Testing 100% hardcoded (Admin)

- **Workstream:** WS04
- **Descripcion:** `TestVariantDisplay` renderiza distribuciones de variantes con porcentajes fijos en codigo (50/50, 70/30, etc). No hay integracion con backend para configuracion real de experimentos.
- **Impacto:** La funcionalidad de A/B testing es puramente presentacional -- no permite configurar ni ejecutar tests reales.
- **Correccion:** Decidir si la funcionalidad es MVP (documentar como placeholder en ADR) o implementar integracion con backend de experimentacion.

### P0-003: WCAG violaciones en Notification Preferences (Admin)

- **Workstream:** WS04
- **Descripcion:** La pagina AdminNotificationPreferencesPage carece de `<label>` asociados a inputs, no tiene navegacion por teclado entre toggles, y contraste de texto no cumple WCAG 2.1 AA.
- **Impacto:** Inaccessible para usuarios con tecnologias asistivas. Puede bloquear certificacion de accesibilidad.
- **Correccion:** Agregar `<label htmlFor>`, implementar `onKeyDown` handlers, revisar contraste de colores.

### P0-004: Ruta de edicion de ejercicios sin logica de edicion (Admin)

- **Workstream:** WS03
- **Ubicacion:** `/admin/exercises/:id/edit` -> `AdminExerciseCreatePage`
- **Descripcion:** La ruta de edicion renderiza el mismo `AdminExerciseCreatePage` sin cargar datos del ejercicio existente. El formulario aparece vacio como si fuera creacion.
- **Impacto:** Los administradores no pueden editar ejercicios existentes -- deben recrearlos desde cero.
- **Correccion:** Implementar carga de datos del ejercicio via `useParams().id` + `GET /exercises/:id` y pre-poblar el formulario.

### P0-005: useRolePermissions anti-patron (Admin)

- **Workstream:** WS02
- **Ubicacion:** `AdminRolesPage` > `useRolePermissions`
- **Descripcion:** El hook usa `queryKey: ['__none__']` que nunca se ejecuta. El campo `loading` siempre retorna `false` porque la query esta deshabilitada (`enabled: false`) permanentemente sin condicion de activacion.
- **Impacto:** La pagina de permisos de roles nunca carga datos de permisos existentes -- el editor muestra estado vacio.
- **Correccion:** Cambiar `enabled` a depender del `roleId` seleccionado: `enabled: !!selectedRoleId`. Actualizar queryKey a `['role-permissions', roleId]`.

### P0-006: Links muertos en ParentDashboard (Parent)

- **Workstream:** WS07
- **Ubicacion:** `ParentDashboardPage`
- **Descripcion:** 4 links internos apuntan a rutas que no existen en el router: probablemente `/parent/notifications`, `/parent/settings`, `/parent/messages`, `/parent/help`.
- **Impacto:** Clicks del usuario llevan a paginas 404 o blancas. Rompe la confianza del usuario en la plataforma.
- **Correccion:** Eliminar links o implementar las paginas referenciadas. Para MVP, eliminar los links y agregar nota en UI "Proximamente".

### P0-007: Link forgot-password inexistente (Parent)

- **Workstream:** WS07
- **Ubicacion:** `ParentLoginPage`
- **Descripcion:** El link de "Olvide mi contrasena" en el login de padres enlaza a `/forgot-password`, pero no existe una ruta de recuperacion de password para el portal de padres (el portal de padres usa autenticacion independiente).
- **Impacto:** Padres que olvidan su contrasena no tienen mecanismo de recuperacion.
- **Correccion:** Implementar `/parent/forgot-password` con flujo propio o reutilizar la ruta compartida `/forgot-password` con deteccion de tipo de usuario.

### P0-008: TeacherReportsPage sin datos (Teacher)

- **Workstream:** WS05
- **Ubicacion:** `TeacherReportsPage`
- **Descripcion:** Diagnostico exhaustivo de WS05 revela que no hay bug de codigo -- la causa probable es tabla `social_features.teacher_reports` vacia o ausencia del servicio Puppeteer para generacion de PDFs.
- **Impacto:** Los docentes no pueden generar ni ver reportes, funcionalidad degradada.
- **Correccion:** (a) Verificar que existan seeds para `teacher_reports`. (b) Verificar disponibilidad de Puppeteer en el servidor. (c) Agregar mensaje informativo si no hay datos en lugar de pantalla vacia.

---

## 2. Issues P1 -- Alta Prioridad

Total: **~63 issues P1** (agrupados por portal)

### 2.1 Portal Admin (43 P1)

#### WS01 - Dashboard/Monitoring (8 P1)

| ID | Descripcion | Componente |
|----|-------------|------------|
| DASH-P1-01 | AND-gate loading: `useAdminDashboard` retorna `loading` solo si TODAS las sub-queries cargan simultaneamente | useAdminDashboard |
| DASH-P1-02 | Monitoring errors no se muestran al usuario cuando `useMonitoring()` falla | AdminMonitoringPage |
| DASH-P1-03 | Period selector en ErrorTrackingTab es decorativo (no filtra datos) | ErrorTrackingTab |
| DASH-P1-04 | LogsViewer duplica 80% de funcionalidad de AuditLogsPage | LogsViewer vs AuditLogsPage |
| DASH-P1-05 | CSV export solo exporta pagina actual, no todos los resultados | AdminAuditLogsPage |
| DASH-P1-06 | Export error no muestra feedback al usuario | AdminAuditLogsPage |
| DASH-P1-07 | Analytics charts no tienen loading skeleton | AdminAnalyticsPage |
| DASH-P1-08 | Quick actions no validan permisos del rol | DashboardQuickActions |

#### WS02 - Users/Roles/Institutions (13 P1)

| ID | Descripcion | Componente |
|----|-------------|------------|
| USR-P1-01 | Modal de edicion se abre con datos null en ciertas condiciones de race | UserDetailModal |
| USR-P1-02 | Bulk actions no muestran progreso de operacion | BulkActionsPanel |
| USR-P1-03 | Filtros de busqueda no se persisten en URL (se pierden al refresh) | UsersSearchFilters |
| USR-P1-04 | Roles table no indica visualmente el rol activo editandose | RolesTable |
| USR-P1-05 | Error de permisos no muestra mensaje descriptivo (catch generico) | useRoles |
| USR-P1-06 | Paginacion de instituciones se resetea al cerrar modal | InstitutionsTable |
| USR-P1-07 | Feature toggle management sin feedback visual de guardado | InstitutionFormModals |
| USR-P1-08 | Delete confirmation no muestra nombre del recurso a eliminar | ConfirmDialog (admin) |
| USR-P1-09 | ClassroomTeacher tabs no mantienen estado al navegar entre tabs | AdminClassroomTeacherPage |
| USR-P1-10 | Busqueda de docentes no tiene debounce (request por cada keystroke) | TeacherClassroomsTab |
| USR-P1-11 | Crear usuario sin seleccionar rol resulta en error crptico del backend | CreateUserModal |
| USR-P1-12 | Doble click en "Guardar" envia request duplicado | Multiples modales |
| USR-P1-13 | Ordenamiento de columnas no funciona en Users table mobile | UsersTable |

#### WS03 - Content/Exercises/Gamification (7 P1)

| ID | Descripcion | Componente |
|----|-------------|------------|
| CNT-P1-01 | ExerciseTypeSelector solo muestra 17 de 23+ tipos (M4/M5 ausentes) | ExerciseTypeSelector |
| CNT-P1-02 | AdminAssignmentsPage usa endpoints que no existen en backend (ORPHAN) | AdminAssignmentsPage |
| CNT-P1-03 | GamificationPage EconomyTab: resetParameter no tiene confirmacion | EconomyTab |
| CNT-P1-04 | Content approval flow no valida que el usuario tenga permiso de aprobacion | AdminContentPage |
| CNT-P1-05 | Exercise preview no renderiza mecanicas M3-M5 correctamente | ExercisePreview |
| CNT-P1-06 | MediaLibraryTab no tiene paginacion (carga todos los assets) | MediaLibraryTab |
| CNT-P1-07 | AdminProgressPage usa queries sin error handling | AdminProgressPage |

#### WS04 - Settings/Alerts/Advanced (15 P1)

| ID | Descripcion | Componente |
|----|-------------|------------|
| SET-P1-01 | GeneralSettings "modo mantenimiento" no muestra banner a usuarios | GeneralSettings |
| SET-P1-02 | SecuritySettings cambios toman efecto sin confirmacion | SecuritySettings |
| SET-P1-03 | Alerts list no se actualiza automaticamente (requiere refresh manual) | AdminAlertsPage |
| SET-P1-04 | Suppress alert es irreversible sin mecanismo de undo | AdminAlertsPage |
| SET-P1-05 | Notification filters no se combinan (AND) -- se aplica solo el ultimo | NotificationFilters |
| SET-P1-06 | Reports auto-refresh cada 5s causa flicker en la lista | AdminReportsPage |
| SET-P1-07 | Delete report no tiene confirmacion | ReportsList |
| SET-P1-08 | LTI credentials se muestran en texto plano sin mascara | LtiCredentialsDisplay |
| SET-P1-09 | Branding preview no refleja cambios de favicon en tiempo real | BrandingSettingsPage |
| SET-P1-10 | LTI consumer form no valida URL de callback | LtiConsumerForm |
| SET-P1-11 | AdminNotificationsPage usa Zustand (notificationsStore) en vez de React Query | AdminNotificationsPage |
| SET-P1-12 | Export de audit logs solo exporta pagina visible | AdminAuditLogsPage |
| SET-P1-13 | AlertDetailsModal no carga historial completo de la alerta | AlertDetailsModal |
| SET-P1-14 | Report generation no muestra progreso/status en tiempo real | ReportGenerationForm |
| SET-P1-15 | Settings save sin optimistic update (UI queda congelada durante save) | AdminSettingsPage |

### 2.2 Portal Teacher (4 P1)

| ID | Descripcion | Componente | Workstream |
|----|-------------|------------|------------|
| TCH-P1-01 | Assignment wizard paso 3 (ejercicios) no filtra por modulo/dificultad | ImprovedAssignmentWizard | WS05 |
| TCH-P1-02 | Communication tabs no marcan mensajes como leidos automaticamente al abrirlos | TeacherCommunicationPage | WS05 |
| TCH-P1-03 | Review rubric no valida que todos los criterios tengan puntaje antes de enviar | ReviewDetail | WS05 |
| TCH-P1-04 | Dashboard 10 tabs sin lazy loading (carga todo al montar) | TeacherDashboardPage | WS05 |

### 2.3 Portal Student (4 P1)

| ID | Descripcion | Componente | Workstream |
|----|-------------|------------|------------|
| STU-P1-01 | LegacyExercisePage (993 lineas) no eliminado -- dead code | LegacyExercisePage | WS06 |
| STU-P1-02 | VerdaderoFalsoExercise.SECURE.tsx no registrado en registry | registrations.ts | WS06 |
| STU-P1-03 | 2 paginas viven fuera de `apps/student/pages/` | Varias | WS06 |
| STU-P1-04 | BottomNavigation tiene 2 rutas invalidas | BottomNavigation | WS08 |

### 2.4 Portal Parent (6 P1)

| ID | Descripcion | Componente | Workstream |
|----|-------------|------------|------------|
| PRN-P1-01 | ProtectedRoute redirige parents a `/login` en vez de `/parent/login` | ProtectedRoute | WS07/WS08 |
| PRN-P1-02 | Parent portal no usa detective-theme (indigo/purple aislado) | Global | WS07/WS08 |
| PRN-P1-03 | GamificationOverlay se renderiza en Parent portal (sin sentido) | GamificationOverlay | WS08 |
| PRN-P1-04 | Parent auth no comparte refresh token logic con auth principal | parentStore | WS07 |
| PRN-P1-05 | ChildProgressPage no tiene loading skeleton | ChildProgressPage | WS07 |
| PRN-P1-06 | Dashboard padre no usa shared UI components (0 reutilizacion) | ParentDashboardPage | WS08 |

### 2.5 Cross-Portal (6 P1)

| ID | Descripcion | Workstream |
|----|-------------|------------|
| XP-P1-01 | AdminLayout y TeacherLayout son 97% identicos (duplicacion masiva) | WS07 |
| XP-P1-02 | Error handling no estandarizado entre portales (cada portal usa patron distinto) | WS08 |
| XP-P1-03 | Loading states no estandarizados (spinner, skeleton, shimmer inconsistentes) | WS08 |
| XP-P1-04 | Toast notifications usan librerias distintas en algunos portales | WS08 |
| XP-P1-05 | Dual auth system (AuthContext + authStore) requiere sincronizacion manual | WS08 |
| XP-P1-06 | 40 endpoints sociales del backend no integrados en frontend | WS08 |

---

## 3. Resumen por Severidad y Portal

| Portal | P0 | P1 | P2 | P3 | Total |
|--------|----|----|----|----|-------|
| Admin | 5 | 43 | ~60 | ~5 | ~113 |
| Teacher | 1 | 4 | 8 | -- | 13 |
| Student | 0 | 4 | 5 | -- | 9 |
| Parent | 2 | 6 | 9 | -- | 17 |
| Cross-Portal | 0 | 6 | ~10 | -- | ~16 |
| **Total** | **8** | **63** | **~92** | **~5** | **~168** |

---

## 4. Priorizacion de Correccion

### Inmediato (Sprint actual)

1. P0-004: Ruta de edicion de ejercicios
2. P0-005: useRolePermissions anti-patron
3. P0-006: Links muertos Parent
4. P0-007: Forgot password Parent
5. P0-008: TeacherReportsPage datos vacios

### Siguiente Sprint

1. P0-001: Feature Flags mock (decidir: implementar o documentar como placeholder)
2. P0-002: A/B Testing hardcoded (mismo patron de decision)
3. P0-003: WCAG Notification Preferences
4. P1 criticos de Admin (DASH-P1-01, USR-P1-01, CNT-P1-01, CNT-P1-02)
5. P1 de Parent (PRN-P1-01 redirect, PRN-P1-03 GamificationOverlay)

### Sprint 3+

1. Resto de P1 de Admin (~38 issues)
2. P1 Cross-Portal (layout unification, error handling standardization)
3. P2 issues completos
