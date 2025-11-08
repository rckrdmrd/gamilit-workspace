# Tipos Compartidos - Módulos Educativos

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Educational Content - Modules & Exercises
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.1 (Aliases removidos, tipos sincronizados con DDL)
**Fecha:** 2025-11-07

---

## Descripción

Este archivo contiene los tipos relacionados con módulos educativos y ejercicios:
- **Module**: Entidad de módulo educativo con configuración completa
- **Exercise**: Entidad de ejercicio con 35 mecánicas diferentes
- **ExerciseType**: Enumeración de tipos de ejercicios (35 valores canónicos sincronizados con DDL)
- **ExerciseConfig**: Configuración de ejercicios
- **ExerciseContent**: Contenido del ejercicio
- **ComodinType**: Tipos de power-ups/comodines
- **ComodinesConfig**: Configuración de comodines

---

## ⚠️ IMPORTANTE: Nombres Canónicos vs Aliases

**SOLO use los nombres canónicos definidos en la base de datos.** Las siguientes variantes son **aliases legacy que NO deben usarse**:

| ❌ Alias Legacy (NO USAR) | ✅ Nombre Canónico (USAR) | Módulo |
|---------------------------|---------------------------|---------|
| `crucigrama_cientifico` | `crucigrama` | Módulo 1 |
| `timeline` | `linea_tiempo` | Módulo 1 |
| `fake_news` | `verificador_fake_news` | Módulo 4 |
| `verificador_fakenews` | `verificador_fake_news` | Módulo 4 |

**Razón:** La base de datos PostgreSQL define un único ENUM `educational_content.exercise_type` con 35 valores canónicos. Usar aliases causará errores de validación y fallos en runtime.

**Referencia DDL:** `/apps/database/ddl/00-prerequisites.sql` (líneas 80-96)

---

### 6.3 Educational Types

#### 6.3.1 Module

**Description**: Educational module entity

**TypeScript Definition**:
```typescript
interface Module {
  id: string;
  tenant_id?: string;

  // Basic Info
  title: string;
  subtitle?: string;
  description: string;
  summary?: string;

  // Module Organization
  order_index: number;
  module_code?: string;

  // Academic Configuration
  difficulty_level?: DifficultyLevel;
  grade_levels?: string[];
  subjects?: string[];
  estimated_duration_minutes?: number;
  estimated_sessions?: number;

  // Learning Objectives
  learning_objectives?: string[];
  competencies?: string[];
  skills_developed?: string[];

  // Prerequisites
  prerequisites?: string[];
  prerequisite_skills?: string[];

  // Gamification
  rango_maya_required?: MayaRank;
  rango_maya_granted?: MayaRank;
  xp_reward?: number;
  ml_coins_reward?: number;

  // Publishing
  status?: ContentStatus;
  is_published?: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  is_demo_module?: boolean;
  published_at?: string;
  archived_at?: string;

  // Search & Discovery
  keywords?: string[];
  tags?: string[];
  thumbnail_url?: string;
  cover_image_url?: string;

  // Configuration
  settings?: ModuleSettings;
  metadata?: Record<string, any>;

  // Client-side computed
  progress?: number;
  exercises_count?: number;
  completed_exercises?: number;
  is_locked?: boolean;
  can_access?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface ModuleSettings {
  allow_skip?: boolean;
  sequential_completion?: boolean;
  adaptive_difficulty?: boolean;
  show_progress?: boolean;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const moduleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1),
  summary: z.string().max(500).optional(),
  order_index: z.number().int().min(0),
  module_code: z.string().optional(),
  difficulty_level: z.enum(['very_easy', 'easy', 'beginner', 'intermediate', 'medium', 'advanced', 'hard', 'very_hard']).optional(),
  grade_levels: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  estimated_sessions: z.number().int().positive().optional(),
  learning_objectives: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  skills_developed: z.array(z.string()).optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
  prerequisite_skills: z.array(z.string()).optional(),
  rango_maya_required: z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']).optional(),
  rango_maya_granted: z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']).optional(),
  xp_reward: z.number().int().min(0).optional(),
  ml_coins_reward: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_free: z.boolean().optional(),
  is_demo_module: z.boolean().optional(),
  published_at: z.string().datetime().optional(),
  archived_at: z.string().datetime().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  thumbnail_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  progress: z.number().min(0).max(100).optional(),
  exercises_count: z.number().int().min(0).optional(),
  completed_exercises: z.number().int().min(0).optional(),
  is_locked: z.boolean().optional(),
  can_access: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
```

**Example Data**:
```typescript
const exampleModule: Module = {
  id: 'module-001',
  title: 'Comprensión Literal',
  subtitle: 'Fundamentos de la lectura',
  description: 'Módulo introductorio para desarrollar habilidades de comprensión literal',
  order_index: 1,
  difficulty_level: 'beginner',
  grade_levels: ['7', '8', '9'],
  subjects: ['Lengua y Literatura'],
  estimated_duration_minutes: 180,
  estimated_sessions: 6,
  learning_objectives: [
    'Identificar información explícita en textos',
    'Comprender el significado literal de las palabras'
  ],
  rango_maya_required: 'Ajaw',
  rango_maya_granted: 'Nacom',
  xp_reward: 500,
  ml_coins_reward: 100,
  is_published: true,
  thumbnail_url: 'https://cdn.glit.com/modules/comprension-literal.jpg',
  exercises_count: 10,
  completed_exercises: 0,
  progress: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z'
};
```

---

#### 6.3.2 Exercise

**Description**: Exercise entity with 35 mechanics (synchronized with educational_content.exercise_type enum)

**TypeScript Definition**:
```typescript
type ExerciseType =
  // Module 1 - Comprensión Literal (7 mecánicas)
  | 'crucigrama'
  | 'linea_tiempo'
  | 'sopa_letras'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'verdadero_falso'
  | 'completar_espacios'
  // Module 2 - Comprensión Inferencial (5 mecánicas)
  | 'detective_textual'
  | 'construccion_hipotesis'
  | 'prediccion_narrativa'
  | 'puzzle_contexto'
  | 'rueda_inferencias'
  // Module 3 - Comprensión Crítica (5 mecánicas)
  | 'tribunal_opiniones'
  | 'debate_digital'
  | 'analisis_fuentes'
  | 'podcast_argumentativo'
  | 'matriz_perspectivas'
  // Module 4 - Lectura Digital (9 mecánicas)
  | 'verificador_fake_news'
  | 'infografia_interactiva'
  | 'quiz_tiktok'
  | 'navegacion_hipertextual'
  | 'analisis_memes'
  | 'resena_critica'
  | 'chat_literario'
  | 'email_formal'
  | 'ensayo_argumentativo'
  // Module 5 - Producción Lectora (3 mecánicas)
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta'
  // Auxiliares (6 mecánicas)
  | 'comprension_auditiva'
  | 'collage_prensa'
  | 'texto_movimiento'
  | 'call_to_action'
  | 'diario_interactivo'
  | 'resumen_visual';

interface Exercise {
  id: string;
  module_id: string;

  // Basic Info
  title: string;
  subtitle?: string;
  description?: string;
  instructions?: string;

  // Exercise Type
  type: ExerciseType;
  exercise_type?: ExerciseType;
  order_index: number;

  // Configuration
  config: ExerciseConfig;

  // Content & Solution
  content: ExerciseContent;
  solution?: any;
  rubric?: any;

  // Grading
  auto_gradable?: boolean;
  difficulty_level?: DifficultyLevel;
  max_points?: number;
  passing_score?: number;

  // Time Management
  estimated_time_minutes?: number;
  time_limit_minutes?: number;

  // Attempts & Retries
  max_attempts?: number;
  allow_retry?: boolean;
  retry_delay_minutes?: number;

  // Hints & Help
  hints?: string[];
  enable_hints?: boolean;
  hint_cost_ml_coins?: number;

  // Power-ups
  comodines_allowed?: ComodinType[];
  comodines_config?: ComodinesConfig;

  // Rewards
  xp_reward?: number;
  ml_coins_reward?: number;
  bonus_multiplier?: number;

  // Status & Flags
  is_active?: boolean;
  is_optional?: boolean;
  is_bonus?: boolean;

  // Advanced Features
  adaptive_difficulty?: boolean;
  prerequisites?: string[];

  // Versioning
  version?: number;
  version_notes?: string;

  // Metadata
  metadata?: Record<string, any>;

  // Client-side computed
  completed?: boolean;
  points?: number;
  user_attempts?: number;
  best_score?: number;
  is_locked?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface ExerciseConfig {
  estimated_time_minutes?: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  allow_retry?: boolean;
  retry_delay_minutes?: number;
  hints?: string[];
  enable_hints?: boolean;
  hint_cost_ml_coins?: number;
  comodines_allowed?: ComodinType[];
  comodines_config?: ComodinesConfig;
  auto_gradable?: boolean;
  max_points?: number;
  passing_score?: number;
  xp_reward?: number;
  ml_coins_reward?: number;
  bonus_multiplier?: number;
  adaptive_difficulty?: boolean;
  prerequisites?: string[];
  [key: string]: any;
}

interface ExerciseContent {
  question?: string;
  options?: any[];
  correct_answers?: any[];
  explanations?: Record<string, string>;
  marieCurieContext?: Record<string, any>;
  resources?: any[];
  [key: string]: any;
}

type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

interface ComodinesConfig {
  pistas?: { enabled: boolean; cost: number };
  vision_lectora?: { enabled: boolean; cost: number };
  segunda_oportunidad?: { enabled: boolean; cost: number };
}
```

**Zod Schema**:
```typescript
const exerciseTypeSchema = z.enum([
  // Module 1 - Comprensión Literal (7)
  'crucigrama',
  'linea_tiempo',
  'sopa_letras',
  'mapa_conceptual',
  'emparejamiento',
  'verdadero_falso',
  'completar_espacios',
  // Module 2 - Comprensión Inferencial (5)
  'detective_textual',
  'construccion_hipotesis',
  'prediccion_narrativa',
  'puzzle_contexto',
  'rueda_inferencias',
  // Module 3 - Comprensión Crítica (5)
  'tribunal_opiniones',
  'debate_digital',
  'analisis_fuentes',
  'podcast_argumentativo',
  'matriz_perspectivas',
  // Module 4 - Lectura Digital (9)
  'verificador_fake_news',
  'infografia_interactiva',
  'quiz_tiktok',
  'navegacion_hipertextual',
  'analisis_memes',
  'resena_critica',
  'chat_literario',
  'email_formal',
  'ensayo_argumentativo',
  // Module 5 - Producción Lectora (3)
  'diario_multimedia',
  'comic_digital',
  'video_carta',
  // Auxiliares (6)
  'comprension_auditiva',
  'collage_prensa',
  'texto_movimiento',
  'call_to_action',
  'diario_interactivo',
  'resumen_visual'
]);

const comodinTypeSchema = z.enum(['pistas', 'vision_lectora', 'segunda_oportunidad']);

const exerciseSchema = z.object({
  id: z.string().uuid(),
  module_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  type: exerciseTypeSchema,
  exercise_type: exerciseTypeSchema.optional(),
  order_index: z.number().int().min(0),
  config: z.record(z.any()),
  content: z.record(z.any()),
  solution: z.any().optional(),
  rubric: z.any().optional(),
  auto_gradable: z.boolean().optional(),
  difficulty_level: z.enum(['very_easy', 'easy', 'beginner', 'intermediate', 'medium', 'advanced', 'hard', 'very_hard']).optional(),
  max_points: z.number().int().positive().optional(),
  passing_score: z.number().min(0).max(100).optional(),
  estimated_time_minutes: z.number().int().positive().optional(),
  time_limit_minutes: z.number().int().positive().optional(),
  max_attempts: z.number().int().positive().optional(),
  allow_retry: z.boolean().optional(),
  retry_delay_minutes: z.number().int().min(0).optional(),
  hints: z.array(z.string()).optional(),
  enable_hints: z.boolean().optional(),
  hint_cost_ml_coins: z.number().int().min(0).optional(),
  comodines_allowed: z.array(comodinTypeSchema).optional(),
  comodines_config: z.record(z.object({
    enabled: z.boolean(),
    cost: z.number().int().min(0)
  })).optional(),
  xp_reward: z.number().int().min(0).optional(),
  ml_coins_reward: z.number().int().min(0).optional(),
  bonus_multiplier: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
  is_optional: z.boolean().optional(),
  is_bonus: z.boolean().optional(),
  adaptive_difficulty: z.boolean().optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
  version: z.number().int().positive().optional(),
  version_notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  completed: z.boolean().optional(),
  points: z.number().optional(),
  user_attempts: z.number().int().min(0).optional(),
  best_score: z.number().min(0).max(100).optional(),
  is_locked: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
```

**Example Data**:
```typescript
const exampleExercise: Exercise = {
  id: 'exercise-001',
  module_id: 'module-001',
  title: 'Crucigrama Científico: Marie Curie',
  description: 'Completa el crucigrama sobre la vida de Marie Curie',
  instructions: 'Lee el texto y completa el crucigrama con las palabras correctas',
  type: 'crucigrama',
  order_index: 1,
  difficulty_level: 'beginner',
  estimated_time_minutes: 15,
  max_points: 100,
  passing_score: 70,
  auto_gradable: true,
  config: {
    max_attempts: 3,
    allow_retry: true,
    hints: ['La primera pista...', 'La segunda pista...'],
    enable_hints: true,
    hint_cost_ml_coins: 10,
    comodines_allowed: ['pistas', 'segunda_oportunidad'],
    xp_reward: 50,
    ml_coins_reward: 25
  },
  content: {
    text: 'Marie Curie fue una científica pionera...',
    grid: {
      rows: 10,
      cols: 10,
      cells: [/* ... */]
    },
    clues: {
      across: [
        { number: 1, clue: 'País de origen de Marie Curie', answer: 'POLONIA' }
      ],
      down: [
        { number: 1, clue: 'Elemento descubierto por Marie Curie', answer: 'POLONIO' }
      ]
    }
  },
  xp_reward: 50,
  ml_coins_reward: 25,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z'
};
```

---

#### 6.3.3 SubmitExerciseDto

**Description**: Exercise submission payload

*(Sección pendiente de documentación)*

---

## ENUMs de Módulos Educativos

### ExerciseType

**Description**: Tipos de ejercicios disponibles en la plataforma (35 mecánicas)

**TypeScript Definition**:
```typescript
type ExerciseType =
  | 'crucigrama' | 'linea_tiempo' | 'sopa_letras' | 'mapa_conceptual' | 'emparejamiento'
  | 'verdadero_falso' | 'completar_espacios'
  | 'detective_textual' | 'construccion_hipotesis' | 'prediccion_narrativa'
  | 'puzzle_contexto' | 'rueda_inferencias'
  | 'tribunal_opiniones' | 'debate_digital' | 'analisis_fuentes'
  | 'podcast_argumentativo' | 'matriz_perspectivas'
  | 'verificador_fake_news' | 'infografia_interactiva' | 'quiz_tiktok'
  | 'navegacion_hipertextual' | 'analisis_memes' | 'resena_critica'
  | 'chat_literario' | 'email_formal' | 'ensayo_argumentativo'
  | 'diario_multimedia' | 'comic_digital' | 'video_carta'
  | 'comprension_auditiva' | 'collage_prensa' | 'texto_movimiento'
  | 'call_to_action' | 'diario_interactivo' | 'resumen_visual';
```

**PostgreSQL ENUM**:
```sql
CREATE TYPE educational_content.exercise_type AS ENUM (
    -- Module 1: Comprensión Literal (7 mecánicas)
    'crucigrama', 'linea_tiempo', 'sopa_letras', 'mapa_conceptual', 'emparejamiento',
    'verdadero_falso', 'completar_espacios',
    -- Module 2: Comprensión Inferencial (5 mecánicas)
    'detective_textual', 'construccion_hipotesis', 'prediccion_narrativa',
    'puzzle_contexto', 'rueda_inferencias',
    -- Module 3: Comprensión Crítica (5 mecánicas)
    'tribunal_opiniones', 'debate_digital', 'analisis_fuentes',
    'podcast_argumentativo', 'matriz_perspectivas',
    -- Module 4: Lectura Digital (9 mecánicas)
    'verificador_fake_news', 'infografia_interactiva', 'quiz_tiktok',
    'navegacion_hipertextual', 'analisis_memes', 'resena_critica',
    'chat_literario', 'email_formal', 'ensayo_argumentativo',
    -- Module 5: Producción Lectora (3 mecánicas)
    'diario_multimedia', 'comic_digital', 'video_carta',
    -- Auxiliares (6 mecánicas)
    'comprension_auditiva', 'collage_prensa', 'texto_movimiento',
    'call_to_action', 'diario_interactivo', 'resumen_visual'
);
```

**Distribución por módulo:**
- **Módulo 1 (Comprensión Literal)**: 7 mecánicas
- **Módulo 2 (Comprensión Inferencial)**: 5 mecánicas
- **Módulo 3 (Comprensión Crítica)**: 5 mecánicas
- **Módulo 4 (Lectura Digital)**: 9 mecánicas
- **Módulo 5 (Producción Lectora)**: 3 mecánicas
- **Auxiliares**: 6 mecánicas

**Total**: 35 mecánicas interactivas

---

### ComodinType

**Description**: Tipos de power-ups disponibles para ayudar en ejercicios

**TypeScript Definition**:
```typescript
type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';
```

**PostgreSQL ENUM**:
```sql
CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',
    'vision_lectora',
    'segunda_oportunidad'
);
```

**Valores**:
- `pistas` - Revela pistas adicionales para resolver el ejercicio
- `vision_lectora` - Proporciona análisis de comprensión lectora
- `segunda_oportunidad` - Permite reintentar el ejercicio sin penalización

---

## Referencias Cruzadas

- **Database Schema**: Ver [ESQUEMA-COMPLETO.md](../../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md#14-schema-educational_content)
- **Database Inventory**: Ver [DATABASE-INVENTORY-MASTER.md](../../03-desarrollo/base-de-datos/DATABASE-INVENTORY-MASTER.md)
- **DDL Prerequisites**: Ver `/apps/database/ddl/00-prerequisites.sql` (líneas 80-96)
- **Requerimientos**: Ver [01-requerimientos/contenido-educativo/](../../01-requerimientos/contenido-educativo/)

---

**Última actualización:** 2025-11-07
**Estado:** ✅ Sincronizado con DDL (educational_content.exercise_type, gamification_system.comodin_type)
**Aliases legacy removidos:** crucigrama_cientifico, timeline, fake_news, verificador_fakenews
**Tipos agregados:** diario_interactivo, resumen_visual

---

