---
titulo: "EPIC-GAM-F3-LTI: LTI Integration"
tipo: epic
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# EPIC-GAM-F3-LTI: LTI Integration

> **BACKLOG - FUERA DEL MVP**
>
> Esta epica esta **parcialmente implementada (40%)** y **NO forma parte del MVP actual**.
> Razon: Depende de contratos enterprise.
> Ver: [Epics Index](../_INDEX.md)

**Version:** 2.0
**Fecha de creacion:** 2025-11-07
**Ultima actualizacion:** 2026-01-27
**Prioridad:** P2 (Promovida desde P3)
**Story Points:** 40 SP
**Presupuesto:** $6,000 USD
**Timeline:** v1.3 (Sprints 17-24)
**Estado:** BACKLOG (40% implementado)

---

## Estado de Implementacion

### Progreso por Componente

| Componente | Estado | Completitud | Ubicacion |
|------------|--------|-------------|-----------|
| **Entities** | COMPLETO | 100% | `apps/backend/src/modules/lti/entities/` |
| **Services** | COMPLETO | 100% | `apps/backend/src/modules/lti/services/` |
| **Controllers** | COMPLETO | 100% | `apps/backend/src/modules/lti/controllers/` |
| **DTOs** | COMPLETO | 100% | `apps/backend/src/modules/lti/dto/` |
| **Frontend API** | COMPLETO | 100% | `apps/frontend/src/services/api/ltiAPI.ts` |
| **Entity Tests** | COMPLETO | 100% | `apps/backend/src/modules/lti/__tests__/` |
| **OIDC Login** | PENDIENTE | 0% | -- |
| **AGS Integration** | PENDIENTE | 30% | -- |
| **Deep Linking** | PENDIENTE | 25% | -- |
| **Admin UI** | PENDIENTE | 0% | -- |

### Resumen

- **Backend Structure:** 65% completo (entities, services, controllers, DTOs)
- **Frontend Structure:** 15% completo (solo API client)
- **LTI Core Features:** 0% completo (OIDC, AGS real, Deep Linking)
- **Testing:** 20% completo (solo entity tests)

---

## Descripcion

Integracion completa con Learning Management Systems (LMS) mediante el estandar **LTI 1.3** (Learning Tools Interoperability) de IMS Global, permitiendo que GAMILIT Platform funcione como una herramienta educativa embebida dentro de Canvas, Moodle, Blackboard y Google Classroom.

## Objetivos de Negocio

### Problema a Resolver
Las instituciones educativas ya utilizan LMS (Canvas, Moodle, etc.) como plataforma central. Requieren integracion nativa para:
- Single Sign-On (SSO) automatico de estudiantes y profesores
- Sincronizacion automatica de calificaciones (grade passback)
- Deep linking para seleccionar contenido especifico
- Gestion centralizada desde el LMS institucional

### Valor Esperado
- **B2B Adoption:** +60% (instituciones con LMS requieren integracion)
- **Ahorro tiempo profesores:** 3h/semana (no gestionar usuarios/calificaciones manualmente)
- **ARR incremental:** +$30,000/ano
- **ROI:** 850% en ano 1
- **Churn reduction:** -20% (menos friccion = mayor retencion)

### Metricas de Exito
- **Adopcion:** >40% instituciones usando LTI en 6 meses
- **Grade passback success rate:** >98%
- **SSO login time:** <3 segundos
- **NPS profesores:** +15 puntos
- **Support tickets:** -30% (menos problemas de acceso)

---

## Arquitectura Tecnica

### Estandar LTI 1.3

**Componentes principales:**
1. **OIDC Login Flow** (OpenID Connect)
   - Autenticacion segura via LMS
   - JWT token validation (RSA-256)
   - State y nonce para CSRF/replay protection

2. **Grade Passback** (AGS - Assignment & Grades Services)
   - Envio automatico de calificaciones al LMS
   - Sincronizacion bidireccional
   - Mapeo de scoring (0-100 GAMILIT -> escala LMS)

3. **Deep Linking** (Content Selection)
   - Profesores seleccionan ejercicios/modulos especificos
   - Configuracion de actividades desde LMS
   - Preview de contenido

4. **Platform Configuration**
   - Registro de plataformas LMS
   - Key management (public/private keys)
   - Multi-tenant isolation

### Archivos Implementados

```
apps/backend/src/modules/lti/
├── __tests__/
│   └── lti-entities.spec.ts          # Unit tests (24 tests)
├── controllers/
│   ├── index.ts
│   ├── lti-consumers.controller.ts   # 9 endpoints
│   ├── lti-grade-passbacks.controller.ts  # 11 endpoints
│   └── lti-sessions.controller.ts    # 10 endpoints
├── dto/
│   ├── index.ts
│   ├── create-lti-consumer.dto.ts
│   ├── update-lti-consumer.dto.ts
│   ├── lti-consumer-response.dto.ts
│   ├── create-lti-session.dto.ts
│   ├── lti-session-response.dto.ts
│   ├── create-lti-grade-passback.dto.ts
│   ├── update-lti-grade-passback.dto.ts
│   └── lti-grade-passback-response.dto.ts
├── entities/
│   ├── index.ts
│   ├── lti-consumer.entity.ts        # LMS platform config
│   ├── lti-session.entity.ts         # Launch sessions
│   └── lti-grade-passback.entity.ts  # Grade sync tracking
├── services/
│   ├── index.ts
│   ├── lti-consumers.service.ts
│   ├── lti-sessions.service.ts
│   └── lti-grade-passbacks.service.ts
└── lti.module.ts

apps/frontend/src/services/api/
└── ltiAPI.ts                         # consumersAPI, gradePassbacksAPI, sessionsAPI
```

---

## User Stories

### Core Stories (4 historias - 40h total)

| ID | Historia | Esfuerzo | Prioridad | Estado |
|----|----------|----------|-----------|--------|
| [US-LTI-001](./user-stories/US-LTI-001/US-LTI-001-oidc-login.md) | OIDC Login Flow | 12h | P0 | Pendiente |
| [US-LTI-002](./user-stories/US-LTI-002/US-LTI-002-grade-passback.md) | Grade Passback (AGS) | 10h | P1 | Parcial |
| [US-LTI-003](./user-stories/US-LTI-003/US-LTI-003-deep-linking.md) | Deep Linking | 10h | P2 | Parcial |
| [US-LTI-004](./user-stories/US-LTI-004/US-LTI-004-platform-config.md) | Platform Configuration UI | 8h | P1 | Parcial |

**Total:** 40 horas ($6,000 USD)

---

## Especificaciones Tecnicas (ET)

| ID | Titulo | Completitud | Archivo |
|----|--------|-------------|---------|
| ET-LTI-001 | Grade Passback (AGS) | 60% | [Ver](./specifications/ET-LTI-001-grade-passback.md) |
| ET-LTI-002 | Deep Linking | 25% | [Ver](./specifications/ET-LTI-002-deep-linking.md) |
| ET-LTI-003 | Consumer Management | 70% | [Ver](./specifications/ET-LTI-003-consumer-management.md) |
| ET-LTI-004 | Testing & Validation | 20% | [Ver](./specifications/ET-LTI-004-testing-validation.md) |

---

## LMS Compatibility Matrix

| LMS | OIDC | AGS | Deep Linking | NRPS | Prioridad |
|-----|------|-----|--------------|------|-----------|
| Canvas | Pendiente | Pendiente | Pendiente | Pendiente | P1 |
| Moodle | Pendiente | Pendiente | Pendiente | Pendiente | P2 |
| Blackboard | Pendiente | Pendiente | Pendiente | Parcial | P3 |
| Google Classroom | N/A | Parcial | N/A | N/A | P4 |

---

## Implementacion Checklist

Para detalle completo de implementacion, ver:
- [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

### Resumen de Esfuerzo Restante

| Fase | Horas | Prioridad |
|------|-------|-----------|
| OIDC Login Flow | 20h | P0 |
| Grade Passback (AGS real) | 16h | P1 |
| Deep Linking | 20h | P1 |
| Consumer Management UI | 16h | P1 |
| Testing & Validation | 20h | P2 |
| **TOTAL** | **92h** | |

---

## Dependencias

### Bloqueado por
- **EAI-001:** Sistema de autenticacion base debe estar completo
- **EAI-002:** Mecanicas educativas y ejercicios funcionando
- **P0/P1 fixes:** Seguridad y funcionalidad critica resueltos

### Bloquea
- **EPIC-GAM-F3-ADMIN-EXTENDED:** Admin Extendido (gestion de tenants con LTI)
- **EPIC-GAM-F3-REPORTS:** Reportes Avanzados (metricas de integracion LTI)

---

## Testing

### Test Cases Criticos
1. **OIDC Login:**
   - Usuario LMS puede acceder a GAMILIT sin credenciales adicionales
   - Sesion LMS expirada redirige a login LMS
   - JWT invalido/expirado es rechazado

2. **Grade Passback:**
   - Score 100% en GAMILIT -> 100% en LMS
   - Multiples intentos envian el score mas alto
   - Errores de red reintentan automaticamente

3. **Deep Linking:**
   - Profesor selecciona ejercicio -> aparece en LMS
   - Estudiante hace clic -> abre ejercicio correcto
   - Cambios en GAMILIT actualizan titulo en LMS

4. **Multi-tenant Isolation:**
   - Tenant A no puede acceder a configuracion LTI de Tenant B
   - LMS de Tenant A solo ve contextos de Tenant A

### Herramientas de Testing
- **LTI Advantage Validator:** Herramienta oficial IMS Global
- **Canvas Free for Teachers:** Ambiente de pruebas Canvas
- **Moodle Sandbox:** Instalacion de prueba Moodle

---

## KPIs de la Epica

### Durante Desarrollo
- **Code coverage:** >80%
- **Security scan:** 0 vulnerabilidades criticas/altas
- **Performance:** Login LTI <3 segundos

### Post-Lanzamiento (3 meses)
- **Instituciones usando LTI:** >15 (de ~40 total)
- **Grade passback success rate:** >98%
- **Support tickets LTI:** <5% total tickets
- **NPS profesores (LTI):** >60

---

## Consideraciones de Seguridad

### A Implementar
- RSA-256 para firma de JWT
- State y nonce para CSRF/replay protection
- HTTPS only (no HTTP)
- Token expiration validation
- Multi-tenant isolation estricta
- Audit logging de todas las operaciones LTI

### Riesgos a Mitigar
- **Token theft:** httpOnly cookies, short expiration
- **MITM attacks:** HTTPS only, certificate pinning
- **Unauthorized grade changes:** Ownership validation, audit trail
- **Data leakage:** RLS policies, tenant isolation

---

## Referencias

### Documentacion Tecnica
- [IMS Global LTI 1.3 Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- [LTI Advantage Overview](https://www.imsglobal.org/lti-advantage-overview)
- [Canvas LTI Documentation](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [Moodle LTI Integration](https://docs.moodle.org/en/LTI_and_Moodle)

### Documentacion Interna
- [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](../features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md) - Especificacion completa
- [FEATURES-PENDIENTES.md](../features/FEATURES-PENDIENTES.md) - F-P2-019: LTI Integration
- [RESUMEN-EJECUTIVO-DECISIONES-P3.md](../features/RESUMEN-EJECUTIVO-DECISIONES-P3.md) - Business case

---

**Creado:** 2025-11-07
**Ultima actualizacion:** 2026-01-27
**Responsable:** Tech Lead + Backend Team
**Revisor:** Product Owner + Security Team
