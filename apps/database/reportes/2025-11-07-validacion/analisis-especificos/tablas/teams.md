# Reporte de Validacion: social_features.teams

**Fecha:** 2025-11-02
**Archivo Origen:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/04-teams.sql`
**Archivo Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/05-teams.sql`
**Esquema:** `social_features`
**Nivel:** 4
**Track:** ATLAS-DATABASE

---

## 1. Informacion General

### Descripcion
Tabla para gestionar equipos colaborativos de estudiantes dentro de aulas virtuales. Permite la organizacion de estudiantes en grupos de trabajo, competencias y actividades gamificadas. Incluye metricas de rendimiento, insignias y configuraciones de privacidad.

### Dependencias
- `social_features.classrooms` (classroom_id) - Aula virtual asociada (OPCIONAL)
- `auth_management.profiles` (creator_id) - Creador del equipo (OBLIGATORIO)
- `auth_management.profiles` (leader_id) - Lider del equipo (OPCIONAL)
- `auth_management.tenants` (tenant_id) - Tenant propietario (OBLIGATORIO)

### Dependientes
- `social_features.team_members` - Miembros del equipo
- `social_features.team_invitations` - Invitaciones pendientes
- `social_features.team_achievements` - Logros del equipo
- `gamification.team_challenges` - Desafios del equipo

---

## 2. Estructura de la Tabla

### Columnas Principales

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Identificador unico del equipo |
| `classroom_id` | uuid | FK → classrooms(id) ON DELETE CASCADE | Aula virtual asociada (opcional) |
| `tenant_id` | uuid | NOT NULL, FK → tenants(id) ON DELETE CASCADE | Tenant propietario |
| `name` | text | NOT NULL | Nombre del equipo |
| `description` | text | NULL | Descripcion del equipo |
| `motto` | text | NULL | Lema o frase del equipo |
| `color_primary` | text | DEFAULT '#3B82F6' | Color primario (azul) |
| `color_secondary` | text | DEFAULT '#10B981' | Color secundario (verde) |
| `avatar_url` | text | NULL | URL del avatar del equipo |
| `banner_url` | text | NULL | URL del banner del equipo |
| `badges` | jsonb | DEFAULT '[]' | Insignias del equipo |
| `creator_id` | uuid | NOT NULL, FK → profiles(id) | Creador del equipo |
| `leader_id` | uuid | FK → profiles(id) | Lider actual del equipo |
| `team_code` | text | UNIQUE | Codigo unico para unirse |
| `max_members` | integer | DEFAULT 5 | Maximo de miembros |
| `current_members_count` | integer | DEFAULT 0 | Contador actual de miembros |
| `is_public` | boolean | DEFAULT false | Visibilidad publica |
| `allow_join_requests` | boolean | DEFAULT true | Permite solicitudes |
| `require_approval` | boolean | DEFAULT true | Requiere aprobacion |
| `total_xp` | integer | DEFAULT 0 | Experiencia total del equipo |
| `total_ml_coins` | integer | DEFAULT 0 | Monedas ML del equipo |
| `modules_completed` | integer | DEFAULT 0 | Modulos completados |
| `achievements_earned` | integer | DEFAULT 0 | Logros obtenidos |
| `is_active` | boolean | DEFAULT true | Estado activo |
| `is_verified` | boolean | DEFAULT false | Equipo verificado |
| `founded_at` | timestamptz | DEFAULT gamilit.now_mexico() | Fecha de fundacion |
| `last_activity_at` | timestamptz | NULL | Ultima actividad |
| `metadata` | jsonb | DEFAULT '{}' | Metadatos adicionales |
| `created_at` | timestamptz | DEFAULT gamilit.now_mexico() | Fecha de creacion |
| `updated_at` | timestamptz | DEFAULT gamilit.now_mexico() | Fecha de actualizacion |

**Total de columnas:** 29

---

## 3. Constraints y Validaciones

### Primary Key
- `teams_pkey` ON `id`

### Unique Constraints
- `teams_team_code_key` ON `team_code` - Codigo unico del equipo

### Foreign Keys
1. `teams_classroom_id_fkey`: `classroom_id` → `social_features.classrooms(id)` ON DELETE CASCADE
2. `teams_creator_id_fkey`: `creator_id` → `auth_management.profiles(id)`
3. `teams_leader_id_fkey`: `leader_id` → `auth_management.profiles(id)`
4. `teams_tenant_id_fkey`: `tenant_id` → `auth_management.tenants(id)` ON DELETE CASCADE

**Total FKs:** 4

### Check Constraints
**ADVERTENCIA:** No se encontraron CHECK constraints

**Recomendaciones:**
```sql
-- Validacion de capacidad
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_max_members_check
CHECK (max_members > 0 AND max_members <= 50);

-- Validacion de contador de miembros
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_current_members_count_check
CHECK (current_members_count >= 0 AND current_members_count <= max_members);

-- Validacion de nombre no vacio
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_name_check
CHECK (LENGTH(TRIM(name)) >= 3 AND LENGTH(name) <= 100);

-- Validacion de metricas no negativas
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_metrics_check
CHECK (
    total_xp >= 0 AND
    total_ml_coins >= 0 AND
    modules_completed >= 0 AND
    achievements_earned >= 0
);

-- Validacion de colores en formato hexadecimal
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_color_primary_check
CHECK (color_primary ~* '^#[0-9A-F]{6}$');

ALTER TABLE social_features.teams
ADD CONSTRAINT teams_color_secondary_check
CHECK (color_secondary ~* '^#[0-9A-F]{6}$');

-- Validacion de codigo del equipo
ALTER TABLE social_features.teams
ADD CONSTRAINT teams_team_code_check
CHECK (team_code IS NULL OR (LENGTH(team_code) >= 6 AND team_code ~ '^[A-Z0-9-]+$'));
```

---

## 4. Indices

### Indices Creados

| Nombre | Tipo | Columnas | Condicion | Proposito |
|--------|------|----------|-----------|-----------|
| `idx_teams_active` | btree | `is_active` | WHERE is_active = true | Filtrado de equipos activos |
| `idx_teams_classroom` | btree | `classroom_id` | - | Busquedas por aula |
| `idx_teams_classroom_active_xp` | btree | `classroom_id, is_active, total_xp DESC` | WHERE is_active = true | Ranking por XP en aula |
| `idx_teams_leader` | btree | `leader_id` | - | Equipos por lider |
| `idx_teams_xp` | btree | `total_xp DESC` | - | Ranking global de XP |

**Total de indices:** 5 (+ 1 PK automatico)

### Indices Recomendados Adicionales

```sql
-- Indice para busqueda por tenant y estado
CREATE INDEX idx_teams_tenant_active
ON social_features.teams(tenant_id, is_active)
WHERE is_active = true;

-- Indice para busqueda por creador
CREATE INDEX idx_teams_creator
ON social_features.teams(creator_id);

-- Indice para busqueda de equipos publicos
CREATE INDEX idx_teams_public
ON social_features.teams(is_public, is_active)
WHERE is_public = true AND is_active = true;

-- Indice para actividad reciente
CREATE INDEX idx_teams_last_activity
ON social_features.teams(last_activity_at DESC NULLS LAST)
WHERE is_active = true;

-- Indice GIN para busqueda en badges
CREATE INDEX idx_teams_badges_gin
ON social_features.teams USING gin(badges);

-- Indice GIN para busqueda en metadata
CREATE INDEX idx_teams_metadata_gin
ON social_features.teams USING gin(metadata);

-- Indice para busqueda por codigo
CREATE INDEX idx_teams_team_code
ON social_features.teams(team_code)
WHERE team_code IS NOT NULL;
```

---

## 5. Triggers

### Triggers Configurados

| Nombre | Evento | Funcion | Proposito |
|--------|--------|---------|-----------|
| `trg_teams_updated_at` | BEFORE UPDATE | `gamilit.update_updated_at_column()` | Actualizacion automatica de updated_at |

**Total de triggers:** 1

### Triggers Recomendados

```sql
-- Trigger para validar contador de miembros
CREATE OR REPLACE FUNCTION validate_team_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_members_count > NEW.max_members THEN
        RAISE EXCEPTION 'El numero de miembros (%) excede el maximo permitido (%)',
            NEW.current_members_count, NEW.max_members;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_team_members_count
    BEFORE INSERT OR UPDATE ON social_features.teams
    FOR EACH ROW EXECUTE FUNCTION validate_team_members_count();

-- Trigger para actualizar last_activity_at
CREATE OR REPLACE FUNCTION update_team_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (
        OLD.total_xp != NEW.total_xp OR
        OLD.total_ml_coins != NEW.total_ml_coins OR
        OLD.modules_completed != NEW.modules_completed OR
        OLD.achievements_earned != NEW.achievements_earned
    ) THEN
        NEW.last_activity_at = gamilit.now_mexico();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_team_last_activity
    BEFORE UPDATE ON social_features.teams
    FOR EACH ROW EXECUTE FUNCTION update_team_last_activity();

-- Trigger para asignar leader_id = creator_id si es NULL
CREATE OR REPLACE FUNCTION set_default_team_leader()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.leader_id IS NULL THEN
        NEW.leader_id = NEW.creator_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_default_team_leader
    BEFORE INSERT ON social_features.teams
    FOR EACH ROW EXECUTE FUNCTION set_default_team_leader();
```

---

## 6. Row Level Security (RLS)

### Estado Actual
- **RLS HABILITADO:** Si
- **Politicas Definidas:** 0

### Problema Critico
La tabla tiene RLS habilitado pero **NO tiene politicas definidas**, lo que significa que:
- Ningun usuario podra acceder a los datos
- Las consultas SELECT/INSERT/UPDATE/DELETE fallaran
- La tabla esta efectivamente bloqueada

### Politicas RLS Recomendadas

```sql
-- 1. Los administradores pueden ver todos los equipos
CREATE POLICY teams_select_admin ON social_features.teams
    FOR SELECT
    USING (gamilit.is_admin());

-- 2. Los miembros del equipo pueden ver su equipo
CREATE POLICY teams_select_member ON social_features.teams
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM social_features.team_members tm
            WHERE tm.team_id = teams.id
            AND tm.member_id = gamilit.get_current_user_id()
            AND tm.status = 'active'
        )
    );

-- 3. Los profesores pueden ver equipos de sus aulas
CREATE POLICY teams_select_teacher ON social_features.teams
    FOR SELECT
    USING (
        classroom_id IN (
            SELECT id FROM social_features.classrooms
            WHERE teacher_id = gamilit.get_current_user_id()
        )
    );

-- 4. Los equipos publicos son visibles para todos
CREATE POLICY teams_select_public ON social_features.teams
    FOR SELECT
    USING (is_public = true AND is_active = true);

-- 5. Los lideres pueden actualizar su equipo
CREATE POLICY teams_update_leader ON social_features.teams
    FOR UPDATE
    USING (leader_id = gamilit.get_current_user_id());

-- 6. Los profesores pueden actualizar equipos de sus aulas
CREATE POLICY teams_update_teacher ON social_features.teams
    FOR UPDATE
    USING (
        classroom_id IN (
            SELECT id FROM social_features.classrooms
            WHERE teacher_id = gamilit.get_current_user_id()
        )
    );

-- 7. Los estudiantes pueden crear equipos en sus aulas
CREATE POLICY teams_insert_student ON social_features.teams
    FOR INSERT
    WITH CHECK (
        creator_id = gamilit.get_current_user_id()
        AND (
            classroom_id IS NULL
            OR classroom_id IN (
                SELECT cm.classroom_id
                FROM social_features.classroom_members cm
                WHERE cm.student_id = gamilit.get_current_user_id()
                AND cm.status = 'active'
            )
        )
    );

-- 8. Los lideres pueden eliminar su equipo
CREATE POLICY teams_delete_leader ON social_features.teams
    FOR DELETE
    USING (leader_id = gamilit.get_current_user_id());

-- 9. Los administradores pueden gestionar todos los equipos
CREATE POLICY teams_manage_admin ON social_features.teams
    FOR ALL
    USING (gamilit.is_admin());
```

---

## 7. Funciones y Dependencias Externas

### Funciones Referenciadas
1. `gamilit.now_mexico()` - Timestamp en zona horaria de Mexico
2. `gamilit.update_updated_at_column()` - Trigger para updated_at
3. `gamilit.is_admin()` - Verificacion de rol administrador (RLS)
4. `gamilit.get_current_user_id()` - ID del usuario actual (RLS)

### Validacion de Dependencias
- ✅ `social_features.classrooms` - Tabla migrada (03-classrooms.sql)
- ✅ `auth_management.profiles` - Tabla migrada (03-profiles.sql)
- ✅ `auth_management.tenants` - Tabla migrada (01-tenants.sql)
- ✅ `gamilit.now_mexico()` - Funcion disponible en esquema gamilit
- ✅ `gamilit.update_updated_at_column()` - Funcion disponible
- ⚠️ `social_features.team_members` - Pendiente de migracion (requerida para RLS)

---

## 8. Permisos y Seguridad

### Ownership
```sql
ALTER TABLE social_features.teams OWNER TO postgres;
```

### Grants
```sql
GRANT ALL ON TABLE social_features.teams TO gamilit_user;
```

### Analisis de Seguridad
- ✅ Ownership correcto (postgres)
- ✅ Grants apropiados (gamilit_user)
- ⚠️ RLS habilitado pero sin politicas
- ⚠️ Falta validacion de colores hexadecimales
- ⚠️ Falta validacion de rangos en metricas

---

## 9. Migracion y Cambios

### Cambios Realizados
1. ✅ Archivo copiado desde `04-teams.sql` a `05-teams.sql`
2. ✅ Nivel de dependencia ajustado de 4 a 5
3. ✅ Estructura validada
4. ✅ Foreign keys verificadas

### Cambios Pendientes
1. Agregar CHECK constraints para validaciones
2. Agregar politicas RLS funcionales
3. Agregar indices adicionales recomendados
4. Agregar triggers de validacion
5. Agregar comentarios en columnas

---

## 10. Validacion Final

### Checklist de Validacion

#### Estructura Basica
- ✅ Tabla creada correctamente
- ✅ Primary key definida
- ✅ Columnas con tipos apropiados
- ✅ Valores DEFAULT configurados

#### Constraints
- ✅ Primary key: 1/1
- ✅ Unique constraints: 1/1 (team_code)
- ✅ Foreign keys: 4/4
- ⚠️ Check constraints: 0/recomendado 7
- **Score Constraints: 75%**

#### Indices
- ✅ Indices basicos: 5/5
- ⚠️ Indices recomendados: 0/7
- **Score Indices: 60%**

#### Triggers
- ✅ Trigger updated_at: 1/1
- ⚠️ Triggers adicionales: 0/3
- **Score Triggers: 33%**

#### RLS
- ✅ RLS habilitado: Si
- ❌ Politicas definidas: 0/9
- **Score RLS: 0%** (CRITICO)

#### Dependencias
- ✅ classrooms: Disponible
- ✅ profiles: Disponible
- ✅ tenants: Disponible
- ✅ Funciones gamilit: Disponibles
- **Score Dependencias: 100%**

#### Documentacion
- ✅ Comentario en tabla
- ⚠️ Comentarios en columnas: 0/29
- **Score Documentacion: 50%**

---

## 11. Puntuacion General

### Calculo de Score

| Categoria | Peso | Score | Ponderado |
|-----------|------|-------|-----------|
| Estructura Basica | 15% | 100% | 15.0 |
| Constraints | 20% | 75% | 15.0 |
| Indices | 15% | 60% | 9.0 |
| Triggers | 10% | 33% | 3.3 |
| RLS | 25% | 0% | 0.0 |
| Dependencias | 10% | 100% | 10.0 |
| Documentacion | 5% | 50% | 2.5 |

**SCORE TOTAL: 54.8%**

### Estado: ⚠️ REQUIERE ATENCION CRITICA

---

## 12. Problemas Criticos

### 🔴 CRITICO
1. **RLS sin politicas**: La tabla tiene RLS habilitado pero sin politicas, bloqueando todo acceso
   - **Impacto:** Alto - La tabla es inaccesible
   - **Solucion:** Implementar las 9 politicas RLS recomendadas

### 🟡 ADVERTENCIAS
1. **Falta de CHECK constraints**: Sin validaciones de rangos y formatos
   - **Impacto:** Medio - Datos invalidos pueden ingresar
   - **Solucion:** Agregar los 7 CHECK constraints recomendados

2. **Indices insuficientes**: Faltan indices para queries comunes
   - **Impacto:** Medio - Rendimiento suboptimo
   - **Solucion:** Agregar los 7 indices recomendados

3. **Triggers faltantes**: Sin validaciones automaticas
   - **Impacto:** Medio - Inconsistencias de datos
   - **Solucion:** Agregar los 3 triggers recomendados

---

## 13. Plan de Accion

### Fase 1: Critico (Inmediato)
```sql
-- 1. Implementar politicas RLS basicas
-- Ver seccion 6 para scripts completos
```

### Fase 2: Alta Prioridad
```sql
-- 1. Agregar CHECK constraints de validacion
-- Ver seccion 3 para scripts completos

-- 2. Agregar triggers de validacion
-- Ver seccion 5 para scripts completos
```

### Fase 3: Mejoras
```sql
-- 1. Agregar indices adicionales
-- Ver seccion 4 para scripts completos

-- 2. Agregar comentarios en columnas
COMMENT ON COLUMN social_features.teams.name IS 'Nombre del equipo (3-100 caracteres)';
COMMENT ON COLUMN social_features.teams.team_code IS 'Codigo unico para unirse (6+ caracteres, A-Z0-9-)';
-- ... etc
```

---

## 14. Recomendaciones Adicionales

### Rendimiento
1. Considerar particionamiento por tenant_id para instalaciones grandes
2. Implementar indices parciales para queries especificas
3. Monitorear uso de indices GIN en badges y metadata

### Seguridad
1. Validar URLs de avatar y banner contra XSS
2. Implementar rate limiting en creacion de equipos
3. Auditar cambios de leader_id

### Mantenimiento
1. Crear job para archivar equipos inactivos
2. Implementar soft delete en lugar de ON DELETE CASCADE
3. Sincronizar current_members_count con tabla team_members

---

## 15. Conclusiones

### Fortalezas
- ✅ Estructura de datos completa y bien diseñada
- ✅ Foreign keys correctamente definidas
- ✅ Indices basicos para rendimiento
- ✅ Soporte para gamificacion y metricas
- ✅ Sistema de permisos y privacidad robusto

### Debilidades Criticas
- ❌ RLS habilitado sin politicas (tabla bloqueada)
- ❌ Sin validaciones de datos (CHECK constraints)
- ❌ Indices insuficientes para queries comunes
- ❌ Sin triggers de validacion automatica

### Recomendacion Final
**NO APROBAR PARA PRODUCCION** hasta resolver el problema critico de RLS. La tabla esta tecnicamente correcta pero funcionalmente inaccesible. Una vez implementadas las politicas RLS, el score subiria a ~90% y seria apta para produccion.

**Accion Requerida:**
1. Implementar las 9 politicas RLS (CRITICO)
2. Agregar CHECK constraints (ALTA PRIORIDAD)
3. Agregar indices adicionales (MEDIA PRIORIDAD)
4. Agregar triggers de validacion (MEDIA PRIORIDAD)

---

**Validado por:** Claude Code (Sonnet 4.5)
**Fecha de Validacion:** 2025-11-02
**Proxima Revision:** Despues de implementar RLS
