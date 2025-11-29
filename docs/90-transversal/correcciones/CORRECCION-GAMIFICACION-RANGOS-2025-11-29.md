# CORRECCIÓN: Sistema de Gamificación - Rangos y Multiplicadores XP

**Fecha:** 2025-11-29
**Estado:** ✅ Implementado
**Archivos afectados:**
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `apps/backend/src/modules/gamification/services/ranks.service.ts`

---

## Resumen de Problemas Corregidos

| # | Problema | Archivo | Líneas | Severidad |
|---|----------|---------|--------|-----------|
| 1 | Multiplicadores XP por rango NO aplicados | exercise-submission.service.ts | 861, 866, 976-995 | CRÍTICO |
| 2 | Thresholds de rango desactualizados (v2.0 vs v2.1) | ranks.service.ts | 94, 102 | ALTO |
| 3 | Promoción de rango no detectada por cache TypeORM | exercise-submission.service.ts | 904-911 | ALTO |
| 4 | Tipo incorrecto en misiones (`'daily'` vs enum) | exercise-submission.service.ts | 1141-1142 | MEDIO |

---

## Detalle de Correcciones

### 1. Multiplicadores XP por Rango

**Problema:**
El método `claimRewards()` calculaba XP sin aplicar el multiplicador del rango del usuario:
```typescript
// ❌ ANTES (incorrecto)
let xpEarned = Math.floor(baseXpReward * scoreMultiplier);
```

**Solución:**
Se agregó método `getRankXpMultiplier()` que consulta el multiplicador desde la tabla `maya_ranks`:
```typescript
// ✅ DESPUÉS (correcto)
const rankMultiplier = await this.getRankXpMultiplier(submission.user_id);
let xpEarned = Math.floor(baseXpReward * scoreMultiplier * rankMultiplier);
```

**Multiplicadores por rango (v2.1):**
| Rango | Multiplicador |
|-------|---------------|
| Ajaw | 1.00x |
| Nacom | 1.10x |
| Ah K'in | 1.15x |
| Halach Uinic | 1.20x |
| K'uk'ulkan | 1.25x |

**Ubicación:** `exercise-submission.service.ts:976-995`

---

### 2. Thresholds de Rango v2.1

**Problema:**
El backend tenía hardcodeados los umbrales de la versión 2.0, mientras que la DB usa v2.1:

```typescript
// ❌ ANTES (v2.0 - incorrecto)
'Halach Uinic': { xp_min: 1500, xp_max: 2249 },
'K\'uk\'ulkan': { xp_min: 2250, xp_max: null },
```

**Solución:**
Actualizado a v2.1 para coincidir con seeds de DB (`03-maya_ranks.sql`):

```typescript
// ✅ DESPUÉS (v2.1 - correcto)
'Halach Uinic': { xp_min: 1500, xp_max: 1899 },
'K\'uk\'ulkan': { xp_min: 1900, xp_max: null },
```

**Justificación:** El umbral de K'uk'ulkan bajó de 2250 a 1900 para ser alcanzable al completar Módulos 1-3 (~1,950 XP disponibles).

**Ubicación:** `ranks.service.ts:94, 102`

---

### 3. Detección de Promoción con Query Directo

**Problema:**
Después de `addXp()`, el trigger de DB (`trg_check_rank_promotion_on_xp_gain`) actualiza `current_rank`. Pero TypeORM podría tener el valor anterior en cache.

```typescript
// ❌ ANTES (podía tener cache obsoleto)
const userStatsAfter = await this.userStatsService.findByUserId(userId);
```

**Solución:**
1. Usar `setImmediate()` para permitir que el trigger complete
2. Query SQL directo que bypasea cache de TypeORM:

```typescript
// ✅ DESPUÉS (correcto)
await new Promise(resolve => setImmediate(resolve));

const userStatsAfter = await this.entityManager.query(`
  SELECT current_rank, total_xp, ml_coins
  FROM gamification_system.user_stats
  WHERE user_id = $1
`, [submission.user_id]);
```

**Ubicación:** `exercise-submission.service.ts:904-911`

---

### 4. Tipo Correcto para Misiones

**Problema:**
Se usaba string literal con cast a `any` en lugar del enum tipado:

```typescript
// ❌ ANTES (incorrecto)
await this.missionsService.findByTypeAndUser(userId, 'daily' as any);
```

**Solución:**
Usar el enum `MissionTypeEnum` correctamente:

```typescript
// ✅ DESPUÉS (correcto)
import { MissionTypeEnum } from '@modules/gamification/dto/missions/mission-response.dto';

await this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.DAILY);
await this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.WEEKLY);
```

**Ubicación:** `exercise-submission.service.ts:1141-1142`

---

## Validación

### Build y Lint
```bash
✅ npm run build      → BUILD SUCCESSFUL
✅ npm run lint       → 0 errores (1168 warnings pre-existentes)
```

### Verificación de Código
```bash
# Verificar multiplicador aplicado
grep -n "rankMultiplier" exercise-submission.service.ts
# Resultado: Líneas 861, 866, 869, 919, 939

# Verificar thresholds v2.1
grep -n "xp_max.*1899\|xp_min.*1900" ranks.service.ts
# Resultado: Líneas 94, 102

# Verificar enum correcto
grep -n "MissionTypeEnum" exercise-submission.service.ts
# Resultado: Líneas 1141, 1142
```

---

## Flujo Corregido

```
Ejercicio completado → claimRewards()
  │
  ├─ 1. Obtener multiplicador del rango actual desde DB
  │      getRankXpMultiplier(userId) → maya_ranks.xp_multiplier
  │
  ├─ 2. Calcular XP con multiplicador
  │      xpEarned = base × score × rankMultiplier
  │
  ├─ 3. addXp() guarda total_xp
  │      → Trigger DB promociona automáticamente si alcanza umbral
  │
  ├─ 4. setImmediate() + SQL directo
  │      → Detectar nuevo rango (bypass cache TypeORM)
  │
  ├─ 5. Si promoción detectada
  │      → Preparar rankUpData con bonus ML Coins
  │
  └─ 6. updateMissionProgress()
         → Usar MissionTypeEnum.DAILY/WEEKLY correctamente
```

---

## Prevención de Sobreescritura

### NO MODIFICAR sin leer esta documentación:

1. **`getRankXpMultiplier()`** - Método crítico que consulta multiplicador desde DB
2. **`RANK_CONFIG` en ranks.service.ts** - Thresholds deben coincidir con `03-maya_ranks.sql`
3. **Query directo en línea 907** - Necesario para bypass de cache
4. **Imports de `MissionTypeEnum`** - No usar strings literales

### Referencias Cruzadas

| Archivo Backend | Archivo DB | Debe Coincidir |
|-----------------|------------|----------------|
| ranks.service.ts:94 | 03-maya_ranks.sql | xp_max Halach Uinic = 1899 |
| ranks.service.ts:102 | 03-maya_ranks.sql | xp_min K'uk'ulkan = 1900 |
| getRankXpMultiplier() | maya_ranks.xp_multiplier | Valores 1.00-1.25 |

---

## Documentación Relacionada

- [ET-GAM-003: Sistema de Rangos Maya](../../01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md)
- [ADR-016: Simplificar Backend XP Acumulación](../../97-adr/ADR-016-simplificar-backend-xp-acumulacion.md)
- [03-maya_ranks.sql](../../../../apps/database/seeds/prod/gamification_system/03-maya_ranks.sql)

---

**Autor:** Architecture-Analyst
**Aprobado:** 2025-11-29
