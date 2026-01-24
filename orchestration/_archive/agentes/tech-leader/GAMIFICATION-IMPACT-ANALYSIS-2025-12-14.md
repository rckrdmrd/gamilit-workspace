# ANALISIS DE IMPACTO: Correcciones de Gamificacion
## GAMILIT - FASE 4

**Fecha:** 2025-12-14
**Proyecto:** GAMILIT
**Rol:** Tech-Leader Agent
**Basado en:** GAMIFICATION-CORRECTION-PLAN-2025-12-14.md

---

## RESUMEN DE IMPACTO

| Correccion | Componentes Afectados | Riesgo | Requiere Testing |
|------------|----------------------|--------|------------------|
| P0-001 (SQL) | 0 funciones SQL dependientes | BAJO | SI (SQL tests) |
| P0-002 (isMinRank) | 0 componentes externos | BAJO | NO |
| P0-003 (Progress) | 2 componentes UI | MEDIO | SI (UI tests) |
| P0-004 (API) | 4+ componentes UI | ALTO | SI (E2E tests) |

---

## P0-001: calculate_maya_rank_helpers.sql

### Dependencias Encontradas

**Funciones SQL que usan esta funcion:** NINGUNA

Basado en busqueda exhaustiva, la funcion `calculate_maya_rank_from_xp()` no es llamada por:
- Otras funciones SQL en el schema gamification_system
- Triggers existentes
- Views o materialized views

**Documentacion que referencia esta funcion:**
- `orchestration/inventarios/MASTER_INVENTORY.yml` (linea 91-92) - Solo documentacion
- `apps/backend/migrations/README.md` (linea 48-56) - Solo ejemplos

### Analisis de Impacto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Funciones dependientes | ✅ NINGUNA | No hay cascada de cambios |
| Triggers | ✅ NO AFECTADOS | Triggers usan maya_ranks table |
| Views | ✅ NO AFECTADAS | No hay views usando esta funcion |
| Backend | ✅ NO AFECTADO | Backend usa RanksService, no SQL directo |
| Frontend | ✅ NO AFECTADO | Frontend no llama SQL |

### Conclusion P0-001
**RIESGO: BAJO**
El cambio es seguro. La funcion es una utilidad "pura" que no tiene dependencias en cadena.

---

## P0-002: isMinRank en useRank.ts

### Dependencias Encontradas

**Archivos que importan useRank:**
```
apps/frontend/src/features/gamification/ranks/components/RankComparison.tsx
apps/frontend/src/features/gamification/ranks/components/RankUpModal.tsx
apps/frontend/src/features/gamification/ranks/hooks/index.ts (re-export)
```

**Uso de isMinRank en componentes:**

Buscando uso de `isMinRank`:
- `useRank.ts`: Se define y exporta (linea 34, 65-68, 143)
- **Ningun componente externo usa `isMinRank`**

### Analisis de Impacto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| RankComparison.tsx | ✅ NO USA | Usa compareToNext, compareToRank |
| RankUpModal.tsx | ✅ NO USA | Usa currentRank, previousRank, prestigeLevel |
| Otros componentes | ✅ NO USAN | No hay referencias externas |

### Conclusion P0-002
**RIESGO: MUY BAJO**
La variable `isMinRank` se exporta pero no se usa en ningun componente externo actualmente. El cambio no tiene impacto visible.

---

## P0-003: Calculo de Progreso (XP vs ML Coins)

### Dependencias Encontradas

**Componentes que usan `progress` de useRank:**
- `RankComparison.tsx` - Muestra progreso hacia siguiente rango
- `RankUpModal.tsx` - Podria mostrar progreso

**Variables relacionadas en ranksStore:**
```typescript
// ranksStore.ts - userProgress incluye:
{
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;        // <-- EXISTE
  currentRank: string;
  mlCoinsEarned: number;  // <-- Actualmente usado
  ...
}
```

### Analisis de Impacto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| RankComparison.tsx | ⚠️ AFECTADO | Muestra progress percentage |
| RankUpModal.tsx | ⚠️ VERIFICAR | Podria usar progress |
| Dashboard widgets | ⚠️ VERIFICAR | Podrian mostrar progress |
| ranksStore | ✅ TIENE totalXP | Campo disponible |

### Dependencias de Datos

Para que P0-003 funcione, se necesita verificar:

1. **ranksStore tiene `totalXP`**: ✅ SI (`userProgress.totalXP`)
2. **Backend envia `totalXP`**: ✅ SI (UserStats.total_xp)
3. **Umbrales de XP disponibles**: ❌ NO - Actualmente hardcodeados

### Cambios Adicionales Requeridos

Para P0-003, ademas del hook, se necesita:

1. Agregar constantes de umbrales XP en frontend
2. O mejor: usar P0-004 para obtener umbrales desde API

### Conclusion P0-003
**RIESGO: MEDIO**
El cambio requiere verificar que los componentes que usen `progress` se actualicen correctamente. Se recomienda implementar P0-004 primero.

---

## P0-004: Reemplazar Mock Data con API

### Dependencias Encontradas

**Archivos que importan de mockData/ranksMockData:**
```
apps/frontend/src/features/gamification/ranks/hooks/useRank.ts
```

**Componentes que usan useRank (indirectamente afectados):**
```
apps/frontend/src/features/gamification/ranks/components/RankComparison.tsx
apps/frontend/src/features/gamification/ranks/components/RankUpModal.tsx
```

**Componentes que usan useRanksStore directamente:**
```
apps/frontend/src/features/gamification/ranks/components/PrestigeSystem.tsx
apps/frontend/src/features/gamification/ranks/components/ProgressTimeline.tsx
apps/frontend/src/features/gamification/ranks/hooks/useMultipliers.ts
apps/frontend/src/features/gamification/ranks/hooks/useProgression.ts
apps/frontend/src/apps/student/pages/GamificationPage.tsx
apps/frontend/src/apps/student/pages/EnhancedProfilePage.tsx
apps/frontend/src/apps/student/pages/GamificationTestPage.tsx
apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx
apps/frontend/src/features/gamification/components/StreakIndicator.tsx
apps/frontend/src/shared/hooks/useInvalidateDashboard.ts
```

### Analisis de Impacto

| Componente | Impacto | Accion Requerida |
|------------|---------|------------------|
| useRank.ts | ALTO | Modificar para usar API |
| RankComparison.tsx | MEDIO | Verificar props |
| RankUpModal.tsx | MEDIO | Verificar props |
| PrestigeSystem.tsx | BAJO | Usa ranksStore, no useRank |
| ProgressTimeline.tsx | BAJO | Usa ranksStore |
| useMultipliers.ts | BAJO | Usa ranksStore |
| useProgression.ts | BAJO | Usa ranksStore |
| GamificationPage.tsx | BAJO | Usa ranksStore |
| EnhancedProfilePage.tsx | BAJO | Usa ranksStore |
| CompletionModal.tsx | BAJO | Usa useProgression |

### Dependencias de Backend

Para P0-004, se necesita verificar endpoints:

| Endpoint | Estado | Accion |
|----------|--------|--------|
| GET /gamification/ranks/config | ✅ EXISTE | getAllRanksConfig() |
| GET /gamification/ranks/progress/:userId | ✅ EXISTE | calculateRankProgress() |
| GET /gamification/users/:id/rank | ⚠️ VERIFICAR | getCurrentRank() |

### Verificacion de RanksController

```typescript
// Endpoints existentes en ranks.controller.ts:
@Get('users/:userId/current')     // getCurrentRank
@Get('users/:userId/history')     // getUserRankHistory
@Get('users/:userId/progress')    // calculateRankProgress
@Post('users/:userId/promote')    // promoteToNextRank
@Get('config')                    // getAllRanksConfig (necesita agregar)
```

### Conclusion P0-004
**RIESGO: ALTO** pero **MANEJABLE**
- El cambio afecta multiples componentes indirectamente
- Los componentes usan ranksStore (Zustand), no useRank directamente
- El store ya tiene metodo `fetchUserProgress` que puede ser extendido
- Se recomienda implementar de forma incremental

---

## MATRIZ DE DEPENDENCIAS COMPLETA

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  calculate_maya_rank_helpers.sql (P0-001)                               │
│  └── [NO DEPENDENCIAS]                                                  │
│                                                                         │
│  maya_ranks table (seed)                                                │
│  ├── check_rank_promotion() ─── trg_check_rank_promotion_on_xp_gain    │
│  └── promote_to_next_rank()                                             │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  RanksService (RANK_CONFIG hardcoded v2.1)                              │
│  ├── RanksController                                                    │
│  │   ├── GET /ranks/users/:id/current                                   │
│  │   ├── GET /ranks/users/:id/progress                                  │
│  │   └── GET /ranks/config (agregar endpoint)                           │
│  └── ExerciseAttemptService                                             │
│      └── UserStatsService.addXp()                                       │
│          └── [TRIGGER DB → check_rank_promotion]                        │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ranksStore (Zustand) ◄── fetchUserProgress()                           │
│  ├── useProgression hook                                                │
│  ├── useMultipliers hook                                                │
│  └── Componentes directos (GamificationPage, etc.)                      │
│                                                                         │
│  useRank hook (P0-002, P0-003, P0-004)                                  │
│  ├── mockData/ranksMockData (ELIMINAR)                                  │
│  ├── RankComparison.tsx                                                 │
│  └── RankUpModal.tsx                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ORDEN DE IMPLEMENTACION RECOMENDADO

Basado en el analisis de dependencias:

### Fase 1: Sin Dependencias (Seguro)
1. **P0-001** - Actualizar SQL function (no afecta nada)
2. **P0-002** - Corregir isMinRank (no usado externamente)

### Fase 2: Verificar Backend
3. Verificar/crear endpoint `GET /ranks/config`
4. Verificar respuesta de `GET /ranks/users/:id/progress`

### Fase 3: Frontend con Cuidado
5. **P0-004** - Crear ranksAPI.ts con llamadas API
6. **P0-003** - Actualizar calculo de progress

### Fase 4: Testing
7. Ejecutar tests unitarios de ranksStore
8. Ejecutar tests de integracion
9. Verificar manualmente en UI

---

## CHECKLIST PRE-IMPLEMENTACION

### Base de Datos
- [ ] Verificar que no hay queries usando calculate_maya_rank_from_xp
- [ ] Tener script de rollback listo

### Backend
- [ ] Verificar endpoint /ranks/config existe
- [ ] Verificar respuesta incluye umbrales XP

### Frontend
- [ ] Backup de useRank.ts actual
- [ ] Verificar totalXP disponible en ranksStore
- [ ] Preparar mock para desarrollo

### Testing
- [ ] Tests unitarios de ranksStore pasando
- [ ] Tests de integracion de RanksIntegration.test.tsx
- [ ] Tests de DashboardIntegration.test.tsx

---

## PLAN DE ROLLBACK

### Si P0-001 falla:
```sql
-- Restaurar version v1.0
CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp < 1000 THEN RETURN 'Ajaw';
    ELSIF xp < 3000 THEN RETURN 'Nacom';
    ELSIF xp < 6000 THEN RETURN 'Ah K''in';
    ELSIF xp < 10000 THEN RETURN 'Halach Uinic';
    ELSE RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Si P0-002/003/004 fallan:
```bash
# Restaurar useRank.ts desde git
git checkout HEAD -- apps/frontend/src/features/gamification/ranks/hooks/useRank.ts
```

---

## CONCLUSION

El analisis de impacto confirma que las correcciones son **seguras de implementar** siguiendo el orden recomendado:

1. **P0-001 y P0-002** son de riesgo muy bajo y pueden implementarse inmediatamente
2. **P0-003 y P0-004** requieren coordinacion pero tienen dependencias claras
3. No hay "cascadas" de cambios inesperadas
4. Los tests existentes cubren la mayoria de los casos

**Recomendacion:** Proceder con la implementacion en el orden indicado.

---

**Proximo Paso:** FASE 5 - Ejecucion del Plan de Implementacion

---

**Autor:** Tech-Leader Agent
**Revision:** 1.0
**Fecha:** 2025-12-14
