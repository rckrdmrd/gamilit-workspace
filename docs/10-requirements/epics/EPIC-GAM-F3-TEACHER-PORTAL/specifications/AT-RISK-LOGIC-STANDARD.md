# Estándar: Lógica de Detección At-Risk

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | SPEC-AT-RISK-001 |
| **Tipo** | Especificación Técnica |
| **Estado** | Aprobado |
| **Versión** | 1.0.0 |
| **Creado** | 2026-01-20 |
| **Actualizado** | 2026-01-20 |

---

## Propósito

Este documento estandariza la lógica de detección de estudiantes "at-risk" (en riesgo)
para garantizar consistencia entre todas las historias de usuario, endpoints y
componentes del Teacher Portal.

**Resuelve:** INC-4 (Inconsistencia en at-risk logic detectada en auditoría 2026-01-20)

---

## Definición Oficial

### Fórmula de At-Risk

Un estudiante se considera **AT-RISK** si cumple **CUALQUIERA** de las siguientes condiciones:

```
at_risk = (average_grade < 70%) OR (completion_rate < 50%)
```

**Operador:** OR (cualquier condición es suficiente)

---

## Criterios Detallados

### Criterio 1: Bajo Rendimiento Académico

| Campo | Especificación |
|-------|----------------|
| **Métrica** | `average_grade` |
| **Umbral** | < 70% |
| **Cálculo** | Promedio de `average_score` en todos los `module_progress` del estudiante |
| **Periodo** | Todo el tiempo (no hay ventana temporal) |

**Query de Referencia:**
```sql
SELECT user_id, AVG(average_score) as average_grade
FROM progress_tracking.module_progress
WHERE user_id = :student_id
  AND classroom_id = :classroom_id
GROUP BY user_id
HAVING AVG(average_score) < 70;
```

---

### Criterio 2: Baja Tasa de Completación

| Campo | Especificación |
|-------|----------------|
| **Métrica** | `completion_rate` |
| **Umbral** | < 50% |
| **Cálculo** | (módulos completados / módulos totales asignados) * 100 |
| **Periodo** | Todo el tiempo |

**Query de Referencia:**
```sql
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) as total,
  (COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*)::float) * 100 as completion_rate
FROM progress_tracking.module_progress
WHERE user_id = :student_id
  AND classroom_id = :classroom_id
GROUP BY user_id
HAVING (COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*)::float) * 100 < 50;
```

---

## Implementación por Historia de Usuario

### US-PM-004a: Progress Analytics (Individual Student)

**Campo en Response:** `at_risk: boolean`

**Implementación:**
```typescript
// student-progress.service.ts
const atRisk =
  (studentProgress.average_grade < 70) ||
  (studentProgress.completion_rate < 50);

return {
  ...studentData,
  at_risk: atRisk,
  at_risk_reasons: this.getAtRiskReasons(studentProgress)
};
```

**At-Risk Reasons Array:**
```typescript
function getAtRiskReasons(progress: StudentProgress): string[] {
  const reasons: string[] = [];

  if (progress.average_grade < 70) {
    reasons.push(`Low average grade: ${progress.average_grade.toFixed(1)}% (threshold: 70%)`);
  }

  if (progress.completion_rate < 50) {
    reasons.push(`Low completion rate: ${progress.completion_rate.toFixed(1)}% (threshold: 50%)`);
  }

  return reasons;
}
```

---

### US-PM-005a: Classroom Analytics (Aggregated)

**Campo en Response:** `at_risk_students: StudentSummary[]`

**Implementación:**
```typescript
// classroom-analytics.service.ts
const atRiskStudents = classroomStudents.filter(student =>
  student.average_grade < 70 || student.completion_rate < 50
);

return {
  ...classroomData,
  at_risk_students: atRiskStudents.map(s => ({
    id: s.id,
    name: s.full_name,
    average_grade: s.average_grade,
    completion_rate: s.completion_rate,
    reasons: this.getAtRiskReasons(s)
  }))
};
```

---

### Intervention Alerts (Generación Automática)

**Función:** `generate_student_alerts()`

**Implementación en SQL:**
```sql
-- Generar alerta LOW_SCORE
INSERT INTO progress_tracking.student_intervention_alerts
  (student_id, classroom_id, alert_type, severity, title, description)
SELECT
  mp.user_id,
  mp.classroom_id,
  'LOW_SCORE',
  CASE
    WHEN AVG(mp.average_score) < 50 THEN 'CRITICAL'
    WHEN AVG(mp.average_score) < 60 THEN 'HIGH'
    ELSE 'MEDIUM'
  END,
  'Bajo rendimiento académico',
  'El estudiante tiene un promedio de ' || ROUND(AVG(mp.average_score), 1) || '%'
FROM progress_tracking.module_progress mp
WHERE mp.classroom_id IS NOT NULL
GROUP BY mp.user_id, mp.classroom_id
HAVING AVG(mp.average_score) < 70
ON CONFLICT DO NOTHING;
```

---

## Response Structure Estándar

### Para Endpoint Individual (Student)

```json
{
  "student_id": "uuid",
  "at_risk": true,
  "at_risk_reasons": [
    "Low average grade: 65.3% (threshold: 70%)"
  ],
  "metrics": {
    "average_grade": 65.3,
    "completion_rate": 72.0
  }
}
```

### Para Endpoint Agregado (Classroom)

```json
{
  "classroom_id": "uuid",
  "at_risk_count": 3,
  "at_risk_students": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "average_grade": 58.2,
      "completion_rate": 45.0,
      "reasons": [
        "Low average grade: 58.2% (threshold: 70%)",
        "Low completion rate: 45.0% (threshold: 50%)"
      ]
    }
  ]
}
```

---

## Umbrales Configurables

Por defecto, los umbrales son:
- `average_grade` < **70%**
- `completion_rate` < **50%**

Estos umbrales PUEDEN ser configurados por classroom mediante US-PM-007 (Alert Configuration).

Si un maestro configura umbrales personalizados:
```typescript
const config = await alertConfigService.getConfig(classroomId);
const gradeThreshold = config.low_score_threshold ?? 70;
const completionThreshold = config.low_completion_threshold ?? 50;

const atRisk =
  (student.average_grade < gradeThreshold) ||
  (student.completion_rate < completionThreshold);
```

---

## Frontend Display

### Badge de At-Risk

```tsx
// AtRiskBadge.tsx
interface AtRiskBadgeProps {
  atRisk: boolean;
  reasons?: string[];
}

function AtRiskBadge({ atRisk, reasons }: AtRiskBadgeProps) {
  if (!atRisk) return null;

  return (
    <Tooltip content={reasons?.join('\n') || 'En riesgo'}>
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        En Riesgo
      </Badge>
    </Tooltip>
  );
}
```

### Colores Estándar

| Estado | Color | Hex |
|--------|-------|-----|
| At-Risk | Rojo | #EF4444 |
| Warning (cerca del umbral) | Amarillo | #F59E0B |
| Safe | Verde | #10B981 |

---

## Testing

### Unit Tests Requeridos

```typescript
describe('AtRisk Detection', () => {
  it('should flag student with low grade as at-risk', () => {
    const student = { average_grade: 65, completion_rate: 80 };
    expect(isAtRisk(student)).toBe(true);
  });

  it('should flag student with low completion as at-risk', () => {
    const student = { average_grade: 85, completion_rate: 40 };
    expect(isAtRisk(student)).toBe(true);
  });

  it('should flag student with both issues as at-risk', () => {
    const student = { average_grade: 55, completion_rate: 30 };
    expect(isAtRisk(student)).toBe(true);
  });

  it('should NOT flag student above both thresholds', () => {
    const student = { average_grade: 75, completion_rate: 60 };
    expect(isAtRisk(student)).toBe(false);
  });

  it('should NOT flag student at exactly threshold', () => {
    const student = { average_grade: 70, completion_rate: 50 };
    expect(isAtRisk(student)).toBe(false); // >= threshold is safe
  });
});
```

---

## Migración

Si existen implementaciones anteriores con lógica diferente, deben actualizarse a esta especificación.

**Archivos a Verificar:**
- `student-progress.service.ts`
- `classroom-analytics.service.ts`
- `intervention-alerts.service.ts`
- `generate_student_alerts.sql`
- `StudentProgressList.tsx`
- `AtRiskAlert.tsx`

---

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-01-20 | Documento inicial - Estandarización de lógica at-risk |

---

**Documento creado:** 2026-01-20
**Aprobado por:** Arquitecto de Soluciones
