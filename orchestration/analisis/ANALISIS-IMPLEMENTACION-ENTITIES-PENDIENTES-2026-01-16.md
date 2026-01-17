# ANÁLISIS: Implementación de Entities Pendientes
# ============================================================================

**Fecha:** 2026-01-16
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0
**Proyecto:** GAMILIT
**Tipo:** Análisis Detallado con Plan de Implementación

---

## RESUMEN EJECUTIVO

### Issues Identificados: 9 Entities sin Service/Controller

| # | Entity | Módulo | DDL | Seeds | Uso Actual | Requiere Impl. |
|---|--------|--------|-----|-------|------------|----------------|
| 1 | UserFollow | SOCIAL | ✅ | ❌ | Ninguno | ✅ P2 |
| 2 | LtiConsumer | LTI | ✅ | ✅ | Ninguno | ✅ P3* |
| 3 | LtiSession | LTI | ✅ | ❌ | Ninguno | ✅ P3* |
| 4 | LtiGradePassback | LTI | ✅ | ❌ | Ninguno | ✅ P3* |
| 5 | ContentVersion | CONTENT | ✅ | ❌ | Ninguno | ⚪ P4 |
| 6 | FlaggedContent | CONTENT | ✅ | ❌ | **Dashboard** | ✅ P1 |
| 7 | MediaMetadata | CONTENT | ✅ | ❌ | Ninguno | ⚪ P4 |
| 8 | Tag | CONTENT | ✅ | ✅ 60+ | Ninguno | ✅ P2 |
| 9 | ModerationRule | CONTENT | ✅ | ✅ 11 | **Trigger BD** | ✅ P1 |

**Leyenda:**
- ✅ = Requiere implementación
- ⚪ = Puede diferirse
- P1-P4 = Prioridad (P1 crítico, P4 diferible)
- *LTI está marcado OUT OF MVP pero tiene infraestructura completa

### Decisiones Clave

1. **FlaggedContent y ModerationRule** son CRÍTICOS (P1) - Dashboard admin ya los usa
2. **LTI completo** está fuera del MVP actual pero tiene infraestructura lista
3. **UserFollow y Tag** tienen valor pero pueden esperar al sprint siguiente
4. **ContentVersion y MediaMetadata** pueden diferirse hasta que el pipeline de contenido esté completo

---

## ANÁLISIS DETALLADO POR ENTITY

### 1. UserFollow (SOCIAL)

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ social_features.user_follows
Triggers: ❌ Ninguno
Funciones: ❌ Ninguna
Seeds: ❌ Ninguno
Service: ❌ FALTA
Controller: ❌ FALTA
RLS: ✅ Configurado
```

#### Funcionalidad Similar Existente
- **FriendshipService** maneja relaciones bidireccionales (amistades)
- **UserFollow** es para seguimiento UNIDIRECCIONAL (como Twitter/Instagram)
- **NO son equivalentes** - UserFollow es funcionalidad nueva y distinta

#### Integraciones Necesarias
| Integración | Requerida | Justificación |
|-------------|-----------|---------------|
| Gamificación (XP) | ❌ NO | Evitar gamificar interacciones orgánicas |
| Notificaciones | ⚪ OPCIONAL | "X comenzó a seguirte" - fase 2 |
| Activity Feed | ⚪ OPCIONAL | Mostrar actividades de seguidos |

#### ¿Requiere Implementación?
**SÍ - Prioridad P2**

La entity existe pero es INUTILIZABLE sin service/controller. Endpoints necesarios:
- `POST /api/v1/social/users/:userId/follow/:targetUserId`
- `DELETE /api/v1/social/users/:userId/follow/:targetUserId`
- `GET /api/v1/social/users/:userId/followers`
- `GET /api/v1/social/users/:userId/following`
- `GET /api/v1/social/users/:userId/followers/count`
- `GET /api/v1/social/users/:userId/following/count`

#### DDL Adicional Requerido
```sql
-- No se requiere DDL adicional
-- Tabla y RLS ya existen
-- NO crear triggers de gamificación (decisión de diseño)
```

---

### 2-4. LTI Module (3 Entities)

#### Estado Actual
```yaml
LtiConsumer:
  Entity: ✅ Completa
  DDL: ✅ lti_integration.lti_consumers
  Seeds: ✅ Configuración placeholder

LtiSession:
  Entity: ✅ Completa
  DDL: ✅ lti_integration.lti_sessions
  Seeds: ❌ Ninguno

LtiGradePassback:
  Entity: ✅ Completa
  DDL: ✅ lti_integration.lti_grade_passback
  Seeds: ❌ Ninguno

Services: ❌ NINGUNO
Controllers: ❌ NINGUNO
Datasource Config: ❌ FALTA EN app.module.ts
```

#### Estado del Epic EXT-007
```yaml
Nombre: "LTI Integration"
Estado: "BACKLOG - OUT OF MVP"
Razón: "Depende de contratos enterprise"
Completado: 40% (solo entities y DDL)
Presupuesto: $12,000 MXN
Story Points: 45 SP
```

#### Bloqueadores Críticos
1. **Datasource 'lti' NO configurado** en app.module.ts
2. **Módulo NO importado** en app.module.ts
3. Sin services/controllers, la infraestructura es inútil

#### Integraciones Necesarias
| Integración | Requerida | Justificación |
|-------------|-----------|---------------|
| Auth (OIDC) | ✅ CRÍTICO | Login desde LMS |
| Gamificación | ⚪ DISEÑAR | ¿XP por ejercicios vía LTI? |
| Grades (AGS) | ✅ CRÍTICO | Enviar calificaciones al LMS |

#### ¿Requiere Implementación?
**SÍ pero DIFERIDO - Prioridad P3 (OUT OF MVP)**

El módulo LTI está completo en infraestructura pero fuera del alcance del MVP actual. Cuando se active:

1. Agregar datasource 'lti' a app.module.ts
2. Implementar LtiAuthService (OIDC flow)
3. Implementar LtiGradePassbackService (AGS)
4. Implementar controllers para endpoints

#### DDL Adicional Requerido (Cuando se implemente)
```sql
-- Trigger para crear grade passback automáticamente
CREATE OR REPLACE FUNCTION lti_integration.create_grade_passback_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si hay sesión LTI activa para este usuario
  INSERT INTO lti_integration.lti_grade_passback (...)
  SELECT ...
  FROM lti_integration.lti_sessions
  WHERE user_id = NEW.user_id AND is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar cola de grade passback
CREATE OR REPLACE FUNCTION lti_integration.process_grade_passback_queue()
RETURNS INTEGER AS $$
  -- Retry logic para passbacks fallidos
$$ LANGUAGE plpgsql;
```

---

### 5. ContentVersion (CONTENT)

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ content_management.content_versions
Triggers: ❌ Ninguno
Funciones: ❌ Ninguna
Seeds: ❌ Ninguno
Service: ❌ FALTA
Controller: ❌ FALTA
Uso Actual: Ninguno
```

#### ¿Requiere Implementación?
**DIFERIBLE - Prioridad P4**

El versionado de contenido es útil pero no crítico para el MVP. Ningún flujo actual lo requiere. Puede implementarse cuando:
- Se estabilice el pipeline de contenido
- Se requiera auditoría de cambios
- Se necesite rollback de versiones

---

### 6. FlaggedContent (CONTENT) - CRÍTICO

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ content_management.flagged_content
Triggers: ❌ Ninguno específicos
Funciones: ❌ Ninguna
Seeds: ❌ Ninguno
Service: ❌ FALTA
Controller: ❌ FALTA
```

#### USO ACTUAL DETECTADO
```typescript
// admin-dashboard.service.ts
getFlaggedContentCount() // YA SE LLAMA

// SQL View existente
admin_dashboard.moderation_queue // CONSULTA flagged_content
```

**PROBLEMA CRÍTICO:** El dashboard admin DEPENDE de FlaggedContent pero NO hay forma de:
- Crear flags (reportar contenido)
- Revisar flags (aprobar/rechazar)
- Gestionar la cola de moderación

#### Integraciones Necesarias
| Integración | Requerida | Justificación |
|-------------|-----------|---------------|
| Gamificación | ✅ SÍ | "Safety Guardian" achievement |
| Notificaciones | ✅ SÍ | Notificar al reportador del resultado |
| Admin Dashboard | ✅ YA EXISTE | getFlaggedContentCount() |
| Audit Logging | ✅ SÍ | Registrar todas las decisiones |

#### ¿Requiere Implementación?
**SÍ - Prioridad P1 (CRÍTICO)**

Endpoints necesarios:
- `POST /api/v1/content/flag` - Reportar contenido
- `GET /api/v1/admin/moderation/queue` - Cola de moderación
- `PATCH /api/v1/admin/moderation/:id/review` - Aprobar/rechazar
- `GET /api/v1/admin/moderation/stats` - Estadísticas

#### DDL Adicional Requerido
```sql
-- Trigger para award achievement cuando moderador revisa contenido
CREATE OR REPLACE FUNCTION content_management.award_moderation_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    -- Verificar si el moderador tiene achievement de moderación
    PERFORM gamification_system.check_and_award_achievements(
      NEW.reviewed_by,
      'content_moderation',
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_moderation_achievement
  AFTER UPDATE ON content_management.flagged_content
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected'))
  EXECUTE FUNCTION content_management.award_moderation_achievement();

-- Trigger para notificar al reportador
CREATE OR REPLACE FUNCTION content_management.notify_reporter_on_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected', 'removed') AND OLD.status = 'pending' THEN
    INSERT INTO notifications.notifications (
      user_id, type, title, message, related_entity_type, related_entity_id
    ) VALUES (
      NEW.reported_by,
      'moderation_result',
      'Tu reporte ha sido revisado',
      CASE NEW.status
        WHEN 'approved' THEN 'El contenido fue aprobado'
        WHEN 'rejected' THEN 'El contenido fue rechazado'
        WHEN 'removed' THEN 'El contenido fue removido'
      END,
      'flagged_content',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Seeds Requeridos
```sql
-- Seeds para achievement de moderación
INSERT INTO gamification_system.achievements (
  code, name, description, category_id, xp_reward, ml_coins_reward
) VALUES
  ('safety_guardian_1', 'Guardián de la Seguridad I', 'Revisa 10 reportes de contenido', ..., 100, 50),
  ('safety_guardian_2', 'Guardián de la Seguridad II', 'Revisa 50 reportes de contenido', ..., 250, 100),
  ('safety_guardian_3', 'Guardián de la Seguridad III', 'Revisa 100 reportes de contenido', ..., 500, 200);
```

---

### 7. MediaMetadata (CONTENT)

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ content_management.media_metadata
Triggers: ✅ updated_at trigger
Funciones: ❌ Ninguna
Seeds: ❌ Ninguno
Service: ❌ FALTA
Controller: ❌ FALTA
Uso Actual: Ninguno
```

#### ¿Requiere Implementación?
**DIFERIBLE - Prioridad P4**

MediaMetadata está diseñado para almacenar metadatos extendidos de archivos multimedia (EXIF, duración, resolución). Depende del pipeline de procesamiento de medios que aún no está completo.

Implementar cuando:
- Se agregue procesamiento de video/audio
- Se requiera extracción automática de metadatos
- Se necesiten thumbnails automáticos

---

### 8. Tag (CONTENT)

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ content_management.tags
Triggers: ❌ Ninguno
Funciones: ❌ Ninguna
Seeds: ✅ 60+ tags precargados (9 categorías)
Service: ❌ FALTA
Controller: ❌ FALTA
Uso Actual: Ninguno (tags orphaned)
```

#### Categorías de Tags Existentes (Seeds)
1. `person` - Personas históricas/científicas
2. `scientific_concept` - Conceptos científicos
3. `location` - Lugares geográficos
4. `achievement` - Logros/descubrimientos
5. `historical_event` - Eventos históricos
6. `subject` - Materias
7. `theme` - Temas
8. `value` - Valores
9. `method` - Métodos científicos

#### ¿Requiere Implementación?
**SÍ - Prioridad P2**

Los tags están pre-populados pero NO hay forma de:
- Asignar tags a contenido
- Buscar contenido por tags
- Gestionar tags (CRUD)

Endpoints necesarios:
- `GET /api/v1/content/tags` - Listar tags (con filtros por categoría)
- `GET /api/v1/content/tags/:slug` - Obtener tag
- `POST /api/v1/admin/tags` - Crear tag (admin)
- `PATCH /api/v1/admin/tags/:id` - Actualizar tag (admin)
- `DELETE /api/v1/admin/tags/:id` - Eliminar tag (admin)
- `POST /api/v1/content/:contentType/:id/tags` - Asignar tags a contenido
- `GET /api/v1/content/search?tags=...` - Buscar por tags

#### DDL Adicional Requerido
```sql
-- Tabla de relación contenido-tags (M:N)
CREATE TABLE IF NOT EXISTS content_management.content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'exercise', 'module', 'lesson'
  content_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES content_management.tags(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth_management.profiles(id),
  UNIQUE(content_type, content_id, tag_id)
);

-- Trigger para actualizar usage_count
CREATE OR REPLACE FUNCTION content_management.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content_management.tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content_management.tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_tag_usage
  AFTER INSERT OR DELETE ON content_management.content_tags
  FOR EACH ROW
  EXECUTE FUNCTION content_management.update_tag_usage_count();

-- Índice GIN para búsqueda full-text
CREATE INDEX idx_content_tags_content ON content_management.content_tags(content_type, content_id);
CREATE INDEX idx_content_tags_tag ON content_management.content_tags(tag_id);
```

---

### 9. ModerationRule (CONTENT) - CRÍTICO

#### Estado Actual
```yaml
Entity: ✅ Completa
DDL: ✅ content_management.moderation_rules
Triggers: ✅ trg_auto_moderate (ACTIVO)
Funciones: ✅ 4 funciones de moderación (ACTIVAS)
Seeds: ✅ 11 reglas básicas
Service: ❌ FALTA
Controller: ❌ FALTA
```

#### USO ACTUAL DETECTADO
```sql
-- Trigger ACTIVO en BD
trg_auto_moderate -- Se ejecuta en INSERT/UPDATE de contenido

-- Funciones ACTIVAS
apply_moderation_rules()
check_keyword_rule()
check_pattern_rule()
auto_moderate_content()
```

**PROBLEMA CRÍTICO:** Las reglas de moderación SE EJECUTAN en la BD pero NO hay forma de:
- Ver las reglas existentes
- Crear nuevas reglas
- Editar/desactivar reglas
- Monitorear efectividad

#### ¿Requiere Implementación?
**SÍ - Prioridad P1 (CRÍTICO)**

Endpoints necesarios:
- `GET /api/v1/admin/moderation/rules` - Listar reglas
- `GET /api/v1/admin/moderation/rules/:id` - Ver regla
- `POST /api/v1/admin/moderation/rules` - Crear regla
- `PATCH /api/v1/admin/moderation/rules/:id` - Actualizar regla
- `DELETE /api/v1/admin/moderation/rules/:id` - Eliminar regla
- `POST /api/v1/admin/moderation/rules/:id/test` - Probar regla con texto
- `GET /api/v1/admin/moderation/rules/stats` - Estadísticas de efectividad

#### DDL Adicional Requerido
```sql
-- Tabla para tracking de efectividad de reglas
CREATE TABLE IF NOT EXISTS content_management.moderation_rule_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES content_management.moderation_rules(id),
  date DATE NOT NULL,
  matches_count INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  true_positives INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rule_id, date)
);

-- Función para registrar match de regla
CREATE OR REPLACE FUNCTION content_management.log_rule_match(
  p_rule_id UUID,
  p_is_true_positive BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO content_management.moderation_rule_stats (rule_id, date, matches_count)
  VALUES (p_rule_id, CURRENT_DATE, 1)
  ON CONFLICT (rule_id, date)
  DO UPDATE SET
    matches_count = moderation_rule_stats.matches_count + 1,
    true_positives = CASE
      WHEN p_is_true_positive = true THEN moderation_rule_stats.true_positives + 1
      ELSE moderation_rule_stats.true_positives
    END,
    false_positives = CASE
      WHEN p_is_true_positive = false THEN moderation_rule_stats.false_positives + 1
      ELSE moderation_rule_stats.false_positives
    END;
END;
$$ LANGUAGE plpgsql;
```

#### Seeds Adicionales Requeridos
```sql
-- Reglas específicas para contenido educativo en español
INSERT INTO content_management.moderation_rules (
  rule_name, rule_type, target_entity, rule_config, action, severity, is_active, priority
) VALUES
  -- Lenguaje inapropiado en español
  ('Palabras ofensivas ES', 'keyword', 'comment',
   '{"keywords": ["insulto1", "insulto2", "..."], "case_sensitive": false}',
   'flag', 'high', true, 100),

  -- URLs no autorizadas
  ('URLs externas no permitidas', 'pattern', 'content',
   '{"pattern": "https?://(?!gamilit\\.com).*", "description": "Bloquea URLs externas"}',
   'block', 'medium', true, 90),

  -- Contenido demasiado corto
  ('Respuesta muy corta', 'length', 'comment',
   '{"min_length": 10, "max_length": null}',
   'flag', 'low', true, 50);
```

---

## INTEGRACIONES CON GAMIFICACIÓN

### Triggers de Gamificación Faltantes

#### 1. Social → Gamificación
```sql
-- NO IMPLEMENTAR para UserFollow (decisión de diseño)
-- Evitar gamificar interacciones sociales orgánicas
```

#### 2. Content Moderation → Gamificación
```sql
-- YA DOCUMENTADO ARRIBA en FlaggedContent
-- Trigger: award_moderation_achievement
-- Achievements: safety_guardian_1/2/3
```

#### 3. LTI → Gamificación (Cuando se implemente)
```sql
-- Trigger para XP bonus por completar ejercicio desde LMS
CREATE OR REPLACE FUNCTION lti_integration.award_lti_completion_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el grade passback fue exitoso, dar bonus XP
  IF NEW.passback_status = 'success' AND OLD.passback_status != 'success' THEN
    PERFORM gamification_system.award_xp(
      NEW.user_id,
      10, -- Bonus XP
      'lti_completion',
      'Ejercicio completado desde LMS'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## PLAN DE IMPLEMENTACIÓN

### Sprint 1 (CRÍTICO) - Moderación Funcional

**Duración:** 2-3 días
**Prioridad:** P1

| Tarea | Estimación | Dependencias |
|-------|------------|--------------|
| FlaggedContentService + Controller | 4h | Ninguna |
| ModerationRuleService + Controller | 4h | Ninguna |
| Triggers de gamificación (moderation) | 2h | Services |
| Seeds de achievements moderación | 1h | Triggers |
| Tests unitarios | 3h | Services |
| Integración con admin dashboard | 2h | Controllers |

**Archivos a crear:**
```
modules/content/services/flagged-content.service.ts
modules/content/controllers/flagged-content.controller.ts
modules/content/services/moderation-rules.service.ts
modules/content/controllers/moderation-rules.controller.ts
modules/content/dto/flagged-content/*.dto.ts
modules/content/dto/moderation-rules/*.dto.ts
```

**DDL a ejecutar:**
```
ddl/schemas/content_management/triggers/trg_moderation_achievement.sql
ddl/schemas/content_management/triggers/trg_notify_reporter.sql
ddl/schemas/content_management/tables/moderation_rule_stats.sql
seeds/*/gamification_system/XX-moderation_achievements.sql
```

---

### Sprint 2 (ALTO) - Tags y Social

**Duración:** 2-3 días
**Prioridad:** P2

| Tarea | Estimación | Dependencias |
|-------|------------|--------------|
| TagService + Controller | 3h | Ninguna |
| content_tags tabla M:N | 1h | TagService |
| Trigger usage_count | 1h | Tabla M:N |
| UserFollowsService + Controller | 4h | Ninguna |
| Tests unitarios | 3h | Services |

**Archivos a crear:**
```
modules/content/services/tags.service.ts
modules/content/controllers/tags.controller.ts
modules/social/services/user-follows.service.ts
modules/social/controllers/user-follows.controller.ts
```

**DDL a ejecutar:**
```
ddl/schemas/content_management/tables/content_tags.sql
ddl/schemas/content_management/triggers/trg_update_tag_usage.sql
```

---

### Sprint 3 (MEDIO) - Contenido Avanzado

**Duración:** 2 días
**Prioridad:** P4 (Diferible)

| Tarea | Estimación | Dependencias |
|-------|------------|--------------|
| ContentVersionService + Controller | 3h | Ninguna |
| MediaMetadataService + Controller | 3h | Ninguna |
| Integración con upload pipeline | 4h | MediaMetadata |

---

### Sprint LTI (FUERA MVP)

**Duración:** 5 días (40 horas según epic)
**Prioridad:** P3 (Cuando se active EXT-007)

| Tarea | Estimación | Dependencias |
|-------|------------|--------------|
| Configurar datasource 'lti' | 1h | Ninguna |
| LtiConsumerService + Controller | 4h | Datasource |
| LtiAuthService (OIDC) | 8h | Consumer |
| LtiSessionService | 4h | Auth |
| LtiGradePassbackService | 8h | Session |
| Triggers de grade passback | 4h | Service |
| Tests de integración | 8h | Todo |

---

## CHECKLIST DE IMPLEMENTACIÓN

### Pre-Implementación
- [ ] Leer entity existente
- [ ] Verificar DDL existente
- [ ] Identificar integraciones
- [ ] Crear DDL faltante

### Implementación Service
- [ ] Crear service con CRUD
- [ ] Inyectar repositorios necesarios
- [ ] Implementar lógica de negocio
- [ ] Agregar logging
- [ ] Exportar en index.ts

### Implementación Controller
- [ ] Crear controller con endpoints REST
- [ ] Agregar guards (JWT, Roles)
- [ ] Documentar con Swagger
- [ ] Agregar validación de DTOs
- [ ] Exportar en index.ts

### Post-Implementación
- [ ] Registrar en module.ts
- [ ] Crear tests unitarios (≥80% coverage)
- [ ] Ejecutar `npm run build`
- [ ] Ejecutar `npm run lint`
- [ ] Actualizar BACKEND_INVENTORY.yml
- [ ] Actualizar TABLE-ENTITY-MAP.yml

---

## RESUMEN FINAL

### Implementación Inmediata (P1)
| Entity | Esfuerzo | Impacto |
|--------|----------|---------|
| FlaggedContent | 4h | Dashboard admin funcional |
| ModerationRule | 4h | Gestión de reglas |
| **Total P1** | **8h** | **Sistema de moderación completo** |

### Implementación Pronta (P2)
| Entity | Esfuerzo | Impacto |
|--------|----------|---------|
| Tag | 4h | Categorización de contenido |
| UserFollow | 4h | Red social completa |
| **Total P2** | **8h** | **Features sociales** |

### Diferible (P3-P4)
| Entity | Esfuerzo | Impacto |
|--------|----------|---------|
| LTI (3 entities) | 40h | Integración LMS |
| ContentVersion | 4h | Versionado |
| MediaMetadata | 4h | Metadatos multimedia |
| **Total P3-P4** | **48h** | **Features avanzadas** |

### Total General
- **P1 (Crítico):** 8 horas
- **P2 (Alto):** 8 horas
- **P3-P4 (Diferible):** 48 horas
- **TOTAL:** 64 horas (~8 días de desarrollo)

---

*Análisis realizado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Fecha: 2026-01-16*
