# Perfiles de Agentes - TASK-2026-02-03-ANALISIS-VALIDACION-MODELADO-BD

**Version:** 1.0.0
**Fecha:** 2026-02-03

---

## Agentes de Analisis (Fase 1)

### @DB_DOMAIN_AGENT

```yaml
id: DB_DOMAIN_AGENT
nivel: 2
tipo: Analisis
instancias: 7
dominios_cubiertos:
  - core (system, config)
  - iam (users, roles, permissions)
  - social (posts, comments, reactions)
  - marketplace (products, orders)
  - messaging (messages, conversations)
  - content (media, files)
  - gamification (achievements, rewards)
```

**Responsabilidades:**
- Validar estructura DDL por dominio funcional
- Verificar naming conventions dentro del dominio
- Detectar tablas faltantes o incompletas
- Identificar relaciones FK faltantes
- Evaluar indices y constraints

**Entradas Esperadas:**
- Archivos DDL del dominio
- Esquema de referencia (si existe)
- Reglas de negocio del dominio

**Salidas Generadas:**
- Lista de hallazgos por severidad
- Recomendaciones de mejora
- Metricas de completitud

**Configuracion Tipica:**
```yaml
max_tokens: 4000
temperature: 0.1
context_window: 16k
```

---

### @COHERENCE_VALIDATOR_AGENT

```yaml
id: COHERENCE_VALIDATOR_AGENT
nivel: 3
tipo: Validacion
instancias: 4
capas_validadas:
  - DDL -> Backend Entities
  - Backend Entities -> Services
  - Services -> Controllers
  - Controllers -> Frontend Types
```

**Responsabilidades:**
- Verificar que tablas DDL tengan entities correspondientes
- Validar que campos DDL coincidan con propiedades de entities
- Detectar endpoints sin implementacion backend
- Identificar tipos TypeScript desincronizados

**Entradas Esperadas:**
- Archivos DDL
- Entities NestJS
- Services y Controllers
- Types de Frontend

**Salidas Generadas:**
- Matriz de coherencia (tabla de gaps)
- Lista de desincronizaciones
- Plan de alineacion sugerido

**Configuracion Tipica:**
```yaml
max_tokens: 6000
temperature: 0.0
context_window: 32k
cross_reference: true
```

---

### @ANOMALY_DETECTOR_AGENT

```yaml
id: ANOMALY_DETECTOR_AGENT
nivel: 4
tipo: Deteccion
instancias: 4
patrones_detectados:
  - Tablas huerfanas (sin FK entrantes)
  - FK circulares
  - Indices duplicados
  - Constraints inconsistentes
  - Naming conventions rotas
```

**Responsabilidades:**
- Detectar patrones anti-patron en DDL
- Identificar codigo muerto o no utilizado
- Encontrar duplicaciones semanticas
- Alertar sobre problemas de rendimiento potenciales

**Entradas Esperadas:**
- DDL completo del proyecto
- Metricas de uso (si disponibles)
- Historial de cambios

**Salidas Generadas:**
- Lista de anomalias con severidad
- Impacto estimado de cada anomalia
- Sugerencias de remediacion

**Configuracion Tipica:**
```yaml
max_tokens: 5000
temperature: 0.2
pattern_matching: aggressive
```

---

### @PURGE_CONSOLIDATION_AGENT

```yaml
id: PURGE_CONSOLIDATION_AGENT
nivel: 5
tipo: Consolidacion
instancias: 3
funciones:
  - Consolidar hallazgos de niveles 2-4
  - Eliminar duplicados de reporte
  - Priorizar por impacto
  - Generar plan de accion
```

**Responsabilidades:**
- Unificar hallazgos de multiples agentes
- Eliminar reportes duplicados
- Calcular prioridad compuesta
- Generar roadmap de remediacion

**Entradas Esperadas:**
- Outputs de @DB_DOMAIN_AGENT (7)
- Outputs de @COHERENCE_VALIDATOR_AGENT (4)
- Outputs de @ANOMALY_DETECTOR_AGENT (4)

**Salidas Generadas:**
- FINDINGS-CONSOLIDATED.md
- REMEDIATION-PLAN.md
- Metricas finales

**Configuracion Tipica:**
```yaml
max_tokens: 8000
temperature: 0.0
deduplication: true
priority_scoring: weighted
```

---

## Agentes de Remediacion (Fase 2)

### @DDL_AGENT

```yaml
id: DDL_AGENT
nivel: N/A (Ejecucion)
tipo: Generacion
instancias: 14
sprints_participados:
  - Sprint 1: 2 instancias
  - Sprint 2: 3 instancias
  - Sprint 3: 4 instancias
  - Sprint 4: 0 instancias
  - Sprint 5: 3 instancias
  - Sprint 6: 2 instancias
```

**Responsabilidades:**
- Generar sentencias DDL correctas
- Aplicar naming conventions
- Incluir comentarios y documentacion
- Respetar dependencias FK

**Entradas Esperadas:**
- Especificacion de tabla/cambio
- Contexto de tablas relacionadas
- Reglas de naming del proyecto

**Salidas Generadas:**
- Archivos .sql con DDL
- Comentarios inline
- Orden de ejecucion

**Plantilla Base:**
```sql
-- ============================================
-- Tabla: {schema}.{table_name}
-- Dominio: {domain}
-- Descripcion: {description}
-- Creado: {date}
-- ============================================

CREATE TABLE IF NOT EXISTS {schema}.{table_name} (
    -- PK
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campos de negocio
    {business_fields}

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at
    ON {schema}.{table_name}(created_at);

-- Comentarios
COMMENT ON TABLE {schema}.{table_name} IS '{description}';
```

---

### @RLS_AGENT

```yaml
id: RLS_AGENT
nivel: N/A (Ejecucion)
tipo: Seguridad
instancias: 1
sprint: Sprint 1
```

**Responsabilidades:**
- Crear politicas RLS para tablas
- Definir roles y permisos
- Implementar multi-tenancy si aplica

**Salidas Generadas:**
- Politicas RLS
- Grants de roles
- Funciones helper de seguridad

**Plantilla Base:**
```sql
-- RLS Policy: {policy_name}
ALTER TABLE {schema}.{table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY {policy_name} ON {schema}.{table_name}
    FOR {operation}
    TO {role}
    USING ({condition})
    WITH CHECK ({check_condition});
```

---

### @SEED_AGENT

```yaml
id: SEED_AGENT
nivel: N/A (Ejecucion)
tipo: Datos
instancias: 1
sprint: Sprint 2
```

**Responsabilidades:**
- Generar datos iniciales/demo
- Respetar FK y constraints
- Crear datos realistas

**Salidas Generadas:**
- Archivos seed SQL
- Datos de configuracion
- Usuarios demo

---

### @DOC_AGENT

```yaml
id: DOC_AGENT
nivel: N/A (Ejecucion)
tipo: Documentacion
instancias: 4
sprint: Sprint 4
```

**Responsabilidades:**
- Documentar tablas y campos
- Generar diagramas ER (texto)
- Crear guias de uso

**Salidas Generadas:**
- COMMENT ON statements
- Documentacion markdown
- Diagramas de relaciones

---

### @RENAME_AGENT

```yaml
id: RENAME_AGENT
nivel: N/A (Ejecucion)
tipo: Refactoring
instancias: 2
sprint: Sprint 5
```

**Responsabilidades:**
- Renombrar tablas/columnas
- Actualizar referencias FK
- Mantener compatibilidad

**Salidas Generadas:**
- ALTER TABLE RENAME statements
- Scripts de migracion
- Mapeo old->new names

---

### @CLEANUP_AGENT

```yaml
id: CLEANUP_AGENT
nivel: N/A (Ejecucion)
tipo: Mantenimiento
instancias: 5
sprints: Sprint 6, Post-Sprint
```

**Responsabilidades:**
- Eliminar codigo muerto
- Consolidar archivos
- Ordenar dependencias

**Salidas Generadas:**
- DROP statements (seguros)
- Archivos consolidados
- Reporte de limpieza

---

## Agentes de Integracion (Post-Sprint)

### @FK_INTEGRATION_AGENT

```yaml
id: FK_INTEGRATION_AGENT
nivel: N/A (Integracion)
tipo: Relaciones
instancias: 2
```

**Responsabilidades:**
- Consolidar todas las FK
- Verificar referencias validas
- Ordenar por dependencia

**Salidas Generadas:**
- 99_foreign_keys.sql (consolidado)
- Grafo de dependencias
- Orden de carga

---

### @TRIGGER_INTEGRATION_AGENT

```yaml
id: TRIGGER_INTEGRATION_AGENT
nivel: N/A (Integracion)
tipo: Automatizacion
instancias: 2
```

**Responsabilidades:**
- Consolidar triggers dispersos
- Unificar funciones comunes
- Documentar comportamiento

**Salidas Generadas:**
- 98_triggers.sql (consolidado)
- Documentacion de triggers
- Orden de ejecucion

---

### @PLURALIZATION_AGENT

```yaml
id: PLURALIZATION_AGENT
nivel: N/A (Integracion)
tipo: Naming
instancias: 2
```

**Responsabilidades:**
- Verificar pluralizacion de tablas
- Corregir nombres inconsistentes
- Actualizar ENUMs

**Salidas Generadas:**
- Renombres de tablas
- Actualizacion de ENUMs
- Guia de naming

---

## Matriz de Capacidades

| Agente | Lectura | Escritura | Analisis | Validacion | Generacion |
|--------|---------|-----------|----------|------------|------------|
| @DB_DOMAIN_AGENT | Si | No | Si | Si | No |
| @COHERENCE_VALIDATOR | Si | No | Si | Si | No |
| @ANOMALY_DETECTOR | Si | No | Si | Si | No |
| @PURGE_CONSOLIDATION | Si | No | Si | No | Si |
| @DDL_AGENT | Si | Si | No | No | Si |
| @RLS_AGENT | Si | Si | No | No | Si |
| @SEED_AGENT | Si | Si | No | No | Si |
| @DOC_AGENT | Si | Si | No | No | Si |
| @RENAME_AGENT | Si | Si | No | Si | Si |
| @CLEANUP_AGENT | Si | Si | Si | Si | Si |
| @FK_INTEGRATION | Si | Si | Si | Si | Si |
| @TRIGGER_INTEGRATION | Si | Si | Si | No | Si |
| @PLURALIZATION | Si | Si | Si | Si | Si |

---

## Mejoras Sugeridas para Futuros Perfiles

### Alta Prioridad
1. **@MIGRATION_AGENT** - Generar migraciones TypeORM automaticamente
2. **@TEST_DATA_AGENT** - Generar datos de prueba exhaustivos
3. **@PERFORMANCE_AGENT** - Analizar queries y sugerir optimizaciones

### Media Prioridad
4. **@SYNC_AGENT** - Sincronizar DDL con entities automaticamente
5. **@ROLLBACK_AGENT** - Generar scripts de rollback seguros
6. **@AUDIT_AGENT** - Implementar audit trails completos

### Baja Prioridad
7. **@DIAGRAM_AGENT** - Generar diagramas ER visuales
8. **@COMPARE_AGENT** - Comparar schemas entre ambientes
9. **@BACKUP_AGENT** - Estrategias de backup/restore

---

*Generado: 2026-02-03 | Sistema SIMCO v4.0.0*
