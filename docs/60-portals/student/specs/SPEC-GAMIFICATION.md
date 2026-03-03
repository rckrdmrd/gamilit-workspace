---
titulo: SPEC-GAMIFICATION - Student Portal Gamification System
tipo: portal
portal: student
ultima_actualizacion: 2026-03-03
---

# SPEC-GAMIFICATION - Student Portal Gamification System

**Version:** 1.1.0
**Fecha:** 2026-03-03
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de gamificación de GAMILIT implementa mecánicas de juego para motivar el aprendizaje:
- **Sistema de Rangos Maya** - 5 niveles con multiplicadores de XP
- **ML Coins** - Moneda virtual para tienda y power-ups
- **Misiones** - Daily, weekly, y especiales
- **Leaderboards** - Rankings por diferentes niveles
- **Tienda** - Compra de items y cosmetics

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Gamification Hub | `pages/GamificationPage.tsx` | Dashboard central de gamificación |
| Leaderboard | `pages/LeaderboardPage.tsx` | Rankings multi-nivel |
| Missions | `pages/MissionsPage.tsx` | Hub de misiones |
| Shop | `pages/ShopPage.tsx` | Tienda de ML Coins |
| Inventory | `pages/InventoryPage.tsx` | Inventario de items |

---

## 3. Componentes

### 3.1 Componentes de Gamification Hub

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| GamificationHero | `components/gamification/GamificationHero.tsx` | Hero section |
| RanksSection | `components/gamification/RanksSection.tsx` | Visualización de rangos |
| MLCoinsSection | `components/gamification/MLCoinsSection.tsx` | Dashboard de monedas |
| StreaksMissionsSection | `components/gamification/StreaksMissionsSection.tsx` | Rachas y misiones |
| AchievementsPreview | `components/gamification/AchievementsPreview.tsx` | Preview de logros |
| LeaderboardPreview | `components/gamification/LeaderboardPreview.tsx` | Preview de rankings |

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useRanksStore | `features/gamification/ranks/store/ranksStore` | Zustand store de rangos |
| useEconomyStore | `features/gamification/economy/store/economyStore` | Store de ML Coins |
| useMissions | `features/gamification/missions/hooks/useMissions` | Hook de misiones |
| useLeaderboards | `features/gamification/leaderboards/hooks/useLeaderboards` | Hook de rankings |
| useGamificationData | `hooks/useGamificationData.ts` | **DEPRECATED** |

---

## 5. APIs Consumidas

### 5.1 Sistema de Rangos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/ranks/user/{userId}` | GET | Rango actual del usuario |
| `/gamification/ranks/user/progress` | GET | Progreso hacia siguiente rango |

### 5.2 Sistema de Monedas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/users/:userId/ml-coins` | GET | Balance de ML Coins |
| `/gamification/users/:userId/ml-coins/transactions` | GET | Historial de transacciones |
| `/gamification/users/:userId/ml-coins/add` | POST | Agregar ML Coins |
| `/gamification/users/:userId/ml-coins/spend` | POST | Gastar ML Coins |
| `/gamification/users/:userId/ml-coins/multiplier` | GET | Multiplicador activo del usuario |

> **Nota (corregido 2026-03-03):** Las rutas anteriores `/gamification/economy/*` eran incorrectas. Las rutas reales corresponden al `MlCoinsController` bajo el prefijo `/gamification`. La compra de items se gestiona en la sección 5.5 (Tienda).

### 5.3 Sistema de Misiones

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/missions/daily` | GET | Misiones diarias |
| `/gamification/missions/weekly` | GET | Misiones semanales |
| `/gamification/missions/special` | GET | Misiones especiales |
| `/gamification/missions/{id}/start` | POST | Iniciar misión |
| `/gamification/missions/{id}/claim` | POST | Reclamar recompensa |

### 5.4 Leaderboard

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/leaderboard/global` | GET | Ranking global |
| `/gamification/leaderboard/school` | GET | Ranking de escuela |
| `/gamification/leaderboard/classroom/{id}` | GET | Ranking de aula |
| `/gamification/leaderboard/friends` | GET | Ranking de amigos |

### 5.5 Tienda

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/shop/categories` | GET | Categorías de tienda |
| `/shop/items` | GET | Items disponibles |
| `/shop/purchase` | POST | Comprar item |
| `/shop/purchases/{userId}` | GET | Historial de compras |

### 5.6 Comodines/Power-ups

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/comodines` | GET | Catálogo de comodines disponibles |
| `/gamification/comodines/purchase` | POST | Comprar comodines con ML Coins |
| `/gamification/comodines/use` | POST | Usar comodín en ejercicio |
| `/gamification/comodines/users/:userId/inventory` | GET | Inventario de comodines del usuario |
| `/gamification/comodines/users/:userId/history` | GET | Historial de transacciones (compras/usos) |
| `/gamification/comodines/users/:userId/stats` | GET | Estadísticas de uso de comodines |

#### Detalle de Implementacion

**Modelo de datos:** Wide table `comodines_inventory` con 1 fila por usuario. Columnas por tipo: `{tipo}_available`, `{tipo}_purchased_total`, `{tipo}_used_total`, `{tipo}_cost` (donde tipo = pistas, vision_lectora, segunda_oportunidad). Auditoria via `inventory_transactions` con `item_id VARCHAR(100)` (ej. `"comodin_pistas"`) y metadata JSONB.

**Funciones SQL:** Las funciones DDL `purchase_comodin()`, `use_comodin()`, `get_comodin_inventory()` existen pero **NO son invocadas** por el backend. Toda la logica reside en `ComodinesService` (TypeScript/TypeORM).

**Bridge Shop→Comodines:** Items consumibles comprados en la tienda con `effect_data.type` in (`hint`, `highlight`, `retry`) sincronizan automaticamente al inventario de comodines via `ComodinesService.incrementFromShopPurchase()`. La sincronizacion es non-blocking (post-commit, try/catch). Mapping: `hint→pistas`, `highlight→vision_lectora`, `retry→segunda_oportunidad`. Boosts (`xp_boost`, `coins_boost`) NO sincronizan.

**Error handling:** El servicio de comodines usa `BadRequestException` (HTTP exceptions directas) para la mayoria de errores, mientras que el servicio de shop usa domain error classes (patron ADR-045). Esta inconsistencia es un gap conocido pendiente de migracion futura.

### 5.7 Sistema de Boosts

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/boosts/:userId/active` | GET | Boosts activos del usuario |

**Controlador:** `BoostController` — `apps/backend/src/modules/gamification/controllers/boost.controller.ts`
**Servicio:** `BoostService` — `apps/backend/src/modules/gamification/services/boost.service.ts`
**Entidad:** `ActiveBoost` — tabla `gamification_system.active_boosts`

#### Métodos de BoostService

| Método | Descripción |
|--------|-------------|
| `activateBoost(userId, boostType, multiplier, durationDays, source)` | Activa un boost para el usuario, desactivando cualquier boost previo del mismo tipo |
| `getActiveBoosts(userId)` | Retorna todos los boosts activos (no expirados) para el usuario |
| `getActiveMultiplier(userId, boostType)` | Retorna el multiplicador activo para un tipo de boost; devuelve `1.0` si no hay boost activo |
| `deactivateExpiredBoosts(userId)` | Desactiva boosts cuya `expires_at` ya pasó (llamado internamente antes de cada consulta) |

#### Tipos de Boost

| Tipo (`boost_type`) | Origen en Tienda (`effect_data.type`) | Multiplicador por defecto |
|---------------------|---------------------------------------|---------------------------|
| `XP` | `xp_boost` | `2.0x` |
| `COINS` | `coins_boost` | `1.5x` |

#### Flujo de Activacion

```
1. Estudiante compra item de tienda con effect_data.type = 'xp_boost' o 'coins_boost'
   ↓
2. ShopService.purchaseItem() completa la transacción DB (deducción de ML Coins + user_purchases)
   ↓
3. Post-transacción (non-blocking, try/catch):
   BoostService.activateBoost(userId, boostType, multiplier, durationDays, 'ITEM:<purchaseId>')
   ↓
4. BoostService desactiva cualquier boost previo del mismo tipo para ese usuario
   ↓
5. Crea nueva fila en active_boosts con:
   - boost_type: 'XP' | 'COINS'
   - multiplier: item.effect_data.multiplier ?? (xp_boost: 2.0, coins_boost: 1.5)
   - duration_days: item.duration_days ?? 1
   - expires_at: now + durationDays * 24h
   - source: 'ITEM:<purchaseId>'
   ↓
6. GamifiedHeader consulta GET /gamification/boosts/:userId/active y muestra indicador
```

#### Mecanismo de Expiracion

El sistema usa **expiracion on-read** (no existe cron job):
- Antes de cada consulta de boosts, `deactivateExpiredBoosts()` actualiza las filas con `expires_at <= now()` a `is_active = false`
- No hay proceso background que desactive boosts automaticamente
- La desactivacion ocurre cuando el usuario visita la tienda, el perfil, o cualquier pagina que consulte `/boosts/:userId/active`

#### Gaps Conocidos del Sistema de Boosts

| ID | Descripcion | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-BOOST-001 | `addXp()` en `GamificationService` **no consulta** boosts activos — el boost XP se activa en `active_boosts` pero el calculo de XP no aplica el multiplicador aun | Alta | Pendiente |
| GAP-BOOST-002 | No existe cron job para expiracion proactiva — boosts solo se desactivan on-read | Baja | Documentado |

> **Nota importante (GAP-BOOST-001):** Cuando un estudiante compra un `xp_boost`, el boost se registra correctamente en `active_boosts` y aparece en el header. Sin embargo, el metodo `addXp()` de `GamificationService` aun no invoca `getActiveMultiplier()` para aplicar el multiplicador al calculo de XP ganado por ejercicio. El efecto visible del boost sobre XP queda pendiente de integracion futura.

---

## 6. Sistema de Rangos Maya

### 6.1 Estructura de Rangos

| Nivel | Nombre | Icon | XP Requerido | Multiplicador |
|-------|--------|------|--------------|---------------|
| 1 | Nacom | 🔍 | 0 | 1.0x |
| 2 | Ajaw | 🏹 | 500 | 1.5x |
| 3 | Ah K'in | 🗡️ | 1,500 | 2.0x |
| 4 | Halach Uinic | ⚔️ | 3,500 | 2.5x |
| 5 | K'uk'ulkan | 👑 | 7,500 | 3.0x |

### 6.2 Colores por Rango

```typescript
const rankColors: Record<string, string> = {
  'Nacom': 'gray',
  'Ajaw': 'blue',
  'Ah K\'in': 'purple',
  'Halach Uinic': 'orange',
  'K\'uk\'ulkan': 'yellow'
};
```

---

## 7. Sistema de ML Coins

### 7.1 Fuentes de Ganancia

| Fuente | ML Coins | Descripción |
|--------|----------|-------------|
| Ejercicio completado | ~50 | Base por ejercicio |
| Logro desbloqueado | ~100 | Por achievement |
| Módulo completado | ~200 | Por módulo |
| Racha mantenida | ~10/día | Por día consecutivo |
| Misión completada | 25-100 | Según tipo |
| Rank-up bonus | 100-500 | Por subir de rango |

### 7.2 Usos

- **Tienda:** Cosmetics, power-ups, premium content
- **Power-ups:** Pistas, tiempo extra, segunda oportunidad
- **Cosmetics:** Avatares, bordes, efectos

### 7.3 Arquitectura Dual-Store (ML Coins)

| Store | Tipo | Endpoint | Consumer principal |
|-------|------|----------|-------------------|
| `useUserGamification` | React Query | GET /summary | GamifiedHeader, Dashboard |
| `economyStore` | Zustand persist | GET /stats (via fetchBalance) | ShopPage, InventoryPage |
| `gamificationApi.getMLCoinsBalance` | Definida sin uso activo | GET /ml-coins | — |

**Sincronizacion:** WebSocket events invalidan React Query cache. ShopPage llama `fetchBalance()` en mount. Post-compra actualiza ambos stores. Ver ADR-052.

---

## 8. Sistema de Misiones

### 8.1 Tipos de Misiones

| Tipo | Frecuencia | Reset | Ejemplo |
|------|-----------|-------|---------|
| Daily | 24 horas | Medianoche | Completar 3 ejercicios |
| Weekly | 7 días | Lunes | Ganar 500 ML |
| Special | Variable | Evento | Evento aniversario |

> **Nota UI (2026-02-28):** La pestaña "Especiales" ha sido eliminada de MissionsPage en el portal frontend. Solo se muestran las pestañas "Diarias" y "Semanales". El endpoint `/gamification/missions/special` sigue activo en el backend para uso futuro.

### 8.2 Estados de Misión

```
pending → started → completed → claimed
```

### 8.3 Estructura

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  required: number;
  reward: {
    coins: number;
    xp: number;
  };
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}
```

---

## 9. Sistema de Leaderboard

### 9.1 Tipos de Ranking

| Tipo | Descripción | Filtros | UI |
|------|-------------|---------|-----|
| Global | Todos los usuarios | Período | Visible |
| School | Usuarios de la escuela | Período | Solo backend |
| Grade | Usuarios del grado | Período | Solo backend |
| Classroom | Usuarios del aula | Período | Solo backend |
| Friends | Amigos del usuario | Período | Solo backend |

> **Nota UI (2026-02-28):** LeaderboardPage solo muestra el scope **Global**. Las pestañas "Escuela", "Grado", "Mi Aula" y "Amigos" han sido eliminadas del portal frontend. Los endpoints de backend correspondientes siguen activos para uso futuro.

### 9.2 Períodos

- Daily (Diario)
- Weekly (Semanal)
- Monthly (Mensual)
- All-time (Histórico)

### 9.3 Categorías de Puntos

| Categoría | Puntos | Descripción |
|-----------|--------|-------------|
| Ejercicios | 50 XP | Por ejercicio |
| Logros | 100 XP | Por achievement |
| Módulos | 200 XP | Por módulo |
| Rachas | 10 XP/día | Por día en racha |

---

## 10. Tienda

### 10.1 Categorías

- Cosmetics
- Profile
- Guild [INACTIVO]
- Social [INACTIVO]
- Consumable

### 10.2 Rarezas

| Rareza | Color | Descripción |
|--------|-------|-------------|
| Common | Gray | 75% de items |
| Rare | Blue | 15-20% |
| Epic | Purple | 5-10% |
| Legendary | Yellow | <5% |

### 10.3 Comportamiento Consumibles

**Comportamiento consumibles:**
- Items consumibles (`is_consumable=true`) siempre muestran botón "Comprar" (nunca "Adquirido")
- Badge "Tienes: N" indica la cantidad comprada previamente
- Compras de consumibles con `effect_data.type` hint/highlight/retry acreditan automáticamente al inventario de comodines
- Compras repetidas de consumibles desactivan la compra previa automaticamente (constraint UNIQUE satisfecho)
- En caso de error de concurrencia, se muestra mensaje amigable al usuario

**Bridge shop→comodines:**
- `incrementFromShopPurchase()` sincroniza `user_purchases` → `comodines_inventory` tras cada compra de consumible
- El bridge usa `inventoryRepo.save()` directo (misma conexion que cargo la entidad) para evitar problemas de entidad detached
- Logging detallado con prefijo `[BRIDGE]` para diagnostico en logs del servidor

---

## 11. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P1-005 | Cart en ShopPage sin funcionalidad | Alta | Pendiente |
| GAP-P1-006 | Claim Reward disabled en dashboard | Media | Pendiente |
| GAP-P1-007 | useGamificationData es código muerto | Baja | Pendiente |
| GAP-P2-005 | CategoryStats calculado localmente | Media | Pendiente |
| GAP-P2-006 | Cosmetics "Próximamente" | Media | Pendiente |
| GAP-P2-007 | Polling 30s sin jitter/backoff | Baja | Pendiente |
| GAP-BOOST-001 | `addXp()` no aplica multiplicador de boost activo — el boost se activa pero el cálculo de XP no lo consulta aún | Alta | Pendiente |
| GAP-BOOST-002 | No existe cron job para expiración proactiva de boosts — desactivación solo ocurre on-read | Baja | Documentado |

---

## 12. Referencias

- **Rangos Maya:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
- **Hooks:** `STUDENT-HOOKS-SPEC.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24 | Actualizado: 2026-03-03*
*Sistema SIMCO v4.0.0*
