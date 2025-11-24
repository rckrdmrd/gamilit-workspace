# DIRECTIVA: DISEÑO DE BASE DE DATOS Y NORMALIZACIÓN

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Ámbito:** Database-Agent y subagentes
**Tipo:** Directiva Obligatoria
**Stack:** PostgreSQL 15+ con PostGIS

---

## 🎯 PROPÓSITO

Establecer criterios claros de diseño de base de datos que garanticen:
- **Normalización adecuada** sin sacrificar performance
- **Escalabilidad** para agregar nuevos módulos
- **Integridad** de datos con constraints apropiados
- **Performance óptima** con indexación estratégica
- **Mantenibilidad** a largo plazo

---

## 🔄 ALCANCE Y PROCESO DE IMPLEMENTACIÓN

### Qué cubre esta directiva

**Esta directiva define QUÉ diseñar:**
- ✅ Niveles de normalización (3NF mínimo)
- ✅ Cuándo desnormalizar (performance crítico)
- ✅ Diseño de schemas y contextos
- ✅ Claves, constraints e índices
- ✅ Tipos de datos y estructuras

**Esta directiva NO cubre CÓMO implementar:**
- ❌ Proceso de creación/modificación de DDL
- ❌ Flujo de trabajo para cambios en BD
- ❌ Validación y deployment

### Cómo implementar los diseños de esta directiva

**IMPORTANTE:** TODO diseño documentado aquí DEBE implementarse siguiendo:

**[DIRECTIVA-POLITICA-CARGA-LIMPIA.md](DIRECTIVA-POLITICA-CARGA-LIMPIA.md)** - Proceso DDL-First
- ✅ Crear/actualizar archivo DDL en `apps/database/ddl/schemas/{schema}/`
- ✅ Validar con recreación completa: `./drop-and-recreate-database.sh`
- ❌ **NUNCA** ejecutar CREATE/ALTER directamente sin archivo DDL
- ❌ **NUNCA** crear migrations incrementales

**[PROMPT-DATABASE-AGENT.md](../prompts/PROMPT-DATABASE-AGENT.md)** - Workflow de 5 fases
- Análisis → Plan → Ejecución → Validación → Documentación

### Ejemplo de implementación correcta

```sql
-- ✅ CORRECTO: Diseño de esta directiva + Proceso de Política de Carga Limpia

-- 1. Diseñar tabla según criterios de esta directiva
-- File: apps/database/ddl/schemas/gamification_system/tables/05-challenges.sql

DROP TABLE IF EXISTS gamification_system.challenges CASCADE;

CREATE TABLE gamification_system.challenges (
    -- Primary Key (UUID según esta directiva)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Normalización 3NF (sin dependencias transitivas)
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,

    -- Foreign Key con nomenclatura correcta
    required_level_id UUID,
    CONSTRAINT fk_challenges_to_levels
        FOREIGN KEY (required_level_id)
        REFERENCES gamification_system.levels(id)
        ON DELETE SET NULL,

    -- Check Constraint para validar valores
    CONSTRAINT chk_challenges_difficulty_valid
        CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),

    -- Auditoría obligatoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices estratégicos (según criterios de performance)
CREATE INDEX idx_challenges_difficulty ON gamification_system.challenges(difficulty);
CREATE INDEX idx_challenges_required_level_id ON gamification_system.challenges(required_level_id);

-- Comentarios (documentación)
COMMENT ON TABLE gamification_system.challenges IS
'Desafíos del sistema de gamificación';

-- 2. Validar con recreación completa
-- cd apps/database
-- ./drop-and-recreate-database.sh

-- 3. Si funciona → Commitear DDL
-- git add apps/database/ddl/schemas/gamification_system/tables/05-challenges.sql
-- git commit -m "feat(db): add challenges table"
```

```sql
-- ❌ INCORRECTO: Buen diseño pero mal proceso

-- NO hacer esto (viola Política de Carga Limpia):
psql -d gamilit_platform -c "CREATE TABLE gamification_system.challenges (...);"
-- Crear tabla directamente sin archivo DDL

-- NO hacer esto (viola Política de Carga Limpia):
-- File: apps/database/migrations/002-add-challenges.sql
CREATE TABLE gamification_system.challenges (...);
-- Usar migrations en lugar de DDL base
```

### Regla de oro

```yaml
Esta directiva te dice QUÉ crear:
  - Tablas normalizadas (3NF)
  - Constraints apropiados
  - Índices estratégicos

DIRECTIVA-POLITICA-CARGA-LIMPIA.md te dice CÓMO crearlo:
  - DDL primero
  - Validar con recreación
  - NO migrations
```

---

## 📐 NIVELES DE NORMALIZACIÓN

### Nivel Mínimo: Tercera Forma Normal (3NF)

**OBLIGATORIO:** Todas las tablas DEBEN cumplir mínimo 3NF.

#### Primera Forma Normal (1NF)

```yaml
Requisitos:
  - Valores atómicos (no listas/arrays en columnas)
  - Cada columna contiene un solo tipo de dato
  - Cada fila es única (tiene PK)
  - No hay grupos repetitivos
```

**✅ Correcto (1NF)**

```sql
-- Tabla cumple 1NF
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL,
  -- Cada columna tiene valor atómico
  created_by_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**❌ Incorrecto (Viola 1NF)**

```sql
-- ❌ Viola 1NF: columna con lista de valores
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(200),
  -- ❌ Múltiples valores en una columna
  responsible_users TEXT,  -- "user1,user2,user3"
  -- ❌ Grupos repetitivos
  phone1 VARCHAR(20),
  phone2 VARCHAR(20),
  phone3 VARCHAR(20)
);
```

#### Segunda Forma Normal (2NF)

```yaml
Requisitos:
  - Cumple 1NF
  - No hay dependencias parciales (todos los atributos no-key dependen de TODA la PK)
```

**✅ Correcto (2NF)**

```sql
-- Tabla cumple 2NF
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  version INTEGER NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  -- Todos los atributos dependen de id (PK completa)
  approved_at TIMESTAMPTZ,
  approved_by_id UUID,

  CONSTRAINT fk_project_budgets_to_projects
    FOREIGN KEY (project_id) REFERENCES gamification_system.user_points(id)
);

-- Índice para queries frecuentes
CREATE INDEX idx_project_budgets_project_id
  ON project_budgets(project_id);
```

**❌ Incorrecto (Viola 2NF)**

```sql
-- ❌ Viola 2NF con PK compuesta
CREATE TABLE project_budgets (
  project_id UUID,
  version INTEGER,
  total_amount DECIMAL(15,2),
  -- ❌ project_name depende solo de project_id, no de (project_id, version)
  project_name VARCHAR(200),
  -- ❌ project_status depende solo de project_id
  project_status VARCHAR(20),

  PRIMARY KEY (project_id, version)
);

-- ✅ Solución: Mover project_name y project_status a tabla projects
-- y usar FK desde project_budgets
```

#### Tercera Forma Normal (3NF)

```yaml
Requisitos:
  - Cumple 2NF
  - No hay dependencias transitivas (atributos no-key NO dependen de otros atributos no-key)
```

**✅ Correcto (3NF)**

```sql
-- Tabla projects cumple 3NF
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  -- Referencia a otra tabla (no duplica datos)
  created_by_id UUID NOT NULL,

  CONSTRAINT fk_projects_to_users
    FOREIGN KEY (created_by_id) REFERENCES auth_management.users(id)
);

-- Tabla users separada (no transitiva)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  department VARCHAR(100)
);
```

**❌ Incorrecto (Viola 3NF)**

```sql
-- ❌ Viola 3NF: dependencia transitiva
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(200),
  created_by_id UUID,
  -- ❌ created_by_email depende de created_by_id (transitiva)
  created_by_email VARCHAR(100),
  -- ❌ created_by_name depende de created_by_id (transitiva)
  created_by_name VARCHAR(200),
  -- ❌ created_by_department depende de created_by_id (transitiva)
  created_by_department VARCHAR(100)
);

-- ✅ Solución: Solo guardar created_by_id y hacer JOIN con users
```

---

## 🚀 CUÁNDO DESNORMALIZAR

La desnormalización es **PERMITIDA** solo en estos casos:

### 1. Performance Crítico con Queries Frecuentes

```sql
-- ✅ Permitido: Columna desnormalizada para evitar JOIN costoso
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,

  -- Desnormalizado para performance (query usado 10,000 veces/día)
  project_code VARCHAR(50) NOT NULL,  -- Duplica projects.code

  CONSTRAINT fk_project_budgets_to_projects
    FOREIGN KEY (project_id) REFERENCES gamification_system.user_points(id)
);

-- IMPORTANTE: Mantener sincronizado con trigger
CREATE OR REPLACE FUNCTION sync_project_code()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.code <> NEW.code) THEN
    UPDATE project_budgets
    SET project_code = NEW.code
    WHERE project_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_project_code
AFTER UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION sync_project_code();

-- Documentar en comentario
COMMENT ON COLUMN project_budgets.project_code IS
'Desnormalizado de projects.code para performance. Sincronizado con trigger trg_sync_project_code.';
```

**Requisitos para desnormalizar:**
```yaml
Obligatorio documentar:
  - Razón de desnormalización (performance, query frecuente)
  - Tabla/columna origen
  - Mecanismo de sincronización (trigger, app logic)
  - Frecuencia de query que justifica desnormalización

Obligatorio implementar:
  - Trigger o lógica de sincronización
  - Test de sincronización
  - Comentario SQL explicando desnormalización
```

### 2. Agregaciones Precalculadas

```sql
-- ✅ Permitido: Columnas de resumen para dashboards
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Agregaciones precalculadas (actualizadas con triggers)
  total_developments INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  total_budget_amount DECIMAL(15,2) DEFAULT 0,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para mantener total_developments actualizado
CREATE OR REPLACE FUNCTION update_project_developments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE projects
    SET total_developments = total_developments + 1
    WHERE id = NEW.project_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE projects
    SET total_developments = total_developments - 1
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_project_developments_count
AFTER INSERT OR DELETE ON developments
FOR EACH ROW
EXECUTE FUNCTION update_project_developments_count();
```

### 3. Auditoría/Históricos

```sql
-- ✅ Permitido: Snapshot de datos para auditoría
CREATE TABLE project_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,

  -- Snapshot del proyecto en ese momento (desnormalizado)
  project_code VARCHAR(50) NOT NULL,
  project_name VARCHAR(200) NOT NULL,

  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_project_status_history_to_projects
    FOREIGN KEY (project_id) REFERENCES gamification_system.user_points(id)
);

COMMENT ON TABLE project_status_history IS
'Histórico de cambios de status. Incluye snapshot desnormalizado de project_code y project_name para preservar valores al momento del cambio.';
```

---

## 🏗️ DISEÑO DE SCHEMAS

### Organización de Schemas

```yaml
Principio: Un schema por contexto de negocio (Bounded Context de DDD)

Schemas obligatorios:
  auth_management: Usuarios, roles, permisos, tenants
  academic_management: Instituciones, cursos, estudiantes, profesores
  gamification_system: Puntos, niveles, badges, challenges, recompensas
  exercise_management: Ejercicios, tipos, variantes, soluciones
  progress_tracking: Progreso estudiantil, estadísticas, logros
  guild_management: Guildas, membresía, competencias, rankings
  notification_management: Notificaciones, alertas, mensajería
```

**✅ Correcto**

```sql
-- Schema bien definido por contexto
CREATE SCHEMA IF NOT EXISTS gamification_system;
COMMENT ON SCHEMA gamification_system IS
'Sistema de gamificación: puntos, niveles, badges, challenges y recompensas. Núcleo del engagement estudiantil.';

CREATE TABLE gamification_system.user_points (...);
CREATE TABLE gamification_system.levels (...);
CREATE TABLE gamification_system.badges (...);
CREATE TABLE gamification_system.challenges (...);
```

**❌ Incorrecto**

```sql
-- ❌ Mezclar contextos en un schema
CREATE SCHEMA general_data;

CREATE TABLE general_data.projects (...);  -- ❌ Contexto proyecto
CREATE TABLE general_data.budgets (...);   -- ❌ Contexto financiero
CREATE TABLE general_data.contracts (...); -- ❌ Contexto compras
CREATE TABLE general_data.users (...);     -- ❌ Contexto auth
```

---

## 🔑 CLAVES Y CONSTRAINTS

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
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- resto de columnas
);
```

**❌ Incorrecto**

```sql
-- ❌ SERIAL no escalable
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  -- ...
);

-- ❌ PK compuesta sin UUID
CREATE TABLE project_users (
  project_id INTEGER,
  user_id INTEGER,
  PRIMARY KEY (project_id, user_id)  -- ❌ Sin UUID
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
CREATE TABLE developments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,

  CONSTRAINT fk_developments_to_projects
    FOREIGN KEY (project_id)
    REFERENCES gamification_system.user_points(id)
    ON DELETE CASCADE  -- Si se elimina proyecto, eliminar desarrollos
    ON UPDATE CASCADE
);

COMMENT ON CONSTRAINT fk_developments_to_projects ON developments IS
'CASCADE porque developments es dependiente de project (sin project no tiene sentido).';

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_id UUID NOT NULL,

  CONSTRAINT fk_projects_to_users
    FOREIGN KEY (created_by_id)
    REFERENCES auth_management.users(id)
    ON DELETE SET NULL  -- Si se elimina usuario, project permanece
    ON UPDATE CASCADE
);

COMMENT ON CONSTRAINT fk_projects_to_users ON projects IS
'SET NULL porque queremos preservar proyecto aunque usuario se elimine.';
```

### Unique Constraints

```yaml
Nomenclatura:
  uq_{tabla}_{columna(s)}

Usar para:
  - Códigos de negocio (code, slug)
  - Emails, usernames
  - Combinaciones únicas de negocio
```

**✅ Correcto**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,

  CONSTRAINT uq_projects_code UNIQUE (code)
);

-- Unique compuesto
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  version INTEGER NOT NULL,

  CONSTRAINT uq_project_budgets_project_version
    UNIQUE (project_id, version)
);
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

**✅ Correcto**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL,
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,

  CONSTRAINT chk_projects_status_valid
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  CONSTRAINT chk_projects_progress_range
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);
```

---

## 📊 INDEXACIÓN ESTRATÉGICA

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
  _hash: HASH (igualdad exacta, raro)
```

**✅ Correcto**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_by_id UUID NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK index (para JOINs)
CREATE INDEX idx_projects_created_by_id
  ON projects(created_by_id);

-- Status (WHERE frecuente)
CREATE INDEX idx_projects_status
  ON projects(status);

-- Búsqueda por nombre
CREATE INDEX idx_projects_name
  ON projects(name);

-- PostGIS (GIST)
CREATE INDEX idx_projects_coordinates_gist
  ON projects USING GIST(coordinates);

-- JSONB (GIN)
CREATE INDEX idx_projects_metadata_gin
  ON projects USING GIN(metadata);

-- Compuesto (queries con múltiples filtros)
CREATE INDEX idx_projects_status_created_at
  ON projects(status, created_at DESC);
```

### Índices Parciales

```yaml
Usar cuando:
  - Queries filtran por valor específico frecuentemente
  - Reduce tamaño del índice
  - Mejora performance de queries específicos
```

**✅ Correcto**

```sql
-- Índice parcial para proyectos activos (query más frecuente)
CREATE INDEX idx_projects_active_created_at
  ON projects(created_at DESC)
  WHERE status = 'active';

-- Query optimizado
SELECT * FROM projects
WHERE status = 'active'  -- Usa índice parcial
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

**❌ Incorrecto**

```sql
-- ❌ Índice innecesario en boolean
CREATE INDEX idx_projects_is_active
  ON projects(is_active);  -- Solo 2 valores posibles

-- ❌ Índice en columna nunca filtrada
CREATE INDEX idx_projects_description
  ON projects(description);  -- Texto largo, nunca en WHERE

-- ❌ Over-indexing
CREATE INDEX idx_projects_col1 ON projects(col1);
CREATE INDEX idx_projects_col2 ON projects(col2);
CREATE INDEX idx_projects_col3 ON projects(col3);
-- ... 10 índices más en tabla pequeña
```

---

## 🌍 POSTGIS PARA GEOLOCALIZACIÓN

### Tipo de Dato: GEOGRAPHY vs GEOMETRY

```yaml
Usar GEOGRAPHY:
  - Para coordenadas lat/lng
  - Cálculos en metros (distancias reales)
  - SRID 4326 (WGS 84)

Usar GEOMETRY:
  - Para mapas planos
  - Cálculos en unidades del mapa
  - Performance crítico (más rápido que GEOGRAPHY)
```

**✅ Correcto**

```sql
-- GEOGRAPHY para proyectos (coordenadas reales)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Coordenadas en lat/lng
  coordinates GEOGRAPHY(POINT, 4326),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice GIST para queries espaciales
CREATE INDEX idx_projects_coordinates_gist
  ON projects USING GIST(coordinates);

-- Query: Proyectos a menos de 5km
SELECT id, name, code
FROM projects
WHERE ST_DWithin(
  coordinates,
  ST_MakePoint(-99.1332, 19.4326)::GEOGRAPHY,  -- CDMX
  5000  -- 5000 metros
);
```

### Funciones PostGIS Comunes

```sql
-- Distancia entre dos puntos (en metros)
SELECT ST_Distance(
  ST_MakePoint(-99.1, 19.4)::GEOGRAPHY,
  p.coordinates
) AS distance_meters
FROM projects p;

-- Proyectos dentro de polígono
SELECT *
FROM projects
WHERE ST_Within(
  coordinates::GEOMETRY,
  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[...]}')
);

-- Área de polígono (en m²)
SELECT ST_Area(polygon_column::GEOGRAPHY) AS area_sqm
FROM developments;
```

---

## 🕐 TIMESTAMPS Y AUDITORÍA

### Columnas Estándar de Auditoría

```yaml
Obligatorio en TODAS las tablas:
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - created_by_id UUID (FK a users)
  - updated_by_id UUID (FK a users, nullable)

Opcional según necesidad:
  - deleted_at TIMESTAMPTZ (soft delete)
  - deleted_by_id UUID (soft delete)
```

**✅ Correcto**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Auditoría obligatoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_id UUID NOT NULL,
  updated_by_id UUID,

  CONSTRAINT fk_projects_created_by
    FOREIGN KEY (created_by_id) REFERENCES auth_management.users(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_projects_updated_by
    FOREIGN KEY (updated_by_id) REFERENCES auth_management.users(id)
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

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Soft Delete

```sql
-- Soft delete (recomendado para datos importantes)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,

  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_projects_deleted_by
    FOREIGN KEY (deleted_by_id) REFERENCES auth_management.users(id)
    ON DELETE SET NULL
);

-- Índice parcial para queries de activos
CREATE INDEX idx_projects_active
  ON projects(created_at DESC)
  WHERE deleted_at IS NULL;

-- View para acceso fácil a proyectos activos
CREATE VIEW projects_active AS
SELECT *
FROM projects
WHERE deleted_at IS NULL;
```

---

## 📈 PERFORMANCE Y OPTIMIZACIÓN

### Particionamiento

```yaml
Considerar particionamiento cuando:
  - Tabla > 10 millones de registros
  - Queries filtran por rango de fechas frecuentemente
  - Archivado regular de datos antiguos
```

**Ejemplo: Particionamiento por rango de fechas**

```sql
-- Tabla particionada
CREATE TABLE project_status_history (
  id UUID DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (changed_at);

-- Particiones por mes
CREATE TABLE project_status_history_2025_01
  PARTITION OF project_status_history
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE project_status_history_2025_02
  PARTITION OF project_status_history
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Índice en cada partición
CREATE INDEX idx_project_status_history_2025_01_project_id
  ON project_status_history_2025_01(project_id);
```

### Materialización de Vistas

```yaml
Usar MATERIALIZED VIEW cuando:
  - Query complejo ejecutado frecuentemente
  - Datos cambian poco (actualizar periódicamente)
  - Performance crítico (dashboards)
```

**Ejemplo: Vista materializada para dashboard**

```sql
-- Vista materializada con agregaciones para dashboard estudiantil
CREATE MATERIALIZED VIEW dashboard_student_summary AS
SELECT
  s.id,
  s.username,
  s.email,
  s.current_level,
  COUNT(DISTINCT ec.id) AS total_exercises_completed,
  COUNT(DISTINCT ub.badge_id) AS total_badges_earned,
  COALESCE(SUM(up.points), 0) AS total_points,
  COALESCE(AVG(ec.score), 0) AS average_score
FROM academic_management.students s
LEFT JOIN exercise_management.exercise_completions ec ON ec.student_id = s.id
LEFT JOIN gamification_system.user_badges ub ON ub.user_id = s.id
LEFT JOIN gamification_system.user_points up ON up.user_id = s.id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.username, s.email, s.current_level;

-- Índice en vista materializada
CREATE INDEX idx_dashboard_student_summary_level
  ON dashboard_student_summary(current_level);

-- Refrescar periódicamente (ej: cada hora via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_student_summary;
```

---

## ✅ CHECKLIST DE DISEÑO DE TABLA

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
- [ ] ¿Índice GIST para PostGIS?
- [ ] ¿Índice GIN para JSONB?
- [ ] ¿Sin over-indexing?

**Auditoría:**
- [ ] ¿Tiene created_at, updated_at?
- [ ] ¿Tiene created_by_id?
- [ ] ¿Trigger para updated_at automático?

**Documentación:**
- [ ] ¿Comentario en tabla (COMMENT ON TABLE)?
- [ ] ¿Comentario en columnas importantes?
- [ ] ¿Comentario en constraints especiales?

**PostGIS (si aplica):**
- [ ] ¿Usa GEOGRAPHY para lat/lng?
- [ ] ¿SRID 4326?
- [ ] ¿Índice GIST creado?

**Performance:**
- [ ] ¿Necesita particionamiento?
- [ ] ¿Queries principales optimizados?
```

---

## 📚 REFERENCIAS

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [PostgreSQL Performance Optimization](https://www.postgresql.org/docs/15/performance-tips.html)

---

**Versión:** 1.1.0
**Fecha:** 2025-11-23 (actualización: sección proceso DDL-first)
**Fecha original:** 2025-11-20
**Próxima revisión:** Al identificar necesidad de mejoras
**Responsable:** Database-Agent
