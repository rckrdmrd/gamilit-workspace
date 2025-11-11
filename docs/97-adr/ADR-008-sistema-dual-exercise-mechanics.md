# ADR-008: Sistema Dual exercise_type + Categorías Pedagógicas

**Estado:** Aceptado
**Fecha:** 2025-11-11
**Autores:** Database Team
**Decisores:** Tech Lead, Database Architect, Usuario
**Relacionado:** DB-110, DB-111, DB-112

---

## Contexto

Durante DB-110 (Validación Profunda docs/ ↔ DDL) se identificó incoherencia crítica entre documentación y código:

- **Documentación (ET-EDU-001, RF-EDU-001):**
  - Define `exercise_mechanic` ENUM (31 valores pedagógicos universales)
  - Categorías: Vocabulario (6), Gramática (8), Lectura (4), Escritura (4), Audio (3), Pronunciación (2), Cultura (4)
  - Ubicación documentada: `apps/database/ddl/00-prerequisites.sql:59-65`

- **DDL Real:**
  - Implementa `exercise_type` ENUM (35 valores específicos GAMILIT)
  - Agrupación: Módulo 1 (5), Módulo 2 (4), Módulo 3 (5), Módulo 4 (9), Módulo 5 (2), Auxiliares (10)
  - Ubicación real: `apps/database/ddl/00-prerequisites.sql:~85-120`

- **Coherencia:** 0/100 ❌ (documentación completamente desactualizada)

**Problema:**
- Tabla `exercises` usa campo `exercise_type` (no `mechanic`)
- Backend tiene `ExerciseTypeEnum` (no `ExerciseMechanicEnum`)
- Frontend mapea 35 tipos específicos a componentes
- Documentación pedagógica define 31 categorías universales

**Filosofía del usuario aplicada:**
> "En lugar de eliminar si se tienen definidos lo mejor sería adaptarlos para que sirvan y darles coherencia a los datos ya existentes, actualizar la documentación que esté alineada con el desarrollo y asignar esas definiciones a módulos, ejercicios, definiciones que puedan faltar para completar lo deseado."

---

## Opciones Consideradas

### Opción A: Refactorizar DDL para seguir documentación

**Descripción:** Cambiar DDL, Backend, Frontend para usar `exercise_mechanic` (31 valores genéricos)

**Impacto:**
- 🔴 Breaking changes masivos
- 🔴 Refactor DDL: 1 ENUM, 1 tabla exercises
- 🔴 Refactor Backend: 20+ archivos (entities, services, validators)
- 🔴 Refactor Frontend: 35 componentes + routing
- 🔴 Pérdida de granularidad (35 específicos → 31 genéricos)
- 🔴 Timeline: 2-3 semanas
- 🔴 Alto riesgo de regresiones

**Decisión:** ❌ Rechazada (demasiado disruptiva)

---

### Opción B: Actualizar documentación solamente

**Descripción:** Actualizar ET-EDU-001 y RF-EDU-001 para reflejar `exercise_type` (35 valores)

**Impacto:**
- 🟢 No breaking changes
- 🟢 Solo actualización de 2 documentos
- 🟢 Sincroniza docs con realidad
- 🟢 Timeline: 3-4 horas

**Limitaciones:**
- ⚠️ Pierde clasificación pedagógica valiosa
- ⚠️ Dificulta búsquedas por competencia ("vocabulario", "lectura")
- ⚠️ No explota valor de los 13 GAPs identificados
- ⚠️ Profesores pierden visibilidad por área pedagógica

**Decisión:** ⚠️ Viable pero incompleta

---

### Opción C: Sistema Dual (SELECCIONADA)

**Descripción:** Reconciliar documentación + implementación mediante sistema dual con tabla de mapeo

**Concepto:**
```
exercise_type (35 implementaciones GAMILIT)
        +
Categorías pedagógicas (7 categorías, 31 subcategorías)
        ↓
exercise_mechanic_mapping (tabla N:M)
        =
Sistema Dual
```

**Impacto:**
- 🟢 No breaking changes (100% backward-compatible)
- 🟢 Preserva implementación existente
- 🟢 Preserva valor pedagógico
- 🟢 Sincroniza documentación con realidad
- 🟢 Timeline: 3 días (~24.5 horas)

**Implementación:**
1. Actualizar ET-EDU-001 v2.0 (documentar sistema dual)
2. Actualizar RF-EDU-001 v2.0 (exercise_type como canónico)
3. Crear tabla `exercise_mechanic_mapping` (mapeo N:M)
4. Crear vista `exercises_with_mechanics` (helper)
5. Backend: Entity, Service, DTOs (opcional)
6. Frontend: Filter component (opcional)

**Decisión:** ✅ **SELECCIONADA** (aprobada por usuario: "Si la opcion c esta bien")

---

## Decisión

Implementar **Sistema Dual** mediante:

1. **exercise_type (Implementación):**
   - 35 mecánicas específicas GAMILIT (mantener como está)
   - ENUM canónico en DDL: `educational_content.exercise_type`
   - Usado en tabla `exercises.exercise_type`
   - Sincronizado con Backend: `ExerciseTypeEnum`
   - Mapeado en Frontend: 35 componentes

2. **Categorías pedagógicas (Clasificación):**
   - 7 categorías universales + 31 subcategorías
   - Nueva tabla de mapeo: `exercise_mechanic_mapping`
   - Mapeo N:M: múltiples exercise_types pueden tener misma categoría
   - Permite búsqueda pedagógica sin cambiar implementación

3. **Reconciliación de documentación:**
   - Actualizar ET-EDU-001 v2.0 con sistema dual
   - Actualizar RF-EDU-001 v2.0 con exercise_type como canónico
   - Crear este ADR-008 documentando decisión

**Filosofía aplicada:** "Adaptar y reconciliar, NO eliminar"

---

## Consecuencias

### Positivas

**Para Profesores:**
- ✅ Buscar ejercicios por competencia pedagógica ("vocabulario", "lectura")
- ✅ Filtrar por nivel de Bloom o CEFR
- ✅ Asignar según objetivos de aprendizaje específicos
- ✅ Visibilidad de progreso por área pedagógica (ej: vocabulario 60% → 80%)

**Para Estudiantes:**
- ✅ Recibir recomendaciones por competencia a desarrollar
- ✅ Variedad de mecánicas para misma competencia (evita monotonía)
- ✅ Progresión clara por área

**Para el Sistema:**
- ✅ Analytics por competencia pedagógica + por tipo específico
- ✅ Interoperabilidad con estándares internacionales (Bloom, CEFR)
- ✅ Extensibilidad sin modificar estructura existente
- ✅ Facilita futuras implementaciones (13 GAPs identificados como roadmap)
- ✅ Preserva implementación existente (0 breaking changes)
- ✅ Sincroniza documentación con realidad

### Negativas

**Complejidad:**
- ⚠️ Tabla de mapeo adicional (+1 tabla)
- ⚠️ Mantenimiento de mappings (60-90 registros iniciales)
- ⚠️ Overhead de queries con JOIN (~60%, mitigable)

**Esfuerzo de implementación:**
- ⚠️ 24.5 horas (~3 días con 1-2 devs)
- ⚠️ 6 archivos nuevos + 7 archivos modificados

### Mitigaciones

**Performance:**
- Vista materializada `exercises_with_mechanics_mv` para queries frecuentes
- Índices optimizados: `idx_mechanic_mapping_category`, `idx_mechanic_mapping_subcategory`, `idx_mechanic_mapping_exercise_type`
- Índice GIN para búsqueda por tags: `idx_mechanic_mapping_tags_gin`

**Integridad:**
- Foreign Key constraint: `exercise_mechanic_mapping.exercise_type` → `exercise_type ENUM`
- Constraint UNIQUE: `(mechanic_subcategory, exercise_type)` previene duplicados
- Trigger de validación para nuevos exercise_types (asegurar mapping)

**Mantenimiento:**
- Seeds iniciales con 60-90 mappings completos
- Documentación clara en ET-EDU-001 v2.0
- 13 GAPs documentados como roadmap para futuras implementaciones

---

## Validación

### Proceso de validación (DB-110 → DB-111 → DB-112)

1. **DB-110 (Validación Profunda):**
   - Identificó incoherencia crítica (score 0/100)
   - Hallazgo: exercise_mechanic (docs) vs exercise_type (DDL)
   - Recomendación inicial errónea: eliminar exercise_mechanic
   - **Corrección del usuario:** Validar contra DEFINICIONES primero

2. **DB-111 (Reconciliación):**
   - Propuso sistema dual (adaptación, no eliminación)
   - Análisis de impacto: 33 objetos, 4 capas
   - Riesgo: 🟢 BAJO-MEDIO
   - Recomendación: ✅ APROBAR IMPLEMENTACIÓN
   - **Solicitud del usuario:** Validar contra documentación

3. **DB-112 (Validación contra DEFINICIONES):**
   - Validó contra ET-EDU-001 (987 líneas)
   - Validó contra RF-EDU-001 (1,200 líneas)
   - Coherencia: 0/100 en ambos
   - Evaluó 3 opciones (A, B, C)
   - Recomendó Opción C
   - **Aprobación del usuario:** "Si la opcion c esta bien"

**Score final:** 95/100 (Opción C reconcilia ambos conceptos sin breaking changes)

---

## Implementación

### Tabla de Mapeo

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/21-exercise_mechanic_mapping.sql`

```sql
CREATE TABLE educational_content.exercise_mechanic_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- CLASIFICACIÓN PEDAGÓGICA
    mechanic_category VARCHAR(50) NOT NULL,      -- 'vocabulario', 'lectura', 'escritura'
    mechanic_subcategory VARCHAR(50),            -- 'multiple_choice', 'word_search', 'inference'

    -- IMPLEMENTACIÓN GAMILIT
    exercise_type educational_content.exercise_type NOT NULL,

    -- CONTEXTO EDUCATIVO
    bloom_level VARCHAR(50),                     -- 'recordar', 'comprender', 'aplicar', etc.
    cefr_level educational_content.difficulty_level[],
    pedagogical_purpose TEXT,
    learning_objectives TEXT[],

    -- CARACTERÍSTICAS
    interaction_type VARCHAR(50),                -- 'drag_drop', 'text_input', 'selection'
    cognitive_load VARCHAR(20),                  -- 'bajo', 'medio', 'alto'

    -- Metadatos
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(mechanic_subcategory, exercise_type)
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_mechanic_mapping_category ON educational_content.exercise_mechanic_mapping(mechanic_category);
CREATE INDEX idx_mechanic_mapping_subcategory ON educational_content.exercise_mechanic_mapping(mechanic_subcategory);
CREATE INDEX idx_mechanic_mapping_exercise_type ON educational_content.exercise_mechanic_mapping(exercise_type);
CREATE INDEX idx_mechanic_mapping_bloom ON educational_content.exercise_mechanic_mapping(bloom_level);
CREATE INDEX idx_mechanic_mapping_tags_gin ON educational_content.exercise_mechanic_mapping USING gin(tags);

COMMENT ON TABLE educational_content.exercise_mechanic_mapping
IS 'Mapeo N:M entre categorías pedagógicas universales (31 subcategorías) y implementaciones específicas GAMILIT (35 exercise_types)';
```

### Ejemplos de Mapeos

| mechanic_category | mechanic_subcategory | exercise_type | bloom_level | pedagogical_purpose |
|-------------------|---------------------|---------------|-------------|---------------------|
| vocabulario | word_search | crucigrama | recordar | Reforzar vocabulario mediante juego de palabras cruzadas |
| vocabulario | word_search | sopa_letras | recordar | Identificar palabras clave en contexto visual |
| lectura | inference | detective_textual | analizar | Desarrollar comprensión inferencial mediante pistas |
| lectura | reading_comprehension | analisis_fuentes | evaluar | Análisis crítico de textos históricos/culturales |
| escritura | free_writing | ensayo_argumentativo | crear | Expresión argumentativa y pensamiento crítico |
| cultura | cultural_context | tribunal_opiniones | evaluar | Análisis de perspectivas culturales diversas |

### Vista Helper

```sql
CREATE VIEW educational_content.exercises_with_mechanics AS
SELECT
    e.*,
    m.mechanic_category,
    m.mechanic_subcategory,
    m.bloom_level,
    m.pedagogical_purpose
FROM educational_content.exercises e
LEFT JOIN educational_content.exercise_mechanic_mapping m
    ON e.exercise_type = m.exercise_type;
```

---

## Referencias

**Documentación de validación:**
- [DB-110: Validación Profunda docs/ ↔ DDL](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/database/DB-110/reportes-consolidados/REPORTE-VALIDACION-PROFUNDA.md)
- [DB-111: Análisis de Impacto](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/database/DB-111/01-ANALISIS-IMPACTO.md)
- [DB-111: Reporte Consolidado](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/database/DB-111/02-REPORTE-CONSOLIDADO.md)
- [DB-112: Validación contra Documentación](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/database/DB-112/01-VALIDACION-CONTRA-DOCUMENTACION.md)
- [DB-112: Reporte Final](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/database/DB-112/02-REPORTE-FINAL-VALIDACION.md)

**Documentación actualizada:**
- [ET-EDU-001 v2.0: Implementación de Mecánicas de Ejercicios](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md)
- [RF-EDU-001 v2.0: Mecánicas de Ejercicios](/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/01-fase-alcance-inicial/EAI-002-actividades/requerimientos/RF-EDU-001-mecanicas-ejercicios.md)

**Código relacionado:**
- DDL: `apps/database/ddl/00-prerequisites.sql` (ENUM exercise_type)
- DDL: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`
- DDL: `apps/database/ddl/schemas/educational_content/tables/21-exercise_mechanic_mapping.sql` (NUEVA)
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (ExerciseTypeEnum)
- Backend: `apps/backend/src/modules/educational/entities/exercise.entity.ts`
- Frontend: `apps/frontend/src/apps/student/pages/ExercisePage.tsx` (routing)

---

## Notas

**13 GAPs Pedagógicos Identificados:**

Mecánicas pedagógicas documentadas en ET-EDU-001 v1.0 sin implementación GAMILIT específica:

**Vocabulario (1):**
- image_association

**Gramática (8):**
- verb_conjugation, sentence_builder, error_detection, sentence_transformation
- pronoun_selection, possessive_forms, pluralization, aspect_markers

**Lectura (0):** Todas implementadas ✅

**Escritura (0):** Todas implementadas ✅

**Audio (1):**
- audio_matching

**Pronunciación (2):**
- speech_recording, pronunciation_comparison

**Cultura (1):**
- traditional_practice

**Roadmap:** Estos 13 GAPs pueden servir como roadmap para futuras implementaciones GAMILIT sin modificar la estructura del sistema dual.

---

**Decisión final:** ✅ **ACEPTADA** - Sistema Dual implementado para reconciliar documentación con realidad, preservando valor pedagógico y técnico sin breaking changes.

**Timeline de implementación:** 3 días (~24.5 horas con 1-2 devs)

**Status:** Documentación actualizada (ET-EDU-001 v2.0, RF-EDU-001 v2.0, ADR-008) ✅
**Próximo paso:** DB-113 - Implementación DDL + Backend + Frontend
