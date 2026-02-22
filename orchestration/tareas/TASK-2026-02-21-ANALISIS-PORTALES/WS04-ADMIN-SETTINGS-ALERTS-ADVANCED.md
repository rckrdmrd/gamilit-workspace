# WS04 - Admin: Settings, Alerts, Notifications, Reports, Advanced, Branding, LTI

**Fecha:** 2026-02-21
**Analista:** Claude Sonnet 4.6 (Agent)
**Scope:** 8 paginas del portal admin — configuracion, alertas, notificaciones, reportes, avanzado, branding, LTI
**Base de analisis:** Lectura directa de todos los archivos fuente relevantes

---

## 1. Inventario de Paginas

### 1.1 AdminSettingsPage

- **Ruta:** `/admin/settings`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminSettingsPage.tsx`
- **Layout:** `AdminPageShell`
- **Tabs:** `general` | `security` | `profile` (via `AdminTabBar`)

**Componentes:**
| Componente | Path |
|---|---|
| `AdminPageShell` | `apps/admin/components/shared/AdminPageShell.tsx` |
| `AdminTabBar` | `apps/admin/components/shared/AdminTabBar.tsx` |
| `GeneralSettings` | `apps/admin/components/settings/GeneralSettings.tsx` |
| `SecuritySettings` | `apps/admin/components/settings/SecuritySettings.tsx` |
| `ProfileSettings` | `apps/admin/components/settings/ProfileSettings.tsx` |
| `DetectiveCard` | `shared/components/base/DetectiveCard.tsx` |

**Hooks:**
- `useSystemConfig('general')` — en GeneralSettings
- `useSystemConfig('security')` — en SecuritySettings
- `useAuth()` — en ProfileSettings
- `useApiError()` — en ProfileSettings

**Endpoints API:**
| Metodo | Endpoint | Categoria |
|---|---|---|
| GET | `/admin/system/config/general` | Config general |
| PUT | `/admin/system/config/general` | Actualizar general |
| GET | `/admin/system/config/security` | Config seguridad |
| PUT | `/admin/system/config/security` | Actualizar seguridad |
| PATCH | `/profile/:userId` | Actualizar perfil |
| POST | `/profile/:userId/avatar` | Subir avatar |
| PATCH | `/profile/:userId/password` | Cambiar contrasena |

**Estado:** `useState<TabType>` para tab activo (local). Config via React Query en los subcomponentes.

**Interacciones:**
- Cambio de tab entre General / Seguridad / Mi Perfil
- Toggle "Permitir registro de usuarios" (checkbox)
- Toggle "Modo de mantenimiento" (checkbox)
- Textarea mensaje de mantenimiento
- Configuracion de contrasenas: longitud minima, uppercase, numeros, chars especiales
- Configuracion de sesiones: timeout (select: 15/30/60/240/480 min), sesiones concurrentes (1-10)
- 2FA: require admin, require teacher, metodos (email/authenticator)
- Login security: max intentos (3-10), lockout duration (select: 5/15/30/60 min), CAPTCHA
- Perfil: displayName, firstName, lastName, avatar upload (max 2MB), password change

**Errores:**
- `react-hot-toast` para exito/error en cada subcomponente
- `useApiError` en ProfileSettings para manejo normalizado
- Validacion de formulario con `react-hook-form` (min/max length, required)

**Carga:**
- Spinner circular `border-b-2 border-detective-orange` mientras `isLoading && !config`
- useSystemConfig con `enabled: false` — se dispara manualmente via `fetchConfig()` en `useEffect`

**Accesibilidad:**
- `role="region"` con `aria-label` en el contenedor de tab content
- `role="note"` en el footer de advertencia
- `aria-hidden="true"` en icono decorativo
- Labels asociados a todos los inputs via `htmlFor`/`id`
- Buen uso de semantica de formulario con `<form>`, `<label>`, `<input>`, `<select>`, `<textarea>`

**Responsividad:**
- Grilla `grid-cols-1 md:grid-cols-2` en ProfileSettings para campos de nombre
- Sin breakpoints explicitamente declarados en SecuritySettings (columna unica)

**Navegacion:**
- Entrante: sidebar de admin en `/admin/settings`
- Saliente: ninguna — pagina auto-contenida con tabs

**Issues:**
- [P2] `useSystemConfig` usa `enabled: false` — la query se dispara con `refetch()` en `useEffect`, patron no estandar para React Query. El `staleTime: STALE_TIMES.SEMI_STATIC` nunca se aplica si se usa `refetch` manual.
- [P2] `useSettings` esta marcado como `@deprecated` pero sigue en el hook index. Debe eliminarse o el index debe excluirlo para evitar confusion.
- [P2] `ProfileSettings` no usa `react-hook-form` — usa `useState` para el estado del formulario, lo que es inconsistente con el patron del resto de la pagina y omite validacion declarativa.
- [P1] `ProfileSettings` no resetea los campos de contrasena en caso de error del servidor — el `setSaveStatus('error')` no limpia `account`, dejando datos sensibles visibles.

---

### 1.2 AdminAlertsPage

- **Ruta:** `/admin/alerts`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`
- **Layout:** `AdminPageShell`

**Componentes:**
| Componente | Path |
|---|---|
| `AlertsStats` | `apps/admin/components/alerts/AlertsStats.tsx` |
| `AlertFilters` | `apps/admin/components/alerts/AlertFilters.tsx` |
| `AlertsList` | `apps/admin/components/alerts/AlertsList.tsx` |
| `AlertCard` | `apps/admin/components/alerts/AlertCard.tsx` |
| `AlertDetailsModal` | `apps/admin/components/alerts/AlertDetailsModal.tsx` |
| `AcknowledgeAlertModal` | `apps/admin/components/alerts/AcknowledgeAlertModal.tsx` |
| `ResolveAlertModal` | `apps/admin/components/alerts/ResolveAlertModal.tsx` |
| `ConfirmDialog` | `shared/components/common/ConfirmDialog.tsx` |
| `DetectiveButton` | `shared/components/base/DetectiveButton.tsx` |

**Hooks:**
- `useAlerts()` — datos, filtros, paginacion, acciones CRUD
- `useApiError()` — manejo de errores normalizado

**Endpoints API:**
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/admin/alerts` | Lista paginada con filtros |
| GET | `/admin/alerts/stats` | Estadisticas globales |
| POST | `/admin/alerts/:id/acknowledge` | Reconocer alerta |
| POST | `/admin/alerts/:id/resolve` | Resolver alerta |
| POST | `/admin/alerts/:id/suppress` | Suprimir alerta |

**Estado:**
- `useAlerts()`: React Query para lista y stats. `useState` local para filtros y seleccion de alerta
- Modales: `modalsState: { details, acknowledge, resolve }` (local en pagina)
- Suppress: `showSuppressConfirm`, `pendingSuppressAlert` (local en pagina)

**Interacciones:**
- Boton "Actualizar" — refresca lista y stats simultaneamente
- AlertFilters — aplica filtros de severidad, status, tipo y rango de fechas
- Click en AlertCard — abre AlertDetailsModal
- Boton "Reconocer" — abre AcknowledgeAlertModal (nota opcional)
- Boton "Resolver" — abre ResolveAlertModal (nota requerida >= 10 chars)
- Boton "Suprimir" — abre ConfirmDialog, confirma suppression
- Paginacion: prevPage / nextPage buttons en AlertsList

**Errores:**
- Banner de error `role="alert"` con mensaje de texto de `useAlerts().error`
- `handleError` (useApiError) en suppress — pero sin toast visible de confirmacion de error (error se maneja silenciosamente via console en AcknowledgeAlertModal y ResolveAlertModal)
- `resolveAlert` valida que la nota tenga >= 10 chars, lanza `Error` que el modal debe capturar

**Carga:**
- `isLoading` en AlertsList muestra skeleton en `AlertsStats` (4 tarjetas con `animate-pulse`)
- Boton "Actualizar" muestra `animate-spin` en su icono mientras `isLoading`
- `aria-live="polite"` en el contenedor de lista de alertas

**Accesibilidad:**
- `role="region"` con `aria-label` en stats y lista de alertas
- `role="alert"` en banner de error
- `aria-live="polite"` en contenedor de lista
- `aria-hidden="true"` implicito en iconos (no declarado explicitamente en AlertCard)
- Botones de accion sin aria-label descriptivo en AlertCard — solo texto visible

**Responsividad:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` en AlertsStats
- `flex flex-wrap` en badges de AlertCard

**Navegacion:**
- Entrante: sidebar admin y dashboard card AlertsNotificationsCard
- Saliente: ninguna

**Issues:**
- [P1] Manejo de error asimetrico: suppress usa `handleError` en pagina; acknowledge y resolve delegan al modal sin mecanismo de error visible al usuario desde la pagina.
- [P2] `AlertCard` importa utilidades desde `./alertUtils` — este archivo no fue encontrado como `.tsx`, podria ser un `.ts` helper; verificar que exista.
- [P2] No hay feedback visual de exito despues de Acknowledge/Resolve exitoso (solo se cierran los modales); un toast de exito mejoraría UX.
- [P2] El tipo `SystemAlert` se importa de `adminTypes` pero `useAlerts` trabaja con tipo `Alert` — hay potencial discrepancia de tipos entre lo que la pagina espera y lo que el hook entrega.

---

### 1.3 AdminNotificationsPage

- **Ruta:** `/admin/notifications`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminNotificationsPage.tsx`
- **Layout:** `AdminPageShell`

**Componentes:**
| Componente | Path |
|---|---|
| `NotificationHeader` | `apps/admin/components/notifications/NotificationHeader.tsx` |
| `NotificationFilters` | `apps/admin/components/notifications/NotificationFilters.tsx` |
| `NotificationItem` | `apps/admin/components/notifications/NotificationItem.tsx` |

**Hooks / Stores:**
- `useNotificationsStore()` (Zustand store) — `apps/frontend/src/features/notifications/store/notificationsStore`
  - `notifications`, `unreadCount`, `isLoading`, `error`
  - `fetchNotifications`, `fetchUnreadCount`, `markAsRead`, `markAllAsRead`, `deleteNotification`

**Endpoints API:** (via notificationsStore)
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/notifications` | Lista de notificaciones |
| GET | `/notifications/unread-count` | Contador sin leer |
| PATCH | `/notifications/:id/read` | Marcar como leida |
| PATCH | `/notifications/read-all` | Marcar todas como leidas |
| DELETE | `/notifications/:id` | Eliminar notificacion |

**Estado:**
- Store Zustand para datos del servidor
- `statusFilter: 'all' | 'unread' | 'read'` (local)
- `typeFilter: string` (local)
- `isRefreshing: boolean` (local — separate de `isLoading` del store)
- `showFilters: boolean` (local — toggle visibility)
- Filtrado con `useMemo` sobre el array de `notifications`
- Tipos disponibles: `useMemo` extrae `notification.type` unicos

**Interacciones:**
- NotificationHeader: boton refresh, toggle filtros, "Marcar todas leidas", link a preferencias
- NotificationFilters: selector status (all/unread/read), selector tipo
- NotificationItem: "Marcar como leida" individual, "Eliminar"
- `AnimatePresence` de framer-motion para transiciones de lista

**Errores:**
- Banner de texto plano con `error` del store
- Sin `role="alert"` en el banner de error

**Carga:**
- `RefreshCw` animado centrado cuando `isLoading`
- Estado vacio con icono `Bell` cuando no hay notificaciones filtradas

**Accesibilidad:**
- Sin `role="region"` en secciones
- Sin `aria-live` en la lista de notificaciones (lista que cambia dinamicamente)
- El boton de refresh en `NotificationHeader` solo tiene icono, sin `aria-label`
- El boton de toggle filtros solo tiene icono, sin `aria-label`

**Responsividad:**
- `flex flex-col sm:flex-row sm:items-center sm:justify-between` en header
- `hidden sm:inline` en texto de "Marcar todas"

**Navegacion:**
- Entrante: sidebar admin
- Saliente: link a `/admin/settings/notifications` desde icono settings en header

**Issues:**
- [P1] `isRefreshing` es estado local que se resetea con `setTimeout(500ms)` — no sincroniza con el estado real del store. Si `fetchNotifications` falla, `isRefreshing` se pone en false igual.
- [P1] No hay `role="alert"` en el banner de error — lector de pantalla no anunciara el error automaticamente.
- [P2] No hay `aria-live` en la lista — las entradas que desaparecen con AnimatePresence no son anunciadas a lectores de pantalla.
- [P2] Uso de Zustand store para datos del servidor en lugar de React Query — inconsistente con el patron del resto del admin. El store no maneja caching inteligente ni deduplicacion de peticiones.
- [P2] `NotificationHeader` importa `React` implicito pero no lo usa explicitamente — funciona por JSX transform pero `React` no aparece en el archivo de header.

---

### 1.4 AdminNotificationPreferencesPage

- **Ruta:** `/admin/settings/notifications`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx`
- **Layout:** `AdminPageShell`

**Componentes:** No extrae componentes — todo inline en la pagina.

**Hooks / Stores:**
- `useNotificationsStore()` — `preferences`, `devices`, `preferencesLoading`, `devicesLoading`, `fetchPreferences`, `fetchDevices`, `updatePreference`, `deleteDevice`
- `usePushNotifications()` — `apps/frontend/src/features/notifications/hooks/usePushNotifications`
  - `isSupported`, `isSubscribedToPush`, `enablePushNotifications`, `disablePushNotifications`

**Endpoints API:** (via notificationsStore y usePushNotifications)
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/notifications/preferences` | Preferencias actuales |
| GET | `/notifications/devices` | Dispositivos registrados |
| PATCH | `/notifications/preferences/:type` | Actualizar preferencia |
| DELETE | `/notifications/devices/:id` | Eliminar dispositivo |
| POST | (Service Worker / Push API) | Suscribir push |

**Estado:**
- `localPreferences`: copia local del store con `{ inAppEnabled, emailEnabled, pushEnabled }` por tipo
- `savingType: string | null` — indica que tipo se esta guardando
- Optimistic updates: toggle inmediato en local state, revert en caso de error

**Tipos de notificacion hardcodeados:**
```
system_announcement, security_alert, user_activity, institution_update,
system_health, database_alert
```
(6 tipos definidos estaticamente — no se cargan del backend)

**Interacciones:**
- Toggle push notifications global (habilitar/deshabilitar en dispositivo)
- Grid 4 columnas: tipo | In-App | Email | Push — toggle buttons por combinacion
- Push deshabilitado si el sistema no lo soporta o si push global esta desactivado
- Eliminar dispositivo registrado con boton de trash

**Errores:**
- Sin manejo de error visible en caso de falla de `updatePreference` — solo revert silencioso
- Sin toast o mensaje al usuario en caso de falla

**Carga:**
- `Loader2 animate-spin` en tabla de preferencias mientras `preferencesLoading`
- `Loader2 animate-spin` en lista de dispositivos mientras `devicesLoading`

**Accesibilidad:**
- Toggle buttons son `<button>` sin `role="switch"` ni `aria-checked` — tecnicamente no accesibles como toggles
- Sin `aria-label` en los toggle buttons (solo animacion visual)
- `Link` con `ArrowLeft` icon para volver a `/admin/notifications` — sin texto visible, solo icono

**Responsividad:**
- `max-w-4xl mx-auto` — limita ancho
- Grid de 4 columnas sin breakpoints — puede romperse en movil

**Navegacion:**
- Entrante: link desde NotificationHeader (icono settings)
- Saliente: boton back a `/admin/notifications`

**Issues:**
- [P0] Toggle buttons no tienen `role="switch"` ni `aria-checked` — no son accesibles para usuarios con lectores de pantalla.
- [P1] Tipos de notificacion estan hardcodeados en el frontend (6 tipos) en lugar de cargarse del backend — si el backend agrega nuevos tipos, la UI no los mostrara.
- [P1] No hay feedback visual de error cuando `updatePreference` falla — el usuario no sabe que su cambio no se guardo.
- [P2] Grid de 4 columnas sin `grid-cols-4` responsive — en pantallas pequenas las columnas se comprimen sin colapsar a layout movil.
- [P2] `ArrowLeft` link-back sin texto visible ni aria-label.

---

### 1.5 AdminReportsPage

- **Ruta:** `/admin/reports`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`
- **Layout:** `AdminPageShell`

**Componentes:**
| Componente | Path |
|---|---|
| `ReportGenerationForm` | `apps/admin/components/reports/ReportGenerationForm.tsx` |
| `ReportsList` | `apps/admin/components/reports/ReportsList.tsx` |
| `BetaBanner` | `apps/admin/components/reports/BetaBanner.tsx` |

**Hooks:**
- `useReports({ autoRefresh: true, refreshInterval: 5000 })` — lista, generacion, descarga, eliminacion
- `useApiError()` — manejo de errores normalizado

**Endpoints API:**
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/admin/reports` | Lista paginada de reportes |
| POST | `/admin/reports/generate` | Generar nuevo reporte |
| GET | `/admin/reports/:id/download` | Descargar reporte (blob) |
| DELETE | `/admin/reports/:id` | Eliminar reporte |
| GET | `/admin/tenants` (via getOrganizations) | Instituciones para filtro |
| GET | `/admin/classrooms` (via classroomTeacherApi) | Aulas para filtro |

**Estado:**
- `isGenerating: boolean` (local — independiente de useReports)
- `toast: { type, message } | null` (local — auto-dismiss 5s)
- `useReports`: React Query con `refetchInterval` condicional (cada 5s si hay reportes pendientes)

**Interacciones:**
- ReportGenerationForm:
  - Selector tipo de reporte (7 tipos: users, progress, gamification, system, student_insights, classroom_summary, risk_analysis)
  - Selector formato (pdf, csv, excel)
  - Date range (startDate, endDate — inputs tipo date)
  - Cascade dropdown: Institucion -> Aula (Aula se limpia al cambiar Institucion)
  - Boton "Generar Reporte" (disabled durante generacion)
- ReportsList:
  - Lista de reportes con estado (pending/generating/completed/failed)
  - Boton "Descargar" (solo si `status === 'completed'`)
  - Boton "Eliminar"
  - Boton "Refresh" manual
- Toast de confirmacion/error auto-dismiss a 5s

**Errores:**
- `aria-live="polite"` en toast y en banner de error — buena implementacion
- `role="status"` en toast de exito, `role="alert"` en banner de error
- `handleError` de `useApiError` para errores de API
- `downloadReport` lanza error si el reporte no esta en estado `completed`

**Carga:**
- `isGenerating` muestra spinner SVG en el boton del formulario
- `ReportsList` recibe `isLoading` para mostrar estado de carga
- `loadingOrgs` y `loadingClassrooms` en el formulario deshabilitan los selects

**Accesibilidad:**
- Buen uso de `aria-live`, `role="status"`, `role="alert"` en el area de toasts
- `role="region"` con `aria-label` en las dos columnas del layout
- Labels con `htmlFor` en todos los campos del formulario
- Boton de cierre del toast tiene `aria-label="Cerrar notificacion"`

**Responsividad:**
- Layout `grid-cols-1 lg:grid-cols-3` (form: 1 col, lista: 2 col)
- `grid-cols-2` para date range
- `max-w-7xl` centrado

**Navegacion:**
- Entrante: sidebar admin
- Saliente: ninguna

**Issues:**
- [P1] El cascade dropdown carga organizaciones con `limit: 100` hardcodeado — si hay mas de 100 instituciones, el dropdown no mostrara todas.
- [P1] La descarga de reporte usa `document.createElement('a')` y `window.URL.createObjectURL` — funciona pero no maneja errores de red durante la descarga del blob.
- [P2] `BetaBanner` con `dismissible={true}` — el dismiss state no persiste (session storage o localStorage) — el usuario vera el banner cada vez que recargue.
- [P2] `organization_id` no se incluye en los params del reporte aunque se selecciona — solo `classroom_id` se pasa a `GenerateReportParams`. Esto descarta el filtro de institucion si no se selecciona aula.
- [P2] ReportGenerationForm mezcla estilos: usa `dark:` Tailwind (sistema dark mode) mientras el resto del admin usa variables CSS `detective-*`. Inconsistencia visual.

---

### 1.6 AdminAdvancedPage

- **Ruta:** `/admin/advanced`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx`
- **Layout:** `AdminPageShell`
- **Nota:** Pagina oculta del menu del sidebar (comentario en codigo) pero ruta activa

**Componentes:**
| Componente | Path |
|---|---|
| `FeatureFlagsPanel` | `apps/admin/components/advanced/FeatureFlagsPanel.tsx` |
| `ABTestingDashboard` | `apps/admin/components/advanced/ABTestingDashboard.tsx` |
| `FeatureFlagEditor` | `apps/admin/components/advanced/FeatureFlagEditor.tsx` |
| `FeatureFlagControls` | `apps/admin/components/advanced/FeatureFlagControls.tsx` (no usado directamente en pagina) |
| `RolloutSlider` | `apps/admin/components/advanced/RolloutSlider.tsx` |
| `TargetingConfig` | `apps/admin/components/advanced/TargetingConfig.tsx` |
| `TenantManagementPanel` | `apps/admin/components/advanced/TenantManagementPanel.tsx` (placeholder en pagina) |
| `EconomicInterventionPanel` | `apps/admin/components/advanced/EconomicInterventionPanel.tsx` (placeholder en pagina) |
| `UnderConstruction` | `shared/components/UnderConstruction.tsx` (en rama SHOW_CONTENT=false, no activa) |
| `FeatureBadge` | `shared/components/common/FeatureBadge.tsx` |
| `DetectiveCard` | `shared/components/base/DetectiveCard.tsx` |
| `ConfirmDialog` | `shared/components/common/ConfirmDialog.tsx` |

**Hooks:**
- `useFeatureFlags()` — en FeatureFlagsPanel

**Endpoints API (Feature Flags):**
| Metodo | Endpoint | Descripcion | Estado |
|---|---|---|---|
| GET | `/admin/feature-flags` | Lista de flags | **NO IMPLEMENTADO** — usa mock |
| POST | `/admin/feature-flags` | Crear flag | **NO IMPLEMENTADO** — usa mock |
| PUT | `/admin/feature-flags/:key` | Actualizar flag | **NO IMPLEMENTADO** — usa mock |
| DELETE | `/admin/feature-flags/:key` | Eliminar flag | **NO IMPLEMENTADO** — usa mock |

**A/B Testing:** 100% datos hardcodeados (mock estatico), sin conexion a backend.

**Estado:**
- `useFeatureFlags`: React Query sobre mock data
- Mock data controlado por `FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API`
- `filterStatus`, `searchTerm`, `editingFlag`, `showEditor`, `showConfirm`, `pendingDeleteKey` (local en FeatureFlagsPanel)
- `experiments: Experiment[]` (local en ABTestingDashboard — hardcodeado)
- `SHOW_CONTENT = true` (constante de build en la pagina)

**Interacciones (Feature Flags):**
- Crear nuevo flag: abre FeatureFlagEditor modal
- Toggle enable/disable por flag (optimistic update)
- Editar flag: abre FeatureFlagEditor con datos existentes
- Eliminar flag: ConfirmDialog -> deleteFlag
- Filtrar por status (all/enabled/disabled)
- Buscar por nombre/key/descripcion

**Interacciones (A/B Testing):**
- Click en experimento para ver detalles
- Start/Pause/Resume experiment (solo modifica estado local)
- Declare Winner: ConfirmDialog -> actualiza estado local
- "New Experiment" boton: llama `setCreatingExperiment(true)` pero el formulario de creacion no existe

**Errores:**
- Error display en FeatureFlagsPanel: DetectiveCard con mensaje rojo
- Sin try/catch visible en los handlers del panel para operaciones de creacion/actualizacion (se delega al hook)

**Carga:**
- `loading` en FeatureFlagsPanel: texto "Loading feature flags..." durante 500ms (mock delay)

**Accesibilidad:**
- `role="region"` con `aria-label` en secciones Feature Flags y A/B Testing
- Toggle buttons del feature flag usan `<button>` con texto visible "ENABLED/DISABLED"
- Sin `role="switch"` ni `aria-pressed` en los toggles

**Responsividad:**
- `grid-cols-1 md:grid-cols-2` para placeholders de Tenant Management y Economic Tools
- `grid-cols-1 md:grid-cols-3` para estadisticas de flags

**Navegacion:**
- Entrante: URL directa (pagina oculta del menu)
- Saliente: ninguna

**Issues:**
- [P0] Backend de Feature Flags **NO IMPLEMENTADO** — `useFeatureFlags` usa 100% datos mock. Cualquier cambio se pierde al recargar.
- [P0] A/B Testing usa datos 100% hardcodeados — sin backend, sin persistencia. El boton "New Experiment" no hace nada funcional.
- [P1] `setCreatingExperiment(true)` en ABTestingDashboard no tiene efecto visible — el estado se declara pero el formulario de creacion no existe en el JSX.
- [P1] La pagina esta oculta del menu pero la ruta esta activa — un usuario que conozca la URL puede acceder. No hay guard adicional.
- [P2] Toggle buttons de feature flags sin `role="switch"` ni `aria-pressed`.

---

### 1.7 BrandingSettingsPage

- **Ruta:** `/admin/settings/branding`
- **Archivo:** `apps/frontend/src/features/admin/branding/BrandingSettingsPage.tsx`
- **Layout:** `AdminLayout` (directo, NO usa `AdminPageShell` — DIFERENTE del resto del admin)
- **Nota:** Usa `AdminLayout` directamente con gamification data — es una pagina feature-level, no app-level

**Componentes:**
| Componente | Path |
|---|---|
| `AdminLayout` | `apps/admin/layouts/AdminLayout.tsx` |
| `ColorPicker` | `features/admin/branding/components/ColorPicker.tsx` |
| `LogoUploader` | `features/admin/branding/components/LogoUploader.tsx` |
| `FaviconUploader` | `features/admin/branding/components/FaviconUploader.tsx` |
| `ThemePreview` | `features/admin/branding/components/ThemePreview.tsx` |
| `DetectiveCard` | `shared/components/base/DetectiveCard.tsx` |

**Hooks:**
- `useAuth()` — obtiene user y logout
- `useBranding()` — BrandingProvider context: `config`, `isLoading`, `previewBranding`, `resetPreview`, `refreshBranding`
- `useUserGamification(user?.id)` — para datos de gamificacion del layout
- `useForm<BrandingFormData>()` (react-hook-form) — gestion de formulario

**Endpoints API:**
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/tenants/:tenantId/branding` | Obtener config actual (via BrandingProvider) |
| PATCH | `/tenants/:tenantId/branding` | Actualizar branding |
| POST | `/tenants/:tenantId/branding/logo` | Subir logo (multipart) |
| DELETE | `/tenants/:tenantId/branding/logo` | Eliminar logo |
| POST | `/tenants/:tenantId/branding/favicon` | Subir favicon (multipart) |
| DELETE | `/tenants/:tenantId/branding/favicon` | Eliminar favicon |

**Estado:**
- `isSaving`, `logoUploading`, `faviconUploading` — loading states locales por operacion
- Form: `useForm` con `isDirty` para detectar cambios no guardados
- Preview en tiempo real: `useEffect` observa `watchedValues` y llama `previewBranding` cuando `isDirty`
- `BrandingProvider` gestiona el config global (contexto de React)

**Interacciones:**
- Input "Platform Name" con validacion (required, max 100 chars)
- `ColorPicker` x3 (primary, secondary, accent) — color hex con presets
- `LogoUploader` — upload/remove (PNG/SVG, max size en backend)
- `FaviconUploader` — upload/remove (ICO/PNG)
- `ThemePreview` — preview live en columna derecha (sticky)
- Boton "Save Changes" (disabled si !isDirty o isSaving)
- Boton "Reset" — revierte a config guardada y limpia preview
- Logout via `window.location.href = '/login'`

**Errores:**
- `toast.success` / `toast.error` via `react-hot-toast` para cada operacion
- Sin try/catch unificado — cada handler tiene su propio try/catch
- Upload errors: `throw error` en el catch — el error se propaga al componente uploader

**Carga:**
- `Loader2 animate-spin` centrado si `brandingLoading && !config`
- Botones individuales tienen loading states via `isSaving`, `logoUploading`, `faviconUploading`

**Accesibilidad:**
- `htmlFor`/`id` en el unico campo de texto (platformName)
- ColorPicker, LogoUploader, FaviconUploader son componentes propios — accesibilidad depende de su implementacion interna
- Boton Reset solo disponible cuando `isDirty` — correcto
- Sin `aria-describedby` para campos con errores

**Responsividad:**
- `grid grid-cols-1 lg:grid-cols-3` (form: 2 col, preview: 1 col)
- `grid gap-6 sm:grid-cols-2` para color pickers y uploaders
- Preview sticky `top-24` en columna derecha

**Navegacion:**
- Entrante: sidebar admin (fuera de `AdminPageShell` context)
- Saliente: logout a `/login`

**Issues:**
- [P1] Inconsistencia de layout: usa `AdminLayout` directamente en lugar de `AdminPageShell`. Requiere pasar `gamificationData` manualmente (con fallback hardcodeado). Si `AdminPageShell` tiene logica centralizada (guards, breadcrumbs), esta pagina los omite.
- [P1] `user?.tenantId || user?.tenant_id` — acceso dual a campo potencialmente inconsistente en el tipo `User`. Si ambos son undefined, la operacion falla silenciosamente en `handleLogoUpload` (early return sin feedback al usuario).
- [P2] Preview en tiempo real dispara `previewBranding` en cada keystroke del form — deberia tener debounce.
- [P2] Los textos de la pagina estan en ingles (Platform Name, Brand Colors, Logo & Favicon, About Branding Changes) mientras el resto del admin esta en espanol.
- [P2] `handleReset` llama `toast` con emoji `↩️` — no consistente con el patron `toast.success`/`toast.error`.

---

### 1.8 AdminLtiPage

- **Ruta:** `/admin/lti` (inferido de App.tsx aunque la ruta exacta no se confirmo en el grep)
- **Archivo:** `apps/frontend/src/features/admin/lti/AdminLtiPage.tsx`
- **Layout:** `AdminLayout` (directo, igual que BrandingSettingsPage)

**Componentes:**
| Componente | Path |
|---|---|
| `AdminLayout` | `apps/admin/layouts/AdminLayout.tsx` |
| `LtiConsumerList` | `features/admin/lti/components/LtiConsumerList.tsx` |
| `LtiConsumerForm` | `features/admin/lti/components/LtiConsumerForm.tsx` |
| `LtiCredentialsDisplay` | `features/admin/lti/components/LtiCredentialsDisplay.tsx` |
| `ConnectionTestModal` | `features/admin/lti/components/ConnectionTestModal.tsx` |
| `StatsCard` (inline) | `AdminLtiPage.tsx` lineas 46-69 |
| `DetectiveCard` | `shared/components/base/DetectiveCard.tsx` |
| `DetectiveButton` | `shared/components/base/DetectiveButton.tsx` |

**Hooks:**
- `useLtiConsumers()` — CRUD completo, stats, test conexion, credenciales
- `useAuth()` — obtiene user y logout
- `useUserGamification(user?.id)` — para layout

**Endpoints API:**
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/lti/consumers` | Lista de consumers |
| GET | `/lti/consumers/stats` | Estadisticas (total, active, verified) |
| POST | `/lti/consumers` | Crear consumer |
| PATCH | `/lti/consumers/:id` | Actualizar consumer |
| POST | `/lti/consumers/:id/verify` | Verificar consumer |
| POST | `/lti/consumers/:id/activate` | Activar consumer |
| DELETE | `/lti/consumers/:id` | Desactivar (soft delete) |
| POST | `/lti/consumers/:id/test-connection` | Probar conexion |
| POST | `/lti/consumers/:id/regenerate-credentials` | Regenerar credenciales |

**Estado:**
- `isFormOpen`, `isCredentialsOpen`, `isTestModalOpen` — modal states
- `selectedConsumer: LtiConsumer | null` — consumer seleccionado para cualquier accion
- `isSubmitting: boolean` — para formulario de crear/editar
- `displayStats` = stats del hook o calculo local desde consumers (fallback)
- React Query internamente en `useLtiConsumers`

**Interacciones:**
- Header: boton Refresh (invalida queries), boton "Add Consumer"
- `StatsCard` x3: Total / Active / Verified (read-only)
- `LtiConsumerList`:
  - Cada consumer: Test Connection, View Credentials, Edit, Activate/Deactivate
- `LtiConsumerForm`: modal con formulario completo LTI 1.3
  - Platform info: name, version, contact email
  - LTI config: platformId (URL), clientId, deploymentId
  - OAuth URLs: JWKS URL (https required), Access Token URL, Authorization URL
  - LTI Advantage toggles: Deep Linking, NRPS, AGS
- `LtiCredentialsDisplay`: muestra credenciales, boton regenerar
- `ConnectionTestModal`: ejecuta test, muestra resultados

**Errores:**
- `DetectiveCard` roja con mensaje de error si `error` del hook
- `toast.error` en cada action handler con mensajes genericos ("Failed to activate consumer")
- `LtiConsumerForm`: errores de validacion via react-hook-form (campo por campo)
- URL validation en form: `platformId` y `authorizationUrl` deben ser `http(s)://`, las URLs OAuth deben ser `https://`

**Carga:**
- `LtiConsumerList` muestra spinner centralizado cuando `loading && consumers.length === 0`
- `RefreshCw animate-spin` en boton refresh cuando `loading`
- `LtiConsumerForm`: boton submit con `Loader2 animate-spin` mientras `isSubmitting`

**Accesibilidad:**
- Botones de accion en `LtiConsumerList` solo tienen iconos — todos tienen `title` atributo (visible en tooltip, pero no suficiente para lectores de pantalla — falta `aria-label`)
- `LtiConsumerForm` tiene `htmlFor`/`id` en todos los campos via `FormInput`
- `FormToggle` usa `<label>` con checkbox `sr-only` — correcto patron accesible
- `StatusBadge` y `FeatureBadge` en `LtiConsumerList`: `FeatureBadge` usa `title` para tooltip — accesibilidad limitada

**Responsividad:**
- `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` en header
- `grid grid-cols-1 gap-4 sm:grid-cols-3` en stats
- `LtiConsumerForm` modal: `size="lg"`, grid `sm:grid-cols-2`

**Navegacion:**
- Entrante: URL directa (pagina no visible en sidebar segun PORTAL-ADMIN-GUIDE.md)
- Saliente: logout a `/login`

**Issues:**
- [P1] Pagina oculta del sidebar — no hay ruta de navegacion visible para administradores. La ruta existe en App.tsx pero no aparece en el menu lateral.
- [P1] Botones de accion en `LtiConsumerList` (Test, Credentials, Edit, Activate/Deactivate) usan solo `title` attribute — no suficiente para accesibilidad real.
- [P1] Inconsistencia de layout: usa `AdminLayout` en lugar de `AdminPageShell` (mismo issue que BrandingSettingsPage).
- [P2] `StatsCard` esta definido inline en `AdminLtiPage.tsx` — deberia moverse a `features/admin/lti/components/` o a `shared/components/`.
- [P2] El boton "Deactivate" usa el icono `Trash2` — visualmente sugiere eliminacion permanente cuando en realidad es una desactivacion (soft delete).

---

## 2. Catalogo de Componentes

### 2.1 Componentes de Settings

| Componente | Path | Props | Proposito | Dependencias |
|---|---|---|---|---|
| `GeneralSettings` | `apps/admin/components/settings/GeneralSettings.tsx` | ninguna | Formulario configuracion general del sistema | `useSystemConfig('general')`, `react-hook-form`, `react-hot-toast`, `DetectiveCard` |
| `SecuritySettings` | `apps/admin/components/settings/SecuritySettings.tsx` | ninguna | Formulario configuracion seguridad (password, sesiones, 2FA, login) | `useSystemConfig('security')`, `react-hook-form`, `react-hot-toast`, `DetectiveCard` |
| `ProfileSettings` | `apps/admin/components/settings/ProfileSettings.tsx` | ninguna | Formulario perfil del admin + cambio de contrasena + avatar upload | `useAuth`, `profileAPI`, `useApiError`, `react-hot-toast`, `DetectiveCard` |

### 2.2 Componentes de Alertas

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `AlertsStats` | `apps/admin/components/alerts/AlertsStats.tsx` | `stats: AlertsStatsType \| null`, `isLoading?: boolean` | 4 tarjetas de estadisticas de alertas con skeleton loading | `DetectiveCard` |
| `AlertFilters` | `apps/admin/components/alerts/AlertFilters.tsx` | `filters`, `onFiltersChange`, `onRefresh`, `isLoading` | Panel de filtros: severidad, status, tipo, rango de fechas | `DetectiveCard`, `DetectiveButton` |
| `AlertsList` | `apps/admin/components/alerts/AlertsList.tsx` | `alerts`, `isLoading`, `pagination`, `onAlertClick`, `onAcknowledge`, `onResolve`, `onSuppress`, `onNextPage`, `onPrevPage` | Lista paginada de alertas con controles de paginacion | `AlertCard` |
| `AlertCard` | `apps/admin/components/alerts/AlertCard.tsx` | `alert: SystemAlert`, `onViewDetails`, `onAcknowledge`, `onResolve`, `onSuppress` | Tarjeta individual de alerta con badges y acciones | `DetectiveCard`, `DetectiveButton`, `alertUtils` |
| `AlertDetailsModal` | `apps/admin/components/alerts/AlertDetailsModal.tsx` | `alert: SystemAlert \| null`, `isOpen`, `onClose` | Modal de detalles completos de una alerta | `Modal`, `DetectiveCard` |
| `AcknowledgeAlertModal` | `apps/admin/components/alerts/AcknowledgeAlertModal.tsx` | `alert`, `isOpen`, `onClose`, `onConfirm: (note?) => Promise<void>` | Modal para reconocer alerta con nota opcional | `Modal`, `DetectiveButton` |
| `ResolveAlertModal` | `apps/admin/components/alerts/ResolveAlertModal.tsx` | `alert`, `isOpen`, `onClose`, `onConfirm: (note) => Promise<void>` | Modal para resolver alerta con nota requerida (>= 10 chars) | `Modal`, `DetectiveButton` |

### 2.3 Componentes de Notificaciones

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `NotificationHeader` | `apps/admin/components/notifications/NotificationHeader.tsx` | `unreadCount`, `isRefreshing`, `showFilters`, `onRefresh`, `onToggleFilters`, `onMarkAllAsRead` | Header con titulo, contador, botones de accion y link a preferencias | `framer-motion`, `react-router-dom` |
| `NotificationFilters` | `apps/admin/components/notifications/NotificationFilters.tsx` | `statusFilter`, `typeFilter`, `availableTypes`, `showFilters`, `onStatusFilterChange`, `onTypeFilterChange` | Panel colapsable de filtros | `framer-motion` |
| `NotificationItem` | `apps/admin/components/notifications/NotificationItem.tsx` | `notification`, `onMarkAsRead`, `onDelete` | Item individual de notificacion con acciones | `framer-motion` |

### 2.4 Componentes de Reportes

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `ReportGenerationForm` | `apps/admin/components/reports/ReportGenerationForm.tsx` | `onSubmit: (params) => Promise<void>`, `isGenerating: boolean` | Formulario de generacion con tipo, formato, fechas, cascade dropdowns | `getOrganizations`, `classroomTeacherApi` |
| `ReportsList` | `apps/admin/components/reports/ReportsList.tsx` | `reports`, `isLoading`, `hasPendingReports`, `onDownload`, `onDelete`, `onRefresh` | Lista de reportes generados con acciones | `DetectiveCard` (probable) |
| `BetaBanner` | `apps/admin/components/reports/BetaBanner.tsx` | `dismissible?: boolean` | Banner de advertencia beta | - |

### 2.5 Componentes de Advanced (Feature Flags)

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `FeatureFlagsPanel` | `apps/admin/components/advanced/FeatureFlagsPanel.tsx` | ninguna | Panel principal de gestion de feature flags | `useFeatureFlags`, `FeatureFlagEditor`, `ConfirmDialog`, `DetectiveCard`, `DetectiveButton` |
| `FeatureFlagEditor` | `apps/admin/components/advanced/FeatureFlagEditor.tsx` | `flag: FeatureFlag \| null`, `onSave`, `onClose` | Modal para crear/editar feature flags | `DetectiveCard`, `DetectiveButton`, `RolloutSlider`, `TargetingConfig` |
| `RolloutSlider` | `apps/admin/components/advanced/RolloutSlider.tsx` | `value: number`, `onChange: (v: number) => void` | Slider de porcentaje de rollout | - |
| `TargetingConfig` | `apps/admin/components/advanced/TargetingConfig.tsx` | `targetRoles`, `targetUsers`, `onRolesChange`, `onUsersChange` | Configuracion de roles y usuarios objetivo | - |
| `ABTestingDashboard` | `apps/admin/components/advanced/ABTestingDashboard.tsx` | ninguna | Dashboard de experimentos A/B (100% mock) | `DetectiveCard`, `DetectiveButton`, `ConfirmDialog` |
| `TenantManagementPanel` | `apps/admin/components/advanced/TenantManagementPanel.tsx` | - | Placeholder (under construction) | - |
| `EconomicInterventionPanel` | `apps/admin/components/advanced/EconomicInterventionPanel.tsx` | - | Placeholder (coming soon) | - |

### 2.6 Componentes de Branding

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `ColorPicker` | `features/admin/branding/components/ColorPicker.tsx` | `label`, `value`, `onChange`, `description` | Selector de color con presets | - |
| `LogoUploader` | `features/admin/branding/components/LogoUploader.tsx` | `currentLogoUrl`, `onUpload`, `onRemove`, `disabled`, `description`, `dimensions` | Upload/remove de logo con preview | - |
| `FaviconUploader` | `features/admin/branding/components/FaviconUploader.tsx` | `currentFaviconUrl`, `onUpload`, `onRemove`, `disabled`, `description` | Upload/remove de favicon con preview | - |
| `ThemePreview` | `features/admin/branding/components/ThemePreview.tsx` | `platformName`, `logoUrl`, `primaryColor`, `secondaryColor`, `accentColor` | Preview live del branding aplicado | - |

### 2.7 Componentes de LTI

| Componente | Path | Props principales | Proposito | Dependencias |
|---|---|---|---|---|
| `LtiConsumerList` | `features/admin/lti/components/LtiConsumerList.tsx` | `consumers`, `loading`, `onEdit`, `onActivate`, `onDeactivate`, `onTestConnection`, `onViewCredentials` | Lista de LTI consumers con estado y acciones | `DetectiveCard`, `StatusBadge` (inline), `FeatureBadge` (inline) |
| `LtiConsumerForm` | `features/admin/lti/components/LtiConsumerForm.tsx` | `consumer`, `isOpen`, `onClose`, `onSubmit`, `isSubmitting` | Modal form para crear/editar consumer LTI 1.3 | `Modal`, `DetectiveButton`, `react-hook-form`, `FormInput` (inline), `FormToggle` (inline), `FormSection` (inline) |
| `LtiCredentialsDisplay` | `features/admin/lti/components/LtiCredentialsDisplay.tsx` | `consumer`, `isOpen`, `onClose`, `onRegenerateCredentials`, `isRegenerating` | Modal con credenciales LTI y boton regenerar | `Modal`, `DetectiveButton` |
| `ConnectionTestModal` | `features/admin/lti/components/ConnectionTestModal.tsx` | `consumer`, `isOpen`, `onClose`, `onTest`, `isTesting` | Modal para ejecutar y mostrar resultado de test de conexion | `Modal`, `DetectiveButton` |

### 2.8 Componentes Compartidos usados

| Componente | Usado en paginas |
|---|---|
| `AdminPageShell` | Settings, Alerts, Notifications, NotificationPreferences, Reports, Advanced |
| `AdminLayout` | BrandingSettings, LTI |
| `AdminTabBar` | Settings (tab navigation) |
| `DetectiveCard` | Todas |
| `DetectiveButton` | Alerts, Advanced, LTI |
| `ConfirmDialog` | Alerts (suppress), Advanced (delete flag, declare winner) |
| `Modal` | LTI (form, credentials, test) |

---

## 3. Analisis de Hooks

### 3.1 useSettings (DEPRECATED)

- **Path:** `apps/frontend/src/apps/admin/hooks/useSettings.ts`
- **Estado:** `@deprecated` — no usado por ninguna pagina activa
- **API calls:** `adminAPI.settings.getCategoryConfig()`, `adminAPI.settings.updateCategoryConfig()`
- **Patron:** Hibrido — React Query para mutaciones pero useState/useCallback para fetch (inconsistente)
- **Consumidores:** Ninguno (deprecated)
- **Issues:** [P2] Debe eliminarse del codebase. Sigue exportado en `hooks/index.ts` generando confusion.

### 3.2 useSystemConfig

- **Path:** `apps/frontend/src/apps/admin/hooks/useSystemConfig.ts`
- **API calls:**
  - `adminAPI.settings.getCategoryConfig(category)` — GET `/admin/system/config/:category`
  - `adminAPI.settings.getConfig()` — GET `/admin/system/config` (sin categoria)
  - `adminAPI.settings.updateCategoryConfig(category, values)` — PUT `/admin/system/config/:category`
  - `adminAPI.settings.updateConfig(values)` — PUT `/admin/system/config`
- **Return type:** `{ config, isLoading, error, fetchConfig, updateConfig, reset }`
- **Patron:** React Query con `enabled: false` — trigger manual via `fetchConfig()` (refetch)
- **staleTime:** `STALE_TIMES.SEMI_STATIC`
- **Consumidores:** `GeneralSettings`, `SecuritySettings`
- **Issues:** [P2] `enabled: false` con refetch manual no aprovecha el cache de React Query — cada montaje hace una peticion nueva. Deberia ser `enabled: !!category` para auto-fetch.

### 3.3 useConfigCategories

- **Path:** `apps/frontend/src/apps/admin/hooks/useConfigCategories.ts`
- **API calls:**
  - `getConfigCategories()` — GET `/admin/system/config/categories`
  - `validateConfig(category, config)` — POST `/admin/system/config/validate`
- **Return type:** `{ categories, validationResult, isLoading, isValidating, error, fetchCategories, validateConfiguration, clearValidation }`
- **Patron:** React Query (query auto-fetch + mutation)
- **staleTime:** `STALE_TIMES.STATIC`
- **Consumidores:** No identificado uso activo en las paginas de WS04 (disponible para uso futuro)
- **Issues:** [P2] Hook disponible pero no integrado en las paginas de settings actuales.

### 3.4 useAlerts

- **Path:** `apps/frontend/src/apps/admin/hooks/useAlerts.ts`
- **API calls:**
  - `adminAPI.alerts.list(filters)` — GET `/admin/alerts` (paginado)
  - `adminAPI.alerts.getStats()` — GET `/admin/alerts/stats`
  - `adminAPI.alerts.acknowledge(id, note)` — POST `/admin/alerts/:id/acknowledge`
  - `adminAPI.alerts.resolve(id, note)` — POST `/admin/alerts/:id/resolve`
  - `adminAPI.alerts.suppress(id)` — POST `/admin/alerts/:id/suppress`
- **Return type:** `UseAlertsReturn` — datos, stats, selectedAlert, isLoading, isLoadingStats, error, filters, setFilters, pagination, acciones, paginacion
- **Patron:** React Query (2 queries + 3 mutaciones)
- **staleTime:** `STALE_TIMES.REALTIME` para lista, `STALE_TIMES.DYNAMIC` para stats
- **Invalidacion:** Todas las mutaciones invalidan `alertsKeys.all` en onSuccess
- **Consumidores:** `AdminAlertsPage`
- **Issues:**
  - [P2] `resolveAlert` valida localmente (>= 10 chars) pero esta validacion deberia estar en el modal, no en el hook.
  - [P2] `isLoading` mezcla estado de query + mutaciones — puede dar loading=true incluso cuando la lista ya esta cargada y solo hay una mutacion en curso.

### 3.5 useReports

- **Path:** `apps/frontend/src/apps/admin/hooks/useReports.ts`
- **API calls:**
  - `adminAPI.reports.list(filters)` — GET `/admin/reports`
  - `adminAPI.reports.generate(params)` — POST `/admin/reports/generate`
  - `adminAPI.reports.download(reportId)` — GET `/admin/reports/:id/download` (blob)
  - `adminAPI.reports.delete(reportId)` — DELETE `/admin/reports/:id`
- **Return type:** `UseReportsReturn` — reports, isLoading, error, pagination, acciones, hasPendingReports
- **Patron:** React Query con `refetchInterval` condicional
- **Auto-refresh:** Cada 5s cuando `hasPendingReports === true`
- **Download:** Crea `<a>` element y simula click para descarga de blob
- **Consumidores:** `AdminReportsPage`
- **Issues:**
  - [P1] `downloadReport` busca el reporte en el array local `reports` — si el reporte fue paginado fuera de la vista actual, no se encontrara y lanzara "Report not found".
  - [P2] Auto-refresh a 5s puede generar muchas peticiones si hay muchos reportes pendientes durante un periodo largo. Deberia exponential backoff o limite de tiempo.

### 3.6 useFeatureFlags

- **Path:** `apps/frontend/src/apps/admin/hooks/useFeatureFlags.ts`
- **API calls (MOCK):**
  - GET `/admin/feature-flags` — simulado con delay 500ms
  - POST `/admin/feature-flags` — simulado
  - PUT `/admin/feature-flags/:key` — simulado
  - DELETE `/admin/feature-flags/:key` — mix: mock usa `featureFlagKeys.list()`, real usa `API_ENDPOINTS.admin.featureFlags.delete(key)`
- **Return type:** `UseFeatureFlagsResult` — flags, loading, error, CRUD operations, fetchFlags
- **Patron:** React Query con datos mock via `FEATURE_FLAGS.USE_MOCK_DATA`
- **Consumidores:** `FeatureFlagsPanel`
- **Issues:**
  - [P0] Backend no implementado. Todo es mock.
  - [P1] `fetchFlags()` hace `refetch()` pero en modo mock la query ya esta precargada. El boton "refresh" es cosmetic.
  - [P2] Inconsistencia en delete: modo mock filtra por `flag.key`, modo real usa `API_ENDPOINTS.admin.featureFlags.delete(key)` — distinto path que el PUT que usa `/admin/feature-flags/${key}` directamente.

### 3.7 useLtiConsumers

- **Path:** `apps/frontend/src/apps/admin/hooks/useLtiConsumers.ts`
- **API calls:**
  - `ltiApi.getConsumers()` — GET `/lti/consumers`
  - `ltiApi.getConsumerStats()` — GET `/lti/consumers/stats`
  - `ltiApi.createConsumer(data)` — POST `/lti/consumers`
  - `ltiApi.updateConsumer(id, data)` — PATCH `/lti/consumers/:id`
  - `ltiApi.verifyConsumer(id)` — POST `/lti/consumers/:id/verify`
  - `ltiApi.activateConsumer(id)` — POST `/lti/consumers/:id/activate`
  - `ltiApi.deactivateConsumer(id)` — DELETE `/lti/consumers/:id`
  - `ltiApi.testConnection(id)` — POST `/lti/consumers/:id/test-connection`
  - `ltiApi.regenerateCredentials(id)` — POST `/lti/consumers/:id/regenerate-credentials`
- **Return type:** `UseLtiConsumersResult` — consumers, stats, selectedConsumer, loading, error, testingConnection, regeneratingCredentials, CRUD + ops
- **Patron:** React Query (2 queries + 7 mutaciones)
- **Invalidacion:** Todas las mutaciones CRUD invalidan `ltiConsumerKeys.all`
- **Test/Regen:** No invalidan cache (no modifican estado de consumers)
- **Consumidores:** `AdminLtiPage`
- **Issues:**
  - [P2] `verifyConsumer` esta en el hook pero no hay un boton de "Verify" en `LtiConsumerList` — la funcionalidad existe en el hook pero no esta expuesta en la UI.
  - [P2] `selectedConsumer` en el hook es estado local pero `AdminLtiPage` tiene su propio `selectedConsumer` state — duplicacion de estado, el del hook nunca se usa.

---

## 4. Issues y Recomendaciones

### P0 — Criticos (bloquean funcionalidad o accesibilidad fundamental)

| ID | Pagina/Componente | Descripcion | Impacto |
|---|---|---|---|
| WS04-P0-001 | AdminAdvancedPage / useFeatureFlags | Backend de Feature Flags NO implementado. Toda la UI de feature flags opera sobre datos mock que se pierden al recargar. | Feature flags son no funcionales en produccion |
| WS04-P0-002 | AdminAdvancedPage / ABTestingDashboard | A/B Testing 100% hardcodeado. El boton "New Experiment" no crea nada. Las acciones (start/pause/declare winner) solo modifican estado local React. | Feature completamente no funcional |
| WS04-P0-003 | AdminNotificationPreferencesPage | Toggle buttons de preferencias sin `role="switch"` ni `aria-checked` — no accesibles para tecnologias asistivas. | Violacion WCAG 2.1 nivel A (4.1.2 Name, Role, Value) |

### P1 — Altos (afectan UX de manera significativa o tienen riesgo tecnico)

| ID | Pagina/Componente | Descripcion | Recomendacion |
|---|---|---|---|
| WS04-P1-001 | AdminNotificationPreferencesPage | Tipos de notificacion hardcodeados en frontend — si el backend agrega tipos, la UI no los reflejara. | Cargar tipos desde endpoint GET `/notifications/types` |
| WS04-P1-002 | AdminNotificationPreferencesPage | Sin feedback de error cuando `updatePreference` falla — revert silencioso. | Agregar `toast.error` en el catch de handleToggle |
| WS04-P1-003 | AdminNotificationsPage | `isRefreshing` local no sincroniza con el estado real del store. Error en fetch no resetea loading correctamente. | Usar `isLoading` directamente del store para el boton |
| WS04-P1-004 | AdminNotificationsPage | Sin `role="alert"` en banner de error — no anunciado a lectores de pantalla. | Agregar `role="alert"` al div de error |
| WS04-P1-005 | AdminSettingsPage / ProfileSettings | Campos de contrasena no se limpian en caso de error del servidor — datos sensibles permanecen en estado. | Limpiar `account` state en el catch de `handlePasswordChange` |
| WS04-P1-006 | AdminAlertsPage | Error en acknowledge/resolve no se comunica al usuario desde la pagina — solo el suppress usa `handleError`. | Unificar manejo de errores para las tres acciones |
| WS04-P1-007 | AdminReportsPage | `organization_id` no se incluye en GenerateReportParams aunque se seleccione una institucion sin seleccionar aula. | Agregar `organization_id` al payload si `organizationId` esta seleccionado |
| WS04-P1-008 | AdminReportsPage | Cascade dropdown carga organizaciones con `limit: 100` hardcodeado. | Agregar paginacion o busqueda al selector de instituciones |
| WS04-P1-009 | BrandingSettingsPage | `user?.tenantId || user?.tenant_id` — si ambos undefined, operaciones de logo/favicon fallan silenciosamente (early return sin feedback). | Validar tenantId al inicio y mostrar error si no disponible |
| WS04-P1-010 | BrandingSettingsPage | Layout incorrecto — usa `AdminLayout` con `gamificationData` manual en lugar de `AdminPageShell`. Si `AdminPageShell` tiene guards/breadcrumbs, esta pagina los omite. | Migrar a `AdminPageShell` o documentar la decision arquitectonica |
| WS04-P1-011 | AdminLtiPage | Mismo issue de layout — usa `AdminLayout` directamente. | Migrar a `AdminPageShell` |
| WS04-P1-012 | AdminLtiPage | Botones de accion en `LtiConsumerList` solo tienen `title` attribute para accesibilidad — insuficiente. | Agregar `aria-label` a cada boton de accion |
| WS04-P1-013 | AdminLtiPage | Pagina oculta del sidebar — sin ruta de navegacion visible para administradores. | Agregar al sidebar o documentar intencionalidad |
| WS04-P1-014 | useReports | `downloadReport` busca el reporte en array local paginado — falla si el reporte no esta en la pagina actual. | Descargar por ID directamente sin buscar en array local |
| WS04-P1-015 | AdminAdvancedPage | Pagina oculta del menu pero ruta activa sin guard adicional. | Agregar `AdminGuard` o `SuperAdminGuard` a la ruta |

### P2 — Medios (deuda tecnica, inconsistencias, mejoras de calidad)

| ID | Pagina/Componente | Descripcion | Recomendacion |
|---|---|---|---|
| WS04-P2-001 | useSettings | Hook `@deprecated` sigue exportado en index.ts. | Eliminar de `hooks/index.ts` y del archivo |
| WS04-P2-002 | useSystemConfig | `enabled: false` con refetch manual no aprovecha cache. | Cambiar a `enabled: !!category` |
| WS04-P2-003 | useConfigCategories | Disponible pero no integrado en paginas de settings. | Integrar para validacion pre-save en GeneralSettings/SecuritySettings |
| WS04-P2-004 | AdminNotificationsPage | Zustand store para datos del servidor — inconsistente con patron React Query del resto del admin. | Migrar a React Query |
| WS04-P2-005 | AdminReportsPage | `BetaBanner` con `dismissible={true}` no persiste el dismiss. | Persistir en `localStorage` |
| WS04-P2-006 | AdminReportsPage | Mezcla de estilos `dark:` Tailwind en ReportGenerationForm vs `detective-*` en el resto. | Unificar estilos |
| WS04-P2-007 | BrandingSettingsPage | Preview en tiempo real sin debounce — dispara en cada keystroke. | Agregar debounce de 300ms a `previewBranding` |
| WS04-P2-008 | BrandingSettingsPage | Textos en ingles — inconsistente con el resto del admin en espanol. | Traducir todos los strings al espanol |
| WS04-P2-009 | BrandingSettingsPage | `toast` con emoji `↩️` — inconsistente con patron `toast.success/error`. | Usar `toast.success('Cambios revertidos')` |
| WS04-P2-010 | AdminLtiPage | `StatsCard` definido inline en la pagina. | Mover a `features/admin/lti/components/` |
| WS04-P2-011 | AdminLtiPage | Boton "Deactivate" usa icono `Trash2` — semanticamente incorrecto para soft delete. | Usar icono `PowerOff` o `Ban` |
| WS04-P2-012 | useLtiConsumers | `verifyConsumer` disponible en hook pero no expuesto en UI. | Agregar boton "Verify" a `LtiConsumerList` o eliminar del hook |
| WS04-P2-013 | useLtiConsumers | `selectedConsumer` duplicado entre hook y pagina. | Eliminar el del hook, usar solo el de la pagina |
| WS04-P2-014 | useAlerts | `isLoading` mezcla query + mutaciones. | Separar `isListLoading` de `isMutating` |
| WS04-P2-015 | useFeatureFlags | Inconsistencia en ruta de delete entre mock y real. | Unificar usando `API_ENDPOINTS.admin.featureFlags.delete(key)` en ambas ramas |
| WS04-P2-016 | AdminAdvancedPage | `TenantManagementPanel` y `EconomicInterventionPanel` existen como archivos pero son placeholders. | Documentar como "pending implementation" en PROXIMA-ACCION |
| WS04-P2-017 | AdminAlertsPage | No hay feedback de exito (toast) despues de Acknowledge/Resolve exitoso. | Agregar `toast.success` en `onSuccess` de las mutaciones |
| WS04-P2-018 | AdminNotificationPreferencesPage | Grid de 4 columnas sin breakpoints responsivos. | Agregar `grid-cols-1 sm:grid-cols-4` |

---

## 5. Cobertura de Documentacion

### 5.1 Flujos documentados (docs/30-ux-ui/flujos/admin/)

| Flujo | Archivo | Paginas cubiertas | Estado |
|---|---|---|---|
| FL-ADM-02 | `FLUJO-CONFIGURACION-SISTEMA.md` | AdminSettingsPage, AdminAdvancedPage (parcial) | Documentado |
| FL-ADM-05 | `FLUJO-INTEGRACIONES-LTI.md` | AdminLtiPage | Documentado |
| FL-ADM-11 | `FLUJO-REPORTES-ANALYTICS-ADMIN.md` | AdminReportsPage | Documentado |

### 5.2 Paginas sin flujo documentado

| Pagina | Estado |
|---|---|
| AdminAlertsPage | **Sin flujo dedicado** — mencionada en PORTAL-ADMIN-GUIDE.md pero sin FL-ADM-XX propio |
| AdminNotificationsPage | **Sin flujo dedicado** |
| AdminNotificationPreferencesPage | **Sin flujo dedicado** |
| BrandingSettingsPage | **Sin flujo dedicado** |
| AdminAdvancedPage (Feature Flags, A/B) | Parcialmente en FL-ADM-02, sin flujo propio |

### 5.3 Cobertura en PORTAL-ADMIN-GUIDE.md

- Settings: mencionado con estructura de componentes (seccion 609-615)
- Alerts: mencionado con endpoints (seccion 494-530)
- Reports: mencionado con endpoints (seccion 568-609)
- Advanced: mencionado brevemente (seccion 610)
- Notificaciones: estructura de componentes listada (seccion 83-86)
- Branding: no aparece explicitamente en las secciones revisadas
- LTI: no aparece explicitamente en las secciones revisadas

### 5.4 Brechas de documentacion

1. **Branding y LTI** — sin entrada en PORTAL-ADMIN-GUIDE.md ni flujos dedicados
2. **NotificationPreferencesPage** — sin flujo ni documentacion de preferencias
3. **ABTestingDashboard** — no documentado (es experimental/mock)
4. **Feature Flags backend** — FL-ADM-02 asume backend implementado pero no lo esta
5. **Accesibilidad** — ninguno de los flujos documenta consideraciones de accesibilidad

### 5.5 Documentacion de estado real vs documentado

| Aspecto | Documentado | Real |
|---|---|---|
| Feature Flags | Backend implementado (FL-ADM-02) | Mock data solamente |
| A/B Testing | No documentado | Hardcoded mock |
| Admin Branding ruta | `/admin/settings/branding` (App.tsx) | Sin entrada en sidebar segun guia |
| Admin LTI ruta | Referenciada en App.tsx | Sin entrada visible en sidebar |
| Notificacion push | Documentada como feature | Dependiente de Service Worker (browser support) |

---

## 6. Resumen Ejecutivo

**Total de archivos analizados:** 40+ (8 paginas, ~20 componentes, 7 hooks, 3 API services, 2 flujos, 1 portal guide)

**Estado general de las paginas en WS04:**

| Pagina | Funcionalidad | Accesibilidad | Consistencia | Prioridad de atencion |
|---|---|---|---|---|
| AdminSettingsPage | COMPLETA | BUENA | BUENA | Media |
| AdminAlertsPage | COMPLETA | BUENA | BUENA | Media |
| AdminNotificationsPage | COMPLETA | DEFICIENTE | MEDIA | Alta |
| AdminNotificationPreferencesPage | PARCIAL | DEFICIENTE | MEDIA | Alta |
| AdminReportsPage | COMPLETA | BUENA | MEDIA | Media |
| AdminAdvancedPage | PARCIAL (feature flags mock) | MEDIA | BUENA | Critica |
| BrandingSettingsPage | COMPLETA | MEDIA | DEFICIENTE | Alta |
| AdminLtiPage | COMPLETA | MEDIA | DEFICIENTE | Alta |

**Issues totales identificados:** 35 (3 P0, 15 P1, 17 P2)

**Patron critico transversal:** Las paginas en `features/admin/` (Branding, LTI) usan `AdminLayout` directamente mientras las paginas en `apps/admin/pages/` usan `AdminPageShell`. Esta division arquitectonica genera inconsistencia en guards, breadcrumbs, y paso de datos de gamificacion. Se recomienda estandarizar a `AdminPageShell` para todas las paginas del portal admin.
