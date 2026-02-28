---
title: Portal Student - Módulos y Navegación
status: activo
last_updated: "2026-02-28"
---

# Portal Student - Módulos y Navegación

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [01-ARQUITECTURA.md](./01-ARQUITECTURA.md) | Siguiente: [03-HOOKS-ESTADO.md](./03-HOOKS-ESTADO.md)

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

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [01-ARQUITECTURA.md](./01-ARQUITECTURA.md) | Siguiente: [03-HOOKS-ESTADO.md](./03-HOOKS-ESTADO.md)
