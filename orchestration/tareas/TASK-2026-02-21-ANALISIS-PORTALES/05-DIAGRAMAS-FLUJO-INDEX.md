# 05 - Indice de Diagramas de Flujo

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** WS10

---

## Resumen

| Seccion | Diagramas | Tipos |
|---------|-----------|-------|
| 1. Admin Flows | 16 | flowchart TD |
| 2. Teacher Flows | 15 | flowchart TD |
| 3. Student Flows | 20 | flowchart TD, sequenceDiagram, stateDiagram-v2 |
| 4. Parent Flows | 4 | flowchart TD |
| 5. Cross-Portal Flows | 5 | flowchart TD, sequenceDiagram |
| **Total** | **60** | 3 tipos distintos |

### Tipos de Diagrama

| Tipo | Cantidad | Uso |
|------|----------|-----|
| `flowchart TD` | 47 | Flujos de proceso, navegacion de paginas, interacciones de usuario |
| `sequenceDiagram` | 11 | Interacciones API, comunicacion entre portales, WebSocket |
| `stateDiagram-v2` | 2 | Maquina de estados del ejercicio, progresion de rangos maya |

---

## 1. Admin Flows (16 diagramas)

| # | Diagrama | Tipo | Pagina/Componente | Contenido |
|---|----------|------|-------------------|-----------|
| 1.1 | Login a Dashboard | flowchart TD | LoginPage -> AdminDashboardPage | Flujo de auth con getRoleBasedRedirect, renderizado de dashboard stats |
| 1.2 | Gestion de Usuarios (CRUD) | flowchart TD | AdminUsersPage | CRUD completo: crear, editar, suspender, eliminar, bulk actions |
| 1.3 | Gestion de Roles y Permisos | flowchart TD | AdminRolesPage | Seleccion de rol, edicion de permisos, save/cancel |
| 1.4 | Gestion de Instituciones | flowchart TD | AdminInstitutionsPage | CRUD: crear, ver, editar, features, eliminar |
| 1.5 | Asignacion Aula-Docente | flowchart TD | AdminClassroomTeacherPage | Tabs por aula/docente, asignar/remover |
| 1.6 | Gestion de Contenido | flowchart TD | AdminContentPage | 3 tabs: pendientes, multimedia, versiones; approve/reject flow |
| 1.7 | Asistente de Creacion de Ejercicios | flowchart TD | AdminExerciseCreatePage | Wizard 4 pasos: BasicInfo -> TypeSelector -> Config -> Preview |
| 1.8 | Configuracion de Gamificacion | flowchart TD | AdminGamificationPage | 4 tabs: rangos, logros, economia, estadisticas |
| 1.9 | Gestion de Asignaciones | flowchart TD | AdminAssignmentsPage | Stats, filtros, tabla, detalle modal, export CSV |
| 1.10 | Monitoreo del Sistema | flowchart TD | AdminMonitoringPage | 4 tabs: logs, metricas, error tracking, alertas |
| 1.11 | Configuracion del Sistema | flowchart TD | AdminSettingsPage | 3 tabs: general, seguridad, perfil |
| 1.12 | Gestion de Alertas | flowchart TD | AdminAlertsPage | Stats, filtros, lista, acknowledge/resolve/suppress |
| 1.13 | Centro de Notificaciones | flowchart TD | AdminNotificationsPage | Zustand store, filtros, markRead, delete, WebSocket |
| 1.14 | Generacion de Reportes | flowchart TD | AdminReportsPage | Formulario + lista, auto-refresh, download |
| 1.15 | Integracion LTI | flowchart TD | AdminLtiPage | CRUD consumers, credentials display, connection test |
| 1.16 | Configuracion de Branding | flowchart TD | BrandingSettingsPage | Identity, colors, logos, live preview |

---

## 2. Teacher Flows (15 diagramas)

| # | Diagrama | Tipo | Pagina/Componente | Contenido |
|---|----------|------|-------------------|-----------|
| 2.1 | Login a Dashboard | flowchart TD | LoginPage -> TeacherDashboardPage | Auth con role redirect, 10 tabs del dashboard |
| 2.2 | Gestion de Aulas | flowchart TD | TeacherClassesPage | CRUD aulas: crear, editar, eliminar, ver estudiantes |
| 2.3 | Lista de Estudiantes y Progreso | flowchart TD | TeacherStudentsPage + TeacherProgressPage | Estudiantes por aula, progreso grupal, riesgo |
| 2.4 | Creacion de Asignaciones (Wizard) | flowchart TD | TeacherAssignmentsPage | ImprovedAssignmentWizard 4 pasos |
| 2.5 | Revision Manual de Ejercicios | flowchart TD | TeacherReviewPanelPage | Status tabs, filtros, rubrica, evaluacion, feedback |
| 2.6 | Generacion de Reportes | flowchart TD | TeacherReportsPage | 4 tabs: generar, recientes, programados, compartidos |
| 2.7 | Calificacion de Entregas | flowchart TD | TeacherAssignmentsPage | GradeSubmissionModal, calificacion 0-100, comentarios |
| 2.8 | Comunicacion con Padres | flowchart TD | TeacherCommunicationPage | 4 tabs: bandeja, conversaciones, anuncios, feedback |
| 2.9 | Dashboard de Analiticas | flowchart TD | TeacherDashboardPage tab:analytics | LearningAnalyticsDashboard, graficas de rendimiento |
| 2.10 | Seguimiento de Asignaciones | flowchart TD | TeacherDashboardPage tab:assignments | AssignmentCreator, deadlines, entregas pendientes |
| 2.11 | Monitoreo de Estudiantes | flowchart TD | TeacherDashboardPage tab:monitoring | StudentMonitoringPanel, tiempo real, engagement |
| 2.12 | Reportes Programados | flowchart TD | TeacherReportsPage tab:programados | CRUD programacion: diaria, semanal, mensual |
| 2.13 | Recursos Compartidos | flowchart TD | TeacherDashboardPage tab:resources | ResourceSharingPanel, compartir/usar recursos |
| 2.14 | Alertas de Intervencion | flowchart TD | TeacherDashboardPage tab:alerts | InterventionAlertsPanel, tipos de alerta, acciones |
| 2.15 | Configuracion de Alertas | flowchart TD | TeacherAlertConfigPage | Umbrales, canales, frecuencia |

---

## 3. Student Flows (20 diagramas)

| # | Diagrama | Tipo | Pagina/Componente | Contenido |
|---|----------|------|-------------------|-----------|
| 3.1 | Login a Dashboard | flowchart TD | LoginPage -> DashboardComplete | Auth, StudentPageShell, stats, modules, missions |
| 3.2 | Seleccion de Modulo | flowchart TD | Dashboard/LearningPage -> ModuleDetailPage | Navegacion a modulo, lista de ejercicios |
| 3.3 | Flujo Completo de Ejercicio | **sequenceDiagram** | ExercisePage -> ExerciseProvider -> API | Start-Execute-Submit-Feedback con comodines |
| 3.4 | Maquina de Estados del Ejercicio | **stateDiagram-v2** | ExerciseContext | Loading->Ready->InProgress->Submitting->Feedback->Completed |
| 3.5 | Modulo 1 - Comprension Literal | flowchart TD | 7 mecanicas M1 | CompletarEspacios, Crucigrama, Emparejamiento, MapaConceptual, SopaLetras, Timeline, VerdaderoFalso |
| 3.6 | Modulo 2 - Comprension Inferencial | flowchart TD | 6 mecanicas M2 | CausaEfecto, DetectiveTextual, LecturaInferencial, PrediccionNarrativa, PuzzleContexto, RuedaInferencias |
| 3.7 | Modulo 3 - Comprension Critica | flowchart TD | 5 mecanicas M3 | AnalisisFuentes, DebateDigital, MatrizPerspectivas, PodcastArgumentativo, TribunalOpiniones + revision manual |
| 3.8 | Modulo 4 - Alfabetizacion Digital | flowchart TD | 5 mecanicas M4 | AnalisisMemes, InfografiaInteractiva, NavegacionHipertextual, QuizTikTok, VerificadorFakeNews |
| 3.9 | Modulo 5 - Produccion Creativa | flowchart TD | 3 mecanicas M5 | ComicDigital, DiarioMultimedia, VideoCarta + revision manual |
| 3.10 | Gamificacion: XP | **sequenceDiagram** | Exercise -> Backend -> WebSocket | Calculo XP, verificacion rank_up, WebSocket emit |
| 3.11 | Gamificacion: Rangos Maya | **stateDiagram-v2** | Rangos Maya | Ajaw->BAlam->Chaak->KukulKan->Itzamna->Ahau |
| 3.12 | Gamificacion: Logros | flowchart TD | AchievementsPage | Filtros, earned/pending/hidden, claim rewards |
| 3.13 | Gamificacion: Tienda | flowchart TD | ShopPage | Balance, filtros, compra, PurchaseModal |
| 3.14 | Leaderboard | flowchart TD | LeaderboardPage | Tabs global/escuela/aula, batch equipment, stats |
| 3.15 | Misiones/Quests | flowchart TD | MissionsPage | Daily/weekly/special, start/complete/claim |
| 3.16 | Gestion de Perfil | flowchart TD | EnhancedProfilePage | Avatar, stats, rango, logros, editar |
| 3.17 | Seguimiento de Progreso | flowchart TD | MyProgressPage -> ModuleDetailsPage | Vista general, cards por modulo, detalle |
| 3.18 | Vista de Asignaciones | flowchart TD | AssignmentsPage -> AssignmentDetailPage | Lista filtrada, detalle, ejercicios, completar |
| 3.19 | Funciones Sociales | flowchart TD | FriendsPage + GuildsPage | Amigos, gremios, challenges |
| 3.20 | Centro de Notificaciones | flowchart TD | NotificationsPage | Types, markRead, WebSocket real-time |

---

## 4. Parent Flows (4 diagramas)

| # | Diagrama | Tipo | Pagina/Componente | Contenido |
|---|----------|------|-------------------|-----------|
| 4.1 | Login a Dashboard | flowchart TD | ParentLoginPage -> ParentDashboardPage | parentStore auth, cards de hijos, actividades |
| 4.2 | Vinculacion con Estudiante | flowchart TD | ParentDashboardPage | Modal, codigo de vinculacion, tipo de relacion |
| 4.3 | Vista de Progreso del Hijo | flowchart TD | ChildProgressPage | Promise.all datos, 3 tabs: overview/activities/reports |
| 4.4 | Preferencias de Notificaciones | flowchart TD | ParentDashboardPage | Canales (email/push/SMS), tipos de notificacion |

---

## 5. Cross-Portal Flows (5 diagramas)

| # | Diagrama | Tipo | Scope | Contenido |
|---|----------|------|-------|-----------|
| 5.1 | Autenticacion + Ruteo por Roles | flowchart TD | Todos los portales | Login/register por portal, getRoleBasedRedirect, ProtectedRoute |
| 5.2 | Sistema de Notificaciones | **sequenceDiagram** | Backend -> WebSocket -> Frontend | Notificacion DB, WebSocket emit, store update, UI render |
| 5.3 | Gestion de Sesion | flowchart TD | Todos los portales | AuthProvider mount, token validation, dual sync, logout flow |
| 5.4 | Ejercicio Cross-Portal | **sequenceDiagram** | Teacher -> Student -> Teacher | Asignacion -> ejecucion -> revision manual (M3-M5) |
| 5.5 | Gamificacion Cross-Portal | **sequenceDiagram** | Admin -> Student -> Parent | Config -> gameplay -> observacion de progreso |

---

## 6. Componentes Clave Referenciados en Diagramas

### Auth System
- `AuthProvider` (AuthContext.tsx) -- Dual auth: Context + Zustand
- `ProtectedRoute` -- RBAC + WebSocket init + GamificationOverlay
- `LoginForm` -- react-hook-form + zod + getRoleBasedRedirect
- `authStore` (Zustand) -- Estado persistente de autenticacion

### Admin Portal
- `AdminPageShell` -- Layout compartido
- `AdminTabBar` -- Navegacion por tabs
- Hooks: useAdminDashboard, useUserManagement, useRoles, useRolePermissions, useInstitutionActions, useGamificationConfig, useAlerts, useMonitoring, useReports, useLtiConsumers

### Teacher Portal
- `TeacherPageShell` -- Layout compartido
- `TabBar` -- Navegacion por tabs
- Hooks: useTeacherDashboard, useClassrooms, useAssignments, useTeacherMessages, useMyReviews, useManualReviewConfig

### Student Portal
- `StudentPageShell` -- Layout compartido
- `ExerciseProvider` + `ExerciseContext` -- Estado del ejercicio
- `ExerciseLayout` + Registry Pattern -- UI del ejercicio
- Hooks: useDashboardData, useMissions, useUserModules, useExerciseData, useExerciseProgress, useExerciseComodines, useAchievements, useLeaderboards, useCoins, useShopData

### Parent Portal
- `parentStore` (Zustand) -- Estado del portal padre
- `parentAPI` -- Servicio de API dedicado
- Componentes: ChildProgressCard, WeeklyReportView

### Cross-Portal
- `useWebSocket` -- Socket.IO con validacion JWT
- `notificationsStore` (Zustand) -- Estado de notificaciones
- `GamificationOverlay` -- Animaciones de logros/rangos
- `useInvalidateDashboard` -- Invalidacion de cache React Query

---

## 7. Ubicacion del Documento Fuente

Todos los 60 diagramas Mermaid estan incluidos con codigo fuente completo en:

```
orchestration/tareas/TASK-2026-02-21-ANALISIS-PORTALES/WS10-DIAGRAMAS-FLUJO-COMPLETOS.md
```

Para renderizar los diagramas, usar cualquier visor Mermaid compatible (VS Code extension, GitHub, Mermaid Live Editor).
