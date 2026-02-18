# Plan de Implementacion Consolidado

**Fecha:** 2026-02-18 | **Basado en:** Tracks A, B, C, D

---

## Prioridades

### P0 — Bloqueantes (Integridad + Funcionalidad Minima)

| # | Item | Track | Dominio | Esfuerzo |
|---|------|-------|---------|----------|
| 1 | Crear RLS policies para `user_purchases` | C | Database | 1h |
| 2 | Reescribir `get_user_inventory_summary()` (refs a tablas inexistentes) | C | Database | 1h |
| 3 | Fix GamifiedHeader — renderizar avatar_url en lugar de iniciales | D | Frontend | 2h |
| 4 | Crear componente `<AvatarDisplay />` reutilizable (avatar + frame + fallback) | A,D | Frontend | 2h |

### P1 — Importantes (Features Core)

| # | Item | Track | Dominio | Esfuerzo |
|---|------|-------|---------|----------|
| 5 | Agregar tab "Personalizar" a EnhancedProfilePage | D | Frontend | 4h |
| 6 | Crear EquipmentSelectionModal (items por categoria) | D | Frontend | 3h |
| 7 | Crear BoostService + BoostController (activar boosts comprados) | B | Backend | 4h |
| 8 | Modificar ExerciseRewardsService para llamar `apply_xp_boost()` | B | Backend | 2h |
| 9 | Crear funcion SQL `apply_coins_boost()` | B | Database | 1h |
| 10 | Crear useActiveBoosts hook + integrar con PowerUpBar | B | Frontend | 3h |
| 11 | Propagar equip changes via React Query a header/leaderboard | A,D | Frontend | 2h |
| 12 | Establecer expires_at en ShopService para consumibles | B | Backend | 1h |

### P2 — Mejoras (UX + Catalogo)

| # | Item | Track | Dominio | Esfuerzo |
|---|------|-------|---------|----------|
| 13 | Crear assets visuales reales o fallbacks (avatars, frames, badges) | A | Design | 4h |
| 14 | Agregar boton "Activar" en InventoryPage para boosts | B | Frontend | 2h |
| 15 | Mejorar InventoryPage con agrupacion visual por categoria | D | Frontend | 2h |
| 16 | Indicador visual de boost activo durante ejercicio | B | Frontend | 2h |
| 17 | Ampliar catalogo: +5 avatars, +3 frames, +2 backgrounds, color themes | A | Database+Design | 4h |
| 18 | Llenar campo multiplier en ml_coins_transactions | B | Backend | 1h |
| 19 | Titulo equipado visible en leaderboard | A | Frontend | 2h |
| 20 | Notificacion de expiracion de boost | B | Frontend | 1h |

---

## Dependencias

```
P0-1 (RLS) ──────────────── Independiente
P0-2 (Fix funcion) ──────── Independiente
P0-3 (Fix header) ───────── Depende de P0-4 (AvatarDisplay)
P0-4 (AvatarDisplay) ────── Independiente

P1-5 (Tab Personalizar) ──→ P1-6 (SelectionModal) → P1-11 (Propagacion)
P1-7 (BoostService) ──────→ P1-8 (XP integration) → P1-9 (Coins function)
P1-10 (useActiveBoosts) ──→ Depende de P1-7
P1-12 (expires_at) ───────→ Depende de P1-7
```

---

## Sprints Sugeridos

### Sprint A: Integridad + Avatar (1 semana)
- P0-1: RLS user_purchases
- P0-2: Fix get_user_inventory_summary()
- P0-4: Crear AvatarDisplay component
- P0-3: Fix GamifiedHeader con AvatarDisplay
- P1-11: Propagacion React Query

### Sprint B: Equipamiento UI (1 semana)
- P1-5: Tab "Personalizar" en perfil
- P1-6: EquipmentSelectionModal
- P1-15: Mejorar InventoryPage categorias

### Sprint C: Boosts Integration (1 semana)
- P1-7: BoostService + BoostController
- P1-8: ExerciseRewardsService integration
- P1-9: apply_coins_boost() SQL
- P1-12: expires_at en ShopService
- P1-10: useActiveBoosts hook + PowerUpBar

### Sprint D: Polish (1 semana)
- P2-13: Assets visuales
- P2-14: Boton activar en inventory
- P2-16: Indicador boost activo
- P2-17: Ampliar catalogo
- P2-19: Titulo en leaderboard
- P2-20: Notificacion expiracion

---

## Metricas de Exito

| Metrica | Antes | Despues |
|---------|-------|---------|
| Tablas con RLS (gamification) | 8/10 | 10/10 |
| Funciones DDL funcionales | -1 rota | 0 rotas |
| Items equipados visibles en UI | 0 componentes | 4+ (header, perfil, leaderboard, inventory) |
| Boosts funcionales E2E | 0% | 100% (compra → activar → multiplicar → expirar) |
| Catalogo items equipables | 15 | 25+ |
| Tabs en perfil | 4 | 5 (+ Personalizar) |

---

## Resumen de Issues por Severidad

### CRITICOS (2)
1. RLS faltante en user_purchases (Track C)
2. Funcion get_user_inventory_summary() referencia tablas inexistentes (Track C)

### ALTOS (4)
3. Header muestra iniciales en vez de avatar (Track D)
4. 0 componentes renderizan items equipados (Track A)
5. No hay endpoint de activacion de boosts (Track B)
6. ExerciseRewardsService no aplica multiplicadores (Track B)

### MEDIOS (5)
7. Perfil sin tab de personalizacion (Track D)
8. PowerUpBar "Activos" siempre vacio (Track B)
9. apply_coins_boost() no existe (Track B)
10. expires_at nunca se establece para consumibles (Track B)
11. Todos los assets son placeholders (Track A)

### BAJOS (4)
12. Catalogo limitado (15 items equipables) (Track A)
13. InventoryPage sin agrupacion por categoria (Track D)
14. Titulo no visible en leaderboard (Track A)
15. FLUJO-PERSONALIZACION-AVATAR en estado "Propuesto" (Track D)
