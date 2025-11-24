# ORCHESTRATION - Sistema de Gestión de Agentes

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-23

---

## 📋 DESCRIPCIÓN

Este directorio contiene toda la infraestructura para la gestión de agentes de desarrollo (Claude Code), incluyendo prompts, directivas, trazabilidad, inventarios y reportes.

**Basado en:** Sistema de Orquestación de GAMILIT (mejorado y adaptado)

---

## 📁 ESTRUCTURA

```
orchestration/
├── README.md                          # Este archivo
│
├── prompts/                           # Prompts para agentes
│   ├── PROMPT-DATABASE-AGENT.md       # Database-Agent
│   ├── PROMPT-BACKEND-AGENT.md        # Backend-Agent
│   ├── PROMPT-FRONTEND-AGENT.md       # Frontend-Agent
│   ├── PROMPT-REQUIREMENTS-ANALYST.md # Requirements-Analyst
│   ├── PROMPT-BUG-FIXER.md            # Bug-Fixer
│   ├── PROMPT-CODE-REVIEWER.md        # Code-Reviewer
│   ├── PROMPT-FEATURE-DEVELOPER.md    # Feature-Developer
│   ├── PROMPT-POLICY-AUDITOR.md       # Policy-Auditor
│   ├── PROMPT-ARCHITECTURE-ANALYST.md # Architecture-Analyst
│   ├── PROMPT-WORKSPACE-MANAGER.md    # Workspace-Manager
│   └── PROMPT-SUBAGENTES.md           # Subagentes delegados
│
├── directivas/                        # Políticas obligatorias
│   ├── DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
│   ├── DIRECTIVA-ANTI-DUPLICACION.md
│   ├── DIRECTIVA-TESTING.md
│   └── POLITICAS-USO-AGENTES.md       # ⭐ Guía principal
│
├── trazas/                            # Trazabilidad de tareas
│   ├── TRAZA-REQUERIMIENTOS.md        # Requerimientos del plan
│   ├── TRAZA-CORRECCIONES.md          # Correcciones aplicadas
│   ├── TRAZA-FEATURES.md              # Features nuevos
│   ├── TRAZA-VALIDACIONES.md          # Validaciones/auditorías
│   ├── TRAZA-BUGS.md                  # Bugs reportados/resueltos
│   ├── TRAZA-TAREAS-DATABASE.md       # Historial Database
│   ├── TRAZA-TAREAS-BACKEND.md        # Historial Backend
│   ├── TRAZA-TAREAS-FRONTEND.md       # Historial Frontend
│   ├── TRAZA-ANALISIS-ARQUITECTURA.md # Análisis arquitectónicos y referencias
│   └── TRAZA-WORKSPACE-MANAGEMENT.md  # Gestión del workspace
│
├── inventarios/                       # Inventarios de objetos
│   ├── MASTER_INVENTORY.yml           # Inventario maestro con relaciones
│   ├── DATABASE_INVENTORY.yml         # Objetos de base de datos
│   ├── BACKEND_INVENTORY.yml          # Módulos/entities/services
│   ├── FRONTEND_INVENTORY.yml         # Páginas/componentes/stores
│   ├── DEPENDENCY_GRAPH.yml           # Grafo de dependencias
│   └── TEST_COVERAGE.yml              # Cobertura de tests
│
├── estados/                           # Estados actuales
│   ├── ESTADO-DATABASE.json           # Estado DB
│   ├── ESTADO-BACKEND.json            # Estado Backend
│   ├── ESTADO-FRONTEND.json           # Estado Frontend
│   └── ESTADO-GENERAL.json            # Estado general del proyecto
│
├── reportes/                          # Reportes automáticos
│   ├── DASHBOARD_ESTADO.yml           # Dashboard de estado
│   ├── REPORTE-CALIDAD-{FECHA}.md     # Reportes de calidad
│   ├── REPORTE-SEMANAL-{FECHA}.md     # Resúmenes semanales
│   └── METRICAS-DESARROLLO.yml        # Métricas de desarrollo
│
├── agentes/                           # Trabajo de agentes
│   ├── database/                      # Database-Agent
│   │   └── {TAREA-ID}/
│   │       ├── 01-ANALISIS.md
│   │       ├── 02-PLAN.md
│   │       ├── 03-EJECUCION.md
│   │       ├── 04-VALIDACION.md
│   │       └── 05-DOCUMENTACION.md
│   ├── backend/                       # Backend-Agent
│   ├── frontend/                      # Frontend-Agent
│   ├── requirements-analyst/          # Requirements-Analyst
│   ├── code-reviewer/                 # Code-Reviewer
│   ├── bug-fixer/                     # Bug-Fixer
│   ├── feature-developer/             # Feature-Developer
│   ├── policy-auditor/                # Policy-Auditor
│   ├── architecture-analyst/          # Architecture-Analyst
│   └── workspace-manager/             # Workspace-Manager
│
└── templates/                         # Templates de documentación
    ├── TEMPLATE-ANALISIS.md
    ├── TEMPLATE-PLAN.md
    ├── TEMPLATE-VALIDACION.md
    └── TEMPLATE-REPORTE-CALIDAD.md
```

---

## 🚀 INICIO RÁPIDO

### Para Usuarios (Desarrolladores Humanos)

#### 1. Lanzar Agente para Nueva Tarea

```bash
# 1. Identificar tipo de tarea
# - ¿Es un requerimiento del plan? → Requirements-Analyst
# - ¿Es desarrollo completo? → Feature-Developer
# - ¿Es solo DB/Backend/Frontend? → Agente específico
# - ¿Es corrección de bug? → Bug-Fixer
# - ¿Es revisión de código? → Code-Reviewer

# 2. Consultar política de uso
cat orchestration/directivas/POLITICAS-USO-AGENTES.md

# 3. Preparar contexto (si es necesario)
# - Requerimientos claros
# - Archivos de referencia
# - Restricciones/consideraciones

# 4. Lanzar agente (mediante Claude Code)
# "Por favor, usa el {agente} para {tarea}"
```

#### 2. Monitorear Progreso

```bash
# Ver estado general
cat orchestration/estados/ESTADO-GENERAL.json | jq '.resumen'

# Ver tareas recientes de un agente
cat orchestration/trazas/TRAZA-TAREAS-{GRUPO}.md | tail -50

# Ver dashboard de estado
cat orchestration/reportes/DASHBOARD_ESTADO.yml
```

#### 3. Revisar Resultados

```bash
# Ver documentación de tarea específica
ls orchestration/agentes/{agente}/{TAREA-ID}/

# Ver inventarios actualizados
cat orchestration/inventarios/MASTER_INVENTORY.yml

# Ver reporte de calidad
cat orchestration/reportes/REPORTE-CALIDAD-{FECHA}.md
```

---

### Para Agentes (Claude Code)

#### Antes de Iniciar Tarea

```bash
# 1. Leer directivas obligatorias
cat orchestration/directivas/POLITICAS-USO-AGENTES.md
cat orchestration/directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md

# 2. Leer prompt correspondiente
cat orchestration/prompts/PROMPT-{TU-TIPO}.md

# 3. Consultar inventarios (anti-duplicación)
cat orchestration/inventarios/{TIPO}_INVENTORY.yml

# 4. Ver trazas recientes (contexto)
cat orchestration/trazas/TRAZA-TAREAS-{GRUPO}.md | tail -100
```

#### Durante Ejecución

```bash
# Crear carpeta de trabajo
mkdir -p orchestration/agentes/{grupo}/{TAREA-ID}

# Generar documentación por fases
# - 01-ANALISIS.md
# - 02-PLAN.md
# - 03-EJECUCION.md
# - 04-VALIDACION.md
# - 05-DOCUMENTACION.md

# Actualizar inventarios en tiempo real
vim orchestration/inventarios/{TIPO}_INVENTORY.yml
```

#### Después de Completar

```bash
# Actualizar traza
vim orchestration/trazas/TRAZA-{TIPO}.md

# Actualizar estado
vim orchestration/estados/ESTADO-{COMPONENTE}.json

# Generar reporte (si es tarea grande)
vim orchestration/reportes/REPORTE-{TEMA}-{FECHA}.md
```

---

## 📚 DOCUMENTOS CLAVE

### ⭐ Lectura Obligatoria

1. **[POLITICAS-USO-AGENTES.md](directivas/POLITICAS-USO-AGENTES.md)**
   - Cuándo usar agentes vs subagentes
   - Límites de concurrencia
   - Gestión de errores
   - Mejores prácticas

2. **[DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md](directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md)**
   - Qué documentar
   - Cuándo documentar
   - Formatos obligatorios

### Por Tipo de Agente

**Agentes Principales (Database, Backend, Frontend):**
- [PROMPT-DATABASE-AGENT.md](prompts/PROMPT-DATABASE-AGENT.md) - PostgreSQL, DDL, seeds, carga limpia
- [PROMPT-BACKEND-AGENT.md](prompts/PROMPT-BACKEND-AGENT.md) - NestJS, TypeORM, API REST
- [PROMPT-FRONTEND-AGENT.md](prompts/PROMPT-FRONTEND-AGENT.md) - React, Zustand, interfaces

**Agentes Especializados:**
- [PROMPT-REQUIREMENTS-ANALYST.md](prompts/PROMPT-REQUIREMENTS-ANALYST.md) - Análisis de requerimientos
- [PROMPT-BUG-FIXER.md](prompts/PROMPT-BUG-FIXER.md) - Diagnóstico y corrección de bugs
- [PROMPT-CODE-REVIEWER.md](prompts/PROMPT-CODE-REVIEWER.md) - Revisión de código y calidad
- [PROMPT-FEATURE-DEVELOPER.md](prompts/PROMPT-FEATURE-DEVELOPER.md) - Features end-to-end (DB+BE+FE)
- [PROMPT-POLICY-AUDITOR.md](prompts/PROMPT-POLICY-AUDITOR.md) - Auditoría de cumplimiento
- [PROMPT-ARCHITECTURE-ANALYST.md](prompts/PROMPT-ARCHITECTURE-ANALYST.md) - Análisis arquitectónico y referencias
- [PROMPT-WORKSPACE-MANAGER.md](prompts/PROMPT-WORKSPACE-MANAGER.md) - Gobernanza y limpieza del workspace

**Subagentes:**
- [PROMPT-SUBAGENTES.md](prompts/PROMPT-SUBAGENTES.md) - Tareas delegadas por agentes principales

---

## 🎯 FLUJOS DE TRABAJO COMUNES

### Flujo 1: Implementar Requerimiento del Plan

```
1. Requirements-Analyst analiza requerimiento
   └─> Genera: plan detallado, dependency graph, estimaciones

2. Feature-Developer implementa (coordina Database, Backend, Frontend)
   └─> Genera: código, documentación, tests

3. Code-Reviewer valida implementación
   └─> Genera: reporte de calidad, lista de issues

4. Policy-Auditor verifica cumplimiento
   └─> Genera: reporte de auditoría

5. Actualización de trazas e inventarios
```

### Flujo 2: Corregir Bug

```
1. Bug-Fixer diagnostica problema
   └─> Genera: análisis de root cause

2. Bug-Fixer implementa corrección
   └─> Genera: fix, tests de regresión

3. Bug-Fixer valida fix
   └─> Genera: reporte de validación

4. Actualización de TRAZA-BUGS.md y TRAZA-CORRECCIONES.md
```

### Flujo 3: Auditoría Semanal

```
1. Policy-Auditor ejecuta auditoría
   └─> Valida: inventarios, documentación, estándares

2. Code-Reviewer genera reporte de calidad
   └─> Métricas: cobertura tests, deuda técnica, vulnerabilidades

3. Generación de reportes semanales
   └─> Dashboard de estado, métricas de desarrollo
```

---

## 📊 MÉTRICAS Y REPORTES

### Métricas Clave

```yaml
desarrollo:
  velocity: 8.5 tareas/día
  completitud_mvp: 35%
  bloqueadores_activos: 2

calidad:
  cobertura_tests: 75%
  documentacion: 90%
  deuda_tecnica: Baja
  vulnerabilidades: 0

agentes:
  tareas_completadas: 150
  tasa_exito: 95%
  errores_autocorregidos: 8
  rollbacks: 1
```

### Reportes Automáticos

**Diarios:**
- Tareas completadas
- Agentes activos
- Bloqueadores

**Semanales:**
- Velocity
- Calidad de código
- Cumplimiento de políticas

**Por Sprint:**
- Completitud de requerimientos
- Deuda técnica
- Cobertura de tests

---

## 🔍 BÚSQUEDA Y NAVEGACIÓN

### Buscar Información

```bash
# Buscar tarea específica
grep -rn "DB-042" orchestration/trazas/

# Buscar objeto en inventarios
grep -rn "projects" orchestration/inventarios/

# Buscar en documentación de agentes
find orchestration/agentes -name "*.md" | xargs grep "{término}"

# Ver últimos cambios
ls -lt orchestration/agentes/**/*.md | head -20
```

### Consultas Comunes

```bash
# ¿Qué tareas están bloqueadas?
grep "Estado: ❌ Bloqueado" orchestration/trazas/*.md

# ¿Cuál es la completitud actual?
cat orchestration/estados/ESTADO-GENERAL.json | jq '.resumen.completitud_general'

# ¿Qué features faltan?
grep "Estado: ⏳ Pendiente" orchestration/trazas/TRAZA-REQUERIMIENTOS.md
```

---

## 🛠️ MANTENIMIENTO

### Actualización de Inventarios

**Frecuencia:** Después de cada tarea

```bash
# Validar inventario vs realidad
# (script a crear)
./scripts/validate-inventory.sh
```

### Limpieza de Archivos Antiguos

**Frecuencia:** Mensual

```bash
# Archivar reportes antiguos (>3 meses)
mkdir -p orchestration/reportes/archive/
mv orchestration/reportes/REPORTE-*-2024-*.md orchestration/reportes/archive/
```

### Auditoría de Calidad

**Frecuencia:** Semanal

```bash
# Ejecutar Policy-Auditor
# "Por favor, ejecuta una auditoría de cumplimiento de políticas"
```

---

## 🆘 TROUBLESHOOTING

### Problema: Agente crea objetos duplicados

**Solución:**
1. Verificar que agente consultó inventarios
2. Actualizar DIRECTIVA-ANTI-DUPLICACION.md
3. Ejecutar validación de inventario

### Problema: Documentación desactualizada

**Solución:**
1. Identificar gaps con Policy-Auditor
2. Actualizar documentación faltante
3. Marcar tarea original como incompleta hasta documentar

### Problema: Bloqueador en tarea

**Solución:**
1. Documentar bloqueador en TRAZA correspondiente
2. Notificar a stakeholders
3. Buscar alternativas o dividir tarea

---

## 📖 REFERENCIAS

### Documentación del Proyecto
- MVP Plan: `docs/README.md`
- Épicas Fase 1: `docs/01-fase-alcance-inicial/` (EAI-001 a EAI-006)
- Épicas Fase 3: `docs/03-fase-extensiones/` (EXT-001 a EXT-010)
- ADRs: `docs/97-adr/`
- Análisis de reorganización: `ANALISIS-REORGANIZACION-ORCHESTRATION.md`

---

## ✅ CHECKLIST DE INICIO

Para nuevos usuarios del sistema:

- [ ] Leer POLITICAS-USO-AGENTES.md
- [ ] Leer DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- [ ] Revisar estructura de carpetas
- [ ] Entender flujos de trabajo comunes
- [ ] Familiarizarse con formatos de trazas
- [ ] Consultar prompts de agentes disponibles

---

**Versión:** 1.1.0
**Última actualización:** 2025-11-23
**Mantenido por:** Tech Lead / AI Agents
**Revisión:** Mensual
**Última mejora:** 2025-11-23 (alineación completa con GAMILIT, corrección de referencias)
