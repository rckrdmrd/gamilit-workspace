---
titulo: "ET-PEER-003: Betting System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PEER-003: Betting System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PEER-003 |
| **Modulo** | Peer Challenges |
| **Tipo** | Especificacion Tecnica |
| **Estado** | No Iniciado |
| **Completitud** | 15% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PEER-003: ML Coins Betting System

### User Stories
- [US-PEER-003: Scoring and Wagering](../user-stories/US-PEER-003/US-PEER-003-scoring-wagering.md)

---

## Descripcion Funcional

Sistema de apuestas con ML Coins para desafios:
- Apuesta de ML Coins antes del desafio
- Match de apuestas entre participantes
- Distribucion automatica de ganancias
- Limites de apuesta por nivel
- Comision del sistema (opcional)

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - BetAmountSelector                                     |
|  - BetConfirmationModal                                  |
|  - PotDisplay                                            |
|  - WinningsAnimation                                     |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) BettingService                             |
|  - (FALTANTE) PotService                                 |
|  - PeerChallengesService (EXISTENTE)                     |
|  - MLCoinsService (EXISTENTE)                            |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - social_features.peer_challenges (wager fields)        |
|  - (FALTANTE) social_features.challenge_bets             |
|  - gamification_system.ml_coins_transactions             |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Database - PeerChallenge (Wager Fields)

**Ubicacion:** `apps/backend/src/modules/social/entities/peer-challenge.entity.ts`

**Estado:** PARCIAL (Campos existen, logica faltante)

```typescript
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'peer_challenges' })
export class PeerChallenge {
  // ... otros campos

  /**
   * Permite apuestas en el desafio
   */
  @Column('boolean', { default: false })
  allow_wager!: boolean;

  /**
   * Apuesta minima (ML Coins)
   */
  @Column('int', { nullable: true })
  min_wager?: number;

  /**
   * Apuesta maxima (ML Coins)
   */
  @Column('int', { nullable: true })
  max_wager?: number;

  /**
   * Pool total de apuestas
   */
  @Column('int', { default: 0 })
  total_pot!: number;

  /**
   * Multiplicador de ganancias
   */
  @Column('decimal', { precision: 3, scale: 2, default: 1.00 })
  pot_multiplier!: number;
}
```

---

## Lo que Falta para Completar (85%)

### 1. Database Schema (15%)

```sql
-- tables/challenge_bets.sql (NUEVO)
CREATE TABLE social_features.challenge_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES social_features.peer_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  amount INT NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'placed', -- 'placed', 'matched', 'won', 'lost', 'refunded'
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  winnings INT,
  transaction_id UUID REFERENCES gamification_system.ml_coins_transactions(id),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_bets_challenge ON social_features.challenge_bets(challenge_id);
CREATE INDEX idx_challenge_bets_user ON social_features.challenge_bets(user_id);
CREATE INDEX idx_challenge_bets_status ON social_features.challenge_bets(status);
```

### 2. BettingService (30%)

```typescript
// services/betting.service.ts (NUEVO)
@Injectable()
export class BettingService {
  constructor(
    private readonly betsRepo: Repository<ChallengeBet>,
    private readonly mlCoinsService: MLCoinsService,
    private readonly challengesService: PeerChallengesService,
  ) {}

  /**
   * Coloca apuesta en desafio
   */
  async placeBet(
    userId: string,
    challengeId: string,
    amount: number
  ): Promise<ChallengeBet> {
    // 1. Validar que el desafio permite apuestas
    const challenge = await this.challengesService.findById(challengeId);
    if (!challenge.allow_wager) {
      throw new BadRequestException('Challenge does not allow wagers');
    }

    // 2. Validar limites
    if (amount < challenge.min_wager || amount > challenge.max_wager) {
      throw new BadRequestException(`Wager must be between ${challenge.min_wager} and ${challenge.max_wager}`);
    }

    // 3. Validar saldo
    const balance = await this.mlCoinsService.getBalance(userId);
    if (balance < amount) {
      throw new BadRequestException('Insufficient ML Coins');
    }

    // 4. Deducir ML Coins
    const transaction = await this.mlCoinsService.deductCoins(
      userId,
      amount,
      `Bet on challenge ${challengeId}`
    );

    // 5. Crear apuesta
    const bet = this.betsRepo.create({
      challenge_id: challengeId,
      user_id: userId,
      amount,
      status: 'placed',
      transaction_id: transaction.id,
    });

    await this.betsRepo.save(bet);

    // 6. Actualizar pot total
    await this.challengesService.updatePot(challengeId, amount);

    return bet;
  }

  /**
   * Obtiene apuesta del usuario en desafio
   */
  async getBet(userId: string, challengeId: string): Promise<ChallengeBet | null>;

  /**
   * Resuelve apuestas al finalizar desafio
   */
  async resolveChallengeBets(
    challengeId: string,
    winnerId: string
  ): Promise<BetResolution> {
    const bets = await this.betsRepo.find({
      where: { challenge_id: challengeId, status: 'placed' },
    });

    const totalPot = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const winnerBet = bets.find(b => b.user_id === winnerId);

    // Calcular ganancias
    const winnings = Math.floor(totalPot * 0.95); // 5% comision sistema

    // Acreditar al ganador
    if (winnerBet) {
      await this.mlCoinsService.awardCoins(
        winnerId,
        winnings,
        `Won challenge bet ${challengeId}`
      );

      winnerBet.status = 'won';
      winnerBet.winnings = winnings;
      winnerBet.resolved_at = new Date();
      await this.betsRepo.save(winnerBet);
    }

    // Marcar perdedores
    for (const bet of bets) {
      if (bet.user_id !== winnerId) {
        bet.status = 'lost';
        bet.resolved_at = new Date();
        await this.betsRepo.save(bet);
      }
    }

    return {
      challengeId,
      winnerId,
      totalPot,
      winnings,
      commission: totalPot - winnings,
    };
  }

  /**
   * Reembolsa apuestas si el desafio se cancela
   */
  async refundBets(challengeId: string): Promise<void> {
    const bets = await this.betsRepo.find({
      where: { challenge_id: challengeId, status: 'placed' },
    });

    for (const bet of bets) {
      await this.mlCoinsService.awardCoins(
        bet.user_id,
        bet.amount,
        `Refund: challenge ${challengeId} cancelled`
      );

      bet.status = 'refunded';
      bet.resolved_at = new Date();
      await this.betsRepo.save(bet);
    }
  }

  /**
   * Calcula limite de apuesta por nivel
   */
  getMaxBetForLevel(level: number): number {
    // Base: 100, +50 por nivel
    return 100 + (level * 50);
  }
}

interface BetResolution {
  challengeId: string;
  winnerId: string;
  totalPot: number;
  winnings: number;
  commission: number;
}
```

### 3. Frontend Components (25%)

```typescript
// components/BetAmountSelector.tsx (NUEVO)
interface BetAmountSelectorProps {
  minBet: number;
  maxBet: number;
  userBalance: number;
  onSelect: (amount: number) => void;
}

export const BetAmountSelector: React.FC<BetAmountSelectorProps> = ({
  minBet,
  maxBet,
  userBalance,
  onSelect,
}) => {
  const [amount, setAmount] = useState(minBet);

  const presets = [minBet, Math.floor((minBet + maxBet) / 2), maxBet];

  return (
    <div className="bet-selector">
      <div className="balance-display">
        <CoinIcon />
        <span>Tu saldo: {userBalance}</span>
      </div>

      <div className="amount-presets">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            disabled={preset > userBalance}
            className={amount === preset ? 'selected' : ''}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="custom-amount">
        <input
          type="range"
          min={minBet}
          max={Math.min(maxBet, userBalance)}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <span>{amount} ML Coins</span>
      </div>

      <button
        onClick={() => onSelect(amount)}
        className="confirm-bet-btn"
      >
        Apostar {amount}
      </button>
    </div>
  );
};

// components/PotDisplay.tsx (NUEVO)
interface PotDisplayProps {
  totalPot: number;
  participants: { userId: string; bet: number }[];
  potMultiplier: number;
}

export const PotDisplay: React.FC<PotDisplayProps>;

// components/WinningsAnimation.tsx (NUEVO)
interface WinningsAnimationProps {
  amount: number;
  onComplete: () => void;
}

export const WinningsAnimation: React.FC<WinningsAnimationProps>;
```

### 4. API Endpoints (15%)

```typescript
// controllers/betting.controller.ts (NUEVO)
@Controller('challenges/:challengeId/bets')
export class BettingController {
  @Post()
  @UseGuards(AuthGuard)
  async placeBet(
    @CurrentUser() user: User,
    @Param('challengeId') challengeId: string,
    @Body() dto: PlaceBetDto
  ): Promise<ChallengeBet>;

  @Get()
  @UseGuards(AuthGuard)
  async getMyBet(
    @CurrentUser() user: User,
    @Param('challengeId') challengeId: string
  ): Promise<ChallengeBet | null>;

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllBets(
    @Param('challengeId') challengeId: string
  ): Promise<BetSummary>;
}
```

---

## Limites de Apuesta por Nivel

| Nivel | Min Bet | Max Bet |
|-------|---------|---------|
| 1-10 | 10 | 100 |
| 11-25 | 20 | 250 |
| 26-50 | 50 | 500 |
| 51-75 | 100 | 1000 |
| 76+ | 200 | 2500 |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/challenges/:id/bets` | Colocar apuesta |
| GET | `/challenges/:id/bets` | Mi apuesta |
| GET | `/challenges/:id/bets/summary` | Resumen del pot |
| DELETE | `/challenges/:id/bets` | Retirar apuesta (si no ha iniciado) |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Usuario puede apostar ML Coins
- [ ] Apuesta se deduce inmediatamente
- [ ] Ganador recibe pot (menos comision)
- [ ] Apuestas se reembolsan si se cancela
- [ ] Limites por nivel respetados
- [ ] UI muestra pot total en tiempo real

### No Funcionales
- [ ] Transaccion atomica
- [ ] Logs de auditoria
- [ ] Rate limiting

### Seguridad
- [ ] Validacion de saldo
- [ ] No apuestas despues de inicio
- [ ] Anti-fraude (no auto-desafios)

---

## Dependencias

### Bloqueado Por
- PeerChallenge Entity (COMPLETO)
- MLCoins Service (COMPLETO)
- Challenge Completion (COMPLETO)

### Bloquea
- Tournament Betting
- Spectator Betting
- Betting History

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| Database Schema | 3h |
| BettingService | 10h |
| BettingController | 4h |
| Frontend Components | 8h |
| Integration with Challenge Flow | 4h |
| Tests | 4h |
| **Total** | **33h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PEER-003-betting-system.md*
*Generado: 2026-01-27*
