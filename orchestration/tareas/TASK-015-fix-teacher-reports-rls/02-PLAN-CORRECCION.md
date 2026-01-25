# PLAN DE CORRECCION: Teacher Reports RLS Fix

**TASK:** TASK-2026-01-25-GAMILIT-REPORTS-FIX
**Solucion Seleccionada:** OPCION 2 - SET LOCAL en el Servicio
**Complejidad:** MEDIA

---

## RESUMEN EJECUTIVO

El problema es que RLS (Row Level Security) esta habilitado en la tabla `teacher_reports` pero el backend no establece las variables de sesion PostgreSQL necesarias (`app.current_user_id`, `app.current_tenant_id`).

**Fix:** Modificar `TeacherReportsService` para ejecutar `SET LOCAL` dentro de transacciones antes de las queries.

---

## CAMBIOS REQUERIDOS

### 1. Modificar TeacherReportsService

**Archivo:** `projects/gamilit/apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

#### 1.1 Agregar Imports

```typescript
// Agregar al inicio del archivo
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
```

#### 1.2 Inyectar DataSource en Constructor

```typescript
constructor(
  @InjectRepository(TeacherReport, 'social')
  private readonly teacherReportRepo: Repository<TeacherReport>,
  // NUEVO: Inyectar DataSource para ejecutar SET LOCAL
  @InjectDataSource('social')
  private readonly dataSource: DataSource,
) {}
```

#### 1.3 Modificar getRecentReports()

**ANTES (lineas 35-45):**
```typescript
async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
  this.logger.log(`Getting recent reports for teacher ${teacherId} with limit ${limit}`);

  const reports = await this.teacherReportRepo.find({
    where: { teacherId },
    order: { generatedAt: 'DESC' },
    take: limit,
  });

  return reports.map(report => this.mapToReportMetadataDto(report));
}
```

**DESPUES:**
```typescript
async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
  this.logger.log(`Getting recent reports for teacher ${teacherId} with limit ${limit}`);

  // FIX TASK-2026-01-25: Usar transaccion con SET LOCAL para RLS
  return this.dataSource.transaction(async (manager) => {
    // Establecer contexto RLS para esta transaccion
    await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

    const reports = await manager.find(TeacherReport, {
      where: { teacherId },
      order: { generatedAt: 'DESC' },
      take: limit,
    });

    return reports.map(report => this.mapToReportMetadataDto(report));
  });
}
```

#### 1.4 Modificar getReportStats()

**ANTES (lineas 53-105):**
```typescript
async getReportStats(teacherId: string): Promise<ReportStatsDto> {
  this.logger.log(`Getting report stats for teacher ${teacherId}`);

  const reports = await this.teacherReportRepo.find({
    where: { teacherId },
  });
  // ... resto del metodo
}
```

**DESPUES:**
```typescript
async getReportStats(teacherId: string): Promise<ReportStatsDto> {
  this.logger.log(`Getting report stats for teacher ${teacherId}`);

  // FIX TASK-2026-01-25: Usar transaccion con SET LOCAL para RLS
  return this.dataSource.transaction(async (manager) => {
    // Establecer contexto RLS para esta transaccion
    await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

    const reports = await manager.find(TeacherReport, {
      where: { teacherId },
    });

    const totalReports = reports.length;

    if (totalReports === 0) {
      return {
        total_reports_generated: 0,
        last_generated_date: null,
        most_used_format: null,
        avg_students_per_report: 0,
      };
    }

    const lastReport = await manager.findOne(TeacherReport, {
      where: { teacherId },
      order: { generatedAt: 'DESC' },
    });

    const lastGeneratedDate = lastReport?.generatedAt.toISOString() || null;

    const formatCounts = reports.reduce(
      (acc, report) => {
        acc[report.reportFormat] = (acc[report.reportFormat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostUsedFormat =
      Object.keys(formatCounts).length > 0
        ? Object.entries(formatCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : null;

    const totalStudents = reports.reduce((sum, report) => sum + (report.studentCount || 0), 0);
    const avgStudentsPerReport = Math.round(totalStudents / totalReports);

    return {
      total_reports_generated: totalReports,
      last_generated_date: lastGeneratedDate,
      most_used_format: mostUsedFormat,
      avg_students_per_report: avgStudentsPerReport,
    };
  });
}
```

#### 1.5 Modificar getReportById()

**ANTES (lineas 116-136):**
```typescript
async getReportById(reportId: string, teacherId: string): Promise<TeacherReport> {
  this.logger.log(`Getting report ${reportId} for teacher ${teacherId}`);

  const report = await this.teacherReportRepo.findOne({
    where: { id: reportId },
  });
  // ...validaciones
}
```

**DESPUES:**
```typescript
async getReportById(reportId: string, teacherId: string): Promise<TeacherReport> {
  this.logger.log(`Getting report ${reportId} for teacher ${teacherId}`);

  // FIX TASK-2026-01-25: Usar transaccion con SET LOCAL para RLS
  return this.dataSource.transaction(async (manager) => {
    await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

    const report = await manager.findOne(TeacherReport, {
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Validar ownership (doble check aunque RLS deberia filtrar)
    if (report.teacherId !== teacherId) {
      this.logger.warn(
        `Teacher ${teacherId} attempted to access report ${reportId} owned by ${report.teacherId}`,
      );
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  });
}
```

#### 1.6 Modificar deleteReport()

**ANTES (lineas 174-178):**
```typescript
async deleteReport(reportId: string, teacherId: string): Promise<void> {
  const report = await this.getReportById(reportId, teacherId);
  await this.teacherReportRepo.remove(report);
  this.logger.log(`Report ${reportId} deleted by teacher ${teacherId}`);
}
```

**DESPUES:**
```typescript
async deleteReport(reportId: string, teacherId: string): Promise<void> {
  // FIX TASK-2026-01-25: Usar transaccion con SET LOCAL para RLS
  await this.dataSource.transaction(async (manager) => {
    await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

    const report = await manager.findOne(TeacherReport, {
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    if (report.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this report');
    }

    await manager.remove(report);
    this.logger.log(`Report ${reportId} deleted by teacher ${teacherId}`);
  });
}
```

---

## CODIGO COMPLETO DEL SERVICIO MODIFICADO

```typescript
/**
 * TeacherReportsService
 *
 * Service for managing teacher reports metadata (CRUD operations)
 * This service handles the retrieval of report metadata stored in the database.
 *
 * FIX TASK-2026-01-25: Added SET LOCAL for RLS context in all queries
 */

import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TeacherReport } from '../entities/teacher-report.entity';
import { ReportMetadataDto, ReportStatsDto, CreateTeacherReportDto } from '../dto/teacher-reports.dto';

@Injectable()
export class TeacherReportsService {
  private readonly logger = new Logger(TeacherReportsService.name);

  constructor(
    @InjectRepository(TeacherReport, 'social')
    private readonly teacherReportRepo: Repository<TeacherReport>,
    // FIX TASK-2026-01-25: DataSource para SET LOCAL en transacciones
    @InjectDataSource('social')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get recent reports for a teacher
   * FIX TASK-2026-01-25: Uses transaction with SET LOCAL for RLS
   */
  async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
    this.logger.log(`Getting recent reports for teacher ${teacherId} with limit ${limit}`);

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

      const reports = await manager.find(TeacherReport, {
        where: { teacherId },
        order: { generatedAt: 'DESC' },
        take: limit,
      });

      return reports.map(report => this.mapToReportMetadataDto(report));
    });
  }

  /**
   * Get report statistics for a teacher
   * FIX TASK-2026-01-25: Uses transaction with SET LOCAL for RLS
   */
  async getReportStats(teacherId: string): Promise<ReportStatsDto> {
    this.logger.log(`Getting report stats for teacher ${teacherId}`);

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

      const reports = await manager.find(TeacherReport, {
        where: { teacherId },
      });

      const totalReports = reports.length;

      if (totalReports === 0) {
        return {
          total_reports_generated: 0,
          last_generated_date: null,
          most_used_format: null,
          avg_students_per_report: 0,
        };
      }

      const lastReport = await manager.findOne(TeacherReport, {
        where: { teacherId },
        order: { generatedAt: 'DESC' },
      });

      const lastGeneratedDate = lastReport?.generatedAt.toISOString() || null;

      const formatCounts = reports.reduce(
        (acc, report) => {
          acc[report.reportFormat] = (acc[report.reportFormat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const mostUsedFormat =
        Object.keys(formatCounts).length > 0
          ? Object.entries(formatCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : null;

      const totalStudents = reports.reduce((sum, report) => sum + (report.studentCount || 0), 0);
      const avgStudentsPerReport = Math.round(totalStudents / totalReports);

      return {
        total_reports_generated: totalReports,
        last_generated_date: lastGeneratedDate,
        most_used_format: mostUsedFormat,
        avg_students_per_report: avgStudentsPerReport,
      };
    });
  }

  /**
   * Get a specific report by ID with ownership validation
   * FIX TASK-2026-01-25: Uses transaction with SET LOCAL for RLS
   */
  async getReportById(reportId: string, teacherId: string): Promise<TeacherReport> {
    this.logger.log(`Getting report ${reportId} for teacher ${teacherId}`);

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

      const report = await manager.findOne(TeacherReport, {
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      if (report.teacherId !== teacherId) {
        this.logger.warn(
          `Teacher ${teacherId} attempted to access report ${reportId} owned by ${report.teacherId}`,
        );
        throw new ForbiddenException('You do not have access to this report');
      }

      return report;
    });
  }

  /**
   * Create a new report record in the database
   * NOTE: createReport does NOT need RLS context - it uses the repo directly
   * because INSERT is handled at application level (not RLS policy)
   */
  async createReport(dto: CreateTeacherReportDto): Promise<TeacherReport> {
    this.logger.log(`Creating report "${dto.reportName}" for teacher ${dto.teacherId}`);

    const report = this.teacherReportRepo.create({
      teacherId: dto.teacherId,
      tenantId: dto.tenantId,
      reportName: dto.reportName,
      reportType: dto.reportType,
      reportFormat: dto.reportFormat,
      classroomId: dto.classroomId || null,
      studentCount: dto.studentCount,
      periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
      periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
      filePath: dto.filePath,
      fileSizeBytes: dto.fileSizeBytes,
      generatedAt: new Date(),
    });

    const savedReport = await this.teacherReportRepo.save(report);
    this.logger.log(`Report created successfully with ID: ${savedReport.id}`);

    return savedReport;
  }

  /**
   * Delete a report by ID (with ownership validation)
   * FIX TASK-2026-01-25: Uses transaction with SET LOCAL for RLS
   */
  async deleteReport(reportId: string, teacherId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

      const report = await manager.findOne(TeacherReport, {
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      if (report.teacherId !== teacherId) {
        throw new ForbiddenException('You do not have access to this report');
      }

      await manager.remove(report);
      this.logger.log(`Report ${reportId} deleted by teacher ${teacherId}`);
    });
  }

  /**
   * Map TeacherReport entity to ReportMetadataDto
   */
  private mapToReportMetadataDto(report: TeacherReport): ReportMetadataDto {
    return {
      id: report.id,
      report_name: report.reportName,
      report_type: report.reportType,
      report_format: report.reportFormat,
      student_count: report.studentCount,
      period_start: report.periodStart ? report.periodStart.toISOString() : null,
      period_end: report.periodEnd ? report.periodEnd.toISOString() : null,
      generated_at: report.generatedAt.toISOString(),
      file_size_bytes: report.fileSizeBytes ?? null,
    };
  }
}
```

---

## VALIDACION

### 1. Verificar Build

```bash
cd projects/gamilit/apps/backend
npm run build
```

### 2. Verificar Lint

```bash
npm run lint
```

### 3. Probar Endpoint

```bash
# Obtener token de teacher
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"test123"}' | jq -r '.access_token')

# Probar endpoint
curl -X GET http://localhost:3001/api/teacher/reports/recent \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Verificar en UI

1. Login como teacher
2. Navegar a /teacher/reports
3. Verificar que muestra lista de reportes (o mensaje "No hay reportes" si no hay datos)
4. Verificar que NO muestra el banner de "Datos de Demostracion"

---

## CHECKLIST PRE-MERGE

- [ ] Build exitoso sin errores
- [ ] Lint sin warnings nuevos
- [ ] Endpoint /teacher/reports/recent retorna datos (o array vacio sin error)
- [ ] Endpoint /teacher/reports/stats retorna estadisticas
- [ ] UI no muestra banner de mock data
- [ ] Tests existentes pasan
