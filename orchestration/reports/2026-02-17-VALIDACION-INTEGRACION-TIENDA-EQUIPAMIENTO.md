# Validacion Integracion Flujo Tienda/Equipamiento

**Version:** 1.0.0
**Fecha:** 2026-02-17
**Tipo:** Analisis detallado + Validacion cross-layer
**Alcance:** DDL, Seeds, Scripts, Backend, Frontend, Documentacion, Inventarios

---

## Resumen Ejecutivo

Se analizo la integracion completa del flujo de tienda visual (compra → inventario → equipamiento cosmtico). El analisis cubrio 5 capas: DDL/Seeds/Scripts, Backend, Frontend, Documentacion, y Coherencia Cross-Layer.

**Resultado:** 2 hallazgos CRITICOS, 2 ALTOS, 3 MEDIOS, 2 BAJOS, y multiples validaciones APROBADAS.

---

## 1. Hallazgos CRITICOS

### C-01: Seeds 14-19 NO registrados en init-database.sh

**Severidad:** CRITICA — Seeds no se ejecutan durante recreacion de BD
**Archivos afectados:**
- `apps/database/scripts/init-database.sh` (lineas 1088-1103)

**Detalle:**
El array `seed_entries` en init-database.sh termina en `gamification_system/13-shop_items.sql`. Los siguientes 6 seeds existen en disco pero NO estan registrados:

| # | Archivo | Tipo |
|---|---------|------|
| 14 | `gamification_system/14-achievements-m3-m5.sql` | Demo data |
| 15 | `gamification_system/15-comodin_usage_tracking.sql` | Demo data |
| 16 | `gamification_system/16-shop_items_expanded.sql` | Core (catalogo expandido) |
| 17 | `gamification_system/17-shop_items_metadata_normalization.sql` | Core (normalizacion) |
| 18 | `gamification_system/18-user_purchases-demo.sql` | Demo data |
| 19 | `gamification_system/19-user_equipped_items-demo.sql` | Demo data |

**Impacto:**
- Seed 16 (shop_items_expanded) NO se carga → tienda con catalogo incompleto
- Seed 17 (metadata normalization) NO se ejecuta → metadata visual no normalizada
- Seed 18 (demo purchases) NO existe → sin datos de prueba para compras
- Seed 19 (demo equipped items) NO existe → sin datos de prueba para equipamiento
- `ENV_FAIL_ON_MISSING_SEED=true` en dev.conf NO detecta esto (solo falla si un seed REGISTRADO no existe en disco, no al reves)

**Accion:** CORREGIR — Agregar los 6 seeds al array `seed_entries`

---

### C-02: USER_EQUIPPED_ITEMS falta en database.constants.ts

**Severidad:** CRITICA — Viola patron SSOT de constantes centralizadas
**Archivo:** `apps/backend/src/shared/constants/database.constants.ts` (linea 74-95)

**Detalle:**
La seccion `DB_TABLES.GAMIFICATION` contiene `SHOP_CATEGORIES`, `SHOP_ITEMS`, `USER_PURCHASES` pero NO `USER_EQUIPPED_ITEMS`. La entity `user-equipped-item.entity.ts` usa string literal `'user_equipped_items'` en vez de la constante centralizada.

**Impacto:**
- Inconsistencia con el patron establecido donde TODA tabla tiene su constante
- Riesgo de typo si se referencia desde otro lugar
- `validateTableInSchema()` no puede validar esta tabla

**Accion:** CORREGIR — Agregar constante y actualizar entity

---

## 2. Hallazgos ALTOS

### A-01: BACKEND_INVENTORY.yml no registra nuevos archivos

**Severidad:** ALTA — SSOT desactualizado
**Archivo:** `orchestration/inventarios/BACKEND_INVENTORY.yml`

**Detalle:** Los siguientes archivos nuevos NO estan registrados:
- `controllers/inventory.controller.ts` (3 endpoints)
- `services/inventory.service.ts` (4 metodos)
- `entities/user-equipped-item.entity.ts`
- `dto/inventory/equip-item.dto.ts`

**Accion:** DOCUMENTAR para proxima actualizacion de inventarios

---

### A-02: DATABASE_INVENTORY.yml y MASTER_INVENTORY.yml desactualizados

**Severidad:** ALTA — Conteos SSOT incorrectos
**Archivos:**
- `orchestration/inventarios/DATABASE_INVENTORY.yml` — falta tabla `user_equipped_items`
- `orchestration/inventarios/MASTER_INVENTORY.yml` — conteos desactualizados:
  - entities: 152 → 153 (+UserEquippedItem)
  - controllers: 107 → 108 (+InventoryController)
  - services: 171 → 172 (+InventoryService)
  - endpoints: 901 → 904 (+3 inventory endpoints)

**Accion:** DOCUMENTAR para proxima actualizacion de inventarios

---

## 3. Hallazgos MEDIOS

### M-01: Frontend useInventory.ts usa useState/useEffect en vez de React Query

**Severidad:** MEDIA — Desviacion del patron establecido
**Archivo:** `apps/frontend/src/features/gamification/social/hooks/useInventory.ts`

**Detalle:**
El hook usa `useState` + `useEffect` + `useCallback` para manejar estado del servidor. El patron establecido del proyecto es React Query (`useQuery`/`useMutation`) para server state + Zustand solo para client state.

**Consecuencias:**
- Sin cache automatico (cada montaje = nueva request)
- Sin invalidacion automatica
- Sin retry automatico
- Sin deduplication de requests concurrentes
- Sin stale-while-revalidate

**Accion:** DOCUMENTAR como deuda tecnica — funciona pero no es optimo

---

### M-02: Numeracion de seeds INCONSISTENTE entre ambientes

**Severidad:** MEDIA — Riesgo de confusion en mantenimiento

| Seed | Dev | Prod | Staging |
|------|-----|------|---------|
| achievements-m3-m5 | 14 | 14 | 14 |
| comodin_usage_tracking | 15 | 15 | — |
| shop_items_expanded | 16 | — | — |
| metadata_normalization | 17 | 16 | 15 |
| user_purchases-demo | 18 | 17 | 16 |
| user_equipped_items-demo | 19 | 18 | 17 |

**Accion:** DOCUMENTAR — funciona porque cada ambiente tiene sus propios archivos

---

### M-03: DDL sin RLS inline (usa archivo separado)

**Severidad:** MEDIA — Patron aceptable pero no ideal
**Archivos:**
- `apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql` — SIN RLS
- `apps/database/ddl/07d-rls-policies-pending-tables.sql` — CONTIENE las 2 politicas RLS

**Detalle:** El DDL de la tabla no incluye RLS inline. Las politicas estan en el archivo separado 07d (lineas 621-645): `user_equipped_items_admin_all` y `user_equipped_items_user_own`, con ENABLE + FORCE. Esto funciona correctamente pero dificulta la trazabilidad.

**Accion:** DOCUMENTAR — funcional, candidato a consolidar en futuro

---

## 4. Hallazgos BAJOS

### B-01: Entity usa string literal en vez de constante

**Severidad:** BAJA — Funcional, pero inconsistente
**Archivo:** `apps/backend/src/modules/gamification/entities/user-equipped-item.entity.ts`
**Linea:** `@Entity('user_equipped_items')` en vez de usar `DB_TABLES.GAMIFICATION.USER_EQUIPPED_ITEMS`

**Accion:** Se corrige junto con C-02

---

### B-02: Frontend getPurchasedItems retorna `any[]`

**Severidad:** BAJA — Falta tipado
**Archivo:** `apps/frontend/src/features/gamification/social/api/inventory.api.ts` (linea 18)
**Detalle:** `getPurchasedItems` retorna `Promise<any[]>` — sin tipado fuerte

**Accion:** DOCUMENTAR como deuda tecnica

---

## 5. Validaciones APROBADAS

### DDL (user_equipped_items)
- [x] Estructura correcta: uuid PK, 3 FKs (profiles, shop_items, shop_categories)
- [x] ON DELETE CASCADE en las 3 FKs
- [x] UNIQUE constraint en (user_id, category_id) via unique index
- [x] Indexes: user_id, category_id, unique_category
- [x] Column comments completos
- [x] Table comment presente
- [x] GRANT ALL a gamilit_user
- [x] Default gen_random_uuid() para PK
- [x] Timestamp con gamilit.now_mexico()

### RLS (en 07d)
- [x] ENABLE ROW LEVEL SECURITY
- [x] FORCE ROW LEVEL SECURITY
- [x] Policy admin_all: gamilit.is_admin() OR gamilit.is_super_admin()
- [x] Policy user_own: user_id = gamilit.get_current_user_id() con WITH CHECK

### Entity (user-equipped-item.entity.ts)
- [x] Coincide con DDL: uuid PK, user_id, category_id, item_id, equipped_at, metadata
- [x] @ManyToOne relations con JoinColumn correctos
- [x] @Unique(['user_id', 'category_id']) match DDL unique index
- [x] @CreateDateColumn para equipped_at

### Service (inventory.service.ts)
- [x] 4 metodos: getEquippedItems, getEquippedItemsMap, equipItem, unequipItem
- [x] equipItem usa @Transaction con EntityManager para atomicidad
- [x] Validacion de ownership via user_purchases (status=completed, is_active=true)
- [x] Validacion de is_consumable (rechaza consumibles)
- [x] Upsert por (user_id, category_id) — reemplaza item anterior
- [x] Mensajes de error consistentes con ENDPOINTS-INVENTORY-EQUIP.md

### Controller (inventory.controller.ts)
- [x] 3 endpoints: GET /equipped, POST /equip, POST /unequip
- [x] @UseGuards(JwtAuthGuard) en todos
- [x] @ApiTags, @ApiBearerAuth, @ApiOperation, @ApiResponse decoradores
- [x] Extrae userId de req.user correctamente

### DTO (equip-item.dto.ts)
- [x] @IsUUID() + @IsNotEmpty() en itemId
- [x] @ApiProperty con ejemplo UUID

### Frontend API (inventory.api.ts)
- [x] Usa apiClient centralizado
- [x] 4 funciones: getEquippedItems, getPurchasedItems, equipItem, unequipItem
- [x] Base URLs correctos: `/gamification/inventory` y `/gamification/shop`

### Frontend Types (inventory.types.ts)
- [x] EquippedItem interface con campos correctos
- [x] EquipItemPayload interface
- [x] EquippedItemsMap type

### Module Registration (gamification.module.ts)
- [x] UserEquippedItem en entities (linea 29)
- [x] InventoryService en services (linea 49)
- [x] InventoryController en controllers (linea 64)

### Seeds
- [x] 17-shop_items_metadata_normalization.sql: UPDATE condicional (no destructivo, ON CONFLICT safe)
- [x] 18-user_purchases-demo.sql: ON CONFLICT (id) DO UPDATE (idempotente)
- [x] 19-user_equipped_items-demo.sql: ON CONFLICT (user_id, category_id) DO UPDATE (idempotente)
- [x] Dependencias correctas: 17→13(shop_items), 18→13+profiles, 19→18(purchases)

### SEEDS_INVENTORY.yml
- [x] Seeds 17-19 registrados en SEEDS_INVENTORY.yml (lineas 863, 1134, 1228)

### Documentacion
- [x] `docs/40-api/ENDPOINTS-INVENTORY-EQUIP.md` — Completo (3 endpoints, DTOs, errores, trazabilidad)
- [x] `docs/30-ux-ui/flujos/student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md` — Completo (Mermaid, estados UI, reglas UX, trazabilidad)
- [x] `docs/30-ux-ui/flujos/student/FLUJO-COMPRA-INVENTARIO-EQUIPAR.md` — Completo (flujo compuesto E2E, 2 diagramas Mermaid, reglas negocio, errores, trazabilidad)
- [x] `docs/20-architecture/schema-reference/04-gamification.md` — user_equipped_items documentada (lineas 262-277)
- [x] `docs/30-ux-ui/flujos/README.md` — FL-STU-19 y FL-STU-20 listados
- [x] `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md` — Ambos flujos con trazabilidad

---

## 6. Hallazgos Adicionales (descubiertos durante recreacion)

### C-03: Seed 15 referencia tabla singular (pre-existente)

**Severidad:** CRITICA — Seed falla con ERROR
**Archivo:** `apps/database/seeds/dev/gamification_system/15-comodin_usage_tracking.sql`
**Detalle:** Referencia `gamification_system.comodin_usage_tracking` (singular) pero DDL crea `gamification_system.comodin_usage_trackings` (plural). Error en bloque de verificacion.
**Accion:** CORREGIDO — Cambiado a nombre plural

### C-04: Seeds 18-19 usan UUID hardcodeado inexistente

**Severidad:** CRITICA — FK violation `user_purchases_user_id_fkey`
**Archivos:**
- `apps/database/seeds/dev/gamification_system/18-user_purchases-demo.sql`
- `apps/database/seeds/dev/gamification_system/19-user_equipped_items-demo.sql`
**Detalle:** Usaban `cccccccc-cccc-cccc-cccc-cccccccccccc` como user_id, que no existe en `auth_management.profiles`. Viola el patron CORR-05 de lookup dinamico.
**Accion:** CORREGIDO — Reescritos con DO $$ block + dynamic profile lookup via `estudiante1@demo.glit.edu.mx`

---

## 7. Acciones Correctivas Aplicadas

| ID | Hallazgo | Accion | Estado |
|----|----------|--------|--------|
| C-01 | Seeds 14-19 no en init-database.sh | Agregar al array seed_entries | CORREGIDO |
| C-02 | USER_EQUIPPED_ITEMS falta en constants | Agregar constante + actualizar entity | CORREGIDO |
| C-03 | Seed 15 referencia tabla singular | Corregir a plural `comodin_usage_trackings` | CORREGIDO |
| C-04 | Seeds 18-19 hardcoded UUID | Reescribir con dynamic profile lookup | CORREGIDO |
| A-01 | BACKEND_INVENTORY.yml desactualizado | Documentado para proxima actualizacion | DOCUMENTADO |
| A-02 | DATABASE/MASTER_INVENTORY.yml desactualizados | Documentado para proxima actualizacion | DOCUMENTADO |
| M-01 | useInventory.ts sin React Query | Documentado como deuda tecnica | DOCUMENTADO |
| M-02 | Numeracion seeds inconsistente | Documentado | DOCUMENTADO |
| M-03 | DDL sin RLS inline | Funcional via 07d, documentado | DOCUMENTADO |
| B-01 | Entity usa string literal | Se corrige con C-02 | CORREGIDO |
| B-02 | getPurchasedItems retorna any[] | Documentado como deuda tecnica | DOCUMENTADO |

---

## 8. Resultado de Recreacion de BD

**Script:** `recreate-database.sh --env dev --force --password gamilit_dev_2026`
**Resultado:** EXIT CODE 0 (SUCCESS)

| Objeto | Cantidad |
|--------|----------|
| Schemas | 20 |
| Tablas | 169 |
| Funciones | 255 |
| Triggers | 70 |
| RLS Policies | 349 |
| ENUMs | 42 |
| Views | 24 |
| MVs | 7 |
| FKs | 298 |
| Seeds cargados | **76** (0 errores) |
| Usuarios | 52 |
| Perfiles | 52 |

**Datos de equipamiento verificados:**
- 2 `user_purchases` demo (estudiante1@demo, Marco + Titulo, status=completed)
- 2 `user_equipped_items` demo (estudiante1@demo, categories cosmetics + profile)
- Joins correctos entre user_equipped_items → profiles, shop_items, shop_categories

**Notas pre-existentes (no relacionadas al flujo tienda):**
- 14 indices con errores (pre-existente, CORR-03)
- 16 archivos RLS schema con errores (pre-existente, CORR-04)
