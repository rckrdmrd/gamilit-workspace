# PLANTILLA: TAREA DE ANÁLISIS INTEGRAL DE PORTAL
# Basada en TASK-2026-01-20-ANALISIS-PORTALES-INTEGRAL

**Versión:** 1.0.0
**Creada:** 2026-01-20
**Sistema:** SIMCO v4.0.0 + CAPVED

---

## INSTRUCCIONES DE USO

Esta plantilla sirve como base para tareas de análisis integral de portales (Student, Teacher, Admin, o cualquier otro). Copiar la estructura y adaptar según el portal específico.

---

## 1. METADATA.yml (Template)

```yaml
# METADATA.yml - [NOMBRE DEL PORTAL] Analysis
# Sistema: SIMCO v4.0.0 + CAPVED

task:
  id: TASK-YYYY-MM-DD-[PORTAL]-ANALYSIS
  titulo: "Análisis Integral del [Portal Name]"
  descripcion: >
    Análisis detallado de documentación y definiciones de todas las páginas
    del portal [nombre], incluyendo funcionalidades, APIs, coherencia
    backend-frontend, y plan de subtareas con metodología CAPVED.

  tipo: analysis
  prioridad: P0
  dominio: Frontend + Backend + Documentation

  fechas:
    inicio: YYYY-MM-DD
    fin_estimada: YYYY-MM-DD
    ultima_actualizacion: YYYY-MM-DD

  estado: EN_PROGRESO
  fase_actual: CONTEXTO

  metricas:
    paginas_analizadas: 0
    componentes_identificados: 0
    hooks_identificados: 0
    apis_consumidas: 0
    endpoints_backend: 0
    gaps_identificados: 0
    subtareas_planificadas: 0

contexto:
  proyecto: gamilit
  modulo: [portal-name]
  portales_afectados:
    - [portal]

  tecnologias:
    frontend:
      - React
      - TypeScript
      - React Query
      - Zustand
    backend:
      - NestJS
      - TypeORM
      - PostgreSQL

agentes:
  orquestador: "@PERFIL_ORQUESTADOR"
  subagentes_requeridos:
    - "@PERFIL_BACKEND"
    - "@PERFIL_FRONTEND"
    - "@PERFIL_DOCUMENTATION"
    - "@PERFIL_TESTING"
    - "@PERFIL_ARCHITECT"

referencias:
  inventario_frontend: "orchestration/inventarios/FRONTEND_INVENTORY.yml"
  inventario_backend: "orchestration/inventarios/BACKEND_INVENTORY.yml"
  guia_portal: "docs/95-guias-desarrollo/[portal]/"
```

---

## 2. SUBTASKS.yml (Template)

```yaml
# SUBTASKS.yml - Plan de Subtareas con Metodología CAPVED

plan:
  total_fases: 4
  total_subtareas: 0
  horas_estimadas: 0

fases:
  - id: FASE-1
    nombre: "Corrección de Gaps Críticos"
    prioridad: P0
    dependencias: []
    subtareas:
      - id: SUBTASK-1.1
        titulo: "[Descripción del GAP Crítico 1]"
        gap_relacionado: GAP-XX-001
        capved:
          contexto:
            - "[Descripción del problema]"
          analisis:
            componentes_afectados:
              - "[archivo1.ts]"
              - "[archivo2.ts]"
            impacto: ALTO
          planeacion:
            opcion_a:
              descripcion: "[Opción 1]"
              pros: []
              contras: []
            opcion_b:
              descripcion: "[Opción 2]"
              pros: []
              contras: []
          validacion:
            - "npm run build"
            - "npm run lint"
          ejecucion:
            archivos_modificar:
              - "[archivo.ts]"
          documentacion:
            - "[doc a actualizar]"
        perfil_requerido: "@PERFIL_BACKEND + @PERFIL_FRONTEND"
        horas_estimadas: 2
        dependencias: []
        estado: PENDIENTE

  - id: FASE-2
    nombre: "Resolución de Gaps Altos"
    prioridad: P1
    dependencias: ["FASE-1"]
    subtareas: []

  - id: FASE-3
    nombre: "Optimizaciones"
    prioridad: P2
    dependencias: ["FASE-1", "FASE-2"]
    subtareas: []

  - id: FASE-4
    nombre: "Documentación y Limpieza"
    prioridad: P3
    dependencias: ["FASE-3"]
    subtareas: []

orden_ejecucion:
  paralelo_fase_1:
    - SUBTASK-1.1
    - SUBTASK-1.2
  secuencial_fase_2:
    - SUBTASK-2.1

criterios_aceptacion_globales:
  - "Build exitoso (backend + frontend)"
  - "Lint sin errores"
  - "Tests relevantes pasando"
  - "Documentación actualizada"
  - "Inventarios sincronizados"
  - "_INDEX.yml de tareas actualizado"
```

---

## 3. CHECKLIST DE EJECUCIÓN

### FASE C - Contexto

```markdown
- [ ] Cargar FRONTEND_INVENTORY.yml del proyecto
- [ ] Cargar BACKEND_INVENTORY.yml del proyecto
- [ ] Identificar carpeta del portal en frontend: `apps/frontend/src/apps/[portal]/`
- [ ] Listar todas las páginas del portal
- [ ] Crear carpeta de tarea: `orchestration/tareas/TASK-YYYY-MM-DD-[PORTAL]-ANALYSIS/`
- [ ] Crear METADATA.yml inicial
```

### FASE A - Análisis

```markdown
- [ ] Para cada página:
  - [ ] Identificar componentes utilizados
  - [ ] Identificar hooks utilizados
  - [ ] Identificar APIs consumidas
  - [ ] Mapear endpoints backend correspondientes
- [ ] Verificar coherencia Frontend ↔ Backend
- [ ] Identificar GAPs:
  - [ ] Rutas inconsistentes
  - [ ] Estructuras de respuesta incorrectas
  - [ ] Documentación faltante
  - [ ] Tests faltantes
- [ ] Clasificar GAPs por severidad (CRÍTICO, ALTO, MEDIO, BAJO)
- [ ] Crear archivo de hallazgos: `01-HALLAZGOS-CONSOLIDADOS.md`
```

### FASE P - Planeación

```markdown
- [ ] Crear SUBTASKS.yml con todas las subtareas
- [ ] Definir dependencias entre subtareas
- [ ] Asignar perfiles a cada subtarea
- [ ] Estimar horas por subtarea
- [ ] Identificar subtareas paralelizables
- [ ] Crear plan maestro: `00-PLAN-MAESTRO.md`
```

### FASE V - Validación (Pre-Ejecución)

```markdown
- [ ] Verificar que todas las referencias a archivos existen
- [ ] Verificar que los perfiles asignados son correctos
- [ ] Verificar que las dependencias son lógicas
- [ ] Validar que el plan está alineado con objetivos
```

### FASE E - Ejecución

```markdown
**Para GAPs de Código:**
- [ ] Lanzar subagente con prompt estructurado
- [ ] Incluir PERFIL + CONTEXTO + REFERENCIAS + INSTRUCCIONES
- [ ] Ejecutar build después de cada fix
- [ ] Ejecutar lint después de cada fix
- [ ] Commit con mensaje semántico

**Para Documentación:**
- [ ] Verificar si documento ya existe antes de crear
- [ ] Usar templates existentes cuando sea posible
- [ ] Actualizar _MAP.md correspondientes
- [ ] Actualizar README si aplica

**Paralelización:**
- [ ] Identificar subtareas sin dependencias
- [ ] Lanzar múltiples subagentes en paralelo
- [ ] Esperar resultados y consolidar
```

### FASE D - Documentación

```markdown
- [ ] Actualizar METADATA.yml con métricas finales
- [ ] Crear resumen ejecutivo: `03-RESUMEN-EJECUTIVO.md`
- [ ] Actualizar `orchestration/tareas/_INDEX.yml`
- [ ] Actualizar inventarios:
  - [ ] FRONTEND_INVENTORY.yml (si cambios frontend)
  - [ ] BACKEND_INVENTORY.yml (si cambios backend)
- [ ] Actualizar trazas de agente
- [ ] Actualizar docs/_MAP.md si documentos nuevos
- [ ] Commit final con todos los cambios
- [ ] Push a remoto
```

---

## 4. PROMPTS ESTÁNDAR

### 4.1 Prompt para GAP de Código

```markdown
## TAREA: [Título del GAP] (SUBTASK-X.Y, GAP-XX-NNN)

### PERFIL
Actúa como @PERFIL_BACKEND + @PERFIL_FRONTEND

### CONTEXTO DEL GAP
**GAP-XX-NNN: [Título]**
- **Severidad:** [CRÍTICO/ALTO/MEDIO/BAJO]
- **Problema:** [Descripción clara]
- **Impacto:** [Componentes afectados]

### ANÁLISIS PREVIO (de SUBTASKS.yml)
[Copiar sección capved relevante]

### ARCHIVOS A ANALIZAR/MODIFICAR
**Backend:**
- `[ruta/completa/archivo.ts]`

**Frontend:**
- `[ruta/completa/archivo.ts]`

### INSTRUCCIONES DETALLADAS
1. **Analizar [área]:**
   - [Detalle]
2. **Implementar solución:**
   - [Detalle]
3. **Validar:**
   - [Detalle]

### VALIDACIÓN OBLIGATORIA
cd apps/backend && npm run build && npm run lint
cd apps/frontend && npm run build && npm run lint

### ENTREGABLE
- Código modificado
- Confirmación de build exitoso
- Descripción de cambios
```

### 4.2 Prompt para Documentación

```markdown
## TAREA: [Título] (SUBTASK-X.Y)

### PERFIL
Actúa como @PERFIL_DOCUMENTATION

### CONTEXTO
[Descripción de lo que se necesita documentar]

### REFERENCIAS A CONSULTAR
1. `[ruta/archivo1]` - [propósito]
2. `[ruta/archivo2]` - [propósito]

### INSTRUCCIONES
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### ENTREGABLE
Archivo: `[ruta/NOMBRE-ARCHIVO.md]`

### ESTRUCTURA ESPERADA
[Template del documento a crear]
```

### 4.3 Prompt para Validación SIMCO

```markdown
## TAREA: Validar [Área] según SIMCO

### PERFIL
Actúa como @PERFIL_DOCUMENTATION + @PERFIL_ORQUESTADOR

### CONTEXTO
Tareas completadas: [lista]

### DIRECTIVAS A VERIFICAR
Según CLAUDE.md, Regla [X]:
[Lista de requisitos]

### VERIFICACIONES REQUERIDAS
1. [Verificación 1]
2. [Verificación 2]

### ENTREGABLE
Reporte con:
- Estado de cada área
- Items faltantes
- Recomendaciones
```

---

## 5. ESTRUCTURA DE CARPETA FINAL

```
orchestration/tareas/TASK-YYYY-MM-DD-[PORTAL]-ANALYSIS/
├── METADATA.yml                    # Metadata de la tarea
├── SUBTASKS.yml                    # Plan de subtareas CAPVED
├── 00-PLAN-MAESTRO.md             # Plan general
├── 01-HALLAZGOS-CONSOLIDADOS.md   # GAPs identificados
├── 02-[INVESTIGACION-ESPECIFICA].md # Si aplica
├── 03-RESUMEN-EJECUTIVO.md        # Resumen final
├── 04-VALIDACION-[AREA].md        # Validaciones realizadas
├── INFORME-TAREA-COMPLETO.md      # Informe detallado (opcional)
├── CONTEXTO-SUBAGENTES.md         # Prompts usados (opcional)
├── MEJORA-CONTINUA.md             # Análisis de mejora (opcional)
└── entregables/                   # Subfolder para entregables adicionales
    ├── REPORTE-[NOMBRE].md
    └── ...
```

---

## 6. CRITERIOS DE COMPLETITUD

### Mínimo Requerido (P0)

- [ ] METADATA.yml completo
- [ ] SUBTASKS.yml con todas las subtareas
- [ ] Al menos 1 archivo de hallazgos
- [ ] Build exitoso
- [ ] Lint sin errores
- [ ] _INDEX.yml actualizado

### Recomendado (P1)

- [ ] Resumen ejecutivo
- [ ] Validaciones documentadas
- [ ] Inventarios actualizados
- [ ] Trazas de agente actualizadas

### Completo (P2)

- [ ] Informe completo
- [ ] Contexto de subagentes documentado
- [ ] Análisis de mejora continua
- [ ] Plantilla actualizada si hay mejoras

---

## 7. MÉTRICAS A CAPTURAR

```yaml
metricas_finales:
  # Alcance
  paginas_analizadas: 0
  componentes_identificados: 0
  hooks_identificados: 0
  apis_consumidas: 0
  endpoints_validados: 0

  # GAPs
  gaps_criticos: 0
  gaps_altos: 0
  gaps_medios: 0
  gaps_bajos: 0
  gaps_resueltos: 0

  # Ejecución
  subtareas_totales: 0
  subtareas_completadas: 0
  subagentes_lanzados: 0
  tasa_exito_subagentes: "0%"

  # Tiempo
  horas_estimadas: 0
  horas_reales: 0

  # Documentación
  archivos_creados: 0
  archivos_modificados: 0
  lineas_documentacion: 0
  commits_realizados: 0
```

---

**Uso:** Copiar esta plantilla al iniciar una nueva tarea de análisis de portal y adaptar según necesidades específicas.

**Generado:** 2026-01-20
**Basado en:** TASK-2026-01-20-ANALISIS-PORTALES-INTEGRAL
