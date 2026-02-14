# DISCREPANCIAS: Frontend Integration Analysis

**Tarea:** TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION
**Fecha:** 2026-02-12
**Version:** 1.0.0

---

## 1. Metricas: Inventario vs Codigo Real

| Metrica | CLAUDE.md (antes) | FRONTEND_INVENTORY (antes) | MASTER_INVENTORY (antes) | Codigo Real | Delta % | Accion |
|---------|-------------------|---------------------------|-------------------------|-------------|---------|--------|
| Componentes | 458 | 458 | 458 | **475** | +3.7% | Corregido → 475 |
| Hooks | 127 | 127 | 127 | **102** | **-19.7%** | Corregido → 102 |
| Paginas | 85 | 85 | 85 | **68** | **-20.0%** | Corregido → 68 |
| Stores Zustand | 32 | 32 | 32 | **14** | **-56.3%** | Corregido → 14 |
| API Services | 48 | 48 | 48 | **52** | +8.3% | Corregido → 52 |
| Mecanicas | 40 | 40 | 40 | **30** | **-25.0%** | Corregido → 30 |
| Routes | 24 | 24 | 24 | **70** | **+191.7%** | Corregido → 70 |
| Type Files | - | 35 | - | **47** | +34.3% | Corregido → 47 |

**Error promedio:** 44.9% — significativamente mayor que el backend (promedio ~15%)

---

## 2. Stores Zustand: Listado Detallado

### Stores que EXISTEN (14):

| # | Store (Inventario v4.10.0) | Archivo Real | Match |
|---|---------------------------|-------------|-------|
| 1 | useAuthStore → authStore | features/auth/store/authStore.ts | RENOMBRADO |
| 2 | useAchievementStore → achievementsStore | features/gamification/social/store/achievementsStore.ts | RENOMBRADO |
| 3 | useLeaderboardStore → leaderboardsStore | features/gamification/social/store/leaderboardsStore.ts | RENOMBRADO |
| 4 | useMissionStore → missionsStore | features/missions/store/missionsStore.ts | RENOMBRADO |
| 5 | useNotificationStore → notificationsStore | features/notifications/store/notificationsStore.ts | RENOMBRADO |
| 6 | useRankStore → ranksStore | features/gamification/ranks/store/ranksStore.ts | RENOMBRADO |
| 7 | - | features/assignments/store/studentAssignmentsStore.ts | NUEVO (no listado) |
| 8 | - | features/gamification/battles/store/battleStore.ts | NUEVO (no listado) |
| 9 | - | features/gamification/economy/store/economyStore.ts | NUEVO (no listado) |
| 10 | - | features/gamification/social/store/friendsStore.ts | NUEVO (no listado) |
| 11 | - | features/gamification/social/store/guildsStore.ts | NUEVO (no listado) |
| 12 | - | features/gamification/social/store/newLeaderboardsStore.ts | NUEVO (no listado) |
| 13 | - | features/gamification/social/store/powerUpsStore.ts | NUEVO (no listado) |
| 14 | - | features/parent/store/parentStore.ts | NUEVO (no listado) |

### Stores que NO EXISTEN (26 fantasma del inventario anterior):

| Store Conceptual | Clasificacion |
|-----------------|---------------|
| useSessionStore | NO EXISTE — session mgmt via AuthContext |
| useUserStore | NO EXISTE — user data via React Query |
| useProfileStore | NO EXISTE — profile via React Query |
| useModuleStore | NO EXISTE — modules via React Query |
| useExerciseStore | NO EXISTE — exercises via React Query |
| useContentStore | NO EXISTE — content via React Query |
| useClassroomStore | NO EXISTE — classrooms via React Query |
| useAssignmentStore | PARCIAL — existe studentAssignmentsStore (no generalizado) |
| useGamificationStore | NO EXISTE — gamification split en achievementsStore + ranksStore + economyStore |
| useXPStore | NO EXISTE — XP via gamification API |
| useStoreItemStore | NO EXISTE — shop via economyStore |
| useInventoryStore | NO EXISTE — inventory via economyStore |
| useStreakStore | NO EXISTE — streaks via ranksStore multipliers |
| useTeamStore | NO EXISTE — teams via React Query |
| useSocialFeedStore | NO EXISTE — social feed via React Query |
| useStudentDashboardStore | NO EXISTE — dashboard via React Query hooks |
| useTeacherDashboardStore | NO EXISTE — dashboard via React Query hooks |
| useAdminDashboardStore | NO EXISTE — dashboard via React Query hooks |
| useParentDashboardStore | NO EXISTE — parentStore cubre esto parcialmente |
| useAnalyticsStore | NO EXISTE — analytics via React Query |
| useReportStore | NO EXISTE — reports via React Query |
| useSettingsStore | NO EXISTE — settings via React Query |
| useThemeStore | NO EXISTE — tema via BrandingProvider (Context) |
| useNavigationStore | NO EXISTE — navegacion via React Router |
| useModalStore | NO EXISTE — modales via estado local de componentes |
| useToastStore | NO EXISTE — toasts via react-hot-toast |

**Conclusion:** El patron real del proyecto es **React Query para server state + Zustand solo para client state puro**. Los 26 stores conceptuales representan server state que se maneja via TanStack Query hooks, no Zustand stores.

---

## 3. Portales: Paginas por Portal

| Portal | INVENTORY v4.10.0 | Real | Delta | Causa |
|--------|-------------------|------|-------|-------|
| Estudiante | 35 | **19** | -16 | Incluia sub-views y tabs como paginas separadas |
| Maestro | 19 | **19** | 0 | Correcto |
| Administrador | 18 | **18** | 0 | Correcto |
| Padres | 13 | **4** | -9 | Incluia paginas conceptuales no implementadas |
| **Total** | 85 | **68** | -17 | 8 paginas adicionales fuera de portales (auth, features) |

### Componentes por Portal

| Portal | INVENTORY v4.10.0 | Real (.tsx) | Delta |
|--------|-------------------|-------------|-------|
| Estudiante | 180 | **63** | -117 |
| Maestro | 120 | **68** | -52 |
| Administrador | 100 | **93** | -7 |
| Padres | 58 | **4** | -54 |
| **Total portal** | 458 | **228** | -230 |

**Nota:** Los componentes del inventario anterior probablemente incluian features/ y shared/ components asignados conceptualmente a cada portal. Los 228 son solo archivos fisicos en apps/{portal}/.

---

## 4. Cobertura Frontend ↔ Backend API

### Por Modulo Backend

| Backend Module | Endpoints | Frontend Calls | Cobertura | Madurez |
|---------------|-----------|----------------|-----------|---------|
| auth | 29 | ~24 | **~85%** | Alta |
| admin | 158 | ~95 | ~60% | Buena (gaps en roles/permissions) |
| teacher | 110 | ~95 | **~85%** | Alta (14 sub-API files) |
| content | 102 | ~24 | ~25% | Baja |
| social | 135 | ~60 | ~45% | Media |
| gamification | 69 | ~35 | ~50% | Media |
| progress | 59 | ~33 | ~55% | Media |
| educational | 51 | ~18 | ~35% | Baja |
| notifications | 46 | ~14 | ~30% | Baja |
| lti | 42 | ~28 | ~65% | Buena |
| assignments | 19 | ~14 | ~75% | Buena |
| parents | 17 | ~17 | **~100%** | Completa |
| visualization | 21 | 0 | 0% | Backend-only (esperado) |
| ml | 21 | 0 | 0% | Backend-only (esperado) |
| etl | 16 | 0 | 0% | Backend-only (esperado) |
| profile | 3 | ~3 | **~100%** | Completa |
| health | 1 | ~1 | **~100%** | Completa |

### API Services Duplicados (6 pares)

| Dominio | Archivo 1 | Archivo 2 | Riesgo |
|---------|-----------|-----------|--------|
| LTI | services/api/ltiAPI.ts (16 calls) | lib/api/lti.api.ts (12 calls) | Implementaciones divergentes |
| Achievements | lib/api/gamification.api.ts | features/gamification/social/api/socialAPI.ts | Calls solapados |
| Progress | services/api/progressAPI.ts (20 calls) | lib/api/progress.api.ts (13 calls) | Endpoints duplicados |
| Manual Reviews | services/api/teacher/manualReviewApi.ts | shared/api/manualReviewApi.ts | Dos entry points |
| Content | services/api/contentAPI.ts (17 calls) | features/content/api/contentAPI.ts (7 calls) | Patrones diferentes |
| Auth | lib/api/auth.api.ts (5 calls) | features/auth/api/authAPI.ts (13 calls) | Feature copy agrega sessions |

---

## 5. Hooks por Directorio: Inventario vs Real

| Categoria (INVENTORY) | Conteo INVENTORY | Directorio Real | Conteo Real |
|-----------------------|-----------------|----------------|-------------|
| auth: 8 | 8 | features/auth/hooks | 5 |
| exercises: 15 | 15 | features/exercises/hooks | 2 |
| gamification: 20 | 20 | features/gamification/*/hooks (total) | 18 |
| leaderboard: 8 | 8 | (incluido en gamification social) | 0 (fusionado) |
| missions: 6 | 6 | features/gamification/missions/hooks | 1 |
| store: 8 | 8 | (no existe como categoria separada) | 0 |
| classrooms: 10 | 10 | (incluido en teacher/admin hooks) | 0 (fusionado) |
| students: 8 | 8 | apps/student/hooks | 10 |
| teachers: 10 | 10 | apps/teacher/hooks | 24 |
| parents: 6 | 6 | (no existe directorio) | 0 |
| analytics: 8 | 8 | (incluido en admin hooks) | 0 (fusionado) |
| notifications: 6 | 6 | features/notifications/hooks | 2 |
| content: 8 | 8 | (no existe directorio) | 0 |
| ui_utility: 16 | 16 | shared/hooks + hooks/ root | 14 |
| **Total** | **127** | **Todos** | **102** |

**Conclusion:** Las categorias del inventario NO mapean a directorios reales. El inventario usaba categorias conceptuales mientras los hooks estan organizados por feature/portal.

---

## 6. Mecanicas de Ejercicio: Desglose

| Categoria (INVENTORY) | Conteo INVENTORY | Realidad |
|-----------------------|-----------------|----------|
| xp_display: 5 | 5 | NO es mecanica de ejercicio — es UI component |
| rank_progression: 4 | 4 | NO es mecanica de ejercicio — es UI component |
| achievement_unlock: 5 | 5 | NO es mecanica de ejercicio — es UI component |
| leaderboard_realtime: 4 | 4 | NO es mecanica de ejercicio — es UI component |
| mission_tracker: 4 | 4 | NO es mecanica de ejercicio — es UI component |
| store_ui: 4 | 4 | NO es mecanica de ejercicio — es UI component |
| streak_indicator: 3 | 3 | NO es mecanica de ejercicio — es UI component |
| exercise_interactives: 8 | 8 | SI, pero real = 30 mecanicas unicas |
| social_elements: 3 | 3 | NO es mecanica de ejercicio — es UI component |

**Mecanicas reales (30):**
- Modulo 1 Comprension Literal: 7 (Crucigrama, SopaLetras, Timeline, etc.)
- Modulo 2 Comprension Inferencial: 6 (LecturaInferencial, CausaEfecto, etc.)
- Modulo 3 Comprension Critica: 5 (TribunalOpiniones, QuizTikTok, etc.)
- Modulo 4 Literacidad Digital: 5 (InfografiaInteractiva, VerificadorFakeNews, etc.)
- Modulo 5 Creacion y Expresion: 3 (DiarioMultimedia, ComicDigital, VideoCarta)
- Auxiliar (cross-module): 4

---

*Generado por: Claude Code - TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION*
