# Tipos y ENUMs de Base de Datos - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-10-27

---

## Resumen Ejecutivo

- **Total de ENUMs:** 24 tipos enumerados
- **Tipos personalizados:** Basados en PostgreSQL ENUMs
- **Validación:** Constraints a nivel de base de datos
- **Ubicación:** Creados en `00_prerequisites.sql`

---

## 1. ENUMs de Autenticación y Usuarios

### 1.1 `gamilit_role` - Roles de Usuario

**Propósito:** Define los tres roles principales de la plataforma.

```sql
CREATE TYPE gamilit_role AS ENUM (
    'student',
    'admin_teacher',
    'super_admin'
);
```

**Valores:**
- `student` - Estudiante regular (rol por defecto)
- `admin_teacher` - Profesor con permisos administrativos
- `super_admin` - Administrador de plataforma (acceso completo)

**Uso en:**
- `auth_management.profiles.role`
- `auth_management.user_roles.role`
- `system_configuration.feature_flags.target_roles`

**Permisos asociados:**
- **student:** Solo lectura de su propio contenido
- **admin_teacher:** Gestión de aulas, estudiantes y contenido educativo
- **super_admin:** Acceso completo a configuración de sistema

---

### 1.2 `user_status` - Estado de Usuario

**Propósito:** Estado de activación de cuentas de usuario.

```sql
CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'banned',
    'pending'
);
```

**Valores:**
| Estado | Descripción | Puede Iniciar Sesión |
|--------|-------------|---------------------|
| `active` | Usuario activo normal | ✓ |
| `inactive` | Usuario inactivo (sin uso reciente) | ✓ |
| `suspended` | Suspensión temporal | ✗ |
| `banned` | Ban permanente | ✗ |
| `pending` | Pendiente de verificación | ~ (limitado) |

**Uso en:**
- `auth_management.profiles.status`
- Validaciones en login y autorización

**Transiciones comunes:**
```
pending → active (verificación exitosa)
active → inactive (inactividad > 90 días)
active → suspended (violación de políticas - temporal)
active → banned (violación grave - permanente)
suspended → active (fin de suspensión)
```

---

## 2. ENUMs de Gamificación

### 2.1 `rango_maya` - Rangos Maya

**Propósito:** Sistema de progresión de rangos inspirado en la cultura Maya.

```sql
CREATE TYPE rango_maya AS ENUM (
    'nacom',
    'batab',
    'holcatte',
    'guerrero',
    'mercenario'
);
```

**Valores (en orden de progresión):**

| Rango | Traducción | Módulos Requeridos | Multiplicador ML | Descripción |
|-------|------------|-------------------|------------------|-------------|
| `nacom` | Guerrero Iniciado | 0 (inicial) | 1.0x | Rango inicial |
| `batab` | Jefe Local | 1 | 1.25x | Primer ascenso |
| `holcatte` | Guerrero Elite | 2 | 1.5x | Rango intermedio |
| `guerrero` | Guerrero Distinguido | 3 | 1.75x | Rango avanzado |
| `mercenario` | Guerrero Legendario | 5 | 2.0x | Rango máximo |

**Uso en:**
- `gamification_system.user_ranks.current_rank`
- `gamification_system.user_ranks.previous_rank`
- `educational_content.modules.rango_maya_required`
- `educational_content.modules.rango_maya_granted`

**Multiplicadores de ML Coins:**
Los rangos otorgan multiplicadores que incrementan las ganancias de ML Coins:

```sql
-- Ejemplo de cálculo con multiplicador
Base ML Coins: 50
Rango Ajaw: 50 × 1.0 = 50 ML
Rango Nacom: 50 × 1.25 = 62.5 ML (redondeado a 62)
Rango K'uk'ulkan: 50 × 2.0 = 100 ML
```

**Función relacionada:**
```sql
gamification_system.get_user_rank_requirements(p_current_rank rango_maya)
-- Retorna: next_rank, modules_required, xp_required, ml_coins_bonus
```

---

### 2.2 `achievement_type` - Tipo de Achievement

**Propósito:** Clasificación general de logros.

```sql
CREATE TYPE achievement_type AS ENUM (
    'badge',
    'milestone',
    'special',
    'rank_promotion'
);
```

**Valores:**
- `badge` - Insignia desbloqueable
- `milestone` - Hito de progreso
- `special` - Logro especial/evento
- `rank_promotion` - Promoción de rango

**Uso en:**
- `gamification_system.achievements` (legacy - ahora se usa `achievement_category`)

---

### 2.3 `achievement_category` - Categoría de Achievement

**Propósito:** Categorización detallada de logros para organización y filtrado.

```sql
CREATE TYPE achievement_category AS ENUM (
    'progress',
    'streak',
    'completion',
    'social',
    'special',
    'mastery',
    'exploration'
);
```

**Valores y Ejemplos:**

| Categoría | Descripción | Ejemplo |
|-----------|-------------|---------|
| `progress` | Logros de progreso cuantitativo | "Completaste 10 ejercicios" |
| `streak` | Rachas de días consecutivos | "7 días seguidos activo" |
| `completion` | Finalización de módulos/cursos | "Completaste módulo Marie Curie" |
| `social` | Interacciones sociales | "Agregaste 5 amigos" |
| `special` | Logros únicos/eventos | "Participaste en evento especial" |
| `mastery` | Dominio de habilidades | "100% de precisión en módulo" |
| `exploration` | Descubrimiento de contenido | "Exploraste todo el contenido bonus" |

**Uso en:**
- `gamification_system.achievements.category`

---

### 2.4 `comodin_type` - Tipos de Power-ups

**Propósito:** Tres tipos de comodines (power-ups) disponibles en la plataforma.

```sql
CREATE TYPE comodin_type AS ENUM (
    'pistas',
    'vision_lectora',
    'segunda_oportunidad'
);
```

**Valores:**

| Comodín | Costo ML | Función |
|---------|----------|---------|
| `pistas` | 15 ML | Proporciona pistas adicionales en ejercicios |
| `vision_lectora` | 25 ML | Resalta texto clave en lecturas |
| `segunda_oportunidad` | 40 ML | Permite reintentar un ejercicio sin penalización |

**Uso en:**
- `educational_content.exercises.comodines_allowed` (array de comodin_type[])
- `progress_tracking.exercise_attempts.comodines_used` (JSONB)
- `gamification_system.comodines_inventory` (columnas específicas)

**Ejemplo de uso en ejercicios:**
```sql
-- Array de comodines permitidos
comodines_allowed comodin_type[] DEFAULT
    ARRAY['pistas','vision_lectora','segunda_oportunidad']::comodin_type[]

-- Registro de comodín usado
comodines_used JSONB:
{
    "pistas": 2,
    "vision_lectora": 1,
    "segunda_oportunidad": 0
}
```

---

### 2.5 `transaction_type` - Tipos de Transacciones ML Coins

**Propósito:** Clasificación de todas las transacciones de ML Coins.

```sql
CREATE TYPE transaction_type AS ENUM (
    'earned_exercise',
    'earned_achievement',
    'earned_daily_bonus',
    'earned_rank_promotion',
    'spent_hint',
    'spent_unlock_content',
    'spent_customization',
    'refund',
    'admin_adjustment',
    'gift'
);
```

**Valores:**

#### Ganadas (Earned):
- `earned_exercise` - ML Coins por completar ejercicio
- `earned_achievement` - ML Coins por desbloquear logro
- `earned_daily_bonus` - Bonus diario por racha
- `earned_rank_promotion` - Bonus por subir de rango

#### Gastadas (Spent):
- `spent_hint` - Compra de pistas
- `spent_unlock_content` - Desbloqueo de contenido premium
- `spent_customization` - Compra de personalizaciones

#### Administrativas:
- `refund` - Reembolso de ML Coins
- `admin_adjustment` - Ajuste manual por admin
- `gift` - Regalo de ML Coins

**Uso en:**
- `gamification_system.ml_coins_transactions.transaction_type`

**Ejemplo de transacción:**
```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,
    amount,
    balance_before,
    balance_after,
    transaction_type,
    description,
    reference_type,
    multiplier
) VALUES (
    'user-uuid',
    75,  -- 50 base × 1.5 (Ah K'in multiplier)
    200,
    275,
    'earned_exercise',
    'Ejercicio de Física - Marie Curie',
    'exercise',
    1.50
);
```

---

## 3. ENUMs de Contenido Educativo

### 3.1 `exercise_type` - Tipos de Ejercicios

**Propósito:** Define las 27 mecánicas de ejercicios disponibles en la plataforma.

```sql
CREATE TYPE exercise_type AS ENUM (
    'multiple_choice',
    'multiple_selection',
    'true_false',
    'fill_in_blank',
    'matching',
    'ordering',
    'classification',
    'word_search',
    'crossword',
    'drag_and_drop',
    'image_selection',
    'audio_question',
    'video_question',
    'timeline',
    'map_interaction',
    'code_exercise',
    'essay',
    'short_answer',
    'file_upload',
    'discussion',
    'peer_review',
    'simulation',
    'virtual_lab',
    'interactive_diagram',
    'calculation',
    'graphing',
    'data_analysis'
);
```

**Clasificación por Categoría:**

#### Básicos (Multiple Choice Family):
- `multiple_choice` - Selección única
- `multiple_selection` - Selección múltiple
- `true_false` - Verdadero/Falso
- `fill_in_blank` - Completar espacios

#### Interactivos (Matching & Ordering):
- `matching` - Emparejar elementos
- `ordering` - Ordenar secuencias
- `classification` - Clasificar por categorías
- `word_search` - Sopa de letras
- `crossword` - Crucigrama

#### Multimedia:
- `drag_and_drop` - Arrastrar y soltar
- `image_selection` - Selección en imágenes
- `audio_question` - Pregunta con audio
- `video_question` - Pregunta con video

#### Interacciones Complejas:
- `timeline` - Línea de tiempo interactiva
- `map_interaction` - Interacción con mapas

#### Código y STEM:
- `code_exercise` - Ejercicio de programación
- `calculation` - Cálculos matemáticos
- `graphing` - Graficación
- `data_analysis` - Análisis de datos

#### Respuesta Abierta:
- `essay` - Ensayo largo
- `short_answer` - Respuesta corta
- `file_upload` - Subida de archivos

#### Colaborativos:
- `discussion` - Discusión grupal
- `peer_review` - Revisión por pares

#### Simulaciones:
- `simulation` - Simulación interactiva
- `virtual_lab` - Laboratorio virtual
- `interactive_diagram` - Diagrama interactivo

**Uso en:**
- `educational_content.exercises.exercise_type`

**Ejemplo de configuración:**
```json
{
    "type": "multiple_choice",
    "config": {
        "randomize_options": true,
        "show_feedback": true,
        "time_limit": 120
    }
}
```

---

### 3.2 `difficulty_level` - Nivel de Dificultad

**Propósito:** 8 niveles de dificultad para granularidad en ejercicios y módulos.

```sql
CREATE TYPE difficulty_level AS ENUM (
    'very_easy',
    'easy',
    'medium',
    'hard',
    'very_hard',
    'beginner',
    'intermediate',
    'advanced'
);
```

**Valores:**

#### Sistema Tradicional:
- `very_easy` - Muy fácil
- `easy` - Fácil
- `medium` - Medio
- `hard` - Difícil
- `very_hard` - Muy difícil

#### Sistema de Experiencia:
- `beginner` - Principiante
- `intermediate` - Intermedio
- `advanced` - Avanzado

**Uso en:**
- `educational_content.modules.difficulty_level`
- `educational_content.exercises.difficulty_level`
- `gamification_system.achievements.difficulty_level`
- `content_management.marie_curie_content.difficulty_level`

**Mapeo recomendado:**
```
very_easy     → beginner
easy          → beginner
medium        → intermediate
hard          → intermediate/advanced
very_hard     → advanced
```

---

### 3.3 `module_status` / `content_status` - Estado de Contenido

**Propósito:** Estado de publicación de módulos y contenido.

```sql
CREATE TYPE module_status AS ENUM (
    'draft',
    'published',
    'archived',
    'under_review'
);

-- Duplicado como content_status para flexibilidad
CREATE TYPE content_status AS ENUM (
    'draft',
    'published',
    'archived',
    'under_review'
);
```

**Valores:**
- `draft` - Borrador en desarrollo
- `published` - Publicado y visible
- `archived` - Archivado (no visible)
- `under_review` - En revisión por administradores

**Uso en:**
- `educational_content.modules.status`
- `content_management.marie_curie_content.status`

**Flujo de publicación:**
```
draft → under_review → published
                    ↓
                 archived
```

---

### 3.4 `media_type` - Tipo de Media

**Propósito:** Clasificación de archivos multimedia.

```sql
CREATE TYPE media_type AS ENUM (
    'image',
    'video',
    'audio',
    'document',
    'animation',
    '3d_model'
);
```

**Valores:**
- `image` - Imágenes (JPG, PNG, WebP, SVG)
- `video` - Videos (MP4, WebM, MOV)
- `audio` - Audio (MP3, WAV, OGG)
- `document` - Documentos (PDF, DOCX)
- `animation` - Animaciones (GIF, CSS animations)
- `3d_model` - Modelos 3D (GLB, GLTF)

**Uso en:**
- `educational_content.media_resources.media_type`
- `content_management.media_files.media_type`

---

### 3.5 `processing_status` - Estado de Procesamiento

**Propósito:** Estado de procesamiento de archivos multimedia.

```sql
CREATE TYPE processing_status AS ENUM (
    'uploading',
    'processing',
    'ready',
    'error',
    'optimizing'
);
```

**Valores:**
- `uploading` - Subida en progreso
- `processing` - Procesamiento (conversión, thumbnails)
- `ready` - Listo para uso
- `error` - Error en procesamiento
- `optimizing` - Optimización (compresión)

**Uso en:**
- `educational_content.media_resources.processing_status`
- `content_management.media_files.processing_status`

---

### 3.6 `content_type` - Tipo de Contenido Marie Curie

**Propósito:** Clasificación de contenido educativo sobre Marie Curie.

```sql
CREATE TYPE content_type AS ENUM (
    'video',
    'text',
    'interactive',
    'quiz',
    'game',
    'simulation'
);
```

**Valores:**
- `video` - Contenido en video
- `text` - Contenido textual
- `interactive` - Contenido interactivo
- `quiz` - Quiz/cuestionario
- `game` - Juego educativo
- `simulation` - Simulación

---

## 4. ENUMs de Progreso

### 4.1 `progress_status` - Estado de Progreso

**Propósito:** Estado del progreso del estudiante en módulos.

```sql
CREATE TYPE progress_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'locked'
);
```

**Valores:**
- `not_started` - No iniciado
- `in_progress` - En progreso
- `completed` - Completado
- `locked` - Bloqueado (requisitos no cumplidos)

**Uso en:**
- `progress_tracking.module_progress.status`

**Transiciones:**
```
locked → not_started (al cumplir prerequisitos)
not_started → in_progress (al iniciar primer ejercicio)
in_progress → completed (al completar todos los ejercicios)
```

---

### 4.2 `attempt_result` - Resultado de Intento

**Propósito:** Resultado de un intento de ejercicio.

```sql
CREATE TYPE attempt_result AS ENUM (
    'correct',
    'incorrect',
    'partial',
    'skipped'
);
```

**Valores:**
- `correct` - Respuesta correcta (100%)
- `incorrect` - Respuesta incorrecta
- `partial` - Respuesta parcialmente correcta
- `skipped` - Ejercicio omitido

**Uso en:**
- Evaluación de ejercicios (ahora se usa campo `is_correct` BOOLEAN)

---

## 5. ENUMs de Sistema

### 5.1 `classroom_role` - Rol en Aula

**Propósito:** Rol de usuario dentro de un aula específica.

```sql
CREATE TYPE classroom_role AS ENUM (
    'teacher',
    'student',
    'assistant'
);
```

**Valores:**
- `teacher` - Profesor (propietario del aula)
- `student` - Estudiante
- `assistant` - Asistente/co-profesor

---

### 5.2 `alert_severity` - Severidad de Alertas

**Propósito:** Nivel de severidad de alertas del sistema.

```sql
CREATE TYPE alert_severity AS ENUM (
    'info',
    'warning',
    'error',
    'critical'
);
```

**Valores:**
- `info` - Informativo
- `warning` - Advertencia
- `error` - Error
- `critical` - Crítico

**Uso en:**
- `audit_logging.system_alerts.severity`

---

## 6. Validación y Constraints

### 6.1 Validación a Nivel de Base de Datos

Los ENUMs proporcionan validación automática a nivel de PostgreSQL:

```sql
-- Intento de insertar valor inválido
INSERT INTO profiles (role) VALUES ('invalid_role');
-- ERROR: invalid input value for enum gamilit_role: "invalid_role"

-- Valores válidos solamente
INSERT INTO profiles (role) VALUES ('student');  -- ✓ OK
```

### 6.2 Check Constraints Adicionales

Algunos campos combinan ENUMs con CHECK constraints:

```sql
-- Ejemplo: subscription_tier con CHECK adicional
subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise'))

-- Ejemplo: device_type con CHECK
device_type TEXT
    CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown'))
```

---

## 7. Migraciones de ENUMs

### 7.1 Agregar Valores a ENUM

```sql
-- Agregar nuevo valor al final
ALTER TYPE exercise_type ADD VALUE 'new_type';

-- Agregar valor en posición específica (PostgreSQL 12+)
ALTER TYPE exercise_type ADD VALUE 'new_type' BEFORE 'existing_type';
```

### 7.2 Eliminar Valores de ENUM

**NOTA:** PostgreSQL no permite eliminar valores de ENUMs directamente.
Opciones:
1. Crear nuevo ENUM y migrar datos
2. Usar TEXT con CHECK constraint en su lugar

### 7.3 Renombrar ENUM

```sql
ALTER TYPE old_enum_name RENAME TO new_enum_name;
```

---

## 8. Conversión de ENUMs

### 8.1 ENUM a TEXT

```sql
SELECT role::TEXT FROM profiles;
```

### 8.2 TEXT a ENUM

```sql
SELECT 'student'::gamilit_role;
```

### 8.3 Comparación de ENUMs

```sql
-- Los ENUMs mantienen el orden definido
SELECT * FROM user_ranks
WHERE current_rank > 'nacom';  -- Retorna batab, holcatte, guerrero, mercenario
```

---

## 9. Buenas Prácticas

### 9.1 Nombrado
- Usar `snake_case`
- Nombres descriptivos y en español cuando aplique (ej: `rango_maya`, `comodin_type`)
- Sufijos claros: `_type`, `_status`, `_level`, `_category`

### 9.2 Valores
- Usar lowercase
- Separar palabras con guiones bajos
- Evitar caracteres especiales

### 9.3 Documentación
- Documentar propósito y valores en comentarios SQL
- Mantener documentación de mapeos

### 9.4 Migraciones
- Probar cambios en ENUMs en desarrollo primero
- Considerar impacto en aplicaciones cliente
- Mantener compatibilidad hacia atrás cuando sea posible

---

## 10. Referencia SQL Completa

**Archivo fuente:**
```
/home/isem/workspace/projects/glit/database/00_prerequisites.sql
```

**Consulta para listar ENUMs:**
```sql
SELECT
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    'gamilit_role', 'user_status', 'rango_maya',
    'achievement_category', 'exercise_type', 'difficulty_level',
    'module_status', 'progress_status', 'comodin_type',
    'transaction_type', 'media_type', 'content_type',
    'processing_status', 'classroom_role', 'alert_severity'
)
GROUP BY t.typname
ORDER BY t.typname;
```

---

**Documento generado:** 2025-10-27
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
