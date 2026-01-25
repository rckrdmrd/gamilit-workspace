# Sistema de Orquestacion de Agentes - GAMILIT

**Version:** 4.3.0
**Sistema:** SIMCO + CAPVED + NEXUS v4.0
**Proyecto:** GAMILIT (Plataforma EdTech - Gamificacion Educativa)
**Tipo:** STANDALONE (Workspace independiente)
**Actualizado:** 2026-01-25

---

## Vision General

Este directorio contiene el **sistema de orquestacion completo** para el proyecto GAMILIT. Como proyecto STANDALONE, tiene todas las definiciones replicadas localmente para autonomia total.

### Arquitectura de Herencia

```
workspace-v2/orchestration/        <- FUENTE DE SINCRONIZACION
         |
         v (replica completa 2026-01-25)
projects/gamilit/orchestration/    <- ESTE DIRECTORIO (autonomo)
```

**Politica:** REPLICA_COMPLETA - Gamilit opera de forma independiente con todas las directivas, perfiles y definiciones sincronizadas desde workspace-v2.

---

## Sistema SIMCO

### Que es SIMCO

**Single Instruction Matrix by Context and Operation** organiza las directivas por **tipo de operacion** en lugar de por perfil de agente. Esto permite que cualquier agente siga las directivas correctas independientemente de su especializacion.

### Acceso Rapido

```
directivas/simco/              # DIRECTIVAS POR OPERACION
|-- _INDEX.md                  # Indice del sistema
|-- SIMCO-TAREA.md             # CICLO CAPVED - Punto de entrada
|-- SIMCO-CREAR.md             # Crear cualquier archivo
|-- SIMCO-MODIFICAR.md         # Modificar archivos existentes
|-- SIMCO-VALIDAR.md           # Validar codigo (build, lint)
|-- SIMCO-DOCUMENTAR.md        # Documentar trabajo realizado
|-- SIMCO-BUSCAR.md            # Buscar archivos e informacion
|-- SIMCO-DELEGACION.md        # Delegar a subagentes
|-- SIMCO-DDL.md               # Operaciones PostgreSQL
|-- SIMCO-BACKEND.md           # Operaciones NestJS
|-- SIMCO-FRONTEND.md          # Operaciones React
|-- SIMCO-GIT.md               # Operaciones Git
+-- SIMCO-EDICION-SEGURA.md    # OBLIGATORIO - Edicion sin placeholders

directivas/principios/         # PRINCIPIOS FUNDAMENTALES (6)
|-- PRINCIPIO-CAPVED.md        # Ciclo de vida de tareas
|-- PRINCIPIO-DOC-PRIMERO.md   # Documentacion antes de implementacion
|-- PRINCIPIO-ANTI-DUPLICACION.md  # Verificar inventario antes de crear
|-- PRINCIPIO-VALIDACION-OBLIGATORIA.md  # Build/lint obligatorios
|-- PRINCIPIO-ECONOMIA-TOKENS.md   # Limites de contexto
+-- PRINCIPIO-NO-ASUMIR.md     # Preguntar si falta informacion

agents/perfiles/               # PERFILES DE AGENTES (45+)
|-- PERFIL-DATABASE.md         # Database-Agent
|-- PERFIL-BACKEND.md          # Backend-Agent
|-- PERFIL-FRONTEND.md         # Frontend-Agent
|-- PERFIL-ORQUESTADOR.md      # Tech-Leader
|-- PERFIL-DEVOPS.md           # DevOps-Agent
+-- compact/                   # Versiones compactas
```

---

## Como Usar SIMCO + CAPVED

### Para TODA Tarea que modifica codigo

1. **Leer SIMCO-TAREA.md** (ciclo CAPVED completo)
2. **Seguir las 6 fases CAPVED**:
   - **C** - Contexto: Vincular tarea a modulo/epic
   - **A** - Analisis: Mapear impacto, dependencias, riesgos
   - **P** - Planeacion: Desglosar en subtareas
   - **V** - Validacion: Gate antes de ejecutar
   - **E** - Ejecucion: Implementar usando SIMCO especificos
   - **D** - Documentacion: Gate de cierre (OBLIGATORIO)

### Para operaciones especificas

1. **Identificar operacion** -> Leer SIMCO correspondiente
2. **Si aplica dominio** -> Leer SIMCO de dominio (DDL/BACKEND/FRONTEND)
3. **Seguir checklist** del SIMCO
4. **Al completar** -> SIMCO-VALIDAR.md + SIMCO-DOCUMENTAR.md

---

## Estructura de Directorios

```
orchestration/
|-- README.md                   # Este archivo
|-- _INDEX.yml                  # Indice estructural maestro
|-- _MAP.md                     # Mapa visual de navegacion
|-- _inheritance.yml            # Declaracion de herencia
|
|-- CONTEXT-MAP.yml             # Variables resueltas NEXUS
|-- PROJECT-PROFILE.yml         # Perfil del proyecto
|-- PROJECT-STATUS.md           # Estado actual
|-- PROXIMA-ACCION.md           # Checkpoint de sesion
|-- BOOTLOADER.md               # Carga inicial
|-- QUICK-REFERENCE.md          # Referencia rapida
|-- TRACEABILITY.yml            # Trazabilidad maestra
|-- DEPENDENCY-GRAPH.yml        # Grafo de dependencias
|-- MAPA-DOCUMENTACION.yml      # Mapa de docs/
|
|-- _definitions/               # Checklists, Protocolos, Schemas (29 archivos)
|-- _quick/                     # Quick references
|-- _archive/                   # Contenido archivado
|
|-- 00-guidelines/              # Directrices del proyecto
|   |-- CONTEXTO-PROYECTO.md    # Variables y configuracion
|   |-- HERENCIA-DIRECTIVAS.md
|   |-- HERENCIA-SIMCO.md
|   +-- PATHS-*.md              # Rutas de trabajo
|
|-- agents/                     # Perfiles y configuracion de agentes
|   |-- AGENT-ROLES.md          # Definicion de roles
|   |-- AGENT-EXECUTION-STANDARDS.md
|   |-- configs/                # Configuraciones compartidas
|   |-- perfiles/               # 45+ perfiles de agentes
|   |-- prompts/                # Prompts de arranque
|   +-- trazas/                 # Trazas de actividad
|
|-- directivas/                 # Sistema SIMCO completo
|   |-- principios/             # 6 principios fundamentales
|   |-- simco/                  # 30+ directivas SIMCO
|   |-- modos/                  # 4 modos de ejecucion
|   |-- triggers/               # Triggers automaticos
|   |-- politicas/              # Politicas de excepcion
|   +-- procedimientos/         # Procedimientos
|
|-- inventarios/                # Inventarios por capa
|   |-- MASTER_INVENTORY.yml
|   |-- DATABASE_INVENTORY.yml
|   |-- BACKEND_INVENTORY.yml
|   +-- FRONTEND_INVENTORY.yml
|
|-- referencias/                # Referencias y prompts
|   |-- ALIASES.yml
|   |-- PROMPTS-ACTIVOS.yml
|   |-- prompts/                # Prompts por agente
|   +-- templates/              # Templates de prompts
|
|-- tareas/                     # Tareas documentadas
|   |-- _INDEX.yml
|   |-- _templates/             # Templates de tareas
|   +-- TASK-*/                 # Tareas individuales
|
|-- templates/                  # Templates globales
|   |-- 01-por-contexto/
|   |-- 02-por-ciclo/
|   |-- 03-por-proceso/
|   +-- 04-globales/
|
+-- trazas/                     # Trazas de trabajo
    |-- TRAZA-TAREAS-DATABASE.md
    |-- TRAZA-TAREAS-BACKEND.md
    +-- TRAZA-TAREAS-FRONTEND.md
```

---

## Principios Fundamentales (6)

### 1. CAPVED
```
TODA tarea que modifica codigo o documentacion DEBE pasar por:
  C - Contexto:     Vincular tarea a modulo/epic
  A - Analisis:     Mapear impacto, dependencias, riesgos
  P - Planeacion:   Desglosar en subtareas por dominio
  V - Validacion:   Gate antes de ejecutar
  E - Ejecucion:    Implementar usando SIMCO especificos
  D - Documentacion: Gate de cierre (tarea no completada sin esto)
```

### 2. Doc Primero
```
ANTES de implementar cualquier cosa:
1. Consultar docs/ del proyecto
2. Verificar especificaciones existentes
3. NO asumir - verificar
```

### 3. Anti-Duplicacion
```
ANTES de crear cualquier archivo:
1. Verificar inventario correspondiente (@INV_DB, @INV_BE, @INV_FE)
2. Buscar patrones similares existentes
3. Si existe, REUTILIZAR o EXTENDER
```

### 4. Validacion Obligatoria
```
ANTES de marcar tarea como completada:
1. npm run build DEBE pasar
2. npm run lint DEBE pasar
3. Recrear BD si cambios DDL
```

### 5. Economia de Tokens
```
ANTES de ejecutar tareas complejas:
1. Verificar limites de tokens (~200K input, ~8K output)
2. Desglosar tareas grandes en subtareas manejables
3. Usar QUICK-REFERENCE.md para consultas rapidas
```

### 6. No Asumir
```
SI falta informacion o hay ambiguedad:
1. Buscar exhaustivamente en docs (10-15 min)
2. Si no se encuentra -> DETENER
3. Documentar la pregunta claramente
4. Escalar al Product Owner
5. Esperar respuesta antes de implementar
```

---

## Uso Rapido

### Al iniciar una sesion de trabajo

1. Leer `BOOTLOADER.md`
2. Leer `PROXIMA-ACCION.md` (estado anterior)
3. Leer tu perfil en `agents/perfiles/PERFIL-{TU-TIPO}.md`
4. Leer `00-guidelines/CONTEXTO-PROYECTO.md` (variables resueltas)

### Para realizar una tarea

1. Leer `directivas/simco/SIMCO-TAREA.md` (ciclo CAPVED)
2. Seguir las 6 fases
3. Actualizar `PROXIMA-ACCION.md` al finalizar

### Para delegar a subagente

1. Leer `directivas/simco/SIMCO-DELEGACION.md`
2. Usar template de delegacion
3. Incluir: principios, SIMCO relevantes, variables resueltas, criterios de aceptacion

---

## Informacion del Proyecto GAMILIT

### Descripcion
Plataforma EdTech con gamificacion educativa. Sistema academico que integra mecanicas de juego para mejorar el engagement estudiantil.

### Stack Tecnologico
- **Backend:** NestJS 11.x + TypeORM 0.3.x
- **Frontend:** React 19.x + Zustand 5.x + Tailwind CSS 4.x
- **Database:** PostgreSQL 15

### Metricas
| Metrica | Valor |
|---------|-------|
| Schemas | 16 |
| Tablas | 137 |
| Entities | 108 |
| Endpoints | 612 |
| Componentes | 327 |
| RLS Policies | 32 |
| Estado MVP | 75% |

### Schemas Principales
- `auth_management` - Autenticacion y roles
- `gamification_system` - Motor de gamificacion
- `educational_content` - Contenido educativo
- `progress_tracking` - Tracking de progreso
- `admin_dashboard` - Administracion

### Base de Datos
- **Nombre:** gamilit_platform
- **Usuario:** gamilit_user
- **Password:** gamilit_dev_2026
- **Puerto:** 5432

---

## Aliases del Proyecto

### Paths
| Alias | Ruta |
|-------|------|
| `@GAMILIT` | projects/gamilit/ |
| `@GAMILIT_BACKEND` | apps/backend/src |
| `@GAMILIT_FRONTEND` | apps/frontend/src |
| `@GAMILIT_DDL` | apps/database/ddl |
| `@GAMILIT_SEEDS` | apps/database/seeds |
| `@GAMILIT_DOCS` | docs/ |

### Inventarios
| Alias | Ruta |
|-------|------|
| `@INV_DB` | orchestration/inventarios/DATABASE_INVENTORY.yml |
| `@INV_BE` | orchestration/inventarios/BACKEND_INVENTORY.yml |
| `@INV_FE` | orchestration/inventarios/FRONTEND_INVENTORY.yml |
| `@MASTER_INV` | orchestration/inventarios/MASTER_INVENTORY.yml |

### Trazas
| Alias | Ruta |
|-------|------|
| `@TRAZA_DB` | orchestration/trazas/TRAZA-TAREAS-DATABASE.md |
| `@TRAZA_BE` | orchestration/trazas/TRAZA-TAREAS-BACKEND.md |
| `@TRAZA_FE` | orchestration/trazas/TRAZA-TAREAS-FRONTEND.md |

---

## Sincronizacion con Workspace Padre

### Fecha de Sincronizacion
- **Ultima:** 2026-01-25
- **Fuente:** workspace-v2/orchestration/

### Contenido Sincronizado
| Carpeta | Archivos |
|---------|----------|
| agents/ | 66 |
| directivas/ | 124 |
| _definitions/ | 29 |
| referencias/ | 29 |
| templates/ | 60 |
| _quick/ | 4 |

### Politica de Actualizacion
Gamilit opera de forma **autonoma**. Las actualizaciones desde workspace-v2 se realizan manualmente cuando hay cambios significativos en el sistema SIMCO.

---

*Sistema SIMCO v4.3.0 - GAMILIT Standalone*
*Sincronizado desde workspace-v2*
