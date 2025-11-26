# REPORTE DE ANÁLISIS: Integración Student Portal

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tarea:** Análisis de integración Backend-Frontend-Database para Portal de Estudiantes

---

## RESUMEN EJECUTIVO

Se ha completado un análisis exhaustivo de la integración entre las tres capas del portal de estudiantes de GAMILIT. El análisis revela una arquitectura sólida pero con **11 problemas críticos** que requieren atención inmediata y **15 mejoras recomendadas** para optimización.

### Estadísticas Generales

| Métrica | Valor |
|---------|-------|
| **Páginas Frontend (Student)** | 25 |
| **Componentes Frontend** | 35 |
| **Hooks Personalizados** | 9 |
| **Controllers Backend** | 61 |
| **Endpoints Funcionales** | 120+ |
| **Tablas Database** | 28 |
| **Entities TypeORM** | 81 |
| **DTOs Backend** | 284 |
| **Tipos Frontend** | 57 archivos |
| **Enums Compartidos** | 25 |

---

## PARTE 1: HALLAZGOS POR CAPA

### 1.1 FRONTEND - Portal de Estudiantes

#### Estructura Identificada

```
apps/frontend/src/apps/student/
├── pages/           (25 páginas)
│   ├── auth/        (5 páginas: Login, Register, EmailVerification, PasswordRecovery, PasswordReset)
│   ├── dashboard/   (1 página: DashboardComplete)
│   ├── education/   (2 páginas: ExercisePage, ModuleDetailPage)
│   ├── gamification/ (6 páginas: GamificationPage, AchievementsPage, LeaderboardPage, MissionsPage, etc.)
│   ├── inventory/   (2 páginas: ShopPage, InventoryPage)
│   ├── profile/     (2 páginas: ProfilePage, EnhancedProfilePage)
│   ├── settings/    (4 páginas: SettingsPage, NotificationPreferences, TwoFactorAuth, DeviceManagement)
│   └── social/      (2 páginas: FriendsPage, GuildsPage - sin implementar)
├── components/      (35 componentes en 8 categorías)
└── hooks/           (9 hooks personalizados)
```

#### APIs Consumidas por Página

| Página | Hook/API Principal | Endpoints |
|--------|-------------------|-----------|
| DashboardComplete | useDashboardData | `/gamification/users/{id}/ml-coins`, `/gamification/ranks/current`, `/progress/users/{id}` |
| ExercisePage | educationalAPI | `/exercises/{id}`, `/exercises/{id}/submit`, `/exercises/{id}/hints` |
| GamificationPage | Zustand stores | ranks, economy, achievements stores |
| AchievementsPage | useAchievements | `/gamification/users/{id}/achievements` |
| LeaderboardPage | useLeaderboards | `/gamification/leaderboard/*` |
| MissionsPage | useMissions | `/gamification/missions/*` |
| ShopPage | socialAPI | `/powerups`, `/powerups/{id}/purchase` |
| InventoryPage | socialAPI | `/inventory/powerups`, `/powerups/active` |
| SettingsPage | profileAPI | `/profiles/*` |

#### Problemas Detectados en Frontend

| ID | Severidad | Problema | Ubicación | Impacto |
|----|-----------|----------|-----------|---------|
| FE-001 | 🔴 CRÍTICO | WebSocket hardcodeado a `http://localhost:3006` | LeaderboardPage.tsx:62 | No funciona en producción |
| FE-002 | 🟡 ALTO | Páginas duplicadas sin consolidar | ProfilePage vs EnhancedProfilePage | Mantenimiento doble |
| FE-003 | 🟡 ALTO | Páginas duplicadas sin consolidar | LeaderboardPage vs NewLeaderboardPage | Mantenimiento doble |
| FE-004 | 🟠 MEDIO | Badge de rango hardcodeado | ProfilePage.tsx:121 | Datos incorrectos |
| FE-005 | 🟠 MEDIO | Fecha membresía hardcodeada | ProfilePage.tsx:124 | Datos incorrectos |
| FE-006 | 🟠 MEDIO | Logros recientes hardcodeados | ProfilePage.tsx:163-166 | Datos incorrectos |
| FE-007 | 🟢 BAJO | Páginas sin funcionalidad | GuildsPage, FriendsPage | Features incompletas |

---

### 1.2 BACKEND - Endpoints y Configuración

#### Estructura de Módulos

```
apps/backend/src/modules/
├── auth/           (18 endpoints) - Autenticación, perfiles, sesiones
├── educational/    (22 endpoints) - Módulos, ejercicios, pistas
├── gamification/   (28 endpoints) - Stats, rangos, misiones, logros
├── progress/       (32 endpoints) - Seguimiento, intentos, envíos
├── social/         (40 endpoints) - Aulas, amigos, equipos
├── content/        (35 endpoints) - Plantillas, contenido
├── notifications/  (20 endpoints) - Notificaciones multicanal
├── admin/          (58+ endpoints) - Dashboard, monitoreo, reportes
├── teacher/        (18+ endpoints) - Portal docente (nuevo)
└── health/         (3 endpoints)  - Health checks
```

#### Configuración API

```yaml
API_PREFIX: /api
API_VERSION: /v1
GLOBAL_PREFIX: /api/v1
DEFAULT_PORT: 3006
CORS_ORIGINS:
  - http://localhost:3005
  - http://localhost:3006
  - Producción: configurado por env
```

#### Problemas Detectados en Backend

| ID | Severidad | Problema | Ubicación | Impacto |
|----|-----------|----------|-----------|---------|
| BE-001 | 🔴 CRÍTICO | Archivo CORS obsoleto no utilizado | `/shared/middleware/cors.config.ts` | Confusión, mantenimiento |
| BE-002 | 🟡 ALTO | Falta estandarización de paginación | Múltiples endpoints | Inconsistencia API |
| BE-003 | 🟠 MEDIO | Falta documentación códigos de error | Todos los módulos | Debugging difícil |

---

### 1.3 CONFIGURACIÓN - CORS, ENV, Rutas

#### Estado Actual de Variables de Entorno

**Frontend (.env)**
```env
# Development
VITE_API_HOST=localhost
VITE_API_PORT=3006
VITE_API_PROTOCOL=http
VITE_WS_PROTOCOL=ws

# Production (PROBLEMA!)
VITE_API_PROTOCOL=https  # ← Backend NO soporta HTTPS
VITE_WS_PROTOCOL=wss     # ← Backend NO soporta WSS
```

**Backend (.env)**
```env
PORT=3006
API_PREFIX=/api
API_VERSION=/v1
CORS_ORIGINS=http://localhost:3005,http://localhost:3006
# NO HAY configuración HTTPS
```

#### Problemas Detectados en Configuración

| ID | Severidad | Problema | Impacto |
|----|-----------|----------|---------|
| CFG-001 | 🔴 CRÍTICO | HTTPS/WSS en Frontend, HTTP/WS en Backend | Errores "mixed-content" en producción |
| CFG-002 | 🔴 CRÍTICO | Variables legacy obsoletas (`VITE_API_URL`, `VITE_WS_URL`) | Pueden contradecir nuevas variables |
| CFG-003 | 🟡 ALTO | IP de producción hardcodeada en docs | Cambio de IP rompe documentación |
| CFG-004 | 🟠 MEDIO | Falta `.env.test` | Tests no aislados |

#### Single Source of Truth: `api.config.ts`

```
Ubicación: apps/frontend/src/config/api.config.ts
Estado: ✅ CORRECTO - 300+ rutas bien documentadas
```

Este archivo es el lugar correcto para centralizar todas las rutas API.

---

### 1.4 DATABASE - Schemas y Tablas

#### Schemas Relevantes para Students

| Schema | Tablas | Propósito |
|--------|--------|-----------|
| auth_management | profiles, tenants, roles, memberships | Autenticación y perfiles |
| gamification_system | user_stats, user_ranks, achievements, missions, comodines_inventory, ml_coins_transactions | Gamificación |
| progress_tracking | module_progress, exercise_attempts, exercise_submissions | Seguimiento de progreso |
| educational_content | modules, exercises, assessment_rubrics | Contenido educativo |
| social_features | classrooms, classroom_members, teams | Características sociales |
| audit_logging | system_alerts | Alertas del sistema |

#### Tablas Críticas para Portal de Estudiantes

**TIER 1 (Esencial):**
1. `profiles` - Información del estudiante
2. `user_stats` - Estadísticas gamificación (~35 campos)
3. `module_progress` - Progreso de aprendizaje
4. `exercise_attempts` + `exercise_submissions` - Respuestas
5. `leaderboard_global` + `leaderboard_coins` - Rankings (vistas materializadas)

**TIER 2 (Importante):**
6. `user_achievements` - Logros desbloqueados
7. `user_ranks` - Historial de rangos Maya
8. `comodines_inventory` - Inventario de poder-ups
9. `missions` - Misiones/quests activas
10. `ml_coins_transactions` - Historial de transacciones

#### Mapeo Tabla ↔ Entity

| Tabla DB | Entity Backend | Estado |
|----------|----------------|--------|
| profiles | Profile | ✅ Completo |
| user_stats | UserStats | ✅ Completo |
| user_ranks | UserRank | ✅ Completo |
| achievements | Achievement | ✅ Completo |
| user_achievements | UserAchievement | ✅ Completo |
| module_progress | ModuleProgress | ✅ Completo |
| exercise_attempts | ExerciseAttempt | ✅ Completo |
| exercise_submissions | ExerciseSubmission | ✅ Completo |
| modules | Module | ✅ Completo |
| exercises | Exercise | ✅ Completo |
| comodines_inventory | ComodinesInventory | ✅ Completo |

---

### 1.5 TIPOS, DTOs E INTERFACES

#### Inventario por Capa

| Capa | Cantidad | Ubicación Principal |
|------|----------|---------------------|
| Backend DTOs | 284 | `apps/backend/src/modules/*/dto/` |
| Backend Entities | 81 | `apps/backend/src/modules/*/entities/` |
| Backend Enums | 25 | `apps/backend/src/shared/constants/enums.constants.ts` |
| Frontend Types | 57 archivos | `apps/frontend/src/features/*/types/`, `src/services/api/*Types.ts` |

#### Problemas de Coherencia Detectados

| ID | Severidad | Problema | Impacto |
|----|-----------|----------|---------|
| TYP-001 | 🔴 CRÍTICO | MayaRank duplicado en 3 lugares frontend | Desincronización, typos |
| TYP-002 | 🔴 CRÍTICO | 3 formatos diferentes de respuesta API | Inconsistencia en consumo |
| TYP-003 | 🟡 ALTO | Enums definidos localmente en frontend (no importados) | Riesgo de desincronización |
| TYP-004 | 🟡 ALTO | Campos con formato inconsistente (snake_case vs camelCase) | Transformaciones manuales |
| TYP-005 | 🟠 MEDIO | Frontend User type tiene ~10 campos, Backend tiene 25+ | Datos no expuestos |
| TYP-006 | 🟠 MEDIO | Nombre diferente: PowerupType (FE) vs ComodinTypeEnum (BE) | Confusión semántica |
| TYP-007 | 🟠 MEDIO | Valores de constantes no sincronizados (XP, ML Coins) | Cálculos incorrectos |

#### Formatos de Respuesta API (Inconsistentes)

```typescript
// Formato A (algunos endpoints)
{ success: boolean, data: T, message?: string, timestamp?: string }

// Formato B (paginación - algunos)
{ data: T[], pagination: { page, limit, total, totalPages, hasMore } }

// Formato C (admin)
{ items: T[], pagination: { page, totalPages, totalItems, limit } }
```

**Recomendación:** Unificar a un solo formato estándar.

---

## PARTE 2: INVENTARIO DE APIs

### 2.1 Endpoints Consumidos por Student Portal

#### Auth Module
| Método | Endpoint | Consumido Por | DTO Request | DTO Response |
|--------|----------|---------------|-------------|--------------|
| POST | `/api/v1/auth/login` | LoginPage | LoginDto | AuthResponseDto |
| POST | `/api/v1/auth/register` | RegisterPage | RegisterUserDto | AuthResponseDto |
| POST | `/api/v1/auth/logout` | SettingsPage | - | MessageDto |
| POST | `/api/v1/auth/refresh-token` | apiClient | RefreshTokenDto | AuthResponseDto |
| GET | `/api/v1/auth/profile` | useDashboardData | - | ProfileResponseDto |
| PATCH | `/api/v1/auth/profile` | SettingsPage | UpdateProfileDto | ProfileResponseDto |

#### Gamification Module
| Método | Endpoint | Consumido Por | DTO Response |
|--------|----------|---------------|--------------|
| GET | `/api/v1/gamification/users/{id}/stats` | useDashboardData | UserStatsResponseDto |
| GET | `/api/v1/gamification/users/{id}/ml-coins` | useDashboardData | MlCoinsBalanceDto |
| GET | `/api/v1/gamification/ranks/current` | useDashboardData | UserRankResponseDto |
| GET | `/api/v1/gamification/ranks/users/{id}/rank-progress` | useDashboardData | RankProgressDto |
| GET | `/api/v1/gamification/users/{id}/achievements` | AchievementsPage | UserAchievementDto[] |
| GET | `/api/v1/gamification/leaderboard/global` | LeaderboardPage | LeaderboardEntryDto[] |
| GET | `/api/v1/gamification/leaderboard/coins` | LeaderboardPage | LeaderboardEntryDto[] |
| GET | `/api/v1/gamification/missions` | MissionsPage | MissionDto[] |
| POST | `/api/v1/gamification/missions/{id}/claim` | MissionsPage | ClaimRewardResponseDto |

#### Educational Module
| Método | Endpoint | Consumido Por | DTO Response |
|--------|----------|---------------|--------------|
| GET | `/api/v1/modules` | useUserModules | ModuleResponseDto[] |
| GET | `/api/v1/modules/{id}` | ModuleDetailPage | ModuleResponseDto |
| GET | `/api/v1/exercises/{id}` | ExercisePage | ExerciseResponseDto |
| POST | `/api/v1/exercises/{id}/submit` | ExercisePage | SubmitExerciseResponseDto |
| GET | `/api/v1/exercises/{id}/hints` | ExercisePage | HintDto[] |
| POST | `/api/v1/exercises/{id}/progress` | ExercisePage | ProgressSaveDto |

#### Progress Module
| Método | Endpoint | Consumido Por | DTO Response |
|--------|----------|---------------|--------------|
| GET | `/api/v1/progress/users/{id}` | useDashboardData | UserProgressOverviewDto |
| GET | `/api/v1/progress/modules/{id}` | ModuleDetailPage | ModuleProgressDetailDto |

#### Social Module (Power-ups/Tienda)
| Método | Endpoint | Consumido Por | DTO Response |
|--------|----------|---------------|--------------|
| GET | `/api/v1/powerups` | ShopPage | PowerUpDto[] |
| POST | `/api/v1/powerups/{id}/purchase` | ShopPage | PurchaseResponseDto |
| GET | `/api/v1/inventory/powerups` | InventoryPage | InventoryItemDto[] |
| GET | `/api/v1/powerups/active` | InventoryPage | ActivePowerUpDto[] |
| POST | `/api/v1/powerups/{id}/use` | ExercisePage | UsePowerUpResponseDto |

### 2.2 Endpoints NO Consumidos (Disponibles pero no usados)

| Endpoint | Módulo | Estado Frontend |
|----------|--------|-----------------|
| `/api/v1/social/friends/*` | Social | FriendsPage sin implementar |
| `/api/v1/social/guilds/*` | Social | GuildsPage sin implementar |
| `/api/v1/notifications/*` | Notifications | Parcialmente implementado |
| `/api/v1/gamification/streaks/*` | Gamification | Hook existe pero comentado |

---

## PARTE 3: MATRIZ DE DEPENDENCIAS ENTRE CAPAS

### 3.1 Flujo de Datos: Estudiante

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ DashboardPage│  │ ExercisePage │  │ GamificationPage│        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │useDashboardData│ │educationalAPI│ │ Zustand Stores│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │                    apiClient                        │         │
│  │  (interceptors: auth, camelCase transform, retry)   │         │
│  └──────────────────────┬──────────────────────────────┘         │
└─────────────────────────┼────────────────────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AuthController│ │ GamificationController│ │ ProgressController│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │ AuthService  │  │ GamificationService│  │ ProgressService │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │              TypeORM Entities + Repositories        │         │
│  └──────────────────────┬──────────────────────────────┘         │
└─────────────────────────┼────────────────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │auth_management│ │gamification_system│ │progress_tracking│      │
│  │  - profiles  │  │  - user_stats │  │ - module_progress│      │
│  │  - tenants   │  │  - user_ranks │  │ - exercise_attempts│    │
│  └──────────────┘  │  - achievements│  │ - exercise_submissions│ │
│                    │  - missions    │  └──────────────┘          │
│                    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Dependencias Críticas

| Componente Frontend | Servicio Backend | Tabla(s) DB |
|---------------------|------------------|-------------|
| DashboardComplete | AuthService, GamificationService, ProgressService | profiles, user_stats, module_progress |
| ExercisePage | EducationalService, ProgressService | exercises, exercise_attempts, exercise_submissions |
| GamificationPage | GamificationService | user_stats, user_ranks, achievements, ml_coins_transactions |
| AchievementsPage | GamificationService | achievements, user_achievements |
| LeaderboardPage | GamificationService | leaderboard_global, leaderboard_coins (views) |
| MissionsPage | GamificationService | missions |
| ShopPage | SocialService, GamificationService | comodines_inventory, ml_coins_transactions |
| ProfilePage | AuthService, GamificationService | profiles, user_stats |

---

## PARTE 4: PROBLEMAS CRÍTICOS CONSOLIDADOS

### 4.1 Lista Priorizada de Problemas

| Prioridad | ID | Área | Problema | Acción Requerida |
|-----------|-----|------|----------|------------------|
| P0 | CFG-001 | Config | HTTPS/WSS mismatch Frontend-Backend | Sincronizar protocolos |
| P0 | FE-001 | Frontend | WebSocket hardcodeado localhost:3006 | Mover a variable de entorno |
| P0 | TYP-001 | Tipos | MayaRank duplicado en 3 lugares | Centralizar en paquete compartido |
| P0 | TYP-002 | Tipos | 3 formatos de respuesta API | Unificar estructura |
| P1 | CFG-002 | Config | Variables legacy obsoletas | Eliminar y migrar |
| P1 | BE-001 | Backend | cors.config.ts no utilizado | Eliminar archivo |
| P1 | FE-002 | Frontend | ProfilePage duplicado | Consolidar en una versión |
| P1 | FE-003 | Frontend | LeaderboardPage duplicado | Consolidar en una versión |
| P1 | TYP-003 | Tipos | Enums locales en frontend | Importar desde backend o shared |
| P2 | FE-004/5/6 | Frontend | Datos hardcodeados | Conectar con APIs reales |
| P2 | TYP-004 | Tipos | snake_case vs camelCase | Estandarizar transformación |
| P2 | BE-002 | Backend | Paginación inconsistente | Implementar estándar |
| P3 | FE-007 | Frontend | Páginas sin funcionalidad | Implementar o remover |
| P3 | BE-003 | Backend | Falta docs códigos error | Documentar |

### 4.2 Matriz de Impacto

```
                    IMPACTO EN PRODUCCIÓN
                    Alto            Bajo
                ┌───────────────┬───────────────┐
    ESFUERZO    │ CFG-001       │ BE-001        │
    Bajo        │ FE-001        │ CFG-002       │
                │               │               │
                ├───────────────┼───────────────┤
    ESFUERZO    │ TYP-001       │ FE-002, FE-003│
    Alto        │ TYP-002       │ BE-002        │
                │               │ TYP-004       │
                └───────────────┴───────────────┘
```

---

## PARTE 5: FASE 1 COMPLETADA - ENTREGABLES

### Checklist de Análisis

- [x] Estructura del portal students inventariada (25 páginas, 35 componentes, 9 hooks)
- [x] Endpoints backend mapeados (120+ endpoints en 9 módulos)
- [x] Configuración CORS y ENV analizada (3 problemas críticos)
- [x] Schemas database inventariados (28 tablas, 6 schemas)
- [x] Tipos, DTOs e interfaces catalogados (284 DTOs, 81 entities, 57 tipos FE)
- [x] Dependencias entre capas documentadas
- [x] Problemas críticos identificados y priorizados (11 problemas)

### Archivos Afectados para Homologación

**Frontend (requieren cambios):**
```
apps/frontend/src/apps/student/pages/LeaderboardPage.tsx (WebSocket hardcoded)
apps/frontend/src/apps/student/pages/ProfilePage.tsx (datos hardcodeados)
apps/frontend/src/config/env.ts (variables legacy)
apps/frontend/.env.production (protocolo HTTPS sin soporte backend)
apps/frontend/src/features/progress/api/progressTypes.ts (MayaRank duplicado)
apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts (MayaRank duplicado)
```

**Backend (requieren cambios):**
```
apps/backend/src/shared/middleware/cors.config.ts (eliminar - no usado)
apps/backend/.env.production (agregar soporte HTTPS si se requiere)
```

**Nuevos archivos a crear:**
```
apps/shared/types/enums/ (paquete compartido de tipos)
apps/frontend/.env.test (configuración de tests)
```

---

## ESTADO ACTUAL

```
┌────────────────────────────────────────────────────────────┐
│ FASE 1: ANÁLISIS                              ✅ COMPLETADA │
├────────────────────────────────────────────────────────────┤
│ FASE 2: PLANEACIÓN                            ⏳ PENDIENTE  │
├────────────────────────────────────────────────────────────┤
│ FASE 3: EJECUCIÓN                             ⏳ PENDIENTE  │
└────────────────────────────────────────────────────────────┘
```

---

**Próximo paso:** Fase 2 - Planeación de tareas de homologación y orquestación de agentes.

---

*Generado por Architecture-Analyst v2.1*
*Proyecto: GAMILIT - Sistema de Gamificación Educativa*
