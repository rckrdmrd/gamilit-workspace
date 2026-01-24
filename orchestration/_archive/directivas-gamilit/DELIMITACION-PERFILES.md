# Delimitación de Responsabilidades entre Perfiles

**Fecha:** 2025-11-02
**Versión:** 1.0
**Aplicable a:** Todos los agentes NEXUS-*

---

## 🎯 Objetivo

Definir claramente las responsabilidades de cada perfil para evitar solapamiento y asegurar coordinación efectiva.

---

## 🤖 Perfiles y Responsabilidades

### NEXUS-BACKEND

**Responsable de:**
- ✅ Servicios backend (NestJS/TypeScript)
- ✅ Controllers, Services, DTOs
- ✅ Middleware, Guards, Interceptors
- ✅ Lógica de negocio
- ✅ Tests unitarios e integración backend
- ✅ Validación de tipos contra Database

**NO responsable de:**
- ❌ Diseño de esquemas SQL (es responsabilidad de NEXUS-DATABASE)
- ❌ Componentes frontend (es responsabilidad de NEXUS-FRONTEND)
- ❌ Docker/CI/CD (es responsabilidad de NEXUS-DEVOPS)
- ❌ Validación 3 capas (es responsabilidad de NEXUS-INTEGRATION)

**Coordina con:**
- NEXUS-DATABASE (validar que tipos TypeScript coincidan con SQL)
- NEXUS-FRONTEND (asegurar contratos de API consistentes)
- NEXUS-INTEGRATION (solicitar validación post-implementación)

---

### NEXUS-FRONTEND

**Responsable de:**
- ✅ Componentes React/TypeScript
- ✅ Hooks personalizados
- ✅ State management
- ✅ UI/UX implementation
- ✅ Tests frontend
- ✅ Consumo de APIs backend

**NO responsable de:**
- ❌ Implementación de APIs (es responsabilidad de NEXUS-BACKEND)
- ❌ Esquemas SQL (es responsabilidad de NEXUS-DATABASE)
- ❌ Configuración de deployment (es responsabilidad de NEXUS-DEVOPS)

**Coordina con:**
- NEXUS-BACKEND (validar contratos de API)
- NEXUS-INTEGRATION (validación 3 capas)

---

### NEXUS-DATABASE

**Responsable de:**
- ✅ Diseño de esquemas SQL (PostgreSQL)
- ✅ Migrations versionadas
- ✅ Seeds de datos
- ✅ Row Level Security (RLS)
- ✅ Functions, Triggers, Views
- ✅ Tests de integridad

**NO responsable de:**
- ❌ ORMs o queries desde backend (es responsabilidad de NEXUS-BACKEND)
- ❌ Tipos TypeScript (son responsabilidad de NEXUS-BACKEND, pero deben coincidir con SQL)

**Coordina con:**
- NEXUS-BACKEND (asegurar coherencia SQL ↔ TypeScript)
- NEXUS-INTEGRATION (validar esquemas)

---

### NEXUS-DEVOPS

**Responsable de:**
- ✅ Docker y Docker Compose
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Scripts de deployment
- ✅ Backup y restore automatizado
- ✅ Configuración de entornos

**NO responsable de:**
- ❌ Código de aplicación (es responsabilidad de BACKEND/FRONTEND)
- ❌ Esquemas SQL (es responsabilidad de NEXUS-DATABASE)

**Coordina con:**
- Todos los agentes (configuración de deployment afecta a todos)

---

### NEXUS-INTEGRATION

**Responsable de:**
- ✅ Validación de coherencia 3 capas (Database ↔ Backend ↔ Frontend)
- ✅ Validación contra documentación del proyecto
- ✅ Code review automático
- ✅ Testing E2E
- ✅ Detección de discrepancias
- ✅ Generación de reportes de validación

**NO responsable de:**
- ❌ Implementación de código (es responsabilidad de otros agentes)
- ❌ Corregir código (solo valida y reporta, otros agentes corrigen)

**Coordina con:**
- Todos los agentes (valida el trabajo de todos)

---

## 🔄 Flujo de Coordinación Típico

### Ejemplo: Implementar Feature de Autenticación JWT

#### 1. NEXUS-DATABASE (primero)
- Crea migration para tabla `auth_tokens`
- Define schema SQL con tipos
- Actualiza TRAZA-TAREAS-DATABASE.md

#### 2. NEXUS-BACKEND (segundo)
- Lee schema SQL creado por NEXUS-DATABASE
- Crea DTOs que coincidan con tipos SQL
- Implementa AuthService, AuthController
- Actualiza TRAZA-TAREAS-BACKEND.md
- **Solicita validación** (actualiza PROXIMA-ACCION.md)

#### 3. NEXUS-INTEGRATION (validación intermedia)
- Valida tipos SQL ↔ TypeScript (DTOs)
- Genera reporte de validación
- Si OK → continuar, si NO → NEXUS-BACKEND corrige

#### 4. NEXUS-FRONTEND (tercero)
- Lee contratos de API de NEXUS-BACKEND
- Crea componentes LoginForm, useAuth hook
- Consume API de autenticación
- Actualiza TRAZA-TAREAS-FRONTEND.md
- **Solicita validación**

#### 5. NEXUS-INTEGRATION (validación final)
- Valida coherencia 3 capas completa
- Ejecuta tests E2E
- Valida contra `/docs/01-fase-alcance-inicial/`
- Genera reporte final
- Si OK → feature completa, si NO → agentes correspondientes corrigen

#### 6. NEXUS-DEVOPS (deployment)
- Actualiza configuración de deployment
- Configura variables de entorno para JWT
- Actualiza CI/CD pipeline

---

## ⚠️ Situaciones de Conflicto

### Situación: ¿Quién define los tipos?

**Respuesta:**
- **NEXUS-DATABASE** define tipos SQL (schema)
- **NEXUS-BACKEND** crea DTOs TypeScript que **deben coincidir** con SQL
- **NEXUS-INTEGRATION** valida que coincidan

### Situación: ¿Quién crea las migrations?

**Respuesta:**
- **NEXUS-DATABASE** crea migrations de esquema
- **NEXUS-BACKEND** puede crear migrations de aplicación (ej: Prisma migrations), pero debe coordinar con NEXUS-DATABASE

### Situación: ¿Quién valida los tests?

**Respuesta:**
- Cada agente ejecuta sus propios tests (BACKEND: tests backend, FRONTEND: tests frontend)
- **NEXUS-INTEGRATION** ejecuta tests E2E que validan integración completa

---

## ✅ Checklist de Coordinación

**Antes de implementar feature que afecta múltiples capas:**

- [ ] Identificar qué perfiles están involucrados
- [ ] Definir orden de ejecución (normalmente: Database → Backend → Frontend)
- [ ] Cada agente actualiza su TRAZA-TAREAS al completar
- [ ] Cada agente solicita validación a NEXUS-INTEGRATION
- [ ] NEXUS-INTEGRATION valida y reporta
- [ ] Si hay discrepancias, agentes correspondientes corrigen

---

## 🔗 Relación con Sistema SIMCO (Workspace)

**Esta directiva define RESPONSABILIDADES y coordinación entre perfiles NEXUS.**

Para el proceso de ASIGNACIÓN de perfiles al delegar tareas, consultar:

- **SIMCO-ASIGNACION-PERFILES.md** (`/orchestration/directivas/simco/`)
  - Procedimiento de selección de perfil por palabras clave
  - Mapeo de perfiles disponibles a nivel workspace
  - Template de delegación estándar

**Jerarquía:**
```
NEXUS (este archivo)       →  QUÉ hace cada perfil (responsabilidades)
        ↓
SIMCO-ASIGNACION-PERFILES  →  CÓMO asignar tareas (procedimiento operativo)
```

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-10
**Autor:** Sistema NEXUS
**Ver también:**
- `.claude/agents/INIT-NEXUS-*.md` (perfiles completos)
- DIRECTIVAS-PRINCIPALES.md
- `/orchestration/directivas/simco/SIMCO-ASIGNACION-PERFILES.md`
