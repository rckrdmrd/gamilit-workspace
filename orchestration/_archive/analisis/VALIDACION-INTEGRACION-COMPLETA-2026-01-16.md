# VALIDACIÓN: Integración Completa de Entities Pendientes
# ============================================================================

**Fecha:** 2026-01-16
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0
**Proyecto:** GAMILIT
**Tipo:** Validación de Duplicidad + Integraciones + Seeds + Triggers

---

## RESUMEN EJECUTIVO

### Resultado de Validación de Duplicidad

| Entity | ¿Duplicado? | Objeto Existente | Decisión |
|--------|-------------|------------------|----------|
| **FlaggedContent** | PARCIAL | AdminDashboardService ya usa | ✅ IMPLEMENTAR Service/Controller |
| **ModerationRule** | NO | Solo DDL + Triggers BD | ✅ IMPLEMENTAR Service/Controller |
| **Tag** | NO | ContentCategory es diferente | ✅ IMPLEMENTAR (complementario) |
| **UserFollow** | NO | Friendship es bidireccional | ✅ IMPLEMENTAR (unidireccional) |
| **LTI (3)** | NO | N/A | ⏸️ DIFERIDO (OUT OF MVP) |
| **ContentVersion** | NO | N/A | ⏸️ DIFERIDO |
| **MediaMetadata** | NO | N/A | ⏸️ DIFERIDO |

### Estado de Infraestructura

| Componente | Existente | Faltante |
|------------|-----------|----------|
| **DDL (Tablas)** | 9/9 (100%) | 0 |
| **Entities Backend** | 9/9 (100%) | 0 |
| **Services Backend** | 0/9 (0%) | 9 |
| **Controllers Backend** | 0/9 (0%) | 9 |
| **Seeds Críticos** | 4/8 (50%) | 4 |
| **Triggers Específicos** | 8/22 (36%) | 14 |
| **Funciones Helper** | 10/22 (45%) | 12 |

---

## VALIDACIÓN DE DUPLICIDAD DETALLADA

### 1. FlaggedContent - PARCIALMENTE IMPLEMENTADO

**Estado Actual:**
```
Entity:     ✅ Existe (content/entities/flagged-content.entity.ts)
DDL:        ✅ Existe (content_management.flagged_content)
Triggers:   ✅ trg_auto_moderate (BD activo)
Functions:  ✅ apply_moderation_rules(), check_keyword_rule()
Vista:      ✅ admin_dashboard.moderation_queue
Service:    ❌ NO EXISTE
Controller: ❌ NO EXISTE
```

**USO ACTUAL DETECTADO:**
- `AdminDashboardService.getModerationQueue()` - YA CONSULTA flagged_content
- `ContentStatsService.getFlaggedContentCount()` - YA CUENTA flags
- `admin_dashboard.moderation_queue` - Vista SQL activa

**Decisión:** IMPLEMENTAR Service/Controller para exponer funcionalidad vía REST API

**Endpoints Requeridos:**
```
POST   /api/v1/content/flag                    # Reportar contenido
GET    /api/v1/admin/moderation/queue          # Cola de moderación
PATCH  /api/v1/admin/moderation/:id/review     # Aprobar/Rechazar
GET    /api/v1/admin/moderation/stats          # Estadísticas
```

---

### 2. ModerationRule - SIN DUPLICADO

**Estado Actual:**
```
Entity:     ✅ Existe
DDL:        ✅ Existe (content_management.moderation_rules)
Seeds:      ✅ 11 reglas básicas
Triggers:   ✅ trg_auto_moderate (usa las reglas)
Functions:  ✅ apply_moderation_rules() ACTIVA
Service:    ❌ NO EXISTE
Controller: ❌ NO EXISTE
```

**Decisión:** IMPLEMENTAR Service/Controller para gestión de reglas

**Endpoints Requeridos:**
```
GET    /api/v1/admin/moderation/rules          # Listar reglas
POST   /api/v1/admin/moderation/rules          # Crear regla
PATCH  /api/v1/admin/moderation/rules/:id      # Actualizar
DELETE /api/v1/admin/moderation/rules/:id      # Eliminar
POST   /api/v1/admin/moderation/rules/:id/test # Probar regla
```

---

### 3. Tag - COMPLEMENTARIO (NO DUPLICADO)

**Diferencia con ContentCategory:**

| Aspecto | ContentCategory | Tag |
|---------|-----------------|-----|
| Estructura | JERÁRQUICA (parent-child) | PLANA (catálogo) |
| Propósito | Organización/navegación | Clasificación/búsqueda |
| Relación | 1:N con contenido | M:N con contenido |
| Service | ✅ ContentCategoriesService | ❌ NO EXISTE |

**Estado Actual:**
```
Entity:     ✅ Existe
DDL:        ✅ Existe (content_management.tags)
Seeds:      ✅ 41 tags en 9 categorías
Tabla M:N:  ✅ educational_content.content_tags
Service:    ❌ NO EXISTE
Controller: ❌ NO EXISTE
```

**Decisión:** IMPLEMENTAR Service/Controller (sistema diferente a Categories)

---

### 4. UserFollow - ÚNICO (NO DUPLICADO)

**Diferencia con Friendship:**

| Aspecto | Friendship | UserFollow |
|---------|-----------|------------|
| Tipo | BIDIRECCIONAL | UNIDIRECCIONAL |
| Aceptación | Requiere aceptación | Sin aceptación |
| Estados | pending/accepted/rejected/blocked | Solo existe o no |
| Service | ✅ FriendshipsService (10 endpoints) | ❌ NO EXISTE |
| UI | ✅ Botones Add/Accept/Reject | ❌ NO EXISTE |

**Estado Actual:**
```
Entity:     ✅ Existe
DDL:        ✅ Existe (social_features.user_follows)
RLS:        ✅ Configurado
Service:    ❌ NO EXISTE
Controller: ❌ NO EXISTE
Frontend:   ❌ NO EXISTE
```

**Decisión:** IMPLEMENTAR Service/Controller (funcionalidad social diferente)

---

## INTEGRACIONES CON GAMIFICACIÓN

### Matriz de Integraciones Requeridas

| Entity | XP Directo | ML Coins | Achievements | Missions | Triggers BD |
|--------|-----------|----------|--------------|----------|-------------|
| FlaggedContent | ✅ 10-50 XP | ❌ | 3 nuevos | 2 | 3 |
| ModerationRule | ❌ | ❌ | 0 | 0 | 0 |
| Tag | ❌ | ❌ | 3 nuevos | 2 | 2 |
| UserFollow | ✅ 5 XP/seguidor | ✅ Hitos | 4 nuevos | 2 | 3 |
| LTI (3) | ✅ 15+ XP | ✅ 25+ coins | 7 nuevos | 3 | 5 |
| ContentVersion | ✅ 25-50 XP | ❌ | 3 nuevos | 2 | 3 |
| MediaMetadata | ⚪ Opcional | ❌ | 0-1 | 0-1 | 1 |

### Achievements a Crear (20 nuevos)

```yaml
# FlaggedContent (3)
- vigilante_ciudadano_1: "10 reportes válidos" → 50 XP + 25 ML Coins
- moderador_confianza: "50 reportes resueltos" → 200 XP + 100 ML Coins
- respuesta_rapida: "10 reportes <2h" → 100 XP + 50 ML Coins

# Tag (3)
- catalogador: "Usar 10 tags diferentes" → 50 XP + 25 ML Coins
- experto_clasificacion: "Usar 9 categorías" → 150 XP + 75 ML Coins
- etiquetador_conocimiento: "50 usos de tags" → 100 XP + 50 ML Coins

# UserFollow (4)
- influencer_emergente: "10 seguidores" → 75 XP + 50 ML Coins
- mentor_popular: "50 seguidores" → 250 XP + 150 ML Coins
- estrella_gamilit: "100 seguidores" → 500 XP + 300 ML Coins (epic)
- primeros_admiradores: "1 seguidor" → 25 XP + 10 ML Coins

# LTI (7 - cuando se implemente)
- puente_educativo: "Crear LTI consumer" → 150 XP + 75 ML Coins
- integrador_exitoso: "3 consumers verified" → 200 XP + 100 ML Coins
- lti_master: "10 LMS integradas" → 500 XP + 250 ML Coins (epic)
- estudiante_conectado: "5 sesiones LTI" → 100 XP + 50 ML Coins
- hibrido_digital: "Plataforma + LMS" → 75 XP + 40 ML Coins
- sincronizador_perfecto: "10 passbacks ok" → 100 XP + 50 ML Coins
- integracion_fluida: "100 passbacks sin error" → 200 XP + 100 ML Coins

# ContentVersion (3)
- autor_prolifico: "10 versiones" → 150 XP + 75 ML Coins
- editor_experto: "50 versiones publicadas" → 300 XP + 150 ML Coins
- perfeccionista_contenido: "100 versiones" → 500 XP + 250 ML Coins (epic)
```

---

## SEEDS REQUERIDOS

### Seeds Críticos Faltantes (Crear Inmediatamente)

```yaml
# 1. FlaggedContent Demo (P1)
Archivo: seeds/dev/content_management/10-flagged-content-demo.sql
Contenido:
  - 5 reportes con diferentes estados (PENDING, APPROVED, REJECTED, REMOVED)
  - Mix de prioridades (HIGH, MEDIUM, LOW)
  - Diferentes razones ("Contenido ofensivo", "Spam", "Plagio")
  - Algunos con revisión, otros pendientes

# 2. UserFollow Demo (P1)
Archivo: seeds/dev/social_features/05-user-follows-demo.sql
Contenido:
  - 10-15 relaciones UNIDIRECCIONALES
  - Diferentes usuarios con varios seguidores
  - Patrón asimétrico (A→B, B→C, C→A)

# 3. ContentVersion Demo (P2)
Archivo: seeds/dev/content_management/06-content-versions-demo.sql
Contenido:
  - 3-5 ejercicios con historial de versiones
  - v1.0 → v1.1 → v2.0 con change_notes
  - Diferentes creadores

# 4. MediaMetadata Demo (P2)
Archivo: seeds/dev/content_management/05-media-metadata-demo.sql
Contenido:
  - Metadatos para los 6 media files existentes
  - Dimensiones, duración, codec, thumbnails
```

### Seeds Opcionales (Nice-to-Have)

```yaml
# Achievements de Moderación
Archivo: seeds/dev/gamification_system/15-achievements-moderation.sql

# Achievements Sociales Expandidos
Archivo: seeds/dev/gamification_system/16-achievements-social.sql

# Missions de Moderación
Archivo: seeds/dev/gamification_system/11-mission-templates-moderation.sql

# Missions Sociales
Archivo: seeds/dev/gamification_system/12-mission-templates-social.sql
```

---

## TRIGGERS REQUERIDOS

### Triggers Faltantes Críticos (14 total)

```sql
-- ==========================================
-- CONTENT_MANAGEMENT
-- ==========================================

-- 1. FlaggedContent: Notificar moderadores
CREATE OR REPLACE FUNCTION content_management.notify_moderators_on_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear notificación para moderadores activos
  INSERT INTO notifications.notifications (user_id, type, title, message)
  SELECT p.id, 'moderation_alert', 'Nuevo contenido reportado',
         'Hay contenido pendiente de revisión'
  FROM auth_management.profiles p
  JOIN auth_management.user_roles ur ON p.id = ur.user_id
  JOIN auth_management.roles r ON ur.role_id = r.id
  WHERE r.name IN ('admin', 'moderator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_moderators_on_flag
  AFTER INSERT ON content_management.flagged_content
  FOR EACH ROW
  EXECUTE FUNCTION content_management.notify_moderators_on_flag();

-- 2. FlaggedContent: Award XP al moderador
CREATE OR REPLACE FUNCTION content_management.award_moderation_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected', 'removed')
     AND OLD.status = 'pending'
     AND NEW.reviewed_by IS NOT NULL THEN
    -- Award 25 XP al moderador
    UPDATE gamification_system.user_stats
    SET xp_total = xp_total + 25
    WHERE user_id = NEW.reviewed_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_award_moderation_xp
  AFTER UPDATE ON content_management.flagged_content
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected', 'removed'))
  EXECUTE FUNCTION content_management.award_moderation_xp();

-- 3. FlaggedContent: Notificar al reportador
CREATE OR REPLACE FUNCTION content_management.notify_reporter_on_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications.notifications (
    user_id, type, title, message, related_entity_type, related_entity_id
  ) VALUES (
    NEW.reported_by, 'moderation_result', 'Tu reporte ha sido revisado',
    CASE NEW.status
      WHEN 'approved' THEN 'El contenido fue aprobado y permitido'
      WHEN 'rejected' THEN 'El contenido fue marcado como inapropiado'
      WHEN 'removed' THEN 'El contenido fue removido'
    END,
    'flagged_content', NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_reporter_on_review
  AFTER UPDATE ON content_management.flagged_content
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected', 'removed'))
  EXECUTE FUNCTION content_management.notify_reporter_on_review();

-- ==========================================
-- SOCIAL_FEATURES
-- ==========================================

-- 4. UserFollow: Award XP al seguido
CREATE OR REPLACE FUNCTION social_features.award_follow_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 5 XP al usuario que recibe el seguidor
  UPDATE gamification_system.user_stats
  SET xp_total = xp_total + 5
  WHERE user_id = NEW.following_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_award_follow_xp
  AFTER INSERT ON social_features.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION social_features.award_follow_xp();

-- 5. UserFollow: Verificar hitos de seguidores
CREATE OR REPLACE FUNCTION social_features.check_follower_milestone()
RETURNS TRIGGER AS $$
DECLARE
  follower_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO follower_count
  FROM social_features.user_follows
  WHERE following_id = NEW.following_id;

  -- Award ML Coins por hitos
  IF follower_count = 10 THEN
    PERFORM gamification_system.award_ml_coins(NEW.following_id, 50, 'milestone_10_followers');
  ELSIF follower_count = 50 THEN
    PERFORM gamification_system.award_ml_coins(NEW.following_id, 200, 'milestone_50_followers');
  ELSIF follower_count = 100 THEN
    PERFORM gamification_system.award_ml_coins(NEW.following_id, 500, 'milestone_100_followers');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_follower_milestone
  AFTER INSERT ON social_features.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION social_features.check_follower_milestone();

-- 6. UserFollow: Notificar al seguido
CREATE OR REPLACE FUNCTION social_features.notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications.notifications (
    user_id, type, title, message, related_entity_type, related_entity_id
  ) VALUES (
    NEW.following_id, 'new_follower', 'Tienes un nuevo seguidor',
    (SELECT COALESCE(full_name, username, email) FROM auth_management.profiles WHERE id = NEW.follower_id) || ' comenzó a seguirte',
    'user_follow', NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_follow
  AFTER INSERT ON social_features.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION social_features.notify_on_follow();

-- ==========================================
-- TAG USAGE COUNT (Cross-Schema)
-- ==========================================

-- 7-8. Tag: Actualizar usage_count
CREATE OR REPLACE FUNCTION content_management.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content_management.tags
    SET usage_count = usage_count + 1
    WHERE tag_slug = NEW.tag;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content_management.tags
    SET usage_count = usage_count - 1
    WHERE tag_slug = OLD.tag;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger en educational_content.content_tags
CREATE TRIGGER trg_update_tag_usage
  AFTER INSERT OR DELETE ON educational_content.content_tags
  FOR EACH ROW
  EXECUTE FUNCTION content_management.update_tag_usage_count();
```

### Triggers LTI (Cuando se implemente - 5 adicionales)

```sql
-- 9. LTI: Auto-crear grade passback
-- 10. LTI: Queue retry con backoff
-- 11. LTI: Reset retry on success
-- 12. LTI: Cleanup expired sessions
-- 13. LTI: Sync grades on launch

-- 14. ContentVersion: Auto-version on update
```

---

## PLAN DE IMPLEMENTACIÓN ACTUALIZADO

### Fase 1: CRÍTICO (Sprint 1) - 16 horas

| Tarea | Tiempo | Dependencias |
|-------|--------|--------------|
| FlaggedContentService + Controller | 4h | Ninguna |
| ModerationRuleService + Controller | 4h | Ninguna |
| Seeds: flagged-content-demo.sql | 1h | Service |
| Triggers: notify_moderators, award_xp | 2h | Service |
| Tests unitarios P1 | 3h | Services |
| Documentación Swagger | 2h | Controllers |

**Archivos a crear:**
```
modules/content/services/flagged-content.service.ts
modules/content/controllers/flagged-content.controller.ts
modules/content/services/moderation-rules.service.ts
modules/content/controllers/moderation-rules.controller.ts
modules/content/dto/flagged-content/
modules/content/dto/moderation-rules/
```

**DDL a ejecutar:**
```
ddl/schemas/content_management/triggers/04-trg_notify_moderators.sql
ddl/schemas/content_management/triggers/05-trg_award_moderation_xp.sql
ddl/schemas/content_management/triggers/06-trg_notify_reporter.sql
seeds/dev/content_management/10-flagged-content-demo.sql
```

### Fase 2: ALTO (Sprint 2) - 12 horas

| Tarea | Tiempo | Dependencias |
|-------|--------|--------------|
| TagService + Controller | 3h | Ninguna |
| UserFollowsService + Controller | 4h | Ninguna |
| Seeds: user-follows-demo.sql | 1h | Service |
| Triggers: tag_usage, follow_xp | 2h | Services |
| Tests unitarios P2 | 2h | Services |

**Archivos a crear:**
```
modules/content/services/tags.service.ts
modules/content/controllers/tags.controller.ts
modules/social/services/user-follows.service.ts
modules/social/controllers/user-follows.controller.ts
```

**DDL a ejecutar:**
```
ddl/schemas/social_features/triggers/27-trg_follow_xp.sql
ddl/schemas/social_features/triggers/28-trg_follower_milestone.sql
ddl/schemas/social_features/triggers/29-trg_notify_follow.sql
ddl/schemas/content_management/triggers/07-trg_tag_usage.sql
seeds/dev/social_features/05-user-follows-demo.sql
```

### Fase 3: Gamificación (Sprint 3) - 8 horas

| Tarea | Tiempo | Dependencias |
|-------|--------|--------------|
| Seeds: achievements moderación | 2h | Fase 1 |
| Seeds: achievements social | 2h | Fase 2 |
| Seeds: missions moderación/social | 2h | Achievements |
| Verificar triggers achievement | 2h | Seeds |

**DDL a ejecutar:**
```
seeds/dev/gamification_system/15-achievements-moderation.sql
seeds/dev/gamification_system/16-achievements-social.sql
seeds/dev/gamification_system/11-mission-templates-moderation.sql
seeds/dev/gamification_system/12-mission-templates-social.sql
```

### Fase 4: DIFERIDO (Cuando se requiera)

| Tarea | Tiempo | Trigger |
|-------|--------|---------|
| ContentVersion Service/Controller | 4h | Cuando se use versionado |
| MediaMetadata Service/Controller | 4h | Cuando se procese multimedia |
| LTI completo (3 entities) | 40h | Cuando se active EXT-007 |

---

## CHECKLIST DE VALIDACIÓN

### Pre-Implementación
- [x] Verificar que no hay duplicados
- [x] Identificar integraciones con gamificación
- [x] Identificar seeds faltantes
- [x] Identificar triggers faltantes
- [ ] Crear DDL para triggers
- [ ] Crear seeds de demo

### Implementación Fase 1
- [ ] FlaggedContentService creado
- [ ] FlaggedContentController creado
- [ ] ModerationRulesService creado
- [ ] ModerationRulesController creado
- [ ] Triggers de notificación creados
- [ ] Triggers de XP creados
- [ ] Seeds de demo insertados
- [ ] Tests pasando

### Implementación Fase 2
- [ ] TagService creado
- [ ] TagController creado
- [ ] UserFollowsService creado
- [ ] UserFollowsController creado
- [ ] Triggers de usage_count creados
- [ ] Triggers de follows creados
- [ ] Seeds de demo insertados
- [ ] Tests pasando

### Post-Implementación
- [ ] `npm run build` PASSED
- [ ] `npm run lint` PASSED
- [ ] BACKEND_INVENTORY.yml actualizado
- [ ] TABLE-ENTITY-MAP.yml actualizado
- [ ] Swagger documentado
- [ ] Seeds en staging/prod

---

## CONCLUSIÓN

### Resumen de Hallazgos

1. **NO hay duplicados reales** - Todos los entities son únicos o complementarios
2. **FlaggedContent y ModerationRule son P1** - Dashboard admin ya los usa
3. **20 achievements nuevos** requeridos para gamificación completa
4. **14 triggers** a crear para automatización
5. **4 seeds críticos** a crear para testing

### Esfuerzo Total

| Fase | Horas | Prioridad |
|------|-------|-----------|
| Fase 1 (Moderación) | 16h | P1 CRÍTICO |
| Fase 2 (Tags + Social) | 12h | P2 ALTO |
| Fase 3 (Gamificación) | 8h | P2 ALTO |
| Fase 4 (Diferido) | 48h | P3-P4 |
| **TOTAL** | **84h** | |

### Próximos Pasos

1. Crear DDL de triggers (4h)
2. Crear seeds de demo (2h)
3. Implementar Fase 1 (16h)
4. Validar con tests (4h)

---

*Validación realizada por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Fecha: 2026-01-16*
