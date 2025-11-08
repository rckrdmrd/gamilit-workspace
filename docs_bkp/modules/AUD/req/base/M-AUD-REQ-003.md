
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-AUD-003 -->
<!-- ID Nuevo: M-AUD-REQ-003 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-AUD-REQ-003: Niveles de Logging y Configuración Dinámica

**ID:** RF-AUD-003
**Título:** Sistema de Logging con Niveles Configurables
**Módulo:** 08-auditoria-configuracion
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el sistema de logging multinivel para la plataforma Gamilit, permitiendo registrar eventos del sistema con diferentes grados de detalle según el nivel configurado. El sistema soporta cambio dinámico de niveles sin reiniciar servicios, facilitando debugging en producción.

El sistema permite:
- 5 niveles de logging (ERROR, WARN, INFO, DEBUG, TRACE)
- Configuración dinámica por módulo/servicio
- Rotación automática de archivos
- Structured logging (JSON)
- Búsqueda y filtrado eficiente
- Integración con herramientas de monitoreo

---

## 🎯 Objetivos

1. **Registrar eventos relevantes** para debugging y auditoría
2. **Controlar verbosidad** según ambiente (dev vs prod)
3. **Facilitar troubleshooting** con logs estructurados
4. **Optimizar almacenamiento** con rotación automática
5. **Permitir análisis** con herramientas externas (ELK, Datadog)

---

## ✅ Requerimientos Funcionales

### M-AUD-REQ-003-01: Niveles de Logging

**Descripción:** 5 niveles jerárquicos de logging, de menor a mayor verbosidad.

#### Nivel 1: ERROR (Más Crítico)

**Propósito:** Errores que requieren atención inmediata.

**Cuándo usar:**
- Excepciones no manejadas que causan fallo de operación
- Errores que afectan funcionalidad crítica
- Fallos de conexión a servicios esenciales (DB, cache)
- Pérdida de datos o corrupción

**NO usar para:**
- Errores esperados y manejados (validación de usuario)
- Errores recuperables automáticamente

**Ejemplos:**
```typescript
logger.error('Database connection lost', {
  error: err.message,
  stack: err.stack,
  connection: 'postgres-prod'
});

logger.error('Failed to process payment', {
  userId: user.id,
  amount: payment.amount,
  error: 'Gateway timeout',
  transactionId: tx.id
});
```

**Características:**
- Siempre se registra (no se puede desactivar)
- Genera alerta automática (ver RF-AUD-002)
- Incluye stack trace completo
- Almacenamiento: 90 días mínimo

#### Nivel 2: WARN (Advertencia)

**Propósito:** Eventos potencialmente problemáticos que no impiden operación.

**Cuándo usar:**
- Uso de funcionalidad deprecated
- Acercándose a límites (storage 80%, rate limit 90%)
- Configuración subóptima detectada
- Fallback ejecutado exitosamente
- Reintentos antes de fallar definitivamente

**Ejemplos:**
```typescript
logger.warn('Storage approaching limit', {
  current: '85GB',
  limit: '100GB',
  percentage: 85
});

logger.warn('Using deprecated API endpoint', {
  endpoint: '/api/v1/users',
  replacement: '/api/v2/users',
  deprecationDate: '2026-01-01',
  userId: user.id
});

logger.warn('Slow query detected', {
  query: 'SELECT * FROM users...',
  duration: 2500, // ms
  threshold: 2000
});
```

**Características:**
- Puede generar alerta si se repite frecuentemente
- No incluye stack trace por defecto
- Almacenamiento: 30 días

#### Nivel 3: INFO (Informativo)

**Propósito:** Eventos importantes del flujo normal de la aplicación.

**Cuándo usar:**
- Inicio/cierre de aplicación
- Cambios de estado importantes (usuario registrado, ejercicio completado)
- Operaciones significativas (backup iniciado, migration ejecutada)
- Métricas de negocio (100 usuarios registrados hoy)
- Configuración cargada

**Ejemplos:**
```typescript
logger.info('User registered successfully', {
  userId: user.id,
  email: user.email.substring(0, 3) + '***', // Ofuscado
  provider: 'google',
  role: 'student'
});

logger.info('Exercise completed', {
  userId: user.id,
  exerciseId: exercise.id,
  score: result.score,
  timeSpent: result.duration,
  difficulty: exercise.difficulty
});

logger.info('Application started', {
  environment: 'production',
  version: '1.2.3',
  nodeVersion: process.version,
  port: 3000
});
```

**Características:**
- Nivel recomendado para producción
- Balance entre visibilidad y ruido
- Almacenamiento: 14 días

#### Nivel 4: DEBUG (Debugging)

**Propósito:** Información detallada para debugging durante desarrollo.

**Cuándo usar:**
- Valores de variables en puntos clave
- Flujo de ejecución detallado
- Resultados de validaciones
- Parámetros de funciones importantes
- Estado de objetos complejos

**NO usar en producción** (excepto temporalmente para troubleshooting)

**Ejemplos:**
```typescript
logger.debug('Validating user input', {
  field: 'email',
  value: data.email,
  rules: ['required', 'email', 'max:255']
});

logger.debug('Cache miss, fetching from database', {
  key: cacheKey,
  ttl: 3600
});

logger.debug('Processing image variants', {
  originalSize: image.size,
  variants: ['thumbnail', 'small', 'medium', 'large'],
  format: 'webp'
});
```

**Características:**
- Puede generar gran volumen de logs
- Solo en desarrollo o debugging temporal en prod
- Almacenamiento: 7 días

#### Nivel 5: TRACE (Máximo Detalle)

**Propósito:** Información extremadamente detallada, cada paso de ejecución.

**Cuándo usar:**
- Debugging muy específico
- Troubleshooting de bugs complejos
- Análisis de performance detallado
- Auditoría completa de una operación

**NO usar en producción** excepto para debugging muy específico (por módulo)

**Ejemplos:**
```typescript
logger.trace('Entering function calculateScore', {
  params: { answers, exercise }
});

logger.trace('SQL query execution', {
  query: sql,
  params: params,
  duration: 15 // ms
});

logger.trace('Leaving function calculateScore', {
  result: score,
  duration: 45 // ms
});
```

**Características:**
- Volumen extremadamente alto
- Solo para debugging crítico
- Almacenamiento: 24 horas

---

### M-AUD-REQ-003-02: Formato de Logs Estructurados

**Descripción:** Logs en formato JSON para fácil parsing y análisis.

**Estructura Estándar:**

```json
{
  "timestamp": "2025-11-07T10:30:45.123Z",
  "level": "error",
  "message": "Database connection lost",
  "context": {
    "service": "backend",
    "module": "database",
    "environment": "production",
    "hostname": "backend-prod-1",
    "processId": 12345,
    "userId": "uuid-user-123", // Si está disponible
    "requestId": "uuid-request-456", // Para trazar requests
    "sessionId": "uuid-session-789"
  },
  "metadata": {
    "connection": "postgres-prod",
    "error": "Connection timeout",
    "retryAttempt": 3
  },
  "stack": "Error: Connection timeout\n    at Database.connect...",
  "tags": ["database", "critical", "infrastructure"]
}
```

**Campos Obligatorios:**
- `timestamp`: ISO 8601 con milisegundos
- `level`: Nivel del log (error, warn, info, debug, trace)
- `message`: Descripción legible del evento
- `context.service`: Servicio que generó el log
- `context.environment`: dev, staging, production

**Campos Opcionales:**
- `metadata`: Objeto con datos adicionales relevantes
- `stack`: Stack trace (solo para ERROR)
- `tags`: Array de strings para categorización
- `userId`, `requestId`, `sessionId`: Para trazabilidad

---

### M-AUD-REQ-003-03: Configuración de Niveles por Módulo

**Descripción:** Configurar nivel de logging independiente por módulo/servicio.

**Configuración Global:**

```yaml
# config/logging.yml
logging:
  default_level: info  # Nivel por defecto

  levels:
    # Backend modules
    backend.auth: info
    backend.gamification: info
    backend.exercises: debug  # Temporalmente en debug
    backend.media: warn

    # Workers
    worker.media-processing: info
    worker.notifications: info

    # Database
    database.queries: warn  # Solo slow queries
    database.migrations: info

    # External integrations
    integrations.oauth: info
    integrations.payment: error  # Solo errores críticos
    integrations.email: warn

  outputs:
    console:
      enabled: true
      format: pretty  # pretty | json
    file:
      enabled: true
      path: /var/log/gamilit
      rotation: daily
      maxFiles: 30
    external:
      enabled: true
      service: datadog  # datadog | elasticsearch | cloudwatch
```

**Configuración Dinámica (Sin Reinicio):**

```typescript
// Cambiar nivel en runtime via API
POST /api/admin/logging/level
{
  "module": "backend.exercises",
  "level": "trace",
  "duration": 3600  // Revertir a default después de 1 hora
}

// Cambiar temporalmente para debugging
POST /api/admin/logging/debug-mode
{
  "userId": "user-123",  // Logs TRACE solo para este usuario
  "duration": 600  // 10 minutos
}
```

---

### M-AUD-REQ-003-04: Rotación y Retención de Archivos

**Descripción:** Gestión automática de archivos de log para optimizar almacenamiento.

**Estrategia de Rotación:**

#### Por Tamaño
```yaml
rotation:
  max_size: 100MB  # Rotar cuando archivo alcanza 100MB
  max_files: 10    # Mantener últimos 10 archivos
  compress: true   # Comprimir archivos rotados (gzip)
```

Ejemplo de archivos:
```
/var/log/gamilit/
├── application.log          (actual, 45MB)
├── application.log.1.gz     (100MB compressed)
├── application.log.2.gz     (100MB compressed)
├── application.log.3.gz     (100MB compressed)
...
└── application.log.10.gz    (100MB compressed)
```

#### Por Tiempo (Diario)
```yaml
rotation:
  interval: daily  # Rotar diariamente a medianoche
  max_files: 30    # Mantener últimos 30 días
  compress: true
```

Ejemplo de archivos:
```
/var/log/gamilit/
├── application-2025-11-07.log     (hoy)
├── application-2025-11-06.log.gz  (ayer)
├── application-2025-11-05.log.gz
...
└── application-2025-10-08.log.gz  (30 días atrás)
```

**Retención por Nivel:**

| Nivel | Retención | Compresión | Prioridad |
|-------|-----------|------------|-----------|
| ERROR | 90 días | Después de 7 días | Alta |
| WARN | 30 días | Después de 7 días | Media |
| INFO | 14 días | Después de 3 días | Media |
| DEBUG | 7 días | Inmediata | Baja |
| TRACE | 24 horas | No (se eliminan) | Mínima |

**Limpieza Automática:**

```typescript
// Cron job diario
async function cleanupOldLogs() {
  const rules = [
    { level: 'trace', olderThan: 1 }, // días
    { level: 'debug', olderThan: 7 },
    { level: 'info', olderThan: 14 },
    { level: 'warn', olderThan: 30 },
    { level: 'error', olderThan: 90 }
  ];

  for (const rule of rules) {
    await deleteLogsOlderThan(rule.level, rule.olderThan);
  }
}
```

---

### M-AUD-REQ-003-05: Contexto de Request (Request ID)

**Descripción:** Trazabilidad completa de requests HTTP con ID único.

**Flujo de Request ID:**

```
┌─────────┐
│ Cliente │ Request
└────┬────┘
     │ X-Request-ID: abc-123 (o generado)
     ▼
┌─────────┐
│ Gateway │ Agrega/valida Request ID
└────┬────┘
     │ Propaga Request ID en headers
     ▼
┌─────────┐
│ Backend │ Todos los logs incluyen Request ID
└────┬────┘
     │ Propaga a llamadas internas
     ▼
┌─────────┐
│Database │ Queries incluyen Request ID en comentarios
└────┬────┘
     │
     ▼
┌─────────┐
│  Logs   │ Filtrar/buscar por Request ID
└─────────┘
```

**Ejemplo de Logs con Request ID:**

```json
// Request inicial
{
  "timestamp": "2025-11-07T10:30:00.000Z",
  "level": "info",
  "message": "Incoming request",
  "context": {
    "requestId": "req-abc-123",
    "userId": "user-456",
    "method": "POST",
    "path": "/api/exercises/complete",
    "ip": "192.168.1.1"
  }
}

// Log intermedio (validación)
{
  "timestamp": "2025-11-07T10:30:00.050Z",
  "level": "debug",
  "message": "Validating exercise completion",
  "context": {
    "requestId": "req-abc-123",  // ← Mismo Request ID
    "userId": "user-456",
    "exerciseId": "ex-789"
  }
}

// Log final (respuesta)
{
  "timestamp": "2025-11-07T10:30:00.250Z",
  "level": "info",
  "message": "Request completed",
  "context": {
    "requestId": "req-abc-123",  // ← Mismo Request ID
    "statusCode": 200,
    "duration": 250  // ms
  }
}
```

**Búsqueda por Request ID:**
```bash
# Obtener todos los logs de un request específico
cat application.log | grep "req-abc-123" | jq .

# En herramientas de logging (Datadog, ELK)
requestId:"req-abc-123"
```

---

### M-AUD-REQ-003-06: Logs Sensibles y Ofuscación

**Descripción:** Proteger información sensible en logs.

**Datos Sensibles que NO deben loguearse:**
- Passwords (incluso hasheados)
- Tokens de acceso completos
- Números de tarjeta de crédito
- Datos personales completos (GDPR)
- API keys

**Estrategias de Ofuscación:**

#### 1. Email Parcial
```typescript
// ❌ MAL
logger.info('User logged in', { email: 'user@example.com' });

// ✅ BIEN
logger.info('User logged in', {
  email: 'u***@example.com'  // Ofuscar usuario
});
```

#### 2. Token Truncado
```typescript
// ❌ MAL
logger.info('Auth token refreshed', { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' });

// ✅ BIEN
logger.info('Auth token refreshed', {
  tokenPrefix: 'eyJhbG...',  // Solo primeros 8 caracteres
  userId: user.id
});
```

#### 3. Redacción Automática
```typescript
import { redactSensitiveData } from './logger-utils';

const logData = {
  user: {
    email: 'user@example.com',
    password: 'secret123',  // ← Se eliminará automáticamente
    creditCard: '4111-1111-1111-1111'  // ← Se eliminará automáticamente
  }
};

logger.info('User data', redactSensitiveData(logData));
// Resultado:
// {
//   user: {
//     email: 'u***@example.com',
//     password: '[REDACTED]',
//     creditCard: '[REDACTED]'
//   }
// }
```

**Lista de Campos Auto-Redactados:**
- `password`, `pwd`, `passwd`
- `token`, `accessToken`, `refreshToken`
- `apiKey`, `secret`, `privateKey`
- `creditCard`, `cardNumber`, `cvv`
- `ssn`, `taxId`

---

### M-AUD-REQ-003-07: Performance y Logs Asíncronos

**Descripción:** Logs no bloquean operaciones críticas.

**Estrategia:**

#### 1. Buffer en Memoria
```typescript
class AsyncLogger {
  private buffer: LogEntry[] = [];
  private flushInterval = 5000; // 5 segundos

  log(entry: LogEntry) {
    // Agregar a buffer (operación sincrónica rápida)
    this.buffer.push(entry);

    // Si buffer lleno, flush inmediato
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  private async flush() {
    const entries = this.buffer.splice(0, this.buffer.length);

    // Escritura asíncrona (no bloquea)
    await Promise.all([
      this.writeToFile(entries),
      this.sendToExternal(entries)
    ]);
  }
}
```

#### 2. Logs Críticos Síncronos
```typescript
// ERROR y FATAL se escriben inmediatamente (síncrono)
if (level === 'error' || level === 'fatal') {
  await this.writeImmediately(entry);
} else {
  // Otros niveles: asíncrono con buffer
  this.buffer.push(entry);
}
```

**Impacto en Performance:**
- Logging asíncrono: <0.1ms overhead
- Logging síncrono (ERROR): <5ms overhead

---

## 📊 Métricas de Logging

### Métricas a Monitorear

**Volumen de Logs:**
- Logs/segundo por nivel
- Logs/hora por módulo
- Tamaño total de archivos

**Distribución por Nivel:**
```
Target para Producción:
- ERROR:  <1%
- WARN:   <5%
- INFO:   ~90%
- DEBUG:  ~4%
- TRACE:  0% (deshabilitado)
```

**Alertas:**
- Spike de ERRORs (>10/minuto)
- Aumento súbito de logs (posible loop)
- Disco >90% lleno

---

## 🧪 Casos de Prueba

### Test 1: Niveles Jerárquicos

```typescript
test('Logger respects hierarchical levels', () => {
  logger.setLevel('warn');

  logger.error('Error message');   // ✅ Debe registrarse
  logger.warn('Warning message');  // ✅ Debe registrarse
  logger.info('Info message');     // ❌ NO debe registrarse
  logger.debug('Debug message');   // ❌ NO debe registrarse

  const logs = getWrittenLogs();
  expect(logs).toHaveLength(2);
  expect(logs[0].level).toBe('error');
  expect(logs[1].level).toBe('warn');
});
```

### Test 2: Cambio Dinámico de Nivel

```typescript
test('Change log level dynamically', async () => {
  logger.setLevel('info');

  logger.debug('Should not appear');  // ❌ No se registra

  // Cambiar a debug
  await logger.setLevel('debug');

  logger.debug('Should appear');  // ✅ Ahora sí se registra

  const logs = getWrittenLogs();
  expect(logs.find(l => l.message === 'Should appear')).toBeDefined();
});
```

### Test 3: Redacción de Datos Sensibles

```typescript
test('Redact sensitive data automatically', () => {
  const data = {
    email: 'user@example.com',
    password: 'secret123',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...'
  };

  logger.info('User data', data);

  const logs = getWrittenLogs();
  const logData = logs[0].metadata;

  expect(logData.password).toBe('[REDACTED]');
  expect(logData.token).toMatch(/^eyJhbG\.\.\./);  // Truncado
  expect(logData.email).toMatch(/u\*\*\*/);  // Ofuscado
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `audit_logging.log_levels` - Configuración de niveles por módulo
- `audit_logging.log_entries` - Almacenamiento opcional en DB
- `system_configuration.logging_config` - Configuración global

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-AUD-003: Niveles de Logging](../../02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-003-niveles-logging.md)

### Documentos Relacionados

- [RF-AUD-001: Sistema de Auditoría](./RF-AUD-001-sistema-auditoria.md)
- [RF-AUD-002: Alertas y Notificaciones](./RF-AUD-002-alertas-notificaciones.md)
- [RF-AUD-004: Retención de Datos](./RF-AUD-004-retencion-datos.md)

---

## 📝 Notas de Implementación

### Herramientas Recomendadas

**Backend (NestJS):**
- **Winston** - Logger principal (flexible, transports múltiples)
- **Pino** - Alternativa ultra-rápida (JSON nativo)
- **Morgan** - HTTP request logging

**Agregación y Análisis:**
- **Datadog** - Logs + APM + Métricas (recomendado)
- **Elasticsearch + Kibana** - Self-hosted
- **CloudWatch Logs** - Si se usa AWS

**Rotación:**
- **logrotate** (Linux nativo)
- **Winston Daily Rotate File** (Node.js)

---

**Última revisión:** 2025-11-07
**Revisores:** DevOps Team, Backend Team
**Próxima revisión:** 2026-01-07
