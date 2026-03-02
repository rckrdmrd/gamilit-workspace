---
title: Flujo de Rendering de Cosméticos Equipados
status: activo
last_updated: "2026-03-01"
---

# Flujo de Rendering de Cosméticos Equipados

[<-- Volver al Índice](../_INDEX.md) | Relacionado: [DISENO-SISTEMA-EQUIPAMIENTO.md](./DISENO-SISTEMA-EQUIPAMIENTO.md)

---

## 1. Pipeline Completo

```
┌─────────────────────────────────────────────────────────────┐
│ DATABASE                                                      │
│  shop_items.metadata + shop_items.effect_data                 │
│  (normalizados via 17-shop_items_metadata_normalization.sql)  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    mergeVisualConfig()
                    (backend runtime utility)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ API RESPONSE                                                  │
│  GET /gamification/inventory/equipped                         │
│  → EquippedItem[] con metadata enriquecida                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ useEquipment() — React Query                                  │
│  staleTime: 5min, gcTime: 30min                               │
│  queryKey: ['equipment', 'equipped', userId]                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ useEquippedVisuals() — useMemo extraction                     │
│  extractVisuals(equippedItems) → EquippedVisuals              │
│  Switch por metadata.type → 5 categorías visuales             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┬───────────┐
              ▼            ▼            ▼           ▼
     ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ Enhanced   │ │ Rank     │ │ Enhanced │ │ Gamified │
     │ Profile    │ │ Progress │ │ Stats    │ │ Header   │
     │ Page       │ │ Widget   │ │ Grid     │ │          │
     └─────┬──────┘ └──────────┘ └──────────┘ └────┬─────┘
           │                                         │
           ▼                                         ▼
     ┌──────────┐                              ┌──────────┐
     │ Profile  │                              │ Avatar   │
     │ Hero     │                              │ Display  │
     └──────────┘                              └──────────┘
```

---

## 2. Tipos Visuales Extraídos

```typescript
interface EquippedVisuals {
  avatar: VisualAvatar | null;    // src, animated, glowColor
  frame: VisualFrame | null;      // borderColor, cssClass, assetUrl, animated
  background: VisualBackground | null; // assetUrl, animated
  title: VisualTitle | null;      // text, color, name
  badge: VisualBadge | null;      // assetUrl, animated, name
}
```

### Mapeo metadata.type → Propiedades Visuales

| metadata.type | Propiedades extraídas | Origen en metadata |
|---------------|----------------------|-------------------|
| `avatar` | `src`, `animated`, `glowColor` | `asset_url`, `animated`, `glow_color` |
| `profile_frame` | `borderColor`, `cssClass`, `assetUrl`, `animated` | `border_color`, `css_class`, `asset_url`, `animated` |
| `profile_background` | `assetUrl`, `animated` | `asset_url`, `animated` |
| `title` | `text`, `color`, `name` | `display_text`, `color`, `item.name` |
| `badge` | `assetUrl`, `animated`, `name` | `asset_url`, `animated`, `item.name` |

---

## 3. Consumidores por Componente

| Componente | avatar | frame | background | title | badge |
|------------|--------|-------|------------|-------|-------|
| `EnhancedProfilePage` → `ProfileHero` | `src` | `borderColor` | `assetUrl` | `text`, `color`, `name` | `assetUrl`, `name` |
| `RankProgressWidget` | — | `borderColor`, `cssClass`, `assetUrl` | — | — | `assetUrl`, `name` |
| `EnhancedStatsGrid` | — | `borderColor` | — | — | `assetUrl` |
| `GamifiedHeader` → `AvatarDisplay` | `src`, `glowColor` | `borderColor`, `cssClass`, `assetUrl` | — | — | — |

---

## 4. Cadena de Prioridad de Frame

El renderizado de frames cosméticos sigue una cadena de prioridad consistente (patron establecido en `AvatarDisplay.tsx`):

```
Prioridad 1: SVG overlay (frame.assetUrl)
  → <img> overlay absoluto posicionado (pointer-events-none, z-20)
  → Si carga falla → caer a prioridad 2

Prioridad 2: CSS class (frame.cssClass)
  → Clase Tailwind aplicada al container (e.g., 'ring-4 ring-gold animate-pulse')
  → Si no existe → caer a prioridad 3

Prioridad 3: Border color (frame.borderColor)
  → Inline style: borderColor, borderWidth, borderStyle
  → Si no existe → caer a prioridad 4

Prioridad 4: Default
  → Clase border por defecto del componente (e.g., rankInfo.border en RankProgressWidget)
```

### Implementación por Componente

| Componente | P1 (SVG) | P2 (CSS) | P3 (border) | P4 (default) |
|------------|----------|----------|-------------|--------------|
| `AvatarDisplay` | `frameSrc` prop | `frameClass` prop | `frameColor` prop | sin borde |
| `RankProgressWidget` | `<img>` overlay z-20 | `frame.cssClass` en className | `frame.borderColor` inline | `rankInfo.border` |
| `EnhancedStatsGrid` | — | — | `frame.borderColor` inline | `border-yellow-200` |
| `ProfileHero` | — | — | `equippedFrameColor` inline | `rgba(255,255,255,0.3)` |

---

## 5. Fallbacks y Error Handling

| Escenario | Comportamiento |
|-----------|---------------|
| Avatar cosmético no equipado | Usa `user.avatar_url`, si falla → icono `<User>` |
| Badge image falla (onError) | Fallback a `<span>` con nombre del badge |
| Background image falla (onError) | Oculta overlay, muestra gradient default |
| Frame SVG falla (onError) | Cae a siguiente prioridad (CSS class → border color → default) |
| No hay items equipados | Hook retorna `{ avatar: null, frame: null, ... }`, UI usa defaults |

---

## 6. Referencias

- **Backend:** [DISENO-SISTEMA-EQUIPAMIENTO.md](./DISENO-SISTEMA-EQUIPAMIENTO.md) — mergeVisualConfig(), entity design
- **API:** `docs/40-api/ENDPOINTS-INVENTORY-EQUIP.md` — 4 endpoints de inventario/equipamiento
- **Metadata estándar:** `docs/20-architecture/gamificacion/SEEDS-TIENDA-VISUAL.md` — 9 tipos visuales canonicos
- **Portal Student:** `docs/60-portals/student/student-guide/01-ARQUITECTURA.md` — sección 2.3
- **Hook source:** `apps/frontend/src/features/gamification/social/hooks/useEquippedVisuals.ts`
- **AvatarDisplay source:** `apps/frontend/src/shared/components/AvatarDisplay.tsx`
