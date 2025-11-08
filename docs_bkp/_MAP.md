# _MAP: docs/

**Última actualización:** 2025-11-07
**Estado:** 🟢 Activa - Fuente de Verdad del Proyecto
**Versión:** 2.0 (RFC-0001)
**Propósito:** Índice maestro de toda la documentación del proyecto

---

## 📋 Propósito de esta Carpeta

Esta carpeta contiene **toda la documentación oficial** del proyecto GAMILIT, incluyendo requerimientos, especificaciones técnicas, guías de desarrollo, planificación, ADRs y estándares.

**Sistema de Organización:** SIMCO (Sistema Indexado Modular por Contexto)

**Principio Fundamental:** La documentación es la **fuente de verdad oficial** del proyecto. Debe consultarse antes que el código fuente para entender arquitectura, decisiones y requerimientos.

**Audiencia:**
- Product Owners (requerimientos y roadmap)
- Desarrolladores Backend/Frontend/Database (especificaciones técnicas y guías)
- Tech Leads (arquitectura, ADRs, estándares)
- QA Engineers (estrategia de testing)
- Stakeholders (visión, progreso)
- Agentes de IA (navegación contextual)

---

## 📁 Estructura de Contenido

### Carpetas Principales

| Carpeta | Propósito | Archivos | Owner | Estado | _MAP.md |
|---------|-----------|----------|-------|--------|---------|
| **00-overview/** | Visión general, onboarding, glosario | 15+ | @tech-lead | 🟢 Activa | ⚪ Pendiente |
| **01-requerimientos/** | Requerimientos funcionales (RF-XXX) | 120+ | @product-owner | 🟢 Completo | ⚪ Pendiente |
| **02-especificaciones-tecnicas/** | Especificaciones técnicas (ET-XXX) | 150+ | @tech-lead | 🟢 Completo | ⚪ Pendiente |
| **03-desarrollo/** | Guías de desarrollo por componente | 25+ | @dev-team | 🟡 En desarrollo | ⚪ Pendiente |
| **04-planificacion/** | Roadmap, sprints, épicas | 40+ | @product-owner | 🟢 Activa | ⚪ Pendiente |
| **05-implementacion/** | Guías de implementación específicas | 5+ | @dev-team | 🟡 Parcial | ⚪ Pendiente |
| **QUICK-REFERENCE/** | Guías rápidas (<5 min) | 15+ | @dev-team | 🟢 Activa | ⚪ Pendiente |
| **adr/** | Architecture Decision Records | 25+ | @tech-lead | 🟢 Activa | ✅ Existe |
| **scripts/** | Scripts de generación/validación de docs | 5+ | @devops-team | 🟡 Parcial | ⚪ Pendiente |
| **standards/** | Estándares de código y git workflow | 8+ | @tech-lead | 🟢 Activa | ⚪ Pendiente |
| **templates/** | Templates para documentos nuevos | 10+ | @tech-lead | 🟢 Activa | ⚪ Pendiente |

### Archivos en Raíz

| Archivo | Propósito | Tamaño | Estado |
|---------|-----------|--------|--------|
| **_MAP.md** | Índice SIMCO de docs/ (este archivo) | - | ✅ |
| **README.md** | Índice maestro para humanos | 11 KB | ✅ |
| **INDICE-MAESTRO.md** | Árbol detallado de RF/ET por módulo | 18 KB | ✅ |
| **00_OVERVIEW.md** | Visión general del proyecto | 14 KB | ✅ |
| **PROGRESO-DOCUMENTACION.md** | Reporte de progreso de docs | 21 KB | ✅ |
| **ESTADO-ACTUAL-PROYECTO.md** | Estado actual del proyecto | 13 KB | ✅ |
| Reportes varios | REPORTE-*.md (7 archivos) | 90 KB | ✅ |

---

## 🗂️ Desglose por Carpeta Principal

### 00-overview/ - Visión General

**Descripción:** Documentación de alto nivel para entender rápidamente el proyecto

**Contenido clave:**
- `VISION.md` - Visión y misión del producto
- `ONBOARDING.md` - Guía de setup inicial (2-3 horas)
- `GLOSARIO.md` - Términos clave del dominio
- `ARQUITECTURA-ALTO-NIVEL.md` - Arquitectura general

**Audiencia:** Nuevos desarrolladores, stakeholders

**Total archivos:** ~15

**Estado:** 🟢 Completo y actualizado

**_MAP.md:** ⚪ Pendiente creación

**Referencias:**
- Requerimientos: `../01-requerimientos/proyecto/VISION-PRODUCTO.md`
- Arquitectura: `../02-especificaciones-tecnicas/arquitectura/`

---

### 01-requerimientos/ - Requerimientos Funcionales

**Descripción:** Product requirements documents (PRD) organizados por módulo funcional

**Estructura modular:**
```
01-requerimientos/
├── proyecto/                           # Visión, misión, estrategia
├── casos-uso/                          # Casos de uso por rol
├── modulos/                            # 5 módulos educativos
├── admin-portal/                       # Portal administrador
├── teacher-portal/                     # Portal profesor
├── 01-autenticacion-autorizacion/      # RF-AUTH-XXX (3 docs)
├── 02-gamificacion/                    # RF-GAM-XXX (10+ docs)
├── 03-contenido-educativo/             # RF-EDU-XXX (15+ docs)
├── 04-progreso-seguimiento/            # RF-PRG-XXX (8+ docs)
├── 05-caracteristicas-sociales/        # RF-SOC-XXX (12+ docs)
├── 06-notificaciones/                  # RF-NOT-XXX (5+ docs)
├── 07-contenido-media/                 # RF-CNT-XXX (8+ docs)
└── 08-auditoria-configuracion/         # RF-AUD-XXX, RF-CFG-XXX (10+ docs)
```

**Nomenclatura:** `RF-{MODULO}-{NUM}-{nombre}.md`
- Ejemplo: `RF-AUTH-001-roles.md`

**Total archivos:** ~120 requerimientos funcionales

**Cobertura _MAP.md:** 9/14 carpetas (64%)

**Estado:** ✅ 95% Modularizado (RFC-0001)

**_MAP.md:** ⚪ Pendiente creación (índice general)

**Trazabilidad:** Cada RF mapea a:
- ET (Especificación Técnica) en `../02-especificaciones-tecnicas/`
- Implementación en `apps/` (backend, frontend, database)

---

### 02-especificaciones-tecnicas/ - Especificaciones Técnicas

**Descripción:** Technical design documents (TDD) con especificaciones de implementación

**Estructura modular:**
```
02-especificaciones-tecnicas/
├── arquitectura/                       # Arquitectura general
├── apis/                               # Especificación de 470+ endpoints
├── frontend/                           # Arquitectura frontend React
├── tipos-compartidos/                  # 70+ tipos TypeScript
├── seguridad/                          # Defense-in-Depth, RLS
├── monitoring/                         # Estrategia de monitoring
├── testing-strategy/                   # Estrategia de testing
├── trazabilidad/                       # Mapas RF → ET → Implementación
├── 01-autenticacion-autorizacion/      # ET-AUTH-XXX (3 docs)
├── 02-gamificacion/                    # ET-GAM-XXX (10+ docs)
├── 03-contenido-educativo/             # ET-EDU-XXX (15+ docs)
├── 04-progreso-seguimiento/            # ET-PRG-XXX (8+ docs)
├── 05-caracteristicas-sociales/        # ET-SOC-XXX (12+ docs)
├── 06-notificaciones/                  # ET-NOT-XXX (5+ docs)
├── 07-contenido-media/                 # ET-CNT-XXX (8+ docs)
└── 08-auditoria-configuracion/         # ET-AUD-XXX, ET-CFG-XXX (10+ docs)
```

**Nomenclatura:** `ET-{MODULO}-{NUM}-{nombre}.md`
- Ejemplo: `ET-AUTH-001-rbac.md`

**Total archivos:** ~150 especificaciones técnicas

**Cobertura _MAP.md:** 11/16 carpetas (69%)

**Estado:** ✅ 90% Completo

**_MAP.md:** ⚪ Pendiente creación (índice general)

**Trazabilidad:** Cada ET implementa:
- RF en `../01-requerimientos/`
- Código en `apps/backend/src/modules/`, `apps/frontend/src/features/`
- DDL en `apps/database/ddl/schemas/`

---

### 03-desarrollo/ - Guías de Desarrollo

**Descripción:** Developer guides y documentación técnica para desarrollo

**Estructura:**
```
03-desarrollo/
├── backend/                # Guías NestJS, módulos, API
│   ├── _MAP.md ✅
│   └── GUARDS-Y-SEGURIDAD.md
├── frontend/               # Guías React, componentes, features
│   ├── _MAP.md ✅
│   └── features/
├── base-de-datos/          # Guías PostgreSQL, migrations
│   └── _MAP.md ✅
├── database/               # (duplicado?)
│   └── _MAP.md ✅
├── deployment/             # Guías de deployment
│   └── _MAP.md ✅
├── integraciones/          # Integraciones externas
│   └── _MAP.md ✅
└── testing/                # Estrategia de testing
    └── _MAP.md ✅
```

**Propósito:** Documentación que **mapea el código** sin invadir el código

**Guías planeadas (backend):**
- ⚪ `ESTRUCTURA-MODULOS.md` - Mapa de `apps/backend/src/modules/` (11 módulos)
- ⚪ `ESTRUCTURA-SHARED.md` - Mapa de `apps/backend/src/shared/`
- ⚪ `DATABASE-INTEGRATION.md` - Integración con PostgreSQL
- ⚪ `API-CONVENTIONS.md` - Convenciones de APIs
- ⚪ `SETUP-DESARROLLO.md` - Setup local
- ⚪ `ERROR-HANDLING.md` - Manejo de errores
- ⚪ `TESTING-BACKEND.md` - Testing en backend

**Guías planeadas (frontend):**
- ⚪ `ESTRUCTURA-FEATURES.md` - Mapa de `apps/frontend/src/features/`
- ⚪ `ESTRUCTURA-SHARED.md` - Mapa de `apps/frontend/src/shared/components/` (180+)
- ⚪ `COMPONENTES-UI.md` - Catálogo de componentes
- ⚪ `STATE-MANAGEMENT.md` - Zustand stores (8 stores)
- ⚪ `API-INTEGRATION.md` - Integración con backend
- ⚪ `SETUP-DESARROLLO.md` - Setup local
- ⚪ `TESTING-FRONTEND.md` - Testing en frontend

**Total archivos:** ~25

**Cobertura _MAP.md:** 7/7 subcarpetas (100%)

**Estado:** 🟡 En desarrollo (estructura creada, contenido pendiente)

**_MAP.md:** ⚪ Pendiente creación (índice general)

---

### 04-planificacion/ - Planificación y Roadmap

**Descripción:** Project planning, roadmap, sprints y épicas

**Estructura:**
```
04-planificacion/
├── 01-alcance-inicial/         # EAI (Épicas de Alcance Inicial)
│   └── _MAP.md ✅
├── 02-migracion-robustecimiento/ # EMR features
│   └── _MAP.md ✅
├── 03-extensiones/             # EXT features
│   └── _MAP.md ✅
├── 04-futuras-extensiones/     # Futuras features
│   └── _MAP.md ✅
├── correcciones/               # Correcciones planificadas
│   └── _MAP.md ✅
├── features/                   # Features por módulo
│   └── _MAP.md ✅
├── metricas/                   # Métricas de progreso
│   └── _MAP.md ✅
├── roadmap/                    # Roadmap general
│   └── _MAP.md ✅
└── sprints/                    # Sprints semanales
    └── _MAP.md ✅
```

**Total archivos:** ~40

**Cobertura _MAP.md:** 9/9 subcarpetas (100%)

**Estado:** 🟢 Activa

**_MAP.md:** ⚪ Pendiente creación (índice general)

---

### 05-implementacion/ - Guías de Implementación

**Descripción:** Guías específicas de implementación de features

**Total archivos:** ~5

**Estado:** 🟡 Parcial

**_MAP.md:** ⚪ Pendiente creación

---

### QUICK-REFERENCE/ - Guías Rápidas

**Descripción:** Cheatsheets y guías de <5 minutos para tareas comunes

**Contenido planeado:**
- Comandos Git frecuentes
- Setup de desarrollo rápido
- Troubleshooting común
- Comandos npm/pnpm
- Shortcuts de IDE

**Total archivos:** ~15

**Estado:** 🟢 Activa

**_MAP.md:** ⚪ Pendiente creación

---

### adr/ - Architecture Decision Records

**Descripción:** Registro de decisiones arquitectónicas importantes

**Formato:** ADR-{NUM}-{título}.md

**Ejemplos:**
- `ADR-001-email-verification-removal.md`
- `ADR-002-jwt-security.md`
- `ADR-003-row-level-security.md`
- `ADR-005-multi-tenancy-implementation.md`

**Total archivos:** ~25 ADRs

**Estado:** 🟢 Activa

**_MAP.md:** ✅ Existe (`adr/_MAP.md`)

---

### scripts/ - Scripts de Documentación

**Descripción:** Scripts para generar, validar y mantener documentación

**Scripts planeados:**
- ⚪ `validate-links.sh` - Validar enlaces rotos
- ⚪ `generate-index.sh` - Generar índices automáticos
- ⚪ `simco-coverage.sh` - Reportar cobertura SIMCO
- ⚪ `validate-simco-format.sh` - Validar formato RFC-0001

**Total archivos:** ~5

**Estado:** 🟡 Parcial

**_MAP.md:** ⚪ Pendiente creación

---

### standards/ - Estándares

**Descripción:** Estándares de código, documentación y git workflow

**Contenido:**
- `CODING-STANDARDS.md` - Estándares de código
- `GIT-WORKFLOW.md` - Workflow de Git
- `DOCUMENTATION-STANDARDS.md` - Estándares de documentación
- `NAMING-CONVENTIONS.md` - Convenciones de nombres

**Total archivos:** ~8

**Estado:** 🟢 Activa

**_MAP.md:** ⚪ Pendiente creación

---

### templates/ - Templates

**Descripción:** Templates para crear nuevos documentos

**Contenido:**
- `_MAP_TEMPLATE.md` - Template RFC-0001 para _MAP.md
- `RF-TEMPLATE.md` - Template para requerimientos
- `ET-TEMPLATE.md` - Template para especificaciones técnicas
- `ADR-TEMPLATE.md` - Template para ADRs

**Total archivos:** ~10

**Estado:** 🟢 Activa

**_MAP.md:** ⚪ Pendiente creación

---

## 🔗 Interdependencias

### Esta Carpeta Alimenta A:

- **apps/** - Implementación de código basada en specs
- **orchestration/** - Agentes usan docs como contexto
- **artifacts/** - Diagramas documentan arquitectura
- **Desarrolladores** - Fuente de verdad para desarrollo
- **Stakeholders** - Requerimientos y progreso

### Esta Carpeta Consume De:

- **apps/** - Documentación refleja implementación real
- **orchestration/** - Reportes de análisis actualizan docs
- **.git/** - ADRs documentan decisiones de commits importantes

### Flujo de Información:

```
┌────────────────────────────────────────────────────┐
│                   docs/                             │
│         (Fuente de Verdad Oficial)                 │
└────────────────────┬───────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ Backend│  │Frontend│  │ Database │
    │ (impl) │  │ (impl) │  │  (DDL)   │
    └────┬───┘  └───┬────┘  └────┬─────┘
         │          │            │
         └──────────┴────────────┘
                    │
         ┌──────────▼──────────┐
         │   orchestration/    │
         │  (análisis, logs)   │
         └─────────────────────┘
```

---

## 📊 Métricas de Documentación

### Cobertura General

| Métrica | Valor | Notas |
|---------|-------|-------|
| **Total archivos .md** | 492 | Toda la documentación |
| **Archivos _MAP.md** | 46 | Sistema SIMCO |
| **Carpetas nivel 1** | 11 | Organización principal |
| **Carpetas con _MAP.md** | 46 | En subcarpetas |
| **Cobertura SIMCO docs/** | 75% | Objetivo: 90% |

### Cobertura por Carpeta

| Carpeta | Archivos | _MAP.md | Cobertura |
|---------|----------|---------|-----------|
| **00-overview/** | ~15 | 0 | 0% |
| **01-requerimientos/** | ~120 | 9 | 64% |
| **02-especificaciones-tecnicas/** | ~150 | 11 | 69% |
| **03-desarrollo/** | ~25 | 7 | 100% |
| **04-planificacion/** | ~40 | 9 | 100% |
| **05-implementacion/** | ~5 | 0 | 0% |
| **QUICK-REFERENCE/** | ~15 | 0 | 0% |
| **adr/** | ~25 | 1 | 100% |
| **scripts/** | ~5 | 0 | 0% |
| **standards/** | ~8 | 0 | 0% |
| **templates/** | ~10 | 0 | 0% |

### Estado de Contenido

| Categoría | Estado |
|-----------|--------|
| **Requerimientos (RF)** | ✅ 95% Completo |
| **Especificaciones (ET)** | ✅ 90% Completo |
| **Guías de desarrollo** | 🟡 40% Completo |
| **Planificación** | ✅ 85% Completo |
| **ADRs** | ✅ 100% Activo |
| **Estándares** | ✅ 90% Completo |

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** Falta _MAP.md en 10 carpetas nivel 1
  - Afecta: 00-overview, 01-requerimientos, 02-especificaciones-tecnicas, etc.
  - Impacto: Navegación SIMCO incompleta para agentes
  - Esfuerzo: 8 horas (45 min cada uno)

### P1 (Alto)

- **P1-001:** docs/03-desarrollo/ con contenido insuficiente
  - Falta: 14 guías de desarrollo (7 backend + 7 frontend)
  - Impacto: No hay documentación que mapee estructura de código
  - Esfuerzo: 24 horas (ver Plan Fase 2)

- **P1-002:** Sin scripts de validación automática
  - Falta: validate-links, simco-coverage, validate-simco-format
  - Impacto: Referencias rotas pueden pasar desapercibidas
  - Esfuerzo: 12 horas

### P2 (Medio)

- **P2-001:** Carpetas duplicadas/confusas
  - `03-desarrollo/base-de-datos/` vs `03-desarrollo/database/`
  - Recomendación: Consolidar en una sola
  - Esfuerzo: 2 horas

- **P2-002:** Reportes en raíz docs/ desorganizados
  - 7 archivos REPORTE-*.md en raíz
  - Recomendación: Mover a `docs/reportes/` o `artifacts/`
  - Esfuerzo: 1 hora

---

## 📐 Estándares Aplicables

### Nomenclatura de Archivos

**Documentación (.md):**
- `UPPER-CASE-KEBAB.md` - Archivos principales (README, OVERVIEW)
- `lower-case-kebab.md` - Archivos secundarios
- `_MAP.md` - Mapas de contexto (obligatorio por carpeta)
- `RF-{MOD}-{NUM}-{nombre}.md` - Requerimientos funcionales
- `ET-{MOD}-{NUM}-{nombre}.md` - Especificaciones técnicas
- `ADR-{NUM}-{nombre}.md` - Architecture Decision Records

**Convenciones:**
- Evitar espacios en nombres de archivos
- Usar guiones (`-`) en lugar de guiones bajos (`_`), excepto `_MAP.md`
- Límite: <400 líneas por documento (excepto justificado)

### Formato RFC-0001 (_MAP.md)

Todos los _MAP.md DEBEN incluir:
1. ✅ Header con metadata (fecha, estado, versión)
2. ✅ Propósito de la carpeta
3. ✅ Tabla de estructura de contenido
4. ✅ Desglose detallado por subcarpeta
5. ✅ Interdependencias
6. ✅ Métricas
7. ✅ Issues conocidos (P0, P1, P2)
8. ✅ Próximos pasos

**Template:** `docs/templates/_MAP_TEMPLATE.md`

### Referencias y Enlaces

**Referencias relativas (Markdown):**
```markdown
[ET-AUTH-001](../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)
```

**Referencias a código (absolutas desde raíz):**
```markdown
**Backend:** `apps/backend/src/shared/enums/gamilit-role.enum.ts`
**DDL:** `apps/database/ddl/00-prerequisites.sql:30-32`
```

---

## 🔍 Validación (Go/No-Go)

### Criterios de Aceptación

- [x] docs/_MAP.md creado (este archivo) ✅
- [ ] _MAP.md en 10 carpetas nivel 1 (0/10) 🔴
- [ ] 14 guías de desarrollo creadas (0/14) 🔴
- [ ] Scripts de validación implementados (0/3) 🔴
- [x] Formato RFC-0001 aplicado ✅
- [x] Interdependencias documentadas ✅
- [x] Métricas incluidas ✅

**Decisión:** 🟡 **Parcial GO** - Estructura SIMCO iniciada, contenido pendiente

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Requerimientos: @product-owner
- Especificaciones: @tech-lead
- Guías desarrollo: @dev-team
- ADRs: @tech-lead
- Estándares: @tech-lead

**Reporte de issues:**
- GitHub Issues: [GAMILIT Docs]
- Slack: #gamilit-docs

**Contribuir:**
- Leer: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Seguir: [docs/standards/](./standards/)
- Templates: [docs/templates/](./templates/)

---

## 🎯 Próximos Pasos

### Fase 1 - Crítica (Esta Semana)

1. ✅ docs/_MAP.md creado (este archivo)
2. ⬜ Crear _MAP.md en 10 carpetas nivel 1 (8 horas)
3. ⬜ Consolidar carpetas duplicadas (2 horas)
4. ⬜ Mover reportes a ubicación apropiada (1 hora)

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

5. ⬜ Crear 7 guías backend en docs/03-desarrollo/backend/ (12 horas)
6. ⬜ Crear 7 guías frontend en docs/03-desarrollo/frontend/ (12 horas)
7. ⬜ Implementar validate-links.sh (6 horas)
8. ⬜ Implementar simco-coverage.sh (4 horas)

### Fase 3 - Media Prioridad (Próximo Mes)

9. ⬜ Integrar validación en CI/CD (2 horas)
10. ⬜ Aumentar cobertura SIMCO a 90% (20 horas)
11. ⬜ Completar guías faltantes en 03-desarrollo/ (10 horas)
12. ⬜ Dashboard de métricas de documentación (8 horas)

---

## 🚀 Navegación Rápida

### Para Agentes de IA

```bash
# Leer contexto de documentación
cat docs/_MAP.md

# Navegar a módulo específico
cat docs/01-requerimientos/01-autenticacion-autorizacion/_MAP.md

# Encontrar todos los _MAP.md
find docs/ -name "_MAP.md" -type f

# Buscar requerimiento específico
grep -r "RF-AUTH-001" docs/01-requerimientos/
```

### Para Desarrolladores

```bash
# Setup inicial
cat docs/00-overview/ONBOARDING.md

# Guías de desarrollo
ls docs/03-desarrollo/

# Estándares de código
cat docs/standards/CODING-STANDARDS.md

# Guías rápidas
ls docs/QUICK-REFERENCE/
```

### Para Product Owners

```bash
# Visión del producto
cat docs/00_OVERVIEW.md

# Roadmap
cat docs/04-planificacion/roadmap/

# Estado del proyecto
cat docs/ESTADO-ACTUAL-PROYECTO.md
```

---

## 📚 Recursos Adicionales

**Archivos complementarios:**
- [README.md](./README.md) - Índice maestro para humanos
- [INDICE-MAESTRO.md](./INDICE-MAESTRO.md) - Árbol detallado de archivos
- [00_OVERVIEW.md](./00_OVERVIEW.md) - Visión general del proyecto

**Sistema SIMCO:**
- Concepto: Sistema Indexado Modular por Contexto
- RFC: RFC-0001 (formato de _MAP.md)
- Objetivo: Navegación contextual para humanos y agentes

**Herramientas:**
- Validación de enlaces: markdown-link-check (planeado)
- Generación de diagramas: mermaid-cli
- Formato de documentos: prettier

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras completar mapas nivel 1
**Versión:** 1.0.0
