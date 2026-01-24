# PLAN DE ANALISIS DE BASE DE DATOS - GAMILIT

**Fecha:** 2025-12-26
**Autor:** Requirements-Analyst (Claude Opus 4.5)
**Proyecto:** GAMILIT - Sistema de Gamificacion Educativa
**Version:** 1.0.0

---

## RESUMEN EJECUTIVO

Este documento define el plan de analisis exhaustivo de la base de datos del proyecto GAMILIT,
incluyendo validacion de objetos DDL, coherencia de UUIDs, alineacion con backend/frontend,
y verificacion de dependencias.

---

## FASE 1: PLANEACION Y DEFINICION DE ALCANCE

### 1.1 Alcance del Analisis

#### Objetos de Base de Datos a Validar

| Categoria | Cantidad Esperada | Fuente |
|-----------|-------------------|--------|
| Schemas | 15-16 | DATABASE_INVENTORY.yml |
| Tablas | 126-132 | DDL/tables/ |
| Views | 17 | DDL/views/ |
| Materialized Views | 11 | DDL/materialized-views/ |
| Funciones | 150-214 | DDL/functions/ |
| Triggers | 91-111 | DDL/triggers/ |
| Enums | 42 | DDL/enums/ |
| Indexes | 21 | DDL/indexes/ |
| RLS Policies | 185 | DDL/rls-policies/ |
| Foreign Keys | 208 | DDL/tables/ (embedded) |

#### Schemas a Analizar

1. `admin_dashboard` - Dashboard administrativo
2. `audit_logging` - Auditoria y logging
3. `auth` - Autenticacion base
4. `auth_management` - Gestion de usuarios
5. `communication` - Mensajeria maestro-estudiante
6. `content_management` - Gestion de contenido
7. `educational_content` - Contenido educativo
8. `gamification_system` - Sistema de gamificacion
9. `gamilit` - Funciones compartidas
10. `lti_integration` - LTI 1.3
11. `notifications` - Sistema de notificaciones
12. `progress_tracking` - Seguimiento de progreso
13. `public` - Schema publico
14. `social_features` - Caracteristicas sociales
15. `storage` - Almacenamiento
16. `system_configuration` - Configuracion del sistema

### 1.2 Criterios de Validacion

#### A. Integridad Estructural DDL

| Criterio | Descripcion | Severidad |
|----------|-------------|-----------|
| CRI-DDL-001 | Todas las tablas tienen PRIMARY KEY | CRITICO |
| CRI-DDL-002 | FKs referencian tablas existentes | CRITICO |
| CRI-DDL-003 | Triggers referencian funciones existentes | CRITICO |
| CRI-DDL-004 | Indexes no estan duplicados | ALTO |
| CRI-DDL-005 | ENUMs usados existen y estan definidos | ALTO |
| CRI-DDL-006 | RLS policies referencian columnas validas | MEDIO |

#### B. Integridad de Datos (Seeds)

| Criterio | Descripcion | Severidad |
|----------|-------------|-----------|
| CRI-SEED-001 | UUIDs son validos (formato UUID v4) | CRITICO |
| CRI-SEED-002 | FKs en seeds referencian registros existentes | CRITICO |
| CRI-SEED-003 | No hay UUIDs duplicados entre tablas relacionadas | ALTO |
| CRI-SEED-004 | Datos requeridos (NOT NULL) estan presentes | ALTO |
| CRI-SEED-005 | Valores ENUM son validos | MEDIO |

#### C. Coherencia DB-Backend

| Criterio | Descripcion | Severidad |
|----------|-------------|-----------|
| CRI-BE-001 | Cada tabla tiene entity correspondiente | ALTO |
| CRI-BE-002 | Columnas de tabla mapeadas en entity | ALTO |
| CRI-BE-003 | Tipos de datos son compatibles | MEDIO |
| CRI-BE-004 | Relaciones (FK) reflejadas en entities | MEDIO |

#### D. Coherencia Backend-Frontend

| Criterio | Descripcion | Severidad |
|----------|-------------|-----------|
| CRI-FE-001 | Endpoints backend tienen API services frontend | ALTO |
| CRI-FE-002 | DTOs backend tienen tipos TypeScript frontend | MEDIO |
| CRI-FE-003 | Rutas frontend tienen endpoints backend | MEDIO |

### 1.3 Estructura de Entregables

```
orchestration/analisis-database-2025-12-26/
├── 00-PLAN-ANALISIS-DATABASE.md          # Este documento
├── 01-FASE-1-PLANEACION/
│   ├── ALCANCE-DETALLADO.md
│   └── CRITERIOS-VALIDACION.md
├── 02-FASE-2-EJECUCION/
│   ├── ANALISIS-DDL-OBJETOS.md
│   ├── ANALISIS-SEEDS-UUIDS.md
│   ├── COHERENCIA-DB-BACKEND.md
│   └── COHERENCIA-BACKEND-FRONTEND.md
├── 03-FASE-3-DISCREPANCIAS/
│   ├── REPORTE-DISCREPANCIAS.md
│   └── PLAN-CORRECCIONES.md
├── 04-FASE-4-VALIDACION/
│   └── VALIDACION-PLAN-CORRECCIONES.md
└── 05-FASE-5-EJECUCION/
    └── LOG-IMPLEMENTACION.md
```

---

## FASE 2: EJECUCION DEL ANALISIS

### 2.1 Analisis de Objetos DDL

#### Subagente: Database-Analyst

**Tareas:**
1. Contar y listar todos los objetos DDL por schema
2. Validar sintaxis SQL de archivos DDL
3. Verificar dependencias entre objetos (FKs, triggers→functions)
4. Identificar objetos duplicados o huerfanos
5. Comparar conteos reales vs inventario documentado

**Archivos a Analizar:**
- `/apps/database/ddl/schemas/*/tables/*.sql`
- `/apps/database/ddl/schemas/*/functions/*.sql`
- `/apps/database/ddl/schemas/*/triggers/*.sql`
- `/apps/database/ddl/schemas/*/indexes/*.sql`
- `/apps/database/ddl/schemas/*/views/*.sql`
- `/apps/database/ddl/schemas/*/enums/*.sql`
- `/apps/database/ddl/schemas/*/rls-policies/*.sql`

### 2.2 Analisis de Seeds y UUIDs

#### Subagente: Data-Validator

**Tareas:**
1. Extraer todos los UUIDs de archivos de seeds
2. Validar formato UUID v4 (8-4-4-4-12)
3. Verificar unicidad de UUIDs por tabla
4. Validar integridad referencial entre seeds
5. Identificar UUIDs hardcodeados vs generados

**Archivos a Analizar:**
- `/apps/database/seeds/dev/*.sql`
- `/apps/database/seeds/prod/*.sql`

### 2.3 Coherencia DB-Backend

#### Subagente: Integration-Analyst

**Tareas:**
1. Mapear tablas DDL → entities TypeORM/Prisma
2. Validar columnas de tabla vs propiedades de entity
3. Verificar tipos de datos compatibles
4. Identificar tablas sin entity correspondiente
5. Identificar entities sin tabla correspondiente

**Archivos a Analizar:**
- `/apps/backend/src/modules/*/entities/*.ts`
- `/apps/database/ddl/schemas/*/tables/*.sql`

### 2.4 Coherencia Backend-Frontend

#### Subagente: API-Analyst

**Tareas:**
1. Listar endpoints backend (controllers)
2. Mapear endpoints → API services frontend
3. Verificar DTOs backend vs tipos TypeScript frontend
4. Identificar endpoints sin consumidor frontend
5. Identificar llamadas frontend sin endpoint backend

**Archivos a Analizar:**
- `/apps/backend/src/modules/*/controllers/*.ts`
- `/apps/frontend/src/services/api/**/*.ts`

---

## FASE 3: PLANEACION DE CORRECCIONES

### 3.1 Clasificacion de Discrepancias

| Prioridad | Descripcion | SLA Correccion |
|-----------|-------------|----------------|
| P0 | Errores criticos que impiden operacion | Inmediato |
| P1 | Errores que afectan funcionalidad | 1-2 dias |
| P2 | Inconsistencias menores | 1 semana |
| P3 | Mejoras de documentacion | Backlog |

### 3.2 Formato de Reporte de Discrepancia

```yaml
discrepancia:
  id: "DISC-XXX"
  tipo: "DDL|SEED|DB-BE|BE-FE"
  criterio_violado: "CRI-XXX-XXX"
  severidad: "CRITICO|ALTO|MEDIO|BAJO"
  descripcion: "..."
  ubicacion:
    archivo: "..."
    linea: X
  impacto: "..."
  correccion_propuesta: "..."
  dependencias: ["DISC-YYY"]
```

---

## FASE 4: VALIDACION DEL PLAN

### 4.1 Checklist de Validacion

- [ ] Todas las discrepancias tienen correccion propuesta
- [ ] Correcciones no introducen nuevas dependencias rotas
- [ ] Orden de implementacion respeta dependencias
- [ ] Rollback plan definido para cada correccion
- [ ] Tests de regresion identificados

### 4.2 Matriz de Impacto

| Correccion | Archivos Impactados | Tests Requeridos |
|------------|---------------------|------------------|
| ... | ... | ... |

---

## FASE 5: EJECUCION DE CORRECCIONES

### 5.1 Protocolo de Implementacion

1. Crear branch de feature
2. Implementar correccion segun plan
3. Ejecutar tests locales
4. Actualizar documentacion/inventarios
5. Code review
6. Merge a develop

### 5.2 Registro de Implementacion

Cada correccion implementada se registrara en:
`05-FASE-5-EJECUCION/LOG-IMPLEMENTACION.md`

---

## PROXIMOS PASOS

1. **Aprobar este plan** - Confirmar alcance y criterios
2. **Iniciar FASE 2** - Ejecutar analisis con subagentes
3. **Generar reportes** - Documentar hallazgos por categoria
4. **Priorizar correcciones** - Clasificar por severidad
5. **Ejecutar correcciones** - Implementar segun plan

---

## REFERENCIAS

- `orchestration/inventarios/DATABASE_INVENTORY.yml`
- `orchestration/inventarios/BACKEND_INVENTORY.yml`
- `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `orchestration/inventarios/MASTER_INVENTORY.yml`
- `apps/database/README.md`

---

**Estado:** PENDIENTE APROBACION
**Siguiente Accion:** Confirmar plan e iniciar FASE 2
