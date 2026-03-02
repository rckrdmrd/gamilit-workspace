---
titulo: "Shop Cosmetics Integration Fix"
fecha: "2026-03-01"
tipo: "BUG_FIX"
estado: "COMPLETADO"
archivos_modificados: 8
build_errors: 0
lint_errors: 0
typecheck_errors: 0
---

# COSMETICS-FIX-REPORT

## Contexto

La sesion anterior (TASK-2026-02-28-SHOP-INTEGRATION) integro cosmeticos de la tienda en RankProgressWidget y GamifiedHeader. Se identificaron 6 bugs donde los cosmeticos equipados no se mostraban correctamente en ProfileHero y RankProgressWidget.

## Bugs Identificados y Corregidos

| # | Componente | Bug | Severidad | Estado |
|---|-----------|-----|-----------|--------|
| B1 | `ProfileHero.tsx:87` | Avatar equipado de la tienda IGNORADO — solo usaba `user.avatar_url`, no recibia ni usaba avatar cosmetico | CRITICO | CORREGIDO |
| B2 | `EnhancedProfilePage.tsx:101` | Prop `equippedBackground.name` mapeaba incorrectamente desde `title?.name` en vez de string descriptivo | MEDIO | CORREGIDO |
| B3 | `ProfileHero.tsx` | No recibia prop `equippedAvatarUrl` — la interface `ProfileHeroProps` no lo declaraba | CRITICO | CORREGIDO |
| B4 | `EnhancedProfilePage.tsx` | No pasaba `avatar` de `useEquippedVisuals()` a `ProfileHero` | CRITICO | CORREGIDO |
| B5 | `RankProgressWidget.tsx:82-86` | Frame border solo aplicaba `borderColor` — no soportaba `cssClass` ni `assetUrl` del frame (SVG overlay) | BAJO | CORREGIDO |
| B6 | `GamifiedHeader.tsx:62-66` | Avatar+Frame funcional via AvatarDisplay — ya estaba correcto | N/A | VERIFICADO OK |

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `apps/frontend/src/apps/student/components/profile/ProfileHero.tsx` | +prop `equippedAvatarUrl`, avatar render usa `equippedAvatarUrl \|\| user.avatar_url` |
| `apps/frontend/src/apps/student/pages/EnhancedProfilePage.tsx` | Extrae `avatar` de `useEquippedVisuals()`, pasa `equippedAvatarUrl={avatar?.src}`, fix `background.name` |
| `apps/frontend/src/apps/student/components/dashboard/RankProgressWidget.tsx` | Frame priority chain: SVG overlay > CSS class > border color > rank default. Nuevo `<img>` overlay |

## Archivos Verificados (sin cambios)

| Archivo | Estado |
|---------|--------|
| `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx` | B6 — Ya funcional (avatar+frame via AvatarDisplay) |
| `apps/frontend/src/shared/components/AvatarDisplay.tsx` | Referencia — patron de frame rendering correcto |
| `apps/frontend/src/features/gamification/social/hooks/useEquippedVisuals.ts` | Correcto — 5 tipos extraidos correctamente |
| `apps/frontend/src/apps/student/components/dashboard/EnhancedStatsGrid.tsx` | Correcto — usa frame+badge para rank badge area |

## Detalle de Correcciones

### B1+B3: ProfileHero — Avatar cosmetico
- **Antes:** Solo usaba `user.avatar_url` como fuente del avatar
- **Despues:** Nueva prop `equippedAvatarUrl?: string` con fallback a `user.avatar_url`
- **Logica:** `equippedAvatarUrl || user?.avatar_url` — prioriza cosmetico equipado

### B2: EnhancedProfilePage — Background name
- **Antes:** `name: title?.name || ''` (referenciaba titulo en vez de fondo)
- **Despues:** `name: 'Fondo equipado'` (string descriptivo correcto)

### B4: EnhancedProfilePage — Avatar no pasado
- **Antes:** `const { frame, background, title, badge } = useEquippedVisuals()` (avatar no extraido)
- **Despues:** `const { avatar, frame, background, title, badge } = useEquippedVisuals()` + `equippedAvatarUrl={avatar?.src}`

### B5: RankProgressWidget — Frame SVG overlay
- **Antes:** Solo `borderColor` via inline style
- **Despues:** Priority chain completo siguiendo patron de AvatarDisplay:
  1. `frame.assetUrl` → `<img>` overlay absoluto (z-20) sobre la card
  2. `frame.cssClass` → Tailwind class en el container
  3. `frame.borderColor` → inline border style
  4. Rank default → Tailwind border class por defecto

## Validaciones

| Check | Resultado |
|-------|-----------|
| `npm run build` | 0 errors (20.75s) |
| `npm run lint` | 0 errors (98 warnings pre-existentes) |
| `npm run typecheck` | 0 errors |

## Consumidores de useEquippedVisuals (6 archivos)

1. `EnhancedProfilePage.tsx` — avatar, frame, background, title, badge → ProfileHero
2. `RankProgressWidget.tsx` — frame, badge
3. `EnhancedStatsGrid.tsx` — frame, badge (rank badge area)
4. `GamifiedHeader.tsx` — avatar, frame → AvatarDisplay
5. `useEquipment.ts` — re-export
6. `useEquippedVisuals.ts` — definicion del hook

---

## Fase 2: Auditoria Post-Correccion (4 subagentes Haiku, paralelo)

### Estandares de Codigo (PASS con pre-existentes)

| Criterio | ProfileHero | EnhancedProfilePage | RankProgressWidget |
|----------|-------------|--------------------|--------------------|
| Export pattern | PASS | PASS | PASS |
| TypeScript typing | PASS | PASS | PASS |
| Accessibility (a11y) | PASS | PASS | PASS |
| Error handling | PASS | PASS | PASS |
| PageShell (ADR-046) | N/A | PASS | N/A |
| Performance | PASS | PASS | PASS |
| Responsive (ADR-050) | 2 pre-existentes | PASS | 2 pre-existentes |

**Violaciones responsive pre-existentes (NO introducidas por esta tarea):**
- ProfileHero `p-8` sin responsive scaling, stats grid sin mobile collapse
- RankProgressWidget `p-6` sin responsive, XP grid sin mobile collapse
- **Accion:** Documentar para futura tarea de responsive remediation

### Alineacion Arquitectura (4 gaps corregidos)

| Gap | Estado |
|-----|--------|
| Hooks doc listaba 3/6 consumidores | CORREGIDO → 6 consumidores documentados |
| Arquitectura portal no mencionaba ProfileHero/EnhancedStatsGrid como consumidores | CORREGIDO → anotaciones `[useEquippedVisuals]` agregadas |
| Faltaba diagrama flujo rendering cosmeticos | CREADO → `docs/20-architecture/gamificacion/FLUJO-RENDERING-COSMETICOS.md` |
| Frame priority chain no documentada en arquitectura | DOCUMENTADO → seccion 2.3 en 01-ARQUITECTURA.md + seccion 4 en FLUJO-RENDERING |

### SOLID y Patrones de Diseno

| Principio | Hallazgo | Severidad | Tipo |
|-----------|----------|-----------|------|
| SRP | ProfileHero 7+ responsabilidades | MEDIO | PRE-EXISTENTE |
| OCP | Prop drilling cosmeticos (4 props) | MEDIO | PRE-EXISTENTE |
| DRY | Badge rendering duplicado (ProfileHero + RankProgressWidget) | MEDIO | PRE-EXISTENTE |
| ISP | ProfileHeroProps mezcla dominios (user + cosmetics) | BAJO | PRE-EXISTENTE |
| **Hook design** | useEquippedVisuals: Strategy + Factory + Adapter | PASS | CORRECTO |
| **Composition** | Todos los componentes usan composicion | PASS | CORRECTO |

**Nota:** Todos los concerns SOLID son pre-existentes (no introducidos por esta tarea). Se documentan para futura refactorizacion.

### Inventarios (2 discrepancias corregidas)

| Discrepancia | Correccion |
|-------------|------------|
| FRONTEND_INVENTORY `mecanicas_ejercicio: 30` (deberia ser 29) | CORREGIDO → 29 |
| MASTER_INVENTORY ref `FRONTEND_INVENTORY.yml (v12.5.0)` stale | CORREGIDO → v12.5.3 |

## Archivos Modificados (Fase 2 — Documentacion)

| Archivo | Cambio |
|---------|--------|
| `docs/60-portals/student/student-guide/03-HOOKS-ESTADO.md` | 3→6 consumidores de useEquippedVisuals |
| `docs/60-portals/student/student-guide/01-ARQUITECTURA.md` | Anotaciones cosmeticos en tree + seccion 2.3 pipeline |
| `docs/20-architecture/gamificacion/FLUJO-RENDERING-COSMETICOS.md` | NUEVO — diagrama flujo, 5 categorias, priority chain |
| `orchestration/inventarios/MASTER_INVENTORY.yml` | Fix FRONTEND ref v12.5.0→v12.5.3 |
| `orchestration/inventarios/FRONTEND_INVENTORY.yml` | Fix mecanicas 30→29 |

## Subagentes Utilizados

| Fase | Subagentes | Modelo | Paralelo | Descripcion |
|------|-----------|--------|----------|-------------|
| 1 (Codigo) | — | Opus 4.6 | — | Lectura y correccion directa (6 archivos leidos, 3 editados) |
| 2 (Validacion) | 1 | Haiku | No | Build + Lint + Typecheck |
| 3 (Auditoria) | 4 | Haiku | Si | Estandares, arquitectura, SOLID, inventarios |
| 4 (Doc fixes) | — | Opus 4.6 | — | Correcciones documentacion (5 archivos) |
| **Total** | **5 subagentes** | **4 Haiku + 1 Opus** | | 8 archivos modificados total |
