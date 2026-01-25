# CONTEXTO - TASK-004

## Origen de la Tarea

**Solicitante:** Usuario
**Fecha:** 2026-01-25
**Canal:** Sesion interactiva Claude Code

## Descripcion del Problema

El usuario reporto que en el portal de administracion de GAMILIT, la pagina de usuarios (`/admin/users`) mostraba "Nunca" en la columna "Last Login" para **todos** los usuarios, incluso aquellos que habian iniciado sesion recientemente.

## Sintoma Observado

```
Tabla de Usuarios (Admin):
| Email              | Detective      | Rango   | Status | Last Login |
|--------------------|----------------|---------|--------|------------|
| admin@gamilit.com  | Admin User     | ...     | active | Nunca      |
| teacher@gamilit.com| Teacher User   | ...     | active | Nunca      |
| student@gamilit.com| Student User   | ...     | active | Nunca      |
```

## Hipotesis Iniciales

1. El campo `last_sign_in_at` no se actualiza en la BD
2. El backend no devuelve el campo en la respuesta
3. El frontend no mapea correctamente el campo
4. Problema de serializacion/transformacion de datos

## Verificacion de Datos

Se verifico que los datos **SI existen** en la base de datos:

```sql
SELECT email, last_sign_in_at FROM auth.users LIMIT 5;

-- Resultado:
-- teacher@gamilit.com  | 2026-01-25 00:50:19-06
-- admin@gamilit.com    | 2026-01-25 01:10:00-06
-- student@gamilit.com  | 2026-01-25 01:09:44-06
```

## Alcance Identificado

- **Capa afectada:** Backend (NestJS)
- **Modulo:** Admin Users
- **Archivos clave:**
  - `apps/backend/src/modules/admin/dto/users/user-details.dto.ts`
  - `apps/backend/src/modules/admin/services/admin-users.service.ts`

## Contexto Tecnico

El proyecto usa:
- **NestJS** con TypeORM
- **class-transformer** para serializacion de DTOs
- El campo `last_sign_in_at` es tipo `Date` en la entidad
- El frontend espera un string ISO en el JSON

## Prioridad

**P1** - El portal de admin es critico para gestion de usuarios.

## Referencias

- Componente frontend: `UserManagementTable.tsx:110-116`
- Hook: `useUserManagement.ts:170`
- API: `adminAPI.ts:567`
- Servicio: `admin-users.service.ts:139`
