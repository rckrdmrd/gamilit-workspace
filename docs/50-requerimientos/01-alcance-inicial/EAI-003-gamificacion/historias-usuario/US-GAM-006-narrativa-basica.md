---
id: "US-GAM-006"
title: "Narrativa basica"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003"
story_points: 6
budget: "$2,200 MXN"
sprint: "Sprint-1"
labels: ["gamificacion", "narrativa", "alcance-inicial"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-GAM-006: Narrativa basica

**Epica:** EAI-003 - Gamificacion Basica
**Sprint:** Mes 1, Semana 4
**Story Points:** 6 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Media (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripcion

Como **estudiante**, quiero **experimentar una narrativa motivacional** para **sentirme parte de una historia mientras aprendo**.

**Contexto del Alcance Inicial:**
Narrativa simple pre-escrita. Mensajes entre modulos y logros que cuentan una historia basica de descubrimiento de la cultura Maya. NO usa IA.

---

## Criterios de Aceptacion

- [ ] **CA-01:** Mensajes narrativos al inicio de cada modulo
- [ ] **CA-02:** Mensajes al completar modulos
- [ ] **CA-03:** Storyline lineal pre-escrita
- [ ] **CA-04:** Personaje guia (ej: "Ixchel, guardiana del conocimiento")
- [ ] **CA-05:** Los mensajes contextualizan el aprendizaje
- [ ] **CA-06:** Progresion narrativa visible
- [ ] **CA-07:** Mensajes formatados con estilo Maya

---

## Especificaciones Tecnicas

### Backend

```typescript
@Entity('narrative_messages')
class NarrativeMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'enum', enum: ['module_start', 'module_complete', 'rank_up', 'milestone'] })
  triggerType: string

  @Column({ nullable: true })
  triggerId: string // moduleId, rank, etc.

  @Column()
  character: string // 'Ixchel'

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'int', default: 0 })
  order: number // Para secuencia narrativa
}

// Seed data - Ejemplo
const NARRATIVE_SEED = [
  {
    triggerType: 'module_start',
    triggerId: 'numeros-mayas',
    character: 'Ixchel',
    message: '¡Bienvenido, joven aprendiz! Soy Ixchel, guardiana del conocimiento ancestral maya. Hoy comenzaras tu viaje descubriendo nuestro sistema numerico, una de las creaciones mas ingeniosas de nuestra civilizacion.',
    order: 1
  },
  {
    triggerType: 'module_complete',
    triggerId: 'numeros-mayas',
    character: 'Ixchel',
    message: '¡Excelente! Has dominado los numeros mayas. Los antiguos sabios estarian orgullosos. Ahora estas listo para explorar nuestro calendario, un sistema que media el tiempo con precision asombrosa.',
    order: 2
  },
  {
    triggerType: 'rank_up',
    triggerId: 'aprendiz',
    character: 'Ixchel',
    message: 'Tu dedicacion no pasa desapercibida. Has alcanzado el rango de Aprendiz. Como los jovenes mayas en las escuelas del saber, comienzas a comprender los secretos de nuestra cultura.',
    order: null
  },
  {
    triggerType: 'module_start',
    triggerId: 'calendario-haab',
    character: 'Ixchel',
    message: 'Preparate para conocer el Haab, nuestro calendario solar de 365 dias. Descubriras como nuestros ancestros median el ciclo del sol con precision matematica.',
    order: 3
  }
]

class NarrativeService {
  async getMessage(triggerType: string, triggerId?: string) {
    const message = await this.narrativeMessagesRepository.findOne({
      where: { triggerType, triggerId }
    })

    return message
  }

  async getStoryProgress(userId: string) {
    // Obtener modulos completados
    const completedModules = await this.moduleProgressRepository.find({
      where: { userId },
      order: { completedAt: 'ASC' }
    })

    // Obtener mensajes vistos
    const messages = []
    for (const module of completedModules) {
      const startMsg = await this.getMessage('module_start', module.moduleId)
      const completeMsg = await this.getMessage('module_complete', module.moduleId)

      if (startMsg) messages.push(startMsg)
      if (completeMsg) messages.push(completeMsg)
    }

    return {
      messagesCount: messages.length,
      currentChapter: Math.floor(completedModules.length / 2) + 1,
      messages: messages.sort((a, b) => a.order - b.order)
    }
  }
}
```

**Endpoints:**
```
GET /api/narrative/message/:triggerType/:triggerId?
- Response: { character, message }

GET /api/narrative/story-progress
- Response: { messagesCount, currentChapter, messages: [...] }
```

### Frontend

```typescript
// components/narrative/NarrativeMessage.tsx
export function NarrativeMessage({ character, message, onClose }) {
  return (
    <div className="bg-gradient-to-br from-maya-terracota-50 to-maya-gold-50 border-2 border-maya-terracota-300 rounded-lg p-6 mb-6">
      {/* Avatar del personaje */}
      <div className="flex items-start gap-4">
        <img
          src="/images/characters/ixchel.png"
          alt={character}
          className="w-16 h-16 rounded-full border-2 border-maya-terracota-400"
        />

        <div className="flex-1">
          <p className="font-bold text-maya-terracota-700 mb-2">{character}</p>
          <p className="text-gray-700 leading-relaxed italic">
            "{message}"
          </p>
        </div>
      </div>

      {onClose && (
        <Button onClick={onClose} variant="ghost" className="mt-4">
          Continuar
        </Button>
      )}
    </div>
  )
}

// En ModuleDetailPage
export function ModuleDetailPage() {
  const [showNarrative, setShowNarrative] = useState(false)
  const [narrativeMessage, setNarrativeMessage] = useState(null)

  useEffect(() => {
    loadNarrativeMessage()
  }, [moduleId])

  const loadNarrativeMessage = async () => {
    const message = await narrativeService.getMessage('module_start', moduleId)
    if (message) {
      setNarrativeMessage(message)
      setShowNarrative(true)
    }
  }

  return (
    <div>
      {showNarrative && narrativeMessage && (
        <NarrativeMessage
          {...narrativeMessage}
          onClose={() => setShowNarrative(false)}
        />
      )}

      {/* Resto del modulo */}
    </div>
  )
}

// Story Progress Page
export function StoryProgressPage() {
  const [progress, setProgress] = useState(null)

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tu Viaje</h1>

      <div className="mb-6">
        <p className="text-gray-600">
          Capitulo {progress.currentChapter} • {progress.messagesCount} mensajes recibidos
        </p>
      </div>

      <div className="space-y-4">
        {progress.messages.map((message, index) => (
          <NarrativeMessage key={index} {...message} />
        ))}
      </div>
    </div>
  )
}
```

---

## Dependencias

**Antes:** US-ACT-008 (Navegacion modulos)

---

## Definicion de Hecho (DoD)

- [x] Mensajes narrativos en BD
- [x] Trigger al inicio/fin de modulos
- [x] Personaje guia diseñado
- [x] Storyline coherente
- [x] Pagina de progreso narrativo
- [x] Tests

---

## Notas

- Done Narrativa lineal pre-escrita
- Done Sin ramificaciones ni decisiones
- Done Sin generacion con IA
- **Extension futura:** EXT-027-DynamicNarrative (IA genera narrativa personalizada)

---

## Estimacion

**Desglose (6 SP = ~2 dias):**
- Backend: 0.5 dias
- Frontend: 0.75 dias
- Escritura de narrativa: 0.5 dias
- Diseño personaje: 0.25 dias

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack + Content Writer
