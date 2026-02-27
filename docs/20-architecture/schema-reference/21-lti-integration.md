# Schema 21: lti_integration (3 tablas)

> **Nota:** Este documento describe el schema fisico `lti_integration`. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/lti_integration/tables/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

**Epic:** EXT-007 (LTI 1.3 Integration)

---

### lti_integration.lti_consumers
Configuracion de LMS externos (Canvas, Moodle, Blackboard) que integran con Gamilit via LTI 1.3.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| platform_id | TEXT | NOT NULL | - | Issuer identifier del LMS (ej: https://canvas.instructure.com) |
| client_id | TEXT | NOT NULL | - | OAuth2 client_id asignado por el LMS |
| deployment_id | TEXT | NULL | NULL | LTI deployment ID para multi-deployment (opcional) |
| public_keyset_url | TEXT | NOT NULL | - | JWKS URL para validar tokens del LMS |
| access_token_url | TEXT | NOT NULL | - | Token endpoint OAuth |
| authorization_url | TEXT | NOT NULL | - | Authorization endpoint OAuth |
| platform_name | TEXT | NOT NULL | - | Nombre del LMS (ej: Canvas UAM) |
| platform_version | TEXT | NULL | NULL | Version del LMS |
| platform_contact_email | TEXT | NULL | NULL | Email de contacto de la plataforma |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants ON DELETE CASCADE |
| supports_deep_linking | BOOLEAN | NULL | false | Soporte para LTI Deep Linking |
| supports_nrps | BOOLEAN | NULL | false | Names and Role Provisioning Services |
| supports_ags | BOOLEAN | NULL | false | Assignment and Grade Services (envio de calificaciones) |
| consumer_key | TEXT | NULL | NULL | Clave para LTI 1.1 legacy (opcional) |
| consumer_secret | TEXT | NULL | NULL | Secreto para LTI 1.1 legacy (opcional) |
| custom_parameters | JSONB | NULL | '{}' | Parametros personalizados adicionales |
| is_active | BOOLEAN | NULL | true | Consumidor activo |
| is_verified | BOOLEAN | NULL | false | Verificado por administrador |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| last_used_at | TIMESTAMPTZ | NULL | NULL | Ultima vez que se uso este consumidor |

**Primary Key:** id
**Unique:** (platform_id, client_id, deployment_id) (`unique_platform_client`)
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE, created_by → auth_management.profiles
**Indices:** `idx_lti_consumers_platform_id`, `idx_lti_consumers_client_id`, `idx_lti_consumers_tenant_id`, `idx_lti_consumers_active` (parcial: is_active=true)
**Trigger:** trg_lti_consumers_updated_at

---

### lti_integration.lti_sessions
Sesiones activas de LTI — tracking de launches desde LMS externos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| consumer_id | UUID | NOT NULL | - | FK lti_integration.lti_consumers ON DELETE CASCADE |
| user_id | UUID | NULL | NULL | FK auth_management.profiles ON DELETE SET NULL |
| launch_id | TEXT | NOT NULL | - | ID unico del LTI launch request |
| message_type | TEXT | NOT NULL | - | Tipo de mensaje LTI (LtiResourceLinkRequest, LtiDeepLinkingRequest) |
| context_id | TEXT | NULL | NULL | Course ID en el LMS externo |
| context_label | TEXT | NULL | NULL | Codigo del curso (ej: CS101) |
| context_title | TEXT | NULL | NULL | Nombre del curso |
| resource_link_id | TEXT | NULL | NULL | ID del resource link en el LMS |
| resource_link_title | TEXT | NULL | NULL | Titulo del contenido/assignment |
| resource_link_description | TEXT | NULL | NULL | Descripcion del resource link |
| lms_user_id | TEXT | NULL | NULL | User ID del usuario en el LMS |
| lms_user_email | TEXT | NULL | NULL | Email del usuario en el LMS |
| lms_user_name | TEXT | NULL | NULL | Nombre del usuario en el LMS |
| lms_user_roles | TEXT[] | NULL | NULL | Roles en el LMS (Learner, Instructor, Administrator) |
| id_token_claims | JSONB | NULL | '{}' | Claims completos del ID token JWT (para auditoria) |
| locale | TEXT | NULL | 'es-MX' | Locale de la sesion |
| timezone | TEXT | NULL | NULL | Zona horaria |
| return_url | TEXT | NULL | NULL | URL para volver al LMS |
| session_state | TEXT | NULL | NULL | Estado del flujo LTI |
| is_active | BOOLEAN | NULL | true | Sesion activa |
| launched_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de inicio del launch |
| last_activity_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Ultima actividad en la sesion |
| ended_at | TIMESTAMPTZ | NULL | NULL | Fecha de fin de sesion |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Foreign Keys:** consumer_id → lti_integration.lti_consumers ON DELETE CASCADE, user_id → auth_management.profiles ON DELETE SET NULL
**Indices:** `idx_lti_sessions_consumer_id`, `idx_lti_sessions_user_id`, `idx_lti_sessions_launch_id`, `idx_lti_sessions_context_id`, `idx_lti_sessions_resource_link`, `idx_lti_sessions_active` (parcial), `idx_lti_sessions_launched_at` (DESC), `idx_lti_sessions_lms_user`, `idx_lti_sessions_claims_gin` (GIN)

---

### lti_integration.lti_grade_passbacks
Registro de envio de calificaciones a LMS externos via LTI AGS (Assignment and Grade Services).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| session_id | UUID | NOT NULL | - | FK lti_integration.lti_sessions ON DELETE CASCADE |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| consumer_id | UUID | NOT NULL | - | FK lti_integration.lti_consumers ON DELETE CASCADE |
| lineitem_url | TEXT | NOT NULL | - | URL del lineitem (assignment) en el LMS |
| lineitem_id | TEXT | NULL | NULL | ID del lineitem |
| lineitem_label | TEXT | NULL | NULL | Etiqueta del assignment |
| score_given | NUMERIC(5,2) | NULL | NULL | Calificacion obtenida por el estudiante |
| score_maximum | NUMERIC(5,2) | NULL | 100 | Calificacion maxima posible |
| score_percentage | NUMERIC(5,2) | NULL | NULL | Porcentaje obtenido (calculado) |
| activity_progress | TEXT | NULL | NULL | Estado de progreso LTI: Initialized, Started, InProgress, Submitted, Completed |
| grading_progress | TEXT | NULL | NULL | Estado de calificacion LTI: NotReady, Failed, Pending, PendingManual, FullyGraded, Processed |
| comment | TEXT | NULL | NULL | Comentario o feedback opcional |
| passback_status | TEXT | NULL | 'pending' | Estado: pending, sending, success, failed, retrying |
| lms_response | JSONB | NULL | NULL | Respuesta completa del LMS |
| lms_response_code | INTEGER | NULL | NULL | HTTP status code de la respuesta |
| error_message | TEXT | NULL | NULL | Mensaje de error si el envio fallo |
| attempt_count | INTEGER | NULL | 0 | Numero de intentos de envio |
| max_retries | INTEGER | NULL | 3 | Maximo de reintentos |
| next_retry_at | TIMESTAMPTZ | NULL | NULL | Fecha del proximo reintento |
| graded_at | TIMESTAMPTZ | NULL | NULL | Fecha en que se califico en Gamilit |
| first_sent_at | TIMESTAMPTZ | NULL | NULL | Primer intento de envio al LMS |
| last_sent_at | TIMESTAMPTZ | NULL | NULL | Ultimo intento de envio |
| success_at | TIMESTAMPTZ | NULL | NULL | Fecha de confirmacion de exito |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Foreign Keys:** session_id → lti_integration.lti_sessions ON DELETE CASCADE, user_id → auth_management.profiles ON DELETE CASCADE, consumer_id → lti_integration.lti_consumers ON DELETE CASCADE
**Checks:** activity_progress IN ('Initialized','Started','InProgress','Submitted','Completed'), grading_progress IN ('NotReady','Failed','Pending','PendingManual','FullyGraded','Processed'), passback_status IN ('pending','sending','success','failed','retrying')
**Indices:** `idx_lti_grade_passbacks_session`, `idx_lti_grade_passbacks_user`, `idx_lti_grade_passbacks_consumer`, `idx_lti_grade_passbacks_status`, `idx_lti_grade_passbacks_pending` (parcial: status IN pending/retrying), `idx_lti_grade_passbacks_lineitem`, `idx_lti_grade_passbacks_created_at` (DESC), `idx_lti_grade_passbacks_metadata` (GIN)
