---
titulo: Guia de Implementacion OpenTelemetry en NestJS
version: 1.0.0
fecha_creacion: 2026-02-14
ultima_actualizacion: 2026-02-14
tags:
  - observabilidad
  - opentelemetry
  - nestjs
  - tracing
  - prometheus
  - metricas
aplica_a:
  - backend
estado: vigente
---

# Guia de Implementacion OpenTelemetry en NestJS

> **Version:** 1.0.0 | **Fecha:** 2026-02-14 | **Aplica a:** `apps/backend`

## 1. Introduccion

Esta guia describe paso a paso como implementar OpenTelemetry en el backend NestJS 11 de gamilit. OpenTelemetry proporciona instrumentacion automatica y manual para generar metricas, logs y traces que cumplen con el [Estandar de Observabilidad](../40-standards/ESTANDAR-OBSERVABILIDAD.md).

### Pre-requisitos

- Node.js 20+ (requerido por NestJS 11)
- Backend de gamilit funcional (`apps/backend`)
- Opcional: Jaeger corriendo localmente para visualizar traces (`docker run -p 16686:16686 -p 4318:4318 jaegertracing/jaeger:latest`)
- Opcional: Prometheus corriendo localmente para scraping de metricas

---

## 2. Instalacion de Dependencias

```bash
cd apps/backend

npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-prometheus \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions \
  @opentelemetry/api
```

**Explicacion de cada paquete:**

| Paquete | Proposito |
|---------|-----------|
| `@opentelemetry/sdk-node` | SDK principal para Node.js, orquesta toda la telemetria |
| `@opentelemetry/auto-instrumentations-node` | Instrumentacion automatica para HTTP, PostgreSQL, Redis y mas |
| `@opentelemetry/exporter-prometheus` | Exporta metricas en formato Prometheus (endpoint `/metrics`) |
| `@opentelemetry/exporter-trace-otlp-http` | Exporta traces a un colector OTLP (Jaeger, Grafana Tempo, etc.) |
| `@opentelemetry/resources` | Define metadatos del servicio (nombre, version) |
| `@opentelemetry/semantic-conventions` | Constantes estandar para atributos de telemetria |
| `@opentelemetry/api` | API publica para crear spans y metricas custom |

---

## 3. Configuracion del SDK de Telemetria

Crear el archivo `src/telemetry.ts` en la raiz del backend. Este archivo DEBE cargarse **antes** de cualquier otro import, incluyendo NestJS:

```typescript
// src/telemetry.ts — Cargar ANTES del bootstrap de NestJS
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const prometheusExporter = new PrometheusExporter({
  port: 9464, // Puerto separado para metricas Prometheus
});

const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || 'gamilit-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Instrumentacion HTTP: captura todos los requests entrantes/salientes
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      // PostgreSQL: captura queries ejecutados via pg driver (usado por TypeORM)
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
        enhancedDatabaseReporting: true,
      },
      // Redis: captura comandos enviados al servidor Redis (cache + Socket.IO adapter)
      '@opentelemetry/instrumentation-redis-4': {
        enabled: true,
      },
      // Express: deshabilitado porque NestJS maneja su propio routing
      '@opentelemetry/instrumentation-express': {
        enabled: false,
      },
      // fs: deshabilitado para reducir ruido
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Telemetry SDK shut down'))
    .catch((err) => console.error('Error shutting down telemetry', err))
    .finally(() => process.exit(0));
});

export { sdk };
```

**Notas importantes:**
- El SDK DEBE inicializarse antes de que NestJS importe cualquier modulo, porque la auto-instrumentacion funciona mediante monkey-patching de las librerias (pg, ioredis, http).
- `enhancedDatabaseReporting` en pg muestra el texto del query SQL en los spans (util en desarrollo, considerar desactivar en produccion por seguridad).

---

## 4. Integracion con main.ts

Modificar `src/main.ts` para importar telemetria como primer linea:

```typescript
// src/main.ts
import './telemetry'; // DEBE ser el PRIMER import del archivo

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
// ... demas imports existentes

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ... configuracion existente (CORS, pipes, interceptors, Swagger, etc.)

  const port = process.env.BACKEND_PORT || 3006;
  await app.listen(port);

  logger.log(`Servidor iniciado en puerto ${port}`);
  logger.log(`Metricas Prometheus disponibles en puerto 9464`);
}

bootstrap();
```

---

## 5. Custom Spans para Logica de Negocio

La auto-instrumentacion captura HTTP, queries y Redis automaticamente. Sin embargo, las operaciones de negocio criticas de gamilit necesitan spans custom para trazabilidad detallada.

### 5.1 Ejemplo: Servicio de XP

```typescript
import { Injectable } from '@nestjs/common';
import { trace, SpanStatusCode, Span } from '@opentelemetry/api';

@Injectable()
export class XPService {
  private readonly tracer = trace.getTracer('gamilit-xp-service');

  async awardXP(
    studentId: string,
    exerciseId: string,
    score: number,
  ): Promise<number> {
    return this.tracer.startActiveSpan('xp.award', async (span: Span) => {
      try {
        // Agregar atributos relevantes al span
        span.setAttribute('student.id', studentId);
        span.setAttribute('exercise.id', exerciseId);
        span.setAttribute('score', score);

        // Logica de calculo de XP
        const xpAmount = this.calculateXP(score);
        span.setAttribute('xp.amount', xpAmount);

        // Persistir XP (el query a DB genera su propio span hijo automaticamente)
        await this.progressRepository.addXP(studentId, xpAmount);

        // Verificar cambio de rango maya
        const rankChanged = await this.checkRankUp(studentId, xpAmount);
        span.setAttribute('rank.changed', rankChanged);

        span.setStatus({ code: SpanStatusCode.OK });
        return xpAmount;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  private calculateXP(score: number): number {
    // Logica de calculo...
    return Math.round(score * 1.5);
  }

  private async checkRankUp(
    studentId: string,
    xpAmount: number,
  ): Promise<boolean> {
    return this.tracer.startActiveSpan(
      'xp.rankCheck',
      async (span: Span) => {
        try {
          // Verificacion de rango maya...
          const result = false; // placeholder
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}
```

### 5.2 Ejemplo: Evaluacion de Ejercicio

```typescript
import { Injectable } from '@nestjs/common';
import { trace, SpanStatusCode, Span } from '@opentelemetry/api';

@Injectable()
export class ExerciseEvaluationService {
  private readonly tracer = trace.getTracer('gamilit-exercise-service');

  async evaluateSubmission(
    studentId: string,
    exerciseId: string,
    answer: any,
  ): Promise<EvaluationResult> {
    return this.tracer.startActiveSpan(
      'exercise.evaluate',
      async (span: Span) => {
        try {
          span.setAttribute('student.id', studentId);
          span.setAttribute('exercise.id', exerciseId);
          span.setAttribute('exercise.type', answer.type);

          const startTime = Date.now();

          // Evaluacion de la respuesta
          const result = await this.evaluate(exerciseId, answer);

          const duration = Date.now() - startTime;
          span.setAttribute('evaluation.duration_ms', duration);
          span.setAttribute('evaluation.score', result.score);
          span.setAttribute('evaluation.correct', result.isCorrect);

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}
```

---

## 6. Interceptor para Tracing Automatico

Crear un interceptor global que enriquezca cada span HTTP con informacion de usuario y tenant:

```typescript
// src/common/interceptors/tracing.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace } from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const span = trace.getActiveSpan();

    if (span) {
      // Enriquecer el span con contexto de gamilit
      span.setAttribute(
        'http.user_id',
        request.user?.id || 'anonymous',
      );
      span.setAttribute(
        'http.tenant_id',
        request.user?.tenantId || 'unknown',
      );
      span.setAttribute(
        'http.user_role',
        request.user?.role || 'none',
      );

      // Nombre del controlador y metodo
      const controller = context.getClass().name;
      const handler = context.getHandler().name;
      span.setAttribute('nestjs.controller', controller);
      span.setAttribute('nestjs.handler', handler);
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          if (span) {
            span.setAttribute(
              'http.handler_duration_ms',
              Date.now() - startTime,
            );
          }
        },
        error: (error) => {
          if (span) {
            span.setAttribute('error.type', error.constructor.name);
            span.setAttribute('error.message', error.message);
          }
        },
      }),
    );
  }
}
```

**Registro global** en `main.ts`:

```typescript
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Registrar interceptor de tracing globalmente
  app.useGlobalInterceptors(new TracingInterceptor());

  // ... demas configuracion
}
```

---

## 7. Trace Propagation: Frontend a Backend

Para que los traces del frontend se conecten con los del backend, el frontend debe inyectar el header `traceparent` en cada solicitud API.

### 7.1 Interceptor de Axios en el Frontend

```typescript
// apps/frontend/src/lib/api/tracing.interceptor.ts
import axios from 'axios';

/**
 * Genera un traceId aleatorio compatible con W3C Trace Context.
 * Formato traceparent: {version}-{trace-id}-{parent-id}-{trace-flags}
 * Ejemplo: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 */
function generateTraceParent(): string {
  const version = '00';
  const traceId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const parentId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const traceFlags = '01'; // sampled
  return `${version}-${traceId}-${parentId}-${traceFlags}`;
}

// Agregar interceptor a la instancia de axios
axios.interceptors.request.use((config) => {
  config.headers['traceparent'] = generateTraceParent();
  return config;
});
```

### 7.2 Como funciona la propagacion

1. El frontend genera un `traceparent` y lo envia como header HTTP.
2. La auto-instrumentacion HTTP de OpenTelemetry en el backend extrae automaticamente el trace context del header.
3. Todos los spans generados en el backend (queries, Redis, custom) heredan el mismo `traceId`.
4. En Jaeger/Grafana Tempo, se puede ver el trace completo desde el frontend hasta la base de datos.

---

## 8. Metricas Custom con la API de OpenTelemetry

Ademas de las metricas automaticas, gamilit necesita metricas de negocio custom:

```typescript
// src/common/services/metrics.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { metrics, Counter, Histogram, UpDownCounter } from '@opentelemetry/api';

@Injectable()
export class MetricsService implements OnModuleInit {
  private exerciseSubmissionsCounter: Counter;
  private xpAwardedHistogram: Histogram;
  private mlCoinsTransactionCounter: Counter;
  private activeSessionsGauge: UpDownCounter;
  private exerciseDurationHistogram: Histogram;
  private wsConnectionsGauge: UpDownCounter;

  onModuleInit() {
    const meter = metrics.getMeter('gamilit', '1.0.0');

    this.exerciseSubmissionsCounter = meter.createCounter(
      'gamilit_exercise_submissions_total',
      {
        description: 'Total de ejercicios enviados por estudiantes',
      },
    );

    this.xpAwardedHistogram = meter.createHistogram(
      'gamilit_xp_awarded',
      {
        description: 'XP otorgado por envio de ejercicio',
        unit: 'points',
      },
    );

    this.mlCoinsTransactionCounter = meter.createCounter(
      'gamilit_ml_coins_transactions_total',
      {
        description: 'Total de transacciones de ML Coins',
      },
    );

    this.activeSessionsGauge = meter.createUpDownCounter(
      'gamilit_active_sessions',
      {
        description: 'Sesiones activas por portal',
      },
    );

    this.exerciseDurationHistogram = meter.createHistogram(
      'gamilit_exercise_completion_duration_seconds',
      {
        description: 'Tiempo para completar un ejercicio',
        unit: 's',
      },
    );

    this.wsConnectionsGauge = meter.createUpDownCounter(
      'gamilit_websocket_connections',
      {
        description: 'Conexiones WebSocket activas',
      },
    );
  }

  // --- Metodos publicos ---

  recordExerciseSubmission(module: string, exerciseType: string, success: boolean): void {
    this.exerciseSubmissionsCounter.add(1, {
      module,
      exercise_type: exerciseType,
      success: String(success),
    });
  }

  recordXPAwarded(amount: number, module: string): void {
    this.xpAwardedHistogram.record(amount, { module });
  }

  recordMLCoinsTransaction(type: 'earn' | 'spend', module: string): void {
    this.mlCoinsTransactionCounter.add(1, {
      transaction_type: type,
      module,
    });
  }

  sessionStarted(portal: string): void {
    this.activeSessionsGauge.add(1, { portal });
  }

  sessionEnded(portal: string): void {
    this.activeSessionsGauge.add(-1, { portal });
  }

  recordExerciseDuration(durationSeconds: number, module: string, exerciseType: string): void {
    this.exerciseDurationHistogram.record(durationSeconds, {
      module,
      exercise_type: exerciseType,
    });
  }

  wsConnectionOpened(namespace: string): void {
    this.wsConnectionsGauge.add(1, { namespace });
  }

  wsConnectionClosed(namespace: string): void {
    this.wsConnectionsGauge.add(-1, { namespace });
  }
}
```

### 8.1 Registro del MetricsService

Registrar `MetricsService` como provider global o en `CoreModule` para que sea inyectable en cualquier modulo:

```typescript
// En core.module.ts o app.module.ts
@Module({
  providers: [MetricsService],
  exports: [MetricsService],
})
export class CoreModule {}
```

### 8.2 Uso en servicios de negocio

```typescript
@Injectable()
export class SubmissionService {
  constructor(private readonly metricsService: MetricsService) {}

  async submitExercise(dto: SubmitExerciseDto): Promise<SubmissionResult> {
    const startTime = Date.now();

    try {
      const result = await this.processSubmission(dto);

      // Registrar metricas
      this.metricsService.recordExerciseSubmission(
        dto.moduleName,
        dto.exerciseType,
        result.isCorrect,
      );

      if (result.xpAwarded > 0) {
        this.metricsService.recordXPAwarded(result.xpAwarded, dto.moduleName);
      }

      const durationSeconds = (Date.now() - startTime) / 1000;
      this.metricsService.recordExerciseDuration(
        durationSeconds,
        dto.moduleName,
        dto.exerciseType,
      );

      return result;
    } catch (error) {
      this.metricsService.recordExerciseSubmission(
        dto.moduleName,
        dto.exerciseType,
        false,
      );
      throw error;
    }
  }
}
```

---

## 9. Verificacion de la Implementacion

### 9.1 Verificar metricas Prometheus

```bash
# El PrometheusExporter expone metricas en el puerto 9464
curl http://localhost:9464/metrics

# Buscar metricas especificas de gamilit
curl -s http://localhost:9464/metrics | grep gamilit_

# Verificar metricas HTTP automaticas
curl -s http://localhost:9464/metrics | grep http_request_duration
```

Ejemplo de salida esperada:

```
# HELP gamilit_exercise_submissions_total Total de ejercicios enviados por estudiantes
# TYPE gamilit_exercise_submissions_total counter
gamilit_exercise_submissions_total{module="literal",exercise_type="multiple_choice",success="true"} 42

# HELP http_request_duration_seconds request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/v1/health",status_code="200",le="0.005"} 100
```

### 9.2 Verificar traces en Jaeger

```bash
# Iniciar Jaeger con Docker (si no esta corriendo)
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/jaeger:latest

# Hacer una solicitud al backend
curl http://localhost:3006/api/v1/health

# Abrir Jaeger UI
# Navegar a http://localhost:16686
# Seleccionar servicio: gamilit-backend
# Hacer clic en "Find Traces"
```

### 9.3 Verificar correlacion de logs

Buscar en los logs que el `traceId` corresponda con el trace en Jaeger:

```bash
# En los logs del backend (formato JSON)
# Buscar un traceId especifico
cat logs/backend.log | grep "traceId.*abc123"
```

---

## 10. Configuracion por Ambiente

| Variable de Entorno | Dev | Produccion | Descripcion |
|---------------------|-----|------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | `http://jaeger:4318` | Endpoint del colector de traces |
| `OTEL_TRACES_SAMPLER` | `always_on` | `parentbased_traceidratio` | Estrategia de muestreo |
| `OTEL_TRACES_SAMPLER_ARG` | `1.0` | `0.1` | Tasa (1.0 = 100%, 0.1 = 10%) |
| `OTEL_METRICS_EXPORTER` | `prometheus` | `prometheus` | Exportador de metricas |
| `OTEL_LOG_LEVEL` | `debug` | `warn` | Nivel de log del SDK de OTel |
| `OTEL_SERVICE_NAME` | `gamilit-backend-dev` | `gamilit-backend` | Nombre del servicio en traces |

**En produccion (servidor 74.208.126.102):**

```bash
# Agregar al archivo .env de produccion
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
OTEL_SERVICE_NAME=gamilit-backend
OTEL_LOG_LEVEL=warn
```

---

## 11. Consideraciones de Performance

| Aspecto | Recomendacion |
|---------|---------------|
| Sampling en produccion | Usar 10% para reducir overhead; incrementar temporalmente para diagnostico |
| Metricas cardinality | Evitar labels con alta cardinalidad (no usar IDs de usuario como label en metricas) |
| Spans custom | Solo para operaciones de negocio criticas; evitar crear spans para operaciones triviales |
| Batch export | El SDK agrupa traces en lotes antes de enviar; no modificar defaults sin necesidad |
| Memory | Monitorear uso de memoria despues de habilitar telemetria; el overhead tipico es < 5% |
| Puerto 9464 | Asegurar que el puerto de metricas Prometheus NO este expuesto publicamente |

---

## 12. Checklist de Implementacion

- [ ] Dependencias de OpenTelemetry instaladas en `apps/backend/package.json`
- [ ] Archivo `src/telemetry.ts` creado con configuracion del SDK
- [ ] `src/main.ts` importa `./telemetry` como primer import
- [ ] `TracingInterceptor` registrado globalmente
- [ ] `MetricsService` creado y registrado en `CoreModule`
- [ ] Spans custom implementados en servicios criticos (XP, ejercicios, logros)
- [ ] Variables de entorno de OTEL configuradas en `.env` de desarrollo
- [ ] Variables de entorno de OTEL configuradas en `.env` de produccion
- [ ] Metricas verificadas en `http://localhost:9464/metrics`
- [ ] Traces verificados en Jaeger UI (`http://localhost:16686`)
- [ ] Frontend inyecta header `traceparent` en solicitudes API
- [ ] Graceful shutdown configurado para el SDK
- [ ] Performance verificado (overhead < 5% en memoria y latencia)

---

## 13. Siguientes Pasos

1. **Configurar Prometheus scraping** en el servidor de produccion para recolectar metricas del puerto 9464.
2. **Configurar dashboards en Grafana** siguiendo las recomendaciones del [Estandar de Observabilidad](../40-standards/ESTANDAR-OBSERVABILIDAD.md).
3. **Configurar alertas** basadas en las reglas definidas en el estandar.
4. **Implementar logging estructurado** con correlacion de `traceId` usando el logger de NestJS.
5. **Instrumentar el frontend** con `@opentelemetry/sdk-trace-web` para traces end-to-end completos.

---

## 14. Referencias

- [OpenTelemetry JS - Documentacion oficial](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry Node.js SDK](https://github.com/open-telemetry/opentelemetry-js)
- [NestJS OpenTelemetry Recipe](https://docs.nestjs.com/recipes/opentelemetry)
- [Prometheus Node.js Client](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-prometheus)
- [Jaeger - Getting Started](https://www.jaegertracing.io/docs/getting-started/)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
- [Estandar de Observabilidad gamilit](../40-standards/ESTANDAR-OBSERVABILIDAD.md)

---

## Historial de Cambios

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | 2026-02-14 | Version inicial de la guia de implementacion OpenTelemetry |
