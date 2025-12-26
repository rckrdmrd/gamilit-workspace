# TABLAS NUEVAS - DICIEMBRE 2025

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Auditoria:** Comparacion inventario vs DDL

---

## RESUMEN

| Schema | Tablas Nuevas | Epic |
|--------|---------------|------|
| auth_management | 4 | EXT-010/EXT-011 |
| gamification_system | 1 | Shop System |
| progress_tracking | 1 | Teacher Portal |
| **TOTAL** | **6** | - |

> **Nota:** El analisis inicial identifico 9 tablas, pero la verificacion DDL encontro 6 tablas con archivos DDL completos.

---

## 1. SCHEMA: auth_management

### 1.1 parent_accounts

**Archivo DDL:** `ddl/schemas/auth_management/tables/14-parent_accounts.sql`
**Epic:** EXT-010 (Parent Notifications)
**Creado:** 2025-11-08

**Proposito:** Cuentas de padres/tutores con configuraciones especificas del portal.

**Columnas principales:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| profile_id | UUID | FK a profiles (1:1) |
| relationship_type | TEXT | mother, father, guardian, tutor, other |
| notification_frequency | TEXT | realtime, daily, weekly, monthly, on_demand |
| alert_on_low_performance | BOOLEAN | Alerta si bajo rendimiento |
| alert_on_inactivity_days | INTEGER | Dias para alerta de inactividad |
| alert_on_achievement_unlocked | BOOLEAN | Alerta en logros |
| alert_on_rank_promotion | BOOLEAN | Alerta en promocion |
| preferred_report_format | TEXT | email, in_app, both |
| can_view_detailed_progress | BOOLEAN | Permiso ver progreso detallado |
| is_verified | BOOLEAN | Verificado por escuela |
| dashboard_widgets | JSONB | Widgets del dashboard |

**Indices:**
- `idx_parent_accounts_profile`
- `idx_parent_accounts_active`
- `idx_parent_accounts_verified`
- `idx_parent_accounts_notification_freq`
- `idx_parent_accounts_widgets` (GIN)

**Trigger:** `trg_parent_accounts_updated_at`

---

### 1.2 parent_student_links

**Archivo DDL:** `ddl/schemas/auth_management/tables/15-parent_student_links.sql`
**Epic:** EXT-010 (Parent Notifications)
**Creado:** 2025-11-08

**Proposito:** Vinculacion N:M entre padres/tutores y estudiantes con permisos y verificacion.

**Columnas principales:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| parent_account_id | UUID | FK a parent_accounts |
| student_id | UUID | FK a profiles |
| relationship_type | TEXT | mother, father, guardian, etc. |
| can_view_progress | BOOLEAN | Permiso ver progreso |
| can_view_grades | BOOLEAN | Permiso ver calificaciones |
| can_receive_notifications | BOOLEAN | Recibir notificaciones |
| can_contact_teachers | BOOLEAN | Contactar maestros |
| link_status | TEXT | pending, active, suspended, revoked |
| is_verified | BOOLEAN | Verificado |
| verification_code | TEXT | Codigo para auto-link |
| student_approval_required | BOOLEAN | Requiere aprobacion estudiante |

**Constraint:** `unique_parent_student` (parent_account_id, student_id)

**Indices:**
- `idx_parent_student_links_parent`
- `idx_parent_student_links_student`
- `idx_parent_student_links_status`
- `idx_parent_student_links_active`
- `idx_parent_student_links_verification_code`

---

### 1.3 parent_notifications

**Archivo DDL:** `ddl/schemas/auth_management/tables/16-parent_notifications.sql`
**Epic:** EXT-010 (Parent Notifications)
**Creado:** 2025-11-08

**Proposito:** Notificaciones especificas para padres sobre progreso de hijos.

**Columnas principales:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| parent_account_id | UUID | FK a parent_accounts |
| student_id | UUID | FK a profiles |
| notification_type | TEXT | daily_summary, weekly_report, achievement_unlocked, etc. |
| title | TEXT | Titulo |
| message | TEXT | Mensaje |
| student_snapshot | JSONB | Snapshot del estado del estudiante |
| priority | TEXT | low, normal, high, urgent |
| sent_via_email | BOOLEAN | Enviado por email |
| sent_via_in_app | BOOLEAN | Enviado in-app |
| status | TEXT | pending, sent, read, archived |
| scheduled_for | TIMESTAMPTZ | Envio programado |

**Tipos de notificacion:**
- daily_summary
- weekly_report
- monthly_report
- low_performance
- inactivity_alert
- achievement_unlocked
- rank_promotion
- assignment_due
- assignment_submitted
- recommendation
- custom

**Indices:**
- `idx_parent_notifications_parent`
- `idx_parent_notifications_student`
- `idx_parent_notifications_type`
- `idx_parent_notifications_status`
- `idx_parent_notifications_unread`
- `idx_parent_notifications_scheduled`

---

## 2. SCHEMA: gamification_system

### 2.1 user_purchases

**Archivo DDL:** `ddl/schemas/gamification_system/tables/19-user_purchases.sql`
**Version:** 1.0 (2025-11-29)

**Proposito:** Historial de compras de usuarios en la tienda virtual.

**Columnas principales:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK a profiles |
| item_id | UUID | FK a shop_items |
| tenant_id | UUID | FK a tenants |
| quantity | INTEGER | Cantidad (default 1) |
| price_paid | INTEGER | Precio en ML Coins |
| discount_applied | INTEGER | Descuento aplicado |
| transaction_id | UUID | FK a ml_coins_transactions |
| status | TEXT | pending, completed, refunded, expired |
| expires_at | TIMESTAMPTZ | Expiracion (items temporales) |
| consumed_at | TIMESTAMPTZ | Fecha de consumo |
| is_active | BOOLEAN | Item activo |
| purchased_at | TIMESTAMPTZ | Fecha de compra |

**Estados:**
- pending: Compra pendiente
- completed: Compra completada
- refunded: Reembolsada
- expired: Item expirado

**Indices:**
- `idx_user_purchases_user`
- `idx_user_purchases_item`
- `idx_user_purchases_status`
- `idx_user_purchases_active`
- `idx_user_purchases_user_item`
- `idx_user_purchases_date`
- `idx_user_purchases_unique_item` (UNIQUE para items unicos activos)

---

## 3. SCHEMA: progress_tracking

### 3.1 teacher_interventions

**Archivo DDL:** `ddl/schemas/progress_tracking/tables/17-teacher_interventions.sql`
**Priority:** P2-04 (Teacher Portal)
**Creado:** 2025-12-18

**Proposito:** Registra acciones/intervenciones del maestro en respuesta a alertas de estudiantes.

**Columnas principales:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| alert_id | UUID | FK a student_intervention_alerts (opcional) |
| student_id | UUID | FK a profiles |
| teacher_id | UUID | FK a profiles |
| classroom_id | UUID | FK a classrooms |
| intervention_type | TEXT | Tipo de intervencion |
| title | TEXT | Titulo |
| description | TEXT | Descripcion |
| action_taken | TEXT | Accion tomada |
| outcome | TEXT | Resultado |
| scheduled_date | TIMESTAMPTZ | Fecha programada |
| completed_date | TIMESTAMPTZ | Fecha completada |
| status | TEXT | planned, in_progress, completed, cancelled, rescheduled |
| priority | TEXT | low, medium, high, urgent |
| follow_up_required | BOOLEAN | Requiere seguimiento |
| parent_contacted | BOOLEAN | Padre contactado |
| effectiveness_rating | INTEGER | Rating 1-5 |
| tenant_id | UUID | FK a tenants |

**Tipos de intervencion:**
- one_on_one_session
- parent_contact
- resource_assignment
- peer_tutoring
- accommodation
- referral
- behavior_plan
- progress_check
- encouragement
- schedule_adjustment
- other

**RLS Policies:**
- `teacher_manage_own_interventions`
- `teacher_view_classroom_interventions`
- `admin_view_tenant_interventions`

**Indices:**
- `idx_teacher_interventions_alert`
- `idx_teacher_interventions_student`
- `idx_teacher_interventions_teacher`
- `idx_teacher_interventions_classroom`
- `idx_teacher_interventions_status`
- `idx_teacher_interventions_type`
- `idx_teacher_interventions_tenant`
- `idx_teacher_interventions_scheduled`
- `idx_teacher_interventions_follow_up`

---

## RELACIONES

```
auth_management.parent_accounts
    └──> auth_management.profiles (profile_id) 1:1
    └──< auth_management.parent_student_links (parent_account_id) 1:N
    └──< auth_management.parent_notifications (parent_account_id) 1:N

auth_management.parent_student_links
    └──> auth_management.profiles (student_id) N:1
    └──> auth_management.profiles (verified_by) N:1

gamification_system.user_purchases
    └──> auth_management.profiles (user_id) N:1
    └──> gamification_system.shop_items (item_id) N:1
    └──> gamification_system.ml_coins_transactions (transaction_id) N:1

progress_tracking.teacher_interventions
    └──> progress_tracking.student_intervention_alerts (alert_id) N:1
    └──> auth_management.profiles (student_id) N:1
    └──> auth_management.profiles (teacher_id) N:1
    └──> social_features.classrooms (classroom_id) N:1
```

---

## NOTAS DE MIGRACION

1. Las tablas de parent_* requieren Epic EXT-010/EXT-011 para funcionar completamente
2. `user_purchases` depende de `shop_items` existente
3. `teacher_interventions` se integra con sistema de alertas existente
4. Todas las tablas tienen soporte multi-tenant

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
