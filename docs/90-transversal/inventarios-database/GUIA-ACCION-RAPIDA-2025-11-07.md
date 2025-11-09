# GUÍA DE ACCIÓN RÁPIDA - CORRECCIONES CRÍTICAS

**Fecha:** 2025-11-07
**Objetivo:** Restaurar funcionalidad completa en 1-2 días
**Estado:** Post-validación de integridad

---

## CHECKLIST DE CORRECCIONES

### 🔴 FASE 1: CORRECCIONES RÁPIDAS (2 horas)

Correcciones que no requieren decisiones arquitecturales y pueden hacerse de inmediato.

#### [ ] 1.1 Actualizar schemas en funciones (1 hora)

**Problema:** Funciones usan `auth.profiles` en lugar de `auth_management.profiles`

**Archivos a actualizar:**
```bash
# Buscar y reemplazar en todos los archivos de funciones
find apps/database/ddl/schemas -name "*.sql" -path "*/functions/*" \
  -exec sed -i 's/auth\.profiles/auth_management.profiles/g' {} \;

# Verificar cambios
grep -r "auth\.profiles" apps/database/ddl/schemas/*/functions/
```

**Archivos afectados:** ~15 funciones

#### [ ] 1.2 Corregir typos de nombres de tablas (30 min)

**Correcciones:**

```sql
-- 1. user_activity_log → user_activity_logs
# File: public/functions/02-cleanup_old_user_activity.sql
sed -i 's/user_activity_log/user_activity_logs/g' \
  apps/database/ddl/schemas/public/functions/02-cleanup_old_user_activity.sql

-- 2. social_features.notifications → gamification_system.notifications
# File: public/functions/05-send_notification.sql
sed -i 's/social_features\.notifications/gamification_system.notifications/g' \
  apps/database/ddl/schemas/public/functions/05-send_notification.sql
```

#### [ ] 1.3 Fix get_classroom_analytics (30 min)

**Problema:** Referencia tablas incorrectas

```sql
-- File: progress_tracking/functions/05-get_classroom_analytics.sql

-- Cambios necesarios:
-- 1. classroom_students → social_features.classroom_members
-- 2. student_stats → Eliminar o usar tabla correcta
-- 3. auth.profiles → auth_management.profiles
```

**Acción:** Editar archivo manualmente o refactorizar función completa.

---

### 🟠 FASE 2: DECISIONES ARQUITECTURALES (30 min)

Revisar y aprobar decisiones en `DECISIONES-ARQUITECTURALES-REQUERIDAS.md`

#### [ ] 2.1 Aprobar decisiones críticas

**Decisiones a aprobar:**

- [ ] D1: Missions → Usar `gamification_system.missions`
- [ ] D2: Inventario → Refactorizar a `comodines_inventory`
- [ ] D3: mechanic_progress → Eliminar feature
- [ ] D4: Feature flags → Usar tabla global
- [ ] D5: maya_ranks → Crear tabla con config
- [ ] D6: user_activity → Corregir typo
- [ ] D7: Notifications → Usar gamification_system

**Responsable:** Arquitecto de BD / Tech Lead

---

### 🟠 FASE 3: IMPLEMENTAR DECISIONES (8 horas)

#### [ ] 3.1 Actualizar función update_mission_progress (30 min)

```sql
-- File: progress_tracking/functions/06-update_mission_progress.sql

-- Cambiar:
FROM educational_content.missions
-- Por:
FROM gamification_system.missions
```

#### [ ] 3.2 Eliminar check_mechanic_completion (10 min)

```bash
# Mover a deprecated
mkdir -p apps/database/ddl/schemas/progress_tracking/functions/_deprecated
mv apps/database/ddl/schemas/progress_tracking/functions/02-check_mechanic_completion.sql \
   apps/database/ddl/schemas/progress_tracking/functions/_deprecated/

# Documentar
echo "# Deprecated Functions

## check_mechanic_completion

**Fecha:** 2025-11-07
**Razón:** Tabla mechanic_progress no existe y feature no está especificada
**Decisión:** D3 en DECISIONES-ARQUITECTURALES-REQUERIDAS.md
" > apps/database/ddl/schemas/progress_tracking/functions/_deprecated/README.md
```

#### [ ] 3.3 Actualizar is_feature_enabled (1 hora)

**Acción:** Reescribir función para usar `feature_flags` global.

```sql
-- File: public/functions/03-is_feature_enabled.sql

CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    feature_enabled BOOLEAN;
    user_role auth_management.gamilit_role;
BEGIN
    -- Get current user role
    user_role := gamilit.get_current_user_role();

    -- Check if feature is enabled for user's role
    SELECT f.enabled INTO feature_enabled
    FROM system_configuration.feature_flags f
    WHERE f.key = flag_key
      AND f.enabled = true
      AND (f.target_roles IS NULL OR user_role = ANY(f.target_roles));

    RETURN COALESCE(feature_enabled, false);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_feature_enabled(TEXT) IS
    'Verifica si un feature flag está habilitado para el usuario actual (v2.0). '
    'Usa system_configuration.feature_flags con soporte para target_roles.';
```

#### [ ] 3.4 Crear tabla maya_ranks (2 horas)

**Paso 1:** Crear archivo DDL

```sql
-- File: apps/database/ddl/schemas/gamification_system/tables/10-maya_ranks.sql

SET search_path TO gamification_system, public;

CREATE TABLE gamification_system.maya_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_name gamification_system.maya_rank NOT NULL UNIQUE,
    rank_order INTEGER NOT NULL UNIQUE,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER,
    description TEXT,
    icon TEXT DEFAULT 'star',
    color TEXT DEFAULT '#000000',
    perks JSONB DEFAULT '{}'::jsonb,
    ml_coins_bonus INTEGER DEFAULT 0,
    xp_multiplier NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    CONSTRAINT maya_ranks_order_positive CHECK (rank_order > 0),
    CONSTRAINT maya_ranks_xp_valid CHECK (min_xp >= 0),
    CONSTRAINT maya_ranks_max_xp_valid CHECK (max_xp IS NULL OR max_xp > min_xp)
);

CREATE INDEX idx_maya_ranks_order ON gamification_system.maya_ranks(rank_order);
CREATE INDEX idx_maya_ranks_xp_range ON gamification_system.maya_ranks(min_xp, max_xp);

COMMENT ON TABLE gamification_system.maya_ranks IS
    'Configuración de rangos mayas con XP requerido y beneficios';
COMMENT ON COLUMN gamification_system.maya_ranks.max_xp IS
    'XP máximo para este rango (NULL para el último rango)';
COMMENT ON COLUMN gamification_system.maya_ranks.perks IS
    'Beneficios del rango en formato JSON';

CREATE TRIGGER trg_maya_ranks_updated_at
    BEFORE UPDATE ON gamification_system.maya_ranks
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
```

**Paso 2:** Crear seed data

```sql
-- File: apps/database/ddl/schemas/gamification_system/seeds/maya_ranks.sql

INSERT INTO gamification_system.maya_ranks (
    rank_name, rank_order, min_xp, max_xp,
    description, icon, color,
    ml_coins_bonus, xp_multiplier, perks
) VALUES
(
    'Ajaw'::gamification_system.maya_rank,
    1, 0, 999,
    'Nivel inicial del viaje de aprendizaje maya. Todo estudiante comienza aquí.',
    'star',
    '#CD7F32',
    0,
    1.0,
    '{"welcome_bonus": 100, "access": "basic"}'::jsonb
),
(
    'Nacom'::gamification_system.maya_rank,
    2, 1000, 2999,
    'Guerrero en entrenamiento. Has demostrado dedicación y progreso constante.',
    'shield',
    '#C0C0C0',
    10,
    1.1,
    '{"daily_bonus": 10, "hint_discount": 5, "access": "intermediate"}'::jsonb
),
(
    'Ah K''in'::gamification_system.maya_rank,
    3, 3000, 6999,
    'Sacerdote del conocimiento. Tu sabiduría crece con cada desafío superado.',
    'book',
    '#FFD700',
    20,
    1.2,
    '{"daily_bonus": 20, "hint_discount": 10, "exclusive_content": true, "access": "advanced"}'::jsonb
),
(
    'Halach Uinic'::gamification_system.maya_rank,
    4, 7000, 14999,
    'Líder de la comunidad. Tu dominio inspira a otros estudiantes.',
    'crown',
    '#E5E4E2',
    30,
    1.3,
    '{"daily_bonus": 30, "hint_discount": 15, "exclusive_content": true, "mentor_access": true, "access": "expert"}'::jsonb
),
(
    'K''uk''ulkan'::gamification_system.maya_rank,
    5, 15000, NULL,
    'Serpiente Emplumada. Máximo rango maya, símbolo de conocimiento supremo.',
    'dragon',
    '#B9F2FF',
    50,
    1.5,
    '{"daily_bonus": 50, "hint_discount": 20, "all_content_access": true, "mentor_access": true, "leaderboard_featured": true, "custom_profile": true, "access": "master"}'::jsonb
);
```

**Paso 3:** Actualizar funciones (3 archivos)

```bash
# Archivos a actualizar:
# 1. gamification_system/functions/get_user_rank_progress.sql
# 2. gamification_system/functions/get_user_current_rank.sql
# 3. gamification_system/functions/calculate_user_rank.sql

# Las funciones ahora pueden hacer JOIN con maya_ranks para obtener config
```

#### [ ] 3.5 Refactorizar funciones de inventario (4 horas)

**Funciones a refactorizar:**

1. `get_user_comodines.sql` - Usar `comodines_inventory`
2. `redeem_comodin.sql` - Usar `comodines_inventory`
3. `consume_comodin.sql` - Usar `comodines_inventory`
4. `get_user_inventory.sql` - Usar `comodines_inventory`
5. `get_user_inventory_summary.sql` - Usar `comodines_inventory`

**Ejemplo de refactoring:**

```sql
-- ANTES (usa user_inventory + store_items):
CREATE OR REPLACE FUNCTION gamification_system.get_user_comodines(p_user_id UUID)
RETURNS TABLE(...) AS $$
BEGIN
    RETURN QUERY
    SELECT ui.*, si.name, si.cost
    FROM gamification_system.user_inventory ui
    JOIN gamification_system.store_items si ON ui.item_id = si.id
    WHERE ui.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- DESPUÉS (usa comodines_inventory):
CREATE OR REPLACE FUNCTION gamification_system.get_user_comodines(p_user_id UUID)
RETURNS TABLE(
    comodin_type public.comodin_type,
    quantity INTEGER,
    last_earned_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ci.comodin_type,
        ci.quantity,
        ci.last_earned_at
    FROM gamification_system.comodines_inventory ci
    WHERE ci.user_id = p_user_id
      AND ci.quantity > 0;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### 🟢 FASE 4: TESTING Y VALIDACIÓN (2 horas)

#### [ ] 4.1 Testing manual de funciones críticas

```sql
-- Test 1: is_feature_enabled
SELECT public.is_feature_enabled('test_flag');

-- Test 2: get_classroom_analytics (si se refactorizó)
SELECT * FROM progress_tracking.get_classroom_analytics(
    'classroom-uuid-here',
    '2025-01-01'::date,
    '2025-12-31'::date
);

-- Test 3: maya_ranks
SELECT * FROM gamification_system.maya_ranks ORDER BY rank_order;

-- Test 4: get_user_comodines
SELECT * FROM gamification_system.get_user_comodines('user-uuid-here');
```

#### [ ] 4.2 Re-ejecutar script de validación

```bash
python3 apps/database/scripts/validate_integrity.py

# Verificar que problemas CRÍTICOS se redujeron de 7 a 0
```

#### [ ] 4.3 Testing de integridad FK

```bash
# Verificar que todas las FK siguen válidas
psql -d gamilit -c "
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace::regnamespace::text NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;
"
```

---

### 🟢 FASE 5: DOCUMENTACIÓN (1 hora)

#### [ ] 5.1 Actualizar TRACKING-CORRECCIONES.md

```markdown
### Semana 1 (2025-11-07)
- ✅ Actualización de schemas en funciones (auth → auth_management)
- ✅ Corrección de typos en nombres de tablas
- ✅ Fix get_classroom_analytics
- ✅ Eliminación de check_mechanic_completion (deprecated)
- ✅ Actualización de is_feature_enabled (v2.0)
- ✅ Creación de tabla maya_ranks con seed data
- ✅ Refactoring de funciones de inventario

**Total completado:** 16/142 (11.3%)
**Problemas críticos resueltos:** 7/7 (100%)
```

#### [ ] 5.2 Crear changelog de correcciones

```markdown
# CHANGELOG - Correcciones Críticas 2025-11-07

## [2025-11-07] - Correcciones Post-Validación

### Crítico ✅
- Fixed: 15 funciones actualizadas de auth.profiles a auth_management.profiles
- Fixed: user_activity_log → user_activity_logs (typo)
- Fixed: social_features.notifications → gamification_system.notifications
- Fixed: get_classroom_analytics usa tablas correctas
- Fixed: is_feature_enabled usa feature_flags global (v2.0)

### Nuevo 🎉
- Added: Tabla maya_ranks con configuración de rangos
- Added: Seed data para 5 rangos mayas
- Added: 3 funciones actualizadas para usar maya_ranks

### Deprecated ⚠️
- Deprecated: check_mechanic_completion (tabla no existe, feature no especificada)

### Refactoring 🔧
- Refactored: 5 funciones de inventario para usar comodines_inventory
- Refactored: get_user_comodines simplificado
- Refactored: Sistema de inventario usa modelo existente

### Breaking Changes 💥
Ninguno - Todas las correcciones son backward compatible
```

#### [ ] 5.3 Actualizar README de funciones

```bash
# Crear/actualizar README en cada schema de funciones
# Documentar funciones deprecated
# Documentar cambios de v1.0 a v2.0
```

---

## RESUMEN DE ESFUERZO

| Fase | Tiempo Estimado | Prioridad |
|------|----------------|-----------|
| Fase 1: Correcciones rápidas | 2 horas | 🔴 CRÍTICA |
| Fase 2: Decisiones | 30 min | 🟠 ALTA |
| Fase 3: Implementación | 8 horas | 🟠 ALTA |
| Fase 4: Testing | 2 horas | 🟢 NECESARIA |
| Fase 5: Documentación | 1 hora | 🟢 NECESARIA |
| **TOTAL** | **~13.5 horas** | **1-2 días** |

---

## VALIDACIÓN DE ÉXITO

### Métricas objetivo post-correcciones:

| Métrica | Antes | Objetivo | Validación |
|---------|-------|----------|------------|
| Problemas CRÍTICOS | 7 | 0 | Script validación |
| Problemas ALTOS | 15 | <5 | Script validación |
| Funciones operativas | 52% | >90% | Testing manual |
| ENUMs bien ubicados | 17% | 17% | Sin cambio (fase P1) |
| Foreign Keys válidas | 100% | 100% | Sin cambio |

### Checklist de validación final:

- [ ] 0 errores en script de validación (problemas críticos)
- [ ] Todas las funciones core pueden ejecutarse sin error
- [ ] Testing manual de 5 funciones críticas exitoso
- [ ] TRACKING-CORRECCIONES.md actualizado
- [ ] CHANGELOG creado y documentado
- [ ] Equipo notificado de cambios

---

## PRÓXIMOS PASOS (Post-correcciones)

1. **Continuar migración de ENUMs** (Plan P1 - 6 horas)
2. **Refactorizar get_classroom_analytics completo** (si no se hizo en fase 3)
3. **Implementar tests automatizados** (4 horas)
4. **Planning de sistema de inventario v2** (largo plazo)

---

## CONTACTOS Y RESPONSABLES

| Responsabilidad | Persona | Acción |
|-----------------|---------|--------|
| Decisiones arquitecturales | Tech Lead | Aprobar D1-D7 |
| Implementación funciones | Backend Dev | Fase 3.1-3.5 |
| Testing | QA / Dev | Fase 4 |
| Documentación | Tech Writer / Dev | Fase 5 |

---

**Documento creado:** 2025-11-07
**Última actualización:** 2025-11-07
**Estado:** Listo para ejecución
