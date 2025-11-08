# US-ACT-001: Mecánicas básicas - Opción múltiple

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 3
**Story Points:** 6 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **responder preguntas de opción múltiple** para **practicar y aprender conceptos de matemáticas mayas**.

**Contexto del Alcance Inicial:**
Esta es la mecánica educativa más básica del MVP. Las preguntas están hardcodeadas en la base de datos como seed data (no hay gestión dinámica de contenido). El sistema valida respuestas, otorga feedback inmediato y registra el progreso del estudiante.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se renderiza la pregunta con su enunciado
- [ ] **CA-02:** Se muestran 3-4 opciones de respuesta (radio buttons)
- [ ] **CA-03:** El estudiante puede seleccionar solo una opción
- [ ] **CA-04:** Al seleccionar, se valida si la respuesta es correcta
- [ ] **CA-05:** Se muestra feedback inmediato: "Correcto" o "Incorrecto"
- [ ] **CA-06:** Si es correcta, se resalta en verde
- [ ] **CA-07:** Si es incorrecta, se resalta en rojo y se muestra la correcta en verde
- [ ] **CA-08:** Se muestra una explicación de la respuesta correcta
- [ ] **CA-09:** Se otorgan puntos XP si la respuesta es correcta
- [ ] **CA-10:** Se registra el intento en la base de datos
- [ ] **CA-11:** Se puede avanzar a la siguiente actividad tras responder

---

## Especificaciones Técnicas

### Backend (NestJS)

**Entidad de Actividad:**
```typescript
@Entity('activities')
class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module

  @Column()
  moduleId: string

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  instructions: string

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType // 'multiple_choice', 'true_false', 'fill_blank', etc.

  @Column({ type: 'jsonb' })
  content: MultipleChoiceContent | TrueFalseContent | FillBlankContent // Union type

  @Column({ default: 0 })
  order: number

  @Column({ type: 'int', default: 10 })
  xpReward: number

  @Column({ type: 'int', default: 0 })
  coinsReward: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}

// Tipos específicos de contenido
interface MultipleChoiceContent {
  question: string
  options: Array<{
    id: string
    text: string
    isCorrect: boolean
  }>
  explanation: string
  imageUrl?: string
}

enum ActivityType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  DRAG_DROP = 'drag_drop',
  ORDERING = 'ordering',
  MATCHING = 'matching',
}
```

**Entidad de Intento:**
```typescript
@Entity('activity_attempts')
class ActivityAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  userId: string

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity

  @Column()
  activityId: string

  @Column({ type: 'jsonb' })
  userAnswer: any // Respuesta del usuario (varía según tipo)

  @Column()
  isCorrect: boolean

  @Column({ type: 'int', default: 0 })
  xpEarned: number

  @Column({ type: 'int', default: 0 })
  coinsEarned: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  attemptedAt: Date
}
```

**Endpoints:**
```
GET /api/activities/:id
- Response: {
    data: {
      id, title, instructions, type, content, xpReward, coinsReward
    }
  }

POST /api/activities/:id/submit
- Body: { userAnswer: { selectedOptionId: string } }
- Response: {
    isCorrect: boolean,
    correctAnswer: { ... },
    explanation: string,
    xpEarned: number,
    coinsEarned: number,
    attempt: { ... }
  }

GET /api/modules/:moduleId/activities
- Response: {
    data: [ { id, title, type, order, isCompleted } ]
  }
```

**Servicios:**
```typescript
class ActivitiesService {
  async getActivity(activityId: string): Promise<Activity> {
    return this.activitiesRepository.findOne({
      where: { id: activityId },
      relations: ['module']
    })
  }

  async submitAnswer(
    activityId: string,
    userId: string,
    userAnswer: any
  ): Promise<SubmitResponse> {
    const activity = await this.getActivity(activityId)

    // Validar respuesta según tipo
    const isCorrect = this.validateMultipleChoice(activity.content, userAnswer)

    // Calcular recompensas
    const xpEarned = isCorrect ? activity.xpReward : 0
    const coinsEarned = isCorrect ? activity.coinsReward : 0

    // Registrar intento
    const attempt = await this.attemptsRepository.save({
      userId,
      activityId,
      userAnswer,
      isCorrect,
      xpEarned,
      coinsEarned
    })

    // Otorgar XP y monedas al usuario
    if (isCorrect) {
      await this.gamificationService.awardXP(userId, xpEarned)
      await this.gamificationService.awardCoins(userId, coinsEarned)
    }

    // Retornar feedback
    return {
      isCorrect,
      correctAnswer: this.getCorrectAnswer(activity.content),
      explanation: activity.content.explanation,
      xpEarned,
      coinsEarned,
      attempt
    }
  }

  private validateMultipleChoice(
    content: MultipleChoiceContent,
    userAnswer: { selectedOptionId: string }
  ): boolean {
    const correctOption = content.options.find(opt => opt.isCorrect)
    return correctOption?.id === userAnswer.selectedOptionId
  }

  private getCorrectAnswer(content: MultipleChoiceContent) {
    return content.options.find(opt => opt.isCorrect)
  }
}
```

### Frontend (React + Vite)

**Componente de Actividad:**
```typescript
// components/activities/MultipleChoiceActivity.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Option {
  id: string
  text: string
  isCorrect?: boolean
}

interface MultipleChoiceActivityProps {
  activity: {
    id: string
    title: string
    instructions?: string
    content: {
      question: string
      options: Option[]
      explanation: string
      imageUrl?: string
    }
    xpReward: number
    coinsReward: number
  }
  onComplete: () => void
}

export function MultipleChoiceActivity({ activity, onComplete }: MultipleChoiceActivityProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedOptionId) return

    setIsLoading(true)
    try {
      const response = await activitiesService.submitAnswer(activity.id, {
        selectedOptionId
      })
      setFeedback(response)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOptionStyle = (option: Option) => {
    if (!submitted) {
      return selectedOptionId === option.id
        ? 'border-maya-green-500 bg-maya-green-50'
        : 'border-gray-300 hover:border-maya-green-300'
    }

    // Después de enviar
    if (feedback.isCorrect && selectedOptionId === option.id) {
      return 'border-green-500 bg-green-50'
    }

    if (!feedback.isCorrect) {
      if (selectedOptionId === option.id) {
        return 'border-red-500 bg-red-50'
      }
      if (option.id === feedback.correctAnswer.id) {
        return 'border-green-500 bg-green-50'
      }
    }

    return 'border-gray-300'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {activity.title}
        </h2>

        {activity.instructions && (
          <p className="text-gray-600 mb-4">{activity.instructions}</p>
        )}

        <div className="mb-6">
          <p className="text-lg font-medium text-gray-900 mb-4">
            {activity.content.question}
          </p>

          {activity.content.imageUrl && (
            <img
              src={activity.content.imageUrl}
              alt="Pregunta"
              className="mb-4 rounded-lg"
            />
          )}

          <div className="space-y-3">
            {activity.content.options.map((option) => (
              <label
                key={option.id}
                className={`
                  flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${getOptionStyle(option)}
                  ${submitted && 'cursor-not-allowed'}
                `}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => !submitted && setSelectedOptionId(option.id)}
                  disabled={submitted}
                  className="mr-3"
                />
                <span className="text-gray-900">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedOptionId || isLoading}
            loading={isLoading}
            fullWidth
          >
            Verificar Respuesta
          </Button>
        ) : (
          <div>
            {/* Feedback */}
            <div className={`p-4 rounded-lg mb-4 ${
              feedback.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-semibold mb-2 ${
                feedback.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </p>
              <p className="text-gray-700">{activity.content.explanation}</p>

              {feedback.isCorrect && (
                <div className="mt-2 text-sm text-green-700">
                  +{feedback.xpEarned} XP | +{feedback.coinsEarned} ML Coins
                </div>
              )}
            </div>

            <Button onClick={onComplete} fullWidth>
              Continuar
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
```

### Seed Data (Ejemplo)

```typescript
// database/seeds/activities.seed.ts
const multipleChoiceActivities = [
  {
    moduleId: 'modulo-numeros-mayas',
    title: 'Identificar número maya',
    instructions: 'Selecciona el número maya que representa el 13',
    type: ActivityType.MULTIPLE_CHOICE,
    content: {
      question: '¿Cuál de estos símbolos representa el número 13 en el sistema maya?',
      options: [
        { id: 'opt1', text: '3 barras (———) y 3 puntos (•••)', isCorrect: true },
        { id: 'opt2', text: '2 barras (——) y 3 puntos (•••)', isCorrect: false },
        { id: 'opt3', text: '3 barras (———) y 2 puntos (••)', isCorrect: false },
        { id: 'opt4', text: '1 barra (—) y 8 puntos (••••••••)', isCorrect: false },
      ],
      explanation: 'En el sistema maya, cada barra vale 5 y cada punto vale 1. Por lo tanto, 3 barras (15) - 2 = 13 es incorrecto. La forma correcta es 2 barras (10) + 3 puntos (3) = 13. Sin embargo, 3 barras (15) es mayor a 13, por lo que la respuesta correcta es 2 barras + 3 puntos.',
      imageUrl: '/images/numeros-mayas/13.png'
    },
    order: 1,
    xpReward: 10,
    coinsReward: 5
  },
  // ... más actividades
]
```

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación)
- US-FUND-003 (Dashboard)
- US-FUND-008 (UI/UX base)
- US-GAM-002 (Sistema XP)
- US-GAM-003 (Monedas)

**Después:**
- Base para otras mecánicas educativas

---

## Definición de Hecho (DoD)

- [x] Entidades creadas (Activity, ActivityAttempt)
- [x] Endpoints implementados
- [x] Validación de respuestas funcional
- [x] Frontend renderiza preguntas
- [x] Feedback visual implementado
- [x] XP y monedas se otorgan correctamente
- [x] Seed data con 10+ preguntas
- [x] Tests unitarios y E2E
- [x] Responsive design

---

## Notas del Alcance Inicial

- ✅ Preguntas hardcodeadas en BD (seed data)
- ✅ Sin editor de contenido (gestión en EXT-017-ContentManagement)
- ✅ Sin límite de intentos
- ✅ Sin temporizador
- ✅ Sin randomización de opciones
- ⚠️ **Extensión futura:** EXT-017-ContentManagement (crear/editar preguntas dinámicamente)

---

## Testing

```typescript
describe('MultipleChoiceActivity', () => {
  it('should validate correct answer')
  it('should award XP for correct answer')
  it('should not award XP for incorrect answer')
  it('should save attempt to database')
  it('should show correct feedback')
})
```

---

## Estimación

**Desglose de Esfuerzo (6 SP = ~2 días):**
- Backend: entidades + endpoints: 0.75 días
- Validación de respuestas: 0.25 días
- Frontend: componente: 0.75 días
- Seed data: 0.25 días
- Testing: 0.5 días

---

## Tareas de Implementación

### Backend (9.6h - 40%)

#### 1. Diseño de Base de Datos (2.4h)
- [ ] **1.1** Crear entidad `Activity` con campos: id, moduleId, title, instructions, type, content (jsonb), order, xpReward, coinsReward (1h)
- [ ] **1.2** Crear entidad `ActivityAttempt` con campos: id, userId, activityId, userAnswer (jsonb), isCorrect, xpEarned, coinsEarned, attemptedAt (0.8h)
- [ ] **1.3** Crear migraciones TypeORM para ambas entidades (0.3h)
- [ ] **1.4** Definir enums ActivityType y tipos TypeScript para MultipleChoiceContent (0.3h)

#### 2. Lógica Backend (4.8h)
- [ ] **2.1** Implementar `ActivitiesService.getActivity()` con relaciones de módulo (0.8h)
- [ ] **2.2** Implementar `ActivitiesService.submitAnswer()` con validación de respuestas (1.5h)
- [ ] **2.3** Implementar método privado `validateMultipleChoice()` para validar opción correcta (0.8h)
- [ ] **2.4** Implementar método privado `getCorrectAnswer()` para extraer respuesta correcta (0.4h)
- [ ] **2.5** Integrar otorgamiento de XP y monedas vía `GamificationService` (1h)
- [ ] **2.6** Implementar registro de intentos en base de datos (0.3h)

#### 3. API y Validación (2.4h)
- [ ] **3.1** Crear controlador `ActivitiesController` con decoradores NestJS (0.5h)
- [ ] **3.2** Implementar endpoint `GET /api/activities/:id` con validación UUID (0.6h)
- [ ] **3.3** Implementar endpoint `POST /api/activities/:id/submit` con DTO validation (0.8h)
- [ ] **3.4** Implementar endpoint `GET /api/modules/:moduleId/activities` con filtros (0.5h)

### Frontend (8.4h - 35%)

#### 4. Componente Principal (4.8h)
- [ ] **4.1** Crear componente `MultipleChoiceActivity.tsx` con estructura base (1h)
- [ ] **4.2** Implementar estado local (selectedOption, submitted, feedback, loading) (0.8h)
- [ ] **4.3** Implementar función `handleSubmit()` con llamada al servicio (1h)
- [ ] **4.4** Implementar lógica de estilos dinámicos `getOptionStyle()` (correcto/incorrecto) (1h)
- [ ] **4.5** Integrar componente `Button` y `Card` de UI library (0.5h)
- [ ] **4.6** Agregar soporte para imágenes opcionales en preguntas (0.5h)

#### 5. Servicios y UI (3.6h)
- [ ] **5.1** Crear `activitiesService.ts` con métodos: `getActivity()`, `submitAnswer()` (1h)
- [ ] **5.2** Implementar renderizado de opciones con radio buttons (0.8h)
- [ ] **5.3** Implementar sección de feedback con explicación y recompensas (1h)
- [ ] **5.4** Agregar animaciones de transición para estados (0.4h)
- [ ] **5.5** Implementar responsive design (mobile/desktop) (0.4h)

### Testing y QA (4.8h - 20%)

#### 6. Tests Backend (2.4h)
- [ ] **6.1** Test unitario: validación de respuesta correcta (0.5h)
- [ ] **6.2** Test unitario: validación de respuesta incorrecta (0.5h)
- [ ] **6.3** Test unitario: otorgamiento de XP por respuesta correcta (0.5h)
- [ ] **6.4** Test unitario: no otorgar XP por respuesta incorrecta (0.5h)
- [ ] **6.5** Test integración: endpoint submitAnswer con base de datos (0.4h)

#### 7. Tests Frontend (2.4h)
- [ ] **7.1** Test: renderizado de pregunta y opciones (0.5h)
- [ ] **7.2** Test: selección de opción y cambio de estado (0.5h)
- [ ] **7.3** Test: envío de respuesta y feedback correcto (0.6h)
- [ ] **7.4** Test: feedback incorrecto muestra respuesta correcta (0.5h)
- [ ] **7.5** Test E2E: flujo completo de responder actividad (0.3h)

### Deploy y Datos (1.2h - 5%)

#### 8. Seed Data y Deploy (1.2h)
- [ ] **8.1** Crear archivo `activities.seed.ts` con 10+ preguntas de opción múltiple (0.6h)
- [ ] **8.2** Configurar ejecución de seeds en pipeline de desarrollo (0.2h)
- [ ] **8.3** Verificar deployment en ambiente de staging (0.2h)
- [ ] **8.4** Documentar estructura de datos en README (0.2h)

---

**Total Estimado:** 24h (6 SP × 4h)
**Desglose:** Backend 40% | Frontend 35% | Testing 20% | Deploy 5%

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
