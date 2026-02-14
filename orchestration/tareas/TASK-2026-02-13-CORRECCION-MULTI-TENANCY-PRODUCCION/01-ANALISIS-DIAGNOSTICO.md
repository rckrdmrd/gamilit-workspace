# ANALISIS DIAGNOSTICO: Correccion Multi-Tenancy en Produccion

**Tarea:** TASK-2026-02-13-CORRECCION-MULTI-TENANCY-PRODUCCION
**Fecha:** 2026-02-13
**Prioridad:** P0 (Produccion Activa)
**Estado:** ANALISIS COMPLETO

---

## 1. PROBLEMA IDENTIFICADO

El portal de administracion muestra **multiples instituciones/organizaciones** con nombres de usuarios. Esto es erroneo. El diseno del sistema establece:

- **1 sola institucion** (GAMILIT - Institucion General)
- **1 solo salon/aula** (GAMILIT - Aula General)
- **1 solo maestro default**
- **Todos los usuarios asignados** a estos valores default

### Sintoma Visible
- Admin Portal > Instituciones: Lista multiples organizaciones cuyos nombres coinciden con nombres de los primeros usuarios registrados en produccion.

### Hipotesis de Causa Raiz
1. **H1 (Mas probable):** Durante el despliegue inicial a produccion, los seeds de tenants no se ejecutaron correctamente (o se usaron seeds antiguos que creaban un tenant por usuario).
2. **H2:** El endpoint `POST /admin/organizations` fue usado accidentalmente para crear organizaciones de prueba con nombres de usuarios.
3. **H3:** Existio una version anterior del `auth.service.ts` que creaba un tenant nuevo por cada registro.

**Evidencia del codigo actual (auth.service.ts:113-125):**
```typescript
// El codigo ACTUAL busca tenant existente, NO crea uno nuevo
let mainTenant = await this.tenantRepository.findOne({
  where: { slug: 'gamilit-platform', is_active: true },
});
// Fallback: buscar primer tenant activo
if (!mainTenant) {
  mainTenant = await this.tenantRepository.findOne({
    where: { is_active: true },
    order: { created_at: 'ASC' },
  });
}
```

> El flujo de registro actual NO crea tenants nuevos. Los tenants espurios ya existian en la BD de produccion antes del fix de seeds.

---

## 2. ARQUITECTURA DE DEPENDENCIAS

### 2.1 Modelo Relacional (Jerarquia)

```
auth_management.tenants (ROOT - tabla padre)
├── auth_management.profiles (tenant_id FK, ON DELETE CASCADE)
│   ├── auth_management.user_roles (user_id + tenant_id)
│   ├── auth_management.memberships (user_id + tenant_id)
│   ├── auth_management.user_sessions (user_id + tenant_id)
│   ├── gamification_system.user_stats (user_id)
│   ├── gamification_system.user_ranks (user_id)
│   ├── gamification_system.user_achievements (user_id)
│   ├── progress_tracking.learning_sessions (user_id)
│   ├── progress_tracking.certificates (user_id)
│   └── ... (77 FKs apuntan a profiles)
├── social_features.schools (tenant_id FK, ON DELETE CASCADE)
│   └── social_features.classrooms (school_id FK, ON DELETE CASCADE)
│       ├── social_features.classroom_members (classroom_id FK)
│       ├── social_features.teacher_classrooms (classroom_id FK)
│       └── social_features.assignment_classrooms (classroom_id FK)
├── gamification_system.achievements (tenant_id FK, ON DELETE CASCADE)
├── gamification_system.shop_items (tenant_id FK, ON DELETE CASCADE)
├── gamification_system.shop_categories (tenant_id)
├── content_management.content_templates (tenant_id FK, ON DELETE CASCADE)
├── educational_content.modules (tenant_id FK, ON DELETE CASCADE)
├── system_configuration.system_settings (tenant_id FK, ON DELETE CASCADE)
├── system_configuration.tenant_configurations (tenant_id FK, ON DELETE CASCADE)
├── audit_logging.audit_logs (tenant_id FK, ON DELETE CASCADE)
├── admin_dashboard.admin_reports (tenant_id FK, ON DELETE CASCADE)
├── lti_integration.lti_consumers (tenant_id FK, ON DELETE CASCADE)
└── ... (50+ tablas en total)
```

### 2.2 Tablas Criticas con tenant_id (por schema)

| Schema | Tablas con tenant_id | FK Behavior |
|--------|---------------------|-------------|
| **auth_management** | profiles, user_roles, memberships, user_sessions | CASCADE |
| **gamification_system** | user_stats, user_ranks, achievements, ml_coins_transactions, shop_items, user_purchases, shop_categories, maya_ranks | CASCADE (excepto ml_coins: SET NULL) |
| **social_features** | schools, classrooms, teams, teacher_classrooms, teacher_reports, scheduled_reports, shared_reports | CASCADE |
| **progress_tracking** | learning_sessions, certificates, student_intervention_alerts, teacher_alert_configurations, teacher_interventions | CASCADE |
| **system_configuration** | system_settings, gamification_parameters, notification_settings, tenant_configurations | CASCADE |
| **audit_logging** | audit_logs, performance_metrics, system_alerts, system_logs, user_activity_logs | CASCADE |
| **content_management** | content_templates, marie_curie_content, media_files, content_versions | CASCADE |
| **educational_content** | modules, media_resources, teacher_content | CASCADE |
| **admin_dashboard** | admin_reports | CASCADE |
| **notifications** | rate_limit_logs | sin FK |
| **lti_integration** | lti_consumers | CASCADE |
| **data_warehouse** | ml_prediction_logs | sin FK |
| **TOTAL** | **50+ tablas** | **90% CASCADE** |

### 2.3 Riesgo de CASCADE DELETE

> **PELIGRO:** Si se elimina un tenant con `DELETE`, el CASCADE eliminara TODOS los datos asociados en 50+ tablas, incluyendo perfiles, progreso, gamificacion, certificados, etc.

**Estrategia segura:** NO eliminar tenants con datos. Primero MIGRAR datos al tenant correcto, luego eliminar tenants vacios.

---

## 3. OBJETOS DEFAULT ESPERADOS

### 3.1 Tenant Principal (Seed: `01-tenants.sql`)
| Campo | Valor Esperado |
|-------|----------------|
| id | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| name | `GAMILIT Platform` |
| slug | `gamilit-platform` |
| subscription_tier | `enterprise` |
| max_users | `10000` |
| is_active | `true` |
| metadata.is_default | `true` |
| metadata.is_primary | `true` |

### 3.2 Institucion Default (Seed: `00-schools-default.sql`)
| Campo | Valor Esperado |
|-------|----------------|
| id | `99999999-9999-9999-9999-999999999999` |
| name | `GAMILIT - Institucion General` |
| code | `GAMILIT-DEFAULT` |
| tenant_id | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| settings.is_system | `true` |
| settings.is_default | `true` |
| is_verified | `true` |

### 3.3 Aula Default (Seed: `02-classrooms.sql`)
| Campo | Valor Esperado |
|-------|----------------|
| id | `a0000000-0000-4000-a000-000000000001` |
| name | `GAMILIT - Aula General` |
| code | `DEFAULT` |
| school_id | `99999999-9999-9999-9999-999999999999` |
| teacher_id | UUID del maestro default |
| capacity | `999` |
| metadata.is_default | `true` |
| metadata.system_classroom | `true` |

### 3.4 Maestro Default
| Campo | Valor Esperado |
|-------|----------------|
| email | `teacher@gamilit.com` |
| role | `admin_teacher` |
| tenant_id | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |

---

## 4. QUERIES DIAGNOSTICOS PARA PRODUCCION

Ejecutar estos queries en la BD de produccion para determinar el estado actual:

### 4.1 Listar TODOS los tenants
```sql
-- Q1: Ver todos los tenants existentes
SELECT
  id,
  name,
  slug,
  subscription_tier,
  is_active,
  max_users,
  metadata->>'is_default' AS is_default,
  metadata->>'is_primary' AS is_primary,
  created_at,
  deleted_at
FROM auth_management.tenants
ORDER BY created_at ASC;
```

### 4.2 Contar perfiles por tenant
```sql
-- Q2: Cuantos perfiles tiene cada tenant
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  t.slug,
  COUNT(p.id) AS total_profiles,
  SUM(CASE WHEN p.role = 'student' THEN 1 ELSE 0 END) AS students,
  SUM(CASE WHEN p.role = 'admin_teacher' THEN 1 ELSE 0 END) AS teachers,
  SUM(CASE WHEN p.role = 'super_admin' THEN 1 ELSE 0 END) AS admins
FROM auth_management.tenants t
LEFT JOIN auth_management.profiles p ON p.tenant_id = t.id AND p.deleted_at IS NULL
GROUP BY t.id, t.name, t.slug
ORDER BY total_profiles DESC;
```

### 4.3 Listar schools existentes
```sql
-- Q3: Ver todas las escuelas/instituciones
SELECT
  s.id,
  s.name,
  s.code,
  s.tenant_id,
  t.name AS tenant_name,
  s.is_active,
  s.is_verified,
  s.current_students_count,
  s.current_teachers_count,
  s.settings->>'is_system' AS is_system,
  s.settings->>'is_default' AS is_default,
  s.created_at
FROM social_features.schools s
JOIN auth_management.tenants t ON t.id = s.tenant_id
ORDER BY s.created_at ASC;
```

### 4.4 Listar classrooms existentes
```sql
-- Q4: Ver todas las aulas
SELECT
  c.id,
  c.name,
  c.code,
  c.school_id,
  s.name AS school_name,
  c.tenant_id,
  c.teacher_id,
  p.email AS teacher_email,
  c.capacity,
  c.current_students_count,
  c.is_active,
  c.metadata->>'is_default' AS is_default,
  c.created_at
FROM social_features.classrooms c
LEFT JOIN social_features.schools s ON s.id = c.school_id
LEFT JOIN auth_management.profiles p ON p.id = c.teacher_id
ORDER BY c.created_at ASC;
```

### 4.5 Verificar asignaciones de alumnos
```sql
-- Q5: Cuantos alumnos tiene cada classroom
SELECT
  c.id AS classroom_id,
  c.name AS classroom_name,
  c.code,
  COUNT(cm.id) AS enrolled_students,
  SUM(CASE WHEN cm.status = 'active' THEN 1 ELSE 0 END) AS active_students,
  c.current_students_count AS reported_count
FROM social_features.classrooms c
LEFT JOIN social_features.classroom_members cm ON cm.classroom_id = c.id
GROUP BY c.id, c.name, c.code, c.current_students_count
ORDER BY enrolled_students DESC;
```

### 4.6 Usuarios sin asignacion a classroom
```sql
-- Q6: Estudiantes sin classroom asignado
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.tenant_id,
  t.name AS tenant_name,
  p.school_id,
  p.created_at
FROM auth_management.profiles p
JOIN auth_management.tenants t ON t.id = p.tenant_id
LEFT JOIN social_features.classroom_members cm ON cm.student_id = p.id AND cm.status = 'active'
WHERE p.role = 'student'
  AND p.deleted_at IS NULL
  AND cm.id IS NULL
ORDER BY p.created_at ASC;
```

### 4.7 Datos gamificacion por tenant
```sql
-- Q7: Verificar si hay datos de gamificacion en tenants espurios
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  COUNT(DISTINCT us.user_id) AS users_with_stats,
  SUM(us.total_xp) AS total_xp_in_tenant,
  SUM(us.exercises_completed) AS total_exercises,
  COUNT(DISTINCT ua.user_id) AS users_with_achievements
FROM auth_management.tenants t
LEFT JOIN auth_management.profiles p ON p.tenant_id = t.id AND p.deleted_at IS NULL
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.id
LEFT JOIN gamification_system.user_achievements ua ON ua.user_id = p.id AND ua.is_completed = true
GROUP BY t.id, t.name
ORDER BY total_xp_in_tenant DESC NULLS LAST;
```

### 4.8 Sesiones activas por tenant
```sql
-- Q8: Sesiones activas en cada tenant
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  COUNT(s.id) AS active_sessions,
  MAX(s.last_activity_at) AS last_activity
FROM auth_management.tenants t
LEFT JOIN auth_management.user_sessions s ON s.tenant_id = t.id AND s.is_active = true
GROUP BY t.id, t.name
HAVING COUNT(s.id) > 0
ORDER BY active_sessions DESC;
```

---

## 5. RESULTADO ESPERADO DEL DIAGNOSTICO

Despues de ejecutar Q1-Q8, se espera encontrar:

| Aspecto | Estado Probable |
|---------|----------------|
| Tenants espurios | 3-10 tenants con nombres de usuarios |
| Perfiles en tenants espurios | 1-2 por tenant (los primeros usuarios) |
| Perfiles en tenant principal | Mayoria de usuarios |
| Schools espurias | 0 (schools se crean por admin) |
| Classrooms espurios | 0 (classrooms requieren school_id) |
| Datos gamificacion en tenants espurios | Posiblemente si (XP, logros) |

---

## 6. CLASIFICACION DE IMPACTO

| Objeto | Cantidad Afectada | Riesgo | Accion |
|--------|-------------------|--------|--------|
| Tenants espurios | ~3-10 | ALTO | Migrar datos, eliminar |
| Profiles en tenant incorrecto | ~5-20 | ALTO | Migrar a tenant principal |
| Memberships huerfanas | ~5-20 | MEDIO | Recrear en tenant principal |
| User_roles en tenant incorrecto | ~5-20 | MEDIO | Migrar |
| Sessions en tenant incorrecto | ~0-5 | BAJO | Eliminaran al expirar |
| Gamification data | ~5-20 | ALTO | NO mover (vinculada a user_id, no tenant) |
| Schools | 0-1 | BAJO | Verificar default |
| Classrooms | 0-1 | BAJO | Verificar default |
| Classroom_members | ~0-N | ALTO | Inscribir todos los alumnos al aula default |

---

*Continua en: 02-PLAN-CORRECCION-FASES.md*
