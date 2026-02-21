# 07-SCHEMA-DOC-VALIDATION: Validacion Schema Docs vs Cambios

**Version:** 1.0.0
**Fecha:** 2026-02-20
**Tipo:** READ-ONLY Audit
**Agente:** Claude Opus 4.6 (Schema Documentation Validation)

---

## Resumen Ejecutivo

Se auditaron 6 categorias de cambios de la Teacher Portal Audit contra la documentacion de schemas, modelos de datos, ADRs y flujos. Se encontraron **14 hallazgos** (4 criticos, 5 medios, 5 bajos). Los hallazgos principales son: (1) DDL file paths incorrectos en documentacion, (2) COHERENCE-ENTITIES-DDL no refleja cambios de TypeORM enum a varchar, (3) RLS policy counts desactualizados en 5+ documentos, y (4) enums de SharePermission y ScheduleStatus inconsistentes entre especificaciones.

---

## 1. Schema Reference Coverage

### 1.1 Tablas Documentadas

| Tabla | Schema Fisico | Documentada en schema-reference? | Archivo |
|-------|--------------|----------------------------------|---------|
| teacher_reports | social_features | NO directamente | 08-reports.md documenta `reports.report_*` (conceptual), NO `social_features.teacher_reports` |
| scheduled_reports | social_features | NO | No aparece en ningun schema-reference file |
| shared_reports | social_features | NO | No aparece en ningun schema-reference file |
| teacher_contents | educational_content | NO | No aparece en 03-education.md |
| student_intervention_alerts | progress_tracking | NO | No aparece en 03-education.md ni en otro archivo |
| assignment_students | educational_content | NO directamente | 06-classrooms.md documenta solo conceptual `classrooms.assignment_submissions`, NO `assignment_students` |

### 1.2 Hallazgos

**[FINDING-SR-01] CRITICO: 08-reports.md documenta tablas conceptuales que NO existen en DDL**

El archivo `docs/20-architecture/schema-reference/08-reports.md` documenta 4 tablas conceptuales:
- `reports.report_templates`
- `reports.report_instances`
- `reports.report_schedules`
- `reports.report_exports`

Estas tablas pertenecen al esquema conceptual "reports" y fueron clasificadas como "FUTURO" en COHERENCE-ENTITIES-DDL.md (linea 454: "report_templates/instances/schedules/exports | Post-MVP | FUTURO"). Sin embargo, las tablas reales del Teacher Portal (`teacher_reports`, `scheduled_reports`, `shared_reports`) en schema `social_features` NO estan documentadas en ningun archivo de schema-reference.

**Impacto:** Un desarrollador que consulte 08-reports.md encontrara una estructura de tablas que NO existe, y no encontrara las tablas reales usadas por el Teacher Portal.

**[FINDING-SR-02] MEDIO: 06-classrooms.md no documenta assignment_students**

El archivo `docs/20-architecture/schema-reference/06-classrooms.md` documenta `classrooms.assignments` y `classrooms.assignment_submissions` pero NO incluye `assignment_students`, que es la tabla M2M entre assignments y students. La tabla real existe en `educational_content.assignment_students` (DDL: `07-assignment_students.sql`).

**[FINDING-SR-03] BAJO: 99-utilities.md no lista el nuevo indice compuesto**

El archivo `docs/20-architecture/schema-reference/99-utilities.md` tiene una seccion "Indices de Performance" (lineas 108-114) que NO incluye el nuevo indice `idx_scheduled_reports_cron_due` creado por AUDIT-B4-01. Solo lista 4 indices historicos.

**[FINDING-SR-04] BAJO: RLS policy count en footer desactualizado**

Multiples archivos de schema-reference tienen el footer `231 RLS policies (DDL)`. Con los 5 nuevos policies en `teacher_reports` (AUDIT-B3-01: +3 INSERT/UPDATE/DELETE), mas los policies inline en `scheduled_reports` (2) y `shared_reports` (3), el conteo DDL ha cambiado. El footer en `_INDEX.md` (linea 132), `99-utilities.md` (linea 132), y `MODELO-DATOS.md` (linea 507) dice "231 RLS policies" pero el valor real es mayor.

---

## 2. MODELO-DATOS Alignment

### 2.1 Estado Actual

`docs/20-architecture/MODELO-DATOS.md` (v1.2.0) documenta el modelo conceptual. Las secciones relevantes son:

- **Schema 8: reports** (linea 165): Lista 4 tablas conceptuales (`report_templates`, `report_instances`, `report_schedules`, `report_exports`) — ninguna de estas existe en DDL.
- **Schema 5: social** (linea 113): Lista 7 tablas (`teams`, `team_members`, `social_interactions`, `social_feed`, `team_challenges`, `forum_posts`, `forum_replies`) — NO incluye `teacher_reports`, `scheduled_reports`, ni `shared_reports`.
- **Schema 6: classrooms** (linea 133): Lista 7 tablas — incluye `assignments` y `assignment_submissions` pero NO `assignment_students`.
- **Schema 3: education** (linea 68): NO incluye `teacher_contents`.

### 2.2 Hallazgos

**[FINDING-MD-01] CRITICO: Schema 8 (reports) en MODELO-DATOS.md es completamente aspiracional**

Las 4 tablas conceptuales del Schema 8 NO existen en DDL y fueron marcadas como "FUTURO" en Sprint R4. Las tablas reales de reportes del teacher estan en `social_features` (no en un schema de reports separado). El mapeo conceptual-fisico (linea 460) documenta correctamente que reports = `social_features + admin_dashboard`, pero la seccion de tablas del Schema 8 sigue listando tablas ficticias.

**[FINDING-MD-02] MEDIO: Mapeo RLS Policy Counts por schema desactualizado**

La seccion "RLS Policies (227)" (linea 308) y la tabla de distribucion por schema muestran:
- `reports: 16 policies` — las tablas conceptuales no tienen policies; las tablas reales en `social_features` si (teacher_reports: 5, scheduled_reports: 2, shared_reports: 3 = 10 policies solo para teacher reports)
- `social: 22 policies` — este conteo no incluye los 10 policies de las 3 tablas de teacher reports

El total de 227 (version anterior) deberia ser al menos 227 + 8 (3 nuevos en teacher_reports + 5 inline en scheduled/shared) = 235+ en DDL source.

**[FINDING-MD-03] BAJO: Schema 3 no documenta teacher_contents**

La tabla `educational_content.teacher_contents` (DDL: `25-teacher_content.sql`) no aparece en la seccion de Schema 3 (education). Esta tabla permite a los maestros crear contenido personalizado (worksheets, quizzes, resource packs).

---

## 3. COHERENCE-ENTITIES-DDL Alignment

### 3.1 Entity-DDL Mapping

`docs/20-architecture/COHERENCE-ENTITIES-DDL.md` (v2.2.0) documenta correctamente las 6 entities del modulo teacher:

| Entity | DDL File en Doc | DDL File Real | Match? |
|--------|----------------|---------------|--------|
| scheduled-report.entity.ts | 11-scheduled_reports.sql | **08b-scheduled_reports.sql** | **MISMATCH** |
| shared-report.entity.ts | 12-shared_reports.sql | **08c-shared_reports.sql** | **MISMATCH** |
| teacher-report.entity.ts | 08-teacher_reports.sql | 08-teacher_reports.sql | OK |
| student-intervention-alert.entity.ts | 19-student_intervention_alerts.sql | 19-student_intervention_alerts.sql | OK |
| teacher-content.entity.ts | 25-teacher_content.sql | 25-teacher_content.sql | OK |
| message.entity.ts | 01-messages.sql | 01-messages.sql | OK |

### 3.2 Hallazgos

**[FINDING-CE-01] CRITICO: DDL file names incorrectos para scheduled_reports y shared_reports**

COHERENCE-ENTITIES-DDL.md (lineas 279-280) documenta:
- `scheduled-report.entity.ts | 11-scheduled_reports.sql` — **Real:** `08b-scheduled_reports.sql`
- `shared-report.entity.ts | 12-shared_reports.sql` — **Real:** `08c-shared_reports.sql`

Los archivos DDL reales usan prefijos `08b-` y `08c-` (agrupados junto con `08-teacher_reports.sql`), pero la documentacion referencia prefijos `11-` y `12-` que NO existen en el filesystem. El directorio `apps/database/ddl/schemas/social_features/tables/` NO contiene archivos `11-scheduled_reports.sql` ni `12-shared_reports.sql`.

Este mismo error se propaga a:
- `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` (linea 373): referencia `tables/11-scheduled_reports.sql`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md` (linea 62): referencia `social_features.scheduled_reports` (correcto pero sin path)

**[FINDING-CE-02] MEDIO: Cambio de TypeORM enum a varchar NO documentado**

Las entities `ScheduledReport` y `SharedReport` cambiaron columnas de TypeORM `enum` type a `varchar(20)`:
- `ScheduledReport.frequency`: `type: 'varchar', length: 20` (marcado con `FIX AUDIT-B2`)
- `ScheduledReport.status`: `type: 'varchar', length: 20` (marcado con `FIX AUDIT-B2`)
- `SharedReport.permission_level`: `type: 'varchar', length: 20` (marcado con `FIX AUDIT-B2`)

COHERENCE-ENTITIES-DDL.md no tiene una seccion que documente estos cambios de tipo. La seccion "Alineacion de Columnas" (lineas 413-436) solo cubre correcciones del Sprint R3 y Sprint REC, pero no menciona AUDIT-B2.

Este cambio es significativo porque TypeORM `enum` type genera columnas PostgreSQL de tipo ENUM (requiere `CREATE TYPE`), mientras que `varchar(20)` con CHECK constraints es el patron DDL real. La inconsistencia era un bug silencioso (TypeORM intentaba crear un tipo ENUM que chocaba con el CHECK constraint existente).

**[FINDING-CE-03] BAJO: No documenta nuevo EDIT value en SharePermission**

La entity `shared-report.entity.ts` define `SharePermission` con 3 valores: `VIEW`, `DOWNLOAD`, `EDIT`. El DDL (`08c-shared_reports.sql`, linea 20) lo confirma: `CHECK (permission_level IN ('view', 'download', 'edit'))`. Sin embargo, este cambio no se refleja en COHERENCE-ENTITIES-DDL.md.

---

## 4. ADR Compliance

### 4.1 ADR-003: RLS Multi-tenancy

**Patron Documentado (ADR-003, lineas 41-46):**
```sql
CREATE POLICY "tenant_isolation" ON schema.table
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Patron Real en las 3 tablas:**

| Tabla | Policy Pattern | ADR-003 Compliant? | Notas |
|-------|---------------|-------------------|-------|
| teacher_reports (SELECT teacher) | `teacher_id = current_setting('app.current_user_id')` | **Parcial** | Usa user_id en vez de tenant_id — correcto para ownership, pero difiere del patron standard |
| teacher_reports (SELECT admin) | `tenant_id = current_setting('app.current_tenant_id') AND role IN ('admin')` | Si | Patron extendido con role check |
| teacher_reports (INSERT) | `teacher_id = current_setting('app.current_user_id')` | **Parcial** | Ownership-based, no tenant-based |
| teacher_reports (UPDATE) | `teacher_id = current_setting('app.current_user_id')` con USING + WITH CHECK | Si | Sigue patron de UPDATE correcto |
| teacher_reports (DELETE) | `teacher_id = current_setting('app.current_user_id')` | Si | Patron de DELETE |
| scheduled_reports | FOR ALL con user_id ownership + admin tenant check | Si | 2 policies (teacher + admin) |
| shared_reports | 3 policies: owner, recipient (SELECT only), admin | Si | Patron mas granular, correcto |

**Evaluacion:** Las policies NO usan el patron "tenant_isolation" puro documentado en ADR-003. En su lugar, usan un patron hibrido de **ownership-based** (`teacher_id = current_user_id`) + **role-based** para admins. Esto es una variacion valida para tablas donde el acceso debe ser per-user (no per-tenant), y es coherente con como se manejan tablas de reportes donde un teacher solo debe ver sus propios reportes.

**[FINDING-ADR-01] BAJO: ADR-003 no documenta patron ownership-based**

ADR-003 solo documenta el patron `tenant_isolation` standard. Las policies de teacher reports usan un patron diferente (ownership-based con `current_user_id`). ADR-003 deberia documentar este patron como una variante valida, ya que se usa en al menos 3 tablas.

### 4.2 ADR-045: Clean Architecture Pragmatica

**Evaluacion:** Los cambios de TypeORM `enum` a `varchar(20)` son coherentes con ADR-045 (Seccion 5: "Entities TypeORM mantener como estan"). El ADR permite que las entities sigan siendo clases TypeORM con decoradores ORM. El cambio de `type: 'enum'` a `type: 'varchar'` es una correccion de alineacion DDL-Entity, no un cambio arquitectonico. **Cumple** con ADR-045.

---

## 5. Flow Diagram Impact

### 5.1 Flujos Verificados

| Flujo | Archivo | Teacher Tables Referenciadas | Estado |
|-------|---------|------------------------------|--------|
| FL-TCH-04 | `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` | teacher_reports, scheduled_reports, shared_reports | OK (RLS mencionado, tablas correctas) |
| FL-TCH-03 | `docs/30-ux-ui/flujos/teacher/FLUJO-MONITOREO-ALERTAS.md` | student_intervention_alerts | OK |
| FL-TCH-05 | `docs/30-ux-ui/flujos/teacher/FLUJO-ASIGNACIONES-CLASE.md` | assignment_students | OK |
| FL-STU-17 | `docs/30-ux-ui/flujos/student/FLUJO-ASIGNACIONES-ESTUDIANTE.md` | assignment_students | OK |
| Flows doc | `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | student_intervention_alerts | OK |

### 5.2 Hallazgos

**[FINDING-FD-01] CRITICO: DDL path incorrecto en FLUJO-ANALYTICS-REPORTES.md**

Linea 373 referencia:
```
apps/database/ddl/schemas/social_features/tables/11-scheduled_reports.sql
```
El archivo real es:
```
apps/database/ddl/schemas/social_features/tables/08b-scheduled_reports.sql
```

No existe referencia al DDL de `shared_reports` en la seccion de trazabilidad de este flujo (lineas 370-381), aunque las tablas `shared_reports` se documentan extensivamente en el cuerpo del flujo.

**[FINDING-FD-02] MEDIO: FLUJO-ANALYTICS-REPORTES.md linea 212 documenta solo 'view' y 'download' permisos**

Linea 212 dice:
> Nivel de permiso: `view` (solo lectura) o `download` (descarga permitida).

Pero el DDL y la entity ahora soportan 3 valores: `view`, `download`, `edit`. El flujo necesita documentar el permiso `edit` y su comportamiento (permite editar el reporte compartido).

**[FINDING-FD-03] BAJO: PORTAL-TEACHER-FLOWS.md (v1.0.0) no referencia tablas de reportes**

El archivo `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` documenta flujos de Dashboard, Grading, Intervention Alerts y Bonus Coins pero NO incluye flujos para Reports (scheduled_reports, shared_reports). Fue creado en 2025-11-29 (pre-Sprint 5) y no ha sido actualizado. Los flujos de reportes estan bien documentados en `FLUJO-ANALYTICS-REPORTES.md` (flujos/teacher/), pero el archivo central del portal no los referencia.

---

## 6. Seed Documentation

### 6.1 Seeds Verificados

| Seed | Ruta | Schema | En Pipeline? | Status |
|------|------|--------|-------------|--------|
| teacher_contents | `dev/educational_content/14-teacher_contents.sql` | educational_content | Si (`dev|demo_data`) | OK |
| student_intervention_alerts | `dev/progress_tracking/15-student_intervention_alerts.sql` | progress_tracking | Si (`dev|demo_data`) | OK |
| assignment_students | `dev/educational_content/15-assignment_students.sql` | educational_content | Si (`dev|demo_data`) | OK |
| teacher-notes FK fix | `dev/progress_tracking/08-teacher-notes.sql` | progress_tracking | Ya existente | OK (FIX AUDIT-D3-Q01/Q02) |

### 6.2 Seed Quality

Todos los 3 nuevos seeds siguen los patrones correctos:
- Dynamic lookups via `auth.users JOIN auth_management.profiles` (no hardcoded UUIDs)
- `DO $$ ... BEGIN ... END $$` blocks con graceful skip si profiles no existen
- DELETE + INSERT idempotency pattern
- `dev|demo_data` scope (no ejecutan en produccion)
- Dependencies documentadas en header

### 6.3 Hallazgos

**[FINDING-SD-01] BAJO: MODELO-DATOS.md no menciona seed coverage**

MODELO-DATOS.md no tiene seccion de cobertura de seeds. Esto no es un gap critico (seeds se documentan en `apps/database/seeds/` y en la pipeline de `init-database.sh`) pero seria util para completitud.

---

## 7. Inconsistencias de Enums entre Documentos

### 7.1 SharePermission

| Fuente | Valores Documentados | Correcto? |
|--------|---------------------|-----------|
| DDL (`08c-shared_reports.sql`, linea 20) | `view, download, edit` | **Canonical (DDL)** |
| Entity (`shared-report.entity.ts`, linea 23-27) | `VIEW, DOWNLOAD, EDIT` | Si |
| ET-TCH-006-reportes.md (linea 138-142) | `VIEW, DOWNLOAD, EDIT` | Si |
| API-CONTRACTS.md (linea 194-197) | `VIEW, DOWNLOAD` | **DESACTUALIZADO** (falta EDIT) |
| FLUJO-ANALYTICS-REPORTES.md (linea 212) | `view, download` | **DESACTUALIZADO** (falta edit) |

### 7.2 ScheduleStatus

| Fuente | Valores Documentados | Correcto? |
|--------|---------------------|-----------|
| DDL (`08b-scheduled_reports.sql`, linea 37) | `active, paused, completed` | **Canonical (DDL)** |
| Entity (`scheduled-report.entity.ts`, linea 37-41) | `ACTIVE, PAUSED, COMPLETED` | Si |
| ET-TCH-006-reportes.md (linea 148-153) | `ACTIVE, PAUSED, COMPLETED, FAILED` | **DIVERGENTE** (agrega FAILED que no existe en DDL) |
| API-CONTRACTS.md (linea 202-206) | `ACTIVE, PAUSED, EXPIRED` | **DIVERGENTE** (EXPIRED en vez de COMPLETED) |

**[FINDING-EN-01] MEDIO: 3 documentos con diferentes valores para ScheduleStatus**

DDL define `active, paused, completed`. Pero API-CONTRACTS.md dice `active, paused, expired` y ET-TCH-006-reportes.md dice `active, paused, completed, failed`. Solo la entity y el DDL coinciden.

---

## 8. Tabla Resumen de Hallazgos

| ID | Severidad | Categoria | Descripcion |
|----|-----------|-----------|-------------|
| FINDING-SR-01 | CRITICO | Schema Ref | 08-reports.md documenta tablas conceptuales que no existen en DDL; tablas reales (teacher_reports, scheduled/shared_reports) no estan documentadas |
| FINDING-CE-01 | CRITICO | Coherence | DDL file paths incorrectos: `11-scheduled_reports.sql` y `12-shared_reports.sql` no existen; reales son `08b-` y `08c-` |
| FINDING-FD-01 | CRITICO | Flow Diagram | FLUJO-ANALYTICS-REPORTES.md referencia DDL path inexistente `11-scheduled_reports.sql` |
| FINDING-MD-01 | CRITICO | Modelo Datos | Schema 8 (reports) lista 4 tablas aspiracionales; tablas reales en social_features no documentadas |
| FINDING-CE-02 | MEDIO | Coherence | Cambio TypeORM enum -> varchar(20) (AUDIT-B2) no documentado en COHERENCE-ENTITIES-DDL |
| FINDING-EN-01 | MEDIO | Enums | ScheduleStatus tiene 3 definiciones diferentes entre API-CONTRACTS, ET-TCH-006 y DDL |
| FINDING-MD-02 | MEDIO | Modelo Datos | RLS Policy counts por schema desactualizados (no incluyen 10 policies de teacher report tables) |
| FINDING-FD-02 | MEDIO | Flow Diagram | Flujo de compartidos documenta solo view/download; falta permiso 'edit' |
| FINDING-SR-02 | MEDIO | Schema Ref | 06-classrooms.md no documenta assignment_students |
| FINDING-SR-03 | BAJO | Schema Ref | 99-utilities.md no lista idx_scheduled_reports_cron_due |
| FINDING-SR-04 | BAJO | Schema Ref | Footer RLS count "231" desactualizado en _INDEX.md, 99-utilities.md |
| FINDING-CE-03 | BAJO | Coherence | EDIT value en SharePermission no documentado en coherence doc |
| FINDING-ADR-01 | BAJO | ADR | ADR-003 no documenta patron ownership-based usado por teacher reports |
| FINDING-SD-01 | BAJO | Seeds | MODELO-DATOS.md no menciona seed coverage |
| FINDING-MD-03 | BAJO | Modelo Datos | teacher_contents no documentada en Schema 3 |
| FINDING-FD-03 | BAJO | Flow Diagram | PORTAL-TEACHER-FLOWS.md (v1.0.0) no referencia flujos de reportes |

---

## 9. Recomendaciones (Doc Updates Needed)

### Prioridad 1 (Criticos — Informacion incorrecta que puede causar errores)

1. **COHERENCE-ENTITIES-DDL.md** — Corregir DDL file paths:
   - Linea 279: `11-scheduled_reports.sql` -> `08b-scheduled_reports.sql`
   - Linea 280: `12-shared_reports.sql` -> `08c-shared_reports.sql`

2. **FLUJO-ANALYTICS-REPORTES.md** — Corregir DDL path y agregar shared_reports:
   - Linea 373: `tables/11-scheduled_reports.sql` -> `tables/08b-scheduled_reports.sql`
   - Agregar fila: `| Database | apps/database/ddl/schemas/social_features/tables/08c-shared_reports.sql | Reportes compartidos |`

3. **08-reports.md** — Reescribir para documentar las tablas reales:
   - Reemplazar las 4 tablas conceptuales con las 3 tablas reales: `social_features.teacher_reports`, `social_features.scheduled_reports`, `social_features.shared_reports`
   - Incluir columnas, indices, RLS policies, y entity mapping
   - Actualizar titulo: "Schema 8: reports (3 tablas fisicas en social_features, 10 RLS policies)"

4. **MODELO-DATOS.md** — Actualizar Schema 8 (reports):
   - Reemplazar las 4 tablas conceptuales con las 3 reales
   - Actualizar el mapeo en la seccion "Mapeo Conceptual a Fisico"
   - Actualizar RLS count de 227 a 231+ (recalcular con nuevos policies)

### Prioridad 2 (Medios — Informacion incompleta o desactualizada)

5. **COHERENCE-ENTITIES-DDL.md** — Agregar seccion AUDIT-B2:
   - Documentar cambio de TypeORM enum -> varchar(20) para `frequency`, `status`, `permission_level`
   - En la seccion "Correcciones Sprint REC", agregar subseccion "Correcciones AUDIT-B2"

6. **API-CONTRACTS.md** — Actualizar enums:
   - `SharePermission`: agregar `EDIT = 'edit'`
   - `ScheduleStatus`: cambiar `EXPIRED` -> `COMPLETED` para alinear con DDL

7. **ET-TCH-006-reportes.md** — Alinear ScheduleStatus:
   - Remover `FAILED` (no existe en DDL CHECK constraint) o agregar a DDL si es necesario

8. **FLUJO-ANALYTICS-REPORTES.md** — Linea 212:
   - Agregar `edit` como tercer nivel de permiso

9. **_INDEX.md** + **99-utilities.md** — Actualizar footers:
   - Recalcular RLS policy count total tras AUDIT-B3 changes

### Prioridad 3 (Bajos — Mejoras de completitud)

10. **99-utilities.md** — Agregar `idx_scheduled_reports_cron_due` a seccion "Indices de Performance"
11. **06-classrooms.md** — Agregar tabla `assignment_students` con columnas
12. **03-education.md** — Agregar tabla `teacher_contents` con columnas
13. **ADR-003** — Agregar seccion "Variante: Ownership-based Policies" documentando el patron usado por teacher reports
14. **PORTAL-TEACHER-FLOWS.md** — Agregar referencia a FLUJO-ANALYTICS-REPORTES.md en el changelog o como seccion 1.5

---

*Generado por: Claude Opus 4.6 — TASK-2026-02-20-TEACHER-PORTAL-AUDIT*
*Modo: READ-ONLY ANALYSIS (no se editaron archivos)*
*Archivos leidos: 28 | Searches ejecutados: 12 | Hallazgos: 14 (4C, 5M, 5B)*
