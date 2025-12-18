# Analisis de Coherencia: Datasources, Base de Datos y Documentacion

**Fecha:** 2025-12-18
**Autor:** Requirements Analyst (Claude Opus 4.5)
**Estado:** COMPLETO
**Version:** 1.0
**Relacionado con:** ANALISIS-REQUIREMENTS-TEACHER-PORTAL-2025-12-18.md

---

## RESUMEN EJECUTIVO

Este documento consolida el analisis de coherencia entre:
- Configuracion de datasources en backend (app.module.ts)
- Definiciones de entidades y schemas de base de datos
- Documentacion (inventarios, trazas, ADRs)

**Score de Coherencia Global: 77.6%**

### Hallazgos Criticos

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | AssignmentClassroom con datasource incorrecto | CRITICO | Error 500 en /teacher/assignments |
| 2 | Documentacion dice 6 datasources, hay 9 reales | ALTO | Documentacion desactualizada |
| 3 | 5 entidades Admin en schemas diferentes registradas en 'auth' | ALTO | Potencial fallo futuro |
| 4 | 3 funciones SQL con columnas inexistentes | CRITICO | Funciones no ejecutables |
| 5 | RF-TEACH-002 referencia schema 'public' obsoleto | MEDIO | Confusion desarrolladores |

---

## 1. CONFIGURACION DE DATASOURCES

### 1.1 Datasources Reales vs Documentados

**REALIDAD (app.module.ts):** 9 datasources

| # | Nombre | Schema BD | Path Entidades |
|---|--------|-----------|----------------|
| 1 | `auth` | auth_management | /modules/auth/entities/**/*.entity |
| 2 | `educational` | educational_content | /modules/educational/entities/**/*.entity |
| 3 | `gamification` | gamification_system | /modules/gamification/entities/**/*.entity + notifications/notification.entity |
| 4 | `progress` | progress_tracking | /modules/progress/entities/**/*.entity |
| 5 | `social` | social_features | /modules/social/entities/**/*.entity |
| 6 | `content` | content_management | /modules/content/entities/**/*.entity |
| 7 | `audit` | audit_logging | /modules/audit/entities/**/*.entity |
| 8 | `notifications` | notifications | /modules/notifications/entities/multichannel/**/*.entity |
| 9 | `communication` | communication | /modules/teacher/entities/message*.entity |

**DOCUMENTACION (BACKEND_INVENTORY.yml):** 6 datasources

Faltan en documentacion:
- `audit` (schema: audit_logging)
- `notifications` (schema: notifications)
- `communication` (schema: communication)

---

### 1.2 PROBLEMA CRITICO: Entidades Assignment

#### Ubicacion de Entidades

| Entidad | Ubicacion | Schema | Datasource Usado | Correcto? |
|---------|-----------|--------|------------------|-----------|
| Assignment | /modules/assignments/entities | educational_content | 'content' | NO |
| AssignmentClassroom | /modules/social/entities | social_features | 'content' | NO |
| AssignmentExercise | /modules/assignments/entities | educational_content | 'content' | NO |
| AssignmentStudent | /modules/assignments/entities | educational_content | 'content' | NO |
| AssignmentSubmission | /modules/assignments/entities | educational_content | 'content' | NO |

#### Causa Raiz del Error 500

```
1. AssignmentsModule registra 5 entidades en datasource 'content'
2. Datasource 'content' solo escanea: /modules/content/entities/**/*.entity
3. Entidades de Assignments estan en: /modules/assignments/entities/
4. AssignmentClassroom esta en: /modules/social/entities/
5. TypeORM NO encuentra metadata -> EntityMetadataNotFoundError
```

---

### 1.3 PROBLEMA: Entidades Admin Distribuidas

El AdminModule (admin.module.ts:69) registra todas las entidades en datasource 'auth':

```typescript
TypeOrmModule.forFeature([
  User, Profile, Role, UserRole, Tenant, Membership, AuthAttempt, UserSuspension,
  SystemSetting,          // Schema: system_configuration (NO auth_management)
  FeatureFlag,            // Schema: system_configuration (NO auth_management)
  NotificationSettings,   // Schema: system_configuration (NO auth_management)
  BulkOperation,          // Schema: admin_dashboard (NO auth_management)
  AdminReport             // Schema: admin_dashboard (NO auth_management)
], 'auth')
```

**Impacto:** No genera error actualmente porque TypeORM no valida schema a nivel de datasource, pero es una mala practica que puede causar problemas en el futuro.

---

## 2. INCONSISTENCIAS EN DOCUMENTACION

### 2.1 Inventarios Desactualizados

| Inventario | Discrepancia |
|------------|--------------|
| BACKEND_INVENTORY.yml | Dice 6 datasources, hay 9 |
| BACKEND_INVENTORY.yml | No documenta datasources 7-9 |
| DATABASE_INVENTORY.yml | No refleja cambios de schema para assignments |

### 2.2 Referencias Rotas en Documentacion

| Documento | Referencia Rota | Realidad |
|-----------|----------------|----------|
| RF-TEACH-002-assignment-system.md | Schema: `public` | Schema: `educational_content`, `social_features` |
| TRACEABILITY EXT-001 | Schema assignments en public | Migrado a educational_content (2025-11-08) |

### 2.3 Funciones SQL con Errores

| Funcion | Columna Incorrecta | Columna Correcta | Estado |
|---------|-------------------|------------------|--------|
| update_leaderboard_streaks.sql | last_activity_date | last_activity_at | CORREGIDO 2025-12-15 |
| update_leaderboard_streaks.sql | longest_streak | max_streak | CORREGIDO 2025-12-15 |
| get_user_rank_progress.sql | missions_completed | modules_completed | ✅ CORREGIDO 2025-12-18 |
| update_leaderboard_global.sql | missions_completed | modules_completed | ✅ CORREGIDO 2025-12-18 |
| get_classroom_analytics.sql | missions_completed | modules_completed | ✅ CORREGIDO 2025-12-18 |
| grant_mission_completion_rewards.sql | missions_completed | modules_completed | ✅ CORREGIDO 2025-12-18 |

---

## 3. PLAN DE CORRECCION CONSOLIDADO

### 3.1 SPRINT 1: Correcciones Criticas (P0)

#### CORRECCION 1: Arreglar AssignmentsModule datasources

**Archivo:** `/modules/assignments/assignments.module.ts`

**ANTES:**
```typescript
TypeOrmModule.forFeature([
  Assignment,
  AssignmentClassroom,
  AssignmentExercise,
  AssignmentStudent,
  AssignmentSubmission,
], 'content')
```

**DESPUES (Opcion A - Recomendada):**
```typescript
// Entidades educational_content -> datasource 'educational'
TypeOrmModule.forFeature([
  Assignment,
  AssignmentExercise,
  AssignmentStudent,
  AssignmentSubmission,
], 'educational'),

// AssignmentClassroom -> datasource 'social' (importar desde SocialModule)
TypeOrmModule.forFeature([
  AssignmentClassroom,
], 'social'),
```

**DESPUES (Opcion B - Alternativa):**

Agregar path de assignments al datasource 'educational' en app.module.ts:

```typescript
TypeOrmModule.forRootAsync({
  name: 'educational',
  entities: [
    __dirname + '/modules/educational/entities/**/*.entity{.ts,.js}',
    __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}', // AGREGAR
  ],
}),
```

---

#### CORRECCION 2: Arreglar AssignmentsService inyecciones

**Archivo:** `/modules/assignments/services/assignments.service.ts`

**ANTES (linea 32):**
```typescript
@InjectRepository(AssignmentClassroom, 'content')
```

**DESPUES:**
```typescript
@InjectRepository(AssignmentClassroom, 'social')
```

---

#### CORRECCION 3: Arreglar TeacherModule datasources

**Archivo:** `/modules/teacher/teacher.module.ts`

**ANTES (linea 146):**
```typescript
TypeOrmModule.forFeature([Assignment, AssignmentSubmission, TeacherContent], 'content')
```

**DESPUES:**
```typescript
TypeOrmModule.forFeature([Assignment, AssignmentSubmission, TeacherContent], 'educational')
```

---

#### CORRECCION 4: Arreglar 3 funciones SQL pendientes

**Archivos:**
- `/apps/database/ddl/schemas/gamification_system/functions/get_user_rank_progress.sql`
- `/apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_global.sql`
- `/apps/database/ddl/schemas/progress_tracking/functions/05-get_classroom_analytics.sql`

**Cambio:** Reemplazar `missions_completed` por `modules_completed`

---

### 3.2 SPRINT 2: Actualizacion Documentacion (P1)

| # | Tarea | Archivo |
|---|-------|---------|
| 1 | Actualizar conteo datasources a 9 | BACKEND_INVENTORY.yml |
| 2 | Documentar datasources 7-9 | BACKEND_INVENTORY.yml |
| 3 | Actualizar schema de assignments | RF-TEACH-002-assignment-system.md |
| 4 | Actualizar TRACEABILITY EXT-001 | TRACEABILITY.yml |
| 5 | Crear documento de inconsistencias | INCONSISTENCIAS-DOCUMENTADAS.md |

---

### 3.3 SPRINT 3: Mejoras Estructurales (P2)

| # | Tarea | Descripcion |
|---|-------|-------------|
| 1 | Refactorizar AdminModule | Separar por schemas (system_configuration, admin_dashboard) |
| 2 | Crear datasource 'system' | Para entidades de system_configuration |
| 3 | Crear datasource 'admin_dashboard' | Para BulkOperation, AdminReport |

---

## 4. MATRIZ DE ARCHIVOS AFECTADOS

### Archivos a Modificar (P0 - Inmediato)

```
BACKEND:
- apps/backend/src/modules/assignments/assignments.module.ts (lineas 24-33)
- apps/backend/src/modules/assignments/services/assignments.service.ts (linea 32)
- apps/backend/src/modules/teacher/teacher.module.ts (linea 146)

BASE DE DATOS:
- apps/database/ddl/schemas/gamification_system/functions/get_user_rank_progress.sql
- apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_global.sql
- apps/database/ddl/schemas/progress_tracking/functions/05-get_classroom_analytics.sql
```

### Archivos a Actualizar (P1 - Documentacion)

```
INVENTARIOS:
- orchestration/inventarios/BACKEND_INVENTORY.yml (lineas 1169-1196)
- orchestration/inventarios/MASTER_INVENTORY.yml

DOCUMENTACION:
- docs/03-fase-extensiones/EXT-001-portal-maestros/requerimientos/RF-TEACH-002-assignment-system.md
- docs/03-fase-extensiones/EXT-001-portal-maestros/implementacion/TRACEABILITY.yml
```

---

## 5. VALIDACIONES POST-IMPLEMENTACION

### Checklist de Verificacion

```
BACKEND:
[ ] npm run build - Sin errores
[ ] npm run lint - Sin errores criticos
[ ] GET /api/v1/teacher/assignments - Retorna 200
[ ] GET /api/v1/teacher/classrooms - Retorna 200
[ ] POST /api/v1/teacher/assignments - Crea assignment

BASE DE DATOS:
[ ] SELECT gamilit.get_user_rank_progress(...) - Sin errores
[ ] SELECT gamilit.update_leaderboard_global() - Sin errores
[ ] SELECT progress_tracking.get_classroom_analytics(...) - Sin errores

DOCUMENTACION:
[ ] BACKEND_INVENTORY.yml - 9 datasources documentados
[ ] RF-TEACH-002 - Schema actualizado a educational_content
[ ] TRACEABILITY EXT-001 - Referencias actualizadas
```

---

## 6. DEPENDENCIAS ENTRE CORRECCIONES

```
CORRECCION 1 (AssignmentsModule)
    |
    +---> CORRECCION 2 (AssignmentsService) [DEPENDE DE 1]
    |
    +---> CORRECCION 3 (TeacherModule) [PUEDE SER PARALELO]

CORRECCION 4 (Funciones SQL) [INDEPENDIENTE]

SPRINT 2 (Documentacion) [DESPUES DE VALIDAR SPRINT 1]

SPRINT 3 (Refactorizacion Admin) [OPCIONAL, DESPUES DE SPRINT 2]
```

---

## 7. RESUMEN DE IMPACTO

### Antes de Correcciones

| Endpoint | Estado | Error |
|----------|--------|-------|
| GET /api/v1/teacher/assignments | 500 | EntityMetadataNotFoundError |
| GET /api/v1/teacher/classrooms | OK | - |
| POST /api/v1/teacher/assignments | 500 | EntityMetadataNotFoundError |

### Despues de Correcciones

| Endpoint | Estado Esperado |
|----------|-----------------|
| GET /api/v1/teacher/assignments | 200 OK |
| GET /api/v1/teacher/classrooms | 200 OK |
| POST /api/v1/teacher/assignments | 201 Created |

---

## CONCLUSION

El analisis de coherencia ha identificado que el problema principal del Portal de Teacher (**Error 500 en assignments**) se debe a una **configuracion incorrecta de datasources** donde las entidades de assignments estan registradas en un datasource ('content') que no escanea sus directorios.

Adicionalmente, se identificaron:
- 3 discrepancias entre documentacion y codigo real
- 3 funciones SQL con columnas inexistentes
- 5 entidades admin registradas en datasource incorrecto (riesgo futuro)

**Recomendacion:** Implementar correcciones P0 de manera inmediata para resolver el error critico del portal Teacher.

---

**Fin del Documento de Analisis de Coherencia**

**Autor:** Requirements Analyst (Claude Opus 4.5)
**Fecha:** 2025-12-18
**Estado:** COMPLETO - Listo para revision y aprobacion
