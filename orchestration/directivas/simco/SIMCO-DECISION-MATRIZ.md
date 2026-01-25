# SIMCO-DECISION-MATRIZ

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Sistema:** SIMCO + CCA + CAPVED + Niveles + Economía de Tokens
**Propósito:** Clarificar qué directiva SIMCO ejecutar según el tipo de trabajo

---

## PROBLEMA QUE RESUELVE

Cuando un agente recibe una tarea, puede confundirse sobre:
- ¿Debo ejecutar CAPVED completo (SIMCO-TAREA)?
- ¿O solo la operacion especifica (SIMCO-CREAR/MODIFICAR)?
- ¿Cuando uso SIMCO-DDL vs SIMCO-BACKEND vs SIMCO-FRONTEND?

Esta matriz elimina la ambiguedad.

---

## MATRIZ DE DECISION PRINCIPAL

```
┌────────────────────────────────────────┬───────────────────────┬──────────────────────────┐
│ Tipo de Trabajo                        │ PRIMERO Ejecuta       │ LUEGO Ejecuta            │
├────────────────────────────────────────┼───────────────────────┼──────────────────────────┤
│ HU completa que crea archivos          │ SIMCO-TAREA (CAPVED)  │ SIMCO-CREAR + SIMCO-*    │
│ HU completa que modifica codigo        │ SIMCO-TAREA (CAPVED)  │ SIMCO-MODIFICAR + SIMCO-*│
│ Subtarea DENTRO de una HU              │ Directamente          │ SIMCO-{operacion}        │
│ Tarea de exploracion/investigacion     │ SIMCO-BUSCAR          │ (no genera commit)       │
│ Validacion antes de marcar Done        │ SIMCO-VALIDAR         │ (gate obligatorio)       │
│ Documentacion posterior                │ SIMCO-DOCUMENTAR      │ SIMCO-PROPAGACION        │
│ Reutilizar algo del catalogo           │ SIMCO-REUTILIZAR      │ (antes de crear)         │
└────────────────────────────────────────┴───────────────────────┴──────────────────────────┘
```

---

## ARBOL DE DECISION VISUAL

```
¿Es una HU completa o tarea delegada?
│
├─► HU COMPLETA (soy agente principal)
│   │
│   └─► SIEMPRE ejecutar SIMCO-TAREA.md primero
│       │
│       ├─► Fase C: Cargar contexto
│       ├─► Fase A: Analizar impacto
│       ├─► Fase P: Planificar subtareas
│       ├─► Fase V: Validar plan (NO DELEGAR)
│       ├─► Fase E: Ejecutar (delegar si necesario)
│       │   │
│       │   └─► Para cada subtarea, usar SIMCO-{operacion}
│       │
│       └─► Fase D: Documentar y propagar
│
├─► SUBTAREA DELEGADA (soy subagente)
│   │
│   └─► Verificar: ¿Tengo contexto completo?
│       │
│       ├─► SI: Ejecutar SIMCO-{operacion} directamente
│       │   │
│       │   └─► ¿Que operacion?
│       │       ├─► Crear archivo nuevo → SIMCO-CREAR
│       │       ├─► Modificar existente → SIMCO-MODIFICAR
│       │       ├─► Buscar informacion → SIMCO-BUSCAR
│       │       └─► Validar resultado → SIMCO-VALIDAR
│       │
│       └─► NO: Solicitar contexto faltante al orquestador
│
└─► TAREA DE INVESTIGACION
    │
    └─► Usar SIMCO-BUSCAR (no genera commit)
```

---

## OPERACIONES ESPECIALIZADAS POR CAPA

### ¿Cual SIMCO de capa usar?

```
┌─────────────────────────┬────────────────────┬─────────────────────────┐
│ Estoy trabajando en     │ Usar SIMCO         │ Complementar con        │
├─────────────────────────┼────────────────────┼─────────────────────────┤
│ Base de datos (DDL)     │ SIMCO-DDL.md       │ SIMCO-CREAR/MODIFICAR   │
│ Backend (NestJS)        │ SIMCO-BACKEND.md   │ SIMCO-CREAR/MODIFICAR   │
│ Frontend (React)        │ SIMCO-FRONTEND.md  │ SIMCO-CREAR/MODIFICAR   │
│ Documentacion           │ SIMCO-DOCUMENTAR   │ SIMCO-PROPAGACION       │
│ Catalogo                │ SIMCO-REUTILIZAR   │ @CATALOG                │
└─────────────────────────┴────────────────────┴─────────────────────────┘
```

---

## EJEMPLOS CONCRETOS

### Ejemplo 1: HU "Crear sistema de notificaciones"

```yaml
Tipo: HU completa
Agente: Orquestador recibe la tarea

Flujo correcto:
  1. SIMCO-TAREA.md → Ejecutar CAPVED completo
     - C: Cargar CONTEXTO-PROYECTO.md
     - A: Analizar dependencias (¿existe en @CATALOG?)
     - P: Planificar subtareas (DDL, Backend, Frontend)
     - V: Validar plan (YO, no delego)
     - E: Delegar subtareas
     - D: Documentar resultado

  2. Delegar a Database-Agent:
     - SIMCO-DDL.md + SIMCO-CREAR.md
     - Crear tabla notifications

  3. Delegar a Backend-Agent:
     - SIMCO-BACKEND.md + SIMCO-CREAR.md
     - Crear NotificationEntity, NotificationService

  4. Delegar a Frontend-Agent:
     - SIMCO-FRONTEND.md + SIMCO-CREAR.md
     - Crear NotificationList component

Flujo INCORRECTO:
  ❌ Saltar directamente a SIMCO-CREAR sin CAPVED
  ❌ Delegar Fase V a subagente
  ❌ No verificar @CATALOG primero
```

### Ejemplo 2: Subtarea "Crear tabla notifications"

```yaml
Tipo: Subtarea delegada
Agente: Database-Agent (subagente)

Contexto recibido:
  - Ya viene de CAPVED del orquestador
  - Tiene campos y tipos definidos
  - Sabe donde crear (schema)

Flujo correcto:
  1. SIMCO-DDL.md → Directrices de base de datos
  2. SIMCO-CREAR.md → Crear archivo nuevo
  3. Ejecutar carga limpia
  4. Documentar en inventario local

Flujo INCORRECTO:
  ❌ Ejecutar SIMCO-TAREA.md (ya lo hizo orquestador)
  ❌ Cambiar campos sin consultar
  ❌ Crear en schema diferente al especificado
```

### Ejemplo 3: Tarea de investigacion

```yaml
Tipo: Exploracion
Agente: Cualquiera

Pregunta: "¿Como funciona el sistema de auth actual?"

Flujo correcto:
  1. SIMCO-BUSCAR.md
  2. Buscar en @DDL, @BACKEND, docs/
  3. Reportar hallazgos
  4. NO hacer commits

Flujo INCORRECTO:
  ❌ Ejecutar SIMCO-TAREA.md para investigar
  ❌ Modificar archivos durante investigacion
```

---

## REGLAS DE ORO

### 1. SIMCO-TAREA es META-nivel

```
SIMCO-TAREA.md = Marco general (CAPVED)
SIMCO-{operacion}.md = Accion especifica

Siempre: SIMCO-TAREA primero SI eres agente principal de HU
Nunca: SIMCO-TAREA si eres subagente con contexto delegado
```

### 2. La operacion sigue al CAPVED

```
Despues de planificar en Fase P:
  - Cada subtarea tiene una operacion (CREAR, MODIFICAR)
  - Usar SIMCO-{operacion} para cada una
```

### 3. La capa complementa la operacion

```
Crear tabla:
  SIMCO-CREAR + SIMCO-DDL

Modificar endpoint:
  SIMCO-MODIFICAR + SIMCO-BACKEND

Crear componente:
  SIMCO-CREAR + SIMCO-FRONTEND
```

### 4. Validar SIEMPRE antes de Done

```
Antes de marcar tarea como completada:
  SIMCO-VALIDAR.md es obligatorio

Incluye:
  - Build pasa
  - Lint pasa
  - Tests pasan (si aplica)
  - Carga limpia (si DDL)
```

---

## CASOS ESPECIALES

### Caso: "Solo necesito agregar un campo a tabla existente"

```yaml
¿Es HU o subtarea?:
  - Si es HU independiente → SIMCO-TAREA primero
  - Si es parte de HU mayor → SIMCO-MODIFICAR + SIMCO-DDL

Nunca:
  - Saltarse analisis de impacto
  - Olvidar actualizar Entity si cambia DDL
```

### Caso: "Necesito crear algo que ya existe en catalogo"

```yaml
Flujo:
  1. SIMCO-BUSCAR → Verificar @CATALOG
  2. SI existe: SIMCO-REUTILIZAR
  3. NO existe: SIMCO-CREAR

Nunca:
  - Crear desde cero sin verificar catalogo
```

### Caso: "La tarea cambio durante ejecucion"

```yaml
Flujo:
  1. Detectar cambio
  2. Clasificar: ¿Es scope creep?
     - Detalle tecnico necesario → Continuar
     - Funcionalidad nueva → Crear HU derivada
  3. Documentar decision

Ver: Protocolo de Scope Creep en SIMCO-TAREA.md
```

---

## QUICK REFERENCE

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION RAPIDA                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Soy agente principal de HU?                                   │
│     SI → SIMCO-TAREA.md (CAPVED completo)                       │
│     NO → SIMCO-{operacion}.md directamente                      │
│                                                                  │
│  ¿Que operacion?                                                │
│     Crear nuevo      → SIMCO-CREAR                              │
│     Modificar        → SIMCO-MODIFICAR                          │
│     Buscar/investigar → SIMCO-BUSCAR                            │
│     Validar resultado → SIMCO-VALIDAR                           │
│     Documentar       → SIMCO-DOCUMENTAR                         │
│                                                                  │
│  ¿Que capa?                                                     │
│     Base de datos → + SIMCO-DDL                                 │
│     Backend       → + SIMCO-BACKEND                             │
│     Frontend      → + SIMCO-FRONTEND                            │
│                                                                  │
│  ¿Antes de crear?                                               │
│     SIEMPRE verificar @CATALOG primero                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## REFERENCIAS

- `SIMCO-TAREA.md` - Ciclo CAPVED completo
- `SIMCO-CREAR.md` - Crear archivos nuevos
- `SIMCO-MODIFICAR.md` - Modificar existentes
- `SIMCO-BUSCAR.md` - Investigacion
- `SIMCO-VALIDAR.md` - Validacion pre-Done
- `SIMCO-DDL.md` - Operaciones de base de datos
- `SIMCO-BACKEND.md` - Operaciones de backend
- `SIMCO-FRONTEND.md` - Operaciones de frontend
- `SIMCO-REUTILIZAR.md` - Usar catalogo

---

*Sistema SIMCO v2.2.0*
*Creado: 2025-12-08*
