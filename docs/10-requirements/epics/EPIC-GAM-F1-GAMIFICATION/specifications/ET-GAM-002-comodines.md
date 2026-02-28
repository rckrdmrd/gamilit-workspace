---
titulo: "ET-GAM-002: Implementación del Sistema de Comodines"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-002: Implementación del Sistema de Comodines

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-002 |
| **Módulo** | 02 - Gamificación |
| **Título** | Implementación del Sistema de Comodines (Power-ups) |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 2.3.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-28 |
| **Sistema Actual** | [docs/sistema-recompensas/](../../../_archived/sistema-recompensas/) v2.3.0 [ARCHIVED] |
| **Autor** | Database Team |
| **Reviewers** | Backend Lead, Frontend Lead, QA Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-GAM-002: Sistema de Comodines (Power-ups)](../requirements/RF-GAM-002-comodines.md)

### Implementación DDL

🗄️ **ENUM:**
- `gamification_system.comodin_type` - `apps/database/ddl/00-prerequisites.sql:55-58`

🗄️ **Tablas:**
- `gamification_system.comodines_inventory` - Inventario por usuario
- `gamification_system.comodin_usage_log` - Log de usos
- `gamification_system.comodin_usage_tracking` - Tracking de límites por ejercicio

🗄️ **Funciones:**
- `purchase_comodin()` - Comprar comodín con ML Coins
- `use_comodin()` - Usar comodín en ejercicio
- `get_comodin_inventory()` - Obtener inventario completo

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌────────────────────────────────────────────────────┐
│                 FRONTEND (React)                   │
│  - ComodinShop (tienda)                            │
│  - ComodinButton (botones en ejercicio)           │
│  - ComodinInventory (inventario del usuario)      │
│  - HintDisplay (mostrar pistas)                   │
└─────────────────┬──────────────────────────────────┘
                  │ REST API
┌─────────────────▼──────────────────────────────────┐
│              BACKEND (NestJS)                      │
│  - ComodinService                                  │
│    · purchaseComodin()                             │
│    · useComodin()                                  │
│    · getInventory()                                │
│  - ComodinController                               │
│  - DTOs: PurchaseComodinDto, UseComodinDto        │
└─────────────────┬──────────────────────────────────┘
                  │ SQL Queries + Transactions
┌─────────────────▼──────────────────────────────────┐
│            DATABASE (PostgreSQL)                   │
│  - comodines_inventory (inventario)                │
│  - comodin_usage_log (historial)                   │
│  - comodin_usage_tracking (límites por ejercicio)  │
│  - purchase_comodin() (transacción atómica)        │
│  - use_comodin() (validaciones + logging)          │
└────────────────────────────────────────────────────┘
```

### Flujo de Compra

```
Usuario en ComodinShop
        ↓
Selecciona tipo (pistas, visión, segunda)
        ↓
Click "Comprar"
        ↓
Frontend → POST /comodines/purchase
        ↓
    ┌────────────────────────────────────┐
    │ ComodinService.purchaseComodin()  │
    │ - Validar balance ML Coins         │
    │ - Llamar purchase_comodin()        │
    └────────────┬───────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ purchase_comodin() SQL             │
    │ BEGIN TRANSACTION                  │
    │   - Verificar balance              │
    │   - Deducir ML Coins               │
    │   - Incrementar inventario         │
    │   - Registrar en audit_log         │
    │ COMMIT                             │
    └────────────┬───────────────────────┘
                 ↓
Frontend muestra confirmación
+ Actualiza inventario UI
```

### Flujo de Uso en Ejercicio

```
Usuario intenta ejercicio
        ↓
Click "Usar Pista"
        ↓
Frontend → POST /comodines/use
        ↓
    ┌────────────────────────────────────┐
    │ ComodinService.useComodin()        │
    │ - Validar inventario               │
    │ - Validar límites por ejercicio    │
    │ - Llamar use_comodin()             │
    │ - Generar contenido (ej: pista #1) │
    └────────────┬───────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ use_comodin() SQL                  │
    │ BEGIN TRANSACTION                  │
    │   - Verificar disponibilidad       │
    │   - Decrementar inventario         │
    │   - Registrar uso en log           │
    │   - Actualizar tracking            │
    │ COMMIT                             │
    └────────────┬───────────────────────┘
                 ↓
Frontend muestra efecto del comodín
(pista, highlight, reset attempt)
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: comodin_type

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:55-58`

```sql
-- Comodin Types (Power-ups)
CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',               -- Hints (hasta 3 por ejercicio)
    'vision_lectora',       -- Reading Vision (1 por ejercicio)
    'segunda_oportunidad'   -- Second Chance (1 por ejercicio)
);

COMMENT ON TYPE gamification_system.comodin_type IS '
Tipos de comodines (power-ups):
- pistas: Revelan pistas progresivas (máx 3 por ejercicio)
- vision_lectora: Resaltan oraciones clave en textos largos (1 por ejercicio)
- segunda_oportunidad: Reintentar sin penalización (1 por ejercicio)
';
```

### 2. Tabla: comodines_inventory

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/comodines_inventory.sql`

```sql
CREATE TABLE IF NOT EXISTS gamification_system.comodines_inventory (
    -- No hay PK individual, la combinación user_id + comodin_type es única
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comodin_type gamification_system.comodin_type NOT NULL,

    -- Cantidades
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    total_purchased INTEGER NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
    total_used INTEGER NOT NULL DEFAULT 0 CHECK (total_used >= 0),

    -- Timestamps
    last_purchased_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint
    PRIMARY KEY (user_id, comodin_type)
);

-- Índices
CREATE INDEX idx_comodines_inventory_user ON gamification_system.comodines_inventory(user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER trg_comodines_inventory_updated_at
    BEFORE UPDATE ON gamification_system.comodines_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios
COMMENT ON TABLE gamification_system.comodines_inventory IS 'Inventario de comodines disponibles por usuario';
COMMENT ON COLUMN gamification_system.comodines_inventory.quantity IS 'Cantidad disponible actual';
COMMENT ON COLUMN gamification_system.comodines_inventory.total_purchased IS 'Total comprado históricamente';
COMMENT ON COLUMN gamification_system.comodines_inventory.total_used IS 'Total usado históricamente';

-- Constraint adicional: máximo 99 unidades por tipo
ALTER TABLE gamification_system.comodines_inventory
    ADD CONSTRAINT chk_max_inventory CHECK (quantity <= 99);
```

### 3. Tabla: comodin_usage_log

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/comodin_usage_log.sql`

```sql
CREATE TABLE IF NOT EXISTS gamification_system.comodin_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES progress_tracking.exercise_attempts(id) ON DELETE SET NULL,

    -- Tipo de comodín usado
    comodin_type gamification_system.comodin_type NOT NULL,

    -- Contexto
    hint_number INTEGER, -- Si es pista, cuál número (1, 2, 3)
    was_successful BOOLEAN, -- Si el intento fue exitoso después de usar comodín
    exercise_difficulty VARCHAR(20), -- Dificultad del ejercicio (para análisis)

    -- Timestamp
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_comodin_usage_log_user ON gamification_system.comodin_usage_log(user_id);
CREATE INDEX idx_comodin_usage_log_exercise ON gamification_system.comodin_usage_log(exercise_id);
CREATE INDEX idx_comodin_usage_log_used_at ON gamification_system.comodin_usage_log(used_at DESC);
CREATE INDEX idx_comodin_usage_log_type ON gamification_system.comodin_usage_log(comodin_type);

-- Comentarios
COMMENT ON TABLE gamification_system.comodin_usage_log IS 'Log inmutable de cada uso de comodín';
COMMENT ON COLUMN gamification_system.comodin_usage_log.hint_number IS 'Para pistas: 1, 2 o 3';
COMMENT ON COLUMN gamification_system.comodin_usage_log.was_successful IS 'Si el ejercicio se completó exitosamente después de usar comodín';
```

### 4. Tabla: comodin_usage_tracking

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/comodin_usage_tracking.sql`

```sql
CREATE TABLE IF NOT EXISTS gamification_system.comodin_usage_tracking (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
    attempt_id UUID NOT NULL REFERENCES progress_tracking.exercise_attempts(id) ON DELETE CASCADE,

    -- Contadores por tipo
    pistas_used INTEGER NOT NULL DEFAULT 0 CHECK (pistas_used >= 0 AND pistas_used <= 3),
    vision_lectora_used BOOLEAN NOT NULL DEFAULT false,
    segunda_oportunidad_used BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- PK compuesta
    PRIMARY KEY (user_id, exercise_id, attempt_id)
);

-- Índices
CREATE INDEX idx_comodin_tracking_user_exercise ON gamification_system.comodin_usage_tracking(user_id, exercise_id);

-- Comentarios
COMMENT ON TABLE gamification_system.comodin_usage_tracking IS 'Tracking de límites de comodines por ejercicio y attempt';
COMMENT ON COLUMN gamification_system.comodin_usage_tracking.pistas_used IS 'Contador de pistas usadas (máx 3)';
```

### 5. Función: purchase_comodin

**Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/purchase_comodin.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.purchase_comodin(
    p_user_id UUID,
    p_comodin_type gamification_system.comodin_type,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cost_per_unit INTEGER;
    v_total_cost INTEGER;
    v_current_balance INTEGER;
    v_current_quantity INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Determinar costo por unidad
    CASE p_comodin_type
        WHEN 'pistas' THEN v_cost_per_unit := 15;
        WHEN 'vision_lectora' THEN v_cost_per_unit := 25;
        WHEN 'segunda_oportunidad' THEN v_cost_per_unit := 40;
        ELSE RAISE EXCEPTION 'Invalid comodin type: %', p_comodin_type;
    END CASE;

    v_total_cost := v_cost_per_unit * p_quantity;

    -- 2. Obtener balance actual
    SELECT ml_coins INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User stats not found for user %', p_user_id;
    END IF;

    -- 3. Validar balance suficiente
    IF v_current_balance < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient ML Coins. Required: %, Available: %', v_total_cost, v_current_balance;
    END IF;

    -- 4. Obtener cantidad actual en inventario
    SELECT quantity INTO v_current_quantity
    FROM gamification_system.comodines_inventory
    WHERE user_id = p_user_id AND comodin_type = p_comodin_type;

    -- Si no existe registro, crear uno
    IF v_current_quantity IS NULL THEN
        INSERT INTO gamification_system.comodines_inventory (
            user_id,
            comodin_type,
            quantity,
            total_purchased,
            last_purchased_at
        ) VALUES (
            p_user_id,
            p_comodin_type,
            p_quantity,
            p_quantity,
            NOW()
        );
        v_current_quantity := 0;
    ELSE
        -- 5. Validar que no exceda límite de inventario (99)
        IF v_current_quantity + p_quantity > 99 THEN
            RAISE EXCEPTION 'Max inventory limit reached. Current: %, Trying to add: %', v_current_quantity, p_quantity;
        END IF;

        -- 6. Actualizar inventario
        UPDATE gamification_system.comodines_inventory
        SET
            quantity = quantity + p_quantity,
            total_purchased = total_purchased + p_quantity,
            last_purchased_at = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id AND comodin_type = p_comodin_type;
    END IF;

    -- 7. Deducir ML Coins
    UPDATE gamification_system.user_stats
    SET
        ml_coins = ml_coins - v_total_cost,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 8. Registrar en audit log
    INSERT INTO audit_logging.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        severity
    ) VALUES (
        p_user_id,
        'comodin_purchased',
        'comodin',
        p_comodin_type::TEXT,
        jsonb_build_object(
            'quantity', p_quantity,
            'cost_per_unit', v_cost_per_unit,
            'total_cost', v_total_cost,
            'balance_before', v_current_balance,
            'balance_after', v_current_balance - v_total_cost
        ),
        'info'
    );

    -- 9. Construir resultado
    v_result := jsonb_build_object(
        'success', true,
        'comodin_type', p_comodin_type,
        'quantity_purchased', p_quantity,
        'total_cost', v_total_cost,
        'new_balance', v_current_balance - v_total_cost,
        'new_quantity', v_current_quantity + p_quantity
    );

    RAISE NOTICE 'User % purchased % x %', p_user_id, p_quantity, p_comodin_type;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION gamification_system.purchase_comodin IS 'Comprar comodín con ML Coins (transacción atómica)';
```

### 6. Función: use_comodin

**Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/use_comodin.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.use_comodin(
    p_user_id UUID,
    p_exercise_id UUID,
    p_attempt_id UUID,
    p_comodin_type gamification_system.comodin_type
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_quantity INTEGER;
    v_pistas_used INTEGER := 0;
    v_vision_used BOOLEAN := false;
    v_segunda_used BOOLEAN := false;
    v_hint_number INTEGER := NULL;
    v_exercise_difficulty VARCHAR(20);
    v_is_exam BOOLEAN;
    v_result JSONB;
BEGIN
    -- 1. Validar que ejercicio no sea examen
    SELECT difficulty, is_exam INTO v_exercise_difficulty, v_is_exam
    FROM educational_content.exercises
    WHERE id = p_exercise_id;

    IF v_is_exam THEN
        RAISE EXCEPTION 'Power-ups are not allowed in exam mode';
    END IF;

    -- 2. Verificar inventario
    SELECT quantity INTO v_current_quantity
    FROM gamification_system.comodines_inventory
    WHERE user_id = p_user_id AND comodin_type = p_comodin_type;

    IF v_current_quantity IS NULL OR v_current_quantity <= 0 THEN
        RAISE EXCEPTION 'No % available in inventory', p_comodin_type;
    END IF;

    -- 3. Obtener tracking actual para este ejercicio + attempt
    SELECT pistas_used, vision_lectora_used, segunda_oportunidad_used
    INTO v_pistas_used, v_vision_used, v_segunda_used
    FROM gamification_system.comodin_usage_tracking
    WHERE user_id = p_user_id
        AND exercise_id = p_exercise_id
        AND attempt_id = p_attempt_id;

    -- Si no existe, crear registro
    IF NOT FOUND THEN
        INSERT INTO gamification_system.comodin_usage_tracking (
            user_id,
            exercise_id,
            attempt_id,
            pistas_used,
            vision_lectora_used,
            segunda_oportunidad_used
        ) VALUES (
            p_user_id,
            p_exercise_id,
            p_attempt_id,
            0,
            false,
            false
        );
        v_pistas_used := 0;
        v_vision_used := false;
        v_segunda_used := false;
    END IF;

    -- 4. Validar límites por tipo
    IF p_comodin_type = 'pistas' THEN
        IF v_pistas_used >= 3 THEN
            RAISE EXCEPTION 'Max hints reached for this exercise (3)';
        END IF;
        v_hint_number := v_pistas_used + 1;

    ELSIF p_comodin_type = 'vision_lectora' THEN
        IF v_vision_used THEN
            RAISE EXCEPTION 'Reading Vision already used in this exercise';
        END IF;

    ELSIF p_comodin_type = 'segunda_oportunidad' THEN
        IF v_segunda_used THEN
            RAISE EXCEPTION 'Second Chance already used in this exercise';
        END IF;
    END IF;

    -- 5. Decrementar inventario
    UPDATE gamification_system.comodines_inventory
    SET
        quantity = quantity - 1,
        total_used = total_used + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id AND comodin_type = p_comodin_type;

    -- 6. Actualizar tracking
    IF p_comodin_type = 'pistas' THEN
        UPDATE gamification_system.comodin_usage_tracking
        SET pistas_used = pistas_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND attempt_id = p_attempt_id;

    ELSIF p_comodin_type = 'vision_lectora' THEN
        UPDATE gamification_system.comodin_usage_tracking
        SET vision_lectora_used = true, updated_at = NOW()
        WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND attempt_id = p_attempt_id;

    ELSIF p_comodin_type = 'segunda_oportunidad' THEN
        UPDATE gamification_system.comodin_usage_tracking
        SET segunda_oportunidad_used = true, updated_at = NOW()
        WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND attempt_id = p_attempt_id;
    END IF;

    -- 7. Registrar en log
    INSERT INTO gamification_system.comodin_usage_log (
        user_id,
        exercise_id,
        attempt_id,
        comodin_type,
        hint_number,
        exercise_difficulty,
        used_at
    ) VALUES (
        p_user_id,
        p_exercise_id,
        p_attempt_id,
        p_comodin_type,
        v_hint_number,
        v_exercise_difficulty,
        NOW()
    );

    -- 8. Construir resultado
    v_result := jsonb_build_object(
        'success', true,
        'comodin_type', p_comodin_type,
        'hint_number', v_hint_number,
        'remaining_quantity', v_current_quantity - 1
    );

    RAISE NOTICE 'User % used % in exercise %', p_user_id, p_comodin_type, p_exercise_id;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION gamification_system.use_comodin IS 'Usar comodín en ejercicio (validaciones + logging)';
```

### 7. Función: get_comodin_inventory

**Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/get_comodin_inventory.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.get_comodin_inventory(
    p_user_id UUID
)
RETURNS TABLE (
    comodin_type gamification_system.comodin_type,
    quantity INTEGER,
    total_purchased INTEGER,
    total_used INTEGER,
    last_purchased_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ci.comodin_type,
        ci.quantity,
        ci.total_purchased,
        ci.total_used,
        ci.last_purchased_at,
        ci.last_used_at
    FROM gamification_system.comodines_inventory ci
    WHERE ci.user_id = p_user_id
    ORDER BY
        CASE ci.comodin_type
            WHEN 'pistas' THEN 1
            WHEN 'vision_lectora' THEN 2
            WHEN 'segunda_oportunidad' THEN 3
        END;
END;
$$;

COMMENT ON FUNCTION gamification_system.get_comodin_inventory IS 'Obtener inventario completo de comodines del usuario';
```

---

## 🔧 Implementación Backend (NestJS)

### 1. Enum TypeScript

**Ubicación:** `apps/backend/src/gamification/enums/comodin-type.enum.ts`

```typescript
export enum ComodinTypeEnum {
  PISTAS = 'pistas',
  VISION_LECTORA = 'vision_lectora',
  SEGUNDA_OPORTUNIDAD = 'segunda_oportunidad',
}

export const COMODIN_COSTS: Record<ComodinTypeEnum, number> = {
  [ComodinTypeEnum.PISTAS]: 15,
  [ComodinTypeEnum.VISION_LECTORA]: 25,
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: 40,
};

export const COMODIN_LIMITS: Record<ComodinTypeEnum, number> = {
  [ComodinTypeEnum.PISTAS]: 3,
  [ComodinTypeEnum.VISION_LECTORA]: 1,
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: 1,
};
```

### 2. Entities

**Ubicación:** `apps/backend/src/gamification/entities/comodin-inventory.entity.ts`

```typescript
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ComodinTypeEnum } from '../enums/comodin-type.enum';

@Entity({ schema: 'gamification_system', name: 'comodines_inventory' })
export class ComodinInventory {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'enum', enum: ComodinTypeEnum, name: 'comodin_type' })
  comodinType: ComodinTypeEnum;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0, name: 'total_purchased' })
  totalPurchased: number;

  @Column({ type: 'integer', default: 0, name: 'total_used' })
  totalUsed: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_purchased_at' })
  lastPurchasedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. DTOs

**Ubicación:** `apps/backend/src/gamification/dto/comodin.dto.ts`

```typescript
import { IsEnum, IsInt, Min, Max, IsUUID, IsOptional } from 'class-validator';
import { ComodinTypeEnum } from '../enums/comodin-type.enum';

export class PurchaseComodinDto {
  @IsEnum(ComodinTypeEnum)
  comodinType: ComodinTypeEnum;

  @IsInt()
  @Min(1)
  @Max(10) // Máximo 10 unidades por compra
  quantity: number;
}

export class UseComodinDto {
  @IsUUID()
  exerciseId: string;

  @IsUUID()
  attemptId: string;

  @IsEnum(ComodinTypeEnum)
  comodinType: ComodinTypeEnum;
}

export class ComodinInventoryDto {
  comodinType: ComodinTypeEnum;
  quantity: number;
  totalPurchased: number;
  totalUsed: number;
  lastPurchasedAt?: Date;
  lastUsedAt?: Date;
  cost: number; // Costo unitario
}
```

### 4. ComodinService

**Ubicación:** `apps/backend/src/gamification/services/comodin.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComodinInventory } from '../entities/comodin-inventory.entity';
import { ComodinTypeEnum, COMODIN_COSTS } from '../enums/comodin-type.enum';
import { PurchaseComodinDto, UseComodinDto, ComodinInventoryDto } from '../dto/comodin.dto';

@Injectable()
export class ComodinService {
  constructor(
    @InjectRepository(ComodinInventory)
    private comodinInventoryRepo: Repository<ComodinInventory>,
  ) {}

  /**
   * Comprar comodín con ML Coins
   */
  async purchase(userId: string, dto: PurchaseComodinDto): Promise<{
    success: boolean;
    comodinType: ComodinTypeEnum;
    quantityPurchased: number;
    totalCost: number;
    newBalance: number;
    newQuantity: number;
  }> {
    const result = await this.comodinInventoryRepo.query(
      'SELECT * FROM gamification_system.purchase_comodin($1, $2, $3)',
      [userId, dto.comodinType, dto.quantity]
    );

    return result[0].purchase_comodin;
  }

  /**
   * Usar comodín en ejercicio
   */
  async use(userId: string, dto: UseComodinDto): Promise<{
    success: boolean;
    comodinType: ComodinTypeEnum;
    hintNumber?: number;
    remainingQuantity: number;
    effect?: any; // Contenido específico del comodín
  }> {
    const result = await this.comodinInventoryRepo.query(
      'SELECT * FROM gamification_system.use_comodin($1, $2, $3, $4)',
      [userId, dto.exerciseId, dto.attemptId, dto.comodinType]
    );

    const usageResult = result[0].use_comodin;

    // Generar efecto según tipo
    let effect = null;

    if (dto.comodinType === ComodinTypeEnum.PISTAS) {
      effect = await this.generateHint(dto.exerciseId, usageResult.hint_number);
    } else if (dto.comodinType === ComodinTypeEnum.VISION_LECTORA) {
      effect = await this.generateReadingVision(dto.exerciseId);
    }

    return {
      ...usageResult,
      effect,
    };
  }

  /**
   * Obtener inventario completo
   */
  async getInventory(userId: string): Promise<ComodinInventoryDto[]> {
    const result = await this.comodinInventoryRepo.query(
      'SELECT * FROM gamification_system.get_comodin_inventory($1)',
      [userId]
    );

    return result.map((row) => ({
      comodinType: row.comodin_type,
      quantity: row.quantity,
      totalPurchased: row.total_purchased,
      totalUsed: row.total_used,
      lastPurchasedAt: row.last_purchased_at,
      lastUsedAt: row.last_used_at,
      cost: COMODIN_COSTS[row.comodin_type],
    }));
  }

  /**
   * Verificar disponibilidad de comodín
   */
  async hasAvailable(userId: string, comodinType: ComodinTypeEnum): Promise<boolean> {
    const inventory = await this.comodinInventoryRepo.findOne({
      where: { userId, comodinType },
    });

    return inventory ? inventory.quantity > 0 : false;
  }

  /**
   * Generar contenido de pista
   */
  private async generateHint(exerciseId: string, hintNumber: number): Promise<string> {
    // Obtener ejercicio
    const exercise = await this.comodinInventoryRepo.query(
      'SELECT hints FROM educational_content.exercises WHERE id = $1',
      [exerciseId]
    );

    if (!exercise[0] || !exercise[0].hints) {
      throw new BadRequestException('No hints available for this exercise');
    }

    const hints = exercise[0].hints; // JSONB array: ["hint1", "hint2", "hint3"]

    if (hints.length < hintNumber) {
      throw new BadRequestException(`Hint ${hintNumber} not available`);
    }

    return hints[hintNumber - 1];
  }

  /**
   * Generar efecto de Visión Lectora
   */
  private async generateReadingVision(exerciseId: string): Promise<{
    highlightedSentences: number[]; // Índices de oraciones a resaltar
  }> {
    // Obtener ejercicio y su contenido
    const exercise = await this.comodinInventoryRepo.query(
      'SELECT content, answer_key FROM educational_content.exercises WHERE id = $1',
      [exerciseId]
    );

    if (!exercise[0]) {
      throw new BadRequestException('Exercise not found');
    }

    // Algoritmo simple: resaltar oraciones que contengan palabras clave de la respuesta
    // En producción, usar NLP más sofisticado
    const content = exercise[0].content;
    const answerKey = exercise[0].answer_key;

    // Simplificación: devolver índices de oraciones relevantes
    // TODO: Implementar algoritmo de NLP real
    const highlightedSentences = [1, 3, 5]; // Placeholder

    return { highlightedSentences };
  }
}
```

### 5. Controller

**Ubicación:** `apps/backend/src/gamification/controllers/comodin.controller.ts`

```typescript
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ComodinService } from '../services/comodin.service';
import { PurchaseComodinDto, UseComodinDto } from '../dto/comodin.dto';

@Controller('comodines')
@UseGuards(JwtAuthGuard)
export class ComodinController {
  constructor(private comodinService: ComodinService) {}

  /**
   * POST /comodines/purchase
   * Comprar comodín con ML Coins
   */
  @Post('purchase')
  async purchase(@Req() req, @Body() dto: PurchaseComodinDto) {
    return await this.comodinService.purchase(req.user.id, dto);
  }

  /**
   * POST /comodines/use
   * Usar comodín en ejercicio
   */
  @Post('use')
  async use(@Req() req, @Body() dto: UseComodinDto) {
    return await this.comodinService.use(req.user.id, dto);
  }

  /**
   * GET /comodines/inventory
   * Obtener inventario del usuario
   */
  @Get('inventory')
  async getInventory(@Req() req) {
    return await this.comodinService.getInventory(req.user.id);
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. Component: ComodinShop

**Ubicación:** `apps/frontend/src/components/gamification/ComodinShop.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { comodinService } from '../../services/comodin.service';
import { ComodinTypeEnum, COMODIN_COSTS } from '../../types/comodin.types';
import { toast } from 'react-toastify';

export const ComodinShop: React.FC = () => {
  const [inventory, setInventory] = useState([]);
  const [mlCoins, setMlCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const inv = await comodinService.getInventory();
    setInventory(inv);

    // Obtener ML Coins del usuario
    const userStats = await comodinService.getUserStats();
    setMlCoins(userStats.mlCoins);
  };

  const handlePurchase = async (type: ComodinTypeEnum, quantity: number) => {
    try {
      setLoading(true);

      const result = await comodinService.purchase({ comodinType: type, quantity });

      toast.success(`Compraste ${quantity} ${type}!`);
      setMlCoins(result.newBalance);

      await loadData(); // Recargar inventario
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al comprar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Tienda de Comodines</h1>

      {/* Balance */}
      <div className="mb-6 p-4 bg-yellow-100 rounded-lg">
        <p className="text-lg">Tu balance: <span className="font-bold">{mlCoins} ML Coins</span></p>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pistas */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-500">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">💡</div>
            <h3 className="text-xl font-bold">Pistas</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Recibe hasta 3 pistas progresivas por ejercicio
          </p>
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-blue-600">15 ML Coins</span>
          </div>
          <button
            onClick={() => handlePurchase(ComodinTypeEnum.PISTAS, 1)}
            disabled={loading || mlCoins < 15}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Comprar 1
          </button>
          <button
            onClick={() => handlePurchase(ComodinTypeEnum.PISTAS, 5)}
            disabled={loading || mlCoins < 75}
            className="w-full mt-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Comprar 5 (75 coins)
          </button>
        </div>

        {/* Visión Lectora */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-500">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">👁️</div>
            <h3 className="text-xl font-bold">Visión Lectora</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Resalta oraciones clave en textos largos
          </p>
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-purple-600">25 ML Coins</span>
          </div>
          <button
            onClick={() => handlePurchase(ComodinTypeEnum.VISION_LECTORA, 1)}
            disabled={loading || mlCoins < 25}
            className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Comprar 1
          </button>
        </div>

        {/* Segunda Oportunidad */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-green-500">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">♻️</div>
            <h3 className="text-xl font-bold">Segunda Oportunidad</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Reintenta sin perder racha ni XP
          </p>
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-green-600">40 ML Coins</span>
          </div>
          <button
            onClick={() => handlePurchase(ComodinTypeEnum.SEGUNDA_OPORTUNIDAD, 1)}
            disabled={loading || mlCoins < 40}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Comprar 1
          </button>
        </div>
      </div>

      {/* Inventario actual */}
      <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Tu Inventario</h2>
        <div className="grid grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.comodinType} className="text-center">
              <p className="font-semibold">{item.comodinType}</p>
              <p className="text-3xl font-bold text-blue-600">{item.quantity}</p>
              <p className="text-xs text-gray-500">Comprados: {item.totalPurchased}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. Component: ComodinButton (en ejercicio)

**Ubicación:** `apps/frontend/src/components/exercises/ComodinButton.tsx`

```typescript
import React from 'react';
import { ComodinTypeEnum } from '../../types/comodin.types';

interface ComodinButtonProps {
  type: ComodinTypeEnum;
  available: number;
  onClick: () => void;
  disabled?: boolean;
}

const COMODIN_ICONS = {
  [ComodinTypeEnum.PISTAS]: '💡',
  [ComodinTypeEnum.VISION_LECTORA]: '👁️',
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: '♻️',
};

const COMODIN_LABELS = {
  [ComodinTypeEnum.PISTAS]: 'Usar Pista',
  [ComodinTypeEnum.VISION_LECTORA]: 'Visión Lectora',
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: 'Segunda Oportunidad',
};

export const ComodinButton: React.FC<ComodinButtonProps> = ({ type, available, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || available <= 0}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        disabled || available <= 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
      }`}
    >
      <span className="text-2xl">{COMODIN_ICONS[type]}</span>
      <span>{COMODIN_LABELS[type]}</span>
      <span className="ml-2 px-2 py-1 bg-white text-blue-600 rounded text-sm">{available}</span>
    </button>
  );
};
```

---

## 🧪 Testing

### Test Case 1: Compra Exitosa

```typescript
test('User can purchase comodin with sufficient ML Coins', async () => {
  const user = await createUser({ ml_coins: 100 });

  const result = await comodinService.purchase(user.id, {
    comodinType: ComodinTypeEnum.PISTAS,
    quantity: 3,
  });

  expect(result.success).toBe(true);
  expect(result.totalCost).toBe(45); // 15 * 3
  expect(result.newBalance).toBe(55); // 100 - 45

  const inventory = await getComodinInventory(user.id);
  expect(inventory[ComodinTypeEnum.PISTAS].quantity).toBe(3);
});
```

---

## 📊 Performance

### Índices Críticos

```sql
CREATE INDEX idx_comodines_inventory_user ON gamification_system.comodines_inventory(user_id);
CREATE INDEX idx_comodin_usage_log_user ON gamification_system.comodin_usage_log(user_id);
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |
| 1.1 | 2025-11-11 | Database Team | Actualización de costos a valores DDL implementados (pistas: 15, vision_lectora: 25, segunda_oportunidad: 40) |

---

**Documento:** `docs/20-architecture/02-gamificacion/ET-GAM-002-comodines.md`
**Propósito:** Especificación técnica completa del sistema de comodines
**Audiencia:** Backend Developers, Frontend Developers, QA Team
