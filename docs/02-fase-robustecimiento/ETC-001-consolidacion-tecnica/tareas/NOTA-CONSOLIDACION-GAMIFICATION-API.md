# NOTA: Consolidacion de gamificationAPI - Analisis Detallado

**Fecha:** 2026-01-16
**Estado:** BLOQUEADO - Requiere decision arquitectonica
**Tarea:** TASK-ETC-001-001

---

## Hallazgos

### Uso Actual de las 3 Versiones

| Version | Ubicacion | Imports Activos | Funciones Usadas |
|---------|-----------|-----------------|------------------|
| V1 | services/api/gamificationAPI.ts | 2 | getUserSummary |
| V2 | features/gamification/api/gamificationAPI.ts | 0 | (ninguna directamente) |
| V3 | lib/api/gamification.api.ts | 2 | getAllAchievements, getUserAchievements, getAchievementSummary, claimAchievement |

### Problema de Consolidacion

Las 3 versiones tienen **funciones unicas que se usan activamente**:

1. **V1** tiene `getUserGamificationSummary` - usado en `useUserGamification.ts`
2. **V3** tiene `getAchievementSummary` y `claimAchievement` - NO existen en V2

V2 es la mas completa (23 funciones) pero:
- NO tiene `getUserGamificationSummary` (tiene `getUserStats` que es diferente)
- NO tiene `getAchievementSummary`
- Tiene `unlockAchievement` en lugar de `claimAchievement` (endpoint diferente)

### Inconsistencias de Endpoints Backend

| Concepto | V1 | V2 | V3 |
|----------|----|----|-----|
| User stats summary | `/gamification/users/{id}/summary` | `/gamification/users/{id}/stats` | N/A |
| Achievement claim | N/A | `/achievements/unlock` | `/users/{id}/achievements/{id}/claim` |
| Leaderboard school | N/A | `/leaderboard/school/{id}` | `/leaderboard/schools/{id}` |

---

## Decision Requerida

Antes de consolidar, se necesita:

1. **Clarificar con backend** cual es el endpoint correcto para:
   - User summary vs User stats
   - Achievement unlock vs claim
   - Leaderboard singular vs plural

2. **Decidir ubicacion canonica**:
   - `services/api/` (patron actual)
   - `lib/api/` (patron nuevo)
   - `features/*/api/` (por feature)

3. **Definir estrategia de migracion**:
   - Big bang (migrar todo de una vez)
   - Incremental (crear aliases, migrar gradualmente)

---

## Accion Temporal

Por ahora, las 3 versiones **permanecen** porque:
- Cada una tiene funcionalidad unica en uso
- Eliminar cualquiera romperia la aplicacion
- Se requiere decision arquitectonica

---

## Siguiente Paso

Escalar a **Product Owner / Tech Lead** para decision sobre:
- Estandarizacion de endpoints backend
- Ubicacion canonica de APIs frontend
- Timeline de consolidacion

---

**Bloqueado hasta:** Decision arquitectonica
**Asignado a:** PO/Tech Lead
