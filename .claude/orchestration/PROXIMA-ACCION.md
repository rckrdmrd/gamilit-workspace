# PRÓXIMA ACCIÓN - NEXUS-INTEGRATION

**Última actualización:** 2025-11-04 18:30:00
**Estado del Sistema:** ✅ OPERATIVO
**Validación Completada:** Validación Integral Multi-Capa (7 Agentes)

---

## 🎯 ACCIONES INMEDIATAS PRIORITARIAS

### 🔴 P0 - BLOQUEADORES (Ejecutar Esta Semana)

#### 1. Sincronizar Enums Database (CRÍTICO) ⏰ 2-3 horas
**Problema:** Enum mismatches causan INSERT failures
**Impacto:** BLOQUEADOR para producción

**Acciones:**
```bash
# Crear script de migración
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/migrations

# Crear archivo
touch 2025-11-04-sync-enums.sql
```

**Contenido del script:**
```sql
-- 1. Sincronizar difficulty_level (agregar 5 valores)
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'very_easy';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'easy';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'medium';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'hard';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'very_hard';

-- 2. Fix default value (de 'very_easy' a 'beginner')
ALTER TABLE educational_content.exercises
  ALTER COLUMN difficulty_level SET DEFAULT 'beginner';

-- 3. Sincronizar exercise_type (agregar 5 tipos)
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'diario_multimedia';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'comic_digital';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'video_carta';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'verdadero_falso';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'completar_espacios';
```

**Testing:**
```sql
-- Verificar enums
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'difficulty_level'::regtype
ORDER BY enumsortorder;

-- Test insert
INSERT INTO educational_content.exercises (
  module_id, exercise_type, difficulty_level, title, tenant_id
) VALUES (
  (SELECT id FROM educational_content.modules LIMIT 1),
  'verdadero_falso',
  'very_easy',
  'Test Exercise',
  (SELECT id FROM auth.tenants LIMIT 1)
);
```

**Archivo de referencia:** REPORTE-FINAL líneas 386-424

---

#### 2. Fix Route Order Conflicts ⏰ 30 minutos
**Problema:** `:id` captura rutas específicas como UUIDs inválidos
**Impacto:** Endpoints no funcionan

**Acciones:**
```bash
# Archivo 1
nano apps/backend/src/modules/educational/controllers/modules.controller.ts
```

```typescript
// MOVER estas líneas ANTES de @Get(':id')
@Get('difficulty/:difficulty')
@ApiOperation({ summary: 'Get modules by difficulty' })
getModulesByDifficulty(
  @Param('difficulty') difficulty: DifficultyLevelEnum,
) {
  return this.modulesService.findByDifficulty(difficulty);
}

// @Get(':id') debe ir DESPUÉS
```

```bash
# Archivo 2
nano apps/backend/src/modules/social/controllers/classrooms.controller.ts
```

```typescript
// Similar fix para /classrooms/code/:code
// Debe ir ANTES de @Get(':id')
```

**Archivo de referencia:** REPORTE-FINAL líneas 426-447

---

#### 3. Habilitar Guards de Autenticación ⏰ 15 minutos
**Problema:** Endpoints críticos sin autenticación
**Impacto:** Riesgo de seguridad

**Acciones:**
```bash
# Archivo 1
nano apps/backend/src/modules/gamification/controllers/user-stats.controller.ts

# Descomentar en todas las rutas:
@UseGuards(JwtAuthGuard)

# Archivo 2
nano apps/backend/src/modules/gamification/controllers/achievements.controller.ts

# Descomentar:
@UseGuards(JwtAuthGuard)
```

**Archivo de referencia:** REPORTE-FINAL líneas 449-458

---

#### 4. Implementar Token Refresh ⏰ 2-3 horas
**Problema:** Usuarios deben re-login al expirar token
**Impacto:** UX crítico

**Acciones:**
```bash
nano apps/backend/src/modules/auth/controllers/auth.controller.ts
```

```typescript
@Post('refresh')
@ApiOperation({ summary: 'Refresh access token' })
@ApiBody({ type: RefreshTokenDto })
@ApiResponse({
  status: 200,
  description: 'Token refreshed successfully',
  type: LoginResponseDto
})
async refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
  return this.sessionService.refreshToken(dto.refresh_token);
}
```

**Crear DTO:**
```bash
nano apps/backend/src/modules/auth/dto/refresh-token.dto.ts
```

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
```

**Implementar en SessionManagementService:**
```bash
nano apps/backend/src/modules/auth/services/session-management.service.ts
```

**Archivo de referencia:** REPORTE-FINAL líneas 460-475

---

### 🟠 P1 - ALTOS (Próximas 2 Semanas)

#### 5. Crear UserStats Interface en Frontend ⏰ 2 horas
**Problema:** Gamification features sin tipos
**Impacto:** Crítico para UI de gamificación

**Acciones:**
```bash
cd apps/frontend/src/shared/types
touch gamification.types.ts
```

```typescript
export interface UserStats {
  id: string;
  user_id: string;
  tenant_id?: string;

  // Level & XP
  level: number;
  total_xp: number;
  xp_to_next_level: number;

  // Rank System
  current_rank: MayaRank;
  rank_progress: number;

  // ML Coins
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  ml_coins_earned_today: number;
  last_ml_coins_reset?: string;

  // Streaks
  current_streak: number;
  max_streak: number;
  streak_started_at?: string;
  days_active_total: number;

  // Progress
  exercises_completed: number;
  modules_completed: number;
  total_score: number;
  average_score: number;
  perfect_scores: number;

  // Achievements
  achievements_earned: number;
  certificates_earned: number;

  // Time
  total_time_spent: string;  // interval PostgreSQL
  weekly_time_spent: string;
  sessions_count: number;

  // Rankings
  global_rank_position?: number;
  class_rank_position?: number;
  school_rank_position?: number;

  // Activity
  last_activity_at: string;
  last_login_at: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

export type MayaRank = 'ajaw' | 'nacom' | 'ah_kin' | 'halach_uinic' | 'kukul_kan';
```

**Actualizar imports:**
```typescript
// En components que usan UserStats
import { UserStats } from '@/shared/types/gamification.types';
```

**Archivo de referencia:** REPORTE-FINAL líneas 477-532

---

#### 6. Completar Module Interface ⏰ 1.5 horas
**Problema:** 69% de propiedades faltantes
**Impacto:** Módulos sin metadata

**Acciones:**
```bash
nano apps/frontend/src/shared/types/educational.types.ts
```

**Agregar 31 propiedades:**
```typescript
export interface Module {
  // Existentes...
  id: string;
  title: string;
  description: string;
  // ...

  // NUEVAS (31 propiedades):
  xp_reward: number;
  ml_coins_reward: number;
  grade_levels: string[];
  subjects: string[];
  competencies: string[];
  maya_rank_required: MayaRank;
  maya_rank_granted: MayaRank;
  version: number;
  version_notes?: string;
  created_by: string;
  reviewed_by?: string;
  status: ModuleStatus;
  is_featured: boolean;
  is_free: boolean;
  is_demo_module: boolean;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  total_exercises: number;
  // ...resto
}

export type ModuleStatus = 'draft' | 'published' | 'archived';
```

**Archivo de referencia:** REPORTE-FINAL líneas 534-556

---

#### 7. Fix ExerciseType Mismatch Frontend ⏰ 1-2 horas
**Problema:** Frontend solo define 6 tipos, DB tiene 27+
**Impacto:** 21+ tipos no renderizables

**Acciones:**
```bash
nano apps/frontend/src/shared/types/educational.types.ts
```

```typescript
export enum ExerciseType {
  // Análisis & Comprensión
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  SOPA_LETRAS = 'sopa_letras',
  MAPA_CONCEPTUAL = 'mapa_conceptual',
  EMPAREJAMIENTO = 'emparejamiento',

  // Pensamiento Crítico
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',

  // Debate & Argumentación
  TRIBUNAL_OPINIONES = 'tribunal_opiniones',
  DEBATE_DIGITAL = 'debate_digital',
  ANALISIS_FUENTES = 'analisis_fuentes',
  PODCAST_ARGUMENTATIVO = 'podcast_argumentativo',
  MATRIZ_PERSPECTIVAS = 'matriz_perspectivas',

  // Competencia Digital
  VERIFICADOR_FAKE_NEWS = 'verificador_fake_news',
  INFOGRAFIA_INTERACTIVA = 'infografia_interactiva',
  QUIZ_TIKTOK = 'quiz_tiktok',
  NAVEGACION_HIPERTEXTUAL = 'navegacion_hipertextual',
  ANALISIS_MEMES = 'analisis_memes',

  // Producción Creativa
  DIARIO_MULTIMEDIA = 'diario_multimedia',
  COMIC_DIGITAL = 'comic_digital',
  VIDEO_CARTA = 'video_carta',
  COMPRENSION_AUDITIVA = 'comprension_auditiva',
  COLLAGE_PRENSA = 'collage_prensa',
  TEXTO_MOVIMIENTO = 'texto_movimiento',
  CALL_TO_ACTION = 'call_to_action',

  // Tradicionales
  VERDADERO_FALSO = 'verdadero_falso',
  COMPLETAR_ESPACIOS = 'completar_espacios',
  DIARIO_INTERACTIVO = 'diario_interactivo',
  RESUMEN_VISUAL = 'resumen_visual'
}
```

**Actualizar rendering logic:**
```bash
nano apps/frontend/src/components/exercises/ExerciseRenderer.tsx
```

```typescript
function renderExercise(type: ExerciseType) {
  switch (type) {
    case ExerciseType.CRUCIGRAMA:
      return <CrucigramaExercise />;
    case ExerciseType.DETECTIVE_TEXTUAL:
      return <DetectiveTextualExercise />;
    // ... 27+ cases
    default:
      return <UnsupportedExerciseType type={type} />;
  }
}
```

**Archivo de referencia:** REPORTE-FINAL líneas 558-603

---

## 📊 RESUMEN DE PRIORIDADES

```
┌─────────────────────────────────────────────────────────────┐
│ TAREAS INMEDIATAS                                           │
├─────────────────────────────────────────────────────────────┤
│ P0 (Esta Semana):                                           │
│   1. Sincronizar Enums DB           [2-3h]  🔴 BLOQUEADOR  │
│   2. Fix Route Order Conflicts      [30m]   🔴 BLOQUEADOR  │
│   3. Habilitar Guards               [15m]   🔴 SEGURIDAD   │
│   4. Implementar Token Refresh      [2-3h]  🔴 UX          │
│   TOTAL P0:                         6-7 horas               │
│                                                              │
│ P1 (Próximas 2 Semanas):                                    │
│   5. UserStats Interface            [2h]    🟠 CRÍTICO     │
│   6. Module Interface               [1.5h]  🟠 CRÍTICO     │
│   7. ExerciseType Mismatch          [1-2h]  🟠 CRÍTICO     │
│   TOTAL P1 (parcial):               4.5-5.5 horas          │
│                                                              │
│ TOTAL ESTA ITERACIÓN:               10.5-12.5 horas        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS DE REFERENCIA

**Reporte Principal:**
- `.claude/orchestration/05-validaciones/documentacion/reportes/REPORTE-FINAL-VALIDACION-INTEGRAL-2025-11-04.md`

**Reportes de Agentes:**
- `AGENTE-2-RESUMEN-VALIDACION-COHERENCIA.md` (Backend→Frontend)
- `AGENTE-3-RESUMEN-EJECUTIVO.md` (API Routes)
- `AGENTE-7-RESUMEN-EJECUTIVO.md` (E2E Contracts)
- `AGENTE_6_FINAL_REPORT.md` (System Configuration Plan)

**Estado del Sistema:**
- `.claude/orchestration/ESTADO-INTEGRATION.json`
- `.claude/orchestration/05-validaciones/_MAP.md`

---

## ✅ CRITERIOS DE ÉXITO

**Post P0:**
- ✅ Enums sincronizados, INSERT de ejercicios funciona
- ✅ Rutas específicas accesibles (difficulty, code)
- ✅ Endpoints críticos autenticados
- ✅ Token refresh implementado

**Post P1:**
- ✅ UserStats completamente tipado en frontend
- ✅ Module interface con 45 propiedades
- ✅ ExerciseType enum completo (27+ tipos)
- ✅ Type safety mejorado: 62% → 80%+

---

**Generado:** 2025-11-04 18:30:00
**Agente:** NEXUS-INTEGRATION
**Validación:** VAL-002 (7 Agentes)
