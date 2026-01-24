# EJECUCIÓN: CORR-006 - Crear Seeds de Assignments

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Tarea ID:** CORR-006

---

## Archivos Implementados

### 1. Seed de Assignments (REESCRITO COMPLETAMENTE)

**Archivo:** `apps/database/seeds/prod/educational_content/05-assignments.sql`
**Versión:** 2.0
**Acción:** Reescritura completa
**Status:** ✅ COMPLETADO

**Ubicación:**
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/prod/educational_content/05-assignments.sql
```

**Backup creado:**
```
05-assignments.sql.backup.20251124_HHMMSS
```

#### Estructura Implementada

```sql
-- =====================================================
-- Seed: educational_content.assignments (PROD)
-- Description: Assignments demo para Portal Teacher
-- Environment: PRODUCTION
-- Dependencies: auth.users (teachers)
-- Order: 05
-- Created: 2025-11-24
-- Version: 2.0 (Corregido CORR-006)
-- =====================================================

SET search_path TO educational_content, auth, public;

-- LIMPIAR DATOS EXISTENTES (SOLO DEMO)
DELETE FROM educational_content.assignments
WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- OBTENER IDs Y VALIDAR
DO $$
DECLARE
    v_teacher_id UUID;
BEGIN
    SELECT id INTO v_teacher_id
    FROM auth.users
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
        RAISE EXCEPTION 'Teacher no encontrado';
    END IF;

    -- INSERT de 9 assignments
    INSERT INTO educational_content.assignments (...) VALUES
    (...),  -- 9 assignments
    ...
    ;

    -- Validaciones con RAISE NOTICE
END $$;
```

#### Cambios Clave Respecto a v1.0

| Aspecto | v1.0 (ROTO) | v2.0 (CORREGIDO) |
|---------|-------------|------------------|
| Tablas referenciadas | assignment_classrooms ❌<br>assignment_exercises ❌ | Solo assignments ✅ |
| IDs | UUIDs hardcodeados | gen_random_uuid() ✅ |
| Cantidad | 12 assignments | 9 assignments ✅ |
| Fechas | NOW() sin función custom | gamilit.now_mexico() ✅ |
| Validaciones | Ninguna | RAISE EXCEPTION + RAISE NOTICE ✅ |
| Columnas | Incluía campos inexistentes | Solo campos del DDL ✅ |

---

## Assignments Creados (9 total)

### Módulo 1: Comprensión Literal (3)

1. **Homework - Crucigrama y Vocabulario Científico**
   - Type: `homework`
   - Points: 100
   - Due: hace 7 días (OVERDUE)
   - Status: `published`
   - Description: Completa el crucigrama sobre términos científicos de Marie Curie

2. **Quiz - Línea de Tiempo de Marie Curie**
   - Type: `quiz`
   - Points: 50
   - Due: en 2 días (SOON - URGENTE)
   - Status: `published`
   - Description: Organiza cronológicamente los eventos importantes

3. **Practice - Mapa Conceptual**
   - Type: `practice`
   - Points: 75
   - Due: en 10 días (FUTURE)
   - Status: `published`
   - Description: Crea un mapa conceptual de descubrimientos

### Módulo 2: Comprensión Inferencial (3)

4. **Homework - Relaciones Causa-Efecto**
   - Type: `homework`
   - Points: 120
   - Due: hace 3 días (OVERDUE)
   - Status: `published`
   - Description: Identifica 3 relaciones causa-efecto en la vida de Marie Curie

5. **Quiz - Rueda de Inferencias**
   - Type: `quiz`
   - Points: 100
   - Due: en 5 días (ACTIVE)
   - Status: `published`
   - Description: Resuelve preguntas de inferencia usando la Rueda

6. **Practice - Análisis de Decisiones**
   - Type: `practice`
   - Points: 150
   - Due: en 15 días (FUTURE)
   - Status: `published`
   - Description: Analiza decisiones importantes con evidencia del texto

### Módulo 3: Comprensión Crítica (3)

7. **Homework - Ensayo Crítico**
   - Type: `homework`
   - Points: 200
   - Due: en 7 días (ACTIVE)
   - Status: `published`
   - Description: Escribe un ensayo sobre el rol de la mujer en ciencia (300-400 palabras)

8. **Quiz - Evaluación Crítica Express**
   - Type: `quiz`
   - Points: 50
   - Due: en 3 días (SOON - URGENTE)
   - Status: `published`
   - Description: Quiz corto (15 min) con 3 preguntas de evaluación crítica

9. **Exam - Proyecto Final Multimedia**
   - Type: `exam`
   - Points: 300
   - Due: en 30 días (FUTURE)
   - Status: `draft` (NO publicado)
   - Description: Presentación multimedia sobre impacto de Marie Curie (5-7 min)

---

## Distribución de Assignments

### Por Estado
| Estado | Cantidad | Descripción |
|--------|----------|-------------|
| OVERDUE | 2 | Vencidos (hace 7 y 3 días) |
| SOON | 2 | Vencen en menos de 3 días |
| ACTIVE | 2 | Vencen entre 5-7 días |
| FUTURE | 2 | Vencen en 10-30 días |
| DRAFT | 1 | No publicado aún |

### Por Tipo
| Tipo | Cantidad | Points Range |
|------|----------|--------------|
| homework | 3 | 100-200 pts |
| quiz | 3 | 50-100 pts |
| practice | 2 | 75-150 pts |
| exam | 1 | 300 pts |

### Por Status de Publicación
| Status | Cantidad |
|--------|----------|
| Published | 8 |
| Draft | 1 |

---

## Validaciones Implementadas

### Validación Pre-INSERT
```sql
IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Teacher "teacher@gamilit.com" no encontrado. Ejecutar primero seed de auth/users.';
END IF;
```

### Validaciones Post-INSERT
1. **Conteo total de assignments**
   ```sql
   SELECT COUNT(*) FROM educational_content.assignments;
   -- Esperado: 9
   ```

2. **Conteo por status de publicación**
   ```sql
   -- Publicados vs Borradores
   ```

3. **Conteo por estado de urgencia**
   ```sql
   -- OVERDUE, SOON, ACTIVE, FUTURE, DRAFT
   ```

4. **Listado completo con detalles**
   ```sql
   -- Título, tipo, puntos, fecha de vencimiento, urgencia
   ```

---

## Comandos Ejecutados

### 1. Backup del archivo original
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/prod/educational_content
cp 05-assignments.sql 05-assignments.sql.backup.$(date +%Y%m%d_%H%M%S)
```
**Status:** ✅ Ejecutado exitosamente

### 2. Reescritura del archivo
```bash
# Archivo completamente reescrito usando Write tool
# Ubicación: apps/database/seeds/prod/educational_content/05-assignments.sql
```
**Status:** ✅ Completado

### 3. Actualización de create-database.sh
```bash
# Línea 517 actualizada:
# De: "Seeds: assignments (12 demo for Teacher Portal - commit db82449)"
# A:  "Seeds: assignments (9 demo for Teacher Portal - CORR-006)"
```
**Status:** ✅ Completado

---

## Problemas Encontrados y Soluciones

### Problema 1: Seed v1.0 con referencias a tablas inexistentes
**Descripción:** El archivo original intentaba insertar en `assignment_classrooms` y `assignment_exercises` que no existen en el DDL actual.

**Solución:** Reescribir completamente el seed usando SOLO las columnas de la tabla `assignments` que existen en el DDL.

**Status:** ✅ RESUELTO

### Problema 2: UUIDs hardcodeados
**Descripción:** El seed v1.0 usaba UUIDs hardcodeados que podían causar conflictos.

**Solución:** Usar `gen_random_uuid()` para generar IDs únicos en cada ejecución.

**Status:** ✅ RESUELTO

### Problema 3: Falta de validaciones
**Descripción:** El seed v1.0 no validaba la existencia del teacher ni reportaba el estado de la carga.

**Solución:** Agregar bloques de validación con RAISE EXCEPTION y RAISE NOTICE.

**Status:** ✅ RESUELTO

### Problema 4: DATABASE_URL no definida en entorno actual
**Descripción:** No se pudo ejecutar validación real contra base de datos.

**Solución:** Validación será ejecutada por el usuario o en siguiente fase cuando DATABASE_URL esté disponible.

**Status:** ⏳ PENDIENTE (validación manual requerida)

---

## Resultados Esperados

### Al Ejecutar el Seed

1. **Mensaje de inicio**
   ```
   NOTICE:  Usando teacher_id: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
   ```

2. **Mensaje de resumen**
   ```
   NOTICE:  ========================================
   NOTICE:  ASSIGNMENTS DEMO CREADOS EXITOSAMENTE
   NOTICE:  ========================================
   NOTICE:  Total assignments: 9
   NOTICE:    - Publicados: 8
   NOTICE:    - Borradores: 1
   NOTICE:
   NOTICE:  Estado de assignments publicados:
   NOTICE:    - OVERDUE (vencidos): 2
   NOTICE:    - SOON (vencen <3 días): 2
   NOTICE:    - FUTURE (vencen >3 días): 4
   NOTICE:  ========================================
   NOTICE:  ✓ Assignments demo creados correctamente
   ```

3. **Listado de assignments**
   ```
   NOTICE:  Listado de assignments demo:
   NOTICE:  ========================================
   NOTICE:    [OVERDUE] Tarea 1.1: Crucigrama y Vocabulario Científico - homework (100 pts) - Vence: 2025-11-17 ...
   NOTICE:    [OVERDUE] Tarea 2.1: Relaciones Causa-Efecto - homework (120 pts) - Vence: 2025-11-21 ...
   NOTICE:    [SOON] Quiz 1.2: Línea de Tiempo de Marie Curie - quiz (50 pts) - Vence: 2025-11-26 ...
   ...
   ```

---

## Archivos Modificados

### 1. Seeds
- `apps/database/seeds/prod/educational_content/05-assignments.sql` (✅ REESCRITO)

### 2. Scripts
- `apps/database/create-database.sh` (✅ ACTUALIZADO - línea 517)

### 3. Backups
- `apps/database/seeds/prod/educational_content/05-assignments.sql.backup.YYYYMMDD_HHMMSS` (✅ CREADO)

---

## Próximos Pasos

1. ⏳ Ejecutar validación completa con carga limpia
2. ⏳ Verificar que Portal Teacher muestra los 9 assignments
3. ⏳ Completar documentación (04-VALIDACION.md)
4. ⏳ Actualizar inventarios (MASTER_INVENTORY.yml)
5. ⏳ Actualizar trazas (TRAZA-TAREAS-DATABASE.md)

---

**Status Global:** ✅ IMPLEMENTACIÓN COMPLETADA (75%)
**Pendiente:** Validación con DATABASE_URL disponible
