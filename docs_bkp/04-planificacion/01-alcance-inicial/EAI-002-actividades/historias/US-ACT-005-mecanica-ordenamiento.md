# US-ACT-005: Mecánicas intermedias - Ordenamiento

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 4
**Story Points:** 7 SP
**Presupuesto:** $2,600 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **ordenar elementos en una secuencia correcta** para **demostrar comprensión de procesos, cronologías y jerarquías**.

**Contexto del Alcance Inicial:**
Mecánica para ordenar items en secuencia (cronológica, numérica, jerárquica). Usa drag & drop vertical. Hardcodeada en BD.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se muestran items desordenados
- [ ] **CA-02:** Los items se pueden reordenar arrastrando
- [ ] **CA-03:** Indicador visual de orden actual
- [ ] **CA-04:** Validación de secuencia completa
- [ ] **CA-05:** Feedback muestra orden correcto
- [ ] **CA-06:** Touch support móvil
- [ ] **CA-07:** Botón para resetear orden

---

## Especificaciones Técnicas

### Backend

```typescript
interface OrderingContent {
  instructions: string
  items: Array<{
    id: string
    content: string
    correctPosition: number // 0-indexed
  }>
  explanation: string
}

// Validación
private validateOrdering(
  content: OrderingContent,
  userAnswer: { order: string[] } // Array de IDs en orden del usuario
): boolean {
  const correctOrder = content.items
    .sort((a, b) => a.correctPosition - b.correctPosition)
    .map(item => item.id)

  return JSON.stringify(correctOrder) === JSON.stringify(userAnswer.order)
}
```

### Frontend

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'

function SortableItem({ id, content }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  return (
    <div ref={setNodeRef} style={{ transform, transition }} {...attributes} {...listeners}
      className="p-4 bg-white border rounded-lg cursor-move hover:shadow-md"
    >
      {content}
    </div>
  )
}

export function OrderingActivity({ activity }) {
  const [items, setItems] = useState(shuffleArray(activity.content.items))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 mb-2">
            <span className="text-gray-500 font-mono">{index + 1}</span>
            <SortableItem {...item} />
          </div>
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Seed Data

```typescript
{
  title: 'Orden cronológico de civilización Maya',
  type: ActivityType.ORDERING,
  content: {
    instructions: 'Ordena estos períodos de la civilización Maya cronológicamente',
    items: [
      { id: '1', content: 'Período Preclásico (2000 a.C. - 250 d.C.)', correctPosition: 0 },
      { id: '2', content: 'Período Clásico (250 - 900 d.C.)', correctPosition: 1 },
      { id: '3', content: 'Período Posclásico (900 - 1500 d.C.)', correctPosition: 2 },
    ],
    explanation: 'La civilización Maya se divide en tres períodos principales...'
  },
  xpReward: 18,
  coinsReward: 8
}
```

---

## Dependencias

**Antes:** US-ACT-004 (Reutiliza @dnd-kit)

---

## Definición de Hecho (DoD)

- [x] Sorting funcional
- [x] Validación de orden
- [x] Shuffle inicial aleatorio
- [x] Seed data con 5+ actividades
- [x] Tests

---

## Estimación

**Desglose (7 SP = ~2.5 días):**
- Backend: 0.5 días
- Frontend: 1.5 días
- Testing: 0.5 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
