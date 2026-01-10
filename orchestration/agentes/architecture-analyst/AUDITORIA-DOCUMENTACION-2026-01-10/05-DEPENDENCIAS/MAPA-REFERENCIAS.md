# Mapa de Referencias y Dependencias - Fase 5

**Fecha:** 2026-01-10
**Fase:** 5 - Analisis de Dependencias
**Basado en:** Planes Fase 3 + Validacion Fase 4

---

## RESUMEN EJECUTIVO

| Metrica | Valor | Estado |
|---------|-------|--------|
| Archivos criticos analizados | 6 | - |
| Total referencias entrantes | 384+ | - |
| Archivos con impacto CRITICO | 3 | Atencion especial |
| Archivos con impacto ALTO | 3 | Validar cambios |
| Cascadas de cambios detectadas | 2 | Documentadas |

---

## ARCHIVOS CRITICOS ANALIZADOS

### 1. US-AE-005-parametrizacion-gamificacion.md (DUPLICADO)

**Ruta:** `docs/90-transversal/restructuracion-v2/US-AE-005-parametrizacion-gamificacion.md`

**Estado:** DUPLICADO - Marcado para ELIMINACION

#### Referencias Entrantes (80+ archivos)
- Plan de correcciones: `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md`
- Auditorias: Reportes de validacion (2025-12-26, 2026-01-10)
- Hallazgos consolidados: `HALLAZGOS-CONSOLIDADOS.md`
- Codigo backend: `gamification-config.service.ts`
- Codigo frontend: `AdminGamificationPage.tsx`

#### Referencias Salientes
- SSOT: `EXT-002-admin-extendido/historias-usuario/US-AE-005-...`
- Tabla BD: `system_configuration.system_settings`
- Endpoints: `/api/v1/admin/gamification/settings`

#### Impacto de Modificacion: **ALTO**

#### Accion Planificada
- **Accion:** ELIMINAR archivo duplicado
- **Plan:** PLAN-PURGA-DUPLICIDADES.md (D-002)
- **Validacion:** Verificar que SSOT en EXT-002 permanece intacto
- **Riesgo:** Bajo - duplicado documentado

---

### 2. US-AE-007-asignar-grupos-maestros.md (DUPLICADO)

**Ruta:** `docs/90-transversal/restructuracion-v2/US-AE-007-asignar-grupos-maestros.md`

**Estado:** DUPLICADO - Marcado para ELIMINACION

#### Referencias Entrantes (Similar a US-AE-005)
- Plan de purga: `PLAN-PURGA-DUPLICIDADES.md`
- Hallazgos: `HALLAZGOS-CONSOLIDADOS.md` (D-001)
- Reportes de auditoria

#### Referencias Salientes
- SSOT: `EXT-002-admin-extendido/historias-usuario/US-AE-007-...`

#### Impacto de Modificacion: **ALTO**

#### Accion Planificada
- **Accion:** ELIMINAR archivo duplicado
- **Plan:** PLAN-PURGA-DUPLICIDADES.md (D-001)
- **Validacion:** Verificar que SSOT en EXT-002 permanece intacto

---

### 3. SCHEMA-COMMUNICATION.md

**Ruta:** `docs/90-transversal/arquitectura-database/SCHEMA-COMMUNICATION.md`

**Estado:** VIGENTE - Requiere correccion

#### Referencias Entrantes (12 archivos)
- Reportes de validacion: `REPORTE-VALIDACION-DOCUMENTACION-2025-12-26.md`
- Proxima accion: `PROXIMA-ACCION.md`
- Maps: `arquitectura-database/_MAP.md`
- Archivos historicos en `archivados/`

#### Referencias Salientes
- Schema: `communication`
- Tabla: `communication.messages`
- Vistas: `recent_classroom_messages`
- Funciones NO IMPLEMENTADAS:
  - `get_unread_count()` (lineas 140-157)
  - `mark_conversation_read()` (lineas 161-178)

#### Impacto de Modificacion: **ALTO**

#### Accion Planificada
- **Accion:** ELIMINAR funciones fantasma de documentacion
- **Plan:** PLAN-CORRECCION-HALLAZGOS-CRITICOS.md (H-003)
- **Validacion:** Verificar que funciones no aparecen en doc actualizada

---

### 4. API-SOCIAL-MODULE.md

**Ruta:** `docs/90-transversal/api/API-SOCIAL-MODULE.md`

**Estado:** VIGENTE - Requiere completar

#### Referencias Entrantes (10+ archivos)
- Reportes de validacion
- Maps: `api/_MAP.md`
- Reportes de integracion: `INTEGRACION-TEACHER-PORTAL-APIs-2025-11-24.md`
- Analisis de coherencia

#### Referencias Salientes
- 10 Controllers backend
- 10 Services backend
- 106 endpoints totales
- 13 entidades de dominio

#### Impacto de Modificacion: **ALTO**

#### Accion Planificada
- **Accion:** Agregar seccion autenticacion JWT + 30 ejemplos JSON
- **Plan:** PLAN-CORRECCION-HALLAZGOS-CRITICOS.md (H-004)
- **Validacion:** Verificar auth documentado y ejemplos presentes

---

### 5. MASTER_INVENTORY.yml

**Ruta:** `orchestration/inventarios/MASTER_INVENTORY.yml`

**Estado:** VIGENTE - SSOT del sistema

#### Referencias Entrantes (131+ archivos)
- Reportes maestros de correccion y validacion
- Auditoria: `HALLAZGOS-CONSOLIDADOS.md`
- Plan de migracion
- Trazas: `TRAZA-TAREAS-DATABASE.md`, `TRAZA-TAREAS-BACKEND.md`
- Directivas: `HERENCIA-SIMCO.md`

#### Referencias Salientes
```yaml
database:
  schemas: 15
  tables: 133
  views: 17
  materialized_views: 11
  enums: 42
  functions: 150
  triggers: 112
  policies_rls: 185
  foreign_keys: 208
backend:
  modules: 16
  entities: 93
  dtos: 327
  services: 103
  controllers: 76
  endpoints: 300+
frontend:
  files: 862
  components: 497
  hooks: 102
  pages: 64
```

#### Impacto de Modificacion: **CRITICO**

#### Accion Planificada
- **Accion:** Reconciliar con DATABASE_INVENTORY (133 vs 70 tablas)
- **Plan:** PLAN-CORRECCION-HALLAZGOS-CRITICOS.md (H-005)
- **Validacion:** Ambos inventarios deben mostrar mismo conteo

---

### 6. DATABASE_INVENTORY.yml

**Ruta:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

**Estado:** VIGENTE - Inventario especializado

#### Referencias Entrantes (131+ archivos)
- Reportes de auditoria database (Ciclos 1-4)
- Analisis de base de datos
- Plan de validacion: `VALIDACION-EJECUCION-CLASSROOMID-2026-01-08.md`
- Trazas: `TRAZA-TAREAS-DATABASE.md`

#### Referencias Salientes
```yaml
metadata:
  version: "4.3.0"
  last_updated: "2026-01-08"
  total_ddl_files: 397
  total_seed_files: 100
database_counts:
  schemas: 16
  tables: 133
  views: 17
  functions: 151
  triggers: 112
  policies: 185
```

#### Impacto de Modificacion: **CRITICO**

#### Accion Planificada
- **Accion:** Reconciliar conteo de tablas con MASTER_INVENTORY
- **Plan:** PLAN-CORRECCION-HALLAZGOS-CRITICOS.md (H-005)
- **Validacion:** Un solo valor de tablas (SSOT unico)

---

### 7. ESTADO-GENERAL.json

**Ruta:** `orchestration/estados/ESTADO-GENERAL.json`

**Estado:** VIGENTE - Dashboard del proyecto

#### Referencias Entrantes (20+ archivos)
- Plan maestro de auditoria
- Cronograma de ejecucion
- Log de correcciones
- Plan de actualizacion de estados
- Reportes de validacion
- Trazas: `TRAZA-BUGS.md`

#### Referencias Salientes
```json
{
  "estado_general": "MVP En Desarrollo",
  "completitud_general": "75%",
  "bloqueadores_activos": 0,
  "sprint_actual": "Sprint 1 - Correcciones Auditoria",
  "database": { "completitud_real": "98%" },
  "backend": { "completitud_general": "40-50%" },
  "frontend": { "build_status": "PASSING" }
}
```

#### Impacto de Modificacion: **CRITICO**

#### Accion Planificada
- **Accion:** REGENERAR con datos actuales
- **Plan:** PLAN-ACTUALIZACION-ESTADOS.md (E-001)
- **Validacion:** Fecha = 2026-01-10, datos coherentes

---

## CASCADAS DE CAMBIOS

### Cascada 1: Inventarios

```
Auditar DDL real
        │
        ↓
DATABASE_INVENTORY.yml ←──→ MASTER_INVENTORY.yml
        │                          │
        ↓                          ↓
Reportes de auditoria       ESTADO-GENERAL.json
(131+ archivos)                    │
                                   ↓
                          Dashboard proyecto
```

**Orden de ejecucion:**
1. Auditar DDL real para conteo exacto
2. Actualizar DATABASE_INVENTORY.yml
3. Actualizar MASTER_INVENTORY.yml (sincronizar)
4. Actualizar ESTADO-GENERAL.json (reflejar cambios)

### Cascada 2: Duplicidades

```
Eliminar US-AE-005/007 de restructuracion-v2/
        │
        ↓
Actualizar _MAP.md de restructuracion-v2/
        │
        ↓
Verificar referencias en reportes de auditoria
        │
        ↓
Actualizar HALLAZGOS-CONSOLIDADOS.md
```

**Orden de ejecucion:**
1. Verificar que SSOT existe en EXT-002
2. Eliminar duplicados de restructuracion-v2/
3. Actualizar _MAP.md correspondiente
4. Marcar como completado en plan de purga

---

## SSOT (Single Source of Truth)

### Definiciones SSOT por Tipo

| Tipo | SSOT | Ubicacion |
|------|------|-----------|
| Historias de Usuario | EXT-002-admin-extendido | docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/ |
| Inventario Database | DATABASE_INVENTORY.yml | orchestration/inventarios/ |
| Inventario General | MASTER_INVENTORY.yml | orchestration/inventarios/ |
| Estado Proyecto | ESTADO-GENERAL.json | orchestration/estados/ |
| Schema Communication | SCHEMA-COMMUNICATION.md | docs/90-transversal/arquitectura-database/ |
| API Social | API-SOCIAL-MODULE.md | docs/90-transversal/api/ |

### Archivos Duplicados a Eliminar

| Archivo | SSOT | Duplicado (ELIMINAR) |
|---------|------|---------------------|
| US-AE-005 | EXT-002/.../US-AE-005-... | 90-transversal/restructuracion-v2/US-AE-005-... |
| US-AE-007 | EXT-002/.../US-AE-007-... | 90-transversal/restructuracion-v2/US-AE-007-... |

---

## ORDEN DE EJECUCION VALIDADO

### Secuencia Sin Conflictos

```
Dia 1 (Paralelo):
├── Crear ET-SYS-001 (M06)
├── Eliminar US-AE-005 duplicado
└── Eliminar US-AE-007 duplicado

Dia 2 (Secuencial por cascada):
├── Eliminar funciones fantasma SCHEMA-COMMUNICATION
├── Auditar DDL real
└── Reconciliar DATABASE_INVENTORY + MASTER_INVENTORY

Dia 3 (Independiente):
└── Completar API-SOCIAL-MODULE (auth + ejemplos)

Dia 4-5 (Dependiente de Dia 2):
├── Actualizar ESTADO-GENERAL.json
├── Sincronizar trazas
└── Consolidar reportes
```

---

## INTEGRIDAD DE REFERENCIAS

### Verificacion Pre-Ejecucion

| Archivo | Referencias Validas | Referencias Rotas | Estado |
|---------|--------------------|--------------------|--------|
| US-AE-005 (dup) | 80 | 0 | OK - Eliminar |
| US-AE-007 (dup) | 80 | 0 | OK - Eliminar |
| SCHEMA-COMMUNICATION | 12 | 0 | OK - Modificar |
| API-SOCIAL-MODULE | 10 | 0 | OK - Modificar |
| MASTER_INVENTORY | 131 | 0 | OK - Modificar |
| DATABASE_INVENTORY | 131 | 0 | OK - Modificar |
| ESTADO-GENERAL | 20 | 0 | OK - Regenerar |

### Verificacion Post-Ejecucion

- [ ] US-AE-005 SSOT accesible desde referencias originales
- [ ] US-AE-007 SSOT accesible desde referencias originales
- [ ] SCHEMA-COMMUNICATION sin funciones fantasma
- [ ] API-SOCIAL-MODULE con auth y ejemplos
- [ ] MASTER_INVENTORY y DATABASE_INVENTORY sincronizados
- [ ] ESTADO-GENERAL.json con fecha 2026-01-10

---

## RECOMENDACIONES

### Alta Prioridad

1. **NO modificar inventarios sin backup**
   - 131+ archivos dependen de ellos
   - Crear checkpoint git antes de cambios

2. **Eliminar duplicados en orden**
   - Primero verificar SSOT existe
   - Luego eliminar duplicado
   - Finalmente actualizar _MAP.md

3. **Actualizar ESTADO-GENERAL al final**
   - Es el dashboard central
   - Reflejar todos los cambios realizados

### Consideraciones Especiales

1. **Funciones fantasma (SCHEMA-COMMUNICATION)**
   - Verificar en DDL si realmente no existen
   - Si existen, documentar ubicacion
   - Si no existen, eliminar de doc

2. **API-SOCIAL-MODULE**
   - Validar 106 endpoints vs codigo real
   - Sincronizar discrepancias

3. **Inventarios**
   - Discrepancia 133 vs 70 tablas requiere auditoria DDL
   - Establecer un unico conteo como SSOT

---

**Autor:** Architecture Analyst
**Estado:** FASE 5 COMPLETADA
**Siguiente:** Fase 6 - Refinamiento del Plan
