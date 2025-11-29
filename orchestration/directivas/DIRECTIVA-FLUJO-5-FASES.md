# DIRECTIVA: FLUJO OBLIGATORIO DE 5 FASES

**Proyecto:** GAMILIT - Sistema de Gamificacion Educativa
**Version:** 1.0.0
**Fecha:** 2025-11-29
**Estado:** OBLIGATORIO - Aplica a TODOS los agentes
**Prioridad:** MAXIMA - Esta directiva tiene precedencia sobre otras

---

## OBJETIVO

Establecer el flujo obligatorio de trabajo para TODA tarea que involucre modificacion de codigo o documentacion. Este flujo garantiza:

1. **Coherencia documentacion-codigo**: Validar contra docs/ ANTES de implementar
2. **Actualizacion proactiva**: Documentar ANTES de codificar
3. **Integracion sin conflictos**: Analisis profundo de dependencias
4. **Calidad garantizada**: Validacion de build y lint antes de completar

---

## PRINCIPIO FUNDAMENTAL

> **DOCUMENTACION PRIMERO, IMPLEMENTACION DESPUES**
>
> Toda tarea debe:
> 1. Validar contra documentacion existente en `docs/`
> 2. Actualizar documentacion con los cambios planificados
> 3. Solo entonces implementar los cambios
> 4. Validar que la implementacion cumple con lo documentado

---

## LAS 5 FASES OBLIGATORIAS

```
+------------------------------------------------------------------+
|  FASE 1: ANALISIS                                                 |
|  - Validar contra docs/ PRIMERO                                   |
|  - Mapear TODOS los objetos afectados                            |
|  - Identificar dependencias hasta 3 niveles                       |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  FASE 2: PLANEACION                                               |
|  - Disenar plan de implementacion                                 |
|  - Definir actualizaciones a docs/ ANTES de codigo               |
|  - Asignar agentes y orden de ejecucion                          |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  FASE 3: VALIDACION DE PLANEACION                                 |
|  - Comparar plan vs analisis                                      |
|  - Verificar coherencia con docs/                                 |
|  - Ejecutar directamente (sin delegar)                           |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  FASE 4: EJECUCION                                                |
|  - Actualizar docs/ PRIMERO                                       |
|  - Implementar segun plan                                         |
|  - Orquestar hasta 5 agentes                                     |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  FASE 5: VALIDACION DE EJECUCION                                  |
|  - Ejecutar npm run build (OBLIGATORIO)                          |
|  - Ejecutar lint (OBLIGATORIO)                                   |
|  - Validar coherencia docs/ vs codigo                            |
|  - Ejecutar directamente (sin delegar)                           |
+------------------------------------------------------------------+
```

---

## FASE 1: ANALISIS (Detalle)

### 1.1 Analisis de la Tarea Principal

- Leer y entender completamente el requerimiento
- Identificar el alcance real (no asumir)
- Clasificar tipo de tarea: feature, bug, refactor, documentacion

### 1.2 Validacion Contra Documentacion

**OBLIGATORIO consultar:**
```yaml
Documentacion_Obligatoria:
  - docs/00-vision-general/     # Vision y objetivos
  - docs/01-fase-alcance-inicial/ # Alcance MVP
  - docs/02-fase-robustecimiento/ # Fase actual
  - docs/95-guias-desarrollo/   # Estandares y convenciones
  - docs/97-adr/                # Decisiones arquitectonicas
  - docs/98-standards/          # Estandares de codigo
```

**Preguntas a responder:**
- ¿La tarea esta alineada con la documentacion existente?
- ¿Hay contradicciones entre la tarea y la documentacion?
- ¿La documentacion esta actualizada o hay gaps?

### 1.3 Mapeo de Objetos Afectados

**OBLIGATORIO identificar:**

| Capa | Objetos a Mapear |
|------|------------------|
| Database | Tablas, relaciones, vistas, indices, triggers, funciones |
| Types | Types, interfaces, enums, DTOs (shared y por modulo) |
| APIs | Endpoints, contratos, parametros, respuestas, errores |
| Backend | Services, controllers, entities, guards, pipes, interceptors |
| Frontend | Paginas, componentes, hooks, stores, estilos |

### 1.4 Dependencias (Hasta 3 Niveles)

```
Nivel 0: Objeto principal a modificar
    |
    +-- Nivel 1: Dependencias directas
            |
            +-- Nivel 2: Dependencias de nivel 1
                    |
                    +-- Nivel 3: Dependencias de nivel 2 (maximo)
```

**Ejemplo:**
```
Nivel 0: UserEntity (modificar)
    |
    +-- Nivel 1: AuthService (usa UserEntity)
    |       |
    |       +-- Nivel 2: AuthController (usa AuthService)
    |               |
    |               +-- Nivel 3: LoginPage (llama AuthController)
    |
    +-- Nivel 1: UserResponseDto (deriva de UserEntity)
            |
            +-- Nivel 2: adminTypes.ts (importa UserResponseDto)
```

### 1.5 Deteccion de Inconsistencias

Comparar documentacion vs codigo real:
- ¿Lo que dice docs/ coincide con lo implementado?
- ¿Hay features documentadas pero no implementadas?
- ¿Hay codigo sin documentacion correspondiente?

**REGISTRAR en reporte de analisis:**
- Inconsistencias encontradas
- Gaps de documentacion
- Desactualizaciones

---

## FASE 2: PLANEACION (Detalle)

### 2.1 Disenar Plan de Implementacion

El plan DEBE incluir:

```yaml
Plan_Requerido:
  objetivo: "Descripcion clara del objetivo"

  actualizacion_docs_primero:
    - archivo: "docs/95-guias-desarrollo/..."
      cambio: "Agregar seccion X"
      razon: "Define el estandar antes de implementar"

  tareas:
    - id: 1
      descripcion: "Actualizar docs/..."
      afecta: [documentacion]
      orden: 1  # SIEMPRE documentacion primero

    - id: 2
      descripcion: "Modificar Entity X"
      afecta: [backend, types]
      dependencias: [1]
      orden: 2

    - id: 3
      descripcion: "Actualizar componente Y"
      afecta: [frontend]
      dependencias: [2]
      orden: 3
```

### 2.2 Orden de Ejecucion

**OBLIGATORIO seguir este orden:**

```
1. Actualizar documentacion en docs/
   |
   v
2. Cambios en Database (si aplica)
   |
   v
3. Cambios en Types/DTOs compartidos
   |
   v
4. Cambios en Backend
   |
   v
5. Cambios en Frontend
   |
   v
6. Validacion final (build, lint)
```

### 2.3 Asignacion de Agentes

| Tipo de Tarea | Agente | Max Paralelos |
|---------------|--------|---------------|
| Documentacion | Architecture-Analyst | 1 |
| Database DDL | Database-Agent | 1 |
| Backend codigo | Backend-Agent | 2 |
| Frontend codigo | Frontend-Agent | 2 |
| Validaciones | Ejecutar directamente | N/A |

**Limite:** Maximo 5 agentes en paralelo por fase

---

## FASE 3: VALIDACION DE PLANEACION (Detalle)

### 3.1 Comparar Plan vs Analisis

**Checklist OBLIGATORIO:**

- [ ] Todas las areas impactadas del analisis estan cubiertas en el plan
- [ ] Todas las dependencias identificadas tienen tareas asociadas
- [ ] No se omite ningun objeto indirectamente relacionado (hasta nivel 3)
- [ ] El orden de ejecucion respeta las dependencias

### 3.2 Verificar Coherencia con docs/

- [ ] Cambios planificados NO contradicen documentacion existente
- [ ] Si hay contradicciones, se planifica actualizar docs/ primero
- [ ] Actualizaciones a docs/ estan incluidas en el plan

### 3.3 Ajustar Plan

Si se detectan inconsistencias:
1. Documentar la inconsistencia
2. Ajustar el plan para incluir la correccion
3. Re-validar el plan ajustado

### 3.4 Ejecutar Directamente

**ESTA FASE NO SE DELEGA A AGENTES**

El Architecture-Analyst o agente orquestador ejecuta esta validacion directamente.

---

## FASE 4: EJECUCION (Detalle)

### 4.1 Actualizar Documentacion PRIMERO

**ANTES de modificar codigo:**

1. Actualizar docs/ con los cambios planificados
2. Documentar decisiones en ADRs si aplica
3. Actualizar inventarios con lo que se va a crear
4. Actualizar guias de desarrollo si cambian estandares

### 4.2 Ejecutar Plan por Subtareas

Para cada subtarea:

1. Verificar que documentacion ya esta actualizada
2. Orquestar agente apropiado con contexto completo
3. Esperar resultado del agente
4. Verificar que agente siguio las convenciones de docs/

### 4.3 Contexto para Agentes Orquestados

Todo agente orquestado DEBE recibir:

```yaml
Contexto_Obligatorio:
  tarea: "Descripcion clara"

  documentacion_referencia:
    - "docs/95-guias-desarrollo/backend/DTO-CONVENTIONS.md"
    - "docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md"
    # ... documentos relevantes

  restricciones:
    - "Seguir convenciones de DTO-CONVENTIONS.md"
    - "Usar SSOT definidos en TYPES-CONVENTIONS.md"
    - "No crear duplicados (verificar antes)"

  criterios_aceptacion:
    - "Compila sin errores (npm run build)"
    - "Pasa lint (eslint)"
    - "Sigue estandares documentados"

  validaciones_requeridas:
    - "npm run build"
    - "npm run lint (o commit con husky)"
```

### 4.4 Resultados Esperados de Agentes

Todo agente debe entregar:

- Codigo/cambios realizados
- Confirmacion de que sigue docs/
- Resultado de validaciones (build, lint)
- Lista de archivos modificados
- Problemas encontrados (si hay)

---

## FASE 5: VALIDACION DE EJECUCION (Detalle)

### 5.1 Validaciones de Build y Lint OBLIGATORIAS

**Backend:**
```bash
cd apps/backend
npm run build        # OBLIGATORIO - debe pasar
npm run lint         # OBLIGATORIO - debe pasar (o corregir)
```

**Frontend:**
```bash
cd apps/frontend
npm run build        # OBLIGATORIO - debe pasar
npm run lint         # OBLIGATORIO - debe pasar (o corregir)
```

**Si hay errores:**
1. NO marcar tarea como completada
2. Corregir errores
3. Re-ejecutar validaciones
4. Solo entonces continuar

### 5.2 Validar Coherencia Documentacion-Codigo

**Verificar que:**
- [ ] Codigo implementado coincide con lo documentado en docs/
- [ ] No hay discrepancias entre documentacion y realidad
- [ ] Inventarios actualizados reflejan cambios reales
- [ ] Trazas documentan la tarea completada

### 5.3 Revisar Resultados de Agentes

Para cada agente orquestado, verificar:
- [ ] Cumplio los criterios de aceptacion
- [ ] Siguio las convenciones documentadas
- [ ] No introdujo errores colaterales
- [ ] Actualizo inventarios correspondientes

### 5.4 Ejecutar Directamente

**ESTA FASE NO SE DELEGA A AGENTES**

El Architecture-Analyst o agente orquestador ejecuta esta validacion directamente.

### 5.5 Pasada Final de Consistencia

Antes de cerrar la tarea, verificar:

```
Analisis (Fase 1) <----> Plan (Fase 2) <----> Ejecucion (Fase 4)
                            |
                            v
                   Documentacion en docs/
                            |
                            v
                   Codigo implementado
```

Todas las flechas deben ser coherentes. Si hay discrepancias, corregir.

---

## VALIDACIONES OBLIGATORIAS ANTES DE COMPLETAR

### Checklist Final

**Build y Lint:**
- [ ] `npm run build` backend exitoso
- [ ] `npm run build` frontend exitoso
- [ ] `npm run lint` backend pasa (o errores corregidos)
- [ ] `npm run lint` frontend pasa (o errores corregidos)

**Documentacion:**
- [ ] docs/ actualizado con cambios realizados
- [ ] Inventarios actualizados
- [ ] Trazas documentadas
- [ ] ADRs creados (si hubo decisiones arquitectonicas)

**Codigo:**
- [ ] Sigue convenciones de docs/95-guias-desarrollo/
- [ ] No hay duplicados (verificado contra inventarios)
- [ ] Tests pasan (si aplica)

---

## CUANDO APLICAR ESTA DIRECTIVA

Esta directiva aplica a TODA tarea que:

- Modifique codigo en apps/
- Modifique documentacion en docs/
- Cree nuevos archivos
- Refactorice codigo existente
- Corrija bugs
- Implemente features

**Excepciones (no aplica):**
- Tareas puramente exploratorias (solo lectura)
- Consultas de informacion
- Analisis sin implementacion

---

## RESPONSABILIDADES POR ROL

### Architecture-Analyst (Orquestador)

- Ejecutar FASE 1 (Analisis) directamente
- Ejecutar FASE 3 (Validacion Planeacion) directamente
- Ejecutar FASE 5 (Validacion Ejecucion) directamente
- Orquestar agentes en FASE 4

### Agentes Especializados (Backend, Frontend, Database)

- Recibir contexto completo incluyendo referencias a docs/
- Seguir convenciones documentadas
- Ejecutar validaciones (build, lint) antes de reportar completado
- Reportar cualquier discrepancia con documentacion

---

## REFERENCIAS A DOCUMENTACION DE ESTANDARES

Los agentes DEBEN consultar:

| Capa | Documento de Estandares |
|------|------------------------|
| Backend DTOs | docs/95-guias-desarrollo/backend/DTO-CONVENTIONS.md |
| Backend API | docs/95-guias-desarrollo/backend/API-CONVENTIONS.md |
| Backend General | docs/95-guias-desarrollo/backend/NAMING-CONVENTIONS-API.md |
| Frontend Types | docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md |
| Frontend Components | docs/95-guias-desarrollo/frontend/COMPONENT-PATTERNS.md |
| Frontend Hooks | docs/95-guias-desarrollo/frontend/HOOK-PATTERNS.md |
| Arquitectura | docs/97-adr/ |

---

## INTEGRACION CON OTRAS DIRECTIVAS

Esta directiva complementa:

- **DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md**: Define QUE documentar
- **POLITICAS-USO-AGENTES.md**: Define COMO usar agentes
- **DIRECTIVA-CALIDAD-CODIGO.md**: Define estandares de calidad
- **ESTANDARES-NOMENCLATURA.md**: Define convenciones de nombres

Esta directiva tiene PRECEDENCIA cuando hay conflicto con flujos definidos en otras directivas.

---

---

## SUBFASES DETALLADAS (CHECKLIST ANIDADOS)

### FASE 1: ANALISIS - Subfases

```yaml
FASE_1_ANALISIS:
  subfase_1.1_entender_tarea:
    descripcion: "Comprender completamente el requerimiento"
    checklist:
      - [ ] Leer requerimiento completo sin asumir
      - [ ] Identificar objetivo principal
      - [ ] Clasificar tipo: feature | bug | refactor | docs
      - [ ] Identificar alcance real
    entregable: "Descripcion clara del objetivo"

  subfase_1.2_validar_docs:
    descripcion: "Validar contra documentacion existente"
    checklist:
      - [ ] Consultar docs/00-vision-general/
      - [ ] Consultar docs/95-guias-desarrollo/
      - [ ] Consultar docs/97-adr/
      - [ ] Consultar orchestration/inventarios/
      - [ ] Identificar contradicciones
      - [ ] Identificar gaps de documentacion
    entregable: "Lista de docs consultados + inconsistencias"

  subfase_1.3_mapear_objetos:
    descripcion: "Identificar TODOS los objetos afectados"
    checklist:
      - [ ] Listar tablas/schemas afectados
      - [ ] Listar entities/DTOs afectados
      - [ ] Listar services/controllers afectados
      - [ ] Listar components/hooks afectados
      - [ ] Listar types/interfaces afectados
    entregable: "Matriz de objetos por capa"

  subfase_1.4_analizar_dependencias:
    descripcion: "Mapear dependencias hasta 3 niveles"
    checklist:
      - [ ] Nivel 0: Objeto principal identificado
      - [ ] Nivel 1: Dependencias directas listadas
      - [ ] Nivel 2: Dependencias de nivel 1 listadas
      - [ ] Nivel 3: Dependencias de nivel 2 listadas
      - [ ] Arbol de dependencias documentado
    entregable: "Arbol de dependencias completo"

  subfase_1.5_detectar_inconsistencias:
    descripcion: "Comparar docs vs codigo real"
    checklist:
      - [ ] Verificar si docs/ coincide con codigo
      - [ ] Listar features documentadas no implementadas
      - [ ] Listar codigo sin documentacion
      - [ ] Registrar todas las inconsistencias
    entregable: "Reporte de inconsistencias"

  criterio_salida_fase_1:
    - "Reporte de analisis completo"
    - "Todas las subfases con checklist completado"
    - "Inconsistencias documentadas"
```

### FASE 2: PLANEACION - Subfases

```yaml
FASE_2_PLANEACION:
  subfase_2.1_definir_docs_primero:
    descripcion: "Planificar actualizaciones a docs/ ANTES de codigo"
    checklist:
      - [ ] Identificar docs/ que requieren actualizacion
      - [ ] Definir cambios especificos por documento
      - [ ] Justificar cada actualizacion
      - [ ] Ordenar actualizaciones por prioridad
    entregable: "Lista de actualizaciones a docs/"

  subfase_2.2_disenar_tareas:
    descripcion: "Definir tareas especificas de implementacion"
    checklist:
      - [ ] Crear lista de tareas con IDs
      - [ ] Definir descripcion clara por tarea
      - [ ] Asignar capas afectadas por tarea
      - [ ] Definir dependencias entre tareas
      - [ ] Establecer orden de ejecucion
    entregable: "Lista de tareas ordenadas"

  subfase_2.3_asignar_agentes:
    descripcion: "Determinar que agentes ejecutaran cada tarea"
    checklist:
      - [ ] Asignar agente por tarea
      - [ ] Identificar tareas paralelizables
      - [ ] Verificar limite de 5 agentes paralelos
      - [ ] Definir secuencia de orquestacion
    entregable: "Matriz agente-tarea"

  subfase_2.4_preparar_contexto:
    descripcion: "Preparar contexto completo para cada agente"
    checklist:
      - [ ] Definir tarea clara para cada agente
      - [ ] Incluir referencias a docs/ relevantes
      - [ ] Definir restricciones especificas
      - [ ] Definir criterios de aceptacion
      - [ ] Incluir validaciones requeridas
    entregable: "Contexto por agente listo"

  criterio_salida_fase_2:
    - "Plan de implementacion completo"
    - "docs/ a actualizar identificados"
    - "Agentes asignados con contexto"
```

### FASE 3: VALIDACION PLANEACION - Subfases

```yaml
FASE_3_VALIDACION_PLANEACION:
  ejecucion: "DIRECTA - NO DELEGAR"

  subfase_3.1_comparar_plan_analisis:
    descripcion: "Verificar que plan cubre todo el analisis"
    checklist:
      - [ ] Todas las areas del analisis tienen tareas
      - [ ] Todas las dependencias tienen tareas asociadas
      - [ ] Objetos nivel 3 estan cubiertos
      - [ ] Orden respeta dependencias
    entregable: "Confirmacion de cobertura"

  subfase_3.2_verificar_coherencia_docs:
    descripcion: "Validar que plan no contradice docs/"
    checklist:
      - [ ] Plan no contradice docs/ existentes
      - [ ] Si hay contradiccion, docs/ se actualiza primero
      - [ ] Actualizaciones a docs/ estan en el plan
    entregable: "Confirmacion de coherencia"

  subfase_3.3_ajustar_si_necesario:
    descripcion: "Corregir plan si hay inconsistencias"
    checklist:
      - [ ] Documentar inconsistencias encontradas
      - [ ] Ajustar plan para corregirlas
      - [ ] Re-validar plan ajustado
    entregable: "Plan final validado"

  criterio_salida_fase_3:
    - "Plan aprobado y coherente"
    - "Sin contradicciones con docs/"
    - "Listo para ejecucion"
```

### FASE 4: EJECUCION - Subfases

```yaml
FASE_4_EJECUCION:
  subfase_4.1_actualizar_docs_primero:
    descripcion: "Actualizar documentacion ANTES de codigo"
    checklist:
      - [ ] Actualizar docs/ segun plan
      - [ ] Crear ADRs si hay decisiones arquitectonicas
      - [ ] Actualizar inventarios con lo que se creara
      - [ ] Actualizar guias si cambian estandares
    entregable: "docs/ actualizados"

  subfase_4.2_ejecutar_tareas_database:
    descripcion: "Cambios en base de datos (si aplica)"
    checklist:
      - [ ] Orquestar Database-Agent con contexto
      - [ ] Verificar carga limpia exitosa
      - [ ] Validar integridad referencial
      - [ ] Confirmar DDL sin errores
    entregable: "Database actualizada"

  subfase_4.3_ejecutar_tareas_backend:
    descripcion: "Cambios en backend"
    checklist:
      - [ ] Orquestar Backend-Agent con contexto
      - [ ] Verificar que sigue DTO-CONVENTIONS.md
      - [ ] Verificar npm run build pasa
      - [ ] Verificar npm run lint pasa
    entregable: "Backend actualizado y compilando"

  subfase_4.4_ejecutar_tareas_frontend:
    descripcion: "Cambios en frontend"
    checklist:
      - [ ] Orquestar Frontend-Agent con contexto
      - [ ] Verificar que sigue TYPES-CONVENTIONS.md
      - [ ] Verificar npm run build pasa
      - [ ] Verificar npm run lint pasa
    entregable: "Frontend actualizado y compilando"

  subfase_4.5_recopilar_resultados:
    descripcion: "Consolidar resultados de todos los agentes"
    checklist:
      - [ ] Recopilar archivos modificados
      - [ ] Recopilar resultados de build/lint
      - [ ] Documentar problemas encontrados
      - [ ] Verificar que todos siguieron docs/
    entregable: "Resumen de ejecucion"

  criterio_salida_fase_4:
    - "Todos los agentes completaron sin errores"
    - "Build pasa en todas las capas"
    - "Codigo sigue convenciones de docs/"
```

### FASE 5: VALIDACION EJECUCION - Subfases

```yaml
FASE_5_VALIDACION_EJECUCION:
  ejecucion: "DIRECTA - NO DELEGAR"

  subfase_5.1_validar_build:
    descripcion: "Ejecutar build en todas las capas"
    checklist:
      - [ ] cd apps/backend && npm run build  # DEBE pasar
      - [ ] cd apps/frontend && npm run build # DEBE pasar
      - [ ] Si falla: corregir y re-ejecutar
      - [ ] NO completar si build falla
    entregable: "Build exitoso en todas las capas"

  subfase_5.2_validar_lint:
    descripcion: "Ejecutar lint en todas las capas"
    checklist:
      - [ ] cd apps/backend && npm run lint   # DEBE pasar
      - [ ] cd apps/frontend && npm run lint  # DEBE pasar
      - [ ] Si hay errores: corregir
      - [ ] NO completar si lint falla
    entregable: "Lint exitoso en todas las capas"

  subfase_5.3_validar_coherencia:
    descripcion: "Verificar coherencia docs vs codigo"
    checklist:
      - [ ] Codigo coincide con docs/ actualizado
      - [ ] Inventarios reflejan cambios reales
      - [ ] Trazas documentan tarea completada
      - [ ] No hay discrepancias
    entregable: "Coherencia confirmada"

  subfase_5.4_revisar_agentes:
    descripcion: "Verificar resultados de cada agente"
    checklist:
      - [ ] Cada agente cumplio criterios de aceptacion
      - [ ] Cada agente siguio convenciones de docs/
      - [ ] No hay errores colaterales
      - [ ] Inventarios actualizados por agentes
    entregable: "Agentes validados"

  subfase_5.5_pasada_final:
    descripcion: "Verificacion final de consistencia"
    checklist:
      - [ ] Analisis <-> Plan: coherente
      - [ ] Plan <-> Ejecucion: coherente
      - [ ] Ejecucion <-> docs/: coherente
      - [ ] docs/ <-> Codigo: coherente
    entregable: "Tarea completada y coherente"

  criterio_salida_fase_5:
    - "Build exitoso"
    - "Lint exitoso"
    - "Coherencia total verificada"
    - "TAREA COMPLETADA"
```

---

## MEMORIA PERSISTENTE PARA COMPACTACION

> **CRITICO:** Esta seccion DEBE preservarse SIEMPRE al compactar contexto.
> Contiene las rutas a directivas que el agente DEBE consultar si olvida algo.

### Instrucciones de Compactacion

**Al compactar o resumir conversaciones, SIEMPRE preservar:**

1. El bloque YAML de "MEMORIA_PERSISTENTE" completo
2. Las rutas a directivas
3. El estado actual de la tarea (fase, subfase)
4. Los principios fundamentales

**NUNCA olvidar:**
- El principio "DOCUMENTACION PRIMERO"
- Las 5 fases obligatorias
- Las validaciones de build/lint
- Las rutas a docs/ de estandares

### Bloque de Memoria Persistente

```yaml
# ═══════════════════════════════════════════════════════════════════════
# MEMORIA PERSISTENTE - PRESERVAR SIEMPRE EN COMPACTACIONES
# ═══════════════════════════════════════════════════════════════════════

MEMORIA_PERSISTENTE:
  version: "1.1.0"
  principio_fundamental: "DOCUMENTACION PRIMERO, IMPLEMENTACION DESPUES"

  # ─────────────────────────────────────────────────────────────────────
  # DIRECTIVAS OBLIGATORIAS (consultar si olvidas algo)
  # ─────────────────────────────────────────────────────────────────────
  directivas:
    flujo_5_fases: "orchestration/directivas/DIRECTIVA-FLUJO-5-FASES.md"
    documentacion_obligatoria: "orchestration/directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md"
    calidad_codigo: "orchestration/directivas/DIRECTIVA-CALIDAD-CODIGO.md"
    carga_limpia: "orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md"
    politicas_agentes: "orchestration/directivas/POLITICAS-USO-AGENTES.md"
    nomenclatura: "orchestration/directivas/ESTANDARES-NOMENCLATURA.md"

  # ─────────────────────────────────────────────────────────────────────
  # DOCUMENTACION DE ESTANDARES (consultar antes de implementar)
  # ─────────────────────────────────────────────────────────────────────
  estandares:
    backend:
      dto_conventions: "docs/95-guias-desarrollo/backend/DTO-CONVENTIONS.md"
      api_conventions: "docs/95-guias-desarrollo/backend/API-CONVENTIONS.md"
      naming_conventions: "docs/95-guias-desarrollo/backend/NAMING-CONVENTIONS-API.md"
    frontend:
      types_conventions: "docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md"
      component_patterns: "docs/95-guias-desarrollo/frontend/COMPONENT-PATTERNS.md"
      hook_patterns: "docs/95-guias-desarrollo/frontend/HOOK-PATTERNS.md"
    arquitectura:
      adrs: "docs/97-adr/"
      vision: "docs/00-vision-general/"

  # ─────────────────────────────────────────────────────────────────────
  # PROMPTS DE AGENTES (para orquestacion)
  # ─────────────────────────────────────────────────────────────────────
  prompts_agentes:
    architecture_analyst: "orchestration/prompts/PROMPT-ARCHITECTURE-ANALYST.md"
    backend_agent: "orchestration/prompts/PROMPT-BACKEND-AGENT.md"
    frontend_agent: "orchestration/prompts/PROMPT-FRONTEND-AGENT.md"
    database_agent: "orchestration/prompts/PROMPT-DATABASE-AGENT.md"

  # ─────────────────────────────────────────────────────────────────────
  # INVENTARIOS Y TRAZAS
  # ─────────────────────────────────────────────────────────────────────
  inventarios:
    master: "orchestration/inventarios/MASTER_INVENTORY.yml"
    database: "orchestration/inventarios/DATABASE_INVENTORY.yml"
    backend: "orchestration/inventarios/BACKEND_INVENTORY.yml"
    frontend: "orchestration/inventarios/FRONTEND_INVENTORY.yml"

  trazas:
    database: "orchestration/trazas/TRAZA-TAREAS-DATABASE.md"
    backend: "orchestration/trazas/TRAZA-TAREAS-BACKEND.md"
    frontend: "orchestration/trazas/TRAZA-TAREAS-FRONTEND.md"

  # ─────────────────────────────────────────────────────────────────────
  # LAS 5 FASES (recordatorio compacto)
  # ─────────────────────────────────────────────────────────────────────
  fases_obligatorias:
    fase_1: "ANALISIS - Validar docs/, mapear objetos, dependencias 3 niveles"
    fase_2: "PLANEACION - docs/ primero, tareas, asignar agentes"
    fase_3: "VALIDACION PLAN - NO DELEGAR, comparar plan vs analisis"
    fase_4: "EJECUCION - Actualizar docs/ PRIMERO, orquestar agentes"
    fase_5: "VALIDACION EJECUCION - NO DELEGAR, build, lint, coherencia"

  # ─────────────────────────────────────────────────────────────────────
  # VALIDACIONES OBLIGATORIAS
  # ─────────────────────────────────────────────────────────────────────
  validaciones_obligatorias:
    backend:
      - "cd apps/backend && npm run build"
      - "cd apps/backend && npm run lint"
    frontend:
      - "cd apps/frontend && npm run build"
      - "cd apps/frontend && npm run lint"
    database:
      - "cd apps/database && ./create-database.sh"

  # ─────────────────────────────────────────────────────────────────────
  # ESTADO ACTUAL (actualizar durante ejecucion)
  # ─────────────────────────────────────────────────────────────────────
  estado_actual:
    fase: null  # 1|2|3|4|5
    subfase: null  # 1.1|1.2|...|5.5
    tarea: null  # descripcion de la tarea actual
    agentes_orquestados: []  # lista de agentes en progreso
    pendientes: []  # lista de tareas pendientes

# ═══════════════════════════════════════════════════════════════════════
# FIN MEMORIA PERSISTENTE
# ═══════════════════════════════════════════════════════════════════════
```

### Como Usar la Memoria Persistente

**Si olvidaste algo:**
1. Consulta la ruta en `MEMORIA_PERSISTENTE.directivas`
2. Lee el archivo con la herramienta Read
3. Sigue las instrucciones del archivo

**Si no recuerdas las fases:**
1. Consulta `MEMORIA_PERSISTENTE.fases_obligatorias`
2. Si necesitas mas detalle, lee `DIRECTIVA-FLUJO-5-FASES.md`

**Si no recuerdas los estandares:**
1. Consulta `MEMORIA_PERSISTENTE.estandares`
2. Lee el archivo relevante segun la capa (backend/frontend)

**Al iniciar nueva tarea:**
1. Actualiza `MEMORIA_PERSISTENTE.estado_actual`
2. Registra fase=1, subfase=1.1
3. Sigue el flujo de 5 fases

---

## CHANGELOG

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-11-29 | Creacion inicial |
| 1.1.0 | 2025-11-29 | Añadidas subfases detalladas y memoria persistente |

---

**Estado:** ACTIVA Y OBLIGATORIA
**Revision:** Mensual
**Proxima revision:** 2025-12-29
