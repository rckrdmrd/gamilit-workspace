---
id: "US-GAM-005"
title: "Insignias basicas"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003"
story_points: 8
budget: "$2,900 MXN"
sprint: "Sprint-1"
labels: ["gamification", "badges", "achievements", "rewards"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-18"
---

# US-GAM-005: Insignias básicas

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 3-4
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **estudiante**, quiero **ganar insignias por logros específicos** para **coleccionar reconocimientos visuales de mis avances**.

**Contexto del Alcance Inicial:**
10 insignias pre-definidas que se otorgan automáticamente por logros. Hardcoded sin editor. Simple galería para visualizarlas.

---

## Criterios de Aceptación

- [ ] **CA-01:** 10 insignias pre-definidas
- [ ] **CA-02:** Se otorgan automáticamente al cumplir criterio
- [ ] **CA-03:** Notificación al desbloquear insignia
- [ ] **CA-04:** Galería de insignias (desbloqueadas/bloqueadas)
- [ ] **CA-05:** Tooltip muestra cómo desbloquear
- [ ] **CA-06:** Insignias tienen imagen, nombre, descripción
- [ ] **CA-07:** Se registra fecha de obtención
- [ ] **CA-08:** Se muestran en perfil

---

## Especificaciones Técnicas

### Backend

```typescript
@Entity('badges')
class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text' })
  description: string

  @Column()
  imageUrl: string

  @Column({ type: 'enum', enum: BadgeType })
  type: BadgeType

  @Column({ type: 'jsonb' })
  criteria: BadgeCriteria // Criterios para desbloquear

  @Column({ type: 'int', default: 0 })
  xpReward: number

  @Column({ type: 'int', default: 0 })
  coinsReward: number
}

enum BadgeType {
  FIRST_STEPS = 'first_steps',
  MODULE_COMPLETION = 'module_completion',
  STREAK = 'streak',
  XP_MILESTONE = 'xp_milestone',
  RANK_UP = 'rank_up'
}

interface BadgeCriteria {
  type: 'first_activity' | 'complete_module' | 'reach_xp' | 'streak_days' | 'rank_achieved'
  value?: any // Depende del tipo
}

@Entity('user_badges')
class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: string

  @ManyToOne(() => Badge)
  badge: Badge

  @Column()
  badgeId: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  earnedAt: Date
}

// Seed data de insignias
const BADGES_SEED = [
  {
    name: 'Primer Paso',
    description: 'Completa tu primera actividad',
    imageUrl: '/badges/first-step.svg',
    type: BadgeType.FIRST_STEPS,
    criteria: { type: 'first_activity' },
    xpReward: 10,
    coinsReward: 5
  },
  {
    name: 'Explorador Maya',
    description: 'Completa tu primer módulo',
    imageUrl: '/badges/first-module.svg',
    type: BadgeType.MODULE_COMPLETION,
    criteria: { type: 'complete_module', value: 1 },
    xpReward: 50,
    coinsReward: 25
  },
  {
    name: 'Maestro de Números',
    description: 'Completa el módulo de Números Mayas',
    imageUrl: '/badges/numeros-master.svg',
    type: BadgeType.MODULE_COMPLETION,
    criteria: { type: 'complete_module', value: 'numeros-mayas' },
    xpReward: 30,
    coinsReward: 15
  },
  {
    name: 'Estudiante Constante',
    description: 'Completa actividades 3 días seguidos',
    imageUrl: '/badges/streak-3.svg',
    type: BadgeType.STREAK,
    criteria: { type: 'streak_days', value: 3 },
    xpReward: 20,
    coinsReward: 10
  },
  {
    name: 'Centenario',
    description: 'Alcanza 100 XP',
    imageUrl: '/badges/xp-100.svg',
    type: BadgeType.XP_MILESTONE,
    criteria: { type: 'reach_xp', value: 100 },
    xpReward: 10,
    coinsReward: 5
  },
  {
    name: 'Aprendiz Ascendido',
    description: 'Alcanza el rango de Aprendiz',
    imageUrl: '/badges/rank-aprendiz.svg',
    type: BadgeType.RANK_UP,
    criteria: { type: 'rank_achieved', value: 'aprendiz' },
    xpReward: 25,
    coinsReward: 10
  },
  // ... 4 insignias más
]

class BadgesService {
  async checkAndAwardBadges(userId: string, event: string, eventData?: any) {
    const badges = await this.badgesRepository.find()
    const userBadges = await this.userBadgesRepository.find({ where: { userId } })
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId)

    const newlyEarnedBadges = []

    for (const badge of badges) {
      // Si ya la tiene, skip
      if (earnedBadgeIds.includes(badge.id)) continue

      // Verificar si cumple criterio
      const meets = await this.meetsCriteria(userId, badge.criteria, event, eventData)

      if (meets) {
        await this.awardBadge(userId, badge.id)
        newlyEarnedBadges.push(badge)
      }
    }

    return newlyEarnedBadges
  }

  private async meetsCriteria(userId: string, criteria: BadgeCriteria, event: string, eventData?: any): Promise<boolean> {
    switch (criteria.type) {
      case 'first_activity':
        return event === 'activity_completed' && eventData.isFirst

      case 'complete_module':
        if (typeof criteria.value === 'number') {
          const completedCount = await this.moduleProgressRepository.count({ where: { userId } })
          return completedCount >= criteria.value
        } else {
          return event === 'module_completed' && eventData.moduleId === criteria.value
        }

      case 'reach_xp':
        const user = await this.usersRepository.findOne({ where: { id: userId } })
        return user.totalXP >= criteria.value

      case 'streak_days':
        const streak = await this.streakService.getCurrentStreak(userId)
        return streak >= criteria.value

      case 'rank_achieved':
        const userRank = await this.usersRepository.findOne({ where: { id: userId } })
        return userRank.currentRank === criteria.value

      default:
        return false
    }
  }

  private async awardBadge(userId: string, badgeId: string) {
    const badge = await this.badgesRepository.findOne({ where: { id: badgeId } })

    await this.userBadgesRepository.save({
      userId,
      badgeId,
      earnedAt: new Date()
    })

    // Otorgar recompensas
    if (badge.xpReward > 0) {
      await this.xpService.awardXP(userId, badge.xpReward, 'badge_earned', badgeId)
    }
    if (badge.coinsReward > 0) {
      await this.coinsService.awardCoins(userId, badge.coinsReward, 'badge', badgeId)
    }

    return badge
  }

  async getBadgesGallery(userId: string) {
    const allBadges = await this.badgesRepository.find()
    const userBadges = await this.userBadgesRepository.find({
      where: { userId },
      relations: ['badge']
    })

    const earnedBadgeIds = userBadges.map(ub => ub.badgeId)

    return allBadges.map(badge => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id),
      earnedAt: userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
    }))
  }
}
```

**Endpoints:**
```
GET /api/badges
- Response: { badges: [ { ...badge, earned, earnedAt } ] }

GET /api/badges/recent
- Response: { recentBadges: [...] } // Últimas 5 desbloqueadas
```

### Frontend

```typescript
// components/badges/BadgeGallery.tsx
export function BadgeGallery({ badges }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            badge.earned
              ? 'bg-white border-maya-gold-300 shadow-md'
              : 'bg-gray-100 border-gray-300 opacity-60'
          }`}
          title={badge.earned ? `Desbloqueada: ${new Date(badge.earnedAt).toLocaleDateString()}` : badge.description}
        >
          <img
            src={badge.imageUrl}
            alt={badge.name}
            className={`w-16 h-16 mx-auto mb-2 ${!badge.earned && 'grayscale'}`}
          />
          <p className="text-center text-sm font-medium text-gray-900">
            {badge.name}
          </p>
          {!badge.earned && (
            <div className="absolute top-2 right-2">
              <span className="text-2xl">🔒</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// components/badges/BadgeUnlockModal.tsx
export function BadgeUnlockModal({ badge, onClose }) {
  useEffect(() => {
    confetti({ particleCount: 200, spread: 180 })
  }, [])

  return (
    <Modal isOpen onClose={onClose}>
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-3">¡Insignia Desbloqueada!</h2>

        <img src={badge.imageUrl} alt={badge.name} className="w-24 h-24 mx-auto mb-3" />

        <h3 className="text-xl font-bold text-maya-gold-700 mb-2">{badge.name}</h3>
        <p className="text-gray-600 mb-4">{badge.description}</p>

        {(badge.xpReward > 0 || badge.coinsReward > 0) && (
          <div className="flex justify-center gap-4 mb-4">
            {badge.xpReward > 0 && (
              <span className="text-yellow-700">+{badge.xpReward} XP</span>
            )}
            {badge.coinsReward > 0 && (
              <span className="text-gold-700">+{badge.coinsReward} 💰</span>
            )}
          </div>
        )}

        <Button onClick={onClose}>Continuar</Button>
      </div>
    </Modal>
  )
}
```

---

## Dependencias

**Antes:** US-GAM-002, US-GAM-003

---

## Definición de Hecho (DoD)

- [x] 10 insignias implementadas
- [x] Sistema de otorgamiento automático
- [x] Galería de insignias
- [x] Notificaciones
- [x] Imágenes/iconos diseñados
- [x] Tests

---

## Notas

- ✅ 10 insignias hardcoded
- ✅ Criterios fijos
- ⚠️ **Extensión futura:** EXT-026-DynamicBadges (crear insignias dinámicamente)

---

## Estimación

**Desglose (8 SP = ~3 días):**
- Backend: 1 día
- Frontend: 1 día
- Diseño de insignias: 0.75 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack + Diseño
