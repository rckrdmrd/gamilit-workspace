# PRINCIPIO: NO ASUMIR

**Version:** 1.0.0
**Fecha:** 2025-12-12
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los agentes sin excepcion

---

## DECLARACION DEL PRINCIPIO

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   "Si no esta documentado, NO asumir. PREGUNTAR."                    ║
║                                                                       ║
║   Nunca implementar basado en suposiciones.                          ║
║   Nunca inventar requisitos.                                          ║
║   Nunca tomar decisiones de negocio sin autorizacion.                ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## REGLA INQUEBRANTABLE

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   PROHIBIDO:                                                         │
│   - Asumir valores/comportamientos no documentados                  │
│   - Inventar requisitos o especificaciones                          │
│   - Tomar decisiones de negocio sin consultar                       │
│   - Implementar "lo que parece logico" sin confirmacion             │
│   - Interpretar ambiguedad a favor de una opcion                    │
│   - Completar huecos de documentacion con suposiciones              │
│                                                                      │
│   OBLIGATORIO:                                                       │
│   - Detener trabajo cuando falta informacion critica                │
│   - Documentar la pregunta claramente                               │
│   - Escalar al Product Owner                                         │
│   - Esperar respuesta antes de continuar                            │
│   - Documentar la decision antes de implementar                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## POR QUE ESTE PRINCIPIO

```yaml
problema:
  - Implementaciones basadas en suposiciones causan retrabajo
  - Asunciones incorrectas generan bugs de negocio
  - Decisiones no autorizadas crean deuda tecnica
  - Interpretaciones personales divergen del objetivo real

consecuencias_de_asumir:
  - Codigo que no cumple requisitos reales
  - Retrabajo costoso cuando se descubre la asuncion incorrecta
  - Perdida de confianza del cliente/PO
  - Documentacion desalineada con implementacion
  - Bugs dificiles de rastrear (parecen funcionar pero no son correctos)

beneficios_de_preguntar:
  - Implementacion correcta desde el inicio
  - Documentacion completa y precisa
  - Menos retrabajo
  - Mayor confianza del equipo
  - Decisiones respaldadas por autoridad correcta
```

---

## CUANDO APLICA ESTE PRINCIPIO

### Casos que REQUIEREN Escalamiento

```yaml
informacion_faltante:
  - Tabla mencionada sin definicion de columnas
  - Endpoint sin especificacion de payload
  - Pagina sin definicion de componentes
  - Regla de negocio incompleta
  - Valores de enum no especificados
  - Validaciones no documentadas
  - Comportamiento de error no definido
  - Limites/umbrales no especificados

ambiguedad:
  - Requisito interpretable de multiples formas
  - Contradiccion entre documentos
  - Alcance no claramente definido
  - Criterios de aceptacion vagos
  - Casos edge no cubiertos

decisiones_de_negocio:
  - Cambio que afecta UX
  - Modificacion de flujos existentes
  - Nuevas restricciones
  - Priorizacion entre alternativas
  - Trade-offs con impacto en usuario
```

### Casos que NO Requieren Escalamiento

```yaml
decisiones_tecnicas_puras:
  - Nombre de variable interna
  - Estructura de codigo (si no afecta API)
  - Optimizaciones de rendimiento
  - Refactorizaciones internas
  → Consultar Architecture-Analyst si hay duda

implementacion_clara:
  - Documentacion existe y es clara
  - No hay ambiguedad
  - Comportamiento esta especificado
  → Proceder con implementacion

estandares_definidos:
  - Nomenclatura definida en directivas
  - Patrones definidos en SIMCO
  - Convenciones del proyecto
  → Seguir lo establecido
```

---

## COMO APLICAR ESTE PRINCIPIO

### Paso 1: Buscar Exhaustivamente

```yaml
ANTES_de_escalar:
  buscar_en:
    - docs/01-requerimientos/
    - docs/02-especificaciones-tecnicas/
    - docs/90-adr/
    - orchestration/inventarios/
    - Codigo existente relacionado
    - Historial de trazas

  tiempo_minimo: "10-15 minutos de busqueda activa"
```

### Paso 2: Si No se Encuentra, Documentar

```markdown
## INFORMACION NO ENCONTRADA

**Busqueda realizada:**
- [X] docs/01-requerimientos/ - No encontrado
- [X] docs/02-especificaciones-tecnicas/ - Mencionado pero incompleto
- [X] ADRs - No hay ADR relacionado
- [X] Inventarios - N/A

**Conclusion:** Informacion no disponible, requiere escalamiento
```

### Paso 3: Escalar Correctamente

```markdown
## CONSULTA AL PRODUCT OWNER

**Fecha:** {fecha}
**Agente:** {agente}
**Tarea:** [{ID}] {titulo}

### Contexto
{que estoy haciendo}

### Lo que encontre
{informacion parcial disponible}

### Lo que falta / es ambiguo
{descripcion clara del gap}

### Pregunta especifica
{pregunta concreta}

### Opciones (si las identifique)
1. {opcion A}
2. {opcion B}

### Impacto
{que pasa si no se resuelve}
```

### Paso 4: Esperar y Documentar Respuesta

```yaml
MIENTRAS_espero:
  - NO implementar esa parte
  - Continuar con otras tareas si es posible
  - Marcar tarea como BLOQUEADA si es critico

CUANDO_recibo_respuesta:
  - Documentar la decision
  - Actualizar documentacion correspondiente
  - Crear ADR si es decision significativa
  - Continuar implementacion
```

---

## FLUJO DE DECISION

```
┌─────────────────────────────────────┐
│  Encontrar informacion faltante     │
│  o ambiguedad                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Buscar exhaustivamente en docs     │
│  (10-15 minutos minimo)             │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │ Encontrado? │
        └──────┬──────┘
               │
      ┌────────┴────────┐
      │ SI              │ NO
      ▼                 ▼
┌───────────┐    ┌─────────────────────┐
│ Proceder  │    │ DETENER             │
│ con       │    │ Documentar pregunta │
│ implement │    │ Escalar al PO       │
└───────────┘    └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ ESPERAR respuesta   │
                 │ (NO asumir)         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Documentar decision │
                 │ Continuar           │
                 └─────────────────────┘
```

---

## EJEMPLOS

### Ejemplo CORRECTO

```yaml
situacion: "DDL menciona campo 'status' pero no especifica valores"

proceso_correcto:
  1. Buscar en docs/: No encontrado
  2. Buscar en specs: Solo dice "tiene status"
  3. Buscar en ADRs: No hay ADR
  4. Conclusion: Escalar
  5. Documentar: "Cuales son los valores validos de status?"
  6. Esperar respuesta
  7. PO responde: "['draft', 'active', 'completed']"
  8. Documentar decision
  9. Implementar con valores correctos
```

### Ejemplo INCORRECTO

```yaml
situacion: "DDL menciona campo 'status' pero no especifica valores"

proceso_incorrecto:
  1. "Parece que deberian ser 'pending', 'done'"
  2. Implementar con esos valores
  3. PO revisa y dice: "No, son 'draft', 'active', 'completed'"
  4. Retrabajo: migration, seed update, tests, backend, frontend
  5. Tiempo perdido: 2-4 horas
```

---

## CONSECUENCIAS DE IGNORAR

```yaml
ignorar_este_principio:
  retrabajo:
    - Implementacion incorrecta debe rehacerse
    - Tests basados en asuncion incorrecta
    - Documentacion desalineada

  bugs_de_negocio:
    - Funcionalidad no cumple expectativas
    - Comportamiento inesperado para usuarios
    - Datos incorrectos en sistema

  deuda_tecnica:
    - Codigo parche sobre asuncion incorrecta
    - Inconsistencias acumuladas
    - Complejidad innecesaria

  perdida_de_confianza:
    - PO pierde confianza en implementaciones
    - Mas revision necesaria
    - Ciclos de feedback mas largos
```

---

## CHECKLIST RAPIDO

```
Antes de implementar algo no 100% claro:

[ ] Busque en documentacion? (10-15 min minimo)
[ ] Revise specs, ADRs, inventarios?
[ ] Sigue sin estar claro?
[ ] Documente la pregunta?
[ ] Escale al PO?
[ ] Espere respuesta?
[ ] Documente la decision?
[ ] Actualice documentacion correspondiente?

Solo entonces: Proceder con implementacion
```

---

## RELACION CON OTROS PRINCIPIOS

```yaml
PRINCIPIO-DOC-PRIMERO:
  - Leer docs antes de implementar
  - Si docs estan incompletos -> NO-ASUMIR aplica

PRINCIPIO-CAPVED:
  - Fase A (Analisis): Identificar informacion faltante
  - Fase V (Validacion): NO aprobar sin informacion completa

PRINCIPIO-VALIDACION-OBLIGATORIA:
  - Validar que implementacion coincide con decision documentada
```

---

## REFERENCIAS SIMCO

- **@ESCALAMIENTO** - Proceso completo de escalamiento
- **@DOC_PRIMERO** - Consultar documentacion primero
- **@TAREA** - Ciclo de vida de tareas

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningun agente.**

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Fundamental
