# FASE 1: Plan de Análisis Detallado - Errores Producción

**Fecha:** 2025-12-18
**Proyecto:** Gamilit
**Ambiente:** Producción (https://74.208.126.102:3006)
**Analista:** Requirement Analyst

---

## 1. RESUMEN EJECUTIVO DE ERRORES

| # | Endpoint | Error | Mensaje |
|---|----------|-------|---------|
| 1 | GET /notifications/unread-count | 500 | `gamification_system.notifications` does not exist |
| 2 | GET /gamification/ranks/current | 404 | Resource not found |
| 3 | GET /gamification/users/{id}/ml-coins | 404 | Resource not found |
| 4 | GET /progress/users/{id}/summary | 500 | `progress_tracking.module_progress` does not exist |
| 5 | GET /gamification/ranks/users/{id}/rank-progress | 404 | Resource not found |
| 6 | GET /gamification/missions/daily | 400 | Bad Request |
| 7 | GET /gamification/missions/weekly | 400 | Bad Request |
| 8 | GET /progress/users/{id}/recent-activities | 500 | `progress_tracking.module_progress` does not exist |
| 9 | GET /educational/modules/user/{id} | 500 | `educational_content.modules` does not exist |

---

## 2. DIAGNÓSTICO PRINCIPAL

### 2.1 Hallazgo Crítico

**TODAS LAS TABLAS EXISTEN EN EL DDL DEL REPOSITORIO.**

El problema raíz es que **las migraciones/DDL NO se ejecutaron correctamente en la base de datos de producción**.

### 2.2 Tablas Faltantes en Producción (Confirmadas)

| Schema | Tabla | Archivo DDL | Estado DDL |
|--------|-------|-------------|------------|
| `gamification_system` | `notifications` | `08-notifications.sql` | ✅ EXISTE |
| `progress_tracking` | `module_progress` | `01-module_progress.sql` | ✅ EXISTE |
| `educational_content` | `modules` | `01-modules.sql` | ✅ EXISTE |

### 2.3 Causas Probables de Errores 404/400

| Endpoint | Causa Probable |
|----------|---------------|
| `/gamification/ranks/current` | Usuario sin `user_ranks` inicializado |
| `/gamification/users/{id}/ml-coins` | Usuario sin `user_stats` inicializado |
| `/gamification/ranks/users/{id}/rank-progress` | Usuario sin rango/stats inicializado |
| `/gamification/missions/daily` | Sin `mission_templates` tipo DAILY en BD |
| `/gamification/missions/weekly` | Sin `mission_templates` tipo WEEKLY en BD |

---

## 3. INVENTARIO DE SCHEMAS AFECTADOS

### 3.1 Schema: gamification_system

```
Ubicación DDL: apps/database/ddl/schemas/gamification_system/
├── tables/           (20 archivos)
├── views/            (4 archivos)
├── functions/        (25 archivos)
├── indexes/          (8 archivos)
├── rls-policies/     (8 archivos)
└── triggers/         (múltiples)
```

**Tablas Críticas:**
- `notifications` - Sistema de notificaciones
- `user_stats` - Estadísticas de usuario (XP, nivel, ML-coins)
- `user_ranks` - Rangos Maya del usuario
- `missions` - Misiones activas
- `mission_templates` - Plantillas de misiones (SEEDS REQUERIDOS)

### 3.2 Schema: progress_tracking

```
Ubicación DDL: apps/database/ddl/schemas/progress_tracking/
├── tables/           (18 archivos)
├── views/            (2 archivos)
├── functions/        (11 archivos)
├── indexes/          (3 archivos)
├── rls-policies/     (3 archivos)
└── triggers/         (11 archivos)
```

**Tablas Críticas:**
- `module_progress` - Progreso por módulo
- `learning_sessions` - Sesiones de aprendizaje
- `exercise_attempts` - Intentos de ejercicios
- `exercise_submissions` - Envíos de ejercicios

### 3.3 Schema: educational_content

```
Ubicación DDL: apps/database/ddl/schemas/educational_content/
├── tables/           (16 archivos activos + 2 deprecated)
├── views/            (1 archivo)
├── functions/        (27 archivos)
├── indexes/          (4 archivos)
└── rls-policies/     (2 archivos)
```

**Tablas Críticas:**
- `modules` - Módulos educativos
- `exercises` - Ejercicios con config JSONB
- `classroom_modules` - Módulos asignados a aulas

---

## 4. ANÁLISIS DE BACKEND

### 4.1 Módulo Notifications - PROBLEMA IDENTIFICADO

**Conflicto de Entidades:**

```typescript
// Sistema Básico (deprecated)
@Entity({ schema: 'gamification_system', name: 'notifications' })
export class Notification { ... }  // → gamification datasource

// Sistema Consolidado (activo)
@Entity({ schema: 'notifications', name: 'notifications' })
export class Notification { ... }  // → notifications datasource
```

**Problema:** `NotificationsService` inyecta `@InjectRepository(Notification, 'gamification')` pero el módulo registra la entidad del sistema consolidado con datasource `'notifications'`.

**Archivos Afectados:**
- `apps/backend/src/modules/notifications/notifications.module.ts`
- `apps/backend/src/modules/notifications/notifications.service.ts`
- `apps/backend/src/modules/notifications/entities/notification.entity.ts`

### 4.2 Endpoints Verificados - TODOS EXISTEN

| Endpoint | Controlador | Línea |
|----------|-------------|-------|
| GET /gamification/ranks/current | ranks.controller.ts | 100-117 |
| GET /gamification/users/:id/ml-coins | ml-coins.controller.ts | 38-69 |
| GET /gamification/ranks/users/:id/rank-progress | ranks.controller.ts | 153-177 |
| GET /gamification/missions/daily | missions.controller.ts | 98-117 |
| GET /gamification/missions/weekly | missions.controller.ts | 167-186 |
| GET /progress/users/:id/summary | module-progress.controller.ts | 449 |
| GET /progress/users/:id/recent-activities | module-progress.controller.ts | 678 |
| GET /educational/modules/user/:id | modules.controller.ts | 249 |

---

## 5. PLAN DE ANÁLISIS FASE 2

### 5.1 Verificaciones en Base de Datos Producción

```sql
-- 1. Verificar schemas existentes
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('gamification_system', 'progress_tracking', 'educational_content', 'notifications');

-- 2. Verificar tablas críticas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('gamification_system', 'progress_tracking', 'educational_content')
ORDER BY table_schema, table_name;

-- 3. Verificar seeds de mission_templates
SELECT type, COUNT(*) FROM gamification_system.mission_templates GROUP BY type;

-- 4. Verificar user_stats para usuario de prueba
SELECT * FROM gamification_system.user_stats WHERE user_id = 'd71448b0-67b6-4687-a822-f725c0479c1d';

-- 5. Verificar user_ranks
SELECT * FROM gamification_system.user_ranks WHERE user_id = 'd71448b0-67b6-4687-a822-f725c0479c1d';
```

### 5.2 Archivos DDL a Ejecutar (Orden Crítico)

**Prioridad 1 - Schemas Base:**
1. `apps/database/ddl/schemas/gamification_system/schema.sql`
2. `apps/database/ddl/schemas/progress_tracking/schema.sql`
3. `apps/database/ddl/schemas/educational_content/schema.sql`

**Prioridad 2 - ENUMs:**
1. `apps/database/ddl/schemas/gamification_system/types/*.sql`
2. `apps/database/ddl/schemas/progress_tracking/types/*.sql`
3. `apps/database/ddl/schemas/educational_content/types/*.sql`

**Prioridad 3 - Tablas Críticas:**
1. `gamification_system/tables/01-user_stats.sql`
2. `gamification_system/tables/02-user_ranks.sql`
3. `gamification_system/tables/08-notifications.sql`
4. `gamification_system/tables/20-mission_templates.sql`
5. `progress_tracking/tables/01-module_progress.sql`
6. `educational_content/tables/01-modules.sql`

**Prioridad 4 - Seeds:**
1. `apps/database/seeds/gamification/mission_templates.sql`
2. `apps/database/seeds/gamification/maya_ranks.sql`

### 5.3 Verificación de Datasources

Revisar configuración en:
- `apps/backend/src/config/database.config.ts`
- `apps/backend/src/app.module.ts`

Conexiones esperadas:
| Nombre | Schema |
|--------|--------|
| `default` | `public` |
| `auth` | `auth_management` |
| `gamification` | `gamification_system` |
| `progress` | `progress_tracking` |
| `educational` | `educational_content` |
| `notifications` | `notifications` |
| `social` | `social_features` |

---

## 6. ESTRUCTURA DE DEPENDENCIAS

```
Usuario se registra
    │
    ├─► auth.profiles (creado) ✅
    │
    └─► Falta inicialización automática de:
        ├─► gamification_system.user_stats
        ├─► gamification_system.user_ranks
        └─► progress_tracking.module_progress (primer módulo)
```

**Flujo esperado post-registro:**
1. Crear profile en `auth.profiles` ✅
2. Crear `user_stats` con valores iniciales (level=1, xp=0, ml_coins=0)
3. Crear `user_ranks` con rango inicial (Semilla)
4. Al acceder a módulo → crear `module_progress`

---

## 7. SIGUIENTE FASE

### Fase 2: Ejecución del Análisis
1. Conectar a BD producción y ejecutar queries de verificación
2. Identificar exactamente qué tablas faltan
3. Identificar qué seeds faltan
4. Verificar configuración de datasources en backend

### Fase 3: Planeación de Correcciones
1. Listar scripts DDL a ejecutar en orden
2. Listar seeds a ejecutar
3. Identificar cambios de código necesarios (notifications)
4. Definir orden de ejecución

### Fase 4: Validación del Plan
1. Verificar dependencias entre objetos
2. Confirmar que no faltan FK, índices, triggers
3. Validar RLS policies

### Fase 5: Ejecución
1. Ejecutar DDL en producción
2. Ejecutar seeds
3. Aplicar fix de código si es necesario
4. Verificar funcionamiento

---

## 8. ARCHIVOS DE REFERENCIA

### DDL Críticos
- `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`

### Backend Críticos
- `apps/backend/src/modules/notifications/notifications.module.ts`
- `apps/backend/src/modules/notifications/notifications.service.ts`
- `apps/backend/src/modules/gamification/services/missions.service.ts`
- `apps/backend/src/modules/progress/services/module-progress.service.ts`

### Seeds Críticos
- `apps/database/seeds/gamification/mission_templates.sql`
- `apps/database/seeds/gamification/maya_ranks.sql`
- `apps/database/seeds/educational/modules.sql`

---

**Documento generado automáticamente por análisis de Fase 1**
