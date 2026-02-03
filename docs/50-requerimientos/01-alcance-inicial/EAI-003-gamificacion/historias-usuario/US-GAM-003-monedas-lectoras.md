---
id: "US-GAM-003"
title: "Monedas lectoras (ML Coins)"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003"
story_points: 6
budget: "$2,200 MXN"
sprint: "Sprint-1"
labels: ["gamification", "coins", "currency", "rewards"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-11"
---

# US-GAM-003: Monedas lectoras (ML Coins)

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 2-3
**Story Points:** 6 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **estudiante**, quiero **ganar monedas lectoras (ML Coins)** para **acumular un recurso valioso que podré usar en el futuro** (ayudas en esta fase, tienda en fases futuras).

**Contexto del Alcance Inicial:**
Monedas como segundo recurso de gamificación. Se otorgan por logros. En MVP solo se acumulan y gastan en ayudas. SIN tienda.

---

## Criterios de Aceptación

- [ ] **CA-01:** Se otorgan monedas al completar actividades correctamente
- [ ] **CA-02:** Valores fijos: actividad básica (3-5 coins), intermedia (7-10 coins)
- [ ] **CA-03:** Se muestran en dashboard
- [ ] **CA-04:** Notificación al ganar monedas
- [ ] **CA-05:** Se pueden gastar en ayudas (US-GAM-004)
- [ ] **CA-06:** Historial de transacciones (ganadas/gastadas)
- [ ] **CA-07:** No se pueden tener monedas negativas

---

## Especificaciones Técnicas

```typescript
@Entity('coin_transactions')
class CoinTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column({ type: 'int' })
  amount: number // Positivo = ganar, negativo = gastar

  @Column({ type: 'enum', enum: ['activity', 'module', 'badge', 'help_used', 'manual'] })
  reason: string

  @Column({ nullable: true })
  relatedId?: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}

@Entity('users')
class User {
  // ...
  @Column({ type: 'int', default: 0 })
  totalCoins: number
}

class CoinsService {
  async awardCoins(userId: string, amount: number, reason: string, relatedId?: string) {
    await this.coinTransactionsRepository.save({
      userId, amount, reason, relatedId
    })

    await this.usersRepository.increment({ id: userId }, 'totalCoins', amount)

    const user = await this.usersRepository.findOne({ where: { id: userId } })
    return { coinsAwarded: amount, totalCoins: user.totalCoins }
  }

  async spendCoins(userId: string, amount: number, reason: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })

    if (user.totalCoins < amount) {
      throw new BadRequestException('Insufficient coins')
    }

    await this.awardCoins(userId, -amount, reason)
    return { spent: amount, remaining: user.totalCoins - amount }
  }
}
```

**Endpoints:**
```
GET /api/gamification/coins
- Response: { totalCoins, history: [...] }

POST /api/gamification/coins/spend
- Body: { amount, reason }
- Response: { success, remaining }
```

### Frontend

```typescript
// components/gamification/CoinsDisplay.tsx
export function CoinsDisplay({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-2 bg-maya-gold-100 px-4 py-2 rounded-lg">
      <span className="text-2xl">💰</span>
      <div>
        <p className="text-xs text-gray-600">ML Coins</p>
        <p className="text-xl font-bold text-maya-gold-700">
          {coins.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
```

---

## Definición de Hecho (DoD)

- [x] Sistema de monedas funcional
- [x] Ganar/gastar monedas
- [x] Validación saldo suficiente
- [x] Historial de transacciones
- [x] Notificaciones
- [x] Tests

---

## Notas

- ✅ Solo acumulación y gasto en ayudas (MVP)
- ✅ SIN tienda de items
- ⚠️ **Extensión futura:** EXT-024-Shop (tienda de items, avatares, etc.)

---

## Estimación

**Desglose (6 SP = ~2 días):**
- Backend: 0.75 días
- Frontend: 0.75 días
- Testing: 0.5 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
