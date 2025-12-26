# ET-HLT-001: Health Checks

**Versión:** 1.0.0
**Fecha:** 2025-12-18
**Estado:** Implementado
**Módulo Backend:** `apps/backend/src/modules/health/`

---

## 1. DESCRIPCIÓN

El módulo de health checks proporciona endpoints para verificar el estado del servicio backend. Es utilizado por sistemas de monitoreo, load balancers y kubernetes para determinar la disponibilidad del servicio.

---

## 2. COMPONENTES

### 2.1 HealthController

**Ubicación:** `health/health.controller.ts`

**Endpoints:**

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| GET | `/health` | Estado general | `{ status: "ok", timestamp }` |
| GET | `/health/ready` | Readiness check | `{ ready: true, checks: [...] }` |
| GET | `/health/live` | Liveness check | `{ live: true }` |

### 2.2 HealthService

**Ubicación:** `health/health.service.ts`

**Métodos:**
| Método | Descripción | Retorno |
|--------|-------------|---------|
| `check()` | Estado general del servicio | HealthStatus |
| `checkDatabase()` | Conectividad a PostgreSQL | boolean |
| `checkRedis()` | Conectividad a Redis (si aplica) | boolean |
| `checkDiskSpace()` | Espacio en disco | DiskStatus |
| `checkMemory()` | Uso de memoria | MemoryStatus |

---

## 3. RESPUESTAS

### 3.1 Health Check Exitoso (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2025-12-18T12:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "checks": {
    "database": { "status": "up", "responseTime": 5 },
    "memory": { "status": "ok", "usage": "45%" },
    "disk": { "status": "ok", "usage": "60%" }
  }
}
```

### 3.2 Health Check Fallido (503 Service Unavailable)

```json
{
  "status": "error",
  "timestamp": "2025-12-18T12:00:00Z",
  "checks": {
    "database": { "status": "down", "error": "Connection refused" }
  }
}
```

---

## 4. CONFIGURACIÓN

### 4.1 Módulo

```typescript
@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
```

### 4.2 Thresholds

| Métrica | Warning | Critical |
|---------|---------|----------|
| Memory Usage | 70% | 90% |
| Disk Usage | 80% | 95% |
| DB Response Time | 100ms | 500ms |

---

## 5. USO EN KUBERNETES

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 6. DEPENDENCIAS

- **Ninguna** (módulo independiente)
- **No es usado por otros módulos**

---

## 7. SEGURIDAD

- Endpoint `/health` es público (sin autenticación)
- Endpoints detallados (`/health/ready`) pueden requerir auth en producción
- No exponer información sensible en respuestas

---

*Especificación generada: 2025-12-18*
