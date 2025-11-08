# _MAP: docs/02-especificaciones-tecnicas/adr/

**Última actualización:** 2025-11-07
**Propósito:** Architecture Decision Records (ADRs) - Decisiones arquitectónicas documentadas
**Audiencia:** Tech Leads, Arquitectos de Software, Desarrolladores Senior
**Estado:** 🟡 En desarrollo

---

## 📁 Contenido de esta Carpeta

### Architecture Decision Records

| ADR | Título | Fecha | Estado | Impacto |
|-----|--------|-------|--------|---------|
| ADR-005 | Multi-tenancy Implementation | 2025-11-07 | ✅ Aceptado | Alto |

**Total ADRs:** 1

---

## 🔗 Interdependencias

### Decisiones Relacionadas

**Afecta a:**
- [Autenticación](../01-autenticacion-autorizacion/) - Multi-tenancy impacta RBAC
- [Admin Portal](../../01-requerimientos/admin-portal/) - Gestión de organizaciones
- Database - Schema `auth_management.tenants`

---

## 📊 Métricas

- **Total ADRs:** 1
- **ADRs aceptados:** 1
- **ADRs propuestos:** 0
- **ADRs rechazados:** 0
- **ADRs obsoletos:** 0

---

## 🎯 ADRs Existentes

### ADR-005: Multi-tenancy Implementation ⭐⭐⭐⭐

**Decisión:** Implementar multi-tenancy usando Supabase RLS + tenants table

**Contexto:**
- Necesidad de soportar múltiples organizaciones/escuelas
- Cada organización debe tener datos aislados
- Administradores por organización

**Alternativas consideradas:**
1. Database per tenant (rechazado - complejo)
2. Schema per tenant (rechazado - limitación Supabase)
3. **RLS + tenants table** (seleccionado)

**Consecuencias:**
- ✅ Simple de implementar
- ✅ Soportado nativamente por Supabase
- ✅ Escalable
- ⚠️ Requiere RLS policies en todas las tablas

---

## 🚀 ADRs Planeados

### Próximos ADRs a Documentar

1. [ ] ADR-001: Elección de Framework Backend (NestJS)
2. [ ] ADR-002: Elección de Database (PostgreSQL + Supabase)
3. [ ] ADR-003: Elección de Frontend Framework (React + Vite)
4. [ ] ADR-004: Arquitectura de Gamificación
5. [ ] ADR-006: Estrategia de Testing
6. [ ] ADR-007: Deployment Strategy
7. [ ] ADR-008: CI/CD Pipeline

---

## 📐 Formato de ADR

### Template Estándar

```markdown
# ADR-XXX: [Título de la Decisión]

**Fecha:** YYYY-MM-DD
**Estado:** [Propuesto | Aceptado | Rechazado | Obsoleto]
**Deciders:** [Lista de personas que tomaron la decisión]

## Contexto y Problema

[Descripción del contexto y el problema que motivó la decisión]

## Drivers de Decisión

* [Driver 1]
* [Driver 2]
* ...

## Opciones Consideradas

* [Opción 1]
* [Opción 2]
* [Opción 3]

## Decisión

[Opción seleccionada y justificación]

## Consecuencias

### Positivas

* [Consecuencia positiva 1]
* [Consecuencia positiva 2]

### Negativas

* [Consecuencia negativa 1]
* [Consecuencia negativa 2]

### Neutrales

* [Consecuencia neutral 1]

## Referencias

* [Link a documentación relevante]
* [Link a discusión]
```

---

## 📚 Recursos sobre ADRs

**Guías:**
- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

**Herramientas:**
- [adr-tools](https://github.com/npryce/adr-tools) - CLI para crear ADRs
- [adr-log](https://github.com/joelparkerhenderson/architecture_decision_record) - Templates

---

## 📖 Guía de Navegación

**Si buscas...**
- **Multi-tenancy:** Ver [ADR-005-multi-tenancy-implementation.md](./ADR-005-multi-tenancy-implementation.md)
- **Decisiones de tech stack:** Ver ADR-001, ADR-002, ADR-003 (cuando se documenten)
- **Decisiones de arquitectura:** Ver ADR-004, ADR-006 (cuando se documenten)
