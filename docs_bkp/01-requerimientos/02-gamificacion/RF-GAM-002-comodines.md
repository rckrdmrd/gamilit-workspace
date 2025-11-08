# RF-GAM-002: Sistema de Comodines (Power-ups)

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-GAM-002 |
| **Módulo** | 02 - Gamificación |
| **Título** | Sistema de Comodines (Power-ups) |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team |
| **Stakeholders** | Product Owner, UX Team, Backend Team, Frontend Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:55-58`
- **Tipo:** `gamification_system.comodin_type`
- **Valores:** `pistas`, `vision_lectora`, `segunda_oportunidad`

🗄️ **Tablas Relacionadas:**
1. **`gamification_system.comodines_inventory`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/comodines_inventory.sql`
   - **Propósito:** Inventario de comodines disponibles por usuario
   - **Columnas clave:**
     - `user_id` (UUID, FK → auth.users)
     - `comodin_type` (ENUM comodin_type)
     - `quantity` (INTEGER, cantidad disponible)
     - `total_purchased` (INTEGER, histórico de compras)
     - `total_used` (INTEGER, histórico de usos)

2. **`gamification_system.comodin_usage_log`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/comodin_usage_log.sql`
   - **Propósito:** Log de cada uso de comodín
   - **Columnas clave:**
     - `user_id` (UUID, FK → auth.users)
     - `exercise_id` (UUID, FK → educational_content.exercises)
     - `attempt_id` (UUID, FK → progress_tracking.exercise_attempts)
     - `comodin_type` (ENUM comodin_type)
     - `used_at` (TIMESTAMPTZ)

3. **`gamification_system.user_stats`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/user_stats.sql`
   - **Propósito:** Contiene el balance de ML Coins del usuario
   - **Columnas clave:**
     - `ml_coins` (INTEGER, balance actual)

🗄️ **Funciones SQL:**
1. **`purchase_comodin(user_id UUID, comodin_type TEXT)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/purchase_comodin.sql`
   - **Propósito:** Comprar comodín con ML Coins

2. **`use_comodin(user_id UUID, exercise_id UUID, attempt_id UUID, comodin_type TEXT)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/use_comodin.sql`
   - **Propósito:** Usar comodín en un ejercicio
   - **Validaciones:**
     - Verificar que usuario tenga comodín disponible
     - Verificar límites de uso por ejercicio
     - Registrar uso en log

3. **`get_comodin_inventory(user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/get_comodin_inventory.sql`
   - **Propósito:** Obtener inventario completo del usuario

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-GAM-002: Implementación del Sistema de Comodines](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md)

### Documentos Relacionados

- [RF-GAM-001: Sistema de Achievements](./RF-GAM-001-achievements.md) - Recompensas que otorgan ML Coins
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Estados de intentos
- [RF-EDU-001: Mecánicas de Ejercicios](../03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md) - Ejercicios donde se usan
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-2-gamificación)

---

## 📖 Descripción General

### Propósito

El **Sistema de Comodines** (Power-ups) proporciona ayudas estratégicas que los estudiantes pueden comprar con **ML Coins** y usar durante ejercicios difíciles. Este sistema:

- Reduce la frustración en ejercicios complejos
- Crea economía de recursos escasos (ML Coins)
- Fomenta decisiones estratégicas sobre cuándo pedir ayuda
- Equilibra dificultad sin trivializar el aprendizaje

### Contexto

Los estudiantes ganan **ML Coins** al completar ejercicios, desbloquear achievements y mantener rachas. Estos coins pueden gastarse en tres tipos de comodines que ofrecen diferentes niveles de ayuda.

### Alcance

**Incluye:**
- ✅ Sistema de compra de comodines con ML Coins
- ✅ Inventario persistente por usuario
- ✅ Tres tipos de comodines con efectos específicos
- ✅ Restricciones de uso por ejercicio
- ✅ Log completo de uso para análisis
- ✅ Integración con sistema de intentos

**Excluye:**
- ❌ Compra de comodines con dinero real (solo ML Coins)
- ❌ Comodines temporales o por tiempo limitado
- ❌ Trading de comodines entre usuarios
- ❌ Comodines en modo competitivo/PvP

---

## ⚙️ Requerimientos Funcionales

### 1. Tipos de Comodines

#### 1.1. Pistas (Hints) 💡

**Costo:** 10 ML Coins
**Límite:** Máximo 3 por ejercicio
**Efecto:** Revela una pista progresiva sobre cómo resolver el ejercicio

**Comportamiento:**
- Primera pista: Orientación general sobre el enfoque
- Segunda pista: Pista más específica sobre mecánica o regla
- Tercera pista: Casi revela la respuesta, pero no completamente

**Ejemplo de pistas (ejercicio de conjugación):**
```
Pista 1: "Este verbo es irregular en pretérito"
Pista 2: "La raíz cambia de 'e' a 'i' en tercera persona"
Pista 3: "La forma correcta empieza con 'pid...'"
```

**Restricciones:**
- Solo 3 pistas disponibles por ejercicio
- Cada pista cuesta 10 ML Coins
- Las pistas se revelan en orden secuencial
- No se pueden usar pistas en modo examen

#### 1.2. Visión Lectora (Reading Vision) 👁️

**Costo:** 15 ML Coins
**Límite:** 1 por ejercicio
**Efecto:** En ejercicios de texto largo, resalta las oraciones clave relevantes para responder

**Comportamiento:**
- Analiza el texto del ejercicio
- Resalta (highlight) 2-3 oraciones más relevantes
- Funciona en ejercicios de comprensión lectora
- No revela la respuesta directa

**Ejemplo:**
```
Texto original (300 palabras):
"Los mayas desarrollaron un avanzado sistema de escritura...
[Párrafo 2] En matemáticas, inventaron el concepto del cero...
[Párrafo 3] Su calendario era extremadamente preciso...
[Párrafo 4] Las ciudades mayas eran centros ceremoniales..."

Pregunta: "¿Qué aportación matemática hicieron los mayas?"

Con Visión Lectora → Resalta: "En matemáticas, inventaron el concepto del cero..."
```

**Restricciones:**
- Solo 1 uso por ejercicio
- Solo funciona en ejercicios con texto >100 palabras
- No disponible en ejercicios de audio/video (por ahora)

#### 1.3. Segunda Oportunidad (Second Chance) ♻️

**Costo:** 20 ML Coins
**Límite:** 1 por ejercicio
**Efecto:** Permite reintentar el ejercicio sin penalización en XP/streak

**Comportamiento:**
- Borra la respuesta incorrecta
- No cuenta como intento fallido
- Preserva streak actual
- XP sigue siendo el de intento exitoso
- Solo disponible después de fallar

**Restricciones:**
- Solo 1 uso por ejercicio
- Solo se puede usar después del primer intento fallido
- No disponible si ya se completó el ejercicio correctamente
- No funciona en exámenes finales

---

### 2. Sistema de Compra

#### 2.1. Flujo de Compra

```
Usuario en Comodin Shop
        ↓
Selecciona tipo de comodín
        ↓
    ┌───────────────────────────┐
    │ Validar balance ML Coins  │
    └───────────┬───────────────┘
                ↓ Suficientes
    ┌───────────────────────────┐
    │ Deducir costo de ML Coins │
    └───────────┬───────────────┘
                ↓
    ┌───────────────────────────┐
    │ Incrementar inventario    │
    │ - quantity += 1           │
    │ - total_purchased += 1    │
    └───────────┬───────────────┘
                ↓
    ┌───────────────────────────┐
    │ Registrar transacción     │
    │ en audit_logging          │
    └───────────┬───────────────┘
                ↓
        Mostrar confirmación
```

#### 2.2. Validaciones de Compra

| Validación | Condición | Error |
|------------|-----------|-------|
| **Balance suficiente** | `user_stats.ml_coins >= comodin_cost` | "Insufficient ML Coins" |
| **Inventario no excede límite** | `quantity < 99` | "Max inventory reached" |
| **Usuario activo** | `profile.status = 'active'` | "Account not active" |

#### 2.3. Costos por Tipo

| Comodín | Costo ML Coins | Value/Cost Ratio |
|---------|----------------|------------------|
| Pistas | 10 | 🟢 Alto (ayuda barata) |
| Visión Lectora | 15 | 🟡 Medio (ayuda específica) |
| Segunda Oportunidad | 20 | 🔴 Bajo (garantía de éxito) |

---

### 3. Sistema de Uso

#### 3.1. Flujo de Uso en Ejercicio

```
Usuario intenta ejercicio
        ↓
    ¿Ejercicio difícil?
        ↓ Sí
Usuario presiona botón "Usar Comodín"
        ↓
    ┌───────────────────────────────┐
    │ Mostrar inventario disponible │
    └───────────┬───────────────────┘
                ↓
Usuario selecciona tipo
        ↓
    ┌───────────────────────────────┐
    │ Validar disponibilidad        │
    │ - quantity > 0                │
    │ - Límite no excedido          │
    └───────────┬───────────────────┘
                ↓ Válido
    ┌───────────────────────────────┐
    │ Aplicar efecto del comodín    │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ Actualizar inventario         │
    │ - quantity -= 1               │
    │ - total_used += 1             │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ Registrar en usage_log        │
    └───────────────────────────────┘
```

#### 3.2. Validaciones de Uso

| Validación | Condición | Error |
|------------|-----------|-------|
| **Comodín disponible** | `inventory.quantity > 0` | "No power-ups available" |
| **Límite de pistas** | `pistas_usadas_en_ejercicio < 3` | "Max hints used" |
| **Límite de visión** | `vision_usada_en_ejercicio = 0` | "Already used Reading Vision" |
| **Segunda oportunidad válida** | `intento_fallido = true AND segunda_usada = false` | "Cannot use Second Chance" |
| **No en modo examen** | `exercise.is_exam = false` | "Power-ups not allowed in exams" |

#### 3.3. Restricciones por Ejercicio

```sql
-- Tabla para tracking de uso por ejercicio
CREATE TABLE gamification_system.comodin_usage_tracking (
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    attempt_id UUID NOT NULL,
    pistas_used INTEGER DEFAULT 0,
    vision_lectora_used BOOLEAN DEFAULT false,
    segunda_oportunidad_used BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, exercise_id, attempt_id)
);
```

---

### 4. Inventario de Comodines

#### 4.1. Estructura de Inventario

**Tabla: `gamification_system.comodines_inventory`**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `user_id` | UUID | Usuario propietario |
| `comodin_type` | ENUM | Tipo de comodín |
| `quantity` | INTEGER | Cantidad disponible actual |
| `total_purchased` | INTEGER | Total comprado históricamente |
| `total_used` | INTEGER | Total usado históricamente |
| `last_purchased_at` | TIMESTAMPTZ | Última compra |
| `last_used_at` | TIMESTAMPTZ | Último uso |

#### 4.2. Límites de Inventario

| Límite | Valor | Razón |
|--------|-------|-------|
| **Max por tipo** | 99 | Evitar acumulación excesiva |
| **Total slots** | 3 tipos | Pistas, Visión, Segunda Oportunidad |

---

### 5. Log de Uso

#### 5.1. Registro Completo

Cada uso de comodín se registra en `gamification_system.comodin_usage_log`:

| Campo | Propósito | Análisis |
|-------|-----------|----------|
| `user_id` | Quién usó | Patrones de uso por estudiante |
| `exercise_id` | Dónde usó | Ejercicios más difíciles |
| `attempt_id` | En qué intento | Timing de uso |
| `comodin_type` | Qué usó | Tipo más popular |
| `was_successful` | Si funcionó | Efectividad |
| `used_at` | Cuándo | Hora del día, día de semana |

#### 5.2. Métricas de Análisis

**Queries comunes:**

```sql
-- Ejercicios más difíciles (más comodines usados)
SELECT exercise_id, COUNT(*) as comodin_usage
FROM gamification_system.comodin_usage_log
GROUP BY exercise_id
ORDER BY comodin_usage DESC
LIMIT 10;

-- Tipo de comodín más usado
SELECT comodin_type, COUNT(*) as usage_count
FROM gamification_system.comodin_usage_log
GROUP BY comodin_type;

-- Efectividad de comodines
SELECT
    comodin_type,
    AVG(CASE WHEN was_successful THEN 1 ELSE 0 END) as success_rate
FROM gamification_system.comodin_usage_log
GROUP BY comodin_type;
```

---

## 💼 Casos de Uso

### CU-GAM-002-001: Comprar Pistas en la Tienda

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado
- Balance de ML Coins >= 10

**Flujo Principal:**

1. Usuario navega a "Comodin Shop" desde el menú principal
2. Sistema muestra:
   - Balance actual de ML Coins
   - Inventario actual de comodines
   - Precio de cada tipo de comodín
3. Usuario selecciona "Pistas" y cantidad (ej: 3 unidades)
4. Sistema calcula costo total (30 ML Coins)
5. Usuario confirma compra
6. Sistema valida balance suficiente
7. Sistema deduce 30 ML Coins
8. Sistema añade 3 pistas al inventario
9. Sistema muestra confirmación: "Compraste 3 Pistas. Balance: 70 ML Coins"

**Flujo Alternativo 6a: Balance insuficiente**
- Sistema muestra error: "Necesitas 30 ML Coins. Balance actual: 25"
- Sistema sugiere formas de ganar más coins

**Postcondiciones:**
- `user_stats.ml_coins` -= 30
- `comodines_inventory.quantity[pistas]` += 3
- `comodines_inventory.total_purchased[pistas]` += 3
- Transacción registrada en `audit_logging`

---

### CU-GAM-002-002: Usar Pista en Ejercicio Difícil

**Actor:** Estudiante
**Precondiciones:**
- Usuario en un ejercicio activo
- Inventario tiene al menos 1 pista
- No ha usado 3 pistas en este ejercicio

**Flujo Principal:**

1. Usuario lee ejercicio y no sabe cómo resolverlo
2. Usuario presiona botón "💡 Usar Pista" (muestra: "Tienes 5 pistas")
3. Sistema valida disponibilidad
4. Sistema muestra confirmación: "¿Usar 1 pista? Te quedarán 4"
5. Usuario confirma
6. Sistema:
   - Deduce 1 pista del inventario
   - Registra uso en `comodin_usage_log`
   - Incrementa contador de pistas en este ejercicio
7. Sistema muestra la pista apropiada (pista #1, #2 o #3 según cuántas se usaron)
8. Usuario lee pista y continúa intentando resolver

**Flujo Alternativo 3a: Límite de pistas alcanzado**
- Sistema muestra: "Ya usaste las 3 pistas disponibles en este ejercicio"
- Botón "Usar Pista" se deshabilita

**Flujo Alternativo 3b: Sin pistas en inventario**
- Sistema muestra: "No tienes pistas. Compra más en la tienda"
- Muestra link a Comodin Shop

**Postcondiciones:**
- `comodines_inventory.quantity[pistas]` -= 1
- `comodines_inventory.total_used[pistas]` += 1
- `comodin_usage_log` contiene registro de uso
- `comodin_usage_tracking.pistas_used` += 1

---

### CU-GAM-002-003: Usar Visión Lectora en Texto Largo

**Actor:** Estudiante
**Precondiciones:**
- Usuario en ejercicio con texto >100 palabras
- Inventario tiene al menos 1 Visión Lectora
- No ha usado Visión Lectora en este ejercicio

**Flujo Principal:**

1. Usuario lee texto largo de comprensión (300 palabras)
2. Usuario presiona botón "👁️ Visión Lectora" (muestra: "Tienes 2")
3. Sistema valida:
   - Ejercicio es elegible (texto >100 palabras)
   - No se usó previamente en este ejercicio
4. Sistema muestra confirmación: "¿Usar Visión Lectora? Te quedarán 1"
5. Usuario confirma
6. Sistema analiza el texto y pregunta
7. Sistema resalta (highlight amarillo) 2-3 oraciones clave
8. Sistema deduce 1 Visión Lectora del inventario
9. Sistema registra uso
10. Usuario lee oraciones resaltadas y responde

**Flujo Alternativo 3a: Ejercicio no elegible**
- Sistema muestra: "Visión Lectora solo funciona en ejercicios con texto largo"

**Flujo Alternativo 3b: Ya usado en este ejercicio**
- Sistema muestra: "Ya usaste Visión Lectora en este ejercicio"
- Botón se deshabilita

**Postcondiciones:**
- `comodines_inventory.quantity[vision_lectora]` -= 1
- `comodin_usage_tracking.vision_lectora_used` = true
- Oraciones resaltadas visualmente en UI

---

### CU-GAM-002-004: Usar Segunda Oportunidad después de Fallar

**Actor:** Estudiante
**Precondiciones:**
- Usuario falló un intento de ejercicio
- Inventario tiene al menos 1 Segunda Oportunidad
- No ha usado Segunda Oportunidad en este ejercicio
- No es un examen final

**Flujo Principal:**

1. Usuario responde ejercicio incorrectamente
2. Sistema muestra: "❌ Respuesta incorrecta"
3. Sistema detecta Segunda Oportunidad disponible
4. Sistema muestra modal: "¿Quieres usar Segunda Oportunidad? (20 ML Coins de valor)"
   - "Podrás reintentar sin perder tu racha"
   - "Esta respuesta incorrecta no contará"
5. Usuario acepta
6. Sistema:
   - Deduce 1 Segunda Oportunidad del inventario
   - Marca intento anterior como "no contabilizado"
   - No rompe streak actual
   - Limpia respuesta incorrecta
7. Usuario reintenta el ejercicio
8. Si responde correctamente:
   - Gana XP completo (sin penalización)
   - Mantiene streak
   - Ejercicio se marca como completado correctamente

**Flujo Alternativo 5a: Usuario rechaza**
- Sistema registra intento fallido normalmente
- Streak puede romperse
- XP no se otorga

**Flujo Alternativo 6a: Ejercicio es examen**
- Sistema no muestra opción de Segunda Oportunidad
- Intento fallido cuenta normalmente

**Postcondiciones:**
- `comodines_inventory.quantity[segunda_oportunidad]` -= 1
- `exercise_attempts` anterior marcado como `discounted = true`
- Nuevo intento se crea con flag `is_second_chance = true`
- Streak preservado

---

### CU-GAM-002-005: Ver Inventario de Comodines

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado

**Flujo Principal:**

1. Usuario navega a "Mi Inventario" o abre panel de comodines
2. Sistema muestra tarjetas por cada tipo:

```
┌────────────────────────────┐
│  💡 Pistas                 │
│  Disponibles: 5            │
│  Usadas: 23                │
│  Compradas: 28             │
│  Última compra: hace 2h    │
│  [Comprar más]             │
└────────────────────────────┘

┌────────────────────────────┐
│  👁️ Visión Lectora        │
│  Disponibles: 2            │
│  Usadas: 8                 │
│  Compradas: 10             │
│  Última compra: hace 1 día │
│  [Comprar más]             │
└────────────────────────────┘

┌────────────────────────────┐
│  ♻️ Segunda Oportunidad   │
│  Disponibles: 0            │
│  Usadas: 3                 │
│  Compradas: 3              │
│  Última compra: hace 3 días│
│  [Comprar más]             │
└────────────────────────────┘
```

3. Usuario puede hacer click en "Comprar más" para ir a shop
4. Usuario puede ver estadísticas de uso

**Postcondiciones:**
- Ninguna (solo lectura)

---

## 🔒 Consideraciones de Seguridad

### 1. Prevención de Explotación

| Riesgo | Mitigación |
|--------|------------|
| **Duplicación de comodines** | Transacciones atómicas con locks |
| **Uso sin pagar** | Validación de inventario antes de aplicar efecto |
| **Bypass de límites** | Validaciones en backend + trigger en DB |
| **Rollback fraudulento** | Inmutable log de uso |

### 2. Validaciones Backend

```typescript
// ❌ NUNCA confiar en frontend
// ✅ SIEMPRE validar en backend

async useComodin(userId: string, exerciseId: string, type: ComodinType) {
  // 1. Validar inventario
  const inventory = await this.getInventory(userId, type);
  if (inventory.quantity <= 0) {
    throw new ForbiddenException('No power-ups available');
  }

  // 2. Validar límites por ejercicio
  const usage = await this.getUsageInExercise(userId, exerciseId);
  if (type === 'pistas' && usage.pistas_used >= 3) {
    throw new ForbiddenException('Max hints reached');
  }

  // 3. Validar contexto (no en exámenes)
  const exercise = await this.exerciseService.findOne(exerciseId);
  if (exercise.is_exam) {
    throw new ForbiddenException('Power-ups not allowed in exams');
  }

  // 4. Ejecutar en transacción
  return await this.db.transaction(async (trx) => {
    await this.decrementInventory(userId, type, trx);
    await this.logUsage(userId, exerciseId, type, trx);
    await this.applyEffect(userId, exerciseId, type, trx);
  });
}
```

### 3. Rate Limiting

| Acción | Límite | Ventana | Razón |
|--------|--------|---------|-------|
| **Compra** | 50 comodines | 1 hora | Prevenir spam de compras |
| **Uso** | 10 comodines | 5 minutos | Detectar bots |

### 4. Auditoría

Todas las transacciones de ML Coins se registran en `audit_logging.audit_logs`:

```sql
INSERT INTO audit_logging.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    severity
) VALUES (
    user_id,
    'comodin_purchased',
    'comodin',
    comodin_type,
    jsonb_build_object(
        'type', comodin_type,
        'cost', cost,
        'balance_before', balance_before,
        'balance_after', balance_after
    ),
    'info'
);
```

---

## ✅ Criterios de Aceptación

### CA-GAM-002-001: Compra de Comodines

- [ ] Usuario puede comprar cada tipo de comodín desde shop
- [ ] Costo se deduce correctamente de ML Coins
- [ ] Inventario se actualiza instantáneamente
- [ ] Compra falla si balance insuficiente
- [ ] Compra falla si inventario lleno (99 unidades)
- [ ] Transacción se registra en audit log

### CA-GAM-002-002: Uso de Pistas

- [ ] Usuario puede usar hasta 3 pistas por ejercicio
- [ ] Cada pista muestra contenido diferente y progresivo
- [ ] Pistas se deducen del inventario
- [ ] Botón se deshabilita después de 3 pistas
- [ ] Pistas NO disponibles en exámenes
- [ ] Uso se registra en `comodin_usage_log`

### CA-GAM-002-003: Uso de Visión Lectora

- [ ] Solo funciona en ejercicios con texto >100 palabras
- [ ] Resalta 2-3 oraciones relevantes
- [ ] Máximo 1 uso por ejercicio
- [ ] Se deduce del inventario
- [ ] Botón se deshabilita después de usar

### CA-GAM-002-004: Uso de Segunda Oportunidad

- [ ] Solo se ofrece después de intento fallido
- [ ] Borra respuesta incorrecta
- [ ] NO rompe streak
- [ ] XP se otorga completo si acierta después
- [ ] Máximo 1 uso por ejercicio
- [ ] NO disponible en exámenes finales

### CA-GAM-002-005: Inventario

- [ ] Usuario puede ver inventario completo
- [ ] Muestra cantidad disponible, usadas, compradas
- [ ] Inventario sincroniza en tiempo real
- [ ] Estadísticas de uso son precisas

### CA-GAM-002-006: Restricciones

- [ ] Límites por ejercicio se respetan estrictamente
- [ ] Validaciones backend previenen bypass
- [ ] Comodines no funcionan en modo examen
- [ ] Log de uso es inmutable

---

## 🧪 Testing

### Test Case 1: Compra Exitosa de Comodín

```typescript
test('User can purchase power-up with sufficient ML Coins', async () => {
  // Arrange
  const user = await createUser({ ml_coins: 50 });
  const initialInventory = await getComodinInventory(user.id);

  // Act
  const result = await comodinService.purchase(user.id, 'pistas', 3);

  // Assert
  expect(result.success).toBe(true);

  const updatedUser = await getUser(user.id);
  expect(updatedUser.ml_coins).toBe(20); // 50 - (10 * 3)

  const updatedInventory = await getComodinInventory(user.id);
  expect(updatedInventory.pistas.quantity).toBe(
    initialInventory.pistas.quantity + 3
  );
  expect(updatedInventory.pistas.total_purchased).toBe(
    initialInventory.pistas.total_purchased + 3
  );
});
```

### Test Case 2: Compra Falla con Balance Insuficiente

```typescript
test('Purchase fails with insufficient ML Coins', async () => {
  // Arrange
  const user = await createUser({ ml_coins: 5 }); // Solo 5 coins

  // Act & Assert
  await expect(
    comodinService.purchase(user.id, 'pistas', 1) // Cuesta 10
  ).rejects.toThrow('Insufficient ML Coins');

  // Verificar que nada cambió
  const user2 = await getUser(user.id);
  expect(user2.ml_coins).toBe(5); // Sin cambios
});
```

### Test Case 3: Uso de Pista en Ejercicio

```typescript
test('User can use hint in exercise', async () => {
  // Arrange
  const user = await createUser();
  await giveComodin(user.id, 'pistas', 5);
  const exercise = await createExercise();
  const attempt = await startExerciseAttempt(user.id, exercise.id);

  // Act
  const result = await comodinService.use(
    user.id,
    exercise.id,
    attempt.id,
    'pistas'
  );

  // Assert
  expect(result.hint).toBeDefined();
  expect(result.hint_number).toBe(1); // Primera pista

  const inventory = await getComodinInventory(user.id);
  expect(inventory.pistas.quantity).toBe(4); // 5 - 1
  expect(inventory.pistas.total_used).toBe(1);

  const log = await getComodinUsageLog(user.id, exercise.id);
  expect(log).toHaveLength(1);
  expect(log[0].comodin_type).toBe('pistas');
});
```

### Test Case 4: Límite de 3 Pistas por Ejercicio

```typescript
test('Cannot use more than 3 hints per exercise', async () => {
  // Arrange
  const user = await createUser();
  await giveComodin(user.id, 'pistas', 10); // 10 pistas disponibles
  const exercise = await createExercise();
  const attempt = await startExerciseAttempt(user.id, exercise.id);

  // Act - Usar 3 pistas
  await comodinService.use(user.id, exercise.id, attempt.id, 'pistas');
  await comodinService.use(user.id, exercise.id, attempt.id, 'pistas');
  await comodinService.use(user.id, exercise.id, attempt.id, 'pistas');

  // Assert - 4ta pista falla
  await expect(
    comodinService.use(user.id, exercise.id, attempt.id, 'pistas')
  ).rejects.toThrow('Max hints reached for this exercise');

  // Verificar que se usaron solo 3
  const inventory = await getComodinInventory(user.id);
  expect(inventory.pistas.quantity).toBe(7); // 10 - 3
});
```

### Test Case 5: Segunda Oportunidad Preserva Streak

```typescript
test('Second Chance preserves user streak after failed attempt', async () => {
  // Arrange
  const user = await createUser({ current_streak: 7 }); // Racha de 7 días
  await giveComodin(user.id, 'segunda_oportunidad', 1);
  const exercise = await createExercise();
  const attempt = await startExerciseAttempt(user.id, exercise.id);

  // Act - Fallar intento
  await submitAnswer(attempt.id, 'wrong_answer');

  // Usuario usa Segunda Oportunidad
  await comodinService.use(
    user.id,
    exercise.id,
    attempt.id,
    'segunda_oportunidad'
  );

  // Usuario reintenta y acierta
  const attempt2 = await startExerciseAttempt(user.id, exercise.id);
  await submitAnswer(attempt2.id, 'correct_answer');

  // Assert
  const updatedUser = await getUser(user.id);
  expect(updatedUser.current_streak).toBe(7); // Streak preservado

  const exerciseProgress = await getExerciseProgress(user.id, exercise.id);
  expect(exerciseProgress.status).toBe('completed');
  expect(exerciseProgress.xp_earned).toBeGreaterThan(0); // XP completo
});
```

### Test Case 6: Comodines No Funcionan en Exámenes

```typescript
test('Power-ups cannot be used in exam mode', async () => {
  // Arrange
  const user = await createUser();
  await giveComodin(user.id, 'pistas', 5);
  const examExercise = await createExercise({ is_exam: true }); // Examen
  const attempt = await startExerciseAttempt(user.id, examExercise.id);

  // Act & Assert
  await expect(
    comodinService.use(user.id, examExercise.id, attempt.id, 'pistas')
  ).rejects.toThrow('Power-ups not allowed in exam mode');

  // Verificar que inventario no cambió
  const inventory = await getComodinInventory(user.id);
  expect(inventory.pistas.quantity).toBe(5); // Sin cambios
});
```

---

## 📊 Métricas y Análisis

### KPIs a Monitorear

| Métrica | Cálculo | Objetivo |
|---------|---------|----------|
| **Tasa de uso de comodines** | `comodines_usados / ejercicios_intentados` | 20-30% |
| **Tipo más usado** | `COUNT(*) GROUP BY comodin_type` | Pistas (50%), Visión (30%), Segunda (20%) |
| **Efectividad** | `(aciertos después de comodín) / (total usos)` | >70% |
| **Ejercicios más difíciles** | Ejercicios con más uso de comodines | Identificar para ajustar dificultad |
| **Balance ML Coins** | `ml_coins_ganados - ml_coins_gastados` | Superávit promedio de 50 coins |

### Dashboards para Product Team

**Dashboard 1: Uso de Comodines por Tipo**
```sql
SELECT
    comodin_type,
    COUNT(*) as total_uses,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(CASE WHEN was_successful THEN 1 ELSE 0 END) as success_rate
FROM gamification_system.comodin_usage_log
WHERE used_at >= NOW() - INTERVAL '30 days'
GROUP BY comodin_type
ORDER BY total_uses DESC;
```

**Dashboard 2: Ejercicios que Requieren Más Ayuda**
```sql
SELECT
    e.title,
    e.difficulty,
    COUNT(cul.id) as comodin_usage_count,
    AVG(ea.score) as avg_score
FROM educational_content.exercises e
LEFT JOIN gamification_system.comodin_usage_log cul ON e.id = cul.exercise_id
LEFT JOIN progress_tracking.exercise_attempts ea ON e.id = ea.exercise_id
WHERE cul.used_at >= NOW() - INTERVAL '30 days'
GROUP BY e.id, e.title, e.difficulty
HAVING COUNT(cul.id) > 10
ORDER BY comodin_usage_count DESC
LIMIT 20;
```

---

## 🔗 Referencias Adicionales

### Documentación Relacionada

- [RF-GAM-001: Sistema de Achievements](./RF-GAM-001-achievements.md) - Fuente de ML Coins
- [RF-GAM-003: Sistema de Rangos Maya](./RF-GAM-003-rangos-maya.md) - Desbloqueables con XP
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Estados de intentos
- [RF-EDU-001: Mecánicas de Ejercicios](../03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md) - Ejercicios donde se aplican

### ADRs

- [ADR-008: Economía de ML Coins](../../02-especificaciones-tecnicas/adr/ADR-008-economia-ml-coins.md) - Decisiones de precios
- [ADR-009: Límites de Comodines por Ejercicio](../../02-especificaciones-tecnicas/adr/ADR-009-limites-comodines.md) - Por qué 3 pistas, 1 visión, 1 segunda

### Documentos de Diseño UX

- Wireframes: Comodin Shop
- Wireframes: Botones de comodines en ejercicios
- Componente: ComodinInventory (Figma)

### Referencias Externas

- [Duolingo: Power-ups](https://blog.duolingo.com/learning-power-ups/) - Inspiración
- [Gamification Design Patterns](https://gamification.wiki) - Teoría

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md`
**Propósito:** Requerimientos funcionales del sistema de comodines (power-ups)
**Audiencia:** Product Owner, Developers, QA Team
