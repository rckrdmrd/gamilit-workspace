# ET-ADM-005: Visor de Audit Logs

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-005 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion de Visor de Audit Logs |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-AE-011: Sistema de Auditoria y Logs

### User Stories
- [US-AE-011: Visor de Audit Logs](../historias-usuario/US-AE-011-visor-audit-logs.md)

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminAuditLogsPage                                     |
|  - LogDetailModal                                         |
|  - useAuditLogs (hook)                                    |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - AdminSystemController                                 |
|  - AdminSystemService                                    |
|  - DTOs: AuditLogFiltersDto                              |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - auth_management.login_attempts                        |
+----------------------------------------------------------+
```

### Flujo de Consulta de Audit Logs

```
Admin accede a /admin/audit-logs
        |
        v
useAuditLogs hook inicializa
        |
        v
GET /api/admin/system/audit-log
        |
        v
AdminSystemService.getAuditLogs
  - Aplica filtros (email, IP, fecha, estado)
  - Paginacion (limit: 20)
        |
        v
Retorna logs paginados
        |
        v
Frontend renderiza tabla con filtros
```

---

## Implementacion Backend

### Controller

**Ubicacion:** `apps/backend/src/admin/controllers/admin-system.controller.ts`

```typescript
@Get('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async getAuditLogs(@Query() filters: AuditLogFiltersDto) {
  return this.adminSystemService.getAuditLogs(filters);
}
```

### Service

**Ubicacion:** `apps/backend/src/admin/services/admin-system.service.ts`

```typescript
async getAuditLogs(filters: AuditLogFiltersDto): Promise<PaginatedResponse<AuditLogEntry>> {
  const query = this.loginAttemptsRepository.createQueryBuilder('log');

  if (filters.email) {
    query.andWhere('log.email ILIKE :email', { email: `%${filters.email}%` });
  }
  if (filters.ipAddress) {
    query.andWhere('log.ip_address = :ip', { ip: filters.ipAddress });
  }
  if (filters.success !== undefined) {
    query.andWhere('log.success = :success', { success: filters.success });
  }
  if (filters.startDate) {
    query.andWhere('log.attempted_at >= :start', { start: filters.startDate });
  }
  if (filters.endDate) {
    query.andWhere('log.attempted_at <= :end', { end: filters.endDate });
  }

  query.orderBy('log.attempted_at', 'DESC');

  const [items, total] = await query
    .skip((filters.page - 1) * filters.limit)
    .take(filters.limit)
    .getManyAndCount();

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalItems: total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
}
```

### DTOs

**Ubicacion:** `apps/backend/src/admin/dto/audit-log-filters.dto.ts`

```typescript
export class AuditLogFiltersDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  success?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number = 20;
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminAuditLogsPage.tsx`

**Componentes:**
| Componente | Tipo | Descripcion |
|------------|------|-------------|
| AdminAuditLogsPage | Page | Pagina principal del visor |
| LogDetailModal | Modal | Modal de detalle de log |
| DetectiveCard | UI | Contenedor de secciones |
| DetectiveButton | UI | Botones de accion |

### Custom Hook

**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useAuditLogs.ts`

```typescript
interface UseAuditLogsReturn {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: AuditLogFilters) => void;
  setPage: (page: number) => void;
}
```

### State Management

| State | Tipo | Descripcion |
|-------|------|-------------|
| filters | AuditLogFilters | Filtros activos |
| currentPage | number | Pagina actual |
| showFilters | boolean | Toggle panel filtros |
| searchText | string | Texto de busqueda |
| selectedLog | AuditLogEntry | Log seleccionado para modal |
| toast | Toast | Notificacion temporal |

### Funcionalidades

1. **Filtrado Avanzado:**
   - Por email (parcial, ILIKE)
   - Por direccion IP (exacta)
   - Por estado (exitoso/fallido)
   - Por rango de fechas

2. **Paginacion:**
   - 20 registros por pagina
   - Navegacion con botones
   - Indicador de rango

3. **Exportacion CSV:**
   - Genera archivo con timestamp
   - Columnas: ID, Fecha, Email, Estado, IP, UserAgent, UserID, Razon

4. **Vista Detallada:**
   - Modal con informacion completa
   - User agent, razon de falla

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/api/admin/system/audit-log` | Listar logs paginados | ADMIN, SUPER_ADMIN |

### Query Parameters

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| page | number | No | Pagina (default: 1) |
| limit | number | No | Items por pagina (default: 20, max: 100) |
| email | string | No | Filtro por email |
| ipAddress | string | No | Filtro por IP |
| success | boolean | No | Filtro por estado |
| startDate | ISO8601 | No | Fecha inicio |
| endDate | ISO8601 | No | Fecha fin |

### Response

```typescript
{
  items: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

## Tipos TypeScript

### AuditLogEntry

```typescript
interface AuditLogEntry {
  id: string;
  userId?: string | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
  attemptedAt: string;  // ISO 8601
}
```

### AuditLogFilters

```typescript
interface AuditLogFilters {
  userId?: string;
  email?: string;
  ipAddress?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

---

## Dependencias

### Frontend
- framer-motion (animaciones)
- lucide-react (iconos: Shield, FileText, Download, Filter, etc.)
- @tanstack/react-query (via useUserGamification)

### Backend
- TypeORM (queries)
- class-validator (validacion DTOs)
- class-transformer (transformaciones)

---

## Metricas del Componente

| Metrica | Valor |
|---------|-------|
| Lineas de codigo (Page) | 762 |
| Subcomponentes | 1 (LogDetailModal) |
| Estados locales | 7 |
| Hooks utilizados | 3 |
| Endpoints consumidos | 1 |
| Animaciones | 4 |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-005-audit-logs.md*
*Generado: 2026-01-25*
