# MODE-PROPAGATION: Propagacion de Cambios

**ID:** MODE-PROPAGATION
**Version:** 1.0.0
**Alias:** `@PROPAGATE`
**Estado:** Activo

---

## Descripcion

Modo de ejecucion especializado para propagar un cambio existente a multiples
proyectos relacionados. Implementa el ciclo CAPVED completo pero enfocado en
la distribucion coordinada de cambios entre proyectos con jerarquia o dependencias.

---

## Fases de Ejecucion

### Fase C: CONTEXTO
```yaml
objetivo: Identificar el cambio origen y su contexto
actividades:
  - Identificar proyecto origen del cambio
  - Identificar commit/PR/cambio especifico
  - Clasificar tipo de cambio (security/bug/feature/refactor)
  - Cargar matriz de propagacion
  - Identificar proyectos destino

output:
  - Cambio origen identificado
  - Tipo de cambio clasificado
  - Lista de proyectos destino
```

### Fase A: ANALISIS
```yaml
objetivo: Mapear impacto en cada proyecto destino
actividades:
  para_cada_proyecto_destino:
    - Verificar si tiene el modulo/archivo afectado
    - Analizar diferencias con proyecto origen
    - Identificar adaptaciones necesarias
    - Evaluar riesgo de la propagacion
    - Verificar estado actual (branch, cambios pendientes)

output:
  - Mapa de propagacion por proyecto
  - Adaptaciones necesarias por proyecto
  - Orden de propagacion (por dependencias)
```

### Fase P: PLANEACION
```yaml
objetivo: Crear plan de propagacion coordinado
actividades:
  - Ordenar proyectos por dependencias
  - Crear subtarea de propagacion por proyecto
  - Definir validaciones por proyecto
  - Definir rollback plan si falla
  - Estimar tiempo total

output:
  - Plan de propagacion ordenado
  - Validaciones definidas
  - Rollback plan
```

### Fase V: VALIDACION PRE-PROPAGACION
```yaml
objetivo: Gate antes de iniciar propagacion
actividades:
  - Verificar que todos los proyectos estan en estado limpio
  - Confirmar que no hay conflictos pendientes
  - Validar que adaptaciones estan claras
  - Confirmar orden de ejecucion

output:
  - Aprobacion para propagar
```

### Fase E: EJECUCION
```yaml
objetivo: Propagar cambio a cada proyecto
actividades:
  para_cada_proyecto_en_orden:
    - Aplicar cambio (cherry-pick, merge, o manual)
    - Aplicar adaptaciones si necesarias
    - Ejecutar build + lint
    - Ejecutar tests si existen
    - Si falla: detener y evaluar rollback

output:
  - Cambio aplicado en cada proyecto
  - Validaciones pasadas
```

### Fase D: DOCUMENTACION
```yaml
objetivo: Registrar propagacion completada
actividades:
  - Registrar en TRAZABILIDAD-PROPAGACION.yml
  - Actualizar trazas de cada proyecto
  - Documentar adaptaciones realizadas
  - Registrar fecha y alcance de propagacion

output:
  - Propagacion documentada
  - Trazabilidad actualizada
```

---

## Matriz de Propagacion

### Desde erp-core
```yaml
erp-core:
  propaga_a:
    - erp-construccion
    - erp-clinicas
    - erp-mecanicas-diesel
    - erp-retail
    - erp-vidrio-templado

  reglas:
    security_fix: "OBLIGATORIO - Propagar inmediatamente"
    bug_fix: "OBLIGATORIO - Propagar en 72h"
    feature: "EVALUAR - Propagar si es generica"
    refactor: "OPCIONAL - Propagar si mejora significativa"
```

### Desde shared/catalog
```yaml
shared/catalog:
  propaga_a: "Todos los proyectos que usan la funcionalidad"

  reglas:
    security_fix: "OBLIGATORIO - Notificar y propagar"
    bug_fix: "OBLIGATORIO - Notificar y propagar"
    feature: "NOTIFICAR - Proyectos deciden adopcion"
    breaking_change: "NOTIFICAR - Coordinar migracion"
```

### Desde Vertical a Core
```yaml
vertical_to_core:
  desde: "Cualquier vertical ERP"
  hacia: "erp-core"

  condiciones:
    - "Mejora debe ser generica (no especifica de vertical)"
    - "Debe pasar review de arquitectura"
    - "Una vez en core, propagar a otras verticales"
```

---

## Triggers Automaticos

### TRIGGER-DEPENDENCIAS-PROPAGACION
```yaml
cuando: Fase A en cada proyecto destino
accion:
  - Verificar dependencias del archivo en ese proyecto
  - Incluir actualizaciones necesarias
  - Mapear diferencias con proyecto origen
```

### TRIGGER-VALIDACION-PROPAGACION
```yaml
cuando: Despues de aplicar cambio en cada proyecto
accion:
  - npm run build
  - npm run lint
  - npm run test (si existen)
  - Si falla: DETENER propagacion
```

---

## SLAs de Propagacion

| Tipo de Cambio | SLA | Prioridad |
|----------------|-----|-----------|
| Security Fix | 24 horas | CRITICA |
| Bug Fix | 72 horas | ALTA |
| Feature | 1 semana | MEDIA |
| Refactor | 2 semanas | BAJA |

---

## Aliases de Propagacion

### @PROPAGATE-ERP
```yaml
uso: "Propagar desde erp-core a todas las verticales"
destinos:
  - erp-construccion
  - erp-clinicas
  - erp-mecanicas-diesel
  - erp-retail
  - erp-vidrio-templado
ejemplo: "@PROPAGATE-ERP Distribuir fix de autenticacion JWT"
```

### @PROPAGATE-CATALOG
```yaml
uso: "Propagar cambio de catalogo a proyectos que lo usan"
proceso:
  1. Identificar funcionalidad modificada
  2. Buscar proyectos que importan esa funcionalidad
  3. Propagar a cada uno
ejemplo: "@PROPAGATE-CATALOG Actualizar modulo de notificaciones"
```

### @PROPAGATE-SECURITY
```yaml
uso: "Propagacion urgente de fix de seguridad"
caracteristicas:
  - Prioridad maxima
  - SLA 24 horas
  - Notificacion a todos los proyectos
ejemplo: "@PROPAGATE-SECURITY Fix de vulnerabilidad XSS"
```

---

## Manejo de Conflictos

### Si el proyecto destino tiene cambios locales
```yaml
opciones:
  1_merge:
    descripcion: "Intentar merge automatico"
    usar_cuando: "Cambios no conflictuan"

  2_rebase:
    descripcion: "Rebasar cambios locales"
    usar_cuando: "Cambios locales menores"

  3_manual:
    descripcion: "Propagacion manual con adaptaciones"
    usar_cuando: "Conflictos complejos"

  4_derivar_hu:
    descripcion: "Crear HU derivada para propagacion manual"
    usar_cuando: "Requiere trabajo significativo"
```

### Si la propagacion falla en un proyecto
```yaml
protocolo:
  1. Detener propagacion a siguientes proyectos
  2. Evaluar causa del fallo
  3. Opciones:
     - Corregir y reintentar
     - Excluir proyecto y continuar con otros
     - Rollback de proyectos ya propagados
  4. Documentar excepcion
```

---

## Cuando Usar Este Modo

### SI Usar MODE-PROPAGATION
- Fix de seguridad que afecta multiples proyectos
- Bug fix en modulo compartido (core o catalogo)
- Mejora generica que beneficia a todos
- Actualizacion de dependencias compartidas
- Nueva directiva que debe distribuirse

### NO Usar MODE-PROPAGATION
- Cambio especifico de un proyecto -> MODE-FULL en ese proyecto
- Investigacion de que propagar -> MODE-ANALYSIS primero
- Cambio menor sin impacto en otros -> MODE-QUICK

---

## Ejemplo de Ejecucion

```
Usuario: @PROPAGATE-ERP Distribuir fix de validacion JWT a verticales

Sistema:
== FASE C: CONTEXTO ==
- Proyecto origen: erp-core
- Cambio: Fix en JwtAuthGuard (commit abc123)
- Tipo: Bug fix (seguridad)
- Destinos: 5 verticales ERP

== FASE A: ANALISIS ==
erp-construccion:
  - Tiene JwtAuthGuard: SI
  - Diferencias: Ninguna
  - Adaptaciones: Ninguna

erp-clinicas:
  - Tiene JwtAuthGuard: SI
  - Diferencias: Import adicional de ClinicaGuard
  - Adaptaciones: Merge con import local

[...analisis de otros proyectos...]

Orden de propagacion:
1. erp-construccion (sin adaptaciones)
2. erp-retail (sin adaptaciones)
3. erp-vidrio-templado (sin adaptaciones)
4. erp-mecanicas-diesel (sin adaptaciones)
5. erp-clinicas (con adaptacion de import)

== FASE P: PLANEACION ==
5 subtareas de propagacion
Tiempo estimado: 30 min
Rollback: Revert commit en cada proyecto

== FASE V: VALIDACION ==
- Proyectos en estado limpio: OK
- Sin conflictos pendientes: OK
- Aprobado para propagar

== FASE E: EJECUCION ==
[1/5] erp-construccion... OK (build + lint OK)
[2/5] erp-retail... OK
[3/5] erp-vidrio-templado... OK
[4/5] erp-mecanicas-diesel... OK
[5/5] erp-clinicas... OK (con adaptacion)

== FASE D: DOCUMENTACION ==
- Registrado en TRAZABILIDAD-PROPAGACION.yml
- Trazas actualizadas en 5 proyectos
- Propagacion completada: 5/5 proyectos

PROPAGACION COMPLETADA EXITOSAMENTE
```

---

*MODE-PROPAGATION v1.0.0 - Sistema SAAD*
