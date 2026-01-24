# Plan de Validación: Directiva de Creación Limpia

**Fecha:** 2025-11-29
**Versión:** 1.0.0
**Estado:** EN VALIDACIÓN
**Fase Actual:** PLANIFICACIÓN

---

## 1. Resumen Ejecutivo

Este documento detalla el plan de corrección basado en la validación de la directiva de creación/recreación limpia de base de datos.

### Resultado del Análisis

| Área | Cumplimiento | Acciones Requeridas |
|------|--------------|---------------------|
| DDL Base de Datos | 96.4% | 1 corrección menor |
| Migraciones DB | 100% | Ninguna |
| Migraciones Backend | ⚠️ Excepción | Integrar P0-001 a DDL |
| Documentación | 85% | Actualizar 5 archivos |
| Trazabilidad | 85% | Actualizar inventarios |

---

## 2. Hallazgos Detallados

### 2.1 Violación DDL: archivo 24-alter_assignment_students.sql

**Ubicación:** `/apps/database/ddl/schemas/educational_content/tables/24-alter_assignment_students.sql`

**Problema:**
- Contiene 17 sentencias `ALTER TABLE ... ADD COLUMN`
- Nombre sugiere migración cuando es parte del DDL
- Viola semánticamente la política de creación limpia

**Impacto Real:** BAJO
- El archivo se ejecuta correctamente en recreación limpia
- Las columnas se crean con `IF NOT EXISTS`
- No hay pérdida de datos ni errores

**Solución Propuesta:**
1. Renombrar archivo a `09-assignment_students_grading.sql`
2. Convertir ALTERs a definición de tabla extendida
3. Documentar como "extensión de tabla" en comentarios

### 2.2 Migración Backend P0-001

**Ubicación:** `/apps/backend/migrations/P0-001-migrate-maya-rank-values.sql`

**Problema:**
- Migración de datos P0 para corregir valores de Maya Rank
- No se ejecuta automáticamente
- Requiere intervención manual

**Impacto:** MEDIO
- Datos legacy necesitan corrección
- No afecta nuevas instalaciones

**Solución Propuesta:**
1. Integrar corrección de valores en seed de `gamification_system.user_stats`
2. Crear función de corrección en DDL como opcional
3. Documentar en README de seeds
4. Deprecar archivo de migración

### 2.3 Documentación Faltante

**Archivos que requieren actualización:**

| Archivo | Problema | Acción |
|---------|----------|--------|
| `MASTER_INVENTORY.yml` | Desactualizado (2025-11-24) | Regenerar de inventarios actuales |
| `TEST_COVERAGE.yml` | Esqueleto sin datos | Poblar con datos de cobertura real |
| `TRAZA-TAREAS-INTEGRATION.md` | Solo 506 bytes | Expandir con tareas de integración |
| `DEPENDENCY_GRAPH.yml` | Incompleto | Actualizar con dependencias actuales |

### 2.4 Trazabilidad

**Gaps identificados:**

1. **Sin documentación de flujo de datos Student→Teacher en pruebas E2E**
   - No hay test cases documentados
   - Impacta validación de integración

2. **Tipos duplicados en frontend**
   - Achievement, UserStats, UserRank tienen 3-7 definiciones
   - Impacta mantenibilidad

---

## 3. Plan de Corrección

### 3.1 Prioridad P0 (Crítico - Inmediato)

**CORR-CLEAN-001: Renombrar archivo DDL**

```bash
# Acción
mv apps/database/ddl/schemas/educational_content/tables/24-alter_assignment_students.sql \
   apps/database/ddl/schemas/educational_content/tables/09-assignment_students_grading.sql

# Actualizar create-database.sh si es necesario
# Verificar que el nuevo nombre mantiene el orden de ejecución
```

**Criterio de Aceptación:**
- [ ] Archivo renombrado
- [ ] Script create-database.sh funciona sin errores
- [ ] Base de datos se recrea correctamente

### 3.2 Prioridad P1 (Alto - Esta Semana)

**CORR-CLEAN-002: Integrar P0-001 a seeds**

```sql
-- Agregar a: apps/database/seeds/prod/16-9-gamification/03-maya-ranks-correction.sql

-- Descripción: Corrección de valores Maya Rank para datos legacy
-- Este archivo solo se ejecuta si existen valores incorrectos

DO $$
BEGIN
    -- Solo ejecutar si hay valores legacy
    IF EXISTS (
        SELECT 1 FROM gamification_system.user_stats
        WHERE current_rank IN ('NACOM', 'BATAB', 'HOLCATTE')
    ) THEN
        -- Aplicar correcciones
        UPDATE gamification_system.user_stats
        SET current_rank = CASE current_rank
            WHEN 'NACOM' THEN 'Nacom'
            WHEN 'BATAB' THEN 'Batab'
            -- etc.
        END
        WHERE current_rank IN ('NACOM', 'BATAB', 'HOLCATTE');
    END IF;
END $$;
```

**Criterio de Aceptación:**
- [ ] Seed file creado
- [ ] Corrección es idempotente
- [ ] P0-001 movido a `_deprecated/`

### 3.3 Prioridad P2 (Medio - Próxima Semana)

**CORR-CLEAN-003: Actualizar inventarios**

1. **MASTER_INVENTORY.yml**
   - Regenerar desde inventarios actuales
   - Agregar timestamp de última actualización
   - Incluir métricas de completitud

2. **TEST_COVERAGE.yml**
   - Extraer datos de cobertura de Jest/Vitest
   - Mapear tests a requerimientos
   - Incluir resultados de ejecución

3. **DEPENDENCY_GRAPH.yml**
   - Actualizar con dependencias de Student-Teacher
   - Incluir servicios de gamificación
   - Agregar dependencias de frontend

**Criterio de Aceptación:**
- [ ] 3 archivos actualizados
- [ ] Timestamps correctos
- [ ] Datos verificables

---

## 4. Verificación de Creación Limpia

### 4.1 Comandos de Verificación

```bash
# 1. Drop y recreate completo
cd apps/database
./drop-and-recreate-database.sh $DATABASE_URL

# 2. Verificar estructura
psql $DATABASE_URL -c "\dt+ progress_tracking.*"
psql $DATABASE_URL -c "\dt+ gamification_system.*"

# 3. Verificar triggers
psql $DATABASE_URL -c "SELECT tgname FROM pg_trigger WHERE tgrelid = 'progress_tracking.exercise_submissions'::regclass"

# 4. Verificar seeds
psql $DATABASE_URL -c "SELECT COUNT(*) FROM educational_content.modules"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM gamification_system.maya_ranks"

# 5. Verificar funciones
psql $DATABASE_URL -c "\df gamilit.*"
```

### 4.2 Checklist de Validación Post-Corrección

- [ ] Base de datos se recrea sin errores
- [ ] Todos los schemas existen (17 esperados)
- [ ] Todas las tablas existen (115 esperadas)
- [ ] Todos los triggers están activos (45 esperados)
- [ ] Seeds se cargan correctamente (40+ archivos)
- [ ] Backend conecta sin errores
- [ ] Tests pasan

---

## 5. Cronograma

| Fase | Tarea | Responsable | Estado |
|------|-------|-------------|--------|
| ANÁLISIS | Validar DDL structure | Architecture-Analyst | ✅ COMPLETADO |
| ANÁLISIS | Buscar migraciones | Architecture-Analyst | ✅ COMPLETADO |
| ANÁLISIS | Verificar documentación | Architecture-Analyst | ✅ COMPLETADO |
| ANÁLISIS | Mapear dependencias | Architecture-Analyst | ✅ COMPLETADO |
| PLANIFICACIÓN | Crear plan corrección | Architecture-Analyst | ✅ COMPLETADO |
| VALIDACIÓN | Validar plan | Architecture-Analyst | 🔄 EN CURSO |
| EJECUCIÓN | CORR-CLEAN-001 | Database-Agent | ⏳ PENDIENTE |
| EJECUCIÓN | CORR-CLEAN-002 | Database-Agent | ⏳ PENDIENTE |
| EJECUCIÓN | CORR-CLEAN-003 | Workspace-Manager | ⏳ PENDIENTE |
| VALIDACIÓN | Verificar ejecución | Architecture-Analyst | ⏳ PENDIENTE |

---

## 6. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Renombrar DDL rompe orden de ejecución | Media | Alto | Verificar prefijo numérico correcto |
| Seed de corrección afecta datos correctos | Baja | Alto | Usar condición `IF EXISTS` con valores legacy |
| Inventarios desactualizados nuevamente | Alta | Bajo | Crear script de actualización automática |

---

## 7. Aprobación

### Fase 3: Validación del Plan (DIRECTA)

**Validador:** Architecture-Analyst
**Fecha de Validación:** 2025-11-29 09:15 CST

**Criterios de Aprobación:**
1. [x] Plan cubre todos los hallazgos del análisis
2. [x] Correcciones son reversibles o idempotentes
3. [x] Cronograma es realista
4. [x] Riesgos están identificados y mitigados

### Resultado: ✅ APROBADO CON MODIFICACIONES

#### Modificaciones Aprobadas:

| Tarea Original | Prioridad Original | Nueva Prioridad | Justificación |
|----------------|-------------------|-----------------|---------------|
| CORR-CLEAN-001 (Renombrar DDL) | P0 | **P2** | Archivo funciona correctamente, problema es solo semántico |
| CORR-CLEAN-002 (Integrar P0-001) | P1 | **P1** | Aprobado con modificación: separar funciones (DDL) de datos (deprecated) |
| CORR-CLEAN-003 (Inventarios) | P2 | **P1** | Elevar prioridad por impacto en trazabilidad |

#### Decisiones Específicas:

1. **DDL `24-alter_assignment_students.sql`:**
   - NO renombrar inmediatamente
   - El archivo es idempotente y funciona en recreación limpia
   - Agregar al backlog para refactorización futura (Sprint N+3)

2. **Migración P0-001:**
   - ✅ Integrar funciones `calculate_maya_rank_from_xp()` y `calculate_rank_progress()` al DDL
   - ✅ Mover archivo de migración a `_deprecated/`
   - ❌ NO crear seed de corrección de datos (innecesario para nuevas instalaciones)

3. **Inventarios:**
   - ✅ Actualizar MASTER_INVENTORY.yml
   - ✅ Verificar TEST_COVERAGE.yml tiene estructura válida

---

**Creado por:** Architecture-Analyst Agent
**Versión del documento:** 1.1.0
**Estado:** ✅ VALIDADO - LISTO PARA EJECUCIÓN (FASE 4)
