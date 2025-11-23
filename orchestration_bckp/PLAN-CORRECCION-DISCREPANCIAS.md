# Plan de Corrección - Discrepancias 3-Capas

**Fecha:** 2025-11-03
**Autor:** ATLAS-DATABASE (SA-VAL-012)
**Versión:** 1.0

---

## 📋 Resumen Ejecutivo

**Total Correcciones:** 148
- **ENUMs (DB-Backend):** 53 discrepancias
- **Seeds vs DDL:** 19 errores críticos
- **DTOs:** 114 decoradores faltantes

**Esfuerzo Total:** 85-110 horas (3-4 semanas)
**Prioridad P0:** 27 correcciones críticas (18-22 horas)

### Distribución por Severidad
- **Crítico:** 24 correcciones (ENUMs faltantes + tablas inexistentes + ENUMs inválidos)
- **Alto:** 16 correcciones (valores ENUM desincronizados + decoradores UUID)
- **Medio:** 61 correcciones (decoradores @IsInt, @IsDate)
- **Bajo:** 85 correcciones (decoradores @IsString, normalización case)

---

## 🚀 Fases de Corrección

### Fase 1: CRÍTICO (P0 - 2-3 días, 18-22 horas)

**Objetivo:** Resolver 27 discrepancias críticas que bloquean funcionalidad

---

#### Grupo 1.1: ENUMs Faltantes en Backend (5 correcciones, 2 horas)

##### C1.1.1: Crear AalLevelEnum

```typescript
// ========================================
// CORRECCIÓN C1.1.1: Crear AalLevelEnum
// ========================================

/**
 * Archivo: apps/backend/src/shared/enums/aal-level.enum.ts (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 15 minutos
 * Dependencias: Ninguna
 */

export enum AalLevelEnum {
  AAL1 = 'aal1',
  AAL2 = 'aal2',
  AAL3 = 'aal3'
}

/**
 * Imports necesarios:
 * Agregar a apps/backend/src/shared/enums/index.ts:
 */
export * from './aal-level.enum';

/**
 * Validación:
 * - npm run build
 * - Verificar import: import { AalLevelEnum } from '@shared/enums'
 * - Usar en auth DTOs con @IsEnum(AalLevelEnum)
 */
```

---

##### C1.1.2: Crear CodeChallengeMethodEnum

```typescript
// ========================================
// CORRECCIÓN C1.1.2: Crear CodeChallengeMethodEnum
// ========================================

/**
 * Archivo: apps/backend/src/shared/enums/code-challenge-method.enum.ts (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 15 minutos
 * Dependencias: Ninguna
 */

export enum CodeChallengeMethodEnum {
  S256 = 's256',
  PLAIN = 'plain'
}

/**
 * Imports necesarios:
 * Agregar a apps/backend/src/shared/enums/index.ts:
 */
export * from './code-challenge-method.enum';

/**
 * Validación:
 * - npm run build
 * - Usar en auth/oauth DTOs: @IsEnum(CodeChallengeMethodEnum)
 * - Verificar que los valores en seeds coincidan
 */
```

---

##### C1.1.3: Crear GamilitRoleEnum

```typescript
// ========================================
// CORRECCIÓN C1.1.3: Crear GamilitRoleEnum
// ========================================

/**
 * Archivo: apps/backend/src/shared/enums/gamilit-role.enum.ts (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 20 minutos
 * Dependencias: Ninguna
 */

export enum GamilitRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}

/**
 * Imports necesarios:
 * Agregar a apps/backend/src/shared/enums/index.ts:
 */
export * from './gamilit-role.enum';

/**
 * Validación:
 * - npm run build
 * - Reemplazar referencias a GamilityRoleEnum (mal escrito) con GamilitRoleEnum
 * - Verificar uso en auth guards y decorators
 */
```

---

##### C1.1.4: Crear RangoMayaEnum

```typescript
// ========================================
// CORRECCIÓN C1.1.4: Crear RangoMayaEnum
// ========================================

/**
 * Archivo: apps/backend/src/shared/enums/rango-maya.enum.ts (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 20 minutos
 * Dependencias: Ninguna
 */

export enum RangoMayaEnum {
  NACOM = 'nacom',
  BATAB = 'batab',
  HOLCATTE = 'holcatte',
  GUERRERO = 'guerrero',
  MERCENARIO = 'mercenario'
}

/**
 * Imports necesarios:
 * Agregar a apps/backend/src/shared/enums/index.ts:
 */
export * from './rango-maya.enum';

/**
 * NOTA: Este ENUM es diferente a MayaRankEnum existente.
 * RangoMayaEnum está en public.rango_maya (tabla de rangos del sistema)
 * MayaRankEnum está duplicado (ver C1.2)
 *
 * Validación:
 * - npm run build
 * - Verificar uso en gamification DTOs
 */
```

---

##### C1.1.5: Crear BucketTypeEnum

```typescript
// ========================================
// CORRECCIÓN C1.1.5: Crear BucketTypeEnum
// ========================================

/**
 * Archivo: apps/backend/src/shared/enums/bucket-type.enum.ts (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 15 minutos
 * Dependencias: Ninguna
 */

export enum BucketTypeEnum {
  STANDARD = 'STANDARD',
  ANALYTICS = 'ANALYTICS'
}

/**
 * Imports necesarios:
 * Agregar a apps/backend/src/shared/enums/index.ts:
 */
export * from './bucket-type.enum';

/**
 * Validación:
 * - npm run build
 * - Usar en storage/media DTOs
 * - Verificar integración con storage.buckettype
 */
```

---

#### Grupo 1.2: Problema MayaRank Duplicado (1 corrección, 2 horas)

##### C1.2.1: Resolver Duplicación MayaRank

```typescript
// ========================================
// CORRECCIÓN C1.2.1: Consolidar MayaRank
// ========================================

/**
 * PROBLEMA: Existen 3 ENUMs diferentes para "maya_rank":
 *
 * 1. gamification_system.maya_rank (DB) = ['Ajaw', 'Nacom', 'Ah K\'in', 'Halach Uinic', 'K\'uk\'ulkan']
 * 2. public.maya_rank (DB) = ['NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO']
 * 3. MayaRank (Backend) = ['AJAW', 'NACOM', 'AH_KIN', 'HALACH_UINIC', 'KUKUKULKAN']
 * 4. MayaRankEnum (Backend) = ['NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO']
 *
 * DECISIÓN REQUERIDA: ¿Cuál es el sistema de rangos correcto?
 *
 * OPCIÓN A (RECOMENDADA): Separar por contexto
 * - gamification_system.maya_rank → Sistema de gamificación avanzado
 * - public.maya_rank (rango_maya) → Sistema de rangos básico/legacy
 *
 * Severidad: CRÍTICA
 * Esfuerzo: 2 horas
 * Prerequisitos: Decisión de producto sobre sistema de rangos
 */

/**
 * PASO 1: Renombrar ENUMs existentes para claridad
 */

// Archivo: apps/backend/src/shared/enums/maya-rank-gamification.enum.ts
export enum MayaRankGamificationEnum {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = 'Ah K\'in',
  HALACH_UINIC = 'Halach Uinic',
  KUKUKULKAN = 'K\'uk\'ulkan'
}

// Archivo: apps/backend/src/shared/enums/maya-rank-basic.enum.ts
export enum MayaRankBasicEnum {
  NACOM = 'nacom',
  BATAB = 'batab',
  HOLCATTE = 'holcatte',
  GUERRERO = 'guerrero',
  MERCENARIO = 'mercenario'
}

/**
 * PASO 2: Script de migración para actualizar referencias
 *
 * Comando:
 * find apps/backend/src -type f -name "*.ts" -exec sed -i 's/import { MayaRank }/import { MayaRankGamificationEnum }/g' {} +
 *
 * MANUAL: Revisar cada uso y determinar si debe usar MayaRankGamificationEnum o MayaRankBasicEnum
 */

/**
 * PASO 3: Actualizar DTOs afectados
 */
// En gamification-system módulo
import { MayaRankGamificationEnum } from '@shared/enums';

@IsEnum(MayaRankGamificationEnum)
maya_rank: MayaRankGamificationEnum;

/**
 * Validación:
 * - npm run build
 * - npm run test
 * - Verificar que seeds usan valores correctos según esquema
 * - Probar endpoints de gamification
 */
```

---

#### Grupo 1.3: Tablas Faltantes en DDL (3 correcciones, 3 horas)

##### C1.3.1: Crear tabla system_metrics

```sql
-- ========================================
-- CORRECCIÓN C1.3.1: Crear tabla system_metrics
-- ========================================

/**
 * Archivo: apps/database/schemas/audit_logging/03-system-metrics.sql (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 1 hora
 * Prerequisitos: Ninguno
 */

-- OPCIÓN A: Crear tabla completa según seed
CREATE TABLE IF NOT EXISTS audit_logging.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type audit_logging.metric_type NOT NULL,
    aggregation_period audit_logging.aggregation_period NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID REFERENCES auth_management.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_metric_per_period
        UNIQUE (metric_name, aggregation_period, recorded_at, tenant_id)
);

-- Índices
CREATE INDEX idx_system_metrics_tenant ON audit_logging.system_metrics(tenant_id);
CREATE INDEX idx_system_metrics_type ON audit_logging.system_metrics(metric_type);
CREATE INDEX idx_system_metrics_recorded ON audit_logging.system_metrics(recorded_at DESC);

-- Trigger updated_at
CREATE TRIGGER trg_system_metrics_updated_at
    BEFORE UPDATE ON audit_logging.system_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE audit_logging.system_metrics IS 'Métricas agregadas del sistema para monitoreo';
COMMENT ON COLUMN audit_logging.system_metrics.metric_name IS 'Nombre de la métrica (ej: cpu_usage, memory_usage)';
COMMENT ON COLUMN audit_logging.system_metrics.metric_value IS 'Valor numérico de la métrica';

/**
 * OPCIÓN B: Eliminar seed si tabla no es necesaria
 * rm apps/database/seeds/dev/audit_logging/02-system-metrics.sql
 *
 * DECISIÓN: Revisar con equipo de DevOps si esta tabla es necesaria
 *
 * Validación:
 * - psql -d gamilit -f apps/database/schemas/audit_logging/03-system-metrics.sql
 * - psql -d gamilit -f apps/database/seeds/dev/audit_logging/02-system-metrics.sql
 * - Verificar: SELECT COUNT(*) FROM audit_logging.system_metrics;
 */
```

---

##### C1.3.2: Resolver tabla content_management.content

```sql
-- ========================================
-- CORRECCIÓN C1.3.2: Tabla content_management.content
-- ========================================

/**
 * PROBLEMA: Seed intenta insertar en content_management.content pero tabla no existe
 * ANÁLISIS: Parece ser una tabla legacy o mal referenciada
 *
 * Severidad: CRÍTICA
 * Esfuerzo: 1 hora
 * Prerequisitos: Revisión de arquitectura de content_management
 */

-- OPCIÓN A: Seed debería usar educational_content.modules
-- Archivo: apps/database/seeds/dev/content_management/01-marie-curie-bio.sql

-- ANTES:
-- INSERT INTO content_management.content (...)

-- DESPUÉS:
INSERT INTO content_management.marie_curie_content (
    id,
    title,
    content_type,
    content_text,
    content_url,
    thumbnail_url,
    duration_minutes,
    difficulty_level,
    tags,
    learning_objectives,
    status,
    version,
    created_by,
    tenant_id
) VALUES (
    gen_random_uuid(),
    'Marie Curie: Pionera de la Radiactividad',
    'biography',
    'Biografía completa de Marie Curie...',
    NULL,
    'https://cdn.gamilit.com/marie-curie-thumb.jpg',
    15,
    'intermediate',
    ARRAY['ciencia', 'mujeres-stem', 'historia'],
    ARRAY['Conocer la vida de Marie Curie', 'Comprender su impacto en la ciencia'],
    'published',
    1,
    'system',
    NULL
);

/**
 * OPCIÓN B: Crear tabla content_management.content como tabla genérica
 * (No recomendado - parece haber confusion en el diseño)
 *
 * Validación:
 * - Verificar que tabla marie_curie_content existe
 * - Ejecutar seed corregido
 * - SELECT * FROM content_management.marie_curie_content LIMIT 1;
 */
```

---

##### C1.3.3: Resolver tabla content_management.tags

```sql
-- ========================================
-- CORRECCIÓN C1.3.3: Crear tabla tags
-- ========================================

/**
 * Archivo: apps/database/schemas/content_management/04-tags.sql (NUEVO)
 * Severidad: CRÍTICA
 * Esfuerzo: 1 hora
 * Prerequisitos: Ninguno
 */

CREATE TABLE IF NOT EXISTS content_management.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color
    icon VARCHAR(50),
    category VARCHAR(50), -- 'subject', 'skill', 'topic', etc.
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES auth_management.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_tags_slug ON content_management.tags(slug);
CREATE INDEX idx_tags_category ON content_management.tags(category);
CREATE INDEX idx_tags_active ON content_management.tags(is_active);
CREATE INDEX idx_tags_tenant ON content_management.tags(tenant_id);

-- Trigger
CREATE TRIGGER trg_tags_updated_at
    BEFORE UPDATE ON content_management.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabla de relaciones (many-to-many con módulos)
CREATE TABLE IF NOT EXISTS content_management.module_tags (
    module_id UUID REFERENCES educational_content.modules(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES content_management.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (module_id, tag_id)
);

CREATE INDEX idx_module_tags_module ON content_management.module_tags(module_id);
CREATE INDEX idx_module_tags_tag ON content_management.module_tags(tag_id);

/**
 * Validación:
 * - psql -d gamilit -f apps/database/schemas/content_management/04-tags.sql
 * - psql -d gamilit -f apps/database/seeds/dev/content_management/03-tags.sql
 * - SELECT COUNT(*) FROM content_management.tags;
 */
```

---

#### Grupo 1.4: Seeds con ENUM Inválidos (16 correcciones, 8-10 horas)

##### C1.4.1: Mapeo de exercise_type inválidos

```sql
-- ========================================
-- CORRECCIÓN C1.4.1: Corregir exercise_type en seeds
-- ========================================

/**
 * PROBLEMA: Seeds usan valores en inglés, DDL usa valores en español
 *
 * Valores inválidos detectados:
 * - multiple_choice
 * - essay
 * - fill_blank
 * - interactive
 * - detective
 * - predictor
 * - analysis
 * - debate
 * - tribunal
 * - podcast
 * - presentacion
 * - video
 * - diario_multimedia
 * - video_carta
 * - comic_digital
 *
 * Severidad: CRÍTICA
 * Esfuerzo: 8 horas (16 correcciones × 30 min)
 * Prerequisitos: DECISIÓN de usar español o inglés
 */

/**
 * DECISIÓN REQUERIDA: ¿Actualizar DDL o actualizar seeds?
 *
 * RECOMENDACIÓN: Actualizar seeds para usar valores españoles del DDL
 * Razón: No modificar ENUMs en producción, seeds son para desarrollo
 */

-- ========================================
-- MAPEO DE VALORES
-- ========================================

-- Archivo de mapeo: apps/database/seeds/EXERCISE_TYPE_MAPPING.md
/*
| Seed Value (Inglés)  | DDL Value (Español)      | Similitud |
|----------------------|--------------------------|-----------|
| multiple_choice      | crucigrama               | Baja      |
| essay                | construccion_hipotesis   | Alta      |
| fill_blank           | completar_espacios*      | Alta      |
| interactive          | infografia_interactiva   | Media     |
| detective            | detective_textual        | Exacta    |
| predictor            | prediccion_narrativa     | Exacta    |
| analysis             | analisis_fuentes         | Exacta    |
| debate               | debate_digital           | Exacta    |
| tribunal             | tribunal_opiniones       | Exacta    |
| podcast              | podcast_argumentativo    | Exacta    |
| presentacion         | infografia_interactiva   | Baja      |
| video                | comprension_auditiva     | Baja      |
| diario_multimedia    | diario_interactivo       | Alta      |
| video_carta          | capsula_tiempo           | Baja      |
| comic_digital        | collage_digital          | Alta      |

* completar_espacios existe en Backend pero no en DB - agregar a DDL
*/

-- ========================================
-- SCRIPT DE CORRECCIÓN SEEDS
-- ========================================

-- Archivo: apps/database/seeds/dev/educational_content/02-exercises-module1.sql

-- ANTES:
INSERT INTO educational_content.exercises (
    id, module_id, exercise_type, title, instructions
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM educational_content.modules WHERE title = 'Comprensión Lectora Básica' LIMIT 1),
    'multiple_choice', -- INVÁLIDO
    'Identificar idea principal',
    'Lee el siguiente texto y selecciona la idea principal'
);

-- DESPUÉS:
INSERT INTO educational_content.exercises (
    id, module_id, exercise_type, title, instructions
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM educational_content.modules WHERE title = 'Comprensión Lectora Básica' LIMIT 1),
    'crucigrama', -- VÁLIDO (o seleccionar otro tipo más apropiado)
    'Identificar idea principal',
    'Lee el siguiente texto y selecciona la idea principal'
);

/**
 * ALTERNATIVA: Agregar valores faltantes al ENUM
 * (Solo si equipo decide estandarizar en inglés)
 */

-- apps/database/schemas/educational_content/01-enums.sql
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'multiple_choice';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'essay';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'fill_blank';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'interactive';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'detective';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'predictor';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'analysis';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'debate';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'tribunal';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'podcast';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'presentacion';
ALTER TYPE educational_content.exercise_type ADD VALUE IF NOT EXISTS 'video';

/**
 * Validación:
 * - Ejecutar seeds corregidos
 * - Verificar: SELECT DISTINCT exercise_type FROM educational_content.exercises;
 * - Comparar con: SELECT unnest(enum_range(NULL::educational_content.exercise_type));
 * - NO debe haber errores de constraint violation
 */
```

---

##### C1.4.2-C1.4.16: Scripts individuales de corrección por archivo seed

```bash
# ========================================
# CORRECCIÓN C1.4.2-16: Scripts batch de corrección
# ========================================

# Script: apps/database/scripts/fix-exercise-types.sh

#!/bin/bash

# Archivo: 02-exercises-module1.sql
sed -i "s/'multiple_choice'/'crucigrama'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'essay'/'construccion_hipotesis'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'fill_blank'/'emparejamiento'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'interactive'/'infografia_interactiva'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql

# Archivo: 03-exercises-module2.sql
sed -i "s/'detective'/'detective_textual'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql
sed -i "s/'predictor'/'prediccion_narrativa'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql
sed -i "s/'analysis'/'analisis_fuentes'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql

# Archivo: 04-exercises-module3.sql
sed -i "s/'debate'/'debate_digital'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql
sed -i "s/'analysis'/'analisis_fuentes'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql
sed -i "s/'tribunal'/'tribunal_opiniones'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql

# Archivo: 05-exercises-module4.sql
sed -i "s/'presentacion'/'infografia_interactiva'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql
sed -i "s/'podcast'/'podcast_argumentativo'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql
sed -i "s/'video'/'comprension_auditiva'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql

# Archivo: 06-exercises-module5.sql
sed -i "s/'diario_multimedia'/'diario_interactivo'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql
sed -i "s/'video_carta'/'capsula_tiempo'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql
sed -i "s/'comic_digital'/'collage_digital'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql

echo "✅ Seeds corregidos"

# Ejecutar seeds
psql -d gamilit -f apps/database/seeds/dev/educational_content/02-exercises-module1.sql
psql -d gamilit -f apps/database/seeds/dev/educational_content/03-exercises-module2.sql
psql -d gamilit -f apps/database/seeds/dev/educational_content/04-exercises-module3.sql
psql -d gamilit -f apps/database/seeds/dev/educational_content/05-exercises-module4.sql
psql -d gamilit -f apps/database/seeds/dev/educational_content/06-exercises-module5.sql

echo "✅ Seeds ejecutados"

# Validación
psql -d gamilit -c "
SELECT
    exercise_type,
    COUNT(*) as count
FROM educational_content.exercises
GROUP BY exercise_type
ORDER BY count DESC;
"

/**
 * Ejecución:
 * chmod +x apps/database/scripts/fix-exercise-types.sh
 * ./apps/database/scripts/fix-exercise-types.sh
 *
 * Validación:
 * - NO debe haber errores de invalid input value
 * - Todos los tipos deben estar en el ENUM
 * - npm run test:seeds
 */
```

---

### Fase 2: ALTO (P1 - 1 semana, 25-30 horas)

**Objetivo:** Resolver 16 discrepancias de alta prioridad

---

#### Grupo 2.1: Sincronizar Valores ENUM (6 correcciones, 8-10 horas)

##### C2.1.1: Sincronizar content_type

```typescript
// ========================================
// CORRECCIÓN C2.1.1: Sincronizar content_type
// ========================================

/**
 * PROBLEMA: Backend usa ContentStatusEnum para content_type
 * DB tiene content_type con valores completamente diferentes
 *
 * DB: ['video', 'text', 'interactive', 'quiz', 'game', 'simulation']
 * Backend ContentStatusEnum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEWING']
 *
 * Esto es un ERROR DE MAPEO - se usa ENUM incorrecto
 *
 * Severidad: ALTA
 * Esfuerzo: 2 horas
 * Prerequisitos: C1.1 (ENUMs creados)
 */

/**
 * PASO 1: Crear ContentTypeEnum correcto (ya existe pero verificar valores)
 */

// Archivo: apps/backend/src/shared/enums/content-type.enum.ts
export enum ContentTypeEnum {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
  GAME = 'game',
  SIMULATION = 'simulation'
}

/**
 * PASO 2: Buscar usos incorrectos de ContentStatusEnum en lugar de ContentTypeEnum
 */

// Comando de búsqueda:
// grep -r "ContentStatusEnum" apps/backend/src --include="*.ts" | grep content_type

/**
 * PASO 3: Corregir DTOs y entidades
 */

// Archivo: apps/backend/src/modules/content/dto/create-content.dto.ts

// ANTES:
import { ContentStatusEnum } from '@shared/enums';

@IsEnum(ContentStatusEnum)
content_type: ContentStatusEnum; // INCORRECTO

// DESPUÉS:
import { ContentTypeEnum, ContentStatusEnum } from '@shared/enums';

@IsEnum(ContentTypeEnum)
content_type: ContentTypeEnum; // CORRECTO

@IsEnum(ContentStatusEnum)
status: ContentStatusEnum; // Para el status del contenido

/**
 * Validación:
 * - npm run build
 * - npm run test:e2e
 * - Probar endpoint POST /content con content_type='video'
 * - Verificar que acepta valores: video, text, interactive, quiz, game, simulation
 */
```

---

##### C2.1.2: Sincronizar difficulty_level

```sql
-- ========================================
-- CORRECCIÓN C2.1.2: Sincronizar difficulty_level
-- ========================================

/**
 * PROBLEMA: DB tiene 3 niveles, Backend tiene 8 niveles
 *
 * DB: ['beginner', 'intermediate', 'advanced']
 * Backend: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD']
 *
 * Severidad: ALTA
 * Esfuerzo: 2 horas
 * Prerequisitos: Decisión de diseño
 */

/**
 * DECISIÓN REQUERIDA: ¿Sistema simple (3 niveles) o granular (8 niveles)?
 *
 * OPCIÓN A (RECOMENDADA): Agregar niveles adicionales al ENUM de DB
 */

-- Archivo: apps/database/schemas/public/01-enums.sql

ALTER TYPE public.difficulty_level ADD VALUE IF NOT EXISTS 'very_easy';
ALTER TYPE public.difficulty_level ADD VALUE IF NOT EXISTS 'easy';
ALTER TYPE public.difficulty_level ADD VALUE IF NOT EXISTS 'medium';
ALTER TYPE public.difficulty_level ADD VALUE IF NOT EXISTS 'hard';
ALTER TYPE public.difficulty_level ADD VALUE IF NOT EXISTS 'very_hard';

-- Actualizar Backend para usar lowercase
-- Archivo: apps/backend/src/shared/enums/difficulty-level.enum.ts

export enum DifficultyLevelEnum {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  BEGINNER = 'beginner',
  MEDIUM = 'medium',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  HARD = 'hard',
  VERY_HARD = 'very_hard'
}

/**
 * OPCIÓN B: Simplificar Backend a 3 niveles
 * (No recomendado - pérdida de granularidad)
 */

export enum DifficultyLevelEnum {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Validación:
 * - Ejecutar ALTER TYPE en DB de desarrollo
 * - SELECT unnest(enum_range(NULL::public.difficulty_level));
 * - npm run build
 * - Verificar DTOs que usan DifficultyLevelEnum
 */
```

---

##### C2.1.3: Sincronizar notification_type

```typescript
// ========================================
// CORRECCIÓN C2.1.3: Sincronizar notification_type
// ========================================

/**
 * PROBLEMA: Valores completamente diferentes entre DB y Backend
 *
 * DB: ['info', 'success', 'warning', 'error', 'achievement', 'progress', 'social', 'reminder']
 * Backend: ['ACHIEVEMENT', 'MISSION', 'REWARD', 'SYSTEM', 'SOCIAL', 'EDUCATIONAL']
 *
 * Severidad: ALTA
 * Esfuerzo: 3 horas
 * Prerequisitos: Análisis de uso actual
 */

/**
 * PASO 1: Analizar uso actual
 */

// Comando de análisis:
// grep -r "NotificationType\|NotificationTypeEnum" apps/backend/src --include="*.ts" -A 5

/**
 * PASO 2: Crear ENUM unificado que cubra ambos casos
 */

// Archivo: apps/backend/src/shared/enums/notification-type.enum.ts

export enum NotificationTypeEnum {
  // Tipos de severidad (para notificaciones de sistema)
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',

  // Tipos de contenido (para notificaciones de usuario)
  ACHIEVEMENT = 'achievement',
  MISSION = 'mission',
  REWARD = 'reward',
  PROGRESS = 'progress',
  SOCIAL = 'social',
  EDUCATIONAL = 'educational',
  REMINDER = 'reminder',
  SYSTEM = 'system'
}

/**
 * PASO 3: Actualizar DDL para incluir todos los tipos
 */

-- Archivo: apps/database/schemas/public/01-enums.sql

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'mission';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'reward';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'system';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'educational';

/**
 * Validación:
 * - npm run build
 * - Verificar uso en notification service
 * - Probar crear notificación de cada tipo
 * - Ejecutar: SELECT DISTINCT notification_type FROM gamification_system.notifications;
 */
```

---

##### C2.1.4: Sincronizar exercise_type (Backend)

```typescript
// ========================================
// CORRECCIÓN C2.1.4: Agregar valores faltantes a ExerciseTypeEnum
// ========================================

/**
 * PROBLEMA: Backend tiene valores que DB no tiene, y viceversa
 *
 * Faltantes en Backend: ['capsula_tiempo', 'collage_digital']
 * Faltantes en DB: ['comic_digital', 'verdadero_falso', 'diario_multimedia', 'collage_prensa', 'completar_espacios', 'video_carta']
 *
 * Severidad: ALTA
 * Esfuerzo: 1 hora
 * Prerequisitos: C1.4 (seeds corregidos)
 */

// Archivo: apps/backend/src/shared/enums/exercise-type.enum.ts

export enum ExerciseTypeEnum {
  // Existentes
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  SOPA_LETRAS = 'sopa_letras',
  MAPA_CONCEPTUAL = 'mapa_conceptual',
  EMPAREJAMIENTO = 'emparejamiento',
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',
  TRIBUNAL_OPINIONES = 'tribunal_opiniones',
  DEBATE_DIGITAL = 'debate_digital',
  ANALISIS_FUENTES = 'analisis_fuentes',
  PODCAST_ARGUMENTATIVO = 'podcast_argumentativo',
  MATRIZ_PERSPECTIVAS = 'matriz_perspectivas',
  VERIFICADOR_FAKE_NEWS = 'verificador_fake_news',
  INFOGRAFIA_INTERACTIVA = 'infografia_interactiva',
  QUIZ_TIKTOK = 'quiz_tiktok',
  NAVEGACION_HIPERTEXTUAL = 'navegacion_hipertextual',
  ANALISIS_MEMES = 'analisis_memes',
  DIARIO_MULTIMEDIA = 'diario_multimedia',
  COMIC_DIGITAL = 'comic_digital',
  VIDEO_CARTA = 'video_carta',
  COMPRENSION_AUDITIVA = 'comprension_auditiva',
  COLLAGE_PRENSA = 'collage_prensa',
  TEXTO_MOVIMIENTO = 'texto_movimiento',
  CALL_TO_ACTION = 'call_to_action',
  VERDADERO_FALSO = 'verdadero_falso',
  COMPLETAR_ESPACIOS = 'completar_espacios',

  // AGREGAR FALTANTES:
  DIARIO_INTERACTIVO = 'diario_interactivo', // Ya en DB
  RESUMEN_VISUAL = 'resumen_visual', // Ya en DB
  CAPSULA_TIEMPO = 'capsula_tiempo', // Faltaba en Backend
  COLLAGE_DIGITAL = 'collage_digital' // Faltaba en Backend
}

/**
 * NOTA: Eliminar duplicados:
 * - DIARIO_MULTIMEDIA y DIARIO_INTERACTIVO son diferentes versiones
 * - COLLAGE_DIGITAL y COLLAGE_PRENSA son diferentes versiones
 * - Mantener ambos por compatibilidad
 */

/**
 * Validación:
 * - npm run build
 * - Verificar uso en exercise DTOs
 * - Comparar con: SELECT unnest(enum_range(NULL::educational_content.exercise_type));
 */
```

---

##### C2.1.5-C2.1.6: Resto de sincronizaciones ENUM

```typescript
// ========================================
// CORRECCIÓN C2.1.5: Sincronizar MayaRank (ya cubierto en C1.2)
// ========================================

// Ver C1.2.1 para detalles completos

// ========================================
// CORRECCIÓN C2.1.6: Normalizar case sensitivity (17 ENUMs)
// ========================================

/**
 * PROBLEMA: DB usa lowercase, Backend usa UPPERCASE
 *
 * ENUMs afectados: achievement_category, achievement_type, aggregation_period,
 * alert_severity, attempt_result, classroom_role, comodin_type, content_status,
 * media_type, metric_type, module_status, notification_channel, processing_status,
 * progress_status, social_event_type, transaction_type, user_status
 *
 * Severidad: BAJA (funciona pero inconsistente)
 * Esfuerzo: 30 minutos
 * Prerequisitos: Ninguno
 */

/**
 * SOLUCIÓN: Backend usa correctamente uppercase para TypeScript
 * DB usa correctamente lowercase para PostgreSQL
 *
 * Los valores en el ENUM deben coincidir con la DB (lowercase)
 *
 * VERIFICAR que todos los ENUMs usan este patrón:
 */

// CORRECTO:
export enum AchievementCategoryEnum {
  PROGRESS = 'progress',     // TS name UPPERCASE, DB value lowercase
  STREAK = 'streak',
  COMPLETION = 'completion',
  SOCIAL = 'social',
  SPECIAL = 'special',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration'
}

// INCORRECTO:
export enum AchievementCategoryEnum {
  PROGRESS = 'PROGRESS',     // DB value en UPPERCASE - ERROR
  STREAK = 'STREAK',
  // ...
}

/**
 * Script de validación:
 */

// apps/backend/scripts/validate-enum-values.ts

import * as enums from '../src/shared/enums';

Object.entries(enums).forEach(([name, enumObj]) => {
  if (name.endsWith('Enum')) {
    Object.entries(enumObj).forEach(([key, value]) => {
      if (typeof value === 'string' && value === value.toUpperCase()) {
        console.warn(`⚠️  ${name}.${key} = '${value}' (debería ser lowercase)`);
      }
    });
  }
});

/**
 * Ejecución:
 * ts-node apps/backend/scripts/validate-enum-values.ts
 *
 * Corrección:
 * - Si encuentra valores en UPPERCASE, cambiar a lowercase
 * - npm run build
 * - npm run test
 */
```

---

#### Grupo 2.2: Decoradores UUID Faltantes (10 correcciones, 2-3 horas)

##### C2.2.1-C2.2.10: Agregar @IsUUID() en DTOs

```typescript
// ========================================
// CORRECCIÓN C2.2.1-10: Agregar @IsUUID() en 10 DTOs
// ========================================

/**
 * DTOs afectados:
 * - AchievementResponseDto (tenant_id)
 * - MediaResponseDto (tenant_id)
 * - ModuleResponseDto (tenant_id)
 * - RubricResponseDto (exercise_id, module_id)
 * - UserDetailsDto (id, tenant_id)
 * - UserRankResponseDto (tenant_id)
 * - UserStatsResponseDto (tenant_id)
 *
 * Severidad: ALTA
 * Esfuerzo: 15 minutos cada uno = 2.5 horas total
 * Prerequisitos: Ninguno
 */

/**
 * PATRÓN DE CORRECCIÓN:
 */

// Archivo: apps/backend/src/modules/auth/dto/user-details.dto.ts

// ANTES:
import { Expose } from 'class-transformer';

export class UserDetailsDto {
  @Expose()
  id: string; // Falta @IsUUID()

  @Expose()
  tenant_id?: string; // Falta @IsUUID() y @IsOptional()

  // ...
}

// DESPUÉS:
import { Expose } from 'class-transformer';
import { IsUUID, IsOptional } from 'class-validator';

export class UserDetailsDto {
  @IsUUID('4')
  @Expose()
  id: string;

  @IsUUID('4')
  @IsOptional()
  @Expose()
  tenant_id?: string;

  // ...
}

/**
 * Script de corrección batch:
 */

// apps/backend/scripts/add-uuid-decorators.sh

#!/bin/bash

# Lista de archivos a corregir
FILES=(
  "apps/backend/src/modules/gamification/dto/achievement-response.dto.ts"
  "apps/backend/src/modules/media/dto/media-response.dto.ts"
  "apps/backend/src/modules/educational-content/dto/module-response.dto.ts"
  "apps/backend/src/modules/educational-content/dto/rubric-response.dto.ts"
  "apps/backend/src/modules/auth/dto/user-details.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-rank-response.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-stats-response.dto.ts"
)

# Agregar import si no existe
for file in "${FILES[@]}"; do
  if ! grep -q "import.*IsUUID" "$file"; then
    sed -i "/import.*from 'class-validator'/s/}/,IsUUID}/" "$file" || \
    sed -i "1i import { IsUUID } from 'class-validator';" "$file"
  fi
done

echo "✅ Imports agregados"

# Mensaje para corrección manual
echo "⚠️  Agregar manualmente @IsUUID('4') antes de @Expose() en properties UUID"
echo "Archivos modificados: ${FILES[@]}"

/**
 * Ejecución:
 * chmod +x apps/backend/scripts/add-uuid-decorators.sh
 * ./apps/backend/scripts/add-uuid-decorators.sh
 *
 * LUEGO: Editar manualmente cada archivo para agregar @IsUUID('4')
 *
 * Ejemplo específico por DTO:
 */

// 1. AchievementResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
tenant_id?: string;

// 2. MediaResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
tenant_id?: string;

// 3. ModuleResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
tenant_id?: string;

// 4. RubricResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
exercise_id?: string;

@IsUUID('4')
@IsOptional()
@Expose()
module_id?: string;

// 5. UserDetailsDto (ya mostrado arriba)

// 6. UserRankResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
tenant_id?: string;

// 7. UserStatsResponseDto
@IsUUID('4')
@IsOptional()
@Expose()
tenant_id?: string;

/**
 * Validación:
 * - npm run build
 * - npm run test:e2e
 * - Probar endpoint con UUID inválido:
 *   curl -X POST /achievements -d '{"tenant_id": "invalid-uuid"}'
 * - Debe retornar: 400 Bad Request - tenant_id must be a UUID
 */
```

---

### Fase 3: MEDIO (P2 - 2 semanas, 30-35 horas)

**Objetivo:** Resolver 61 discrepancias de prioridad media

---

#### Grupo 3.1: Decoradores @IsInt() Faltantes (22 correcciones, 5-6 horas)

```typescript
// ========================================
// CORRECCIÓN GRUPO 3.1: Agregar @IsInt() en 22 properties
// ========================================

/**
 * DTOs afectados:
 * - CreateClassroomMemberDto (final_grade, attendance_percentage)
 * - ExerciseResponseDto (time_limit_minutes)
 * - LeaderboardEntryDto (total_ml_coins, current_streak, total_achievements)
 * - MediaResponseDto (file_size_bytes, width, height, duration_seconds)
 * - UpdateUserStatsDto (rank_progress, average_score)
 * - UploadMediaDto (file_size_bytes, width, height, duration_seconds)
 * - UserRankResponseDto (modules_required_for_next, xp_required_for_next)
 * - UserStatsResponseDto (average_score, global_rank_position, class_rank_position, school_rank_position)
 *
 * Severidad: MEDIA
 * Esfuerzo: 15 minutos cada uno = 5.5 horas total
 * Prerequisitos: Ninguno
 */

/**
 * PATRÓN DE CORRECCIÓN:
 */

// Ejemplo 1: CreateClassroomMemberDto

// ANTES:
@IsOptional()
@IsNumber()
@Min(0)
@Max(10)
final_grade?: number; // Falta @IsInt()

// DESPUÉS:
@IsOptional()
@IsInt()
@Min(0)
@Max(10)
final_grade?: number;

/**
 * NOTA: @IsInt() es más específico que @IsNumber()
 * Si el campo de DB es INTEGER, usar @IsInt()
 * Si el campo de DB es NUMERIC/DECIMAL, usar @IsNumber()
 */

// Ejemplo 2: MediaResponseDto

// ANTES:
@Expose()
file_size_bytes?: number; // Falta @IsInt()

@Expose()
width?: number; // Falta @IsInt()

// DESPUÉS:
@IsInt()
@IsOptional()
@Expose()
file_size_bytes?: number;

@IsInt()
@IsOptional()
@Expose()
width?: number;

/**
 * Script batch para agregar imports:
 */

#!/bin/bash

FILES=(
  "apps/backend/src/modules/classroom/dto/create-classroom-member.dto.ts"
  "apps/backend/src/modules/educational-content/dto/exercise-response.dto.ts"
  "apps/backend/src/modules/gamification/dto/leaderboard-entry.dto.ts"
  "apps/backend/src/modules/media/dto/media-response.dto.ts"
  "apps/backend/src/modules/gamification/dto/update-user-stats.dto.ts"
  "apps/backend/src/modules/media/dto/upload-media.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-rank-response.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-stats-response.dto.ts"
)

for file in "${FILES[@]}"; do
  if ! grep -q "import.*IsInt" "$file"; then
    sed -i "/import.*from 'class-validator'/s/}/,IsInt}/" "$file"
  fi
done

echo "✅ Imports agregados - Corregir manualmente decoradores"

/**
 * Validación:
 * - npm run build
 * - npm run test:e2e
 * - Probar con valores decimales:
 *   curl -X POST /classrooms/members -d '{"final_grade": 8.5}'
 * - Debe retornar error si @IsInt() está presente
 */
```

---

#### Grupo 3.2: Decoradores @IsDate/@IsISO8601() Faltantes (14 correcciones, 3-4 horas)

```typescript
// ========================================
// CORRECCIÓN GRUPO 3.2: Agregar decoradores de fecha
// ========================================

/**
 * DTOs afectados:
 * - ModuleResponseDto (published_at, archived_at)
 * - UserDetailsDto (email_confirmed_at, last_sign_in_at, created_at, updated_at)
 * - UserRankResponseDto (achieved_at, previous_rank_achieved_at)
 * - UserResponseDto (email_confirmed_at, last_sign_in_at)
 * - UserStatsResponseDto (last_ml_coins_reset, streak_started_at, last_activity_at, last_login_at)
 *
 * Severidad: MEDIA
 * Esfuerzo: 15 minutos cada uno = 3.5 horas total
 * Prerequisitos: Ninguno
 */

/**
 * PATRÓN DE CORRECCIÓN:
 */

// ANTES:
@Expose()
published_at?: Date; // Falta @IsISO8601() o @IsDateString()

// DESPUÉS (Opción A - para inputs):
@IsISO8601()
@IsOptional()
@Expose()
published_at?: Date;

// DESPUÉS (Opción B - para outputs):
@IsDateString()
@IsOptional()
@Expose()
published_at?: Date;

/**
 * DECISIÓN: ¿Cuál usar?
 *
 * - @IsISO8601(): Valida formato ISO 8601 estricto (2025-11-03T00:00:00Z)
 * - @IsDateString(): Más permisivo, acepta varios formatos de fecha
 * - @IsDate(): Para objetos Date de JavaScript (no strings)
 *
 * RECOMENDACIÓN: Usar @IsISO8601() para DTOs de input
 * Para DTOs de output/response, no es crítico pero mantener consistencia
 */

/**
 * Ejemplo completo: UserDetailsDto
 */

// Archivo: apps/backend/src/modules/auth/dto/user-details.dto.ts

import { Expose } from 'class-transformer';
import { IsUUID, IsOptional, IsISO8601, IsDateString } from 'class-validator';

export class UserDetailsDto {
  @IsUUID('4')
  @Expose()
  id: string;

  // ... otros campos

  @IsISO8601()
  @IsOptional()
  @Expose()
  email_confirmed_at?: Date;

  @IsISO8601()
  @IsOptional()
  @Expose()
  last_sign_in_at?: Date;

  @IsISO8601()
  @Expose()
  created_at: Date;

  @IsISO8601()
  @Expose()
  updated_at: Date;
}

/**
 * Script batch:
 */

#!/bin/bash

FILES=(
  "apps/backend/src/modules/educational-content/dto/module-response.dto.ts"
  "apps/backend/src/modules/auth/dto/user-details.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-rank-response.dto.ts"
  "apps/backend/src/modules/auth/dto/user-response.dto.ts"
  "apps/backend/src/modules/gamification/dto/user-stats-response.dto.ts"
)

for file in "${FILES[@]}"; do
  if ! grep -q "import.*IsISO8601" "$file"; then
    sed -i "/import.*from 'class-validator'/s/}/,IsISO8601,IsDateString}/" "$file"
  fi
done

echo "✅ Imports agregados"

/**
 * Validación:
 * - npm run build
 * - Probar con fecha inválida:
 *   curl -X POST /users -d '{"email_confirmed_at": "invalid-date"}'
 * - Debe retornar: 400 Bad Request - email_confirmed_at must be a valid ISO 8601 date string
 */
```

---

### Fase 4: BAJO (P3 - 3-4 semanas, 20-25 horas)

**Objetivo:** Completar 85 correcciones restantes de baja prioridad

---

#### Grupo 4.1: Decoradores @IsString() Faltantes (68 correcciones, 15-18 horas)

```typescript
// ========================================
// CORRECCIÓN GRUPO 4.1: Agregar @IsString() en 68 properties
// ========================================

/**
 * ANÁLISIS: Muchos campos ya tienen decoradores más específicos:
 * - @IsEmail() implica @IsString()
 * - @IsEnum() implica @IsString()
 * - @IsUUID() implica @IsString()
 * - @IsUrl() implica @IsString()
 * - @IsIP() implica @IsString()
 * - @IsDateString() implica @IsString()
 *
 * PREGUNTA: ¿Es necesario agregar @IsString() adicional?
 *
 * RESPUESTA: NO - Los decoradores específicos ya validan el tipo string
 *
 * Severidad: BAJA (nice to have, no crítico)
 * Esfuerzo: 12 minutos cada uno = 13.5 horas
 * Prerequisitos: Ninguno
 */

/**
 * DTOs más afectados:
 * - MediaResponseDto (16 properties)
 * - ModuleResponseDto (15 properties)
 * - ExerciseResponseDto (7 properties)
 * - AchievementResponseDto (5 properties)
 *
 * PATRÓN:
 */

// ANTES:
@Expose()
description?: string; // Campo text en DB

// DESPUÉS (si se decide agregar):
@IsString()
@IsOptional()
@Expose()
description?: string;

/**
 * RECOMENDACIÓN: NO agregar @IsString() en campos con decoradores más específicos
 * SOLO agregar en campos string simples sin validación adicional
 */

/**
 * Ejemplo: MediaResponseDto
 */

// Archivo: apps/backend/src/modules/media/dto/media-response.dto.ts

// Campos que SÍ necesitan @IsString():
@IsString()
@IsOptional()
@Expose()
description?: string;

@IsString()
@IsOptional()
@Expose()
alt_text?: string;

@IsString()
@IsOptional()
@Expose()
file_format?: string;

// Campos que NO necesitan @IsString() (ya tienen decorador específico):
@IsUrl() // Ya implica @IsString()
@IsOptional()
@Expose()
thumbnail_url?: string;

@IsEnum(MediaTypeEnum) // Ya implica @IsString()
@Expose()
media_type: MediaTypeEnum;

/**
 * Script de validación:
 */

// apps/backend/scripts/check-string-decorators.ts

import * as fs from 'fs';
import * as path from 'path';

const specificDecorators = [
  'IsEmail', 'IsEnum', 'IsUUID', 'IsUrl', 'IsIP',
  'IsDateString', 'IsISO8601', 'IsAlphanumeric'
];

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let prevLine = '';
  lines.forEach((line, i) => {
    // Si línea define property de tipo string
    if (line.match(/:\s*string\s*[;?]/)) {
      // Y línea anterior tiene @Expose() pero no decorador específico
      const hasSpecific = specificDecorators.some(dec =>
        prevLine.includes(`@${dec}`)
      );
      const hasString = prevLine.includes('@IsString');

      if (!hasSpecific && !hasString) {
        console.log(`${filePath}:${i+1} - Falta @IsString(): ${line.trim()}`);
      }
    }
    prevLine = line;
  });
}

// Ejecutar en todos los DTOs
// find apps/backend/src -name "*.dto.ts" -exec ts-node scripts/check-string-decorators.ts {} \;

/**
 * DECISIÓN FINAL: Prioridad BAJA
 * - Solo corregir si hay tiempo disponible
 * - Enfocarse primero en P0, P1, P2
 * - No bloquea funcionalidad
 */
```

---

## ✅ Validación Post-Corrección

### Tests Automatizados

```bash
# ========================================
# SUITE COMPLETA DE VALIDACIÓN
# ========================================

#!/bin/bash
# Archivo: apps/orchestration/scripts/validate-all-corrections.sh

echo "🧪 Iniciando validación completa..."

# 1. Validar compilación TypeScript
echo "1️⃣ Validando compilación..."
cd apps/backend
npm run build || { echo "❌ Build falló"; exit 1; }
echo "✅ Build exitoso"

# 2. Validar ENUMs
echo "2️⃣ Validando ENUMs..."
ts-node scripts/validate-enums.ts || { echo "❌ Validación ENUMs falló"; exit 1; }
echo "✅ ENUMs validados"

# 3. Validar seeds
echo "3️⃣ Validando seeds..."
cd ../database
psql -d gamilit_test -f schemas/reset-db.sql
psql -d gamilit_test -f seeds/dev/run-all-seeds.sql || { echo "❌ Seeds fallaron"; exit 1; }
echo "✅ Seeds ejecutados exitosamente"

# 4. Validar counts
echo "4️⃣ Validando datos insertados..."
psql -d gamilit_test -c "
SELECT
  schemaname,
  tablename,
  n_tup_ins as rows_inserted
FROM pg_stat_user_tables
WHERE schemaname IN ('educational_content', 'gamification_system', 'auth_management')
  AND n_tup_ins > 0
ORDER BY schemaname, tablename;
"

# 5. Tests unitarios
echo "5️⃣ Ejecutando tests unitarios..."
cd ../backend
npm run test || { echo "⚠️ Algunos tests fallaron"; }

# 6. Tests E2E
echo "6️⃣ Ejecutando tests E2E..."
npm run test:e2e || { echo "⚠️ Algunos tests E2E fallaron"; }

# 7. Validar decoradores
echo "7️⃣ Validando decoradores de DTOs..."
ts-node scripts/validate-dto-decorators.ts || { echo "⚠️ Algunos decoradores faltantes"; }

echo "✅ Validación completa finalizada"
```

### Validación Manual por Fase

#### Fase 1 (P0) - Checklist

```markdown
## Checklist Fase 1 (P0 - CRÍTICO)

### ENUMs Faltantes
- [ ] C1.1.1: AalLevelEnum creado y usado en auth DTOs
- [ ] C1.1.2: CodeChallengeMethodEnum creado y usado en OAuth
- [ ] C1.1.3: GamilitRoleEnum creado y usado en auth guards
- [ ] C1.1.4: RangoMayaEnum creado y usado en gamification
- [ ] C1.1.5: BucketTypeEnum creado y usado en storage

**Validación:**
```bash
# Verificar ENUMs exportados
grep -r "export.*Enum" apps/backend/src/shared/enums/index.ts
# Debe incluir los 5 nuevos ENUMs

# Verificar uso en DTOs
grep -r "@IsEnum(AalLevelEnum)" apps/backend/src
grep -r "@IsEnum(CodeChallengeMethodEnum)" apps/backend/src
grep -r "@IsEnum(GamilitRoleEnum)" apps/backend/src
grep -r "@IsEnum(RangoMayaEnum)" apps/backend/src
grep -r "@IsEnum(BucketTypeEnum)" apps/backend/src
```

### MayaRank Duplicado
- [ ] C1.2.1: MayaRankGamificationEnum creado
- [ ] C1.2.1: MayaRankBasicEnum creado
- [ ] C1.2.1: Referencias actualizadas en código
- [ ] C1.2.1: Seeds usan valores correctos según esquema

**Validación:**
```sql
-- Verificar valores en cada tabla
SELECT DISTINCT maya_rank FROM gamification_system.user_ranks;
-- Debe retornar: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan

SELECT DISTINCT rank FROM public.rango_maya;
-- Debe retornar: nacom, batab, holcatte, guerrero, mercenario
```

### Tablas Faltantes
- [ ] C1.3.1: Tabla system_metrics creada o seed eliminado
- [ ] C1.3.2: Seed marie-curie usa tabla correcta
- [ ] C1.3.3: Tabla tags creada y poblada

**Validación:**
```sql
-- Verificar existencia de tablas
\dt audit_logging.system_metrics
\dt content_management.tags
\dt content_management.module_tags

-- Verificar datos
SELECT COUNT(*) FROM content_management.tags; -- Debe ser > 0
```

### Seeds con ENUM Inválidos
- [ ] C1.4: Script fix-exercise-types.sh ejecutado
- [ ] C1.4: 16 valores ENUM corregidos
- [ ] C1.4: Seeds ejecutan sin errores
- [ ] C1.4: Todos exercise_type son válidos

**Validación:**
```sql
-- Verificar que todos los tipos son válidos
SELECT DISTINCT exercise_type
FROM educational_content.exercises
ORDER BY exercise_type;

-- Comparar con ENUM
SELECT unnest(enum_range(NULL::educational_content.exercise_type))
ORDER BY 1;

-- NO debe haber diferencias
```

### Suite Completa
- [ ] npm run build - exitoso
- [ ] npm run test - todos pasan
- [ ] Seeds ejecutan sin errores
- [ ] 0 errores de TypeScript
- [ ] Code review aprobado
- [ ] Merge a develop
```

---

#### Fase 2 (P1) - Checklist

```markdown
## Checklist Fase 2 (P1 - ALTO)

### Sincronización ENUMs
- [ ] C2.1.1: ContentTypeEnum corregido
- [ ] C2.1.2: DifficultyLevelEnum sincronizado (DB+Backend)
- [ ] C2.1.3: NotificationTypeEnum unificado
- [ ] C2.1.4: ExerciseTypeEnum completo
- [ ] C2.1.6: Case sensitivity normalizado (17 ENUMs)

**Validación:**
```typescript
// Probar endpoints con valores ENUM
curl -X POST /content -d '{"content_type": "video"}' # Debe funcionar
curl -X POST /modules -d '{"difficulty_level": "very_easy"}' # Debe funcionar
curl -X POST /notifications -d '{"type": "mission"}' # Debe funcionar
```

### Decoradores UUID
- [ ] C2.2.1-10: @IsUUID() agregado en 10 DTOs
- [ ] Validación UUID funciona en endpoints

**Validación:**
```bash
# Probar validación UUID
curl -X POST /achievements -d '{"tenant_id": "invalid-uuid"}'
# Debe retornar: 400 Bad Request

curl -X POST /achievements -d '{"tenant_id": "550e8400-e29b-41d4-a716-446655440000"}'
# Debe funcionar
```

### Suite Completa
- [ ] npm run build - exitoso
- [ ] npm run test:e2e - todos pasan
- [ ] Validación UUID funciona
- [ ] ENUMs aceptan todos los valores esperados
- [ ] Code review aprobado
- [ ] Merge a develop
```

---

#### Fase 3 (P2) - Checklist

```markdown
## Checklist Fase 3 (P2 - MEDIO)

### Decoradores @IsInt()
- [ ] Grupo 3.1: 22 decoradores @IsInt() agregados
- [ ] Validación rechaza valores decimales donde corresponde

**Validación:**
```bash
# Probar validación integer
curl -X POST /classrooms/members -d '{"final_grade": 8.5}'
# Debe retornar error si campo es INTEGER en DB

curl -X POST /classrooms/members -d '{"final_grade": 8}'
# Debe funcionar
```

### Decoradores de Fecha
- [ ] Grupo 3.2: 14 decoradores de fecha agregados
- [ ] Validación ISO8601 funciona

**Validación:**
```bash
# Probar validación fecha
curl -X POST /users -d '{"email_confirmed_at": "invalid-date"}'
# Debe retornar: 400 Bad Request

curl -X POST /users -d '{"email_confirmed_at": "2025-11-03T00:00:00Z"}'
# Debe funcionar
```

### Suite Completa
- [ ] npm run build - exitoso
- [ ] Validaciones numéricas funcionan
- [ ] Validaciones de fecha funcionan
- [ ] Code review aprobado
- [ ] Merge a develop
```

---

#### Fase 4 (P3) - Checklist

```markdown
## Checklist Fase 4 (P3 - BAJO)

### Decoradores @IsString()
- [ ] Grupo 4.1: @IsString() agregado en campos sin decorador específico
- [ ] Decisión tomada sobre campos con decoradores específicos

**Nota:** Esta fase es opcional y puede omitirse si:
- Tiempo limitado
- Prioridades más altas
- Los decoradores específicos ya proveen validación suficiente

### Suite Completa
- [ ] npm run build - exitoso
- [ ] Cobertura de decoradores aumentó
- [ ] Documentación actualizada
- [ ] Code review aprobado (si se implementa)
```

---

## 📊 Timeline y Asignación

| Fase | Duración | Correcciones | Responsable | Revisión |
|------|----------|--------------|-------------|----------|
| **P0** | 2-3 días | 27 críticas | Backend Team Lead | Tech Lead + Architect |
| **P1** | 1 semana | 16 altas | Backend Team | Tech Lead |
| **P2** | 2 semanas | 61 medias | Backend + Junior Devs | Senior Dev |
| **P3** | 3-4 semanas | 85 bajas | Junior Devs (opcional) | Senior Dev |

### Asignación Detallada

**Fase P0 (Crítico):**
- **Developer 1:** ENUMs faltantes (C1.1.1-C1.1.5)
- **Developer 2:** MayaRank duplicado (C1.2.1)
- **Developer 3:** Tablas faltantes (C1.3.1-C1.3.3)
- **Developer 4:** Seeds ENUM inválidos (C1.4.1-C1.4.16)

**Fase P1 (Alto):**
- **Developer 1:** Sincronización ENUMs (C2.1.1-C2.1.6)
- **Developer 2:** Decoradores UUID (C2.2.1-C2.2.10)

**Fase P2 (Medio):**
- **Developer 1-2:** Decoradores @IsInt() (Grupo 3.1)
- **Developer 3:** Decoradores fecha (Grupo 3.2)

**Fase P3 (Bajo - Opcional):**
- **Junior Devs:** Decoradores @IsString() (Grupo 4.1)

---

## 🎯 Criterios de Éxito

### Por Fase

**Fase 1 (P0) - CRÍTICO:**
- ✅ 5 ENUMs creados y usados en código
- ✅ MayaRank duplicado resuelto
- ✅ 3 tablas creadas o seeds corregidos
- ✅ 16 valores ENUM en seeds corregidos
- ✅ 0 errores al ejecutar seeds
- ✅ npm run build exitoso
- ✅ Tests críticos pasan

**Fase 2 (P1) - ALTO:**
- ✅ 6 ENUMs sincronizados entre DB y Backend
- ✅ 10 decoradores @IsUUID() agregados
- ✅ Validación UUID funciona en endpoints
- ✅ ENUMs aceptan todos los valores esperados
- ✅ npm run test:e2e exitoso

**Fase 3 (P2) - MEDIO:**
- ✅ 22 decoradores @IsInt() agregados
- ✅ 14 decoradores de fecha agregados
- ✅ Validaciones numéricas funcionan
- ✅ Validaciones de fecha funcionan
- ✅ Cobertura de validación aumenta a 85%+

**Fase 4 (P3) - BAJO:**
- ✅ Decoradores @IsString() agregados (opcional)
- ✅ Cobertura de validación aumenta a 95%+
- ✅ Documentación actualizada

### Global

- ✅ **100% seeds ejecutan sin errores**
- ✅ **0 errores de TypeScript**
- ✅ **0 discrepancias críticas**
- ✅ **< 5 discrepancias de alta prioridad**
- ✅ **Índice de calidad global: 90%+**
- ✅ **Cobertura de tipos: 85%+**
- ✅ **Code review aprobado**
- ✅ **Documentación actualizada**
- ✅ **Tests E2E pasan**

---

## 📁 Archivos Generados

### Scripts SQL

```bash
/orchestration/scripts-correccion/
├── fase-1-p0/
│   ├── 01-create-aal-level-enum.sql
│   ├── 02-create-code-challenge-method-enum.sql
│   ├── 03-create-gamilit-role-enum.sql
│   ├── 04-create-rango-maya-enum.sql
│   ├── 05-create-bucket-type-enum.sql
│   ├── 06-create-system-metrics-table.sql
│   ├── 07-fix-marie-curie-seed.sql
│   ├── 08-create-tags-table.sql
│   └── 09-fix-exercise-types-seeds.sql
├── fase-2-p1/
│   ├── 10-sync-difficulty-level.sql
│   ├── 11-sync-notification-type.sql
│   └── 12-normalize-enum-case.sql
└── fase-3-p2/
    └── (no scripts SQL necesarios)
```

### Scripts TypeScript

```bash
/orchestration/code-correccion/
├── fase-1-p0/
│   ├── enums/
│   │   ├── aal-level.enum.ts
│   │   ├── code-challenge-method.enum.ts
│   │   ├── gamilit-role.enum.ts
│   │   ├── rango-maya.enum.ts
│   │   ├── bucket-type.enum.ts
│   │   ├── maya-rank-gamification.enum.ts
│   │   └── maya-rank-basic.enum.ts
│   └── scripts/
│       └── fix-exercise-types.sh
├── fase-2-p1/
│   ├── enums/
│   │   ├── content-type.enum.ts (updated)
│   │   ├── difficulty-level.enum.ts (updated)
│   │   ├── notification-type.enum.ts (updated)
│   │   └── exercise-type.enum.ts (updated)
│   └── scripts/
│       ├── add-uuid-decorators.sh
│       └── validate-enum-values.ts
├── fase-3-p2/
│   └── scripts/
│       ├── add-isint-decorators.sh
│       └── add-date-decorators.sh
└── fase-4-p3/
    └── scripts/
        ├── add-isstring-decorators.sh
        └── check-string-decorators.ts
```

### Scripts de Validación

```bash
/orchestration/scripts-correccion/validation/
├── validate-all-corrections.sh
├── validate-enums.ts
├── validate-dto-decorators.ts
└── validate-seeds.sh
```

---

## 📈 Métricas de Progreso

### Tracking por Fase

```markdown
## Estado de Correcciones

### Fase 1 (P0) - CRÍTICO
**Progreso:** 0/27 (0%)
- [ ] ENUMs faltantes: 0/5
- [ ] MayaRank duplicado: 0/1
- [ ] Tablas faltantes: 0/3
- [ ] Seeds ENUM inválidos: 0/16
- [ ] Tests: 0%

### Fase 2 (P1) - ALTO
**Progreso:** 0/16 (0%)
- [ ] Sincronización ENUMs: 0/6
- [ ] Decoradores UUID: 0/10
- [ ] Tests: 0%

### Fase 3 (P2) - MEDIO
**Progreso:** 0/61 (0%)
- [ ] Decoradores @IsInt(): 0/22
- [ ] Decoradores fecha: 0/14
- [ ] Tests: 0%

### Fase 4 (P3) - BAJO
**Progreso:** 0/85 (0%)
- [ ] Decoradores @IsString(): 0/68
- [ ] Tests: 0%

**TOTAL:** 0/148 (0%)
```

---

## 🚨 Riesgos y Mitigación

### Riesgos Identificados

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Seeds legacy incompatibles | Alto | Media | Hacer backup antes de corregir, mantener seeds antiguos en `/legacy` |
| MayaRank rompe funcionalidad | Alto | Media | Tests exhaustivos, despliegue gradual, feature flag |
| Tiempo insuficiente P0 | Alto | Baja | Priorizar solo P0, posponer P1-P3 si necesario |
| Conflictos en merge | Medio | Alta | Branches por fase, merge incremental, code review |
| Breaking changes en producción | Crítico | Baja | NO tocar ENUMs en prod, solo agregar valores nuevos |
| Decoradores rompen validación existente | Medio | Media | Tests E2E completos, validar endpoints críticos |

### Plan de Rollback

```markdown
## Rollback por Fase

### Fase 1 (P0)
**Si algo falla:**
1. Revertir commit de seeds
2. Eliminar ENUMs nuevos de backend
3. Ejecutar: `git revert HEAD~5..HEAD`
4. Redeployar versión anterior
5. Restaurar backup de DB

### Fase 2-4
**Si algo falla:**
1. Revertir solo el commit problemático
2. No afecta funcionalidad crítica
3. Continuar con correcciones restantes
```

---

## 📝 Notas Importantes

### Decisiones Pendientes

1. **MayaRank Duplicado (C1.2.1):**
   - ¿Mantener dos sistemas de rangos?
   - ¿Migrar todo a un solo sistema?
   - **Requiere:** Decisión de producto

2. **exercise_type (C1.4):**
   - ¿Usar español o inglés?
   - ¿Actualizar DDL ENUM o solo seeds?
   - **Recomendación:** Mantener español en DB, actualizar seeds

3. **Tablas faltantes (C1.3):**
   - ¿Crear system_metrics o eliminar seed?
   - ¿content_management.content es necesaria?
   - **Requiere:** Revisión con DevOps/Arquitecto

4. **@IsString() (Fase 4):**
   - ¿Agregar en campos con decorador específico?
   - **Recomendación:** NO, es redundante

### Contactos

- **Tech Lead:** Para decisiones arquitectónicas
- **Product Owner:** Para decisiones de diseño (MayaRank)
- **DevOps:** Para decisiones de infraestructura (system_metrics)
- **QA Lead:** Para validación completa

---

## 🎬 Próximos Pasos

### Inmediatos (Hoy)

1. ✅ **Revisar este plan con Tech Lead**
2. ✅ **Obtener aprobación para Fase P0**
3. ✅ **Crear branch: `fix/phase-0-critical-discrepancies`**
4. ✅ **Asignar tareas a developers**

### Esta Semana (Fase P0)

1. **Día 1-2:**
   - Crear 5 ENUMs faltantes
   - Resolver MayaRank duplicado

2. **Día 2-3:**
   - Crear tablas faltantes
   - Corregir seeds con ENUM inválidos

3. **Día 3:**
   - Tests completos
   - Code review
   - Merge a develop

### Próximas 2 Semanas (Fase P1)

1. **Semana 1:**
   - Sincronizar ENUMs
   - Agregar decoradores UUID

2. **Semana 2:**
   - Tests E2E completos
   - Merge a develop

### Próximo Mes (Fase P2-P3)

- Completar decoradores restantes
- Aumentar cobertura de validación
- Documentación final

---

**Generado por:** ATLAS-DATABASE (SA-VAL-012)
**Timestamp:** 2025-11-03T06:30:00Z
**Versión:** 1.0
