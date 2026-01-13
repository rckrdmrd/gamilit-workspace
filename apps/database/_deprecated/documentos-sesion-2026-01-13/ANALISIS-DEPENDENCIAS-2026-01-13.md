# ANALISIS DE DEPENDENCIAS - CORRECCIONES DATABASE GAMILIT

**Fecha:** 2026-01-13
**Version:** 1.0.0
**Fase:** FASE 5 - Analisis de dependencias
**Sistema:** SIMCO v3.8+

---

## RESUMEN EJECUTIVO

Se analizo el impacto de cada correccion propuesta en el codigo dependiente:

| Correccion | Archivos Backend Afectados | Impacto | Riesgo |
|------------|---------------------------|---------|--------|
| CORR-001-REVISED | 1 (documentacion) | BAJO | BAJO |
| CORR-002 | 1 (DTO referencia) | BAJO | BAJO |
| CORR-003 (timestamps) | 22 (pero alinea con TypeORM) | BAJO | BAJO |
| CORR-004 (progress) | 1 (entity) | BAJO | BAJO |

**Conclusion:** TODAS las correcciones tienen impacto BAJO y pueden ejecutarse con seguridad.

---

## CORR-001-REVISED: is_feature_enabled

### Archivos que Referencian

| Ubicacion | Archivo | Tipo de Referencia |
|-----------|---------|-------------------|
| Backend | FEATURE-FLAGS-IMPLEMENTATION.md | Solo documentacion |

### Hallazgo Importante

El documento `FEATURE-FLAGS-IMPLEMENTATION.md` ya documenta:
- Existen DISCREPANCIAS entre entidad TypeORM y tabla SQL
- Nombres de campos diferentes (`feature_key` vs `flag_key`)
- Ya hay una **ACCION REQUERIDA** documentada para resolver esto

### Uso de la Funcion SQL

```
Backend NO llama directamente las funciones SQL is_feature_enabled()
Backend usa su propio FeatureFlagsService que consulta la tabla directamente
Las funciones SQL son helpers para uso en triggers/procedures
```

### Impacto

- **Backend:** NINGUNO (no usa la funcion SQL directamente)
- **Database:** BAJO (triggers podrian usarla)
- **Riesgo:** BAJO

### Recomendacion

POSTERGAR esta correccion. Requiere decision arquitectural sobre:
1. Unificar las dos funciones
2. Renombrar una
3. Alinear entity con DDL (problema mayor documentado)

---

## CORR-002: validate_rueda_inferencias_text

### Archivos que Referencian

| Ubicacion | Archivo | Tipo de Referencia |
|-----------|---------|-------------------|
| Backend | progress/dto/answers/rueda-inferencias-answers.dto.ts | Comentario (linea 23) |

### Uso de la Funcion

```typescript
// Del DTO:
// Backend calls validate_rueda_inferencias_text() for each fragment individually.
```

La funcion es llamada desde el backend via TypeORM raw query o stored procedure.

### Comparacion de Versiones

| Aspecto | Version Antigua (14-text.sql) | Version Nueva (14.sql) |
|---------|------------------------------|------------------------|
| Firma | `(UUID, TEXT, TEXT) -> JSONB` | `(UUID, TEXT, TEXT) -> JSONB` |
| Funcionalidad base | Valida keywords | Valida keywords |
| Funcion auxiliar | NO | SI (_validate_single_fragment) |
| categoryExpectations | NO | SI |

**FIRMAS IDENTICAS** - El backend no necesita cambios.

### Impacto

- **Backend:** NINGUNO (misma firma de funcion)
- **Database:** BAJO (eliminar archivo redundante)
- **Riesgo:** BAJO

### Recomendacion

PROCEDER con la correccion. Es seguro mover el archivo antiguo a `_deprecated/`.

---

## CORR-003: Timestamps en tabla missions

### Archivos que Referencian

**22 archivos en Backend relacionados con missions:**

```
Services (7):
- missions.service.ts
- mission-claim.service.ts
- mission-generator.service.ts
- mission-progress.service.ts
- classroom-missions.service.ts
- achievements.service.ts
- services/index.ts

Entities (5):
- mission.entity.ts (PRINCIPAL)
- classroom-mission.entity.ts
- mission-template.entity.ts
- maya-rank.entity.ts
- achievement-category.entity.ts

Controllers (3):
- missions.controller.ts
- classroom-missions.controller.ts
- controllers/index.ts

DTOs (5):
- assign-classroom-mission.dto.ts
- classroom-mission-response.dto.ts
- mission-stats.dto.ts
- update-mission-progress.dto.ts
- dto/index.ts

Tests (2):
- mission-generator.service.spec.ts
- missions.service.spec.ts
```

### Analisis del Cambio

**Estado Actual:**
- DDL: `timestamp without time zone`
- TypeORM: `timestamp with time zone`

**Cambio Propuesto:**
- DDL: `timestamp with time zone` (ALINEAR con TypeORM)

### Impacto

- **Backend:** NINGUNO (ya usa timestamp with time zone)
- **Database:** BAJO (DDL change, datos existentes se convierten automaticamente)
- **Riesgo:** BAJO

### Consideraciones

1. PostgreSQL convierte automaticamente entre `with` y `without` timezone
2. El cambio MEJORA la consistencia DDL-TypeORM
3. No requiere cambios en backend

### Recomendacion

PROCEDER con la correccion. El cambio alinea DDL con la definicion de TypeORM.

---

## CORR-004: Tipo progress en missions

### Archivos que Referencian

| Ubicacion | Archivo | Linea |
|-----------|---------|-------|
| Backend | mission.entity.ts | 123 |

### Estado Actual

```typescript
// mission.entity.ts linea 123
@Column({ type: 'float', default: 0 })
  progress!: number;
```

### Cambio Propuesto

```typescript
@Column({ type: 'double precision', default: 0 })
  progress!: number;
```

### Impacto

- **Backend:** BAJO (1 linea en 1 archivo)
- **Database:** NINGUNO (ya usa double precision)
- **Riesgo:** BAJO

### Recomendacion

PROCEDER con la correccion. Es un cambio minimo que alinea TypeORM con DDL.

---

## MATRIZ DE DEPENDENCIAS

```
CORR-001-REVISED (is_feature_enabled)
└── Backend: FeatureFlagsService (NO llama SQL directo)
    └── Impacto: NINGUNO

CORR-002 (validate_rueda_inferencias_text)
└── Backend: progress/dto/answers/rueda-inferencias-answers.dto.ts
    └── Usa: validate_rueda_inferencias_text(UUID, TEXT, TEXT)
    └── Cambio: Misma firma, version nueva mas robusta
    └── Impacto: NINGUNO

CORR-003 (timestamps missions)
├── DDL: gamification_system/tables/06-missions.sql
├── Entity: gamification/entities/mission.entity.ts
├── Services: 7 archivos (sin cambios necesarios)
├── Controllers: 3 archivos (sin cambios necesarios)
└── Impacto: NINGUNO en backend (alinea DDL con TypeORM existente)

CORR-004 (progress type)
├── DDL: Ya usa double precision (sin cambio)
├── Entity: mission.entity.ts linea 123
│   └── Cambio: type: 'float' -> 'double precision'
└── Impacto: 1 linea en 1 archivo
```

---

## ORDEN DE EJECUCION RECOMENDADO

Basado en el analisis de dependencias:

```
1. CORR-002 (validate_rueda_inferencias) - Sin dependencias
2. CORR-003 (timestamps missions) - Sin dependencias de CORR-002
3. CORR-004 (progress type) - Puede ejecutarse en paralelo con CORR-003
4. CORR-001-REVISED - POSTERGAR (requiere decision arquitectural)
```

---

## VALIDACION POST-CORRECCION

### Comandos de Validacion

```bash
# 1. Validar DDL
cd /home/isem/workspace-v2/projects/gamilit/apps/database
./drop-and-recreate-database.sh

# 2. Validar Backend
cd /home/isem/workspace-v2/projects/gamilit/apps/backend
npm run build
npm run lint
npm run typecheck

# 3. Ejecutar tests
npm run test

# 4. Validar integridad DB
python3 scripts/validations/validate_integrity.py
```

---

## CONCLUSION

Todas las correcciones propuestas (excepto CORR-001-REVISED) tienen:
- Impacto BAJO en codigo dependiente
- Riesgo BAJO de romper funcionalidad
- Cambios aislados y verificables

**Recomendacion final:** APROBAR ejecucion de CORR-002, CORR-003, CORR-004.
Postergar CORR-001-REVISED hasta decision arquitectural sobre feature flags.

---

**Analisis completado:** 2026-01-13
**Aprobado para ejecucion:** Pendiente aprobacion usuario
