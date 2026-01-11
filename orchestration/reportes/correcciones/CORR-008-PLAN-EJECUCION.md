---
id: "CORR-008-PLAN"
title: "Plan de Ejecucion - Valores Iniciales Usuarios de Testing"
type: "Plan"
status: "Done"
priority: "P1"
assignee: "@Orquestador"
related_task: "CORR-008"
related_analysis: "CORR-008-ANALISIS-VALORES-INICIALES-TESTING-USERS.md"
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# PLAN DE EJECUCION: CORR-008 - Valores Iniciales Usuarios de Testing

**Agente:** Orquestador (Tech Lead)
**Prioridad:** P1
**Fecha:** 2026-01-07
**Basado en:** CORR-008-ANALISIS-VALORES-INICIALES-TESTING-USERS.md

---

## OBJETIVO

Modificar los seeds de gamification_system para que los usuarios de testing (admin@, teacher@, student@gamilit.com) mantengan los valores iniciales creados por el trigger `initialize_user_stats()`.

---

## PREREQUISITOS

- [x] Acceso a base de datos gamilit_platform
- [x] Scripts create-database.sh y drop-and-recreate-database.sh funcionales
- [x] Analisis CORR-008 aprobado

---

## PLAN DE EJECUCION

### FASE 1: Modificar Seeds PROD

#### Paso 1.1: Comentar FASE 3 en 05-user_stats.sql (PROD)

**Archivo:** `apps/database/seeds/prod/gamification_system/05-user_stats.sql`

**Cambio:** Comentar completamente la FASE 3 que actualiza usuarios de testing

```sql
-- =====================================================
-- FASE 3: DESHABILITADA - Usuarios de Testing con valores iniciales
-- =====================================================
-- CORRECCION: 2026-01-07 (CORR-008)
-- PROBLEMA: Los usuarios de testing (@gamilit.com) iniciaban con
--           experiencia elevada en lugar de valores iniciales.
-- SOLUCION: Los usuarios de testing ahora usan los valores creados
--           por el trigger initialize_user_stats():
--           - level = 1, total_xp = 0, ml_coins = 100, current_rank = 'Ajaw'
-- =====================================================
```

**Validacion:** El archivo debe ejecutarse sin errores

#### Paso 1.2: Agregar exclusion en 06-user_ranks.sql (PROD)

**Archivo:** `apps/database/seeds/prod/gamification_system/06-user_ranks.sql`

**Cambio:** Agregar condicion WHERE para excluir @gamilit.com

```sql
-- En el FOR LOOP de estudiantes:
AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')

-- En el SELECT de teacher:
AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')

-- En el SELECT de admin:
AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
```

**Validacion:** El archivo debe ejecutarse sin errores

#### Paso 1.3: Remover INSERTs de testing users en 08-user_achievements.sql (PROD)

**Archivo:** `apps/database/seeds/prod/gamification_system/08-user_achievements.sql`

**Cambio:** Eliminar todos los INSERT con UUIDs de testing:
- `cccccccc-cccc-cccc-cccc-cccccccccccc` (student)
- `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` (teacher)
- `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (admin)

**Validacion:** El archivo debe ejecutarse sin errores

---

### FASE 2: Modificar Seeds DEV

#### Paso 2.1: Comentar FASE 3 en 05-user_stats.sql (DEV)

**Archivo:** `apps/database/seeds/dev/gamification_system/05-user_stats.sql`

**Cambio:** Identico a Paso 1.1

#### Paso 2.2: Agregar exclusion en 06-user_ranks.sql (DEV)

**Archivo:** `apps/database/seeds/dev/gamification_system/06-user_ranks.sql`

**Cambio:** Identico a Paso 1.2

#### Paso 2.3: Remover INSERTs de testing users en 08-user_achievements.sql (DEV)

**Archivo:** `apps/database/seeds/dev/gamification_system/08-user_achievements.sql`

**Cambio:** Identico a Paso 1.3

#### Paso 2.4: Agregar exclusion en 09-comodines_inventory.sql (DEV)

**Archivo:** `apps/database/seeds/dev/gamification_system/09-comodines_inventory.sql`

**Cambio:** Agregar condicion WHERE para excluir @gamilit.com

```sql
AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
```

---

### FASE 3: Eliminar Archivo Redundante

#### Paso 3.1: Eliminar 02-test-users.sql (DEV)

**Archivo:** `apps/database/seeds/dev/auth/02-test-users.sql`

**Accion:** Eliminar archivo (redundante con 01-demo-users.sql)

**Justificacion:** El archivo intentaba crear usuarios con UUIDs diferentes pero ON CONFLICT mantenia los originales, haciendolo inutil.

---

### FASE 4: Validacion

#### Paso 4.1: Recrear Base de Datos

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
./drop-and-recreate-database.sh
```

**Criterio de exito:** Script completa sin errores

#### Paso 4.2: Verificar Valores de Testing Users

```sql
SELECT
    p.email,
    us.level,
    us.total_xp,
    us.ml_coins,
    ur.current_rank,
    us.exercises_completed,
    us.achievements_earned
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON p.id = us.user_id
LEFT JOIN gamification_system.user_ranks ur ON p.id = ur.user_id AND ur.is_current = true
WHERE p.email LIKE '%@gamilit.com'
ORDER BY p.email;
```

**Valores esperados:**

| email | level | total_xp | ml_coins | current_rank | exercises_completed | achievements_earned |
|-------|-------|----------|----------|--------------|--------------------|--------------------|
| admin@gamilit.com | 1 | 0 | 100 | Ajaw | 0 | 0 |
| student@gamilit.com | 1 | 0 | 100 | Ajaw | 0 | 0 |
| teacher@gamilit.com | 1 | 0 | 100 | Ajaw | 0 | 0 |

#### Paso 4.3: Verificar Achievements de Testing Users

```sql
SELECT p.email, COUNT(ua.id) as achievement_count
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_achievements ua ON p.id = ua.user_id
WHERE p.email LIKE '%@gamilit.com'
GROUP BY p.email
ORDER BY p.email;
```

**Valores esperados:** Todos con achievement_count = 0

---

## ORDEN DE EJECUCION

| # | Paso | Archivo | Accion |
|---|------|---------|--------|
| 1 | 1.1 | PROD/05-user_stats.sql | Comentar FASE 3 |
| 2 | 1.2 | PROD/06-user_ranks.sql | Agregar exclusion |
| 3 | 1.3 | PROD/08-user_achievements.sql | Remover INSERTs |
| 4 | 2.1 | DEV/05-user_stats.sql | Comentar FASE 3 |
| 5 | 2.2 | DEV/06-user_ranks.sql | Agregar exclusion |
| 6 | 2.3 | DEV/08-user_achievements.sql | Remover INSERTs |
| 7 | 2.4 | DEV/09-comodines_inventory.sql | Agregar exclusion |
| 8 | 3.1 | DEV/auth/02-test-users.sql | ELIMINAR |
| 9 | 4.1 | - | Recrear BD |
| 10 | 4.2 | - | Verificar valores |
| 11 | 4.3 | - | Verificar achievements |

---

## ROLLBACK PLAN

En caso de fallo, restaurar seeds originales desde git:

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
git checkout -- seeds/prod/gamification_system/05-user_stats.sql
git checkout -- seeds/prod/gamification_system/06-user_ranks.sql
git checkout -- seeds/prod/gamification_system/08-user_achievements.sql
git checkout -- seeds/dev/gamification_system/05-user_stats.sql
git checkout -- seeds/dev/gamification_system/06-user_ranks.sql
git checkout -- seeds/dev/gamification_system/08-user_achievements.sql
git checkout -- seeds/dev/gamification_system/09-comodines_inventory.sql
# Re-crear 02-test-users.sql si fue eliminado
./drop-and-recreate-database.sh
```

---

## NOTAS IMPORTANTES

1. **create-database.sh** NO requiere modificaciones - carga seeds en orden correcto
2. Los usuarios DEMO (no @gamilit.com) mantienen sus valores de ejemplo
3. Solo afecta a 3 usuarios de testing especificos

---

**Planificado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** COMPLETADO
