# ET-PEER-004: Challenge Rewards System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PEER-004 |
| **Modulo** | Peer Challenges |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 50% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PEER-004: Challenge Rewards Distribution

### User Stories
- [US-PEER-003: Scoring and Wagering](../historias-usuario/US-PEER-003-scoring-wagering.md)

---

## Descripcion Funcional

Sistema de recompensas para desafios peer-to-peer:
- XP por participar
- XP extra por ganar
- ML Coins por completar
- Bonus por victoria consecutiva
- Achievements especificos de desafios

---

## Arquitectura

### Flujo de Recompensas

```
Desafio completado
        |
        v
ChallengeRewardsService.distributeRewards()
        |
        v
Para cada participante:
  1. XP base por participar
  2. ¿Es ganador?
     ├── SI → XP bonus ganador + Coins bonus
     └── NO → XP consolacion
  3. Verificar multiplicadores (streak, rank)
  4. Aplicar multiplicadores
  5. Acreditar recompensas
  6. Verificar achievements
        |
        v
Notificar resultados via WebSocket
```

---

## Implementacion Existente

### Backend - ChallengeResult Entity

**Ubicacion:** `apps/backend/src/modules/social/entities/challenge-result.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'challenge_results' })
export class ChallengeResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  challenge_id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  score?: number;

  @Column('int', { nullable: true })
  rank?: number;

  @Column('boolean', { default: false })
  is_winner!: boolean;

  @Column('int', { nullable: true })
  time_spent_seconds?: number;

  @Column('int', { nullable: true })
  xp_earned?: number;

  @Column('int', { nullable: true })
  coins_earned?: number;

  @Column('timestamp with time zone', { nullable: true })
  finished_at?: Date;
}
```

### Backend - PeerChallengesService (Reward Fields)

**Ubicacion:** `apps/backend/src/modules/social/services/peer-challenges.service.ts`

**Estado:** PARCIAL (50%)

```typescript
@Injectable()
export class PeerChallengesService {
  // ... otros metodos

  /**
   * Completa desafio y registra resultados
   */
  async complete(challengeId: string): Promise<ChallengeResult[]> {
    const challenge = await this.findById(challengeId);
    const results = await this.calculateResults(challengeId);

    // Guardar resultados
    for (const result of results) {
      await this.resultsRepo.save(result);
    }

    // TODO: Distribuir recompensas
    // await this.rewardsService.distributeRewards(challengeId, results);

    return results;
  }
}
```

---

## Lo que Falta para Completar (50%)

### 1. ChallengeRewardsService (25%)

```typescript
// services/challenge-rewards.service.ts (NUEVO)
@Injectable()
export class ChallengeRewardsService {
  constructor(
    private readonly mlCoinsService: MLCoinsService,
    private readonly userStatsService: UserStatsService,
    private readonly achievementsService: AchievementsService,
    private readonly ranksService: RanksService,
  ) {}

  /**
   * Distribuye recompensas a todos los participantes
   */
  async distributeRewards(
    challengeId: string,
    results: ChallengeResult[]
  ): Promise<RewardsDistribution> {
    const distribution: RewardsDistribution = {
      challengeId,
      rewards: [],
    };

    for (const result of results) {
      const reward = await this.calculateReward(result);
      await this.applyReward(result.user_id, reward);

      distribution.rewards.push({
        userId: result.user_id,
        ...reward,
      });
    }

    // Verificar achievements para todos
    await this.checkChallengeAchievements(results);

    return distribution;
  }

  /**
   * Calcula recompensa segun resultado
   */
  async calculateReward(result: ChallengeResult): Promise<CalculatedReward> {
    const baseXP = 50; // XP por participar
    const winnerBonusXP = 100;
    const baseCoins = 10;
    const winnerBonusCoins = 25;

    let xp = baseXP;
    let coins = baseCoins;

    if (result.is_winner) {
      xp += winnerBonusXP;
      coins += winnerBonusCoins;
    }

    // Aplicar multiplicadores
    const multipliers = await this.ranksService.getRankMultiplier(result.user_id);
    xp = Math.floor(xp * multipliers.xp);
    coins = Math.floor(coins * multipliers.coins);

    // Bonus por score perfecto
    if (result.score === 100) {
      xp += 25;
      coins += 10;
    }

    return { xp, coins };
  }

  /**
   * Aplica recompensa al usuario
   */
  async applyReward(userId: string, reward: CalculatedReward): Promise<void> {
    await this.userStatsService.awardXP(userId, reward.xp, 'challenge_reward');
    await this.mlCoinsService.awardCoins(userId, reward.coins, 'Challenge reward');
  }

  /**
   * Verifica y otorga achievements de desafio
   */
  async checkChallengeAchievements(results: ChallengeResult[]): Promise<void> {
    for (const result of results) {
      const stats = await this.getChallengeStats(result.user_id);

      // Achievement: Primera victoria
      if (result.is_winner && stats.totalWins === 1) {
        await this.achievementsService.unlock(result.user_id, 'FIRST_VICTORY');
      }

      // Achievement: 10 victorias
      if (result.is_winner && stats.totalWins === 10) {
        await this.achievementsService.unlock(result.user_id, 'CHALLENGER_10');
      }

      // Achievement: Racha de 3 victorias
      if (result.is_winner && stats.currentWinStreak === 3) {
        await this.achievementsService.unlock(result.user_id, 'WIN_STREAK_3');
      }

      // Achievement: Score perfecto
      if (result.score === 100) {
        await this.achievementsService.unlock(result.user_id, 'PERFECT_DUEL');
      }
    }
  }

  /**
   * Obtiene estadisticas de desafios del usuario
   */
  async getChallengeStats(userId: string): Promise<ChallengeStats> {
    return this.resultsRepo
      .createQueryBuilder('r')
      .select('COUNT(*)', 'totalChallenges')
      .addSelect('SUM(CASE WHEN r.is_winner THEN 1 ELSE 0 END)', 'totalWins')
      .addSelect('AVG(r.score)', 'averageScore')
      .where('r.user_id = :userId', { userId })
      .getRawOne();
  }
}

interface CalculatedReward {
  xp: number;
  coins: number;
}

interface ChallengeStats {
  totalChallenges: number;
  totalWins: number;
  averageScore: number;
  currentWinStreak: number;
}

interface RewardsDistribution {
  challengeId: string;
  rewards: {
    userId: string;
    xp: number;
    coins: number;
  }[];
}
```

### 2. Challenge Achievements (15%)

```sql
-- seeds/achievements-challenges.sql (NUEVO)
INSERT INTO gamification_system.achievement_definitions VALUES
('FIRST_VICTORY', 'Primera Victoria', 'Gana tu primer desafio', 'challenges', 50, 20),
('CHALLENGER_10', 'Retador Experto', 'Gana 10 desafios', 'challenges', 200, 50),
('CHALLENGER_50', 'Maestro de Duelos', 'Gana 50 desafios', 'challenges', 500, 150),
('WIN_STREAK_3', 'Racha Imparable', '3 victorias consecutivas', 'challenges', 100, 30),
('WIN_STREAK_5', 'Dominador', '5 victorias consecutivas', 'challenges', 200, 75),
('PERFECT_DUEL', 'Duelo Perfecto', 'Score 100 en un desafio', 'challenges', 75, 25),
('SPEED_DEMON', 'Demonio de Velocidad', 'Gana en menos de 2 minutos', 'challenges', 100, 30);
```

### 3. Frontend Results Display (10%)

```typescript
// components/ChallengeResults.tsx (NUEVO)
interface ChallengeResultsProps {
  results: ChallengeResult[];
  currentUserId: string;
}

export const ChallengeResults: React.FC<ChallengeResultsProps> = ({
  results,
  currentUserId,
}) => {
  const userResult = results.find(r => r.user_id === currentUserId);
  const isWinner = userResult?.is_winner;

  return (
    <div className="challenge-results">
      <div className={cn('result-banner', isWinner ? 'winner' : 'loser')}>
        {isWinner ? (
          <>
            <TrophyIcon className="animate-bounce" />
            <h2>Victoria!</h2>
          </>
        ) : (
          <>
            <ShieldIcon />
            <h2>Buen intento</h2>
          </>
        )}
      </div>

      <div className="rewards-earned">
        <div className="reward-item">
          <XPIcon />
          <span>+{userResult?.xp_earned} XP</span>
        </div>
        <div className="reward-item">
          <CoinIcon />
          <span>+{userResult?.coins_earned} Coins</span>
        </div>
      </div>

      <div className="scoreboard">
        {results
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((result, index) => (
            <ScoreboardRow
              key={result.user_id}
              rank={index + 1}
              result={result}
              isCurrentUser={result.user_id === currentUserId}
            />
          ))}
      </div>
    </div>
  );
};
```

---

## Tabla de Recompensas

### Recompensas Base

| Resultado | XP Base | Coins Base |
|-----------|---------|------------|
| Participar | 50 | 10 |
| Ganar | +100 | +25 |
| Score 100% | +25 | +10 |
| Terminar rapido | +15 | +5 |

### Multiplicadores

| Fuente | XP Mult | Coins Mult |
|--------|---------|------------|
| Rank Maya | 1.0x - 2.0x | 1.0x - 1.5x |
| Win Streak | +10% por victoria | +5% por victoria |
| Dificultad Expert | +50% | +30% |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/challenges/:id/results` | Resultados del desafio |
| GET | `/challenges/:id/rewards` | Recompensas distribuidas |
| GET | `/challenges/stats` | Mis estadisticas de desafios |
| GET | `/challenges/leaderboard` | Top challengers |

---

## Criterios de Aceptacion

### Funcionales
- [x] Resultados se guardan al completar
- [ ] Recompensas calculadas con multiplicadores
- [ ] XP y coins acreditados automaticamente
- [ ] Achievements desbloqueados
- [ ] UI de resultados con animacion

### No Funcionales
- [ ] Distribucion < 2 segundos
- [ ] Notificacion WebSocket de resultados
- [ ] Transacciones atomicas

---

## Dependencias

### Bloqueado Por
- ChallengeResult Entity (COMPLETO)
- MLCoins Service (COMPLETO)
- Achievements Service (COMPLETO)

### Bloquea
- Challenge Leaderboards
- Challenge History
- Season Rewards

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| ChallengeRewardsService | 8h |
| Achievement Definitions | 3h |
| Frontend Results | 6h |
| Integration | 3h |
| Tests | 3h |
| **Total** | **23h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PEER-004-rewards.md*
*Generado: 2026-01-27*
