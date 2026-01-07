---
id: "US-GAM-004"
title: "Sistema de ayudas"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003"
story_points: 7
budget: "$2,600 MXN"
sprint: "Sprint-1"
labels: ["gamification", "helps", "hints", "coins"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-16"
---

# US-GAM-004: Sistema de ayudas

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 3
**Story Points:** 7 SP
**Presupuesto:** $2,600 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **estudiante**, quiero **usar ayudas durante actividades difíciles** para **facilitar mi aprendizaje gastando monedas**.

**Contexto del Alcance Inicial:**
3 tipos de ayudas con costos fijos en monedas. Solo disponibles en actividades de opción múltiple y verdadero/falso.

---

## Criterios de Aceptación

- [ ] **CA-01:** 3 ayudas: Pista (5 coins), Eliminar opción (10 coins), Tiempo extra (15 coins)
- [ ] **CA-02:** Botones de ayudas visibles durante actividad
- [ ] **CA-03:** Se muestra costo en monedas
- [ ] **CA-04:** Confirmación antes de usar (gastar monedas)
- [ ] **CA-05:** Ayuda "Pista" muestra hint educativo
- [ ] **CA-06:** Ayuda "Eliminar opción" tacha 1-2 opciones incorrectas
- [ ] **CA-07:** Ayuda "Tiempo extra" agrega +30 segundos (si hay timer)
- [ ] **CA-08:** No se pueden usar si no hay monedas suficientes
- [ ] **CA-09:** Máximo 1 ayuda de cada tipo por actividad
- [ ] **CA-10:** Se registra uso de ayudas en analytics

---

## Especificaciones Técnicas

### Backend

```typescript
enum HelpType {
  HINT = 'hint',
  REMOVE_OPTION = 'remove_option',
  EXTRA_TIME = 'extra_time'
}

const HELP_COSTS = {
  [HelpType.HINT]: 5,
  [HelpType.REMOVE_OPTION]: 10,
  [HelpType.EXTRA_TIME]: 15
}

@Entity('help_usage')
class HelpUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  activityId: string

  @Column({ type: 'enum', enum: HelpType })
  helpType: HelpType

  @Column({ type: 'int' })
  coinsCost: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  usedAt: Date
}

class HelpService {
  async useHelp(userId: string, activityId: string, helpType: HelpType) {
    // Verificar que no se haya usado antes en esta actividad
    const existingUsage = await this.helpUsageRepository.findOne({
      where: { userId, activityId, helpType }
    })

    if (existingUsage) {
      throw new BadRequestException('Help already used in this activity')
    }

    const cost = HELP_COSTS[helpType]

    // Gastar monedas
    await this.coinsService.spendCoins(userId, cost, 'help_used')

    // Registrar uso
    await this.helpUsageRepository.save({
      userId, activityId, helpType, coinsCost: cost
    })

    // Retornar resultado según tipo
    switch (helpType) {
      case HelpType.HINT:
        return await this.getHint(activityId)

      case HelpType.REMOVE_OPTION:
        return await this.getOptionsToRemove(activityId)

      case HelpType.EXTRA_TIME:
        return { extraSeconds: 30 }
    }
  }

  private async getHint(activityId: string) {
    const activity = await this.activitiesRepository.findOne({ where: { id: activityId } })
    return { hint: activity.content.hint || 'No hay pista disponible' }
  }

  private async getOptionsToRemove(activityId: string) {
    const activity = await this.activitiesRepository.findOne({ where: { id: activityId } })

    if (activity.type !== ActivityType.MULTIPLE_CHOICE) {
      throw new BadRequestException('Help not available for this activity type')
    }

    const incorrectOptions = activity.content.options
      .filter(opt => !opt.isCorrect)
      .slice(0, 2) // Eliminar hasta 2 opciones incorrectas

    return { optionsToRemove: incorrectOptions.map(o => o.id) }
  }
}
```

**Endpoints:**
```
POST /api/activities/:activityId/help/use
- Body: { helpType: 'hint' | 'remove_option' | 'extra_time' }
- Response: { hint?, optionsToRemove?, extraSeconds? }

GET /api/activities/:activityId/help/available
- Response: {
    helps: [
      { type: 'hint', cost: 5, used: false, available: true },
      { type: 'remove_option', cost: 10, used: false, available: true },
      { type: 'extra_time', cost: 15, used: true, available: false }
    ],
    userCoins: 45
  }
```

### Frontend

```typescript
// components/activities/HelpButtons.tsx
export function HelpButtons({ activityId, userCoins, onHelpUsed }) {
  const [helps, setHelps] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAvailableHelps()
  }, [activityId])

  const handleUseHelp = async (helpType: HelpType) => {
    const help = helps.find(h => h.type === helpType)

    if (userCoins < help.cost) {
      toast.error('No tienes suficientes monedas')
      return
    }

    if (!window.confirm(`¿Usar ${help.type} por ${help.cost} monedas?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await activitiesService.useHelp(activityId, helpType)
      onHelpUsed(helpType, result)
      await loadAvailableHelps() // Recargar disponibilidad
      toast.success('Ayuda aplicada')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 mb-4">
      {helps.map(help => (
        <button
          key={help.type}
          onClick={() => handleUseHelp(help.type)}
          disabled={help.used || userCoins < help.cost || loading}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            help.used
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              : userCoins < help.cost
              ? 'bg-red-50 border-red-300 text-red-400 cursor-not-allowed'
              : 'bg-maya-gold-50 border-maya-gold-300 text-maya-gold-700 hover:bg-maya-gold-100'
          }`}
          title={help.used ? 'Ya usaste esta ayuda' : `Cuesta ${help.cost} monedas`}
        >
          {getHelpIcon(help.type)} {help.cost} 💰
        </button>
      ))}
    </div>
  )
}

function getHelpIcon(type: HelpType) {
  const icons = {
    hint: '💡',
    remove_option: '❌',
    extra_time: '⏰'
  }
  return icons[type]
}

// Uso en MultipleChoiceActivity
export function MultipleChoiceActivity({ activity }) {
  const [removedOptions, setRemovedOptions] = useState<string[]>([])
  const [hint, setHint] = useState<string | null>(null)

  const handleHelpUsed = (helpType: HelpType, result: any) => {
    if (helpType === 'hint') {
      setHint(result.hint)
    } else if (helpType === 'remove_option') {
      setRemovedOptions(result.optionsToRemove)
    }
  }

  return (
    <Card>
      <HelpButtons
        activityId={activity.id}
        userCoins={userCoins}
        onHelpUsed={handleHelpUsed}
      />

      {hint && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="text-blue-800">{hint}</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {activity.content.options.map(option => (
          <label
            key={option.id}
            className={`
              ${removedOptions.includes(option.id) ? 'opacity-30 line-through cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              disabled={removedOptions.includes(option.id)}
              // ...
            />
            {option.text}
          </label>
        ))}
      </div>
    </Card>
  )
}
```

### Actualización de Content

```typescript
interface MultipleChoiceContent {
  question: string
  options: Array<{ id, text, isCorrect }>
  explanation: string
  hint?: string // NUEVO: pista educativa
  imageUrl?: string
}
```

---

## Dependencias

**Antes:**
- US-GAM-003 (Monedas)
- US-ACT-001, US-ACT-002 (Actividades)

---

## Definición de Hecho (DoD)

- [x] 3 tipos de ayudas implementadas
- [x] Sistema de costos en monedas
- [x] Límite de 1 uso por tipo
- [x] Hints agregados a actividades
- [x] UI de botones de ayuda
- [x] Tests

---

## Notas

- ✅ 3 ayudas básicas
- ✅ Costos fijos
- ✅ Solo en actividades compatibles
- ⚠️ **Extensión futura:** EXT-025-AdvancedHelps (más ayudas, costos dinámicos)

---

## Estimación

**Desglose (7 SP = ~2.5 días):**
- Backend: 1 día
- Frontend: 1 día
- Hints en seed data: 0.25 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
