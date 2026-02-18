# Track B: Hallazgos — Consumibles e Integracion con Ejercicios

**Fecha:** 2026-02-18 | **Estado:** Completo

---

## Resumen Ejecutivo

Gamilit tiene un **sistema dual de power-ups**:
1. **Comodines** (Pistas/Vision/Segunda oportunidad) — 100% funcional, compra+uso+UI integrados
2. **Shop Consumables** (XP Boost 2x, Coins Boost 1.5x) — ~40% implementado: DDL + compra funcionan, pero NO hay endpoint de activacion, NO hay integracion con calculo de recompensas

La tabla `active_boosts` ya existe en DDL y la funcion `apply_xp_boost()` esta lista, pero **ningun servicio backend las usa**.

---

## 1. Diferencia Exacta: Comodines vs Shop Consumables

| Aspecto | Comodines | Shop Consumables (Boosts) |
|---------|-----------|--------------------------|
| **Tipos** | 3: PISTAS (15 ML), VISION_LECTORA (25 ML), SEGUNDA_OPORTUNIDAD (40 ML) | 2: XP Boost 2x (100 ML), Coins Boost 1.5x (75 ML) |
| **Catalogo** | Hardcoded en ComodinesService.getCatalog() | tabla `shop_items` (is_consumable=true) |
| **Compra** | POST /comodines/purchase | POST /shop/{itemId}/purchase |
| **Storage** | `comodines_inventory` (wide table: 1 fila/usuario, 16 cols) | `user_purchases` (normalizada) |
| **Duracion** | Permanente hasta consumir | Temporal (24h / 12h) |
| **Efecto** | Cualitativo (pistas, retry) | Cuantitativo (multiplicador XP/Coins) |
| **Endpoint de uso** | POST /comodines/use (funcional) | NO EXISTE |
| **Active tracking** | No necesario (efecto inmediato) | tabla `active_boosts` (existe, sin servicio) |
| **Frontend** | PowerUpBar "Disponibles" + useExercisePowerUps | PowerUpBar "Activos" (siempre vacio) |
| **Implementacion** | ~100% | ~40% (DDL listo, servicios faltan) |

---

## 2. Flujo Post-Compra de Consumible

### Que se crea al comprar "Boost XP 2x":
```
UserPurchase {
  user_id, item_id,
  status: 'completed',
  is_active: true,
  expires_at: NULL,      ← NUNCA se llena (GAP)
  consumed_at: NULL,
  price_paid: 100
}

MLCoinsTransaction {
  amount: -100,
  transaction_type: 'SPENT_POWERUP',
  reference_type: 'powerup'
}
```

**Problema critico:** `expires_at` NUNCA se establece en `shop.service.ts`. El boost queda en user_purchases pero no se puede "activar" — no hay flujo para pasar a `active_boosts`.

---

## 3. Endpoint de Activacion: NO EXISTE

**Evidencia:**
- ShopService.purchaseItem() crea UserPurchase con is_active=true inmediatamente
- NO hay BoostService ni BoostController
- ComodinesController tiene `.use()` pero solo para comodines, NO para boosts
- useExercisePowerUps mapea IDs a `/comodines/use` (incorrecto para boosts)

**Lo que SI existe en DDL:**
- Tabla `active_boosts` (11-active_boosts.sql) con: user_id, boost_type, multiplier, expires_at, is_active
- Funcion `apply_xp_boost(p_user_id, p_base_xp)` que consulta active_boosts y retorna XP multiplicado
- Campo `ml_coins_transactions.multiplier` (nunca llenado)

---

## 4. Cadena de Calculo de XP al Completar Ejercicio

```
ExercisePage.handleSubmit()
  → POST /exercises/{id}/submit
  → ExerciseSubmissionService.submitExercise()
  → ExerciseRewardsService.calculateRewards()
    → BASE_REWARDS:
        xpPerCorrectAnswer: 10
        mlCoinsPerExercise: 5
        perfectScoreBonusMultiplier: 1.5
        noHintBonusMultiplier: 1.2
        firstAttemptBonusMultiplier: 1.1
        difficultyMultipliers: { easy:1.0, medium:1.25, hard:1.5, expert:2.0 }
    → NO hay multiplicador de boost activo ← GAP
  → UserStatsService.addXp(userId, xpEarned)
  → MLCoinsService.earnCoins(userId, coinsEarned)
```

**Donde insertar multiplicador:** Entre `calculateRewards()` y `addXp()`, llamar a `apply_xp_boost()` SQL function.

---

## 5. Donde se Otorgan ML Coins

- **ExerciseRewardsService.claimRewards()** → calcula mlCoinsEarned y llama MLCoinsService.earnCoins()
- **Tabla ml_coins_transactions** tiene campo `multiplier` (default 1.00) pero NUNCA se usa en calculo
- **Fuentes adicionales:** Misiones, logros, rank ups, bonus admin (ninguna integra boosts)

---

## 6. Flujo Correcto Propuesto

```
PASO 1: Comprar boost
  POST /shop/{itemId}/purchase
  → Crea UserPurchase(status='completed')
  → Deduce ML Coins

PASO 2: Activar boost (ENDPOINT NUEVO)
  POST /gamification/boosts/{purchaseId}/activate
  → Lee UserPurchase + shop_item.effect_data
  → Valida is_consumable=true
  → INSERT active_boosts {
      user_id, boost_type='XP',
      multiplier=2.0,
      expires_at=NOW()+24h,
      is_active=true
    }
  → UPDATE UserPurchase SET consumed_at=NOW()
  → Return { boost_id, expires_at, remaining_seconds }

PASO 3: Ejercicio con boost activo
  POST /exercises/{id}/submit
  → ExerciseRewardsService.calculateRewards()
  → SELECT * FROM apply_xp_boost(user_id, base_xp) ← LLAMADA NUEVA
  → Retorna boosted_xp = base_xp * total_multiplier
  → addXp(userId, boosted_xp) en vez de base_xp

PASO 4: Expiracion automatica
  → active_boosts.expires_at > NOW() ya lo filtra apply_xp_boost()
  → Cron/trigger opcional para limpiar is_active=false
```

---

## 7. Estado del Frontend (ExercisePage + PowerUpBar)

### PowerUpBar muestra:
- **Seccion "Activos":** Items con countdown timer — SIEMPRE VACIA (no fetch de active_boosts)
- **Seccion "Disponibles":** Comodines con boton "Usar" — funcional para comodines

### Gaps en UI:
- activePowerUps array siempre vacio (hook no consulta active_boosts)
- No hay boton para "activar" un boost comprado desde inventario
- No hay indicador visual de multiplicador activo durante ejercicio
- No hay countdown de expiracion de boost

---

## 8. Comodines: Como Funcionan (Referencia)

| Comodin | Costo | Efecto | Backend | Frontend |
|---------|-------|--------|---------|----------|
| PISTAS | 15 ML | Revela pista contextual | ComodinesService.use() -1 pistas_available | PowerUpBar + setEffects({hintsRevealed}) |
| VISION_LECTORA | 25 ML | Resalta keywords | ComodinesService.use() -1 vision_available | setEffects({visionActive: true}) |
| SEGUNDA_OPORTUNIDAD | 40 ML | Permite reintento | ComodinesService.use() -1 segunda_available | setEffects({hasSecondChance: true}) |

**Flujo completo funcional:** Purchase → Inventario decrementado → Use durante ejercicio → Efecto visual inmediato → Audit en InventoryTransaction

---

## 9. Estructura effect_data en shop_items

```json
// XP Boost:
{ "type": "xp_boost", "multiplier": 2.0, "duration_hours": 24, "stackable": false }

// Coins Boost:
{ "type": "coins_boost", "multiplier": 1.5, "duration_hours": 12, "stackable": false }
```

---

## 10. Cambios DDL Necesarios

| Que | Estado | Accion |
|-----|--------|--------|
| Tabla `active_boosts` | EXISTE | Ninguna |
| Funcion `apply_xp_boost()` | EXISTE | Ninguna |
| Funcion `apply_coins_boost()` | NO EXISTE | Crear (equivalente para COINS) |
| Constraint multiplier > 1.0 | EXISTE | Ninguna |
| Index user_id + is_active | EXISTE | Ninguna |

**DDL esta ~90% listo.** Solo falta `apply_coins_boost()`.

---

## 11. Recomendaciones

### P0 — Critico
1. **Crear BoostService + BoostController** con endpoint `POST /boosts/{purchaseId}/activate`
2. **Modificar ExerciseRewardsService** para llamar `apply_xp_boost()` antes de `addXp()`
3. **Crear apply_coins_boost()** SQL function
4. **Establecer expires_at** en ShopService al crear UserPurchase de consumibles

### P1 — Importante
5. **Crear useActiveBoosts hook** que consulte active_boosts y alimente PowerUpBar
6. **Agregar boton "Activar"** en InventoryPage para boosts comprados
7. **Mostrar countdown timer** de boost activo en ExercisePage
8. **Llenar campo multiplier** en ml_coins_transactions al usar boost

### P2 — Mejora
9. **Indicador visual de boost activo** (icono flotante con "2x XP") durante ejercicio
10. **Notificacion de expiracion** ("Tu boost expira en 30 min")
