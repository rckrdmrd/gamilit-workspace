---
id: "CORR-004-PLAN"
title: "Plan de Ejecucion - Correccion API LeaderboardPage y AchievementsPage"
type: "Plan"
status: "Ejecutado"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-004"
affected_files:
  - "apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts"
  - "apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts"
  - "apps/frontend/src/lib/api/gamification.api.ts"
  - "apps/frontend/src/features/gamification/social/api/socialAPI.ts"
labels: ["plan", "correccion", "api", "pendiente"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# PLAN DE EJECUCION: CORR-004

**Prioridad:** P0 (Critico)
**Fecha creacion:** 2026-01-07
**Estado:** PENDIENTE APROBACION
**Estrategia:** Opcion C - Solucion Hibrida

---

## RESUMEN DEL PLAN

| Paso | Descripcion | Componente | Prioridad |
|------|-------------|------------|-----------|
| 1 | Crear endpoint user-rank en backend | Backend | P0 |
| 2 | Crear achievementTransformer | Frontend | P0 |
| 3 | Integrar transformer en gamification.api | Frontend | P0 |
| 4 | Mejorar manejo de errores en socialAPI | Frontend | P1 |
| 5 | Validar build frontend y backend | Ambos | P0 |
| 6 | Documentar ejecucion | - | P2 |

---

## PASO 1: CREAR ENDPOINT USER-RANK EN BACKEND (P0)

### Archivo
/apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts

### Ubicacion del cambio
Despues del endpoint GET /leaderboard/global (linea ~130)

### Codigo a agregar

```typescript
/**
 * Obtiene la posicion del usuario actual en el leaderboard
 */
@Get('leaderboards/user-rank')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get current user leaderboard position',
  description: 'Obtiene la posicion del usuario autenticado en el leaderboard',
})
@ApiQuery({ name: 'type', required: false, type: String, example: 'global' })
@ApiQuery({ name: 'period', required: false, type: String, example: 'all-time' })
async getUserRank(
  @Req() req: RequestWithUser,
  @Query('type') type: string = 'global',
  @Query('period') period: string = 'all-time',
) {
  const userId = req.user.sub;
  const userPosition = await this.leaderboardService.getUserPosition(userId);

  return {
    success: true,
    data: {
      rank: userPosition?.rank || null,
      userId: userId,
      type: type,
      period: period,
      ...userPosition,
    },
  };
}
```

### Verificacion
- [ ] Endpoint responde a GET /leaderboards/user-rank
- [ ] Retorna posicion del usuario
- [ ] Sin errores de TypeScript

---

## PASO 2: CREAR ACHIEVEMENTTRANSFORMER (P0)

### Archivo a crear
/apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts

### Funcionalidad
- Transformar respuestas snake_case a camelCase
- Mapear completed_at a earnedAt
- Calcular status desde is_completed y rewards_claimed

### Verificacion
- [ ] Archivo creado
- [ ] Tipos correctos
- [ ] Mapeo de campos completo

---

## PASO 3: INTEGRAR TRANSFORMER (P0)

### Archivo
/apps/frontend/src/lib/api/gamification.api.ts

### Cambio
Usar transformUserAchievements() en getUserAchievements()

---

## PASO 4: MEJORAR MANEJO DE ERRORES (P1)

### Archivo
/apps/frontend/src/features/gamification/social/api/socialAPI.ts

### Cambio
getUserLeaderboardRank debe retornar null en 404 en lugar de throw

---

## PASO 5: VALIDAR BUILD (P0)

### Backend
```bash
cd apps/backend && npx tsc --noEmit
```

### Frontend
```bash
cd apps/frontend && npm run build
```

---

## ORDEN DE EJECUCION

```
1. Crear achievementTransformer.ts (Frontend)
      |
      v
2. Integrar transformer en gamification.api.ts
      |
      v
3. Crear endpoint user-rank (Backend)
      |
      v
4. Mejorar manejo errores socialAPI
      |
      v
5. Validar builds
      |
      v
6. Documentar ejecucion
```

---

## VALIDACION DEL PLAN CONTRA ANALISIS

### Problema 1: Endpoints 404
| Hallazgo | Solucion |
|----------|----------|
| /leaderboards/user-rank no existe | PASO 1: Crear endpoint |
| Otros endpoints Sprint 2 | PASO 4: Manejo graceful |

### Problema 2: WebSocket
| Hallazgo | Solucion |
|----------|----------|
| Auth falla | FUERA DE ALCANCE |
| No emite eventos | FUERA DE ALCANCE |

### Problema 3: Mapeo Tipos
| Hallazgo | Solucion |
|----------|----------|
| snake_case vs camelCase | PASO 2: Crear transformer |
| earnedAt no existe | PASO 2: Mapear desde completed_at |

---

## APROBACION FINAL

**Estado:** PENDIENTE APROBACION

**Notas:**
- WebSocket queda fuera de alcance
- Se priorizan fixes de API
- Sprint 2 endpoints pueden implementarse posteriormente

---

**Creado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
