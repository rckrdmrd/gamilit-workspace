# SIMCO: INICIALIZACION DE AGENTES

**Version:** 1.5.0
**Sistema:** SIMCO + CAPVED + NEXUS v4.1
**Proposito:** Definir el proceso de bootstrap y recovery para cualquier agente
**Actualizado:** 2026-01-20

---

## PRINCIPIO FUNDAMENTAL

> **Un agente inicializado correctamente NO alucina porque tiene TODO el contexto necesario antes de actuar.**
> **Un agente que detecta compactacion ejecuta RECOVERY antes de continuar.**

---

## PROMPT DE INICIALIZACION (Template Universal)

```markdown
Seras {PERFIL_AGENTE} trabajando en el proyecto {PROYECTO}
para realizar: {DESCRIPCION_TAREA}

Antes de actuar, ejecuta el protocolo CCA (Carga de Contexto Automatica).
```

**Ejemplo real:**
```markdown
Seras Backend-Agent trabajando en el proyecto gamilit
para realizar: Crear el modulo de notificaciones con endpoints CRUD

Antes de actuar, ejecuta el protocolo CCA (Carga de Contexto Automatica).
```

---

## PROTOCOLO CCA: CARGA DE CONTEXTO AUTOMATICA

### Fase 0: IDENTIFICACION (Automatica)

```yaml
Al recibir prompt de inicializacion, extraer:
  PERFIL: {tipo de agente mencionado}
  PROYECTO: {nombre del proyecto}
  TAREA: {descripcion de la tarea}
  OPERACION: {inferir: CREAR | MODIFICAR | VALIDAR | INVESTIGAR}
  DOMINIO: {inferir: DDL | BACKEND | FRONTEND | MIXTO}
```

### Fase 1: CARGA NIVEL CORE (Obligatorio - ~5 min)

```
LEER EN ORDEN ESTRICTO:

1. PRINCIPIOS FUNDAMENTALES
   └── orchestration/directivas/principios/
       ├── PRINCIPIO-CAPVED.md
       ├── PRINCIPIO-DOC-PRIMERO.md
       ├── PRINCIPIO-ANTI-DUPLICACION.md
       ├── PRINCIPIO-VALIDACION-OBLIGATORIA.md
       └── PRINCIPIO-NO-ASUMIR.md

2. MI PERFIL
   └── orchestration/agents/perfiles/PERFIL-{MI-TIPO}.md

3. INDICE SIMCO
   └── orchestration/directivas/simco/_INDEX.md

4. SISTEMA DE ALIASES
   └── orchestration/referencias/ALIASES.yml
```

### Fase 2: CARGA NIVEL PROYECTO (Obligatorio - ~5 min)

```
LEER EN ORDEN:

5. CONTEXTO DEL PROYECTO
   └── orchestration/PROJECT-CONTEXT.md
       Extraer:
       - Variables resueltas
       - Alias resueltos
       - Stack tecnologico
       - Estructura del proyecto

6. PROXIMA ACCION
   └── orchestration/PROXIMA-ACCION.md
       Verificar:
       - ¿Mi tarea es la proxima prioridad?
       - ¿Hay dependencias previas?
       - ¿Hay contexto de sesiones anteriores?

7. INVENTARIO RELEVANTE
   └── orchestration/inventarios/
       Segun dominio:
       - DDL: DATABASE_INVENTORY.yml
       - Backend: BACKEND_INVENTORY.yml
       - Frontend: FRONTEND_INVENTORY.yml
       - Mixto: MASTER_INVENTORY.yml
```

### Fase 3: CARGA NIVEL OPERACION (Segun tarea - ~3 min)

```
LEER SIMCO DE OPERACION:

8. SIMCO-TAREA.md (Si es tarea que genera commit)

9. SIMCO BASE (segun operacion inferida)
   └── Crear algo nuevo → SIMCO-CREAR.md
       Modificar existente → SIMCO-MODIFICAR.md
       Validar/revisar → SIMCO-VALIDAR.md
       Buscar/investigar → SIMCO-BUSCAR.md
       Documentar → SIMCO-DOCUMENTAR.md

10. SIMCO DE DOMINIO (si aplica)
   └── Base de datos → SIMCO-DDL.md
       Backend NestJS → SIMCO-BACKEND.md
       Frontend React → SIMCO-FRONTEND.md
```

### Fase 4: CARGA NIVEL TAREA (Especifico - ~5 min)

```
LEER DOCUMENTACION RELEVANTE:

11. DOCUMENTACION DEL PROYECTO
    └── docs/
        Buscar especificaciones relacionadas

12. CODIGO EXISTENTE RELACIONADO
    └── Buscar patrones similares ya implementados

13. DEPENDENCIAS DE LA TAREA
    └── Identificar que debe existir ANTES
```

---

## DETECCION DE COMPACTACION

### Senales de Contexto Compactado

```yaml
SENALES_CRITICAS:
  - "No recuerdo haber ejecutado las fases anteriores del CCA"
  - "Recibo un resumen de 'conversacion anterior' del sistema"
  - "No puedo resolver un @ALIAS que deberia conocer"
  - "Desconozco variables que deberia tener resueltas"
  - "No puedo identificar mi fase CAPVED actual"

ACCION:
  pregunta: "Recuerdo mi PERFIL, PROYECTO, TAREA y FASE CAPVED?"
  si_falta_algo: "Ejecutar RECOVERY inmediatamente"
```

---

## PROTOCOLO DE RECOVERY

### Cuando Ejecutar

- Despues de detectar compactacion
- Al inicio de sesion nueva con tarea pendiente
- Cuando el usuario indica "continua donde quedaste"

### Proceso de Recovery en 3 Fases

```yaml
RECOVERY_FASE_1_CRITICO:
  tiempo: "~2 min"
  tokens: "~3000"
  objetivo: "Restaurar identidad y ubicacion"
  cargar:
    - Mi perfil
    - Ultimo mensaje del usuario o PROXIMA-ACCION.md
    - PRINCIPIO-CAPVED.md

RECOVERY_FASE_2_OPERATIVO:
  tiempo: "~2 min"
  tokens: "~2000"
  objetivo: "Restaurar capacidad de ejecucion"
  cargar:
    - SIMCO-TAREA.md (si aplica)
    - SIMCO-{DOMINIO}.md (segun tarea)
    - Inventario relevante

RECOVERY_FASE_3_PROYECTO:
  tiempo: "~2 min"
  tokens: "~2000"
  objetivo: "Restaurar contexto especifico"
  cargar:
    - PROJECT-CONTEXT.md
    - docs/ especificos de la tarea
    - Estado de archivos modificados
```

### Notificacion al Usuario

```markdown
[RECARGA DE CONTEXTO]

Detecte perdida de contexto. Ejecutando recovery:

1. [x] Perfil recuperado: {PERFIL}
2. [x] Proyecto identificado: {PROYECTO}
3. [x] Tarea actual: {TAREA_ID}
4. [x] Fase CAPVED: {FASE}
5. [x] Directivas SIMCO cargadas

Recovery completado (~{X} tokens).

Continuando desde: {descripcion del punto de continuacion}
```

---

## CHECKLIST DE INICIALIZACION

```markdown
## CHECKLIST CCA - {PERFIL} en {PROYECTO}

### Fase 1: Core
- [ ] Lei PRINCIPIO-CAPVED.md
- [ ] Lei PRINCIPIO-DOC-PRIMERO.md
- [ ] Lei PRINCIPIO-ANTI-DUPLICACION.md
- [ ] Lei PRINCIPIO-VALIDACION-OBLIGATORIA.md
- [ ] Lei PRINCIPIO-NO-ASUMIR.md
- [ ] Lei mi PERFIL-{TIPO}.md
- [ ] Lei _INDEX.md de SIMCO
- [ ] Lei ALIASES.yml

### Fase 2: Proyecto
- [ ] Lei PROJECT-CONTEXT.md
- [ ] Lei PROXIMA-ACCION.md
- [ ] Lei inventario relevante

### Fase 3: Operacion
- [ ] Identifique si es HU
- [ ] Identifique operacion: {CREAR|MODIFICAR|VALIDAR|...}
- [ ] Lei SIMCO-{operacion}.md
- [ ] Lei SIMCO-{dominio}.md (si aplica)

### Fase 4: Tarea
- [ ] Consulte docs/ relevante
- [ ] Busque patrones existentes
- [ ] Identifique dependencias

### READY TO EXECUTE
- [ ] Tengo TODO el contexto necesario
- [ ] Se que debo hacer
- [ ] Se que NO debo hacer
```

---

## ANTI-PATRONES (QUE NO HACER)

```yaml
NUNCA:
  - Empezar a codificar sin completar CCA
  - Asumir que algo existe sin verificar inventario
  - Crear sin consultar docs/ primero
  - Ignorar principios porque "es una tarea simple"
  - Saltarse validaciones
  - Continuar tras compactacion sin ejecutar recovery

ERRORES_COMUNES:
  - "Ya se como hacerlo" → Verificar docs/ de todas formas
  - "Es igual al otro modulo" → Verificar diferencias en specs
  - "Despues documento" → Documentar durante, no despues
  - "El build puede fallar temporalmente" → NUNCA dejar build roto
```

---

## TIEMPO ESTIMADO

| Fase | Tiempo | Archivos |
|------|--------|----------|
| Core | ~5 min | 8 archivos |
| Proyecto | ~5 min | 3-4 archivos |
| Operacion | ~3 min | 1-2 archivos |
| Tarea | ~5 min | Variable |
| **TOTAL CCA** | **~18 min** | **~15 archivos** |
| Recovery Critico | ~2 min | ~3 archivos |
| Recovery Completo | ~6 min | ~7 archivos |

> **INVERSION:** 18 minutos de lectura inicial, 6 minutos max de recovery
> **RETORNO:** Cero alucinaciones, cero retrabajos, codigo correcto desde el inicio

---

## REFERENCIAS

| Documento | Alias | Proposito |
|-----------|-------|-----------|
| SIMCO-CONTEXT-MANAGEMENT-V2.md | @NEXUS | NEXUS v4.1 - Gestion de Contexto |
| PRINCIPIO-CAPVED.md | @CAPVED | Ciclo de vida de tareas |
| SIMCO-QUICK-REFERENCE.md | @QUICK_REF | Referencia rapida optimizada |

---

**Version:** 1.5.0 | **Sistema:** SIMCO + CAPVED + Context Engineering | **Tipo:** Directiva de Inicializacion
