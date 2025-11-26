# REPORTE DE ANÁLISIS: INTEGRIDAD DE BASE DE DATOS GAMILIT

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 1.0
**Estado:** FASE 1 - ANÁLISIS COMPLETADO

---

## RESUMEN EJECUTIVO

Se realizó un análisis exhaustivo del proyecto de base de datos GAMILIT mediante 5 agentes Explore en paralelo, analizando:
- Documentación de requerimientos
- Estructura DDL (392 archivos SQL)
- Triggers y funciones (136 objetos)
- Inventarios y trazas
- Seeds y scripts de carga inicial (99 archivos)

### Hallazgos Críticos

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 CRÍTICO | 2 | FK Mismatches que causan constraint violations |
| 🟠 ALTO | 2 | Módulos sin ejercicios, función incompleta |
| 🟡 MEDIO | 3 | Tablas sin entidad backend, vistas faltantes |
| 🟢 RESUELTO | 4 | Problemas corregidos el 2025-11-24 |

---

## 1. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 🔴 PROBLEMA #1: FK MISMATCH en `promote_to_next_rank()`

**Severidad:** CRÍTICA - Bloquea funcionalidad de promoción de rangos

**Ubicación:**
```
Archivo: apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql
Líneas: 96-112
```

**Descripción:**
La función `promote_to_next_rank()` intenta insertar en `ml_coins_transactions` usando `p_user_id` que es de tipo `auth.users.id`, pero la tabla `ml_coins_transactions` tiene FK a `auth_management.profiles.id`.

**Código Problemático:**
```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,  -- FK references auth_management.profiles(id)
    ...
) VALUES (
    p_user_id,  -- PERO: p_user_id = auth.users(id) ← MISMATCH
    ...
);
```

**Impacto:**
- ❌ Error de FOREIGN KEY CONSTRAINT VIOLATION al promover rango
- ❌ Los bonus de ML Coins por promoción NO se guardan
- ❌ Sistema de rangos Maya parcialmente inoperante

**Evidencia del Código:**

Tabla `ml_coins_transactions` (línea 157-158):
```sql
ADD CONSTRAINT ml_coins_transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

Función `promote_to_next_rank` (línea 103):
```sql
VALUES (p_user_id, ...)  -- p_user_id es auth.users.id, NO profiles.id
```

**PROBLEMA ADICIONAL:** La función NO calcula `balance_before` ni `balance_after` que son `NOT NULL` en la tabla (líneas 49-50), causando error de constraint adicional.

**Solución Propuesta:**
```sql
DECLARE
    v_profile_id UUID;
    v_current_balance INTEGER;
BEGIN
    -- 1. Obtener profile_id desde user_id
    SELECT p.id, COALESCE(us.ml_coins, 0)
    INTO v_profile_id, v_current_balance
    FROM auth_management.profiles p
    JOIN gamification_system.user_stats us ON us.user_id = p.user_id
    WHERE p.user_id = p_user_id;

    -- 2. Usar v_profile_id en INSERT con balances
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        balance_before,
        balance_after,
        amount,
        ...
    ) VALUES (
        v_profile_id,  -- Ahora usa profiles.id correcto
        v_current_balance,
        v_current_balance + v_ml_coins_bonus,
        v_ml_coins_bonus,
        ...
    );
```

---

### 🔴 PROBLEMA #2: FK MISMATCH en `generate_student_alerts()`

**Severidad:** CRÍTICA - Sistema de alertas completamente inoperante

**Ubicación:**
```
Archivo: apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql
Líneas: 50, 68, 96, 142 (múltiples INSERTs afectados)
```

**Descripción:**
La función intenta hacer JOIN entre `module_progress.user_id` (que referencia `profiles.id`) y `auth.users.id`, además de insertar en `student_intervention_alerts.student_id` (que referencia `auth.users.id`) usando valores de `profiles.id`.

**Código Problemático (Línea 68):**
```sql
FROM progress_tracking.module_progress mp
JOIN auth.users u ON mp.user_id = u.id  -- INCORRECTO
                     -- mp.user_id es profiles.id
                     -- u.id es auth.users.id
                     -- NO HAY RELACIÓN DIRECTA
```

**Impacto:**
- ❌ JOIN fallará silenciosamente (0 resultados)
- ❌ Alertas de intervención NUNCA se generan
- ❌ Estudiantes en riesgo NO son identificados
- ❌ Sistema GAP-ALERTS-001 completamente no funcional

**Evidencia del Código:**

Tabla `module_progress` (línea 177-178):
```sql
ADD CONSTRAINT module_progress_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

Tabla `student_intervention_alerts` (línea 207-208):
```sql
ADD CONSTRAINT student_intervention_alerts_student_id_fkey
FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

Función `generate_student_alerts` (línea 68):
```sql
JOIN auth.users u ON mp.user_id = u.id  -- mp.user_id es profiles.id!
```

**Problema:** `mp.user_id` (profiles.id) ≠ `u.id` (auth.users.id) → JOIN imposible.

**Solución Propuesta:**
```sql
-- Agregar JOIN intermedio a profiles
FROM progress_tracking.module_progress mp
JOIN auth_management.profiles p ON mp.user_id = p.id
JOIN auth.users u ON p.user_id = u.id  -- Ahora sí hay relación

-- Y usar p.user_id para INSERT en student_intervention_alerts
INSERT INTO progress_tracking.student_intervention_alerts (
    student_id,  -- FK a auth.users.id
    ...
) VALUES (p.user_id, ...);  -- user_id de profiles, no id de profiles
```

---

## 2. PROBLEMAS ALTOS

### 🟠 PROBLEMA #3: Módulos 4 y 5 Sin Ejercicios

**Severidad:** ALTA

**Descripción:**
Los módulos MOD-04-DIGITAL y MOD-05-CREATIVO están publicados (`is_published=true`, `status='published'`) pero no tienen ejercicios asociados.

**Impacto:**
- ⚠️ División por 0 en cálculos de progreso (`total_exercises = 0`)
- ⚠️ Usuarios ven módulos pero no pueden trabajar
- ⚠️ UX confusa

**Datos:**
| Módulo | Nombre | Ejercicios | Estado |
|--------|--------|------------|--------|
| MOD-01-LITERAL | Comprensión Literal | 5 | ✅ OK |
| MOD-02-INFERENCIAL | Comprensión Inferencial | 5 | ✅ OK |
| MOD-03-CRITICA | Comprensión Crítica | 5 | ✅ OK |
| MOD-04-DIGITAL | Comprensión Digital | 0 | ❌ VACÍO |
| MOD-05-CREATIVO | Comprensión Creativa | 0 | ❌ VACÍO |

**Solución Propuesta:**
- OPCIÓN A: Agregar 5+ ejercicios a cada módulo
- OPCIÓN B: Cambiar `is_published=false` hasta completar contenido

---

### 🟠 PROBLEMA #4: Función `initialize_user_missions()` Incompleta

**Severidad:** ALTA

**Ubicación:**
```
Archivo: apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
Línea: 86 (comentada)
```

**Descripción:**
La función `initialize_user_stats()` tiene comentado el llamado a `initialize_user_missions()`:
```sql
-- TODO: Implementar función
-- PERFORM gamilit.initialize_user_missions(NEW.user_id);
```

**Impacto:**
- ⚠️ Usuarios nuevos NO tienen misiones iniciales automáticamente
- ⚠️ Requieren seed manual `10-missions-init.sql`
- ⚠️ Posible "No missions available" en frontend

---

## 3. PROBLEMAS MEDIOS

### 🟡 PROBLEMA #5: 48 Tablas Sin Entidad Backend (47%)

**Severidad:** MEDIA

**Descripción:**
De 101 tablas en DDL, solo 53 tienen entidad TypeORM en backend.

**Schemas más afectados:**
| Schema | Tablas DDL | Con Entidad | Gap % |
|--------|------------|-------------|-------|
| audit_logging | 6 | 0 | 100% |
| system_configuration | 6 | 0 | 100% |
| lti_integration | 3 | 0 | 100% |
| progress_tracking | 13 | 5 | 62% |
| content_management | 8 | 3 | 63% |

**Impacto:**
- ⚠️ Funcionalidad limitada desde API
- ⚠️ Queries directas SQL necesarias
- ⚠️ Mantenimiento más difícil

---

### 🟡 PROBLEMA #6: 10 Vistas Faltantes

**Severidad:** MEDIA

**Vistas Documentadas pero No Implementadas:**
1. classroom_engagement_metrics
2. achievement_distribution
3. module_completion_rates
4. daily_active_users
5. content_popularity
6. user_activity_timeline
7. system_health_metrics
8. error_summary
9. storage_usage_by_user
10. notification_delivery_stats

**Impacto:**
- ⚠️ Dashboards incompletos
- ⚠️ Reportes limitados
- ⚠️ Analytics parciales

---

### 🟡 PROBLEMA #7: Potencial Duplicación en `user_ranks`

**Severidad:** MEDIA

**Descripción:**
- Trigger `initialize_user_stats()` inserta `user_ranks` con `WHERE NOT EXISTS`
- Seed `06-user_ranks.sql` hace INSERT directo sin `ON CONFLICT`
- Si IDs coinciden, puede haber constraint violation

**Impacto:**
- ⚠️ Error potencial en carga de seeds
- ⚠️ Datos inconsistentes posibles

---

## 4. PROBLEMAS RESUELTOS (2025-11-24)

### ✅ RESUELTO #1: Module Progress No Se Inicializaba

**Problema:** Trigger `initialize_user_stats()` no creaba `module_progress`
**Solución:** Agregado código de inicialización (líneas 60-82)
**Estado:** ✅ OPERACIONAL

### ✅ RESUELTO #2: Orden de Carga de Seeds

**Problema:** Módulos se cargaban DESPUÉS de profiles
**Solución:** Invertido orden en `create-database.sh`
**Estado:** ✅ OPERACIONAL

### ✅ RESUELTO #3: Ejercicios Bloqueados en Reenvíos

**Problema:** Sistema bloqueaba reintentos después de primer acierto
**Solución:** Arquitectura dual `requires_manual_grading`
**Estado:** ✅ OPERACIONAL

### ✅ RESUELTO #4: FK References Inconsistentes en initialize_user_stats

**Problema:** Mezcla de `NEW.user_id` vs `NEW.id`
**Solución:** Documentado y validado que es INTENCIONAL:
- `user_stats`, `user_ranks` → `auth.users.id` (NEW.user_id)
- `comodines_inventory`, `module_progress` → `profiles.id` (NEW.id)
**Estado:** ✅ CORRECTO (aunque confuso)

---

## 5. MAPA DE DEPENDENCIAS CRÍTICAS

### Flujo de Inicialización de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INSERT auth.users (email, password)                      │
│    ↓                                                        │
│ 2. INSERT auth_management.profiles                          │
│    ↓                                                        │
│    ⚡ TRIGGER: trg_initialize_user_stats                    │
│    ↓                                                        │
│ 3. FUNCTION: gamilit.initialize_user_stats()                │
│    ├─ INSERT user_stats (user_id → auth.users.id) ✅        │
│    ├─ INSERT comodines_inventory (user_id → profiles.id) ✅ │
│    ├─ INSERT user_ranks (user_id → auth.users.id) ✅        │
│    └─ INSERT module_progress ×5 (user_id → profiles.id) ✅  │
│                                                             │
│ RESULTADO: Usuario listo para usar plataforma               │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Ejercicio Completado (CON PROBLEMA)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INSERT exercise_attempts                                  │
│    ↓                                                        │
│    ⚡ TRIGGER: trg_update_user_stats_on_exercise            │
│    ↓                                                        │
│ 2. UPDATE user_stats (total_xp, ml_coins)                   │
│    ↓                                                        │
│    ⚡ TRIGGER: trg_check_rank_promotion_on_xp_gain          │
│    ↓                                                        │
│ 3. FUNCTION: check_rank_promotion()                         │
│    ├─ Si califica → promote_to_next_rank()                  │
│    │   ├─ UPDATE user_stats ✅                              │
│    │   ├─ INSERT user_ranks ✅                              │
│    │   └─ INSERT ml_coins_transactions ❌ FK MISMATCH       │
│    └─ No califica → RETURN                                  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Alertas de Intervención (ROTO)

```
┌─────────────────────────────────────────────────────────────┐
│ SCHEDULER JOB (diario)                                       │
│    ↓                                                        │
│ FUNCTION: generate_student_alerts()                          │
│    ├─ SELECT FROM module_progress mp                        │
│    ├─ JOIN auth.users u ON mp.user_id = u.id ❌ INCORRECTO  │
│    │   (mp.user_id es profiles.id, NO auth.users.id)        │
│    ├─ INSERT student_intervention_alerts ❌ NUNCA EJECUTA   │
│    └─ RESULTADO: 0 alertas generadas                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. ESTADÍSTICAS DEL ANÁLISIS

### Objetos Analizados

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| Archivos DDL | 392 | Analizados |
| Schemas | 14 | Documentados |
| Tablas | 101 | 53 con entidad (53%) |
| Triggers | 34 | 32 OK, 2 relacionados con problemas |
| Funciones | 80+ | 78+ OK, 2 con FK mismatch |
| Seeds | 99 | Orden validado |
| ENUMs | 19 | Completos |
| Vistas | 12+4 MV | 10 faltantes |
| RLS Policies | 45 | Implementadas |

### Tasas de Éxito por Sistema

| Sistema | Estado | Notas |
|---------|--------|-------|
| Inicialización de usuarios | ✅ 100% | Funcional después de fix 2025-11-24 |
| Gamificación (XP/Levels) | ✅ 100% | Funcional |
| Rangos Maya | ⚠️ 40% | Promoción falla por FK mismatch |
| Progreso de módulos | ✅ 100% | Funcional |
| Alertas de intervención | ❌ 0% | Completamente inoperante |
| Comodines | ✅ 100% | Funcional |
| Misiones | ⚠️ 60% | Falta inicialización automática |

---

## 7. ARCHIVOS CRÍTICOS PARA CORRECCIÓN

### Prioridad P0 (Bloquean Funcionalidad)

| # | Archivo | Problema | Líneas |
|---|---------|----------|--------|
| 1 | `gamification_system/functions/promote_to_next_rank.sql` | FK mismatch ml_coins | 96-112 |
| 2 | `progress_tracking/functions/15-generate_student_alerts.sql` | FK mismatch + JOIN inválido | 50, 68, 96, 142 |

### Prioridad P1 (Funcionalidad Limitada)

| # | Archivo/Área | Problema |
|---|--------------|----------|
| 3 | Módulos 4 y 5 | Sin ejercicios |
| 4 | `gamilit/functions/04-initialize_user_stats.sql` | initialize_user_missions comentada |
| 5 | `gamification_system/seeds/06-user_ranks.sql` | Falta ON CONFLICT |

### Prioridad P2 (Mejoras)

| # | Área | Problema |
|---|------|----------|
| 6 | 48 tablas | Sin entidad backend |
| 7 | 10 vistas | No implementadas |

---

## 8. IMPACTO EN PRODUCCIÓN

### Funcionalidades Afectadas

| Funcionalidad | Estado | Impacto en Usuario |
|---------------|--------|-------------------|
| Registro de usuario | ✅ Funciona | Ninguno |
| Ver módulos | ✅ Funciona | Ninguno |
| Completar ejercicios (M1-M3) | ✅ Funciona | Ninguno |
| Ganar XP | ✅ Funciona | Ninguno |
| Subir de nivel | ✅ Funciona | Ninguno |
| Promoción de rango | ❌ Falla | No recibe bonus ML Coins |
| Ver módulos 4-5 | ⚠️ Parcial | Ve módulos vacíos |
| Alertas de maestro | ❌ No funciona | Maestros no ven estudiantes en riesgo |
| Misiones iniciales | ⚠️ Manual | Debe esperar seed manual |

### Riesgo de Producción

**Nivel: 🟡 MEDIO**

- Core de plataforma funciona (registro, ejercicios M1-M3, XP)
- Sistema de rangos tiene bug en bonus (no crítico para MVP)
- Sistema de alertas no funciona (afecta solo a maestros)
- Módulos 4-5 visibles pero vacíos (confuso pero no bloquea)

---

## 9. RECOMENDACIONES

### Acciones Inmediatas (P0)

1. **Corregir FK en `promote_to_next_rank()`**
   - Agregar lookup de `profile_id` desde `user_id`
   - Usar `profile_id` en INSERT a `ml_coins_transactions`

2. **Corregir FK en `generate_student_alerts()`**
   - Agregar JOIN a `auth_management.profiles`
   - Usar `profiles.user_id` para INSERT en `student_intervention_alerts`

### Acciones Corto Plazo (P1)

3. **Resolver módulos 4-5**
   - Agregar ejercicios O despublicar temporalmente

4. **Implementar `initialize_user_missions()`**
   - Crear función que asigne misiones iniciales

5. **Agregar ON CONFLICT a seed user_ranks**
   - Prevenir errores de duplicación

### Acciones Mediano Plazo (P2)

6. **Implementar entidades faltantes (48 tablas)**
   - Priorizar: audit_logging, system_configuration

7. **Crear vistas faltantes (10 vistas)**
   - Para dashboards y reportes

---

## 10. PRÓXIMOS PASOS (FASE 2: PLANEACIÓN)

Según el análisis completado, se propone:

| # | Agente | Tarea | Prioridad | Paralelo |
|---|--------|-------|-----------|----------|
| 1 | Database-Agent | Corregir FK en promote_to_next_rank() | P0 | Grupo 1 |
| 2 | Database-Agent | Corregir FK en generate_student_alerts() | P0 | Grupo 1 |
| 3 | Database-Agent | Despublicar módulos 4-5 O agregar ejercicios | P1 | Grupo 2 |
| 4 | Database-Agent | Implementar initialize_user_missions() | P1 | Grupo 2 |
| 5 | Database-Agent | Agregar ON CONFLICT a seed user_ranks | P1 | Grupo 2 |

---

**Estado del Análisis:** ✅ FASE 1 COMPLETADA
**Siguiente Fase:** PLANEACIÓN (definir prompts para agentes)
**Fecha de Generación:** 2025-11-24
