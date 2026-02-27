---
titulo: Especificación AdminUsersPage
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Especificacion: AdminUsersPage

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`

---

## PROPOSITO

Pagina de administracion para gestionar usuarios del sistema, incluyendo CRUD completo, busqueda, filtros y acciones de suspension.

---

## ESTRUCTURA DE PAGINA

```
┌─────────────────────────────────────────────────────────┐
│                      HEADER                              │
│  [Users Icon] Gestion de Usuarios                       │
│  [+ Crear Usuario]                                      │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  STATS CARDS                     │   │
│  │ [Total] [Activos] [Inactivos] [Estudiantes]     │   │
│  │ [Profesores] [Admins]                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   FILTROS                        │   │
│  │ [Buscar...] [Rol v] [Estado v] [Limpiar]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    TABLA                         │   │
│  │  Usuario | Email | Rol | Estado | Inst | Acciones│   │
│  │  ────────────────────────────────────────────── │   │
│  │  Juan... | j@... | Est | Activo | Esc1 | [...]  │   │
│  │  Maria...| m@... | Prof| Activo | Esc1 | [...]  │   │
│  │  ────────────────────────────────────────────── │   │
│  │  [< Prev]  1 2 3 4 5  [Next >]                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## STATS CARDS (6)

| Card | Dato | Icono |
|------|------|-------|
| Total usuarios | Conteo total | Users |
| Activos | Usuarios activos | UserCheck |
| Inactivos | Usuarios inactivos | UserX |
| Estudiantes | Rol student | GraduationCap |
| Profesores | Rol teacher | BookOpen |
| Admins | Roles admin | Shield |

---

## FILTROS

### Busqueda

- Campo de texto con debounce (300ms)
- Busca en: nombre, email
- Icono de busqueda
- Boton limpiar (X)

### Filtro por Rol

**Opciones:**
- Todos
- student
- admin_teacher
- teacher
- super_admin

### Filtro por Estado

**Opciones:**
- Todos
- active
- inactive
- suspended

---

## TABLA

### Columnas

| Columna | Contenido | Sorteable |
|---------|-----------|-----------|
| Usuario | Avatar + nombre | Si |
| Email | Email | Si |
| Rol | Badge coloreado | No |
| Estado | Icono + texto | No |
| Institucion | Nombre escuela | No |
| Ultimo acceso | Fecha formateada | Si |
| Acciones | Botones | No |

### Estilos de Fila

| Estado | Estilo |
|--------|--------|
| active | Normal |
| inactive | Opacidad reducida |
| suspended | Fondo rojo tenue |

### Badges de Rol

| Rol | Color |
|-----|-------|
| student | Azul |
| teacher | Verde |
| admin_teacher | Naranja |
| super_admin | Rojo |

---

## ACCIONES POR FILA

| Accion | Icono | Condicion |
|--------|-------|-----------|
| Editar | Pencil | Siempre |
| Suspender | Ban | Si active |
| Reactivar | CheckCircle | Si suspended |
| Eliminar | Trash | Siempre (requiere confirm) |

---

## MODALES

### UserDetailModal

**Proposito:** Ver/editar detalles de usuario.

**Campos editables:**
- Nombre
- Email
- Rol
- Institucion (dropdown)
- Estado

**Campos readonly:**
- ID
- Fecha creacion
- Ultimo acceso
- Estadisticas de uso

### ConfirmDialog

**Uso:** Confirmacion de acciones destructivas.

**Variantes:**
- Suspender usuario
- Eliminar usuario
- Reactivar usuario

---

## HOOKS UTILIZADOS

| Hook | Proposito |
|------|-----------|
| useUserManagement | CRUD de usuarios |
| useInstitutions | Lista de instituciones |

---

## PAGINACION

- Items por pagina: 10, 25, 50
- Navegacion: anterior/siguiente
- Numeros de pagina visibles: 5
- Info: "Mostrando 1-25 de 150 usuarios"

---

## PERMISOS

| Accion | Roles Permitidos |
|--------|------------------|
| Ver lista | admin, super_admin |
| Editar | admin, super_admin |
| Suspender | super_admin |
| Eliminar | super_admin |
| Crear | super_admin |

---

## FEEDBACK

| Accion | Toast |
|--------|-------|
| Usuario actualizado | Success verde |
| Usuario suspendido | Warning naranja |
| Usuario eliminado | Success verde |
| Error | Error rojo |

---

## REFERENCIAS

- `useUserManagement.ts` - Hook de gestion
- `userManagementApi.ts` - Cliente API

---

**Ultima actualizacion:** 2025-12-18
