# Seeds - Auth

## Orden de Ejecución

1. `01-demo-users.sql` - Usuarios demo (mantener para compatibilidad histórica)
2. `02-test-users.sql` - **Usuarios de testing oficiales** (NUEVO - 2025-11-03)

## Usuarios de Testing Oficiales

**Archivo:** `02-test-users.sql`
**Dominio:** `@gamilit.com`
**Password:** `Test1234` (TODOS los usuarios)

| Email | Role | Propósito |
|-------|------|-----------|
| admin@gamilit.com | super_admin | Testing de funcionalidades de admin |
| teacher@gamilit.com | admin_teacher | Testing de funcionalidades de maestro |
| student@gamilit.com | student | Testing de funcionalidades de estudiante |

### Características

- ✅ Email confirmado automáticamente (`email_confirmed_at = NOW()`)
- ✅ Login inmediato sin verificación
- ✅ Password estándar Test1234 para testing
- ✅ Dominio @gamilit.com (según especificación del proyecto)

## Usuarios Demo (Históricos)

**Archivo:** `01-demo-users.sql`
**Nota:** Mantener para compatibilidad con datos históricos

| Email | Password | Role |
|-------|----------|------|
| admin@glit.edu.mx | Admin123! | super_admin |
| instructor@demo.glit.edu.mx | Instructor123! | admin_teacher |
| estudiante1@demo.glit.edu.mx | Student123! | student |
| estudiante2@demo.glit.edu.mx | Student123! | student |
| estudiante3@demo.glit.edu.mx | Student123! | student |

---

## ⚠️ Importante

**Para desarrollo y testing:** Usa los usuarios de `02-test-users.sql` (@gamilit.com)

**Para staging/producción:** NO ejecutar estos seeds. Crear usuarios reales vía interfaz.

---

**Última actualización:** 2025-11-03
**Migración:** ATLAS-DATABASE - Alineación con BD origen
