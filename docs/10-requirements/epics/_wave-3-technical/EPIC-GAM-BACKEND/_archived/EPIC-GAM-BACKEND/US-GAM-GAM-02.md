# US-GAM-GAM-02: Economia Virtual ML Coins

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND
**Modulo(s):** store, gamification, missions
**Story Points:** 8
**Prioridad:** P1
**Sprint:** Completado

## Descripcion
**Como** estudiante de K-12
**Quiero** ganar ML Coins (Maya Literacy Coins) y gastarlos en una tienda virtual
**Para** personalizar mi avatar y obtener power-ups que mejoren mi experiencia de aprendizaje

## Criterios de Aceptacion

### CA-1: Fuentes de Ingreso de ML Coins
**Given** un estudiante que realiza actividades en la plataforma
**When** completa ejercicios, misiones o desbloquea logros
**Then** el sistema otorga ML Coins segun tabla de recompensas: ejercicio completado (5-20 coins segun dificultad), mision diaria (10-30 coins), mision semanal (50-100 coins), logro desbloqueado (25-200 coins segun rareza), promocion de rango (100-500 coins)

### CA-2: Tienda Virtual con Catalogo
**Given** un estudiante que accede a la tienda virtual
**When** navega el catalogo de items
**Then** ve items organizados por categoria: avatares tematicos maya, fondos de perfil, efectos visuales, power-ups (pista extra, tiempo extra, multiplicador XP temporal), con precio en ML Coins, preview visual, y disponibilidad por rango

### CA-3: Compra de Items
**Given** un estudiante con suficientes ML Coins y el rango requerido
**When** selecciona un item y confirma la compra
**Then** el sistema descuenta ML Coins del balance, agrega el item al inventario del estudiante, registra la transaccion con detalle, y muestra confirmacion con animacion

### CA-4: Inventario del Estudiante
**Given** un estudiante con items comprados
**When** accede a su inventario personal
**Then** ve todos los items adquiridos organizados por tipo, items activos vs inactivos, items temporales con duracion restante, y puede activar/desactivar items cosmeticos

### CA-5: Items con Efecto Temporal
**Given** un estudiante que activa un power-up temporal (multiplicador XP, pista extra, tiempo extra)
**When** el power-up esta activo
**Then** el efecto se aplica durante la duracion configurada, un indicador visual muestra el tiempo restante, el efecto se desactiva automaticamente al expirar, y no se puede apilar multiples power-ups del mismo tipo

### CA-6: Balance y Historial
**Given** un estudiante autenticado
**When** consulta su balance de ML Coins
**Then** ve el balance actual, historial de transacciones (ingresos y gastos) con fecha y concepto, y totales acumulados (ganados, gastados, balance)

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, React 19, PostgreSQL 16 |
| Entidades BD | store_items, store_purchases, student_inventory, store_categories, ml_coin_transactions, ml_coin_balances |
| Endpoints API | `GET /api/v1/store/items` `GET /api/v1/store/items/:id` `POST /api/v1/store/purchase` `GET /api/v1/store/inventory/:studentId` `POST /api/v1/store/inventory/:itemId/activate` `GET /api/v1/store/balance/:studentId` `GET /api/v1/store/transactions/:studentId` |
| Componentes FE | StoreGrid, ItemCard, ItemPreview, PurchaseConfirmation, InventoryGrid, BalanceDisplay, TransactionHistory, PowerUpIndicator, ActiveEffects |
| Dependencias | US-GAM-GAM-01 (XP y Rangos), US-GAM-MUL-01 (Misiones), US-GAM-STD-01 (Portal Estudiante) |

## Definition of Done
- [ ] Catalogo de items con categorias implementado
- [ ] Sistema de compra con ML Coins funcional
- [ ] Inventario personal con items activos/inactivos
- [ ] Power-ups temporales con duracion y efectos
- [ ] Historial de transacciones completo
- [ ] Tests unitarios (cobertura >= 80%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-019, RF-GAM-020 |
| Epica padre | EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND |
