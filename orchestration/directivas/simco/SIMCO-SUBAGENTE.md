---
version: "1.1.0"
fecha: "2026-03-03"
tipo: directiva
sistema: "SIMCO - NEXUS v4.0"
proposito: "Protocolo optimizado para agentes operando como subagentes"
aplica_a: "Agentes que reciben delegacion de un orquestador"
actualizado: "v1.1.0: Template de prompt para background agent"
---

# SIMCO: PROTOCOLO PARA SUBAGENTES

## PRINCIPIO FUNDAMENTAL

> **Subagente = Agente con contexto heredado + Tarea especifica + CCA ligero**
>
> Un subagente NO debe cargar el mismo contexto que ya tiene el orquestador.
> Un subagente DEBE usar versiones compactas de perfiles y directivas.

Contrato compact obligatorio:
- `orchestration/agents/perfiles/compact/PERFIL-CONTRATO-COMPACT.md`

---

## 1. DIFERENCIA: AGENTE vs SUBAGENTE

| Aspecto | Agente Principal | Subagente |
|---------|------------------|-----------|
| Inicia sesion | Nueva | Delegada |
| Carga contexto | CCA completo (4 fases) | CCA-SUBAGENTE (2 fases) |
| Perfil | PERFIL-*.md (~800 tokens) | PERFIL-*-COMPACT.md (~250 tokens) |
| SIMCO cargados | 2-3 | 1 especifico |
| Contexto proyecto | Lee PROJECT-CONTEXT.md | Heredado del orquestador |
| Recovery | Ejecuta @TPL_RECOVERY_CTX | Escala a orquestador |
| Delega tareas | Si (si es orquestador) | NO |
| Tokens totales | ~10,000 | ~1,500 |

---

## 2. PROTOCOLO DE INICIALIZACION (CCA-SUBAGENTE)

```yaml
# Al recibir delegacion del orquestador

PASO_1_VERIFICAR_HERENCIA:
  verificar_presente:
    - variables_proyecto: "resueltas (sin placeholders)"
    - aliases: "resueltos (rutas completas)"
    - tarea: "especifica (1-2 archivos max)"
  si_falta_algo: "ESCALAR a orquestador - NO asumir"

PASO_2_CARGAR_PERFIL_COMPACT:
  leer: "orchestration/agents/perfiles/compact/PERFIL-{TIPO}-COMPACT.md"
  tokens: ~250

PASO_3_CARGAR_SIMCO_ESPECIFICO:
  segun_operacion:
    crear: "SIMCO-CREAR.md"
    modificar: "SIMCO-MODIFICAR.md"
    validar: "SIMCO-VALIDAR.md"
  tokens: ~800

PASO_4_CONFIRMAR:
  responder: "READY_TO_EXECUTE como subagente"
  tokens_totales: ~1,050
```

Ver detalles: `_archive/SIMCO-CCA-SUBAGENTE.md` (archivado, contenido integrado aqui)

---

## 3. RESTRICCIONES DE SUBAGENTE

### NO HACER

```yaml
prohibido:
  - NO cargar CCA completo (4 fases)
  - NO leer PROJECT-CONTEXT.md (ya heredado)
  - NO leer 6 principios completos (resumen en perfil compact)
  - NO delegar a otros subagentes
  - NO ejecutar recovery completo
  - NO crear archivos fuera del alcance
  - NO modificar codigo no relacionado
```

### SI HACER

```yaml
obligatorio:
  - Usar contexto heredado del orquestador
  - Cargar solo PERFIL-*-COMPACT.md
  - Cargar solo 1 SIMCO especifico
  - Ejecutar tarea delimitada (1-2 archivos)
  - Reportar resultado en formato compacto
  - Escalar si hay dudas o falta contexto
  - Validar build/lint antes de reportar
```

---

## 4. CONTEXTO HEREDADO

### Lo que VIENE del Orquestador

```yaml
HEREDADO_OBLIGATORIO:
  variables_proyecto:
    - DB_NAME, DB_DDL_PATH
    - BACKEND_ROOT, BACKEND_SRC
    - FRONTEND_ROOT, FRONTEND_SRC
    - Otras relevantes para la tarea

  aliases_resueltos:
    - @DDL, @BACKEND, @FRONTEND
    - @INV_DB, @INV_BE, @INV_FE

  estado_actual:
    - tablas_existentes
    - entities_existentes
    - endpoints_existentes

  tarea_especifica:
    - Descripcion clara
    - Archivos a crear/modificar
    - Criterios de aceptacion
    - Codigo de referencia (file:line)
```

### Lo que NO se Hereda

```yaml
NO_HEREDADO:
  - Historial de conversacion del orquestador
  - Documentacion completa del proyecto
  - Codigo no relacionado con la tarea
  - Inventarios completos (solo extracto relevante)
```

---

## 5. FORMATO DE REPORTE (COMPACTO)

Al completar la tarea, reportar en maximo 500 tokens:

```yaml
REPORTE_SUBAGENTE:
  subtarea_id: "ST-XXX"
  estado: "COMPLETADO | FALLIDO | BLOQUEADO"

  archivos:
    creados:
      - "ruta/archivo1.ext"
    modificados:
      - "ruta/archivo2.ext"

  validaciones:
    build: "PASS | FAIL | SKIP"
    lint: "PASS | FAIL | SKIP"

  siguiente_paso: "Descripcion breve de que sigue"

  # Solo si hay problemas
  problemas:
    - "Descripcion del problema 1"
```

---

## 6. RECOVERY DE SUBAGENTE

### Deteccion de Perdida de Contexto

```yaml
SENALES:
  - "No recuerdo que tarea debo hacer"
  - "No tengo variables resueltas"
  - "No se que archivo crear"
  - "No tengo codigo de referencia"
```

### Accion

```yaml
ACCION: "ESCALAR A ORQUESTADOR"

FORMATO_ESCALAMIENTO:
  tipo: "RECOVERY_SUBAGENTE"
  problema: "Perdi contexto de {especificar que}"
  necesito: "Re-delegacion con contexto completo"

NO_HACER:
  - NO intentar recovery completo
  - NO asumir valores de variables
  - NO crear archivos sin especificacion
```

---

## 7. INTEGRACION CON CAPVED

```yaml
SUBAGENTE_EN_CAPVED:
  # Solo ejecuta la fase E
  ejecuta:
    - E (Ejecutar): "Unica fase del subagente"

  # Las demas fases son del orquestador
  no_ejecuta:
    - C (Contexto): "Heredado del orquestador"
    - A (Analisis): "Ya hecho por orquestador"
    - P (Plan): "Ya definido por orquestador"
    - V (Validar plan): "El orquestador valido"
    - D (Documentar): "El orquestador documenta"
```

---

## 8. PERFILES COMPACTOS DISPONIBLES

| Perfil | Uso | Tokens |
|--------|-----|--------|
| PERFIL-BACKEND-COMPACT.md | Subagente Backend | ~250 |
| PERFIL-FRONTEND-COMPACT.md | Subagente Frontend | ~250 |
| PERFIL-DATABASE-COMPACT.md | Subagente Database | ~250 |
| PERFIL-DEVOPS-COMPACT.md | Subagente DevOps | ~250 |
| PERFIL-ML-COMPACT.md | Subagente ML | ~250 |
| PERFIL-GENERIC-SUBAGENT.md | Cualquier tarea | ~200 |

Ubicacion: `orchestration/agents/perfiles/compact/`

---

## 10. TEMPLATE DE PROMPT PARA BACKGROUND AGENT

Un background agent (Claude Code Task tool sin acceso a conversacion previa) necesita un prompt autocontenido. NO puede inferir contexto del hilo del orquestador.

### Estructura Obligatoria

```markdown
# SUBAGENTE-BACKGROUND: {TIPO} — {DESCRIPCION_CORTA}

## IDENTIDAD Y MODELO
**Tipo:** {Backend-Agent | Frontend-Agent | Database-Agent | Analysis-Agent}
**Modelo recomendado:** {haiku-4-5 | sonnet-4-6 | opus-4-6}
**Razon:** {ej: "Lectura simple 2 archivos" | "Implementacion con dependencias"}

## PROYECTO (VARIABLES RESUELTAS)
**Nombre:** gamilit
**Working dir:** C:/Empresas/ISEM/gamilit-workspace
```yaml
BACKEND_SRC: apps/backend/src
FRONTEND_SRC: apps/frontend/src
DDL_PATH: apps/database/ddl
SEEDS_PATH: apps/database/seeds
```

## TAREA
{1-3 oraciones: que hacer, en que archivo, resultado esperado}

### Archivos a Leer
- `{ruta_1}` — {razon}
- `{ruta_2}` — {patron referencia}

### Archivos a Modificar/Crear
- `{ruta_destino}` — {que hacer}

## RESTRICCIONES
- NO explorar mas alla de: {directorio}
- NO modificar: {archivos fuera de alcance}
- Si encuentras ambiguedad: reportar BLOQUEADO, no asumir

## DECISIONES PREVIAS (NO ROMPER)
- {ej: "shop.service.ts usa BoostService via DI"}
- {ej: "visual_type usa snake_case en BD"}

## CRITERIOS DE ACEPTACION
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] Build pasa: `npm run build`
- [ ] Lint pasa: `npm run lint`

## FORMATO DE SALIDA
```yaml
REPORTE_SUBAGENTE:
  subtarea: "{descripcion}"
  estado: "COMPLETADO | FALLIDO | BLOQUEADO"
  archivos_modificados:
    - "ruta/archivo.ext"
  validaciones:
    build: "PASS | FAIL"
    lint: "PASS | FAIL"
  hallazgos_adicionales:
    - "{info para el orquestador}"
```
```

### Notas de Uso

- Limitar prompt a 3,000-8,000 tokens. Si especificacion >20 lineas, desglosar en dos subtareas.
- `DECISIONES PREVIAS` es critico para modulos ya implementados.
- `RESTRICCIONES` previene que Haiku navegue el repo completo.
- Para tareas de solo analisis: omitir "Archivos a Modificar/Crear".

---

## 9. REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `_archive/SIMCO-CCA-SUBAGENTE.md` | Protocolo CCA ligero (archivado) |
| `agents/perfiles/compact/` | Perfiles compactos |
| `SIMCO-DELEGACION.md` | Como recibir delegacion |
| `CHECKLIST-PRE-DELEGACION.md` | Validacion del orquestador |

---

**Version:** 1.1.0 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Subagente
