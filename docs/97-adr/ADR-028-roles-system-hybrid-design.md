# ADR-028: Sistema de Roles Híbrido (ENUM + RBAC Tables)

**Estado:** Aceptado
**Fecha:** 2026-01-27
**Autor:** Sistema SIMCO (análisis automatizado)
**Tarea:** TASK-P2-ROLES-CONSOLIDATION-2026-01-27

---

## Contexto

Durante el análisis de coherencia de la base de datos (TASK-BD-ANALYSIS-2026-01-27), se identificó que GAMILIT tiene dos sistemas de roles coexistentes:

1. **Sistema ENUM:** `auth_management.gamilit_role` con valores `student`, `admin_teacher`, `super_admin`
2. **Sistema RBAC Tables:** `auth_management.roles` y `auth_management.user_roles`

Se planteó la pregunta: ¿Debemos consolidar a un solo sistema?

---

## Opciones Consideradas

### Opción A: Solo ENUM
- Eliminar tablas RBAC
- Usar solo ENUM para roles
- **Descartada:** Pierde metadata, permisos granulares, multi-tenant, historial

### Opción B: Solo RBAC Tables
- Eliminar ENUM
- Migrar RLS a usar JOINs con tablas
- **Descartada:** Breaking changes masivos, pierde type safety, alto riesgo

### Opción C: Mantener Híbrido (ACTUAL)
- Conservar ENUM para valores de rol
- Conservar tablas para metadata y asignaciones
- **Seleccionada:** Ya funciona, bajo riesgo, máxima flexibilidad

---

## Decisión

**Mantener el sistema híbrido actual.**

El diseño híbrido es intencional y proporciona lo mejor de ambos mundos:

| Componente | Propósito | Beneficio |
|------------|-----------|-----------|
| ENUM `gamilit_role` | Define valores válidos | Type safety, RLS compatible |
| Tabla `roles` | Metadata y permisos por rol | Extensible, configurable |
| Tabla `user_roles` | Asignaciones usuario-rol | Multi-tenant, historial |

---

## Arquitectura Resultante

```
┌─────────────────────────────────────────────┐
│           ENUM gamilit_role                 │
│   'student' | 'admin_teacher' | 'super_admin'│
│                                             │
│   Usado en:                                 │
│   - RLS policies (get_current_user_role())  │
│   - Feature flags (target_roles[])          │
│   - Backend enums (GamilityRoleEnum)        │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
┌───────────────┐         ┌───────────────────┐
│ roles TABLE   │         │ user_roles TABLE  │
│               │         │                   │
│ name          │         │ user_id           │
│ description   │         │ tenant_id         │
│ permissions   │         │ role (ENUM)       │
│ is_active     │         │ permissions       │
│               │         │ assigned_by       │
│ Catálogo de   │         │ expires_at        │
│ metadata      │         │                   │
└───────────────┘         │ Asignaciones      │
                          │ multi-tenant      │
                          └───────────────────┘
```

---

## Consecuencias

### Positivas
- **Sin cambios de código:** No hay refactoring necesario
- **Type safety preservado:** ENUM garantiza valores válidos en compile time
- **RLS funcional:** Políticas de seguridad siguen usando ENUM directamente
- **Extensibilidad:** Nuevos roles se agregan al ENUM + tabla roles
- **Multi-tenant ready:** user_roles soporta tenants y permisos por asignación
- **Historial de auditoría:** user_roles tiene assigned_by, assigned_at, revoked_at

### Negativas
- **Dos fuentes de verdad conceptuales:** Requiere documentación clara
- **Sincronización manual:** Agregar rol requiere actualizar ENUM + tabla + backend enum

### Mitigaciones
- Este ADR documenta la decisión para futuros desarrolladores
- El análisis ROLES-SYSTEM-ANALYSIS.md detalla la implementación
- Proceso de agregar rol documentado en el análisis

---

## Proceso para Agregar Nuevo Rol (Futuro)

1. **DDL:** Agregar valor al ENUM
   ```sql
   ALTER TYPE auth_management.gamilit_role ADD VALUE 'content_creator';
   ```

2. **DDL:** Agregar entrada en tabla roles
   ```sql
   INSERT INTO auth_management.roles (name, description, permissions) VALUES
   ('content_creator', 'Creador de contenido', '{"can_create_content": true}');
   ```

3. **Backend:** Actualizar GamilityRoleEnum
   ```typescript
   export enum GamilityRoleEnum {
     STUDENT = 'student',
     ADMIN_TEACHER = 'admin_teacher',
     SUPER_ADMIN = 'super_admin',
     CONTENT_CREATOR = 'content_creator', // NUEVO
   }
   ```

4. **Sincronizar:** Ejecutar `npm run sync:enums` si aplica

---

## Referencias

- Análisis completo: `orchestration/tareas/TASK-P2-ROLES-CONSOLIDATION-2026-01-27/ROLES-SYSTEM-ANALYSIS.md`
- ENUM DDL: `apps/database/ddl/schemas/auth_management/enums/gamilit_role.sql`
- Roles table: `apps/database/ddl/schemas/auth_management/tables/03b-roles.sql`
- User roles table: `apps/database/ddl/schemas/auth_management/tables/04-roles.sql`
- Backend enum: `apps/backend/src/shared/constants/enums.constants.ts` (línea 674)

---

*ADR generado: 2026-01-27*
*Sistema: SIMCO v4.0.0*
