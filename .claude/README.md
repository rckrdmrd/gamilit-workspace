# Sistema de Agentes NEXUS para Desarrollo

**Versión:** 1.0
**Fecha:** 2025-11-02
**Estado:** ✅ Operativo

## 🎯 Visión General

El Sistema de Agentes NEXUS es una arquitectura de orquestación para desarrollo de software que gestiona 5 perfiles especializados compartiendo un pool común de 15 subagentes. Cada agente actúa como **orquestador** (no ejecutor), delegando tareas complejas a subagentes especializados.

### Características Principales

- ✅ **5 Perfiles Especializados**: Backend, Frontend, Database, DevOps, Integration
- ✅ **15 Subagentes Compartidos**: Pool común con tracking en tiempo real
- ✅ **3 Fases de Desarrollo**: Análisis → Planificación → Ejecución
- ✅ **Hasta 5 Niveles de Ciclos**: Microcycles para tareas complejas
- ✅ **Validación Integrada**: Contra documentación en `/docs/`
- ✅ **Principios SOLID/DRY**: Aplicados a documentación y código

---

## 🚨 DIRECTIVA CRÍTICA: Validación Obligatoria contra Documentación

**⚠️ LEER PRIMERO ANTES DE CUALQUIER TAREA**

### Regla de Oro

> **"Nada se implementa sin estar documentado. Nada se documenta sin estar actualizado."**

### Por Qué Es Crítica

Esta directiva es la **defensa principal contra alucinaciones** y garantiza que:
- ❌ NO se implementa funcionalidad no definida
- ❌ NO se asume comportamiento sin validar
- ❌ NO se deja documentación desactualizada
- ✅ TODO está respaldado por documentación oficial
- ✅ TODO cambio se refleja en documentación

### Path de Documentación

```bash
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/
```

### 4 Carpetas Principales (Ver Documento Completo)

| Carpeta | Cuándo Consultar | Cuándo Actualizar |
|---------|------------------|-------------------|
| **01-requerimientos/** | **ANTES** de análisis y planificación | Nunca (solo Product Owner) |
| **02-especificaciones-tecnicas/** | **DURANTE** análisis y planificación | Nunca (solo Tech Lead) |
| **03-desarrollo/** | **DESPUÉS** de implementación | **SIEMPRE** después de implementar |
| **04-planificacion/** | **ANTES** de planificar, **DURANTE** ejecución | **SIEMPRE** al actualizar progreso |

### Navegación Modularizada: Usar `_MAP.md`

**⚠️ NO leer todos los archivos.** La documentación está modularizada con archivos `_MAP.md`:

```bash
# Paso 1: Leer el mapa raíz
cat docs/_MAP.md

# Paso 2: Identificar subcarpeta relevante
cat docs/01-requerimientos/_MAP.md

# Paso 3: Leer SOLO el archivo específico que necesitas
cat docs/01-requerimientos/{archivo-especifico}.md
```

### Validación en 3 Momentos

1. **ANTES (Análisis)**: ¿Está definido en `01-requerimientos/` y `02-especificaciones-tecnicas/`?
2. **DURANTE (Ejecución)**: ¿Estoy siguiendo las especificaciones técnicas?
3. **DESPUÉS (Completitud)**: ¿Cumplí el requerimiento? ¿Actualicé `03-desarrollo/` y `04-planificacion/`?

### Actualización Total

**Si algo cambia → Actualizar TODO lo que lo referencie:**
- ✅ Código implementado
- ✅ Documentación en `03-desarrollo/`
- ✅ Progreso en `04-planificacion/`
- ✅ Todos los archivos que referencien lo modificado
- ✅ `_MAP.md` si se agregaron/removieron archivos
- ✅ Changelog en `artifacts/changelogs/`
- ✅ Traza en `orchestration/TRAZA-TAREAS-{PERFIL}.md`

### Documento Completo

**📖 Ver detalles completos en:** [directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md](./directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md)

Este documento incluye:
- Protocolo detallado de validación
- Casos de bloqueo y qué hacer
- Checklist de validación por fase
- Herramientas para validación
- Métricas de validación

---

## 🏗️ Estructura del Sistema

```
.claude/
├── agents/           # 5 perfiles de agentes NEXUS
├── directivas/       # Políticas y reglas de operación
├── templates/        # Plantillas para subagentes
├── referencias/      # Contextos y paths del proyecto
└── constants/        # Constantes arquitectónicas

orchestration/
├── REGISTRO-SUBAGENTES.json    # ⭐ Single Source of Truth
├── PROXIMA-ACCION.md           # Próxima acción prioritaria
├── TRAZA-TAREAS-{PERFIL}.md    # Tracking por agente (×5)
├── ESTADO-{PERFIL}.json        # Estado estructurado (×5)
├── 01-analisis/                # Análisis previos
├── 02-planes/                  # Planes de implementación
├── 03-subagentes/              # Reportes de subagentes
├── 04-logs/                    # Logs por perfil
├── 05-validaciones/            # Validaciones realizadas
└── 06-respaldos/               # Respaldos de estados

artifacts/
├── reports/          # Reportes de coverage, performance, validación
├── changelogs/       # Registros de cambios
└── diagrams/         # Diagramas generados
```

## 👥 Los 5 Perfiles NEXUS

### 1. NEXUS-BACKEND
**Archivo**: `agents/INIT-NEXUS-BACKEND.md`

**Responsabilidades**:
- Desarrollo de servicios backend (NestJS/TypeScript)
- Integración con base de datos
- Implementación de lógica de negocio
- Testing backend (coverage ≥60%)

**Paths de Trabajo**:
- `apps/backend/src/`
- `apps/backend/test/`

### 2. NEXUS-FRONTEND
**Archivo**: `agents/INIT-NEXUS-FRONTEND.md`

**Responsabilidades**:
- Desarrollo UI/UX (React/TypeScript)
- Componentes reutilizables
- Integración con APIs backend
- Testing frontend (coverage ≥60%)

**Paths de Trabajo**:
- `apps/frontend/src/`
- `apps/frontend/test/`

### 3. NEXUS-DATABASE
**Archivo**: `agents/INIT-NEXUS-DATABASE.md`

**Responsabilidades**:
- Schemas y migraciones PostgreSQL
- Políticas RLS (Row Level Security)
- Índices y optimización de queries
- Testing SQL (coverage ≥40%)

**Paths de Trabajo**:
- `apps/database/ddl/`
- `apps/database/migrations/`

### 4. NEXUS-DEVOPS
**Archivo**: `agents/INIT-NEXUS-DEVOPS.md`

**Responsabilidades**:
- Configuración Docker/Docker Compose
- CI/CD pipelines
- Scripts de deployment
- Monitoreo y logging

**Paths de Trabajo**:
- `apps/*/Dockerfile`
- `.github/workflows/`
- `docker-compose*.yml`

### 5. NEXUS-INTEGRATION
**Archivo**: `agents/INIT-NEXUS-INTEGRATION.md`

**Responsabilidades**:
- Validación de tipos entre 3 capas (DB → Backend → Frontend)
- Testing de integración
- Validación contra documentación
- Coordinación entre perfiles

**Paths de Validación**:
- `docs/01-requerimientos/`
- `docs/02-especificaciones-tecnicas/`

## 🔄 Workflow: 3 Fases de Desarrollo

### Fase 1: Análisis (10-30%)
**Objetivo**: Comprender el problema y el contexto

**Acciones**:
1. Leer documentación relevante en `/docs/`
2. Analizar código existente
3. Identificar dependencias
4. Documentar en `orchestration/01-analisis/`

**Criterio de Salida**: Análisis completo documentado

### Fase 2: Planificación (20-30%)
**Objetivo**: Diseñar la solución

**Acciones**:
1. Crear plan detallado de implementación
2. Identificar subtareas y dependencias
3. Estimar esfuerzo y riesgo
4. Documentar en `orchestration/02-planes/`

**Criterio de Salida**: Plan aprobado y listo para ejecución

### Fase 3: Ejecución (50-70%)
**Objetivo**: Implementar la solución

**Acciones**:
1. Lanzar subagentes según plan
2. Monitorear progreso en REGISTRO-SUBAGENTES.json
3. Validar resultados
4. Actualizar documentación

**Criterio de Salida**: Implementación completa con tests pasando

## 🤖 Sistema de Subagentes

### Límite Compartido: 15 Subagentes

**⚠️ IMPORTANTE**: Los 15 subagentes son compartidos entre TODOS los agentes NEXUS.

### Protocolo de Reserva

```
1. Leer REGISTRO-SUBAGENTES.json
2. Verificar slots_disponibles
3. Si slots_disponibles >= subagentes_requeridos:
   a. Actualizar registro (añadir a 'activos')
   b. Lanzar subagentes
4. Si NO:
   a. Esperar a que se liberen slots
   b. O reducir número de subagentes
```

### Tipos de Subagentes

Ver templates completos en: `templates/TEMPLATES-SUBAGENTES.md`

- **T-ANALISIS-{PERFIL}**: Análisis de código/documentación
- **T-PLANIFICACION-{PERFIL}**: Diseño de soluciones
- **T-EJECUCION-{PERFIL}**: Implementación de código
- **T-VALIDACION-TIPOS**: Validación de consistencia entre capas
- **T-TESTING-{PERFIL}**: Creación y ejecución de tests
- **T-REFACTOR-{PERFIL}**: Refactorización de código

## 📋 Directivas Principales

### DE-001: Responsabilidad Única por Agente
Cada agente tiene responsabilidades claramente delimitadas. Ver `directivas/DELIMITACION-PERFILES.md`.

### DE-002: Orquestación de Subagentes
- **Max subagentes totales**: 15
- **Protocolo obligatorio**: Consultar REGISTRO antes de lanzar
- **Actualización**: Inmediata al iniciar/completar

### DE-003: Ciclos de Desarrollo
- **3 Fases obligatorias**: Análisis → Planificación → Ejecución
- **Hasta 5 niveles de microcycles**: Ciclo-1-2-3-4-5

### DE-004: Validación Continua (🚨 CRÍTICA)
**Ver directiva completa:** [directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md](./directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md)

- **ANTES**: Validar contra `/docs/01-requerimientos/` y `/docs/02-especificaciones-tecnicas/`
- **DURANTE**: Validar implementación contra specs técnicas
- **DESPUÉS**: Actualizar `/docs/03-desarrollo/` y `/docs/04-planificacion/`
- **Usar `_MAP.md`**: Para navegación modularizada, NO leer todos los archivos
- **Actualizar TODO**: Lo que referencie algo que cambió

### DE-005: Principios SOLID para Documentación
- **Single Responsibility**: Un archivo = un propósito
- **Open/Closed**: Archivos abiertos para modificación Y extensión
- **No Duplicación (DRY)**: Usar referencias en lugar de duplicar

Ver todas las directivas en: `directivas/DIRECTIVAS-PRINCIPALES.md`

## 🚀 Quick Start

### Para Iniciar un Agente

1. **🚨 Leer directiva de validación (CRÍTICO)**:
   ```
   Ver: .claude/directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md
   ```

2. **Leer el perfil del agente**:
   ```
   Ver: .claude/agents/INIT-NEXUS-{PERFIL}.md
   ```

3. **Consultar directivas aplicables**:
   ```
   Ver: .claude/directivas/DIRECTIVAS-PRINCIPALES.md
   ```

4. **Verificar slots disponibles**:
   ```
   Ver: orchestration/REGISTRO-SUBAGENTES.json
   ```

5. **Seguir workflow de 3 fases (con validación en cada fase)**:
   ```
   Análisis (validar contra docs) → Planificación (validar contra specs) → Ejecución (actualizar docs)
   ```

### Ejemplo: Implementar Nueva Feature Backend

```markdown
# Paso 1: NEXUS-BACKEND inicia Análisis
- Lee: docs/01-requerimientos/casos-uso/...
- Analiza: apps/backend/src/...
- Documenta: orchestration/01-analisis/features/ANALISIS-{fecha}-{feature}.md

# Paso 2: NEXUS-BACKEND crea Plan
- Diseña: Arquitectura de la solución
- Identifica: Subtareas y dependencias
- Documenta: orchestration/02-planes/PLAN-{fecha}-{feature}.md

# Paso 3: NEXUS-BACKEND ejecuta
- Reserva: 3 slots en REGISTRO-SUBAGENTES.json
- Lanza: T-EJECUCION-BACKEND (x2), T-TESTING-BACKEND (x1)
- Monitorea: Progreso en REGISTRO
- Valida: Con NEXUS-INTEGRATION

# Paso 4: Validación cruzada
- NEXUS-INTEGRATION valida tipos DB→Backend
- NEXUS-INTEGRATION valida contra docs/
- Si OK → Completar
- Si NO → Iteración o rollback
```

## 📊 Archivos Clave

### Single Source of Truth
**orchestration/REGISTRO-SUBAGENTES.json**
- Estado actual de todos los subagentes
- Slots disponibles en tiempo real
- Historial de completados/fallidos

### Tracking por Agente
**orchestration/TRAZA-TAREAS-{PERFIL}.md**
- Formato markdown legible
- Historial cronológico de tareas
- Referencias cruzadas a análisis/planes

### Estado Estructurado
**orchestration/ESTADO-{PERFIL}.json**
- Estado actual del agente
- Ciclo en ejecución
- Métricas (coverage, etc.)

### Próxima Acción
**orchestration/PROXIMA-ACCION.md**
- Siguiente tarea prioritaria
- Agente responsable
- Contexto necesario

## 🔗 Referencias Importantes

### Contexto del Proyecto
`referencias/CONTEXTO-PROYECTO.md`
- Propósito de GAMILIT
- Arquitectura general
- Stack tecnológico

### Paths de Documentación
`referencias/PATHS-DOCUMENTACION.md`
- Requerimientos funcionales
- Especificaciones técnicas
- Casos de uso

### Paths de Trabajo
`referencias/PATHS-TRABAJO.md`
- Código fuente por perfil
- Tests por perfil
- Configuración

### Constantes Arquitectónicas
`constants/CONSTANTS-ARCHITECTURE.md`
- Límites y umbrales
- Estándares de calidad
- Convenciones de naming

## ⚙️ Política SSOT (Single Source of Truth)

Ver: `constants/POLITICA-SSOT.md`

**Principio**: Cada tipo de información tiene UN SOLO archivo autoritativo.

**Aplicación**:
- REGISTRO-SUBAGENTES.json es SSOT para estado de subagentes
- ESTADO-{PERFIL}.json es SSOT para estado de cada agente
- CONSTANTS-ARCHITECTURE.md es SSOT para constantes
- Todos los demás archivos REFERENCIAN, no duplican

## 📚 Documentación Adicional

- **🚨 Validación contra Documentación (CRÍTICA)**: `directivas/DIRECTIVA-VALIDACION-DOCUMENTACION.md`
- **Guía de Orquestación**: `directivas/GUIA-ORQUESTACION.md`
- **Flujos de Trabajo**: `directivas/DIRECTIVAS-FLUJOS.md`
- **Delimitación de Perfiles**: `directivas/DELIMITACION-PERFILES.md`
- **Principios SOLID para Docs**: `directivas/PRINCIPIOS-SOLID-DOCS.md`
- **Política de Testing**: `directivas/POLITICA-TESTING.md`
- **Git Hooks**: `directivas/GIT-HOOKS.md`
- **Prioridades de Subagentes**: `directivas/PRIORIDADES-SUBAGENTES.md`

## 🛠️ Mantenimiento

### Actualizar Documentación
Todos los archivos pueden ser **modificados Y extendidos** siguiendo principios SOLID/DRY.

### Git Hooks (Manuales)
Ver ejemplos en: `directivas/GIT-HOOKS.md`
Los hooks son **manuales**, no automáticos. Copiar de `.example` si es necesario.

### Normalización de Documentación
Aplicar 1FN, 2FN, 3FN, BCNF para evitar duplicación. Ver: `directivas/PRINCIPIOS-SOLID-DOCS.md`

## 📈 Métricas de Éxito

- **Backend**: Coverage ≥60%, ESLint sin errores
- **Frontend**: Coverage ≥60%, ESLint sin errores, accesibilidad WCAG 2.1 AA
- **Database**: Coverage ≥40%, políticas RLS completas
- **DevOps**: Builds exitosos, deployments automatizados
- **Integration**: 100% validación de tipos entre capas

## 🤝 Contribución

Para agregar nuevos agentes o modificar existentes:

1. Seguir estructura de `agents/INIT-NEXUS-*.md`
2. Actualizar `agents/_MAP.md`
3. Crear TRAZA y ESTADO correspondientes
4. Documentar en este README

## 📞 Soporte

- **Documentación del Proyecto**: `/docs/`
- **Issues**: Registrar en sistema de tracking del proyecto
- **Arquitectura**: Ver propuesta completa en raíz del proyecto

---

**Sistema NEXUS** - Arquitectura de Agentes para Desarrollo
Implementado: 2025-11-02
Versión: 1.0
