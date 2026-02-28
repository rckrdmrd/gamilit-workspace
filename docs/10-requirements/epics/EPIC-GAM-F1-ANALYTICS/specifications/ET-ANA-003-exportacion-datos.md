---
titulo: "ET-ANA-003: Especificacion Tecnica de Exportacion de Datos"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-ANA-003: Especificacion Tecnica de Exportacion de Datos

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-003 |
| **Modulo** | Analytics |
| **Titulo** | Exportacion de Datos y Generacion de Reportes |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Team |

---

## Requerimiento Padre

- [RF-ANA-003: Reportes para Docentes y Administradores](../requirements/RF-ANA-003-reportes-docente.md)

---

## Descripcion Tecnica

Este documento especifica la implementacion tecnica del sistema de reportes de progreso y exportacion a CSV, incluyendo la generacion del reporte visual, el calculo de metricas por modulo, y la exportacion a formato CSV compatible con Excel.

---

## Componentes Afectados

### Backend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ProgressReportService | `modules/teacher-analytics/services/progress-report.service.ts` | Logica del reporte |
| CsvExportService | `modules/teacher-analytics/services/csv-export.service.ts` | Generacion de CSV |
| ProgressReportController | `modules/teacher-analytics/controllers/progress-report.controller.ts` | Endpoints de reporte |
| DTOs | `modules/teacher-analytics/dto/progress-report.dto.ts` | Objetos de transferencia |

### Frontend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ProgressReportView | `features/teacher/analytics/components/ProgressReportView.tsx` | Vista principal |
| ReportHeader | `features/teacher/analytics/components/ReportHeader.tsx` | Header con metadata |
| SummarySection | `features/teacher/analytics/components/SummarySection.tsx` | Resumen general |
| ModuleProgressTable | `features/teacher/analytics/components/ModuleProgressTable.tsx` | Tabla de modulos |
| ExportButton | `features/teacher/analytics/components/ExportButton.tsx` | Boton de exportacion |

### Database
| Vista/Tabla | Schema | Descripcion |
|-------------|--------|-------------|
| module_progress | progress_tracking | Progreso por modulo |
| classrooms | public | Datos de clases |
| students | public | Datos de estudiantes |

---

## Endpoints API

### GET /api/teacher/classroom/{classroomId}/progress-report

**Descripcion:** Obtiene reporte de progreso de la clase

**Request:**
```
GET /api/teacher/classroom/uuid/progress-report
Authorization: Bearer {token}
```

**Response:**
```json
{
  "classroomId": "uuid",
  "classroomName": "Matematicas 6A",
  "generatedAt": "2026-01-20T10:00:00Z",
  "summary": {
    "totalStudents": 25,
    "totalModules": 8,
    "overallProgress": 65.5,
    "studentsFullyCompleted": 3,
    "studentsWithPending": 22
  },
  "moduleProgress": [
    {
      "moduleId": "uuid",
      "moduleName": "Fracciones",
      "completed": 18,
      "inProgress": 5,
      "notStarted": 2,
      "averageProgress": 85.5
    },
    {
      "moduleId": "uuid-2",
      "moduleName": "Geometria",
      "completed": 12,
      "inProgress": 8,
      "notStarted": 5,
      "averageProgress": 68.2
    }
  ]
}
```

**Codigos de Respuesta:**
| Codigo | Descripcion |
|--------|-------------|
| 200 | Exito |
| 401 | No autenticado |
| 403 | Sin acceso a la clase |
| 404 | Clase no encontrada |

---

### GET /api/teacher/classroom/{classroomId}/progress-report/export

**Descripcion:** Exporta reporte de progreso a CSV

**Request:**
```
GET /api/teacher/classroom/uuid/progress-report/export
Authorization: Bearer {token}
```

**Response Headers:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="reporte-matematicas-6a-2026-01-20.csv"
```

**Response Body (CSV):**
```csv
Reporte de Progreso - Matematicas 6A
Generado: 20/01/2026, 10:00 AM

RESUMEN GENERAL
Total de Estudiantes,25
Total de Modulos,8
Progreso General,65.5%
Estudiantes Completos,3
Estudiantes con Pendientes,22

Modulo,Completados,En Progreso,No Iniciados,% Promedio
Algebra,5,12,8,45.0%
Fracciones,18,5,2,85.5%
Geometria,12,8,5,68.2%
```

---

## Implementacion Backend

### Progress Report Service

```typescript
// progress-report.service.ts
@Injectable()
export class ProgressReportService {
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(ModuleProgress) private moduleProgressRepo: Repository<ModuleProgress>,
    private cacheManager: Cache
  ) {}

  async getProgressReport(classroomId: string, teacherId: string) {
    // 1. Validar acceso
    await this.validateTeacherAccess(classroomId, teacherId);

    // 2. Intentar obtener de cache
    const cacheKey = `progress-report:${classroomId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 3. Obtener datos
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId }
    });

    const students = await this.studentRepo.find({
      where: { classrooms: { id: classroomId } }
    });

    const modules = await this.getAssignedModules(classroomId);

    // 4. Calcular resumen
    const summary = await this.calculateSummary(students, modules, classroomId);

    // 5. Calcular progreso por modulo
    const moduleProgress = await Promise.all(
      modules.map(module => this.calculateModuleProgressStats(module, students, classroomId))
    );

    // 6. Ordenar alfabeticamente
    moduleProgress.sort((a, b) => a.moduleName.localeCompare(b.moduleName));

    const result = {
      classroomId,
      classroomName: classroom.name,
      generatedAt: new Date().toISOString(),
      summary,
      moduleProgress
    };

    // 7. Cachear por 10 minutos
    await this.cacheManager.set(cacheKey, result, 600);

    return result;
  }

  private async calculateSummary(
    students: Student[],
    modules: Module[],
    classroomId: string
  ): Promise<ReportSummary> {
    const totalStudents = students.length;
    const totalModules = modules.length;

    // Calcular progreso general
    let totalProgress = 0;
    let studentsFullyCompleted = 0;

    for (const student of students) {
      const studentProgress = await this.calculateStudentOverallProgress(
        student.id,
        classroomId
      );

      totalProgress += studentProgress;

      if (studentProgress === 100) {
        studentsFullyCompleted++;
      }
    }

    const overallProgress = totalStudents > 0
      ? totalProgress / totalStudents
      : 0;

    return {
      totalStudents,
      totalModules,
      overallProgress: Math.round(overallProgress * 10) / 10,
      studentsFullyCompleted,
      studentsWithPending: totalStudents - studentsFullyCompleted
    };
  }

  private async calculateModuleProgressStats(
    module: Module,
    students: Student[],
    classroomId: string
  ): Promise<ModuleProgressStats> {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalProgress = 0;

    for (const student of students) {
      const progress = await this.getStudentModuleProgress(student.id, module.id);

      if (progress === 100) {
        completed++;
      } else if (progress > 0) {
        inProgress++;
      } else {
        notStarted++;
      }

      totalProgress += progress;
    }

    const averageProgress = students.length > 0
      ? totalProgress / students.length
      : 0;

    return {
      moduleId: module.id,
      moduleName: module.name,
      completed,
      inProgress,
      notStarted,
      averageProgress: Math.round(averageProgress * 10) / 10
    };
  }

  private async getStudentModuleProgress(
    studentId: string,
    moduleId: string
  ): Promise<number> {
    const progress = await this.moduleProgressRepo.findOne({
      where: { userId: studentId, moduleId }
    });

    return progress?.completionPercentage || 0;
  }
}
```

### CSV Export Service

```typescript
// csv-export.service.ts
@Injectable()
export class CsvExportService {
  async exportProgressReportCSV(
    classroomId: string,
    teacherId: string,
    progressReportService: ProgressReportService
  ): Promise<{ csv: string; filename: string }> {
    // 1. Obtener reporte
    const report = await progressReportService.getProgressReport(classroomId, teacherId);

    // 2. Generar nombre de archivo
    const filename = this.generateFilename(report.classroomName);

    // 3. Generar CSV
    const csv = this.generateCSV(report);

    return { csv, filename };
  }

  private generateFilename(classroomName: string): string {
    const sanitizedName = classroomName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const date = format(new Date(), 'yyyy-MM-dd');

    return `reporte-${sanitizedName}-${date}.csv`;
  }

  private generateCSV(report: ProgressReport): string {
    const BOM = '\uFEFF'; // UTF-8 BOM para Excel
    const lines: string[] = [];

    // Header del reporte
    lines.push(`Reporte de Progreso - ${report.classroomName}`);
    lines.push(`Generado: ${this.formatDateTime(report.generatedAt)}`);
    lines.push('');

    // Resumen general
    lines.push('RESUMEN GENERAL');
    lines.push(`Total de Estudiantes,${report.summary.totalStudents}`);
    lines.push(`Total de Modulos,${report.summary.totalModules}`);
    lines.push(`Progreso General,${report.summary.overallProgress.toFixed(1)}%`);
    lines.push(`Estudiantes Completos,${report.summary.studentsFullyCompleted}`);
    lines.push(`Estudiantes con Pendientes,${report.summary.studentsWithPending}`);
    lines.push('');

    // Tabla de modulos
    lines.push('Modulo,Completados,En Progreso,No Iniciados,% Promedio');

    report.moduleProgress.forEach(module => {
      // Escapar comas en nombre del modulo
      const moduleName = this.escapeCSVField(module.moduleName);
      lines.push(
        `${moduleName},${module.completed},${module.inProgress},${module.notStarted},${module.averageProgress.toFixed(1)}%`
      );
    });

    return BOM + lines.join('\n');
  }

  private formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return format(date, "dd/MM/yyyy, HH:mm", { locale: es });
  }

  private escapeCSVField(field: string): string {
    // Si contiene comas, comillas o saltos de linea, envolver en comillas
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      // Escapar comillas duplicandolas
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
```

### Controller

```typescript
// progress-report.controller.ts
@Controller('teacher')
@UseGuards(JwtAuthGuard, TeacherGuard)
export class ProgressReportController {
  constructor(
    private progressReportService: ProgressReportService,
    private csvExportService: CsvExportService
  ) {}

  @Get('classroom/:classroomId/progress-report')
  @ApiOperation({ summary: 'Get progress report for classroom' })
  async getProgressReport(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.progressReportService.getProgressReport(classroomId, teacher.id);
  }

  @Get('classroom/:classroomId/progress-report/export')
  @ApiOperation({ summary: 'Export progress report as CSV' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportProgressReport(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User,
    @Res() res: Response
  ) {
    const { csv, filename } = await this.csvExportService.exportProgressReportCSV(
      classroomId,
      teacher.id,
      this.progressReportService
    );

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
```

### DTOs

```typescript
// progress-report.dto.ts
export class ReportSummaryDto {
  @IsInt()
  totalStudents: number;

  @IsInt()
  totalModules: number;

  @IsNumber()
  overallProgress: number;

  @IsInt()
  studentsFullyCompleted: number;

  @IsInt()
  studentsWithPending: number;
}

export class ModuleProgressStatsDto {
  @IsUUID()
  moduleId: string;

  @IsString()
  moduleName: string;

  @IsInt()
  completed: number;

  @IsInt()
  inProgress: number;

  @IsInt()
  notStarted: number;

  @IsNumber()
  averageProgress: number;
}

export class ProgressReportDto {
  @IsUUID()
  classroomId: string;

  @IsString()
  classroomName: string;

  @IsDateString()
  generatedAt: string;

  @ValidateNested()
  @Type(() => ReportSummaryDto)
  summary: ReportSummaryDto;

  @ValidateNested({ each: true })
  @Type(() => ModuleProgressStatsDto)
  moduleProgress: ModuleProgressStatsDto[];
}
```

---

## Implementacion Frontend

### Progress Report View

```typescript
// ProgressReportView.tsx
export const ProgressReportView: React.FC = () => {
  const { classroomId } = useParams();
  const { data: reportData, isLoading } = useProgressReport(classroomId);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadProgressReportCSV(classroomId);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <ReportSkeleton />;

  return (
    <div className="progress-report-container p-6">
      <ReportHeader
        classroomName={reportData.classroomName}
        generatedAt={reportData.generatedAt}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <SummarySection summary={reportData.summary} className="mt-6" />

      <ModuleProgressTable
        modules={reportData.moduleProgress}
        className="mt-6"
      />
    </div>
  );
};
```

### Report Header

```typescript
// ReportHeader.tsx
export const ReportHeader: React.FC<ReportHeaderProps> = ({
  classroomName,
  generatedAt,
  onExport,
  isExporting
}) => {
  return (
    <div className="report-header flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold">Reporte de Progreso</h1>
        <h2 className="text-xl text-gray-600">{classroomName}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Generado: {formatDateTime(generatedAt)}
        </p>
      </div>

      <Button
        onClick={onExport}
        disabled={isExporting}
        variant="primary"
        leftIcon={<DownloadIcon />}
      >
        {isExporting ? 'Exportando...' : 'Exportar a CSV'}
      </Button>
    </div>
  );
};
```

### Summary Section

```typescript
// SummarySection.tsx
export const SummarySection: React.FC<{ summary: ReportSummary }> = ({ summary }) => {
  return (
    <section className="summary-section bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Resumen General</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total de Estudiantes"
          value={summary.totalStudents}
          icon={<UsersIcon />}
        />
        <SummaryCard
          label="Total de Modulos"
          value={summary.totalModules}
          icon={<ModulesIcon />}
        />
        <SummaryCard
          label="Progreso General"
          value={`${summary.overallProgress.toFixed(1)}%`}
          icon={<ProgressIcon />}
        />
        <SummaryCard
          label="Estudiantes Completos"
          value={summary.studentsFullyCompleted}
          icon={<CheckIcon />}
          subtitle={`${summary.studentsWithPending} con pendientes`}
        />
      </div>
    </section>
  );
};
```

### Module Progress Table

```typescript
// ModuleProgressTable.tsx
export const ModuleProgressTable: React.FC<{ modules: ModuleProgressStats[] }> = ({
  modules
}) => {
  return (
    <section className="module-progress-table bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Progreso por Modulo</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Modulo</th>
              <th className="text-center py-3 px-4">Completados</th>
              <th className="text-center py-3 px-4">En Progreso</th>
              <th className="text-center py-3 px-4">No Iniciados</th>
              <th className="text-center py-3 px-4">% Promedio</th>
              <th className="py-3 px-4 w-40">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <ModuleProgressRow key={module.moduleId} module={module} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ModuleProgressRow: React.FC<{ module: ModuleProgressStats }> = ({ module }) => {
  const progressColor = getProgressColor(module.averageProgress);

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-medium">{module.moduleName}</td>
      <td className="py-3 px-4 text-center">
        <Badge color="green">{module.completed}</Badge>
      </td>
      <td className="py-3 px-4 text-center">
        <Badge color="yellow">{module.inProgress}</Badge>
      </td>
      <td className="py-3 px-4 text-center">
        <Badge color="gray">{module.notStarted}</Badge>
      </td>
      <td className="py-3 px-4 text-center font-medium">
        {module.averageProgress.toFixed(1)}%
      </td>
      <td className="py-3 px-4">
        <ProgressBar
          percentage={module.averageProgress}
          color={progressColor}
          size="sm"
        />
      </td>
    </tr>
  );
};
```

### Export Utility

```typescript
// exportUtils.ts
export const downloadProgressReportCSV = async (classroomId: string): Promise<void> => {
  const response = await fetch(
    `/api/teacher/classroom/${classroomId}/progress-report/export`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al exportar reporte');
  }

  // Obtener filename del header
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `reporte-${classroomId}-${Date.now()}.csv`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Crear blob y descargar
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

### Hook

```typescript
// useProgressReport.ts
export const useProgressReport = (classroomId: string) => {
  return useQuery({
    queryKey: ['progressReport', classroomId],
    queryFn: () => teacherAnalyticsApi.getProgressReport(classroomId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000,
    enabled: !!classroomId
  });
};
```

---

## Formato CSV Detallado

### Estructura del Archivo

```
[BOM UTF-8]
Reporte de Progreso - {Nombre Clase}
Generado: {DD/MM/YYYY, HH:mm}

RESUMEN GENERAL
Total de Estudiantes,{N}
Total de Modulos,{N}
Progreso General,{N.N}%
Estudiantes Completos,{N}
Estudiantes con Pendientes,{N}

Modulo,Completados,En Progreso,No Iniciados,% Promedio
{Modulo 1},{N},{N},{N},{N.N}%
{Modulo 2},{N},{N},{N},{N.N}%
...
```

### Especificaciones Tecnicas

| Caracteristica | Valor |
|----------------|-------|
| Encoding | UTF-8 con BOM |
| Separador | Coma (,) |
| Delimitador texto | Comillas dobles (") |
| Salto de linea | \n (LF) |
| Extension | .csv |

### Compatibilidad
- Microsoft Excel (Windows/Mac)
- Google Sheets
- LibreOffice Calc
- Numbers (Mac)

---

## Consideraciones Tecnicas

### Performance
- Cache de reporte: 10 minutos
- Generacion CSV on-the-fly (sin almacenamiento)
- Para clases >100 estudiantes: considerar generacion asincrona

### Seguridad
- Validacion de acceso antes de generar
- Solo profesores de la clase pueden exportar
- Sin datos personales sensibles en CSV (solo agregados)

### Formato
- BOM para compatibilidad Excel
- Escapar campos con comas
- Numeros con punto decimal (no coma)

---

## Testing

### Backend

```typescript
describe('ProgressReportService', () => {
  it('should calculate module progress correctly', async () => {
    const report = await service.getProgressReport(classroomId, teacherId);

    expect(report.moduleProgress[0].completed).toBeGreaterThanOrEqual(0);
    expect(report.moduleProgress[0].inProgress).toBeGreaterThanOrEqual(0);
    expect(report.moduleProgress[0].notStarted).toBeGreaterThanOrEqual(0);

    const total = report.moduleProgress[0].completed +
                  report.moduleProgress[0].inProgress +
                  report.moduleProgress[0].notStarted;

    expect(total).toBe(report.summary.totalStudents);
  });

  it('should generate valid CSV', async () => {
    const { csv } = await csvExportService.exportProgressReportCSV(
      classroomId, teacherId, progressReportService
    );

    expect(csv).toContain('Reporte de Progreso');
    expect(csv).toContain('RESUMEN GENERAL');
    expect(csv).toContain('Modulo,Completados,En Progreso,No Iniciados,% Promedio');
    expect(csv.charCodeAt(0)).toBe(0xFEFF); // BOM
  });
});
```

### Frontend

```typescript
describe('ModuleProgressTable', () => {
  it('renders all modules', () => {
    render(<ModuleProgressTable modules={mockModules} />);

    mockModules.forEach(module => {
      expect(screen.getByText(module.moduleName)).toBeInTheDocument();
    });
  });

  it('shows correct progress colors', () => {
    render(<ModuleProgressTable modules={mockModules} />);

    // Modulo con 85% deberia tener color verde
    const highProgressBar = screen.getByTestId(`progress-bar-${mockModules[0].moduleId}`);
    expect(highProgressBar).toHaveClass('bg-green-500');
  });
});
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial de la especificacion |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/especificaciones/ET-ANA-003-exportacion-datos.md`
