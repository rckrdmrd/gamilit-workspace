# Plan de Actualización de Documentación - Base de Datos GAMILIT

**Fecha creación:** 2025-11-07
**Estado:** 🚧 En ejecución
**Objetivo:** Sincronizar documentación con estado real de la base de datos

---

## 📊 Discrepancias Identificadas

| Aspecto | Documentado | Real | Diferencia | Estado |
|---------|-------------|------|------------|--------|
| **Schemas** | 9 | 13 | +4 | ⚠️ Crítico |
| **Tablas** | 48 | 64 | +16 | ⚠️ Crítico |
| **ENUMs** | 24 | 37 | +13 | ⚠️ Alto |
| **Seeds** | 32 | 47 | +15 | ⚠️ Alto |
| **Funciones** | ? | 61 | ? | ⚠️ Desconocido |
| **Triggers** | ? | 52 | ? | ⚠️ Desconocido |
| **RLS Policies** | ? | 24 | ? | ⚠️ Desconocido |
| **Índices** | ? | 74 | ? | ⚠️ Desconocido |
| **Vistas** | ? | 12 | ? | ⚠️ Desconocido |

### Schemas No Documentados

1. `admin_dashboard` - ⚠️ **CRÍTICO** - Dashboard de administración
2. `storage` - ⚠️ **CRÍTICO** - Sistema de almacenamiento
3. `public` - ⚠️ **REVISAR** - Posible legacy o migración incompleta
4. **Schema 4** - ⚠️ **IDENTIFICAR** - Hay un cuarto schema no identificado

---

## 🎯 Objetivos del Plan

1. ✅ **Completitud:** Documentar el 100% de objetos de base de datos
2. ✅ **Precisión:** Eliminar todas las discrepancias entre docs y código
3. ✅ **Trazabilidad:** Cada objeto debe estar documentado y justificado
4. ✅ **Mantenibilidad:** Crear procesos para mantener sincronización
5. ✅ **Validación:** Scripts automatizados para detectar drift

---

## 📋 Plan de Ejecución por Fases

### FASE 1: Inventario y Auditoría Completa
**Duración:** 2-4 horas
**Prioridad:** 🔴 P0 - Crítico
**Estado:** ⏳ Pendiente

#### Objetivos
- Generar inventario exhaustivo de TODOS los objetos de BD
- Identificar el schema faltante (+4)
- Catalogar discrepancias exactas
- Crear baseline de comparación

#### Tareas

**1.1 Inventario de Schemas** ⏳
```bash
# Script: apps/database/scripts/inventory/01-schemas-inventory.sh
# Genera: apps/database/docs/inventarios/SCHEMAS-INVENTORY.md
```
- [ ] Listar los 13 schemas existentes
- [ ] Identificar propósito de cada schema
- [ ] Detectar el schema #14 no identificado
- [ ] Clasificar schemas por tipo (core, feature, admin, legacy)
- [ ] Documentar dependencias entre schemas

**1.2 Inventario de Tablas** ⏳
```bash
# Script: apps/database/scripts/inventory/02-tables-inventory.sh
# Genera: apps/database/docs/inventarios/TABLES-INVENTORY.md
```
- [ ] Contar tablas por schema (64 total)
- [ ] Listar las 16 tablas no documentadas
- [ ] Generar DDL de cada tabla
- [ ] Documentar relaciones FK
- [ ] Identificar tablas legacy

**1.3 Inventario de ENUMs** ⏳
```bash
# Script: apps/database/scripts/inventory/03-enums-inventory.sh
# Genera: apps/database/docs/inventarios/ENUMS-INVENTORY.md
```
- [ ] Listar los 37 ENUMs existentes
- [ ] Identificar los 13 ENUMs no documentados
- [ ] Documentar valores de cada ENUM
- [ ] Mapear uso en tablas
- [ ] Validar sincronización con backend constants

**1.4 Inventario de Funciones** ⏳
```bash
# Script: apps/database/scripts/inventory/04-functions-inventory.sh
# Genera: apps/database/docs/inventarios/FUNCTIONS-INVENTORY.md
```
- [ ] Listar las 61 funciones existentes
- [ ] Clasificar por tipo (trigger functions, utility, business logic)
- [ ] Documentar parámetros y retornos
- [ ] Identificar funciones críticas vs helper

**1.5 Inventario de Triggers** ⏳
```bash
# Script: apps/database/scripts/inventory/05-triggers-inventory.sh
# Genera: apps/database/docs/inventarios/TRIGGERS-INVENTORY.md
```
- [ ] Listar los 52 triggers existentes
- [ ] Mapear trigger → tabla → función
- [ ] Documentar eventos (BEFORE/AFTER INSERT/UPDATE/DELETE)
- [ ] Identificar triggers de auditoría vs lógica de negocio

**1.6 Inventario de RLS Policies** ⏳
```bash
# Script: apps/database/scripts/inventory/06-rls-inventory.sh
# Genera: apps/database/docs/inventarios/RLS-POLICIES-INVENTORY.md
```
- [ ] Listar las 24 RLS policies
- [ ] Mapear policy → tabla → roles
- [ ] Documentar condiciones de cada policy
- [ ] Validar cobertura de multi-tenancy

**1.7 Inventario de Índices** ⏳
```bash
# Script: apps/database/scripts/inventory/07-indexes-inventory.sh
# Genera: apps/database/docs/inventarios/INDEXES-INVENTORY.md
```
- [ ] Listar los 74 índices
- [ ] Clasificar (primary key, unique, btree, gin, gist)
- [ ] Analizar cobertura de queries
- [ ] Identificar índices redundantes o faltantes

**1.8 Inventario de Vistas** ⏳
```bash
# Script: apps/database/scripts/inventory/08-views-inventory.sh
# Genera: apps/database/docs/inventarios/VIEWS-INVENTORY.md
```
- [ ] Listar las 12 vistas
- [ ] Documentar definición SQL de cada vista
- [ ] Mapear vistas → tablas base
- [ ] Identificar vistas materializadas vs normales

**1.9 Inventario de Seeds** ⏳
```bash
# Script: apps/database/scripts/inventory/09-seeds-inventory.sh
# Genera: apps/database/docs/inventarios/SEEDS-INVENTORY.md
```
- [ ] Listar los 47 archivos de seeds
- [ ] Identificar los 15 seeds no documentados
- [ ] Clasificar seeds (data vs test data vs lookup data)
- [ ] Validar dependencias entre seeds

#### Entregables Fase 1
- [ ] `apps/database/docs/inventarios/` (directorio creado)
- [ ] 9 archivos de inventario en formato Markdown
- [ ] `INVENTORY-MASTER-REPORT.md` - Consolidado de todos los inventarios
- [ ] `DISCREPANCIES-DETAILED-REPORT.md` - Análisis de discrepancias
- [ ] Scripts de inventario automatizados en `apps/database/scripts/inventory/`

---

### FASE 2: Actualización de Documentación de Schemas
**Duración:** 3-5 horas
**Prioridad:** 🔴 P0 - Crítico
**Estado:** ⏳ Pendiente
**Depende de:** Fase 1

#### Objetivos
- Documentar los 4 schemas faltantes
- Actualizar documentación de los 9 schemas existentes
- Crear estructura de documentación estándar

#### Tareas

**2.1 Crear Estructura de Documentación** ⏳
```bash
apps/database/docs/schemas/
├── 01-core/
│   ├── auth/
│   │   ├── README.md
│   │   ├── TABLES.md
│   │   ├── FUNCTIONS.md
│   │   ├── TRIGGERS.md
│   │   └── RLS.md
│   ├── auth_management/
│   └── gamilit/
├── 02-features/
│   ├── gamification_system/
│   ├── educational_content/
│   ├── progress_tracking/
│   ├── content_management/
│   └── social_features/
├── 03-admin/
│   └── admin_dashboard/ (NUEVO)
├── 04-system/
│   ├── system_configuration/
│   ├── audit_logging/
│   └── storage/ (NUEVO)
└── 05-legacy/
    └── public/ (REVISAR)
```

**2.2 Documentar admin_dashboard** ⚠️ CRÍTICO
- [ ] Crear `apps/database/docs/schemas/03-admin/admin_dashboard/README.md`
- [ ] Documentar propósito y alcance
- [ ] Listar todas las vistas (admin_dashboard tiene vistas principalmente)
- [ ] Documentar queries y performance
- [ ] Mapear vistas → datos de origen

**2.3 Documentar storage** ⚠️ CRÍTICO
- [ ] Crear `apps/database/docs/schemas/04-system/storage/README.md`
- [ ] Documentar integración con MinIO/S3
- [ ] Listar ENUMs de tipos de archivo
- [ ] Documentar tablas de metadata de archivos
- [ ] Especificar políticas de almacenamiento

**2.4 Analizar y Documentar public** ⚠️ REVISAR
- [ ] Investigar contenido del schema public
- [ ] Determinar si es legacy o funcional
- [ ] Si es legacy: Plan de migración o deprecación
- [ ] Si es funcional: Documentar como schema activo
- [ ] Actualizar clasificación

**2.5 Identificar Schema Faltante #14** ⚠️ CRÍTICO
- [ ] Revisar listado completo de schemas
- [ ] Verificar si hay typo en el conteo original
- [ ] Documentar si se encuentra
- [ ] Actualizar inventario

**2.6 Actualizar Documentación Existente**
- [ ] Revisar y actualizar docs de `auth`
- [ ] Revisar y actualizar docs de `auth_management`
- [ ] Revisar y actualizar docs de `gamification_system`
- [ ] Revisar y actualizar docs de `educational_content`
- [ ] Revisar y actualizar docs de `progress_tracking`
- [ ] Revisar y actualizar docs de `content_management`
- [ ] Revisar y actualizar docs de `social_features`
- [ ] Revisar y actualizar docs de `system_configuration`
- [ ] Revisar y actualizar docs de `audit_logging`
- [ ] Revisar y actualizar docs de `gamilit`

#### Entregables Fase 2
- [ ] Estructura de directorios `apps/database/docs/schemas/` completa
- [ ] README.md para cada uno de los 13 schemas
- [ ] Documentación detallada de admin_dashboard
- [ ] Documentación detallada de storage
- [ ] Análisis de schema public
- [ ] `SCHEMAS-DOCUMENTATION-INDEX.md` - Índice maestro

---

### FASE 3: Documentación de Tablas y Objetos Faltantes
**Duración:** 4-6 horas
**Prioridad:** 🟠 P1 - Alto
**Estado:** ⏳ Pendiente
**Depende de:** Fase 2

#### Objetivos
- Documentar las 16 tablas faltantes
- Crear diagramas ERD actualizados
- Documentar relaciones y constraints

#### Tareas

**3.1 Identificar las 16 Tablas No Documentadas** ⏳
```sql
-- Script: apps/database/scripts/validation/compare-tables-docs.sql
-- Compara tablas en DDL vs tablas documentadas
```
- [ ] Ejecutar query de comparación
- [ ] Generar lista exacta de 16 tablas
- [ ] Clasificar por schema
- [ ] Priorizar por criticidad

**3.2 Documentar Tablas por Schema** ⏳
Para cada tabla faltante:
- [ ] Nombre y propósito
- [ ] Columnas y tipos
- [ ] Primary key y foreign keys
- [ ] Índices
- [ ] Triggers asociados
- [ ] RLS policies
- [ ] Relaciones con otras tablas
- [ ] Queries comunes
- [ ] Seeds asociados

**3.3 Generar Diagramas ERD** ⏳
- [ ] ERD completo de todos los schemas
- [ ] ERD por schema individual
- [ ] Diagrama de dependencias entre schemas
- [ ] Exportar en formato Mermaid y PlantUML

**3.4 Documentar Funciones (61 funciones)** ⏳
- [ ] Clasificar funciones por tipo
- [ ] Documentar signature y propósito
- [ ] Ejemplos de uso
- [ ] Performance notes
- [ ] Dependencias

**3.5 Documentar Triggers (52 triggers)** ⏳
- [ ] Mapear trigger → tabla → función
- [ ] Documentar comportamiento
- [ ] Casos de uso
- [ ] Impacto en performance

**3.6 Documentar RLS Policies (24 policies)** ⏳
- [ ] Documentar cada policy
- [ ] Explicar lógica de seguridad
- [ ] Roles afectados
- [ ] Testing de policies

**3.7 Documentar Índices (74 índices)** ⏳
- [ ] Justificación de cada índice
- [ ] Queries que utilizan cada índice
- [ ] Análisis de cobertura
- [ ] Recomendaciones de optimización

**3.8 Documentar Vistas (12 vistas)** ⏳
- [ ] Propósito de cada vista
- [ ] SQL definition
- [ ] Tablas base
- [ ] Performance considerations

#### Entregables Fase 3
- [ ] `TABLES-COMPLETE-DOCUMENTATION.md` con las 64 tablas
- [ ] Diagramas ERD en `apps/database/docs/diagrams/`
- [ ] `FUNCTIONS-REFERENCE.md` (61 funciones)
- [ ] `TRIGGERS-REFERENCE.md` (52 triggers)
- [ ] `RLS-POLICIES-REFERENCE.md` (24 policies)
- [ ] `INDEXES-REFERENCE.md` (74 índices)
- [ ] `VIEWS-REFERENCE.md` (12 vistas)

---

### FASE 4: Sincronización de ENUMs y Seeds
**Duración:** 2-3 horas
**Prioridad:** 🟠 P1 - Alto
**Estado:** ⏳ Pendiente
**Depende de:** Fase 3

#### Objetivos
- Documentar los 13 ENUMs faltantes
- Sincronizar ENUMs con backend constants
- Documentar los 15 seeds faltantes
- Validar integridad de seeds

#### Tareas

**4.1 Documentar ENUMs Faltantes (13 ENUMs)** ⏳
- [ ] Listar los 13 ENUMs no documentados
- [ ] Para cada ENUM:
  - [ ] Nombre y ubicación (schema)
  - [ ] Valores posibles
  - [ ] Tablas que lo usan
  - [ ] Sincronización con backend
  - [ ] Casos de uso

**4.2 Sincronizar ENUMs Backend ↔ Database** ⏳
```typescript
// Verificar sincronización con:
// apps/backend/src/shared/constants/enums.constants.ts
```
- [ ] Comparar ENUMs de BD vs ENUMs de backend
- [ ] Identificar discrepancias
- [ ] Actualizar backend constants si es necesario
- [ ] Ejecutar `npm run sync:enums` en monorepo
- [ ] Validar sincronización

**4.3 Documentar Seeds Faltantes (15 seeds)** ⏳
- [ ] Listar los 15 archivos de seeds no documentados
- [ ] Para cada seed:
  - [ ] Nombre y propósito
  - [ ] Datos que inserta
  - [ ] Tablas afectadas
  - [ ] Dependencias (orden de ejecución)
  - [ ] Ambiente (dev/test/prod)

**4.4 Validar Orden de Ejecución de Seeds** ⏳
- [ ] Crear `apps/database/seeds/README.md`
- [ ] Documentar orden correcto de ejecución
- [ ] Crear script `run-all-seeds.sh`
- [ ] Validar que seeds se ejecuten sin errores
- [ ] Documentar datos críticos vs datos de prueba

**4.5 Crear Matriz de Cobertura ENUMs** ⏳
```
| ENUM | Schema | Backend Sync | Frontend Sync | Tablas | Status |
|------|--------|--------------|---------------|--------|--------|
| ... | ... | ✅/❌ | ✅/❌ | ... | ... |
```

#### Entregables Fase 4
- [ ] `ENUMS-COMPLETE-DOCUMENTATION.md` (37 ENUMs)
- [ ] `ENUMS-BACKEND-SYNC-REPORT.md`
- [ ] `SEEDS-COMPLETE-DOCUMENTATION.md` (47 seeds)
- [ ] `apps/database/seeds/README.md` con orden de ejecución
- [ ] Script `apps/database/seeds/run-all-seeds.sh`
- [ ] `ENUM-COVERAGE-MATRIX.md`

---

### FASE 5: Validación, Verificación y Automatización
**Duración:** 3-4 horas
**Prioridad:** 🟡 P2 - Medio
**Estado:** ⏳ Pendiente
**Depende de:** Fase 4

#### Objetivos
- Validar que toda la documentación esté completa
- Crear scripts de validación automatizada
- Establecer proceso de mantenimiento continuo

#### Tareas

**5.1 Validación de Completitud** ⏳
- [ ] Verificar que los 13 schemas estén documentados
- [ ] Verificar que las 64 tablas estén documentadas
- [ ] Verificar que los 37 ENUMs estén documentados
- [ ] Verificar que los 47 seeds estén documentados
- [ ] Verificar que las 61 funciones estén documentadas
- [ ] Verificar que los 52 triggers estén documentados
- [ ] Verificar que las 24 RLS policies estén documentadas
- [ ] Verificar que los 74 índices estén documentados
- [ ] Verificar que las 12 vistas estén documentadas

**5.2 Scripts de Validación Automatizada** ⏳
```bash
apps/database/scripts/validation/
├── validate-schemas.sh
├── validate-tables.sh
├── validate-enums.sh
├── validate-seeds.sh
├── validate-functions.sh
├── validate-triggers.sh
├── validate-rls.sh
├── validate-indexes.sh
├── validate-views.sh
└── validate-all.sh
```

Cada script debe:
- [ ] Comparar objetos en BD vs documentación
- [ ] Generar reporte de discrepancias
- [ ] Exit code 0 si OK, 1 si hay discrepancias
- [ ] Output en formato Markdown

**5.3 Integración con CI/CD** ⏳
```yaml
# .github/workflows/validate-database-docs.yml
```
- [ ] Crear workflow de GitHub Actions
- [ ] Ejecutar scripts de validación en cada PR
- [ ] Bloquear merge si hay discrepancias críticas
- [ ] Generar comentario automático con reporte

**5.4 Crear Documentación de Mantenimiento** ⏳
- [ ] `apps/database/docs/MAINTENANCE.md`
- [ ] Proceso para agregar nueva tabla
- [ ] Proceso para modificar tabla existente
- [ ] Proceso para agregar ENUM
- [ ] Proceso para agregar seed
- [ ] Checklist de documentación obligatoria

**5.5 Generar Reporte Final** ⏳
- [ ] `VALIDATION-FINAL-REPORT.md`
- [ ] Comparativa antes/después
- [ ] Métricas de completitud
- [ ] Lecciones aprendidas
- [ ] Recomendaciones futuras

**5.6 Actualizar README Principal** ⏳
- [ ] `apps/database/README.md`
- [ ] Actualizar estadísticas (64 tablas, 37 ENUMs, etc.)
- [ ] Links a nueva documentación
- [ ] Instrucciones de uso

#### Entregables Fase 5
- [ ] 10 scripts de validación en `apps/database/scripts/validation/`
- [ ] Workflow de CI/CD `.github/workflows/validate-database-docs.yml`
- [ ] `apps/database/docs/MAINTENANCE.md`
- [ ] `VALIDATION-FINAL-REPORT.md`
- [ ] `apps/database/README.md` actualizado

---

## 📈 Métricas de Éxito

| Métrica | Antes | Objetivo | Actual |
|---------|-------|----------|--------|
| Schemas documentados | 9/13 (69%) | 13/13 (100%) | 9/13 (69%) |
| Tablas documentadas | 48/64 (75%) | 64/64 (100%) | 48/64 (75%) |
| ENUMs documentados | 24/37 (65%) | 37/37 (100%) | 24/37 (65%) |
| Seeds documentados | 32/47 (68%) | 47/47 (100%) | 32/47 (68%) |
| Funciones documentadas | 0/61 (0%) | 61/61 (100%) | 0/61 (0%) |
| Triggers documentados | 0/52 (0%) | 52/52 (100%) | 0/52 (0%) |
| RLS policies documentadas | 0/24 (0%) | 24/24 (100%) | 0/24 (0%) |
| Índices documentados | 0/74 (0%) | 74/74 (100%) | 0/74 (0%) |
| Vistas documentadas | 0/12 (0%) | 12/12 (100%) | 0/12 (0%) |

**Meta Global:** 100% de objetos de BD documentados y sincronizados

---

## 🔄 Cronograma Estimado

```
Semana 1:
├── Lunes: Fase 1 (Inventario) - 4 horas
├── Martes: Fase 2 (Schemas) - 5 horas
├── Miércoles: Fase 3 Parte 1 (Tablas) - 3 horas
├── Jueves: Fase 3 Parte 2 (Objetos) - 3 horas
└── Viernes: Fase 4 (ENUMs y Seeds) - 3 horas

Semana 2:
├── Lunes: Fase 5 (Validación) - 4 horas
└── Martes: Review y ajustes finales - 2 horas

Total: ~24 horas de trabajo
```

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Schema #14 no existe (error de conteo) | Alta | Bajo | Validar conteo en Fase 1 |
| Schema public es legacy grande | Media | Alto | Analizar en Fase 2, plan de migración si necesario |
| Tablas sin propósito claro | Media | Medio | Investigar con equipo, consultar git history |
| ENUMs desincronizados con backend | Alta | Alto | Script de sync automatizado en Fase 4 |
| Seeds con dependencias circulares | Baja | Alto | Análisis topológico en Fase 4 |

---

## 📝 Notas Importantes

1. **No eliminar nada sin confirmación:** Si un objeto parece legacy, documentar como deprecated pero NO eliminar sin aprobación
2. **Priorizar schemas críticos:** auth, auth_management, gamification_system son P0
3. **Validar con equipo:** Consultar con desarrolladores sobre propósito de objetos poco claros
4. **Mantener historial:** Documentar razones de cambios en git commits
5. **Testing:** Validar que documentación sea precisa ejecutando queries de ejemplo

---

## ✅ Checklist de Inicio

Antes de empezar:
- [ ] Backup completo de la base de datos
- [ ] Acceso de lectura a todas las schemas
- [ ] Repositorio actualizado (git pull)
- [ ] Crear rama `docs/database-sync-2025-11-07`
- [ ] Notificar al equipo del inicio del proceso

---

## 📚 Referencias

- [PLAN-VALIDACION-COMPLETO.md](./PLAN-VALIDACION-COMPLETO.md) - Plan de validación técnica
- [CRITERIOS-VALIDACION.md](./CRITERIOS-VALIDACION.md) - Criterios de validación
- [apps/backend/src/shared/constants/](../backend/src/shared/constants/) - Constants SSOT
- [docs/03-desarrollo/base-de-datos/](../../docs/03-desarrollo/base-de-datos/) - Docs de BD

---

**Próxima acción:** Ejecutar Fase 1 - Inventario y Auditoría Completa
**Responsable:** Equipo de desarrollo
**Fecha objetivo completación:** 2025-11-15
