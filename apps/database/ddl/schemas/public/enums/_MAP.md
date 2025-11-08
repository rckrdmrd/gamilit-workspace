# Mapa de ENUMs del Schema Public

**Total de ENUMs:** 11 (22 legacy, 8 migrados, 4 eliminados)
**Última actualización:** 2025-11-08
**Creado por:** SA-DB-008
**Microciclo:** 4 - Fase 1 (P0)
**Migración:** v10.0 - achievement_category, achievement_type, transaction_type, comodin_type migrados a gamification_system; difficulty_level, exercise_type, cognitive_level migrados a educational_content; progress_status migrado a progress_tracking; notification_channel, module_status, classroom_role y team_role eliminados

## Resumen

Este directorio contiene todos los tipos enumerados (ENUMs) del schema `public` de la base de datos Gamilit. Los ENUMs son objetos P0 (prioridad crítica) que deben crearse antes que las tablas que los referencian.

## Lista de ENUMs

**NOTA:** Los ENUMs `achievement_category` y `achievement_type` han sido migrados a `gamification_system` schema. Ver `apps/database/ddl/schemas/gamification_system/enums/`.

| # | Nombre | Archivo | Descripción | Valores |
|---|--------|---------|-------------|---------|
| ~~1~~ | ~~achievement_category~~ | ❌ Migrado a gamification_system | Categorías de logros (ahora en gamification_system schema) | 7 valores |
| ~~2~~ | ~~achievement_type~~ | ❌ Migrado a gamification_system | Tipos de logros (ahora en gamification_system schema) | 4 valores |
| 3 | aggregation_period | aggregation_period.sql | Períodos de agregación para métricas y estadísticas | 5 valores |
| 4 | alert_severity | alert_severity.sql | Niveles de severidad para alertas del sistema | 4 valores |
| 5 | attempt_result | attempt_result.sql | Resultados posibles de intentos de ejercicios | 4 valores |
| ~~6~~ | ~~classroom_role~~ | ❌ ELIMINADO | ENUM nunca implementado (eliminado 2025-11-08) | 3 valores |
| ~~7~~ | ~~comodin_type~~ | ❌ Migrado a gamification_system | Tipos de comodines (migrado 2025-11-08 - ARRAY type) | 3 valores |
| 8 | content_status | content_status.sql | Estados del contenido en el sistema | 4 valores |
| 9 | content_type | content_type.sql | Tipos de contenido educativo | 6 valores |
| ~~10~~ | ~~difficulty_level~~ | ❌ Migrado a educational_content | Niveles de dificultad (migrado 2025-11-08) | 8 valores |
| ~~11~~ | ~~exercise_type~~ | ❌ Migrado a educational_content | Tipos de ejercicios interactivos (migrado 2025-11-08) | 35 valores |
| 12 | gamilit_role | gamilit_role.sql | Roles de usuario en la plataforma Gamilit | 3 valores |
| 13 | media_type | media_type.sql | Tipos de archivos multimedia soportados | 6 valores |
| 14 | metric_type | metric_type.sql | Tipos de métricas para análisis y seguimiento | 7 valores |
| ~~15~~ | ~~module_status~~ | ❌ ELIMINADO | ENUM redundante, 100% duplicado de content_status (eliminado 2025-11-08) | 4 valores |
| ~~16~~ | ~~notification_channel~~ | ❌ ELIMINADO | Feature no implementado (eliminado 2025-11-08) | 4 valores |
| 17 | notification_type | notification_type.sql | Tipos de notificaciones del sistema | 8 valores |
| 18 | processing_status | processing_status.sql | Estados de procesamiento de archivos multimedia | 5 valores |
| ~~19~~ | ~~progress_status~~ | ❌ Migrado a progress_tracking | Estados de progreso (migrado 2025-11-08) | 5 valores |
| 20 | social_event_type | social_event_type.sql | Tipos de eventos sociales y competencias | 5 valores |
| ~~21~~ | ~~transaction_type~~ | ❌ Migrado a gamification_system | Tipos de transacciones ML Coins (migrado 2025-11-08) | 14 valores |
| 22 | user_status | user_status.sql | Estados de cuenta de usuario | 4 valores |

## Valores Detallados por ENUM

### Sistema de Gamificación (4 ENUMs en public, 3 migrados)
- ~~**achievement_category**~~: ❌ MIGRADO a gamification_system.achievement_category
- ~~**achievement_type**~~: ❌ MIGRADO a gamification_system.achievement_type
- ~~**comodin_type**~~: ❌ MIGRADO a gamification_system.comodin_type (2025-11-08) - ARRAY type
- **metric_type**: engagement, performance, completion, time_spent, accuracy, streak, social_interaction
- ~~**transaction_type**~~: ❌ MIGRADO a gamification_system.transaction_type (2025-11-08) - 14 valores v2.0
- **aggregation_period**: daily, weekly, monthly, quarterly, yearly

**NOTA:** maya_rank ahora se encuentra en gamification_system schema (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan)

### Contenido Educativo (4 ENUMs en public, 1 migrado, 1 eliminado)
- ~~**difficulty_level**~~: ❌ MIGRADO a educational_content.difficulty_level (2025-11-08) - 8 valores
- **exercise_type**: 27 tipos (crucigrama, linea_tiempo, mapa_conceptual, emparejamiento, sopa_letras, detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto, rueda_inferencias, tribunal_opiniones, debate_digital, analisis_fuentes, podcast_argumentativo, matriz_perspectivas, verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes, diario_interactivo, resumen_visual, capsula_tiempo, comprension_auditiva, collage_digital, texto_movimiento, call_to_action)
- **content_status**: draft, published, archived, reviewing
- **content_type**: video, text, interactive, quiz, game, simulation
- ~~**module_status**~~: ❌ ELIMINADO - 100% duplicado de content_status (2025-11-08)
- **progress_status**: not_started, in_progress, completed, reviewed, mastered

### Sistema de Usuarios y Aulas (2 ENUMs, 1 eliminado)
- **gamilit_role**: student, admin_teacher, super_admin
- ~~**classroom_role**~~: ❌ ELIMINADO (nunca implementado, ver _deprecated/)
- **user_status**: active, inactive, suspended, pending

### Gestión de Contenido Multimedia (2 ENUMs)
- **media_type**: image, video, audio, document, interactive, animation
- **processing_status**: uploading, processing, ready, error, optimizing

### Notificaciones y Alertas (2 ENUMs, 1 eliminado)
- ~~**notification_channel**~~: ❌ ELIMINADO (feature no implementado, ver _deprecated/)
- **notification_type**: info, success, warning, error, achievement, progress, social, reminder
- **alert_severity**: info, warning, error, critical

### Seguimiento de Progreso (2 ENUMs)
- **attempt_result**: correct, incorrect, partial, skipped
- **social_event_type**: competition, collaboration, challenge, tournament, workshop

## Orden de Creación Recomendado

Todos los ENUMs pueden crearse en paralelo ya que no tienen dependencias entre sí. Se recomienda ejecutarlos en el siguiente orden por categoría:

1. **Base (Roles y Estados)**: gamilit_role, user_status
2. **Gamificación**: achievement_category, achievement_type, comodin_type, transaction_type
3. **Contenido Educativo**: difficulty_level, exercise_type, content_status, content_type, module_status, progress_status
4. **Multimedia**: media_type, processing_status
5. **Notificaciones**: notification_type, alert_severity (~~notification_channel eliminado~~)
6. **Métricas**: metric_type, aggregation_period
7. **Eventos**: social_event_type, attempt_result

## Referencias Cruzadas

Estos ENUMs son referenciados por tablas en los siguientes schemas:

### gamification_system
- achievement_category (achievements)
- aggregation_period (leaderboards, analytics_summary)
- metric_type (analytics_summary)
- transaction_type (ml_coins_transactions)
- **maya_rank** (MIGRADO A gamification_system.maya_rank - user_ranks, modules)
- **comodin_type** (MIGRADO A gamification_system.comodin_type - usado en educational_content.exercises)

### educational_content
- difficulty_level (modules, exercises, assessment_rubrics)
- exercise_type (exercises)
- content_status (modules, marie_curie_content)
- module_status (modules)
- progress_status (module_progress, exercise_progress)

### content_management
- media_type (media_files, media_resources)
- processing_status (media_files, media_resources)
- content_status (marie_curie_content)
- difficulty_level (content_templates)

### auth_management
- gamilit_role (profiles, user_roles)
- user_status (profiles)

### social_features
- ~~classroom_role~~ (❌ nunca implementado - eliminado)
- social_event_type (events)

### system_configuration
- notification_type (notification_settings)
- gamilit_role (feature_flags, notification_settings)

### progress_tracking
- progress_status (module_progress, exercise_progress)
- metric_type (analytics_summary)
- aggregation_period (analytics_summary)
- attempt_result (exercise_attempts)

## Notas Importantes

### Migración de maya_rank (2025-11-07)
- **maya_rank** fue migrado del schema `public` al schema `gamification_system`
- Valores actuales: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
- Los archivos `maya_rank.sql` y `rango_maya.sql` fueron eliminados de public schema
- Referencia canónica: `ddl/schemas/gamification_system/enums/maya_rank.sql`

### ENUMs con Mayor Cantidad de Valores
- **exercise_type**: 27 valores (el más extenso)
- **transaction_type**: 10 valores
- **notification_type**: 8 valores

### ENUMs Base (Menor Cantidad de Valores)
- **comodin_type**: 3 valores
- **gamilit_role**: 3 valores
- **classroom_role**: 3 valores
- **difficulty_level**: 3 valores

## Fuentes

- **Matriz de gaps**: `/orchestration/analisis/matriz-gaps.json`
- **Fuente principal SA-DB-003**: `/home/isem/workspace/docs/projects/glit/06-database/ddl/02-types.sql` (8 ENUMs)
- **Fuente principal SA-DB-005**: `/home/isem/workspace/docs/projects/glit/database/backups/backup_20251021_183639/schema.sql` (16 ENUMs)

## Comandos de Validación

```bash
# Contar archivos SQL
find . -name "*.sql" -type f | wc -l

# Listar todos los ENUMs
ls -1 *.sql

# Verificar sintaxis de todos los archivos
for file in *.sql; do
  echo "Validando $file..."
  grep -q "CREATE TYPE public\." "$file" && echo "  ✓ Sintaxis correcta" || echo "  ✗ Error"
done
```

## Script de Creación Completo

Para crear todos los ENUMs en orden:

```bash
#!/bin/bash
# Script para crear todos los ENUMs del schema public
# Ruta: apps/database/ddl/schemas/public/enums/

ENUMS_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/enums"

echo "Creando ENUMs del schema public..."
for sql_file in "$ENUMS_DIR"/*.sql; do
  echo "Ejecutando: $(basename $sql_file)"
  psql -U postgres -d gamilit_platform -f "$sql_file"
done
echo "✓ Todos los ENUMs han sido creados"
```

---

## Historial de Migraciones a Otros Schemas

| Fecha | ENUM | Migrado De | Migrado A | Migration Script | Estado |
|-------|------|------------|-----------|------------------|--------|
| 2025-11-07 | achievement_category | public | gamification_system | 2025-11-07-fix-achievement-enums-schema.sql | ✅ |
| 2025-11-07 | achievement_type | public | gamification_system | 2025-11-07-fix-achievement-enums-schema.sql | ✅ |
| 2025-11-08 | transaction_type | public | gamification_system | 2025-11-08-sync-transaction-type-enum.sql | ✅ |
| 2025-11-08 | notification_priority | N/A | gamification_system | 2025-11-08-add-notification-priority.sql | ✅ |
| 2025-11-08 | notification_channel | public | ❌ ELIMINADO | N/A (nunca implementado) | ❌ |
| 2025-11-08 | comodin_type | public | gamification_system | 2025-11-08-migrate-comodin-type-enum.sql | ✅ |
| 2025-11-08 | difficulty_level | public | educational_content | 2025-11-08-migrate-difficulty-level-enum.sql | ✅ |
| 2025-11-08 | module_status | public | ❌ ELIMINADO | N/A (nunca implementado, duplicado) | ❌ |
| 2025-11-08 | progress_status | public | progress_tracking | 2025-11-08-migrate-progress-status-enum.sql | ✅ |
| 2025-11-08 | classroom_role | public | ❌ ELIMINADO | N/A (nunca implementado) | ❌ |
| 2025-11-08 | team_role | public | ❌ ELIMINADO | N/A (legacy nunca usado, implementación usa VARCHAR) | ❌ |

**Archivos legacy movidos a:** `_deprecated/`

---

**Generado por:** SA-DB-008 - Implementador de ENUMs del Schema Public
**Microciclo 4 - Fase 1**
**Fecha:** 2025-11-02
**Última actualización:** 2025-11-08 (team_role eliminado - FASE 1 Sprint 1 completado)
