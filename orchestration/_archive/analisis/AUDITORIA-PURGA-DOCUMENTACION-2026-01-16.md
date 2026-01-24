# AUDITORÍA Y PURGA: Correcciones de Implementación
# ============================================================================

**Fecha:** 2026-01-16
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0
**Proyecto:** GAMILIT
**Tipo:** Correcciones basadas en validación de triggers, seeds y documentación

---

## RESUMEN EJECUTIVO

### Hallazgos Críticos de Validación

| Área | Propuesto | CORREGIDO | Razón |
|------|-----------|-----------|-------|
| **Triggers XP directos** | 3 | 0 | VIOLAN modelo claim-to-earn |
| **Notification types nuevos** | 2 | 0 | No existen en ENUM |
| **Achievement category 'moderation'** | 5 | 0 | No existe - usar 'special' |
| **Triggers SEGUROS** | 2 | 2 | trg_notify_on_follow, trg_update_tag_usage |
| **Triggers CONDICIONALES** | 2 | 2 | Usar funciones existentes |

### Acciones de Corrección

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  MODELO CLAIM-TO-EARN (Obligatorio)                                       ║
║                                                                            ║
║  1. NUNCA otorgar XP/ML Coins directamente en triggers                    ║
║  2. Usar check_and_grant_achievements() para desbloquear                  ║
║  3. Usuario reclama via claim_achievement_reward()                        ║
║  4. Notificaciones con tipos EXISTENTES del ENUM                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## SECCIÓN 1: TRIGGERS CORREGIDOS

### 1.1 Triggers ELIMINADOS (Violan Claim-to-Earn)

Los siguientes triggers propuestos fueron **ELIMINADOS** porque otorgan XP directamente:

```sql
-- ❌ ELIMINADO: trg_award_moderation_xp
-- RAZÓN: UPDATE gamification_system.user_stats SET xp_total = xp_total + 25
-- VIOLA modelo claim-to-earn

-- ❌ ELIMINADO: trg_award_follow_xp
-- RAZÓN: Otorga 5 XP directamente por seguidor
-- VIOLA modelo claim-to-earn

-- ❌ ELIMINADO: trg_check_follower_milestone
-- RAZÓN: Otorga bonus de XP directamente
-- VIOLA modelo claim-to-earn
```

### 1.2 Triggers SEGUROS (Implementar)

#### 1.2.1 trg_notify_on_follow (SEGURO)

```sql
-- =====================================================
-- Trigger: trg_notify_on_follow
-- Schema: social_features
-- Descripción: Notifica al usuario cuando recibe un nuevo seguidor
-- Estado: SEGURO - Solo notifica, no otorga recompensas
-- =====================================================

CREATE OR REPLACE FUNCTION social_features.fn_notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar al usuario seguido usando función existente
    -- CORRECCIÓN: Usar tipo 'friend_request' (existente en ENUM)
    -- ya que 'new_follower' NO existe
    PERFORM notifications.send_notification(
        NEW.followed_id,                          -- usuario que recibe seguidor
        'friend_request',                         -- tipo de notificación (ENUM existente)
        'Nuevo seguidor',                         -- título
        'Tienes un nuevo seguidor en GAMILIT',    -- mensaje
        jsonb_build_object(
            'follower_id', NEW.follower_id,
            'action', 'new_follow',
            'url', '/profile/' || NEW.follower_id
        ),
        'normal'                                  -- prioridad
    );

    -- Verificar y desbloquear achievements de seguidores
    -- NOTA: Solo desbloquea, no otorga rewards (modelo claim-to-earn)
    PERFORM gamification_system.check_and_grant_achievements(
        NEW.followed_id,
        'FOLLOWERS_COUNT',
        (SELECT COUNT(*) FROM social_features.user_follows WHERE followed_id = NEW.followed_id)::INTEGER
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_on_follow
    AFTER INSERT ON social_features.user_follows
    FOR EACH ROW
    EXECUTE FUNCTION social_features.fn_notify_on_follow();

COMMENT ON FUNCTION social_features.fn_notify_on_follow() IS
'Notifica nuevo seguidor y verifica achievements. v1.0 - Modelo claim-to-earn';
```

#### 1.2.2 trg_update_tag_usage (SEGURO)

```sql
-- =====================================================
-- Trigger: trg_update_tag_usage
-- Schema: content_management
-- Descripción: Actualiza contador de uso de tags
-- Estado: SEGURO - Solo estadísticas, no otorga recompensas
-- =====================================================

CREATE OR REPLACE FUNCTION content_management.fn_update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar uso del tag
        UPDATE content_management.tags
        SET usage_count = COALESCE(usage_count, 0) + 1,
            updated_at = gamilit.now_mexico()
        WHERE id = NEW.tag_id;

        -- Verificar achievements de clasificación
        -- NOTA: Solo desbloquea, usuario debe reclamar
        PERFORM gamification_system.check_and_grant_achievements(
            NEW.created_by,  -- asumiendo que existe esta columna
            'TAGS_USED',
            (SELECT COUNT(DISTINCT tag_id)
             FROM educational_content.content_tags
             WHERE created_by = NEW.created_by)::INTEGER
        );

    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar uso del tag
        UPDATE content_management.tags
        SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0),
            updated_at = gamilit.now_mexico()
        WHERE id = OLD.tag_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_tag_usage
    AFTER INSERT OR DELETE ON educational_content.content_tags
    FOR EACH ROW
    EXECUTE FUNCTION content_management.fn_update_tag_usage();

COMMENT ON FUNCTION content_management.fn_update_tag_usage() IS
'Actualiza contador de uso de tags y verifica achievements. v1.0';
```

### 1.3 Triggers CONDICIONALES (Usar Funciones Existentes)

#### 1.3.1 trg_notify_moderators_on_flag (CONDICIONAL)

```sql
-- =====================================================
-- Trigger: trg_notify_moderators_on_flag
-- Schema: content_management
-- Descripción: Notifica a moderadores cuando hay contenido flaggeado de alta prioridad
-- Estado: CONDICIONAL - Usa send_notification() existente
-- =====================================================

CREATE OR REPLACE FUNCTION content_management.fn_notify_moderators_on_flag()
RETURNS TRIGGER AS $$
DECLARE
    v_moderator RECORD;
BEGIN
    -- Solo notificar para flags de prioridad alta
    IF NEW.priority = 'high' THEN
        -- Obtener moderadores activos
        FOR v_moderator IN
            SELECT u.id
            FROM auth.users u
            JOIN user_management.user_roles ur ON u.id = ur.user_id
            JOIN user_management.roles r ON ur.role_id = r.id
            WHERE r.name IN ('moderator', 'admin', 'super_admin')
            AND u.is_active = true
            LIMIT 10  -- Limitar para evitar spam masivo
        LOOP
            -- CORRECCIÓN: Usar 'system_announcement' (ENUM existente)
            -- en lugar de 'moderation_alert' (no existe)
            PERFORM notifications.send_notification(
                v_moderator.id,
                'system_announcement',             -- tipo existente
                'Contenido reportado (Alta Prioridad)',
                'Hay contenido que requiere revisión urgente',
                jsonb_build_object(
                    'flagged_content_id', NEW.id,
                    'content_type', NEW.content_type,
                    'reason', NEW.reason,
                    'priority', NEW.priority,
                    'url', '/admin/moderation/' || NEW.id
                ),
                'high'                             -- prioridad de notificación
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_moderators_on_flag
    AFTER INSERT ON content_management.flagged_content
    FOR EACH ROW
    WHEN (NEW.priority = 'high')
    EXECUTE FUNCTION content_management.fn_notify_moderators_on_flag();

COMMENT ON FUNCTION content_management.fn_notify_moderators_on_flag() IS
'Notifica a moderadores sobre contenido reportado con alta prioridad. v1.0';
```

#### 1.3.2 trg_notify_reporter_on_review (CONDICIONAL)

```sql
-- =====================================================
-- Trigger: trg_notify_reporter_on_review
-- Schema: content_management
-- Descripción: Notifica al reportador cuando su reporte es revisado
-- Estado: CONDICIONAL - Usa send_notification() existente
-- =====================================================

CREATE OR REPLACE FUNCTION content_management.fn_notify_reporter_on_review()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo notificar cuando cambia el estado de pending a otro
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected', 'removed') THEN
        -- CORRECCIÓN: Usar 'system_announcement' (ENUM existente)
        PERFORM notifications.send_notification(
            NEW.reported_by,                       -- quien reportó
            'system_announcement',                 -- tipo existente
            'Tu reporte ha sido revisado',
            CASE NEW.status
                WHEN 'approved' THEN 'El contenido que reportaste fue aprobado para revisión'
                WHEN 'rejected' THEN 'Tu reporte fue revisado pero el contenido no viola las políticas'
                WHEN 'removed' THEN 'El contenido que reportaste ha sido removido. Gracias por tu ayuda.'
            END,
            jsonb_build_object(
                'flagged_content_id', NEW.id,
                'status', NEW.status,
                'reviewed_by', NEW.reviewed_by,
                'reviewed_at', NEW.reviewed_at
            ),
            'normal'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_reporter_on_review
    AFTER UPDATE OF status ON content_management.flagged_content
    FOR EACH ROW
    WHEN (OLD.status = 'pending' AND NEW.status != 'pending')
    EXECUTE FUNCTION content_management.fn_notify_reporter_on_review();

COMMENT ON FUNCTION content_management.fn_notify_reporter_on_review() IS
'Notifica al reportador sobre el resultado de su reporte. v1.0';
```

---

## SECCIÓN 2: ACHIEVEMENTS CORREGIDOS

### 2.1 Correcciones de Category

| Propuesto | CORREGIDO | Razón |
|-----------|-----------|-------|
| `'moderation'` | `'special'` | 'moderation' NO existe en ENUM |
| `'content'` | `'collection'` | 'content' NO existe en ENUM |

### 2.2 Categorías VÁLIDAS (ENUM achievement_category)

```sql
-- gamification_system.achievement_category:
-- 'progress'     -- Logros de progreso general
-- 'streak'       -- Logros de rachas consecutivas
-- 'completion'   -- Logros de completar contenido
-- 'social'       -- Logros sociales (amigos, grupos, seguidores)
-- 'special'      -- Logros especiales/eventos (usar para moderación)
-- 'mastery'      -- Logros de maestría/dominio
-- 'exploration'  -- Logros de exploración
-- 'collection'   -- Logros de colección (usar para tags, contenido)
-- 'hidden'       -- Logros ocultos/secretos
```

### 2.3 Seeds de Achievements CORREGIDOS

```sql
-- =====================================================
-- Seeds: Achievements para nuevas funcionalidades
-- Categorías: 'social' (follows), 'special' (moderación), 'collection' (tags)
-- Modelo: Claim-to-earn (rewards se otorgan via claim_achievement_reward)
-- =====================================================

-- ===== ACHIEVEMENTS DE FOLLOWS (category: social) =====

INSERT INTO gamification_system.achievements (
    id, tenant_id, name, description, icon, category, rarity,
    difficulty_level, conditions, rewards, ml_coins_reward,
    is_secret, is_active, is_repeatable, order_index, points_value,
    unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES
-- Primeros Admiradores (1 seguidor)
(
    '90000201-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Primeros Admiradores',
    'Consigue tu primer seguidor en GAMILIT',
    'user-plus',
    'social'::gamification_system.achievement_category,
    'common',
    'beginner'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'FOLLOWERS_COUNT',
        'requirements', jsonb_build_object('target', 1)
    ),
    jsonb_build_object('xp', 25, 'ml_coins', 10, 'badge', 'first_follower'),
    10,
    false, true, false, 201, 25,
    '¡Alguien te está siguiendo! Sigue creando contenido valioso.',
    'Participa activamente en la comunidad para ganar seguidores',
    ARRAY['Comparte tu progreso', 'Ayuda a otros estudiantes'],
    jsonb_build_object('feature', 'user_follow', 'demo_achievement', true),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- Influencer Emergente (10 seguidores)
(
    '90000201-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Influencer Emergente',
    'Consigue 10 seguidores en GAMILIT',
    'users',
    'social'::gamification_system.achievement_category,
    'uncommon',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'FOLLOWERS_COUNT',
        'requirements', jsonb_build_object('target', 10)
    ),
    jsonb_build_object('xp', 75, 'ml_coins', 50, 'badge', 'influencer_10'),
    50,
    false, true, false, 202, 75,
    '¡10 personas valoran tu contribución a la comunidad!',
    'Sé activo y útil para la comunidad',
    ARRAY['Responde preguntas', 'Comparte recursos útiles'],
    jsonb_build_object('feature', 'user_follow'),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- Mentor Popular (50 seguidores)
(
    '90000201-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Mentor Popular',
    'Consigue 50 seguidores que reconocen tu experiencia',
    'award',
    'social'::gamification_system.achievement_category,
    'rare',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'FOLLOWERS_COUNT',
        'requirements', jsonb_build_object('target', 50)
    ),
    jsonb_build_object('xp', 250, 'ml_coins', 150, 'badge', 'mentor_popular'),
    150,
    false, true, false, 203, 250,
    '¡Eres un referente en la comunidad GAMILIT!',
    'Mantén un perfil activo y ayuda consistentemente',
    ARRAY['Crea guías', 'Participa en foros'],
    jsonb_build_object('feature', 'user_follow'),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- Estrella GAMILIT (100 seguidores - EPIC)
(
    '90000201-0000-0000-0000-000000000004'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Estrella GAMILIT',
    'Consigue 100 seguidores - eres una estrella de la plataforma',
    'star',
    'social'::gamification_system.achievement_category,
    'epic',
    'expert'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'FOLLOWERS_COUNT',
        'requirements', jsonb_build_object('target', 100)
    ),
    jsonb_build_object('xp', 500, 'ml_coins', 300, 'badge', 'gamilit_star', 'title', 'Estrella GAMILIT'),
    300,
    false, true, false, 204, 500,
    '¡Eres una ESTRELLA de GAMILIT! 100 personas te siguen.',
    'Sé un ejemplo para la comunidad',
    ARRAY['Lidera iniciativas', 'Inspira a otros'],
    jsonb_build_object('feature', 'user_follow', 'grants_title', true),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- ===== ACHIEVEMENTS DE MODERACIÓN (category: special) =====
-- NOTA: Usar 'special' porque 'moderation' NO existe en ENUM

-- Vigilante Ciudadano (10 reportes válidos)
(
    '90000202-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Vigilante Ciudadano',
    'Realiza 10 reportes de contenido que resulten válidos',
    'shield-check',
    'special'::gamification_system.achievement_category,  -- CORREGIDO: era 'moderation'
    'uncommon',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'VALID_REPORTS',
        'requirements', jsonb_build_object('target', 10)
    ),
    jsonb_build_object('xp', 50, 'ml_coins', 25, 'badge', 'vigilante'),
    25,
    false, true, false, 220, 50,
    '¡Gracias por mantener la comunidad segura!',
    'Reporta contenido que viole las políticas',
    ARRAY['Lee las políticas de contenido', 'Reporta solo violaciones reales'],
    jsonb_build_object('feature', 'flagged_content', 'moderation_related', true),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- Moderador de Confianza (50 reportes resueltos - para moderadores)
(
    '90000202-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Moderador de Confianza',
    'Resuelve 50 reportes de contenido como moderador',
    'shield-star',
    'special'::gamification_system.achievement_category,  -- CORREGIDO
    'rare',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'MODERATION_REVIEWS',
        'requirements', jsonb_build_object('target', 50),
        'requires_role', 'moderator'
    ),
    jsonb_build_object('xp', 200, 'ml_coins', 100, 'badge', 'trusted_mod'),
    100,
    false, true, false, 221, 200,
    '¡Eres un moderador de confianza para GAMILIT!',
    'Revisa reportes de forma justa y consistente',
    ARRAY['Aplica las políticas uniformemente', 'Documenta tus decisiones'],
    jsonb_build_object('feature', 'moderation_rule', 'requires_moderator', true),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- ===== ACHIEVEMENTS DE TAGS (category: collection) =====

-- Catalogador (Usar 10 tags diferentes)
(
    '90000203-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Catalogador',
    'Usa 10 tags diferentes para clasificar contenido',
    'tags',
    'collection'::gamification_system.achievement_category,  -- CORREGIDO: era 'content'
    'common',
    'beginner'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'TAGS_USED',
        'requirements', jsonb_build_object('target', 10)
    ),
    jsonb_build_object('xp', 50, 'ml_coins', 25, 'badge', 'cataloger'),
    25,
    false, true, false, 230, 50,
    '¡Excelente trabajo clasificando contenido!',
    'Aplica tags relevantes al contenido que crees o edites',
    ARRAY['Usa tags específicos', 'Revisa los tags existentes antes de crear nuevos'],
    jsonb_build_object('feature', 'tag'),
    gamilit.now_mexico(), gamilit.now_mexico()
),

-- Experto en Clasificación (Usar 9 categorías de tags)
(
    '90000203-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Experto en Clasificación',
    'Usa tags de las 9 categorías diferentes',
    'folder-tree',
    'collection'::gamification_system.achievement_category,
    'rare',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'TAG_CATEGORIES_USED',
        'requirements', jsonb_build_object('target', 9)
    ),
    jsonb_build_object('xp', 150, 'ml_coins', 75, 'badge', 'classification_expert'),
    75,
    false, true, false, 231, 150,
    '¡Dominas todas las categorías de clasificación!',
    'Explora contenido de diferentes áreas',
    ARRAY['Trabaja en proyectos diversos', 'Colabora con otros usuarios'],
    jsonb_build_object('feature', 'tag', 'all_categories', true),
    gamilit.now_mexico(), gamilit.now_mexico()
)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    conditions = EXCLUDED.conditions,
    rewards = EXCLUDED.rewards,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    category = EXCLUDED.category,
    updated_at = gamilit.now_mexico();
```

---

## SECCIÓN 3: NOTIFICATION TYPES CORREGIDOS

### 3.1 Tipos Propuestos vs Corregidos

| Propuesto (NO EXISTE) | CORREGIDO (ENUM existente) | Razón |
|-----------------------|----------------------------|-------|
| `'moderation_alert'` | `'system_announcement'` | Para alertas de moderación |
| `'new_follower'` | `'friend_request'` | Más cercano semánticamente |
| `'content_flagged'` | `'system_announcement'` | Usar genérico de sistema |
| `'report_resolved'` | `'system_announcement'` | Usar genérico de sistema |

### 3.2 ENUM Notification Types VÁLIDOS

```sql
-- gamification_system.notification_type (11 tipos):
-- 'achievement_unlocked'   -- Logro desbloqueado
-- 'rank_up'                -- Subida de rango maya
-- 'friend_request'         -- Solicitud de amistad (usar para follows)
-- 'guild_invitation'       -- Invitación a equipo/guild
-- 'mission_completed'      -- Misión completada
-- 'level_up'               -- Subida de nivel
-- 'message_received'       -- Mensaje recibido
-- 'system_announcement'    -- Anuncio del sistema (usar para moderación)
-- 'ml_coins_earned'        -- ML Coins ganadas
-- 'streak_milestone'       -- Hito de racha alcanzado
-- 'exercise_feedback'      -- Retroalimentación de ejercicio
```

---

## SECCIÓN 4: RESUMEN DE CORRECCIONES

### 4.1 Triggers a Implementar

| Trigger | Estado | Archivo Destino |
|---------|--------|-----------------|
| `trg_notify_on_follow` | ✅ IMPLEMENTAR | `social_features/triggers/trg_notify_on_follow.sql` |
| `trg_update_tag_usage` | ✅ IMPLEMENTAR | `content_management/triggers/trg_update_tag_usage.sql` |
| `trg_notify_moderators_on_flag` | ✅ IMPLEMENTAR | `content_management/triggers/trg_notify_moderators_on_flag.sql` |
| `trg_notify_reporter_on_review` | ✅ IMPLEMENTAR | `content_management/triggers/trg_notify_reporter_on_review.sql` |
| ~~trg_award_moderation_xp~~ | ❌ ELIMINADO | N/A (viola claim-to-earn) |
| ~~trg_award_follow_xp~~ | ❌ ELIMINADO | N/A (viola claim-to-earn) |
| ~~trg_check_follower_milestone~~ | ❌ ELIMINADO | N/A (viola claim-to-earn) |

### 4.2 Achievements a Crear

| ID | Nombre | Categoría | Feature |
|----|--------|-----------|---------|
| 90000201-...-001 | Primeros Admiradores | social | user_follow |
| 90000201-...-002 | Influencer Emergente | social | user_follow |
| 90000201-...-003 | Mentor Popular | social | user_follow |
| 90000201-...-004 | Estrella GAMILIT | social | user_follow |
| 90000202-...-001 | Vigilante Ciudadano | special | flagged_content |
| 90000202-...-002 | Moderador de Confianza | special | moderation_rule |
| 90000203-...-001 | Catalogador | collection | tag |
| 90000203-...-002 | Experto en Clasificación | collection | tag |

### 4.3 Event Types para check_and_grant_achievements

Los siguientes event types deben agregarse a la función existente:

```sql
-- Agregar a CASE en check_and_grant_achievements:
WHEN 'FOLLOWERS_COUNT' THEN
    v_condition_met := (
        SELECT COUNT(*) FROM social_features.user_follows
        WHERE followed_id = p_user_id
    ) >= v_condition_value;

WHEN 'VALID_REPORTS' THEN
    v_condition_met := (
        SELECT COUNT(*) FROM content_management.flagged_content
        WHERE reported_by = p_user_id
        AND status IN ('approved', 'removed')
    ) >= v_condition_value;

WHEN 'MODERATION_REVIEWS' THEN
    v_condition_met := (
        SELECT COUNT(*) FROM content_management.flagged_content
        WHERE reviewed_by = p_user_id
        AND status != 'pending'
    ) >= v_condition_value;

WHEN 'TAGS_USED' THEN
    v_condition_met := (
        SELECT COUNT(DISTINCT tag_id) FROM educational_content.content_tags
        WHERE created_by = p_user_id
    ) >= v_condition_value;

WHEN 'TAG_CATEGORIES_USED' THEN
    v_condition_met := (
        SELECT COUNT(DISTINCT t.category)
        FROM educational_content.content_tags ct
        JOIN content_management.tags t ON ct.tag_id = t.id
        WHERE ct.created_by = p_user_id
    ) >= v_condition_value;
```

---

## SECCIÓN 5: CHECKLIST DE IMPLEMENTACIÓN

### 5.1 Pre-Implementación

- [ ] Verificar que `notifications.send_notification()` existe y funciona
- [ ] Verificar que `gamification_system.check_and_grant_achievements()` existe
- [ ] Verificar que columna `created_by` existe en `educational_content.content_tags`
- [ ] Verificar ENUMs no han cambiado desde esta auditoría

### 5.2 Implementación DDL

- [ ] Crear trigger `trg_notify_on_follow`
- [ ] Crear trigger `trg_update_tag_usage`
- [ ] Crear trigger `trg_notify_moderators_on_flag`
- [ ] Crear trigger `trg_notify_reporter_on_review`
- [ ] Agregar event types a `check_and_grant_achievements`
- [ ] Insertar 8 seeds de achievements

### 5.3 Implementación Backend

- [ ] Crear UserFollowsService
- [ ] Crear UserFollowsController
- [ ] Crear FlaggedContentService
- [ ] Crear FlaggedContentController
- [ ] Crear ModerationRuleService
- [ ] Crear ModerationRuleController
- [ ] Crear TagService
- [ ] Crear TagController

### 5.4 Validación

- [ ] Tests unitarios para services
- [ ] Tests e2e para endpoints
- [ ] Verificar que achievements se desbloquean correctamente
- [ ] Verificar que notificaciones llegan correctamente
- [ ] Verificar modelo claim-to-earn funciona

---

## REFERENCIAS

### Funciones Existentes a Reutilizar

| Función | Schema | Descripción |
|---------|--------|-------------|
| `send_notification()` | notifications | Envía notificación multicanal |
| `award_ml_coins()` | gamification_system | Otorga ML Coins con multiplicador |
| `check_and_grant_achievements()` | gamification_system | Verifica y desbloquea achievements |
| `claim_achievement_reward()` | gamification_system | Reclama recompensas de achievement |

### Documentación Relacionada

- `VALIDACION-INTEGRACION-COMPLETA-2026-01-16.md` - Análisis original
- `ANALISIS-IMPLEMENTACION-ENTITIES-PENDIENTES-2026-01-16.md` - Plan de implementación
- `AUDITORIA-COMPARATIVA-WORKSPACES-2026-01-16.md` - Comparación de workspaces

---

*Auditoría de purga realizada por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Fecha: 2026-01-16*
