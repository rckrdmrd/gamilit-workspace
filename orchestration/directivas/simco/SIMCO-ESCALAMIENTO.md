# SIMCO: ESCALAMIENTO (Al Product Owner)

**Version:** 1.0.0
**Fecha:** 2025-12-12
**Aplica a:** TODO agente que encuentre ambiguedad o informacion faltante
**Prioridad:** OBLIGATORIA - Aplica PRINCIPIO-NO-ASUMIR

---

## RESUMEN EJECUTIVO

> **Si no esta definido en la documentacion, NO asumir. PREGUNTAR.**
> **Nunca implementar basado en suposiciones.**
> **Escalar al Product Owner cuando hay ambiguedad.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   REGLA DE ORO: "Si no esta documentado, NO asumir. PREGUNTAR."     ║
║                                                                       ║
║   PROHIBIDO:                                                          ║
║   - Asumir valores/comportamientos no documentados                   ║
║   - Inventar requisitos                                               ║
║   - Tomar decisiones de negocio sin autorizacion                     ║
║   - Implementar "lo que parece logico" sin confirmacion              ║
║                                                                       ║
║   OBLIGATORIO:                                                        ║
║   - Detener trabajo cuando falta informacion critica                 ║
║   - Documentar pregunta claramente                                   ║
║   - Escalar al Product Owner                                          ║
║   - Esperar respuesta antes de continuar                             ║
║   - Documentar decision del PO antes de implementar                  ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CUANDO ESCALAR

### 1. Informacion Faltante en Documentacion

```yaml
casos_de_escalamiento:
  - Tabla/entidad mencionada pero sin definicion de columnas
  - Endpoint mencionado pero sin especificacion de payload
  - Pagina mencionada pero sin definicion de componentes
  - Regla de negocio ambigua o incompleta
  - Valores de enum no especificados
  - Validaciones no documentadas
  - Comportamiento de error no definido
  - Limites/umbrales no especificados
  - Orden de prioridad no claro
  - Dependencias entre features no definidas
```

### 2. Ambiguedad en Requerimientos

```yaml
casos_de_escalamiento:
  - Requisito que puede interpretarse de multiples formas
  - Contradiccion entre documentos
  - Alcance no claramente definido
  - Criterios de aceptacion vagos
  - Casos edge no cubiertos
  - Comportamiento en condiciones especiales no definido
```

### 3. Decisiones de Negocio

```yaml
casos_de_escalamiento:
  - Cambio que afecta experiencia de usuario
  - Modificacion de flujos existentes
  - Nuevas restricciones o validaciones
  - Priorizacion entre alternativas
  - Trade-offs tecnico-negocio
  - Impacto en otros sistemas/integraciones
```

### 4. Contradicciones Entre Documentos

```yaml
casos_de_escalamiento:
  - Spec dice una cosa, MVP otra
  - Requisito funcional contradice requisito tecnico
  - Diagrama no coincide con descripcion
  - Versiones de documentos en conflicto
```

---

## COMO NO ESCALAR (ANTI-PATRONES)

```yaml
INCORRECTO:
  - "No encontre la informacion, voy a asumir..."
  - "Parece logico que sea asi, voy a implementar..."
  - "Seguramente el PO quiso decir..."
  - "En otros proyectos lo hacemos asi..."
  - "Preguntare despues de implementar..."

CORRECTO:
  - "No encontre la especificacion de X, escalo al PO"
  - "La documentacion es ambigua en Y, escalo al PO"
  - "Detuve la implementacion hasta clarificar Z con PO"
```

---

## FORMATO DE ESCALAMIENTO

### Template de Consulta al PO

```markdown
## CONSULTA AL PRODUCT OWNER

**Fecha:** {YYYY-MM-DD HH:MM}
**Agente:** {Nombre del agente}
**Tarea:** [{TAREA-ID}] {Titulo}
**Fase:** {Analisis | Planeacion | Ejecucion}

### Contexto

{Describir brevemente que estas haciendo y donde encontraste el problema}

### Informacion Encontrada

{Listar lo que SI encontraste en la documentacion}
- Documento X, linea Y: "{texto relevante}"
- Documento Z: {informacion relacionada}

### Informacion Faltante / Ambigua

{Describir claramente que falta o es ambiguo}
- No se especifica: {detalle}
- Es ambiguo porque: {explicacion}

### Pregunta Especifica

{Formular pregunta clara y concisa}

**Opciones identificadas (si aplica):**
1. Opcion A: {descripcion} - Implicaciones: {X}
2. Opcion B: {descripcion} - Implicaciones: {Y}
3. Opcion C: {descripcion} - Implicaciones: {Z}

### Impacto de No Resolver

{Que pasa si no se resuelve esta duda}
- Bloquea: {tarea/feature}
- Riesgo: {descripcion del riesgo}

### Estado

**[ ] PENDIENTE RESPUESTA**
[ ] RESPONDIDO
[ ] IMPLEMENTADO
```

---

## EJEMPLOS DE ESCALAMIENTO

### Ejemplo 1: Valores de Enum No Especificados

```markdown
## CONSULTA AL PRODUCT OWNER

**Fecha:** 2025-12-12 14:30
**Agente:** Database-Agent
**Tarea:** [DB-042] Crear modulo de Proyectos
**Fase:** Analisis

### Contexto

Estoy trabajando en la tabla `projects` segun MVP-APP.md seccion 4.1.
La documentacion menciona que los proyectos tienen un "status" pero
no especifica los valores posibles.

### Informacion Encontrada

- MVP-APP.md linea 250: "Los proyectos tienen un status que cambia
  a lo largo del ciclo de vida"
- No hay especificacion de valores validos de status

### Informacion Faltante

- Valores del enum `project_status`
- Transiciones validas entre estados
- Estado inicial por defecto

### Pregunta Especifica

Cuales son los valores validos para el status de un proyecto?

**Opciones identificadas:**
1. ['draft', 'active', 'completed', 'archived']
2. ['pending', 'in_progress', 'done', 'cancelled']
3. Otro conjunto de valores

### Impacto de No Resolver

- Bloquea: Creacion de tabla projects
- Riesgo: Implementar valores incorrectos que requieran migracion

### Estado

**[X] PENDIENTE RESPUESTA**
```

### Ejemplo 2: Comportamiento de Error No Definido

```markdown
## CONSULTA AL PRODUCT OWNER

**Fecha:** 2025-12-12 15:00
**Agente:** Backend-Agent
**Tarea:** [BE-015] Implementar validacion de codigo unico
**Fase:** Ejecucion

### Contexto

Implementando validacion de codigo unico en ProjectService.
La documentacion indica que el codigo debe ser unico, pero no
especifica que hacer cuando ya existe.

### Informacion Encontrada

- RF-PROJ-003: "El codigo del proyecto debe ser unico en el sistema"

### Informacion Faltante

- Mensaje de error a mostrar al usuario
- Si debe sugerir un codigo alternativo
- Si debe permitir reutilizar codigos de proyectos archivados

### Pregunta Especifica

Cual es el comportamiento esperado cuando un usuario intenta
crear un proyecto con un codigo que ya existe?

**Opciones:**
1. Rechazar con mensaje generico "Codigo ya existe"
2. Sugerir codigo alternativo (ej: PROJ-001-1)
3. Permitir si el proyecto original esta archivado

### Impacto de No Resolver

- Riesgo: UX pobre si mensaje no es util
- Riesgo: Confusion si comportamiento no es intuitivo

### Estado

**[X] PENDIENTE RESPUESTA**
```

---

## FLUJO DE ESCALAMIENTO

```
1. Detectar informacion faltante/ambigua
      |
      v
2. Buscar exhaustivamente en documentacion
   |  - docs/01-requerimientos/
   |  - docs/02-especificaciones-tecnicas/
   |  - ADRs
   |  - Inventarios
      |
      v
3. Si NO se encuentra:
      |
      v
4. Documentar consulta (usar template)
      |
      v
5. DETENER trabajo en esta parte
   |  - No asumir
   |  - No implementar parcialmente
   |  - Marcar tarea como BLOQUEADA
      |
      v
6. Continuar con otras tareas si es posible
      |
      v
7. Esperar respuesta del PO
      |
      v
8. Documentar respuesta recibida
      |
      v
9. Actualizar documentacion con la decision
      |
      v
10. Continuar implementacion
```

---

## DOCUMENTAR RESPUESTA DEL PO

### Cuando se Recibe Respuesta

```markdown
## RESPUESTA DEL PRODUCT OWNER

**Fecha respuesta:** {YYYY-MM-DD}
**Respondido por:** {nombre/rol}

### Decision

{Transcribir o resumir la decision tomada}

### Justificacion (si se proporciono)

{Razon de la decision}

### Impacto en Implementacion

{Como afecta esto a la implementacion actual}

### Documentacion a Actualizar

- [ ] {documento 1}: {cambio}
- [ ] {documento 2}: {cambio}

### Estado

[ ] PENDIENTE RESPUESTA
**[X] RESPONDIDO**
[ ] IMPLEMENTADO
```

### Actualizar Documentacion

```yaml
DESPUES_de_recibir_respuesta:
  - Actualizar spec/requisito correspondiente
  - Agregar nota de clarificacion si aplica
  - Registrar decision en ADR si es significativa
  - Actualizar inventarios si hay cambio de alcance
```

---

## DONDE REGISTRAR ESCALAMIENTOS

```yaml
ubicacion:
  activos: "orchestration/escalamientos/ACTIVOS.md"
  resueltos: "orchestration/escalamientos/HISTORICO.md"

formato_registro:
  - Fecha
  - Agente
  - Tarea relacionada
  - Resumen de pregunta
  - Estado (PENDIENTE/RESUELTO)
  - Link a detalle
```

---

## SEVERIDAD DE BLOQUEO

```yaml
CRITICO:
  descripcion: "Bloquea toda la tarea"
  accion: "Detener completamente, escalar inmediatamente"
  ejemplo: "No se sabe que tablas crear"

ALTO:
  descripcion: "Bloquea parte significativa"
  accion: "Detener esa parte, continuar resto si es posible"
  ejemplo: "Falta definicion de un campo importante"

MEDIO:
  descripcion: "Puede implementarse parcialmente"
  accion: "Implementar lo claro, marcar TODO para lo ambiguo"
  ejemplo: "Mensaje de error no definido"

BAJO:
  descripcion: "Detalle menor"
  accion: "Implementar con valor razonable, documentar asuncion"
  ejemplo: "Longitud maxima de campo de texto"
```

---

## CUANDO NO ESCALAR

```yaml
NO_escalar_si:
  - La informacion ESTA en la documentacion (buscar mejor)
  - Es una decision puramente tecnica (consultar Architecture-Analyst)
  - Es un bug (reportar como bug, no como ambiguedad)
  - Es una mejora sugerida (documentar como sugerencia)

CONSULTAR_otros_agentes_si:
  - Duda tecnica: Architecture-Analyst
  - Duda de implementacion existente: Agente de capa
  - Duda de proceso: Orquestador/Tech-Leader
```

---

## METRICAS DE ESCALAMIENTO

```yaml
metricas_a_monitorear:
  - Numero de escalamientos por tarea
  - Tiempo promedio de respuesta del PO
  - Escalamientos que podian evitarse (documentacion existia)
  - Escalamientos que resultaron en cambio de spec

objetivo:
  - Reducir escalamientos innecesarios
  - Mejorar calidad de documentacion
  - Minimizar bloqueos por falta de informacion
```

---

## REFERENCIAS

- **Principio relacionado:** @PRINCIPIOS/PRINCIPIO-NO-ASUMIR.md
- **Doc Primero:** @PRINCIPIOS/PRINCIPIO-DOC-PRIMERO.md
- **Ciclo de tarea:** @SIMCO/SIMCO-TAREA.md

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
