---
title: "API Reference - Auth, Users & Tenants"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Auth, Users & Tenants

> Volver al [API Reference Hub](../API-REFERENCE.md)

---

## 1. Auth Module (~45 endpoints)

### Autenticacion
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Registrar nuevo usuario | No |
| POST | /auth/login | Login con email/password | No |
| POST | /auth/refresh | Renovar access token | Refresh |
| POST | /auth/logout | Cerrar sesion | Si |
| DELETE | /auth/sessions | Cerrar todas las sesiones | Si |
| GET | /auth/profile | Obtener perfil del usuario actual | Si |
| PUT | /auth/profile | Actualizar perfil | Si |
| POST | /auth/reset-password/request | Solicitar reset de password | No |
| POST | /auth/reset-password | Ejecutar reset de password | No |
| PUT | /auth/change-password | Cambiar password (logueado) | Si |

### OAuth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/oauth/google | Iniciar OAuth Google | No |
| GET | /auth/oauth/google/callback | Callback OAuth Google | No |
| GET | /auth/oauth/connections | Listar conexiones OAuth | Si |
| DELETE | /auth/oauth/connections/:id | Eliminar conexion OAuth | Si |

### Verificacion de Email
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/verify-email | Verificar email con token | No |
| POST | /auth/verify-email/resend | Reenviar email de verificacion | JWT |
| GET | /auth/verify-email/status | Consultar estado de verificacion | JWT |

### Recuperacion de Password
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/reset-password/validate | Validar token de reset (query: ?token=) | No |

> **Nota:** `POST /auth/reset-password/request` y `POST /auth/reset-password` ya listados en la tabla de Autenticacion arriba.

### Sessions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/sessions | Listar sesiones activas | JWT |
| DELETE | /auth/sessions/:id | Cerrar sesion especifica | JWT |

### Autenticacion de Dos Factores (2FA)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/2fa/status | Estado de 2FA del usuario | JWT |
| POST | /auth/2fa/setup | Iniciar configuracion 2FA (body: method=email\|sms\|authenticator) | JWT |
| POST | /auth/2fa/setup/verify | Verificar y completar configuracion 2FA (retorna backup codes) | JWT |
| POST | /auth/2fa/verify | Verificar codigo 2FA durante login (body: userId, code) | No |
| POST | /auth/2fa/disable | Deshabilitar 2FA (body: password para confirmar) | JWT |
| POST | /auth/2fa/resend | Reenviar codigo 2FA (body: userId) | No |

---

## 2. Users Module (~35 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /users | Listar usuarios (paginado) | Si | admin |
| GET | /users/:id | Obtener usuario por ID | Si | admin/self |
| POST | /users | Crear usuario | Si | admin |
| PATCH | /users/:id | Actualizar usuario | Si | admin/self |
| DELETE | /users/:id | Desactivar usuario (soft) | Si | admin |
| GET | /users/search | Buscar usuarios | Si | admin/teacher |
| POST | /users/bulk-import | Importar usuarios (CSV) | Si | admin |
| GET | /users/:id/roles | Obtener roles del usuario | Si | admin |
| PATCH | /users/:id/roles | Actualizar roles | Si | admin |
| GET | /users/me | Alias para perfil actual | Si | any |

---

## 2.5 Profile Module (3 endpoints)

> **Controller:** `ProfileController` en `apps/backend/src/modules/profile/controllers/profile.controller.ts`
> **Module:** `ProfileModule` — importado en `app.module.ts`
> **Prefijo base:** `/api/v1/profile`
> **Auth:** No indica guard explicito en controller; heredado del pipeline global

| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/profile/:userId` | Obtener perfil completo de un usuario por UUID (incluye display_name, bio, avatar_url, preferences, grade_level, etc.) | Si | any |
| PATCH | `/api/v1/profile/:userId` | Actualizar campos del perfil (todos opcionales: display_name, bio, phone, grade_level, student_id, preferences) | Si | self |
| POST | `/api/v1/profile/:userId/avatar` | Subir imagen de avatar (multipart/form-data, campo: 'avatar', tipos: JPEG/PNG/GIF, max: 5MB) | Si | self |

---

## 3. Tenants Module (~20 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /tenants | Listar tenants | Si | super_admin |
| GET | /tenants/:id | Obtener tenant | Si | admin |
| POST | /tenants | Crear tenant (escuela) | Si | super_admin |
| PATCH | /tenants/:id | Actualizar tenant | Si | admin |
| GET | /tenants/:id/settings | Configuracion del tenant | Si | admin |
| PATCH | /tenants/:id/settings | Actualizar configuracion | Si | admin |
| GET | /tenants/:id/members | Miembros del tenant | Si | admin |
| GET | /tenants/:id/stats | Estadisticas del tenant | Si | admin |

---

Prev: -- | Next: [Educational](02-EDUCATIONAL.md)
