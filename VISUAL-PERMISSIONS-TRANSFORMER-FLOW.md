# VISUAL: Permissions Transformer Flow

## 📊 ARQUITECTURA DEL TRANSFORMADOR

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AdminRolesPage.tsx                          │
│  - Renderiza permisos como Permission[]                             │
│  - groupPermissionsByModule() espera Permission[]                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ usa
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      useRolePermissions.ts                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ TRANSFORMADORES                                         │        │
│  ├────────────────────────────────────────────────────────┤        │
│  │ transformPermissionsFromBackend()                       │        │
│  │   Record<string, boolean> → Permission[]               │        │
│  │                                                         │        │
│  │ transformPermissionsToBackend()                         │        │
│  │   Permission[] → Record<string, boolean>               │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ fetchRolePermissions(roleId)                            │        │
│  ├────────────────────────────────────────────────────────┤        │
│  │ 1. Call adminAPI.getRolePermissions()                   │        │
│  │ 2. Receive backend format                               │        │
│  │ 3. Transform → transformPermissionsFromBackend()        │        │
│  │ 4. Build RolePermissions frontend object                │        │
│  │ 5. setRolePermissions(frontendData)                     │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ updatePermissions(roleId, permissions)                  │        │
│  ├────────────────────────────────────────────────────────┤        │
│  │ 1. Call adminAPI.updateRolePermissions()                │        │
│  │ 2. Receive backend response                             │        │
│  │ 3. Transform → transformPermissionsFromBackend()        │        │
│  │ 4. setRolePermissions(frontendData)                     │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ usa
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            adminAPI.ts                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ getRolePermissions(roleId)                              │        │
│  ├────────────────────────────────────────────────────────┤        │
│  │ GET /admin/roles/:id/permissions                        │        │
│  │ Returns: Backend format (as-is)                         │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ updateRolePermissions(roleId, permissions)              │        │
│  ├────────────────────────────────────────────────────────┤        │
│  │ 1. Transform → transformPermissionsToBackend()          │        │
│  │ 2. PUT /admin/roles/:id/permissions                     │        │
│  │    Body: { permissions: Record<string, boolean> }       │        │
│  │ 3. Returns: Backend format (as-is)                      │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                   │
│                    admin-roles.controller.ts                        │
│                                                                      │
│  GET /admin/roles/:id/permissions                                   │
│  PUT /admin/roles/:id/permissions                                   │
│                                                                      │
│  Format: RolePermissionsDto                                         │
│  {                                                                   │
│    role_id: string,                                                 │
│    role_name: string,                                               │
│    permissions: Record<string, boolean>,                            │
│    updated_at: string                                               │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO FETCH (GET)

```
Backend Response                 Hook Transformation              Frontend State
─────────────────               ────────────────────              ───────────────

{                               transformPermissionsFromBackend   {
  role_id: "abc123",            ──────────────────────────────>    role: {
  role_name: "teacher",                                              roleId: "abc123",
  permissions: {                                                     roleName: "teacher",
    "can_create_content": true, ────────────────────────────>       ...
    "can_view_users": false,                                       },
    "can_edit_gamification": true                                  permissions: [
  },                                                                 { module: "content", action: "create", granted: true },
  updated_at: "2025-11-24..."   ────────────────────────────>       { module: "users", action: "view", granted: false },
}                                                                    { module: "gamification", action: "edit", granted: true }
                                                                   ]
                                                                 }
```

---

## 🔄 FLUJO UPDATE (PUT)

```
Frontend State                   API Transformation               Backend Request
───────────────                  ──────────────────               ────────────────

permissions: [                   transformPermissionsToBackend    PUT Body:
  {                              ──────────────────────────────>  {
    module: "content",                                              permissions: {
    action: "create",            ────────────────────────────>       "can_create_content": true,
    granted: true                                                    "can_delete_users": false
  },                                                                }
  {                                                               }
    module: "users",
    action: "delete",
    granted: false
  }
]
```

---

## 🎯 EJEMPLOS DE TRANSFORMACIÓN

### Ejemplo 1: Permission Key Parsing

```typescript
// Backend Key → Frontend Permission

"can_create_content"
     │      │       │
     │      │       └── module: "content"
     │      └────────── action: "create"
     └───────────────── prefix (ignorado)

Result: { module: "content", action: "create", granted: true }
```

### Ejemplo 2: Permission Generation

```typescript
// Frontend Permission → Backend Key

{ module: "gamification", action: "edit", granted: false }
          │                       │                │
          │                       │                └── value
          └───────────────────────┴──────────────────── "can_edit_gamification"

Result: { "can_edit_gamification": false }
```

---

## 🔍 VALIDACIONES

```
┌────────────────────────────────────────────────────┐
│ transformPermissionsFromBackend()                  │
├────────────────────────────────────────────────────┤
│                                                     │
│ Para cada key en Record<string, boolean>:          │
│                                                     │
│ 1. Regex Match: /^(?:can_)?(\w+)_(\w+)$/          │
│    ✅ "can_create_content" → ["create", "content"] │
│    ✅ "view_users" → ["view", "users"]             │
│    ❌ "invalid_key" → null (warning)               │
│                                                     │
│ 2. Validate Action                                 │
│    ✅ "view", "create", "edit", "delete"           │
│    ❌ "other" → warning + skip                     │
│                                                     │
│ 3. Validate Module                                 │
│    ✅ "users", "content", "gamification",          │
│       "monitoring", "system"                        │
│    ❌ "other" → warning + skip                     │
│                                                     │
│ 4. Build Permission Object                         │
│    { module, action, granted }                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 📝 LOGS DE DEBUGGING

### Console Output - Fetch

```javascript
[useRolePermissions] Transformed permissions: {
  backend: {
    "can_create_content": true,
    "can_view_users": false,
    "can_edit_gamification": true,
    "can_delete_users": false,
    ...
  },
  frontend: [
    { module: "content", action: "create", granted: true },
    { module: "users", action: "view", granted: false },
    { module: "gamification", action: "edit", granted: true },
    { module: "users", action: "delete", granted: false },
    ...
  ],
  count: 20
}
```

### Console Output - Update

```javascript
[useRolePermissions] Transforming permissions for update: {
  frontend: [
    { module: "content", action: "create", granted: true },
    { module: "users", action: "delete", granted: true }
  ],
  backend: {
    "can_create_content": true,
    "can_delete_users": true
  },
  count: 2
}
```

---

## ⚠️ WARNINGS ESPERADOS

```javascript
// Si se encuentra una key no válida:
[transformPermissionsFromBackend] Could not parse permission key: invalid_permission_key

// Si action/module no son válidos:
[transformPermissionsFromBackend] Invalid permission key: can_destroy_everything
(action: destroy, module: everything)
```

---

## ✅ CRITERIOS DE ACEPTACIÓN CUMPLIDOS

✅ Transformador implementado en useRolePermissions.ts
✅ Permissions se transforman automáticamente al cargar
✅ AdminRolesPage puede renderizar los permisos correctamente
✅ Compilación sin errores (TypeScript)
✅ groupPermissionsByModule() funciona con Permission[]

---

**Versión:** 1.0.0
**Fecha:** 2025-11-24
