# VISTAS (VIEWS) DATABASE - INVENTARIO

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Version:** 1.0
**Fecha:** 2025-12-26
**Total Views:** 17

---

## RESUMEN POR SCHEMA

| Schema | Views | Proposito |
|--------|-------|-----------|
| admin_dashboard | 7 | Dashboard administrativo |
| auth | 1 | Alias de tenants |
| educational_content | 1 | Analisis de validacion |
| gamification_system | 4 | Leaderboards |
| gamilit | 1 | Utilidades |
| progress_tracking | 2 | Seguimiento de progreso |
| social_features | 1 | Progreso de aula |
| **TOTAL** | **17** | - |

---

## 1. SCHEMA: admin_dashboard (7 views)

### 01-recent_activity.sql

**Proposito:** Actividad reciente del sistema para dashboard admin

| Columna | Descripcion |
|---------|-------------|
| activity_id | ID de actividad |
| user_id | Usuario que realizo la accion |
| activity_type | Tipo de actividad |
| description | Descripcion de la accion |
| created_at | Timestamp |

---

### assignment_submission_stats.sql

**Proposito:** Estadisticas de envios de asignaciones

| Columna | Descripcion |
|---------|-------------|
| assignment_id | ID de asignacion |
| total_submissions | Total de envios |
| pending_reviews | Pendientes de revision |
| average_score | Puntuacion promedio |
| completion_rate | Tasa de completado |

---

### classroom_overview.sql

**Proposito:** Vista general de aulas para admin

| Columna | Descripcion |
|---------|-------------|
| classroom_id | ID del aula |
| classroom_name | Nombre |
| teacher_name | Profesor asignado |
| student_count | Cantidad de estudiantes |
| avg_progress | Progreso promedio |

---

### moderation_queue.sql

**Proposito:** Cola de contenido pendiente de moderacion

| Columna | Descripcion |
|---------|-------------|
| item_id | ID del item |
| content_type | Tipo de contenido |
| reporter_id | Quien reporto |
| reason | Razon del reporte |
| status | Estado de moderacion |

---

### organization_stats_summary.sql

**Proposito:** Resumen de estadisticas por organizacion

| Columna | Descripcion |
|---------|-------------|
| org_id | ID de organizacion |
| total_users | Total usuarios |
| active_users | Usuarios activos |
| total_classrooms | Total aulas |
| total_exercises_completed | Ejercicios completados |

---

### recent_admin_actions.sql

**Proposito:** Acciones recientes de administradores

| Columna | Descripcion |
|---------|-------------|
| action_id | ID de accion |
| admin_id | Admin que ejecuto |
| action_type | Tipo de accion |
| target_entity | Entidad afectada |
| timestamp | Cuando ocurrio |

---

### user_stats_summary.sql

**Proposito:** Resumen de estadisticas de usuarios

| Columna | Descripcion |
|---------|-------------|
| total_users | Total usuarios |
| active_today | Activos hoy |
| new_this_week | Nuevos esta semana |
| by_role | Desglose por rol |

---

## 2. SCHEMA: auth (1 view)

### tenants_alias.sql

**Proposito:** Alias para acceso simplificado a tenants

| Columna | Descripcion |
|---------|-------------|
| tenant_id | ID del tenant |
| name | Nombre |
| alias | Alias corto |
| status | Estado del tenant |

---

## 3. SCHEMA: educational_content (1 view)

### 01-v_validation_analysis.sql

**Proposito:** Analisis de validacion de contenido educativo

| Columna | Descripcion |
|---------|-------------|
| exercise_id | ID de ejercicio |
| validation_status | Estado de validacion |
| errors_found | Errores encontrados |
| warnings | Advertencias |
| last_validated | Ultima validacion |

---

## 4. SCHEMA: gamification_system (4 views)

### 01-leaderboard_coins.sql

**Proposito:** Leaderboard por ML Coins

| Columna | Descripcion |
|---------|-------------|
| rank | Posicion |
| user_id | ID usuario |
| username | Nombre de usuario |
| total_coins | ML Coins totales |
| avatar_url | URL avatar |

---

### 02-leaderboard_global.sql

**Proposito:** Leaderboard global combinado

| Columna | Descripcion |
|---------|-------------|
| rank | Posicion |
| user_id | ID usuario |
| username | Nombre |
| total_xp | XP total |
| maya_rank | Rango Maya |
| total_coins | ML Coins |

---

### 03-leaderboard_streaks.sql

**Proposito:** Leaderboard por rachas de actividad

| Columna | Descripcion |
|---------|-------------|
| rank | Posicion |
| user_id | ID usuario |
| username | Nombre |
| current_streak | Racha actual (dias) |
| longest_streak | Racha maxima |

---

### 04-leaderboard_xp.sql

**Proposito:** Leaderboard por puntos de experiencia

| Columna | Descripcion |
|---------|-------------|
| rank | Posicion |
| user_id | ID usuario |
| username | Nombre |
| total_xp | XP total |
| maya_rank | Rango Maya actual |

---

## 5. SCHEMA: gamilit (1 view)

### number_series.sql

**Proposito:** Utilidad para generar series numericas

| Columna | Descripcion |
|---------|-------------|
| n | Numero en la serie |

**Uso:** Funciones de utilidad y generacion de datos

---

## 6. SCHEMA: progress_tracking (2 views)

### 02-teacher_pending_reviews.sql

**Proposito:** Revisiones pendientes para docentes

| Columna | Descripcion |
|---------|-------------|
| review_id | ID de revision |
| student_id | Estudiante |
| exercise_id | Ejercicio |
| exercise_type | Tipo (M4/M5 creativos) |
| submitted_at | Fecha de envio |
| status | Estado (pending) |

---

### user_progress_summary.sql

**Proposito:** Resumen de progreso del usuario

| Columna | Descripcion |
|---------|-------------|
| user_id | ID usuario |
| modules_completed | Modulos completados |
| exercises_completed | Ejercicios completados |
| total_xp | XP ganado |
| current_streak | Racha actual |
| last_activity | Ultima actividad |

---

## 7. SCHEMA: social_features (1 view)

### 01-classroom_progress_overview.sql

**Proposito:** Vista general de progreso del aula

| Columna | Descripcion |
|---------|-------------|
| classroom_id | ID del aula |
| student_id | Estudiante |
| student_name | Nombre |
| module_progress | Progreso por modulo (JSON) |
| total_progress | Progreso total % |
| maya_rank | Rango actual |

---

## NOTAS TECNICAS

### Permisos

Todas las views tienen permisos para `gamilit_user`:
```sql
GRANT SELECT ON schema.view_name TO gamilit_user;
```

### Mantenimiento

- Las views no requieren datos iniciales (seeds)
- Se recrean en cada `./init-database.sh`
- Dependen de tablas base del schema

### Performance

Views con indices recomendados:
- `leaderboard_*` - Indexar por user_id, total_xp
- `classroom_progress_overview` - Indexar por classroom_id
- `teacher_pending_reviews` - Indexar por status, submitted_at

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-26
**Version:** 1.0
