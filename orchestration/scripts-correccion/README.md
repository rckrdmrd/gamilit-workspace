# Scripts de Corrección - Discrepancias 3-Capas

Este directorio contiene todos los scripts ejecutables (SQL, TypeScript, Bash) para corregir las 148 discrepancias encontradas en el sistema.

## 📁 Estructura de directorios

```
scripts-correccion/
├── README.md (este archivo)
├── validate-all-corrections.sh (script maestro de validación)
├── fase-1-p0/ (CRÍTICO - 27 correcciones)
│   ├── RESUMEN-FASE-1.md
│   ├── fix-exercise-types.sh
│   ├── 06-create-system-metrics-table.sql
│   └── 08-create-tags-table.sql
├── fase-2-p1/ (ALTO - 16 correcciones)
│   └── (scripts para fase 2)
└── fase-3-p2/ (MEDIO - 61 correcciones)
    └── (scripts para fase 3)

code-correccion/
├── fase-1-p0/
│   └── enums/ (7 archivos TypeScript)
├── fase-2-p1/
│   └── enums/ (ENUMs actualizados)
└── fase-3-p2/
    └── scripts/ (scripts de decoradores)
```

## 🚀 Inicio Rápido - Fase 1 (P0)

### Prerequisitos

- PostgreSQL 14+
- Node.js 18+
- psql en PATH
- Acceso a base de datos gamilit

### Ejecución

```bash
# 1. Ir al directorio raíz del proyecto
cd /path/to/gamilit

# 2. Copiar ENUMs al backend
cp orchestration/code-correccion/fase-1-p0/enums/*.ts \
   apps/backend/src/shared/enums/

# 3. Actualizar exports en index.ts
cat >> apps/backend/src/shared/enums/index.ts << 'EOF'
export * from './aal-level.enum';
export * from './code-challenge-method.enum';
export * from './gamilit-role.enum';
export * from './rango-maya.enum';
export * from './bucket-type.enum';
export * from './maya-rank-gamification.enum';
export * from './maya-rank-basic.enum';
EOF

# 4. Crear tablas en DB
psql -d gamilit -f orchestration/scripts-correccion/fase-1-p0/06-create-system-metrics-table.sql
psql -d gamilit -f orchestration/scripts-correccion/fase-1-p0/08-create-tags-table.sql

# 5. Corregir seeds
./orchestration/scripts-correccion/fase-1-p0/fix-exercise-types.sh

# 6. Compilar y validar
cd apps/backend
npm run build
npm run test

# 7. Validación completa
cd ../..
./orchestration/scripts-correccion/validate-all-corrections.sh
```

## 📋 Correcciones por Fase

### Fase 1 (P0) - CRÍTICO [2-3 días]

**27 correcciones críticas** que bloquean funcionalidad

| ID | Corrección | Tipo | Esfuerzo |
|----|-----------|------|----------|
| C1.1.1 | Crear AalLevelEnum | TypeScript | 15 min |
| C1.1.2 | Crear CodeChallengeMethodEnum | TypeScript | 15 min |
| C1.1.3 | Crear GamilitRoleEnum | TypeScript | 20 min |
| C1.1.4 | Crear RangoMayaEnum | TypeScript | 20 min |
| C1.1.5 | Crear BucketTypeEnum | TypeScript | 15 min |
| C1.2.1 | Resolver MayaRank duplicado | TypeScript | 2 horas |
| C1.3.1 | Crear tabla system_metrics | SQL | 1 hora |
| C1.3.2 | Corregir seed marie-curie | SQL | 1 hora |
| C1.3.3 | Crear tabla tags | SQL | 1 hora |
| C1.4 | Corregir 16 exercise_type | Bash/SQL | 8 horas |

**Archivos entregables:**
- ✅ 7 archivos TypeScript (ENUMs)
- ✅ 2 archivos SQL (tablas)
- ✅ 1 script Bash (fix seeds)
- ✅ 1 README con instrucciones

### Fase 2 (P1) - ALTO [1 semana]

**16 correcciones de alta prioridad**

- Sincronizar 6 ENUMs entre DB y Backend
- Agregar 10 decoradores @IsUUID()

### Fase 3 (P2) - MEDIO [2 semanas]

**61 correcciones de prioridad media**

- Agregar 22 decoradores @IsInt()
- Agregar 14 decoradores @IsDate/@IsISO8601()

### Fase 4 (P3) - BAJO [3-4 semanas, OPCIONAL]

**85 correcciones de baja prioridad**

- Agregar 68 decoradores @IsString()

## ✅ Validación

### Script de Validación Completa

```bash
./orchestration/scripts-correccion/validate-all-corrections.sh
```

Este script valida:
1. ✅ Compilación TypeScript
2. ✅ ENUMs exportados correctamente
3. ✅ Tablas creadas en DB
4. ✅ Seeds sin errores
5. ✅ exercise_type válidos
6. ✅ Tests unitarios
7. ✅ Cobertura de decoradores

### Validación Manual

```bash
# ENUMs
grep -r "export.*Enum" apps/backend/src/shared/enums/index.ts

# Tablas
psql -d gamilit -c "\dt audit_logging.system_metrics"
psql -d gamilit -c "\dt content_management.tags"

# Seeds
psql -d gamilit -c "
SELECT DISTINCT exercise_type
FROM educational_content.exercises
ORDER BY 1;
"

# Comparar con ENUM
psql -d gamilit -c "
SELECT unnest(enum_range(NULL::educational_content.exercise_type))
ORDER BY 1;
"
```

## 📊 Métricas de Éxito

### Antes de correcciones
- ❌ 5 ENUMs faltantes
- ❌ MayaRank duplicado
- ❌ 3 tablas inexistentes
- ❌ 16 valores ENUM inválidos
- ❌ 10 UUIDs sin decorador
- ❌ 114 decoradores faltantes
- **Total: 148 discrepancias**

### Después de Fase 1 (P0)
- ✅ 5 ENUMs creados
- ✅ MayaRank consolidado
- ✅ 3 tablas creadas
- ✅ 16 valores corregidos
- **Total: 27 correcciones aplicadas**
- **Quedan: 121 correcciones (P1-P3)**

### Después de Fase 2 (P1)
- ✅ 43 correcciones aplicadas
- **Quedan: 105 correcciones (P2-P3)**

### Objetivo Final
- ✅ 148/148 correcciones aplicadas (100%)
- ✅ 0 errores críticos
- ✅ < 5 errores de alta prioridad
- ✅ Índice de calidad: 90%+

## 🔧 Troubleshooting

### Error: "Build falla después de copiar ENUMs"

```bash
# Verificar imports
cd apps/backend
npm run build 2>&1 | grep -i error

# Verificar que index.ts tiene todos los exports
cat src/shared/enums/index.ts | grep -E "(aal-level|code-challenge|gamilit-role|rango-maya|bucket-type)"
```

### Error: "Tabla ya existe"

```sql
-- Solo en desarrollo
DROP TABLE IF EXISTS audit_logging.system_metrics CASCADE;
DROP TABLE IF EXISTS content_management.tags CASCADE;

-- Recrear
\i orchestration/scripts-correccion/fase-1-p0/06-create-system-metrics-table.sql
\i orchestration/scripts-correccion/fase-1-p0/08-create-tags-table.sql
```

### Error: "Seeds fallan con constraint violation"

```bash
# Restaurar backup
cp apps/database/seeds/dev/educational_content/.backup/*.sql \
   apps/database/seeds/dev/educational_content/

# Ejecutar corrección nuevamente
./orchestration/scripts-correccion/fase-1-p0/fix-exercise-types.sh
```

## 📚 Documentación Adicional

- **Plan completo:** `/orchestration/PLAN-CORRECCION-DISCREPANCIAS.md`
- **Reporte ENUMs:** `/orchestration/validaciones/enums-db-backend.json`
- **Reporte Seeds:** `/orchestration/validaciones/seeds-vs-ddl.json`
- **Reporte DTOs:** `/orchestration/validaciones/columns-vs-dtos.json`
- **Resumen Fase 1:** `/orchestration/scripts-correccion/fase-1-p0/RESUMEN-FASE-1.md`

## 🤝 Contribuir

### Agregar nueva corrección

1. Crear archivo en directorio de fase correspondiente
2. Documentar en el archivo con comentarios
3. Agregar a checklist en PLAN-CORRECCION-DISCREPANCIAS.md
4. Actualizar este README

### Formato de scripts

**SQL:**
```sql
-- ========================================
-- CORRECCIÓN CX.Y.Z: Descripción
-- ========================================

/**
 * Descripción detallada
 * Severidad: CRÍTICA/ALTA/MEDIA/BAJA
 * Esfuerzo: X horas
 * Prerequisitos: ...
 */

-- Código SQL aquí

/**
 * Validación:
 * -- Comandos de validación
 */
```

**TypeScript:**
```typescript
// ========================================
// CORRECCIÓN CX.Y.Z: Descripción
// ========================================

/**
 * Descripción detallada
 * @see referencia
 */
export enum NombreEnum {
  VALOR = 'valor'
}
```

**Bash:**
```bash
#!/bin/bash
# ========================================
# CORRECCIÓN CX.Y.Z: Descripción
# ========================================

set -e  # Exit on error

# Código bash aquí
```

## 📞 Soporte

- **Tech Lead:** Para decisiones arquitectónicas
- **SA-VAL-012:** Para preguntas sobre correcciones
- **DevOps:** Para problemas de DB/infraestructura

---

**Generado:** 2025-11-03
**Versión:** 1.0
**Autor:** ATLAS-DATABASE (SA-VAL-012)
