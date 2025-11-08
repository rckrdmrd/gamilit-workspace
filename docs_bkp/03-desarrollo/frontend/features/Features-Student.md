# Features de Estudiante - GAMILIT Platform v2

**Rol:** Student
**Objetivo:** Experiencia de aprendizaje gamificada
**App:** `/src/apps/student/`

---

## Páginas Principales

### 1. Dashboard (`/dashboard`)

**Objetivo:** Vista principal con progreso y actividades

**Componentes destacados:**

```typescript
// apps/student/pages/dashboard/DashboardPage.tsx
export const DashboardPage: React.FC = () => {
  const { overallProgress } = useProgressStore();
  const { balance } = useEconomyStore();
  const { userProgress } = useRanksStore();

  return (
    <StudentLayout>
      <StatsOverview
        xp={userProgress.totalXP}
        mlCoins={balance.current}
        rank={userProgress.currentRank}
        streak={overallProgress.streak}
      />

      <ProgressChart progress={overallProgress} />
      <RecentActivity activities={recentActivities} />
      <DailyMissions missions={dailyMissions} />
    </StudentLayout>
  );
};

// apps/student/components/dashboard/StatsOverview.tsx
interface StatsOverviewProps {
  xp: number;
  mlCoins: number;
  rank: string;
  streak: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  xp, mlCoins, rank, streak
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard icon="Zap" label="XP" value={xp} />
    <StatCard icon="Coins" label="ML Coins" value={mlCoins} />
    <StatCard icon="Award" label="Rango" value={rank} />
    <StatCard icon="Flame" label="Racha" value={`${streak} días`} />
  </div>
);
```

**Hooks especializados:**
- `useDashboardData()` - Datos agregados del dashboard
- `useRecentActivities()` - Actividades recientes
- `useUserStats()` - Estadísticas del usuario

---

### 2. Vista de Aprendizaje (`/learning/:moduleId`)

**Objetivo:** Explorar y completar módulos educativos

**Componentes:**

```typescript
// apps/student/pages/learning/ModuleView.tsx
export const ModuleView: React.FC = () => {
  const { moduleId } = useParams();
  const { currentModule, fetchModuleById } = useModuleStore();
  const { moduleProgress } = useProgressStore();

  useEffect(() => {
    fetchModuleById(moduleId);
  }, [moduleId]);

  return (
    <StudentLayout>
      <ModuleHeader module={currentModule} />
      <ProgressTracker progress={moduleProgress[moduleId]} />
      <ExercisesList
        exercises={currentModule?.exercises}
        onExerciseClick={(exerciseId) => navigate(`/exercise/${exerciseId}`)}
      />
    </StudentLayout>
  );
};
```

---

### 3. Realización de Ejercicios (`/exercise/:exerciseId`)

**Objetivo:** Completar ejercicios y mecánicas educativas

**Flujo:**

```typescript
// apps/student/pages/exercise/ExercisePage.tsx
export const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams();
  const { exercise, updateAnswer, submitExercise, isSubmitting } =
    useExercise(exerciseId);

  const handleSubmit = async () => {
    const result = await submitExercise();
    // Mostrar modal de resultado
    showResultModal(result);
  };

  // Renderizar mecánica específica según tipo
  return (
    <StudentLayout>
      {renderExercise(exercise.type, {
        ...exercise,
        onAnswerChange: updateAnswer,
        onComplete: handleSubmit,
      })}
    </StudentLayout>
  );
};
```

---

### 4. Logros (`/achievements`)

**Objetivo:** Ver logros desbloqueados y progreso

**Componentes:**

```typescript
// apps/student/pages/achievements/AchievementsPage.tsx
export const AchievementsPage: React.FC = () => {
  const { achievements, fetchAchievements } = useAchievementsStore();

  const categories = ['learning', 'social', 'exploration', 'mastery', 'special'];

  return (
    <StudentLayout>
      <AchievementsHeader stats={achievementStats} />

      <Tabs>
        {categories.map(category => (
          <TabPanel key={category}>
            <AchievementsGrid
              achievements={achievements.filter(a => a.category === category)}
            />
          </TabPanel>
        ))}
      </Tabs>
    </StudentLayout>
  );
};
```

---

### 5. Tienda (`/shop`)

**Objetivo:** Comprar items con ML Coins

**Componentes:**

```typescript
// apps/student/pages/shop/ShopPage.tsx
export const ShopPage: React.FC = () => {
  const { balance, cart, addToCart, purchaseCart } = useEconomyStore();

  return (
    <StudentLayout>
      <ShopHeader balance={balance.current} />

      <ShopCategories>
        <ShopGrid items={shopItems} onAddToCart={addToCart} />
      </ShopCategories>

      <ShoppingCart
        items={cart}
        total={getCartTotal()}
        onPurchase={purchaseCart}
      />
    </StudentLayout>
  );
};
```

---

### 6. Rankings (`/leaderboard`)

**Objetivo:** Ver clasificación y posición

**Componentes:**

```typescript
// apps/student/pages/leaderboard/LeaderboardPage.tsx
export const LeaderboardPage: React.FC = () => {
  const { entries, userRank, fetchLeaderboard, filter } = useLeaderboardsStore();

  return (
    <StudentLayout>
      <LeaderboardFilters
        currentFilter={filter}
        onFilterChange={fetchLeaderboard}
      />

      <UserPosition rank={userRank} />

      <LeaderboardTable entries={entries} />
    </StudentLayout>
  );
};
```

---

### 7. Gremios (`/guilds`)

**Objetivo:** Unirse y participar en gremios

---

### 8. Perfil (`/profile`)

**Objetivo:** Ver y editar perfil personal

---

## Hooks Especializados

```typescript
// apps/student/hooks/useGamificationData.ts
export const useGamificationData = () => {
  const balance = useEconomyStore((state) => state.balance);
  const userProgress = useRanksStore((state) => state.userProgress);
  const achievements = useAchievementsStore((state) => state.achievements);

  return {
    mlCoins: balance.current,
    xp: userProgress.totalXP,
    level: userProgress.currentLevel,
    rank: userProgress.currentRank,
    achievementsUnlocked: achievements.filter(a => a.unlocked).length,
  };
};

// apps/student/hooks/useUserModules.ts
export const useUserModules = () => {
  const { modules, fetchModules } = useModuleStore();
  const { moduleProgress } = useProgressStore();

  useEffect(() => {
    fetchModules();
  }, []);

  return modules.map(module => ({
    ...module,
    progress: moduleProgress[module.id],
  }));
};
```

---

## Layouts

```typescript
// apps/student/layouts/StudentLayout.tsx
export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="student-layout">
      <StudentHeader />
      <StudentSidebar />
      <main className="student-main">{children}</main>
    </div>
  );
};
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
