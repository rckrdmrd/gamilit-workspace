# _MAP: docs/03-desarrollo/

**Última actualización:** 2025-12-18
**Estado:** 🟡 En desarrollo (estructura creada, contenido pendiente)
**Versión:** 2.0 (RFC-0001)
**Propósito:** Guías de desarrollo que mapean la estructura del código

---

## 📋 Propósito de esta Carpeta

Esta carpeta contiene **guías de desarrollo** que documentan la estructura y organización del código **sin invadir las carpetas de código**. Es el **"mapa externo"** del código fuente.

**Principio Fundamental:** La documentación **describe** el código desde fuera, **NO vive dentro** del código.

**Enfoque:**
```
✅ CORRECTO:
docs/03-desarrollo/backend/ESTRUCTURA-MODULOS.md
    └─> referencia a: apps/backend/src/modules/

❌ INCORRECTO:
apps/backend/src/modules/_MAP.md
```

**Audiencia:**
- Desarrolladores Backend (NestJS, TypeScript)
- Desarrolladores Frontend (React, TypeScript)
- Database Administrators (PostgreSQL)
- DevOps Engineers (Deployment, CI/CD)
- QA Engineers (Testing)
- Nuevos desarrolladores (Onboarding)

---

## 📁 Estructura de Contenido

### Guías por Componente

| Carpeta | Propósito | Guías | Código que mapea | Owner | Estado | _MAP.md |
|---------|-----------|-------|------------------|-------|--------|---------|
| **backend/** | Guías desarrollo backend NestJS | 7 planeadas | `apps/backend/` | @backend-team | 🟡 14% | ✅ Existe |
| **frontend/** | Guías desarrollo frontend React | 7 planeadas | `apps/frontend/` | @frontend-team | 🟡 0% | ✅ Existe |
| **base-de-datos/** | Guías PostgreSQL, migrations | 5+ | `apps/database/` | @database-team | 🟢 Completo | ✅ Existe |
| **database/** | (duplicado?) | - | `apps/database/` | @database-team | ⚠️ Revisar | ✅ Existe |
| **deployment/** | Guías de deployment | 3+ | DevOps configs | @devops-team | 🟡 Parcial | ✅ Existe |
| **integraciones/** | Guías de integraciones externas | 2+ | Integraciones | @backend-team | 🟡 Parcial | ✅ Existe |
| **testing/** | Guías de testing | 5+ | Tests | @qa-team | 🟡 Parcial | ✅ Existe |

**Total carpetas:** 8 (posiblemente 7 tras consolidación)

---

## 🗂️ Desglose por Carpeta

### backend/ - Guías Backend

**Descripción:** Guías de desarrollo para el backend NestJS

**Código que mapea:** `apps/backend/` (108 MB, ~45k LOC, 13 módulos)

**Contenido actual:**
- ✅ `GUARDS-Y-SEGURIDAD.md` - Guards y seguridad

**Guías planeadas (CRÍTICAS):**
1. ⚪ `ESTRUCTURA-MODULOS.md` - Mapa de `apps/backend/src/modules/` (11 módulos)
2. ⚪ `ESTRUCTURA-SHARED.md` - Mapa de `apps/backend/src/shared/`
3. ⚪ `DATABASE-INTEGRATION.md` - Integración con PostgreSQL
4. ⚪ `API-CONVENTIONS.md` - Convenciones de APIs (470+ endpoints)
5. ⚪ `SETUP-DESARROLLO.md` - Setup local del backend
6. ⚪ `ERROR-HANDLING.md` - Manejo de errores
7. ⚪ `TESTING-BACKEND.md` - Testing en backend (Jest)

**Total planeadas:** 7 guías
**Total existentes:** 1 guía
**Completitud:** 14%

**Estado:** 🟡 Estructura creada, contenido crítico pendiente

**_MAP.md:** ✅ Existe

**Prioridad:** 🔥 ALTA - Sin estas guías, los desarrolladores no pueden navegar los 11 módulos

---

### frontend/ - Guías Frontend

**Descripción:** Guías de desarrollo para el frontend React

**Código que mapea:** `apps/frontend/` (15 MB, ~98k LOC, 483 componentes)

**Contenido actual:**
- ⚪ Ningún documento útil creado

**Guías planeadas (CRÍTICAS):**
1. ⚪ `ESTRUCTURA-FEATURES.md` - Mapa de `apps/frontend/src/features/` (student/teacher/admin)
2. ⚪ `ESTRUCTURA-SHARED.md` - Mapa de `apps/frontend/src/shared/components/` (180+ componentes)
3. ⚪ `COMPONENTES-UI.md` - Catálogo de componentes UI
4. ⚪ `STATE-MANAGEMENT.md` - Zustand stores (8 stores)
5. ⚪ `API-INTEGRATION.md` - Integración con backend
6. ⚪ `SETUP-DESARROLLO.md` - Setup local del frontend
7. ⚪ `TESTING-FRONTEND.md` - Testing en frontend (Vitest)

**Total planeadas:** 7 guías
**Total existentes:** 0 guías
**Completitud:** 0%

**Estado:** 🔴 Estructura creada, sin contenido

**_MAP.md:** ✅ Existe

**Prioridad:** 🔥 ALTA - Sin estas guías, imposible navegar 180+ componentes

---

### base-de-datos/ - Guías Database

**Descripción:** Guías de PostgreSQL, migrations, y DDL

**Código que mapea:** `apps/database/` (3.8 MB, 16 schemas, 123 tablas)

**Contenido:**
- Guías de schemas
- Migrations
- Seeds
- Funciones y triggers

**Total guías:** ~5

**Estado:** 🟢 Completo

**_MAP.md:** ✅ Existe

**Nota:** Esta carpeta tiene buen contenido (a diferencia de backend/frontend)

---

### database/ - (Duplicado?)

**Descripción:** Posible duplicado de `base-de-datos/`

**Acción recomendada:** Consolidar con `base-de-datos/` o eliminar

**Estado:** ⚠️ Revisar duplicación

**_MAP.md:** ✅ Existe

---

### deployment/ - Guías Deployment

**Descripción:** Guías de deployment y DevOps

**Código que mapea:** Configuraciones de deployment (planeadas en `devops/`)

**Contenido:**
- Guías de deployment
- CI/CD pipelines
- Docker configs

**Total guías:** ~3

**Estado:** 🟡 Parcial

**_MAP.md:** ✅ Existe

---

### integraciones/ - Guías de Integraciones

**Descripción:** Guías de integraciones con servicios externos

**Integraciones:**
- OAuth providers (Google, Facebook, Apple, Microsoft, GitHub)
- Storage (S3, Cloudflare R2)
- Email (SendGrid, Mailgun)
- Otros servicios externos

**Total guías:** ~2

**Estado:** 🟡 Parcial

**_MAP.md:** ✅ Existe

---

### testing/ - Guías de Testing

**Descripción:** Guías de testing (unit, integration, E2E)

**Contenido:**
- Unit testing (Jest, Vitest)
- Integration testing
- E2E testing
- Test coverage

**Total guías:** ~5

**Estado:** 🟡 Parcial

**_MAP.md:** ✅ Existe

---

## 🔗 Interdependencias

### Esta Carpeta Mapea (sin invadir):

- **apps/backend/** - Guías describen estructura de backend
- **apps/frontend/** - Guías describen estructura de frontend
- **apps/database/** - Guías describen schemas y DDL

### Esta Carpeta Consume De:

- **docs/02-especificaciones-tecnicas/** - Especificaciones técnicas
- **apps/** - Inspección del código real
- **Desarrolladores** - Feedback de experiencia

### Esta Carpeta Alimenta A:

- **Nuevos desarrolladores** - Onboarding rápido
- **Agentes de IA** - Navegación del código
- **Documentación** - Referencias cruzadas

### Flujo de Información:

```
docs/02-especificaciones-tecnicas/
         ↓
docs/03-desarrollo/ (guías de "cómo desarrollar")
         ↓
    apps/ (código real)
```

---

## 📊 Métricas de Guías

### Cobertura General

| Métrica | Valor |
|---------|-------|
| **Total carpetas** | 8 |
| **Total archivos .md** | 127 |
| **Guías completadas** | ~15 |
| **Guías planeadas** | ~35 |
| **Completitud** | ~43% |
| **Archivos _MAP.md** | 7/8 (88%) |

### Completitud por Componente

| Componente | Guías planeadas | Guías existentes | % |
|------------|-----------------|------------------|---|
| **Backend** | 7 | 1 | 14% |
| **Frontend** | 7 | 0 | 0% |
| **Database** | 5 | 5 | 100% |
| **Deployment** | 3 | 1 | 33% |
| **Integraciones** | 2 | 1 | 50% |
| **Testing** | 5 | 2 | 40% |

**Promedio:** ~43% completitud

### Impacto del Gap

**14 guías críticas faltantes:**
- 7 guías backend (mapeo de 11 módulos, 45k LOC)
- 7 guías frontend (mapeo de 180+ componentes, 85k LOC)

**Sin estas guías:**
- ❌ Desarrolladores nuevos no pueden navegar el código
- ❌ Agentes de IA no tienen contexto de estructura
- ❌ Difícil entender organización de 11 módulos backend
- ❌ Imposible localizar entre 180+ componentes frontend

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** Falta contenido crítico en backend/ (86% vacío)
  - Solo 1/7 guías creadas
  - Impacto: No hay mapa de 11 módulos NestJS
  - Esfuerzo: 12 horas (7 guías × 1.5h c/u)

- **P0-002:** Falta contenido crítico en frontend/ (100% vacío)
  - 0/7 guías creadas
  - Impacto: No hay mapa de 180+ componentes React
  - Esfuerzo: 12 horas (7 guías × 1.5h c/u)

**Total P0:** 24 horas para resolver gaps críticos

### P1 (Alto)

- **P1-001:** Carpetas duplicadas
  - `base-de-datos/` vs `database/`
  - Impacto: Confusión sobre cuál usar
  - Recomendación: Consolidar en `base-de-datos/`
  - Esfuerzo: 2 horas

### P2 (Medio)

- **P2-001:** Guías de deployment incompletas
  - Solo 1/3 guías
  - Impacto: Setup de deployment no documentado
  - Esfuerzo: 4 horas

---

## 📐 Estándares Aplicables

### Principio Fundamental

**"Documentación Externa Referencia, No Invade"**

```
✅ CORRECTO:
docs/03-desarrollo/backend/ESTRUCTURA-MODULOS.md
    └─> Describe: apps/backend/src/modules/

❌ INCORRECTO:
apps/backend/src/modules/_MAP.md
```

### Formato de Guías

Cada guía debe incluir:
1. **Título descriptivo**
2. **Código que mapea** - Path desde raíz del monorepo
3. **Propósito** - Qué resuelve esta guía
4. **Estructura** - Organización del código
5. **Convenciones** - Patrones aplicados
6. **Ejemplos** - Código de ejemplo
7. **Referencias** - Enlaces a especificaciones técnicas

**Ejemplo:**

```markdown
# ESTRUCTURA-MODULOS.md

## Código que mapea
`apps/backend/src/modules/`

## Propósito
Esta guía documenta los 11 módulos funcionales del backend NestJS.

## Módulos Implementados

| Módulo | Path | Propósito | Endpoints |
|--------|------|-----------|-----------|
| **auth/** | `apps/backend/src/modules/auth/` | Autenticación | 15 |
| **educational/** | `apps/backend/src/modules/educational/` | Contenido educativo | 42 |
...

## Estructura Estándar de un Módulo

```
modules/{nombre}/
├── controllers/
├── services/
├── dto/
├── entities/
└── {nombre}.module.ts
```

## Convenciones
...
```

### Referencias a Código

**Formato:** Paths absolutos desde raíz del monorepo

```markdown
**Backend:** `apps/backend/src/modules/auth/`
**Frontend:** `apps/frontend/src/features/auth/`
**Database:** `apps/database/ddl/schemas/auth_management/`
```

**Con números de línea (opcional):**
```markdown
**Enum:** `apps/backend/src/shared/enums/gamilit-role.enum.ts:15-20`
```

---

## 🔍 Validación (Go/No-Go)

### Criterios de Aceptación

- [x] _MAP.md creado (este archivo) ✅
- [x] 7 carpetas con _MAP.md (100%) ✅
- [x] Guías de database completas ✅
- [ ] 14 guías críticas (backend + frontend) (0/14) 🔴
- [ ] Carpetas duplicadas consolidadas 🔴
- [ ] 80% guías completadas (actual: 43%) 🔴

**Decisión:** 🔴 **NO-GO** - Estructura creada pero sin contenido crítico

**Blocker:** Sin las 14 guías de backend/frontend, los desarrolladores no pueden navegar el código efectivamente.

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Backend: @backend-team
- Frontend: @frontend-team
- Database: @database-team
- Deployment: @devops-team
- Testing: @qa-team

**Reporte de issues:**
- GitHub Issues: [GAMILIT Development Guides]
- Slack: #gamilit-dev

---

## 🎯 Próximos Pasos (CRÍTICOS)

### Fase 1 - URGENTE (Esta Semana) 🔥

1. ✅ _MAP.md creado (este archivo)
2. ⬜ Crear 7 guías backend (12 horas)
   - ESTRUCTURA-MODULOS.md (2h) - **CRÍTICA**
   - ESTRUCTURA-SHARED.md (1.5h)
   - DATABASE-INTEGRATION.md (2h)
   - API-CONVENTIONS.md (2h)
   - SETUP-DESARROLLO.md (1.5h)
   - ERROR-HANDLING.md (1.5h)
   - TESTING-BACKEND.md (1.5h)

3. ⬜ Crear 7 guías frontend (12 horas)
   - ESTRUCTURA-FEATURES.md (2h) - **CRÍTICA**
   - ESTRUCTURA-SHARED.md (2h) - **CRÍTICA**
   - COMPONENTES-UI.md (2h)
   - STATE-MANAGEMENT.md (2h)
   - API-INTEGRATION.md (1.5h)
   - SETUP-DESARROLLO.md (1.5h)
   - TESTING-FRONTEND.md (1.5h)

**Total Fase 1:** 24 horas → **+14 guías críticas**

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

4. ⬜ Consolidar base-de-datos/ y database/ (2 horas)
5. ⬜ Completar guías de deployment (4 horas)
6. ⬜ Completar guías de testing (6 horas)
7. ⬜ Actualizar guías con feedback de desarrolladores (4 horas)

**Total Fase 2:** 16 horas

### Fase 3 - Media Prioridad (Próximo Mes)

8. ⬜ Crear guías avanzadas (arquitectura, patterns) (10 horas)
9. ⬜ Automatizar generación de mapas desde código (16 horas)
10. ⬜ Integrar guías en onboarding (4 horas)

**Total Fase 3:** 30 horas

---

## 🚀 Navegación Rápida

### Para Nuevos Desarrolladores

```bash
# Setup inicial
cat docs/03-desarrollo/backend/SETUP-DESARROLLO.md
cat docs/03-desarrollo/frontend/SETUP-DESARROLLO.md

# Entender estructura
cat docs/03-desarrollo/backend/ESTRUCTURA-MODULOS.md
cat docs/03-desarrollo/frontend/ESTRUCTURA-FEATURES.md

# Testing
cat docs/03-desarrollo/testing/
```

### Para Desarrolladores Activos

```bash
# Buscar módulo específico
cat docs/03-desarrollo/backend/ESTRUCTURA-MODULOS.md

# Encontrar componente
cat docs/03-desarrollo/frontend/COMPONENTES-UI.md

# Integración con DB
cat docs/03-desarrollo/backend/DATABASE-INTEGRATION.md
```

### Para Agentes de IA

```bash
# Leer mapa de backend
cat docs/03-desarrollo/backend/ESTRUCTURA-MODULOS.md

# Leer mapa de frontend
cat docs/03-desarrollo/frontend/ESTRUCTURA-FEATURES.md

# Referencias a código real
# (los paths en las guías apuntan a apps/)
```

---

## 📚 Recursos Adicionales

**Documentación relacionada:**
- Especificaciones técnicas: [../02-especificaciones-tecnicas/](../02-especificaciones-tecnicas/)
- Arquitectura: [../02-especificaciones-tecnicas/arquitectura/](../02-especificaciones-tecnicas/arquitectura/)
- APIs: [../02-especificaciones-tecnicas/apis/](../02-especificaciones-tecnicas/apis/)

**Código fuente:**
- Backend: `apps/backend/`
- Frontend: `apps/frontend/`
- Database: `apps/database/`

**Repositorios de código:**
- Monorepo raíz: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/`

---

## ⚠️ ADVERTENCIA IMPORTANTE

**Esta carpeta NO debe contener _MAP.md dentro de `apps/`**

El código debe permanecer **libre de documentación SIMCO**.

Solo `docs/` contiene _MAP.md y referencias al código.

---

**Generado:** 2025-12-18
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras crear 14 guías críticas
**Versión:** 1.0.0
