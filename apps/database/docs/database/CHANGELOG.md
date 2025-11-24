# CHANGELOG - GAMILIT Database

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Última actualización:** 2025-11-24

---

## [2.5.2] - 2025-11-24

### Fixed

#### `create-database.sh` - Orden de Seeds Optimizado (P1)

**Archivo:** `apps/database/create-database.sh`
**Prioridad:** P1 - ALTA (Optimización)

**Cambio:**
Invertido orden de carga de seeds para que módulos se carguen ANTES de profiles.

**Orden Anterior:**
```bash
Línea 502: Seeds: profiles
Línea 513: Seeds: modules (5)
```

**Orden Nuevo:**
```bash
Línea 503: Seeds: modules (5)           ← PRIMERO
Línea 507: Seeds: profiles              ← DESPUÉS
```

**Razón:**
El trigger `initialize_user_stats()` necesita que los módulos existan al momento de crear profiles para poder inicializar `module_progress` correctamente. Con el orden anterior, el trigger se ejecutaba cuando la tabla `modules` estaba vacía, resultando en 0 registros de `module_progress`.

**Impacto:**
- ✅ Trigger crea `module_progress` automáticamente (sin backfill)
- ✅ Seed `01-module_progress.sql` ahora es redundante (pero seguro)
- ✅ Carga limpia 100% funcional desde el trigger
- ✅ Usuarios seed (admin, teacher, student) tienen 5 módulos inmediatamente

**Validación:**
```sql
-- Usuarios seed con 5 módulos cada uno (sin backfill manual)
admin@gamilit.com:   5/5 modules ✅
teacher@gamilit.com: 5/5 modules ✅
student@gamilit.com: 5/5 modules ✅
```

**Referencias:**
- Database-Agent validación #2: Referencias en scripts
- Reporte: `REPORTE-VALIDACION-COMPLETA-USER-INITIALIZATION-2025-11-24.md`

---

### Fixed (Bugs Críticos)

#### `initialize_user_stats()` - 5 Critical Bug Fixes

**Función:** `gamilit.initialize_user_stats()`
**Trigger:** `auth_management.profiles.trg_initialize_user_stats`
**Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
**Prioridad:** P0 - CRÍTICO

**Contexto:**
Trigger ejecutado automáticamente al insertar un nuevo perfil de usuario en `auth_management.profiles`. Inicializa las estadísticas de gamificación en 4 tablas relacionadas.

**Bugs Corregidos:**

1. **BUG FIX #1: Falta inicialización de `module_progress` (CRÍTICO)**
   - **Problema:** Nuevos usuarios no veían módulos disponibles
   - **Causa:** No se creaban registros en `progress_tracking.module_progress`
   - **Solución:** Agregado INSERT para todos los módulos publicados
   - **Impacto:** Usuario puede ver módulos inmediatamente después del registro
   - **Tablas afectadas:** `progress_tracking.module_progress`
   - **Líneas:** 60-82

2. **BUG FIX #2: Errores de clave duplicada en `user_ranks`**
   - **Problema:** Fallas al registrar usuarios si trigger se ejecutaba múltiples veces
   - **Causa:** No había protección contra duplicados (no unique constraint en user_id)
   - **Solución:** Reemplazado `ON CONFLICT` con `WHERE NOT EXISTS`
   - **Impacto:** Registro de usuarios más robusto
   - **Tablas afectadas:** `gamification_system.user_ranks`
   - **Líneas:** 46-58

3. **BUG FIX #3: Función no implementada comentada**
   - **Problema:** Llamada a `initialize_user_missions()` causaba error (función no existe)
   - **Causa:** TODO pendiente sin comentar
   - **Solución:** Línea comentada con nota explicativa
   - **Impacto:** Evita errores en registro
   - **Tablas afectadas:** N/A
   - **Líneas:** 86

4. **Corrección FK: `comodines_inventory.user_id`**
   - **Problema:** Confusión sobre qué FK usar (auth.users.id vs profiles.id)
   - **Clarificación:** `comodines_inventory.user_id` → `profiles.id` (no auth.users.id)
   - **Solución:** Documentado inline con comentario IMPORTANT
   - **Impacto:** Código autodocumentado
   - **Líneas:** 37-43

5. **Corrección FK: `module_progress.user_id`**
   - **Problema:** Confusión sobre qué FK usar
   - **Clarificación:** `module_progress.user_id` → `profiles.id` (no auth.users.id)
   - **Solución:** Documentado inline con comentario IMPORTANT
   - **Impacto:** Código autodocumentado
   - **Líneas:** 63-73

**Tablas Inicializadas por el Trigger:**

| Tabla | Schema | Propósito | FK Usado |
|-------|--------|-----------|----------|
| `user_stats` | `gamification_system` | Estadísticas base (XP, ML Coins) | `auth.users.id` |
| `comodines_inventory` | `gamification_system` | Inventario de comodines | `profiles.id` |
| `user_ranks` | `gamification_system` | Rango Maya inicial (Ajaw) | `auth.users.id` |
| `module_progress` | `progress_tracking` | Progreso de módulos (NUEVO) | `profiles.id` |

**Validación:**
- Recreación completa de BD: EXITOSA
- Tests de integración: 100% pasados
- Carga limpia validada: SÍ
- Log: `create-database-20251124_020000.log`

**Documentación Relacionada:**
- Trigger: `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`
- Función 1: `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
- Función 2: `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

**Referencias:**
- TRAZA-TAREAS-DATABASE.md: Pendiente documentar
- DATABASE_INVENTORY.yml: Actualizado 2025-11-24

---

## [2.5.1] - 2025-11-24

### Changed

#### `validate_fill_in_blank()` - Soporte para alternativas múltiples

**Función:** `educational_content.validate_fill_in_blank()`
**Archivo:** `apps/database/ddl/schemas/educational_content/functions/validate_fill_in_blank.sql`
**Prioridad:** P1

**Cambio:**
Agregado soporte para múltiples alternativas válidas por espacio en blanco.

**Parámetros agregados:**
- `p_content JSONB DEFAULT NULL` - Contenido completo del ejercicio

**Comportamiento:**
Lee `alternatives` desde `content->blanks[].alternatives` y valida contra `correctAnswer` O cualquier alternative.

**Backward Compatible:** SÍ

**Tests:** 7/7 pasados (100%)

**Ejercicios Afectados:**
- 1.3 - Completar Espacios en Blanco (Marie Curie)
  - 6 combinaciones válidas
  - Status: CORREGIDO

**Documentación:**
- Reporte: `orchestration/agentes/database/ejercicio-1-3-validacion-2025-11-24/`
- DATABASE_INVENTORY.yml: Actualizado con `validation_enhancements`

---

## Formato del CHANGELOG

Este archivo sigue el formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Tipos de cambios

- **Added** - Nueva funcionalidad
- **Changed** - Cambios en funcionalidad existente
- **Deprecated** - Funcionalidad obsoleta (será removida)
- **Removed** - Funcionalidad removida
- **Fixed** - Corrección de bugs
- **Security** - Cambios de seguridad

### Prioridades

- **P0 CRÍTICO** - Bloquea funcionalidad core, requiere fix inmediato
- **P1 ALTO** - Impacta experiencia de usuario, fix en 24-48h
- **P2 MEDIO** - Mejora deseable, fix en 1 semana
- **P3 BAJO** - Optimización o mejora menor

---

**Mantenido por:** Database-Agent
**Política:** Actualizar con cada migration, función modificada o cambio estructural
