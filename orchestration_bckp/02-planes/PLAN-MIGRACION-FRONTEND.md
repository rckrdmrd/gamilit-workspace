# PLAN DE MIGRACIÓN FRONTEND - GAMILIT

**Fecha de Creación:** 2025-11-02
**Agente Responsable:** NEXUS-FRONTEND
**Estado:** PENDIENTE DE APROBACIÓN
**Prioridad:** CRÍTICA

---

## RESUMEN EJECUTIVO

### Objetivo
Migrar completamente el frontend desde `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web` hacia `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend` para lograr paridad funcional total.

### Alcance
- **Total de archivos a migrar:** ~497 archivos
- **Tiempo estimado:** 13-19 semanas (sin cambios)
- **Esfuerzo:** Alto
- **Complejidad:** Alta
- **Riesgo:** Medio

### Estado Actual (Actualizado 2025-11-02 17:30)
- **Migración actual:** 10-15%
- **Coherencia Frontend-Backend-Database:** **82%** ✅ (antes 69%)
  - **Enums:** 100% ✅ (Backend homologado con Database)
  - **Tipos:** 70% ⚠️
  - **API Routes:** 77.4% ⚠️
- **Funcionalidad disponible:** Autenticación básica + estructura
- **Bloqueadores REALES (actualizados):**
  - ~~Frontend: MayaRank incompatible~~ ✅ RESUELTO
  - Frontend: ~70 campos faltantes en tipos (Profile, ModuleProgress, etc.)
  - Backend: 3 endpoints BLOQUEANTES sin implementar (exercise submit, leaderboards, search)
  - ~~Database: 7 enums con valores faltantes~~ ✅ RESUELTO

### Hallazgos de Coherencia (2025-11-02) - ACTUALIZADO

**Documentos de referencia:**
- `orchestration/05-validaciones/2025-11-02-COHERENCIA-ACTUALIZACION.md` ⭐ ACTUALIZADO
- `orchestration/05-validaciones/2025-11-02-COHERENCIA-INTEGRACION-3-CAPAS.md` (DESACTUALIZADO)
- `orchestration/05-validaciones/2025-11-02-VALIDACION-MIGRACION-FRONTEND.md`

**✅ Estado VERIFICADO (2025-11-02 17:30):**
- **Backend YA homologado con Database** ✅
- **Frontend y Backend tienen enums IDÉNTICOS** ✅
- Archivos `enums.constants.ts` sincronizados 100% ✅

**Métricas de coherencia ACTUALIZADAS:**
- Constantes/Enums: **100%** ✅ (antes 68-78%)
- Tipos TypeScript: **70%** ⚠️ (antes 62%)
- Rutas API: **77.4%** ⚠️
- **Coherencia general: 82%** ✅ (antes 69%)

**Bloqueadores REALES (actualizados):**
1. ~~MayaRank enum incompatible~~ ✅ YA RESUELTO - Backend corregido
2. 🚨 POST `/exercises/:id/submit` - Endpoint Backend faltante (bloqueante)
3. 🚨 Endpoints de leaderboard - 3 endpoints Backend faltantes (bloqueante)
4. ⚠️ ~70 campos faltantes en tipos Frontend (Profile, ModuleProgress, etc.)

**Acción:** Fase 0 simplificada - Solo completar tipos TypeScript (NO enums).

---

## FASES DEL PLAN

### FASE 0: PREPARACIÓN Y TIPOS CRÍTICOS (Semana 1)
**Objetivo:** Establecer base sólida y completar tipos TypeScript faltantes
**Esfuerzo:** 48.5 horas (40h configuración + 8.5h tipos)
**Prioridad:** 🚨 CRÍTICA

**✅ ACTUALIZADO (2025-11-02 17:30):** Enums YA sincronizados - Backend homologado con Database

**Cambios vs versión anterior:**
- ~~Sincronización MayaRank~~ ✅ YA RESUELTO - Backend corregido
- ~~Importar enums desde shared~~ ✅ YA SINCRONIZADOS - Frontend=Backend
- Mantener: Completar tipos TypeScript faltantes (Profile, ModuleProgress, etc.)

#### Tareas de Tipos TypeScript - CRÍTICO (8.5 horas)

##### 0.0 Crear Tipos Profile y UserAchievement - 🚨 CRÍTICO
**Problema:** Frontend solo tiene tipo `User`, faltan 37 campos de perfil
**Impacto:** Datos de perfil, gamificación y progreso inaccesibles
**Estimación:** 3 horas

- [ ] Crear `apps/frontend/src/types/profile.types.ts`:
  ```typescript
  import { MayaRank, UserRole } from '@shared/constants/enums.constants';

  export interface Profile {
    // Campos básicos (heredados de User)
    id: string;
    user_id: string;

    // Académicos (4 campos)
    school_id?: string;
    classroom_id?: string;
    grade_level?: number;
    section?: string;

    // Gamificación (7 campos)
    current_rank: MayaRank;
    total_xp: number;
    coins_balance: number;
    gems_balance: number;
    rank_progress_percentage: number;
    next_rank?: MayaRank;
    xp_to_next_rank: number;

    // Progreso académico (5 campos)
    modules_completed: number;
    exercises_completed: number;
    achievements_count: number;
    total_study_time: number; // minutos
    streak_days: number;

    // Estadísticas (2 campos)
    average_score: number;
    highest_score: number;

    // Social (2 campos)
    friends_count: number;
    teams_count: number;

    // Personalización (6 campos)
    theme_preference: 'light' | 'dark' | 'detective';
    language: string;
    timezone: string;
    notification_settings: NotificationSettings;
    avatar_url?: string;
    bio?: string;

    // Privacidad (3 campos)
    show_profile: boolean;
    show_progress: boolean;
    show_achievements: boolean;

    // Metadata (5 campos)
    onboarding_completed: boolean;
    tutorial_completed: boolean;
    last_activity: Date;
    created_at: Date;
    updated_at: Date;
  }

  export interface NotificationSettings {
    email_notifications: boolean;
    push_notifications: boolean;
    achievement_notifications: boolean;
    social_notifications: boolean;
    reminder_notifications: boolean;
  }
  ```

- [ ] Crear `apps/frontend/src/types/achievement.types.ts`:
  ```typescript
  export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    achievement: Achievement; // relación
    unlocked_at: Date;
    progress: number; // % hacia logro (0-100)
    progress_data?: any;
    notified: boolean;
  }
  ```

- [ ] Actualizar imports en componentes existentes

##### 0.1 Extender ModuleProgress - 🚨 CRÍTICO
**Problema:** Frontend solo tiene 8/31 campos (26% de datos)
**Impacto:** Dashboard incompleto, gamificación no funcional
**Estimación:** 2 horas

- [ ] Actualizar `apps/frontend/src/types/progress.types.ts`:
  ```typescript
  export interface ModuleProgress {
    // Campos existentes (8)
    id: string;
    user_id: string;
    module_id: string;
    status: ProgressStatus;
    progress_percentage: number;
    exercises_completed: number;
    total_exercises: number;
    updated_at: Date;

    // ✅ NUEVOS: Timestamps (3 campos)
    started_at: Date;
    completed_at?: Date;
    last_accessed_at: Date;
    time_spent: number; // segundos totales

    // ✅ NUEVOS: Gamificación (8 campos)
    xp_earned: number;
    coins_earned: number;
    gems_earned: number;
    achievements_unlocked: number;
    rank_at_start?: MayaRank;
    rank_at_completion?: MayaRank;
    mastery_level: number; // 0-100
    streak_days: number;

    // ✅ NUEVOS: Métricas de desempeño (7 campos)
    average_score: number;
    highest_score: number;
    attempts_count: number;
    hints_used_count: number;
    time_per_exercise_avg: number; // segundos
    completion_rate: number; // % ejercicios completados
    pass_rate: number; // % ejercicios aprobados

    // ✅ NUEVOS: Sistema adaptativo (3 campos)
    difficulty_level: number;
    adaptive_path?: any[];
    personalized_content?: any[];

    // ✅ NUEVOS: Metadata (2 campos)
    notes?: string;
    metadata?: any;
  }
  ```

- [ ] Actualizar componentes de progreso que usen este tipo

##### 0.2 Extender Exercise Type - MEDIO
**Problema:** Frontend tiene 15/27 campos
**Impacto:** Funcionalidad avanzada no disponible
**Estimación:** 1.5 horas

- [ ] Actualizar `apps/frontend/src/types/exercise.types.ts` agregando 12 campos:
  - `created_by`, `updated_by` (auditoría)
  - `dependencies` (prerequisitos)
  - `tags` (taxonomía)
  - `metadata` (JSON flexible)
  - `adaptive_difficulty` (IA)
  - `min_score_for_mastery` (gamificación)
  - `time_limit` (segundos)
  - `attempts_for_penalty` (mecánica)
  - `penalty_xp` (gamificación)
  - `show_correct_answer` (pedagogía)
  - `randomize_options` (variabilidad)

##### 0.3 Importar Enums desde Backend (Opcional - Mejora DRY)
**Beneficio:** Garantizar sincronización futura
**Estimación:** 2 horas
**Nota:** Actualmente enums están sincronizados manualmente. Esta tarea evita drift futuro.

- [ ] Buscar/reemplazar imports de enums locales:
  ```typescript
  // ❌ ANTES: Import local
  import { UserRole } from '../types/user.types';

  // ✅ DESPUÉS: Import desde Backend shared
  import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
  ```
- [ ] Eliminar definiciones de enums duplicadas en `apps/frontend/src/types/*.types.ts`
- [ ] Actualizar Vite alias si es necesario para resolver `@/shared`
- [ ] Verificar build

**Subtotal Tipos TypeScript:** 8.5 horas (0.0: 3h + 0.1: 2h + 0.2: 1.5h + 0.3: 2h)

---

#### ⚠️ Dependencias Backend BLOQUEANTES (NO implementar en Frontend, esperar Backend)

**CRÍTICO:** Los siguientes endpoints son requeridos por Frontend pero NO están implementados en Backend.
**Acción:** Notificar a equipo Backend (ver PLAN-COMPLETITUD-MIGRACION.md).

##### Backend Blocker #1: POST `/educational/exercises/:id/submit` - 🚨 BLOQUEANTE
**Impacto:** Estudiantes NO pueden enviar respuestas a ejercicios
**Prioridad Backend:** CICLO-1 (Fase 0)
**Frontend afectado:** `apps/frontend/src/api/exercises.service.ts:45`

##### Backend Blocker #2: Endpoints de Leaderboard - 🚨 BLOQUEANTE
**Impacto:** Rankings NO funcionales (global, por escuela, por aula)
**Prioridad Backend:** CICLO-7 (Fase 1)
**Frontend afectado:** `apps/frontend/src/api/leaderboard.service.ts`

Endpoints requeridos:
- `GET /gamification/leaderboard/global`
- `GET /gamification/leaderboard/schools/:schoolId`
- `GET /gamification/leaderboard/classrooms/:classroomId`

##### Backend Blocker #3: GET `/educational/modules/search` - ALTO
**Impacto:** Búsqueda de módulos NO funcional
**Prioridad Backend:** CICLO-2 (Fase 0)
**Frontend afectado:** `apps/frontend/src/api/modules.service.ts:67`

~~##### Backend Blocker #4: Migraciones Database - MEDIO~~
**Estado:** ✅ YA RESUELTO - Backend homologado con Database

**Nota:** Frontend puede continuar con Fase 0 (configuración + tipos) mientras Backend resuelve endpoints bloqueantes.
Las fases 2+ de Frontend (mecánicas/gamificación) requieren que Backend complete CICLO-1 a CICLO-3.

**Subtotal Backend (NO incluido en esfuerzo Frontend):** ~8-9 días Backend dev

---

#### Tareas de Configuración

##### 0.1 Configuración de Desarrollo
- [ ] Copiar `.dockerignore` completo
- [ ] Copiar `.env.example` completo (36 vars)
- [ ] Crear `.env.development`
- [ ] Crear `.env.production`
- [ ] Actualizar `.gitignore` (agregar backup patterns, .vite/)

##### 0.2 Configuración TypeScript
- [ ] Actualizar `baseUrl` a `"."`
- [ ] Migrar 5 path aliases del origen
- [ ] Agregar `exclude` para tests
- [ ] Agregar `types`: `["vitest/globals", "@testing-library/jest-dom"]`
- [ ] Verificar compilación sin errores

##### 0.3 Configuración Vite
- [ ] Agregar proxy para `/api` → `http://localhost:3005`
- [ ] Sincronizar aliases con tsconfig
- [ ] Cambiar puerto a 3005 (opcional)
- [ ] Verificar hot reload funciona

##### 0.4 Configuración Testing
- [ ] Crear `vitest.config.ts` (copiar del origen)
- [ ] Crear `src/test/setup.ts` con mocks:
  - matchMedia
  - IntersectionObserver
  - window.scrollTo
- [ ] Actualizar scripts en package.json:
  - `test:run`: `vitest run`
  - `type-check`: `tsc --noEmit`
  - `build:check`: `tsc && vite build`
- [ ] Ejecutar `npm run test` para verificar

##### 0.5 Estándares de Código
- [ ] **DECISIÓN CRÍTICA:** Decidir estándar semicolons
  - Opción A: Adoptar estándar origen (sin semicolons)
  - Opción B: Mantener destino (con semicolons)
  - Opción C: Ejecutar prettier en todo el origen antes de migrar
- [ ] Actualizar `.prettierrc` con estándar elegido
- [ ] Migrar regla ESLint: `@typescript-eslint/no-unused-vars`
- [ ] Agregar `parserOptions.project` en ESLint
- [ ] Ejecutar `npm run format` y `npm run lint`

##### 0.6 Tema y Estilos
- [ ] **CRÍTICO:** Copiar `detective-theme.css` (13 KB)
- [ ] Migrar COMPLETO `tailwind.config.js`:
  - 50+ colores detective
  - 6 animaciones custom
  - 12 sombras custom
  - 7 tamaños tipográficos
  - Configuración dark mode
- [ ] Actualizar `postcss.config.js` (verificar Tailwind v3 vs v4)
- [ ] Verificar build de Tailwind
- [ ] Probar tema en componentes existentes

##### 0.7 Dependencias Críticas
- [ ] Instalar dependencias faltantes críticas:
  ```bash
  npm install socket.io-client@^4.8.1 dompurify@^3.3.0 @types/dompurify@^3.0.5
  ```
- [ ] Instalar devDependencies críticas:
  ```bash
  npm install -D @types/node@^24.7.2 jsdom@^27.0.1 @axe-core/react@^4.8.4
  ```
- [ ] Verificar compatibilidad

##### 0.8 Scripts npm
- [ ] Agregar scripts faltantes en package.json:
  ```json
  {
    "dev:local": "vite --mode local",
    "build:local": "vite build --mode development",
    "build:prod": "vite build --mode production",
    "preview:prod": "vite preview --mode production"
  }
  ```

**Entregables Fase 0:**
- [ ] Build exitoso sin errores
- [ ] Tests configurados (aunque sin tests aún)
- [ ] Tema Detective visible
- [ ] Proxy API funcional
- [ ] Linting y formatting consistentes

---

### FASE 1: FUNDAMENTOS (Semanas 2-3)
**Objetivo:** Infraestructura compartida y gestión de estado
**Esfuerzo:** 80 horas
**Prioridad:** CRÍTICA

#### 1.1 Stores Zustand (11 stores)
**Esfuerzo:** 20 horas

- [ ] Migrar `authStore.ts`
- [ ] Migrar `notificationsStore.ts`
- [ ] Migrar `missionsStore.ts`
- [ ] Migrar `ranksStore.ts`
- [ ] Migrar `economyStore.ts`
- [ ] Migrar `friendsStore.ts`
- [ ] Migrar `achievementsStore.ts`
- [ ] Migrar `leaderboardsStore.ts`
- [ ] Migrar `newLeaderboardsStore.ts`
- [ ] Migrar `powerUpsStore.ts`
- [ ] Migrar `guildsStore.ts`
- [ ] Crear tests básicos para cada store
- [ ] Verificar que Zustand v4 → v5 no rompe nada (actualizar si es necesario)

#### 1.2 APIs Faltantes (19 APIs)
**Esfuerzo:** 15 horas

- [ ] Migrar `adminAPI.ts`
- [ ] Migrar `contentAPI.ts`
- [ ] Migrar `mechanicsAPI.ts`
- [ ] Migrar `aiServiceAPI.ts`
- [ ] Migrar APIs detalladas de gamification:
  - `ranks/api/ranksAPI.ts`
  - `social/api/socialAPI.ts`
  - `social/api/achievementsAPI.ts`
  - APIs de economy
- [ ] Actualizar `client.ts` si es necesario
- [ ] Documentar endpoints en cada API

#### 1.3 Hooks Compartidos (6 hooks)
**Esfuerzo:** 10 horas

- [ ] Migrar `useSanitizedHTML.ts`
- [ ] Migrar `useModules.ts`
- [ ] Migrar `useNavigation.ts`
- [ ] Migrar `useExerciseAttempts.ts`
- [ ] Migrar `useModuleAccess.ts`
- [ ] Crear tests para hooks críticos

#### 1.4 Componentes Shared - Base (10 componentes)
**Esfuerzo:** 15 horas

- [ ] Crear `shared/components/base/` folder
- [ ] Migrar `ColorfulCard.tsx`
- [ ] Migrar `DetectiveButton.tsx`
- [ ] Migrar `DetectiveCard.tsx`
- [ ] Migrar `EnhancedCard.tsx`
- [ ] Migrar `InputDetective.tsx`
- [ ] Migrar `LoadingOverlay.tsx`
- [ ] Migrar `ProgressBar.tsx`
- [ ] Migrar `RankBadge.tsx`
- [ ] Migrar `StatusBadge.tsx`
- [ ] Migrar `Toast.tsx`
- [ ] Verificar que usan tema Detective correctamente

#### 1.5 Componentes Shared - Mechanics (8 componentes)
**Esfuerzo:** 12 horas

- [ ] Crear `shared/components/mechanics/` folder
- [ ] Migrar `ExerciseContainer.tsx`
- [ ] Migrar `FeedbackModal.tsx`
- [ ] Migrar `HintModal.tsx`
- [ ] Migrar `HintSystem.tsx`
- [ ] Migrar `ProgressTracker.tsx`
- [ ] Migrar `ScoreDisplay.tsx`
- [ ] Migrar `TimerWidget.tsx`
- [ ] Migrar `mechanicsTypes.ts`

#### 1.6 Componentes Shared - Exercises (7 componentes)
**Esfuerzo:** 8 horas

- [ ] Crear `shared/components/exercises/` folder
- [ ] Migrar `CategoryBadge.tsx`
- [ ] Migrar `DraggableItem.tsx`
- [ ] Migrar `DropZone.tsx`
- [ ] Migrar `ExercisePlayer.tsx`
- [ ] Migrar `InlineFeedback.tsx`
- [ ] Migrar `OptionButton.tsx`

**Entregables Fase 1:**
- [ ] Estado global funcional (stores)
- [ ] APIs disponibles
- [ ] Componentes base migrados
- [ ] Infraestructura para ejercicios lista

---

### FASE 2: MECÁNICAS DE EJERCICIO (Semanas 4-9)
**Objetivo:** Migrar las 33 mecánicas de ejercicio (núcleo del producto)
**Esfuerzo:** 240 horas (6 semanas)
**Prioridad:** CRÍTICA

#### 2.1 Módulo 1 - Comprensión Literal (7 mecánicas)
**Esfuerzo:** 40 horas

- [ ] Mecánica: CompletarEspacios (3 archivos)
- [ ] Mecánica: Crucigrama (6 archivos)
- [ ] Mecánica: Emparejamiento (7 archivos)
- [ ] Mecánica: MapaConceptual (6 archivos)
- [ ] Mecánica: SopaLetras (1 archivo)
- [ ] Mecánica: Timeline (2 archivos)
- [ ] Mecánica: VerdaderoFalso (4 archivos)
- [ ] Tests para cada mecánica

#### 2.2 Módulo 2 - Comprensión Inferencial (5 mecánicas)
**Esfuerzo:** 50 horas

- [ ] Mecánica: DetectiveTextual (8 archivos, integración IA)
  - `DetectiveTextualExercise.tsx`
  - `EvidenceBoard.tsx`
  - `MagnifyingGlass.tsx`
  - `AIHintSystem.tsx`
  - Types, schemas, API, mock data
- [ ] Mecánica: RuedaInferencias (6 archivos con API)
- [ ] Mecánica: PrediccionNarrativa (6 archivos con API)
- [ ] Mecánica: ConstruccionHipotesis (7 archivos, AI validator)
- [ ] Mecánica: PuzzleContexto (6 archivos con API)
- [ ] Integrar `aiServiceAPI.ts`
- [ ] Tests completos

#### 2.3 Módulo 4 - Análisis Literario (9 mecánicas)
**Esfuerzo:** 70 horas
**Nota:** Priorizado antes de Módulo 3 por mayor uso

- [ ] Mecánica: AnalisisMemes (6 archivos con annotations)
- [ ] Mecánica: ChatLiterario (2 archivos)
- [ ] Mecánica: EmailFormal (2 archivos)
- [ ] Mecánica: EnsayoArgumentativo (2 archivos)
- [ ] Mecánica: InfografiaInteractiva (6 archivos con visualización)
- [ ] Mecánica: NavegacionHipertextual (6 archivos con breadcrumbs)
- [ ] Mecánica: QuizTikTok (6 archivos con swipe gestures)
- [ ] Mecánica: ResenaCritica (2 archivos)
- [ ] Mecánica: VerificadorFakeNews (6 archivos, fact-check)
- [ ] Tests completos

#### 2.4 Módulo 3 - Comprensión Crítica (5 mecánicas)
**Esfuerzo:** 40 horas

- [ ] Mecánica: AnalisisFuentes (2 archivos con API)
- [ ] Mecánica: DebateDigital (2 archivos con API)
- [ ] Mecánica: MatrizPerspectivas (2 archivos con API)
- [ ] Mecánica: PodcastArgumentativo (2 archivos con API)
- [ ] Mecánica: TribunalOpiniones (2 archivos con API)
- [ ] Tests completos

#### 2.5 Módulo 5 - Síntesis y Evaluación (3 mecánicas)
**Esfuerzo:** 20 horas

- [ ] Mecánica: ComicDigital (1 archivo)
- [ ] Mecánica: DiarioMultimedia (1 archivo)
- [ ] Mecánica: VideoCarta (1 archivo)
- [ ] Tests básicos

#### 2.6 Auxiliar - Mecánicas Complementarias (4 mecánicas)
**Esfuerzo:** 20 horas

- [ ] Mecánica: CallToAction (1 archivo)
- [ ] Mecánica: CollagePrensa (1 archivo)
- [ ] Mecánica: ComprensiónAuditiva (1 archivo)
- [ ] Mecánica: TextoEnMovimiento (1 archivo)
- [ ] Tests básicos

**Entregables Fase 2:**
- [ ] 33 mecánicas funcionales
- [ ] Sistema de ejercicios completo
- [ ] Tests ≥60% coverage en mecánicas críticas
- [ ] Documentación de cada mecánica

---

### FASE 3: GAMIFICACIÓN (Semanas 10-13)
**Objetivo:** Sistema completo de gamificación
**Esfuerzo:** 160 horas (4 semanas)
**Prioridad:** ALTA

#### 3.1 Sistema de Ranks (8 componentes)
**Esfuerzo:** 30 horas

- [ ] Migrar `features/gamification/ranks/` completo:
  - `components/` (8 componentes)
    - MayaIconography.tsx
    - PrestigeSystem.tsx
    - RankBadgeAdvanced.tsx
    - RankProgressBar.tsx
    - RankComparison.tsx
    - RankUpModal.tsx
    - MultiplierWidget.tsx
    - ProgressTimeline.tsx
  - `api/ranksAPI.ts`
  - `types/ranksTypes.ts`
  - `schemas/ranksSchemas.ts`
- [ ] Integrar con `ranksStore.ts`
- [ ] Tests

#### 3.2 Sistema de Economy (13 componentes)
**Esfuerzo:** 35 horas

- [ ] Migrar `features/gamification/economy/` completo:
  - `components/` (13 componentes estimados)
  - `api/` (APIs de economía)
  - `types/economyTypes.ts`
  - `schemas/economySchemas.ts`
- [ ] Integrar con `economyStore.ts`
- [ ] Sistema de tienda
- [ ] Sistema de inventario
- [ ] Tests

#### 3.3 Sistema de Missions (6 componentes)
**Esfuerzo:** 25 horas

- [ ] Migrar `features/gamification/missions/` completo:
  - `components/` (6 componentes)
  - `types/missionsTypes.ts`
- [ ] Integrar con `missionsStore.ts`
- [ ] Página MissionsPage (student)
- [ ] Tests

#### 3.4 Sistema Social (41 componentes)
**Esfuerzo:** 70 horas

**Achievements:**
- [ ] Migrar `features/gamification/social/` componentes de achievements
- [ ] Integrar con `achievementsStore.ts`
- [ ] Actualizar AchievementsPage (ya existe en destino)

**Leaderboards:**
- [ ] Migrar componentes de leaderboards (10 componentes)
  - GlobalLeaderboard
  - SchoolLeaderboard
  - FriendsLeaderboard
  - AdvancedLeaderboardTable
  - RankChangeIndicator
  - UserPositionCard
  - SeasonSelector
  - LeaderboardFilters
  - LeaderboardTabs
  - EnhancedLeaderboardTabs
- [ ] Integrar con `leaderboardsStore.ts` y `newLeaderboardsStore.ts`
- [ ] Actualizar LeaderboardPage (ya existe en destino)

**Friends & Guilds:**
- [ ] Migrar componentes de friends
- [ ] Migrar componentes de guilds
- [ ] Integrar con `friendsStore.ts` y `guildsStore.ts`
- [ ] Páginas FriendsPage y GuildsPage

**Power-ups:**
- [ ] Migrar componentes de power-ups
- [ ] Integrar con `powerUpsStore.ts`

**Tests:**
- [ ] Tests para todos los componentes sociales

**Entregables Fase 3:**
- [ ] Sistema de gamificación funcional
- [ ] Ranks, economía, misiones, social operativos
- [ ] Integración con student app
- [ ] Tests ≥60% coverage

---

### FASE 4: COMPLETAR STUDENT APP (Semanas 14-15)
**Objetivo:** App de estudiante completa
**Esfuerzo:** 80 horas (2 semanas)
**Prioridad:** ALTA

#### 4.1 Student Pages Faltantes (22 páginas)
**Esfuerzo:** 35 horas

**Autenticación:**
- [ ] PasswordRecoveryPage
- [ ] PasswordResetPage
- [ ] EmailVerificationPage
- [ ] TwoFactorAuthPage

**Perfil y Configuración:**
- [ ] ProfilePage
- [ ] EnhancedProfilePage
- [ ] SettingsPage

**Gamificación:**
- [ ] GamificationPage
- [ ] GamificationTestPage
- [ ] NewLeaderboardPage (si diferente a LeaderboardPage)
- [ ] MissionsPage (si no hecho en Fase 3)
- [ ] FriendsPage (si no hecho en Fase 3)
- [ ] GuildsPage (si no hecho en Fase 3)

**Economía:**
- [ ] ShopPage
- [ ] InventoryPage

**Ejercicios:**
- [ ] ExercisePage (orquestador de mecánicas)

**Dashboard:**
- [ ] DashboardComplete (versión completa del dashboard actual)

**Admin (en student/pages/admin):**
- [ ] UserManagementPage
- [ ] RolesPermissionsPage
- [ ] SecurityDashboard

**Otros:**
- [ ] NotFoundPage

#### 4.2 Student Components (38 componentes)
**Esfuerzo:** 45 horas

**Dashboard (19 componentes):**
- [ ] StatsGrid, ProgressStats, QuickActionsPanel
- [ ] BottomNavigation, RecentActivityPanel
- [ ] ModuleGridCard, MissionsPanel
- [ ] EnhancedStatsGrid, RankProgressWidget
- [ ] MLCoinsWidget, QuickActionsCard
- [ ] ModuleGridCardEnhanced, AchievementMilestones
- [ ] ResponsiveLayout
- [ ] ModulesSection, RecentActivityFeed
- [ ] + Stories y examples

**Achievements (5 componentes):**
- [ ] AchievementStatistics
- [ ] AchievementGrid (actualizar si existe)
- [ ] AchievementDetailModal
- [ ] AchievementFilters (actualizar si existe)
- [ ] AchievementsPageHeader

**Gamification (6 componentes):**
- [ ] LeaderboardPreview
- [ ] StreaksMissionsSection
- [ ] RanksSection
- [ ] MLCoinsSection
- [ ] AchievementsPreview
- [ ] GamificationHero

**Exercise (5 componentes):**
- [ ] ExerciseHeader
- [ ] CompletionModal
- [ ] HintModal (si diferente a shared)
- [ ] ExerciseSidebar
- [ ] PowerUpEffects

**Notifications (2 componentes):**
- [ ] CelebrationModal
- [ ] AchievementToast

**Interactions (1 componente):**
- [ ] SwipeableContainer

#### 4.3 Student Hooks (9 hooks)
**Esfuerzo:** Incluido en componentes

- [ ] useDashboardData
- [ ] useUserModules
- [ ] useExerciseState
- [ ] useSwipeGesture
- [ ] useAchievementsEnhanced
- [ ] useRecentActivities
- [ ] useGamificationData
- [ ] useResponsiveLayout

**Entregables Fase 4:**
- [ ] Student app 100% funcional
- [ ] Todas las páginas migradas
- [ ] Todos los componentes migrados
- [ ] Tests ≥60% coverage

---

### FASE 5: TEACHER APP (Semanas 16-17)
**Objetivo:** App de profesor completa
**Esfuerzo:** 80 horas (2 semanas)
**Prioridad:** MEDIA-ALTA

#### 5.1 Teacher Pages (21 páginas)
**Esfuerzo:** 40 horas

- [ ] TeacherDashboard / TeacherDashboardPage / TeacherDashboardNew
- [ ] TeacherClasses / TeacherClassesPage
- [ ] TeacherStudents / TeacherStudentsPage
- [ ] TeacherAssignments / TeacherAssignmentsPage
- [ ] TeacherAnalytics / TeacherAnalyticsPage
- [ ] TeacherProgressPage
- [ ] TeacherReportsPage
- [ ] TeacherAlertsPage
- [ ] TeacherMonitoringPage
- [ ] TeacherCommunicationPage
- [ ] TeacherContentPage / TeacherContentManagement
- [ ] TeacherResourcesPage
- [ ] TeacherGamification / TeacherGamificationPage

#### 5.2 Teacher Components (28 componentes)
**Esfuerzo:** 30 horas

- [ ] Dashboard widgets (4-5)
- [ ] Analytics charts (4-5)
- [ ] Assignments management (3-4)
- [ ] Progress tracking (3-4)
- [ ] Reports generation (3-4)
- [ ] Monitoring real-time (3-4)
- [ ] Alerts system (2-3)
- [ ] Collaboration tools (2-3)

#### 5.3 Teacher Hooks (5 hooks)
**Esfuerzo:** Incluido

- [ ] useClassroomData
- [ ] useStudentMonitoring
- [ ] useAnalytics
- [ ] useTeacherDashboard

#### 5.4 Teacher Layout
**Esfuerzo:** 10 horas

- [ ] TeacherLayout (con sidebar específico)

**Entregables Fase 5:**
- [ ] Teacher app 100% funcional
- [ ] Dashboard de profesor operativo
- [ ] Herramientas de monitoreo
- [ ] Tests ≥60% coverage

---

### FASE 6: ADMIN APP (Semana 18)
**Objetivo:** App de administrador completa
**Esfuerzo:** 40 horas (1 semana)
**Prioridad:** MEDIA

#### 6.1 Admin Pages (7 páginas)
**Esfuerzo:** 15 horas

- [ ] AdminDashboard / AdminDashboardPage
- [ ] AdminContent / ContentManagement
- [ ] AdminOrganizations
- [ ] SystemMonitoring
- [ ] AdvancedAdmin

#### 6.2 Admin Components (25 componentes)
**Esfuerzo:** 20 horas

- [ ] Dashboard (5)
- [ ] Users management (5-6)
- [ ] Content management (5-6)
- [ ] System monitoring (4-5)
- [ ] Advanced tools (4-5)

#### 6.3 Admin Layout
**Esfuerzo:** 5 horas

- [ ] AdminLayout (con sidebar específico)

**Entregables Fase 6:**
- [ ] Admin app 100% funcional
- [ ] Gestión de usuarios
- [ ] Monitoreo del sistema
- [ ] Tests ≥50% coverage

---

### FASE 7: COMPONENTES COMPLEMENTARIOS (Semana 19)
**Objetivo:** Completar componentes faltantes
**Esfuerzo:** 40 horas (1 semana)
**Prioridad:** BAJA-MEDIA

#### 7.1 Shared Components Restantes

**Layout (6 componentes):**
- [ ] DetectiveContainer
- [ ] DetectiveFooter
- [ ] DetectiveGrid
- [ ] GamifiedHeader (vs Header actual)
- [ ] GamilitSidebar (versión completa multi-rol)

**Media (6 componentes):**
- [ ] AudioRecorder
- [ ] ExportButton
- [ ] FileUploader
- [ ] ImageCropper
- [ ] VideoPlayer

**Common (6 componentes):**
- [ ] ActivityFeed
- [ ] ConfirmDialog
- [ ] DataTable
- [ ] FormField
- [ ] StatCard

**Celebrations (3 componentes):**
- [ ] ConfettiCelebration
- [ ] ConfettiExample

#### 7.2 Feature Notifications
**Esfuerzo:** 10 horas

- [ ] Migrar `features/notifications/` completo
- [ ] NotificationBell, NotificationDropdown
- [ ] WebSocket hooks
- [ ] Integrar con `notificationsStore`

#### 7.3 Feature Progress (si no completo)
**Esfuerzo:** 5 horas

- [ ] Completar APIs de progreso
- [ ] Componentes de progreso adicionales

**Entregables Fase 7:**
- [ ] Todos los componentes migrados
- [ ] Sistema de notificaciones operativo
- [ ] Componentes media funcionales

---

### FASE 8: ACTUALIZACIÓN DE DEPENDENCIAS (Semana 19)
**Objetivo:** Actualizar a versiones más recientes
**Esfuerzo:** 20 horas (paralelo a Fase 7)
**Prioridad:** MEDIA

#### 8.1 React 19
**Riesgo:** ALTO

- [ ] Leer changelog de React 19
- [ ] Actualizar `react` y `react-dom` a 19.2.0
- [ ] Actualizar `@types/react` y `@types/react-dom`
- [ ] Actualizar `@testing-library/react` a v16
- [ ] Ejecutar tests completos
- [ ] Verificar todas las páginas
- [ ] Corregir breaking changes

#### 8.2 React Router 7
**Riesgo:** MEDIO-ALTO

- [ ] Leer changelog de React Router v7
- [ ] Actualizar `react-router-dom` a 7.9.4
- [ ] Actualizar código de routing si es necesario
- [ ] Verificar todas las rutas
- [ ] Tests de navegación

#### 8.3 Zustand 5
**Riesgo:** BAJO

- [ ] Actualizar `zustand` a 5.0.8
- [ ] Verificar stores funcionan
- [ ] Tests de stores

#### 8.4 Otras Dependencias
**Riesgo:** BAJO-MEDIO

- [ ] `framer-motion` → 12.23.24
- [ ] `lucide-react` → 0.545.0
- [ ] `axios` → 1.12.2
- [ ] Verificar compatibilidad

#### 8.5 Tailwind CSS 4
**Riesgo:** ALTO (breaking changes)

- [ ] Leer guía de migración Tailwind v3 → v4
- [ ] Actualizar `tailwindcss` a 4.1.14
- [ ] Actualizar `@tailwindcss/postcss`
- [ ] Migrar configuración si es necesario
- [ ] Verificar build
- [ ] Revisar todos los componentes
- [ ] Corregir estilos rotos

#### 8.6 Vite 7
**Riesgo:** MEDIO

- [ ] Actualizar `vite` a 7.1.10
- [ ] Verificar plugins compatibles
- [ ] Actualizar configuración si es necesario
- [ ] Verificar build y dev server

#### 8.7 Vitest 3
**Riesgo:** BAJO

- [ ] Actualizar `vitest` y `@vitest/ui` a 3.2.4
- [ ] Actualizar configuración si es necesario
- [ ] Ejecutar todos los tests

**Entregables Fase 8:**
- [ ] Todas las dependencias actualizadas
- [ ] Tests pasando al 100%
- [ ] Build exitoso
- [ ] App funcional en todas las rutas

---

## GESTIÓN DE RIESGOS

### Riesgos Críticos

#### R1: Incompatibilidad React 18 → 19
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Migrar todo el código primero con React 18
- Actualizar React 19 al final
- Testing exhaustivo post-actualización
- Tener plan de rollback

#### R2: Tema Detective no funciona
**Probabilidad:** Baja
**Impacto:** Alto
**Mitigación:**
- Migrar tema completo en Fase 0
- Verificar inmediatamente en componentes
- No continuar hasta que funcione

#### R3: Tailwind 3 → 4 Breaking Changes
**Probabilidad:** Alta
**Impacto:** Alto
**Mitigación:**
- Revisar changelog detallado
- Hacer upgrade en rama separada
- Testing visual exhaustivo
- Considerar mantener Tailwind 3 si es necesario

#### R4: Stores Zustand no funcionan
**Probabilidad:** Baja
**Impacto:** Crítico
**Mitigación:**
- Migrar authStore primero y validar
- Hacer tests unitarios de cada store
- Verificar Zustand v4 vs v5

#### R5: APIs incompatibles con backend
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Validar endpoints con backend
- Documentar contratos de API
- Usar mocks para desarrollo

### Riesgos Altos

#### R6: Esfuerzo subestimado
**Probabilidad:** Alta
**Impacto:** Medio
**Mitigación:**
- Buffer de 30% en estimaciones
- Revisión semanal de progreso
- Priorizar features críticos

#### R7: Componentes con implementaciones diferentes
**Probabilidad:** Media
**Impacto:** Medio
**Mitigación:**
- Validar componentes existentes
- Renombrar si es necesario
- Documentar diferencias

---

## VALIDACIÓN Y TESTING

### Por Fase

**Fase 0:**
- [ ] Build sin errores
- [ ] Linting sin errores
- [ ] Tests configurados

**Fase 1:**
- [ ] Tests unitarios de stores (100%)
- [ ] Tests de hooks críticos
- [ ] Tests de componentes base

**Fase 2:**
- [ ] Tests de cada mecánica (≥60% coverage)
- [ ] Tests E2E de 3 mecánicas representativas

**Fase 3:**
- [ ] Tests de gamificación (≥60% coverage)
- [ ] Tests de integración stores + componentes

**Fases 4-6:**
- [ ] Tests de cada app (≥60% coverage)
- [ ] Tests E2E de flujos principales

**Fase 7-8:**
- [ ] Tests de regresión completos
- [ ] Tests de compatibilidad cross-browser

### Checklist Final de Validación

**Funcionalidad:**
- [ ] Todas las 33 mecánicas funcionan
- [ ] Gamificación completa operativa
- [ ] Student app 100% funcional
- [ ] Teacher app 100% funcional
- [ ] Admin app 100% funcional
- [ ] Notificaciones en tiempo real
- [ ] Sistema de progreso
- [ ] Economía y tienda

**Técnico:**
- [ ] Build exitoso
- [ ] Tests ≥60% coverage global
- [ ] Linting sin errores
- [ ] TypeScript sin errores
- [ ] Lighthouse score >90

**Visual:**
- [ ] Tema Detective completo
- [ ] Responsive en mobile, tablet, desktop
- [ ] Animaciones funcionando
- [ ] Dark mode (si aplicable)

**Rendimiento:**
- [ ] FCP <1.5s
- [ ] LCP <2.5s
- [ ] TTI <3s

---

## RECURSOS NECESARIOS

### Humanos
- 1 Frontend Developer (tiempo completo, 19 semanas)
- 1 QA Tester (medio tiempo, semanas 10-19)
- 1 Tech Lead (revisión semanal)

### Herramientas
- Acceso a ambos reposit orios (origen y destino)
- Entorno de desarrollo local configurado
- Acceso a backend de desarrollo
- Herramientas de testing (ya incluidas)

---

## CRONOGRAMA

| Fase | Semanas | Inicio | Fin | Entregable Principal |
|------|---------|--------|-----|----------------------|
| 0 | 1 | S1 | S1 | Configuración completa |
| 1 | 2 | S2 | S3 | Stores + APIs + Componentes base |
| 2 | 6 | S4 | S9 | 33 mecánicas funcionales |
| 3 | 4 | S10 | S13 | Gamificación completa |
| 4 | 2 | S14 | S15 | Student app 100% |
| 5 | 2 | S16 | S17 | Teacher app 100% |
| 6 | 1 | S18 | S18 | Admin app 100% |
| 7 | 1 | S19 | S19 | Componentes complementarios |
| 8 | 1 | S19 | S19 | Dependencias actualizadas |

**Total:** 19 semanas (~ 4.5 meses)

---

## MÉTRICAS DE ÉXITO

### KPIs

1. **Completitud de migración:** 100%
2. **Test coverage:** ≥60%
3. **Build exitoso:** Sí
4. **Lighthouse score:** >90
5. **Zero regressions:** Todas las funcionalidades del origen operativas

### Definición de "Completado"

Una fase se considera completada cuando:
- [ ] Todos los archivos listados están migrados
- [ ] Tests escritos y pasando
- [ ] Code review aprobado
- [ ] Funcionalidad validada manualmente
- [ ] Documentación actualizada
- [ ] Sin bloqueadores técnicos

---

## APROBACIÓN Y SEGUIMIENTO

### Aprobación Requerida
- [ ] Tech Lead
- [ ] Product Owner
- [ ] DevOps (para deployment)

### Seguimiento Semanal
- Reunión de seguimiento cada lunes
- Reporte de progreso en `orchestration/04-logs/frontend/`
- Actualización de `TRAZA-TAREAS-FRONTEND.md`
- Actualización de `ESTADO-FRONTEND.json`

### Criterios de Pausa
- Bloqueadores técnicos no resueltos en 3 días
- Test coverage baja de 50% global
- Build fallando consistentemente
- Más de 10 issues críticos abiertos

---

## PRÓXIMOS PASOS INMEDIATOS

1. **Aprobar este plan**
2. **Asignar recursos**
3. **Iniciar Fase 0 (Configuración)**
4. **Configurar tracking en JIRA/Trello**
5. **Crear rama de trabajo: `feature/frontend-migration`**
6. **Ejecutar primera tarea de Fase 0**

---

**Documento creado:** 2025-11-02
**Creado por:** NEXUS-FRONTEND
**Estado:** DRAFT - Pendiente de aprobación
**Versión:** 1.0
