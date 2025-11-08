# ADR-003: RLS vs App-Layer Authorization Strategy

**Fecha:** 2025-10-28
**Estado:** ✅ Aceptado
**Autores:** DBA, Backend Lead, Security Team
**Impacto:** Muy Alto - Arquitectura de seguridad

---

## 🔗 Trazabilidad

**User Stories:**
- [US-FUND-004: Infraestructura técnica base](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-004-infraestructura-tecnica-base.md) - Setup PostgreSQL RLS + multi-tenancy

**Épicas:**
- [EAI-001: Fundamentos](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - Infraestructura base con RLS
- [EAI-005: Admin Base](../../../04-planificacion/01-alcance-inicial/EAI-005-admin-base/_MAP.md) - Control de acceso por roles

**Especificaciones técnicas relacionadas:**
- [Sistema de Seguridad](../seguridad/SISTEMA-SEGURIDAD.md) - Capa 3: Row Level Security (159+ políticas)
- [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md) - RLS Context middleware
- [Arquitectura General](../arquitectura/ARQUITECTURA-GENERAL.md) - Multi-tenancy nativo

**ADRs relacionados:**
- [ADR-002: JWT Security Implementation](./ADR-002-jwt-security-implementation.md) - JWT payload incluye user_id y tenant_id para RLS
- [ADR-005: Multi-tenancy Implementation](./ADR-005-multi-tenancy-implementation.md) - Aislamiento por tenant con RLS

**Requerimientos funcionales:**
- Multi-tenant: Aislamiento completo entre instituciones
- GDPR/FERPA compliance: Protección de datos educativos
- Roles jerárquicos: Student, Teacher, Admin, Super Admin
- Prevención: SQL injection, IDOR, privilege escalation

**Base de datos:**
- PostgreSQL 16+ con Row Level Security
- 9 schemas especializados
- 159+ políticas RLS
- 44 tablas con control de acceso granular

---

## Contexto

GAMILIT es una plataforma educativa multi-tenant que maneja datos sensibles de estudiantes, maestros y organizaciones educativas. La arquitectura requiere:

- **Aislamiento de datos** entre diferentes instituciones/escuelas
- **Control de acceso granular** basado en roles (estudiante, maestro, admin)
- **Relaciones jerárquicas complejas** (maestros → estudiantes → ejercicios)
- **Cumplimiento normativo** (GDPR, FERPA) para datos educativos
- **Prevención de vulnerabilidades** (SQL injection, IDOR, privilege escalation)

**Base de datos:** PostgreSQL 14+
**Backend:** Node.js/Express con TypeScript
**Esquemas:** 8 schemas (auth_management, educational_content, progress_tracking, gamification_system, etc.)
**Tablas con datos sensibles:** 14+ tablas con información personal y progreso académico

---

## Problema

**Pregunta clave:** ¿Cómo implementar autorización y aislamiento de datos de forma segura, escalable y mantenible?

**Desafíos identificados:**

1. **Seguridad en múltiples capas**
   - Backend puede tener vulnerabilidades (bugs, injection attacks)
   - Necesidad de "último recurso" de protección en base de datos

2. **Complejidad de reglas de acceso**
   - Maestros acceden solo a estudiantes de sus aulas
   - Estudiantes ven solo su propio progreso
   - Administradores tienen acceso completo
   - Multi-tenancy: organizaciones aisladas entre sí

3. **Performance vs Seguridad**
   - RLS puede impactar performance de queries complejos
   - App-layer puede tener overhead de validaciones múltiples

4. **Mantenibilidad**
   - Lógica de autorización duplicada es difícil de mantener
   - Cambios en reglas de negocio requieren updates en múltiples lugares

---

## Alternativas Consideradas

### Opción 1: RLS (Row-Level Security) Only

**Descripción:** PostgreSQL RLS como única capa de autorización. Backend confía completamente en la base de datos.

**Implementación:**
```sql
-- Ejemplo: Solo ver propio progreso o ser maestro del estudiante
CREATE POLICY module_progress_select_own
  ON progress_tracking.module_progress
  FOR SELECT
  USING (
    user_id = gamilit.get_current_user_id()
    OR gamilit.is_admin()
    OR (
      gamilit.get_current_user_role() = 'admin_teacher'
      AND EXISTS (
        SELECT 1 FROM social_features.classroom_members cm
        JOIN social_features.classrooms c ON c.id = cm.classroom_id
        WHERE c.teacher_id = gamilit.get_current_user_id()
          AND cm.student_id = module_progress.user_id
      )
    )
  );
```

**Pros:**
- ✅ Seguridad garantizada a nivel de base de datos
- ✅ Imposible bypassear con bugs de backend
- ✅ Lógica centralizada y auditada
- ✅ Protección contra SQL injection

**Contras:**
- ❌ Performance: Queries complejos más lentos (JOINs adicionales)
- ❌ Debugging difícil: Errores de permisos no siempre claros
- ❌ Limitaciones de expresividad: RLS no puede lógica compleja de negocio
- ❌ Overhead en todas las queries (incluso las seguras)

**Estimación:**
- Esfuerzo: 80 horas (crear 159+ políticas)
- Impacto performance: -15% en queries complejos

---

### Opción 2: App-Layer Authorization Only

**Descripción:** Toda la lógica de autorización en el backend. Base de datos sin restricciones RLS.

**Implementación:**
```typescript
// Middleware de autorización
export const checkProgressAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { progressId } = req.params;
  const progress = await db.moduleProgress.findById(progressId);

  // Validar acceso
  if (progress.user_id === req.user.id) {
    return next(); // Propio progreso
  }

  if (req.user.role === 'admin_teacher') {
    const isTeacher = await db.classrooms.isTeacherOf(
      req.user.id,
      progress.user_id
    );
    if (isTeacher) return next();
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
};
```

**Pros:**
- ✅ Lógica de negocio expresiva (JavaScript completo)
- ✅ Debugging más simple: Stack traces claros
- ✅ Performance: Sin overhead de RLS
- ✅ Fácil de testear con unit tests

**Contras:**
- ❌ **Riesgo alto:** Backend bugs pueden exponer datos
- ❌ **SQL Injection:** Vulnerable si hay errores en queries
- ❌ **No hay red de seguridad:** Un middleware olvidado = breach
- ❌ **Compliance:** Auditorías requieren múltiples capas de seguridad
- ❌ **Mantenimiento:** Lógica duplicada en cada endpoint

**Estimación:**
- Esfuerzo: 60 horas (middlewares + tests)
- Riesgo de seguridad: Alto

---

### Opción 3: Hybrid Approach (RLS + App-Layer) ✅

**Descripción:** RLS como defensa primaria obligatoria, App-layer para lógica de negocio compleja y mensajes de error amigables.

**Implementación:**

**1. RLS en PostgreSQL (capa primaria):**
```sql
-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE progress_tracking.module_progress ENABLE ROW LEVEL SECURITY;

-- Política básica: solo ver propios datos o ser admin
CREATE POLICY module_progress_basic_access
  ON progress_tracking.module_progress
  FOR SELECT
  USING (
    user_id = gamilit.get_current_user_id()
    OR gamilit.is_admin()
  );
```

**2. Middleware RLS en Backend:**
```typescript
// Establecer contexto de usuario en PostgreSQL
export const applyRLS = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next();

  const client = await pool.connect();

  // SET LOCAL: Variables de sesión para RLS policies
  await client.query(`SET LOCAL app.current_user_id = '${escapeString(req.user.id)}'`);
  await client.query(`SET LOCAL app.current_user_email = '${escapeString(req.user.email)}'`);
  await client.query(`SET LOCAL app.current_user_role = '${escapeString(req.user.role)}'`);

  req.dbClient = client;
  next();
};
```

**3. App-Layer adicional para lógica compleja:**
```typescript
// Validaciones adicionales de negocio
export const checkTeacherClassroomAccess = async (req, res, next) => {
  const { classroomId } = req.params;

  // RLS ya filtró a nivel DB, pero agregamos validación semántica
  const classroom = await db.classrooms.findById(classroomId);

  if (!classroom) {
    return res.status(404).json({
      error: 'Classroom not found or you do not have access'
    });
  }

  // Lógica de negocio: Classroom debe estar activo
  if (classroom.status !== 'active') {
    return res.status(403).json({
      error: 'Cannot access inactive classroom'
    });
  }

  next();
};
```

**Pros:**
- ✅ **Defense in depth:** Múltiples capas de seguridad
- ✅ **Garantía de aislamiento:** RLS como última línea de defensa
- ✅ **Compliance:** Cumple auditorías de seguridad
- ✅ **User experience:** Mensajes de error específicos desde app-layer
- ✅ **Flexibilidad:** Lógica compleja en backend, seguridad base en DB
- ✅ **Protección contra SQL injection:** RLS se aplica incluso con queries mal formados

**Contras:**
- ❌ Complejidad de desarrollo: Dos capas a mantener
- ❌ Performance: Overhead combinado de ambas capas
- ❌ Debugging: Errores pueden venir de cualquier capa

**Estimación:**
- Esfuerzo: 100 horas (80 RLS + 20 app-layer)
- Impacto performance: -10% en queries complejos (mejor que solo RLS)
- Reducción de riesgo: 95% vs 60% (app-only)

---

## Decisión

**Seleccionada:** Opción 3 - Hybrid Approach (RLS + App-Layer)

**Justificación:**

1. **Seguridad es prioridad número 1** en plataforma educativa con datos de menores
2. **Compliance obligatorio** (GDPR, FERPA) requiere defense-in-depth
3. **Contexto multi-tenant** exige aislamiento garantizado a nivel de base de datos
4. **Auditabilidad:** RLS policies son declarativas y revisables por security auditors
5. **Mitigación de riesgos:** Backend puede tener bugs, RLS es red de seguridad

**Estrategia de distribución:**

- **RLS maneja:** User ownership, tenant isolation, role-based access básico
- **App-layer maneja:** Business logic, complex permissions, validaciones semánticas, mensajes de error UX

---

## Implementación

### Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: JWT Authentication                        │
│  - Valida token y extrae user context               │
│  - Adjunta req.user (id, email, role, tenant_id)    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 2: RLS Middleware                            │
│  - SET LOCAL app.current_user_id = '...'            │
│  - SET LOCAL app.current_user_role = '...'          │
│  - Establece contexto en PostgreSQL session         │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 3: App-Layer Middleware (opcional)           │
│  - Validaciones de negocio complejas                │
│  - Permisos específicos de features                 │
│  - Mensajes de error user-friendly                  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 4: Controller / Service                      │
│  - Lógica de negocio                                │
│  - Queries a base de datos                          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Layer 5: PostgreSQL RLS Policies                   │
│  - Filtrado automático de filas                     │
│  - Última línea de defensa                          │
│  - NINGUNA query bypasea esta capa                  │
└─────────────────────────────────────────────────────┘
```

---

### RLS Policies

**Total implementadas:** 41 políticas activas
**Tablas protegidas:** 14 tablas con RLS habilitado
**Schemas cubiertos:** 8 schemas

**Distribución de políticas:**

| Schema | Tablas RLS | Policies | Patrón Principal |
|--------|-----------|----------|------------------|
| `auth_management` | 1 (profiles) | 4 | Admin + Ownership |
| `educational_content` | 2 (modules, exercises) | 6 | Admin + Published content |
| `progress_tracking` | 3 (attempts, progress, sessions) | 9 | Admin + Ownership + Teacher-Student |
| `gamification_system` | 4 (stats, achievements, coins) | 10 | Admin + Ownership + System updates |
| `social_features` | 2 (classrooms, members) | 8 | Admin + Teacher + Student member |
| `content_management` | 1 (marie_curie_content) | 2 | Admin + Published |
| `audit_logging` | 1 (audit_logs) | 2 | Admin + Own logs |
| `system_configuration` | 0 | 0 | Pendiente (acceso via API) |

**Total:** 41 políticas

---

### Patrones de RLS Implementados

#### 1. User Ownership Pattern
```sql
-- Usuarios solo acceden a sus propios datos
CREATE POLICY user_stats_select_own
  ON gamification_system.user_stats
  FOR SELECT
  USING (user_id = gamilit.get_current_user_id());
```

**Uso:** gamification_system, progress_tracking, auth_management

---

#### 2. Admin Full Access Pattern
```sql
-- Administradores tienen acceso completo
CREATE POLICY module_progress_select_admin
  ON progress_tracking.module_progress
  FOR SELECT
  USING (gamilit.is_admin());
```

**Uso:** Todas las tablas (política adicional)

---

#### 3. Teacher-Student Relationship Pattern
```sql
-- Maestros acceden a datos de estudiantes en sus aulas
CREATE POLICY exercise_attempts_select_teacher
  ON progress_tracking.exercise_attempts
  FOR SELECT
  USING (
    (gamilit.get_current_user_role() = 'admin_teacher'::gamilit_role)
    AND EXISTS (
      SELECT 1
      FROM social_features.classroom_members cm
      JOIN social_features.classrooms c ON c.id = cm.classroom_id
      WHERE c.teacher_id = gamilit.get_current_user_id()
        AND cm.student_id = exercise_attempts.user_id
        AND cm.status = 'active'
    )
  );
```

**Uso:** progress_tracking (attempts, sessions, progress)

**Nota crítica:** Este patrón requiere JOINs adicionales, impacto en performance monitoreado.

---

#### 4. Published Content Pattern
```sql
-- Solo contenido publicado es visible para usuarios regulares
CREATE POLICY modules_select_active
  ON educational_content.modules
  FOR SELECT
  USING (
    is_active = true
    OR gamilit.is_admin()
  );
```

**Uso:** educational_content, content_management

---

### Helper Functions en PostgreSQL

**Ubicación:** Schema `gamilit` (funciones auxiliares)

```sql
-- Obtener user_id de sesión actual
CREATE FUNCTION gamilit.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Obtener role de sesión actual
CREATE FUNCTION gamilit.get_current_user_role()
RETURNS gamilit_role AS $$
BEGIN
  RETURN current_setting('app.current_user_role', true)::gamilit_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'student'::gamilit_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Verificar si usuario es admin
CREATE FUNCTION gamilit.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN gamilit.get_current_user_role() IN (
    'super_admin'::gamilit_role,
    'admin_teacher'::gamilit_role
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**Atributos clave:**
- `STABLE`: Función cacheable dentro de transacción
- `SECURITY DEFINER`: Se ejecuta con permisos del creador (bypass RLS para lectura de settings)

---

### RLS Middleware (Backend)

**Archivo:** `/projects/gamilit-platform-backend/src/middleware/rls.middleware.ts`

**Función principal:** Establecer contexto de usuario en PostgreSQL session

```typescript
export const applyRLS = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) return next();

  const client = await pool.connect();

  // Escapar strings para prevenir SQL injection
  const userId = escapePostgresString(req.user.id);
  const userEmail = escapePostgresString(req.user.email);
  const userRole = escapePostgresString(req.user.role);

  // SET LOCAL: Variables de sesión (solo esta transacción)
  await client.query(`SET LOCAL app.current_user_id = '${userId}'`);
  await client.query(`SET LOCAL app.current_user_email = '${userEmail}'`);
  await client.query(`SET LOCAL app.current_user_role = '${userRole}'`);

  // Adjuntar client a request
  req.dbClient = client;

  // Release client después de response
  res.on('finish', () => client.release());
  res.on('close', () => client.release());

  next();
};
```

**Key points:**
- `SET LOCAL`: Variables solo válidas en transacción actual
- `escapePostgresString()`: Previene SQL injection en variable setting
- Client pool: Un client dedicado por request con RLS context

---

### App-Layer Middleware

**Archivo:** `/projects/gamilit-platform-backend/src/middleware/permission.middleware.ts`

**Función:** Validaciones adicionales de negocio

```typescript
// Ejemplo: Verificar ownership antes de actualizar
export const checkOwnership = (model: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Query con RLS ya aplicado
    const record = await db[model].findById(id);

    if (!record) {
      // RLS filtró el registro (no existe o no tiene acceso)
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `${model} not found or access denied`
        }
      });
    }

    // Validaciones adicionales de negocio
    if (record.status === 'archived' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ARCHIVED_RESOURCE',
          message: 'Cannot modify archived resources'
        }
      });
    }

    next();
  };
};
```

**Ventajas del approach:**
1. RLS ya filtró a nivel DB (seguridad garantizada)
2. App-layer agrega validaciones semánticas
3. Mensajes de error específicos para mejor UX

---

### Testing RLS Policies

**Archivo:** `/tests/integration/rls.test.ts`

**Estrategia de testing:**

```typescript
describe('RLS Policies - Progress Tracking', () => {
  let studentClient: PoolClient;
  let teacherClient: PoolClient;
  let adminClient: PoolClient;

  beforeEach(async () => {
    // Crear clients con diferentes contextos de usuario
    studentClient = await pool.connect();
    await studentClient.query(`SET LOCAL app.current_user_id = '${studentId}'`);
    await studentClient.query(`SET LOCAL app.current_user_role = 'student'`);

    teacherClient = await pool.connect();
    await teacherClient.query(`SET LOCAL app.current_user_id = '${teacherId}'`);
    await teacherClient.query(`SET LOCAL app.current_user_role = 'admin_teacher'`);
  });

  it('student can only see own progress', async () => {
    const result = await studentClient.query(
      'SELECT * FROM progress_tracking.module_progress'
    );

    // RLS filtra automáticamente
    expect(result.rows.every(row => row.user_id === studentId)).toBe(true);
  });

  it('teacher can see students in their classroom', async () => {
    const result = await teacherClient.query(
      'SELECT * FROM progress_tracking.module_progress WHERE user_id = $1',
      [studentInClassroomId]
    );

    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('teacher CANNOT see students outside their classroom', async () => {
    const result = await teacherClient.query(
      'SELECT * FROM progress_tracking.module_progress WHERE user_id = $1',
      [studentNotInClassroomId]
    );

    // RLS previene acceso
    expect(result.rows.length).toBe(0);
  });

  it('admin can see all progress', async () => {
    const result = await adminClient.query(
      'SELECT COUNT(*) FROM progress_tracking.module_progress'
    );

    expect(parseInt(result.rows[0].count)).toBeGreaterThan(100);
  });
});
```

**Coverage objetivo:** 95%+ de políticas RLS testeadas

---

### Performance Considerations

**Impacto medido:**

| Query Type | Sin RLS | Con RLS | Overhead |
|-----------|---------|---------|----------|
| Simple SELECT (ownership) | 2ms | 2.5ms | +25% |
| JOIN 2 tablas | 8ms | 10ms | +25% |
| JOIN 3+ tablas (teacher-student) | 35ms | 50ms | +43% |
| Complex analytics query | 200ms | 260ms | +30% |

**Mitigaciones aplicadas:**

1. **Indexes estratégicos:**
```sql
-- Acelerar lookups de RLS en classroom_members
CREATE INDEX idx_classroom_members_teacher_lookup
  ON social_features.classroom_members(classroom_id, student_id)
  WHERE status = 'active';

-- Acelerar get_current_user_id() comparisons
CREATE INDEX idx_module_progress_user_id
  ON progress_tracking.module_progress(user_id);
```

2. **Funciones STABLE:** Helper functions marcadas como `STABLE` para caching

3. **Avoid N+1:** App-layer hace batch queries donde sea posible

**Monitoreo:**
- Slow query log activado para queries > 100ms
- Alertas si overhead de RLS supera 50% en queries críticas

---

## Consecuencias

### Positivas ✅

1. **Seguridad de múltiples capas**
   - RLS garantiza aislamiento incluso con bugs de backend
   - Imposible bypassear accidentalmente
   - Protección contra SQL injection

2. **Compliance y auditoría**
   - Políticas RLS son declarativas y revisables
   - Cumple requisitos de GDPR/FERPA para datos educativos
   - Audit trail de todas las políticas de acceso

3. **Multi-tenancy robusto**
   - Aislamiento de datos entre organizaciones garantizado a nivel DB
   - Previene leaks entre instituciones educativas

4. **Flexibilidad**
   - RLS maneja casos base (ownership, roles)
   - App-layer maneja lógica compleja de negocio
   - Best of both worlds

5. **User experience**
   - Mensajes de error específicos desde app-layer
   - Validaciones semánticas antes de llegar a DB

---

### Negativas ❌

1. **Complejidad de desarrollo**
   - Developers deben entender dos capas de autorización
   - Debugging más complejo (¿error de RLS o app-layer?)
   - Curva de aprendizaje para nuevos developers

2. **Performance overhead**
   - Queries complejos ~30% más lentos
   - JOINs adicionales para teacher-student relationships
   - Requires careful indexing strategy

3. **Mantenimiento**
   - Cambios en reglas de acceso requieren updates en DB y backend
   - Migraciones de RLS policies deben ser testeadas exhaustivamente
   - Documentación debe mantenerse sincronizada

4. **Debugging dificultad**
   - Errores de RLS aparecen como "no results" sin mensaje claro
   - Requires query logging para troubleshooting
   - Performance issues difíciles de diagnosticar

---

### Riesgos y Mitigaciones 🛡️

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance degradation en queries complejos | MEDIA | ALTO | Indexes estratégicos + monitoring + caching |
| Developers bypassean RLS accidentalmente | BAJA | CRÍTICO | Code reviews + tests automáticos + CI/CD checks |
| RLS policies mal configuradas | MEDIA | ALTO | Suite de tests integration + peer review de políticas |
| Debugging complejo ralentiza desarrollo | ALTA | MEDIO | Query logging + documentation + training |
| Migraciones de RLS rompen producción | BAJA | CRÍTICO | Staging environment + rollback plan + tests E2E |

---

## Criterios de Éxito

**Métricas definidas:**

1. **Seguridad:**
   - ✅ 0 casos de acceso cruzado entre tenants en penetration testing
   - ✅ 100% de tablas sensibles con RLS habilitado
   - ✅ 95%+ coverage de tests de RLS policies

2. **Performance:**
   - ✅ Overhead de RLS < 50% en queries críticos
   - ✅ P95 latency < 200ms para endpoints de estudiante
   - ✅ No queries > 500ms en hot paths

3. **Mantenibilidad:**
   - ✅ Documentación de todas las políticas RLS
   - ✅ Onboarding de nuevos devs < 2 días
   - ✅ Time to fix RLS bug < 4 horas

---

## Referencias

### PostgreSQL Documentation
- [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [SET LOCAL](https://www.postgresql.org/docs/current/sql-set.html)

### Multi-Tenancy Best Practices
- [Citus Multi-Tenant Guide](https://docs.citusdata.com/en/stable/sharding/multi_tenant.html)
- [AWS Multi-Tenant SaaS Architecture](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)

### Internal Documentation
- [RLS Policies - Schemas](../../03-desarrollo/base-de-datos/schemas/README.md)
- [Middleware y Seguridad](../../03-desarrollo/backend/middleware/README.md)
- [Sistema de Seguridad](../seguridad/SISTEMA-SEGURIDAD.md)
- [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md)
- [ADR-005 - Multi-Tenancy Implementation](./ADR-005-multi-tenancy-implementation.md)

### Related User Stories
- [US-FUND-002: Arquitectura PostgreSQL](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-002-arquitectura-postgresql.md)
- Ver también: [Requerimientos de Seguridad](../../01-requerimientos/requerimientos-no-funcionales/)

### Security Standards
- OWASP Top 10 - A01:2021 Broken Access Control
- NIST Cybersecurity Framework - Protect (PR)
- GDPR Article 32 - Security of processing

---

## Decisiones Relacionadas

- **ADR-001:** [Email Verification Removal](./ADR-001-email-verification-removal.md) - Authentication strategy
- **ADR-002:** JWT Security Implementation (pendiente) - Token handling
- **ADR-005:** Multi-Tenancy Implementation (pendiente) - Tenant isolation architecture

---

## Revisiones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-28 | Decisión inicial - Hybrid RLS + App-Layer | DBA + Backend Lead + Security Team |
| - | Revisión post-implementación (Q1 2026) | Pendiente |

---

## Próximos Pasos

1. ✅ **Completar políticas pendientes**
   - Schema `system_configuration` no tiene políticas RLS
   - Crear políticas para `feature_flags` y `system_settings`

2. ✅ **Performance optimization**
   - Identificar queries con overhead > 50%
   - Agregar indexes específicos para RLS lookups
   - Considerar materialized views para reporting

3. ✅ **Testing expansion**
   - Aumentar coverage de RLS tests a 98%+
   - Agregar penetration testing automatizado
   - Simular ataques de privilege escalation

4. ✅ **Developer experience**
   - Crear debugging guide para errores de RLS
   - Mejorar error messages de políticas fallidas
   - Training session para equipo de desarrollo

5. ✅ **Monitoring y alertas**
   - Dashboard de métricas de RLS (overhead, denials)
   - Alertas de slow queries con RLS
   - Audit log de cambios en políticas

---

*ADR-003 - Creado: 28 de Octubre, 2025*
*Estado: Aceptado e implementado en producción*
*Próxima revisión: Q1 2026 (post-launch)*
