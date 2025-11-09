# PLAN DE CORRECCIÓN P0 - Issues Críticos
## Proyecto Gamilit - Sprint de Deuda Técnica
**Fecha:** 2025-11-08
**Duración:** 5 días laborables
**Prioridad:** 🔴 CRÍTICA - Bloquea desarrollo

---

## OBJETIVO

Resolver los **7 problemas P0 críticos** identificados en el análisis de alineación Backend-BD antes de continuar con desarrollo de nuevas features.

---

## CHECKLIST DE TAREAS

### Día 1 - Migraciones de Base de Datos

#### ✅ Tarea 1.1: Ejecutar Migration Script

**Responsable:** Database Team
**Duración:** 1 hora
**Archivo:** `apps/database/migrations/2025-11-08-fix-p0-issues.sql`

**Pasos:**
```bash
# 1. Backup de BD
pg_dump gamilit_dev > backup_pre_migration_$(date +%Y%m%d).sql

# 2. Ejecutar migration en dev
psql gamilit_dev -f apps/database/migrations/2025-11-08-fix-p0-issues.sql

# 3. Verificar resultados
psql gamilit_dev -c "\dT+ educational_content.difficulty_level"
psql gamilit_dev -c "\dT+ gamification_system.notification_type"
psql gamilit_dev -c "\dT+ gamification_system.notification_priority"
psql gamilit_dev -c "\dT+ progress_tracking.progress_status"
```

**Resultado Esperado:**
- ✅ `progress_status` incluye 'mastered'
- ✅ ENUM `notification_type` creado (11 valores)
- ✅ ENUM `notification_priority` creado (4 valores)
- ✅ ENUM `difficulty_level` verificado/creado (8 valores)

**Criterio de Aceptación:**
```sql
-- Todos estos queries deben retornar datos
SELECT enum_range(NULL::progress_tracking.progress_status);
SELECT enum_range(NULL::gamification_system.notification_type);
SELECT enum_range(NULL::gamification_system.notification_priority);
SELECT enum_range(NULL::educational_content.difficulty_level);
```

---

#### ✅ Tarea 1.2: Actualizar DDL Files Faltantes

**Responsable:** Database Team
**Duración:** 30 minutos

**Crear archivos faltantes:**

1. `apps/database/ddl/schemas/educational_content/enums/difficulty_level.sql`
2. `apps/database/ddl/schemas/gamification_system/enums/notification_type.sql`
3. `apps/database/ddl/schemas/gamification_system/enums/notification_priority.sql`

**Template:**
```sql
-- apps/database/ddl/schemas/gamification_system/enums/notification_type.sql
CREATE TYPE gamification_system.notification_type AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'friend_request',
    'guild_invitation',
    'mission_completed',
    'level_up',
    'message_received',
    'system_announcement',
    'ml_coins_earned',
    'streak_milestone',
    'exercise_feedback'
);

COMMENT ON TYPE gamification_system.notification_type IS
'Tipos de notificaciones del sistema. Sincronizado con backend NotificationTypeEnum (enums.constants.ts).';
```

---

### Día 2 - Correcciones Backend (Parte 1)

#### ✅ Tarea 2.1: Corregir Assignment Entities Schema

**Responsable:** Backend Team
**Duración:** 2 horas
**Prioridad:** 🔴 BLOQUEANTE

**Archivos a modificar:**

1. **`apps/backend/src/modules/assignments/entities/assignment.entity.ts`**

```typescript
// ANTES ❌
@Entity({ schema: 'public', name: 'assignments' })
export class Assignment {
  // ...
}

// DESPUÉS ✅
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.ASSIGNMENTS })
export class Assignment {
  // ...
}
```

2. **`apps/backend/src/modules/assignments/entities/assignment-submission.entity.ts`**

```typescript
// ANTES ❌
@Entity({ schema: 'public', name: 'assignment_submissions' })

// DESPUÉS ✅
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.ASSIGNMENT_SUBMISSIONS })
```

3. **`apps/backend/src/modules/assignments/entities/assignment-classroom.entity.ts`**

```typescript
// ANTES ❌
@Entity({ schema: 'public', name: 'assignment_classrooms' })

// DESPUÉS ✅
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.ASSIGNMENT_CLASSROOMS })
```

**Probar:**
```bash
npm run build
npm run test  # Si existen tests de assignments
```

---

#### ✅ Tarea 2.2: Actualizar DB_TABLES Constants

**Responsable:** Backend Team
**Duración:** 30 minutos

**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`

```typescript
export const DB_TABLES = {
  // ...
  EDUCATIONAL: {
    MODULES: 'modules',
    EXERCISES: 'exercises',
    ASSESSMENT_RUBRICS: 'assessment_rubrics',
    MEDIA_RESOURCES: 'media_resources',
    // ✅ AGREGAR:
    ASSIGNMENTS: 'assignments',
    ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
    ASSIGNMENT_EXERCISES: 'assignment_exercises',
    ASSIGNMENT_STUDENTS: 'assignment_students',
  },
  // ...
  SOCIAL: {
    FRIENDSHIPS: 'friendships',
    SCHOOLS: 'schools',
    CLASSROOMS: 'classrooms',
    CLASSROOM_MEMBERS: 'classroom_members',
    TEAMS: 'teams',
    TEAM_MEMBERS: 'team_members',
    TEAM_CHALLENGES: 'team_challenges',
    // ✅ AGREGAR:
    ASSIGNMENT_CLASSROOMS: 'assignment_classrooms',
  },
};
```

---

#### ✅ Tarea 2.3: Testing de Assignments

**Responsable:** Backend Team + QA
**Duración:** 1 hora

**Queries a probar:**

```bash
# Iniciar backend en dev
npm run dev

# Probar endpoints de assignments
curl -X GET http://localhost:3000/api/v1/assignments
curl -X POST http://localhost:3000/api/v1/assignments \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Assignment","description":"Test"}'
```

**Verificar en logs:**
- ✅ No hay errores de "table not found"
- ✅ Queries generadas usan schema correcto: `educational_content.assignments`

---

### Día 3 - Correcciones Backend (Parte 2)

#### ✅ Tarea 3.1: Corregir UserRole Entity

**Responsable:** Backend Team
**Duración:** 30 minutos

**Archivo:** `apps/backend/src/modules/auth/entities/user-role.entity.ts`

```typescript
// ANTES ❌
@Entity({ schema: DB_SCHEMAS.AUTH, name: 'user_roles' })
export class UserRole {
  // ...
}

// DESPUÉS ✅
@Entity({ schema: DB_SCHEMAS.AUTH, name: 'roles' })  // ← CORRECTO
export class UserRole {
  // ...
}
```

**O renombrar constant:**

```typescript
// apps/backend/src/shared/constants/database.constants.ts
export const DB_TABLES = {
  AUTH: {
    TENANTS: 'tenants',
    USERS: 'users',
    PROFILES: 'profiles',
    ROLES: 'roles',  // ✅ CAMBIAR de USER_ROLES
    // ...
  },
};
```

**Probar RBAC:**
```bash
# Probar asignación de roles
curl -X POST http://localhost:3000/api/v1/auth/assign-role \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid","role":"student"}'
```

---

#### ✅ Tarea 3.2: Verificar Enum ProgressStatus en Código

**Responsable:** Backend Team
**Duración:** 1 hora

**Verificar que todos los usos de ProgressStatusEnum sean compatibles:**

```bash
# Buscar usos de 'mastered' en código
grep -r "ProgressStatusEnum.MASTERED" apps/backend/src/

# Buscar usos de 'abandoned' (no debería existir en backend)
grep -r "abandoned" apps/backend/src/
```

**Si hay usos de 'abandoned':**
- Cambiar a otro estado apropiado o agregar al enum backend

**Archivo:** `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_REVIEW = 'needs_review',
  MASTERED = 'mastered',  // ✅ Ahora existe en BD también
  // ABANDONED = 'abandoned',  // ⚠️ Opcional: agregar si se usa
}
```

**Probar progress tracking:**
```bash
# Actualizar progreso a 'mastered'
curl -X PATCH http://localhost:3000/api/v1/progress/module/123 \
  -H "Content-Type: application/json" \
  -d '{"status":"mastered"}'
```

---

### Día 4 - Actualizar Documentación

#### ✅ Tarea 4.1: Actualizar _MAP.md del Backend

**Responsable:** Tech Lead
**Duración:** 2 horas

**Archivo:** `apps/backend/_MAP.md`

**Cambios principales:**

```markdown
# ANTES ❌
**Arquitectura:** API REST modular con 13 módulos funcionales
**Stack:** Node.js + Express + TypeScript

# DESPUÉS ✅
**Arquitectura:** API REST modular con 15 módulos funcionales
**Stack:** Node.js 18+ + NestJS 11.1.8 + TypeScript 5.9.3 + TypeORM 0.3.17

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime |
| **NestJS** | 11.1.8 | Framework (NO Express) |
| **TypeScript** | 5.9.3 | Lenguaje (strict mode) |
| **TypeORM** | 0.3.17 | ORM (NO Prisma) |
| **PostgreSQL** | 15+ | Base de datos |
| **Socket.IO** | 4.8.1 | WebSocket server |
| **Jest** | 29.7 | Testing framework |
| **Passport** | 0.7.0 | Authentication |

## Testing

| Métrica | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| **Tests totales** | 2 | 210 | 🔴 99% |
| **Coverage** | ~18% | 70% | 🔴 52% |
```

---

#### ✅ Tarea 4.2: Reemplazar BACKEND_INVENTORY.yml

**Responsable:** Tech Lead
**Duración:** 30 minutos

```bash
# Backup del inventario anterior
cp docs/90-transversal/inventarios/BACKEND_INVENTORY.yml \
   docs/90-transversal/inventarios/BACKEND_INVENTORY_v2.1_backup.yml

# Reemplazar con versión corregida
cp docs/90-transversal/inventarios/BACKEND_INVENTORY_CORRECTED.yml \
   docs/90-transversal/inventarios/BACKEND_INVENTORY.yml

# Commit
git add docs/90-transversal/inventarios/
git commit -m "fix(docs): Actualizar BACKEND_INVENTORY con stack real (NestJS + TypeORM)"
```

---

#### ✅ Tarea 4.3: Actualizar TRACEABILITY.yml de Épicas

**Responsable:** Tech Lead
**Duración:** 1 hora

**Archivos a actualizar:**

1. `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/TRACEABILITY.yml`
2. `docs/01-fase-alcance-inicial/EAI-003-gamificacion/implementacion/TRACEABILITY.yml`

**Cambios en sección `testing:`**

```yaml
# ANTES
testing:
  coverage:
    overall: 88%
    backend: 88%
    note: "Estimado original"

# DESPUÉS
testing:
  coverage:
    overall: 18%
    backend: 18%
    note: "CORREGIDO 2025-11-08: Coverage real muy inferior a estimado original"
    gap: -70%
    priority: CRÍTICA
```

**Agregar nota en `status:`**

```yaml
status:
  phase_status: completed
  completion_date: "2024-08-15"
  updated: "2025-11-08"
  notes: |
    Épica completada y en producción.

    ⚠️ ACTUALIZACIÓN 2025-11-08:
    - Stack real: NestJS + TypeORM (NO Express + Prisma)
    - Test coverage real: 18% (NO 88%)
    - Brecha crítica de -70% en testing
    - Funcionalidad implementada y funcionando
    - URGENTE: Agregar tests en Sprint de Deuda Técnica
```

---

### Día 5 - Testing y Validación Final

#### ✅ Tarea 5.1: Testing Integral

**Responsable:** QA + Backend Team
**Duración:** 3 horas

**Checklist de Pruebas:**

```bash
# 1. Build exitoso
cd apps/backend
npm run build
# ✅ Sin errores de compilación TypeScript

# 2. Iniciar servidor
npm run dev
# ✅ Server starts sin errores

# 3. Health check
curl http://localhost:3000/api/health
# ✅ Status 200

# 4. Test Assignments (schema correcto)
curl http://localhost:3000/api/v1/assignments
# ✅ Query ejecuta correctamente

# 5. Test RBAC (roles table)
curl -X POST http://localhost:3000/api/v1/auth/assign-role \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":"xxx","role":"student"}'
# ✅ Asignación funciona

# 6. Test Progress (mastered status)
curl -X PATCH http://localhost:3000/api/v1/progress/module/123 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"mastered"}'
# ✅ Actualización funciona

# 7. Test Notifications (type enum)
curl http://localhost:3000/api/v1/notifications
# ✅ Queries funcionan
```

---

#### ✅ Tarea 5.2: Verificación de BD

**Responsable:** Database Team
**Duración:** 1 hora

```sql
-- 1. Verificar enums creados
SELECT
    n.nspname as schema,
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typname IN ('progress_status', 'notification_type', 'notification_priority', 'difficulty_level')
GROUP BY n.nspname, t.typname
ORDER BY schema, enum_name;

-- 2. Verificar tablas assignments están en schemas correctos
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename LIKE 'assignment%'
ORDER BY schemaname, tablename;
-- ✅ Debe mostrar:
--   educational_content | assignments
--   educational_content | assignment_submissions
--   social_features     | assignment_classrooms

-- 3. Verificar tabla roles existe
SELECT * FROM information_schema.tables
WHERE table_schema = 'auth_management'
  AND table_name = 'roles';
-- ✅ Debe existir
```

---

#### ✅ Tarea 5.3: Code Review

**Responsable:** Tech Lead
**Duración:** 1 hora

**Checklist de Revisión:**

- [ ] ✅ Todas las entities Assignment usan schemas correctos
- [ ] ✅ DB_TABLES constants actualizadas
- [ ] ✅ UserRole entity apunta a tabla 'roles'
- [ ] ✅ ProgressStatusEnum incluye 'mastered'
- [ ] ✅ No hay hardcoding de nombres de tablas/schemas
- [ ] ✅ _MAP.md actualizado con stack real
- [ ] ✅ BACKEND_INVENTORY.yml corregido
- [ ] ✅ TRACEABILITY.yml actualizados
- [ ] ✅ Migration script ejecutado exitosamente
- [ ] ✅ Todos los tests pasan
- [ ] ✅ No hay errores en logs

---

#### ✅ Tarea 5.4: Deploy a Dev/Staging

**Responsable:** DevOps
**Duración:** 1 hora

```bash
# 1. Merge de cambios
git checkout main
git pull
git merge feature/fix-p0-issues

# 2. Deploy a dev
./scripts/deploy-dev.sh

# 3. Ejecutar migration en dev
psql gamilit_dev -f apps/database/migrations/2025-11-08-fix-p0-issues.sql

# 4. Restart backend
pm2 restart gamilit-backend-dev

# 5. Smoke tests
curl https://dev.gamilit.com/api/health
curl https://dev.gamilit.com/api/v1/assignments

# 6. Monitorear logs
pm2 logs gamilit-backend-dev --lines 100
# ✅ Sin errores críticos
```

---

## CRITERIOS DE ACEPTACIÓN FINAL

### ✅ Checklist General

- [ ] Migration ejecutada exitosamente en dev
- [ ] Todas las entities backend usan schemas correctos
- [ ] Enums sincronizados Backend ↔ BD
- [ ] Tests manuales pasados (checklist arriba)
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Deploy a dev exitoso
- [ ] Sin errores en logs de producción por 24 horas

### ✅ Métricas de Éxito

| Métrica | Antes | Después | Estado |
|---------|-------|---------|--------|
| **Problemas P0** | 7 | 0 | ✅ |
| **Entities en schema incorrecto** | 3 | 0 | ✅ |
| **Enums desincronizados** | 6 | 0 | ✅ |
| **Documentación actualizada** | 0/3 | 3/3 | ✅ |
| **Build exitoso** | ⚠️ | ✅ | ✅ |

---

## RIESGOS Y PLAN DE ROLLBACK

### Riesgos Identificados

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Queries fallan después de cambio schema | Media | Testing exhaustivo pre-deploy |
| Enum migration rompe datos | Baja | Solo agregamos valores, no modificamos |
| Performance issues post-migration | Baja | Queries usan mismos índices |

### Plan de Rollback

Si algo falla en producción:

```bash
# 1. Rollback de código
git revert HEAD
git push

# 2. Rollback de BD (si es necesario)
psql gamilit_dev < backup_pre_migration_YYYYMMDD.sql

# 3. Restart services
pm2 restart all

# 4. Verificar
curl https://dev.gamilit.com/api/health
```

---

## COMUNICACIÓN

### Stakeholders a Notificar

- ✅ Tech Lead (inicio y fin de sprint)
- ✅ Product Owner (aviso de deuda técnica)
- ✅ QA Team (plan de testing)
- ✅ DevOps (migration script)
- ✅ Frontend Team (sin impacto, pero informar)

### Mensaje de Comunicación

```
📢 Sprint de Deuda Técnica (5 días)

Vamos a resolver 7 problemas críticos (P0) de alineación Backend-BD:
- Migración de Assignments a schemas correctos
- Sincronización de enums
- Actualización de documentación

Impacto: BAJO en funcionalidad, ALTO en calidad de código
Timeline: 5 días (Día 1-5)
Deploy: Incremental en dev/staging
```

---

## PRÓXIMOS PASOS POST-P0

Una vez completado este sprint P0, continuar con:

1. **Sprint P1** (10 días) - Enums y entidades faltantes
2. **Sprint Testing** (15 días) - Aumentar coverage a 30%
3. **Sprint P2** (10 días) - Tablas huérfanas y limpieza

**Total deuda técnica:** ~30 días laborables

---

**FIN DEL PLAN**

**Generado:** 2025-11-08
**Por:** Claude Code Analysis
**Revisado:** Pending Tech Lead approval
