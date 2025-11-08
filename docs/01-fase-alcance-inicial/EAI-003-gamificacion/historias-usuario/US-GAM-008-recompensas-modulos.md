# US-GAM-008: Recompensas por completar módulos

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 4
**Story Points:** 5 SP
**Presupuesto:** $1,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **recibir recompensas especiales al completar módulos** para **sentir logro por terminar secciones completas del contenido**.

**Contexto del Alcance Inicial:**
Recompensas fijas (XP, monedas, insignia) al completar cada módulo. Los valores están hardcoded en la definición de cada módulo.

---

## Criterios de Aceptación

- [ ] **CA-01:** Al completar un módulo, se otorgan: XP fijo, Monedas fijas, Insignia opcional
- [ ] **CA-02:** Valores mayores que actividades individuales (ej: 50 XP, 25 monedas)
- [ ] **CA-03:** Modal de felicitación muestra todas las recompensas
- [ ] **CA-04:** Se registra fecha de completitud del módulo
- [ ] **CA-05:** Dashboard muestra módulos completados
- [ ] **CA-06:** Badge de "Módulo completado" si aplica
- [ ] **CA-07:** No se puede reclamar recompensa dos veces

---

## Especificaciones Técnicas

### Backend

```typescript
@Entity('modules')
class Module {
  // ... campos previos

  @Column({ type: 'int', default: 50 })
  completionXP: number

  @Column({ type: 'int', default: 25 })
  completionCoins: number

  @Column({ nullable: true })
  completionBadgeId?: string // Badge especial por completar este módulo
}

@Entity('module_completion')
class ModuleCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: string

  @ManyToOne(() => Module)
  module: Module

  @Column()
  moduleId: string

  @Column({ type: 'int' })
  xpAwarded: number

  @Column({ type: 'int' })
  coinsAwarded: number

  @Column({ nullable: true })
  badgeAwarded?: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date
}

class ModulesService {
  async completeModule(userId: string, moduleId: string) {
    // Verificar que no esté ya completado
    const existingCompletion = await this.moduleCompletionRepository.findOne({
      where: { userId, moduleId }
    })

    if (existingCompletion) {
      throw new BadRequestException('Module already completed')
    }

    // Verificar que todas las actividades estén completadas
    const progress = await this.getModuleProgress(moduleId, userId)
    if (progress.progressPercentage < 100) {
      throw new BadRequestException('Not all activities completed')
    }

    const module = await this.modulesRepository.findOne({ where: { id: moduleId } })

    // Otorgar recompensas
    await this.xpService.awardXP(userId, module.completionXP, 'module_completed', moduleId)
    await this.coinsService.awardCoins(userId, module.completionCoins, 'module', moduleId)

    let badgeAwarded = null
    if (module.completionBadgeId) {
      const badge = await this.badgesService.awardBadge(userId, module.completionBadgeId)
      badgeAwarded = badge.id
    }

    // Registrar completitud
    await this.moduleCompletionRepository.save({
      userId,
      moduleId,
      xpAwarded: module.completionXP,
      coinsAwarded: module.completionCoins,
      badgeAwarded,
      completedAt: new Date()
    })

    // Verificar logros adicionales (ej: primer módulo completado)
    await this.badgesService.checkAndAwardBadges(userId, 'module_completed', { moduleId })

    return {
      moduleCompleted: true,
      rewards: {
        xp: module.completionXP,
        coins: module.completionCoins,
        badge: badgeAwarded
      }
    }
  }

  async getCompletedModules(userId: string) {
    const completions = await this.moduleCompletionRepository.find({
      where: { userId },
      relations: ['module'],
      order: { completedAt: 'DESC' }
    })

    return completions.map(c => ({
      moduleId: c.moduleId,
      moduleName: c.module.title,
      completedAt: c.completedAt,
      xpAwarded: c.xpAwarded,
      coinsAwarded: c.coinsAwarded
    }))
  }
}
```

**Endpoints:**
```
POST /api/modules/:moduleId/complete
- Response: {
    moduleCompleted: true,
    rewards: { xp, coins, badge }
  }

GET /api/modules/completed
- Response: {
    completedModules: [
      { moduleId, moduleName, completedAt, xpAwarded, coinsAwarded }
    ],
    totalCompleted: number
  }
```

### Frontend

Ya implementado en US-ACT-008 (ModuleCompletionModal), pero se extiende:

```typescript
// components/modules/ModuleCompletionModal.tsx (actualizado)
export function ModuleCompletionModal({ module, rewards, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.3 }
    })
  }, [])

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Módulo Completado!
        </h2>

        <p className="text-lg text-gray-600 mb-6">
          Has completado exitosamente "{module.title}"
        </p>

        {/* Recompensas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* XP */}
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm text-gray-600">Experiencia</p>
            <p className="text-3xl font-bold text-yellow-700">
              +{rewards.xp}
            </p>
            <p className="text-xs text-gray-500">XP</p>
          </div>

          {/* Monedas */}
          <div className="bg-gold-50 p-6 rounded-lg border-2 border-gold-200">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-sm text-gray-600">ML Coins</p>
            <p className="text-3xl font-bold text-gold-700">
              +{rewards.coins}
            </p>
            <p className="text-xs text-gray-500">monedas</p>
          </div>

          {/* Insignia */}
          {rewards.badge && (
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-sm text-gray-600">Insignia</p>
              <img
                src={rewards.badge.imageUrl}
                alt={rewards.badge.name}
                className="w-12 h-12 mx-auto mt-2"
              />
              <p className="text-xs text-purple-700 mt-1">{rewards.badge.name}</p>
            </div>
          )}
        </div>

        {/* Mensaje motivacional */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800 italic">
            "Has dado un gran paso en tu camino del conocimiento maya. Continúa explorando y descubriendo los secretos de esta fascinante civilización."
          </p>
          <p className="text-sm text-blue-600 mt-2">- Ixchel, Guardiana del Conocimiento</p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button onClick={() => window.location.href = '/modules'} variant="outline" fullWidth>
            Ver más módulos
          </Button>
          <Button onClick={onClose} variant="primary" fullWidth>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Dashboard - Módulos completados
export function CompletedModulesSection({ completedModules }) {
  return (
    <Card>
      <h3 className="font-bold text-lg mb-3">Módulos Completados</h3>

      {completedModules.length === 0 ? (
        <p className="text-gray-500">Aún no has completado ningún módulo. ¡Comienza tu aventura!</p>
      ) : (
        <div className="space-y-2">
          {completedModules.map(module => (
            <div
              key={module.moduleId}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-medium text-gray-900">{module.moduleName}</p>
                  <p className="text-xs text-gray-600">
                    Completado: {new Date(module.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right text-sm">
                <p className="text-yellow-700">+{module.xpAwarded} XP</p>
                <p className="text-gold-700">+{module.coinsAwarded} 💰</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
```

### Seed Data - Módulos con recompensas

```typescript
const MODULES_SEED = [
  {
    id: 'modulo-numeros-mayas',
    title: 'Números Mayas',
    description: 'Aprende el sistema numérico vigesimal maya',
    completionXP: 50,
    completionCoins: 25,
    completionBadgeId: 'badge-numeros-master' // Badge específico
  },
  {
    id: 'modulo-calendario-haab',
    title: 'Calendario Haab',
    description: 'Descubre el calendario solar de 365 días',
    completionXP: 60,
    completionCoins: 30,
    completionBadgeId: 'badge-calendario-master'
  },
  {
    id: 'modulo-astronomia-maya',
    title: 'Astronomía Maya',
    description: 'Explora los conocimientos astronómicos',
    completionXP: 75,
    completionCoins: 40,
    completionBadgeId: null // Sin badge específico
  }
]
```

---

## Dependencias

**Antes:**
- US-ACT-008 (Navegación actividades)
- US-GAM-002 (XP)
- US-GAM-003 (Monedas)
- US-GAM-005 (Insignias)

---

## Definición de Hecho (DoD)

- [x] Sistema de recompensas implementado
- [x] No se puede reclamar dos veces
- [x] Modal muestra todas las recompensas
- [x] Dashboard lista módulos completados
- [x] Tests unitarios
- [x] Validación de completitud

---

## Notas del Alcance Inicial

- ✅ Recompensas fijas por módulo
- ✅ XP y monedas hardcoded
- ✅ Badge opcional por módulo
- ✅ Sin bonificaciones por velocidad de completitud
- ⚠️ **Extensión futura:** EXT-029-DynamicRewards (bonos por tiempo, precisión, racha)

---

## Testing

```typescript
describe('ModulesService - Completion', () => {
  it('should award rewards on module completion')
  it('should not allow duplicate completion')
  it('should require 100% progress')
  it('should award completion badge if defined')
  it('should trigger badge checks for milestones')
})
```

---

## Estimación

**Desglose de Esfuerzo (5 SP = ~1.75 días):**
- Backend: lógica completitud: 0.75 días
- Frontend: actualizar modal: 0.5 días
- Dashboard section: 0.25 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
