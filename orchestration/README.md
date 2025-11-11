# Orchestration - Sistema de Gestión de Agentes GAMILIT

**Propósito:** Documentación de ejecución, planes, trazas e inventarios de los agentes de desarrollo

**Versión:** 2.1.0
**Última actualización:** 2025-11-11 (Seeds Production-Ready v2.3.2)

---

## 🎯 OBJETIVO PRINCIPAL

Esta carpeta contiene **TODO el trabajo** realizado por agentes y subagentes en el proyecto GAMILIT. Su objetivo es:

1. ✅ Lograr que Database, Backend y Frontend funcionen correctamente
2. ✅ Mantener alineación 100% entre todos los proyectos
3. ✅ Evitar duplicaciones de código y objetos
4. ✅ Documentar cada tarea ejecutada con trazabilidad completa
5. ✅ Permitir reiniciar conversaciones con contexto completo

**🚨 REGLA CRÍTICA:** Todo trabajo de agentes DEBE ir en `orchestration/`. NO crear carpetas `orchestration/` en `apps/`, `docs/` u otras ubicaciones.

---

## 📋 PROMPTS DE AGENTES (NUEVO ⭐)

### Para Agentes Principales

📄 **[PROMPT-AGENTES.md](./PROMPT-AGENTES.md)** - Prompt maestro para agentes principales

**Aplicable a:**
- 🗄️ **Agente Database** - DDL, seeds, migrations, validaciones DB
- ⚙️ **Agente Backend** - NestJS, entities, services, controllers, DTOs
- 🎨 **Agente Frontend** - React, componentes, páginas, stores, servicios

**Contenido clave:**
- Directivas obligatorias (análisis, validación, documentación)
- Flujo de trabajo (Análisis → Plan → Ejecución → Validación → Documentación)
- Política anti-duplicación
- Referencias de contexto importantes
- Política de ciclos desglosados
- Uso de subagentes

### Para Subagentes

📄 **[PROMPT-SUBAGENTES.md](./PROMPT-SUBAGENTES.md)** - Prompt para subagentes especializados

**Contenido clave:**
- Errores comunes de subagentes y cómo evitarlos
- Estructura de tareas delegadas
- Flujo de validación obligatorio
- Template de reportes
- Mejores prácticas y anti-patrones

**🔑 IMPORTANTE:** Los subagentes cometen errores por falta de contexto. Este prompt mitiga esos problemas.

---

## 📂 Estructura de Carpetas

```
orchestration/
├── README.md                           # Este archivo (índice principal)
├── PROMPT-AGENTES.md                   # ⭐ Prompt para agentes principales
├── PROMPT-SUBAGENTES.md                # ⭐ Prompt para subagentes
├── PROXIMA-ACCION.md                   # Próxima tarea prioritaria
│
├── TRAZA-TAREAS-DATABASE.md            # Historial Agente Database
├── TRAZA-TAREAS-BACKEND.md             # Historial Agente Backend
├── TRAZA-TAREAS-FRONTEND.md            # Historial Agente Frontend
├── TRAZA-TAREAS-DEVOPS.md              # Historial DevOps
├── TRAZA-TAREAS-INTEGRATION.md         # Historial Integración
├── TRAZA-CORRECCIONES.md               # ⭐ Log de correcciones aplicadas (CORR-001+)
│
├── ESTADO-DATABASE.json                # Estado actual Database
├── ESTADO-BACKEND.json                 # Estado actual Backend
├── ESTADO-FRONTEND.json                # Estado actual Frontend
├── ESTADO-DEVOPS.json                  # Estado actual DevOps
├── ESTADO-INTEGRATION.json             # Estado actual Integración
│
├── 01-analisis/                        # Análisis realizados por agentes
│   ├── database/
│   ├── backend/
│   └── frontend/
│
├── 02-planes/                          # Planes de implementación
│   ├── database/
│   ├── backend/
│   └── frontend/
│
├── 03-reportes/                        # Reportes generados
│   └── sesiones/
│
├── 04-inventarios/                     # ⭐ Inventarios consolidados
│   ├── database/
│   │   ├── DATABASE_INVENTORY_2025-11-11.yml  # Inventario completo DB (688 objetos)
│   │   └── SEEDS_INVENTORY.yml                # ⭐ Inventario seeds (67 archivos)
│   ├── BACKEND_INVENTORY.yml           # Inventario completo Backend
│   ├── FRONTEND_INVENTORY.yml          # Inventario completo Frontend
│   └── TYPES_INVENTORY.yml             # Inventario de tipos
│
├── 05-sprints/                         # Seguimiento de sprints
│   ├── SPRINT-1/
│   └── SPRINT-2/
│
├── 06-indices/                         # Índices de documentación
│
├── 07-quick-wins/                      # Quick wins ejecutados
│
├── 08-resumen-sesiones/                # Resúmenes por sesión
│   └── SESION-{FECHA}.md
│
├── 09-guias/                           # Guías de trabajo
│
├── 10-matrices/                        # Matrices de trazabilidad
│
├── 11-deployment/                      # Documentación de despliegue
│
├── 12-usuarios/                        # Documentación de usuarios
│
├── database/                           # ⭐ Trabajo Agente Database
│   └── {TAREA-ID}/
│       ├── 01-ANALISIS.md
│       ├── 02-PLAN.md
│       ├── 03-EJECUCION.md
│       ├── 04-VALIDACION.md
│       └── 05-DOCUMENTACION.md
│
├── backend/                            # ⭐ Trabajo Agente Backend
│   └── {TAREA-ID}/
│
├── frontend/                           # ⭐ Trabajo Agente Frontend
│   └── {TAREA-ID}/
│
└── integracion/                        # ⭐ Trabajo multi-agente
    └── {TAREA-ID}/
```

---

## 🔄 Flujo de Trabajo Recomendado

### Para Agentes Principales

1. **Leer prompt:** [PROMPT-AGENTES.md](./PROMPT-AGENTES.md)
2. **Consultar trazas:** `TRAZA-TAREAS-{TU_GRUPO}.md`
3. **Consultar inventarios:** `04-inventarios/{TU_GRUPO}_INVENTORY.yml`
4. **Consultar estado:** `ESTADO-{TU_GRUPO}.json`
5. **Ejecutar tarea siguiendo:** Análisis → Plan → Ejecución → Validación → Documentación
6. **Actualizar inventarios y trazas**
7. **Generar reporte de sesión**

### Para Subagentes (Lanzados por Agentes Principales)

1. **Recibir contexto del Agente Principal**
2. **Leer prompt:** [PROMPT-SUBAGENTES.md](./PROMPT-SUBAGENTES.md)
3. **Consultar inventarios (anti-duplicación)**
4. **Leer archivos de referencia**
5. **Ejecutar tarea**
6. **Validar localmente**
7. **Actualizar inventarios y trazas**
8. **Reportar al Agente Principal**

---

## 📚 Archivos Críticos de Contexto

### Inventarios (Anti-Duplicación)

Consultar **SIEMPRE** antes de crear objetos:

- `04-inventarios/database/DATABASE_INVENTORY_2025-11-11.yml` - 688 objetos DB catalogados
- `04-inventarios/database/SEEDS_INVENTORY.yml` - 67 seeds (DEV + PROD) documentados ⭐
- `04-inventarios/BACKEND_INVENTORY.yml` - 20 módulos, 80+ entities
- `04-inventarios/FRONTEND_INVENTORY.yml` - 15 features, 180+ componentes
- `04-inventarios/TYPES_INVENTORY.yml` - Tipos TypeScript compartidos

### Trazas (Historial de Tareas)

Ver qué se ha hecho:

- `TRAZA-TAREAS-DATABASE.md` - Todas las tareas DB ejecutadas (DB-001 → DB-096)
- `TRAZA-CORRECCIONES.md` - Log de correcciones aplicadas (CORR-001+) ⭐ NUEVO
- `TRAZA-TAREAS-BACKEND.md` - Todas las tareas Backend ejecutadas
- `TRAZA-TAREAS-FRONTEND.md` - Todas las tareas Frontend ejecutadas

### Estados (Situación Actual)

Estados en formato JSON estructurado:

- `ESTADO-DATABASE.json` - Estado actual DB (schemas, tablas, versión)
- `ESTADO-BACKEND.json` - Estado actual Backend (módulos, entities, coverage)
- `ESTADO-FRONTEND.json` - Estado actual Frontend (componentes, páginas, coverage)

### Documentación del Proyecto

Rutas importantes en el proyecto:

- `../docs/00-vision-general/VISION.md` - Visión del producto
- `../docs/97-adr/` - Architecture Decision Records
- `../apps/database/README.md` - Guía DDL
- `../apps/backend/README.md` - Guía Backend
- `../apps/frontend/README.md` - Guía Frontend

---

## ⚠️ POLÍTICAS CRÍTICAS

### 1. Anti-Duplicación

**ANTES de crear cualquier objeto:**
```bash
# Buscar en inventarios
grep -r "{nombre_objeto}" orchestration/04-inventarios/

# Buscar en código
find ../apps/ -name "*{nombre_objeto}*"
```

**Si existe:** ❌ NO crear duplicado

### 2. Documentación Obligatoria

**DESPUÉS de cada tarea:**
- ✅ Actualizar inventario correspondiente
- ✅ Actualizar traza del grupo
- ✅ Actualizar estado del componente
- ✅ Generar documentación de la tarea

### 3. Ubicación de Archivos

**TODO trabajo de agentes va en `orchestration/`:**
- ✅ `orchestration/database/TAREA-001/`
- ✅ `orchestration/backend/TAREA-001/`
- ✅ `orchestration/frontend/TAREA-001/`

**PROHIBIDO crear orchestration/ en:**
- ❌ `apps/database/orchestration/`
- ❌ `apps/backend/orchestration/`
- ❌ `docs/orchestration/`

### 4. Validación de Subagentes

**Los subagentes cometen errores.** Agentes principales DEBEN:
- ✅ Validar trabajo de subagentes
- ✅ Verificar que no haya duplicaciones
- ✅ Verificar que sigan convenciones
- ✅ Verificar que código compile
- ✅ Corregir errores encontrados

---

## 🎯 Estado del Proyecto

### Objetivo Principal

**Conseguir que todo funcione:**
- 🔄 Database operativa y sin errores
- 🔄 Backend funcional con entities alineadas
- 🔄 Frontend operativo con páginas completas
- 🔄 DB ↔ Backend ↔ Frontend 100% alineados

### Grupos de Trabajo

| Grupo | Agente Responsable | Última Actualización | Estado |
|-------|-------------------|---------------------|---------|
| **Database** | Agente Database | Ver TRAZA-TAREAS-DATABASE.md | 🟢 Activo |
| **Backend** | Agente Backend | Ver TRAZA-TAREAS-BACKEND.md | 🟢 Activo |
| **Frontend** | Agente Frontend | Ver TRAZA-TAREAS-FRONTEND.md | 🟢 Activo |
| **DevOps** | Agente DevOps | Ver TRAZA-TAREAS-DEVOPS.md | 🟡 Parcial |
| **Integración** | Multi-agente | Ver TRAZA-TAREAS-INTEGRATION.md | 🔄 Continuo |

---

## 📖 Documentación Adicional

- **Prompts:** [PROMPT-AGENTES.md](./PROMPT-AGENTES.md) | [PROMPT-SUBAGENTES.md](./PROMPT-SUBAGENTES.md)
- **Próxima tarea:** [PROXIMA-ACCION.md](./PROXIMA-ACCION.md)
- **Inventarios:** [04-inventarios/](./04-inventarios/)
- **Sprints:** [05-sprints/](./05-sprints/)
- **Resúmenes:** [08-resumen-sesiones/](./08-resumen-sesiones/)

---

## 🚀 Quick Start

### Para un nuevo Agente Principal

```bash
# 1. Leer prompt
cat orchestration/PROMPT-AGENTES.md

# 2. Ver próxima tarea
cat orchestration/PROXIMA-ACCION.md

# 3. Consultar tu traza
cat orchestration/TRAZA-TAREAS-{TU_GRUPO}.md | tail -50

# 4. Consultar inventario
cat orchestration/04-inventarios/{TU_GRUPO}_INVENTORY.yml

# 5. Crear carpeta de tarea
mkdir -p orchestration/{tu_grupo}/TAREA-{ID}

# 6. Ejecutar siguiendo flujo de 5 fases
```

### Para un nuevo Subagente

```bash
# 1. Leer prompt
cat orchestration/PROMPT-SUBAGENTES.md

# 2. Recibir contexto del Agente Principal
# (Agente Principal debe proveer archivo de contexto)

# 3. Consultar inventario (anti-duplicación)
grep -r "{objeto}" orchestration/04-inventarios/

# 4. Ejecutar y validar

# 5. Reportar al Agente Principal
```

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-11 (v2.1.0 - Seeds Production-Ready)
**Mantenido por:** Tech Lead
**Revisión requerida:** Cada sprint

---

## 📋 Cambios Recientes (v2.1.0 - 2025-11-11)

### Nuevos Archivos ⭐
- `TRAZA-CORRECCIONES.md` - Log estructurado de correcciones (CORR-001 a CORR-005)
- `04-inventarios/database/SEEDS_INVENTORY.yml` - Inventario completo de seeds (67 archivos)

### Actualizaciones
- `TRAZA-TAREAS-DATABASE.md` - Agregadas tareas DB-095 y DB-096
- `04-inventarios/database/DATABASE_INVENTORY_2025-11-11.yml` - Actualizado con seeds PROD
- Seeds PROD: 10 ejercicios → 27 ejercicios (+170%)
- Modelo datos: Dual model → JSONB puro

### Documentación
- Ver `apps/database/README.md` v2.3.2 para detalles de seeds
- Ver `TRAZA-CORRECCIONES.md` para correcciones detalladas (Fases 1-2)
