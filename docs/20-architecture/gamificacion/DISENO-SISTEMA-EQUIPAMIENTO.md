# Diseño Técnico: Sistema de Equipamiento de Items (Skins)

**Fecha:** 2026-02-18
**Estado:** Parcialmente Implementado (DDL+Backend+Header; Perfil pendiente)
**Feature:** Personalización de Avatar

---

## 0. Contrato de metadata (obligatorio)

Toda referencia a `metadata` JSONB de items visuales debe alinearse con:

- `docs/40-standards/ESTANDAR-METADATA-ITEMS.md` (contrato canonico).

Regla de consistencia:
- Se permite leer formato legacy solo por compatibilidad.
- Se prohíbe escribir nuevos registros con claves legacy (`cssClass`, `assetUrl`, `css_frame`, `image_frame`).
- `effect_data` se reserva para comportamiento funcional del item y `metadata` para render visual.

---

## 1. Diseño de Base de Datos (DDL)

Se requiere una nueva tabla transaccional en el esquema `gamification_system`.

**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql`

```sql
-- =====================================================================================
-- Table: user_equipped_items
-- Schema: gamification_system
-- Description: Items cosméticos equipados actualmente por el usuario (Loadout activo)
-- Version: 1.0 (2026-02-17) - Creación inicial
-- Author: Architecture-Agent
--
-- 📚 Documentación:
-- Requerimiento: Personalización de avatar y perfil
-- Especificación: Tabla que define qué item tiene puesto el usuario en cada categoría
-- Regla de Negocio: Un usuario solo puede tener 1 item equipado por categoría a la vez.
--
-- Relaciones:
--   - user_id -> auth_management.profiles (Dueño del loadout)
--   - item_id -> gamification_system.shop_items (Item específico)
--   - category_id -> gamification_system.shop_categories (Categoría del item, redundante pero necesaria para constraint)
-- =====================================================================================

-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS gamification_system.user_equipped_items CASCADE;

-- Create table
CREATE TABLE gamification_system.user_equipped_items (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,

    -- Relations
    user_id uuid NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES gamification_system.shop_categories(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES gamification_system.shop_items(id) ON DELETE CASCADE,

    -- Metadata
    equipped_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    metadata jsonb DEFAULT '{}'
);

-- Table comment
COMMENT ON TABLE gamification_system.user_equipped_items IS 'Items cosméticos equipados actualmente por el usuario';

-- Column comments
COMMENT ON COLUMN gamification_system.user_equipped_items.user_id IS 'Usuario dueño del equipamiento';
COMMENT ON COLUMN gamification_system.user_equipped_items.category_id IS 'Categoría del item (Avatar, Marco, Fondo)';
COMMENT ON COLUMN gamification_system.user_equipped_items.item_id IS 'Item específico equipado';
COMMENT ON COLUMN gamification_system.user_equipped_items.equipped_at IS 'Fecha en que se equipó el item';

-- Indexes
CREATE INDEX idx_user_equipped_user ON gamification_system.user_equipped_items(user_id);
CREATE INDEX idx_user_equipped_category ON gamification_system.user_equipped_items(category_id);

-- Unique Constraint (CORE LOGIC):
-- Garantiza que solo haya 1 item por categoría para un usuario.
-- Si intenta insertar otro item de la misma categoría, debe fallar o usarse ON CONFLICT UPDATE.
CREATE UNIQUE INDEX idx_user_equipped_unique_category ON gamification_system.user_equipped_items(user_id, category_id);

-- Grant permissions
GRANT ALL ON TABLE gamification_system.user_equipped_items TO gamilit_user;
```

---

## 2. Arquitectura Backend (NestJS)

### 2.1 Nueva Entidad (TypeORM)
**Archivo:** `apps/backend/src/modules/gamification/entities/user-equipped-item.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Profile } from '../../auth/entities/profile.entity';
import { ShopItem } from './shop-item.entity';
import { ShopCategory } from './shop-category.entity';

@Entity('user_equipped_items', { schema: 'gamification_system' })
@Unique(['user_id', 'category_id']) // Enforce unique constraint in ORM
export class UserEquippedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => ShopCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ShopCategory;

  @ManyToOne(() => ShopItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: ShopItem;

  @CreateDateColumn({ type: 'timestamptz' })
  equipped_at: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
```

### 2.2 Nuevo Servicio (InventoryService)
Se recomienda separar la lógica de "Uso" (Inventory) de la lógica de "Compra" (Shop).

**Métodos Clave:**
*   `getEquippedItems(userId: string): Promise<UserEquippedItem[]>`
*   `equipItem(userId: string, itemId: string): Promise<UserEquippedItem>`
    *   Valida `user_purchases` (ownership).
    *   Obtiene `category_id` del item.
    *   Ejecuta `repository.upsert` basado en `(user_id, category_id)`.
*   `unequipItem(userId: string, itemId: string): Promise<void>`

#### Flujo técnico mínimo (Backend)

1. `equipItem` recibe `user_id` + `item_id`.
2. Valida existencia y estado activo del item (`shop_items`).
3. Valida propiedad del item (`user_purchases`).
4. Obtiene `category_id` del item.
5. Ejecuta `upsert` en `user_equipped_items` por clave `(user_id, category_id)`.
6. Retorna item equipado + metadata canonica para render.

Reglas:
- Debe existir una sola pieza equipada por categoría.
- Si el item pertenece a otra categoría, no puede reemplazar categorías distintas.
- Debe rechazar metadata inválida para render (según estándar canónico).

### 2.3 Impacto en Auth (Dependencia Crítica)
El `AuthService.getProfile` (y el endpoint `/auth/profile`) debe modificarse para inyectar los items equipados en la respuesta.

**Cambio Requerido en `AuthService`:**
```typescript
// En getProfile o login response:
const equippedItems = await this.inventoryService.getEquippedItems(user.id);
// Transformar a mapa simple para frontend:
// { avatar: 'url...', frame: 'url...', theme: 'dark' }
```

---

## 3. Arquitectura Frontend (React)

### 3.1 Hook de Equipamiento (Implementado)
**Archivo:** `apps/frontend/src/features/gamification/social/hooks/useEquipment.ts`

Usa React Query (TanStack Query) en lugar de Zustand store:
*   `useQuery` para cargar items equipados (`GET /gamification/inventory/equipped`).
*   `useMutation` para equip/unequip con invalidación automática de cache.
*   Exporta: `{ equippedItems, equipItem, unequipItem, isLoading }`.

### 3.2 Componente Avatar (Implementado)
**Archivo:** `apps/frontend/src/shared/components/AvatarDisplay.tsx`

Componente reutilizable con props explícitas (no suscrito a store global):
```tsx
<AvatarDisplay
  src={avatarSrc}           // URL de avatar equipado o profile
  name={userName}           // Para fallback de iniciales
  frameColor={frameColor}   // Color de borde del marco equipado
  size="sm"                 // 'xs' | 'sm' | 'md' | 'lg'
/>
```
Integrado en `GamifiedHeader` (botón usuario + dropdown) usando `useEquipment` hook.

#### Contrato FE-BE mínimo

- Respuesta de equipamiento debe incluir:
  - `item_id`, `category_id`, `equipped_at`
  - `item.metadata` en formato canónico
- Frontend debe:
  - Resolver por `type`.
  - Aplicar fallback si metadata no cumple contrato.
  - Evitar render de clases fuera de whitelist.

---

## 4. Plan de Migración de Datos (Clean Recreation)

Dado que no se permiten migraciones (`alter table`), el cambio en BD implica:
1.  Agregar el archivo `21-user_equipped_items.sql`.
2.  Ejecutar `init-database.sh --recreate` en entorno local.
3.  Verificar que los seeds de prueba incluyan algunos items equipados por defecto para testing.
