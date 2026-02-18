# ANÁLISIS DE IMPACTO Y CUMPLIMIENTO NORMATIVO: SISTEMA DE EQUIPAMIENTO

**Fecha:** 2026-02-17
**Referencia:** TASK-2026-02-17-GAMIFICATION-SKINS
**Estado:** Validación Pre-Implementación

---

## 1. Resumen de la Iniciativa
Implementación del sistema de "Personalización de Avatar" (Equipamiento de Skins) para cerrar la brecha funcional detectada en el módulo de Gamificación.

**Alcance:**
- **BD:** Nueva tabla `user_equipped_items`.
- **Backend:** Nuevo controlador y servicio de inventario.
- **Frontend:** Interfaz de equipamiento y actualización visual del avatar.

---

## 2. Matriz de Cumplimiento Normativo (DDL)
*Referencia: orchestration/directivas/simco/SIMCO-DDL.md*

| Objeto Propuesto | Regla SIMCO | Cumplimiento | Validación Planificada |
| :--- | :--- | :--- | :--- |
| `21-user_equipped_items.sql` | `snake_case` en nombre de archivo y tabla | ✅ `user_equipped_items` | Revisión visual y `recreate-database.sh` |
| PK | `UUID DEFAULT gen_random_uuid()` | ✅ Incluido en diseño | Revisión DDL |
| Auditoría | `equipped_at timestamptz` | ✅ Incluido | Revisión DDL |
| Constraints | FKs explícitas + Índices | ✅ FK a `profiles`, `shop_items` | Test de integridad referencial |
| Lógica Core | Unicidad por categoría | ✅ `UNIQUE INDEX (user_id, category_id)` | Test de inserción duplicada |
| Documentación | `COMMENT ON TABLE/COLUMN` | ✅ Incluido en diseño | Revisión DDL |
| **Prohibición** | NO migraciones (`alter table`) | ✅ Se creará archivo DDL nuevo | Ejecución de carga limpia |

---

## 3. Matriz de Cumplimiento Normativo (Backend)
*Referencia: orchestration/directivas/simco/SIMCO-BACKEND.md*

| Objeto Propuesto | Regla SIMCO | Cumplimiento | Validación Planificada |
| :--- | :--- | :--- | :--- |
| `UserEquippedItem` Entity | `@Entity` decorador, mapeo exacto a DDL | ✅ Mapeo 1:1 con tabla | `npm run build` |
| `InventoryService` | Inyección `@InjectRepository`, manejo de `GamificationError` | ✅ Diseño modular | Tests unitarios |
| `InventoryController` | Swagger `@ApiTags`, DTOs validados | ✅ Endpoints documentados | `npm run start:dev` y Swagger UI |
| `EquipItemDto` | `class-validator` (`@IsUUID`) | ✅ Validación estricta | Test de payload inválido |
| **Impacto Existente** | `AuthService.getProfile` | Inyección limpia de `InventoryService` | Test de regresión en Login |

---

## 4. Matriz de Cumplimiento Normativo (Frontend)
*Referencia: orchestration/directivas/simco/SIMCO-FRONTEND.md*

| Objeto Propuesto | Regla SIMCO | Cumplimiento | Validación Planificada |
| :--- | :--- | :--- | :--- |
| `inventory.api.ts` | Tipado estricto request/response | ✅ Interfaces alineadas a DTOs | `npm run typecheck` |
| `useInventory.ts` | Hook encapsulado (loading/error states) | ✅ Lógica separada de UI | Revisión de código |
| `InventoryPage.tsx` | Componente funcional + Props | ✅ Uso de componentes UI base | `npm run lint` |
| **Impacto Existente** | `useAuthStore` | Actualización de estado global | Test de flujo E2E |

---

## 5. Análisis de Dependencias y Riesgos

### 5.1 Dependencias de Objetos
*   **`shop_items` (BD):** La nueva tabla depende de que existan items.
    *   *Mitigación:* Los seeds deben ejecutarse en orden (`18-shop_items.sql` antes de `21-user_equipped_items.sql` si hubiera seeds de equipamiento).
*   **`AuthService` (BE):** Dependencia circular potencial entre `AuthModule` y `GamificationModule`.
    *   *Mitigación:* Usar `forwardRef(() => GamificationModule)` en `AuthModule` si es necesario, o exponer un servicio público en `GamificationModule`.

### 5.2 Riesgos de Regresión
*   **Login Lento:** Al agregar la consulta de items equipados al login, podría aumentar la latencia.
    *   *Mitigación:* La consulta debe ser eficiente (Indexada por `user_id`).
*   **Estado Frontend Desincronizado:** Si se equipa un item pero el `AuthStore` no se actualiza, el usuario no verá el cambio hasta recargar.
    *   *Mitigación:* El endpoint `equip` debe devolver el estado actualizado del inventario para refrescar el store localmente.

---

## 6. Plan de Implementación Faseada

1.  **Fase 1: Base de Datos (DDL)**
    *   Crear `21-user_equipped_items.sql`.
    *   Ejecutar `recreate-database.sh`.
    *   Validar existencia de tabla y constraints.

2.  **Fase 2: Backend (Core)**
    *   Crear Entity `UserEquippedItem`.
    *   Crear DTOs `EquipItemDto`.
    *   Crear `InventoryService` y `InventoryController`.
    *   Registrar en `GamificationModule`.
    *   Validar endpoints con Swagger.

3.  **Fase 3: Integración Backend**
    *   Modificar `AuthService` para incluir `equipped_items` en `getProfile`.
    *   Validar payload de login.

4.  **Fase 4: Frontend**
    *   Crear tipos y servicio API.
    *   Actualizar `InventoryPage` con botones de acción.
    *   Conectar a `AvatarDisplay`.

---

**Aprobado por:** Agente Arquitecto (SIMCO)
