# ET-AUD-001: Sistema de Auditoría - Especificación Técnica

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUD-001 |
| **Módulo** | 08 - Auditoría y Configuración |
| **Título** | Sistema de Auditoría - Implementación |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha** | 2025-11-07 |

---

## 🔗 Referencias

📘 **Implementa:** [RF-AUD-001](../../01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md)

---

## 🗄️ Base de Datos

### Tabla: audit_logs

```sql
CREATE TABLE audit_logging.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario que ejecuta la acción
    user_id UUID REFERENCES auth.users(id),

    -- Acción ejecutada
    action audit_logging.audit_action NOT NULL,

    -- Recurso afectado
    resource_type VARCHAR(100),
    resource_id UUID,

    -- Detalles adicionales (JSONB flexible)
    details JSONB DEFAULT '{}'::jsonb,

    -- Severidad
    severity audit_logging.log_severity DEFAULT 'info',

    -- Contexto de request
    ip_address INET,
    user_agent TEXT,

    -- Timestamp
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Índices para búsqueda
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Índices optimizados para queries comunes
CREATE INDEX idx_audit_user ON audit_logging.audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logging.audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_severity ON audit_logging.audit_logs(severity, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logging.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_logging.audit_logs(timestamp DESC);

-- Partition por mes (para performance)
CREATE TABLE audit_logging.audit_logs_2025_11 PARTITION OF audit_logging.audit_logs
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- RLS: Solo admins pueden ver logs
ALTER TABLE audit_logging.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_admin_only
ON audit_logging.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth_management.profiles
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);

-- Prevenir modificación (append-only)
CREATE POLICY audit_logs_no_update
ON audit_logging.audit_logs
FOR UPDATE
USING (false);

CREATE POLICY audit_logs_no_delete
ON audit_logging.audit_logs
FOR DELETE
USING (false); -- Solo cleanup job puede eliminar
```

### Función: create_audit_log

```sql
CREATE OR REPLACE FUNCTION audit_logging.create_audit_log(
    p_user_id UUID,
    p_action audit_logging.audit_action,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_severity audit_logging.log_severity DEFAULT 'info',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logging.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        severity,
        ip_address,
        user_agent,
        timestamp
    ) VALUES (
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_severity,
        p_ip_address,
        p_user_agent,
        NOW()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;
```

### Job: cleanup_expired_logs

```sql
CREATE OR REPLACE FUNCTION audit_logging.cleanup_expired_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM audit_logging.audit_logs
        WHERE
            (severity = 'info' AND timestamp < NOW() - INTERVAL '90 days') OR
            (severity = 'warning' AND timestamp < NOW() - INTERVAL '180 days') OR
            (severity = 'error' AND timestamp < NOW() - INTERVAL '365 days') OR
            (severity = 'critical' AND timestamp < NOW() - INTERVAL '730 days')
        RETURNING *
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    RETURN v_deleted_count;
END;
$$;

-- Cron job: ejecutar diariamente a las 2 AM
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT audit_logging.cleanup_expired_logs()');
```

---

## 💻 Backend (NestJS)

### Service: AuditService

```typescript
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    await this.auditRepo.query(
      'SELECT audit_logging.create_audit_log($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        dto.userId,
        dto.action,
        dto.resourceType,
        dto.resourceId,
        dto.details || {},
        dto.severity || 'info',
        dto.ipAddress,
        dto.userAgent,
      ]
    );
  }

  async search(filters: AuditSearchFilters): Promise<AuditLog[]> {
    const query = this.auditRepo.createQueryBuilder('log');

    if (filters.userId) {
      query.andWhere('log.user_id = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.severity) {
      query.andWhere('log.severity = :severity', { severity: filters.severity });
    }

    if (filters.startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('log.timestamp <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('log.timestamp', 'DESC');
    query.limit(filters.limit || 100);

    return query.getMany();
  }

  async exportToCsv(filters: AuditSearchFilters): Promise<string> {
    const logs = await this.search(filters);

    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Details'].join(','),
      ...logs.map(log => [
        log.timestamp.toISOString(),
        log.user_id,
        log.action,
        `${log.resource_type}:${log.resource_id}`,
        log.severity,
        JSON.stringify(log.details),
      ].join(','))
    ].join('\n');

    return csv;
  }
}
```

### Interceptor: AuditInterceptor

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        // Log successful request
        this.auditService.log({
          userId: user?.id,
          action: this.mapMethodToAction(request.method),
          resourceType: this.extractResourceType(request.path),
          details: {
            path: request.path,
            method: request.method,
            query: request.query,
          },
          severity: 'info',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
      catchError((error) => {
        // Log failed request
        this.auditService.log({
          userId: user?.id,
          action: this.mapMethodToAction(request.method),
          resourceType: this.extractResourceType(request.path),
          details: {
            error: error.message,
            stack: error.stack,
          },
          severity: error.status >= 500 ? 'error' : 'warning',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });

        throw error;
      })
    );
  }

  private mapMethodToAction(method: string): string {
    const mapping = {
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete',
      'GET': 'read',
    };
    return mapping[method] || 'unknown';
  }
}
```

---

## 🎨 Frontend (React)

### Component: AuditLogViewer

```tsx
export const AuditLogViewer: React.FC = () => {
  const [filters, setFilters] = useState<AuditSearchFilters>({
    startDate: dayjs().subtract(7, 'days').toDate(),
    endDate: new Date(),
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.search(filters),
  });

  const handleExport = async () => {
    const csv = await auditApi.exportToCsv(filters);
    downloadFile(csv, 'audit-logs.csv');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <DateRangePicker
          start={filters.startDate}
          end={filters.endDate}
          onChange={(start, end) => setFilters({ ...filters, startDate: start, endDate: end })}
        />
        <select
          value={filters.severity || ''}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
        >
          <option value="">Todas las severidades</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        <button onClick={handleExport} className="btn-primary">
          Exportar CSV
        </button>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Recurso</th>
              <th>Severidad</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map(log => (
              <tr key={log.id}>
                <td>{dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{log.user_email}</td>
                <td>{log.action}</td>
                <td>{log.resource_type}:{log.resource_id?.substring(0, 8)}</td>
                <td>
                  <span className={`badge badge-${log.severity}`}>
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

---

## 🧪 Tests

```typescript
describe('AuditService', () => {
  it('should log user login', async () => {
    // Arrange
    const user = await createUser();

    // Act
    await auditService.log({
      userId: user.id,
      action: 'login',
      severity: 'info',
      ipAddress: '192.168.1.1',
    });

    // Assert
    const logs = await auditService.search({ userId: user.id });
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('login');
  });

  it('should search logs by date range', async () => {
    // Arrange
    const user = await createUser();
    await auditService.log({ userId: user.id, action: 'create' });

    // Act
    const logs = await auditService.search({
      userId: user.id,
      startDate: dayjs().subtract(1, 'hour').toDate(),
      endDate: new Date(),
    });

    // Assert
    expect(logs.length).toBeGreaterThan(0);
  });
});
```

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación |

---

**Documento:** `docs/02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md`
