# Funcionalidades de Gamificación Pendientes - Backlog

**Fecha:** 2025-11-19
**Versión:** 2.0
**Estado:** ✅ COMPLETADO
**Actualizado:** 2026-02-03

---

## 📋 Resumen Ejecutivo

**Total de funcionalidades pendientes:** 0

### ✅ Multiplicador ML Coins por Rango - IMPLEMENTADO

**Estado:** ✅ COMPLETADO en Sprint 5 (2026-02-03)
**Commit:** `fa98b05a`
**Implementación:** `apps/backend/src/modules/gamification/services/rank-multiplier.service.ts`

---

## 🎯 Funcionalidad: Multiplicador ML Coins por Rango

### Descripción

Sistema de multiplicadores que aumenta las ML Coins (Monedas Lectoras) ganadas según el rango maya del usuario. Usuarios de rangos más altos reciben más ML Coins por las mismas acciones.

**Documento de origen:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.1.md (líneas 76-84, 1104)

### ✅ Especificación Implementada

| Rango | Multiplicador ML Coins | Ejemplo |
|-------|------------------------|---------|
| Ajaw | 1.00x | 20 ML base → 20 ML recibidos |
| Nacom | 1.25x (+25%) | 20 ML base → 25 ML recibidos |
| Ah K'in | 1.50x (+50%) | 20 ML base → 30 ML recibidos |
| Halach Uinic | 1.75x (+75%) | 20 ML base → 35 ML recibidos |
| K'uk'ulkan | 2.00x (+100%) | 20 ML base → 40 ML recibidos |

**Regla importante:** El multiplicador aplica SOLO a ML Coins ganados, NO a gastos.
- ✅ Ganas 20 ML → multiplicador aplica → recibes más
- ❌ Gastas 15 ML en comodín → pagas exactamente 15 ML

---

### ✅ Implementación Completada

#### Backend Service: `RankMultiplierService`

**Ubicación:** `apps/backend/src/modules/gamification/services/rank-multiplier.service.ts`

**Métodos implementados:**

```typescript
// Get multiplier for a user based on their current rank
async getMultiplier(userId: string): Promise<number>

// Calculate ML Coins with multiplier applied (detailed breakdown)
async calculateCoinsWithMultiplier(userId: string, baseCoins: number): Promise<MultiplierInfo>

// Get complete rank multiplier table for frontend display
getRankMultiplierTable(): RankMultiplierTableEntry[]

// Get user's current rank info with multiplier details
async getUserRankWithMultiplier(userId: string): Promise<UserRankMultiplierInfo>

// Get multiplier for a specific rank (without user context)
getMultiplierForRank(rank: MayaRank): number

// Get the bonus percentage for a specific rank
getBonusPercentageForRank(rank: MayaRank): number
```

**Interfaces implementadas:**

```typescript
interface MultiplierInfo {
  rankLevel: number;       // User's current rank level (1-5)
  rankName: string;        // Display name (e.g., "Ajaw")
  multiplier: number;      // Multiplier value (1.0 - 2.0)
  baseCoins: number;       // Original base coins amount
  finalCoins: number;      // Final coins after multiplier
  bonusCoins: number;      // Bonus coins earned from multiplier
  bonusPercentage: number; // Percentage bonus (e.g., 50 for 1.5x)
}

interface UserRankMultiplierInfo {
  userId: string;
  rankLevel: number;
  rankName: string;
  multiplier: number;
  bonusPercentage: number;
  xpToNextRank: number;
  nextRankMultiplier: number | null;
  nextRankBonusPercentage: number | null;
  isMaxRank: boolean;
}
```

#### Configuration

Multipliers are defined as constants in the service:

```typescript
const ML_COINS_MULTIPLIERS: Record<number, number> = {
  1: 1.0,   // Ajaw - Newcomer (base)
  2: 1.25,  // Nacom - Warrior in training (+25%)
  3: 1.5,   // Ah K'in - Sun Priest (+50%)
  4: 1.75,  // Halach Uinic - True Leader (+75%)
  5: 2.0,   // K'uk'ulkan - Feathered Serpent (+100%)
};
```

---

### ✅ Integration Points

1. **MLCoinsService** - Uses `RankMultiplierService.calculateCoinsWithMultiplier()` when awarding coins
2. **GamificationModule** - Exports `RankMultiplierService` for use by other modules
3. **MLCoinsController** - Endpoint to get user's multiplier info

---

### Documentación Relacionada

- **Sprint 5 Implementation:** `orchestration/PROXIMA-ACCION.md` (FASE A section)
- **Service Code:** `apps/backend/src/modules/gamification/services/rank-multiplier.service.ts`
- **Index Export:** `apps/backend/src/modules/gamification/services/index.ts`

---

## 📊 Backlog Status

| Funcionalidad | Estado | Sprint | Commit |
|---------------|--------|--------|--------|
| ML Coins Multiplier por Rango | ✅ COMPLETADO | Sprint 5 | `fa98b05a` |

---

**Última actualización:** 2026-02-03
**Responsable:** Claude Code Agent
