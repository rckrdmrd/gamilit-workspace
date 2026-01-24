# RLS Coverage Report - GAMILIT
## Fecha: 2026-01-16
## Auditor: Claude Opus 4.5 (TASK-2026-01-16-003)

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Tablas DDL Totales** | 120 |
| **Tablas con ENABLE RLS** | 43 |
| **Tablas SIN RLS** | 77 |
| **Cobertura RLS** | 35.8% |
| **Policies Definidas** | 153 |

**SEVERIDAD: P0 - CRITICO**

---

## Tablas CON RLS Habilitado (43)

### auth_management (10 tablas)
- [x] email_verification_tokens
- [x] memberships
- [x] password_reset_tokens
- [x] profiles
- [x] security_events
- [x] tenants
- [x] user_preferences
- [x] user_roles
- [x] user_sessions
- [x] user_suspensions

### communication (1 tabla)
- [x] messages

### educational_content (4 tablas)
- [x] assessment_rubrics
- [x] exercises
- [x] media_resources
- [x] modules

### gamification_system (9 tablas)
- [x] achievements
- [x] comodines_inventory
- [x] leaderboard_metadata
- [x] missions
- [x] ml_coins_transactions
- [x] notifications (DEPRECATED)
- [x] user_achievements
- [x] user_ranks
- [x] user_stats

### notifications (4 tablas)
- [x] notification_logs
- [x] notification_preferences
- [x] notifications
- [x] user_devices

### progress_tracking (6 tablas)
- [x] certificates
- [x] exercise_attempts
- [x] exercise_submissions
- [x] learning_sessions
- [x] module_progress
- [x] teacher_notes

### social_features (9 tablas)
- [x] classroom_members
- [x] classrooms
- [x] friend_requests
- [x] friendships
- [x] schools
- [x] teacher_classrooms
- [x] team_challenges
- [x] team_members
- [x] teams

---

## Tablas SIN RLS (77) - REQUIEREN ACCION

### admin_dashboard (4 tablas) - SISTEMA/ADMIN
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| admin_reports | BAJA | Solo acceso admin |
| bulk_operations | BAJA | Solo acceso admin |
| materialized_views | BAJA | Vistas sistema |
| metrics_history | BAJA | Solo lectura admin |

### audit_logging (6 tablas) - SISTEMA
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| activity_log | MEDIA | Logs de actividad |
| audit_logs | BAJA | Solo lectura admin |
| pending_user_initialization | BAJA | Sistema interno |
| performance_metrics | BAJA | Solo admin |
| system_alerts | BAJA | Solo admin |
| system_logs | BAJA | Solo admin |
| user_activity_logs | MEDIA | Contiene info usuario |

### auth (1 tabla) - SUPABASE
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| users | N/A | Gestionado por Supabase |

### auth_management (6 tablas) - ALTA PRIORIDAD
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| auth_attempts | **ALTA** | Seguridad autenticacion |
| auth_providers | BAJA | Config sistema |
| parent_accounts | **ALTA** | Datos personales |
| parent_notifications | **ALTA** | Datos personales |
| parent_student_links | **ALTA** | Relaciones familiares |
| roles | BAJA | Config sistema |

### communication (1 tabla)
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| message_participants | **ALTA** | Privacidad mensajes |

### content_management (10 tablas) - MEDIA
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| content_authors | MEDIA | Metadatos |
| content_categories | BAJA | Config sistema |
| content_templates | BAJA | Config sistema |
| content_versions | MEDIA | Historial |
| flagged_content | MEDIA | Moderacion |
| marie_curie_content | BAJA | Contenido publico |
| media_files | **ALTA** | Archivos multimedia |
| media_metadata | MEDIA | Metadatos |
| moderation_rules | BAJA | Config sistema |
| tags | BAJA | Config sistema |

### educational_content (18 tablas) - ALTA PRIORIDAD
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| assignment_exercises | **ALTA** | Tareas asignadas |
| assignment_students | **ALTA** | Asignaciones estudiantes |
| assignment_submissions | **ALTA** | Entregas |
| assignments | **ALTA** | Tareas |
| classroom_modules | MEDIA | Modulos por aula |
| content_approvals | MEDIA | Aprobaciones |
| content_metadata | BAJA | Metadatos |
| content_tags | BAJA | Tags |
| difficulty_criteria | BAJA | Config sistema |
| exercise_mechanic_mapping | BAJA | Config sistema |
| exercise_type_rubrics | BAJA | Config sistema |
| exercise_validation_audit | MEDIA | Auditoria |
| exercise_validation_config | BAJA | Config sistema |
| media_attachments | MEDIA | Adjuntos |
| module_dependencies | BAJA | Config sistema |
| taxonomies | BAJA | Config sistema |
| teacher_content | **ALTA** | Contenido docente |

### gamification_system (10 tablas)
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| achievement_categories | BAJA | Config sistema |
| active_boosts | **ALTA** | Boosts activos |
| classroom_missions | MEDIA | Misiones aula |
| comodin_usage_log | MEDIA | Log uso |
| comodin_usage_tracking | MEDIA | Tracking |
| inventory_transactions | **ALTA** | Transacciones |
| maya_ranks | BAJA | Config sistema |
| mission_templates | BAJA | Config sistema |
| shop_categories | BAJA | Config sistema |
| shop_items | BAJA | Config sistema |
| user_purchases | **ALTA** | Compras usuario |

### lti_integration (3 tablas) - ALTA
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| lti_consumers | BAJA | Config sistema |
| lti_grade_passback | **ALTA** | Calificaciones |
| lti_sessions | **ALTA** | Sesiones activas |

### notifications (2 tablas)
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| notification_queue | MEDIA | Cola proceso |
| notification_templates | BAJA | Config sistema |

### progress_tracking (12 tablas) - ALTA PRIORIDAD
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| engagement_metrics | MEDIA | Metricas |
| learning_paths | MEDIA | Rutas |
| manual_reviews | **ALTA** | Revisiones manuales |
| mastery_tracking | **ALTA** | Seguimiento maestria |
| module_completion_tracking | **ALTA** | Completacion |
| progress_snapshots | MEDIA | Snapshots |
| scheduled_missions | MEDIA | Misiones programadas |
| skill_assessments | **ALTA** | Evaluaciones |
| student_intervention_alerts | **ALTA** | Alertas intervencion |
| teacher_interventions | **ALTA** | Intervenciones |
| user_current_level | **ALTA** | Nivel actual |
| user_difficulty_progress | MEDIA | Progreso dificultad |
| user_learning_paths | MEDIA | Rutas usuario |

### social_features (9 tablas)
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| assignment_classrooms | MEDIA | Asignaciones aula |
| challenge_participants | **ALTA** | Participantes |
| challenge_results | **ALTA** | Resultados |
| discussion_threads | **ALTA** | Discusiones |
| peer_challenges | **ALTA** | Retos peer |
| social_interactions | MEDIA | Interacciones |
| teacher_reports | **ALTA** | Reportes docente |
| user_activities | MEDIA | Actividades |
| user_follows | **ALTA** | Seguidores |

### system_configuration (9 tablas) - SISTEMA
| Tabla | Prioridad | Justificacion |
|-------|-----------|---------------|
| api_configuration | BAJA | Config sistema |
| environment_config | BAJA | Config sistema |
| feature_flags | BAJA | Config sistema |
| gamification_parameters | BAJA | Config sistema |
| notification_settings | BAJA | Config sistema |
| notification_settings_global | BAJA | Config sistema |
| rate_limits | BAJA | Config sistema |
| system_settings | BAJA | Config sistema |
| tenant_configurations | BAJA | Config sistema |

---

## Plan de Accion Recomendado

### Fase 1 - Critica (ALTA prioridad) - 25 tablas
Tablas con datos de usuario que requieren RLS inmediato:

1. **auth_management**
   - auth_attempts
   - parent_accounts
   - parent_notifications
   - parent_student_links

2. **communication**
   - message_participants

3. **educational_content**
   - assignment_exercises
   - assignment_students
   - assignment_submissions
   - assignments
   - teacher_content

4. **gamification_system**
   - active_boosts
   - inventory_transactions
   - user_purchases

5. **lti_integration**
   - lti_grade_passback
   - lti_sessions

6. **progress_tracking**
   - manual_reviews
   - mastery_tracking
   - module_completion_tracking
   - skill_assessments
   - student_intervention_alerts
   - teacher_interventions
   - user_current_level

7. **social_features**
   - challenge_participants
   - challenge_results
   - discussion_threads
   - peer_challenges
   - teacher_reports
   - user_follows

### Fase 2 - Media prioridad - 20 tablas
Tablas con datos auxiliares que benefician de RLS.

### Fase 3 - Baja prioridad - 32 tablas
Tablas de configuracion del sistema, acceso solo admin.

---

## Archivo a Crear: 07-enable-rls.sql

Se creara `apps/database/ddl/07-enable-rls.sql` con:
1. ENABLE RLS para tablas Fase 1
2. Policies basicas por rol
3. Grants correspondientes

---

## Notas Tecnicas

1. **Supabase auth.users**: No requiere RLS personalizado, Supabase lo gestiona.

2. **Tablas admin_dashboard**: Solo accesibles via backend con rol admin, RLS opcional.

3. **Tablas system_configuration**: Lectura publica, escritura solo admin.

4. **Tablas deprecated**: gamification_system.notifications marcada como deprecated.

---

## Referencias

- Plan: TASK-2026-01-16-003
- Directiva: @TRIGGER-COHERENCIA-CAPAS
- Documento: PLAN-VALIDACION-INTEGRAL-GAMILIT.md
