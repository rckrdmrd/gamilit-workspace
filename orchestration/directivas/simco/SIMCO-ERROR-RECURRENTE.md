# SIMCO: MANEJO DE ERRORES RECURRENTES

**Versión:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.0
**Propósito:** Protocolo para análisis profundo y solución definitiva de errores repetidos
**Fecha:** 2026-01-04

---

## PRINCIPIO FUNDAMENTAL

> **Un error que se repite indica que la solución anterior fue incompleta.**
> Este protocolo asegura:
> 1. Identificación de causa raíz real
> 2. Actualización de TODOS los objetos afectados
> 3. Prevención de recurrencia
> 4. Documentación para evitar repetición futura

---

## DETECCIÓN DE ERROR RECURRENTE

### Cuándo Aplica Este Protocolo

```yaml
CRITERIOS_DETECCION:
  automatica:
    - Error similar encontrado en REGISTRO-ERRORES.yml
    - Mismo archivo/función con error previo
    - Mismo tipo de error en mismo módulo

  manual:
    - Usuario reporta: "esto ya lo arreglamos antes"
    - Patrón reconocido de error anterior
    - Síntoma idéntico a problema previo

ACCION_INMEDIATA:
  - Marcar tarea como: "REQUIERE_ANALISIS_PROFUNDO"
  - Cargar historial completo del error
  - NO proceder con fix rápido
```

---

## PROCESO DE ANÁLISIS PROFUNDO

### Paso 1: Recolectar Historial

```yaml
HISTORIAL:
  buscar_en:
    - "orchestration/errores/REGISTRO-ERRORES.yml"
    - "{proyecto}/orchestration/trazas/"
    - "shared/knowledge-base/lessons-learned/"
    - Git log de archivos afectados

  recolectar:
    - Todas las ocurrencias previas
    - Soluciones aplicadas anteriormente
    - Quién las aplicó y cuándo
    - Por qué se consideró resuelto
```

### Paso 2: Análisis de Causa Raíz

```yaml
ANALISIS_5_PORQUES:
  1_porque: "¿Por qué ocurrió el error?"
  2_porque: "¿Por qué eso fue posible?"
  3_porque: "¿Por qué no se detectó antes?"
  4_porque: "¿Por qué la solución anterior no funcionó?"
  5_porque: "¿Qué asunción incorrecta se hizo?"

RESULTADO:
  causa_raiz_real: "{descripción precisa}"
  asunciones_incorrectas: ["{lista}"]
  objetos_no_actualizados: ["{lista}"]
```

### Paso 3: Mapear Impacto Completo

```yaml
MAPEO_IMPACTO:
  objetos_directos:
    - archivo: "{ruta}"
      tipo: "{DDL | Entity | Service | Component}"
      lineas_afectadas: "{rango}"

  objetos_dependientes:
    - archivo: "{ruta}"
      relacion: "{usa | importa | extiende}"
      requiere_actualizacion: true | false

  documentacion_afectada:
    - archivo: "{ruta}"
      desactualizada: true | false

  tests_afectados:
    - archivo: "{ruta}"
      cubre_caso: true | false
```

---

## SOLUCIÓN DEFINITIVA

### Requisitos

```yaml
REQUISITOS_SOLUCION:
  obligatorios:
    - [ ] Actualizar objeto donde ocurre el error
    - [ ] Actualizar TODAS las dependencias
    - [ ] Actualizar documentación relacionada
    - [ ] Agregar test que cubra el caso específico
    - [ ] Agregar validación que prevenga recurrencia

  verificaciones:
    - [ ] Build pasa en todas las capas afectadas
    - [ ] Tests existentes siguen pasando
    - [ ] Nuevo test pasa
    - [ ] Lint sin warnings

  documentacion:
    - [ ] Registrar en REGISTRO-ERRORES.yml como resuelto
    - [ ] Agregar a lessons-learned si es patrón común
    - [ ] Actualizar ANTIPATRONES.md si aplica
```

### Prevención de Recurrencia

```yaml
PREVENCION:
  codigo:
    - Agregar validación explícita donde sea posible
    - Agregar types más estrictos
    - Agregar comentario explicativo

  proceso:
    - Agregar check al checklist de revisión
    - Actualizar template si aplica
    - Notificar a otros proyectos si es genérico

  automatizacion:
    - Agregar regla de lint si posible
    - Agregar test de regresión
    - Agregar hook pre-commit si crítico
```

---

## REGISTRO DE ERRORES

### Estructura

```yaml
# orchestration/errores/REGISTRO-ERRORES.yml

errores:
  - id: "ERR-2026-01-001"
    fecha_primera: "2026-01-01"
    fecha_ultima: "2026-01-04"
    ocurrencias: 3

    descripcion:
      titulo: "{título breve}"
      sintoma: "{qué se observa}"
      contexto: "{dónde ocurre}"

    historial:
      - fecha: "2026-01-01"
        solucion_aplicada: "{qué se hizo}"
        por_quien: "{agente/usuario}"
        resultado: "recurrió"

      - fecha: "2026-01-04"
        solucion_aplicada: "{solución definitiva}"
        por_quien: "{agente/usuario}"
        resultado: "resuelto"

    causa_raiz:
      identificada: true
      descripcion: "{causa real}"
      asunciones_incorrectas:
        - "{asunción 1}"

    solucion_definitiva:
      descripcion: "{qué se hizo finalmente}"
      objetos_actualizados:
        - "{ruta/archivo1}"
        - "{ruta/archivo2}"
      tests_agregados:
        - "{ruta/test}"
      validacion_agregada: "{descripción}"

    prevencion:
      documentado_en: "{ruta/archivo.md}"
      antipatron_creado: true | false
      lint_rule_agregada: true | false

    estado: "resuelto"                    # abierto | en_analisis | resuelto

    propagacion:
      aplica: true | false
      destinos: []
      estado: "completada"
```

---

## CHECKLIST OBLIGATORIO

```yaml
CHECKLIST_ERROR_RECURRENTE:
  antes_de_empezar:
    - [ ] Historial completo recolectado
    - [ ] Todas las ocurrencias documentadas
    - [ ] Causa raíz identificada con 5 porqués

  durante_solucion:
    - [ ] Todos los objetos afectados identificados
    - [ ] Dependencias mapeadas
    - [ ] Plan incluye TODOS los objetos

  despues_de_solucion:
    - [ ] Build pasa
    - [ ] Tests pasan
    - [ ] Test nuevo cubre el caso
    - [ ] Documentación actualizada
    - [ ] REGISTRO-ERRORES.yml actualizado
    - [ ] Prevención implementada
    - [ ] Propagación evaluada
```

---

## ESCALAMIENTO

```yaml
ESCALAR_SI:
  - Error ocurre >3 veces
  - Causa raíz no identificable
  - Solución requiere cambio arquitectónico
  - Afecta >5 archivos en múltiples capas
  - Requiere breaking changes

ESCALAR_A:
  - Product Owner para decisión de prioridad
  - Arquitecto si es cambio estructural
  - Equipo completo si afecta múltiples proyectos
```

---

## ANTIPATRONES COMUNES

```yaml
ANTIPATRONES:
  fix_rapido:
    descripcion: "Arreglar solo el síntoma visible"
    consecuencia: "Error recurrente"
    solucion: "Siempre buscar causa raíz"

  fix_parcial:
    descripcion: "Actualizar solo un objeto de varios afectados"
    consecuencia: "Inconsistencia entre capas"
    solucion: "Mapear y actualizar TODOS los objetos"

  sin_test:
    descripcion: "Arreglar sin agregar test de regresión"
    consecuencia: "No hay detección futura"
    solucion: "Siempre agregar test que falle antes del fix"

  sin_documentar:
    descripcion: "No registrar el error y su solución"
    consecuencia: "Pérdida de conocimiento"
    solucion: "Siempre actualizar REGISTRO-ERRORES.yml"
```

---

## INTEGRACIÓN CON CAPVED++

```yaml
INTEGRACION:
  fase_c:
    - Buscar en REGISTRO-ERRORES.yml
    - Si encuentra: marcar REQUIERE_ANALISIS_PROFUNDO

  fase_a:
    - Ejecutar análisis de 5 porqués
    - Mapear impacto completo
    - Documentar causa raíz

  fase_p:
    - Plan debe incluir TODOS los objetos
    - Plan debe incluir test nuevo
    - Plan debe incluir prevención

  fase_d:
    - Actualizar REGISTRO-ERRORES.yml
    - Agregar a lessons-learned
    - Evaluar propagación
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `REGISTRO-ERRORES.yml` | Historial de errores |
| `SIMCO-CAPVED-PLUS.md` | Ciclo con validaciones |
| `lessons-learned/` | Lecciones aprendidas |
| `ANTIPATRONES.md` | Qué NO hacer |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Calidad
