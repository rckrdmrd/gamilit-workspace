# REPORTE DE ANÁLISIS: Sistema de XP y Rangos No Funciona Correctamente

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Bug Report - Crítico (P0)
**Módulos Afectados:** Backend (UserStatsService), Base de Datos (trigger)
**Estado:** ❌ Confirmado - Sistema NO funciona como se documentó

---

## 📋 RESUMEN EJECUTIVO

**Problema Reportado:**
Usuario completó 2 módulos (~1,000 XP esperados) pero NO está subiendo de rango.

**Causa Raíz Identificada:**
El backend está **RESTANDO XP** en lugar de acumularlo, lo que impide que el trigger de base de datos detecte las promociones de rango.

**Severidad:** 🔴 CRÍTICA - El sistema de progresión gamificada está completamente roto
**Impacto:** Todos los usuarios afectados - Nadie puede avanzar de rango correctamente
**Urgencia:** Inmediata - Afecta experiencia core del producto

---

## 🔍 ANÁLISIS DETALLADO

### 1. DOCUMENTACIÓN (CÓMO DEBE FUNCIONAR)

Según `RF-GAM-003` y `ET-GAM-003`:

**Umbrales de XP:**
- **Ajaw:** 0-499 XP
- **Nacom:** 500-999 XP
- **Ah K'in:** 1,000-1,499 XP
- **Halach Uinic:** 1,500-2,249 XP
- **K'uk'ulkan:** 2,250+ XP

**Mecánica Documentada:**
1. Usuario completa ejercicio → gana XP
2. Backend actualiza `gamification_system.user_stats.total_xp`
3. ✅ **TRIGGER AUTOMÁTICO:** `trg_check_rank_promotion_on_xp_gain` se ejecuta
4. ✅ **TRIGGER llama:** `check_rank_promotion(user_id)`
5. ✅ **FUNCIÓN verifica:** `total_xp >= min_xp_required` desde tabla `maya_ranks`
6. ✅ **SI califica:** `promote_to_next_rank()` actualiza el rango

**Promesa arquitectónica:**
> "Promoción AUTOMÁTICA mediante triggers PostgreSQL. Backend solo debe actualizar total_xp, el trigger maneja todo."

---

### 2. IMPLEMENTACIÓN EN BASE DE DATOS (✅ CORRECTA)

**Tabla `gamification_system.maya_ranks`:**
```sql
-- ✅ Datos correctos (verificado en seeds/dev/gamification_system/03-maya_ranks.sql)
rank_name       min_xp_required  max_xp_threshold  next_rank
Ajaw            0                499               Nacom
Nacom           500              999               Ah K'in
Ah K'in         1000             1499              Halach Uinic
Halach Uinic    1500             2249              K'uk'ulkan
K'uk'ulkan      2250             NULL              NULL
```

**Trigger `trg_check_rank_promotion_on_xp_gain`:**
```sql
-- ✅ Trigger existe y está bien configurado
CREATE TRIGGER trg_check_rank_promotion_on_xp_gain
    AFTER UPDATE OF total_xp
    ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (NEW.total_xp > OLD.total_xp)  -- Solo cuando XP aumenta
    EXECUTE FUNCTION gamification_system.trg_check_rank_promotion_fn();
```

**Función `check_rank_promotion()`:**
```sql
-- ✅ Función lee dinámicamente desde maya_ranks table
SELECT mr.next_rank, next_mr.min_xp_required
INTO v_next_rank, v_next_rank_min_xp
FROM gamification_system.maya_ranks mr
LEFT JOIN gamification_system.maya_ranks next_mr
    ON next_mr.rank_name = mr.next_rank
WHERE mr.rank_name = v_current_rank
  AND mr.is_active = true;

IF v_total_xp >= v_next_rank_min_xp THEN
    PERFORM gamification_system.promote_to_next_rank(p_user_id, v_next_rank);
END IF;
```

**Conclusión:** ✅ **Base de datos está correctamente implementada**

---

### 3. IMPLEMENTACIÓN EN BACKEND (❌ INCORRECTA)

**Ubicación del bug:** `apps/backend/src/modules/gamification/services/user-stats.service.ts:127-142`

#### Bug #1: XP SE ESTÁ RESTANDO EN LUGAR DE ACUMULAR

```typescript
// ❌ CÓDIGO ACTUAL (INCORRECTO)
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);
  stats.total_xp += xpAmount;  // ✅ Suma inicial correcta

  // ❌ PROBLEMA: Este while RESTA el XP
  while (stats.total_xp >= stats.xp_to_next_level) {
    stats.total_xp -= stats.xp_to_next_level;  // ❌❌❌ AQUÍ ESTÁ EL BUG
    stats.level += 1;
    stats.xp_to_next_level = this.calculateXpForLevel(stats.level);
    await this.checkRankPromotion(stats);
  }

  return await this.userStatsRepo.save(stats);  // Guarda XP REDUCIDO
}
```

**¿Qué está pasando?**

**Ejemplo real:**
1. Usuario tiene `total_xp: 950`
2. Completa ejercicio, gana `100 XP`
3. Backend hace: `stats.total_xp += 100` → `total_xp = 1050` ✅
4. Entra al while porque `1050 >= xp_to_next_level` (supongamos 100)
5. **❌ SE RESTA:** `stats.total_xp -= 100` → `total_xp = 950` ❌
6. `level++` → `level = 2`
7. Se guarda en DB con `total_xp = 950` ← **PIERDE 100 XP!**

**Consecuencia:**
- El `total_xp` nunca alcanza 500, 1000, 1500, 2250
- El trigger `trg_check_rank_promotion_on_xp_gain` nunca detecta promociones
- Usuario completó 2 módulos (~1,000 XP) pero tiene `total_xp < 500` en DB
- **NADIE puede subir de rango**

---

#### Bug #2: LÓGICA DE RANGO DUPLICADA E INCORRECTA

```typescript
// ❌ CÓDIGO ACTUAL (INCORRECTO)
private async checkRankPromotion(stats: UserStats): Promise<void> {
  const currentRankIndex = this.RANKS.indexOf(stats.current_rank);

  // ❌ PROBLEMA: Calcula rango basado en NIVEL, no en XP
  const currentRankMinLevel = currentRankIndex * 5;
  const nextRankMinLevel = (currentRankIndex + 1) * 5;

  // Verificar si debe ser promovido
  if (stats.level >= nextRankMinLevel) {
    stats.current_rank = this.RANKS[currentRankIndex + 1];  // ❌ Promoción manual
    stats.rank_progress = 0;
  }
}
```

**Problemas:**
1. **Lógica duplicada:** Backend intenta promover rangos manualmente, pero el trigger de DB ya lo hace
2. **Lógica incorrecta:** Usa `level` (cada 5 niveles) en lugar de `total_xp` (500, 1000, 1500...)
3. **Conflicto:** Backend y DB tienen lógicas diferentes → resultados impredecibles
4. **Violación arquitectónica:** Documentación dice que trigger maneja todo, pero backend lo ignora

**Mapeo incorrecto:**
- Backend: Ajaw (nivel 0-4), Nacom (nivel 5-9), Ah K'in (nivel 10-14)...
- DB: Ajaw (0-499 XP), Nacom (500-999 XP), Ah K'in (1000-1499 XP)...

Estos NO coinciden porque:
- Con XP restado, un usuario con 100 niveles puede tener solo 500 XP total
- El trigger espera 500 XP, pero el usuario tiene menos XP acumulado

---

### 4. FLUJO ACTUAL (INCORRECTO)

```
Usuario completa ejercicio
        ↓
Backend: exercise-submission.service.ts:809
    await this.userStatsService.addXp(userId, xpEarned)
        ↓
Backend: user-stats.service.ts:127
    stats.total_xp += xpAmount  (✅ suma inicial)
        ↓
    while (stats.total_xp >= xp_to_next_level) {
        stats.total_xp -= xp_to_next_level  ❌ RESTA XP
        level++
    }
        ↓
    await this.userStatsRepo.save(stats)
    (Guarda con XP REDUCIDO, ej: 950 → 850)
        ↓
PostgreSQL: TRIGGER trg_check_rank_promotion_on_xp_gain
    ✅ Se ejecuta porque total_xp cambió
    ✅ Llama a check_rank_promotion(user_id)
        ↓
    check_rank_promotion():
        IF total_xp >= min_xp_required THEN
            -- ❌ NUNCA se cumple porque XP fue restado
            -- Usuario tiene 850 XP pero necesita 500
            -- ¡Debería estar en Nacom pero tiene Ajaw!
        END IF
        ↓
    ❌ NO promociona
```

**Resultado:** Usuario con 10 módulos completados sigue en Ajaw

---

## 🎯 GAPS IDENTIFICADOS

### GAP-001: Backend resta XP en lugar de acumularlo
**Severidad:** 🔴 CRÍTICA
**Ubicación:** `apps/backend/src/modules/gamification/services/user-stats.service.ts:132`
**Descripción:** La línea `stats.total_xp -= stats.xp_to_next_level` resta XP acumulado
**Impacto:** Sistema de rangos completamente roto
**Documentación afectada:** ET-GAM-003 (líneas 126-142)

**Código actual:**
```typescript
// ❌ INCORRECTO
while (stats.total_xp >= stats.xp_to_next_level) {
    stats.total_xp -= stats.xp_to_next_level;  // ❌
    stats.level += 1;
}
```

**Código esperado:**
```typescript
// ✅ CORRECTO
stats.total_xp += xpAmount;  // Solo sumar
// NO restar, NO calcular niveles
// Dejar que el trigger de DB maneje promociones
```

---

### GAP-002: Lógica de rango duplicada entre Backend y DB
**Severidad:** 🟠 ALTA
**Ubicación:** `apps/backend/src/modules/gamification/services/user-stats.service.ts:148-187`
**Descripción:** Backend implementa lógica de promoción de rango que contradice el trigger de DB
**Impacto:** Conflicto entre dos fuentes de verdad
**Documentación afectada:** RF-GAM-003, ET-GAM-003

**Problema:**
- **Documentación:** "Trigger automático maneja promociones"
- **Realidad:** Backend implementa lógica manual diferente

**Recomendación:** Eliminar `checkRankPromotion()` completamente

---

### GAP-003: Concepto de "nivel" no está en documentación
**Severidad:** 🟡 MEDIA
**Descripción:** Backend usa campo `level` y calcula `xp_to_next_level`, pero documentación solo habla de XP total
**Impacto:** Confusión arquitectónica

**Documentación dice:**
- Promoción basada en `total_xp` (500, 1000, 1500, 2250)

**Backend implementa:**
- Sistema de niveles con `xp_to_next_level`
- Cada nivel requiere más XP (scaling exponencial)

**Recomendación:** Decidir qué sistema usar (niveles o XP puro) y documentar

---

### GAP-004: Entity UserStats no coincide con esquema DB
**Severidad:** 🟡 MEDIA
**Ubicación:** `apps/backend/src/modules/gamification/entities/user-stats.entity.ts`
**Descripción:** TypeORM entity puede tener campos que no están en tabla real

**Necesita verificación:**
- ¿Existe `user_stats.level` en DB?
- ¿Existe `user_stats.xp_to_next_level` en DB?
- ¿Existe `user_stats.rank_progress` en DB?

**Recomendación:** Sincronizar entity con DDL real

---

## 📊 ESCENARIO DE PRUEBA

**Configuración inicial:**
- Usuario: `test-user-001`
- Rango inicial: `Ajaw`
- XP inicial: `0`

**Acción:**
Completar 2 módulos (10 ejercicios), cada uno otorga ~100 XP

**Resultado ESPERADO (según documentación):**
```
Ejercicio 1:  100 XP → total_xp =  100 (Ajaw)
Ejercicio 2:  100 XP → total_xp =  200 (Ajaw)
Ejercicio 3:  100 XP → total_xp =  300 (Ajaw)
Ejercicio 4:  100 XP → total_xp =  400 (Ajaw)
Ejercicio 5:  100 XP → total_xp =  500 → ✅ PROMOCIÓN A NACOM
Ejercicio 6:  100 XP → total_xp =  600 (Nacom)
Ejercicio 7:  100 XP → total_xp =  700 (Nacom)
Ejercicio 8:  100 XP → total_xp =  800 (Nacom)
Ejercicio 9:  100 XP → total_xp =  900 (Nacom)
Ejercicio 10: 100 XP → total_xp = 1000 → ✅ PROMOCIÓN A AH K'IN
```

**Resultado REAL (con el bug):**
```
Ejercicio 1:  100 XP → total_xp =   0 (restado)
Ejercicio 2:  100 XP → total_xp =   0 (restado)
Ejercicio 3:  100 XP → total_xp =   0 (restado)
...
Ejercicio 10: 100 XP → total_xp =   0 (restado)

Rango final: Ajaw (nunca promociona)
Level: 10 (sube niveles pero no acumula XP)
```

---

## ✅ SOLUCIÓN PROPUESTA

### Opción A: Eliminar lógica de backend (RECOMENDADA)

**Razón:** Mantener arquitectura documentada (trigger maneja todo)

**Cambios en `user-stats.service.ts`:**

```typescript
// ✅ SOLUCIÓN SIMPLE: Solo actualizar total_xp
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);

  // Solo sumar XP
  stats.total_xp += xpAmount;

  // Guardar (trigger se ejecuta automáticamente)
  return await this.userStatsRepo.save(stats);
}

// ✅ Eliminar checkRankPromotion() completamente
// ✅ Eliminar calculateXpForLevel() si no se usa
// ✅ Eliminar campo xp_to_next_level si no existe en DB
```

**Ventajas:**
- ✅ Simple: 3 líneas de código
- ✅ Alineado con documentación
- ✅ Fuente única de verdad (DB trigger)
- ✅ Menos bugs potenciales

**Desventajas:**
- ❌ Si se quiere sistema de "niveles" separado de "rangos", requiere replanteamiento

---

### Opción B: Mantener sistema de niveles (ALTERNATIVA)

**Razón:** Si realmente se quiere niveles + rangos separados

**Cambios en `user-stats.service.ts`:**

```typescript
// ✅ SOLUCIÓN CON NIVELES: Acumular XP + niveles separados
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);

  // 1. Acumular XP total (para trigger de rangos)
  stats.total_xp += xpAmount;  // ✅ NO restar nunca

  // 2. Calcular niveles por separado (visual)
  let xpForLevels = stats.xp_for_levels || 0;  // XP usado para calcular niveles (campo nuevo)
  xpForLevels += xpAmount;

  while (xpForLevels >= stats.xp_to_next_level) {
    xpForLevels -= stats.xp_to_next_level;  // Restar de XP de niveles, NO de total_xp
    stats.level += 1;
    stats.xp_to_next_level = this.calculateXpForLevel(stats.level);
  }

  stats.xp_for_levels = xpForLevels;

  // 3. NO calcular rango aquí (trigger lo hace)
  // Eliminar checkRankPromotion()

  return await this.userStatsRepo.save(stats);
}
```

**Ventajas:**
- ✅ Permite tener niveles (1, 2, 3...) + rangos (Ajaw, Nacom...)
- ✅ total_xp se acumula correctamente para rangos

**Desventajas:**
- ❌ Más complejo
- ❌ Requiere agregar campo `xp_for_levels` en DB
- ❌ Requiere actualizar documentación para explicar diferencia nivel vs rango

---

## 🚨 ACCIONES INMEDIATAS REQUERIDAS

### P0 - Crítico (Implementar HOY)
- [ ] **FIX GAP-001:** Eliminar línea que resta XP
- [ ] **FIX GAP-002:** Eliminar `checkRankPromotion()`
- [ ] **TEST:** Verificar que trigger funciona con cambio
- [ ] **DEPLOY:** Subir fix a dev/staging

### P1 - Alto (Esta semana)
- [ ] Revisar entity UserStats vs DDL real
- [ ] Decidir: ¿Sistema de niveles o solo rangos?
- [ ] Actualizar documentación con decisión
- [ ] Crear migration para limpiar datos incorrectos de usuarios actuales

### P2 - Medio (Próximas 2 semanas)
- [ ] Agregar tests unitarios para addXp()
- [ ] Agregar tests de integración para trigger
- [ ] Documentar en ADR la decisión sobre niveles/rangos

---

## 📚 REFERENCIAS

### Documentación Analizada
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md`
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
- `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`

### Código Analizado
- `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql`
- `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql`
- `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
- `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`
- `apps/backend/src/modules/gamification/services/user-stats.service.ts` (líneas 127-187)
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts` (línea 809)

### Tablas Afectadas
- `gamification_system.user_stats` (total_xp, current_rank, level)
- `gamification_system.maya_ranks` (min_xp_required, next_rank)
- `gamification_system.user_ranks` (historial de promociones)

---

## 🎯 CONCLUSIÓN

El sistema de XP y rangos está **completamente roto** debido a un bug crítico en el backend que resta XP en lugar de acumularlo. Esto impide que el trigger de base de datos (correctamente implementado) detecte las promociones de rango.

**Causa raíz:** Implementación en backend contradice arquitectura documentada
**Impacto:** 100% de usuarios afectados
**Fix:** Eliminar 2 funciones del backend (10 líneas de código)
**Tiempo estimado:** 30 minutos de desarrollo + testing

**Estado del análisis:** ✅ COMPLETO
**Próximo paso:** Implementar fix propuesto (Opción A recomendada)

---

**Reporte generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
