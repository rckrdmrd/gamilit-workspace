# FASE 3: PLAN DE CORRECCIONES
## Consolidado de Hallazgos y Correcciones Planificadas

**Fecha:** 2025-12-15
**Estado:** EN PROGRESO
**Responsable:** Tech-Leader
**Basado en:** Análisis Database, Backend y Frontend (Fase 2)

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad | Capa Principal | Estado |
|-----------|----------|----------------|--------|
| P0 CRÍTICO | 4 | Database (1), Frontend (3) | PENDIENTE |
| P1 ALTO | 8 | Frontend (5), Backend (3) | PENDIENTE |
| P2 MEDIO | 6 | Frontend (4), Database (1), Backend (1) | PENDIENTE |
| P3 BAJO | 4 | Frontend (3), Database (1) | OPCIONAL |
| **TOTAL** | **22** | | |

---

## CORRECCIONES P0 - CRÍTICAS

### CORR-P0-001: Columna `missions_completed` no existe en `user_stats`

```yaml
correccion:
  id: "CORR-P0-001"
  severidad: "P0"
  capa: "database"
  tipo: "fix"

  problema:
    descripcion: "Función calculate_user_rank referencia columna 'missions_completed' que NO EXISTE en tabla user_stats"
    archivo_afectado: "/apps/database/ddl/schemas/gamification_system/functions/calculate_user_rank.sql"
    lineas: "24, 50, 58"
    error_runtime: "column 'missions_completed' does not exist"

  solucion:
    descripcion: "Cambiar 'missions_completed' por 'modules_completed' que sí existe y tiene semántica similar"
    cambios:
      - archivo: "/apps/database/ddl/schemas/gamification_system/functions/calculate_user_rank.sql"
        tipo: "edit"
        antes: |
          SELECT total_xp, missions_completed INTO v_total_xp, v_missions_completed
        despues: |
          SELECT total_xp, modules_completed INTO v_total_xp, v_missions_completed

  dependencias:
    requiere: []
    habilita: ["CORR-P1-001"]

  impacto:
    archivos_adicionales: []
    seeds_afectados: false
    recrear_bd: true

  validacion:
    como_verificar: "Ejecutar SELECT gamification_system.calculate_user_rank('uuid') sin error"
    comando_test: "psql -d gamilit -c \"SELECT * FROM gamification_system.calculate_user_rank('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');\""
```

---

### CORR-P0-002: AchievementWithProgress duplicado con estructuras incompatibles

```yaml
correccion:
  id: "CORR-P0-002"
  severidad: "P0"
  capa: "frontend"
  tipo: "rename"

  problema:
    descripcion: "Existen 2 interfaces 'AchievementWithProgress' con estructuras incompatibles en diferentes archivos"
    archivos_afectados:
      - "/apps/frontend/src/features/gamification/social/types/achievementsTypes.ts" (línea 62-80)
      - "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts" (línea 90-99)

  solucion:
    descripcion: "Renombrar la interface en API a 'AchievementAPIResponse' para evitar colisión"
    cambios:
      - archivo: "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts"
        tipo: "edit"
        antes: |
          export interface AchievementWithProgress extends BackendAchievement {
        despues: |
          export interface AchievementAPIResponse extends BackendAchievement {

  dependencias:
    requiere: []
    habilita: ["CORR-P0-003"]

  impacto:
    archivos_adicionales:
      - Cualquier import de AchievementWithProgress desde achievementsAPI.ts
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "npm run typecheck sin errores"
    comando_test: "npm run typecheck"
```

---

### CORR-P0-003: Transformación inconsistente de rewards en API

```yaml
correccion:
  id: "CORR-P0-003"
  severidad: "P0"
  capa: "frontend"
  tipo: "fix"

  problema:
    descripcion: "mapToFrontendAchievement usa fallback que puede producir valores incorrectos cuando rewards.ml_coins = 0"
    archivo_afectado: "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts"
    lineas: "362-390"
    codigo_problematico: |
      mlCoinsReward: backendAchievement.rewards?.ml_coins ||
                     backendAchievement.ml_coins_reward || 0

  solucion:
    descripcion: "Usar nullish coalescing (??) en lugar de OR (||) para respetar valor 0"
    cambios:
      - archivo: "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts"
        tipo: "edit"
        antes: |
          mlCoinsReward: backendAchievement.rewards?.ml_coins ||
                         backendAchievement.ml_coins_reward || 0
        despues: |
          mlCoinsReward: backendAchievement.rewards?.ml_coins ??
                         backendAchievement.ml_coins_reward ?? 0

  dependencias:
    requiere: ["CORR-P0-002"]
    habilita: []

  impacto:
    archivos_adicionales: []
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "Test manual: achievement con rewards.ml_coins = 0 debe mostrar 0, no fallback"
    comando_test: "npm run test -- achievementsAPI.test.ts"
```

---

### CORR-P0-004: Campo conditions con estructura diferente (array vs object)

```yaml
correccion:
  id: "CORR-P0-004"
  severidad: "P0"
  capa: "frontend"
  tipo: "align"

  problema:
    descripcion: "Frontend espera conditions como AchievementCondition[], Backend envía como objeto JSONB { type, requirements }"
    archivos_afectados:
      - Frontend: "/apps/frontend/src/shared/types/achievement.types.ts" (línea 74-79)
      - Backend Entity: "/apps/backend/src/modules/gamification/entities/achievement.entity.ts" (línea 106-107)

  solucion:
    descripcion: "Actualizar tipo Frontend para aceptar estructura de backend (objeto con type y requirements)"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "edit"
        antes: |
          conditions: AchievementCondition[]
        despues: |
          conditions: AchievementConditions | AchievementCondition[]

      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "add"
        despues: |
          // Estructura de conditions como viene del backend
          export interface AchievementConditions {
            type: string
            requirements: Record<string, unknown>
          }

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - Componentes que renderizan conditions
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "npm run typecheck sin errores"
    comando_test: "npm run typecheck"
```

---

## CORRECCIONES P1 - ALTA PRIORIDAD

### CORR-P1-001: Semántica módulos vs misiones inconsistente

```yaml
correccion:
  id: "CORR-P1-001"
  severidad: "P1"
  capa: "database"
  tipo: "rename"

  problema:
    descripcion: "Workaround en check_and_award_achievements usa modules_completed para 'MISSIONS_COMPLETED'"
    archivo_afectado: "/apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql"
    lineas: "74-75"

  solucion:
    descripcion: "Documentar formalmente que 'missions' = 'modules' o cambiar nomenclatura"
    cambios:
      - archivo: "/apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql"
        tipo: "edit"
        antes: |
          WHEN 'MISSIONS_COMPLETED' THEN
              -- CORRECCION: Usar modules_completed como alternativa (missions_completed no existe)
              v_condition_met := COALESCE(v_user_stats.modules_completed, 0) >= v_condition_value;
        despues: |
          WHEN 'MISSIONS_COMPLETED', 'MODULES_COMPLETED' THEN
              -- NOTA: En GAMILIT, 'missions' y 'modules' son conceptos equivalentes
              -- Se usa modules_completed como columna de referencia
              v_condition_met := COALESCE(v_user_stats.modules_completed, 0) >= v_condition_value;

  dependencias:
    requiere: ["CORR-P0-001"]
    habilita: []

  impacto:
    archivos_adicionales:
      - Seeds de achievements con conditions.type = 'MISSIONS_COMPLETED'
    seeds_afectados: false
    recrear_bd: true

  validacion:
    como_verificar: "Achievements con type MISSIONS_COMPLETED y MODULES_COMPLETED funcionan igual"
    comando_test: "Test de achievements en staging"
```

---

### CORR-P1-002: Difficulty levels completamente desalineados

```yaml
correccion:
  id: "CORR-P1-002"
  severidad: "P1"
  capa: "frontend"
  tipo: "align"

  problema:
    descripcion: "Frontend usa 'easy/medium/hard/expert', Backend usa niveles CEFR (A1-C2)"
    archivos_afectados:
      - Frontend: "/apps/frontend/src/shared/types/achievement.types.ts" (línea 114)
      - Backend: "/apps/backend/src/shared/constants/enums.constants.ts" (línea 143-152)

  solucion:
    descripcion: "Agregar mapeo de niveles simples a CEFR en frontend"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "edit"
        antes: |
          difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert'
        despues: |
          // Backend uses CEFR standard: BEGINNER(A1), ELEMENTARY(A2), PRE_INTERMEDIATE(B1),
          // INTERMEDIATE(B2), UPPER_INTERMEDIATE(C1), ADVANCED(C2), PROFICIENT(C2+), NATIVE
          difficulty_level?: DifficultyLevel

      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "add"
        despues: |
          export type DifficultyLevel =
            | 'BEGINNER' | 'ELEMENTARY' | 'PRE_INTERMEDIATE'
            | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE'
            | 'ADVANCED' | 'PROFICIENT' | 'NATIVE'

          // Helper para mapear a nivel simple para UI
          export const difficultyToSimple = (level: DifficultyLevel): 'easy' | 'medium' | 'hard' | 'expert' => {
            const mapping: Record<DifficultyLevel, 'easy' | 'medium' | 'hard' | 'expert'> = {
              BEGINNER: 'easy',
              ELEMENTARY: 'easy',
              PRE_INTERMEDIATE: 'medium',
              INTERMEDIATE: 'medium',
              UPPER_INTERMEDIATE: 'hard',
              ADVANCED: 'hard',
              PROFICIENT: 'expert',
              NATIVE: 'expert'
            }
            return mapping[level] || 'medium'
          }

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - Componentes que muestran/filtran por dificultad
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "npm run typecheck y filtros de dificultad funcionan"
    comando_test: "npm run typecheck"
```

---

### CORR-P1-003: Campo type no existe en backend entity

```yaml
correccion:
  id: "CORR-P1-003"
  severidad: "P1"
  capa: "backend"
  tipo: "add"

  problema:
    descripcion: "Frontend usa 'type' (badge/milestone/special/rank_promotion), Backend Entity no tiene este campo"
    archivos_afectados:
      - Frontend: "/apps/frontend/src/shared/types/achievement.types.ts" (línea 104)
      - Backend Entity: "/apps/backend/src/modules/gamification/entities/achievement.entity.ts" (campo ausente)
      - DDL: "/apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql" (campo ausente)

  solucion:
    descripcion: "Agregar campo 'achievement_type' a DDL y Entity (el enum ya existe)"
    cambios:
      - archivo: "/apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql"
        tipo: "add"
        despues: |
          -- Después de la columna 'category':
          achievement_type gamification_system.achievement_type DEFAULT 'badge'::gamification_system.achievement_type NOT NULL,

      - archivo: "/apps/backend/src/modules/gamification/entities/achievement.entity.ts"
        tipo: "add"
        despues: |
          @Column({ type: 'enum', enum: AchievementTypeEnum, default: AchievementTypeEnum.BADGE })
          achievement_type!: AchievementTypeEnum

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - Seeds de achievements (agregar achievement_type)
      - DTOs de achievements
    seeds_afectados: true
    recrear_bd: true

  validacion:
    como_verificar: "Campo visible en API response"
    comando_test: "curl localhost:3006/api/gamification/achievements"
```

---

### CORR-P1-004: Campos unlock_message, instructions, tips solo en backend

```yaml
correccion:
  id: "CORR-P1-004"
  severidad: "P1"
  capa: "frontend"
  tipo: "add"

  problema:
    descripcion: "Backend tiene campos de guía (unlock_message, instructions, tips) que frontend no puede mostrar"
    archivos_afectados:
      - Backend Entity: "/apps/backend/src/modules/gamification/entities/achievement.entity.ts" (líneas 165-180)
      - Frontend Types: No existen

  solucion:
    descripcion: "Agregar campos de mensajes guía al tipo Achievement del frontend"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "add"
        despues: |
          // Campos de guía del backend (opcionales)
          unlock_message?: string    // Mensaje al desbloquear
          instructions?: string      // Instrucciones para conseguir
          tips?: string[]            // Tips adicionales

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - BackendAchievement en achievementsAPI.ts
      - Componentes de detalle de achievement
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "Types aceptan campos del backend"
    comando_test: "npm run typecheck"
```

---

### CORR-P1-005: completion_percentage devuelto como string

```yaml
correccion:
  id: "CORR-P1-005"
  severidad: "P1"
  capa: "frontend"
  tipo: "fix"

  problema:
    descripcion: "Backend retorna completion_percentage como string (PostgreSQL numeric serialization), frontend espera number"
    archivo_afectado: "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts"
    lineas: "72"

  solucion:
    descripcion: "Parsear completion_percentage a number en la transformación de API"
    cambios:
      - archivo: "/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts"
        tipo: "edit"
        antes: |
          completionPercentage: userAchievement.completion_percentage
        despues: |
          completionPercentage: parseFloat(String(userAchievement.completion_percentage)) || 0

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales: []
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "Progress bar de achievements muestra porcentaje correcto"
    comando_test: "Test visual en UI"
```

---

### CORR-P1-006: current_rank como text en Entity vs ENUM en DDL

```yaml
correccion:
  id: "CORR-P1-006"
  severidad: "P1"
  capa: "backend"
  tipo: "fix"

  problema:
    descripcion: "UserStats.current_rank usa tipo 'text' en Entity pero DDL define como 'maya_rank' ENUM"
    archivos_afectados:
      - DDL: "user_stats.sql" define current_rank como 'maya_rank' ENUM
      - Backend Entity: "user-stats.entity.ts" define como text

  solucion:
    descripcion: "Cambiar tipo en Entity para usar MayaRankEnum"
    cambios:
      - archivo: "/apps/backend/src/modules/gamification/entities/user-stats.entity.ts"
        tipo: "edit"
        antes: |
          @Column({ type: 'text', default: 'Ajaw', nullable: true })
          current_rank?: string
        despues: |
          @Column({ type: 'enum', enum: MayaRankEnum, default: MayaRankEnum.AJAW, nullable: true })
          current_rank?: MayaRankEnum

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - Imports de MayaRankEnum
      - DTOs que usan current_rank
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "TypeORM no genera warnings de tipo"
    comando_test: "npm run start:dev"
```

---

### CORR-P1-007: detailedDescription solo en frontend

```yaml
correccion:
  id: "CORR-P1-007"
  severidad: "P1"
  capa: "frontend"
  tipo: "remove"

  problema:
    descripcion: "Campo 'detailedDescription' existe en frontend pero no en backend entity/DDL"
    archivo_afectado: "/apps/frontend/src/shared/types/achievement.types.ts" (línea 101)

  solucion:
    descripcion: "Marcar como deprecated o eliminar, usar 'instructions' del backend"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "edit"
        antes: |
          detailedDescription?: string
        despues: |
          /** @deprecated Use 'instructions' from backend instead */
          detailedDescription?: string

  dependencias:
    requiere: ["CORR-P1-004"]
    habilita: []

  impacto:
    archivos_adicionales:
      - Componentes que usan detailedDescription
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "Componentes migran a usar 'instructions'"
    comando_test: "grep -r 'detailedDescription' src/"
```

---

### CORR-P1-008: AchievementCategoryEnum const object incompleto

```yaml
correccion:
  id: "CORR-P1-008"
  severidad: "P1"
  capa: "frontend"
  tipo: "fix"

  problema:
    descripcion: "AchievementCategoryEnum const object falta 'COLLECTION' y 'HIDDEN'"
    archivo_afectado: "/apps/frontend/src/shared/types/achievement.types.ts" (línea 29-38)

  solucion:
    descripcion: "Agregar valores faltantes al const object"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "edit"
        antes: |
          export const AchievementCategoryEnum = {
            PROGRESS, STREAK, COMPLETION, SOCIAL, SPECIAL,
            MASTERY, EXPLORATION
          }
        despues: |
          export const AchievementCategoryEnum = {
            PROGRESS: 'progress',
            STREAK: 'streak',
            COMPLETION: 'completion',
            SOCIAL: 'social',
            SPECIAL: 'special',
            MASTERY: 'mastery',
            EXPLORATION: 'exploration',
            COLLECTION: 'collection',  // v1.1
            HIDDEN: 'hidden',          // v1.1
          } as const

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales: []
    seeds_afectados: false
    recrear_bd: false

  validacion:
    como_verificar: "npm run typecheck"
    comando_test: "npm run typecheck"
```

---

## CORRECCIONES P2 - MEDIA PRIORIDAD

### CORR-P2-001: Naming inconsistente name vs title

```yaml
correccion:
  id: "CORR-P2-001"
  severidad: "P2"
  capa: "frontend"
  tipo: "align"

  problema:
    descripcion: "Feature types usan 'title', backend usa 'name'"
    archivos_afectados:
      - Feature types: achievementsTypes.ts usa 'title' como principal
      - API transform: Convierte name -> title

  solucion:
    descripcion: "Estandarizar en 'name' en todos lados"
    cambios:
      - archivo: "/apps/frontend/src/features/gamification/social/types/achievementsTypes.ts"
        tipo: "edit"
        antes: |
          title: string
          name?: string
        despues: |
          name: string
          /** @deprecated Use 'name' instead */
          title?: string

  dependencias:
    requiere: []
    habilita: []

  impacto:
    archivos_adicionales:
      - Componentes que usan 'title'
      - Store que transforma name -> title
    seeds_afectados: false
    recrear_bd: false
```

---

### CORR-P2-002: description nullable en backend, required en frontend

```yaml
correccion:
  id: "CORR-P2-002"
  severidad: "P2"
  capa: "frontend"
  tipo: "fix"

  problema:
    descripcion: "Backend tiene description nullable, frontend lo marca required"

  solucion:
    descripcion: "Hacer description opcional en frontend"
    cambios:
      - archivo: "/apps/frontend/src/shared/types/achievement.types.ts"
        tipo: "edit"
        antes: |
          description: string
        despues: |
          description?: string

  dependencias:
    requiere: []
    habilita: []
```

---

### CORR-P2-003: Valores ENUM collection y hidden sin uso en seeds

```yaml
correccion:
  id: "CORR-P2-003"
  severidad: "P2"
  capa: "database"
  tipo: "document"

  problema:
    descripcion: "Valores 'collection' y 'hidden' agregados a ENUM pero sin seeds"

  solucion:
    descripcion: "Documentar como valores reservados para futuro"
    cambios:
      - archivo: "/apps/database/ddl/00-prerequisites.sql"
        tipo: "edit"
        nota: "Agregar comentario documentando uso futuro"

  dependencias:
    requiere: []
    habilita: []
```

---

### CORR-P2-004 a P2-006: Otras correcciones menores

*(Detalles similares para:)*
- createdAt/updatedAt como string vs Date
- Export Achievement como alias deprecated
- Documentar mapeo de categorías

---

## GRAFO DE DEPENDENCIAS

```
NIVEL 0 (Sin dependencias):
┌─────────────────────────────────────────────────────────────────────────┐
│  CORR-P0-001  │  CORR-P0-002  │  CORR-P0-004  │  CORR-P1-002  │        │
│  (DDL func)   │  (Rename type)│  (conditions) │  (difficulty) │        │
│  CRÍTICO      │  CRÍTICO      │  CRÍTICO      │  ALTA         │        │
└───────┬───────┴───────┬───────┴───────────────┴───────────────┘        │
        │               │                                                 │
        ▼               ▼                                                 │
NIVEL 1 (Depende de Nivel 0):                                            │
┌───────────────┬───────────────┐                                        │
│  CORR-P0-003  │  CORR-P1-001  │                                        │
│  (rewards)    │  (missions)   │                                        │
│  Req: P0-002  │  Req: P0-001  │                                        │
└───────────────┴───────────────┘                                        │
                                                                         │
NIVEL 2 (Depende de Nivel 1):                                            │
┌───────────────┐                                                        │
│  CORR-P1-007  │                                                        │
│  (deprecated) │                                                        │
│  Req: P1-004  │                                                        │
└───────────────┘                                                        │

PARALELO (Sin dependencias entre sí):
┌────────────────────────────────────────────────────────────────────────┐
│  CORR-P1-003  │  CORR-P1-004  │  CORR-P1-005  │  CORR-P1-006  │        │
│  (add type)   │  (add msgs)   │  (parseFloat) │  (MayaRank)   │        │
│  CORR-P1-008  │  CORR-P2-001  │  CORR-P2-002  │  CORR-P2-003  │        │
│  (enum const) │  (name/title) │  (nullable)   │  (document)   │        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Batch 1 - Database (CRÍTICO)
1. **CORR-P0-001**: Fix calculate_user_rank.sql (missions_completed → modules_completed)
2. **CORR-P1-001**: Document missions = modules equivalence

### Batch 2 - Frontend Types (CRÍTICO)
3. **CORR-P0-002**: Rename AchievementWithProgress → AchievementAPIResponse
4. **CORR-P0-004**: Align conditions structure
5. **CORR-P1-002**: Add DifficultyLevel type with mapping
6. **CORR-P1-004**: Add guide message fields
7. **CORR-P1-008**: Complete AchievementCategoryEnum

### Batch 3 - Frontend Fixes
8. **CORR-P0-003**: Fix rewards transformation (|| → ??)
9. **CORR-P1-005**: Parse completion_percentage to number
10. **CORR-P1-007**: Deprecate detailedDescription

### Batch 4 - Backend Alignment
11. **CORR-P1-003**: Add achievement_type to Entity/DDL
12. **CORR-P1-006**: Change current_rank to MayaRankEnum

### Batch 5 - Cleanup
13-18. Correcciones P2 y P3

---

## VALIDACIÓN POST-CORRECCIÓN

### Checklist General
- [ ] `npm run typecheck` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run test` pasa
- [ ] Base de datos recrea sin errores
- [ ] API responde correctamente
- [ ] Frontend carga achievements sin errores

### Checklist por Corrección
*(Se generará en FASE-4)*

---

## ARCHIVOS AFECTADOS (RESUMEN)

### Database
- `ddl/schemas/gamification_system/functions/calculate_user_rank.sql`
- `ddl/schemas/gamification_system/functions/check_and_award_achievements.sql`
- `ddl/schemas/gamification_system/tables/03-achievements.sql` (potencial)
- `ddl/00-prerequisites.sql` (ya actualizado)

### Backend
- `src/modules/gamification/entities/achievement.entity.ts`
- `src/modules/gamification/entities/user-stats.entity.ts`

### Frontend
- `src/shared/types/achievement.types.ts`
- `src/features/gamification/social/types/achievementsTypes.ts`
- `src/features/gamification/social/api/achievementsAPI.ts`
- `src/features/gamification/social/store/achievementsStore.ts`

---

**Estado:** EN PROGRESO
**Siguiente:** FASE 4 - Validación de dependencias

