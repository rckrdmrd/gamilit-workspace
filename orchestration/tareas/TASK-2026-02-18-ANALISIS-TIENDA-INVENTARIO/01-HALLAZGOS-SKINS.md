# Track A: Hallazgos — Skins y Cosmeticos Equipables

**Fecha:** 2026-02-18 | **Estado:** Completo

---

## Resumen Ejecutivo

El sistema de equipamiento cosmetico tiene **backend 100% funcional** (DB + API + hooks), pero **0% de renderizado visual**. Los items se pueden equipar desde InventoryPage pero no se reflejan en ninguna parte visible de la plataforma.

---

## 1. Inventario de Items Equipables (15 de 20)

### Cosmetics (5 items) — Visualmente equipables
| Item | Rarity | Precio | metadata.type | asset_url |
|------|--------|--------|---------------|-----------|
| Avatar Detective Dorado | legendary | 500 ML | `avatar` | `/assets/avatars/detective-gold.png` |
| Marco Lector Experto | epic | 300 ML | `profile_frame` | `/assets/frames/expert-reader.png` |
| Fondo Biblioteca Magica | rare | 150 ML | `profile_background` | `/assets/backgrounds/magic-library.gif` |
| Avatar Buho Sabio | common | 50 ML | `avatar` | `/assets/avatars/wise-owl.png` |
| Marco Estrellas | common | 75 ML | `profile_frame` | `/assets/frames/stars.png` |

### Profile (5 items) — Visualmente equipables
| Item | Rarity | Precio | metadata.type | display_text / asset_url |
|------|--------|--------|---------------|--------------------------|
| Titulo "Maestro Lector" | legendary | 400 ML | `title` | "Maestro Lector" (color: #FFD700) |
| Titulo "Explorador de Historias" | epic | 250 ML | `title` | "Explorador de Historias" (color: #8B5CF6) |
| Badge Detective Elite | rare | 200 ML | `badge` | `/assets/badges/detective-elite.png` |
| Titulo "Aprendiz Curioso" | common | 100 ML | `title` | "Aprendiz Curioso" (color: #3B82F6) |
| Badge Primer Logro | common | 50 ML | `badge` | `/assets/badges/first-achievement.png` |

### Guild (4 items) — Equipables a nivel de gremio
| Item | Rarity | Precio | metadata.type | asset_url |
|------|--------|--------|---------------|-----------|
| Bandera Dorada de Gremio | legendary | 600 ML | `guild_banner` | `/assets/guild/golden-banner.png` |
| Emblema Dragon Lector | epic | 350 ML | `guild_emblem` | `/assets/guild/dragon-emblem.png` |
| Escudo del Conocimiento | rare | 200 ML | `guild_shield` | `/assets/guild/knowledge-shield.png` |
| Estandarte Basico | common | 100 ML | `guild_banner` | `/assets/guild/basic-banner.png` |

### Social (1 equipable + 3 no-persistentes)
- Pack Emojis Premium (epic, 200 ML) — `emoji_pack` (stateful, equipable)
- Sticker Celebracion, Efecto Confeti, Pack Emojis Basico — single-use/no-persistentes

### Consumables (2 items) — NO equipables
- Boost XP 2x, Boost Coins 1.5x — analizados en Track B

---

## 2. Valores de metadata.type

| Type | Equipable | Donde se renderiza | Items |
|------|-----------|-------------------|-------|
| `avatar` | Si | Header (icono), Perfil (grande), Leaderboard (mini) | 2 |
| `profile_frame` | Si | Borde del avatar en perfil/header | 2 |
| `profile_background` | Si | Fondo de pagina de perfil | 1 |
| `title` | Si | Junto al nombre en perfil/leaderboard | 3 |
| `badge` | Si | Seccion badges en perfil/leaderboard | 2 |
| `guild_banner` | Si (guild) | Header de pagina de gremio | 2 |
| `guild_emblem` | Si (guild) | Icono principal del gremio | 1 |
| `guild_shield` | Si (guild) | Acento visual del gremio | 1 |
| `emoji_pack` | Si | Menu de chat/mensajeria | 1 |
| `xp_boost` | No | N/A (consumible) | 1 |
| `coins_boost` | No | N/A (consumible) | 1 |

---

## 3. Flujo de Datos Actual (DB → Backend → Frontend → UI)

```
user_equipped_items (DB)
         |
InventoryService.getEquippedItems() (Backend)
         |
GET /gamification/inventory/equipped → EquippedItem[]
         |
useEquipment() hook (Frontend, React Query)
         |
equippedItems: EquippedItem[] (cache 5min staleTime)
         |
UI Component: ??? ← AQUI SE ROMPE. Ningun componente renderiza.
```

### getEquippedItemsMap() — Retorna:
```typescript
{
  cosmetics: { itemId, name, assetUrl, type: "avatar", data: {...} },
  profile: { itemId, name, assetUrl, type: "badge", data: {...} }
}
```

---

## 4. Estado de Componentes UI

| Componente | Lee equippedItems? | Renderiza cosmeticos? |
|-----------|--------------------|-----------------------|
| InventoryPage | Si (useEquipment) | Solo boton "Equipped" (estado), NO visual |
| GamifiedHeader | NO | NO — muestra iniciales, no avatar |
| EnhancedProfilePage | NO | NO — avatar estatico DiceBear |
| GamilitSidebar | NO | NO — solo navegacion |
| Leaderboard | NO | NO — probablemente iniciales |
| AchievementCard | NO | NO — irrelevante |

---

## 5. Assets Visuales

**Estado: TODOS SON PLACEHOLDERS**

Todas las URLs en seeds (`/assets/avatars/...`, `/assets/frames/...`, etc.) apuntan a paths que **NO existen** en `apps/frontend/public/`. No hay archivos PNG/GIF reales.

---

## 6. Items Faltantes para Sistema de Skins Significativo

### Alta Prioridad
- **+5 avatars** (solo 2 actualmente — insuficiente para engagement)
- **Color Themes** (0 items) — `profile_theme` con primary/accent/dark_mode
- **Text Effects** (0 items) — estilos CSS para nombres (glow, shadow, rainbow)

### Media Prioridad
- **Animated Avatars** (todos son estaticos PNG)
- **Chat Bubble Skins** (0 items)
- **+3 backgrounds** (solo 1 actualmente)

---

## 7. Recomendaciones

1. **P0:** Crear componente `<AvatarDisplay />` reutilizable que lea equipped items y renderice avatar + frame
2. **P0:** Integrar `useEquipment()` en GamifiedHeader para mostrar avatar equipado
3. **P0:** Agregar tab "Personalizar" en EnhancedProfilePage con items equipados por categoria
4. **P1:** Crear assets visuales reales (o usar fallbacks con DiceBear/emoji)
5. **P1:** Propagar cambios de equipamiento a leaderboard
6. **P2:** Ampliar catalogo de items (al menos 30 total, actualmente 15 equipables)
