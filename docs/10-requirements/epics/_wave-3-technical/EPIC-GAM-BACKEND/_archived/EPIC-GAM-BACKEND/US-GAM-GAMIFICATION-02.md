# US-GAM-GAMIFICATION-02: Economia Virtual con ML Coins y Tienda

**Prefijo:** GAM | **Modulo:** store | **Prioridad:** P2 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** estudiante con ML Coins acumulados,
**Quiero** navegar la tienda virtual y comprar items (avatares maya, power-ups, efectos),
**Para** personalizar mi perfil y obtener ventajas temporales en ejercicios.

---

## Criterios de Aceptacion

### Escenario 1: Navegar tienda virtual
**Given** un estudiante autenticado con 350 ML Coins de saldo
**When** accede a la seccion "Tienda" del portal estudiante
**Then** ve items organizados por categoria (avatares, marcos, power-ups, efectos)
**And** cada item muestra: nombre, imagen, precio en ML Coins, descripcion
**And** items que no puede pagar estan visibles pero deshabilitados

### Escenario 2: Comprar item permanente
**Given** un estudiante con 350 ML Coins que quiere comprar avatar "Guerrero Maya" (200 ML)
**When** presiona "Comprar" y confirma
**Then** se descuentan 200 ML Coins de su saldo (nuevo saldo: 150 ML)
**And** el item aparece en su inventario
**And** puede equipar el avatar inmediatamente
**And** la transaccion se registra en historial

### Escenario 3: Usar power-up temporal
**Given** un estudiante que compro un power-up "Multiplicador XP 1.5x" (100 ML, duracion 1 hora)
**When** activa el power-up desde su inventario
**Then** durante la siguiente hora, todo XP ganado se multiplica por 1.5x adicional
**And** muestra temporizador visible del power-up activo
**And** al expirar, el multiplicador vuelve a la normalidad

---

## Definition of Done

- [ ] Catalogo de items con categorias funciona
- [ ] Compra descuenta ML Coins correctamente
- [ ] Items permanentes se agregan al inventario
- [ ] Power-ups temporales funcionan con timer
- [ ] Saldo no puede ser negativo (validacion)
- [ ] Historial de transacciones completo
- [ ] Tests para purchase flow y balance validation
