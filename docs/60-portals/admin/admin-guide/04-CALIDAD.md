---
titulo: "Portal Admin - Testing, Buenas Prácticas, Troubleshooting y Referencias"
tipo: portal
portal: admin
status: activo
last_updated: "2026-02-28"
---

# Portal Admin — Testing, Buenas Prácticas, Troubleshooting y Referencias

**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Seguridad y Flujos](03-SEGURIDAD-FLUJOS.md)

---

## 10. Testing

### 10.1 Tests Unitarios Backend

```typescript
// admin-users.controller.spec.ts
describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: AdminUsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        { provide: AdminUsersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(AdminUsersController);
    service = module.get(AdminUsersService);
  });

  it('should list users with pagination', async () => {
    const query: ListUsersDto = { page: 1, limit: 20 };
    mockService.listUsers.mockResolvedValue(mockPaginatedUsers);

    const result = await controller.listUsers(query);

    expect(result.data).toHaveLength(20);
    expect(result.meta.total).toBe(100);
    expect(mockService.listUsers).toHaveBeenCalledWith(query);
  });

  it('should suspend user', async () => {
    const userId = 'user-123';
    const dto: SuspendUserDto = { reason: 'Violation', duration_days: 7 };

    await controller.suspendUser(userId, dto);

    expect(mockService.suspendUser).toHaveBeenCalledWith(userId, dto);
  });
});
```

### 10.2 Tests Frontend

```typescript
// useUserManagement.test.ts
describe('useUserManagement', () => {
  it('should fetch users list', async () => {
    const { result } = renderHook(() => useUserManagement(), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBeDefined();
    expect(result.current.users.length).toBeGreaterThan(0);
  });

  it('should suspend user', async () => {
    const { result } = renderHook(() => useUserManagement(), {
      wrapper: QueryClientProvider,
    });

    await act(async () => {
      await result.current.suspendUser('user-123', {
        reason: 'Test suspension',
      });
    });

    await waitFor(() => {
      expect(mockAPI.suspendUser).toHaveBeenCalled();
    });
  });
});
```

### 10.3 E2E Tests

```typescript
// admin-users.e2e.spec.ts
describe('Admin Users Management (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/admin/users (GET) - should require admin role', () => {
    return request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  it('/admin/users (GET) - should return users for admin', () => {
    return request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.meta).toBeDefined();
      });
  });
});
```

---

## 11. Buenas Prácticas

### 11.1 Frontend

```typescript
// DO: Hooks específicos por funcionalidad
export function useUserManagement() { ... }
export function useOrganizations() { ... }
export function useBulkOperations() { ... }

// DON'T: Un hook gigante
export function useAdmin() { ... } // Evitar

// DO: Query keys jerárquicas y descriptivas
const queryKey = ['admin', 'users', 'list', { role: 'teacher', page: 1 }];

// DO: Invalidar queries relacionadas
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
  },
});

// DO: Error boundaries para secciones críticas
<ErrorBoundary fallback={<ErrorDisplay />}>
  <AdminUsersPage />
</ErrorBoundary>
```

### 11.2 Backend

```typescript
// DO: DTOs con validación completa
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password!: string;
}

// DO: Logging completo en servicios admin
@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  async suspendUser(userId: string, dto: SuspendUserDto): Promise<void> {
    this.logger.log(`Suspending user ${userId}: ${dto.reason}`);

    try {
      await this.userRepo.update(userId, { status: 'suspended' });
      await this.auditLogService.log({ ... });
    } catch (error) {
      this.logger.error(`Failed to suspend user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to suspend user');
    }
  }
}

// DO: Transacciones para operaciones críticas
async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
  return this.dataSource.transaction(async (manager) => {
    const org = await manager.save(Organization, dto);
    await manager.save(Tenant, { organization_id: org.id });
    await manager.save(FeatureFlag, { tenant_id: tenant.id });
    return org;
  });
}
```

---

## 12. Troubleshooting

### 12.1 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| 403 Forbidden | AdminGuard rechaza | Verificar rol del usuario (admin/super_admin) |
| Bulk operation timeout | Operación muy larga | Usar background jobs, no esperar respuesta |
| Dashboard lento | Queries N+1 | Usar eager loading en TypeORM |
| Métricas desactualizadas | Cache | Invalidar cache manualmente o reducir TTL |
| Audit logs faltantes | Error en middleware | Verificar AuditLogInterceptor está aplicado |

### 12.2 Debugging

```typescript
// Habilitar logs verbose en development
if (process.env.NODE_ENV === 'development') {
  // Frontend
  apiClient.interceptors.request.use((config) => {
    console.log(`[Admin API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  // Backend
  @Injectable()
  export class AdminUsersService {
    async listUsers(query: ListUsersDto) {
      this.logger.debug(`ListUsers called with:`, query);
      const result = await this.userRepo.find(...);
      this.logger.debug(`Returned ${result.length} users`);
      return result;
    }
  }
}
```

---

## 13. Checklist de Desarrollo

### 13.1 Nueva Funcionalidad Admin

- [ ] Definir tipos en `admin/types/index.ts`
- [ ] Crear DTOs en backend `admin/dto/`
- [ ] Implementar service en `admin/services/`
- [ ] Crear/modificar controller
- [ ] Aplicar AdminGuard a endpoints
- [ ] Agregar audit logging
- [ ] Crear API service en frontend
- [ ] Implementar hook en `admin/hooks/`
- [ ] Crear componentes necesarios
- [ ] Integrar en página correspondiente
- [ ] Agregar tests unitarios
- [ ] Documentar en Swagger
- [ ] Actualizar esta guía

### 13.2 Code Review Admin

- [ ] AdminGuard aplicado correctamente
- [ ] Validación de DTOs completa
- [ ] Error handling implementado
- [ ] Audit logging presente
- [ ] Logs apropiados en services
- [ ] Types alineados frontend/backend
- [ ] Query keys descriptivas
- [ ] Invalidación de cache correcta
- [ ] Permisos verificados
- [ ] Tests passing

---

## 14. Referencias

### Documentos Complementarios

| Documento | Descripción |
|-----------|-------------|
| [PORTAL-TEACHER-GUIDE.md](../teacher/PORTAL-TEACHER-GUIDE.md) | Guía del portal Teacher (estructura similar) |
| [COMPONENT-PATTERNS.md](../../50-guides/frontend/impl/COMPONENT-PATTERNS.md) | Patrones de componentes |
| [HOOK-PATTERNS.md](../../50-guides/frontend/impl/HOOK-PATTERNS.md) | Patrones de hooks |
| [DTO-CONVENTIONS.md](../../50-guides/backend/impl/DTO-CONVENTIONS.md) | Convenciones de DTOs |
| [ESTRUCTURA-MODULOS.md](../../50-guides/backend/impl/ESTRUCTURA-MODULOS.md) | Estructura de módulos |
| [40-api/README.md](../../40-api/README.md) | Estándares de rutas API |

### ADRs Relevantes

- ADR-001: Separación de portales (student/teacher/admin)
- ADR-002: Uso de AdminGuard para autorización
- ADR-003: Bulk operations con background jobs
- ADR-004: Audit logging obligatorio para acciones admin

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | 2026-02-18 | Actualización mayor: Sprint 0+1+2 Admin Portal Refactor. Sección 2.1 reestructurada (14→19 pages, +30 componentes, +12 hooks, nueva estructura shared/notifications/). Sección 4.1 +AdminPageShell y AdminTabBar patterns. Sección 6.2 corregida (API monolítica real vs paths fantasma). Sección 15.1 actualizada con patrón canónico AdminPageShell. |
| 1.0.0 | 2025-11-29 | Creación inicial completa |

---

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Seguridad y Flujos](03-SEGURIDAD-FLUJOS.md)
