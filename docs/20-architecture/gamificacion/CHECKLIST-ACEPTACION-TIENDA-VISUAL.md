---
titulo: Checklist - Aceptacion Tienda Visual
tipo: arquitectura
ultima_actualizacion: 2026-02-27
---

# CHECKLIST-ACEPTACION-TIENDA-VISUAL

> Checklist final de validación documental y trazabilidad para integración de tienda visual.

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## 1. Base de datos y modelo de datos

- [x] `schema-reference` alineado al DDL real de `shop_categories`, `shop_items`, `user_purchases`, `user_equipped_items`.
- [x] Relaciones usuario->compra->equipamiento definidas con FK y constraints.
- [x] Índices y constraints clave documentados para rendimiento y unicidad.
- [x] Regla de separación `effect_data` (funcional) vs `metadata` (visual) documentada.

---

## 2. Seeds reproducibles

- [x] Seeds de normalización visual (`metadata`) definidos para `prod/dev/staging`.
- [x] Seeds de ownership (`user_purchases`) definidos para `prod/dev/staging`.
- [x] Seeds de aplicación (`user_equipped_items`) definidos para `prod/dev/staging`.
- [x] `SEEDS_INVENTORY.yml` actualizado con nuevos seeds y dependencias.
- [x] Documento de seeds de tienda visual creado y enlazado.

---

## 3. API y seguridad

- [x] Endpoints de equipamiento documentados con request/response.
- [x] Validaciones de ownership y categoría documentadas.
- [x] Cobertura RLS documentada en `user_purchases` y `user_equipped_items`.
- [x] Script RLS actualizado para `user_equipped_items`.

---

## 4. UX y flujo integral

- [x] Flujo maestro E2E `compra -> inventario -> equipar` creado.
- [x] Diagrama de secuencia Mermaid integrado.
- [x] Diagrama de estados UX agregado.
- [x] Errores esperados documentados por operación.
- [x] Enlaces cruzados actualizados en flujos base.

---

## 5. Trazabilidad e inventario documental

- [x] Matriz de trazabilidad actualizada con flujo compuesto (`FL-STU-20`).
- [x] Catálogo de flujos (`README`) actualizado.
- [x] Índice de gamificación actualizado con artefactos nuevos.
- [x] Contrato canónico de metadata enlazado desde arquitectura/API/UX.

---

## 6. Criterio de salida

La documentación se considera lista para implementación cuando:
1. No hay contradicciones entre DDL y schema-reference.
2. El flujo completo compra->aplicar item puede validarse con seeds.
3. Las variantes visuales están inventariadas y aplicables a usuario.
4. Existe trazabilidad FE/BE/DB desde flujo compuesto hasta endpoints y tablas.
