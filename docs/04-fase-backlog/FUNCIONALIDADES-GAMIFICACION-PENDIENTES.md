# Funcionalidades de Gamificación Pendientes - Backlog

**Fecha:** 2025-11-19
**Versión:** 1.0
**Estado:** Documentado, pendiente decisión

---

## 📋 Resumen Ejecutivo

**Total de funcionalidades pendientes:** 1 principal

### Multiplicador ML Coins por Rango

**Estado:** 🔸 Documentado en diseño v6.1.1 pero NO implementado en base de datos

**Criticidad:** Alta
**Impacto en economía:** Alto
**Decisión requerida:** Sprint Planning próximo

---

## 🎯 Funcionalidad: Multiplicador ML Coins por Rango

### Descripción

Sistema de multiplicadores que aumenta las ML Coins (Monedas Lectoras) ganadas según el rango maya del usuario. Usuarios de rangos más altos reciben más ML Coins por las mismas acciones.

**Documento de origen:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.1.md (líneas 76-84, 1104)

### Especificación Original (v6.1.1)

| Rango | Multiplicador ML Coins | Ejemplo |
|-------|------------------------|---------|
| Ajaw | 1.00x | 20 ML base → 20 ML recibidos |
| Nacom | 1.25x (+25%) | 20 ML base → 25 ML recibidos |
| Ah K'in | 1.50x (+50%) | 20 ML base → 30 ML recibidos |
| Halach Uinic | 1.75x (+75%) | 20 ML base → 35 ML recibidos |
| K'uk'ulkan | 2.00x (+100%) | 20 ML base → 40 ML recibidos |

**Regla importante:** El multiplicador aplica SOLO a ML Coins ganados, NO a gastos.
- ✅ Ganas 20 ML → multiplicador aplica → recibes más
- ❌ Gastas 15 ML en comodín → pagas exactamente 15 ML

---

### Estado Actual de Implementación

#### ❌ NO Implementado en Base de Datos

**Tabla `gamification_system.maya_ranks`:**
```sql
-- Estructura actual (líneas 24-27 del DDL)
ml_coins_bonus INTEGER NOT NULL DEFAULT 0,  -- ✅ Existe (bonus único)
xp_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,  -- ✅ Existe
-- ml_coins_multiplier NUMERIC(3,2) ...  -- ❌ NO existe
```

**Verificación realizada:**
```bash
grep -r "ml_coins_multiplier\|ml_multiplier\|coins_multiplier" apps/database/
# Resultado: No matches found
```

**Conclusión:** La columna `ml_coins_multiplier` no existe en ninguna tabla.

#### ✅ Solo Implementado: Bonus Único

Actualmente, al subir de rango, el usuario recibe un **bonus único** de ML Coins:

| Subida de Rango | Bonus Único (Implementado) | Multiplicador (NO Implementado) |
|-----------------|---------------------------|--------------------------------|
| Ajaw → Nacom | +100 ML | ❌ No aplica |
| Nacom → Ah K'in | +250 ML | ❌ No aplica |
| Ah K'in → Halach | +500 ML | ❌ No aplica |
| Halach → K'uk'ulkan | +1,000 ML | ❌ No aplica |

---

### Impacto de No Implementar

#### 1. Economía Más Simple
**Ventajas:**
- ✅ Más fácil de balancear
- ✅ Más predecible para usuarios
- ✅ Menos complejidad técnica

**Desventajas:**
- ⚠️ Menos incentivo para subir de rango
- ⚠️ Progresión menos épica

#### 2. Usuarios de Alto Rango Menos Recompensados
- Sin multiplicador, un usuario K'uk'ulkan gana lo mismo que uno Ajaw por ejercicio
- Solo tienen el bonus único al subir de rango

#### 3. Economía Actual Funcional
- Los bonus únicos (100, 250, 500, 1000 ML) son generosos
- Los costos de comodines están balanceados para economía sin multiplicador

---

### Impacto de Implementar

#### 1. Cambios en Base de Datos

**DDL a modificar:**
```sql
-- apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql
ALTER TABLE gamification_system.maya_ranks
ADD COLUMN ml_coins_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00
CHECK (ml_coins_multiplier >= 1.00 AND ml_coins_multiplier <= 3.00);

COMMENT ON COLUMN gamification_system.maya_ranks.ml_coins_multiplier IS
'Multiplicador de ML Coins ganados (1.00 = 100%, 2.00 = 200%). NO aplica a gastos.';
```

**Seeds a actualizar:**
```sql
-- apps/database/seeds/prod/gamification_system/03-maya_ranks.sql
INSERT INTO gamification_system.maya_ranks (..., ml_coins_multiplier) VALUES
    ('Ajaw', ..., 1.00),
    ('Nacom', ..., 1.25),
    ('Ah K''in', ..., 1.50),
    ('Halach Uinic', ..., 1.75),
    ('K''uk''ulkan', ..., 2.00);
```

#### 2. Cambios en Backend

**Función a crear:**
```typescript
// apps/backend/src/modules/gamification/services/ml-coins.service.ts

async calculateMLCoinsEarned(
  baseAmount: number,
  userId: string
): Promise<number> {
  const userRank = await this.getUserCurrentRank(userId);
  const multiplier = await this.getRankMLMultiplier(userRank);
  return Math.floor(baseAmount * multiplier);
}
```

**Funciones a actualizar:**
```typescript
// apps/backend/src/modules/gamification/services/rewards.service.ts

// ANTES
async awardMLCoins(userId: string, amount: number) {
  await this.updateUserML(userId, amount);
}

// DESPUÉS
async awardMLCoins(userId: string, baseAmount: number) {
  const finalAmount = await this.mlCoinsService.calculateMLCoinsEarned(baseAmount, userId);
  await this.updateUserML(userId, finalAmount);
}
```

**Importante:** NO aplicar multiplicador a gastos:
```typescript
async spendMLCoins(userId: string, cost: number) {
  // NO aplicar multiplicador aquí
  await this.updateUserML(userId, -cost);
}
```

#### 3. Cambios en Frontend

**UI a actualizar:**
- Mostrar multiplicador actual en perfil de usuario
- Indicar en tooltips: "Ganas +50% ML Coins por tu rango Ah K'in"
- Preview de ML Coins a recibir antes de completar ejercicio

**Ejemplo:**
```
Al completar este ejercicio ganarás:
🎯 XP: 100 (×1.15 multiplicador) = 115 XP
💰 ML Coins: 20 (×1.50 multiplicador) = 30 ML
```

#### 4. Rebalanceo de Economía

**Necesario ajustar:**

| Elemento | Valor Actual | Valor Sugerido con Multiplicador |
|----------|--------------|----------------------------------|
| **Ganancias Base** | | |
| Ejercicio completado | 20 ML | **15 ML** (↓25%) |
| Respuesta correcta | 5 ML | **4 ML** (↓20%) |
| Módulo completado | 50 ML | **40 ML** (↓20%) |
| **Costos Comodines** | | |
| Pistas | 15 ML | **15 ML** (sin cambio) |
| Visión Lectora | 25 ML | **25 ML** (sin cambio) |
| Segunda Oportunidad | 40 ML | **40 ML** (sin cambio) |

**Razón:** Los usuarios de alto rango ganarían demasiado con los valores actuales.

#### 5. Ejemplo de Progresión con Multiplicador

**Escenario:** Usuario completa un ejercicio (valor base: 20 ML)

| Rango | Multiplicador | ML Ganados | Diferencia vs Ajaw |
|-------|---------------|------------|-------------------|
| Ajaw | 1.00x | 20 ML | - |
| Nacom | 1.25x | 25 ML | +5 ML (+25%) |
| Ah K'in | 1.50x | 30 ML | +10 ML (+50%) |
| Halach | 1.75x | 35 ML | +15 ML (+75%) |
| K'uk'ulkan | 2.00x | 40 ML | +20 ML (+100%) |

**En 100 ejercicios:**
- Ajaw: 2,000 ML
- K'uk'ulkan: 4,000 ML (¡el doble!)

---

## 📊 Análisis Coste-Beneficio

### Coste de Implementación

| Tarea | Esfuerzo | Responsable |
|-------|----------|-------------|
| DDL + Migration | 2 horas | Database Agent |
| Seeds actualización | 1 hora | Database Agent |
| Backend función + tests | 4 horas | Backend Agent |
| Frontend UI updates | 3 horas | Frontend Agent |
| Rebalanceo economía | 8 horas | Game Designer + QA |
| Testing integral | 4 horas | QA Team |
| **TOTAL** | **22 horas** (~3 días) | - |

### Beneficio Esperado

**Positivo:**
- ✅ Mayor incentivo para subir de rango (progresión más motivante)
- ✅ Recompensa tangible por dedicación a largo plazo
- ✅ Diferenciación clara entre rangos
- ✅ Economía más rica y compleja

**Negativo:**
- ⚠️ Complejidad adicional en balanceo
- ⚠️ Riesgo de economía desbalanceada (mucho testing requerido)
- ⚠️ Usuarios nuevos pueden sentir desventaja

### Riesgo de NO Implementar

- ⚠️ Documento de diseño desalineado con implementación
- ⚠️ Expectativas incorrectas si documento se comparte
- ✅ Economía más simple y predecible

---

## 🎯 Recomendación

### Opción A: Implementar (Recomendado para Fase 2)

**Cuándo:** Sprint 5-6 (después de MVP estable)

**Por qué:**
- Enriquece experiencia de usuario
- Hace progresión más épica
- Alineación documento-implementación

**Requisitos previos:**
1. MVP completado y estable
2. Economía actual validada con usuarios reales
3. Game Designer disponible para rebalanceo

**Pasos:**
1. Implementar en DB (DDL + seeds)
2. Crear funciones Backend con tests
3. Actualizar UI Frontend
4. Rebalancear valores base (↓20-25%)
5. Testing extensivo (A/B testing ideal)
6. Rollout gradual (feature flag)

---

### Opción B: No Implementar (Simplificar)

**Cuándo:** Marcar como "no planificado" en backlog

**Por qué:**
- Economía actual funciona bien
- Complejidad innecesaria para MVP
- Recursos limitados

**Acción requerida:**
1. Actualizar documento v6.2 → v6.3 removiendo multiplicador ML
2. Marcar como "descartado" en backlog
3. Comunicar decisión al equipo

---

## 📝 Decisión Requerida

**Product Owner debe decidir:**

1. ¿Implementar multiplicador ML Coins?
   - [ ] Sí → Planificar para Sprint 5-6
   - [ ] No → Remover de documentación
   - [ ] Postponer → Evaluar en futuro (backlog largo plazo)

2. Si se implementa, ¿cuándo?
   - [ ] Próximo sprint (urgente)
   - [ ] Fase 2 (post-MVP)
   - [ ] Fase 3+ (futuro lejano)

3. ¿Necesitamos A/B testing?
   - [ ] Sí → Con/sin multiplicador en grupos de usuarios
   - [ ] No → Implementar directamente

---

## 📋 Checklist de Implementación (Si se aprueba)

### Database
- [ ] Agregar columna `ml_coins_multiplier` a `maya_ranks`
- [ ] Actualizar constraint checks
- [ ] Actualizar comentarios SQL
- [ ] Actualizar seeds prod/dev/staging
- [ ] Crear migration script
- [ ] Validar carga limpia con `create-database.sh`

### Backend
- [ ] Crear `calculateMLCoinsEarned()` función
- [ ] Actualizar `awardMLCoins()` para usar multiplicador
- [ ] Asegurar que `spendMLCoins()` NO usa multiplicador
- [ ] Crear tests unitarios (10+ casos)
- [ ] Crear tests de integración
- [ ] Actualizar Swagger docs

### Frontend
- [ ] Mostrar multiplicador en perfil
- [ ] Preview de recompensas con multiplicador
- [ ] Tooltip explicativo
- [ ] Actualizar constantes/types
- [ ] Tests de componentes

### Game Design
- [ ] Rebalancear valores base (-20-25%)
- [ ] Validar costos comodines
- [ ] Simular progresión completa
- [ ] Documentar nuevos valores

### QA
- [ ] Testing funcional
- [ ] Testing de economía
- [ ] A/B testing (opcional)
- [ ] Validación con usuarios

### Documentación
- [ ] Actualizar documento diseño
- [ ] Actualizar API docs
- [ ] Actualizar guía de usuario
- [ ] Comunicar cambios al equipo

---

**Responsable de decisión:** Product Owner
**Fecha límite decisión:** Sprint Planning (próxima semana)
**Última actualización:** 2025-11-19
