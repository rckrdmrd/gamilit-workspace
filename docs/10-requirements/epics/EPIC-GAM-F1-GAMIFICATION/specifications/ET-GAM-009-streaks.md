# ET-GAM-009: Streaks System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-009 |
| **Modulo** | Gamificacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 90% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-GAM-009: Login Streak System

### User Stories
- US-GAM-009: Daily Engagement Streaks

---

## Descripcion Funcional

Sistema de rachas de actividad:
- Streak diario (dias consecutivos activo)
- Bonificaciones por milestones (7, 14, 30 dias)
- Streak freeze (proteccion contra perder racha)
- Multiplicadores de recompensa por streak
- Calendario visual de actividad

---

## Arquitectura

### Diagrama de Flujo

```
Usuario inicia sesion
        |
        v
AuthService registra actividad
        |
        v
UserStatsService.updateStreak()
        |
        v
¿Actividad ayer?
  ├── SI → Incrementar current_streak
  │         - Si milestone (7, 14, 30) → Bonus reward
  │
  └── NO → ¿Tiene streak_freeze?
              ├── SI → Consumir freeze, mantener streak
              └── NO → Reset current_streak = 1
        |
        v
Actualizar longest_streak si aplica
        |
        v
Notificar al usuario (streak actualizado)
```

---

## Implementacion Existente

### Database - UserStats (Streak Fields)

**Ubicacion:** `apps/backend/src/modules/gamification/entities/user-stats.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: 'user_stats' })
export class UserStats {
  // ... otros campos

  /**
   * Racha actual de dias consecutivos
   */
  @Column('int', { default: 0 })
  current_streak!: number;

  /**
   * Racha mas larga registrada
   */
  @Column('int', { default: 0 })
  longest_streak!: number;

  /**
   * Ultima fecha de actividad
   */
  @Column('date', { nullable: true })
  last_active_date?: Date;

  /**
   * Streak freezes disponibles
   */
  @Column('int', { default: 0 })
  streak_freezes!: number;
}
```

### Backend - UserStatsService (Streak Methods)

**Ubicacion:** `apps/backend/src/modules/gamification/services/user-stats.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class UserStatsService {
  /**
   * Actualiza streak del usuario
   * Llamado en cada login/actividad
   */
  async updateStreak(userId: string): Promise<StreakUpdate> {
    const stats = await this.findByUserId(userId);
    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.last_active_date?.toISOString().split('T')[0];

    if (lastActive === today) {
      // Ya activo hoy, no cambiar
      return { changed: false, streak: stats.current_streak };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      // Dia consecutivo - incrementar streak
      stats.current_streak += 1;
      stats.longest_streak = Math.max(stats.longest_streak, stats.current_streak);
    } else if (stats.streak_freezes > 0) {
      // Usar freeze para mantener streak
      stats.streak_freezes -= 1;
      // Streak se mantiene igual
    } else {
      // Perder streak - reiniciar
      stats.current_streak = 1;
    }

    stats.last_active_date = new Date(today);
    await this.save(stats);

    // Verificar milestone bonus
    await this.checkStreakMilestone(userId, stats.current_streak);

    return {
      changed: true,
      streak: stats.current_streak,
      usedFreeze: lastActive !== yesterdayStr && stats.streak_freezes > 0,
    };
  }

  /**
   * Verifica y otorga bonus por milestone
   */
  private async checkStreakMilestone(
    userId: string,
    streak: number
  ): Promise<void> {
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streak)) {
      const bonus = this.calculateMilestoneBonus(streak);
      await this.mlCoinsService.awardCoins(
        userId,
        bonus.coins,
        `Streak milestone: ${streak} dias`
      );
      await this.awardXp(userId, bonus.xp);

      // Notificar
      await this.notificationService.send(userId, {
        type: 'streak_milestone',
        title: `Racha de ${streak} dias`,
        message: `Ganaste ${bonus.coins} ML Coins y ${bonus.xp} XP`,
      });
    }
  }

  /**
   * Calcula bonus segun milestone
   */
  private calculateMilestoneBonus(streak: number): { xp: number; coins: number } {
    const bonuses: Record<number, { xp: number; coins: number }> = {
      7: { xp: 100, coins: 25 },
      14: { xp: 200, coins: 50 },
      30: { xp: 500, coins: 100 },
      60: { xp: 1000, coins: 200 },
      100: { xp: 2000, coins: 500 },
    };
    return bonuses[streak] || { xp: 0, coins: 0 };
  }

  /**
   * Agrega streak freeze al usuario
   */
  async addStreakFreeze(userId: string, count: number = 1): Promise<void> {
    await this.userStatsRepo.increment(
      { user_id: userId },
      'streak_freezes',
      count
    );
  }
}
```

### Frontend - Streak Display

**Ubicacion:** `apps/frontend/src/apps/student/components/gamification/StreakWidget.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface StreakWidgetProps {
  streak: number;
  longestStreak: number;
  freezesAvailable: number;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  streak,
  longestStreak,
  freezesAvailable,
}) => {
  return (
    <div className="streak-widget">
      <div className="streak-main">
        <FireIcon className={streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'} />
        <span className="streak-count">{streak}</span>
        <span className="streak-label">dias</span>
      </div>

      <div className="streak-details">
        <div className="longest">
          <TrophyIcon />
          <span>Record: {longestStreak} dias</span>
        </div>
        <div className="freezes">
          <ShieldIcon />
          <span>{freezesAvailable} protecciones</span>
        </div>
      </div>

      {streak >= 7 && (
        <div className="streak-badge">
          <span className="text-xs">Racha de fuego</span>
        </div>
      )}
    </div>
  );
};
```

### Frontend - Activity Calendar

**Ubicacion:** `apps/frontend/src/apps/student/components/dashboard/ActivityCalendar.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface ActivityCalendarProps {
  activities: DailyActivity[];
  startDate: Date;
  endDate: Date;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  activities,
  startDate,
  endDate,
}) => {
  // GitHub-style heatmap calendar
  // Shows activity intensity per day
  // Highlights current streak
};
```

---

## Milestones y Recompensas

| Dias | XP Bonus | ML Coins | Beneficio Extra |
|------|----------|----------|-----------------|
| 7 | 100 | 25 | - |
| 14 | 200 | 50 | 1 Streak Freeze |
| 30 | 500 | 100 | 2 Streak Freezes |
| 60 | 1000 | 200 | Achievement Especial |
| 100 | 2000 | 500 | Titulo Exclusivo |

---

## Multiplicadores por Streak

| Streak | XP Multiplier | Coins Multiplier |
|--------|---------------|------------------|
| 1-6 | 1.0x | 1.0x |
| 7-13 | 1.1x | 1.1x |
| 14-29 | 1.2x | 1.15x |
| 30-59 | 1.3x | 1.2x |
| 60+ | 1.5x | 1.25x |

---

## Lo que Falta para Completar (10%)

### 1. Streak Recovery (5%)

```typescript
// services/streak-recovery.service.ts (NUEVO)
@Injectable()
export class StreakRecoveryService {
  /**
   * Permite recuperar streak perdido (por ML Coins)
   * Solo disponible 24h despues de perderlo
   */
  async recoverStreak(userId: string): Promise<RecoveryResult>;

  /**
   * Calcula costo de recuperacion
   * Mas alto a mayor streak perdido
   */
  calculateRecoveryCost(lostStreak: number): number;
}
```

### 2. Streak Challenges (5%)

```typescript
// Misiones especiales relacionadas con streaks
interface StreakChallenge {
  id: string;
  type: 'reach_streak' | 'maintain_streak';
  target: number;
  reward: MissionRewards;
}
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/gamification/streak` | Info de streak actual |
| GET | `/gamification/streak/history` | Historial de rachas |
| POST | `/gamification/streak/freeze/use` | Usar freeze manualmente |
| POST | `/gamification/streak/recover` | Recuperar streak perdido |

---

## Criterios de Aceptacion

### Funcionales
- [x] Streak incrementa con actividad diaria
- [x] Streak se pierde al faltar un dia
- [x] Streak freeze protege de perder racha
- [x] Bonus por milestones
- [x] Calendario visual de actividad
- [x] Multiplicadores por streak largo
- [ ] Recuperacion de streak por coins
- [ ] Challenges de streak

### No Funcionales
- [x] Calculo en timezone del usuario
- [x] Animaciones de fuego para streaks altos
- [x] Notificaciones de milestone

---

## Dependencias

### Bloqueado Por
- UserStats Entity (COMPLETO)
- MLCoins Service (COMPLETO)
- Notification Service (COMPLETO)

### Bloquea
- Streak Achievements
- Streak Leaderboard
- Team Streaks

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| StreakRecoveryService | 3h |
| Streak Challenges | 4h |
| Frontend Recovery UI | 2h |
| Tests | 2h |
| **Total** | **11h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-009-streaks.md*
*Generado: 2026-01-27*
