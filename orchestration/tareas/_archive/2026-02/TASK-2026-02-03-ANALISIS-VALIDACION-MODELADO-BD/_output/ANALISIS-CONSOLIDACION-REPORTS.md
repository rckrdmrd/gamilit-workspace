# ANALISIS-CONSOLIDACION-REPORTS.md

**SPRINT 6 - TASK 6.3: Evaluacion de Consolidacion de Report Tables**
**Fecha:** 2026-02-03
**Autor:** Claude Opus 4.5 (Agente Arquitecto)

---

## 1. INVENTARIO DE TABLAS ANALIZADAS

### 1.1 Tablas Identificadas

| # | Schema | Tabla | Archivo DDL |
|---|--------|-------|-------------|
| 1 | admin_dashboard | admin_reports | schemas/admin_dashboard/tables/08-admin_reports.sql |
| 2 | social_features | teacher_reports | schemas/social_features/tables/08-teacher_reports.sql |
| 3 | social_features | scheduled_reports | schemas/social_features/tables/11-scheduled_reports.sql |
| 4 | social_features | shared_reports | schemas/social_features/tables/12-shared_reports.sql |

---

## 2. INVENTARIO DETALLADO DE COLUMNAS

### 2.1 admin_dashboard.admin_reports

| Columna | Tipo | Nullable | Default | Proposito |
|---------|------|----------|---------|-----------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo de reporte: users, progress, engagement, etc |
| report_format | VARCHAR(20) | NOT NULL | - | Formato: pdf, excel, csv |
| status | VARCHAR(20) | NOT NULL | 'pending' | Estado: pending, generating, completed, failed |
| file_url | VARCHAR(500) | NULL | - | URL del archivo generado |
| file_size | INTEGER | NULL | - | Tamano en bytes |
| metadata | JSONB | NULL | '{}' | Filtros, parametros, configuracion |
| error_message | TEXT | NULL | - | Mensaje de error si falla |
| requested_by | UUID | NOT NULL | - | FK a profiles |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | Fecha creacion |
| completed_at | TIMESTAMP | NULL | - | Fecha completado |
| expires_at | TIMESTAMP | NULL | - | Fecha expiracion |
| tenant_id | UUID | NOT NULL | - | FK a tenants |

**Total columnas: 12**

---

### 2.2 social_features.teacher_reports

| Columna | Tipo | Nullable | Default | Proposito |
|---------|------|----------|---------|-----------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK a profiles (profesor) |
| classroom_id | UUID | NULL | - | FK a classrooms |
| tenant_id | UUID | NOT NULL | - | FK a tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo: individual, classroom, progress, analytics |
| report_format | VARCHAR(10) | NOT NULL | - | Formato: pdf, excel, csv |
| student_count | INTEGER | NULL | 0 | Cantidad de estudiantes |
| period_start | DATE | NULL | - | Inicio del periodo |
| period_end | DATE | NULL | - | Fin del periodo |
| file_path | TEXT | NULL | - | Ruta del archivo |
| file_size_bytes | BIGINT | NULL | - | Tamano en bytes |
| generated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha generacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha creacion |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha actualizacion |

**Total columnas: 15**

---

### 2.3 social_features.scheduled_reports

| Columna | Tipo | Nullable | Default | Proposito |
|---------|------|----------|---------|-----------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK a profiles |
| classroom_id | UUID | NULL | - | FK a classrooms |
| tenant_id | UUID | NOT NULL | - | FK a tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre del reporte |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo de reporte |
| report_format | VARCHAR(10) | NOT NULL | 'pdf' | Formato |
| template_id | VARCHAR(50) | NULL | - | ID de plantilla |
| frequency | VARCHAR(20) | NOT NULL | - | Frecuencia: daily, weekly, monthly |
| day_of_week | INTEGER | NULL | - | 0-6 para weekly |
| day_of_month | INTEGER | NULL | - | 1-28 para monthly |
| time_of_day | TIME | NOT NULL | '08:00:00' | Hora de ejecucion |
| timezone | VARCHAR(50) | NULL | 'America/Mexico_City' | Zona horaria |
| is_active | BOOLEAN | NULL | true | Activo/Inactivo |
| last_run_at | TIMESTAMPTZ | NULL | - | Ultima ejecucion |
| next_run_at | TIMESTAMPTZ | NULL | - | Proxima ejecucion |
| last_error | TEXT | NULL | - | Ultimo error |
| run_count | INTEGER | NULL | 0 | Contador de ejecuciones |
| notify_email | BOOLEAN | NULL | false | Enviar notificacion |
| email_recipients | TEXT[] | NULL | - | Lista de emails |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha creacion |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha actualizacion |

**Total columnas: 22**

---

### 2.4 social_features.shared_reports

| Columna | Tipo | Nullable | Default | Proposito |
|---------|------|----------|---------|-----------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| report_id | UUID | NOT NULL | - | FK a teacher_reports |
| shared_by | UUID | NOT NULL | - | FK a profiles (quien comparte) |
| shared_with | UUID | NOT NULL | - | FK a profiles (destinatario) |
| tenant_id | UUID | NOT NULL | - | FK a tenants |
| permission_level | VARCHAR(20) | NULL | 'view' | Nivel: view, download, edit |
| accessed_at | TIMESTAMPTZ | NULL | - | Ultimo acceso |
| access_count | INTEGER | NULL | 0 | Contador de accesos |
| expires_at | TIMESTAMPTZ | NULL | - | Fecha expiracion |
| share_message | TEXT | NULL | - | Mensaje opcional |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha creacion |

**Total columnas: 11**

---

## 3. MATRIZ DE SIMILITUD

### 3.1 Columnas en Comun

| Columna | admin_reports | teacher_reports | scheduled_reports | shared_reports | Total |
|---------|---------------|-----------------|-------------------|----------------|-------|
| id | X | X | X | X | 4/4 |
| tenant_id | X | X | X | X | 4/4 |
| created_at | X | X | X | X | 4/4 |
| report_type | X | X | X | - | 3/4 |
| report_format | X | X | X | - | 3/4 |
| expires_at | X | - | - | X | 2/4 |

### 3.2 Similitud por Tabla

| Tabla | Columnas Unicas | Columnas Comunes | % Similitud |
|-------|-----------------|------------------|-------------|
| admin_reports | 6 | 6 | 50% |
| teacher_reports | 9 | 6 | 40% |
| scheduled_reports | 16 | 6 | 27% |
| shared_reports | 6 | 5 | 45% |

**Similitud Promedio Real: 40.5%** (NO 68% como se indico inicialmente)

---

## 4. ANALISIS FUNCIONAL

### 4.1 Proposito de Cada Tabla

| Tabla | Proposito Principal | Dominio |
|-------|---------------------|---------|
| admin_reports | Reportes generados por administradores del sistema | Admin/Sistema |
| teacher_reports | Metadatos de reportes generados por profesores | Educacion/Profesores |
| scheduled_reports | Configuracion de reportes programados automaticos | Scheduling/Cron |
| shared_reports | Registro de comparticion de reportes entre usuarios | Social/Colaboracion |

### 4.2 Relaciones y Dependencias

```
                    +------------------+
                    |   profiles       |
                    +------------------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   +-------------+  +---------------+  +----------------+
   |admin_reports|  |teacher_reports|  |scheduled_reports|
   +-------------+  +---------------+  +----------------+
                           |
                           v
                   +---------------+
                   |shared_reports |
                   +---------------+
```

**Dependencia Critica:** `shared_reports` tiene FK a `teacher_reports.id`

---

## 5. ANALISIS DE CONSOLIDACION

### 5.1 Opcion A: CONSOLIDATE en tabla unica

**Diseno propuesto:**
```sql
CREATE TABLE reports.unified_reports (
    id UUID PRIMARY KEY,
    report_category VARCHAR(30) NOT NULL, -- ENUM: 'admin', 'teacher', 'scheduled', 'shared'

    -- Campos comunes
    tenant_id UUID NOT NULL,
    report_type VARCHAR(50),
    report_format VARCHAR(20),
    file_path TEXT,
    file_size BIGINT,
    status VARCHAR(20),
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Campos especificos (nullable por categoria)
    -- Admin
    requested_by UUID,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,

    -- Teacher
    teacher_id UUID,
    classroom_id UUID,
    report_name VARCHAR(255),
    student_count INTEGER,
    period_start DATE,
    period_end DATE,
    generated_at TIMESTAMPTZ,

    -- Scheduled
    template_id VARCHAR(50),
    frequency VARCHAR(20),
    day_of_week INTEGER,
    day_of_month INTEGER,
    time_of_day TIME,
    timezone VARCHAR(50),
    is_active BOOLEAN,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_error TEXT,
    run_count INTEGER,
    notify_email BOOLEAN,
    email_recipients TEXT[],

    -- Shared
    parent_report_id UUID, -- Referencia al reporte original
    shared_by UUID,
    shared_with UUID,
    permission_level VARCHAR(20),
    accessed_at TIMESTAMPTZ,
    access_count INTEGER,
    share_message TEXT
);
```

**PROS:**
- Una sola tabla para todos los reportes
- Queries unificadas posibles
- Menor cantidad de tablas

**CONTRAS:**
- **35+ columnas** (muy ancha, mala practica)
- **Muchos campos NULL** (75% de columnas seran NULL por registro)
- **Violacion de 3NF** (campos no aplican a todas las categorias)
- **Perdida de FK especificos** (scheduled_reports → classrooms, shared → teacher_reports)
- **RLS policies complejas** (cada categoria tiene reglas distintas)
- **Queries menos eficientes** (escaneos de columnas innecesarias)
- **Refactoring masivo** en backend/frontend

---

### 5.2 Opcion B: KEEP SEPARATE

**Mantener las 4 tablas actuales**

**PROS:**
- **Separacion de responsabilidades clara** (SRP)
- **Columnas especificas sin NULL innecesarios**
- **FK integridad referencial** preservada
- **RLS policies simples** por tabla
- **Queries optimizadas** por dominio
- **Sin refactoring** necesario
- **Cada tabla tiene su proposito unico:**
  - admin_reports: reportes de sistema/admin
  - teacher_reports: reportes educativos
  - scheduled_reports: configuracion de cron jobs
  - shared_reports: log de comparticion (tabla de relacion N:N)

**CONTRAS:**
- 4 tablas en lugar de 1
- Codigo de reportes en 2 schemas diferentes

---

## 6. RECOMENDACION FINAL

### DECISION: **KEEP SEPARATE** (NO CONSOLIDAR)

### Justificacion

1. **Similitud Real Baja (40.5%):** La similitud del 68% inicialmente reportada es incorrecta. Solo 6 columnas son comunes entre las 4 tablas.

2. **Propositos Completamente Diferentes:**
   - `admin_reports`: Auditoria de reportes administrativos (quien pidio que reporte)
   - `teacher_reports`: Metadata de reportes educativos con contexto de aula
   - `scheduled_reports`: Configuracion de jobs programados (es un CRON config, no un reporte)
   - `shared_reports`: Tabla de relacion N:N (es un LOG de acciones, no un reporte)

3. **Violacion de Principios:**
   - Consolidar violaria **SRP** (Single Responsibility Principle)
   - Violaria **3NF** (campos que no aplican a todas las filas)
   - Violaria **KISS** (complejidad innecesaria)

4. **shared_reports NO es un Reporte:**
   - Es una tabla de JOIN/relacion entre users y teacher_reports
   - Tiene FK a `teacher_reports.id` (dependencia)
   - Consolidarla requeriria auto-referencia compleja

5. **scheduled_reports NO es un Reporte:**
   - Es CONFIGURACION de jobs, no el reporte mismo
   - Contiene scheduling metadata (frequency, day_of_week, cron-like fields)
   - Es mas similar a una tabla de `cron_jobs` que a una de `reports`

6. **Schemas Diferentes por Razon:**
   - `admin_dashboard.admin_reports` pertenece al modulo de admin
   - `social_features.*` pertenece al modulo social/colaborativo
   - Moverlas rompe la separacion modular

### Acciones Recomendadas

| Accion | Prioridad | Descripcion |
|--------|-----------|-------------|
| NO CONSOLIDAR | ALTA | Mantener las 4 tablas separadas |
| Renombrar `scheduled_reports` | BAJA | Considerar `report_schedules` (es config, no report) |
| Documentar | MEDIA | Agregar comentarios clarificando proposito de cada tabla |
| Cerrar DUP-004 | ALTA | Marcar como "Evaluado - No Aplica" |

---

## 7. IMPACTO EN BACKEND/FRONTEND

Si se hubiera consolidado:

| Capa | Impacto | Archivos Afectados |
|------|---------|---------------------|
| Backend | ALTO | 4 entities, 4 services, 4 controllers, DTOs |
| Frontend | ALTO | Stores, componentes de reportes |
| Migrations | ALTO | Data migration compleja |
| RLS | ALTO | Reescribir policies |

**Al NO consolidar:** Impacto CERO

---

## 8. CONCLUSION

La evaluacion DUP-004 con similitud del 68% fue un falso positivo. Las 4 tablas tienen propositos fundamentalmente diferentes:

1. **admin_reports** = Log de reportes admin
2. **teacher_reports** = Metadata de reportes educativos
3. **scheduled_reports** = Configuracion de cron/scheduling
4. **shared_reports** = Tabla de relacion N:N de comparticion

**Consolidarlas seria un anti-patron** que violaria SRP, 3NF y KISS.

**VEREDICTO: KEEP SEPARATE - Cerrar DUP-004 como No Aplica**

---

*Documento generado por Claude Opus 4.5*
*SPRINT 6 - TASK 6.3*
*Fecha: 2026-02-03*
