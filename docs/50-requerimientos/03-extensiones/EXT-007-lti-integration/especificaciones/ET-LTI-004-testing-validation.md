# ET-LTI-004: Testing and Validation

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-LTI-004 |
| **Modulo** | LTI Integration |
| **Titulo** | Procedimientos de Testing y Validacion E2E |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 20% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 20%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Entity Unit Tests | COMPLETO | 100% |
| Service Unit Tests | NO INICIADO | 0% |
| Controller Unit Tests | NO INICIADO | 0% |
| Integration Tests (Backend) | NO INICIADO | 0% |
| E2E Tests (Frontend) | NO INICIADO | 0% |
| LMS Mock Server | NO INICIADO | 0% |
| IMS Validator Integration | NO INICIADO | 0% |
| Load Testing Scripts | NO INICIADO | 0% |
| Security Testing | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-LTI-005: Testing y Validacion

### User Stories
- Todas las US-LTI-00X requieren tests

### Estandar
- IMS Global LTI 1.3 Certification
- IMS LTI Advantage Validator

---

## Implementacion Existente

### Unit Tests de Entities

**Ubicacion:** `apps/backend/src/modules/lti/__tests__/lti-entities.spec.ts`

**Estado:** COMPLETO (100%)

**Tests Implementados:**
| Suite | Tests | Cobertura |
|-------|-------|-----------|
| LtiConsumer | 6 tests | 100% campos |
| LtiSession | 9 tests | 100% campos |
| LtiGradePassback | 9 tests | 100% campos |

**Validaciones Cubiertas:**
- Campos LTI 1.3 configuration
- Flags LTI Advantage
- Custom parameters JSON
- Session tracking
- Grade passback status
- Retry configuration

---

## Plan de Testing

### 1. Unit Tests (Backend)

#### 1.1 Service Tests (Faltantes)

**LtiConsumersService Tests:**
```typescript
// __tests__/lti-consumers.service.spec.ts (NUEVO)
describe('LtiConsumersService', () => {
  describe('findAll()', () => {
    it('should return only active consumers');
    it('should order by platformName ASC');
    it('should return empty array if no consumers');
  });

  describe('create()', () => {
    it('should create new consumer with all fields');
    it('should throw ConflictException on duplicate platformId+clientId');
    it('should set isActive=true and isVerified=false');
    it('should log creation');
  });

  describe('findByPlatformAndClient()', () => {
    it('should find consumer by exact platformId and clientId');
    it('should return null if not found');
    it('should only return active consumers');
  });

  describe('deactivate()', () => {
    it('should set isActive=false');
    it('should throw NotFoundException if consumer not exists');
  });

  describe('verify()', () => {
    it('should set isVerified=true');
    it('should throw NotFoundException if consumer not exists');
  });

  describe('getStats()', () => {
    it('should return correct counts for total, active, verified');
  });
});
```

**LtiSessionsService Tests:**
```typescript
// __tests__/lti-sessions.service.spec.ts (NUEVO)
describe('LtiSessionsService', () => {
  describe('create()', () => {
    it('should create session with isActive=true');
    it('should generate unique launchId');
    it('should store idTokenClaims as JSONB');
  });

  describe('findByLaunchId()', () => {
    it('should find active session by launchId');
    it('should include consumer relation');
    it('should return null for inactive sessions');
  });

  describe('endSession()', () => {
    it('should set isActive=false and endedAt');
    it('should throw NotFoundException if session not exists');
  });

  describe('cleanupExpired()', () => {
    it('should deactivate sessions older than threshold');
    it('should return count of cleaned sessions');
    it('should not touch recently active sessions');
  });
});
```

**LtiGradePassbacksService Tests:**
```typescript
// __tests__/lti-grade-passbacks.service.spec.ts (NUEVO)
describe('LtiGradePassbacksService', () => {
  describe('create()', () => {
    it('should create passback with status PENDING');
    it('should calculate scorePercentage automatically');
  });

  describe('findPending()', () => {
    it('should return only PENDING status passbacks');
    it('should order by createdAt ASC');
  });

  describe('findReadyForRetry()', () => {
    it('should return RETRYING passbacks where nextRetryAt <= now');
    it('should not return passbacks exceeding maxRetries');
  });

  describe('markSending()', () => {
    it('should update status to SENDING');
    it('should increment attemptCount');
    it('should set firstSentAt on first attempt');
    it('should update lastSentAt');
  });

  describe('markSuccess()', () => {
    it('should update status to SUCCESS');
    it('should store lmsResponse and code');
    it('should set successAt timestamp');
  });

  describe('markFailed()', () => {
    it('should update status to FAILED or RETRYING based on attemptCount');
    it('should store errorMessage');
    it('should calculate nextRetryAt with exponential backoff');
  });
});
```

### 2. Integration Tests (Backend)

**Setup con TestContainers:**
```typescript
// test/lti-integration.spec.ts (NUEVO)
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('LTI Integration Tests', () => {
  let postgresContainer: PostgreSqlContainer;
  let app: INestApplication;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('gamilit_test')
      .start();

    const moduleRef = await Test.createTestingModule({
      imports: [LtiModule, TypeOrmModule.forRoot({
        type: 'postgres',
        url: postgresContainer.getConnectionUri(),
        // ...
      })],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('Consumer Management Flow', () => {
    it('should create, verify, and deactivate consumer');
    it('should reject duplicate platformId+clientId');
    it('should support multi-tenant isolation');
  });

  describe('Session Management Flow', () => {
    it('should create session from LTI launch');
    it('should link user to session');
    it('should cleanup expired sessions');
  });

  describe('Grade Passback Flow', () => {
    it('should create passback and process through queue');
    it('should retry on failure with exponential backoff');
    it('should mark success after LMS confirms');
  });
});
```

### 3. E2E Tests (Frontend + Backend)

**Cypress E2E Tests:**
```typescript
// cypress/e2e/lti/consumer-management.cy.ts (NUEVO)
describe('LTI Consumer Management', () => {
  beforeEach(() => {
    cy.login('admin@gamilit.com');
    cy.visit('/admin/lti/consumers');
  });

  it('should display list of consumers', () => {
    cy.get('[data-testid="consumer-table"]').should('exist');
    cy.get('[data-testid="consumer-row"]').should('have.length.at.least', 1);
  });

  it('should create new Canvas consumer', () => {
    cy.get('[data-testid="add-consumer-btn"]').click();
    cy.get('[data-testid="platform-type-select"]').select('canvas');
    cy.get('[data-testid="issuer-input"]').type('https://canvas.test.edu');
    cy.get('[data-testid="client-id-input"]').type('test-client-123');
    // URLs should be auto-filled
    cy.get('[data-testid="auth-url-input"]').should(
      'have.value',
      'https://canvas.test.edu/api/lti/authorize_redirect'
    );
    cy.get('[data-testid="submit-btn"]').click();
    cy.contains('Consumer created successfully');
  });

  it('should test connection and show results', () => {
    cy.get('[data-testid="consumer-row"]').first().find('[data-testid="test-btn"]').click();
    cy.get('[data-testid="connection-test-modal"]').should('be.visible');
    cy.contains('Testing connection...');
    // Wait for result
    cy.get('[data-testid="test-result"]', { timeout: 10000 }).should('exist');
  });
});
```

### 4. LMS Mock Server

**Proposito:** Simular respuestas de Canvas/Moodle para tests sin depender de LMS reales.

```typescript
// test/mocks/lms-mock-server.ts (NUEVO)
import express from 'express';
import jwt from 'jsonwebtoken';

export function createLmsMockServer(config: LmsMockConfig) {
  const app = express();

  // JWKS Endpoint
  app.get('/api/lti/security/jwks', (req, res) => {
    res.json({
      keys: [config.publicKeyJwk],
    });
  });

  // Token Endpoint (OAuth2)
  app.post('/login/oauth2/token', (req, res) => {
    const accessToken = jwt.sign(
      { scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score' },
      config.privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );
    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    });
  });

  // AGS Score Endpoint
  app.post('/api/lti/courses/:courseId/line_items/:lineItemId/scores', (req, res) => {
    if (config.simulateError) {
      return res.status(503).json({ error: 'Service Unavailable' });
    }
    res.status(200).json({ success: true });
  });

  // Deep Linking Return
  app.post('/lti/deep_link/return', (req, res) => {
    res.status(200).json({ success: true });
  });

  return app;
}
```

### 5. IMS LTI Advantage Validator Integration

**Proposito:** Validar conformidad con estandar IMS Global.

**Pasos:**
1. Configurar GAMILIT como Tool Provider en IMS Validator
2. Ejecutar test suite de IMS
3. Documentar resultados
4. Corregir cualquier deviation

**URL Validator:** https://ltiadvantagevalidator.imsglobal.org/

**Tests a Ejecutar:**
| Test Suite | Descripcion | Prioridad |
|------------|-------------|-----------|
| Core LTI 1.3 | Login, Launch, Security | P0 |
| Deep Linking 2.0 | Content selection | P1 |
| AGS 2.0 | Grade passback | P1 |
| NRPS 2.0 | Names and roles | P2 |

### 6. Load Testing

**K6 Script:**
```javascript
// test/load/lti-launch.js (NUEVO)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 50 },   // Stay at 50 VUs
    { duration: '30s', target: 100 }, // Peak
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% requests < 3s
    http_req_failed: ['rate<0.01'],    // <1% failures
  },
};

export default function () {
  // Simulate LTI login flow
  const loginRes = http.post(`${__ENV.BASE_URL}/api/v1/lti/login`, {
    iss: 'https://canvas.test.edu',
    client_id: 'test-client',
    login_hint: `user-${__VU}`,
    target_link_uri: `${__ENV.BASE_URL}/lti/launch`,
    lti_message_hint: 'test',
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Metricas Objetivo:**
| Metrica | Target | Actual |
|---------|--------|--------|
| LTI Login p95 | <3s | TBD |
| Grade Passback p95 | <5s | TBD |
| Concurrent Users | 100 | TBD |
| Error Rate | <1% | TBD |

### 7. Security Testing

**Checklist:**
| Test | Descripcion | Estado |
|------|-------------|--------|
| JWT Signature Validation | Verificar RS256 | Pendiente |
| Nonce Replay Prevention | Mismo nonce rechazado | Pendiente |
| State CSRF Protection | State invalido = 403 | Pendiente |
| Token Expiration | JWT expirado = 401 | Pendiente |
| Tenant Isolation | Consumer A no ve datos de B | Pendiente |
| Private Key Encryption | AES-256 en reposo | Pendiente |
| HTTPS Only | HTTP rechazado | Pendiente |
| Rate Limiting | 100 req/min por IP | Pendiente |

---

## Test Environments

### Canvas Sandbox

**URL:** https://canvas.instructure.com/free-for-teacher

**Setup:**
1. Crear cuenta gratis de profesor
2. Crear curso de prueba
3. Configurar GAMILIT como External Tool
4. Ejecutar tests manuales

### Moodle Test Instance

**URL:** https://sandbox.moodledemo.net/

**Credenciales:**
- Admin: admin / sandbox
- Teacher: teacher / sandbox

### Blackboard Test

**Opciones:**
- Blackboard Developer AMI (AWS)
- Solicitar sandbox a Blackboard

---

## Flujos de Test por LMS

### Canvas Test Flow

```
1. Admin crea Consumer en GAMILIT
   - Platform: Canvas
   - Issuer: https://canvas.test.edu
   - Client ID: [from Canvas Developer Keys]

2. Admin configura External Tool en Canvas
   - Settings → Developer Keys → Add LTI Key
   - Configure with GAMILIT launch URL
   - Enable Deep Linking, AGS

3. Teacher crea assignment en Canvas
   - Uses GAMILIT as external tool
   - Deep linking selecciona ejercicio

4. Student accede a assignment
   - Click "GAMILIT" → LTI Launch
   - OIDC login flow → auto-login
   - Completa ejercicio → score enviado a Canvas
```

### Moodle Test Flow

```
1. Admin crea Consumer en GAMILIT
   - Platform: Moodle
   - Issuer: https://moodle.test.edu

2. Admin configura External Tool en Moodle
   - Site admin → Plugins → External Tool → Manage tools
   - Configure tipo LTI 1.3
   - Registrar public key de GAMILIT

3. Teacher agrega actividad LTI
   - Add activity → External Tool
   - Selecciona GAMILIT
   - Content-Item Request para deep linking

4. Student accede a actividad
   - Similar a Canvas flow
```

---

## Criterios de Aceptacion

### Code Coverage
- [ ] Unit tests: >80% coverage en services
- [ ] Integration tests: >70% coverage en flows
- [ ] E2E tests: Happy paths cubiertos

### LMS Compatibility
- [ ] Canvas: 100% tests passing
- [ ] Moodle: 100% tests passing
- [ ] Blackboard: 80% tests passing

### Performance
- [ ] Login flow <3s (p95)
- [ ] Grade passback <5s (p95)
- [ ] 100 concurrent users sin degradacion

### Security
- [ ] 0 vulnerabilidades criticas
- [ ] 0 vulnerabilidades altas
- [ ] IMS Validator passing

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| Service Unit Tests | 8h |
| Controller Unit Tests | 4h |
| Integration Tests | 10h |
| E2E Tests (Cypress) | 12h |
| LMS Mock Server | 6h |
| IMS Validator Setup | 4h |
| Load Testing | 4h |
| Security Testing | 6h |
| Documentation | 4h |
| **Total** | **58h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-LTI-004-testing-validation.md*
*Generado: 2026-01-27*
