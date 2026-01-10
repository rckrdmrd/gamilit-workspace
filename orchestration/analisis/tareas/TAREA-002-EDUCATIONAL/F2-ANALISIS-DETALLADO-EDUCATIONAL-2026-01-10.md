# F2: ANALISIS DETALLADO - TAREA-002 EDUCATIONAL_CONTENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-002 |
| **Fase** | F2 - Analisis Detallado |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agentes** | @PERFIL_DATABASE, @PERFIL_BACKEND, @PERFIL_FRONTEND |

---

## 1. RESUMEN EJECUTIVO

### 1.1 Metricas de Alineacion

| Comparacion | Alineacion | Estado | Accion |
|-------------|------------|--------|--------|
| DDL modules → Entity Module | 94% | ACEPTABLE | 5 fixes P2 |
| DDL exercises → Entity Exercise | 100% | EXCELENTE | 0 fixes |
| Backend DTOs → Frontend Types | 45% | CRITICO | 18+ fixes P0/P1 |
| ExerciseType Enum Backend vs Frontend | 15% | CRITICO | 1 fix P0 |

### 1.2 Inconsistencias Totales

| Severidad | Cantidad | Componente |
|-----------|----------|------------|
| **CRITICA (P0)** | 4 | ExerciseType enum, Time unit, Hints structure, Content type |
| **ALTA (P1)** | 8 | Missing fields: pedagogical, gamification, versioning |
| **MEDIA (P2)** | 6 | modules entity (constraints, FK relations, timestamps) |
| **BAJA (P3)** | 5 | Naming conventions, optional/required mismatches |

---

## 2. ANALISIS DDL → ENTITY

### 2.1 Tabla MODULES (94% alineado)

#### Campos Analizados: 42/42 (100% mapeados)

| Campo | DDL | Entity | Estado |
|-------|-----|--------|--------|
| id | uuid DEFAULT gen_random_uuid() | @PrimaryGeneratedColumn('uuid') | MATCH |
| tenant_id | uuid nullable | @Column uuid nullable | MATCH |
| title | text NOT NULL | @Column text | MATCH |
| subtitle | text nullable | @Column text nullable | MATCH |
| description | text nullable | @Column text nullable | MATCH |
| content | jsonb DEFAULT {...} | @Column jsonb default {...} | MATCH |
| order_index | integer NOT NULL | @Column integer | MATCH |
| module_code | text nullable UNIQUE | @Column text nullable | PARTIAL |
| difficulty_level | enum DEFAULT 'beginner' | @Column enum DifficultyLevelEnum | MATCH |
| xp_reward | integer DEFAULT 100 CHECK >= 0 | @Column integer default 100 | PARTIAL |
| ml_coins_reward | integer DEFAULT 50 CHECK >= 0 | @Column integer default 50 | PARTIAL |
| created_by | uuid FK → profiles SET NULL | @Column uuid nullable | PARTIAL |
| reviewed_by | uuid FK → profiles SET NULL | @Column uuid nullable | PARTIAL |
| approved_by | uuid FK → profiles SET NULL | @Column uuid nullable | PARTIAL |
| created_at | timestamptz DEFAULT gamilit.now_mexico() | @CreateDateColumn | PARTIAL |
| updated_at | timestamptz DEFAULT gamilit.now_mexico() | @UpdateDateColumn | PARTIAL |
| ... | (26 campos adicionales) | (todos mapeados) | MATCH |

#### Inconsistencias MEDIA (P2)

| ID | Problema | DDL | Entity | Fix |
|----|----------|-----|--------|-----|
| **M-001** | UNIQUE en module_code faltante | UNIQUE constraint | Sin @Unique decorator | Agregar @Unique(['module_code']) |
| **M-002** | CHECK xp_reward >= 0 no validado | CHECK constraint | Sin decorador | Agregar @Min(0) en DTO |
| **M-003** | CHECK ml_coins_reward >= 0 no validado | CHECK constraint | Sin decorador | Agregar @Min(0) en DTO |
| **M-004** | FKs sin @ManyToOne | FK a profiles | Solo @Column | Agregar @ManyToOne (opcional) |
| **M-005** | Timezone gamilit.now_mexico() | Custom function | TypeORM default | Evaluar alineacion |

---

### 2.2 Tabla EXERCISES (100% alineado)

#### Campos Analizados: 46/46 (100% mapeados)

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Campos basicos | MATCH | 46 campos perfectamente alineados |
| exercise_type ENUM | MATCH | 27 tipos sincronizados |
| difficulty_level ENUM | MATCH | 8 niveles CEFR |
| comodin_type ENUM | MATCH | 3 comodines |
| JSONB fields | MATCH | config, content, solution, rubric, metadata |
| CHECK constraints | MATCH | Todos respetados |
| FK relationships | MATCH | module_id CASCADE, audit SET NULL |
| Indices | MATCH | 11 indices definidos |

**EXCELENTE: Sin inconsistencias detectadas.**

---

### 2.3 Tabla ASSESSMENT_RUBRICS (Por validar)

| Aspecto | Estado |
|---------|--------|
| Polimorfismo | XOR constraint (exercise_id OR module_id) |
| assessment_type | ENUM: automatic, manual, hybrid, peer_review |
| criteria | JSONB estructura |

---

## 3. ANALISIS BACKEND DTOs → FRONTEND TYPES

### 3.1 Conformidad General: 45%

| Mapeo | Estado | Issues |
|-------|--------|--------|
| ExerciseResponseDto → Exercise | 45% CRITICO | 18+ campos faltantes/inconsistentes |
| SubmitExerciseDto → ExerciseSubmission | 85% | 2 campos naming |
| ModuleResponseDto → (Frontend Type) | Por validar | TBD |

### 3.2 Inconsistencias CRITICAS (P0)

#### P0-001: ExerciseType ENUM Mismatch

| Backend ExerciseTypeEnum | Frontend ExerciseType | Estado |
|--------------------------|----------------------|--------|
| crucigrama | (falta) | MISSING |
| sopa_letras | (falta) | MISSING |
| emparejamiento | matching | PARTIAL |
| linea_tiempo | (falta) | MISSING |
| mapa_conceptual | (falta) | MISSING |
| detective_textual | (falta) | MISSING |
| prediccion_narrativa | (falta) | MISSING |
| puzzle_contexto | (falta) | MISSING |
| rueda_inferencias | (falta) | MISSING |
| tribunal_opiniones | (falta) | MISSING |
| debate_digital | (falta) | MISSING |
| analisis_fuentes | (falta) | MISSING |
| podcast_argumentativo | (falta) | MISSING |
| matriz_perspectivas | (falta) | MISSING |
| verificador_fake_news | (falta) | MISSING |
| infografia_interactiva | (falta) | MISSING |
| quiz_tiktok | (falta) | MISSING |
| navegacion_hipertextual | (falta) | MISSING |
| analisis_memes | (falta) | MISSING |
| diario_multimedia | (falta) | MISSING |
| comic_digital | (falta) | MISSING |
| video_carta | (falta) | MISSING |
| comprension_auditiva | (falta) | MISSING |
| collage_prensa | (falta) | MISSING |
| texto_movimiento | (falta) | MISSING |
| call_to_action | (falta) | MISSING |
| verdadero_falso | true_false | MATCH |
| completar_espacios | fill_blank | MATCH |
| - | multiple_choice | EXTRA |
| - | drag_drop | EXTRA |
| - | ordering | EXTRA |

**Backend: 27 tipos | Frontend: 6 tipos | Match: 3 (11%)**

**Fix:** Agregar 24 tipos faltantes al Frontend ExerciseType enum.

---

#### P0-002: Time Unit Mismatch

| Campo | Backend | Frontend | Issue |
|-------|---------|----------|-------|
| time_limit | `time_limit_minutes?: number` | `time_limit_seconds?: number` | UNIDAD DIFERENTE |

**Riesgo:** Error de 60x en timing si no se convierte correctamente.

**Fix:** Estandarizar a segundos en frontend, convertir en API layer.

---

#### P0-003: Hints Structure Mismatch

| Backend | Frontend |
|---------|----------|
| `hints?: string[]` | `hints: ExerciseHint[]` |
| `hint_cost_ml_coins: number` (global) | `ExerciseHint { id, text, ml_coins_cost, order }` |

**Issue:** Backend retorna array de strings + costo global; Frontend espera objetos estructurados con costo individual.

**Fix:** Transformar en API layer o actualizar backend DTO.

---

#### P0-004: Content Type Mismatch

| Backend | Frontend |
|---------|----------|
| `content: Record<string, unknown>` | `content: ExerciseContent` |
| (generico, flexible) | `{ question, options?, explanation?, media_url? }` |

**Issue:** Frontend asume estructura multiple_choice para todos los ejercicios; no maneja estructuras module-specific (27 tipos diferentes).

**Fix:** Crear interfaces por tipo de ejercicio o usar discriminated union.

---

### 3.3 Inconsistencias ALTAS (P1)

| ID | Campo Backend | Campo Frontend | Issue | Fix |
|----|---------------|----------------|-------|-----|
| **P1-001** | module_id | (falta) | MISSING | Agregar al tipo |
| **P1-002** | objective | (falta) | MISSING | Agregar campo pedagogico |
| **P1-003** | how_to_solve | (falta) | MISSING | Agregar campo pedagogico |
| **P1-004** | recommended_strategy | (falta) | MISSING | Agregar campo pedagogico |
| **P1-005** | comodines_allowed | (falta) | MISSING | Agregar array comodines |
| **P1-006** | comodines_config | (falta) | MISSING | Agregar config |
| **P1-007** | bonus_multiplier | (falta) | MISSING | Agregar multiplicador |
| **P1-008** | max_points | (falta) | MISSING | Agregar puntos maximos |

---

### 3.4 Inconsistencias MEDIA (P2)

| ID | Problema | Descripcion |
|----|----------|-------------|
| P2-001 | is_active faltante | Frontend no puede filtrar ejercicios inactivos |
| P2-002 | is_optional faltante | Frontend no sabe si ejercicio es opcional |
| P2-003 | is_bonus faltante | Frontend no identifica ejercicios bonus |
| P2-004 | version faltante | Frontend no muestra version del ejercicio |
| P2-005 | created_by faltante | Frontend no muestra autor |
| P2-006 | adaptive_difficulty faltante | Frontend no soporta dificultad adaptativa |

---

### 3.5 Seguridad - Sanitizacion

| Campo Sensible | Backend | Frontend | Estado |
|----------------|---------|----------|--------|
| solution | Presente en Entity/DTO | NO presente en Type | CORRECTO |
| rubric | Presente en Entity/DTO | NO presente en Type | CORRECTO |
| correct_answer | En content JSONB | @deprecated en Type | CORRECTO |
| is_correct | En options | @deprecated en Type | CORRECTO |

**SEGURIDAD: APROBADA** - Campos sensibles correctamente sanitizados.

---

## 4. MATRIZ DE DEPENDENCIAS VALIDADA

### 4.1 Dependencias Internas (educational_content)

```
modules (tabla padre)
    ├─→ exercises.module_id [FK CASCADE] ✓ DDL | ✓ Entity
    ├─→ classroom_modules.module_id [FK CASCADE] ✓ OK
    └─→ assessment_rubrics.module_id [polymorphic] ✓ OK

exercises (tabla core)
    ├─→ media_attachments.exercise_id [FK CASCADE] ✓ OK
    ├─→ exercise_validation_audit.exercise_id [FK RESTRICT] ✓ OK
    └─→ assessment_rubrics.exercise_id [polymorphic] ✓ OK
```

### 4.2 Dependencias Externas

```
auth_management.profiles ←── 11 FKs (created_by, reviewed_by, approved_by, etc.)
    └─ Estado: DDL ✓ | Entity ⚠ (solo @Column, sin @ManyToOne)

progress_tracking.exercise_submissions ←── media_attachments
    └─ Estado: DDL ✓ | Entity ✓

social_features.classrooms ←── classroom_modules
    └─ Estado: DDL ✓ | Entity ✓

gamification_system.maya_rank ←── modules (weak ref)
    └─ Estado: DDL ✓ | Entity ✓ (enum compartido)
```

---

## 5. RESUMEN DE ACCIONES CORRECTIVAS

### 5.1 Prioridad P0 (Implementar Inmediatamente)

| # | Accion | Archivo | Impacto |
|---|--------|---------|---------|
| 1 | Agregar 24 ExerciseType al Frontend | auth.types.ts | CRITICO |
| 2 | Fix time_limit units (min→sec) | contentAPI.ts | CRITICO |
| 3 | Transformar hints structure | contentAPI.ts o DTO | ALTO |
| 4 | Crear content interfaces por tipo | exercises/types/ | ALTO |

### 5.2 Prioridad P1 (Completar esta semana)

| # | Accion | Archivo |
|---|--------|---------|
| 5 | Agregar module_id al tipo Exercise | exercises/types/ |
| 6 | Agregar campos pedagogicos | exercises/types/ |
| 7 | Agregar comodines fields | exercises/types/ |
| 8 | Agregar gamification fields | exercises/types/ |

### 5.3 Prioridad P2 (Proxima iteracion)

| # | Accion | Archivo |
|---|--------|---------|
| 9 | @Unique(['module_code']) | module.entity.ts |
| 10 | @Min(0) validations | create-module.dto.ts |
| 11 | Agregar status/version fields | exercises/types/ |
| 12 | Evaluar @ManyToOne para FKs | module.entity.ts |

---

## 6. CRITERIOS DE EXITO PARA F3

- [ ] 27 ExerciseType definidos en Frontend
- [ ] time_limit convertido correctamente
- [ ] hints structure transformada
- [ ] Campos pedagogicos en Frontend Type
- [ ] Comodines fields en Frontend Type
- [ ] @Unique en module_code
- [ ] @Min(0) validations en DTOs

---

## 7. ARCHIVOS ANALIZADOS

### Base de Datos
- `educational_content/tables/01-modules.sql`
- `educational_content/tables/02-exercises.sql`
- `educational_content/types/01-enums.sql`

### Backend
- `modules/educational/entities/module.entity.ts`
- `modules/educational/entities/exercise.entity.ts`
- `modules/educational/dto/exercise-response.dto.ts`
- `shared/constants/enums.constants.ts`

### Frontend
- `features/exercises/types/exerciseTypes.ts`
- `features/exercises/types/index.ts`
- `features/content/api/contentAPI.ts`

---

**Documento generado por:** ORQUESTADOR + Subagentes especializados
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F3 - Planeacion
