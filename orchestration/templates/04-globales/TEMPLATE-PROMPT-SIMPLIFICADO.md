# TEMPLATE-PROMPT-SIMPLIFICADO

**Version:** 1.0.0
**Sistema:** SAAD (Sistema de Activacion Automatica de Directivas)

---

## Proposito

Este template muestra como estructurar prompts simplificados para el sistema SAAD.
Con el nuevo sistema, ya no es necesario especificar manualmente las fases de trabajo,
verificaciones de dependencias, o procesos de validacion - todo se activa automaticamente.

---

## Formato Basico

```
@MODO Descripcion de la tarea [en proyecto]
```

### Componentes

| Componente | Requerido | Descripcion |
|------------|-----------|-------------|
| @MODO | Opcional | Modo de ejecucion (FULL, QUICK, ANALYSIS, PROPAGATE) |
| Descripcion | Requerido | Que se quiere hacer |
| [en proyecto] | Recomendado | Proyecto donde ejecutar |

---

## Ejemplos por Tipo de Tarea

### 1. Nueva Feature

**Antes (prompt largo):**
```
Para esta tarea se puede realizar por fases, la primer fase es un analisis y
planeacion para realizar un analisis detallado, fase de analisis detallado,
fase de planeacion con base en el analisis detallado, fase de validacion de
planeacion contra el analisis que se cumpla con todos los requisitos ademas
de un analisis y validacion de cualquier archivo dependiente o dependencia
que se tenga con los archivos que se van a modificar, fase de refinamiento
del plan, fase de ejecucion de plan, fase de validacion de la ejecucion,
requiero un completo detalle del contenido de cada archivo que se cumpla y
una validacion y comparacion completa y detallada. Implementar sistema de
notificaciones push.
```

**Ahora (prompt simplificado):**
```
@FULL Implementar sistema de notificaciones push en erp-construccion
```

---

### 2. Bug Fix

**Antes:**
```
Todos los cambios deben de ser documentados con los estandares, asi como la
planeacion debe de estar documentado bajo los estandares definidos, si se
hicieron cambios dentro del proyecto de base de datos se tiene que actualizar
y validar que los cambios se tengan en el sh de create o recreate database y
ejecutar la recreacion de la base de datos para validar los cambios.
Corregir error de validacion en formulario de usuarios.
```

**Ahora:**
```
@FULL Corregir error de validacion en formulario de usuarios en erp-core
```

---

### 3. Investigacion/Analisis

**Antes:**
```
Requiero un analisis detallado de que todos los cambios hechos en la
documentacion se integren correctamente al desarrollo, misma instruccion
para detallar y separar tareas para cumplir con el mayor detalle posible.
Investigar por que el modulo de inventario es lento.
```

**Ahora:**
```
@ANALYSIS Investigar por que el modulo de inventario es lento en erp-construccion
```

---

### 4. Propagacion de Cambios

**Antes:**
```
Hay proyectos o definiciones que deben de ser analizados o actualizados y
propagados a los proyectos que hayan tomado como referencia ese proyecto
modificado, desde el proyecto de erp-core se debe propagar a los proyectos
de erp que hayan tomado como referencia el proyecto de erp-core. Distribuir
fix de autenticacion a todas las verticales.
```

**Ahora:**
```
@PROPAGATE-ERP Distribuir fix de autenticacion JWT
```

---

### 5. Consolidacion de Duplicados

**Antes:**
```
Antes de eliminar algun objeto duplicado se tenga que analizar y validar
que si se elimina un objeto el objeto que quede debe de tener todo lo
definido o tener la capacidad funcional o definiciones por el objeto
duplicado, el objeto eliminado debe de buscar toda relacion que se
referencie al objeto eliminado, objetos de dependencias y dependientes
y actualizar al objeto que quedo definido. Consolidar UserService duplicado.
```

**Ahora:**
```
@DELETE-SAFE Consolidar UserServiceOld con UserService en erp-core
```

---

### 6. Crear Objeto Nuevo

**Antes:**
```
Se debe verificar que no exista duplicado en el catalogo o en el proyecto,
buscar funcionalidades similares, verificar inventarios, y solo si no existe
proceder a crear. Crear servicio de pagos.
```

**Ahora:**
```
@CREATE-SAFE Crear servicio de pagos en erp-construccion
```

---

### 7. Modificar con Dependencias

**Antes:**
```
Se requiere un analisis y validacion de cualquier archivo dependiente o
dependencia que se tenga con los archivos que se van a modificar. Todos
los archivos que dependan del modificado deben actualizarse. Agregar
campo telefono a UserEntity.
```

**Ahora:**
```
@MODIFY-SAFE Agregar campo telefono a UserEntity en erp-core
```

---

### 8. Fix Rapido/Typo

**Antes:**
```
Solo necesito corregir un typo en el README, no requiere analisis completo.
```

**Ahora:**
```
@QUICK Corregir typo "recivir" -> "recibir" en README de erp-core
```

---

## Tabla de Equivalencias

| Prompt Largo Contenia | Alias Equivalente |
|-----------------------|-------------------|
| "realizar por fases, analisis, planeacion, validacion, ejecucion, documentacion" | @FULL |
| "solo corregir typo" / "fix menor" | @QUICK |
| "investigar" / "analizar sin modificar" / "auditar" | @ANALYSIS |
| "propagar a otros proyectos" / "distribuir cambio" | @PROPAGATE |
| "crear nuevo verificando catalogo" | @CREATE-SAFE |
| "modificar analizando dependencias" | @MODIFY-SAFE |
| "eliminar duplicado verificando referencias" | @DELETE-SAFE |
| "propagar desde erp-core a verticales" | @PROPAGATE-ERP |
| "validar build, lint, tests" | @VALIDATE-ALL |

---

## Que Se Activa Automaticamente

### Con @FULL (o sin especificar modo)
- Ciclo CAPVED completo (6 fases)
- Verificacion anti-duplicacion al crear
- Analisis de dependencias al modificar
- Evaluacion de propagacion al completar
- Validacion build/lint/tests
- Actualizacion de inventarios y trazas

### Con @CREATE-SAFE
- Todo lo de @FULL mas:
- Verificacion en catalogo global
- Verificacion en inventario del proyecto
- Busqueda de archivos similares

### Con @MODIFY-SAFE
- Todo lo de @FULL mas:
- Analisis completo de dependencias
- Identificacion de todos los dependientes
- Plan de actualizacion ordenado

### Con @DELETE-SAFE
- Todo lo de @FULL mas:
- Busqueda de todas las referencias
- Verificacion de consolidacion si es duplicado
- Actualizacion de referencias antes de eliminar

### Con @PROPAGATE
- Identificacion automatica de proyectos destino
- Aplicacion coordinada en cada proyecto
- Validacion por proyecto
- Registro en trazabilidad

---

## Notas Importantes

### El sistema detecta automaticamente:
1. **Tipo de tarea** - Feature, bug, refactor, etc.
2. **Proyecto** - Si se menciona explicitamente
3. **Triggers a activar** - Segun palabras clave
4. **Validaciones necesarias** - Segun tipo de cambio

### Si no especificas modo:
- Se asume @FULL por defecto
- El Meta-Orquestador puede sugerir otro si detecta que es mas apropiado

### Para tareas complejas:
- Puedes seguir siendo especifico si lo deseas
- El sistema interpretara y aplicara lo necesario

---

## Ejemplos Adicionales de Prompts Validos

```
# Implicito (asume FULL)
Implementar modulo de reportes en erp-construccion

# Explicito con alias
@FULL Agregar endpoint de exportacion PDF en erp-core

# Solo analisis
@ANALYSIS Documentar arquitectura del modulo de pagos

# Fix rapido
@QUICK Actualizar version de React en package.json

# Propagacion
@PROPAGATE-ERP Sincronizar cambios de AuthModule

# Crear seguro
@CREATE-SAFE Agregar tabla audit_logs en erp-core

# Modificar seguro
@MODIFY-SAFE Refactorizar PaymentService para async/await

# Eliminar seguro
@DELETE-SAFE Remover endpoint deprecado /api/v1/users/old
```

---

*TEMPLATE-PROMPT-SIMPLIFICADO v1.0.0 - Sistema SAAD*
