---
name: SIMCO-POST-TASK-SYNC
version: "1.0.0"
date: "2026-03-03"
alias: "@POST_TASK_SYNC"
sistema: "SIMCO v4.0.0"
tipo: "Directiva Operacional"
criticidad: OBLIGATORIA
aplica_a: "Todo agente que complete una tarea que modifica >=1 archivo en apps/"
depende_de:
  - SIMCO-INVENTARIOS.md
  - SIMCO-VALIDACION-SSOT.md
  - SIMCO-TAREA.md
---

# SIMCO-POST-TASK-SYNC

**Version:** 1.0.0
**Fecha:** 2026-03-03
**Aplica a:** Todo agente que complete una tarea que modifica >=1 archivo en apps/
**Criticidad:** OBLIGATORIA — BLOQUEANTE (gate de Fase D)
**Tipo:** Directiva Operacional
**Alias:** @POST_TASK_SYNC
**Depende de:** SIMCO-INVENTARIOS.md, SIMCO-VALIDACION-SSOT.md, SIMCO-TAREA.md

---

## 0. Proposito

Esta directiva cierra el gap sistematico entre la Fase E de CAPVED (codigo completo) y la Fase D (documentacion y sincronizacion de inventarios). Historicamente, la sincronizacion de inventarios estaba descrita de forma dispersa en tres lugares distintos — CHECKLIST-GATE-POST-EJECUCION, SIMCO-VALIDACION-SSOT seccion 5.2, y SIMCO-TAREA seccion D.4 — lo que generaba omisiones por falta de un protocolo unico y ejecutable.

Esta directiva consolida todo ese comportamiento en un unico procedimiento canonico con:
- Un trigger de activacion claro y verificable
- Deteccion automatica de dominios afectados segun paths modificados
- Reglas de actualizacion especificas por inventario
- Version bumping con semantica definida
- Tabla de propagacion de metricas con tolerancias explicitas
- Secuencia de cascada ordenada e irrompible
- Checklist de 10 items como gate final de la Fase D

Esta directiva se activa al comienzo de la Fase D de CAPVED. Su checklist es BLOQUEANTE: la tarea NO puede marcarse como COMPLETADA hasta que los 10 items esten verificados.

---

## 1. Trigger — Cuando Ejecutar

### 1.1 Condicion de Activacion

```bash
# Ejecutar este comando al iniciar Fase D:
git diff --name-only HEAD | grep -E "^apps/"
```

Si el comando produce al menos una linea de output, esta directiva se activa de forma obligatoria y BLOQUEANTE para el cierre de la tarea.

### 1.2 Regla de Activacion

```yaml
trigger: POST_TASK_SYNC
dispara_cuando:
  condicion: "git diff --name-only HEAD | grep -E '^apps/' produce >= 1 linea"
  momento: "Inicio de Fase D de CAPVED — no al final, al inicio"
  caracter: "BLOQUEANTE — la Fase D no puede cerrarse sin completar el checklist"

NO_dispara_cuando:
  - "La tarea fue ANALYSIS-only (modo ANALYSIS en SIMCO-TAREA)"
  - "Cero archivos modificados en apps/ — solo docs/ o orchestration/ cambiados"
  - "La tarea fue un spike sin commit de codigo"

excepcion_documentar:
  si_se_omite: "Registrar en PROXIMA-ACCION.md como RETROACTIVE SYNC pendiente (ver seccion 9C)"
```

### 1.3 Verificacion Rapida

```bash
# Conteo por dominio (ejecutar antes de la secuencia de actualizacion):
git diff --name-only HEAD | grep "^apps/database/ddl/"    # DATABASE
git diff --name-only HEAD | grep "^apps/backend/src/"     # BACKEND
git diff --name-only HEAD | grep "^apps/frontend/src/"    # FRONTEND
git diff --name-only HEAD | grep "^apps/database/seeds/"  # SEEDS
```

---

## 2. Auto-Deteccion de Dominios Afectados

### 2.1 Mapeo Path → Inventario

Cuando el trigger se activa, detectar automaticamente que inventarios requieren actualizacion segun los paths modificados:

| Path Prefix | Inventario a Actualizar | Alias |
|-------------|------------------------|-------|
| `apps/database/ddl/` | `orchestration/inventarios/DATABASE_INVENTORY.yml` | @INV_DB |
| `apps/backend/src/` | `orchestration/inventarios/BACKEND_INVENTORY.yml` | @INV_BE |
| `apps/frontend/src/` | `orchestration/inventarios/FRONTEND_INVENTORY.yml` | @INV_FE |
| `apps/database/seeds/` | `orchestration/inventarios/SEEDS_INVENTORY.yml` | @INV_SEEDS |

### 2.2 Regla de Activacion Parcial

Solo actualizar los inventarios cuyos paths correspondientes aparecen en el diff. Si una tarea solo modifica `apps/backend/src/`, unicamente BACKEND_INVENTORY.yml y MASTER_INVENTORY.yml necesitan actualizacion. No actualizar inventarios de dominios no tocados.

### 2.3 Orden de Actualizacion Obligatorio

El orden de actualizacion siempre es el siguiente, sin importar cuantos dominios esten afectados:

```
1. DATABASE_INVENTORY.yml   (si apps/database/ddl/ fue modificado)
     ↓
2. BACKEND_INVENTORY.yml    (si apps/backend/src/ fue modificado)
     ↓
3. FRONTEND_INVENTORY.yml   (si apps/frontend/src/ fue modificado)
     ↓
4. SEEDS_INVENTORY.yml      (si apps/database/seeds/ fue modificado)
     ↓
5. MASTER_INVENTORY.yml     (siempre — agrega + bumps version)
     ↓
6. CLAUDE.md                (si metricas superan tolerancia definida en Seccion 5)
```

**Razon del orden:** Las capas inferiores (DB) son fuente de verdad para las capas superiores (BE, FE). MASTER agrega todo. CLAUDE.md es la vista ejecutiva que refleja MASTER.

---

## 3. Reglas de Actualizacion por Dominio

### 3.1 DATABASE_INVENTORY.yml

```yaml
cuando_actualizar:
  nueva_tabla:
    accion: "Agregar entrada en schema correspondiente"
    campos_requeridos: [nombre, columnas, indices, foreign_keys, estado, rls]
    tambien: "Incrementar total_tablas en resumen"
    ejemplo: "total_tablas: 173 → 174"

  nueva_funcion:
    accion: "Agregar entrada en funciones del schema"
    campos_requeridos: [nombre, tipo, parametros, descripcion]
    tambien: "Incrementar total_funciones en resumen"

  nuevo_trigger:
    accion: "Agregar entrada en triggers del schema"
    campos_requeridos: [nombre, tabla, evento, timing, funcion]
    tambien: "Incrementar total_triggers en resumen"

  nueva_vista:
    accion: "Agregar entrada en vistas"
    tambien: "Incrementar total_vistas si existe ese campo en resumen"

  tabla_eliminada:
    accion: "Marcar estado: eliminada o remover entrada segun politica"
    tambien: "Decrementar total_tablas en resumen"

  columna_agregada:
    accion: "Actualizar campo columnas de la tabla afectada"
    no_cambia_conteos_globales: true
```

### 3.2 BACKEND_INVENTORY.yml

```yaml
cuando_actualizar:
  nuevo_service:
    accion: "Agregar entrada en services del modulo"
    tambien: "Incrementar total_services en resumen"
    ejemplo: "total_services: 173 → 174"

  nueva_entity:
    accion: "Agregar entrada en entities del modulo"
    tambien: "Incrementar total_entities en resumen (actualmente 156 files / 157 classes)"
    nota: "Si el archivo .entity.ts contiene 2 clases, incrementar en 2 el conteo de classes"

  nuevo_controller:
    accion: "Agregar entrada en controllers del modulo"
    tambien: "Incrementar total_controllers en resumen"

  nuevos_endpoints:
    accion: "Agregar entradas en endpoints del modulo (metodo, ruta, descripcion, auth, roles)"
    tambien: "Incrementar total_endpoints en resumen"
    ejemplo: "total_endpoints: 915 → 916"

  nuevo_dto:
    accion: "Incrementar conteo de DTOs del modulo afectado"
    tambien: "Incrementar total_dtos en resumen si existe"

  modulo_estado_cambia:
    accion: "Actualizar campo estado del modulo (implementado / parcial / pendiente)"
```

### 3.3 FRONTEND_INVENTORY.yml

```yaml
cuando_actualizar:
  nuevo_componente_tsx:
    accion: "Agregar entrada en componentes (shared o features segun ubicacion)"
    tambien: "Incrementar total_componentes en resumen"
    ejemplo: "total_componentes: 575 → 576"
    contar_solo: "Archivos .tsx en apps/frontend/src/ (excluir e2e, tests, stories)"

  nuevo_hook:
    accion: "Agregar entrada en hooks"
    tambien: "Incrementar total_hooks en resumen"
    ejemplo: "total_hooks: 132 → 133"

  nueva_pagina:
    accion: "Agregar entrada en paginas del portal correspondiente"
    tambien: "Incrementar total_paginas en resumen"

  nueva_mecanica_ejercicio:
    accion: "Agregar entrada en mecanicas"
    tambien: "Actualizar mecanicas_ejercicio (actualmente 29)"
    criticidad: "TOLERANCIA 0% — siempre propagar (ver Seccion 5)"

  nuevo_store:
    accion: "Agregar entrada en stores"
    tambien: "Incrementar total_stores en resumen"
```

### 3.4 SEEDS_INVENTORY.yml

```yaml
cuando_actualizar:
  seed_modificado:
    accion: "Actualizar campo updated o timestamp del seed en el inventario"
    tambien: "Registrar naturaleza del cambio en el campo descripcion o notas"

  nuevo_archivo_seed:
    accion: "Agregar entrada completa en el inventario"
    campos_requeridos: [archivo, entorno, descripcion, registros_aproximados, orden_carga]
    tambien: "Verificar que el orden de carga es consistente con dependencias FK"

  seed_eliminado:
    accion: "Marcar como inactivo o eliminar entrada segun politica de limpieza"

  conteo_registros_cambia:
    accion: "Actualizar campo registros_aproximados con conteo real"
    nota: "Contar INSERT/VALUES en el archivo, no confiar en comentarios SQL del propio seed"
```

---

## 4. Reglas de Version Bumping

### 4.1 Semantica de Version para Inventarios

```yaml
PATCH (x.y.Z+1):
  cuando: "Actualizar un conteo o metrica existente sin agregar nueva entrada estructural"
  ejemplos:
    - "total_endpoints 915 → 916 por endpoint nuevo en modulo existente"
    - "total_hooks 132 → 133 por hook nuevo en feature existente"
    - "Correccion de conteo incorrecto detectado"
  rango_tipico: "La mayoria de los bumps post-tarea son PATCH"

MINOR (x.Y+1.0):
  cuando: "Agregar un nuevo modulo, schema, portal o categoria de entrada que no existia"
  ejemplos:
    - "Nuevo modulo backend incorporado al inventario"
    - "Nuevo schema de base de datos documentado"
    - "Nueva seccion de inventario agregada (e.g., nuevo tipo de mecanica)"
  rango_tipico: "Sprint nuevo, feature significativa"

MAJOR (X+1.0.0):
  cuando: "Reestructuracion del schema YAML del inventario (cambio de campos raiz, renombramiento de secciones)"
  requiere: "ADR aprobado antes de ejecutar"
  ejemplos:
    - "Cambiar clave 'modulos' por 'modules' en BACKEND_INVENTORY"
    - "Fusionar dos inventarios en uno"
  rango_tipico: "Muy infrecuente — requiere decision arquitectonica"
```

### 4.2 Regla de Propagacion de Version

```yaml
regla_cascada_version:
  cuando_dominio_bumps: "Siempre bump MASTER_INVENTORY.yml tambien"
  logica:
    - "Si DATABASE bumpa PATCH → MASTER bumpa PATCH"
    - "Si BACKEND bumpa MINOR → MASTER bumpa MINOR"
    - "Si cualquier dominio bumpa MAJOR → MASTER requiere ADR y bumpa MAJOR"
  excepcion: "Si multiples dominios bumpan en la misma tarea, el nivel mas alto gana"
  ejemplo: "BE PATCH + FE MINOR → MASTER bumpa MINOR"

changelog_entry:
  obligatorio: true
  formato: |
    changelog:
      - version: "x.y.z"
        fecha: "YYYY-MM-DD"
        cambios:
          - "Descripcion concisa del cambio"
```

---

## 5. Tabla de Propagacion de Metricas

Las siguientes metricas tienen fuente canonica en un inventario de dominio y DEBEN propagarse a los destinos indicados cuando la diferencia supera la tolerancia.

| Metrica | Valor Actual | Fuente Canonica | Propagar a | Tolerancia |
|---------|-------------|-----------------|-----------|-----------|
| tablas | 173 | DATABASE_INVENTORY.yml (total_tablas) | MASTER_INVENTORY.yml, CLAUDE.md (seccion METRICAS) | 5% (~8 tablas) |
| entities (files) | 156 | BACKEND_INVENTORY.yml (total_entity_files) | MASTER_INVENTORY.yml, CLAUDE.md (seccion Backend) | 5% (~7 entities) |
| entities (classes) | 157 | BACKEND_INVENTORY.yml (total_entity_classes) | MASTER_INVENTORY.yml, CLAUDE.md | 5% |
| endpoints | 915 | BACKEND_INVENTORY.yml (total_endpoints) | MASTER_INVENTORY.yml, CLAUDE.md, SIMCO-VALIDACION-SSOT (R3) | 5% (~45 endpoints) |
| componentes | 575 | FRONTEND_INVENTORY.yml (total_componentes) | MASTER_INVENTORY.yml, CLAUDE.md (seccion Frontend) | 5% (~28 componentes) |
| hooks | 132 | FRONTEND_INVENTORY.yml (total_hooks) | MASTER_INVENTORY.yml, CLAUDE.md | 5% (~6 hooks) |
| mecanicas_ejercicio | 29 | FRONTEND_INVENTORY.yml (mecanicas_ejercicio) | MASTER_INVENTORY.yml, CLAUDE.md, GLOSARIO.md | 0% — siempre propagar |
| standards_count | 37 | Conteo real de docs/40-standards/*.md | MASTER_INVENTORY.yml, SIMCO-ESTANDARES.md (catalogo) | 0% — siempre propagar |
| ADRs | 48 | Conteo real de docs/90-adr/ADR-*.md | MASTER_INVENTORY.yml, CLAUDE.md (seccion ADRs) | 0% — siempre propagar |

### 5.1 Interpretacion de Tolerancia

```yaml
tolerancia_5_pct:
  significado: "Si el conteo real difiere en <=5% del valor en inventario, no es bloqueante pero SI debe actualizarse"
  accion_recomendada: "Siempre actualizar aunque este dentro de tolerancia, para evitar acumulacion de drift"
  accion_obligatoria: "Si diferencia > 5%, actualizacion es BLOQUEANTE antes de cerrar tarea"

tolerancia_0_pct:
  significado: "Cualquier diferencia, por minima que sea, requiere propagacion inmediata"
  aplica_a: "mecanicas_ejercicio, standards_count, ADRs — conteos con impacto en documentacion externa"
  razon: "Estos conteos aparecen en GLOSARIO, SIMCO-ESTANDARES y CLAUDE.md como referencias normativas"
```

---

## 6. Secuencia de Actualizacion en Cascada

Ejecutar los siguientes 5 pasos en orden estricto. No saltar pasos ni invertir el orden.

### Paso 1: Actualizar Inventarios de Dominio (Solo los Afectados)

Aplicar las reglas de la Seccion 3 para cada dominio cuyo path aparece en el diff. Verificar conteos contra el filesystem real — no copiar del output del subagente ni de sesiones anteriores.

```bash
# Contar antes de editar el inventario (ejemplos):
find apps/backend/src -name "*.entity.ts" | wc -l          # entities files
find apps/frontend/src -name "*.tsx" | wc -l               # componentes tsx (crudo)
grep -r "@Get\|@Post\|@Put\|@Delete\|@Patch" apps/backend/src/modules/ | wc -l  # endpoints
```

### Paso 2: Actualizar MASTER_INVENTORY.yml

Con los nuevos conteos de los inventarios de dominio, actualizar MASTER_INVENTORY.yml:
- Actualizar todas las metricas agregadas que cambiaron
- Bump de version segun reglas de Seccion 4
- Agregar entrada en changelog con fecha y descripcion del cambio

### Paso 3: Actualizar CLAUDE.md (si Tolerancia Superada)

Comparar las metricas en CLAUDE.md (seccion METRICAS ACTUALES) contra los nuevos valores en MASTER_INVENTORY.yml. Si cualquier valor supera la tolerancia definida en Seccion 5, actualizar CLAUDE.md directamente.

Tambien actualizar el porcentaje de estado de los modulos afectados si cambio significativamente (e.g., un modulo pasa de 75% a 85%).

### Paso 4: Actualizar SIMCO-VALIDACION-SSOT.md (Numeros de Version)

En la seccion 2.1 de SIMCO-VALIDACION-SSOT.md, actualizar los numeros de version de los inventarios que fueron bumpeados en este ciclo:

```yaml
# Ejemplo de lo que actualizar:
| MASTER_INVENTORY.yml | @INV_MASTER | Estado consolidado del proyecto | v14.9.5 |  # <- nuevo
| BACKEND_INVENTORY.yml | @INV_BE | Modulos, entities, endpoints | v5.3.4 |   # <- nuevo si cambio
```

### Paso 5: Actualizar PROXIMA-ACCION.md

Registrar un resumen de la sincronizacion ejecutada. El formato minimo es:

```yaml
# En la seccion de ultima sesion o sesion actual:
post_task_sync:
  fecha: "YYYY-MM-DD"
  tarea: "Descripcion breve de la tarea que origino el sync"
  dominios_actualizados: [DATABASE, BACKEND, FRONTEND, SEEDS]  # solo los que aplican
  master_version: "v14.X.Y → v14.X.Z"
  metricas_cambiadas:
    - "endpoints: 915 → 916"
    - "services: 173 → 174"
  claude_md_actualizado: true | false
```

---

## 7. Checklist de Validacion

Completar todos los items antes de marcar la tarea como COMPLETADA. Este checklist es el gate final de la Fase D.

```
POST-TASK-SYNC CHECKLIST — Gate Final Fase D
============================================

[ ] 1. git diff --name-only HEAD | grep "^apps/" confirma >= 1 archivo modificado en apps/
        (Si 0 archivos: esta directiva no aplica — registrar excepcion y continuar)

[ ] 2. Deteccion de dominios afectados completada:
        - Identificados todos los path prefixes del diff
        - Mapeados a inventarios correspondientes (Seccion 2.1)

[ ] 3. DATABASE_INVENTORY.yml actualizado (si apps/database/ddl/ fue modificado):
        - Nuevas tablas / funciones / triggers agregados
        - Conteos en resumen actualizados
        - Version bumpeada

[ ] 4. BACKEND_INVENTORY.yml actualizado (si apps/backend/src/ fue modificado):
        - Nuevos services / entities / controllers / endpoints agregados
        - Conteos en resumen actualizados
        - Version bumpeada

[ ] 5. FRONTEND_INVENTORY.yml actualizado (si apps/frontend/src/ fue modificado):
        - Nuevos componentes / hooks / paginas agregados
        - Conteos en resumen actualizados
        - Version bumpeada

[ ] 6. SEEDS_INVENTORY.yml actualizado (si apps/database/seeds/ fue modificado):
        - Seeds modificados tienen timestamp actualizado
        - Seeds nuevos tienen entrada completa

[ ] 7. MASTER_INVENTORY.yml actualizado:
        - Todas las metricas agregadas reflejan nuevos valores de dominio
        - Version bumpeada con el nivel correcto (PATCH / MINOR / MAJOR)
        - Entrada de changelog agregada con fecha y descripcion

[ ] 8. CLAUDE.md metricas actualizadas (si alguna metrica supero su tolerancia):
        - Seccion "METRICAS ACTUALES" refleja valores de MASTER
        - Estados de modulos actualizados si corresponde

[ ] 9. SIMCO-VALIDACION-SSOT.md seccion 2.1 actualizada:
        - Numeros de version de inventarios coinciden con los bumpeados en este ciclo

[ ] 10. PROXIMA-ACCION.md actualizado con resumen de sync:
         - Dominios actualizados listados
         - Transicion de version de MASTER registrada
         - Metricas cambiadas enumeradas

→ 10/10 marcados: TAREA COMPLETADA — puede cerrarse y commitearse
→ < 10/10: COMPLETAR ITEMS PENDIENTES ANTES DE COMMIT
```

---

## 8. Integracion con Fase D de CAPVED

Esta directiva es la implementacion operacional del paso D.4 de CAPVED ("Actualizar inventarios"). El mapa de correspondencia es:

```yaml
capved_fase_d:
  D1_diagramas_modelos:     "No cubre — responsabilidad del agente segun tarea"
  D2_specs_tecnicas:        "No cubre — responsabilidad del agente segun tarea"
  D3_adr:                   "No cubre — SIMCO-TAREA D.3 aplica si hay decision arquitectonica"
  D4_actualizar_inventarios: "CUBIERTO por esta directiva — ejecutar @POST_TASK_SYNC"
  D5_actualizar_trazas:     "Parcialmente cubierto — Paso 5 (PROXIMA-ACCION) es el minimo; trazas detalladas son responsabilidad adicional"
  D6_vincular_hus_derivadas: "No cubre — responsabilidad del agente segun tarea"
  D7_lecciones_aprendidas:  "No cubre — responsabilidad del agente segun tarea"

gate_d8_checklist:
  pre_condicion: "El checklist de Seccion 7 de esta directiva debe estar 10/10"
  relacion: "Item D.8 de CAPVED 'Inventarios actualizados' se considera PASS solo cuando Seccion 7 esta completa"
  bloqueo: "Si el checklist no esta 10/10, el Gate D8 de CAPVED NO puede marcarse como superado"
```

### 8.1 Posicion en el Flujo

```
CAPVED Fase E completada (build/lint/tests pasan)
  |
  v
Inicio de Fase D
  |
  +-- D1: Diagramas/Modelos (si aplica)
  +-- D2: Specs Tecnicas (si aplica)
  +-- D3: ADR (si aplica)
  +-- D4: EJECUTAR @POST_TASK_SYNC  ← ESTA DIRECTIVA (BLOQUEANTE)
  |        Completa Checklist 10/10
  +-- D5: Actualizar Trazas (si aplica)
  +-- D6-D7: HUs derivadas + Lecciones (si aplica)
  |
  v
Gate D8 — TAREA COMPLETADA
```

---

## 9. Protocolo de Recuperacion

Tres escenarios de anomalia y su resolucion:

### Escenario A: Version Drift Detectado Mid-Session

**Descripcion:** Durante la sesion actual se detecta que un inventario tiene versiones o conteos desactualizados provenientes de sesiones previas.

**Resolucion:**
```yaml
pasos:
  1: "DETENER la tarea actual temporalmente"
  2: "Ejecutar conteo real desde filesystem para el dominio afectado (ver comandos Seccion 6 Paso 1)"
  3: "Actualizar el inventario de dominio con el conteo real"
  4: "Propagar en cascada segun Seccion 6"
  5: "Registrar en PROXIMA-ACCION.md: 'Drift retroactivo corregido en [dominio] — conteo previo era [X], real es [Y]'"
  6: "Continuar tarea original"
```

### Escenario B: CLAUDE.md Divergido en mas de 10%

**Descripcion:** Al comparar CLAUDE.md con MASTER_INVENTORY.yml, la diferencia en alguna metrica supera el 10% (doble de la tolerancia normal del 5%).

**Resolucion:**
```yaml
pasos:
  1: "Tratar como MINOR update aunque los cambios de la tarea actual sean solo PATCH"
  2: "Corregir todas las metricas divergidas en CLAUDE.md en el mismo ciclo"
  3: "Bump MINOR en MASTER si el drift corresponde a multiples tareas acumuladas"
  4: "Agregar nota en changelog: 'Correccion de drift acumulado — metricas [lista] sincronizadas'"
  5: "Considerar ejecutar auditoria periodica de inventarios (SIMCO-VALIDACION-SSOT seccion 5.3)"
```

### Escenario C: Sync Omitido en Sesion Previa (RETROACTIVE SYNC)

**Descripcion:** Se detecta que una tarea anterior concluyo sin ejecutar POST-TASK-SYNC. Los inventarios no reflejan los cambios de esa tarea.

**Resolucion:**
```yaml
pasos:
  1: "Identificar la tarea omitida via git log — revisar commits que tocan apps/ sin bump de inventarios"
  2: "Ejecutar git diff [commit_anterior]..HEAD -- apps/ para obtener lista completa de archivos cambiados"
  3: "Ejecutar POST-TASK-SYNC como si fuera la Fase D de esa tarea omitida"
  4: "Documentar en PROXIMA-ACCION.md: 'RETROACTIVE SYNC ejecutado para tarea [ID/descripcion] — commit [hash]'"
  5: "Continuar con la tarea actual normalmente"
nota: "No bloquear la tarea actual por el retroactive sync — completarlo y documentarlo, luego avanzar"
```

---

## 10. Anti-Patrones

Los siguientes comportamientos estan PROHIBIDOS y constituyen violaciones de esta directiva:

```yaml
anti_patrones:
  AP-01:
    nombre: "Actualizar MASTER sin dominio primero"
    descripcion: "Editar MASTER_INVENTORY.yml directamente con conteos nuevos sin haber actualizado primero el inventario de dominio correspondiente"
    consecuencia: "MASTER y el inventario de dominio quedan incoherentes entre si"
    correcto: "Siempre seguir el orden: dominio → MASTER → CLAUDE.md"

  AP-02:
    nombre: "Copiar conteos de sesion previa sin verificar filesystem"
    descripcion: "Usar el conteo de entities/endpoints/componentes reportado en MEMORY.md o en un mensaje anterior sin ejecutar el conteo real desde el filesystem"
    consecuencia: "Los inventarios acumulan drift silencioso sesion a sesion"
    correcto: "Siempre ejecutar los comandos de conteo de Seccion 6 Paso 1"

  AP-03:
    nombre: "Omitir sync porque los cambios fueron pequenos"
    descripcion: "Decidir que POST-TASK-SYNC no aplica porque 'solo se modifico un archivo' o 'fue un fix menor'"
    consecuencia: "Los drifts pequenos se acumulan y se vuelven correcciones costosas"
    correcto: "El trigger es binario: >= 1 archivo en apps/ → sync obligatorio"

  AP-04:
    nombre: "Actualizar CLAUDE.md directamente sin pasar por inventarios de dominio"
    descripcion: "Editar la seccion METRICAS ACTUALES de CLAUDE.md como primer paso, sin haber actualizado los inventarios YAML"
    consecuencia: "CLAUDE.md queda desacoplado de los YAML que son la fuente canonica"
    correcto: "CLAUDE.md es el ultimo eslabon de la cascada, nunca el primero"

  AP-05:
    nombre: "Confiar en conteos reportados por subagentes sin verificacion independiente"
    descripcion: "Aceptar el numero que un subagente reporta ('cree X componentes, ahora hay 576') sin verificar con find/grep contra el filesystem real"
    consecuencia: "Errores de conteo del subagente se propagan a los inventarios como verdad"
    correcto: "El agente orquestador verifica conteos independientemente antes de escribir el inventario"

  AP-06:
    nombre: "Delegar el POST-TASK-SYNC completo a un subagente"
    descripcion: "Asignar a un subagente la responsabilidad total de ejecutar esta directiva, incluyendo la decision de que inventarios actualizar y los conteos finales"
    consecuencia: "Perdida de control de coherencia — el subagente no tiene contexto completo de todos los cambios de la sesion"
    correcto: "El agente orquestador ejecuta POST-TASK-SYNC personalmente. Puede delegar conteos parciales a subagentes, pero la verificacion final y escritura de inventarios es responsabilidad del orquestador"
```

---

## 11. Referencias

| Directiva / Archivo | Relacion con esta Directiva |
|--------------------|----------------------------|
| `SIMCO-INVENTARIOS.md` | Define la estructura de los 4 inventarios YAML que esta directiva actualiza |
| `SIMCO-VALIDACION-SSOT.md` | Define las reglas de coherencia entre capas; POST-TASK-SYNC es el mecanismo de cierre de su seccion 5.2 |
| `SIMCO-TAREA.md` | Define el ciclo CAPVED; esta directiva es la implementacion de D.4 y es gate del D.8 |
| `SIMCO-ESTANDARES.md` | Su catalogo de 37 estandares usa el conteo de standards_count definido en Seccion 5 de esta directiva |
| `orchestration/PROXIMA-ACCION.md` | Destino obligatorio del Paso 5 de la secuencia de cascada |
| `orchestration/inventarios/MASTER_INVENTORY.yml` | Inventario agregado — siempre actualizado en Paso 2 |
| `orchestration/inventarios/DATABASE_INVENTORY.yml` | Inventario de dominio DB — actualizado segun Seccion 3.1 |
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | Inventario de dominio BE — actualizado segun Seccion 3.2 |
| `orchestration/inventarios/FRONTEND_INVENTORY.yml` | Inventario de dominio FE — actualizado segun Seccion 3.3 |
| `orchestration/inventarios/SEEDS_INVENTORY.yml` | Inventario de seeds — actualizado segun Seccion 3.4 |

---

**Creado por:** TASK-2026-03-03-DOC-COMPREHENSIVE-REMEDIATION (directiva nueva)
**Basado en:** Consolidacion de CHECKLIST-GATE-POST-EJECUCION + SIMCO-VALIDACION-SSOT s5.2 + SIMCO-TAREA D.4
