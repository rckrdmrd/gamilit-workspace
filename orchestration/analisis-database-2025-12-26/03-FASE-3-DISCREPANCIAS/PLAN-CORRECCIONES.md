# PLAN DE CORRECCIONES - FASE 3

**Fecha:** 2025-12-26
**Proyecto:** GAMILIT
**Version:** 1.0.0

---

## RESUMEN DE CORRECCIONES

| Prioridad | Cantidad | Tiempo Estimado |
|-----------|----------|-----------------|
| P0 - Critico | 3 | Inmediato |
| P1 - Alto | 5 | 1-2 dias |
| P2 - Medio | 4 | 1 semana |
| P3 - Bajo | 3 | Backlog |

---

## P0 - CORRECCIONES CRITICAS (Hacer Inmediatamente)

### P0-001: Resolver Friendship Status Mismatch

**Discrepancia:** DISC-001
**Tipo:** DB-Backend
**Severidad:** CRITICO

**Problema:**
- Entity `friendship.entity.ts` tiene campo `status` (pending/accepted/rejected/blocked)
- DDL `01-friendships.sql` NO tiene campo `status`

**Opcion A (Recomendada):** Agregar status a DDL
```sql
-- Archivo: ddl/schemas/social_features/tables/01-friendships.sql
ALTER TABLE social_features.friendships
ADD COLUMN status VARCHAR(20) DEFAULT 'accepted';
```

**Opcion B:** Usar tabla friend_requests separada
- Crear tabla `social_features.friend_requests`
- Remover status de Entity

**Archivos a Modificar:**
- `/apps/database/ddl/schemas/social_features/tables/01-friendships.sql`

**Dependencias:**
- Ninguna (tabla raiz)

**Test de Validacion:**
- [ ] Recrear base de datos
- [ ] Verificar constraint NOT NULL
- [ ] Probar INSERT con status

---

### P0-002: Consolidar UUIDs Usuarios Testing

**Discrepancia:** DISC-003
**Tipo:** Seeds
**Severidad:** CRITICO

**Problema:**
- `01-demo-users.sql`: admin@gamilit.com = `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- `02-test-users.sql`: admin@gamilit.com = `dddddddd-dddd-dddd-dddd-dddddddddddd`
- Conflicto UNIQUE constraint en email

**Correccion:**
1. Eliminar `02-test-users.sql` O
2. Cambiar emails en `02-test-users.sql` a test1@, test2@, test3@

**Archivos a Modificar:**
- `/apps/database/seeds/prod/auth/02-test-users.sql`

**Dependencias:**
- user_achievements
- user_stats
- profiles

**Test de Validacion:**
- [ ] Ejecutar create-database.sh sin errores
- [ ] Verificar no hay email duplicados

---

### P0-003: Corregir instance_id NULL

**Discrepancia:** DISC-006
**Tipo:** Seeds
**Severidad:** ALTO

**Problema:**
```sql
instance_id = '00000000-0000-0000-0000-000000000000'::uuid
```
Este UUID puede violar FK si tabla `auth.instances` requiere referencia valida.

**Correccion:**
```sql
-- Cambiar a gen_random_uuid() o UUID valido de Supabase
instance_id = gen_random_uuid()
```

**Archivos a Modificar:**
- `/apps/database/seeds/prod/auth/01-demo-users.sql` (lineas 63, 91, 119)

**Dependencias:**
- auth.instances (verificar si existe)

**Test de Validacion:**
- [ ] Verificar FK a auth.instances
- [ ] Ejecutar seeds sin error

---

## P1 - CORRECCIONES ALTAS (1-2 dias)

### P1-001: Implementar Servicios Frontend para Ranks Module

**Discrepancia:** DISC-004
**Tipo:** Backend-Frontend
**Severidad:** ALTO

**Problema:**
7 endpoints de ranks sin consumidor frontend

**Correccion:**
Crear archivo `/apps/frontend/src/services/api/gamification/ranksApi.ts`

```typescript
export const ranksApi = {
  getCurrentRank: (userId: string) =>
    apiClient.get(`/gamification/ranks/current`),

  getRankProgress: (userId: string) =>
    apiClient.get(`/gamification/ranks/users/${userId}/rank-progress`),

  getRankHistory: (userId: string) =>
    apiClient.get(`/gamification/ranks/users/${userId}/rank-history`),

  checkPromotion: (userId: string) =>
    apiClient.get(`/gamification/ranks/check-promotion/${userId}`),

  promoteUser: (userId: string) =>
    apiClient.post(`/gamification/ranks/promote/${userId}`),
};
```

**Archivos a Crear:**
- `/apps/frontend/src/services/api/gamification/ranksApi.ts`

**Dependencias:**
- apiClient configurado
- Tipos TypeScript para DTOs

---

### P1-002: Crear Entities para Tablas Criticas

**Discrepancia:** DISC-007
**Tipo:** DB-Backend
**Severidad:** ALTO

**Tablas sin Entity (P1):**
1. `educational_content.classroom_modules`
2. `social_features.challenge_results`
3. `progress_tracking.teacher_interventions`
4. `system_configuration.gamification_parameters`

**Correccion:**
Crear 4 archivos entity:

```typescript
// classroom-module.entity.ts
@Entity({ name: DB_TABLES.CLASSROOM_MODULES, schema: DB_SCHEMAS.EDUCATIONAL_CONTENT })
export class ClassroomModule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  classroom_id!: string;

  @Column({ type: 'uuid' })
  module_id!: string;

  // ...
}
```

**Archivos a Crear:**
- `/apps/backend/src/modules/educational/entities/classroom-module.entity.ts`
- `/apps/backend/src/modules/social/entities/challenge-result.entity.ts`
- `/apps/backend/src/modules/progress/entities/teacher-intervention.entity.ts`
- `/apps/backend/src/modules/config/entities/gamification-parameter.entity.ts`

**Dependencias:**
- Schemas existentes
- DB_TABLES constants actualizadas

---

### P1-003: Implementar Teacher Reports Services

**Discrepancia:** DISC-008
**Tipo:** Backend-Frontend
**Severidad:** ALTO

**Endpoints sin consumidor:**
- POST /teacher/reports/generate
- GET /teacher/reports/recent
- GET /teacher/reports/:id/download

**Correccion:**
Agregar a `/apps/frontend/src/services/api/teacher/teacherApi.ts`:

```typescript
generateReport: (dto: GenerateReportDto) =>
  apiClient.post('/teacher/reports/generate', dto),

getRecentReports: (limit?: number) =>
  apiClient.get('/teacher/reports/recent', { params: { limit } }),

downloadReport: (reportId: string) =>
  apiClient.get(`/teacher/reports/${reportId}/download`, { responseType: 'blob' }),
```

**Archivos a Modificar:**
- `/apps/frontend/src/services/api/teacher/teacherApi.ts`

---

### P1-004: Consolidar Notificaciones Duplicadas

**Discrepancia:** DB-003 (Notificaciones duplicadas)
**Tipo:** Database
**Severidad:** ALTO

**Problema:**
- `gamification_system.notifications`
- `notifications.notifications`

**Correccion:**
1. Decidir schema principal (recomendado: `notifications`)
2. Migrar referencias
3. Deprecar tabla duplicada

**Archivos a Modificar:**
- Verificar dependencias en backend
- Update entities
- Update services

---

### P1-005: Actualizar DATABASE_INVENTORY.yml

**Discrepancia:** DISC-010
**Tipo:** Documentacion
**Severidad:** ALTO

**Problema:**
Conteos documentados no coinciden con reales:
- Tablas: 474 doc vs 368 real
- Indexes: 21 doc vs discrepancia por schema

**Correccion:**
Actualizar `orchestration/inventarios/DATABASE_INVENTORY.yml` con conteos reales

---

## P2 - CORRECCIONES MEDIAS (1 semana)

### P2-001: Mover Archivos ALTER de /tables/

**Problema:**
Archivos ALTER en directorios /tables/ confunden conteos

**Archivos a Mover:**
- `educational_content/tables/24-alter_assignment_students.sql` -> `/alters/`
- `auth_management/tables/16-add-soft-delete.sql` -> `/alters/`

---

### P2-002: Corregir tenant_id en user_roles

**Problema:**
user_roles usa tenant_id diferente a usuarios

**Correccion:**
Sincronizar tenant_id con usuarios correspondientes

---

### P2-003: Implementar Progress Module Services Frontend

**Problema:**
30% cobertura de endpoints

**Correccion:**
Crear servicios para exercise-attempts, module-progress

---

### P2-004: Crear Entities para Tablas P2

**Tablas:**
- content_management.content_versions
- audit_logging.system_logs
- progress_tracking.user_difficulty_progress

---

## P3 - CORRECCIONES BACKLOG

### P3-001: Social Module Integration

Implementar servicios frontend para modulo social (17% cobertura)

### P3-002: Documentar Decisiones Arquitectonicas

Crear ADR para:
- Relaciones comentadas en entities
- Estructura de notificaciones
- Patron de FKs diferidos

### P3-003: Automatizar Validacion CI/CD

Script que valide:
- Endpoints con consumidor
- Tablas con entity
- Conteos de inventario

---

## MATRIZ DE DEPENDENCIAS

```
P0-001 (Friendship)
   |
   v
P1-002 (Entities) --> P1-004 (Notificaciones)
   |
   v
P2-003 (Progress Services)
```

```
P0-002 (UUIDs) --> P0-003 (instance_id)
   |
   v
P1-005 (Inventario)
```

---

## ORDEN DE IMPLEMENTACION RECOMENDADO

1. **Dia 1 (P0)**
   - P0-001: Friendship status
   - P0-002: UUIDs usuarios
   - P0-003: instance_id

2. **Dia 2-3 (P1)**
   - P1-001: Ranks services
   - P1-002: Entities criticas
   - P1-003: Reports services
   - P1-004: Notificaciones
   - P1-005: Inventario

3. **Semana 2 (P2)**
   - P2-001: Mover ALTERs
   - P2-002: tenant_id
   - P2-003: Progress services
   - P2-004: Entities P2

4. **Backlog (P3)**
   - Segun capacidad

---

## TESTS DE VALIDACION GLOBALES

- [ ] `npm run build` (backend) sin errores
- [ ] `npm run build` (frontend) sin errores
- [ ] `./create-database.sh` sin errores
- [ ] Tests unitarios pasan
- [ ] Endpoints responden correctamente
