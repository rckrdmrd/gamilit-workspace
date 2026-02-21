# Modulos del Sistema - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Total Modulos:** 23

---

## Resumen

GAMILIT cuenta con 23 modulos backend organizados en 4 categorias funcionales. Cada modulo sigue la arquitectura estandar NestJS con entities, services, controllers, DTOs y tests.

| Categoria | Cantidad | Modulos |
|-----------|----------|---------|
| Core Infrastructure | 7 | auth, users, tenants, core, health, settings, notifications |
| Educational Content | 5 | modules, exercises, content, classrooms, students |
| Gamification System | 6 | gamification, leaderboard, missions, store, achievements, social |
| Support & Operations | 4 | teachers, parents, analytics, reports |

---

## Core Infrastructure (7 modulos)

### 1. auth
**ID:** GAM-AUTH | **Estado:** 100%

Manejo completo de autenticacion y autorizacion del sistema.

- JWT con access token (15 min) y refresh token (7 dias)
- Passport strategies (local, JWT, OAuth)
- RBAC con 4 roles: estudiante, maestro, admin, padre
- Multi-tenant: cada login recibe tenant_id via RLS
- OAuth 2.0 para integraciones externas
- Session management con revocacion de tokens

**Entities:** users, sessions, oauth_tokens, refresh_tokens
**Endpoints:** ~45 (login, register, refresh, logout, profile, password reset, OAuth flows)
**Guards:** JwtAuthGuard, RolesGuard, TenantGuard

---

### 2. users
**ID:** GAM-USERS | **Estado:** 100%

Gestion de usuarios multi-rol con perfiles diferenciados.

- CRUD completo de usuarios
- Perfiles diferenciados por rol (estudiante con avatar, maestro con especialidad, etc.)
- Busqueda y filtrado avanzado
- Gestion de roles y permisos
- Activacion/desactivacion de cuentas
- Importacion masiva de usuarios (CSV)

**Entities:** users, user_profiles, user_preferences
**Endpoints:** ~35 (CRUD, search, roles, bulk import)

---

### 3. tenants
**ID:** GAM-TENANTS | **Estado:** 100%

Multi-tenancy completa con aislamiento por Row-Level Security.

- Cada escuela es un tenant independiente
- RLS policies en todas las tablas multi-tenant (227 policies)
- Gestion de suscripciones y planes por tenant
- Configuracion por tenant (logo, colores, features habilitados)
- Migracion de datos entre tenants (admin global)

**Entities:** tenants, tenant_settings, tenant_subscriptions
**Endpoints:** ~20 (CRUD, settings, subscriptions)

---

### 4. core
**ID:** GAM-CORE | **Estado:** 100%

Utilidades compartidas entre todos los modulos.

- Base entities (timestamps, soft delete)
- Interceptors (logging, transform)
- Pipes (validation, transform)
- Filters (exception handling)
- Shared DTOs (pagination, sorting, filtering)
- Constants SSOT (sincronizados entre capas)
- Utility functions

**No tiene endpoints propios.** Es modulo de soporte.

---

### 5. health
**ID:** GAM-HEALTH | **Estado:** 100%

Health checks del sistema para monitoreo y disponibilidad.

- Health check de base de datos (PostgreSQL)
- Health check de Redis
- Health check de memoria
- Health check de disco
- Endpoint de readiness y liveness

**Endpoints:** GET /health, GET /health/ready, GET /health/live

---

### 6. settings
**ID:** GAM-SETTINGS | **Estado:** 100%

Configuracion global del sistema y por tenant.

- Configuracion de plataforma (global)
- Configuracion por tenant
- Feature flags
- Parametros de gamificacion ajustables
- Configuracion de notificaciones

**Entities:** system_settings, tenant_settings
**Endpoints:** ~15 (get/set settings, feature flags)

---

### 7. notifications
**ID:** GAM-NOTIFICATIONS | **Estado:** 90%

Sistema multi-canal de notificaciones.

- Notificaciones in-app (tiempo real via Socket.IO)
- Email (templates HTML)
- Push notifications (mobile)
- SMS (para padres)
- Cola de procesamiento (queue-based)
- Templates de notificacion por evento
- Preferencias de usuario por canal
- Historial de notificaciones

**Entities:** notification_templates, notification_logs, notification_preferences, notification_queue
**Endpoints:** ~25 (send, list, mark read, preferences, templates)

---

## Educational Content (5 modulos)

### 8. modules
**ID:** GAM-MODULES | **Estado:** 95%

Gestion de los 5 modulos educativos y su progresion.

- 5 modulos: Literal, Inferencial, Critica, Digital, Produccion
- Progresion desbloqueable (completar 70% de un modulo desbloquea el siguiente)
- Configuracion de dificultad por modulo
- Metricas de progreso por modulo
- Contenido asociado por modulo

**Entities:** educational_modules, module_progress, module_config
**Endpoints:** ~20 (CRUD, progress, unlock)

---

### 9. exercises
**ID:** GAM-EXERCISES | **Estado:** 95%

Motor modular de ejercicios con 23 tipos diferentes.

- 23 tipos de ejercicios distribuidos en 5 modulos
- Motor de evaluacion automatica (modulos 1-4)
- Motor de evaluacion manual (modulo 5 - produccion)
- Scoring system con puntuacion parcial
- Retroalimentacion inmediata
- Repeticion espaciada (spaced repetition engine)
- Historial de intentos por ejercicio
- Randomizacion de opciones y orden

**Entities:** exercises, exercise_types, exercise_attempts, exercise_results, exercise_feedback
**Endpoints:** ~50 (CRUD, submit, evaluate, results, history, spaced repetition)

---

### 10. content
**ID:** GAM-CONTENT | **Estado:** 95%

Gestion de contenido educativo (lecturas, materiales).

- CRUD de lecturas con metadatos (grado, dificultad, tema, modulo)
- Versionado de contenido
- Contenido global (admin) vs contenido local (maestro)
- Categorizacion por modulo, grado, tema
- Multimedia: texto, imagenes, audio, video
- Tags y busqueda full-text

**Entities:** contents, content_versions, content_categories, content_tags
**Endpoints:** ~30 (CRUD, search, categorize, version)

---

### 11. classrooms
**ID:** GAM-CLASSROOMS | **Estado:** 90%

Gestion de aulas y grupos de estudiantes.

- CRUD de aulas
- Asignacion de estudiantes a aulas
- Asignacion de maestro titular
- Configuracion de aula (modulos habilitados, dificultad)
- Aulas multiples por maestro
- Historial de aulas por ciclo escolar

**Entities:** classrooms, classroom_students, classroom_teachers, classroom_config
**Endpoints:** ~25 (CRUD, assign students, assign teachers, config)

---

### 12. students
**ID:** GAM-STUDENTS | **Estado:** 90%

Perfiles de estudiantes y tracking de progreso academico.

- Perfil academico del estudiante
- Tracking de progreso por modulo y ejercicio
- Historial de calificaciones
- Estadisticas de engagement (tiempo en plataforma, frecuencia)
- Nivel actual en sistema de gamificacion
- Vinculacion con padres

**Entities:** student_profiles, student_progress, student_stats
**Endpoints:** ~30 (profile, progress, stats, history)

---

## Gamification System (6 modulos)

### 13. gamification
**ID:** GAM-GAME | **Estado:** 95%

Motor central de gamificacion educativa.

- Calculo de XP con multiplicadores
- Progression engine (niveles, rangos)
- Event bus para triggers de gamificacion
- Integracion con todos los modulos educativos
- Configuracion de parametros de gamificacion
- Dashboard de gamificacion por estudiante

**Entities:** xp_transactions, levels, rank_definitions, gamification_config
**Endpoints:** ~35 (XP, levels, ranks, config, dashboard)

---

### 14. leaderboard
**ID:** GAM-LEAD | **Estado:** 85%

Leaderboards competitivos multi-nivel.

- Rankings por aula, escuela, global
- Rankings por modulo educativo
- Rankings por periodo (diario, semanal, mensual)
- Temporadas con reset y recompensas
- Leaderboard en tiempo real via Socket.IO
- Anti-abuse: limites de XP diario

**Entities:** leaderboard_entries, leaderboard_seasons, leaderboard_config
**Endpoints:** ~20 (rankings, seasons, history)

---

### 15. missions
**ID:** GAM-MISS | **Estado:** 85%

Sistema de misiones y retos.

- Misiones diarias (3 por dia, rotacion automatica)
- Misiones semanales (5 por semana)
- Quests especiales (cadenas tematicas)
- Condiciones de completitud configurables
- Recompensas (XP, ML Coins, items)
- Tracking de progreso de mision

**Entities:** missions, mission_progress, mission_rewards, quest_chains
**Endpoints:** ~25 (list, progress, complete, rewards)

---

### 16. store
**ID:** GAM-SHOP | **Estado:** 75%

Tienda virtual con economia ML Coins.

- Catalogo de items (avatares, fondos, power-ups, efectos)
- Sistema de compra con ML Coins
- Inventario del estudiante
- Items con duracion (temporales vs permanentes)
- Items con efecto (multiplicador XP, pista extra, tiempo extra)
- Historial de transacciones

**Entities:** store_items, store_purchases, student_inventory, store_categories
**Endpoints:** ~20 (catalog, purchase, inventory, history)

---

### 17. achievements
**ID:** GAM-ACH | **Estado:** 90%

Logros e insignias desbloqueables.

- Logros por hitos academicos
- Insignias por consistencia (rachas)
- Milestones por modulo educativo
- Logros sociales (equipos, ayuda)
- Logros secretos (easter eggs)
- Notificacion al desbloquear
- Showcase de logros en perfil

**Entities:** achievements, student_achievements, achievement_categories
**Endpoints:** ~20 (list, progress, unlock, showcase)

---

### 18. social
**ID:** GAM-SOCIAL | **Estado:** 50%

Interacciones sociales entre estudiantes.

- Equipos (team formation)
- Retos entre equipos (parcial)
- Feed de actividad social
- Sistema de likes/reacciones
- Foros por aula (parcial)
- Competencias grupales

**Entities:** teams, team_members, social_interactions, social_feed
**Endpoints:** ~20 (teams, feed, interactions)

**Nota:** Modulo parcialmente implementado. DDL y entities completos, logica de negocio al 50%.

---

## Support & Operations (4 modulos)

### 19. teachers
**ID:** GAM-TEACHERS | **Estado:** 95%

Herramientas y funcionalidades para maestros.

- Dashboard de maestro
- Asignacion de ejercicios a aulas/estudiantes
- Revision manual de ejercicios (Modulo 5)
- Calificacion con rubrica
- Comunicacion con padres
- Configuracion de aula

**Entities:** teacher_profiles, assignments, manual_reviews
**Endpoints:** ~30 (dashboard, assign, review, communicate)

---

### 20. parents
**ID:** GAM-PARENTS | **Estado:** 100%

Portal y funcionalidades para padres de familia.

- Vinculacion padre-estudiante (codigo de vinculacion)
- Dashboard de progreso academico
- Notificaciones automaticas (email, push, SMS)
- Comunicacion con maestro
- Reportes descargables (PDF)
- Historial de actividad del hijo

**Entities:** parent_profiles, parent_student_links, parent_notifications
**Endpoints:** ~20 (link, dashboard, notifications, reports)

---

### 21. analytics
**ID:** GAM-ANALYTICS | **Estado:** 85%

Learning analytics y metricas de engagement.

- Metricas por estudiante (tiempo, frecuencia, calidad)
- Metricas por aula (promedios, distribucion)
- Metricas por escuela (global)
- Engagement analytics (DAU, WAU, MAU, retention)
- Materialized Views para consultas rapidas (7 MVs)
- Graficos y visualizaciones

**Entities:** analytics_events, analytics_snapshots
**Endpoints:** ~25 (student, classroom, school, engagement)

---

### 22. reports
**ID:** GAM-REPORTS | **Estado:** 75%

Generacion de reportes y exportaciones.

- Reportes de progreso por estudiante
- Reportes de aula para maestro
- Reportes para padres
- Exportacion PDF y Excel
- Templates de reportes configurables
- Reportes programados (automaticos)

**Entities:** report_templates, report_instances, report_schedules
**Endpoints:** ~20 (generate, download, schedule, templates)

---

## Resumen de Metricas por Modulo

| # | Modulo | Entities | Endpoints | Services | Controllers | Estado |
|---|--------|----------|-----------|----------|-------------|--------|
| 1 | auth | 4 | ~45 | 5 | 3 | 100% |
| 2 | users | 3 | ~35 | 4 | 2 | 100% |
| 3 | tenants | 3 | ~20 | 3 | 2 | 100% |
| 4 | core | - | - | 8 | - | 100% |
| 5 | health | - | 3 | 1 | 1 | 100% |
| 6 | settings | 2 | ~15 | 2 | 1 | 100% |
| 7 | notifications | 4 | ~25 | 5 | 2 | 90% |
| 8 | modules | 3 | ~20 | 3 | 2 | 95% |
| 9 | exercises | 5 | ~50 | 8 | 5 | 95% |
| 10 | content | 4 | ~30 | 4 | 3 | 95% |
| 11 | classrooms | 4 | ~25 | 4 | 2 | 90% |
| 12 | students | 3 | ~30 | 5 | 3 | 90% |
| 13 | gamification | 4 | ~35 | 6 | 3 | 95% |
| 14 | leaderboard | 3 | ~20 | 3 | 2 | 85% |
| 15 | missions | 4 | ~25 | 4 | 3 | 85% |
| 16 | store | 4 | ~20 | 4 | 2 | 75% |
| 17 | achievements | 3 | ~20 | 3 | 2 | 90% |
| 18 | social | 4 | ~20 | 4 | 2 | 50% |
| 19 | teachers | 3 | ~30 | 5 | 3 | 95% |
| 20 | parents | 3 | ~20 | 3 | 2 | 100% |
| 21 | analytics | 2 | ~25 | 5 | 3 | 85% |
| 22 | reports | 3 | ~20 | 3 | 2 | 75% |
| **TOTAL** | | **~155** | **905** | **173** | **108** | **~92%** |

---

*GAMILIT - 23 Modulos Backend*
*NestJS 11 + TypeORM 0.3.x*
