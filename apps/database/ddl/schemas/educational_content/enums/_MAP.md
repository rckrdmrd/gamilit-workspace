# Mapa de ENUMs del Schema educational_content

**Total de ENUMs:** 3
**Última actualización:** 2025-11-08
**Migrados desde public:** 3 (difficulty_level, exercise_type, cognitive_level)
**Creados:** 0

---

## Resumen

Este directorio contiene todos los tipos enumerados (ENUMs) del schema `educational_content`. Estos ENUMs son específicos del contenido educativo de Marie Curie (dificultad de módulos/ejercicios, tipos de ejercicios).

---

## Lista de ENUMs

| # | Nombre | Archivo | Descripción | Valores | Estado | Versión |
|---|--------|---------|-------------|---------|--------|---------|
| 1 | cognitive_level | cognitive_level.sql | Niveles cognitivos (Taxonomía de Bloom) | 6 valores | ✅ Migrado | v1.0 (2025-11-08) |
| 2 | difficulty_level | difficulty_level.sql | Niveles de dificultad para contenido educativo | 8 valores | ✅ Migrado | v1.0 (2025-11-08) |
| 3 | exercise_type | exercise_type.sql | Tipos de ejercicios (35 mecánicas) | 35 valores | ✅ Migrado | v1.0 (2025-11-08) |

---

## Valores Detallados por ENUM

### 1. cognitive_level (6 valores) ⭐ MIGRADO

**Descripción:** Niveles cognitivos basados en la Taxonomía de Bloom (versión revisada de Anderson & Krathwohl, 2001)

**Valores (ordenados por complejidad cognitiva creciente):**
- `'recordar'` - Nivel 1: Remember - Recuperar información de la memoria
- `'comprender'` - Nivel 2: Understand - Construir significado a partir de información
- `'aplicar'` - Nivel 3: Apply - Usar información en situaciones nuevas
- `'analizar'` - Nivel 4: Analyze - Descomponer información en partes y detectar relaciones
- `'evaluar'` - Nivel 5: Evaluate - Hacer juicios basados en criterios y estándares
- `'crear'` - Nivel 6: Create - Combinar elementos para formar algo nuevo y original

**Uso Planeado (Feature Futura):**
- `educational_content.exercises` (columna: `cognitive_level`) - NO IMPLEMENTADO AÚN
- `educational_content.modules` (columna: `cognitive_level`) - NO IMPLEMENTADO AÚN
- Permitirá clasificar ejercicios por complejidad cognitiva
- Habilitará rutas de aprendizaje adaptativas (scaffolding cognitivo)
- Analytics de progresión cognitiva del estudiante

**Migración v1.0 (2025-11-08):**
- ✅ Migrado de public.cognitive_level a educational_content.cognitive_level
- ✅ Documentación extendida con taxonomía completa de Bloom
- ⏳ Pendiente: Agregar columna a tabla exercises (feature futura)
- ⏳ Pendiente: Crear CognitiveLevelEnum en backend cuando se implemente

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL.md`
- DDL: `apps/database/ddl/schemas/educational_content/enums/cognitive_level.sql`
- Backend: No implementado aún
- Literatura: Anderson & Krathwohl (2001) - Taxonomía Revisada de Bloom

---

### 2. difficulty_level (8 valores) ⭐ MIGRADO

**Descripción:** Niveles de dificultad para módulos y ejercicios del contenido educativo

**Valores (ordenados por dificultad creciente):**
- `'very_easy'` - Nivel 1: Muy fácil, contenido introductorio básico ⭐
- `'easy'` - Nivel 2: Fácil, contenido simple ⭐⭐
- `'beginner'` - Nivel 3: Principiante, para usuarios nuevos ⭐⭐
- `'medium'` - Nivel 4: Medio, dificultad estándar ⭐⭐⭐
- `'intermediate'` - Nivel 5: Intermedio, requiere conocimiento previo ⭐⭐⭐⭐
- `'hard'` - Nivel 6: Difícil, contenido desafiante ⭐⭐⭐⭐
- `'advanced'` - Nivel 7: Avanzado, para usuarios experimentados ⭐⭐⭐⭐⭐
- `'very_hard'` - Nivel 8: Muy difícil, contenido experto ⭐⭐⭐⭐⭐

**Usado en:**
- `educational_content.modules` (columna: `difficulty_level`, DEFAULT: 'very_easy')
- `educational_content.exercises` (columna: `difficulty_level`, DEFAULT: 'very_easy')
- `content_management.content_templates` (columna: `difficulty_level`, si existe)
- `content_management.marie_curie_content` (columna: `difficulty_level`, si existe)

**Migración v1.0 (2025-11-08):**
- ✅ Migrado de public.difficulty_level a educational_content.difficulty_level
- ✅ Tablas modules y exercises actualizadas
- ✅ Backend constants: DifficultyLevelEnum actualizado
- ✅ Entities actualizados: module.entity.ts, exercise.entity.ts
- ✅ Migration: `2025-11-08-migrate-difficulty-level-enum.sql`
- ✅ Complejidad BAJA: Migración estándar multi-tabla

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL.md`
- DDL: `apps/database/ddl/schemas/educational_content/enums/difficulty_level.sql`
- Tablas:
  - `apps/database/ddl/schemas/educational_content/tables/01-modules.sql:23`
  - `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:35`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (DifficultyLevelEnum)
- Entities:
  - `apps/backend/src/modules/educational/entities/module.entity.ts:125`
  - `apps/backend/src/modules/educational/entities/exercise.entity.ts:168`

---

### 3. exercise_type (35 valores) ⭐ MIGRADO

**Descripción:** Tipos de ejercicios con 35 mecánicas diferentes para comprensión lectora

**Valores (35 tipos):**

**Ejercicios Básicos:**
- `'crucigrama'` - Crucigrama interactivo
- `'linea_tiempo'` - Línea de tiempo
- `'sopa_letras'` - Sopa de letras
- `'emparejamiento'` - Emparejamiento de conceptos
- `'verdadero_falso'` - Verdadero/Falso
- `'completar_espacios'` - Completar espacios en blanco

**Análisis y Comprensión:**
- `'mapa_conceptual'` - Mapa conceptual
- `'detective_textual'` - Detective textual
- `'construccion_hipotesis'` - Construcción de hipótesis
- `'prediccion_narrativa'` - Predicción narrativa
- `'puzzle_contexto'` - Puzzle de contexto
- `'rueda_inferencias'` - Rueda de inferencias

**Interacción y Debate:**
- `'tribunal_opiniones'` - Tribunal de opiniones
- `'debate_digital'` - Debate digital
- `'analisis_fuentes'` - Análisis de fuentes
- `'podcast_argumentativo'` - Podcast argumentativo
- `'matriz_perspectivas'` - Matriz de perspectivas

**Contenido Multimedia:**
- `'verificador_fake_news'` - Verificador de fake news
- `'infografia_interactiva'` - Infografía interactiva
- `'quiz_tiktok'` - Quiz estilo TikTok
- `'navegacion_hipertextual'` - Navegación hipertextual
- `'analisis_memes'` - Análisis de memes
- `'diario_multimedia'` - Diario multimedia
- `'comic_digital'` - Cómic digital
- `'video_carta'` - Video carta
- `'comprension_auditiva'` - Comprensión auditiva
- `'collage_prensa'` - Collage de prensa
- `'texto_movimiento'` - Texto en movimiento
- `'call_to_action'` - Call to action
- `'diario_interactivo'` - Diario interactivo
- `'resumen_visual'` - Resumen visual
- `'resena_critica'` - Reseña crítica
- `'chat_literario'` - Chat literario
- `'email_formal'` - Email formal
- `'ensayo_argumentativo'` - Ensayo argumentativo

**Usado en:**
- `educational_content.exercises` (columna: `exercise_type`)

**Migración v1.0 (2025-11-08):**
- ✅ Migrado de public.exercise_type a educational_content.exercise_type
- ✅ Tabla exercises actualizada (línea 28)
- ✅ Backend constants: ExerciseTypeEnum actualizado con @see correcto
- ✅ Entity actualizado: exercise.entity.ts con enumName
- ✅ Complejidad BAJA: Migración estándar single-tabla
- ✅ 35 mecánicas sincronizadas 100% DDL ↔ Backend

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL.md`
- DDL: `apps/database/ddl/schemas/educational_content/enums/exercise_type.sql`
- Tabla: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:28`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (ExerciseTypeEnum)
- Entity: `apps/backend/src/modules/educational/entities/exercise.entity.ts:108`

---

## Orden de Creación Recomendado

Los ENUMs de educational_content deben crearse antes que las tablas que los referencian:

1. **cognitive_level** - Planeado para exercises y modules (feature futura)
2. **difficulty_level** - Requerido por modules y exercises
3. **exercise_type** - Requerido por exercises

```bash
# Ejecutar en orden:
psql -f cognitive_level.sql
psql -f difficulty_level.sql
psql -f exercise_type.sql
```

---

## Referencias Cruzadas

### Tablas que usan estos ENUMs

**educational_content:**
- `modules` → difficulty_level (+ cognitive_level en futuro)
- `exercises` → difficulty_level, exercise_type (+ cognitive_level en futuro)

**content_management (si existe):**
- `content_templates` → difficulty_level
- `marie_curie_content` → difficulty_level

### Backend Entities

- `apps/backend/src/modules/educational/entities/module.entity.ts` → difficulty_level
- `apps/backend/src/modules/educational/entities/exercise.entity.ts` → difficulty_level, exercise_type

---

## Historial de Migraciones

| Fecha | ENUM | Acción | Migration | Estado |
|-------|------|--------|-----------|--------|
| 2025-11-08 | cognitive_level | Migrado de public | - | ✅ |
| 2025-11-08 | difficulty_level | Migrado de public | 2025-11-08-migrate-difficulty-level-enum.sql | ✅ |
| 2025-11-08 | exercise_type | Migrado de public | - | ✅ |

---

## Notas Importantes

### ENUMs Futuros a Migrar a educational_content

Según `TRACKING-CORRECCIONES.md` y `PLAN-MIGRACION-ENUMS-FASE1.md`, los siguientes ENUMs están en `public` pero deberían estar en `educational_content`:

- ✅ `cognitive_level` (6 valores) - P1 - **MIGRADO 2025-11-08** (no usado aún)
- ✅ `difficulty_level` (8 valores) - P1 - **MIGRADO 2025-11-08** (complejidad BAJA)
- ✅ `exercise_type` (35 valores) - P1 - **MIGRADO 2025-11-08** (complejidad BAJA)

**Ver:** `apps/database/docs/PLAN-MIGRACION-ENUMS-FASE1.md` para plan completo de migraciones FASE 1

---

## Comandos de Validación

```bash
# Verificar ENUMs en BD
psql -d gamilit_platform -c "
SELECT n.nspname as schema, t.typname as enum_name, e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'educational_content'
ORDER BY enum_name, e.enumsortorder;
"

# Verificar qué columnas usan difficulty_level
psql -d gamilit_platform -c "
SELECT c.table_schema, c.table_name, c.column_name, c.udt_schema, c.udt_name
FROM information_schema.columns c
WHERE c.udt_name = 'difficulty_level';
"

# Contar módulos por dificultad
psql -d gamilit_platform -c "
SELECT difficulty_level, COUNT(*)
FROM educational_content.modules
GROUP BY difficulty_level
ORDER BY COUNT(*) DESC;
"

# Contar ejercicios por tipo
psql -d gamilit_platform -c "
SELECT exercise_type, COUNT(*)
FROM educational_content.exercises
GROUP BY exercise_type
ORDER BY COUNT(*) DESC;
"
```

---

**Generado:** 2025-11-08
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Versión:** 1.2
**Últimas migraciones:**
- cognitive_level v1.0 migrado de public (2025-11-08) - Feature futura, no usado aún
- difficulty_level v1.0 migrado de public (2025-11-08) - Complejidad BAJA
- exercise_type v1.0 migrado de public (2025-11-08) - Complejidad BAJA
