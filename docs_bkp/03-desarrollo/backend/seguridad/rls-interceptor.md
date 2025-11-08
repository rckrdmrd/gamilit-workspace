# RLS Interceptor

## Descripción

El **RLS Interceptor** es un interceptor global de NestJS que implementa la capa 2 de la estrategia de seguridad definida en [ADR-003: RLS vs App-Layer Authorization](../../../docs/02-especificaciones-tecnicas/adr/ADR-003-rls-vs-app-layer-authorization.md).

Su función principal es establecer el contexto de usuario autenticado para que las políticas de Row Level Security (RLS) en PostgreSQL puedan aplicarse correctamente.

## Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: JWT Authentication                        │
│  - Valida token y extrae user context               │
│  - Adjunta req.user (id, email, role, tenant_id)    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 2: RLS Interceptor  ← TÚ ESTÁS AQUÍ          │
│  - Extrae información de req.user                   │
│  - Adjunta req.rlsContext al request                │
│  - Logging de contexto RLS                          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 3: App-Layer Middleware (opcional)           │
│  - Validaciones de negocio complejas                │
│  - Permisos específicos de features                 │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 4: Controller / Service                      │
│  - Usa req.rlsContext para aplicar SET LOCAL        │
│  - Queries a base de datos con RLS activo           │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 5: PostgreSQL RLS Policies                   │
│  - Filtrado automático de filas                     │
│  - Última línea de defensa                          │
└─────────────────────────────────────────────────────┘
```

## Funcionalidad

### Extracción de Contexto

El interceptor extrae la siguiente información del `req.user` (poblado por JWT guard):

- **userId**: `user.userId || user.sub || user.id`
- **userEmail**: `user.email || 'unknown'`
- **userRole**: `user.role || 'student'`
- **tenantId**: `user.tenantId || user.tenant_id || null`

### Adjuntar al Request

El contexto RLS se adjunta al request en `req.rlsContext`:

```typescript
interface RlsContext {
  userId: string;
  userEmail: string;
  userRole: string;
  tenantId: string | null;
}

// Ejemplo de uso en un servicio
const { userId, userRole } = request.rlsContext;
```

### Logging

El interceptor registra eventos de:
- Contexto RLS establecido
- Request completado con éxito
- Request fallido con error

## Uso en Servicios

Los servicios pueden usar el contexto RLS para ejecutar queries con políticas de seguridad:

```typescript
@Injectable()
export class SomeService {
  async findUserData(@Request() req) {
    const { userId } = req.rlsContext;

    // Opción 1: Usar el contexto directamente en WHERE clauses
    const data = await this.repository.find({
      where: { userId },
    });

    // Opción 2: Aplicar SET LOCAL antes de query (futuro)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query('SET LOCAL app.current_user_id = $1', [userId]);
    const result = await queryRunner.query('SELECT * FROM table');
    await queryRunner.release();

    return data;
  }
}
```

## Configuración

El interceptor se registra globalmente en `app.module.ts`:

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RlsInterceptor } from './shared/interceptors/rls.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsInterceptor,
    },
  ],
})
export class AppModule {}
```

## Variables RLS en PostgreSQL

Las políticas RLS en PostgreSQL esperan las siguientes variables de sesión:

```sql
-- Variables que deben estar disponibles
app.current_user_id    -- UUID del usuario autenticado
app.current_user_email -- Email del usuario
app.current_user_role  -- Rol: student, admin_teacher, super_admin
app.current_tenant_id  -- UUID del tenant (multi-tenancy)
```

Ejemplo de función helper en PostgreSQL:

```sql
CREATE FUNCTION gamilit.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

## Seguridad

### Sanitización

El interceptor sanitiza los valores de email y role para prevenir inyección:

```typescript
private sanitizeString(value: string): string {
  return value
    .replace(/['";\\]/g, '') // Remover quotes y backslashes
    .substring(0, 255);      // Limitar longitud
}
```

### Manejo de Errores

- Si no hay usuario autenticado, el interceptor **permite** que la request continúe
- Si falta userId, se loguea un warning pero se permite la request
- Las políticas RLS en la base de datos proveen la protección final

## Requests Sin Autenticación

Para endpoints públicos (sin JWT), el interceptor simplemente pasa al siguiente handler:

```typescript
if (!user) {
  return next.handle(); // No RLS context needed
}
```

## Futuras Mejoras

### Aplicación Automática de SET LOCAL

En el futuro, el interceptor puede ejecutar automáticamente `SET LOCAL` en todas las conexiones:

```typescript
// Para cada conexión de base de datos
const queryRunner = dataSource.createQueryRunner();
await queryRunner.query('SET LOCAL app.current_user_id = $1', [userId]);
await queryRunner.query('SET LOCAL app.current_user_role = $1', [userRole]);
```

### Cache de DataSources

Cachear las referencias a DataSources para mejorar performance:

```typescript
private dataSources: Map<string, DataSource> = new Map();
```

## Testing

Ejemplo de test para el RLS Interceptor:

```typescript
describe('RlsInterceptor', () => {
  it('should attach RLS context when user is authenticated', async () => {
    const mockRequest = {
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
      },
    };

    // Execute interceptor
    await interceptor.intercept(context, handler);

    // Verify RLS context attached
    expect(mockRequest.rlsContext).toBeDefined();
    expect(mockRequest.rlsContext.userId).toBe('test-user-id');
    expect(mockRequest.rlsContext.userRole).toBe('student');
  });

  it('should continue without RLS when no user', async () => {
    const mockRequest = { user: null };

    await interceptor.intercept(context, handler);

    expect(mockRequest.rlsContext).toBeUndefined();
  });
});
```

## Referencias

- **ADR-003**: RLS vs App-Layer Authorization Strategy
- **PostgreSQL RLS**: [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- **NestJS Interceptors**: [Official Documentation](https://docs.nestjs.com/interceptors)

## Estado

- ✅ **Fase 1**: Adjuntar contexto RLS al request
- ⏳ **Fase 2**: Aplicación automática de SET LOCAL (pendiente)
- ⏳ **Fase 3**: Manejo de múltiples conexiones simultáneas (pendiente)
- ⏳ **Fase 4**: Tests de integración (pendiente)
