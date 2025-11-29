# DIRECTIVA: DISEÑO DE BASE DE DATOS Y NORMALIZACIÓN

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Fuente:** Consolidado desde orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
**Ámbito:** Database-Agent y desarrolladores
**Stack:** PostgreSQL 15+ con PostGIS

---

## PROPÓSITO

Establecer criterios claros de diseño de base de datos que garanticen:
- **Normalización adecuada** sin sacrificar performance
- **Escalabilidad** para agregar nuevos módulos
- **Integridad** de datos con constraints apropiados
- **Performance óptima** con indexación estratégica
- **Mantenibilidad** a largo plazo

---

## PROCESO DE IMPLEMENTACIÓN

### Política de Carga Limpia (DDL-First)

**TODO diseño de esta directiva DEBE implementarse siguiendo:**

1. **Crear/actualizar archivo DDL** en `apps/database/ddl/schemas/{schema}/`
2. **Validar con recreación completa:** `./drop-and-recreate-database.sh`
3. **NUNCA** ejecutar CREATE/ALTER directamente sin archivo DDL
4. **NUNCA** crear migrations incrementales

### Ejemplo de Implementación Correcta

```sql
-- ✅ CORRECTO: Diseño + Proceso DDL-First
-- File: apps/database/ddl/schemas/gamification_system/tables/05-missions.sql

DROP TABLE IF EXISTS gamification_system.missions CASCADE;

CREATE TABLE gamification_system.missions (
    -- Primary Key (UUID estándar)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Normalización 3NF
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    mission_type VARCHAR(20) NOT NULL,

    -- Foreign Key con nomenclatura correcta
    category_id UUID,
    CONSTRAINT fk_missions_to_categories
        FOREIGN KEY (category_id)
        REFERENCES gamification_system.mission_categories(id)
        ON DELETE SET NULL,

    -- Check Constraint para validar valores
    CONSTRAINT chk_missions_type_valid
        CHECK (mission_type IN ('daily', 'weekly', 'special')),

    -- Auditoría obligatoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices estratégicos
CREATE INDEX idx_missions_type ON gamification_system.missions(mission_type);
CREATE INDEX idx_missions_category_id ON gamification_system.missions(category_id);

-- Comentarios
COMMENT ON TABLE gamification_system.missions IS 'Misiones del sistema de gamificación';
```

```sql
-- ❌ INCORRECTO: Viola Política de Carga Limpia
psql -d gamilit_platform -c "CREATE TABLE gamification_system.missions (...);"
-- Crear tabla directamente sin archivo DDL
```

---

## NIVELES DE NORMALIZACIÓN

### Nivel Mínimo: Tercera Forma Normal (3NF)

**OBLIGATORIO:** Todas las tablas DEBEN cumplir mínimo 3NF.

### Primera Forma Normal (1NF)

```yaml
Requisitos:
  - Valores atómicos (no listas/arrays en columnas)
  - Cada columna contiene un solo tipo de dato
  - Cada fila es única (tiene PK)
  - No hay grupos repetitivos
```

**✅ Correcto (1NF)**

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  -- Cada columna tiene valor atómico
  created_by_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**❌ Viola 1NF**

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  -- ❌ Múltiples valores en una columna
  tags TEXT,  -- "tag1,tag2,tag3"
  -- ❌ Grupos repetitivos
  hint1 TEXT,
  hint2 TEXT,
  hint3 TEXT
);
```

### Segunda Forma Normal (2NF)

```yaml
Requisitos:
  - Cumple 1NF
  - No hay dependencias parciales (todos los atributos no-key dependen de TODA la PK)
```

### Tercera Forma Normal (3NF)

```yaml
Requisitos:
  - Cumple 2NF
  - No hay dependencias transitivas (atributos no-key NO dependen de otros atributos no-key)
```

**✅ Correcto (3NF)**

```sql
-- Tabla exercise_attempts cumple 3NF
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  -- Referencia a otra tabla (no duplica datos)

  CONSTRAINT fk_attempts_to_users
    FOREIGN KEY (user_id) REFERENCES auth_management.users(id),

  CONSTRAINT fk_attempts_to_exercises
    FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id)
);
```

**❌ Viola 3NF**

```sql
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY,
  user_id UUID,
  -- ❌ user_email depende de user_id (transitiva)
  user_email VARCHAR(100),
  -- ❌ user_name depende de user_id (transitiva)
  user_name VARCHAR(200),
  exercise_id UUID,
  score INTEGER
);

-- ✅ Solución: Solo guardar user_id y hacer JOIN con users
```

---

## CUÁNDO DESNORMALIZAR

La desnormalización es **PERMITIDA** solo en estos casos:

### 1. Performance Crítico con Queries Frecuentes

```sql
-- ✅ Permitido: Columna desnormalizada para evitar JOIN costoso
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,

  -- Desnormalizado para performance (dashboard usado 10,000 veces/día)
  exercise_type VARCHAR(50) NOT NULL,  -- Duplica exercises.exercise_type

  CONSTRAINT fk_attempts_to_exercises
    FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id)
);

-- IMPORTANTE: Mantener sincronizado con trigger
CREATE OR REPLACE FUNCTION sync_exercise_type()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.exercise_type <> NEW.exercise_type) THEN
    UPDATE exercise_attempts
    SET exercise_type = NEW.exercise_type
    WHERE exercise_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documentar en comentario
COMMENT ON COLUMN exercise_attempts.exercise_type IS
'Desnormalizado de exercises.exercise_type para performance. Sincronizado con trigger.';
```

**Requisitos para desnormalizar:**

```yaml
Obligatorio documentar:
  - Razón de desnormalización (performance, query frecuente)
  - Tabla/columna origen
  - Mecanismo de sincronización (trigger, app logic)

Obligatorio implementar:
  - Trigger o lógica de sincronización
  - Test de sincronización
  - Comentario SQL explicando desnormalización
```

### 2. Agregaciones Precalculadas

```sql
-- ✅ Permitido: Columnas de resumen para dashboards
CREATE TABLE gamification_system.user_stats (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,

  -- Agregaciones precalculadas (actualizadas con triggers)
  total_xp INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  ml_coins INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para mantener total_xp actualizado
CREATE OR REPLACE FUNCTION update_user_xp_on_attempt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gamification_system.user_stats
  SET total_xp = total_xp + NEW.xp_earned,
      exercises_completed = exercises_completed + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Auditoría/Históricos

```sql
-- ✅ Permitido: Snapshot de datos para auditoría
CREATE TABLE audit_logging.exercise_submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,

  -- Snapshot del ejercicio en ese momento (desnormalizado)
  exercise_code VARCHAR(50) NOT NULL,
  exercise_name VARCHAR(200) NOT NULL,

  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logging.exercise_submission_history IS
'Histórico de cambios de status. Incluye snapshot desnormalizado para preservar valores al momento del cambio.';
```

---

## DISEÑO DE SCHEMAS

### Organización por Contexto de Negocio

**Principio:** Un schema por contexto de negocio (Bounded Context)

```yaml
Schemas de GAMILIT:
  auth_management: Usuarios, roles, permisos, tenants, sesiones
  educational_content: Módulos, ejercicios, rubrics, media
  gamification_system: Achievements, rangos, ML coins, comodines, missions
  progress_tracking: Intentos, submissions, progreso de módulos
  social_features: Escuelas, aulas, equipos, amistades
  notifications: Notificaciones multi-canal
  content_management: Templates, media, contenido
  audit_logging: Logs y auditoría del sistema
  admin_dashboard: Vistas materializadas para admin
```

**✅ Correcto**

```sql
-- Schema bien definido por contexto
CREATE SCHEMA IF NOT EXISTS gamification_system;
COMMENT ON SCHEMA gamification_system IS
'Sistema de gamificación: achievements, rangos, ML coins, comodines, missions.';

CREATE TABLE gamification_system.maya_ranks (...);
CREATE TABLE gamification_system.achievements (...);
CREATE TABLE gamification_system.user_stats (...);
CREATE TABLE gamification_system.missions (...);
```

**❌ Incorrecto**

```sql
-- ❌ Mezclar contextos en un schema
CREATE SCHEMA general_data;

CREATE TABLE general_data.exercises (...);  -- ❌ Contexto educativo
CREATE TABLE general_data.users (...);      -- ❌ Contexto auth
CREATE TABLE general_data.missions (...);   -- ❌ Contexto gamificación
```

---

## CLAVES Y CONSTRAINTS

### Primary Keys

```yaml
Estándar obligatorio:
  - Tipo: UUID v4
  - Columna: id
  - Default: gen_random_uuid()
  - Nunca usar SERIAL/INTEGER (problemas al escalar)
```

**✅ Correcto**

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- resto de columnas
);
```

**❌ Incorrecto**

```sql
-- ❌ SERIAL no escalable
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  -- ...
);
```

### Foreign Keys

```yaml
Nomenclatura obligatoria:
  fk_{tabla_origen}_to_{tabla_destino}

Reglas:
  - Siempre definir ON DELETE y ON UPDATE
  - Preferir CASCADE o SET NULL según lógica de negocio
  - Documentar razón de CASCADE vs SET NULL
```

**✅ Correcto**

```sql
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL,

  CONSTRAINT fk_attempts_to_exercises
    FOREIGN KEY (exercise_id)
    REFERENCES educational_content.exercises(id)
    ON DELETE CASCADE  -- Si se elimina ejercicio, eliminar intentos
    ON UPDATE CASCADE
);

COMMENT ON CONSTRAINT fk_attempts_to_exercises ON exercise_attempts IS
'CASCADE porque attempts dependen de exercise (sin exercise no tienen sentido).';
```

### Check Constraints

```yaml
Nomenclatura:
  chk_{tabla}_{columna}_{descripción}

Usar para:
  - Validar enums/estados
  - Rangos válidos
  - Reglas de negocio simples
```

```sql
CREATE TABLE gamification_system.maya_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_level INTEGER NOT NULL,
  min_xp INTEGER NOT NULL,

  CONSTRAINT chk_maya_ranks_level_range
    CHECK (rank_level >= 1 AND rank_level <= 7),

  CONSTRAINT chk_maya_ranks_min_xp_positive
    CHECK (min_xp >= 0)
);
```

---

## INDEXACIÓN ESTRATÉGICA

### Índices Obligatorios

```yaml
Siempre crear índice para:
  1. Foreign Keys (para JOINs)
  2. Columnas en WHERE frecuentes
  3. Columnas en ORDER BY frecuentes
  4. Columnas UNIQUE (automático)
  5. Columnas de búsqueda (name, code, email)
```

### Nomenclatura de Índices

```yaml
Formato:
  idx_{tabla}_{columna(s)}_{tipo}

Tipos:
  (sin sufijo): BTREE (default)
  _gin: GIN (full-text search, JSONB)
  _gist: GIST (PostGIS, rangos)
```

**✅ Correcto**

```sql
CREATE TABLE educational_content.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  module_id UUID NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK index (para JOINs)
CREATE INDEX idx_exercises_module_id
  ON educational_content.exercises(module_id);

-- Type (WHERE frecuente)
CREATE INDEX idx_exercises_type
  ON educational_content.exercises(exercise_type);

-- Difficulty (WHERE frecuente)
CREATE INDEX idx_exercises_difficulty
  ON educational_content.exercises(difficulty);

-- JSONB (GIN)
CREATE INDEX idx_exercises_metadata_gin
  ON educational_content.exercises USING GIN(metadata);

-- Compuesto (queries con múltiples filtros)
CREATE INDEX idx_exercises_module_type
  ON educational_content.exercises(module_id, exercise_type);
```

### Índices Parciales

```yaml
Usar cuando:
  - Queries filtran por valor específico frecuentemente
  - Reduce tamaño del índice
  - Mejora performance de queries específicos
```

```sql
-- Índice parcial para ejercicios publicados (query más frecuente)
CREATE INDEX idx_exercises_published_created
  ON educational_content.exercises(created_at DESC)
  WHERE status = 'published';

-- Query optimizado
SELECT * FROM educational_content.exercises
WHERE status = 'published'  -- Usa índice parcial
ORDER BY created_at DESC
LIMIT 20;
```

### Índices a Evitar

```yaml
NO crear índice para:
  - Columnas con muy baja cardinalidad (ej: boolean)
  - Columnas nunca usadas en WHERE/ORDER BY
  - Tablas muy pequeñas (<1000 rows)
  - Todas las columnas (over-indexing)
```

---

## TIMESTAMPS Y AUDITORÍA

### Columnas Estándar de Auditoría

```yaml
Obligatorio en TODAS las tablas:
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - created_by_id UUID (FK a users, si aplica)

Opcional según necesidad:
  - deleted_at TIMESTAMPTZ (soft delete)
  - deleted_by_id UUID (soft delete)
```

**✅ Correcto**

```sql
CREATE TABLE educational_content.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Auditoría obligatoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_id UUID NOT NULL,

  CONSTRAINT fk_exercises_created_by
    FOREIGN KEY (created_by_id) REFERENCES auth_management.users(id)
    ON DELETE SET NULL
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exercises_updated_at
BEFORE UPDATE ON educational_content.exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Soft Delete

```sql
-- Soft delete (recomendado para datos importantes)
CREATE TABLE educational_content.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice parcial para queries de activos
CREATE INDEX idx_exercises_active
  ON educational_content.exercises(created_at DESC)
  WHERE deleted_at IS NULL;

-- View para acceso fácil a ejercicios activos
CREATE VIEW educational_content.exercises_active AS
SELECT *
FROM educational_content.exercises
WHERE deleted_at IS NULL;
```

---

## PERFORMANCE Y OPTIMIZACIÓN

### Particionamiento

```yaml
Considerar particionamiento cuando:
  - Tabla > 10 millones de registros
  - Queries filtran por rango de fechas frecuentemente
  - Archivado regular de datos antiguos
```

**Ejemplo: Particionamiento por rango de fechas**

```sql
-- Tabla particionada para exercise_attempts
CREATE TABLE progress_tracking.exercise_attempts_partitioned (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (completed_at);

-- Particiones por mes
CREATE TABLE progress_tracking.exercise_attempts_2025_01
  PARTITION OF progress_tracking.exercise_attempts_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE progress_tracking.exercise_attempts_2025_02
  PARTITION OF progress_tracking.exercise_attempts_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### Vistas Materializadas

```yaml
Usar MATERIALIZED VIEW cuando:
  - Query complejo ejecutado frecuentemente
  - Datos cambian poco (actualizar periódicamente)
  - Performance crítico (dashboards)
```

**Ejemplo: Vista materializada para leaderboard**

```sql
-- Vista materializada para leaderboard global
CREATE MATERIALIZED VIEW gamification_system.v_leaderboard_global AS
SELECT
  u.id AS user_id,
  u.username,
  u.display_name,
  COALESCE(us.total_xp, 0) AS total_xp,
  COALESCE(us.exercises_completed, 0) AS exercises_completed,
  COALESCE(us.current_streak, 0) AS current_streak,
  mr.name AS maya_rank,
  ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC) AS rank_position
FROM auth_management.users u
LEFT JOIN gamification_system.user_stats us ON us.user_id = u.id
LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = u.id
LEFT JOIN gamification_system.maya_ranks mr ON mr.id = ur.rank_id
WHERE u.deleted_at IS NULL
ORDER BY total_xp DESC;

-- Índice en vista materializada
CREATE INDEX idx_v_leaderboard_global_xp
  ON gamification_system.v_leaderboard_global(total_xp DESC);

-- Refrescar periódicamente (ej: cada hora via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.v_leaderboard_global;
```

---

## CHECKLIST DE DISEÑO DE TABLA

```markdown
Antes de crear tabla, verificar:

**Normalización:**
- [ ] ¿Cumple 3NF?
- [ ] ¿Hay dependencias transitivas?
- [ ] Si desnormaliza, ¿está justificado y documentado?

**Primary Key:**
- [ ] ¿Usa UUID v4?
- [ ] ¿Columna se llama "id"?
- [ ] ¿Tiene DEFAULT gen_random_uuid()?

**Foreign Keys:**
- [ ] ¿Nomenclatura fk_{origen}_to_{destino}?
- [ ] ¿Tiene ON DELETE y ON UPDATE definidos?
- [ ] ¿Está documentada la razón de CASCADE vs SET NULL?

**Constraints:**
- [ ] ¿UNIQUE en códigos de negocio?
- [ ] ¿CHECK para enums/rangos?
- [ ] ¿NOT NULL en columnas obligatorias?

**Índices:**
- [ ] ¿Índice en cada FK?
- [ ] ¿Índice en columnas de búsqueda (WHERE)?
- [ ] ¿Índice en columnas de ordenamiento (ORDER BY)?
- [ ] ¿Sin over-indexing?

**Auditoría:**
- [ ] ¿Tiene created_at, updated_at?
- [ ] ¿Tiene created_by_id (si aplica)?
- [ ] ¿Trigger para updated_at automático?

**Documentación:**
- [ ] ¿Comentario en tabla (COMMENT ON TABLE)?
- [ ] ¿Comentario en columnas importantes?
- [ ] ¿Comentario en constraints especiales?

**Performance:**
- [ ] ¿Necesita particionamiento?
- [ ] ¿Queries principales optimizados?
```

---

## REFERENCIAS

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [docs/98-standards/NAMING-CONVENTIONS-COMPLETE.md](../98-standards/NAMING-CONVENTIONS-COMPLETE.md)

---

**Última actualización:** 2025-11-29
**Fuente original:** orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
**Mantenido por:** Architecture-Analyst
