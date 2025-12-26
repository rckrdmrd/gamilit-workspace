# COMPONENTES FRONTEND - INVENTARIO

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Version:** 1.0
**Fecha:** 2025-12-26
**Auditoria:** Inventario real de componentes implementados

---

## RESUMEN EJECUTIVO

| Categoria | Componentes | Descripcion |
|-----------|-------------|-------------|
| Shared | 40 | Componentes base reutilizables |
| Features (main) | 31 | Componentes de funcionalidad core |
| Gamification | 71 | Sistema de gamificacion completo |
| Mechanics | 156 | Mecanicas educativas (30 ejercicios) |
| Apps | 180 | Componentes por portal (Admin, Teacher, Student) |
| **TOTAL** | **478** | - |

---

## 1. COMPONENTES COMPARTIDOS (40)

**Ubicacion:** `src/shared/components/`

### Por Subcategoria

| Subcategoria | Cantidad | Ejemplos |
|--------------|----------|----------|
| Base | 11 | Toast, StatusBadge, ColorfulCard, RankBadge, LoadingOverlay |
| Common | 9 | Componentes de uso general |
| Layout | 3 | Componentes de estructura de pagina |
| Mechanics | 11 | MediaUploader, RubricEvaluator, ExerciseContentRenderer |
| Timeline | 2 | Componentes de linea de tiempo |
| Loading | 2 | Componentes de estado de carga |
| Celebrations | 1 | Feedback positivo |
| Media | 1 | Manejo de multimedia |

### Componentes Clave

| Componente | Proposito |
|------------|-----------|
| ProtectedRoute | Rutas protegidas por autenticacion |
| MediaUploader | Carga de archivos multimedia M4-M5 |
| RubricEvaluator | Evaluacion con rubricas para docentes |
| ExerciseContentRenderer | Renderiza contenido de ejercicios |
| LoadingOverlay | Overlay de carga global |

---

## 2. COMPONENTES DE FEATURES (31)

**Ubicacion:** `src/features/*/components/`

### Por Feature

| Feature | Componentes | Estado |
|---------|-------------|--------|
| Auth | 13 | Completo |
| Exercises | 11 | Completo |
| Admin | 2 | Basico |
| Gamification (main) | 3 | Completo |
| Notifications | 2 | Completo |

---

## 3. GAMIFICACION (71)

**Ubicacion:** `src/features/gamification/*/components/`

### Por Subfeature

| Subfeature | Componentes | Descripcion |
|------------|-------------|-------------|
| Social | 43 | Amigos, mensajes, activity feed |
| Economy | 13 | ML Coins, shop, precios |
| Ranks | 8 | Sistema de rangos Maya |
| Missions | 7 | Misiones y desafios |

### Componentes Destacados

| Componente | Subfeature | Proposito |
|------------|------------|-----------|
| FriendsList | Social | Lista de amigos con estados |
| LeaderboardTable | Social | Tabla de clasificacion |
| ShopItemCard | Economy | Tarjeta de item en tienda |
| CoinDisplay | Economy | Muestra ML Coins |
| MayaRankBadge | Ranks | Badge de rango Maya |
| MissionCard | Missions | Tarjeta de mision |

---

## 4. MECANICAS EDUCATIVAS (156)

**Ubicacion:** `src/features/mechanics/*/`

### Por Modulo

| Modulo | Componentes | Mecanicas |
|--------|-------------|-----------|
| Auxiliar | 16 | 4 (CallToAction, CollagePrensa, ComprencionAuditiva, TextoEnMovimiento) |
| Module 1 | 38 | 7 (Crucigrama, Emparejamiento, VerdaderoFalso, MapaConceptual, SopaLetras, Timeline, CompletarEspacios) |
| Module 2 | 27 | 6 (DetectiveTextual, LecturaInferencial, PrediccionNarrativa, ConstruccionHipotesis, RuedaInferencias, PuzzleContexto) |
| Module 3 | 25 | 5 (DebateDigital, AnalisisFuentes, TribunalOpiniones, MatrizPerspectivas, PodcastArgumentativo) |
| Module 4 | 32 | 5 (VerificadorFakeNews, AnalisisMemes, NavegacionHipertextual, InfografiaInteractiva, QuizTikTok) |
| Module 5 | 12 | 3 (ComicDigital, DiarioMultimedia, VideoCarta) |
| Shared | 6 | APIs, hooks, utils compartidos |

### Estructura por Mecanica

Cada mecanica tiene:
- `*Exercise.tsx` - Componente principal
- `*Types.ts` - Tipos TypeScript
- `*Schemas.ts` - Schemas Zod
- `*MockData.ts` - Datos de prueba
- Componentes auxiliares especificos

---

## 5. COMPONENTES POR APP (180)

### Admin App (85)

**Ubicacion:** `src/apps/admin/components/`

| Subcategoria | Cantidad | Ejemplos |
|--------------|----------|----------|
| Advanced | 9 | TenantManagement, BulkOperations |
| Alerts | 9 | SystemAlertsTable, AlertDetailsModal |
| Analytics | 4 | AnalyticsCharts, MetricsCards |
| Assignments | 4 | AssignmentsTable, AssignmentFilters |
| Classroom-Teacher | 2 | Asignacion profesor-aula |
| Content | 5 | ContentTable, ContentEditor |
| Dashboard | 10 | StatsCards, RecentActivity |
| Gamification | 7 | RankDistribution, XPGraph |
| Institutions | 5 | SchoolsTable, ClassroomsPanel |
| Monitoring | 10 | LogsViewer, SystemMetrics |
| Progress | 5 | ProgressOverview, ModuleStats |
| Reports | 4 | ReportGenerator, ExportOptions |
| Roles | 4 | RolesTable, PermissionsMatrix |
| Settings | 3 | GeneralSettings, SecuritySettings |
| Users | 4 | UsersTable, UserDetailsModal |

### Teacher App (47)

**Ubicacion:** `src/apps/teacher/components/`

| Subcategoria | Cantidad | Ejemplos |
|--------------|----------|----------|
| Dashboard | 11 | TeacherStats, ClassOverview |
| Assignments | 6 | AssignmentEditor, DueDate |
| Analytics | 3 | StudentProgress, ModuleAnalytics |
| Grading | 2 | GradingPanel, RubricEditor |
| Monitoring | 5 | AlertsPanel, ActivityFeed |
| Responses | 3 | ResponsesTable, ResponseDetailModal |
| Progress | 4 | StudentProgressCard, ModuleProgress |
| Reports | 2 | ClassReport, StudentReport |
| Communication | 6 | MessageComposer, AnnouncementForm |
| Collaboration | 2 | TeamBuilder, GroupAssigner |
| Alerts | 2 | InterventionAlertsPanel, AlertFilters |

### Student App (48)

**Ubicacion:** `src/apps/student/components/`

| Subcategoria | Cantidad | Ejemplos |
|--------------|----------|----------|
| Dashboard | 22 | ProgressWidget, MissionsPreview, RankDisplay |
| Exercise | 6 | ExerciseCard, ExerciseTimer |
| Achievements | 7 | AchievementsPreview, BadgeDisplay |
| Gamification | 7 | CoinBalance, XPProgress |
| Interactions | 2 | FeedbackModal, HelpRequest |
| Notifications | 3 | NotificationBell, NotificationList |

---

## 6. HOOKS (103)

### Resumen

| Ubicacion | Cantidad |
|-----------|----------|
| Shared hooks | 12 |
| Admin hooks | 23 |
| Teacher hooks | 21 |
| Student hooks | 13 |
| Auth hooks | 6 |
| Exercises hooks | 4 |
| Gamification Economy | 5 |
| Gamification Ranks | 6 |
| Gamification Social | 7 |
| Gamification Missions | 1 |
| Notifications | 2 |
| Progress | 1 |
| Root hooks | 2 |

### Hooks Compartidos Clave

| Hook | Proposito |
|------|-----------|
| useAuth | Autenticacion y usuario actual |
| useInvalidateDashboard | Refrescar datos dashboard |
| useSanitizedHTML | Sanitizar HTML para XSS |
| useVideoRecorder | Grabacion de video M5 |
| useAudioRecorder | Grabacion de audio M5 |

---

## 7. STORES (Zustand)

| Store | Proposito |
|-------|-----------|
| authStore | Estado de autenticacion |
| userStore | Datos del usuario |
| leaderboardsStore | Datos de clasificacion |
| missionsStore | Misiones activas |
| shopStore | Estado de tienda |
| notificationsStore | Notificaciones |
| exerciseStore | Estado de ejercicio actual |

---

## 8. PATRONES ARQUITECTONICOS

### Component/Page Pattern

Usado en Teacher Portal:
- `TeacherXXX.tsx` = Componente core con logica
- `TeacherXXXPage.tsx` = Wrapper con TeacherLayout

### Feature-First Organization

```
features/
  gamification/
    social/
      components/
      hooks/
      store/
      types/
      api/
```

### Barrel Exports

Cada carpeta tiene `index.ts` para exports centralizados.

---

## 9. ESTADISTICAS TECNICAS

| Metrica | Valor |
|---------|-------|
| Componentes totales | 478 |
| Hooks totales | 103 |
| Stores (Zustand) | 11 |
| Mecanicas educativas | 30 |
| LOC estimadas | ~100,000 |

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-26
**Version:** 1.0
