# US-GAM-001: Sistema de rangos Maya

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 2-3
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **progresar a través de rangos inspirados en la cultura Maya** para **sentirme motivado y reconocer mi avance en la plataforma**.

**Contexto del Alcance Inicial:**
Sistema de 5 rangos fijos inspirados en jerarquías mayas. Los rangos son hardcoded con umbrales de XP predefinidos. No son parametrizables ni personalizables.

---

## Criterios de Aceptación

- [ ] **CA-01:** 5 rangos definidos: Novato, Aprendiz, Explorador, Maestro, Sabio
- [ ] **CA-02:** Cada rango tiene umbral de XP fijo
- [ ] **CA-03:** Se muestra rango actual del estudiante en dashboard
- [ ] **CA-04:** Se muestra progreso hacia siguiente rango (barra)
- [ ] **CA-05:** Notificación al subir de rango
- [ ] **CA-06:** Cada rango tiene icono/imagen distintiva
- [ ] **CA-07:** Tooltip explica requisitos de cada rango
- [ ] **CA-08:** Se registra fecha de ascenso a cada rango

---

## Especificaciones Técnicas

### Backend

**Rangos Definidos:**
```typescript
enum MayaRank {
  NOVATO = 'novato',           // 0 - 99 XP
  APRENDIZ = 'aprendiz',       // 100 - 499 XP
  EXPLORADOR = 'explorador',   // 500 - 1,499 XP
  MAESTRO = 'maestro',         // 1,500 - 3,999 XP
  SABIO = 'sabio'              // 4,000+ XP
}

const RANK_THRESHOLDS = [
  { rank: MayaRank.NOVATO, minXP: 0, maxXP: 99, icon: '/icons/ranks/novato.svg' },
  { rank: MayaRank.APRENDIZ, minXP: 100, maxXP: 499, icon: '/icons/ranks/aprendiz.svg' },
  { rank: MayaRank.EXPLORADOR, minXP: 500, maxXP: 1499, icon: '/icons/ranks/explorador.svg' },
  { rank: MayaRank.MAESTRO, minXP: 1500, maxXP: 3999, icon: '/icons/ranks/maestro.svg' },
  { rank: MayaRank.SABIO, minXP: 4000, maxXP: Infinity, icon: '/icons/ranks/sabio.svg' },
]
```

**Entidad de Usuario (actualizada):**
```typescript
@Entity('users')
class User {
  // ... campos previos

  @Column({ type: 'int', default: 0 })
  totalXP: number

  @Column({ type: 'enum', enum: MayaRank, default: MayaRank.NOVATO })
  currentRank: MayaRank

  @Column({ type: 'int', default: 1 })
  level: number // Nivel numérico (1-100)
}

@Entity('rank_history')
class RankHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: string

  @Column({ type: 'enum', enum: MayaRank })
  rank: MayaRank

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  achievedAt: Date
}
```

**Servicio de Rangos:**
```typescript
class RankService {
  calculateRank(totalXP: number): MayaRank {
    for (const threshold of RANK_THRESHOLDS.reverse()) {
      if (totalXP >= threshold.minXP) {
        return threshold.rank
      }
    }
    return MayaRank.NOVATO
  }

  calculateLevel(totalXP: number): number {
    // Cada nivel requiere 100 XP
    return Math.floor(totalXP / 100) + 1
  }

  async updateUserRank(userId: string): Promise<{ rankUp: boolean, newRank?: MayaRank }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })

    const currentRank = user.currentRank
    const newRank = this.calculateRank(user.totalXP)
    const newLevel = this.calculateLevel(user.totalXP)

    if (newRank !== currentRank) {
      // Subió de rango
      user.currentRank = newRank
      user.level = newLevel
      await this.usersRepository.save(user)

      // Registrar en historial
      await this.rankHistoryRepository.save({
        userId,
        rank: newRank,
        achievedAt: new Date()
      })

      return { rankUp: true, newRank }
    }

    // Solo actualizar nivel si cambió
    if (newLevel !== user.level) {
      user.level = newLevel
      await this.usersRepository.save(user)
    }

    return { rankUp: false }
  }

  getRankInfo(rank: MayaRank) {
    return RANK_THRESHOLDS.find(r => r.rank === rank)
  }

  getProgressToNextRank(totalXP: number) {
    const currentRankInfo = RANK_THRESHOLDS.find(
      r => totalXP >= r.minXP && totalXP <= r.maxXP
    )

    if (!currentRankInfo) return { percentage: 100, xpNeeded: 0 }

    const nextRankInfo = RANK_THRESHOLDS.find(
      r => r.minXP > currentRankInfo.maxXP
    )

    if (!nextRankInfo) {
      // Ya está en el rango máximo
      return { percentage: 100, xpNeeded: 0 }
    }

    const xpInCurrentRank = totalXP - currentRankInfo.minXP
    const xpNeededForNextRank = nextRankInfo.minXP - currentRankInfo.minXP
    const percentage = (xpInCurrentRank / xpNeededForNextRank) * 100

    return {
      percentage: Math.min(percentage, 100),
      xpNeeded: nextRankInfo.minXP - totalXP,
      nextRank: nextRankInfo.rank
    }
  }
}
```

**Endpoints:**
```
GET /api/gamification/rank
- Response: {
    currentRank: 'explorador',
    level: 6,
    totalXP: 587,
    rankInfo: {
      rank: 'explorador',
      minXP: 500,
      maxXP: 1499,
      icon: '/icons/ranks/explorador.svg'
    },
    progressToNext: {
      percentage: 8.7,
      xpNeeded: 913,
      nextRank: 'maestro'
    }
  }

GET /api/gamification/rank/history
- Response: {
    history: [
      { rank: 'novato', achievedAt: '2025-01-01' },
      { rank: 'aprendiz', achievedAt: '2025-01-15' },
      { rank: 'explorador', achievedAt: '2025-02-01' }
    ]
  }
```

### Frontend

**Componente de Rango:**
```typescript
// components/gamification/RankDisplay.tsx
export function RankDisplay({ rank, level, totalXP, progress }) {
  return (
    <Card className="bg-gradient-to-br from-maya-green-50 to-maya-gold-50">
      <div className="flex items-center gap-4">
        {/* Icono del rango */}
        <div className="relative">
          <img
            src={getRankIcon(rank)}
            alt={rank}
            className="w-20 h-20"
          />
          <div className="absolute -bottom-2 -right-2 bg-maya-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {level}
          </div>
        </div>

        {/* Información */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 capitalize">
            {rank}
          </h3>
          <p className="text-sm text-gray-600">
            Nivel {level} • {totalXP.toLocaleString()} XP
          </p>

          {/* Barra de progreso */}
          {progress.nextRank && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progreso a {progress.nextRank}</span>
                <span>{progress.xpNeeded} XP restantes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-maya-green-500 to-maya-gold-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
```

**Modal de Subida de Rango:**
```typescript
// components/gamification/RankUpModal.tsx
export function RankUpModal({ newRank, onClose }) {
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
        <div className="mb-6">
          <img
            src={getRankIcon(newRank)}
            alt={newRank}
            className="w-32 h-32 mx-auto animate-bounce"
          />
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          ¡Ascenso de Rango!
        </h2>

        <p className="text-xl text-gray-700 mb-2">
          Ahora eres un <span className="font-bold capitalize text-maya-green-600">{newRank}</span>
        </p>

        <p className="text-gray-600 mb-6">
          {getRankDescription(newRank)}
        </p>

        <Button onClick={onClose} variant="primary" size="lg">
          ¡Continuar aprendiendo!
        </Button>
      </div>
    </Modal>
  )
}

function getRankDescription(rank: MayaRank): string {
  const descriptions = {
    novato: 'Estás dando tus primeros pasos en el conocimiento maya.',
    aprendiz: 'Tu curiosidad te ha llevado a descubrir más secretos mayas.',
    explorador: 'Has explorado profundamente la sabiduría de los antiguos mayas.',
    maestro: 'Dominas el conocimiento maya con maestría.',
    sabio: 'Eres un verdadero sabio, poseedor de la antigua sabiduría maya.'
  }
  return descriptions[rank]
}
```

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación)
- US-GAM-002 (Sistema XP)

---

## Definición de Hecho (DoD)

- [x] 5 rangos implementados
- [x] Cálculo automático de rango por XP
- [x] Progreso hacia siguiente rango
- [x] Notificación al subir de rango
- [x] Historial de rangos
- [x] Iconos diseñados para cada rango
- [x] Tests unitarios

---

## Notas del Alcance Inicial

- ✅ 5 rangos fijos (hardcoded)
- ✅ Umbrales de XP predefinidos
- ✅ Sin rangos personalizables
- ✅ Sin títulos o prestigio adicional
- ⚠️ **Extensión futura:** EXT-023-AdvancedRanks (rangos adicionales, prestigio, títulos)

---

## Testing

```typescript
describe('RankService', () => {
  it('should calculate rank from XP')
  it('should detect rank up')
  it('should calculate progress to next rank')
  it('should handle max rank (Sabio)')
})
```

---

## Estimación

**Desglose (8 SP = ~3 días):**
- Backend: lógica rangos: 1 día
- Frontend: componentes: 1.25 días
- Iconos/diseño: 0.5 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack + Diseño
