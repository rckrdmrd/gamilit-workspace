# Análisis de ENUMs de Gamificación - Migración a gamification_system

**Fecha:** 2025-11-07
**Versión:** 1.0
**Responsable:** Validación automática
**Objetivo:** Migrar ENUMs de public a gamification_system schema

---

## 📋 ENUMs Analizados

### P1.1.3: comodin_type ✅ REQUIERE MIGRACIÓN

**ENUM actual:**
- **Ubicación:** `public.comodin_type`
- **Valores:** 3 → `'pistas', 'vision_lectora', 'segunda_oportunidad'`
- **DDL:** `apps/database/ddl/schemas/public/enums/comodin_type.sql`

**Uso en tablas:**
- ✅ **educational_content.exercises**
  - Columna: `comodines_allowed public.comodin_type[]`
  - Tipo: ARRAY de ENUM
  - Default: `ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']`

- ❌ **gamification_system.comodines_inventory** → NO usa el ENUM
  - Usa columnas separadas (pistas_available, vision_lectora_available, etc.)
  - No requiere cambios

**Acción requerida:** MIGRAR
- Mover ENUM a `gamification_system.comodin_type`
- Actualizar `exercises.comodines_allowed` para usar `gamification_system.comodin_type[]`
- Eliminar `public.comodin_type` después de migración

**Prioridad:** P1 - ALTO
**Complejidad:** MEDIA (uso de ARRAY)

---

### P1.1.4: transaction_type ⚠️ PROBLEMA CRÍTICO

**ENUM actual:**
- **Ubicación:** `public.transaction_type`
- **Valores:** 10 valores
  ```sql
  'earned_exercise', 'earned_achievement', 'earned_daily_bonus', 'earned_rank_promotion',
  'spent_hint', 'spent_unlock_content', 'spent_customization',
  'refund', 'admin_adjustment', 'gift'
  ```
- **DDL:** `apps/database/ddl/schemas/public/enums/transaction_type.sql`

**Uso en tablas:**
- ❌ **gamification_system.ml_coins_transactions** → USA TEXT CON CHECK CONSTRAINT
  - Columna: `transaction_type text NOT NULL`
  - CHECK constraint con 12 valores:
    ```sql
    'earned_exercise', 'earned_module', 'earned_achievement', 'earned_rank', 'earned_streak',
    'spent_powerup', 'spent_hint', 'spent_retry',
    'admin_adjustment', 'refund', 'bonus', 'welcome_bonus'
    ```

**PROBLEMA:** Desincronización entre ENUM y CHECK constraint

| Fuente | Valores | Diferencias |
|--------|---------|-------------|
| ENUM (public) | 10 valores | - |
| CHECK (tabla) | 12 valores | + earned_module, earned_rank, earned_streak, spent_powerup, spent_retry, bonus, welcome_bonus |
| | | - earned_daily_bonus, earned_rank_promotion, spent_unlock_content, spent_customization, gift |

**Documentación oficial:**
- `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`
- Especifica 14 transaction_types

**Acción requerida:** SINCRONIZAR Y MIGRAR
1. Determinar valores correctos según documentación oficial
2. Actualizar ENUM con valores correctos
3. Convertir tabla de TEXT+CHECK a ENUM
4. Migrar a gamification_system
5. Eliminar public.transaction_type

**Prioridad:** P0 - CRÍTICO
**Complejidad:** ALTA (desincronización, conversión TEXT→ENUM)

---

### P1.1.6: notification_priority ❌ NO USADO - HUÉRFANO

**ENUM actual:**
- **Ubicación:** `public.notification_priority`
- **Valores:** 4 → `'low', 'medium', 'high', 'critical'`
- **DDL:** `apps/database/ddl/schemas/public/enums/notification_priority.sql`

**Uso en tablas:**
- ❌ **gamification_system.notifications** → NO lo usa
  - La tabla solo tiene: id, user_id, type, title, message, data, read, created_at, updated_at
  - NO tiene columna priority

**Acción requerida:** EVALUAR
- Opciones:
  1. **ELIMINAR**: Si no se planea usar, eliminar el ENUM huérfano
  2. **MANTENER**: Si se planea agregar columna priority en el futuro, mover a gamification_system
  3. **AGREGAR COLUMNA**: Si es funcionalidad faltante, agregar columna priority a tabla

**Recomendación:** Verificar con especificación oficial si priority es requerido
- Si TYPES-NOTIFICATIONS.md lo menciona → Agregar columna
- Si NO lo menciona → Eliminar ENUM huérfano

**Prioridad:** P2 - MEDIO
**Complejidad:** BAJA (no usado actualmente)

---

### P1.1.7: notification_channel ❌ NO USADO - HUÉRFANO

**ENUM actual:**
- **Ubicación:** `public.notification_channel`
- **Valores:** 4 → `'in_app', 'email', 'push', 'sms'`
- **DDL:** `apps/database/ddl/schemas/public/enums/notification_channel.sql`

**Uso en tablas:**
- ❌ **gamification_system.notifications** → NO lo usa
  - La tabla NO tiene columna channel

**Acción requerida:** EVALUAR
- Opciones similares a notification_priority:
  1. **ELIMINAR**: Si no se planea usar canales múltiples
  2. **MANTENER**: Si es funcionalidad futura, mover a gamification_system
  3. **AGREGAR COLUMNA**: Si es necesario distinguir canales

**Recomendación:** Verificar especificación oficial
- Probablemente relacionado con sistema de notificaciones multi-canal (WebSocket, email, push)
- Si es funcionalidad futura → Mover a gamification_system
- Si NO se implementará → Eliminar

**Prioridad:** P2 - MEDIO
**Complejidad:** BAJA (no usado actualmente)

---

## 📊 Resumen de Acciones

| ENUM | Estado Actual | Acción | Prioridad | Complejidad |
|------|---------------|--------|-----------|-------------|
| comodin_type | Usado en exercises | MIGRAR a gamification_system | P1 | MEDIA |
| transaction_type | Desincronizado, tabla usa TEXT | SINCRONIZAR + MIGRAR | P0 | ALTA |
| notification_priority | No usado (huérfano) | EVALUAR (eliminar o agregar columna) | P2 | BAJA |
| notification_channel | No usado (huérfano) | EVALUAR (eliminar o agregar columna) | P2 | BAJA |

---

## 🎯 Plan de Implementación

### Fase 1: Crítico (P0) - transaction_type

1. **Consultar documentación oficial**
   - Leer `TYPES-GAMIFICATION.md` para determinar valores correctos
   - Crear lista definitiva de transaction_types

2. **Crear nuevo ENUM sincronizado**
   - `gamification_system.transaction_type` con valores correctos
   - Basado en especificación oficial

3. **Migration script**
   - Mapear valores actuales en CHECK constraint
   - Convertir columna de TEXT a ENUM
   - Eliminar CHECK constraint
   - Validar datos existentes

**Estimado:** 3-4 horas
**Archivos:**
- DDL: `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`
- Migration: `apps/database/migrations/2025-11-0X-sync-transaction-type-enum.sql`
- Table DDL: `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`

---

### Fase 2: Alto (P1) - comodin_type

1. **Crear ENUM en gamification_system**
   - `gamification_system.comodin_type`
   - Mismos 3 valores

2. **Migration script**
   - Actualizar `exercises.comodines_allowed` de `public.comodin_type[]` a `gamification_system.comodin_type[]`
   - Estrategia: Convertir a text[], luego a gamification_system.comodin_type[]

3. **Eliminar public.comodin_type**
   - Después de validar que no hay otros usos

**Estimado:** 2-3 horas
**Archivos:**
- DDL: `apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql`
- Migration: `apps/database/migrations/2025-11-0X-migrate-comodin-type-enum.sql`
- Table DDL: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

---

### Fase 3: Medio (P2) - notification priority/channel

1. **Verificar especificación oficial**
   - Consultar `TYPES-NOTIFICATIONS.md`
   - Consultar `05-realtime-notifications.md` (trazabilidad)

2. **Decisión:**
   - **Opción A**: Eliminar ENUMs huérfanos si no son parte de especificación
   - **Opción B**: Agregar columnas si son funcionalidad faltante
   - **Opción C**: Mover a gamification_system si son funcionalidad futura

**Estimado:** 1-2 horas (decisión + implementación)

---

## 📝 Notas Importantes

### transaction_type - Valores Recomendados

Basado en análisis de código actual y patrón de uso:

**Earned (ingresos):**
- earned_exercise
- earned_module
- earned_achievement
- earned_rank (rank_up)
- earned_streak (streak milestone)
- earned_daily (daily bonus)
- earned_bonus
- welcome_bonus

**Spent (gastos):**
- spent_powerup (comodines)
- spent_hint
- spent_retry
- spent_unlock_content (opcional)
- spent_customization (opcional)

**Admin/Sistema:**
- admin_adjustment
- refund
- gift

**Total recomendado:** 14-16 valores

### comodin_type - Inmutabilidad

Los 3 tipos de comodines están hardcoded en múltiples lugares:
- Tabla comodines_inventory (columnas dedicadas)
- Tabla exercises (defaults)
- Funciones (consume_comodin, redeem_comodin)

**No agregar nuevos tipos sin refactoring completo del sistema.**

---

## ✅ Checklist de Validación

### Pre-migración
- [ ] Backup de base de datos
- [ ] Consultar documentación oficial para valores correctos
- [ ] Verificar uso en backend entities
- [ ] Identificar funciones que usan ENUMs

### Durante migración
- [ ] Crear ENUMs en gamification_system
- [ ] Migration con pre/post validación
- [ ] Mapeo de valores legacy
- [ ] Testing en staging

### Post-migración
- [ ] Validar datos migrados
- [ ] Actualizar documentación
- [ ] Actualizar _MAP.md de public/enums
- [ ] Actualizar TRACKING-CORRECCIONES.md

---

**Próximos pasos:** Implementar Fase 1 (transaction_type) como P0 crítico
