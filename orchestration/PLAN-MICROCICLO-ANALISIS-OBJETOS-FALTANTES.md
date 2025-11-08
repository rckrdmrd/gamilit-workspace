# Plan de Microciclos: Análisis e Implementación de Objetos Faltantes Database

**Agente:** ATLAS-DATABASE
**Fecha:** 2025-11-02
**Duración estimada:** 12-16 horas
**Subagentes:** Hasta 10 en paralelo

---

## 🎯 Objetivo

Identificar, analizar e implementar los objetos de base de datos faltantes en la migración desde múltiples fuentes hacia `/gamilit/projects/gamilit/apps/database/`.

## 📊 Estado Inicial

### Inventario Preliminar:

| Ubicación | Archivos SQL | Nota |
|-----------|--------------|------|
| **Destino actual** | 49 | Solo tablas, estructura simple |
| **Fuente gamilit_platform** | 219 | Estructura completa: tables, constraints, views, functions, triggers, RLS |
| **docs/.../06-database** | 9 | DDL adicionales |
| **projects/glit/database** | 54 | Archivos de implementación |
| **backup_20251021_183639** | 2 | Backup reciente |

**Diferencia inicial**: ~170+ archivos faltantes

### Tipos de Objetos Identificados en Fuente:

- ✅ Tables (tablas)
- ❓ Constraints (FK, checks, unique)
- ❓ Views (vistas)
- ❓ Functions (funciones PL/pgSQL)
- ❓ Triggers (disparadores)
- ❓ RLS Policies (Row Level Security)
- ❓ Indexes (índices)
- ❓ Enums (tipos enumerados)

---

## 🔄 Microciclo 1: Inventario Detallado (2h)

**Objetivo:** Crear inventario exhaustivo de TODOS los objetos en las 5 ubicaciones

### Subagentes (5 en paralelo):

#### SA-DB-001: Inventario Destino Actual
**Ubicación:** `/gamilit/projects/gamilit/apps/database/ddl/schemas/`
**Tarea:**
- Listar TODOS los archivos SQL por schema
- Clasificar por tipo (tables, enums, validaciones)
- Extraer nombres de objetos (CREATE TABLE, CREATE VIEW, etc.)
- Contar objetos por schema
- Generar JSON estructurado

**Output:** `/orchestration/inventarios/destino-actual.json`

#### SA-DB-002: Inventario Fuente Principal
**Ubicación:** `/projects/gamilit-docs/.../backup-ddl/gamilit_platform/schemas/`
**Tarea:**
- Listar TODOS los archivos SQL por schema
- Clasificar por tipo (tables, constraints, views, functions, triggers, rls-policies)
- Extraer nombres de objetos
- Identificar dependencias (FK, triggers → tables)
- Generar JSON estructurado

**Output:** `/orchestration/inventarios/fuente-gamilit-platform.json`

#### SA-DB-003: Inventario docs/06-database
**Ubicación:** `/docs/projects/glit/06-database/`
**Tarea:**
- Listar archivos SQL en ddl/, scripts/, migrations/
- Identificar objetos adicionales no contemplados
- Verificar coherencia con documentación existente
- Generar JSON estructurado

**Output:** `/orchestration/inventarios/docs-06-database.json`

#### SA-DB-004: Inventario projects/glit/database
**Ubicación:** `/projects/glit/database/`
**Tarea:**
- Listar archivos SQL
- Identificar versiones alternativas de objetos
- Comparar con fuente principal
- Generar JSON estructurado

**Output:** `/orchestration/inventarios/projects-glit-database.json`

#### SA-DB-005: Inventario Backup Reciente
**Ubicación:** `/docs/projects/glit/database/backups/backup_20251021_183639/`
**Tarea:**
- Analizar archivos de backup
- Identificar si contiene DDL o solo datos
- Verificar timestamp y coherencia
- Generar JSON estructurado

**Output:** `/orchestration/inventarios/backup-20251021.json`

### Criterio de Éxito:
- 5 archivos JSON generados
- Conteo total de objetos por tipo
- Lista completa de schemas encontrados

---

## 🔄 Microciclo 2: Comparación y Matriz de Gaps (1.5h)

**Objetivo:** Generar matriz de objetos faltantes con priorización

### Subagente Principal:

#### SA-DB-006: Comparador de Inventarios
**Input:** 5 JSON de Microciclo 1
**Tarea:**
1. Consolidar todos los objetos encontrados en fuentes
2. Comparar contra destino actual
3. Identificar objetos faltantes por tipo
4. Clasificar por prioridad:
   - **P0**: Tablas base sin dependencias
   - **P1**: Constraints y FK (dependen de P0)
   - **P2**: Views y Functions
   - **P3**: Triggers y RLS
5. Identificar duplicados o conflictos
6. Generar matriz de gaps con dependencias

**Output:**
- `/orchestration/analisis/matriz-gaps.json`
- `/orchestration/analisis/REPORTE-OBJETOS-FALTANTES.md`

### Criterio de Éxito:
- Matriz de gaps clara con 4 niveles de prioridad
- Conteo exacto de objetos faltantes por tipo
- Grafo de dependencias identificado

---

## 🔄 Microciclo 3: Clasificación y Planificación (1h)

**Objetivo:** Crear plan de implementación ordenado

### Subagente:

#### SA-DB-007: Planificador de Implementación
**Input:** matriz-gaps.json
**Tarea:**
1. Ordenar objetos faltantes por dependencias
2. Agrupar en lotes implementables
3. Asignar a microciclos 4-7
4. Estimar tiempo por lote
5. Identificar riesgos de implementación
6. Generar plan de implementación detallado

**Output:** `/orchestration/02-planes/PLAN-IMPLEMENTACION-OBJETOS-FALTANTES.md`

### Criterio de Éxito:
- Plan de implementación con 4-6 lotes
- Dependencias resueltas
- Estimación de tiempo por lote

---

## 🔄 Microciclo 4: Implementar Tablas Faltantes P0 (2-3h)

**Objetivo:** Migrar tablas base sin dependencias

### Subagentes (hasta 5 en paralelo por schema):

#### SA-DB-008 a SA-DB-017: Implementadores de Tablas
**Input:** Lista de tablas P0 del plan
**Tarea por subagente:**
1. Tomar grupo de tablas asignadas (por schema)
2. Copiar archivos SQL desde fuente a destino
3. Ajustar estructura si necesario (nombres, paths)
4. Validar sintaxis SQL
5. Crear _MAP.md si es nuevo schema
6. Documentar cambios

**Output:** Archivos SQL en `/apps/database/ddl/schemas/{schema}/tables/`

### Criterio de Éxito:
- Todas las tablas P0 migradas
- Estructura de carpetas correcta
- Validación de sintaxis pasada

---

## 🔄 Microciclo 5: Implementar Constraints y FK P1 (2-3h)

**Objetivo:** Migrar constraints y foreign keys

### Subagentes (hasta 5 en paralelo por schema):

#### SA-DB-018 a SA-DB-027: Implementadores de Constraints
**Input:** Lista de constraints P1 del plan
**Tarea por subagente:**
1. Tomar grupo de constraints asignados (por schema)
2. Crear carpeta `constraints/` si no existe
3. Copiar archivos SQL de constraints
4. Validar que tablas referenciadas existen
5. Ordenar constraints por dependencias
6. Documentar cambios

**Output:** Archivos SQL en `/apps/database/ddl/schemas/{schema}/constraints/`

### Criterio de Éxito:
- Todos los constraints P1 migrados
- FK validan correctamente
- Sin referencias rotas

---

## 🔄 Microciclo 6: Implementar Views y Functions P2 (2-3h)

**Objetivo:** Migrar vistas y funciones

### Subagentes (hasta 5 en paralelo por schema):

#### SA-DB-028 a SA-DB-037: Implementadores de Views/Functions
**Input:** Lista de views/functions P2 del plan
**Tarea por subagente:**
1. Tomar grupo de objetos asignados (por schema)
2. Crear carpetas `views/` y `functions/` si no existen
3. Copiar archivos SQL
4. Validar dependencias de tablas
5. Validar sintaxis PL/pgSQL
6. Documentar cambios

**Output:**
- Archivos SQL en `/apps/database/ddl/schemas/{schema}/views/`
- Archivos SQL en `/apps/database/ddl/schemas/{schema}/functions/`

### Criterio de Éxito:
- Todas las views/functions P2 migradas
- Dependencias validadas
- Sintaxis correcta

---

## 🔄 Microciclo 7: Implementar Triggers y RLS P3 (2-3h)

**Objetivo:** Migrar triggers y políticas RLS

### Subagentes (hasta 5 en paralelo por schema):

#### SA-DB-038 a SA-DB-047: Implementadores de Triggers/RLS
**Input:** Lista de triggers/RLS P3 del plan
**Tarea por subagente:**
1. Tomar grupo de objetos asignados (por schema)
2. Crear carpetas `triggers/` y `rls-policies/` si no existen
3. Copiar archivos SQL
4. Validar que funciones trigger existen
5. Validar políticas RLS
6. Documentar cambios

**Output:**
- Archivos SQL en `/apps/database/ddl/schemas/{schema}/triggers/`
- Archivos SQL en `/apps/database/ddl/schemas/{schema}/rls-policies/`

### Criterio de Éxito:
- Todos los triggers/RLS P3 migrados
- Dependencias validadas
- Configuración correcta

---

## 🔄 Microciclo 8: Validación Final (2h)

**Objetivo:** Validar integridad y completitud de la migración

### Subagentes (3 en paralelo):

#### SA-DB-048: Validador de Integridad
**Tarea:**
1. Re-inventariar destino actual
2. Comparar con inventario consolidado de fuentes
3. Verificar que todos los objetos fueron migrados
4. Identificar objetos faltantes (si hay)
5. Validar estructura de carpetas
6. Generar reporte de integridad

**Output:** `/orchestration/validaciones/reporte-integridad-final.md`

#### SA-DB-049: Validador de Sintaxis SQL
**Tarea:**
1. Ejecutar validación de sintaxis en TODOS los SQL
2. Identificar errores de sintaxis
3. Validar que FK apuntan a tablas existentes
4. Validar que triggers apuntan a funciones existentes
5. Generar reporte de errores (si hay)

**Output:** `/orchestration/validaciones/reporte-sintaxis-sql.md`

#### SA-DB-050: Generador de Documentación
**Tarea:**
1. Actualizar `TRAZA-TAREAS-DATABASE.md`
2. Actualizar `ESTADO-DATABASE.json`
3. Generar `REPORTE-FINAL-MIGRACION-OBJETOS.md`
4. Actualizar _MAP.md en cada schema modificado
5. Actualizar STATUS.md general

**Output:** Documentación actualizada

### Criterio de Éxito:
- 100% de objetos migrados
- 0 errores de sintaxis
- Documentación actualizada

---

## 📊 Métricas de Éxito Global

| Métrica | Objetivo |
|---------|----------|
| Tablas migradas | 70-90 |
| Total objetos migrados | 150+ |
| Schemas completos | 9-12 |
| Constraints migrados | 50+ |
| Views migradas | 10+ |
| Functions migradas | 20+ |
| Triggers migrados | 10+ |
| RLS policies migradas | 10+ |
| Errores de sintaxis | 0 |
| Referencias rotas | 0 |

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Objetos duplicados en múltiples fuentes
**Mitigación:** Comparador SA-DB-006 identificará duplicados y priorizará por timestamp más reciente

### Riesgo 2: Dependencias circulares
**Mitigación:** Planificador SA-DB-007 detectará ciclos y los escalará para revisión manual

### Riesgo 3: Sintaxis SQL incompatible
**Mitigación:** Validador SA-DB-049 identificará errores antes de integrar

### Riesgo 4: Objetos obsoletos en fuentes antiguas
**Mitigación:** Priorizar fuente gamilit_platform y backup reciente sobre otros

---

## 📁 Estructura de Outputs

```
/orchestration/
├── inventarios/
│   ├── destino-actual.json
│   ├── fuente-gamilit-platform.json
│   ├── docs-06-database.json
│   ├── projects-glit-database.json
│   └── backup-20251021.json
├── analisis/
│   ├── matriz-gaps.json
│   └── REPORTE-OBJETOS-FALTANTES.md
├── 02-planes/
│   └── PLAN-IMPLEMENTACION-OBJETOS-FALTANTES.md
└── validaciones/
    ├── reporte-integridad-final.md
    ├── reporte-sintaxis-sql.md
    └── REPORTE-FINAL-MIGRACION-OBJETOS.md
```

---

## 🎯 Comando de Inicio

```bash
# Paso 1: Crear estructura de outputs
mkdir -p /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/{inventarios,analisis,validaciones}

# Paso 2: Lanzar Microciclo 1 (5 subagentes en paralelo)
# ATLAS-DATABASE orquestará los 5 subagentes SA-DB-001 a SA-DB-005
```

---

**Creado por:** ATLAS-DATABASE
**Versión:** 1.0
**Estado:** ✅ Listo para ejecución
