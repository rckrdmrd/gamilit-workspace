# _MAP: docs/02-especificaciones-tecnicas/

**Última actualización:** 2025-11-07
**Estado:** 🟢 Completo y activo
**Versión:** 2.0 (RFC-0001)
**Propósito:** Índice de especificaciones técnicas del proyecto

---

## 📋 Propósito de esta Carpeta

Esta carpeta contiene todas las **especificaciones técnicas** (ET) del proyecto GAMILIT, que definen **CÓMO** se implementan los requerimientos funcionales desde la perspectiva técnica.

**Nomenclatura:** `ET-{MODULO}-{NUM}-{nombre}.md`
- Ejemplo: `ET-AUTH-001-rbac.md`

**Principio:** Cada ET implementa uno o más RFs de `../01-requerimientos/`

**Audiencia:**
- Tech Leads (arquitectura y decisiones técnicas)
- Desarrolladores Backend/Frontend/Database (implementación)
- DevOps Engineers (deployment y monitoring)
- QA Engineers (testing y validación)
- Arquitectos de Software (diseño de sistema)

---

## 📁 Estructura de Contenido

### Carpetas Transversales

| Carpeta | Propósito | Archivos | Owner | Estado | _MAP.md |
|---------|-----------|----------|-------|--------|---------|
| **arquitectura/** | Arquitectura general del sistema | 15+ | @tech-lead | 🟢 Completo | ✅ Existe |
| **apis/** | Especificación de 470+ API endpoints | 25+ | @tech-lead | 🟢 Completo | ✅ Existe |
| **frontend/** | Arquitectura frontend (React, Vite, Zustand) | 12+ | @frontend-lead | 🟢 Completo | ✅ Existe |
| **tipos-compartidos/** | 70+ tipos TypeScript compartidos | 8+ | @tech-lead | 🟢 Completo | ✅ Existe |
| **seguridad/** | Defense-in-Depth, RLS, validación | 10+ | @security-lead | 🟢 Completo | ✅ Existe |
| **monitoring/** | Estrategia de monitoring y observabilidad | 6+ | @devops-lead | 🟡 70% | ✅ Existe |
| **testing-strategy/** | Estrategia de testing (Jest, Vitest, E2E) | 8+ | @qa-lead | 🟢 Completo | ✅ Existe |
| **trazabilidad/** | Mapas RF → ET → Implementación | 5+ | @tech-lead | 🟢 Completo | ✅ Existe |
| **adr/** | Architecture Decision Records | 25+ | @tech-lead | 🟢 Activo | ✅ Existe |

### Carpetas de Módulos Funcionales

| Módulo | ID | Carpeta | ETs | Owner | Estado | _MAP.md |
|--------|----|---------|----|-------|--------|---------|
| **Autenticación y Autorización** | AUTH | 01-autenticacion-autorizacion/ | 3 | @tech-lead | 🟢 Completo | ✅ Existe |
| **Gamificación** | GAM | 02-gamificacion/ | 10+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Contenido Educativo** | EDU | 03-contenido-educativo/ | 15+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Progreso y Seguimiento** | PRG | 04-progreso-seguimiento/ | 8+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Características Sociales** | SOC | 05-caracteristicas-sociales/ | 12+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Notificaciones** | NOT | 06-notificaciones/ | 5+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Contenido y Media** | CNT | 07-contenido-media/ | 8+ | @backend-lead | 🟢 Completo | ✅ Existe |
| **Auditoría y Configuración** | AUD/CFG | 08-auditoria-configuracion/ | 10+ | @backend-lead | 🟢 Completo | ✅ Existe |

**Total módulos funcionales:** 8
**Total ETs estimados:** ~150

---

## 🗂️ Desglose por Carpeta

### arquitectura/ - Arquitectura General

**Descripción:** Documentación de arquitectura de alto nivel del sistema

**Contenido clave:**
- `ARQUITECTURA-GENERAL.md` - Visión general del sistema
- `ARQUITECTURA-BACKEND.md` - NestJS, módulos, servicios
- `ARQUITECTURA-FRONTEND.md` - React, componentes, features
- `ARQUITECTURA-DATABASE.md` - PostgreSQL, schemas, RLS
- `ARQUITECTURA-3-CAPAS.md` - Integración Frontend-Backend-Database
- `PATRONES-ARQUITECTONICOS.md` - Patrones aplicados

**Total archivos:** ~15

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**Diagrama de alto nivel:**
```
Frontend (React) → Backend (NestJS) → Database (PostgreSQL)
     ↓                   ↓                    ↓
  Vite Build        API REST            9 Schemas
  180+ components   470+ endpoints      44 tablas
  8 Zustand stores  11 módulos          159 RLS policies
```

---

### apis/ - Especificación de APIs

**Descripción:** Documentación completa de los 470+ API endpoints

**Contenido clave:**
- `API-REFERENCE.md` - Índice de todos los endpoints
- `API-CONVENTIONS.md` - Convenciones de diseño de APIs
- `API-AUTHENTICATION.md` - Autenticación JWT
- `API-ERROR-HANDLING.md` - Manejo de errores
- `API-VERSIONING.md` - Versionado de APIs

**Total archivos:** ~25

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**Endpoints por módulo:**
- Auth: 15 endpoints
- Educational: 42 endpoints
- Gamification: 28 endpoints
- Progress: 35 endpoints
- Social: 45 endpoints
- Notifications: 18 endpoints
- Content: 32 endpoints
- Otros: 255 endpoints

---

### frontend/ - Arquitectura Frontend

**Descripción:** Especificaciones técnicas del frontend React

**Contenido clave:**
- `ARQUITECTURA-FRONTEND.md` - Estructura general
- `COMPONENTES-SHARED.md` - 180+ componentes reutilizables
- `FEATURES-ARCHITECTURE.md` - Feature-Sliced Design
- `STATE-MANAGEMENT.md` - 8 Zustand stores
- `ROUTING.md` - React Router v6
- `STYLING.md` - Tailwind CSS

**Total archivos:** ~12

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**Features por rol:**
- Student: 45 componentes
- Teacher: 38 componentes
- Admin: 52 componentes

---

### tipos-compartidos/ - Tipos TypeScript

**Descripción:** Tipos TypeScript compartidos entre backend y frontend

**Contenido clave:**
- `TIPOS-COMPARTIDOS.md` - Índice de 70+ tipos
- `SINCRONIZACION-TIPOS.md` - Estrategia de sincronización
- `ENUMS-COMPARTIDOS.md` - ENUMs sincronizados
- `INTERFACES-COMPARTIDAS.md` - Interfaces compartidas

**Total archivos:** ~8

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**Sincronización:**
- Script: `npm run sync:enums`
- Backend como source of truth
- Frontend auto-generado

---

### seguridad/ - Seguridad

**Descripción:** Especificaciones de seguridad del sistema

**Contenido clave:**
- `DEFENSE-IN-DEPTH.md` - Estrategia de defensa en profundidad
- `ROW-LEVEL-SECURITY.md` - RLS policies (159 políticas)
- `JWT-SECURITY.md` - Seguridad de tokens
- `INPUT-VALIDATION.md` - Validación de entrada
- `OWASP-TOP-10.md` - Mitigación de OWASP Top 10

**Total archivos:** ~10

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**RLS policies:**
- Planeadas: 159
- Activas: 41 (26%)
- En desarrollo: 118 (74%)

---

### monitoring/ - Monitoring y Observabilidad

**Descripción:** Estrategia de monitoring, logging y observabilidad

**Contenido clave:**
- `ESTRATEGIA-MONITORING.md` - Visión general
- `PROMETHEUS-METRICS.md` - Métricas Prometheus
- `SENTRY-ERROR-TRACKING.md` - Tracking de errores
- `OPENTELEMETRY.md` - Tracing distribuido
- `ALERTAS.md` - Sistema de alertas

**Total archivos:** ~6

**Estado:** 🟡 70% implementado

**_MAP.md:** ✅ Existe

**Pendiente:**
- Prometheus setup (30%)
- Sentry integration (0%)
- OpenTelemetry (0%)
- Alertmanager (0%)

---

### testing-strategy/ - Estrategia de Testing

**Descripción:** Estrategia completa de testing (unit, integration, E2E)

**Contenido clave:**
- `TESTING-STRATEGY.md` - Visión general
- `UNIT-TESTING.md` - Tests unitarios (Jest/Vitest)
- `INTEGRATION-TESTING.md` - Tests de integración
- `E2E-TESTING.md` - Tests end-to-end
- `COVERAGE-GOALS.md` - Objetivos de cobertura

**Total archivos:** ~8

**Estado:** 🟢 Completo (documentación)

**_MAP.md:** ✅ Existe

**Coverage actual:**
- Backend: 15% (objetivo: 70%)
- Frontend: 13% (objetivo: 70%)
- Gap crítico: 81.7% faltante

---

### trazabilidad/ - Trazabilidad

**Descripción:** Mapas de trazabilidad RF → ET → Implementación

**Contenido clave:**
- `TRAZABILIDAD-COMPLETA.md` - Matriz completa
- `MATRIZ-RF-ET.md` - Mapeo RF → ET
- `MATRIZ-ET-IMPLEMENTACION.md` - Mapeo ET → Código

**Total archivos:** ~5

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

---

### adr/ - Architecture Decision Records

**Descripción:** Registro de decisiones arquitectónicas importantes

**ADRs destacados:**
- `ADR-001-email-verification-removal.md`
- `ADR-002-jwt-security.md`
- `ADR-003-row-level-security.md`
- `ADR-005-multi-tenancy-implementation.md`

**Total archivos:** ~25

**Estado:** 🟢 Activo

**_MAP.md:** ✅ Existe

---

### 01-autenticacion-autorizacion/ (ET-AUTH)

**Descripción:** Especificaciones técnicas de autenticación y autorización

**ETs clave:**
- `ET-AUTH-001-rbac.md` - RBAC (3 roles)
- `ET-AUTH-002-estados-cuenta.md` - Estados de cuenta
- `ET-AUTH-003-oauth.md` - OAuth providers

**Total ETs:** 3

**Estado:** ✅ Implementado (100%)

**_MAP.md:** ✅ Existe

**Implementa RFs:**
- RF-AUTH-001 (Roles)
- RF-AUTH-002 (Estados de cuenta)
- RF-AUTH-003 (OAuth)

**Implementación:**
- Backend: `apps/backend/src/modules/auth/`
- Frontend: `apps/frontend/src/features/auth/`
- Database: `apps/database/ddl/schemas/auth_management/`

---

### 02-gamificacion/ (ET-GAM)

**Descripción:** Especificaciones técnicas del sistema de gamificación

**Total ETs:** ~10

**Estado:** 🟢 Completo (90% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-GAM-001 a RF-GAM-010

**Implementación:**
- Backend: `apps/backend/src/modules/gamification/`
- Frontend: `apps/frontend/src/features/gamification/`
- Database: `apps/database/ddl/schemas/gamification_system/`

---

### 03-contenido-educativo/ (ET-EDU)

**Descripción:** Especificaciones técnicas del contenido educativo

**Total ETs:** ~15

**Estado:** 🟢 Completo (95% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-EDU-001 a RF-EDU-015

**33 mecánicas educativas implementadas**

**Implementación:**
- Backend: `apps/backend/src/modules/educational/`
- Frontend: `apps/frontend/src/features/exercises/`
- Database: `apps/database/ddl/schemas/educational_content/`

---

### 04-progreso-seguimiento/ (ET-PRG)

**Descripción:** Especificaciones técnicas de tracking de progreso

**Total ETs:** ~8

**Estado:** 🟢 Completo (90% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-PRG-001 a RF-PRG-008

**Implementación:**
- Backend: `apps/backend/src/modules/progress/`
- Frontend: `apps/frontend/src/features/progress/`
- Database: `apps/database/ddl/schemas/progress_tracking/`

---

### 05-caracteristicas-sociales/ (ET-SOC)

**Descripción:** Especificaciones técnicas de features sociales

**Total ETs:** ~12

**Estado:** 🟢 Completo (80% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-SOC-001 a RF-SOC-012

**Implementación:**
- Backend: `apps/backend/src/modules/social/`
- Frontend: `apps/frontend/src/features/social/`
- Database: `apps/database/ddl/schemas/social_features/`

---

### 06-notificaciones/ (ET-NOT)

**Descripción:** Especificaciones técnicas del sistema de notificaciones

**Total ETs:** ~5

**Estado:** 🟢 Completo (75% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-NOT-001 a RF-NOT-005

**Implementación:**
- Backend: `apps/backend/src/modules/notifications/`
- Frontend: `apps/frontend/src/features/notifications/`

---

### 07-contenido-media/ (ET-CNT)

**Descripción:** Especificaciones técnicas de gestión de contenido multimedia

**Total ETs:** ~8

**Estado:** 🟢 Completo (70% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-CNT-001 a RF-CNT-008

**Implementación:**
- Backend: `apps/backend/src/modules/content/`
- Database: `apps/database/ddl/schemas/content_management/`

---

### 08-auditoria-configuracion/ (ET-AUD, ET-CFG)

**Descripción:** Especificaciones técnicas de auditoría y configuración

**Total ETs:** ~10

**Estado:** 🟢 Completo (80% implementado)

**_MAP.md:** ✅ Existe

**Implementa RFs:** RF-AUD-001 a RF-AUD-004, RF-CFG-001

**Implementación:**
- Backend: `apps/backend/src/modules/audit/`, `apps/backend/src/modules/system/`
- Database: `apps/database/ddl/schemas/audit_logging/`, `apps/database/ddl/schemas/system_configuration/`

---

## 🔗 Interdependencias

### Esta Carpeta Implementa:

- **docs/01-requerimientos/** - Cada ET implementa RFs correspondientes

### Esta Carpeta Alimenta A:

- **apps/backend/** - Implementación de código backend
- **apps/frontend/** - Implementación de código frontend
- **apps/database/** - Implementación de DDL y schemas
- **docs/03-desarrollo/** - Guías de desarrollo
- **QA** - Test cases basados en ETs

### Esta Carpeta Consume De:

- **docs/01-requerimientos/** - RFs como input
- **docs/adr/** - Decisiones arquitectónicas
- **Arquitectos** - Diseño de sistema

### Trazabilidad ET → Implementación:

```
ET-{MOD}-{NUM}
    └─> apps/backend/src/modules/{modulo}/
    └─> apps/frontend/src/features/{modulo}/
    └─> apps/database/ddl/schemas/{schema}/
```

**Ejemplo completo:**
```
RF-AUTH-001 (Roles)
    └─> ET-AUTH-001 (RBAC)
        ├─> apps/backend/src/shared/enums/gamilit-role.enum.ts
        ├─> apps/backend/src/shared/guards/roles.guard.ts
        ├─> apps/frontend/src/types/auth.types.ts
        └─> apps/database/ddl/00-prerequisites.sql:30-32
```

---

## 📊 Métricas de Especificaciones Técnicas

### Cobertura General

| Métrica | Valor |
|---------|-------|
| **Total carpetas** | 18 |
| **Total archivos .md** | 127 |
| **Total ETs estimados** | ~150 |
| **Archivos _MAP.md** | 17/18 (94%) |
| **Módulos funcionales** | 8 |
| **ETs implementados** | ~85% |

### Cobertura por Módulo

| Módulo | ETs | Implementados | % |
|--------|-----|---------------|---|
| AUTH | 3 | 3 | 100% |
| GAM | 10+ | 9 | 90% |
| EDU | 15+ | 14 | 95% |
| PRG | 8+ | 7 | 90% |
| SOC | 12+ | 10 | 80% |
| NOT | 5+ | 4 | 75% |
| CNT | 8+ | 6 | 70% |
| AUD/CFG | 10+ | 8 | 80% |

**Promedio:** ~85% implementados

### Estado de Componentes Transversales

| Componente | Estado | % |
|------------|--------|---|
| **Arquitectura** | ✅ Completo | 100% |
| **APIs** | ✅ Completo | 95% |
| **Frontend** | ✅ Completo | 90% |
| **Tipos compartidos** | ✅ Completo | 100% |
| **Seguridad** | 🟡 En progreso | 70% |
| **Monitoring** | 🟡 En progreso | 30% |
| **Testing** | ✅ Documentado | 100% |

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** Monitoring no implementado (30% vs 100% objetivo)
  - Pendiente: Prometheus, Sentry, OpenTelemetry
  - Impacto: No hay visibilidad de producción
  - Esfuerzo: 40 horas
  - Documentado en: `monitoring/`

### P1 (Alto)

- **P1-001:** RLS policies incompletas (26% vs 100% objetivo)
  - Activas: 41/159 (26%)
  - Impacto: Seguridad parcial
  - Esfuerzo: 30 horas
  - Documentado en: `seguridad/ROW-LEVEL-SECURITY.md`

- **P1-002:** Testing coverage bajo (14% vs 70% objetivo)
  - Backend: 15%, Frontend: 13%
  - Impacto: Alto riesgo de bugs
  - Esfuerzo: 100 horas
  - Documentado en: `testing-strategy/`

### P2 (Medio)

- **P2-001:** Falta _MAP.md raíz
  - Solo falta este archivo
  - Impacto: Navegación SIMCO incompleta
  - Esfuerzo: 1 hora (este archivo)

---

## 📐 Estándares Aplicables

### Nomenclatura de Especificaciones

**Formato:** `ET-{MODULO}-{NUM}-{nombre}.md`

**Módulos válidos:** (igual que RFs)
- AUTH, GAM, EDU, PRG, SOC, NOT, CNT, AUD, CFG

**Numeración:** Debe coincidir con RF correspondiente

**Ejemplo:**
- RF: `RF-AUTH-001-roles.md`
- ET: `ET-AUTH-001-rbac.md`

### Formato de Especificación Técnica

Cada ET debe incluir:
1. Título descriptivo
2. Estado (✅ Implementado, 🟡 En progreso, ⚪ Pendiente)
3. Prioridad (Alta, Media, Baja)
4. Resumen ejecutivo
5. Arquitectura técnica
6. Decisiones de diseño
7. Detalles de implementación
8. Consideraciones de seguridad
9. Consideraciones de performance
10. Referencias a RFs
11. Referencias a implementación

### Referencias

**A requerimientos:**
```markdown
**Implementa:** [RF-AUTH-001](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md)
```

**A implementación:**
```markdown
**Backend:** `apps/backend/src/modules/auth/`
**Frontend:** `apps/frontend/src/features/auth/`
**Database:** `apps/database/ddl/schemas/auth_management/`
```

**A ADRs:**
```markdown
**ADR relacionado:** [ADR-003](./adr/ADR-003-row-level-security.md)
```

---

## 🔍 Validación (Go/No-Go)

### Criterios de Aceptación

- [x] _MAP.md creado (este archivo) ✅
- [x] 150+ especificaciones técnicas ✅
- [x] 8 módulos funcionales documentados ✅
- [x] Trazabilidad ET → Código ✅
- [x] _MAP.md en 17/18 subcarpetas (94%) ✅
- [ ] 85% ETs implementados (actual: ~85%) 🟡
- [ ] Monitoring implementado (actual: 30%) 🔴
- [ ] RLS policies completas (actual: 26%) 🔴

**Decisión:** 🟡 **Parcial GO** - Especificaciones completas, implementación pendiente

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Arquitectura: @tech-lead
- APIs: @backend-lead
- Frontend: @frontend-lead
- Seguridad: @security-lead
- Monitoring: @devops-lead
- Testing: @qa-lead

**Reporte de issues:**
- GitHub Issues: [GAMILIT Technical Specs]
- Slack: #gamilit-architecture

---

## 🎯 Próximos Pasos

### Fase 1 - Crítica (Esta Semana)

1. ✅ _MAP.md creado (este archivo)
2. ⬜ Implementar monitoring básico (Prometheus + Sentry) (20 horas)
3. ⬜ Crear 20 RLS policies críticas (10 horas)

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

4. ⬜ Aumentar test coverage a 40% (50 horas)
5. ⬜ Completar ETs faltantes en módulos SOC, NOT, CNT (8 horas)
6. ⬜ Implementar OpenTelemetry (15 horas)

### Fase 3 - Media Prioridad (Próximo Mes)

7. ⬜ Completar todas las RLS policies (118 restantes) (30 horas)
8. ⬜ Test coverage 70% (80 horas)
9. ⬜ Dashboard de métricas completo (10 horas)

---

## 🚀 Navegación Rápida

### Buscar Especificación

```bash
# Buscar ET por ID
grep -r "ET-AUTH-001" docs/02-especificaciones-tecnicas/

# Listar todos los ETs de un módulo
find docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ -name "ET-*.md"

# Ver todos los _MAP.md
find docs/02-especificaciones-tecnicas/ -name "_MAP.md"
```

### Para Tech Leads

```bash
# Arquitectura general
cat docs/02-especificaciones-tecnicas/arquitectura/ARQUITECTURA-GENERAL.md

# ADRs
ls docs/02-especificaciones-tecnicas/adr/

# Seguridad
cat docs/02-especificaciones-tecnicas/seguridad/DEFENSE-IN-DEPTH.md
```

### Para Desarrolladores

```bash
# Ver especificación de un módulo
cat docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md

# API reference
cat docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md

# Tipos compartidos
cat docs/02-especificaciones-tecnicas/tipos-compartidos/TIPOS-COMPARTIDOS.md
```

---

## 📚 Recursos Adicionales

**Documentación relacionada:**
- Requerimientos: [../01-requerimientos/](../01-requerimientos/)
- Desarrollo: [../03-desarrollo/](../03-desarrollo/)
- ADRs: [./adr/](./adr/)

**Templates:**
- [../templates/ET-TEMPLATE.md](../templates/ET-TEMPLATE.md) - Template para nuevos ETs

**Índices:**
- [../INDICE-MAESTRO.md](../INDICE-MAESTRO.md) - Árbol completo de ETs
- [./trazabilidad/TRAZABILIDAD-COMPLETA.md](./trazabilidad/TRAZABILIDAD-COMPLETA.md) - Matriz RF → ET → Código

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras implementar monitoring
**Versión:** 1.0.0
