# Sistemas Complementarios

**Proyecto:** Gamilit Platform
**Módulo:** Gamificación
**Archivo original:** SISTEMA-GAMIFICACION.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## CONTENIDO

Este documento cubre los siguientes sistemas complementarios de gamificación:
1. Sistema de Streaks (Rachas)
2. Sistema de Power-ups
3. Sistema de Misiones
4. Sistema de Leaderboards
5. Notificaciones y Feedback
6. Dashboard de Estadísticas

---

# 1. SISTEMA DE STREAKS

## 1.1 Definición

**Streak (Racha):** Días consecutivos en los que el estudiante realiza al menos una actividad en la plataforma.

## 1.2 Reglas de Validación

```typescript
// Lógica en streaks.service.ts:logActivity()

const hoursSinceActivity = (now - lastActivityAt) / (1000 * 60 * 60);

if (hoursSinceActivity <= 24) {
  // Actividad dentro de 24 horas
  const daysSinceLast = Math.floor(hoursSinceActivity / 24);

  if (daysSinceLast === 1) {
    // Día consecutivo
    currentStreak += 1;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  } else if (daysSinceLast === 0) {
    // Mismo día, solo actualizar timestamp
    // No incrementar streak
  }
} else {
  // Más de 24 horas, racha rota
  currentStreak = 1; // Reset a 1 (actividad de hoy)
}
```

## 1.3 Campos en `user_stats`

- `current_streak`: Días consecutivos actuales
- `longest_streak`: Mejor racha histórica (record personal)
- `last_login_at`: Última vez que se actualizó streak

## 1.4 Rewards por Streak

**Fórmula:**
```
streakBonus = 2 × current_streak (máximo razonable: ~30 días)
```

**Aplicado en:**
- Cada ejercicio completado
- Con multiplicador de rango

**Ejemplo:**
- Estudiante con 7 días de streak en rango Ah K'in (1.5x)
- Completa ejercicio: 15 base + (2 × 7) = 29 coins
- Con multiplicador: 29 × 1.5 = **43 coins**

## 1.5 CRON Job para Reset

**BUG conocido:** Streaks pueden quedar activos indefinidamente si CRON no está configurado

**CRON necesario:**
```typescript
// Ejecutar diariamente a medianoche
async checkInactiveStreaks() {
  await db.query(`
    UPDATE gamification_system.user_stats
    SET current_streak = 0
    WHERE last_activity_at < NOW() - INTERVAL '24 hours'
      AND current_streak > 0
  `);
}
```

**Prioridad:** P1 - Verificar que CRON esté activo en producción

## 1.6 Integración con Eventos

```typescript
// En cualquier acción significativa del usuario
import { StreaksService } from '../gamification/streaks/streaks.service';

await StreaksService.logActivity(userId);
// Actualiza automáticamente current_streak si corresponde
```

---

# 2. SISTEMA DE POWER-UPS

## 2.1 Power-ups Disponibles

| Power-up | Costo | Función | Uso |
|----------|-------|---------|-----|
| **Pistas** | 15 ML | Revela 1 hint del ejercicio | 1 vez por ejercicio, máximo 3 hints |
| **Visión Lectora** | 25 ML | Resalta keywords importantes en texto | 1 vez por ejercicio, duración 60s |
| **Segunda Oportunidad** | 40 ML | Permite reintentar ejercicio sin penalty | 1 vez por ejercicio |

## 2.2 Flujo de Compra

1. Usuario selecciona power-up en shop
2. Frontend valida `user.mlCoins >= powerup.cost`
3. POST `/api/powerups/purchase` con `{powerupType, quantity}`
4. Backend:
   a. Valida balance actual
   b. Deduce ML Coins (crea transacción `'spent_powerup'`)
   c. Incrementa `powerups.{tipo}` en tabla `gamification_system.powerups`
   d. Todo en transacción atómica (BEGIN/COMMIT)
5. Backend retorna nuevo balance y inventario

## 2.3 Flujo de Uso

1. Durante ejercicio, usuario activa power-up
2. Frontend valida `powerups.{tipo} > 0`
3. POST `/api/powerups/use` con `{powerupType, exerciseId}`
4. Backend:
   a. Valida inventario > 0
   b. Decrementa `powerups.{tipo}`
   c. Registra uso en metadata (opcional)
   d. Aplica efecto (ej: revela hint)
5. Frontend renderiza efecto visual (highlight, modal, etc.)

## 2.4 Tabla `gamification_system.powerups`

**Estructura:**
```sql
CREATE TABLE gamification_system.powerups (
  user_id UUID PRIMARY KEY,
  pistas INTEGER DEFAULT 0,
  vision_lectora INTEGER DEFAULT 0,
  segunda_oportunidad INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 2.5 Penalización en Score

**Regla:** Usar power-ups reduce el score final

- **Pistas:** -10 puntos por hint usado
- **Visión Lectora:** -5 puntos por uso
- **Segunda Oportunidad:** No aplica penalty (ya pagó con ML Coins)

**Lógica en `scoring.service.ts`:**
```typescript
let penalties = 0;
penalties += hintsUsed * 10;
penalties += visionLectoraUsed ? 5 : 0;

finalScore = Math.max(0, baseScore - penalties);
```

## 2.6 Endpoints Backend

```
GET  /api/gamification/powerups/inventory/:userId  - Inventario actual
POST /api/gamification/powerups/purchase           - Comprar power-up
POST /api/gamification/powerups/use                - Usar power-up
GET  /api/gamification/powerups/available          - Power-ups disponibles en shop
```

---

# 3. SISTEMA DE MISIONES

## 3.1 Tipos de Misiones

| Tipo | Duración | Cantidad Simultánea | Rewards Típicos |
|------|----------|---------------------|-----------------|
| **Daily** | 24 horas | 3 misiones | 50-200 ML Coins, 100-300 XP |
| **Weekly** | 7 días | 5 misiones | 300-500 ML Coins, 500-1000 XP |
| **Special** | Sin expiración | Variable | 500+ ML Coins, 1000+ XP, achievements |

## 3.2 Objetivos de Misiones

**Tipos de objetivos:**
- `complete_exercises`: Completar N ejercicios
- `earn_coins`: Ganar X ML Coins
- `perfect_scores`: Obtener Y scores de 100%
- `streak_days`: Mantener Z días de racha
- `module_progress`: Avanzar en módulo específico
- `use_powerups`: Usar power-ups (promocional)

## 3.3 Estructura de Misión

```typescript
interface Mission {
  id: string;
  userId: string;
  missionType: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  objectives: Array<{
    type: ObjectiveType;
    target: number;
    current: number;
    completed: boolean;
  }>;
  rewards: {
    mlCoins: number;
    xp: number;
    achievements?: string[]; // IDs de achievements a otorgar
  };
  expiresAt: Date;
  completedAt?: Date;
}
```

## 3.4 Templates de Misiones (30+)

### Ejemplo Daily:
```json
{
  "id": "daily_complete_5_exercises",
  "title": "Estudiante Dedicado",
  "description": "Completa 5 ejercicios hoy",
  "objectives": [{
    "type": "complete_exercises",
    "target": 5
  }],
  "rewards": {
    "mlCoins": 100,
    "xp": 200
  }
}
```

### Ejemplo Weekly:
```json
{
  "id": "weekly_maintain_streak",
  "title": "Racha Imparable",
  "description": "Mantén una racha de 7 días consecutivos",
  "objectives": [{
    "type": "streak_days",
    "target": 7
  }],
  "rewards": {
    "mlCoins": 500,
    "xp": 1000,
    "achievements": ["streak_master"]
  }
}
```

## 3.5 CRON Job para Expiración

```typescript
// Ejecutar diariamente a medianoche
async expireOldMissions() {
  await db.query(`
    UPDATE gamification_system.missions
    SET status = 'expired'
    WHERE expires_at < NOW()
      AND status = 'active'
  `);

  // Generar nuevas misiones daily
  await generateDailyMissionsForAllUsers();
}
```

## 3.6 Integración con Eventos - BUG CONOCIDO

**Problema:** Misiones no auto-progresan al completar ejercicios

**Solución requerida:**
```typescript
// En scoring.service.ts después de guardar intento
import { MissionEvents } from '../gamification/missions/missions.events';

await MissionEvents.onExerciseCompleted(userId, {
  exerciseId,
  type: exerciseType,
  score: finalScore,
  isPerfect: finalScore === 100
});
```

**Prioridad:** P2 - Medio (misiones funcionan con progreso manual)

## 3.7 Endpoints Backend

```
GET  /api/missions/daily/:userId           - Misiones diarias activas
GET  /api/missions/weekly/:userId          - Misiones semanales activas
GET  /api/missions/special/:userId         - Misiones especiales
POST /api/missions/update-progress         - Actualizar progreso (manual)
POST /api/missions/complete                - Completar misión y reclamar rewards
GET  /api/missions/stats/:userId           - Estadísticas de misiones
GET  /api/missions/available/:userId       - Misiones disponibles para aceptar
POST /api/missions/claim-rewards           - Reclamar recompensas
```

---

# 4. SISTEMA DE LEADERBOARDS

## 4.1 Tipos de Leaderboards

| Tipo | Scope | Criterio | Actualización |
|------|-------|----------|---------------|
| **Global** | Todos los usuarios | Total XP | Cada ejercicio completado |
| **School** | Usuarios de misma escuela (tenant) | Total XP | Cada ejercicio completado |
| **Classroom** | Usuarios de misma clase | Total XP | Cada ejercicio completado |
| **Weekly** | Todos los usuarios | XP ganado esta semana | Semanal (reset lunes) |
| **Module** | Por módulo específico | Score promedio en módulo | Al completar ejercicio del módulo |

## 4.2 Vistas Materializadas

**Para performance:** Leaderboards usan tablas materializadas

```sql
CREATE MATERIALIZED VIEW gamification_system.leaderboard_global AS
SELECT
  user_id,
  total_xp,
  current_rank,
  ml_coins,
  ROW_NUMBER() OVER (ORDER BY total_xp DESC) as position
FROM gamification_system.user_stats
ORDER BY total_xp DESC
LIMIT 100;

-- Refresh manual o automático (CRON)
REFRESH MATERIALIZED VIEW gamification_system.leaderboard_global;
```

**Beneficio:** Queries de leaderboard 30x más rápidos (450ms → 15ms)

## 4.3 API Endpoints

```
GET /api/leaderboards/global?limit=10          - Top 10 global
GET /api/leaderboards/school/:schoolId         - Top escuela
GET /api/leaderboards/classroom/:classroomId   - Top clase
GET /api/leaderboards/weekly                    - Top semana actual
GET /api/leaderboards/user/:userId/position    - Posición del usuario
```

## 4.4 Optimización Recomendada (P2)

**Implementar Redis cache:**
- TTL: 5 minutos para leaderboards
- Invalidar en eventos de score update
- Reducir carga en DB de 450ms a <50ms

**Tiempo estimado:** 2 días de desarrollo

---

# 5. NOTIFICACIONES Y FEEDBACK

## 5.1 Eventos de Notificación

**Tipos de notificaciones:**
- `achievement_unlocked`: "Desbloqueaste el logro [nombre]"
- `rank_promotion`: "¡Ascendiste a rango [nombre]! +[coins] ML Coins"
- `mission_completed`: "Completaste la misión [nombre]"
- `streak_milestone`: "¡[N] días de racha! Sigue así"
- `leaderboard_position`: "Subiste al puesto #[N] en el leaderboard"
- `powerup_purchased`: "Compraste [cantidad]× [powerup]"

## 5.2 Canales de Notificación

**Implementados:**
- ✅ In-app notifications (modal, toast)
- ✅ Real-time via WebSocket
- ❌ Email notifications (no implementado)
- ❌ Push notifications (no implementado)

## 5.3 Sistema de Confeti y Animaciones

**En eventos importantes:**
- Rank promotion: Confeti + animación de badge
- Achievement unlock: Confeti + modal con detalles
- Perfect score: Animación de estrellas
- Mission complete: Animación de checkmark

**Librería:** Framer Motion para todas las animaciones

---

# 6. DASHBOARD DE ESTADÍSTICAS

## 6.1 Vista de Estudiante

**Widgets:**
- Balance de ML Coins actual
- Rango actual + progreso a siguiente rango
- Current streak + longest streak
- Achievements desbloqueados (total y por categoría)
- Gráfico de XP ganado (últimos 30 días)
- Posición en leaderboards
- Misiones activas (daily/weekly)
- Inventario de power-ups

## 6.2 Vista de Profesor

**Widgets:**
- Top performers (estudiantes con más XP)
- Struggling students (score promedio <70%)
- Class average score por módulo
- Engagement metrics (días activos, ejercicios completados)
- Leaderboard de clase
- Distribución de rangos en clase

## 6.3 Vista de Admin

**Widgets:**
- Total usuarios activos
- ML Coins en circulación
- Achievements desbloqueados (global)
- Top modules (más completados)
- Retention rate (7, 30 días)
- Churn analysis

---

# 7. INTEGRACIONES CON MÓDULO EDUCATIVO

## 7.1 Puntos de Integración

```
EDUCATIONAL MODULE
        │
        ├─► RanksService.getUserRankInfo()
        │     → Obtiene multiplicador para scoring
        │
        ├─► RanksService.autoCheckPromotion()
        │     → Verifica rank up después de módulo completado
        │
        ├─► StreaksService.onUserActivity()
        │     → Actualiza streak tras ejercicio
        │
        ├─► AchievementsService.checkAchievements()
        │     → Intenta desbloquear logros post-submission
        │
        └─► MissionEvents.onExerciseCompleted()
              → Notifica progreso de misiones
```

## 7.2 Flujo de Rewards Post-Ejercicio

```
1. Usuario completa ejercicio
2. ScoringService.calculateScore()
   ├─ Obtiene rank multiplier
   ├─ Calcula base score
   ├─ Aplica multiplicadores (rank, difficulty, streak)
   ├─ Calcula ML Coins y XP ganados
3. ScoringService.saveAttempt()
   ├─ INSERT exercise_attempts
   └─ TRIGGER DB: auto-incrementa ml_coins + xp en user_stats
4. StreaksService.logActivity()
   └─ Actualiza current_streak si corresponde
5. AchievementsService.checkAchievements()
   └─ Verifica y desbloquea achievements (si implementado)
6. RanksService.autoCheckPromotion()
   └─ Verifica si cumple requisitos para rank up
7. MissionEvents.onExerciseCompleted()
   └─ Actualiza progreso de misiones activas
8. Return ScoreResult a frontend
```

---

# 8. BUGS CONOCIDOS Y CORRECCIONES

## 8.1 Resumen de Bugs

| Sistema | Bug | Prioridad | Estado |
|---------|-----|-----------|--------|
| Streaks | CRON no verificado | P1 | Pendiente verificar |
| Misiones | No auto-progresan | P2 | Funciona manual |
| Achievements | Auto-detection fallando | P0 | Crítico |
| Leaderboards | Sin cache Redis | P2 | Optimización |

## 8.2 Streaks - CRON Job

**Verificar que CRON esté activo:**
```bash
# En servidor de producción
crontab -l | grep streaks

# Debe mostrar:
0 0 * * * node /path/to/streaks-reset.js
```

## 8.3 Misiones - Auto-progress

**Integrar eventos:**
```typescript
// Agregar en módulos educativos
await MissionEvents.emit('exercise_completed', userId, data);
await MissionEvents.emit('coins_earned', userId, amount);
await MissionEvents.emit('streak_updated', userId, streak);
```

---

## Ver también

- [Índice del sistema de gamificación](./README.md)
- [Sistema de Rangos Maya](./01-RANGOS-MAYA.md)
- [Economía ML Coins](./02-ECONOMIA-ML-COINS.md)
- [Sistema de Achievements](./03-ACHIEVEMENTS.md)
- [Roadmap y Métricas](./05-ROADMAP-METRICAS.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Estado:** Sistemas operacionales con mejoras pendientes
