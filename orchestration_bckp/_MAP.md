# _MAP: orchestration/

**Última actualización:** 2025-11-07
**Estado:** 🟡 En desarrollo activo
**Versión:** 2.0

---

## 📋 Propósito de esta Carpeta

Esta carpeta contiene el **sistema de orquestación de agentes de IA** para GAMILIT, incluyendo análisis, planes, logs de ejecución, validaciones, respaldos y scripts de automatización.

**Objetivo:** Facilitar el trabajo con agentes de IA (Claude Code y subagentes) para tareas complejas multi-paso, manteniendo trazabilidad completa de todas las operaciones.

**Audiencia:**
- Tech Leads
- Agentes de IA (Claude Code)
- Subagentes especializados
- DevOps Engineers
- QA Engineers

---

## 📁 Estructura de Contenido

### Carpetas Principales

| Carpeta | Propósito | Archivos | Owner | Estado | _MAP.md |
|---------|-----------|----------|-------|--------|---------|
| **01-analisis/** | Análisis de bugs, features, performance, refactoring | 15+ | @tech-lead | 🟢 Activo | ✅ |
| **02-planes/** | Planes de acción y microciclos | 20+ | @tech-lead | 🟢 Activo | ⚪ Pendiente |
| **03-subagentes/** | Definiciones de subagentes especializados | 5+ | @tech-lead | 🟡 En desarrollo | ⚪ Pendiente |
| **04-logs/** | Logs de ejecución por componente | 50+ | @tech-lead | 🟢 Activo | ✅ |
| **05-validaciones/** | Validaciones automáticas de integridad | 15+ | @qa-team | 🟢 Activo | ✅ |
| **06-respaldos/** | Respaldos de archivos críticos | 10+ | @tech-lead | 🟡 Parcial | ⚪ Pendiente |
| **analisis/** | Análisis legacy | 5+ | @tech-lead | ⚪ Legacy | ⚪ Pendiente |
| **analisis-requerimientos-bd/** | Análisis de requerimientos DB | 20+ | @database-team | ✅ Completado | ⚪ Pendiente |
| **code-correccion/** | Correcciones de código por fases | 15+ | @dev-team | ✅ Completado | ⚪ Pendiente |
| **scripts-correccion/** | Scripts de corrección automatizada | 10+ | @dev-team | ✅ Completado | ⚪ Pendiente |
| **inventarios/** | Inventarios de recursos | 8+ | @tech-lead | ✅ Completado | ⚪ Pendiente |
| **scripts/** | Scripts de automatización general | 5+ | @devops-team | 🟡 Parcial | ⚪ Pendiente |
| **validaciones/** | Validaciones legacy | 5+ | @qa-team | ⚪ Legacy | ⚪ Pendiente |

### Archivos en Raíz (58 archivos)

**Categorías de Archivos:**

| Categoría | Cantidad | Ejemplos |
|-----------|----------|----------|
| **Reportes** | 25+ | REPORTE-FINAL-MIGRACION-OBJETOS.md, REPORTE-INTEGRIDAD-COMPLETO.md |
| **Planes** | 8+ | PLAN-CORRECCION-DISCREPANCIAS.md, PLAN-ANALISIS-REQUERIMIENTOS-BD.md |
| **Estados** | 5+ | ESTADO-DATABASE.json, ESTADO-BACKEND.json, ESTADO-FRONTEND.json |
| **Trazas** | 5+ | TRAZA-TAREAS-DATABASE.md, TRAZA-TAREAS-BACKEND.md |
| **Análisis** | 5+ | ANALISIS-PRE-CORRECCIONES-BD-ORIGEN.md, DEPLOYMENT-ANALYSIS-REPORT.md |
| **Configuración** | 3+ | CONFIG-FUENTES-M6-M7.md, REGISTRO-SUBAGENTES.json |
| **Scripts Python** | 2+ | extract-types.py, enhance-inventory.py |
| **Otros** | 5+ | README.md, PROXIMA-ACCION.md, SPRINT-0-STATUS.md |

---

## 🗂️ Detalle por Carpeta Principal

### 01-analisis/ (15+ archivos)

**Descripción:** Análisis categorizado de código y arquitectura

**Subcarpetas:**
```
01-analisis/
├── bugs/           # Análisis de bugs encontrados
├── features/       # Análisis de nuevas features
├── migracion/      # Análisis de migración de repositorios
├── performance/    # Análisis de rendimiento
└── refactoring/    # Análisis de refactorings necesarios
```

**Propósito:**
- Identificar problemas en el código
- Analizar viabilidad de features
- Planificar migraciones
- Detectar cuellos de botella de performance
- Proponer refactorings arquitectónicos

**Estado:** ✅ Sistema funcional y en uso
**_MAP.md:** ✅ Existe

---

### 02-planes/ (20+ archivos)

**Descripción:** Planes de acción, microciclos y roadmaps

**Contenido típico:**
- Planes de microciclos (1-4 horas de trabajo)
- Roadmaps de features
- Estrategias de implementación
- Checklists de validación

**Archivos destacados:**
- PLAN-MICROCICLO-ANALISIS-OBJETOS-FALTANTES.md
- PLAN-CORRECCION-DISCREPANCIAS.md (59 KB)
- PLAN-ANALISIS-REQUERIMIENTOS-BD.md

**Estado:** ✅ En uso activo
**_MAP.md:** ⚪ Pendiente creación

---

### 03-subagentes/ (5+ archivos)

**Descripción:** Definiciones y configuraciones de subagentes especializados

**Tipos de subagentes:**
- SA-DB-XXX: Subagentes de base de datos
- SA-BE-XXX: Subagentes de backend
- SA-FE-XXX: Subagentes de frontend
- SA-VAL-XXX: Subagentes de validación
- SA-DOC-XXX: Subagentes de documentación

**Contenido:**
- Definiciones de roles
- Prompts especializados
- Configuraciones de ejecución
- Registro de subagentes (REGISTRO-SUBAGENTES.json)

**Estado:** 🟡 En desarrollo
**_MAP.md:** ⚪ Pendiente creación

---

### 04-logs/ (50+ archivos)

**Descripción:** Logs de ejecución organizados por componente

**Subcarpetas:**
```
04-logs/
├── backend/        # Logs de agentes trabajando en backend
├── frontend/       # Logs de agentes trabajando en frontend
├── database/       # Logs de agentes trabajando en DB
├── devops/         # Logs de agentes trabajando en DevOps
└── integration/    # Logs de integraciones cross-component
```

**Formato de logs:**
- Timestamp de ejecución
- Agente ejecutor
- Tarea realizada
- Resultados
- Errores encontrados
- Próximos pasos

**Estado:** ✅ Sistema funcional
**_MAP.md:** ✅ Existe en subcarpetas

---

### 05-validaciones/ (15+ archivos)

**Descripción:** Validaciones automáticas de integridad del sistema

**Subcarpetas:**
```
05-validaciones/
├── tipos/          # Validación de tipos TypeScript
├── integracion/    # Validación de integración entre capas
└── documentacion/  # Validación de documentación completa
```

**Tipos de validaciones:**
- Sincronización de tipos Backend ↔ Frontend
- Consistencia de ENUMs
- Integridad de contratos API
- Completitud de documentación
- Cobertura de tests

**Estado:** ✅ Sistema funcional
**_MAP.md:** ✅ Existe en subcarpetas

---

### 06-respaldos/ (10+ archivos)

**Descripción:** Respaldos de archivos críticos antes de modificaciones

**Contenido:**
- Backups pre-refactoring
- Snapshots de configuración
- Versiones anteriores de archivos críticos

**Estado:** 🟡 Uso esporádico
**_MAP.md:** ⚪ Pendiente creación

---

### analisis-requerimientos-bd/ (20+ archivos)

**Descripción:** Análisis completo de requerimientos de base de datos

**Fases:**
```
analisis-requerimientos-bd/
├── fase-1-inventarios/      # Inventario de requerimientos
└── fase-2-consolidacion/    # Consolidación y mapping
```

**Propósito:**
- Inventariar requerimientos funcionales
- Mapear requerimientos → objetos DB
- Detectar discrepancias
- Validar completitud

**Estado:** ✅ Análisis completado
**_MAP.md:** ⚪ Pendiente creación

---

### code-correccion/ (15+ archivos)

**Descripción:** Correcciones de código organizadas por fases

**Fases:**
```
code-correccion/
├── fase-1-p0/    # Correcciones prioritarias (P0)
└── fase-2-p1/    # Correcciones de alta prioridad (P1)
```

**Tipos de correcciones:**
- Bugs P0 (críticos)
- Inconsistencias de tipos
- Problemas de RLS
- Discrepancias 3-capas (Frontend-Backend-Database)

**Estado:** ✅ Correcciones aplicadas
**_MAP.md:** ⚪ Pendiente creación

---

### scripts-correccion/ (10+ archivos)

**Descripción:** Scripts automatizados para aplicar correcciones

**Fases:**
```
scripts-correccion/
├── fase-1-p0/    # Scripts P0
└── fase-2-p1/    # Scripts P1
```

**Tipos de scripts:**
- SQL updates masivos
- Bash scripts de corrección
- TypeScript migration scripts
- Python parsing scripts

**Estado:** ✅ Scripts ejecutados
**_MAP.md:** ⚪ Pendiente creación

---

### Scripts Python (2 archivos)

**extract-types.py**
- Extrae tipos TypeScript de código
- Genera inventarios de tipos
- Detecta inconsistencias

**enhance-inventory.py**
- Enriquece inventarios con metadata
- Genera reportes mejorados

---

## 📊 Métricas Globales

### Tamaño y Composición

| Métrica | Valor |
|---------|-------|
| **Total archivos** | ~200+ |
| **Total reportes** | ~25 |
| **Total planes** | ~10 |
| **Total logs** | ~50+ |
| **Total validaciones** | ~15 |
| **Tamaño total** | ~2.5 MB (markdown/json) |

### Reportes Principales (Top 10)

| Reporte | Tamaño | Propósito |
|---------|--------|-----------|
| REPORTE-FINAL-MIGRACION-OBJETOS.md | 43 KB | Migración objetos DB |
| REPORTE-DISCREPANCIAS-3-CAPAS.md | 37 KB | Discrepancias Frontend-Backend-DB |
| PLAN-CORRECCION-DISCREPANCIAS.md | 59 KB | Plan de corrección completo |
| REPORTE-INTEGRIDAD-COMPLETO.md | 25 KB | Integridad del sistema |
| REPORTE-SA-DB-031.md | 17 KB | Reporte subagente DB |
| DEPLOYMENT-ANALYSIS-REPORT.md | 20 KB | Análisis de deployment |
| FRONTEND_PROGRESS_PAGES_REPORT.md | 28 KB | Progreso frontend |
| TRAZA-TAREAS-DATABASE.md | 25 KB | Traza completa DB |
| REPORTE-FINAL-VALIDACION-3-CAPAS.md | 16 KB | Validación final |
| REPORTE-ALINEACION-REQUERIMIENTOS.md | 19 KB | Alineación requerimientos |

---

## 🔗 Interdependencias

### Esta Carpeta Consume De:

- **apps/** - Análisis de código fuente
- **docs/** - Requerimientos y especificaciones
- **database/** - DDL y estructura DB

### Esta Carpeta Alimenta A:

- **artifacts/reports/** - Reportes finales
- **docs/** - Actualización de documentación
- **apps/** - Correcciones aplicadas
- **Tech Leads** - Decisiones informadas

### Flujo de Trabajo Típico:

```
1. ANÁLISIS (01-analisis/)
   ↓
2. PLAN (02-planes/)
   ↓
3. EJECUCIÓN (subagentes + logs en 04-logs/)
   ↓
4. VALIDACIÓN (05-validaciones/)
   ↓
5. REPORTE (archivos raíz + artifacts/)
   ↓
6. RESPALDO (06-respaldos/)
```

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- Ninguno

### P1 (Alto)

- **P1-001:** Falta _MAP.md en 10 subcarpetas
  - Impacto: Navegación para agentes incompleta
  - Esfuerzo: 3-4 horas

- **P1-002:** Archivos raíz desorganizados (58 archivos)
  - Dificulta navegación
  - Recomendación: Mover a subcarpetas temáticas

### P2 (Medio)

- **P2-001:** Carpetas legacy sin limpiar
  - analisis/, validaciones/ contienen archivos antiguos
  - Recomendación: Archivar o eliminar

- **P2-002:** Scripts Python sin documentación
  - extract-types.py, enhance-inventory.py sin README
  - Dificulta reutilización

---

## 📐 Estándares Aplicables

### Nomenclatura de Archivos

✅ **Aplicado:**
- `UPPER-CASE-KEBAB.md` (reportes y planes)
- `ESTADO-*.json` (archivos de estado)
- `TRAZA-*.md` (trazas de ejecución)
- `kebab-case.py` (scripts Python)

### Organización de Reportes

**Template recomendado:**
```markdown
# REPORTE-[TIPO]-[TEMA]

**Fecha:** YYYY-MM-DD
**Agente:** [Nombre del agente]
**Componente:** [backend/frontend/database/etc]

## Objetivo
[Qué se analiza/corrige/valida]

## Metodología
[Cómo se realizó]

## Resultados
[Findings principales]

## Recomendaciones
[Próximos pasos]

## Anexos
[Detalles técnicos]
```

---

## 🔍 Validación (Go/No-Go)

### Criterios de Aceptación

- [x] Sistema de análisis funcional
- [x] Logs organizados por componente
- [x] Validaciones automatizadas
- [x] Trazabilidad completa
- [x] _MAP.md creado (este archivo) ✅
- [ ] _MAP.md en 10 subcarpetas (0/10)
- [ ] Archivos raíz organizados en subcarpetas
- [ ] Scripts documentados

**Decisión:** 🟢 **GO** - Sistema funcional pero mejorable

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Análisis: @tech-lead
- Logs: @dev-team
- Validaciones: @qa-team
- Scripts: @devops-team

**Reporte de issues:**
- GitHub Issues: [GAMILIT Orchestration]
- Slack: #gamilit-agents

---

## 🎯 Próximos Pasos

### Fase 1 - Urgente (Esta Semana)

1. ✅ _MAP.md creado (este archivo)
2. ⬜ Organizar 58 archivos raíz en subcarpetas
3. ⬜ Crear _MAP.md en 10 subcarpetas
4. ⬜ Documentar scripts Python

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

5. ⬜ Limpiar carpetas legacy
6. ⬜ Estandarizar formato de reportes
7. ⬜ Automatizar generación de reportes
8. ⬜ Dashboard de métricas de agentes

### Fase 3 - Media Prioridad (Próximo Mes)

9. ⬜ Sistema de búsqueda de reportes
10. ⬜ Integración con CI/CD
11. ⬜ Métricas de productividad de agentes
12. ⬜ Playbooks automatizados

---

## 🚀 Uso del Sistema de Orquestación

### Para Tech Leads

```bash
# 1. Crear análisis de nuevo feature
mkdir orchestration/01-analisis/features/nueva-feature
# Documentar análisis en README.md

# 2. Crear plan
cat orchestration/02-planes/PLAN-NUEVA-FEATURE.md

# 3. Ejecutar con subagente
# Los logs se guardan automáticamente en 04-logs/

# 4. Validar resultados
cat orchestration/05-validaciones/nueva-feature-validation.md

# 5. Generar reporte
cat orchestration/REPORTE-NUEVA-FEATURE.md
```

### Para Agentes de IA

```bash
# Leer contexto previo
find orchestration/ -name "*keyword*" -type f

# Revisar logs recientes
ls -lt orchestration/04-logs/*/

# Consultar validaciones
cat orchestration/05-validaciones/tipos/REPORTE-*.md

# Guardar nuevo log
echo "..." > orchestration/04-logs/[componente]/YYYY-MM-DD-accion.md
```

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras organizar archivos raíz
**Versión:** 1.0.0
