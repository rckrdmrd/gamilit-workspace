# SIMCO-INTEGRACIONES-EXTERNAS
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P1
**Alias:** @INTEGRACIONES
**Creado:** 2026-01-10

---

## 1. Proposito

Establecer el estandar para documentar y manejar integraciones con APIs y servicios externos, incluyendo credenciales, rate limits, manejo de errores y consideraciones multi-tenant.

---

## 2. Cuando Usar Esta Directiva

### 2.1 Aplica Para

- APIs de terceros (Stripe, Twilio, SendGrid, etc.)
- Servicios cloud externos (AWS S3, Google Cloud, etc.)
- OAuth providers (Google, Facebook, Apple, etc.)
- Servicios de pago (PayPal, MercadoPago, etc.)
- Servicios de notificacion (WhatsApp, SMS, Push)
- Cualquier servicio fuera del control del proyecto

### 2.2 NO Aplica Para

- Microservicios internos del mismo proyecto
- Base de datos propias
- Cache interno (Redis propio)
- APIs entre aplicaciones del mismo workspace

---

## 3. Estructura de Documentacion

### 3.1 Archivo de Integracion

Ubicacion: `/docs/02-integraciones/INT-{NNN}-{nombre}.md`

### 3.2 Template Completo

```markdown
# INT-{NNN}: {Nombre Integracion}

## Metadata
| Campo | Valor |
|-------|-------|
| Codigo | INT-{NNN} |
| Proveedor | {Nombre proveedor} |
| Tipo | {Pagos|Auth|Notificaciones|Storage|Analytics|etc} |
| Estado | {Implementado|Documentado|Pendiente} |
| Multi-tenant | {Si|No} |
| Fecha integracion | {YYYY-MM-DD} |

---

## Descripcion
{Proposito de la integracion y caso de uso}

## Credenciales Requeridas

| Variable de Entorno | Descripcion | Obligatorio |
|---------------------|-------------|-------------|
| {PROVIDER}_API_KEY | API Key principal | SI |
| {PROVIDER}_SECRET | Secret para firma | SI |
| {PROVIDER}_WEBHOOK_SECRET | Secret para webhooks | NO |

## Endpoints/SDK Utilizados

| Operacion | Endpoint/Metodo | Descripcion |
|-----------|-----------------|-------------|
| Crear recurso | POST /v1/resource | {descripcion} |
| Obtener estado | GET /v1/resource/:id | {descripcion} |

## Rate Limits

| Limite | Valor | Accion si excede |
|--------|-------|------------------|
| Requests/min | {N} | Retry con backoff |
| Requests/dia | {N} | Cola de espera |

## Manejo de Errores

| Codigo | Descripcion | Accion |
|--------|-------------|--------|
| 400 | Bad Request | Log + retry NO |
| 401 | Unauthorized | Refrescar token |
| 429 | Rate Limited | Backoff exponencial |
| 500 | Server Error | Retry 3 veces |

## Fallbacks

- {Estrategia si servicio no disponible}
- {Servicio alternativo si aplica}
- {Modo degradado}

## Multi-tenant

{Como se maneja en contexto multi-tenant}
- Credenciales por tenant vs globales
- Configuracion por tenant
- Limites por tenant

## Webhooks (si aplica)

| Evento | Endpoint | Descripcion |
|--------|----------|-------------|
| {event.type} | /webhooks/{provider} | {que hace} |

## Testing

### Sandbox/Test Mode
{Como probar sin afectar produccion}

### Comandos de Test
```bash
{comando para probar integracion}
```

## Monitoreo

| Metrica | Descripcion | Alerta |
|---------|-------------|--------|
| Latencia | Tiempo de respuesta | >2s |
| Errores | % de errores | >5% |
| Rate limit | % usado | >80% |

## Referencias
- [Documentacion oficial]({url})
- [Modulo backend](../apps/backend/src/modules/{modulo}/)
- [Variables de entorno](../.env.example)

---

**Ultima actualizacion:** {YYYY-MM-DD}
```

---

## 4. Credenciales y Seguridad

### 4.1 Manejo de Credenciales

**NUNCA** en codigo fuente:
- API keys
- Secrets
- Tokens
- Contraseñas

**SIEMPRE** en variables de entorno:

```env
# .env (NUNCA commitear)
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
```

### 4.2 Naming de Variables

```
{PROVIDER}_{TIPO}

Ejemplos:
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
TWILIO_ACCOUNT_SID
SENDGRID_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### 4.3 Rotacion de Credenciales

| Tipo | Frecuencia Rotacion | Metodo |
|------|---------------------|--------|
| API Keys | Trimestral | Generar nueva, actualizar, revocar vieja |
| Secrets | Trimestral | Igual que API Keys |
| OAuth tokens | Automatica | Refresh token |

---

## 5. Rate Limits y Throttling

### 5.1 Estrategia de Backoff

```typescript
// Ejemplo de exponential backoff
async function callWithRetry(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```

### 5.2 Monitoreo de Rate Limits

```typescript
// Headers comunes de rate limit
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

// Log cuando se acerca al limite
if (remaining < limit * 0.2) {
  logger.warn(`Rate limit warning: ${remaining}/${limit} remaining`);
}
```

---

## 6. Manejo de Errores

### 6.1 Categorias de Error

| Categoria | Accion | Retry |
|-----------|--------|-------|
| Cliente (4xx) | Log, no retry | NO |
| Rate Limit (429) | Backoff, retry | SI |
| Servidor (5xx) | Log, retry | SI (limitado) |
| Timeout | Log, retry | SI (1 vez) |
| Network | Log, retry | SI (con delay) |

### 6.2 Error Handling Pattern

```typescript
try {
  const result = await externalService.call();
  return result;
} catch (error) {
  // Log con contexto
  logger.error('External service error', {
    service: 'stripe',
    operation: 'createPayment',
    error: error.message,
    code: error.code,
    tenantId: context.tenantId,
  });

  // Decidir accion segun tipo
  if (isRetryable(error)) {
    return await retryWithBackoff(() => externalService.call());
  }

  // Fallback o propagar
  throw new ExternalServiceException(error);
}
```

---

## 7. Multi-tenant Considerations

### 7.1 Modelos de Credenciales

| Modelo | Descripcion | Uso |
|--------|-------------|-----|
| Global | Una credencial para todos | Servicios internos |
| Por Tenant | Cada tenant sus credenciales | Pagos, integraciones cliente |
| Hibrido | Global con override por tenant | Notificaciones |

### 7.2 Almacenamiento de Credenciales por Tenant

```sql
CREATE TABLE tenant_integrations (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    provider VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL, -- Encriptado
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 Contexto de Tenant en Llamadas

```typescript
async function callExternalApi(tenantId: UUID, request: Request) {
  const credentials = await credentialsService.getForTenant(tenantId, 'stripe');

  const client = new StripeClient(credentials.apiKey);
  return client.call(request);
}
```

---

## 8. Variables de Entorno

### 8.1 .env.example

```env
# ========================================
# INTEGRACIONES EXTERNAS
# ========================================

# Stripe (Pagos)
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@example.com

# AWS S3 (Storage)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=my-bucket
AWS_REGION=us-east-1

# WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_ACCESS_TOKEN=xxxxx
```

---

## 9. Testing de Integraciones

### 9.1 Modos de Test

| Proveedor | Modo Test | Credenciales |
|-----------|-----------|--------------|
| Stripe | Test mode | sk_test_xxx |
| Twilio | Test credentials | Test SID |
| SendGrid | Sandbox | Sandbox API key |
| MercadoPago | Sandbox | Test access token |

### 9.2 Mocking para Tests

```typescript
// Mock de servicio externo
jest.mock('./stripe.client', () => ({
  StripeClient: jest.fn().mockImplementation(() => ({
    createPayment: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded'
    })
  }))
}));
```

### 9.3 Integration Tests con Sandbox

```typescript
describe('Stripe Integration', () => {
  beforeAll(() => {
    // Usar credenciales de test
    process.env.STRIPE_API_KEY = 'sk_test_xxx';
  });

  it('should create payment intent', async () => {
    const result = await stripeService.createPaymentIntent({
      amount: 1000,
      currency: 'mxn'
    });

    expect(result.status).toBe('requires_payment_method');
  });
});
```

---

## 10. Registro en Inventario

### 10.1 MASTER_INVENTORY.yml

```yaml
integraciones:
  - nombre: "Stripe"
    proveedor: "Stripe Inc"
    tipo: "pagos"
    estado: "activo"
    multi_tenant: true
    documentacion: "docs/02-integraciones/INT-001-stripe.md"

  - nombre: "Twilio"
    proveedor: "Twilio"
    tipo: "sms"
    estado: "activo"
    multi_tenant: false
    documentacion: "docs/02-integraciones/INT-002-twilio.md"
```

---

## 11. Referencias

| Directiva | Proposito |
|-----------|-----------|
| TEMPLATE-INTEGRACION-EXTERNA.md | Template de documentacion |
| SIMCO-BACKEND.md | Modulos de integracion |
| SIMCO-INVENTARIOS.md | Registro en inventario |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
