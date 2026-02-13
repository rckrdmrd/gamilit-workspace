# PLAN DE EJECUCION - FASE A: Completar EPICs 89 SP

**Tarea:** TASK-2026-02-03-FASE-A-EPICS-COMPLETAS
**Sistema:** SIMCO v4.3.0
**Fecha:** 2026-02-03
**Story Points Total:** 89 SP (~344 horas)

---

## ESTRUCTURA DE SPRINTS

```
SPRINT 1 (Semana 1-2): EXT-003 Notificaciones - 16 SP
SPRINT 2 (Semana 3-4): EXT-005 Reportes Fase 1 - 18 SP
SPRINT 3 (Semana 5-6): EXT-005 Reportes Fase 2 - 18 SP
SPRINT 4 (Semana 7-8): EXT-005 Reportes Fase 3 - 13 SP
SPRINT 5 (Semana 9): EXT-002 Admin Extendido - 15 SP
SPRINT 6 (Semana 10): EXT-001 Portal Maestros - 9 SP
```

---

## SPRINT 1: EXT-003 NOTIFICACIONES (16 SP)

### 1.1 SMS via Twilio (5 SP) - P1

**Subtareas:**
```
1.1.1 Configurar cuenta Twilio y API keys
1.1.2 Crear TwilioService en backend
1.1.3 Implementar endpoints SMS
1.1.4 Integrar con notification queue
1.1.5 Crear templates SMS
1.1.6 Testing end-to-end
```

**Archivos a crear/modificar:**
- `apps/backend/src/modules/notifications/services/twilio.service.ts`
- `apps/backend/src/modules/notifications/controllers/sms.controller.ts`
- `apps/backend/src/modules/notifications/dto/send-sms.dto.ts`
- `.env` - Agregar TWILIO_* variables

### 1.2 Socket.IO Escalabilidad (3 SP) - P1

**Subtareas:**
```
1.2.1 Configurar Redis adapter para Socket.IO
1.2.2 Implementar message persistence
1.2.3 Manejo de reconexiones
1.2.4 Testing de carga (100+ conexiones)
```

**Archivos a modificar:**
- `apps/backend/src/websocket/websocket.gateway.ts`
- `apps/backend/src/websocket/adapters/redis.adapter.ts`

### 1.3 Rate Limiting (2 SP) - P2

**Subtareas:**
```
1.3.1 Implementar rate limiter por usuario
1.3.2 Rate limiter por canal (email, sms, push)
1.3.3 Dashboard de metricas
```

### 1.4 Templates Avanzados (3 SP) - P2

**Subtareas:**
```
1.4.1 Logica condicional en templates
1.4.2 i18n multilenguaje
1.4.3 Versionado de templates
```

### 1.5 Auditoria Completa (3 SP) - P2

**Subtareas:**
```
1.5.1 Tracking de entrega
1.5.2 Logs de errores detallados
1.5.3 Analytics open/click rates
```

---

## SPRINT 2: EXT-005 REPORTES FASE 1 - DATA WAREHOUSE (18 SP)

### 2.1 Diseño Schema Dimensional (5 SP) - P0

**Subtareas:**
```
2.1.1 Diseñar fact tables (ejercicios, sesiones, transacciones)
2.1.2 Diseñar dimension tables (usuarios, modulos, tiempo)
2.1.3 Crear DDL para warehouse schema
2.1.4 Documentar ERD dimensional
```

**Archivos a crear:**
- `apps/database/ddl/schemas/data_warehouse/`
- `docs/90-transversal/arquitectura-database/DIMENSIONAL-MODEL.md`

### 2.2 ETL Pipeline Extraccion (5 SP) - P0

**Subtareas:**
```
2.2.1 Crear extractores por tabla fuente
2.2.2 Implementar extraccion incremental (CDC)
2.2.3 Logging de extracciones
2.2.4 Manejo de errores y reintentos
```

**Archivos a crear:**
- `apps/backend/src/modules/etl/services/extractor.service.ts`
- `apps/backend/src/modules/etl/jobs/extract.job.ts`

### 2.3 ETL Pipeline Transformacion (4 SP) - P0

**Subtareas:**
```
2.3.1 Transformadores de datos
2.3.2 Validaciones de calidad
2.3.3 Agregaciones y calculos
```

### 2.4 ETL Pipeline Carga (4 SP) - P0

**Subtareas:**
```
2.4.1 Carga a warehouse
2.4.2 Indices y particiones
2.4.3 Cargar datos historicos
2.4.4 Validar integridad
```

---

## SPRINT 3: EXT-005 REPORTES FASE 2 - ML PREDICTIONS (18 SP)

### 3.1 Feature Engineering (5 SP) - P0

**Subtareas:**
```
3.1.1 Identificar features predictivas
3.1.2 Crear vistas de features
3.1.3 Normalizar datos
3.1.4 Documentar feature store
```

### 3.2 Modelo de Prediccion (8 SP) - P0

**Subtareas:**
```
3.2.1 Seleccionar algoritmo (Random Forest/XGBoost)
3.2.2 Entrenar modelo de regresion
3.2.3 Entrenar modelo de clasificacion
3.2.4 Validacion cruzada K-fold
3.2.5 Optimizar hiperparametros
3.2.6 Guardar modelo serializado
```

### 3.3 API de Prediccion (5 SP) - P0

**Subtareas:**
```
3.3.1 Crear endpoint /predict
3.3.2 Cargar modelo en memoria
3.3.3 Cache de predicciones
3.3.4 Dashboard de metricas del modelo
```

---

## SPRINT 4: EXT-005 REPORTES FASE 3 - VISUALIZACIONES (13 SP)

### 4.1 Alertas ML (5 SP) - P1

**Subtareas:**
```
4.1.1 Configuracion de umbrales
4.1.2 Sistema de notificaciones
4.1.3 Testing de escenarios
```

### 4.2 Visualizaciones Avanzadas (5 SP) - P1

**Subtareas:**
```
4.2.1 Implementar treemaps
4.2.2 Scatter plots complejos
4.2.3 Heatmaps
4.2.4 Drill-down interactivo
```

### 4.3 Exportacion Multi-formato (3 SP) - P2

**Subtareas:**
```
4.3.1 PDF con graficos renderizados
4.3.2 PPTX (PowerPoint)
4.3.3 XLSX con macros
```

---

## SPRINT 5: EXT-002 ADMIN EXTENDIDO (15 SP)

### 5.1 LDAP/AD Integration (5 SP) - P1

**Subtareas:**
```
5.1.1 Configurar cliente LDAP
5.1.2 Sincronizar usuarios
5.1.3 Mapear roles
5.1.4 Testing con AD real
```

### 5.2 Bulk Operations (3 SP) - P2

**Subtareas:**
```
5.2.1 Bulk create usuarios
5.2.2 Bulk update roles
5.2.3 Bulk delete con confirmacion
```

### 5.3 Auditoria Avanzada (2 SP) - P2

**Subtareas:**
```
5.3.1 Filtros temporales granulares
5.3.2 Exportacion de logs
```

### 5.4 Webhooks Admin (3 SP) - P2

**Subtareas:**
```
5.4.1 Configurar webhooks
5.4.2 Eventos administrativos
5.4.3 Retry logic
```

### 5.5 Rate Limiting por Rol (2 SP) - P3

**Subtareas:**
```
5.5.1 Configurar limites por rol
5.5.2 Dashboard de uso
```

---

## SPRINT 6: EXT-001 PORTAL MAESTROS (9 SP)

### 6.1 WebSocket Notifications (3 SP) - P1

**Subtareas:**
```
6.1.1 Conexion persistente
6.1.2 Fallback para desconexiones
6.1.3 Testing de carga
```

### 6.2 Exportacion XLSX Avanzada (2 SP) - P2

**Subtareas:**
```
6.2.1 Formulas dinamicas
6.2.2 Estilos y formatos
```

### 6.3 Accesibilidad WCAG 2.1 (2 SP) - P2

**Subtareas:**
```
6.3.1 Auditoria de accesibilidad
6.3.2 Correcciones WCAG AA
```

### 6.4 Cache Optimizado (2 SP) - P2

**Subtareas:**
```
6.4.1 Cache Redis para reportes
6.4.2 Invalidacion inteligente
```

---

## DIAGRAMA DE DEPENDENCIAS

```
SPRINT 1 (EXT-003) ──┐
                     │
SPRINT 2 (DW+ETL) ───┼─ SPRINT 3 (ML) ── SPRINT 4 (Viz+Alertas)
                     │
SPRINT 5 (Admin) ────┘

SPRINT 6 (Teacher) ── Independiente
```

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Twilio API rate limits | Media | Alto | Implementar queue y retry |
| ML modelo poco preciso | Media | Alto | Validacion cruzada, fallback a reglas |
| Data Warehouse lento | Baja | Alto | Indices, particiones, cache |
| LDAP incompatible | Media | Medio | Abstraccion de directorio |

---

## METRICAS DE EXITO

| Sprint | Criterio de Exito |
|--------|-------------------|
| 1 | SMS enviados, WebSocket 100+ conexiones |
| 2 | ETL ejecuta sin errores, DW poblado |
| 3 | Modelo >80% accuracy, API responde <100ms |
| 4 | Alertas funcionan, graficos renderizan |
| 5 | LDAP sincroniza, bulk operations OK |
| 6 | Teacher 100%, WCAG AA pass |

---

*Sistema SIMCO v4.3.0*
*Plan de 89 SP / 6 Sprints / 10 Semanas*
