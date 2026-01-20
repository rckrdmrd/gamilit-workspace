# Documentacion: TeacherReportsService

**Fecha:** 2026-01-19
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`
**Lineas:** ~202

---

## 1. PROPOSITO

**TeacherReportsService** es un servicio de **persistencia de metadata de reportes**, NO de generacion.

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE REPORTES                        │
├─────────────────────────────────────────────────────────────┤
│  ReportsService (GENERA)                                    │
│     └─> generatePDFReport() / generateExcelReport()         │
│     └─> Persiste archivo a StorageService                   │
│     └─> Llama a TeacherReportsService.createReport()        │
│                                                             │
│  TeacherReportsService (PERSISTE METADATA)                  │
│     └─> createReport() - Guarda metadata en DB              │
│     └─> getRecentReports() - Lista de reportes              │
│     └─> getReportStats() - Estadisticas                     │
│     └─> deleteReport() - Elimina registro                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. METODOS PUBLICOS

| Metodo | Parametros | Retorna | Descripcion |
|--------|-----------|---------|-------------|
| `getRecentReports()` | `teacherId, limit=10` | `ReportMetadataDto[]` | Ultimos N reportes ordenados por fecha DESC |
| `getReportStats()` | `teacherId` | `ReportStatsDto` | Estadisticas: total, ultimo, formato mas usado |
| `getReportById()` | `reportId, teacherId` | `TeacherReport` | Obtiene reporte con validacion de ownership |
| `createReport()` | `CreateTeacherReportDto` | `TeacherReport` | Crea registro de metadata |
| `deleteReport()` | `reportId, teacherId` | `void` | Elimina registro con validacion |

---

## 3. DEPENDENCIAS

```typescript
constructor(
  @InjectRepository(TeacherReport, 'social')
  private readonly teacherReportRepo: Repository<TeacherReport>
)
```

**Unica dependencia:** Repository de `TeacherReport` en datasource `'social'`

---

## 4. ENTIDAD TeacherReport

Tabla: `social_features.teacher_reports`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | FK a Profile (teacher) |
| `tenant_id` | UUID | FK a Tenant (multi-tenant) |
| `classroom_id` | UUID? | FK a Classroom (opcional) |
| `report_name` | string | Nombre del reporte |
| `report_type` | enum | 'individual', 'classroom', 'progress', 'analytics' |
| `report_format` | enum | 'pdf', 'excel', 'csv' |
| `student_count` | int | Estudiantes incluidos |
| `period_start` | date? | Inicio del periodo |
| `period_end` | date? | Fin del periodo |
| `file_path` | text? | Path en storage |
| `file_size_bytes` | bigint? | Tamano del archivo |
| `generated_at` | timestamp | Fecha de generacion |

---

## 5. INDICES

```sql
idx_teacher_reports_teacher_id        -- Query por teacher
idx_teacher_reports_tenant_id         -- Multi-tenant isolation
idx_teacher_reports_generated_at      -- Sorting por fecha
idx_teacher_reports_classroom_id      -- FK support
idx_teacher_reports_report_type       -- Filter por tipo
```

---

## 6. RLS (Row Level Security)

```
teacher_reports_teacher_policy:
  - Teachers can read/write their own reports
  - WHERE teacher_id = current_user_profile_id()

teacher_reports_admin_policy:
  - Admins can read all reports in their tenant
  - WHERE tenant_id = current_tenant_id() AND is_admin()
```

---

## 7. DIFERENCIAS CON ReportsService

| Aspecto | ReportsService | TeacherReportsService |
|---------|----------------|----------------------|
| **Proposito** | GENERA reportes | PERSISTE metadata |
| **Complejidad** | Alta (~1050 lineas) | Baja (~202 lineas) |
| **Dependencias** | Analytics, Storage, PDF gen | Solo Repository |
| **Output** | Buffer + archivo fisico | Registro en BD |

---

## 8. ENDPOINTS RELACIONADOS

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| GET `/teacher/reports/recent` | `getRecentReports()` | Lista reportes |
| GET `/teacher/reports/stats` | `getReportStats()` | Estadisticas |
| GET `/teacher/reports/:id/download` | `getReportById()` | Descarga |
| DELETE `/teacher/reports/:id` | `deleteReport()` | Elimina |

---

**Documentado por:** Claude Opus 4.5
**Referencia:** TASK-2026-01-19-012 (G7)
