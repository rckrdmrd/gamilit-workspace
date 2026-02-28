---
titulo: "ET-REPORTS-SYSTEM - Especificacion Tecnica: Sistema de Reportes"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-REPORTS-SYSTEM - Especificacion Tecnica: Sistema de Reportes

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Extension:** EXT-002 (Admin Portal Extendido)
**Autor:** Technical Architect Agent
**Estado:** Documentado

---

## 1. Overview del Sistema de Reportes

El Sistema de Reportes de GAMILIT permite a los administradores generar, programar y gestionar reportes del sistema en multiples formatos. La arquitectura esta disenada para procesamiento asincrono, permitiendo la generacion de reportes complejos sin bloquear la interfaz de usuario.

### 1.1 Objetivos del Sistema

| Objetivo | Descripcion |
|----------|-------------|
| **Generacion Asincrona** | Procesar reportes en background sin bloquear peticiones HTTP |
| **Multi-formato** | Soportar PDF, CSV y Excel (XLSX) |
| **Multi-tenant** | Aislamiento completo de datos entre organizaciones |
| **Programacion** | Permitir generacion periodica automatizada |
| **Retencion** | Politica de expiracion automatica (30 dias) |

### 1.2 Arquitectura General

```
+-------------------+      +---------------------+      +------------------+
|                   |      |                     |      |                  |
|  Admin Frontend   |----->|  Reports Controller |----->|  Reports Service |
|  (React)          |      |  (NestJS)           |      |  (Async)         |
|                   |      |                     |      |                  |
+-------------------+      +---------------------+      +--------+---------+
                                                                 |
                                  +------------------------------+
                                  |
                    +-------------v-------------+
                    |                           |
                    |  admin_dashboard.         |
                    |  admin_reports            |
                    |  (PostgreSQL)             |
                    |                           |
                    +-------------+-------------+
                                  |
                    +-------------v-------------+
                    |                           |
                    |  /uploads/reports/        |
                    |  (File Storage)           |
                    |                           |
                    +---------------------------+
```

---

## 2. Tipos de Reportes Disponibles

### 2.1 Catalogo de Reportes

| Tipo | Enum Value | Descripcion | Datos Incluidos |
|------|------------|-------------|-----------------|
| **Usuarios** | `users` | Informacion de usuarios registrados y actividad | Registro, ultimo acceso, rol, tenant, estado |
| **Progreso** | `progress` | Progreso de estudiantes por modulo y leccion | Completados, tiempo invertido, puntajes |
| **Gamificacion** | `gamification` | Metricas del sistema de gamificacion | XP, ML Coins, nivel, rango, logros |
| **Sistema** | `system` | Metricas de salud y rendimiento del sistema | CPU, memoria, conexiones BD, errores |
| **Insights Estudiantes** | `student_insights` | Analisis detallado de rendimiento estudiantil | Patrones, tendencias, predicciones |
| **Resumen de Aulas** | `classroom_summary` | Estadisticas agregadas por aula | Promedios, distribucion, comparativas |
| **Analisis de Riesgo** | `risk_analysis` | Identificacion de estudiantes en riesgo | Indicadores de riesgo, alertas, recomendaciones |

### 2.2 Definicion de Tipos (TypeScript)

```typescript
export enum ReportType {
  USERS = 'users',
  PROGRESS = 'progress',
  GAMIFICATION = 'gamification',
  SYSTEM = 'system',
  STUDENT_INSIGHTS = 'student_insights',
  CLASSROOM_SUMMARY = 'classroom_summary',
  RISK_ANALYSIS = 'risk_analysis',
}
```

---

## 3. Formatos de Salida

### 3.1 Formatos Soportados

| Formato | Extension | MIME Type | Libreria Sugerida | Uso Recomendado |
|---------|-----------|-----------|-------------------|-----------------|
| **PDF** | `.pdf` | `application/pdf` | pdfkit, puppeteer | Presentaciones, impresion |
| **CSV** | `.csv` | `text/csv` | Node.js nativo | Integracion con otros sistemas |
| **Excel** | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | exceljs | Analisis avanzado, filtros |

### 3.2 Definicion de Formatos (TypeScript)

```typescript
export enum ReportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}
```

### 3.3 Caracteristicas por Formato

#### PDF
- Formato de solo lectura
- Incluye encabezados y logotipos
- Paginacion automatica
- Ideal para distribucion

#### CSV
- Formato ligero y portable
- Compatible con cualquier herramienta de analisis
- Sin formato visual
- Encoding UTF-8

#### Excel (XLSX)
- Multiples hojas de trabajo
- Formulas y formato condicional
- Graficos integrados (futuro)
- Filtros y ordenamiento

---

## 4. Flujo de Generacion Asincrona

### 4.1 Diagrama de Secuencia

```
Usuario      Frontend        Controller       Service          Database         Storage
  |             |                |               |                  |               |
  |  1. Click   |                |               |                  |               |
  |  Generate   |                |               |                  |               |
  |------------>|                |               |                  |               |
  |             | 2. POST        |               |                  |               |
  |             | /generate      |               |                  |               |
  |             |--------------->|               |                  |               |
  |             |                | 3. Call       |                  |               |
  |             |                | generateReport|                  |               |
  |             |                |-------------->|                  |               |
  |             |                |               | 4. INSERT        |               |
  |             |                |               | (status:pending) |               |
  |             |                |               |----------------->|               |
  |             |                |               |                  |               |
  |             |                |               | 5. Fire & Forget |               |
  |             |                |               | processGeneration|               |
  |             |                |               |------+           |               |
  |             |                | 6. Return     |      |           |               |
  |             |                | ReportDto     |<-----|           |               |
  |             | 7. Return      |<--------------|      |           |               |
  |             | 202 Accepted   |               |      |           |               |
  |<------------|                |               |      |           |               |
  |             |                |               |      |           |               |
  |             |                |               | 8. UPDATE        |               |
  |             |                |               | (status:generating)              |
  |             |                |               |----------------->|               |
  |             |                |               |      |           |               |
  |             |                |               | 9. Generate      |               |
  |             |                |               | Content          |               |
  |             |                |               |------+           |               |
  |             |                |               |      |           |               |
  |             |                |               | 10. Save         |               |
  |             |                |               | File             |               |
  |             |                |               |---------------------------------->|
  |             |                |               |      |           |               |
  |             |                |               | 11. UPDATE       |               |
  |             |                |               | (status:completed|               |
  |             |                |               |  file_url, size) |               |
  |             |                |               |----------------->|               |
  |             |                |               |                  |               |
  |  Auto-      |                |               |                  |               |
  |  refresh    |                |               |                  |               |
  |<------------|                |               |                  |               |
```

### 4.2 Estados del Flujo

1. **Request Inicial**: Usuario solicita generacion via UI
2. **Creacion de Registro**: Se crea registro en BD con estado `pending`
3. **Respuesta Inmediata**: Se retorna al usuario sin esperar generacion
4. **Procesamiento Background**: Se ejecuta `processReportGeneration()` asincronamente
5. **Transicion a Generating**: Estado cambia a `generating`
6. **Generacion de Contenido**: Se genera el archivo segun tipo y formato
7. **Almacenamiento**: Se guarda archivo en `/uploads/reports/`
8. **Completado**: Estado cambia a `completed` con `file_url` y `file_size`

### 4.3 Manejo de Errores

```typescript
try {
  // Proceso de generacion
} catch (error) {
  await this.reportRepo.update(reportId, {
    status: 'failed',
    error_message: error.message,
    completed_at: new Date(),
  });
}
```

---

## 5. DTOs de Entrada/Salida

### 5.1 GenerateReportDto (Entrada)

```typescript
export class GenerateReportDto {
  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type!: ReportType;

  @ApiProperty({ enum: ReportFormat })
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  student_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classroom_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  filters?: Record<string, unknown>;
}
```

**Ejemplo de Request:**
```json
{
  "type": "progress",
  "format": "excel",
  "classroom_id": "123e4567-e89b-12d3-a456-426614174000",
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-31T23:59:59Z"
}
```

### 5.2 ReportDto (Salida)

```typescript
export class ReportDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ReportType })
  type!: ReportType;

  @ApiProperty({ enum: ReportFormat })
  format!: ReportFormat;

  @ApiProperty({ enum: ReportStatus })
  status!: ReportStatus;

  @ApiPropertyOptional()
  file_url?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  created_at!: string;

  @ApiPropertyOptional()
  completed_at?: string;

  @ApiProperty()
  requested_by!: string;
}
```

**Ejemplo de Response (Pending):**
```json
{
  "id": "abc12345-6789-0abc-def1-234567890abc",
  "type": "progress",
  "format": "excel",
  "status": "pending",
  "metadata": {
    "classroom_id": "123e4567-e89b-12d3-a456-426614174000",
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-01-31T23:59:59Z"
  },
  "created_at": "2026-01-20T14:30:00Z",
  "requested_by": "admin-user-uuid"
}
```

**Ejemplo de Response (Completed):**
```json
{
  "id": "abc12345-6789-0abc-def1-234567890abc",
  "type": "progress",
  "format": "excel",
  "status": "completed",
  "file_url": "/reports/progress-2026-01-20T14-30-00-000Z.xlsx",
  "metadata": {
    "classroom_id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "created_at": "2026-01-20T14:30:00Z",
  "completed_at": "2026-01-20T14:30:02Z",
  "requested_by": "admin-user-uuid"
}
```

### 5.3 ListReportsDto (Query)

```typescript
export class ListReportsDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
```

### 5.4 PaginatedReportsDto (Salida Listado)

```typescript
export class PaginatedReportsDto {
  @ApiProperty({ type: [ReportDto] })
  data!: ReportDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total_pages!: number;
}
```

---

## 6. Sistema de Programacion (Schedule)

### 6.1 Funcionalidad

El sistema permite programar la generacion automatica de reportes con las siguientes frecuencias:
- **Diaria**: Todos los dias a una hora especifica
- **Semanal**: Un dia de la semana a una hora especifica
- **Mensual**: Un dia del mes a una hora especifica

### 6.2 ScheduleReportDto (Entrada)

```typescript
export class ScheduleReportDto {
  @ApiProperty({ description: 'Whether the schedule is enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ description: 'Hour of day (0-23)', default: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour?: number = 8;

  @ApiPropertyOptional({ description: 'Day of week (0=Sunday, 6=Saturday)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  day_of_week?: number;

  @ApiPropertyOptional({ description: 'Day of month (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  day_of_month?: number;

  @ApiPropertyOptional({ description: 'Email recipients' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];
}
```

**Ejemplo de Schedule Semanal:**
```json
{
  "enabled": true,
  "frequency": "weekly",
  "hour": 8,
  "day_of_week": 1,
  "recipients": ["admin@school.edu", "director@school.edu"]
}
```

### 6.3 ReportScheduleConfigDto (Almacenado en Metadata)

```typescript
export class ReportScheduleConfigDto {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number;
  day_of_week?: number;
  day_of_month?: number;
  recipients?: string[];
  configured_at: string;
  configured_by: string;
  next_run_at?: string;
  last_run_at?: string;
}
```

### 6.4 Calculo de Proxima Ejecucion

```typescript
private calculateNextRunTime(scheduleDto: ScheduleReportDto): Date {
  const now = new Date();
  const hour = scheduleDto.hour ?? 8;
  const nextRun = new Date(now);
  nextRun.setHours(hour, 0, 0, 0);

  switch (scheduleDto.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;

    case 'weekly': {
      const targetDay = scheduleDto.day_of_week ?? 1;
      const currentDay = now.getDay();
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
        daysUntilTarget += 7;
      }
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      break;
    }

    case 'monthly': {
      const targetDayOfMonth = scheduleDto.day_of_month ?? 1;
      nextRun.setDate(targetDayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
    }
  }

  return nextRun;
}
```

---

## 7. Almacenamiento y Retencion de Reportes

### 7.1 Estructura de Almacenamiento

```
/apps/backend/
  /uploads/
    /reports/
      users-2026-01-20T08-00-00-000Z.xlsx
      progress-2026-01-20T14-30-02-123Z.pdf
      gamification-2026-01-19T10-15-00-456Z.csv
```

### 7.2 Convencion de Nombres de Archivo

```
{report_type}-{timestamp}.{format}

Ejemplos:
- users-2026-01-20T08-00-00-000Z.xlsx
- progress-2026-01-20T14-30-02-123Z.pdf
- risk_analysis-2026-01-19T10-15-00-456Z.csv
```

### 7.3 Politica de Retencion

| Aspecto | Configuracion |
|---------|---------------|
| **Tiempo de Vida** | 30 dias desde creacion |
| **Campo de Expiracion** | `expires_at` |
| **Cleanup Automatico** | Diario a las 2:00 AM (Mexico) |
| **Batch Size** | Maximo 100 reportes por ejecucion |

### 7.4 Cron Job de Cleanup

```typescript
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async cleanupExpiredReports(): Promise<void> {
  const expiredReports = await this.reportRepo.find({
    where: { expires_at: LessThan(new Date()) },
    take: 100,
  });

  // Eliminar archivos fisicos
  for (const report of expiredReports) {
    if (report.file_url) {
      await this.deleteReportFile(report.file_url);
    }
  }

  // Eliminar registros de BD
  await this.reportRepo.delete(expiredReports.map(r => r.id));
}
```

### 7.5 Modelo de Base de Datos

**Tabla:** `admin_dashboard.admin_reports`

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `report_type` | VARCHAR(50) | NO | Tipo de reporte |
| `report_format` | VARCHAR(20) | NO | Formato del archivo |
| `status` | VARCHAR(20) | NO | Estado actual |
| `file_url` | VARCHAR(500) | SI | URL del archivo generado |
| `file_size` | INTEGER | SI | Tamano en bytes |
| `metadata` | JSONB | NO | Filtros y configuracion |
| `error_message` | TEXT | SI | Mensaje de error si fallo |
| `requested_by` | UUID | NO | FK a auth.users |
| `tenant_id` | UUID | NO | FK para multi-tenant |
| `created_at` | TIMESTAMP | NO | Fecha de solicitud |
| `completed_at` | TIMESTAMP | SI | Fecha de completitud |
| `expires_at` | TIMESTAMP | SI | Fecha de expiracion |

**Indices:**
- `idx_admin_reports_status` - Filtrado por estado
- `idx_admin_reports_requested_by` - Filtrado por usuario
- `idx_admin_reports_type` - Filtrado por tipo
- `idx_admin_reports_created_at` - Ordenamiento temporal
- `idx_admin_reports_expires_at` - Cleanup eficiente
- `idx_admin_reports_tenant_id` - Aislamiento multi-tenant

**Constraints:**
- CHECK: `status IN ('pending', 'generating', 'completed', 'failed')`
- CHECK: `file_size >= 0`

---

## 8. Endpoints Detallados

### 8.1 POST /admin/reports/generate

**Descripcion:** Genera un nuevo reporte de forma asincrona.

**Request:**
```http
POST /api/admin/reports/generate
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "type": "users",
  "format": "excel",
  "filters": {
    "role": "student",
    "active": true
  }
}
```

**Response (202 Accepted):**
```json
{
  "id": "abc12345-6789-0abc-def1-234567890abc",
  "type": "users",
  "format": "excel",
  "status": "pending",
  "metadata": {
    "role": "student",
    "active": true
  },
  "created_at": "2026-01-20T14:30:00Z",
  "requested_by": "user-uuid"
}
```

**Errores:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Parametros invalidos |
| 401 | No autenticado |
| 403 | No autorizado (no es admin) |

---

### 8.2 GET /admin/reports

**Descripcion:** Lista reportes con filtros y paginacion.

**Request:**
```http
GET /api/admin/reports?type=users&status=completed&page=1&limit=10
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "abc12345-6789-0abc-def1-234567890abc",
      "type": "users",
      "format": "excel",
      "status": "completed",
      "file_url": "/reports/users-2026-01-20T14-30-00-000Z.xlsx",
      "created_at": "2026-01-20T14:30:00Z",
      "completed_at": "2026-01-20T14:30:02Z",
      "requested_by": "user-uuid"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "total_pages": 3
}
```

**Query Parameters:**
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `type` | string | No | Filtrar por tipo de reporte |
| `status` | string | No | Filtrar por estado |
| `page` | number | No | Pagina (default: 1) |
| `limit` | number | No | Items por pagina (default: 20, max: 100) |

---

### 8.3 GET /admin/reports/:id/download

**Descripcion:** Descarga un reporte completado.

**Request:**
```http
GET /api/admin/reports/abc12345-6789-0abc-def1-234567890abc/download
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "abc12345-6789-0abc-def1-234567890abc",
  "type": "users",
  "format": "excel",
  "status": "completed",
  "file_url": "/reports/users-2026-01-20T14-30-00-000Z.xlsx",
  "metadata": {},
  "created_at": "2026-01-20T14:30:00Z",
  "completed_at": "2026-01-20T14:30:02Z",
  "requested_by": "user-uuid"
}
```

**Errores:**
| Codigo | Descripcion |
|--------|-------------|
| 404 | Reporte no encontrado o expirado |
| 400 | Reporte no esta listo (status != completed) |

---

### 8.4 DELETE /admin/reports/:id

**Descripcion:** Elimina un reporte y su archivo asociado.

**Request:**
```http
DELETE /api/admin/reports/abc12345-6789-0abc-def1-234567890abc
Authorization: Bearer {jwt_token}
```

**Response (204 No Content):**
```
(No body)
```

**Errores:**
| Codigo | Descripcion |
|--------|-------------|
| 404 | Reporte no encontrado |

---

### 8.5 POST /admin/reports/:id/schedule

**Descripcion:** Configura generacion periodica automatizada.

**Request:**
```http
POST /api/admin/reports/abc12345-6789-0abc-def1-234567890abc/schedule
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "enabled": true,
  "frequency": "weekly",
  "hour": 8,
  "day_of_week": 1,
  "recipients": ["admin@school.edu"]
}
```

**Response (200 OK):**
```json
{
  "id": "abc12345-6789-0abc-def1-234567890abc",
  "type": "users",
  "format": "excel",
  "schedule": {
    "enabled": true,
    "frequency": "weekly",
    "hour": 8,
    "day_of_week": 1,
    "recipients": ["admin@school.edu"],
    "configured_at": "2026-01-20T15:00:00Z",
    "configured_by": "user-uuid",
    "next_run_at": "2026-01-27T08:00:00Z"
  },
  "message": "Report scheduled successfully. Next run: 2026-01-27T08:00:00Z"
}
```

---

## 9. Estados del Reporte

### 9.1 Diagrama de Estados

```
                    +------------+
                    |            |
       Request ---->|  PENDING   |
                    |            |
                    +-----+------+
                          |
                          | processReportGeneration()
                          v
                    +------------+
                    |            |
                    | GENERATING |
                    |            |
                    +-----+------+
                          |
           +--------------+--------------+
           |                             |
           | Success                     | Error
           v                             v
    +------------+                +------------+
    |            |                |            |
    | COMPLETED  |                |   FAILED   |
    |            |                |            |
    +------------+                +------------+
```

### 9.2 Detalle de Estados

| Estado | Descripcion | Duracion Tipica | Acciones Permitidas |
|--------|-------------|-----------------|---------------------|
| `pending` | Solicitud recibida, esperando procesamiento | < 1 segundo | Cancelar (futuro) |
| `generating` | Reporte en proceso de generacion | 2-30 segundos | Ninguna |
| `completed` | Reporte listo para descarga | Hasta expiracion | Descargar, Eliminar, Schedule |
| `failed` | Error en la generacion | Permanente | Eliminar, Reintentar (futuro) |

### 9.3 Definicion Enum

```typescript
export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

---

## 10. Consideraciones de Rendimiento

### 10.1 Optimizaciones Implementadas

| Area | Estrategia | Beneficio |
|------|------------|-----------|
| **Procesamiento** | Asincrono (fire & forget) | No bloquea requests HTTP |
| **Paginacion** | Limite maximo de 100 items | Previene queries grandes |
| **Cleanup** | Batch de 100 por ejecucion | Evita sobrecarga de BD |
| **Indices** | Campos frecuentes indexados | Queries rapidos |
| **Auto-refresh** | Intervalo de 5 segundos | Balance UX/carga |

### 10.2 Limitaciones Actuales

| Limitacion | Impacto | Solucion Futura |
|------------|---------|-----------------|
| Generacion simulada | Mock data | Integrar librerias reales (pdfkit, exceljs) |
| Sin queue | Carga en memoria | Integrar BullMQ para background jobs |
| Storage local | No escalable | Migrar a S3/Cloud Storage |
| Sin compresion | Archivos grandes | Implementar gzip |

### 10.3 Recomendaciones para Produccion

1. **Job Queue**: Implementar BullMQ para procesamiento en background
2. **Storage**: Migrar a S3 o equivalente para archivos
3. **CDN**: Servir archivos via CDN para reducir carga
4. **Compresion**: Comprimir archivos grandes antes de almacenar
5. **Timeouts**: Configurar timeouts para generacion de reportes
6. **Retry Logic**: Implementar reintentos automaticos para fallos transitorios

### 10.4 Metricas a Monitorear

```
- reports_generated_total (counter)
- reports_by_type (counter, label: type)
- reports_by_status (gauge, label: status)
- report_generation_duration_seconds (histogram)
- report_file_size_bytes (histogram)
- cleanup_reports_deleted (counter)
```

---

## 11. Seguridad Multi-tenant

### 11.1 Aislamiento de Datos

Todas las operaciones filtran por `tenant_id`:

```typescript
// En getReports()
queryBuilder.where('report.tenant_id = :tenantId', { tenantId });

// En downloadReport()
const report = await this.reportRepo.findOne({
  where: { id: reportId, tenant_id: tenantId },
});

// En deleteReport()
const report = await this.reportRepo.findOne({
  where: { id: reportId, tenant_id: tenantId },
});
```

### 11.2 Security Fix Aplicado

**FIX-BE-001-2026-01-18**: Se corrigio vulnerabilidad de acceso cross-tenant:
- Agregado `tenant_id` como campo requerido en entity
- Todas las queries filtran por tenant
- Validacion de expiracion en descarga

---

## 12. Componentes Frontend Relacionados

### 12.1 Pagina Principal

**Archivo:** `/apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`

Funcionalidades:
- Formulario de generacion de reportes
- Lista de reportes con auto-refresh
- Descarga y eliminacion de reportes
- Notificaciones toast

### 12.2 Hook useReports

**Archivo:** `/apps/frontend/src/apps/admin/hooks/useReports.ts`

Funcionalidades:
- Gestion de estado de reportes
- Auto-refresh cuando hay reportes pendientes
- Acciones: generate, download, delete, refresh

### 12.3 Componentes

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ReportGenerationForm | `components/reports/ReportGenerationForm.tsx` | Formulario de generacion |
| ReportsList | `components/reports/ReportsList.tsx` | Lista de reportes |
| BetaBanner | `components/reports/BetaBanner.tsx` | Banner de funcionalidad beta |

---

## 13. Referencias

### 13.1 Archivos de Codigo

- **Controller:** `/apps/backend/src/modules/admin/controllers/admin-reports.controller.ts`
- **Service:** `/apps/backend/src/modules/admin/services/admin-reports.service.ts`
- **Entity:** `/apps/backend/src/modules/admin/entities/admin-report.entity.ts`
- **DTOs:** `/apps/backend/src/modules/admin/dto/reports/`
- **Shared DTOs:** `/apps/backend/src/shared/dto/reports/generate-report.dto.ts`

### 13.2 Documentacion Relacionada

- EXT-002-admin-extendido/README.md
- ET-EXT-002-ARQUITECTURA-TECNICA.md
- QUICK-API.yml (endpoints documentados)

### 13.3 Tasks Relacionadas

- TASK-ADMIN-REPORTS-SCHEDULE (Schedule reports)
- FIX-BE-001-2026-01-18 (Cross-tenant security)
- FIX-BE-004-2026-01-18 (Expiration validation)
- FIX-BE-009-2026-01-18 (Schema correction)

---

**Documento generado para EXT-002 - Admin Portal Extendido**
**Sistema GAMILIT v4.0**
