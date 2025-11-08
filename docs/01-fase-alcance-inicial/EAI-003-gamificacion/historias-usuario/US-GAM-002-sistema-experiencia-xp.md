# US-GAM-002: Sistema de experiencia (XP)

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 2
**Story Points:** 7 SP
**Presupuesto:** $2,600 MXN
**Prioridad:** Crítica (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **ganar puntos de experiencia (XP) al completar actividades** para **ver mi progreso y avanzar de nivel**.

**Contexto del Alcance Inicial:**
Sistema de XP con valores fijos por tipo de actividad. El XP se otorga automáticamente al responder correctamente. Los valores no son parametrizables.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se otorga XP al responder correctamente actividades
- [ ] **CA-02:** Valores de XP fijos por tipo: básica (8-10 XP), intermedia (15-20 XP)
- [ ] **CA-03:** No se otorga XP por respuestas incorrectas
- [ ] **CA-04:** XP se acumula en totalXP del usuario
- [ ] **CA-05:** Se muestra notificación "+X XP" al ganar
- [ ] **CA-06:** Dashboard muestra XP total y actual
- [ ] **CA-07:** Se registra cada otorgamiento de XP (historial)

---

## Especificaciones Técnicas

### Backend

```typescript
@Entity('xp_transactions')
class XPTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  user: User

  @Column()
  userId: string

  @Column({ type: 'int' })
  amount: number

  @Column({ type: 'enum', enum: ['activity_completed', 'module_completed', 'badge_earned', 'manual'] })
  reason: string

  @Column({ nullable: true })
  activityId?: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}

class XPService {
  async awardXP(userId: string, amount: number, reason: string, relatedId?: string) {
    // Registrar transacción
    await this.xpTransactionsRepository.save({
      userId,
      amount,
      reason,
      activityId: relatedId
    })

    // Actualizar total
    await this.usersRepository.increment({ id: userId }, 'totalXP', amount)

    // Verificar subida de rango
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    const rankUpdate = await this.rankService.updateUserRank(userId)

    return {
      xpAwarded: amount,
      totalXP: user.totalXP + amount,
      rankUp: rankUpdate.rankUp,
      newRank: rankUpdate.newRank
    }
  }

  async getXPHistory(userId: string, limit = 20) {
    return this.xpTransactionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    })
  }
}
```

**Endpoints:**
```
GET /api/gamification/xp
- Response: { totalXP, level, rank }

GET /api/gamification/xp/history
- Response: { transactions: [...] }
```

### Frontend

```typescript
// components/gamification/XPNotification.tsx
export function XPNotification({ amount }: { amount: number }) {
  return (
    <div className="fixed top-20 right-4 z-50 animate-slideInRight">
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-3 shadow-lg flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="font-bold text-yellow-800">+{amount} XP</span>
      </div>
    </div>
  )
}

// Hook para mostrar notificación
export function useXPNotification() {
  const [show, setShow] = useState(false)
  const [amount, setAmount] = useState(0)

  const showNotification = (xp: number) => {
    setAmount(xp)
    setShow(true)
    setTimeout(() => setShow(false), 3000)
  }

  return { show, amount, showNotification }
}
```

---

## Dependencias

**Antes:** US-FUND-001

**Después:** Todas las actividades dependen de esto

---

## Definición de Hecho (DoD)

- [x] XP se otorga automáticamente
- [x] Transacciones registradas
- [x] Notificaciones visuales
- [x] Historial de XP
- [x] Tests

---

## Estimación

**Desglose (7 SP = ~2.5 días):**
- Backend: 1 día
- Frontend: 1 día
- Testing: 0.5 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
