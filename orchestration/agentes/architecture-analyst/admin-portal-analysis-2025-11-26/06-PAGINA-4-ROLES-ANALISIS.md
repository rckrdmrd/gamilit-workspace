# ANÁLISIS DETALLADO: AdminRolesPage

**Fecha:** 2025-11-26
**Página:** 4 de 12
**Estado:** ANÁLISIS COMPLETADO

---

## RESUMEN EJECUTIVO

### Flujo de Datos
```
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                            │
│  └─ auth_management.roles                                           │
│     ├─ id, name, description, permissions (JSONB)                   │
│     ├─ is_active (boolean)                                          │
│     └─ ⚠️ NO tiene columna is_system                                │
├─────────────────────────────────────────────────────────────────────┤
│  BACKEND                                                             │
│  ├─ AdminRolesController (4 endpoints)                              │
│  └─ AdminRolesService                                               │
│     ├─ getRoles() → Retorna: id, name, users_count, etc.           │
│     ├─ getRolePermissions() → Record<string, boolean>               │
│     └─ getAvailablePermissions() → 24 permisos HARDCODEADOS        │
├─────────────────────────────────────────────────────────────────────┤
│  API FRONTEND                                                        │
│  ├─ getRoles() → GET /admin/roles                                   │
│  ├─ getRolePermissions() → GET /admin/roles/:id/permissions         │
│  └─ updateRolePermissions() → PUT /admin/roles/:id/permissions      │
├─────────────────────────────────────────────────────────────────────┤
│  HOOKS                                                               │
│  ├─ useRoles.ts (useEffect línea 167 ✅)                            │
│  │  └─ Carga inicial automática                                     │
│  └─ useRolePermissions.ts                                           │
│     ├─ transformPermissionsFromBackend()                            │
│     └─ transformPermissionsToBackend() ⚠️ DUPLICADO                 │
├─────────────────────────────────────────────────────────────────────┤
│  COMPONENTE                                                          │
│  └─ AdminRolesPage.tsx                                              │
│     ├─ Lista roles con permisos                                     │
│     ├─ Editor de permisos por rol                                   │
│     └─ ⚠️ Espera roleId pero recibe id                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PROBLEMAS IDENTIFICADOS

### CRÍTICOS (P0) - Bloquean funcionalidad

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 1 | **Nombres de campos inconsistentes** | Backend: id, name | Frontend espera roleId, roleName → undefined |
| 2 | **Campo isSystem falta** | Backend no lo retorna | No se identifican roles de sistema |
| 3 | **Código duplicado transformPermissions** | Hook + API | Mantenimiento difícil |

### ALTOS (P1) - Degradan experiencia

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 4 | **Validación permisos restrictiva** | useRolePermissions:51-58 | Módulos faltantes: organizations, reports, analytics |
| 5 | **Documentación falsa** | adminAPI.ts | Dice "NOT implemented" pero SÍ está |
| 6 | **Conteo usuarios con try/catch silencioso** | Backend service | userCount siempre 0 si falla |

### MEDIOS (P2) - Mejoras recomendadas

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 7 | **Sin validación response en API** | adminAPI.ts getRoles | Posibles crashes |
| 8 | **getAvailablePermissions hardcodeado** | Backend service | No sincronizado con BD |
| 9 | **Null checks faltantes** | AdminRolesPage | UI muestra "undefined" |

---

## PLAN DE CORRECCIONES

### FASE A: Frontend - Adaptar a nombres del Backend

1. **Actualizar tipos** - Usar id, name, users_count (snake_case)
2. **Agregar transformación en hook** - Mapear a nombres esperados
3. **Agregar validModules faltantes** - organizations, reports, analytics, admin

### FASE B: Backend - Agregar campo isSystem

4. **Calcular isSystem** - ['super_admin', 'student', 'teacher'].includes(name)

---

## ARCHIVOS A MODIFICAR

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `useRoles.ts` | Hook | Transformar id→roleId, validaciones |
| `useRolePermissions.ts` | Hook | Agregar módulos válidos |
| `AdminRolesPage.tsx` | Componente | Null checks |
| `admin-roles.service.ts` | Service | Agregar isSystem |

