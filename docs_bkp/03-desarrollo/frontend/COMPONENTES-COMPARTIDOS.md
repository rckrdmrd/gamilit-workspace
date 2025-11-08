# Componentes Compartidos - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Total de Componentes:** 100+

---

## 1. Resumen Ejecutivo

El frontend de GAMILIT implementa una biblioteca de **componentes compartidos** organizados en capas siguiendo principios de **Atomic Design**. Los componentes son reutilizables, tipados y temáticos (Detective theme).

### Organización:

- **Base (UI Primitives):** 12+ componentes
- **Layout:** 7+ componentes
- **Mechanics:** 10+ componentes
- **Specialized:** 15+ componentes
- **Celebrations:** 5+ componentes

---

## 2. Estructura de Componentes

```
src/shared/components/
├── base/                    # UI Primitives (Atoms)
│   ├── DetectiveButton.tsx
│   ├── DetectiveCard.tsx
│   ├── InputDetective.tsx
│   ├── ProgressBar.tsx
│   ├── RankBadge.tsx
│   ├── StatusBadge.tsx
│   ├── Toast.tsx
│   ├── LoadingOverlay.tsx
│   ├── ColorfulCard.tsx
│   └── EnhancedCard.tsx
│
├── layout/                  # Layout Components
│   ├── GamifiedHeader.tsx
│   ├── GamilitSidebar.tsx
│   ├── DetectiveContainer.tsx
│   ├── DetectiveFooter.tsx
│   └── DetectiveGrid.tsx
│
├── mechanics/               # Exercise Components
│   ├── BaseExercise.tsx
│   ├── ExerciseHeader.tsx
│   ├── ExerciseFooter.tsx
│   ├── FeedbackModal.tsx
│   ├── ScoreDisplay.tsx
│   ├── HintPanel.tsx
│   └── TimerDisplay.tsx
│
├── specialized/             # Domain-Specific
│   ├── gamification/
│   ├── social/
│   └── educational/
│
├── celebrations/            # Feedback & Rewards
│   ├── Confetti.tsx
│   ├── LevelUpAnimation.tsx
│   └── RewardDisplay.tsx
│
└── common/                  # Utilities
    ├── Modal.tsx
    ├── Dropdown.tsx
    └── Tooltip.tsx
```

---

## 3. UI Primitives (Base)

### 3.1 DetectiveButton

**Props:**
```typescript
interface DetectiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

**Ejemplo:**
```tsx
<DetectiveButton
  variant="primary"
  size="lg"
  icon={<Search />}
  onClick={handleSearch}
>
  Buscar Pistas
</DetectiveButton>
```

### 3.2 DetectiveCard

**Props:**
```typescript
interface DetectiveCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gold' | 'orange';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Ejemplo:**
```tsx
<DetectiveCard
  title="Módulo 1"
  subtitle="Comprensión Literal"
  icon={<BookOpen />}
  variant="orange"
  hoverable
  onClick={() => navigate('/module/1')}
>
  <ProgressBar value={75} max={100} />
</DetectiveCard>
```

### 3.3 ProgressBar

**Props:**
```typescript
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'xp' | 'coins';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Ejemplo:**
```tsx
<ProgressBar
  value={currentXP}
  max={xpToNextLevel}
  showLabel
  label="XP"
  variant="xp"
  animated
/>
```

### 3.4 RankBadge

**Props:**
```typescript
interface RankBadgeProps {
  rank: MayaRank;
  showName?: boolean;
  showPrestige?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}
```

**Ejemplo:**
```tsx
<RankBadge
  rank="Ah K'in"
  showName
  showPrestige
  size="lg"
  animated
/>
```

---

## 4. Layout Components

### 4.1 GamifiedHeader

**Responsabilidad:** Header principal con stats del usuario

**Props:**
```typescript
interface GamifiedHeaderProps {
  user: User;
  xp: number;
  mlCoins: number;
  rank: MayaRank;
  notifications?: number;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
}
```

**Componente:**
```tsx
export const GamifiedHeader: React.FC<GamifiedHeaderProps> = ({
  user,
  xp,
  mlCoins,
  rank,
  notifications = 0,
}) => {
  return (
    <header className="gamified-header">
      <div className="header-left">
        <Logo />
        <h1>GAMILIT Platform</h1>
      </div>

      <div className="header-center">
        <StatBadge icon={<Zap />} value={xp} label="XP" />
        <StatBadge icon={<Coins />} value={mlCoins} label="ML" />
        <RankBadge rank={rank} size="md" />
      </div>

      <div className="header-right">
        <NotificationBell count={notifications} />
        <UserMenu user={user} />
      </div>
    </header>
  );
};
```

### 4.2 GamilitSidebar

**Responsabilidad:** Navegación lateral con menú

**Props:**
```typescript
interface GamilitSidebarProps {
  userRole: 'student' | 'admin_teacher' | 'super_admin';
  currentPath: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
}
```

**Menú por Rol:**
```typescript
const STUDENT_MENU = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Aprender', path: '/learning' },
  { icon: Trophy, label: 'Logros', path: '/achievements' },
  { icon: ShoppingBag, label: 'Tienda', path: '/shop' },
  { icon: Users, label: 'Social', path: '/social' },
];

const TEACHER_MENU = [
  { icon: Home, label: 'Dashboard', path: '/teacher/dashboard' },
  { icon: Eye, label: 'Monitoreo', path: '/teacher/monitoring' },
  { icon: ClipboardList, label: 'Tareas', path: '/teacher/assignments' },
  { icon: BarChart, label: 'Analytics', path: '/teacher/analytics' },
];
```

### 4.3 DetectiveContainer

**Responsabilidad:** Container responsive con padding

```tsx
export const DetectiveContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="detective-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
};
```

---

## 5. Mechanics Components

### 5.1 BaseExercise

**Responsabilidad:** Wrapper base para todas las mecánicas

```tsx
interface BaseExerciseProps {
  exerciseId: string;
  title: string;
  instructions: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  timeLimit?: number;
  allowHints?: boolean;
  onComplete: (result: ScoreResult) => void;
  children: React.ReactNode;
}
```

### 5.2 FeedbackModal

**Responsabilidad:** Modal de feedback con score

```tsx
interface FeedbackModalProps {
  isOpen: boolean;
  result: ScoreResult;
  onClose: () => void;
  showConfetti?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  result,
  onClose,
  showConfetti = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {showConfetti && result.grade === 'A+' && <Confetti />}

      <div className="feedback-content">
        <GradeDisplay grade={result.grade} />

        <ScoreBreakdown
          baseScore={result.baseScore}
          timeBonus={result.timeBonus}
          accuracyBonus={result.accuracyBonus}
          totalScore={result.totalScore}
        />

        <RewardsDisplay
          mlCoins={result.mlCoins}
          xpGained={result.xpGained}
        />

        <button onClick={onClose}>Continuar</button>
      </div>
    </Modal>
  );
};
```

### 5.3 HintPanel

**Responsabilidad:** Panel de pistas con contador

```tsx
interface HintPanelProps {
  hints: string[];
  maxHints?: number;
  hintsUsed: number;
  onRequestHint: () => void;
  cost?: number; // ML Coins
}
```

---

## 6. Specialized Components

### 6.1 Gamification Components

**EconomyDisplay:**
```tsx
<EconomyDisplay
  balance={balance}
  transactions={recentTransactions}
  compact
/>
```

**RankProgressCard:**
```tsx
<RankProgressCard
  currentRank={userProgress.currentRank}
  currentLevel={userProgress.currentLevel}
  currentXP={userProgress.currentXP}
  xpToNextLevel={userProgress.xpToNextLevel}
  multiplier={userProgress.multiplier}
/>
```

**MissionCard:**
```tsx
<MissionCard
  mission={mission}
  onClaim={handleClaim}
  showProgress
/>
```

### 6.2 Social Components

**AchievementCard:**
```tsx
<AchievementCard
  achievement={achievement}
  isUnlocked={achievement.isUnlocked}
  showProgress
  onClick={handleClick}
/>
```

**GuildCard:**
```tsx
<GuildCard
  guild={guild}
  isMember={isMember}
  onJoin={handleJoin}
  onLeave={handleLeave}
/>
```

**LeaderboardEntry:**
```tsx
<LeaderboardEntry
  entry={entry}
  position={entry.rank}
  isCurrentUser={entry.isCurrentUser}
/>
```

### 6.3 Educational Components

**ModuleCard:**
```tsx
<ModuleCard
  module={module}
  progress={progress}
  isLocked={module.is_locked}
  onClick={() => navigate(`/module/${module.id}`)}
/>
```

**ExerciseCard:**
```tsx
<ExerciseCard
  exercise={exercise}
  isCompleted={exercise.isCompleted}
  bestScore={exercise.bestScore}
  onClick={handleStart}
/>
```

---

## 7. Celebration Components

### 7.1 Confetti

```tsx
export const Confetti: React.FC = () => {
  useEffect(() => {
    const confetti = require('canvas-confetti');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return null;
};
```

### 7.2 LevelUpAnimation

```tsx
interface LevelUpAnimationProps {
  newLevel: number;
  onComplete: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  newLevel,
  onComplete,
}) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="level-up-animation"
    >
      <div className="level-up-content">
        <Trophy size={64} className="text-gold" />
        <h2>¡Nivel {newLevel}!</h2>
        <p>¡Sigue así, detective!</p>
      </div>
    </motion.div>
  );
};
```

---

## 8. Hooks Compartidos

### 8.1 useModules

```typescript
export const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await modulesAPI.getAll();
        setModules(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  return { modules, isLoading, error };
};
```

### 8.2 useNavigation

```typescript
export const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goToDashboard = () => {
    const path =
      user?.role === 'student'
        ? '/dashboard'
        : user?.role === 'admin_teacher'
        ? '/teacher/dashboard'
        : '/admin/dashboard';
    navigate(path);
  };

  const goToModule = (moduleId: string) => {
    navigate(`/learning/${moduleId}`);
  };

  const goBack = () => navigate(-1);

  return { goToDashboard, goToModule, goBack, navigate };
};
```

### 8.3 useExerciseSubmission

```typescript
export const useExerciseSubmission = (exerciseId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCoins } = useEconomyStore();
  const { addXP } = useRanksStore();

  const submit = async (data: ExerciseSubmissionData) => {
    setIsSubmitting(true);

    try {
      const result = await mechanicsAPI.submit({
        mechanicId: exerciseId,
        ...data,
      });

      // Update stores
      addCoins(result.mlCoinsEarned, 'exercise_completion');
      addXP(result.xpEarned, 'exercise_completion');

      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
};
```

---

## 9. Utilities y Helpers

### 9.1 Formatters

```typescript
// shared/utils/formatters.ts
export const formatMLCoins = (amount: number): string => {
  return `${amount.toLocaleString()} ML`;
};

export const formatXP = (xp: number): string => {
  return `${xp.toLocaleString()} XP`;
};

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatTimeAgo = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });
};
```

### 9.2 Validators

```typescript
// shared/utils/validators.ts
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 10. Constantes

```typescript
// shared/constants/index.ts
export const APP_NAME = 'GAMILIT Platform';
export const APP_VERSION = '2.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LEARNING: '/learning',
  ACHIEVEMENTS: '/achievements',
  SHOP: '/shop',
  SOCIAL: '/social',
} as const;

export const MAYA_RANKS = {
  Ajaw: 'Detective Novato',
  Nacom: 'Sargento',
  Ah K'in: 'Teniente',
  Halach Uinic: 'Capitán',
  K'uk'ulkan: 'Comisario',
} as const;

export const COLORS = {
  DETECTIVE_ORANGE: '#f97316',
  DETECTIVE_BLUE: '#1e3a8a',
  DETECTIVE_GOLD: '#f59e0b',
} as const;
```

---

## 11. Mejores Prácticas

### 11.1 Props

- Tipar todas las props explícitamente
- Usar valores por defecto cuando sea apropiado
- Documentar props complejas con JSDoc

### 11.2 Composición

- Preferir composición sobre herencia
- Usar children para flexibilidad
- Separar lógica de presentación

### 11.3 Performance

- Memorizar componentes costosos con `React.memo`
- Usar `useMemo` y `useCallback` apropiadamente
- Lazy loading de componentes pesados

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Total de Componentes:** 100+
