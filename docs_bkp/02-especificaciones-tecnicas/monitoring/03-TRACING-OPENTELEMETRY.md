# Distributed Tracing - OpenTelemetry

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Distributed Tracing
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 1889-1986)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## OpenTelemetry Setup

**Install:**
```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

**Configuration:**
```typescript
// src/shared/utils/tracing.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gamilit-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error shutting down tracing', error))
    .finally(() => process.exit(0));
});
```

---

## Custom Instrumentation

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('gamilit-backend');

export async function submitExercise(exerciseId: string, answers: any) {
  return tracer.startActiveSpan('submitExercise', async (span) => {
    span.setAttribute('exercise.id', exerciseId);
    span.setAttribute('exercise.type', exercise.type);

    try {
      // Validate answers
      const validationSpan = tracer.startSpan('validateAnswers');
      const isValid = await validateAnswers(answers);
      validationSpan.end();

      // Calculate score
      const scoringSpan = tracer.startSpan('calculateScore');
      const score = await calculateScore(answers);
      scoringSpan.setAttribute('score', score);
      scoringSpan.end();

      // Award coins
      const coinsSpan = tracer.startSpan('awardMLCoins');
      const coins = await awardMLCoins(userId, score);
      coinsSpan.setAttribute('coins.earned', coins);
      coinsSpan.end();

      span.setStatus({ code: SpanStatusCode.OK });
      return { score, coins };
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
