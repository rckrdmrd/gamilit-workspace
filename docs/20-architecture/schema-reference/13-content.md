# Schema 13: content (3 tablas, 8 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### content.media_files
Archivos multimedia (imagenes, audio, video).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| file_name | VARCHAR(255) | NOT NULL | - | Nombre del archivo |
| file_path | VARCHAR(500) | NOT NULL | - | Ruta de almacenamiento |
| mime_type | VARCHAR(100) | NOT NULL | - | Tipo MIME |
| media_type | media_type | NOT NULL | - | image, audio, video, document |
| file_size_bytes | INTEGER | NOT NULL | 0 | Tamano |
| uploaded_by | UUID | NOT NULL | - | FK auth.users |
| metadata | JSONB | NULL | '{}' | Metadatos (dimensions, duration, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### content.media_categories
Categorias de archivos multimedia.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre |
| slug | VARCHAR(100) | NOT NULL | - | Slug |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### content.content_libraries
Bibliotecas de contenido por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la biblioteca |
| description | TEXT | NULL | NULL | Descripcion |
| is_public | BOOLEAN | NOT NULL | false | Accesible entre tenants |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
