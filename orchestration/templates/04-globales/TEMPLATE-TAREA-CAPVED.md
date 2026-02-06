# {HU-ID} - {Título de la Historia de Usuario}

**Proyecto:** {nombre-proyecto}
**Módulo:** {nombre-módulo}
**Epic:** {EPIC-ID} - {nombre-epic}
**Feature:** {FEATURE-ID} - {nombre-feature} *(si aplica)*

---

## METADATOS

| Campo | Valor |
|-------|-------|
| **ID** | {HU-XXX} |
| **Tipo** | feature / enhancement / fix / refactor / spike / doc-only / tech-debt / security / performance |
| **Origen** | plan-original / descubrimiento / incidencia / mejora-continua / dependencia |
| **Prioridad** | P0 / P1 / P2 / P3 |
| **Fecha Creación** | YYYY-MM-DD |
| **Fecha Inicio** | YYYY-MM-DD |
| **Fecha Fin** | YYYY-MM-DD |
| **Agente Principal** | {nombre-agente} |
| **Estado** | pendiente / en-progreso / validacion / completada / bloqueada |

---

## C - CONTEXTO

### Vinculación al Proyecto

```yaml
proyecto: "{nombre}"
ruta: "projects/{proyecto}/"
modulo: "{módulo afectado}"
epic:
  id: "{EPIC-ID}"
  nombre: "{nombre del epic}"
  ruta: "docs/{fase}/{epic}/"
feature:  # si aplica
  id: "{FEATURE-ID}"
  nombre: "{nombre del feature}"
```

### Documentos Vinculados

```yaml
docs_requerimientos:
  - "docs/{fase}/{epic}/requerimientos/{archivo}.md"

docs_especificaciones:
  - "docs/{fase}/{epic}/especificaciones/{archivo}.md"

docs_diseño:
  - "docs/{fase}/{epic}/diseño/{archivo}.md"

docs_tecnicos:
  - "docs/95-guias-desarrollo/{relevante}.md"

adrs_relacionados:
  - "docs/90-adr/ADR-{NNN}.md"
```

### SIMCO Cargados

```yaml
simco_aplicados:
  - "SIMCO-TAREA.md"          # Siempre
  - "SIMCO-{operacion}.md"    # Según tipo
  - "SIMCO-{dominio}.md"      # Según capa
```

### Contexto Cargado (CCA)

- [ ] Principios leídos (DOC-PRIMERO, ANTI-DUP, VALIDACION, CAPVED)
- [ ] Perfil de agente cargado
- [ ] CONTEXTO-PROYECTO.md leído
- [ ] Inventarios consultados
- [ ] SIMCO correspondientes cargados

---

## A - ANÁLISIS

### Descripción de Negocio

**Como** {rol de usuario}
**Quiero** {acción deseada}
**Para** {beneficio/valor}

### Comportamiento Esperado

```yaml
casos_de_uso:
  caso_feliz:
    - "Usuario hace X"
    - "Sistema responde Y"
    - "Usuario ve Z"

  casos_de_error:
    - "Si X falla, mostrar mensaje Y"
    - "Si usuario no tiene permiso, redirigir a Z"

  casos_limite:
    - "Si lista está vacía, mostrar estado vacío"
    - "Si hay más de N registros, paginar"
```

### Restricciones

```yaml
seguridad:
  autenticacion_requerida: true/false
  roles_permitidos: []
  rls_aplicable: true/false
  datos_sensibles: []

performance:
  volumen_esperado: "{registros}"
  tiempo_respuesta_max: "{ms}"
  requiere_paginacion: true/false
  requiere_cache: true/false

ux:
  wireframe_disponible: true/false
  estados_carga_definidos: true/false
  manejo_errores_definido: true/false
  responsive_requerido: true/false
```

### Objetos Impactados

#### Base de Datos

| Tipo | Nombre | Acción | Schema |
|------|--------|--------|--------|
| tabla | {nombre} | crear / modificar | {schema} |
| vista | {nombre} | crear / modificar | {schema} |
| función | {nombre} | crear / modificar | {schema} |
| índice | {nombre} | crear | {schema} |
| trigger | {nombre} | crear / modificar | {schema} |
| rls_policy | {nombre} | crear / modificar | {schema} |

#### Backend

| Tipo | Nombre | Acción | Módulo |
|------|--------|--------|--------|
| entity | {nombre} | crear / modificar | {módulo} |
| service | {nombre} | crear / modificar | {módulo} |
| controller | {nombre} | crear / modificar | {módulo} |
| dto | {nombre} | crear / modificar | {módulo} |
| guard | {nombre} | crear / modificar | {módulo} |

#### Frontend

| Tipo | Nombre | Acción | App/Módulo |
|------|--------|--------|------------|
| página | {nombre} | crear / modificar | {app} |
| componente | {nombre} | crear / modificar | {módulo} |
| hook | {nombre} | crear / modificar | {módulo} |
| store | {nombre} | crear / modificar | {módulo} |
| type | {nombre} | crear / modificar | {módulo} |

### Dependencias

#### Bloquea a (Esta HU bloquea)

| HU ID | Descripción | Razón |
|-------|-------------|-------|
| {HU-XXX} | {descripción} | {por qué bloquea} |

#### Bloqueada por (Esta HU depende de)

| HU ID | Descripción | Estado | Razón |
|-------|-------------|--------|-------|
| {HU-YYY} | {descripción} | completada / en-progreso / pendiente | {por qué depende} |

#### Relacionadas (Sin bloqueo directo)

| HU ID | Descripción | Relación |
|-------|-------------|----------|
| {HU-ZZZ} | {descripción} | mismo módulo / misma feature |

### Riesgos Identificados

| ID | Descripción | Probabilidad | Impacto | Mitigación |
|----|-------------|--------------|---------|------------|
| R1 | {descripción} | alta/media/baja | alto/medio/bajo | {estrategia} |
| R2 | {descripción} | alta/media/baja | alto/medio/bajo | {estrategia} |

### Checklist Análisis

- [ ] Comportamiento de negocio documentado
- [ ] Restricciones identificadas
- [ ] Objetos impactados mapeados (todas las capas)
- [ ] Dependencias identificadas
- [ ] Riesgos documentados

---

## P - PLANEACIÓN

### Subtareas

#### Documentación (Siempre Primero)

| ID | Descripción | Artefactos | Agente |
|----|-------------|------------|--------|
| ST-001 | {descripción} | {archivos} | {agente} |

#### Database

| ID | Descripción | Artefactos | Agente | Depende de |
|----|-------------|------------|--------|------------|
| ST-002 | {descripción} | {archivos} | Database-Agent | ST-001 |

#### Backend

| ID | Descripción | Artefactos | Agente | Depende de |
|----|-------------|------------|--------|------------|
| ST-003 | {descripción} | {archivos} | Backend-Agent | ST-002 |
| ST-004 | {descripción} | {archivos} | Backend-Agent | ST-003 |

#### Frontend

| ID | Descripción | Artefactos | Agente | Depende de |
|----|-------------|------------|--------|------------|
| ST-005 | {descripción} | {archivos} | Frontend-Agent | ST-004 |

#### Validación (Siempre al Final)

| ID | Descripción | Agente | Depende de |
|----|-------------|--------|------------|
| ST-006 | Validación final build/lint/tests | Directo | ST-005 |

### Orden de Ejecución

```
ST-001 (Docs)
    ↓
ST-002 (Database)
    ↓
ST-003 (Backend - Entity)
    ↓
ST-004 (Backend - Service/Controller)
    ↓
ST-005 (Frontend)
    ↓
ST-006 (Validación)
```

### Criterios de Aceptación

#### Funcionales

- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

#### Técnicos

- [ ] Build pasa sin errores
- [ ] Lint pasa sin errores
- [ ] Tests unitarios cubren >80%
- [ ] API documentada en Swagger

#### Documentación

- [ ] Inventarios actualizados
- [ ] Trazas registradas
- [ ] ADR creado (si aplica)

### Plan de Pruebas

```yaml
unitarias:
  - "{test 1}"
  - "{test 2}"

integracion:
  - "{test 1}"
  - "{test 2}"

e2e:
  - "{test 1}"

regresion:
  - "{verificación 1}"
```

### Checklist Planeación

- [ ] Subtareas desglosadas por dominio
- [ ] Orden de ejecución definido
- [ ] Criterios de aceptación establecidos
- [ ] Plan de pruebas definido
- [ ] Agentes asignados

---

## V - VALIDACIÓN (⚠️ NO DELEGAR)

### Verificación Cobertura A → P

| Objeto (de Análisis) | Subtarea (en Plan) | Estado |
|---------------------|-------------------|--------|
| {objeto 1} | ST-XXX | ✓ cubierto / ⚠️ gap |
| {objeto 2} | ST-YYY | ✓ cubierto / ⚠️ gap |

### Gaps Detectados

| Gap | Acción |
|-----|--------|
| {objeto sin subtarea} | Agregar ST-XXX |

### Verificación Dependencias

| Dependencia | Estado | Acción |
|-------------|--------|--------|
| HU-XXX | completada | ✓ lista |
| HU-YYY | pendiente | ⚠️ esperar / crear subtarea previa |

### Scope Creep Detectado

| Item | Parte de HU Original | Acción | HU Derivada |
|------|---------------------|--------|-------------|
| {item detectado} | No | Crear HU | DERIVED-{HU-ID}-001 |

### Gate de Validación

- [ ] Todo objeto de Análisis tiene subtarea en Plan
- [ ] Todas las dependencias resueltas o planificadas
- [ ] Criterios de aceptación cubren riesgos
- [ ] Scope creep registrado
- [ ] HUs derivadas creadas (si aplica)

**RESULTADO:** ✓ APROBADO PARA EJECUCIÓN / ⚠️ REQUIERE AJUSTES

---

## E - EJECUCIÓN

### Progreso de Subtareas

| ID | Descripción | Estado | Inicio | Fin | Notas |
|----|-------------|--------|--------|-----|-------|
| ST-001 | {desc} | ✓/⏳/⏸ | YYYY-MM-DD | YYYY-MM-DD | {notas} |
| ST-002 | {desc} | ✓/⏳/⏸ | YYYY-MM-DD | YYYY-MM-DD | {notas} |
| ST-003 | {desc} | ✓/⏳/⏸ | YYYY-MM-DD | YYYY-MM-DD | {notas} |

### Archivos Creados

```
{ruta/archivo1.ext}
{ruta/archivo2.ext}
```

### Archivos Modificados

```
{ruta/archivo1.ext}
{ruta/archivo2.ext}
```

### Validaciones Ejecutadas

```bash
# Database
./create-database.sh  # ✓ OK / ✗ Error

# Backend
npm run build         # ✓ OK / ✗ Error
npm run lint          # ✓ OK / ✗ Error
npm test              # ✓ OK / ✗ Error (N passed, M failed)

# Frontend
npm run build         # ✓ OK / ✗ Error
npm run lint          # ✓ OK / ✗ Error
npm run typecheck     # ✓ OK / ✗ Error
```

### Desviaciones del Plan

| Subtarea | Desviación | Razón | Impacto |
|----------|-----------|-------|---------|
| ST-XXX | {descripción} | {razón} | {impacto} |

### Checklist Ejecución

- [ ] docs/ actualizado PRIMERO
- [ ] Subtareas ejecutadas en orden
- [ ] Build pasa en todas las capas
- [ ] Lint pasa en todas las capas
- [ ] Tests pasan (si aplica)
- [ ] Desviaciones documentadas

---

## D - DOCUMENTACIÓN

### Actualizaciones Realizadas

#### Diagramas/Modelos

| Tipo | Ubicación | Cambio |
|------|-----------|--------|
| ERD | docs/{epic}/diseño/ | {cambio} |
| Arquitectura | docs/00-vision/ | {cambio} |

#### Especificaciones Técnicas

| Tipo | Ubicación | Cambio |
|------|-----------|--------|
| API | docs/{epic}/specs/ | {cambio} |
| BD | docs/{epic}/specs/ | {cambio} |

#### ADRs Creados

| ADR | Título | Decisión |
|-----|--------|----------|
| ADR-{NNN} | {título} | {decisión tomada} |

#### Inventarios Actualizados

- [ ] DATABASE_INVENTORY.yml
  - Agregado: {descripción}
- [ ] BACKEND_INVENTORY.yml
  - Agregado: {descripción}
- [ ] FRONTEND_INVENTORY.yml
  - Agregado: {descripción}

#### Trazas Registradas

- [ ] TRAZA-TAREAS-DATABASE.md
- [ ] TRAZA-TAREAS-BACKEND.md
- [ ] TRAZA-TAREAS-FRONTEND.md

### HUs Derivadas

| ID | Descripción | Origen | Fase Detectada | Prioridad |
|----|-------------|--------|----------------|-----------|
| DERIVED-{HU-ID}-001 | {descripción} | {HU-ID} | V / E | P0/P1/P2/P3 |
| DERIVED-{HU-ID}-002 | {descripción} | {HU-ID} | V / E | P0/P1/P2/P3 |

### Lecciones Aprendidas

#### Qué Funcionó Bien

- {lección 1}
- {lección 2}

#### Qué Se Puede Mejorar

- {área de mejora 1}
- {área de mejora 2}

#### Para Futuras HUs Similares

- {recomendación 1}
- {recomendación 2}

### Checklist Documentación

- [ ] Diagramas/modelos actualizados
- [ ] Specs técnicas actualizadas
- [ ] ADRs creados (si aplica)
- [ ] Inventarios actualizados
- [ ] Trazas registradas
- [ ] HUs derivadas vinculadas
- [ ] Lecciones aprendidas registradas

---

## RESUMEN FINAL

### Métricas

| Métrica | Valor |
|---------|-------|
| Subtareas totales | N |
| Subtareas completadas | N/N |
| Archivos creados | N |
| Archivos modificados | N |
| HUs derivadas | N |
| Tiempo total | Xh |

### Estado Final

```
[ ] ✓ COMPLETADA - Todos los gates pasaron
[ ] ⚠️ COMPLETADA CON OBSERVACIONES - Requiere seguimiento
[ ] ✗ BLOQUEADA - Pendiente de {descripción}
```

### Firma de Cierre

| Campo | Valor |
|-------|-------|
| **Completada por** | {agente} |
| **Fecha cierre** | YYYY-MM-DD HH:MM |
| **Revisada por** | {agente/humano} |
| **Aprobación** | ✓ Aprobada / ⏳ Pendiente |

---

## HISTORIAL DE CAMBIOS

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| YYYY-MM-DD | C | Creación inicial | {agente} |
| YYYY-MM-DD | A | Análisis completado | {agente} |
| YYYY-MM-DD | P | Plan definido | {agente} |
| YYYY-MM-DD | V | Validación aprobada | {agente} |
| YYYY-MM-DD | E | Ejecución completada | {agente} |
| YYYY-MM-DD | D | Documentación cerrada | {agente} |

---

**Template:** TEMPLATE-TAREA-CAPVED.md v1.0.0
**Sistema:** SIMCO + CAPVED
