# 02-DISCREPANCIAS.md — Discrepancias Criticas

**Tarea:** TASK-2026-02-18-ANALISIS-MISIONES-LOGROS
**Fecha:** 2026-02-18

---

## Clasificacion de Severidad

| Severidad | Definicion | Count |
|-----------|-----------|-------|
| CRITICA | Bloquea funcionalidad core o causa datos incorrectos | 1 |
| ALTA | Impacta UX significativamente o causa inconsistencias | 3 |
| MEDIA | Deuda tecnica o gap parcial sin impacto inmediato | 6 |
| BAJA | Mejora de calidad, cleanup, o estandarizacion | 5 |

**Total:** 15 discrepancias documentadas

---

## CRITICA (1)

### DISC-001: DB Function check_and_grant_achievements() Incompatible con Seeds

| Campo | Valor |
|-------|-------|
| **Severidad** | CRITICA |
| **Clasificacion** | BUG (codigo legacy no actualizado) |
| **Archivo** | `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql:72-88` |
| **Impacto** | DB function no puede evaluar NINGUNO de los 35 logros seeded |
| **Mitigacion actual** | Backend service evalua correctamente via `meetsConditions()` |
| **Riesgo real** | BAJO — la funcion parece no ser invocada en produccion |

**Detalle:**
```
DB Function CASE:              Seeds condition type:
  'MISSIONS_COMPLETED'    ≠    'exercise_completion'
  'TOTAL_XP'              ≠    'streak'
  'STREAK_DAYS'           ≠    'module_completion'
  'ACHIEVEMENTS_EARNED'   ≠    'perfect_score'
  'EXERCISES_COMPLETED'   ≠    'social'
  'progress'              ≠    'exploration'
```

**Accion requerida:**
- Opcion A (Recomendada): Deprecar formalmente la DB function, documentar que evaluacion es backend-only
- Opcion B: Actualizar los CASE statements para coincidir con los 14 condition types de seeds

---

## ALTA (3)

### DISC-002: Race Condition en Generacion de Misiones

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Clasificacion** | BUG |
| **Archivo** | `apps/backend/src/modules/gamification/services/missions/mission-generator.service.ts` |
| **Impacto** | Requests concurrentes pueden generar misiones duplicadas |
| **Solucion** | Agregar UNIQUE constraint `(user_id, template_id, DATE(end_date))` |
| **Esfuerzo** | 5 minutos (ALTER TABLE) |

**Escenario:**
1. Request A: `findByTypeAndUser()` -> missions.length === 0
2. Request B: `findByTypeAndUser()` -> missions.length === 0 (antes de que A inserte)
3. Request A: INSERT 3 daily missions
4. Request B: INSERT 3 daily missions
5. Resultado: 6 misiones diarias en vez de 3

### DISC-003: Bonus Frontend-Only (Promesa No Cumplida)

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Clasificacion** | GAP |
| **Archivo** | `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts:392-393` |
| **Impacto** | UI muestra +500 XP y +100 ML Coins bonus que nunca se otorgan |
| **Solucion** | Implementar bonus en backend O eliminar del UI |
| **Esfuerzo** | 2-4 horas |

**Detalle:**
- Frontend calcula: daily complete bonus = +500 XP, +100 ML Coins
- Frontend calcula: weekly complete bonus = +2000 XP, +500 ML Coins
- Backend NO implementa ningun bonus por completar todas las misiones
- Usuario ve recompensa prometida que nunca recibe

### DISC-004: Mission template_id TEXT vs UUID (Sin Referential Integrity)

| Campo | Valor |
|-------|-------|
| **Severidad** | ALTA |
| **Clasificacion** | GAP |
| **Archivo** | `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql` |
| **Impacto** | No se puede JOIN missions -> mission_templates; datos de templates inaccesibles para misiones creadas por trigger |
| **Solucion** | Cambiar template_id a UUID + agregar FK + backfill |
| **Esfuerzo** | 2-3 horas (migration) |

**Detalle:**
- Trigger DB usa: `'daily_complete_exercises'::TEXT`
- Templates table usa: `'20000001-0000-0000-0000-000000000001'::uuid`
- 0 rows retornadas en JOIN entre missions y templates para misiones creadas por trigger

---

## MEDIA (6)

### DISC-005: Timezone UTC vs Mexico

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | GAP |
| **Archivo** | `apps/backend/src/modules/tasks/services/missions-cron.service.ts` |
| **Impacto** | Misiones diarias expiran a medianoche UTC (6pm Mexico) en vez de medianoche Mexico |
| **Solucion** | Cambiar timezone del cron a `America/Mexico_City` |
| **Esfuerzo** | 10 minutos |

### DISC-006: Trigger Failures Silenciosas

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | GAP |
| **Archivo** | `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql:206-251` |
| **Impacto** | Si el trigger falla, usuario se registra pero sin gamificacion, sin alerta al admin |
| **Solucion** | Implementar retry job que procese `pending_user_initialization` |
| **Esfuerzo** | 2 horas |

### DISC-007: Sin Cleanup de Misiones Expiradas

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/backend/src/modules/tasks/services/missions-cron.service.ts` (cron placeholder) |
| **Impacto** | Tabla missions crece linealmente (~4 rows/usuario/dia), sin archivado |
| **Solucion** | Implementar archive/cleanup cada 90 dias |
| **Esfuerzo** | 1.5 horas |

### DISC-008: Doble Capa API Achievements en Frontend

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts` + `apps/frontend/src/services/api/gamificationApi.ts` |
| **Impacto** | AchievementsPage hace llamadas API redundantes, codigo confuso |
| **Solucion** | Consolidar en single API layer |
| **Esfuerzo** | 2 horas |

### DISC-009: Reward Field Names Inconsistentes

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | Backend responses multiples |
| **Impacto** | Frontend usa dual-fallback fragil |
| **Solucion** | Estandarizar backend a `{ rewards: { xp, ml_coins } }` siempre |
| **Esfuerzo** | 4 horas |

### DISC-010: Categoria `collection` Sin Logros

| Campo | Valor |
|-------|-------|
| **Severidad** | MEDIA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/database/seeds/dev/gamification_system/01-achievement_categories.sql:39` |
| **Impacto** | Categoria definida pero vacia, economia gamificada incompleta |
| **Solucion** | Crear 3-5 logros de coleccion |
| **Esfuerzo** | 2-3 horas |

---

## BAJA (5)

### DISC-011: Cron Jobs Placeholder (3 y 4)

| Campo | Valor |
|-------|-------|
| **Severidad** | BAJA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/backend/src/modules/tasks/services/missions-cron.service.ts` |
| **Impacto** | 2 cron jobs que solo hacen `logger.log()`, sin funcionalidad |
| **Solucion** | Implementar o eliminar |

### DISC-012: Staging Seed Filename Inconsistente

| Campo | Valor |
|-------|-------|
| **Severidad** | BAJA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/database/seeds/staging/gamification_system/02-achievements.sql` |
| **Impacto** | Staging usa `02-` vs dev/prod `04-` |
| **Solucion** | Renombrar a `04-achievements.sql` |

### DISC-013: MissionsPanel Interface Local Incompatible

| Campo | Valor |
|-------|-------|
| **Severidad** | BAJA |
| **Clasificacion** | GAP |
| **Archivo** | `apps/frontend/src/apps/student/components/dashboard/MissionsPanel.tsx:32-49` |
| **Impacto** | Si se conecta a datos reales, falla por type mismatch |
| **Solucion** | Usar tipo Mission canonico |

### DISC-014: Codigo Deprecated Pendiente de Eliminacion

| Campo | Valor |
|-------|-------|
| **Severidad** | BAJA |
| **Clasificacion** | TECH-DEBT |
| **Archivos** | `missionsStore.ts`, `missionsAPI.ts`, `missionsStore.test.ts` |
| **Impacto** | Confusion para desarrolladores, dead code |
| **Solucion** | Eliminar 3 archivos |
| **Esfuerzo** | 15 minutos |

### DISC-015: Sin Rate Limit en Claim Endpoint

| Campo | Valor |
|-------|-------|
| **Severidad** | BAJA |
| **Clasificacion** | TECH-DEBT |
| **Archivo** | `apps/backend/src/modules/gamification/services/achievements.service.ts` |
| **Impacto** | Spam potencial (pero idempotente, sin dano) |
| **Solucion** | Documentar decision o agregar rate limit defensivo |

---

## Tabla Resumen de Priorizacion

| # | Discrepancia | Sev. | Esfuerzo | Accion |
|---|---|---|---|---|
| DISC-002 | Race condition misiones | ALTA | 5 min | ADD CONSTRAINT (inmediato) |
| DISC-005 | Timezone UTC→Mexico | MEDIA | 10 min | Cambiar timezone cron |
| DISC-014 | Delete deprecated code | BAJA | 15 min | rm 3 archivos |
| DISC-012 | Staging filename | BAJA | 5 min | Renombrar |
| DISC-001 | DB function incompatible | CRIT | 1 hora | Deprecar formalmente |
| DISC-003 | Bonus frontend-only | ALTA | 2-4 hr | Implementar o remover |
| DISC-004 | template_id TEXT→UUID | ALTA | 2-3 hr | Migration |
| DISC-006 | Trigger failures silent | MEDIA | 2 hr | Retry job |
| DISC-007 | Cleanup misiones | MEDIA | 1.5 hr | Archive script |
| DISC-008 | Doble API layer | MEDIA | 2 hr | Consolidar |
| DISC-009 | Reward field names | MEDIA | 4 hr | Estandarizar |
| DISC-010 | Categoria collection | MEDIA | 2-3 hr | Crear logros |
| DISC-011 | Cron placeholders | BAJA | 1 hr | Implementar/eliminar |
| DISC-013 | MissionsPanel types | BAJA | 30 min | Usar tipo canonico |
| DISC-015 | Rate limit claim | BAJA | 30 min | Documentar decision |
