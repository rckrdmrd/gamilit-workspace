# _MAP: EXT-007 - LTI Integration

**Épica:** EXT-007
**Nombre:** Integración LTI 1.3 (Learning Tools Interoperability)
**Fase:** 3 - Extensiones (Alcance v2 EXTENSIONES)
**Presupuesto Total:** $18,000 MXN
**Story Points Total:** 45 SP
**Estado:** 🟡 40% IMPLEMENTADA (18 SP impl, 27 SP pend)
**Última actualización:** 2025-11-20

**CAMBIOS:**
- **2025-11-20:** Documentación inicial creada post validación de alcances
- **Estado Actual:** Basic auth + Launch implementados, Deep linking/Grade passback/NRPS pendientes

---

## 📋 Propósito

Integrar GAMILIT con sistemas de gestión de aprendizaje (LMS) institucionales mediante el estándar LTI 1.3.

**Impacto:** **ALTO** - Crítico para adopción institucional B2B

---

## 📁 User Stories (6 total)

| ID | Título | SP | Prioridad | Estado |
|----|--------|----|-----------|--------|
| **US-LTI-001** | LTI 1.3 Basic Authentication | 9 | P1 | ✅ 100% |
| **US-LTI-002** | LTI Launch Flow | 9 | P1 | ✅ 100% |
| **US-LTI-003** | Deep Linking | 9 | P1 | 📝 Pendiente |
| **US-LTI-004** | Grade Passback (AGS) | 9 | P2 | 📝 Pendiente |
| **US-LTI-005** | NRPS | 9 | P2 | 📝 Pendiente |
| **US-LTI-006** | Analytics | - | P3 | 📝 Backlog |

**Total:** 18/45 SP implementados (40%)

---

## 🎯 Implementación

**Database:** `lti_integration` schema (3/6 tablas)
**Backend:** `apps/backend/src/modules/lti/` (2/5 services)
**Endpoints:** 3/8+ implementados

---

**Generado:** 2025-11-20
