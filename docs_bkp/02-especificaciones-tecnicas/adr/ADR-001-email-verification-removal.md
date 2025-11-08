# ADR-001: Remoción de Email Verification

**Fecha:** 2025-10-28
**Estado:** ✅ Aceptado
**Autores:** Product Owner, Tech Lead
**Impacto:** Alto - Afecta autenticación y onboarding

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro de estudiante](../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md) - Flujo simplificado sin verificación email
- [UC-STU-002: Onboarding de estudiante](../../../01-requerimientos/casos-uso/student/UC-STU-002-onboarding.md) - Acceso inmediato post-registro

**User Stories:**
- [US-FUND-001: Autenticación básica JWT](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-001-autenticacion-basica-jwt.md) - Registro sin verificación email

**Épicas:**
- [EAI-001: Fundamentos](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - Sistema de autenticación simplificado

**ADRs relacionados:**
- [ADR-002: JWT Security Implementation](./ADR-002-jwt-security-implementation.md) - Complementa decisión de autenticación
- [ADR-003: RLS vs App-Layer Authorization](./ADR-003-rls-vs-app-layer-authorization.md) - Control de acceso institucional

**Requerimientos funcionales:**
- Control institucional por Teacher/Admin Portal (mitigación de riesgos)
- CAPTCHA y rate limiting (seguridad anti-spam)

---

## Contexto

El sistema originalmente incluía verificación de email en el flujo de registro. Durante octubre 2025 se decidió remover esta funcionalidad basado en el contexto específico de la plataforma educativa GAMILIT.

**Características del contexto:**
- Plataforma para instituciones educativas (escuelas, colegios)
- Supervisión activa por maestros y administradores
- Usuarios (estudiantes) pertenecen a organizaciones verificadas
- Registro típicamente mediante invitación institucional

---

## Decisión

**Remover completamente** el flujo de verificación de email del sistema.

**Nuevo flujo de registro:**
1. Usuario completa formulario de registro
2. Usuario automáticamente marcado como verificado (`email_verified: true`)
3. Acceso inmediato a plataforma (si pertenece a organización activa)
4. Gestión de usuarios desde Teacher/Admin Portal

---

## Consecuencias

### Positivas ✅
- **Reducción de fricción:** Onboarding estudiantil más rápido y simple
- **Mejor UX:** Acceso inmediato sin esperar email
- **Simplicidad técnica:** Menos código, menos endpoints, menos complejidad
- **Control institucional:** Gestión centralizada desde portal administrativo
- **Mantenimiento:** Menos infraestructura email (templates, queues, retries)

### Negativas ⚠️
- **Validación de emails:** No se verifican emails reales
- **Registros falsos:** Posible aumento de registros con emails inválidos
- **Bounce rate:** Campañas de email pueden tener mayor tasa de rebote
- **Recuperación de cuenta:** Sin email verificado, recuperación más compleja

### Riesgos y Mitigaciones 🛡️

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Spam/bots registrándose | MEDIA | CAPTCHA en registro + rate limiting estricto |
| Emails inválidos | ALTA | Validación de formato + bounce tracking en campaigns |
| Abuso del sistema | BAJA | Control por organización + aprobación de maestros |
| Pérdida de contacto | MEDIA | Recordatorios para verificar email después del registro |

---

## Alternativas Consideradas

### Opción A: Email Verification Completa
- **Esfuerzo:** 40 horas
- **Costo:** $6,000
- **Pros:** Emails 100% verificados, lista limpia para campaigns
- **Contras:** Fricción en onboarding, complejidad técnica, costo de desarrollo
- **Decisión:** ❌ Rechazada - Fricción inaceptable para contexto educativo

### Opción B: Soft Verification (Opcional)
- **Esfuerzo:** 20 horas
- **Costo:** $3,000
- **Pros:** Funciones limitadas sin verificar, eventual verificación
- **Contras:** UX confusa, complejidad media
- **Decisión:** ❌ Rechazada - Complejidad sin beneficio claro

### Opción C: CAPTCHA + Rate Limiting (SELECCIONADA)
- **Esfuerzo:** 8 horas
- **Costo:** $1,200
- **Pros:** Balance entre simplicidad y protección anti-spam
- **Contras:** No valida emails reales
- **Decisión:** ✅ Aceptada - Solución pragmática para contexto educativo

---

## Implementación

### Cambios en Código

**Backend:**
- ❌ Removido: `EmailVerificationService`
- ❌ Removido: Endpoints `/auth/verify-email` y `/auth/resend-verification`
- ✅ Registro directo con `email_verified: true`

**Frontend:**
- ❌ Removido: `EmailVerificationPage` component
- ❌ Removido: Rutas `/email-verification` y `/verify-email`
- ✅ Redirect directo a dashboard después de registro

**Base de Datos:**
- ⚠️ Tabla `email_verification_tokens` marcada como DEPRECATED
- Mantenida por compatibilidad histórica
- No se usa en nuevo código

### Cambios en Documentación
- 33+ archivos actualizados
- Versiones de dependencias corregidas
- Diagramas actualizados
- Roadmap y sprints actualizados

---

## Compliance y Estándares

**GDPR:** ✅ Cumple - Usuarios pueden actualizar su email en perfil
**Contexto educativo:** ✅ Apropiado - Supervisión institucional presente
**OWASP:** ✅ Mitigado - CAPTCHA y rate limiting implementados

---

## Decisiones Relacionadas

- ADR-002: JWT Security Implementation (pendiente)
- ADR-006: Authentication Architecture (pendiente)
- Epic EP002: Authentication

---

## Referencias

- Plan de limpieza: `/docs-analisys/doc-validation/TAREAS_LIMPIEZA_EMAIL_VERIFICATION.md`
- Issue: ISSUE-P0-006 (Email Verification Decision)
- Análisis: `/docs-analisys/doc-validation/integraciones/ANALISIS_COMPLETO_APIS.md`

---

## Revisiones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-28 | Decisión inicial | Product Owner + Tech Lead |
| - | Pendiente revisión post-implementación | - |

---

*ADR-001 - Creado: 28 de Octubre, 2025*
*Estado: Aceptado e implementado en documentación*
