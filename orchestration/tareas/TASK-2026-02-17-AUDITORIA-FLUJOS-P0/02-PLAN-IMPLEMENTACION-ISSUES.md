# 02-PLAN-IMPLEMENTACION-ISSUES.md

**Fecha:** 2026-02-17  
**Tarea:** TASK-2026-02-17-AUDITORIA-FLUJOS-P0  
**Estado:** Completado

---

## Backlog de issues tecnicos

### ISSUE-P0-STORE-001

**Titulo:** Hacer bloqueante `required_achievement_id` en compras de tienda.  
**Flujo:** FL-STU-03  
**Capa:** Backend + tests

**Criterios de aceptacion:**

- Si item requiere logro y usuario no lo tiene, compra retorna error de negocio.
- Cobertura de tests para caso cumple/no cumple.
- Documentacion de flujo y matriz actualizadas.

**Estado actual:** IMPLEMENTADO en `shop.service.ts` (validacion bloqueante con `user_achievements`).

---

### ISSUE-P0-STORE-002

**Titulo:** Atomicidad de `purchaseItem()` para evitar estados parciales.  
**Flujo:** FL-STU-03  
**Capa:** Backend/DB

**Criterios de aceptacion:**

- Operaciones de cobro, balance y purchase se ejecutan en unidad transaccional.
- En fallo intermedio no quedan registros inconsistentes.
- Prueba de error simulado verifica rollback.

**Estado actual:** IMPLEMENTADO en `shop.service.ts` (`manager.transaction(...)`).

---

### ISSUE-P0-MISS-001

**Titulo:** Atomicidad en claim de misiones.  
**Flujo:** FL-STU-04  
**Capa:** Backend/DB

**Criterios de aceptacion:**

- Estado de mision (`claimed`) y entrega de recompensas quedan consistentes.
- No existe claim exitoso con XP/Coins parciales.
- Tests de integración para casos de falla.

**Estado actual:** IMPLEMENTADO en `missions.service.ts` (ruta transaccional + marcado de misión después de persistir rewards).

---

### ISSUE-P1-REV-001

**Titulo:** Garantizar consistencia `completeReview()` + rewards.  
**Flujo:** FL-TCH-01  
**Capa:** Backend

**Criterios de aceptacion:**

- Definir politica de atomicidad o compensacion explicita.
- Si rewards falla, estado final queda trazable y recuperable.
- Notificacion/documentacion reflejan estado real de recompensas.

**Estado actual:** IMPLEMENTADO en `manual-review.service.ts` (`completeReview` marca `completed` solo tras distribución de rewards).

---

## Orden recomendado

1. ISSUE-P0-STORE-001
2. ISSUE-P0-STORE-002
3. ISSUE-P0-MISS-001
4. ISSUE-P1-REV-001

---

## Dependencias de gobernanza

- `orchestration/directivas/simco/SIMCO-WORK-ITEMS.md`
- `orchestration/agents/perfiles/_MAP.md`
- `docs/30-ux-ui/flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md`
