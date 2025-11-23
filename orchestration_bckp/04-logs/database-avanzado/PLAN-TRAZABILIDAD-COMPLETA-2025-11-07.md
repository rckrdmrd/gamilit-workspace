# PLAN DE ACCIÓN: TRAZABILIDAD COMPLETA DE BASE DE DATOS

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-11-07
**Agente:** NEXUS-DATABASE-AVANZADO
**Prioridad:** P0 - CRÍTICA

---

## 🎯 OBJETIVO

Establecer trazabilidad COMPLETA y BIDIRECCIONAL entre:
- Requerimientos Funcionales (RF) → Especificaciones Técnicas (ET) → Objetos DDL (SQL)
- Evitar duplicación innecesaria de objetos
- Consolidar referencias directas en código fuente

---

## 📊 SITUACIÓN ACTUAL

### Hallazgos del Análisis

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Documentación General** | ✅ 100% | Todos los objetos documentados en `ESQUEMA-COMPLETO.md` |
| **Referencias en DDL** | ❌ 19% | Solo 12 de 62 tablas tienen referencias RF/ET en SQL |
| **RF Faltantes** | ⚠️ 4 gaps | Misiones, Asignaciones, Notas Profesor, Moderación |
| **ET Faltantes** | ⚠️ 4 gaps | Misiones, Asignaciones, Moderación, Retención |
| **Duplicación Innecesaria** | ✅ 0 casos | No detectada |
| **Ubicación Docs** | ⚠️ Inconsistente | `base-de-datos/` vs `database/` |

**Criticidad:** La falta de referencias en DDL dificulta:
- Mantener sincronización docs ↔ código
- Identificar qué cambiar al modificar un RF
- Auditar impacto de cambios en requerimientos

---

## 📋 PLAN DE ACCIÓN EN 4 FASES

### FASE 1: Crear RF y ET Faltantes (P1 - Alta Prioridad)

**Duración:** 27 horas
**Owner:** Product Owner + NEXUS-DATABASE-AVANZADO

#### 1.1 Crear Requerimientos Funcionales Faltantes

| RF | Título | Objetos Afectados | Esfuerzo | Prioridad |
|----|--------|-------------------|----------|-----------|
| **RF-GAM-004** | Sistema de Misiones y Quests | `missions`, `scheduled_missions` | 4h | P1 |
| **RF-TEACH-001** | Sistema de Asignaciones | `assignments`, `assignment_*` (5 tablas) | 6h | P1 |
| **RF-TEACH-002** | Notas de Profesor | `teacher_notes` | 2h | P1 |
| **RF-MOD-001** | Moderación de Contenido | `flagged_content` | 3h | P1 |

**Total:** 15 horas

**Ubicación:** `docs/01-requerimientos/`

**Template RF:**
```markdown
# RF-XXX-YYY: [Título]

**Módulo:** [GAM/TEACH/MOD]
**Prioridad:** [Alta/Media/Baja]
**Estado:** ✅ Implementado
**Versión:** 1.0
**Fecha:** 2025-11-07

---

## Descripción

[Descripción del requerimiento desde perspectiva de negocio]

---

## Criterios de Aceptación

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

---

## Objetos de Base de Datos

### Tablas
- `schema.table_name` - [Descripción]

### ENUMs
- `enum_name` - [Valores]

### Funciones
- `function_name()` - [Propósito]

---

## Referencias

**Especificación Técnica:** [ET-XXX-YYY](../../02-especificaciones-tecnicas/.../ET-XXX-YYY.md)
**Implementación DDL:**
- `apps/database/ddl/schemas/schema_name/tables/table_name.sql`
- `apps/database/ddl/schemas/schema_name/functions/function_name.sql`

**Backend:**
- `apps/backend/src/modules/module_name/`

**Frontend:**
- `apps/frontend/src/features/feature_name/`
```

---

#### 1.2 Crear Especificaciones Técnicas Faltantes

| ET | Título | RF Asociado | Esfuerzo | Prioridad |
|----|--------|-------------|----------|-----------|
| **ET-GAM-004** | Especificación de Misiones | RF-GAM-004 | 3h | P1 |
| **ET-TEACH-001** | Especificación de Asignaciones | RF-TEACH-001 | 4h | P1 |
| **ET-TEACH-002** | Especificación de Notas | RF-TEACH-002 | 2h | P1 |
| **ET-MOD-001** | Flujo de Moderación | RF-MOD-001 | 3h | P1 |

**Total:** 12 horas

**Ubicación:** `docs/02-especificaciones-tecnicas/`

**Template ET:**
```markdown
# ET-XXX-YYY: [Título]

**Módulo:** [GAM/TEACH/MOD]
**Implementa:** [RF-XXX-YYY](../../01-requerimientos/.../RF-XXX-YYY.md)
**Estado:** ✅ Implementado
**Versión:** 1.0

---

## Arquitectura Técnica

### Esquema de Base de Datos

**Schema:** `schema_name`

**Tablas:**
```sql
-- Tabla principal
CREATE TABLE schema_name.table_name (
    id UUID PRIMARY KEY,
    ...
);
```

**ENUMs:**
```sql
CREATE TYPE enum_name AS ENUM ('value1', 'value2');
```

---

## Decisiones de Diseño

### 1. [Decisión X]
**Problema:** [Descripción]
**Solución:** [Implementación]
**Alternativas consideradas:** [Lista]

---

## Detalles de Implementación

### Backend (NestJS)
**Módulo:** `apps/backend/src/modules/module_name/`
**Entities:** `entity_name.entity.ts`
**Services:** `entity_name.service.ts`
**Controllers:** `entity_name.controller.ts`

### Frontend (React)
**Feature:** `apps/frontend/src/features/feature_name/`
**Types:** `types/entity_name.types.ts`
**Components:** `components/EntityName.tsx`

---

## Referencias a Implementación

**DDL:**
- `apps/database/ddl/schemas/schema_name/tables/table_name.sql`
- `apps/database/ddl/schemas/schema_name/functions/function_name.sql`

**Backend:**
- `apps/backend/src/modules/module_name/entities/entity_name.entity.ts`

**Frontend:**
- `apps/frontend/src/features/feature_name/`
```

---

### FASE 2: Agregar Referencias en Archivos DDL (P0 - Crítica)

**Duración:** 10 horas
**Owner:** NEXUS-DATABASE-AVANZADO

#### 2.1 Template de Referencia para DDL

**Agregar al inicio de CADA archivo SQL:**

```sql
-- =====================================================
-- Tabla: schema_name.table_name
-- Descripción: [Descripción concisa de 1-2 líneas]
--
-- 📚 TRAZABILIDAD:
-- └─ Requerimiento: docs/01-requerimientos/[modulo]/RF-XXX-YYY-titulo.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-YYY-titulo.md
-- └─ Documentación: docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md (Sección X.Y)
--
-- 🔗 IMPLEMENTACIÓN:
-- └─ Backend Entity: apps/backend/src/modules/[modulo]/entities/[entity].entity.ts
-- └─ Frontend Types: apps/frontend/src/types/[tipo].types.ts
--
-- 📅 METADATA:
-- └─ Creado: [YYYY-MM-DD]
-- └─ Última modificación: [YYYY-MM-DD]
-- └─ Versión: [X.Y]
-- =====================================================
```

**Ejemplo Completo:**

```sql
-- =====================================================
-- Tabla: auth_management.profiles
-- Descripción: Perfiles de usuario con información básica,
--              roles, estado de cuenta y preferencias.
--
-- 📚 TRAZABILIDAD:
-- └─ Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md
-- └─ Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md
-- └─ Documentación: docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md (Sección 1.2.2)
--
-- 🔗 IMPLEMENTACIÓN:
-- └─ Backend Entity: apps/backend/src/modules/profiles/entities/profile.entity.ts
-- └─ Frontend Types: apps/frontend/src/types/profile.types.ts
--
-- 📅 METADATA:
-- └─ Creado: 2024-05-15
-- └─ Última modificación: 2025-11-07
-- └─ Versión: 2.1
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_management.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ...
);
```

---

#### 2.2 Tablas a Actualizar (50 archivos)

**Prioridad por Schema:**

| Schema | Tablas Sin Referencia | Prioridad | Esfuerzo |
|--------|----------------------|-----------|----------|
| gamification_system | 8 | P0 | 48 min |
| auth_management | 11 | P0 | 66 min |
| social_features | 6 | P0 | 36 min |
| content_management | 4 | P1 | 24 min |
| progress_tracking | 4 | P1 | 24 min |
| audit_logging | 5 | P1 | 30 min |
| public | 6 | P1 | 36 min |
| system_configuration | 3 | P1 | 18 min |
| educational_content | 2 | P1 | 12 min |
| admin_dashboard | 0 | N/A | 0 min |

**Total:** 50 tablas × 6 min = **300 min = 5 horas**

**Funciones y Triggers:** Otros 5 horas estimadas

**Total Fase 2:** **10 horas**

---

#### 2.3 Script de Automatización (Opcional)

Crear script para validar que TODAS las tablas tengan referencias:

```bash
#!/bin/bash
# validate-ddl-traceability.sh

SCHEMAS_DIR="apps/database/ddl/schemas"
MISSING_REFS=()

for sql_file in $(find $SCHEMAS_DIR -name "*.sql" -type f); do
    if ! grep -q "📚 TRAZABILIDAD" "$sql_file"; then
        MISSING_REFS+=("$sql_file")
    fi
done

if [ ${#MISSING_REFS[@]} -eq 0 ]; then
    echo "✅ Todas las tablas tienen referencias de trazabilidad"
    exit 0
else
    echo "❌ Archivos SIN referencias de trazabilidad:"
    printf '%s\n' "${MISSING_REFS[@]}"
    exit 1
fi
```

**Uso:**
```bash
chmod +x apps/database/scripts/validate-ddl-traceability.sh
npm run validate:db-traceability
```

**Integrar en CI/CD:** Agregar a GitHub Actions para validar en PRs

---

### FASE 3: Consolidar Documentación (P2 - Media)

**Duración:** 6 horas
**Owner:** Tech Lead + NEXUS-DATABASE-AVANZADO

#### 3.1 Resolver Inconsistencia de Ubicación

**Problema:** Documentación en 2 ubicaciones:
- `docs/03-desarrollo/base-de-datos/` (9 archivos ✅)
- `docs/03-desarrollo/database/` (2 archivos, casi vacío)

**Opciones:**

**Opción A (RECOMENDADA):** Consolidar en `database/`
```bash
mv docs/03-desarrollo/base-de-datos/* docs/03-desarrollo/database/
rmdir docs/03-desarrollo/base-de-datos/
```

**Opción B:** Consolidar en `base-de-datos/`
```bash
mv docs/03-desarrollo/database/* docs/03-desarrollo/base-de-datos/
rmdir docs/03-desarrollo/database/
```

**Decisión:** Requiere input del usuario (depende de convención de proyecto)

**Acción:** Actualizar TODAS las referencias en:
- DDL headers
- _MAP.md
- README.md
- Documentación cruzada

**Esfuerzo:** 2 horas

---

#### 3.2 Crear RLS-POLICIES.md

**Ubicación:** `docs/03-desarrollo/database/RLS-POLICIES.md`

**Contenido:**
- Documentar 24 archivos de RLS policies
- Mapear cada política a RF/ET correspondiente
- Estado de implementación (41 activas, 118 pendientes)
- Issue #RLS-001 (Backend NO activa políticas)

**Esfuerzo:** 4 horas

---

### FASE 4: Crear Matriz de Trazabilidad Completa (P2 - Baja)

**Duración:** 8 horas
**Owner:** NEXUS-DATABASE-AVANZADO

#### 4.1 Generar Matriz Excel/CSV

**Formato:**

| Schema | Objeto | Tipo | RF | ET | DDL | Backend | Frontend | Estado |
|--------|--------|------|----|----|-----|---------|----------|--------|
| auth_management | profiles | Tabla | RF-AUTH-001, RF-AUTH-002 | ET-AUTH-001, ET-AUTH-002 | ✅ | ✅ | ✅ | Completo |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**262 filas** (todos los objetos)

**Herramienta:** Script Python o Node.js que parsee DDL y genere CSV

**Esfuerzo:** 6 horas

---

#### 4.2 Integrar en CI/CD

**Script de validación automática:**
- Detecta nuevos objetos SQL sin referencias
- Valida que RF/ET existan para cada objeto
- Genera reporte en PR

**Esfuerzo:** 2 horas

---

## 📅 CRONOGRAMA

### Semana 1

| Día | Tarea | Responsable | Horas |
|-----|-------|-------------|-------|
| Lunes | Crear RF-GAM-004, RF-TEACH-001 | PO + DB Agent | 10h |
| Martes | Crear RF-TEACH-002, RF-MOD-001 | PO + DB Agent | 5h |
| Miércoles | Crear ET-GAM-004, ET-TEACH-001 | Tech Lead + DB Agent | 7h |
| Jueves | Crear ET-TEACH-002, ET-MOD-001 | Tech Lead + DB Agent | 5h |
| Viernes | **Checkpoint:** Validar RF/ET creados | Equipo | 2h |

**Total Semana 1:** 29 horas (Fase 1 completa)

---

### Semana 2

| Día | Tarea | Responsable | Horas |
|-----|-------|-------------|-------|
| Lunes | Actualizar DDL: gamification_system, auth_management | DB Agent | 8h |
| Martes | Actualizar DDL: social_features, content_management | DB Agent | 4h |
| Miércoles | Actualizar DDL: progress_tracking, audit_logging | DB Agent | 4h |
| Jueves | Actualizar DDL: public, system_configuration, educational | DB Agent | 4h |
| Viernes | **Checkpoint:** Validar 50 archivos DDL actualizados | Equipo | 2h |

**Total Semana 2:** 22 horas (Fase 2 completa)

---

### Semana 3

| Día | Tarea | Responsable | Horas |
|-----|-------|-------------|-------|
| Lunes | Consolidar ubicación docs (decidir + ejecutar) | Tech Lead | 2h |
| Martes | Crear RLS-POLICIES.md | DB Agent | 4h |
| Miércoles | Crear matriz de trazabilidad (script) | DB Agent | 6h |
| Jueves | Integrar validación en CI/CD | DevOps + DB Agent | 2h |
| Viernes | **Checkpoint Final:** Validar trazabilidad completa | Equipo | 2h |

**Total Semana 3:** 16 horas (Fases 3 y 4 completas)

---

## 🎯 CRITERIOS DE ÉXITO

### Fase 1
- [x] 4 RF nuevos creados y aprobados por PO
- [x] 4 ET nuevos creados y aprobados por Tech Lead
- [x] Todos los RF/ET referenciados entre sí

### Fase 2
- [x] 100% de archivos DDL con header de trazabilidad
- [x] Referencias RF/ET en TODOS los objetos
- [x] Script de validación funcional

### Fase 3
- [x] Documentación consolidada en 1 ubicación
- [x] RLS-POLICIES.md completo
- [x] Referencias actualizadas en _MAP.md

### Fase 4
- [x] Matriz de trazabilidad generada (262 objetos)
- [x] CI/CD validando trazabilidad en PRs
- [x] Dashboard de métricas accesible

---

## 📊 MÉTRICAS DE PROGRESO

### KPIs

| Métrica | Baseline | Target | Actual |
|---------|----------|--------|--------|
| Tablas con referencias RF/ET en DDL | 19% (12/62) | 100% (62/62) | TBD |
| RF documentados | 92% | 100% | TBD |
| ET documentados | 95% | 100% | TBD |
| Objetos en matriz de trazabilidad | 0 | 262 | TBD |
| CI/CD validando trazabilidad | ❌ | ✅ | TBD |

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| RF/ET rechazados por PO | Media | Alto | Involucrar PO desde día 1, validar alcance |
| Cambios en DDL rompen migrations | Baja | Alto | Solo agregar comentarios, NO modificar estructura |
| Desacuerdo sobre ubicación docs | Media | Bajo | Reunión de decisión en Semana 3 |
| Script de validación falla en CI/CD | Media | Medio | Testear en local antes de integrar |

---

## 📞 RESPONSABLES

| Rol | Persona | Responsabilidad |
|-----|---------|-----------------|
| **Product Owner** | TBD | Aprobar RF nuevos |
| **Tech Lead** | TBD | Aprobar ET nuevos, decidir ubicación docs |
| **NEXUS-DATABASE-AVANZADO** | Agente IA | Ejecutar Fases 2, 3, 4 |
| **DevOps Engineer** | TBD | Integrar validación en CI/CD |
| **QA Lead** | TBD | Validar matriz de trazabilidad |

---

## 📚 REFERENCIAS

**Análisis Detallado:**
- `orchestration/04-logs/database-avanzado/ANALISIS-NEXUS-DATABASE-2025-11-07.md`

**Documentación Actual:**
- `docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md`
- `docs/03-desarrollo/base-de-datos/DATABASE-INVENTORY-MASTER.md`
- `docs/03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md`

**Agente:**
- `.claude/agents/INIT-NEXUS-DATABASE-AVANZADO.md`

---

**Generado por:** NEXUS-DATABASE-AVANZADO
**Fecha:** 2025-11-07
**Versión:** 1.0
**Próxima Revisión:** Checkpoint Semana 1 (viernes)
