# TEMPLATE: Integracion Externa

**Version:** 1.0.0
**Proposito:** Template para documentar integraciones con servicios externos
**Referencia:** SIMCO-INTEGRACIONES-EXTERNAS.md
**Creado:** 2026-01-10

---

## Instrucciones de Uso

1. Copiar este template a `/docs/02-integraciones/` (o ubicacion equivalente)
2. Nombrar archivo: `INT-{NNN}-{nombre-proveedor}.md`
3. Reemplazar todos los placeholders `{...}`
4. Eliminar secciones que no apliquen
5. Mantener actualizado con cada cambio en la integracion

---

## Template

```markdown
# INT-{NNN}: {Nombre de la Integracion}

## Metadata

| Campo | Valor |
|-------|-------|
| **Codigo** | INT-{NNN} |
| **Proveedor** | {Nombre del proveedor} |
| **Tipo** | {Pagos|Auth|Notificaciones|Storage|Analytics|CRM|Comunicacion} |
| **Estado** | {Implementado|Documentado|En Desarrollo|Pendiente|Deprecado} |
| **Multi-tenant** | {Si|No} |
| **Fecha integracion** | {YYYY-MM-DD} |
| **Ultimo update** | {YYYY-MM-DD} |
| **Owner** | {Equipo/Persona responsable} |

---

## 1. Descripcion

{Parrafo explicando el proposito de esta integracion, que problema resuelve
y en que partes del sistema se utiliza.}

**Caso de uso principal:**
- {Caso de uso 1}
- {Caso de uso 2}

---

## 2. Credenciales Requeridas

### Variables de Entorno

| Variable | Descripcion | Tipo | Obligatorio |
|----------|-------------|------|-------------|
| `{PROVIDER}_API_KEY` | API Key para autenticacion | string | SI |
| `{PROVIDER}_SECRET` | Secret para firma de requests | string | SI |
| `{PROVIDER}_WEBHOOK_SECRET` | Secret para validar webhooks | string | NO |
| `{PROVIDER}_ENVIRONMENT` | Ambiente (sandbox/production) | string | SI |

### Ejemplo de .env

```env
# {Proveedor}
{PROVIDER}_API_KEY=pk_test_xxxxxxxxxxxx
{PROVIDER}_SECRET=sk_test_xxxxxxxxxxxx
{PROVIDER}_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
{PROVIDER}_ENVIRONMENT=sandbox
```

### Obtencion de Credenciales

1. Crear cuenta en {URL del dashboard del proveedor}
2. Navegar a Settings → API Keys
3. Generar par de llaves (test y production)
4. Configurar webhook URL: `{URL_BASE}/webhooks/{provider}`

---

## 3. Endpoints/SDK Utilizados

### Operaciones Implementadas

| Operacion | Metodo | Endpoint/SDK | Descripcion |
|-----------|--------|--------------|-------------|
| {Crear recurso} | POST | `/v1/{resource}` | {Descripcion} |
| {Obtener recurso} | GET | `/v1/{resource}/:id` | {Descripcion} |
| {Listar recursos} | GET | `/v1/{resource}` | {Descripcion} |
| {Actualizar recurso} | PUT | `/v1/{resource}/:id` | {Descripcion} |
| {Eliminar recurso} | DELETE | `/v1/{resource}/:id` | {Descripcion} |

### SDK/Cliente Utilizado

```typescript
// Dependencia npm
import { ProviderClient } from '{provider-sdk}';

// Inicializacion
const client = new ProviderClient(process.env.{PROVIDER}_API_KEY);
```

---

## 4. Rate Limits

| Limite | Valor | Periodo | Accion si excede |
|--------|-------|---------|------------------|
| Requests totales | {N} | por minuto | 429 + Retry-After header |
| Requests por IP | {N} | por segundo | Backoff exponencial |
| Batch operations | {N} | por request | Split en multiples calls |

### Estrategia de Retry

```typescript
// Backoff exponencial implementado
const delays = [1000, 2000, 4000]; // ms
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    return await client.call(request);
  } catch (error) {
    if (error.status === 429) {
      await sleep(delays[attempt]);
      continue;
    }
    throw error;
  }
}
```

---

## 5. Manejo de Errores

### Codigos de Error

| Codigo | Descripcion | Accion Recomendada | Retry |
|--------|-------------|-------------------|-------|
| 400 | Bad Request - Parametros invalidos | Validar input | NO |
| 401 | Unauthorized - Credenciales invalidas | Verificar API key | NO |
| 403 | Forbidden - Sin permisos | Verificar scopes | NO |
| 404 | Not Found - Recurso no existe | Verificar ID | NO |
| 429 | Rate Limited | Esperar Retry-After | SI |
| 500 | Server Error | Retry con backoff | SI (3x) |
| 502 | Bad Gateway | Retry con backoff | SI (2x) |
| 503 | Service Unavailable | Retry con backoff | SI (5x) |

### Ejemplo de Manejo

```typescript
try {
  const result = await providerService.createResource(data);
  return result;
} catch (error) {
  logger.error('Provider error', {
    service: '{provider}',
    operation: 'createResource',
    code: error.code,
    message: error.message,
    tenantId: context.tenantId,
  });

  if (isRetryable(error)) {
    return await retryWithBackoff(() => providerService.createResource(data));
  }

  throw new IntegrationException('{provider}', error);
}
```

---

## 6. Fallbacks

### Estrategia de Fallback

| Escenario | Fallback | Tiempo maximo |
|-----------|----------|---------------|
| {Servicio caido} | {Cola para reintentar} | {N horas} |
| {Rate limited} | {Throttle local} | {N minutos} |
| {Timeout} | {Cache local} | {N segundos} |

### Modo Degradado

{Describir como funciona el sistema si esta integracion falla.
Que features se desactivan? Que alternativas hay?}

---

## 7. Multi-tenant

### Modelo de Credenciales

- [ ] **Global:** Una credencial para todos los tenants
- [ ] **Por Tenant:** Cada tenant configura sus credenciales
- [ ] **Hibrido:** Global con override por tenant

### Almacenamiento

```sql
-- Si credenciales por tenant
CREATE TABLE tenant_integrations (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    provider VARCHAR(50) DEFAULT '{provider}',
    credentials JSONB NOT NULL, -- Encriptado con tenant_key
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, provider)
);
```

### Contexto en Llamadas

```typescript
// Obtener credenciales segun tenant
const credentials = await credentialsService.get(
  tenantId,
  '{provider}'
);

const client = new ProviderClient(credentials.apiKey);
```

---

## 8. Webhooks (si aplica)

### Endpoints Registrados

| Evento | Endpoint Local | Descripcion |
|--------|----------------|-------------|
| `{event.created}` | `/webhooks/{provider}/created` | {Descripcion} |
| `{event.updated}` | `/webhooks/{provider}/updated` | {Descripcion} |
| `{event.deleted}` | `/webhooks/{provider}/deleted` | {Descripcion} |

### Validacion de Webhooks

```typescript
// Verificar firma del webhook
function verifyWebhook(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.{PROVIDER}_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Registro en Proveedor

1. Dashboard → Settings → Webhooks
2. URL: `https://{domain}/webhooks/{provider}`
3. Eventos: {lista de eventos suscritos}
4. Secret: Copiar a `{PROVIDER}_WEBHOOK_SECRET`

---

## 9. Testing

### Modo Sandbox/Test

| Ambiente | Credenciales | Datos |
|----------|--------------|-------|
| Sandbox | `pk_test_*` / `sk_test_*` | Datos ficticios |
| Production | `pk_live_*` / `sk_live_*` | Datos reales |

### Datos de Prueba

```
# Tarjeta de prueba (si aplica)
Numero: 4242 4242 4242 4242
Exp: 12/28
CVV: 123

# Usuario de prueba
Email: test@{provider}.com
Password: test123
```

### Comandos de Test

```bash
# Test de conexion
npm run test:integration -- --grep "{provider}"

# Test de webhook
curl -X POST http://localhost:3000/webhooks/{provider} \
  -H "Content-Type: application/json" \
  -H "X-Signature: {test_signature}" \
  -d '{"event": "test"}'
```

---

## 10. Monitoreo

### Metricas a Monitorear

| Metrica | Descripcion | Alerta |
|---------|-------------|--------|
| Latencia | Tiempo de respuesta promedio | > 2s |
| Error Rate | % de requests fallidos | > 5% |
| Rate Limit Usage | % del limite usado | > 80% |
| Webhook Delay | Tiempo entre evento y recepcion | > 30s |

### Logs Estructurados

```typescript
logger.info('Provider call', {
  service: '{provider}',
  operation: '{operation}',
  duration: durationMs,
  tenantId: context.tenantId,
  resourceId: result.id,
  success: true,
});
```

---

## 11. Referencias

### Documentacion Oficial
- [API Reference]({url_documentacion})
- [SDK Documentation]({url_sdk})
- [Changelog]({url_changelog})

### Modulos Relacionados
- [Modulo Backend](../../apps/backend/src/modules/{modulo}/)
- [Servicio](../../apps/backend/src/modules/{modulo}/{provider}.service.ts)
- [DTOs](../../apps/backend/src/modules/{modulo}/dto/)

### Soporte
- Email: support@{provider}.com
- Dashboard: {url_dashboard}

---

**Ultima actualizacion:** {YYYY-MM-DD}
**Autor:** {nombre/equipo}
```

---

**Referencia:** SIMCO-INTEGRACIONES-EXTERNAS.md
