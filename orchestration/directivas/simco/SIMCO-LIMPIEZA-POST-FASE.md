# SIMCO: LIMPIEZA POST-FASE

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Sistema:** SIMCO v4.0.0 + NEXUS v4.1
**Alias:** @LIMPIEZA_POST_FASE
**Complementa:** @SIMCO-CONTEXT-CLEANUP (limpieza mid-session general)

---

## RESUMEN EJECUTIVO

Define que limpiar del contexto al completar cada fase del ciclo CAPVED. Mientras SIMCO-CONTEXT-CLEANUP maneja limpieza reactiva (triggers mid-session), esta directiva define limpieza **proactiva** al cierre de cada fase.

**PRINCIPIO:** "Al cerrar una fase CAPVED, descartar artefactos temporales de esa fase y conservar solo los resultados. Cada fase debe dejar el contexto limpio para la siguiente."

---

## LIMPIEZA POR FASE

### Fase C (Contexto) → Al completar

```yaml
conservar:
  - Identificacion del proyecto y dominio
  - Alias y paths resueltos
  - Perfil de agente seleccionado
  - Resumen de tarea (1-3 lineas)

descartar:
  - Contenido completo de CLAUDE.md (ya procesado → referenciar)
  - Contenido completo de PROJECT-CONTEXT.md (ya procesado → referenciar)
  - Archivos de inventario leidos para orientacion (→ path + 1 linea)
  - Listados de archivos exploratorios (Glob results)

resultado_esperado:
  tokens_liberados: "~3,000-5,000"
  contexto_retenido: "Identidad + tarea + perfil + aliases"
```

### Fase A (Analisis) → Al completar

```yaml
conservar:
  - Plan de archivos a modificar (lista de paths)
  - Dependencias identificadas (grafo simplificado)
  - Decisiones tomadas durante analisis
  - Resultado de triggers activados (ANTI-DUPLICACION, DEPENDENCIAS)

descartar:
  - Contenido completo de archivos solo consultados como referencia
  - Resultados de busquedas exploratorias (Grep/Glob)
  - Alternativas descartadas (solo conservar la decision final)
  - Contenido de inventarios ya procesados

reemplazar_por_referencia:
  - "{path} — {resumen 1 linea de lo relevante}"
  - Ejemplo: "apps/backend/src/modules/auth/auth.module.ts — 15 providers, importa JwtModule"

resultado_esperado:
  tokens_liberados: "~5,000-10,000"
  contexto_retenido: "Plan concreto + dependencias + decisiones"
```

### Fase P (Plan) → Al completar

```yaml
conservar:
  - Plan de implementacion aprobado (pasos numerados)
  - Archivos a crear/modificar (paths exactos)
  - Criterios de aceptacion
  - Story points estimados

descartar:
  - Borradores de plan descartados
  - Analisis comparativo de alternativas (ya decidido)
  - Contenido de archivos de referencia consultados durante planificacion

resultado_esperado:
  tokens_liberados: "~2,000-4,000"
  contexto_retenido: "Plan final aprobado + criterios"
```

### Fase V (Validacion Pre-Ejecucion) → Al completar

```yaml
conservar:
  - Resultado de validaciones (pass/fail por item)
  - Bloqueos identificados (si hay)
  - Confirmacion de "READY_TO_EXECUTE"

descartar:
  - Output completo de build/lint (solo conservar veredicto)
  - Contenido de archivos verificados (ya confirmados)
  - Logs de validacion detallados

resultado_esperado:
  tokens_liberados: "~1,000-3,000"
  contexto_retenido: "Veredicto + bloqueos"
```

### Fase E (Ejecucion) → Al completar cada subtarea

```yaml
conservar:
  - Archivos ACTUALMENTE siendo modificados
  - Resultado de la subtarea (que se cambio, donde)
  - Errores encontrados y como se resolvieron

descartar:
  - Contenido de archivos de subtareas anteriores ya completadas (→ STALE)
  - Output de comandos ya procesados (builds intermedios, greps)
  - Codigo leido solo como referencia para la subtarea

clasificar_al_completar_subtarea:
  ACTIVE: "Archivo que aun necesito para la siguiente subtarea"
  REFERENCE: "Archivo de subtarea completada → path + 1 linea"
  STALE: "Archivo de subtarea anterior sin relacion → descartar"

resultado_esperado:
  tokens_liberados: "~3,000-8,000 por subtarea"
  nota: "Fase E es la mas critica — puede consumir 60%+ del contexto"
```

### Fase D (Documentacion) → Al completar

```yaml
conservar:
  - Resumen de lo implementado
  - Archivos creados/modificados (lista final)
  - Metricas actualizadas
  - PROXIMA-ACCION si aplica

descartar:
  - Todo el contexto de ejecucion (codigo, builds, logs)
  - Archivos leidos durante documentacion
  - Borradores de documentacion

resultado_esperado:
  tokens_liberados: "Maximo posible — sesion terminando"
  contexto_retenido: "Solo PROXIMA-ACCION para recovery"
```

---

## PROCEDIMIENTO RAPIDO (5 PASOS)

Al completar CUALQUIER fase CAPVED:

```
1. PAUSAR antes de avanzar a la siguiente fase
2. LISTAR todo lo que esta en contexto (archivos, resultados, codigo)
3. CLASIFICAR cada item: ACTIVE / REFERENCE / STALE / OUTPUT
4. PURGAR: Descartar STALE, resumir REFERENCE y OUTPUT
5. VERIFICAR: ¿El contexto restante es suficiente para la siguiente fase?
```

---

## SEÑALES DE ALERTA

```yaml
alertas:
  contexto_30_pct:
    condicion: "30% de ventana usada"
    accion: "Limpieza normal (clasificar, purgar STALE)"

  contexto_50_pct:
    condicion: "50% de ventana usada"
    accion: "Limpieza agresiva (todo a REFERENCE excepto ACTIVE)"

  contexto_70_pct:
    condicion: "70% de ventana usada"
    accion: "Escribir PROXIMA-ACCION, purga maxima, evaluar delegacion"

  contexto_80_pct:
    condicion: "80% de ventana usada (alerta sistema)"
    accion: "DETENER ejecucion, guardar estado, preparar recovery"
```

---

## RELACION CON CONTEXT-CLEANUP

| Aspecto | CONTEXT-CLEANUP | LIMPIEZA-POST-FASE |
|---------|----------------|-------------------|
| Cuando | Reactivo (triggers mid-session) | Proactivo (cierre de fase) |
| Granularidad | Por archivo/resultado | Por fase CAPVED completa |
| Frecuencia | 5+ archivos, 50% contexto, etc. | 1 vez por fase (maximo 6/sesion) |
| Foco | Clasificar contenido individual | Definir que conservar por fase |

**Ambos se complementan:** CONTEXT-CLEANUP limpia DURANTE la fase, LIMPIEZA-POST-FASE limpia AL CERRAR la fase.

---

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @LIMPIEZA_POST_FASE | Esta directiva |
| @SIMCO-CONTEXT-CLEANUP | Limpieza mid-session (complementario) |
| @CONTEXT_ENGINEERING | Ingenieria de contexto |
| @CAPVED | Ciclo de vida de tareas |
| @TOKENS | Economia de tokens |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 + NEXUS v4.1 | **Tipo:** Directiva Operacional
