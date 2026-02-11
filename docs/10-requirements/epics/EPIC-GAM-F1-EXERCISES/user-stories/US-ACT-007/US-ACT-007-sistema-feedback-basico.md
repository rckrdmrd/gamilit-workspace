---
id: "US-ACT-007"
title: "Sistema de feedback básico"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-002"
story_points: 5
budget: "$1,800 MXN"
sprint: "Sprint-1"
labels: ["actividades", "feedback", "ux", "gamificacion", "frontend"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ACT-007: Sistema de feedback básico

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 4
**Story Points:** 5 SP
**Presupuesto:** $1,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripción

Como **estudiante**, quiero **recibir feedback claro e inmediato al responder actividades** para **entender mis aciertos y errores de forma educativa**.

**Contexto del Alcance Inicial:**
Sistema centralizado de feedback para todas las mecánicas. Mensajes pre-cargados, explicaciones hardcodeadas, y animaciones simples. NO usa IA para generar feedback personalizado.

---

## Criterios de Aceptación

- [ ] **CA-01:** Feedback inmediato al enviar respuesta (< 1 segundo)
- [ ] **CA-02:** Mensaje "Correcto" con animación positiva (confetti, check verde)
- [ ] **CA-03:** Mensaje "Incorrecto" con animación neutra (sin penalización negativa)
- [ ] **CA-04:** Explicación educativa de la respuesta correcta
- [ ] **CA-05:** Visualización de XP y monedas ganadas
- [ ] **CA-06:** Botón para continuar a siguiente actividad
- [ ] **CA-07:** Mensajes motivacionales aleatorios
- [ ] **CA-08:** Feedback adaptado según tipo de actividad

---

## Especificaciones Técnicas

### Backend

**Mensajes Motivacionales:**
```typescript
const MOTIVATIONAL_MESSAGES = {
  correct: [
    'Excelente trabajo! Sigues avanzando como un verdadero sabio maya.',
    'Correcto! Tu conocimiento crece como las pirámides mayas.',
    'Muy bien! Los antiguos mayas estarían orgullosos.',
    'Perfecto! Continúa tu camino al conocimiento.',
  ],
  incorrect: [
    'No te preocupes, cada error es una oportunidad para aprender.',
    'Sigue intentando, estás en el camino correcto.',
    'Aprender requiere práctica. Tu puedes!',
    'Los sabios mayas también comenzaron desde cero.',
  ]
}

// En el servicio
class FeedbackService {
  generateFeedback(isCorrect: boolean, explanation: string, xpEarned: number, coinsEarned: number) {
    const messages = isCorrect ? MOTIVATIONAL_MESSAGES.correct : MOTIVATIONAL_MESSAGES.incorrect
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    return {
      isCorrect,
      message: randomMessage,
      explanation,
      rewards: isCorrect ? { xp: xpEarned, coins: coinsEarned } : null
    }
  }
}
```

### Frontend

**Componente de Feedback:**
```typescript
// components/activities/FeedbackSection.tsx
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface FeedbackSectionProps {
  feedback: {
    isCorrect: boolean
    message: string
    explanation: string
    rewards?: { xp: number, coins: number }
  }
  onContinue: () => void
}

export function FeedbackSection({ feedback, onContinue }: FeedbackSectionProps) {
  useEffect(() => {
    if (feedback.isCorrect) {
      // Animación de confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [feedback.isCorrect])

  return (
    <div className={`p-6 rounded-lg border-2 ${
      feedback.isCorrect
        ? 'bg-green-50 border-green-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      {/* Icono y mensaje principal */}
      <div className="flex items-center gap-3 mb-4">
        {feedback.isCorrect ? (
          <CheckCircleIcon className="w-8 h-8 text-green-600 animate-bounce" />
        ) : (
          <XCircleIcon className="w-8 h-8 text-blue-600" />
        )}
        <h3 className={`text-xl font-bold ${
          feedback.isCorrect ? 'text-green-900' : 'text-blue-900'
        }`}>
          {feedback.isCorrect ? 'Correcto!' : 'Sigue intentando'}
        </h3>
      </div>

      {/* Mensaje motivacional */}
      <p className={`text-lg mb-3 ${
        feedback.isCorrect ? 'text-green-800' : 'text-blue-800'
      }`}>
        {feedback.message}
      </p>

      {/* Explicación */}
      <div className="bg-white bg-opacity-50 p-4 rounded-lg mb-4">
        <p className="font-medium text-gray-700 mb-1">Explicación:</p>
        <p className="text-gray-600">{feedback.explanation}</p>
      </div>

      {/* Recompensas */}
      {feedback.rewards && (
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
            <span className="text-2xl">*</span>
            <div>
              <p className="text-xs text-gray-600">XP Ganado</p>
              <p className="text-lg font-bold text-yellow-700">+{feedback.rewards.xp}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gold-100 rounded-lg">
            <span className="text-2xl">$</span>
            <div>
              <p className="text-xs text-gray-600">ML Coins</p>
              <p className="text-lg font-bold text-gold-700">+{feedback.rewards.coins}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón continuar */}
      <Button onClick={onContinue} fullWidth variant="primary">
        {feedback.isCorrect ? 'Continuar' : 'Intentar de nuevo'}
      </Button>
    </div>
  )
}
```

**Animaciones CSS:**
```css
/* Animación de entrada del feedback */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-enter {
  animation: slideInUp 0.3s ease-out;
}

/* Animación del check verde */
@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.check-icon {
  animation: scaleIn 0.5s ease-out;
}
```

**Toasts para notificaciones rápidas:**
```typescript
// components/ui/Toast.tsx
import { toast, Toaster } from 'react-hot-toast'

// Uso en actividades
const showSuccessToast = () => {
  toast.success('Respuesta correcta! +10 XP', {
    icon: 'check',
    duration: 3000,
    position: 'top-center',
  })
}

const showErrorToast = () => {
  toast.error('Respuesta incorrecta. Intenta de nuevo.', {
    icon: 'bulb',
    duration: 3000,
    position: 'top-center',
  })
}

// En App.tsx
<Toaster />
```

---

## Dependencias

**Antes:**
- US-ACT-001 a US-ACT-006 (Todas las mecánicas)
- US-FUND-008 (UI/UX base)

**Librería:** `canvas-confetti`, `react-hot-toast`

---

## Definición de Hecho (DoD)

- [x] Componente FeedbackSection reutilizable
- [x] Animaciones de confetti para respuestas correctas
- [x] Mensajes motivacionales aleatorios
- [x] Visualización de recompensas
- [x] Toasts para notificaciones rápidas
- [x] Responsive
- [x] Accesible (ARIA labels)

---

## Notas del Alcance Inicial

- Done Mensajes pre-escritos (hardcoded)
- Done Feedback genérico para todos los usuarios
- Done Animaciones simples (CSS + confetti)
- Done Sin feedback personalizado con IA
- Done Sin análisis de errores comunes
- **Extensión futura:** EXT-020-AIFeedback (feedback personalizado con IA)
- **Extensión futura:** EXT-021-Analytics (análisis de patrones de error)

---

## Testing

```typescript
describe('FeedbackSection', () => {
  it('should show correct feedback for right answer')
  it('should show incorrect feedback for wrong answer')
  it('should display rewards for correct answer')
  it('should not display rewards for incorrect answer')
  it('should trigger confetti on correct answer')
  it('should call onContinue when button clicked')
})

describe('Motivational Messages', () => {
  it('should return random correct message')
  it('should return random incorrect message')
  it('should not repeat same message consecutively')
})
```

---

## Estimación

**Desglose de Esfuerzo (5 SP = ~1.75 días):**
- Componente FeedbackSection: 0.75 días
- Animaciones: 0.25 días
- Mensajes motivacionales: 0.25 días
- Toasts: 0.25 días
- Testing: 0.25 días

**Riesgos:**
- Animaciones pueden afectar performance en dispositivos lentos
- Balance entre feedback positivo sin trivializar errores

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-04
**Responsable:** Equipo Frontend + UX
