# PLAN FINAL DE EJECUCION - CORRECCIONES DATABASE GAMILIT

**Fecha:** 2026-01-13
**Version:** 2.0.0 (Final - Refinado)
**Estado:** LISTO PARA APROBACION
**Sistema:** SIMCO v3.8+ - MODE:FULL - FASE 6 Completada

---

## RESUMEN DE CORRECCIONES APROBADAS

Basado en el analisis de dependencias, las siguientes correcciones estan listas para ejecucion:

| ID | Correccion | Archivos | Impacto | Estado |
|----|------------|----------|---------|--------|
| CORR-002 | Eliminar funcion duplicada validate_rueda_inferencias | 1 archivo | BAJO | APROBADO |
| CORR-003 | Alinear timestamps en DDL de missions | 1 archivo | BAJO | APROBADO |
| CORR-004 | Corregir tipo progress en TypeORM | 1 archivo | BAJO | APROBADO |
| CORR-001-REV | Feature flags (is_feature_enabled) | - | - | POSTERGADO |

---

## CORRECCIONES POSTERGADAS

### CORR-001-REVISED: is_feature_enabled

**Razon de postergacion:**
- Requiere decision arquitectural sobre unificacion de funciones
- Existe documentacion previa indicando discrepancias DDL-TypeORM
- Impacto BAJO en operacion actual (backend no llama SQL directo)
- Se recomienda crear tarea separada para alineacion completa de feature flags

**Proximos pasos:**
1. Crear tarea: "Alinear feature flags DDL con TypeORM entity"
2. Decidir nombres canonicos (flag_key vs feature_key)
3. Unificar o renombrar funciones SQL
4. Actualizar entidad TypeORM

---

## DETALLE DE CORRECCIONES A EJECUTAR

### CORR-002: Mover validate_rueda_inferencias_text.sql a _deprecated/

**Archivo origen:**
```
/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/educational_content/functions/14-validate_rueda_inferencias_text.sql
```

**Archivo destino:**
```
/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/educational_content/functions/_deprecated/14-validate_rueda_inferencias_text.sql
```

**Razon:**
- Version antigua (2025-11-20, DB-071)
- Reemplazada por version refactorizada en `14-validate_rueda_inferencias.sql`
- La version nueva incluye funcion auxiliar y soporte para categoryExpectations

**Impacto:**
- NINGUNO - La firma de la funcion es identica
- La version nueva ya se ejecuta en create-database.sh

---

### CORR-003: Actualizar timestamps en DDL de missions

**Archivo:**
```
/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/06-missions.sql
```

**Cambios:**
```sql
-- ANTES:
start_date timestamp without time zone DEFAULT now() NOT NULL,
end_date timestamp without time zone NOT NULL,
completed_at timestamp without time zone,
claimed_at timestamp without time zone,
created_at timestamp without time zone DEFAULT now() NOT NULL,
updated_at timestamp without time zone DEFAULT now(),

-- DESPUES:
start_date timestamp with time zone DEFAULT now() NOT NULL,
end_date timestamp with time zone NOT NULL,
completed_at timestamp with time zone,
claimed_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now(),
```

**Razon:**
- Alinear DDL con TypeORM entity que ya usa `timestamp with time zone`
- Mejor practica para aplicaciones multi-zona horaria

**Impacto:**
- NINGUNO en backend (ya usa timestamp with time zone)
- PostgreSQL convierte automaticamente los datos existentes

---

### CORR-004: Corregir tipo progress en TypeORM

**Archivo:**
```
/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/entities/mission.entity.ts
```

**Cambio en linea 123:**
```typescript
// ANTES:
@Column({ type: 'float', default: 0 })
  progress!: number;

// DESPUES:
@Column({ type: 'double precision', default: 0 })
  progress!: number;
```

**Razon:**
- DDL usa `double precision` (8 bytes)
- TypeORM `float` mapea a `real` (4 bytes)
- Alinear para consistencia y precision

**Impacto:**
- BAJO - 1 linea en 1 archivo
- Mejora precision de valores

---

## ORDEN DE EJECUCION

```
PASO 1: CORR-002 - Mover archivo a _deprecated/
        (Sin dependencias)

PASO 2: CORR-003 - Actualizar timestamps en DDL
        (Sin dependencias de PASO 1)

PASO 3: CORR-004 - Corregir tipo en TypeORM
        (Puede ejecutarse en paralelo con PASO 2)

PASO 4: Validacion
        - Ejecutar create-database.sh
        - Compilar backend
        - Ejecutar tests
```

---

## VALIDACION POST-EJECUCION

### 1. Validar DDL

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
# Si hay BD de prueba disponible:
# ./drop-and-recreate-database.sh
```

### 2. Validar Backend

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/backend
npm run build
npm run lint
npm run typecheck
```

### 3. Verificar Cambios

```bash
# Verificar que archivo fue movido
ls -la ddl/schemas/educational_content/functions/_deprecated/

# Verificar timestamps en DDL
grep -n "timestamp" ddl/schemas/gamification_system/tables/06-missions.sql

# Verificar tipo en entity
grep -n "double precision" apps/backend/src/modules/gamification/entities/mission.entity.ts
```

---

## ROLLBACK

Si alguna correccion causa problemas:

```bash
# Restaurar desde Git
git checkout -- apps/database/ddl/schemas/gamification_system/tables/06-missions.sql
git checkout -- apps/backend/src/modules/gamification/entities/mission.entity.ts

# Mover archivo de vuelta
mv ddl/schemas/educational_content/functions/_deprecated/14-validate_rueda_inferencias_text.sql \
   ddl/schemas/educational_content/functions/
```

---

## DOCUMENTACION A ACTUALIZAR POST-EJECUCION

1. **_MAP.md de educational_content** - Documentar archivo deprecated
2. **CHANGELOG del proyecto** - Registrar correcciones
3. **README de database** - Si aplica

---

## APROBACION REQUERIDA

Para proceder con la ejecucion, se requiere aprobacion del usuario.

**Correcciones a ejecutar:**
- [x] CORR-002: Mover validate_rueda_inferencias_text.sql
- [x] CORR-003: Actualizar timestamps en DDL
- [x] CORR-004: Corregir tipo progress en TypeORM

**Correcciones postergadas:**
- [ ] CORR-001-REVISED: Feature flags (crear tarea separada)

---

**Plan refinado completado:** 2026-01-13
**Listo para ejecucion:** Si
**Requiere aprobacion:** Si
