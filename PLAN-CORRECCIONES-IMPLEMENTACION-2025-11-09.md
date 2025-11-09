# 🔧 PLAN DE CORRECCIONES - Implementación de Entidades Faltantes
## Proyecto GAMILIT - Roadmap de Ejecución

**Fecha:** 2025-11-09
**Versión:** 1.0
**Opción elegida:** B (P0 + P1) - 34 entidades en 6-8 semanas
**Budget:** ~$55,000 USD
**Equipo:** 2 Backend Devs + 1 QA + 0.5 Tech Lead

---

## 📋 ÍNDICE DEL PLAN

1. [Fase 0: Setup y Quick Win](#fase-0-setup-y-quick-win-semana-1)
2. [Fase 1: Auth & Security](#fase-1-auth--security-semanas-2-3)
3. [Fase 2: Educational Core](#fase-2-educational-core-semanas-3-4)
4. [Fase 3: Progress Tracking](#fase-3-progress-tracking-semana-4)
5. [Fase 4: Gamification](#fase-4-gamification-semanas-5-6)
6. [Fase 5: Social Features](#fase-5-social-features-semanas-6-7)
7. [Fase 6: System Config](#fase-6-system-config-semana-7)
8. [Fase 7: Testing & QA](#fase-7-testing--qa-semana-8)
9. [Fase 8: Deployment](#fase-8-deployment-semana-9)

---

## 🎯 FASE 0: SETUP Y QUICK WIN (Semana 1)

**Objetivo:** Preparar el terreno y lograr primera victoria rápida
**Duración:** 5 días
**Responsables:** Tech Lead + 2 Backend Devs

### Día 1: Meeting y Setup

#### ☑️ Checklist Morning (2 horas)

**Meeting de Stakeholders**
```
Asistentes: CTO, PO, Tech Lead, Backend Lead, QA Lead
Duración: 2 horas
Agenda:
  ✅ Presentar RESUMEN-EJECUTIVO-VALIDACION.md
  ✅ Revisar hallazgos críticos (60% BD inaccesible)
  ✅ Decidir presupuesto (~$55K para Opción B)
  ✅ Aprobar timeline (6-8 semanas)
  ✅ Asignar recursos
     - 2 Backend Developers (40h/semana c/u)
     - 1 QA Engineer (40h/semana)
     - 0.5 Tech Lead (20h/semana - code reviews)
  ✅ Establecer daily standups (9:00 AM, 15 min)
```

#### ☑️ Checklist Afternoon (4 horas)

**Setup de Proyecto**

```bash
# 1. Crear branch de feature
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit
git checkout -b feature/p0-p1-entities-implementation
git push -u origin feature/p0-p1-entities-implementation

# 2. Crear estructura de tracking
mkdir -p docs/90-transversal/implementacion-entidades
touch docs/90-transversal/implementacion-entidades/PROGRESS.md
touch docs/90-transversal/implementacion-entidades/CHANGELOG.md

# 3. Setup scripts de validación
cp /tmp/validacion_exhaustiva_entidades.sh scripts/validacion/
cp /tmp/analisis_mapeo.py scripts/validacion/
cp /tmp/matriz_trazabilidad.py scripts/validacion/
chmod +x scripts/validacion/*.sh

# 4. Configurar pre-commit hooks
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validar que nuevas entidades tengan constante
python3 scripts/validacion/analisis_mapeo.py

# Validar que coverage no baje
npm run test:coverage -- --silent
EOF
chmod +x .husky/pre-commit
```

**Crear estructura de tickets**

```yaml
# Crear en Jira/GitHub Issues
Epic: "P0-P1 Entities Implementation"

  Story 1: [P0] Complete database.constants.ts
    - Add 44 missing constants
    - Update type definitions
    - Estimation: 4h
    - Assignee: Backend Dev #1

  Story 2: [P0] Auth Module - Users & Roles (8 entities)
    - Subtasks: user, role, profile, tenant, auth-provider,
                email-verification-token, password-reset-token,
                security-event
    - Estimation: 40h (5 días)
    - Assignee: Backend Dev #1 (lead), Backend Dev #2 (support)

  Story 3: [P0] Educational Module (6 entities)
    - Estimation: 32h (4 días)
    - Assignee: Backend Dev #2 (lead), Backend Dev #1 (support)

  Story 4: [P0] Progress Tracking (5 entities)
    - Estimation: 24h (3 días)
    - Assignee: Backend Dev #1

  Story 5: [P1] Gamification (4 entities)
    - Estimation: 20h (2.5 días)
    - Assignee: Backend Dev #2

  Story 6: [P1] Social Features (8 entities)
    - Estimation: 32h (4 días)
    - Assignee: Backend Dev #1 + #2 (pair programming)

  Story 7: [P1] System Configuration (3 entities)
    - Estimation: 16h (2 días)
    - Assignee: Backend Dev #2

  Story 8: Testing & QA
    - Estimation: 80h (2 semanas)
    - Assignee: QA Engineer
```

---

### Día 2-3: QUICK WIN - Complete database.constants.ts

**Objetivo:** Agregar 44 constantes faltantes
**Tiempo:** 4-6 horas
**Prioridad:** 🔴 CRÍTICA (prerequisito para todas las entidades)

#### ✅ Paso 1: Agregar constantes AUTH

**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`

```typescript
// Buscar sección AUTH y agregar:
export const DB_TABLES = {
  AUTH: {
    // ... existentes ...

    // ✨ NUEVAS (5 constantes)
    ROLES: 'roles',  // 🔴 P0
    PARENT_ACCOUNTS: 'parent_accounts',  // 🔴 P0
    PARENT_STUDENT_LINKS: 'parent_student_links',  // 🔴 P0
    PARENT_NOTIFICATIONS: 'parent_notifications',  // 🔴 P0
    USER_SUSPENSIONS: 'user_suspensions',  // 🔴 P0
  },

  // ... resto de schemas
}
```

#### ✅ Paso 2: Agregar constantes AUDIT_LOGGING (nuevo schema)

```typescript
export const DB_SCHEMAS = {
  // ... existentes ...
  AUDIT: 'audit_logging',  // Ya existe
}

export const DB_TABLES = {
  // ... existentes ...

  /**
   * Audit Logging Schema
   * Tablas de auditoría y logs del sistema
   */
  AUDIT: {
    AUDIT_LOGS: 'audit_logs',  // 🟢 P2
    SYSTEM_LOGS: 'system_logs',  // 🟢 P2
    USER_ACTIVITY_LOGS: 'user_activity_logs',  // 🟢 P2
    PERFORMANCE_METRICS: 'performance_metrics',  // 🟢 P2
    SYSTEM_ALERTS: 'system_alerts',  // 🟢 P2
    USER_ACTIVITY: 'user_activity',  // 🟢 P2
  },
}
```

#### ✅ Paso 3: Agregar constantes SYSTEM_CONFIGURATION (nuevo schema)

```typescript
export const DB_SCHEMAS = {
  // ... existentes ...
  SYSTEM_CONFIGURATION: 'system_configuration',  // ✨ NUEVO
}

export const DB_TABLES = {
  // ... existentes ...

  /**
   * System Configuration Schema
   * Configuración dinámica del sistema
   */
  SYSTEM: {
    SYSTEM_SETTINGS: 'system_settings',  // 🟡 P1
    FEATURE_FLAGS: 'feature_flags',  // 🟡 P1
    NOTIFICATION_SETTINGS: 'notification_settings',  // 🟡 P1
    API_CONFIGURATION: 'api_configuration',  // 🟢 P2
    ENVIRONMENT_CONFIG: 'environment_config',  // 🟢 P2
    TENANT_CONFIGURATIONS: 'tenant_configurations',  // 🟢 P2
  },
}
```

#### ✅ Paso 4: Agregar constantes LTI_INTEGRATION (nuevo schema)

```typescript
export const DB_SCHEMAS = {
  // ... existentes ...
  LTI: 'lti_integration',  // ✨ NUEVO
}

export const DB_TABLES = {
  // ... existentes ...

  /**
   * LTI Integration Schema
   * Learning Tools Interoperability
   */
  LTI: {
    LTI_CONSUMERS: 'lti_consumers',  // 🔵 P3
    LTI_SESSIONS: 'lti_sessions',  // 🔵 P3
    LTI_GRADE_PASSBACK: 'lti_grade_passback',  // 🔵 P3
  },
}
```

#### ✅ Paso 5: Completar PROGRESS_TRACKING

```typescript
export const DB_TABLES = {
  // ... existentes ...

  PROGRESS: {
    // ... existentes (5) ...

    // ✨ NUEVAS (8 constantes)
    ENGAGEMENT_METRICS: 'engagement_metrics',  // 🟢 P2
    LEARNING_PATHS: 'learning_paths',  // 🟢 P2
    MASTERY_TRACKING: 'mastery_tracking',  // 🟢 P2
    MODULE_COMPLETION_TRACKING: 'module_completion_tracking',  // 🟢 P2
    PROGRESS_SNAPSHOTS: 'progress_snapshots',  // 🟢 P2
    SKILL_ASSESSMENTS: 'skill_assessments',  // 🟢 P2
    TEACHER_NOTES: 'teacher_notes',  // 🔴 P0
    USER_LEARNING_PATHS: 'user_learning_paths',  // 🟢 P2
  },
}
```

#### ✅ Paso 6: Completar SOCIAL_FEATURES

```typescript
export const DB_TABLES = {
  // ... existentes ...

  SOCIAL: {
    // ... existentes (8) ...

    // ✨ NUEVAS (7 constantes)
    PEER_CHALLENGES: 'peer_challenges',  // 🟡 P1
    CHALLENGE_PARTICIPANTS: 'challenge_participants',  // 🟡 P1
    CHALLENGE_RESULTS: 'challenge_results',  // 🟡 P1
    DISCUSSION_THREADS: 'discussion_threads',  // 🟢 P2
    SOCIAL_INTERACTIONS: 'social_interactions',  // 🟢 P2
    TEACHER_CLASSROOMS: 'teacher_classrooms',  // 🟢 P2
    USER_FOLLOWS: 'user_follows',  // 🟢 P2
  },
}
```

#### ✅ Paso 7: Completar CONTENT_MANAGEMENT

```typescript
export const DB_TABLES = {
  // ... existentes ...

  CONTENT: {
    // ... existentes (3) ...

    // ✨ NUEVAS (5 constantes)
    CONTENT_AUTHORS: 'content_authors',  // 🟢 P2
    CONTENT_CATEGORIES: 'content_categories',  // 🟢 P2
    CONTENT_VERSIONS: 'content_versions',  // 🟢 P2
    FLAGGED_CONTENT: 'flagged_content',  // 🟢 P2
    MEDIA_METADATA: 'media_metadata',  // 🟢 P2
  },
}
```

#### ✅ Paso 8: Completar GAMIFICATION_SYSTEM

```typescript
export const DB_TABLES = {
  // ... existentes ...

  GAMIFICATION: {
    // ... existentes (12) ...

    // ✨ NUEVAS (3 constantes)
    MAYA_RANKS: 'maya_ranks',  // 🟡 P1
    COMODIN_USAGE_LOG: 'comodin_usage_log',  // 🟡 P1
    COMODIN_USAGE_TRACKING: 'comodin_usage_tracking',  // 🟡 P1
  },
}
```

#### ✅ Paso 9: Agregar AUTH.USERS

```typescript
export const DB_SCHEMAS = {
  // ... existentes ...
  AUTH_SUPABASE: 'auth',  // Schema de Supabase (diferente de auth_management)
}

export const DB_TABLES = {
  // ... existentes ...

  /**
   * Auth Schema (Supabase)
   * Tabla base de usuarios de Supabase
   */
  AUTH_BASE: {
    USERS: 'users',  // 🔴 P0 (nota: puede no necesitar entidad si usamos Supabase directamente)
  },
}
```

#### ✅ Paso 10: Actualizar Type Helpers

```typescript
// Al final del archivo, agregar:

export type AuditTable = (typeof DB_TABLES.AUDIT)[keyof typeof DB_TABLES.AUDIT];
export type SystemTable = (typeof DB_TABLES.SYSTEM)[keyof typeof DB_TABLES.SYSTEM];
export type LTITable = (typeof DB_TABLES.LTI)[keyof typeof DB_TABLES.LTI];
```

#### ✅ Verificación

```bash
# 1. Compilar para verificar tipos
cd apps/backend
npm run build

# 2. Ejecutar script de validación
python3 ../../scripts/validacion/analisis_mapeo.py

# Resultado esperado:
# Constantes definidas: 99 (era 55, +44)
# Gap: 0 constantes faltantes ✅

# 3. Commit
git add apps/backend/src/shared/constants/database.constants.ts
git commit -m "feat(constants): add 44 missing table constants

- Add AUDIT schema constants (6)
- Add SYSTEM schema constants (6)
- Add LTI schema constants (3)
- Complete PROGRESS constants (+8)
- Complete SOCIAL constants (+7)
- Complete AUTH constants (+5)
- Complete CONTENT constants (+5)
- Complete GAMIFICATION constants (+3)
- Add AUTH_BASE.USERS constant (+1)

Refs: #TICKET-001
Impact: Enables implementation of 44 missing entities"
```

**✅ QUICK WIN COMPLETADO**

**Impacto:**
- ✅ 44 constantes agregadas
- ✅ 0 constantes faltantes
- ✅ Prerequisito cumplido para todas las entidades
- ⏱️ Tiempo: 4-6 horas
- 🎯 Próximo paso: Comenzar implementación de entidades P0

---

### Día 4-5: Planificación y Setup de Tests

#### ☑️ Configurar Test Framework

```bash
# 1. Crear estructura de tests
mkdir -p apps/backend/src/modules/auth/__tests__/entities
mkdir -p apps/backend/src/modules/educational/__tests__/entities
mkdir -p apps/backend/src/modules/progress/__tests__/entities
mkdir -p apps/backend/src/modules/gamification/__tests__/entities
mkdir -p apps/backend/src/modules/social/__tests__/entities
mkdir -p apps/backend/src/modules/core/__tests__/entities

# 2. Crear template de test para entidades
cat > apps/backend/src/modules/auth/__tests__/entities/template.entity.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityName } from '../../entities/entity-name.entity';

describe('EntityName Entity', () => {
  let repository: Repository<EntityName>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(EntityName),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<Repository<EntityName>>(
      getRepositoryToken(EntityName),
    );
  });

  describe('Entity Definition', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should have correct table name', () => {
      const metadata = repository.metadata;
      expect(metadata.tableName).toBe('expected_table_name');
    });

    it('should have correct schema', () => {
      const metadata = repository.metadata;
      expect(metadata.schema).toBe('expected_schema');
    });
  });

  describe('Entity Creation', () => {
    it('should create entity with required fields', () => {
      const entity = repository.create({
        // required fields
      });

      expect(entity).toBeDefined();
      // assertions
    });

    it('should fail without required fields', () => {
      expect(() => {
        repository.create({});
      }).toThrow();
    });
  });

  describe('Entity Relationships', () => {
    it('should define expected relationships', () => {
      const metadata = repository.metadata;

      // Check relations
      const relations = metadata.relations.map(r => r.propertyName);
      expect(relations).toContain('expectedRelation');
    });
  });
});
EOF
```

#### ☑️ Configurar Coverage Reports

```json
// apps/backend/package.json
{
  "scripts": {
    "test:coverage": "jest --coverage --coverageDirectory=coverage",
    "test:coverage:watch": "jest --coverage --watch",
    "test:entities": "jest --testPathPattern=entities"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## 🔐 FASE 1: AUTH & SECURITY (Semanas 2-3)

**Objetivo:** Sistema de autenticación completo y seguro
**Entidades:** 8 (P0)
**Duración:** 10 días
**Responsable:** Backend Dev #1 (lead) + Backend Dev #2 (support)

### Entidades a Implementar

#### 1️⃣ Role Entity (Día 6) - CRÍTICO

**Prioridad:** 🔴 P0 (bloquea RBAC)

**Ubicación:** `apps/backend/src/modules/auth/entities/role.entity.ts`

**Pasos:**

```bash
# 1. Crear archivo de entidad
touch apps/backend/src/modules/auth/entities/role.entity.ts

# 2. Implementar código (ver PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md, Sección 1.2)

# 3. Registrar en módulo
# Editar: apps/backend/src/modules/auth/auth.module.ts
# Agregar: TypeOrmModule.forFeature([Role])

# 4. Crear test
touch apps/backend/src/modules/auth/__tests__/entities/role.entity.spec.ts

# 5. Implementar 3 tests mínimos:
#    - Entity definition
#    - Role creation with permissions
#    - Role-user association

# 6. Ejecutar tests
npm run test:entities -- role.entity

# 7. Commit
git add .
git commit -m "feat(auth): implement Role entity

- Add Role entity with RBAC permissions
- Add tests (3 specs)
- Register in AuthModule

Refs: #TICKET-002
Related: database.constants.ts AUTH.ROLES"
```

#### 2️⃣ User Base Entity (Día 6) - CRÍTICO

**Nota:** Si Supabase Auth se usa directamente, esta entidad puede no ser necesaria. Validar con Tech Lead.

**Decisión requerida:**
```
Opción A: Implementar User entity local (duplica Supabase)
Opción B: Usar Supabase Auth directamente (sin entidad ORM)
Opción C: Crear User entity READ-ONLY para joins

Recomendación: Opción C (read-only para relaciones)
```

#### 3️⃣ Profile Entity (Día 7)

**Ubicación:** `apps/backend/src/modules/auth/entities/profile.entity.ts`

**Validación especial:**
```typescript
// Verificar que ya existe y tiene school_id
// Agregar si falta:
@Column({ type: 'uuid', nullable: true })
school_id?: string;

@ManyToOne(() => School, school => school.students, { nullable: true })
@JoinColumn({ name: 'school_id' })
school?: School;
```

#### 4️⃣ Tenant Entity (Día 7)

Ya implementada. **SKIP** ✅

#### 5️⃣ AuthProvider Entity (Día 8)

Ya implementada. **SKIP** ✅

#### 6️⃣ EmailVerificationToken Entity (Día 8)

Ya implementada. **SKIP** ✅

#### 7️⃣ PasswordResetToken Entity (Día 9)

Ya implementada. **SKIP** ✅

#### 8️⃣ SecurityEvent Entity (Día 9)

**Status:** Constante existe, falta entidad

**Ubicación:** `apps/backend/src/modules/auth/entities/security-event.entity.ts`

```typescript
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.SECURITY_EVENTS })
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar' })
  event_type: string; // 'login_success', 'login_failed', 'password_reset'

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

### ✅ Checkpoint Fase 1

```bash
# Validar
npm run test:entities -- auth
npm run build

# Generar reporte
python3 scripts/validacion/matriz_trazabilidad.py

# Resultado esperado:
# auth_management: 10/15 implementadas (67%)
#   - 2 ya existían
#   - 8 nuevas (P0 completadas)
```

---

## 📚 FASE 2: EDUCATIONAL CORE (Semanas 3-4)

**Objetivo:** Contenido educativo completo
**Entidades:** 6 (P0)
**Duración:** 8 días
**Responsable:** Backend Dev #2 (lead) + Backend Dev #1 (support)

### Status Actual

Ya implementadas (SKIP):
- ✅ Module (ya existe en educational)
- ✅ Exercise (ya existe en educational)
- ✅ AssessmentRubric (ya existe en educational)
- ✅ MediaResource (ya existe en educational)

### Entidades a Implementar

#### 1️⃣ ExerciseAnswer Entity (Día 10)

**Ubicación:** `apps/backend/src/modules/educational/entities/exercise-answer.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 2.3

#### 2️⃣ Assignment Entity (Día 11)

**Nota:** Ya existe en módulo `assignments`, pero en schema incorrecto.

**Acción:** Migrar de `public` a `educational_content`

```typescript
// ANTES (en assignments module)
@Entity({ schema: 'public', name: 'assignments' })

// DESPUÉS (mover a educational module)
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.ASSIGNMENTS })
```

#### 3️⃣ AssignmentStudent Entity (Día 11)

Similar a Assignment, migrar de `assignments` a `educational`

#### 4️⃣ AssignmentSubmission Entity (Día 12)

Similar a Assignment, migrar de `assignments` a `educational`

#### 5️⃣ AssignmentExercise Entity (Día 12)

Verificar si ya existe en `assignments` module.

#### 6️⃣ ExerciseOptions Entity (Día 13)

Nueva entidad para opciones de ejercicios de tipo multiple choice.

### ✅ Checkpoint Fase 2

```bash
# Validar
npm run test:entities -- educational
npm run build

# Resultado esperado:
# educational_content: 15/15 implementadas (100%) ✅ Se mantiene
```

---

## 📊 FASE 3: PROGRESS TRACKING (Semana 4)

**Objetivo:** Seguimiento completo del progreso estudiantil
**Entidades:** 5 (P0)
**Duración:** 5 días
**Responsable:** Backend Dev #1

### Status Actual

Ya implementadas:
- ✅ ModuleProgress
- ✅ LearningSession
- ✅ ExerciseAttempt
- ✅ ExerciseSubmission
- ✅ ScheduledMission

### Entidades a Implementar

#### 1️⃣ TeacherNote Entity (Día 14) - ÚNICO P0 FALTANTE

**Ubicación:** `apps/backend/src/modules/progress/entities/teacher-note.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 3.5

**Tests críticos:**
- Teacher puede crear nota para estudiante
- Notas privadas vs públicas
- Relación con módulos

### ✅ Checkpoint Fase 3

```bash
# Validar
npm run test:entities -- progress
npm run build

# Resultado esperado:
# progress_tracking: 6/13 implementadas (46%)
# P0 completos: 6/6 ✅
```

---

## 🎮 FASE 4: GAMIFICATION (Semanas 5-6)

**Objetivo:** Sistema de gamificación completo
**Entidades:** 4 (P1)
**Duración:** 5 días
**Responsable:** Backend Dev #2

### Entidades a Implementar

#### 1️⃣ UserStats Entity (Día 15)

Ya implementada. Verificar completitud. ✅

#### 2️⃣ UserRank Entity (Día 15-16)

**Ubicación:** `apps/backend/src/modules/gamification/entities/user-rank.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 4.2

#### 3️⃣ Achievement Entity (Día 16)

Ya implementada. Verificar. ✅

#### 4️⃣ MLCoinsTransaction Entity (Día 17)

**Ubicación:** `apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 4.4

**Tests críticos:**
- Transacción de ganancia (earned)
- Transacción de gasto (spent)
- Balance after calculation
- Prevenir balance negativo

### ✅ Checkpoint Fase 4

```bash
# Validar
npm run test:entities -- gamification
npm run build

# Resultado esperado:
# gamification_system: 15/15 implementadas (100%) ✅
```

---

## 👥 FASE 5: SOCIAL FEATURES (Semanas 6-7)

**Objetivo:** Funcionalidades sociales y colaborativas
**Entidades:** 8 (P1)
**Duración:** 8 días
**Responsables:** Backend Dev #1 + #2 (pair programming)

### Status Actual

Ya implementadas:
- ✅ School
- ✅ Classroom
- ✅ ClassroomMember
- ✅ Team
- ✅ TeamMember
- ✅ Friendship
- ✅ TeamChallenge
- ✅ AssignmentClassroom

### Entidades a Implementar (P1)

#### 1️⃣ PeerChallenge Entity (Día 18)

**Ubicación:** `apps/backend/src/modules/social/entities/peer-challenge.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 5.7

#### 2️⃣ ChallengeParticipant Entity (Día 18-19)

**Ubicación:** `apps/backend/src/modules/social/entities/challenge-participant.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 5.8

#### 3️⃣ ChallengeResult Entity (Día 19)

**Ubicación:** `apps/backend/src/modules/social/entities/challenge-result.entity.ts`

```typescript
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CHALLENGE_RESULTS })
export class ChallengeResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  challenge_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'int' })
  final_score: number;

  @Column({ type: 'int' })
  rank: number; // 1, 2, 3, etc.

  @Column({ type: 'timestamp' })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => PeerChallenge, challenge => challenge.results)
  @JoinColumn({ name: 'challenge_id' })
  challenge?: PeerChallenge;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

### ✅ Checkpoint Fase 5

```bash
# Validar
npm run test:entities -- social
npm run build

# Resultado esperado:
# social_features: 11/15 implementadas (73%)
# P0+P1 completos ✅
```

---

## ⚙️ FASE 6: SYSTEM CONFIG (Semana 7)

**Objetivo:** Configuración dinámica del sistema
**Entidades:** 3 (P1)
**Duración:** 3 días
**Responsable:** Backend Dev #2

### Crear Nuevo Módulo

```bash
# 1. Crear módulo core (si no existe)
mkdir -p apps/backend/src/modules/core/entities
mkdir -p apps/backend/src/modules/core/services
mkdir -p apps/backend/src/modules/core/__tests__

# 2. Crear module file
touch apps/backend/src/modules/core/core.module.ts
```

### Entidades a Implementar

#### 1️⃣ SystemSetting Entity (Día 20)

**Ubicación:** `apps/backend/src/modules/core/entities/system-setting.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 6.1

#### 2️⃣ FeatureFlag Entity (Día 21)

**Ubicación:** `apps/backend/src/modules/core/entities/feature-flag.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 6.2

**Tests críticos:**
- Feature flag toggle
- Gradual rollout (percentage)
- Early access users

#### 3️⃣ NotificationSetting Entity (Día 22)

**Ubicación:** `apps/backend/src/modules/core/entities/notification-setting.entity.ts`

Ver código en `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md` Sección 6.3

### ✅ Checkpoint Fase 6

```bash
# Validar
npm run test:entities -- core
npm run build

# Resultado esperado:
# system_configuration: 3/6 implementadas (50%)
# P0+P1 completos ✅
```

---

## 🧪 FASE 7: TESTING & QA (Semana 8)

**Objetivo:** Validación completa y alcanzar >70% coverage
**Duración:** 5 días
**Responsable:** QA Engineer (lead) + Backend Devs (support)

### Día 23-24: Tests de Integración

#### ☑️ Tests E2E para flujos completos

```typescript
// apps/backend/test/e2e/auth-flow.e2e-spec.ts
describe('Auth Flow (e2e)', () => {
  it('should complete full registration flow', async () => {
    // 1. Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Test123!' });

    expect(registerResponse.status).toBe(201);

    // 2. Verify email token created
    const tokenRepo = moduleFixture.get(getRepositoryToken(EmailVerificationToken));
    const token = await tokenRepo.findOne({ where: { user_id: registerResponse.body.id } });
    expect(token).toBeDefined();

    // 3. Verify email
    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: token.token });

    expect(verifyResponse.status).toBe(200);

    // 4. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.access_token).toBeDefined();

    // 5. Verify security event logged
    const eventRepo = moduleFixture.get(getRepositoryToken(SecurityEvent));
    const event = await eventRepo.findOne({
      where: { user_id: registerResponse.body.id, event_type: 'login_success' }
    });
    expect(event).toBeDefined();
  });
});
```

**Flujos a testear:**
- ✅ Auth Flow (registro → verify → login → reset password)
- ✅ Educational Flow (create module → add exercises → student completes)
- ✅ Gamification Flow (complete exercise → earn XP → rank up → unlock achievement)
- ✅ Social Flow (create classroom → invite students → create team)
- ✅ Configuration Flow (set feature flag → verify frontend sees it)

### Día 25: Performance Testing

```typescript
// apps/backend/test/performance/database-queries.perf.ts
describe('Database Query Performance', () => {
  it('should load user with all relations in <100ms', async () => {
    const start = Date.now();

    const user = await userRepo.findOne({
      where: { id: testUserId },
      relations: ['profile', 'roles', 'stats', 'achievements']
    });

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
    expect(user).toBeDefined();
  });

  it('should paginate classrooms efficiently', async () => {
    // Test N+1 queries
    const start = Date.now();

    const classrooms = await classroomRepo.find({
      take: 20,
      skip: 0,
      relations: ['members', 'teams']
    });

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
    expect(classrooms.length).toBeLessThanOrEqual(20);
  });
});
```

### Día 26: Security Testing

```bash
# 1. SQL Injection tests
npm run test:security -- sql-injection

# 2. XSS tests
npm run test:security -- xss

# 3. CSRF tests
npm run test:security -- csrf

# 4. Rate limiting tests
npm run test:security -- rate-limit

# 5. RLS policies validation
npm run test:security -- rls-policies
```

### Día 27: Coverage Validation

```bash
# 1. Generar reporte de coverage
npm run test:coverage

# 2. Verificar threshold
# Debe ser >70% en:
#   - Branches
#   - Functions
#   - Lines
#   - Statements

# 3. Si coverage < 70%, identificar gaps
npx jest --coverage --coverageReporters=lcov
open coverage/lcov-report/index.html

# 4. Agregar tests faltantes hasta alcanzar >70%
```

### ✅ Checkpoint Fase 7

```bash
# Validaciones finales
npm run build  # 0 errores ✅
npm run lint   # 0 warnings ✅
npm run test   # All pass ✅
npm run test:coverage  # >70% ✅
npm run test:e2e  # All pass ✅

# Generar reporte final
python3 scripts/validacion/matriz_trazabilidad.py

# Resultado esperado:
# Total: 97 tablas
# Completas: 73 (75%) - Era 39 (40%)
# Parciales: 0 (0%) - Era 14 (14%)
# Faltantes: 24 (25%) - Era 44 (45%)
#
# P0+P1 implementados: 100% ✅
```

---

## 🚀 FASE 8: DEPLOYMENT (Semana 9)

**Objetivo:** Despliegue a staging y producción
**Duración:** 5 días
**Responsable:** Tech Lead + DevOps

### Día 28: Staging Deployment

```bash
# 1. Merge feature branch
git checkout develop
git merge feature/p0-p1-entities-implementation
git push origin develop

# 2. Deploy a staging
./scripts/deploy-staging.sh

# 3. Ejecutar migraciones
npm run migration:run -- --env=staging

# 4. Seed data de testing
npm run seed:staging

# 5. Smoke tests
curl https://staging.gamilit.com/health
npm run test:e2e -- --env=staging

# 6. Validar logs
kubectl logs -f deployment/gamilit-backend-staging
```

### Día 29: UAT (User Acceptance Testing)

**Checklist de validación funcional:**

```markdown
## Auth & Security
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Reset password funciona
- [ ] RBAC funciona (roles se aplican correctamente)
- [ ] Security events se registran

## Educational Content
- [ ] Módulos se cargan correctamente
- [ ] Ejercicios se muestran
- [ ] Asignaciones se crean
- [ ] Estudiantes pueden completar ejercicios
- [ ] Respuestas se guardan correctamente

## Progress Tracking
- [ ] Progreso de módulo se actualiza
- [ ] Sesiones de aprendizaje se registran
- [ ] Intentos de ejercicios se guardan
- [ ] Notas de profesor funcionan

## Gamification
- [ ] XP se otorga correctamente
- [ ] Rankings funcionan
- [ ] Achievements se desbloquean
- [ ] ML Coins transactions funcionan
- [ ] Transacciones tienen balance correcto

## Social Features
- [ ] Classrooms se crean
- [ ] Invitaciones a estudiantes funcionan
- [ ] Teams se forman
- [ ] Peer challenges funcionan
- [ ] Resultados de challenges se registran

## System Configuration
- [ ] System settings se cargan
- [ ] Feature flags funcionan
- [ ] Notification settings se aplican
```

### Día 30: Production Deployment

```bash
# 1. Backup de base de datos
pg_dump gamilit_production > backup_pre_entities_$(date +%Y%m%d).sql

# 2. Merge a main
git checkout main
git merge develop
git tag -a v2.0.0 -m "P0+P1 entities implementation complete"
git push origin main --tags

# 3. Deploy a producción
./scripts/deploy-production.sh

# 4. Ejecutar migraciones con safety checks
npm run migration:run -- --env=production --dry-run  # Preview
npm run migration:run -- --env=production  # Execute

# 5. Seed data de producción (solo datos esenciales)
npm run seed:production

# 6. Smoke tests en producción
curl https://api.gamilit.com/health
npm run test:e2e -- --env=production --critical-only

# 7. Monitoreo activo (primeras 24h)
# - Logs en tiempo real
# - Métricas de performance
# - Error tracking (Sentry)
# - Alertas configuradas

# 8. Rollback plan ready
# Si algo falla:
./scripts/rollback-production.sh
psql gamilit_production < backup_pre_entities_$(date +%Y%m%d).sql
```

### Post-Deployment (Días 31-35)

```bash
# Día 31: Monitoring
- Verificar métricas de performance
- Revisar error rates
- Validar que no hay regresiones

# Día 32: User feedback
- Recopilar feedback de usuarios beta
- Identificar issues no detectados en testing
- Priorizar bugs encontrados

# Día 33-34: Bug fixing
- Fix de bugs críticos encontrados
- Hot fixes si es necesario
- Deploy de patches

# Día 35: Retrospective
- Meeting de retrospectiva del equipo
- Documentar lecciones aprendidas
- Actualizar procesos para siguiente fase
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs del Proyecto

```yaml
Antes (2025-11-09):
  coverage_completo: 40% (39/97 tablas)
  coverage_parcial: 14% (14/97 tablas)
  coverage_faltante: 45% (44/97 tablas)
  tests: 11 archivos
  test_coverage: <30%
  typescript_errors: 0

Después (2025-12-27 - estimado):
  coverage_completo: 75% (73/97 tablas) ✅ +35 puntos
  coverage_parcial: 0% (0/97 tablas) ✅
  coverage_faltante: 25% (24/97 tablas) ✅ Solo P2/P3
  tests: ~120 archivos ✅ +109
  test_coverage: >70% ✅ +40 puntos
  typescript_errors: 0 ✅ Mantenido

Funcionalidades habilitadas:
  ✅ Auth completo (RBAC, social login, tokens)
  ✅ Educational content 100%
  ✅ Progress tracking completo
  ✅ Gamification 100%
  ✅ Social features (classrooms, teams, challenges)
  ✅ System configuration dinámica
  ✅ Feature flags
```

### ROI Estimado

```
Inversión:     ~$55,000 USD
Tiempo:        6-8 semanas
Personal:      4 personas (2 devs + QA + tech lead)

Resultado:
  - 34 nuevas entidades implementadas
  - 75% de BD accesible (vs 40% inicial)
  - Tests >70% coverage
  - Sistema production-ready
  - Funcionalidades críticas disponibles

Valor de negocio:
  - Deploy posible en 9 semanas
  - Reducción de riesgo técnico
  - Base sólida para P2/P3 futuro
  - Deuda técnica minimizada
```

---

## 📋 CHECKLIST FINAL

### Antes de Comenzar

- [ ] Meeting de stakeholders completado
- [ ] Budget aprobado (~$55K)
- [ ] Equipo asignado (2 backend + QA + tech lead)
- [ ] Branch `feature/p0-p1-entities-implementation` creado
- [ ] Scripts de validación configurados
- [ ] Daily standups agendados (9:00 AM)

### Durante Implementación

- [ ] database.constants.ts completo (44 constantes)
- [ ] 34 entidades P0+P1 implementadas
- [ ] 3+ tests por entidad (mínimo 102 tests nuevos)
- [ ] Coverage >70% alcanzado
- [ ] 0 errores TypeScript
- [ ] Code reviews diarios
- [ ] Documentación actualizada

### Antes de Deploy

- [ ] Tests E2E passing
- [ ] Performance tests OK (<100ms queries)
- [ ] Security tests passing
- [ ] Staging deployment exitoso
- [ ] UAT completado
- [ ] Backup de base de datos
- [ ] Rollback plan documentado

### Post-Deploy

- [ ] Monitoring activo (24h)
- [ ] User feedback recopilado
- [ ] Bugs críticos resueltos
- [ ] Retrospectiva del equipo
- [ ] Documentación actualizada
- [ ] Inventarios actualizados (v2.3)

---

## 🚨 RIESGOS Y MITIGACIÓN

### Riesgo 1: Timeline se extiende

**Probabilidad:** MEDIA
**Impacto:** ALTO

**Mitigación:**
- Daily standups estrictos
- Bloqueadores resueltos inmediatamente
- Pair programming para tareas complejas
- Buffer de 1 semana incluido en estimación

---

### Riesgo 2: Tests no alcanzan 70%

**Probabilidad:** MEDIA
**Impacto:** CRÍTICO

**Mitigación:**
- TDD desde día 1
- 3 tests mínimo por entidad (regla estricta)
- QA Engineer dedicado full-time
- Code reviews rechazan PRs sin tests

---

### Riesgo 3: Regresiones en funcionalidad existente

**Probabilidad:** BAJA
**Impacto:** CRÍTICO

**Mitigación:**
- Tests E2E completos antes de merge
- Staging deployment obligatorio
- Smoke tests automáticos
- Rollback plan ready

---

### Riesgo 4: Dependencias entre entidades bloquean progreso

**Probabilidad:** ALTA
**Impacto:** MEDIO

**Mitigación:**
- Orden de implementación bien definido
- Relaciones opcionales inicialmente
- Mocks para dependencias no implementadas
- 2 developers pueden trabajar en paralelo

---

## 📞 CONTACTOS Y ESCALACIÓN

### Daily Operations

**Backend Dev #1:**
- Responsable: Auth, Progress, Social (lead)
- Backup: Backend Dev #2

**Backend Dev #2:**
- Responsable: Educational, Gamification, System Config (lead)
- Backup: Backend Dev #1

**QA Engineer:**
- Responsable: Testing, Coverage validation
- Backup: Tech Lead

**Tech Lead:**
- Responsable: Code reviews, Arquitectura, Deploy
- Escalación: CTO

### Escalación de Issues

**Nivel 1 - Bloqueador técnico:**
→ Daily standup → Tech Lead decide

**Nivel 2 - Cambio de scope:**
→ Tech Lead → Product Owner → Decisión en <24h

**Nivel 3 - Budget o timeline:**
→ Product Owner → CTO → Decisión en <48h

---

## ✅ CONCLUSIÓN

Este plan de correcciones es ejecutable, medible y verificable. Cada fase tiene:

- ✅ Objetivos claros
- ✅ Entregables específicos
- ✅ Checkpoints de validación
- ✅ Timeline realista
- ✅ Responsables asignados
- ✅ Riesgos identificados y mitigados

**Próximo paso inmediato:**
1. Agendar meeting de stakeholders (48h)
2. Aprobar budget y recursos
3. Comenzar Día 1 con Quick Win (database.constants.ts)

**Resultado esperado:**
Sistema production-ready en 9 semanas con 75% de BD accesible y >70% test coverage.

---

**Documento:** Plan de Correcciones - Implementación
**Fecha:** 2025-11-09
**Versión:** 1.0
**Status:** ⏳ Pendiente de aprobación
**Próxima revisión:** Después del meeting de stakeholders
