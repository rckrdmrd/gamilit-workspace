# PLAN DE AUDITORÍA COMPLETA DE BASE DE DATOS

**ID:** AUDIT-DB-001-2025-12-14
**Proyecto:** GAMILIT
**Agente Principal:** Architecture-Analyst
**Fecha:** 2025-12-14
**Estado:** EN PLANEACIÓN

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo
Realizar una auditoría exhaustiva de la base de datos que valide:
1. Cumplimiento de Política de Carga Limpia (DDL-first, sin migrations)
2. Integridad de dependencias entre objetos DDL
3. Alineación DDL ↔ Entity ↔ DTO ↔ Types
4. Detección de duplicaciones de funcionalidades
5. Trazabilidad completa en documentación

### 1.2 Alcance

```yaml
Base de Datos:
  schemas: 16 activos (18 total con public/storage)
  archivos_sql: 391
  tablas: 117
  funciones: 200
  triggers: 87
  policies_rls: 243
  foreign_keys: 208
  enums: 37
  views: 11
  materialized_views: 11
  seeds: 84

Backend (impacto):
  entities: 87
  dtos: 318
  services: 84
  controllers: 67

Frontend (impacto):
  components: 399
  hooks: 73
  types: ~200 (estimado)
```

### 1.3 Criterios de Éxito

- [ ] 100% de archivos DDL cumplen política de carga limpia
- [ ] 0 errores en recreación completa de BD
- [ ] 100% FKs tienen tabla referenciada existente
- [ ] 100% ENUMs usados están definidos
- [ ] ≥95% alineación DDL↔Entity
- [ ] ≥90% alineación Entity↔DTO
- [ ] 0 duplicaciones de funcionalidades detectadas
- [ ] 100% trazabilidad en inventarios

---

## 2. ESTRUCTURA DE FASES

### FASE 1: Validación de Estructura DDL
**Duración estimada:** 1 sesión
**Subagente:** Database-Auditor

```yaml
Objetivos:
  - Validar estructura de directorios DDL
  - Verificar nomenclatura de archivos
  - Detectar archivos huérfanos o mal ubicados
  - Validar orden de numeración

Entradas:
  - apps/database/ddl/schemas/**/*.sql
  - orchestration/inventarios/DATABASE_INVENTORY.yml

Salidas:
  - REPORTE-ESTRUCTURA-DDL.md
  - Lista de anomalías estructurales
```

### FASE 2: Validación de Carga Limpia
**Duración estimada:** 1 sesión
**Subagente:** Database-Auditor

```yaml
Objetivos:
  - Ejecutar recreación completa
  - Validar que no existen migrations/fixes
  - Verificar idempotencia de scripts
  - Validar orden de ejecución en create-database.sh

Entradas:
  - apps/database/create-database.sh
  - apps/database/drop-and-recreate-database.sh
  - DIRECTIVA-POLITICA-CARGA-LIMPIA.md

Salidas:
  - REPORTE-CARGA-LIMPIA.md
  - Log de recreación
  - Lista de violaciones (si existen)
```

### FASE 3: Validación de Dependencias DDL
**Duración estimada:** 2 sesiones
**Subagente:** Database-Auditor

```yaml
Objetivos:
  - Mapear todas las FKs y sus referencias
  - Validar que tablas referenciadas existen
  - Validar orden de creación respeta dependencias
  - Detectar dependencias circulares
  - Validar ENUMs usados vs definidos

Entradas:
  - apps/database/ddl/schemas/**/tables/*.sql
  - apps/database/ddl/schemas/**/enums/*.sql

Salidas:
  - MAPA-DEPENDENCIAS-DDL.yml
  - REPORTE-VALIDACION-DEPENDENCIAS.md
  - Grafo de dependencias (texto)
```

### FASE 4: Auditoría de Funciones y Triggers
**Duración estimada:** 1 sesión
**Subagente:** Database-Auditor

```yaml
Objetivos:
  - Inventariar todas las funciones
  - Validar que triggers referencian funciones existentes
  - Detectar funciones huérfanas (no usadas)
  - Validar nomenclatura de funciones/triggers

Entradas:
  - apps/database/ddl/schemas/**/functions/*.sql
  - apps/database/ddl/schemas/**/triggers/*.sql

Salidas:
  - INVENTARIO-FUNCIONES-TRIGGERS.yml
  - REPORTE-FUNCIONES-TRIGGERS.md
```

### FASE 5: Validación de RLS Policies
**Duración estimada:** 1 sesión
**Subagente:** Database-Auditor

```yaml
Objetivos:
  - Inventariar todas las políticas RLS
  - Validar que tablas tienen RLS habilitado
  - Detectar tablas sin políticas (riesgo seguridad)
  - Validar consistencia de políticas

Entradas:
  - apps/database/ddl/schemas/**/rls-policies/*.sql
  - apps/database/ddl/schemas/**/tables/*.sql

Salidas:
  - INVENTARIO-RLS-POLICIES.yml
  - REPORTE-SEGURIDAD-RLS.md
```

### FASE 6: Alineación DDL ↔ Backend
**Duración estimada:** 2 sesiones
**Subagente:** Backend-Auditor (delegado por Architecture-Analyst)

```yaml
Objetivos:
  - Mapear tablas DDL → Entities
  - Validar tipos de columnas
  - Validar nullable/required
  - Validar relaciones (FKs → @ManyToOne/@OneToMany)
  - Detectar entities sin tabla
  - Detectar tablas sin entity

Entradas:
  - apps/database/ddl/schemas/**/tables/*.sql
  - apps/backend/src/modules/**/entities/*.entity.ts
  - orchestration/inventarios/BACKEND_INVENTORY.yml

Salidas:
  - MATRIZ-ALINEACION-DDL-ENTITY.yml
  - REPORTE-GAPS-DDL-ENTITY.md
```

### FASE 7: Alineación Entity ↔ DTO
**Duración estimada:** 1 sesión
**Subagente:** Backend-Auditor

```yaml
Objetivos:
  - Mapear Entities → DTOs (Create, Update, Response)
  - Validar campos expuestos
  - Validar validadores (@IsString, @IsUUID)
  - Detectar DTOs sin entity
  - Detectar entities sin DTO

Entradas:
  - apps/backend/src/modules/**/entities/*.entity.ts
  - apps/backend/src/modules/**/dto/**/*.dto.ts

Salidas:
  - MATRIZ-ALINEACION-ENTITY-DTO.yml
  - REPORTE-GAPS-ENTITY-DTO.md
```

### FASE 8: Alineación Backend ↔ Frontend
**Duración estimada:** 1 sesión
**Subagente:** Frontend-Auditor

```yaml
Objetivos:
  - Mapear DTOs → Types frontend
  - Validar transformación snake_case → camelCase
  - Validar tipos opcionales
  - Detectar types sin DTO correspondiente
  - Validar API services vs endpoints

Entradas:
  - apps/backend/src/modules/**/dto/**/*.dto.ts
  - apps/frontend/src/**/*.types.ts
  - apps/frontend/src/**/api/*.ts

Salidas:
  - MATRIZ-ALINEACION-DTO-TYPES.yml
  - REPORTE-GAPS-BACKEND-FRONTEND.md
```

### FASE 9: Detección de Duplicaciones
**Duración estimada:** 1 sesión
**Subagente:** Architecture-Analyst (directo)

```yaml
Objetivos:
  - Detectar tablas con propósito similar
  - Detectar funciones duplicadas
  - Detectar triggers redundantes
  - Detectar entities/services duplicados
  - Detectar componentes frontend duplicados

Entradas:
  - Todos los inventarios generados
  - Reportes de fases anteriores

Salidas:
  - REPORTE-DUPLICACIONES.md
  - Recomendaciones de consolidación
```

### FASE 10: Consolidación y Documentación
**Duración estimada:** 1 sesión
**Subagente:** Architecture-Analyst (directo)

```yaml
Objetivos:
  - Consolidar todos los reportes
  - Actualizar inventarios
  - Generar reporte ejecutivo
  - Crear plan de correcciones (si aplica)

Entradas:
  - Todos los reportes de fases 1-9

Salidas:
  - REPORTE-EJECUTIVO-AUDITORIA.md
  - PLAN-CORRECCIONES.md (si hay hallazgos)
  - Inventarios actualizados
```

---

## 3. ORQUESTACIÓN DE SUBAGENTES

### 3.1 Subagente: Database-Auditor

```yaml
Perfil: PERFIL-DATABASE-AUDITOR.md
Fases: 1, 2, 3, 4, 5
Contexto a cargar:
  - core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
  - core/orchestration/directivas/simco/SIMCO-DDL.md
  - core/orchestration/directivas/simco/SIMCO-VALIDAR.md
  - projects/gamilit/orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md
  - projects/gamilit/orchestration/inventarios/DATABASE_INVENTORY.yml

Responsabilidades:
  - NO modificar código
  - SOLO leer y analizar
  - Generar reportes detallados
  - Identificar anomalías con evidencia
```

### 3.2 Subagente: Backend-Auditor

```yaml
Perfil: PERFIL-CODE-REVIEWER.md (modo auditoría)
Fases: 6, 7
Contexto a cargar:
  - core/orchestration/directivas/simco/SIMCO-BACKEND.md
  - core/orchestration/directivas/simco/SIMCO-ALINEACION.md
  - core/orchestration/patrones/MAPEO-TIPOS-DDL-TYPESCRIPT.md
  - projects/gamilit/orchestration/inventarios/BACKEND_INVENTORY.yml

Responsabilidades:
  - Comparar DDL con Entities
  - Comparar Entities con DTOs
  - Generar matrices de alineación
  - Identificar gaps con ubicación exacta
```

### 3.3 Subagente: Frontend-Auditor

```yaml
Perfil: PERFIL-CODE-REVIEWER.md (modo auditoría frontend)
Fases: 8
Contexto a cargar:
  - core/orchestration/directivas/simco/SIMCO-FRONTEND.md
  - core/orchestration/directivas/simco/SIMCO-ALINEACION.md
  - projects/gamilit/orchestration/inventarios/FRONTEND_INVENTORY.yml

Responsabilidades:
  - Comparar DTOs con Types
  - Validar API services
  - Identificar gaps en frontend
```

---

## 4. PROMPTS DE DELEGACIÓN

### 4.1 Prompt para Database-Auditor (Fases 1-5)

```markdown
## DELEGACIÓN: Auditoría de Base de Datos GAMILIT

**De:** Architecture-Analyst
**Para:** Database-Auditor
**Proyecto:** GAMILIT
**Nivel:** 2A (STANDALONE)
**Working Directory:** ~/workspace/projects/gamilit

### CONTEXTO

Eres Database-Auditor ejecutando una auditoría exhaustiva de la base de datos.
El proyecto GAMILIT tiene:
- 16 schemas activos, 117 tablas, 200 funciones, 87 triggers
- Política de Carga Limpia (DDL-first, sin migrations)
- Script de recreación: apps/database/drop-and-recreate-database.sh

### DIRECTIVAS A CARGAR (OBLIGATORIO)

1. @CAPVED: core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
2. @OP_DDL: core/orchestration/directivas/simco/SIMCO-DDL.md
3. @VALIDAR: core/orchestration/directivas/simco/SIMCO-VALIDAR.md
4. Directiva local: projects/gamilit/orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md
5. Inventario: projects/gamilit/orchestration/inventarios/DATABASE_INVENTORY.yml

### FASES A EJECUTAR

**FASE 1: Estructura DDL**
- Validar estructura de apps/database/ddl/schemas/
- Verificar nomenclatura: {NN}-{nombre}.sql
- Detectar archivos mal ubicados

**FASE 2: Carga Limpia**
- Verificar NO existen: migrations/, fix-*.sql, patch-*.sql
- Validar create-database.sh tiene todas las fases
- Ejecutar recreación si es posible

**FASE 3: Dependencias**
- Mapear TODAS las FKs (REFERENCES ... )
- Validar tablas referenciadas existen
- Detectar dependencias circulares

**FASE 4: Funciones/Triggers**
- Inventariar funciones por schema
- Validar triggers referencian funciones existentes
- Detectar funciones huérfanas

**FASE 5: RLS Policies**
- Inventariar políticas por tabla
- Detectar tablas sin RLS

### CRITERIOS DE VALIDACIÓN

- [ ] 0 archivos en migrations/
- [ ] 0 archivos fix-*.sql o patch-*.sql
- [ ] 100% FKs válidas
- [ ] 100% triggers con función existente
- [ ] Nomenclatura correcta en 100% archivos

### ENTREGABLES

Crear en: projects/gamilit/orchestration/agentes/database-auditor/audit-2025-12-14/

1. REPORTE-ESTRUCTURA-DDL.md
2. REPORTE-CARGA-LIMPIA.md
3. MAPA-DEPENDENCIAS-DDL.yml
4. REPORTE-VALIDACION-DEPENDENCIAS.md
5. INVENTARIO-FUNCIONES-TRIGGERS.yml
6. REPORTE-RLS-POLICIES.md

### RESTRICCIONES

- NO modificar ningún archivo
- SOLO leer y analizar
- Reportar hallazgos con evidencia (archivo:línea)
- Si encuentras error crítico, documentar pero continuar
```

### 4.2 Prompt para Backend-Auditor (Fases 6-7)

```markdown
## DELEGACIÓN: Auditoría de Alineación DDL↔Backend

**De:** Architecture-Analyst
**Para:** Backend-Auditor (Code-Reviewer modo auditoría)
**Proyecto:** GAMILIT
**Nivel:** 2A (STANDALONE)

### CONTEXTO

Auditar alineación entre DDL y Backend.
- 117 tablas en DDL
- 87 entities en Backend
- 318 DTOs

### DIRECTIVAS A CARGAR

1. @ALINEACION: core/orchestration/directivas/simco/SIMCO-ALINEACION.md
2. @OP_BACKEND: core/orchestration/directivas/simco/SIMCO-BACKEND.md
3. @MAPEO_TIPOS: core/orchestration/patrones/MAPEO-TIPOS-DDL-TYPESCRIPT.md
4. Inventario: projects/gamilit/orchestration/inventarios/BACKEND_INVENTORY.yml

### TAREA

**FASE 6: DDL ↔ Entity**

Para CADA tabla en DDL:
1. Identificar Entity correspondiente
2. Comparar columnas vs campos
3. Validar tipos (usar MAPEO-TIPOS)
4. Validar nullable/required
5. Validar FKs → relaciones TypeORM

**FASE 7: Entity ↔ DTO**

Para CADA Entity:
1. Identificar DTOs (Create, Update, Response)
2. Validar campos expuestos
3. Validar validadores

### ENTREGABLES

Crear en: projects/gamilit/orchestration/agentes/backend-auditor/audit-2025-12-14/

1. MATRIZ-ALINEACION-DDL-ENTITY.yml
2. REPORTE-GAPS-DDL-ENTITY.md
3. MATRIZ-ALINEACION-ENTITY-DTO.yml
4. REPORTE-GAPS-ENTITY-DTO.md

### FORMATO DE MATRIZ

```yaml
alineacion:
  - tabla: auth_management.profiles
    entity: ProfileEntity
    archivo_ddl: ddl/schemas/auth_management/tables/01-profiles.sql
    archivo_entity: src/modules/auth/entities/profile.entity.ts
    columnas_ddl: 15
    campos_entity: 15
    alineacion: 100%
    gaps: []
```

### RESTRICCIONES

- NO modificar código
- Reportar ubicación exacta de gaps (archivo:línea)
- Priorizar gaps: P0 (crítico), P1 (importante), P2 (menor)
```

### 4.3 Prompt para Frontend-Auditor (Fase 8)

```markdown
## DELEGACIÓN: Auditoría de Alineación Backend↔Frontend

**De:** Architecture-Analyst
**Para:** Frontend-Auditor
**Proyecto:** GAMILIT

### CONTEXTO

Validar que Types frontend alinean con DTOs backend.
- 318 DTOs en backend
- ~200 types en frontend
- 73 hooks
- 15 API services

### DIRECTIVAS

1. @ALINEACION: core/orchestration/directivas/simco/SIMCO-ALINEACION.md
2. @OP_FRONTEND: core/orchestration/directivas/simco/SIMCO-FRONTEND.md

### TAREA

1. Identificar todos los Types en apps/frontend/src/**/*.types.ts
2. Mapear a DTOs correspondientes
3. Validar transformación snake_case → camelCase
4. Validar tipos opcionales
5. Validar API services usan types correctos

### ENTREGABLES

1. MATRIZ-ALINEACION-DTO-TYPES.yml
2. REPORTE-GAPS-BACKEND-FRONTEND.md

### RESTRICCIONES

- NO modificar código
- Reportar gaps con ubicación exacta
```

---

## 5. CRONOGRAMA

```
FASE 1: Estructura DDL ────────────── [Subagente 1]
FASE 2: Carga Limpia ──────────────── [Subagente 1]
FASE 3: Dependencias DDL ─────────── [Subagente 1]
FASE 4: Funciones/Triggers ────────── [Subagente 1]
FASE 5: RLS Policies ──────────────── [Subagente 1]
        │
        ▼
FASE 6: DDL ↔ Entity ─────────────── [Subagente 2]
FASE 7: Entity ↔ DTO ─────────────── [Subagente 2]
        │
        ▼
FASE 8: Backend ↔ Frontend ────────── [Subagente 3]
        │
        ▼
FASE 9: Duplicaciones ─────────────── [Architecture-Analyst]
FASE 10: Consolidación ────────────── [Architecture-Analyst]
```

---

## 6. ESTRUCTURA DE REPORTES

### 6.1 Directorio de Entregables

```
projects/gamilit/orchestration/agentes/
├── architecture-analyst/
│   └── audit-database-2025-12-14/
│       ├── PLAN-AUDITORIA-DATABASE-2025-12-14.md (este archivo)
│       ├── REPORTE-EJECUTIVO-AUDITORIA.md
│       ├── PLAN-CORRECCIONES.md
│       └── consolidacion/
│           ├── RESUMEN-HALLAZGOS.yml
│           └── METRICAS-AUDITORIA.yml
│
├── database-auditor/
│   └── audit-2025-12-14/
│       ├── REPORTE-ESTRUCTURA-DDL.md
│       ├── REPORTE-CARGA-LIMPIA.md
│       ├── MAPA-DEPENDENCIAS-DDL.yml
│       ├── REPORTE-VALIDACION-DEPENDENCIAS.md
│       ├── INVENTARIO-FUNCIONES-TRIGGERS.yml
│       └── REPORTE-RLS-POLICIES.md
│
├── backend-auditor/
│   └── audit-2025-12-14/
│       ├── MATRIZ-ALINEACION-DDL-ENTITY.yml
│       ├── REPORTE-GAPS-DDL-ENTITY.md
│       ├── MATRIZ-ALINEACION-ENTITY-DTO.yml
│       └── REPORTE-GAPS-ENTITY-DTO.md
│
└── frontend-auditor/
    └── audit-2025-12-14/
        ├── MATRIZ-ALINEACION-DTO-TYPES.yml
        └── REPORTE-GAPS-BACKEND-FRONTEND.md
```

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Auditoría muy grande, timeout | Media | Alto | Dividir por schema, ejecutar incremental |
| Discrepancias masivas DDL↔Entity | Baja | Alto | Priorizar por schema crítico |
| Recreación BD falla | Baja | Crítico | Documentar error, continuar con análisis estático |
| Inventarios desactualizados | Media | Medio | Actualizar inventarios durante auditoría |

---

## 8. APROBACIÓN

### Para proceder con la ejecución:

- [ ] Plan revisado por Architecture-Analyst
- [ ] Alcance confirmado (16 schemas, full stack)
- [ ] Recursos disponibles (subagentes)
- [ ] Directorio de entregables creado

---

**Versión:** 1.0.0
**Creado por:** Architecture-Analyst
**Fecha:** 2025-12-14
**Estado:** PENDIENTE APROBACIÓN
