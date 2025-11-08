# GUÍA DE VALIDACIÓN CONTRA DOCUMENTACIÓN OFICIAL

**Propósito:** Asegurar que TODOS los cambios estén validados contra docs canónicas
**Fecha:** 2025-11-08

---

## 🎯 PRINCIPIO FUNDAMENTAL

**REGLA DE ORO:** Antes de modificar código, SIEMPRE validar contra:
1. **RF (Requerimiento Funcional)** - ¿QUÉ debe hacer?
2. **ET (Especificación Técnica)** - ¿CÓMO debe implementarse?
3. **Implementación actual** - ¿Qué existe y qué falta?

---

## 📋 CHECKLIST DE VALIDACIÓN

Antes de hacer CUALQUIER cambio:

### ☑️ Paso 1: Identificar Documento Oficial

```bash
# Para cada componente, encontrar su doc primario

# Ejemplo: MayaRank
DOC_RF="docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md"
DOC_ET="docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md"
```

**Patrón de ubicación:**
- RF: `docs/01-fase-alcance-inicial/EAI-{num}-{modulo}/requerimientos/RF-{CODE}-{nombre}.md`
- ET: `docs/01-fase-alcance-inicial/EAI-{num}-{modulo}/especificaciones/ET-{CODE}-{nombre}.md`

### ☑️ Paso 2: Extraer Definición Canónica

Lee el documento y extrae:
- **ENUMs oficiales** (valores exactos)
- **Estructura de datos** (campos, tipos)
- **Reglas de negocio** (validaciones, límites)
- **Relaciones** (foreign keys, referencias)

**Ejemplo de extracción:**

```markdown
# De RF-GAM-003-rangos-maya.md

## Valores Oficiales del ENUM

| Rango | Valor SQL | XP Mínimo | Multiplicador |
|-------|-----------|-----------|---------------|
| 1     | 'Ajaw'    | 0         | 1.0x          |
| 2     | 'Nacom'   | 1,000     | 1.05x         |
| 3     | 'Ah K'in' | 5,000     | 1.10x         |
| 4     | 'Halach Uinic' | 20,000 | 1.15x    |
| 5     | 'K'uk'ulkan' | 100,000 | 1.20x      |

## Reglas de Negocio
- Usuario empieza en 'Ajaw'
- Promoción automática al alcanzar XP mínimo
- Multiplicador se aplica a TODAS las recompensas XP
```

### ☑️ Paso 3: Validar Base de Datos

```sql
-- Verificar ENUM en DB
\dT+ gamification_system.maya_rank

-- Debe mostrar EXACTAMENTE:
CREATE TYPE gamification_system.maya_rank AS ENUM (
  'Ajaw',
  'Nacom',
  'Ah K''in',
  'Halach Uinic',
  'K''uk''ulkan'
);
```

**Si no coincide:**
```sql
-- ❌ NO cambiar la DB sin validar docs primero
-- ✅ Verificar si docs necesitan actualización
-- ✅ Si docs están bien, crear migration para corregir DB
```

### ☑️ Paso 4: Validar Backend

```typescript
// Verificar ENUM en Backend
// Ubicación esperada: apps/backend/src/shared/constants/enums.constants.ts

export enum MayaRank {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  'Ah K\'in' = 'Ah K\'in',
  'Halach Uinic' = 'Halach Uinic',
  'K\'uk\'ulkan' = 'K\'uk\'ulkan'
}

// ✅ Valores coinciden con DB
// ✅ Nombres coinciden con RF
// ✅ Orden coincide con ET
```

**Si no coincide:**
```bash
# Ejecutar sincronización automática
npm run sync:enums

# O manualmente actualizar
# IMPORTANTE: Valores deben ser EXACTAMENTE como en DB
```

### ☑️ Paso 5: Validar Frontend

```typescript
// Verificar ENUM en Frontend
// Ubicación esperada: apps/frontend/src/shared/constants/enums.constants.ts

// ✅ CORRECTO
export enum MayaRank {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  // ...
}

// ❌ INCORRECTO - Valores diferentes
export enum MayaRank {
  NOVICE = 'NOVICE',  // ← Esto NO existe en docs oficiales
  APPRENTICE = 'APPRENTICE',
  // ...
}
```

**Acción si hay discrepancia:**
1. Eliminar versión incorrecta
2. Importar desde `enums.constants.ts`
3. Actualizar todos los componentes que la usan

### ☑️ Paso 6: Validar Funciones SQL

```sql
-- Verificar que función existe y coincide con ET
\df gamification_system.check_rank_promotion

-- Leer ET para ver firma esperada
-- Ejemplo de ET-GAM-003:

CREATE OR REPLACE FUNCTION check_rank_promotion(p_user_id UUID)
RETURNS maya_rank AS $$
  -- Lógica según ET
$$;
```

**Si función no existe:**
1. Leer especificación en ET
2. Implementar EXACTAMENTE como se especifica
3. Crear migration
4. Agregar tests

---

## 🔍 VALIDACIÓN POR COMPONENTE

### MayaRank

#### Documentos Oficiales
```bash
RF: docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md
ET: docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md
```

#### Validaciones Requeridas
- [ ] ENUM DB tiene 5 valores exactos (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan)
- [ ] Backend ENUM sincronizado con DB
- [ ] Frontend ENUM sincronizado con Backend
- [ ] NO existe ENUM duplicado en `leaderboard.types.ts`
- [ ] Función `check_rank_promotion()` implementada según ET
- [ ] Multiplicadores correctos en `MAYA_RANKS` config
- [ ] Tests cubren promoción automática

#### Comando de Validación
```bash
# Script de validación automática
node scripts/validate-maya-rank.js

# Debe reportar:
# ✅ DB ENUM: 5 valores correctos
# ✅ Backend ENUM: Sincronizado
# ✅ Frontend ENUM: Sincronizado
# ✅ Config: Multiplicadores correctos
# ❌ Función SQL: NO EXISTE (crear según ET-GAM-003)
```

---

### ExerciseType

#### Documentos Oficiales
```bash
RF: docs/01-fase-alcance-inicial/EAI-002-actividades/requerimientos/RF-EDU-001-mecanicas-ejercicios.md
ET: docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md
```

#### Validaciones Requeridas
- [ ] ENUM DB tiene 31 mecánicas exactas
- [ ] Backend ENUM sincronizado (31 valores)
- [ ] Frontend ENUM sincronizado (31 valores)
- [ ] NO existe versión simplificada en `features/exercises/types/`
- [ ] Validadores implementados para top 10 mecánicas más usadas
- [ ] Componentes frontend para top 10 mecánicas
- [ ] Función `validate_exercise_structure()` según ET

#### Comando de Validación
```bash
node scripts/validate-exercise-types.js

# Debe reportar:
# ✅ DB ENUM: 31 mecánicas
# ✅ Backend ENUM: 31 sincronizados
# ✅ Frontend ENUM: 31 sincronizados
# 🟡 Validadores: 8/31 (23 faltantes)
# 🟡 Componentes: 12/31 (19 faltantes)
```

---

### ML Coins

#### Documentos Oficiales
```bash
RF: docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-002-comodines.md
ET: docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md
```

#### Validaciones Requeridas
- [ ] ENUM `transaction_type` tiene 14 valores
- [ ] Tabla `user_stats` tiene columnas: ml_coins, ml_coins_earned_total, ml_coins_spent_total
- [ ] Tabla `ml_coins_transactions` existe y tiene estructura correcta
- [ ] Función `award_ml_coins()` implementada según ET
- [ ] Backend `MLCoinsService` existe con métodos: award, spend, getBalance
- [ ] Frontend store `useEconomyStore` implementado
- [ ] Costos de comodines coinciden con RF (10-50 ML Coins)

#### Comando de Validación
```bash
node scripts/validate-ml-coins.js

# Debe reportar:
# ✅ DB Tables: Estructura correcta
# ✅ ENUM transaction_type: 14 valores
# ❌ Función award_ml_coins(): NO EXISTE
# ❌ Backend MLCoinsService: NO EXISTE
# 🟡 Frontend Store: Estructura parcial
```

---

## 🛠️ SCRIPTS DE VALIDACIÓN AUTOMÁTICA

### Script Master de Validación

```bash
#!/bin/bash
# validate-all.sh

echo "🔍 VALIDACIÓN COMPLETA CONTRA DOCUMENTACIÓN OFICIAL"
echo "=================================================="

# 1. Validar ENUMs
echo ""
echo "📊 Validando ENUMs..."
node scripts/validate-enums.js

# 2. Validar Funciones SQL
echo ""
echo "🗄️ Validando Funciones SQL..."
psql -U postgres -d gamilit -f scripts/validate-sql-functions.sql

# 3. Validar Servicios Backend
echo ""
echo "⚙️ Validando Servicios Backend..."
npm run test:services -- --grep "validation"

# 4. Validar Componentes Frontend
echo ""
echo "🎨 Validando Componentes Frontend..."
npm run test:components -- --grep "validation"

# 5. Generar reporte
echo ""
echo "📄 Generando reporte de validación..."
node scripts/generate-validation-report.js

echo ""
echo "✅ Validación completada. Ver: VALIDATION_REPORT.md"
```

### Script de Validación de ENUM

```javascript
// scripts/validate-enums.js
const fs = require('fs');
const path = require('path');

// Definiciones canónicas (de documentación oficial)
const CANONICAL_ENUMS = {
  maya_rank: {
    source: 'ET-GAM-003',
    values: ['Ajaw', 'Nacom', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"]
  },
  exercise_mechanic: {
    source: 'ET-EDU-001',
    count: 31 // Validar que haya exactamente 31
  },
  transaction_type: {
    source: 'ET-GAM-002',
    count: 14
  }
};

// Leer ENUM de DB
function getDBEnum(enumName) {
  const sqlFile = `apps/database/ddl/schemas/*/enums/${enumName}.sql`;
  // Parsear y extraer valores
  return extractedValues;
}

// Leer ENUM de Backend
function getBackendEnum(enumName) {
  const tsFile = `apps/backend/src/shared/constants/enums.constants.ts`;
  // Parsear TypeScript y extraer valores
  return extractedValues;
}

// Validar
Object.entries(CANONICAL_ENUMS).forEach(([enumName, canonical]) => {
  const dbValues = getDBEnum(enumName);
  const beValues = getBackendEnum(enumName);

  console.log(`\nValidando: ${enumName}`);
  console.log(`Fuente: ${canonical.source}`);

  if (canonical.values) {
    // Validar valores exactos
    const match = JSON.stringify(dbValues) === JSON.stringify(canonical.values);
    console.log(match ? '✅ Valores coinciden' : '❌ Valores NO coinciden');
  }

  if (canonical.count) {
    // Validar cantidad
    const match = dbValues.length === canonical.count;
    console.log(match ? `✅ Cantidad correcta (${canonical.count})` : `❌ Cantidad incorrecta: ${dbValues.length}/${canonical.count}`);
  }
});
```

---

## 📖 PROCESO DE ACTUALIZACIÓN DE DOCUMENTACIÓN

Si encuentras que el **código está correcto pero la documentación está desactualizada**:

### Paso 1: Verificar con Tech Lead
```bash
# Antes de actualizar docs, confirmar con Tech Lead
# que el código es la fuente de verdad autorizada
```

### Paso 2: Actualizar RF
```markdown
# En RF-XXX-xxx.md, agregar nota de actualización:

---
**ACTUALIZACIÓN:** 2025-11-08
**Cambio:** Valores de ENUM actualizados para coincidir con implementación
**Anterior:** [valores viejos]
**Nuevo:** [valores nuevos]
**Aprobado por:** @tech-lead
---
```

### Paso 3: Actualizar ET
```markdown
# En ET-XXX-xxx.md, actualizar código de ejemplo:

```sql
-- Código actualizado según implementación real
CREATE TYPE schema.enum_name AS ENUM (
  'valor1',
  'valor2'
);
```
```

### Paso 4: Versionar Cambio
```bash
git add docs/
git commit -m "docs: actualizar RF-XXX y ET-XXX según implementación real

- ENUM ahora tiene N valores
- Validado contra apps/database/ddl/
- Aprobado por @tech-lead"
```

---

## 🚨 CASOS ESPECIALES

### Caso 1: Conflicto entre DB y Docs

```
DB tiene:    ['Ajaw', 'Nacom', 'Ah K\'in']
Docs dicen:  ['Ajaw', 'Nacom', 'Guerrero']
```

**Acción:**
1. ❌ NO cambiar DB directamente
2. ✅ Investigar historial de cambios (git log)
3. ✅ Consultar con Tech Lead cuál es correcto
4. ✅ Si DB es correcto → Actualizar docs
5. ✅ Si Docs son correctos → Crear migration para DB

### Caso 2: Función en ET pero no en DB

```
ET-GAM-003 especifica:
  CREATE FUNCTION check_rank_promotion(...)

Pero no existe en apps/database/ddl/
```

**Acción:**
1. ✅ Implementar función EXACTAMENTE como ET especifica
2. ✅ Crear migration
3. ✅ Agregar tests
4. ✅ Actualizar MATRIZ-TRAZABILIDAD-GAMILIT.md

### Caso 3: Código Backend sin ET

```
Backend tiene MLCoinsService pero no hay ET-GAM-002-ml-coins.md
```

**Acción:**
1. ✅ Crear ET basado en implementación actual
2. ✅ Documentar métodos, parámetros, retornos
3. ✅ Revisar con Tech Lead
4. ✅ Agregar a matriz de trazabilidad

---

## ✅ CRITERIOS DE APROBACIÓN

Un cambio está **APROBADO PARA MERGE** solo si:

- [ ] ✅ Existe RF que justifica el cambio
- [ ] ✅ Existe ET que especifica la implementación
- [ ] ✅ DB implementa según ET
- [ ] ✅ Backend implementa según ET
- [ ] ✅ Frontend usa tipos del Backend
- [ ] ✅ Tests validan comportamiento del RF
- [ ] ✅ MATRIZ-TRAZABILIDAD-GAMILIT.md actualizada
- [ ] ✅ Tech Lead aprobó el PR

---

## 📞 CONTACTO PARA DUDAS

**Antes de modificar documentación oficial:**
- Tech Lead: @tech-lead
- Database Lead: @dba-lead
- Product Manager: @pm (para cambios en RF)

**Canal Slack:** `#coherencia-gamilit`

---

**Creado:** 2025-11-08
**Propósito:** Prevenir inconsistencias entre código y docs
**Actualizar:** Cada vez que se cree/modifique un RF o ET
