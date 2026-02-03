---
id: "US-REP-002"
title: "Dashboard Analítico para Administrador de Plataforma"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-005"
story_points: 13
budget: "$6,500 MXN"
sprint: "Sprint-Mes3"
labels: ["ext-005", "analytics", "admin", "dashboard", "reportes", "metricas", "performance", "economia", "instituciones", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-REP-002: Analytics para Administrador de Plataforma

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-REP-002 |
| **Épica** | EXT-005 - Reportes Avanzados |
| **Título** | Dashboard Analítico para Administrador de Plataforma |
| **Prioridad** | Alta (P1) |
| **Story Points** | 13 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $6,500 MXN |

---

## Historia de Usuario

**Como** administrador de la plataforma Gamilit
**Quiero** visualizar métricas globales, análisis de uso, performance técnico y comparativas entre instituciones
**Para** tomar decisiones estratégicas, identificar problemas y optimizar la plataforma

---

## Valor de Negocio

### Impacto
- **Decisiones Data-Driven**: Insights accionables para estrategia
- **Performance Monitoring**: Detectar problemas técnicos proactivamente
- **Growth Tracking**: Métricas de adopción y crecimiento
- **ROI**: Demostrar valor a stakeholders e instituciones

### Métricas de Éxito
- Dashboard carga en <3 segundos con millones de registros
- >90% de decisiones estratégicas basadas en analytics
- Reducción 50% en tiempo de detección de problemas
- Admins usan dashboard 3+ veces por día

---

## Criterios de Aceptación

### CA-01: Dashboard de Métricas Globales
**Dado** que el admin accede al dashboard principal
**Cuando** visualiza métricas globales
**Entonces** debe ver:
- **KPIs Principales** (tarjetas destacadas):
  - Total de usuarios registrados (con crecimiento % vs mes anterior)
  - Usuarios activos (DAU, WAU, MAU)
  - Instituciones activas
  - Mecánicas completadas hoy/semana/mes
  - Ingresos totales (ML Coins vendidos)
  - NPS Score promedio
- **Gráficos de Tendencias**:
  - Crecimiento de usuarios (últimos 12 meses)
  - Actividad diaria (últimos 30 días)
  - Retención por cohorte (cohort analysis)
- Filtros: Fecha, Institución, País, Región
- Exportar dashboard completo como PDF

### CA-02: Métricas de Usuarios
**Dado** que el admin analiza base de usuarios
**Cuando** accede a sección de usuarios
**Entonces** debe ver:
- **Registros**:
  - Nuevos usuarios por día/semana/mes (gráfico de línea)
  - Distribución por rol (estudiante, profesor, admin)
  - Fuentes de registro (web, mobile, invitación)
  - Tasa de conversión de invitados a registrados
- **Actividad**:
  - DAU (Daily Active Users)
  - WAU (Weekly Active Users)
  - MAU (Monthly Active Users)
  - Stickiness: DAU/MAU ratio
  - Usuarios activos por hora del día (heatmap)
  - Usuarios activos por día de semana
- **Churn**:
  - Tasa de churn mensual
  - Usuarios en riesgo (no activos 7+ días)
  - Razones de abandono (si se recolectan)
  - Tasa de reactivación
- **Demografía**:
  - Distribución por edad/grado
  - Distribución geográfica (mapa)
  - Distribución por institución
- Tabla de usuarios con búsqueda y filtros avanzados
- Exportar reportes a Excel/CSV

### CA-03: Análisis de Uso de Plataforma
**Dado** que el admin analiza comportamiento
**Cuando** accede a análisis de uso
**Entonces** debe ver:
- **Módulos Más Populares**:
  - Top 5 módulos por completaciones
  - Módulos con mayor tiempo de estudio
  - Módulos con mejor score promedio
  - Módulos menos completados (alertas)
- **Actividades Más Usadas**:
  - Top mecánicas por tipo
  - Mecánicas con mayor engagement
  - Mecánicas con peor performance (altas tasas de abandono)
- **Paths de Navegación**:
  - Flujos comunes (Sankey diagram)
  - Bounce rate por página
  - Tiempo promedio por sección
- **Features Adoption**:
  - % usuarios que usan mensajería
  - % usuarios que usan leaderboard
  - % usuarios que usan tienda ML
  - % usuarios que personalizan perfil
- **Dispositivos y Browsers**:
  - Desktop vs Mobile vs Tablet
  - Browsers más usados
  - Sistemas operativos
  - Resoluciones de pantalla

### CA-04: Performance Técnico
**Dado** que el admin monitorea salud técnica
**Cuando** accede a métricas de performance
**Entonces** debe ver:
- **Tiempos de Respuesta**:
  - API response time (p50, p95, p99)
  - Page load time
  - Database query time
  - Gráficos de tendencias (últimas 24h, 7 días)
- **Errores**:
  - Tasa de errores (error rate %)
  - Top errores por frecuencia
  - Errores por endpoint
  - Stack traces de errores críticos
  - Integración con Sentry o similar
- **Uptime**:
  - Uptime % (últimos 30 días)
  - Incidentes y downtime
  - SLA compliance
- **Infraestructura**:
  - CPU usage
  - Memory usage
  - Disk usage
  - Database connections
  - Cache hit rate (Redis)
- **Alertas Automáticas**:
  - Error rate >5%
  - Response time >1s (p95)
  - Uptime <99.5%
  - Disk space <20%
- Dashboard de status en vivo (auto-refresh cada 30s)

### CA-05: Economía y Transacciones
**Dado** que el admin monitorea economía de plataforma
**Cuando** accede a analytics económicos
**Entonces** debe ver:
- **ML Coins**:
  - Total de Cacao en circulación
  - Cacao generado por mecánicas (últimos 30 días)
  - Cacao gastado en tienda
  - Balance promedio por usuario
  - Distribución de riqueza (top 10%, mediana, etc.)
- **Transacciones**:
  - Compras en tienda por categoría
  - Items más vendidos (top 10)
  - Revenue virtual (si hay monetización)
  - Tasa de conversión en tienda
- **Uso de Ayudas**:
  - Ayudas más compradas
  - Ayudas más usadas
  - Efectividad de ayudas (mejora score después de usar)
- **Economía Saludable**:
  - Ratio ganancia/gasto por usuario
  - Inflación/deflación de Cacao
  - Usuarios con balance negativo (si aplica)
- Gráficos de flujo de Cacao (Sankey)

### CA-06: Comparativas entre Instituciones
**Dado** que la plataforma es multi-tenant
**Cuando** el admin compara instituciones
**Entonces** debe ver:
- **Tabla Comparativa**:
  - Nombre de institución
  - Total de usuarios
  - Usuarios activos (MAU)
  - Engagement rate
  - NPS Score
  - Mecánicas completadas promedio por usuario
  - Score promedio general
- **Ordenar por**: Cualquier columna
- **Filtros**: País, tipo de institución, tamaño
- **Benchmarking**:
  - Top 3 instituciones por engagement
  - Instituciones con mejores resultados académicos
  - Instituciones con peor performance (requieren atención)
- **Drill-down**: Click en institución para ver detalles
- Exportar comparativa a Excel
- Enviar reporte automático mensual a cada institución

### CA-07: Reportes Personalizados
**Dado** que el admin necesita reportes específicos
**Cuando** crea reporte personalizado
**Entonces** puede:
- **Constructor de Reportes**:
  - Seleccionar métricas (multi-select)
  - Seleccionar dimensiones (fecha, institución, módulo, etc.)
  - Seleccionar filtros
  - Seleccionar tipo de visualización (tabla, gráfico de barras, línea, pie)
  - Preview en tiempo real
- **Guardar Reportes**:
  - Nombrar reporte
  - Guardar configuración
  - Acceso rápido a reportes guardados
- **Programar Reportes**:
  - Envío automático por email
  - Frecuencia: Diaria, Semanal, Mensual
  - Destinatarios (múltiples emails)
  - Formato: PDF, Excel, CSV
- **Templates Predefinidos**:
  - "Reporte Ejecutivo Mensual"
  - "Análisis de Churn"
  - "Performance de Módulos"
  - "Estado de Infraestructura"

### CA-08: Exportación Avanzada
**Dado** que el admin necesita datos fuera de plataforma
**Cuando** exporta reportes
**Entonces** puede:
- **Exportar a PDF**:
  - Dashboard completo con gráficos
  - Logo y branding de institución
  - Fecha de generación
  - Calidad de impresión alta
- **Exportar a Excel**:
  - Múltiples sheets (por sección)
  - Gráficos incluidos
  - Tablas formateadas
  - Pivot tables pre-configuradas
- **Exportar a CSV**:
  - Datos crudos sin formato
  - Delimitador configurable
  - Encoding UTF-8
- **API de Datos**:
  - Endpoints para extraer datos programáticamente
  - Autenticación con API key
  - Rate limiting
  - Documentación Swagger

### CA-09: Alertas y Notificaciones Inteligentes
**Dado** que el admin necesita detectar problemas
**Cuando** ocurren eventos significativos
**Entonces** debe recibir:
- **Alertas Automáticas**:
  - Churn rate aumenta >10% (alerta crítica)
  - Error rate >5% por más de 5 minutos
  - Uptime cae <99%
  - Usuario reporta error crítico
  - Institución nueva registrada
  - Spike de tráfico inusual (posible ataque)
- **Canales de Notificación**:
  - Email
  - Slack webhook
  - SMS (para críticos)
  - In-app notification
- **Configuración de Alertas**:
  - Definir thresholds personalizados
  - Activar/desactivar alertas
  - Snooze temporal
- **Historial de Alertas**:
  - Log de todas las alertas
  - Estado: Activa, Resuelta, Falsa Alarma
  - Tiempo de respuesta

### CA-10: Analytics Predictivo (Básico)
**Dado** que el admin quiere anticipar problemas
**Cuando** visualiza predicciones
**Entonces** debe ver:
- **Proyecciones**:
  - Usuarios proyectados para próximo mes (basado en tendencias)
  - Churn proyectado
  - Revenue proyectado
- **Alertas Tempranas**:
  - Instituciones en riesgo de churn
  - Módulos con tendencia decreciente en uso
  - Features con baja adopción
- **Recomendaciones Automáticas**:
  - "Considera agregar tutoriales para Módulo X (abandono alto)"
  - "Institución Y necesita soporte (NPS bajo)"
  - "Feature Z tiene alta adopción, considera expandir"

### CA-11: Audit Trail y Logs
**Dado** que se necesita trazabilidad
**Cuando** el admin accede a logs
**Entonces** debe ver:
- **Log de Acciones de Admins**:
  - Quién accedió al dashboard
  - Qué reportes se generaron
  - Qué configuraciones se modificaron
  - Timestamp de cada acción
- **Búsqueda de Logs**:
  - Por usuario admin
  - Por fecha
  - Por tipo de acción
- **Retención**: Logs por 12 meses mínimo
- **Export de Logs**: CSV para auditoría externa

### CA-12: Responsive y Multi-Dispositivo
**Dado** que admins pueden revisar desde cualquier lugar
**Cuando** acceden al dashboard
**Entonces** debe:
- **Desktop (>1200px)**: Layout completo con múltiples gráficos
- **Tablet (768px-1199px)**: Layout adaptado, 2 columnas
- **Mobile (< 768px)**: Vista simplificada, métricas clave
- Gráficos responsivos (ajustan tamaño)
- Tablas con scroll horizontal si necesario
- Exportar funciona en todos los dispositivos

### CA-13: Performance del Dashboard
**Dado** que puede haber millones de registros
**Cuando** el admin consulta analytics
**Entonces** debe:
- Dashboard inicial carga en <3 segundos
- Queries complejos responden en <5 segundos
- Usar agregaciones pre-calculadas (materialised views)
- Cache de métricas frecuentes (Redis)
- Pagination en tablas grandes
- Lazy loading de gráficos fuera de viewport
- Índices optimizados en base de datos

### CA-14: Seguridad y Permisos
**Dado** que analytics contiene datos sensibles
**Cuando** usuarios acceden
**Entonces** el sistema debe:
- **Control de Acceso**:
  - Solo roles "Super Admin" y "Platform Admin"
  - Instituciones ven solo sus datos (si tienen acceso parcial)
- **Audit de Accesos**:
  - Log de quién accede a qué datos
  - Detección de accesos sospechosos
- **Encriptación**:
  - Datos sensibles encriptados en tránsito (HTTPS)
  - Datos sensibles encriptados en reposo
- **GDPR Compliance**:
  - Anonimización de datos personales en reportes
  - Derecho al olvido (eliminar datos de usuario)

### CA-15: Integración con Herramientas Externas
**Dado** que admins usan otras herramientas
**Cuando** integran analytics
**Entonces** pueden:
- **Google Data Studio**: Conectar vía API
- **Tableau**: Export de datos para visualización
- **Excel Power BI**: Conexión directa
- **Slack**: Enviar reportes automáticos
- **Webhooks**: Notificar eventos a sistemas externos
- Documentación de integraciones

---

## Especificaciones Técnicas

### Frontend Components
```
src/features/admin-analytics/
├── pages/
│   ├── AdminDashboardPage.tsx
│   ├── UsersAnalyticsPage.tsx
│   ├── UsageAnalyticsPage.tsx
│   ├── PerformancePage.tsx
│   ├── EconomyPage.tsx
│   └── InstitutionsComparePage.tsx
├── components/
│   ├── KPICard.tsx
│   ├── TrendChart.tsx
│   ├── CohortTable.tsx
│   ├── HeatmapChart.tsx
│   ├── SankeyFlowChart.tsx
│   ├── GeoMap.tsx
│   ├── ReportBuilder.tsx
│   ├── ExportModal.tsx
│   ├── AlertsPanel.tsx
│   └── InstitutionComparison.tsx
├── hooks/
│   ├── useAdminAnalytics.ts
│   ├── useExport.ts
│   └── useAlerts.ts
└── utils/
    ├── analyticsCalculator.ts
    ├── exportGenerator.ts
    └── chartConfigs.ts
```

### TypeScript Interfaces
```typescript
interface PlatformMetrics {
  totalUsers: number;
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
    stickiness: number; // DAU/MAU
  };
  growth: {
    userGrowth: number; // %
    mauGrowth: number; // %
  };
  institutions: {
    total: number;
    active: number;
  };
  activity: {
    mechanicsCompletedToday: number;
    mechanicsCompletedWeek: number;
    mechanicsCompletedMonth: number;
  };
  economy: {
    totalCacaoInCirculation: number;
    cacaoGeneratedThisMonth: number;
    cacaoSpentThisMonth: number;
  };
  npsScore: number;
}

interface UserAnalytics {
  registrations: {
    today: number;
    week: number;
    month: number;
    trend: number[]; // últimos 30 días
  };
  churn: {
    rate: number; // %
    usersAtRisk: number;
    reactivationRate: number;
  };
  demographics: {
    byAge: { [grade: string]: number };
    byCountry: { [country: string]: number };
    byInstitution: { [institutionId: string]: number };
  };
}

interface UsageAnalytics {
  topModules: {
    id: string;
    name: string;
    completions: number;
    avgScore: number;
    avgTime: number; // minutes
  }[];
  topMechanics: {
    type: string;
    count: number;
    engagement: number; // %
  }[];
  featureAdoption: {
    [feature: string]: number; // % of users
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number; // %
  uptime: number; // %
  infrastructure: {
    cpu: number; // %
    memory: number; // %
    disk: number; // %
    dbConnections: number;
    cacheHitRate: number; // %
  };
}

interface InstitutionComparison {
  institutionId: string;
  name: string;
  totalUsers: number;
  activeUsers: number;
  engagementRate: number; // %
  npsScore: number;
  avgMechanicsPerUser: number;
  avgScore: number;
}

interface CustomReport {
  id: string;
  name: string;
  createdBy: string;
  metrics: string[];
  dimensions: string[];
  filters: { [key: string]: any };
  visualization: 'table' | 'bar' | 'line' | 'pie';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
  createdAt: Date;
}
```

### API Endpoints
```typescript
// Platform Metrics
GET /api/admin/analytics/metrics
GET /api/admin/analytics/users
GET /api/admin/analytics/usage
GET /api/admin/analytics/performance
GET /api/admin/analytics/economy
GET /api/admin/analytics/institutions/compare

// Custom Reports
GET    /api/admin/reports
POST   /api/admin/reports
PUT    /api/admin/reports/:id
DELETE /api/admin/reports/:id
POST   /api/admin/reports/:id/run
POST   /api/admin/reports/:id/schedule

// Exports
POST /api/admin/analytics/export/pdf
POST /api/admin/analytics/export/excel
POST /api/admin/analytics/export/csv

// Alerts
GET    /api/admin/alerts
POST   /api/admin/alerts
PUT    /api/admin/alerts/:id
DELETE /api/admin/alerts/:id

// Audit
GET /api/admin/audit/logs
```

### Technology Stack
```
Frontend:
- Recharts o Chart.js para visualizaciones
- react-table para tablas avanzadas
- date-fns para manejo de fechas
- jspdf + html2canvas para exportar PDF
- xlsx para exportar Excel

Backend:
- PostgreSQL con materialised views
- ClickHouse para OLAP (opcional, para grandes volúmenes)
- Redis para cache de métricas
- Bull para queue de reportes programados
- node-cron para scheduled tasks
- Sentry para error tracking
- Puppeteer para generar PDFs server-side
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI-004)
- **US-REP-001**: Analytics para profesor (sus aulas)
- Vista limitada a estudiantes de un profesor
- Métricas básicas de progreso

### Esta Historia (EXT-005)
- **Vista de plataforma completa**: Todas las instituciones
- **Métricas de negocio**: Churn, DAU/MAU, NPS
- **Performance técnico**: Uptime, errores, infraestructura
- **Economía**: ML Coins, transacciones
- **Comparativas**: Entre instituciones
- **Reportes personalizados**: Constructor + programación
- **Exportación avanzada**: PDF con gráficos, Excel multi-sheet
- Esto es **analytics empresarial vs analytics educativo**

---

## Dependencias

### Depende de
- **EAI-001 a EAI-010**: Datos de todos los módulos
- **US-REP-004**: Data warehouse (para performance)

### Bloquea a
- **US-REP-003**: Analytics predictivo (usa estos datos)

---

## Definición de Terminado (DoD)

- [ ] Dashboard principal con KPIs
- [ ] Analytics de usuarios (registros, actividad, churn)
- [ ] Analytics de uso (módulos, mecánicas, features)
- [ ] Métricas de performance técnico
- [ ] Analytics de economía (Cacao, transacciones)
- [ ] Comparativa entre instituciones
- [ ] Constructor de reportes personalizados
- [ ] Programación de reportes automáticos
- [ ] Exportación a PDF con gráficos
- [ ] Exportación a Excel multi-sheet
- [ ] Sistema de alertas inteligentes
- [ ] Audit trail de acciones
- [ ] Responsive design
- [ ] Performance <3s carga inicial
- [ ] Tests unitarios >80% coverage
- [ ] Tests de integración
- [ ] API documentada (Swagger)
- [ ] Guía de usuario para admins
- [ ] Dashboards en Grafana/similar para infraestructura

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Queries lentos con millones de registros | Alta | Alto | Materialised views, índices, ClickHouse |
| Dashboard complejo confunde | Media | Medio | UX testing, tooltips, onboarding |
| Datos sensibles expuestos | Media | Crítico | RBAC estricto, encriptación, audit logs |
| Reportes programados sobrecargan sistema | Media | Medio | Queue system, rate limiting, horarios nocturnos |

---

## Estimación Detallada (13 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX dashboard | 12h | UX Designer |
| Dashboard principal | 12h | Frontend Dev |
| Analytics de usuarios | 10h | Frontend Dev |
| Analytics de uso | 10h | Frontend Dev |
| Performance monitoring | 8h | Frontend Dev |
| Economics analytics | 8h | Frontend Dev |
| Comparativa instituciones | 8h | Frontend Dev |
| Report builder | 12h | Frontend Dev |
| Exportación avanzada | 10h | Backend Dev |
| API endpoints | 16h | Backend Dev |
| Materialised views | 10h | Backend Dev |
| Sistema de alertas | 10h | Backend Dev |
| Scheduled reports | 8h | Backend Dev |
| Audit logging | 6h | Backend Dev |
| Testing | 16h | QA + Devs |
| Documentación | 6h | Tech Lead |
| **TOTAL** | **162h** | |

**Presupuesto**: $6,500 MXN (~$370 USD)
**Duración Estimada**: 4-5 días (equipo de 6-8 personas)

---

## Tags

#ext-005 #analytics #admin #dashboard #reportes #metricas #performance #economia #instituciones #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: EP005/US-005-16-analytics-page.md (vista de admin extraída)
**Compliance**: PF-001 (XXX líneas)
