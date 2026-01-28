# ET-LTI-003: Consumer Management (Admin UI)

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-LTI-003 |
| **Modulo** | LTI Integration |
| **Titulo** | Admin UI para Gestion de LTI Consumers |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 70% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 70%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Entity (LtiConsumer) | COMPLETO | 100% |
| Service (LtiConsumersService) | COMPLETO | 100% |
| Controller (LtiConsumersController) | COMPLETO | 100% |
| DTOs (Create/Update/Response) | COMPLETO | 100% |
| Frontend API Client | COMPLETO | 100% |
| Unit Tests (Entities) | COMPLETO | 100% |
| Frontend Admin UI Components | NO INICIADO | 0% |
| Key Management Service | NO INICIADO | 0% |
| Connection Testing | NO INICIADO | 0% |
| Auto-detection LMS URLs | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-LTI-004: Platform Configuration Management

### User Stories
- [US-LTI-004: Platform Configuration UI](../historias-usuario/US-LTI-004-platform-config.md)

### Estandar
- IMS Global LTI 1.3 - Platform Registration

---

## Implementacion Existente

### Entity: LtiConsumer

**Ubicacion:** `apps/backend/src/modules/lti/entities/lti-consumer.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Implementados:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| platformId | TEXT | Issuer identifier (URL del LMS) |
| clientId | TEXT | OAuth2 client_id |
| deploymentId | TEXT | LTI deployment ID |
| publicKeysetUrl | TEXT | JWKS URL para validar tokens |
| accessTokenUrl | TEXT | Token endpoint |
| authorizationUrl | TEXT | Authorization endpoint |
| platformName | TEXT | Nombre del LMS (e.g., "Canvas UAM") |
| platformVersion | TEXT | Version del LMS |
| platformContactEmail | TEXT | Email de contacto |
| tenantId | UUID | FK a tenants (multi-tenancy) |
| supportsDeepLinking | BOOLEAN | Soporte Deep Linking |
| supportsNrps | BOOLEAN | Soporte NRPS |
| supportsAgs | BOOLEAN | Soporte AGS |
| consumerKey | TEXT | Clave legacy LTI 1.1 (opcional) |
| consumerSecret | TEXT | Secreto legacy LTI 1.1 (opcional) |
| customParameters | JSONB | Parametros personalizados |
| isActive | BOOLEAN | Estado activo/inactivo |
| isVerified | BOOLEAN | Verificacion exitosa |
| createdBy | UUID | Creador |
| lastUsedAt | TIMESTAMPTZ | Ultimo uso |

### Service: LtiConsumersService

**Ubicacion:** `apps/backend/src/modules/lti/services/lti-consumers.service.ts`

**Estado:** COMPLETO (100%)

**Metodos Implementados:**
| Metodo | Descripcion |
|--------|-------------|
| findAll() | Obtener todos los consumers activos |
| findOne(id) | Obtener consumer por ID |
| findByPlatformAndClient(platformId, clientId) | Buscar por plataforma y cliente |
| findByTenant(tenantId) | Buscar por tenant |
| create(dto, createdBy?) | Registrar nuevo consumer |
| update(id, dto) | Actualizar consumer |
| deactivate(id) | Desactivar consumer (soft delete) |
| activate(id) | Reactivar consumer |
| verify(id) | Marcar como verificado |
| updateLastUsed(id) | Actualizar timestamp de uso |
| getStats() | Obtener estadisticas |

### Controller: LtiConsumersController

**Ubicacion:** `apps/backend/src/modules/lti/controllers/lti-consumers.controller.ts`

**Estado:** COMPLETO (100%)

**Endpoints Implementados:**
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/lti/consumers` | Listar todos los consumers |
| GET | `/api/v1/lti/consumers/stats` | Estadisticas |
| GET | `/api/v1/lti/consumers/:id` | Obtener por ID |
| GET | `/api/v1/lti/consumers/tenant/:tenantId` | Por tenant |
| POST | `/api/v1/lti/consumers` | Crear consumer |
| PATCH | `/api/v1/lti/consumers/:id` | Actualizar |
| POST | `/api/v1/lti/consumers/:id/verify` | Verificar |
| POST | `/api/v1/lti/consumers/:id/activate` | Activar |
| DELETE | `/api/v1/lti/consumers/:id` | Desactivar |

### Frontend API Client

**Ubicacion:** `apps/frontend/src/services/api/ltiAPI.ts`

**Estado:** COMPLETO (100%)

```typescript
export const consumersAPI = {
  getAll: async (): Promise<LTIConsumer[]>,
  getStats: async (): Promise<LTIConsumerStats>,
  getById: async (id: string): Promise<LTIConsumer>,
  getByTenant: async (tenantId: string): Promise<LTIConsumer[]>,
  create: async (data: Partial<LTIConsumer>): Promise<LTIConsumer>,
  update: async (id: string, data: Partial<LTIConsumer>): Promise<LTIConsumer>,
  verify: async (id: string): Promise<{ success: boolean; message: string }>,
  activate: async (id: string): Promise<LTIConsumer>,
  delete: async (id: string): Promise<void>
};
```

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) LtiConsumerListPage                        |
|  - (FALTANTE) LtiConsumerForm                            |
|  - (FALTANTE) LtiConnectionTester                        |
|  - consumersAPI (API client) [COMPLETO]                  |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - LtiConsumersController [COMPLETO]                     |
|  - LtiConsumersService [COMPLETO]                        |
|  - DTOs [COMPLETO]                                       |
|  - (FALTANTE) KeyManagementService                       |
|  - (FALTANTE) ConnectionTestService                      |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - lti_integration.lti_consumers [COMPLETO]              |
+----------------------------------------------------------+
```

---

## Lo que Falta para Completar (30%)

### 1. Frontend Admin UI Components (20% de lo faltante)

**Componentes Faltantes:**
| Componente | Descripcion | Horas |
|------------|-------------|-------|
| LtiConsumerListPage | Pagina principal con tabla de consumers | 3h |
| LtiConsumerForm | Formulario crear/editar consumer | 4h |
| LtiConsumerCard | Card con info de consumer individual | 1h |
| LtiStatusBadge | Badge activo/inactivo/verificado | 0.5h |
| LtiConnectionTester | Componente para probar conexion | 2h |
| LtiJwkModal | Modal para mostrar/copiar JWK publico | 1h |
| LtiAutoDetect | Logic para auto-completar URLs de LMS | 1h |

**Estructura de Pagina Propuesta:**
```tsx
// pages/admin/lti/LtiConsumersPage.tsx
const LtiConsumersPage: React.FC = () => {
  return (
    <AdminLayout>
      <PageHeader
        title="LTI Consumers"
        action={<Button onClick={openCreateModal}>Add Platform</Button>}
      />
      <LtiConsumerStats />
      <LtiConsumerFilters />
      <LtiConsumerTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTest={handleTestConnection}
      />
      <LtiConsumerFormModal
        isOpen={showForm}
        consumer={selectedConsumer}
        onSave={handleSave}
      />
    </AdminLayout>
  );
};
```

### 2. Key Management Service (5% de lo faltante)

**Servicio Faltante:**
```typescript
// services/lti-key-management.service.ts (NUEVO)
@Injectable()
export class LtiKeyManagementService {
  /**
   * Genera par de claves RSA-2048
   */
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }>;

  /**
   * Exporta clave publica en formato JWK
   */
  async exportPublicKeyAsJwk(publicKey: string): Promise<JsonWebKey>;

  /**
   * Encripta clave privada para almacenamiento
   */
  async encryptPrivateKey(privateKey: string): Promise<string>;

  /**
   * Desencripta clave privada
   */
  async decryptPrivateKey(encryptedKey: string): Promise<string>;
}
```

### 3. Connection Testing Service (3% de lo faltante)

**Servicio Faltante:**
```typescript
// services/lti-connection-test.service.ts (NUEVO)
@Injectable()
export class LtiConnectionTestService {
  /**
   * Prueba conexion al JWKS endpoint del LMS
   */
  async testJwksEndpoint(url: string): Promise<ConnectionTestResult>;

  /**
   * Valida formato de respuesta JWKS
   */
  async validateJwksResponse(jwks: unknown): Promise<boolean>;

  /**
   * Prueba completa de configuracion
   */
  async testFullConfiguration(consumer: LtiConsumer): Promise<ConnectionTestReport>;
}

interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface ConnectionTestReport {
  jwks: ConnectionTestResult;
  authEndpoint: ConnectionTestResult;
  tokenEndpoint: ConnectionTestResult;
  overall: 'success' | 'partial' | 'failed';
}
```

### 4. Auto-detection de URLs por LMS (2% de lo faltante)

**Logic para Frontend:**
```typescript
// utils/lti-url-templates.ts (NUEVO)
export const LMS_URL_TEMPLATES = {
  canvas: {
    authorizationUrl: '{issuer}/api/lti/authorize_redirect',
    accessTokenUrl: '{issuer}/login/oauth2/token',
    publicKeysetUrl: '{issuer}/api/lti/security/jwks',
  },
  moodle: {
    authorizationUrl: '{issuer}/mod/lti/auth.php',
    accessTokenUrl: '{issuer}/mod/lti/token.php',
    publicKeysetUrl: '{issuer}/mod/lti/certs.php',
  },
  blackboard: {
    authorizationUrl: '{issuer}/learn/api/public/v1/oauth2/authorizationcode',
    accessTokenUrl: '{issuer}/learn/api/public/v1/oauth2/token',
    publicKeysetUrl: '{issuer}/.well-known/jwks.json',
  },
};

export function autoFillUrls(
  platform: 'canvas' | 'moodle' | 'blackboard',
  issuer: string
): LmsUrlConfig;
```

---

## API REST Endpoints

### Existentes (Completos)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/lti/consumers` | Listar consumers | ADMIN |
| GET | `/api/v1/lti/consumers/stats` | Estadisticas | ADMIN |
| GET | `/api/v1/lti/consumers/:id` | Obtener por ID | ADMIN |
| GET | `/api/v1/lti/consumers/tenant/:tenantId` | Por tenant | ADMIN |
| POST | `/api/v1/lti/consumers` | Crear | ADMIN |
| PATCH | `/api/v1/lti/consumers/:id` | Actualizar | ADMIN |
| POST | `/api/v1/lti/consumers/:id/verify` | Verificar | ADMIN |
| POST | `/api/v1/lti/consumers/:id/activate` | Activar | ADMIN |
| DELETE | `/api/v1/lti/consumers/:id` | Desactivar | ADMIN |

### Faltantes (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/lti/consumers/:id/test` | Probar conexion | ADMIN |
| GET | `/api/v1/lti/consumers/:id/jwk` | Obtener JWK publico | ADMIN |
| POST | `/api/v1/lti/consumers/:id/regenerate-keys` | Regenerar claves | ADMIN |

---

## Criterios de Aceptacion

### Funcionales
- [x] CRUD completo de consumers via API
- [x] Multi-tenancy support
- [x] Activation/deactivation de consumers
- [x] Estadisticas de uso
- [ ] Admin UI con tabla y formulario
- [ ] Auto-fill de URLs por tipo de LMS
- [ ] Generacion y gestion de claves RSA
- [ ] Test de conexion al JWKS endpoint
- [ ] Modal para copiar JWK publico

### No Funcionales
- [x] API protegida con JWT Auth
- [x] Swagger documentation
- [ ] UI responsiva
- [ ] Tooltips explicativos
- [ ] Manejo de errores user-friendly
- [ ] Audit logging de cambios

### Seguridad
- [x] Solo admins pueden acceder
- [x] Soft delete (no eliminacion fisica)
- [ ] Claves privadas encriptadas (AES-256)
- [ ] Audit trail de modificaciones

---

## LMS Compatibility Matrix

| LMS | Auto-detect URLs | OIDC | AGS | Deep Linking | NRPS | Prioridad |
|-----|------------------|------|-----|--------------|------|-----------|
| Canvas | Si | Si | Si | Si | Si | P1 |
| Moodle | Si | Si | Si | Si | Si | P2 |
| Blackboard | Si | Si | Si | Si | Parcial | P3 |
| Google Classroom | No | No* | Parcial | No | No | P4 |
| Schoology | Si | Si | Si | Si | Si | P4 |
| Brightspace (D2L) | Si | Si | Si | Si | Si | P4 |

*Google Classroom usa API propia, no LTI 1.3 completo.

---

## Dependencias

### Bloqueado Por
- LtiConsumer Entity (COMPLETO)
- LtiConsumersService (COMPLETO)
- LtiConsumersController (COMPLETO)
- Frontend API Client (COMPLETO)

### Bloquea
- OIDC Login Flow (US-LTI-001)
- Grade Passback (US-LTI-002)
- Deep Linking (US-LTI-003)

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Frontend Admin UI | 12.5h |
| Key Management Service | 4h |
| Connection Test Service | 3h |
| Auto-detect URLs | 2h |
| Unit/Integration Tests | 4h |
| **Total** | **25.5h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-LTI-003-consumer-management.md*
*Generado: 2026-01-27*
