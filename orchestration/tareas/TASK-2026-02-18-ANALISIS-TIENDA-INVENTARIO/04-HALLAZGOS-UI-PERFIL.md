# Track D: Hallazgos — UI de Perfil para Equipamiento

**Fecha:** 2026-02-18 | **Estado:** Completo

---

## Resumen Ejecutivo

EnhancedProfilePage tiene 4 tabs (Overview, Stats, History, Achievements) pero **ninguna seccion de equipamiento**. El avatar se muestra con DiceBear (seleccion de presets) pero NO refleja items equipados. GamifiedHeader renderiza **iniciales** del nombre, no el avatar del perfil. InventoryPage es la unica pagina con equip/unequip, pero no muestra los items visualmente.

---

## 1. Estructura Actual de EnhancedProfilePage

### Tabs:
1. **Overview** — Header hero con avatar grande, nombre, email, rank, stats rapidos
2. **Stats** — Graficas de actividad (7 dias) con XP/Coins/Ejercicios (Recharts)
3. **History** — Timeline de progresion de rangos con fechas y XP requerido
4. **Achievements** — 5 logros recientes con link a pagina completa

### Hero Section:
- Avatar circular 32x32px con borde gradiente
- Boton camara para abrir AvatarSelectionModal
- Nombre completo + email
- Rank badge + nivel

### AvatarSelectionModal:
- Grid de 12 avatars predefinidos (DiceBear API)
- Seleccion con checkmark overlay
- API call: `profileAPI.updateProfile({ avatar_url })` al confirmar
- NO integra items equipados de la tienda

---

## 2. InventoryPage — Como Funciona el Equip Actual

### Tabs:
1. **All Items** — Grid de todos los items comprados (cosmeticos + power-ups)
2. **Cosmetics** — Filtro cosmeticos (marcado "Proximamente")
3. **Power-ups** — Consumibles con cantidad
4. **Active** — Power-ups activos con countdown

### Card de Item:
- Icono grande (32x32 gradiente)
- Badge de rareza (Common/Rare/Epic/Legendary)
- Nombre + descripcion
- Cosmeticos: boton "Equipar" / "Equipado" / "Quitar"
- Power-ups: boton "Usar" + cantidad

### Flujo de equip:
```
Click "Equipar" → useEquipment.equipItem({itemId})
  → POST /gamification/inventory/equip
  → Backend valida: item existe + no consumible + usuario lo compro
  → UPSERT user_equipped_items (category_id unique)
  → Cache invalidation + toast "Item equipado"
```

---

## 3. Rutas Actuales

| Ruta | Pagina | Relacion con equipamiento |
|------|--------|--------------------------|
| `/profile` | EnhancedProfilePage | Muestra avatar DiceBear, NO items equipados |
| `/inventory` | InventoryPage | Equip/unequip funcional, pero sin visual |
| `/shop` | ShopPage | Compra de items |
| `/settings` | SettingsPage | Upload avatar + DiceBear picker |

Las rutas estan separadas — no hay `/profile/customize` ni integracion directa.

---

## 4. GamifiedHeader — Avatar Actual

```tsx
// Renderiza INICIALES, no avatar:
<div className="flex h-8 w-8 items-center justify-center rounded-full
  bg-gradient-to-r from-purple-500 to-pink-500">
  <span className="text-sm font-bold text-white">
    {getUserFullName(user).charAt(0)}
  </span>
</div>
```

**Datos mostrados:** Nombre, rol, XP + Level (estudiantes), ML Coins, rank badge, achievement badges (3 primeros)

**NO importa ni usa:** useEquipment, avatar_url, equipped items

---

## 5. GamilitSidebar — Sin Cosmeticos

Componente puramente de navegacion:
- Items de nav (Dashboard, Badges, Shop, Profile, Stats)
- Cards de progreso por modulo (titulo, porcentaje, barra)
- NO muestra avatar ni items equipados

---

## 6. Componentes en shared/components/profile/

**Solo existe:** `AvatarSelectionModal.tsx`
- Modal para seleccionar avatar de presets DiceBear
- Grid responsive (3-4 columnas)
- NO tiene integracion con items de tienda

**NO existen:**
- AvatarDisplay (componente reutilizable)
- EquipmentPreview
- CategorySelector
- EquipmentCard

---

## 7. SettingsPage vs EnhancedProfilePage

| Aspecto | SettingsPage | EnhancedProfilePage |
|---------|-------------|---------------------|
| Avatar | Upload archivo (2MB max) + DiceBear picker | DiceBear picker (modal) |
| Datos | Nombre, bio, email, password | Nombre, email, stats, rank |
| Equipamiento | Ninguno | Ninguno |
| Tema | Toggle tema/idioma | No |
| Privacidad | Visibilidad, estado online | No |

---

## 8. Hooks y API Existentes

### useEquipment()
```typescript
Returns: {
  equippedItems: EquippedItem[],
  isLoading: boolean,
  isActionLoading: boolean,
  equipItem: (payload) => Promise<EquippedItem>,
  unequipItem: (payload) => Promise<void>,
  isEquipped: (itemId) => boolean,
  refresh: () => Promise<void>
}
```

### useInventory()
- Deprecated — re-exporta useEquipment para backwards compat

### inventory.api.ts
```
GET  /gamification/inventory/equipped → EquippedItem[]
POST /gamification/inventory/equip   → EquippedItem
POST /gamification/inventory/unequip → void
GET  /gamification/shop/purchases/:userId → UserPurchase[]
```

**Faltante:** No hay endpoint de filtrado por categoria (`/inventory/owned/:category`).

---

## 9. Documentacion UX Existente

### FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md
- Define estados: Not purchased → Comprar, Purchased → Equipar, Equipped → Quitar
- Define regla: 1 item por categoria
- Define UPSERT behavior

### FLUJO-PERFIL-NOTIFICACIONES.md
- Cubre: avatar, nombre, email, notificaciones
- NO cubre equipamiento/skins

### FLUJO-PERSONALIZACION-AVATAR.md
- **Estado:** "Propuesto (Pendiente de Implementacion)"
- Describe: equip/deequip desde inventario, reflejo inmediato en avatar
- NO implementado en UI

### CHECKLIST-ACEPTACION-TIENDA-VISUAL.md
- DDL: Done
- Seeds: Done
- API: Done
- RLS: Done (07d)
- UX flow: Propuesto (pendiente)
- Integracion: Pendiente

---

## 10. Propuesta de Integracion UI

### Opcion Recomendada: Tab "Personalizar" en EnhancedProfilePage

```
EnhancedProfilePage (5 tabs)
  ├─ Overview (sin cambios)
  ├─ Stats (sin cambios)
  ├─ History (sin cambios)
  ├─ Achievements (sin cambios)
  └─ Personalizar (NUEVO)
       ├─ Seccion "Avatar"
       │   ├─ Preview actual + boton "Cambiar"
       │   └─ Modal: DiceBear presets + items de tienda owned
       ├─ Seccion "Marco"
       │   ├─ Preview frame actual + boton "Cambiar"
       │   └─ Modal: frames owned
       ├─ Seccion "Fondo"
       │   ├─ Preview bg actual + boton "Cambiar"
       │   └─ Modal: backgrounds owned
       └─ Seccion "Titulo"
           ├─ Preview titulo actual + boton "Cambiar"
           └─ Modal: titulos owned
```

### Flujo UX Completo
```
1. Estudiante va a /profile
2. Ve tabs: Overview, Stats, History, Achievements, Personalizar
3. Click "Personalizar"
4. Ve categorias con item actual equipado:
   - Avatar: [Detective Dorado preview]  [Cambiar] [Quitar]
   - Marco: [Marco Estrellas preview]    [Cambiar] [Quitar]
   - Fondo: [Sin fondo equipado]         [Explorar tienda]
5. Click "Cambiar" en Avatar
6. Modal: Grid de avatars owned (checkmark en actual)
7. Selecciona nuevo → POST /inventory/equip → Toast "Avatar actualizado"
8. Header se actualiza (useEquipment invalidation)
9. Overview tab muestra nuevo avatar en hero section
```

---

## 11. Propagacion de Cambios Visuales

### Estrategia:
```
equipItem() en useEquipment
  → invalidateQueries(equipmentKeys.equipped)  // React Query
  → refreshUser()  // AuthStore update
  → Todos los componentes suscritos re-renderizan:
      - GamifiedHeader (avatar + frame)
      - EnhancedProfilePage hero (avatar grande)
      - Leaderboard rows (avatar mini + titulo)
```

### Componentes a Modificar:
1. **GamifiedHeader** — Importar useEquipment, renderizar avatar_url, aplicar frame CSS
2. **EnhancedProfilePage** — Agregar tab "Personalizar", integrar useEquipment en hero
3. **Leaderboard rows** — Mostrar avatar + titulo equipado

### Componente Nuevo Recomendado:
```tsx
// shared/components/AvatarDisplay.tsx
<AvatarDisplay
  avatarUrl={equippedAvatar?.assetUrl || user.avatar_url}
  frameColor={equippedFrame?.metadata?.border_color}
  size="sm" | "md" | "lg"
  fallback={getUserFullName(user).charAt(0)}
/>
```

---

## 12. Archivos a Crear/Modificar

### Modificar:
- `EnhancedProfilePage.tsx` — Agregar tab "Personalizar"
- `GamifiedHeader.tsx` — Renderizar avatar_url + frame, no iniciales
- `InventoryPage.tsx` — Mejorar agrupacion por categoria

### Crear:
- `apps/frontend/src/apps/student/components/profile/CustomizeTab.tsx`
- `apps/frontend/src/apps/student/components/profile/EquipmentCategoryCard.tsx`
- `apps/frontend/src/apps/student/components/profile/EquipmentSelectionModal.tsx`
- `apps/frontend/src/shared/components/AvatarDisplay.tsx` (reutilizable)

### Documentacion:
- Actualizar `FLUJO-PERSONALIZACION-AVATAR.md` — estado "Propuesto" → "Activo"

---

## Recomendaciones

### P0 — Critico
1. **Fix GamifiedHeader** — renderizar avatar_url en lugar de iniciales
2. **Crear AvatarDisplay** componente reutilizable con soporte frame/fallback
3. **Agregar tab "Personalizar"** a EnhancedProfilePage

### P1 — Importante
4. **Crear EquipmentSelectionModal** para seleccionar items por categoria
5. **Propagar cambios** via React Query invalidation a header/sidebar/leaderboard
6. **Mejorar InventoryPage** con agrupacion visual por categoria

### P2 — Mejora
7. **Vista preview** antes de confirmar equip (modal con side-by-side)
8. **Notificacion** al equipar ("Tu nuevo avatar se ve increible!")
9. **Link rapido** desde inventario a perfil y viceversa
