# US-ACT-002: Mecánicas básicas - Verdadero/Falso

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 3
**Story Points:** 4 SP
**Presupuesto:** $1,500 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **responder preguntas de verdadero o falso** para **validar mi comprensión de conceptos de forma rápida**.

**Contexto del Alcance Inicial:**
Mecánica educativa simple con solo dos opciones: Verdadero o Falso. Las preguntas están hardcodeadas en la BD. Reutiliza la infraestructura de US-ACT-001 pero con lógica de validación simplificada.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se muestra una afirmación o enunciado
- [ ] **CA-02:** Se presentan dos opciones: "Verdadero" y "Falso"
- [ ] **CA-03:** El estudiante selecciona una opción
- [ ] **CA-04:** Se valida la respuesta al enviar
- [ ] **CA-05:** Se muestra feedback inmediato (correcto/incorrecto)
- [ ] **CA-06:** Se muestra explicación de por qué es verdadero o falso
- [ ] **CA-07:** Se otorgan XP y monedas si es correcta
- [ ] **CA-08:** Se registra el intento

---

## Especificaciones Técnicas

### Backend

**Content Type:**
```typescript
interface TrueFalseContent {
  statement: string
  correctAnswer: boolean // true = Verdadero, false = Falso
  explanation: string
  imageUrl?: string
}
```

**Validación:**
```typescript
class ActivitiesService {
  private validateTrueFalse(
    content: TrueFalseContent,
    userAnswer: { answer: boolean }
  ): boolean {
    return content.correctAnswer === userAnswer.answer
  }
}
```

**Endpoint:**
```
POST /api/activities/:id/submit
- Body: { userAnswer: { answer: boolean } }
- Response: { isCorrect, explanation, xpEarned, coinsEarned }
```

### Frontend

**Componente:**
```typescript
// components/activities/TrueFalseActivity.tsx
export function TrueFalseActivity({ activity, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async () => {
    const response = await activitiesService.submitAnswer(activity.id, {
      answer: selectedAnswer
    })
    setFeedback(response)
    setSubmitted(true)
  }

  return (
    <Card>
      <h2>{activity.title}</h2>
      <p className="text-lg mb-6">{activity.content.statement}</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => !submitted && setSelectedAnswer(true)}
          className={`flex-1 p-6 rounded-lg border-2 ${
            selectedAnswer === true ? 'border-green-500 bg-green-50' : 'border-gray-300'
          } ${submitted && getResultStyle(true)}`}
          disabled={submitted}
        >
          Verdadero
        </button>

        <button
          onClick={() => !submitted && setSelectedAnswer(false)}
          className={`flex-1 p-6 rounded-lg border-2 ${
            selectedAnswer === false ? 'border-green-500 bg-green-50' : 'border-gray-300'
          } ${submitted && getResultStyle(false)}`}
          disabled={submitted}
        >
          Falso
        </button>
      </div>

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
          Verificar
        </Button>
      ) : (
        <FeedbackSection feedback={feedback} onContinue={onComplete} />
      )}
    </Card>
  )
}
```

### Seed Data

```typescript
const trueFalseActivities = [
  {
    moduleId: 'modulo-numeros-mayas',
    title: 'Sistema vigesimal',
    type: ActivityType.TRUE_FALSE,
    content: {
      statement: 'El sistema numérico maya es un sistema vigesimal (base 20)',
      correctAnswer: true,
      explanation: 'Correcto. Los mayas utilizaban un sistema de numeración vigesimal, es decir, basado en el número 20, a diferencia del sistema decimal (base 10) que usamos actualmente.'
    },
    order: 2,
    xpReward: 8,
    coinsReward: 3
  },
  {
    moduleId: 'modulo-calendario',
    title: 'Duración del Haab',
    type: ActivityType.TRUE_FALSE,
    content: {
      statement: 'El calendario Haab maya tiene 360 días',
      correctAnswer: false,
      explanation: 'Falso. El calendario Haab tiene 365 días, divididos en 18 meses de 20 días cada uno, más un período de 5 días llamado Wayeb.'
    },
    order: 1,
    xpReward: 8,
    coinsReward: 3
  }
]
```

---

## Dependencias

**Antes:**
- US-ACT-001 (Reutiliza infraestructura)

**Después:**
- Complementa el conjunto de mecánicas básicas

---

## Definición de Hecho (DoD)

- [x] Backend valida respuestas V/F
- [x] Componente frontend implementado
- [x] Feedback visual correcto
- [x] Seed data con 10+ preguntas
- [x] Tests unitarios
- [x] Responsive design

---

## Notas del Alcance Inicial

- ✅ Preguntas hardcodeadas
- ✅ Sin límite de tiempo
- ✅ Sin penalización por respuesta incorrecta
- ⚠️ **Extensión futura:** EXT-017-ContentManagement

---

## Testing

```typescript
describe('TrueFalseActivity', () => {
  it('should validate true answer')
  it('should validate false answer')
  it('should award XP for correct answer')
  it('should show explanation')
})
```

---

## Estimación

**Desglose de Esfuerzo (4 SP = ~1.5 días):**
- Backend: lógica de validación: 0.25 días
- Frontend: componente: 0.5 días
- Seed data: 0.25 días
- Testing: 0.25 días
- Integración: 0.25 días

---

## Tareas de Implementación

### Backend (6.4h - 40%)

#### 1. Tipos y Validación (2.4h)
- [ ] **1.1** Definir interfaz `TrueFalseContent` con campos: statement, correctAnswer, explanation, imageUrl (0.4h)
- [ ] **1.2** Implementar método `validateTrueFalse()` en `ActivitiesService` (0.8h)
- [ ] **1.3** Extender enum `ActivityType` para incluir `TRUE_FALSE` (0.2h)
- [ ] **1.4** Crear DTO para `userAnswer` con validación booleana (0.5h)
- [ ] **1.5** Agregar tests unitarios de validación (0.5h)

#### 2. Lógica de Negocio (2.4h)
- [ ] **2.1** Integrar validación TRUE_FALSE en `submitAnswer()` switch case (0.8h)
- [ ] **2.2** Implementar generación de feedback específico para V/F (0.6h)
- [ ] **2.3** Configurar recompensas XP/monedas por defecto (8 XP, 3 coins) (0.3h)
- [ ] **2.4** Registrar intentos en base de datos con tipo correcto (0.4h)
- [ ] **2.5** Agregar validación de respuesta no nula (0.3h)

#### 3. API (1.6h)
- [ ] **3.1** Actualizar endpoint `POST /api/activities/:id/submit` para soportar V/F (0.5h)
- [ ] **3.2** Documentar estructura de respuesta en Swagger/OpenAPI (0.3h)
- [ ] **3.3** Test de integración: submit TRUE_FALSE activity (0.5h)
- [ ] **3.4** Validar edge cases (respuesta null, undefined) (0.3h)

### Frontend (5.6h - 35%)

#### 4. Componente TrueFalse (3.6h)
- [ ] **4.1** Crear componente `TrueFalseActivity.tsx` con estructura base (0.8h)
- [ ] **4.2** Implementar estado local (selectedAnswer: boolean | null, submitted, feedback) (0.5h)
- [ ] **4.3** Crear botones Verdadero/Falso con estilos condicionales (1h)
- [ ] **4.4** Implementar función `getResultStyle()` para resaltar correcto/incorrecto (0.8h)
- [ ] **4.5** Integrar componente `FeedbackSection` reutilizable (0.5h)

#### 5. UI y Responsividad (2h)
- [ ] **5.1** Diseñar layout responsive para botones (flex/grid) (0.6h)
- [ ] **5.2** Agregar animaciones de hover y click (0.4h)
- [ ] **5.3** Implementar estado deshabilitado tras envío (0.3h)
- [ ] **5.4** Agregar soporte para mostrar imagen opcional en statement (0.4h)
- [ ] **5.5** Test visual en mobile y desktop (0.3h)

### Testing y QA (3.2h - 20%)

#### 6. Tests (3.2h)
- [ ] **6.1** Test unitario: validar respuesta verdadera correcta (0.4h)
- [ ] **6.2** Test unitario: validar respuesta falsa correcta (0.4h)
- [ ] **6.3** Test unitario: validar respuesta incorrecta (0.4h)
- [ ] **6.4** Test: otorgamiento de XP por respuesta correcta (0.4h)
- [ ] **6.5** Test frontend: renderizado de botones V/F (0.4h)
- [ ] **6.6** Test frontend: selección y cambio de estado (0.4h)
- [ ] **6.7** Test E2E: flujo completo V/F (0.4h)
- [ ] **6.8** Test: mostrar explicación tras respuesta (0.4h)

### Deploy y Datos (0.8h - 5%)

#### 7. Seed Data (0.8h)
- [ ] **7.1** Crear 10+ preguntas V/F sobre cultura Maya (0.5h)
- [ ] **7.2** Agregar preguntas al seed data de actividades (0.2h)
- [ ] **7.3** Verificar balance de respuestas verdaderas/falsas (0.1h)

---

**Total Estimado:** 16h (4 SP × 4h)
**Desglose:** Backend 40% | Frontend 35% | Testing 20% | Deploy 5%

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
