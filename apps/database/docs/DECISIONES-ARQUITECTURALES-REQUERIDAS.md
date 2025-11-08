# DECISIONES ARQUITECTURALES REQUERIDAS

**Fecha:** 2025-11-07
**Estado:** Post-validación de integridad
**Prioridad:** CRÍTICA - Requiere decisión antes de continuar desarrollo

---

## PROPÓSITO

Este documento lista las **decisiones arquitecturales críticas** que deben tomarse para resolver los problemas encontrados en la validación de integridad. Cada decisión está bloqueando funcionalidad o impidiendo el progreso de correcciones.

---

## DECISIONES CRÍTICAS (Bloquean desarrollo)

### D1. Sistema de Misiones - ¿Dónde ubicar la tabla missions?

**Problema:**
- Función `update_mission_progress` referencia `educational_content.missions`
- La tabla NO existe en educational_content
- Existe `gamification_system.missions` en archivos DDL

**Opciones:**

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A) Crear en educational_content** | Misiones son contenido educativo | Duplica con gamification_system.missions | ❌ No recomendado |
| **B) Usar gamification_system.missions** | Ya existe en DDL | Función está en progress_tracking | ✅ **RECOMENDADO** |
| **C) Mover a progress_tracking** | Función está ahí | Misiones no son solo progreso | ⚠️ Considerar |

**Decisión recomendada:** **OPCIÓN B**
- Usar tabla existente `gamification_system.missions`
- Actualizar función para referenciar schema correcto
- Razón: Ya existe, schema correcto para misiones

**Acción requerida:**
```sql
-- En progress_tracking/functions/06-update_mission_progress.sql
-- Cambiar:
FROM educational_content.missions
-- Por:
FROM gamification_system.missions
```

---

### D2. Sistema de Inventario - ¿Modelo de datos?

**Problema:**
- 6 funciones referencian `user_inventory` y `store_items`
- Estas tablas NO existen
- Existe tabla `comodines_inventory`

**Opciones:**

| Opción | Pros | Contras | Esfuerzo |
|--------|------|---------|----------|
| **A) Crear user_inventory + store_items** | Separación de concerns | 2 tablas nuevas, más complejo | 8 horas |
| **B) Refactorizar a comodines_inventory** | Usa tabla existente | Funciones deben reescribirse | 6 horas |
| **C) Modelo híbrido** | Flexible | Más complejo mantener | 10 horas |

**Análisis de modelo A (Separación):**

```sql
-- Tabla de catálogo de items
CREATE TABLE gamification_system.store_items (
    id UUID PRIMARY KEY,
    item_type TEXT, -- 'comodin', 'powerup', 'cosmetic'
    name TEXT,
    description TEXT,
    cost_ml_coins INTEGER,
    metadata JSONB
);

-- Tabla de inventario de usuario
CREATE TABLE gamification_system.user_inventory (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth_management.profiles(id),
    item_id UUID REFERENCES gamification_system.store_items(id),
    quantity INTEGER,
    acquired_at TIMESTAMPTZ
);
```

**Análisis de modelo B (Simplificado):**

```sql
-- Usar tabla existente
-- gamification_system.comodines_inventory ya tiene:
-- - user_id
-- - comodin_type (pistas, vision_lectora, segunda_oportunidad)
-- - quantity
-- - last_earned_at

-- Funciones deben adaptarse para:
-- 1. Usar comodin_type en lugar de item_id
-- 2. Trabajar directamente con inventory
```

**Decisión recomendada:** **OPCIÓN B (corto plazo) → OPCIÓN A (largo plazo)**

**Razón:**
- Corto plazo: Refactorizar funciones para usar `comodines_inventory` (menor esfuerzo, funciona YA)
- Largo plazo: Migrar a modelo completo cuando se agreguen items no-comodines

**Acción inmediata:**
1. Refactorizar 6 funciones para usar `comodines_inventory`
2. Documentar plan de migración a modelo completo en futuro

---

### D3. Tabla mechanic_progress - ¿Feature necesaria?

**Problema:**
- Función `check_mechanic_completion` referencia `progress_tracking.mechanic_progress`
- Tabla NO existe
- No hay otra referencia a "mechanics" en el sistema

**Opciones:**

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A) Crear tabla + feature completa** | Sistema de progreso granular | Trabajo adicional sin spec clara | ❌ No ahora |
| **B) Eliminar función** | Simplifica código | Pierde feature potencial | ✅ **RECOMENDADO** |
| **C) Deprecar y documentar** | Mantiene para futuro | Código muerto | ⚠️ Alternativa |

**Decisión recomendada:** **OPCIÓN B**

**Razón:**
- No hay especificación de "mechanics" como concepto separado
- No hay tabla `educational_content.mechanics`
- Función no es llamada por ningún otro código
- Simplifica sistema sin perder funcionalidad documentada

**Acción requerida:**
```bash
# Mover a deprecated
mv apps/database/ddl/schemas/progress_tracking/functions/02-check_mechanic_completion.sql \
   apps/database/ddl/schemas/progress_tracking/functions/_deprecated/

# Documentar en _deprecated/README.md por qué se eliminó
```

---

### D4. User Feature Flags - ¿Nivel de usuario o global?

**Problema:**
- Función `is_feature_enabled` referencia `system_configuration.user_feature_flags`
- Tabla NO existe
- Existe `system_configuration.feature_flags` (tabla global)

**Opciones:**

| Opción | Pros | Contras | Esfuerzo |
|--------|------|---------|----------|
| **A) Crear user_feature_flags** | Feature flags por usuario | Complejidad adicional | 4 horas |
| **B) Usar feature_flags global** | Usa tabla existente | No hay control por usuario | 1 hora |
| **C) Modelo híbrido (override)** | Flexible | Más complejo | 6 horas |

**Análisis:**

```sql
-- OPCIÓN A: Tabla nueva
CREATE TABLE system_configuration.user_feature_flags (
    user_id UUID REFERENCES auth_management.profiles(id),
    flag_key TEXT,
    enabled BOOLEAN,
    overrides_global BOOLEAN,
    PRIMARY KEY (user_id, flag_key)
);

-- OPCIÓN B: Usar tabla existente
-- system_configuration.feature_flags tiene:
-- - key, enabled, target_roles, ...
-- Función verifica: flag_enabled AND user_role IN target_roles

-- OPCIÓN C: Híbrido
-- 1. Primero busca en user_feature_flags
-- 2. Si no existe, usa feature_flags global
-- 3. Permite overrides por usuario
```

**Decisión recomendada:** **OPCIÓN B (inmediato) → OPCIÓN C (futuro)**

**Razón:**
- Corto plazo: Tabla global es suficiente para MVP
- `target_roles` permite filtrado básico
- Largo plazo: Agregar overrides cuando se necesite A/B testing

**Acción inmediata:**
```sql
-- Actualizar función is_feature_enabled
CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM system_configuration.feature_flags
        WHERE key = flag_key
          AND enabled = true
          AND (target_roles IS NULL
               OR gamilit.get_current_user_role() = ANY(target_roles))
    );
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### D5. Tabla maya_ranks (configuración) - ¿Estructura?

**Problema:**
- 3 funciones referencian `gamification_system.maya_ranks`
- Tabla NO existe (existe el ENUM maya_rank)
- Se necesita tabla de configuración con XP, perks, etc.

**Opciones:**

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A) Tabla con configuración completa** | Flexible, extensible | Requiere seed data | ✅ **RECOMENDADO** |
| **B) Hardcodear en función** | Más simple | Difícil cambiar valores | ❌ No escalable |
| **C) JSONB en settings** | No requiere tabla | Menos estructurado | ⚠️ Alternativa |

**Decisión recomendada:** **OPCIÓN A**

**Estructura propuesta:**

```sql
CREATE TABLE gamification_system.maya_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_name gamification_system.maya_rank NOT NULL UNIQUE,
    rank_order INTEGER NOT NULL UNIQUE, -- 1-5
    min_xp INTEGER NOT NULL,
    max_xp INTEGER, -- NULL para último rango
    description TEXT,
    icon TEXT,
    color TEXT, -- Para UI
    perks JSONB, -- Beneficios del rango
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO gamification_system.maya_ranks (rank_name, rank_order, min_xp, max_xp, description, icon, color, perks) VALUES
('Ajaw', 1, 0, 999, 'Nivel inicial del viaje maya', 'star', '#bronze', '{"xp_multiplier": 1.0}'::jsonb),
('Nacom', 2, 1000, 2999, 'Guerrero en entrenamiento', 'shield', '#silver', '{"xp_multiplier": 1.1, "ml_coins_bonus": 10}'::jsonb),
('Ah K''in', 3, 3000, 6999, 'Sacerdote del conocimiento', 'book', '#gold', '{"xp_multiplier": 1.2, "ml_coins_bonus": 20}'::jsonb),
('Halach Uinic', 4, 7000, 14999, 'Líder de la comunidad', 'crown', '#platinum', '{"xp_multiplier": 1.3, "ml_coins_bonus": 30, "unlock_exclusive_content": true}'::jsonb),
('K''uk''ulkan', 5, 15000, NULL, 'Máximo rango maya', 'dragon', '#diamond', '{"xp_multiplier": 1.5, "ml_coins_bonus": 50, "all_perks": true}'::jsonb);
```

**Acción requerida:**
1. Crear archivo DDL: `gamification_system/tables/10-maya_ranks.sql`
2. Crear seed: `gamification_system/seeds/maya_ranks.sql`
3. Actualizar 3 funciones que la referencian

---

### D6. Tabla user_activity_log vs user_activity_logs

**Problema:**
- Función `cleanup_old_user_activity` referencia `audit_logging.user_activity_log` (singular)
- Existe `audit_logging.user_activity_logs` (plural)
- ¿Es typo o tabla diferente?

**Opciones:**

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A) Es typo, usar _logs** | Usa tabla existente | - | ✅ **RECOMENDADO** |
| **B) Son tablas diferentes** | - | ¿Por qué 2 tablas? | ❌ Poco probable |

**Decisión recomendada:** **OPCIÓN A** (es un typo)

**Acción requerida:**
```sql
-- Actualizar función
-- Cambiar: audit_logging.user_activity_log
-- Por: audit_logging.user_activity_logs
```

---

### D7. Notificaciones - ¿Dónde está la tabla?

**Problema:**
- Función `send_notification` referencia `social_features.notifications`
- Tabla NO existe en social_features
- Existe `gamification_system.notifications`

**Opciones:**

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A) Mover a social_features** | Función lo espera ahí | Notificaciones no son solo sociales | ❌ |
| **B) Usar gamification_system** | Ubicación correcta actual | Función debe actualizarse | ✅ **RECOMENDADO** |
| **C) Duplicar tabla** | - | Horrible idea | ❌ Nunca |

**Decisión recomendada:** **OPCIÓN B**

**Razón:**
- Notificaciones son parte de gamificación (achievements, coins, etc.)
- Schema correcto: gamification_system
- Función debe actualizarse

**Acción requerida:**
```sql
-- Actualizar función send_notification
-- Cambiar: social_features.notifications
-- Por: gamification_system.notifications
```

---

## DECISIONES SECUNDARIAS (No bloquean)

### D8. ENUMs en prerequisites vs archivos individuales

**Problema:** ENUMs definidos en 2 lugares

**Decisión:** Eliminar de prerequisites, usar solo archivos individuales

**Razón:** Fuente de verdad única por schema

---

### D9. notification_type en public vs gamification_system

**Problema:** ENUM en schema incorrecto

**Decisión:** Migrar a gamification_system en fase P1 de ENUMs

**Razón:** Consistencia arquitectural

---

## RESUMEN DE DECISIONES

| ID | Decisión | Recomendación | Prioridad | Esfuerzo |
|----|----------|---------------|-----------|----------|
| D1 | Ubicación missions | Usar gamification_system.missions | 🔴 CRÍTICA | 30 min |
| D2 | Modelo inventario | Refactorizar a comodines_inventory | 🔴 CRÍTICA | 6 horas |
| D3 | mechanic_progress | Eliminar feature | 🔴 CRÍTICA | 30 min |
| D4 | User feature flags | Usar tabla global feature_flags | 🔴 CRÍTICA | 1 hora |
| D5 | maya_ranks config | Crear tabla con seed data | 🟠 ALTA | 2 horas |
| D6 | user_activity_log | Corregir typo a _logs | 🔴 CRÍTICA | 10 min |
| D7 | Ubicación notifications | Usar gamification_system | 🔴 CRÍTICA | 10 min |
| D8 | ENUMs duplicados | Eliminar de prerequisites | 🟡 MEDIA | 30 min |
| D9 | notification_type schema | Migrar en fase P1 | 🟡 MEDIA | 1 hora |

**Total esfuerzo estimado (decisiones críticas):** ~11 horas

---

## PRÓXIMOS PASOS

1. **Revisar y aprobar decisiones** (30 min - Equipo)
2. **Implementar decisiones críticas** (1 día)
3. **Testing de funciones actualizadas** (2 horas)
4. **Actualizar documentación** (1 hora)
5. **Continuar con plan P1 de migración ENUMs**

---

**Documento preparado por:** Sistema de Validación
**Requiere aprobación de:** Arquitecto de BD / Tech Lead
**Fecha límite decisión:** ASAP (bloquea desarrollo)
