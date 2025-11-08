# Componentes de Formularios - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Componentes Compartidos - Formularios y Validación
**Ubicación:** `src/shared/components/mechanics/` y `src/shared/utils/`
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-COMPONENTES-FORMS-002
título: Componentes de Formularios y Validación
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde COMPONENTES-COMPARTIDOS.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe los **componentes de formularios y validación** del frontend de GAMILIT, incluyendo componentes de mecánicas educativas, feedback y utilidades de validación.

### Componentes de Formularios:

1. **BaseExercise** - Wrapper base para mecánicas
2. **ExerciseHeader** - Encabezado de ejercicios
3. **ExerciseFooter** - Footer de ejercicios
4. **FeedbackModal** - Modal de retroalimentación
5. **ScoreDisplay** - Visualización de puntajes
6. **HintPanel** - Panel de pistas
7. **TimerDisplay** - Temporizador

### Utilidades:

- **Formatters** - Formateo de datos
- **Validators** - Validación de formularios

---

## 2. Componentes de Mecánicas

### 2.1 BaseExercise

**Responsabilidad:** Wrapper base para todas las mecánicas educativas.

**Ubicación:** `src/shared/components/mechanics/BaseExercise.tsx`

**Props:**
```typescript
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

interface ScoreResult {
  baseScore: number;
  timeBonus: number;
  accuracyBonus: number;
  totalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  mlCoins: number;
  xpGained: number;
}
```

**Implementación:**
```tsx
import React, { useState, useEffect } from 'react';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseFooter } from './ExerciseFooter';
import { HintPanel } from './HintPanel';
import { TimerDisplay } from './TimerDisplay';

export const BaseExercise: React.FC<BaseExerciseProps> = ({
  exerciseId,
  title,
  instructions,
  difficulty,
  timeLimit,
  allowHints = true,
  onComplete,
  children,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!timeLimit) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const result = await submitExercise({
        exerciseId,
        data,
        timeElapsed,
        hintsUsed,
      });

      onComplete(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="base-exercise max-w-4xl mx-auto">
      <ExerciseHeader
        title={title}
        difficulty={difficulty}
        instructions={instructions}
      />

      {timeLimit && (
        <TimerDisplay
          timeElapsed={timeElapsed}
          timeLimit={timeLimit}
        />
      )}

      <div className="exercise-content bg-white rounded-detective shadow-card p-6 my-6">
        {children}
      </div>

      {allowHints && (
        <HintPanel
          hints={[]}
          hintsUsed={hintsUsed}
          onRequestHint={() => setHintsUsed((prev) => prev + 1)}
        />
      )}

      <ExerciseFooter
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
```

---

### 2.2 ExerciseHeader

**Responsabilidad:** Encabezado de ejercicios con título y dificultad.

**Ubicación:** `src/shared/components/mechanics/ExerciseHeader.tsx`

**Props:**
```typescript
interface ExerciseHeaderProps {
  title: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  instructions: string;
}
```

**Implementación:**
```tsx
export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  title,
  difficulty,
  instructions,
}) => {
  const difficultyColors = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-orange-100 text-orange-800',
    experto: 'bg-red-100 text-red-800',
  };

  return (
    <div className="exercise-header mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-detective-3xl font-bold text-detective-text">
          {title}
        </h1>
        <span
          className={`px-4 py-2 rounded-full font-medium ${difficultyColors[difficulty]}`}
        >
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>
      <p className="text-detective-base text-detective-text-secondary">
        {instructions}
      </p>
    </div>
  );
};
```

---

### 2.3 FeedbackModal

**Responsabilidad:** Modal de retroalimentación con resultados y recompensas.

**Ubicación:** `src/shared/components/mechanics/FeedbackModal.tsx`

**Props:**
```typescript
interface FeedbackModalProps {
  isOpen: boolean;
  result: ScoreResult;
  onClose: () => void;
  showConfetti?: boolean;
}
```

**Implementación:**
```tsx
import { Modal } from '../common/Modal';
import { Confetti } from '../celebrations/Confetti';
import { Coins, Zap, Trophy } from 'lucide-react';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  result,
  onClose,
  showConfetti = true,
}) => {
  const gradeColors = {
    'A+': 'text-green-600',
    A: 'text-green-500',
    B: 'text-blue-500',
    C: 'text-yellow-500',
    D: 'text-orange-500',
    F: 'text-red-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {showConfetti && (result.grade === 'A+' || result.grade === 'A') && (
        <Confetti />
      )}

      <div className="feedback-content text-center">
        {/* Grade Display */}
        <div className="mb-6">
          <h2
            className={`text-6xl font-bold mb-2 ${gradeColors[result.grade]}`}
          >
            {result.grade}
          </h2>
          <p className="text-detective-lg text-detective-text-secondary">
            ¡Excelente trabajo, detective!
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-detective-bg rounded-detective p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-detective-base text-detective-text-secondary">
              Puntaje Base:
            </span>
            <span className="font-bold text-detective-text">
              {result.baseScore}
            </span>
          </div>
          {result.timeBonus > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-detective-base text-detective-text-secondary">
                Bonus de Tiempo:
              </span>
              <span className="font-bold text-green-600">
                +{result.timeBonus}
              </span>
            </div>
          )}
          {result.accuracyBonus > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-detective-base text-detective-text-secondary">
                Bonus de Precisión:
              </span>
              <span className="font-bold text-green-600">
                +{result.accuracyBonus}
              </span>
            </div>
          )}
          <div className="border-t border-detective-border-medium pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-detective-lg font-bold text-detective-text">
                Total:
              </span>
              <span className="text-detective-lg font-bold text-detective-orange">
                {result.totalScore}
              </span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-detective p-4">
            <Coins className="w-8 h-8 text-detective-gold mx-auto mb-2" />
            <p className="text-detective-sm text-detective-text-secondary">
              ML Coins
            </p>
            <p className="text-detective-2xl font-bold text-detective-gold">
              +{result.mlCoins}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-detective p-4">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-detective-sm text-detective-text-secondary">
              XP Ganado
            </p>
            <p className="text-detective-2xl font-bold text-purple-600">
              +{result.xpGained}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full bg-detective-orange hover:bg-detective-orange-dark text-white px-6 py-3 rounded-detective font-bold transition-all"
        >
          Continuar
        </button>
      </div>
    </Modal>
  );
};
```

---

### 2.4 HintPanel

**Responsabilidad:** Panel de pistas con contador y costo.

**Ubicación:** `src/shared/components/mechanics/HintPanel.tsx`

**Props:**
```typescript
interface HintPanelProps {
  hints: string[];
  maxHints?: number;
  hintsUsed: number;
  onRequestHint: () => void;
  cost?: number; // ML Coins
}
```

**Implementación:**
```tsx
import { Lightbulb } from 'lucide-react';

export const HintPanel: React.FC<HintPanelProps> = ({
  hints,
  maxHints = 3,
  hintsUsed,
  onRequestHint,
  cost = 10,
}) => {
  const canRequestHint = hintsUsed < maxHints && hintsUsed < hints.length;

  return (
    <div className="hint-panel bg-yellow-50 border-l-4 border-yellow-400 rounded-detective p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-detective-lg font-bold text-detective-text">
            Pistas ({hintsUsed} / {maxHints})
          </h3>
        </div>
        {canRequestHint && (
          <button
            onClick={onRequestHint}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-detective font-medium transition-all"
          >
            Pedir Pista (-{cost} ML)
          </button>
        )}
      </div>

      {hints.slice(0, hintsUsed).map((hint, index) => (
        <div
          key={index}
          className="bg-white rounded-detective p-3 mb-2 animate-slide-up"
        >
          <p className="text-detective-base text-detective-text">
            {index + 1}. {hint}
          </p>
        </div>
      ))}
    </div>
  );
};
```

---

### 2.5 TimerDisplay

**Responsabilidad:** Mostrar tiempo transcurrido/restante.

**Ubicación:** `src/shared/components/mechanics/TimerDisplay.tsx`

**Props:**
```typescript
interface TimerDisplayProps {
  timeElapsed: number; // En segundos
  timeLimit?: number; // En segundos
}
```

**Implementación:**
```tsx
import { Clock } from 'lucide-react';

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeElapsed,
  timeLimit,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRemaining = timeLimit ? timeLimit - timeElapsed : null;
  const isUrgent = timeRemaining !== null && timeRemaining <= 60;

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full
        ${isUrgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
        font-mono font-bold
      `}
    >
      <Clock className="w-5 h-5" />
      <span>
        {timeLimit
          ? `Tiempo restante: ${formatTime(timeRemaining!)}`
          : `Tiempo: ${formatTime(timeElapsed)}`}
      </span>
    </div>
  );
};
```

---

## 3. Utilidades de Validación

### 3.1 Formatters

**Ubicación:** `src/shared/utils/formatters.ts`

```typescript
// Formateo de moneda ML
export const formatMLCoins = (amount: number): string => {
  return `${amount.toLocaleString()} ML`;
};

// Formateo de XP
export const formatXP = (xp: number): string => {
  return `${xp.toLocaleString()} XP`;
};

// Formateo de fecha
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
};

export const formatTimeAgo = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });
};

// Formateo de números
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Formateo de porcentaje
export const formatPercentage = (value: number, total: number): string => {
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};
```

---

### 3.2 Validators

**Ubicación:** `src/shared/utils/validators.ts`

```typescript
// Validación de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de password
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos un número');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Debe incluir al menos un carácter especial (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validación de nombre de usuario
export const validateUsername = (username: string): {
  isValid: boolean;
  error?: string;
} => {
  if (username.length < 3) {
    return { isValid: false, error: 'Mínimo 3 caracteres' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Máximo 20 caracteres' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Solo letras, números y guión bajo' };
  }
  return { isValid: true };
};

// Validación de campos requeridos
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Validación de rango numérico
export const validateRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};
```

---

## 4. Hooks de Formularios

### 4.1 useExerciseSubmission

**Ubicación:** `src/shared/hooks/useExerciseSubmission.ts`

```typescript
import { useState } from 'react';
import { useEconomyStore } from '@stores/economyStore';
import { useRanksStore } from '@stores/ranksStore';
import { mechanicsAPI } from '@api/mechanics';

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

      // Actualizar stores
      addCoins(result.mlCoinsEarned, 'exercise_completion');
      addXP(result.xpEarned, 'exercise_completion');

      return result;
    } catch (error) {
      console.error('Error submitting exercise:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
};
```

---

## 5. Constantes

**Ubicación:** `src/shared/constants/index.ts`

```typescript
// Nombres de aplicación
export const APP_NAME = 'GAMILIT Platform';
export const APP_VERSION = '2.0.0';

// Rangos Maya
export const MAYA_RANKS = {
  Ajaw: 'Detective Novato',
  Nacom: 'Sargento',
  Ah K'in: 'Teniente',
  Halach Uinic: 'Capitán',
  K'uk'ulkan: 'Comisario',
} as const;

// Colores
export const COLORS = {
  DETECTIVE_ORANGE: '#f97316',
  DETECTIVE_BLUE: '#1e3a8a',
  DETECTIVE_GOLD: '#f59e0b',
} as const;

// Rutas
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

// Configuración de ejercicios
export const EXERCISE_CONFIG = {
  DEFAULT_TIME_LIMIT: 300, // 5 minutos
  MAX_HINTS: 3,
  HINT_COST: 10, // ML Coins
  PERFECT_SCORE_THRESHOLD: 100,
} as const;
```

---

## 6. Mejores Prácticas

### 6.1 Validación

- **Validar en el cliente** antes de enviar al servidor
- **Mostrar errores claramente** con mensajes descriptivos
- **Validar en tiempo real** para mejor UX

### 6.2 Feedback

- **Feedback inmediato** al usuario sobre sus acciones
- **Mensajes positivos** para reforzar el aprendizaje
- **Visualización clara** de errores y éxitos

### 6.3 Accesibilidad

- **Labels claros** en todos los inputs
- **Mensajes de error accesibles** (aria-live)
- **Focus management** en formularios

---

## 7. Referencias

- **Archivo Original:** `COMPONENTES-COMPARTIDOS.md` (líneas 287-651)
- **Componentes UI:** Ver `Componentes-UI.md`
- **Componentes de Layout:** Ver `Componentes-Layout.md`
- **README Principal:** Ver `componentes/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Componentes de Formularios:** 7+
