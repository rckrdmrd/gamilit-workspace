/**
 * OpenTelemetry Bootstrap
 *
 * MUST be imported BEFORE any NestJS code in main.ts.
 * Sets up tracing and metrics collection for the application.
 *
 * @ref GUIA-OPENTELEMETRY-NESTJS §3
 * @ref ESTANDAR-OBSERVABILIDAD §3
 */

/**
 * OpenTelemetry Bootstrap
 *
 * MUST be imported BEFORE any NestJS code in main.ts.
 * Sets up tracing and metrics collection for the application.
 *
 * Note: Only activates when OTEL_ENABLED=true environment variable is set.
 * This avoids importing heavy OTel packages in normal dev mode.
 *
 * @ref GUIA-OPENTELEMETRY-NESTJS §3
 * @ref ESTANDAR-OBSERVABILIDAD §3
 */

const isEnabled = process.env.OTEL_ENABLED === 'true';

if (isEnabled) {
  // Dynamic import to avoid TypeScript issues with OTel packages
  // and to prevent loading heavy dependencies when OTel is disabled
  import('@opentelemetry/sdk-node').then(async ({ NodeSDK }) => {
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { PrometheusExporter } = await import('@opentelemetry/exporter-prometheus');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import('@opentelemetry/semantic-conventions');

    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
    const prometheusPort = parseInt(process.env.OTEL_PROMETHEUS_PORT || '9464', 10);

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'gamilit-backend',
        [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
        'deployment.environment': process.env.NODE_ENV || 'development',
      }),
      traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      }),
      metricReader: new PrometheusExporter({
        port: prometheusPort,
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    sdk.start();
    console.log('[OpenTelemetry] SDK started - traces & metrics enabled');

    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('[OpenTelemetry] SDK shut down'))
        .catch((err: unknown) => console.error('[OpenTelemetry] Error shutting down SDK', err));
    });
  }).catch((err: unknown) => {
    console.warn('[OpenTelemetry] Failed to initialize SDK:', err);
  });
} else {
  console.log('[OpenTelemetry] SDK disabled (set OTEL_ENABLED=true to enable)');
}
