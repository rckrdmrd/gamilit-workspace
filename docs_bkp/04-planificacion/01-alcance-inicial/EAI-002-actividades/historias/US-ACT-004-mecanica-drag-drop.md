# US-ACT-004: Mecánicas intermedias - Drag & Drop

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 3-4
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **arrastrar y soltar elementos en posiciones correctas** para **aprender de forma interactiva y visual**.

**Contexto del Alcance Inicial:**
Mecánica interactiva que requiere librería de drag & drop. Los estudiantes arrastran elementos (imágenes, textos) a zonas específicas. Ideal para clasificación, organización espacial, etc.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se muestran elementos arrastrables
- [ ] **CA-02:** Se definen zonas de destino (drop zones)
- [ ] **CA-03:** Los elementos se pueden arrastrar con mouse
- [ ] **CA-04:** Los elementos se pueden arrastrar con touch (mobile)
- [ ] **CA-05:** Feedback visual al arrastrar (elemento levanta, zona resalta)
- [ ] **CA-06:** Validación de posiciones correctas
- [ ] **CA-07:** Se puede resetear para intentar de nuevo
- [ ] **CA-08:** Animaciones suaves de drop
- [ ] **CA-09:** Responsive en mobile y desktop

---

## Especificaciones Técnicas

### Backend

**Content Type:**
```typescript
interface DragDropContent {
  instructions: string
  draggableItems: Array<{
    id: string
    content: string // Texto o URL de imagen
    type: 'text' | 'image'
  }>
  dropZones: Array<{
    id: string
    label: string
    correctItemIds: string[] // IDs de items que pertenecen aquí
  }>
  explanation: string
}
```

**Validación:**
```typescript
class ActivitiesService {
  private validateDragDrop(
    content: DragDropContent,
    userAnswer: { placements: Record<string, string> } // { itemId: zoneId }
  ): boolean {
    // Verificar que cada item esté en la zona correcta
    return content.draggableItems.every(item => {
      const userZone = userAnswer.placements[item.id]
      const correctZone = content.dropZones.find(zone =>
        zone.correctItemIds.includes(item.id)
      )
      return correctZone?.id === userZone
    })
  }
}
```

### Frontend

**Librería:** `@dnd-kit/core` (React drag & drop moderna)

**Componente:**
```typescript
// components/activities/DragDropActivity.tsx
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core'

function DraggableItem({ id, content, type }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      {type === 'image' ? (
        <img src={content} alt="Draggable" className="w-full h-auto" />
      ) : (
        <p>{content}</p>
      )}
    </div>
  )
}

function DropZone({ id, label, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? 'border-maya-green-500 bg-maya-green-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <p className="font-medium text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export function DragDropActivity({ activity, onComplete }) {
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over) {
      setPlacements({ ...placements, [active.id]: over.id })
    }
  }

  const handleSubmit = async () => {
    const response = await activitiesService.submitAnswer(activity.id, { placements })
    setFeedback(response)
    setSubmitted(true)
  }

  return (
    <Card>
      <h2>{activity.title}</h2>
      <p>{activity.content.instructions}</p>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Items sin colocar */}
          <div>
            <h3 className="font-medium mb-3">Elementos</h3>
            <div className="space-y-2">
              {activity.content.draggableItems
                .filter(item => !placements[item.id])
                .map(item => (
                  <DraggableItem key={item.id} {...item} />
                ))
              }
            </div>
          </div>

          {/* Drop zones */}
          <div className="space-y-4">
            {activity.content.dropZones.map(zone => (
              <DropZone key={zone.id} id={zone.id} label={zone.label}>
                {activity.content.draggableItems
                  .filter(item => placements[item.id] === zone.id)
                  .map(item => (
                    <DraggableItem key={item.id} {...item} />
                  ))
                }
              </DropZone>
            ))}
          </div>
        </div>

        {!submitted && (
          <Button onClick={handleSubmit} disabled={
            Object.keys(placements).length !== activity.content.draggableItems.length
          }>
            Verificar
          </Button>
        )}
      </DndContext>

      {submitted && <FeedbackSection feedback={feedback} onContinue={onComplete} />}
    </Card>
  )
}
```

### Seed Data

```typescript
const dragDropActivities = [
  {
    moduleId: 'modulo-numeros-mayas',
    title: 'Clasificar símbolos numéricos',
    type: ActivityType.DRAG_DROP,
    content: {
      instructions: 'Arrastra cada símbolo a su valor correspondiente',
      draggableItems: [
        { id: 'item1', content: '/images/maya/punto.png', type: 'image' },
        { id: 'item2', content: '/images/maya/barra.png', type: 'image' },
        { id: 'item3', content: '/images/maya/concha.png', type: 'image' },
      ],
      dropZones: [
        { id: 'zone1', label: 'Valor: 1', correctItemIds: ['item1'] },
        { id: 'zone2', label: 'Valor: 5', correctItemIds: ['item2'] },
        { id: 'zone3', label: 'Valor: 0', correctItemIds: ['item3'] },
      ],
      explanation: 'En el sistema maya: punto = 1, barra = 5, concha = 0'
    },
    order: 4,
    xpReward: 20,
    coinsReward: 10
  }
]
```

---

## Dependencias

**Antes:**
- US-ACT-001 (Infraestructura)
- US-FUND-008 (UI/UX base)

**Librería:** `@dnd-kit/core`, `@dnd-kit/sortable`

---

## Definición de Hecho (DoD)

- [x] Drag & drop funcional en desktop
- [x] Touch support en mobile
- [x] Animaciones suaves
- [x] Validación de posiciones
- [x] Feedback visual
- [x] Seed data con 5+ actividades
- [x] Tests E2E de interacción

---

## Notas del Alcance Inicial

- ✅ Drag & drop básico
- ✅ Sin multi-drag (arrastrar varios a la vez)
- ✅ Sin restricciones de cantidad por zona
- ⚠️ **Extensión futura:** EXT-019-AdvancedInteractions

---

## Estimación

**Desglose (8 SP = ~3 días):**
- Backend: validación: 0.5 días
- Frontend: integración @dnd-kit: 1.5 días
- Touch/responsive: 0.5 días
- Seed data: 0.25 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
