# US-REP-004: Data Warehouse y Pipeline ETL

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-REP-004 |
| **Épica** | EXT-005 - Reportes Avanzados |
| **Título** | Data Warehouse y Pipeline ETL para Analytics |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $4,000 MXN |

---

## Historia de Usuario

**Como** arquitecto de datos y equipo de analytics
**Quiero** un data warehouse separado con pipeline ETL automatizado
**Para** ejecutar queries analíticos sin afectar BD productiva, mejorar performance y tener datos históricos agregados

---

## Valor de Negocio

### Impacto
- **Performance**: Queries analíticos 10-50x más rápidos
- **Escalabilidad**: BD productiva no se degrada con analytics pesados
- **Histórico**: Retención de datos por años sin afectar producción
- **Compliance**: Facilita auditorías y GDPR

### Métricas de Éxito
- Queries analíticos <3 segundos (p95)
- 0 impacto en latencia de BD productiva
- ETL completa en <30 minutos diarios
- Datos históricos disponibles por 5+ años

---

## Criterios de Aceptación

### CA-01: Arquitectura de Data Warehouse
**Dado** que se necesita separación de concerns
**Cuando** se diseña arquitectura
**Entonces** debe incluir:
- **BD Productiva (PostgreSQL)**:
  - Datos transaccionales (OLTP)
  - Optimizada para writes y reads rápidos
  - Schema normalizado
- **Data Warehouse (ClickHouse o PostgreSQL)**:
  - Datos analíticos (OLAP)
  - Optimizada para queries complejos y agregaciones
  - Schema desnormalizado (star schema)
  - Columnar storage (si ClickHouse)
- **Separación Física**:
  - Diferentes servidores/clusters
  - Sin competencia por recursos
- **Replicación Asíncrona**:
  - No bloquea BD productiva
  - Eventual consistency aceptable

### CA-02: Pipeline ETL Automatizado
**Dado** que datos deben sincronizarse
**Cuando** se ejecuta ETL
**Entonces** debe:
- **Extract**:
  - Leer datos de BD productiva
  - Usar réplica read-only (no afectar producción)
  - Extracción incremental (solo datos nuevos/modificados)
  - Change Data Capture (CDC) con Debezium o similar
- **Transform**:
  - Limpieza de datos (nulls, duplicados)
  - Agregaciones pre-calculadas (diarias, semanales, mensuales)
  - Desnormalización (joins pre-computados)
  - Feature engineering para ML
- **Load**:
  - Insertar en data warehouse
  - Upserts para datos actualizados
  - Particionamiento por fecha
  - Compresión de datos

### CA-03: Tablas Agregadas
**Dado** que queries frecuentes deben ser rápidos
**Cuando** se crean tablas agregadas
**Entonces** debe tener:
- **Agregación Diaria**:
  - `daily_user_activity`: logins, mecánicas completadas, tiempo activo por usuario/día
  - `daily_module_stats`: completaciones, scores promedio por módulo/día
  - `daily_economy`: Cacao generado, gastado por día
- **Agregación Semanal**:
  - `weekly_user_progress`: progreso por usuario/semana
  - `weekly_classroom_stats`: métricas por aula/semana
- **Agregación Mensual**:
  - `monthly_platform_metrics`: KPIs de plataforma
  - `monthly_institution_comparison`: comparativa entre instituciones
- **Tablas de Hechos (Fact Tables)**:
  - `fact_mechanic_completions`: cada completación de mecánica
  - `fact_logins`: cada login de usuario
  - `fact_transactions`: cada transacción de Cacao
- **Tablas de Dimensiones (Dimension Tables)**:
  - `dim_users`: información de usuarios
  - `dim_modules`: información de módulos
  - `dim_institutions`: información de instituciones
  - `dim_date`: calendario con metadata (día de semana, feriados, etc.)

### CA-04: Particionamiento de Datos
**Dado** que habrá millones/billones de registros
**Cuando** se almacenan datos históricos
**Entonces** debe:
- **Particionamiento por Fecha**:
  - Particiones mensuales o semanales
  - Facilita queries por rango de fecha
  - Permite drop de particiones antiguas
- **Particionamiento por Institución** (opcional):
  - Si multi-tenancy con grandes volúmenes
- **Índices Optimizados**:
  - Índices en columnas usadas en WHERE/JOIN
  - Índices compuestos para queries frecuentes
  - Índices parciales para queries específicos
- **Compresión**:
  - Datos antiguos (>1 año) comprimidos
  - Balance entre storage y query speed

### CA-05: Políticas de Retención
**Dado** que no todo debe guardarse indefinidamente
**Cuando** se definen políticas
**Entonces** debe especificar:
- **Datos Granulares (Fact Tables)**:
  - Últimos 12 meses: completos
  - 1-3 años: agregados semanales
  - >3 años: agregados mensuales
  - >5 años: archivados a cold storage (S3 Glacier)
- **Datos Agregados**:
  - Agregaciones diarias: 2 años
  - Agregaciones semanales: 5 años
  - Agregaciones mensuales: indefinido
- **Datos Sensibles**:
  - PII anonimizado después de 6 meses
  - GDPR derecho al olvido: eliminar inmediatamente
- **Jobs Automáticos**:
  - Cron job mensual para archivar datos antiguos
  - Cron job semanal para eliminar datos expirados

### CA-06: Jobs de Sincronización
**Dado** que ETL debe ejecutarse regularmente
**Cuando** se programan jobs
**Entonces** debe tener:
- **Full Load Inicial**:
  - Migración completa de datos históricos (una vez)
  - Ejecutar en horario de bajo tráfico
- **Incremental Load**:
  - **Hourly**: Actividad crítica (logins, completaciones)
  - **Daily**: Agregaciones diarias, stats
  - **Weekly**: Reportes semanales, cleanup
  - **Monthly**: Agregaciones mensuales, archivado
- **CDC en Tiempo Real** (opcional avanzado):
  - Stream de cambios con Kafka + Debezium
  - Latencia <1 minuto
- **Monitoreo de Jobs**:
  - Alertas si job falla
  - Dashboard de status de ETL
  - Logs de ejecución

### CA-07: Herramientas de ETL
**Dado** que se necesita orquestación
**Cuando** se implementa pipeline
**Entonces** debe usar:
- **Opción 1: Apache Airflow**:
  - DAGs para orquestar pipeline
  - Scheduling robusto
  - UI para monitoreo
  - Retry automático en fallos
- **Opción 2: Cron Jobs + Scripts Python**:
  - Más simple para volúmenes moderados
  - Scripts en `/etl` folder
  - Logs en archivos
- **Opción 3: Debezium + Kafka** (avanzado):
  - CDC en tiempo real
  - Alta throughput
  - Más complejo de mantener
- **Recomendación**: Empezar con cron jobs, migrar a Airflow cuando escale

### CA-08: Queries Analíticos Optimizados
**Dado** que data warehouse debe ser rápido
**Cuando** se ejecutan queries
**Entonces** debe:
- **Uso de Materialised Views**:
  - Views pre-computadas de queries frecuentes
  - Refresh periódico (nightly)
  - Queries instantáneos (<100ms)
- **Ejemplos de Materialised Views**:
  ```sql
  -- Vista de progreso de usuarios
  CREATE MATERIALIZED VIEW mv_user_progress AS
  SELECT
    u.id,
    u.username,
    COUNT(mc.id) as mechanics_completed,
    AVG(mc.score) as avg_score,
    SUM(mc.time_spent) as total_time
  FROM users u
  LEFT JOIN mechanic_completions mc ON u.id = mc.user_id
  GROUP BY u.id, u.username;

  -- Refresh diario
  REFRESH MATERIALIZED VIEW mv_user_progress;
  ```
- **Query Optimization**:
  - EXPLAIN ANALYZE para identificar bottlenecks
  - Evitar full table scans
  - Usar índices apropiados

### CA-09: ClickHouse como OLAP (Opcional Avanzado)
**Dado** que se necesita ultra performance
**Cuando** volumen de datos es masivo (>100M registros)
**Entonces** considerar:
- **ClickHouse Advantages**:
  - Columnar storage (queries 10-100x más rápidos)
  - Compresión excelente (10:1 ratio)
  - Agregaciones ultra rápidas
  - Escala horizontalmente
- **Schema Ejemplo**:
  ```sql
  CREATE TABLE fact_mechanic_completions (
    date Date,
    user_id UUID,
    module_id UUID,
    mechanic_id UUID,
    score UInt8,
    time_spent UInt32,
    completed_at DateTime
  ) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(date)
  ORDER BY (date, user_id);
  ```
- **Integración**:
  - ETL inserta a ClickHouse
  - API lee de ClickHouse para analytics
  - PostgreSQL para datos transaccionales

### CA-10: Cache de Resultados
**Dado** que algunos queries se repiten
**Cuando** se ejecutan analytics
**Entonces** debe cachear:
- **Redis Cache**:
  - Resultados de queries frecuentes
  - TTL configurable (5min, 1h, 1 día)
  - Invalidación al actualizar datos
- **Ejemplos de Cache**:
  - Dashboard de admin: cache 5 minutos
  - Leaderboard: cache 1 minuto
  - Reportes mensuales: cache 1 día
- **Cache Strategy**:
  - Cache-aside pattern
  - Warming automático de caches importantes
  - Monitoreo de cache hit rate

### CA-11: API de Acceso a Data Warehouse
**Dado** que otros servicios necesitan datos analíticos
**Cuando** llaman a API
**Entonces** debe proveer:
- **Endpoints RESTful**:
  ```typescript
  GET /api/analytics/users/stats
  GET /api/analytics/modules/performance
  GET /api/analytics/institutions/comparison
  GET /api/analytics/economy/overview
  ```
- **Query Builder**:
  - Parámetros para filtrar (fecha, institución, módulo)
  - Agregaciones dinámicas (sum, avg, count)
  - Límites de resultados
- **Performance**:
  - Timeout de 30 segundos
  - Pagination para grandes datasets
  - Rate limiting: 1000 requests/hora
- **Autenticación**:
  - Solo usuarios autorizados (admins, profesores)
  - API keys para integraciones externas

### CA-12: Monitoreo y Observabilidad
**Dado** que pipeline debe ser confiable
**Cuando** opera ETL
**Entonces** debe monitorear:
- **Métricas de Pipeline**:
  - Tiempo de ejecución de cada job
  - Número de registros procesados
  - Errores y fallos
  - Latencia de sincronización (lag)
- **Alertas**:
  - Job falla: alerta inmediata (email, Slack)
  - Job tarda >2x tiempo normal: warning
  - Lag de sincronización >2 horas: critical
- **Dashboard**:
  - Grafana con métricas de ETL
  - Status de último run (success/fail)
  - Gráfico de records procesados por día
- **Logs Centralizados**:
  - ELK stack o similar
  - Logs de cada step del ETL
  - Búsqueda y filtrado

### CA-13: Backup y Disaster Recovery
**Dado** que data warehouse contiene datos valiosos
**Cuando** se pierde data
**Entonces** debe tener:
- **Backups Automáticos**:
  - Daily full backup
  - Hourly incremental (si crítico)
  - Retención: últimos 30 días
- **Restore Testing**:
  - Probar restore mensualmente
  - Documentar tiempo de recuperación (RTO)
  - Objetivo: restore en <4 horas
- **Replicación**:
  - Réplica en standby (hot/warm)
  - Failover automático o manual
- **Point-in-Time Recovery**:
  - Capacidad de restaurar a timestamp específico
  - Útil para corregir errores de ETL

### CA-14: Seguridad de Datos
**Dado** que data warehouse tiene datos sensibles
**Cuando** se accede
**Entonces** debe:
- **Encriptación**:
  - En tránsito: TLS/SSL
  - En reposo: disk encryption
- **Control de Acceso**:
  - RBAC (Role-Based Access Control)
  - Principio de mínimo privilegio
  - Audit log de accesos
- **Anonimización**:
  - PII hasheado o tokenizado
  - Datos de prueba en desarrollo (no prod data)
- **Network Security**:
  - Data warehouse en VPC privada
  - Acceso solo desde IPs permitidas
  - No expuesto a internet público

### CA-15: Documentación y Mantenimiento
**Dado** que el equipo debe entender pipeline
**Cuando** documentan sistema
**Entonces** debe incluir:
- **Documentación de Schema**:
  - ERD (Entity-Relationship Diagram)
  - Diccionario de datos (cada tabla, columna)
  - Relaciones entre tablas
- **Documentación de ETL**:
  - Diagrama de flujo de pipeline
  - Frecuencia de cada job
  - Dependencias entre jobs
- **Runbooks**:
  - Qué hacer si job falla
  - Cómo ejecutar ETL manual
  - Cómo agregar nuevas tablas
- **Change Management**:
  - Proceso para modificar schema
  - Testing de cambios en staging
  - Rollback plan

---

## Especificaciones Técnicas

### Data Warehouse Schema (Star Schema)
```sql
-- Fact Table: Mechanic Completions
CREATE TABLE fact_mechanic_completions (
  id UUID PRIMARY KEY,
  date_key INTEGER REFERENCES dim_date(date_key),
  user_key INTEGER REFERENCES dim_users(user_key),
  module_key INTEGER REFERENCES dim_modules(module_key),
  mechanic_id UUID,
  score NUMERIC(5,2),
  time_spent INTEGER, -- seconds
  cacao_earned INTEGER,
  completed_at TIMESTAMP
);

-- Dimension: Users
CREATE TABLE dim_users (
  user_key SERIAL PRIMARY KEY,
  user_id UUID UNIQUE,
  username VARCHAR(100),
  grade VARCHAR(50),
  institution_key INTEGER REFERENCES dim_institutions(institution_key),
  created_at DATE,
  -- SCD Type 2 for historical tracking
  valid_from DATE,
  valid_to DATE,
  is_current BOOLEAN
);

-- Dimension: Modules
CREATE TABLE dim_modules (
  module_key SERIAL PRIMARY KEY,
  module_id UUID UNIQUE,
  module_name VARCHAR(200),
  module_number INTEGER,
  category VARCHAR(100)
);

-- Dimension: Date
CREATE TABLE dim_date (
  date_key INTEGER PRIMARY KEY,
  full_date DATE,
  year INTEGER,
  quarter INTEGER,
  month INTEGER,
  day INTEGER,
  day_of_week VARCHAR(10),
  is_weekend BOOLEAN,
  is_holiday BOOLEAN
);

-- Dimension: Institutions
CREATE TABLE dim_institutions (
  institution_key SERIAL PRIMARY KEY,
  institution_id UUID UNIQUE,
  institution_name VARCHAR(200),
  country VARCHAR(100),
  type VARCHAR(50)
);

-- Aggregated Table: Daily User Activity
CREATE TABLE agg_daily_user_activity (
  date DATE,
  user_id UUID,
  logins INTEGER,
  mechanics_completed INTEGER,
  avg_score NUMERIC(5,2),
  total_time_spent INTEGER,
  cacao_earned INTEGER,
  cacao_spent INTEGER,
  PRIMARY KEY (date, user_id)
);

CREATE INDEX idx_agg_daily_date ON agg_daily_user_activity(date);
CREATE INDEX idx_agg_daily_user ON agg_daily_user_activity(user_id);
```

### ETL Pipeline (Airflow DAG Example)
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'email_on_failure': True,
    'email': ['alerts@gamilit.com'],
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'gamilit_daily_etl',
    default_args=default_args,
    description='Daily ETL pipeline for Gamilit analytics',
    schedule_interval='0 2 * * *',  # 2 AM daily
    start_date=datetime(2025, 1, 1),
    catchup=False,
)

extract_task = PythonOperator(
    task_id='extract_from_prod_db',
    python_callable=extract_data,
    dag=dag,
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag,
)

load_task = PythonOperator(
    task_id='load_to_warehouse',
    python_callable=load_data,
    dag=dag,
)

refresh_views_task = PythonOperator(
    task_id='refresh_materialized_views',
    python_callable=refresh_views,
    dag=dag,
)

extract_task >> transform_task >> load_task >> refresh_views_task
```

### Technology Stack
```
Data Warehouse:
- PostgreSQL 15+ (para volúmenes moderados)
- ClickHouse (para volúmenes masivos >100M registros)

ETL:
- Apache Airflow (orquestación)
- Python 3.10+ (scripts de ETL)
- Pandas para transformaciones
- SQLAlchemy para DB access

CDC (opcional):
- Debezium
- Apache Kafka

Cache:
- Redis para resultados frecuentes

Monitoreo:
- Grafana + Prometheus
- ELK Stack para logs

Backup:
- pg_dump para PostgreSQL
- ClickHouse backups
- AWS S3 para storage
```

### API Endpoints
```typescript
// Data Warehouse API
GET /api/dw/users/activity?from=2025-01-01&to=2025-01-31
GET /api/dw/modules/stats?moduleId=uuid
GET /api/dw/institutions/metrics
GET /api/dw/economy/flow

// ETL Management (admin only)
POST /api/etl/jobs/:jobId/trigger
GET  /api/etl/jobs/:jobId/status
GET  /api/etl/jobs/history
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI)
- **EP003**: Analytics directo sobre BD productiva
- Queries complejos degradan performance
- Sin datos históricos agregados
- Sin separación OLTP/OLAP

### Esta Historia (EXT-005)
- **Data Warehouse separado**: 0 impacto en producción
- **Pipeline ETL automatizado**: Sincronización diaria/hourly
- **Tablas agregadas**: Queries 10-50x más rápidos
- **Retención histórica**: 5+ años de datos
- **Particionamiento**: Escalabilidad infinita
- **ClickHouse**: Performance extremo (opcional)
- Esto es **infraestructura de analytics empresarial**

---

## Dependencias

### Depende de
- **EAI-001 a EAI-010**: Datos fuente de BD productiva
- **Infraestructura**: Servidores adicionales para DW

### Bloquea a
- **US-REP-002**: Analytics de admin (consume DW)
- **US-REP-003**: ML predictivo (consume DW)
- **US-REP-005**: Visualizaciones avanzadas (consume DW)

---

## Definición de Terminado (DoD)

- [ ] Data warehouse configurado (PostgreSQL o ClickHouse)
- [ ] Schema de star schema implementado
- [ ] Tablas de hechos y dimensiones creadas
- [ ] 5+ tablas agregadas (diarias, semanales, mensuales)
- [ ] Pipeline ETL funcional (Airflow o cron jobs)
- [ ] Full load inicial completado
- [ ] Incremental loads funcionando (hourly, daily)
- [ ] Particionamiento por fecha configurado
- [ ] Índices optimizados
- [ ] Materialised views creadas
- [ ] Cache de queries frecuentes (Redis)
- [ ] Políticas de retención implementadas
- [ ] Jobs de archivado automáticos
- [ ] Monitoreo con Grafana/similar
- [ ] Alertas configuradas (job failures)
- [ ] Backups automáticos funcionando
- [ ] Documentación de schema (ERD)
- [ ] Documentación de ETL pipeline
- [ ] Runbooks para operaciones
- [ ] Tests de restore de backup

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Full load inicial tarda días | Media | Medio | Ejecutar en fines de semana, paralelizar |
| ETL falla frecuentemente | Media | Alto | Retry automático, monitoreo proactivo |
| Data warehouse se queda sin espacio | Media | Crítico | Políticas de retención, monitoreo de disk |
| Queries aún lentos | Baja | Alto | ClickHouse, más índices, más agregaciones |
| Lag de sincronización alto | Media | Medio | CDC en tiempo real, optimizar ETL |

---

## Estimación Detallada (8 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño de schema (star schema) | 8h | Data Engineer |
| Setup data warehouse (PostgreSQL/ClickHouse) | 6h | DevOps |
| Creación de tablas y índices | 8h | Data Engineer |
| Pipeline ETL (extract) | 8h | Backend Dev |
| Pipeline ETL (transform) | 10h | Data Engineer |
| Pipeline ETL (load) | 8h | Backend Dev |
| Airflow DAGs | 10h | Data Engineer |
| Materialised views | 6h | Data Engineer |
| Cache layer (Redis) | 4h | Backend Dev |
| Políticas de retención | 4h | Data Engineer |
| Monitoreo y alertas | 8h | DevOps |
| Backups automáticos | 4h | DevOps |
| Testing de pipeline | 8h | QA + Data |
| Documentación | 6h | Tech Lead |
| **TOTAL** | **98h** | |

**Presupuesto**: $4,000 MXN (~$230 USD)
**Duración Estimada**: 2-3 días (equipo de 4-5 personas)

---

## Tags

#ext-005 #data-warehouse #etl #analytics #olap #clickhouse #airflow #performance #escalabilidad #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: EP003/US-003-30-analytics-aprendizaje.md (sección ETL extraída)
**Compliance**: PF-001 (XXX líneas)
