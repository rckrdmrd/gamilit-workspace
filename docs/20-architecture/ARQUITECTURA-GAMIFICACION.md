# Arquitectura de Gamificacion - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07

---

## Vision General

El sistema de gamificacion de GAMILIT esta disenado como un motor modular que integra mecanicas de videojuegos con tematica de cultura maya para motivar el aprendizaje de comprension lectora. Consta de 6 subsistemas interconectados.

```
+------------------------------------------------------------------+
|                    GAMIFICATION ENGINE                             |
|                                                                    |
|  +-------------+  +---------+  +--------+  +------+  +---------+ |
|  | XP System   |  | Rank    |  | Achiev.|  | Store |  | Leader  | |
|  | (points,    |  | System  |  | Engine |  | (ML   |  | board   | |
|  |  multipli-  |  | (maya   |  | (badg- |  | Coins,|  | (ranks, | |
|  |  ers, lvls) |  | ranks)  |  | es)    |  | items)|  | seasons)| |
|  +------+------+  +----+----+  +---+----+  +--+---+  +----+----+ |
|         |               |           |          |           |       |
|         +-------+-------+-----------+----------+-----------+       |
|                 |                                                   |
|          +------v------+                                           |
|          | Mission     |                                           |
|          | System      |                                           |
|          | (daily,     |                                           |
|          |  weekly,    |                                           |
|          |  quests)    |                                           |
|          +-------------+                                           |
+------------------------------------------------------------------+
                            |
                     +------v------+
                     | Exercise    |
                     | Engine      |
                     | (23 types,  |
                     |  scoring,   |
                     |  spaced rep)|
                     +-------------+
```

---

## 1. Sistema de XP (Puntos de Experiencia)

### Arquitectura

El sistema de XP es event-driven. Cuando un estudiante completa una accion elegible, se dispara un evento que el XP engine procesa.

```typescript
// Flujo de otorgamiento de XP
ExerciseCompleted -> XPCalculator -> MultiplierEngine -> XPTransaction -> LevelCheck -> RankCheck
```

### Calculo de XP

```
XP_base = exercise_type_xp * difficulty_multiplier
XP_quality = XP_base * (score / max_score)
XP_streak = XP_quality * streak_bonus
XP_final = round(XP_streak)
```

### Multiplicadores

| Factor | Valores | Descripcion |
|--------|---------|-------------|
| Dificultad del ejercicio | 1x, 1.5x, 2x, 3x | Segun nivel de dificultad configurado |
| Calidad de respuesta | 0.0 - 1.0 | Proporcion de respuesta correcta |
| Racha de dias | 1.0 - 2.0 | Bonus incremental por dias consecutivos |
| Primer intento | 1.5x | Bonus por resolver al primer intento |
| Modulo completado | 500 XP flat | Bonus por completar el 100% de un modulo |
| Power-up activo | 1.5x - 2.0x | Items de tienda con efecto temporal |

### Racha de Dias (Streak System)

| Dias Consecutivos | Multiplicador |
|-------------------|---------------|
| 1-2 | 1.0x |
| 3-6 | 1.1x |
| 7-13 | 1.25x |
| 14-29 | 1.5x |
| 30+ | 2.0x |

### Transacciones de XP

Toda otorgacion de XP se registra como transaccion inmutable:

```sql
-- Tabla: gamification.xp_transactions
id UUID PRIMARY KEY,
student_id UUID NOT NULL REFERENCES auth.users(id),
tenant_id UUID NOT NULL,
amount INTEGER NOT NULL,
source_type VARCHAR(50),    -- 'exercise', 'mission', 'achievement', 'bonus'
source_id UUID,
multipliers JSONB,          -- {difficulty: 2, streak: 1.25, quality: 0.85}
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 2. Sistema de Rangos Maya

### Jerarquia

Los rangos estan inspirados en la estructura social de la civilizacion maya clasica. Cada rango desbloquea beneficios y elementos visuales.

| Nivel | Rango | Titulo Maya | XP Min | XP Max | Beneficios |
|-------|-------|-------------|--------|--------|------------|
| 1 | Iniciado | Ah K'in (Sacerdote del Sol) | 0 | 999 | Acceso basico, avatar default |
| 2 | Guerrero | Nacom (Capitan Guerrero) | 1,000 | 4,999 | +10% ML Coins, avatar guerrero |
| 3 | Jefe | Batab (Jefe Local) | 5,000 | 14,999 | +20% ML Coins, titulo visible, chat |
| 4 | Gobernante | Halach Uinik (Gran Senor) | 15,000 | 49,999 | +30% ML Coins, items exclusivos |
| 5 | Senor Supremo | Ajaw (Senor Supremo) | 50,000 | - | +50% ML Coins, todos los beneficios |

### Promocion de Rango

```typescript
// Flujo de promocion
XPTransaction.saved -> RankChecker.evaluate(student) -> if (xp >= nextRank.threshold) -> promote()

promote():
  1. Actualizar rank del estudiante
  2. Otorgar recompensa de promocion (ML Coins + badge)
  3. Enviar notificacion (in-app + push)
  4. Actualizar leaderboard
  5. Registrar en achievement log
```

### Iconografia Maya
Cada rango tiene asociado:
- Icono tematico maya (glifo)
- Color de marco de perfil
- Titulo visible en leaderboard
- Efecto visual al promover (animacion)

---

## 3. Achievement Engine (Logros e Insignias)

### Tipos de Logros

| Categoria | Ejemplos | Trigger |
|-----------|----------|---------|
| Academicos | "Primer ejercicio", "Modulo 1 completado" | Event on completion |
| Consistencia | "Racha de 7 dias", "100 ejercicios" | Scheduled check |
| Sociales | "Unirse a equipo", "Ayudar companero" | Event on social action |
| Exploracion | "Probar los 5 modulos", "Usar tienda" | First-time triggers |
| Secretos | "Easter egg maya", "Patron oculto" | Hidden conditions |
| Milestones | "500 XP", "Rango Nacom", "50 ejercicios" | Threshold check |

### Arquitectura del Achievement Engine

```typescript
// Achievement evaluation pipeline
Event -> AchievementEvaluator -> ConditionChecker -> UnlockManager -> NotificationDispatcher

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;                    // Maya-themed icon
  category: AchievementCategory;
  conditions: AchievementCondition[];  // AND logic
  rewards: AchievementReward;
  hidden: boolean;                 // Secret achievements
  repeatable: boolean;             // Can be earned multiple times
}

interface AchievementCondition {
  type: 'counter' | 'threshold' | 'event' | 'streak' | 'composite';
  metric: string;                  // 'exercises_completed', 'xp_total', 'days_streak'
  operator: 'gte' | 'eq' | 'lte';
  value: number;
}
```

### Flujo de Evaluacion

1. **Evento ocurre** (ejercicio completado, login, compra, etc.)
2. **AchievementEvaluator** filtra achievements elegibles para el evento
3. **ConditionChecker** evalua todas las condiciones (AND)
4. Si todas cumplen: **UnlockManager** registra el logro
5. **NotificationDispatcher** envia notificacion al estudiante
6. **RewardEngine** otorga recompensas (XP, ML Coins)

---

## 4. Economia Virtual (ML Coins)

### Fuentes de Ingreso

| Fuente | ML Coins | Frecuencia |
|--------|----------|------------|
| Ejercicio completado (basico) | 5-15 | Por ejercicio |
| Ejercicio completado (avanzado) | 20-50 | Por ejercicio |
| Mision diaria | 10-30 | 3 por dia |
| Mision semanal | 50-100 | 5 por semana |
| Logro desbloqueado | 25-200 | Unico |
| Promocion de rango | 100-500 | Unico por rango |
| Racha de 7 dias | 50 | Semanal |
| Racha de 30 dias | 300 | Mensual |
| Completar modulo | 200 | Unico por modulo |

### Tienda Virtual

| Categoria | Items | Precio Rango | Duracion |
|-----------|-------|--------------|----------|
| Avatares | Personajes maya tematicos | 50-500 ML | Permanente |
| Marcos de perfil | Bordes decorativos | 100-300 ML | Permanente |
| Fondos | Fondos de perfil tematicos | 75-250 ML | Permanente |
| Power-ups | Multiplicador XP (1.5x) | 100 ML | 1 hora |
| Power-ups | Pista extra | 50 ML | 1 uso |
| Power-ups | Tiempo extra (+30s) | 75 ML | 1 uso |
| Efectos | Animaciones de perfil | 200-1000 ML | Permanente |
| Titulos | Titulos custom | 150-500 ML | Permanente |

### Balance Economico

```
Ingreso promedio diario: ~100-200 ML Coins (estudiante activo)
Gasto promedio diario: ~50-100 ML Coins
Time-to-earn avatar basico: ~3-5 dias
Time-to-earn power-up: ~1-2 dias
```

### Transacciones

```sql
-- Tabla: store.transactions
id UUID PRIMARY KEY,
student_id UUID NOT NULL,
tenant_id UUID NOT NULL,
type VARCHAR(20),        -- 'earn', 'spend', 'refund'
amount INTEGER NOT NULL,
balance_after INTEGER NOT NULL,
source_type VARCHAR(50), -- 'exercise', 'mission', 'achievement', 'purchase'
source_id UUID,
item_id UUID,            -- NULL for earnings
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 5. Exercise Scoring Engine

### Tipos de Evaluacion

| Modulo | Tipo | Mecanismo |
|--------|------|-----------|
| 1. Literal | Automatica | Respuesta exacta / seleccion correcta |
| 2. Inferencial | Automatica | Respuesta con margenes / fuzzy matching |
| 3. Critica | Semi-automatica | Rubrica + evaluacion manual opcional |
| 4. Digital | Automatica | Seleccion + analisis basico |
| 5. Produccion | Manual | Maestro evalua con rubrica |

### Scoring Formula

```typescript
interface ExerciseScore {
  raw_score: number;      // 0-100 (puntuacion base)
  time_bonus: number;     // 0-20 (bonus por velocidad)
  accuracy: number;       // 0.0-1.0 (precision)
  attempts: number;       // Numero de intentos
  final_score: number;    // Score ajustado
}

// Calculo
final_score = raw_score + time_bonus
xp_awarded = base_xp * (final_score / 100) * difficulty_multiplier * streak_multiplier
```

### Spaced Repetition Engine

GAMILIT implementa repeticion espaciada para reforzar aprendizaje:

```
Intervalo de repeticion:
  - Respuesta correcta: intervalo *= 2.5
  - Respuesta parcial: intervalo *= 1.5
  - Respuesta incorrecta: reset a intervalo base

  Intervalos: 1d -> 2.5d -> 6d -> 15d -> 38d -> 95d

Factores de ajuste:
  - Dificultad del ejercicio
  - Historial del estudiante en tema
  - Tiempo de respuesta (lento = mas repeticion)
```

---

## 6. Leaderboard Architecture

### Niveles de Leaderboard

| Nivel | Scope | Actualizacion |
|-------|-------|---------------|
| Aula | Estudiantes del mismo salon | Real-time (Socket.IO) |
| Escuela | Todos los estudiantes del tenant | Cada 5 minutos |
| Global | Todos los tenants | Cada 15 minutos |
| Por Modulo | Ranking por modulo educativo | Cada 5 minutos |

### Temporadas

- **Duracion:** 4 semanas por temporada
- **Reset:** XP de leaderboard se resetea, XP total permanece
- **Recompensas:** Top 3 reciben ML Coins y badges exclusivos
- **Historial:** Posiciones finales guardadas en historial

### Real-time Updates

```typescript
// Socket.IO events for leaderboard
@WebSocketGateway({ namespace: '/gamification' })
export class GamificationGateway {
  @SubscribeMessage('xp-awarded')
  handleXpAwarded(data: XpAwardedEvent) {
    // Recalculate rankings
    // Emit to relevant rooms (classroom, school)
    this.server.to(`classroom:${data.classroomId}`).emit('leaderboard-updated', rankings);
  }
}
```

### Materialized Views

Para performance en leaderboards, se usan Materialized Views:

```sql
-- MV: leaderboard_classroom_rankings
CREATE MATERIALIZED VIEW leaderboard.classroom_rankings AS
SELECT
  student_id,
  classroom_id,
  tenant_id,
  SUM(amount) as total_xp,
  RANK() OVER (PARTITION BY classroom_id ORDER BY SUM(amount) DESC) as rank
FROM gamification.xp_transactions
WHERE created_at >= current_season_start()
GROUP BY student_id, classroom_id, tenant_id;

-- Refresh cada 5 minutos via pg_cron
```

---

## Flujo Completo de Gamificacion

```
1. Estudiante completa ejercicio
   |
2. ExerciseService.submit() -> evalua y genera score
   |
3. GamificationService.processCompletion()
   |-> XPCalculator: calcula XP con multiplicadores
   |-> XPTransaction: registra transaccion
   |-> LevelChecker: verifica si sube de nivel
   |-> RankChecker: verifica si promueve de rango
   |-> AchievementEvaluator: verifica logros desbloqueados
   |-> MLCoinCalculator: calcula ML Coins ganados
   |-> MissionTracker: actualiza progreso de misiones
   |-> LeaderboardUpdater: actualiza rankings
   |
4. NotificationService.dispatch()
   |-> In-app notification (Socket.IO)
   |-> Push notification (si rango o logro)
   |
5. SpacedRepetitionService.schedule()
   |-> Programa proxima repeticion del ejercicio
```

---

## Tablas de Base de Datos (Schema gamification)

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| xp_transactions | Registro de todas las transacciones XP | Si |
| levels | Definicion de niveles | No (global) |
| rank_definitions | Definicion de rangos maya | No (global) |
| student_gamification | Estado de gamificacion por estudiante | Si |
| achievements | Catalogo de logros | No (global) |
| student_achievements | Logros desbloqueados por estudiante | Si |
| missions | Catalogo de misiones | No (global) |
| mission_progress | Progreso de misiones por estudiante | Si |
| leaderboard_entries | Entradas de leaderboard | Si |
| leaderboard_seasons | Temporadas de leaderboard | No (global) |
| store_items | Catalogo de items de tienda | No (global) |
| store_transactions | Transacciones de compra | Si |
| student_inventory | Items comprados por estudiante | Si |

---

*GAMILIT - Arquitectura de Gamificacion*
*Cultura Maya + Mecanicas de Videojuegos + Educacion*
