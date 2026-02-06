# Prompts de Integracion DDL (Post-Sprint)

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Total Prompts:** 10

---

## FK Integration (@FK_INTEGRATION_AGENT)

### PROMPT-INT-FK-001: Consolidar Foreign Keys

```yaml
prompt_id: "PROMPT-INT-FK-001"
agente: "@FK_INTEGRATION_AGENT"
objetivo: "Consolidar todas las FK dispersas en un archivo unico"
contexto_enviado:
  - "Todos los archivos DDL con FK"
  - "Grafo de dependencias"
  - "Orden de tablas"
prompt_texto: |
  CONSOLIDA todas las FK en un archivo unico.

  PROCESO:
  1. Extraer todas las sentencias ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY
  2. Ordenar por dependencia (tablas referenciadas primero)
  3. Eliminar duplicados
  4. Verificar que todas las tablas referenciadas existen

  ESTRUCTURA DEL ARCHIVO:
  -- ============================================
  -- Foreign Keys Consolidadas
  -- Proyecto: gamilit_platform
  -- Generado: {date}
  -- ============================================

  -- Dominio: core
  ALTER TABLE core.{tabla} ADD CONSTRAINT fk_{tabla}_{ref}
      FOREIGN KEY ({campo}) REFERENCES {schema}.{ref_tabla}({ref_campo})
      ON DELETE {action} ON UPDATE {action};

  -- Dominio: iam
  ...

  GENERAR en: ddl/99_foreign_keys.sql

  TAMBIEN GENERAR:
  - Lista de FK ordenada
  - Grafo de dependencias (texto)
  - Warnings de FK circulares

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/99_foreign_keys.sql"
    - "docs/FK-DEPENDENCY-GRAPH.md"
  hallazgos:
    - fk_consolidadas: 85
    - fk_duplicadas_eliminadas: 12
    - warnings_circulares: 2
tiempo_estimado: "25m"
tokens_estimados: 5000
```

---

### PROMPT-INT-FK-002: Validar Integridad FK

```yaml
prompt_id: "PROMPT-INT-FK-002"
agente: "@FK_INTEGRATION_AGENT"
objetivo: "Validar que todas las FK referencian tablas existentes"
contexto_enviado:
  - "ddl/99_foreign_keys.sql"
  - "Lista de tablas existentes"
prompt_texto: |
  VALIDA integridad de FK consolidadas.

  VERIFICACIONES:
  1. Toda tabla referenciada existe
  2. Toda columna referenciada existe
  3. Tipos de datos son compatibles
  4. ON DELETE/UPDATE son apropiados

  REGLAS ON DELETE:
  - Datos maestros: RESTRICT (no borrar si hay referencias)
  - Datos transaccionales: SET NULL o CASCADE segun caso
  - Audit: NO ACTION

  GENERAR:
  - Script de verificacion SQL
  - Lista de FK con problemas
  - Sugerencias de correccion

  FORMATO VERIFICACION:
  SELECT
      tc.constraint_name,
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY';

resultado:
  estado: "exito"
  archivos_generados:
    - "scripts/verify_fk_integrity.sql"
    - "docs/FK-VALIDATION-REPORT.md"
  hallazgos:
    - fk_validas: 83
    - fk_con_problemas: 2
    - correcciones_sugeridas: 2
tiempo_estimado: "15m"
tokens_estimados: 3500
```

---

## Trigger Integration (@TRIGGER_INTEGRATION_AGENT)

### PROMPT-INT-TRG-001: Consolidar Triggers

```yaml
prompt_id: "PROMPT-INT-TRG-001"
agente: "@TRIGGER_INTEGRATION_AGENT"
objetivo: "Consolidar triggers dispersos en archivos por funcion"
contexto_enviado:
  - "Todos los triggers existentes"
  - "Funciones de trigger"
prompt_texto: |
  CONSOLIDA triggers en archivos organizados.

  CATEGORIAS DE TRIGGERS:
  1. Audit triggers (updated_at, audit_log)
  2. Validation triggers (check de negocio)
  3. Cascade triggers (actualizacion de contadores)
  4. Notification triggers (eventos)

  ESTRUCTURA:
  ddl/triggers/
    01_audit_triggers.sql
    02_validation_triggers.sql
    03_cascade_triggers.sql
    04_notification_triggers.sql

  FORMATO TRIGGER:
  -- Trigger: {nombre}
  -- Tabla: {schema}.{tabla}
  -- Evento: {BEFORE|AFTER} {INSERT|UPDATE|DELETE}
  -- Proposito: {descripcion}

  CREATE OR REPLACE FUNCTION {schema}.fn_{nombre}()
  RETURNS TRIGGER AS $$
  BEGIN
      {logica}
      RETURN {NEW|OLD|NULL};
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_{nombre}
      {timing} {event} ON {schema}.{tabla}
      FOR EACH ROW
      EXECUTE FUNCTION {schema}.fn_{nombre}();

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/triggers/01_audit_triggers.sql"
    - "ddl/triggers/02_validation_triggers.sql"
    - "ddl/triggers/03_cascade_triggers.sql"
  hallazgos:
    - triggers_consolidados: 25
    - funciones_unificadas: 8
tiempo_estimado: "30m"
tokens_estimados: 6000
```

---

### PROMPT-INT-TRG-002: Crear Trigger updated_at Universal

```yaml
prompt_id: "PROMPT-INT-TRG-002"
agente: "@TRIGGER_INTEGRATION_AGENT"
objetivo: "Crear funcion y triggers para updated_at automatico"
contexto_enviado:
  - "Lista de tablas con campo updated_at"
  - "Tablas sin trigger de updated_at"
prompt_texto: |
  GENERA trigger universal para updated_at.

  FUNCION UNIVERSAL:
  CREATE OR REPLACE FUNCTION core.fn_update_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  GENERAR TRIGGER para cada tabla:
  CREATE TRIGGER trg_update_timestamp
      BEFORE UPDATE ON {schema}.{tabla}
      FOR EACH ROW
      EXECUTE FUNCTION core.fn_update_timestamp();

  TABLAS A INCLUIR:
  - Todas las que tienen campo updated_at
  - Excluir tablas de logs (no se actualizan)

  GENERAR script idempotente (IF NOT EXISTS).

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/triggers/00_updated_at_triggers.sql"
  hallazgos:
    - tablas_con_trigger: 35
    - trigger_universal_creado: 1
tiempo_estimado: "15m"
tokens_estimados: 3000
```

---

## Pluralization & ENUM (@PLURALIZATION_AGENT)

### PROMPT-INT-PLR-001: Estandarizar Nombres de Tablas

```yaml
prompt_id: "PROMPT-INT-PLR-001"
agente: "@PLURALIZATION_AGENT"
objetivo: "Verificar y corregir pluralizacion de tablas"
contexto_enviado:
  - "Lista de tablas actual"
  - "Reglas de pluralizacion"
prompt_texto: |
  VERIFICA pluralizacion de todas las tablas.

  REGLAS:
  1. Tablas de entidades: PLURAL (users, posts, orders)
  2. Tablas de configuracion: SINGULAR OK (app_config)
  3. Tablas de relacion N:M: PLURAL ambos lados (user_roles, post_tags)
  4. Excepciones ingles irregular:
     - person -> people (o persons)
     - child -> children
     - datum -> data

  ANALIZA:
  - Tablas en singular que deberian ser plural
  - Tablas con pluralizacion incorrecta

  GENERAR:
  - Lista de renombres necesarios
  - Script de migracion (si hay cambios)
  - Warnings de inconsistencias

resultado:
  estado: "exito"
  archivos_generados:
    - "docs/PLURALIZATION-ANALYSIS.md"
    - "ddl/migrations/rename_to_plural.sql"
  hallazgos:
    - tablas_a_renombrar: 8
    - tablas_correctas: 42
tiempo_estimado: "12m"
tokens_estimados: 2500
```

---

### PROMPT-INT-PLR-002: Revisar y Estandarizar ENUMs

```yaml
prompt_id: "PROMPT-INT-PLR-002"
agente: "@PLURALIZATION_AGENT"
objetivo: "Estandarizar nombres y valores de ENUMs"
contexto_enviado:
  - "Lista de ENUMs existentes"
  - "Convenciones de naming"
prompt_texto: |
  REVISA y estandariza ENUMs.

  CONVENCIONES:
  1. Nombre: {entidad}_{campo}_enum (ej: user_status_enum)
  2. Valores: lowercase, snake_case
  3. Ordenar valores alfabeticamente o por logica de negocio
  4. Documentar cada valor

  VERIFICAR:
  - ENUMs sin usar
  - ENUMs duplicados (mismos valores, diferente nombre)
  - Valores inconsistentes

  GENERAR:
  - Script para renombrar ENUMs
  - Script para agregar valores faltantes
  - Documentacion de cada ENUM

  NOTA: ALTER TYPE ... ADD VALUE no es transaccional,
  usar DO block con verificacion.

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/migrations/standardize_enums.sql"
    - "docs/ENUM-CATALOG.md"
  hallazgos:
    - enums_renombrados: 3
    - valores_agregados: 5
    - enums_documentados: 12
tiempo_estimado: "15m"
tokens_estimados: 3000
```

---

## Cleanup (@CLEANUP_AGENT)

### PROMPT-INT-CLN-001: Eliminar Codigo Muerto

```yaml
prompt_id: "PROMPT-INT-CLN-001"
agente: "@CLEANUP_AGENT"
objetivo: "Identificar y eliminar DDL no utilizado"
contexto_enviado:
  - "Todo el DDL"
  - "Grafo de dependencias"
prompt_texto: |
  IDENTIFICA y elimina DDL no utilizado.

  BUSCAR:
  1. Tablas sin FK entrantes ni salientes (huerfanas)
  2. Indices no utilizados (sin queries)
  3. Funciones sin triggers que las llamen
  4. ENUMs sin columnas que los usen
  5. Extensiones sin objetos que las requieran

  GENERAR:
  - Lista de objetos candidatos a eliminar
  - Script de DROP con IF EXISTS
  - Backup recomendado antes de ejecutar

  FORMATO:
  -- ============================================
  -- Cleanup: Objetos no utilizados
  -- REVISAR ANTES DE EJECUTAR
  -- ============================================

  -- Tablas huerfanas
  -- DROP TABLE IF EXISTS {schema}.{tabla}; -- Razon: sin FK, sin uso

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/cleanup/drop_unused_objects.sql"
    - "docs/CLEANUP-CANDIDATES.md"
  hallazgos:
    - tablas_huerfanas: 3
    - indices_sin_uso: 5
    - funciones_sin_uso: 2
tiempo_estimado: "20m"
tokens_estimados: 4000
```

---

### PROMPT-INT-CLN-002: Ordenar Archivos por Dependencia

```yaml
prompt_id: "PROMPT-INT-CLN-002"
agente: "@CLEANUP_AGENT"
objetivo: "Reorganizar archivos DDL por orden de ejecucion"
contexto_enviado:
  - "Estructura actual de archivos"
  - "Grafo de dependencias"
prompt_texto: |
  REORGANIZA archivos DDL por dependencia.

  ORDEN CORRECTO:
  01_extensions.sql      - Extensiones PostgreSQL
  02_schemas.sql         - CREATE SCHEMA
  03_enums.sql           - Tipos ENUM
  04_domains.sql         - Tipos DOMAIN (si aplica)
  05_functions.sql       - Funciones auxiliares
  10_core_tables.sql     - Tablas core
  20_iam_tables.sql      - Tablas IAM
  30_social_tables.sql   - Tablas social
  ...
  90_views.sql           - Vistas
  95_triggers.sql        - Triggers
  99_foreign_keys.sql    - FK al final

  GENERAR:
  - Script de carga ordenado (load_all.sql)
  - Renombres de archivos sugeridos
  - Verificacion de dependencias

resultado:
  estado: "exito"
  archivos_generados:
    - "ddl/load_all.sql"
    - "docs/DDL-LOAD-ORDER.md"
  hallazgos:
    - archivos_reorganizados: 15
    - dependencias_resueltas: 8
tiempo_estimado: "15m"
tokens_estimados: 3000
```

---

### PROMPT-INT-CLN-003: Generar Script de Verificacion

```yaml
prompt_id: "PROMPT-INT-CLN-003"
agente: "@CLEANUP_AGENT"
objetivo: "Generar script para verificar integridad del schema"
contexto_enviado:
  - "DDL completo"
  - "Expectativas de estructura"
prompt_texto: |
  GENERA script de verificacion de schema.

  VERIFICACIONES:
  1. Todas las tablas esperadas existen
  2. Todas las FK son validas
  3. Todos los indices existen
  4. Todos los triggers estan activos
  5. Todos los ENUMs tienen valores
  6. Campos audit existen en tablas transaccionales

  FORMATO:
  -- Verificacion: {nombre}
  DO $$
  DECLARE
      v_count INTEGER;
  BEGIN
      SELECT COUNT(*) INTO v_count
      FROM information_schema.tables
      WHERE table_schema = '{schema}' AND table_name = '{tabla}';

      IF v_count = 0 THEN
          RAISE EXCEPTION 'Tabla %s.%s no existe', '{schema}', '{tabla}';
      END IF;
  END $$;

  GENERAR resumen al final con conteo de verificaciones.

resultado:
  estado: "exito"
  archivos_generados:
    - "scripts/verify_schema.sql"
  hallazgos:
    - verificaciones_generadas: 150
    - categorias_verificadas: 6
tiempo_estimado: "20m"
tokens_estimados: 4500
```

---

### PROMPT-INT-CLN-004: Generar Reporte Final

```yaml
prompt_id: "PROMPT-INT-CLN-004"
agente: "@CLEANUP_AGENT"
objetivo: "Generar reporte final de estado del DDL"
contexto_enviado:
  - "Todo el DDL procesado"
  - "Metricas de hallazgos"
  - "Resultados de remediacion"
prompt_texto: |
  GENERA reporte final de estado del DDL.

  SECCIONES:
  1. Resumen Ejecutivo
     - Tablas: {count}
     - FK: {count}
     - Indices: {count}
     - Triggers: {count}
     - ENUMs: {count}

  2. Metricas de Calidad
     - Cobertura de documentacion: {%}
     - Tablas con audit fields: {%}
     - Naming conventions compliance: {%}

  3. Hallazgos Resueltos
     - Criticos: {resolved}/{total}
     - Altos: {resolved}/{total}
     - Medios: {resolved}/{total}
     - Bajos: {resolved}/{total}

  4. Items Pendientes
     - Lista de backlog
     - Sugerencias de mejora futura

  5. Recomendaciones
     - Mantenimiento periodico
     - Monitoreo sugerido

  FORMATO: Markdown con tablas y graficos ASCII.

resultado:
  estado: "exito"
  archivos_generados:
    - "docs/FINAL-DDL-REPORT.md"
    - "docs/DDL-METRICS.yml"
  hallazgos:
    - cobertura_doc: "85%"
    - compliance_naming: "92%"
    - items_resueltos: "95/98"
tiempo_estimado: "25m"
tokens_estimados: 5500
```

---

## Metricas Agregadas Post-Sprint

| Categoria | Prompts | Tokens Entrada | Tokens Salida | Tiempo |
|-----------|---------|----------------|---------------|--------|
| FK Integration | 2 | ~8,500 | ~5,000 | ~40m |
| Trigger Integration | 2 | ~9,000 | ~5,500 | ~45m |
| Pluralization/ENUM | 2 | ~5,500 | ~3,500 | ~27m |
| Cleanup | 4 | ~16,500 | ~10,000 | ~80m |
| **TOTAL** | **10** | **~39,500** | **~24,000** | **~192m** |

---

## Patrones Reutilizables de Integracion

### Patron: Consolidacion de Objetos
```yaml
template: |
  CONSOLIDA todos los {OBJECT_TYPE} en archivo unico.
  PROCESO:
  1. Extraer de archivos dispersos
  2. Ordenar por dependencia
  3. Eliminar duplicados
  4. Verificar integridad
  GENERAR: {OUTPUT_FILE}
```

### Patron: Validacion de Integridad
```yaml
template: |
  VALIDA integridad de {OBJECT_TYPE}.
  VERIFICACIONES: {CHECKS}
  GENERAR:
  - Script SQL de verificacion
  - Lista de problemas encontrados
  - Sugerencias de correccion
```

### Patron: Estandarizacion de Naming
```yaml
template: |
  VERIFICA {NAMING_CONVENTION} en {OBJECTS}.
  REGLAS: {RULES}
  GENERAR:
  - Lista de renombres
  - Script de migracion
  - Documentacion actualizada
```

### Patron: Cleanup y Reporte
```yaml
template: |
  IDENTIFICA objetos no utilizados en {SCOPE}.
  BUSCAR: {CRITERIA}
  GENERAR:
  - Lista de candidatos a eliminar
  - Script de DROP seguro
  - Reporte de limpieza
```

---

## Mejoras Sugeridas para Futuros Prompts

### Alta Prioridad
1. **Automatizar verificacion de FK** - Script que corre en CI/CD
2. **Trigger de audit universal** - Un trigger para todas las tablas
3. **Versionado de ENUMs** - Manejo de migraciones de ENUM

### Media Prioridad
4. **Generacion de migraciones** - TypeORM migrations desde DDL
5. **Comparacion de schemas** - Diff entre ambientes
6. **Performance hints** - Sugerencias basadas en indices

### Baja Prioridad
7. **Diagrama automatico** - Generar ER desde DDL
8. **Documentacion interactiva** - HTML navegable
9. **Metricas de complejidad** - Analisis de schema

---

*Generado: 2026-02-03 | Sistema SIMCO v4.0.0*
