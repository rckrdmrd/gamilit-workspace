# US-ACT-006: Mecánicas intermedias - Asociación

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 4
**Story Points:** 7 SP
**Presupuesto:** $2,600 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **conectar elementos relacionados** para **demostrar comprensión de relaciones entre conceptos**.

**Contexto del Alcance Inicial:**
Mecánica de matching/emparejamiento. El estudiante conecta items de columna A con columna B mediante líneas o clicks. Hardcodeada en BD.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se muestran dos columnas de items
- [ ] **CA-02:** El estudiante hace click en un item de cada columna para emparejar
- [ ] **CA-03:** Se muestra línea visual conectando los pares
- [ ] **CA-04:** Se puede deshacer un emparejamiento
- [ ] **CA-05:** Validación de todos los pares
- [ ] **CA-06:** Feedback muestra pares correctos/incorrectos
- [ ] **CA-07:** Responsive en mobile (sin líneas, usa botones)

---

## Especificaciones Técnicas

### Backend

```typescript
interface MatchingContent {
  instructions: string
  leftColumn: Array<{
    id: string
    content: string
  }>
  rightColumn: Array<{
    id: string
    content: string
  }>
  correctPairs: Array<{
    leftId: string
    rightId: string
  }>
  explanation: string
}

// Validación
private validateMatching(
  content: MatchingContent,
  userAnswer: { pairs: Array<{ leftId: string, rightId: string }> }
): boolean {
  if (userAnswer.pairs.length !== content.correctPairs.length) return false

  return content.correctPairs.every(correctPair =>
    userAnswer.pairs.some(
      userPair => userPair.leftId === correctPair.leftId && userPair.rightId === correctPair.rightId
    )
  )
}
```

### Frontend

```typescript
export function MatchingActivity({ activity }) {
  const [pairs, setPairs] = useState<Array<{ leftId: string, rightId: string }>>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)

  const handleLeftClick = (id: string) => {
    setSelectedLeft(id)
    if (selectedRight) {
      addPair(id, selectedRight)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const handleRightClick = (id: string) => {
    setSelectedRight(id)
    if (selectedLeft) {
      addPair(selectedLeft, id)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const addPair = (leftId: string, rightId: string) => {
    // Remove existing pairs with these items
    const filteredPairs = pairs.filter(
      p => p.leftId !== leftId && p.rightId !== rightId
    )
    setPairs([...filteredPairs, { leftId, rightId }])
  }

  return (
    <Card>
      <h2>{activity.title}</h2>
      <p>{activity.content.instructions}</p>

      <div className="grid grid-cols-2 gap-8 my-6">
        {/* Left Column */}
        <div className="space-y-3">
          {activity.content.leftColumn.map(item => {
            const isPaired = pairs.some(p => p.leftId === item.id)
            const isSelected = selectedLeft === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  isSelected ? 'border-maya-green-500 bg-maya-green-50' :
                  isPaired ? 'border-green-300 bg-green-50' :
                  'border-gray-300 hover:border-maya-green-300'
                }`}
              >
                {item.content}
              </button>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {activity.content.rightColumn.map(item => {
            const isPaired = pairs.some(p => p.rightId === item.id)
            const isSelected = selectedRight === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  isSelected ? 'border-maya-green-500 bg-maya-green-50' :
                  isPaired ? 'border-green-300 bg-green-50' :
                  'border-gray-300 hover:border-maya-green-300'
                }`}
              >
                {item.content}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pares actuales */}
      {pairs.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Pares creados:</h3>
          <div className="space-y-1">
            {pairs.map((pair, index) => {
              const left = activity.content.leftColumn.find(i => i.id === pair.leftId)
              const right = activity.content.rightColumn.find(i => i.id === pair.rightId)
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span>{left?.content}</span>
                  <span className="text-maya-green-500">↔</span>
                  <span>{right?.content}</span>
                  <button
                    onClick={() => setPairs(pairs.filter((_, i) => i !== index))}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={pairs.length !== activity.content.correctPairs.length}
        >
          Verificar
        </Button>
      )}
    </Card>
  )
}
```

### Seed Data

```typescript
{
  title: 'Relacionar números mayas con valores',
  type: ActivityType.MATCHING,
  content: {
    instructions: 'Conecta cada símbolo maya con su valor decimal',
    leftColumn: [
      { id: 'l1', content: '● (un punto)' },
      { id: 'l2', content: '━ (una barra)' },
      { id: 'l3', content: '●●● (tres puntos)' },
      { id: 'l4', content: '━━ (dos barras)' },
    ],
    rightColumn: [
      { id: 'r1', content: '10' },
      { id: 'r2', content: '1' },
      { id: 'r3', content: '5' },
      { id: 'r4', content: '3' },
    ],
    correctPairs: [
      { leftId: 'l1', rightId: 'r2' }, // 1 punto = 1
      { leftId: 'l2', rightId: 'r3' }, // 1 barra = 5
      { leftId: 'l3', rightId: 'r4' }, // 3 puntos = 3
      { leftId: 'l4', rightId: 'r1' }, // 2 barras = 10
    ],
    explanation: 'Cada punto vale 1 y cada barra vale 5 en el sistema numérico maya.'
  },
  xpReward: 18,
  coinsReward: 8
}
```

---

## Dependencias

**Antes:** US-ACT-001 (Infraestructura)

---

## Definición de Hecho (DoD)

- [x] Emparejamiento funcional
- [x] Feedback visual
- [x] Validación de pares
- [x] Deshacer pares
- [x] Seed data con 5+ actividades
- [x] Responsive

---

## Notas

- ✅ Sin dibujar líneas (simplificado con clicks)
- ⚠️ **Extensión futura:** EXT-019 (líneas SVG conectando pares)

---

## Estimación

**Desglose (7 SP = ~2.5 días):**
- Backend: 0.5 días
- Frontend: 1.5 días
- Testing: 0.5 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
