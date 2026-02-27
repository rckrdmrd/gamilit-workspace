# Guía de Desarrollo - Portal Student

**Fecha de creación:** 2025-11-29
**Versión:** 2.2.0
**Estado:** VIGENTE
**Última actualización:** 2026-02-21 (M3-M5 teacher-grade exclusivo; Mejoras Sistema de Misiones: exercise_id, auto-start, MissionDetailModal)
**Aplica a:** apps/frontend/src/apps/student/ + apps/backend/src/modules/[progress, gamification, educational]

---

## 1. Visión General

### 1.1 Propósito

El Portal Student es la interfaz principal para estudiantes en GAMILIT. Es una plataforma educativa gamificada con temática de detective e inspiración Maya que proporciona:

- **Aprendizaje Interactivo:** Módulos educativos con ejercicios de comprensión lectora
- **Gamificación Completa:** Sistema de rangos Maya, achievements, misiones y ML Coins
- **Progreso Personalizado:** Dashboard con métricas de desempeño y actividades recientes
- **Economía Virtual:** Tienda de power-ups, comodines y items cosméticos
- **Social:** Leaderboards, guilds, friends y competencia sana
- **Notificaciones:** Sistema de alertas y celebraciones por logros

### 1.2 Usuarios Objetivo

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| Student | Completo | Todas las funcionalidades del portal |
| Teacher | Supervisión | Vista de progreso de estudiantes |
| Admin | Monitoreo | Vista de todas las métricas y configuración |

### 1.3 Temática y Narrativa

**Tema Principal:** Detective educativo con elementos de cultura Maya

- **Rangos:** Jerarquía Maya (Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan)
- **Moneda:** ML Coins (Marie Learning Coins)
- **Narrativa:** Estudiante como "Detective" que resuelve "casos" (ejercicios)
- **Iconografía:** Lupa, expediente, evidencias, rango Maya

---

## 2. Arquitectura del Portal

### 2.1 Estructura de Carpetas

#### Frontend (apps/frontend/src/apps/student/)

```
student/
├── pages/                              # 27 páginas principales
│   ├── DashboardComplete.tsx           # ⭐ Dashboard principal
│   ├── ExercisePage.tsx                # ⭐ Ejercicios interactivos (mecánicas)
│   ├── GamificationPage.tsx            # ⭐ Hub de gamificación
│   ├── ModuleDetailPage.tsx            # Detalle de módulo educativo
│   ├── AchievementsPage.tsx            # Logros desbloqueados
│   ├── ShopPage.tsx                    # Tienda ML Coins
│   ├── LeaderboardPage.tsx             # Rankings globales
│   ├── MissionsPage.tsx                # Misiones activas
│   ├── InventoryPage.tsx               # Inventario de comodines
│   ├── FriendsPage.tsx                 # Sistema de amigos
│   ├── GuildsPage.tsx                  # Guilds/clanes
│   ├── EnhancedProfilePage.tsx         # Perfil de usuario
│   ├── SettingsPage.tsx                # Configuración
│   ├── NotificationsPage.tsx           # Centro de notificaciones
│   ├── AssignmentsPage.tsx             # Tareas del teacher
│   ├── LoginPage.tsx                   # Autenticación
│   ├── RegisterPage.tsx                # Registro
│   ├── PasswordRecoveryPage.tsx        # Recuperación contraseña
│   └── ...
├── components/                         # Componentes organizados por dominio
│   ├── dashboard/                      # Componentes del dashboard
│   │   ├── BottomNavigation.tsx        # ⭐ Navegación móvil (6 tabs)
│   │   ├── EnhancedStatsGrid.tsx       # Estadísticas detective
│   │   ├── RankProgressWidget.tsx      # Widget de rango Maya
│   │   ├── MLCoinsWidget.tsx           # Balance de ML Coins
│   │   ├── MissionsPanel.tsx           # Misiones activas
│   │   ├── ModulesSection.tsx          # Grid de módulos
│   │   ├── RecentActivityPanel.tsx     # Actividades recientes
│   │   ├── QuickActionsWidget.tsx      # Acciones rápidas
│   │   ├── AchievementMilestones.tsx   # Hitos de logros
│   │   └── ...
│   ├── exercise/                       # Componentes de ejercicios
│   │   ├── ExercisePageHeader.tsx      # Header con timer y score
│   │   └── ...
│   ├── gamification/                   # Componentes de gamificación
│   │   ├── AchievementsPreview.tsx     # Preview de logros
│   │   └── ...
│   ├── shop/                           # Tienda (Phase 2)
│   │   ├── ShopItemCard.tsx            # Card de item
│   │   ├── PurchaseModal.tsx           # Modal de confirmación
│   │   └── ShopIcon.tsx               # Iconos por categoría
│   ├── inventory/                      # Inventario (Phase 2)
│   │   ├── InventoryItemCard.tsx       # Card de item
│   │   ├── PowerUpModal.tsx            # Modal de activación
│   │   ├── EmptyInventory.tsx          # Estado vacío
│   │   ├── InventoryHeader.tsx         # Header con stats
│   │   └── InventoryFilters.tsx        # Filtros por categoría
│   ├── module/                         # Módulo educativo (Phase 2)
│   │   ├── ExerciseCard.tsx            # Card de ejercicio
│   │   └── ModuleMetaSections.tsx      # Secciones de metadata
│   ├── profile/                        # Perfil (Phase 2)
│   │   ├── ProfileHero.tsx             # Hero section perfil
│   │   ├── ProfileStatsTab.tsx         # Tab de estadísticas
│   │   ├── ProfileAchievementsTab.tsx  # Tab de logros
│   │   └── ProfileActivityTab.tsx      # Tab de actividad
│   ├── leaderboard/                    # Leaderboard (Phase 3)
│   │   ├── UserPositionCard.tsx        # Posición del usuario
│   │   ├── LeaderboardStatsGrid.tsx    # Grid de stats
│   │   ├── LeaderboardTable.tsx        # Tabla de ranking
│   │   ├── CategoryBreakdownPanel.tsx  # Desglose por categoría
│   │   └── PodiumDisplay.tsx           # Top 3 podio
│   ├── friends/                        # Amigos (Phase 3)
│   │   ├── FriendsListTab.tsx          # Lista de amigos
│   │   ├── PendingRequestsTab.tsx      # Solicitudes pendientes
│   │   ├── DiscoverTab.tsx             # Buscar amigos
│   │   ├── BlockedUsersTab.tsx         # Usuarios bloqueados
│   │   └── FriendCard.tsx              # Card de amigo
│   ├── guilds/                         # Guilds (Phase 3)
│   │   ├── MyGuildTab.tsx              # Mi guild
│   │   ├── DiscoverGuildsTab.tsx       # Explorar guilds
│   │   ├── GuildMissionsTab.tsx        # Misiones de guild
│   │   ├── GuildCard.tsx               # Card de guild
│   │   └── CreateGuildModal.tsx        # Modal de creación
│   ├── learning/                       # Aprendizaje (Phase 4)
│   │   └── ModuleCard.tsx              # Card de módulo educativo
│   ├── notifications/                  # Notificaciones y celebraciones
│   │   ├── AchievementToast.tsx        # Toast de logro desbloqueado
│   │   └── CelebrationModal.tsx        # Modal de celebración
│   ├── interactions/                   # Interacciones gestuales
│   │   └── SwipeableContainer.tsx      # Swipe para móvil
│   └── PowerUpBar.tsx                  # Barra de power-ups activos
├── hooks/                              # 13 custom hooks (student portal)
│   ├── useDashboardData.ts             # ⭐ Dashboard data + React Query
│   ├── useUserModules.ts               # Módulos del usuario
│   ├── useRecentActivities.ts          # Actividades recientes
│   ├── useAchievementsEnhanced.ts      # Achievements con filtros
│   ├── useProfileData.ts              # ⭐ Agrega 4 stores (Phase 4)
│   ├── useAvatarUpdate.ts             # ⭐ Optimistic avatar update (Phase 4)
│   ├── useExerciseState.ts             # Estado de ejercicio
│   ├── useExerciseAutoSave.ts          # Auto-save de progreso
│   ├── useExercisePowerUps.ts          # Power-ups en ejercicios
│   ├── useUserClassroom.ts             # Classroom del usuario
│   ├── useSwipeGesture.ts              # Gestos táctiles
│   ├── useResponsiveLayout.ts          # Responsive breakpoints
│   └── index.ts                        # Barrel export
└── types/
    └── index.ts                        # 40+ interfaces/types
```

#### Backend - Módulos Principales

```
apps/backend/src/modules/
├── progress/                           # Sistema de progreso
│   ├── controllers/
│   │   ├── exercise-submission.controller.ts
│   │   ├── exercise-attempt.controller.ts
│   │   ├── module-progress.controller.ts
│   │   └── learning-session.controller.ts
│   ├── services/
│   │   ├── exercise-submission.service.ts
│   │   ├── module-progress.service.ts
│   │   └── learning-session.service.ts
│   ├── entities/
│   │   ├── exercise-submission.entity.ts
│   │   ├── module-progress.entity.ts
│   │   └── learning-session.entity.ts
│   └── dto/
│       ├── create-exercise-submission.dto.ts
│       └── exercise-submission-response.dto.ts
├── gamification/                       # Sistema de gamificación
│   ├── controllers/
│   │   ├── achievements.controller.ts
│   │   ├── missions.controller.ts
│   │   ├── ml-coins.controller.ts
│   │   ├── ranks.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   └── comodines.controller.ts
│   ├── services/
│   │   ├── achievements.service.ts
│   │   ├── missions.service.ts
│   │   ├── ml-coins.service.ts
│   │   ├── ranks.service.ts
│   │   └── user-stats.service.ts
│   └── entities/
│       ├── achievement.entity.ts
│       ├── user-achievement.entity.ts
│       ├── mission.entity.ts
│       ├── user-rank.entity.ts
│       ├── ml-coins-transaction.entity.ts
│       └── user-stats.entity.ts
├── educational/                        # Contenido educativo
│   ├── controllers/
│   │   ├── modules.controller.ts
│   │   ├── exercises.controller.ts
│   │   └── media.controller.ts
│   ├── services/
│   │   ├── modules.service.ts
│   │   └── exercises.service.ts
│   └── entities/
│       ├── module.entity.ts
│       └── exercise.entity.ts
└── social/                             # Características sociales
    ├── controllers/
    │   ├── friendships.controller.ts
    │   ├── teams.controller.ts
    │   └── peer-challenges.controller.ts
    └── services/
        ├── friendships.service.ts
        └── teams.service.ts
```

### 2.2 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT PORTAL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Dashboard   │───►│  Modules     │───►│  Exercise    │      │
│  │  Complete    │    │  (Learning)  │    │  Page        │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                    │                    │              │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │          Custom Hooks Layer (React Query)            │       │
│  │  - useDashboardData()    - useUserModules()          │       │
│  │  - useExerciseState()    - useGamificationData()     │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                    │                    │              │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           API Services Layer (Axios)                 │       │
│  │  - progressAPI    - gamificationAPI                  │       │
│  │  - educationalAPI - socialAPI                        │       │
│  └──────────────────────────────────────────────────────┘       │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                          HTTP/REST
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                        BACKEND API                                │
├──────────────────────────────────────────────────────────────────┤
│  Controllers ──► Services ──► Repositories ──► Database          │
│       │             │                                            │
│       │             ├──► Gamification Module                     │
│       │             ├──► Progress Module                         │
│       │             ├──► Educational Module                      │
│       │             └──► Social Module                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Módulos Principales

### 3.1 Dashboard (DashboardComplete)

**Ruta:** `/`

**Propósito:** Centro de control del estudiante con visión general de progreso, misiones, módulos y actividades recientes.

**Componentes Clave:**

1. **GamifiedHeader**
   - Usuario autenticado
   - Balance de ML Coins
   - Rank actual con icono Maya
   - Botón de logout

2. **QuickActionsWidget**
   - Continuar último ejercicio
   - Ver misiones activas
   - Ir a tienda
   - Ver perfil

3. **RankProgressWidget** (4 columnas)
   - Rank actual con icono Maya
   - XP actual / XP requerido
   - Barra de progreso
   - Multiplicador activo

4. **ModulesSection** (8 columnas)
   - Grid de 4 módulos (2 col c/u)
   - Estado: available, in_progress, locked
   - Progreso porcentual
   - Dificultad (fácil, medio, difícil)

5. **EnhancedStatsGrid** (4 columnas)
   - Casos resueltos (ejercicios completados)
   - Racha actual de días
   - Tiempo total invertido
   - XP total acumulado

6. **MissionsPanel** (4 columnas)
   - Top 3 misiones activas
   - Progreso de cada misión
   - Recompensas (XP, ML Coins)
   - Tiempo límite

7. **RecentActivityPanel** (4 columnas)
   - Últimas 5 actividades
   - Timestamps relativos
   - Iconos por tipo de actividad

**Hooks Utilizados:**

```typescript
// Dashboard data (React Query)
const { rank, progress, loading, error, refresh } = useDashboardData();

// Missions from backend
const { allMissions, activeMissions } = useMissions();

// Modules filtered by classroom
const { modules, loading: modulesLoading } = useUserModules({
  classroomId: userClassroomId,
});

// Recent activities
const { activities, loading: activitiesLoading } = useRecentActivities(5);

// Gamification data (mock until backend ready)
const { gamificationData } = useUserGamification(user?.id);
```

**APIs:**

```typescript
// Dashboard aggregated data
GET /api/v1/gamification/users/:userId/ml-coins
GET /api/v1/gamification/ranks/current
GET /api/v1/gamification/ranks/users/:userId/rank-progress
GET /api/v1/gamification/users/:userId/achievements
GET /api/v1/progress/users/:userId

// Missions
GET /api/v1/gamification/missions/active

// Modules
GET /api/v1/educational/modules
GET /api/v1/educational/modules/:classroomId/assigned

// Activities
GET /api/v1/progress/users/:userId/recent-activities
```

### 3.2 Módulos Educativos

**Ruta:** `/modules/:moduleId`

**Propósito:** Vista detallada de un módulo con sus ejercicios, progreso y recomendaciones.

**Estructura de Módulo:**

- **Módulo 1:** Comprensión Literal
- **Módulo 2:** Comprensión Inferencial
- **Módulo 3:** Comprensión Crítica
- **Módulo 4:** Textos Digitales y Multimediales

**Componentes:**

- **ModuleHeader:** Título, descripción, progreso general
- **ExercisesList:** Lista de ejercicios con estado (locked, available, in_progress, completed)
- **ProgressChart:** Gráfico de progreso por competencia
- **RecommendedExercises:** Ejercicios sugeridos según desempeño

**APIs:**

```typescript
GET /api/v1/educational/modules/:moduleId
GET /api/v1/educational/modules/:moduleId/exercises
GET /api/v1/progress/modules/:moduleId/progress
```

### 3.3 Ejercicios Interactivos (ExercisePage)

**Ruta:** `/exercises/:exerciseId`

**Propósito:** Interfaz para completar ejercicios con mecánicas interactivas variadas.

**Mecánicas Implementadas (por módulo):**

#### Módulo 1 - Comprensión Literal
- `crucigrama` - Crucigrama científico
- `timeline` / `linea_tiempo` - Línea de tiempo
- `sopa_letras` - Sopa de letras
- `mapa_conceptual` - Mapa conceptual
- `emparejamiento` - Emparejamiento
- `verdadero_falso` - Verdadero/Falso
- `completar_espacios` - Completar espacios en blanco

#### Módulo 2 - Comprensión Inferencial
- `detective_textual` - Detective textual
- `lectura_inferencial` - Lectura inferencial
- `construccion_hipotesis` - Construcción de hipótesis
- `prediccion_narrativa` - Predicción narrativa
- `puzzle_contexto` - Puzzle de contexto
- `rueda_inferencias` - Rueda de inferencias

#### Módulo 3 - Comprensión Crítica (evaluado por maestro)
- `analisis_fuentes` - Análisis de fuentes (evaluación de credibilidad con justificación escrita)
- `debate_digital` - Debate digital (ensayo estructurado con postura y argumentos, sin IA)
- `matriz_perspectivas` - Matriz de perspectivas (perspectivas pre-cargadas, alumno redacta análisis)
- `podcast_argumentativo` - Podcast argumentativo (grabación + transcripción, revisión manual)
- `tribunal_opiniones` - Tribunal de opiniones (veredicto escrito con justificación)

> **Nota M3:** Todos los ejercicios de Módulo 3 requieren revisión manual del maestro. No hay auto-scoring ni interacción con IA. El estudiante envía sus respuestas y recibe calificación cuando el maestro revisa.

#### Módulo 4 - Textos Digitales (evaluado por maestro)
- `verificador_fakenews` - Verificador de fake news (análisis escrito de artículos, sin auto-score)
- `quiz_tiktok` - Quiz TikTok (selección + justificación escrita obligatoria, revisión manual)
- `navegacion_hipertextual` - Navegación hipertextual (exploración + sección de reflexión escrita)
- `analisis_memes` - Análisis de memes (análisis textual de elementos visuales)
- `infografia_interactiva` - Infografía interactiva (exploración + reflexión escrita)

> **Nota M4:** Todos los ejercicios de Módulo 4 requieren revisión manual del maestro. No hay auto-scoring ni interacción con IA. Las mecánicas incluyen justificaciones y reflexiones escritas que el maestro evalúa.

**Componentes de Ejercicio:**

```typescript
// Layout principal
<div className="exercise-page">
  <ExerciseHeader
    title={exercise.title}
    difficulty={exercise.difficulty}
    points={exercise.points}
  />

  <div className="exercise-container">
    <ExerciseSidebar>
      <TimerWidget />
      <ScoreDisplay score={progress.score} />
      <ProgressTracker current={step} total={totalSteps} />
      <HintSystem hints={hints} onUseHint={handleHint} />
    </ExerciseSidebar>

    <Suspense fallback={<Loader />}>
      <DynamicMechanic
        mechanicType={exercise.type}
        data={exercise.mechanicData}
        onProgressUpdate={handleProgress}
        onSubmit={handleSubmit}
      />
    </Suspense>
  </div>

  <PowerUpBar powerUps={activePowerUps} />

  <FeedbackModal
    isOpen={showFeedback}
    feedback={feedbackData}
    onClose={handleCloseFeedback}
  />
</div>
```

**Flujo de Ejercicio:**

1. **Carga:** GET `/api/v1/educational/exercises/:exerciseId`
2. **Auto-save:** POST `/api/v1/progress/exercises/:exerciseId/save` (cada 30s)
3. **Uso de Hint:** POST `/api/v1/progress/exercises/:exerciseId/use-hint`
4. **Uso de Power-up:** POST `/api/v1/gamification/comodines/use`
5. **Envío:** POST `/api/v1/progress/exercises/:exerciseId/submit`
6. **Feedback:**
   - **M1-M2 (auto-grade):** Recibe calificación inmediata, XP ganado, ML Coins, achievements desbloqueados
   - **M3-M5 (teacher-grade):** Submission queda en estado `pending_review`. El estudiante ve confirmación de envío. XP, ML Coins y calificación se otorgan cuando el maestro completa la revisión manual

**Hooks:**

```typescript
// Exercise state management
const { exerciseState, updateProgress } = useExerciseState(exerciseId);

// Auto-save every 30s
useExerciseAutoSave(exerciseId, exerciseState, {
  interval: 30000,
  enabled: !exerciseState.completed,
});

// Power-ups activation
const { activePowerUps, usePowerUp } = useExercisePowerUps();
```

**APIs:**

```typescript
GET  /api/v1/educational/exercises/:exerciseId
GET  /api/v1/educational/exercises/:exerciseId/hints
POST /api/v1/progress/exercises/:exerciseId/save
POST /api/v1/progress/exercises/:exerciseId/submit
POST /api/v1/gamification/comodines/use
```

### 3.4 Sistema de Gamificación

**Ruta:** `/gamification`

**Propósito:** Hub central de gamificación con ranks, achievements, economy y stats.

**Secciones:**

#### 3.4.1 Ranks Maya System

**Jerarquía de Rangos:**

| Rango | Icono | XP Min | Multiplicador |
|-------|-------|--------|---------------|
| Ajaw (Senor) | 🏹 | 0 | 1.00x |
| Nacom (Capitan de Guerra) | 🔍 | 500 | 1.10x |
| Ah K'in (Sacerdote del Sol) | 🗡️ | 1,000 | 1.15x |
| Halach Uinic (Hombre Verdadero) | ⚔️ | 1,500 | 1.20x |
| K'uk'ulkan (Serpiente Emplumada) | 👑 | 1,900 | 1.25x |

**Componentes:**

```typescript
<RankBadgeAdvanced
  rank={userProgress.currentRank}
  prestigeLevel={userProgress.prestigeLevel}
  showGlow={true}
  animated={true}
/>

<RankProgressBar
  currentXP={userProgress.xp}
  requiredXP={userProgress.nextRankXP}
  currentRank={userProgress.currentRank}
  nextRank={userProgress.nextRank}
/>

<MultiplierWidget
  multiplier={multiplierBreakdown.total}
  breakdown={multiplierBreakdown}
/>

<ProgressTimeline
  progressionHistory={progressionHistory}
/>

<PrestigeSystem
  prestigeProgress={prestigeProgress}
  onPrestige={handlePrestige}
/>
```

**APIs:**

```typescript
GET  /api/v1/gamification/ranks/current
GET  /api/v1/gamification/ranks/users/:userId/rank-progress
GET  /api/v1/gamification/ranks/users/:userId/history
POST /api/v1/gamification/ranks/users/:userId/prestige
```

#### 3.4.2 ML Coins Economy

**Fuentes de Ingresos:**
- Completar ejercicios: 10-100 ML Coins (según dificultad y score)
- Completar misiones: 50-500 ML Coins
- Desbloquear achievements: 20-200 ML Coins
- Bonificaciones del teacher: Variable
- Daily login bonus: 10 ML Coins

**Gastos:**
- Power-ups (comodines): 50-200 ML Coins
- Items cosméticos: 100-1,000 ML Coins
- Profile customizations: 50-500 ML Coins

**Componentes:**

```typescript
<CoinBalanceWidget
  balance={balance.current}
  todayEarned={balance.earnedToday}
  todaySpent={balance.spentToday}
/>

<TransactionHistory
  transactions={transactions}
  limit={10}
/>

<EarningSourcesBreakdown
  sources={earningSources}
/>

<SpendingAnalytics
  data={spendingData}
  period="week"
/>
```

**APIs:**

```typescript
GET  /api/v1/gamification/users/:userId/ml-coins
GET  /api/v1/gamification/users/:userId/ml-coins/transactions
POST /api/v1/gamification/users/:userId/ml-coins/add
POST /api/v1/gamification/users/:userId/ml-coins/deduct
```

#### 3.4.3 Achievements System

**Categorías:**

- **Progress:** Completar módulos, ejercicios
- **Mastery:** Puntuaciones perfectas, rachas
- **Social:** Amigos, guild, colaboración
- **Explorer:** Descubrir contenido, probar mecánicas
- **Economy:** Gastar ML Coins, comprar items
- **Special:** Eventos, logros únicos

**Rarities:**

- Common (Común) - Gris
- Rare (Raro) - Azul
- Epic (Épico) - Morado
- Legendary (Legendario) - Dorado

**Componentes:**

```typescript
<AchievementGrid
  achievements={achievements}
  filters={filters}
  sort={sortBy}
/>

<AchievementDetailModal
  achievement={selectedAchievement}
  isOpen={showModal}
  onClose={closeModal}
/>

<AchievementStatistics
  stats={achievementStats}
/>

// Toast cuando se desbloquea
<AchievementToast
  achievement={unlockedAchievement}
  onClose={handleCloseToast}
/>
```

**APIs:**

```typescript
GET  /api/v1/gamification/achievements
GET  /api/v1/gamification/users/:userId/achievements
GET  /api/v1/gamification/achievements/:achievementId
POST /api/v1/gamification/users/:userId/achievements/:achievementId/claim
```

#### 3.4.4 Missions System

**Tipos de Misiones:**

- **Daily:** Reseteables cada día (ej: "Completa 3 ejercicios")
- **Weekly:** Reseteables cada semana (ej: "Completa 1 módulo")
- **Seasonal:** Eventos especiales (ej: "Participa en Halloween Challenge")
- **Progressive:** Una sola vez (ej: "Alcanza Rank Nacom")

**Dificultades:**

- Easy: 50 XP, 20 ML Coins
- Medium: 100 XP, 50 ML Coins
- Hard: 200 XP, 100 ML Coins

**Componentes:**

```typescript
<MissionCard
  mission={mission}
  onCardClick={handleCardClick}   // Abre MissionDetailModal
  onStart={handleStartMission}
  onClaim={handleClaimReward}
  onGoToExercise={handleGoToExercise}  // Navega via exercise_id
/>

<MissionDetailModal              // NUEVO v2.1.0
  mission={selectedMission}
  isOpen={!!selectedMission}
  onClose={() => setSelectedMission(null)}
  onStart={handleStartMission}
  onClaim={handleClaimReward}
  onGoToExercise={handleGoToExercise}
/>

// Mejoras v2.1.0:
// - exercise_id: vincula misiones a ejercicios específicos (FK missions.exercise_id)
// - Auto-start: daily/weekly se crean como in_progress (no requieren "Iniciar")
// - MissionDetailModal: descripción completa, progreso por objetivo, timer
```

**APIs:**

```typescript
GET  /api/v1/gamification/missions/active
GET  /api/v1/gamification/missions/completed
POST /api/v1/gamification/missions/:missionId/claim
```

### 3.5 Tienda (ShopPage)

**Ruta:** `/shop`

**Propósito:** Compra de power-ups, comodines y items cosméticos con ML Coins.

**Categorías:**

1. **Power-ups** (Premium) - ✅ IMPLEMENTADO
   - Hint Revealer (50 ML Coins) - Revela una pista gratis
   - Time Freeze (100 ML Coins) - Pausa el timer 60s
   - XP Boost (150 ML Coins) - +50% XP por 1 hora
   - Score Multiplier (200 ML Coins) - +2x score en próximo ejercicio

2. **Cosmetics** - ❌ NO IMPLEMENTADO
   - Avatares
   - Marcos de perfil
   - Badges decorativos

3. **Profile** - ❌ NO IMPLEMENTADO
   - Títulos
   - Efectos de partículas
   - Temas de color

**Componentes:**

```typescript
<ShopGrid
  items={shopItems}
  category={selectedCategory}
  onPurchase={handlePurchase}
/>

<ShopItem
  item={item}
  balance={userBalance}
  isOwned={item.isOwned}
  onBuy={handleBuy}
/>

<PurchaseConfirmationModal
  item={selectedItem}
  balance={userBalance}
  onConfirm={confirmPurchase}
  onCancel={cancelPurchase}
/>
```

**APIs:**

```typescript
GET  /api/v1/gamification/shop/items
GET  /api/v1/gamification/shop/power-ups
POST /api/v1/gamification/shop/purchase
GET  /api/v1/gamification/users/:userId/inventory
```

### 3.6 Leaderboard

**Ruta:** `/leaderboard`

**Propósito:** Rankings globales y por classroom para competencia sana.

**Tipos de Rankings:**

1. **Global XP:** Top 100 usuarios por XP total
2. **Weekly XP:** Top 50 usuarios por XP de esta semana
3. **Classroom:** Top estudiantes del aula
4. **Streak Leaders:** Top rachas activas
5. **ML Coins:** Top por balance de ML Coins

**Componentes:**

```typescript
<LeaderboardTabs
  tabs={['Global', 'Weekly', 'Classroom', 'Streaks']}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

<LeaderboardTable
  entries={leaderboardEntries}
  currentUserId={user.id}
  highlightCurrentUser={true}
/>

<UserRankCard
  rank={userRank}
  xp={userXP}
  position={userPosition}
/>
```

**APIs:**

```typescript
GET /api/v1/gamification/leaderboard/global
GET /api/v1/gamification/leaderboard/weekly
GET /api/v1/gamification/leaderboard/classroom/:classroomId
GET /api/v1/gamification/leaderboard/streaks
GET /api/v1/gamification/leaderboard/user-position/:userId
```

### 3.7 Perfil de Usuario

**Ruta:** `/profile`

**Propósito:** Visualizar y editar perfil personal, estadísticas y configuración.

**Secciones:**

1. **Profile Header**
   - Avatar
   - Username
   - Rank actual con icono
   - Titles (si tiene)

2. **Stats Overview**
   - Total XP
   - ML Coins balance
   - Achievements desbloqueados
   - Módulos completados
   - Racha actual

3. **Recent Achievements**
   - Últimos 5 logros desbloqueados

4. **Activity Graph**
   - Actividad de los últimos 30 días

5. **Edit Profile**
   - Cambiar avatar
   - Cambiar username
   - Bio

**APIs:**

```typescript
GET   /api/v1/auth/users/:userId/profile
PATCH /api/v1/auth/users/:userId/profile
GET   /api/v1/progress/users/:userId/stats
GET   /api/v1/gamification/users/:userId/activity-graph
```

---

## 4. Navegación

### 4.1 BottomNavigation (Móvil)

**Componente:** `BottomNavigation.tsx`

**Ubicación:** Fixed bottom en mobile (< 768px)

**Tabs:**

| ID | Label | Icon | Path | Descripción |
|----|-------|------|------|-------------|
| home | Home | Home | `/` | Dashboard principal |
| learning | Aprender | BookOpen | `/learning` | Hub de módulos educativos |
| achievements | Logros | Trophy | `/achievements` | Logros y gamificación |
| notifications | Alerts | Bell | `/notifications` | Centro de notificaciones |
| profile | Profile | User | `/profile` | Perfil de usuario |
| settings | Settings | Settings | `/settings` | Configuración |

**Features:**

- **Active indicator:** Tab activo resaltado con color detective-orange
- **Notification badge:** Badge rojo en Bell si hay notificaciones sin leer
- **Smooth animations:** Framer Motion para transiciones
- **Accessibility:** ARIA labels y roles correctos

```typescript
<BottomNavigation />

// Detecta pathname y resalta tab activo
const isActive = (path: string) => {
  if (path === '/') return location.pathname === '/';
  return location.pathname.startsWith(path);
};

// Muestra badge de notificaciones
{item.id === 'notifications' && unreadCount > 0 && (
  <Badge count={unreadCount} />
)}
```

### 4.2 Desktop Navigation

**Componente:** `GamifiedHeader`

**Features:**

- Logo GAMILIT
- ML Coins balance widget
- Rank badge
- Notifications dropdown
- User menu (perfil, settings, logout)

---

## 5. Hooks Principales

### 5.1 useDashboardData

**Propósito:** Fetches aggregated dashboard data con React Query.

**Endpoints llamados (en paralelo):**

```typescript
GET /api/v1/gamification/users/:userId/ml-coins
GET /api/v1/gamification/ranks/current
GET /api/v1/gamification/ranks/users/:userId/rank-progress
GET /api/v1/gamification/users/:userId/achievements
GET /api/v1/progress/users/:userId
```

**Return value:**

```typescript
{
  coins: MLCoinsData | null,
  rank: RankData | null,
  achievements: AchievementData[],
  progress: ProgressData | null,
  recentAchievements: AchievementData[],
  loading: boolean,
  error: string | null,
  isRefreshing: boolean,
  refresh: () => Promise<void>
}
```

**Configuración React Query:**

- **staleTime:** 5 minutos
- **gcTime:** 10 minutos
- **refetchOnWindowFocus:** true
- **retry:** 2 veces con backoff exponencial

### 5.2 useUserModules

**Propósito:** Fetches módulos educativos del usuario, opcionalmente filtrados por classroom.

**API:**

```typescript
GET /api/v1/educational/modules
GET /api/v1/educational/modules/:classroomId/assigned
```

**Return value:**

```typescript
{
  modules: Module[],
  loading: boolean,
  error: string | null
}
```

### 5.3 useExerciseState

**Propósito:** Gestiona estado local de ejercicio en progreso.

**State:**

```typescript
{
  currentStep: number,
  totalSteps: number,
  score: number,
  answers: Record<string, any>,
  hintsUsed: number,
  timeSpent: number,
  powerupsUsed: string[],
  completed: boolean
}
```

**Métodos:**

- `updateProgress(progress: Partial<ExerciseProgress>)`
- `submitExercise()`
- `resetExercise()`

### 5.4 useExerciseAutoSave

**Propósito:** Auto-save de progreso cada 30s mientras ejercicio no completado.

**API:**

```typescript
POST /api/v1/progress/exercises/:exerciseId/save
{
  progress: ExerciseProgress,
  answers: any
}
```

**Configuración:**

```typescript
useExerciseAutoSave(exerciseId, exerciseState, {
  interval: 30000, // 30 segundos
  enabled: !exerciseState.completed,
});
```

### 5.5 useExercisePowerUps

**Propósito:** Gestión de power-ups activos durante ejercicio.

**API:**

```typescript
POST /api/v1/gamification/comodines/use
{
  comodinId: string,
  exerciseId: string
}
```

**Métodos:**

- `usePowerUp(powerUpId: string)`
- `getActivePowerUps()`
- `checkPowerUpActive(type: string)`

---

## 6. APIs del Portal Student

### 6.1 Endpoints Principales

| Módulo | Método | Endpoint | Descripción | Guard |
|--------|--------|----------|-------------|-------|
| **Progress** |
| | GET | `/progress/users/:userId` | Progreso general del usuario | JwtAuth |
| | GET | `/progress/users/:userId/recent-activities` | Últimas actividades | JwtAuth |
| | GET | `/progress/modules/:moduleId/progress` | Progreso en módulo | JwtAuth |
| | POST | `/progress/exercises/:exerciseId/save` | Auto-save de ejercicio | JwtAuth |
| | POST | `/progress/exercises/:exerciseId/submit` | Enviar ejercicio completo | JwtAuth |
| **Gamification** |
| | GET | `/gamification/users/:userId/ml-coins` | Balance de ML Coins | JwtAuth |
| | GET | `/gamification/users/:userId/ml-coins/transactions` | Historial de transacciones | JwtAuth |
| | GET | `/gamification/ranks/current` | Ranks disponibles | JwtAuth |
| | GET | `/gamification/ranks/users/:userId/rank-progress` | Progreso de rank | JwtAuth |
| | GET | `/gamification/achievements` | Todos los achievements | JwtAuth |
| | GET | `/gamification/users/:userId/achievements` | Achievements del usuario | JwtAuth |
| | GET | `/gamification/missions/active` | Misiones activas | JwtAuth |
| | POST | `/gamification/missions/:missionId/claim` | Reclamar recompensa | JwtAuth |
| | GET | `/gamification/leaderboard/global` | Ranking global | JwtAuth |
| | GET | `/gamification/leaderboard/classroom/:id` | Ranking del aula | JwtAuth |
| | GET | `/gamification/shop/items` | Items de la tienda | JwtAuth |
| | POST | `/gamification/shop/purchase` | Comprar item | JwtAuth |
| | POST | `/gamification/comodines/use` | Usar power-up | JwtAuth |
| **Educational** |
| | GET | `/educational/modules` | Lista de módulos | JwtAuth |
| | GET | `/educational/modules/:id` | Detalle de módulo | JwtAuth |
| | GET | `/educational/modules/:id/exercises` | Ejercicios del módulo | JwtAuth |
| | GET | `/educational/exercises/:id` | Detalle de ejercicio | JwtAuth |
| | GET | `/educational/exercises/:id/hints` | Pistas disponibles | JwtAuth |
| **Social** |
| | GET | `/social/friendships` | Lista de amigos | JwtAuth |
| | POST | `/social/friendships` | Enviar solicitud de amistad | JwtAuth |
| | GET | `/social/teams/:id` | Detalle de guild | JwtAuth |

### 6.2 Frontend API Services

```
services/api/
├── educationalAPI.ts          # Módulos y ejercicios
├── progressAPI.ts             # Progreso y submissions
├── gamificationAPI.ts         # Gamificación general (incluye misiones, REC-003)
├── ranksAPI.ts                # Sistema de ranks
├── achievementsAPI.ts         # Achievements
├── economyAPI.ts              # ML Coins y shop
├── socialAPI.ts               # Amigos, guilds, leaderboard
└── apiClient.ts               # Axios instance configurado

> **Nota:** `missionsAPI.ts` fue eliminado en REC-003 (2026-02-18). Las misiones se consumen
> ahora via `gamificationAPI.ts` y el hook `useMissions`.
```

---

## 7. Estado y Stores (Zustand)

### 7.1 Stores Principales

```typescript
// Auth Store
authStore:
  - user: User | null
  - isAuthenticated: boolean
  - login()
  - logout()
  - register()

// Ranks Store
ranksStore:
  - userProgress: UserRankProgress
  - multiplierBreakdown: MultiplierData
  - prestigeProgress: PrestigeData
  - progressionHistory: ProgressEvent[]
  - fetchUserProgress()
  - showRankUpModal: boolean
  - closeRankUpModal()

// Economy Store
economyStore:
  - balance: MLCoinsBalance
  - transactions: Transaction[]
  - fetchBalance()
  - addTransaction()

// Achievements Store
achievementsStore:
  - achievements: Achievement[]
  - userAchievements: UserAchievement[]
  - stats: AchievementStats
  - fetchAchievements()
  - claimAchievement()

// Notifications Store
notificationsStore:
  - notifications: Notification[]
  - unreadCount: number
  - fetchNotifications()
  - markAsRead()
  - fetchUnreadCount()
```

---

## 8. Flujos Principales

### 8.1 Flujo: Completar Ejercicio

```
1. Student navega a /exercises/:exerciseId
   ↓
2. ExercisePage carga ejercicio: GET /educational/exercises/:exerciseId
   ↓
3. useExerciseState inicializa estado local
   ↓
4. useExerciseAutoSave inicia (cada 30s):
   POST /progress/exercises/:exerciseId/save
   ↓
5. Student completa ejercicio y presiona "Submit"
   ↓
6. POST /progress/exercises/:exerciseId/submit
   {
     answers: {...},
     timeSpent: 180,
     hintsUsed: 1,
     powerupsUsed: ['hint_revealer']
   }
   ↓
7. Backend procesa submission:
   - **M1-M2 (auto-grade):** Calcula score, XP ganado, ML Coins automaticamente
   - **M3-M5 (teacher-grade):** Guarda submission con status=pending_review, NO calcula score
   ↓
8. Response:
   M1-M2:
   {
     score: 85,
     maxScore: 100,
     xpEarned: 120,
     mlCoinsEarned: 50,
     achievements: ['first_completion'],
     feedback: {...}
   }
   M3-M5:
   {
     status: 'pending_review',
     message: 'Tu trabajo fue enviado. El maestro lo revisara pronto.'
   }
   ↓
9. FeedbackModal muestra resultados (M1-M2) o confirmacion de envio (M3-M5)
   ↓
10. Si achievement desbloqueado → AchievementToast (solo M1-M2 inmediato)
   ↓
11. Si rank up → RankUpModal (solo M1-M2 inmediato)
   ↓
12. Redirect a /modules o /dashboard
```

### 8.2 Flujo: Ganar XP y Subir de Rango

```
1. Student completa ejercicio → Gana XP (ej: 120 XP)
   ↓
2. Backend actualiza user_stats.total_xp
   ↓
3. Backend verifica si XP >= siguiente rank:
   SELECT * FROM gamification_system.maya_ranks
   WHERE xp_required <= :totalXP
   ORDER BY xp_required DESC LIMIT 1
   ↓
4. Si cambió rank:
   - Actualizar user_rank.current_rank
   - Crear entry en rank_progression_history
   - Crear achievement 'rank_up_{rankName}'
   ↓
5. Response incluye:
   {
     rankUp: true,
     newRank: 'Nacom',
     newMultiplier: 1.2,
     prestigePoints: 0
   }
   ↓
6. Frontend muestra RankUpModal con celebración
   ↓
7. ranksStore.fetchUserProgress() actualiza estado
```

### 8.3 Flujo: Comprar Item en Shop

```
1. Student navega a /shop
   ↓
2. GET /gamification/shop/items → Lista items disponibles
   ↓
3. Student selecciona item → Modal de confirmación
   ↓
4. Verificar balance suficiente
   ↓
5. POST /gamification/shop/purchase
   {
     itemId: 'hint_revealer',
     quantity: 1
   }
   ↓
6. Backend:
   - Verifica balance >= item.price
   - Deducir ML Coins
   - Agregar item a inventory
   - Crear transaction log
   ↓
7. Response:
   {
     success: true,
     newBalance: 450,
     item: {...}
   }
   ↓
8. Frontend:
   - economyStore.fetchBalance() (actualiza balance)
   - Toast: "Item comprado exitosamente"
   - Modal cierra
```

---

## 9. Sistema de Gamificación Detallado

### 9.1 Cálculo de XP

**Fórmula Base:**

```typescript
baseXP = exercise.points; // Ej: 100 XP

// Multiplicadores
scoreMultiplier = (score / maxScore); // Ej: 85/100 = 0.85
rankMultiplier = userRank.multiplier;  // Ej: 1.2x (Nacom)
streakBonus = min(currentStreak * 0.05, 0.5); // Max +50%

totalXP = baseXP * scoreMultiplier * rankMultiplier * (1 + streakBonus);

// Ejemplo:
// 100 XP * 0.85 * 1.2 * 1.15 = 117.3 XP → 117 XP
```

**Bonuses Adicionales:**

- **Perfect Score:** +20% XP si score = 100%
- **Speed Bonus:** +10% XP si completa en < 50% tiempo estimado
- **No Hints Used:** +15% XP si no usó pistas
- **First Try:** +25% XP si completa en primer intento

### 9.2 Cálculo de ML Coins

**Fórmula Base:**

```typescript
baseCoins = Math.floor(exercise.points / 10); // Ej: 100 XP → 10 ML Coins

// Multiplicadores
scoreMultiplier = (score / maxScore);
difficultyBonus = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0
}[exercise.difficulty];

totalCoins = baseCoins * scoreMultiplier * difficultyBonus;

// Ejemplo (hard, 85% score):
// 10 * 0.85 * 2.0 = 17 ML Coins
```

### 9.3 Sistema de Streaks

**Cómo funciona:**

- **Racha (Streak):** Días consecutivos con al menos 1 ejercicio completado
- **Zona horaria:** UTC-5 (Colombia)
- **Reset:** Si pasa 1 día completo sin actividad → streak = 0
- **Bonus XP:** +5% por cada día de racha (max +50% a 10 días)

**Guardado:**

```sql
-- En user_stats
current_streak: integer DEFAULT 0
longest_streak: integer DEFAULT 0
last_activity_date: date
```

**Lógica:**

```typescript
const today = new Date().toISOString().split('T')[0];
const lastActivity = user.lastActivityDate;

if (lastActivity === today) {
  // Mismo día, no cambiar streak
} else {
  const daysSince = daysBetween(lastActivity, today);

  if (daysSince === 1) {
    // Día consecutivo
    user.currentStreak++;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  } else {
    // Se rompió la racha
    user.currentStreak = 1;
  }

  user.lastActivityDate = today;
}
```

### 9.4 Achievements: Triggers y Lógica

**Ejemplos de Achievements:**

| ID | Nombre | Trigger | Condición | Recompensa |
|----|--------|---------|-----------|------------|
| first_steps | Primeros Pasos | exercise_completed | count === 1 | 20 XP, 10 ML Coins |
| speed_demon | Demonio de Velocidad | exercise_completed | timeSpent < estimatedTime * 0.5 | 50 XP, 25 ML Coins |
| perfectionist | Perfeccionista | exercise_completed | score === 100 && attempts === 1 | 100 XP, 50 ML Coins |
| rank_nacom | Ascenso a Nacom | rank_up | newRank === 'Nacom' | 200 XP, 100 ML Coins |
| module_master | Maestro de Módulo | module_completed | completionRate === 100% | 500 XP, 200 ML Coins |
| streak_warrior | Guerrero Constante | daily_activity | currentStreak === 7 | 150 XP, 75 ML Coins |
| coin_collector | Coleccionista | ml_coins_earned | totalCoinsEarned >= 1000 | 100 XP, 50 ML Coins |

**Backend Logic:**

```typescript
// En exercise-submission.service.ts
async checkAchievements(userId: string, context: AchievementContext) {
  const triggers = await this.achievementsRepo.find({
    where: { trigger: context.trigger }
  });

  for (const achievement of triggers) {
    const meetsCondition = await this.evaluateCondition(
      achievement.condition,
      userId,
      context
    );

    if (meetsCondition) {
      await this.unlockAchievement(userId, achievement.id);
    }
  }
}
```

---

## 10. Responsive Design

### 10.1 Breakpoints

```typescript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### 10.2 Layout Adaptations

**Mobile (< 768px):**
- BottomNavigation visible
- Single column layouts
- Swipeable carousels
- Collapsible sections
- Touch-optimized controls (min 44x44px)

**Tablet (768px - 1024px):**
- BottomNavigation hidden
- GamifiedHeader expanded
- 2-column grids
- Sidebars overlay

**Desktop (> 1024px):**
- Full navigation
- 3-4 column grids
- Persistent sidebars
- Hover states

**Hook:**

```typescript
const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

// Usage
{isMobile && <MobileView />}
{isDesktop && <DesktopSidebar />}
```

---

## 11. Buenas Prácticas

### 11.1 Frontend

#### 11.1.1 React Query

```typescript
// DO: Query keys descriptivas y jerárquicas
queryKey: ['dashboard', userId, 'coins']
queryKey: ['modules', moduleId, 'exercises']

// DO: Usar staleTime para reducir re-fetches
staleTime: 5 * 60 * 1000, // 5 min

// DO: Invalidar queries relacionadas después de mutations
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['gamification', 'coins'] });
}

// DON'T: Queries sin enabled cuando dependen de parámetros
enabled: !!userId, // SIEMPRE verificar
```

#### 11.1.2 State Management

```typescript
// DO: Zustand para global state, React Query para server state
// Global UI state → Zustand
// Server data → React Query

// DO: Hooks para lógica reutilizable
export function useDashboardData() { ... }

// DON'T: Props drilling más de 2 niveles
// Usar context o store
```

#### 11.1.3 Performance

```typescript
// DO: Lazy load de mecánicas
const DynamicMechanic = React.lazy(() =>
  import(`@/features/mechanics/${mechanicType}`)
);

// DO: Memoizar cálculos pesados
const expNeeded = useMemo(() =>
  calculateNextRankXP(currentRank),
  [currentRank]
);

// DO: Debounce en búsquedas
const debouncedSearch = useDebounce(searchQuery, 300);
```

### 11.2 Backend

#### 11.2.1 Controllers

```typescript
// DO: DTOs con validación completa
@Post('submit')
@ApiOperation({ summary: 'Submit exercise completion' })
@ApiOkResponse({ type: SubmissionResultDto })
async submitExercise(
  @CurrentUser() user: User,
  @Param('exerciseId') exerciseId: string,
  @Body() dto: SubmitExerciseDto,
): Promise<SubmissionResultDto> {
  return this.submissionService.submitExercise(user.id, exerciseId, dto);
}
```

#### 11.2.2 Services

```typescript
// DO: Transactions para operaciones atómicas
async submitExercise(userId: string, dto: SubmitExerciseDto) {
  return this.dataSource.transaction(async (manager) => {
    // 1. Crear submission
    const submission = await manager.save(ExerciseSubmission, {...});

    // 2. Actualizar progreso
    await manager.update(ModuleProgress, {...});

    // 3. Otorgar XP y ML Coins
    await this.grantRewards(userId, submission, manager);

    // 4. Check achievements
    await this.checkAchievements(userId, submission, manager);

    return submission;
  });
}
```

#### 11.2.3 Optimización

```typescript
// DO: Eager loading para evitar N+1 queries
const exercises = await this.exercisesRepo.find({
  where: { module_id: moduleId },
  relations: ['module', 'submissions'],
});

// DO: Cache para datos que cambian poco
@Cacheable('ranks', 3600) // 1 hora
async getRanks(): Promise<Rank[]> {
  return this.ranksRepo.find();
}
```

---

## 12. Testing

### 12.1 Tests Unitarios Frontend

```typescript
// useDashboardData.test.ts
describe('useDashboardData', () => {
  it('should fetch dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rank).toBeDefined();
    expect(result.current.coins).toBeDefined();
  });
});
```

### 12.2 Tests de Integración

```typescript
// ExerciseSubmission.integration.test.ts
describe('Exercise Submission Flow', () => {
  it('should complete exercise and grant rewards', async () => {
    const user = await createTestUser();
    const exercise = await createTestExercise();

    const response = await request(app.getHttpServer())
      .post(`/progress/exercises/${exercise.id}/submit`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        answers: { q1: 'correct' },
        timeSpent: 120,
        hintsUsed: 0,
      })
      .expect(201);

    expect(response.body.xpEarned).toBeGreaterThan(0);
    expect(response.body.mlCoinsEarned).toBeGreaterThan(0);
  });
});
```

---

## 13. Checklist de Desarrollo

### 13.1 Nueva Funcionalidad

- [ ] Definir types en `student/types/` o `@shared/types`
- [ ] Crear/actualizar DTOs en backend
- [ ] Implementar service en backend
- [ ] Crear/modificar controller con guards
- [ ] Agregar validaciones (class-validator)
- [ ] Crear API service en frontend
- [ ] Implementar custom hook si necesario
- [ ] Crear componentes UI necesarios
- [ ] Integrar en página correspondiente
- [ ] Agregar tests unitarios
- [ ] Probar responsive (mobile, tablet, desktop)
- [ ] Documentar en Swagger (decoradores)
- [ ] Actualizar esta guía si aplica

### 13.2 Code Review

- [ ] Types alineados frontend/backend
- [ ] Guards aplicados correctamente (JwtAuth mínimo)
- [ ] Validación de DTOs completa
- [ ] Error handling implementado
- [ ] React Query keys descriptivas
- [ ] Invalidación de cache correcta después de mutations
- [ ] Loading y error states manejados
- [ ] Responsive design verificado
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimizado (memo, lazy load)

---

## 14. Troubleshooting

### 14.1 Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| 401 Unauthorized | Token JWT expirado/inválido | Renovar token con refresh endpoint |
| Data desactualizada | Cache no invalidado | `queryClient.invalidateQueries()` |
| Types mismatch | Desync FE/BE | Regenerar types desde DTOs backend |
| Exercise no se guarda | Auto-save disabled | Verificar `enabled` en `useExerciseAutoSave` |
| XP no se actualiza | Estado local no sincroniza | Llamar `refresh()` de `useDashboardData` |
| Achievements no se desbloquean | Condiciones no se cumplen | Verificar lógica en backend service |
| Power-up no aplica | Item no en inventory | Verificar inventario antes de usar |

### 14.2 Debugging

```typescript
// Habilitar logs de React Query en dev
if (import.meta.env.DEV) {
  import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
    // Montar devtools
  });
}

// Log de API calls
apiClient.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Log de state changes (Zustand)
devtools(storeImpl, { name: 'RanksStore' })
```

---

## 15. Performance y Optimización

### 15.1 Frontend Optimization

**Lazy Loading de Rutas:**

```typescript
const DashboardComplete = lazy(() => import('./pages/DashboardComplete'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<DashboardComplete />} />
    <Route path="/exercises/:id" element={<ExercisePage />} />
    <Route path="/gamification" element={<GamificationPage />} />
  </Routes>
</Suspense>
```

**Code Splitting:**

```typescript
// Dynamic imports for mechanics
const loadMechanic = (type: string) => {
  return import(`@/features/mechanics/${type}/${type}Exercise`);
};
```

**Image Optimization:**

- Usar WebP para imágenes modernas
- Lazy load de imágenes con `loading="lazy"`
- Sprites para iconos pequeños

### 15.2 Backend Optimization

**Database Indexing:**

```sql
-- Indices críticos
CREATE INDEX idx_exercise_submissions_user ON progress.exercise_submissions(user_id);
CREATE INDEX idx_user_stats_total_xp ON gamification_system.user_stats(total_xp DESC);
CREATE INDEX idx_achievements_trigger ON gamification_system.achievements(trigger);
```

**Query Optimization:**

```typescript
// Usar select específico en vez de SELECT *
const stats = await this.userStatsRepo.findOne({
  where: { user_id: userId },
  select: ['total_xp', 'total_ml_coins', 'current_streak'],
});
```

**Caching:**

- Redis para leaderboards (TTL 5 min)
- Cache de ranks/achievements (TTL 1 hora)
- Invalidación al actualizar datos

---

## 16. Seguridad

### 16.1 Autenticación y Autorización

**Guards:**

- **JwtAuthGuard:** TODOS los endpoints (excepto public)
- **RolesGuard:** Si endpoint específico para rol

**Validación de Ownership:**

```typescript
// Verificar que submission pertenece al usuario
const submission = await this.submissionRepo.findOne({
  where: {
    id: submissionId,
    user_id: userId // CRÍTICO
  }
});

if (!submission) {
  throw new ForbiddenException('Not your submission');
}
```

### 16.2 Validación de Datos

```typescript
// DTOs con class-validator
export class SubmitExerciseDto {
  @IsObject()
  @ValidateNested()
  answers!: Record<string, any>;

  @IsNumber()
  @Min(0)
  @Max(7200) // Max 2 horas
  timeSpent!: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  hintsUsed!: number;
}
```

### 16.3 Rate Limiting

```typescript
// Exercise submission: max 100/día por usuario
@ThrottlerGuard({ limit: 100, ttl: 86400 })
@Post('submit')
async submitExercise(...) { ... }
```

---

## 17. Referencias

### Documentos Complementarios del Portal Student

| Documento | Descripción |
|-----------|-------------|
| [SPEC-EXERCISES.md](./specs/SPEC-EXERCISES.md) | Referencia de ejercicios y mecánicas implementadas |
| [SPEC-GAMIFICATION.md](./specs/SPEC-GAMIFICATION.md) | Sistema de gamificación en profundidad |
| [SPEC-API-CONTRACTS.md](./specs/SPEC-API-CONTRACTS.md) | Referencia de contratos API del portal |
| [../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md](../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md) | Flujo end-to-end de ejercicio auto-grade |
| [../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md](../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md) | Flujo de ejercicio con revision manual |
| [../../30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md](../../30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md) | Flujo de compra y asignacion en tienda |
| [../../30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md](../../30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md) | Flujo de reclamo de recompensas |

### Guías Generales

- [COMPONENT-PATTERNS.md](../../50-guides/frontend/impl/COMPONENT-PATTERNS.md) - Patrones de componentes
- [HOOK-PATTERNS.md](../../50-guides/frontend/impl/HOOK-PATTERNS.md) - Patrones de hooks
- [ADR-013-react-query-adoption.md](../../90-adr/ADR-013-react-query-adoption.md) - Uso de React Query
- [README frontend impl](../../50-guides/frontend/impl/README.md) - Convenciones generales frontend
- [TYPES-CONVENTIONS.md](../../50-guides/frontend/impl/TYPES-CONVENTIONS.md) - Convenciones de types
- [DTO-CONVENTIONS.md](../../50-guides/backend/impl/DTO-CONVENTIONS.md) - Convenciones de DTOs
- [ESTRUCTURA-MODULOS.md](../../50-guides/backend/impl/ESTRUCTURA-MODULOS.md) - Estructura de módulos
- [40-api/README.md](../../40-api/README.md) - Rutas y contratos API

### Documentación de Arquitectura

- [ADR-001: Gamificacion Maya](../../90-adr/ADR-001-gamificacion-maya.md)
- [ADR-021: Estandarizacion Recompensas XP](../../90-adr/ADR-021-estandarizacion-recompensas-xp-ejercicios.md)
- [ADR-008: Sistema Dual Exercise Mechanics](../../90-adr/ADR-008-sistema-dual-exercise-mechanics.md)

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.2.0 | 2026-02-21 | M3-M5 evaluados exclusivamente por maestro: sin auto-scoring, sin IA. Debate Digital = ensayo estructurado, Quiz TikTok = justificaciones escritas, flujo de ejercicio diferenciado M1-M2 (auto-grade) vs M3-M5 (teacher-grade). Removed stale M4 mechanic listings (email_formal, chat_literario, ensayo_argumentativo, resena_critica) |
| 2.1.0 | 2026-02-21 | Mejoras sistema de misiones: exercise_id (FK a ejercicios), auto-start daily/weekly, MissionDetailModal, click-to-detail en MissionCard |
| 1.0.0 | 2025-11-29 | Creación inicial - Documentación completa del Portal Student |
| 2.0.0 | 2026-02-18 | Actualizado post Student Portal Refactoring Fases 0-4: nuevas carpetas de componentes (shop, inventory, module, profile, leaderboard, friends, guilds, learning), hooks actualizados (useProfileData, useAvatarUpdate), estructura de carpetas refleja extractiones Phase 2-4 |

---

**Mantenido por:** Tech Lead - GAMILIT Project
**Última revisión:** 2026-02-21
