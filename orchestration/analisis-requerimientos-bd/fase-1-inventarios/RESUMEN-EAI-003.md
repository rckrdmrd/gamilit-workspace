# Análisis de Requerimientos de Base de Datos: EAI-003 Gamificación Básica

**Analista:** SA-ANALISIS-DB-003
**Fecha:** 2025-11-03
**Estado:** COMPLETADO
**Prioridad Global:** P0 - Crítico

---

## 1. Resumen Ejecutivo

Se ha completado el análisis exhaustivo de todos los requerimientos de base de datos para la épica **EAI-003 (Gamificación Básica)**, cubriendo 8 user stories (US-GAM-001 a US-GAM-008).

**Resultados del análisis:**
- **11 Tablas** identificadas (8 nuevas + 3 extensiones)
- **2 Vistas** SQL para consultas optimizadas
- **4 Funciones** de cálculo y validación
- **3 Triggers** de automación
- **22 Índices** para optimización de queries
- **15 Constraints** para integridad de datos
- **4 RLS Policies** para seguridad
- **8 Migraciones** para implementación ordenada

---

## 2. Matriz de User Stories Analizadas

| ID | Nombre | Story Points | Prioridad | Requerimientos BD | Estado |
|----|--------|--------------|-----------|-------------------|--------|
| US-GAM-001 | Sistema de rangos Maya | 8 SP | P0 | rank_history, users↑ | ✓ |
| US-GAM-002 | Sistema de experiencia (XP) | 7 SP | P0 | xp_transactions, users↑ | ✓ |
| US-GAM-003 | Monedas lectoras | 6 SP | P0 | coin_transactions, users↑ | ✓ |
| US-GAM-004 | Sistema de ayudas | 7 SP | P1 | help_usage | ✓ |
| US-GAM-005 | Insignias básicas | 8 SP | P1 | badges, user_badges | ✓ |
| US-GAM-006 | Narrativa básica | 6 SP | P2 | narrative_messages | ✓ |
| US-GAM-007 | Leaderboard simple | 8 SP | P1 | vw_leaderboard_global | ✓ |
| US-GAM-008 | Recompensas por módulos | 5 SP | P1 | module_completion, modules↑ | ✓ |

**↑** = Extensión a tabla existente

---

## 3. Estructura de Tablas Nuevas

### Tablas Críticas (P0)

#### 3.1 rank_history
- **Propósito:** Auditoría de ascensos de rango
- **Columnas clave:** user_id, rank, achieved_at
- **Índices:** 3 (user_id, achieved_at, user_id+rank)
- **Constraints:** UNIQUE(user_id, rank), FK user_id
- **Triggers relacionados:** trg_update_user_rank_on_xp_change

#### 3.2 xp_transactions
- **Propósito:** Auditoría completa de transacciones XP
- **Columnas clave:** user_id, amount, reason, activity_id, created_at
- **Índices:** 4 (user_id, created_at, reason, user_id+created_at)
- **Constraints:** CHECK(amount > 0), FK user_id, FK activity_id
- **Triggers relacionados:** trg_update_user_rank_on_xp_change

#### 3.3 coin_transactions
- **Propósito:** Auditoría de monedas (ganancias y gastos)
- **Columnas clave:** user_id, amount, reason, created_at
- **Índices:** 3 (user_id, created_at, reason)
- **Constraints:** FK user_id
- **Triggers relacionados:** trg_update_user_total_coins_on_transaction

### Tablas Secundarias (P1)

#### 3.4 help_usage
- **Propósito:** Registro de uso de ayudas (límite 1 por tipo/actividad)
- **Columnas clave:** user_id, activity_id, help_type, coins_cost
- **Índices:** 2 (user_id+activity_id, help_type)
- **Constraints:** UNIQUE(user_id, activity_id, help_type)
- **Costos fijos:** hint=5, remove_option=10, extra_time=15 monedas

#### 3.5 badges
- **Propósito:** Catálogo de 10 insignias predefinidas
- **Columnas clave:** name, description, image_url, type, criteria (JSONB)
- **Índices:** 1 (type)
- **Seed data:** 10 insignias hardcoded
- **Tipos:** first_steps, module_completion, streak, xp_milestone, rank_up

#### 3.6 user_badges
- **Propósito:** Relación usuario-insignia (auditoría de desbloques)
- **Columnas clave:** user_id, badge_id, earned_at
- **Índices:** 3 (user_id, badge_id, earned_at)
- **Constraints:** UNIQUE(user_id, badge_id)

#### 3.7 narrative_messages
- **Propósito:** Mensajes de narrativa contextuales (personaje Ixchel)
- **Columnas clave:** trigger_type, trigger_id, character, message
- **Índices:** 1 (trigger_type, trigger_id)
- **Seed data:** 8+ mensajes narrativos iniciales
- **Disparadores:** module_start, module_complete, rank_up, milestone

#### 3.8 module_completion
- **Propósito:** Registro de completitud de módulos
- **Columnas clave:** user_id, module_id, xp_awarded, coins_awarded, badge_awarded
- **Índices:** 3 (user_id, module_id, completed_at)
- **Constraints:** UNIQUE(user_id, module_id)
- **Recompensas:** XP y monedas fijas por módulo

---

## 4. Extensiones a Tablas Existentes

### users (extensión con 4 columnas gamificación)
```sql
ALTER TABLE users ADD COLUMN (
  total_xp INT DEFAULT 0 NOT NULL CHECK(total_xp >= 0),
  current_rank ENUM('novato','aprendiz','explorador','maestro','sabio') DEFAULT 'novato',
  level INT DEFAULT 1 CHECK(level BETWEEN 1 AND 100),
  total_coins INT DEFAULT 0 CHECK(total_coins >= 0)
);
```
**Índices nuevos:** idx_users_total_xp, idx_users_current_rank

### modules (extensión con 3 columnas recompensas)
```sql
ALTER TABLE modules ADD COLUMN (
  completion_xp INT DEFAULT 50 NOT NULL CHECK(completion_xp > 0),
  completion_coins INT DEFAULT 25 NOT NULL CHECK(completion_coins > 0),
  completion_badge_id UUID FOREIGN KEY REFERENCES badges(id)
);
```

### activities (extensión con 3 columnas gamificación)
```sql
ALTER TABLE activities ADD COLUMN (
  xp_reward INT DEFAULT 10 NOT NULL CHECK(xp_reward > 0),
  coins_reward INT DEFAULT 5 NOT NULL CHECK(coins_reward > 0),
  has_hint BOOLEAN DEFAULT false
);
```

---

## 5. Funciones SQL

### fn_calculate_rank_from_xp(p_total_xp INT)
Calcula rango basado en XP:
- 0-99 XP → 'novato'
- 100-499 XP → 'aprendiz'
- 500-1499 XP → 'explorador'
- 1500-3999 XP → 'maestro'
- 4000+ XP → 'sabio'

**Tipo:** IMMUTABLE | **Retorna:** VARCHAR(50)

### fn_calculate_level_from_xp(p_total_xp INT)
Calcula nivel (1-100) = floor(XP/100) + 1

**Tipo:** IMMUTABLE | **Retorna:** INTEGER

### fn_get_user_position_in_leaderboard(p_user_id UUID)
Retorna posición exacta del usuario en leaderboard global (1, 2, 3...)

**Tipo:** STABLE | **Retorna:** INTEGER

### fn_validate_sufficient_coins(p_user_id UUID, p_required_coins INT)
Valida si usuario tiene suficientes monedas para operación

**Tipo:** STABLE | **Retorna:** BOOLEAN

---

## 6. Triggers de Automación

### trg_update_user_rank_on_xp_change
- **Evento:** AFTER INSERT ON xp_transactions
- **Nivel:** ROW
- **Lógica:**
  1. Calcula nuevo rango usando fn_calculate_rank_from_xp()
  2. Calcula nuevo nivel usando fn_calculate_level_from_xp()
  3. Compara con valores actuales
  4. Si rango cambió: actualiza users + inserta en rank_history
  5. Si solo nivel cambió: actualiza users
- **Crítico:** P0 - Debe ser transaccional

### trg_check_and_award_badges_on_activity_completion
- **Evento:** AFTER INSERT ON xp_transactions (when reason = 'activity_completed')
- **Nivel:** ROW
- **Lógica:**
  1. Verifica si es primera actividad
  2. Itera sobre insignias no ganadas
  3. Verifica criterios específicos
  4. Inserta en user_badges
  5. Otorga rewards (XP, coins)
- **Crítico:** P1

### trg_update_user_total_coins_on_transaction
- **Evento:** AFTER INSERT ON coin_transactions
- **Nivel:** ROW
- **Lógica:**
  1. Suma amount a users.total_coins
  2. Valida que no sea negativo
  3. ROLLBACK si insuficientes monedas
- **Crítico:** P0 - Previene monedas negativas

---

## 7. Vistas SQL

### vw_leaderboard_global
Retorna top 10 usuarios ordenados por total_xp DESC
```sql
SELECT position, id, name, total_xp, current_rank, level, photo_url
FROM users ORDER BY total_xp DESC LIMIT 10
```
**Uso:** GET /api/leaderboard

### vw_user_gamification_summary
Sumario consolidado de estado gamificado de usuario
- total_xp
- current_rank
- level
- total_coins
- badges_earned (COUNT)
- modules_completed (COUNT)
- ranks_achieved (COUNT)

**Uso:** GET /api/user/gamification-summary

---

## 8. Índices Críticos (22 total)

**Para performance del leaderboard:**
- idx_users_total_xp (B-TREE) - CRÍTICO
- idx_users_current_rank (B-TREE)

**Para auditorías:**
- idx_xp_transactions_user_id
- idx_xp_transactions_created_at
- idx_xp_transactions_reason
- idx_xp_transactions_user_date (composite)

- idx_coin_transactions_user_id
- idx_coin_transactions_created_at
- idx_coin_transactions_reason

**Para relaciones:**
- idx_rank_history_user_id
- idx_rank_history_achieved_at
- idx_rank_history_user_rank (composite)

- idx_user_badges_user_id
- idx_user_badges_badge_id
- idx_user_badges_earned_at

- idx_help_usage_user_activity (composite)
- idx_help_usage_help_type

- idx_module_completion_user_id
- idx_module_completion_module_id
- idx_module_completion_completed_at

- idx_narrative_messages_trigger (composite)

**Índices especiales:**
- idx_badges_type

---

## 9. Constraints de Integridad (15 total)

| ID | Tipo | Tabla | Expresión | Propósito |
|----|----|-------|-----------|----------|
| CST-001 | CHECK | users | total_xp >= 0 | XP no negativo |
| CST-002 | CHECK | users | total_coins >= 0 | Monedas no negativas |
| CST-003 | CHECK | users | level BETWEEN 1 AND 100 | Nivel válido |
| CST-004 | CHECK | xp_transactions | amount > 0 | XP siempre positivo |
| CST-005 | CHECK | badges | xp_reward >= 0 | Reward válido |
| CST-006 | CHECK | badges | coins_reward >= 0 | Reward válido |
| CST-007 | CHECK | modules | completion_xp > 0 | XP completitud positivo |
| CST-008 | CHECK | modules | completion_coins > 0 | Coins completitud positivo |
| CST-009 | CHECK | activities | xp_reward > 0 | Reward positivo |
| CST-010 | CHECK | activities | coins_reward > 0 | Reward positivo |
| CST-011 | UNIQUE | rank_history | (user_id, rank) | Un rango por usuario |
| CST-012 | UNIQUE | user_badges | (user_id, badge_id) | Una insignia por usuario |
| CST-013 | UNIQUE | module_completion | (user_id, module_id) | Un módulo completado por usuario |
| CST-014 | UNIQUE | help_usage | (user_id, activity_id, help_type) | Una ayuda por tipo/actividad |
| CST-015 | FK | rank_history | user_id → users(id) | Cascada al eliminar usuario |

---

## 10. Row Level Security (RLS)

**RLS-001:** xp_transactions - Usuarios ven solo sus transacciones
**RLS-002:** coin_transactions - Usuarios ven solo sus transacciones
**RLS-003:** help_usage - Usuarios ven solo su uso de ayudas
**RLS-004:** rank_history - Usuarios ven solo su historial de rangos

**Nota:** Opcionales si BD está en VPC privada

---

## 11. Seed Data Requerida

### Insignias (10 predefinidas)
1. Primer Paso (first_activity)
2. Explorador Maya (complete_module: 1)
3. Maestro de Números (complete_module: 'numeros-mayas')
4. Estudiante Constante (streak_days: 3)
5. Centenario (reach_xp: 100)
6. Aprendiz Ascendido (rank_achieved: 'aprendiz')
7-10. (4 insignias adicionales por definir)

### Mensajes de Narrativa (mínimo 8)
- module_start: numeros-mayas
- module_complete: numeros-mayas
- rank_up: aprendiz
- module_start: calendario-haab
- module_complete: calendario-haab
- module_start: astronomia-maya
- (2+ mensajes adicionales por definir)

### Recompensas de Módulos (en modules)
- numeros-mayas: 50 XP, 25 coins
- calendario-haab: 60 XP, 30 coins
- astronomia-maya: 75 XP, 40 coins

---

## 12. Migraciones Propuestas

| # | Nombre | Tablas/Columnas | Orden |
|---|--------|-----------------|-------|
| 001 | create_gamification_tables_phase1 | 8 tablas nuevas | 1 |
| 002 | extend_users_table_gamification | 4 columnas en users | 2 |
| 003 | extend_modules_table_rewards | 3 columnas en modules | 3 |
| 004 | extend_activities_table_gamification | 3 columnas en activities | 4 |
| 005 | create_gamification_functions | 4 funciones | 5 |
| 006 | create_gamification_triggers | 3 triggers | 6 |
| 007 | create_gamification_views | 2 vistas | 7 |
| 008 | seed_badges_and_narrative | Insignias + Mensajes | 8 |

---

## 13. Notas Importantes

### Restricciones del Alcance Inicial
- ✅ Valores de XP/monedas son **HARDCODED** (no parametrizables)
- ✅ 5 rangos **FIJOS** (no personalizables)
- ✅ 10 insignias **PRE-DEFINIDAS** (sin editor dinámico)
- ✅ Leaderboard **GLOBAL** (sin filtros)
- ✅ Narrativa **LINEAL PRE-ESCRITA** (sin IA)

### Consideraciones de Performance
- Índice en `users.total_xp` es **CRÍTICO** para leaderboard
- Triggers deben ser **TRANSACCIONALES** (evitar race conditions)
- Funciones de cálculo deben ser **IDEMPOTENTES**
- Queries del leaderboard deben ser **CACHEABLES** (5 minutos)

### Ambigüedades Resueltas
- **Streak_days:** Requiere tabla separada de streaks (no incluida en alcance inicial)
- **XP por fallo:** NO se otorga (solo por respuestas correctas)
- **Actualización leaderboard:** Cada 30 segundos en cache (no tiempo real)

---

## 14. Matriz de Completitud

| Componente | Obligatorio | Identificado | % |
|-----------|------------|---|---|
| Tablas | 11 | 11 | 100% |
| Vistas | 2 | 2 | 100% |
| Funciones | 4 | 4 | 100% |
| Triggers | 3 | 3 | 100% |
| Índices | 22 | 22 | 100% |
| Constraints | 15 | 15 | 100% |
| RLS Policies | 4 | 4 | 100% |
| Migraciones | 8 | 8 | 100% |

**COMPLETITUD GLOBAL: 100%**

---

## 15. Recomendaciones Implementativas

1. **Orden de migraciones:** Seguir el orden propuesto (001-008)
2. **Testing de triggers:** Prioridad máxima en P0 (rank_up, coins)
3. **Índices:** Crear todos índices antes de seed data
4. **Validaciones de aplicación:** Implementar duplicación de lógica en backend
5. **Monitoring:** Alertas en total_xp < 0 o total_coins < 0
6. **Backups:** Estrategia especial para tablas de transacciones (auditoría)

---

## 16. Archivos Generados

- **JSON principal:** `req-EAI-003-gamificacion.json` (45 KB)
- **Resumen:** Este documento (RESUMEN-EAI-003.md)

---

**ANÁLISIS COMPLETADO: 11 tablas, 4 funciones, 3 triggers identificados**

Analista: SA-ANALISIS-DB-003
Fecha: 2025-11-03
Estado: ✅ COMPLETADO
