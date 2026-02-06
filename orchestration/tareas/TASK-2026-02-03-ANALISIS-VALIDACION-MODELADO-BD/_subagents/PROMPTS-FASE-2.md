# Prompts Fase 2: Remediacion

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Total Prompts:** 23

---

## Sprint 1: Criticos (3 prompts)

### PROMPT-F2-S1-001: Eliminar Tablas Obsoletas

```yaml
prompt_id: "PROMPT-F2-S1-001"
agente: "@DDL_AGENT"
objetivo: "Eliminar tablas marcadas como obsoletas/duplicadas"
contexto_enviado:
  - "FINDINGS-CONSOLIDATED.md (seccion tablas obsoletas)"
  - "Lista de tablas a eliminar"
  - "Dependencias FK"
prompt_texto: |
  GENERA script DDL para eliminar tablas obsoletas.

  TABLAS A ELIMINAR:
  - temp_user_data (datos temporales no usados)
  - old_permissions (reemplazada por permissions_v2)
  - legacy_config (migrada a app_config)

  ORDEN DE ELIMINACION:
  1. Primero eliminar FK que referencian estas tablas
  2. Luego DROP TABLE

  INCLUIR:
  - IF EXISTS para idempotencia
  - Comentario explicando razon
  - Backup sugerido antes de ejecutar

  FORMATO:
  -- ============================================
  -- Script: DROP obsolete tables
  -- Sprint: 1 - Criticos
  -- Fecha: {date}
  -- ============================================

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-1/01_drop_obsolete_tables.sql"
  hallazgos:
    - tablas_eliminadas: 3
    - fk_eliminadas: 5
tiempo_estimado: "8m"
tokens_estimados: 1800
```

---

### PROMPT-F2-S1-002: Crear Politicas RLS Faltantes

```yaml
prompt_id: "PROMPT-F2-S1-002"
agente: "@RLS_AGENT"
objetivo: "Implementar RLS en tablas criticas sin proteccion"
contexto_enviado:
  - "Lista de tablas sin RLS"
  - "Modelo de roles"
  - "Politicas RLS existentes"
prompt_texto: |
  GENERA politicas RLS para tablas criticas.

  TABLAS SIN RLS (CRITICAS):
  - iam.users (datos sensibles)
  - iam.sessions (tokens)
  - marketplace.payments (financiero)
  - marketplace.transactions (financiero)

  POLITICAS REQUERIDAS:
  1. users: solo el propio usuario o admin
  2. sessions: solo el propio usuario
  3. payments: solo el comprador o admin
  4. transactions: solo partes involucradas

  TEMPLATE:
  ALTER TABLE {schema}.{table} ENABLE ROW LEVEL SECURITY;

  CREATE POLICY {policy_name} ON {schema}.{table}
      FOR ALL
      TO authenticated
      USING (
          user_id = current_setting('app.current_user_id')::uuid
          OR current_setting('app.current_role') = 'admin'
      );

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-1/02_rls_critical_tables.sql"
  hallazgos:
    - politicas_creadas: 8
    - tablas_protegidas: 4
tiempo_estimado: "15m"
tokens_estimados: 2500
```

---

### PROMPT-F2-S1-003: Corregir FK Criticas Rotas

```yaml
prompt_id: "PROMPT-F2-S1-003"
agente: "@DDL_AGENT"
objetivo: "Reparar FK que referencian tablas inexistentes"
contexto_enviado:
  - "Lista de FK rotas"
  - "Tablas actuales"
prompt_texto: |
  CORRIGE FK con referencias invalidas.

  FK ROTAS DETECTADAS:
  - posts.author_id -> users.id (OK)
  - posts.category_id -> post_categories.id (tabla no existe!)
  - comments.parent_id -> comments.id (self-ref, OK)
  - orders.payment_id -> payments.id (tabla no existe!)

  ACCIONES:
  1. Crear tablas faltantes (post_categories, payments)
  2. O eliminar FK si no se necesita la relacion

  DECISION: Crear tablas minimas para satisfacer FK.

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-1/03_fix_broken_fk.sql"
  hallazgos:
    - tablas_creadas: 2
    - fk_reparadas: 3
tiempo_estimado: "12m"
tokens_estimados: 2200
```

---

## Sprint 2: Fundamentos (4 prompts)

### PROMPT-F2-S2-001: Crear ENUMs Faltantes

```yaml
prompt_id: "PROMPT-F2-S2-001"
agente: "@DDL_AGENT"
objetivo: "Crear tipos ENUM faltantes referenciados en tablas"
contexto_enviado:
  - "Lista de ENUMs referenciados pero no definidos"
  - "Valores esperados"
prompt_texto: |
  GENERA DDL para ENUMs faltantes.

  ENUMS FALTANTES:
  1. user_status: 'active', 'inactive', 'suspended', 'deleted'
  2. order_status: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  3. payment_status: 'pending', 'processing', 'completed', 'failed', 'refunded'
  4. content_type: 'text', 'image', 'video', 'audio', 'document'

  TEMPLATE:
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}') THEN
          CREATE TYPE {enum_name} AS ENUM ({values});
      END IF;
  END $$;

  UBICAR en: ddl/01_core/03_enums.sql

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-2/01_create_missing_enums.sql"
  hallazgos:
    - enums_creados: 4
tiempo_estimado: "10m"
tokens_estimados: 1500
```

---

### PROMPT-F2-S2-002: Tablas de Configuracion

```yaml
prompt_id: "PROMPT-F2-S2-002"
agente: "@DDL_AGENT"
objetivo: "Crear tablas de configuracion del sistema"
contexto_enviado:
  - "Requerimientos de configuracion"
  - "Patron de config tables"
prompt_texto: |
  GENERA tablas de configuracion del sistema.

  TABLAS REQUERIDAS:
  1. app_settings (configuracion global)
  2. feature_flags (toggles de funcionalidades)
  3. system_parameters (parametros del sistema)
  4. tenant_configs (configuracion por tenant)

  ESTRUCTURA BASE:
  CREATE TABLE core.app_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      key VARCHAR(100) NOT NULL UNIQUE,
      value JSONB NOT NULL DEFAULT '{}',
      category VARCHAR(50),
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-2/02_config_tables.sql"
  hallazgos:
    - tablas_creadas: 4
tiempo_estimado: "12m"
tokens_estimados: 2000
```

---

### PROMPT-F2-S2-003: Tablas de Sistema/Audit

```yaml
prompt_id: "PROMPT-F2-S2-003"
agente: "@DDL_AGENT"
objetivo: "Crear tablas de auditoria y logs del sistema"
contexto_enviado:
  - "Requerimientos de auditoria"
  - "Patron de audit tables"
prompt_texto: |
  GENERA tablas de auditoria del sistema.

  TABLAS REQUERIDAS:
  1. audit_logs (registro de cambios)
  2. activity_logs (actividad de usuarios)
  3. error_logs (errores del sistema)
  4. api_request_logs (requests API)

  ESTRUCTURA audit_logs:
  CREATE TABLE core.audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      table_name VARCHAR(100) NOT NULL,
      record_id UUID NOT NULL,
      action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
      old_values JSONB,
      new_values JSONB,
      changed_fields TEXT[],
      user_id UUID REFERENCES iam.users(id),
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

  INDICES para queries frecuentes.

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-2/03_audit_tables.sql"
  hallazgos:
    - tablas_creadas: 4
    - indices_creados: 8
tiempo_estimado: "15m"
tokens_estimados: 2500
```

---

### PROMPT-F2-S2-004: Seeds Basicos

```yaml
prompt_id: "PROMPT-F2-S2-004"
agente: "@SEED_AGENT"
objetivo: "Generar datos iniciales del sistema"
contexto_enviado:
  - "Tablas de configuracion"
  - "Roles base requeridos"
prompt_texto: |
  GENERA seeds para datos iniciales.

  SEEDS REQUERIDOS:
  1. Roles base: admin, user, moderator, guest
  2. Permisos CRUD por modulo
  3. Configuracion default
  4. Feature flags iniciales

  FORMATO:
  -- Seeds: {categoria}
  INSERT INTO {table} ({columns})
  VALUES ({values})
  ON CONFLICT ({unique_key}) DO NOTHING;

  ORDEN por dependencias FK.

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-2/04_base_seeds.sql"
  hallazgos:
    - registros_insertados: 45
tiempo_estimado: "18m"
tokens_estimados: 3000
```

---

## Sprint 3: Social (4 prompts)

### PROMPT-F2-S3-001: Tablas de Posts

```yaml
prompt_id: "PROMPT-F2-S3-001"
agente: "@DDL_AGENT"
objetivo: "Crear/corregir tablas del dominio posts"
contexto_enviado:
  - "Modelo de posts actual"
  - "Hallazgos de gaps"
prompt_texto: |
  GENERA DDL para dominio posts.

  TABLAS:
  1. posts (publicaciones)
  2. post_categories (categorias)
  3. post_tags (etiquetas)
  4. post_tag_relations (N:M)

  CAMPOS posts:
  - id, user_id, title, content, excerpt
  - category_id, status, visibility
  - view_count, like_count, comment_count
  - published_at, created_at, updated_at

  RELACIONES:
  - posts -> users (author)
  - posts -> post_categories
  - posts <-> post_tags (N:M)

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-3/01_posts_tables.sql"
  hallazgos:
    - tablas_creadas: 4
tiempo_estimado: "15m"
tokens_estimados: 2500
```

---

### PROMPT-F2-S3-002: Tablas de Comentarios

```yaml
prompt_id: "PROMPT-F2-S3-002"
agente: "@DDL_AGENT"
objetivo: "Crear tablas de comentarios con soporte anidado"
contexto_enviado:
  - "Modelo de comentarios"
  - "Soporte para respuestas anidadas"
prompt_texto: |
  GENERA DDL para comentarios anidados.

  TABLA comments:
  - id, post_id, user_id
  - parent_id (self-reference para anidado)
  - content, status
  - like_count, reply_count
  - depth (nivel de anidacion)
  - path (materialized path para queries)
  - created_at, updated_at

  INDICES:
  - idx_comments_post_id
  - idx_comments_parent_id
  - idx_comments_path (para queries jerarquicas)

  CONSTRAINT: depth <= 5 (limitar anidacion)

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-3/02_comments_tables.sql"
  hallazgos:
    - tablas_creadas: 1
    - indices_creados: 4
tiempo_estimado: "12m"
tokens_estimados: 2000
```

---

### PROMPT-F2-S3-003: Tablas de Reacciones

```yaml
prompt_id: "PROMPT-F2-S3-003"
agente: "@DDL_AGENT"
objetivo: "Crear sistema de reacciones flexible"
contexto_enviado:
  - "Tipos de reacciones soportadas"
  - "Entidades que pueden recibir reacciones"
prompt_texto: |
  GENERA DDL para sistema de reacciones.

  TABLA reactions:
  - id, user_id
  - target_type (ENUM: 'post', 'comment', 'message')
  - target_id (UUID polimorfico)
  - reaction_type (ENUM: 'like', 'love', 'laugh', etc.)
  - created_at

  UNIQUE CONSTRAINT:
  - (user_id, target_type, target_id) -- un usuario, una reaccion por target

  INDICES:
  - idx_reactions_target (target_type, target_id)
  - idx_reactions_user_id

  ENUM reaction_type_enum:
  'like', 'love', 'laugh', 'wow', 'sad', 'angry'

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-3/03_reactions_tables.sql"
  hallazgos:
    - tablas_creadas: 1
    - enums_creados: 2
tiempo_estimado: "10m"
tokens_estimados: 1800
```

---

### PROMPT-F2-S3-004: Tablas de Follows/Connections

```yaml
prompt_id: "PROMPT-F2-S3-004"
agente: "@DDL_AGENT"
objetivo: "Crear sistema de conexiones entre usuarios"
contexto_enviado:
  - "Modelo de red social"
  - "Tipos de conexiones"
prompt_texto: |
  GENERA DDL para conexiones entre usuarios.

  TABLAS:
  1. user_follows (seguimientos unidireccionales)
  2. user_connections (conexiones bidireccionales)
  3. user_blocks (bloqueos)

  TABLA user_follows:
  - id, follower_id, following_id
  - status (active, muted)
  - created_at
  - UNIQUE (follower_id, following_id)
  - CHECK (follower_id != following_id)

  TABLA user_connections:
  - id, user_a_id, user_b_id
  - status (pending, accepted, rejected)
  - requested_by
  - created_at, accepted_at

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-3/04_connections_tables.sql"
  hallazgos:
    - tablas_creadas: 3
tiempo_estimado: "12m"
tokens_estimados: 2200
```

---

## Sprint 4: Documentacion (4 prompts)

### PROMPT-F2-S4-001: Documentar Dominio Core

```yaml
prompt_id: "PROMPT-F2-S4-001"
agente: "@DOC_AGENT"
objetivo: "Agregar COMMENT ON a tablas del dominio core"
contexto_enviado:
  - "Tablas del dominio core"
  - "Descripciones de negocio"
prompt_texto: |
  GENERA COMMENT ON para dominio core.

  FORMATO:
  COMMENT ON TABLE {schema}.{table} IS '{descripcion}';
  COMMENT ON COLUMN {schema}.{table}.{column} IS '{descripcion}';

  INCLUIR:
  - Descripcion de la tabla
  - Proposito de cada columna
  - Notas de uso importante
  - Referencias a otras tablas

  EJEMPLO:
  COMMENT ON TABLE core.app_settings IS
    'Configuracion global de la aplicacion. Cada fila es un par key-value.';
  COMMENT ON COLUMN core.app_settings.key IS
    'Identificador unico de la configuracion. Usar snake_case.';

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-4/01_comments_core.sql"
  hallazgos:
    - tablas_documentadas: 8
    - columnas_documentadas: 45
tiempo_estimado: "20m"
tokens_estimados: 3500
```

---

### PROMPT-F2-S4-002: Documentar Dominio IAM

```yaml
prompt_id: "PROMPT-F2-S4-002"
agente: "@DOC_AGENT"
objetivo: "Agregar COMMENT ON a tablas del dominio IAM"
contexto_enviado:
  - "Tablas del dominio IAM"
  - "Modelo de permisos"
prompt_texto: |
  GENERA COMMENT ON para dominio IAM.

  TABLAS A DOCUMENTAR:
  - iam.users
  - iam.roles
  - iam.permissions
  - iam.user_roles
  - iam.role_permissions
  - iam.sessions

  ENFASIS en:
  - Campos sensibles (password_hash, tokens)
  - Relaciones RBAC
  - Campos de seguridad

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-4/02_comments_iam.sql"
  hallazgos:
    - tablas_documentadas: 6
    - columnas_documentadas: 52
tiempo_estimado: "18m"
tokens_estimados: 3200
```

---

### PROMPT-F2-S4-003: Documentar Dominio Social

```yaml
prompt_id: "PROMPT-F2-S4-003"
agente: "@DOC_AGENT"
objetivo: "Agregar COMMENT ON a tablas del dominio social"
contexto_enviado:
  - "Tablas del dominio social"
  - "Funcionalidades de red social"
prompt_texto: |
  GENERA COMMENT ON para dominio social.

  TABLAS A DOCUMENTAR:
  - social.posts
  - social.comments
  - social.reactions
  - social.user_follows
  - social.user_connections

  ENFASIS en:
  - Campos de contadores (denormalizados)
  - Self-references (comentarios anidados)
  - Relaciones poliorficas (reactions)

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-4/03_comments_social.sql"
  hallazgos:
    - tablas_documentadas: 5
    - columnas_documentadas: 38
tiempo_estimado: "15m"
tokens_estimados: 2800
```

---

### PROMPT-F2-S4-004: Generar Diagrama ER Texto

```yaml
prompt_id: "PROMPT-F2-S4-004"
agente: "@DOC_AGENT"
objetivo: "Generar diagrama ER en formato texto/mermaid"
contexto_enviado:
  - "Todas las tablas DDL"
  - "Relaciones FK"
prompt_texto: |
  GENERA diagrama ER en formato Mermaid.

  FORMATO:
  ```mermaid
  erDiagram
      USERS ||--o{ POSTS : "creates"
      USERS ||--o{ COMMENTS : "writes"
      POSTS ||--o{ COMMENTS : "has"
      POSTS }|--|| POST_CATEGORIES : "belongs to"
  ```

  INCLUIR:
  - Todas las tablas agrupadas por dominio
  - Relaciones con cardinalidad
  - Campos clave de cada tabla

  GENERAR tambien version ASCII simple para README.

resultado:
  estado: "exito"
  archivos_generados:
    - "docs/ER-DIAGRAM.md"
    - "docs/ER-DIAGRAM-ASCII.txt"
  hallazgos:
    - tablas_diagramadas: 25
    - relaciones_documentadas: 40
tiempo_estimado: "25m"
tokens_estimados: 4000
```

---

## Sprint 5: Mejoras (5 prompts)

### PROMPT-F2-S5-001: Agregar Indices Faltantes

```yaml
prompt_id: "PROMPT-F2-S5-001"
agente: "@DDL_AGENT"
objetivo: "Crear indices para queries frecuentes"
contexto_enviado:
  - "Queries esperadas"
  - "Indices actuales"
  - "Patron de uso"
prompt_texto: |
  GENERA indices para optimizar queries.

  QUERIES FRECUENTES:
  1. Buscar posts por usuario -> idx_posts_user_id
  2. Buscar posts por fecha -> idx_posts_created_at
  3. Buscar comentarios por post -> idx_comments_post_id
  4. Buscar reacciones por target -> idx_reactions_target

  REGLAS:
  - Indices compuestos para queries con multiples filtros
  - Indices parciales para datos activos (WHERE is_active = true)
  - No duplicar indices ya cubiertos por PK/UNIQUE

  FORMATO:
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_{tabla}_{columnas}
      ON {schema}.{tabla}({columnas});

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-5/01_add_indexes.sql"
  hallazgos:
    - indices_creados: 15
tiempo_estimado: "12m"
tokens_estimados: 2200
```

---

### PROMPT-F2-S5-002: Renombrar Columnas Inconsistentes

```yaml
prompt_id: "PROMPT-F2-S5-002"
agente: "@RENAME_AGENT"
objetivo: "Corregir nombres de columnas que no siguen convencion"
contexto_enviado:
  - "Lista de columnas mal nombradas"
  - "Naming conventions"
prompt_texto: |
  GENERA scripts para renombrar columnas.

  COLUMNAS A RENOMBRAR:
  - posts.authorId -> posts.author_id
  - users.createdAt -> users.created_at
  - comments.parentID -> comments.parent_id
  - reactions.targetType -> reactions.target_type

  FORMATO:
  ALTER TABLE {schema}.{tabla}
      RENAME COLUMN {old_name} TO {new_name};

  TAMBIEN actualizar:
  - Indices que usan la columna
  - CHECK constraints
  - Comentarios

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-5/02_rename_columns.sql"
  hallazgos:
    - columnas_renombradas: 12
tiempo_estimado: "10m"
tokens_estimados: 1800
```

---

### PROMPT-F2-S5-003: Renombrar Tablas Singular a Plural

```yaml
prompt_id: "PROMPT-F2-S5-003"
agente: "@RENAME_AGENT"
objetivo: "Corregir tablas en singular a plural"
contexto_enviado:
  - "Lista de tablas en singular"
  - "Dependencias FK"
prompt_texto: |
  GENERA scripts para renombrar tablas.

  TABLAS A RENOMBRAR:
  - iam.user -> iam.users
  - social.post -> social.posts
  - social.comment -> social.comments
  - marketplace.order -> marketplace.orders

  PROCESO:
  1. DROP FK que referencian la tabla
  2. RENAME tabla
  3. RECREAR FK con nuevo nombre
  4. Actualizar indices

  FORMATO:
  ALTER TABLE {schema}.{old_name}
      RENAME TO {new_name};

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-5/03_rename_tables.sql"
  hallazgos:
    - tablas_renombradas: 8
    - fk_actualizadas: 15
tiempo_estimado: "15m"
tokens_estimados: 2500
```

---

### PROMPT-F2-S5-004: Agregar Campos Audit Faltantes

```yaml
prompt_id: "PROMPT-F2-S5-004"
agente: "@DDL_AGENT"
objetivo: "Agregar campos de auditoria a tablas que no los tienen"
contexto_enviado:
  - "Lista de tablas sin campos audit"
  - "Patron de audit"
prompt_texto: |
  GENERA DDL para agregar campos audit.

  CAMPOS AUDIT STANDARD:
  - created_at TIMESTAMPTZ DEFAULT NOW()
  - updated_at TIMESTAMPTZ DEFAULT NOW()
  - created_by UUID REFERENCES iam.users(id)
  - updated_by UUID REFERENCES iam.users(id)
  - deleted_at TIMESTAMPTZ (soft delete)
  - is_active BOOLEAN DEFAULT true

  TABLAS SIN AUDIT:
  - core.app_settings (solo tiene created_at)
  - social.reactions (sin campos audit)
  - messaging.messages (sin soft delete)

  FORMATO:
  ALTER TABLE {schema}.{tabla}
      ADD COLUMN IF NOT EXISTS {column} {type} {default};

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-5/04_add_audit_fields.sql"
  hallazgos:
    - tablas_actualizadas: 10
    - campos_agregados: 35
tiempo_estimado: "15m"
tokens_estimados: 2800
```

---

### PROMPT-F2-S5-005: Agregar CHECK Constraints

```yaml
prompt_id: "PROMPT-F2-S5-005"
agente: "@DDL_AGENT"
objetivo: "Agregar constraints de validacion de datos"
contexto_enviado:
  - "Reglas de negocio"
  - "Valores validos por campo"
prompt_texto: |
  GENERA CHECK constraints para validacion.

  CONSTRAINTS REQUERIDOS:
  1. users.email LIKE '%@%.%'
  2. posts.status IN ('draft', 'published', 'archived')
  3. comments.depth BETWEEN 0 AND 5
  4. reactions.reaction_type IS NOT NULL
  5. orders.total_amount >= 0

  FORMATO:
  ALTER TABLE {schema}.{tabla}
      ADD CONSTRAINT chk_{tabla}_{campo}
      CHECK ({condicion});

  NOMBRAR: chk_{tabla}_{campo}_{descripcion}

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-5/05_add_check_constraints.sql"
  hallazgos:
    - constraints_creados: 18
tiempo_estimado: "12m"
tokens_estimados: 2200
```

---

## Sprint 6: Backlog (3 prompts)

### PROMPT-F2-S6-001: Tablas de Notificaciones

```yaml
prompt_id: "PROMPT-F2-S6-001"
agente: "@DDL_AGENT"
objetivo: "Crear sistema de notificaciones"
contexto_enviado:
  - "Tipos de notificaciones"
  - "Canales de entrega"
prompt_texto: |
  GENERA DDL para sistema de notificaciones.

  TABLAS:
  1. notifications (notificaciones)
  2. notification_templates (plantillas)
  3. notification_preferences (preferencias usuario)
  4. notification_channels (canales: email, push, sms)

  ESTRUCTURA notifications:
  - id, user_id, type
  - title, body, data (JSONB)
  - target_type, target_id (polimorfico)
  - channel, status
  - read_at, sent_at, created_at

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-6/01_notifications_tables.sql"
  hallazgos:
    - tablas_creadas: 4
tiempo_estimado: "15m"
tokens_estimados: 2500
```

---

### PROMPT-F2-S6-002: Tablas de Reportes/Analytics

```yaml
prompt_id: "PROMPT-F2-S6-002"
agente: "@DDL_AGENT"
objetivo: "Crear tablas para analytics y reportes"
contexto_enviado:
  - "Metricas a trackear"
  - "Patron de analytics"
prompt_texto: |
  GENERA DDL para analytics.

  TABLAS:
  1. analytics_events (eventos raw)
  2. analytics_sessions (sesiones)
  3. daily_stats (agregados diarios)
  4. user_activity_summary (resumen por usuario)

  PARTICIONAMIENTO:
  - analytics_events por fecha (mensual)

  INDICES:
  - Por fecha para queries de rango
  - Por usuario para dashboards

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-6/02_analytics_tables.sql"
  hallazgos:
    - tablas_creadas: 4
    - particiones_configuradas: 1
tiempo_estimado: "18m"
tokens_estimados: 3000
```

---

### PROMPT-F2-S6-003: Limpieza Final

```yaml
prompt_id: "PROMPT-F2-S6-003"
agente: "@CLEANUP_AGENT"
objetivo: "Limpieza final del DDL"
contexto_enviado:
  - "Todo el DDL generado"
  - "Lista de items pendientes"
prompt_texto: |
  EJECUTA limpieza final del DDL.

  TAREAS:
  1. Verificar no hay tablas huerfanas nuevas
  2. Verificar todas las FK son validas
  3. Eliminar comentarios TODO pendientes
  4. Ordenar archivos por dependencia
  5. Generar script de verificacion

  GENERAR:
  - 99_verify_schema.sql (queries de verificacion)
  - CLEANUP-REPORT.md (reporte de limpieza)

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/sprint-6/99_verify_schema.sql"
    - "docs/CLEANUP-REPORT.md"
  hallazgos:
    - issues_resueltos: 5
    - warnings_pendientes: 2
tiempo_estimado: "20m"
tokens_estimados: 3500
```

---

## Metricas Agregadas Fase 2

| Sprint | Prompts | Tokens Entrada | Tokens Salida | Tiempo |
|--------|---------|----------------|---------------|--------|
| Sprint 1 | 3 | ~6,500 | ~4,000 | ~35m |
| Sprint 2 | 4 | ~9,000 | ~5,500 | ~55m |
| Sprint 3 | 4 | ~8,500 | ~5,200 | ~49m |
| Sprint 4 | 4 | ~13,500 | ~8,500 | ~78m |
| Sprint 5 | 5 | ~11,500 | ~7,000 | ~64m |
| Sprint 6 | 3 | ~9,000 | ~5,500 | ~53m |
| **TOTAL** | **23** | **~58,000** | **~35,700** | **~334m** |

---

## Patrones Reutilizables

### Patron: Crear Tabla
```yaml
template: |
  GENERA DDL para tabla {TABLE}.
  CAMPOS: {FIELDS}
  RELACIONES: {RELATIONS}
  INDICES: {INDEXES}
  CONSTRAINTS: {CONSTRAINTS}
```

### Patron: Renombrar con Dependencias
```yaml
template: |
  RENOMBRA {OLD_NAME} a {NEW_NAME}.
  PROCESO:
  1. Identificar dependencias
  2. DROP FK temporalmente
  3. RENAME
  4. RECREAR FK
```

### Patron: Documentar Dominio
```yaml
template: |
  GENERA COMMENT ON para dominio {DOMAIN}.
  TABLAS: {TABLES}
  ENFASIS: {FOCUS_AREAS}
```

---

*Generado: 2026-02-03 | Sistema SIMCO v4.0.0*
