# Feature: Progress Tracking

**Proyecto:** GAMILIT Platform
**Feature:** Progress Tracking & Analytics
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/progress/`

---

## 📋 Índice de Documentación

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [PROGRESS-API.md](./PROGRESS-API.md) | API client, tipos, y ejemplos de uso | ✅ |

---

## 🎯 Propósito

Sistema de **tracking de progreso educativo** que registra y analiza el avance del estudiante a través de módulos y ejercicios.

**Funcionalidades:**
- **Progress Overview:** Vista general de progreso por módulos
- **Exercise Attempts:** Historial de intentos en ejercicios
- **Analytics:** Métricas de desempeño y tendencias
- **Study Streaks:** Racha de días consecutivos de estudio
- **Dashboard Data:** Datos para dashboard del estudiante

**Nota:** Este feature es principalmente un **API client** sin store global ni componentes UI extensos. Los componentes de UI para mostrar progreso están distribuidos en los apps (student, admin, teacher).

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Caso de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md)
  - Vista de progreso del estudiante

- **Caso de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md)
  - Envío de ejercicios y tracking de intentos

### Especificaciones Técnicas
- **API Reference:** [`docs/02-especificaciones-tecnicas/apis/api-reference/05-PROGRESS-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/05-PROGRESS-API.md)
  - 3 endpoints principales de progreso

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md`](../../../../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md)
  - Flujo completo de envío y evaluación de ejercicios

---

## 🏗️ Arquitectura del Feature

### Estructura de Archivos

```
apps/frontend/src/features/progress/
├── api/
│   ├── progressAPI.ts              # API client principal
│   ├── progressTypes.ts            # Tipos TypeScript (19 interfaces)
│   └── index.ts                    # Exports públicos
└── examples/
    ├── ExerciseSubmissionExample.tsx   # Ejemplo de envío
    ├── ProgressDashboardExample.tsx    # Ejemplo de dashboard
    └── index.ts
```

**Total:** 6 archivos

**Nota sobre arquitectura:** A diferencia de `auth` y `gamification`, este feature NO incluye:
- ❌ Store global (Zustand)
- ❌ Componentes UI compartidos
- ❌ Hooks personalizados

**Razón:** El progreso se consulta bajo demanda en vistas específicas (Dashboard, ModuleView) y no necesita estado global persistente.

---

## 🔑 Componentes Clave

### 1. Progress API Client

Cliente de API para consultar progreso del estudiante.

```typescript
import { progressAPI } from '@/features/progress';

// Obtener progreso general
const progress = await progressAPI.getUserProgress(userId);

// Obtener historial de intentos
const attempts = await progressAPI.getAttempts(userId, { exerciseId });

// Obtener analytics
const analytics = await progressAPI.getAnalytics(userId);
```

**Ver:** [PROGRESS-API.md](./PROGRESS-API.md#api-client)

---

### 2. Tipos TypeScript

**19 interfaces** para progreso, intentos, y analytics.

**Principales:**
- `UserProgressOverview` - Vista general de progreso
- `ModuleProgressSummary` - Progreso por módulo
- `ExerciseAttempt` - Registro de intento
- `SubmitExerciseRequest/Response` - Envío de ejercicios
- `StudyStreak` - Racha de días consecutivos

**Ver:** [PROGRESS-API.md](./PROGRESS-API.md#tipos-typescript)

---

### 3. Examples

Ejemplos de uso completos en `/examples/`:

- **ExerciseSubmissionExample.tsx**: Cómo enviar un ejercicio y procesar respuesta
- **ProgressDashboardExample.tsx**: Cómo construir un dashboard de progreso

---

## 🔄 Flujos Principales

### 1. Enviar Ejercicio

```
Usuario completa ejercicio en UI
  ↓
Component prepara SubmitExerciseRequest
  {
    exerciseId: 'uuid',
    userId: 'uuid',
    answers: { ... },
    startedAt: timestamp,
    hintsUsed: 2,
    powerupsUsed: ['pistas']
  }
  ↓
progressAPI.submitExercise(request)
  ↓
POST /api/educational/exercises/:id/submit
  ↓
Backend:
  1. Evalúa respuestas
  2. Calcula score
  3. Otorga recompensas (XP, ML Coins)
  4. Verifica achievements
  5. Verifica rank up
  6. Actualiza progreso de módulo
  ↓
Response: SubmitExerciseResponse
  {
    attemptId: 'uuid',
    score: 85,
    isPerfect: false,
    rewards: {
      mlCoins: 58,
      xp: 120,
      bonuses: { speedBonus: 10 }
    },
    feedback: { overall: 'Buen trabajo' },
    achievements: [...],
    rankUp: null
  }
  ↓
Frontend:
  - Muestra resultado del ejercicio
  - Actualiza UI con recompensas
  - Muestra achievements desbloqueados
  - Modal de rank up si aplica
```

**Referencia:** [`02-educational-mechanics.md`](../../../../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md#flujo-2-envio-de-ejercicio-submit-exercise)

---

### 2. Consultar Progreso

```
Usuario navega a Dashboard
  ↓
Component monta: useEffect(() => { fetchProgress() })
  ↓
progressAPI.getUserProgress(userId)
  ↓
GET /api/progress/:userId
  ↓
Backend:
  - Consulta progress_tracking.module_progress
  - Agrega exercise_attempts para cada módulo
  - Calcula estadísticas
  ↓
Response: UserProgressOverview
  {
    overallProgress: {
      totalModules: 5,
      completedModules: 2,
      overallPercentage: 40
    },
    moduleProgress: [
      {
        moduleId: 'uuid',
        moduleName: 'Comprensión Literal',
        progressPercentage: 100,
        averageScore: 88,
        timeSpent: 3600
      },
      ...
    ],
    studyStreak: {
      currentStreak: 7,
      longestStreak: 14
    }
  }
  ↓
Component renderiza:
  - Progress bars por módulo
  - Overall percentage
  - Study streak badge
```

---

### 3. Ver Historial de Intentos

```
Usuario click en "Ver intentos" en ejercicio
  ↓
progressAPI.getAttempts(userId, { exerciseId })
  ↓
GET /api/progress/attempts/:userId?exerciseId=uuid
  ↓
Response: ExerciseAttempt[]
  [
    {
      id: 'attempt-1',
      score: 100,
      isPerfect: true,
      timeSpent: 120,
      mlCoinsEarned: 75,
      completedAt: '2025-11-06T10:00:00Z'
    },
    {
      id: 'attempt-2',
      score: 80,
      isPerfect: false,
      hintsUsed: 1,
      completedAt: '2025-11-05T14:30:00Z'
    }
  ]
  ↓
Component muestra tabla de intentos con:
  - Score
  - Time spent
  - Rewards earned
  - Date
```

---

## 📊 Métricas de Progreso

### Overall Progress

```typescript
interface OverallProgress {
  totalModules: number;              // 5 (total en plataforma)
  completedModules: number;          // 2 (completados al 100%)
  totalExercises: number;            // 75 (total en plataforma)
  completedExercises: number;        // 34 (completados exitosamente)
  overallPercentage: number;         // 45% (progreso general)
}
```

### Module Progress

```typescript
interface ModuleProgressSummary {
  moduleId: string;
  moduleName: string;
  totalExercises: number;            // Ejercicios en el módulo
  completedExercises: number;        // Ejercicios completados
  progressPercentage: number;        // 0-100
  averageScore: number;              // Puntuación promedio
  timeSpent: number;                 // Minutos dedicados
  lastActivityAt: Date;
}
```

### Study Streak

```typescript
interface StudyStreak {
  currentStreak: number;             // 7 días consecutivos
  longestStreak: number;             // 14 días (récord)
  lastStudyDate: Date;               // Última actividad
}
```

**Cálculo de Streak:**
- Incrementa si el usuario completa al menos 1 ejercicio en el día
- Reset a 0 si pasa >24 horas sin actividad
- Leeway de fin de semana (opcional según configuración)

---

## 🔗 Integraciones

### Con Gamification

El progress tracking está **estrechamente integrado** con gamification:

**Después de cada ejercicio enviado:**
1. ✅ Actualiza `progress_tracking.module_progress`
2. ✅ Otorga ML Coins (via `gamification_system.ml_coins_transactions`)
3. ✅ Otorga XP (via `gamification_system.user_stats`)
4. ✅ Verifica achievements (via `gamification_system.achievements`)
5. ✅ Verifica rank up (via `gamification_system.user_ranks`)

**Flujo Backend:**
```typescript
// exercises.service.ts
async submitExercise(userId, exerciseId, submission) {
  await client.query('BEGIN');

  // 1. Evaluar y guardar intento
  const attempt = await this.saveAttempt(...);

  // 2. Actualizar progreso
  await progressService.updateModuleProgress(userId, moduleId, client);

  // 3. Otorgar recompensas gamification
  if (attempt.isCorrect) {
    await gamificationService.addMLCoins(..., client);
    await gamificationService.addXP(..., client);
    await achievementsService.checkUnlocked(userId, client);
    await ranksService.autoCheckPromotion(userId, client);
  }

  await client.query('COMMIT');
}
```

---

### Con Educational Modules

- Progreso se calcula por módulo educativo
- 5 módulos en total (Comprensión Literal, Inferencial, Crítica, Lectura Digital, Producción Textos)
- Módulo se marca como "completado" cuando progreso = 100%

---

## 🧪 Testing

### API Client Tests

```typescript
// __tests__/progressAPI.test.ts
import { progressAPI } from '../progressAPI';

describe('progressAPI', () => {
  it('should fetch user progress', async () => {
    const progress = await progressAPI.getUserProgress('user-1');

    expect(progress.overallProgress).toBeDefined();
    expect(progress.moduleProgress).toBeInstanceOf(Array);
    expect(progress.studyStreak).toBeDefined();
  });

  it('should fetch exercise attempts', async () => {
    const attempts = await progressAPI.getAttempts('user-1', {
      exerciseId: 'exercise-1'
    });

    expect(attempts).toBeInstanceOf(Array);
    expect(attempts[0]).toHaveProperty('score');
    expect(attempts[0]).toHaveProperty('mlCoinsEarned');
  });
});
```

---

## 📈 Uso en Aplicaciones

### Student App

**Dashboard:**
```typescript
// apps/student/pages/Dashboard.tsx
const Dashboard = () => {
  const { data: progress } = useQuery({
    queryKey: ['progress', userId],
    queryFn: () => progressAPI.getUserProgress(userId)
  });

  return (
    <div>
      <h1>Mi Progreso</h1>

      <OverallProgressCard
        totalModules={progress.overallProgress.totalModules}
        completedModules={progress.overallProgress.completedModules}
        percentage={progress.overallProgress.overallPercentage}
      />

      <ModulesGrid modules={progress.moduleProgress} />

      <StreakCard
        currentStreak={progress.studyStreak.currentStreak}
        longestStreak={progress.studyStreak.longestStreak}
      />
    </div>
  );
};
```

**Exercise View:**
```typescript
// apps/student/pages/ExerciseView.tsx
const ExerciseView = ({ exerciseId }: Props) => {
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());

  const handleSubmit = async () => {
    const submission: SubmitExerciseRequest = {
      exerciseId,
      userId,
      answers,
      startedAt: startTime,
      hintsUsed: 0,
      powerupsUsed: []
    };

    const result = await progressAPI.submitExercise(exerciseId, submission);

    // Mostrar resultado
    showResultModal(result);

    // Actualizar recompensas en UI
    updateCoinsBalance(result.rewards.mlCoins);
    updateXP(result.rewards.xp);

    // Mostrar achievements desbloqueados
    if (result.achievements?.length > 0) {
      showAchievementsModal(result.achievements);
    }

    // Mostrar rank up si aplica
    if (result.rankUp) {
      showRankUpModal(result.rankUp);
    }
  };

  return (
    <div>
      {/* Exercise UI */}
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
};
```

---

### Teacher App

**Progress Monitoring:**
```typescript
// apps/teacher/pages/StudentProgress.tsx
const StudentProgress = ({ studentId }: Props) => {
  const { data: progress } = useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: () => progressAPI.getUserProgress(studentId)
  });

  const { data: analytics } = useQuery({
    queryKey: ['student-analytics', studentId],
    queryFn: () => progressAPI.getAnalytics(studentId)
  });

  return (
    <div>
      <h2>Progreso de Estudiante</h2>

      <ProgressCharts data={analytics.trends} />

      <ModuleBreakdown modules={progress.moduleProgress} />

      <PerformanceInsights
        summary={analytics.summary}
        performanceByModule={analytics.performanceByModule}
      />
    </div>
  );
};
```

---

## 🐛 Estado del Feature

### Implementación Actual

| Componente | Estado | Notas |
|------------|--------|-------|
| **API Client** | ✅ 100% | Totalmente funcional |
| **Tipos TypeScript** | ✅ 100% | 19 interfaces completas |
| **Examples** | ✅ 100% | 2 ejemplos funcionales |
| **Backend Integration** | ✅ 100% | Endpoints operacionales |

### Bugs Conocidos

✅ **Sin bugs críticos reportados**

### Mejoras Futuras

- [ ] Real-time progress updates (WebSocket)
- [ ] Offline progress sync
- [ ] Más analytics detallados (time of day patterns, etc.)
- [ ] Export progress reports (PDF)

---

## 📝 Notas de Implementación

### Decisiones Técnicas

1. **Sin store global:** Progress se consulta bajo demanda, no necesita Zustand
2. **React Query recomendado:** Para caching y refetch automático
3. **Integración atómica:** Transacciones DB aseguran consistencia entre progress y gamification

### Lecciones Aprendidas

1. **Progreso debe actualizarse atómicamente** con recompensas (mismo transaction)
2. **Streaks son feature de alto engagement** - implementar correctamente es crítico
3. **Analytics detallados requieren queries complejas** - considerar materialized views

---

## 📊 Métricas del Feature

| Métrica | Valor |
|---------|-------|
| Archivos | 6 |
| Interfaces TypeScript | 19 |
| Endpoints backend | 3 |
| Examples | 2 |
| Líneas de código | ~600 |

---

**Mantenedores:** @frontend-team, @backend-team
**Última actualización:** 2025-11-07
**Próxima revisión:** Trimestral

**Documentos relacionados:**
- [PROGRESS-API.md](./PROGRESS-API.md)
- [gamification/README.md](../gamification/README.md)
- [auth/README.md](../auth/README.md)
