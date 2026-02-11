# TRIGGER-PROPAGACION-AUTOMATICA

**ID:** TRIGGER-PROPAGACION-AUTOMATICA
**Version:** 1.0.0
**Tipo:** Automatico
**Fase CAPVED:** Se activa en Fase D (Documentacion)

---

## Proposito

Evaluar automaticamente si un cambio completado debe propagarse a otros
proyectos relacionados, basandose en la jerarquia de proyectos y el tipo
de cambio realizado. Genera tareas de propagacion o ejecuta propagacion
inmediata segun la criticidad.

---

## Cuando Se Activa

```yaml
activadores:
  fase: "D (Documentacion) - Al completar tarea"

  proyectos_con_propagacion:
    erp_core:
      - Cambio en erp-core activa evaluacion
      - Destinos: 5 verticales ERP

    shared_catalog:
      - Cambio en shared/catalog/ activa evaluacion
      - Destinos: Proyectos que usan la funcionalidad

    shared_modules:
      - Cambio en shared/modules/ activa evaluacion
      - Destinos: Proyectos que importan el modulo

    verticales_erp:
      - Mejora generica en vertical puede propagarse a core
      - Evaluacion manual requerida
```

---

## Matriz de Propagacion

### Desde erp-core
```yaml
origen: erp-core
destinos:
  - erp-construccion
  - erp-clinicas
  - erp-mecanicas-diesel
  - erp-retail
  - erp-vidrio-templado

reglas_por_tipo:
  security_fix:
    accion: "PROPAGAR_INMEDIATO"
    sla: "24 horas"
    prioridad: "CRITICA"
    mensaje: "ALERTA: Fix de seguridad debe propagarse a todas las verticales"

  bug_fix:
    accion: "PROPAGAR_PRIORITARIO"
    sla: "72 horas"
    prioridad: "ALTA"
    mensaje: "Bug fix en core debe propagarse a verticales afectadas"

  feature_generica:
    accion: "EVALUAR"
    pregunta: "Esta feature aplica a todas las verticales?"
    opciones:
      - "Si, propagar a todas"
      - "Solo a algunas (especificar)"
      - "No, es especifica de core"

  refactor:
    accion: "OPCIONAL"
    pregunta: "Desea propagar este refactor a las verticales?"
    nota: "Refactors pueden propagarse si mejoran significativamente el codigo"
```

### Desde shared/catalog
```yaml
origen: shared/catalog/{funcionalidad}/
destinos: "Proyectos que importan la funcionalidad"

reglas_por_tipo:
  security_fix:
    accion: "NOTIFICAR_Y_PROPAGAR"
    sla: "24 horas"
    mensaje: "Fix de seguridad en modulo compartido"

  bug_fix:
    accion: "NOTIFICAR_Y_PROPAGAR"
    sla: "72 horas"

  feature:
    accion: "NOTIFICAR"
    mensaje: "Nueva funcionalidad disponible en catalogo"
    nota: "Proyectos deciden si adoptar"

  breaking_change:
    accion: "COORDINAR"
    mensaje: "Cambio breaking en modulo compartido"
    proceso:
      1. Notificar a todos los proyectos
      2. Coordinar ventana de migracion
      3. Proporcionar guia de migracion
```

### Desde Vertical a Core (Reverse Propagation)
```yaml
origen: "Cualquier vertical ERP"
destino: erp-core

condiciones_para_propagar:
  - Mejora es generica (no especifica de la vertical)
  - Beneficia a otras verticales
  - Aprobada por arquitectura

proceso:
  1. Identificar mejora candidata
  2. Generalizar si es necesario
  3. PR a erp-core
  4. Una vez en core, propagar a otras verticales
```

### Desde Proyectos STANDALONE (NIVEL_2A)
```yaml
origen: "Proyecto standalone (gamilit, trading-platform, etc.)"
destinos:
  - shared/mirrors/{proyecto}/  # Sincronizacion de documentacion
  - shared/catalog/             # Patrones reutilizables (opcional)
  - workspace                   # Actualizacion de referencias

reglas_por_tipo:
  security_fix:
    accion: "SINCRONIZAR_MIRROR"
    sla: "Inmediato"
    prioridad: "ALTA"
    mensaje: "Fix de seguridad - sincronizar mirror"
    nota: "Proyectos standalone NO tienen downstream, solo se actualiza mirror"

  bug_fix:
    accion: "SINCRONIZAR_MIRROR"
    sla: "24 horas"
    prioridad: "MEDIA"

  feature:
    accion: "EVALUAR_PATRON"
    pregunta: "Esta funcionalidad es generalizable para otros proyectos?"
    opciones:
      - "Si, extraer a shared/catalog/"
      - "No, es especifica del proyecto"
    proceso_si_generalizable:
      1. Generalizar funcionalidad (remover dependencias especificas)
      2. Documentar en shared/catalog/{categoria}/
      3. Registrar en CATALOG-INDEX.yml
      4. Actualizar mirror del proyecto

  documentacion:
    accion: "SINCRONIZAR_INMEDIATO"
    destino: "shared/mirrors/{proyecto}/"
    nota: "Documentacion siempre se sincroniza al mirror"

  inventarios:
    accion: "SINCRONIZAR_INMEDIATO"
    destino: "shared/mirrors/{proyecto}/definitions/"

proyectos_standalone_registrados:
  - gamilit:
      mirror: "shared/mirrors/gamilit/"
      patrones_candidatos:
        - gamificacion (XP, rangos, logros)
        - inventarios_yaml
        - trazas_por_dominio
        - coherencia_3_capas
  - trading-platform:
      mirror: "shared/mirrors/trading-platform/"
  - betting-analytics:
      mirror: "shared/mirrors/betting-analytics/"

diferencias_con_erp:
  - NO hay proyectos downstream (no se propaga a otros proyectos)
  - NO hay SLA de 24h para security (no hay dependientes)
  - SI se sincroniza a mirror
  - SI se puede contribuir a shared/catalog/ (opcional)
```

---

## Acciones del Trigger

### Paso 1: Identificar Contexto
```yaml
accion: "Determinar proyecto y tipo de cambio"
evaluar:
  - Proyecto donde se completo la tarea
  - Tipo de cambio (security/bug/feature/refactor)
  - Archivos modificados
  - Modulos afectados
```

### Paso 2: Consultar Matriz de Propagacion
```yaml
accion: "Determinar si aplica propagacion"
verificar:
  - Proyecto esta en lista de origenes con propagacion?
  - Tipo de cambio requiere propagacion?
  - Cuales son los destinos?
```

### Paso 3: Ejecutar Segun Tipo
```yaml
security_fix:
  accion: "Iniciar propagacion inmediata"
  pasos:
    1. Notificar urgencia
    2. Listar proyectos destino
    3. Ejecutar MODE-PROPAGATION automaticamente
    4. Reportar estado

bug_fix:
  accion: "Crear tareas de propagacion"
  pasos:
    1. Generar lista de proyectos afectados
    2. Crear HU de propagacion por proyecto
    3. Asignar prioridad ALTA
    4. Registrar en tracking

feature:
  accion: "Preguntar y documentar"
  pasos:
    1. Preguntar si aplica a otros proyectos
    2. Si aplica, crear tareas de propagacion
    3. Si no aplica, documentar razon

refactor:
  accion: "Opcional - preguntar"
  pasos:
    1. Informar que propagacion es opcional
    2. Si se decide propagar, crear tareas
```

### Paso 4: Registrar en Trazabilidad
```yaml
accion: "Documentar decision de propagacion"
registrar_en:
  - shared/knowledge-base/TRAZABILIDAD-PROPAGACION.yml
  - orchestration/trazas/ del proyecto

contenido:
  - Cambio origen (proyecto, commit, descripcion)
  - Tipo de cambio
  - Decision (propagar/no propagar/parcial)
  - Destinos (si aplica)
  - Estado (pendiente/en progreso/completado)
  - Fecha
```

---

## Formato de Reporte

```markdown
## Evaluacion de Propagacion

### Cambio Completado
- Proyecto: {proyecto_origen}
- Tipo: {security|bug|feature|refactor}
- Descripcion: {descripcion_cambio}
- Archivos: {lista_archivos}

### Evaluacion de Propagacion
- Aplica propagacion: {SI | NO | PARCIAL}
- Razon: {explicacion}

### Proyectos Destino
| Proyecto | Aplica | Prioridad | SLA |
|----------|--------|-----------|-----|
| {nombre} | {SI/NO} | {CRITICA/ALTA/MEDIA} | {horas} |

### Accion Requerida
- {PROPAGAR_INMEDIATO | CREAR_TAREAS | NOTIFICAR | NINGUNA}

### Tareas Generadas (si aplica)
1. PROP-001: Propagar a {proyecto_1}
2. PROP-002: Propagar a {proyecto_2}
...

### Registro
- Trazabilidad: shared/knowledge-base/TRAZABILIDAD-PROPAGACION.yml
- Entrada ID: {id_entrada}
```

---

## Integracion con MODE-PROPAGATION

Cuando este trigger determina que se requiere propagacion:

### Propagacion Inmediata (Security)
```yaml
flujo:
  1. TRIGGER detecta security fix
  2. Automaticamente inicia MODE-PROPAGATION
  3. Propaga a todos los destinos
  4. Reporta resultado
```

### Propagacion Diferida (Bug/Feature)
```yaml
flujo:
  1. TRIGGER detecta cambio propagable
  2. Genera tareas de propagacion
  3. Usuario ejecuta MODE-PROPAGATION manualmente
  4. O programa propagacion en sprint
```

---

## Ejemplos de Ejecucion

### Ejemplo 1: Security Fix en erp-core
```
[Tarea completada: Fix de vulnerabilidad XSS en AuthGuard]

== TRIGGER-PROPAGACION-AUTOMATICA ACTIVADO ==

### Evaluacion
- Proyecto origen: erp-core
- Tipo: Security fix
- Modulo: AuthGuard

### Decision: PROPAGAR_INMEDIATO
- Prioridad: CRITICA
- SLA: 24 horas

### Destinos
| Proyecto | Estado |
|----------|--------|
| erp-construccion | PENDIENTE |
| erp-clinicas | PENDIENTE |
| erp-mecanicas-diesel | PENDIENTE |
| erp-retail | PENDIENTE |
| erp-vidrio-templado | PENDIENTE |

### Accion
Iniciando MODE-PROPAGATION automaticamente...

[Continua con propagacion]
```

### Ejemplo 2: Feature en erp-construccion
```
[Tarea completada: Nuevo reporte de inventario]

== TRIGGER-PROPAGACION-AUTOMATICA ACTIVADO ==

### Evaluacion
- Proyecto origen: erp-construccion (vertical)
- Tipo: Feature
- Modulo: Reportes de inventario

### Pregunta
Esta mejora es generica y podria beneficiar a otras verticales?

Opciones:
1. Si, propagar a erp-core y luego a otras verticales
2. No, es especifica para construccion
3. Parcial, solo aplica a algunas verticales

[Esperando respuesta del usuario]
```

### Ejemplo 3: Bug Fix en shared/catalog
```
[Tarea completada: Fix en modulo de notificaciones]

== TRIGGER-PROPAGACION-AUTOMATICA ACTIVADO ==

### Evaluacion
- Proyecto origen: shared/catalog/notifications
- Tipo: Bug fix
- Impacto: Proyectos que usan notificaciones

### Proyectos Afectados
Buscando proyectos que importan notifications...
- erp-core (usa notifications)
- gamilit (usa notifications)
- michangarrito (usa notifications)

### Decision: NOTIFICAR_Y_PROPAGAR
- Prioridad: ALTA
- SLA: 72 horas

### Tareas Generadas
1. PROP-001: Actualizar notifications en erp-core
2. PROP-002: Actualizar notifications en gamilit
3. PROP-003: Actualizar notifications en michangarrito

Registrado en TRAZABILIDAD-PROPAGACION.yml
```

### Ejemplo 4: Feature en Proyecto STANDALONE (gamilit)
```
[Tarea completada: Sistema de multiplicadores de XP]

== TRIGGER-PROPAGACION-AUTOMATICA ACTIVADO ==

### Evaluacion
- Proyecto origen: gamilit (STANDALONE - NIVEL_2A)
- Tipo: Feature
- Modulo: Gamificacion

### Pregunta
Esta funcionalidad es generalizable para otros proyectos?

Opciones:
1. Si, extraer a shared/catalog/gamification/
2. No, es especifica de gamilit

### Respuesta: Si, es generalizable

### Proceso de Extraccion
1. Generalizar: Remover referencias a gamilit-specific
2. Documentar: shared/catalog/gamification/xp-multipliers/
3. Registrar: Agregar a CATALOG-INDEX.yml
4. Sincronizar: Actualizar shared/mirrors/gamilit/

### Acciones Ejecutadas
- [x] Mirror sincronizado: shared/mirrors/gamilit/
- [x] Patron extraido: shared/catalog/gamification/xp-multipliers/
- [x] CATALOG-INDEX.yml actualizado

Registrado en TRAZABILIDAD-PROPAGACION.yml
```

### Ejemplo 5: Documentacion en Proyecto STANDALONE
```
[Tarea completada: Actualizacion de inventarios de gamilit]

== TRIGGER-PROPAGACION-AUTOMATICA ACTIVADO ==

### Evaluacion
- Proyecto origen: gamilit (STANDALONE - NIVEL_2A)
- Tipo: Documentacion/Inventarios

### Decision: SINCRONIZAR_INMEDIATO
- Destino: shared/mirrors/gamilit/definitions/
- Prioridad: NORMAL

### Archivos Sincronizados
- DATABASE-SCHEMA.md (actualizado)
- ENTITIES-CATALOG.md (actualizado)
- PROPAGATION-STATUS.yml (actualizado)

Sin propagacion adicional (proyecto standalone sin downstream)
```

---

## Configuracion de SLAs

### SLAs para Proyectos ERP (con downstream)
```yaml
slas_erp:
  security_fix:
    tiempo: 24 horas
    alerta: 12 horas
    escalamiento: Inmediato si no se cumple

  bug_fix:
    tiempo: 72 horas
    alerta: 48 horas
    escalamiento: A lead de proyecto

  feature:
    tiempo: 1 semana
    alerta: 5 dias
    escalamiento: A product owner

  refactor:
    tiempo: 2 semanas
    alerta: 10 dias
    escalamiento: Opcional
```

### SLAs para Proyectos STANDALONE (sin downstream)
```yaml
slas_standalone:
  security_fix:
    tiempo: "Inmediato"
    nota: "Sin SLA estricto - no hay proyectos dependientes"
    accion: "Sincronizar mirror"

  bug_fix:
    tiempo: "24 horas"
    nota: "Solo sincronizacion de documentacion"

  feature:
    tiempo: "N/A"
    nota: "Sin propagacion obligatoria"
    opcional: "Evaluar extraccion a shared/catalog/"

  documentacion:
    tiempo: "Inmediato"
    accion: "Sincronizar a shared/mirrors/{proyecto}/"

  mirror_sync:
    frecuencia: "En cada cambio significativo"
    automatico: true
```

---

*TRIGGER-PROPAGACION-AUTOMATICA v1.1.0 - Sistema SAAD*
*Actualizado: 2026-01-18 - Soporte para proyectos STANDALONE (NIVEL_2A)*
