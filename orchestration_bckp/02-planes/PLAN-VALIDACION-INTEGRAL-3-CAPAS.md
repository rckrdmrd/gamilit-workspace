# Plan de Validación Integral 3-Capas (Database ↔ Backend ↔ Frontend)

**Agente:** ATLAS-DATABASE
**Versión:** 1.0
**Fecha:** 2025-11-02
**Estado:** Planificado

---

## 🎯 Objetivo

Validar la **coherencia completa** entre las 3 capas del sistema GAMILIT:
1. **Database** (PostgreSQL DDL + Seeds)
2. **Backend** (NestJS/TypeScript types/DTOs)
3. **Frontend** (React/TypeScript types/interfaces)

**Enfoque:** Detectar discrepancias, errores de sincronización, ENUMs inconsistentes, tipos faltantes, seeds inválidos.

---

## 📊 Estado Inicial

| Capa | Archivos | Ubicación |
|------|----------|-----------|
| **Database DDL** | 367 SQL | `/apps/database/ddl/schemas/` |
| **Database Seeds** | 32 SQL | `/apps/database/seeds/dev/` |
| **Backend** | 2,750 TS | `/apps/backend/src/` |
| **Backend Types** | 129 TS | Interfaces, DTOs, Types |
| **Frontend** | 104 TS/TSX | `/apps/frontend/src/` |

---

## 🗺️ Estrategia de Validación

### Microciclo V1: Inventario Detallado (2-3 horas)
**Objetivo:** Crear inventarios estructurados de las 3 capas

**Subagentes: 5 en paralelo**

#### SA-VAL-001: Inventario Database DDL
**Modelo:** haiku
**Duración:** 30 min
**Output:** `inventarios/database-ddl.json`

**Tareas:**
- Extraer todos los ENUMs de `/apps/database/ddl/schemas/*/enums/*.sql`
- Extraer todas las tablas y sus columnas de `*/tables/*.sql`
- Extraer tipos compuestos (si existen)
- Extraer vistas y MVIEWs
- Estructura JSON:
```json
{
  "enums": [
    {
      "schema": "gamification_system",
      "name": "maya_rank",
      "values": ["chispa", "brote", "arbol", "bosque"],
      "file": "gamification_system/enums/maya_rank.sql"
    }
  ],
  "tables": [
    {
      "schema": "progress_tracking",
      "name": "exercise_attempts",
      "columns": [
        {"name": "id", "type": "uuid", "nullable": false, "primary_key": true},
        {"name": "user_id", "type": "uuid", "nullable": false, "foreign_key": "auth.users(id)"},
        {"name": "status", "type": "attempt_status", "nullable": false}
      ],
      "file": "progress_tracking/tables/03-exercise_attempts.sql"
    }
  ],
  "types": [],
  "views": []
}
```

---

#### SA-VAL-002: Inventario Backend Types
**Modelo:** haiku
**Duración:** 45 min
**Output:** `inventarios/backend-types.json`

**Tareas:**
- Buscar todos los ENUMs TypeScript en `/apps/backend/src/**/*.ts`
  - Patrón: `export enum X { ... }`
  - Incluir ubicación en constantes (ej: `export const STATUS = { ... } as const`)
- Buscar todas las interfaces/types que mapean tablas
  - Patrón: `export interface X { ... }`
  - Patrón: `export type X = { ... }`
- Buscar DTOs (Data Transfer Objects)
  - Patrón: `export class XDto { ... }`
  - Validar decoradores `@IsEnum()`, `@IsString()`, etc.
- Estructura JSON:
```json
{
  "enums": [
    {
      "name": "MayaRank",
      "values": ["CHISPA", "BROTE", "ARBOL", "BOSQUE"],
      "file": "modules/gamification/types/maya-rank.enum.ts",
      "type": "enum"
    }
  ],
  "interfaces": [
    {
      "name": "ExerciseAttempt",
      "properties": [
        {"name": "id", "type": "string"},
        {"name": "userId", "type": "string"},
        {"name": "status", "type": "AttemptStatus"}
      ],
      "file": "modules/progress/interfaces/exercise-attempt.interface.ts"
    }
  ],
  "dtos": []
}
```

---

#### SA-VAL-003: Inventario Frontend Types
**Modelo:** haiku
**Duración:** 30 min
**Output:** `inventarios/frontend-types.json`

**Tareas:**
- Buscar todos los ENUMs y constantes en `/apps/frontend/src/**/*.ts`
- Buscar todas las interfaces/types
- Identificar tipos compartidos (shared types)
- Estructura JSON similar a backend

---

#### SA-VAL-004: Inventario Seeds
**Modelo:** haiku
**Duración:** 30 min
**Output:** `inventarios/seeds-structure.json`

**Tareas:**
- Analizar 32 archivos SQL en `/apps/database/seeds/dev/`
- Por cada seed:
  - Tabla objetivo
  - Columnas insertadas
  - Valores de ENUMs usados
  - Cantidad de registros
- Detectar:
  - Seeds que referencian tablas inexistentes
  - Seeds con columnas faltantes
  - Seeds con valores de ENUM inválidos

```json
{
  "seeds": [
    {
      "file": "dev/gamification_system/user_stats.sql",
      "table": "gamification_system.user_stats",
      "columns": ["user_id", "maya_rank", "xp_points"],
      "enum_values_used": {
        "maya_rank": ["chispa", "brote"]
      },
      "row_count": 150
    }
  ]
}
```

---

#### SA-VAL-005: Inventario Constantes en Código
**Modelo:** haiku
**Duración:** 30 min
**Output:** `inventarios/constants-code.json`

**Tareas:**
- Buscar archivos `constants.ts`, `enums.ts`, `config.ts` en Backend/Frontend
- Extraer constantes hardcoded que deberían ser ENUMs
- Identificar magic strings que coinciden con valores de DB
- Ejemplo:
```typescript
// Backend: modules/social/constants.ts
export const FRIENDSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
} as const;
```
- Comparar con ENUM de Database: `social_features.friendship_status`

---

### Microciclo V2: Validación Cruzada (2-3 horas)
**Objetivo:** Comparar inventarios y detectar discrepancias

**Subagentes: 5 en paralelo**

#### SA-VAL-006: Comparar ENUMs Database ↔ Backend
**Modelo:** haiku
**Duración:** 30 min
**Output:** `validaciones/enums-db-backend.json`

**Validaciones:**
1. **Nombres:** ¿Existen los mismos ENUMs en ambas capas?
   - Ejemplo: `maya_rank` (DB) vs `MayaRank` (Backend)
2. **Valores:** ¿Los valores coinciden?
   - DB: `['chispa', 'brote', 'arbol', 'bosque']`
   - Backend: `['CHISPA', 'BROTE', 'ARBOL', 'BOSQUE']`
   - **Discrepancia:** Case mismatch
3. **Cantidad:** ¿Misma cantidad de valores?
4. **Orden:** ¿Importa el orden?

**Reporte:**
```json
{
  "total_enums_db": 28,
  "total_enums_backend": 24,
  "matching": 20,
  "discrepancies": [
    {
      "enum": "maya_rank",
      "issue": "case_mismatch",
      "db_values": ["chispa", "brote"],
      "backend_values": ["CHISPA", "BROTE"],
      "severity": "medium"
    },
    {
      "enum": "friendship_status",
      "issue": "missing_in_backend",
      "db_values": ["pending", "accepted", "rejected", "blocked"],
      "backend_values": null,
      "severity": "critical"
    }
  ]
}
```

---

#### SA-VAL-007: Comparar ENUMs Backend ↔ Frontend
**Modelo:** haiku
**Duración:** 30 min
**Output:** `validaciones/enums-backend-frontend.json`

**Validaciones:** Mismas validaciones que SA-VAL-006 pero entre Backend y Frontend

---

#### SA-VAL-008: Validar Types Backend vs Schemas Database
**Modelo:** sonnet (análisis más complejo)
**Duración:** 60 min
**Output:** `validaciones/types-backend-db.json`

**Validaciones:**
1. **Mapeo de tablas:**
   - Por cada tabla en Database, ¿existe interface/DTO en Backend?
   - Ejemplo: `progress_tracking.exercise_attempts` → `ExerciseAttemptDto`
2. **Mapeo de columnas:**
   - Por cada columna en tabla, ¿existe propiedad en interface?
   - Validar tipos compatibles:
     - DB `uuid` → TS `string`
     - DB `integer` → TS `number`
     - DB `timestamp` → TS `Date` o `string`
     - DB `jsonb` → TS `object` o tipo específico
3. **Propiedades faltantes:**
   - Columnas en DB que no están en Backend
   - Propiedades en Backend que no existen en DB
4. **Nullability:**
   - DB `NOT NULL` → TS `required` (sin `?`)
   - DB `NULL` → TS `optional` (con `?`)

**Reporte:**
```json
{
  "tables_analyzed": 64,
  "tables_with_types": 58,
  "tables_without_types": 6,
  "discrepancies": [
    {
      "table": "progress_tracking.exercise_attempts",
      "type": "ExerciseAttemptDto",
      "missing_columns_in_type": ["created_at", "updated_at"],
      "extra_properties_in_type": ["userName"],
      "type_mismatches": [
        {
          "column": "status",
          "db_type": "attempt_status",
          "ts_type": "string",
          "expected_ts_type": "AttemptStatus (enum)",
          "severity": "high"
        }
      ]
    }
  ]
}
```

---

#### SA-VAL-009: Validar Seeds vs DDL
**Modelo:** haiku
**Duración:** 30 min
**Output:** `validaciones/seeds-vs-ddl.json`

**Validaciones:**
1. **Tablas existentes:**
   - Cada seed INSERT debe referenciar tabla que existe en DDL
2. **Columnas válidas:**
   - Columnas en INSERT deben existir en definición de tabla
3. **Valores de ENUM:**
   - Valores insertados en columnas ENUM deben ser válidos
   - Ejemplo: `INSERT INTO user_stats (maya_rank) VALUES ('maestro')` → ¿'maestro' existe en ENUM?
4. **Constraints:**
   - NOT NULL: No insertar NULL en columnas requeridas
   - UNIQUE: No duplicar valores en columnas únicas
   - Foreign Keys: Validar que IDs referenciados existen (si es posible)

**Reporte:**
```json
{
  "seeds_analyzed": 32,
  "errors": [
    {
      "seed": "dev/gamification_system/user_stats.sql",
      "line": 15,
      "error": "invalid_enum_value",
      "column": "maya_rank",
      "value": "maestro",
      "valid_values": ["chispa", "brote", "arbol", "bosque"],
      "severity": "critical"
    }
  ]
}
```

---

#### SA-VAL-010: Validar Columnas Tables vs DTOs
**Modelo:** haiku
**Duración:** 30 min
**Output:** `validaciones/columns-vs-dtos.json`

**Validaciones:**
- Enfoque específico en DTOs (Create, Update)
- Validar decoradores de validación NestJS:
  - `@IsUUID()` → columna tipo `uuid`
  - `@IsEnum()` → columna tipo ENUM
  - `@IsString()` → columna tipo `text`, `varchar`
  - `@IsNumber()` → columna tipo `integer`, `numeric`
  - `@IsOptional()` → columna `NULL`

---

### Microciclo V3: Consolidación y Reporte (1 hora)
**Objetivo:** Generar reporte final y plan de corrección

**Subagentes: 2 en paralelo**

#### SA-VAL-011: Consolidar Discrepancias
**Modelo:** sonnet
**Duración:** 30 min
**Output:** `REPORTE-DISCREPANCIAS-3-CAPAS.md`

**Tareas:**
- Leer los 5 reportes de validación de M-V2
- Clasificar discrepancias por severidad:
  - **CRÍTICAS:** Sistema no funciona (ej: ENUM faltante, tabla sin type)
  - **ALTAS:** Bugs potenciales (ej: nullability incorrecta)
  - **MEDIAS:** Inconsistencias (ej: case mismatch en ENUMs)
  - **BAJAS:** Mejoras (ej: columnas deprecated no eliminadas)
- Generar estadísticas consolidadas
- Priorizar correcciones

---

#### SA-VAL-012: Generar Plan de Corrección
**Modelo:** sonnet
**Duración:** 30 min
**Output:** `PLAN-CORRECCION-DISCREPANCIAS.md`

**Tareas:**
- Por cada discrepancia crítica/alta:
  - Definir acción correctiva
  - Estimar tiempo
  - Especificar archivos a modificar
  - Proporcionar código SQL/TS de ejemplo
- Agrupar correcciones por tipo:
  - **Grupo 1:** ENUMs (sincronizar valores)
  - **Grupo 2:** Types/Interfaces (agregar faltantes)
  - **Grupo 3:** Seeds (corregir valores inválidos)
  - **Grupo 4:** DTOs (agregar decoradores)
- Definir orden de ejecución

---

## 📋 Checklist Pre-Ejecución

- [x] Plan creado y documentado
- [ ] Validar contra `GUIA-ORQUESTACION.md`
- [ ] Confirmar rutas de archivos existen
- [ ] Estimar tiempo total: **6-8 horas**
- [ ] Definir 12 subagentes (5 + 5 + 2)
- [ ] Preparar estructura de carpetas:
  ```
  /orchestration/
  ├── inventarios/
  │   ├── database-ddl.json
  │   ├── backend-types.json
  │   ├── frontend-types.json
  │   ├── seeds-structure.json
  │   └── constants-code.json
  ├── validaciones/
  │   ├── enums-db-backend.json
  │   ├── enums-backend-frontend.json
  │   ├── types-backend-db.json
  │   ├── seeds-vs-ddl.json
  │   └── columns-vs-dtos.json
  ├── REPORTE-DISCREPANCIAS-3-CAPAS.md
  └── PLAN-CORRECCION-DISCREPANCIAS.md
  ```

---

## 🎯 Criterios de Éxito

**Microciclo V1:**
- ✅ 5 inventarios JSON generados
- ✅ 0 errores de ejecución
- ✅ Cobertura 100% de archivos relevantes

**Microciclo V2:**
- ✅ 5 reportes de validación generados
- ✅ Todas las discrepancias documentadas
- ✅ Severidad asignada a cada discrepancia

**Microciclo V3:**
- ✅ Reporte consolidado generado
- ✅ Plan de corrección completo
- ✅ Tiempo estimado por corrección
- ✅ Priorización clara

---

## 🚀 Comando de Inicio

```bash
# Crear estructura de carpetas
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration
mkdir -p inventarios validaciones

# Lanzar Microciclo V1 (5 subagentes en paralelo)
# [ATLAS-DATABASE ejecutará esto después de validar el plan]
```

---

**Versión:** 1.0
**Creado:** 2025-11-02
**Autor:** ATLAS-DATABASE
**Estado:** ✅ Planificado - Listo para ejecución
