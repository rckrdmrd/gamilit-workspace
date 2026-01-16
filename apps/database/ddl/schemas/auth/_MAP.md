# _MAP: auth/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion (Core)
**Tipo:** Core/Authentication
**Objetos activos:** 4

---

## Proposito

Schema base de autenticacion siguiendo el patron estandar de Supabase/industria.
Contiene la tabla `users` maestra que referencia `auth_management.profiles` para datos extendidos.

**Audiencia:** DBAs, Backend Developers, Security Team

---

## Estructura

```
ddl/schemas/auth/
├── 00-create-schema.sql
├── tables/
│   └── 01-users.sql        # Tabla auth.users maestra
├── views/
│   └── 01-user_summary.sql # Vista de resumen de usuarios
├── enums/
│   ├── aal_level.sql       # Authenticator Assurance Level
│   └── code_challenge_method.sql  # PKCE challenge methods
└── _MAP.md
```

**Total objetos DDL:** 4 (1 tabla, 1 vista, 2 ENUMs)

---

## Tablas

| Tabla | Archivo | Proposito |
|-------|---------|-----------|
| `users` | 01-users.sql | Tabla maestra de usuarios (UUID, email, metadata) |

## Vistas

| Vista | Archivo | Proposito |
|-------|---------|-----------|
| `user_summary` | 01-user_summary.sql | Resumen de datos de usuario para consultas rapidas |

## ENUMs

| ENUM | Archivo | Valores |
|------|---------|---------|
| `aal_level` | aal_level.sql | aal1, aal2, aal3 (Authenticator Assurance Level) |
| `code_challenge_method` | code_challenge_method.sql | plain, s256 (PKCE) |

---

## Dependencias

**Este schema depende de:** Ninguno (schema raiz)

**Schemas que dependen de este:**
- `auth_management` (profiles referencia users.id)
- Todos los schemas de dominio (FK indirectas via profiles)

---

## Notas de Arquitectura

- **auth.users** es la tabla maestra de Supabase Auth
- Los datos extendidos de usuario van en `auth_management.profiles`
- No se deben agregar columnas customizadas a `auth.users`
- ENUMs siguen especificacion OAuth 2.0 / OIDC

---

## Referencia

- `create-database.sh` Fase 1 - Core auth schema
- `DATABASE_INVENTORY.yml` - auth section

---

**Mantenido por:** Database Team
**Version:** 2.0
