# PROMPTS DE AGENTES - GAMILIT

**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## 📋 ÍNDICE DE PROMPTS

Este directorio contiene los prompts específicos para cada tipo de agente en el proyecto GAMILIT.

### 🎯 Agentes Principales (3)

Responsables de implementación por capa técnica:

| Agente | Archivo | Descripción | Tamaño |
|--------|---------|-------------|--------|
| **Database-Agent** | [PROMPT-DATABASE-AGENT.md](./PROMPT-DATABASE-AGENT.md) | DDL, schemas, tablas, RLS, seeds | 13KB |
| **Backend-Agent** | [PROMPT-BACKEND-AGENT.md](./PROMPT-BACKEND-AGENT.md) | NestJS, TypeORM, API REST, Swagger | 12KB |
| **Frontend-Agent** | [PROMPT-FRONTEND-AGENT.md](./PROMPT-FRONTEND-AGENT.md) | React, Zustand, componentes, UI | 7KB |

### 🔧 Agentes Especializados (5)

Responsables de tareas específicas end-to-end:

| Agente | Archivo | Descripción | Tamaño |
|--------|---------|-------------|--------|
| **Requirements-Analyst** | [PROMPT-REQUIREMENTS-ANALYST.md](./PROMPT-REQUIREMENTS-ANALYST.md) | Análisis de requerimientos, dependency graph | 14KB |
| **Bug-Fixer** | [PROMPT-BUG-FIXER.md](./PROMPT-BUG-FIXER.md) | Diagnóstico y corrección de bugs | 6KB |
| **Code-Reviewer** | [PROMPT-CODE-REVIEWER.md](./PROMPT-CODE-REVIEWER.md) | Revisión de código, validación de calidad | 6KB |
| **Feature-Developer** | [PROMPT-FEATURE-DEVELOPER.md](./PROMPT-FEATURE-DEVELOPER.md) | Features completos (DB+BE+FE coordinados) | 6KB |
| **Policy-Auditor** | [PROMPT-POLICY-AUDITOR.md](./PROMPT-POLICY-AUDITOR.md) | Auditoría de cumplimiento de políticas | 7KB |

### 🔍 Agentes de Validación (2) - NUEVOS

Responsables de validación pre y post implementación:

| Agente | Archivo | Descripción | Tamaño |
|--------|---------|-------------|--------|
| **Documentation-Validator** | [PROMPT-DOCUMENTATION-VALIDATOR.md](./PROMPT-DOCUMENTATION-VALIDATOR.md) | Validación PRE-implementación de docs, inventarios, specs | 18KB |
| **Database-Auditor** | [PROMPT-DATABASE-AUDITOR.md](./PROMPT-DATABASE-AUDITOR.md) | Auditoría POST-implementación BD (carga limpia, UUIDs, scripts) | 22KB |

### 🤖 Subagentes (1)

Para tareas delegadas por agentes principales:

| Tipo | Archivo | Descripción | Tamaño |
|------|---------|-------------|--------|
| **Subagentes** | [PROMPT-SUBAGENTES.md](./PROMPT-SUBAGENTES.md) | Prompt genérico para tareas delegadas | 28KB |

---

## 🚀 GUÍA RÁPIDA DE USO

### Flujo de Validación Recomendado

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE 3 FASES                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────┐      ┌────────────────────┐      ┌──────────┐ │
│   │  1. PRE-IMPLEMENT.  │      │  2. IMPLEMENTACIÓN │      │ 3. POST  │ │
│   │  Documentation-     │ GO   │  Database-Agent    │      │ Database-│ │
│   │  Validator          │ ───▶ │  Backend-Agent     │ ───▶ │ Auditor  │ │
│   │                     │      │  Frontend-Agent    │      │          │ │
│   └─────────────────────┘      └────────────────────┘      └──────────┘ │
│   Valida docs, specs,          Solo implementan           Valida carga  │
│   inventarios, anti-dup        (ya validado)              limpia, UUIDs │
│   Resultado: GO/NO-GO          Actualizan inventarios     APROBADO/RECH │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### ¿Qué agente usar?

```
┌─────────────────────────────────────────────┐
│ ¿Qué necesitas hacer?                       │
└─────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
 Validar         Implementar      Auditar
    │               │               │
    v               v               v
┌─────────┐    ┌─────────┐    ┌─────────────┐
│ PRE:    │    │         │    │ POST:       │
│ Documen-│    │ DB/BE/FE│    │ Database-   │
│ tation- │    │ Agents  │    │ Auditor     │
│ Validator│   │         │    │ Policy-     │
└─────────┘    └─────────┘    │ Auditor     │
                              └─────────────┘

IMPLEMENTACIÓN:
├── Solo BD ─────────────▶ Database-Agent
├── Solo Backend ────────▶ Backend-Agent
├── Solo Frontend ───────▶ Frontend-Agent
├── Feature Completo ────▶ Feature-Developer
└── Bug a corregir ──────▶ Bug-Fixer

ANÁLISIS:
├── Analizar requerimientos ─▶ Requirements-Analyst
├── Revisar código ──────────▶ Code-Reviewer
└── Arquitectura ────────────▶ Architecture-Analyst
```

### Ejemplos de Uso

**1. Crear una tabla nueva:**
```bash
# Usar: Database-Agent
cat orchestration/prompts/PROMPT-DATABASE-AGENT.md
```

**2. Implementar una API nueva:**
```bash
# Usar: Backend-Agent
cat orchestration/prompts/PROMPT-BACKEND-AGENT.md
```

**3. Crear una página nueva:**
```bash
# Usar: Frontend-Agent
cat orchestration/prompts/PROMPT-FRONTEND-AGENT.md
```

**4. Implementar feature completo (Login):**
```bash
# Usar: Feature-Developer
# Este agente coordinará Database, Backend y Frontend
cat orchestration/prompts/PROMPT-FEATURE-DEVELOPER.md
```

**5. Corregir un bug:**
```bash
# Usar: Bug-Fixer
cat orchestration/prompts/PROMPT-BUG-FIXER.md
```

**6. Revisar un PR:**
```bash
# Usar: Code-Reviewer
cat orchestration/prompts/PROMPT-CODE-REVIEWER.md
```

**7. Analizar requerimiento del MVP:**
```bash
# Usar: Requirements-Analyst
cat orchestration/prompts/PROMPT-REQUIREMENTS-ANALYST.md
```

**8. Auditar cumplimiento:**
```bash
# Usar: Policy-Auditor
cat orchestration/prompts/PROMPT-POLICY-AUDITOR.md
```

**9. Validar documentación ANTES de implementar:**
```bash
# Usar: Documentation-Validator
# Ejecutar ANTES de orquestar Database/Backend/Frontend-Agent
cat orchestration/prompts/PROMPT-DOCUMENTATION-VALIDATOR.md
```

**10. Auditar cambios en BD DESPUÉS de implementar:**
```bash
# Usar: Database-Auditor
# Ejecutar DESPUÉS de que Database-Agent complete cambios
# Valida Política de Carga Limpia, UUIDs, scripts actualizados
cat orchestration/prompts/PROMPT-DATABASE-AUDITOR.md
```

---

## 📖 ESTRUCTURA COMÚN DE PROMPTS

Todos los prompts siguen esta estructura:

```markdown
# PROMPT PARA {AGENTE} - GAMILIT

## 🎯 PROPÓSITO
- Descripción del rol del agente
- Responsabilidades principales

## 📋 OBJETIVO PRINCIPAL DEL PROYECTO
- Contexto de GAMILIT
- Stack tecnológico específico

## 🚨 DIRECTIVAS CRÍTICAS (OBLIGATORIAS)
- Documentación obligatoria
- Análisis antes de ejecución
- Convenciones de nomenclatura
- Ubicación de archivos
- Validación anti-duplicación

## 📚 ARCHIVOS DE CONTEXTO IMPORTANTES
- Rutas de documentación
- Rutas de código
- Rutas de orchestration

## 🔄 FLUJO DE TRABAJO OBLIGATORIO
- Fase 1: Análisis
- Fase 2: Plan
- Fase 3: Ejecución
- Fase 4: Validación
- Fase 5: Documentación

## 📊 ESTÁNDARES DE CÓDIGO
- Ejemplos específicos del agente
- Convenciones
- Patrones recomendados

## 🚀 COMANDOS ÚTILES
- Validaciones rápidas
- Búsqueda de duplicados
- Comandos específicos

## ✅ CHECKLIST FINAL
- Lista de verificación antes de completar tarea
```

---

## 🔍 DIFERENCIAS CLAVE ENTRE AGENTES

### Database vs Backend vs Frontend

**Database-Agent:**
- Solo trabaja en `apps/database/`
- DDL, schemas, tablas, funciones
- PostgreSQL, SQL puro

**Backend-Agent:**
- Solo trabaja en `apps/backend/`
- Entities, Services, Controllers
- NestJS, TypeScript, TypeORM

**Frontend-Agent:**
- Solo trabaja en `apps/frontend/`
- Páginas, componentes, stores
- React, TypeScript, Zustand

### Feature-Developer vs Agentes Principales

**Agentes Principales:**
- Trabajan en UNA sola capa
- Enfoque técnico específico

**Feature-Developer:**
- Coordina los 3 agentes principales
- Implementa feature COMPLETO end-to-end
- Asegura alineación 100% entre capas

### Bug-Fixer vs Code-Reviewer

**Bug-Fixer:**
- Reactivo (corrige bugs existentes)
- Diagnóstico + fix + test de regresión
- Minimal change

**Code-Reviewer:**
- Proactivo (previene bugs)
- Revisión de calidad
- Identifica code smells y mejoras

### Workspace-Manager vs Documentation-Validator (DIFERENCIA CRÍTICA)

**Workspace-Manager:**
- **Rol:** Guardián del ORDEN del workspace
- **Qué hace:** REUBICA documentación mal ubicada
- **Detecta:** .md en raíz, apps/, orchestration/ que va en docs/
- **Acciones:** Mover archivos, archivar backups, limpiar temporales
- **Después:** Notifica a Documentation-Validator para validar contenido

**Documentation-Validator:**
- **Rol:** Dueño de `docs/`
- **Qué hace:** VALIDA contenido de documentación
- **Valida:** Estructura, completitud, alineación de docs/
- **Resultado:** GO (contenido OK) o NO-GO (ajustes necesarios)
- **NO hace:** Mover archivos (eso es de Workspace-Manager)

```
FLUJO TÍPICO:
1. Workspace-Manager: Detecta doc mal ubicada → Reubica → Notifica
2. Documentation-Validator: Valida contenido → GO/NO-GO
```

### Database-Auditor vs Policy-Auditor

**Database-Auditor:**
- **Cuándo:** POST-implementación (DESPUÉS de cambios en BD)
- **Qué valida:** Política de Carga Limpia, UUIDs, scripts, recreación
- **Resultado:** APROBADO o RECHAZADO
- **Especializado en:** Solo base de datos

**Policy-Auditor:**
- **Cuándo:** Auditoría periódica o revisión general
- **Qué valida:** Cumplimiento general de todas las directivas
- **Resultado:** Reporte de auditoría con hallazgos
- **Alcance:** Todo el proyecto (DB + Backend + Frontend)

---

## 📝 NOTAS

- **Fecha creación:** 2025-11-23
- **Última actualización:** 2025-11-29
- **Reorganización:** Nueva estructura con prompts individuales
- **Anterior:** PROMPT-AGENTES-PRINCIPALES.md agrupaba Database/Backend/Frontend
- **Actual:** Cada agente tiene su prompt específico
- **Nuevos (2025-11-29):**
  - `PROMPT-DOCUMENTATION-VALIDATOR.md` - Dueño de docs/, valida contenido
  - `PROMPT-DATABASE-AUDITOR.md` - Auditoría post-implementación BD
- **Actualizados (2025-11-29):**
  - `PROMPT-WORKSPACE-MANAGER.md` - Clarificado rol de reubicación de documentación
  - `PROMPT-ARCHITECTURE-ANALYST.md` - Agregada guía de cuándo usar cada agente
- **Ventaja:** Separación clara entre reubicación (Workspace-Manager) y validación (Documentation-Validator)

---

**Versión:** 1.2.0
**Proyecto:** GAMILIT
**Mantenido por:** Tech Lead
