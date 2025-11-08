# 📚 Documentación GAMILIT - Índice Maestro

**Proyecto:** GAMILIT Platform
**Versión Documentación:** 2.0 (RFC-0001)
**Última Actualización:** 2025-11-07
**Estado:** 🟢 Activo - Fuente de Verdad Oficial

---

## 🎯 Propósito

Este es el **índice maestro** de toda la documentación del proyecto GAMILIT. La documentación es la **fuente de verdad oficial** del proyecto y debe consultarse antes que el código fuente para entender arquitectura, decisiones y requerimientos.

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores (2-3 horas)

```
1. 📖 docs/00_OVERVIEW.md (este archivo)
2. 🏁 docs/00-overview/ONBOARDING.md
3. 📏 docs/standards/CODING-STANDARDS.md
4. ⚡ docs/QUICK-REFERENCE/ (todos los cheatsheets)
```

### Para Product Owners (1-2 horas)

```
1. 📖 docs/00_OVERVIEW.md
2. 🎯 docs/01-requerimientos/proyecto/VISION-PRODUCTO.md
3. 🗺️ docs/04-planificacion/roadmap/ROADMAP-GENERAL.md
```

### Para Tech Leads (3-4 horas)

```
1. 📖 docs/00_OVERVIEW.md
2. 🏗️ docs/02-especificaciones-tecnicas/ (completo)
3. 📋 docs/adr/ (todos los ADRs)
4. 📏 docs/standards/ (completo)
```

---

## 📁 Estructura de Carpetas

### 00_OVERVIEW.md ⭐
**Archivo de introducción general** - Comienza aquí
- Visión general del proyecto
- Stack tecnológico
- Sistema de gamificación
- Arquitectura de alto nivel
- 📍 **Ubicación:** `docs/00_OVERVIEW.md`

### 00-overview/ 📖
**Documentación de alto nivel** para entender rápidamente el proyecto
- `VISION.md` - Visión del producto
- `ONBOARDING.md` - Guía de setup inicial (2-3 horas)
- `GLOSARIO.md` - Términos clave del proyecto
- 📍 **Ubicación:** `docs/00-overview/`
- 📋 **_MAP:** `docs/00-overview/_MAP.md`

### 01-requerimientos/ 📋
**Requerimientos del producto** - Product requirements document (PRD)
- `proyecto/` - Visión, misión, estrategia de negocio
- `casos-uso/` - Casos de uso por rol (student, teacher, admin)
- `gamificacion/` - Sistema de gamificación Maya (5 rangos, ML Coins, achievements)
- `modulos/` - 5 módulos educativos (31 mecánicas interactivas)
- `admin-portal/` - Requerimientos portal admin
- `teacher-portal/` - Requerimientos portal teacher
- 📍 **Ubicación:** `docs/01-requerimientos/`
- 📋 **_MAP:** `docs/01-requerimientos/_MAP.md`
- **Estado:** ✅ 95% Modularizado (RFC-0001)

### 02-especificaciones-tecnicas/ 🏗️
**Especificaciones técnicas** - Technical design documents (TDD)
- `arquitectura/` - Arquitectura general (frontend, backend, database)
- `api/` - Especificación de API REST (470+ endpoints)
- `database/` - Diseño de base de datos (44 tablas, 11 schemas)
- `tipos-compartidos/` - Tipos TypeScript compartidos (70+ tipos)
- `seguridad/` - Defense-in-Depth, RLS, validación
- 📍 **Ubicación:** `docs/02-especificaciones-tecnicas/`
- 📋 **_MAP:** `docs/02-especificaciones-tecnicas/_MAP.md`
- **Estado:** ✅ 90% Completo

### 03-desarrollo/ 💻
**Guías de desarrollo** - Developer guides
- `backend/` - NestJS 11, 11 módulos, servicios, middleware
- `frontend/` - React 19, Vite, Zustand, 33 mecánicas educativas
- `base-de-datos/` - PostgreSQL 16, migraciones, seeds, triggers
- `testing/` - Estrategia de testing (Jest, Vitest, E2E)
- 📍 **Ubicación:** `docs/03-desarrollo/`
- 📋 **_MAP:** `docs/03-desarrollo/_MAP.md`
- **Estado:** ✅ 88% Completo

### 04-planificacion/ 📅
**Planificación y roadmap** - Project planning
- `01-alcance-inicial/` - EAI (Épicas de Alcance Inicial) con historias de usuario
- `02-migracion-robustecimiento/` - EMR features
- `03-extensiones/` - EXT features (portal maestros, notificaciones, etc.)
- `roadmap/` - Roadmap general (3 meses, 135 SP)
- `features/` - Análisis de features implementadas y pendientes
- 📍 **Ubicación:** `docs/04-planificacion/`
- 📋 **_MAP:** `docs/04-planificacion/_MAP.md`
- **Estado:** ✅ 85% Completo

### QUICK-REFERENCE/ ⚡
**Guías rápidas** (<5 minutos de lectura)
- `API-CHEATSHEET.md` - Endpoints principales
- `DB-CHEATSHEET.md` - Queries comunes
- `DEPLOY-CHECKLIST.md` - Checklist de deployment
- 📍 **Ubicación:** `docs/QUICK-REFERENCE/`
- 📋 **_MAP:** `docs/QUICK-REFERENCE/_MAP.md`

### adr/ 📜
**Architecture Decision Records** - Decisiones de arquitectura documentadas
- `ADR-0001-monorepo-architecture.md` - Decisión de monorepo
- `ADR-0002-simco-system.md` - Sistema SIMCO de planificación
- 📍 **Ubicación:** `docs/adr/`
- 📋 **_MAP:** `docs/adr/_MAP.md`

### standards/ 📏
**Estándares y convenciones** - Coding standards
- `CODING-STANDARDS.md` - Estándares de código (TypeScript, naming, etc.)
- `GIT-WORKFLOW.md` - Flujo de trabajo Git (commits, branches, PRs)
- `RESOLUTION-LOG.md` - Log de resoluciones de inconsistencias
- 📍 **Ubicación:** `docs/standards/`
- 📋 **_MAP:** `docs/standards/_MAP.md`

---

## 🔍 Cómo Navegar la Documentación

### Método 1: Por Rol

**Soy Desarrollador Backend:**
```
1. docs/03-desarrollo/backend/
2. docs/02-especificaciones-tecnicas/api/
3. docs/03-desarrollo/base-de-datos/
4. docs/standards/CODING-STANDARDS.md
```

**Soy Desarrollador Frontend:**
```
1. docs/03-desarrollo/frontend/
2. docs/02-especificaciones-tecnicas/tipos-compartidos/
3. docs/01-requerimientos/modulos/ (mecánicas educativas)
4. docs/standards/CODING-STANDARDS.md
```

**Soy Product Owner:**
```
1. docs/01-requerimientos/proyecto/VISION-PRODUCTO.md
2. docs/04-planificacion/roadmap/ROADMAP-GENERAL.md
3. docs/04-planificacion/features/
4. docs/01-requerimientos/gamificacion/
```

**Soy QA Engineer:**
```
1. docs/03-desarrollo/testing/
2. docs/01-requerimientos/casos-uso/
3. docs/02-especificaciones-tecnicas/api/
4. docs/04-planificacion/ (historias de usuario)
```

### Método 2: Por Tarea

**Necesito implementar una feature:**
```
1. Buscar en 01-requerimientos/ (¿qué necesita el usuario?)
2. Leer en 02-especificaciones-tecnicas/ (¿cómo se diseña?)
3. Consultar 03-desarrollo/ (¿cómo se implementa?)
4. Revisar 04-planificacion/ (¿cuándo y prioridad?)
```

**Necesito entender una decisión:**
```
1. Buscar en adr/ (Architecture Decision Records)
2. Leer el contexto, alternativas consideradas y decisión
3. Ver referencias a implementación
```

**Necesito hacer deploy:**
```
1. docs/QUICK-REFERENCE/DEPLOY-CHECKLIST.md
2. docs/03-desarrollo/deployment/
3. docs/02-especificaciones-tecnicas/infraestructura/
```

### Método 3: Por Archivo _MAP.md

Cada carpeta importante tiene un archivo `_MAP.md` que explica:
- Propósito de la carpeta
- Estructura de contenido
- Interdependencias
- Issues conocidos
- Próximos pasos

**Ejemplo:** `docs/01-requerimientos/_MAP.md`

---

## 📊 Estadísticas de Documentación

### Tamaño y Cobertura

- **Total archivos .md:** 411
- **Total líneas:** 198,964
- **Total carpetas:** 101
- **Archivos _MAP.md:** 40 (46% cobertura)
- **Archivos README.md:** 60+

### Estado por Carpeta

| Carpeta | Archivos | Estado | Completitud |
|---------|----------|--------|-------------|
| 00-overview/ | 3 | ✅ Activo | 75% |
| 01-requerimientos/ | 47 | ✅ Modularizado | 95% |
| 02-especificaciones-tecnicas/ | 80+ | ✅ Activo | 90% |
| 03-desarrollo/ | 120+ | ✅ Activo | 88% |
| 04-planificacion/ | 150+ | ✅ Activo | 85% |
| QUICK-REFERENCE/ | 3 | ✅ Activo | 100% |
| adr/ | 2 | ✅ Activo | 100% |
| standards/ | 4 | ✅ Activo | 100% |

---

## 🎯 Fuentes Canónicas

Cuando hay inconsistencias, estos son los documentos autoritativos:

| Concepto | Fuente Canónica | Ubicación |
|----------|-----------------|-----------|
| **Rangos Maya** | 01-RANGOS-MAYA.md | `01-requerimientos/gamificacion/` |
| **Mecánicas Educativas** | MODULOS-EDUCATIVOS.md | `01-requerimientos/modulos/` |
| **ML Coins** | 02-ECONOMIA-ML-COINS.md | `01-requerimientos/gamificacion/` |
| **Arquitectura** | ARQUITECTURA-GENERAL.md | `02-especificaciones-tecnicas/arquitectura/` |
| **Base de Datos** | ESQUEMA-COMPLETO.md | `03-desarrollo/base-de-datos/` |
| **APIs** | API-REFERENCE.md | `02-especificaciones-tecnicas/api/` |
| **Coding Standards** | CODING-STANDARDS.md | `standards/` |

Ver detalles completos en: `docs/standards/RESOLUTION-LOG.md`

---

## 🚨 Problemas Conocidos

### P0 - CRÍTICOS

- ⚠️ **Inconsistencia mecánicas educativas** (31 vs 33) - Ver `standards/RESOLUTION-LOG.md` LOG-001
- ⬜ 47 carpetas sin _MAP.md que lo necesitan - En progreso (5/47 completados)

### P1 - ALTOS

- ⬜ 20 archivos sin headers de metadata
- ⬜ 25+ links rotos a archivos faltantes
- ⬜ 9 casos de uso prometidos pero no documentados (UC-STU-004 a 012)

**Ver reporte completo:** `/tmp/REPORTE-VALIDACION-DOCUMENTACION.md`

---

## 🛠️ Herramientas y Scripts

### Validación de Documentación

**Scripts disponibles:**
- `validate_docs.sh` - Valida links, headers, TODOs
- `check_broken_links.sh` - Detecta links rotos
- `check_definitions.sh` - Verifica coherencia de conceptos

**Ubicación:** `/tmp/` (scripts temporales, pendiente mover a `/scripts/`)

### Pre-commit Hooks

**Configurar validación automática:**
```bash
# TODO: Implementar pre-commit hooks para validar:
# - Links no rotos
# - Headers presentes
# - _MAP.md actualizados
```

---

## 📞 Contacto y Soporte

**Owners de documentación:**
- **Arquitectura:** @tech-lead
- **Requerimientos:** @product-owner
- **Desarrollo:** @backend-team @frontend-team
- **Planificación:** @scrum-master

**Reporte de issues:**
- GitHub Issues: [GAMILIT Docs]
- Slack: #gamilit-docs

**Contribuciones:**
- Seguir estándares en `docs/standards/CODING-STANDARDS.md`
- Crear _MAP.md para carpetas nuevas
- Actualizar fecha de "Última Actualización" en headers
- Crear PR para cambios mayores

---

## 🔄 Historial de Cambios

### 2025-11-07 (RFC-0001 Consolidación)

- ✅ Reemplazo masivo GLIT → GAMILIT (228 archivos)
- ✅ Corrección rangos Maya en 00_OVERVIEW.md
- ✅ Actualización rutas de lectura en 00_OVERVIEW.md
- ✅ Creación 5 _MAP.md críticos (backend, frontend, base-de-datos, proyecto, roadmap)
- ✅ Creación RESOLUTION-LOG.md
- ✅ Creación README.md maestro (este archivo)

### 2025-11-01 (RFC-0001 Modularización)

- ✅ Modularización de 47 archivos legacy
- ✅ Creación de 40 _MAP.md
- ✅ Sistema de 5 rangos Maya confirmado
- ✅ Documentación exhaustiva de 31 mecánicas educativas

---

## 🎯 Próximos Pasos

### Esta Semana (P0)

1. ✅ Crear README.md maestro (este archivo)
2. ⬜ Resolver inconsistencia mecánicas (31 vs 33) - Ver LOG-001
3. ⬜ Crear 7 _MAP.md para carpetas P0 críticas
4. ⬜ Agregar headers a 6 archivos críticos

### Próximas 2 Semanas (P1)

5. ⬜ Crear casos de uso UC-STU-004 a 012
6. ⬜ Crear 10 _MAP.md adicionales para carpetas P1
7. ⬜ Resolver 25+ links rotos
8. ⬜ Implementar scripts de validación

### Próximo Mes (P2)

9. ⬜ Completar 30 _MAP.md restantes
10. ⬜ Modularizar 34 archivos >1000 líneas
11. ⬜ Poblar carpeta `interfaces/` con wireframes
12. ⬜ Implementar pre-commit hooks de validación

---

**Bienvenido a la documentación de GAMILIT** 🎓✨

Recuerda: La documentación es la fuente de verdad. Si encuentras una inconsistencia entre código y docs, **consulta primero la documentación** y crea un issue si es necesario.

---

**Generado:** 2025-11-07
**Método:** Índice maestro para navegación centralizada
**Próxima revisión:** Semanal (cada lunes)
