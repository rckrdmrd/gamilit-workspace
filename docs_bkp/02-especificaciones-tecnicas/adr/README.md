# Architecture Decision Records (ADRs)

Este directorio contiene los **Registros de Decisiones Arquitectónicas** (ADRs) del proyecto GAMILIT Platform.

---

## 📋 ¿Qué es un ADR?

Un ADR documenta una decisión arquitectónica significativa junto con su contexto y consecuencias.

**Propósito:**
- Documentar **por qué** se tomó una decisión
- Explicar el **contexto** en el momento de la decisión
- Registrar **alternativas** consideradas
- Describir **consecuencias** esperadas

---

## 📁 ÍNDICE DE ADRs

| ADR | Título | Fecha | Estado | Impacto |
|-----|--------|-------|--------|---------|
| [ADR-001](ADR-001-email-verification-removal.md) | Remoción de Email Verification | 2025-10-28 | ✅ Aceptado | Alto |
| [ADR-002](ADR-002-jwt-security-implementation.md) | JWT Security Implementation | 2025-10-28 | ✅ Aceptado | Alto |
| [ADR-003](ADR-003-rls-vs-app-layer-authorization.md) | RLS vs App-Layer Authorization | 2025-10-28 | ✅ Aceptado | Alto |
| [ADR-004](ADR-004-gamification-system-design.md) | Gamification System Design | 2025-10-28 | ✅ Aceptado | Medio |
| [ADR-005](ADR-005-multi-tenancy-implementation.md) | Multi-Tenancy Implementation | 2025-10-28 | ✅ Aceptado | Alto |

---

## 📝 FORMATO DE ADR

Cada ADR sigue esta estructura:

```markdown
# ADR-XXX: [Título]

**Fecha:** YYYY-MM-DD
**Estado:** [Propuesto | Aceptado | Rechazado | Deprecado | Supersedido]
**Autores:** [Nombres]
**Impacto:** [Bajo | Medio | Alto | Crítico]

## Contexto
[¿Qué problema estamos resolviendo? ¿Por qué ahora?]

## Decisión
[¿Qué decidimos hacer?]

## Consecuencias
### Positivas ✅
### Negativas ⚠️
### Riesgos y Mitigaciones 🛡️

## Alternativas Consideradas
[Otras opciones evaluadas y por qué no se eligieron]

## Implementación
[Cómo se implementó la decisión]

## Referencias
[Links a issues, PRs, docs relacionados]
```

---

## 🔄 ESTADOS DE ADR

| Estado | Descripción | Acción |
|--------|-------------|--------|
| **📝 Borrador** | En discusión, aún no decidido | Revisar y comentar |
| **✅ Aceptado** | Decisión tomada e implementada | Seguir la decisión |
| **❌ Rechazado** | Propuesta rechazada | No implementar |
| **⚠️ Deprecado** | Decisión ya no válida | Crear nuevo ADR |
| **🔄 Supersedido** | Reemplazado por otro ADR | Ver ADR nuevo |

---

## 📚 ADRs DISPONIBLES

### ADR-001: Remoción de Email Verification
**Estado:** ✅ Aceptado
**Fecha:** 2025-10-28
**Impacto:** Alto

**Resumen:** Se decidió remover completamente el flujo de verificación de email del sistema debido al contexto educativo de la plataforma, donde hay supervisión institucional y gestión centralizada de usuarios.

**Leer:** [ADR-001-email-verification-removal.md](ADR-001-email-verification-removal.md)

---

### ADR-002: JWT Security Implementation
**Estado:** ✅ Aceptado
**Fecha:** 2025-10-28
**Impacto:** Alto

**Resumen:** Documentar decisiones sobre implementación de seguridad JWT, incluyendo:
- RS256 vs HS256
- Duración de tokens (access: 15min, refresh: 30 días)
- Rotación de refresh tokens
- Hashing de tokens en base de datos

**Leer:** [ADR-002-jwt-security-implementation.md](ADR-002-jwt-security-implementation.md)

---

### ADR-003: RLS vs App-Layer Authorization
**Estado:** ✅ Aceptado
**Fecha:** 2025-10-28
**Impacto:** Alto

**Resumen:** Documentar decisión de usar PostgreSQL Row-Level Security (RLS) en lugar de autorización a nivel de aplicación.

**Leer:** [ADR-003-rls-vs-app-layer-authorization.md](ADR-003-rls-vs-app-layer-authorization.md)

---

### ADR-004: Gamification System Design
**Estado:** ✅ Aceptado
**Fecha:** 2025-10-28
**Impacto:** Medio

**Resumen:** Documentar diseño del sistema de gamificación:
- Maya Ranks (5 niveles)
- ML Coins economy
- 30+ achievements
- Power-ups system

**Leer:** [ADR-004-gamification-system-design.md](ADR-004-gamification-system-design.md)

---

### ADR-005: Multi-Tenancy Implementation
**Estado:** ✅ Aceptado
**Fecha:** 2025-10-28
**Impacto:** Alto

**Resumen:** Documentar implementación multi-tenant con RLS y tenant context isolation.

**Leer:** [ADR-005-multi-tenancy-implementation.md](ADR-005-multi-tenancy-implementation.md)

---

## ✍️ CÓMO CREAR UN NUEVO ADR

### 1. Determinar Número

Revisa el último ADR y asigna el siguiente número secuencial.

### 2. Crear Archivo

```bash
# Formato: ADR-XXX-titulo-en-kebab-case.md
touch ADR-006-mi-decision.md
```

### 3. Usar Template

Copia la estructura de formato de arriba.

### 4. Llenar Contenido

- **Contexto:** Explica el problema y por qué es importante
- **Decisión:** Qué decidiste hacer (claro y conciso)
- **Consecuencias:** Pros, contras, riesgos
- **Alternativas:** Qué más consideraste
- **Implementación:** Cómo se va a implementar

### 5. Revisión

- Tech Lead revisa contenido
- Equipo comenta y aprueba
- Estado cambia de "Borrador" a "Aceptado"

### 6. Actualizar este README

Agrega tu ADR al índice de arriba.

---

## 🔍 CUÁNDO CREAR UN ADR

**Crea un ADR cuando:**
- ✅ La decisión afecta múltiples componentes
- ✅ La decisión es difícil de revertir
- ✅ Hay múltiples alternativas viables
- ✅ El equipo necesita alinearse
- ✅ La decisión tiene impacto a largo plazo

**No necesitas ADR para:**
- ❌ Decisiones triviales u obvias
- ❌ Cambios locales a un módulo
- ❌ Decisiones fácilmente reversibles
- ❌ Preferencias de estilo de código

---

## 📖 RECURSOS

- [ADR GitHub](https://adr.github.io/) - Best practices
- [Michael Nygard's ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Original proposal
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI tools

---

## 👥 RESPONSABLES

| Rol | Responsabilidad |
|-----|-----------------|
| **Tech Lead** | Aprobar ADRs, mantener calidad |
| **CTO** | Revisar ADRs de alto impacto |
| **Equipo Dev** | Proponer y comentar ADRs |
| **Product Owner** | Validar impacto de negocio |

---

**Última actualización:** 28 de Octubre, 2025
**Total ADRs:** 5 activos
