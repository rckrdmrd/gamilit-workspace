---
titulo: Schema 13 - content_management
tipo: arquitectura
subtipo: schema-reference
schema: content_management
ultima_actualizacion: 2026-02-27
---

# Schema 13: content_management (10 tablas)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/content_management/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Plantillas y Versionamiento

### content_management.content_templates
Plantillas reutilizables para crear contenido.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| name | TEXT | NOT NULL | - | Nombre de la plantilla |
| description | TEXT | NULL | NULL | Descripcion |
| template_type | TEXT | NULL | NULL | Tipo: exercise, module, assessment, announcement, feedback |
| template_structure | JSONB | NOT NULL | '{}' | Estructura de la plantilla |
| default_values | JSONB | NULL | '{}' | Valores por defecto |
| required_fields | TEXT[] | NULL | NULL | Campos requeridos |
| optional_fields | TEXT[] | NULL | NULL | Campos opcionales |
| is_public | BOOLEAN | NULL | false | Si es accesible entre tenants |
| is_system_template | BOOLEAN | NULL | false | Si es plantilla del sistema |
| difficulty_level | difficulty_level | NULL | NULL | Nivel de dificultad CEFR |
| usage_count | INTEGER | NULL | 0 | Veces que se ha usado |
| created_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Check:** template_type IN ('exercise', 'module', 'assessment', 'announcement', 'feedback')
**Indices:** `idx_templates_tenant`, `idx_templates_type`, `idx_templates_public` (parcial)
**RLS:** select_public, select_tenant, insert_own, update_own, delete_own (todas por tenant o admin)

---

### content_management.content_versions
Control de versiones para contenido educativo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| content_type | TEXT | NOT NULL | - | Tipo: exercise, module, lesson, quiz |
| content_id | UUID | NOT NULL | - | ID del contenido versionado |
| version_number | INTEGER | NOT NULL | - | Numero de version |
| version_name | TEXT | NULL | NULL | Nombre opcional (ej: "v1.0", "beta") |
| content_data | JSONB | NOT NULL | - | Snapshot completo del contenido en esta version |
| change_summary | TEXT | NULL | NULL | Resumen del cambio |
| change_notes | TEXT | NULL | NULL | Notas del cambio |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |
| is_published | BOOLEAN | NULL | false | Si esta publicada |
| published_at | TIMESTAMPTZ | NULL | NULL | Fecha de publicacion |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Unique:** (content_type, content_id, version_number)
**Indices:** `idx_content_versions_type_id`, `idx_content_versions_tenant`, `idx_content_versions_created_by`, `idx_content_versions_created_at`

---

## Contenido Educativo Curado

### content_management.marie_curie_contents
Contenido curado sobre Marie Curie - biografia, descubrimientos, legado. Base de contenido educativo del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| title | TEXT | NOT NULL | - | Titulo del contenido |
| subtitle | TEXT | NULL | NULL | Subtitulo |
| description | TEXT | NULL | NULL | Descripcion |
| category | TEXT | NULL | NULL | Categoria: biography, discoveries, historical_context, scientific_method, radioactivity, nobel_prizes, women_in_science, modern_physics, legacy |
| content | JSONB | NULL | '{...}' | Contenido estructurado: quotes, timeline, key_points, introduction, main_content |
| target_grade_levels | TEXT[] | NULL | '{6,7,8}' | Grados objetivo |
| difficulty_level | difficulty_level | NULL | 'beginner' | Nivel de dificultad |
| reading_level | TEXT | NULL | NULL | Nivel de lectura |
| learning_objectives | TEXT[] | NULL | NULL | Objetivos de aprendizaje |
| prerequisite_knowledge | TEXT[] | NULL | NULL | Conocimientos previos requeridos |
| key_vocabulary | TEXT[] | NULL | NULL | Vocabulario clave |
| images | UUID[] | NULL | NULL | IDs de imagenes |
| videos | UUID[] | NULL | NULL | IDs de videos |
| audio_files | UUID[] | NULL | NULL | IDs de archivos de audio |
| documents | UUID[] | NULL | NULL | IDs de documentos |
| historical_period | TEXT | NULL | NULL | Periodo historico |
| scientific_field | TEXT | NULL | NULL | Campo cientifico |
| cultural_context | JSONB | NULL | '{}' | Contexto cultural |
| status | content_status | NULL | 'draft' | Estado: draft, published, etc. |
| is_featured | BOOLEAN | NULL | false | Si es contenido destacado |
| is_interactive | BOOLEAN | NULL | false | Si es interactivo |
| created_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| reviewed_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| approved_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| keywords | TEXT[] | NULL | NULL | Palabras clave |
| search_tags | TEXT[] | NULL | NULL | Tags de busqueda |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Check:** category IN (...9 categorias)
**Indices:** `idx_marie_content_tenant`, `idx_marie_content_category`, `idx_marie_content_status`, `idx_marie_content_featured` (parcial), `idx_marie_content_tags` (GIN), `idx_marie_content_search` (GIN tsvector)
**RLS:** marie_content_all_admin (ALL), marie_content_select_all (SELECT published)

---

## Archivos Multimedia

### content_management.media_files
Archivos multimedia - imagenes, videos, audio, documentos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| filename | TEXT | NOT NULL | - | Nombre del archivo |
| original_filename | TEXT | NOT NULL | - | Nombre original del archivo |
| file_extension | TEXT | NULL | NULL | Extension del archivo |
| mime_type | TEXT | NULL | NULL | Tipo MIME |
| file_size_bytes | BIGINT | NULL | NULL | Tamano en bytes |
| media_type | media_type | NOT NULL | - | Tipo: image, video, audio, document, interactive, animation |
| category | TEXT | NULL | NULL | Categoria del archivo |
| subcategory | TEXT | NULL | NULL | Subcategoria |
| storage_path | TEXT | NOT NULL | - | Ruta de almacenamiento |
| public_url | TEXT | NULL | NULL | URL publica |
| cdn_url | TEXT | NULL | NULL | URL de CDN |
| thumbnail_url | TEXT | NULL | NULL | URL de miniatura |
| width | INTEGER | NULL | NULL | Ancho en pixeles |
| height | INTEGER | NULL | NULL | Alto en pixeles |
| duration_seconds | INTEGER | NULL | NULL | Duracion para video/audio |
| bitrate | INTEGER | NULL | NULL | Bitrate |
| resolution | TEXT | NULL | NULL | Resolucion |
| color_profile | TEXT | NULL | NULL | Perfil de color |
| alt_text | TEXT | NULL | NULL | Texto alternativo |
| caption | TEXT | NULL | NULL | Leyenda |
| description | TEXT | NULL | NULL | Descripcion |
| copyright_info | TEXT | NULL | NULL | Informacion de copyright |
| license | TEXT | NULL | NULL | Licencia |
| attribution | TEXT | NULL | NULL | Atribucion |
| processing_status | processing_status | NULL | 'ready' | Estado: uploading, processing, ready, error, optimizing |
| processing_info | JSONB | NULL | '{}' | Info de procesamiento |
| tags | TEXT[] | NULL | NULL | Tags del archivo |
| keywords | TEXT[] | NULL | NULL | Palabras clave |
| folder_path | TEXT | NULL | NULL | Ruta de carpeta |
| usage_count | INTEGER | NULL | 0 | Veces utilizado |
| download_count | INTEGER | NULL | 0 | Descargas |
| view_count | INTEGER | NULL | 0 | Visualizaciones |
| is_public | BOOLEAN | NULL | false | Si es publico |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| is_optimized | BOOLEAN | NULL | false | Si esta optimizado |
| uploaded_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| upload_session_id | TEXT | NULL | NULL | ID de sesion de carga |
| exif_data | JSONB | NULL | '{}' | Datos EXIF |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Check:** file_size_bytes > 0
**Indices:** `idx_media_files_tenant`, `idx_media_files_type`, `idx_media_files_category`, `idx_media_files_uploaded_by`, `idx_media_files_active` (parcial), `idx_media_files_tags` (GIN)
**RLS:** select_public, select_tenant, insert_own, update_own, delete_own (todas por tenant o admin)

---

### content_management.media_metadatas
Metadatos extendidos para archivos multimedia (video, audio, imagenes).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| media_file_id | UUID | NOT NULL | - | FK content_management.media_files (UNIQUE, ON DELETE CASCADE) |
| duration_seconds | INTEGER | NULL | NULL | Duracion para video/audio (segundos) |
| width | INTEGER | NULL | NULL | Ancho en pixeles |
| height | INTEGER | NULL | NULL | Alto en pixeles |
| resolution | VARCHAR(20) | NULL | NULL | Resolucion |
| bitrate | INTEGER | NULL | NULL | Bitrate |
| codec | VARCHAR(50) | NULL | NULL | Codec |
| thumbnail_url | TEXT | NULL | NULL | URL de miniatura |
| alt_text | TEXT | NULL | NULL | Texto alternativo |
| caption | TEXT | NULL | NULL | Leyenda |
| copyright_info | TEXT | NULL | NULL | Info de copyright |
| exif_data | JSONB | NULL | NULL | Datos EXIF del archivo |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (media_file_id)
**Indices:** `idx_media_metadatas_media_file_id`, `idx_media_metadatas_resolution` (parcial), `idx_media_metadatas_exif_gin` (GIN parcial)
**Trigger:** trg_media_metadatas_updated_at

---

## Moderacion y Calidad

### content_management.flagged_contents
Contenido reportado para revision de moderacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| content_type | VARCHAR(50) | NOT NULL | - | Tipo: exercise, comment, profile, post, message |
| content_id | UUID | NOT NULL | - | ID del contenido reportado |
| content_preview | TEXT | NULL | NULL | Vista previa del contenido para revision rapida |
| reported_by | UUID | NOT NULL | - | FK auth_management.profiles (ON DELETE RESTRICT) |
| reason | VARCHAR(255) | NOT NULL | - | Razon del reporte |
| description | TEXT | NULL | NULL | Descripcion detallada |
| status | VARCHAR(20) | NULL | 'pending' | Estado: pending, approved, rejected, removed |
| priority | VARCHAR(20) | NULL | 'medium' | Prioridad: high, medium, low |
| reviewed_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| reviewed_at | TIMESTAMPTZ | NULL | NULL | Fecha de revision |
| review_notes | TEXT | NULL | NULL | Notas de revision |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Check:** status IN ('pending', 'approved', 'rejected', 'removed'); priority IN ('high', 'medium', 'low')
**Indices:** `idx_flagged_contents_type`, `idx_flagged_contents_id`, `idx_flagged_contents_status`, `idx_flagged_contents_priority`, `idx_flagged_contents_reported_by`, `idx_flagged_contents_reviewed_by`, `idx_flagged_contents_created_at`, `idx_flagged_contents_pending` (parcial)

---

### content_management.moderation_rules
Reglas de moderacion automatica con motor de evaluacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| rule_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo de la regla |
| rule_type | VARCHAR(50) | NOT NULL | - | Tipo: keyword, pattern, length, frequency |
| target_entity | VARCHAR(50) | NOT NULL | - | Entidad objetivo: content, comment, message, post |
| rule_config | JSONB | NOT NULL | - | Configuracion JSON especifica del tipo de regla |
| action | VARCHAR(20) | NOT NULL | - | Accion: flag, block, notify, escalate |
| severity | VARCHAR(20) | NULL | 'medium' | Severidad: low, medium, high, critical |
| auto_execute | BOOLEAN | NULL | false | Si se ejecuta automaticamente sin revision |
| require_review | BOOLEAN | NULL | true | Si requiere revision humana despues de la accion |
| is_active | BOOLEAN | NULL | true | Si la regla esta activa |
| priority | INTEGER | NULL | 0 | Prioridad de evaluacion (mayor = mayor prioridad) |
| created_by | UUID | NULL | NULL | FK auth_management.profiles (ON DELETE SET NULL) |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |

**Check:** rule_type IN ('keyword', 'pattern', 'length', 'frequency'); target_entity IN ('content', 'comment', 'message', 'post'); action IN ('flag', 'block', 'notify', 'escalate'); severity IN ('low', 'medium', 'high', 'critical')
**Indices:** `idx_mod_rules_type`, `idx_mod_rules_entity`, `idx_mod_rules_action`, `idx_mod_rules_active` (parcial compuesto), `idx_mod_rules_priority`

---

## Organizacion de Contenido

### content_management.content_authors
Autores de contenido educativo (profesores, creadores de contenido).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (UNIQUE, ON DELETE CASCADE) |
| display_name | VARCHAR(255) | NOT NULL | - | Nombre publico del autor |
| bio | TEXT | NULL | NULL | Biografia |
| expertise_areas | TEXT[] | NULL | NULL | Areas de expertise (ej: ["matematicas", "ciencias"]) |
| total_content_created | INTEGER | NULL | 0 | Contenido total creado |
| total_content_published | INTEGER | NULL | 0 | Contenido total publicado |
| average_rating | NUMERIC(3,2) | NULL | NULL | Calificacion promedio |
| is_featured | BOOLEAN | NOT NULL | false | Si es autor destacado |
| is_verified | BOOLEAN | NOT NULL | false | Si esta verificado por la plataforma |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id)
**Indices:** `idx_content_authors_user_id`, `idx_content_authors_is_featured` (parcial), `idx_content_authors_is_verified` (parcial), `idx_content_authors_average_rating`, `idx_content_authors_expertise_gin` (GIN)
**Trigger:** trg_content_authors_updated_at

---

### content_management.content_categories
Categorias jerarquicas para organizacion de contenido.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la categoria |
| slug | VARCHAR(100) | NOT NULL | - | Identificador URL-friendly (UNIQUE) |
| description | TEXT | NULL | NULL | Descripcion |
| parent_category_id | UUID | NULL | NULL | FK self-referencing (ON DELETE SET NULL) para jerarquia |
| display_order | INTEGER | NULL | 0 | Orden de visualizacion |
| is_active | BOOLEAN | NOT NULL | true | Si esta activa |
| icon | VARCHAR(50) | NULL | NULL | Icono |
| color | VARCHAR(20) | NULL | NULL | Color |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (slug)
**Indices:** `idx_content_categories_parent_id` (parcial), `idx_content_categories_slug`, `idx_content_categories_is_active`, `idx_content_categories_display_order`
**Trigger:** trg_content_categories_updated_at

---

### content_management.tags
Catalogo maestro de tags para organizacion de contenido educativo. Se diferencia de educational_content.content_tags que almacena las relaciones entre contenido y tags.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tag_name | VARCHAR(100) | NOT NULL | - | Nombre visible (ej: "Marie Curie") |
| tag_slug | VARCHAR(120) | NOT NULL | - | Slug unico para URLs (ej: "marie-curie") |
| tag_category | VARCHAR(50) | NOT NULL | - | Categoria: person, scientific_concept, location, achievement, historical_event, subject, theme, value, method |
| description | TEXT | NULL | NULL | Descripcion detallada para contexto educativo |
| usage_count | INTEGER | NULL | 0 | Contador de uso |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (tag_slug)
**Check:** tag_category IN ('person', 'scientific_concept', 'location', 'achievement', 'historical_event', 'subject', 'theme', 'value', 'method')
**Indices:** `idx_tags_slug`, `idx_tags_category`, `idx_tags_name_trgm` (GIN trigram), `idx_tags_active` (parcial)

---

*GAMILIT - Schema Reference: content_management*
*10 tablas | PostgreSQL 15*