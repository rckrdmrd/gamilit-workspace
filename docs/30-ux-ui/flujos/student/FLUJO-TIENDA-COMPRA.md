---
titulo: Flujo Student - Tienda (Compra y Asignacion)
tipo: flujo
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Flujo Student - Tienda (Compra y Asignacion)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Cubre la seleccion de item en tienda, validacion de requisitos/saldo, cobro en ML Coins y alta de compra para reflejo en inventario/personalizacion.

> Flujo maestro relacionado: `FLUJO-COMPRA-INVENTARIO-EQUIPAR.md`.

## Diagrama Mermaid

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as ShopPage
    participant BE as ShopService
    participant DB as Database

    S->>FE: Click ComprarAhora
    FE->>BE: POST /gamification/shop/purchase
    BE->>DB: Valida item, stock, limites, requisitos
    BE->>DB: Verifica balance
    BE->>DB: Crea transaccion de gasto
    BE->>DB: Crea user_purchase
    BE-->>FE: Compra exitosa
    FE-->>S: Toast + refresh balance/inventario
```

## Trazabilidad

### Frontend
- `apps/frontend/src/apps/student/pages/ShopPage.tsx` (Thin Shell, 235 lines post-refactor v10.0.0)
- `apps/frontend/src/features/gamification/economy/hooks/useShopData.ts` (React Query: items, categories, purchases)
- `apps/frontend/src/features/gamification/economy/hooks/useShopPurchase.ts` (mutation + cache invalidation)
- `apps/frontend/src/apps/student/components/shop/ShopItemCard.tsx` (item card + purchase trigger)
- `apps/frontend/src/apps/student/components/shop/PurchaseModal.tsx` (confirmation dialog)
- `apps/frontend/src/features/gamification/economy/api/shopAPI.ts`
- `apps/frontend/src/features/gamification/economy/store/economyStore.ts`

### Backend
- `apps/backend/src/modules/gamification/controllers/shop.controller.ts`
- `apps/backend/src/modules/gamification/services/shop.service.ts`
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts`

### Datos
- `gamification_system.shop_items`
- `gamification_system.user_purchases`
- `gamification_system.ml_coins_transactions`
- `gamification_system.user_stats`

## Gap funcional a validar

- Cerrado por definición en flujo maestro E2E: `FLUJO-COMPRA-INVENTARIO-EQUIPAR.md`.

## Errores esperados de compra

| HTTP | Condicion | Accion UX |
|------|-----------|-----------|
| 400 | Saldo insuficiente o regla de negocio | Mostrar mensaje contextual + CTA recargar/ganar monedas |
| 404 | Item no encontrado | Refrescar catálogo y notificar indisponibilidad |
| 409 | Compra duplicada de item único activo | Mostrar estado ya adquirido |
| 500 | Error interno | Mostrar fallback y permitir reintento |
