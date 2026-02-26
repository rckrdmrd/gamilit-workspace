# PLAN DE DESARROLLO ACTUALIZADO - GAMILIT

**Fecha:** 2026-02-17
**Estado:** Activo - En Implementación
**Sprint:** Estabilización y Cierre de Gaps Funcionales
**Referencia Normativa:** `orchestration/reports/ANALISIS-IMPACTO-NORMATIVO-EQUIPAMIENTO.md`

---

## 1. Prioridad Alta: Cierre de Gaps de Gamificación

### Fase 0: Definición y Análisis (COMPLETADO)
- [x] Crear `docs/30-ux-ui/flujos/student/FLUJO-PERSONALIZACION-AVATAR.md`.
- [x] Definir reglas de negocio (Unicidad por categoría, propiedad requerida).
- [x] Validar estándares DDL, Backend y Frontend (SIMCO).
- [x] Generar `DISENO-SISTEMA-EQUIPAMIENTO.md` y `ANALISIS-IMPACTO-NORMATIVO-EQUIPAMIENTO.md`.

### Fase 0.5: Documentación y Validación de Contratos (GATE OBLIGATORIO PRE-CODIGO)
- [x] Normalizar contrato canónico de metadata en `docs/40-standards/ESTANDAR-METADATA-ITEMS.md`.
- [x] Alinear ejemplos y alcance en `docs/20-architecture/gamificacion/ANALISIS-RECURSOS-VISUALES.md`.
- [x] Definir secuencia técnica en `docs/20-architecture/gamificacion/FLUJO-TECNICO-EQUIPAMIENTO.md`.
- [x] Documentar contratos API en `docs/40-api/ENDPOINTS-INVENTORY-EQUIP.md`.
- [x] Documentar flujo UX en `docs/30-ux-ui/flujos/student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md`.
- [x] Actualizar trazabilidad (`TRACEABILITY-MATRIX.md`) e índices de arquitectura.

**Criterio de salida del gate 0.5 (obligatorio antes de Fase 1+):**
- Contrato JSONB único y sin ambigüedad (`snake_case`, tipos permitidos).
- Coherencia de schema reference sin contradicción `store.*` vs `gamification_system.*`.
- Flujo FE -> BE -> DB trazado y validado en documentación.

### Fase 1: Base de Datos (DDL) - **EN CURSO**
- [ ] Crear archivo `apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql`.
    - Cumplimiento: `snake_case`, PK UUID, `timestamptz`, constraints explícitos.
- [ ] Ejecutar `recreate-database.sh` (Carga Limpia).
- [ ] Validar integridad referencial y constraint `UNIQUE(user_id, category_id)`.

### Fase 2: Backend (Core Logic)
- [ ] Implementar Entity `UserEquippedItem` (mapeo 1:1 con DDL).
- [ ] Crear DTOs: `EquipItemDto` (validación estricta con `class-validator`).
- [ ] Implementar `InventoryService`:
    - Método `equipItem(userId, itemId)`: Transaccional.
    - Método `unequipItem(userId, itemId)`.
    - Método `getEquippedItems(userId)`.
- [ ] Implementar `InventoryController`: Endpoints Swagger documentados.
- [ ] Registrar en `GamificationModule`.

### Fase 3: Integración Backend (Auth)
- [ ] Modificar `AuthService.getProfile` para inyectar `equipped_items`.
- [ ] Resolver dependencias circulares (`forwardRef` si es necesario).
- [ ] Validar respuesta de login con payload enriquecido.

### Fase 4: Frontend (UI/UX)
- [ ] Crear tipos alineados: `inventory.types.ts`.
- [ ] Implementar servicio API: `inventory.api.ts`.
- [ ] Crear Hook `useInventory` con gestión de estado (loading/error).
- [ ] Actualizar `InventoryPage.tsx` con botones "Equipar" / "Quitar".
- [ ] Conectar `AvatarDisplay` al estado global de usuario (items equipados).

---

## 2. Prioridad Media: Integración Social

### Tarea 2.1: Definición de Desafíos (Documentación)
- [ ] Crear `docs/30-ux-ui/flujos/student/FLUJO-DESAFIOS-SOCIALES.md`.
- [ ] Documentar los 40 endpoints "Backend Only" existentes.

### Tarea 2.2: Integración Frontend
- [ ] Crear `apps/student/pages/ChallengesPage.tsx`.
- [ ] Conectar endpoints de crear desafío, aceptar desafío y ver resultados.

---

## 3. Mantenimiento y Calidad

### Tarea 3.1: Auditoría Continua
- [ ] Mantener `COBERTURA-TOTAL-PROCESOS.md` actualizado con los nuevos flujos.
- [ ] Verificar que `ExerciseSubmissionService` mantenga la integridad transaccional en el claim de rewards manual.
