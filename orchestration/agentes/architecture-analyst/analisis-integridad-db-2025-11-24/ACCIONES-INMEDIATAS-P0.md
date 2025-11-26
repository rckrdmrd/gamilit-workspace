# ACCIONES INMEDIATAS P0 - ANTES DE PRODUCCIÓN

**Fecha:** 2025-11-24
**Prioridad:** CRÍTICA
**Tiempo Estimado:** 2-3 días

---

## RESUMEN: 4 PROBLEMAS CRÍTICOS A RESOLVER

| # | Problema | Impacto | Archivos |
|---|----------|---------|----------|
| 1 | Triggers duplicados (29) | BD no se crea | ~29 archivos |
| 2 | FK sin ON DELETE (34) | Integridad datos | ~14 archivos |
| 3 | initialize_user_missions comentada | Gamificación rota | 1 archivo |
| 4 | Entidades sin schema (6) | EXT-003 bloqueado | 6 archivos |

---

## P0-1: TRIGGERS DUPLICADOS

### Problema
29 triggers están definidos DOS VECES causando error:
```
ERROR: trigger "xxx" for relation "yyy" already exists
```

### Archivos a Corregir (Ejemplos Principales)

**Eliminar trigger de estos archivos de TABLA:**

```bash
# progress_tracking
apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql
# Eliminar: CREATE TRIGGER trg_update_user_stats_on_exercise

apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql
# Eliminar: CREATE TRIGGER exercise_submissions_updated_at

# auth_management
apps/database/ddl/schemas/auth_management/tables/03-profiles.sql
# Eliminar: CREATE TRIGGER trg_initialize_user_stats
```

**Mantener en archivos de TRIGGERS:**
- `progress_tracking/triggers/21-trg_update_user_stats.sql` ✅
- `progress_tracking/triggers/22-trg_exercise_submissions.sql` ✅
- `auth_management/triggers/04-trg_initialize_user_stats.sql` ✅

### Comando de Verificación
```bash
# Listar todos los triggers duplicados
for schema in auth_management progress_tracking gamification_system educational_content; do
  echo "=== $schema ==="
  grep -h "CREATE TRIGGER" apps/database/ddl/schemas/$schema/tables/*.sql 2>/dev/null | sort
  grep -h "CREATE TRIGGER" apps/database/ddl/schemas/$schema/triggers/*.sql 2>/dev/null | sort
done
```

---

## P0-2: FOREIGN KEYS SIN ON DELETE

### Problema
34 FK no especifican política de eliminación.

### Archivos TIER 1 (Críticos - Datos de Usuario)

```sql
-- apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql
-- AGREGAR: ON DELETE CASCADE a student_id y module_id

-- apps/database/ddl/schemas/progress_tracking/tables/skill_assessments.sql
-- AGREGAR: ON DELETE CASCADE a student_id

-- apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql
-- AGREGAR: ON DELETE CASCADE a user_id
```

### Archivos TIER 2 (Importantes - Auditoría)

```sql
-- apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql
-- AGREGAR: ON DELETE SET NULL a user_id (logs no deben borrarse)

-- apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql
-- AGREGAR: ON DELETE SET NULL a acknowledged_by, resolved_by
```

### Template de Corrección
```sql
-- ANTES:
REFERENCES auth_management.profiles(user_id)

-- DESPUÉS:
REFERENCES auth_management.profiles(user_id) ON DELETE CASCADE
-- O
REFERENCES auth_management.profiles(user_id) ON DELETE SET NULL
```

---

## P0-3: FUNCIÓN initialize_user_missions COMENTADA

### Ubicación
```
apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

### Problema Actual (Línea ~45)
```sql
-- PERFORM gamilit.initialize_user_missions(NEW.user_id);
-- TODO: Implementar función (BUG FIX #3: Keep commented for now)
```

### Opciones de Solución

**Opción A: Implementar la función**
```sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_missions(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insertar misiones diarias iniciales
  INSERT INTO gamification_system.scheduled_missions (user_id, mission_id, scheduled_date, status)
  SELECT
    p_user_id,
    m.id,
    CURRENT_DATE,
    'pending'
  FROM gamification_system.missions m
  WHERE m.is_daily = true AND m.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

**Opción B: Documentar por qué está comentada**
- Si hay una razón válida, agregar comentario detallado
- Crear issue de tracking

---

## P0-4: ENTIDADES SIN SCHEMA

### Archivos a Corregir

```typescript
// apps/backend/src/modules/notifications/entities/multichannel/

// 1. notification.entity.ts
// ANTES:
@Entity('notifications')
// DESPUÉS:
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'notifications' })

// 2. notification-log.entity.ts
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'notification_logs' })

// 3. notification-preference.entity.ts
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'notification_preferences' })

// 4. notification-queue.entity.ts
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'notification_queue' })

// 5. notification-template.entity.ts
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'notification_templates' })

// 6. user-device.entity.ts
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: 'user_devices' })
```

### Agregar Constante si Falta
```typescript
// apps/backend/src/shared/constants/database.constants.ts

export const DB_SCHEMAS = {
  // ... existentes
  NOTIFICATIONS: 'notifications',  // Agregar si no existe
};

export const DB_TABLES = {
  // ... existentes
  NOTIFICATIONS: {
    NOTIFICATIONS: 'notifications',
    NOTIFICATION_LOGS: 'notification_logs',
    NOTIFICATION_PREFERENCES: 'notification_preferences',
    NOTIFICATION_QUEUE: 'notification_queue',
    NOTIFICATION_TEMPLATES: 'notification_templates',
    USER_DEVICES: 'user_devices',
  },
};
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### DÍA 1: Triggers + FK

```bash
# 1. Identificar triggers duplicados
./scripts/find-duplicate-triggers.sh

# 2. Eliminar triggers inline de archivos de tabla
# (Hacer manualmente revisando cada archivo)

# 3. Agregar ON DELETE a FK críticas
# (Editar archivos TIER 1 y TIER 2)

# 4. Probar creación de BD
DATABASE_URL="..." ./drop-and-recreate-database.sh
```

### DÍA 2: Función + Entidades

```bash
# 1. Resolver initialize_user_missions
# (Implementar o documentar)

# 2. Agregar schema a entidades
# (Editar 6 archivos .entity.ts)

# 3. Verificar constantes
npm run build --prefix apps/backend

# 4. Probar BD + Backend
```

### DÍA 3: Validación Final

```bash
# 1. Recrear BD limpia
DATABASE_URL="..." ./drop-and-recreate-database.sh

# 2. Ejecutar backend
npm run dev --prefix apps/backend

# 3. Probar flujos críticos
# - Crear usuario
# - Enviar ejercicio
# - Ver notificaciones

# 4. Verificar logs
tail -f /tmp/backend-*.log
```

---

## CHECKLIST DE VALIDACIÓN

### BD
- [ ] `drop-and-recreate-database.sh` ejecuta sin errores
- [ ] Todas las tablas creadas correctamente
- [ ] Todos los triggers activos
- [ ] FKs con políticas definidas

### Backend
- [ ] `npm run build` sin errores
- [ ] `npm run dev` inicia correctamente
- [ ] Conexión a BD exitosa

### Funcional
- [ ] Login funciona
- [ ] Usuario nuevo recibe stats iniciales
- [ ] Usuario puede enviar ejercicios
- [ ] Notificaciones funcionan (EXT-003)

---

## CONTACTO Y ESCALACIÓN

Si encuentras problemas:
1. Documentar error exacto
2. Capturar logs relevantes
3. Crear issue con label `P0-database`

**Este documento debe completarse ANTES de continuar con GAP-T001 (TeacherResourcesPage).**
