# _MAP: EXT-007 - LTI Integration

**Epica:** EXT-007
**Nombre:** Integracion LTI 1.3 (Learning Tools Interoperability)
**Fase:** 3 - Extensiones (Alcance v2 EXTENSIONES)
**Presupuesto Total:** $6,000 USD
**Story Points Total:** 40 SP
**Estado:** 40% IMPLEMENTADA
**Ultima actualizacion:** 2026-01-27

**CAMBIOS:**
- **2026-01-27:** Completar ET documentation (ET-LTI-003, ET-LTI-004, IMPLEMENTATION-CHECKLIST)
- **2026-01-27:** Actualizar README con estado actual de implementacion
- **2025-11-20:** Documentacion inicial creada post validacion de alcances
- **Estado Actual:** Backend structure completo, OIDC/Deep Linking/AGS real pendiente

---

## Proposito

Integrar GAMILIT con sistemas de gestion de aprendizaje (LMS) institucionales mediante el estandar LTI 1.3.

**Impacto:** **ALTO** - Critico para adopcion institucional B2B

---

## Estructura de Documentos

```
EXT-007-lti-integration/
├── README.md                         # Descripcion general y estado
├── _MAP.md                           # Este archivo
├── IMPLEMENTATION-CHECKLIST.md       # Checklist detallado de implementacion
│
├── historias-usuario/
│   ├── US-LTI-001-oidc-login.md      # OIDC Login Flow
│   ├── US-LTI-002-grade-passback.md  # Grade Passback (AGS)
│   ├── US-LTI-003-deep-linking.md    # Deep Linking
│   └── US-LTI-004-platform-config.md # Platform Configuration UI
│
├── especificaciones/
│   ├── ET-LTI-001-grade-passback.md     # Especificacion tecnica AGS (60%)
│   ├── ET-LTI-002-deep-linking.md       # Especificacion tecnica DL (25%)
│   ├── ET-LTI-003-consumer-management.md # Especificacion Admin UI (70%)
│   └── ET-LTI-004-testing-validation.md  # Especificacion Testing (20%)
│
├── requerimientos/
│   └── _MAP.md
│
└── tareas/
    └── _MAP.md
```

---

## User Stories

| ID | Titulo | SP | Prioridad | Estado |
|----|--------|----|-----------|--------|
| **US-LTI-001** | OIDC Login Flow | 12 | P0 | Pendiente |
| **US-LTI-002** | Grade Passback (AGS) | 10 | P1 | 60% |
| **US-LTI-003** | Deep Linking | 10 | P1 | 25% |
| **US-LTI-004** | Platform Configuration UI | 8 | P1 | 70% |

**Total:** 40 SP

---

## Especificaciones Tecnicas

| ID | Titulo | Completitud | Detalle |
|----|--------|-------------|---------|
| **ET-LTI-001** | Grade Passback | 60% | Entity/Service/Controller completos, falta AGS real |
| **ET-LTI-002** | Deep Linking | 25% | Solo entities base, falta controller y UI |
| **ET-LTI-003** | Consumer Management | 70% | Backend completo, falta Admin UI |
| **ET-LTI-004** | Testing & Validation | 20% | Solo entity tests, falta E2E |

---

## Implementacion Actual

### Backend (65% completo)

| Componente | Estado | Archivo |
|------------|--------|---------|
| LtiConsumer Entity | COMPLETO | `entities/lti-consumer.entity.ts` |
| LtiSession Entity | COMPLETO | `entities/lti-session.entity.ts` |
| LtiGradePassback Entity | COMPLETO | `entities/lti-grade-passback.entity.ts` |
| LtiConsumersService | COMPLETO | `services/lti-consumers.service.ts` |
| LtiSessionsService | COMPLETO | `services/lti-sessions.service.ts` |
| LtiGradePassbacksService | COMPLETO | `services/lti-grade-passbacks.service.ts` |
| LtiConsumersController | COMPLETO | `controllers/lti-consumers.controller.ts` |
| LtiSessionsController | COMPLETO | `controllers/lti-sessions.controller.ts` |
| LtiGradePassbacksController | COMPLETO | `controllers/lti-grade-passbacks.controller.ts` |
| LtiModule | COMPLETO | `lti.module.ts` |

### Frontend (15% completo)

| Componente | Estado | Archivo |
|------------|--------|---------|
| ltiAPI | COMPLETO | `services/api/ltiAPI.ts` |
| Admin UI Pages | PENDIENTE | -- |
| Content Picker | PENDIENTE | -- |

### Testing (20% completo)

| Componente | Estado | Archivo |
|------------|--------|---------|
| Entity Tests | COMPLETO | `__tests__/lti-entities.spec.ts` |
| Service Tests | PENDIENTE | -- |
| E2E Tests | PENDIENTE | -- |

---

## LMS Compatibility

| LMS | Prioridad | OIDC | AGS | Deep Linking | NRPS |
|-----|-----------|------|-----|--------------|------|
| Canvas | P1 | Pendiente | Pendiente | Pendiente | Pendiente |
| Moodle | P2 | Pendiente | Pendiente | Pendiente | Pendiente |
| Blackboard | P3 | Pendiente | Pendiente | Pendiente | Parcial |
| Google Classroom | P4 | N/A | Parcial | N/A | N/A |

---

## Esfuerzo Restante

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

### Bloqueado Por
- EAI-001: Sistema de autenticacion base
- EAI-002: Mecanicas educativas

### Bloquea
- EXT-002: Admin Extendido
- EXT-005: Reportes Avanzados

---

**Generado:** 2026-01-27
**Version:** 2.0
