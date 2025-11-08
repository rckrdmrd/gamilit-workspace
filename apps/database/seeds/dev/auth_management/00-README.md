# Seeds - auth_management (Development)

Este directorio contiene los seeds de desarrollo para el esquema `auth_management`.

## Orden de Ejecución

Los archivos deben ejecutarse en el orden numérico para respetar dependencias:

1. **01-tenants.sql** - Tenants de prueba (sin dependencias)
2. **02-auth_providers.sql** - Configuración de proveedores OAuth (sin dependencias)
3. **03-profiles.sql** - Usuarios de prueba (→ tenants, auth.users)
4. **04-user_roles.sql** - Asignación de roles (→ profiles)
5. **05-user_preferences.sql** - Preferencias de usuarios (→ profiles)
6. **06-auth_attempts.sql** - Ejemplos de intentos de login (opcional)
7. **07-security_events.sql** - Ejemplos de eventos de seguridad (opcional)

## Uso Rápido

```bash
# Desde el directorio seeds/
./LOAD-SEEDS-auth_management.sh dev
```

## Contenido

### Tenants (3)
- Gamilit Test Organization (enterprise)
- Demo School - Primaria (professional)
- Demo School - Secundaria (basic)

### Usuarios (5)
- 3 estudiantes (grades 6-7)
- 1 profesor (admin_teacher)
- 1 administrador (super_admin)

**Password para todos:** Test1234

### Proveedores OAuth (6)
- Local (✅ habilitado)
- Google (✅ habilitado)
- GitHub (✅ habilitado)
- Facebook (❌ deshabilitado)
- Apple (❌ deshabilitado)
- Microsoft (❌ deshabilitado)

## Credenciales de Acceso

```
Estudiante:  student@test.gamilit.com   | Test1234
Profesor:    teacher@test.gamilit.com   | Test1234
Admin:       admin@test.gamilit.com     | Test1234
```

## Validación

Todos los seeds han sido validados con:
- ✅ Score 99.6/100
- ✅ 0 problemas críticos
- ✅ Estructura alineada con DDL
- ✅ Integridad referencial validada
- ✅ Seguridad verificada (no datos sensibles)

Para más detalles, ver:
- `/docs-analysis/.../REPORTE-MIGRACION-SEEDS.md`
- `/seeds/README.md`
