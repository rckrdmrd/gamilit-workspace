# SPEC-EXERCISES - Student Portal Exercises

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de ejercicios es el núcleo educativo del Student Portal, permitiendo:
- Ejecución de ejercicios interactivos con mecánicas gamificadas
- Auto-guardado de progreso
- Sistema de power-ups/comodines
- Feedback inmediato con recompensas
- Múltiples tipos de mecánicas (30+ tipos)

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Ejercicio Principal | `pages/ExercisePage.tsx` | Contenedor de ejecución de ejercicios |
| Detalle de Módulo | `pages/ModuleDetailPage.tsx` | Lista de ejercicios de un módulo |

---

## 3. Componentes

### 3.1 Componentes de Ejercicio

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| ExerciseHeader | `components/exercise/ExerciseHeader.tsx` | Header con info del ejercicio |
| ExerciseSidebar | `components/exercise/ExerciseSidebar.tsx` | Sidebar con acciones y timer |
| CompletionModal | `components/exercise/CompletionModal.tsx` | Modal de feedback post-completación |
| PowerUpEffects | `components/exercise/PowerUpEffects.tsx` | Efectos visuales de power-ups |
| PowerUpBar | `components/PowerUpBar.tsx` | Barra de power-ups disponibles |

### 3.2 Props de Componentes Principales

```typescript
// ExerciseHeader
interface ExerciseHeaderProps {
  moduleId: string;
  exerciseTitle: string;
  exerciseDescription: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  xpReward: number;
  mlCoinsReward: number;
  timeLimit?: number;
  currentAttempt: number;
  maxAttempts: number;
  timeElapsed: number;
  score?: number;
}

// CompletionModal
interface CompletionModalProps {
  isOpen: boolean;
  success: boolean;
  score: number;
  maxScore: number;
  xpGained: number;
  mlCoinsGained: number;
  timeSpent: number;
  hintsUsed: number;
  achievements?: Achievement[];
  moduleId: string;
  exerciseId?: string;
  rankUp?: {
    newRank: string;
    previousRank?: string;
    bonusMLCoins: number;
    newMultiplier: number;
  } | null;
  streakInfo?: {
    currentStreak: number;
    milestone: boolean;
    reward: number;
  };
  onClose: () => void;
  onRetry: () => void;
  onNextExercise?: () => void;
}
```

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useExerciseState | `hooks/useExerciseState.ts` | Estado completo del ejercicio (NO usado actualmente) |
| useExerciseAutoSave | `hooks/useExerciseAutoSave.ts` | Auto-guardado con debounce |
| useExercisePowerUps | `hooks/useExercisePowerUps.ts` | Gestión de power-ups |

---

## 5. APIs Consumidas

### 5.1 Endpoints Principales

| Endpoint | Método | Descripción | Request | Response |
|----------|--------|-------------|---------|----------|
| `getExercise(exerciseId)` | GET | Obtener datos del ejercicio | - | `ExerciseData` |
| `getExerciseHints(exerciseId)` | GET | Obtener pistas | - | `string[]` |
| `saveExerciseProgress(exerciseId, data)` | POST | Guardar progreso manual | `ProgressData` | `{ success }` |
| `submitExercise(exerciseId, data)` | POST | Enviar ejercicio completado | `SubmissionData` | `SubmissionResult` |
| `autoSaveProgress(exerciseId, data)` | POST | Auto-guardado periódico | `AutoSaveData` | `{ savedAt }` |
| `/gamification/comodines/use` | POST | Usar comodín/power-up | `ComodinDTO` | `{ success }` |

### 5.2 Request/Response Types

```typescript
// Exercise Data
interface ExerciseData {
  id: string;
  module_id: string;
  title: string;
  type: string;                   // Tipo de mecánica
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  points: number;
  estimatedTime: number;          // segundos
  completed: boolean;
  moduleTitle?: string;
  mechanicData?: any;             // Datos específicos de mecánica
  is_active?: boolean;
}

// Submission Data
interface ExerciseSubmissionData {
  answers: any;                   // Respuestas del usuario
  startedAt: Date;
  hintsUsed: number;
  powerupsUsed: string[];
}

// Submission Result
interface ExerciseSubmissionResult {
  score: number;                  // 0-100
  isPerfect: boolean;
  rewards: {
    xp: number;
    mlCoins: number;
    bonuses: string[];
  };
  achievements: Achievement[];
  rankUp?: {
    previousRank: string;
    newRank: string;
    bonusMLCoins: number;
    newMultiplier: number;
  };
  feedback: {
    overall: string;
    answerReview: AnswerReview[];
  };
}

// Auto-save Data
interface AutoSaveProgressData {
  partialAnswers: any;
  timeSpentSeconds: number;
  metadata?: {
    hintsUsed: number;
    comodinesUsed: string[];
    currentStep: number;
  };
}
```

### 5.3 Códigos de Error

| Código | Descripción | Manejo |
|--------|-------------|--------|
| 400 | Datos inválidos | Mostrar validación |
| 401 | No autenticado | Redirect a login |
| 404 | Ejercicio no encontrado | Redirect a módulo |
| 409 | Ejercicio ya completado | Mostrar resultado previo |
| 500 | Error del servidor | Retry con backoff |

---

## 6. Generación de Archivos (PDF/Excel)

**No aplica directamente** - Los ejercicios no generan archivos.
Algunas mecánicas pueden incluir exportación de resultados pero es específico de cada mecánica.

---

## 7. Manejo de Multimedia

### 7.1 Contenido de Ejercicios
- **Imágenes:** Cargadas desde CDN en mechanicData
- **Audio:** Reproducción para ejercicios de listening
- **Video:** Embeds de YouTube/Vimeo para tutoriales

### 7.2 Power-up Effects
- Animaciones CSS/Framer Motion
- Partículas: 20 elementos subiendo
- Duración: 2 segundos
- Screen flash con gradiente

---

## 8. Estados de UI

### 8.1 Flujo de Estados

```
LOADING → READY → IN_PROGRESS → SUBMITTING → FEEDBACK → COMPLETED
                      ↓
                  AUTO_SAVING
```

### 8.2 Estados Detallados

| Estado | Descripción | UI |
|--------|-------------|-----|
| Loading | Cargando ejercicio | Skeleton + spinner |
| Ready | Ejercicio cargado | Mecánica visible |
| In Progress | Usuario resolviendo | Timer activo, auto-save |
| Auto Saving | Guardando progreso | Indicador "Guardando..." |
| Submitting | Enviando respuestas | Botón loading |
| Feedback | Mostrando resultado | CompletionModal |
| Completed | Ejercicio terminado | Redirect a módulo |

### 8.3 Auto-save Status

| Estado | Icono | Mensaje |
|--------|-------|---------|
| idle | - | - |
| saving | ⏳ | "Guardando..." |
| saved | ✓ | "Guardado automáticamente HH:MM" |
| error | ⚠️ | "Error al guardar" |

---

## 9. Validaciones

### 9.1 Validación de Respuestas
- Verificar `userAnswers !== null` antes de submit
- Validar formato según tipo de mecánica
- Verificar tiempo transcurrido < límite (si aplica)

### 9.2 Validación de Power-ups
- Verificar disponibilidad en inventario
- Validar tipo de comodín soportado
- Sincronizar con backend después de uso

### 9.3 Auto-save
- Debounce: 2 segundos
- Intervalo: 30 segundos
- Fallback: localStorage si API falla

---

## 10. Dependencias

### 10.1 Librerías Externas
- `react-confetti` - Celebración en score perfecto
- `framer-motion` - Animaciones
- `lucide-react` - Iconos

### 10.2 Mecánicas (Lazy Loading)
```typescript
// Dynamic import de mecánicas
const loadMechanic = (type: string) => {
  return import(`@/features/mechanics/${type}/component`);
};
```

---

## 11. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P1-003 | handleSaveProgress y autoSaveProgress usan endpoints diferentes | Alta | Pendiente |
| GAP-P1-004 | Backend sync de power-ups es fire-and-forget | Media | Pendiente |
| GAP-P2-003 | Loading state genérico para mecánicas | Baja | Pendiente |
| GAP-P2-004 | CORR-010 debug logs en producción | Baja | Pendiente |

---

## 12. Sistema de Power-ups

### 12.1 Tipos de Power-ups

| ID | Tipo Backend | Efecto | Valor |
|----|--------------|--------|-------|
| powerup-001 | pistas | Extra hints | +2-3 pistas |
| powerup-002 | vision_lectora | Vision (reading support) | Boolean |
| powerup-003 | segunda_oportunidad | Second chance | Boolean |
| powerup-004 | pistas | Time extension (fallback) | +300 segundos |

### 12.2 Mapeo Frontend → Backend

```typescript
const comodinTypeMap: Record<string, string> = {
  'powerup-001': 'pistas',
  'powerup-002': 'vision_lectora',
  'powerup-003': 'segunda_oportunidad',
  'powerup-004': 'pistas',
};
```

---

## 13. Referencias

- **Hook Spec:** `STUDENT-HOOKS-SPEC.md`
- **Mecánicas:** `docs/90-transversal/mecanicas/SPEC-MECANICAS-*.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
