# _MAP: EXT-007 - LTI Integration (Parcial)

**Épica:** EXT-007
**Nombre:** LTI Integration
**Fase:** 3 - Extensiones
**Presupuesto:** $12,000 MXN
**Story Points:** 45 SP
**Estado:** 🟡 Parcial 40%

---

## 📋 Propósito

Integración con LMS externos (Moodle, Canvas, Blackboard) mediante protocolo LTI 1.3 (Learning Tools Interoperability).

**Impacto:** **MEDIO** - Habilita integración con plataformas enterprise

---

## 📁 Contenido

| Archivo | Descripción |
|---------|-------------|
| [README.md](./README.md) | Overview de la épica |
| [historias-usuario/](./historias-usuario/) | User stories (~6) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad |

---

## 🎯 Funcionalidades

### ✅ Implementado (40%)

- LTI 1.3 basic authentication
- Tool registration
- Basic launch flow
- LTI Advantage essentials

### ⚪ Pendiente (60%)

- Deep linking
- Grade passback (AGS)
- Names & Roles Provisioning (NRPS)
- Content item selection
- Full Canvas integration
- Full Moodle integration

---

## 🏗️ Implementación

### Backend
- **Módulo:** `lti` (parcial)
- **Estado:** Basic auth y launch implementado

### Base de Datos
- **Tablas:** lti_consumers, lti_sessions (parcial)

---

## 📊 Estado

| Aspecto | Completitud |
|---------|-------------|
| **Authentication** | ✅ 100% |
| **Basic Launch** | ✅ 100% |
| **Deep Linking** | ⚪ 0% |
| **Grade Passback** | ⚪ 0% |
| **NRPS** | ⚪ 0% |

**Overall:** 🟡 40% completado

---

## 💡 Notas

- Requiere contratos enterprise con instituciones
- Depende de roadmap 2025
- Diseño completo disponible

---

**Generado:** 2025-11-08
