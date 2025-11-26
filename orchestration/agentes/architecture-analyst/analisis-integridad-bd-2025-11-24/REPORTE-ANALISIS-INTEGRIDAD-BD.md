# REPORTE: Análisis de Integridad de Base de Datos GAMILIT

**Fecha:** 2025-11-24
**Versión:** 1.0
**Autor:** Architecture-Analyst Agent
**Estado:** FASE 2 - Documentación de Hallazgos

---

## RESUMEN EJECUTIVO

Se realizó un análisis exhaustivo de la base de datos GAMILIT identificando **12 conflictos críticos** distribuidos en 4 categorías:

| Categoría | Críticos (P0) | Altos (P1) | Medios (P2) | Total |
|-----------|---------------|------------|-------------|-------|
| Referencias FK | 2 | 1 | 0 | 3 |
| Duplicidades DDL | 2 | 1 | 1 | 4 |
| Triggers Conflictivos | 1 | 1 | 0 | 2 |
| Integridad de Datos | 3 | 0 | 0 | 3 |
| **TOTAL** | **8** | **3** | **1** | **12** |

---

## ESTADÍSTICAS DE LA BASE DE DATOS

### Objetos en BD Real vs DDL

| Métrica | DDL Documentado | BD Real | Estado |
|---------|-----------------|---------|--------|
| Schemas | 16 | 16 | ✅ |
| Tablas | 142 | 104 | ⚠️ -38 |
| Funciones | 127 | 84 | ⚠️ -43 |
| Triggers | 50 | 47 | ✅ ~OK |
| Vistas | 14 | 5 | ⚠️ -9 |
| Foreign Keys | N/A | 171 | ✅ |
| ENUMs | 19 | 33 | ✅ +14 |

---

## CONFLICTOS IDENTIFICADOS

### CATEGORÍA 1: REFERENCIAS Y FOREIGN KEYS

#### CON-FK-001: DUAL ID SYSTEM (P0 - CRÍTICO)
**Descripción:** El sistema tiene dos tablas de usuarios con referencias inconsistentes.

| Tabla | Referencias | Cantidad de Tablas |
|-------|-------------|-------------------|
| `auth.users` | Directas | 48 tablas |
| `auth_management.profiles` | Indirectas | 60+ tablas |

**Tablas Afectadas (auth.users):**
- educational_content.assignments (teacher_id)
- gamification_system.user_stats (user_id)
- gamification_system.user_ranks (user_id)
- progress_tracking.* (múltiples)
- social_features.friendships (user_id, friend_id)
- audit_logging.* (múltiples)

**Tablas Afectadas (profiles):**
- gamification_system.achievements (created_by)
- gamification_system.missions (user_id)
- gamification_system.comodines_inventory (user_id)
- progress_tracking.module_progress (user_id)
- progress_tracking.exercise_attempts (user_id)
- Y 55+ más...

**Impacto:**
- Inconsistencia en consultas JOIN
- Complejidad en mantenimiento
- Riesgo de datos huérfanos

**Recomendación:** Estandarizar todas las referencias a `auth_management.profiles.id` para datos de dominio, reservando `auth.users.id` solo para autenticación.

---

#### CON-FK-002: Schema tenant_management Inexistente (P0 - CRÍTICO)
**Descripción:** 2 tablas referencian un schema que no existe.

**Archivos Afectados:**
```
/apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql
  - Línea 17: REFERENCES tenant_management.tenants(id)

/apps/database/ddl/schemas/progress_tracking/tables/15-student_intervention_alerts.sql
  - Línea ~216: REFERENCES tenant_management.tenants(id)
```

**Schema Correcto:** `auth_management.tenants`

**Impacto:** DDL falla al ejecutar estos archivos.

**Corrección Requerida:**
```sql
-- ANTES:
REFERENCES tenant_management.tenants(id)

-- DESPUÉS:
REFERENCES auth_management.tenants(id)
```

---

#### CON-FK-003: Referencia Circular Diferida (P1 - ALTO)
**Descripción:** Referencia circular entre profiles y schools.

```
auth_management.profiles.school_id → social_features.schools.id
social_features.schools.principal_id → auth_management.profiles.id
```

**Estado:** Manejado con DEFERRABLE pero requiere monitoreo.

---

### CATEGORÍA 2: DUPLICIDADES EN DDL

#### CON-DUP-001: 30 Triggers Duplicados (P0 - CRÍTICO)
**Descripción:** Triggers definidos en DOS lugares diferentes.

**Patrón de Duplicación:**
1. Dentro del archivo `CREATE TABLE` (ej: `03-profiles.sql`)
2. En archivo separado en directorio `triggers/` (ej: `04-trg_initialize_user_stats.sql`)

**Triggers Afectados (muestra):**
| Trigger | En Tabla | En triggers/ |
|---------|----------|--------------|
| trg_initialize_user_stats | ✅ | ✅ |
| trg_update_user_stats_on_exercise | ✅ | ✅ |
| trg_check_rank_promotion | ✅ | ✅ |
| trg_profiles_updated_at | ✅ | ✅ |
| trg_modules_updated_at | ✅ | ✅ |
| ... | ... | ... |

**Total:** 30 triggers duplicados

**Impacto:**
- Riesgo de errores durante carga DDL
- Mantenimiento inconsistente
- Posible doble ejecución

**Recomendación:** Consolidar todos los triggers SOLO en el directorio `triggers/`, eliminándolos de los archivos de tabla.

---

#### CON-DUP-002: Tabla feature_flags Duplicada (P0 - CRÍTICO)
**Descripción:** La tabla se define en 2 archivos SQL diferentes.

**Archivos:**
```
/schemas/system_configuration/tables/01-feature_flags.sql
/schemas/system_configuration/tables/02-feature_flags.sql
```

**Impacto:** Segunda definición sobrescribe la primera silenciosamente.

**Corrección:** Eliminar `02-feature_flags.sql` o consolidar contenido.

---

#### CON-DUP-003: Funciones validate_rueda_inferencias (P1 - ALTO)
**Descripción:** Dos versiones de la función coexisten.

**Archivos:**
```
/schemas/educational_content/functions/14-validate_rueda_inferencias.sql (ACTUAL)
/schemas/educational_content/functions/14-validate_rueda_inferencias-DEPRECATED.sql
```

**Diferencias:**
- Versión actual: Valida fragmentos con keywords (Módulo 2)
- Versión deprecated: Valida matching pairs inferencias vs conclusiones

**Impacto:** Confusión en mantenimiento, riesgo de usar versión incorrecta.

**Corrección:** Eliminar archivo DEPRECATED o moverlo a `/docs/historical-migrations/`.

---

#### CON-DUP-004: Función validate_rueda_inferencias_text (P2 - MEDIO)
**Descripción:** Función definida en dos lugares.

**Ubicaciones:**
```
/functions/14-validate_rueda_inferencias.sql (línea 106 - modulada)
/functions/14-validate_rueda_inferencias_text.sql (línea 9 - inline)
```

**Corrección:** Consolidar en un único archivo.

---

### CATEGORÍA 3: TRIGGERS CONFLICTIVOS

#### CON-TRG-001: Triggers de Rank Promotion Duplicados (P0 - CRÍTICO)
**Descripción:** 2 triggers diferentes actúan sobre el mismo evento.

**Tabla:** `gamification_system.user_stats`
**Evento:** `AFTER UPDATE OF total_xp`

| Trigger | Función | Archivo |
|---------|---------|---------|
| trg_check_rank_promotion | fn_check_rank_promotion() | 02-trg_check_rank_promotion.sql |
| trg_check_rank_promotion_on_xp_gain | trg_check_rank_promotion_fn() | trg_check_rank_promotion_on_xp_gain.sql |

**Impacto:**
- Ambos triggers se ejecutan simultáneamente
- Notificaciones duplicadas al usuario
- ML Coins bonus duplicados al subir de rango

**Corrección URGENTE:** Eliminar uno de los dos triggers.

---

#### CON-TRG-002: 4 Triggers en user_stats (P1 - ALTO)
**Descripción:** La tabla user_stats tiene demasiados triggers que podrían conflicturar.

**Triggers en user_stats:**
1. `trg_check_rank_promotion` (AFTER UPDATE)
2. `trg_check_rank_promotion_on_xp_gain` (AFTER UPDATE)
3. `trg_recalculate_level_on_xp_change` (BEFORE UPDATE)
4. `trg_user_stats_updated_at` (BEFORE UPDATE)

**Orden de Ejecución:**
```
BEFORE UPDATE: recalculate_level → updated_at
AFTER UPDATE: check_rank_promotion → check_rank_promotion_on_xp_gain
```

**Riesgo:** Race conditions y comportamiento impredecible.

---

### CATEGORÍA 4: INTEGRIDAD DE DATOS

#### CON-DAT-001: Usuarios sin Profile (P0 - CRÍTICO)
**Descripción:** 87% de usuarios no tienen profile asociado.

| Métrica | Cantidad | Porcentaje |
|---------|----------|------------|
| Total usuarios (auth.users) | 23 | 100% |
| Usuarios con profile | 3 | 13% |
| **Usuarios SIN profile** | **20** | **87%** |

**Usuarios Afectados (muestra):**
```
- 04de7000-... | estudiante4@demo.glit.edu.mx
- 15898000-... | estudiante15@demo.glit.edu.mx
- 09232000-... | estudiante9@demo.glit.edu.mx
... (17 más)
```

**Impacto:** Usuarios no pueden acceder a funcionalidades de la plataforma.

---

#### CON-DAT-002: Profiles sin user_stats (P0 - CRÍTICO)
**Descripción:** 67% de profiles no tienen user_stats.

| Métrica | Cantidad | Porcentaje |
|---------|----------|------------|
| Total profiles | 3 | 100% |
| Profiles con user_stats | 1 | 33% |
| **Profiles SIN user_stats** | **2** | **67%** |

**Profiles Afectados:**
```
- aaaaaaaa-... | Admin GAMILIT
- bbbbbbbb-... | Profesor Testing
```

**Impacto:** No pueden participar en sistema de gamificación.

---

#### CON-DAT-003: Profiles sin module_progress (P0 - CRÍTICO)
**Descripción:** 100% de profiles no tienen module_progress.

| Métrica | Cantidad | Porcentaje |
|---------|----------|------------|
| Total profiles | 3 | 100% |
| **Profiles SIN module_progress** | **3** | **100%** |

**Impacto:** Ningún usuario puede ver progreso en módulos educativos.

**Causa Raíz:** El trigger `trg_initialize_user_stats` no se ejecutó durante el seeding.

---

## MATRIZ DE PRIORIZACIÓN

| ID | Conflicto | Severidad | Esfuerzo | Prioridad |
|----|-----------|-----------|----------|-----------|
| CON-TRG-001 | Triggers rank duplicados | CRÍTICA | Bajo | **P0** |
| CON-FK-002 | tenant_management inexistente | CRÍTICA | Bajo | **P0** |
| CON-DAT-001 | Usuarios sin profile | CRÍTICA | Medio | **P0** |
| CON-DAT-002 | Profiles sin user_stats | CRÍTICA | Bajo | **P0** |
| CON-DAT-003 | Profiles sin module_progress | CRÍTICA | Bajo | **P0** |
| CON-DUP-002 | feature_flags duplicada | CRÍTICA | Bajo | **P0** |
| CON-DUP-001 | 30 triggers duplicados | ALTA | Alto | **P1** |
| CON-FK-001 | Dual ID system | ALTA | Muy Alto | **P1** |
| CON-DUP-003 | rueda_inferencias deprecated | MEDIA | Bajo | **P2** |
| CON-DUP-004 | rueda_inferencias_text dup | BAJA | Bajo | **P3** |

---

## PLAN DE CORRECCIÓN PROPUESTO

### Fase 1: Correcciones Inmediatas (P0)
**Tiempo estimado:** 2-3 horas

1. **CON-TRG-001:** Eliminar trigger duplicado de rank promotion
2. **CON-FK-002:** Corregir referencias a tenant_management → auth_management
3. **CON-DUP-002:** Eliminar archivo duplicado feature_flags
4. **CON-DAT-*:** Ejecutar script de reparación de datos

### Fase 2: Consolidación DDL (P1)
**Tiempo estimado:** 4-6 horas

5. **CON-DUP-001:** Consolidar 30 triggers en directorio único
6. **CON-FK-001:** Documentar estrategia de migración Dual ID

### Fase 3: Limpieza (P2-P3)
**Tiempo estimado:** 1-2 horas

7. **CON-DUP-003:** Eliminar archivos DEPRECATED
8. **CON-DUP-004:** Consolidar funciones duplicadas

---

## PRÓXIMOS PASOS

Pendiente aprobación del usuario para:

1. ¿Ejecutar correcciones automáticas de Fase 1?
2. ¿Recrear base de datos con DDL corregido?
3. ¿Documentar Dual ID System como deuda técnica?

---

**Archivos Relacionados:**
- `/orchestration/agentes/architecture-analyst/analisis-integridad-bd-2025-11-24/`
- `/docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`
- `/apps/database/docs/database/CHANGELOG.md`
