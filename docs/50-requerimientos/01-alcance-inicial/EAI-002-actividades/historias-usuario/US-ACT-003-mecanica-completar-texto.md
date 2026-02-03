---
id: "US-ACT-003"
title: "Mecánicas básicas - Completar texto"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-002"
story_points: 5
budget: "$1,800 MXN"
sprint: "Sprint-1"
labels: ["actividades", "mecanica", "fill-blank", "fullstack"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ACT-003: Mecánicas básicas - Completar texto

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 3
**Story Points:** 5 SP
**Presupuesto:** $1,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripción

Como **estudiante**, quiero **completar espacios en blanco en oraciones o párrafos** para **demostrar que conozco términos y conceptos específicos**.

**Contexto del Alcance Inicial:**
Mecánica que requiere input de texto libre. El sistema valida la respuesta contra múltiples respuestas correctas posibles (sinónimos, variaciones). Hardcodeada en BD.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se muestra un texto con espacios en blanco (marcados con ___)
- [ ] **CA-02:** Se proporciona un campo de texto para cada espacio
- [ ] **CA-03:** El estudiante escribe su respuesta
- [ ] **CA-04:** La validación es case-insensitive
- [ ] **CA-05:** Se aceptan múltiples respuestas correctas (sinónimos)
- [ ] **CA-06:** Se ignoran espacios extra al inicio/final
- [ ] **CA-07:** Se muestra feedback con la(s) respuesta(s) correcta(s)
- [ ] **CA-08:** Se otorgan XP y monedas
- [ ] **CA-09:** Se permite ver la respuesta correcta si falla

---

## Especificaciones Técnicas

### Backend

**Content Type:**
```typescript
interface FillBlankContent {
  text: string // "Los mayas usaban un sistema numérico ___"
  blanks: Array<{
    id: string
    position: number // Posición del blank en el texto
    acceptedAnswers: string[] // ['vigesimal', 'de base 20', 'base 20']
  }>
  explanation: string
}
```

**Validación:**
```typescript
class ActivitiesService {
  private validateFillBlank(
    content: FillBlankContent,
    userAnswer: { answers: Record<string, string> } // { blank1: 'vigesimal' }
  ): boolean {
    return content.blanks.every(blank => {
      const userInput = userAnswer.answers[blank.id]?.trim().toLowerCase()
      return blank.acceptedAnswers.some(
        accepted => accepted.toLowerCase() === userInput
      )
    })
  }
}
```

### Frontend

**Componente:**
```typescript
// components/activities/FillBlankActivity.tsx
export function FillBlankActivity({ activity, onComplete }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const renderTextWithBlanks = () => {
    const parts = activity.content.text.split('___')
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <input
            type="text"
            value={answers[`blank${index}`] || ''}
            onChange={(e) => setAnswers({
              ...answers,
              [`blank${index}`]: e.target.value
            })}
            disabled={submitted}
            className={`inline-block mx-2 px-3 py-1 border-b-2 ${
              submitted
                ? feedback.isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-maya-green-500 focus:border-maya-green-700'
            }`}
            placeholder="___"
          />
        )}
      </span>
    ))
  }

  return (
    <Card>
      <h2>{activity.title}</h2>
      <div className="text-lg leading-relaxed mb-6">
        {renderTextWithBlanks()}
      </div>

      {!submitted ? (
        <Button onClick={handleSubmit}>
          Verificar
        </Button>
      ) : (
        <FeedbackSection
          feedback={feedback}
          correctAnswers={activity.content.blanks}
          onContinue={onComplete}
        />
      )}
    </Card>
  )
}
```

### Seed Data

```typescript
const fillBlankActivities = [
  {
    moduleId: 'modulo-numeros-mayas',
    title: 'Sistema numérico maya',
    type: ActivityType.FILL_BLANK,
    content: {
      text: 'Los mayas desarrollaron un sistema numérico ___, es decir, basado en el número ___. En este sistema, una barra representa el número ___ y un punto representa ___.',
      blanks: [
        { id: 'blank0', position: 0, acceptedAnswers: ['vigesimal', 'de base 20', 'base 20'] },
        { id: 'blank1', position: 1, acceptedAnswers: ['20', 'veinte'] },
        { id: 'blank2', position: 2, acceptedAnswers: ['5', 'cinco'] },
        { id: 'blank3', position: 3, acceptedAnswers: ['1', 'uno', 'la unidad'] }
      ],
      explanation: 'El sistema vigesimal maya (base 20) utiliza barras (valor 5) y puntos (valor 1) para representar números.'
    },
    order: 3,
    xpReward: 15,
    coinsReward: 7
  }
]
```

---

## Dependencias

**Antes:**
- US-ACT-001 (Infraestructura base)

**Después:**
- Amplía variedad de mecánicas educativas

---

## Definición de Hecho (DoD)

- [x] Validación con múltiples respuestas aceptadas
- [x] Case-insensitive validation
- [x] Componente con inputs inline
- [x] Feedback muestra respuestas correctas
- [x] Seed data con 5+ actividades
- [x] Tests de validación

---

## Notas del Alcance Inicial

- Done Validación simple (igualdad exacta)
- Done Sin validación semántica con IA
- Done Sin autocompletado
- **Extensión futura:** EXT-018-AIValidation (validación semántica con NLP)

---

## Estimación

**Desglose (5 SP = ~1.75 días):**
- Backend: validación: 0.5 días
- Frontend: inputs inline: 0.75 días
- Seed data: 0.25 días
- Testing: 0.25 días

---

## Tareas de Implementación

### Backend (8h - 40%)

#### 1. Tipos y Estructuras (2.4h)
- [ ] **1.1** Definir interfaz `FillBlankContent` con: text, blanks[], explanation (0.5h)
- [ ] **1.2** Definir tipo `Blank` con: id, position, acceptedAnswers[] (0.4h)
- [ ] **1.3** Crear tipo para `userAnswer`: Record<string, string> (0.3h)
- [ ] **1.4** Extender enum ActivityType con `FILL_BLANK` (0.2h)
- [ ] **1.5** Crear DTOs de validación con class-validator (0.6h)
- [ ] **1.6** Documentar estructura en README técnico (0.4h)

#### 2. Lógica de Validación (3.6h)
- [ ] **2.1** Implementar método `validateFillBlank()` con case-insensitive (1.2h)
- [ ] **2.2** Implementar normalización de strings (trim, toLowerCase) (0.6h)
- [ ] **2.3** Implementar validación de múltiples respuestas aceptadas (0.8h)
- [ ] **2.4** Agregar lógica para verificar todos los blanks completados (0.5h)
- [ ] **2.5** Implementar extracción de respuestas correctas para feedback (0.5h)

#### 3. Integración y Tests (2h)
- [ ] **3.1** Integrar validación FILL_BLANK en `submitAnswer()` (0.6h)
- [ ] **3.2** Test unitario: validación case-insensitive (0.4h)
- [ ] **3.3** Test unitario: múltiples respuestas aceptadas (0.4h)
- [ ] **3.4** Test: validación con espacios extra (0.3h)
- [ ] **3.5** Test integración: endpoint con fill-blank activity (0.3h)

### Frontend (7h - 35%)

#### 4. Componente Principal (4.2h)
- [ ] **4.1** Crear componente `FillBlankActivity.tsx` con estructura base (0.8h)
- [ ] **4.2** Implementar estado: answers (Record), submitted, feedback (0.5h)
- [ ] **4.3** Implementar función `renderTextWithBlanks()` para parsear "___" (1.5h)
- [ ] **4.4** Crear inputs inline con estilos dinámicos (correcto/incorrecto) (1h)
- [ ] **4.5** Integrar componente FeedbackSection con respuestas correctas (0.4h)

#### 5. Interactividad y UX (2.8h)
- [ ] **5.1** Implementar lógica de actualización de answers con onChange (0.6h)
- [ ] **5.2** Agregar placeholders visuales para inputs vacíos (0.4h)
- [ ] **5.3** Deshabilitar inputs tras envío (0.3h)
- [ ] **5.4** Implementar autofocus en primer input (0.3h)
- [ ] **5.5** Agregar contador de blanks completados / total (0.5h)
- [ ] **5.6** Implementar responsive: inputs apilados en mobile (0.4h)
- [ ] **5.7** Agregar animaciones de feedback (0.3h)

### Testing y QA (4h - 20%)

#### 6. Tests Backend (2h)
- [ ] **6.1** Test: validación correcta con respuesta exacta (0.4h)
- [ ] **6.2** Test: validación case-insensitive (0.3h)
- [ ] **6.3** Test: aceptación de sinónimos (0.4h)
- [ ] **6.4** Test: rechazo de respuesta incorrecta (0.3h)
- [ ] **6.5** Test: validación con espacios extra (0.3h)
- [ ] **6.6** Test: validación de múltiples blanks (0.3h)

#### 7. Tests Frontend (2h)
- [ ] **7.1** Test: renderizado de texto con blanks (0.5h)
- [ ] **7.2** Test: actualización de estado al escribir (0.4h)
- [ ] **7.3** Test: feedback muestra respuestas correctas (0.4h)
- [ ] **7.4** Test: deshabilitar inputs tras envío (0.3h)
- [ ] **7.5** Test E2E: flujo completo fill-blank (0.4h)

### Deploy y Datos (1h - 5%)

#### 8. Seed Data (1h)
- [ ] **8.1** Crear 5+ actividades de completar texto sobre cultura Maya (0.6h)
- [ ] **8.2** Definir múltiples respuestas aceptadas por blank (sinónimos) (0.3h)
- [ ] **8.3** Validar coherencia de textos y respuestas (0.1h)

---

**Total Estimado:** 20h (5 SP x 4h)
**Desglose:** Backend 40% | Frontend 35% | Testing 20% | Deploy 5%

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-04
**Responsable:** Equipo Fullstack
