---
titulo: Estandar de Performance
tipo: estandar-proyecto
scope: proyecto
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
herencia: |
  Este estandar aplica al proyecto gamilit (standalone).
  No hay herencia a otros proyectos (ver CLAUDE.md RC3).
  Ejemplo: Metricas especificas del proyecto en orchestration/inventarios/
tags:
  - performance
  - metricas
  - optimizacion
  - monitoreo
---

# Estandar de Performance

> Metricas, umbrales y mejores practicas para garantizar rendimiento optimo en aplicaciones del workspace

---

## 1. Metricas de API Backend

### 1.1 Tiempos de Respuesta

| Metrica | Umbral Aceptable | Umbral Optimo | Critico |
|---------|------------------|---------------|---------|
| P50 (mediana) | < 100ms | < 50ms | > 200ms |
| P95 | < 200ms | < 100ms | > 500ms |
| P99 | < 500ms | < 200ms | > 1000ms |

```typescript
// Ejemplo de interceptor para medir tiempos
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > 200) {
          this.logger.warn(`Slow request: ${request.method} ${request.url} - ${duration}ms`);
        }
      }),
    );
  }
}
```

### 1.2 Throughput

| Endpoint Tipo | Minimo req/s | Objetivo req/s |
|---------------|--------------|----------------|
| Lectura simple | 500 | 1000+ |
| Lectura con joins | 100 | 300+ |
| Escritura simple | 200 | 500+ |
| Operaciones batch | 50 | 100+ |

---

## 2. Metricas de Base de Datos

### 2.1 Tiempos de Query

| Tipo de Query | Umbral Aceptable | Critico |
|---------------|------------------|---------|
| SELECT simple | < 10ms | > 50ms |
| SELECT con JOIN | < 50ms | > 200ms |
| SELECT con agregaciones | < 100ms | > 500ms |
| INSERT/UPDATE simple | < 20ms | > 100ms |
| Transacciones complejas | < 200ms | > 1000ms |

### 2.2 Indices Obligatorios

```sql
-- Toda tabla debe tener indices en:
-- 1. Primary Key (automatico)
-- 2. Foreign Keys
-- 3. Campos de busqueda frecuente
-- 4. Campos de ordenamiento

-- Ejemplo de indices recomendados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
```

### 2.3 Connection Pool

| Parametro | Valor Recomendado | Justificacion |
|-----------|-------------------|---------------|
| Pool size minimo | 5 | Conexiones siempre disponibles |
| Pool size maximo | 20 | Evitar saturacion de DB |
| Idle timeout | 10000ms | Liberar conexiones no usadas |
| Connection timeout | 5000ms | Fallar rapido si DB no responde |

---

## 3. Metricas de Frontend

### 3.1 Core Web Vitals

| Metrica | Descripcion | Bueno | Necesita Mejora | Pobre |
|---------|-------------|-------|-----------------|-------|
| LCP | Largest Contentful Paint | < 2.5s | 2.5s - 4s | > 4s |
| FID | First Input Delay | < 100ms | 100ms - 300ms | > 300ms |
| CLS | Cumulative Layout Shift | < 0.1 | 0.1 - 0.25 | > 0.25 |

### 3.2 Tiempos de Carga

| Metrica | Objetivo | Critico |
|---------|----------|---------|
| Time to First Byte (TTFB) | < 200ms | > 600ms |
| First Contentful Paint (FCP) | < 1.8s | > 3s |
| Time to Interactive (TTI) | < 3.8s | > 7.3s |

### 3.3 Tamano de Bundle

| Tipo | Maximo Recomendado |
|------|-------------------|
| Bundle inicial (gzipped) | < 200KB |
| Chunk lazy-loaded | < 50KB |
| Imagenes hero | < 100KB |
| Total de JS | < 500KB |

---

## 4. Metricas de Cache

### 4.1 Redis

| Metrica | Objetivo |
|---------|----------|
| Hit rate | > 90% |
| Latencia GET | < 1ms |
| Latencia SET | < 2ms |
| Memoria usada | < 80% del asignado |

### 4.2 Estrategia de Cache

```typescript
// TTL recomendados por tipo de dato
const CACHE_TTL = {
  // Datos estaticos (configuracion)
  CONFIG: 3600,        // 1 hora

  // Datos semi-estaticos (catalogos)
  CATALOGS: 1800,      // 30 minutos

  // Datos de usuario
  USER_SESSION: 900,   // 15 minutos
  USER_PROFILE: 300,   // 5 minutos

  // Datos volatiles
  REAL_TIME: 30,       // 30 segundos
};
```

---

## 5. Monitoreo y Alertas

### 5.1 Metricas a Monitorear

| Categoria | Metricas | Frecuencia |
|-----------|----------|------------|
| API | Latencia, errores 5xx, throughput | Real-time |
| Database | Query time, conexiones activas, deadlocks | Real-time |
| Cache | Hit rate, memoria, conexiones | Cada minuto |
| Sistema | CPU, memoria, disco | Cada 30s |

### 5.2 Umbrales de Alerta

```yaml
## Ejemplo de configuracion de alertas
alerts:
  api_latency_p95:
    warning: 200ms
    critical: 500ms

  error_rate_5xx:
    warning: 1%
    critical: 5%

  database_connections:
    warning: 80%
    critical: 95%

  memory_usage:
    warning: 75%
    critical: 90%
```

---

## 6. Optimizaciones Obligatorias

### 6.1 Backend

- [ ] Paginacion en endpoints que retornan listas
- [ ] Indices en campos de busqueda y filtrado
- [ ] Cache de queries frecuentes
- [ ] Compresion gzip habilitada
- [ ] Connection pooling configurado

### 6.2 Frontend

- [ ] Lazy loading de rutas
- [ ] Code splitting por feature
- [ ] Optimizacion de imagenes (WebP, lazy load)
- [ ] Minificacion y tree shaking
- [ ] Prefetch de rutas criticas

### 6.3 Base de Datos

- [ ] Explain analyze en queries complejas
- [ ] Vacuum regular en PostgreSQL
- [ ] Indices compuestos donde aplique
- [ ] Particionamiento para tablas grandes

---

## 7. Checklist de Performance

### Antes de Merge

- [ ] Queries nuevas tienen indices necesarios
- [ ] No hay N+1 queries
- [ ] Endpoints paginados si retornan listas
- [ ] Cache implementado donde aplica

### Antes de Deploy

- [ ] Load testing ejecutado
- [ ] Metricas baseline establecidas
- [ ] Alertas configuradas
- [ ] Rollback plan definido

---

## Referencias

- `orchestration/directivas/principios/PRINCIPIO-KISS.md` - Simplicidad
- `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md` - Indices y queries
- `docs/40-standards/ESTANDAR-BACKEND-PROFESIONAL.md` - Patrones NestJS
- `docs/40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md` - Optimizacion React
