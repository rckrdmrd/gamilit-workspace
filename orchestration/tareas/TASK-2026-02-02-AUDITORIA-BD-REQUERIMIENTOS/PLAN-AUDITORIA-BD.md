# PLAN DE AUDITORIA DE BASE DE DATOS VS REQUERIMIENTOS

**Tarea:** TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS
**Sistema:** SIMCO v4.3.0 + NEXUS v4.0
**Metodologia:** CAPVED en todos los niveles
**Fecha:** 2026-02-02

---

## ESTRUCTURA JERARQUICA

```
NIVEL 0: TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS (Esta tarea)
│
├── NIVEL 1: FASE 1 - Reconciliacion de Inventarios (P0)
│   ├── N2: 1.1 - Auditoria real de funciones DDL
│   │   ├── N3: 1.1.1 - Contar funciones por schema
│   │   ├── N3: 1.1.2 - Listar todas las funciones
│   │   └── N3: 1.1.3 - Comparar con inventarios
│   ├── N2: 1.2 - Auditoria real de triggers DDL
│   ├── N2: 1.3 - Auditoria real de tablas DDL
│   ├── N2: 1.4 - Auditoria real de ENUMs DDL
│   └── N2: 1.5 - Consolidar metricas reales
│
├── NIVEL 1: FASE 2 - Trazabilidad DDL-Requerimientos (P0)
│   ├── N2: 2.1 - Mapeo schemas a dominios RF
│   ├── N2: 2.2 - Mapeo tablas a User Stories
│   ├── N2: 2.3 - Mapeo funciones a especificaciones
│   └── N2: 2.4 - Identificar objetos sin trazabilidad
│
├── NIVEL 1: FASE 3 - Deteccion de Anomalias (P1)
│   ├── N2: 3.1 - Detectar funciones duplicadas
│   ├── N2: 3.2 - Detectar triggers duplicados
│   ├── N2: 3.3 - Detectar tablas con funcionalidad redundante
│   └── N2: 3.4 - Identificar objetos huerfanos
│
├── NIVEL 1: FASE 4 - Analisis de Dependencias (P1)
│   ├── N2: 4.1 - Dependencias entre schemas
│   ├── N2: 4.2 - Dependencias de funciones
│   └── N2: 4.3 - Orden de ejecucion DDL
│
└── NIVEL 1: FASE 5 - Consolidacion y Documentacion (P2)
    ├── N2: 5.1 - Actualizar inventarios
    ├── N2: 5.2 - Crear matriz de trazabilidad
    ├── N2: 5.3 - Purgar documentacion obsoleta
    ├── N2: 5.4 - Crear plan de ejecucion ordenado
    └── N2: 5.5 - Commit y cierre de tarea
```

---

## FASE 1: RECONCILIACION DE INVENTARIOS (P0)

**Duracion:** 4 horas
**Dependencias:** Ninguna
**Bloqueante para:** Todas las demas fases
**Paralelizable:** Subtareas 1.1-1.4 pueden ejecutarse en paralelo

### Contexto del Problema

Se detectaron discrepancias severas en conteos:

| Objeto | DATABASE_INVENTORY | MASTER_INVENTORY | PROJECT-STATUS | Delta Max |
|--------|-------------------|------------------|----------------|-----------|
| Funciones | 232 | 15 | 89 | 217 (!) |
| Triggers | 109 | 10 | 37 | 99 (!) |
| ENUMs | 39 | 36 | - | 3 |
| Tablas | 141-147 | 138 | 138-147 | 9 |

**Objetivo:** Establecer metricas reales mediante auditoria directa del DDL.

---

### 1.1 Auditoria Real de Funciones DDL

**CAPVED:**
- **C**ontexto: 3 inventarios reportan 15, 89 y 232 funciones - discrepancia inaceptable
- **A**nalisis: Auditar directamente archivos en apps/database/ddl/schemas/*/functions/
- **P**lanificacion: Contar por schema, luego consolidar
- **V**alidacion: Comparar con scripts de creacion
- **E**jecucion: Ver acciones
- **D**ocumentacion: Actualizar inventario con valores reales

**Acciones Atomicas:**

```
1.1.1 - Contar archivos de funciones por schema
  Comando: find apps/database/ddl/schemas -type f -path "*/functions/*.sql" | wc -l
  Resultado esperado: Numero total de archivos .sql de funciones

1.1.2 - Listar funciones por schema
  Comando: for schema in apps/database/ddl/schemas/*/; do echo "=== $(basename $schema) ===" && ls "$schema/functions/" 2>/dev/null | wc -l; done

1.1.3 - Extraer nombres de funciones (CREATE FUNCTION)
  Comando: grep -rh "CREATE.*FUNCTION" apps/database/ddl/schemas/*/functions/ | grep -oP "(?<=FUNCTION\s)[a-z_]+(?=\s*\()"

1.1.4 - Contar funciones en gamilit/ (funciones compartidas)
  Path: apps/database/ddl/schemas/gamilit/functions/
  Metodo: ls -la | wc -l

1.1.5 - Comparar con DATABASE_INVENTORY.yml
  Verificar: functions_active: 232 vs conteo real
  Accion: Documentar delta
```

**Criterio de Exito:** Conteo real documentado, delta explicado

---

### 1.2 Auditoria Real de Triggers DDL

**CAPVED:**
- **C**ontexto: Triggers reportados como 10, 37 y 109 - discrepancia severa
- **A**nalisis: Auditar apps/database/ddl/schemas/*/triggers/
- **P**lanificacion: Contar archivos y statements CREATE TRIGGER
- **V**alidacion: Verificar triggers activos vs deprecated
- **E**jecucion: Ver acciones
- **D**ocumentacion: Actualizar inventario

**Acciones Atomicas:**

```
1.2.1 - Contar archivos de triggers (excluyendo _deprecated)
  Comando: find apps/database/ddl/schemas -type f -path "*/triggers/*.sql" ! -path "*/_deprecated/*" | wc -l

1.2.2 - Contar statements CREATE TRIGGER
  Comando: grep -rh "CREATE TRIGGER" apps/database/ddl/schemas/*/triggers/ | wc -l

1.2.3 - Listar triggers por schema
  Metodo: for schema in schemas; echo nombre_schema + count triggers

1.2.4 - Verificar triggers deprecated
  Path: apps/database/ddl/schemas/*/triggers/_deprecated/
  Metodo: count files

1.2.5 - Documentar delta con inventarios
```

**Criterio de Exito:** Conteo real de triggers activos

---

### 1.3 Auditoria Real de Tablas DDL

**CAPVED:**
- **C**ontexto: Tablas reportadas entre 134 y 147 segun documento
- **A**nalisis: Contar archivos en apps/database/ddl/schemas/*/tables/
- **P**lanificacion: Por schema, excluyendo _deprecated
- **V**alidacion: Comparar con psql \dt
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista definitiva de tablas

**Acciones Atomicas:**

```
1.3.1 - Contar archivos de tablas (excluyendo deprecated)
  Comando: find apps/database/ddl/schemas -type f -path "*/tables/*.sql" ! -path "*/_deprecated/*" | wc -l

1.3.2 - Listar tablas por schema
  Metodo: for each schema, list tables/*.sql

1.3.3 - Verificar tablas deprecated
  Path: */tables/_deprecated/

1.3.4 - Generar lista definitiva de tablas activas
  Formato: schema.table_name
```

**Criterio de Exito:** Lista de 138+ tablas activas confirmadas

---

### 1.4 Auditoria Real de ENUMs DDL

**CAPVED:**
- **C**ontexto: ENUMs reportados como 36 vs 39
- **A**nalisis: Auditar apps/database/ddl/schemas/*/enums/ y 00-prerequisites.sql
- **P**lanificacion: Contar CREATE TYPE
- **V**alidacion: Comparar con inventario
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de ENUMs

**Acciones Atomicas:**

```
1.4.1 - Contar archivos de ENUMs por schema
  Comando: find apps/database/ddl/schemas -type f -path "*/enums/*.sql" | wc -l

1.4.2 - Contar ENUMs en 00-prerequisites.sql
  Comando: grep -c "CREATE TYPE" apps/database/ddl/00-prerequisites.sql

1.4.3 - Listar todos los ENUMs
  Extraer: schema_name.enum_name

1.4.4 - Comparar con DATABASE_INVENTORY
```

**Criterio de Exito:** Conteo exacto de ENUMs

---

### 1.5 Consolidar Metricas Reales

**CAPVED:**
- **C**ontexto: Resultados de auditorias 1.1-1.4
- **A**nalisis: Consolidar en formato SSOT
- **P**lanificacion: Crear INVENTARIO-RECONCILIADO.yml
- **V**alidacion: Verificar coherencia interna
- **E**jecucion: Escribir archivo
- **D**ocumentacion: Actualizar METADATA.yml

**Acciones Atomicas:**

```
1.5.1 - Compilar metricas de 1.1-1.4
  Formato: { schemas, tables, functions, triggers, enums, indexes, views, rls_policies }

1.5.2 - Crear INVENTARIO-RECONCILIADO.yml
  Contenido: Metricas reales + metodologia + fecha auditoria

1.5.3 - Documentar deltas explicados
  Razon de cada discrepancia identificada

1.5.4 - Actualizar METADATA.yml con hallazgos
```

**Criterio de Exito:** Archivo INVENTARIO-RECONCILIADO.yml creado

---

## FASE 2: TRAZABILIDAD DDL-REQUERIMIENTOS (P0)

**Duracion:** 4 horas
**Dependencias:** Fase 1 (metricas reales)
**Objetivo:** Mapear cada objeto DDL a su requerimiento funcional

---

### 2.1 Mapeo Schemas a Dominios de Requerimientos

**CAPVED:**
- **C**ontexto: 16 schemas, 17 dominios de RF
- **A**nalisis: Establecer correspondencia schema ↔ RF-PREFIX
- **P**lanificacion: Tabla de mapeo
- **V**alidacion: Verificar cobertura 100%
- **E**jecucion: Ver acciones
- **D**ocumentacion: Incluir en matriz

**Acciones Atomicas:**

```
2.1.1 - Listar schemas activos (13)
  auth_management, gamification_system, educational_content, progress_tracking,
  social_features, content_management, audit_logging, system_configuration,
  notifications, lti_integration, admin_dashboard, communication, auth

2.1.2 - Mapear a prefijos RF
  auth_management → RF-AUTH
  gamification_system → RF-GAM
  educational_content → RF-EDU
  progress_tracking → RF-ANA (parcial)
  social_features → RF-PEER, RF-PAR (parcial)
  content_management → RF-CONT
  notifications → RF-NOT
  lti_integration → RF-LTI
  admin_dashboard → RF-ADM, RF-AE
  system_configuration → RF-SYS
  communication → RF-NOT (parcial)

2.1.3 - Identificar schemas sin RF directo
  Candidatos: audit_logging (interno), auth (supabase base)

2.1.4 - Documentar en tabla de mapeo
```

**Criterio de Exito:** 100% schemas mapeados a dominios RF

---

### 2.2 Mapeo Tablas a User Stories

**CAPVED:**
- **C**ontexto: 138+ tablas, 138 User Stories
- **A**nalisis: Relacionar cada tabla a US que la requiere
- **P**lanificacion: Matriz tabla ↔ US
- **V**alidacion: Verificar que todas las US tienen tablas
- **E**jecucion: Ver acciones
- **D**ocumentacion: MATRIZ-TRAZABILIDAD-DDL-RF.yml

**Acciones Atomicas:**

```
2.2.1 - Obtener lista de tablas por schema (de Fase 1)

2.2.2 - Para cada tabla, identificar US relacionada
  Fuentes:
  - Nombre de tabla (ej: user_achievements → US-GAM-001)
  - Documentacion en DDL (comentarios)
  - Especificaciones tecnicas (ET-xxx)

2.2.3 - Crear matriz preliminar
  Formato: table_name | schema | user_story | epic | status

2.2.4 - Identificar tablas sin US clara
  Candidatos: tablas de auditoria, M:N, tracking automatico

2.2.5 - Justificar tablas sin US (infraestructura/tecnico)
```

**Criterio de Exito:** 90%+ tablas con US asignada

---

### 2.3 Mapeo Funciones a Especificaciones Tecnicas

**CAPVED:**
- **C**ontexto: ~89-232 funciones, ~50 especificaciones tecnicas (ET)
- **A**nalisis: Relacionar funciones a ET que las especifican
- **P**lanificacion: Por tipo de funcion
- **V**alidacion: Verificar coherencia
- **E**jecucion: Ver acciones
- **D**ocumentacion: Incluir en matriz

**Acciones Atomicas:**

```
2.3.1 - Categorizar funciones por tipo
  Tipos:
  - Validadores (validate_*) → ET-EDU-xxx
  - Gamificacion (award_*, check_*, promote_*) → ET-GAM-xxx
  - Autenticacion (get_current_*, is_admin) → ET-AUTH-xxx
  - Utilidades (update_updated_at, cleanup_*) → Infraestructura

2.3.2 - Mapear funciones de validacion a ET-EDU
  validate_answer → ET-EDU-004
  validate_true_false → ET-EDU-004
  ... etc.

2.3.3 - Mapear funciones de gamificacion a ET-GAM
  award_ml_coins → ET-GAM-002
  check_rank_promotion → ET-GAM-003
  ... etc.

2.3.4 - Identificar funciones de infraestructura (sin ET directo)
  update_updated_at_column, cleanup_*, retry_*, etc.

2.3.5 - Documentar cobertura de funciones
```

**Criterio de Exito:** Funciones categorizadas y mapeadas a ET

---

### 2.4 Identificar Objetos sin Trazabilidad

**CAPVED:**
- **C**ontexto: Consolidar objetos no mapeados
- **A**nalisis: Listar todos los objetos sin RF/US/ET
- **P**lanificacion: Clasificar en justificados vs huerfanos
- **V**alidacion: Revisar si requieren RF
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de objetos huerfanos

**Acciones Atomicas:**

```
2.4.1 - Compilar lista de tablas sin US

2.4.2 - Compilar lista de funciones sin ET

2.4.3 - Compilar lista de triggers sin funcion clara

2.4.4 - Clasificar cada objeto:
  - JUSTIFICADO: Infraestructura, M:N, auditoría, técnico
  - HUERFANO: Sin justificación aparente - requiere RF o eliminación

2.4.5 - Documentar recomendaciones
  Para cada huerfano: crear RF, deprecar, o eliminar
```

**Criterio de Exito:** Lista de objetos huerfanos con recomendacion

---

## FASE 3: DETECCION DE ANOMALIAS (P1)

**Duracion:** 3 horas
**Dependencias:** Fase 1
**Objetivo:** Identificar duplicidades, conflictos y redundancias

---

### 3.1 Detectar Funciones Duplicadas

**CAPVED:**
- **C**ontexto: Auditoria TASK-022 elimino 10 funciones duplicadas - verificar si hay mas
- **A**nalisis: Buscar funciones con mismo nombre o funcionalidad
- **P**lanificacion: Por nombre y por firma
- **V**alidacion: Comparar implementaciones
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de duplicados

**Acciones Atomicas:**

```
3.1.1 - Extraer lista de nombres de funciones
  Comando: grep -rh "CREATE.*FUNCTION" schemas/*/functions/ | extract names

3.1.2 - Buscar nombres duplicados
  Metodo: sort | uniq -d

3.1.3 - Buscar funciones con firma similar
  Ejemplo: is_feature_enabled(text) vs is_feature_enabled(text, uuid)

3.1.4 - Comparar implementaciones de duplicados
  Si son identicas → candidato a eliminacion
  Si difieren → documentar diferencias

3.1.5 - Documentar acciones recomendadas
```

**Criterio de Exito:** Lista de funciones duplicadas con recomendacion

---

### 3.2 Detectar Triggers Duplicados

**CAPVED:**
- **C**ontexto: TASK-022 elimino 30 triggers deprecated
- **A**nalisis: Verificar que no hay triggers con mismo evento en misma tabla
- **P**lanificacion: Por tabla + evento
- **V**alidacion: Un trigger por (tabla, evento) generalmente
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de duplicados

**Acciones Atomicas:**

```
3.2.1 - Extraer triggers con formato: tabla | evento | nombre
  Ejemplo: users | AFTER INSERT | trg_initialize_user_stats

3.2.2 - Buscar multiples triggers en mismo (tabla, evento)
  Metodo: group by tabla, evento | count > 1

3.2.3 - Verificar si son complementarios o redundantes
  Complementarios: OK si hacen cosas distintas
  Redundantes: Candidatos a merge o eliminacion

3.2.4 - Documentar hallazgos
```

**Criterio de Exito:** Cero triggers redundantes

---

### 3.3 Detectar Tablas con Funcionalidad Redundante

**CAPVED:**
- **C**ontexto: user_activity vs user_activities vs activity_log
- **A**nalisis: Buscar tablas con nombres o columnas similares
- **P**lanificacion: Por patrones de nombre y estructura
- **V**alidacion: Comparar schemas de tablas
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de redundancias

**Acciones Atomicas:**

```
3.3.1 - Buscar tablas con nombres similares
  Patrones: *_log vs *_logs, *_activity vs *_activities
  Ejemplos conocidos: user_activity (deprecated), activity_log, user_activity_logs

3.3.2 - Comparar columnas de tablas similares
  Si columnas 80%+ iguales → redundancia potencial

3.3.3 - Verificar uso en backend
  Grep entities y services para ver cual se usa

3.3.4 - Documentar tablas redundantes con recomendacion
  Mantener 1, deprecar otras
```

**Criterio de Exito:** Tablas redundantes identificadas

---

### 3.4 Identificar Objetos Huerfanos

**CAPVED:**
- **C**ontexto: Objetos DDL que no se usan en backend ni frontend
- **A**nalisis: Cross-reference DDL vs codigo
- **P**lanificacion: Por tipo de objeto
- **V**alidacion: Grep en codigo fuente
- **E**jecucion: Ver acciones
- **D**ocumentacion: Lista de huerfanos

**Acciones Atomicas:**

```
3.4.1 - Para cada tabla, verificar entity en backend
  Metodo: grep table_name apps/backend/src/**/*.entity.ts

3.4.2 - Para cada funcion, verificar uso
  Metodo: Funciones solo usadas en triggers son validas
          Funciones no usadas → candidatas a depreciacion

3.4.3 - Compilar lista de objetos sin uso
  Formato: objeto | tipo | ultima_modificacion | recomendacion

3.4.4 - Priorizar por riesgo de eliminacion
  P0: Objetos claramente no usados
  P1: Objetos con uso ambiguo
  P2: Objetos de infraestructura (no eliminar)
```

**Criterio de Exito:** Lista priorizada de objetos huerfanos

---

## FASE 4: ANALISIS DE DEPENDENCIAS (P1)

**Duracion:** 2 horas
**Dependencias:** Fases 2 y 3
**Objetivo:** Validar orden de creacion y dependencias

---

### 4.1 Dependencias Entre Schemas

**CAPVED:**
- **C**ontexto: 16 schemas con foreign keys entre ellos
- **A**nalisis: Mapear dependencias via FKs
- **P**lanificacion: Grafo de dependencias
- **V**alidacion: Verificar orden en create-database.sh
- **E**jecucion: Ver acciones
- **D**ocumentacion: DEPENDENCY-GRAPH.yml

**Acciones Atomicas:**

```
4.1.1 - Extraer FKs cross-schema
  Buscar: REFERENCES other_schema.table_name

4.1.2 - Construir grafo de dependencias
  Formato: schema_a → schema_b (via table.column)

4.1.3 - Detectar ciclos de dependencia
  Si hay ciclos → requiere FK diferida

4.1.4 - Verificar orden en create-database.sh fases
  Fase 1-16 deben respetar dependencias

4.1.5 - Documentar dependencias no respetadas
```

**Criterio de Exito:** Grafo de dependencias validado

---

### 4.2 Dependencias de Funciones

**CAPVED:**
- **C**ontexto: Funciones que llaman a otras funciones
- **A**nalisis: Mapear llamadas entre funciones
- **P**lanificacion: Por schema
- **V**alidacion: Verificar que dependencias existen
- **E**jecucion: Ver acciones
- **D**ocumentacion: Incluir en grafo

**Acciones Atomicas:**

```
4.2.1 - Para cada funcion, extraer llamadas a otras funciones
  Buscar: SELECT function_name(, PERFORM function_name(

4.2.2 - Verificar que funciones llamadas existen
  Si no existe → ERROR a reportar

4.2.3 - Documentar cadena de dependencias
  Ejemplo: validate_answer() → normalize_text() → update_stats()

4.2.4 - Verificar orden de creacion en DDL
  Funcion dependiente debe crearse despues de dependencia
```

**Criterio de Exito:** Dependencias de funciones validadas

---

### 4.3 Orden de Ejecucion DDL

**CAPVED:**
- **C**ontexto: create-database.sh tiene 17 fases
- **A**nalisis: Verificar que orden es correcto
- **P**lanificacion: Simular ejecucion
- **V**alidacion: Comparar con dependencias mapeadas
- **E**jecucion: Ver acciones
- **D**ocumentacion: Validacion de orden

**Acciones Atomicas:**

```
4.3.1 - Documentar orden actual de create-database.sh
  Fase 1: prerequisites (schemas, enums)
  Fase 2: gamilit functions (shared)
  ...etc.

4.3.2 - Verificar que orden respeta dependencias
  Para cada fase, dependencias deben estar en fases anteriores

4.3.3 - Identificar problemas de orden
  Si hay → documentar fix requerido

4.3.4 - Validar RLS phases (07, 07b, 07c)
  Verificar inclusion correcta
```

**Criterio de Exito:** Orden de ejecucion DDL validado

---

## FASE 5: CONSOLIDACION Y DOCUMENTACION (P2)

**Duracion:** 3 horas
**Dependencias:** Todas las fases anteriores
**Objetivo:** Actualizar inventarios, documentar hallazgos, plan de accion

---

### 5.1 Actualizar Inventarios

**CAPVED:**
- **C**ontexto: Inventarios con metricas incorrectas
- **A**nalisis: Aplicar metricas reales de Fase 1
- **P**lanificacion: Actualizar 3 inventarios
- **V**alidacion: Verificar coherencia entre ellos
- **E**jecucion: Ver acciones
- **D**ocumentacion: Commit con cambios

**Acciones Atomicas:**

```
5.1.1 - Actualizar DATABASE_INVENTORY.yml
  Campos: functions, triggers, tables, enums, indexes

5.1.2 - Actualizar MASTER_INVENTORY.yml
  Campos: database.functions, database.triggers (corregir 15→real)

5.1.3 - Actualizar PROJECT-STATUS.md
  Seccion: Metricas Reales Auditadas

5.1.4 - Verificar coherencia
  Los 3 documentos deben reportar mismas cifras
```

**Criterio de Exito:** Inventarios coherentes y actualizados

---

### 5.2 Crear Matriz de Trazabilidad

**CAPVED:**
- **C**ontexto: Resultados de Fase 2
- **A**nalisis: Consolidar en YAML estructurado
- **P**lanificacion: Formato estandar
- **V**alidacion: Verificar completitud
- **E**jecucion: Escribir archivo
- **D**ocumentacion: Registrar en METADATA

**Acciones Atomicas:**

```
5.2.1 - Crear MATRIZ-TRAZABILIDAD-DDL-RF.yml
  Secciones:
  - schemas_to_domains
  - tables_to_user_stories
  - functions_to_specifications
  - orphaned_objects

5.2.2 - Incluir estadisticas de cobertura
  tables_with_us: XX/YY (ZZ%)
  functions_with_et: XX/YY (ZZ%)

5.2.3 - Documentar justificaciones de objetos sin RF
```

**Criterio de Exito:** Matriz de trazabilidad completa

---

### 5.3 Purgar Documentacion Obsoleta

**CAPVED:**
- **C**ontexto: Tareas antiguas, documentacion desactualizada
- **A**nalisis: Identificar candidatos a purga (de TASK-2026-01-31)
- **P**lanificacion: Ejecutar purga segura
- **V**alidacion: Verificar no hay referencias
- **E**jecucion: rm -rf o archivar
- **D**ocumentacion: Registrar purga

**Acciones Atomicas:**

```
5.3.1 - Verificar y purgar _archive/ si aun existe
  Verificar: ls orchestration/_archive/

5.3.2 - Purgar docs/99-finiquito/archivados/ si existe

5.3.3 - Consolidar auditorias duplicadas

5.3.4 - Documentar archivos purgados
```

**Criterio de Exito:** Documentacion limpia

---

### 5.4 Crear Plan de Ejecucion Ordenado

**CAPVED:**
- **C**ontexto: Hallazgos de todas las fases
- **A**nalisis: Priorizar acciones por impacto y dependencias
- **P**lanificacion: Orden logico de ejecucion
- **V**alidacion: Verificar dependencias
- **E**jecucion: Escribir PLAN-EJECUCION-ORDENADO.md
- **D**ocumentacion: Incluir estimaciones

**Acciones Atomicas:**

```
5.4.1 - Priorizar hallazgos por severidad
  P0: Errores criticos, discrepancias
  P1: Duplicidades, huerfanos
  P2: Mejoras de documentacion

5.4.2 - Ordenar por dependencias
  Reconciliar primero, luego corregir, luego documentar

5.4.3 - Asignar a agentes paralelos donde sea posible
  Identificar tareas independientes

5.4.4 - Crear PLAN-EJECUCION-ORDENADO.md
```

**Criterio de Exito:** Plan de ejecucion listo para implementar

---

### 5.5 Commit y Cierre de Tarea

**CAPVED:**
- **C**ontexto: Tarea de analisis completada
- **A**nalisis: Verificar todos los entregables
- **P**lanificacion: Commit final
- **V**alidacion: git status clean
- **E**jecucion: git add, commit, push
- **D**ocumentacion: Actualizar METADATA estado=completada

**Acciones Atomicas:**

```
5.5.1 - Verificar entregables
  [ ] METADATA.yml
  [ ] PLAN-AUDITORIA-BD.md
  [ ] ANALISIS-INICIAL.md
  [ ] MATRIZ-TRAZABILIDAD-DDL-RF.yml
  [ ] INVENTARIO-RECONCILIADO.yml
  [ ] REPORTE-ANOMALIAS.md
  [ ] PLAN-EJECUCION-ORDENADO.md

5.5.2 - Actualizar METADATA.yml
  estado: "completada"
  fecha_fin: "2026-02-XX"

5.5.3 - Commit
  git add orchestration/tareas/TASK-2026-02-02-*/
  git commit -m "[GAMILIT] docs: Complete database audit vs requirements TASK-2026-02-02"

5.5.4 - Push
  git push origin main
```

**Criterio de Exito:** Tarea cerrada, documentacion en repo

---

## DIAGRAMA DE DEPENDENCIAS

```
                    ┌───────────────────────────────────────┐
                    │  FASE 1: Reconciliacion Inventarios   │
                    │            (P0 - 4h)                  │
                    │  Subtareas: 1.1, 1.2, 1.3, 1.4, 1.5   │
                    └───────────────────┬───────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│  FASE 2: Trazabilidad   │ │  FASE 3: Anomalias      │
│   DDL-Requerimientos    │ │   (P1 - 3h)             │
│      (P0 - 4h)          │ │  Subtareas: 3.1-3.4     │
│  Subtareas: 2.1-2.4     │ └───────────────┬─────────┘
└───────────────┬─────────┘                 │
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  FASE 4: Dependencias   │
                │       (P1 - 2h)         │
                │  Subtareas: 4.1-4.3     │
                └───────────────┬─────────┘
                                │
                                ▼
                ┌─────────────────────────┐
                │  FASE 5: Consolidacion  │
                │       (P2 - 3h)         │
                │  Subtareas: 5.1-5.5     │
                └─────────────────────────┘
```

---

## EJECUCION PARALELA RECOMENDADA

### Bloque 1: Fase 1 (Obligatoria primero)
- **Agente 1:** Subtareas 1.1 + 1.2 (Funciones + Triggers)
- **Agente 2:** Subtareas 1.3 + 1.4 (Tablas + ENUMs)
- **Sincronizacion:** Subtarea 1.5 (requiere 1.1-1.4)

### Bloque 2: Fases 2 y 3 (Paralelo)
- **Agente 1:** Fase 2 completa (Trazabilidad)
- **Agente 2:** Fase 3 completa (Anomalias)

### Bloque 3: Fases 4 y 5 (Secuencial)
- **Agente 1:** Fase 4 (Dependencias)
- **Agente 1:** Fase 5 (Consolidacion)

---

## CRITERIOS DE EXITO GLOBALES

| # | Criterio | Metrica | Objetivo |
|---|----------|---------|----------|
| 1 | Inventarios reconciliados | Delta entre documentos | 0 |
| 2 | Tablas con US asignada | % tablas | >90% |
| 3 | Funciones categorizadas | % funciones | 100% |
| 4 | Duplicados identificados | Lista | Completa |
| 5 | Huerfanos documentados | Lista con recomendacion | Completa |
| 6 | Dependencias validadas | Errores de orden | 0 |
| 7 | Documentacion purgada | % reduccion | >50% obsoleto |

---

*Sistema SIMCO v4.3.0 - GAMILIT*
*Ciclo CAPVED aplicado en todos los niveles*
*Fecha: 2026-02-02*
