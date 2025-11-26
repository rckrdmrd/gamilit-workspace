# REPORTE DE INTEGRIDAD DE BASE DE DATOS - GAMILIT

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 1.0
**Estado:** PROBLEMAS CRÍTICOS IDENTIFICADOS

---

## RESUMEN EJECUTIVO

Se realizó un análisis exhaustivo de la base de datos GAMILIT cruzando:
- Estructura DDL (406+ objetos)
- Referencias FK (217 foreign keys)
- Inventario documentado vs implementación real
- Entidades backend vs tablas DDL
- Duplicidades y conflictos

### Estado General:

| Categoría | Estado | Impacto |
|-----------|--------|---------|
| **Triggers Duplicados** | 🔴 CRÍTICO | Bloquea creación de BD |
| **Foreign Keys sin política** | 🔴 CRÍTICO | Integridad de datos en riesgo |
| **Entidades sin schema** | 🔴 CRÍTICO | Funcionalidad bloqueada |
| **Función comentada** | 🔴 CRÍTICO | Gamificación incompleta |
| **Inventario desfasado** | 🟡 ALTO | +61 funciones, +21 tablas sin documentar |
| **Entidad duplicada** | 🟡 ALTO | Conflicto TypeORM |
| **Índices faltantes** | 🟡 MEDIO | Performance degradado |

---

## 1. ESTRUCTURA DDL ANALIZADA

### 1.1 Totales Encontrados

| Objeto | Cantidad | Documentado | Discrepancia |
|--------|----------|-------------|--------------|
| Schemas | 16 | 14 | +2 nuevos |
| Tablas | 120 | 99 | +21 (21%) |
| Funciones | 97 | 36 | +61 (169%) |
| Triggers | 35 | 34 | +1 |
| Índices | 80+ | ~67 | ~+13 |
| Vistas | 15 | 12 | +3 |
| Enums | 23 | 19 | +4 |
| Foreign Keys | 217 | N/A | - |

### 1.2 Schemas Principales

| Schema | Tablas | Funciones | Referencias Recibidas |
|--------|--------|-----------|----------------------|
| auth_management | 16 | 6 | 107+ (HUB CENTRAL) |
| auth | 1 | 0 | 48+ |
| educational_content | 22 | 26 | 35+ |
| progress_tracking | 16 | 11 | 25+ |
| social_features | 15 | 1 | 20+ |
| gamification_system | 15 | 24 | 15+ |
| gamilit | 0 | 17 | 20+ (funciones compartidas) |

---

## 2. PROBLEMAS CRÍTICOS (P0) - BLOQUEAN PRODUCCIÓN

### 2.1 🔴 TRIGGERS DUPLICADOS (29 instancias)

**Problema:** 29 triggers están definidos DOS VECES:
- Inline en archivos de tabla (`tables/*.sql`)
- En archivos separados (`triggers/*.sql`)

**Impacto:** PostgreSQL lanza error al crear BD porque el trigger ya existe.

**Archivos Afectados:**
```
progress_tracking/tables/03-exercise_attempts.sql    ← trg_update_user_stats_on_exercise
progress_tracking/triggers/21-trg_update_user_stats.sql

progress_tracking/tables/04-exercise_submissions.sql ← exercise_submissions_updated_at
progress_tracking/triggers/22-trg_exercise_submissions.sql

auth_management/tables/03-profiles.sql               ← trg_initialize_user_stats
auth_management/triggers/04-trg_initialize_user_stats.sql

+ 26 triggers adicionales de updated_at en múltiples schemas
```

**Solución Requerida:**
1. Eliminar triggers inline de archivos de tabla
2. Mantener solo la versión en `triggers/*.sql`
3. Verificar orden de carga en scripts de inicialización

---

### 2.2 🔴 FOREIGN KEYS SIN ON DELETE/UPDATE (34 instancias)

**Problema:** 34 foreign keys no tienen política de eliminación definida.

**Impacto:**
- Comportamiento por defecto es `NO ACTION`
- Puede causar errores en cascada o datos huérfanos
- Integridad referencial comprometida

**Archivos Críticos (TIER 1 - Integridad de datos):**
```
progress_tracking/02-learning_sessions.sql     (2 FK)
progress_tracking/skill_assessments.sql        (1 FK)
progress_tracking/05-scheduled_missions.sql    (1 FK)
```

**Archivos Importantes (TIER 2 - Auditoría):**
```
audit_logging/01-audit_logs.sql               (1 FK)
audit_logging/04-system_logs.sql              (1 FK)
audit_logging/03-system_alerts.sql            (2 FK)
audit_logging/02-performance_metrics.sql      (1 FK)
```

**Solución Requerida:**
- Agregar `ON DELETE CASCADE` o `ON DELETE SET NULL` según caso
- Documentar decisión para cada FK

---

### 2.3 🔴 FUNCIÓN initialize_user_missions COMENTADA

**Ubicación:** `gamilit/functions/04-initialize_user_stats.sql`

**Problema:**
```sql
-- PERFORM gamilit.initialize_user_missions(NEW.user_id);
-- TODO: Implementar función (BUG FIX #3: Keep commented for now)
```

**Impacto:** Nuevos usuarios NO reciben misiones iniciales.

**Solución Requerida:**
1. Implementar `initialize_user_missions()`
2. O documentar por qué está comentada y cuál es la alternativa

---

### 2.4 🔴 ENTIDADES NOTIFICATIONS SIN SCHEMA (6 entidades)

**Ubicación:** `backend/src/modules/notifications/entities/multichannel/`

**Problema:** Ninguna tiene `schema` definido en `@Entity()`:
- notification.entity.ts (multichannel)
- notification-log.entity.ts
- notification-preference.entity.ts
- notification-queue.entity.ts
- notification-template.entity.ts
- user-device.entity.ts

**Impacto:** Bloquea funcionalidad de notificaciones EXT-003.

**Solución Requerida:**
```typescript
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: DB_TABLES.NOTIFICATIONS.XXX })
```

---

## 3. PROBLEMAS ALTOS (P1) - REQUIEREN ATENCIÓN INMEDIATA

### 3.1 🟡 ENTIDAD DUPLICADA: assignment-classroom

**Problema:** Existe en 2 módulos:
- `/modules/assignments/entities/assignment-classroom.entity.ts`
- `/modules/social/entities/assignment-classroom.entity.ts`

**DDL:** `social_features.assignment_classrooms`

**Impacto:** TypeORM puede confundirse con entidades duplicadas.

**Solución:** Eliminar copia en `/assignments/`, mantener solo en `/social/`

---

### 3.2 🟡 CONFLICTO DE NOMBRE: notification.entity.ts

**Problema:** 2 entidades con mismo nombre para tablas diferentes:
- `modules/notifications/notification.entity.ts` → `gamification_system.notifications`
- `modules/notifications/multichannel/notification.entity.ts` → `notifications.notifications`

**Impacto:** Conflicto de importes en runtime.

**Solución:** Renombrar a `NotificationGamification` y `NotificationMulticanal`

---

### 3.3 🟡 FALTA DE ÍNDICES EN TABLAS CRÍTICAS

**social_features:** 15 tablas, 0 índices
- classrooms, classroom_members, teams (acceso frecuente sin índices)

**communication:** 1 tabla, 0 índices
- messages (búsquedas frecuentes)

**Solución:** Agregar índices:
```sql
CREATE INDEX idx_classrooms_teacher ON social_features.classrooms(teacher_id, tenant_id);
CREATE INDEX idx_classroom_members_lookup ON social_features.classroom_members(classroom_id, student_id);
CREATE INDEX idx_messages_conversation ON communication.messages(sender_id, recipient_id, created_at);
```

---

### 3.4 🟡 INVENTARIO DESFASADO

**Funciones:**
- Documentadas: 36
- Encontradas: 97
- **61 funciones sin documentar (169% adicional)**

**Tablas:**
- Documentadas: 99
- Encontradas: 120
- **21 tablas sin documentar (21% adicional)**

**Schemas nuevos no documentados:**
- `communication` (1 tabla)
- `notifications` (6 tablas)

---

## 4. PROBLEMAS MEDIOS (P2)

### 4.1 🟠 ÍNDICES REDUNDANTES

```
gamification_system:
- idx_user_achievements_completed + idx_user_achievements_user_completed (mismas columnas)
- idx_user_achievements_user_id (cubierto por índices más específicos)
- idx_user_ranks_user_id (cubierto por idx_user_ranks_is_current)
```

### 4.2 🟠 REFERENCIAS DÉBILES

```
educational_content.exercises.prerequisites:
- Campo UUID[] (array auto-referencial)
- NO TIENE FK constraint
- Comentario: "auto-referencia débil sin FK constraint"
```

### 4.3 🟠 INCONSISTENCIA DE NAMING

- Algunos usan: `created_by`, `reviewed_by`
- Otros usan: `creator_id`, `reviewer_id`

---

## 5. MAPEO ENTIDADES BACKEND ↔ DDL

### 5.1 Estadísticas

| Métrica | Valor |
|---------|-------|
| Entidades TypeORM | 81 |
| Tablas DDL | 121 |
| Mapeos correctos | 55 (68%) |
| Mapeos con problemas | 26 (32%) |
| Constantes DB_TABLES | ~130 |

### 5.2 Entidades Sin Schema o Decorador Incompleto (11)

| Entidad | Problema |
|---------|----------|
| assignment-exercise.entity.ts | Sin @Entity decorador |
| assignment-student.entity.ts | Sin @Entity decorador |
| inventory-transaction.entity.ts | Sin schema/name completo |
| leaderboard-metadata.entity.ts | Sin @Entity decorador |
| message.entity.ts | Sin @Entity decorador |
| user-suspension.entity.ts | Sin @Entity decorador |
| user-preferences.entity.ts | Falta schema |
| teacher-classroom.entity.ts | Falta schema |
| discussion-thread.entity.ts | Falta schema |
| achievement-category.entity.ts | Decorador incompleto |
| teacher-content.entity.ts | Usa strings literales |

---

## 6. DEPENDENCIAS CRÍTICAS

### 6.1 Caminos de Dependencia

```
CREAR USUARIO:
auth.users → auth_management.profiles → gamification_system.user_stats
           → gamilit.initialize_user_missions (⚠️ COMENTADA)

ENVIAR EJERCICIO:
exercises → exercise_submissions → exercise_attempts
         → update_difficulty_progress → user_stats

PROMOCIONAR RANGO:
user_stats → user_ranks → check_rank_promotion → promote_to_next_rank

CREAR AULA:
schools → classrooms → classroom_members → classroom_modules → module_progress
```

### 6.2 Single Points of Failure

- **auth_management:** Sin respaldo, 107+ dependencias
- **auth:** Sin respaldo, 48+ dependencias
- **gamilit:** Sin respaldo, funciones críticas compartidas

---

## 7. MATRIZ DE PRIORIZACIÓN

| ID | Problema | Severidad | Esfuerzo | Impacto |
|----|----------|-----------|----------|---------|
| P0-1 | Triggers duplicados | CRÍTICO | MEDIO | BLOQUEA BD |
| P0-2 | FK sin ON DELETE | CRÍTICO | BAJO | INTEGRIDAD |
| P0-3 | initialize_user_missions | CRÍTICO | MEDIO | GAMIFICACIÓN |
| P0-4 | Entidades sin schema | CRÍTICO | BAJO | NOTIFICACIONES |
| P1-1 | Entidad duplicada | ALTO | BAJO | TYPEORM |
| P1-2 | Conflicto notification | ALTO | BAJO | IMPORTS |
| P1-3 | Índices faltantes | ALTO | BAJO | PERFORMANCE |
| P1-4 | Inventario desfasado | ALTO | ALTO | DOCUMENTACIÓN |
| P2-1 | Índices redundantes | MEDIO | BAJO | OPTIMIZACIÓN |
| P2-2 | Referencias débiles | MEDIO | MEDIO | INTEGRIDAD |
| P2-3 | Naming inconsistente | MEDIO | ALTO | MANTENIMIENTO |

---

## 8. PLAN DE ACCIÓN RECOMENDADO

### SEMANA 1 - CRÍTICOS (ANTES DE PRODUCCIÓN)

#### Día 1-2: Triggers Duplicados
- [ ] Identificar todos los 29 triggers duplicados
- [ ] Eliminar versiones inline de archivos de tabla
- [ ] Verificar script de inicialización
- [ ] Probar creación limpia de BD

#### Día 3: Foreign Keys
- [ ] Agregar ON DELETE/UPDATE a 34 FKs
- [ ] Priorizar TIER 1 (progress_tracking)
- [ ] Documentar decisiones

#### Día 4: Entidades Backend
- [ ] Agregar schema a 6 entidades notifications
- [ ] Eliminar assignment-classroom duplicada
- [ ] Renombrar notification.entity.ts conflictiva

#### Día 5: Validación
- [ ] Ejecutar drop-and-recreate-database.sh
- [ ] Verificar npm run build backend
- [ ] Probar flujos críticos

### SEMANA 2 - ALTOS

- [ ] Agregar índices a social_features y communication
- [ ] Actualizar DATABASE_INVENTORY.yml (+61 funciones, +21 tablas)
- [ ] Completar decoradores @Entity faltantes (11 entidades)
- [ ] Resolver initialize_user_missions

### SEMANA 3 - MEDIOS

- [ ] Eliminar índices redundantes
- [ ] Estandarizar naming conventions
- [ ] Crear tests de integridad BD

---

## 9. SCRIPTS DE VALIDACIÓN RECOMENDADOS

### 9.1 Validar Triggers Duplicados
```bash
# Buscar triggers definidos en tablas Y en triggers/
grep -r "CREATE TRIGGER" apps/database/ddl/schemas/*/tables/ | cut -d: -f2 | sort > /tmp/triggers_tables.txt
grep -r "CREATE TRIGGER" apps/database/ddl/schemas/*/triggers/ | cut -d: -f2 | sort > /tmp/triggers_files.txt
comm -12 /tmp/triggers_tables.txt /tmp/triggers_files.txt
```

### 9.2 Validar FK sin Política
```bash
# Buscar REFERENCES sin ON DELETE/UPDATE
grep -r "REFERENCES" apps/database/ddl/ | grep -v "ON DELETE" | grep -v "ON UPDATE"
```

### 9.3 Validar Entidades sin Schema
```bash
# Buscar entidades sin schema definido
grep -r "@Entity" apps/backend/src/ | grep -v "schema:"
```

---

## 10. CONCLUSIÓN

**Estado Actual:** ⚠️ NO APTO PARA PRODUCCIÓN

La base de datos tiene una arquitectura sólida pero **4 problemas críticos** bloquean el despliegue a producción:

1. **29 triggers duplicados** - BD no se puede crear
2. **34 FK sin política** - Integridad comprometida
3. **Función comentada** - Gamificación incompleta
4. **6 entidades sin schema** - EXT-003 bloqueado

**Recomendación:** Resolver P0 antes de continuar con GAP-T001 (TeacherResourcesPage).

---

**Archivos de Referencia:**
- `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`
- `apps/backend/src/shared/constants/database.constants.ts`
- `apps/database/ddl/` (estructura completa)

**Próximo Paso:** Ejecutar plan de acción Semana 1.
