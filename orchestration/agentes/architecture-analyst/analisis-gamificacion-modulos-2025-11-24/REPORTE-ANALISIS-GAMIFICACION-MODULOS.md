# ANÁLISIS DE DEPENDENCIAS: GAMIFICACIÓN ↔ EJERCICIOS ↔ MÓDULOS

**Fecha:** 2025-11-24
**Agente:** Architecture-Analyst
**Tarea:** Análisis de integración gamificación con módulos 1-3
**Estado FASE 1:** ✅ COMPLETADO

---

## RESUMEN EJECUTIVO

### Problema Principal
El sistema presenta **inconsistencias en la inicialización de usuarios** y **acumulación de XP/rangos** que afectan la correcta integración entre ejercicios completados y el sistema de gamificación.

### Hallazgos Críticos

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | Dual ID System (auth.users.id vs profiles.id) | 🔴 CRÍTICO | Usuarios no pueden guardar progreso |
| 2 | Trigger de inicialización incompleto | 🔴 CRÍTICO | Nuevos usuarios sin stats de gamificación |
| 3 | XP no varía por dificultad de módulo | 🟡 ALTO | Gamificación no recompensa progresión |
| 4 | Falta transaccionalidad en rewards | 🟡 ALTO | Pérdida de XP/Coins en concurrencia |
| 5 | Promoción de rango depende de trigger DB | 🟡 ALTO | Si trigger falla, rango no sube |

---

## 1. ARQUITECTURA ACTUAL

### 1.1 Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE GAMIFICACIÓN                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   REGISTRO   │───►│  PROFILES    │───►│  TRIGGER     │───►│ USER_STATS   │
│   Usuario    │    │  (profiles)  │    │ initialize   │    │ (100 coins)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │ USER_RANKS   │          │ COMODINES    │          │ MODULE_PROG  │
            │ (Ajaw init)  │          │ INVENTORY    │          │ (M1-M5)      │
            └──────────────┘          └──────────────┘          └──────────────┘

                                        ║
                                        ║ DESPUÉS DE REGISTRO
                                        ▼

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  EJERCICIO   │───►│  SUBMISSION  │───►│ GRADE +      │───►│ CLAIM        │
│  Completado  │    │  Service     │    │ VALIDATE     │    │ REWARDS      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                   │
                    ┌──────────────────────────────────────────────┤
                    ▼                                              ▼
            ┌──────────────┐                               ┌──────────────┐
            │ USER_STATS   │                               │ ML_COINS     │
            │ addXp()      │                               │ addCoins()   │
            └──────┬───────┘                               └──────────────┘
                   │
                   ▼ TRIGGER: trg_check_rank_promotion
            ┌──────────────┐
            │ CHECK RANK   │───► ¿total_xp >= threshold?
            │ PROMOTION    │         │
            └──────────────┘         │
                                     ▼
                   ┌─────────────────┴─────────────────┐
                   │ SÍ                                │ NO
                   ▼                                   ▼
            ┌──────────────┐                    (No action)
            │ PROMOTE TO   │
            │ NEXT RANK    │
            │ + Bonus Coins│
            └──────────────┘
```

### 1.2 Tablas Principales

| Schema | Tabla | Propósito | FK Principal |
|--------|-------|-----------|--------------|
| gamification_system | user_stats | Stats XP, nivel, coins, streak | auth.users.id |
| gamification_system | user_ranks | Historial de rangos maya | auth.users.id |
| gamification_system | maya_ranks | Configuración 5 rangos | - |
| gamification_system | comodines_inventory | Power-ups por usuario | profiles.id ⚠️ |
| gamification_system | ml_coins_transactions | Auditoría de coins | profiles.id ⚠️ |
| gamification_system | missions | Misiones diarias/semanales | profiles.id ⚠️ |
| progress_tracking | exercise_submissions | Entregas de ejercicios | profiles.id ⚠️ |
| progress_tracking | module_progress | Progreso por módulo | profiles.id ⚠️ |
| educational_content | modules | Definición de módulos | - |
| educational_content | exercises | Definición de ejercicios | modules.id |

**⚠️ PROBLEMA IDENTIFICADO:** Inconsistencia en FKs - algunas tablas usan `auth.users.id`, otras usan `profiles.id`

---

## 2. PROCESO DE INICIALIZACIÓN DE USUARIOS

### 2.1 Flujo Actual

```sql
-- Trigger: trg_initialize_user_stats
-- Ubicación: auth_management/triggers/04-trg_initialize_user_stats.sql
-- Dispara: AFTER INSERT ON auth_management.profiles

gamilit.initialize_user_stats() ejecuta:

1. INSERT user_stats (user_id = NEW.user_id, ml_coins = 100)
   └─ FK: auth.users.id ✅

2. INSERT comodines_inventory (user_id = NEW.id)
   └─ FK: profiles.id ✅ (CORREGIDO)

3. INSERT user_ranks (user_id = NEW.user_id, current_rank = 'Ajaw')
   └─ FK: auth.users.id ✅

4. INSERT module_progress (user_id = NEW.id, module_id = cada módulo publicado)
   └─ FK: profiles.id ✅ (CORREGIDO)
```

### 2.2 Bugs Solucionados (2025-11-24)

| Bug | Descripción | Estado |
|-----|-------------|--------|
| BUG-001 | module_progress no se inicializaba | ✅ SOLUCIONADO |
| BUG-002 | user_ranks duplicados sin ON CONFLICT | ✅ SOLUCIONADO |
| BUG-003 | comodines usaba NEW.user_id en vez de NEW.id | ✅ SOLUCIONADO |
| BUG-004 | initialize_user_missions() no existe | 🟡 PENDIENTE |

### 2.3 Escenarios de Inicialización

| Escenario | Trigger Dispara | Resultado Esperado |
|-----------|-----------------|-------------------|
| Nuevo registro (frontend) | ✅ SÍ | 9 registros creados |
| Seed de usuarios (dev) | ✅ SÍ | Trigger dispara al INSERT profiles |
| Backup/restore de usuarios | ⚠️ DEPENDE | Si INSERT profiles, dispara |
| Migración de auth.users sin profiles | ❌ NO | Usuario sin gamificación |

---

## 3. SISTEMA DE RANGOS MAYA

### 3.1 Configuración Actual (v2.0)

| Rango | XP Mínimo | XP Máximo | ML Coins Bonus | XP Multiplier |
|-------|-----------|-----------|----------------|---------------|
| Ajaw | 0 | 499 | 0 | 1.00x |
| Nacom | 500 | 999 | 100 | 1.10x |
| Ah K'in | 1000 | 1499 | 250 | 1.15x |
| Halach Uinic | 1500 | 2249 | 500 | 1.20x |
| K'uk'ulkan | 2250 | ∞ | 1000 | 1.25x |

### 3.2 Flujo de Promoción

```
Usuario gana XP
    │
    ▼
UPDATE user_stats SET total_xp = total_xp + xp_ganado
    │
    ▼ TRIGGER: trg_check_rank_promotion_on_xp_gain
    │
    ▼
gamification_system.check_rank_promotion(user_id)
    │
    ├─► Consulta maya_ranks: ¿total_xp >= min_xp_required del siguiente?
    │
    ├─► SÍ: Llamar promote_to_next_rank()
    │       ├─ Actualizar user_stats.current_rank
    │       ├─ Insertar en user_ranks (historial)
    │       ├─ Sumar ml_coins_bonus
    │       └─ Registrar ml_coins_transaction
    │
    └─► NO: Solo acumula XP
```

### 3.3 XP Requerido para Completar Todos los Rangos

```
Rango Máximo (K'uk'ulkan) requiere: 2250 XP

XP Disponible en M1-M3:
├─ Módulo 1: 100 XP (módulo) + 500 XP (5 ejercicios × 100) = 600 XP
├─ Módulo 2: 150 XP (módulo) + 500 XP (5 ejercicios × 100) = 650 XP
├─ Módulo 3: 200 XP (módulo) + 500 XP (5 ejercicios × 100) = 700 XP
└─ TOTAL M1-M3: 1950 XP

⚠️ PROBLEMA: Con M1-M3 solo se alcanza Halach Uinic (1500-2249 XP)
             Para K'uk'ulkan se necesitan M4-M5 o bonus adicionales
```

---

## 4. ESTRUCTURA DE MÓDULOS 1-3

### 4.1 Configuración de Módulos

| Módulo | Dificultad | XP Módulo | ML Coins | Ejercicios | XP Total Posible |
|--------|------------|-----------|----------|------------|------------------|
| M1: Literal | Beginner | 100 | 50 | 5 | 600 |
| M2: Inferencial | Intermediate | 150 | 75 | 5 | 650 |
| M3: Crítica | Advanced | 200 | 100 | 5 | 700 |

### 4.2 Configuración de Ejercicios

**INCONSISTENCIA DETECTADA:** Todos los ejercicios tienen `xp_reward = 100`

| Módulo | Ejercicios | XP por Ejercicio | Debería Ser |
|--------|------------|------------------|-------------|
| M1 (Beginner) | 5 | 100 | 80 |
| M2 (Intermediate) | 5 | 100 | 100 |
| M3 (Advanced) | 5 | 100 | 120 |

**Problema:** No hay diferenciación de recompensa por dificultad

### 4.3 Tipos de Ejercicios por Módulo

**Módulo 1 (Literal):**
1. Crucigrama Científico
2. Línea de Tiempo
3. Completar Espacios
4. Verdadero/Falso
5. Sopa de Letras (BONUS)

**Módulo 2 (Inferencial):**
1. Detective Textual
2. Relaciones Causa-Efecto
3. Predicción Narrativa
4. Puzzle de Contexto
5. Rueda de Inferencias

**Módulo 3 (Crítica):**
1. Tribunal de Opiniones
2. Debate Digital
3. Análisis de Fuentes
4. Podcast Argumentativo
5. Matriz de Perspectivas

---

## 5. FLUJO DE SUBMISIÓN Y RECOMPENSAS

### 5.1 Arquitectura Dual de Ejercicios

El sistema tiene **DOS flujos** según el tipo de ejercicio:

| Flujo | Servicio | Ejercicios | Características |
|-------|----------|------------|-----------------|
| Auto-grade | ExerciseAttemptService | M1 (Crucigrama, Timeline, etc.) | Múltiples intentos, rewards inmediatos |
| Manual-grade | ExerciseSubmissionService | M2-M3 (Debate, Podcast, etc.) | Una entrega, auto-grade + revisión |

### 5.2 Cálculo de Recompensas

```typescript
// XP
baseXP = (score / maxScore) * 100
bonusXP = score === maxScore && !hintUsed ? 50 : 0
penaltyXP = hintsCount * 5
finalXP = Math.max(0, baseXP + bonusXP - penaltyXP)

// ML Coins
baseCoins = Math.floor((score / maxScore) / 10)
bonusCoins = score === maxScore && !hintUsed ? 10 : 0
penaltyCoins = mlCoinsSpent
finalCoins = Math.max(0, baseCoins + bonusCoins - penaltyCoins)
```

### 5.3 Puntos de Falla

| Punto | Descripción | Severidad | Estado |
|-------|-------------|-----------|--------|
| getProfileId() | Conversión userId → profileId | 🔴 CRÍTICO | Puede fallar si profile no existe |
| addXp() sin transacción | XP puede acumularse pero coins no | 🟡 ALTO | Sin fix |
| Trigger promoción | Si trigger no existe, rango no sube | 🟡 ALTO | Depende de DB |
| Error silencioso | Falla en coins se logea pero no falla | 🟡 ALTO | Sin fix |

---

## 6. GAPS IDENTIFICADOS

### 6.1 GAP-GAM-001: Inconsistencia de IDs

**Problema:**
```
auth.users.id ≠ profiles.id (pueden ser diferentes)
```

**Tablas afectadas:**
- `user_stats.user_id` → auth.users.id
- `exercise_submissions.user_id` → profiles.id
- `module_progress.user_id` → profiles.id

**Impacto:** Queries entre tablas requieren JOIN adicional

**Solución recomendada:**
```sql
-- Forzar que profiles.id = auth.users.id
-- Ya implementado en seeds pero no en registro dinámico
```

### 6.2 GAP-GAM-002: XP Uniforme por Ejercicio

**Problema:** Todos los ejercicios otorgan 100 XP independiente de dificultad

**Impacto:** No hay incentivo para completar ejercicios más difíciles

**Solución recomendada:**
```sql
-- Actualizar xp_reward en exercises
UPDATE educational_content.exercises
SET xp_reward = 80
WHERE module_id IN (SELECT id FROM modules WHERE order_index = 1);

UPDATE educational_content.exercises
SET xp_reward = 120
WHERE module_id IN (SELECT id FROM modules WHERE order_index = 3);
```

### 6.3 GAP-GAM-003: Falta de Transaccionalidad

**Problema:** `claimRewards()` llama a `addXp()` y `addCoins()` por separado

**Impacto:** Si una falla, la otra puede ejecutarse parcialmente

**Solución recomendada:**
```typescript
async claimRewards(submissionId: string) {
  return this.entityManager.transaction(async (em) => {
    // Todas las operaciones en una transacción
    await this.userStatsService.addXp(userId, xp, em);
    await this.mlCoinsService.addCoins(userId, coins, em);
  });
}
```

### 6.4 GAP-GAM-004: Misiones No Inicializadas

**Problema:** `initialize_user_missions()` está comentado porque la función no existe

**Impacto:** Usuarios nuevos no tienen misiones diarias/semanales

**Solución recomendada:**
1. Implementar función `gamilit.initialize_user_missions()`
2. Descomentar llamada en `initialize_user_stats()`

### 6.5 GAP-GAM-005: XP Insuficiente para Rango Máximo

**Problema:** M1-M3 dan máximo 1950 XP, pero K'uk'ulkan requiere 2250 XP

**Impacto:** Usuarios no pueden alcanzar rango máximo solo con M1-M3

**Solución recomendada:**
- Ajustar thresholds de rangos, O
- Agregar bonus por completar módulos completos, O
- Implementar M4-M5

---

## 7. VALIDACIÓN DE INTEGRIDAD

### 7.1 Query de Validación Post-Registro

```sql
-- Verificar que usuario tiene TODO inicializado
WITH test_user AS (
  SELECT id, user_id, email
  FROM auth_management.profiles
  WHERE email = 'student@gamilit.com'
)
SELECT
  'user_stats' as tabla,
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END as status
FROM test_user tu
JOIN gamification_system.user_stats us ON us.user_id = tu.user_id

UNION ALL

SELECT 'user_ranks',
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END
FROM test_user tu
JOIN gamification_system.user_ranks ur ON ur.user_id = tu.user_id

UNION ALL

SELECT 'comodines_inventory',
  CASE WHEN COUNT(*) = 1 THEN '✅' ELSE '❌' END
FROM test_user tu
JOIN gamification_system.comodines_inventory ci ON ci.user_id = tu.id

UNION ALL

SELECT 'module_progress (5 expected)',
  CASE WHEN COUNT(*) >= 5 THEN '✅' ELSE '❌ (' || COUNT(*) || ')' END
FROM test_user tu
JOIN progress_tracking.module_progress mp ON mp.user_id = tu.id;
```

### 7.2 Query de Validación de Rangos

```sql
-- Verificar que rangos están correctamente configurados
SELECT
  rank_name,
  min_xp_required,
  max_xp_threshold,
  ml_coins_bonus,
  xp_multiplier,
  rank_order
FROM gamification_system.maya_ranks
WHERE is_active = true
ORDER BY rank_order;

-- Resultado esperado:
-- Ajaw         | 0    | 499  | 0    | 1.00 | 1
-- Nacom        | 500  | 999  | 100  | 1.10 | 2
-- Ah K'in     | 1000 | 1499 | 250  | 1.15 | 3
-- Halach Uinic | 1500 | 2249 | 500  | 1.20 | 4
-- K'uk'ulkan  | 2250 | NULL | 1000 | 1.25 | 5
```

---

## 8. RECOMENDACIONES DE HOMOLOGACIÓN M1-M3

### 8.1 Prioridad CRÍTICA (Bloqueantes)

| # | Acción | Responsable | Impacto |
|---|--------|-------------|---------|
| 1 | Verificar trigger `trg_initialize_user_stats` existe en BD | Database-Agent | Usuarios nuevos |
| 2 | Verificar trigger `trg_check_rank_promotion_on_xp_gain` existe | Database-Agent | Promoción de rango |
| 3 | Validar que profiles.id = auth.users.id en nuevos registros | Backend-Agent | Consistencia |

### 8.2 Prioridad ALTA (Mejora significativa)

| # | Acción | Responsable | Impacto |
|---|--------|-------------|---------|
| 4 | Estandarizar XP por dificultad (80/100/120) | Database-Agent | Gamificación |
| 5 | Implementar transaccionalidad en claimRewards() | Backend-Agent | Consistencia |
| 6 | Implementar initialize_user_missions() | Database-Agent | Misiones |

### 8.3 Prioridad MEDIA (Mejora de UX)

| # | Acción | Responsable | Impacto |
|---|--------|-------------|---------|
| 7 | Agregar bonus XP por completar módulo completo | Database-Agent | Incentivo |
| 8 | Ajustar thresholds de rango para M1-M3 | Database-Agent | Alcanzabilidad |
| 9 | Implementar retry logic en rewards | Backend-Agent | Resiliencia |

---

## 9. MATRIZ DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCIAS ENTRE COMPONENTES                   │
└─────────────────────────────────────────────────────────────────────┘

REGISTRO USUARIO
    │
    ├──► auth.users (Supabase)
    │       │
    │       └──► auth_management.profiles
    │               │
    │               └──► TRIGGER: trg_initialize_user_stats
    │                       │
    │                       ├──► gamification_system.user_stats
    │                       ├──► gamification_system.user_ranks
    │                       ├──► gamification_system.comodines_inventory
    │                       └──► progress_tracking.module_progress

EJERCICIO COMPLETADO
    │
    ├──► progress_tracking.exercise_submissions
    │       │
    │       └──► ExerciseSubmissionService.claimRewards()
    │               │
    │               ├──► UserStatsService.addXp()
    │               │       │
    │               │       └──► TRIGGER: trg_check_rank_promotion
    │               │               │
    │               │               └──► check_rank_promotion()
    │               │                       │
    │               │                       └──► promote_to_next_rank()
    │               │                               │
    │               │                               ├──► UPDATE user_stats
    │               │                               ├──► INSERT user_ranks
    │               │                               └──► INSERT ml_coins_transactions
    │               │
    │               └──► MLCoinsService.addCoins()
    │                       │
    │                       ├──► UPDATE user_stats.ml_coins
    │                       └──► INSERT ml_coins_transactions

MÓDULO COMPLETADO
    │
    ├──► progress_tracking.module_progress
    │       │
    │       └──► status = 'completed'
    │               │
    │               └──► (NO HAY TRIGGER DE BONUS)
    │                       │
    │                       └──► ⚠️ GAP: No se otorga XP bonus
```

---

## 10. PRÓXIMOS PASOS (FASE 2: PLANEACIÓN)

Basado en este análisis, la FASE 2 debe:

1. **Definir tareas específicas** para cada GAP identificado
2. **Asignar agentes** (Database-Agent, Backend-Agent, Frontend-Agent)
3. **Determinar orden** de ejecución (paralelo vs secuencial)
4. **Preparar prompts** detallados para cada agente

---

**Análisis completado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Fuentes analizadas:** 20+ archivos DDL, 10+ servicios backend, seeds M1-M3
**Agentes Explore utilizados:** 5 (paralelo)
