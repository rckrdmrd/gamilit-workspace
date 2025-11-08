# Seeds - Database Gamilit

Este directorio contiene los seeds (datos iniciales) para la base de datos de Gamilit, organizados por entorno y esquema.

---

## Estructura de Directorios

```
seeds/
├── dev/                          # Seeds para desarrollo
│   ├── auth_management/          # Esquema auth_management
│   │   ├── 01-tenants.sql
│   │   ├── 02-auth_providers.sql
│   │   ├── 03-profiles.sql
│   │   ├── 04-user_roles.sql
│   │   ├── 05-user_preferences.sql
│   │   ├── 06-auth_attempts.sql
│   │   └── 07-security_events.sql
│   └── [otros_esquemas]/
├── staging/                      # Seeds para staging
│   └── auth_management/
│       ├── 01-tenants.sql
│       └── 02-auth_providers.sql
├── production/                   # Seeds para producción
│   └── auth_management/
│       └── 01-auth_providers.sql
├── LOAD-SEEDS-auth_management.sh # Script de carga
└── README.md                     # Este archivo
```

---

## Uso Rápido

### Cargar Seeds - Development

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds

# Configurar variables de entorno
export DB_NAME=gamilit
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432

# Ejecutar script de carga
./LOAD-SEEDS-auth_management.sh dev
```

### Cargar Seeds - Staging

```bash
./LOAD-SEEDS-auth_management.sh staging
```

### Cargar Seeds - Production

```bash
# ⚠️ CUIDADO: Solo carga configuración, NO usuarios
./LOAD-SEEDS-auth_management.sh production
```

---

## Seeds por Entorno

### Development (dev/)

**Propósito:** Datos completos para desarrollo y testing local

**Contenido:**
- 3 tenants de prueba
- 6 proveedores de autenticación (local, google, github habilitados)
- 5 usuarios de prueba (3 estudiantes, 1 profesor, 1 admin)
- 5 asignaciones de roles
- 5 preferencias de usuario
- 6 intentos de autenticación (ejemplos)
- 8 eventos de seguridad (ejemplos)

**Total registros:** ~30

---

### Staging (staging/)

**Propósito:** Datos similares a producción para testing pre-deployment

**Contenido:**
- 3 tenants de prueba
- 6 proveedores de autenticación

**Total registros:** ~9

**Nota:** Staging puede extenderse con más datos según necesidades de testing

---

### Production (production/)

**Propósito:** Solo configuración esencial, NO usuarios

**Contenido:**
- 6 proveedores de autenticación (solo local habilitado)

**Total registros:** 6 (configuración)

**⚠️ IMPORTANTE:**
- NO incluye usuarios de prueba
- NO incluye tenants de prueba
- OAuth providers requieren configuración manual posterior
- Usuarios deben crearse via proceso de onboarding

---

## Credenciales de Prueba (Development)

### 🎓 Cuenta de Estudiante

```
Email:    student@test.gamilit.com
Password: Test1234
Role:     student
Tenant:   gamilit-test
```

**Características:**
- Grade level: 6
- Student ID: STU-001-2024
- Email verified: ✅
- Phone verified: ❌

---

### 🎓 Estudiante 2 - Ana García

```
Email:    student2@test.gamilit.com
Password: Test1234
Role:     student
Tenant:   gamilit-test
```

**Características:**
- Grade level: 6
- Student ID: STU-002-2024
- Theme: dark (noir variant)
- Tutorial completed: ✅

---

### 🎓 Estudiante 3 - Carlos Rodríguez

```
Email:    student3@test.gamilit.com
Password: Test1234
Role:     student
Tenant:   gamilit-test
```

**Características:**
- Grade level: 7
- Student ID: STU-003-2024
- Large text enabled
- Sound disabled

---

### 👨‍🏫 Cuenta de Profesor

```
Email:    teacher@test.gamilit.com
Password: Test1234
Role:     admin_teacher
Tenant:   gamilit-test
```

**Características:**
- Phone verified: ✅
- Email verified: ✅
- Permissions: read, write, analytics
- Can manage students, create assignments, grade submissions

---

### 👤 Cuenta de Administrador

```
Email:    admin@test.gamilit.com
Password: Test1234
Role:     super_admin
Tenant:   gamilit-test
```

**Características:**
- Phone verified: ✅
- Email verified: ✅
- Permissions: ALL
- Can manage system, users, tenants, settings

---

## Tenants de Prueba

### Tenant 1: Gamilit Test Organization

```
Slug:               gamilit-test
Domain:             test.gamilit.com
Subscription Tier:  enterprise
Max Users:          1000
Max Storage:        100 GB
Status:             active
```

---

### Tenant 2: Demo School - Primaria

```
Slug:               demo-school-primary
Domain:             demo-primary.gamilit.com
Subscription Tier:  professional
Max Users:          500
Max Storage:        50 GB
Status:             active
Trial:              90 días
```

---

### Tenant 3: Demo School - Secundaria

```
Slug:               demo-school-secondary
Domain:             demo-secondary.gamilit.com
Subscription Tier:  basic
Max Users:          200
Max Storage:        20 GB
Status:             active
Trial:              30 días
```

---

## Proveedores de Autenticación

### Development

| Proveedor | Estado | Client ID | Redirect URI |
|-----------|--------|-----------|--------------|
| Local (Email/Password) | ✅ Habilitado | - | - |
| Google OAuth | ✅ Habilitado | dev-google-client-id | http://localhost:3000/auth/callback/google |
| GitHub OAuth | ✅ Habilitado | dev-github-client-id | http://localhost:3000/auth/callback/github |
| Facebook | ❌ Deshabilitado | - | - |
| Apple | ❌ Deshabilitado | - | - |
| Microsoft | ❌ Deshabilitado | - | - |

### Production

| Proveedor | Estado | Notas |
|-----------|--------|-------|
| Local (Email/Password) | ✅ Habilitado | Password min 12 chars, requires email verification |
| Todos los OAuth | ❌ Deshabilitado | Deben configurarse via admin panel |

---

## Orden de Ejecución

Los seeds deben ejecutarse en el siguiente orden para respetar dependencias:

```
1. tenants.sql              (sin dependencias)
2. auth_providers.sql       (sin dependencias)
3. profiles.sql             (→ tenants, auth.users)
4. user_roles.sql           (→ profiles)
5. user_preferences.sql     (→ profiles)
6. auth_attempts.sql        (opcional, sin dependencias)
7. security_events.sql      (opcional, → auth.users)
```

El script `LOAD-SEEDS-auth_management.sh` maneja este orden automáticamente.

---

## Verificación Post-Carga

### Verificar seeds cargados

```sql
SET search_path TO auth_management, public;

-- Contar registros por tabla
SELECT 'Tenants' as tabla, COUNT(*) as registros FROM tenants
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Auth Providers', COUNT(*) FROM auth_providers
UNION ALL
SELECT 'User Preferences', COUNT(*) FROM user_preferences
UNION ALL
SELECT 'Auth Attempts', COUNT(*) FROM auth_attempts
UNION ALL
SELECT 'Security Events', COUNT(*) FROM security_events;
```

**Resultado esperado (dev):**
```
Tenants:          3
Profiles:         5
User Roles:       5
Auth Providers:   6
User Preferences: 5
Auth Attempts:    6
Security Events:  8
```

### Verificar usuarios

```sql
SELECT
    p.email,
    p.role,
    p.status,
    p.email_verified,
    t.name as tenant_name
FROM auth_management.profiles p
JOIN auth_management.tenants t ON p.tenant_id = t.id
ORDER BY p.role, p.email;
```

---

## Troubleshooting

### Error: "relation auth.users does not exist"

**Solución:** Asegurarse de que el esquema `auth` de Supabase está creado

```sql
-- Verificar esquema auth
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';
```

### Error: "duplicate key value violates unique constraint"

**Solución:** Seeds ya están cargados. Usar ON CONFLICT o limpiar tabla primero

```sql
-- Opción 1: Limpiar seeds anteriores
TRUNCATE auth_management.profiles CASCADE;
TRUNCATE auth_management.tenants CASCADE;

-- Opción 2: Re-ejecutar (seeds tienen ON CONFLICT)
-- El script actualizará registros existentes
```

### Error: "insert or update on table profiles violates foreign key"

**Solución:** Ejecutar seeds en orden correcto (usar script LOAD-SEEDS)

```bash
# Orden correcto
./LOAD-SEEDS-auth_management.sh dev
```

### Error: "permission denied for schema auth_management"

**Solución:** Verificar permisos del usuario de base de datos

```sql
GRANT ALL ON SCHEMA auth_management TO gamilit_user;
GRANT ALL ON ALL TABLES IN SCHEMA auth_management TO gamilit_user;
```

---

## Seguridad

### ⚠️ NUNCA en Producción

❌ NO usar estos seeds en producción
❌ NO exponer credenciales de test
❌ NO usar password "Test1234" en producción
❌ NO usar emails @test.gamilit.com reales

### ✅ Buenas Prácticas

✅ Usar seeds solo en development/staging
✅ Cambiar passwords después de deployment
✅ Configurar OAuth con secrets reales via env vars
✅ Habilitar email verification en producción
✅ Usar proceso de onboarding para usuarios reales

---

## Documentación Adicional

### Reportes de Validación

```
/docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/05-validaciones/seeds/auth_management/
├── REPORTE-MIGRACION-SEEDS.md       # Reporte completo de migración
└── VALIDACION-SEED-profiles.md      # Validación detallada de profiles
```

### DDL de Referencia

```
/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/
├── 01-tenants.sql
├── 02-auth_attempts.sql
├── 03-profiles.sql
├── 04-roles.sql
├── 05-auth_providers.sql
├── 06-email_verification_tokens.sql
├── 07-password_reset_tokens.sql
├── 08-security_events.sql
└── 09-user_preferences.sql
```

---

## Contribuir

### Agregar nuevo seed

1. Crear archivo en `dev/[esquema]/NN-tabla.sql`
2. Usar prefijo numérico según dependencias
3. Incluir header con metadata
4. Agregar validaciones inline
5. Usar ON CONFLICT para reinserciones
6. Documentar en este README

### Template de seed

```sql
-- =====================================================
-- Seed: [esquema].[tabla] (DEV)
-- Description: [Descripción breve]
-- Environment: DEVELOPMENT
-- Dependencies: [tablas necesarias]
-- Order: [NN]
-- Validated: [Fecha]
-- Score: [XX]/100
-- =====================================================

SET search_path TO [esquema], public;

-- INSERT statements...

-- Verification
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM [esquema].[tabla];
    RAISE NOTICE '✓ [Tabla] insertados: % registros', record_count;
END $$;
```

---

## Changelog

### v1.0.0 - 2025-11-02
- ✨ Seeds iniciales de auth_management
- ✨ Script LOAD-SEEDS-auth_management.sh
- ✨ Documentación completa
- ✨ Validaciones exhaustivas

---

## Contacto

Para preguntas o problemas con seeds, referirse a:
- Documentación: `/docs-analysis/miniworkspace-migration/`
- Reportes de validación: `/05-validaciones/seeds/`

---

**Última actualización:** 2025-11-02
**Versión:** 1.0.0
**Mantenido por:** Equipo Gamilit
