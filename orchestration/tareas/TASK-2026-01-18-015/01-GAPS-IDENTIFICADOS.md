# TASK-2026-01-18-015: Gaps Identificados - Teacher/Reports

**Fecha:** 2026-01-18
**Severidad:** CRÍTICOS: 3 | MEDIOS: 6 | MENORES: 5

---

## 1. GAPS CRÍTICOS (P0 - Bloquean funcionalidad core)

### G1: MasteryTracking No Conectado a Reportes

**Descripción:**
La entidad `MasteryTracking` existe en el sistema pero no se utiliza en el servicio de analytics ni en la generación de reportes.

**Ubicación:**
- Entidad: `apps/backend/src/modules/progress/entities/mastery-tracking.entity.ts`
- Faltante en: `apps/backend/src/modules/teacher/services/analytics.service.ts`

**Impacto:**
- Reportes no muestran progreso por habilidad específica
- No se pueden identificar patrones de aprendizaje granulares
- "Fortalezas" y "Debilidades" son estimaciones, no datos reales

**Solución Propuesta:**
```typescript
// En AnalyticsService.getStudentInsights()
const masteryData = await this.masteryTrackingRepo.find({
  where: { user_id: studentId }
});

// Usar para calcular strengths/weaknesses reales
```

**Esfuerzo Estimado:** 8h

---

### G2: SkillAssessment Aislado

**Descripción:**
Los datos de evaluación de competencias (`SkillAssessment`) no se integran en el flujo de reportes.

**Ubicación:**
- Entidad: `apps/backend/src/modules/progress/entities/skill-assessment.entity.ts`
- Faltante en: `analytics.service.ts`, `reports.service.ts`

**Impacto:**
- No hay datos de competencias (literal, inferencial, crítico, digital, textual)
- El "radar chart" de 5 competencias en la documentación no puede implementarse
- Analytics avanzado (US-REP-001) bloqueado

**Solución Propuesta:**
1. Agregar método `getSkillAssessments(studentId)` en AnalyticsService
2. Incluir en StudentInsightsResponseDto un campo `competencies`

**Esfuerzo Estimado:** 12h

---

### G3: No Rollback en Transacciones de Coins

**Descripción:**
`MLCoinsService.addCoins()` crea transacciones sin manejo de rollback si pasos posteriores fallan.

**Ubicación:**
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts`

**Impacto:**
- Posible inconsistencia entre balance y transacciones
- Usuarios podrían ganar coins sin completar flujo
- Datos de economía para reportes podrían ser incorrectos

**Solución Propuesta:**
```typescript
// Usar TypeORM transaction
await this.dataSource.transaction(async manager => {
  const transaction = await manager.save(MLCoinsTransaction, txData);
  await manager.update(UserStats, userId, { ml_coins: newBalance });
  // Si falla, rollback automático
});
```

**Esfuerzo Estimado:** 6h

---

## 2. GAPS MEDIOS (P1 - Afectan calidad de datos)

### G4: Filtrado Temporal No Funcional

**Descripción:**
Los parámetros `start_date` y `end_date` se aceptan en el DTO pero NO se usan en `gatherReportData()`.

**Ubicación:**
- `apps/backend/src/modules/teacher/services/reports.service.ts:gatherReportData()`

**Código Actual:**
```typescript
// start_date y end_date están en el DTO pero no se pasan a las queries
async gatherReportData(dto: GenerateReportDto, userId: string) {
  // No hay filtro por fecha en las consultas
}
```

**Impacto:**
- Reportes "mensuales" o "semanales" incluyen TODOS los datos
- Usuarios reciben datos incorrectos
- Comparativas temporales imposibles

**Solución Propuesta:**
```typescript
// Agregar filtro a consultas de submissions
const submissions = await this.submissionRepo.find({
  where: {
    user_id: studentId,
    submitted_at: Between(dto.start_date, dto.end_date)
  }
});
```

**Esfuerzo Estimado:** 4h

---

### G5: EngagementMetrics Sin Frecuencia Clara

**Descripción:**
No se encontró job batch que actualice `engagement_metrics`. Datos posiblemente estáticos.

**Ubicación:**
- Tabla: `progress_tracking.engagement_metrics`
- Servicio: No encontrado (gap)

**Impacto:**
- Métricas de engagement desactualizadas
- Trends mostrados son estimaciones
- Dashboard de analytics con datos viejos

**Solución Propuesta:**
1. Crear `EngagementMetricsService` con método `calculateDailyMetrics()`
2. Agregar cron job diario (23:59) para calcular métricas

**Esfuerzo Estimado:** 8h

---

### G6: UserAchievement Rewards Async

**Descripción:**
El claiming de rewards para achievements puede ser asíncrono, dejando estados intermedios.

**Ubicación:**
- Entidad: `gamification_system.user_achievements`
- Campo: `rewards_claimed`

**Impacto:**
- Achievement marcado como completado pero sin rewards
- Inconsistencia en reportes de gamificación
- Usuarios confundidos

**Solución Propuesta:**
- Implementar auto-claim inmediato al completar achievement
- O agregar job de reconciliación para claims pendientes

**Esfuerzo Estimado:** 4h

---

### G7: TeacherReportsService Visibilidad

**Descripción:**
El servicio existe pero su estructura completa no es visible en el análisis estándar.

**Ubicación:**
- `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

**Impacto:**
- Confusión sobre dónde se persiste metadata
- Documentación incompleta

**Solución Propuesta:**
- Documentar completamente en ARCHITECTURE.md

**Esfuerzo Estimado:** 2h

---

### G8: No Reportes Real-Time

**Descripción:**
Los reportes son snapshots estáticos al momento de generación.

**Ubicación:**
- `reports.service.ts` genera archivo y guarda

**Impacto:**
- Datos desactualizados si se ve reporte días después
- No hay "dashboard live"

**Solución Propuesta:**
- Para MVP: Mostrar advertencia "Datos de: fecha"
- Para V2: Implementar regeneración lazy

**Esfuerzo Estimado:** MVP: 1h, V2: 16h

---

### G9: Scheduled Reports No Implementado

**Descripción:**
`ReportConfig.schedule` existe en types pero no hay UI ni backend.

**Ubicación:**
- Types: `apps/frontend/src/apps/teacher/types/index.ts`
- UI: No existe
- Backend: No existe

**Impacto:**
- Feature documentada pero no entregada
- Expectativas de usuario no cumplidas

**Solución Propuesta:**
1. Crear tabla `report_schedules`
2. Implementar `ReportSchedulerService` con cron
3. Agregar UI de configuración

**Esfuerzo Estimado:** 24h (feature completa)

---

## 3. GAPS MENORES (P2 - UX/Polish)

### G10: No Automatic Session Cleanup

**Descripción:**
Si browser crashea, `learning_sessions` quedan con status "ongoing" indefinidamente.

**Ubicación:**
- Tabla: `progress_tracking.learning_sessions`
- Campo: `completion_status`

**Impacto:**
- Datos de sesión incorrectos
- Time-on-task inflado

**Solución Propuesta:**
- Cron job que marque sesiones > 4h como "timed_out"

**Esfuerzo Estimado:** 2h

---

### G11: CSV Support Incomplete

**Descripción:**
UI ofrece CSV pero el manejo de respuesta backend puede diferir.

**Ubicación:**
- `ReportGenerator.tsx` ofrece CSV
- Backend genera pero handling de blob puede fallar

**Impacto:**
- Posibles errores en descarga CSV

**Solución Propuesta:**
- Verificar y armonizar content-type handling

**Esfuerzo Estimado:** 2h

---

### G12: File Size Not Shown

**Descripción:**
UI muestra "N/A" para tamaño de archivo en lista de reportes.

**Ubicación:**
- `TeacherReportsPage.tsx` lista de reportes

**Impacto:**
- UI incompleta

**Solución Propuesta:**
- Asegurar que `file_size_bytes` se persiste y retorna en API

**Esfuerzo Estimado:** 1h

---

### G13: No Report Deletion UI

**Descripción:**
Backend soporta `DELETE /reports/:id` pero no hay botón en UI.

**Ubicación:**
- Backend: Soportado
- Frontend: Falta botón

**Impacto:**
- Usuarios no pueden limpiar reportes antiguos

**Solución Propuesta:**
- Agregar botón de eliminar con confirmación

**Esfuerzo Estimado:** 2h

---

### G14: No Report Sharing

**Descripción:**
No existe mecanismo para compartir reportes con padres o administradores.

**Ubicación:**
- Feature no implementada

**Impacto:**
- US-PP-004 (Parent Reports) bloqueado
- Comunicación limitada

**Solución Propuesta:**
1. Tabla `report_sharing` con permisos
2. Endpoint POST `/reports/:id/share`
3. Notificación al destinatario

**Esfuerzo Estimado:** 16h (feature completa)

---

## 4. INCONSISTENCIAS DE DATOS

### I1: XP/Coins en Múltiples Lugares

**Ubicaciones:**
- `exercise_submissions.xp_earned, ml_coins_earned`
- `exercise_attempts.xp_earned, ml_coins_earned`
- `user_stats.total_xp, ml_coins`
- `module_progress.total_xp_earned, total_ml_coins_earned`

**Riesgo:** Divergencia entre fuentes

**Solución:**
- Designar `exercise_submissions` como source of truth
- Agregar trigger para sincronizar a `user_stats`
- Eliminar duplicación en `module_progress` (calcular on-read)

---

### I2: Module Progress No Actualiza en Manual Review

**Descripción:**
Cuando `exercise_submissions.status` cambia a 'graded' o 'reviewed', no hay trigger que actualice `module_progress.graded_exercises`.

**Solución:**
```sql
CREATE OR REPLACE FUNCTION update_module_progress_on_grade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('graded', 'reviewed') AND OLD.status NOT IN ('graded', 'reviewed') THEN
    UPDATE progress_tracking.module_progress
    SET graded_exercises = graded_exercises + 1,
        graded_progress_percentage = (graded_exercises + 1)::FLOAT / NULLIF(total_exercises, 0) * 100
    WHERE user_id = NEW.user_id AND module_id = (
      SELECT module_id FROM educational_content.exercises WHERE id = NEW.exercise_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### I3: Submission Status Enum Mismatch

**DDL:** 5 estados - `draft, submitted, graded, reviewed, pending_review`
**Entity:** 4 estados - ¿falta `pending_review`?

**Solución:**
- Verificar entity y sincronizar con DDL

---

## 5. MATRIZ DE PRIORIZACIÓN

| Gap | Severidad | Esfuerzo | Prioridad | Sprint |
|-----|-----------|----------|-----------|--------|
| G4 | MEDIO | 4h | P0 | Sprint Actual |
| G1 | CRÍTICO | 8h | P0 | Sprint Actual |
| G2 | CRÍTICO | 12h | P1 | Sprint Siguiente |
| G3 | CRÍTICO | 6h | P1 | Sprint Siguiente |
| G5 | MEDIO | 8h | P1 | Sprint Siguiente |
| I2 | MEDIO | 2h | P1 | Sprint Siguiente |
| G6 | MEDIO | 4h | P2 | Backlog |
| G9 | MEDIO | 24h | P2 | Backlog |
| G10 | MENOR | 2h | P2 | Backlog |
| G12 | MENOR | 1h | P3 | Polish |
| G13 | MENOR | 2h | P3 | Polish |
| G14 | MEDIO | 16h | P3 | Fase 3 |

---

## 6. RESUMEN

**Total Gaps:** 14
**Esfuerzo Total Estimado:** ~108 horas

**Distribución por Prioridad:**
- P0 (Sprint Actual): 12h
- P1 (Sprint Siguiente): 28h
- P2 (Backlog): 30h
- P3 (Polish/Fase 3): 21h

**Recomendación:**
Abordar G4 (filtrado temporal) inmediatamente ya que es un bug crítico que afecta la funcionalidad core de reportes.

---

*Documento generado: 2026-01-18*
*Próximo paso: Plan de Implementación*
