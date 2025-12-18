# PLAN DE ANALISIS: Integraciones de Gamificacion en Portal Students
## Tech-Leader Analysis Plan - GAMILIT

**Fecha:** 2025-12-14
**Proyecto:** GAMILIT
**Tech-Leader:** Tech-Leader Agent
**Tarea:** Analisis de integraciones de gamificacion en portal Students

---

## 1. OBJETIVO DEL ANALISIS

Realizar un analisis exhaustivo de las integraciones de gamificacion dentro del portal de estudiantes (Students Portal) para verificar:

1. **Sistema de Rangos Maya** - Subida de rango adecuada
2. **Persistencia de Respuestas** - Guardado correcto de respuestas de ejercicios
3. **Avance en Modulos/Ejercicios** - Tracking de progreso correcto
4. **Misiones** - Integracion y funcionamiento
5. **Ranking/Leaderboard** - Visualizacion correcta en portales
6. **Logros** - Otorgamiento y visualizacion

---

## 2. ALCANCE DEL ANALISIS

### 2.1 Flujos a Analizar

| ID | Flujo | Descripcion | Portales Afectados |
|----|-------|-------------|-------------------|
| F-01 | Completar Ejercicio | Estudiante completa ejercicio -> XP -> Rango | Student, Teacher, Admin |
| F-02 | Guardar Respuesta | Respuesta enviada -> BD -> Verificable | Student, Teacher |
| F-03 | Progreso Modulo | Avance ejercicios -> Progreso modulo | Student, Teacher, Admin |
| F-04 | Mision Completada | Cumplir mision -> Recompensa | Student |
| F-05 | Ranking Update | XP cambia -> Leaderboard actualiza | Student, Admin |
| F-06 | Logro Desbloqueado | Condicion cumplida -> Logro otorgado | Student, Teacher, Admin |

### 2.2 Capas a Revisar

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (Student Portal)                                        │
│ - Componentes de gamificacion                                    │
│ - Hooks de estado                                                │
│ - API services                                                   │
│ - Stores (Zustand)                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (NestJS API)                                             │
│ - Controllers de gamificacion                                    │
│ - Services de gamificacion                                       │
│ - Services de progress                                           │
│ - Integracion entre modulos                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                                            │
│ - Tablas de gamification_system                                  │
│ - Tablas de progress_tracking                                    │
│ - Triggers de actualizacion                                      │
│ - Funciones de calculo de rango                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. PLAN DE ANALISIS DETALLADO

### FASE 2.1: Analisis del Sistema de Rangos Maya

**Objetivo:** Verificar que el rango sube correctamente al acumular XP

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Funcion calculo rango | `ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql` | Logica de umbrales XP |
| 2 | Trigger update rango | `ddl/schemas/gamification_system/triggers/` | Disparo automatico |
| 3 | Backend RanksService | `modules/gamification/services/ranks.service.ts` | Metodo checkPromotion() |
| 4 | Frontend RankDisplay | Componentes de rango en dashboard | Actualizacion visual |
| 5 | API endpoint | `/api/gamification/ranks` | Respuesta correcta |

**Seeds/Datos:**
- `gamification_system/03-maya_ranks.sql` - 7 rangos definidos
- Umbrales XP: Aj K'uhun (0) -> Itzamna (max)

---

### FASE 2.2: Analisis de Persistencia de Respuestas

**Objetivo:** Verificar que las respuestas se guardan correctamente

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Submit ejercicio | `progress/services/exercise-attempt.service.ts` | Persistencia en BD |
| 2 | Tabla submissions | `progress_tracking.exercise_submissions` | Estructura datos |
| 3 | Tabla attempts | `progress_tracking.exercise_attempts` | Registro intentos |
| 4 | API endpoint | `POST /api/progress/submissions` | Payload y response |
| 5 | Frontend submit | Componentes de mecanicas | Envio correcto |

**Flujo Esperado:**
```
Student submits answer
    → POST /api/progress/submissions
    → Backend validates
    → INSERT exercise_submissions
    → INSERT exercise_attempts
    → Update user_stats (XP, coins)
    → Return result
```

---

### FASE 2.3: Analisis de Avance en Modulos/Ejercicios

**Objetivo:** Verificar tracking correcto del progreso

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Module progress | `progress_tracking.module_progress` | Actualizacion % |
| 2 | ModulesService | `educational/services/modules.service.ts` | getUserModules() |
| 3 | ProgressService | `progress/services/*.service.ts` | Calculo progreso |
| 4 | Dashboard widget | Frontend dashboard | Visualizacion |
| 5 | Teacher view | Teacher portal | Vista del progreso |

**Integracion Cross-Portal:**
- Student ve su progreso en Dashboard
- Teacher ve progreso de sus estudiantes
- Admin ve estadisticas agregadas

---

### FASE 2.4: Analisis de Misiones

**Objetivo:** Verificar integracion del sistema de misiones

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Missions table | `gamification_system.missions` | Definicion misiones |
| 2 | Scheduled missions | `progress_tracking.scheduled_missions` | Asignacion usuarios |
| 3 | MissionsService | `gamification/services/missions.service.ts` | Logica de negocio |
| 4 | Claim reward | `POST /api/gamification/missions/:id/claim` | Flujo reclamar |
| 5 | Frontend Missions | `MissionsPage.tsx` | UI misiones |
| 6 | Cron tasks | `tasks/services/` | Generacion periodica |

**Tipos de Misiones:**
- Diarias
- Semanales
- Especiales

---

### FASE 2.5: Analisis de Ranking/Leaderboard

**Objetivo:** Verificar visualizacion correcta en todos los portales

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Leaderboard metadata | `gamification_system.leaderboard_metadata` | Configuracion |
| 2 | LeaderboardService | `gamification/services/leaderboard.service.ts` | Queries |
| 3 | API endpoints | `/api/gamification/leaderboard/*` | Global/School/Friends |
| 4 | Frontend store | `leaderboardsStore.ts` | Estado global |
| 5 | Frontend API | `socialAPI.ts` | Llamadas correctas |

**Endpoints Verificados (FE-109):**
- `/gamification/leaderboard/global`
- `/gamification/leaderboard/schools/:schoolId`
- `/gamification/leaderboard/friends/:userId`

---

### FASE 2.6: Analisis de Logros

**Objetivo:** Verificar otorgamiento y visualizacion de logros

**Puntos de Revision:**

| # | Componente | Archivo/Ubicacion | Verificar |
|---|-----------|-------------------|-----------|
| 1 | Achievements table | `gamification_system.achievements` | 30 logros |
| 2 | User achievements | `gamification_system.user_achievements` | Pivot table |
| 3 | AchievementsService | `gamification/services/achievements.service.ts` | detectAndGrantEarned() |
| 4 | Trigger unlock | `fn_on_achievement_unlocked` | ML Coins reward |
| 5 | API endpoint | `/api/gamification/achievements` | Lista de logros |
| 6 | Frontend page | `AchievementsPage.tsx` | UI logros |

**Integracion Documentada (BE-136):**
- `ExerciseAttemptService` llama a `AchievementsService.detectAndGrantEarned()` post-ejercicio

---

## 4. CHECKLIST DE VALIDACION

### 4.1 Database Layer
- [ ] Triggers de actualizacion funcionan
- [ ] Funciones de calculo retornan valores correctos
- [ ] FK constraints intactos
- [ ] Seeds cargados correctamente

### 4.2 Backend Layer
- [ ] Services inyectan dependencias correctas
- [ ] Controllers exponen endpoints necesarios
- [ ] DTOs validan datos correctamente
- [ ] Error handling apropiado

### 4.3 Frontend Layer
- [ ] Hooks obtienen datos correctos
- [ ] Stores actualizan estado
- [ ] Componentes renderizan datos
- [ ] API calls usan endpoints correctos

### 4.4 Cross-Portal Integration
- [ ] Datos visibles en Student portal
- [ ] Datos visibles en Teacher portal
- [ ] Datos visibles en Admin portal
- [ ] Tiempo real vs cache apropiado

---

## 5. ENTREGABLES ESPERADOS

### Fase 2 - Analisis:
- Reporte detallado por cada area (2.1-2.6)
- Identificacion de gaps o bugs
- Matriz de integracion validada

### Fase 3 - Planeacion:
- Plan de correcciones priorizadas (P0, P1, P2)
- Estimacion de impacto por correccion
- Orden de implementacion

### Fase 4 - Validacion de Impacto:
- Matriz de dependencias afectadas
- Analisis de componentes dependientes
- Plan de propagacion de cambios

### Fase 5 - Implementacion:
- Codigo corregido/implementado
- Tests actualizados (si aplica)
- Build verificado

### Fase 6 - Documentacion:
- Inventarios actualizados
- Trazas actualizadas
- Este documento actualizado con resultados

---

## 6. ARCHIVOS CLAVE A REVISAR

### Backend
```
apps/backend/src/modules/gamification/
├── services/
│   ├── achievements.service.ts
│   ├── ranks.service.ts
│   ├── user-stats.service.ts
│   ├── missions.service.ts
│   ├── leaderboard.service.ts
│   └── ml-coins.service.ts
├── controllers/
│   ├── achievements.controller.ts
│   ├── ranks.controller.ts
│   └── leaderboard.controller.ts
└── entities/
    ├── user-stats.entity.ts
    ├── user-rank.entity.ts
    ├── achievement.entity.ts
    └── mission.entity.ts

apps/backend/src/modules/progress/
├── services/
│   ├── exercise-attempt.service.ts  # Punto critico de integracion
│   └── module-progress.service.ts
└── entities/
    ├── exercise-submission.entity.ts
    └── module-progress.entity.ts
```

### Frontend
```
apps/frontend/src/features/gamification/
├── achievements/
├── leaderboard/
├── missions/
├── ranks/
└── stats/

apps/frontend/src/apps/student/pages/
├── DashboardPage.tsx
├── AchievementsPage.tsx
├── LeaderboardPage.tsx
└── MissionsPage.tsx
```

### Database
```
apps/database/ddl/schemas/gamification_system/
├── tables/
│   ├── user_stats.sql
│   ├── user_ranks.sql
│   ├── achievements.sql
│   └── missions.sql
├── functions/
│   ├── calculate_maya_rank_helpers.sql
│   └── award_achievement.sql
└── triggers/
    └── *.sql
```

---

## 7. SIGUIENTE PASO

Proceder con **FASE 2: Ejecutar analisis tecnico** siguiendo este plan, comenzando por el Sistema de Rangos Maya (2.1).

---

**Estado:** FASE 1 COMPLETADA
**Siguiente:** FASE 2 - Analisis Tecnico
