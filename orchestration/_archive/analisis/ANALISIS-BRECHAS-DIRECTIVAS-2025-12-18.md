# ANALISIS HONESTO: BRECHAS EN DIRECTIVAS CREADAS

**Fecha:** 2025-12-18
**Tipo:** Autocritica de implementacion
**Estado:** Identificando gaps

---

## PREGUNTA DEL USUARIO

> "Uso el prompt 'tienes el perfil X, trabajaras dentro del proyecto Y, la tarea es Z' funciona esos cambios con ese prompt?"

---

## RESPUESTA HONESTA: NO COMPLETAMENTE

Las directivas creadas tienen **brechas significativas** que impiden que funcionen correctamente con ese flujo de prompt.

---

## BRECHAS IDENTIFICADAS

### BRECHA 1: Ubicacion Incorrecta

**Problema:**
```
UBICACION ACTUAL (INCORRECTA):
.claude/directivas/DIRECTIVA-FASES-ESTANDAR.md
.claude/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

UBICACION CORRECTA (PORTABLE):
orchestration/directivas/ o docs/directivas/
```

**Por que es problema:**
- `.claude/` es especifico de Claude Code, NO portable
- Si se migra el repositorio, `.claude/` puede no copiarse
- El sistema SIMCO ya tiene una ubicacion establecida: `orchestration/directivas/`
- Los subagentes NO leen automaticamente `.claude/`

### BRECHA 2: Duplicacion con CAPVED Existente

**Problema:**
```
SISTEMA EXISTENTE (SIMCO/CAPVED):
C - Contexto
A - Analisis
P - Planeacion
V - Validacion
E - Ejecucion
D - Documentacion
= 6 FASES

SISTEMA CREADO:
Fase 1: Planeacion inicial
Fase 2: Ejecucion de analisis
Fase 3: Planeacion de implementaciones
Fase 4: Validacion
Fase 5: Ejecucion
= 5 FASES (duplica y contradice)
```

**Por que es problema:**
- Ya existe PRINCIPIO-CAPVED.md en core/
- Crear otra directiva de fases causa confusion
- No se integra con el flujo SIMCO existente

### BRECHA 3: CLAUDE.md NO Es Leido Automaticamente

**Problema:**
```
ASUNCION INCORRECTA:
"CLAUDE.md se carga automaticamente al inicio de cada sesion"

REALIDAD:
- Claude Code lee .claude/settings.local.json para permisos
- NO lee automaticamente CLAUDE.md
- El usuario debe incluir CLAUDE.md en su prompt manualmente
```

**Por que es problema:**
- La persistencia asumida NO existe
- Al hacer /compact, CLAUDE.md NO se recarga automaticamente
- El usuario debe recordar leerlo cada vez

### BRECHA 4: Falta Mecanismo de Herencia

**Problema:**
```
SISTEMA EXISTENTE:
orchestration/00-guidelines/HERENCIA-SIMCO.md
  -> Define que hereda de core/orchestration/directivas/

SISTEMA CREADO:
.claude/directivas/
  -> NO tiene herencia definida
  -> NO se integra con SIMCO
  -> NO es cargado por subagentes
```

**Por que es problema:**
- Subagentes NO saben que deben leer .claude/
- No hay CCA Protocol para las nuevas directivas
- No hay aliases (@FASES, @DOC-DEFINITIVA)

### BRECHA 5: Prompt del Usuario NO Funcionara

**Prompt del usuario:**
> "Tienes el perfil X, trabajaras dentro del proyecto Y, la tarea es Z"

**Lo que necesita para funcionar:**

```yaml
1. El perfil X debe tener REFERENCIA EXPLICITA a:
   - Directivas a leer (rutas completas)
   - Orden de lectura
   - Principios obligatorios

2. El proyecto Y debe tener:
   - CONTEXTO-PROYECTO.md con variables
   - HERENCIA-SIMCO.md que incluya nuevas directivas
   - orchestration/directivas/ con directivas locales

3. La tarea Z debe activar:
   - CCA Protocol (cargar contexto)
   - SIMCO-TAREA.md (ciclo de vida)
   - Las fases correspondientes
```

**Lo que cree:**
- Directivas en .claude/ (no portable)
- Sin integracion con HERENCIA-SIMCO.md
- Sin aliases para referenciar
- Sin CCA Protocol

---

## COMPARACION: LO QUE CREE vs LO QUE NECESITA

| Aspecto | Lo que cree | Lo que necesita |
|---------|-------------|-----------------|
| **Ubicacion** | `.claude/directivas/` | `orchestration/directivas/` o `docs/` |
| **Sistema de fases** | 5 fases nuevas | Usar CAPVED existente (6 fases) |
| **Persistencia** | CLAUDE.md (no funciona) | CCA Protocol + HERENCIA-SIMCO |
| **Herencia** | No definida | HERENCIA-SIMCO.md actualizado |
| **Aliases** | No creados | @FASES, @DOC-DEFINITIVA |
| **Subagentes** | No saben que leer | Template con referencias explicitas |

---

## LO QUE SI FUNCIONA

### Funcionara parcialmente:

1. **El principio de documentacion definitiva** es correcto:
   - docs/ = estado actual
   - orchestration/ = proceso e historico

2. **La separacion de fases** es util, pero deberia:
   - Integrarse con CAPVED, no reemplazarlo
   - Ser una extension, no una duplicacion

3. **CLAUDE.md** puede ser util SI:
   - El usuario lo lee manualmente al inicio
   - Se incluye en el prompt inicial
   - NO depender de carga automatica

---

## SOLUCION PROPUESTA

### Opcion A: Integrar con SIMCO (Recomendado)

```yaml
Paso 1: Mover directivas a ubicacion correcta
  MOVER:
    .claude/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md
  A:
    orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

Paso 2: Eliminar DIRECTIVA-FASES-ESTANDAR.md
  RAZON: Usar CAPVED existente que ya tiene 6 fases

Paso 3: Actualizar HERENCIA-SIMCO.md
  AGREGAR:
    Directivas_Locales:
      - DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

Paso 4: Crear alias en core/orchestration/referencias/ALIASES.yml
  AGREGAR:
    @DOC-DEFINITIVA: gamilit/orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

Paso 5: Actualizar perfiles de agentes
  AGREGAR referencia explicita:
    "Leer @CAPVED para fases"
    "Leer @DOC-DEFINITIVA para documentacion"
```

### Opcion B: Documentacion en docs/ (Mas portable)

```yaml
Crear:
  docs/00-vision-general/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md
  docs/00-vision-general/directivas/DIRECTIVA-FASES-DESARROLLO.md

Ventaja:
  - Mas portable (docs/ siempre se copia)
  - Facil de encontrar
  - Parte de la documentacion oficial

Desventaja:
  - Duplica con orchestration/directivas/
  - Puede causar confusion
```

---

## PROMPT CORREGIDO PARA QUE FUNCIONE

Para que el prompt del usuario funcione, deberia ser:

```markdown
## Contexto para Agente

**Perfil:** {nombre del perfil}
**Archivo de perfil:** orchestration/agents/perfiles/PERFIL-{nombre}.md

**Proyecto:** GAMILIT
**Nivel:** STANDALONE
**Contexto:** orchestration/00-guidelines/CONTEXTO-PROYECTO.md

**Directivas a cargar (en orden):**
1. core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
2. core/orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
3. orchestration/00-guidelines/HERENCIA-SIMCO.md
4. orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

**Tarea:** {descripcion de la tarea}

**Procedimiento obligatorio:**
Seguir ciclo CAPVED:
1. C - Contexto: Cargar directivas y contexto
2. A - Analisis: Analizar alcance e impacto
3. P - Planeacion: Crear plan de implementacion
4. V - Validacion: Validar plan vs analisis
5. E - Ejecucion: Implementar en orden
6. D - Documentacion: Actualizar docs/ como estado FINAL
```

---

## CONCLUSION

**Las directivas creadas NO funcionan correctamente porque:**

1. Estan en ubicacion no portable (.claude/)
2. Duplican sistema existente (CAPVED)
3. Asumen persistencia que no existe
4. No tienen herencia definida
5. No tienen aliases para referenciar

**Para que funcione se necesita:**

1. Mover a orchestration/directivas/
2. Integrar con CAPVED, no reemplazar
3. Actualizar HERENCIA-SIMCO.md
4. Crear aliases
5. Actualizar perfiles de agentes con referencias explicitas

---

## DECISION REQUERIDA

¿Deseas que:

**A)** Corrija la implementacion integrando con SIMCO existente?
**B)** Mueva las directivas a docs/ para mayor portabilidad?
**C)** Mantenga lo creado pero con documentacion de como usarlo manualmente?

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-18
**Estado:** Esperando decision
