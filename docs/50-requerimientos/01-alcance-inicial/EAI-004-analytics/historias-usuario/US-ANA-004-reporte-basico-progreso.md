---
id: "US-ANA-004"
title: "Reporte Básico de Progreso"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-004"
story_points: 6
budget: "$3,000 MXN"
sprint: "Sprint-1"
labels: ["analytics", "reports", "csv-export"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ANA-004: Reporte Básico de Progreso

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 6 SP
**Presupuesto:** $3,000 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero generar un reporte básico de progreso de mi clase para tener un registro del avance general que pueda exportar y compartir.

**Contexto del Alcance Inicial:**

Este reporte proporciona un resumen del progreso de la clase por módulo, mostrando cuántos estudiantes han completado cada módulo y cuántos están pendientes. Incluye exportación básica a CSV. NO incluye gráficas avanzadas, múltiples formatos de exportación, ni filtros complejos (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Vista de Reporte
- [ ] Tabla que muestra todos los módulos asignados a la clase
- [ ] Para cada módulo muestra:
  - Nombre del módulo
  - # estudiantes completados
  - # estudiantes en progreso
  - # estudiantes no iniciados
  - % completitud promedio
  - Barra de progreso visual
- [ ] Resumen general al inicio (totales de la clase)

### CA-02: Resumen General
- [ ] Total de estudiantes en la clase
- [ ] Total de módulos asignados
- [ ] Progreso general de la clase (%)
- [ ] # de estudiantes con todos los módulos completados
- [ ] # de estudiantes con módulos pendientes

### CA-03: Exportación a CSV
- [ ] Botón "Exportar a CSV"
- [ ] Archivo CSV contiene:
  - Header con información de la clase
  - Columnas: Módulo, Completados, En Progreso, No Iniciados, % Promedio
  - Nombre de archivo: `reporte-{clase}-{fecha}.csv`
- [ ] Descarga automática del archivo

### CA-04: Filtros Básicos
- [ ] Sin filtros en alcance inicial (mostrar todos los módulos)
- [ ] Ordenamiento por nombre de módulo (alfabético)

### CA-05: Performance
- [ ] Reporte genera en menos de 3 segundos para clases de hasta 100 estudiantes
- [ ] CSV genera en menos de 2 segundos
- [ ] Muestra skeleton loader durante generación

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/classroom/{classroomId}/progress-report
```

**Response:**
```json
{
  "classroomId": "uuid",
  "classroomName": "Matemáticas 6A",
  "generatedAt": "2025-11-02T10:00:00Z",
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
      "moduleName": "Geometría",
      "completed": 12,
      "inProgress": 8,
      "notStarted": 5,
      "averageProgress": 68.2
    }
  ]
}
```

**Endpoint de Exportación:**
```
GET /api/teacher/classroom/{classroomId}/progress-report/export
Response: CSV file download
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('classroom/:classroomId/progress-report')
async getProgressReport(
  @Param('classroomId') classroomId: string,
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getProgressReport(classroomId, teacher.id);
}

@Get('classroom/:classroomId/progress-report/export')
async exportProgressReport(
  @Param('classroomId') classroomId: string,
  @CurrentUser() teacher: User,
  @Res() res: Response
) {
  const csv = await this.analyticsService.exportProgressReportCSV(
    classroomId,
    teacher.id
  );

  const filename = this.generateFilename(classroomId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getProgressReport(classroomId: string, teacherId: string) {
  // Validar acceso
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomService.findById(classroomId);
  const students = await this.classroomService.getStudents(classroomId);
  const modules = await this.classroomService.getAssignedModules(classroomId);

  // Calcular resumen general
  const summary = await this.calculateSummary(students, modules);

  // Calcular progreso por módulo
  const moduleProgress = await Promise.all(
    modules.map(async (module) => {
      return await this.calculateModuleProgressStats(
        module,
        students
      );
    })
  );

  return {
    classroomId,
    classroomName: classroom.name,
    generatedAt: new Date().toISOString(),
    summary,
    moduleProgress: moduleProgress.sort((a, b) =>
      a.moduleName.localeCompare(b.moduleName)
    )
  };
}

private async calculateModuleProgressStats(module, students) {
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let totalProgress = 0;

  for (const student of students) {
    const progress = await this.getStudentModuleProgress(
      student.id,
      module.id
    );

    if (progress === 100) {
      completed++;
    } else if (progress > 0) {
      inProgress++;
    } else {
      notStarted++;
    }

    totalProgress += progress;
  }

  return {
    moduleId: module.id,
    moduleName: module.name,
    completed,
    inProgress,
    notStarted,
    averageProgress: students.length > 0 ? totalProgress / students.length : 0
  };
}

async exportProgressReportCSV(classroomId: string, teacherId: string) {
  const report = await this.getProgressReport(classroomId, teacherId);

  // Generar CSV
  const csvLines = [];

  // Header
  csvLines.push(`Reporte de Progreso - ${report.classroomName}`);
  csvLines.push(`Generado: ${new Date(report.generatedAt).toLocaleString()}`);
  csvLines.push('');

  // Resumen
  csvLines.push('RESUMEN GENERAL');
  csvLines.push(`Total de Estudiantes,${report.summary.totalStudents}`);
  csvLines.push(`Total de Módulos,${report.summary.totalModules}`);
  csvLines.push(`Progreso General,${report.summary.overallProgress.toFixed(1)}%`);
  csvLines.push('');

  // Tabla de módulos
  csvLines.push('Módulo,Completados,En Progreso,No Iniciados,% Promedio');
  report.moduleProgress.forEach(module => {
    csvLines.push(
      `${module.moduleName},${module.completed},${module.inProgress},${module.notStarted},${module.averageProgress.toFixed(1)}%`
    );
  });

  return csvLines.join('\n');
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/reports
```

**Componente Principal:**
```typescript
// ProgressReportView.tsx
export const ProgressReportView = () => {
  const { classroomId } = useParams();
  const { reportData, isLoading } = useProgressReport(classroomId);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadProgressReportCSV(classroomId);
    } catch (error) {
      toast.error('Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <ReportSkeleton />;

  return (
    <div className="progress-report-container">
      <ReportHeader
        classroomName={reportData.classroomName}
        generatedAt={reportData.generatedAt}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <SummarySection summary={reportData.summary} />

      <ModuleProgressTable modules={reportData.moduleProgress} />
    </div>
  );
};
```

**Componente de Header:**
```typescript
// ReportHeader.tsx
export const ReportHeader = ({ classroomName, generatedAt, onExport, isExporting }) => {
  return (
    <div className="report-header">
      <div>
        <h1>Reporte de Progreso</h1>
        <h2>{classroomName}</h2>
        <p className="text-sm text-gray-500">
          Generado: {formatDateTime(generatedAt)}
        </p>
      </div>
      <Button
        onClick={onExport}
        disabled={isExporting}
        leftIcon={<DownloadIcon />}
      >
        {isExporting ? 'Exportando...' : 'Exportar a CSV'}
      </Button>
    </div>
  );
};
```

**Componente de Resumen:**
```typescript
// SummarySection.tsx
export const SummarySection = ({ summary }) => {
  return (
    <section className="summary-section">
      <h3>Resumen General</h3>
      <div className="summary-grid">
        <SummaryCard
          label="Total de Estudiantes"
          value={summary.totalStudents}
          icon={<UsersIcon />}
        />
        <SummaryCard
          label="Total de Módulos"
          value={summary.totalModules}
          icon={<ModulesIcon />}
        />
        <SummaryCard
          label="Progreso General"
          value={`${summary.overallProgress.toFixed(1)}%`}
          icon={<ProgressIcon />}
        />
        <SummaryCard
          label="Estudiantes con Todo Completo"
          value={summary.studentsFullyCompleted}
          icon={<CheckIcon />}
          subtitle={`${summary.studentsWithPending} con pendientes`}
        />
      </div>
    </section>
  );
};
```

**Componente de Tabla:**
```typescript
// ModuleProgressTable.tsx
export const ModuleProgressTable = ({ modules }) => {
  return (
    <section className="module-progress-table">
      <h3>Progreso por Módulo</h3>
      <Table>
        <TableHeader>
          <TableColumn>Módulo</TableColumn>
          <TableColumn>Completados</TableColumn>
          <TableColumn>En Progreso</TableColumn>
          <TableColumn>No Iniciados</TableColumn>
          <TableColumn>% Promedio</TableColumn>
          <TableColumn>Progreso</TableColumn>
        </TableHeader>
        <TableBody>
          {modules.map(module => (
            <ModuleProgressRow key={module.moduleId} module={module} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
};

const ModuleProgressRow = ({ module }) => {
  const progressColor = getProgressColor(module.averageProgress);

  return (
    <TableRow>
      <TableCell className="font-medium">{module.moduleName}</TableCell>
      <TableCell>
        <Badge color="green">{module.completed}</Badge>
      </TableCell>
      <TableCell>
        <Badge color="yellow">{module.inProgress}</Badge>
      </TableCell>
      <TableCell>
        <Badge color="gray">{module.notStarted}</Badge>
      </TableCell>
      <TableCell className="font-medium">
        {module.averageProgress.toFixed(1)}%
      </TableCell>
      <TableCell>
        <ProgressBar
          percentage={module.averageProgress}
          color={progressColor}
          size="sm"
        />
      </TableCell>
    </TableRow>
  );
};
```

**Función de Exportación:**
```typescript
// exportUtils.ts
export const downloadProgressReportCSV = async (classroomId: string) => {
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
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    : `reporte-${classroomId}-${Date.now()}.csv`;

  // Descargar archivo
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Reporte de Progreso                      [Exportar a CSV ⬇]     |
|  Matemáticas 6A                                                   |
|  Generado: 2 Nov 2025, 10:00 AM                                  |
+-------------------------------------------------------------------+
|  RESUMEN GENERAL                                                  |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | 👥 25       |  | 📚 8        |  | 📊 65.5%    |  | ✅ 3      | |
|  | Estudiantes |  | Módulos     |  | Progreso    |  | Completos | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
+-------------------------------------------------------------------+
|  PROGRESO POR MÓDULO                                              |
|  +---------------------------------------------------------------+ |
|  | Módulo    | ✅ | 🔄 | ⭕ | % Prom | Progreso              | |
|  +---------------------------------------------------------------+ |
|  | Fracciones  | 18  | 5  | 2  | 85.5%  | [████████░] 85%   | |
|  | Geometría   | 12  | 8  | 5  | 68.2%  | [██████░░░] 68%   | |
|  | Álgebra     | 5   | 12 | 8  | 45.0%  | [████░░░░░] 45%   | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

### Ejemplo de CSV Exportado
```csv
Reporte de Progreso - Matemáticas 6A
Generado: 2 Nov 2025, 10:00 AM

RESUMEN GENERAL
Total de Estudiantes,25
Total de Módulos,8
Progreso General,65.5%

Módulo,Completados,En Progreso,No Iniciados,% Promedio
Fracciones,18,5,2,85.5%
Geometría,12,8,5,68.2%
Álgebra,5,12,8,45.0%
```

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- Reporte simple de progreso por módulo
- Resumen general básico
- Exportación a CSV únicamente
- Vista estática (sin filtros ni configuración)
- Ordenamiento alfabético por módulo

### EXT-005 (Extensión futura - Reportes Avanzados):
- Múltiples formatos de exportación (PDF, Excel, CSV)
- Gráficas visuales en el reporte
- Filtros por fechas, módulos, grupos
- Reportes configurables (elegir métricas)
- Comparativas entre períodos
- Reporte individual por estudiante (PDF)
- Programación de reportes automáticos
- Compartir reporte con otros profesores
- Análisis de tendencias

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Sistema de progreso de estudiantes
- **Backend:** Modelo de Classroom con módulos asignados
- **Frontend:** Utilidades de descarga de archivos

### Dependencias de User Stories:
- US-ANA-001 (Dashboard para navegación)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `calculateModuleProgressStats` cuenta correctamente estudiantes en cada estado
- [ ] `calculateSummary` calcula totales correctos
- [ ] Generación de CSV produce formato válido
- [ ] Filename se genera correctamente

### Pruebas de Integración:
- [ ] Endpoint retorna datos correctos del reporte
- [ ] Endpoint de exportación retorna CSV válido
- [ ] CSV contiene todos los módulos
- [ ] Headers de respuesta son correctos

### Pruebas E2E:
- [ ] Profesor ve reporte completo de la clase
- [ ] Resumen muestra estadísticas correctas
- [ ] Tabla muestra todos los módulos
- [ ] Botón de exportar descarga archivo CSV
- [ ] CSV contiene datos correctos

---

## Notas de Implementación

1. **Performance:**
   - Cachear reporte por 10 minutos
   - Query optimizado con agregaciones
   - CSV se genera on-the-fly (no almacenamiento)

2. **CSV:**
   - Encoding UTF-8 con BOM para Excel
   - Escapar comas en nombres de módulos
   - Formato compatible con Excel y Google Sheets

3. **UX:**
   - Indicador de progreso durante exportación
   - Mensaje de éxito al descargar
   - Skeleton loader durante carga de reporte

4. **Escalabilidad:**
   - Para clases grandes (>100), considerar generación async con email

---

## Estimación de Esfuerzo

**Backend:** 2 SP
- Endpoints de reporte y exportación
- Lógica de agregación
- Generación de CSV

**Frontend:** 3 SP
- Vista de reporte
- Tabla de módulos
- Lógica de descarga

**Testing:** 1 SP

**Total:** 6 SP = $3,000 MXN
