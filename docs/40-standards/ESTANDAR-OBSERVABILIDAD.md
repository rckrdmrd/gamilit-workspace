---
titulo: Estandar de Observabilidad
tipo: estandar
scope: gamilit
version: 1.0.0
fecha_creacion: 2026-02-14
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - observabilidad
  - opentelemetry
  - prometheus
  - tracing
  - metricas
  - logging
aplica_a:
  - backend
  - frontend
  - devops
estado: vigente
---

# Estandar de Observabilidad

> **Version:** 1.0.0 | **Fecha:** 2026-02-14 | **Estado:** Vigente

## 1. Proposito

Este estandar define las practicas obligatorias de observabilidad para la plataforma gamilit. Cubre los tres pilares fundamentales (metricas, logs y traces), las senales doradas, SLOs/SLIs, reglas de alertas y los dashboards recomendados. Todo componente desplegado en produccion DEBE cumplir con este estandar.

---

## 2. Los 3 Pilares de Observabilidad

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    METRICAS      │  │      LOGS       │  │     TRACES      │
│                  │  │                 │  │                 │
│  Prometheus      │  │  Structured     │  │  Jaeger /       │
│  /metrics        │  │  JSON logs      │  │  OpenTelemetry  │
│                  │  │                 │  │                 │
│  Counters        │  │  Correlation    │  │  Spans          │
│  Histograms      │  │  IDs            │  │  Context        │
│  Gauges          │  │  Levels         │  │  Propagation    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

| Pilar | Herramienta | Proposito |
|-------|-------------|-----------|
| Metricas | Prometheus + OpenTelemetry Metrics API | Valores numericos agregados en el tiempo: contadores, histogramas, gauges |
| Logs | Logger estructurado (JSON) con correlacion | Registro de eventos discretos con contexto y traceId |
| Traces | OpenTelemetry + Jaeger | Seguimiento de una solicitud a traves de todos los servicios y capas |

**Principio fundamental:** Los tres pilares DEBEN estar correlacionados. Cada log y cada trace comparten `traceId`, permitiendo navegar de una alerta basada en metricas al log y trace exactos que causaron el problema.

---

## 3. Golden Signals (4 Senales Doradas)

Las cuatro senales doradas de Google SRE son la base del monitoreo en gamilit:

| Senal | Que mide | Metrica para gamilit | Umbral recomendado |
|-------|----------|----------------------|-------------------|
| **Latencia** | Tiempo de respuesta de las solicitudes | Percentil p99 de endpoints HTTP | < 500ms (API), < 3s (TTI frontend) |
| **Trafico** | Volumen de solicitudes | Requests por segundo por portal (estudiante, maestro, admin, padres) | Baseline + 2 desviaciones estandar |
| **Errores** | Tasa de fallos | Porcentaje de respuestas 4xx/5xx sobre el total | < 5% (warning), < 1% (objetivo) |
| **Saturacion** | Uso de recursos | CPU, memoria heap, conexiones de pool DB, conexiones Redis, sockets WebSocket | < 80% capacidad |

Estas senales DEBEN monitorearse en todo dashboard de overview y servir como base para las reglas de alertas.

---

## 4. Metricas Obligatorias (Prometheus)

### 4.1 Metricas HTTP (auto-instrumentacion)

Estas metricas se generan automaticamente mediante la instrumentacion de OpenTelemetry para HTTP:

| Metrica | Tipo | Descripcion | Labels |
|---------|------|-------------|--------|
| `http_request_duration_seconds` | Histogram | Latencia de cada solicitud HTTP | `method`, `route`, `status_code` |
| `http_requests_total` | Counter | Total acumulado de solicitudes HTTP | `method`, `route`, `status_code` |
| `http_request_size_bytes` | Histogram | Tamano del cuerpo de cada solicitud entrante | `method`, `route` |
| `http_response_size_bytes` | Histogram | Tamano del cuerpo de cada respuesta saliente | `method`, `route`, `status_code` |

**Buckets recomendados para histogramas de latencia:** `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]` segundos.

### 4.2 Metricas de Negocio (custom)

Metricas especificas de la logica educativa y de gamificacion de gamilit:

| Metrica | Tipo | Descripcion | Labels |
|---------|------|-------------|--------|
| `gamilit_exercise_submissions_total` | Counter | Ejercicios enviados por los estudiantes | `module`, `exercise_type`, `success` |
| `gamilit_xp_awarded_total` | Counter | Puntos de experiencia otorgados | `module`, `award_type` |
| `gamilit_ml_coins_transactions_total` | Counter | Transacciones de ML Coins (gasto y ganancia) | `transaction_type`, `module` |
| `gamilit_active_sessions_gauge` | Gauge | Sesiones activas simultaneas | `portal` (student, teacher, admin, parent) |
| `gamilit_exercise_completion_duration_seconds` | Histogram | Tiempo que toma completar un ejercicio | `module`, `exercise_type` |
| `gamilit_websocket_connections_gauge` | Gauge | Conexiones Socket.IO activas | `namespace`, `portal` |
| `gamilit_leaderboard_updates_total` | Counter | Actualizaciones de leaderboard procesadas | `scope` (classroom, global) |
| `gamilit_achievement_unlocks_total` | Counter | Logros desbloqueados | `achievement_type` |

### 4.3 Metricas de Infraestructura

| Metrica | Tipo | Descripcion | Labels |
|---------|------|-------------|--------|
| `nodejs_heap_size_bytes` | Gauge | Uso de memoria del heap de Node.js | `space` |
| `nodejs_event_loop_lag_seconds` | Gauge | Lag del event loop | - |
| `typeorm_query_duration_seconds` | Histogram | Latencia de queries ejecutados por TypeORM | `datasource`, `operation` |
| `typeorm_query_errors_total` | Counter | Queries que resultaron en error | `datasource`, `error_type` |
| `redis_connections_active` | Gauge | Conexiones activas al servidor Redis | `purpose` (cache, socket_io) |
| `redis_commands_duration_seconds` | Histogram | Latencia de comandos Redis | `command` |
| `pg_pool_size` | Gauge | Tamano actual del pool de conexiones PostgreSQL | `datasource` |
| `pg_pool_waiting` | Gauge | Conexiones en espera en el pool | `datasource` |

---

## 5. Logging Estructurado

### 5.1 Formato obligatorio

En produccion, TODOS los logs DEBEN emitirse en formato JSON estructurado. Cada entrada de log DEBE contener los siguientes campos:

```json
{
  "timestamp": "2026-02-14T10:30:00.000Z",
  "level": "info",
  "message": "Exercise submitted",
  "traceId": "abc123def456789",
  "spanId": "def456abc123",
  "service": "gamilit-backend",
  "userId": "user-001",
  "tenantId": "tenant-001",
  "module": "educational",
  "action": "exercise.submit",
  "duration": 1250,
  "metadata": {
    "exerciseId": "ex-001",
    "moduleId": "mod-01",
    "score": 85,
    "xpAwarded": 50
  }
}
```

### 5.2 Campos obligatorios

| Campo | Tipo | Descripcion | Requerido |
|-------|------|-------------|-----------|
| `timestamp` | ISO 8601 | Momento exacto del evento | Siempre |
| `level` | string | Nivel de severidad del log | Siempre |
| `message` | string | Descripcion legible del evento | Siempre |
| `traceId` | string | ID de trace de OpenTelemetry para correlacion | Siempre (si hay trace activo) |
| `spanId` | string | ID del span activo | Siempre (si hay span activo) |
| `service` | string | Nombre del servicio emisor | Siempre |
| `userId` | string | ID del usuario autenticado | Si aplica |
| `tenantId` | string | ID del tenant (multi-tenancy) | Si aplica |
| `module` | string | Modulo NestJS que emite el log | Siempre |
| `action` | string | Accion semantica (`entity.verb`) | Siempre |
| `duration` | number | Duracion en milisegundos | Si aplica |
| `metadata` | object | Datos adicionales especificos del evento | Opcional |

### 5.3 Niveles de log

| Nivel | Uso | Habilitado en Prod | Ejemplo |
|-------|-----|-------------------|---------|
| `error` | Errores que requieren accion inmediata. Algo fallo y necesita atencion. | SI | Fallo de conexion a BD, error de autenticacion critico |
| `warn` | Situaciones anomalas que no bloquean la operacion pero merecen atencion. | SI | Rate limit alcanzado, retry exitoso, datos inconsistentes |
| `info` | Eventos de negocio importantes: acciones de usuario, transiciones de estado. | SI | Ejercicio enviado, XP otorgado, sesion iniciada |
| `debug` | Detalle de ejecucion util durante desarrollo. Flujo interno de logica. | NO | Parametros de query, resultado de validaciones |
| `verbose` | Detalle extremo: queries SQL completos, payloads de request/response. | NO | Query SQL con parametros, body completo de request |

### 5.4 Reglas de logging

- **PROHIBIDO** loguear datos sensibles: passwords, tokens JWT, datos personales de estudiantes menores de edad.
- **OBLIGATORIO** incluir `traceId` en todo log que ocurra dentro del contexto de una solicitud HTTP.
- **OBLIGATORIO** usar logging estructurado (JSON) en produccion; formato legible permitido solo en desarrollo.
- **RECOMENDADO** usar el patron `action` con formato `entidad.verbo` (ej: `exercise.submit`, `xp.award`, `session.start`).

---

## 6. Distributed Tracing (OpenTelemetry)

### 6.1 Propagacion de contexto

La propagacion de trace context DEBE seguir el flujo completo:

```
Frontend (Browser)
    │ traceparent header
    ▼
Backend (NestJS)
    │ Span: HTTP request
    ├── Span: Auth guard
    ├── Span: Business logic
    │     ├── Span: Database query (TypeORM)
    │     ├── Span: Redis operation
    │     └── Span: XP calculation
    └── Span: Response serialization
```

- **Headers de propagacion:** `traceparent`, `tracestate` (estandar W3C Trace Context).
- El frontend DEBE inyectar el header `traceparent` en cada solicitud API usando un interceptor de axios/fetch.
- El backend extrae el trace context automaticamente gracias a la auto-instrumentacion HTTP de OpenTelemetry.

### 6.2 Sampling (muestreo)

| Ambiente | Estrategia | Tasa | Justificacion |
|----------|-----------|------|---------------|
| Desarrollo | `always_on` | 100% | Visibilidad completa durante desarrollo |
| Produccion | `parentbased_traceidratio` | 10% | Balance entre visibilidad y overhead |
| Produccion (debug) | `always_on` | 100% | Temporal, solo para diagnostico activo |

La tasa de muestreo en produccion es configurable via variable de entorno `OTEL_TRACES_SAMPLER_ARG`.

### 6.3 Spans obligatorios

Ademas de los spans automaticos (HTTP, PostgreSQL, Redis), los siguientes spans custom DEBEN implementarse:

| Span | Modulo | Descripcion |
|------|--------|-------------|
| `exercise.evaluate` | educational | Evaluacion de respuesta de ejercicio |
| `xp.award` | gamification/progress | Calculo y asignacion de XP |
| `xp.rankCheck` | gamification/progress | Verificacion de cambio de rango maya |
| `leaderboard.update` | gamification | Recalculo de posiciones en leaderboard |
| `coins.transaction` | gamification | Transaccion de ML Coins (compra/ganancia) |
| `achievement.check` | gamification | Verificacion de logros desbloqueados |
| `notification.send` | communication | Envio de notificacion (email, push, SMS, in-app) |
| `auth.validate` | auth | Validacion de token JWT y permisos RBAC |

---

## 7. SLO/SLI Definitions para gamilit

### 7.1 Definiciones

- **SLI (Service Level Indicator):** Metrica cuantitativa que mide un aspecto del servicio.
- **SLO (Service Level Objective):** Objetivo porcentual o umbral que el SLI debe cumplir.
- **Error Budget:** Porcentaje de tiempo/solicitudes en que se permite NO cumplir el SLO.

### 7.2 Tabla de SLOs

| Servicio | SLI | SLO | Ventana | Error Budget |
|----------|-----|-----|---------|-------------|
| API Backend | Disponibilidad (% de solicitudes HTTP con status < 500) | 99.5% | 30 dias | 0.5% (~3.6 horas) |
| API Backend | Latencia p99 de solicitudes HTTP | < 500ms | 30 dias | 0.5% de solicitudes pueden exceder |
| Frontend | Time to Interactive (TTI) | < 3s | 30 dias | 5% de cargas pueden exceder |
| WebSocket | Uptime de conexiones Socket.IO | 99.0% | 30 dias | 1% (~7.2 horas) |
| Database | Latencia p99 de queries | < 100ms | 30 dias | 0.5% de queries pueden exceder |
| Exercise Submit | Tasa de exito de envio de ejercicios | 99.9% | 30 dias | 0.1% de envios pueden fallar |
| Auth | Tasa de exito de autenticacion (sin contar credenciales invalidas) | 99.9% | 30 dias | 0.1% |

### 7.3 Calculo de SLI

```
SLI_disponibilidad = (solicitudes_exitosas / solicitudes_totales) * 100

SLI_latencia = (solicitudes_bajo_umbral / solicitudes_totales) * 100

Error_budget_restante = SLO - SLI_actual
```

Cuando el error budget se consume al 50%, se activa una alerta de warning. Al 100%, se congela el despliegue de nuevas features hasta recuperar el SLO.

---

## 8. Reglas de Alertas

### 8.1 Alertas criticas

| Alerta | Condicion | Severidad | Accion |
|--------|-----------|-----------|--------|
| Alta latencia API | p99 > 2s durante 5 minutos consecutivos | Warning | Investigar endpoints lentos, revisar queries DB |
| Error rate elevado | > 5% de respuestas 5xx durante 5 minutos | Critical | Notificar equipo + investigar inmediatamente |
| Pool DB saturado | Conexiones del pool > 80% durante 10 minutos | Warning | Evaluar escalar pool o optimizar queries |
| Memoria heap alta | Heap > 80% del limite durante 15 minutos | Warning | Revisar posibles memory leaks, analizar heap dump |
| Health check falla | 3 fallos consecutivos del endpoint /health | Critical | Restart automatico via PM2, notificar equipo |
| Redis desconectado | Conexion a Redis perdida durante 1 minuto | Critical | Verificar servicio Redis, reiniciar si necesario |
| WebSocket caida masiva | > 50% de conexiones WebSocket perdidas en 2 minutos | Critical | Verificar red, Redis adapter, reiniciar gateway |
| Error budget agotado | SLO error budget consumido al 100% | Critical | Congelar deploys, priorizar estabilidad |

### 8.2 Alertas informativas

| Alerta | Condicion | Severidad | Accion |
|--------|-----------|-----------|--------|
| Pico de trafico | Requests/s > 2x baseline durante 5 minutos | Info | Monitorear, preparar escalado si persiste |
| Nuevo tipo de error | Error no visto previamente en 24 horas | Info | Clasificar y documentar |
| Error budget al 50% | Budget consumido a la mitad del periodo | Warning | Revisar tendencia, planificar mejoras |

### 8.3 Canales de notificacion

| Severidad | Canal | Tiempo de respuesta esperado |
|-----------|-------|------------------------------|
| Critical | Email + SMS al equipo de turno | < 15 minutos |
| Warning | Email al equipo de desarrollo | < 2 horas |
| Info | Dashboard + log interno | Siguiente revision programada |

---

## 9. Endpoint /metrics

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `GET /api/v1/metrics` |
| **Formato** | Prometheus text exposition format (`text/plain; version=0.0.4`) |
| **Autenticacion** | Excluido de JWT. Proteger via IP whitelist en Nginx o red privada |
| **Scrape interval** | 15 segundos (recomendado) |
| **Puerto alternativo** | Puerto 9464 (PrometheusExporter standalone) si se prefiere separar del API |

Ejemplo de configuracion en Nginx para proteger el endpoint:

```nginx
location /api/v1/metrics {
    allow 127.0.0.1;          # localhost
    allow 10.0.0.0/8;         # red interna
    deny all;
    proxy_pass http://localhost:3006;
}
```

---

## 10. Dashboards Recomendados

### 10.1 Dashboard Overview

Muestra las 4 senales doradas y el estado de los SLOs:

- Grafico de latencia p50, p95, p99 en tiempo real
- Contador de requests por segundo (RPS) desglosado por portal
- Tasa de errores (4xx vs 5xx) en porcentaje
- Uso de CPU, memoria, pool DB y conexiones Redis
- Estado de SLOs con indicador visual (verde/amarillo/rojo)

### 10.2 Dashboard por Portal

Un dashboard por cada portal (estudiante, maestro, admin, padres):

- Endpoints mas utilizados del portal
- Latencia promedio y p99 del portal
- Sesiones activas
- Errores frecuentes especificos del portal
- Metricas de negocio relevantes (ej: ejercicios enviados para estudiante, reportes generados para maestro)

### 10.3 Dashboard Database

- Latencia de queries por datasource (10 datasources en gamilit)
- Queries mas lentos (top 10)
- Uso del pool de conexiones por datasource
- Tasa de errores de queries
- Overhead de politicas RLS (418 politicas activas)
- Tamano de tablas y crecimiento

### 10.4 Dashboard Gamificacion

Metricas del sistema de gamificacion en tiempo real:

- XP otorgado por minuto, desglosado por modulo educativo
- Transacciones de ML Coins (compras en tienda virtual)
- Logros desbloqueados por hora
- Actualizaciones de leaderboard
- Distribucion de rangos maya activos
- Sesiones de ejercicios completadas vs abandonadas

### 10.5 Dashboard WebSocket

- Conexiones Socket.IO activas por namespace
- Mensajes enviados/recibidos por segundo
- Latencia de entrega de notificaciones
- Reconexiones por minuto
- Estado del adapter Redis para Socket.IO

---

## 11. Checklist de Observabilidad

Lista de verificacion para asegurar que un componente cumple con este estandar antes de desplegar a produccion:

- [ ] OpenTelemetry SDK configurado e inicializado antes del bootstrap de NestJS
- [ ] Endpoint `/metrics` habilitado y accesible (puerto 9464 o integrado en API)
- [ ] Logs en formato JSON estructurado en produccion
- [ ] `traceId` presente en todos los logs emitidos dentro de contexto HTTP
- [ ] `tenantId` y `userId` incluidos en logs cuando aplica (multi-tenancy)
- [ ] SLOs definidos y monitoreados con dashboards
- [ ] Alertas configuradas para todas las condiciones criticas listadas en seccion 8
- [ ] Dashboard de overview disponible y funcional
- [ ] Sampling rate configurado apropiadamente para produccion (10% por defecto)
- [ ] Spans custom implementados para operaciones de negocio criticas
- [ ] Metricas de negocio custom registradas (ejercicios, XP, ML Coins)
- [ ] Datos sensibles excluidos de logs (passwords, tokens, datos personales de menores)
- [ ] Propagacion de trace context verificada entre frontend y backend

---

## 12. Configuracion por Ambiente

| Variable de Entorno | Desarrollo | Produccion | Descripcion |
|---------------------|-----------|------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | `http://jaeger:4318` | Endpoint del colector OTLP |
| `OTEL_TRACES_SAMPLER` | `always_on` | `parentbased_traceidratio` | Estrategia de muestreo |
| `OTEL_TRACES_SAMPLER_ARG` | `1.0` | `0.1` | Tasa de muestreo |
| `OTEL_METRICS_EXPORTER` | `prometheus` | `prometheus` | Exportador de metricas |
| `OTEL_LOG_LEVEL` | `debug` | `warn` | Nivel de log del SDK |
| `OTEL_SERVICE_NAME` | `gamilit-backend-dev` | `gamilit-backend` | Nombre del servicio |

---

## 13. Referencias

- [OpenTelemetry - Documentacion oficial](https://opentelemetry.io/docs/)
- [Prometheus - Documentacion oficial](https://prometheus.io/docs/)
- [NestJS OpenTelemetry Recipe](https://docs.nestjs.com/recipes/opentelemetry)
- [Jaeger - Documentacion oficial](https://www.jaegertracing.io/docs/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Google SRE - Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

---

## Historial de Cambios

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | 2026-02-14 | Version inicial del estandar de observabilidad |
