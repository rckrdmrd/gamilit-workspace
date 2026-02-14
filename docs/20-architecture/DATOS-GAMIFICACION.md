# DATOS DE GAMIFICACION - GAMILIT

**Version:** 2.0.0
**Fecha:** 2026-02-11
**Fuente:** DB Seeds v2.1 (apps/database/seeds/prod/gamification_system/)
**Estado:** PRODUCTION-READY

---

## Resumen Ejecutivo

GAMILIT implementa un sistema completo de gamificacion educativa con:
- **5 Rangos Maya** (sistema de progresion jerarquica — DB Seeds v2.1)
- **20 Achievements** (logros desbloqueables)
- **ML Coins** (moneda virtual para comodines)
- **4 Comodines** (ayudas durante ejercicios)
- **4 Leaderboards** (tablas de posiciones)
- **Sistema de Misiones** (diarias, semanales, especiales)

---

## 1. Sistema de Rangos Maya

### 1.1 Jerarquia de Rangos (DB Seeds v2.1 — SSOT)

Los usuarios progresan a traves de **5 niveles** basados en XP acumulado:

| Nivel | Rango Maya | XP Min | XP Max | ML Bonus | Multiplicador |
|-------|------------|--------|--------|----------|---------------|
| 1 | **Ajaw** (Senor) | 0 | 499 | - | 1.00x |
| 2 | **Nacom** (Capitan de Guerra) | 500 | 999 | +100 ML | 1.10x |
| 3 | **Ah K'in** (Sacerdote del Sol) | 1,000 | 1,499 | +250 ML | 1.15x |
| 4 | **Halach Uinic** (Hombre Verdadero) | 1,500 | 1,899 | +500 ML | 1.20x |
| 5 | **K'uk'ulkan** (Serpiente Emplumada) | 1,900 | - | +1,000 ML | 1.25x |

> **SSOT:** `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`

### 1.3 Ubicación en Base de Datos

```sql
-- Schema: gamification_system
-- Tablas:
gamification_system.maya_ranks       -- Definición de rangos
gamification_system.user_ranks       -- Rangos asignados a usuarios
gamification_system.user_stats       -- XP y estadísticas del usuario
```

### 1.4 Seeds de Producción

```yaml
archivo: apps/database/seeds/prod/gamification_system/03-maya_ranks.sql
registros: 5
```

---

## 2. Sistema de Achievements (Logros)

### 2.1 Categorías de Logros

| Categoría | Descripción | Ejemplos |
|-----------|-------------|----------|
| **Explorador** | Descubrimiento y curiosidad | Primer ejercicio, primer módulo |
| **Maestro** | Dominio y excelencia | 100% en ejercicio, racha perfecta |
| **Colaborador** | Participación social | Unirse a equipo, ayudar a compañero |
| **Innovador** | Creatividad y originalidad | Respuesta creativa, enfoque único |

### 2.2 Logros Disponibles (20 logros demo)

Los logros se otorgan automáticamente mediante triggers cuando se cumplen las condiciones.

#### Por Progreso:
- Primer ejercicio completado
- 5 ejercicios completados
- 10 ejercicios completados
- Primer módulo completado
- Todos los módulos completados

#### Por Maestría:
- Score perfecto (100%)
- Racha de 5 correctos
- Racha de 10 correctos
- Sin usar pistas

#### Por Colaboración:
- Unirse a un equipo
- Primer desafío peer-to-peer
- Ganar desafío

#### Por Constancia:
- 3 días consecutivos
- 7 días consecutivos (semana completa)
- 30 días consecutivos (mes completo)

### 2.3 Ubicación en Base de Datos

```sql
-- Schema: gamification_system
gamification_system.achievement_categories  -- Categorías
gamification_system.achievements            -- Definición de logros
gamification_system.user_achievements       -- Logros desbloqueados
```

### 2.4 Funciones Relevantes

```sql
gamification_system.check_and_award_achievements(user_id)
gamification_system.claim_achievement_reward(user_id, achievement_id)
```

---

## 3. Sistema de ML Coins (Monedas Lectoras)

### 3.1 Obtención de ML Coins

| Fuente | ML Coins | Frecuencia |
|--------|----------|------------|
| Ejercicio completado | 10-50 | Por ejercicio |
| Score perfecto (100%) | +20 bonus | Por ejercicio |
| Subida de rango | 50-1,000 | Por rango |
| Logro desbloqueado | 25-100 | Por logro |
| Misión completada | 50-200 | Por misión |
| Racha diaria | 10-50 | Diario |

### 3.2 Uso de ML Coins

Los ML Coins se gastan en la **Tienda de Comodines**:

| Comodín | Costo (ML) | Descripción |
|---------|------------|-------------|
| Pista | 25 | Revela parte de la respuesta |
| Visión Lectora | 50 | Tiempo extra (+30s) |
| Segunda Oportunidad | 75 | Reintentar sin penalización |
| Time Freeze | 100 | Pausar temporizador (30s) |

### 3.3 Ubicación en Base de Datos

```sql
-- Schema: gamification_system
gamification_system.user_stats              -- ml_coins, ml_coins_earned_total
gamification_system.ml_coins_transactions   -- Historial de transacciones
```

### 3.4 Funciones Relevantes

```sql
gamification_system.award_ml_coins(user_id, amount, reason)
gamification_system.deduct_ml_coins(user_id, amount, reason)
```

---

## 4. Sistema de Comodines (Power-ups)

### 4.1 Tipos de Comodines

| Comodín | Enum | Efecto | Duración |
|---------|------|--------|----------|
| **Pista** | `hint` | Revela parte de respuesta correcta | Instantáneo |
| **Visión Lectora** | `time_freeze` | Congela temporizador | 30 segundos |
| **Segunda Oportunidad** | `retry` | Permite reintentar ejercicio | 1 uso |
| **Skip** | `skip` | Saltar ejercicio sin penalización | 1 uso |

### 4.2 Inventario de Usuario

Cada usuario tiene un inventario de comodines:

```typescript
interface ComodinesInventory {
  user_id: string;
  hint_count: number;        // Pistas disponibles
  time_freeze_count: number; // Visión Lectora disponibles
  retry_count: number;       // Segunda Oportunidad disponibles
  skip_count: number;        // Skips disponibles
}
```

### 4.3 Ubicación en Base de Datos

```sql
-- Schema: gamification_system
gamification_system.comodines_inventory     -- Inventario por usuario
gamification_system.active_boosts           -- Comodines activos
gamification_system.inventory_transactions  -- Historial de uso
gamification_system.comodin_usage_log       -- Log de uso
gamification_system.comodin_usage_tracking  -- Tracking detallado

-- ENUM
comodin_type: {time_freeze, hint, retry, skip}
```

---

## 5. Sistema de Leaderboards

### 5.1 Tipos de Leaderboards

| Leaderboard | Métrica | Alcance |
|-------------|---------|---------|
| **Global XP** | total_xp | Toda la plataforma |
| **ML Coins** | ml_coins_earned_total | Toda la plataforma |
| **Streaks** | current_streak | Toda la plataforma |
| **Por Mecánica** | score por exercise_type | Por tipo de ejercicio |

### 5.2 Vistas Materializadas

```sql
-- Vistas para performance
gamification_system.leaderboard_global          -- Top global
gamification_system.leaderboard_classroom       -- Por aula
gamification_system.leaderboard_weekly          -- Semanal
gamification_system.leaderboard_mechanic        -- Por mecánica
```

### 5.3 Ubicación en Base de Datos

```sql
gamification_system.leaderboard_metadata  -- Configuración de leaderboards
```

---

## 6. Sistema de Misiones

### 6.1 Tipos de Misiones

| Tipo | Reinicio | Ejemplos |
|------|----------|----------|
| **Diarias** | Cada día a 00:00 | Completar 3 ejercicios, Obtener 100 XP |
| **Semanales** | Cada lunes | Completar 1 módulo, Racha de 5 días |
| **Especiales** | Por evento | Evento de temporada, Desafío especial |

### 6.2 Objetivos de Misiones

```yaml
objective_types:
  - complete_exercises   # Completar N ejercicios
  - correct_streak       # Racha de N correctos
  - earn_xp             # Obtener N XP
  - use_comodines       # Usar N comodines
  - daily_streak        # N días consecutivos
  - perfect_scores      # N scores perfectos
  - complete_modules    # Completar N módulos
  - explore_modules     # Explorar N módulos
```

### 6.3 Ubicación en Base de Datos

```sql
-- Schema: gamification_system
gamification_system.missions              -- Definición de misiones

-- Schema: progress_tracking
progress_tracking.scheduled_missions      -- Misiones asignadas a usuarios
```

### 6.4 Triggers de Actualización

Ver `docs/sistema-recompensas/07-CORRECCION-SISTEMA-MISIONES.md` para los 8 triggers implementados:
- `trg_update_missions_on_exercise`
- `trg_update_missions_on_streak`
- `trg_update_missions_on_earn_xp`
- `trg_update_missions_on_use_comodines`
- `trg_update_missions_on_daily_streak`
- `trg_update_missions_on_perfect_scores`
- `trg_update_missions_on_complete_modules`
- `trg_update_missions_on_explore_modules`

---

## 7. Flujo de Recompensas

### 7.1 Al Completar Ejercicio

```
1. Usuario completa ejercicio
   ↓
2. INSERT en exercise_attempts (xp_earned, ml_coins_earned)
   ↓
3. TRIGGER: update_user_stats_on_exercise_complete()
   ↓
4. UPDATE user_stats: total_xp, ml_coins, exercises_completed
   ↓
5. CHECK rank promotion
   ↓
6. CHECK achievement conditions
   ↓
7. UPDATE missions progress
   ↓
8. Respuesta: { score, rewards: {xp, mlCoins}, rankUp?, achievements[] }
```

### 7.2 Arquitectura Dual-Table

Ver `docs/sistema-recompensas/01-ARQUITECTURA-SISTEMA.md`:

- **exercise_submissions**: Workflow (draft → submitted → graded)
- **exercise_attempts**: Recompensas (XP, ML Coins, tracking)

---

## 8. Ejercicios por Módulo

### Distribución de Contenido

| Modulo | Nombre | Ejercicios | XP/Ejercicio | XP Completar Modulo | XP Total |
|--------|--------|------------|-------------|---------------------|----------|
| M1 | Comprension Literal | 5 | 100 | 100 | 600 |
| M2 | Comprension Inferencial | 5 | 150 | 150 | 900 |
| M3 | Comprension Critica | 5 | 150 | 200 | 950 |
| M4 | Lectura Digital | 5 | 100 | 175 | 675 |
| M5 | Produccion Creativa | 1 (de 3) | 500 | 250 | 750 |
| **Total** | | **21 efectivos** | | | **3,875** |

### Mecánicas por Módulo

**Módulo 1 (Literal):**
- Crucigrama Científico
- Línea de Tiempo
- Completar Espacios en Blanco
- Verdadero o Falso
- Sopa de Letras (BONUS)

**Módulo 2 (Inferencial):**
- Detective Textual
- Construcción de Hipótesis
- Predicción Narrativa
- Puzzle de Contexto
- Rueda de Inferencias

**Módulo 3 (Crítica):**
- Tribunal de Opiniones
- Debate Digital
- Análisis de Fuentes
- Podcast Argumentativo
- Matriz de Perspectivas

**Módulo 4 (Digital):** 5 ejercicios (Ver DocumentoDeDiseño v6.5)

**Módulo 5 (Creativo):** 3 opciones A/B/C (Ver DocumentoDeDiseño v6.5)

---

## 9. Referencias

### Documentación Relacionada

- [DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md](./DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md) - Especificación completa
- [docs/sistema-recompensas/01-ARQUITECTURA-SISTEMA.md](../sistema-recompensas/01-ARQUITECTURA-SISTEMA.md) - Arquitectura
- [docs/sistema-recompensas/07-CORRECCION-SISTEMA-MISIONES.md](../sistema-recompensas/07-CORRECCION-SISTEMA-MISIONES.md) - Misiones

### Seeds de Producción

```
apps/database/seeds/prod/gamification_system/
├── 01-achievement_categories.sql
├── 02-leaderboard_metadata.sql
├── 03-maya_ranks.sql
├── 04-achievements.sql
├── 05-user_stats.sql
├── 06-user_ranks.sql
├── 07-ml_coins_transactions.sql
├── 08-user_achievements.sql
└── 09-comodines_inventory.sql
```

### Inventarios de Orchestration

- `orchestration/inventarios/SEEDS_INVENTORY.yml` - Inventario completo de seeds
- `orchestration/inventarios/DATABASE_INVENTORY.yml` - Estado de BD

---

**Ultima actualizacion:** 2026-02-11
**Mantenido por:** Architecture-Analyst
