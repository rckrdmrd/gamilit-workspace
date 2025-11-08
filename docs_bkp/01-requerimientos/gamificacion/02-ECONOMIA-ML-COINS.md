# Sistema de Economía ML Coins

**Proyecto:** Gamilit Platform
**Módulo:** Gamificación
**Archivo original:** SISTEMA-GAMIFICACION.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## 1. DEFINICIÓN

**ML Coins = Machine Learning Coins**

Moneda virtual de la plataforma que representa el valor acumulado del aprendizaje del estudiante. Inspirada en el concepto de "machine learning" como proceso iterativo de mejora.

---

## 2. FORMAS DE GANAR ML COINS

| Acción | ML Coins Base | Multiplicador Aplicado | Notas |
|--------|---------------|------------------------|-------|
| **Completar ejercicio** | 15 | ✅ Rank | Base reward |
| **Score perfecto (100%)** | +6 a +12 | ✅ Rank | Según dificultad (easy: +6, medium: +9, hard: +12) |
| **Primer intento exitoso** | +15 | ✅ Rank | Bonus por no usar hints |
| **Daily streak** | +2 × días | ✅ Rank | Máximo razonable: ~14 días = 28 coins |
| **Completar módulo** | +50 | ✅ Rank | One-time por módulo |
| **Achievement** | +25 a +200 | ✅ Rank | Según rareza (common: 25, rare: 50, epic: 100, legendary: 200) |
| **Daily login** | +10 | ❌ No | Una vez al día |
| **Promoción de rango** | +50 a +150 | ❌ No | Bonus fijo por rango (ver tabla Rangos) |
| **Completar misión diaria** | +50 a +200 | ❌ No | Predefinido en template de misión |
| **Completar misión semanal** | +300 a +500 | ❌ No | Predefinido en template de misión |

---

## 3. FORMAS DE GASTAR ML COINS

| Item | Costo | Efecto | Límite |
|------|-------|--------|--------|
| **Power-up "Pistas"** | 15 ML | Revela hints durante ejercicio | Sin límite de compra |
| **Power-up "Visión Lectora"** | 25 ML | Resalta keywords en texto | Sin límite de compra |
| **Power-up "Segunda Oportunidad"** | 40 ML | Permite reintentar sin penalización | Sin límite de compra |

**Nota:** Sistema de shop adicional no implementado en MVP (planeado para v1.1)

---

## 4. EJEMPLO DE CÁLCULO

### 4.1 Escenario Completo

**Estudiante:**
- Rango: **Ah K'in** (multiplier 1.5x)
- Completa ejercicio con score perfecto (100%)
- Es su primer intento
- Dificultad: Medium

**Cálculo:**
```
Base ejercicio:          15 coins
Perfect score (medium):  +9 coins
Primer intento:          +15 coins
─────────────────────────────────
Subtotal:                39 coins
Multiplicador (1.5x):    × 1.5
═════════════════════════════════
TOTAL:                   58 coins (Math.floor(39 × 1.5))
```

### 4.2 Desglose de Multiplicadores

**Con multiplicador de rango:**
- Completar ejercicio base
- Bonos de performance (perfect score, primer intento)
- Streaks diarios
- Completar módulo
- Achievements

**Sin multiplicador:**
- Daily login (10 coins fijos)
- Promoción de rango (bonus fijo)
- Recompensas de misiones (predefinidas)

---

## 5. SISTEMA DE TRANSACCIONES

### 5.1 Tabla `ml_coins_transactions`

**Schema:** `gamification_system.ml_coins_transactions`

**Estructura:**
```sql
CREATE TABLE gamification_system.ml_coins_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  transaction_type VARCHAR(50), -- 'earned', 'spent_powerup', 'spent_shop', 'rank_promotion', 'achievement'
  amount INTEGER, -- Positivo para earn, negativo para spend
  balance_before INTEGER,
  balance_after INTEGER,
  multiplier DECIMAL(3,2), -- Multiplicador aplicado (para earn)
  bonus_applied BOOLEAN DEFAULT false,
  reference_id UUID, -- ID de ejercicio, achievement, powerup, etc.
  reference_type VARCHAR(50), -- 'exercise', 'achievement', 'powerup', etc.
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Características del Sistema

- **Transaccional:** Todas las operaciones en BEGIN/COMMIT
- **Validación:** No permite saldo negativo (`balance_after >= 0`)
- **Auditoría:** Registro inmutable de todas las transacciones
- **Referencia:** Campo `reference_id` apunta a ejercicio, achievement, etc.

### 5.3 Tipos de Transacciones

| transaction_type | Descripción | Amount | Ejemplo |
|------------------|-------------|--------|---------|
| `earned` | Ganancia general | Positivo | Completar ejercicio: +58 |
| `spent_powerup` | Compra de power-up | Negativo | Comprar "Pistas": -15 |
| `spent_shop` | Compra en tienda | Negativo | (No implementado) |
| `rank_promotion` | Bonus por ascenso | Positivo | Ascenso a Ah K'in: +100 |
| `achievement` | Desbloqueo de logro | Positivo | Achievement épico: +100 |

---

## 6. BALANCE EN `user_stats`

### 6.1 Campos Relacionados

**Tabla:** `gamification_system.user_stats`

**Campos:**
- `ml_coins`: Balance actual (único campo sincronizado con transacciones)
- `ml_coins_earned_total`: Total ganado (lifetime)
- `ml_coins_spent_total`: Total gastado (lifetime)

### 6.2 Cálculo de Balance

```sql
-- El balance es la suma de todas las transacciones
SELECT SUM(amount) FROM ml_coins_transactions WHERE user_id = ?
-- Debe coincidir con user_stats.ml_coins
```

### 6.3 Validación de Integridad

```sql
-- Verificar integridad de balances
SELECT
  us.user_id,
  us.ml_coins as balance_user_stats,
  COALESCE(SUM(mct.amount), 0) as balance_transactions,
  CASE
    WHEN us.ml_coins = COALESCE(SUM(mct.amount), 0) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM gamification_system.user_stats us
LEFT JOIN gamification_system.ml_coins_transactions mct ON us.user_id = mct.user_id
GROUP BY us.user_id, us.ml_coins;
```

---

## 7. ENDPOINTS BACKEND

### 7.1 API de ML Coins

```
GET  /api/gamification/coins/balance/:userId       - Balance actual del usuario
POST /api/gamification/coins/earn                  - Registrar ganancia de coins
POST /api/gamification/coins/spend                 - Gastar coins (validado)
GET  /api/gamification/coins/transactions/:userId  - Historial de transacciones
GET  /api/gamification/coins/leaderboard           - Top usuarios por ML Coins
GET  /api/gamification/coins/stats                 - Estadísticas globales
GET  /api/gamification/coins/metrics               - Métricas de economía
```

### 7.2 Legacy Endpoints

```
POST /api/gamification/coins/add                   - (Deprecated) Agregar coins
GET  /api/gamification/transactions/:userId        - (Deprecated) Ver transacciones
```

---

## 8. FLUJO DE REWARDS POST-EJERCICIO

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
4. MLCoinsService.createTransaction()
   └─ Registra transacción en ml_coins_transactions
5. Return ScoreResult a frontend
```

---

## 9. MÉTRICAS DE ECONOMÍA

### 9.1 KPIs Económicos

**Por Usuario:**
- Total ML Coins earned (lifetime)
- Total ML Coins spent (lifetime)
- Current balance
- Spending rate: `spent / earned × 100%`
- Average coins per day
- Days to next powerup (estimated)

**Globales:**
- ML Coins en circulación: `SUM(user_stats.ml_coins)`
- ML Coins totales emitidos: `SUM(ml_coins_earned_total)`
- ML Coins totales gastados: `SUM(ml_coins_spent_total)`
- Inflation rate: `(coins_earned - coins_spent) / time`
- Average earning rate: `total_earned / active_users / days`

### 9.2 Targets de Éxito

**Balance Económico:**
- Spending rate: 30-50% (indica economía balanceada)
- Inflation rate: <5% mensual
- Average balance per user: 200-500 ML Coins
- Power-up purchase rate: >2 compras/usuario/semana

### 9.3 Queries de Análisis

```sql
-- ML Coins en circulación
SELECT SUM(ml_coins) as total_circulation
FROM gamification_system.user_stats;

-- Tasa de gasto promedio
SELECT
  AVG(ml_coins_spent_total * 100.0 / NULLIF(ml_coins_earned_total, 0)) as avg_spending_rate
FROM gamification_system.user_stats
WHERE ml_coins_earned_total > 0;

-- Distribución de balances
SELECT
  CASE
    WHEN ml_coins < 50 THEN '0-49'
    WHEN ml_coins < 100 THEN '50-99'
    WHEN ml_coins < 200 THEN '100-199'
    WHEN ml_coins < 500 THEN '200-499'
    ELSE '500+'
  END as balance_range,
  COUNT(*) as users
FROM gamification_system.user_stats
GROUP BY balance_range
ORDER BY balance_range;
```

---

## 10. OPTIMIZACIONES RECOMENDADAS

### 10.1 Rate Limiting (P1)

**Problema:** Sin límites en ganancia de coins, posible explotación

**Solución:**
- Límite diario de coins ganados: 1000 ML Coins/día
- Límite por ejercicio: Máximo 100 ML Coins/ejercicio
- Anti-spam: Cooldown de 5 segundos entre intentos

**Tiempo estimado:** 1 día de desarrollo

### 10.2 Economía Balanceada

**Monitoreo continuo de:**
- Ratio earned/spent (objetivo: 1.5-2.0)
- Coins en circulación vs. activos disponibles
- Power-up purchase frequency

---

## Ver también

- [Índice del sistema de gamificación](./README.md)
- [Sistema de Rangos Maya](./01-RANGOS-MAYA.md)
- [Sistema de Achievements](./03-ACHIEVEMENTS.md)
- [Sistemas Complementarios](./04-SISTEMAS-COMPLEMENTARIOS.md)
- [Roadmap y Métricas](./05-ROADMAP-METRICAS.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Estado:** Sistema operacional al 100% - P1 (rate limiting pendiente)
