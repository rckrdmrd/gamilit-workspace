# F1: ANALISIS INICIAL - TAREA-002 EDUCATIONAL_CONTENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-002 |
| **Modulo** | educational_content + content_management |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial del modulo de contenido educativo para identificar alcance, archivos y dependencias antes del analisis detallado (F2).

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Capa

| Capa | Objetos | Estado |
|------|---------|--------|
| **Base de Datos** | 17 tablas, 34+ funciones, 6 triggers, 6 RLS, 40+ indices | Produccion |
| **Backend** | 14 entities, 9 services, 10 controllers, 37+ DTOs | Produccion |
| **Frontend** | 8+ types, 7+ API calls, 3 stores, 4+ hooks, 10+ components | Produccion |

### 2.2 Puntos de Integracion Criticos

| Integracion | Estado | Notas |
|-------------|--------|-------|
| DDL → Entity | Por validar | 17 tablas vs 14 entities |
| Entity → DTO | Por validar | Sanitizacion de solutions |
| DTO → Type | Por validar | ExerciseType alignment |
| API Routes | Por validar | CRUD + submission endpoints |

---

## 3. CAPA 1: BASE DE DATOS (Schema educational_content)

### 3.1 Tablas (17 Activas)

| # | Tabla | Columnas | FKs | Proposito |
|---|-------|----------|-----|-----------|
| 1 | modules | 15+ | 4 | 5 modulos educativos (Literal→Creativo) |
| 2 | exercises | 20+ | 3 | 27+ mecanicas de ejercicios |
| 3 | assessment_rubrics | 12+ | 3 | Rubricas polimorfa (exercise OR module) |
| 4 | media_resources | 18+ | 2 | Assets multimedia |
| 5 | media_attachments | 12+ | 3 | Uploads creativos (Mod 4-5) |
| 6 | assignments | 15+ | 1 | Tareas asignadas por maestros |
| 7 | assignment_exercises | 5 | 2 | M:M exercises en assignments |
| 8 | assignment_students | 3 | 2 | M:M students en assignments |
| 9 | assignment_submissions | 10+ | 2 | Entregas de students |
| 10 | difficulty_criteria | 12 | 0 | 8 niveles CEFR |
| 11 | exercise_mechanic_mapping | 15+ | 0 | 7 categorias × 31 subcategorias |
| 12 | exercise_validation_config | 8+ | 0 | Reglas por exercise_type |
| 13 | content_metadata | 5 | 0 | K-V metadata |
| 14 | content_tags | 5 | 1 | Sistema de tags |
| 15 | classroom_modules | 12+ | 3 | Modulos en classrooms |
| 16 | teacher_content | 18+ | 4 | Contenido creado por maestros |
| 17 | exercise_validation_audit | 15+ | 2 | Audit trail inmutable |

### 3.2 Funciones (34+)

**Funciones de Validacion (20+):**
- validate_answer, validate_crucigrama, validate_timeline
- validate_word_search, validate_fill_in_blank, validate_true_false
- validate_mapa_conceptual, validate_emparejamiento
- validate_detective_textual, validate_prediccion_narrativa
- validate_puzzle_contexto, validate_rueda_inferencias
- validate_tribunal_opiniones, validate_debate_digital
- validate_analisis_fuentes, validate_podcast_argumentativo
- validate_matriz_perspectivas, validate_module4_module5

**Funciones de Gestion:**
- calculate_learning_path
- get_recommended_missions
- validate_exercise_structure
- recalculate_exercise
- can_teacher_access_content

### 3.3 Triggers (6)

| Trigger | Tabla | Evento |
|---------|-------|--------|
| 00-batch_updated_at_triggers | multiple | BEFORE UPDATE |
| 15-trg_initialize_module_progress | modules | AFTER INSERT |
| update_classroom_modules_timestamp | classroom_modules | BEFORE UPDATE |
| update_teacher_content_timestamp | teacher_content | BEFORE UPDATE |
| update_assignment_submissions_updated_at | assignment_submissions | BEFORE UPDATE |
| update_assignments_updated_at | assignments | BEFORE UPDATE |

### 3.4 RLS Policies (6)

- **modules**: modules_read_published, modules_read_teacher, modules_manage_admin
- **exercises**: exercises_read_active, exercises_read_teacher, exercises_manage_admin

### 3.5 Enums (6)

| Enum | Valores |
|------|---------|
| exercise_type | 27 tipos (completar_espacios, crucigrama, emparejamiento, ...) |
| difficulty_level | 8 niveles (beginner → native) |
| module_status | draft, pending_review, published, archived |
| bloom_taxonomy | recordar, comprender, aplicar, analizar, evaluar, crear |

### 3.6 Dependencias Externas

| Schema Externo | Relacion |
|----------------|----------|
| auth_management | profiles (created_by, reviewed_by, approved_by) |
| auth_management | tenants (multi-tenancy) |
| progress_tracking | exercise_submissions |
| social_features | classrooms |
| gamification_system | maya_rank, comodin_type (weak refs) |

---

## 4. CAPA 2: BACKEND (Modulos educational + content)

### 4.1 Entities Educational (9)

| Entity | Tabla DDL | Columnas | Relaciones |
|--------|-----------|----------|------------|
| Module | modules | 15+ | Prerequisites[], Exercises |
| Exercise | exercises | 20+ | ManyToOne Module, Config JSONB |
| AssessmentRubric | assessment_rubrics | 12+ | Polymorphic exercise/module |
| MediaResource | media_resources | 18+ | Processing status |
| MediaAttachment | media_attachments | 12+ | Submissions Mod 4-5 |
| ExerciseMechanicMapping | exercise_mechanic_mapping | 15+ | Bloom + CEFR |
| ContentApproval | content_approvals | 10+ | Workflow draft→published |
| DifficultyCriteria | difficulty_criteria | 12 | 8 CEFR levels |
| ClassroomModule | classroom_modules | 12+ | Module → Classroom |

### 4.2 Entities Content (5)

| Entity | Tabla DDL | Columnas | Relaciones |
|--------|-----------|----------|------------|
| MarieCurieContent | (content_management) | 20+ | Content JSONB |
| ContentAuthor | (content_management) | 12+ | User profiles |
| ContentCategory | (content_management) | 10+ | Self-referential |
| ContentTemplate | (content_management) | 10+ | Templates |
| MediaFile | (content_management) | 8+ | File metadata |

### 4.3 Services (9)

| Service | Metodos | Responsabilidad |
|---------|---------|-----------------|
| ModulesService | 7 | CRUD modules, prerequisites |
| ExercisesService | 10 | CRUD + validation + sanitization |
| MediaService | 8 | Media CRUD + processing status |
| MediaStorageService | 5 | File upload/storage |
| MarieCurieContentService | 6+ | CRUD Marie Curie content |
| ContentAuthorsService | 6+ | Author profiles |
| ContentCategoriesService | 5+ | Categories hierarchy |
| ContentTemplatesService | 4+ | Templates CRUD |
| MediaFilesService | 4+ | Media files CRUD |

### 4.4 Controllers (10)

| Controller | Endpoints | Base Path |
|------------|-----------|-----------|
| ExercisesController | 9 | /api/v1/educational/exercises |
| ModulesController | 7 | /api/v1/educational/modules |
| MediaController | 6 | /api/v1/educational/media |
| MediaUploadController | 2 | /api/v1/educational/media/upload |
| MarieCurieContentController | 8 | /api/v1/content/marie-curie |
| ContentAuthorsController | 5 | /api/v1/content/authors |
| ContentCategoriesController | 6 | /api/v1/content/categories |
| ContentTemplatesController | 5 | /api/v1/content/templates |
| MediaFilesController | 5 | /api/v1/content/media-files |
| (RubricsController) | TBD | /api/v1/educational/rubrics |

### 4.5 DTOs (37+)

**Exercises DTOs:**
- CreateExerciseDto (350 lines)
- ExerciseResponseDto
- SubmitExerciseDto
- SubmitExerciseResponseDto

**Modules DTOs:**
- CreateModuleDto (365 lines)
- ModuleResponseDto
- GetModulesQueryDto

**Media DTOs:**
- UploadMediaDto
- MediaResponseDto

**Module-Specific Answer DTOs (Mod 4-5):**
- AnalisisMememesAnswerDto
- InfografiaInteractivaAnswerDto
- VerificadorFakeNewsAnswerDto
- NavegacionHipertextualAnswerDto
- QuizTiktokAnswerDto
- ComicDigitalAnswerDto
- DiarioMultimediaAnswerDto
- VideoCartaAnswerDto

**Content DTOs:**
- CreateMarieCurieContentDto
- CreateContentAuthorDto, UpdateContentAuthorDto
- CreateContentCategoryDto, UpdateContentCategoryDto
- CreateContentTemplateDto
- CreateMediaFileDto

---

## 5. CAPA 3: FRONTEND (Features exercises, content, progress)

### 5.1 Types (8+)

| Type | Origen | Proposito |
|------|--------|-----------|
| ExerciseDifficulty | Enum | 8 niveles CEFR |
| ExerciseType | Enum | 27+ mecanicas |
| SubmissionStatus | Enum | pending/correct/incorrect/partial |
| Exercise | Interface | Metadata ejercicio |
| ExerciseContent | Interface | Content JSONB |
| ExerciseHint | Interface | Hints con costo |
| ExerciseSubmission | Interface | Request submission |
| ExerciseSubmissionResult | Interface | Response con rewards |

### 5.2 API Functions (7+)

| Funcion | Endpoint Backend |
|---------|------------------|
| getModules | GET /api/v1/educational/modules |
| getModule | GET /api/v1/educational/modules/:id |
| getModuleExercises | GET /api/v1/educational/modules/:id/exercises |
| getAllExercises | GET /api/v1/educational/exercises |
| getExercise | GET /api/v1/educational/exercises/:id |
| submitExercise | POST /progress/submissions/submit |
| getUserProgressOverview | GET /progress/overview |

### 5.3 Stores (Zustand) - 3

| Store | State | Responsabilidad |
|-------|-------|-----------------|
| economyStore | balance, transactions, inventory | ML Coins economia |
| ranksStore | userProgress, xpEvents | Rangos Maya + XP |
| powerUpsStore | powerUps, inventory | Comodines |

### 5.4 Hooks (4+)

| Hook | Proposito |
|------|-----------|
| useExerciseSubmission | Submit answers, invalidate cache |
| useExerciseTimer | Timer con time limit |
| useExerciseRewards | XP/Coins + penalties hints |
| useExerciseState | Local state + auto-save |

### 5.5 Components (10+)

**Core Activities:**
- MultipleChoiceActivity
- TrueFalseActivity
- FillBlankActivity
- DragDropActivity
- OrderingActivity
- MatchingActivity

**Shared:**
- ExerciseHeader
- ExerciseFeedback
- ExerciseGuide
- UnderConstructionExercise

**Student Components:**
- CompletionModal
- HintModal
- PowerUpEffects
- ExerciseSidebar

---

## 6. MATRIZ DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                  DEPENDENCIAS EDUCATIONAL_CONTENT                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   TABLAS INTERNAS:                                                  │
│   modules ──┬─> exercises (1:N, CASCADE)                            │
│             ├─> assessment_rubrics (polymorphic)                    │
│             ├─> classroom_modules (1:N)                             │
│             └─> module_dependencies (self-ref)                      │
│                                                                      │
│   exercises ──┬─> exercise_mechanic_mapping (N:M)                   │
│               ├─> media_attachments (1:N)                           │
│               ├─> exercise_validation_audit (1:N)                   │
│               └─> assessment_rubrics (polymorphic)                  │
│                                                                      │
│   assignments ──┬─> assignment_exercises (1:N)                      │
│                 ├─> assignment_students (1:N)                       │
│                 └─> assignment_submissions (1:N)                    │
│                                                                      │
│   DEPENDENCIAS EXTERNAS:                                            │
│   auth_management.profiles ←── 11 FKs (created_by, etc.)           │
│   auth_management.tenants ←── 3 FKs                                 │
│   progress_tracking.exercise_submissions ←── media_attachments      │
│   social_features.classrooms ←── classroom_modules                  │
│   gamification_system ←── weak refs (maya_rank, comodin)           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. INCONSISTENCIAS PRELIMINARES

### 7.1 Potenciales Brechas

| # | Capa | Descripcion | Severidad |
|---|------|-------------|-----------|
| 1 | DDL/Entity | 17 tablas DDL vs 14 entities | MEDIA |
| 2 | DDL/Entity | Validacion functions vs Entity | Por validar |
| 3 | Backend | ExerciseType enum alignment | Por validar |
| 4 | Frontend | 27 types vs components implementados | MEDIA |

### 7.2 Arquitectura Dual

| Tipo Ejercicio | Tabla Destino | Campo |
|----------------|---------------|-------|
| Auto-corregible | exercise_attempts | requires_manual_grading = false |
| Manual review | exercise_submissions | requires_manual_grading = true |

---

## 8. CRITERIOS DE EXITO PARA F2

- [ ] Inventario completo 17 tablas DDL vs 14 entities
- [ ] Validacion ExerciseType enum (27 valores)
- [ ] Mapeo de validation functions a backend services
- [ ] Verificacion sanitization (FE-059)
- [ ] Alignment DTOs (37+) vs Frontend Types (8+)
- [ ] Cobertura 27 mecanicas en frontend components

---

## 9. PROXIMOS PASOS

1. **F2**: Analisis detallado campo por campo
2. **F3**: Plan de correcciones priorizadas
3. **F4**: Validacion del plan
4. **F5**: Refinamiento
5. **F6**: Ejecucion
6. **F7**: Validacion final

---

## 10. ARCHIVOS RELACIONADOS

### Base de Datos
- `/apps/database/ddl/schemas/educational_content/` (71 archivos DDL)

### Backend
- `/apps/backend/src/modules/educational/`
- `/apps/backend/src/modules/content/`

### Frontend
- `/apps/frontend/src/features/exercises/`
- `/apps/frontend/src/features/content/`
- `/apps/frontend/src/features/progress/`
- `/apps/frontend/src/apps/student/pages/ExercisePage.tsx`

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F2 - Analisis Detallado
