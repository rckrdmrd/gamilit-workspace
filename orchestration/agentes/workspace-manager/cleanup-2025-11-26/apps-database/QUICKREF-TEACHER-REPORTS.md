# QUICKREF: teacher_reports Table

**Fecha:** 2025-11-26
**Schema:** social_features
**Estado:** ✅ CREADO

---

## Archivos Creados

```
apps/database/ddl/schemas/social_features/
├── tables/08-teacher_reports.sql                    (4.2 KB)
├── triggers/29-trg_teacher_reports_updated_at.sql   (662 bytes)
└── rls-policies/08-teacher-reports-policies.sql     (2.3 KB)
```

---

## Estructura Rápida

```sql
CREATE TABLE social_features.teacher_reports (
  id                UUID PRIMARY KEY,
  teacher_id        UUID NOT NULL → auth_management.profiles,
  classroom_id      UUID → social_features.classrooms,
  tenant_id         UUID NOT NULL → auth_management.tenants,

  report_name       VARCHAR(255) NOT NULL,
  report_type       VARCHAR(50) CHECK (individual|classroom|progress|analytics),
  report_format     VARCHAR(10) CHECK (pdf|excel|csv),

  student_count     INTEGER,
  period_start      DATE,
  period_end        DATE,

  file_path         TEXT,
  file_size_bytes   BIGINT,

  generated_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ
);
```

---

## Índices

- `idx_teacher_reports_teacher_id` - Consultas por profesor
- `idx_teacher_reports_tenant_id` - Multi-tenancy
- `idx_teacher_reports_generated_at` - Order by fecha DESC
- `idx_teacher_reports_classroom_id` - Por aula (parcial)
- `idx_teacher_reports_report_type` - Filtrado por tipo

---

## RLS Policies

1. **teacher_reports_teacher_policy** - Profesores ven solo sus reportes
2. **teacher_reports_admin_policy** - Admins ven todos en su tenant

---

## Despliegue

```bash
cd apps/database
./create-database.sh 'postgresql://gamilit_user:password@localhost:5432/gamilit_platform'
```

---

## Próximos Pasos (Backend)

Crear:
- `TeacherReportEntity`
- `TeacherReportDto`
- `TeacherReportsService`
- `TeacherReportsController`

Endpoints:
- `POST /api/teacher-reports` - Generar
- `GET /api/teacher-reports` - Listar
- `GET /api/teacher-reports/:id` - Ver
- `DELETE /api/teacher-reports/:id` - Eliminar

---

**Documentación completa:** `REPORTE-TEACHER-REPORTS-TABLE-2025-11-26.md`
**Diagrama visual:** `TEACHER-REPORTS-VISUAL-SCHEMA.txt`
