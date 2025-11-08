# Roadmap y Métricas de Gamificación

**Proyecto:** Gamilit Platform
**Módulo:** Gamificación
**Archivo original:** SISTEMA-GAMIFICACION.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## CONTENIDO

Este documento cubre:
1. Métricas de Gamificación
2. Roadmap de Correcciones
3. Anexos (Esquemas DB y Endpoints)

---

# 1. MÉTRICAS DE GAMIFICACIÓN

## 1.1 KPIs de Engagement

### Por Usuario:
- Current streak (días)
- Longest streak (record)
- Total ML Coins earned
- Total ML Coins spent
- Spending rate: `spent / earned × 100%`
- Achievements unlocked
- Current rank
- Days to next rank (estimado)

### Globales:
- Average streak (platform)
- ML Coins en circulación
- Inflation rate: `(coins_earned - coins_spent) / time`
- Achievement unlock rate: `achievements_unlocked / users`
- Rank distribution (% en cada rango)

## 1.2 Targets de Éxito

### Engagement:
- Average streak: >5 días
- Spending rate: 30-50% (indica balance economía)
- Achievement rate: >3 achievements/usuario/mes

### Progresión:
- 60% usuarios alcanzan rango Ah K'in (3 módulos) en 1 mes
- 30% usuarios alcanzan rango Halach Uinic (4 módulos) en 3 meses
- 10% usuarios alcanzan rango K'uk'ulkan (5 módulos) en 6 meses

## 1.3 Queries de Análisis

### 1.3.1 Distribución de Rangos
```sql
SELECT
  current_rank,
  COUNT(*) as usuarios,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_stats), 2) as porcentaje
FROM gamification_system.user_stats
GROUP BY current_rank
ORDER BY
  CASE current_rank
    WHEN 'Ajaw' THEN 1
    WHEN 'Nacom' THEN 2
    WHEN 'Ah K''in' THEN 3
    WHEN 'Halach Uinic' THEN 4
    WHEN 'K''uk''ulkan' THEN 5
  END;
```

### 1.3.2 ML Coins en Circulación
```sql
SELECT
  SUM(ml_coins) as total_circulation,
  AVG(ml_coins) as avg_per_user,
  MAX(ml_coins) as max_balance
FROM gamification_system.user_stats;
```

### 1.3.3 Tasa de Inflación
```sql
SELECT
  SUM(ml_coins_earned_total) as total_earned,
  SUM(ml_coins_spent_total) as total_spent,
  SUM(ml_coins_earned_total) - SUM(ml_coins_spent_total) as net_inflation,
  ROUND(
    (SUM(ml_coins_earned_total) - SUM(ml_coins_spent_total)) * 100.0 /
    NULLIF(SUM(ml_coins_earned_total), 0),
    2
  ) as inflation_rate_percent
FROM gamification_system.user_stats;
```

### 1.3.4 Average Streak
```sql
SELECT
  AVG(current_streak) as avg_current_streak,
  AVG(longest_streak) as avg_longest_streak,
  MAX(longest_streak) as platform_record
FROM gamification_system.user_stats
WHERE current_streak > 0;
```

### 1.3.5 Achievement Unlock Rate
```sql
SELECT
  COUNT(DISTINCT user_id) as users_with_achievements,
  COUNT(*) as total_achievements_unlocked,
  ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT user_id), 2) as avg_per_user
FROM gamification_system.user_achievements
WHERE is_completed = true;
```

### 1.3.6 Top Performers (Leaderboard)
```sql
SELECT
  u.username,
  us.total_xp,
  us.current_rank,
  us.ml_coins,
  us.current_streak,
  ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as position
FROM gamification_system.user_stats us
JOIN users u ON us.user_id = u.id
ORDER BY us.total_xp DESC
LIMIT 100;
```

### 1.3.7 Struggling Students
```sql
SELECT
  u.username,
  us.average_score,
  us.exercises_completed,
  us.current_rank
FROM gamification_system.user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.average_score < 70
  AND us.exercises_completed >= 5
ORDER BY us.average_score ASC
LIMIT 50;
```

### 1.3.8 Retention Rate (7 y 30 días)
```sql
WITH active_users AS (
  SELECT DISTINCT user_id
  FROM gamification_system.user_stats
  WHERE last_activity_at >= NOW() - INTERVAL '7 days'
),
registered_users AS (
  SELECT COUNT(*) as total
  FROM users
  WHERE created_at <= NOW() - INTERVAL '7 days'
)
SELECT
  COUNT(au.user_id) as active_7_days,
  ru.total as registered_before_7_days,
  ROUND(COUNT(au.user_id) * 100.0 / ru.total, 2) as retention_rate_7_days
FROM active_users au, registered_users ru;

-- Similar para 30 días
```

---

# 2. ROADMAP DE CORRECCIONES

## 2.1 Estado de Implementación

| Componente | Estado | Completitud | Prioridad de Corrección |
|------------|--------|-------------|-------------------------|
| Rangos Maya | ✅ Operacional | 100% | P0 (fix case mismatch) |
| Economía ML Coins | ✅ Operacional | 100% | P1 (rate limiting) |
| Achievements | ⚠️ Parcial | 20% | P0 (auto-detection) |
| Power-ups | ✅ Operacional | 100% | N/A |
| Streaks | ✅ Operacional | 100% | P1 (verify CRON) |
| Leaderboards | ✅ Operacional | 100% | P2 (Redis cache) |
| Misiones | ✅ Implementado | 90% | P2 (auto-progress) |
| Sistema de Prestigio | ❌ No existe | 0% | P3 (eliminar frontend) |

**Estado Global:** 78% completo - MVP funcional con correcciones menores requeridas

---

## 2.2 Sprint 0 (1 semana) - Bloqueadores

### ✅ Fix Maya Ranks case mismatch (4h)
**Estado:** COMPLETADO

**Solución:**
- Normalizar a lowercase en backend y frontend
- Archivos modificados:
  - `/backend/src/modules/gamification/ranks.repository.ts`
  - `/frontend/src/features/gamification/ranks/types/ranksTypes.ts`

### ✅ Verificar CRON jobs (1 día)
**Estado:** PENDIENTE VERIFICACIÓN

**Tareas:**
- Confirmar streaks reset diario
- Confirmar missions expiration diario
- Verificar logs de ejecución

**Comandos:**
```bash
# Verificar CRON activo
crontab -l

# Debe mostrar:
0 0 * * * node /path/to/streaks-reset.js
0 0 * * * node /path/to/missions-expire.js
```

---

## 2.3 Sprint 3 (2 semanas) - Features

### Achievements auto-detection (3 días)
**Prioridad:** P0 - Crítico

**Tareas:**
1. Implementar tabla `achievement_triggers`
   ```sql
   CREATE TABLE gamification_system.achievement_triggers (
     achievement_id UUID PRIMARY KEY REFERENCES achievements(id),
     trigger_type VARCHAR(50),
     target_value INTEGER,
     operator VARCHAR(10),
     additional_conditions JSONB
   );
   ```

2. Migrar lógica de `achievementsMockData.ts` (frontend) a backend

3. Integrar con eventos del módulo educativo:
   - `onExerciseComplete`
   - `onModuleComplete`
   - `onStreakUpdate`
   - `onRankPromotion`

4. Implementar método `checkAchievements()` completo

**Tiempo estimado:** 3 días
**Impacto:** +30% retención estimada

### Leaderboards cache (2 días)
**Prioridad:** P2 - Optimización

**Tareas:**
1. Implementar Redis cache con TTL 5min
2. Invalidar en score update events
3. Migración de queries a Redis

**Tiempo estimado:** 2 días
**Beneficio:** Reducir carga en DB de 450ms a <50ms

---

## 2.4 Backlog - Mejoras Futuras

### Sistema de prestigio (2-3 semanas)
**Prioridad:** P3

**Decisión de producto requerida:**
- Opción A: Implementar backend completo
- Opción B: Eliminar frontend (recomendado)

**Análisis:**
- Frontend muestra sistema de prestigio
- Backend NO tiene implementación
- Genera confusión en usuarios

### Guilds & Friends (4 semanas)
**Prioridad:** Backlog

**Features:**
- Sistema de guilds (grupos de estudiantes)
- Sistema de amigos
- Misiones cooperativas
- Leaderboards de guilds

**Tiempo estimado:** 4 semanas

### Email notifications (1 semana)
**Prioridad:** Backlog

**Eventos a notificar:**
- Rank promotion
- Achievement unlock
- Mission expiring soon
- Weekly summary

### Push notifications (1 semana)
**Prioridad:** Backlog

**Integración con:**
- Firebase Cloud Messaging (FCM)
- Apple Push Notification service (APNs)

### Advanced analytics dashboard (2 semanas)
**Prioridad:** Backlog

**Métricas avanzadas:**
- Cohort analysis
- Churn prediction
- A/B testing framework
- Funnel analysis

---

# 3. ANEXOS

## 3.1 Esquemas de Base de Datos

**Nota:** Esquemas SQL completos no existen en código actual. Se infieren de repositorios TypeScript.

### Schemas principales:

#### 3.1.1 `user_stats` (Tabla Central)
```sql
CREATE TABLE gamification_system.user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_xp INTEGER DEFAULT 0,
  ml_coins INTEGER DEFAULT 0,
  ml_coins_earned_total INTEGER DEFAULT 0,
  ml_coins_spent_total INTEGER DEFAULT 0,
  current_rank VARCHAR(50) DEFAULT 'Ajaw',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_activity_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.2 `ml_coins_transactions`
```sql
CREATE TABLE gamification_system.ml_coins_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  transaction_type VARCHAR(50),
  amount INTEGER,
  balance_before INTEGER,
  balance_after INTEGER,
  multiplier DECIMAL(3,2),
  bonus_applied BOOLEAN DEFAULT false,
  reference_id UUID,
  reference_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.3 `achievements`
```sql
CREATE TABLE gamification_system.achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(255),
  rarity VARCHAR(20),
  ml_coins_reward INTEGER,
  xp_reward INTEGER,
  is_secret BOOLEAN DEFAULT false,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.4 `user_achievements`
```sql
CREATE TABLE gamification_system.user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);
```

#### 3.1.5 `user_ranks` (Historial)
```sql
CREATE TABLE gamification_system.user_ranks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  rank_name VARCHAR(50),
  achieved_at TIMESTAMP DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,
  modules_completed INTEGER,
  average_score DECIMAL(5,2)
);
```

#### 3.1.6 `powerups`
```sql
CREATE TABLE gamification_system.powerups (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  pistas INTEGER DEFAULT 0,
  vision_lectora INTEGER DEFAULT 0,
  segunda_oportunidad INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.7 `missions`
```sql
CREATE TABLE gamification_system.missions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mission_type VARCHAR(20),
  title VARCHAR(200),
  description TEXT,
  objectives JSONB,
  rewards JSONB,
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.8 `leaderboard_global` (Vista Materializada)
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
```

### Acción requerida:
Crear `schema.sql` completo (Sprint 0, 2 días)

---

## 3.2 Endpoints Backend (43 total)

### Rangos (7 endpoints)
```
GET  /api/gamification/ranks                      - Lista todos los rangos
GET  /api/gamification/ranks/user/:userId         - Rango actual del usuario
POST /api/gamification/ranks/check-promotion      - Verifica si puede ascender
POST /api/gamification/ranks/promote              - Ejecuta promoción manual (admin)
GET  /api/gamification/ranks/history/:userId      - Historial de rangos
GET  /api/gamification/ranks/multiplier/:userId   - Multiplicador actual
GET  /api/gamification/ranks/stats                - Estadísticas globales de rangos
```

### ML Coins (7 endpoints)
```
GET  /api/gamification/coins/balance/:userId      - Balance actual
POST /api/gamification/coins/earn                 - Registrar ganancia
POST /api/gamification/coins/spend                - Gastar coins
GET  /api/gamification/coins/transactions/:userId - Historial de transacciones
GET  /api/gamification/coins/leaderboard          - Top usuarios por coins
GET  /api/gamification/coins/stats                - Estadísticas globales
GET  /api/gamification/coins/metrics              - Métricas de economía
```

### Achievements (5 endpoints)
```
GET  /api/gamification/achievements               - Lista todos los achievements
GET  /api/gamification/achievements/user/:userId  - Achievements del usuario
POST /api/gamification/achievements/check         - Verificar desbloqueos
POST /api/gamification/achievements/unlock        - Desbloquear achievement
GET  /api/gamification/achievements/progress/:userId - Progreso
```

### Power-ups (4 endpoints)
```
GET  /api/gamification/powerups/inventory/:userId - Inventario actual
POST /api/gamification/powerups/purchase          - Comprar power-up
POST /api/gamification/powerups/use               - Usar power-up
GET  /api/gamification/powerups/available         - Power-ups disponibles
```

### Leaderboards (5+ endpoints)
```
GET /api/leaderboards/global                      - Top 10 global
GET /api/leaderboards/school/:schoolId            - Top escuela
GET /api/leaderboards/classroom/:classroomId      - Top clase
GET /api/leaderboards/weekly                      - Top semana actual
GET /api/leaderboards/user/:userId/position       - Posición del usuario
GET /api/leaderboards/module/:moduleId            - Top por módulo
```

### Misiones (9 endpoints)
```
GET  /api/missions/daily/:userId                  - Misiones diarias
GET  /api/missions/weekly/:userId                 - Misiones semanales
GET  /api/missions/special/:userId                - Misiones especiales
POST /api/missions/update-progress                - Actualizar progreso
POST /api/missions/complete                       - Completar misión
GET  /api/missions/stats/:userId                  - Estadísticas
GET  /api/missions/available/:userId              - Misiones disponibles
POST /api/missions/claim-rewards                  - Reclamar recompensas
GET  /api/missions/templates                      - Templates de misiones
```

### Streaks (3 endpoints)
```
GET  /api/gamification/streaks/:userId            - Streak actual
POST /api/gamification/streaks/log-activity       - Registrar actividad
GET  /api/gamification/streaks/leaderboard        - Top streaks
```

### Legacy (3 endpoints)
```
GET  /api/gamification/stats/:userId              - Estadísticas generales
POST /api/gamification/coins/add                  - (Deprecated) Agregar coins
GET  /api/gamification/transactions/:userId       - (Deprecated) Transacciones
```

---

## 3.3 Referencias de Documentación

### Documentos fuente originales:
- Análisis de gamificación (histórico - glit-analisys)
- Análisis ejecutivo (histórico - glit-analisys)
- Validación cruzada (histórico - glit-analisys)

**Nota:** Documentos históricos archivados (no incluidos en este proyecto)

### Sistema modularizado:
- [01-RANGOS-MAYA.md](./01-RANGOS-MAYA.md) - Fuente canónica P0-001
- [02-ECONOMIA-ML-COINS.md](./02-ECONOMIA-ML-COINS.md) - Economía virtual
- [03-ACHIEVEMENTS.md](./03-ACHIEVEMENTS.md) - Sistema de logros
- [04-SISTEMAS-COMPLEMENTARIOS.md](./04-SISTEMAS-COMPLEMENTARIOS.md) - Streaks, Power-ups, Misiones, Leaderboards

---

## Ver también

- [Índice del sistema de gamificación](./README.md)
- [Sistema de Rangos Maya](./01-RANGOS-MAYA.md)
- [Economía ML Coins](./02-ECONOMIA-ML-COINS.md)
- [Sistema de Achievements](./03-ACHIEVEMENTS.md)
- [Sistemas Complementarios](./04-SISTEMAS-COMPLEMENTARIOS.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Versión:** 2.0 (RFC-0001 Modularizado)
**Estado:** Roadmap actualizado con prioridades P0-P3
