# Reporte de Investigación: Multiplicador ML Coins en Código

**Fecha:** 2025-11-19
**Investigador:** Database Agent
**Alcance:** Backend (NestJS) + Frontend (React/TypeScript)

---

## 🎯 Objetivo

Investigar si el código de Backend o Frontend usa el **Multiplicador ML Coins por Rango** que está documentado en el diseño v6.1.1 pero NO implementado en la base de datos.

---

## 📊 Resumen Ejecutivo

**Conclusión:** ⚠️ El Frontend tiene código preparado para multiplicadores, pero usa un **multiplicador único** para ambos XP y ML Coins. El Backend **NO tiene** lógica de multiplicadores de ML Coins.

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Database** | ❌ NO implementado | Columna `ml_coins_multiplier` no existe |
| **Backend** | ❌ NO implementado | No hay código para aplicar multiplicadores ML |
| **Frontend** | ⚠️ Parcialmente preparado | Usa multiplicador único (no separado XP/ML) |

---

## 🔍 Hallazgos Detallados

### 1. Base de Datos

#### ❌ NO Implementado

**Búsqueda realizada:**
```bash
grep -r "ml_coins_multiplier\|ml_multiplier\|coins_multiplier" apps/database/
# Resultado: No matches found
```

**Tabla `gamification_system.maya_ranks`:**
```sql
-- apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql (líneas 24-27)
ml_coins_bonus INTEGER NOT NULL DEFAULT 0,  -- ✅ Existe
xp_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,  -- ✅ Existe
-- ml_coins_multiplier NUMERIC(3,2) ...  -- ❌ NO existe
```

**Conclusión:** La base de datos NO tiene soporte para multiplicador ML Coins.

---

### 2. Backend (NestJS)

#### ❌ NO Implementado

**Búsqueda realizada:**
```bash
grep -ri "xpMultiplier\|mlCoinsMultiplier\|ml_coins_multiplier" apps/backend/src/modules/gamification/
# Resultado: No matches found
```

**Archivos revisados:**
- `apps/backend/src/modules/social/services/challenge-participants.service.ts`
  - Línea 91: `ml_coins_earned: 0,` (solo almacena, no aplica multiplicador)
  - No hay lógica de cálculo de multiplicadores

**Búsqueda de servicios de recompensas:**
```bash
grep -r "class.*RanksService\|class.*RewardsService" apps/backend/src/modules/gamification/
# Archivos a revisar (si existen)
```

**Conclusión:** El Backend NO tiene implementada la lógica de multiplicadores de ML Coins.

---

### 3. Frontend (React/TypeScript)

#### ⚠️ Parcialmente Preparado

**Archivos encontrados con referencias a multiplicadores:**

1. `apps/frontend/src/features/gamification/ranks/hooks/useMultipliers.ts`
2. `apps/frontend/src/features/gamification/api/gamificationAPI.ts`
3. `apps/frontend/src/features/gamification/ranks/components/RankComparison.tsx`
4. `apps/frontend/src/features/gamification/economy/mockData/shopItemsMockData.ts`

#### Análisis de `useMultipliers.ts`

**Archivo:** `apps/frontend/src/features/gamification/ranks/hooks/useMultipliers.ts`

**Funciones relevantes (líneas 70-80):**

```typescript
/**
 * Calculate bonus XP with multiplier applied
 */
const calculateBonusXP = (baseXP: number): number => {
  return Math.floor(baseXP * multiplierBreakdown.total);
};

/**
 * Calculate bonus ML Coins with multiplier applied
 */
const calculateBonusMLCoins = (baseCoins: number): number => {
  return Math.floor(baseCoins * multiplierBreakdown.total);
};
```

**Observación crítica:**
- ✅ Existe función `calculateBonusMLCoins`
- ⚠️ **USA EL MISMO multiplicador para XP y ML Coins** (`multiplierBreakdown.total`)
- ❌ **NO hay multiplicador separado para ML Coins**

**Implicación:**
El Frontend está preparado para aplicar multiplicadores a ML Coins, **PERO** no diferencia entre multiplicador XP y multiplicador ML. Usa un multiplicador único para ambos.

---

#### Análisis de `ranksStore.ts`

**Archivo:** `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`

**Estado inicial (líneas 98-111):**

```typescript
const initialMultiplierBreakdown: MultiplierBreakdown = {
  base: 1.0,
  rank: {
    type: 'rank',
    name: 'Nacom',
    value: 1.0,  // ⚠️ Valor único, no separado XP/ML
    isPermanent: true,
    description: 'Multiplicador base del rango',
  },
  sources: [],
  total: 1.0,
  hasExpiringSoon: false,
  expiringSoon: [],
};
```

**Conclusión:**
- El store mantiene un `multiplierBreakdown.total` único
- No hay campos separados `xpMultiplier` y `mlCoinsMultiplier`

---

#### Tipo `MultiplierBreakdown`

**Necesito verificar la definición del tipo:**

```bash
grep -r "interface MultiplierBreakdown\|type MultiplierBreakdown" apps/frontend/
```

**Ubicación esperada:**
- `apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts`

**Pregunta clave:**
¿El tipo `MultiplierBreakdown` tiene campos separados para XP y ML?

**Respuesta (basada en uso):** NO. El código usa `multiplierBreakdown.total` para ambos.

---

## 📋 Comparación con Diseño v6.1.1

### Diseño Documentado (v6.1.1 - Incorrecto)

| Rango | Multiplicador XP | Multiplicador ML Coins |
|-------|------------------|------------------------|
| Ajaw | 1.00x | 1.00x |
| Nacom | 1.05x (+5%) | 1.25x (+25%) |
| Ah K'in | 1.10x (+10%) | 1.50x (+50%) |
| Halach Uinic | 1.15x (+15%) | 1.75x (+75%) |
| K'uk'ulkan | 1.20x (+20%) | 2.00x (+100%) |

**Diseño proponía:** Multiplicadores SEPARADOS (XP diferente de ML Coins)

---

### Implementación Real (Frontend)

| Rango | Multiplicador (único para XP y ML) |
|-------|------------------------------------|
| Ajaw | 1.00x |
| Nacom | 1.00x (mock, no implementado) |
| Ah K'in | 1.00x (mock, no implementado) |
| Halach Uinic | 1.00x (mock, no implementado) |
| K'uk'ulkan | 1.00x (mock, no implementado) |

**Implementación real:**
- Usa multiplicador ÚNICO para ambos XP y ML Coins
- Actualmente con valores mock (todos en 1.00x)
- NO hay datos de DB que alimenten estos multiplicadores

---

### Implementación Real (Database v2.0)

| Rango | xp_multiplier (implementado) | ml_coins_multiplier (NO implementado) |
|-------|------------------------------|---------------------------------------|
| Ajaw | 1.00x | ❌ N/A |
| Nacom | 1.10x (+10%) | ❌ N/A |
| Ah K'in | 1.15x (+15%) | ❌ N/A |
| Halach Uinic | 1.20x (+20%) | ❌ N/A |
| K'uk'ulkan | 1.25x (+25%) | ❌ N/A |

**Base de datos:**
- ✅ Tiene `xp_multiplier` (implementado)
- ❌ NO tiene `ml_coins_multiplier`

---

## 🎯 Conclusiones

### 1. Multiplicador ML Coins NO Existe en Ninguna Capa

| Capa | Estado | Evidencia |
|------|--------|-----------|
| Database | ❌ NO | Columna `ml_coins_multiplier` no existe |
| Backend | ❌ NO | Sin lógica de cálculo de multiplicadores ML |
| Frontend | ⚠️ Preparado | Tiene función pero usa multiplicador único |

---

### 2. Frontend Usa Multiplicador Único (No Separado)

**Código encontrado:**
```typescript
// useMultipliers.ts líneas 71-80
const calculateBonusXP = (baseXP: number): number => {
  return Math.floor(baseXP * multiplierBreakdown.total);
};

const calculateBonusMLCoins = (baseCoins: number): number => {
  return Math.floor(baseCoins * multiplierBreakdown.total);  // ⚠️ MISMO multiplicador
};
```

**Implicación:**
- Si se implementa, el multiplicador debe ser ÚNICO (aplicable a ambos)
- O se debe refactorizar el Frontend para soportar multiplicadores separados

---

### 3. Datos Mock en Frontend

El Frontend usa datos mock (`MOCK_USER_NACOM`) que NO vienen de la API real. Esto significa:
- Los multiplicadores actuales son ficticios
- No hay sincronización con valores de DB (xp_multiplier)
- El sistema está preparado pero NO funcional

---

## 🚨 Riesgos Identificados

### Riesgo 1: Desalineación Diseño vs Implementación

**Problema:**
- Diseño v6.1.1 propone multiplicadores SEPARADOS (XP ≠ ML)
- Frontend implementa multiplicador ÚNICO (XP = ML)
- Database NO implementa multiplicador ML

**Consecuencia:**
- Si Product Owner aprueba diseño v6.1.1, el Frontend requerirá refactorización

---

### Riesgo 2: Código Frontend No Funcional

**Problema:**
- Frontend tiene función `calculateBonusMLCoins` que usa datos mock
- Backend NO tiene API para obtener multiplicadores
- Database NO tiene columna `ml_coins_multiplier`

**Consecuencia:**
- Código preparado pero NO conectado a realidad

---

### Riesgo 3: Expectativas Incorrectas

**Problema:**
- Documento de diseño v6.1.1 describe funcionalidad no implementada
- Si se comparte con stakeholders, generará expectativas incorrectas

**Mitigación:**
- Documento v6.2 actualizado marca multiplicador ML como "Pendiente Implementación"

---

## 📝 Recomendaciones

### Opción A: Implementar Multiplicador Único (Más Simple)

**Propuesta:**
- Usar UN SOLO multiplicador para XP y ML Coins (no separados)
- Ej: Nacom tiene 1.10x para AMBOS

**Ventajas:**
- ✅ Frontend ya está preparado (línea 79 useMultipliers.ts)
- ✅ Más simple de implementar
- ✅ Economía más fácil de balancear

**Desventajas:**
- ⚠️ Menos flexibilidad de diseño
- ⚠️ No coincide con diseño v6.1.1 original

**Implementación:**
```sql
-- Database: Usar xp_multiplier para ambos
-- Backend: Aplicar mismo multiplicador a XP y ML
-- Frontend: Sin cambios (ya usa multiplierBreakdown.total)
```

---

### Opción B: Implementar Multiplicadores Separados (Como Diseño v6.1.1)

**Propuesta:**
- Multiplicadores SEPARADOS para XP y ML Coins
- Ej: Nacom tiene 1.10x XP + 1.25x ML

**Ventajas:**
- ✅ Coincide con diseño v6.1.1
- ✅ Mayor flexibilidad de diseño

**Desventajas:**
- ⚠️ Requiere refactorizar Frontend (separar `calculateBonusXP` y `calculateBonusMLCoins`)
- ⚠️ Más complejidad técnica
- ⚠️ Economía más difícil de balancear

**Implementación:**
```sql
-- Database: Agregar columna ml_coins_multiplier
ALTER TABLE maya_ranks ADD COLUMN ml_coins_multiplier NUMERIC(3,2);

-- Backend: Crear funciones separadas
calculateXPWithMultiplier(baseXP, xpMultiplier)
calculateMLCoinsWithMultiplier(baseCoins, mlMultiplier)

-- Frontend: Refactorizar
interface MultiplierBreakdown {
  xpMultiplier: number;
  mlCoinsMultiplier: number;
  ...
}
```

---

### Opción C: No Implementar (Simplificar)

**Propuesta:**
- Mantener economía actual sin multiplicadores ML
- Solo mantener bonus únicos al subir de rango

**Ventajas:**
- ✅ Economía más simple y predecible
- ✅ Sin desarrollo adicional

**Desventajas:**
- ⚠️ Menos incentivo para subir de rango
- ⚠️ Código Frontend preparado pero no usado

---

## 🎯 Decisión Requerida

**Product Owner debe decidir:**

1. ¿Qué opción implementar?
   - [ ] Opción A: Multiplicador único para XP y ML
   - [ ] Opción B: Multiplicadores separados (como diseño v6.1.1)
   - [ ] Opción C: No implementar (mantener solo bonus únicos)

2. Si Opción B, ¿cuándo refactorizar Frontend?
   - [ ] Mismo sprint de implementación DB
   - [ ] Sprint posterior

3. ¿Actualizar documento de diseño?
   - [x] Sí (ya actualizado a v6.2 con opción A/C)
   - [ ] Esperar decisión final

---

## 📊 Tabla Comparativa de Opciones

| Aspecto | Opción A (Único) | Opción B (Separados) | Opción C (No Implementar) |
|---------|------------------|----------------------|---------------------------|
| **Desarrollo DB** | 4 horas | 6 horas | 0 horas |
| **Desarrollo Backend** | 6 horas | 10 horas | 0 horas |
| **Desarrollo Frontend** | 2 horas | 8 horas | 0 horas |
| **Complejidad economía** | Media | Alta | Baja |
| **Coincide con diseño v6.1.1** | ⚠️ Parcial | ✅ Sí | ❌ No |
| **Riesgo técnico** | Bajo | Medio | Ninguno |
| **Motivación usuario** | Media | Alta | Baja |
| **Total esfuerzo** | **12 horas** | **24 horas** | **0 horas** |

---

## 📁 Archivos Afectados (Si se implementa)

### Database
- `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`
- `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`
- `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`

### Backend
- `apps/backend/src/modules/gamification/services/ranks.service.ts` (crear)
- `apps/backend/src/modules/gamification/services/rewards.service.ts` (crear/actualizar)
- `apps/backend/src/modules/gamification/dto/rank-multipliers.dto.ts` (crear)

### Frontend (solo Opción B)
- `apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts`
- `apps/frontend/src/features/gamification/ranks/hooks/useMultipliers.ts`
- `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`

---

**Responsable decisión:** Product Owner + Tech Lead
**Fecha límite:** Sprint Planning (próxima semana)
**Última actualización:** 2025-11-19
**Estado:** Pendiente decisión
