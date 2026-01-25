# MODE-FULL: Ejecucion Completa CAPVED

**ID:** MODE-FULL
**Version:** 1.0.0
**Alias:** `@FULL`
**Estado:** Por Defecto

---

## Descripcion

Modo de ejecucion completo que implementa el ciclo CAPVED con todas las fases,
incluyendo analisis de dependencias, verificacion anti-duplicacion, y evaluacion
de propagacion. Este es el modo por defecto para toda tarea que modifica codigo
o documentacion.

---

## Fases de Ejecucion

### Fase C: CONTEXTO (Obligatoria)
```yaml
objetivo: Clasificar y vincular la tarea al contexto del proyecto
actividades:
  - Identificar proyecto(s) afectado(s)
  - Clasificar tipo de tarea (feature/fix/refactor/docs)
  - Vincular a epic/HU si existe
  - Cargar CONTEXTO-PROYECTO.md del proyecto
  - Resolver aliases y variables del proyecto
  - Identificar SIMCO especificos a aplicar

output:
  - Proyecto identificado
  - Tipo de tarea clasificado
  - Aliases resueltos
  - SIMCO a cargar identificados
```

### Fase A: ANALISIS (Obligatoria)
```yaml
objetivo: Evaluar impacto, dependencias y riesgos
actividades:
  - Leer documentacion existente (docs/ del proyecto)
  - Mapear archivos que seran modificados
  - Analizar DEPENDENCIAS (archivos que importa)
  - Analizar DEPENDIENTES (archivos que lo importan)
  - Identificar riesgos y restricciones
  - Verificar catalogo para funcionalidades similares
  - Evaluar impacto en otras capas (DB/BE/FE)

output:
  - Lista de archivos a modificar
  - Mapa de dependencias
  - Lista de dependientes
  - Riesgos identificados
  - Resultado verificacion catalogo
```

### Fase P: PLANEACION (Obligatoria)
```yaml
objetivo: Desglosar trabajo en subtareas ejecutables
actividades:
  - Crear subtareas por dominio (DB, BE, FE)
  - Ordenar subtareas por dependencias
  - Asignar perfil de agente a cada subtarea
  - Definir criterios de aceptacion por subtarea
  - Estimar archivos a crear/modificar por subtarea
  - Definir validaciones requeridas

output:
  - Lista de subtareas ordenadas
  - Criterios de aceptacion
  - Validaciones definidas
```

### Fase V: VALIDACION PRE-EJECUCION (Obligatoria - NO DELEGAR)
```yaml
objetivo: Gate de verificacion antes de ejecutar
actividades:
  - Verificar alineacion A <-> P
  - Confirmar que no hay scope creep
  - Validar que subtareas cubren todo el analisis
  - Verificar que dependencias estan consideradas
  - Confirmar orden de ejecucion correcto
  - Si hay HUs derivadas necesarias, crearlas

output:
  - Confirmacion de alineacion
  - HUs derivadas si aplica
  - Aprobacion para ejecutar
```

### Fase E: EJECUCION (Obligatoria)
```yaml
objetivo: Implementar cambios segun el plan
actividades:
  - Ejecutar subtareas en orden definido
  - Aplicar SIMCO especifico por operacion
  - Actualizar documentacion ANTES de codigo (Doc-Primero)
  - Crear/modificar archivos segun plan
  - Ejecutar validaciones por subtarea
  - Registrar progreso

output:
  - Archivos creados/modificados
  - Validaciones ejecutadas
  - Progreso registrado
```

### Fase D: DOCUMENTACION (Obligatoria)
```yaml
objetivo: Formalizar y cerrar la tarea
actividades:
  - Actualizar inventarios del proyecto
  - Registrar en trazas correspondientes
  - Actualizar PROXIMA-ACCION.md si aplica
  - Evaluar propagacion a proyectos relacionados
  - Registrar lecciones aprendidas si hubo issues
  - Crear HUs derivadas si se detectaron pendientes

output:
  - Inventarios actualizados
  - Trazas registradas
  - Propagacion evaluada/ejecutada
  - Tarea cerrada
```

---

## Triggers Automaticos

### TRIGGER-ANTI-DUPLICACION
```yaml
cuando: Fase A detecta creacion de objeto nuevo
accion:
  1. Verificar shared/catalog/CATALOG-INDEX.yml
  2. Verificar inventario del proyecto
  3. Buscar archivos similares
  4. Si existe: DETENER y preguntar
```

### TRIGGER-ANALISIS-DEPENDENCIAS
```yaml
cuando: Fase A detecta modificacion de archivo
accion:
  1. Identificar imports del archivo
  2. Buscar archivos que importan este archivo
  3. Clasificar impacto (ALTO/MEDIO/BAJO)
  4. Incluir dependientes en plan si impacto ALTO
```

### TRIGGER-PROPAGACION-AUTOMATICA
```yaml
cuando: Fase D en proyecto con jerarquia
accion:
  1. Evaluar si cambio debe propagarse
  2. Si erp-core: proponer propagacion a verticales
  3. Si security fix: propagar inmediatamente
  4. Registrar en TRAZABILIDAD-PROPAGACION.yml
```

---

## Validaciones Obligatorias

### Antes de Cerrar Tarea
```bash
# Backend
npm run build     # DEBE pasar
npm run lint      # DEBE pasar
npm run test      # DEBEN pasar si existen

# Frontend
npm run build     # DEBE pasar
npm run lint      # DEBE pasar
npm run typecheck # DEBE pasar

# Base de Datos (si hay cambios DDL)
./scripts/recreate-database.sh  # DEBE pasar
```

### Coherencia Entre Capas
```yaml
si_nueva_tabla:
  - Verificar entity correspondiente en backend

si_nueva_entity:
  - Verificar que tiene DTO si expone API
  - Verificar service si tiene logica de negocio

si_nuevo_endpoint:
  - Verificar integracion en frontend si se requiere
```

---

## Cuando Usar Este Modo

### SI Usar MODE-FULL
- Nuevas features
- Bug fixes que modifican codigo
- Refactorizaciones
- Cambios en base de datos
- Nuevos endpoints o controladores
- Nuevos componentes UI
- Cambios en logica de negocio

### NO Usar MODE-FULL (usar otro modo)
- Typos en documentacion -> MODE-QUICK
- Solo investigacion -> MODE-ANALYSIS
- Solo propagacion de cambio existente -> MODE-PROPAGATION

---

## Ejemplo de Ejecucion

```
Usuario: @FULL Implementar sistema de notificaciones push en erp-construccion

Sistema:
== FASE C: CONTEXTO ==
- Proyecto: erp-construccion
- Tipo: Nueva feature
- SIMCO a cargar: SIMCO-BACKEND, SIMCO-FRONTEND

== FASE A: ANALISIS ==
- Verificando catalogo... ENCONTRADO: shared/catalog/notifications/
- Recomendacion: Reutilizar modulo existente
- Dependencias a agregar: @nestjs/notifications, firebase-admin
- Archivos afectados: 5 (backend) + 3 (frontend)

== FASE P: PLANEACION ==
ST-001: Configurar dependencias (SIMCO-BACKEND)
ST-002: Integrar modulo notificaciones del catalogo
ST-003: Crear endpoints de suscripcion
ST-004: Crear componente UI de configuracion
ST-005: Ejecutar validaciones

== FASE V: VALIDACION ==
- Plan alineado con analisis: OK
- Reutilizando catalogo: OK
- Aprobado para ejecutar

== FASE E: EJECUCION ==
[Ejecutando subtareas...]

== FASE D: DOCUMENTACION ==
- Inventario actualizado
- Traza registrada
- Propagacion: No aplica (feature especifica de construccion)
```

---

*MODE-FULL v1.0.0 - Sistema SAAD*
