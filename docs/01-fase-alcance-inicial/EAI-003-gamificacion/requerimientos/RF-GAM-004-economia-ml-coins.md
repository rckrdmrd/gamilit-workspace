# RF-GAM-004: Economía de ML Coins (Maya Learning Coins)

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-GAM-004 |
| **Módulo** | 02 - Gamificación |
| **Título** | Economía de ML Coins (Maya Learning Coins) |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 2.0 |
| **Fecha Creación** | 2025-11-08 |
| **Última Actualización** | 2025-11-08 |
| **Autor** | Database Team |
| **Stakeholders** | Product Owner, UX Team, Backend Team, Frontend Team, Game Designer |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas Relacionadas:**

1. **`gamification_system.user_stats`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/user_stats.sql`
   - **Propósito:** Almacena balance actual de ML Coins y totales históricos
   - **Columnas clave:**
     - `ml_coins` (INTEGER): Balance actual de ML Coins
     - `ml_coins_earned_total` (INTEGER): Total histórico ganado
     - `ml_coins_spent_total` (INTEGER): Total histórico gastado

2. **`gamification_system.ml_coins_transactions`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`
   - **Propósito:** Registro completo de todas las transacciones de ML Coins
   - **Columnas clave:**
     - `id` (UUID): ID único de transacción
     - `user_id` (UUID): Usuario que realiza la transacción
     - `amount` (INTEGER): Monto de la transacción (con multiplicador aplicado)
     - `balance_before` (INTEGER): Balance antes de la transacción
     - `balance_after` (INTEGER): Balance después de la transacción
     - `transaction_type` (ENUM): Tipo de transacción (14 tipos)
     - `multiplier` (NUMERIC): Multiplicador aplicado (ej: 1.25x por rango)
     - `metadata` (JSONB): Información adicional (base_amount, rank, etc.)
     - `created_at` (TIMESTAMPTZ): Timestamp de la transacción

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`
- **Tipo:** `gamification_system.transaction_type`
- **Valores:** 14 tipos (7 earned, 3 spent, 4 admin)

🗄️ **Funciones SQL:**

1. **`award_ml_coins(user_id, amount, transaction_type, description, reference_id, reference_type)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql`
   - **Propósito:** Otorgar ML Coins al usuario aplicando multiplicador de rango
   - **Validaciones:**
     - Obtiene rango actual del usuario
     - Aplica multiplicador según rango Maya (1.00x - 2.00x)
     - Actualiza balance con `FOR UPDATE` (previene race conditions)
     - Registra transacción con metadata completa

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-GAM-004: Tipos Compartidos de Gamificación](../../especificaciones/ET-GAM-004-tipos-compartidos-gamificacion.md)
- [ET-GAM-003: Rangos Maya](../../especificaciones/ET-GAM-003-rangos-maya.md) - Multiplicadores de rango
- [ET-GAM-002: Sistema de Comodines](../../especificaciones/ET-GAM-002-comodines.md) - Gastos de ML Coins

### Documentos Relacionados

- [RF-GAM-002: Sistema de Comodines](./RF-GAM-002-comodines.md) - Principal uso de ML Coins
- [RF-GAM-003: Rangos Maya](./RF-GAM-003-rangos-maya.md) - Multiplicadores por rango
- [RF-GAM-001: Sistema de Achievements](./RF-GAM-001-achievements.md) - Fuente de ML Coins

---

## 📖 Descripción General

### Propósito

El sistema de **ML Coins (Maya Learning Coins)** es la moneda virtual principal de la plataforma Gamilit. Proporciona:

- **Motivación económica**: Los estudiantes ganan coins por actividades de aprendizaje
- **Sistema de recompensas**: Progresión tangible y medible
- **Economía de recursos escasos**: Decisiones estratégicas sobre cómo gastar coins
- **Gamificación profunda**: Feedback inmediato por logros

### Contexto

Los ML Coins son el núcleo del sistema de gamificación de Gamilit:

1. **Se ganan** completando ejercicios, módulos, achievements, rachas, etc.
2. **Se multiplican** según el rango Maya del usuario (1.00x - 2.00x)
3. **Se gastan** en comodines (power-ups), pistas, reintentos
4. **Se rastrean** con historial completo de transacciones

---

## 🎯 Objetivos del Sistema

### Objetivos Primarios

1. **Incentivar el aprendizaje activo**
   - Recompensar inmediatamente actividades educativas
   - Crear ciclo de feedback positivo
   - Motivar a completar contenido

2. **Promover progresión y maestría**
   - Mayores recompensas por contenido difícil
   - Multiplicadores por rango premian veteranos
   - Balance entre nuevos y experimentados

3. **Habilitar toma de decisiones estratégicas**
   - Recursos escasos requieren planificación
   - Decisión: ¿guardar o gastar?
   - Enseña administración de recursos

### Objetivos Secundarios

1. **Crear economía sostenible**
   - Balance entre earning y spending
   - Prevenir inflación de coins
   - Evitar acumulación excesiva

2. **Facilitar análisis y métricas**
   - Trackear engagement por tipo de actividad
   - Identificar usuarios en riesgo
   - Optimizar recompensas basado en datos

---

## 📊 Flujos de ML Coins

### 1. Earning (Ganancia de Coins)

#### 1.1 Por Actividad Educativa

**Ejercicios Completados** (`earned_exercise`)
- **Monto base:** 5-50 ML Coins (según dificultad)
- **Multiplicador:** Según rango Maya (1.00x - 2.00x)
- **Trigger:** Al completar ejercicio exitosamente
- **Ejemplo:**
  - Estudiante Ajaw (1.00x) completa ejercicio medio (20 coins)
  - Recibe: 20 * 1.00 = **20 ML Coins**
  - Estudiante K'uk'ulkan (2.00x) completa mismo ejercicio
  - Recibe: 20 * 2.00 = **40 ML Coins**

**Módulos Completados** (`earned_module`)
- **Monto base:** 100-300 ML Coins (según módulo)
- **Multiplicador:** Según rango Maya
- **Trigger:** Al completar 100% de ejercicios del módulo
- **Ejemplo:**
  - Módulo "Comprensión Literal" = 150 coins base
  - Nacom (1.25x): 150 * 1.25 = **188 ML Coins**

**Achievements Desbloqueados** (`earned_achievement`)
- **Monto base:** 50-500 ML Coins (según rareza)
  - Común: 50 coins
  - Raro: 100 coins
  - Épico: 250 coins
  - Legendario: 500 coins
- **Multiplicador:** Según rango Maya
- **Trigger:** Al cumplir condiciones del achievement

#### 1.2 Por Progresión y Engagement

**Subida de Rango** (`earned_rank`)
- **Monto:** 100-1000 ML Coins (según rango alcanzado)
  - Ajaw → Nacom: 100 coins
  - Nacom → Ah K'in: 250 coins
  - Ah K'in → Halach Uinic: 500 coins
  - Halach Uinic → K'uk'ulkan: 1000 coins
- **Multiplicador:** NO aplica (recompensa fija)
- **Trigger:** Al alcanzar XP requerido para nuevo rango

**Racha de Días** (`earned_streak`)
- **Monto:** 10-100 ML Coins (según días consecutivos)
  - 3 días: 10 coins
  - 7 días: 25 coins
  - 14 días: 50 coins
  - 30 días: 100 coins
- **Multiplicador:** Según rango Maya
- **Trigger:** Al mantener racha activa

**Login Diario** (`earned_daily`)
- **Monto:** 50 ML Coins
- **Multiplicador:** Según rango Maya
- **Trigger:** Primer login del día
- **Límite:** 1 vez por día

**Bonus Especial** (`earned_bonus`)
- **Monto:** Variable (definido por evento)
- **Multiplicador:** Según rango Maya
- **Trigger:** Eventos especiales, promociones, desafíos
- **Ejemplo:** "Semana de la Lectura" +200 coins por completar módulo

---

### 2. Spending (Gasto de Coins)

#### 2.1 Comodines (Power-ups)

**Pistas Contextuales** (`spent_powerup` - pistas)
- **Costo:** -15 ML Coins
- **Beneficio:** Muestra 2-3 pistas sobre respuesta correcta
- **Límite:** 3 por ejercicio
- **Uso estratégico:** Para ejercicios difíciles sin perder intento

**Visión Lectora** (`spent_powerup` - vision_lectora)
- **Costo:** -25 ML Coins
- **Beneficio:** Resalta pasajes clave del texto
- **Límite:** 1 por ejercicio
- **Uso estratégico:** Para textos largos y complejos

**Segunda Oportunidad** (`spent_powerup` - segunda_oportunidad)
- **Costo:** -40 ML Coins
- **Beneficio:** Permite reintento sin penalización de XP
- **Límite:** 1 por ejercicio
- **Uso estratégico:** Para ejercicios críticos

#### 2.2 Ayudas Adicionales

**Pista Simple** (`spent_hint`)
- **Costo:** -10 ML Coins
- **Beneficio:** Pista contextual individual
- **Límite:** Ilimitado (costoso)

**Reintento de Ejercicio** (`spent_retry`)
- **Costo:** -20 ML Coins
- **Beneficio:** Reiniciar ejercicio fallado
- **Límite:** Ilimitado

---

### 3. Administrativo y Sistema

**Ajuste Manual** (`admin_adjustment`)
- **Monto:** Variable (+ o -)
- **Propósito:** Correcciones, compensaciones, regalos
- **Autorización:** Solo administradores
- **Ejemplo:** Compensar bug que afectó a usuarios

**Reembolso** (`refund`)
- **Monto:** Positivo (devolución)
- **Propósito:** Devolver coins por compra errónea o bug
- **Trigger:** Solicitud de usuario o detección automática

**Bonus General** (`bonus`)
- **Monto:** Positivo
- **Propósito:** Bonos del sistema no categorizados
- **Ejemplo:** Recompensa por participar en beta testing

**Bonus de Bienvenida** (`welcome_bonus`)
- **Monto:** +100 ML Coins
- **Propósito:** Dar capital inicial a nuevos usuarios
- **Trigger:** Registro de nueva cuenta (una sola vez)

---

## 🔢 Economía y Balance

### Multiplicadores por Rango Maya

| Rango | Nivel | Multiplicador | Impacto |
|-------|-------|---------------|---------|
| **Ajaw** | 1 | 1.00x | Sin bonus (baseline) |
| **Nacom** | 2 | 1.25x | +25% ML Coins |
| **Ah K'in** | 3 | 1.50x | +50% ML Coins |
| **Halach Uinic** | 4 | 1.75x | +75% ML Coins |
| **K'uk'ulkan** | 5 | 2.00x | +100% ML Coins (doble) |

**Justificación:**
- Recompensa progresión a largo plazo
- Veteranos ganan más por misma actividad
- Incentivo para subir de rango
- Crea diferenciación entre niveles de maestría

**Ver:** [ET-GAM-003: Rangos Maya](../../especificaciones/ET-GAM-003-rangos-maya.md) para detalles completos.

### Earning vs Spending Estimado

**Earning Típico (Usuario Activo - Ajaw 1.00x):**
- 10 ejercicios/día: 10 * 20 = 200 coins
- 1 módulo/semana: 150 coins
- 1 achievement/semana: 100 coins
- Login diario: 50 coins
- **Total semanal:** ~1,300 ML Coins

**Spending Típico:**
- 3 pistas/semana: 3 * 15 = 45 coins
- 1 visión lectora/semana: 25 coins
- 1 segunda oportunidad/semana: 40 coins
- **Total semanal:** ~110 ML Coins

**Balance:** +1,190 ML Coins/semana (positivo, permite acumulación)

**Objetivo:** Usuarios deben poder acumular coins pero sentir que son valiosos (no triviales).

---

## 📐 Reglas de Negocio

### Regla 1: No Negativos

**Descripción:** El balance de ML Coins de un usuario **nunca** puede ser negativo.

**Implementación:**
- CHECK constraint en tabla `user_stats`: `ml_coins >= 0`
- Validación en función `spend_ml_coins()` antes de restar
- Frontend previene compra si balance insuficiente

**Ejemplo:**
```
Usuario tiene: 25 ML Coins
Quiere comprar: Segunda Oportunidad (40 coins)
Resultado: ❌ Transacción rechazada "Balance insuficiente"
```

### Regla 2: Multiplicador se Aplica Solo a Earning

**Descripción:** El multiplicador de rango Maya se aplica solo a coins ganados, **no** a gastos.

**Implementación:**
- Función `award_ml_coins()` aplica multiplicador
- Función `spend_ml_coins()` usa monto exacto (sin multiplicador)

**Ejemplo:**
```
K'uk'ulkan (2.00x) gana 100 coins → Recibe 200 coins
K'uk'ulkan gasta en pista (15 coins) → Paga exactamente 15 coins
```

### Regla 3: Transacciones Atómicas

**Descripción:** Cada transacción de ML Coins debe ser atómica (todo o nada).

**Implementación:**
- Uso de `FOR UPDATE` para bloquear fila durante transacción
- Rollback automático si falla cualquier paso
- Registro de transacción solo si update exitoso

### Regla 4: Auditoría Completa

**Descripción:** Todas las transacciones deben quedar registradas permanentemente.

**Implementación:**
- Tabla `ml_coins_transactions` sin DELETE
- Metadata JSONB con detalles (base_amount, rank, multiplier)
- Columnas `balance_before` y `balance_after` para auditoría

### Regla 5: Redondeo hacia Abajo

**Descripción:** Montos con decimales se redondean hacia abajo (FLOOR).

**Implementación:**
```sql
v_final_amount := FLOOR(p_amount * v_multiplier);
```

**Ejemplo:**
```
Base: 33 coins
Multiplicador Nacom: 1.25x
Cálculo: 33 * 1.25 = 41.25
Resultado: FLOOR(41.25) = 41 coins
```

---

## 🎮 Casos de Uso

### Caso de Uso 1: Estudiante Completa Ejercicio

**Actor:** Estudiante (usuario autenticado)

**Precondiciones:**
- Usuario tiene cuenta activa
- Usuario tiene rango Maya asignado
- Ejercicio disponible y no completado previamente

**Flujo Principal:**
1. Usuario resuelve ejercicio correctamente
2. Sistema obtiene rango Maya del usuario
3. Sistema calcula monto base según dificultad del ejercicio
4. Sistema aplica multiplicador de rango
5. Sistema llama `award_ml_coins()`
6. Se actualiza balance en `user_stats`
7. Se registra transacción en `ml_coins_transactions`
8. Frontend muestra notificación: "+20 ML Coins 🪙"

**Postcondiciones:**
- Balance de ML Coins incrementado
- Transacción registrada con tipo `earned_exercise`
- Totales históricos actualizados

### Caso de Uso 2: Estudiante Compra Comodín

**Actor:** Estudiante

**Precondiciones:**
- Usuario tiene balance suficiente de ML Coins
- Comodín disponible para compra

**Flujo Principal:**
1. Usuario hace clic en "Comprar Pistas (15 coins)"
2. Frontend verifica balance >= 15
3. Sistema llama `purchase_comodin(user_id, 'pistas', quantity)`
4. Función SQL:
   - Verifica balance con `FOR UPDATE`
   - Resta 15 ML Coins del balance
   - Incrementa inventario de comodines
   - Registra transacción tipo `spent_powerup`
5. Frontend actualiza UI con nuevo balance e inventario

**Flujo Alternativo:** Balance insuficiente
1. Frontend muestra error: "ML Coins insuficientes. Necesitas 15, tienes 10"
2. Sugerencia: "Completa más ejercicios para ganar ML Coins"

### Caso de Uso 3: Usuario Sube de Rango

**Actor:** Sistema (automático)

**Precondiciones:**
- Usuario alcanzó XP requerido para nuevo rango

**Flujo Principal:**
1. Función `check_rank_promotion()` detecta promoción
2. Sistema actualiza `user_ranks` con nuevo rango
3. Sistema otorga bonus de rango:
   ```sql
   award_ml_coins(user_id, 250, 'earned_rank', 'Promoción a Ah K''in')
   ```
4. Se registra transacción (sin multiplicador - monto fijo)
5. Frontend muestra celebración: "¡Felicidades! +250 ML Coins por alcanzar Ah K'in"

---

## 📊 Métricas y KPIs

### Métricas de Usuario

1. **Balance Actual**
   - Columna: `user_stats.ml_coins`
   - Propósito: Mostrar en UI, validar compras

2. **Total Ganado Histórico**
   - Columna: `user_stats.ml_coins_earned_total`
   - Propósito: Leaderboards, achievements

3. **Total Gastado Histórico**
   - Columna: `user_stats.ml_coins_spent_total`
   - Propósito: Análisis de engagement, patrones de gasto

### Métricas del Sistema

1. **ML Coins en Circulación**
   ```sql
   SELECT SUM(ml_coins) FROM gamification_system.user_stats;
   ```
   - Propósito: Monitorear inflación, salud económica

2. **Earning por Tipo de Transacción**
   ```sql
   SELECT transaction_type, SUM(amount)
   FROM ml_coins_transactions
   WHERE transaction_type LIKE 'earned_%'
   GROUP BY transaction_type;
   ```
   - Propósito: Identificar fuentes principales de coins

3. **Spending por Tipo**
   ```sql
   SELECT transaction_type, SUM(ABS(amount))
   FROM ml_coins_transactions
   WHERE transaction_type LIKE 'spent_%'
   GROUP BY transaction_type;
   ```
   - Propósito: Entender cómo usuarios gastan coins

4. **Ratio Earning/Spending**
   ```sql
   SELECT
     SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
     SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
     (SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)::FLOAT /
      NULLIF(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)) as ratio
   FROM ml_coins_transactions;
   ```
   - **Target:** Ratio ~5-10x (usuarios ganan mucho más de lo que gastan)
   - **Alert:** Si ratio < 3x → usuarios gastando demasiado
   - **Alert:** Si ratio > 20x → coins no tienen valor percibido

---

## 🔒 Seguridad y Prevención de Fraude

### 1. Race Conditions

**Problema:** Dos transacciones simultáneas pueden causar balance incorrecto.

**Solución:** Row-level locking con `FOR UPDATE`
```sql
SELECT ml_coins INTO v_current_balance
FROM gamification_system.user_stats
WHERE user_id = p_user_id
FOR UPDATE;
```

### 2. Balance Negativo

**Problema:** Bugs o exploits podrían permitir balance negativo.

**Solución:**
- CHECK constraint: `ml_coins >= 0`
- Validación en aplicación antes de gastar
- Transacción atómica (rollback si falla)

### 3. Duplicación de Recompensas

**Problema:** Usuario podría reclamar misma recompensa múltiples veces.

**Solución:**
- Idempotency keys en `reference_id`
- Validación de ejercicio ya completado
- Achievement solo se otorga una vez (validación en trigger)

### 4. Admin Abuse

**Problema:** Admin malintencionado otorga coins ilimitados.

**Solución:**
- Audit logging en `ml_coins_transactions`
- Alertas automáticas para transacciones admin > 1000 coins
- Revisión periódica de transacciones tipo `admin_adjustment`

---

## 🧪 Casos de Prueba

### Test 1: Award con Multiplicador Ajaw (1.00x)

**Input:**
```sql
award_ml_coins(
  user_id = 'test-user-1',
  amount = 100,
  transaction_type = 'earned_exercise',
  description = 'Test'
);
```

**Condiciones:**
- Usuario tiene rango Ajaw (1.00x)
- Balance inicial: 0

**Output Esperado:**
- Balance final: 100 ML Coins
- `ml_coins_earned_total`: 100
- Transacción registrada con `amount = 100`, `multiplier = 1.00`

### Test 2: Award con Multiplicador K'uk'ulkan (2.00x)

**Input:**
```sql
award_ml_coins(
  user_id = 'test-user-2',
  amount = 100,
  transaction_type = 'earned_module',
  description = 'Test'
);
```

**Condiciones:**
- Usuario tiene rango K'uk'ulkan (2.00x)
- Balance inicial: 50

**Output Esperado:**
- Balance final: 50 + 200 = 250 ML Coins
- `ml_coins_earned_total`: 200
- Transacción con `amount = 200`, `multiplier = 2.00`
- Metadata JSONB: `{ "base_amount": 100, "rank": "K'uk'ulkan", "multiplier": 2.00, "final_amount": 200 }`

### Test 3: Spend - Balance Suficiente

**Input:**
```sql
spend_ml_coins(
  user_id = 'test-user-3',
  amount = 15,
  transaction_type = 'spent_hint',
  description = 'Compra de pista'
);
```

**Condiciones:**
- Balance inicial: 100

**Output Esperado:**
- Balance final: 85 ML Coins
- `ml_coins_spent_total`: 15
- Transacción con `amount = -15` (negativo)

### Test 4: Spend - Balance Insuficiente

**Input:**
```sql
spend_ml_coins(
  user_id = 'test-user-4',
  amount = 50,
  transaction_type = 'spent_powerup',
  description = 'Compra de comodín'
);
```

**Condiciones:**
- Balance inicial: 20

**Output Esperado:**
- Error: "Insufficient ML Coins balance"
- Balance sin cambios: 20
- No se crea transacción

---

## 📚 Referencias Técnicas

### Base de Datos

- **Tabla principal:** `gamification_system.user_stats`
- **Tabla de transacciones:** `gamification_system.ml_coins_transactions`
- **ENUM:** `gamification_system.transaction_type`
- **Función de award:** `gamification_system.award_ml_coins()`
- **Tests:** `apps/database/ddl/schemas/gamification_system/functions/tests/test_award_ml_coins.sql`

### Backend (NestJS)

- **Service:** `apps/backend/src/modules/gamification/services/ml-coins.service.ts`
- **Entity:** `apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts`
- **Controller:** `apps/backend/src/modules/gamification/controllers/ml-coins.controller.ts`
- **DTOs:** `apps/backend/src/modules/gamification/dto/ml-coins/`

### Frontend (React)

- **Store:** `apps/frontend/src/features/gamification/economy/store/economyStore.ts`
- **Components:** `apps/frontend/src/features/gamification/economy/components/`
- **Hooks:** `apps/frontend/src/features/gamification/economy/hooks/useTransactions.ts`
- **API:** `apps/frontend/src/features/gamification/api/gamificationAPI.ts`

---

## 🔄 Versionado

### Versión 2.0 (2025-11-08) - ACTUAL

**Cambios:**
- ✅ Migrado `transaction_type` de 10 valores legacy a 14 valores oficiales
- ✅ Agregados: `earned_module`, `earned_streak`, `earned_daily`, `earned_bonus`, `spent_powerup`, `spent_retry`, `bonus`, `welcome_bonus`
- ✅ Consolidado multiplicadores de rango Maya (1.00x - 2.00x)
- ✅ Documentación completa creada

### Versión 1.0 (2025-10-27) - LEGACY

**Características originales:**
- 10 tipos de transacciones
- Función `award_ml_coins()` básica sin multiplicadores
- Sin documentación formal

---

## ✅ Criterios de Aceptación

1. ✅ Usuario puede ganar ML Coins por actividades educativas
2. ✅ Multiplicador de rango Maya se aplica correctamente
3. ✅ Usuario puede gastar ML Coins en comodines y ayudas
4. ✅ Balance nunca puede ser negativo
5. ✅ Todas las transacciones quedan registradas
6. ✅ Metadata JSONB contiene información completa
7. ✅ Frontend muestra balance actualizado en tiempo real
8. ✅ Tests SQL pasan al 100%

---

**Creado:** 2025-11-08
**Aprobado por:** Database Team
**Próxima revisión:** 2025-12-01
