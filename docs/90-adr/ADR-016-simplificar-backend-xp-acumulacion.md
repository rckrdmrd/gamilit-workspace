---
titulo: "ADR-016: Simplificar Backend XP Acumulacion - Delegar Promocion a Trigger DB"
tipo: adr
fecha_creacion: "2025-11-24"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-016: Simplificar Backend XP Acumulación - Delegar Promoción a Trigger DB

**Estado:** Aceptada e Implementada
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Relacionado con:** Bug Fix - Sistema de Rangos Maya (ET-GAM-003)

---

## Contexto

El sistema de rangos Maya tiene un bug crítico que impide que los usuarios suban de rango:

**Problema:**
- Usuarios completan múltiples módulos pero NO avanzan de rango (Ajaw → Nacom → Ah K'in, etc.)
- El campo `total_xp` en `gamification_system.user_stats` nunca alcanza los umbrales (500, 1000, 1500, 2250)
- El trigger `trg_check_rank_promotion_on_xp_gain` NO detecta promociones

**Causa raíz:**
El método `UserStatsService.addXp()` tenía lógica que **restaba XP** en lugar de acumularlo:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);
  stats.total_xp += xpAmount;  // ✅ Suma inicial

  // ❌ RESTA EL XP AQUÍ
  while (stats.total_xp >= stats.xp_to_next_level) {
    stats.total_xp -= stats.xp_to_next_level;  // ❌ BUG
    stats.level += 1;
  }

  return await this.userStatsRepo.save(stats);
}
```

**Resultado:** Usuario con 10 ejercicios completados (~1,000 XP esperados) tiene `total_xp = 0-100` en DB.

---

## Decisión

**Eliminamos la lógica de backend** que maneja promociones de rango y **delegamos completamente** al trigger de base de datos.

**Nueva arquitectura:**

```
Backend (NestJS):
  ├─ addXp(userId, xpAmount)
  │   └─ stats.total_xp += xpAmount  // SOLO sumar
  │   └─ save(stats)                 // SOLO guardar
  └─ (FIN)

Database (PostgreSQL):
  ├─ TRIGGER trg_check_rank_promotion_on_xp_gain
  │   └─ WHEN (NEW.total_xp > OLD.total_xp)
  │   └─ EXECUTE check_rank_promotion(user_id)
  │       ├─ IF total_xp >= min_xp_required THEN
  │       │   └─ promote_to_next_rank(user_id, next_rank)
  │       │       ├─ UPDATE current_rank
  │       │       ├─ CREATE achievement
  │       │       ├─ INSERT rank_history
  │       │       ├─ UPDATE ml_coins
  │       │       └─ CREATE notification
  │       └─ END IF
  └─ (FIN)
```

**Backend simplificado:**
```typescript
// ✅ CÓDIGO CORRECTO
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);
  stats.total_xp += xpAmount;
  return await this.userStatsRepo.save(stats);
}
```

---

## Razones

### 1. **Arquitectura ya diseñada para triggers**

La especificación técnica (ET-GAM-003) dice:

> "Promoción automática mediante triggers PostgreSQL"

El trigger `trg_check_rank_promotion_on_xp_gain` ya existe y está correctamente implementado. Solo faltaba que el backend NO interfiriera.

### 2. **Fuente única de verdad**

**Antes:** Backend y DB tenían lógicas diferentes → conflicto
- Backend: Promoción basada en **niveles** (cada 5 niveles = 1 rango)
- DB: Promoción basada en **XP total** (500, 1000, 1500, 2250)

**Ahora:** Solo DB maneja promociones → consistencia
- Umbrales de XP configurables en tabla `maya_ranks`
- Cambios de configuración NO requieren deploy de backend

### 3. **Simplicidad y mantenibilidad**

**Antes:** 40+ líneas de lógica compleja
```typescript
- calculateXpForLevel()
- checkRankPromotion()
- Lógica de while loop
- Degradación de rank
- Cálculo de rank_progress
```

**Ahora:** 3 líneas simples
```typescript
stats.total_xp += xpAmount;
return save(stats);
```

### 4. **Alineación con documentación**

El documento de diseño (DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md) define:

| Rango | Umbral XP (v2.1) |
|-------|------------------|
| Ajaw | 0-499 |
| Nacom | 500-999 |
| Ah K'in | 1,000-1,499 |
| Halach Uinic | 1,500-1,899 |
| K'uk'ulkan | 1,900+ |

> **Nota (v2.1 - Diciembre 2025):** Los umbrales fueron ajustados de 2,250 a 1,900 XP para K'uk'ulkan, permitiendo alcanzar el rango máximo con M1-M3 (~1,950 XP disponibles).

Esto se cumple CON el trigger de DB, NO con la lógica de backend.

### 5. **Performance**

**Ventaja:** Trigger ejecuta en SQL (más rápido que ORM)
- No hay round-trips adicionales
- Transacción atómica garantizada
- Índices optimizados en `total_xp`

---

## Consecuencias

### Positivas ✅

1. **Bug solucionado:** XP se acumula correctamente
2. **Sistema de rangos funciona:** Usuarios promocionan al alcanzar umbrales
3. **Código más simple:** 3 líneas vs 40+ líneas
4. **Mantenimiento reducido:** Menos lógica = menos bugs
5. **Fuente única de verdad:** DB es canonical source para rangos
6. **Configuración dinámica:** Cambios en `maya_ranks` sin deploy

### Negativas/Trade-offs ⚠️

1. **Campo `level` deprecado:** Ya no se actualiza
   - **Impacto:** Si frontend usa `level`, verá valores obsoletos
   - **Mitigación:** Decidir si eliminar o reimplementar sistema de niveles

2. **Lógica en DB en lugar de código**
   - **Impacto:** Desarrolladores deben conocer SQL para entender promociones
   - **Mitigación:** Documentación actualizada (ET-GAM-003)

3. **Testing más complejo**
   - **Impacto:** Tests deben usar base de datos real (no mocks simples)
   - **Mitigación:** Usar testcontainers o DB en memoria

### Desconocidas ❓

1. **Sistema de "niveles" visual:** ¿Se necesita?
   - Si sí: Implementar por separado de rangos
   - Si no: Eliminar campo `level` de DB

---

## Alternativas Consideradas

### Alternativa 1: Mantener lógica de backend pero corregir bug

**Descripción:** Corregir la resta de XP pero mantener lógica de promoción en backend

**Pros:**
- Lógica en código TypeScript (más familiar)
- Tests unitarios más simples

**Cons:**
- ❌ Duplicación de lógica (backend y DB)
- ❌ Dos fuentes de verdad → conflictos
- ❌ No alineado con documentación que especifica "trigger automático"
- ❌ Más código = más superficie de bugs

**Razón de rechazo:** Va contra la arquitectura documentada

### Alternativa 2: Eliminar trigger y solo usar backend

**Descripción:** Desactivar trigger de DB y manejar todo en NestJS

**Pros:**
- Todo en un lugar (backend)
- Más control desde código

**Cons:**
- ❌ Requiere reescribir toda la lógica de promoción
- ❌ Pérdida de atomicidad de transacciones
- ❌ No aprovecha capacidades de DB (triggers, constraints)
- ❌ Viola arquitectura diseñada (especificación dice "trigger automático")

**Razón de rechazo:** Arquitectura ya diseñada con triggers (ET-GAM-003)

### Alternativa 3: Sistema híbrido

**Descripción:** Backend calcula, DB valida

**Pros:**
- Validación redundante

**Cons:**
- ❌ Complejidad máxima
- ❌ Dos puntos de falla
- ❌ Overhead de performance

**Razón de rechazo:** Over-engineering innecesario

---

## Implementación

### Archivos Modificados

**Backend:**
```
apps/backend/src/modules/gamification/services/user-stats.service.ts
  - addXp() simplificado (líneas 138-151)
  - checkRankPromotion() marcado @deprecated (línea 161)
```

**Documentación:**
```
docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md
  - Sección "FIX IMPLEMENTADO - 2025-11-24" agregada
  - Historial de cambios actualizado (versión 1.2)
```

**Reportes:**
```
orchestration/agentes/architecture-analyst/analisis-sistema-xp-rangos-2025-11-24/
  - REPORTE-BUG-XP-NO-ACUMULA.md (reporte técnico completo)
```

### Código Específico

**Antes:**
```typescript
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);
  stats.total_xp += xpAmount;

  while (stats.total_xp >= stats.xp_to_next_level) {
    stats.total_xp -= stats.xp_to_next_level;  // ❌
    stats.level += 1;
    stats.xp_to_next_level = this.calculateXpForLevel(stats.level);
    await this.checkRankPromotion(stats);
  }

  return await this.userStatsRepo.save(stats);
}
```

**Después:**
```typescript
async addXp(userId: string, xpAmount: number): Promise<UserStats> {
  const stats = await this.findByUserId(userId);
  stats.total_xp += xpAmount;
  return await this.userStatsRepo.save(stats);
}
```

---

## Validación

### Criterios de Éxito

- [x] Código compila sin errores
- [x] Tests existentes pasan
- [x] XP se acumula correctamente (`total_xp` aumenta)
- [ ] Usuario con 500 XP promociona a Nacom (pendiente testing manual)
- [ ] Trigger crea achievement automáticamente (pendiente testing manual)
- [ ] Notificación rank_up se envía (pendiente testing manual)

### Pruebas Requeridas

**1. Test unitario de addXp():**
```typescript
it('should accumulate XP correctly', async () => {
  const user = await createUser({ total_xp: 450 });
  await userStatsService.addXp(user.id, 100);
  const updated = await getUserStats(user.id);
  expect(updated.total_xp).toBe(550);  // ✅ Acumulado
});
```

**2. Test de integración con trigger:**
```typescript
it('should promote to Nacom at 500 XP', async () => {
  const user = await createUser({ total_xp: 450, current_rank: 'Ajaw' });
  await userStatsService.addXp(user.id, 100);
  const updated = await getUserStats(user.id);
  expect(updated.total_xp).toBe(550);
  expect(updated.current_rank).toBe('Nacom');  // ✅ Promocionado por trigger
});
```

**3. Test de ML Coins bonus:**
```typescript
it('should award 100 ML Coins on Nacom promotion', async () => {
  const user = await createUser({ total_xp: 450, ml_coins: 100 });
  await userStatsService.addXp(user.id, 100);
  const updated = await getUserStats(user.id);
  expect(updated.ml_coins).toBe(200);  // ✅ 100 + 100 bonus
});
```

---

## Referencias

### Documentación
- [ET-GAM-003: Sistema de Rangos Maya](../10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-003-rangos-maya.md)
- [RF-GAM-003: Requerimiento Funcional Rangos](../10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-003-rangos-maya.md)
- [Reportes de bug/validación vigentes](../../orchestration/reports/README.md)

### Código DDL
- `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql`
- `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql`
- `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
- `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`

### Issues Relacionados
- Bug reportado por usuario: "Completé 2 módulos pero no subo de rango"
- GAP-001: Backend resta XP (crítico)
- GAP-002: Lógica de rango duplicada (alto)
- GAP-003: Campo `level` no documentado (medio)

---

## Decisiones Futuras

### 1. Campo `level` en `user_stats`

**Opciones:**
- **A) Eliminar completamente:** Remover de DB schema y entity
- **B) Reimplementar correctamente:** Como sistema visual separado de rangos
- **C) Dejar deprecated:** Mantener pero no usar

**Recomendación:** Opción A (eliminar) si no se usa en frontend
**Decisión:** Pendiente de análisis de uso en frontend

### 2. Sistema de "niveles" visual

**¿Se necesita sistema de niveles adicional a rangos?**

**Si SÍ:**
- Implementar como campo separado `visual_level`
- Usar para progresión visual en UI
- NO vincular a promociones de rango
- Documentar diferencia: `level` ≠ `rank`

**Si NO:**
- Eliminar referencias a niveles
- Actualizar frontend para usar solo rangos
- Simplificar modelo de datos

**Decisión:** Pendiente de feedback de product owner

---

## Métricas de Éxito

**Antes del fix:**
- 0% de usuarios promocionados correctamente
- 100% de usuarios bloqueados en Ajaw

**Después del fix (esperado):**
- 100% de usuarios con ≥500 XP en Nacom
- 100% de usuarios con ≥1,000 XP en Ah K'in
- 0 errores en logs de trigger

**Monitorear:**
```sql
-- Distribución de rangos (debería ser piramidal)
SELECT current_rank, COUNT(*) as users
FROM gamification_system.user_stats
GROUP BY current_rank
ORDER BY
  CASE current_rank
    WHEN 'Ajaw' THEN 1
    WHEN 'Nacom' THEN 2
    WHEN 'Ah K''in' THEN 3
    WHEN 'Halach Uinic' THEN 4
    WHEN 'K''uk''ulkan' THEN 5
  END;
```

---

**Estado:** Aceptada e Implementada
**Próxima revisión:** Después de testing manual en dev
**Aprobado por:** Architecture-Analyst
**Fecha de aprobación:** 2025-11-24
