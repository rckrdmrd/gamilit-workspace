# TRIGGER-ANALISIS-DEPENDENCIAS

**ID:** TRIGGER-ANALISIS-DEPENDENCIAS
**Version:** 1.0.0
**Tipo:** Automatico
**Fase CAPVED:** Se activa en Fase A (Analisis)

---

## Proposito

Analizar automaticamente las dependencias de un archivo antes de modificarlo,
identificando tanto los archivos de los que depende (imports) como los archivos
que dependen de el (dependientes), para evaluar el impacto del cambio y
asegurar que todos los archivos afectados sean considerados en el plan.

---

## Cuando Se Activa

```yaml
activadores:
  palabras_clave:
    - "modificar"
    - "cambiar"
    - "actualizar"
    - "refactorizar"
    - "eliminar"
    - "renombrar"
    - "mover"

  tipos_operacion:
    - Modificacion de archivo existente
    - Eliminacion de archivo
    - Renombrado de archivo/clase/funcion
    - Cambio de firma de funcion/metodo
    - Cambio de estructura de tabla/entity

  ejemplos:
    - "Modificar UserEntity para agregar campo email_verified"
    - "Cambiar estructura de tabla payments"
    - "Refactorizar AuthService"
    - "Renombrar componente Dashboard a AdminDashboard"
    - "Eliminar funcion deprecada calculateTotal"
```

---

## Acciones del Trigger

### Paso 1: Identificar Dependencias (Imports)
```yaml
accion: "Identificar archivos que el archivo modificado importa"
descripcion: "Estos son los archivos de los que DEPENDE el archivo a modificar"

comandos:
  typescript:
    - grep -E "^import .* from" {archivo}
    - grep -E "require\(" {archivo}

  python:
    - grep -E "^from .* import|^import " {archivo}

  sql:
    - grep -E "REFERENCES|FOREIGN KEY" {archivo}

output:
  formato: |
    ## Dependencias (de los que depende)
    | Archivo | Tipo de Dependencia |
    |---------|---------------------|
    | {ruta}  | {import/extends/uses} |
```

### Paso 2: Identificar Dependientes
```yaml
accion: "Identificar archivos que importan o usan el archivo a modificar"
descripcion: "Estos son los archivos que DEPENDEN del archivo a modificar"

comandos:
  buscar_imports:
    - grep -rn "from.*{nombre_modulo}" apps/ libs/ src/
    - grep -rn "import.*{NombreClase}" apps/ libs/ src/
    - grep -rn "require.*{nombre}" apps/ libs/ src/

  buscar_uso:
    - grep -rn "{NombreClase}" apps/ libs/ src/ --include="*.ts"
    - grep -rn "{nombre_funcion}\(" apps/ libs/ src/

  buscar_referencias_bd:
    - grep -rn "REFERENCES.*{tabla}" database/
    - grep -rn "{tabla}\." apps/ libs/ src/

output:
  formato: |
    ## Dependientes (los que dependen de este)
    | Archivo | Linea | Tipo de Uso |
    |---------|-------|-------------|
    | {ruta}  | {linea} | {import/call/extends} |
```

### Paso 3: Evaluar Impacto
```yaml
accion: "Clasificar el nivel de impacto del cambio"

clasificacion:
  ALTO:
    condiciones:
      - Mas de 5 dependientes
      - Cambio es breaking (firma, estructura, nombre)
      - Afecta multiples capas (DB + BE + FE)
      - Afecta modulo compartido
    acciones:
      - Listar TODOS los archivos afectados
      - Incluir actualizacion de dependientes en plan
      - Considerar migracion gradual
      - Verificar tests existentes

  MEDIO:
    condiciones:
      - 2-5 dependientes
      - Cambio es aditivo (nuevo campo, nueva funcion)
      - Afecta una capa principalmente
    acciones:
      - Listar archivos afectados
      - Evaluar si dependientes necesitan cambios
      - Actualizar tests si existen

  BAJO:
    condiciones:
      - 0-1 dependientes
      - Cambio interno (no afecta API publica)
      - Refactoring sin cambio de comportamiento
    acciones:
      - Proceder con precaucion normal
      - Verificar build y lint
```

### Paso 4: Generar Plan de Modificacion
```yaml
accion: "Proponer orden de modificacion basado en dependencias"

reglas_orden:
  1. Modificar dependencias primero (lo que importa)
  2. Modificar archivo principal
  3. Modificar dependientes (los que importan)
  4. Actualizar tests
  5. Validar build completo

ejemplo:
  si_modifica: "UserEntity"
  orden_sugerido:
    1. user.entity.ts (archivo principal)
    2. user.service.ts (usa UserEntity)
    3. user.controller.ts (usa UserService)
    4. user.dto.ts (si hay cambios de estructura)
    5. user.spec.ts (tests)
    6. components usando user (frontend)
```

---

## Formato de Reporte

```markdown
## Analisis de Dependencias

### Archivo a Modificar
- Ruta: {ruta_completa}
- Tipo: {entity|service|component|table|...}
- Proyecto: {proyecto}

### Tipo de Cambio
- Descripcion: {que se va a cambiar}
- Breaking: {SI | NO}
- Afecta API Publica: {SI | NO}

### Dependencias (de los que depende)
| # | Archivo | Tipo |
|---|---------|------|
| 1 | {ruta}  | {import/extends} |

### Dependientes (los que dependen de este)
| # | Archivo | Linea | Tipo de Uso | Requiere Cambio |
|---|---------|-------|-------------|-----------------|
| 1 | {ruta}  | {n}   | {import}    | {SI/NO/EVALUAR} |

### Clasificacion de Impacto
**Nivel: {ALTO | MEDIO | BAJO}**

Razon: {explicacion}

### Plan de Modificacion Sugerido
1. {paso_1}
2. {paso_2}
...

### Archivos a Incluir en el Plan
- [ ] {archivo_1}
- [ ] {archivo_2}
...

### Advertencias
{lista_de_advertencias_si_aplica}
```

---

## Casos Especiales

### Cambio en Entity de Base de Datos
```yaml
si_modifica: "*.entity.ts"
buscar_adicional:
  - Archivo de migracion relacionado
  - DTOs que exponen la entity
  - Services que usan la entity
  - Controllers que exponen endpoints
  - Componentes frontend que muestran datos

verificar:
  - Coherencia con esquema DDL
  - Migracion necesaria si es produccion
  - Validaciones en DTOs
```

### Cambio en Tabla DDL
```yaml
si_modifica: "*.sql (CREATE TABLE, ALTER TABLE)"
buscar_adicional:
  - Entity correspondiente en backend
  - Otras tablas con FOREIGN KEY
  - Vistas que usan la tabla
  - Funciones/triggers que referencian

verificar:
  - Script recreate-database.sh actualizado
  - Migracion para produccion
  - Seed data si aplica
```

### Cambio en Servicio Compartido
```yaml
si_modifica: "shared/modules/*.ts"
buscar_adicional:
  - Todos los proyectos que importan el modulo
  - Proyectos en projects/ que usan shared/

alerta: |
  ATENCION: Cambio en modulo compartido.
  Este cambio puede afectar multiples proyectos.

  Considerar:
  1. Versionado del modulo
  2. Cambio backward-compatible si es posible
  3. Propagacion coordinada a proyectos
```

---

## Ejemplos de Ejecucion

### Ejemplo 1: Modificar Entity
```
Usuario: Modificar UserEntity para agregar campo email_verified

Sistema:
== TRIGGER-ANALISIS-DEPENDENCIAS ACTIVADO ==

### Archivo a Modificar
- Ruta: apps/api/src/modules/users/entities/user.entity.ts
- Tipo: Entity

### Dependencias
| Archivo | Tipo |
|---------|------|
| typeorm | import |
| base.entity.ts | extends |

### Dependientes (12 encontrados)
| Archivo | Linea | Tipo | Requiere Cambio |
|---------|-------|------|-----------------|
| user.service.ts | 5 | import | EVALUAR |
| user.controller.ts | 8 | import | NO |
| auth.service.ts | 12 | import | NO |
| create-user.dto.ts | 3 | reference | SI |
| update-user.dto.ts | 3 | reference | SI |
| user.spec.ts | 10 | import | SI |
... (6 mas)

### Impacto: ALTO (>5 dependientes, cambio de estructura)

### Plan Sugerido
1. Actualizar user.entity.ts (agregar campo)
2. Actualizar create-user.dto.ts (agregar campo opcional)
3. Actualizar update-user.dto.ts (agregar campo)
4. Actualizar user.spec.ts (agregar tests)
5. Verificar migracion de BD necesaria
6. Build + lint + test
```

### Ejemplo 2: Cambio Bajo Impacto
```
Usuario: Refactorizar metodo interno en PaymentService

Sistema:
== TRIGGER-ANALISIS-DEPENDENCIAS ACTIVADO ==

### Archivo a Modificar
- Ruta: apps/api/src/modules/payments/payment.service.ts
- Tipo: Service

### Dependientes (2 encontrados)
| Archivo | Tipo | Requiere Cambio |
|---------|------|-----------------|
| payment.controller.ts | import | NO (metodo interno) |
| payment.spec.ts | import | EVALUAR (tests) |

### Impacto: BAJO (metodo interno, no afecta API publica)

### Plan Sugerido
1. Refactorizar metodo en payment.service.ts
2. Actualizar tests si cambia comportamiento
3. Build + lint
```

---

## Integracion con Modos

### En MODE-FULL
- Se ejecuta siempre en Fase A
- Resultado incluido en plan de Fase P

### En MODE-QUICK
- NO se ejecuta (cambios menores no requieren)
- Si build falla, escalar a MODE-FULL

### En MODE-ANALYSIS
- Se ejecuta para generar reporte de impacto
- No se incluye plan de ejecucion

---

*TRIGGER-ANALISIS-DEPENDENCIAS v1.0.0 - Sistema SAAD*
