---
id: "US-AE-014"
title: "Dashboard de Analiticas del Sistema"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 10
budget: "$4,000 MXN"
sprint: "Sprint-3"
labels: ["admin-extendido", "analytics", "dashboard", "metrics", "export", "csv"]
created_date: "2025-11-24"
updated_date: "2026-01-20"
completed_date: "2025-11-24"
---

# US-AE-014: Dashboard de Analiticas del Sistema

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-014 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Dashboard de Analiticas del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 10 SP |
| **Estado** | Done |
| **Sprint** | Sprint 3 |
| **Duracion Estimada** | 4 dias |
| **Fecha Implementacion** | 2025-11-24 |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** acceder a un dashboard completo de analiticas con metricas de usuarios, engagement, gamificacion y retencion
**Para** tomar decisiones informadas basadas en datos, identificar areas de mejora y monitorear el desempeno de la plataforma

---

## Endpoints API (7 endpoints)

| # | Endpoint | Descripcion |
|---|----------|-------------|
| 1 | `GET /api/admin/analytics/overview` | Metricas de alto nivel (usuarios totales, promedios, segmentacion) |
| 2 | `GET /api/admin/analytics/engagement` | Engagement por segmento de usuario (filtrable por role y fecha) |
| 3 | `GET /api/admin/analytics/gamification` | Distribucion de XP, rangos Maya y niveles |
| 4 | `GET /api/admin/analytics/activity-timeline` | Metricas diarias de actividad (configurable 1-90 dias) |
| 5 | `GET /api/admin/analytics/top-users` | Ranking de usuarios por metrica (XP, ejercicios, racha) |
| 6 | `GET /api/admin/analytics/retention` | Retencion por cohorte mensual (ultimos 12 meses) |
| 7 | `GET /api/admin/analytics/export` | Exportacion de datos a formato CSV |

**Guards:** `JwtAuthGuard` + `AdminGuard`
**Servicio:** `AdminAnalyticsService`
**Rate Limit:** 30 req/min (heredado de admin middleware)

---

## Criterios de Aceptacion

### Tab 1: Overview (Vista General)

#### AC-1.1: Metricas de Alto Nivel
**DADO** que soy super admin autenticado
**CUANDO** accedo al tab "General" del dashboard de analiticas
**ENTONCES** veo las metricas principales:
- Total de usuarios registrados
- Usuarios activos (ultimos 30 dias)
- Promedio de XP por usuario
- Promedio de ejercicios completados
- Segmentacion por tipo de usuario

#### AC-1.2: Timeline de Actividad
**DADO** que estoy en el tab Overview
**CUANDO** visualizo el grafico de actividad
**ENTONCES** veo metricas diarias de los ultimos 30 dias:
- Usuarios unicos activos por dia
- Ejercicios completados por dia
- Logins por dia

#### AC-1.3: Top Users
**DADO** que estoy en el tab Overview
**CUANDO** visualizo la seccion de Top Users
**ENTONCES** veo los 10 usuarios con mayor XP:
- Nombre y email del usuario
- XP total acumulado
- Nivel actual
- Rango Maya

---

### Tab 2: Engagement

#### AC-2.1: Metricas por Segmento
**DADO** que soy super admin autenticado
**CUANDO** accedo al tab "Engagement"
**ENTONCES** veo metricas de engagement agrupadas por segmento:
- Inactivos (sin actividad reciente)
- Principiantes (poca actividad)
- Intermedios (actividad moderada)
- Avanzados (alta actividad)

#### AC-2.2: Filtros de Engagement
**DADO** que estoy en el tab Engagement
**CUANDO** aplico filtros de role o fecha
**ENTONCES** las metricas se actualizan segun los filtros:
- Filtro por role: student, admin_teacher, etc.
- Filtro por fecha de registro (date_from)

#### AC-2.3: Indicador de Datos Limitados
**DADO** que el sistema tiene pocos datos historicos
**CUANDO** visualizo el tab Engagement
**ENTONCES** veo un badge "Datos limitados" con tooltip explicativo

---

### Tab 3: Gamificacion

#### AC-3.1: Distribucion de XP
**DADO** que soy super admin autenticado
**CUANDO** accedo al tab "Gamificacion"
**ENTONCES** veo la distribucion de usuarios por rangos de XP:
- 0-100 XP
- 100-500 XP
- 500-1000 XP
- 1000+ XP

#### AC-3.2: Distribucion de Rangos Maya
**DADO** que estoy en el tab Gamificacion
**CUANDO** visualizo la seccion de rangos
**ENTONCES** veo cuantos usuarios hay en cada rango Maya:
- Ajaw, B'alam, Chaak, K'inich, etc.

#### AC-3.3: Distribucion de Niveles
**DADO** que estoy en el tab Gamificacion
**CUANDO** visualizo la seccion de niveles
**ENTONCES** veo la distribucion de usuarios por nivel de juego

---

### Tab 4: Retencion

#### AC-4.1: Analisis de Cohortes
**DADO** que soy super admin autenticado
**CUANDO** accedo al tab "Retencion"
**ENTONCES** veo metricas de retencion por cohorte mensual:
- Mes de registro (cohorte)
- Usuarios registrados ese mes
- Usuarios activos actualmente
- Tasa de retencion (%)

#### AC-4.2: Indicador Beta
**DADO** que el analisis de retencion requiere minimo 30 dias de datos
**CUANDO** visualizo el tab Retencion
**ENTONCES** veo un badge "Beta" con tooltip explicativo

---

### Funcionalidad: Exportacion CSV

#### AC-5.1: Boton de Exportacion
**DADO** que soy super admin autenticado
**CUANDO** hago clic en "Exportar CSV"
**ENTONCES** el sistema inicia la descarga del archivo CSV

#### AC-5.2: Tipos de Exportacion
**DADO** que solicito una exportacion
**CUANDO** el sistema genera el CSV
**ENTONCES** incluye datos segun el tipo:
- `overview` - Metricas generales
- `users` - Datos de usuarios
- `engagement` - Metricas de engagement
- `gamification` - Datos de gamificacion

#### AC-5.3: Formato del Archivo
**DADO** que la exportacion finaliza
**CUANDO** descargo el archivo
**ENTONCES** el archivo cumple:
- Formato: `analytics-{type}-{YYYY-MM-DD}.csv`
- Content-Type: text/csv
- Codificacion UTF-8

#### AC-5.4: Feedback de Exportacion
**DADO** que hago clic en exportar
**CUANDO** la exportacion esta en progreso
**ENTONCES** veo indicador de carga en el boton
**Y** al completar veo toast de exito o error

---

### Funcionalidad: Actualizacion de Datos

#### AC-6.1: Boton Actualizar
**DADO** que estoy en cualquier tab de analiticas
**CUANDO** hago clic en "Actualizar"
**ENTONCES** todos los datos se recargan desde el backend

#### AC-6.2: Indicador de Carga
**DADO** que los datos se estan cargando
**CUANDO** visualizo la pagina
**ENTONCES** veo un spinner de carga centrado

#### AC-6.3: Manejo de Errores
**DADO** que ocurre un error al cargar datos
**CUANDO** la peticion falla
**ENTONCES** veo mensaje de error con descripcion del problema

---

## Wireframe ASCII

```
+==============================================================================+
|                         ADMIN ANALYTICS DASHBOARD                             |
+==============================================================================+
|                                                                               |
|  [TrendingUp Icon]  Analiticas                                                |
|  Analisis completo de usuarios, engagement, gamificacion y retencion          |
|                                                                               |
|  +----------------+  +----------------+                                        |
|  | [Download]     |  | [RefreshCw]    |                                        |
|  | Exportar CSV   |  | Actualizar     |                                        |
|  +----------------+  +----------------+                                        |
|                                                                               |
+-------------------------------------------------------------------------------+
|                              TAB NAVIGATION                                    |
+-------------------------------------------------------------------------------+
|  +-------------------+ +-------------------+ +-------------------+ +---------+ |
|  | [BarChart3]       | | [Users]           | | [Award]           | | [Target]| |
|  | General           | | Engagement        | | Gamificacion      | | Retencion|
|  | Vista general y   | | Analisis por      | | XP, rangos y      | | Analisis |
|  | metricas          | | segmento          | | niveles           | | cohortes |
|  |                   | | [Datos limitados] | |                   | | [Beta]   |
|  +-------------------+ +-------------------+ +-------------------+ +---------+ |
+-------------------------------------------------------------------------------+

================================================================================
                              TAB: GENERAL (Overview)
================================================================================
|                                                                               |
|  +------------------+ +------------------+ +------------------+ +------------+ |
|  | [Users]          | | [Activity]       | | [Award]          | | [Trending] | |
|  | Total Usuarios   | | Usuarios Activos | | XP Promedio      | | Ejercicios | |
|  | 1,250            | | 850              | | 1,523            | | 13         | |
|  +------------------+ +------------------+ +------------------+ +------------+ |
|                                                                               |
|  +--------------------------------+  +--------------------------------------+  |
|  | Distribucion por Segmento     |  | Estadisticas Adicionales             |  |
|  | +----------+                  |  |                                       |  |
|  | |    PIE   |   Inactivos  10% |  | Total Estudiantes      1,000         |  |
|  | |   CHART  |   Principiant36% |  | Total Profesores          50         |  |
|  | |          |   Intermedio 30% |  | Engagement Promedio    67.5%         |  |
|  | |          |   Avanzados  24% |  | Usuarios Inactivos       120         |  |
|  | +----------+                  |  |                                       |  |
|  +--------------------------------+  +--------------------------------------+  |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Actividad de los Ultimos 30 Dias                                         | |
|  |                                                                           | |
|  |   ^                                                                       | |
|  |   |     /\        /\                                                      | |
|  |   |    /  \  /\  /  \    --- Usuarios Unicos                             | |
|  |   |   /    \/  \/    \   ... Total Actividades                           | |
|  |   +--------------------->                                                 | |
|  |     Ene   Feb   Mar                                                       | |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Top 10 Usuarios                                                          | |
|  | +------+---------------+------------------+-------+-----------+--------+ | |
|  | |  #   | Usuario       | Email            |  XP   | Ejercicios|  Rango | | |
|  | +------+---------------+------------------+-------+-----------+--------+ | |
|  | |  1   | Juan Perez    | juan@...         | 5,230 |    45     | B'alam | | |
|  | |  2   | Maria Garcia  | maria@...        | 4,890 |    42     | B'alam | | |
|  | |  3   | Carlos Lopez  | carlos@...       | 4,120 |    38     | Chaak  | | |
|  | +------+---------------+------------------+-------+-----------+--------+ | |
|  +--------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+

================================================================================
                              TAB: ENGAGEMENT
================================================================================
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Engagement por Segmento de Usuario                                       | |
|  |                                                                           | |
|  | +----------------+--------+------------+----------+--------+-----------+  | |
|  | | Segmento       | Usuarios| Engagement | Ejerc.  | Racha  | Actv 7d   |  | |
|  | +----------------+--------+------------+----------+--------+-----------+  | |
|  | | Inactivos      |   120  |   15.2%    |    2.1   |  0.0   |     0     |  | |
|  | | Principiantes  |   450  |   42.5%    |    8.3   |  1.2   |   180     |  | |
|  | | Intermedios    |   380  |   72.5%    |   15.3   |  5.8   |   320     |  | |
|  | | Avanzados      |   300  |   92.1%    |   28.7   | 12.4   |   285     |  | |
|  | +----------------+--------+------------+----------+--------+-----------+  | |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
|  Filtros: [Role: Todos v] [Fecha desde: ______ ]                              |
|                                                                               |
+-------------------------------------------------------------------------------+

================================================================================
                              TAB: GAMIFICACION
================================================================================
|                                                                               |
|  +------------------+ +------------------+ +------------------+                |
|  | Total XP         | | Rangos Activos   | | Niveles          |                |
|  | Acumulado        | |                  | | Alcanzados       |                |
|  | 1,523,450        | |        8         | |       12         |                |
|  +------------------+ +------------------+ +------------------+                |
|                                                                               |
|  +--------------------------------+  +--------------------------------------+  |
|  | Distribucion de XP            |  | Distribucion por Rangos              |  |
|  |                               |  |                                       |  |
|  |  0-100    ████████░░  250     |  | Ajaw       ██████████  320            |  |
|  |  101-500  ██████████  450     |  | B'alam     ████████░░  180            |  |
|  |  501-1000 ██████░░░░  280     |  | Chaak      ██████░░░░  150            |  |
|  |  1000+    ████░░░░░░  270     |  | K'inich    ████░░░░░░  120            |  |
|  +--------------------------------+  +--------------------------------------+  |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Detalles de Rangos                                                       | |
|  | +--------------+----------+------------+------------------+              | |
|  | | Rango        | Usuarios | XP Promedio| Ejercicios Prom. |              | |
|  | +--------------+----------+------------+------------------+              | |
|  | | Ajaw         |    320   |      85    |        3         |              | |
|  | | B'alam       |    180   |   1,250    |       15         |              | |
|  | | Chaak        |    150   |   2,850    |       22         |              | |
|  | +--------------+----------+------------+------------------+              | |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Distribucion por Niveles                                                 | |
|  |   Nivel 1   ████████████  450                                            | |
|  |   Nivel 2   ██████████░░  380                                            | |
|  |   Nivel 3   ████████░░░░  220                                            | |
|  |   Nivel 4   ██████░░░░░░  150                                            | |
|  |   Nivel 5+  ████░░░░░░░░   50                                            | |
|  +--------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+

================================================================================
                              TAB: RETENCION
================================================================================
|                                                                               |
|  +------------------+ +------------------+ +------------------+                |
|  | Retencion        | | Total Usuarios   | | Usuarios         |                |
|  | Promedio         | |                  | | Retenidos        |                |
|  | 72.5%            | |    1,250         | |      906         |                |
|  +------------------+ +------------------+ +------------------+                |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Tendencia de Retencion                                                   | |
|  |   100% ^                                                                 | |
|  |        |     *--*                                                        | |
|  |    75% |   *      *--*                                                   | |
|  |        | *              *--*                                             | |
|  |    50% |                    *                                            | |
|  |        +----------------------------------------->                       | |
|  |          Oct  Nov  Dic  Ene  Feb  Mar                                    | |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
|  +------------------------+  +------------------------+                       |
|  | [TrendingUp] MEJOR     |  | [TrendingDown] MENOR   |                       |
|  | COHORTE                |  | RETENCION              |                       |
|  | Mes: Noviembre 2025    |  | Mes: Enero 2026        |                       |
|  | Tasa: 85.3%            |  | Tasa: 62.1%            |                       |
|  | Tamano: 150            |  | Tamano: 180            |                       |
|  | Retenidos: 128         |  | Retenidos: 112         |                       |
|  +------------------------+  +------------------------+                       |
|                                                                               |
|  +--------------------------------------------------------------------------+ |
|  | Analisis de Cohortes                                                     | |
|  | +---------------+--------+-----------+----------------------------+      | |
|  | | Mes Cohorte   | Tamano | Retenidos | Tasa Retencion             |      | |
|  | +---------------+--------+-----------+----------------------------+      | |
|  | | 2025-10       |   120  |    98     | ████████████████░░ 81.7%  |      | |
|  | | 2025-11       |   150  |   128     | █████████████████░ 85.3%  |      | |
|  | | 2025-12       |   140  |   105     | ███████████████░░░ 75.0%  |      | |
|  | | 2026-01       |   180  |   112     | ████████████░░░░░░ 62.1%  |      | |
|  | +---------------+--------+-----------+----------------------------+      | |
|  +--------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
```

---

## Especificacion Tecnica

### Frontend

**Pagina:** `AdminAnalyticsPage.tsx`
**Ubicacion:** `apps/frontend/src/apps/admin/pages/`
**Lineas:** ~300

**Componentes:**

| Componente | Descripcion | Ubicacion |
|------------|-------------|-----------|
| `OverviewTab.tsx` | Metricas generales, timeline, top users (~310 LOC) | `components/analytics/` |
| `EngagementTab.tsx` | Engagement por segmento con filtros | `components/analytics/` |
| `GamificationTab.tsx` | Distribucion XP/rangos/niveles (~250 LOC) | `components/analytics/` |
| `RetentionTab.tsx` | Analisis de cohortes (~310 LOC) | `components/analytics/` |

**Hook:**
- `useAnalytics.ts` - Gestion de estado y fetching de datos (~220 lineas)

**Integracion:**
- Usa `AdminLayout` para estructura base
- Integra sistema de tabs con navegacion visual
- Toast notifications para feedback de acciones
- `DetectiveButton` y `DetectiveCard` como componentes base
- Graficos: `recharts` (PieChart, LineChart, BarChart)

### Backend

**Controlador:** `admin-analytics.controller.ts`
**Ubicacion:** `apps/backend/src/modules/admin/controllers/`
**Lineas:** ~324

**Endpoints Detallados:**

| Metodo | Endpoint | Query Params | DTO Salida | Descripcion |
|--------|----------|--------------|------------|-------------|
| GET | `/admin/analytics/overview` | - | `AnalyticsOverviewDto` | Metricas de alto nivel |
| GET | `/admin/analytics/engagement` | `role?`, `date_from?` | `EngagementAnalyticsDto` | Engagement por segmento |
| GET | `/admin/analytics/gamification` | - | `GamificationAnalyticsDto` | Distribucion XP/rangos/niveles |
| GET | `/admin/analytics/activity-timeline` | `days?` (1-90, default 30) | `ActivityTimelineDto` | Metricas diarias |
| GET | `/admin/analytics/top-users` | `metric*`, `role?`, `limit?` | `TopUsersDto` | Ranking de usuarios |
| GET | `/admin/analytics/retention` | - | `RetentionAnalyticsDto` | Retencion por cohorte |
| GET | `/admin/analytics/export` | `type*`, `format?` | CSV file | Exportacion de datos |

**Servicio:**
- `AdminAnalyticsService` - Logica de negocio y agregacion de datos

### DTOs

**Ubicacion:** `apps/backend/src/modules/admin/dto/analytics/`

#### AnalyticsOverviewDto
```typescript
{
  total_users: number;          // Total usuarios registrados
  total_students: number;       // Total estudiantes
  total_teachers: number;       // Total profesores
  active_users: number;         // Usuarios activos (30d)
  avg_xp: number;              // XP promedio
  avg_exercises_completed: number;  // Ejercicios promedio
  avg_engagement_score: number; // Engagement promedio (0-100)
  inactive_users: number;       // Usuarios inactivos
  beginner_users: number;       // Usuarios principiantes
  intermediate_users: number;   // Usuarios intermedios
  advanced_users: number;       // Usuarios avanzados
}
```

#### EngagementAnalyticsDto
```typescript
{
  by_segment: EngagementBySegmentDto[];  // Metricas por segmento
}

// EngagementBySegmentDto
{
  user_segment: 'inactive' | 'beginner' | 'intermediate' | 'advanced';
  users_count: number;
  avg_engagement_score: number;  // 0-100
  avg_exercises_completed: number;
  avg_streak: number;           // Racha en dias
  active_last_7d: number;       // Activos ultimos 7 dias
  active_last_30d: number;      // Activos ultimos 30 dias
}
```

#### GamificationAnalyticsDto
```typescript
{
  xp_distribution: XpDistributionDto[];      // Por rangos de XP
  ranks_distribution: RankDistributionDto[]; // Por rangos Maya
  levels_distribution: LevelDistributionDto[]; // Por niveles
}

// XpDistributionDto
{
  xp_range: string;    // "0-100 XP", "101-500 XP", etc.
  users_count: number;
}

// RankDistributionDto
{
  current_rank: string;   // "ajaw", "balam", "chaak", etc.
  users_count: number;
  avg_xp: number;
  avg_exercises: number;
}

// LevelDistributionDto
{
  current_level: number;
  users_count: number;
}
```

#### RetentionAnalyticsDto
```typescript
{
  cohorts: CohortRetentionDto[];  // Cohortes mensuales
}

// CohortRetentionDto
{
  cohort_month: string;    // ISO format: "2025-01-01T00:00:00Z"
  cohort_size: number;     // Usuarios registrados
  retained_users: number;  // Usuarios activos actualmente
  retention_rate: number;  // 0.0 - 1.0 (multiplicar por 100 para %)
}
```

### Base de Datos

**Fuentes de Datos:**
- Vistas materializadas para agregaciones eficientes
- Tablas: `users`, `user_progress`, `user_activity_log`, `user_gamification`

---

## Definicion de Hecho (DoD)

- [x] 7 endpoints implementados y documentados en Swagger
- [x] Guards `JwtAuthGuard` y `AdminGuard` aplicados
- [x] Frontend: 4 tabs con visualizaciones (recharts)
- [x] Hook `useAnalytics` con manejo de estado
- [x] Exportacion CSV funcional
- [x] Actualizacion de datos funcional
- [x] Manejo de errores y estados de carga
- [ ] Tests unitarios >85% coverage (pendiente - deuda tecnica)
- [ ] Tests E2E para flujos criticos (pendiente - deuda tecnica)
- [x] Documentacion API completa (Swagger decorators)

---

## Notas de Implementacion

### Consideraciones
- El tab Engagement muestra badge "Datos limitados" porque el analisis mejora con mas datos historicos
- El tab Retencion muestra badge "Beta" porque requiere minimo 30 dias de datos para ser significativo
- Los datos de activity-timeline estan limitados a 90 dias maximo para performance
- Top users por defecto muestra los 10 primeros por XP, pero es configurable hasta 100

### Dependencias
- `JwtAuthGuard` - Autenticacion JWT
- `AdminGuard` - Verificacion de rol admin
- `AdminLayout` - Layout base del portal admin
- `useUserGamification` - Hook para datos de gamificacion del usuario actual
- `recharts` - Libreria de graficos (PieChart, LineChart, BarChart)
- Sistema de vistas materializadas para agregaciones eficientes

---

## Testing

### Casos de Prueba

| ID | Descripcion | Resultado Esperado |
|----|-------------|--------------------|
| TC-01 | Acceder a overview sin autenticacion | 401 Unauthorized |
| TC-02 | Acceder a overview sin rol admin | 403 Forbidden |
| TC-03 | Obtener overview con admin valido | 200 + AnalyticsOverviewDto |
| TC-04 | Filtrar engagement por role=student | 200 + datos filtrados |
| TC-05 | Timeline con days=90 | 200 + 90 registros diarios |
| TC-06 | Timeline con days=100 | 400 Bad Request (max 90) |
| TC-07 | Top users metric=exercises limit=5 | 200 + 5 usuarios |
| TC-08 | Exportar CSV type=overview | 200 + archivo CSV descargable |
| TC-09 | Exportar CSV sin type | 400 Bad Request |
| TC-10 | Cambiar entre tabs | UI actualiza contenido correctamente |

---

## Trazabilidad

### Archivos Creados/Modificados

**Frontend:**
- `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx` - ~300 LOC
- `apps/frontend/src/apps/admin/hooks/useAnalytics.ts` - ~220 LOC
- `apps/frontend/src/apps/admin/components/analytics/OverviewTab.tsx` - ~310 LOC
- `apps/frontend/src/apps/admin/components/analytics/EngagementTab.tsx`
- `apps/frontend/src/apps/admin/components/analytics/GamificationTab.tsx` - ~250 LOC
- `apps/frontend/src/apps/admin/components/analytics/RetentionTab.tsx` - ~310 LOC

**Backend:**
- `apps/backend/src/modules/admin/controllers/admin-analytics.controller.ts` - ~324 LOC
- `apps/backend/src/modules/admin/services/admin-analytics.service.ts`
- `apps/backend/src/modules/admin/dto/analytics/analytics-overview.dto.ts`
- `apps/backend/src/modules/admin/dto/analytics/engagement-analytics.dto.ts`
- `apps/backend/src/modules/admin/dto/analytics/gamification-analytics.dto.ts`
- `apps/backend/src/modules/admin/dto/analytics/retention-analytics.dto.ts`

---

## Referencias

- Epica: [EXT-002 Admin Extendido](../README.md)
- Arquitectura: [ET-EXT-002-ARQUITECTURA-TECNICA.md](../specifications/ET-EXT-002-ARQUITECTURA-TECNICA.md)
- Best Practices: [ADMIN-PORTAL-BEST-PRACTICES.md](../guias/ADMIN-PORTAL-BEST-PRACTICES.md)
- API Reference: Swagger docs en `/api/docs`

---

**Creado por:** Technical Writer Agent
**Revisado por:** Pendiente
**Fecha documentacion:** 2026-01-20
