# SIMCO: CICLO DE VIDA DE TAREAS (CAPVED)

**Versión:** 1.1.0
**Sistema:** SIMCO - Gestión de Tareas con CAPVED
**Propósito:** Definir el proceso completo para toda HU/Tarea que modifica código o documentación
**Actualizado:** 2025-12-08

---

## PRINCIPIO FUNDAMENTAL

> **Toda tarea que genera commit DEBE pasar por el ciclo CAPVED completo.**
> **Si algo aparece fuera del alcance, se registra y genera HU nueva.**
> **NUEVO: Antes de CAPVED, ejecutar FASE 0 para identificar nivel y contexto.**

---

## FASE 0: IDENTIFICACIÓN DE NIVEL (NUEVA - CRÍTICA)

**OBLIGATORIO antes de iniciar CAPVED**

### 0.1 Determinar Nivel Jerárquico

```yaml
# Gamilit es STANDALONE (CLAUDE.md RC3 y RC4)
# No forma parte de jerarquía multi-workspace
# Todo el código (backend, frontend, database) está en el mismo repositorio

NIVEL_GAMILIT_STANDALONE:
  ruta: "C:\Empresas\ISEM\gamilit-workspace\"
  tipo: "STANDALONE"
  identificador: "Proyecto monorepo completo con gobernanza local"
  workspace: "git@github.com:rckrdmrd/gamilit-workspace.git"
  estructura:
    - "apps/backend/"     # NestJS 11, 22 módulos
    - "apps/frontend/"    # React 19
    - "apps/database/"    # PostgreSQL 15 DDL
    - "orchestration/"    # SIMCO local completo
    - "docs/"            # Documentación del producto
```

### 0.2 Cargar Contexto del Nivel

```yaml
# Archivos a leer para gamilit standalone
Archivos_Gamilit:
  contexto_base:
    - CLAUDE.md                                    # Identidad y reglas críticas
    - orchestration/PROJECT-CONTEXT.md             # Contexto del proyecto
    - orchestration/CONTEXT-MAP.yml                # Variables y aliases
    - orchestration/PROXIMA-ACCION.md              # Estado actual y próxima acción

  inventarios:
    - orchestration/inventarios/MASTER_INVENTORY.yml    # SSOT completo (DB/BE/FE)
    - orchestration/inventarios/DATABASE_INVENTORY.yml  # Si tarea afecta BD
    - orchestration/inventarios/BACKEND_INVENTORY.yml   # Si tarea afecta backend
    - orchestration/inventarios/FRONTEND_INVENTORY.yml  # Si tarea afecta frontend

  dominio_especifico:
    - orchestration/directivas/simco/SIMCO-DDL.md       # Si creas/modificas tablas
    - orchestration/directivas/simco/SIMCO-BACKEND.md   # Si trabajas en NestJS
    - orchestration/directivas/simco/SIMCO-FRONTEND.md  # Si trabajas en React
```

### 0.3 Identificar Ruta de Propagación

```yaml
# N/A - Gamilit es STANDALONE sin propagación (CLAUDE.md RC3)
# No propaga a otros proyectos
# No hereda código de otros proyectos
# Toda la gobernanza es local en orchestration/

Propagacion_Gamilit:
  tipo: "NINGUNA"
  razon: "Proyecto standalone completo"
  accion: "Actualizar solo inventarios locales en orchestration/inventarios/"
  nota: "Gamilit es heredero de PATRONES (no código). No propaga a otros proyectos."
```

### 0.4 Registrar Identificación

```yaml
# Resultado de Fase 0 para gamilit (incluir en reporte)
fase_0_identificacion:
  proyecto: "gamilit"
  tipo: "STANDALONE"
  nivel: "NIVEL_2A_STANDALONE"
  workspace: "git@github.com:rckrdmrd/gamilit-workspace.git"
  path: "C:\Empresas\ISEM\gamilit-workspace\"
  propagacion: "NINGUNA (standalone sin propagación)"
  contexto_cargado:
    - CLAUDE.md ✓
    - orchestration/PROJECT-CONTEXT.md ✓
    - orchestration/CONTEXT-MAP.yml ✓
    - orchestration/inventarios/MASTER_INVENTORY.yml ✓
  herencia: "Usa PATRONES de referencia, no código heredado"
  gobernanza: "Local completa en orchestration/"
```

### 0.5 Verificar Catálogo

```yaml
# Verificar inventarios locales antes de crear objetos nuevos
ANTES_de_proceder_a_CAPVED:
  verificar: "¿Lo que voy a crear ya existe en gamilit?"
  fuente: "orchestration/inventarios/MASTER_INVENTORY.yml"

  inventarios_por_dominio:
    database: "orchestration/inventarios/DATABASE_INVENTORY.yml (169 tablas)"
    backend: "orchestration/inventarios/BACKEND_INVENTORY.yml (152 entities, 899 endpoints)"
    frontend: "orchestration/inventarios/FRONTEND_INVENTORY.yml (474 componentes)"

  SI_EXISTE:
    - Revisar objeto existente
    - Modificar en lugar de crear duplicado
    - Documentar modificación

  SI_SIMILAR_70_PCT:
    - Copiar objeto similar
    - Adaptar a necesidad específica
    - Documentar origen y cambios

  SI_NO_EXISTE:
    - Proceder con CAPVED normal
    - Agregar a inventarios al finalizar
    - Actualizar MASTER_INVENTORY.yml
```

---

## CUÁNDO USAR ESTE SIMCO

```yaml
USAR_SIMCO_TAREA_cuando:
  - Recibes una HU o tarea técnica
  - La tarea involucra modificar código
  - La tarea involucra modificar documentación
  - La tarea generará uno o más commits
  - Cualquier trabajo que no sea puramente exploratorio

NO_USAR_cuando:
  - Solo estás investigando/explorando (usa SIMCO-BUSCAR)
  - Solo estás consultando información
  - Es un spike sin implementación
```

---

## FLUJO COMPLETO CAPVED

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ENTRADA: HU o Tarea Técnica                                               │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FASE C: CONTEXTO (~5 min)                                           │  │
│   │  ────────────────────────────                                        │  │
│   │  1. Identificar proyecto/módulo/epic                                 │  │
│   │  2. Clasificar tipo de tarea                                         │  │
│   │  3. Registrar origen                                                 │  │
│   │  4. Cargar contexto SIMCO (CCA)                                      │  │
│   │  5. Vincular documentos relevantes                                   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FASE A: ANÁLISIS (~15 min)                                          │  │
│   │  ──────────────────────────                                          │  │
│   │  1. Entender comportamiento deseado (negocio)                        │  │
│   │  2. Identificar restricciones (seguridad/perf/UX)                    │  │
│   │  3. Mapear objetos impactados (BD, BE, FE, otros)                    │  │
│   │  4. Identificar dependencias (HUs bloqueantes/bloqueadas)            │  │
│   │  5. Detectar riesgos                                                 │  │
│   │  → SALIDA: Reporte de análisis                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FASE P: PLANEACIÓN (~10 min)                                        │  │
│   │  ─────────────────────────────                                       │  │
│   │  1. Desglosar en subtareas por dominio                               │  │
│   │  2. Establecer orden de ejecución                                    │  │
│   │  3. Definir criterios de aceptación                                  │  │
│   │  4. Planificar pruebas                                               │  │
│   │  5. Asignar agentes/subagentes (si aplica)                           │  │
│   │  → SALIDA: Plan de ejecución                                         │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FASE V: VALIDACIÓN (~5 min) ⚠️ NO DELEGAR                           │  │
│   │  ────────────────────────────────────────────                        │  │
│   │  1. ¿Todo lo de A tiene acción en P?                                 │  │
│   │  2. ¿Dependencias resueltas o planificadas?                          │  │
│   │  3. ¿Criterios cubren riesgos?                                       │  │
│   │  4. ¿Hay scope creep? → Registrar + crear HU derivada                │  │
│   │  → GATE: Solo pasa si TODO cuadra                                    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
│                     ┌─────────┴─────────┐                                    │
│                     │  ¿VALIDACIÓN OK?  │                                    │
│                     └─────────┬─────────┘                                    │
│                    NO │               │ SÍ                                   │
│                       ▼               ▼                                      │
│              ┌────────────┐  ┌──────────────────────────────────────────┐   │
│              │ AJUSTAR    │  │  FASE E: EJECUCIÓN (variable)            │   │
│              │ A o P      │  │  ─────────────────────────────           │   │
│              │ y volver   │  │  1. Actualizar docs/ PRIMERO             │   │
│              │ a V        │  │  2. Ejecutar subtareas en orden          │   │
│              └────────────┘  │  3. Validar build/lint por subtarea      │   │
│                              │  4. Registrar progreso                   │   │
│                              │  5. Usar SIMCO correspondientes          │   │
│                              │  → SALIDA: Código implementado           │   │
│                              └──────────────────────────────────────────┘   │
│                                              │                               │
│                                              ▼                               │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FASE D: DOCUMENTACIÓN (~10 min)                                     │  │
│   │  ───────────────────────────────                                     │  │
│   │  1. Actualizar diagramas/modelos                                     │  │
│   │  2. Actualizar specs técnicas                                        │  │
│   │  3. Crear ADR (si decisión arquitectónica)                           │  │
│   │  4. Actualizar inventarios                                           │  │
│   │  5. Actualizar trazas                                                │  │
│   │  6. Vincular HUs derivadas                                           │  │
│   │  7. Registrar lecciones aprendidas                                   │  │
│   │  → GATE: HU NO está Done sin esto                                    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
│                               ▼                                              │
│                                                                              │
│   SALIDA: HU Completada, Documentada, Trazable                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## FASE C: CONTEXTO (Detalle)

### C.1 Identificar Proyecto/Módulo/Epic

```yaml
Contexto_Obligatorio:
  proyecto: "{nombre del proyecto}"
  ruta_proyecto: "projects/{proyecto}/"
  modulo: "{nombre del módulo afectado}"
  epic_padre: "{EPIC-ID} - {nombre}"
  feature_padre: "{FEATURE-ID} - {nombre}" # si aplica
```

### C.2 Clasificar Tipo de Tarea

```yaml
Tipos_de_Tarea:
  feature:      "Nueva funcionalidad"
  enhancement:  "Mejora a funcionalidad existente"
  fix:          "Corrección de bug"
  refactor:     "Reestructuración sin cambio funcional"
  spike:        "Investigación técnica"
  doc-only:     "Solo documentación"
  tech-debt:    "Pago de deuda técnica"
  security:     "Corrección de seguridad"
  performance:  "Optimización de rendimiento"
```

### C.3 Registrar Origen

```yaml
Origenes_de_Tarea:
  plan-original:  "Parte del plan de proyecto/sprint"
  descubrimiento: "Detectada durante otra tarea"
  incidencia:     "Reportada por usuario/QA"
  mejora-continua: "Identificada en retrospectiva"
  dependencia:    "Requerida por otra HU"
```

### C.4 Cargar Contexto SIMCO (CCA)

```
Seguir protocolo de SIMCO-INICIALIZACION.md:
1. Leer principios fundamentales (4 ahora con CAPVED)
2. Leer perfil del agente
3. Leer PROJECT-CONTEXT.md
4. Leer inventarios relevantes
5. Cargar SIMCO de operación según tipo de tarea
```

### C.5 Vincular Documentos Relevantes

```yaml
Documentos_a_Vincular:
  docs_proyecto:
    - "docs/{fase}/{epic}/README.md"
    - "docs/{fase}/{epic}/requerimientos/{archivo}.md"
    - "docs/{fase}/{epic}/especificaciones/{archivo}.md"

  docs_tecnicos:
    - "docs/95-guias-desarrollo/{relevantes}.md"
    - "docs/90-adr/{relacionados}.md"

  orchestration:
    - "orchestration/inventarios/{relevantes}.yml"
    - "orchestration/trazas/TRAZA-{tipo}.md"
```

---

## FASE A: ANÁLISIS (Detalle)

### A.1 Comportamiento Deseado (Negocio)

```yaml
Preguntas_de_Negocio:
  - "¿Qué debe poder hacer el usuario al completar esta HU?"
  - "¿Qué problema de negocio resuelve?"
  - "¿Cuál es el criterio de éxito desde perspectiva de usuario?"
  - "¿Hay casos de uso específicos documentados?"

Formato_Respuesta:
  como: "{rol de usuario}"
  quiero: "{acción deseada}"
  para: "{beneficio/valor}"
```

### A.2 Restricciones

```yaml
Restricciones_a_Identificar:
  seguridad:
    - "¿Requiere autenticación?"
    - "¿Requiere autorización por rol?"
    - "¿Maneja datos sensibles?"
    - "¿Aplica RLS?"

  performance:
    - "¿Volumen esperado de datos?"
    - "¿Tiempo de respuesta esperado?"
    - "¿Requiere paginación?"
    - "¿Requiere caché?"

  ux:
    - "¿Hay wireframes/mockups?"
    - "¿Estados de carga definidos?"
    - "¿Manejo de errores definido?"
    - "¿Responsive requerido?"
```

### A.3 Mapear Objetos Impactados

```yaml
Objetos_por_Capa:
  database:
    schemas: []      # Schemas afectados
    tablas: []       # Tablas a crear/modificar
    vistas: []       # Vistas afectadas
    funciones: []    # Funciones a crear/modificar
    indices: []      # Índices necesarios
    triggers: []     # Triggers afectados
    rls_policies: [] # Políticas RLS

  backend:
    modulos: []      # Módulos NestJS
    entities: []     # Entities TypeORM
    services: []     # Services
    controllers: []  # Controllers
    dtos: []         # DTOs (Request/Response)
    guards: []       # Guards de autorización
    pipes: []        # Pipes de validación

  frontend:
    paginas: []      # Páginas/rutas
    componentes: []  # Componentes React
    hooks: []        # Custom hooks
    stores: []       # Stores Zustand
    types: []        # TypeScript types/interfaces
    services: []     # Services de API

  otros:
    proyectos: []    # Otros proyectos afectados
    integraciones: [] # Integraciones externas
    jobs: []         # Jobs/colas
    caches: []       # Caché a invalidar
```

### A.4 Identificar Dependencias

```yaml
Dependencias:
  bloquea_a:           # Esta HU bloquea a otras
    - hu_id: "HU-XXX"
      razon: "Necesita la tabla que creo"

  bloqueada_por:       # Esta HU depende de otras
    - hu_id: "HU-YYY"
      razon: "Necesito el endpoint de auth"
      estado: "completada | en-progreso | pendiente"

  relacionadas:        # HUs relacionadas (no bloqueo directo)
    - hu_id: "HU-ZZZ"
      relacion: "Mismo módulo"
```

### A.5 Detectar Riesgos

```yaml
Riesgos_Identificados:
  - id: "R1"
    descripcion: "Cambio en tabla users afecta auth de todos los tenants"
    probabilidad: "alta | media | baja"
    impacto: "alto | medio | bajo"
    mitigacion: "Ejecutar en horario de bajo tráfico, tener rollback listo"
```

---

## FASE P: PLANEACIÓN (Detalle)

### P.1 Desglosar en Subtareas

```yaml
Subtareas:
  documentacion:  # SIEMPRE PRIMERO
    - id: "ST-001"
      descripcion: "Actualizar spec de API en docs/"
      artefactos: ["docs/.../.md"]

  database:
    - id: "ST-002"
      descripcion: "Crear tabla users en schema auth"
      artefactos: ["ddl/schemas/auth/tables/users.sql"]
      agente: "Database-Agent"

  backend:
    - id: "ST-003"
      descripcion: "Crear UserEntity alineada con DDL"
      artefactos: ["src/modules/users/entities/user.entity.ts"]
      agente: "Backend-Agent"
      depende_de: ["ST-002"]

    - id: "ST-004"
      descripcion: "Crear UsersService con CRUD"
      artefactos: ["src/modules/users/users.service.ts"]
      agente: "Backend-Agent"
      depende_de: ["ST-003"]

  frontend:
    - id: "ST-005"
      descripcion: "Crear UserList component"
      artefactos: ["src/components/users/UserList.tsx"]
      agente: "Frontend-Agent"
      depende_de: ["ST-004"]

  validacion:  # SIEMPRE AL FINAL
    - id: "ST-006"
      descripcion: "Validación final build/lint/tests"
      agente: "Ejecutar directamente"
```

### P.2 Orden de Ejecución

```
1. Documentación (docs/ actualizados)
   ↓
2. Database (DDL, migraciones)
   ↓
3. Backend (Entities → Services → Controllers)
   ↓
4. Frontend (Types → Hooks → Components → Pages)
   ↓
5. Validación (build, lint, tests)
   ↓
6. Documentación final (inventarios, trazas)
```

### P.3 Criterios de Aceptación

```yaml
Criterios_de_Aceptacion:
  funcionales:
    - "Usuario puede crear registro"
    - "Usuario puede listar registros con paginación"
    - "Usuario puede editar registro existente"
    - "Usuario puede eliminar registro (soft delete)"

  tecnicos:
    - "Build pasa sin errores"
    - "Lint pasa sin errores"
    - "Tests unitarios cubren >80%"
    - "API documentada en Swagger"

  documentacion:
    - "Inventarios actualizados"
    - "Trazas registradas"
    - "ADR creado (si aplica)"
```

### P.4 Plan de Pruebas

```yaml
Plan_de_Pruebas:
  unitarias:
    - "Service: CRUD operations"
    - "Guards: permission checks"

  integracion:
    - "API: endpoints responden correctamente"
    - "DB: datos persisten correctamente"

  e2e:
    - "Flujo completo crear-editar-eliminar"

  regresion:
    - "Auth sigue funcionando"
    - "Otros módulos no afectados"
```

---

## FASE V: VALIDACIÓN (Detalle)

### V.1 Verificar Cobertura Análisis → Plan

```yaml
Verificacion_Cobertura:
  objetos_database:
    - objeto: "tabla users"
      en_analisis: true
      en_plan: "ST-002"
      ✓ CUBIERTO

  objetos_backend:
    - objeto: "UserEntity"
      en_analisis: true
      en_plan: "ST-003"
      ✓ CUBIERTO

  # Si algo en Análisis NO tiene subtarea en Plan:
  gap_detectado:
    - objeto: "índice en email"
      en_analisis: true
      en_plan: false
      accion: "Agregar subtarea ST-002b"
```

### V.2 Verificar Dependencias

```yaml
Verificacion_Dependencias:
  - hu_dependencia: "HU-YYY"
    estado: "completada"
    ✓ LISTA

  - hu_dependencia: "HU-ZZZ"
    estado: "pendiente"
    ⚠️ BLOQUEADOR
    accion: "Esperar o crear subtarea previa"
```

### V.3 Detectar Scope Creep

```yaml
Scope_Creep_Detectado:
  - item: "Se necesita también endpoint de búsqueda"
    parte_de_hu_original: false
    accion: "CREAR HU DERIVADA"
    hu_derivada:
      id: "DERIVED-HU-001-001"
      descripcion: "Endpoint de búsqueda de usuarios"
      prioridad: "P2"
```

### V.4 Gate de Validación

```
CHECKLIST GATE:
[ ] Todo objeto de Análisis tiene subtarea en Plan
[ ] Todas las dependencias están resueltas o planificadas
[ ] Criterios de aceptación cubren todos los riesgos
[ ] Scope creep registrado y HUs derivadas creadas
[ ] No hay gaps sin resolver

→ Si TODO marcado: PROCEDER A EJECUCIÓN
→ Si algo falta: VOLVER A AJUSTAR A o P
```

---

## FASE E: EJECUCIÓN (Detalle)

### E.1 Actualizar docs/ PRIMERO

```yaml
Antes_de_Codigo:
  - Actualizar specs de API
  - Actualizar diagramas de entidades
  - Actualizar documentación de módulo
  - Verificar que docs/ refleja lo que se va a implementar
```

### E.2 Ejecutar Subtareas en Orden

Para cada subtarea:

```yaml
Por_Subtarea:
  1_iniciar:
    - Marcar subtarea "en progreso"
    - Cargar SIMCO correspondiente (CREAR/MODIFICAR/DDL/etc)

  2_implementar:
    - Seguir checklist del SIMCO
    - Aplicar principios (doc-primero, anti-dup, validación)
    - Generar código/cambios

  3_validar:
    - Ejecutar build
    - Ejecutar lint
    - Verificar que compila

  4_registrar:
    - Marcar subtarea "completada"
    - Notas de lo implementado
    - Desviaciónes (si las hubo)

  5_siguiente:
    - Pasar a siguiente subtarea
```

### E.3 Usar SIMCO Correspondientes

```yaml
SIMCO_por_Subtarea:
  crear_tabla:      "@SIMCO-CREAR + @SIMCO-DDL"
  crear_entity:     "@SIMCO-CREAR + @SIMCO-BACKEND"
  crear_componente: "@SIMCO-CREAR + @SIMCO-FRONTEND"
  modificar_algo:   "@SIMCO-MODIFICAR + @SIMCO-{dominio}"
  validar:          "@SIMCO-VALIDAR"
```

---

## FASE D: DOCUMENTACIÓN (Detalle)

### D.1 Actualizar Diagramas/Modelos

```yaml
Diagramas_a_Actualizar:
  - tipo: "ERD"
    ubicacion: "docs/{epic}/diseño/erd.md"
    cambio: "Agregar tabla users"

  - tipo: "Arquitectura"
    ubicacion: "docs/00-vision-general/arquitectura.md"
    cambio: "Agregar módulo users" # si aplica
```

### D.2 Actualizar Specs Técnicas

```yaml
Specs_a_Actualizar:
  - tipo: "API"
    ubicacion: "docs/{epic}/especificaciones/api-users.md"
    cambio: "Documentar endpoints CRUD"

  - tipo: "BD"
    ubicacion: "docs/{epic}/especificaciones/modelo-datos.md"
    cambio: "Agregar tabla users"
```

### D.3 Crear ADR (si aplica)

```yaml
ADR_Requerido_Si:
  - "Se tomó decisión arquitectónica importante"
  - "Se eligió tecnología/librería nueva"
  - "Se cambió patrón establecido"
  - "Se hizo trade-off significativo"

Ubicacion: "docs/90-adr/ADR-{NNN}-{titulo}.md"
```

### D.4 Actualizar Inventarios

```yaml
Inventarios_a_Actualizar:
  - archivo: "orchestration/inventarios/DATABASE_INVENTORY.yml"
    agregar: "Nueva tabla users en schema auth"

  - archivo: "orchestration/inventarios/BACKEND_INVENTORY.yml"
    agregar: "Nuevo módulo users"

  - archivo: "orchestration/inventarios/FRONTEND_INVENTORY.yml"
    agregar: "Nuevo componente UserList"
```

### D.5 Actualizar Trazas

```yaml
Traza_a_Registrar:
  archivo: "orchestration/trazas/TRAZA-TAREAS-{tipo}.md"
  entrada:
    fecha: "2025-12-08"
    hu_id: "HU-001"
    descripcion: "CRUD de usuarios"
    archivos_creados: [lista]
    archivos_modificados: [lista]
    agente: "Backend-Agent"
    duracion: "2h"
    notas: "Sin incidencias"
```

### D.6 Vincular HUs Derivadas

```yaml
HUs_Derivadas:
  - id: "DERIVED-HU-001-001"
    descripcion: "Endpoint de búsqueda de usuarios"
    origen: "HU-001"
    detectado_en: "Fase V - Validación"
    estado: "pendiente"
    prioridad: "P2"
```

### D.7 Registrar Lecciones Aprendidas

```yaml
Lecciones_Aprendidas:
  que_funciono_bien:
    - "Seguir orden DB → BE → FE evitó retrabajos"
    - "Validar contra Swagger antes de FE ahorró tiempo"

  que_se_puede_mejorar:
    - "Definir tipos compartidos desde el inicio"

  para_futuras_HUs:
    - "En módulos CRUD, siempre incluir paginación desde V1"
```

### D.8 Gate Final

```
CHECKLIST DOCUMENTACIÓN:
[ ] Diagramas actualizados
[ ] Specs técnicas actualizadas
[ ] ADR creado (si aplica)
[ ] Inventarios actualizados
[ ] Trazas registradas
[ ] HUs derivadas vinculadas
[ ] Lecciones aprendidas registradas

→ Si TODO marcado: HU COMPLETADA
→ Si algo falta: COMPLETAR ANTES DE CERRAR
```

---

## TEMPLATE DE REGISTRO RÁPIDO

```yaml
# Registro CAPVED para HU-{ID}
# ────────────────────────────

hu_id: "HU-XXX"
titulo: "Título de la HU"
fecha_inicio: "YYYY-MM-DD"
fecha_fin: "YYYY-MM-DD"

contexto:
  proyecto: ""
  modulo: ""
  epic: ""
  tipo: "feature | fix | refactor | etc"
  origen: "plan | descubrimiento | incidencia"

analisis:
  objetos_impactados: N
  dependencias: N
  riesgos: N

planeacion:
  subtareas: N
  agentes_asignados: []

validacion:
  gaps_detectados: N
  scope_creep: "sí | no"
  hus_derivadas: N

ejecucion:
  subtareas_completadas: "N/N"
  build_status: "✓ | ✗"
  lint_status: "✓ | ✗"

documentacion:
  inventarios: "✓ | ✗"
  trazas: "✓ | ✗"
  adr: "✓ | N/A"
  lecciones: "✓ | ✗"

estado_final: "COMPLETADA | EN_PROGRESO | BLOQUEADA"
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `PRINCIPIO-CAPVED.md` | Declaración del principio |
| `SIMCO-INICIALIZACION.md` | Protocolo CCA |
| `TEMPLATE-TAREA-CAPVED.md` | Template completo para tracking |
| `TEMPLATE-ANALISIS.md` | Template de análisis |
| `TEMPLATE-PLAN.md` | Template de planeación |
| `TEMPLATE-VALIDACION.md` | Template de validación |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO + CAPVED | **Tipo:** Directiva de Proceso
