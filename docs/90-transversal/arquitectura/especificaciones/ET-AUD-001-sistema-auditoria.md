# ET-AUD-001: Sistema de Auditoría

**Versión:** 1.0.0
**Fecha:** 2025-12-18
**Estado:** Implementado
**Módulo Backend:** `apps/backend/src/modules/audit/`

---

## 1. DESCRIPCIÓN

El módulo de auditoría proporciona capacidades de logging y seguimiento de acciones en el sistema GAMILIT. Permite registrar eventos importantes para compliance, debugging y análisis de comportamiento.

---

## 2. COMPONENTES

### 2.1 AuditService

**Ubicación:** `audit/audit.service.ts`

**Responsabilidades:**
- Crear registros de auditoría
- Consultar logs por usuario, fecha, tipo
- Limpiar logs antiguos (cron job)

**Métodos:**
| Método | Descripción | Parámetros |
|--------|-------------|------------|
| `create(dto)` | Registrar evento de auditoría | CreateAuditLogDto |
| `findAll(filters)` | Listar logs con filtros | Pagination, userId, dateRange |
| `findByUser(userId)` | Logs de un usuario específico | userId: string |
| `deleteOldLogs(days)` | Limpiar logs antiguos | days: number |

### 2.2 AuditLog Entity

**Ubicación:** `audit/entities/audit-log.entity.ts`
**Schema:** `audit_logging`

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| user_id | UUID | Usuario que realizó la acción |
| action | string | Tipo de acción (CREATE, UPDATE, DELETE, etc.) |
| resource_type | string | Tipo de recurso afectado |
| resource_id | string | ID del recurso |
| old_value | jsonb | Valor anterior (opcional) |
| new_value | jsonb | Valor nuevo (opcional) |
| ip_address | string | IP del cliente |
| user_agent | string | User agent del cliente |
| created_at | timestamp | Fecha del evento |

### 2.3 AuditInterceptor

**Ubicación:** `audit/interceptors/audit.interceptor.ts`

**Funcionalidad:**
- Interceptor global que captura eventos de mutación
- Registra automáticamente CREATE/UPDATE/DELETE
- Configurable por decorador `@Auditable()`

---

## 3. CONFIGURACIÓN

### 3.1 Módulo

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog], 'audit'),
  ],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService],
})
export class AuditModule {}
```

### 3.2 Uso del Interceptor

```typescript
// Aplicar a un controlador completo
@UseInterceptors(AuditInterceptor)
@Controller('users')
export class UsersController {}

// O a métodos específicos
@Post()
@Auditable('CREATE_USER')
async create(@Body() dto: CreateUserDto) {}
```

---

## 4. EVENTOS AUDITADOS

| Categoría | Eventos |
|-----------|---------|
| **Autenticación** | LOGIN, LOGOUT, FAILED_LOGIN, PASSWORD_RESET |
| **Usuarios** | CREATE_USER, UPDATE_USER, DELETE_USER, ROLE_CHANGE |
| **Contenido** | CREATE_EXERCISE, GRADE_SUBMISSION, APPROVE_CONTENT |
| **Administración** | SYSTEM_CONFIG_CHANGE, BULK_OPERATION |

---

## 5. RETENCIÓN DE DATOS

- **Logs de seguridad:** 1 año
- **Logs de operaciones:** 90 días
- **Logs de debugging:** 30 días

---

## 6. DEPENDENCIAS

- **Ninguna** (módulo independiente)
- **Es usado por:** AdminModule (para panel de logs)

---

## 7. SEGURIDAD

- Logs inmutables (solo inserción)
- Acceso restringido a roles Admin
- No almacenar datos sensibles (passwords, tokens)
- Sanitización de inputs antes de logging

---

*Especificación generada: 2025-12-18*
