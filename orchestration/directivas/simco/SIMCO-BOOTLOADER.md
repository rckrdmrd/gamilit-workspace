# SIMCO-BOOTLOADER.md

**Sistema:** NEXUS v4.1 - Protocolo de Arranque (Standalone Gamilit)
**Version:** 2.0.0
**Fecha:** 2026-02-11
**Aplica a:** Todos los agentes operando en gamilit (Claude Code, Gemini CLI, Trae, Windsurf)

---

## 1. Proposito

El protocolo BOOTLOADER define la secuencia de arranque que **todo agente** debe seguir al iniciar una sesion de trabajo. Garantiza:

- Contexto base cargado correctamente
- Estado previo recuperado si existe
- Dominio de trabajo identificado
- Recursos necesarios disponibles

---

## 2. Secuencia de 5 Pasos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOOTLOADER - 5 PASOS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PASO 1: Cargar L0 (Sistema)                                       │
│  ════════════════════════════                                       │
│  ├── Leer CLAUDE.md                                                │
│  ├── Leer SIMCO-TAREA.md                                           │
│  └── Verificar: Aliases disponibles                                │
│                         │                                          │
│                         ▼                                          │
│  PASO 2: Identificar Proyecto                                      │
│  ════════════════════════════                                       │
│  ├── Leer tarea asignada                                           │
│  ├── Determinar proyecto(s) afectados                              │
│  └── Si workspace-level: Saltar a PASO 5                           │
│                         │                                          │
│                         ▼                                          │
│  PASO 3: Cargar L1 (Proyecto)                                      │
│  ════════════════════════════                                       │
│  ├── Leer PROJECT-CONTEXT.md                                     │
│  ├── Leer PROXIMA-ACCION.md (si existe)                            │
│  ├── Leer MASTER_INVENTORY.yml                                     │
│  └── Verificar: Variables del proyecto                             │
│                         │                                          │
│                         ▼                                          │
│  PASO 4: Determinar Dominio                                        │
│  ════════════════════════════                                       │
│  ├── Clasificar tarea (DDL, Backend, Frontend, Docs)               │
│  ├── Cargar L2 correspondiente (SIMCO del dominio)                 │
│  └── Cargar inventario del dominio                                 │
│                         │                                          │
│                         ▼                                          │
│  PASO 5: Iniciar Tarea                                             │
│  ════════════════════════════                                       │
│  ├── Crear carpeta de tarea si no existe                           │
│  ├── Ejecutar FASE 0 de CAPVED (identificacion de nivel)           │
│  └── Proceder con FASE C (Contexto)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detalle por Paso

### PASO 1: Cargar L0 (Sistema)

**Objetivo:** Establecer contexto base del workspace.

**Archivos a Cargar (Standalone Gamilit):**
```
OBLIGATORIO:
├── CLAUDE.md                                    [~4000 tokens]
├── orchestration/directivas/simco/SIMCO-TAREA.md [~1500 tokens]
├── orchestration/CONTEXT-MAP.yml                [~800 tokens]
└── Perfil de agente (compact si subagente)      [~500 tokens]
                                          Total: ~6800 tokens
```

**Verificaciones:**
- [ ] Aliases del workspace disponibles (@FULL, @QUICK, etc.)
- [ ] Reglas criticas leidas (Fetch, Commit+Push, Credenciales)
- [ ] CONTEXT-MAP accesible para referencias

**Si falla:** DETENER. No continuar sin L0 cargado.

---

### PASO 2: Identificar Proyecto

**Objetivo:** Determinar ambito de trabajo.

**Logica de Decision (Standalone):**
```
Gamilit es STANDALONE - proyecto unico:
  → proyecto = "gamilit" (siempre)
  → NO hay multi-proyecto ni propagacion
  → Identificar DOMINIO de la tarea (DDL, Backend, Frontend, Docs, DevOps)
```

---

### PASO 3: Cargar L1 (Proyecto)

**Objetivo:** Cargar contexto especifico del proyecto.

**Archivos a Cargar (Gamilit Standalone):**
```
OBLIGATORIO:
├── orchestration/PROJECT-CONTEXT.md              [~2000 tokens]
├── orchestration/PROXIMA-ACCION.md (si existe)   [~500 tokens]
└── orchestration/inventarios/MASTER_INVENTORY.yml [~1500 tokens]
                                          Total: ~4000 tokens
```

**Verificaciones:**
- [ ] Variables del proyecto conocidas (rutas, stack, convenciones)
- [ ] Estado previo recuperado de PROXIMA-ACCION.md
- [ ] Inventario disponible para verificacion anti-duplicacion

**Si PROXIMA-ACCION.md existe:**
- Leer estado actual
- Verificar si hay tarea en progreso
- Evaluar si continuar o iniciar nueva

---

### PASO 4: Determinar Dominio

**Objetivo:** Cargar SIMCO y recursos del dominio.

**Clasificacion de Tarea:**
```yaml
DDL:
  keywords: [tabla, columna, schema, constraint, migracion, sql]
  simco: SIMCO-DDL.md
  inventario: DATABASE_INVENTORY.yml

Backend:
  keywords: [entity, service, controller, endpoint, api, dto]
  simco: SIMCO-BACKEND.md
  inventario: BACKEND_INVENTORY.yml

Frontend:
  keywords: [componente, pagina, hook, form, ui, react]
  simco: SIMCO-FRONTEND.md
  inventario: FRONTEND_INVENTORY.yml

Documentacion:
  keywords: [docs, readme, guia, manual]
  simco: SIMCO-DOCUMENTAR.md
  inventario: N/A

Orquestacion:
  keywords: [tarea, agente, prompt, delegacion]
  simco: SIMCO-PROMPTS-AGENTES.md
  inventario: N/A
```

**Archivos a Cargar:**
```
├── orchestration/directivas/simco/SIMCO-{DOMINIO}.md
├── projects/{proyecto}/orchestration/inventarios/{DOMINIO}_INVENTORY.yml
└── orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md (si DDL/Backend/Frontend)
                                          Total: ~4000 tokens
```

---

### PASO 5: Iniciar Tarea

**Objetivo:** Preparar ejecucion de la tarea.

**Acciones:**
1. **Crear carpeta de tarea** (si no existe):
   ```
   orchestration/tareas/TASK-{YYYY-MM-DD}-{NNN}/
   ├── METADATA.yml
   └── fases/
   ```

2. **Ejecutar FASE 0 - Identificacion de Nivel:**
   ```
   ¿Es tarea de workspace? → Nivel 0
   ¿Es tarea de proyecto standalone? → Nivel 1
   ¿Es tarea que afecta verticales? → Nivel 2
   ¿Es subtarea de tarea mayor? → Nivel 3
   ```

3. **Proceder con FASE C (Contexto):**
   - Clasificar tipo de tarea
   - Vincular con tarea padre si existe
   - Establecer criterios de exito

---

## 4. Por Tipo de Agente

### Claude Code (Orquestador)

```
BOOTLOADER COMPLETO (5 pasos)
├── Puede saltar PASO 4 si es orquestacion pura
├── Siempre actualiza PROXIMA-ACCION.md al terminar
└── Coordina BOOTLOADER de subagentes
```

### Gemini CLI (Analista)

```
BOOTLOADER REDUCIDO (pasos 1, 3, 4)
├── Recibe proyecto ya identificado de Claude
├── Carga solo dominio asignado
└── NO crea/modifica PROXIMA-ACCION.md
```

### Trae (Planificador)

```
BOOTLOADER REDUCIDO (pasos 1, 3, 4)
├── Enfoque en generar planes atomicos
├── Carga contexto segun delegacion
└── Respeta presupuesto de tokens estricto
```

### Windsurf (Ejecutor)

```
BOOTLOADER MINIMO (solo paso 1)
├── Recibe contexto en prompt
├── NO carga archivos adicionales
├── Ejecuta literalmente lo especificado
└── NO toma decisiones de contexto
```

---

## 5. Recuperacion de Sesion

Si el agente detecta compactacion o reinicio:

```
1. Ejecutar PASO 1 (L0 siempre)
         │
         ▼
2. Leer PROXIMA-ACCION.md del proyecto
         │
         ▼
3. Cargar archivos listados en "Contexto Critico"
         │
         ▼
4. Verificar estado (git status, build)
         │
         ▼
5. Continuar desde "Siguiente Paso"
```

**Tiempo esperado de recuperacion:** < 3 minutos

---

## 6. Checklist de Arranque

### Para Orquestador (Claude Code)

- [ ] PASO 1: CLAUDE.md cargado
- [ ] PASO 2: Proyecto(s) identificado(s)
- [ ] PASO 3: PROJECT-CONTEXT.md leido
- [ ] PASO 3: PROXIMA-ACCION.md verificado
- [ ] PASO 4: Dominio determinado
- [ ] PASO 4: SIMCO del dominio cargado
- [ ] PASO 5: Carpeta de tarea lista
- [ ] PASO 5: FASE 0 ejecutada

### Para Subagentes

- [ ] Contexto recibido de orquestador
- [ ] Archivos especificos cargados
- [ ] Limites de tokens respetados
- [ ] Objetivo claro entendido

---

## 7. Errores Comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| Alias no reconocido | L0 no cargado | Volver a PASO 1 |
| Variables faltantes | L1 no cargado | Ejecutar PASO 3 |
| SIMCO incorrecto | Dominio mal clasificado | Revisar PASO 4 |
| Contexto perdido | Compactacion | Seguir protocolo de recuperacion |

---

## 8. Referencias

- `@NEXUS` - SIMCO-CONTEXT-MANAGEMENT-V2.md
- `@CONTEXT-MAP` - orchestration/CONTEXT-MAP.yml
- `@PROXIMA-ACCION` - Template de checkpoint
- `@SIMCO-TAREA` - Punto de entrada de tareas

---

*SIMCO-BOOTLOADER.md - Protocolo de Arranque NEXUS v4.1*
*Obligatorio para todos los agentes operando en Gamilit (Standalone)*
