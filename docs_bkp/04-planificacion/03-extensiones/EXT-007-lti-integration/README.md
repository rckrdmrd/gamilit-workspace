# EXT-007: LTI Integration

**Versión:** 1.0
**Fecha de creación:** 2025-11-07
**Prioridad:** P2 (Promovida desde P3)
**Story Points:** 40 SP
**Presupuesto:** $6,000 USD
**Timeline:** v1.3 (Sprints 17-24)
**Estado:** 📋 Planificado

---

## 📋 Descripción

Integración completa con Learning Management Systems (LMS) mediante el estándar **LTI 1.3** (Learning Tools Interoperability) de IMS Global, permitiendo que GAMILIT Platform funcione como una herramienta educativa embebida dentro de Canvas, Moodle, Blackboard y Google Classroom.

## 🎯 Objetivos de Negocio

### Problema a Resolver
Las instituciones educativas ya utilizan LMS (Canvas, Moodle, etc.) como plataforma central. Requieren integración nativa para:
- Single Sign-On (SSO) automático de estudiantes y profesores
- Sincronización automática de calificaciones (grade passback)
- Deep linking para seleccionar contenido específico
- Gestión centralizada desde el LMS institucional

### Valor Esperado
- **B2B Adoption:** +60% (instituciones con LMS requieren integración)
- **Ahorro tiempo profesores:** 3h/semana (no gestionar usuarios/calificaciones manualmente)
- **ARR incremental:** +$30,000/año
- **ROI:** 850% en año 1
- **Churn reduction:** -20% (menos fricción = mayor retención)

### Métricas de Éxito
- **Adopción:** >40% instituciones usando LTI en 6 meses
- **Grade passback success rate:** >98%
- **SSO login time:** <3 segundos
- **NPS profesores:** +15 puntos
- **Support tickets:** -30% (menos problemas de acceso)

---

## 🏗️ Arquitectura Técnica

### Estándar LTI 1.3

**Componentes principales:**
1. **OIDC Login Flow** (OpenID Connect)
   - Autenticación segura vía LMS
   - JWT token validation (RSA-256)
   - State y nonce para CSRF/replay protection

2. **Grade Passback** (AGS - Assignment & Grades Services)
   - Envío automático de calificaciones al LMS
   - Sincronización bidireccional
   - Mapeo de scoring (0-100 GAMILIT→ escala LMS)

3. **Deep Linking** (Content Selection)
   - Profesores seleccionan ejercicios/módulos específicos
   - Configuración de actividades desde LMS
   - Preview de contenido

4. **Platform Configuration**
   - Registro de plataformas LMS
   - Key management (public/private keys)
   - Multi-tenant isolation

### Stack Tecnológico

**Backend:**
- **Framework:** NestJS + TypeScript
- **Biblioteca:** `@nest-edu/lti` (wrapper de `ltijs`)
- **Database:** PostgreSQL (schema `lti_integration`, 5 tablas)
- **Seguridad:** RSA-256, JWT validation, HTTPS only

**Frontend:**
- **UI:** Página de configuración LTI en Admin Portal
- **Testing:** Herramienta de validación de integración

**Plataformas soportadas:**
- Canvas (12h) - Prioridad 1
- Moodle (10h) - Prioridad 2
- Blackboard (10h) - Prioridad 3
- Google Classroom (8h) - Prioridad 4

---

## 👥 User Stories

### Core Stories (4 historias - 40h total)

| ID | Historia | Esfuerzo | Prioridad |
|----|----------|----------|-----------|
| [US-LTI-001](./historias/US-LTI-001-oidc-login.md) | OIDC Login Flow | 12h | P0 |
| [US-LTI-002](./historias/US-LTI-002-grade-passback.md) | Grade Passback (AGS) | 10h | P1 |
| [US-LTI-003](./historias/US-LTI-003-deep-linking.md) | Deep Linking | 10h | P2 |
| [US-LTI-004](./historias/US-LTI-004-platform-config.md) | Platform Configuration UI | 8h | P1 |

**Total:** 40 horas ($6,000 USD)

---

## 🗄️ Modelo de Datos

### Schema: `lti_integration`

```sql
CREATE SCHEMA IF NOT EXISTS lti_integration;

-- Tabla 1: Plataformas LMS registradas
CREATE TABLE lti_integration.lti_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth_management.tenants(id),
  platform_name VARCHAR(100) NOT NULL, -- "Canvas Universidad X"
  issuer VARCHAR(255) NOT NULL, -- URL del LMS
  client_id VARCHAR(255) NOT NULL,
  auth_login_url TEXT NOT NULL,
  auth_token_url TEXT NOT NULL,
  key_set_url TEXT NOT NULL, -- JWKS endpoint
  deployment_id VARCHAR(255) NOT NULL,
  public_key TEXT, -- Clave pública para validar JWTs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 2: Contextos LTI (cursos/clases)
CREATE TABLE lti_integration.lti_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES lti_integration.lti_platforms(id),
  lms_context_id VARCHAR(255) NOT NULL, -- ID del curso en LMS
  context_title VARCHAR(255), -- "Comprensión Lectora 101"
  context_label VARCHAR(100), -- "CL101"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 3: Lanzamientos LTI (cada vez que usuario accede)
CREATE TABLE lti_integration.lti_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES lti_integration.lti_platforms(id),
  context_id UUID REFERENCES lti_integration.lti_contexts(id),
  user_id UUID REFERENCES auth_management.users(id),
  lms_user_id VARCHAR(255), -- ID del usuario en LMS
  launch_type VARCHAR(50), -- 'login', 'deep_linking', 'grade_passback'
  id_token TEXT, -- JWT token del LMS
  launched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 4: Recursos LTI (ejercicios/módulos enlazados)
CREATE TABLE lti_integration.lti_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES lti_integration.lti_platforms(id),
  context_id UUID NOT NULL REFERENCES lti_integration.lti_contexts(id),
  exercise_id UUID REFERENCES educational_content.exercises(id),
  module_id UUID REFERENCES educational_content.modules(id),
  line_item_url TEXT, -- URL para grade passback
  resource_title VARCHAR(255),
  max_score DECIMAL(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 5: Grade Passback Log
CREATE TABLE lti_integration.lti_grade_passback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES lti_integration.lti_resources(id),
  user_id UUID NOT NULL REFERENCES auth_management.users(id),
  score_given DECIMAL(5,2),
  score_maximum DECIMAL(5,2),
  activity_progress VARCHAR(50), -- 'Initialized', 'Started', 'InProgress', 'Completed'
  grading_progress VARCHAR(50), -- 'FullyGraded', 'Pending', 'NotReady'
  passback_status VARCHAR(20), -- 'success', 'failed'
  error_message TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lti_platforms_tenant ON lti_integration.lti_platforms(tenant_id);
CREATE INDEX idx_lti_contexts_platform ON lti_integration.lti_contexts(platform_id);
CREATE INDEX idx_lti_launches_user ON lti_integration.lti_launches(user_id);
CREATE INDEX idx_lti_resources_exercise ON lti_integration.lti_resources(exercise_id);
CREATE INDEX idx_lti_grade_log_user ON lti_integration.lti_grade_passback_log(user_id);
```

---

## 🔗 Dependencias

### Bloqueado por
- **EAI-001:** Sistema de autenticación base debe estar completo
- **EAI-002:** Mecánicas educativas y ejercicios funcionando
- **P0/P1 fixes:** Seguridad y funcionalidad crítica resueltos

### Bloquea
- **EXT-002:** Admin Extendido (gestión de tenants con LTI)
- **EXT-005:** Reportes Avanzados (métricas de integración LTI)

---

## 🚀 Plan de Implementación

### Sprint 17 (Semanas 17-18) - 20h
- **US-LTI-001:** OIDC Login Flow completo (12h)
- **US-LTI-004:** Platform Configuration UI básica (8h)

### Sprint 18 (Semanas 19-20) - 20h
- **US-LTI-002:** Grade Passback (AGS) (10h)
- **US-LTI-003:** Deep Linking (10h)

**Testing y Validación:** 8h adicionales (distribuidas en ambos sprints)

---

## 🧪 Testing

### Test Cases Críticos
1. **OIDC Login:**
   - Usuario LMS puede acceder a GAMILITsin credenciales adicionales
   - Sesión LMS expirada redirige a login LMS
   - JWT inválido/expirado es rechazado

2. **Grade Passback:**
   - Score 100% en GAMILIT→ 100% en LMS
   - Múltiples intentos envían el score más alto
   - Errores de red reintentam automáticamente

3. **Deep Linking:**
   - Profesor selecciona ejercicio → aparece en LMS
   - Estudiante hace clic → abre ejercicio correcto
   - Cambios en GAMILITactualizan título en LMS

4. **Multi-tenant Isolation:**
   - Tenant A no puede acceder a configuración LTI de Tenant B
   - LMS de Tenant A solo ve contextos de Tenant A

### Herramientas de Testing
- **LTI Advantage Validator:** Herramienta oficial IMS Global
- **Canvas Free for Teachers:** Ambiente de pruebas Canvas
- **Moodle Sandbox:** Instalación de prueba Moodle

---

## 📊 KPIs de la Épica

### Durante Desarrollo
- **Code coverage:** >80%
- **Security scan:** 0 vulnerabilidades críticas/altas
- **Performance:** Login LTI <3 segundos

### Post-Lanzamiento (3 meses)
- **Instituciones usando LTI:** >15 (de ~40 total)
- **Grade passback success rate:** >98%
- **Support tickets LTI:** <5% total tickets
- **NPS profesores (LTI):** >60

---

## 🔐 Consideraciones de Seguridad

### Implementadas
- ✅ RSA-256 para firma de JWT
- ✅ State y nonce para CSRF/replay protection
- ✅ HTTPS only (no HTTP)
- ✅ Token expiration validation
- ✅ Multi-tenant isolation estricta
- ✅ Audit logging de todas las operaciones LTI

### Riesgos Mitigados
- **Token theft:** httpOnly cookies, short expiration
- **MITM attacks:** HTTPS only, certificate pinning
- **Unauthorized grade changes:** Ownership validation, audit trail
- **Data leakage:** RLS policies, tenant isolation

---

## 📚 Referencias

### Documentación Técnica
- [IMS Global LTI 1.3 Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- [LTI Advantage Overview](https://www.imsglobal.org/lti-advantage-overview)
- [Canvas LTI Documentation](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [Moodle LTI Integration](https://docs.moodle.org/en/LTI_and_Moodle)

### Documentación Interna
- [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](../../features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md) - Especificación completa
- [FEATURES-PENDIENTES.md](../../features/FEATURES-PENDIENTES.md) - F-P2-019: LTI Integration
- [RESUMEN-EJECUTIVO-DECISIONES-P3.md](../../features/RESUMEN-EJECUTIVO-DECISIONES-P3.md) - Business case

---

**Creado:** 2025-11-07
**Última actualización:** 2025-11-07
**Responsable:** Tech Lead + Backend Team
**Revisor:** Product Owner + Security Team
