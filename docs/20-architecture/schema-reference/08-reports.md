# Schema 8: reports (4 tablas, 16 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### reports.report_templates
Templates predefinidos de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre del template |
| type | VARCHAR(50) | NOT NULL | - | Tipo (student, classroom, school) |
| description | TEXT | NULL | NULL | Descripcion |
| template_data | JSONB | NOT NULL | '{}' | Definicion del template |
| format | report_format | NOT NULL | 'pdf' | Formato por defecto |
| is_active | BOOLEAN | NOT NULL | true | Template activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_instances
Instancias generadas de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| template_id | UUID | NOT NULL | - | FK reports.report_templates |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| generated_by | UUID | NOT NULL | - | FK auth.users |
| parameters | JSONB | NOT NULL | '{}' | Parametros usados |
| status | report_status | NOT NULL | 'pending' | Estado |
| result_data | JSONB | NULL | NULL | Datos del resultado |
| file_url | VARCHAR(500) | NULL | NULL | URL del archivo generado |
| error_message | TEXT | NULL | NULL | Error si fallo |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio de generacion |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fin de generacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_schedules
Reportes programados automaticos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| template_id | UUID | NOT NULL | - | FK reports.report_templates |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| created_by | UUID | NOT NULL | - | FK auth.users |
| cron_expression | VARCHAR(50) | NOT NULL | - | Expresion cron |
| parameters | JSONB | NOT NULL | '{}' | Parametros del reporte |
| recipients | JSONB | NOT NULL | '[]' | Destinatarios (email) |
| is_active | BOOLEAN | NOT NULL | true | Schedule activo |
| last_run_at | TIMESTAMPTZ | NULL | NULL | Ultima ejecucion |
| next_run_at | TIMESTAMPTZ | NULL | NULL | Proxima ejecucion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_exports
Archivos exportados de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| instance_id | UUID | NOT NULL | - | FK reports.report_instances |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| format | report_format | NOT NULL | - | Formato (pdf, excel, csv) |
| file_path | VARCHAR(500) | NOT NULL | - | Ruta del archivo |
| file_size_bytes | INTEGER | NOT NULL | 0 | Tamano en bytes |
| download_count | INTEGER | NOT NULL | 0 | Descargas |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del archivo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
