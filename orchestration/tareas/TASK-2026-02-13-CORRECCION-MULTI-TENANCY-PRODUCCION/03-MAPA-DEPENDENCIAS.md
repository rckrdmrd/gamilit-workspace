# MAPA DE DEPENDENCIAS: Objetos Afectados por Correccion Multi-Tenancy

**Tarea:** TASK-2026-02-13-CORRECCION-MULTI-TENANCY-PRODUCCION
**Fecha:** 2026-02-13

---

## 1. GRAFO DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    auth_management.tenants                          │
│                    (ROOT - 1 tenant principal)                      │
│                    ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11        │
└─────────────┬───────────────────────────────────┬───────────────────┘
              │ ON DELETE CASCADE (50+ tablas)     │
              ▼                                    ▼
┌─────────────────────────┐         ┌──────────────────────────────┐
│ auth_management.profiles│         │ social_features.schools       │
│ (TODOS los usuarios)    │         │ (1 school: GAMILIT-DEFAULT)   │
│ tenant_id FK            │         │ tenant_id FK                  │
│ school_id FK ──────────────────────> (school.id)                  │
└──────────┬──────────────┘         └──────────────┬───────────────┘
           │                                       │
    ┌──────┴──────────────────┐                    ▼
    │ 77 FKs apuntan a       │     ┌──────────────────────────────┐
    │ profiles.id             │     │ social_features.classrooms    │
    ▼                         │     │ (1 classroom: DEFAULT)        │
┌──────────────┐              │     │ school_id FK, teacher_id FK   │
│ memberships  │              │     │ tenant_id FK                  │
│ user_roles   │              │     └──────────────┬───────────────┘
│ user_sessions│              │                    │
│ user_stats   │              │         ┌──────────┴──────────┐
│ user_ranks   │              │         ▼                     ▼
│ user_achiev. │              │  ┌──────────────┐  ┌────────────────┐
│ learning_ses │              │  │ classroom_   │  │ teacher_       │
│ certificates │              │  │ members      │  │ classrooms     │
│ ...          │              │  │ (inscripcio- │  │ (maestro-aula) │
└──────────────┘              │  │ nes alumnos) │  └────────────────┘
                              │  └──────────────┘
                              │
                              │  ┌──────────────────────────────┐
                              ├─>│ gamification_system.*          │
                              │  │ user_stats, user_ranks,       │
                              │  │ achievements, ml_coins,       │
                              │  │ shop_items, user_purchases    │
                              │  └──────────────────────────────┘
                              │
                              │  ┌──────────────────────────────┐
                              ├─>│ progress_tracking.*            │
                              │  │ learning_sessions, certificates│
                              │  │ interventions, alerts          │
                              │  └──────────────────────────────┘
                              │
                              │  ┌──────────────────────────────┐
                              ├─>│ content_management.*           │
                              │  │ content_templates, media_files │
                              │  │ content_versions               │
                              │  └──────────────────────────────┘
                              │
                              │  ┌──────────────────────────────┐
                              └─>│ audit_logging.*                │
                                 │ audit_logs, system_logs,       │
                                 │ performance_metrics            │
                                 └──────────────────────────────┘
```

---

## 2. TABLAS POR FASE DE CORRECCION

### Fase 2: Tablas que requieren UPDATE de tenant_id

| # | Schema | Tabla | tenant_id nullable | FK Behavior | Notas |
|---|--------|-------|-------------------|-------------|-------|
| 1 | auth_management | profiles | NOT NULL | CASCADE | Tabla mas critica |
| 2 | auth_management | user_roles | NOT NULL | CASCADE | UNIQUE(user_id,tenant_id,role) |
| 3 | auth_management | memberships | NOT NULL | CASCADE | UNIQUE(user_id,tenant_id) |
| 4 | auth_management | user_sessions | uuid | CASCADE | Sesiones activas |
| 5 | gamification_system | user_stats | uuid | CASCADE | XP, coins |
| 6 | gamification_system | user_ranks | uuid | CASCADE | Rangos maya |
| 7 | gamification_system | achievements | uuid | CASCADE | Logros del sistema |
| 8 | gamification_system | ml_coins_transactions | uuid | SET NULL | Transacciones |
| 9 | gamification_system | shop_items | uuid | CASCADE | Items tienda |
| 10 | gamification_system | shop_categories | column | N/A | Sin FK formal |
| 11 | gamification_system | user_purchases | uuid | CASCADE | Compras |
| 12 | social_features | schools | NOT NULL | CASCADE | Instituciones |
| 13 | social_features | classrooms | NOT NULL | CASCADE | Aulas |
| 14 | social_features | teams | NOT NULL | CASCADE | Equipos |
| 15 | social_features | teacher_classrooms | NOT NULL | CASCADE | Maestro-aula |
| 16 | social_features | teacher_reports | NOT NULL | CASCADE | Reportes |
| 17 | social_features | scheduled_reports | NOT NULL | CASCADE | Reportes prog |
| 18 | social_features | shared_reports | NOT NULL | CASCADE | Reportes comp |
| 19 | progress_tracking | learning_sessions | uuid | CASCADE | Sesiones aprend |
| 20 | progress_tracking | certificates | uuid | CASCADE | Certificados |
| 21 | progress_tracking | student_intervention_alerts | NOT NULL | CASCADE | Alertas |
| 22 | progress_tracking | teacher_alert_configurations | NOT NULL | CASCADE | Config alertas |
| 23 | progress_tracking | teacher_interventions | NOT NULL | CASCADE | Intervenciones |
| 24 | system_configuration | system_settings | uuid | CASCADE | Config sistema |
| 25 | system_configuration | tenant_configurations | NOT NULL | CASCADE | Config tenant |
| 26 | system_configuration | notification_settings | uuid | CASCADE | Config notif |
| 27 | audit_logging | audit_logs | uuid | CASCADE | Logs auditoria |
| 28 | audit_logging | user_activity_logs | uuid | CASCADE | Logs actividad |
| 29 | audit_logging | performance_metrics | uuid | CASCADE | Metricas |
| 30 | audit_logging | system_alerts | uuid | CASCADE | Alertas sistema |
| 31 | audit_logging | system_logs | uuid | CASCADE | Logs sistema |
| 32 | content_management | content_templates | uuid | CASCADE | Templates |
| 33 | content_management | marie_curie_content | uuid | CASCADE | Contenido MC |
| 34 | content_management | media_files | uuid | CASCADE | Archivos media |
| 35 | content_management | content_versions | uuid | CASCADE | Versiones |
| 36 | educational_content | modules | uuid | CASCADE | Modulos educ |
| 37 | educational_content | media_resources | uuid | CASCADE | Recursos media |
| 38 | educational_content | teacher_content | uuid | CASCADE | Contenido prof |
| 39 | admin_dashboard | admin_reports | NOT NULL | CASCADE | Reportes admin |
| 40 | lti_integration | lti_consumers | uuid | CASCADE | LTI |
| 41 | notifications | rate_limit_logs | uuid | sin FK | Rate limits |
| 42 | data_warehouse | ml_prediction_logs | uuid | sin FK | ML predicciones |

### Fase 3: Tablas que requieren INSERT o UPDATE de asignacion

| # | Tabla | Operacion | Detalles |
|---|-------|-----------|----------|
| 1 | social_features.schools | UPSERT | Verificar/crear school default |
| 2 | auth_management.profiles | UPDATE | Asignar school_id a todos |
| 3 | social_features.classrooms | UPSERT | Verificar/crear classroom default |
| 4 | social_features.classroom_members | INSERT | Inscribir todos los alumnos |
| 5 | social_features.teacher_classrooms | UPSERT | Asignar maestro al aula |

### Fase 4: Tablas que requieren DELETE

| # | Tabla | Operacion | Condicion |
|---|-------|-----------|-----------|
| 1 | auth_management.tenants | SOFT DELETE | slug != 'gamilit-platform' |

### Fase 5: Archivos de codigo a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `admin/controllers/admin-organizations.controller.ts` | Agregar @Roles('super_admin') a POST |
| 2 | `admin/services/admin-organizations.service.ts` | Validar role en createOrganization |
| 3 | `frontend/apps/admin/pages/AdminInstitutionsPage.tsx` | Ocultar boton crear para no-super_admin |

---

## 3. TRIGGERS QUE SE ACTIVARAN AUTOMATICAMENTE

| Trigger | Tabla | Evento | Efecto |
|---------|-------|--------|--------|
| trg_update_classroom_count | classroom_members | INSERT/UPDATE/DELETE | Actualiza classrooms.current_students_count |
| trg_sync_teacher_classroom | classrooms | INSERT | Crea teacher_classrooms con role='owner' |
| trg_tenants_updated_at | tenants | UPDATE | Actualiza updated_at |
| trg_profiles_updated_at | profiles | UPDATE | Actualiza updated_at |

---

## 4. INDICES INVOLUCRADOS

Los siguientes indices seran utilizados durante las operaciones de migracion:

| Indice | Tabla | Columnas | Uso |
|--------|-------|----------|-----|
| idx_profiles_tenant_id | profiles | tenant_id | Buscar perfiles por tenant |
| idx_profiles_tenant_role_status | profiles | tenant_id, role, status | Filtrar alumnos |
| idx_memberships_tenant_id | memberships | tenant_id | Migrar memberships |
| idx_user_roles_tenant_id | user_roles | tenant_id | Migrar roles |
| idx_classrooms_code | classrooms | code | Buscar classroom DEFAULT |
| idx_schools_code | schools | code | Buscar school GAMILIT-DEFAULT |
| idx_classroom_members_classroom | classroom_members | classroom_id | Inscripciones |
| idx_classroom_members_student | classroom_members | student_id | Evitar duplicados |

---

## 5. ENDPOINTS API AFECTADOS

| Endpoint | Metodo | Archivo | Impacto |
|----------|--------|---------|---------|
| /admin/organizations | GET | admin-organizations.controller.ts | Mostrara 1 org |
| /admin/organizations | POST | admin-organizations.controller.ts | Restringir a super_admin |
| /admin/organizations/:id | GET | admin-organizations.controller.ts | Sin cambio |
| /admin/organizations/:id | PUT | admin-organizations.controller.ts | Sin cambio |
| /admin/organizations/:id | DELETE | admin-organizations.controller.ts | Sin cambio |
| /auth/register | POST | auth.controller.ts | Sin cambio (ya correcto) |
| /teacher/classrooms | GET | teacher-classrooms.controller.ts | Mostrara 1 aula |

---

*Este mapa debe ser verificado contra el estado real de produccion en F0.*
