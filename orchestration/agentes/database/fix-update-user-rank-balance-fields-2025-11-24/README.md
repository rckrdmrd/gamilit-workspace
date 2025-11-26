# Fix: update_user_rank() Balance Fields - 2025-11-24

**Agente:** Database-Agent
**Fecha:** 2025-11-24
**Estado:** ✅ COMPLETADO
**Tipo:** Bug Fix - Constraint Violation

---

## Descripción

Corrección de la función `gamification_system.update_user_rank()` para incluir campos `balance_before` y `balance_after` en INSERT a `ml_coins_transactions`, cumpliendo con constraints NOT NULL de la tabla.

---

## Archivos en este Directorio

### 1. RESUMEN-EJECUTIVO.md
**Propósito:** Vista rápida del problema, solución y próximos pasos
**Para:** Tech Lead, Product Owner
**Contiene:**
- Problema y error original
- Solución implementada (resumen)
- Validación y criterios de aceptación
- Descubrimientos adicionales
- Próximos pasos y métricas

### 2. REPORTE-CORRECCION-UPDATE-USER-RANK.md
**Propósito:** Documentación técnica completa de la corrección
**Para:** Database Engineers, Backend Developers
**Contiene:**
- Contexto y análisis del problema
- Código problemático vs corregido (línea por línea)
- Validación de integridad
- Casos de prueba (3 escenarios)
- Lecciones aprendidas y checklist

### 3. ANALISIS-FUNCIONES-AFECTADAS.md
**Propósito:** Análisis de impacto en otras funciones con el mismo problema
**Para:** Database Team, QA
**Contiene:**
- 7 funciones analizadas (3 correctas, 4 con problemas)
- Template de corrección reutilizable
- Priorización de correcciones pendientes
- ENUM válidos de transaction_type
- Plan de acción completo

---

## Archivos Modificados

### Código
```
apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql
```
**Cambios:**
- Líneas 25-26: Variables agregadas
- Líneas 58-64: Captura y cálculo de balance
- Líneas 79-89: INSERT corregido

### Documentación
```
apps/database/docs/database/CHANGELOG.md
```
**Sección:** [2.5.3] - 2025-11-24 / Fixed

---

## Scripts de Validación

### Validación Completa
```bash
cd apps/database
psql -d gamilit_platform -f scripts/validate-update-user-rank-fix.sql
```

**Script:** `apps/database/scripts/validate-update-user-rank-fix.sql`
**Incluye:**
- Verificación de estructura de tabla
- Validación de ENUM transaction_type
- Test de función con ROLLBACK
- Checklist de validación

---

## Aplicar Corrección

### 1. Validar Sintaxis
```bash
cd apps/database
psql -d gamilit_platform -f ddl/schemas/gamification_system/functions/update_user_rank.sql
```

### 2. Ejecutar Validación
```bash
psql -d gamilit_platform -f scripts/validate-update-user-rank-fix.sql
```

### 3. Test de Integración
```bash
# Desde backend
npm run test:e2e -- --testPathPattern=ranks
```

---

## Funciones Relacionadas (Pendientes de Corrección)

### Prioridad Alta
1. `check_and_award_achievements.sql` - Sistema de achievements
2. `claim_achievement_reward.sql` - Reclamar recompensas
3. `update_mission_progress.sql` - Sistema de misiones

### Prioridad Media
4. `trg_achievement_unlocked.sql` - Trigger automático

**Todas** tienen el mismo problema: falta `balance_before` y `balance_after` en INSERT.

---

## Estructura de la Corrección

### Antes (INCORRECTO)
```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, transaction_type, description
) VALUES (
    p_user_id,
    v_coins_reward,
    'RANK_UP',  -- ❌ ENUM inválido
    'Ascendiste al rango ' || v_new_rank
);
```

### Después (CORRECTO)
```sql
-- Capturar balance actual
SELECT COALESCE(ml_coins, 0) INTO v_current_balance
FROM gamification_system.user_stats
WHERE user_id = p_user_id;

v_new_balance := v_current_balance + v_coins_reward;

-- INSERT corregido
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, balance_before, balance_after, transaction_type, description
) VALUES (
    p_user_id,
    v_coins_reward,
    v_current_balance,                                   -- ✅ AGREGADO
    v_new_balance,                                       -- ✅ AGREGADO
    'earned_rank'::gamification_system.transaction_type, -- ✅ ENUM CORRECTO
    'Ascendiste al rango ' || v_new_rank
);
```

---

## Referencias

### Documentación GAMILIT
- **RF-GAM-004:** Sistema de ML Coins
- **RF-GAM-003:** Sistema de Rangos Maya
- **ET-GAM-004:** Tipos Compartidos de Gamificación

### Archivos Relacionados
- **Tabla:** `ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`
- **ENUM:** `ddl/schemas/gamification_system/enums/transaction_type.sql`
- **User Stats:** `ddl/schemas/gamification_system/tables/01-user_stats.sql`

---

## Contacto y Seguimiento

**Responsable:** Database-Agent
**Fecha de corrección:** 2025-11-24
**Estado:** ✅ COMPLETADO - Pendiente aplicación a BD

**Para consultas:**
- Revisar REPORTE-CORRECCION-UPDATE-USER-RANK.md para detalles técnicos
- Revisar ANALISIS-FUNCIONES-AFECTADAS.md para funciones pendientes
- Ejecutar script de validación para verificar corrección

---

## Checklist de Finalización

- [x] Función corregida
- [x] Documentación completa generada
- [x] Script de validación creado
- [x] Changelog actualizado
- [x] Análisis de funciones relacionadas
- [x] Template de corrección definido
- [ ] Aplicación a base de datos
- [ ] Validación con backend
- [ ] Corrección de funciones adicionales
- [ ] Deploy a producción

---

**Última actualización:** 2025-11-24
**Versión:** 1.0
