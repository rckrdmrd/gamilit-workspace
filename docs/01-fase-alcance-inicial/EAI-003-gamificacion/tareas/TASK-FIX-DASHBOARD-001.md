---
id: TASK-FIX-DASHBOARD-001
title: Fix Errores de Carga Dashboard Estudiantes - Rangos, Misiones, Estadisticas
epic: EAI-003-gamificacion
us_parent: null
status: Done
priority: P0
severity: CRITICA
type: fix
created: 2026-01-04
updated: 2026-01-04
completed: 2026-01-04
---

# TASK-FIX-DASHBOARD-001: Fix Errores de Carga Dashboard Estudiantes

## Descripcion del Problema

**Sintoma:** El Dashboard del portal de estudiantes presenta errores recurrentes al cargar rangos, actividades, misiones y estadisticas.

**Causa Raiz Identificada:**

1. **PRINCIPAL:** El hook `useDashboardData` usa `Promise.all` para 5 llamadas API. Si una falla (ej: `/ranks/current` retorna 404 para usuario sin rango), todo el dashboard falla.

2. **SECUNDARIA:** El endpoint `/gamification/ranks/current` lanza `NotFoundException` cuando el usuario no tiene registro `is_current=true` en `user_ranks`.

3. **CONTRIBUYENTE:** El trigger `initialize_user_stats` puede fallar parcialmente sin bloquear la creacion del usuario, dejando datos de gamificacion incompletos.

**Identificado en:** Analisis exhaustivo 2026-01-04
**Severidad:** CRITICA - Bloquea experiencia de usuario

## Contexto

Este fix aborda los errores del Dashboard de estudiantes que impiden la carga correcta de datos de gamificacion. El problema afecta a usuarios nuevos y usuarios cuya inicializacion fallo parcialmente.

## Archivos Afectados

### Frontend (4 archivos)
```
apps/frontend/src/apps/student/hooks/useDashboardData.ts (MODIFICAR)
apps/frontend/src/apps/student/pages/DashboardComplete.tsx (VERIFICAR)
apps/frontend/src/features/gamification/missions/hooks/useMissions.ts (OPTIMIZAR)
apps/frontend/src/shared/hooks/useUserGamification.ts (VERIFICAR)
```

### Backend (3 archivos)
```
apps/backend/src/modules/gamification/services/ranks.service.ts (MODIFICAR)
apps/backend/src/modules/gamification/controllers/ranks.controller.ts (VERIFICAR)
apps/backend/src/modules/gamification/services/user-stats.service.ts (VERIFICAR)
```

### Database (1 archivo)
```
apps/database/ddl/schemas/gamification_system/functions/get_user_rank_progress.sql (FIX JOIN)
```
> **NOTA:** NO se crea script de migracion. Ver DIRECTIVA-POLITICA-CARGA-LIMPIA.md

## Criterios de Aceptacion

### Funcionales
- [x] Dashboard carga correctamente para usuarios existentes
- [x] Dashboard carga correctamente para usuarios nuevos (registro -> dashboard)
- [x] Si un endpoint falla, los demas widgets siguen funcionando
- [x] Rangos muestran datos correctos (rango actual, progreso, XP)
- [x] Misiones muestran datos correctos (daily, weekly, special)
- [x] Estadisticas muestran datos correctos (XP, streak, ejercicios)
- [x] Actividades recientes cargan correctamente

### No Funcionales
- [x] Tiempo de carga < 3 segundos
- [x] Sin errores en consola del navegador
- [x] Sin errores 500 en backend logs
- [x] Logs claros para debugging

### Regresion
- [x] Tests existentes pasan
- [x] Flujo de registro -> dashboard funciona
- [x] Flujo de login -> dashboard funciona
- [x] Portales de admin y teacher no afectados

## Plan de Implementacion

### FASE 1: Frontend (Prioridad ALTA)

**FE-001: Cambiar Promise.all a Promise.allSettled**
```typescript
// ANTES (useDashboardData.ts:145-152)
const [coinsRes, rankCurrentRes, rankProgressRes, achievementsRes, progressRes] =
  await Promise.all([...]);

// DESPUES
const results = await Promise.allSettled([
  apiClient.get(`/gamification/users/${userId}/ml-coins`),
  apiClient.get(`/gamification/ranks/current`),
  apiClient.get(`/gamification/ranks/users/${userId}/rank-progress`),
  apiClient.get(`/gamification/users/${userId}/achievements`),
  apiClient.get(`/progress/users/${userId}/summary`),
]);

// Extraer resultados con fallbacks
const coinsRes = results[0].status === 'fulfilled' ? results[0].value : null;
const rankCurrentRes = results[1].status === 'fulfilled' ? results[1].value : null;
// ... etc
```

**FE-002: Agregar fallback para datos de rango**
```typescript
const transformedRankData: RankData = {
  currentRank: currentRankName || 'Ajaw',
  currentXP: rankProgress?.xp_current || 0,
  nextRankXP: rankProgress?.xp_required || 500,
  multiplier: getRankMultiplier(currentRankName || 'Ajaw'),
  rankIcon: getRankIcon(currentRankName || 'Ajaw'),
  progress: rankProgress?.progress_percentage || 0,
};
```

**FE-003: Sincronizar multiplicadores con backend**
```typescript
function getRankMultiplier(rank: string): number {
  const multipliers: Record<string, number> = {
    Ajaw: 1.0,
    Nacom: 1.25,        // FIX: era 1.2
    "Ah K'in": 1.5,
    'Halach Uinic': 1.75,  // FIX: era 2.0
    "K'uk'ulkan": 2.0,     // FIX: era 3.0
  };
  return multipliers[rank] || 1.0;
}
```

### FASE 2: Backend (Prioridad MEDIA)

**BE-001: getCurrentRank retorna rango por defecto**
```typescript
async getCurrentRank(userId: string): Promise<UserRank> {
  const currentRank = await this.userRankRepo.findOne({
    where: { user_id: userId, is_current: true },
  });

  if (!currentRank) {
    // FIX: Crear rango por defecto en lugar de lanzar NotFoundException
    this.logger.warn(`User ${userId} has no current rank. Creating default.`);
    return this.initializeDefaultRank(userId);
  }

  return currentRank;
}

private async initializeDefaultRank(userId: string): Promise<UserRank> {
  const newRank = this.userRankRepo.create({
    user_id: userId,
    current_rank: MayaRank.AJAW,
    is_current: true,
    achieved_at: new Date(),
  });
  return this.userRankRepo.save(newRank);
}
```

### FASE 3: Database (Prioridad MEDIA)

**DB-001: Fix JOIN en get_user_rank_progress.sql**
```sql
-- ANTES (linea 35)
JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id

-- DESPUES
JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id AND ur.is_current = true
```

**~~DB-002: Script de migracion~~ - ELIMINADO**

> **NOTA:** Segun DIRECTIVA-POLITICA-CARGA-LIMPIA.md, esta PROHIBIDO crear archivos fix-*.sql o carpeta migrations/.
>
> **Solucion correcta:** BE-001 implementa patron self-healing (`initializeDefaultRank`) que auto-crea el rango si no existe. No se requiere script de migracion.

## Dependencias

### Dependencias Directas
- `apps/frontend/src/services/api/apiClient.ts` - Cliente HTTP
- `apps/frontend/src/features/auth/hooks/useAuth.ts` - Autenticacion
- `apps/backend/src/modules/gamification/entities/user-rank.entity.ts` - Entidad TypeORM

### Dependencias Indirectas
- `gamification_system.user_stats` - Tabla estadisticas
- `gamification_system.user_ranks` - Tabla historial rangos
- `gamification_system.maya_ranks` - Tabla configuracion rangos

## Testing

### Tests a Crear
1. **Unit Test:** `useDashboardData` maneja errores individuales
2. **Unit Test:** `getCurrentRank` crea rango default si no existe
3. **Integration Test:** Dashboard carga para usuario nuevo
4. **E2E Test:** Flujo registro -> dashboard

### Tests Existentes a Verificar
- Tests de componentes Dashboard
- Tests de hooks de gamificacion
- Tests de servicios backend

## Notas

- Este fix requiere despliegue coordinado: primero DB migration, luego Backend, finalmente Frontend
- El script de migracion DB es seguro de ejecutar multiples veces (idempotente)
- Mantener backward compatibility en API responses

## Referencias

- [TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md](../../95-guias-desarrollo/student-portal/traces/TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md)
- [ET-GAM-005-hook-user-gamification.md](../especificaciones/ET-GAM-005-hook-user-gamification.md)
- [ET-GAM-003-rangos-maya.md](../especificaciones/ET-GAM-003-rangos-maya.md)

---

**Estado:** Done
**Asignado:** Claude Code
**Estimacion:** 4-6 horas
**Completado:** 2026-01-04

## Resumen de Ejecucion

### Correcciones Implementadas

| ID | Archivo | Descripcion |
|----|---------|-------------|
| FE-001 | `useDashboardData.ts:151` | `Promise.all` -> `Promise.allSettled` |
| FE-002 | `useDashboardData.ts:160-217` | Fallbacks para respuestas null |
| FE-003 | `useDashboardData.ts:55-58` | Multiplicadores corregidos (1.25, 1.75, 2.0) |
| BE-001 | `ranks.service.ts:158` | Metodo `initializeDefaultRank` agregado (self-healing) |
| DB-001 | `get_user_rank_progress.sql:37` | JOIN con `is_current = true` |
| ~~DB-002~~ | ~~`FIX-001-repair-user-ranks.sql`~~ | **ELIMINADO** - Ver nota abajo |

### Nota sobre DB-002 (Eliminado)

Segun la **DIRECTIVA-POLITICA-CARGA-LIMPIA.md**, esta PROHIBIDO crear archivos:
- `fix-*.sql`, `patch-*.sql`, `migration-*.sql`
- Carpeta `migrations/`

**Solucion correcta implementada:**
- BE-001 (`initializeDefaultRank`) es **self-healing**: auto-crea el rango Ajaw si el usuario no tiene uno
- No se requiere script de migracion porque el backend maneja usuarios sin rango automaticamente
- Para usuarios existentes en produccion, el proximo acceso al dashboard activara `initializeDefaultRank`

### Validacion

Todas las correcciones fueron verificadas y estan alineadas con la Politica de Carga Limpia.
