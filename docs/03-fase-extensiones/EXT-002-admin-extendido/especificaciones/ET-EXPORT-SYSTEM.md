# Especificacion Tecnica - Sistema de Exportacion CSV

**Epic:** EXT-002 - Admin Extendido
**Documento:** ET-EXPORT-SYSTEM
**Fecha:** 2026-01-20
**Estado:** IMPLEMENTADO
**Version:** 1.0.0

---

## 1. Overview del Sistema de Exportacion

El sistema de exportacion permite a los administradores descargar datos de la plataforma GAMILIT en formato CSV para analisis externo, reportes y auditoria. Esta funcionalidad esta integrada en dos modulos principales del Admin Portal:

1. **Analytics Dashboard** - Exportacion de metricas de usuarios, engagement y gamificacion
2. **Progress Tracking** - Exportacion de progreso de estudiantes, aulas y modulos

### 1.1 Caracteristicas Principales

- Exportacion sincrona con descarga inmediata
- Formato CSV con codificacion UTF-8
- Nombres de archivo con timestamp para trazabilidad
- Filtros opcionales para segmentar datos
- Headers HTTP apropiados para descarga automatica
- Escape automatico de caracteres especiales (comas, comillas, saltos de linea)

### 1.2 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ AdminAnalyticsPage / AdminProgressPage                             │ │
│  │   └── Boton "Exportar CSV" → fetch() → descarga blob               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │ HTTP GET + Query Params
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS)                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Controllers                                                        │ │
│  │   ├── AdminAnalyticsController.exportAnalytics()                   │ │
│  │   └── AdminProgressController.exportProgress()                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Services                                                           │ │
│  │   ├── AdminAnalyticsService.exportAnalytics(type)                  │ │
│  │   │     ├── exportOverviewCsv()                                    │ │
│  │   │     ├── exportUsersCsv()                                       │ │
│  │   │     ├── exportEngagementCsv()                                  │ │
│  │   │     └── exportGamificationCsv()                                │ │
│  │   └── AdminProgressService.exportProgressData(type, classroomId)   │ │
│  │         ├── exportStudentsProgress()                               │ │
│  │         ├── exportClassroomsProgress()                             │ │
│  │         └── exportModulesProgress()                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Metodos de Utilidad                                                │ │
│  │   ├── generateCsv(headers, rows) → string                          │ │
│  │   └── convertToCSV(data, columns) → string                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │ SQL Queries
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Vistas Materializadas                                             │   │
│  │   └── admin_dashboard.user_analytics_mv                           │   │
│  │ Esquemas                                                          │   │
│  │   ├── auth_management.profiles                                    │   │
│  │   ├── progress_tracking.*                                         │   │
│  │   ├── social_features.classrooms / classroom_members              │   │
│  │   └── educational_content.modules                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Formatos Soportados

### 2.1 Formato Actual

| Formato | Extension | MIME Type | Codificacion | Estado |
|---------|-----------|-----------|--------------|--------|
| CSV | `.csv` | `text/csv` | UTF-8 | Implementado |

### 2.2 Formatos Futuros (Roadmap)

| Formato | Extension | MIME Type | Estado | Prioridad |
|---------|-----------|-----------|--------|-----------|
| Excel | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Pendiente | P2 |
| PDF | `.pdf` | `application/pdf` | Pendiente | P3 |
| JSON | `.json` | `application/json` | Pendiente | P4 |

---

## 3. Endpoints de Exportacion

### 3.1 Tabla de Endpoints

| Modulo | Endpoint | Metodo | Tipos de Exportacion | Filtros |
|--------|----------|--------|---------------------|---------|
| Analytics | `/api/admin/analytics/export` | GET | overview, users, engagement, gamification | `type` (requerido), `format` (opcional) |
| Progress | `/api/admin/progress/export` | GET | students, classrooms, modules | `type` (requerido), `classroom_id` (opcional), `format` (opcional) |

### 3.2 Analytics Export Endpoint

**Endpoint:** `GET /api/admin/analytics/export`

**Query Parameters:**

| Parametro | Tipo | Requerido | Valores | Default | Descripcion |
|-----------|------|-----------|---------|---------|-------------|
| `type` | string | Si | `overview`, `users`, `engagement`, `gamification` | - | Tipo de datos a exportar |
| `format` | string | No | `csv` | `csv` | Formato de exportacion |

**Ejemplo de Request:**
```bash
curl -X GET "https://api.gamilit.com/api/admin/analytics/export?type=users&format=csv" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -o "analytics-users-2026-01-20.csv"
```

**DTO de Query:**
```typescript
export class ExportQueryDto {
  @ApiProperty({
    description: 'Type of analytics data to export',
    enum: ['overview', 'users', 'engagement', 'gamification'],
  })
  @IsString()
  @IsIn(['overview', 'users', 'engagement', 'gamification'])
  type!: string;

  @ApiPropertyOptional({
    description: 'Export format',
    default: 'csv',
  })
  @IsOptional()
  @IsString()
  format?: string = 'csv';
}
```

### 3.3 Progress Export Endpoint

**Endpoint:** `GET /api/admin/progress/export`

**Query Parameters:**

| Parametro | Tipo | Requerido | Valores | Default | Descripcion |
|-----------|------|-----------|---------|---------|-------------|
| `type` | string | Si | `students`, `classrooms`, `modules` | - | Tipo de datos a exportar |
| `classroom_id` | UUID | No | UUID valido | - | Filtrar por aula especifica |
| `format` | string | No | `csv` | `csv` | Formato de exportacion |

**Ejemplo de Request:**
```bash
# Exportar todos los estudiantes
curl -X GET "https://api.gamilit.com/api/admin/progress/export?type=students" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -o "progress-students-2026-01-20.csv"

# Exportar estudiantes de un aula especifica
curl -X GET "https://api.gamilit.com/api/admin/progress/export?type=students&classroom_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -o "progress-students-classroom-2026-01-20.csv"
```

**DTO de Query:**
```typescript
export class ExportProgressQueryDto {
  @ApiProperty({
    description: 'Type of data to export',
    enum: ['students', 'classrooms', 'modules'],
  })
  @IsString()
  @IsIn(['students', 'classrooms', 'modules'])
  type!: string;

  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Export format',
    default: 'csv',
  })
  @IsOptional()
  @IsString()
  format?: string = 'csv';
}
```

---

## 4. Headers HTTP para Descarga

### 4.1 Headers de Respuesta

| Header | Valor | Proposito |
|--------|-------|-----------|
| `Content-Type` | `text/csv` | Indica el tipo MIME del contenido |
| `Content-Disposition` | `attachment; filename="<nombre_archivo>"` | Fuerza descarga con nombre de archivo |
| `Cache-Control` | `no-cache` | Evita cache del navegador (Analytics) |
| `Pragma` | `no-cache` | Compatibilidad con HTTP/1.0 (Analytics) |

### 4.2 Implementacion en Controller

**Analytics Controller:**
```typescript
@Get('export')
async exportAnalytics(@Query() query: ExportQueryDto, @Res() res: Response): Promise<void> {
  const csvData = await this.analyticsService.exportAnalytics(query.type);

  // Set headers for CSV download
  const filename = `analytics-${query.type}-${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Pragma', 'no-cache');

  res.send(csvData);
}
```

**Progress Controller:**
```typescript
@Get('export')
async exportProgress(
  @Query() query: ExportProgressQueryDto,
  @Res() res: Response,
): Promise<void> {
  const csvData = await this.progressService.exportProgressData(
    query.type,
    query.classroom_id,
  );

  // Set response headers for CSV download
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `progress-${query.type}-${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvData);
}
```

---

## 5. Estructura de Archivos CSV por Tipo de Exportacion

### 5.1 Analytics: Overview

**Archivo:** `analytics-overview-YYYY-MM-DD.csv`
**Estructura:** Formato clave-valor (2 columnas)

| Metric | Value |
|--------|-------|
| Total Users | 1250 |
| Total Students | 1000 |
| Total Teachers | 50 |
| Active Users | 850 |
| Average XP | 1523.45 |
| Average Exercises Completed | 13.20 |
| Average Engagement Score | 67.50 |
| Inactive Users | 120 |
| Beginner Users | 450 |
| Intermediate Users | 380 |
| Advanced Users | 300 |

**Columnas:**
```
Metric,Value
```

### 5.2 Analytics: Users

**Archivo:** `analytics-users-YYYY-MM-DD.csv`
**Estructura:** Una fila por usuario

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| User ID | UUID | Identificador unico del usuario |
| Display Name | string | Nombre mostrado del usuario |
| Email | string | Correo electronico |
| Role | string | Rol (student, admin_teacher, etc.) |
| Status | string | Estado de la cuenta (ACTIVE, INACTIVE) |
| Total XP | number | XP acumulado |
| Level | number | Nivel actual |
| Rank | string | Rango Maya actual |
| ML Coins | number | Monedas ML actuales |
| Exercises Completed | number | Total de ejercicios completados |
| Missions Completed | number | Total de misiones completadas |
| Current Streak | number | Racha actual en dias |
| Engagement Score | number | Puntuacion de engagement (0-100) |
| User Segment | string | Segmento (inactive, beginner, intermediate, advanced) |
| Registered At | timestamp | Fecha de registro |
| Last Activity At | timestamp | Ultima actividad (o "N/A") |

**Header CSV:**
```
User ID,Display Name,Email,Role,Status,Total XP,Level,Rank,ML Coins,Exercises Completed,Missions Completed,Current Streak,Engagement Score,User Segment,Registered At,Last Activity At
```

### 5.3 Analytics: Engagement

**Archivo:** `analytics-engagement-YYYY-MM-DD.csv`
**Estructura:** Una fila por segmento de usuario

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| User Segment | string | Segmento (inactive, beginner, intermediate, advanced) |
| Users Count | number | Cantidad de usuarios en el segmento |
| Avg Engagement Score | number | Engagement promedio (0-100) |
| Avg Exercises Completed | number | Ejercicios completados promedio |
| Avg Streak | number | Racha promedio en dias |
| Active Last 7 Days | number | Usuarios activos ultimos 7 dias |
| Active Last 30 Days | number | Usuarios activos ultimos 30 dias |

**Header CSV:**
```
User Segment,Users Count,Avg Engagement Score,Avg Exercises Completed,Avg Streak,Active Last 7 Days,Active Last 30 Days
```

### 5.4 Analytics: Gamification

**Archivo:** `analytics-gamification-YYYY-MM-DD.csv`
**Estructura:** Archivo multi-seccion con 3 tablas separadas

```csv
XP DISTRIBUTION
XP Range,Users Count
0 XP,50
1-100 XP,250
101-500 XP,450
501-1000 XP,280
1001-5000 XP,150
5000+ XP,70


RANKS DISTRIBUTION
Rank,Users Count,Avg XP,Avg Exercises
Ajaw,320,85.00,3.00
B'alam,180,1250.00,15.00
Chaak,150,2850.00,22.00
K'inich,100,4500.00,35.00


LEVELS DISTRIBUTION
Level,Users Count
1,450
2,380
3,220
4,150
5,50
```

### 5.5 Progress: Students

**Archivo:** `progress-students-YYYY-MM-DD.csv`
**Estructura:** Una fila por estudiante

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | ID del estudiante |
| display_name | string | Nombre mostrado |
| email | string | Correo electronico |
| level | number | Nivel actual |
| total_xp | number | XP total |
| ml_coins | number | Monedas ML |
| exercises_completed | number | Ejercicios completados |
| modules_completed | number | Modulos completados |
| streak_days | number | Dias de racha actual |
| last_activity_at | timestamp | Ultima actividad |
| classroom_name | string | Nombre del aula (si aplica) |

**Header CSV:**
```
id,display_name,email,level,total_xp,ml_coins,exercises_completed,modules_completed,streak_days,last_activity_at,classroom_name
```

### 5.6 Progress: Classrooms

**Archivo:** `progress-classrooms-YYYY-MM-DD.csv`
**Estructura:** Una fila por aula

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| classroom_id | UUID | ID del aula |
| classroom_name | string | Nombre del aula |
| teacher_name | string | Nombre del profesor |
| total_students | number | Total de estudiantes |
| active_students | number | Estudiantes activos |
| total_assignments | number | Total de asignaciones |
| avg_class_progress_percent | number | Progreso promedio (%) |
| classroom_status | string | Estado del aula |

**Header CSV:**
```
classroom_id,classroom_name,teacher_name,total_students,active_students,total_assignments,avg_class_progress_percent,classroom_status
```

### 5.7 Progress: Modules

**Archivo:** `progress-modules-YYYY-MM-DD.csv`
**Estructura:** Una fila por modulo

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | ID del modulo |
| title | string | Titulo del modulo |
| difficulty_level | string | Nivel de dificultad |
| order_number | number | Orden de presentacion |
| total_students | number | Estudiantes que han iniciado |
| completed_count | number | Estudiantes que han completado |
| avg_progress_percent | number | Progreso promedio (%) |
| avg_score | number | Puntuacion promedio |

**Header CSV:**
```
id,title,difficulty_level,order_number,total_students,completed_count,avg_progress_percent,avg_score
```

---

## 6. Parametros de Query Disponibles

### 6.1 Analytics Export

| Parametro | Obligatorio | Tipo | Valores Validos | Descripcion |
|-----------|-------------|------|-----------------|-------------|
| `type` | Si | string | `overview`, `users`, `engagement`, `gamification` | Tipo de reporte |
| `format` | No | string | `csv` | Formato de salida (default: csv) |

### 6.2 Progress Export

| Parametro | Obligatorio | Tipo | Valores Validos | Descripcion |
|-----------|-------------|------|-----------------|-------------|
| `type` | Si | string | `students`, `classrooms`, `modules` | Tipo de reporte |
| `classroom_id` | No | UUID | UUID v4 valido | Filtrar por aula especifica |
| `format` | No | string | `csv` | Formato de salida (default: csv) |

### 6.3 Validaciones

```typescript
// Validacion con class-validator
@IsString()
@IsIn(['overview', 'users', 'engagement', 'gamification'])
type!: string;

@IsOptional()
@IsUUID()
classroom_id?: string;
```

---

## 7. Limites de Datos

### 7.1 Limites Actuales

| Tipo de Exportacion | Limite Maximo | Notas |
|---------------------|---------------|-------|
| Analytics Overview | N/A | Metricas agregadas, sin limite |
| Analytics Users | Sin limite explicito | Retorna todos los usuarios |
| Analytics Engagement | 4 filas | Solo 4 segmentos fijos |
| Analytics Gamification | Variable | Depende de rangos XP, ranks, niveles |
| Progress Students | Sin limite explicito | Retorna todos los estudiantes (filtrable) |
| Progress Classrooms | Sin limite explicito | Retorna todas las aulas |
| Progress Modules | Sin limite explicito | Retorna todos los modulos |

### 7.2 Recomendaciones para Datasets Grandes

Para bases de datos con mas de 10,000 usuarios:

1. **Implementar paginacion en el endpoint** (futuro)
2. **Agregar limites configurables** via query parameter
3. **Considerar exportacion asincrona** con cola de jobs
4. **Streaming de CSV** para archivos muy grandes

### 7.3 Estimacion de Tamano de Archivo

| Registros | Tamano Aproximado (Users CSV) |
|-----------|-------------------------------|
| 1,000 | ~150 KB |
| 10,000 | ~1.5 MB |
| 100,000 | ~15 MB |
| 1,000,000 | ~150 MB |

---

## 8. Patron de Nombrado de Archivos

### 8.1 Formato General

```
{modulo}-{tipo}-{YYYY-MM-DD}.csv
```

### 8.2 Ejemplos de Nombres

| Endpoint | Tipo | Nombre de Archivo |
|----------|------|-------------------|
| Analytics | overview | `analytics-overview-2026-01-20.csv` |
| Analytics | users | `analytics-users-2026-01-20.csv` |
| Analytics | engagement | `analytics-engagement-2026-01-20.csv` |
| Analytics | gamification | `analytics-gamification-2026-01-20.csv` |
| Progress | students | `progress-students-2026-01-20.csv` |
| Progress | classrooms | `progress-classrooms-2026-01-20.csv` |
| Progress | modules | `progress-modules-2026-01-20.csv` |

### 8.3 Implementacion del Timestamp

```typescript
// Formato ISO simplificado: YYYY-MM-DD
const timestamp = new Date().toISOString().split('T')[0];
const filename = `analytics-${query.type}-${timestamp}.csv`;
```

---

## 9. Manejo de Errores

### 9.1 Codigos de Error HTTP

| Codigo | Situacion | Respuesta |
|--------|-----------|-----------|
| 200 | Exportacion exitosa | Archivo CSV |
| 400 | Parametros invalidos | `{ "message": "Invalid export type", "error": "Bad Request" }` |
| 401 | Token JWT faltante o invalido | `{ "message": "Unauthorized", "statusCode": 401 }` |
| 403 | Usuario no es admin | `{ "message": "Forbidden", "statusCode": 403 }` |
| 500 | Error interno del servidor | `{ "message": "Failed to export analytics data", "error": "Internal Server Error" }` |

### 9.2 Validacion de Parametros

```typescript
// class-validator automaticamente valida los parametros
// Si type no es valido, retorna 400 Bad Request con detalles

// Respuesta de error de validacion:
{
  "statusCode": 400,
  "message": [
    "type must be one of the following values: overview, users, engagement, gamification"
  ],
  "error": "Bad Request"
}
```

### 9.3 Manejo de Errores en Servicio

```typescript
async exportAnalytics(type: string): Promise<string> {
  try {
    switch (type) {
      case 'overview':
        return await this.exportOverviewCsv();
      case 'users':
        return await this.exportUsersCsv();
      // ...
      default:
        throw new Error(`Unknown export type: ${type}`);
    }
  } catch (error: any) {
    this.logger.error(`Failed to export analytics: ${error?.message}`, error?.stack);
    throw new InternalServerErrorException('Failed to export analytics data');
  }
}
```

### 9.4 Logging de Errores

Los errores se registran con:
- Nivel: ERROR
- Mensaje descriptivo
- Stack trace completo
- Contexto del servicio (AdminAnalyticsService / AdminProgressService)

---

## 10. Ejemplos de Uso

### 10.1 Con cURL

**Exportar usuarios de Analytics:**
```bash
curl -X GET "https://api.gamilit.com/api/admin/analytics/export?type=users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: text/csv" \
  -o "analytics-users-$(date +%Y-%m-%d).csv"
```

**Exportar engagement:**
```bash
curl -X GET "https://api.gamilit.com/api/admin/analytics/export?type=engagement&format=csv" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o "analytics-engagement.csv"
```

**Exportar estudiantes de un aula:**
```bash
curl -X GET "https://api.gamilit.com/api/admin/progress/export?type=students&classroom_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o "classroom-students.csv"
```

### 10.2 Con JavaScript (fetch)

**Desde el Frontend:**
```typescript
const exportAnalytics = async (type: 'overview' | 'users' | 'engagement' | 'gamification') => {
  try {
    const response = await fetch(`/api/admin/analytics/export?type=${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'text/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `analytics-${type}.csv`;

    // Crear blob y descargar
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, filename };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Uso
await exportAnalytics('users');
```

**Con Axios:**
```typescript
import axios from 'axios';

const exportProgress = async (
  type: 'students' | 'classrooms' | 'modules',
  classroomId?: string
) => {
  const params = new URLSearchParams({ type });
  if (classroomId) {
    params.append('classroom_id', classroomId);
  }

  const response = await axios.get(`/api/admin/progress/export?${params}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  // Extraer filename del header
  const disposition = response.headers['content-disposition'];
  const filename = disposition?.split('filename=')[1]?.replace(/"/g, '') || `progress-${type}.csv`;

  // Descargar usando file-saver o metodo nativo
  const blob = new Blob([response.data], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
```

### 10.3 Con Python (requests)

```python
import requests
from datetime import date

def export_analytics(api_url: str, token: str, export_type: str) -> str:
    """
    Exportar datos de analytics a CSV.

    Args:
        api_url: URL base de la API (ej: https://api.gamilit.com)
        token: JWT token de autenticacion
        export_type: Tipo de exportacion (overview, users, engagement, gamification)

    Returns:
        Path del archivo descargado
    """
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'text/csv'
    }

    response = requests.get(
        f'{api_url}/api/admin/analytics/export',
        params={'type': export_type},
        headers=headers
    )

    response.raise_for_status()

    # Guardar archivo
    filename = f'analytics-{export_type}-{date.today().isoformat()}.csv'
    with open(filename, 'wb') as f:
        f.write(response.content)

    return filename

# Uso
filename = export_analytics('https://api.gamilit.com', jwt_token, 'users')
print(f'Archivo descargado: {filename}')
```

---

## 11. Seguridad

### 11.1 Autenticacion y Autorizacion

- Todos los endpoints de exportacion requieren:
  1. **JwtAuthGuard** - Token JWT valido
  2. **AdminGuard** - Rol de administrador

```typescript
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('Admin - Analytics')
export class AdminAnalyticsController { }
```

### 11.2 Datos Sensibles

- Los archivos CSV pueden contener datos PII (correos, nombres)
- Se recomienda:
  - No almacenar archivos exportados en servidores publicos
  - Implementar logs de auditoria de exportaciones
  - Considerar enmascaramiento de datos sensibles para roles especificos

### 11.3 Rate Limiting

Los endpoints de exportacion estan sujetos al rate limit general del modulo admin:
- **30 requests por minuto** por usuario

---

## 12. Referencias

### 12.1 Archivos de Implementacion

**Backend:**
- Controller Analytics: `/apps/backend/src/modules/admin/controllers/admin-analytics.controller.ts`
- Controller Progress: `/apps/backend/src/modules/admin/controllers/admin-progress.controller.ts`
- Service Analytics: `/apps/backend/src/modules/admin/services/admin-analytics.service.ts`
- Service Progress: `/apps/backend/src/modules/admin/services/admin-progress.service.ts`
- DTO Export Analytics: `/apps/backend/src/modules/admin/dto/analytics/export-query.dto.ts`
- DTO Export Progress: `/apps/backend/src/modules/admin/dto/progress/export-progress-query.dto.ts`

### 12.2 Historias de Usuario Relacionadas

- [US-AE-014 - Dashboard de Analiticas](../historias-usuario/US-AE-014-analytics-dashboard.md)
- [US-AE-015 - Sistema de Seguimiento de Progreso](../historias-usuario/US-AE-015-progress-tracking.md)

### 12.3 Swagger Documentation

- Disponible en: `/api/docs`
- Tags: "Admin - Analytics", "Admin - Progress"

---

**Documento creado:** 2026-01-20
**Version:** 1.0.0
**Estado:** Implementado y documentado
**Autor:** Technical Architect Agent
