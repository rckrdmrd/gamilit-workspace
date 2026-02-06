# _MAP: lti_integration/

**Ultima actualizacion:** 2026-02-03
**Estado:** Produccion
**Tipo:** Integration/LMS
**Objetos activos:** 5
**RLS Policies:** 17

---

## Proposito

Integracion LTI 1.3 (Learning Tools Interoperability) con plataformas LMS externas.
Permite usar GAMILIT como herramienta dentro de Moodle, Canvas, Blackboard, etc.

**Audiencia:** Backend Developers, Integration Team

## Estructura

- **tables/**: 3 archivos
- **rls-policies/**: 2 archivos (NUEVO 2026-02-03)
- **functions/**: 0 archivos
- **triggers/**: 0 archivos
- **indexes/**: 0 archivos

**Total:** 5 objetos

## Contenido Detallado

### tables/ (3 archivos)

```
01-lti_consumers.sql
02-lti_sessions.sql
03-lti_grade_passback.sql
```

### rls-policies/ (2 archivos) - NUEVO 2026-02-03

```
01-rls-policies.sql    -- 17 politicas RLS para seguridad
02-enable-rls.sql      -- Habilita RLS en las 3 tablas
```

**Gap Reference:** GAP-SYS-001 (CRITICAL - Security) - RESOLVED

---

## Descripción de Tablas

### 01-lti_consumers.sql
Configuración de plataformas LMS que pueden conectarse vía LTI 1.3

**Características:**
- Almacena credenciales y configuración de consumidores LTI
- Soporta OAuth 2.0 y OIDC authentication
- Capacidades LTI: Deep Linking, NRPS, AGS
- Plataformas soportadas: Moodle, Canvas, Blackboard, etc.

**Seeds:** `seeds/prod/lti_integration/01-lti_consumers.sql`

### 02-lti_sessions.sql
Sesiones activas de usuarios conectados vía LTI

**Características:**
- Tracking de launches LTI
- Información de contexto (course, user, role)
- Duración de sesión y última actividad
- Mapeo entre usuarios LMS y usuarios GAMILIT

### 03-lti_grade_passback.sql
Registro de calificaciones enviadas de vuelta a LMS

**Características:**
- Assignment and Grade Services (AGS) support
- Queue de grades pendientes de envío
- Historial de grade submissions
- Retry logic para fallos de envío

---

## Notas Importantes

### LTI 1.3 Standard

Este schema implementa el estándar LTI 1.3 de IMS Global:
- **Spec:** https://www.imsglobal.org/spec/lti/v1p3/
- **Authentication:** OAuth 2.0 + OIDC
- **Deep Linking:** Permite selección de contenido desde GAMILIT
- **NRPS:** Name and Role Provisioning Services
- **AGS:** Assignment and Grade Services

### Security

**IMPORTANTE:** Las credenciales reales NO deben estar en el código fuente.

1. **Development:** Usar placeholders en seeds
2. **Production:** Usar `manage-secrets.sh` para configurar credenciales
3. **Deployment:** Validar JWKs y endpoints antes de habilitar
4. **Default:** Todos los consumidores inician con `is_enabled = false`

### Row Level Security (RLS) - 2026-02-03

**Gap Reference:** GAP-SYS-001 (CRITICAL - Security) - RESOLVED

| Tabla | Policies | Riesgo | Estado |
|-------|----------|--------|--------|
| lti_consumers | 6 | CRITICO | RLS + FORCE |
| lti_sessions | 5 | ALTO | RLS + FORCE |
| lti_grade_passback | 6 | ALTO | RLS + FORCE |

**Total:** 17 politicas RLS

**Modelo de Seguridad:**
- **super_admin:** Acceso completo, puede eliminar registros
- **admin_teacher:** Lectura completa, gestion de configuracion
- **student:** Solo lectura de sus propios datos
- **service_role:** Bypass para operaciones del backend (LTI launch, grade sync)

### Configuración Post-Deployment

Ver documentación completa en:
- Epic: `docs/03-fase-extensiones/EXT-007-lti-integration/`
- Spec Técnica: `docs/02-especificaciones-tecnicas/lti-integration/`
- Seed con instrucciones: `seeds/prod/lti_integration/01-lti_consumers.sql`

---

**Creado:** 2025-11-11
**Schema nuevo:** Introducido en v2.3.1
**Propósito:** Permitir integración de GAMILIT como LTI Tool en plataformas LMS externas
